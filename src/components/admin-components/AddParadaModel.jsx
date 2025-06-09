import React, { useState } from 'react';
import Modal from 'react-modal';
import '../../pages/styles/modalParadas.css';

const AddParadaModal = ({ isOpen, onClose, onSubmit, onRequestClose }) => {
    const [nombre, setNombre] = useState('');
    const [orden, setOrden] = useState('');

    const customStyles = {
        overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(3px)',
        },
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ nombre, orden: parseInt(orden) });
        setNombre('');
        setOrden('');
        onClose();
    };

    if (!isOpen) return null;

    return (

        <Modal
            isOpen={isOpen}
            ariaHideApp={false}
            className="modal-overlay"
            overlayClassName="modal-backdrop"
            onRequestClose={onRequestClose}
        >
            <div className="modal-box">
                <div className="modal-header">
                    <h2 className="modal-title">Agregar nueva parada</h2>
                    <form onSubmit={handleSubmit} className="modal-form">
                        <label htmlFor="nombre">Nombre:</label>
                        <input
                            type="text"
                            id="nombre"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            required
                        />
                        <label htmlFor="orden">Orden:</label>
                        <input
                            type="number"
                            id="orden"
                            value={orden}
                            onChange={(e) => setOrden(e.target.value)}
                            required
                        />
                        <div className="modal-actions">
                            <button type="submit" className="modal-button primary">Guardar</button>
                            <button type="button" className="modal-button secondary" onClick={onClose}>Cancelar</button>
                        </div>
                    </form>
                </div>
            </div>
        </Modal>

    );
};

export default AddParadaModal;
