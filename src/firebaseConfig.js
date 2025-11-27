// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// TODO: Replace with your actual Firebase project configuration
// const firebaseConfig = {
//   apiKey: "YOUR_API_KEY",
//   authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
//   projectId: "YOUR_PROJECT_ID",
//   storageBucket: "YOUR_PROJECT_ID.appspot.com",
//   messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
//   appId: "YOUR_APP_ID"
// };
const firebaseConfig = {
  apiKey: "AIzaSyDLy7qqRPBZOMJDWvNWq7nUPRasjvQe9qk",
  authDomain: "gwtgame-5f325.firebaseapp.com",
  projectId: "gwtgame-5f325",
  storageBucket: "gwtgame-5f325.firebasestorage.app",
  messagingSenderId: "487229906802",
  appId: "1:487229906802:web:2929ae929e7818b956c7eb"
};
// Initialize Firebase
let app;
let auth;
let googleProvider;
let db;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();
  db = getFirestore(app);
} catch (error) {
  console.warn("Firebase initialization failed. Auth features will be disabled.", error);
  auth = null;
  googleProvider = null;
  db = null;
}

export { auth, googleProvider, db };
