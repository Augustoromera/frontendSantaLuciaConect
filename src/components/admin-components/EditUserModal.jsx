/* eslint-disable react/prop-types */
// EditMenuModal.js
import React from 'react';
import Modal from 'react-modal';
import '../../pages/styles/adminscreen.css';
import '../../pages/styles/modalEditarParada.css'; // Reuse valid styles
import { FaTimes } from 'react-icons/fa';

const EditUserModal = ({ isOpen, setIsOpen, handleChangeFormUserEditar, handleSubmitFormUserEditar, formDateUserEditar }) => {

    return (
        <Modal
            isOpen={isOpen}
            ariaHideApp={false}
            className="modal-contenido"
            overlayClassName="modal-overlay"
            onRequestClose={() => setIsOpen(false)}
        >
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="m-0 text-white">Editar Usuario</h2>
                <button
                    type="button"
                    className="btn btn-link text-white p-0"
                    onClick={() => setIsOpen(false)}
                    style={{ fontSize: '1.5rem', textDecoration: 'none' }}
                >
                    <FaTimes />
                </button>
            </div>

            <form onSubmit={handleSubmitFormUserEditar} className="formulario-parada">

                <div className="mb-3">
                    <label className="text-white p-2">Nombre</label>
                    <input
                        type="text"
                        name="username"
                        value={formDateUserEditar.username}
                        onChange={(e) => handleChangeFormUserEditar(e)}
                        placeholder="Ingrese el nombre"
                        minLength="3"
                        maxLength="40"
                        required
                        className="custom-input text-center"
                    />
                </div>

                <div className="mb-3">
                    <label className="text-white p-2">Email</label>
                    <input
                        type="email"
                        name="email"
                        value={formDateUserEditar.email}
                        onChange={(e) => handleChangeFormUserEditar(e)}
                        placeholder="Ingrese el email"
                        required
                        className="custom-input text-center"
                    />
                </div>

                <div className="mb-3">
                    <label className="text-white p-2">Rol</label>
                    <select
                        name="role"
                        value={formDateUserEditar.role}
                        onChange={(e) => handleChangeFormUserEditar(e)}
                        className="custom-input text-center"
                        style={{ appearance: 'none' }}
                    >
                        <option value="" style={{ color: 'black' }}>Seleccionar</option>
                        <option value="admin" style={{ color: 'black' }}>Administrador</option>
                        <option value="user" style={{ color: 'black' }}>Usuario</option>
                    </select>
                </div>

                <div className="switch-container">
                    <label className="switch">
                        <input
                            type="checkbox"
                            name="status"
                            checked={formDateUserEditar.status === "active" || formDateUserEditar.status === true}
                            onChange={(e) => handleChangeFormUserEditar(e)}
                        />
                        <span className="slider round"></span>
                    </label>
                    <span className="switch-label">Usuario Activo</span>
                </div>

                <div className="modal-botones">
                    <button type="submit" className="boton-guardar">
                        Guardar Cambios
                    </button>
                    <button type="button" onClick={() => setIsOpen(false)} className="boton-cancelar">
                        Cancelar
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default EditUserModal;
