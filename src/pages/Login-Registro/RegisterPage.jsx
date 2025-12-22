import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import '../styles/LoginRegistro.css';
import Header from '../../components/Header';
import { Footer } from '../../components/Footer';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import logo from '../../assets/images/nuevo-logo/logo.png';

function RegisterPage() {
  const { register, handleSubmit, setError, formState: { errors } } = useForm();
  const { signup, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [authError, setAuthError] = useState(null);
  const regex = /^[^@]+@[^@]+\.[a-zA-Z]{2,}$/;

  useEffect(() => {
    if (isAuthenticated) navigate('/');
  }, [isAuthenticated, navigate]);

  const onSubmit = handleSubmit(async (values) => {
    setAuthError(null);
    if (values.password !== values.passwordConfirmation) {
      setError('passwordConfirmation', {
        type: 'manual',
        message: 'Las contraseñas no coinciden',
      });
      return;
    }

    const emailValido = regex.test(values.email);
    if (!emailValido) {
      Swal.fire({
        icon: 'error',
        title: 'Registro incorrecto',
        text: 'El correo electrónico no es válido',
        background: '#1e1e1e', // Professional dark
        color: 'white'
      });
      return;
    }

    // Verificar si el email es de un administrador
    const adminEmails = ['paulo101@gmail.com', 'augusto101@gmail.com', 'nico101@gmail.com', 'santiago101@gmail.com'];
    const isAdmin = adminEmails.includes(values.email);

    try {
      // 1. Crear usuario en Auth
      const userCredential = await signup(values.email, values.password);

      // 2. Crear documento de usuario en Firestore
      await setDoc(doc(db, "users", userCredential.user.uid), {
        username: values.username,
        email: values.email,
        role: isAdmin ? 'admin' : 'user',
        createdAt: new Date()
      });

      Swal.fire({
        icon: 'success',
        title: 'Registro exitoso',
        background: '#1e1e1e',
        color: 'white'
      });

    } catch (error) {
      console.error("Error en registro:", error);
      setAuthError(error.message);
      Swal.fire({
        icon: 'error',
        title: 'Error al registrarse',
        text: error.message,
        background: '#1e1e1e',
        color: 'white'
      });
    }
  });

  return (
    <div className='contenedorTodo'>
      <Header />
      <div className='contenedor1'>
        {/* Left Side - Branding (Desktop Only) */}
        <div className='login-branding'>
          <img src={logo} alt="Transporte Santa Lucia" className='branding-logo' />
          <h2 className='branding-title'>Transporte Santa Lucía</h2>
          <p className='branding-subtitle'>Únete a nuestra comunidad de viajeros.</p>
        </div>

        {/* Right Side - Form */}
        <div className='login-form-container'>
          <div className='contenedor2'>
            {authError && (
              <div className='error-usuario'>{authError}</div>
            )}

            <h1 className='titulo-lr'>Registro</h1>

            <form onSubmit={onSubmit}>
              <label htmlFor="username" className='labels'>Nombre de usuario</label>
              <input
                type='text'
                {...register("username", { required: true, minLength: 3 })}
                className='inputsR'
                placeholder='Ej: John 10'
                id='username'
                maxLength={20}
              />
              {errors.username && (
                <p className='texto-validacion'>El nombre de usuario es obligatorio</p>
              )}

              <label htmlFor="email" className='labels'>Correo eletrónico</label>
              <input
                type='email'
                {...register("email", { required: true })}
                className='inputsR'
                placeholder='ejemplo@correo.com'
                id='email'
                maxLength={60}
              />
              {errors.email && (
                <p className='texto-validacion'>El email es obligatorio</p>
              )}

              <label htmlFor="password" className='labels'>Contraseña</label>
              <div className='password-input-container'>
                <input
                  type={showPassword ? "text" : "password"}
                  {...register("password", { required: true, minLength: 4 })}
                  className='inputsR'
                  placeholder='••••••••'
                  id='password'
                  maxLength={30}
                />
                <div
                  className='react-icon-password'
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </div>
              </div>
              {errors.password && (
                <p className='texto-validacion'>La contraseña debe ser mayor a 4 caracteres</p>
              )}

              <label htmlFor="confirmPassword" className='labels'>Confirmar contraseña</label>
              <div className='password-input-container'>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  {...register("passwordConfirmation", { required: true })}
                  className='inputsR'
                  placeholder='••••••••'
                  id='confirmPassword'
                  maxLength={30}
                />
                <div
                  className='react-icon-password'
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </div>
              </div>
              {errors.passwordConfirmation && (
                <p className='texto-validacion'>{errors.passwordConfirmation.message}</p>
              )}

              <button type='submit' className='boton-login'>
                Registrarme
              </button>
            </form>

            <p className='texto-loginR'>
              Ya tienes una cuenta? <Link to='/login' className='link-login'>Ingresa aquí</Link>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default RegisterPage;
