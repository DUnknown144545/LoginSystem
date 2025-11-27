import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
} from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAjaUwkqA8i6AFvLM8Mx7rYW5LFWsEuk30",
  authDomain: "authsystemteo.firebaseapp.com",
  projectId: "authsystemteo",
  storageBucket: "authsystemteo.appspot.com",
  messagingSenderId: "1041491628078",
  appId: "1:1041491628078:web:1814c2b22727fb262a0fbf",
  measurementId: "G-HYS8YMXDQ6",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Register
export function register(email, pass) {
  return createUserWithEmailAndPassword(auth, email, pass);
}

// Login
export function login(email, pass) {
  return signInWithEmailAndPassword(auth, email, pass);
}

// Google OAuth Login
const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: "select_account" });

export function googleLogin() {
  return signInWithPopup(auth, provider);
}

// Logout user
export function logout() {
  return signOut(auth);
}
