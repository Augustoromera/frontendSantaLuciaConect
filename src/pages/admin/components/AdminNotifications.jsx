import React, { useState, useEffect } from 'react';
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import Swal from 'sweetalert2';
import { FaPaperPlane, FaHistory, FaTrash, FaBell, FaInfoCircle } from 'react-icons/fa';

const AdminNotifications = () => {
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        try {
            const q = query(collection(db, 'notifications'), orderBy('date', 'desc'));
            const unsubscribe = onSnapshot(q, (snapshot) => {
                const notifs = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    date: doc.data().date?.toDate()
                }));
                setNotifications(notifs);
                setLoading(false);
            }, (error) => {
                console.error("Error fetching notifications:", error);
                setLoading(false);
            });
            return () => unsubscribe();
        } catch (error) {
            console.error("Error setting up listener:", error);
            setLoading(false);
        }
    }, []);

    const darkSwal = {
        background: '#19191a',
        color: 'white',
        confirmButtonColor: '#0d6efd',
    };

    const handleSendNotification = async (e) => {
        e.preventDefault();
        if (!title.trim() || !message.trim()) {
            Swal.fire({ title: 'Error', text: 'Complete todos los campos', icon: 'error', ...darkSwal });
            return;
        }

        try {
            await addDoc(collection(db, 'notifications'), {
                title,
                message,
                date: serverTimestamp(),
                type: 'global',
                readBy: []
            });

            setTitle('');
            setMessage('');
            Swal.fire({ title: 'Enviado', text: 'El aviso se ha enviado a todos los usuarios.', icon: 'success', ...darkSwal });
        } catch (error) {
            console.error("Error sending notification:", error);
            Swal.fire({ title: 'Error', text: 'No se pudo enviar el aviso.', icon: 'error', ...darkSwal });
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: '¿Eliminar aviso?',
            text: "Se borrará del historial y del panel de los usuarios.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            ...darkSwal
        });

        if (result.isConfirmed) {
            try {
                await deleteDoc(doc(db, 'notifications', id));
                Swal.fire({ title: 'Eliminado', text: 'Aviso eliminado.', icon: 'success', ...darkSwal });
            } catch (error) {
                Swal.fire({ title: 'Error', text: 'Error al eliminar.', icon: 'error', ...darkSwal });
            }
        }
    };

    return (
        <div className="container-fluid p-0">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="mb-0 text-white fw-bold border-start border-4 border-primary ps-3">Gestión de Avisos</h4>
            </div>

            {/* Layout using Flexbox. Removed invalid inline style that caused overflow. */}
            <div className="d-flex flex-column flex-lg-row gap-4">

                {/* Send Form Section 
                    Use width 100% on mobile, and a fixed width on desktop.
                    'flex-shrink-0' ensures it doesn't shrink. 
                */}
                <div className="flex-shrink-0" style={{ minWidth: '350px' }}>
                    <div className="w-100">
                        <div className="bg-dark border border-secondary text-white rounded shadow-sm p-0 overflow-hidden">
                            <div className="p-3 border-bottom border-secondary" style={{ backgroundColor: '#212529' }}>
                                <h5 className="mb-0 d-flex align-items-center">
                                    <FaBell className="me-2 text-primary" /> Nuevo Aviso
                                </h5>
                            </div>
                            <div className="p-3">
                                <form onSubmit={handleSendNotification}>
                                    <div className="mb-3">
                                        <label className="form-label text-white-50 small text-uppercase fw-bold">Título</label>
                                        <input
                                            type="text"
                                            className="form-control bg-dark text-white border-secondary"
                                            placeholder="Ej: Demora en Línea 1"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            maxLength={50}
                                            style={{ color: 'white' }}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label text-white-50 small text-uppercase fw-bold">Mensaje</label>
                                        <textarea
                                            className="form-control bg-dark text-white border-secondary"
                                            rows="4"
                                            placeholder="Escriba el detalle..."
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            maxLength={300}
                                            style={{ color: 'white' }}
                                        ></textarea>
                                    </div>
                                    <button type="submit" className="btn btn-primary w-100 fw-bold d-flex align-items-center justify-content-center py-2">
                                        <FaPaperPlane className="me-2" /> Enviar Aviso
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>

                {/* History Section - Grows to fill remaining space */}
                <div className="flex-grow-1" style={{ minWidth: 0 }}> {/* minWidth:0 prevents flex items from overflowing container */}
                    <div className="bg-dark border border-secondary text-white rounded shadow-sm overflow-hidden" style={{ minHeight: '300px' }}>
                        <div className="p-3 border-bottom border-secondary d-flex justify-content-between align-items-center" style={{ backgroundColor: '#212529' }}>
                            <h5 className="mb-0 d-flex align-items-center">
                                <FaHistory className="me-2 text-info" /> Historial
                            </h5>
                            <span className="badge bg-secondary">{notifications.length} enviados</span>
                        </div>
                        <div className="p-0">
                            <div className="table-responsive" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                                <table className="table table-dark table-hover mb-0 align-middle">
                                    <thead className="sticky-top" style={{ backgroundColor: '#343a40' }}>
                                        <tr>
                                            <th className="ps-4">Fecha</th>
                                            <th>Título</th>
                                            <th>Mensaje</th>
                                            <th className="text-center">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? (
                                            <tr><td colSpan="4" className="text-center py-4">Cargando...</td></tr>
                                        ) : notifications.length > 0 ? (
                                            notifications.map((notif) => (
                                                <tr key={notif.id}>
                                                    <td className="ps-4 text-white-50 small text-nowrap">
                                                        {notif.date ? new Date(notif.date).toLocaleDateString() : 'Reciente'}
                                                    </td>
                                                    <td className="fw-bold text-primary">{notif.title}</td>
                                                    <td className="small text-truncate" style={{ maxWidth: '200px' }} title={notif.message}>
                                                        {notif.message}
                                                    </td>
                                                    <td className="text-center">
                                                        <button
                                                            className="btn btn-sm btn-outline-danger border-0"
                                                            onClick={() => handleDelete(notif.id)}
                                                            title="Eliminar"
                                                        >
                                                            <FaTrash />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="4" className="text-center py-5 text-white-50">
                                                    <FaInfoCircle className="mb-2 fs-4 d-block mx-auto" />
                                                    No hay avisos enviados en el historial.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AdminNotifications;
