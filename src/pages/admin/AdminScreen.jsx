import React, { useEffect, useState } from 'react';
import Table from 'react-bootstrap/Table';
import { FaPlus } from 'react-icons/fa';
import pruebaApi from '../../api/pruebaApi';
import Header from '../../components/Header';
import '../styles/adminscreen.css';
import Swal from 'sweetalert2';
import EditMenuModal from '../../components/admin-components/EditMenuModal';
import AddUserModal from '../../components/admin-components/AddUserModal';
import AddMenuModal from '../../components/admin-components/AddMenuModal';
import EditUserModal from '../../components/admin-components/EditUserModal';
import { useAuth } from '../../context/AuthContext';
import { getAuthToken } from '../../api/auth';
import { Footer } from '../../components/Footer';


export const AdminScreen = () => {
    const { user } = useAuth();
    // Variables de estado
    const [cargarUsuarios, setCargarUsuarios] = useState([]);
    
    // Estados para controlear la apertura de los modales
    
    const [isModalOpenUser, setIsModalOpenUser] = useState(false);
    
    const [isModalOpenUserEditar, setIsModalOpenUserEditar] = useState(false);

    // Estados para almacenar los datos de los formularios de agregar/editar productos y usuarios
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
    // Función para manejar cambios en los inputs de los formularios de agregar y editar (usuarios )

    const handleChangeFormUser = (e) => {

        const value = e.target.type === "checkbox" ? (e.target.checked ? "active" : "inactive") : e.target.value;
        setFormDateUser({
            ...formDateUser,
            [e.target.name]: value,
        })

    }
    const handleChangeFormUserEditar = (e) => {
        const { value, type, checked } = e.target;
        if (type === "checkbox") {
            setFormDateUserEditar({
                ...formDateUserEditar,
                [e.target.name]: checked,
            })
        } else {
            // Si es otro tipo de elemento de entrada (por ejemplo, un campo de texto), actualiza el estado normalmente
            setFormDateUserEditar({
                ...formDateUserEditar,
                [e.target.name]: value,
            });
        }
        console.log(formDateUserEditar);
    }
    

    
    // Función para manejar el envío del formulario de agregar usuario
    const handleSubmitFormUser = (e) => {
        e.preventDefault();
        var { username, email, status, password, role } = formDateUser;
        //username=username.trim;
        const regexPass = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/
        role = role ? role.toLowerCase() : "user";
        status = status ? status.toLowerCase() : "inactive";
        if (!username.trim() || !email.trim() || !password.trim()) {
            Swal.fire({
                icon: 'error',
                title: 'Campos incompletos',
                text: 'Por favor completa todos los campos.',
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
            return;
        }
        if (!verificarFormatoEmail(email)) {
            Swal.fire({
                icon: 'error',
                title: 'Formato de correo incorrecto',
                text: 'Por favor ingresa un correo electrónico válido.', background: 'black',
                color: 'white',
                customClass: {
                    container: 'custom-swal-container',
                    title: 'custom-swal-title',
                    content: 'custom-swal-content',
                    confirmButton: 'custom-swal-confirm-button',
                    cancelButton: 'custom-swal-cancel-button',
                },
            });
            return
        }
        if (!regexPass.test(password)) {
            Swal.fire({
                icon: 'error',
                title: 'Formato de contraseña incorrecto',
                text: 'Debe contener al menos una mayuscula, minusculas y al menos 8 caracteres',
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
            return
        }


        Swal.fire({
            icon: 'success',
            title: 'Usuario agregado!',
            text: 'El Usuario ha sido agregado exitosamente.',
            background: 'black',
            color: 'white', customClass: {
                container: 'custom-swal-container',
                title: 'custom-swal-title',
                content: 'custom-swal-content',
                confirmButton: 'custom-swal-confirm-button',
                cancelButton: 'custom-swal-cancel-button',
            },
        });

        setFormDateUser({
            username: '',
            email: '',
            status: '',
            password: '',
            role: ''
        });
        guardarUsuarioDb(username, email, status, password, role);

        recargarPagina()
    };
    // Función para manejar el envío del formulario de editar usuario
    const handleSubmitFormUserEditar = async (e) => {
        e.preventDefault();
        var { _id, username, email, status, role } = formDateUserEditar;
        role = role ? role.toLowerCase() : "user";
        let statusModif = status ? "active" : "inactive";
        if (!_id) {
            return Swal.fire({
                icon: 'error',
                title: 'No se encontro el Menu',
                text: 'Por favor contactese con el administrador.',
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
        }
        if (!username.trim() || !email.trim() || !role) {
            Swal.fire({
                icon: 'error',
                title: 'Campos incompletos',
                text: 'Por favor completa todos los campos.',
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
            return;
        }
        if (!verificarFormatoEmail(email)) {
            Swal.fire({
                icon: 'error',
                title: 'Formato de correo incorrecto',
                text: 'Por favor ingresa un correo electrónico válido.',
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
            return
        }

        Swal.fire({
            icon: 'success',
            title: 'Usuario editado!',
            text: 'El Usuario ha sido editado exitosamente.',
            background: 'black',
            color: 'white', customClass: {
                container: 'custom-swal-container',
                title: 'custom-swal-title',
                content: 'custom-swal-content',
                confirmButton: 'custom-swal-confirm-button',
                cancelButton: 'custom-swal-cancel-button',
            },
        });

        setFormDateUser({
            username: '',
            email: '',
            status: '',
            password: '',
            role: ''
        });
        editarUsuarioDb(_id, username, email, statusModif, role);
        recargarPagina();
    };
    


    // Funciones para interactuar con la API que permiten operaciones CRUD (Crear, Leer, Actualizar, Eliminar)
    
    const editarUsuarioDb = async (_id, username, email, status, role) => {

        try {
            const resp = await pruebaApi.put('/api/admin-page/editarUsuario', {
                _id,
                username,
                email,
                status,
                role
            }, {
                withCredentials: true,
                headers: {
                    Authorization: `Bearer ${getAuthToken()}`,
                    User: JSON.stringify(user),
                },
            });
            console.log(resp);
        } catch (error) {
            console.log(error)
        }
    }
    

    
    const guardarUsuarioDb = async (username, email, status, password, role) => {
        try {
            const resp = await pruebaApi.post('api/admin-page/nuevoUsuario', {
                username,
                email,
                status,
                password,
                role
            }, {
                withCredentials: true,
                headers: {
                    Authorization: `Bearer ${getAuthToken()}`,
                    User: JSON.stringify(user),
                },
            });
            console.log(resp);
        } catch (error) {
            console.log(error)
        }
    }

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


    
    


    const editarUsuarioClick = async (usuario) => {
        setFormDateUserEditar(usuario);
        setIsModalOpenUserEditar(true);
    }
    const eliminarUsuarioClick = async (id) => {
        Swal.fire({
            icon: 'warning',
            title: '¿Estás seguro?',
            text: 'Esta acción eliminará el usuario permanentemente.',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            background: 'black',
            color: 'white', customClass: {
                container: 'custom-swal-container',
                title: 'custom-swal-title',
                content: 'custom-swal-content',
                confirmButton: 'custom-swal-confirm-button',
                cancelButton: 'custom-swal-cancel-button',
            },
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const resp = await pruebaApi.delete(`/api/admin-page/eliminarUsuario/${id}`, {
                        withCredentials: true,
                        headers: {
                            Authorization: `Bearer ${getAuthToken()}`,
                            User: JSON.stringify(user),
                        },
                    });
                    console.log(resp);
                    Swal.fire({
                        icon: 'success',
                        title: '¡Usuario Eliminado!',
                        text: 'El usuario ha sido eliminado exitosamente.',
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
                    recargarPagina();
                } catch (error) {
                    console.log(error);
                }
            }
        });
    }


    const inactivarUsuarioClick = async (usuario) => {
        const { _id, username, email, status, role } = usuario;
        const lowerCaserole = role ? role.toLowerCase() : "user";
        const lowerCasestatus = status ? status.toLowerCase() : "inactive";
        const newstatus = lowerCasestatus === "active" ? "inactive" : "active";

        if (!_id) {
            return Swal.fire({
                icon: 'error',
                title: 'No se encontró el Usuario',
                text: 'Por favor contacte al administrador.',
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
        }

        Swal.fire({
            icon: 'warning',
            title: '¿Estás seguro?',
            text: 'Esta acción cambiará el estado del usuario, luego podrá modificarlo.',
            showCancelButton: true,
            confirmButtonText: 'Sí, cambiar',
            cancelButtonText: 'Cancelar',
            background: 'black',
            color: 'white', customClass: {
                container: 'custom-swal-container',
                title: 'custom-swal-title',
                content: 'custom-swal-content',
                confirmButton: 'custom-swal-confirm-button',
                cancelButton: 'custom-swal-cancel-button',
            },
        }).then((result) => {
            if (result.isConfirmed) {
                setFormDateUser({
                    username: '',
                    email: '',
                    status: '',
                    password: '',
                    role: ''
                });
                editarUsuarioDb(_id, username, email, newstatus, lowerCaserole);
                recargarPagina();
            }
        });
    };
    


    //funcion para recargar pagina
    const recargarPagina = () => {
        setTimeout(() => {
            window.location.reload();
        }, 2000);
    }
    //funcion para capitalizar la primera letra a mayuscula
    function capitalizeFirstLetter(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    // Verificar formato de correo electrónico utilizando una expresión regular
    function verificarFormatoEmail(email) {
        // eslint-disable-next-line no-useless-escape
        const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
        if (!emailRegex.test(email)) {
            return false;

        }
        return true;
    }
    





    // Cargar datos iniciales al montar el componente
    useEffect(() => {
        // Cargar usuarios desde la base de datos
        cargarUserDB();


    }, []);
    //renderizado de componentes y elementos de la interfaz
    return (
        <>
            <Header></Header>
            {/* codigo para tablas  */}
            <div className="pt-5">
                <div className="text-center mt-4 p-5">
                    <h1>Bienvenido al Panel de Administración</h1>
                    <p>¡Aquí puedes gestionar usuarios, productos y pedidos de manera fácil y eficiente!</p>
                </div>


                <div className="table-container">
                    {/* Tabla para usuarios */}
                    <h3>Usuarios</h3>
                    <div className="table-responsive">
                        <Table className="custom-table" striped bordered hover variant="dark">
                            <thead>
                                <tr>
                                    <th>#ID</th>
                                    <th>Nombre y apellido</th>
                                    <th>Email</th>
                                    <th>Estado</th>
                                    <th>role</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            {cargarUsuarios.map((usuario) => {
                                return (
                                    <tbody key={usuario._id}>
                                        <tr>
                                            <td>{usuario._id}</td>
                                            <td>{usuario.username}</td>
                                            <td>{usuario.email}</td>
                                            <td>{capitalizeFirstLetter(usuario.status)}</td>
                                            <td>{capitalizeFirstLetter(usuario.role)}</td>
                                            <td>
                                                <button onClick={() => editarUsuarioClick(usuario)}
                                                    title={"Editar usuario"}
                                                >
                                                    <i className="fa-solid fa-pen-to-square fa-lg"
                                                        style={{ color: '#000000' }}></i>
                                                </button>
                                                <button onClick={() => eliminarUsuarioClick(usuario._id)}
                                                    title={"Eliminar usuario"}
                                                >
                                                    <i className="fa-solid fa-trash fa-lg"
                                                        style={{ color: '#c43131' }}></i>
                                                </button>
                                                <button onClick={() => inactivarUsuarioClick(usuario)}
                                                    title={usuario.status === "inactive" ? "Activar usuario" : "Inactivar usuario"}
                                                >
                                                    <i className="fa-solid fa-unlock fa-lg"
                                                        style={{ color: usuario.status === "inactive" ? '#ff0000' : '#3f9240' }}>
                                                    </i>
                                                </button>
                                            </td>
                                        </tr>
                                    </tbody>
                                );
                            })}
                        </Table>
                    </div>
                </div>



                {/* Boton para agregar usuarios */}
                <div className="d-flex justify-content-end me-5">
                    <button
                        className="add-product-button border rounded-circle p-3 bg-dark "
                        onClick={() => setIsModalOpenUser(true)}
                        title='Agregar Usuario'
                    >
                        <FaPlus className="add-product-icon text-white" />
                    </button>
                </div>


            </div>

            {/* Modal para agregar usuarios */}
            <AddUserModal
                isOpen={isModalOpenUser}
                setIsOpen={setIsModalOpenUser}
                onRequestClose={() => setIsModalOpenUser(false)}
                handleChangeFormUser={handleChangeFormUser}
                handleSubmitFormUser={handleSubmitFormUser}
                formDateUser={formDateUser}
            />
            {/* Modal para editar usuarios */}
            <EditUserModal
                isOpen={isModalOpenUserEditar}
                setIsOpen={setIsModalOpenUserEditar}
                handleChangeFormUserEditar={handleChangeFormUserEditar}
                handleSubmitFormUserEditar={handleSubmitFormUserEditar}
                formDateUserEditar={formDateUserEditar}
            />
            <Footer></Footer>
        </>
    );
};

