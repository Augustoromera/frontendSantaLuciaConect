import { collection, getDocs, addDoc, query, where, writeBatch, doc, setDoc } from "firebase/firestore";
import { db } from "../firebase/config.js";

// const app = initializeApp(firebaseConfig);
// const db = getFirestore(app);

const tariffData = [
    // Monteros -> X
    { origen: "Monteros", destino: "Citromax", precio: 790 },
    { origen: "Monteros", destino: "Cerveceria", precio: 790 },
    { origen: "Monteros", destino: "Acheral", precio: 920 },
    { origen: "Monteros", destino: "KM 3", precio: 1510 }, // "KM 3" might be "Km 3" in DB
    { origen: "Monteros", destino: "La Cienaga", precio: 1510 },
    { origen: "Monteros", destino: "Fagalde", precio: 1510 },
    { origen: "Monteros", destino: "Santa Lucia", precio: 1510 },

    // Santa Lucia -> X
    { origen: "Santa Lucia", destino: "Fagalde", precio: 790 },
    { origen: "Santa Lucia", destino: "La Cienaga", precio: 790 },
    { origen: "Santa Lucia", destino: "KM 3", precio: 790 },
    { origen: "Santa Lucia", destino: "Acheral", precio: 920 },
    { origen: "Santa Lucia", destino: "Cerveceria", precio: 1510 },
    { origen: "Santa Lucia", destino: "Citromax", precio: 1510 },
    { origen: "Santa Lucia", destino: "Monteros", precio: 1510 },
];

const normalize = (str) => str.toLowerCase().replace(/á/g, 'a').replace(/í/g, 'i').trim();

const seed = async () => {
    console.log("Starting tariff seed...");

    // 1. Get all Paradas to map Name -> ID
    const paradasSnapshot = await getDocs(collection(db, "paradas"));
    const paradasMap = {}; // name_normalized -> id
    const paradasMapReverse = {}; // id -> name

    paradasSnapshot.forEach(doc => {
        const data = doc.data();
        const nameNorm = normalize(data.nombre);
        paradasMap[nameNorm] = doc.id;
        paradasMapReverse[doc.id] = data.nombre;
        // console.log(`Found stop: ${data.nombre} -> ${doc.id}`);
    });

    // 2. Get all Rutas to associate tariffs? 
    // Usually tariffs are associated with a Ruta ID, or just Origin/Dest pair?
    // In `PanelDeHorarios`: `const tarifa = tarifas.find(t => t.origen === origen && t.destino === destino);`
    // It filters `getTarifasByRuta(selectedRutaId)`.
    // So `tarifas` entries MUST have `id_ruta`.

    const rutasSnapshot = await getDocs(collection(db, "rutas"));
    const rutas = [];
    rutasSnapshot.forEach(d => rutas.push({ id: d.id, ...d.data() }));

    console.log(`Found ${rutas.length} routes.`);

    // We need to decide which Ruta ID to assign these tariffs to.
    // Assuming we have "Santa Lucia - Monteros" route.
    // We should add these tariffs to relevant routes. 
    // Ideally, we add to ALL routes that contain these stops?
    // Or specific ones. "Santa Lucia -> Monteros" covers both directions usually or separate routes?
    // User context implies separate routes or bidirectional.

    let addedCount = 0;

    for (const ruta of rutas) {
        console.log(`Processing route: ${ruta.nombre} (${ruta.id})`);

        // Check if this route has these stops?
        // Logic: For each tariffpair, if both stops exist in this route (are in 'paradas' collection for this route?), add tariff.
        // But `paradas` collection has `id_ruta`. So stops are unique per route likely?
        // Step 769: `getParadasByRuta` queries `paradas` where `id_ruta == rutaId`.
        // So yes, Paradas are unique to a Route.

        // So for "Santa Lucia -> Monteros", we must find the stops with `id_ruta == ruta.id`.

        // Filter paradas for this route
        const routeParadas = paradasSnapshot.docs
            .map(d => ({ id: d.id, ...d.data() }))
            .filter(p => p.id_ruta === ruta.id);

        const routeParadasMap = {};
        routeParadas.forEach(p => {
            routeParadasMap[normalize(p.nombre)] = p.id;
        });

        // Now try to match tariffs
        for (const item of tariffData) {
            const origenId = routeParadasMap[normalize(item.origen)];
            const destinoId = routeParadasMap[normalize(item.destino)];

            if (origenId && destinoId) {
                // This route contains both stops. Add tariff.
                // Check if exists?
                // For simplicity, just add. Or delete old?
                // Let's delete existing matching tariffs first to avoid dupes?
                // Actually `addDoc` creates new. 
                // We should probably check.

                const qT = query(collection(db, "tarifas"),
                    where("id_ruta", "==", ruta.id),
                    where("origen", "==", origenId),
                    where("destino", "==", destinoId)
                );
                const ex = await getDocs(qT);
                if (!ex.empty) {
                    console.log(`Updating existing tariff for ${item.origen} -> ${item.destino} in route ${ruta.nombre}`);
                    const docId = ex.docs[0].id;
                    await setDoc(doc(db, "tarifas", docId), {
                        id_ruta: ruta.id,
                        origen: origenId,
                        destino: destinoId,
                        precio: item.precio
                    });
                } else {
                    console.log(`Adding new tariff for ${item.origen} -> ${item.destino} in route ${ruta.nombre}`);
                    await addDoc(collection(db, "tarifas"), {
                        id_ruta: ruta.id,
                        origen: origenId,
                        destino: destinoId,
                        precio: item.precio
                    });
                }
                addedCount++;
            }
        }
    }

    console.log(`Seed complete. Processed ${addedCount} tariffs.`);
    process.exit(0);
};

seed().catch(console.error);
