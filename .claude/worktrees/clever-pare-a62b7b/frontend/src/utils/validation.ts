/**
 * Comprehensive validation utilities for form inputs
 * Ensures data type safety and security across the application
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Password validation with strong security requirements
 * Requirements:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 * - No common passwords
 */
export const validatePassword = (password: string): ValidationResult => {
  if (!password) {
    return { isValid: false, error: 'Password is required' };
  }

  if (password.length < 8) {
    return { isValid: false, error: 'Password must be at least 8 characters long' };
  }

  if (password.length > 128) {
    return { isValid: false, error: 'Password must not exceed 128 characters' };
  }

  if (!/[A-Z]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one uppercase letter' };
  }

  if (!/[a-z]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one lowercase letter' };
  }

  if (!/[0-9]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one number' };
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one special character (!@#$%^&*()_+-=[]{};\':"|,.<>/?)' };
  }

  // Check for common weak passwords
  const commonPasswords = [
    'password', 'password123', '12345678', 'qwerty', 'abc123', 
    'monkey', '1234567890', 'letmein', 'trustno1', 'dragon',
    'baseball', 'iloveyou', 'master', 'sunshine', 'ashley',
    'bailey', 'passw0rd', 'shadow', '123123', '654321'
  ];

  if (commonPasswords.some(common => password.toLowerCase().includes(common))) {
    return { isValid: false, error: 'Password is too common. Please choose a stronger password' };
  }

  return { isValid: true };
};

/**
 * Get password strength level
 */
export const getPasswordStrength = (password: string): {
  level: 'weak' | 'medium' | 'strong' | 'very-strong';
  score: number;
  feedback: string;
} => {
  let score = 0;
  
  // Length score
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;
  
  // Character variety score
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 1;
  
  // Complexity score
  if (/[a-z].*[A-Z]|[A-Z].*[a-z]/.test(password)) score += 1;
  if (/\d.*[!@#$%^&*]|[!@#$%^&*].*\d/.test(password)) score += 1;
  
  if (score <= 3) {
    return { level: 'weak', score, feedback: 'Weak password. Add more variety.' };
  } else if (score <= 5) {
    return { level: 'medium', score, feedback: 'Medium strength. Consider adding more characters.' };
  } else if (score <= 7) {
    return { level: 'strong', score, feedback: 'Strong password!' };
  } else {
    return { level: 'very-strong', score, feedback: 'Very strong password!' };
  }
};

/**
 * Email validation with comprehensive checks
 */
export const validateEmail = (email: string): ValidationResult => {
  if (!email) {
    return { isValid: false, error: 'Email is required' };
  }

  // RFC 5322 compliant email regex (simplified)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }

  if (email.length > 254) {
    return { isValid: false, error: 'Email address is too long' };
  }

  // Check for disposable email domains
  const disposableDomains = ['tempmail.com', 'throwaway.email', '10minutemail.com', 'guerrillamail.com'];
  const domain = email.split('@')[1]?.toLowerCase();
  
  if (disposableDomains.some(d => domain?.includes(d))) {
    return { isValid: false, error: 'Please use a permanent email address' };
  }

  return { isValid: true };
};

/**
 * Phone number validation for Indian numbers
 */
export const validatePhoneNumber = (phone: string, countryCode: string = '+91'): ValidationResult => {
  if (!phone) {
    return { isValid: false, error: 'Phone number is required' };
  }

  // Remove spaces and dashes
  const cleanPhone = phone.replace(/[\s\-]/g, '');

  if (!/^\d+$/.test(cleanPhone)) {
    return { isValid: false, error: 'Phone number must contain only digits' };
  }

  if (countryCode === '+91') {
    // Indian phone number validation
    if (cleanPhone.length !== 10) {
      return { isValid: false, error: 'Indian phone number must be 10 digits' };
    }

    if (!/^[6-9]/.test(cleanPhone)) {
      return { isValid: false, error: 'Indian phone number must start with 6, 7, 8, or 9' };
    }
  } else {
    // Generic validation for other countries
    if (cleanPhone.length < 7 || cleanPhone.length > 15) {
      return { isValid: false, error: 'Phone number must be between 7 and 15 digits' };
    }
  }

  return { isValid: true };
};

/**
 * Number validation with range checks
 */
export const validateNumber = (
  value: string,
  options?: {
    min?: number;
    max?: number;
    allowDecimals?: boolean;
    allowNegative?: boolean;
  }
): ValidationResult => {
  if (!value) {
    return { isValid: false, error: 'This field is required' };
  }

  const { min, max, allowDecimals = false, allowNegative = false } = options || {};

  // Check if it's a valid number
  const numRegex = allowDecimals 
    ? /^-?\d+(\.\d+)?$/ 
    : /^-?\d+$/;

  if (!numRegex.test(value)) {
    return { 
      isValid: false, 
      error: allowDecimals 
        ? 'Please enter a valid number' 
        : 'Please enter a whole number only' 
    };
  }

  const numValue = parseFloat(value);

  if (!allowNegative && numValue < 0) {
    return { isValid: false, error: 'Negative numbers are not allowed' };
  }

  if (min !== undefined && numValue < min) {
    return { isValid: false, error: `Value must be at least ${min}` };
  }

  if (max !== undefined && numValue > max) {
    return { isValid: false, error: `Value must not exceed ${max}` };
  }

  return { isValid: true };
};

/**
 * Text validation with length and pattern checks
 */
export const validateText = (
  value: string,
  options?: {
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    patternError?: string;
    allowSpecialChars?: boolean;
  }
): ValidationResult => {
  if (!value || value.trim() === '') {
    return { isValid: false, error: 'This field is required' };
  }

  const { minLength, maxLength, pattern, patternError, allowSpecialChars = true } = options || {};

  if (minLength && value.length < minLength) {
    return { isValid: false, error: `Must be at least ${minLength} characters long` };
  }

  if (maxLength && value.length > maxLength) {
    return { isValid: false, error: `Must not exceed ${maxLength} characters` };
  }

  if (!allowSpecialChars && /[^a-zA-Z0-9\s]/.test(value)) {
    return { isValid: false, error: 'Special characters are not allowed' };
  }

  if (pattern && !pattern.test(value)) {
    return { isValid: false, error: patternError || 'Invalid format' };
  }

  return { isValid: true };
};

/**
 * URL validation
 */
export const validateURL = (url: string): ValidationResult => {
  if (!url) {
    return { isValid: false, error: 'URL is required' };
  }

  try {
    new URL(url);
    return { isValid: true };
  } catch {
    return { isValid: false, error: 'Please enter a valid URL' };
  }
};

/**
 * File validation
 */
export const validateFile = (
  file: File | null,
  options?: {
    maxSize?: number; // in bytes
    allowedTypes?: string[];
    required?: boolean;
  }
): ValidationResult => {
  const { maxSize = 5 * 1024 * 1024, allowedTypes = ['image/*'], required = false } = options || {};

  if (!file) {
    if (required) {
      return { isValid: false, error: 'File is required' };
    }
    return { isValid: true };
  }

  // Check file size
  if (file.size > maxSize) {
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1);
    return { isValid: false, error: `File size must not exceed ${maxSizeMB}MB` };
  }

  // Check file type
  const isAllowedType = allowedTypes.some(type => {
    if (type.endsWith('/*')) {
      const mainType = type.split('/')[0];
      return file.type.startsWith(mainType + '/');
    }
    return file.type === type;
  });

  if (!isAllowedType) {
    return { 
      isValid: false, 
      error: `File type not allowed. Accepted types: ${allowedTypes.join(', ')}` 
    };
  }

  return { isValid: true };
};

/**
 * Bar Council Number validation (Indian Bar Council)
 */
export const validateBarNumber = (barNumber: string): ValidationResult => {
  if (!barNumber) {
    return { isValid: false, error: 'Bar Council number is required' };
  }

  // Remove spaces and slashes
  const cleanBarNumber = barNumber.replace(/[\s\/\-]/g, '');

  // Bar council numbers typically have alphanumeric characters
  if (!/^[A-Z0-9]+$/i.test(cleanBarNumber)) {
    return { isValid: false, error: 'Bar Council number should contain only letters and numbers' };
  }

  if (cleanBarNumber.length < 5 || cleanBarNumber.length > 20) {
    return { isValid: false, error: 'Bar Council number should be between 5 and 20 characters' };
  }

  return { isValid: true };
};

/**
 * Experience years validation
 */
export const validateExperience = (experience: string): ValidationResult => {
  return validateNumber(experience, {
    min: 0,
    max: 70,
    allowDecimals: false,
    allowNegative: false
  });
};

/**
 * Consultation fee validation
 */
export const validateConsultationFee = (fee: string): ValidationResult => {
  return validateNumber(fee, {
    min: 0,
    max: 1000000,
    allowDecimals: true,
    allowNegative: false
  });
};

/**
 * Sanitize HTML input to prevent XSS
 */
export const sanitizeInput = (input: string): string => {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    "/": '&#x2F;',
  };
  const reg = /[&<>"'/]/ig;
  return input.replace(reg, (match) => map[match]);
};

/**
 * Validate Indian PAN card
 */
export const validatePAN = (pan: string): ValidationResult => {
  if (!pan) {
    return { isValid: false, error: 'PAN is required' };
  }

  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  
  if (!panRegex.test(pan.toUpperCase())) {
    return { isValid: false, error: 'Invalid PAN format. Format: ABCDE1234F' };
  }

  return { isValid: true };
};

/**
 * Validate Indian Aadhaar number
 */
export const validateAadhaar = (aadhaar: string): ValidationResult => {
  if (!aadhaar) {
    return { isValid: false, error: 'Aadhaar number is required' };
  }

  const cleanAadhaar = aadhaar.replace(/[\s\-]/g, '');

  if (!/^\d{12}$/.test(cleanAadhaar)) {
    return { isValid: false, error: 'Aadhaar must be 12 digits' };
  }

  return { isValid: true };
};

/**
 * Validate IFSC code
 */
export const validateIFSC = (ifsc: string): ValidationResult => {
  if (!ifsc) {
    return { isValid: false, error: 'IFSC code is required' };
  }

  const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
  
  if (!ifscRegex.test(ifsc.toUpperCase())) {
    return { isValid: false, error: 'Invalid IFSC format. Format: ABCD0123456' };
  }

  return { isValid: true };
};

/**
 * Validate Indian postal code (PIN)
 */
export const validatePinCode = (pin: string): ValidationResult => {
  if (!pin) {
    return { isValid: false, error: 'PIN code is required' };
  }

  if (!/^\d{6}$/.test(pin)) {
    return { isValid: false, error: 'PIN code must be 6 digits' };
  }

  return { isValid: true };
};
