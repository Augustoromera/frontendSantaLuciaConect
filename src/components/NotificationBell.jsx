import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { FaBell, FaTrash, FaCheck, FaExclamationCircle, FaInfoCircle } from 'react-icons/fa';
import { Badge, Button, Offcanvas, ListGroup } from 'react-bootstrap';

const NotificationBell = () => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showOffcanvas, setShowOffcanvas] = useState(false);

    // Load read/deleted state from LocalStorage to avoid heavy DB writes for "read" status on global notifications
    // Key format: `read_notifs_${user.uid}`
    const getLocalState = () => {
        if (!user) return { read: [], deleted: [] };
        const read = JSON.parse(localStorage.getItem(`read_notifs_${user.uid}`) || '[]');
        const deleted = JSON.parse(localStorage.getItem(`deleted_notifs_${user.uid}`) || '[]');
        return { read, deleted };
    };

    useEffect(() => {
        if (!user) return;

        const q = query(collection(db, 'notifications'), orderBy('date', 'desc'), limit(20));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const { read, deleted } = getLocalState();

            const fetchedNotifs = snapshot.docs
                .map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    date: doc.data().date?.toDate()
                }))
                .filter(n => !deleted.includes(n.id)); // Filter out locally deleted

            setNotifications(fetchedNotifs);

            // Calculate unread
            const unread = fetchedNotifs.filter(n => !read.includes(n.id)).length;
            setUnreadCount(unread);
        });

        return () => unsubscribe();
    }, [user]);

    const handleMarkAsRead = (id, e) => {
        e?.stopPropagation();
        const { read, deleted } = getLocalState();
        if (!read.includes(id)) {
            const newRead = [...read, id];
            localStorage.setItem(`read_notifs_${user.uid}`, JSON.stringify(newRead));

            // Force update local state
            setUnreadCount(prev => Math.max(0, prev - 1));
        }
    };

    const handleDelete = (id, e) => {
        e?.stopPropagation();
        const { read, deleted } = getLocalState();
        if (!deleted.includes(id)) {
            const newDeleted = [...deleted, id];
            localStorage.setItem(`deleted_notifs_${user.uid}`, JSON.stringify(newDeleted));

            // Remove from UI immediately
            setNotifications(prev => prev.filter(n => n.id !== id));
            if (!read.includes(id)) setUnreadCount(prev => Math.max(0, prev - 1));
        }
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
                                const { read } = getLocalState();
                                const isRead = read.includes(notif.id);

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
            </Offcanvas>

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
