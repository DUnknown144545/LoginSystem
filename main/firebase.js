import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";

// replace stuff here
const firebaseConfig = {
  apiKey: "",
  authDomain: "stuff.firebaseapp.com etc...",
  projectId: "",
  appId: "",
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
