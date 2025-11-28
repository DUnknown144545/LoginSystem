// register.js - Updated with OTP
import { register } from "../firebase.js";
import { showMessage } from "../ui/messages.js";
import emailjs from 'https://cdn.jsdelivr.net/npm/@emailjs/browser@3/+esm';

// EmailJS Configuration
const EMAILJS_CONFIG = {
  publicKey: "YMWFdmAnmK9ekvBiZ",
  serviceId: "service_4xl7ipv",
  templateId: "template_tllv9th"
};

// Initialize EmailJS
emailjs.init(EMAILJS_CONFIG.publicKey);

// OTP storage
let otpStore = {};
let currentEmail = '';
let countdownInterval = null;

export function initRegister() {
  const regBtn = document.getElementById("regBtn");
  const pass1El = document.getElementById("regPass");
  const pass2El = document.getElementById("regPass2");
  const matchText = document.getElementById("passMatchText");

  const updatePassMatch = () => {
    if (!matchText) return;
    const p1 = pass1El ? pass1El.value : "";
    const p2 = pass2El ? pass2El.value : "";

    matchText.classList.remove("ok", "bad");

    if (!p1 && !p2) {
      matchText.textContent = "";
      return;
    }
    if (!p2) {
      matchText.textContent = "";
      return;
    }

    if (p1 === p2) {
      matchText.textContent = "Passwords match";
      matchText.classList.add("ok");
    } else {
      matchText.textContent = "Passwords do not match";
      matchText.classList.add("bad");
    }
  };

  if (pass1El) pass1El.addEventListener("input", updatePassMatch);
  if (pass2El) pass2El.addEventListener("input", updatePassMatch);

  regBtn.addEventListener("click", async () => {
    const email = document.getElementById("regEmail").value;
    const pass = document.getElementById("regPass").value;
    const pass2 = document.getElementById("regPass2").value;

    // Validation
    if (!email || !pass || !pass2) {
      showMessage("registerMessage", "Please fill in all fields", "error");
      return;
    }

    if (!email.includes('@')) {
      showMessage("registerMessage", "Please enter a valid email address.", "error");
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

    // Disable button
    regBtn.disabled = true;
    regBtn.innerHTML = '<span class="otp-loading"></span>Creating account...';

    try {
      // Step 1: Create Firebase account
      await register(email, pass);
      
      // Step 2: Send OTP
      await sendOTP(email);
      
      // Step 3: Show OTP modal
      showMessage("registerMessage", "Account created! Check your email for verification code.", "success");
      setTimeout(() => showOTPModal(email), 1000);
      
    } catch (error) {
      console.error('Registration error:', error);
      
      const errorMessages = {
        'auth/email-already-in-use': 'This email is already registered. Please log in instead.',
        'auth/invalid-email': 'The email address is not valid.',
        'auth/weak-password': 'Your password is too weak. Please use at least 8 characters.',
        'auth/network-request-failed': 'Network error. Please check your connection and try again.',
      };
      
      const message = errorMessages[error.code] || 'Registration failed. Please try again.';
      showMessage("registerMessage", message, "error");
      
    } finally {
      regBtn.disabled = false;
      regBtn.textContent = 'Create Account';
    }
  });
  
  // Initialize OTP modal handlers
  initOTPModal();
}

/**
 * Generate 6-digit OTP
 */
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Send OTP via EmailJS
 */
async function sendOTP(email) {
  try {
    const otpCode = generateOTP();
    const expiryTime = Date.now() + 10 * 60 * 1000; // 10 minutes
    
    // Store OTP
    otpStore[email] = {
      code: otpCode,
      expiry: expiryTime,
      attempts: 0,
      resendCount: 0
    };
    
    // Send email
    const templateParams = {
      to_email: email,
      to_name: email.split('@')[0],
      otp_code: otpCode,
      app_name: "Auth System",
      expiry_minutes: "10"
    };
    
    await emailjs.send(
      EMAILJS_CONFIG.serviceId,
      EMAILJS_CONFIG.templateId,
      templateParams
    );
    
    console.log('OTP sent successfully');
    
  } catch (error) {
    console.error('Error sending OTP:', error);
    throw new Error('Failed to send verification code. Please try again.');
  }
}

/**
 * Verify OTP
 */
function verifyOTP(email, code) {
  const storedOTP = otpStore[email];
  
  if (!storedOTP) {
    return {
      success: false,
      message: 'No verification code found. Please request a new code.'
    };
  }
  
  if (Date.now() > storedOTP.expiry) {
    delete otpStore[email];
    return {
      success: false,
      message: 'Verification code has expired. Please request a new code.'
    };
  }
  
  if (storedOTP.attempts >= 3) {
    delete otpStore[email];
    return {
      success: false,
      message: 'Too many incorrect attempts. Please request a new code.'
    };
  }
  
  if (storedOTP.code === code.trim()) {
    delete otpStore[email];
    return {
      success: true,
      message: 'Email verified successfully!'
    };
  } else {
    storedOTP.attempts++;
    const attemptsLeft = 3 - storedOTP.attempts;
    return {
      success: false,
      message: `Incorrect code. ${attemptsLeft} attempt${attemptsLeft !== 1 ? 's' : ''} remaining.`
    };
  }
}

/**
 * Show OTP Modal
 */
function showOTPModal(email) {
  currentEmail = email;
  const modal = document.getElementById('otpModal');
  const emailDisplay = document.getElementById('otpEmailDisplay');
  
  emailDisplay.textContent = email;
  clearOTPInputs();
  modal.classList.add('show');
  document.getElementById('otp1').focus();
  
  startCountdown(email);
  initOTPInputs();
}

/**
 * Hide OTP Modal
 */
function hideOTPModal() {
  const modal = document.getElementById('otpModal');
  modal.classList.remove('show');
  
  if (countdownInterval) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }
  
  clearOTPInputs();
  currentEmail = '';
}

/**
 * Initialize OTP input handlers
 */
function initOTPInputs() {
  const inputs = document.querySelectorAll('.otp-input');
  
  inputs.forEach((input, index) => {
    input.addEventListener('input', (e) => {
      const value = e.target.value;
      
      if (!/^\d*$/.test(value)) {
        e.target.value = '';
        return;
      }
      
      if (value) {
        e.target.classList.add('filled');
        if (index < inputs.length - 1) {
          inputs[index + 1].focus();
        }
        
        // Auto-verify when last digit entered
        if (index === inputs.length - 1) {
          setTimeout(() => verifyCode(), 300);
        }
      } else {
        e.target.classList.remove('filled');
      }
    });
    
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !e.target.value && index > 0) {
        inputs[index - 1].focus();
      }
    });
    
    input.addEventListener('paste', (e) => {
      e.preventDefault();
      const pastedData = e.clipboardData.getData('text').trim();
      
      if (/^\d{6}$/.test(pastedData)) {
        pastedData.split('').forEach((char, i) => {
          if (inputs[i]) {
            inputs[i].value = char;
            inputs[i].classList.add('filled');
          }
        });
        setTimeout(() => verifyCode(), 300);
      }
    });
  });
}

/**
 * Get OTP code from inputs
 */
function getOTPCode() {
  const inputs = document.querySelectorAll('.otp-input');
  return Array.from(inputs).map(input => input.value).join('');
}

/**
 * Clear OTP inputs
 */
function clearOTPInputs() {
  const inputs = document.querySelectorAll('.otp-input');
  inputs.forEach(input => {
    input.value = '';
    input.classList.remove('filled', 'error');
  });
  
  const message = document.getElementById('otpMessage');
  message.classList.remove('show');
}

/**
 * Show error animation
 */
function showInputError() {
  const inputs = document.querySelectorAll('.otp-input');
  inputs.forEach(input => input.classList.add('error'));
  
  setTimeout(() => {
    inputs.forEach(input => input.classList.remove('error'));
  }, 500);
}

/**
 * Verify entered code
 */
async function verifyCode() {
  const code = getOTPCode();
  
  if (code.length !== 6) {
    showMessage('otpMessage', 'Please enter all 6 digits', 'error');
    return;
  }
  
  const verifyBtn = document.getElementById('verifyOtpBtn');
  verifyBtn.disabled = true;
  verifyBtn.innerHTML = '<span class="otp-loading"></span>Verifying...';
  
  try {
    const result = verifyOTP(currentEmail, code);
    
    if (result.success) {
      showMessage('otpMessage', result.message, 'success');
      
      setTimeout(() => {
        hideOTPModal();
        
        // Switch to login tab
        const loginTab = document.querySelector('[data-tab="login"]');
        if (loginTab) loginTab.click();
        
        showMessage('loginMessage', 'Account created successfully! Please log in.', 'success');
      }, 1500);
      
    } else {
      showMessage('otpMessage', result.message, 'error');
      showInputError();
      clearOTPInputs();
      document.getElementById('otp1').focus();
    }
    
  } catch (error) {
    showMessage('otpMessage', error.message, 'error');
    showInputError();
  } finally {
    verifyBtn.disabled = false;
    verifyBtn.textContent = 'Verify Code';
  }
}

/**
 * Start countdown timer
 */
function startCountdown(email) {
  const countdownElement = document.getElementById('otpCountdown');
  const timerContainer = document.querySelector('.otp-timer');
  
  const updateTimer = () => {
    const storedOTP = otpStore[email];
    if (!storedOTP) return;
    
    const remaining = storedOTP.expiry - Date.now();
    
    if (remaining <= 0) {
      clearInterval(countdownInterval);
      countdownElement.textContent = 'Expired';
      timerContainer.classList.add('expired');
      showMessage('otpMessage', 'Code has expired. Please request a new code.', 'error');
      return;
    }
    
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    
    countdownElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };
  
  updateTimer();
  countdownInterval = setInterval(updateTimer, 1000);
}

/**
 * Resend OTP
 */
async function handleResendOTP() {
  const resendBtn = document.getElementById('resendOtpBtn');
  const cooldownText = document.getElementById('resendCooldown');
  
  const storedOTP = otpStore[currentEmail];
  if (storedOTP && storedOTP.resendCount >= 3) {
    showMessage('otpMessage', 'Maximum resend attempts reached. Please try again later.', 'error');
    return;
  }
  
  resendBtn.disabled = true;
  resendBtn.textContent = 'Sending...';
  
  try {
    await sendOTP(currentEmail);
    
    if (storedOTP) {
      storedOTP.resendCount++;
    }
    
    showMessage('otpMessage', 'New code sent! Check your email.', 'success');
    clearOTPInputs();
    document.getElementById('otp1').focus();
    
    if (countdownInterval) {
      clearInterval(countdownInterval);
    }
    const timerContainer = document.querySelector('.otp-timer');
    timerContainer.classList.remove('expired');
    startCountdown(currentEmail);
    
    // Cooldown
    let cooldownSeconds = 30;
    cooldownText.textContent = `Please wait ${cooldownSeconds}s before resending`;
    
    const cooldownInterval = setInterval(() => {
      cooldownSeconds--;
      if (cooldownSeconds <= 0) {
        clearInterval(cooldownInterval);
        cooldownText.textContent = '';
        resendBtn.disabled = false;
        resendBtn.textContent = 'Resend Code';
      } else {
        cooldownText.textContent = `Please wait ${cooldownSeconds}s before resending`;
      }
    }, 1000);
    
  } catch (error) {
    showMessage('otpMessage', error.message, 'error');
    resendBtn.disabled = false;
    resendBtn.textContent = 'Resend Code';
  }
}

/**
 * Initialize OTP modal
 */
function initOTPModal() {
  document.getElementById('otpModalClose').addEventListener('click', () => {
    if (confirm('Are you sure you want to cancel verification?')) {
      hideOTPModal();
    }
  });
  
  document.getElementById('verifyOtpBtn').addEventListener('click', verifyCode);
  document.getElementById('resendOtpBtn').addEventListener('click', handleResendOTP);
  
  document.getElementById('otpModal').addEventListener('click', (e) => {
    if (e.target.id === 'otpModal') {
      if (confirm('Are you sure you want to cancel verification?')) {
        hideOTPModal();
      }
    }
  });
}