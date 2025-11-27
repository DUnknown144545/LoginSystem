import { login } from "../firebase.js";
import { showMessage } from "../ui/messages.js";

export function initLogin() {
  document.getElementById("loginBtn").addEventListener("click", () => {
    const email = document.getElementById("loginEmail").value;
    const pass = document.getElementById("loginPass").value;

    if (!email || !pass) {
      showMessage("loginMessage", "Please fill in all fields", "error");
      return;
    }

    login(email, pass)
      .then(() => {
        showMessage(
          "loginMessage",
          "Login successful! Redirecting...",
          "success"
        );
        setTimeout(() => (window.location.href = "/main/dashboard.html"), 1200);
      })
      .catch((err) => {
        showMessage("loginMessage", err.message, "error");
      });
  });
}
