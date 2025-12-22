import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAJYQWPAwP75W8KeF8n3lR12sKVIb8L5Rk",
    authDomain: "transportesantalucia-3940e.firebaseapp.com",
    projectId: "transportesantalucia-3940e",
    storageBucket: "transportesantalucia-3940e.firebasestorage.app",
    messagingSenderId: "157813684092",
    appId: "1:157813684092:web:db9d9dfb5a5b6e657796f9"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
