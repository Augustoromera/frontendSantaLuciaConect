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

// Sample schedules from Image 1 (Partially)
// Trip 2: 7:00 ... 7:30
const SCHEDULES_SAMPLE = [
    { nro_orden: 2, tipo_dia: 'habil', turno: 'mañana', times: ["07:00", "07:07", "07:09", "07:11", "07:13", "07:14", "07:15", "07:18", "07:20", "07:22", "07:30"] },
    { nro_orden: 3, tipo_dia: 'habil', turno: 'mañana', times: ["07:30", "07:37", "07:39", "07:41", "07:43", "07:44", "07:45", "07:48", "07:50", "07:52", "08:00"] },
    { nro_orden: 4, tipo_dia: 'habil', turno: 'mañana', times: ["08:00", "08:07", "08:09", "08:11", "08:13", "08:14", "08:15", "08:18", "08:20", "08:22", "08:30"] },
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

    // --- CLEANUP START ---
    // Delete existing Paradas and Horarios for these routes to prevent duplicates
    const paradasQuery = query(collection(db, "paradas"), where("id_ruta", "in", [RUTA_IDA_ID, RUTA_VUELTA_ID]));
    const paradasDeletable = await getDocs(paradasQuery);
    paradasDeletable.forEach(doc => {
        batch.delete(doc.ref);
    });

    const horariosQuery = query(collection(db, "horarios"), where("id_ruta", "in", [RUTA_IDA_ID, RUTA_VUELTA_ID]));
    const horariosDeletable = await getDocs(horariosQuery);
    horariosDeletable.forEach(doc => {
        batch.delete(doc.ref);
    });
    // --- CLEANUP END ---

    // 1. Create Paradas and store IDs
    const paradaIds = [];

    // Process IDA
    for (const p of PARADAS_IDA) {
        const ref = doc(collection(db, "paradas"));
        batch.set(ref, {
            nombre: p.nombre,
            orden: p.orden,
            id_ruta: RUTA_IDA_ID
        });
        paradaIds.push(ref.id); // Store in order
    }

    // 2. Create Schedules
    SCHEDULES_SAMPLE.forEach(trip => {
        trip.times.forEach((time, index) => {
            if (index < paradaIds.length) {
                const ref = doc(collection(db, "horarios"));
                batch.set(ref, {
                    id_ruta: RUTA_IDA_ID,
                    id_parada: paradaIds[index],
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
        console.log("Database seeded successfully!");
        return true;
    } catch (e) {
        console.error("Error seeding database: ", e);
        return false;
    }
};
