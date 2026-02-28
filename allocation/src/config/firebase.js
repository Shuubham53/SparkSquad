import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";// Data save karne ke liye
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyB42u8Oj9vdg0M1cdQAXaaWbM48zOB3ONc",
  authDomain: "spark-squad.firebaseapp.com",
  projectId: "spark-squad",
  storageBucket: "spark-squad.firebasestorage.app",
  messagingSenderId: "193089823183",
  appId: "1:193089823183:web:481792bb0531c7dcb132ba"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app); // <--- 'export' hona zaroori hai
export const db = getFirestore(app);
export const storage = getStorage(app);