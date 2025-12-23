import { useState, useEffect } from 'react';
import { NavDropdown, Nav, Offcanvas } from 'react-bootstrap';
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
      timer: 2000,
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
      navigate("/");
    });
  };

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

  // Helper to render links to avoid duplication
  const renderNavLinks = (isMobile) => (
    <Nav className={`ms-auto align-items-center ${isMobile ? 'w-100' : ''}`}>
      <Nav.Link as={Link} to="/" onClick={isMobile ? () => document.querySelector('.btn-close').click() : null}>Inicio</Nav.Link>

      {/* NOTIFICATION BELL - DESKTOP ONLY here */}
      {!isMobile && isAuthenticated && (
        <div className="d-flex align-items-center mx-2">
          <NotificationBell />
        </div>
      )}

      {/* Authenticated Links */}
      {isAuthenticated && (
        <>
          {user.role === 'admin' ? (
            <Nav.Link as={Link} to="/admin" onClick={isMobile ? () => document.querySelector('.btn-close').click() : null}>Administración</Nav.Link>
          ) : null}
          <Nav.Link as={Link} to="/mis-consultas" onClick={isMobile ? () => document.querySelector('.btn-close').click() : null}>Mis Consultas</Nav.Link>
        </>
      )}

      <Nav.Link as={Link} to="/paneldehorarios" onClick={isMobile ? () => document.querySelector('.btn-close').click() : null}>Panel de Horarios</Nav.Link>
      <Nav.Link as={Link} to="/aboutus" onClick={isMobile ? () => document.querySelector('.btn-close').click() : null}>{isAuthenticated ? 'Sobre Nosotros' : 'Nuestros Productos'}</Nav.Link>
      <Nav.Link as={Link} to="/historia" onClick={isMobile ? () => document.querySelector('.btn-close').click() : null}>Historia</Nav.Link>
      <Nav.Link as={Link} to="/contact" onClick={isMobile ? () => document.querySelector('.btn-close').click() : null}>Contacto</Nav.Link>

      {!isAuthenticated && (
        <NavDropdown title="Ingresar" id="basic-nav-dropdown">
          <NavDropdown.Item as={Link} to="/login" onClick={isMobile ? () => document.querySelector('.btn-close').click() : null}>Iniciar Sesión</NavDropdown.Item>
          <NavDropdown.Item as={Link} to="/register" onClick={isMobile ? () => document.querySelector('.btn-close').click() : null}>Registrarse</NavDropdown.Item>
        </NavDropdown>
      )}

      {isAuthenticated && (
        <Nav.Link as={Link} to="/" onClick={() => {
          handleLogout();
          if (isMobile) document.querySelector('.btn-close').click();
        }}>Cerrar sesión</Nav.Link>
      )}
    </Nav>
  );

  return (
    <Navbar expand="lg" data-bs-theme="dark" className={`${dinamicNav}`} sticky="top">
      <Container fluid> {/* Use fluid container for offcanvas spacing */}
        <Navbar.Brand as={Link} to="/">
          <img
            src={logoTipo}
            className="d-inline-block navbar-image logo"
            alt="Logo"
            onClick={() => window.location.href = "/"}
          />
        </Navbar.Brand>

        {/* MOBILE BELL (Left of Toggle) */}
        {isAuthenticated && (
          <div className="d-lg-none ms-auto me-3">
            <NotificationBell />
          </div>
        )}

        <Navbar.Toggle aria-controls="offcanvasNavbar-expand-lg" className="ms-0" />

        {/* DESKTOP NAV (Visible lg+) */}
        <Navbar.Collapse id="basic-navbar-nav" className="d-none d-lg-block">
          {renderNavLinks(false)}
        </Navbar.Collapse>

        {/* MOBILE OFFCANVAS (Visible < lg) */}
        <Navbar.Offcanvas
          id="offcanvasNavbar-expand-lg"
          aria-labelledby="offcanvasNavbarLabel-expand-lg"
          placement="end"
          className="bg-dark text-white border-start border-secondary d-lg-none"
          style={{ maxWidth: '350px' }}
        >
          <Offcanvas.Header closeButton closeVariant="white" className="border-bottom border-secondary">
            <Offcanvas.Title id="offcanvasNavbarLabel-expand-lg" className="flex-grow-1 text-center">
              <img src={logoTipo} alt="Logo" style={{ height: '120px', objectFit: 'contain' }} />
            </Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body className="p-0">
            {renderNavLinks(true)}
          </Offcanvas.Body>
        </Navbar.Offcanvas>

      </Container>
    </Navbar>
  );
}

export default Header;
