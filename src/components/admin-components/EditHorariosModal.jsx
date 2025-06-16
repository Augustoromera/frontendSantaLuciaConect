import React, { useEffect, useState } from 'react';
import { Modal, Button, Form, Spinner, Alert } from 'react-bootstrap';
import pruebaApi from '../../api/pruebaApi';
import axios from 'axios';

const EditarHorariosModal = ({ parada, onClose }) => {
    const [loading, setLoading] = useState(true);
    const [mensaje, setMensaje] = useState(null);
    const [error, setError] = useState(null);

    const [horariosOriginales, setHorariosOriginales] = useState([]);
    const [horariosEditados, setHorariosEditados] = useState([]);


    useEffect(() => {

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

    return (
        <Modal show={!!parada} onHide={onClose} centered>
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
                                                    className="list-group-item bg-dark text-white rounded mb-3 pt-1 text-center border border-secondary"
                                                >
                                                    {horario.horario}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Columna de horarios editados */}
                                    <div className="col-6">
                                        <h6 className="text-white mb-3 text-nowrap">Horarios editados</h6>
                                        {horariosEditados.map((horario, index) => (
                                            <Form.Group key={`editado-${horario._id || index}`} className="mb-3 position-relative">
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
                            <p>No hay horarios cargados para esta parada.</p>
                        )}

                    </>
                )}
            </Modal.Body>

            <Modal.Footer>
                <Button variant="secondary" onClick={onClose}>
                    Cancelar
                </Button>
                <Button variant="primary" onClick={guardarCambios} disabled={loading}>
                    Guardar cambios
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default EditarHorariosModal;
