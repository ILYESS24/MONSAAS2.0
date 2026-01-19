/**
 * Validation Library Tests
 * 
 * Comprehensive tests for all validation functions.
 */

import { describe, it, expect } from 'vitest';
import {
  validateEmail,
  validatePassword,
  validateUrl,
  validatePhone,
  validateRequired,
  validateMinLength,
  validateMaxLength,
  validateNumberRange,
  validateFutureDate,
  composeValidations,
  validateForm,
} from '@/lib/validation';

describe('Validation Library', () => {
  // ===========================================================================
  // EMAIL VALIDATION
  // ===========================================================================
  describe('validateEmail', () => {
    it('should accept valid email addresses', () => {
      expect(validateEmail('test@example.com').isValid).toBe(true);
      expect(validateEmail('user.name@domain.org').isValid).toBe(true);
      expect(validateEmail('user+tag@example.co.uk').isValid).toBe(true);
      expect(validateEmail('test123@test-domain.com').isValid).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(validateEmail('').isValid).toBe(false);
      expect(validateEmail('invalid').isValid).toBe(false);
      expect(validateEmail('invalid@').isValid).toBe(false);
      expect(validateEmail('@domain.com').isValid).toBe(false);
    });

    it('should return error message for invalid email', () => {
      expect(validateEmail('').error).toBeDefined();
      expect(validateEmail('invalid').error).toBeDefined();
    });
  });

  // ===========================================================================
  // PASSWORD VALIDATION
  // ===========================================================================
  describe('validatePassword', () => {
    it('should accept valid passwords', () => {
      expect(validatePassword('Password1').isValid).toBe(true);
      expect(validatePassword('Str0ngPass').isValid).toBe(true);
    });

    it('should reject passwords without uppercase', () => {
      expect(validatePassword('password1').isValid).toBe(false);
    });

    it('should reject passwords without lowercase', () => {
      expect(validatePassword('PASSWORD1').isValid).toBe(false);
    });

    it('should reject passwords without numbers', () => {
      expect(validatePassword('Password').isValid).toBe(false);
    });

    it('should reject passwords that are too short', () => {
      expect(validatePassword('Pa1').isValid).toBe(false);
    });

    it('should accept custom options', () => {
      const result = validatePassword('abc123', {
        minLength: 6,
        requireUppercase: false,
        requireLowercase: true,
        requireNumber: true,
      });
      expect(result.isValid).toBe(true);
    });

    it('should require special characters when specified', () => {
      const result = validatePassword('Password1', { requireSpecial: true });
      expect(result.isValid).toBe(false);
      
      const resultWithSpecial = validatePassword('Password1!', { requireSpecial: true });
      expect(resultWithSpecial.isValid).toBe(true);
    });
  });

  // ===========================================================================
  // URL VALIDATION
  // ===========================================================================
  describe('validateUrl', () => {
    it('should accept valid URLs', () => {
      expect(validateUrl('https://example.com').isValid).toBe(true);
      expect(validateUrl('http://example.com').isValid).toBe(true);
      expect(validateUrl('https://www.example.com/path').isValid).toBe(true);
      expect(validateUrl('https://example.com:8080/path?query=1').isValid).toBe(true);
    });

    it('should reject invalid URLs', () => {
      expect(validateUrl('').isValid).toBe(false);
      expect(validateUrl('invalid').isValid).toBe(false);
    });

    it('should return error message for invalid URL', () => {
      expect(validateUrl('').error).toBeDefined();
      expect(validateUrl('invalid').error).toBeDefined();
    });
  });

  // ===========================================================================
  // PHONE NUMBER VALIDATION
  // ===========================================================================
  describe('validatePhone', () => {
    it('should accept valid phone numbers', () => {
      expect(validatePhone('+1234567890123').isValid).toBe(true);
      expect(validatePhone('1234567890').isValid).toBe(true);
    });

    it('should reject invalid phone numbers', () => {
      expect(validatePhone('').isValid).toBe(false);
      expect(validatePhone('12345').isValid).toBe(false);
    });

    it('should return error message for invalid phone', () => {
      expect(validatePhone('').error).toBeDefined();
    });
  });

  // ===========================================================================
  // REQUIRED FIELD VALIDATION
  // ===========================================================================
  describe('validateRequired', () => {
    it('should return valid for non-empty values', () => {
      expect(validateRequired('hello', 'Field').isValid).toBe(true);
      expect(validateRequired(123, 'Field').isValid).toBe(true);
      expect(validateRequired(true, 'Field').isValid).toBe(true);
    });

    it('should return invalid for empty values', () => {
      expect(validateRequired('', 'Field').isValid).toBe(false);
      expect(validateRequired(null, 'Field').isValid).toBe(false);
      expect(validateRequired(undefined, 'Field').isValid).toBe(false);
    });

    it('should include field name in error message', () => {
      const result = validateRequired('', 'Username');
      expect(result.error).toContain('Username');
    });
  });

  // ===========================================================================
  // LENGTH VALIDATION
  // ===========================================================================
  describe('validateMinLength', () => {
    it('should return valid for strings meeting minimum length', () => {
      expect(validateMinLength('hello', 3, 'Field').isValid).toBe(true);
      expect(validateMinLength('hello', 5, 'Field').isValid).toBe(true);
    });

    it('should return invalid for strings below minimum length', () => {
      expect(validateMinLength('hi', 3, 'Field').isValid).toBe(false);
    });
  });

  describe('validateMaxLength', () => {
    it('should return valid for strings within maximum length', () => {
      expect(validateMaxLength('hi', 3, 'Field').isValid).toBe(true);
      expect(validateMaxLength('hey', 3, 'Field').isValid).toBe(true);
    });

    it('should return invalid for strings exceeding maximum length', () => {
      expect(validateMaxLength('hello', 3, 'Field').isValid).toBe(false);
    });
  });

  // ===========================================================================
  // NUMBER RANGE VALIDATION
  // ===========================================================================
  describe('validateNumberRange', () => {
    it('should return valid for values in range', () => {
      expect(validateNumberRange(5, 1, 10, 'Field').isValid).toBe(true);
      expect(validateNumberRange(1, 1, 10, 'Field').isValid).toBe(true);
      expect(validateNumberRange(10, 1, 10, 'Field').isValid).toBe(true);
    });

    it('should return invalid for values out of range', () => {
      expect(validateNumberRange(0, 1, 10, 'Field').isValid).toBe(false);
      expect(validateNumberRange(11, 1, 10, 'Field').isValid).toBe(false);
    });
  });

  // ===========================================================================
  // DATE VALIDATION
  // ===========================================================================
  describe('validateFutureDate', () => {
    it('should accept future dates', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      expect(validateFutureDate(futureDate, 'Field').isValid).toBe(true);
    });

    it('should reject past dates', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      expect(validateFutureDate(pastDate, 'Field').isValid).toBe(false);
    });
  });

  // ===========================================================================
  // COMPOSE VALIDATIONS
  // ===========================================================================
  describe('composeValidations', () => {
    it('should return valid when all validations pass', () => {
      const result = composeValidations(
        validateEmail('test@example.com'),
        validateRequired('value', 'Field')
      );
      expect(result.isValid).toBe(true);
    });

    it('should return first invalid result', () => {
      const result = composeValidations(
        validateEmail('invalid'),
        validateRequired('value', 'Field')
      );
      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  // ===========================================================================
  // FORM VALIDATION
  // ===========================================================================
  describe('validateForm', () => {
    it('should validate form with all passing validators', () => {
      const result = validateForm(
        { email: 'test@example.com', name: 'John' },
        {
          email: (value) => validateEmail(value as string),
          name: (value) => validateRequired(value, 'Name'),
        }
      );

      expect(result.isValid).toBe(true);
      expect(Object.keys(result.errors).length).toBe(0);
    });

    it('should return errors for failing validators', () => {
      const result = validateForm(
        { email: 'invalid', name: '' },
        {
          email: (value) => validateEmail(value as string),
          name: (value) => validateRequired(value, 'Name'),
        }
      );

      expect(result.isValid).toBe(false);
      expect(result.errors.email).toBeDefined();
      expect(result.errors.name).toBeDefined();
    });

    it('should preserve original values', () => {
      const values = { email: 'test@example.com' };
      const result = validateForm(values, {});
      expect(result.values).toBe(values);
    });
  });
});
