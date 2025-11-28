import { logout } from "./firebase.js";

const btn = document.getElementById("logoutBtn");

if (btn) {
  btn.addEventListener("click", async () => {
    btn.disabled = true;
    try {
      await logout();
      window.location.href = "index.html";
    } catch (err) {
      alert(err?.message || "Failed to logout");
      btn.disabled = false;
    }
  });
}
