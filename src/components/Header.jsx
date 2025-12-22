import { useState, useEffect } from 'react';
import { NavDropdown, Nav } from 'react-bootstrap';
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import "../pages/styles/header.css";
import logoTipo from '../assets/images/logo/logo.png.png'
import swal from 'sweetalert2';
import NotificationBell from './NotificationBell';

// eslint-disable-next-line react/prop-types
function Header({ navBarClass }) {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    swal.fire({
      title: "Cerrando sesión...",
      timer: 2000, // Espera 2 segundos antes de redirigir
      buttons: false,
      icon: "success",
      position: "center",
      background: 'black',
      color: 'white',
      customClass: {
        container: 'custom-swal-container',
        title: 'custom-swal-title',
        content: 'custom-swal-content',
        confirmButton: 'custom-swal-confirm-button',
        cancelButton: 'custom-swal-cancel-button',
      },
    }).then(() => {
      logout();
      navigate("/"); // Navega al home ("/") después de cerrar sesión
    });
  };
  const navLinkClass = navBarClass;

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 50;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  const dinamicNav = location.pathname === '/' ? (scrolled ? 'navbarhome scrolled' : 'navbarhome') : 'navbarmain';

  // LOGOUT HEADER
  if (user === null) {
    return (
      <Navbar expand="lg" data-bs-theme="dark" className={`${dinamicNav}`} >

        <Container>
          <Navbar.Brand >
            <img src={logoTipo} className="d-inline-block navbar-image logo" onClick={
              () => {
                navigate("/");
              }
            } alt="Logo" />
          </Navbar.Brand>

          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              <Nav.Link as={Link} to="/"  >Inicio</Nav.Link>
              <Nav.Link as={Link} to="/paneldehorarios"  >Panel de Horarios</Nav.Link>
              <Nav.Link as={Link} to="/aboutus"  >Nuestros Productos</Nav.Link>
              <Nav.Link as={Link} to="/contact" >Contacto</Nav.Link>
              <NavDropdown title="Ingresar" id="basic-nav-dropdown">
                <NavDropdown.Item as={Link} to="/login"  >Iniciar Sesión</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/register" >Registrarse</NavDropdown.Item>
              </NavDropdown>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    );
  }

  // LOGGED IN HEADER
  return (
    <Navbar expand="lg" data-bs-theme="dark" className={`${dinamicNav}`} >
      <Container>
        <Navbar.Brand as={Link} to="/">
          <img
            src={logoTipo}
            className="d-inline-block navbar-image"
            alt="Logo"
            onClick={() => window.location.href = "/"}
          />
        </Navbar.Brand>

        {/* MOBILE CONTROLS (Bell + Toggle) */}
        {/* MOBILE CONTROLS (Bell + Toggle) */}
        {isAuthenticated && (
          <div className="d-lg-none ms-auto me-2">
            <NotificationBell />
          </div>
        )}
        <Navbar.Toggle aria-controls="basic-navbar-nav" className={isAuthenticated ? "ms-0" : "ms-auto"} />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto align-items-center">

            {/* Links Common to All Auth Users */}
            <Nav.Link as={Link} to="/"  >Inicio</Nav.Link>

            {/* NOTIFICATION BELL - DESKTOP (Visible only on lg and above) */}
            {isAuthenticated && (
              <div className="d-none d-lg-flex align-items-center mx-2">
                <NotificationBell />
              </div>
            )}

            {/* Admin Specific Links */}
            {isAuthenticated && user.role === 'admin' && (
              <>
                <Nav.Link as={Link} to="/admin" >Administración</Nav.Link>
                <Nav.Link as={Link} to="/mis-consultas" >Mis Consultas</Nav.Link>
              </>
            )}

            {/* User Specific Links */}
            {isAuthenticated && user.role !== 'admin' && (
              <Nav.Link as={Link} to="/mis-consultas" >Mis Consultas</Nav.Link>
            )}

            <Nav.Link as={Link} to="/paneldehorarios" >Panel de Horarios</Nav.Link>
            <Nav.Link as={Link} to="/aboutus" >Sobre Nosotros</Nav.Link>
            <Nav.Link as={Link} to="/contact" >Contacto</Nav.Link>
            <Nav.Link as={Link} to="/" onClick={handleLogout}>Cerrar sesión</Nav.Link>

          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Header;