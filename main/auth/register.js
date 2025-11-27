import { register } from "../firebase.js";
import { showMessage } from "../ui/messages.js";

export function initRegister() {
  document.getElementById("regBtn").addEventListener("click", () => {
    const email = document.getElementById("regEmail").value;
    const pass = document.getElementById("regPass").value;
    const pass2 = document.getElementById("regPass2").value;

    if (!email || !pass || !pass2) {
      showMessage("registerMessage", "Please fill in all fields", "error");
      return;
    }

    if (pass !== pass2) {
      showMessage("registerMessage", "Passwords do not match", "error");
      return;
    }

    if (pass.length < 8) {
      showMessage(
        "registerMessage",
        "Password must be at least 8 characters",
        "error"
      );
      return;
    }

    register(email, pass)
      .then(() => {
        showMessage(
          "registerMessage",
          "Registration successful! Redirecting...",
          "success"
        );
        setTimeout(() => (window.location.href = "/main/dashboard.html"), 1200);
      })
      .catch((err) => {
        showMessage("registerMessage", err.message, "error");
      });
  });
}
