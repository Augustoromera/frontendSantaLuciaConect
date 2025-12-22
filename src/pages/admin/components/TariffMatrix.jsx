import React, { useState, useEffect } from 'react';
import { Table, Button, Form, Spinner } from 'react-bootstrap';
import { getTarifasByRuta, saveTarifasBatch, saveTarifasAndSyncReverse } from '../../../services/tariffService';
import { getParadasByRuta } from '../../../services/scheduleService';
import Swal from 'sweetalert2';
import { FaSave } from 'react-icons/fa';

export const TariffMatrix = ({ initialRutaId, rutas }) => {
    const [selectedRutaId, setSelectedRutaId] = useState(initialRutaId || '');
    const [paradas, setParadas] = useState([]);
    const [tarifasMap, setTarifasMap] = useState({}); // { originId_destId: { price, id } }
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [isDirty, setIsDirty] = useState(false);

    // Initialize selection
    useEffect(() => {
        if (!selectedRutaId && rutas.length > 0) {
            setSelectedRutaId(rutas[0].id);
        }
    }, [rutas]);

    // Fetch Data
    useEffect(() => {
        if (!selectedRutaId) return;
        loadData();
    }, [selectedRutaId]);

    const loadData = async () => {
        setLoading(true);
        try {
            const paradasData = await getParadasByRuta(selectedRutaId);
            const tarifasData = await getTarifasByRuta(selectedRutaId);

            setParadas(paradasData);

            // Map tariffs for easy access: key = originId_destId
            const map = {};
            tarifasData.forEach(t => {
                map[`${t.origen}_${t.destino}`] = { precio: t.precio, id: t.id };
            });
            setTarifasMap(map);
            setIsDirty(false);
        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'No se pudieron cargar las tarifas', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handlePriceChange = (origenId, destinoId, val) => {
        const key = `${origenId}_${destinoId}`;
        setTarifasMap(prev => ({
            ...prev,
            [key]: { ...prev[key], precio: val, isChanged: true }
        }));
        setIsDirty(true);
    };

    const saveChanges = async () => {
        setSaving(true);
        try {
            const toSave = [];
            Object.keys(tarifasMap).forEach(key => {
                const item = tarifasMap[key];
                if (item.isChanged) {
                    const [origen, destino] = key.split('_');
                    toSave.push({
                        id: item.id,
                        origen,
                        destino,
                        precio: item.precio
                    });
                }
            });

            if (toSave.length === 0) {
                setSaving(false);
                return;
            }

            await saveTarifasAndSyncReverse(selectedRutaId, toSave);
            Swal.fire('Guardado', 'Tarifas actualizadas correctamente (incluyendo ruta inversa)', 'success');
            loadData(); // Refresh to get clean state and IDs
        } catch (e) {
            Swal.fire('Error', 'Error al guardar', 'error');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="tariff-matrix-container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <Form.Select
                    value={selectedRutaId}
                    onChange={e => setSelectedRutaId(e.target.value)}
                    style={{ maxWidth: '300px', backgroundColor: '#1e1e1e', color: 'white', border: '1px solid #333' }}
                >
                    {rutas.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
                </Form.Select>

                {isDirty && (
                    <Button variant="warning" onClick={saveChanges} disabled={saving} className="fw-bold">
                        {saving ? <Spinner size="sm" animation="border" /> : <><FaSave /> Guardar Tarifas</>}
                    </Button>
                )}
            </div>

            {loading ? <div className="text-center"><Spinner animation="border" variant="light" /></div> : (
                <div className="table-responsive">
                    <Table bordered variant="dark" hover className="text-center align-middle" style={{ fontSize: '0.9rem' }}>
                        <thead>
                            <tr>
                                <th style={{ backgroundColor: '#1e1e1e' }}>Origen \ Destino</th>
                                {paradas.map(p => (
                                    <th key={p._id} style={{ backgroundColor: '#1e1e1e' }}>{p.nombre}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {paradas.map((origin, i) => (
                                <tr key={origin._id}>
                                    <td className="fw-bold" style={{ backgroundColor: '#1e1e1e' }}>{origin.nombre}</td>
                                    {paradas.map((dest, j) => {
                                        // Condition: Only show if Origin is BEFORE Destination (i < j) for 1-way logic
                                        // The user said: "if I select Acheral (origin), I can't select previous (destination)"
                                        // This implies we only price forward trips in this matrix?
                                        // Or maybe we allow full matrix for "Vuelta" pricing too?
                                        // Usually "Ida" and "Vuelta" are different Routes with different stops order.
                                        // Since we load specific Route (Ida or Vuelta), the stops are ordered.
                                        // So we only need i < j (Forward movement on this route).

                                        const isValidPair = i < j;
                                        const key = `${origin._id}_${dest._id}`;
                                        const val = tarifasMap[key]?.precio || '';

                                        return (
                                            <td key={dest._id} style={{ backgroundColor: isValidPair ? '' : '#2c2c2c' }}>
                                                {isValidPair ? (
                                                    <Form.Control
                                                        type="number"
                                                        value={val}
                                                        onChange={e => handlePriceChange(origin._id, dest._id, e.target.value)}
                                                        className="bg-transparent text-white border-0 text-center"
                                                        placeholder="-"
                                                        style={{ boxShadow: 'none' }}
                                                    />
                                                ) : <span className="text-muted">-</span>}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            )}
        </div>
    );
};
