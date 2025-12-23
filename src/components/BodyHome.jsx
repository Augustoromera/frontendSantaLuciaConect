import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../pages/styles/bodyHome.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart, faStoreSlash, faTruckFast } from '@fortawesome/free-solid-svg-icons';
import { Link, useNavigate } from 'react-router-dom';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import Swal from 'sweetalert2';
import pruebaApi from '../api/pruebaApi';
import { useAuth } from '../context/AuthContext';
import unidad1 from '../assets/images/unidades/unidad_nueva_1.png';
import unidad2 from '../assets/images/unidades/unidad_nueva_2.png';
import unidad3 from '../assets/images/unidades/unidad_nueva_3.jpg';
import unidad4 from '../assets/images/unidades/unidad_nueva_4.jpg';
// import unidad5 from '../assets/images/unidades/unidad_nueva_5.jpg'; // Optional
// import unidad6 from '../assets/images/unidades/unidad_nueva_6.jpg'; // Optional

// import bus1 from '../assets/images/carrusel-home/bus1.jpg';
// import bus2 from '../assets/images/carrusel-home/bus2.png';
import transporteRapido from '../assets/images/nosotros/transporteRapido.png';
import imgMonteros from '../assets/images/nosotros/monterosHD.png'


export const BodyHome = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [cargarProducto, setCargarProducto] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 720);

  // Use real bus images for the banner
  const bannerImages = [unidad4, unidad1, unidad3, unidad2];
  const bannerImagesMini = [unidad4, unidad1, unidad3];

  const currentBannerImage = isMobile
    ? bannerImagesMini[currentImageIndex]
    : bannerImages[currentImageIndex];

  const bannerClass = `banner banner-${currentImageIndex}${isMobile ? ' mobile' : ''}`;

  const handleNextImage = () => {
    setCurrentImageIndex((prevIndex) =>
      (prevIndex + 1) % (isMobile ? bannerImagesMini.length : bannerImages.length)
    );
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prevIndex) =>
      (prevIndex - 1 + (isMobile ? bannerImagesMini.length : bannerImages.length)) %
      (isMobile ? bannerImagesMini.length : bannerImages.length)
    );
  };


  const handleSolicitarPedido = () => {
    navigate('/aboutus');
  };

  const iniciarSesionRedirect = () => {
    const alert = Swal.fire({
      title: 'Estás a un paso de comprar tu boleto!',
      text: 'Accede con tu cuenta para continuar',
      icon: 'info',
      background: 'black',
      color: 'white',
      customClass: {
        container: 'custom-swal-container',
        title: 'custom-swal-title',
        content: 'custom-swal-content',
        confirmButton: 'custom-swal-confirm-button',
        cancelButton: 'custom-swal-cancel-button',
      },
      showConfirmButton: false,
    });

    setTimeout(() => {
      alert.close();
    }, 3800);

    setTimeout(() => {
      navigate('/login');
    }, 4000);
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 720);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        (prevIndex + 1) % (isMobile ? bannerImagesMini.length : bannerImages.length)
      );
    }, currentImageIndex === 0 ? 10000 : 7000);
    return () => clearInterval(intervalId);
  }, [currentImageIndex, isMobile]);



  return (
    <>

      {/* ----------------banner---------------- */}
      <div className={`banner ${isMobile ? 'mobile' : ''}`}>

        {/* Background Images Layer */}
        {(isMobile ? bannerImagesMini : bannerImages).map((img, index) => (
          <div
            key={index}
            className="banner-bg-layer"
            style={{
              backgroundImage: `url(${img})`,
              opacity: currentImageIndex === index ? 1 : 0,
              zIndex: 0
            }}
          />
        ))}

        {/* Content Overlay */}
        <div className="banner-content-wrapper" style={{
          zIndex: 2,
          position: 'relative',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          alignItems: 'center',
          paddingBottom: '80px'
        }}>
          <style>{`
            .glass-banner {
              background-color: rgba(0, 0, 0, 0.25) !important;
              backdrop-filter: blur(4px) !important;
              transition: all 0.4s ease;
              border: 1px solid rgba(255,255,255,0.15) !important;
            }
            .glass-banner:hover {
              background-color: rgba(0, 0, 0, 0.75) !important;
              backdrop-filter: blur(12px) !important;
              transform: translateY(-5px);
              border-color: rgba(255,193,7,0.6) !important;
              box-shadow: 0 20px 50px rgba(0,0,0,0.5);
            }
          `}</style>
          <div className="banner-body" style={{
            height: 'auto',
            flex: '1',
            display: 'flex',
            justifyContent: isMobile ? 'center' : 'flex-end',
            alignItems: 'flex-end',
            width: '100%',
            paddingLeft: '20px',
            paddingRight: isMobile ? '20px' : '80px',
            marginBottom: '30px'
          }}>
            <div className="banner-container-text text-center p-4 p-md-5 rounded-4 animate__animated animate__fadeInUp glass-banner"
              style={{
                maxWidth: '800px',
                cursor: 'default'
              }}>
              <h1 className='display-3 fw-bold text-white mb-2 text-uppercase' style={{ letterSpacing: '2px', textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
                ¿A dónde vas?
              </h1>
              <p className='fs-3 text-white mb-0 fw-light'>
                Consultá horarios y tarifas al instante.
              </p>
            </div>
          </div>
          <div className='button-container-banner d-flex gap-3 justify-content-center flex-wrap' style={{ zIndex: 3 }}>
            <button
              className="btn btn-primary btn-lg rounded-pill shadow fw-bold animate__animated animate__pulse animate__infinite"
              style={{ fontSize: '1.5rem', backgroundColor: '#004aad', borderColor: '#004aad', padding: '15px 40px' }}
              onClick={() => navigate('/paneldehorarios')}
            >
              <FontAwesomeIcon icon={faTruckFast} className="me-2" />
              CONSULTAR VIAJE
            </button>

            <button
              className="btn btn-outline-light btn-lg rounded-pill shadow fw-bold"
              style={{ fontSize: '1.2rem', padding: '15px 30px', borderWidth: '2px' }}
              onClick={() => navigate('/aboutus')}
            >
              CONOCER MÁS
            </button>
          </div>
          <button className="btn btn-link banner-control p-0 border-0" onClick={handlePrevImage} style={{ position: 'absolute', top: '50%', left: '10px', transform: 'translateY(-50%)', zIndex: 10 }}>
            <i className="fa-solid fa-arrow-left banner-control text-white" style={{ fontSize: '2rem', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}></i>
          </button>
          <button className="btn btn-link banner-control p-0 border-0" onClick={handleNextImage} style={{ position: 'absolute', top: '50%', right: '10px', transform: 'translateY(-50%)', zIndex: 10 }}>
            <i className="fa-solid fa-arrow-right banner-control text-white" style={{ fontSize: '2rem', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}></i>
          </button>
        </div>
      </div>
      <hr />


      {/* <hr /> */}
      {/* ----------------servicios---------------- */}
      <div className="container-fluid">
        <h3 className="text-center text-uppercase poppins-regular font-weight-bold display-5">Nuestros servicios</h3>
        <br />
        <div className="row">
          <div className="col-12 col-sm-6 col-md-4">
            <div className="service-item">
              <FontAwesomeIcon className='service-icon' icon={faTruckFast} />
              <h5 className="text-center text-uppercase poppins-regular font-weight-bold">Viajes interurbanos</h5>
              <p className="text-center">Conectamos ciudades con flotas modernas y seguras. Servicio puerta a puerta en las principales terminales.</p>
            </div>
          </div>
          <div className="col-12 col-sm-6 col-md-4">
            <div className="service-item">
              <FontAwesomeIcon className='service-icon' icon={faShoppingCart} />
              <h5 className="text-center text-uppercase poppins-regular font-weight-bold">Pasajes corporativos</h5>
              <p className="text-center">Garantiza tu asiento desde nuestra plataforma. Cancelación flexible y seguimiento en tiempo real.</p>
            </div>
          </div>
          <div className="col-12  col-md-4">
            <div className="service-item">
              <FontAwesomeIcon className='service-icon' icon={faStoreSlash} />
              <h5 className="text-center text-uppercase poppins-regular font-weight-bold">Reservaciones de local</h5>
              <p className="text-center">Somos una empresa familiar comprometida con la seguridad y puntualidad. Nuestra flota de última generación y conductores certificados garantizan un viaje sin preocupaciones. </p>
            </div>
          </div>
        </div>
      </div>
      <hr />
      {/* ----------------sobre nosotros---------------- */}
      <div className="container-fluid">
        <div className="row">
          <div className="col-12 col-lg-6 espacio-mBlanco">
            <img src={transporteRapido} className='img-fluid rounded shadow-sm my-img' alt="imagen de colectivo" />
          </div>
          <div className="col-12 col-lg-6 d-flex flex-column justify-content-center align-items-start">
            <div className='d-flex flex-column align-items-start centrarTexto'>
              <h1 className='display-2 fw-bold d-flex flex-column align-items-center m-2'>Transporte Rápido</h1>
              <h1 className='text-center display-5 m-2'>Conectando ciudades desde 1985</h1>
              <h5 className='text-xl m-2'>Somos líderes en transporte interurbano con más de 35 años de experiencia. Nuestro compromiso es ofrecer viajes seguros, puntuales y confortables con la mejor relación calidad-precio del mercado.</h5>
              <br />
              <Link to="/aboutus" className="btn btn-azul btn-lg rounded-pill m-2">Ver mas</Link>
            </div>
          </div>
        </div>
      </div>
      <hr />





      {/* ----------------mapa---------------- */}
      <div className='text-center mb-4'>
        <h2 className='fw-bold display-5 mb-3'>Dónde estamos?</h2>
        <div className="container-fluid">
          <div className="row">

            <div className="col-12 col-md-6 ">
              <img src={imgMonteros} alt="hamburgueseria" className='img-fluid mb-3 rounded shadow-lg' />
            </div>
            <div className="col-12 col-md-6 d-flex align-items-center">
              <div className='mb-3'>
                <h3>Nos encontramos en Belgrano 348 Monteros, Tucumán Argentina</h3>
                <h5>Encuéntranos también por nuestros canales de comunicación!</h5>
                <a href="https://www.facebook.com/share/1Bm2g81i2k/" className="btn btn-primary btn-lg mx-2" target="_blank"><i className="fa-brands fa-facebook"></i></a>
                <a href="https://www.instagram.com/" className="btn btn-danger btn-lg mx-2" target="_blank"><i className="fa-brands fa-instagram"></i></a>

              </div>
            </div>
          </div>
        </div>
        <iframe
          className="w-75"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d401.5182812300712!2d-65.49917265342305!3d-27.170849417938307!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9423cb0036e45713%3A0xe2024072b0caf79d!2sEmpresa%20Santa%20Luc%C3%ADa!5e1!3m2!1ses-419!2sar!4v1747335748994!5m2!1ses-419!2sar"
          width="1000"
          height="450"
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      </div>
    </>
  )
}

export default BodyHome;
