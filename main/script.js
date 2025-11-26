import { register, login } from "./firebase.js";

// login
document.getElementById("loginBtn").addEventListener("click", () => {
  const email = document.getElementById("loginEmail").value;
  const pass = document.getElementById("loginPass").value;

  login(email, pass)
    .then(() => console.log("Logged in"))
    .catch((err) => console.log("Error:", err.message));
});

// register (CHANGE STUFF HERE, I MADE IT AS BAREBONES AS POSSIBLE)
document.getElementById("regBtn").addEventListener("click", () => {
  const email = document.getElementById("regEmail").value;
  const pass = document.getElementById("regPass").value;

  register(email, pass)
    .then(() => console.log("Registered"))
    .catch((err) => console.log("Error:", err.message));
});
