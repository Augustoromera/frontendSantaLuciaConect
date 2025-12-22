import React, { useEffect, useState } from 'react';
import Table from 'react-bootstrap/Table';
import { FaPlus, FaUsers, FaBus, FaClock, FaEnvelope, FaMoneyBillWave, FaBars, FaTimes, FaChevronRight, FaChevronLeft } from 'react-icons/fa';
import Header from '../../components/Header';
import '../styles/adminscreen.css';
import Swal from 'sweetalert2';
import EditUserModal from '../../components/admin-components/EditUserModal';
import AddUserModal from '../../components/admin-components/AddUserModal';
import { useAuth } from '../../context/AuthContext';
import { getAuthToken } from '../../api/auth';
import { Footer } from '../../components/Footer';
import AddParadaModal from '../../components/admin-components/AddParadaModel';
import AddHorarioModal from '../../components/admin-components/AddHorarioModal';
import EditHorariosModal from '../../components/admin-components/EditHorariosModal';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/adminHorarios.css';
import EditParadaModal from '../../components/admin-components/EditParadasModal';
import AdminContactScreen from './AdminContactScreen';
import { ScheduleMatrix } from './components/ScheduleMatrix';
import { TariffMatrix } from './components/TariffMatrix';
import UnitsAndDrivers from './components/UnitsAndDrivers';

import { seedDatabase } from '../../utils/seedFirestore';
import { getRutas } from '../../services/scheduleService';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';
import { db } from '../../firebase/config';
import AddRouteModal from '../../components/admin-components/AddRouteModal';

export const AdminScreen = () => {
    const { user } = useAuth();
    const [isAddRouteModalOpen, setIsAddRouteModalOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [activeSection, setActiveSection] = useState('usuarios');
    const [cargarUsuarios, setCargarUsuarios] = useState([]);

    const [paradasPorRuta, setParadasPorRuta] = useState({});
    const [lastUpdate, setLastUpdate] = useState(Date.now());

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


    const [rutas, setRutas] = useState([]);

    // Cargar Rutas Dinámicas
    useEffect(() => {
        const loadRutas = async () => {
            try {
                const rutasData = await getRutas();
                setRutas(rutasData);
            } catch (error) {
                console.error("Error cargando rutas:", error);
            }
        };
        loadRutas();
    }, [lastUpdate]); // Recargar si hay updates (aunque rutas raramente cambian por ahora)

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
                orden: parseInt(orden),
                id_ruta: rutaSeleccionada.id
            };

            await addDoc(collection(db, "paradas"), nuevaParada);

            await fetchParadasYHorarios(); // Actualiza las paradas después de agregar
            setMostrarModal(false);
            setLastUpdate(Date.now());
            Swal.fire('Éxito', 'Parada agregada', 'success');
        } catch (error) {
            console.error('Error al agregar parada:', error);
            Swal.fire('Error', 'No se pudo agregar la parada', 'error');
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
    const handleSubmitFormUser = async (e) => {
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

        const success = await guardarUsuarioDb(username, email, status, password, role);
        if (success) {
            showSuccessAlert('Usuario agregado!', 'El Usuario ha sido agregado exitosamente.');
            setFormDateUser({ username: '', email: '', status: '', password: '', role: '' });
            setIsModalOpenUser(false);
            cargarUserDB(); // Refresh list instead of reload
        }
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

        const success = await editarUsuarioDb(_id, username, email, statusModif, role);
        if (success) {
            showSuccessAlert('Usuario editado!', 'El Usuario ha sido editado exitosamente.');
            setIsModalOpenUserEditar(false);
            cargarUserDB(); // Refresh list
        }
    };

    const fetchParadasYHorarios = async () => {
        try {
            const nuevasParadas = {};

            // 1. Traer todas las paradas de una vez
            const paradasSnap = await getDocs(collection(db, "paradas"));
            const allParadas = paradasSnap.docs.map(d => ({ ...d.data(), _id: d.id }));

            for (const ruta of rutas) {
                // Filtrar paradas por ruta
                const paradasDeRuta = allParadas.filter(p => p.id_ruta === ruta.id).sort((a, b) => a.orden - b.orden);
                nuevasParadas[ruta.id] = paradasDeRuta;

                setParadasPorRuta(prev => ({
                    ...prev,
                    [ruta.id]: paradasDeRuta
                }));
            }
        } catch (error) {
            console.error(error);
        }
    };

    // Firestore Imports


    // Funciones de API (Reemplazadas por Firestore)
    const editarUsuarioDb = async (_id, username, email, status, role) => {
        try {
            const userRef = doc(db, "users", _id);
            await updateDoc(userRef, {
                username, email, status, role
            });
            return true;
        } catch (error) {
            console.log(error);
            showErrorAlert('Error', 'No se pudo actualizar el usuario');
            return false;
        }
    };

    const guardarUsuarioDb = async (username, email, status, password, role) => {
        try {
            // Nota: Crear usuario en Auth requiere una Cloud Function o hacerlo desde el cliente con carencia de seguridad (createUserWithEmail crea sesión).
            // Por simplicidad en migración frontend-only: Solo creamos el documento en 'users'.
            // El usuario real debe registrarse por la página de Registro, o aquí simulamos el registro si estuviéramos logueados como admin creando otro user (complejo en client-side SDK).
            // Solución temporal: Guardar en Firestore para visualización.
            await addDoc(collection(db, "users"), {
                username, email, status, role,
                createdAt: new Date().toISOString()
                // Password no se guarda en Firestore por seguridad
            });
            showSuccessAlert('Usuario registrado en DB', 'El usuario debe registrarse en Login para tener acceso real o usar Cloud Functions.');
            return true;
        } catch (error) {
            console.log(error);
            showErrorAlert('Error', 'No se pudo registrar el usuario');
            return false;
        }
    };

    const cargarUserDB = async () => {
        try {
            const usersCol = collection(db, "users");
            const snapshot = await getDocs(usersCol);
            const userList = snapshot.docs.map(doc => ({ ...doc.data(), _id: doc.id }));
            setCargarUsuarios(userList);
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
                    await deleteDoc(doc(db, "users", id));
                    showSuccessAlert('¡Usuario Eliminado!', 'El usuario ha sido eliminado exitosamente.');
                    cargarUserDB(); // Refresh list
                } catch (error) {
                    console.log(error);
                    showErrorAlert('Error', 'No se pudo eliminar el usuario');
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
                await deleteDoc(doc(db, "paradas", idParada));
                // Opcional: Eliminar horarios asociados a esta parada si fuera necesario
                await fetchParadasYHorarios(); // refrescar la lista
                setLastUpdate(Date.now());
                Swal.fire('Eliminado', 'La parada ha sido eliminada.', 'success');
            } catch (error) {
                console.error('Error al eliminar la parada:', error);
                Swal.fire('Error', 'No se pudo eliminar la parada.', 'error');
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
        }).then(async (result) => {
            if (result.isConfirmed) {
                setFormDateUser({
                    username: '', email: '', status: '', password: '', role: ''
                });
                const success = await editarUsuarioDb(_id, username, email, newstatus, lowerCaserole);
                if (success) {
                    cargarUserDB(); // Refresh list
                }
            }
        });
    };

    // Helpers

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
    // Delete Route Handler
    const handleEliminarRuta = async (rutaId) => {
        const result = await Swal.fire({
            title: '¿Eliminar Ruta?',
            text: 'Esta acción eliminará la ruta. Si tiene paradas u horarios, estos quedarán huérfanos o debes borrarlos manualmente.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#d33',
        });

        if (result.isConfirmed) {
            try {
                await deleteDoc(doc(db, "rutas", rutaId));
                Swal.fire('Eliminada', 'La ruta ha sido eliminada.', 'success');
                setLastUpdate(Date.now()); // Trigger reload
            } catch (error) {
                console.error("Error deleting route:", error);
                Swal.fire('Error', 'No se pudo eliminar la ruta.', 'error');
            }
        }
    };

    return (
        <div className="admin-layout-wrapper">
            <Header /> {/* Header Global */}

            <div className="admin-dashboard-container">
                {/* Mobile Toggle Button */}
                <button
                    className={`mobile-menu-toggle ${isMobileMenuOpen ? 'open' : ''}`}
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <FaChevronLeft /> : <FaChevronRight />}
                </button>

                {/* Sidebar Navigation */}
                <aside className={`admin-sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
                    <div className="sidebar-header">
                        <h3>Panel Admin</h3>
                    </div>
                    <div className="sidebar-menu">
                        <button
                            className={`sidebar-item ${activeSection === 'usuarios' ? 'active' : ''}`}
                            onClick={() => { setActiveSection('usuarios'); setIsMobileMenuOpen(false); }}
                        >
                            <FaUsers className="sidebar-icon" />
                            <span>Usuarios</span>
                        </button>
                        <button
                            className={`sidebar-item ${activeSection === 'horarios' ? 'active' : ''}`}
                            onClick={() => { setActiveSection('horarios'); setIsMobileMenuOpen(false); }}
                        >
                            <FaClock className="sidebar-icon" />
                            <span>Horarios</span>
                        </button>
                        <button
                            className={`sidebar-item ${activeSection === 'unidades' ? 'active' : ''}`}
                            onClick={() => { setActiveSection('unidades'); setIsMobileMenuOpen(false); }}
                        >
                            <FaBus className="sidebar-icon" />
                            <span>Unidades</span>
                        </button>
                        <button
                            className={`sidebar-item ${activeSection === 'tarifas' ? 'active' : ''}`}
                            onClick={() => { setActiveSection('tarifas'); setIsMobileMenuOpen(false); }}
                        >
                            <FaMoneyBillWave className="sidebar-icon" />
                            <span>Tarifas</span>
                        </button>
                        <button
                            className={`sidebar-item ${activeSection === 'contacto' ? 'active' : ''}`}
                            onClick={() => { setActiveSection('contacto'); setIsMobileMenuOpen(false); }}
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
                                <h3>Gestión de Horarios (Vista Matriz)</h3>
                                <button className="btn btn-warning" onClick={async () => {
                                    const res = await Swal.fire({
                                        title: '¿Inicializar Base de Datos?',
                                        text: "Esto borrará/sobreescribirá datos si existen conflictos. Úsalo solo la primera vez.",
                                        icon: 'warning',
                                        showCancelButton: true,
                                        confirmButtonText: 'Sí, inicializar'
                                    });
                                    if (res.isConfirmed) {
                                        const success = await seedDatabase();
                                        if (success) Swal.fire('Éxito', 'Base de datos poblada', 'success');
                                        else Swal.fire('Error', 'Revisa la consola', 'error');
                                    }
                                }}>
                                    Inicializar DB (Seed)
                                </button>
                                <button className="btn btn-primary" onClick={() => setIsAddRouteModalOpen(true)}>
                                    <FaPlus /> Nueva Ruta
                                </button>
                            </div>
                            <p style={{ color: '#aaa', marginBottom: '2rem' }}>
                                Edita los horarios como una tabla. Agrega filas para nuevos recorridos.
                            </p>

                            <ScheduleMatrix
                                initialRutaId={rutas[0]?.id}
                                rutas={rutas}
                                onAddStop={(rutaId) => {
                                    const r = rutas.find(r => r.id === rutaId);
                                    if (r) {
                                        setRutaSeleccionada(r);
                                        setMostrarModal(true);
                                    }
                                }}
                                onEditStop={editarParada}
                                onDeleteStop={eliminarParadaClick}
                                onDeleteRoute={handleEliminarRuta}
                                lastUpdate={lastUpdate}
                            />
                        </div>
                    )}

                    {activeSection === 'unidades' && (
                        <div className="section-container">
                            <UnitsAndDrivers />
                        </div>
                    )}

                    {activeSection === 'tarifas' && (
                        <div className="section-container">
                            <div className="header-actions">
                                <h3>Gestión de Tarifas</h3>
                            </div>
                            <p style={{ color: '#aaa', marginBottom: '2rem' }}>
                                Define los precios de los viajes entre paradas. Solo se permite cargar tarifa hacia adelante (Origen &lt; Destino).
                            </p>
                            <TariffMatrix
                                initialRutaId={rutas[0]?.id}
                                rutas={rutas}
                            />
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
            <AddRouteModal
                isOpen={isAddRouteModalOpen}
                onClose={() => setIsAddRouteModalOpen(false)}
                onRouteAdded={() => setLastUpdate(Date.now())} // Trigger refresh
            />
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