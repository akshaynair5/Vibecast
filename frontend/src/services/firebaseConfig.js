// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: `${import.meta.env.VITE_FIREBASE_APP_KEY}`,
  authDomain: "project-1-11320.firebaseapp.com",
  projectId: "project-1-11320",
  storageBucket: "project-1-11320.firebasestorage.app",
  messagingSenderId: "942839472718",
  appId: `${import.meta.env.VITE_FIREBASE_APP_KEY}`,
  measurementId: "G-FNKB3JXK0H"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default db;