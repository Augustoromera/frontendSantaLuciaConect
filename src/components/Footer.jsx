import React from 'react'
import { Link } from 'react-router-dom';
import { FaFacebook, FaInstagram, FaMapMarkerAlt, FaEnvelope } from 'react-icons/fa';
import "../pages/styles/footer.css"
import logofooter from "../assets/images/logo/logoFooter.png"

export const Footer = () => {
    const currentYear = new Date().getFullYear();
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
                        <Link to="/" className="footer-link">Inicio</Link>
                        <Link to="/horarios" className="footer-link">Horarios</Link>
                        <Link to="/contacto" className="footer-link">Contacto</Link>
                        <Link to="/login" className="footer-link">Portal Admin</Link>
                    </nav>
                </div>
                <div className="box">
                    <h2>CONTÁCTANOS</h2>
                    <div className="contact-info">
                        <p><FaMapMarkerAlt className="icon-small" /> Gral Paz 576, San Miguel de Tucumán</p>
                        <p><FaEnvelope className="icon-small" /> contacto@santalucia.com</p>
                    </div>
                    <div className="red-social">
                        <a href="https://www.facebook.com/" className="social-icon" target='_blank' rel="noreferrer">
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
