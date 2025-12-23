import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/Header';
import { Footer } from '../../components/Footer';
import { Container, Spinner } from 'react-bootstrap';

// Import split components
import UserInboxDesktop from './UserInboxDesktop';
import UserInboxMobile from './UserInboxMobile';

const UserInbox = () => {
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user || !user.email) {
            setLoading(false);
            return;
        }

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

            {/* Desktop View */}
            <div className="d-none d-lg-block flex-grow-1">
                <UserInboxDesktop messages={messages} />
            </div>

            {/* Mobile View */}
            <div className="d-lg-none">
                <UserInboxMobile messages={messages} />
            </div>

            <Footer />
        </div>
    );
};

export default UserInbox;

