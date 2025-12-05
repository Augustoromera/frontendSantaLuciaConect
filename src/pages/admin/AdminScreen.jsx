import React, { useEffect, useState } from 'react';
import Header from '../../components/Header';
import '../styles/adminscreen.css';
import { useAuth } from '../../context/AuthContext';
import { getAuthToken } from '../../api/auth';
import { Footer } from '../../components/Footer';
import pruebaApi from '../../api/pruebaApi';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/adminHorarios.css';
import AdminContactScreen from './AdminContactScreen';

// New Components
import { AdminSidebar } from './components/AdminSidebar';
import { UserManagement } from './components/UserManagement';
import { ScheduleManagement } from './components/ScheduleManagement';

export const AdminScreen = () => {
    const { user } = useAuth();
    const [activeSection, setActiveSection] = useState('usuarios');
    const [cargarUsuarios, setCargarUsuarios] = useState([]);

    const cargarUserDB = async () => {
        try {
            const resp = await pruebaApi.get('/api/admin-page/listarUsuarios', {
                withCredentials: true,
                headers: {
                    Authorization: `Bearer ${getAuthToken()}`,
                    User: JSON.stringify(user),
                },
            });
            setCargarUsuarios(resp.data.usuarios);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        cargarUserDB();
    }, []);

    // Helper to refresh users from the child component
    const handleRecargarUsuarios = () => {
        cargarUserDB();
        // Force refresh via window reload if deep state issues persist, 
        // buy ideally we just re-fetch. Use existing logic:
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    };

    return (
        <div className="admin-layout-wrapper">
            {/* Header Global */}
            <Header />

            <div className="admin-dashboard-container">
                {/* Sidebar Navigation */}
                <AdminSidebar activeSection={activeSection} setActiveSection={setActiveSection} />

                {/* Main Content Area */}
                <main className="admin-main-content">
                    {activeSection === 'usuarios' && (
                        <UserManagement
                            cargarUsuarios={cargarUsuarios}
                            recargarUsuarios={handleRecargarUsuarios}
                        />
                    )}

                    {activeSection === 'horarios' && (
                        <ScheduleManagement />
                    )}

                    {activeSection === 'unidades' && (
                        <div className="placeholder-section">
                            <h3>Gestión de Unidades y Choferes</h3>
                            <p>Funcionalidad en desarrollo...</p>
                        </div>
                    )}

                    {activeSection === 'contacto' && (
                        <div className="contact-section-wrapper">
                            <h3>Contacto y Soporte</h3>
                            <AdminContactScreen />
                        </div>
                    )}
                </main>
            </div>

            {/* Footer Global */}
            <div className="admin-footer-wrapper">
                <Footer />
            </div>
        </div>
    );
};