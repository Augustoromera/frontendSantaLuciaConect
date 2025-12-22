import { collection, getDocs, addDoc, query, where, writeBatch, doc } from "firebase/firestore";
import { db } from "../firebase/config.js";

// Helper to normalize time
const t = (str) => str.trim();

const seed = async () => {
    console.log("Starting New Routes seed...");

    // --- 1. CAPITAN CACERES ---
    // User says: Monteros -> El Cercado -> Cap. Caceres -> El Cercado -> Monteros.
    // To represent this in our system which seems linear, we can create TWO routes possibly, 
    // or one route with duplicate stops (P1, P2, P3, P2, P1).
    // Let's try One Route with 5 stops.
    // Stops: Monteros(1), El Cercado(2), Cap. Caceres(3), El Cercado(4), Monteros(5).
    // If stops are unique by ID, we can reuse the ID?
    // The "Paradas" collection has `id_ruta`. So stops belong to a route.
    // So we can create 5 stops for this route.
    // Name: "Monteros - Capitan Caceres (Circular)"

    // Data
    // 1: 6:40 | 6:50 | 7:00 | 7:10 | 7:20
    // 3: 12:10 | 13:00 | 13:10 | 13:20 | 13:30
    // 4: 12:00* | 12:10 | 12:30 | 12:45 | 13:00 (*Corrected from 12:55)
    // 5: 18:30 | 18:40 | 18:50 | 19:00 | 19:10

    const capCaceresSchedule = [
        ["06:40", "06:50", "07:00", "07:10", "07:20"],
        ["12:10", "13:00", "13:10", "13:20", "13:30"],
        ["12:00", "12:10", "12:30", "12:45", "13:00"], // Row 4 (12:00 assumed)
        ["18:30", "18:40", "18:50", "19:00", "19:10"]
    ];

    // --- 2. MALDONADO ---
    // Route: Monteros -> Los Sosa -> Maldonado -> Los Sosa -> Arriba (Monteros).
    // 5 stops.
    // 1: 6:40 | 6:50 | 7:00 | 7:10 | 7:20
    // 2: 7:30 | 7:40 | 7:50 | 8:00 | 8:10
    // 6: 11:40 | 11:50 | 12:00 | 12:10 | 12:20
    // 7: 12:30 | 12:50 | 13:00 | 13:10 | 13:20
    // 8: 13:10 | 13:20 | 13:30 | 13:40 | 13:50
    // 13: 18:30 | 18:30? (Assume 18:40) | 18:45 | 19:00 | 19:10
    // (Row 13: 18:30 start, 18:45 arrive. 15m gap. 18:30 -> 18:40 -> 18:45. 5m? 10m?)
    // Row 1 says 10m gap. Row 6 says 10m gap.
    // I will assume Row 13: 18:30 -> 18:40 (Typo in image?) -> 18:45? (Only 5m to Maldonado?). 
    // Row 1: 6:50->7:00 (10m).
    // Row 13: 18:40->18:45 (5m). Maybe fast?

    const maldonadoSchedule = [
        ["06:40", "06:50", "07:00", "07:10", "07:20"],
        ["07:30", "07:40", "07:50", "08:00", "08:10"],
        ["11:40", "11:50", "12:00", "12:10", "12:20"],
        ["12:30", "12:50", "13:00", "13:10", "13:20"],
        ["13:10", "13:20", "13:30", "13:40", "13:50"],
        ["18:30", "18:40", "18:45", "19:00", "19:10"]
    ];

    // --- EXECUTION ---

    // 1. Create Route: Capitan Caceres
    const route1 = {
        nombre: "Monteros - Capitan Caceres",
        origen: "Monteros",
        destino: "Monteros",
        tipo: "circular"
    };
    const r1Ref = await addDoc(collection(db, "rutas"), route1);
    console.log("Created Route 1:", r1Ref.id);

    // Stops 1
    const stops1 = [
        { nombre: "Monteros", orden: 1 },
        { nombre: "El Cercado", orden: 2 },
        { nombre: "Cap. Caceres", orden: 3 },
        { nombre: "El Cercado (Vuelta)", orden: 4 },
        { nombre: "Monteros (Llegada)", orden: 5 }
    ];

    const stopIds1 = [];
    for (const s of stops1) {
        const ref = await addDoc(collection(db, "paradas"), { ...s, id_ruta: r1Ref.id });
        stopIds1.push(ref.id);
    }

    // Schedules 1
    const batch1 = writeBatch(db);
    capCaceresSchedule.forEach((times, idx) => {
        const tripId = Date.now() + idx;
        times.forEach((time, stopIdx) => {
            const docRef = doc(collection(db, "horarios")); // New doc ref
            batch1.set(docRef, {
                horario: time,
                id_parada: stopIds1[stopIdx],
                id_ruta: r1Ref.id,
                nro_orden: tripId,
                tipo_dia: "habil", // User requested dias habiles
                turno: parseInt(time.split(':')[0]) < 13 ? 'mañana' : 'tarde', // Simple heuristic
                shown: true
            });
        });
    });
    await batch1.commit();
    console.log("Created Schedules for Route 1");

    // 2. Create Route: Maldonado
    const route2 = {
        nombre: "Monteros - Maldonado",
        origen: "Monteros",
        destino: "Monteros",
        tipo: "circular"
    };
    const r2Ref = await addDoc(collection(db, "rutas"), route2);
    console.log("Created Route 2:", r2Ref.id);

    // Stops 2
    const stops2 = [
        { nombre: "Monteros", orden: 1 },
        { nombre: "Los Sosa", orden: 2 },
        { nombre: "Maldonado", orden: 3 },
        { nombre: "Los Sosa (Vuelta)", orden: 4 },
        { nombre: "Monteros (Llegada)", orden: 5 }
    ];

    const stopIds2 = [];
    for (const s of stops2) {
        const ref = await addDoc(collection(db, "paradas"), { ...s, id_ruta: r2Ref.id });
        stopIds2.push(ref.id);
    }

    // Schedules 2
    const batch2 = writeBatch(db);
    maldonadoSchedule.forEach((times, idx) => {
        const tripId = Date.now() + 100 + idx;
        times.forEach((time, stopIdx) => {
            const docRef = doc(collection(db, "horarios"));
            batch2.set(docRef, {
                horario: time,
                id_parada: stopIds2[stopIdx],
                id_ruta: r2Ref.id,
                nro_orden: tripId,
                tipo_dia: "habil",
                turno: parseInt(time.split(':')[0]) < 13 ? 'mañana' : 'tarde',
                shown: true
            });
        });
    });
    await batch2.commit();
    console.log("Created Schedules for Route 2");

    console.log("Done.");
    process.exit(0);
};

seed().catch(console.error);
