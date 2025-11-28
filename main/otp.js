import { verifyEmailOtp, getPendingOtpContext, clearPendingOtpContext, createOtpForUser } from "./firebase.js";
import { showMessage } from "./ui/messages.js";

const otpInput = document.getElementById("otpCode");
const verifyBtn = document.getElementById("verifyOtpBtn");
const resendBtn = document.getElementById("resendOtpBtn");
const otpEmailSpan = document.getElementById("otpEmail");

const { uid, email } = getPendingOtpContext();
if (otpEmailSpan) otpEmailSpan.textContent = email || "your email";

if (!uid || !email) {
  showMessage("otpMessage", "No pending verification found. Please log in.", "error");
  setTimeout(() => (window.location.href = "/main/index.html"), 1200);
}

if (otpInput) {
  otpInput.addEventListener("input", () => {
    otpInput.value = otpInput.value.replace(/\D/g, "").slice(0, 6);
  });
}

if (verifyBtn) {
  verifyBtn.addEventListener("click", async () => {
    const code = (otpInput?.value || "").trim();
    if (!code || code.length !== 6) {
      showMessage("otpMessage", "Please enter the 6-digit code.", "error");
      return;
    }
    verifyBtn.disabled = true;
    try {
      await verifyEmailOtp(uid, code);
      showMessage("otpMessage", "Email verified! Redirecting...", "success");
      clearPendingOtpContext();
      setTimeout(() => (window.location.href = "/main/dashboard.html"), 700);
    } catch (err) {
      showMessage("otpMessage", err?.message || "Failed to verify code", "error");
      verifyBtn.disabled = false;
    }
  });
}

if (resendBtn) {
  resendBtn.addEventListener("click", async () => {
    if (!uid || !email) return;
    resendBtn.disabled = true;
    try {
      await createOtpForUser(uid, email);
      showMessage("otpMessage", "A new code has been sent to your email.", "success");
    } catch (err) {
      showMessage("otpMessage", err?.message || "Failed to resend code", "error");
    } finally {
      setTimeout(() => {
        resendBtn.disabled = false;
      }, 30000);
    }
  });
}
