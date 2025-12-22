import React, { useState, useEffect } from 'react';
import { Table, Button, Spinner, Form } from 'react-bootstrap';
import { FaPlus, FaTrash, FaSave, FaClock } from 'react-icons/fa';
import Swal from 'sweetalert2';
import pruebaApi from '../../../api/pruebaApi';
import '../../styles/adminscreen.css';
import { getParadasByRuta, getHorariosByRuta } from '../../../services/scheduleService';
import { collection, addDoc, updateDoc, deleteDoc, doc, writeBatch } from 'firebase/firestore';
import { db } from '../../../firebase/config';
export const ScheduleMatrix = ({ initialRutaId, rutas, onAddStop, onEditStop, onDeleteStop, onDeleteRoute, lastUpdate }) => {
    // State management
    const [selectedRutaId, setSelectedRutaId] = useState(initialRutaId || '');
    const [selectedDayType, setSelectedDayType] = useState('habil'); // New State
    const [paradas, setParadas] = useState([]);
    const [matrix, setMatrix] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    // Sync selectedRutaId when rutas load
    useEffect(() => {
        if (!selectedRutaId && rutas.length > 0) {
            setSelectedRutaId(rutas[0].id);
        }
    }, [rutas, selectedRutaId]);

    // Update unsaved changes flag
    useEffect(() => {
        setHasUnsavedChanges(matrix.some(row => row.isDirty));
    }, [matrix]);

    // Load Data
    const fetchData = async () => {
        if (!selectedRutaId) return;
        setLoading(true);
        console.log("Fetching schedule data for ruta:", selectedRutaId, "Day:", selectedDayType);
        try {
            // 1. Fetch Paradas
            const paradasData = await getParadasByRuta(selectedRutaId);
            setParadas(paradasData);

            // 2. Fetch All Horarios
            const allHorarios = await getHorariosByRuta(selectedRutaId);

            // 3. Group by Trip ID (nro_orden) AND Filter by Day Type
            const tripsMap = new Map();

            allHorarios.forEach(h => {
                // Filter by Day Type
                if (h.tipo_dia !== selectedDayType) return;

                const tripId = h.nro_orden;
                // Strict check: Must have valid nro_orden
                if (tripId && tripId !== 0 && tripId !== '0') {
                    if (!tripsMap.has(tripId)) {
                        tripsMap.set(tripId, { id: tripId, cells: {} });
                    }
                    tripsMap.get(tripId).cells[h.id_parada] = {
                        value: h.horario,
                        id: h._id,
                        originalValue: h.horario,
                        tipo_dia: h.tipo_dia,
                        turno: h.turno
                    };
                }
            });

            const newMatrix = [];
            tripsMap.forEach(trip => {
                newMatrix.push({
                    id: trip.id,
                    cells: trip.cells,
                    isDirty: false,
                    isNew: false
                });
            });

            // Fill empty cells
            newMatrix.forEach(row => {
                paradasData.forEach(p => {
                    if (!row.cells[p._id]) {
                        row.cells[p._id] = { value: '', id: null, originalValue: '' };
                    }
                });
            });

            // Sort by time
            newMatrix.sort((a, b) => {
                const getFirstTime = (row) => {
                    for (const p of paradasData) {
                        if (row.cells[p._id]?.value) return row.cells[p._id].value;
                    }
                    return "99:99";
                };
                return getFirstTime(a).localeCompare(getFirstTime(b));
            });

            setMatrix(newMatrix);
            setHasUnsavedChanges(false);

        } catch (error) {
            console.error("Error fetching data", error);
            Swal.fire('Error', 'No se pudieron cargar los horarios', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Helper to ensure HH:mm format (07:00 instead of 7:00)
    const normalizeTime = (time) => {
        if (!time) return '';
        if (time.length === 4 && time.indexOf(':') === 1) { // "H:MM" -> "7:00"
            return `0${time}`;
        }
        return time;
    };

    // Auto-refresh when ruta OR day type checks
    useEffect(() => {
        fetchData();
    }, [selectedRutaId, selectedDayType, lastUpdate]);

    // Handlers
    const handleCellChange = (rowIndex, paradaId, newValue) => {
        const newMatrix = [...matrix];
        if (!newMatrix[rowIndex].cells[paradaId]) {
            newMatrix[rowIndex].cells[paradaId] = { value: '', id: null, originalValue: '' };
        }
        newMatrix[rowIndex].cells[paradaId].value = newValue;
        newMatrix[rowIndex].isDirty = true;
        setMatrix(newMatrix);
    };

    const addTrip = () => {
        const tripId = Date.now();
        const newRow = {
            id: tripId, // Use this for nro_orden
            cells: {},
            isDirty: true,
            isNew: true
        };
        paradas.forEach(p => {
            newRow.cells[p._id] = { value: '', id: null, originalValue: '' };
        });
        setMatrix([...matrix, newRow]);
    };

    const deleteRow = async (rowIndex) => {
        const row = matrix[rowIndex];
        const result = await Swal.fire({
            title: '¿Eliminar fila?',
            text: 'Esto eliminará los horarios asociados.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                const batch = writeBatch(db);
                let changesCount = 0;
                Object.values(row.cells).forEach(cell => {
                    if (cell.id) {
                        const ref = doc(db, "horarios", cell.id);
                        batch.delete(ref);
                        changesCount++;
                    }
                });
                if (changesCount > 0) {
                    await batch.commit();
                }

                // Remove from UI immediately
                const newMatrix = matrix.filter((_, i) => i !== rowIndex);
                setMatrix(newMatrix);
                Swal.fire('Eliminado', 'Fila eliminada.', 'success');
            } catch (e) {
                console.error(e);
                Swal.fire('Error', 'No se pudieron eliminar algunos horarios', 'error');
            }
        }
    };

    // Global Save
    const saveAllChanges = async () => {
        setSaving(true);
        try {
            const batch = writeBatch(db);
            let changesCount = 0;
            const dirtyRows = matrix.filter(row => row.isDirty);

            if (dirtyRows.length === 0) {
                setSaving(false);
                return;
            }

            dirtyRows.forEach(row => {
                const tripId = row.id;
                paradas.forEach(p => {
                    const cell = row.cells[p._id];
                    const value = cell?.value || '';
                    const originalValue = cell?.originalValue || '';

                    // Skip if no change (extra check)
                    if (value === originalValue && !row.isNew) return;

                    // Case: Delete (was set, now empty)
                    if (cell?.id && (!value || value.trim() === '')) {
                        const ref = doc(db, "horarios", cell.id);
                        batch.delete(ref);
                        changesCount++;
                        return;
                    }

                    if (!value) return;

                    // Payload
                    const data = {
                        id_parada: p._id,
                        horario: value,
                        tipo_dia: selectedDayType, // Uses selected Day Type
                        nro_orden: tripId,
                        turno: 'mañana', // Default shift. In future, allow specifying shift per trip.
                        shown: true,
                        id_ruta: selectedRutaId
                    };

                    if (cell.id) {
                        // Update
                        const ref = doc(db, "horarios", cell.id);
                        batch.update(ref, data);
                        changesCount++;
                    } else {
                        // Create
                        const ref = doc(collection(db, "horarios"));
                        batch.set(ref, data);
                        changesCount++;
                    }
                });
            });

            if (changesCount > 0) {
                await batch.commit();
                Swal.fire('Guardado', 'Cambios guardados correctamente', 'success');
                fetchData(); // Refresh to get new IDs
            } else {
                setSaving(false);
            }
        } catch (e) {
            console.error(e);
            Swal.fire('Error', 'Error al guardar cambios', 'error');
            setSaving(false);
        }
    };

    return (
        <div className="schedule-matrix-container">
            <div className="matrix-header mb-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
                <div className="d-flex gap-2 align-items-center">
                    <Form.Select
                        value={selectedRutaId}
                        onChange={e => setSelectedRutaId(e.target.value)}
                        style={{ maxWidth: '300px', backgroundColor: '#1e1e1e', color: 'white', border: '1px solid #333' }}
                    >
                        {rutas.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
                    </Form.Select>

                    <Form.Select
                        value={selectedDayType}
                        onChange={e => setSelectedDayType(e.target.value)}
                        style={{ maxWidth: '200px', backgroundColor: '#2c2c2c', color: '#ffd700', border: '1px solid #ffd700', fontWeight: 'bold' }}
                    >
                        <option value="habil">Lunes a Viernes (Hábiles)</option>
                        <option value="sabado">Sábados</option>
                        <option value="domingo">Domingos/Feriados</option>
                    </Form.Select>

                    <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => onDeleteRoute && onDeleteRoute(selectedRutaId)}
                        title="Eliminar Ruta seleccionada"
                    >
                        <FaTrash />
                    </Button>
                </div>

                <div className="d-flex gap-2">
                    <Button variant="success" onClick={addTrip} size="sm">
                        <FaPlus /> Nuevo Recorrido
                    </Button>
                    <Button variant="primary" onClick={() => onAddStop && onAddStop(selectedRutaId)} size="sm">
                        <FaPlus /> Nueva Parada
                    </Button>
                    {hasUnsavedChanges && (
                        <Button
                            variant="warning"
                            onClick={saveAllChanges}
                            disabled={saving}
                            className="fw-bold animate__animated animate__pulse animate__infinite"
                        >
                            {saving ? <Spinner size="sm" animation="border" /> : <><FaSave /> Guardar Cambios</>}
                        </Button>
                    )}
                </div>
            </div>

            {loading ? <div className="text-center p-5"><Spinner animation="border" variant="light" /></div> : (
                <div className="table-responsive" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                    <Table bordered variant="dark" hover className="matrix-table text-center align-middle mb-0">
                        <thead style={{ position: 'sticky', top: 0, zIndex: 10, backgroundColor: '#1e1e1e' }}>
                            <tr>
                                <th style={{ width: '50px', backgroundColor: '#1e1e1e' }}>#</th>
                                {paradas.map(p => (
                                    <th key={p._id} style={{ minWidth: '100px', backgroundColor: '#1e1e1e' }}>
                                        <div className="d-flex flex-column align-items-center">
                                            <span style={{ fontSize: '0.9rem' }}>{p.nombre}</span>
                                            <div className="d-flex gap-2 mt-1 opacity-50">
                                                <i
                                                    className="fa-solid fa-pen-to-square text-info cursor-pointer"
                                                    style={{ cursor: 'pointer', fontSize: '0.8rem' }}
                                                    onClick={() => onEditStop && onEditStop(p)}
                                                ></i>
                                                <i
                                                    className="fa-solid fa-trash text-danger cursor-pointer"
                                                    style={{ cursor: 'pointer', fontSize: '0.8rem' }}
                                                    onClick={() => onDeleteStop && onDeleteStop(p._id)}
                                                ></i>
                                            </div>
                                        </div>
                                    </th>
                                ))}
                                <th style={{ width: '50px', backgroundColor: '#1e1e1e' }}><i className="fa-solid fa-gear"></i></th>
                            </tr>
                        </thead>
                        <tbody>
                            {matrix.map((row, rowIndex) => (
                                <tr key={row.id}>
                                    <td className="text-muted" style={{ fontSize: '0.8rem' }}>{rowIndex + 1}</td>
                                    {paradas.map(p => (
                                        <td key={p._id} className="p-0">
                                            <input
                                                type="time"
                                                className={`form-control form-control-sm bg-transparent border-0 text-center ${row.cells[p._id]?.value !== row.cells[p._id]?.originalValue ? 'text-warning fw-bold' : 'text-white'}`}
                                                style={{ boxShadow: 'none', height: '100%', borderRadius: 0 }}
                                                value={normalizeTime(row.cells[p._id]?.value || '')}
                                                onChange={(e) => handleCellChange(rowIndex, p._id, e.target.value)}
                                            />
                                        </td>
                                    ))}
                                    <td>
                                        <Button
                                            size="sm"
                                            variant="outline-danger"
                                            className="border-0"
                                            onClick={() => deleteRow(rowIndex)}
                                            title="Eliminar fila"
                                        >
                                            <FaTrash />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                    {matrix.length === 0 && (
                        <div className="text-center p-5 text-muted">
                            <p>No hay horarios cargados para esta ruta.</p>
                            <Button variant="outline-success" onClick={addTrip}>Comenzar a cargar</Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
