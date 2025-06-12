import React, { useState } from 'react';
import Modal from 'react-modal';
import '../../pages/styles/modalhorarios.css';

const ModalCargarHorario = ({ isOpen, onRequestClose, paradaId, onSubmit }) => {
    const [horario, setHorario] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(paradaId, horario);
        setHorario('');
    };

    return (
        <Modal
            isOpen={isOpen}
            ariaHideApp={false}
            className="modal-overlay"
            overlayClassName="modal-backdrop"
            onRequestClose={onRequestClose}
        >
            <div className="modal-box">
                <h2 className="modal-title">Cargar horario</h2>
                <form onSubmit={handleSubmit} className="modal-form">
                    <label htmlFor="horario">Horario:</label>
                    <input
                        type="time"
                        id="horario"
                        value={horario}
                        onChange={(e) => setHorario(e.target.value)}
                        required
                    />
                    <div className="modal-actions">
                        <button type="submit" className="modal-button primary">Guardar</button>
                        <button type="button" className="modal-button secondary" onClick={onRequestClose}>Cancelar</button>
                    </div>
                </form>
            </div>
        </Modal>
    );
};

export default ModalCargarHorario;
