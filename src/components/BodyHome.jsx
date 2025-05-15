import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../pages/styles/bodyHome.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart, faStoreSlash, faTruckFast } from '@fortawesome/free-solid-svg-icons';
import { Link, useNavigate } from 'react-router-dom';
import MenuCard from '../components/CardMenu';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import Swal from 'sweetalert2';
import pruebaApi from '../api/pruebaApi';
import { useAuth } from '../context/AuthContext';
import Bannerrapiburguerjpeg from '../assets/banner/Bannerrapiburguerjpeg.jpg';
import bannerPsh1 from '../assets/banner/bannerPsh1.jpg';
import bannerPsh2 from '../assets/banner/bannerPsh2.jpg';
import bannerPsh3 from '../assets/banner/bannerPsh3.jpg';
import bannerMobile from '../assets/banner/bannerMobile.jpg';
import bannerMobile1 from '../assets/banner/bannerMobile1.jpg';
import bannerMobile2 from '../assets/banner/bannerMobile2.jpg';
import bannerMobile3 from '../assets/banner/bannerMobile3.jpeg';
import transporteRapido from '../assets/images/nosotros/transporteRapido.png';
import imgMonteros from '../assets/images/nosotros/monterosHD.png'
import { height } from '@fortawesome/free-brands-svg-icons/fa42Group';

export const BodyHome = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [cargarProducto, setCargarProducto] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 720);
  const textTextBanner = window.innerWidth <= 720 ? "Tu viaje ideal a un clic de distancia!" 
  : "Tu comodidad es nuestra prioridad. Viaja con confianza";
  const textButtonBanner = window.innerWidth <= 720 ? "COMPRAR" : "RESERVAR AHORA";
  const bannerImages = [
    Bannerrapiburguerjpeg,
    bannerPsh1,
    bannerPsh2,
    bannerPsh3,
  ];
  const bannerImagesMini = [
    bannerMobile,
    bannerMobile1,
    bannerMobile2,
    bannerMobile3,
  ];
  const handleNextImage = () => {
    setCurrentImageIndex((prevIndex) => {
      if (isMobile) {
        return ((prevIndex + 1) % bannerImagesMini.length);
      }
      else {
        return ((prevIndex + 1) % bannerImages.length);
      }
    });
  }

  const handlePrevImage = () => {
    setCurrentImageIndex((prevIndex) => {
      if (isMobile) {
        return (prevIndex - 1 + bannerImagesMini.length) % bannerImagesMini.length;
      } else {
        return (prevIndex - 1 + bannerImages.length) % bannerImages.length;
      }
    });
  };
  const cargarProductoDB = async () => {
    try {
      const resp = await pruebaApi.get('/api/mostrarMenus');
      const menus = resp.data.menus;
      const favoritos = menus.filter(menu => menu.favorito === true);
      if (favoritos.length >= 6) {
        const primerosElementos = favoritos.slice(0, 6);
        setCargarProducto(primerosElementos);
      } else {
        const primerosElementos = resp.data.menus.slice(0, 6);
        setCargarProducto(primerosElementos);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleSolicitarPedido = () => {
    navigate("/pedidos");
  };
  function iniciarSesionRedirect() {
    const alert = Swal.fire({
      title: "Estás a un paso de comprar tu boleto!",
      text: "Accede con tu cuenta para continuar",
      icon: "info",
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
      navigate("/login");
    }, 4000);
  }

  const bannerClass = `banner banner-${currentImageIndex}${isMobile ? ' mobile' : ''}`;

  const currentBannerImage = isMobile ? bannerImagesMini[currentImageIndex] : bannerImages[currentImageIndex];

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 720);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  useEffect(() => {
    const nextImage = () => {
      setCurrentImageIndex((prevIndex) => {
        if (isMobile) {
          return (prevIndex + 1) % bannerImagesMini.length;
        } else {
          return (prevIndex + 1) % bannerImages.length;
        }
      });
    };
    const intervalId = setInterval(nextImage, currentImageIndex === 0 ? 7000 : 5000);
    return () => clearInterval(intervalId);
  }, [currentImageIndex, bannerImages.length, bannerImagesMini.length, isMobile]);

  useEffect(() => {
    cargarProductoDB()
  }, [])

  const [formData, setFormData] = useState({
    origen: '',
    destino: '',
    horario: '',
    idaVuelta: false
  });

  const [showOptions, setShowOptions] = useState(false);
  const [ciudades, setCiudades] = useState([
    'Santa Lucía', 'San Juan', 'Mendoza', 'Buenos Aires', 'Córdoba'
  ]);

  const horarios = [
    '08:00 AM', '10:00 AM', '12:00 PM', '02:00 PM', '04:00 PM', '06:00 PM', '08:00 PM'
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.origen || !formData.destino || !formData.horario) {
      Swal.fire({
        title: 'Error',
        text: 'Por favor complete todos los campos obligatorios',
        icon: 'error',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'Entendido'
      });
      return;
    }

    if (formData.origen === formData.destino) {
      Swal.fire({
        title: 'Error',
        text: 'El origen y destino no pueden ser iguales',
        icon: 'error',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'Entendido'
      });
      return;
    }

    // Mostrar modal con información del viaje
    Swal.fire({
      title: 'Información del Viaje',
      html: `
        <div class="viaje-info">
          <p><strong>Ruta:</strong> ${formData.origen} ➔ ${formData.destino}</p>
          <p><strong>Horario:</strong> ${formData.horario}</p>
          <p><strong>Duración:</strong> ${calcularDuracion(formData.origen, formData.destino)}</p>
          <p><strong>Precio:</strong> $${calcularPrecio(formData.origen, formData.destino)}</p>
          ${formData.idaVuelta ? '<p><strong>Tipo:</strong> Ida y vuelta</p>' : ''}
        </div>
      `,
      confirmButtonColor: '#3085d6',
      confirmButtonText: 'Confirmar'
    });
  };

  const calcularDuracion = (origen, destino) => {
    // Lógica simulada de duración
    const distancias = {
      'Santa Lucía-San Juan': '2 horas',
      'Santa Lucía-Mendoza': '4 horas',
      'Santa Lucía-Buenos Aires': '12 horas',
      'Santa Lucía-Córdoba': '8 horas'
    };
    return distancias[`${origen}-${destino}`] || '3 horas';
  };

  const calcularPrecio = (origen, destino) => {
    // Lógica simulada de precios
    const precios = {
      'Santa Lucía-San Juan': 1200,
      'Santa Lucía-Mendoza': 2500,
      'Santa Lucía-Buenos Aires': 6000,
      'Santa Lucía-Córdoba': 4500
    };
    return formData.idaVuelta 
      ? (precios[`${origen}-${destino}`] * 1.8 || 3000) 
      : (precios[`${origen}-${destino}`] || 2000);
  };

  
  return (
    <>

      {/* ----------------banner---------------- */}
      <div className={bannerClass} style={{ backgroundImage: `url(${currentBannerImage})` }}>
        <div className="banner-body">
          <div className="banner-container-text">
            <p className='banner-text1'>{`${textTextBanner}`}</p>
            <p className='banner-text2'>en cada instante.</p>
          </div>
        </div>
        <div className='button-container-banner'>
          <button className="btn btn-warning btn-lg my-button-buy button-banner" onClick={user ? handleSolicitarPedido : iniciarSesionRedirect}>
            {`${textButtonBanner}`}
          </button>
        </div>
        <button className="btn btn-link banner-control" onClick={handlePrevImage}>
          <i className="fa-solid fa-arrow-left banner-control" style={{ position: 'absolute', top: '50%', left: '20px', transform: 'translateY(-50%)' }}></i>
        </button>
        <button className="btn btn-link banner-control" onClick={handleNextImage}>
          <i className="fa-solid fa-arrow-right banner-control" style={{ position: 'absolute', top: '50%', right: '20px', transform: 'translateY(-50%)' }}></i>
        </button>
      </div>
      <hr />


      <div className="quienes-somos-container">
      <h1>¿Quienes somos?</h1>
      <p>
        En Transporte Santa Lucía contamos con una sólida trayectoria que comenzó en 1952, 
        cuando Don Vicente Tripoloni tuvo la visión de conectar personas, caminos y pueblos. 
        Desde entonces, con esfuerzo y compromiso familiar, fuimos creciendo para ofrecer 
        un servicio de transporte urbano confiable, seguro y cercano.
      </p>
      <p>
        Hoy, con 12 unidades activas y el mismo espíritu de entrega de nuestros inicios, 
        seguimos acompañando a generaciones de pasajeros en su día a día, fortaleciendo 
        los lazos de nuestra comunidad y manteniendo vivo el legado de nuestros fundadores.
      </p>

      <div className="separador"></div>

      <h2>¿A DONDE VAS?</h2>
      
      <form onSubmit={handleSubmit} className="viaje-form">
        <div className="form-row">
          <div className="form-group">
            <label>Origen</label>
            <input
              type="text"
              name="origen"
              value={formData.origen}
              onChange={handleChange}
              onClick={() => setShowOptions(!showOptions)}
              placeholder="Seleccione origen"
              required
            />
          </div>
          
          <div className="form-group">
            <label>Destino</label>
            <input
              type="text"
              name="destino"
              value={formData.destino}
              onChange={handleChange}
              onClick={() => setShowOptions(!showOptions)}
              placeholder="Seleccione destino"
              required
            />
          </div>
        </div>

        {showOptions && (
          <div className="opciones-desplegable">
            <div className="horario-group p-1">
              <label name="etiquetahorario">Horario de Salida</label>
              <select
                name="horario"
                value={formData.horario}
                onChange={handleChange}
                required
              >
                <option value="">Seleccione horario</option>
                {horarios.map((hora, index) => (
                  <option key={index} value={hora}>{hora}</option>
                ))}
              </select>
            </div>

            <div className="checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="idaVuelta"
                  checked={formData.idaVuelta}
                  onChange={handleChange}
                />
                Ida y vuelta
              </label>
            </div>
          </div>
        )}

        <button type="submit" className="ingresar-btn">
          INGRESAR
        </button>
      </form>
    </div>
  





      {/* ----------------menús---------------- */}
      {/* <div className="container-fluid">
        <h3 className="text-center text-uppercase poppins-regular font-weight-bold display-5">
          Nuestros recorridos
        </h3>
        <br />

        <div className='home-menus row'>

          <div className='home-contenedor-cards-menus'>
            {cargarProducto.map((elemento, index) => (
              <div key={index} className='col-12 col-sm-6 col-md-4 col-lg-2 p-2 car-cont' onClick={
                user === null
                  ? () => {
                    navigate("/login");
                  }
                  : () => {
                    navigate("/pedidos");
                  }
              }>
                <div className='custom-card mb-2'>
                  <MenuCard
                    nombre={elemento.nombre}
                    descripcion={elemento.detalle}
                    imagenSrc={elemento.imagen}
                  />
                </div>
              </div>
            ))}
          </div>

        </div>
        <div className="text-center">

          <button className="btn btn-warning btn-lg my-button-buy" onClick={user ? handleSolicitarPedido : iniciarSesionRedirect}>
            {user ? "Elije tu colectivo" : "Hacer una reserva "}
          </button>

        </div>

      </div> */}
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
              <Link to="/aboutus" className="btn btn-warning btn-lg rounded-pill m-2">Ver mas</Link>
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
                <h3>Nos encontramos en Gral Paz 576 - San Miguel de Tucumán - Argentina</h3>
                <h5>Encuéntranos también por nuestros canales de comunicación!</h5>
                <a href="https://www.facebook.com/" className="btn btn-primary btn-lg mx-2" target="_blank"><i className="fa-brands fa-facebook"></i></a>
                <a href="https://www.instagram.com/" className="btn btn-danger btn-lg mx-2" target="_blank"><i className="fa-brands fa-instagram"></i></a>
                <a className="btn btn-success btn-lg mx-2" href='https://www.whatsapp.com/?lang=es_LA' target='_blank'><FontAwesomeIcon icon={faWhatsapp} /></a>
              </div>
            </div>
          </div>
        </div>
        <iframe className='w-75 ' src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d14240.408879082126!2d-65.2072018!3d-26.8367009!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94225d3ad7f30f1d%3A0xf8606cd659b8e3e4!2sRollingCode%20School!5e0!3m2!1ses-419!2sar!4v1690391123408!5m2!1ses-419!2sar" width="1000" height="450" allowFullScreen="" loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
      </div>
    </>
  )
}

export default BodyHome;
