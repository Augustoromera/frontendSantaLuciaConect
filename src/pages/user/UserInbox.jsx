import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/Header';
import { Footer } from '../../components/Footer';
import { FaEnvelopeOpen, FaEnvelope, FaReply } from 'react-icons/fa';
import { Accordion, Badge, Card, Container, Spinner } from 'react-bootstrap';

const UserInbox = () => {
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user || !user.email) {
            setLoading(false);
            return;
        }

        // Query messages where 'email' matches user's email
        // Note: This relies on user.email. If user registered via Google, it's reliable.
        // If users can change email, simpler to store uid on message creation, but ContactForm used email.
        const q = query(collection(db, 'contacts'), where('email', '==', user.email));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
            // Sort by date desc
            msgs.sort((a, b) => new Date(b.fecha || 0) - new Date(a.fecha || 0));
            setMessages(msgs);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching inbox:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    if (loading) return (
        <>
            <Header />
            <Container className="d-flex justify-content-center align-items-center py-5" style={{ minHeight: '60vh' }}>
                <Spinner animation="border" variant="primary" />
            </Container>
            <Footer />
        </>
    );

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header />
            <Container className="flex-grow-1 py-5">
                <h2 className="mb-4 text-center fw-bold text-white display-5">
                    <FaEnvelopeOpen className="me-3 text-warning" />
                    Mis Consultas
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
                                            <span className="fw-bold text-truncate" style={{ maxWidth: '200px', color: '#fff' }}>
                                                {msg.asunto}
                                            </span>
                                        </div>
                                        <small className="text-muted">
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
            </Container>
            <Footer />
            <style jsx>{`
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
        </div>
    );
};

// Simple icon import fix if missing
import { FaHourglassHalf } from 'react-icons/fa';

export default UserInbox;
