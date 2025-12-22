import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import Swal from 'sweetalert2';
import { createRuta } from '../../services/scheduleService';

const AddRouteModal = ({ isOpen, onClose, onRouteAdded }) => {
    const [formData, setFormData] = useState({
        nombre: '',
        origen: '',
        destino: '',
        tipo: 'ida' // Default, allows user to switch if needed or hidden
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.nombre || !formData.origen || !formData.destino) {
            Swal.fire('Error', 'Todos los campos son obligatorios', 'error');
            return;
        }

        setLoading(true);
        try {
            await createRuta(formData);
            Swal.fire('Éxito', 'Ruta creada correctamente', 'success');
            onRouteAdded(); // Refresh parent
            onClose();
            setFormData({ nombre: '', origen: '', destino: '', tipo: 'ida' });
        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'No se pudo crear la ruta', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={isOpen} onHide={onClose} centered className="custom-modal">
            <Modal.Header closeButton className="bg-dark text-white border-secondary">
                <Modal.Title>Agregar Nueva Ruta</Modal.Title>
            </Modal.Header>
            <Modal.Body className="bg-dark text-white">
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>Nombre de la Ruta</Form.Label>
                        <Form.Control
                            type="text"
                            name="nombre"
                            placeholder="Ej: Monteros → Las Mesadas"
                            value={formData.nombre}
                            onChange={handleChange}
                            className="bg-dark text-white border-secondary"
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Origen</Form.Label>
                        <Form.Control
                            type="text"
                            name="origen"
                            placeholder="Ej: Monteros"
                            value={formData.origen}
                            onChange={handleChange}
                            className="bg-dark text-white border-secondary"
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Destino</Form.Label>
                        <Form.Control
                            type="text"
                            name="destino"
                            placeholder="Ej: Las Mesadas"
                            value={formData.destino}
                            onChange={handleChange}
                            className="bg-dark text-white border-secondary"
                        />
                    </Form.Group>
                    {/* Optional Type Selector if still relevant for logic */}
                    <Form.Group className="mb-3">
                        <Form.Label>Tipo</Form.Label>
                        <Form.Select
                            name="tipo"
                            value={formData.tipo}
                            onChange={handleChange}
                            className="bg-dark text-white border-secondary"
                        >
                            <option value="ida">Ida</option>
                            <option value="vuelta">Vuelta</option>
                            <option value="circular">Circular/Otro</option>
                        </Form.Select>
                    </Form.Group>

                    <div className="d-flex justify-content-end gap-2 mt-4">
                        <Button variant="secondary" onClick={onClose}>Cancelar</Button>
                        <Button variant="success" type="submit" disabled={loading}>
                            {loading ? 'Guardando...' : 'Crear Ruta'}
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default AddRouteModal;
