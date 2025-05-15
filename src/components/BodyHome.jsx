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
    idaVuelta: false,
    desdeMonteros: false // Nuevo campo para el checkbox
  });

  // Definición de todas las paradas disponibles en orden de ruta
  const paradas = [
    'MONTEROS',
    'CITROMAX',
    'STO DOMINGO',
    'CERVECERIA',
    'ACHERAL',
    'ALTO VERDE',
    'KM 3',
    'LA CIENAGA',
    'LA CORTADA',
    'ZAVALIA',
    'SANTA LUCIA'
  ];

  // Cuadro tarifario completo
  const cuadroTarifario = [
    { origen: 'MONTEROS', destino: 'CITROMAX', precio: 790.00 },
    { origen: 'MONTEROS', destino: 'CERVECERIA', precio: 790.00 },
    { origen: 'MONTEROS', destino: 'ACHERAL', precio: 920.00 },
    { origen: 'MONTEROS', destino: 'KM 3', precio: 1510.00 },
    { origen: 'MONTEROS', destino: 'LA CIENAGA', precio: 1510.00 },
    { origen: 'MONTEROS', destino: 'FAGALDE', precio: 1510.00 },
    { origen: 'MONTEROS', destino: 'SANTA LUCIA', precio: 1510.00 },
    { origen: 'SANTA LUCIA', destino: 'FAGALDE', precio: 790.00 },
    { origen: 'SANTA LUCIA', destino: 'LA CIENAGA', precio: 790.00 },
    { origen: 'SANTA LUCIA', destino: 'KM 3', precio: 790.00 },
    { origen: 'SANTA LUCIA', destino: 'ACHERAL', precio: 920.00 },
    { origen: 'SANTA LUCIA', destino: 'CERVECERIA', precio: 1510.00 },
    { origen: 'SANTA LUCIA', destino: 'CITROMAX', precio: 1510.00 },
    { origen: 'SANTA LUCIA', destino: 'MONTEROS', precio: 1510.00 }
  ];

  // Horarios completos de la mañana
  const horariosMananaCompleto = [
    {
      santaLuciaIda: "7:00", zavalia: "7:07", laCortada: "7:09", laCienaga: "7:11", km3: "7:13",
      altoVerde: "7:14", acheral: "7:15", cerveceria: "7:18", stoDomingo: "7:20", citromax: "7:22",
      monteros: "6:30", stoDomingoVuelta: "6:34", cerveceriaVuelta: "6:38", acheralVuelta: "6:45",
      altoVerdeVuelta: "6:50", km3Vuelta: "6:53", laCienagaVuelta: "6:55", laCortadaVuelta: "6:57",
      zavaliaVuelta: "6:58", santaLuciaVuelta: "7:00"
    },
    {
      santaLuciaIda: "7:30", zavalia: "7:37", laCortada: "7:39", laCienaga: "7:41", km3: "7:43",
      altoVerde: "7:44", acheral: "7:45", cerveceria: "7:48", stoDomingo: "7:50", citromax: "7:52",
      monteros: "7:00", stoDomingoVuelta: "7:04", cerveceriaVuelta: "7:08", acheralVuelta: "7:15",
      altoVerdeVuelta: "7:20", km3Vuelta: "7:23", laCienagaVuelta: "7:25", laCortadaVuelta: "7:27",
      zavaliaVuelta: "7:28", santaLuciaVuelta: "7:30"
    },
    {
      santaLuciaIda: "8:00", zavalia: "8:07", laCortada: "8:09", laCienaga: "8:11", km3: "8:13",
      altoVerde: "8:14", acheral: "8:15", cerveceria: "8:18", stoDomingo: "8:20", citromax: "8:22",
      monteros: "7:30", stoDomingoVuelta: "7:34", cerveceriaVuelta: "7:38", acheralVuelta: "7:45",
      altoVerdeVuelta: "7:50", km3Vuelta: "7:53", laCienagaVuelta: "7:55", laCortadaVuelta: "7:57",
      zavaliaVuelta: "7:58", santaLuciaVuelta: "8:00"
    },
    {
      santaLuciaIda: "8:30", zavalia: "8:37", laCortada: "8:39", laCienaga: "8:41", km3: "8:43",
      altoVerde: "8:44", acheral: "8:45", cerveceria: "8:48", stoDomingo: "8:50", citromax: "8:52",
      monteros: "8:00", stoDomingoVuelta: "8:04", cerveceriaVuelta: "8:08", acheralVuelta: "8:15",
      altoVerdeVuelta: "8:20", km3Vuelta: "8:23", laCienagaVuelta: "8:25", laCortadaVuelta: "8:27",
      zavaliaVuelta: "8:28", santaLuciaVuelta: "8:30"
    },
    {
      santaLuciaIda: "9:00", zavalia: "9:07", laCortada: "9:09", laCienaga: "9:11", km3: "9:13",
      altoVerde: "9:14", acheral: "9:15", cerveceria: "9:18", stoDomingo: "9:20", citromax: "9:22",
      monteros: "8:30", stoDomingoVuelta: "8:34", cerveceriaVuelta: "8:38", acheralVuelta: "8:45",
      altoVerdeVuelta: "8:50", km3Vuelta: "8:53", laCienagaVuelta: "8:55", laCortadaVuelta: "8:57",
      zavaliaVuelta: "8:58", santaLuciaVuelta: "9:00"
    },
    {
      santaLuciaIda: "10:00", zavalia: "10:07", laCortada: "10:09", laCienaga: "10:11", km3: "10:13",
      altoVerde: "10:14", acheral: "10:15", cerveceria: "10:48", stoDomingo: "10:50", citromax: "10:52",
      monteros: "10:00", stoDomingoVuelta: "10:04", cerveceriaVuelta: "10:08", acheralVuelta: "10:15",
      altoVerdeVuelta: "10:20", km3Vuelta: "10:23", laCienagaVuelta: "10:25", laCortadaVuelta: "10:27",
      zavaliaVuelta: "10:28", santaLuciaVuelta: "10:30"
    },
    {
      santaLuciaIda: "11:30", zavalia: "11:37", laCortada: "11:39", laCienaga: "11:41", km3: "11:43",
      altoVerde: "11:44", acheral: "11:45", cerveceria: "11:48", stoDomingo: "11:50", citromax: "11:52",
      monteros: "11:00", stoDomingoVuelta: "11:04", cerveceriaVuelta: "11:08", acheralVuelta: "11:15",
      altoVerdeVuelta: "11:20", km3Vuelta: "11:23", laCienagaVuelta: "11:25", laCortadaVuelta: "11:27",
      zavaliaVuelta: "11:28", santaLuciaVuelta: "11:30"
    },
    {
      santaLuciaIda: "12:30", zavalia: "12:37", laCortada: "12:39", laCienaga: "12:41", km3: "12:43",
      altoVerde: "12:44", acheral: "12:45", cerveceria: "12:48", stoDomingo: "12:50", citromax: "12:52",
      monteros: "12:00", stoDomingoVuelta: "12:04", cerveceriaVuelta: "12:08", acheralVuelta: "12:15",
      altoVerdeVuelta: "12:20", km3Vuelta: "12:23", laCienagaVuelta: "12:25", laCortadaVuelta: "12:27",
      zavaliaVuelta: "12:28", santaLuciaVuelta: "12:30"
    },
    {
      santaLuciaIda: "12:45", zavalia: "12:52", laCortada: "12:54", laCienaga: "12:56", km3: "12:58",
      altoVerde: "12:59", acheral: "13:00", cerveceria: "13:03", stoDomingo: "13:05", citromax: "13:06",
      monteros: "13:00", stoDomingoVuelta: "13:04", cerveceriaVuelta: "13:06", acheralVuelta: "13:15",
      altoVerdeVuelta: "13:20", km3Vuelta: "13:23", laCienagaVuelta: "13:25", laCortadaVuelta: "13:27",
      zavaliaVuelta: "13:28", santaLuciaVuelta: "13:30"
    },
    {
      santaLuciaIda: "13:30", zavalia: "13:37", laCortada: "13:39", laCienaga: "13:41", km3: "13:43",
      altoVerde: "13:44", acheral: "13:45", cerveceria: "13:48", stoDomingo: "13:50", citromax: "13:52",
      monteros: "13:30", stoDomingoVuelta: "13:34", cerveceriaVuelta: "13:36", acheralVuelta: "13:45",
      altoVerdeVuelta: "13:50", km3Vuelta: "13:53", laCienagaVuelta: "13:55", laCortadaVuelta: "13:57",
      zavaliaVuelta: "13:58", santaLuciaVuelta: "14:00"
    },
    {
      santaLuciaIda: "14:30", zavalia: "14:37", laCortada: "14:39", laCienaga: "14:41", km3: "14:43",
      altoVerde: "14:44", acheral: "14:45", cerveceria: "14:48", stoDomingo: "14:50", citromax: "14:52",
      monteros: "14:30", stoDomingoVuelta: "14:34", cerveceriaVuelta: "14:36", acheralVuelta: "14:45",
      altoVerdeVuelta: "14:50", km3Vuelta: "14:53", laCienagaVuelta: "14:55", laCortadaVuelta: "14:57",
      zavaliaVuelta: "14:58", santaLuciaVuelta: "15:00"
    },
    {
      santaLuciaIda: "15:30", zavalia: "15:37", laCortada: "15:39", laCienaga: "15:41", km3: "15:43",
      altoVerde: "15:44", acheral: "15:45", cerveceria: "15:48", stoDomingo: "15:50", citromax: "15:52",
      monteros: "15:00", stoDomingoVuelta: "15:04", cerveceriaVuelta: "15:06", acheralVuelta: "15:15",
      altoVerdeVuelta: "15:20", km3Vuelta: "15:23", laCienagaVuelta: "15:25", laCortadaVuelta: "15:27",
      zavaliaVuelta: "15:28", santaLuciaVuelta: "15:30"
    }
  ];

  // Mapeo de nombres de paradas a claves en el objeto de horarios
  const mapeoParadasHorarios = {
    'MONTEROS': 'monteros',
    'CITROMAX': 'citromax',
    'STO DOMINGO': 'stoDomingo',
    'CERVECERIA': 'cerveceria',
    'ACHERAL': 'acheral',
    'ALTO VERDE': 'altoVerde',
    'KM 3': 'km3',
    'LA CIENAGA': 'laCienaga',
    'LA CORTADA': 'laCortada',
    'ZAVALIA': 'zavalia',
    'SANTA LUCIA': 'santaLuciaIda',
    'FAGALDE': 'fagalde' // Asegúrate de que esta parada existe en tus datos
  };

  const [destinosDisponibles, setDestinosDisponibles] = useState([]);
  const [horariosDisponibles, setHorariosDisponibles] = useState([]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newFormData = {
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    };

    setFormData(newFormData);

    // Actualizar destinos disponibles cuando cambia el origen
    if (name === 'origen') {
      const destinos = paradas.filter(parada => parada !== value);
      setDestinosDisponibles(destinos);
      setFormData(prev => ({ ...prev, destino: '', horario: '' }));
      setHorariosDisponibles([]);
    }

    // Actualizar horarios disponibles cuando cambia origen o destino
    if ((name === 'origen' || name === 'destino') && newFormData.origen && newFormData.destino) {
      const horariosFiltrados = [];

      // Buscar todos los horarios disponibles para la ruta seleccionada
      horariosMananaCompleto.forEach(horario => {
        const claveOrigen = mapeoParadasHorarios[newFormData.origen];
        const claveDestino = mapeoParadasHorarios[newFormData.destino];

        if (claveOrigen && claveDestino && horario[claveOrigen] && horario[claveDestino]) {
          horariosFiltrados.push({
            salida: horario[claveOrigen],
            llegada: horario[claveDestino],
            origen: newFormData.origen,
            destino: newFormData.destino
          });
        }
      });

      setHorariosDisponibles(horariosFiltrados);
    }
  };

  const calcularPrecio = (origen, destino, desdeMonteros) => {
    // Si el checkbox está marcado, forzamos el origen a MONTEROS
    if (desdeMonteros) {
      origen = 'MONTEROS';
    } else {
      // Si no está marcado, forzamos el origen a SANTA LUCIA
      origen = 'SANTA LUCIA';
    }

    // Buscamos la tarifa correspondiente
    const tarifa = cuadroTarifario.find(t =>
      t.origen === origen && t.destino === destino
    );

    return tarifa ? tarifa.precio : 0;
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    const precioBase = calcularPrecio(formData.origen, formData.destino, formData.desdeMonteros);
    const precio = formData.idaVuelta ? precioBase * 1.8 : precioBase;

    // Validaciones básicas
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

    // Calcular duración del viaje
    const horarioSeleccionado = horariosDisponibles.find(h => h.salida === formData.horario);
    const duracion = horarioSeleccionado
      ? calcularDuracion(horarioSeleccionado.salida, horarioSeleccionado.llegada)
      : 'No disponible';

    // Mostrar resumen del viaje
    Swal.fire({
      title: 'Información del Viaje',
      html: `
        <div class="viaje-info">
          <p><strong>Ruta:</strong> ${formData.origen} ➔ ${formData.destino}</p>
          <p><strong>Horario de salida:</strong> ${formData.horario}</p>
          <p><strong>Llegada estimada:</strong> ${horarioSeleccionado?.llegada || 'No disponible'}</p>
          <p><strong>Duración:</strong> ${duracion}</p>
          <p><strong>Precio:</strong> $${precio.toFixed(2)}</p>
          ${formData.idaVuelta ? '<p><strong>Tipo:</strong> Ida y vuelta (1.8x precio base)</p>' : ''}
        </div>
      `,
      confirmButtonColor: '#3085d6',
      confirmButtonText: 'Confirmar'
    });
  };

  // Función para calcular la duración del viaje
  const calcularDuracion = (salida, llegada) => {
    const [hSalida, mSalida] = salida.split(':').map(Number);
    const [hLlegada, mLlegada] = llegada.split(':').map(Number);

    const minutosSalida = hSalida * 60 + mSalida;
    const minutosLlegada = hLlegada * 60 + mLlegada;

    let diferencia = minutosLlegada - minutosSalida;

    // Manejar casos donde la llegada es al día siguiente
    if (diferencia < 0) {
      diferencia += 24 * 60;
    }

    const horas = Math.floor(diferencia / 60);
    const minutos = diferencia % 60;

    return `${horas}h ${minutos}m`;
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
        <h2>¿A DONDE VAS?</h2>

        <form onSubmit={handleSubmit} className="viaje-form">
          {/* Sección de selección de ruta */}
          <div className="route-selection">


            <div className="location-selectors">
              <div className="form-group origin-selector">
                <label className="form-label">Origen</label>
                <select
                  name="origen"
                  value={formData.origen}
                  onChange={handleChange}
                  required
                  className="form-select"
                >
                  <option value="">Seleccione origen</option>
                  {formData.desdeMonteros ? (
                    <option value="MONTEROS">MONTEROS</option>
                  ) : (
                    paradas.map((parada, index) => (
                      <option key={index} value={parada}>{parada}</option>
                    ))
                  )}
                </select>
              </div>

              <div className="form-group destination-selector">
                <label className="form-label">Destino</label>
                <select
                  name="destino"
                  value={formData.destino}
                  onChange={handleChange}
                  required
                  disabled={!formData.origen && !formData.desdeMonteros}
                  className="form-select"
                >
                  <option value="">Seleccione destino</option>
                  {destinosDisponibles.map((parada, index) => (
                    <option key={index} value={parada}>{parada}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="route-options">
              <div className="route-type-toggle">
                <label className="toggle-label">
                  <input
                    type="checkbox"
                    name="desdeMonteros"
                    checked={formData.desdeMonteros}
                    onChange={handleChange}
                    className="toggle-input"
                  />
                  <span className="toggle-slider"></span>
                  <span className="toggle-text">Recorrido a partir de Monteros</span>
                </label>
              </div>
            </div>
          </div>

          {/* Sección de horarios y opciones */}
          {formData.origen && formData.destino && (
            <div className="schedule-options">
              <div className="time-selection">
                <label className="time-label">Horarios disponibles</label>
                <select
                  name="horario"
                  value={formData.horario}
                  onChange={handleChange}
                  required
                  className="time-select"
                >
                  <option value="">Seleccione un horario</option>
                  {horariosDisponibles.map((horario, index) => (
                    <option key={index} value={horario.salida}>
                      Salida: {horario.salida} - Llegada: {horario.llegada}
                    </option>
                  ))}
                </select>
                <div className="schedule-count">
                  {horariosDisponibles.length} horarios disponibles
                </div>
              </div>

              <div className="trip-options">
                <label className="option-label">
                  <input
                    type="checkbox"
                    name="idaVuelta"
                    checked={formData.idaVuelta}
                    onChange={handleChange}
                    className="option-checkbox"
                  />
                  <span className="option-text">Ida y vuelta (1.8x precio)</span>
                </label>
              </div>
            </div>
          )}

          {/* Botón de envío */}
          <div className="submit-section">
            <button type="submit" className="submit-btn">
              CONSULTAR VIAJE
            </button>
          </div>
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
