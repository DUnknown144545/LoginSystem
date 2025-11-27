import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";

// firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAjaUwkqA8i6AFvLM8Mx7rYW5LFWsEuk30",
  authDomain: "authsystemteo.firebaseapp.com",
  projectId: "authsystemteo",
  storageBucket: "authsystemteo.appspot.com",   // FIXED
  messagingSenderId: "1041491628078",
  appId: "1:1041491628078:web:1814c2b22727fb262a0fbf",
  measurementId: "G-HYS8YMXDQ6",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// register
export function register(email, pass) {
  return createUserWithEmailAndPassword(auth, email, pass);
}

// login
export function login(email, pass) {
  return signInWithEmailAndPassword(auth, email, pass);
}

// logout
export function logout() {
  return signOut(auth);
}
