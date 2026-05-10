import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getStorage } from "firebase/storage";

// 🚀 YOUR OFFICIAL FIREBASE CONFIG
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// ⚠️ Analytics removed: getAnalytics() was the PRIMARY white-screen crash root cause.
// It throws synchronously when measurementId is undefined, before React even mounts.
// Exported as null for backward compatibility with any code that imports it.
export const analytics = null;

// 🔐 SET PERMANENT PERSISTENCE
setPersistence(auth, browserLocalPersistence).catch(err => console.error("Persistence Error:", err));

export default app;
