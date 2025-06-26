import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../pages/styles/modalEditarParada.css';
import pruebaApi from '../../api/pruebaApi';
import { Spinner, Alert } from 'react-bootstrap';

const EditParadaModal = ({ isOpen, onRequestClose, parada, onRecargarParadas }) => {
  const [formData, setFormData] = useState({ nombre: '', ubicacion: '', orden: 0 });
  const [mensaje, setMensaje] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (parada) {
      setFormData({
        nombre: parada.nombre || '',
        ubicacion: parada.ubicacion || '',
        orden: parada.orden || 0,
      });
    }
  }, [parada]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'orden' ? parseInt(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMensaje(null);
    setError(null);

    try {
      await pruebaApi.put('/admin/editarParada', {
        _id: parada._id, 
        nombre: formData.nombre,
        ubicacion: formData.ubicacion,
        orden: formData.orden,
      });

      setMensaje('Parada editada correctamente');
      setTimeout(() => {
        setMensaje(null);
        onRequestClose();

        if(onRecargarParadas){
          onRecargarParadas()
        }
      }, 1000);
    } catch (err) {
      console.error(err);
      setError('Error al editar la parada. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      contentLabel="Editar Parada"
      className="modal-contenido"
      overlayClassName="modal-overlay"
      onRequestClose={onRequestClose}
    >
      <h2>Editar Parada</h2>

      {loading && (
        <div className="text-center my-2">
          <Spinner animation="border" />
        </div>
      )}
      {mensaje && <Alert variant="success">{mensaje}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}

      <form onSubmit={handleSubmit} className="formulario-parada">
        <label className="text-white p-2">Nombre:</label>
        <input
          type="text"
          name="nombre"
          value={formData.nombre}
          onChange={handleChange}
          required
          className="custom-input text-center"
        />

        <label className="text-white p-2">Ubicación:</label>
        <input
          type="text"
          name="ubicacion"
          value={formData.ubicacion}
          onChange={handleChange}
          required
          className="custom-input text-center"
        />

        <label className="text-white p-2">Orden:</label>
        <input
          type="number"
          name="orden"
          value={formData.orden}
          onChange={handleChange}
          required
          className="custom-input text-center"
        />

        <div className="modal-botones">
          <button type="submit" className="boton-guardar" disabled={loading}>
            Guardar
          </button>
          <button type="button" onClick={onRequestClose} className="boton-cancelar">
            Cancelar
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EditParadaModal;
