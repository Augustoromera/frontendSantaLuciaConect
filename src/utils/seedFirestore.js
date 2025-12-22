import { collection, doc, writeBatch, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";

const RUTA_IDA_ID = "6841ae01c11032698b6ade09"; // Santa Lucia -> Monteros
const RUTA_VUELTA_ID = "6841af28447dea60cc03a67d"; // Monteros -> Santa Lucia

const PARADAS_IDA = [
    { nombre: "Santa Lucia", orden: 1 },
    { nombre: "Zavalia", orden: 2 },
    { nombre: "La Cortada", orden: 3 },
    { nombre: "La Cienaga", orden: 4 },
    { nombre: "KM3", orden: 5 },
    { nombre: "Alto Verde", orden: 6 },
    { nombre: "Acheral", orden: 7 },
    { nombre: "Cerveceria", orden: 8 },
    { nombre: "Sto. Domingo", orden: 9 },
    { nombre: "Citromax", orden: 10 },
    { nombre: "Monteros", orden: 11 }
];

const PARADAS_VUELTA = [
    { nombre: "Monteros", orden: 1 },
    { nombre: "Sto. Domingo", orden: 2 },
    { nombre: "Cerveceria", orden: 3 },
    { nombre: "Acheral", orden: 4 },
    { nombre: "Alto Verde", orden: 5 },
    { nombre: "KM3", orden: 6 },
    { nombre: "La Cienaga", orden: 7 },
    { nombre: "La Cortada", orden: 8 },
    { nombre: "Zavalia", orden: 9 },
    { nombre: "Santa Lucia", orden: 10 }
];

// IDA (Santa Lucia -> Monteros)
const SCHEDULES_IDA = [
    // Turno Mañana (Habil)
    { nro_orden: 2, tipo_dia: 'habil', turno: 'mañana', times: ["07:00", "07:07", "07:09", "07:11", "07:13", "07:14", "07:15", "07:18", "07:20", "07:22", "07:30"] },
    { nro_orden: 3, tipo_dia: 'habil', turno: 'mañana', times: ["07:30", "07:37", "07:39", "07:41", "07:43", "07:44", "07:45", "07:48", "07:50", "07:52", "08:00"] },
    { nro_orden: 4, tipo_dia: 'habil', turno: 'mañana', times: ["08:00", "08:07", "08:09", "08:11", "08:13", "08:14", "08:15", "08:18", "08:20", "08:22", "08:30"] },
    { nro_orden: 5, tipo_dia: 'habil', turno: 'mañana', times: ["08:30", "08:37", "08:39", "08:41", "08:43", "08:44", "08:45", "08:48", "08:50", "08:52", "09:00"] },
    { nro_orden: 6, tipo_dia: 'habil', turno: 'mañana', times: ["09:30", "09:37", "09:39", "09:41", "09:43", "09:44", "09:45", "09:48", "09:50", "09:52", "10:00"] },
    { nro_orden: 7, tipo_dia: 'habil', turno: 'mañana', times: ["10:30", "10:37", "10:39", "10:41", "10:43", "10:44", "10:45", "10:48", "10:50", "10:52", "11:00"] },
    { nro_orden: 8, tipo_dia: 'habil', turno: 'mañana', times: ["11:30", "11:37", "11:39", "11:41", "11:43", "11:44", "11:45", "11:48", "11:50", "11:52", "12:00"] },
    { nro_orden: 10, tipo_dia: 'habil', turno: 'mañana', times: ["12:30", "12:37", "12:39", "12:41", "12:43", "12:44", "12:45", "12:48", "12:50", "12:52", "13:00"] },
    { nro_orden: 11, tipo_dia: 'habil', turno: 'mañana', times: ["12:45", "12:52", "12:54", "12:56", "12:58", "12:59", "13:00", "13:03", "13:05", "13:07", "13:15"] },
    { nro_orden: 12, tipo_dia: 'habil', turno: 'mañana', times: ["13:00", "13:07", "13:09", "13:11", "13:13", "13:14", "13:15", "13:18", "13:20", "13:22", "13:30"] },
    { nro_orden: 13, tipo_dia: 'habil', turno: 'mañana', times: ["13:30", "13:37", "13:39", "13:41", "13:43", "13:44", "13:45", "13:48", "13:50", "13:52", "14:00"] },
    { nro_orden: 15, tipo_dia: 'habil', turno: 'mañana', times: ["14:30", "14:37", "14:39", "14:41", "14:43", "14:44", "14:45", "14:48", "14:50", "14:52", "15:00"] },
    { nro_orden: 16, tipo_dia: 'habil', turno: 'mañana', times: ["15:30", "15:37", "15:39", "15:41", "15:43", "15:44", "15:45", "15:48", "15:50", "15:52", "16:00"] },
    // Turno Tarde (Habil)
    { nro_orden: 17, tipo_dia: 'habil', turno: 'tarde', times: ["16:30", "16:37", "16:39", "16:41", "16:43", "16:44", "16:45", "16:48", "16:50", "16:52", "17:00"] },
    { nro_orden: 19, tipo_dia: 'habil', turno: 'tarde', times: ["17:30", "17:37", "17:39", "17:41", "17:43", "17:44", "17:45", "17:48", "17:50", "17:42", "18:00"] },
    { nro_orden: 20, tipo_dia: 'habil', turno: 'tarde', times: ["18:30", "18:37", "18:39", "18:41", "18:43", "18:44", "18:45", "18:48", "18:50", "18:52", "19:00"] },
    { nro_orden: 22, tipo_dia: 'habil', turno: 'tarde', times: ["19:30", "19:37", "19:39", "19:41", "19:43", "19:44", "19:45", "19:48", "19:50", "19:52", "20:00"] },
    { nro_orden: 23, tipo_dia: 'habil', turno: 'tarde', times: ["20:30", "20:37", "20:39", "20:41", "20:43", "20:44", "20:45", "20:48", "20:50", "20:52", "21:00"] },
    { nro_orden: 24, tipo_dia: 'habil', turno: 'tarde', times: ["21:30", "21:37", "21:39", "21:41", "21:43", "21:44", "21:45", "21:48", "21:50", "21:52", "22:00"] },
    { nro_orden: 25, tipo_dia: 'habil', turno: 'tarde', times: ["22:30", "22:33", "22:36", "22:38", "22:40", "22:42", "22:43", "22:45", "22:48", "22:50", "23:00"] },
    // Sabados
    { nro_orden: 3, tipo_dia: 'sabado', turno: 'mañana', times: ["08:00", "08:07", "08:09", "08:11", "08:13", "08:14", "08:15", "08:18", "08:20", "08:22", "08:30"] },
    { nro_orden: 6, tipo_dia: 'sabado', turno: 'mañana', times: ["09:30", "09:37", "09:39", "09:41", "09:43", "09:44", "09:45", "09:48", "09:50", "09:52", "10:00"] },
    { nro_orden: 10, tipo_dia: 'sabado', turno: 'mañana', times: ["11:30", "11:37", "11:39", "11:41", "11:43", "11:44", "11:45", "11:48", "11:50", "11:52", "12:00"] },
    { nro_orden: 13, tipo_dia: 'sabado', turno: 'mañana', times: ["12:30", "12:37", "12:39", "12:41", "12:43", "12:44", "12:45", "12:48", "12:50", "12:52", "13:00"] },
    { nro_orden: 21, tipo_dia: 'sabado', turno: 'tarde', times: ["17:00", "17:07", "17:09", "17:11", "17:13", "17:14", "17:15", "17:18", "17:20", "17:22", "17:30"] },
    { nro_orden: 25, tipo_dia: 'sabado', turno: 'tarde', times: ["19:00", "19:07", "19:09", "19:11", "19:13", "19:14", "19:15", "19:18", "19:20", "19:22", "19:30"] },
    { nro_orden: 29, tipo_dia: 'sabado', turno: 'tarde', times: ["21:00", "21:07", "21:09", "21:11", "21:13", "21:18", "21:15", "21:18", "21:20", "21:22", "21:30"] },
    // Domingos - New
    { nro_orden: 3, tipo_dia: 'domingo', turno: 'mañana', times: ["10:00", "10:07", "10:09", "10:11", "10:13", "10:14", "10:15", "10:18", "10:20", "10:22", "10:30"] },
    { nro_orden: 5, tipo_dia: 'domingo', turno: 'mañana', times: ["12:30", "12:37", "12:39", "12:41", "12:43", "12:44", "12:45", "12:48", "12:50", "12:52", "13:00"] },
    { nro_orden: 12, tipo_dia: 'domingo', turno: 'tarde', times: ["20:30", "20:37", "20:39", "20:41", "20:43", "20:44", "20:45", "20:48", "20:50", "20:52", "21:00"] } // Corrected Zavalia time to match standard (+7 min) instead of 20:24
];

// VUELTA (Monteros -> Santa Lucia)
const SCHEDULES_VUELTA = [
    // Turno Mañana (Habil)
    { nro_orden: 2, tipo_dia: 'habil', turno: 'mañana', times: ["06:30", "06:34", "06:38", "06:45", "06:50", "06:53", "07:55", "06:57", "06:58", "07:00"] },
    { nro_orden: 3, tipo_dia: 'habil', turno: 'mañana', times: ["07:00", "07:04", "07:06", "07:15", "07:20", "07:23", "07:25", "07:27", "07:28", "07:30"] },
    { nro_orden: 4, tipo_dia: 'habil', turno: 'mañana', times: ["07:30", "07:34", "07:36", "07:45", "07:50", "07:53", "07:55", "07:57", "07:58", "08:00"] },
    { nro_orden: 5, tipo_dia: 'habil', turno: 'mañana', times: ["08:00", "08:04", "08:06", "08:15", "08:20", "08:23", "08:25", "08:27", "08:28", "08:30"] },
    { nro_orden: 6, tipo_dia: 'habil', turno: 'mañana', times: ["09:00", "09:04", "09:06", "09:15", "09:20", "09:23", "09:25", "09:27", "09:28", "09:30"] },
    { nro_orden: 7, tipo_dia: 'habil', turno: 'mañana', times: ["10:00", "10:04", "10:06", "10:15", "10:20", "10:23", "10:25", "10:27", "10:28", "10:30"] },
    { nro_orden: 8, tipo_dia: 'habil', turno: 'mañana', times: ["11:00", "11:04", "11:06", "11:15", "11:20", "11:23", "11:25", "11:27", "11:28", "11:30"] },
    { nro_orden: 10, tipo_dia: 'habil', turno: 'mañana', times: ["12:00", "12:04", "12:06", "12:15", "12:20", "12:23", "12:25", "12:27", "12:28", "12:30"] },
    { nro_orden: 11, tipo_dia: 'habil', turno: 'mañana', times: ["12:15", "12:19", "12:21", "12:30", "12:35", "12:38", "12:41", "12:43", "12:44", "12:45"] },
    { nro_orden: 12, tipo_dia: 'habil', turno: 'mañana', times: ["12:30", "12:34", "12:36", "12:45", "12:50", "12:53", "12:55", "12:57", "12:58", "13:00"] },
    { nro_orden: 13, tipo_dia: 'habil', turno: 'mañana', times: ["13:00", "13:04", "13:06", "13:15", "13:20", "13:23", "13:25", "13:27", "13:28", "13:30"] },
    { nro_orden: 15, tipo_dia: 'habil', turno: 'mañana', times: ["14:00", "14:04", "14:06", "14:15", "14:20", "14:23", "14:25", "14:27", "14:28", "14:30"] },
    { nro_orden: 16, tipo_dia: 'habil', turno: 'mañana', times: ["15:00", "15:04", "15:06", "15:15", "15:20", "15:23", "15:25", "15:27", "15:28", "15:30"] },
    // Turno Tarde (Habil)
    { nro_orden: 17, tipo_dia: 'habil', turno: 'tarde', times: ["16:00", "16:04", "16:06", "16:15", "16:20", "16:23", "16:25", "16:27", "16:28", "16:30"] },
    { nro_orden: 19, tipo_dia: 'habil', turno: 'tarde', times: ["17:00", "17:04", "17:06", "17:15", "17:20", "17:23", "17:25", "17:27", "17:28", "17:30"] },
    { nro_orden: 20, tipo_dia: 'habil', turno: 'tarde', times: ["18:00", "18:04", "18:06", "18:15", "18:20", "18:23", "18:25", "18:27", "18:28", "18:30"] },
    { nro_orden: 22, tipo_dia: 'habil', turno: 'tarde', times: ["19:00", "19:04", "19:06", "19:15", "19:20", "19:23", "19:25", "19:27", "19:28", "19:30"] },
    { nro_orden: 23, tipo_dia: 'habil', turno: 'tarde', times: ["20:00", "20:04", "20:06", "20:15", "20:20", "20:23", "20:25", "20:27", "20:28", "20:30"] },
    { nro_orden: 24, tipo_dia: 'habil', turno: 'tarde', times: ["21:00", "21:04", "21:06", "21:15", "21:20", "21:23", "21:25", "21:27", "21:28", "21:30"] },
    { nro_orden: 25, tipo_dia: 'habil', turno: 'tarde', times: ["22:00", "22:04", "22:06", "22:15", "22:20", "22:23", "22:25", "22:27", "22:28", "22:30"] },
    // Sabados
    { nro_orden: 3, tipo_dia: 'sabado', turno: 'mañana', times: ["07:30", "07:34", "07:38", "07:45", "07:50", "07:53", "07:55", "07:57", "07:58", "08:00"] },
    { nro_orden: 6, tipo_dia: 'sabado', turno: 'mañana', times: ["09:00", "09:04", "09:08", "09:15", "09:20", "09:23", "09:25", "09:27", "09:28", "09:30"] },
    { nro_orden: 10, tipo_dia: 'sabado', turno: 'mañana', times: ["11:00", "11:04", "11:06", "11:15", "11:20", "11:23", "11:25", "11:27", "11:28", "11:30"] },
    { nro_orden: 13, tipo_dia: 'sabado', turno: 'mañana', times: ["12:00", "12:04", "12:06", "12:15", "12:20", "12:23", "12:25", "12:27", "12:28", "12:30"] },
    { nro_orden: 21, tipo_dia: 'sabado', turno: 'tarde', times: ["16:30", "16:34", "16:38", "16:45", "16:50", "16:53", "16:55", "16:57", "16:58", "17:00"] },
    { nro_orden: 25, tipo_dia: 'sabado', turno: 'tarde', times: ["18:30", "18:34", "18:38", "18:45", "18:50", "18:53", "18:55", "18:57", "18:58", "19:00"] },
    { nro_orden: 29, tipo_dia: 'sabado', turno: 'tarde', times: ["20:30", "20:34", "20:38", "20:45", "20:50", "20:53", "20:55", "20:57", "20:58", "21:00"] },
    // Domingos - New
    { nro_orden: 3, tipo_dia: 'domingo', turno: 'mañana', times: ["09:30", "09:34", "09:38", "09:45", "09:50", "09:53", "09:55", "09:57", "09:58", "10:00"] },
    { nro_orden: 5, tipo_dia: 'domingo', turno: 'mañana', times: ["12:00", "12:04", "12:06", "12:15", "12:20", "12:23", "12:25", "12:27", "12:28", "12:30"] },
    { nro_orden: 12, tipo_dia: 'domingo', turno: 'tarde', times: ["20:30", "20:34", "20:36", "20:45", "20:50", "20:53", "20:55", "20:58", "20:59", "21:00"] }
];

export const seedDatabase = async () => {
    const batch = writeBatch(db);

    // 0. Create Rutas
    const rutaIdaRef = doc(db, "rutas", RUTA_IDA_ID);
    batch.set(rutaIdaRef, {
        nombre: "Santa Lucía → Monteros",
        tipo: "ida",
        origen: "Santa Lucía",
        destino: "Monteros"
    });

    const rutaVueltaRef = doc(db, "rutas", RUTA_VUELTA_ID);
    batch.set(rutaVueltaRef, {
        nombre: "Monteros → Santa Lucía",
        tipo: "vuelta",
        origen: "Monteros",
        destino: "Santa Lucía"
    });

    // --- CLEANUP ---
    const paradasQuery = query(collection(db, "paradas"), where("id_ruta", "in", [RUTA_IDA_ID, RUTA_VUELTA_ID]));
    const paradasDeletable = await getDocs(paradasQuery);
    paradasDeletable.forEach(doc => batch.delete(doc.ref));

    const horariosQuery = query(collection(db, "horarios"), where("id_ruta", "in", [RUTA_IDA_ID, RUTA_VUELTA_ID]));
    const horariosDeletable = await getDocs(horariosQuery);
    horariosDeletable.forEach(doc => batch.delete(doc.ref));

    // 1. Create Paradas - IDA
    const paradaIdsIda = [];
    for (const p of PARADAS_IDA) {
        const ref = doc(collection(db, "paradas"));
        batch.set(ref, { nombre: p.nombre, orden: p.orden, id_ruta: RUTA_IDA_ID });
        paradaIdsIda.push(ref.id);
    }

    // 2. Create Paradas - VUELTA
    const paradaIdsVuelta = [];
    for (const p of PARADAS_VUELTA) {
        const ref = doc(collection(db, "paradas"));
        batch.set(ref, { nombre: p.nombre, orden: p.orden, id_ruta: RUTA_VUELTA_ID });
        paradaIdsVuelta.push(ref.id);
    }

    // 3. Create Schedules - IDA
    SCHEDULES_IDA.forEach(trip => {
        trip.times.forEach((time, index) => {
            if (index < paradaIdsIda.length) {
                const ref = doc(collection(db, "horarios"));
                batch.set(ref, {
                    id_ruta: RUTA_IDA_ID,
                    id_parada: paradaIdsIda[index],
                    horario: time,
                    tipo_dia: trip.tipo_dia,
                    turno: trip.turno,
                    nro_orden: trip.nro_orden,
                    shown: true
                });
            }
        });
    });

    // 4. Create Schedules - VUELTA
    SCHEDULES_VUELTA.forEach(trip => {
        trip.times.forEach((time, index) => {
            if (index < paradaIdsVuelta.length) {
                const ref = doc(collection(db, "horarios"));
                batch.set(ref, {
                    id_ruta: RUTA_VUELTA_ID,
                    id_parada: paradaIdsVuelta[index],
                    horario: time,
                    tipo_dia: trip.tipo_dia,
                    turno: trip.turno,
                    nro_orden: trip.nro_orden,
                    shown: true
                });
            }
        });
    });

    try {
        await batch.commit();
        console.log("Database seeded successfully with complete data!");
        return true;
    } catch (e) {
        console.error("Error seeding database: ", e);
        return false;
    }
};
