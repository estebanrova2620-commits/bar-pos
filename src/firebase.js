// src/firebase.js
// ─────────────────────────────────────────────────────────────────
// INSTRUCCIONES:
// 1. Ve a firebase.google.com → tu proyecto → ⚙️ Configuración
// 2. Baja a "Tus apps" → la app web que creaste
// 3. Copia los valores de firebaseConfig y pégalos aquí abajo
// ─────────────────────────────────────────────────────────────────

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey:            "PEGA_AQUI_TU_apiKey",
  authDomain:        "PEGA_AQUI_TU_authDomain",
  projectId:         "PEGA_AQUI_TU_projectId",
  storageBucket:     "PEGA_AQUI_TU_storageBucket",
  messagingSenderId: "PEGA_AQUI_TU_messagingSenderId",
  appId:             "PEGA_AQUI_TU_appId",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
