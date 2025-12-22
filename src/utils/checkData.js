import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/config.js";

const check = async () => {
    console.log("Checking DB...");
    try {
        const uSnap = await getDocs(collection(db, "unidades"));
        console.log("Unidades count:", uSnap.size);
        if (uSnap.size > 0) {
            console.log("Sample Unit:", JSON.stringify(uSnap.docs[0].data(), null, 2));
        }

        const cSnap = await getDocs(collection(db, "choferes"));
        console.log("Choferes count:", cSnap.size);
    } catch (e) {
        console.error("Error checking DB:", e);
    }
    process.exit(0);
};

check().catch(console.error);
