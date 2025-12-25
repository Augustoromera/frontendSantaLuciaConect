import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import '../styles/LoginRegistro.css';
import { Footer } from '../../components/Footer';
import Header from '../../components/Header';
import logo from '../../assets/images/nuevo-logo/logo.png';

function ForgotPasswordPage() {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const { resetPassword } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const onSubmit = handleSubmit(async (data) => {
        setIsLoading(true);
        try {
            await resetPassword(data.email);
            Swal.fire({
                icon: 'success',
                title: 'Correo enviado',
                text: 'Revisa tu bandeja de entrada para restablecer tu contraseña.',
                background: '#1e1e1e',
                color: 'white'
            }).then(() => {
                navigate('/login');
            });
        } catch (error) {
            console.error(error);
            let errorMessage = 'No se pudo enviar el correo.';
            if (error.code === 'auth/user-not-found') {
                errorMessage = 'No existe una cuenta con este correo.';
            }
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: errorMessage,
                background: '#1e1e1e',
                color: 'white'
            });
        } finally {
            setIsLoading(false);
        }
    });

    return (
        <div className='contenedorTodo'>
            <Header />

            <div className='contenedor1'>
                {/* Left Side - Branding (Desktop Only) */}
                <div className='login-branding'>
                    <img src={logo} alt="Transporte Santa Lucia" className='branding-logo' />
                    <h2 className='branding-title'>Recuperar Cuenta</h2>
                    <p className='branding-subtitle'>Te ayudamos a volver a tu viaje.</p>
                </div>

                {/* Right Side - Form */}
                <div className='login-form-container'>
                    <div>
                        <h1 className='titulo-lr'>Restablecer Contraseña</h1>
                        <p style={{ color: '#ccc', marginBottom: '20px' }}>
                            Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
                        </p>

                        <form onSubmit={onSubmit}>
                            <label htmlFor="email" className='labels'>Correo electrónico</label>
                            <input
                                type="email"
                                {...register("email", { required: true })}
                                className='inputs'
                                placeholder='ejemplo@correo.com'
                                id='email'
                            />
                            {errors.email && (
                                <p className='texto-validacion'>El email es obligatorio</p>
                            )}

                            <button type="submit" className='boton-login' disabled={isLoading}>
                                {isLoading ? 'Enviando...' : 'Enviar enlace de recuperación'}
                            </button>
                        </form>

                        <p className='texto-loginR'>
                            ¿Ya recordaste tu contraseña? <Link to="/login" className='link-login'>Inicia sesión aquí</Link>
                        </p>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}

export default ForgotPasswordPage;
