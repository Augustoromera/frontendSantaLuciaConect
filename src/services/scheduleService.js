import { collection, query, where, getDocs, orderBy, doc, setDoc, addDoc, writeBatch } from "firebase/firestore";
import { db } from "../firebase/config";

// --- Service Functions ---

export const getRutas = async () => {
    const q = query(collection(db, "rutas"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const createRuta = async (rutaData) => {
    // rutaData should be { nombre, tipo, origen, destino }
    const res = await addDoc(collection(db, "rutas"), rutaData);
    return res.id;
}

export const getParadasByRuta = async (rutaId) => {
    // Ensure we filter by string ID as used in local constants
    const q = query(collection(db, "paradas"), where("id_ruta", "==", rutaId));
    const snapshot = await getDocs(q);
    const paradas = snapshot.docs.map(d => ({ _id: d.id, ...d.data() }));
    // Sort in memory to avoid Firestore Index requirement
    return paradas.sort((a, b) => (a.orden || 0) - (b.orden || 0));
};

export const getHorariosByRuta = async (rutaId) => {
    const q = query(collection(db, "horarios"), where("id_ruta", "==", rutaId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ _id: d.id, ...d.data() }));
};

// --- Helper to fetch everything needed for the Panel ---
export const fetchScheduleData = async (rutas) => {
    // Rutas must be passed in, or fetched if not provided?
    // Let's assume the caller provides the list of routes they want to see, 
    // or if null, we fetch all.
    let rutasToFetch = rutas;
    if (!rutasToFetch) {
        rutasToFetch = await getRutas();
    }

    const data = {
        rutas: rutasToFetch, // Return the routes too
        paradas: {}, // { rutaId_tipo: [paradas] }
        horarios: {} // { rutaId_tipo: [trips] }
    };

    for (const ruta of rutasToFetch) { // ruta: { id, tipo, nombre }
        // 1. Get Paradas
        const paradas = await getParadasByRuta(ruta.id);
        // Use ID or Tipo as key? Legacy code used Tipo ('ida'/'vuelta'). 
        // For distinct routes, ID is safer. But let's support both for backward compat or refactor.
        // Let's use 'tipo' if unique, otherwise fallback to ID.
        // Actually, to support multiple routes of same type, we should key by ID.
        // But the frontend expects [tipoRuta]. Let's try to stick to ID if possible or keep logic.
        // Warn: If we add "Monteros->Mesadas", what's its type? 'ida'? Then it conflicts.
        // KEY CHANGE: The frontend should probably look up by ID.
        // But for now, let's store by ID as primary.

        data.paradas[ruta.tipo] = paradas; // Kept for compat? No, this is dangerous for new routes.
        data.paradas[ruta.id] = paradas; // New safe way

        // 2. Get All Horarios for this Route
        const rawHorarios = await getHorariosByRuta(ruta.id);

        // 3. Group by Trip (nro_orden)
        const tripsMap = new Map();
        rawHorarios.forEach(h => {
            // Filter out hidden if needed, or filter in UI. Let's keep all and filter in UI.
            if (h.shown === false) return; // Optional: filter hidden on server side if index exists

            const tripId = h.nro_orden;
            if (!tripsMap.has(tripId)) tripsMap.set(tripId, {});
            tripsMap.get(tripId)[h.id_parada] = h;
        });

        // Convert to Array
        const trips = Array.from(tripsMap.values());

        // Sort trips by time of first stop
        trips.sort((a, b) => {
            // Find finding the first time in the trip isn't trivial if stops are missing
            // We use the parada order to find the "earliest" stop present in the trip
            // But simply: compare the time of the first matching stop in paradas list
            for (const p of paradas) {
                const timeA = a[p._id]?.horario;
                const timeB = b[p._id]?.horario;
                if (timeA && timeB) return timeA.localeCompare(timeB);
                if (timeA && !timeB) return -1; // Prioritize existing
                if (!timeA && timeB) return 1;
            }
            return 0;
        });

        data.horarios[ruta.tipo] = trips; // Legacy compat
        data.horarios[ruta.id] = trips; // New safe way
    }

    return data;
};
