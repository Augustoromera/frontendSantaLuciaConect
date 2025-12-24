import { collection, query, where, getDocs, orderBy, doc, setDoc, addDoc, writeBatch, getDoc } from "firebase/firestore";
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

// --- Metadata / Caching Helper ---

export const updateScheduleVersion = async () => {
    try {
        const versionRef = doc(db, 'metadata', 'schedules_version');
        await setDoc(versionRef, { lastUpdated: Date.now() });
        console.log("Schedule version updated.");
    } catch (e) {
        console.error("Error updating schedule version:", e);
    }
};

// --- Helper to fetch everything needed for the Panel ---
export const fetchScheduleData = async (rutas) => {
    console.log("Fetching Schedule Data...");

    // 0. Check Version (1 Read)
    let serverVersion = 0;
    try {
        const versionSnap = await getDoc(doc(db, 'metadata', 'schedules_version'));
        if (versionSnap.exists()) {
            serverVersion = versionSnap.data().lastUpdated;
        } else {
            // First time, create it? Or just assume 0. Let's create it to be clean.
            // Actually, better to just let it be 0 and write it on next Admin save.
            console.log("No version metadata found. Assuming version 0.");
        }
    } catch (e) {
        console.warn("Could not fetch schedule version, bypassing cache.", e);
    }

    // 1. Check Local Cache
    const localVersion = localStorage.getItem('schedules_version');
    const cachedData = localStorage.getItem('schedules_data');

    // Only use cache if we found a server version (to ensure we are up to date) AND it matches local
    if (serverVersion && localVersion && serverVersion.toString() === localVersion && cachedData) {
        console.log("Using Cached Schedule Data (LocalStorage)");
        try {
            return JSON.parse(cachedData);
        } catch (e) {
            console.warn("Cache corrupted, fetching fresh.");
        }
    }

    console.log(`Fetching Fresh Schedule Data (Server: ${serverVersion} vs Local: ${localVersion})`);

    // --- Original Fetching Logic ---
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

        data.paradas[ruta.tipo] = paradas; // Kept for compat
        data.paradas[ruta.id] = paradas; // New safe way

        // 2. Get All Horarios for this Route
        const rawHorarios = await getHorariosByRuta(ruta.id);

        // 3. Group by Trip (nro_orden)
        const tripsMap = new Map();
        rawHorarios.forEach(h => {
            // Filter out hidden if needed, or filter in UI.
            if (h.shown === false) return;

            const tripId = h.nro_orden;
            if (!tripsMap.has(tripId)) tripsMap.set(tripId, {});
            tripsMap.get(tripId)[h.id_parada] = h;
        });

        // Convert to Array
        const trips = Array.from(tripsMap.values());

        // Sort trips by time of first stop
        trips.sort((a, b) => {
            // Compare the time of the first matching stop in paradas list
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

    // --- Save to Cache ---
    try {
        localStorage.setItem('schedules_data', JSON.stringify(data));
        // Only update version if we successfully fetched a server version. 
        // If serverVersion was 0 (missing), we don't want to cache forever as '0'.
        // But if we just start, it's fine.
        if (serverVersion) {
            localStorage.setItem('schedules_version', serverVersion.toString());
        }
    } catch (err) {
        console.warn("Storage quota exceeded or error saving to cache", err);
    }

    return data;
};
