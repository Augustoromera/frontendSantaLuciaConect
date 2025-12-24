import React, { useState, useEffect } from 'react';
import Table from 'react-bootstrap/Table';
import { FaPlus, FaPen, FaTrash, FaUnlock, FaLock } from 'react-icons/fa';
import Swal from 'sweetalert2';
import pruebaApi from '../../../api/pruebaApi';
import { getAuthToken } from '../../../api/auth';
import { useAuth } from '../../../context/AuthContext';
import AddUserModal from '../../../components/admin-components/AddUserModal';
import EditUserModal from '../../../components/admin-components/EditUserModal';
import '../../styles/adminscreen.css';

export const UserManagement = ({ cargarUsuarios, recargarUsuarios }) => { // Props kept for compatibility but effectively unused if we internalize fetching
    const { user } = useAuth();
    const [usuarios, setUsuarios] = useState([]); // Local state for users
    const [loading, setLoading] = useState(true);
    const [isModalOpenUser, setIsModalOpenUser] = useState(false);
    const [isModalOpenUserEditar, setIsModalOpenUserEditar] = useState(false);

    // Estados para formularios
    const [formDateUser, setFormDateUser] = useState({
        username: '',
        email: '',
        status: '',
        password: '',
        role: ''
    });
    const [formDateUserEditar, setFormDateUserEditar] = useState({
        id: '', // Changed from _id to id for Firestore consistency
        username: '',
        email: '',
        status: '',
        password: '',
        role: ''
    });

    // --- FETCH DATA (Real-time) ---
    useEffect(() => {
        setLoading(true);
        // Using onSnapshot for real-time updates as requested by modern standards
        const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
            const usersData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setUsuarios(usersData);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching users:", error);
            showErrorAlert('Error', 'No se pudieron cargar los usuarios.');
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const capitalizeFirstLetter = (str) => {
        if (!str) return '';
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
            background: '#1e1e1e',
            color: 'white',
            confirmButtonColor: '#004aad'
        });
    };

    const showSuccessAlert = (title, text) => {
        Swal.fire({
            icon: 'success',
            title,
            text,
            background: '#1e1e1e',
            color: 'white',
            confirmButtonColor: '#004aad'
        });
    };

    // --- LOGICA DE CREAR USUARIO (Manual creation via Admin) ---
    const handleChangeFormUser = (e) => {
        const value = e.target.type === "checkbox" ? (e.target.checked ? "active" : "inactive") : e.target.value;
        setFormDateUser({
            ...formDateUser,
            [e.target.name]: value,
        });
    };

    // Note: Creating a user manually in Firestore *without* Auth is tricky because we can't create Auth users easily from client SDK without logging out.
    // Ideally this should use a Cloud Function or a secondary Auth app. 
    // For now, we will warn the admin or use a placeholder ID, but the proper way is 'createUserWithEmailAndPassword' which logs the current user out.
    // IMPROVEMENT: We will just add the document to Firestore, but they won't be able to login unless they register via Auth.
    // USUALLY Admin panels create users via a backend Admin SDK. 
    // Given the constraints (client-side only), we can create the DOC, but the Auth account won't exist.
    // Correct approach for client-side only: Only allow EDITING roles/status. Creation should be done via Registration Page.
    // However, I'll implement basic doc creation so it appears in the list, but with a warning.

    const handleSubmitFormUser = async (e) => {
        e.preventDefault();
        showErrorAlert('Funcionalidad Limitada', 'Desde el panel admin solo se pueden editar permisos. Los usuarios deben registrarse ellos mismos.');
        // To implement full creation, we'd need a backend function.
        setIsModalOpenUser(false);
    };

    // --- LOGICA DE EDITAR USUARIO ---
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

    const editarUsuarioDb = async (id, username, email, status, role) => {
        try {
            const userRef = doc(db, 'users', id);
            await updateDoc(userRef, {
                username,
                email,
                status,
                role
            });
            showSuccessAlert('Usuario editado!', 'El Usuario ha sido actualizado exitosamente.');
        } catch (error) {
            console.error(error);
            showErrorAlert('Error', 'No se pudo actualizar el usuario.');
        }
    };

    const handleSubmitFormUserEditar = async (e) => {
        e.preventDefault();
        var { id, username, email, status, role } = formDateUserEditar;
        role = role ? role.toLowerCase() : "user";
        // Correction: status comes as boolean/string depending on modal handling. 
        // If it comes from checkbox in modal, it might be boolean or 'active'/'inactive'. check implementation.
        // Assuming the modal passes 'active' or 'inactive' string or boolean.
        // Let's ensure it's a string.
        let statusModif = status === true || status === 'active' ? 'active' : 'inactive';

        if (!id) {
            showErrorAlert('Error', 'ID de usuario no encontrado.');
            return;
        }

        await editarUsuarioDb(id, username, email, statusModif, role);
        setIsModalOpenUserEditar(false);
    };

    const editarUsuarioClick = (usuario) => {
        // Map Firestore data to form Expected format
        setFormDateUserEditar({
            ...usuario,
            status: usuario.status === 'active' // Pass boolean for checkbox if modal expects it
        });
        setIsModalOpenUserEditar(true);
    };

    // --- LOGICA DE ELIMINAR/INACTIVAR ---
    const eliminarUsuarioClick = async (id) => {
        Swal.fire({
            icon: 'warning',
            title: '¿Estás seguro?',
            text: 'Esta acción eliminará el usuario permanentemente de la base de datos (no de Auth).',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            background: '#1e1e1e',
            color: 'white',
            confirmButtonColor: '#c43131'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await deleteDoc(doc(db, 'users', id));
                    showSuccessAlert('¡Usuario Eliminado!', 'El usuario ha sido eliminado.');
                } catch (error) {
                    console.error(error);
                    showErrorAlert('Error', 'No se pudo eliminar el usuario.');
                }
            }
        });
    };

    const inactivarUsuarioClick = async (usuario) => {
        const { id, status } = usuario;
        const newStatus = status === 'active' ? 'inactive' : 'active';

        try {
            await updateDoc(doc(db, 'users', id), {
                status: newStatus
            });
            // Smart feedback
            const msg = newStatus === 'active' ? 'Usuario activado. Ahora puede enviar consultas.' : 'Usuario inactivado. Ya no puede enviar consultas.';
            Swal.fire({
                icon: 'success',
                title: 'Estado Actualizado',
                text: msg,
                background: '#1e1e1e',
                color: 'white',
                timer: 2000,
                showConfirmButton: false
            });
        } catch (error) {
            console.error(error);
            showErrorAlert('Error', 'No se pudo cambiar el estado.');
        }
    };

    return (
        <div className="user-management-container">
            <div className="header-actions">
                <h3>Gestión de Usuarios</h3>
                {/* 
                <button
                    className="btn-add-user"
                    onClick={() => setIsModalOpenUser(true)}
                    title='Agregar Usuario'
                >
                    <FaPlus className="icon-plus" /> Nuevo Usuario
                </button>
                */}
            </div>

            <div className="table-responsive-custom">
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
                        {loading ? (
                            <tr><td colSpan="5" className="text-center">Cargando usuarios...</td></tr>
                        ) : usuarios.map((usuario) => (
                            <tr key={usuario.id}>
                                <td>
                                    <div className="user-info">
                                        <div className="user-avatar">{usuario.username ? usuario.username.charAt(0).toUpperCase() : '?'}</div>
                                        <span>{usuario.username || 'Sin nombre'}</span>
                                    </div>
                                </td>
                                <td>{usuario.email}</td>
                                <td><span className={`badge-role ${usuario.role}`}>{capitalizeFirstLetter(usuario.role)}</span></td>
                                <td>
                                    <span className={`badge-status ${usuario.status === 'active' ? 'active' : 'inactive'}`}>
                                        {usuario.status === 'active' ? 'Activo' : 'Inactivo'}
                                    </span>
                                </td>
                                <td>
                                    <div className="action-buttons">
                                        <button className="btn-icon edit" onClick={() => editarUsuarioClick(usuario)} title="Editar">
                                            <FaPen />
                                        </button>
                                        <button className="btn-icon toggle" onClick={() => inactivarUsuarioClick(usuario)} title={usuario.status === "inactive" ? "Activar" : "Inactivar"}>
                                            {usuario.status === "inactive" ? <FaLock /> : <FaUnlock />}
                                        </button>
                                        <button className="btn-icon delete" onClick={() => eliminarUsuarioClick(usuario.id)} title="Eliminar">
                                            <FaTrash />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </div>

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
        </div>
    );
};
