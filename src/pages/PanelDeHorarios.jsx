import React, { useState, useEffect } from 'react';
import axios from '../api/axios'; // Or pruebaApi
import './styles/panel-horarios.css';
import { Row, Col, Form, Button } from 'react-bootstrap';
import Header from '../components/Header';
import { Footer } from '../components/Footer';
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
export const PanelDeHorarios = () => {
    // Defines routes
    const rutas = [
        { id: "6841ae01c11032698b6ade09", tipo: "ida", nombre: "Santa Lucía → Monteros" },
        { id: "6841af28447dea60cc03a67d", tipo: "vuelta", nombre: "Monteros → Santa Lucía" }
    ];
    const [tipoRuta, setTipoRuta] = useState('ida');
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
    // Cargar paradas y horarios
    useEffect(() => {
        const fetchData = async () => {
            const nuevasParadas = {};
            const nuevosTrips = {};
            for (const ruta of rutas) {
                // 1. Get Stops
                const resParadas = await axios.get(`/paradas?id_ruta=${ruta.id}`);
                const paradas = resParadas.data.sort((a, b) => a.orden - b.orden);
                nuevasParadas[ruta.tipo] = paradas;
                // 2. Get Schedules
                const schedulesByStop = {};
                for (const p of paradas) {
                    const resH = await axios.get(`/obtenerHorarios?id_ruta=${ruta.id}&id_parada=${p._id}`);
                    schedulesByStop[p._id] = resH.data.horarioFiltrado || []; // Use filtered (shown=true)
                }
                // 3. Group into Trips (nro_orden)
                const tripsMap = new Map();
                paradas.forEach(p => {
                    (schedulesByStop[p._id] || []).forEach(h => {
                        let tripId = h.nro_orden;
                        // Handle Legacy: If 0, we might need to invent an ID based on index or just skip logic?
                        // For Public View, if nro_orden is consistently 0, we must fall back to index matching?
                        // Let's assume Updated Admin Panel fixes this, but we support fallback.
                        if (!tripId || tripId == 0) {
                            // Fallback: We can't easily group disparate legacy items without complex logic.
                            // For now, we unfortunately might show them disjointed or try a heuristic.
                            // Heuristic: "legacy" + timestamp_of_schedule? No.
                            // We will just skip grouping for legacy and treat individually? No that breaks the table.
                            // Let's assume index-based grouping for legacy:
                            // We need to know the index of this schedule in the list for that day/turn.
                        }
                        if (tripId && tripId != 0) {
                            if (!tripsMap.has(tripId)) tripsMap.set(tripId, {});
                            tripsMap.get(tripId)[p._id] = h;
                        }
                    });
                });
                // Convert Map to Array of "Trip Objects" { stopId: scheduleObj, ... }
                const trips = [];
                tripsMap.forEach((tripData, id) => {
                    trips.push(tripData);
                });
                // Sort trips by start time
                trips.sort((a, b) => {
                    const getFirst = (t) => {
                        for (const p of paradas) if (t[p._id]) return t[p._id].horario;
                        return "ZZ:ZZ";
                    };
                    return getFirst(a).localeCompare(getFirst(b));
                });
                nuevosTrips[ruta.tipo] = trips;
            }
            setParadasPorRuta(nuevasParadas);
            setTripsPorRuta(nuevosTrips);
        };
        fetchData();
    }, []);
    // Actualizar destinos disponibles
    useEffect(() => {
        if (!origen || !paradasPorRuta[tipoRuta]) return;
        const paradas = paradasPorRuta[tipoRuta];
        const indexOrigen = paradas.findIndex(p => p.nombre === origen);
        if (indexOrigen >= 0) {
            setDestinosDisponibles(paradas.slice(indexOrigen + 1));
        }
        setDestino('');
    }, [origen, tipoRuta, paradasPorRuta]);
    // Filtrar
    const filtrarHorarios = () => {
        if (!origen || !destino) return;
        const paradas = paradasPorRuta[tipoRuta] || [];
        const trips = tripsPorRuta[tipoRuta] || [];
        const pOrigen = paradas.find(p => p.nombre === origen);
        const pDestino = paradas.find(p => p.nombre === destino);
        if (!pOrigen || !pDestino) return;
        // Filter Trips that have both Origen and Destino slots filled (and valid day/turn)
        const validTrips = trips.filter(trip => {
            const start = trip[pOrigen._id];
            const end = trip[pDestino._id];
            if (!start || !end) return false;
            // Check Day/Turn on the START stop (or both?)
            // Usually filters apply to the departure.
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
        const paradas = paradasPorRuta[tipoRuta] || [];
        const trips = tripsPorRuta[tipoRuta] || [];
        // Filter trips by day/turn for the whole table view
        // We check if AT LEAST ONE stop in the trip matches the filter? 
        // Or usually the first stop? Let's check the first available stop in the trip.
        const filteredTrips = trips.filter(trip => {
            // Find first existing schedule in this trip
            for (const p of paradas) {
                if (trip[p._id]) {
                    return trip[p._id].tipo_dia === tipo_dia && trip[p._id].turno === horario;
                }
            }
            return false;
        });
        return (
            <div id="tabla-horarios">
                <h2 className="subtitle">{rutas.find(r => r.tipo === tipoRuta)?.nombre} - {tipo_dia}</h2>
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
            pdf.save(`horarios-${tipoRuta}-${tipo_dia}.pdf`);
        }).catch((error) => {
            console.error("Error generando PDF:", error);
            alert("Ocurrió un error al generar el PDF.");
        });
    };
    return (
        <>
            <Header />
            <div className="horarios-container">
                <h1 className="title">Horarios Santa Lucía - Monteros</h1>
                {/* Filtros */}
                <div className="filtro-container">
                    <Row>
                        <Col md={2}>
                            <Form.Group>
                                <Form.Label>Tipo de Ruta</Form.Label>
                                <Form.Select value={tipoRuta} onChange={e => {
                                    setTipoRuta(e.target.value);
                                    setOrigen('');
                                    setDestino('');
                                    setMostrarFiltrado(false);
                                }}>
                                    <option value="ida">Santa Lucía → Monteros</option>
                                    <option value="vuelta">Monteros → Santa Lucía</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={2}>
                            <Form.Group>
                                <Form.Label>Origen</Form.Label>
                                <Form.Select value={origen} onChange={e => {
                                    setOrigen(e.target.value);
                                }}>
                                    <option value="">Seleccionar origen</option>
                                    {(paradasPorRuta[tipoRuta] || []).map(p => (
                                        <option key={p._id} value={p.nombre}>{p.nombre}</option> // Use Name as value? Ideally ID
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
                        </Col><Col md={2}>
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
