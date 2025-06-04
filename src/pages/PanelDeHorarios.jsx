import React, { useState } from 'react';
import axios from '../api/axios';
import './styles/panel-horarios.css';
import 'font-awesome/css/font-awesome.min.css';
import pruebaApi from '../api/pruebaApi';
import Header from '../components/Header';
import { Footer } from '../components/Footer';
import { useEffect } from 'react';

// const horariosIda = [
//     ["07:00", "07:07", "07:09", "07:11", "07:13", "07:14", "07:16", "07:18", "07:20", "07:22", "07:30"],
//     ["07:30", "07:37", "07:39", "07:41", "07:43", "07:44", "07:46", "07:48", "07:50", "07:52", "08:00"],
//     ["08:00", "08:07", "08:09", "08:11", "08:13", "08:14", "08:16", "08:18", "08:20", "08:22", "08:30"],
//     ["08:30", "08:37", "08:39", "08:41", "08:43", "08:44", "08:46", "08:48", "08:50", "08:52", "09:00"],
//     ["09:00", "09:07", "09:09", "09:11", "09:13", "09:14", "09:16", "09:18", "09:20", "09:22", "09:30"],
//     ["09:30", "09:37", "09:39", "09:41", "09:43", "09:44", "09:46", "09:48", "09:50", "09:52", "10:00"],
//     ["10:00", "10:07", "10:09", "10:11", "10:13", "10:14", "10:16", "10:18", "10:20", "10:22", "10:30"],
//     ["10:30", "10:37", "10:39", "10:41", "10:43", "10:44", "10:46", "10:48", "10:50", "10:52", "11:00"],
//     ["11:00", "11:07", "11:09", "11:11", "11:13", "11:14", "11:16", "11:18", "11:20", "11:22", "11:30"],
//     ["11:30", "11:37", "11:39", "11:41", "11:43", "11:44", "11:46", "11:48", "11:50", "11:52", "12:00"],
//     ["12:00", "12:07", "12:09", "12:11", "12:13", "12:14", "12:16", "12:18", "12:20", "12:22", "12:30"],
//     ["12:30", "12:37", "12:39", "12:41", "12:43", "12:44", "12:46", "12:48", "12:50", "12:52", "13:00"],
//     ["13:00", "13:07", "13:09", "13:11", "13:13", "13:14", "13:16", "13:18", "13:20", "13:22", "13:30"],
//     ["13:30", "13:37", "13:39", "13:41", "13:43", "13:44", "13:46", "13:48", "13:50", "13:52", "14:00"],
//     ["14:00", "14:07", "14:09", "14:11", "14:13", "14:14", "14:16", "14:18", "14:20", "14:22", "14:30"]
// ];

// const horariosVuelta = [
//     ["06:30", "06:34", "06:36", "06:45", "06:50", "06:55", "06:57", "06:59", "07:00", "07:07"],
//     ["07:00", "07:04", "07:06", "07:15", "07:20", "07:25", "07:27", "07:29", "07:30", "07:37"],
//     ["08:00", "08:04", "08:06", "08:15", "08:20", "08:25", "08:27", "08:29", "08:30", "08:37"],
//     ["09:00", "09:04", "09:06", "09:15", "09:20", "09:25", "09:27", "09:29", "09:30", "09:37"],
//     ["10:00", "10:04", "10:06", "10:15", "10:20", "10:25", "10:27", "10:29", "10:30", "10:37"],
//     ["11:00", "11:04", "11:06", "11:15", "11:20", "11:25", "11:27", "11:29", "11:30", "11:37"],
//     ["12:00", "12:04", "12:06", "12:15", "12:20", "12:25", "12:27", "12:29", "12:30", "12:37"],
//     ["13:00", "13:04", "13:06", "13:15", "13:20", "13:25", "13:27", "13:29", "13:30", "13:37"],
//     ["14:00", "14:04", "14:06", "14:15", "14:20", "14:25", "14:27", "14:29", "14:30", "14:37"],
//     ["15:00", "15:04", "15:06", "15:15", "15:20", "15:25", "15:27", "15:29", "15:30", "15:37"]
// ];


export const PanelDeHorarios = () => {

    const [cargarParadas, setCargarParadas] = useState([]);
    const [cargarHorarios, setCargarHorarios] = useState([]);
    const idRuta = "683a815809b499af3e024e56"; //DEFINIR EL ID DE LA RUTA

    useEffect(() => {
        axios.get(`/paradas?id_ruta=${idRuta}`)
            .then(res => setCargarParadas(res.data))
            .catch(err => console.error(err));
    }, []);

    useEffect(() => {
        if (cargarParadas.length > 0) {
            const requests = cargarParadas.map(parada =>
                axios.get(`/obtenerHorarios?id_ruta=${idRuta}&id_parada=${parada._id}`)
                    .then(res => ({
                        paradaId: parada._id,
                        horarios: res.data
                    }))
            );

            Promise.all(requests)
                .then(results => setCargarHorarios(results))
                .catch(err => console.error(err));
        }
    }, [cargarParadas]);

    const getMaxFilas = () =>
        Math.max(...cargarHorarios.map(p => p.horarios.length || 0));


    return (
        <>
            <Header />
            <div className="horarios-container">
                <h1 className="title">Horarios Santa Lucía - Monteros</h1>

                <h2 className="subtitle">Santa Lucía → Monteros</h2>
                <div className="table-responsive">
                    {/* <table className="schedule-table">
                        <thead>
                            <tr>
                                <th>Santa Lucía</th><th>Zavala</th><th>Cortada</th><th>Ciénaga</th><th>KM3</th><th>Alto Verde</th><th>Acheral</th><th>Cervecería</th><th>Sto. Domingo</th><th>Citromax</th><th>Monteros</th>
                            </tr>
                        </thead>
                        <tbody>
                            {horariosIda.map((fila, idx) => (
                                <tr key={idx}>
                                    {fila.map((hora, i) => <td key={i}>{hora}</td>)}
                                </tr>
                            ))}
                        </tbody>
                    </table> */}
                    <table className="schedule-table">
                        <thead>
                            <tr>
                                {cargarParadas.map(parada => (
                                    <th key={parada._id}>{parada.nombre}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {Array.from({ length: getMaxFilas() }).map((_, filaIndex) => (
                                <tr key={filaIndex}>
                                    {cargarParadas.map(parada => {
                                        const horariosParada = cargarHorarios.find(h => h.paradaId === parada._id)?.horarios || [];
                                        return (
                                            <td key={parada._id}>
                                                {horariosParada[filaIndex]?.horario || "-"}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <h2 className="subtitle">Monteros → Santa Lucía</h2>
                <div className="table-responsive">
                    <table className="schedule-table">
                        <thead>
                            <tr>
                                <th>Monteros</th><th>Sto. Domingo</th><th>Cervecería</th><th>Acheral</th><th>Alto Verde</th><th>KM3</th><th>Ciénaga</th><th>Cortada</th><th>Zavala</th><th>Santa Lucía</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* {horariosVuelta.map((fila, idx) => (
                                <tr key={idx}>
                                    {fila.map((hora, i) => <td key={i}>{hora}</td>)}
                                </tr>
                            ))} */}
                        </tbody>
                    </table>
                </div>
            </div>
            <Footer />
        </>
    );
};
