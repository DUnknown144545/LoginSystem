// otp/otpService.js
import emailjs from 'https://cdn.jsdelivr.net/npm/@emailjs/browser@3/+esm';

const EMAILJS_CONFIG = {
  publicKey: "YMWFdmAnmK9ekvBiZ",
  serviceId: "service_4xl7ipv",
  templateId: "template_tllv9th"
};

// Initialize EmailJS
emailjs.init(EMAILJS_CONFIG.publicKey);

// OTP storage (in-memory, resets on page refresh)
let otpStore = {};

/**
 * Generate a 6-digit OTP code
 */
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Send OTP via email
 */
export async function sendOTP(email, userName = "User") {
  try {
    // Generate OTP
    const otpCode = generateOTP();
    const expiryTime = Date.now() + 10 * 60 * 1000; // 10 minutes
    
    // Store OTP with expiry
    otpStore[email] = {
      code: otpCode,
      expiry: expiryTime,
      attempts: 0,
      resendCount: 0
    };
    
    // Send email via EmailJS
    const templateParams = {
      to_email: email,
      to_name: userName,
      otp_code: otpCode,
      app_name: "Auth System",
      expiry_minutes: "10"
    };
    
    await emailjs.send(
      EMAILJS_CONFIG.serviceId,
      EMAILJS_CONFIG.templateId,
      templateParams
    );
    
    console.log('OTP sent successfully to:', email);
    return { success: true, expiryTime };
    
  } catch (error) {
    console.error('Error sending OTP:', error);
    throw new Error('Failed to send verification code. Please try again.');
  }
}

/**
 * Verify OTP code
 */
export function verifyOTP(email, code) {
  const storedOTP = otpStore[email];
  
  if (!storedOTP) {
    return {
      success: false,
      message: 'No verification code found. Please request a new code.'
    };
  }
  
  // Check if OTP has expired
  if (Date.now() > storedOTP.expiry) {
    delete otpStore[email];
    return {
      success: false,
      message: 'Verification code has expired. Please request a new code.'
    };
  }
  
  // Check attempts
  if (storedOTP.attempts >= 3) {
    delete otpStore[email];
    return {
      success: false,
      message: 'Too many incorrect attempts. Please request a new code.'
    };
  }
  
  // Verify code
  if (storedOTP.code === code.trim()) {
    delete otpStore[email]; // Clear OTP after successful verification
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
 * Resend OTP
 */
export async function resendOTP(email) {
  const storedOTP = otpStore[email];
  
  if (storedOTP && storedOTP.resendCount >= 3) {
    throw new Error('Maximum resend attempts reached. Please try again later.');
  }
  
  if (storedOTP) {
    storedOTP.resendCount++;
  }
  
  return await sendOTP(email);
}

/**
 * Get remaining time for OTP
 */
export function getOTPRemainingTime(email) {
  const storedOTP = otpStore[email];
  
  if (!storedOTP) {
    return 0;
  }
  
  const remaining = storedOTP.expiry - Date.now();
  return remaining > 0 ? remaining : 0;
}

/**
 * Clear OTP data
 */
export function clearOTP(email) {
  delete otpStore[email];
}