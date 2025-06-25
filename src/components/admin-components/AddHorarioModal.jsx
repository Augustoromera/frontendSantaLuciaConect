import React, { useState } from 'react';
import Modal from 'react-modal';
import '../../pages/styles/modalAgregarHorario.css'

const ModalCargarHorario = ({ isOpen, onRequestClose, paradaId, onSubmit }) => {
    const [horario, setHorario] = useState('');
    const [tipoDia, setTipoDia] = useState('habil');
    const [turno, setTurno] = useState('mañana');
    const [orden, setOrden] = useState(1);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(paradaId, horario, tipoDia, orden, turno);
        setHorario('');
        setTipoDia('habil');
        setTurno('mañana');
        setOrden(1);
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
                        className='text-center'
                        value={horario}
                        onChange={(e) => setHorario(e.target.value)}
                        required
                    />

                    <label htmlFor="tipoDia">Tipo de día:</label>
                    <select
                        id="tipoDia"
                        value={tipoDia}
                        className='text-center'
                        onChange={(e) => setTipoDia(e.target.value)}
                        required
                    >
                        <option value="habil">Hábil</option>
                        <option value="sabado">Sábado</option>
                        <option value="domingo">Domingo</option>
                    </select>

                    <label htmlFor="turno">Turno:</label>
                    <select
                        id="turno"
                        className='text-center'
                        value={turno}
                        onChange={(e) => setTurno(e.target.value)}
                        required
                    >
                        <option value="mañana">Mañana</option>
                        <option value="tarde">Tarde</option>
                        <option value="noche">Noche</option>
                    </select>

                    <label htmlFor="orden">Orden:</label>
                    <input
                        type="number"
                        id="orden"
                        className='text-center'
                        value={orden}
                        min="1"
                        onChange={(e) => setOrden(Number(e.target.value))}
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
