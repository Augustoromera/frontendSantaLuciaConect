import React from 'react';
import './styles/panel-horarios.css';
import 'font-awesome/css/font-awesome.min.css';
import Header from '../components/Header';
import { Footer } from '../components/Footer';

export const PanelDeHorarios = () => {
    const recorridos = [
        {
            linea: "301",
            origenDestino: "San Miguel – Yerba Buena",
            horarios: ["06:00", "08:00", "10:00"]
        },
        {
            linea: "302",
            origenDestino: "San Miguel – Banda del Río Sali",
            horarios: ["07:30", "09:30", "12:00"]
        },
        {
            linea: "303",
            origenDestino: "San Miguel – Alderetes",
            horarios: ["06:45", "09:15", "11:45"]
        },
        {
            linea: "304",
            origenDestino: "San Miguel – Tafí Viejo",
            horarios: ["07:00", "10:00", "13:00"]
        },
        {
            linea: "305",
            origenDestino: "San Miguel – Concepción",
            horarios: ["06:30", "09:00", "11:30"]
        }
    ];

    return (
        <>
            <Header />
            <div className="horarios-container">
                <h1 className="title">Horarios Interurbanos</h1>
                <p className="description">Consulta los horarios actualizados de nuestras líneas interurbanas.</p>

                <div className="table-responsive">
                    <table className="schedule-table">
                        <thead>
                            <tr>
                                <th>Línea</th>
                                <th>Recorrido</th>
                                <th>Horarios</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recorridos.map((recorrido, index) => (
                                <tr key={index}>
                                    <td>{recorrido.linea}</td>
                                    <td>{recorrido.origenDestino}</td>
                                    <td>{recorrido.horarios.join(" • ")}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <Footer className="footer-container" />
        </>
    );
};