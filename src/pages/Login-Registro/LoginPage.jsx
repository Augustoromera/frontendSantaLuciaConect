import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import '../styles/LoginRegistro.css';
import { Footer } from '../../components/Footer';
import Header from '../../components/Header';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import logo from '../../assets/images/nuevo-logo/logo.png';

function LoginPage() {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const { login, isAuthenticated, user } = useAuth();
    const [authError, setAuthError] = useState(null);
    const [email, setEmail] = useState('');

    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const regex = /^[^@]+@[^@]+\.[a-zA-Z]{2,}$/;

    const onSubmit = handleSubmit(async (data) => {
        setAuthError(null);
        const emailValido = regex.test(data.email);
        if (!emailValido) {
            Swal.fire({
                icon: 'error',
                title: 'Login incorrecto',
                text: 'El correo electrónico no es válido',
                background: '#1e1e1e', // Professional dark
                color: 'white'
            });
            return;
        }

        try {
            await login(data.email, data.password);
        } catch (error) {
            console.log(error);
            setAuthError("Error al iniciar sesión: " + error.message);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Credenciales inválidas o error de conexión.',
                background: '#1e1e1e',
                color: 'white'
            });
        }
    });

    useEffect(() => {
        if (isAuthenticated && user) {
            if (user.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/');
            }
        }
    }, [isAuthenticated, user, navigate]);

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
                    <div>
                        {authError && (
                            <div className='error-usuario'>
                                {authError}
                            </div>
                        )}

                        <h1 className='titulo-lr'>Login</h1>

                        <form onSubmit={onSubmit}>
                            <label htmlFor="email" className='labels'>Correo electrónico</label>
                            <input
                                type="email"
                                {...register("email", { required: true })}
                                className='inputs'
                                placeholder='ejemplo@correo.com'
                                id='email'
                                maxLength={60}
                                onChange={(event) => setEmail(event.target.value)}
                            />
                            {errors.email && (
                                <p className='texto-validacion'>El email es obligatorio</p>
                            )}

                            <label htmlFor="password" className='labels'>Contraseña</label>
                            <div className='password-input-container'>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    {...register("password", { required: true, minLength: 4 })}
                                    className='inputs'
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

                            <button type="submit" className='boton-login'>
                                Ingresar
                            </button>
                        </form>

                        <p className='texto-loginR'>
                            No tienes una cuenta para ingresar? <Link to="/register" className='link-login'>Regístrate aquí</Link>
                        </p>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}

export default LoginPage;
