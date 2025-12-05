import React, { useState, useEffect } from 'react';
import { Table, Button, Spinner, Form } from 'react-bootstrap';
import { FaPlus, FaTrash, FaSave, FaClock } from 'react-icons/fa';
import Swal from 'sweetalert2';
import pruebaApi from '../../../api/pruebaApi';
import '../../styles/adminscreen.css';
export const ScheduleMatrix = ({ initialRutaId, rutas, onAddStop, onEditStop, onDeleteStop, lastUpdate }) => {
    const [selectedRutaId, setSelectedRutaId] = useState(initialRutaId || (rutas[0] ? rutas[0].id : ''));
    const [paradas, setParadas] = useState([]);
    const [matrix, setMatrix] = useState([]);
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
            // 2. Fetch All Times
            let allHorarios = [];
            // Optimization: Fetch all schedules for the route in one go if possible, 
            // but the current API only supports by stop. We'll loop for now.
            // A better API endpoint `GET /api/horarios?id_ruta=...` would be ideal.
            const schedulesByStop = {};
            for (const p of paradasData) {
                const resHorario = await pruebaApi.get(`api/obtenerHorarios?id_ruta=${selectedRutaId}&id_parada=${p._id}`);
                // API returns { allHorarios, horarioFiltrado }
                schedulesByStop[p._id] = resHorario.data.allHorarios || [];
            }
            // 3. Group by Trip ID (nro_orden)
            const tripsMap = new Map(); // Key: nro_orden (or provisional-id), Value: { id: tripId, cells: { stopId: { value, id, ... } } }
            const legacyTrips = []; // For nro_orden === 0 or undefined
            paradasData.forEach(p => {
                const stopsSchedules = schedulesByStop[p._id];
                stopsSchedules.forEach(h => {
                    if (h.nro_orden && h.nro_orden !== 0 && h.nro_orden !== '0') {
                        // Strict Grouping
                        if (!tripsMap.has(h.nro_orden)) {
                            tripsMap.set(h.nro_orden, { id: h.nro_orden, cells: {} });
                        }
                        tripsMap.get(h.nro_orden).cells[p._id] = {
                            value: h.horario,
                            id: h._id,
                            originalValue: h.horario,
                            tipo_dia: h.tipo_dia,
                            turno: h.turno
                        };
                    } else {
                        // Legacy Data (No nro_orden)
                        // specific logic: group by index in the array for that stop? 
                        // This is risky but best effort for now.
                        // We will collect them and try to stitch them later or just show them somewhat disjointed?
                        // Actually, better to just push them into a list and try to align by time?
                        // For simplicity in this fix, we might treat them as "orphan" cells if we can't match?
                        // Let's rely on the index method for legacy.
                    }
                });
            });
            // Handle Legacy (nro_orden implies modern logic). 
            // If data is old, we fallback to the "Index" method for those with nro_orden == 0
            // Find max length of legacy items
            let maxLegacyLength = 0;
            paradasData.forEach(p => {
                const legacy = schedulesByStop[p._id].filter(h => !h.nro_orden || h.nro_orden == 0);
                if (legacy.length > maxLegacyLength) maxLegacyLength = legacy.length;
            });
            const mixedMatrix = [];
            // Add Strict Trips
            tripsMap.forEach(trip => {
                mixedMatrix.push({
                    id: trip.id,
                    cells: trip.cells,
                    isDirty: false,
                    isNew: false
                });
            });
            // Add Legacy Trips (Best Effort Alignment by Index)
            for (let i = 0; i < maxLegacyLength; i++) {
                const row = { id: `legacy-${i}`, cells: {}, isLegacy: true };
                let hasData = false;
                paradasData.forEach(p => {
                    const legacy = schedulesByStop[p._id].filter(h => !h.nro_orden || h.nro_orden == 0);
                    if (legacy[i]) {
                        row.cells[p._id] = {
                            value: legacy[i].horario,
                            id: legacy[i]._id,
                            originalValue: legacy[i].horario,
                            tipo_dia: legacy[i].tipo_dia,
                            turno: legacy[i].turno
                        };
                        hasData = true;
                    }
                });
                if (hasData) mixedMatrix.push(row);
            }
            // Fill empty cells for all rows
            mixedMatrix.forEach(row => {
                paradasData.forEach(p => {
                    if (!row.cells[p._id]) {
                        row.cells[p._id] = { value: '', id: null };
                    }
                });
            });
            // Sort Matrix by the time of the first stop (or first available time)
            mixedMatrix.sort((a, b) => {
                const getFirstTime = (row) => {
                    for (const p of paradasData) {
                        if (row.cells[p._id]?.value) return row.cells[p._id].value;
                    }
                    return "99:99";
                };
                return getFirstTime(a).localeCompare(getFirstTime(b));
            });
            setMatrix(mixedMatrix);
        } catch (error) {
            console.error("Error fetching data", error);
            Swal.fire('Error', 'No se pudieron cargar los horarios', 'error');
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchData();
    }, [selectedRutaId, rutas, lastUpdate]);
    // Handlers
    const handleCellChange = (rowIndex, paradaId, newValue) => {
        const newMatrix = [...matrix];
        if (!newMatrix[rowIndex].cells[paradaId]) {
            newMatrix[rowIndex].cells[paradaId] = { value: '', id: null };
        }
        newMatrix[rowIndex].cells[paradaId].value = newValue;
        newMatrix[rowIndex].isDirty = true;
        setMatrix(newMatrix);
    };
    const addTrip = () => {
        // Generate a numeric ID based on timestamp to ensure uniqueness
        const tripId = Date.now();
        const newRow = {
            id: tripId, // Use this for nro_orden
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
        // Validation: Need at least one time?
        const hasTime = Object.values(row.cells).some(c => c.value && c.value.trim() !== '');
        if (!hasTime) {
            Swal.fire('Atención', 'La fila está vacía', 'warning');
            return;
        }
        setSaving(true);
        try {
            // Determine Trip ID
            let tripId = row.id;
            if (row.isLegacy) {
                // Convert legacy row to strict row?
                tripId = Date.now();
            }
            const promises = paradas.map(async p => {
                const cell = row.cells[p._id];
                const value = cell?.value || '';
                // Skip if empty and no ID (nothing to save)
                if ((!cell || !value) && !cell?.id) return;
                // If it has ID but value is empty -> Delete it? Or just clear?
                // Let's assume clear = delete logic or just empty string?
                // User requirement: "Correcciones en gestion de horarios".
                // If user clears a cell, we likely want to delete that schedule entry.
                if (cell?.id && (!value || value.trim() === '')) {
                    await pruebaApi.delete(`/api/admin-page/eliminarHorario/${cell.id}`);
                    return;
                }
                if (!value) return;
                const payload = {
                    id_parada: p._id,
                    horario: value,
                    tipo_dia: 'habil', // You might want a global selector for this in the matrix
                    nro_orden: tripId, // STRICT LINKING
                    turno: 'mañana', // Default, maybe infer?
                    shown: true,
                    // id_ruta: selectedRutaId // Model schema says required false, but good to have if needed
                };
                if (cell.id) {
                    // Update
                    // We use proper endpoint or generic logic. 
                    // Controller 'editarHorario' accepts array, but we are doing one by one here or we can batch.
                    // Let's use individual update? Backend `editarHorario` handles array.
                    // Let's construct a batch update for the row.
                } else {
                    // Create
                    await pruebaApi.post('/api/admin-page/nuevoHorario', payload);
                }
            });
            // Wait for deletions/creations.
            // For updates, the current backend `editarHorario` takes an array of `{_id, horario, shown}`.
            // It does NOT accept `nro_orden` updates in that endpoint!
            // WE NEED TO FIX THIS. If we can't update `nro_orden` in backend, we might have issues migrating legacy.
            // WORKAROUND: Delete and Re-create if it's legacy or if we want to enforce new ID?
            // OR: Just assume `editarHorario` updates time. 
            // BUT: We want to set `nro_orden`. 
            // The `editarHorario` controller: `await Horario.findByIdAndUpdate(horario._id, { horario: horario.horario, shown: horario.shown });`
            // It ONLY updates `horario` and `shown`. It ignores `nro_orden`.
            // STRATEGY: 
            // For existing cells with IDs:
            // 1. If we are converting legacy -> We must DELETE and CREATE NEW with correct `nro_orden`.
            // 2. If it's already strict -> Update time is fine.
            const updates = [];
            for (const p of paradas) {
                const cell = row.cells[p._id];
                const value = cell?.value || '';
                // Case: Delete
                if (cell?.id && (!value || value.trim() === '')) {
                    await pruebaApi.delete(`/api/admin-page/eliminarHorario/${cell.id}`);
                    continue;
                }
                if (!value) continue;
                // Case: Update Legacy to Strict
                if (cell.id && row.isLegacy) {
                    // Delete old
                    await pruebaApi.delete(`/api/admin-page/eliminarHorario/${cell.id}`);
                    // Create new with Trip ID
                    await pruebaApi.post('/api/admin-page/nuevoHorario', {
                        id_parada: p._id,
                        horario: value,
                        tipo_dia: cell.tipo_dia || 'habil',
                        nro_orden: tripId,
                        turno: cell.turno || 'mañana',
                        shown: true
                    });
                    continue;
                }
                // Case: Normal Update
                if (cell.id) {
                    updates.push({ _id: cell.id, horario: value, shown: true });
                } else {
                    // Case: New
                    await pruebaApi.post('/api/admin-page/nuevoHorario', {
                        id_parada: p._id,
                        horario: value,
                        tipo_dia: 'habil',
                        nro_orden: tripId,
                        turno: 'mañana',
                        shown: true
                    });
                }
            }
            if (updates.length > 0) {
                await pruebaApi.put('/api/admin-page/editarHorario', { horarios: updates });
            }
            Swal.fire('Guardado', 'Fila guardada correctamente', 'success');
            fetchData();
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
            text: 'Esto eliminará los horarios asociados.',
            icon: 'warning',
            showCancelButton: true
        });
        if (result.isConfirmed) {
            try {
                const promises = [];
                Object.values(row.cells).forEach(cell => {
                    if (cell.id) {
                        promises.push(pruebaApi.delete(`/api/admin-page/eliminarHorario/${cell.id}`));
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
                        <FaPlus /> Nuevo Recorrido
                    </Button>
                    <Button variant="primary" onClick={() => onAddStop && onAddStop(selectedRutaId)}>
                        <FaPlus /> Nueva Parada
                    </Button>
                </div>
            </div>
            <div className="alert alert-info" style={{ fontSize: '0.9rem' }}>
                <i className="fa-solid fa-info-circle me-2"></i>
                Los recorridos están agrupados. Si editas una fila antigua (Legacy), se convertirá automáticamente al nuevo sistema seguro al guardar.
            </div>
            {loading ? <Spinner animation="border" variant="light" /> : (
                <div className="table-responsive">
                    <Table bordered variant="dark" hover className="matrix-table text-center align-middle">
                        <thead>
                            <tr>
                                <th style={{ width: '50px' }}>#</th>
                                {paradas.map(p => (
                                    <th key={p._id} style={{ minWidth: '120px' }}>
                                        <div className="d-flex flex-column align-items-center">
                                            <span>{p.nombre}</span>
                                            <div className="d-flex gap-2 mt-1 opacity-50">
                                                <Button size="sm" variant="link" className="p-0 text-info" onClick={() => onEditStop && onEditStop(p)}>
                                                    <i className="fa-solid fa-pen-to-square"></i>
                                                </Button>
                                                <Button size="sm" variant="link" className="p-0 text-danger" onClick={() => onDeleteStop && onDeleteStop(p._id)}>
                                                    <FaTrash />
                                                </Button>
                                            </div>
                                        </div>
                                    </th>
                                ))}
                                <th style={{ width: '80px' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {matrix.map((row, rowIndex) => (
                                <tr key={row.id} style={row.isLegacy ? { backgroundColor: '#2a2020' } : {}}>
                                    <td className="text-muted" title={row.id}>{rowIndex + 1} {row.isLegacy && '*'}</td>
                                    {paradas.map(p => (
                                        <td key={p._id} className="p-1">
                                            <input
                                                type="time"
                                                className="form-control form-control-sm bg-transparent text-white border-0 text-center"
                                                style={{ boxShadow: 'none' }}
                                                value={row.cells[p._id]?.value || ''}
                                                onChange={(e) => handleCellChange(rowIndex, p._id, e.target.value)}
                                            />
                                        </td>
                                    ))}
                                    <td>
                                        {(row.isDirty || row.isLegacy) && (
                                            <Button size="sm" variant="outline-success" className="me-1" onClick={() => saveRow(rowIndex)} disabled={saving} title="Guardar cambios">
                                                <FaSave />
                                            </Button>
                                        )}
                                        <Button size="sm" variant="outline-danger" onClick={() => deleteRow(rowIndex)} title="Eliminar fila">
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
