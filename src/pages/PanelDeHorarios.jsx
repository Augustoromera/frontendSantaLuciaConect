import React, { useState, useEffect, useRef } from 'react';
import { fetchScheduleData, getRutas } from '../services/scheduleService';
import { getTarifasByRuta } from '../services/tariffService';
import './styles/panel-horarios.css';
import CustomSelect from '../components/CustomSelect';
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
    const [horario, setHorario] = useState('todos'); // Default to 'todos'
    const [mostrarFiltrado, setMostrarFiltrado] = useState(false);
    const [horariosFiltrados, setHorariosFiltrados] = useState([]);
    const [destinosDisponibles, setDestinosDisponibles] = useState([]);

    // Tariffs
    const [tarifas, setTarifas] = useState([]);
    const [precioActual, setPrecioActual] = useState(null);

    // Data stores
    const [paradasPorRuta, setParadasPorRuta] = useState({});
    const [tripsPorRuta, setTripsPorRuta] = useState({}); // Stores grouped trips
    const resultsRef = useRef(null); // Ref for scrolling to results

    // Load Data
    useEffect(() => {
        const loadAllData = async () => {
            try {
                // 1. Fetch Routes
                const rutasData = await getRutas();

                // Process Routes: Format Name and Sort (Groups inverse routes)
                const processedRutas = rutasData.map(r => {
                    // Normalize arrows to " - "
                    const newName = r.nombre.replace(/\s*(?:-{1,2}>|→)\s*/g, ' - ');
                    return { ...r, nombre: newName };
                }).sort((a, b) => {
                    // Helper to generate a canonical key for sorting/grouping
                    const getSortKey = (name) => {
                        const parts = name.split(name.includes(' - ') ? ' - ' : '-');
                        if (parts.length >= 2) {
                            // Sort the parts -> "CityA_CityB" to group "A - B" and "B - A"
                            return parts.map(p => p.trim().toLowerCase()).sort().join('_');
                        }
                        return name.toLowerCase();
                    };

                    // Helper to determine priority based on user request
                    const getPriority = (name) => {
                        // Normalize to lower case and remove accents
                        const n = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

                        // 1. Santa Lucia <-> Monteros
                        if (n.includes('santa lucia') && n.includes('monteros')) return 1;
                        // 2. Monteros <-> Maldonado
                        if (n.includes('monteros') && n.includes('maldonado')) return 2;
                        // 3. Capitan Caceres
                        if (n.includes('capitan caceres')) return 3;
                        // 4. Las Mesadas
                        if (n.includes('las mesadas')) return 4;

                        return 99; // Others
                    };

                    const priorityA = getPriority(a.nombre);
                    const priorityB = getPriority(b.nombre);

                    if (priorityA !== priorityB) return priorityA - priorityB;

                    const keyA = getSortKey(a.nombre);
                    const keyB = getSortKey(b.nombre);

                    if (keyA < keyB) return -1;
                    if (keyA > keyB) return 1;

                    // Secondary sort: If keys are same, sort by name
                    return a.nombre.localeCompare(b.nombre);
                });

                setRutas(processedRutas);

                if (processedRutas.length > 0) {
                    setSelectedRutaId(processedRutas[0].id);
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

    // Load Tariffs when route changes
    useEffect(() => {
        if (!selectedRutaId) return;
        const loadTariffs = async () => {
            try {
                const t = await getTarifasByRuta(selectedRutaId);
                setTarifas(t);
            } catch (e) {
                console.error(e);
            }
        };
        loadTariffs();
    }, [selectedRutaId]);

    // Calculate Price when Origin/Dest changes
    useEffect(() => {
        if (!origen || !destino || tarifas.length === 0) {
            setPrecioActual(null);
            return;
        }
        const tarifa = tarifas.find(t => t.origen === origen && t.destino === destino);
        setPrecioActual(tarifa ? tarifa.precio : null);
    }, [origen, destino, tarifas]);

    // Helper to get current ruta object
    const currentRuta = rutas.find(r => r.id === selectedRutaId);

    // Actualizar destinos disponibles
    useEffect(() => {
        if (!origen || !selectedRutaId || !paradasPorRuta[selectedRutaId]) return;

        const paradas = paradasPorRuta[selectedRutaId];
        // Now origen is ID
        const indexOrigen = paradas.findIndex(p => p._id === origen);

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

        // Now origen/destino are IDs
        const pOrigen = paradas.find(p => p._id === origen);
        const pDestino = paradas.find(p => p._id === destino);

        if (!pOrigen || !pDestino) return;

        // Filter Trips
        const validTrips = trips.filter(trip => {
            const start = trip[pOrigen._id];
            const end = trip[pDestino._id];

            if (!start || !end) return false;

            // Check filters (Day/Turn)
            const diaMatch = start.tipo_dia === tipo_dia;
            const turnoMatch = horario === 'todos' ? true : start.turno === horario;

            return diaMatch && turnoMatch;
        });

        const resultados = validTrips.map(trip => {
            return {
                salida: trip[pOrigen._id].horario,
                llegada: trip[pDestino._id].horario
            };
        });

        setHorariosFiltrados(resultados);
        setMostrarFiltrado(true);

        // Scroll to results after state update
        setTimeout(() => {
            if (resultsRef.current) {
                const yOffset = -100; // Offset for header/navbar
                const y = resultsRef.current.getBoundingClientRect().top + window.scrollY + yOffset;
                window.scrollTo({ top: y, behavior: 'smooth' });
            }
        }, 100);
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
                    const diaMatch = trip[p._id].tipo_dia === tipo_dia;
                    const turnoMatch = horario === 'todos' ? true : trip[p._id].turno === horario;
                    return diaMatch && turnoMatch;
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

    // Helper variables for Display
    const nombreOrigen = paradasPorRuta[selectedRutaId]?.find(p => p._id === origen)?.nombre || '';
    const nombreDestino = paradasPorRuta[selectedRutaId]?.find(p => p._id === destino)?.nombre || '';

    const generarPDF = () => {
        // Determinar qué tabla imprimir
        const targetId = mostrarFiltrado ? "resultado-filtrado" : "tabla-horarios";
        const elemento = document.getElementById(targetId);

        if (!elemento) {
            alert("No se encontró la tabla para generar el PDF.");
            return;
        }

        // Crear un clon del elemento
        const clon = elemento.cloneNode(true);

        // Ocultar elementos marcados como no-print
        // Usamos remove() porque classes como d-flex pueden tener !important que anulen display:none
        const noPrintElements = clon.querySelectorAll('.no-print');
        noPrintElements.forEach(el => el.remove());

        // Fallback: Borrar cualquier botón que haya quedado
        const buttons = clon.querySelectorAll('button');
        buttons.forEach(btn => btn.remove());

        // Configurar ancho para simular "vista móvil" o "vista completa"
        // Tabla filtrada: 600px (ancho tipo tablet/móvil) para que al imprimir en A4 se vea GRANDE.
        // Tabla completa: 3000px (ancho extendido) para que entren todas las columnas sin cortes.
        const pdfWidthSettings = mostrarFiltrado ? 600 : 3000;
        const pdfWindowWidth = mostrarFiltrado ? 600 : 3200;

        // Estilos para el clon
        clon.style.position = 'absolute';
        clon.style.top = '-9999px';
        clon.style.left = '0';
        clon.style.width = `${pdfWidthSettings}px`;
        clon.style.height = 'auto';
        clon.style.zIndex = '-1';
        clon.style.background = '#fff';
        clon.style.padding = '20px';

        // Forzar visibilidad del overflow
        clon.style.overflow = 'visible';

        // Ajustar .table-responsive
        const tableResponsive = clon.querySelector('.table-responsive');
        if (tableResponsive) {
            tableResponsive.style.overflow = 'visible';
            tableResponsive.style.display = 'block';
            tableResponsive.style.width = '100%';
        }

        // Ajustar fuente y anchos de tabla
        const tabla = clon.querySelector('table');
        if (tabla) {
            tabla.style.width = '100%';
            // Si es filtrado, forzar un tamaño de fuente legible pero no exagerado, 
            // el zoom lo dará el ancho del contenedor (600px estirado a A4).
            if (mostrarFiltrado) {
                tabla.style.fontSize = '14px';
            } else {
                tabla.style.fontSize = '12px';
            }
        }

        // Añadir el clon al body
        document.body.appendChild(clon);

        // Generar canvas
        html2canvas(clon, {
            scale: 2,
            useCORS: true,
            windowWidth: pdfWindowWidth,
            scrollX: 0,
            scrollY: 0
        }).then((canvas) => {
            const imgData = canvas.toDataURL("image/png");

            // PDF en landscape (horizontal) para aprovechar el ancho
            const pdf = new jsPDF({
                orientation: "landscape",
                unit: "pt",
                format: "a4",
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            const imgProps = pdf.getImageProperties(imgData);

            // Calcular dimensiones para ajustar a la página (con margen)
            const margin = 20;
            const availableWidth = pdfWidth - (margin * 2);
            const availableHeight = pdfHeight - (margin * 2);

            let imgWidth = availableWidth;
            let imgHeight = (imgProps.height * imgWidth) / imgProps.width;

            // Si se pasa de alto, ajustar por alto
            if (imgHeight > availableHeight) {
                imgHeight = availableHeight;
                imgWidth = (imgProps.width * imgHeight) / imgProps.height;
            }

            // Centrar horizontalmente
            const x = (pdfWidth - imgWidth) / 2;
            const y = margin; // Margen superior

            pdf.addImage(imgData, "PNG", x, y, imgWidth, imgHeight);

            const nombreArchivo = mostrarFiltrado
                ? `horarios_filtrados_${currentRuta?.nombre}.pdf`
                : `horarios_completo_${currentRuta?.nombre}_${tipo_dia}.pdf`;

            pdf.save(nombreArchivo);

            if (document.body.contains(clon)) document.body.removeChild(clon);
        }).catch((error) => {
            console.error("Error generando PDF:", error);
            alert("Ocurrió un error al generar el PDF.");
            if (document.body.contains(clon)) document.body.removeChild(clon);
        });
    };

    return (
        <>
            <Header />
            <div className="horarios-container">
                <h1 className="title">Horarios {currentRuta?.nombre || 'Santa Lucía'}</h1>

                {/* Filtros */}
                <div className="filtro-horarios">
                    <Row>
                        <Col md={3}>
                            <CustomSelect
                                label="Ruta"
                                placeholder="Seleccionar ruta"
                                value={selectedRutaId}
                                options={rutas.map(r => ({ value: r.id, label: r.nombre }))}
                                onChange={(val) => {
                                    setSelectedRutaId(val);
                                    setOrigen('');
                                    setDestino('');
                                    setMostrarFiltrado(false);
                                    setPrecioActual(null);
                                }}
                            />
                        </Col>

                        <Col md={2}>
                            <CustomSelect
                                label="Origen"
                                placeholder="Seleccionar origen"
                                value={origen}
                                options={(paradasPorRuta[selectedRutaId] || []).map(p => ({ value: p._id, label: p.nombre }))}
                                onChange={(val) => setOrigen(val)}
                            />
                        </Col>

                        <Col md={2}>
                            <CustomSelect
                                label="Destino"
                                placeholder="Seleccionar destino"
                                value={destino}
                                disabled={!origen}
                                options={destinosDisponibles.map(p => ({ value: p._id, label: p.nombre }))}
                                onChange={(val) => setDestino(val)}
                            />
                        </Col>

                        <Col md={2}>
                            <CustomSelect
                                label="Día"
                                placeholder="Seleccionar día"
                                value={tipo_dia}
                                options={[
                                    { value: 'habil', label: 'Día hábil' },
                                    { value: 'sabado', label: 'Sábado' },
                                    { value: 'domingo', label: 'Domingo' }
                                ]}
                                onChange={(val) => setDia(val)}
                            />
                        </Col>

                        <Col md={2}>
                            <CustomSelect
                                label="Horario"
                                placeholder="Seleccionar horario"
                                value={horario}
                                options={[
                                    { value: 'todos', label: 'Todos' },
                                    { value: 'mañana', label: 'Mañana' },
                                    { value: 'tarde', label: 'Tarde' }
                                ]}
                                onChange={(val) => setHorario(val)}
                            />
                        </Col>

                        <Col md={1} className="d-flex align-items-end mb-2">
                            {/* mb-2 to align with inputs visually */}
                            <Button className="w-100" onClick={filtrarHorarios} disabled={!origen || !destino} style={{ height: '50px', borderRadius: '8px', fontWeight: 'bold' }}>
                                FILTRAR
                            </Button>
                        </Col>
                    </Row>

                    {/* Precio Section */}
                    {origen && destino && (
                        <div className="mt-3 p-3 bg-dark text-white rounded text-center animate__animated animate__fadeIn">
                            <h4 className="m-0">
                                Valor del Pasaje: <span className="text-warning fw-bold">{precioActual ? `$${precioActual}` : 'Consultar'}</span>
                            </h4>
                        </div>
                    )}
                </div>

                {/* Resultados filtrados */}
                {mostrarFiltrado ? (
                    <div className="resultado-filtrado" id="resultado-filtrado" ref={resultsRef}>
                        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-3 gap-3">
                            <h3 className="subtitle text-center text-md-start m-0">
                                Horarios {nombreOrigen} → {nombreDestino} <span className="d-block d-md-inline text-muted fs-6">({tipo_dia} - {horario})</span>
                            </h3>
                            <div className="d-flex gap-2 no-print justify-content-center">
                                <Button variant="success" onClick={generarPDF} size="sm">
                                    Descargar PDF
                                </Button>
                                <Button className="btn-glow" onClick={() => setMostrarFiltrado(false)}>Ver todos</Button>
                            </div>
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
                            Descargar Tabla Completa PDF
                        </Button>
                    </div>
                )}
            </div>
            <Footer />
            <style>{`
                @media (max-width: 768px) {
                    body {
                        background-image: none !important;
                        background-color: #1a1a2e !important;
                    }
                    /* Ensure container is transparent so body bg shows */
                    .horarios-container {
                        background-color: transparent !important;
                        padding-top: 20px !important; /* Adjust padding if needed */
                    }
                    body::before {
                        background-color: transparent !important;
                        background-image: linear-gradient(
                            to bottom right,
                            #bfbcbc00 0%,
                            #bfbcbc00 20%,
                            #0434a4b3 40%,
                            #bfbcbc00 60%,
                            #bfbcbc00 80%
                        ) !important;
                        background-size: 300% 300% !important;
                        animation: movimiento 5s linear infinite alternate !important;
                    }
                    @keyframes movimiento {
                        from {
                            background-position: 0 0;
                        }
                        to {
                            background-position: 100% 100%;
                        }
                    }
                }
            `}</style>
        </>
    );
};
