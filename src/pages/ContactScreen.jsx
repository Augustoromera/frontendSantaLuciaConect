import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Form, Button } from 'react-bootstrap';
import Header from '../components/Header';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './styles/contact.css';
import { faFacebook, faInstagram, faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { Footer } from '../components/Footer';
import Swal from 'sweetalert2';
import imgMonteros from '../assets/images/nosotros/monterosHD.png';
// import contactImage from '../assets/images/contacto/contact_image.jpg';
import contactImage from '../assets/banner/bannerPsh1.jpg';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export const ContactScreen = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  // Pre-fill user data
  React.useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        firstName: user.username || user.displayName || '',
        email: user.email || '',
      }));
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    //  ---------------------------Validaciones de campos--------------------------------

    // Validación para el campo de nombre
    if (formData.firstName.trim() === '' || !/^[A-Za-z ]+$/.test(formData.firstName)) {
      Swal.fire({
        icon: 'error',
        title: 'Error en el nombre',
        text: 'Por favor, ingresa un nombre válido.',
        background: 'black',
        color: 'white',
      });
      return;
    }

    // Validación para el campo de apellido
    if (formData.lastName.trim() === '' || !/^[A-Za-z ]+$/.test(formData.lastName)) {
      Swal.fire({
        icon: 'error',
        title: 'Error en el apellido',
        text: 'Por favor, ingresa un apellido válido.',
        background: 'black',
        color: 'white',
      });
      return;
    }

    // Validación para el campo de correo electrónico
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email)) {
      Swal.fire({
        icon: 'error',
        title: 'Error en el correo electrónico',
        text: 'Por favor, ingresa un correo electrónico válido.',
        background: 'black',
        color: 'white',
      });
      return;
    }

    // Validación para el campo de teléfono
    if (formData.phone.trim() !== '' && !/^(?:\d*\+?\d*)$/.test(formData.phone)) {
      Swal.fire({
        icon: 'error',
        title: 'Error en el teléfono',
        text: 'Por favor, ingresa un teléfono válido.',
        background: 'black',
        color: 'white',
      });
      return;
    }

    // Validación para el campo de asunto
    if (formData.subject.trim() === '') {
      Swal.fire({
        icon: 'error',
        title: 'Error en el asunto',
        text: 'Por favor, ingresa un asunto.',
        background: 'black',
        color: 'white',
      });
      return;
    }

    // Validación para el campo de mensaje
    if (formData.message.trim() === '') {
      Swal.fire({
        icon: 'error',
        title: 'Error en el mensaje',
        text: 'Por favor, escribe un mensaje.',
        background: 'black',
        color: 'white',
      });
      return;
    }

    try {
      await guardarFormulario(formData);

      Swal.fire({
        icon: 'success',
        title: 'Formulario enviado correctamente!',
        html: 'Nuestro equipo recibió tu solicitud',
        showConfirmButton: false,
        background: 'black',
        color: 'white',
        timer: 3000,
      }).then(() => {
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          subject: '',
          message: ''
        });
      });

    } catch (error) {
      console.log(error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo enviar el mensaje. Intenta nuevamente.',
        background: 'black',
        color: 'white',
      });
    }
  };

  const guardarFormulario = async (data) => {
    const mappedData = {
      nombre: data.firstName,
      apellido: data.lastName,
      email: data.email,
      telefono: data.phone,
      asunto: data.subject,
      mensaje: data.message,
      fecha: new Date().toISOString()
    };

    console.log("Datos a enviar:", mappedData);
    await addDoc(collection(db, "contacts"), mappedData);
    console.log("Formulario enviado correctamente a Firestore");
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "firstName" || name === "lastName") {
      const alphabeticRegex = /^[A-Za-z ]+$/;
      if (!alphabeticRegex.test(value) && value !== "") {
        return;
      }
    }
    if (name === "phone") {
      const numericRegex = /^[0-9+]+$/;
      if (!numericRegex.test(value) && value !== "") {
        return;
      }
    }
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  return (
    <>
      <Header />
      <div className="container-fluid micontenedor principal">
        <h1 id="top" className="text-center display-3">
          Contacto
        </h1>
        <p className="text-center">
          No dudes en ponerte en contacto con nosotros si tienes dudas o sugerencias. <br />
          Nuestro equipo se pondrá en contacto contigo cuanto antes!
        </p>

        <br />
        <div className="row ">
          <div className="col-12 col-lg-6 mb-4">
            <div>
              <img
                src={contactImage}
                className="img-fluid w-100 contact-image"
                alt="colectivos"
              />
            </div>
          </div>
          <div className="col-12 col-lg-6 px-lg-5 d-flex align-items-center ">
            <div className="w-100">
              <div className="contact-form-card">
                <h2 className="contact-title text-center">Contáctanos</h2>
                <p className="contact-subtitle text-center">Completa el formulario con tus datos</p>

                {!user ? (
                  <div className="text-center py-5">
                    <h4 className="mb-4 text-white">Debes iniciar sesión para enviarnos un mensaje</h4>
                    <Link to="/login" className="btn btn-submit-contact w-auto px-5">
                      Iniciar Sesión
                    </Link>
                  </div>
                ) : (
                  <Form onSubmit={handleSubmit}>
                    <div className="row">
                      <div className="col-12">
                        <Form.Group className="mb-4" controlId="firstName">
                          <Form.Label className="form-label-custom">Nombre</Form.Label>
                          <Form.Control
                            className="custom-input text-center"
                            type="text"
                            name="firstName"
                            required
                            minLength={2}
                            maxLength={50}
                            placeholder="Ingresa tu nombre"
                            value={formData.firstName}
                            onChange={(e) => handleChange(e)}
                            readOnly={!!user}
                            style={user ? { opacity: 0.7, cursor: 'not-allowed' } : {}}
                          />
                        </Form.Group>
                      </div>
                      <div className="col-12">
                        <Form.Group className="mb-4" controlId="lastName">
                          <Form.Label className="form-label-custom">Apellido</Form.Label>
                          <Form.Control
                            className="custom-input text-center"
                            type="text"
                            name="lastName"
                            required
                            minLength={2}
                            maxLength={50}
                            placeholder="Ingresa tu apellido"
                            value={formData.lastName}
                            onChange={(e) => handleChange(e)}
                          />
                        </Form.Group>
                      </div>
                      <div className="col-12">
                        <Form.Group className="mb-4" controlId="email">
                          <Form.Label className="form-label-custom">Email</Form.Label>
                          <Form.Control
                            className="custom-input text-center"
                            type="email"
                            name="email"
                            required
                            minLength={2}
                            maxLength={50}
                            placeholder="Ingresa tu email"
                            value={formData.email}
                            onChange={(e) => handleChange(e)}
                            readOnly={!!user}
                            style={user ? { opacity: 0.7, cursor: 'not-allowed' } : {}}
                          />
                        </Form.Group>
                      </div>
                      <div className="col-12">
                        <Form.Group className="mb-4" controlId="phone">
                          <Form.Label className="form-label-custom">Teléfono (opcional)</Form.Label>
                          <Form.Control
                            className="custom-input text-center"
                            type="tel"
                            name="phone"
                            minLength={5}
                            maxLength={12}
                            placeholder="Ingresa tu teléfono"
                            value={formData.phone}
                            onChange={(e) => handleChange(e)}
                          />
                        </Form.Group>
                      </div>
                      <div className="col-12">
                        <Form.Group className="mb-4" controlId="subject">
                          <Form.Label className="form-label-custom">Asunto</Form.Label>
                          <Form.Control
                            className="custom-input text-center"
                            type="text"
                            name="subject"
                            minLength={4}
                            maxLength={50}
                            required
                            placeholder="Ingresa un asunto"
                            value={formData.subject}
                            onChange={(e) => handleChange(e)}
                          />
                        </Form.Group>

                        <Form.Group className="mb-4" controlId="message">
                          <Form.Label className="form-label-custom">Mensaje</Form.Label>
                          <Form.Control
                            className="custom-input"
                            as="textarea"
                            rows={6}
                            name="message"
                            required
                            minLength={5}
                            maxLength={500}
                            placeholder="Escribe tu mensaje aquí..."
                            value={formData.message}
                            onChange={(e) => handleChange(e)}
                          />
                        </Form.Group>
                      </div>
                    </div>

                    <Button variant="primary" type="submit" className="btn-submit-contact mb-2">
                      Enviar Mensaje
                    </Button>
                  </Form>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mb-4">
          <h2 className="fw-bold display-5 mb-3">Dónde estamos?</h2>
          <div className="container-fluid micontenedor">
            <div className="row">
              <div className="col-12 col-md-6">
                <img
                  src={imgMonteros}
                  alt="hamburgueseria"
                  className="img-fluid mb-3 rounded shadow-lg "
                />
              </div>
              <div className="col-12 col-md-6 d-flex align-items-center">
                <div className="mb-3">
                  <h3>Nos encontramos en Gral Paz 576 - San Miguel de Tucumán - Argentina</h3>
                  <h5>Encuéntranos también por nuestros canales de comunicación!</h5>
                  <a className="btn btn-primary btn-lg mx-2" href="https://www.facebook.com/share/1Bm2g81i2k/" target="_blank">
                    <FontAwesomeIcon icon={faFacebook} />
                  </a>
                  <a className="btn btn-danger btn-lg mx-2" href="https://www.instagram.com/" target="_blank">
                    <FontAwesomeIcon icon={faInstagram} />
                  </a>

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
      </div>
      <Footer />
    </>
  );
};
