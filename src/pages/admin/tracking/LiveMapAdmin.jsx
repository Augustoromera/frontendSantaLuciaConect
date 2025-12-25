import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { db } from '../../../firebase/config';
import { doc, onSnapshot } from 'firebase/firestore';
import { Container, Card, Badge } from 'react-bootstrap';
import L from 'leaflet';
import Header from '../../../components/Header';



// Fix default icon issue in Leaflet with Webpack/Vite
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom Bus Icon (using FontAwesome class as DivIcon or just a colored marker for now)
// Para simplificar usaremos el marcador default pero podríamos usar un icono de bus personalizado.

const LiveMapAdmin = () => {
    const [busLocation, setBusLocation] = useState(null);
    const [lastUpdate, setLastUpdate] = useState(null);

    // Coordenadas iniciales (Santa Lucía aprox)
    const center = [-27.0945, -65.5396];

    useEffect(() => {
        // Escuchar cambios en la unidad 1
        const unitId = 'unidad_admin_1';
        const unsub = onSnapshot(doc(db, 'live_tracking', unitId), (doc) => {
            if (doc.exists()) {
                const data = doc.data();
                setBusLocation({ lat: data.lat, lng: data.lng });

                if (data.lastUpdate) {
                    setLastUpdate(new Date(data.lastUpdate.seconds * 1000).toLocaleTimeString());
                }
            }
        });

        return () => unsub();
    }, []);

    // Componente auxiliar para recentrar mapa suavemente (opcional)
    const Recenter = ({ lat, lng }) => {
        const map = useMap();
        useEffect(() => {
            if (lat && lng) {
                map.flyTo([lat, lng], map.getZoom());
            }
        }, [lat, lng]);
        return null;
    };

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

                    {busLocation && Number.isFinite(busLocation.lat) && Number.isFinite(busLocation.lng) && (
                        <>
                            <Marker position={[busLocation.lat, busLocation.lng]}>
                                <Popup>
                                    <strong>Unidad 01</strong><br />
                                    Última act: {lastUpdate}<br />
                                    Estado: En Viaje
                                </Popup>
                            </Marker>
                            <Recenter lat={busLocation.lat} lng={busLocation.lng} />
                        </>
                    )}
                </MapContainer>

                {/* Overlay Info Card */}
                <Card
                    className="shadow"
                    style={{
                        position: 'absolute',
                        top: '20px',
                        right: '20px',
                        zIndex: 1000,
                        maxWidth: '250px',
                        background: 'rgba(255, 255, 255, 0.9)'
                    }}
                >
                    <Card.Body className="p-3">
                        <h6 className="mb-2">🚍 Panel de Control</h6>
                        {busLocation ? (
                            <div>
                                <Badge bg="success" className="me-2">Conectado</Badge>
                                <small className="d-block mt-1 text-muted">Ult. act: {lastUpdate}</small>
                                <small className="d-block text-muted">
                                    {busLocation.lat?.toFixed(4) || '...'}, {busLocation.lng?.toFixed(4) || '...'}
                                </small>
                            </div>
                        ) : (
                            <Badge bg="secondary">Esperando señal...</Badge>
                        )}
                    </Card.Body>
                </Card>
            </div>
        </div>
    );
};

export default LiveMapAdmin;
