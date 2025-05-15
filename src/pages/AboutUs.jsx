import React from 'react';
import './styles/about.css';
import 'font-awesome/css/font-awesome.min.css';
import ImagenPaulo from '../assets/images/profiles/yo.jpeg';
import ImagenAugusto from '../assets/images/profiles/Augusto.jpeg';
import ImagenNicolas from '../assets/images/profiles/Nico.jpeg';
import ImagenSantiago from '../assets/images/profiles/Santiago.jpg';
import Header from '../components/Header';
import { Footer } from '../components/Footer';


export const AboutUs = () => {

    const imgPaulo = ImagenPaulo;
    const imgAugusto = ImagenAugusto;
    const imgNico = ImagenNicolas;
    const imgSantiago = ImagenSantiago;


    return (
        <>
            <Header />
            <div className="container-aboutus">
                <h1 className='title-nosotros'>Nuestro servicios</h1>
                <div className="container-cardsA">
                    <div className="cardA">
                        <div className="cover-card">
                            <img src={imgPaulo} alt="" className='imgAbout' />
                        </div>
                        <h2>Viajes Interurbanos</h2>
                        <p className="p-espacio1">Conectamos ciudades con flotas modernas y seguras. Ofrecemos salidas programadas durante todo el día, permitiendo elegir la opción más conveniente según tu agenda. Nuestra red de rutas cubre localidades estratégicas como Acheral, Santa Lucía, Maldonado y más. Ideal para quienes necesitan traslados confiables entre poblaciones. </p>
                     
                        <hr />
                        <div className="footer-card">
                        <h3 className="user-name"> TRSL SRL</h3>
                            <i>2025</i>
                        </div>
                    </div>
                    <div className="cardA">
                        <div className="cover-card">
                            <img src={imgAugusto} alt="Augusto, integrante del grupo"  className='imgAbout'/>
                        </div>
                        <h2>Abonos Mensuales</h2>
                        <p className="p-espacio2">Sistema digital pensado especialmente para empresas, instituciones educativas y organizaciones que requieren movilidad regular y segura. Ofrecemos planes personalizados con descuentos por volumen, gestión de reservas online, cancelación flexible y seguimiento en tiempo real del estado del viaje. Facilita el traslado de empleados, estudiantes o grupos bajo un mismo plan. </p>
                       
                        <hr />
                        <div className="footer-card">
                        <h3 className="user-name"> TRSL SRL</h3>
                            <i>2025</i>
                        </div>
                    </div>
                    <div className="cardA">
                        <div className="cover-card">
                            <img src={imgNico} alt="Nicolas, integrante del grupo"  className='imgAbout'/>
                        </div>
                        <h2>Viajes Especiales a Pedido</h2>
                        <p className="p-espacio3">Diseñamos trayectos exclusivos según tus necesidades: eventos privados, excursiones grupales, transporte hacia zonas no convencionales o itinerarios personalizados. Ideal para empresas, escuelas, iglesias o cualquier grupo que necesite movilidad fuera de las rutas tradicionales. Consulta disponibilidad y cotiza tu recorrido único.</p>
                      
                        <hr />
                        <div className="footer-card">
                        <h3 className="user-name"> TRSL SRL</h3>
                            <i>2025</i>
                        </div>
                    </div>
                    <div className="cardA">
                        <div className="cover-card">
                            <img src={imgSantiago} alt="Santiago, integrante del grupo." className='imgAbout' />
                        </div>
                        <h2>Boleto Estudiantil y Beneficios Sociales</h2>
                        <p className="p-espacio5">Programa especial diseñado para estudiantes, jubilados y personas pertenecientes a sectores vulnerables. A través del registro en nuestra plataforma, estos grupos acceden a descuentos significativos en pasajes urbanos e interurbanos. Este servicio refuerza nuestro compromiso social, facilitando el acceso al transporte público sin afectar el bolsillo de quienes más lo necesitan. </p>
                        
                        <hr />
                        <div className="footer-card">
                            <h3 className="user-name"> TRSL SRL</h3>
                            <i>2025</i>
                        </div>
                    </div>
                </div>
            </div>
            <Footer className="footer-container" />

        </>
    )
};
