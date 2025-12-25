import React, { useState, useEffect, useRef } from 'react';
import { db } from '../../../firebase/config';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Button, Container, Card, Alert } from 'react-bootstrap';
import { useAuth } from '../../../context/AuthContext';
import Header from '../../../components/Header';
import { Footer } from '../../../components/Footer';

const DriverTracker = () => {
    const { user } = useAuth();
    const [isTracking, setIsTracking] = useState(false);
    const [location, setLocation] = useState(null);
    const [error, setError] = useState('');
    const [statusMessage, setStatusMessage] = useState('Esperando iniciar...');

    // Referencia para el ID del watchPosition para poder limpiarlo
    const watchIdRef = useRef(null);

    // Efecto para manejar el tracking
    useEffect(() => {
        // Limpieza al desmontar
        return () => {
            stopTracking();
        };
    }, []);

    const startTracking = () => {
        if (!navigator.geolocation) {
            setError('Tu navegador no soporta geolocalización.');
            return;
        }

        setIsTracking(true);
        setStatusMessage('Iniciando GPS...');
        setError('');

        // Opciones de geolocalización para alta precisión (GPS)
        const options = {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        };

        watchIdRef.current = navigator.geolocation.watchPosition(
            handlePositionSuccess,
            handlePositionError,
            options
        );
    };

    const stopTracking = () => {
        if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
        }
        setIsTracking(false);
        setStatusMessage('Tracking detenido.');

        // Opcional: Marcar como fuera de servicio en BD
        updateLocationInDB(null, 'fuera_servicio');
    };

    const handlePositionSuccess = (position) => {
        const { latitude, longitude, speed, heading } = position.coords;

        const newLocation = {
            lat: latitude,
            lng: longitude,
            speed: speed, // Velocidad en m/s
            heading: heading // Dirección en grados
        };

        setLocation(newLocation);
        setStatusMessage(`Enviando ubicación... (${latitude.toFixed(5)}, ${longitude.toFixed(5)})`);

        // Enviar a Firebase
        updateLocationInDB(newLocation, 'en_viaje');
    };

    const handlePositionError = (err) => {
        console.error("Error GPS:", err);
        setError(`Error obteniendo GPS: ${err.message}`);
        // No detenemos el tracking automáticamente por un error temporal, pero avisamos.
    };

    const updateLocationInDB = async (loc, status) => {
        if (!user) return;

        // Usamos un ID fijo para fines de prueba (o el ID del usuario)
        // En producción idealmente cada colectivo tendría su ID único. 
        // Por ahora "unidad_admin" para que tú lo pruebes.
        const unitId = 'unidad_admin_1';

        try {
            const data = {
                lastUpdate: serverTimestamp(),
                status: status,
                driverId: user.uid,
                driverEmail: user.email,
                ...loc // lat, lng, speed, heading
            };

            await setDoc(doc(db, 'live_tracking', unitId), data, { merge: true });
        } catch (e) {
            console.error("Error writing to Firestore:", e);
            setError("Error de conexión con la base de datos.");
        }
    };

    return (
        <>
            <Header />
            <Container className="mt-5 pt-5 pb-5 d-flex justify-content-center" style={{ minHeight: '80vh' }}>
                <Card style={{ width: '100%', maxWidth: '400px', height: 'fit-content' }} className="shadow-lg">
                    <Card.Header className="bg-primary text-white text-center">
                        <h4>📡 Emisor GPS Chofer</h4>
                        <p className="mb-0 small">Modo: Stealth Admin</p>
                    </Card.Header>
                    <Card.Body className="text-center">

                        {error && <Alert variant="danger">{error}</Alert>}

                        <div className="mb-4">
                            <div
                                style={{
                                    width: '120px',
                                    height: '120px',
                                    borderRadius: '50%',
                                    background: isTracking ? '#28a745' : '#6c757d',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto',
                                    transition: 'all 0.3s ease',
                                    boxShadow: isTracking ? '0 0 20px rgba(40, 167, 69, 0.5)' : 'none'
                                }}
                            >
                                <i className={`fas fa-${isTracking ? 'satellite-dish' : 'bus'} fa-3x text-white`}></i>
                            </div>
                            <h5 className="mt-3 text-muted">{statusMessage}</h5>
                        </div>

                        {location && isTracking && (
                            <div className="mb-3 text-start bg-light p-2 rounded small">
                                <div><strong>Lat:</strong> {location.lat.toFixed(6)}</div>
                                <div><strong>Lng:</strong> {location.lng.toFixed(6)}</div>
                                <div><strong>Vel:</strong> {location.speed ? (location.speed * 3.6).toFixed(1) + ' km/h' : '0 km/h'}</div>
                            </div>
                        )}

                        {!isTracking ? (
                            <Button variant="success" size="lg" className="w-100" onClick={startTracking}>
                                <i className="fas fa-play me-2"></i> INICIAR RECORRIDO
                            </Button>
                        ) : (
                            <Button variant="danger" size="lg" className="w-100" onClick={stopTracking}>
                                <i className="fas fa-stop me-2"></i> DETENER
                            </Button>
                        )}
                    </Card.Body>
                    <Card.Footer className="text-muted text-center small">
                        Mantén esta pantalla activa para enviar datos.
                    </Card.Footer>
                </Card>
            </Container>
            <Footer />
        </>
    );
};

export default DriverTracker;
