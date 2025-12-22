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

// Batch save tariffs AND sync reverse (return trip) prices
export const saveTarifasAndSyncReverse = async (rutaId, tarifasToSave) => {
    try {
        const batch = writeBatch(db);
        const tarifasRef = collection(db, "tarifas");

        // Use Promise.all to handle async lookups for reverse trips
        await Promise.all(tarifasToSave.map(async (t) => {
            // 1. Update/Create Primary Tariff
            const docRef = t.id ? doc(db, "tarifas", t.id) : doc(tarifasRef);
            const data = {
                id_ruta: rutaId,
                origen: t.origen,
                destino: t.destino,
                precio: Number(t.precio)
            };

            if (t.id) {
                batch.update(docRef, data);
            } else {
                batch.set(docRef, data);
            }

            // 2. Find and Update Reverse Tariffs (Any route)
            // Look for tariffs where Origin = CurrentDest AND Dest = CurrentOrigin
            // This assumes price symmetry (A->B Price == B->A Price)
            const reverseQuery = query(
                tarifasRef,
                where("origen", "==", t.destino),
                where("destino", "==", t.origen)
            );

            const reverseSnapshot = await getDocs(reverseQuery);

            reverseSnapshot.forEach((reverseDoc) => {
                // Determine if we should update. 
                // We update REGARDLESS of route, assuming distance/price is constant.
                batch.update(reverseDoc.ref, { precio: Number(t.precio) });
            });
        }));

        await batch.commit();
        return true;
    } catch (error) {
        console.error("Error saving and syncing tarifas:", error);
        throw error;
    }
};
