import { googleLogin } from "../firebase.js";
import { showMessage } from "../ui/messages.js";

export function initGoogleLogin() {
  const googleBtn = document.getElementById("googleLogin");
  if (!googleBtn) return;

  googleBtn.addEventListener("click", () => {
    googleLogin()
      .then(() => {
        showMessage("loginMessage", "Google login successful!", "success");
        setTimeout(() => (window.location.href = "/main/dashboard.html"), 1200);
      })
      .catch((err) => {
        showMessage("loginMessage", err.message, "error");
      });
  });
}
