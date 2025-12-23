import React, { useEffect, useState } from 'react'
import Table from 'react-bootstrap/Table';
import { collection, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import Swal from 'sweetalert2';
import { FaReply, FaCheckDouble, FaHourglassHalf, FaTrash, FaEye } from 'react-icons/fa';

export default function AdminContactScreen() {

  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Use onSnapshot for real-time updates
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "contacts"), (snapshot) => {
      const mensajes = snapshot.docs.map(doc => ({ ...doc.data(), _id: doc.id }));
      mensajes.sort((a, b) => new Date(b.fecha || 0) - new Date(a.fecha || 0));
      setDatos(mensajes);
      setLoading(false);
    }, (error) => {
      console.error("Error al cargar mensajes:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const darkSwal = {
    background: '#19191a',
    color: 'white',
    confirmButtonColor: '#0d6efd',
    cancelButtonColor: '#d33',
  };

  const handleReply = async (mensaje) => {
    const { value: replyText } = await Swal.fire({
      title: `Responder a ${mensaje.nombre}`,
      input: 'textarea',
      inputLabel: 'Tu respuesta',
      inputPlaceholder: 'Escribe tu respuesta aquí...',
      inputValue: mensaje.reply || '', // Show existing reply if any
      showCancelButton: true,
      confirmButtonText: 'Enviar Respuesta',
      cancelButtonText: 'Cancelar',
      ...darkSwal,
      inputValidator: (value) => {
        if (!value) {
          return '¡Debes escribir una respuesta!'
        }
      }
    });

    if (replyText) {
      try {
        const msgRef = doc(db, "contacts", mensaje._id);
        await updateDoc(msgRef, {
          reply: replyText,
          replyDate: new Date().toISOString(),
          status: 'answered'
        });
        Swal.fire({
          title: 'Enviado',
          text: 'La respuesta ha sido registrada y el usuario podrá verla.',
          icon: 'success',
          ...darkSwal
        });
      } catch (error) {
        console.error("Error al responder:", error);
        Swal.fire({
          title: 'Error',
          text: 'No se pudo guardar la respuesta.',
          icon: 'error',
          ...darkSwal
        });
      }
    }
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: "¡No podrás revertir esto!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      ...darkSwal
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteDoc(doc(db, "contacts", id));
          Swal.fire({
            title: '¡Eliminado!',
            text: 'El mensaje ha sido eliminado.',
            icon: 'success',
            ...darkSwal
          });
        } catch (error) {
          console.error("Error al eliminar:", error);
          Swal.fire({
            title: 'Error',
            text: 'No se pudo eliminar el mensaje.',
            icon: 'error',
            ...darkSwal
          });
        }
      }
    })
  };

  if (loading) return <div className="text-white p-3">Cargando mensajes...</div>;

  return (
    <>
      <div className="table-responsive">
        <Table striped bordered hover variant="dark" className="align-middle">
          <thead>
            <tr>
              <th>Estado</th>
              <th>Fecha</th>
              <th>Usuario</th>
              <th>Asunto</th>
              <th>Mensaje</th>
              <th>Respuesta</th>
              <th className="text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {datos.length > 0 ? (
              datos.map((mensaje) => (
                <tr key={mensaje._id}>
                  <td className="text-center">
                    {mensaje.status === 'answered' ? (
                      <span className="badge bg-success" title="Respondido"><FaCheckDouble /></span>
                    ) : (
                      <span className="badge bg-warning text-dark" title="Pendiente"><FaHourglassHalf /></span>
                    )}
                  </td>
                  <td className="small text-white-50 text-nowrap">
                    {mensaje.fecha ? new Date(mensaje.fecha).toLocaleDateString() : '-'}
                  </td>
                  <td>
                    <div className="fw-bold">{mensaje.nombre} {mensaje.apellido}</div>
                    <div className="small text-white-50">{mensaje.email}</div>
                  </td>
                  <td>{mensaje.asunto}</td>
                  <td className="small" style={{ maxWidth: '200px', wordBreak: 'break-word', whiteSpace: 'normal' }}>
                    {mensaje.mensaje.length > 50
                      ? `${mensaje.mensaje.substring(0, 50)}...`
                      : mensaje.mensaje}
                    {mensaje.mensaje.length > 50 && (
                      <button
                        className="btn btn-link p-0 ms-1 text-info"
                        style={{ textDecoration: 'none' }}
                        onClick={() => {
                          Swal.fire({
                            title: `Mensaje de ${mensaje.nombre}`,
                            html: `
                               <div style="text-align: left;">
                                 <p><strong>De:</strong> ${mensaje.nombre} ${mensaje.apellido} (${mensaje.email})</p>
                                 <p><strong>Asunto:</strong> ${mensaje.asunto}</p>
                                 <hr/>
                                 <p>${mensaje.mensaje}</p>
                               </div>
                             `,
                            background: '#19191a',
                            color: 'white',
                            confirmButtonColor: '#0d6efd',
                            width: '600px'
                          });
                        }}
                      >
                        <FaEye />
                      </button>
                    )}
                  </td>
                  <td className="small text-info">
                    {mensaje.reply ? (
                      <div className="text-truncate" style={{ maxWidth: '150px' }} title={mensaje.reply}>
                        {mensaje.reply}
                      </div>
                    ) : (
                      <span className="text-muted">-</span>
                    )}
                  </td>
                  <td className="text-center">
                    <div className="d-flex justify-content-center gap-2">
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => handleReply(mensaje)}
                        title="Responder"
                      >
                        <FaReply />
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(mensaje._id)}
                        title="Eliminar"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center py-4">No hay mensajes de contacto.</td>
              </tr>
            )}

          </tbody>
        </Table>
      </div>
    </>
  )
}
