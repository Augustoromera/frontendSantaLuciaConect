import React, { useEffect, useState } from 'react';
import Table from 'react-bootstrap/Table';
import { FaPlus, FaUsers, FaBus, FaClock, FaEnvelope } from 'react-icons/fa';
import pruebaApi from '../../api/pruebaApi';
import Header from '../../components/Header';
import '../styles/adminscreen.css';
import Swal from 'sweetalert2';
import EditUserModal from '../../components/admin-components/EditUserModal';
import AddUserModal from '../../components/admin-components/AddUserModal';
import { useAuth } from '../../context/AuthContext';
import { getAuthToken } from '../../api/auth';
import { Footer } from '../../components/Footer';
import axios from 'axios';
import AddParadaModal from '../../components/admin-components/AddParadaModel';
import AddHorarioModal from '../../components/admin-components/AddHorarioModal';
import EditHorariosModal from '../../components/admin-components/EditHorariosModal';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/adminHorarios.css';
import EditParadaModal from '../../components/admin-components/EditParadasModal';
import AdminContactScreen from './AdminContactScreen';

export const AdminScreen = () => {
    const { user } = useAuth();
    const [activeSection, setActiveSection] = useState('usuarios');
    const [cargarUsuarios, setCargarUsuarios] = useState([]);

    const [paradasPorRuta, setParadasPorRuta] = useState({});

    // MODAL PARA AGREGAR UNA NUEVA PARADA
    const [mostrarModal, setMostrarModal] = useState(false);

    const [rutaSeleccionada, setRutaSeleccionada] = useState(null);

    // GUARDA LA PARADA SELECCIONADA Y SE LLAMA EN EL MODAL PARA EDITAR EL NOMBRE Y ORDEN DE UNA PARADA
    const [paradaSeleccionada, setParadaSeleccionada] = useState(null);

    // MODAL PARA AGREGAR UN USUARIO
    const [isModalOpenUser, setIsModalOpenUser] = useState(false);

    // MODAL PARA EDITAR UN USUARIO
    const [isModalOpenUserEditar, setIsModalOpenUserEditar] = useState(false);

    const [horarioEditando, setHorarioEditando] = useState(null); // Guarda la parada seleccionada

    // MODAL PARA EDITAR UNA PARADA
    const [modalEditarParadaAbierto, setModalEditarParadaAbierto] = useState(false)


    const rutas = [
        { id: "6841ae01c11032698b6ade09", nombre: "Santa Lucía → Monteros" },
        { id: "6841af28447dea60cc03a67d", nombre: "Monteros → Santa Lucía" }
    ];

    // Estados para formularios
    const [formDateUser, setFormDateUser] = useState({
        username: '',
        email: '',
        status: '',
        password: '',
        role: ''
    });
    const [formDateUserEditar, setFormDateUserEditar] = useState({
        _id: '',
        username: '',
        email: '',
        status: '',
        password: '',
        role: ''
    });

    const handleAgregarParada = async ({ nombre, orden }) => {
        if (!rutaSeleccionada) return;

        try {
            const nuevaParada = {
                nombre,
                orden,
                id_ruta: rutaSeleccionada.id
            };

            const response = await pruebaApi.post('/admin/nuevaParada', nuevaParada);
            const paradaCreada = response.data;

            setParadasPorRuta(prev => ({
                ...prev,
                [rutaSeleccionada.id]: [...(prev[rutaSeleccionada.id] || []), paradaCreada]
            }));
            await fetchParadasYHorarios(); // Actualiza las paradas después de agregar
            setMostrarModal(false);
        } catch (error) {
            console.error('Error al agregar parada:', error);
        }
    };

    // CONTROL DEL MODAL PARA EDITAR UNA PARADA
    const editarParada = (parada) => {
        setParadaSeleccionada(parada)
        setModalEditarParadaAbierto(true)
    }
    const cerrarModalEditarParada = () => {
        setParadaSeleccionada(null);
        setModalEditarParadaAbierto(false)
    }

    // Funciones de manejo de cambios
    const handleChangeFormUser = (e) => {
        const value = e.target.type === "checkbox" ? (e.target.checked ? "active" : "inactive") : e.target.value;
        setFormDateUser({
            ...formDateUser,
            [e.target.name]: value,
        });
    };

    const handleChangeFormUserEditar = (e) => {
        const { value, type, checked } = e.target;
        if (type === "checkbox") {
            setFormDateUserEditar({
                ...formDateUserEditar,
                [e.target.name]: checked,
            });
        } else {
            setFormDateUserEditar({
                ...formDateUserEditar,
                [e.target.name]: value,
            });
        }
    };

    // Funciones de envío de formularios
    const handleSubmitFormUser = (e) => {
        e.preventDefault();
        var { username, email, status, password, role } = formDateUser;
        const regexPass = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;
        role = role ? role.toLowerCase() : "user";
        status = status ? status.toLowerCase() : "inactive";

        if (!username.trim() || !email.trim() || !password.trim()) {
            showErrorAlert('Campos incompletos', 'Por favor completa todos los campos.');
            return;
        }

        if (!verificarFormatoEmail(email)) {
            showErrorAlert('Formato de correo incorrecto', 'Por favor ingresa un correo electrónico válido.');
            return;
        }

        if (!regexPass.test(password)) {
            showErrorAlert('Formato de contraseña incorrecto', 'Debe contener al menos una mayuscula, minusculas y al menos 8 caracteres');
            return;
        }

        showSuccessAlert('Usuario agregado!', 'El Usuario ha sido agregado exitosamente.');
        setFormDateUser({ username: '', email: '', status: '', password: '', role: '' });
        guardarUsuarioDb(username, email, status, password, role);
        recargarPagina();
    };

    const handleSubmitFormUserEditar = async (e) => {
        e.preventDefault();
        var { _id, username, email, status, role } = formDateUserEditar;
        role = role ? role.toLowerCase() : "user";
        let statusModif = status ? "active" : "inactive";

        if (!_id) {
            showErrorAlert('No se encontro el Usuario', 'Por favor contactese con el administrador.');
            return;
        }

        if (!username.trim() || !email.trim() || !role) {
            showErrorAlert('Campos incompletos', 'Por favor completa todos los campos.');
            return;
        }

        if (!verificarFormatoEmail(email)) {
            showErrorAlert('Formato de correo incorrecto', 'Por favor ingresa un correo electrónico válido.');
            return;
        }

        showSuccessAlert('Usuario editado!', 'El Usuario ha sido editado exitosamente.');
        setFormDateUser({ username: '', email: '', status: '', password: '', role: '' });
        editarUsuarioDb(_id, username, email, statusModif, role);
        recargarPagina();
    };

    const fetchParadasYHorarios = async () => {
        try {
            const nuevasParadas = {};
            const nuevosHorarios = {};

            //const resParadas = await pruebaApi.get(`api/paradas`);
            //setParadasPorRuta(nuevasParadas);

            for (const ruta of rutas) {
                // Obtener paradas
                const resParadas = await pruebaApi.get(`api/paradas?id_ruta=${ruta.id}`);

                const paradas = resParadas.data;
                nuevasParadas[ruta.id] = paradas;

                // Obtener horarios de cada parada
                // const horarios = await Promise.all(paradas.map(async parada => {
                //     const resHorario = await axios.get(`/obtenerHorarios?id_ruta=${ruta.id}&id_parada=${parada._id}`);
                //     return {
                //         paradaId: parada._id,
                //         nombre: parada.nombre,
                //         horarios: resHorario.data
                //     };
                // }));

                // nuevosHorarios[ruta.id] = horarios;
                setParadasPorRuta(prev => ({
                    ...prev,
                    [ruta.id]: paradas
                }));
            }
            //setHorariosPorRuta(nuevosHorarios);
        } catch (error) {
            console.error(error);
        }
    };

    // Funciones de API
    const editarUsuarioDb = async (_id, username, email, status, role) => {
        try {
            await pruebaApi.put('/api/admin-page/editarUsuario', {
                _id, username, email, status, role
            }, {
                withCredentials: true,
                headers: {
                    Authorization: `Bearer ${getAuthToken()}`,
                    User: JSON.stringify(user),
                },
            });
        } catch (error) {
            console.log(error);
        }
    };

    const guardarUsuarioDb = async (username, email, status, password, role) => {
        try {
            await pruebaApi.post('api/admin-page/nuevoUsuario', {
                username, email, status, password, role
            }, {
                withCredentials: true,
                headers: {
                    Authorization: `Bearer ${getAuthToken()}`,
                    User: JSON.stringify(user),
                },
            });
        } catch (error) {
            console.log(error);
        }
    };

    const cargarUserDB = async () => {
        try {
            const resp = await pruebaApi.get('/api/admin-page/listarUsuarios', {
                withCredentials: true,
                headers: {
                    Authorization: `Bearer ${getAuthToken()}`,
                    User: JSON.stringify(user),
                },
            });
            setCargarUsuarios(resp.data.usuarios);
        } catch (error) {
            console.log(error);
        }
    };

    // Funciones de UI
    const editarUsuarioClick = async (usuario) => {
        setFormDateUserEditar(usuario);
        setIsModalOpenUserEditar(true);
    };

    const eliminarUsuarioClick = async (id) => {
        Swal.fire({
            icon: 'warning',
            title: '¿Estás seguro?',
            text: 'Esta acción eliminará el usuario permanentemente.',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            background: 'black',
            color: 'white',
            customClass: {
                container: 'custom-swal-container',
                title: 'custom-swal-title',
                content: 'custom-swal-content',
                confirmButton: 'custom-swal-confirm-button',
                cancelButton: 'custom-swal-cancel-button',
            },
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await pruebaApi.delete(`/api/admin-page/eliminarUsuario/${id}`, {
                        withCredentials: true,
                        headers: {
                            Authorization: `Bearer ${getAuthToken()}`,
                            User: JSON.stringify(user),
                        },
                    });
                    showSuccessAlert('¡Usuario Eliminado!', 'El usuario ha sido eliminado exitosamente.');
                    recargarPagina();
                } catch (error) {
                    console.log(error);
                }
            }
        });
    };

    const eliminarParadaClick = async (idParada) => {
        //const confirmacion = window.confirm("¿Estás seguro de que querés eliminar este elemento?");
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: 'Esta acción eliminará el elemento permanentemente.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
        });

        if (result.isConfirmed) {
            try {
                await pruebaApi.delete(`/admin/eliminarParada/${idParada}`);
                await fetchParadasYHorarios(); // refrescar la lista
            } catch (error) {
                console.error('Error al eliminar la parada:', error);
                alert('No se pudo eliminar la parada. Revisá los logs del servidor.');
            }
        }

    }

    const inactivarUsuarioClick = async (usuario) => {
        const { _id, username, email, status, role } = usuario;
        const lowerCaserole = role ? role.toLowerCase() : "user";
        const lowerCasestatus = status ? status.toLowerCase() : "inactive";
        const newstatus = lowerCasestatus === "active" ? "inactive" : "active";

        if (!_id) {
            showErrorAlert('No se encontró el Usuario', 'Por favor contacte al administrador.');
            return;
        }

        Swal.fire({
            icon: 'warning',
            title: '¿Estás seguro?',
            text: 'Esta acción cambiará el estado del usuario, luego podrá modificarlo.',
            showCancelButton: true,
            confirmButtonText: 'Sí, cambiar',
            cancelButtonText: 'Cancelar',
            background: 'black',
            color: 'white',
            customClass: {
                container: 'custom-swal-container',
                title: 'custom-swal-title',
                content: 'custom-swal-content',
                confirmButton: 'custom-swal-confirm-button',
                cancelButton: 'custom-swal-cancel-button',
            },
        }).then((result) => {
            if (result.isConfirmed) {
                setFormDateUser({
                    username: '', email: '', status: '', password: '', role: ''
                });
                editarUsuarioDb(_id, username, email, newstatus, lowerCaserole);
                recargarPagina();
            }
        });
    };

    // Helpers
    const recargarPagina = () => {
        setTimeout(() => {
            window.location.reload();
        }, 2000);
    };

    const capitalizeFirstLetter = (str) => {
        return str.charAt(0).toUpperCase() + str.slice(1);
    };

    const verificarFormatoEmail = (email) => {
        const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
        return emailRegex.test(email);
    };

    const showErrorAlert = (title, text) => {
        Swal.fire({
            icon: 'error',
            title,
            text,
            background: 'black',
            color: 'white',
            customClass: {
                container: 'custom-swal-container',
                title: 'custom-swal-title',
                content: 'custom-swal-content',
                confirmButton: 'custom-swal-confirm-button',
                cancelButton: 'custom-swal-cancel-button',
            },
        });
    };

    const showSuccessAlert = (title, text) => {
        Swal.fire({
            icon: 'success',
            title,
            text,
            background: 'black',
            color: 'white',
            customClass: {
                container: 'custom-swal-container',
                title: 'custom-swal-title',
                content: 'custom-swal-content',
                confirmButton: 'custom-swal-confirm-button',
                cancelButton: 'custom-swal-cancel-button',
            },
        });
    };

    // Efectos
    useEffect(() => {
        cargarUserDB();
    }, []);

    useEffect(() => {
        fetchParadasYHorarios();
    }, [])

    // Renderizado
    return (
        <div className="admin-layout-wrapper">
            <Header /> {/* Header Global */}

            <div className="admin-dashboard-container">
                {/* Sidebar Navigation */}
                <aside className="admin-sidebar">
                    <div className="sidebar-header">
                        <h3>Admin Panel</h3>
                    </div>
                    <div className="sidebar-menu">
                        <button
                            className={`sidebar-item ${activeSection === 'usuarios' ? 'active' : ''}`}
                            onClick={() => setActiveSection('usuarios')}
                        >
                            <FaUsers className="sidebar-icon" />
                            <span>Usuarios</span>
                        </button>
                        <button
                            className={`sidebar-item ${activeSection === 'horarios' ? 'active' : ''}`}
                            onClick={() => setActiveSection('horarios')}
                        >
                            <FaClock className="sidebar-icon" />
                            <span>Horarios</span>
                        </button>
                        <button
                            className={`sidebar-item ${activeSection === 'unidades' ? 'active' : ''}`}
                            onClick={() => setActiveSection('unidades')}
                        >
                            <FaBus className="sidebar-icon" />
                            <span>Unidades</span>
                        </button>
                        <button
                            className={`sidebar-item ${activeSection === 'contacto' ? 'active' : ''}`}
                            onClick={() => setActiveSection('contacto')}
                        >
                            <FaEnvelope className="sidebar-icon" />
                            <span>Contacto</span>
                        </button>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="admin-main-content">

                    {/* Welcome / Header of content */}
                    {activeSection === 'usuarios' && (
                        <div className="table-container">
                            <div className="header-actions">
                                <h3>Gestión de Usuarios</h3>
                                <button
                                    className="btn-add-user"
                                    onClick={() => setIsModalOpenUser(true)}
                                    title='Agregar Usuario'
                                >
                                    <FaPlus /> Nuevo Usuario
                                </button>
                            </div>

                            <div className="table-responsive">
                                <Table className="custom-table" hover variant="dark">
                                    <thead>
                                        <tr>
                                            <th>Usuario</th>
                                            <th>Email</th>
                                            <th>Rol</th>
                                            <th>Estado</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {cargarUsuarios.map((usuario) => (
                                            <tr key={usuario._id}>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                        <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#004aad', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
                                                            {usuario.username.charAt(0).toUpperCase()}
                                                        </div>
                                                        {usuario.username}
                                                    </div>
                                                </td>
                                                <td>{usuario.email}</td>
                                                <td>
                                                    <span className={`badge-role ${usuario.role}`}>
                                                        {capitalizeFirstLetter(usuario.role)}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={`badge-status ${usuario.status === 'active' ? 'active' : 'inactive'}`}>
                                                        {usuario.status === 'active' ? 'Activo' : 'Inactivo'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="parada-botones" style={{ justifyContent: 'center' }}>
                                                        <button className="boton-icon edit" onClick={() => editarUsuarioClick(usuario)} title="Editar usuario">
                                                            <i className="fa-solid fa-pen-to-square"></i>
                                                        </button>
                                                        <button className="boton-icon toggle" onClick={() => inactivarUsuarioClick(usuario)} title={usuario.status === "inactive" ? "Activar" : "Inactivar"}>
                                                            <i className={`fa-solid ${usuario.status === "inactive" ? "fa-lock" : "fa-unlock"}`}></i>
                                                        </button>
                                                        <button className="boton-icon delete" onClick={() => eliminarUsuarioClick(usuario._id)} title="Eliminar usuario">
                                                            <i className="fa-solid fa-trash"></i>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>
                        </div>
                    )}

                    {activeSection === 'horarios' && (
                        <div className="section-container">
                            <div className="header-actions">
                                <h3>Gestión de Horarios</h3>
                            </div>
                            <p style={{ color: '#aaa', marginBottom: '2rem' }}>Administra las rutas, paradas y horarios de los recorridos.</p>

                            <div className="routes-grid">
                                {rutas.map((ruta) => (
                                    <div key={ruta.id} className="route-card">
                                        <div className="route-header">
                                            <h3>{ruta.nombre}</h3>
                                            <button
                                                className="btn-add-parada"
                                                onClick={() => {
                                                    setRutaSeleccionada(ruta);
                                                    setMostrarModal(true);
                                                }}
                                            >
                                                <FaPlus /> Agregar Parada
                                            </button>
                                        </div>

                                        {(paradasPorRuta[ruta.id] && paradasPorRuta[ruta.id].length > 0) ? (
                                            <ul className="paradas-lista">
                                                {paradasPorRuta[ruta.id].map((parada, index) => (
                                                    <li key={parada._id || `temp-${index}`} className="parada-item">
                                                        <div className="parada-info">
                                                            <span style={{ display: 'block', fontWeight: 'bold' }}>{parada.nombre}</span>
                                                            <span style={{ fontSize: '0.85rem', color: '#888' }}>Orden: {parada.orden}</span>
                                                        </div>

                                                        <div className="parada-botones">
                                                            <button
                                                                onClick={() => editarParada(parada)}
                                                                title="Editar parada"
                                                                className="boton-icon edit"
                                                            >
                                                                <i className="fa-solid fa-pen-to-square"></i>
                                                            </button>
                                                            <button
                                                                onClick={() => setHorarioEditando(parada)}
                                                                title="Ver horarios"
                                                                className="boton-icon clock"
                                                            >
                                                                <i className="fa-solid fa-clock"></i>
                                                            </button>
                                                            <button
                                                                onClick={() => eliminarParadaClick(parada._id)}
                                                                title="Eliminar parada"
                                                                className="boton-icon delete"
                                                            >
                                                                <i className="fa-solid fa-trash"></i>
                                                            </button>
                                                        </div>

                                                        {horarioEditando && horarioEditando._id === parada._id && (
                                                            <EditHorariosModal
                                                                parada={horarioEditando}
                                                                onClose={() => setHorarioEditando(null)}
                                                            />
                                                        )}
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p style={{ color: '#888', fontStyle: 'italic' }}>No hay paradas cargadas.</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeSection === 'unidades' && (
                        <div className="section-container">
                            <h3>Gestión de Unidades y Choferes</h3>
                            <p>Funcionalidad en desarrollo...</p>
                        </div>
                    )}

                    {activeSection === 'contacto' && (
                        <div className="section-container">
                            <AdminContactScreen />
                        </div>
                    )}
                </main>
            </div>

            {/* Modales - Preservados */}
            <AddUserModal
                isOpen={isModalOpenUser}
                setIsOpen={setIsModalOpenUser}
                onRequestClose={() => setIsModalOpenUser(false)}
                handleChangeFormUser={handleChangeFormUser}
                handleSubmitFormUser={handleSubmitFormUser}
                formDateUser={formDateUser}
            />
            <EditUserModal
                isOpen={isModalOpenUserEditar}
                setIsOpen={setIsModalOpenUserEditar}
                handleChangeFormUserEditar={handleChangeFormUserEditar}
                handleSubmitFormUserEditar={handleSubmitFormUserEditar}
                formDateUserEditar={formDateUserEditar}
            />
            <AddParadaModal
                isOpen={mostrarModal}
                onClose={() => setMostrarModal(false)}
                onSubmit={handleAgregarParada}
            />
            <EditParadaModal
                isOpen={modalEditarParadaAbierto}
                onRequestClose={cerrarModalEditarParada}
                parada={paradaSeleccionada}
                onRecargarParadas={fetchParadasYHorarios}
            />

            <Footer />
        </div>
    );
};