import React, { useEffect, useState } from 'react';
import axios from '../../api/axios';
import Swal from 'sweetalert2';

const TripFormContainer = () => {
    const [formData, setFormData] = useState({
        origen: '',
        destino: '',
        horario: '',
        idaVuelta: false,
        haciaSantaLucia: false,
    });

    const [paradas, setParadas] = useState([]);
    const [destinosDisponibles, setDestinosDisponibles] = useState([]);
    const [horariosDisponibles, setHorariosDisponibles] = useState([]);
    const [precio, setPrecio] = useState(null); // Puede ser número o string

    const rutas = {
        santaLucia: '6841ae01c11032698b6ade09',
        monteros: '6841af28447dea60cc03a67d',
    };

    const getRutaId = () =>
        formData.haciaSantaLucia ? rutas.monteros : rutas.santaLucia;

    const getTipoOrigenTarifa = () =>
        formData.haciaSantaLucia ? 'MONTEROS' : 'SANTA LUCIA';

    useEffect(() => {
        axios
            .get(`/paradas?id_ruta=${getRutaId()}`)
            .then(res => setParadas(res.data))
            .catch(err => console.error('Error al obtener paradas', err));
    }, [formData.haciaSantaLucia]);

    useEffect(() => {
        const { origen, destino } = formData;
        if (origen && destino) {
            const rutaId = getRutaId();
            const tipoOrigen = getTipoOrigenTarifa();

            console.log('Solicitando tarifa con params:', {
                id_ruta: rutaId,
                tipoOrigen,
                destino,
            });

            axios
                .get('/horarios', {
                    params: { id_ruta: rutaId, origen, destino },
                })
                .then(res => setHorariosDisponibles(res.data))
                .catch(err => console.error('Error al obtener horarios', err));

            axios
                .get('/tarifa', {
                    params: {
                        id_ruta: rutaId,
                        tipoOrigen,
                        destino,
                    },
                })
                .then(res => setPrecio(res.data.precio ?? null))
                .catch(err => {
                    console.error('Error al obtener tarifa', err);
                    setPrecio('CONSULTAR'); // Mensaje personalizado
                });
        }
    }, [formData.origen, formData.destino, formData.haciaSantaLucia]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (name === 'haciaSantaLucia') {
            setFormData({
                origen: '',
                destino: '',
                horario: '',
                idaVuelta: formData.idaVuelta,
                haciaSantaLucia: checked,
            });
            setDestinosDisponibles([]);
            setHorariosDisponibles([]);
            setPrecio(null);
            return;
        }

        if (name === 'origen') {
            const destinos = paradas
                .map(p => p.nombre)
                .filter(p => p !== value);
            setDestinosDisponibles(destinos);
            setHorariosDisponibles([]);
            setFormData(prev => ({
                ...prev,
                origen: value,
                destino: '',
                horario: '',
            }));
            return;
        }

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
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
        const { origen, destino, horario, idaVuelta, haciaSantaLucia } = formData;

        if (!origen || !destino || !horario) {
            return Swal.fire({
                icon: 'error',
                title: 'Faltan datos',
                text: 'Por favor completá todos los campos',
            });
        }

        if (origen === destino) {
            return Swal.fire({
                icon: 'error',
                title: 'Origen y destino no pueden ser iguales',
            });
        }

        const selectedHorario = horariosDisponibles.find(h => h.salida === horario) || {};
        const duracion = selectedHorario.salida
            ? calcularDuracion(selectedHorario.salida, selectedHorario.llegada)
            : 'N/D';

        const isPrecioValido = typeof precio === 'number' && !isNaN(precio);
        const precioFinal = idaVuelta && isPrecioValido ? precio * 1.8 : precio;

        const precioTexto = isPrecioValido
            ? `$${precioFinal?.toFixed(2)}`
            : 'Por favor consulte la parada siguiente a esta parada para obtener el precio';

        Swal.fire({
            title: 'Resumen de viaje',
            html: `
                <p><strong>Ruta:</strong> ${origen} ➔ ${destino}</p>
                <p><strong>Sentido:</strong> ${haciaSantaLucia ? 'Hacia Santa Lucía' : 'Desde Santa Lucía'}</p>
                <p><strong>Salida:</strong> ${horario}</p>
                <p><strong>Llegada:</strong> ${selectedHorario.llegada || 'N/D'}</p>
                <p><strong>Duración:</strong> ${duracion}</p>
                <p><strong>Precio:</strong> ${precioTexto}</p>
                ${idaVuelta && isPrecioValido ? '<p><strong>Tipo:</strong> Ida y vuelta</p>' : ''}
            `,
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

                        <select
                            name="destino"
                            value={formData.destino}
                            onChange={handleChange}
                            required
                            disabled={!formData.origen}
                        >
                            <option value="">Seleccione destino</option>
                            {destinosDisponibles.map((dest, i) => (
                                <option key={i} value={dest}>{dest}</option>
                            ))}
                        </select>
                    </div>

                    <div className="checkbox-group">
                        <label>
                            <input
                                type="checkbox"
                                name="idaVuelta"
                                checked={formData.idaVuelta}
                                onChange={handleChange}
                            />
                            Ida y vuelta
                        </label>
                        <label>
                            <input
                                type="checkbox"
                                name="haciaSantaLucia"
                                checked={formData.haciaSantaLucia}
                                onChange={handleChange}
                            />
                            Volviendo a santa lucia
                        </label>
                    </div>
                </div>

                {formData.origen && formData.destino && (
                    <div className="schedule-options">
                        <label>Horarios disponibles</label>
                        <select
                            name="horario"
                            value={formData.horario}
                            onChange={handleChange}
                            required
                        >
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
