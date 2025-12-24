import React, { useState } from 'react';
import { useNotifications } from '../context/NotificationContext';
import { FaBell, FaTrash, FaCheck, FaExclamationCircle, FaInfoCircle, FaEnvelope } from 'react-icons/fa';
import { Badge, Button, Offcanvas, ListGroup } from 'react-bootstrap';
import {
    SwipeableList,
    SwipeableListItem,
    SwipeAction,
    TrailingActions,
} from 'react-swipeable-list';
import 'react-swipeable-list/dist/styles.css';

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
                        <div className="notification-list-container">
                            <div className="d-block d-md-none text-center text-white-50 py-2 small border-bottom border-secondary mb-0">
                                <small>Desliza hacia la izquierda para eliminar</small>
                            </div>
                            <SwipeableList>
                                {notifications.map((notif) => {
                                    const isRead = isNotificationRead(notif.id);

                                    const trailingActions = () => (
                                        <TrailingActions>
                                            <SwipeAction
                                                destructive={true}
                                                onClick={() => deleteNotification(notif.id)}
                                            >
                                                <div className="d-flex align-items-center justify-content-center bg-danger text-white h-100 w-100" style={{ minWidth: '80px' }}>
                                                    <FaTrash className="fs-4" />
                                                </div>
                                            </SwipeAction>
                                        </TrailingActions>
                                    );

                                    return (
                                        <SwipeableListItem
                                            key={notif.id}
                                            trailingActions={trailingActions()}
                                        >
                                            <div
                                                className="w-100 text-white border-bottom border-secondary p-3 notification-item"
                                                style={{
                                                    backgroundColor: isRead ? 'transparent' : 'rgba(255, 193, 7, 0.15)', // More visible yellow tint
                                                    cursor: 'pointer',
                                                    transition: 'background-color 0.5s ease' // Smooth fading animation
                                                }}
                                                onClick={() => markAsRead(notif.id)}
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

                                                    {/* Mobile usage implies swipe, but desktop might still need button. Keeping button for desktop/accessiblity, or we can hide it on mobile via CSS d-none d-md-block if desired. 
                                                        User asked for swipe on mobile. Keeping the button doesn't hurt. 
                                                    */}
                                                    <Button size="sm" variant="outline-danger" className="py-0 px-2 d-none d-md-block" style={{ fontSize: '0.75rem' }} onClick={(e) => { e.stopPropagation(); deleteNotification(notif.id); }}>
                                                        <FaTrash />
                                                    </Button>
                                                </div>
                                            </div>
                                        </SwipeableListItem>
                                    );
                                })}
                            </SwipeableList>
                        </div>
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
