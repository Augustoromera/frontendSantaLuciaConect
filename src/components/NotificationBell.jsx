import React, { useState } from 'react';
import { useNotifications } from '../context/NotificationContext';
import { FaBell, FaTrash, FaCheck, FaExclamationCircle, FaInfoCircle, FaEnvelope } from 'react-icons/fa';
import { Badge, Button, Offcanvas, ListGroup } from 'react-bootstrap';

const NotificationBell = () => {
    const { notifications, unreadCount, markAsRead, deleteNotification, isNotificationRead } = useNotifications();
    const [showOffcanvas, setShowOffcanvas] = useState(false);

    const handleMarkAsRead = (id, e) => {
        e?.stopPropagation();
        markAsRead(id);
    };

    const handleDelete = (id, e) => {
        e?.stopPropagation();
        deleteNotification(id);
    };

    const handleOpen = () => setShowOffcanvas(true);
    const handleClose = () => setShowOffcanvas(false);

    return (
        <>
            <div className="position-relative d-inline-block" style={{ cursor: 'pointer' }} onClick={handleOpen}>
                <FaBell className={`fs-5 ${unreadCount > 0 ? 'text-warning' : 'text-secondary'}`} />
                {unreadCount > 0 && (
                    <Badge
                        bg="danger"
                        pill
                        className="position-absolute top-0 start-100 translate-middle"
                        style={{ fontSize: '0.65rem' }}
                    >
                        {unreadCount}
                    </Badge>
                )}
            </div>

            <Offcanvas show={showOffcanvas} onHide={handleClose} placement="end" className="bg-dark text-white border-start border-secondary" style={{ maxWidth: '350px' }}>
                <Offcanvas.Header closeButton closeVariant="white" className="border-bottom border-secondary">
                    <Offcanvas.Title className="d-flex align-items-center">
                        <FaBell className="me-2 text-warning" /> Notificaciones
                    </Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body className="p-0">
                    {notifications.length > 0 ? (
                        <ListGroup variant="flush">
                            {notifications.map((notif) => {
                                const isRead = isNotificationRead(notif.id);

                                return (
                                    <ListGroup.Item
                                        key={notif.id}
                                        className="bg-dark text-white border-bottom border-secondary p-3 notification-item"
                                        style={{ backgroundColor: isRead ? 'transparent' : 'rgba(255, 193, 7, 0.05)' }}
                                        onClick={() => handleMarkAsRead(notif.id)}
                                    >
                                        <div className="d-flex w-100 justify-content-between align-items-start mb-1">
                                            <h6 className={`mb-0 ${!isRead ? 'fw-bold text-warning' : 'text-white'}`}>
                                                {!isRead && <FaExclamationCircle className="me-1" />}
                                                {notif.title}
                                            </h6>
                                            <small className="text-white-50 ms-2" style={{ fontSize: '0.75rem' }}>
                                                {notif.date ? notif.date.toLocaleDateString() : ''}
                                            </small>
                                        </div>
                                        <p className="mb-2 text-white-50 small" style={{ lineHeight: '1.4' }}>
                                            {notif.message}
                                        </p>
                                        <div className="d-flex justify-content-end gap-2">
                                            {!isRead && (
                                                <Button size="sm" variant="outline-success" className="py-0 px-2" style={{ fontSize: '0.75rem' }} onClick={(e) => handleMarkAsRead(notif.id, e)}>
                                                    <FaCheck className="me-1" /> Marcar leído
                                                </Button>
                                            )}
                                            <Button size="sm" variant="outline-danger" className="py-0 px-2" style={{ fontSize: '0.75rem' }} onClick={(e) => handleDelete(notif.id, e)}>
                                                <FaTrash />
                                            </Button>
                                        </div>
                                    </ListGroup.Item>
                                );
                            })}
                        </ListGroup>
                    ) : (
                        <div className="text-center py-5 text-white-50">
                            <FaInfoCircle className="mb-3 fs-1" />
                            <p>No tienes notificaciones nuevas.</p>
                        </div>
                    )}
                </Offcanvas.Body>

                {/* Footer with Mis Consultas Link */}
                <div className="p-3 border-top border-secondary bg-dark">
                    <Button
                        as="a"
                        href="/mis-consultas"
                        variant="outline-primary"
                        className="w-100 d-flex justify-content-center align-items-center"
                        onClick={handleClose}
                    >
                        <FaEnvelope className="me-2" /> Ir a Mis Consultas
                    </Button>
                </div>
            </Offcanvas >

            <style>{`
                .notification-item:hover {
                    background-color: rgba(255, 255, 255, 0.05) !important;
                    cursor: pointer;
                }
            `}</style>
        </>
    );
};

export default NotificationBell;
