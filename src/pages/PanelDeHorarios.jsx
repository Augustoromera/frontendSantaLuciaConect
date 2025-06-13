import React, { useState } from 'react';
import './styles/panel-horarios.css';
import { Container, Row, Col, Form, Button, Table } from 'react-bootstrap';
import Header from '../components/Header';
import { Footer } from '../components/Footer';

export const PanelDeHorarios = () => {
    // Datos hardcodeados basados en el PDF
    const rutas = {
    ida: {
        id: "ida",
        nombre: "Santa Lucía → Monteros",
        paradas: ["Santa Lucía", "Zavalia", "La Cortada", "La Ciénega", "KM3", "Alto Verde", "Acheral", "Cervecería", "Sto. Domingo", "Citromax", "Monteros"],
        dias: {
            habil: [
                ["7:00", "7:07", "7:09", "7:11", "7:13", "7:14", "7:15", "7:18", "7:20", "7:22", "7:30"],
                ["7:30", "7:37", "7:39", "7:41", "7:43", "7:44", "7:45", "7:48", "7:50", "7:52", "8:00"],
                ["8:00", "8:07", "8:09", "8:11", "8:13", "8:14", "8:15", "8:18", "8:20", "8:22", "8:30"],
                ["8:30", "8:37", "8:39", "8:41", "8:43", "8:44", "8:45", "8:48", "8:50", "8:52", "9:00"],
                ["9:30", "9:37", "9:39", "9:41", "9:43", "9:44", "9:45", "9:48", "9:50", "9:52", "10:00"],
                ["10:30", "10:37", "10:39", "10:41", "10:43", "10:44", "10:45", "10:48", "10:50", "10:52", "11:00"],
                ["11:30", "11:37", "11:39", "11:41", "11:43", "11:44", "11:45", "11:48", "11:50", "11:52", "12:00"],
                ["12:30", "12:37", "12:39", "12:41", "12:43", "12:44", "12:45", "12:48", "12:50", "12:52", "13:00"],
                ["12:45", "12:52", "12:54", "12:56", "12:58", "12:59", "13:00", "13:03", "13:05", "13:07", "13:15"],
                ["13:00", "13:07", "13:09", "13:11", "13:13", "13:14", "13:15", "13:18", "13:20", "13:22", "13:30"],
                ["13:30", "13:37", "13:39", "13:41", "13:43", "13:44", "13:45", "13:48", "13:50", "13:52", "14:00"],
                ["14:30", "14:37", "14:39", "14:41", "14:43", "14:44", "14:45", "14:48", "14:50", "14:52", "15:00"],
                ["15:30", "15:37", "15:39", "15:41", "15:43", "15:44", "15:45", "15:48", "15:50", "15:52", "16:00"],
                ["16:30", "16:37", "16:39", "16:41", "16:43", "16:44", "16:45", "16:48", "16:50", "16:52", "17:00"],
                ["17:30", "17:37", "17:39", "17:41", "17:43", "17:44", "17:45", "17:48", "17:50", "17:42", "18:00"],
                ["18:30", "18:37", "18:39", "18:41", "18:43", "18:44", "18:45", "18:48", "18:50", "18:52", "19:00"],
                ["19:30", "19:37", "19:39", "19:41", "19:43", "19:44", "19:45", "19:48", "19:50", "19:52", "20:00"],
                ["20:30", "20:37", "20:39", "20:41", "20:43", "20:44", "20:45", "20:48", "20:50", "20:52", "21:00"],
                ["21:30", "21:37", "21:39", "21:41", "21:43", "21:44", "21:45", "21:48", "21:50", "21:52", "22:00"],
                ["22:30", "22:33", "22:36", "22:38", "22:40", "22:42", "22:43", "22:45", "22:48", "22:50", "23:00"]
            ],
            sabado: [
                ["8:00", "8:07", "8:09", "8:11", "8:13", "8:14", "8:15", "8:18", "8:20", "8:22", "8:30"],
                ["9:30", "9:37", "9:39", "9:41", "9:43", "9:44", "9:45", "9:48", "9:50", "9:52", "10:00"],
                ["11:30", "11:37", "11:39", "11:41", "11:43", "11:44", "11:45", "11:48", "11:50", "11:52", "12:00"],
                ["12:30", "12:37", "12:39", "12:41", "12:43", "12:44", "12:45", "12:48", "12:50", "12:52", "13:00"],
                ["17:00", "17:07", "17:09", "17:11", "17:13", "17:14", "17:15", "17:18", "17:20", "17:22", "17:30"],
                ["19:00", "19:07", "19:09", "19:11", "19:13", "19:14", "19:15", "19:18", "19:20", "19:22", "19:30"],
                ["21:00", "21:07", "21:09", "21:11", "21:13", "21:18", "21:15", "21:18", "21:20", "21:22", "21:30"]
            ],
            domingo: [
                ["10:00", "10:07", "10:09", "10:11", "10:13", "10:14", "10:15", "10:18", "10:20", "10:22", "10:30"],
                ["12:30", "12:37", "12:39", "12:41", "12:43", "12:44", "12:45", "12:48", "12:50", "12:52", "13:00"],
                ["20:30", "20:24", "20:39", "20:41", "20:43", "20:44", "20:45", "20:48", "20:50", "20:52", "21:00"]
            ]
        }
    },
    vuelta: {
        id: "vuelta",
        nombre: "Monteros → Santa Lucía",
        paradas: ["Monteros", "Sto. Domingo", "Cervecería", "Acheral", "Alto Verde", "KM3", "La Ciénega", "La Cortada", "Zavalia", "Santa Lucía"],
        dias: {
            habil: [
                ["6:30", "6:34", "6:38", "6:45", "6:50", "6:53", "6:55", "6:57", "6:58", "7:00"],
                ["7:00", "7:04", "7:06", "7:15", "7:20", "7:23", "7:25", "7:27", "7:28", "7:30"],
                ["7:30", "7:34", "7:36", "7:45", "7:50", "7:53", "7:55", "7:57", "7:58", "8:00"],
                ["8:00", "8:04", "8:06", "8:15", "8:20", "8:23", "8:25", "8:27", "8:28", "8:30"],
                ["9:00", "9:04", "9:06", "9:15", "9:20", "9:23", "9:25", "9:27", "9:28", "9:30"],
                ["10:00", "10:04", "10:06", "10:15", "10:20", "10:23", "10:25", "10:27", "10:28", "10:30"],
                ["11:00", "11:04", "11:06", "11:15", "11:20", "11:23", "11:25", "11:27", "11:28", "11:30"],
                ["12:00", "12:04", "12:06", "12:15", "12:20", "12:23", "12:25", "12:27", "12:28", "12:30"],
                ["12:15", "12:19", "12:21", "12:30", "12:35", "12:38", "12:41", "12:43", "12:44", "12:45"],
                ["12:30", "12:34", "12:36", "12:45", "12:50", "12:53", "12:55", "12:57", "12:58", "13:00"],
                ["13:00", "13:04", "13:06", "13:15", "13:20", "13:23", "13:25", "13:27", "13:28", "13:30"],
                ["14:00", "14:04", "14:06", "14:15", "14:20", "14:23", "14:25", "14:27", "14:28", "14:30"],
                ["15:00", "15:04", "15:06", "15:15", "15:20", "15:23", "15:25", "15:27", "15:28", "15:30"],
                ["16:00", "16:04", "16:06", "16:15", "16:20", "16:23", "16:25", "16:27", "16:28", "16:30"],
                ["17:00", "17:04", "17:06", "17:15", "17:20", "17:23", "17:25", "17:27", "17:28", "17:30"],
                ["18:00", "18:04", "18:06", "18:15", "18:20", "18:23", "18:25", "18:27", "18:28", "18:30"],
                ["19:00", "19:04", "19:06", "19:15", "19:20", "19:23", "19:25", "19:27", "19:28", "19:30"],
                ["20:00", "20:04", "20:06", "20:15", "20:20", "20:23", "20:25", "20:27", "20:28", "20:30"],
                ["21:00", "21:04", "21:06", "21:15", "21:20", "21:23", "21:25", "21:27", "21:28", "21:30"],
                ["22:00", "22:04", "22:06", "22:15", "22:20", "22:23", "22:25", "22:27", "22:28", "22:30"]
            ],
            sabado: [
                ["7:30", "7:34", "7:38", "7:45", "7:50", "7:53", "7:55", "7:57", "7:58", "8:00"],
                ["9:00", "9:04", "9:08", "9:15", "9:20", "9:23", "9:25", "9:27", "9:28", "9:30"],
                ["11:00", "11:04", "11:06", "11:15", "11:20", "11:23", "11:25", "11:27", "11:28", "11:30"],
                ["12:00", "12:04", "12:06", "12:15", "12:20", "12:23", "12:25", "12:27", "12:28", "12:30"],
                ["16:30", "16:34", "16:38", "16:45", "16:50", "16:53", "16:55", "16:57", "16:58", "17:00"],
                ["18:30", "18:34", "18:38", "18:45", "18:50", "18:53", "18:55", "18:57", "18:58", "19:00"],
                ["20:30", "20:34", "20:38", "20:45", "20:50", "20:53", "20:55", "20:57", "20:58", "21:00"]
            ],
            domingo: [
                ["9:30", "9:34", "9:38", "9:45", "9:50", "9:53", "9:55", "9:57", "9:58", "10:00"],
                ["12:00", "12:04", "12:06", "12:15", "12:20", "12:23", "12:25", "12:27", "12:28", "12:30"],
                ["20:30", "20:34", "20:36", "20:45", "20:50", "20:53", "20:55", "20:58", "20:59", "21:00"]
            ]
        }
    }
};
    // Estados para el filtrado
    const [tipoRuta, setTipoRuta] = useState('ida'); // 'ida' o 'vuelta'
    const [origen, setOrigen] = useState('');
    const [destino, setDestino] = useState('');
    const [dia, setDia] = useState('habil');
    const [mostrarFiltrado, setMostrarFiltrado] = useState(false);
    const [horariosFiltrados, setHorariosFiltrados] = useState([]);
    const [destinosDisponibles, setDestinosDisponibles] = useState([]);

    // Actualizar destinos disponibles cuando cambia el origen o el tipo de ruta
    const updateDestinos = (origenSeleccionado) => {
        if (!origenSeleccionado) return;
        
        const rutaActual = rutas[tipoRuta];
        const indexOrigen = rutaActual.paradas.indexOf(origenSeleccionado);
        
        if (indexOrigen >= 0) {
            setDestinosDisponibles(rutaActual.paradas.slice(indexOrigen + 1));
        }
        setDestino('');
    };

    // Filtrar horarios
    const filtrarHorarios = () => {
        if (!origen || !destino) {
            alert("Seleccione origen y destino");
            return;
        }

        const rutaActual = rutas[tipoRuta];
        const indexOrigen = rutaActual.paradas.indexOf(origen);
        const indexDestino = rutaActual.paradas.indexOf(destino);

        if (indexOrigen === -1 || indexDestino === -1) return;

        const resultados = rutaActual.dias[dia].map(viaje => ({
            salida: viaje[indexOrigen],
            llegada: viaje[indexDestino]
        }));

        setHorariosFiltrados(resultados);
        setMostrarFiltrado(true);
    };

    return (
        <>
            <Header />
            <div className="horarios-container">
                <h1 className="title">Horarios Santa Lucía - Monteros</h1>

                {/* Sección de filtrado */}
                <div className="filtro-container">
                    <Row>
                        <Col md={3}>
                            <Form.Group>
                                <Form.Label>Tipo de Ruta</Form.Label>
                                <Form.Select 
                                    value={tipoRuta}
                                    onChange={(e) => {
                                        setTipoRuta(e.target.value);
                                        setOrigen('');
                                        setDestino('');
                                    }}
                                >
                                    <option value="ida">Santa Lucía → Monteros</option>
                                    <option value="vuelta">Monteros → Santa Lucía</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>

                        <Col md={3}>
                            <Form.Group>
                                <Form.Label>Origen</Form.Label>
                                <Form.Select 
                                    value={origen} 
                                    onChange={(e) => {
                                        setOrigen(e.target.value);
                                        updateDestinos(e.target.value);
                                    }}
                                >
                                    <option value="">Seleccionar origen</option>
                                    {rutas[tipoRuta].paradas.map((parada, index) => (
                                        <option key={`origen-${index}`} value={parada}>{parada}</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>

                        <Col md={3}>
                            <Form.Group>
                                <Form.Label>Destino</Form.Label>
                                <Form.Select
                                    value={destino}
                                    onChange={(e) => setDestino(e.target.value)}
                                    disabled={!origen}
                                >
                                    <option value="">Seleccionar destino</option>
                                    {destinosDisponibles.map((parada, index) => (
                                        <option key={`destino-${index}`} value={parada}>{parada}</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>

                        <Col md={2}>
                            <Form.Group>
                                <Form.Label>Día</Form.Label>
                                <Form.Select value={dia} onChange={(e) => setDia(e.target.value)}>
                                    <option value="habil">Día hábil</option>
                                    <option value="sabado">Sábado</option>
                                    <option value="domingo">Domingo</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>

                        <Col md={1} className="d-flex align-items-end">
                            <Button
                                variant="primary"
                                onClick={filtrarHorarios}
                                disabled={!origen || !destino}
                                className="w-100"
                            >
                                Filtrar
                            </Button>
                        </Col>
                    </Row>
                </div>

                {/* Resultados filtrados */}
                {mostrarFiltrado && (
                    <div className="resultado-filtrado">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h3 className="subtitle">
                                Horarios {origen} → {destino} ({dia === 'habil' ? 'Día hábil' : dia === 'sabado' ? 'Sábado' : 'Domingo'})
                            </h3>
                            <Button
                                variant="outline-secondary"
                                onClick={() => setMostrarFiltrado(false)}
                            >
                                Ver todos
                            </Button>
                        </div>

                        <div className="table-responsive">
                            <table className="schedule-table">
                                <thead>
                                    <tr>
                                        <th>Salida</th>
                                        <th>Llegada</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {horariosFiltrados.length > 0 ? (
                                        horariosFiltrados.map((horario, index) => (
                                            <tr key={index}>
                                                <td>{horario.salida}</td>
                                                <td>{horario.llegada}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="2" className="text-center">No hay horarios disponibles</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Tablas completas */}
                {!mostrarFiltrado && (
                    <div key={rutas[tipoRuta].id}>
                        <h2 className="subtitle">{rutas[tipoRuta].nombre} - {dia === 'habil' ? 'Día hábil' : dia === 'sabado' ? 'Sábado' : 'Domingo'}</h2>
                        <div className="table-responsive">
                            <table className="schedule-table">
                                <thead>
                                    <tr>
                                        {rutas[tipoRuta].paradas.map(parada => (
                                            <th key={parada}>{parada}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {rutas[tipoRuta].dias[dia].map((viaje, index) => (
                                        <tr key={index}>
                                            {viaje.map((hora, i) => (
                                                <td key={i}>{hora}</td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
            <Footer />
        </>
    );
};