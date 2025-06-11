import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import './styles/panel-horarios.css';
import { Container, Row, Col, Form, Button, Table } from 'react-bootstrap';
import Header from '../components/Header';
import { Footer } from '../components/Footer';
import Modal from 'react-modal';

export const PanelDeHorarios = () => {
    const rutas = [
        { id: "6846de00f0234bbe5766f9be", nombre: "Santa Lucía → Monteros" },
        { id: "684979a4439c9115ed13b3e5", nombre: "Monteros → Santa Lucía" }
    ];

    // Estados originales
    const [paradasPorRuta, setParadasPorRuta] = useState({});
    const [horariosPorRuta, setHorariosPorRuta] = useState({});

    // Estados para el filtrado
    const [origen, setOrigen] = useState('');
    const [destino, setDestino] = useState('');
    const [dia, setDia] = useState('habil');
    const [mostrarFiltrado, setMostrarFiltrado] = useState(false);
    const [horariosFiltrados, setHorariosFiltrados] = useState([]);
    const [destinosDisponibles, setDestinosDisponibles] = useState([]);

    // Cargar datos originales
    useEffect(() => {
        const fetchParadasYHorarios = async () => {
            try {
                const nuevasParadas = {};
                const nuevosHorarios = {};

                for (const ruta of rutas) {
                    // Obtener paradas
                    const resParadas = await axios.get(`/paradas?id_ruta=${ruta.id}`);
                    const paradas = resParadas.data;
                    nuevasParadas[ruta.id] = paradas;

                    // Obtener horarios de cada parada
                    const horarios = await Promise.all(paradas.map(async parada => {
                        const resHorario = await axios.get(`/obtenerHorarios?id_ruta=${ruta.id}&id_parada=${parada._id}`);
                        return {
                            paradaId: parada._id,
                            nombre: parada.nombre,
                            horarios: resHorario.data
                        };
                    }));

                    nuevosHorarios[ruta.id] = horarios;
                }

                setParadasPorRuta(nuevasParadas);
                setHorariosPorRuta(nuevosHorarios);
            } catch (error) {
                console.error(error);
            }
        };

        fetchParadasYHorarios();
    }, []);

    // Actualizar destinos disponibles cuando cambia el origen
    useEffect(() => {
        if (origen) {
            const esIda = origen.includes("Santa Lucía");
            const rutaId = esIda ? rutas[0].id : rutas[1].id;
            const paradasRuta = paradasPorRuta[rutaId] || [];

            const indexOrigen = paradasRuta.findIndex(p => p.nombre === origen);
            if (indexOrigen >= 0) {
                setDestinosDisponibles(paradasRuta.slice(indexOrigen + 1));
            }
            setDestino('');
        }
    }, [origen, paradasPorRuta]);

    // Función para filtrar horarios
    const filtrarHorarios = () => {
        if (!origen || !destino) {
            alert("Por favor seleccione origen y destino");
            return;
        }

        const esIda = origen.includes("Santa Lucía");
        const rutaId = esIda ? rutas[0].id : rutas[1].id;
        const horariosRuta = horariosPorRuta[rutaId] || [];
        const paradasRuta = paradasPorRuta[rutaId] || [];

        const indexOrigen = paradasRuta.findIndex(p => p.nombre === origen);
        const indexDestino = paradasRuta.findIndex(p => p.nombre === destino);

        if (indexOrigen === -1 || indexDestino === -1) {
            alert("Error: No se encontraron las paradas seleccionadas");
            return;
        }

        const horariosOrigenObj = horariosRuta.find(p => p.paradaId === paradasRuta[indexOrigen]._id);
        const horariosDestinoObj = horariosRuta.find(p => p.paradaId === paradasRuta[indexDestino]._id);

        const horariosOrigen = horariosOrigenObj?.horarios?.map(h => h.horario) || [];
        const horariosDestino = horariosDestinoObj?.horarios?.map(h => h.horario) || [];

        const resultados = horariosOrigen.map(horaOrigen => {
            const horaDestino = horariosDestino.find(horaDest => horaDest > horaOrigen);
            return horaDestino ? { salida: horaOrigen, llegada: horaDestino } : null;
        }).filter(Boolean);

        setHorariosFiltrados(resultados);
        setMostrarFiltrado(true);
    };

    // Función original para determinar máximo de filas
    const getMaxFilas = (horarios) => {
        return Math.max(...horarios.map(p => p.horarios?.length || 0));
    };

    // Obtener nombres de paradas para los filtros
    const getNombresParadas = () => {
        const nombres = [];
        rutas.forEach(ruta => {
            (paradasPorRuta[ruta.id] || []).forEach(parada => {
                if (!nombres.includes(parada.nombre)) {
                    nombres.push(parada.nombre);
                }
            });
        });
        return nombres;
    };

    return (
        <>
            <Header />
            <div className="horarios-container">
                <h1 className="title">Horarios Santa Lucía - Monteros</h1>

                {/* Sección de filtrado */}
                <div className="filtro-container">
                    <Row>
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label>Origen</Form.Label>
                                <Form.Select value={origen} onChange={(e) => setOrigen(e.target.value)}>
                                    <option value="">Seleccionar origen</option>
                                    {getNombresParadas().map((nombre, index) => (
                                        <option key={`origen-${index}`} value={nombre}>{nombre}</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>

                        <Col md={4}>
                            <Form.Group>
                                <Form.Label>Destino</Form.Label>
                                <Form.Select
                                    value={destino}
                                    onChange={(e) => setDestino(e.target.value)}
                                    disabled={!origen}
                                >
                                    <option value="">Seleccionar destino</option>
                                    {destinosDisponibles.map((parada, index) => (
                                        <option key={`destino-${index}`} value={parada.nombre}>{parada.nombre}</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>

                        <Col md={3}>
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

                {/* Tablas completas originales */}
                {!mostrarFiltrado && rutas.map(ruta => (
                    <div key={ruta.id}>
                        <h2 className="subtitle">{ruta.nombre}</h2>
                        <div className="table-responsive">
                            <table className="schedule-table">
                                <thead>
                                    <tr>
                                        {(paradasPorRuta[ruta.id] || []).map(parada => (
                                            <th key={parada._id}>{parada.nombre}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {Array.from({ length: getMaxFilas(horariosPorRuta[ruta.id] || []) }).map((_, filaIndex) => (
                                        <tr key={filaIndex}>
                                            {(paradasPorRuta[ruta.id] || []).map(parada => {
                                                const horariosParada = (horariosPorRuta[ruta.id] || [])
                                                    .find(h => h.paradaId === parada._id)?.horarios || [];
                                                return (
                                                    <td key={parada._id}>
                                                        {horariosParada[filaIndex]?.horario || "-"}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ))}
            </div>
            <Footer />
        </>

    );
};