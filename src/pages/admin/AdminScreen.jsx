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
import '../styles/adminHorarios.css'
import EditParadaModal from '../../components/admin-components/EditParadasModal';

export const AdminScreen = () => {
    const { user } = useAuth();
    const [activeSection, setActiveSection] = useState('usuarios');
    const [cargarUsuarios, setCargarUsuarios] = useState([]);

    const [paradasPorRuta, setParadasPorRuta] = useState({});

    // MODAL PARA AGREGAR UNA NUEVA PARADA
    const [mostrarModal, setMostrarModal] = useState(false);

    const [rutaSeleccionada, setRutaSeleccionada] = useState(null);

    // MODAL PARA AGREGAR UN HORARIO
    const [modalHorarioAbierto, setModalHorarioAbierto] = useState(false);

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

    // CONTROL DEL MODAL PARA AGREGAR UN HORARIO
    const cargarHorario = (parada) => {
        setParadaSeleccionada(parada);
        setModalHorarioAbierto(true);
    };

    const cerrarModalHorario = () => {
        setParadaSeleccionada(null);
        setModalHorarioAbierto(false);
    };

    const guardarHorario = async (paradaId, horario, tipoDia, orden, turno) => {
        try {
            const nuevoHorario = {
                id_parada: paradaId,
                horario: horario,
                tipo_dia: tipoDia,
                nro_orden: orden,
                turno: turno
            };

            const resp = await pruebaApi.post('/admin/nuevoHorario', nuevoHorario);

            if (resp.status === 200 || resp.status === 201) {
                console.log('Horario guardado correctamente:', resp.data);
            } else {
                console.warn('Algo salió mal al guardar el horario:', resp.status);
            }
        } catch (error) {
            console.error('Error al guardar el horario:', error);
        }

        cerrarModalHorario();
    };

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
        <>
            <Header />
            <div className="pt-5">
                <div className="text-center mt-4 p-5">
                    <h1>Bienvenido al Panel de Administración</h1>
                    <p>¡Gestiona todos los aspectos de tu empresa desde un solo lugar!</p>
                </div>

                {/* Navegación entre secciones */}
                <div className="admin-sections">
                    <button
                        className={`section-button ${activeSection === 'usuarios' ? 'active' : ''}`}
                        onClick={() => setActiveSection('usuarios')}
                    >
                        <FaUsers className="section-icon" /> Usuarios
                    </button>
                    <button
                        className={`section-button ${activeSection === 'horarios' ? 'active' : ''}`}
                        onClick={() => setActiveSection('horarios')}
                    >
                        <FaClock className="section-icon" /> Horarios
                    </button>
                    <button
                        className={`section-button ${activeSection === 'unidades' ? 'active' : ''}`}
                        onClick={() => setActiveSection('unidades')}
                    >
                        <FaBus className="section-icon" /> Unidades/Choferes
                    </button>
                    <button
                        className={`section-button ${activeSection === 'contacto' ? 'active' : ''}`}
                        onClick={() => setActiveSection('contacto')}
                    >
                        <FaEnvelope className="section-icon" /> Contacto
                    </button>
                </div>

                {/* Contenido dinámico según sección */}
                <div className="section-content">
                    {activeSection === 'usuarios' && (
                        <div className="table-container">
                            <h3>Gestión de Usuarios</h3>
                            <div className="table-responsive">
                                <Table className="custom-table" striped bordered hover variant="dark">
                                    <thead>
                                        <tr>
                                            <th>#ID</th>
                                            <th>Nombre y apellido</th>
                                            <th>Email</th>
                                            <th>Estado</th>
                                            <th>Rol</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody >
                                        {cargarUsuarios.map((usuario) => (
                                            <tr key={usuario._id}>
                                                <td>{usuario._id}</td>
                                                <td>{usuario.username}</td>
                                                <td>{usuario.email}</td>
                                                <td>{capitalizeFirstLetter(usuario.status)}</td>
                                                <td>{capitalizeFirstLetter(usuario.role)}</td>
                                                <td>
                                                    <button onClick={() => editarUsuarioClick(usuario)} title="Editar usuario">
                                                        <i className="fa-solid fa-pen-to-square fa-lg" style={{ color: '#000000' }}></i>
                                                    </button>
                                                    <button onClick={() => eliminarUsuarioClick(usuario._id)} title="Eliminar usuario">
                                                        <i className="fa-solid fa-trash fa-lg" style={{ color: '#c43131' }}></i>
                                                    </button>
                                                    <button onClick={() => inactivarUsuarioClick(usuario)} title={usuario.status === "inactive" ? "Activar usuario" : "Inactivar usuario"}>
                                                        <i className="fa-solid fa-unlock fa-lg" style={{ color: usuario.status === "inactive" ? '#ff0000' : '#3f9240' }}></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>

                                </Table>
                            </div>
                            <div className="d-flex justify-content-end me-5">
                                <button
                                    className="add-product-button border rounded-circle p-3 bg-dark"
                                    onClick={() => setIsModalOpenUser(true)}
                                    title='Agregar Usuario'
                                >
                                    <FaPlus className="add-product-icon text-white" />
                                </button>
                            </div>
                        </div>
                    )}

                    {activeSection === 'horarios' && (
                        <div className="table-container">
                            <h3>Gestión de Horarios</h3>
                            <p>Aquí podrás gestionar los horarios de la empresa.</p>

                            <section>
                                <h2>Paradas cargadas</h2>

                                {rutas.map((ruta) => (
                                    <div
                                        key={ruta.nombre}
                                        style={{
                                            marginBottom: '20px',
                                            border: '1px solid #ddd',
                                            padding: '10px',
                                            borderRadius: '8px'
                                        }}
                                    >
                                        <h3>Ruta: {ruta.nombre}</h3>

                                        {(paradasPorRuta[ruta.id] && paradasPorRuta[ruta.id].length > 0) ? (
                                            <ul className="paradas-lista">
                                                {paradasPorRuta[ruta.id].map((parada, index) => (
                                                    <li key={parada._id || `temp-${index}`} className="parada-item">
                                                        <span className="parada-info">
                                                            {parada.nombre} (Orden: {parada.orden})
                                                        </span>
                                                        <div className="parada-botones">

                                                            <button
                                                                onClick={() => editarParada(parada)}
                                                                title="Editar parada"
                                                                className="boton-editar"
                                                            >Editar
                                                                <i className="fa-solid fa-pen-to-square icono-boton"></i>
                                                            </button>
                                                            <button
                                                                onClick={() => eliminarParadaClick(parada._id)}
                                                                title="Eliminar parada"
                                                                className="boton-eliminar"
                                                            >Eliminar
                                                                <i className="fa-solid fa-trash icono-boton"></i>
                                                            </button>
                                                            <button

                                                                onClick={() => setHorarioEditando(parada)}
                                                                title="Ver horarios"
                                                                className="boton-horarios"
                                                            >Ver
                                                                <i className="fa-solid fa-clock icono-boton"></i>
                                                            </button>
                                                            <button
                                                                onClick={() => cargarHorario(parada)}
                                                                title="Cargar horario"
                                                                className="boton-cargar-horario"
                                                            >Agregar
                                                                <i className="fa-solid fa-calendar-plus icono-boton"></i>
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
                                            <p>No hay paradas cargadas para esta ruta.</p>
                                        )}

                                        <button
                                            className="boton-agregar-parada"
                                            onClick={() => {
                                                setRutaSeleccionada(ruta);
                                                setMostrarModal(true);
                                            }}
                                        >
                                            <i className="fa-solid fa-plus"></i> Agregar parada
                                        </button>

                                    </div>
                                ))}
                            </section>

                        </div>
                    )}

                    {activeSection === 'unidades' && (
                        <div className="table-container">
                            <h3>Gestión de Unidades y Choferes</h3>
                            <p>Aquí podrás gestionar las unidades y choferes de la empresa.</p>
                            {/* Contenido de unidades */}
                        </div>
                    )}

                    {activeSection === 'contacto' && (
                        <div className="table-container">
                            <h3>Contacto y Soporte</h3>
                            <p>Información de contacto y soporte técnico.</p>
                            {/* Contenido de contacto */}
                        </div>
                    )}
                </div>

                {/* Modales */}
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
                //asdasd
                />
                {/* Modal para agregar parada */}
                <AddParadaModal
                    isOpen={mostrarModal}
                    onClose={() => setMostrarModal(false)}
                    onSubmit={handleAgregarParada}
                />
                <AddHorarioModal
                    isOpen={modalHorarioAbierto}
                    onRequestClose={cerrarModalHorario}
                    paradaId={paradaSeleccionada?._id}
                    onSubmit={guardarHorario}
                />
                <EditParadaModal
                    isOpen={modalEditarParadaAbierto} 
                    onRequestClose={cerrarModalEditarParada}
                    parada={paradaSeleccionada}
                    onRecargarParadas={fetchParadasYHorarios}
                />
            </div>
            <Footer />
        </>
    );
};