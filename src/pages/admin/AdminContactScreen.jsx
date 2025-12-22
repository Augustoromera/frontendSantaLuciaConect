import React, { useEffect, useState } from 'react'
import Table from 'react-bootstrap/Table';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';

export default function AdminContactScreen() {

  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(true);

  const cargarMensajesContacto = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "contacts"));
      const mensajes = querySnapshot.docs.map(doc => ({ ...doc.data(), _id: doc.id }));

      // Sort in memory by date if present
      mensajes.sort((a, b) => new Date(b.fecha || 0) - new Date(a.fecha || 0));

      setDatos(mensajes);
    } catch (error) {
      console.error("Error al cargar mensajes:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    cargarMensajesContacto();
  }, [])

  if (loading) return <div>Cargando mensajes...</div>;

  return (
    <>
      <div className="table-responsive">
        <Table striped bordered hover variant="dark">
          <thead>
            <tr>
              <th>#</th>
              <th>Nombre</th>
              <th>Apellido</th>
              <th>Email</th>
              <th>Telefono</th>
              <th>Asunto</th>
              <th>Mensaje</th>
            </tr>
          </thead>
          <tbody>
            {datos.length > 0 ? (
              datos.map((mensaje, index) => (
                <tr key={mensaje._id}>
                  <td>{index + 1}</td>
                  <td>{mensaje.nombre}</td>
                  <td>{mensaje.apellido}</td>
                  <td>{mensaje.email}</td>
                  <td>{mensaje.telefono}</td>
                  <td>{mensaje.asunto}</td>
                  <td>{mensaje.mensaje}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center">No hay mensajes de contacto.</td>
              </tr>
            )}

          </tbody>
        </Table>
      </div>
    </>
  )
}
