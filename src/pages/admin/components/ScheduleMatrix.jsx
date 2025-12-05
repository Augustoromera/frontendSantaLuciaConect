import React, { useState, useEffect } from 'react';
import { Table, Button, Spinner, Form } from 'react-bootstrap';
import { FaPlus, FaTrash, FaSave, FaClock } from 'react-icons/fa';
import Swal from 'sweetalert2';
import pruebaApi from '../../../api/pruebaApi';
import '../../styles/adminscreen.css'; // Re-use main styles

export const ScheduleMatrix = ({ initialRutaId, rutas, onAddStop, onEditStop, onDeleteStop, lastUpdate }) => {
    const [selectedRutaId, setSelectedRutaId] = useState(initialRutaId || (rutas[0] ? rutas[0].id : ''));
    const [paradas, setParadas] = useState([]);
    const [matrix, setMatrix] = useState([]); // Array of Rows (Trips), each Row is Array of Times
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Load Data
    const fetchData = async () => {
        if (!selectedRutaId) return;
        setLoading(true);
        try {
            // 1. Fetch Paradas (Columns)
            const resParadas = await pruebaApi.get(`api/paradas?id_ruta=${selectedRutaId}`);
            const paradasData = resParadas.data.sort((a, b) => a.orden - b.orden);
            setParadas(paradasData);

            // 2. Fetch All Times for these Paradas
            const timesByStop = {};
            let maxTrips = 0;

            for (const p of paradasData) {
                const resHorario = await pruebaApi.get(`api/obtenerHorarios?id_ruta=${selectedRutaId}&id_parada=${p._id}`);
                const all = resHorario.data.allHorarios || [];
                // const filtered = all.filter(h => h.tipo_dia === 'habil'); // kept for reference
                const filtered = all;

                timesByStop[p._id] = filtered;
                if (filtered.length > maxTrips) maxTrips = filtered.length;
            }

            // Build Matrix: Rows = Trips
            const newMatrix = [];
            for (let i = 0; i < maxTrips; i++) {
                const row = {};
                row.id = `trip-${i}`; // Virtual ID
                row.cells = {}; // Key: paradaId, Value: { time, id (if exists) }

                paradasData.forEach(p => {
                    const times = timesByStop[p._id];
                    if (times && times[i]) {
                        row.cells[p._id] = {
                            value: times[i].horario,
                            id: times[i]._id, // original DB id to update
                            originalValue: times[i].horario
                        };
                    } else {
                        row.cells[p._id] = { value: '', id: null };
                    }
                });
                newMatrix.push(row);
            }
            setMatrix(newMatrix);

        } catch (error) {
            console.error("Error fetching data", error);
            Swal.fire('Error', 'No se pudieron cargar los horarios', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [selectedRutaId, rutas, lastUpdate]); // Reload if route changes or props change

    // Handlers
    const handleCellChange = (rowIndex, paradaId, newValue) => {
        const newMatrix = [...matrix];
        // Ensure cell exists
        if (!newMatrix[rowIndex].cells[paradaId]) {
            newMatrix[rowIndex].cells[paradaId] = { value: '', id: null };
        }
        newMatrix[rowIndex].cells[paradaId].value = newValue;
        newMatrix[rowIndex].isDirty = true;
        setMatrix(newMatrix);
    };

    const addTrip = () => {
        const newRow = {
            id: `new-${Date.now()}`,
            cells: {},
            isDirty: true,
            isNew: true
        };
        paradas.forEach(p => {
            newRow.cells[p._id] = { value: '', id: null };
        });
        setMatrix([...matrix, newRow]);
    };

    const saveRow = async (rowIndex) => {
        const row = matrix[rowIndex];
        setSaving(true);
        try {
            // Save each cell in the row
            const promises = paradas.map(async p => {
                const cell = row.cells[p._id];
                if (!cell || !cell.value) return; // Skip empty

                if (cell.id) {
                    // Update existing - Logic pending backend support for individual update or we assume insert works?
                    // For now, focusing on Adds.
                } else {
                    // Create New
                    const nuevoHorario = {
                        id_parada: p._id,
                        horario: cell.value,
                        tipo_dia: 'habil', // Default
                        nro_orden: '0',
                        turno: 'mañana' // Logic to guess?
                    };
                    await pruebaApi.post('/admin/nuevoHorario', nuevoHorario);
                }
            });

            await Promise.all(promises);
            Swal.fire('Guardado', 'Fila guardada correctamente', 'success');
            fetchData(); // Refresh to get IDs
        } catch (e) {
            console.error(e);
            Swal.fire('Error', 'Error al guardar', 'error');
        } finally {
            setSaving(false);
        }
    };

    const deleteRow = async (rowIndex) => {
        const row = matrix[rowIndex];
        const result = await Swal.fire({
            title: '¿Eliminar fila?',
            text: 'Esto eliminará los horarios asociados en todas las paradas de esta fila.',
            icon: 'warning',
            showCancelButton: true
        });

        if (result.isConfirmed) {
            try {
                const promises = [];
                Object.values(row.cells).forEach(cell => {
                    if (cell.id) {
                        promises.push(pruebaApi.delete(`/admin/eliminarHorario/${cell.id}`));
                    }
                });
                await Promise.all(promises);
                fetchData();
            } catch (e) {
                Swal.fire('Error', 'No se pudieron eliminar algunos horarios', 'error');
            }
        }
    };


    return (
        <div className="schedule-matrix-container">
            <div className="matrix-header mb-3 d-flex gap-3 align-items-center flex-wrap">
                <Form.Select
                    value={selectedRutaId}
                    onChange={e => setSelectedRutaId(e.target.value)}
                    style={{ maxWidth: '300px', backgroundColor: '#1e1e1e', color: 'white', border: '1px solid #333' }}
                >
                    {rutas.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
                </Form.Select>

                <div className="d-flex gap-2">
                    <Button variant="success" onClick={addTrip}>
                        <FaPlus /> Nuevo Recorrido (Fila)
                    </Button>
                    <Button variant="primary" onClick={() => onAddStop && onAddStop(selectedRutaId)}>
                        <FaPlus /> Nueva Parada (Columna)
                    </Button>
                </div>
            </div>

            {loading ? <Spinner animation="border" variant="light" /> : (
                <div className="table-responsive">
                    <Table bordered variant="dark" hover className="matrix-table text-center align-middle">
                        <thead>
                            <tr>
                                <th style={{ width: '50px' }}>#</th>
                                {paradas.map(p => (
                                    <th key={p._id} style={{ minWidth: '150px' }}>
                                        <div className="d-flex flex-column align-items-center">
                                            <span>{p.nombre}</span>
                                            <div className="d-flex gap-2 mt-1">
                                                <Button size="sm" variant="link" className="p-0 text-info" onClick={() => onEditStop && onEditStop(p)} title="Editar nombre">
                                                    <i className="fa-solid fa-pen-to-square"></i>
                                                </Button>
                                                <Button size="sm" variant="link" className="p-0 text-danger" onClick={() => onDeleteStop && onDeleteStop(p._id)} title="Eliminar columna">
                                                    <FaTrash />
                                                </Button>
                                            </div>
                                        </div>
                                    </th>
                                ))}
                                <th style={{ width: '100px' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {matrix.map((row, rowIndex) => (
                                <tr key={row.id}>
                                    <td className="text-muted">{rowIndex + 1}</td>
                                    {paradas.map(p => (
                                        <td key={p._id} className="p-1">
                                            <input
                                                type="time"
                                                className="form-control form-control-sm bg-dark text-white border-0 text-center"
                                                value={row.cells[p._id]?.value || ''}
                                                onChange={(e) => handleCellChange(rowIndex, p._id, e.target.value)}
                                            />
                                        </td>
                                    ))}
                                    <td>
                                        {row.isDirty && (
                                            <Button size="sm" variant="outline-success" className="me-1" onClick={() => saveRow(rowIndex)} disabled={saving}>
                                                <FaSave />
                                            </Button>
                                        )}
                                        <Button size="sm" variant="outline-danger" onClick={() => deleteRow(rowIndex)}>
                                            <FaTrash />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            )}
        </div>
    );
};
