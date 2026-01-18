/**
 * Validation Utilities
 * 
 * Provides validation functions for forms and data.
 */

// Validation result type
export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

// Email validation
export function validateEmail(email: string): ValidationResult {
  if (!email) {
    return { isValid: false, error: 'Email is required' };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Invalid email format' };
  }
  
  return { isValid: true };
}

// Password validation
export function validatePassword(password: string, options?: {
  minLength?: number;
  requireUppercase?: boolean;
  requireLowercase?: boolean;
  requireNumber?: boolean;
  requireSpecial?: boolean;
}): ValidationResult {
  const {
    minLength = 8,
    requireUppercase = true,
    requireLowercase = true,
    requireNumber = true,
    requireSpecial = false,
  } = options || {};

  if (!password) {
    return { isValid: false, error: 'Password is required' };
  }

  if (password.length < minLength) {
    return { isValid: false, error: `Password must be at least ${minLength} characters` };
  }

  if (requireUppercase && !/[A-Z]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one uppercase letter' };
  }

  if (requireLowercase && !/[a-z]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one lowercase letter' };
  }

  if (requireNumber && !/\d/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one number' };
  }

  if (requireSpecial && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one special character' };
  }

  return { isValid: true };
}

// Required field validation
export function validateRequired(value: unknown, fieldName: string): ValidationResult {
  if (value === undefined || value === null || value === '') {
    return { isValid: false, error: `${fieldName} is required` };
  }
  return { isValid: true };
}

// Min length validation
export function validateMinLength(value: string, minLength: number, fieldName: string): ValidationResult {
  if (value.length < minLength) {
    return { isValid: false, error: `${fieldName} must be at least ${minLength} characters` };
  }
  return { isValid: true };
}

// Max length validation
export function validateMaxLength(value: string, maxLength: number, fieldName: string): ValidationResult {
  if (value.length > maxLength) {
    return { isValid: false, error: `${fieldName} must be no more than ${maxLength} characters` };
  }
  return { isValid: true };
}

// URL validation
export function validateUrl(url: string): ValidationResult {
  if (!url) {
    return { isValid: false, error: 'URL is required' };
  }

  try {
    new URL(url);
    return { isValid: true };
  } catch {
    return { isValid: false, error: 'Invalid URL format' };
  }
}

// Phone validation (international format)
export function validatePhone(phone: string): ValidationResult {
  if (!phone) {
    return { isValid: false, error: 'Phone number is required' };
  }

  // Remove spaces, dashes, and parentheses for validation
  const cleaned = phone.replace(/[\s\-()]/g, '');
  
  // Check for valid phone format (allows + prefix for international)
  const phoneRegex = /^\+?[\d]{10,15}$/;
  if (!phoneRegex.test(cleaned)) {
    return { isValid: false, error: 'Invalid phone number format' };
  }

  return { isValid: true };
}

// Number range validation
export function validateNumberRange(
  value: number,
  min: number,
  max: number,
  fieldName: string
): ValidationResult {
  if (value < min) {
    return { isValid: false, error: `${fieldName} must be at least ${min}` };
  }
  if (value > max) {
    return { isValid: false, error: `${fieldName} must be no more than ${max}` };
  }
  return { isValid: true };
}

// Date validation (not in past)
export function validateFutureDate(date: Date, fieldName: string): ValidationResult {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  
  if (date < now) {
    return { isValid: false, error: `${fieldName} must be a future date` };
  }
  return { isValid: true };
}

// Compose multiple validations
export function composeValidations(
  ...validations: ValidationResult[]
): ValidationResult {
  for (const validation of validations) {
    if (!validation.isValid) {
      return validation;
    }
  }
  return { isValid: true };
}

// Form validation helper
export interface FormValidation<T extends Record<string, unknown>> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  isValid: boolean;
}

export function validateForm<T extends Record<string, unknown>>(
  values: T,
  validators: Partial<Record<keyof T, (value: unknown) => ValidationResult>>
): FormValidation<T> {
  const errors: Partial<Record<keyof T, string>> = {};
  let isValid = true;

  // Use typed keys iteration for type safety
  const validatorKeys = Object.keys(validators) as Array<keyof T>;
  
  for (const key of validatorKeys) {
    const validator = validators[key];
    if (validator) {
      const result = validator(values[key]);
      if (!result.isValid) {
        errors[key] = result.error;
        isValid = false;
      }
    }
  }

  return { values, errors, isValid };
}

export default {
  validateEmail,
  validatePassword,
  validateRequired,
  validateMinLength,
  validateMaxLength,
  validateUrl,
  validatePhone,
  validateNumberRange,
  validateFutureDate,
  composeValidations,
  validateForm,
};
