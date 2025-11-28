import { login } from "../firebase.js";
import { showMessage } from "../ui/messages.js";

let loginAttempts = 0;
const MAX_ATTEMPTS = 3;
const LOCKOUT_TIME = 10 * 60 * 1000; // 10 minutes in milliseconds
let lockoutTimer = null;

export function initLogin() {
  const loginBtn = document.getElementById("loginBtn");
  const loginTimer = document.getElementById("loginTimer");
  
  // Check if there's an existing lockout on page load
  checkExistingLockout(loginBtn, loginTimer);
  
  loginBtn.addEventListener("click", () => {
    // Check if button is disabled
    if (loginBtn.disabled) {
      return;
    }

    const email = document.getElementById("loginEmail").value;
    const pass = document.getElementById("loginPass").value;

    if (!email || !pass) {
      showMessage("loginMessage", "Please fill in both your email and password to continue.", "error");
      return;
    }

    // Basic email validation
    if (!email.includes('@')) {
      showMessage("loginMessage", "Please enter a valid email address.", "error");
      return;
    }

    login(email, pass)
      .then(() => {
        // Reset attempts on successful login
        loginAttempts = 0;
        clearLockout(loginTimer);
        showMessage(
          "loginMessage",
          "Welcome back! Taking you to your dashboard...",
          "success"
        );
        setTimeout(() => (window.location.href = "main/dashboard.html"), 1200);
      })
      .catch((err) => {
        // Increment failed attempts
        loginAttempts++;
        
        if (loginAttempts >= MAX_ATTEMPTS) {
          // Disable button and start timer
          startLockout(loginBtn, loginTimer);
        } else {
          const attemptsLeft = MAX_ATTEMPTS - loginAttempts;
          const friendlyError = getFriendlyErrorMessage(err.code || err.message);
          showMessage(
            "loginMessage", 
            `${friendlyError} You have ${attemptsLeft} ${attemptsLeft !== 1 ? 'attempts' : 'attempt'} remaining.`, 
            "error"
          );
        }
      });
  });
}

function getFriendlyErrorMessage(errorCode) {
  const errorMessages = {
    'auth/invalid-email': 'The email address you entered is not valid.',
    'auth/user-disabled': 'This account has been disabled. Please contact support.',
    'auth/user-not-found': 'No account found with this email. Please check your email or sign up.',
    'auth/wrong-password': 'The password you entered is incorrect. Please try again.',
    'auth/invalid-credential': 'The email or password you entered is incorrect. Please try again.',
    'auth/too-many-requests': 'Too many unsuccessful login attempts. Please try again later.',
    'auth/network-request-failed': 'Connection issue. Please check your internet and try again.',
    'auth/email-already-in-use': 'This email is already registered. Please log in instead.',
    'auth/weak-password': 'Your password is too weak. Please use at least 6 characters.',
    'auth/operation-not-allowed': 'Email/password login is currently disabled. Please contact support.',
    'auth/popup-closed-by-user': 'Sign-in was cancelled. Please try again.',
    'auth/cancelled-popup-request': 'Sign-in was cancelled. Please try again.',
  };

  return errorMessages[errorCode] || 'Something went wrong. Please check your email and password and try again.';
}

function startLockout(loginBtn, loginTimer) {
  const lockoutEnd = Date.now() + LOCKOUT_TIME;
  localStorage.setItem('loginLockoutEnd', lockoutEnd.toString());
  
  loginBtn.disabled = true;
  loginBtn.style.opacity = "0.5";
  loginBtn.style.cursor = "not-allowed";
  
  // Hide error message and show timer
  const loginMessage = document.getElementById("loginMessage");
  loginMessage.classList.remove("show");
  
  updateTimerDisplay(loginBtn, loginTimer, lockoutEnd);
}

function updateTimerDisplay(loginBtn, loginTimer, lockoutEnd) {
  const updateTimer = () => {
    const timeLeft = lockoutEnd - Date.now();
    
    if (timeLeft <= 0) {
      // Timer expired, re-enable button
      enableLoginButton(loginBtn, loginTimer);
      clearInterval(lockoutTimer);
      lockoutTimer = null;
      return;
    }
    
    // Calculate minutes and seconds
    const minutes = Math.floor(timeLeft / 60000);
    const seconds = Math.floor((timeLeft % 60000) / 1000);
    
    // Update timer display
    loginTimer.innerHTML = `
      <div class="timer-icon">🔒</div>
      <div class="timer-text">Too many failed attempts detected.</div>
      <div class="timer-text">For your security, please wait:</div>
      <div class="timer-countdown">${minutes}:${seconds.toString().padStart(2, '0')}</div>
    `;
    loginTimer.classList.add("show");
  };
  
  // Update immediately
  updateTimer();
  
  // Update every second
  lockoutTimer = setInterval(updateTimer, 1000);
}

function enableLoginButton(loginBtn, loginTimer) {
  loginAttempts = 0;
  loginBtn.disabled = false;
  loginBtn.style.opacity = "1";
  loginBtn.style.cursor = "pointer";
  localStorage.removeItem('loginLockoutEnd');
  
  // Hide timer and show success message
  loginTimer.classList.remove("show");
  showMessage("loginMessage", "You can try logging in again now. Please make sure you're using the correct email and password.", "success");
}

function clearLockout(loginTimer) {
  localStorage.removeItem('loginLockoutEnd');
  if (lockoutTimer) {
    clearInterval(lockoutTimer);
    lockoutTimer = null;
  }
  loginTimer.classList.remove("show");
}

function checkExistingLockout(loginBtn, loginTimer) {
  const lockoutEnd = localStorage.getItem('loginLockoutEnd');
  
  if (lockoutEnd) {
    const lockoutEndTime = parseInt(lockoutEnd);
    
    if (Date.now() < lockoutEndTime) {
      // Lockout still active
      loginBtn.disabled = true;
      loginBtn.style.opacity = "0.5";
      loginBtn.style.cursor = "not-allowed";
      updateTimerDisplay(loginBtn, loginTimer, lockoutEndTime);
    } else {
      // Lockout expired
      clearLockout(loginTimer);
    }
  }
}