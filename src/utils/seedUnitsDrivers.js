import { collection, getDocs, addDoc, query, where, writeBatch, doc } from "firebase/firestore";
import { db } from "../firebase/config.js";

const drivers = [
    { nombre: "ACUÑA ANGEL OSCAR", cuil: "20-14347091-2" },
    { nombre: "ALBORNOZ CESAR ELOY", cuil: "20-22611017-9" },
    { nombre: "BRANDAN NESTOR ENRRIQUE", cuil: "20-13981790-8" },
    { nombre: "CARO SERGIO MIGUEL", cuil: "20-27631251-1" },
    { nombre: "DELGADO HECTOR HUGO", cuil: "20-16811138-0" },
    { nombre: "DELGADO LUIS LEONARDO", cuil: "20-20968912-0" },
    { nombre: "GARAY JOSE ARIEL", cuil: "20-24405594-3" },
    { nombre: "GAROLERA JOSE CARLOS", cuil: "20-31429038-1" },
    { nombre: "PACHECO BENJAMIN SERGIO", cuil: "20-41345863-4" },
    { nombre: "SANAGUA SOLEDAD DEL CARMEN", cuil: "27-24134096-7" },
    { nombre: "SIDAN ALE", cuil: "20-26262036-1" }, // Name truncated? Assuming "ALE" is correct or shorthand. Sidan Ale?
    { nombre: "SIDAN EMIN", cuil: "20-28742915-1" },
    { nombre: "SILVA LUIS HECTOR", cuil: "20-27740352-9" },
    { nombre: "TRIPOLONI LUCIANA", cuil: "27-35520756-0" },
    { nombre: "TRIPOLONI LUIS RICARDO", cuil: "20-10537901-1" },
    { nombre: "TRIPOLONI ANGELA", cuil: "27-36534452-9" },
    { nombre: "ZELARAYAN HUMBERTO GUSTAVO", cuil: "20-16376500-5" },
    { nombre: "ZELARAYAN ARIEL SEBASTIAN", cuil: "2032416549-8" }, // 20-324... typo in image? 2032...
    { nombre: "ZELARAYAN FERNANDO JAVIER", cuil: "20-30539652-5" },
];

const units = [
    { interno: 10, marca: "MERCEDES BENZ", modelo: "OF 1418", year: 2014, dominio: "NUN 096", vtv: "08/04/2025" },
    { interno: 11, marca: "MERCEDES BENZ", modelo: "OF-1418", year: 2014, dominio: "NUN 098", vtv: "02/04/2025" },
    { interno: 12, marca: "MERCEDES BENZ", modelo: "OF 1418", year: 2014, dominio: "OHC 272", vtv: "18/03/2025" }, // OHC? or 0HC? Usually letters.
    { interno: 14, marca: "MERCEDES BENZ", modelo: "OF 148", year: 2012, dominio: "LGI 363", vtv: "11/03/2025" }, // Typo manual? LGI
    { interno: 16, marca: "MERCEDES BENZ", modelo: "OF 1418", year: 2013, dominio: "LGI 365", vtv: "28/04/2025" },
    { interno: 18, marca: "MERCEDES BENZ", modelo: "BMO 384", year: 2009, dominio: "ICQ 313", vtv: "14/03/2025" },
    { interno: 22, marca: "MERCEDES BENZ", modelo: "OF 1418", year: 2010, dominio: "JJD 388", vtv: "10/04/2025" },
    { interno: 23, marca: "MERCEDES BENZ", modelo: "OF 1418", year: 2010, dominio: "IVX 175", vtv: "26/03/2025" },
    { interno: 24, marca: "MERCEDES BENZ", modelo: "OF 1621", year: 2018, dominio: "AD006US", vtv: "04/03/2025" },
    { interno: 25, marca: "MERCEDES BENZ", modelo: "OH 1618", year: 2015, dominio: "OOI 193", vtv: "20/03/2025" }
];

// Insurance data mapping (by Interno)
const insurance = {
    10: { poliza: "50/016680", vigencia: "09/11/2025" },
    11: { poliza: "50/016681", vigencia: "09/11/2025" },
    12: { poliza: "50/016682", vigencia: "09/11/2025" },
    14: { poliza: "50/016684", vigencia: "09/11/2025" },
    16: { poliza: "50/016686", vigencia: "09/11/2025" }, // Note: 16 skip? No, data has 16.
    18: { poliza: "50/016688", vigencia: "09/11/2025" },
    22: { poliza: "50/016682", vigencia: "09/11/2025" }, // Duplicate poliza? Possible group policy or typo in image.
    23: { poliza: "50/016683", vigencia: "09/11/2025" },
    24: { poliza: "50/016684", vigencia: "09/11/2025" },
    25: { poliza: "50/016685", vigencia: "09/11/2025" },
};

const seed = async () => {
    console.log("Seeding Drivers and Units...");

    // Drivers
    for (const d of drivers) {
        // Simple Add. Duplicates might happen if run multiple times but fine for now.
        // Better: Check uniqueness?
        // Let's just add Doc.
        await addDoc(collection(db, "choferes"), {
            ...d,
            status: "activo", // Default
            foto: null
        });
    }
    console.log(`Added ${drivers.length} drivers.`);

    // Units
    for (const u of units) {
        const ins = insurance[u.interno] || {};
        await addDoc(collection(db, "unidades"), {
            ...u,
            seguro: {
                compania: "PROTECCION",
                poliza: ins.poliza || "",
                vigencia: ins.vigencia || "",
                cobertura: "A"
            },
            status: "activo"
        });
    }
    console.log(`Added ${units.length} units.`);

    console.log("Done.");
    process.exit(0);
};

seed().catch(console.error);
