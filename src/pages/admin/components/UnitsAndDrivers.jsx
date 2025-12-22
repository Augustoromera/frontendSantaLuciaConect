import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import Swal from 'sweetalert2';
import { FaBus, FaUserTie, FaPlus, FaEdit, FaTrash, FaIdCard, FaSpinner, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const UnitsAndDrivers = () => {
    const [activeTab, setActiveTab] = useState('unidades');
    const [unidades, setUnidades] = useState([]);
    const [choferes, setChoferes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);
        const unsubUnidades = onSnapshot(collection(db, 'unidades'), (snapshot) => {
            const unitsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            unitsData.sort((a, b) => parseInt(a.interno) - parseInt(b.interno));
            setUnidades(unitsData);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching units:", error);
            setError("Error cargando unidades: " + error.message);
            setLoading(false);
        });

        const unsubChoferes = onSnapshot(collection(db, 'choferes'), (snapshot) => {
            const driversData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            driversData.sort((a, b) => a.nombre.localeCompare(b.nombre));
            setChoferes(driversData);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching drivers:", error);
            setError("Error cargando choferes: " + error.message);
            setLoading(false);
        });

        return () => {
            unsubUnidades();
            unsubChoferes();
        };
    }, []);

    // Helper for SweetAlert dark theme
    const darkSwal = {
        background: '#19191a',
        color: 'white',
        confirmButtonColor: '#0d6efd',
        cancelButtonColor: '#d33',
    };

    const handleDeleteUnit = async (id, interno) => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: `Vas a eliminar la unidad Interno ${interno}. Esta acción no se puede deshacer.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            ...darkSwal
        });

        if (result.isConfirmed) {
            try {
                await deleteDoc(doc(db, 'unidades', id));
                Swal.fire({ title: 'Eliminado', text: 'La unidad ha sido eliminada.', icon: 'success', ...darkSwal });
            } catch (error) {
                console.error("Error deleting unit:", error);
                Swal.fire({ title: 'Error', text: 'No se pudo eliminar la unidad.', icon: 'error', ...darkSwal });
            }
        }
    };

    const handleDeleteDriver = async (id, nombre) => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: `Vas a eliminar al chofer ${nombre}.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            ...darkSwal
        });

        if (result.isConfirmed) {
            try {
                await deleteDoc(doc(db, 'choferes', id));
                Swal.fire({ title: 'Eliminado', text: 'El chofer ha sido eliminado.', icon: 'success', ...darkSwal });
            } catch (error) {
                console.error("Error deleting driver:", error);
                Swal.fire({ title: 'Error', text: 'No se pudo eliminar al chofer.', icon: 'error', ...darkSwal });
            }
        }
    };

    const handleEditDriver = async (driver) => {
        // Generate options for units
        const unitOptions = unidades.map(u => `<option value="${u.interno}" ${driver.unidad_asignada === u.interno ? 'selected' : ''}>Int. ${u.interno} - ${u.modelo}</option>`).join('');

        const { value: formValues } = await Swal.fire({
            title: `Editar Chofer: ${driver.nombre}`,
            html: `
                <div class="text-start">
                    <label class="form-label text-white-50 small text-uppercase fw-bold">Estado</label>
                    <select id="swal-input-status" class="form-select bg-dark text-white border-secondary mb-3">
                        <option value="activo" ${driver.status === 'activo' || !driver.status ? 'selected' : ''}>Activo</option>
                        <option value="inactivo" ${driver.status === 'inactivo' ? 'selected' : ''}>Inactivo</option>
                    </select>

                    <label class="form-label text-white-50 small text-uppercase fw-bold">Unidad Asignada</label>
                    <select id="swal-input-unit" class="form-select bg-dark text-white border-secondary">
                        <option value="">Sin Asignar</option>
                        ${unitOptions}
                    </select>
                </div>
            `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Guardar Cambios',
            cancelButtonText: 'Cancelar',
            ...darkSwal,
            preConfirm: () => {
                return {
                    status: document.getElementById('swal-input-status').value,
                    unidad_asignada: document.getElementById('swal-input-unit').value
                };
            }
        });

        if (formValues) {
            try {
                await updateDoc(doc(db, 'choferes', driver.id), {
                    status: formValues.status,
                    unidad_asignada: formValues.unidad_asignada
                });
                Swal.fire({ title: 'Guardado', text: 'Datos del chofer actualizados.', icon: 'success', ...darkSwal });
            } catch (error) {
                console.error("Error updating driver:", error);
                Swal.fire({ title: 'Error', text: 'No se pudieron guardar los cambios.', icon: 'error', ...darkSwal });
            }
        }
    };

    const handleAddUnit = () => Swal.fire({ title: 'Información', text: 'Funcionalidad de agregar unidad en desarrollo', icon: 'info', ...darkSwal });
    const handleEditUnit = (unit) => Swal.fire({ title: 'Información', text: 'Funcionalidad de editar unidad en desarrollo', icon: 'info', ...darkSwal });
    const handleAddDriver = () => Swal.fire({ title: 'Información', text: 'Funcionalidad de agregar chofer en desarrollo', icon: 'info', ...darkSwal });

    if (error) {
        return <div className="p-4 text-danger bg-dark border border-danger rounded">{error}</div>;
    }

    return (
        <div className="container-fluid p-0">
            {/* Tabs */}
            <ul className="nav nav-pills mb-4 nav-justified bg-dark rounded shadow-sm p-2 border border-secondary">
                <li className="nav-item">
                    <button
                        className={`nav-link ${activeTab === 'unidades' ? 'active bg-primary text-white fw-bold' : 'text-light'}`}
                        onClick={() => setActiveTab('unidades')}
                        style={{ borderRadius: '8px', transition: 'all 0.3s' }}
                    >
                        <FaBus className="me-2" /> Unidades
                    </button>
                </li>
                <li className="nav-item ps-2">
                    <button
                        className={`nav-link ${activeTab === 'choferes' ? 'active bg-primary text-white fw-bold' : 'text-light'}`}
                        onClick={() => setActiveTab('choferes')}
                        style={{ borderRadius: '8px', transition: 'all 0.3s' }}
                    >
                        <FaUserTie className="me-2" /> Choferes
                    </button>
                </li>
            </ul>

            {loading ? (
                <div className="text-center py-5">
                    <FaSpinner className="spin text-primary fs-1" />
                    <p className="mt-2 text-white">Cargando datos...</p>
                </div>
            ) : (
                <div className="tab-content">
                    {/* Unidades Tab - Table View */}
                    {activeTab === 'unidades' && (
                        <div>
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h4 className="mb-0 text-white fw-bold border-start border-4 border-primary ps-3">Flota de Unidades</h4>
                                <button className="btn btn-primary d-flex align-items-center shadow-sm" onClick={handleAddUnit}>
                                    <FaPlus className="me-2" /> Nueva Unidad
                                </button>
                            </div>

                            <div className="table-responsive">
                                <table className="table table-dark table-hover table-bordered align-middle mb-0" style={{ fontSize: '0.9rem' }}>
                                    <thead className="bg-secondary text-white text-uppercase small fw-bold">
                                        <tr>
                                            <th className="ps-4">Int.</th>
                                            <th>Marca</th>
                                            <th>Fab.</th>
                                            <th>Modelo</th>
                                            <th>Dominio</th>
                                            <th>VTV Venc.</th>
                                            <th>Seguro Comp.</th>
                                            <th>Póliza</th>
                                            <th>Vigencia</th>
                                            <th className="text-center">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-white">
                                        {unidades.map((unit) => (
                                            <tr key={unit.id}>
                                                <td className="ps-4 fw-bold text-info">#{unit.interno}</td>
                                                <td>{unit.marca}</td>
                                                <td>{unit.year || '-'}</td>
                                                <td>{unit.modelo}</td>
                                                <td><span className="badge bg-secondary text-white border border-light">{unit.dominio}</span></td>
                                                <td className="fw-medium">{unit.vtv}</td>
                                                <td className="text-nowrap">{unit.seguro?.compania}</td>
                                                <td className="text-white-50 small">{unit.seguro?.poliza}</td>
                                                <td>{unit.seguro?.vigencia}</td>
                                                <td className="text-center">
                                                    <div className="d-flex justify-content-center gap-2">
                                                        <button className="btn btn-sm btn-outline-primary" onClick={() => handleEditUnit(unit)} title="Editar">
                                                            <FaEdit />
                                                        </button>
                                                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteUnit(unit.id, unit.interno)} title="Eliminar">
                                                            <FaTrash />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {unidades.length === 0 && (
                                            <tr>
                                                <td colSpan="10" className="text-center py-5 text-white">
                                                    <h5 className="text-white">No hay unidades registradas.</h5>
                                                    <p className="text-white-50">Use el botón "Nueva Unidad" para agregar.</p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Choferes Tab - Table View */}
                    {activeTab === 'choferes' && (
                        <div>
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h4 className="mb-0 text-white fw-bold border-start border-4 border-primary ps-3">Plantel de Choferes</h4>
                                <button className="btn btn-primary d-flex align-items-center shadow-sm" onClick={handleAddDriver}>
                                    <FaPlus className="me-2" /> Nuevo Chofer
                                </button>
                            </div>

                            <div className="table-responsive">
                                <table className="table table-dark table-hover table-bordered align-middle mb-0" style={{ fontSize: '0.9rem' }}>
                                    <thead className="bg-secondary text-white text-uppercase small fw-bold">
                                        <tr>
                                            <th className="ps-4">Nombre</th>
                                            <th>CUIL</th>
                                            <th className="text-center">Estado</th>
                                            <th className="text-center">Unidad Asignada</th>
                                            <th className="text-center" style={{ width: '150px' }}>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-white">
                                        {choferes.map((driver) => (
                                            <tr key={driver.id}>
                                                <td className="ps-4 fw-bold">
                                                    <div className="d-flex align-items-center">
                                                        <div className="rounded-circle bg-secondary bg-opacity-50 me-2 d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
                                                            <FaUserTie className="text-white small" />
                                                        </div>
                                                        {driver.nombre}
                                                    </div>
                                                </td>
                                                <td>{driver.cuil}</td>
                                                <td className="text-center">
                                                    {driver.status === 'inactivo' ? (
                                                        <span className="badge bg-danger d-flex align-items-center justify-content-center mx-auto" style={{ width: 'fit-content' }}>
                                                            <FaTimesCircle className="me-1" /> Inactivo
                                                        </span>
                                                    ) : (
                                                        <span className="badge bg-success d-flex align-items-center justify-content-center mx-auto" style={{ width: 'fit-content' }}>
                                                            <FaCheckCircle className="me-1" /> Activo
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="text-center">
                                                    {driver.unidad_asignada ? (
                                                        <span className="badge bg-info text-dark border border-light d-flex align-items-center justify-content-center mx-auto" style={{ width: 'fit-content' }}>
                                                            <FaBus className="me-1" /> Int. {driver.unidad_asignada}
                                                        </span>
                                                    ) : (
                                                        <span className="text-muted small">Sin asignar</span>
                                                    )}
                                                </td>
                                                <td className="text-center">
                                                    <div className="d-flex justify-content-center gap-2">
                                                        <button className="btn btn-sm btn-outline-primary" onClick={() => handleEditDriver(driver)} title="Editar Estado/Unidad">
                                                            <FaEdit />
                                                        </button>
                                                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteDriver(driver.id, driver.nombre)} title="Eliminar">
                                                            <FaTrash />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {choferes.length === 0 && (
                                            <tr>
                                                <td colSpan="5" className="text-center py-5 text-white">
                                                    <h5 className="text-white">No hay choferes registrados.</h5>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <style jsx>{`
                .hover-shadow:hover {
                    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.4) !important;
                    transform: translateY(-2px);
                    border-color: #0d6efd !important;
                }
                .transition-all {
                    transition: all 0.3s ease;
                }
                .fs-7 {
                    font-size: 0.85rem;
                }
                .spin {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin { 100% { -webkit-transform: rotate(360deg); transform:rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default UnitsAndDrivers;
