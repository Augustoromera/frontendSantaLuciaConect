import React, { useEffect, useState } from 'react'
import Table from 'react-bootstrap/Table';
import pruebaApi from '../../api/pruebaApi';

export default function AdminContactScreen() {

  const [datos, setDatos] = useState([]);

  const cargarMensajesContacto = async () => {
    try {

      const respuesta = await pruebaApi.get('/admin/listarMensajes');
      const datos = respuesta.data.mensajes;
      setDatos(datos);
      console.log("Datos cargados correctamente");

    } catch (error) {
      console.log("No fue posible cargar los datos");
      console.log(error);
    }
  }

  useEffect(() => {
    cargarMensajesContacto();
  }, [])

  return (
    <>
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
          {datos.map((mensaje, index) => (
            <tr key={mensaje._id}>
              <td>{index + 1}</td>
              <td>{mensaje.nombre}</td>
              <td>{mensaje.apellido}</td>
              <td>{mensaje.email}</td>
              <td>{mensaje.telefono}</td>
              <td>{mensaje.asunto}</td>
              <td>{mensaje.mensaje}</td>
            </tr>
          ))}

        </tbody>
      </Table>
    </>
  )
}
