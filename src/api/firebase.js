import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";

// 🚀 YOUR OFFICIAL FIREBASE CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyBVj0qDTfUyTeYBS0oEX1B31Knm5sIO-Qs",
  authDomain: "agri-sense-pb.firebaseapp.com",
  projectId: "agri-sense-pb",
  storageBucket: "agri-sense-pb.firebasestorage.app",
  messagingSenderId: "981404446811",
  appId: "1:981404446811:web:006d8123c6adca8fbf8f7e",
  measurementId: "G-111EYNGXGS"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const analytics = getAnalytics(app);
export const storage = getStorage(app);

// 🔐 SET PERMANENT PERSISTENCE
setPersistence(auth, browserLocalPersistence).catch(err => console.error("Persistence Error:", err));

export default app;
