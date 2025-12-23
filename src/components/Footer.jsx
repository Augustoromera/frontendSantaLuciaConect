import React from 'react'
import { Link, useLocation } from 'react-router-dom';
import { FaFacebook, FaInstagram, FaMapMarkerAlt, FaEnvelope } from 'react-icons/fa';
import "../pages/styles/footer.css"
import logofooter from "../assets/images/nuevo-logo/logo.png"

export const Footer = () => {
    const currentYear = new Date().getFullYear();
    const location = useLocation();

    const getLinkStyle = (path) => {
        return location.pathname === path ? { color: '#ffc107', fontWeight: 'bold' } : {};
    };
    return (
        <footer className="pie-pagina">
            <div className="grupo-1">
                <div className="box">
                    <figure>
                        <Link to="/">
                            <img src={logofooter} alt="Logo Transporte Santa Lucia" className="footer-logo" />
                        </Link>
                    </figure>
                    <p className="footer-description">
                        Conectando destinos con seguridad y confort desde hace más de 30 años.
                        Tu viaje, nuestro compromiso.
                    </p>
                </div>
                <div className="box">
                    <h2>NAVEGACIÓN</h2>
                    <nav className="footer-nav">
                        <Link to="/" className="footer-link" style={getLinkStyle('/')}>Inicio</Link>
                        <Link to="/paneldehorarios" className="footer-link" style={getLinkStyle('/paneldehorarios')}>Horarios</Link>
                        <Link to="/contact" className="footer-link" style={getLinkStyle('/contact')}>Contacto</Link>
                        <Link to="/historia" className="footer-link" style={getLinkStyle('/historia')}>Historia</Link>
                        <Link to="/aboutus" className="footer-link" style={getLinkStyle('/aboutus')}>Nuestros Productos</Link>
                    </nav>
                </div>
                <div className="box">
                    <h2>CONTÁCTANOS</h2>
                    <div className="contact-info">
                        <p><FaMapMarkerAlt className="icon-small" /> Belgrano 348 Monteros, Tucumán</p>
                        <p><FaEnvelope className="icon-small" /> contacto@santalucia.com</p>
                    </div>
                    <div className="red-social">
                        <a href="https://www.facebook.com/share/1Bm2g81i2k/" className="social-icon" target='_blank' rel="noreferrer">
                            <FaFacebook />
                        </a>
                        <a href="https://www.instagram.com/" className="social-icon" target='_blank' rel="noreferrer">
                            <FaInstagram />
                        </a>
                    </div>
                </div>
            </div>
            <div className="grupo-2">
                <small>&copy; {currentYear} <b>Transporte Santa Lucia</b>. Todos los Derechos Reservados. <br />
                    <a href="#" className="developer-link">Desarrollado por estudiantes de UTN-FRT</a></small>
            </div>
        </footer>
    )
}
