import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  authDomain: "fintech-app-85721.firebaseapp.com",
  projectId: "fintech-app-85721",
  storageBucket: "fintech-app-85721.firebasestorage.app",
  messagingSenderId: "132238843270",
  appId: "1:132238843270:web:88d3ef17fcea5b75e26007"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;

