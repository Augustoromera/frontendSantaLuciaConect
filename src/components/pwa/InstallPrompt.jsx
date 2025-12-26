import React, { useEffect, useState } from 'react';
import { FaDownload } from 'react-icons/fa';
import '../../pages/styles/footer.css'; // Corrected path from src/components/pwa/ to src/pages/styles/

const InstallPrompt = () => {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handler = (e) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            // Stash the event so it can be triggered later.
            setDeferredPrompt(e);
            // Update UI notify the user they can install the PWA
            setIsVisible(true);
        };

        window.addEventListener('beforeinstallprompt', handler);

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        // Show the install prompt
        deferredPrompt.prompt();

        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response to the install prompt: ${outcome}`);

        // We've used the prompt, so clearing it is correct.
        setDeferredPrompt(null);
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <button
            onClick={handleInstallClick}
            className="btn btn-primary d-flex align-items-center gap-2"
            style={{
                position: 'fixed',
                bottom: '20px',
                right: '20px',
                zIndex: 1000,
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                borderRadius: '50px',
                padding: '12px 24px',
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%)',
                border: 'none'
            }}
        >
            <FaDownload />
            Instalar App
        </button>
    );
};

export default InstallPrompt;
