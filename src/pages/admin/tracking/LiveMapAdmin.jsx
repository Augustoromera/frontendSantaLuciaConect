import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { db } from '../../../firebase/config';
import { collection, onSnapshot } from 'firebase/firestore';
import { Container, Card, Badge, ListGroup } from 'react-bootstrap';
import L from 'leaflet';
import Header from '../../../components/Header';



// Fix default icon issue in Leaflet with Webpack/Vite
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
// Custom Bus Icon
const busIcon = L.divIcon({
    html: `
    <div style="
        background-color: #004aad;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 3px solid white;
        box-shadow: 0 4px 8px rgba(0,0,0,0.4);
    ">
        <i class="fas fa-bus" style="color: white; font-size: 20px;"></i>
    </div>`,
    className: '', // Remove default class styling if possible or let it be generic
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20]
});

const LiveMapAdmin = () => {
    const [busLocations, setBusLocations] = useState([]);

    // Coordenadas iniciales (Santa Lucía aprox)
    const center = [-27.0945, -65.5396];

    useEffect(() => {
        // Escuchar cambios en la coleccion completa
        const unsub = onSnapshot(collection(db, 'live_tracking'), (snapshot) => {
            const buses = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    lastUpdateString: data.lastUpdate ? new Date(data.lastUpdate.seconds * 1000).toLocaleTimeString() : '...'
                };
            }).filter(bus =>
                // Solo mostrar si tiene coordenadas válidas y no está fuera de servicio
                Number.isFinite(bus.lat) && Number.isFinite(bus.lng) && bus.status !== 'fuera_servicio'
            );

            setBusLocations(buses);
        });

        return () => unsub();
    }, []);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', paddingTop: '70px' }}>
            <Header />
            <div style={{ flex: 1, position: 'relative' }}>
                <MapContainer
                    center={center}
                    zoom={13}
                    style={{ height: '100%', width: '100%' }}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {busLocations.map(bus => (
                        <Marker key={bus.id} position={[bus.lat, bus.lng]} icon={busIcon}>
                            <Popup>
                                <strong>Unidad {bus.unitNumber || 'Desconocida'}</strong><br />
                                Última act: {bus.lastUpdateString}<br />
                                Velocidad: {bus.speed ? (bus.speed * 3.6).toFixed(1) : 0} km/h<br />
                                Estado: En Viaje
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>

                {/* Overlay Info Card */}
                <Card
                    className="shadow"
                    style={{
                        position: 'absolute',
                        top: '20px',
                        right: '20px',
                        zIndex: 1000,
                        width: '280px',
                        background: 'rgba(255, 255, 255, 0.95)'
                    }}
                >
                    <Card.Body className="p-3">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                            <h6 className="m-0">🚍 Flota Activa</h6>
                            <Badge bg="primary">{busLocations.length}</Badge>
                        </div>

                        {busLocations.length > 0 ? (
                            <ListGroup variant="flush" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                {busLocations.map(bus => (
                                    <ListGroup.Item key={bus.id} className="p-2 small bg-transparent">
                                        <div className="d-flex justify-content-between">
                                            <span><strong>Unidad {bus.unitNumber}</strong></span>
                                            <span className="text-success">● En Viaje</span>
                                        </div>
                                        <div className="text-muted d-flex justify-content-between">
                                            <span>{(bus.speed * 3.6).toFixed(1)} km/h</span>
                                            <span>{bus.lastUpdateString}</span>
                                        </div>
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                        ) : (
                            <div className="text-center text-muted py-3">
                                <small>No hay unidades en recorrido.</small>
                            </div>
                        )}
                    </Card.Body>
                </Card>
            </div>
        </div>
    );
};

export default LiveMapAdmin;
