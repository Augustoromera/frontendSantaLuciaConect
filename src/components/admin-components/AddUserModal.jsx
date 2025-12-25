/* eslint-disable react/prop-types */
// AddMenuModal.js
import React from 'react';
import Modal from 'react-modal';
import '../../pages/styles/adminscreen.css';
import '../../pages/styles/modalEditarParada.css'; // Reuse valid styles
import { FaTimes } from 'react-icons/fa';

// eslint-disable-next-line react/prop-types
const AddUserModal = ({ isOpen, setIsOpen, onRequestClose, handleChangeFormUser, handleSubmitFormUser, formDateUser }) => {

    return (
        <Modal
            isOpen={isOpen}
            ariaHideApp={false}
            className="modal-contenido"
            overlayClassName="modal-overlay"
            onRequestClose={onRequestClose}
        >
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="m-0 text-white">Agregar Nuevo Usuario</h2>
                <button
                    type="button"
                    className="btn btn-link text-white p-0"
                    onClick={() => setIsOpen(false)}
                    style={{ fontSize: '1.5rem', textDecoration: 'none' }}
                >
                    <FaTimes />
                </button>
            </div>

            <form onSubmit={handleSubmitFormUser} className="formulario-parada">

                <div className="mb-3">
                    <label className="text-white p-2">Nombre</label>
                    <input
                        type="text"
                        name="username"
                        onChange={(e) => handleChangeFormUser(e)}
                        minLength="3"
                        maxLength="40"
                        pattern="[A-Za-z\s]+"
                        placeholder="Ingrese el nombre completo"
                        required
                        className="custom-input text-center"
                    />
                </div>

                <div className="mb-3">
                    <label className="text-white p-2">Email</label>
                    <input
                        type="email"
                        name="email"
                        onChange={(e) => handleChangeFormUser(e)}
                        placeholder="Ingrese el email"
                        required
                        className="custom-input text-center"
                    />
                </div>

                <div className="mb-3">
                    <label className="text-white p-2">Contraseña</label>
                    <input
                        type="password"
                        name="password"
                        minLength="8"
                        maxLength="12"
                        placeholder="Contraseña (Mín 8 caracteres)"
                        onChange={(e) => handleChangeFormUser(e)}
                        required
                        className="custom-input text-center"
                    />
                </div>

                <div className="mb-3">
                    <label className="text-white p-2">Rol</label>
                    <select
                        name="role"
                        onChange={(e) => handleChangeFormUser(e)}
                        className="custom-input text-center"
                        style={{ appearance: 'none' }}
                        required
                    >
                        <option value="" style={{ color: 'black' }}>Seleccionar Rol</option>
                        <option value="admin" style={{ color: 'black' }}>Administrador</option>
                        <option value="user" style={{ color: 'black' }}>Usuario</option>
                        <option value="chofer" style={{ color: 'black' }}>Chofer</option>
                    </select>
                </div>

                <div className="switch-container">
                    <label className="switch">
                        <input
                            type="checkbox"
                            name="status"
                            checked={formDateUser.status === "active"}
                            onChange={(e) => handleChangeFormUser(e)}
                        />
                        <span className="slider round"></span>
                    </label>
                    <span className="switch-label">Usuario Activo</span>
                </div>

                <div className="modal-botones">
                    <button type="submit" className="boton-guardar">
                        Dar de alta
                    </button>
                    <button type="button" onClick={() => setIsOpen(false)} className="boton-cancelar">
                        Cancelar
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default AddUserModal;
