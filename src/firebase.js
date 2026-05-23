import { initializeApp } from "firebase/app";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBfwpjvEXQpGQlDbsHOyUuS0D6otPhPX04",
  authDomain: "bar-pos-53d13.firebaseapp.com",
  projectId: "bar-pos-53d13",
  storageBucket: "bar-pos-53d13.firebasestorage.app",
  messagingSenderId: "745120446362",
  appId: "1:745120446362:web:4cd3a8d2ae472950852c23"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Persistencia offline — guarda datos localmente
// Si se va el internet, sigue funcionando y sincroniza al volver
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    // Múltiples pestañas abiertas — solo funciona en una
    console.warn("Persistencia offline: cierra otras pestañas del Bar POS");
  } else if (err.code === 'unimplemented') {
    // El navegador no soporta persistencia offline
    console.warn("Este navegador no soporta modo offline");
  }
});
