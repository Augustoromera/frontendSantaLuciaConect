import React, { useState } from 'react';
import { Badge, Container, Button, Modal, ListGroup } from 'react-bootstrap';
import { FaEnvelope, FaClock, FaCheckCircle, FaReply, FaPlus, FaChevronRight, FaTimes } from 'react-icons/fa';
import { Link } from 'react-router-dom';

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
        <div style={{
            background: '#f8f9fa', // Light, clean background for the list
            minHeight: '100vh',
            paddingTop: '100px',
            paddingBottom: '100px',
            position: 'relative',
            zIndex: 1
        }}>
            {/* Main Header */}
            <Container className="mb-3">
                <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
                    <h2 className="fw-bold text-dark m-0 fs-4">Mis Consultas</h2>
                    <Link to="/contact">
                        <Button variant="primary" size="sm" className="rounded-pill shadow-sm">
                            <FaPlus className="me-1" /> Nueva
                        </Button>
                    </Link>
                </div>
                <p className="text-secondary small mb-2">Toca una consulta para ver los detalles.</p>
            </Container>

            {/* List View */}
            <Container className="px-3">
                {messages.length === 0 ? (
                    <div className="text-center py-5">
                        <FaEnvelope className="text-secondary opacity-25 display-2 mb-3" />
                        <h5 className="text-secondary">Sin mensajes</h5>
                        <p className="small text-muted">Aún no tienes consultas registradas.</p>
                    </div>
                ) : (
                    <ListGroup variant="flush" className="rounded-4 shadow-sm overflow-hidden bg-white">
                        {messages.map((msg) => (
                            <ListGroup.Item
                                key={msg.id}
                                action
                                onClick={() => handleShow(msg)}
                                className="p-3 border-bottom d-flex align-items-center justify-content-between"
                                style={{ cursor: 'pointer' }}
                            >
                                <div className="d-flex align-items-center overflow-hidden me-2">
                                    <div className="me-3">
                                        {msg.status === 'answered' ? (
                                            <div className="text-success bg-success bg-opacity-10 p-2 rounded-circle">
                                                <FaCheckCircle size={18} />
                                            </div>
                                        ) : (
                                            <div className="text-warning bg-warning bg-opacity-10 p-2 rounded-circle">
                                                <FaClock size={18} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-truncate">
                                        <h6 className="mb-0 fw-bold text-dark text-truncate">{msg.asunto}</h6>
                                        <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                                            {msg.fecha ? new Date(msg.fecha).toLocaleDateString() : ''}
                                        </small>
                                    </div>
                                </div>
                                <FaChevronRight className="text-light-gray" style={{ color: '#ced4da' }} />
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                )}
            </Container>

            {/* Detail Modal */}
            <Modal
                show={showModal}
                onHide={handleClose}
                centered
                fullscreen="md-down"
                className="mobile-inbox-modal"
            >
                <Modal.Header className="border-0 pb-0">
                    <div className="d-flex justify-content-between align-items-center w-100">
                        <Badge bg={selectedMsg?.status === 'answered' ? 'success' : 'warning'} text={selectedMsg?.status === 'answered' ? 'light' : 'dark'} pill>
                            {selectedMsg?.status === 'answered' ? 'Resuelto' : 'Pendiente'}
                        </Badge>
                        <Button variant="link" onClick={handleClose} className="text-dark p-0 text-decoration-none">
                            <FaTimes size={20} />
                        </Button>
                    </div>
                </Modal.Header>
                <Modal.Body className="pt-2">
                    {selectedMsg && (
                        <div className="d-flex flex-column gap-3">
                            {/* Subject */}
                            <div>
                                <small className="text-muted fw-bold d-block mb-1">ASUNTO</small>
                                <h4 className="fw-bold text-dark text-break">{selectedMsg.asunto}</h4>
                                <small className="text-secondary">
                                    Enviado el {selectedMsg.fecha ? new Date(selectedMsg.fecha).toLocaleDateString() : ''}
                                </small>
                            </div>

                            <hr className="my-1 border-secondary border-opacity-10" />

                            {/* User Message */}
                            <div className="bg-light p-3 rounded-3 border border-light">
                                <small className="text-muted fw-bold d-block mb-2 text-uppercase" style={{ fontSize: '0.7rem' }}>Tu Mensaje</small>
                                <p className="text-dark mb-0 text-break fst-italic" style={{ whiteSpace: 'pre-wrap' }}>
                                    "{selectedMsg.mensaje}"
                                </p>
                            </div>

                            {/* Admin Reply */}
                            {selectedMsg.reply ? (
                                <div className="bg-success bg-opacity-10 p-3 rounded-3 border border-success border-opacity-25">
                                    <div className="d-flex align-items-center mb-2 text-success">
                                        <FaReply className="me-2" />
                                        <small className="fw-bold text-uppercase" style={{ fontSize: '0.7rem' }}>Respuesta de Administración</small>
                                    </div>
                                    <p className="text-dark mb-0 text-break fw-medium" style={{ whiteSpace: 'pre-wrap' }}>
                                        {selectedMsg.reply}
                                    </p>
                                    <div className="text-end mt-2">
                                        <small className="text-success text-opacity-75" style={{ fontSize: '0.7rem' }}>
                                            {selectedMsg.replyDate ? new Date(selectedMsg.replyDate).toLocaleString() : ''}
                                        </small>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-4 bg-light rounded-3 border border-dashed">
                                    <small className="text-muted d-block mb-1">Esperando respuesta...</small>
                                    <div className="spinner-border spinner-border-sm text-secondary" role="status"></div>
                                </div>
                            )}
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer className="border-0 pt-0">
                    <Button variant="outline-secondary" size="sm" onClick={handleClose} className="w-100 rounded-pill">
                        Cerrar
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default UserInboxMobile;
