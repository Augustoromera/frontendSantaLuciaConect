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
                contentClassName="bg-dark text-white"
                style={{ zIndex: 1060 }}
            >
                {/* Header */}
                <Modal.Header
                    className="border-bottom border-secondary border-opacity-25"
                    closeButton
                    closeVariant="white"
                    style={{ backgroundColor: '#1a1a2e' }}
                >
                    <Modal.Title className="h5 mb-0 fw-bold">Detalle de Consulta</Modal.Title>
                </Modal.Header>

                <Modal.Body className="p-0" style={{ backgroundColor: '#1a1a2e' }}>
                    {selectedMsg && (
                        <div className="d-flex flex-column h-100">
                            {/* Scrollable Content Area */}
                            <div className="flex-grow-1 overflow-auto p-3">

                                {/* Status & Info Card */}
                                <div className="p-3 mb-4 rounded-3" style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                        <Badge
                                            bg={selectedMsg?.status === 'answered' ? 'success' : 'warning'}
                                            text={selectedMsg?.status === 'answered' ? 'light' : 'dark'}
                                            className="px-3 py-2 rounded-pill"
                                        >
                                            {selectedMsg?.status === 'answered' ? 'Resuelto' : 'Pendiente'}
                                        </Badge>
                                        <small className="text-white-50 d-flex align-items-center gap-1">
                                            <FaClock size={10} />
                                            {selectedMsg.fecha ? new Date(selectedMsg.fecha).toLocaleDateString() : ''}
                                        </small>
                                    </div>
                                    <h5 className="fw-bold text-white mb-1 text-break">{selectedMsg.asunto}</h5>
                                </div>

                                {/* Messages Section */}
                                <div className="d-flex flex-column gap-3">

                                    {/* User Message - Distinct Bubble */}
                                    <div className="d-flex flex-column mb-2">
                                        <div className="ps-2 mb-1">
                                            <small className="text-secondary fw-bold" style={{ fontSize: '0.75rem' }}>TU MENSAJE</small>
                                        </div>
                                        <div
                                            className="p-3 text-white"
                                            style={{
                                                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                                                borderRadius: '4px 20px 20px 20px',
                                                borderLeft: '4px solid #0d6efd',
                                                boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                                            }}
                                        >
                                            <p className="mb-0 text-break" style={{ fontSize: '0.95rem', lineHeight: '1.5' }}>
                                                {selectedMsg.mensaje}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Divider */}
                                    {selectedMsg.reply && (
                                        <div className="d-flex align-items-center my-2">
                                            <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255,255,255,0.1)' }}></div>
                                            <div className="px-2 text-white-50"><FaReply size={12} /></div>
                                            <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255,255,255,0.1)' }}></div>
                                        </div>
                                    )}

                                    {/* Admin Reply - Distinct Bubble */}
                                    {selectedMsg.reply ? (
                                        <div className="d-flex flex-column">
                                            <div className="pe-2 mb-1 text-end">
                                                <small className="text-success fw-bold" style={{ fontSize: '0.75rem' }}>ADMINISTRACIÓN</small>
                                            </div>
                                            <div
                                                className="p-3 text-white"
                                                style={{
                                                    backgroundColor: 'rgba(25, 135, 84, 0.15)',
                                                    borderRadius: '20px 4px 20px 20px',
                                                    borderRight: '4px solid #198754',
                                                    boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                                                }}
                                            >
                                                <p className="mb-2 text-break" style={{ fontSize: '0.95rem', lineHeight: '1.5' }}>
                                                    {selectedMsg.reply}
                                                </p>
                                                <div className="text-end">
                                                    <small className="text-success text-opacity-75" style={{ fontSize: '0.7rem' }}>
                                                        {selectedMsg.replyDate ? new Date(selectedMsg.replyDate).toLocaleString() : 'Reciente'}
                                                    </small>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="mt-3 p-4 text-center rounded-3 bg-dark border border-secondary border-opacity-25">
                                            <small className="text-white-50">Esperando respuesta del administrador...</small>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </Modal.Body>
                {/* No Footer needed - Close button is in header */}
            </Modal>
            <style>{`
                /* Custom Smooth Transition for Modal */
                .mobile-inbox-modal .modal-dialog {
                    transition: transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) !important;
                }
                .mobile-inbox-modal.fade .modal-dialog {
                    transform: translate(0, 100%);
                }
                .mobile-inbox-modal.show .modal-dialog {
                    transform: translate(0, 0);
                }
                
                @media (max-width: 768px) {
                    body {
                        background-image: none !important;
                        background-color: #1a1a2e !important;
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
        </div>
    );
};

export default UserInboxMobile;
