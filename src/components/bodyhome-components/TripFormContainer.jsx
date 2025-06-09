// TripFormContainer.js (Refactor con MongoDB + API)
import React, { useEffect, useState } from 'react';
import axios from '../../api/axios';
import Swal from 'sweetalert2';

const TripFormContainer = () => {
    const [formData, setFormData] = useState({
        origen: '',
        destino: '',
        horario: '',
        idaVuelta: false,
        desdeMonteros: false,
    });

    const [paradas, setParadas] = useState([]);
    const [destinosDisponibles, setDestinosDisponibles] = useState([]);
    const [horariosDisponibles, setHorariosDisponibles] = useState([]);
    const [precio, setPrecio] = useState(null);
    const rutaId = '6846de00f0234bbe5766f9be'; // <- cambiar por tu ObjectId real

    useEffect(() => {
        axios.get(`/paradas?id_ruta=${rutaId}`)
            .then(res => setParadas(res.data))
            .catch(err => console.error(err));
    }, []);

    useEffect(() => {
        if (formData.origen && formData.destino) {
            axios.get(`/horarios?id_ruta=${rutaId}&origen=${formData.origen}&destino=${formData.destino}`)
                .then(res => setHorariosDisponibles(res.data))
                .catch(err => console.error(err));

            axios.get(`/tarifa?id_ruta=${rutaId}&origen=${formData.origen}&destino=${formData.destino}`)
                .then(res => setPrecio(res.data.precio))
                .catch(err => console.error(err));
        }
    }, [formData.origen, formData.destino]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const newFormData = {
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        };
        setFormData(newFormData);

        if (name === 'origen') {
            const destinos = paradas.map(p => p.nombre).filter(p => p !== value);
            setDestinosDisponibles(destinos);
            setFormData(prev => ({ ...prev, destino: '', horario: '' }));
            setHorariosDisponibles([]);
        }
    };

    const calcularDuracion = (salida, llegada) => {
        const [h1, m1] = salida.split(':').map(Number);
        const [h2, m2] = llegada.split(':').map(Number);
        let diff = (h2 * 60 + m2) - (h1 * 60 + m1);
        if (diff < 0) diff += 1440;
        const horas = Math.floor(diff / 60);
        const minutos = diff % 60;
        return `${horas}h ${minutos}m`;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const precioFinal = formData.idaVuelta && precio ? precio * 1.8 : precio;
        const horarioSeleccionado = horariosDisponibles.find(h => h.salida === formData.horario);
        const duracion = horarioSeleccionado ? calcularDuracion(horarioSeleccionado.salida, horarioSeleccionado.llegada) : 'No disponible';

        if (!formData.origen || !formData.destino || !formData.horario) {
            return Swal.fire({ icon: 'error', title: 'Faltan campos', text: 'Completa todo.' });
        }

        if (formData.origen === formData.destino) {
            return Swal.fire({ icon: 'error', title: 'Error', text: 'Origen y destino no pueden ser iguales' });
        }

        Swal.fire({
            title: 'Resumen de viaje',
            html: `
        <p><strong>Ruta:</strong> ${formData.origen} ➔ ${formData.destino}</p>
        <p><strong>Salida:</strong> ${formData.horario}</p>
        <p><strong>Llegada:</strong> ${horarioSeleccionado?.llegada || 'N/D'}</p>
        <p><strong>Duración:</strong> ${duracion}</p>
        <p><strong>Precio:</strong> $${precioFinal?.toFixed(2) || '0.00'}</p>
        ${formData.idaVuelta ? '<p><strong>Tipo:</strong> Ida y vuelta</p>' : ''} `,
        });
    };

    return (
        <div className="quienes-somos-container">
            <h2>¿A DÓNDE VAS?</h2>
            <form onSubmit={handleSubmit} className="viaje-form">
                <div className="route-selection">
                    <div className="location-selectors">
                        <select name="origen" value={formData.origen} onChange={handleChange} required>
                            <option value="">Seleccione origen</option>
                            {paradas.map(p => (
                                <option key={p._id} value={p.nombre}>{p.nombre}</option>
                            ))}
                        </select>

                        <select name="destino" value={formData.destino} onChange={handleChange} required disabled={!formData.origen}>
                            <option value="">Seleccione destino</option>
                            {destinosDisponibles.map((dest, i) => (
                                <option key={i} value={dest}>{dest}</option>
                            ))}
                        </select>
                    </div>

                    <label>
                        <input type="checkbox" name="idaVuelta" checked={formData.idaVuelta} onChange={handleChange} />
                        Ida y vuelta
                    </label>
                </div>

                {formData.origen && formData.destino && (
                    <div className="schedule-options">
                        <label>Horarios disponibles</label>
                        <select name="horario" value={formData.horario} onChange={handleChange} required>
                            <option value="">Seleccione un horario</option>
                            {horariosDisponibles.map((h, i) => (
                                <option key={i} value={h.salida}>
                                    Salida: {h.salida} - Llegada: {h.llegada}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                <div className="submit-section">
                    <button type="submit">CONSULTAR VIAJE</button>
                </div>
            </form>
        </div>
    );
};

export default TripFormContainer;