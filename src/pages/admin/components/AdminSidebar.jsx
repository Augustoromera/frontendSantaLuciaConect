import React from 'react';
import { FaUser, FaClock, FaBus, FaEnvelope, FaSignOutAlt } from 'react-icons/fa';
import '../../styles/adminscreen.css';

export const AdminSidebar = ({ activeSection, setActiveSection }) => {
    return (
        <div className="admin-sidebar">
            <div className="sidebar-header">
                <h3>Admin Panel</h3>
            </div>
            <div className="sidebar-menu">
                <button
                    className={`sidebar-item ${activeSection === 'usuarios' ? 'active' : ''}`}
                    onClick={() => setActiveSection('usuarios')}
                >
                    <FaUser className="sidebar-icon" />
                    <span>Usuarios</span>
                </button>
                <button
                    className={`sidebar-item ${activeSection === 'horarios' ? 'active' : ''}`}
                    onClick={() => setActiveSection('horarios')}
                >
                    <FaClock className="sidebar-icon" />
                    <span>Horarios</span>
                </button>
                <button
                    className={`sidebar-item ${activeSection === 'unidades' ? 'active' : ''}`}
                    onClick={() => setActiveSection('unidades')}
                >
                    <FaBus className="sidebar-icon" />
                    <span>Unidades</span>
                </button>
                <button
                    className={`sidebar-item ${activeSection === 'contacto' ? 'active' : ''}`}
                    onClick={() => setActiveSection('contacto')}
                >
                    <FaEnvelope className="sidebar-icon" />
                    <span>Contacto</span>
                </button>
            </div>
            {/* <div className="sidebar-footer">
                <button className="sidebar-item logout">
                    <FaSignOutAlt className="sidebar-icon" />
                    <span>Salir</span>
                </button>
            </div> */}
        </div>
    );
};
