import React, { useState, useEffect } from 'react';
import { FaPlus, FaPen, FaTrash, FaClock, FaCalendarAlt } from 'react-icons/fa';
import Swal from 'sweetalert2';
import pruebaApi from '../../../api/pruebaApi';
import axios from 'axios';
import '../../styles/adminscreen.css';
import AddParadaModal from '../../../components/admin-components/AddParadaModel';
import EditParadaModal from '../../../components/admin-components/EditParadasModal';
import EditHorariosModal from '../../../components/admin-components/EditHorariosModal';
import { updateScheduleVersion } from '../../../services/scheduleService';

export const ScheduleManagement = () => {
    console.log("Rendering ScheduleManagement Component");
    const [paradasPorRuta, setParadasPorRuta] = useState({});
    const [mostrarModal, setMostrarModal] = useState(false);
    const [rutaSeleccionada, setRutaSeleccionada] = useState(null);
    const [paradaSeleccionada, setParadaSeleccionada] = useState(null);
    const [modalEditarParadaAbierto, setModalEditarParadaAbierto] = useState(false);
    const [horarioEditando, setHorarioEditando] = useState(null);

    const rutas = [
        { id: "6841ae01c11032698b6ade09", nombre: "Santa Lucía → Monteros" },
        { id: "6841af28447dea60cc03a67d", nombre: "Monteros → Santa Lucía" }
    ];

    const fetchParadasYHorarios = async () => {
        try {
            const nuevasParadas = {};
            for (const ruta of rutas) {
                const resParadas = await pruebaApi.get(`api/paradas?id_ruta=${ruta.id}`);
                const paradas = resParadas.data;
                nuevasParadas[ruta.id] = paradas;
                setParadasPorRuta(prev => ({
                    ...prev,
                    [ruta.id]: paradas
                }));
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchParadasYHorarios();
    }, []);

    const handleAgregarParada = async ({ nombre, orden }) => {
        if (!rutaSeleccionada) return;

        try {
            const nuevaParada = {
                nombre,
                orden,
                id_ruta: rutaSeleccionada.id
            };

            const response = await pruebaApi.post('/admin/nuevaParada', nuevaParada);
            const paradaCreada = response.data;

            setParadasPorRuta(prev => ({
                ...prev,
                [rutaSeleccionada.id]: [...(prev[rutaSeleccionada.id] || []), paradaCreada]
            }));
            await updateScheduleVersion();
            await fetchParadasYHorarios();
            setMostrarModal(false);
        } catch (error) {
            console.error('Error al agregar parada:', error);
        }
    };

    const editarParada = (parada) => {
        setParadaSeleccionada(parada);
        setModalEditarParadaAbierto(true);
    };

    const cerrarModalEditarParada = () => {
        setParadaSeleccionada(null);
        setModalEditarParadaAbierto(false);
    };

    const eliminarParadaClick = async (idParada) => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: 'Esta acción eliminará la parada permanentemente.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            background: '#1e1e1e',
            color: 'white',
            confirmButtonColor: '#c43131'
        });

        if (result.isConfirmed) {
            try {
                await pruebaApi.delete(`/admin/eliminarParada/${idParada}`);
                await updateScheduleVersion();
                await fetchParadasYHorarios();
            } catch (error) {
                console.error('Error al eliminar la parada:', error);
                Swal.fire('Error', 'No se pudo eliminar la parada.', 'error');
            }
        }
    };

    return (
        <div className="schedule-management-container">
            <div className="header-actions">
                <h3>Gestión de Horarios</h3>
            </div>
            <p className="text-muted">Administra las rutas, paradas y horarios de los recorridos.</p>

            <div className="routes-grid">
                {rutas.map((ruta) => (
                    <div key={ruta.id} className="route-card">
                        <div className="route-header">
                            <h4><FaBus style={{ marginRight: '10px' }} />{ruta.nombre}</h4>
                            <button
                                className="btn-add-parada"
                                onClick={() => {
                                    setRutaSeleccionada(ruta);
                                    setMostrarModal(true);
                                }}
                            >
                                <FaPlus /> Agregar Parada
                            </button>
                        </div>

                        <div className="stops-timeline">
                            {(paradasPorRuta[ruta.id] && paradasPorRuta[ruta.id].length > 0) ? (
                                paradasPorRuta[ruta.id].map((parada, index) => (
                                    <div key={parada._id} className="stop-item">
                                        <div className="stop-marker"></div>
                                        <div className="stop-content">
                                            <div className="stop-info">
                                                <span className="stop-name">{parada.nombre}</span>
                                                <span className="stop-order">Orden: {parada.orden}</span>
                                            </div>
                                            <div className="stop-actions">
                                                <button onClick={() => editarParada(parada)} title="Editar parada" className="btn-icon-small edit">
                                                    <FaPen />
                                                </button>
                                                <button onClick={() => setHorarioEditando(parada)} title="Ver horarios" className="btn-icon-small clock">
                                                    <FaClock />
                                                </button>
                                                <button onClick={() => eliminarParadaClick(parada._id)} title="Eliminar parada" className="btn-icon-small delete">
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </div>

                                        {horarioEditando && horarioEditando._id === parada._id && (
                                            <div className="horarios-modal-inline">
                                                {/* Render modal logically if needed or keep using modal component overlay */}
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <p className="no-stops">No hay paradas cargadas.</p>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <AddParadaModal
                isOpen={mostrarModal}
                onClose={() => setMostrarModal(false)}
                onSubmit={handleAgregarParada}
            />
            <EditParadaModal
                isOpen={modalEditarParadaAbierto}
                onRequestClose={cerrarModalEditarParada}
                parada={paradaSeleccionada}
                onRecargarParadas={async () => {
                    await updateScheduleVersion();
                    await fetchParadasYHorarios();
                }}
            />
            {horarioEditando && (
                <EditHorariosModal
                    parada={horarioEditando}
                    onClose={() => setHorarioEditando(null)}
                />
            )}
        </div>
    );
};
