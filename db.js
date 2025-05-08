import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBq0_hNs7c1wl85RMiQLUbcbLnaPvAShns",
  authDomain: "gem2-9be37.firebaseapp.com",
  projectId: "gem2-9be37",
  storageBucket: "gem2-9be37.firebasestorage.app",
  messagingSenderId: "459906131969",
  appId: "1:459906131969:web:bba6065a8f0e80c3b7b800"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

export const auth = getAuth(app);

export default db;