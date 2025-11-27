import { login, register } from "./firebase.js";

function showMessage(id, text, type) {
  const el = document.getElementById(id);
  el.textContent = text;
  el.className = `message ${type} show`;
  setTimeout(() => el.classList.remove("show"), 5000);
}

// Switch tabs
function switchTab(tab, btn) {
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  if (btn) btn.classList.add("active");

  document.querySelectorAll(".form-section").forEach(section => {
    section.classList.remove("active");
  });

  document
    .getElementById(tab === "login" ? "loginForm" : "registerForm")
    .classList.add("active");
}

document.querySelectorAll(".tabs .tab").forEach(btn => {
  btn.addEventListener("click", (e) => {
    const tab = btn.getAttribute("data-tab") || "login";
    switchTab(tab, e.currentTarget);
  });
});

// LOGIN
document.getElementById("loginBtn").addEventListener("click", () => {
  const email = document.getElementById("loginEmail").value;
  const pass = document.getElementById("loginPass").value;

  if (!email || !pass) {
    showMessage("loginMessage", "Please fill in all fields", "error");
    return;
  }

  login(email, pass)
    .then(() => {
      showMessage("loginMessage", "Login successful! Redirecting...", "success");
      setTimeout(() => (window.location.href = "dashboard.html"), 1200);
    })
    .catch(err => {
      showMessage("loginMessage", err.message, "error");
    });
});

// REGISTER
document.getElementById("regBtn").addEventListener("click", () => {
  const email = document.getElementById("regEmail").value;
  const pass = document.getElementById("regPass").value;

  if (!email || !pass) {
    showMessage("registerMessage", "Please fill in all fields", "error");
    return;
  }

  if (pass.length < 6) {
    showMessage("registerMessage", "Password must be at least 6 characters", "error");
    return;
  }

  register(email, pass)
    .then(() => {
      showMessage("registerMessage", "Registration successful! Redirecting...", "success");
      setTimeout(() => (window.location.href = "dashboard.html"), 1200);
    })
    .catch(err => {
      showMessage("registerMessage", err.message, "error");
    });
});
