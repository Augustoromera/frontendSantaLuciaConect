import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};

export const NotificationProvider = ({ children }) => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    // Key format: `read_notifs_${user.uid}`
    const getLocalState = () => {
        if (!user) return { read: [], deleted: [] };
        const read = JSON.parse(localStorage.getItem(`read_notifs_${user.uid}`) || '[]');
        const deleted = JSON.parse(localStorage.getItem(`deleted_notifs_${user.uid}`) || '[]');
        return { read, deleted };
    };

    // Calculate unread count from a list and local state
    const calcUnread = (list, readIds, deletedIds) => {
        return list.filter(n => !readIds.includes(n.id) && !deletedIds.includes(n.id)).length;
    };

    useEffect(() => {
        if (!user) {
            setNotifications([]);
            setUnreadCount(0);
            return;
        }

        const q = query(collection(db, 'notifications'), orderBy('date', 'desc'), limit(20));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const { read, deleted } = getLocalState();

            const fetchedNotifs = snapshot.docs
                .map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    date: doc.data().date?.toDate()
                }))
                .filter(n => !deleted.includes(n.id)); // Filter out locally deleted in the main list too

            setNotifications(fetchedNotifs);
            setUnreadCount(calcUnread(fetchedNotifs, read, deleted));
        });

        return () => unsubscribe();
    }, [user]);

    const markAsRead = (id) => {
        if (!user) return;
        const { read, deleted } = getLocalState();

        if (!read.includes(id)) {
            const newRead = [...read, id];
            localStorage.setItem(`read_notifs_${user.uid}`, JSON.stringify(newRead));

            // Update state immediately
            setUnreadCount(prev => Math.max(0, prev - 1));
        }
    };

    const deleteNotification = (id) => {
        if (!user) return;
        const { read, deleted } = getLocalState();

        if (!deleted.includes(id)) {
            const newDeleted = [...deleted, id];
            localStorage.setItem(`deleted_notifs_${user.uid}`, JSON.stringify(newDeleted));

            // Remove from list & update unread
            const newNotifs = notifications.filter(n => n.id !== id);
            setNotifications(newNotifs);

            // Recalculate unread based on new list (since the deleted one might have been unread)
            // But to be safe/simple, just re-calc full
            const { read: currentRead } = getLocalState(); // fetch fresh read list if needed, but 'read' var is fine
            setUnreadCount(calcUnread(newNotifs, currentRead, newDeleted));
        }
    };

    const isNotificationRead = (id) => {
        const { read } = getLocalState();
        return read.includes(id);
    }

    return (
        <NotificationContext.Provider value={{
            notifications,
            unreadCount,
            markAsRead,
            deleteNotification,
            isNotificationRead
        }}>
            {children}
        </NotificationContext.Provider>
    );
};
