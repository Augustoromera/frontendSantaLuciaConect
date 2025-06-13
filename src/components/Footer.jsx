import React from 'react'
import "../pages/styles/footer.css"
import logofooter from "../assets/images/logo/logoFooter.png"
export const Footer = () => {
    const currentYear = new Date().getFullYear();
    return (
        <>            <footer className="pie-pagina">
        <div className="grupo-1">
            <div className="box">
                <figure>
                    <a href="#">
                        <img src={logofooter} alt="Logo Transporte Rápido" style={{ height: "100px", width: "100px" }}/>
                    </a>
                </figure>
            </div>
            <div className="box">
                <h2>SOBRE NOSOTROS</h2>
                <p>
                    Con más de 30 años conectando destinos, ofrecemos viajes seguros y confortables. Nuestra flota moderna y conductores profesionales garantizan tu tranquilidad en cada recorrido. Tu viaje, nuestro compromiso.
                </p>
            </div>
            <div className="box">
                <h2>SÍGUENOS</h2>
                <div className="red-social logosRedSocial">
                    <a href="https://www.facebook.com/" className="fa fa-facebook" target='_blank'></a>
                    <a href="https://www.instagram.com/" className="fa fa-instagram" target='_blank'></a>
                    <a href="https://twitter.com/?lang=es" className="fa fa-twitter" target='_blank'></a>
                    <a href="https://www.youtube.com/" className="fa fa-youtube" target='_blank'></a>
                </div>
            </div>
        </div>
        <div className="grupo-2">
            <small>&copy; {currentYear} <b>Transporte Santa Lucia</b> - Todos los Derechos Reservados.</small>
        </div>
    </footer>
        </>
    )
}
