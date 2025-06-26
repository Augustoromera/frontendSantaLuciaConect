import React, { useEffect, useState } from 'react';
import { Modal, Button, Form, Spinner, Alert } from 'react-bootstrap';
import pruebaApi from '../../api/pruebaApi';
import '../../pages/styles/editHorariosModal.css'
import Swal from 'sweetalert2';
import axios from 'axios';

const EditarHorariosModal = ({ parada, onClose }) => {
    const [loading, setLoading] = useState(true);
    const [mensaje, setMensaje] = useState(null);
    const [error, setError] = useState(null);

    const [horariosOriginales, setHorariosOriginales] = useState([]);
    const [horariosEditados, setHorariosEditados] = useState([]);


    const fetchHorarios = async () => {
        try {
            const res = await pruebaApi.get(`api/obtenerHorarios?id_ruta=${parada.id_ruta}&id_parada=${parada._id}`);
            const horarios = res.data.map(h => ({
                ...h,
                hora: h.hora
            }));
            setHorariosOriginales(horarios);
            setHorariosEditados(horarios.map(h => ({ ...h })));
        } catch (err) {
            console.error('Error al obtener horarios:', err);
            setError('Error al obtener los horarios');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (parada && parada._id && parada.id_ruta) {
            fetchHorarios();
        }
    }, [parada]);



    const handleHorarioChange = (index, nuevoValor) => {
        const actualizados = [...horariosEditados];
        actualizados[index].horario = nuevoValor;
        setHorariosEditados(actualizados);
    };


    const guardarCambios = async () => {
        try {
            await pruebaApi.put(`admin/editarHorario`, {
                id_ruta: parada.id_ruta,
                id_parada: parada._id,
                horarios: horariosEditados,
            });
            setMensaje('Horarios actualizados correctamente');
            setTimeout(() => {
                setMensaje(null);
                onClose();
            }, 1000);
        } catch (err) {
            console.error('Error al guardar horarios:', err);
            setError('Error al guardar los horarios');
        }
    };

    const eliminarHorario = async (idHorario) => {
        try {
            // NOTA: AL USAR SWEETALERT2 EN UN MODAL, NOS ARROJA UN ERROR DE ARIA-HIDEN (PROBLEMAS CON EL FOCO) (NO ROMPE LA APP PERO INTENTAR ARREGLAR) 
            const result = await Swal.fire({
                title: '¿Estás seguro?',
                text: 'Esta acción eliminará el horario permanentemente.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Sí, eliminar',
                cancelButtonText: 'Cancelar',
            });

            if (result.isConfirmed) {
                await pruebaApi.delete(`/admin/eliminarHorario/${idHorario}`);

                await Swal.fire({
                    icon: 'success',
                    title: 'Horario eliminado',
                    showConfirmButton: false,
                    timer: 1500
                });

                fetchHorarios();
            }
        } catch (error) {
            console.error('Error al eliminar el horario:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo eliminar el horario.'
            });
        }
    };

    return (
        parada && (
            <Modal show={!!parada} onHide={onClose} centered enforceFocus>
                <Modal.Header closeButton>
                    <Modal.Title>Editar horarios de: {parada.nombre}</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    {loading ? (
                        <div className="text-center">
                            <Spinner animation="border" />
                            <p className="mt-2">Cargando horarios...</p>
                        </div>
                    ) : (
                        <>
                            {error && <Alert variant="danger">{error}</Alert>}
                            {mensaje && <Alert variant="success">{mensaje}</Alert>}

                            {horariosOriginales.length > 0 ? (
                                <Form>
                                    <div className="row gx-4">
                                        {/* Columna de horarios actuales */}
                                        <div className="col-6">
                                            <h6 className="text-white mb-3 text-nowrap">Horarios actuales</h6>
                                            <ul className="list-group list-group-flush">
                                                {horariosOriginales.map((horario, index) => (
                                                    <li
                                                        key={`actual-${horario._id || index}`}
                                                        className="list-group-item bg-dark text-white rounded mb-3 margen border border-secondary d-flex align-items-center justify-content-between"
                                                    >
                                                        <div className="d-flex align-items-center gap-2">
                                                            <button
                                                                type='button'
                                                                onClick={() => eliminarHorario(horario._id)}
                                                                title="Eliminar horario"
                                                                className="btn btn-link p-0"
                                                            >
                                                                <i className="fa-solid fa-trash fa-sm" style={{ color: '#c43131' }}></i>
                                                            </button>
                                                            <span className="ms-2">{horario.horario}</span>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        {/* Columna de horarios editados */}
                                        <div className="col-6">
                                            <h6 className="text-white mb-3 text-nowrap">Horarios editados</h6>
                                            {horariosEditados.map((horario, index) => (
                                                <Form.Group key={`editado-${horario._id || index}`} className="mb-3 position-relative pos">
                                                    <Form.Control
                                                        type="time"
                                                        value={horario.horario}
                                                        onChange={(e) => handleHorarioChange(index, e.target.value)}
                                                        className="text-center bg-white border border-secondary shadow-sm"
                                                    />
                                                    <span className="position-absolute top-50 end-0 translate-middle-y pe-3 text-muted">
                                                        <i className="bi bi-clock" />
                                                    </span>
                                                </Form.Group>
                                            ))}
                                        </div>
                                    </div>
                                </Form>

                            ) : (
                                <p className='text-white'>No hay horarios cargados para esta parada.</p>
                            )}

                        </>
                    )}
                </Modal.Body>

                <Modal.Footer>
                    <Button className='botonGuardar' onClick={guardarCambios} disabled={loading}>
                        Guardar cambios
                    </Button>
                    <Button className='botonCancelar' onClick={onClose}>
                        Cancelar
                    </Button>
                </Modal.Footer>
            </Modal>
        )
    );
};

export default EditarHorariosModal;
