import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import './styles/panel-horarios.css';
import { Row, Col, Form, Button } from 'react-bootstrap';
import Header from '../components/Header';
import { Footer } from '../components/Footer';
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export const PanelDeHorarios = () => {
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
    const [paradasPorRuta, setParadasPorRuta] = useState({});
    const [horariosPorRuta, setHorariosPorRuta] = useState({});

    // Cargar paradas y horarios
    useEffect(() => {
        const fetchData = async () => {
            const nuevasParadas = {};
            const nuevosHorarios = {};

            for (const ruta of rutas) {
                const resParadas = await axios.get(`/paradas?id_ruta=${ruta.id}`);
                const paradas = resParadas.data;
                nuevasParadas[ruta.tipo] = paradas;

                const horariosParadas = await Promise.all(paradas.map(async parada => {
                    const resHorarios = await axios.get(`/obtenerHorarios?id_ruta=${ruta.id}&id_parada=${parada._id}`);
                    
                    return {
                        paradaId: parada._id,
                        nombre: parada.nombre,
                        horarios: resHorarios.data.horarioFiltrado
                    };
                }));
                
                nuevosHorarios[ruta.tipo] = horariosParadas;
            }

            setParadasPorRuta(nuevasParadas);
            setHorariosPorRuta(nuevosHorarios);
        };

        fetchData();
    }, []);

    // Actualizar destinos disponibles cuando cambia el origen
    useEffect(() => {
        if (!origen || !paradasPorRuta[tipoRuta]) return;

        const paradas = paradasPorRuta[tipoRuta];
        const indexOrigen = paradas.findIndex(p => p.nombre === origen);
        if (indexOrigen >= 0) {
            setDestinosDisponibles(paradas.slice(indexOrigen + 1));
        }
        setDestino('');
    }, [origen, tipoRuta, paradasPorRuta]);

    // Filtrar horarios
    const filtrarHorarios = () => {
        if (!origen || !destino) {
            alert("Seleccione origen y destino");
            return;
        }

        const paradas = paradasPorRuta[tipoRuta] || [];
        const horarios = horariosPorRuta[tipoRuta] || [];

        const indexOrigen = paradas.findIndex(p => p.nombre === origen);
        const indexDestino = paradas.findIndex(p => p.nombre === destino);

        if (indexOrigen === -1 || indexDestino === -1 || indexDestino <= indexOrigen) {
            alert("Selección inválida");
            return;
        }

        const horariosOrigen = horarios.find(h => h.paradaId === paradas[indexOrigen]._id)?.horarios || [];
        const horariosDestino = horarios.find(h => h.paradaId === paradas[indexDestino]._id)?.horarios || [];

        const horariosFiltrados = horariosOrigen
            .filter(h => h.tipo_dia === tipo_dia && h.turno === horario)
            .map(h => {
                const llegada = horariosDestino.find(d => d.horario > h.horario && d.tipo_dia === tipo_dia && d.turno === horario);
                return llegada ? { salida: h.horario, llegada: llegada.horario } : null;
            })
            .filter(Boolean);

        setHorariosFiltrados(horariosFiltrados);
        setMostrarFiltrado(true);
    };

    const getTablaCompleta = () => {
        const paradas = paradasPorRuta[tipoRuta] || [];
        const horarios = horariosPorRuta[tipoRuta] || [];

        const viajesPorDia = [];

        const maxViajes = Math.max(...horarios.map(p =>
            p.horarios.filter(h => h.tipo_dia === tipo_dia && h.turno === horario).length
        ));

        for (let i = 0; i < maxViajes; i++) {
            const fila = paradas.map(parada => {
                const h = horarios.find(h => h.paradaId === parada._id);
                const hs = h?.horarios.filter(hh => hh.tipo_dia === tipo_dia && hh.turno === horario);
                return hs?.[i]?.horario || '-';
            });
            viajesPorDia.push(fila);
        }

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
                            {viajesPorDia.map((fila, index) => (
                                <tr key={index}>
                                    {fila.map((hora, idx) => (
                                        <td key={idx}>{hora}</td>
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
            const marginY = 20; // Espacio superior

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
                                    updateDestinos(e.target.value);
                                }}>
                                    <option value="">Seleccionar origen</option>
                                    {(paradasPorRuta[tipoRuta] || []).map(p => (
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
                            <h3 className="subtitle">Horarios {origen} → {destino} (dia: {tipo_dia}) (turno: {horario})</h3>
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
