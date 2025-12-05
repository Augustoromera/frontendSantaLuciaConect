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

export const UserManagement = ({ cargarUsuarios, recargarUsuarios }) => {
    const { user } = useAuth();
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
        _id: '',
        username: '',
        email: '',
        status: '',
        password: '',
        role: ''
    });

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

    // --- LOGICA DE CREAR USUARIO ---
    const handleChangeFormUser = (e) => {
        const value = e.target.type === "checkbox" ? (e.target.checked ? "active" : "inactive") : e.target.value;
        setFormDateUser({
            ...formDateUser,
            [e.target.name]: value,
        });
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

        await guardarUsuarioDb(username, email, status, password, role);
        showSuccessAlert('Usuario agregado!', 'El Usuario ha sido agregado exitosamente.');
        setFormDateUser({ username: '', email: '', status: '', password: '', role: '' });
        setIsModalOpenUser(false);
        recargarUsuarios();
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

        await editarUsuarioDb(_id, username, email, statusModif, role);
        showSuccessAlert('Usuario editado!', 'El Usuario ha sido editado exitosamente.');
        setIsModalOpenUserEditar(false);
        recargarUsuarios();
    };

    const editarUsuarioClick = (usuario) => {
        setFormDateUserEditar(usuario);
        setIsModalOpenUserEditar(true);
    };

    // --- LOGICA DE ELIMINAR/INACTIVAR ---
    const eliminarUsuarioClick = async (id) => {
        Swal.fire({
            icon: 'warning',
            title: '¿Estás seguro?',
            text: 'Esta acción eliminará el usuario permanentemente.',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            background: '#1e1e1e',
            color: 'white',
            confirmButtonColor: '#c43131'
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
                    recargarUsuarios();
                } catch (error) {
                    console.log(error);
                }
            }
        });
    };

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
            text: 'Esta acción cambiará el estado del usuario.',
            showCancelButton: true,
            confirmButtonText: 'Sí, cambiar',
            cancelButtonText: 'Cancelar',
            background: '#1e1e1e',
            color: 'white',
            confirmButtonColor: '#004aad'
        }).then(async (result) => {
            if (result.isConfirmed) {
                await editarUsuarioDb(_id, username, email, newstatus, lowerCaserole);
                recargarUsuarios();
            }
        });
    };

    return (
        <div className="user-management-container">
            <div className="header-actions">
                <h3>Gestión de Usuarios</h3>
                <button
                    className="btn-add-user"
                    onClick={() => setIsModalOpenUser(true)}
                    title='Agregar Usuario'
                >
                    <FaPlus className="icon-plus" /> Nuevo Usuario
                </button>
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
                        {cargarUsuarios.map((usuario) => (
                            <tr key={usuario._id}>
                                <td>
                                    <div className="user-info">
                                        <div className="user-avatar">{usuario.username.charAt(0).toUpperCase()}</div>
                                        <span>{usuario.username}</span>
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
                                        <button className="btn-icon delete" onClick={() => eliminarUsuarioClick(usuario._id)} title="Eliminar">
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
