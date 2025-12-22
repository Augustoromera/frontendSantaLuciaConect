import { collection, query, where, getDocs, doc, writeBatch } from "firebase/firestore";
import { db } from "../firebase/config";

// Get all tariffs for a specific route
export const getTarifasByRuta = async (rutaId) => {
    try {
        const q = query(collection(db, "tarifas"), where("id_ruta", "==", rutaId));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(d => ({ ...d.data(), id: d.id }));
    } catch (error) {
        console.error("Error fetching tarifas:", error);
        return [];
    }
};

// Batch save tariffs
export const saveTarifasBatch = async (rutaId, tarifasToSave) => {
    try {
        const batch = writeBatch(db);

        tarifasToSave.forEach(t => {
            const docRef = t.id ? doc(db, "tarifas", t.id) : doc(collection(db, "tarifas"));
            const data = {
                id_ruta: rutaId,
                origen: t.origen, // store ID or Name? detailed plan said Name or ID. Let's use ID for robustness.
                destino: t.destino,
                precio: Number(t.precio)
            };

            if (t.id) {
                batch.update(docRef, data);
            } else {
                batch.set(docRef, data);
            }
        });

        await batch.commit();
        return true;
    } catch (error) {
        console.error("Error saving tarifas:", error);
        throw error;
    }
};
