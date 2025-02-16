// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { getStorage } from "firebase/storage";



const firebaseConfig = {
  apiKey: "AIzaSyBf566C6Wnpj0xKgsEf_mebWtLnlMAxK8w",
  authDomain: "thrifty-9064a.firebaseapp.com",
  projectId: "thrifty-9064a",
  storageBucket: "thrifty-9064a.firebasestorage.app",
  messagingSenderId: "1071829652113",
  appId: "1:1071829652113:web:612472d5d4700d1b0d6530",
  measurementId: "G-5L3DVNKTWR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
export const storage = getStorage(app)

const db = getFirestore(app);
export { auth, db, createUserWithEmailAndPassword, setDoc, doc };