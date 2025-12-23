import React from 'react';
import { Accordion, Badge, Card, Container } from 'react-bootstrap';
import { FaEnvelopeOpen, FaEnvelope, FaReply, FaHourglassHalf } from 'react-icons/fa';

const UserInboxDesktop = ({ messages }) => {
    return (
        <Container className="py-5">
            <h2 className="mb-4 text-center fw-bold text-white display-5">
                <FaEnvelopeOpen className="me-3 text-warning" />
                Mis Consultas (Escritorio)
            </h2>

            {messages.length === 0 ? (
                <Card className="text-center p-5 bg-dark text-white border-secondary shadow">
                    <Card.Body>
                        <FaEnvelope className="display-4 text-secondary mb-3" />
                        <h4>No has enviado ninguna consulta aún.</h4>
                        <p className="text-white-50">Cuando nos envíes un mensaje desde Contacto, aparecerá aquí.</p>
                    </Card.Body>
                </Card>
            ) : (
                <Accordion defaultActiveKey="0" className="shadow-sm">
                    {messages.map((msg, index) => (
                        <Accordion.Item eventKey={index.toString()} key={msg.id} className="bg-dark border-secondary mb-3 rounded overflow-hidden">
                            <Accordion.Header>
                                <div className="d-flex w-100 justify-content-between align-items-center me-3">
                                    <div className="d-flex align-items-center">
                                        {msg.status === 'answered' ? (
                                            <Badge bg="success" className="me-3">Respondido</Badge>
                                        ) : (
                                            <Badge bg="warning" text="dark" className="me-3">Pendiente</Badge>
                                        )}
                                        <span className="fw-bold text-white text-truncate" style={{ maxWidth: '400px' }}>
                                            {msg.asunto}
                                        </span>
                                    </div>
                                    <small className="text-white-50">
                                        {msg.fecha ? new Date(msg.fecha).toLocaleDateString() : ''}
                                    </small>
                                </div>
                            </Accordion.Header>
                            <Accordion.Body className="bg-secondary bg-opacity-10 text-white">
                                <div className="mb-3">
                                    <label className="text-white-50 small text-uppercase fw-bold">Tu Mensaje:</label>
                                    <p className="border-start border-3 border-light ps-3 fst-italic text-break" style={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
                                        "{msg.mensaje}"
                                    </p>
                                </div>

                                {msg.reply && (
                                    <div className="mt-4 p-3 bg-dark rounded border border-success position-relative">
                                        <div className="position-absolute top-0 start-0 translate-middle-y ms-3 badge bg-success shadow-sm">
                                            <FaReply className="me-1" /> Respuesta de Admin
                                        </div>
                                        <p className="mb-0 mt-2 text-white text-break" style={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
                                            {msg.reply}
                                        </p>
                                        {msg.replyDate && (
                                            <div className="text-end mt-2">
                                                <small className="text-white-50" style={{ fontSize: '0.75rem' }}>
                                                    {new Date(msg.replyDate).toLocaleString()}
                                                </small>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {!msg.reply && (
                                    <div className="text-center py-3 text-white-50">
                                        <small><FaHourglassHalf className="me-1" /> Esperando respuesta del administrador...</small>
                                    </div>
                                )}
                            </Accordion.Body>
                        </Accordion.Item>
                    ))}
                </Accordion>
            )}
            <style>{`
                .accordion-button {
                    background-color: #212529 !important;
                    color: white !important;
                }
                .accordion-button:not(.collapsed) {
                    background-color: #1a1e21 !important;
                    color: #ffc107 !important;
                    box-shadow: none;
                }
                .accordion-button::after {
                    filter: invert(1);
                }
            `}</style>
        </Container>
    );
};

export default UserInboxDesktop;
