import React, { useState } from 'react';
import { Badge, Button, Modal, ListGroup } from 'react-bootstrap';
import { FaEnvelope, FaClock, FaCheckCircle, FaReply, FaPlus, FaChevronRight, FaTimes } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import '../styles/LoginRegistro.css'; // Import the requested styles

const UserInboxMobile = ({ messages }) => {
    const [selectedMsg, setSelectedMsg] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const handleShow = (msg) => {
        setSelectedMsg(msg);
        setShowModal(true);
    };

    const handleClose = () => {
        setShowModal(false);
        setSelectedMsg(null);
    };

    return (
        <div className="d-flex flex-column align-items-center" style={{ minHeight: '100vh', paddingBottom: '80px' }}>

            {/* Reusing the Login 'contenedor1' for the glassmorphism card effect */}
            {/* manually overriding some spacing to fit this specific context if needed */}
            <div className="contenedor1" style={{ marginTop: '120px', width: '92%', maxWidth: '500px', flexDirection: 'column' }}>

                <div className="login-form-container" style={{ padding: '2rem 1.5rem', width: '100%' }}>

                    {/* Header inside the card */}
                    <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2 border-bottom border-secondary border-opacity-25 pb-3">
                        <h2 className="branding-title m-0" style={{ fontSize: '1.5rem', textAlign: 'left' }}>Mis Consultas</h2>
                        <Link to="/contact">
                            <Button className="boton-login m-0 py-2 px-3" style={{ fontSize: '0.85rem', width: 'auto', marginTop: 0 }}>
                                <FaPlus className="me-1" /> Nueva
                            </Button>
                        </Link>
                    </div>

                    {/* List View */}
                    {messages.length === 0 ? (
                        <div className="text-center py-4">
                            <FaEnvelope className="text-white opacity-50 display-4 mb-3" />
                            <h5 className="text-white">Sin mensajes</h5>
                            <p className="small text-white-50">Tus consultas aparecerán aquí.</p>
                        </div>
                    ) : (
                        <div className="d-flex flex-column gap-2">
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    onClick={() => handleShow(msg)}
                                    className="inputs d-flex align-items-center justify-content-between p-3 mb-2"
                                    style={{ cursor: 'pointer', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)' }}
                                >
                                    <div className="d-flex align-items-center overflow-hidden me-2" style={{ flex: 1, minWidth: 0 }}>
                                        <div className="flex-shrink-0 me-3">
                                            {msg.status === 'answered' ? (
                                                <FaCheckCircle className="text-success" size={20} />
                                            ) : (
                                                <FaClock className="text-warning" size={20} />
                                            )}
                                        </div>
                                        <div className="text-truncate" style={{ minWidth: 0 }}>
                                            <h6 className="mb-0 text-white text-truncate" style={{ fontSize: '0.95rem' }}>{msg.asunto}</h6>
                                            <small className="text-white-50 d-block text-truncate" style={{ fontSize: '0.75rem' }}>
                                                {msg.fecha ? new Date(msg.fecha).toLocaleDateString() : ''}
                                            </small>
                                        </div>
                                    </div>
                                    <FaChevronRight className="text-white-50 flex-shrink-0" size={14} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Detail Modal - Fullscreen mobile */}
            <Modal
                show={showModal}
                onHide={handleClose}
                centered
                fullscreen={true}
                className="mobile-inbox-modal"
                contentClassName="bg-dark text-white" // Dark theme for modal to match
            >
                <Modal.Header className="border-bottom border-secondary border-opacity-25" closeButton closeVariant="white">
                    <div className="d-flex align-items-center gap-2">
                        <Badge bg={selectedMsg?.status === 'answered' ? 'success' : 'warning'} text={selectedMsg?.status === 'answered' ? 'light' : 'dark'}>
                            {selectedMsg?.status === 'answered' ? 'Resuelto' : 'Pendiente'}
                        </Badge>
                    </div>
                </Modal.Header>
                <Modal.Body className="bg-dark text-white pt-4">
                    {selectedMsg && (
                        <div className="d-flex flex-column gap-4">
                            {/* Subject */}
                            <div>
                                <small className="text-secondary fw-bold d-block mb-1" style={{ fontSize: '0.7rem' }}>ASUNTO</small>
                                <h4 className="fw-bold text-white text-break">{selectedMsg.asunto}</h4>
                                <small className="text-white-50">
                                    {selectedMsg.fecha ? new Date(selectedMsg.fecha).toLocaleString() : ''}
                                </small>
                            </div>

                            {/* User Message */}
                            <div className="p-3 rounded-3" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                <small className="text-info fw-bold d-block mb-2" style={{ fontSize: '0.7rem' }}>TU MENSAJE</small>
                                <p className="text-white-50 mb-0 text-break fst-italic">
                                    "{selectedMsg.mensaje}"
                                </p>
                            </div>

                            {/* Admin Reply */}
                            {selectedMsg.reply ? (
                                <div className="p-3 rounded-3" style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                                    <div className="d-flex align-items-center mb-2 text-success">
                                        <FaReply className="me-2" />
                                        <span className="fw-bold small">RESPUESTA ADMIN</span>
                                    </div>
                                    <p className="text-white mb-2 text-break">
                                        {selectedMsg.reply}
                                    </p>
                                    <div className="text-end border-top border-success border-opacity-25 pt-2 mt-2">
                                        <small className="text-success text-opacity-75" style={{ fontSize: '0.7rem' }}>
                                            {selectedMsg.replyDate ? new Date(selectedMsg.replyDate).toLocaleString() : 'Reciente'}
                                        </small>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-4 rounded-3 text-white-50 border border-dashed border-secondary">
                                    <small>Esperando respuesta...</small>
                                </div>
                            )}
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer className="border-top border-secondary border-opacity-25 justify-content-center">
                    <Button variant="outline-light" onClick={handleClose} className="rounded-pill px-5">
                        Cerrar
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default UserInboxMobile;
