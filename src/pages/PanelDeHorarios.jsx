import React, { useState, useEffect } from 'react';
import { fetchScheduleData, getRutas } from '../services/scheduleService';
import './styles/panel-horarios.css';
import { Row, Col, Form, Button } from 'react-bootstrap';
import Header from '../components/Header';
import { Footer } from '../components/Footer';
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export const PanelDeHorarios = () => {
    // Dynamic routes state
    const [rutas, setRutas] = useState([]);

    // Selection state: store selected Ruta ID, not just type
    const [selectedRutaId, setSelectedRutaId] = useState('');

    const [origen, setOrigen] = useState('');
    const [destino, setDestino] = useState('');
    const [tipo_dia, setDia] = useState('habil');
    const [horario, setHorario] = useState('mañana');
    const [mostrarFiltrado, setMostrarFiltrado] = useState(false);
    const [horariosFiltrados, setHorariosFiltrados] = useState([]);
    const [destinosDisponibles, setDestinosDisponibles] = useState([]);

    // Data stores
    const [paradasPorRuta, setParadasPorRuta] = useState({});
    const [tripsPorRuta, setTripsPorRuta] = useState({}); // Stores grouped trips

    // Load Data
    useEffect(() => {
        const loadAllData = async () => {
            try {
                // 1. Fetch Routes
                const rutasData = await getRutas();
                setRutas(rutasData);

                if (rutasData.length > 0) {
                    setSelectedRutaId(rutasData[0].id);
                }

                // 2. Fetch Schedules for these routes
                const data = await fetchScheduleData(rutasData);
                setParadasPorRuta(data.paradas);
                setTripsPorRuta(data.horarios);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
        loadAllData();
    }, []);

    // Helper to get current ruta object
    const currentRuta = rutas.find(r => r.id === selectedRutaId);

    // Actualizar destinos disponibles
    useEffect(() => {
        if (!origen || !selectedRutaId || !paradasPorRuta[selectedRutaId]) return;

        const paradas = paradasPorRuta[selectedRutaId];
        const indexOrigen = paradas.findIndex(p => p.nombre === origen);

        if (indexOrigen >= 0) {
            setDestinosDisponibles(paradas.slice(indexOrigen + 1));
        }
        setDestino('');
    }, [origen, selectedRutaId, paradasPorRuta]);

    // Filtrar
    const filtrarHorarios = () => {
        if (!origen || !destino || !selectedRutaId) return;

        const paradas = paradasPorRuta[selectedRutaId] || [];
        const trips = tripsPorRuta[selectedRutaId] || [];

        const pOrigen = paradas.find(p => p.nombre === origen);
        const pDestino = paradas.find(p => p.nombre === destino);

        if (!pOrigen || !pDestino) return;

        // Filter Trips
        const validTrips = trips.filter(trip => {
            const start = trip[pOrigen._id];
            const end = trip[pDestino._id];

            if (!start || !end) return false;

            // Check filters (Day/Turn)
            return start.tipo_dia === tipo_dia && start.turno === horario;
        });

        const resultados = validTrips.map(trip => {
            return {
                salida: trip[pOrigen._id].horario,
                llegada: trip[pDestino._id].horario
            };
        });

        setHorariosFiltrados(resultados);
        setMostrarFiltrado(true);
    };

    const getTablaCompleta = () => {
        if (!selectedRutaId) return null;

        const paradas = paradasPorRuta[selectedRutaId] || [];
        const trips = tripsPorRuta[selectedRutaId] || [];

        // Filter trips by day/turn
        const filteredTrips = trips.filter(trip => {
            // Check first available stop matches criteria
            for (const p of paradas) {
                if (trip[p._id]) {
                    return trip[p._id].tipo_dia === tipo_dia && trip[p._id].turno === horario;
                }
            }
            return false;
        });

        return (
            <div id="tabla-horarios">
                <h2 className="subtitle">{currentRuta?.nombre} - {tipo_dia}</h2>
                <div className="table-responsive">
                    <table className="schedule-table">
                        <thead>
                            <tr>
                                {paradas.map(parada => (
                                    <th key={parada._id}>{parada.nombre}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTrips.map((trip, index) => (
                                <tr key={index}>
                                    {paradas.map(parada => (
                                        <td key={parada._id}>
                                            {trip[parada._id] ? trip[parada._id].horario : '-'}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    const generarPDF = () => {
        const elemento = document.getElementById("tabla-horarios");
        if (!elemento) {
            alert("No se encontró la tabla para generar el PDF.");
            return;
        }
        html2canvas(elemento, { scale: 2 }).then((canvas) => {
            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF({
                orientation: "landscape",
                unit: "pt",
                format: "a4",
            });
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const ratio = Math.min(pageWidth / canvas.width, pageHeight / canvas.height);
            const imgWidth = canvas.width * ratio;
            const imgHeight = canvas.height * ratio;
            const marginX = (pageWidth - imgWidth) / 2;
            const marginY = 20;
            pdf.addImage(imgData, "PNG", marginX, marginY, imgWidth, imgHeight);
            pdf.save(`horarios - ${currentRuta?.nombre} -${tipo_dia}.pdf`);
        }).catch((error) => {
            console.error("Error generando PDF:", error);
            alert("Ocurrió un error al generar el PDF.");
        });
    };

    return (
        <>
            <Header />
            <div className="horarios-container">
                <h1 className="title">Horarios {currentRuta?.nombre || 'Santa Lucía'}</h1>

                {/* Filtros */}
                <div className="filtro-container">
                    <Row>
                        <Col md={3}>
                            <Form.Group>
                                <Form.Label>Ruta</Form.Label>
                                <Form.Select
                                    value={selectedRutaId}
                                    onChange={e => {
                                        setSelectedRutaId(e.target.value);
                                        setOrigen('');
                                        setDestino('');
                                        setMostrarFiltrado(false);
                                    }}
                                >
                                    {rutas.map(r => (
                                        <option key={r.id} value={r.id}>{r.nombre}</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        {/* 
                            Original logic had 'tipo' select. Now we select specific Route.
                        */}

                        <Col md={2}>
                            <Form.Group>
                                <Form.Label>Origen</Form.Label>
                                <Form.Select value={origen} onChange={e => {
                                    setOrigen(e.target.value);
                                }}>
                                    <option value="">Seleccionar origen</option>
                                    {(paradasPorRuta[selectedRutaId] || []).map(p => (
                                        <option key={p._id} value={p.nombre}>{p.nombre}</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>

                        <Col md={2}>
                            <Form.Group>
                                <Form.Label>Destino</Form.Label>
                                <Form.Select value={destino} onChange={e => setDestino(e.target.value)} disabled={!origen}>
                                    <option value="">Seleccionar destino</option>
                                    {destinosDisponibles.map(p => (
                                        <option key={p._id} value={p.nombre}>{p.nombre}</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>

                        <Col md={2}>
                            <Form.Group>
                                <Form.Label>Día</Form.Label>
                                <Form.Select value={tipo_dia} onChange={e => setDia(e.target.value)}>
                                    <option value="habil">Día hábil</option>
                                    <option value="sabado">Sábado</option>
                                    <option value="domingo">Domingo</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>

                        <Col md={2}>
                            <Form.Group>
                                <Form.Label>Horario</Form.Label>
                                <Form.Select value={horario} onChange={e => setHorario(e.target.value)}>
                                    <option value="mañana">Mañana</option>
                                    <option value="tarde">Tarde</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>

                        <Col md={1} className="d-flex align-items-end">
                            <Button className="w-100" onClick={filtrarHorarios} disabled={!origen || !destino}>
                                Filtrar
                            </Button>
                        </Col>
                    </Row>
                </div>

                {/* Resultados filtrados */}
                {mostrarFiltrado ? (
                    <div className="resultado-filtrado">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h3 className="subtitle">Horarios {origen} → {destino} ({tipo_dia} - {horario})</h3>
                            <Button variant="outline-secondary" onClick={() => setMostrarFiltrado(false)}>Ver todos</Button>
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
                                        horariosFiltrados.map((h, i) => (
                                            <tr key={i}>
                                                <td>{h.salida}</td>
                                                <td>{h.llegada}</td>
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
                ) : (
                    getTablaCompleta()
                )}

                {!mostrarFiltrado && (
                    <div className="d-flex justify-content-end mb-3">
                        <Button variant="success" onClick={generarPDF}>
                            Descargar como PDF
                        </Button>
                    </div>
                )}
            </div>
            <Footer />
        </>
    );
};
