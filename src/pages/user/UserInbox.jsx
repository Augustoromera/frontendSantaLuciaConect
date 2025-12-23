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

    // Simple width check to avoid hydration mismatch if using SSR, but here it's SPA
    // Better to stick to CSS classes but ensure parent has height
    return (
        <div className="d-flex flex-column" style={{ minHeight: '100vh' }}>
            <Header />

            <div className="flex-grow-1">
                {/* Desktop View - Hidden on xs, sm, md */}
                <div className="d-none d-lg-block h-100">
                    <UserInboxDesktop messages={messages} />
                </div>

                {/* Mobile View - Hidden on lg, xl, xxl */}
                <div className="d-lg-none h-100">
                    <UserInboxMobile messages={messages} />
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default UserInbox;

