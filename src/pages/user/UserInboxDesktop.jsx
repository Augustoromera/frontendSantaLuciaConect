import React from 'react';
import { Badge } from 'react-bootstrap';
import { FaEnvelopeOpen, FaEnvelope, FaReply, FaHourglassHalf } from 'react-icons/fa';
import '../styles/LoginRegistro.css'; // Import standard styles

const UserInboxDesktop = ({ messages }) => {
    return (
        <div className='d-flex justify-content-center align-items-center' style={{ paddingBottom: '3rem', paddingTop: '150px' }}>
            {/* Reuse Login Form Container Style for Consistency */}
            <div className='login-form-container' style={{ maxWidth: '800px', width: '90%' }}>
                <div className="w-100">
                    <div className="text-center mb-4">
                        <FaEnvelopeOpen className="text-warning display-4 mb-3" />
                        <h2 className='titulo-lr text-white mb-0'>Mis Consultas</h2>
                        <p className="text-white-50">Historial de mensajes</p>
                    </div>

                    {!messages || messages.length === 0 ? (
                        <div className="text-center py-5">
                            <FaEnvelope className="display-1 text-secondary mb-3 opacity-25" />
                            <h4 className="text-white">No has enviado ninguna consulta aún.</h4>
                            <p className="text-white-50">Tus mensajes aparecerán aquí.</p>
                        </div>
                    ) : (
                        <div className="d-flex flex-column gap-3" style={{ maxHeight: '600px', overflowY: 'auto', paddingRight: '10px' }}>
                            {messages.map((msg) => (
                                <div key={msg.id} className="p-3 rounded mb-3" style={{ backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                    {/* Header */}
                                    <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom border-secondary border-opacity-25">
                                        <div className="d-flex align-items-center gap-2">
                                            {msg.status === 'answered' ? (
                                                <Badge bg="success" className="rounded-pill">Respondido</Badge>
                                            ) : (
                                                <Badge bg="warning" text="dark" className="rounded-pill">Pendiente</Badge>
                                            )}
                                            <span className="fw-bold text-white text-truncate" style={{ maxWidth: '300px' }}>
                                                {msg.asunto || 'Consulta'}
                                            </span>
                                        </div>
                                        <small className="text-white-50">
                                            {msg.fecha ? new Date(msg.fecha).toLocaleDateString() : ''}
                                        </small>
                                    </div>

                                    {/* Content */}
                                    <div className="mb-3">
                                        <div className="d-flex align-items-start mb-2">
                                            <span className="badge bg-primary me-2 mt-1">Tú</span>
                                            <p className="text-white-50 mb-0 fst-italic" style={{ wordBreak: 'break-word' }}>
                                                "{msg.mensaje}"
                                            </p>
                                        </div>
                                    </div>

                                    {/* Reply */}
                                    {msg.reply ? (
                                        <div className="p-3 rounded mt-3" style={{ backgroundColor: 'rgba(25, 135, 84, 0.15)', borderLeft: '4px solid #198754' }}>
                                            <div className="d-flex align-items-center mb-2 text-success">
                                                <FaReply className="me-2" />
                                                <strong className="small text-uppercase">Respuesta de Soporte</strong>
                                            </div>
                                            <p className="text-white mb-0" style={{ whiteSpace: 'pre-wrap' }}>{msg.reply}</p>
                                            <div className="text-end mt-2">
                                                <small className="text-white-50" style={{ fontSize: '0.75rem' }}>
                                                    {msg.replyDate ? new Date(msg.replyDate).toLocaleString() : ''}
                                                </small>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="p-2 rounded mt-3 text-center border border-dashed border-secondary text-white-50 small">
                                            <FaHourglassHalf className="me-1" /> Esperando respuesta...
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Custom Scrollbar for this component */}
            <style>{`
                .login-form-container {
                    background: rgba(30, 30, 30, 0.6);
                    backdrop-filter: blur(10px);
                    border-radius: 20px;
                    padding: 40px;
                    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
                    border: 1px solid rgba(255, 255, 255, 0.18);
                }
                ::-webkit-scrollbar {
                    width: 8px;
                }
                ::-webkit-scrollbar-track {
                    background: rgba(0,0,0,0.1); 
                }
                ::-webkit-scrollbar-thumb {
                    background: rgba(255,255,255,0.2); 
                    border-radius: 4px;
                }
                ::-webkit-scrollbar-thumb:hover {
                    background: rgba(255,255,255,0.3); 
                }
            `}</style>
        </div>
    );
};

export default UserInboxDesktop;
