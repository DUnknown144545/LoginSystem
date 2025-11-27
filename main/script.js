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
      setTimeout(() => (window.location.href = "/main/dashboard.html"), 1200);
    })
    .catch(err => {
      showMessage("loginMessage", err.message, "error");
    });
});

// REGISTER
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
    showMessage("registerMessage", "Password must be at least 8 characters", "error");
    return;
  }

  register(email, pass)
    .then(() => {
      showMessage("registerMessage", "Registration successful! Redirecting...", "success");
      setTimeout(() => (window.location.href = "/main/dashboard.html"), 1200);
    })
    .catch(err => {
      showMessage("registerMessage", err.message, "error");
    });
});

// Password strength (inline)
const inlineStrengthText = document.getElementById("inlineStrengthText");
const segmentEls = document.querySelectorAll('.inline-meter .seg');
const critLength = document.getElementById("critLength");
const critUpper = document.getElementById("critUpper");
const critLower = document.getElementById("critLower");
const critNumber = document.getElementById("critNumber");
const critSpecial = document.getElementById("critSpecial");

function evalPassword(pwd) {
  const checks = {
    length: pwd.length >= 8,
    upper: /[A-Z]/.test(pwd),
    lower: /[a-z]/.test(pwd),
    number: /\d/.test(pwd),
    special: /[^A-Za-z0-9]/.test(pwd),
  };
  const score = Object.values(checks).reduce((a, b) => a + (b ? 1 : 0), 0);
  return { checks, score };
}

function setCrit(el, ok) {
  if (!el) return;
  el.classList.toggle("ok", !!ok);
}

function updateStrengthUI() {
  const pwd = document.getElementById("regPass").value || "";
  const { checks, score } = evalPassword(pwd);
  const pct = Math.min(5, Math.max(0, score)) * 20;
  let color = "#ef4444";
  let label = "Weak";
  if (score >= 5) { color = "#10b981"; label = "Very strong"; }
  else if (score === 4) { color = "#3b82f6"; label = "Strong"; }
  else if (score === 3) { color = "#f59e0b"; label = "Medium"; }
  else if (score === 2) { color = "#f97316"; label = "Fair"; }

  // Update 5-segment meter
  if (segmentEls && segmentEls.length) {
    const active = Math.min(5, Math.max(0, score));
    segmentEls.forEach((seg, idx) => {
      seg.style.background = idx < active ? color : "#e2e8f0";
    });
  }
  if (inlineStrengthText) {
    inlineStrengthText.textContent = `Strength: ${pwd ? label : "—"}`;
    inlineStrengthText.style.color = pwd ? color : "#718096";
    const bg = !pwd ? "#edf2f7" : (
      score >= 5 ? "rgba(16,185,129,0.15)" :
      score === 4 ? "rgba(59,130,246,0.15)" :
      score === 3 ? "rgba(245,158,11,0.15)" :
      score === 2 ? "rgba(249,115,22,0.15)" :
      "rgba(239,68,68,0.15)"
    );
    inlineStrengthText.style.backgroundColor = bg;
  }
  setCrit(critLength, checks.length);
  setCrit(critUpper, checks.upper);
  setCrit(critLower, checks.lower);
  setCrit(critNumber, checks.number);
  setCrit(critSpecial, checks.special);
}

const regPassInput = document.getElementById("regPass");
if (regPassInput) {
  regPassInput.addEventListener("input", updateStrengthUI);
}
