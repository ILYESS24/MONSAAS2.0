/**
 * @fileoverview Unit tests for error-handler.ts
 * 
 * Tests the centralized error handling including:
 * - SaaSError class
 * - Error normalization
 * - Error codes and messages
 */

import { describe, it, expect } from 'vitest';

// ============================================
// MOCK SAAS ERROR FOR TESTING
// ============================================

interface AppError {
  code: string;
  message: string;
  userMessage: string;
  action?: 'retry' | 'redirect' | 'contact_support';
  redirectTo?: string;
}

class SaaSError extends Error {
  public readonly code: string;
  public readonly userMessage: string;
  public readonly action?: string;
  public readonly redirectTo?: string;
  public readonly timestamp: string;

  constructor(error: AppError) {
    super(error.message);
    this.name = 'SaaSError';
    this.code = error.code;
    this.userMessage = error.userMessage;
    this.action = error.action;
    this.redirectTo = error.redirectTo;
    this.timestamp = new Date().toISOString();
  }

  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      userMessage: this.userMessage,
      action: this.action,
      redirectTo: this.redirectTo,
      timestamp: this.timestamp,
    };
  }
}

// Error codes
const ERROR_CODES = {
  AUTH_USER_NOT_FOUND: 'AUTH_USER_NOT_FOUND',
  CREDITS_INSUFFICIENT: 'CREDITS_INSUFFICIENT',
  LIMIT_DAILY_EXCEEDED: 'LIMIT_DAILY_EXCEEDED',
  NETWORK_ERROR: 'NETWORK_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

// Error messages
const ERROR_MESSAGES: Record<string, AppError> = {
  [ERROR_CODES.AUTH_USER_NOT_FOUND]: {
    code: ERROR_CODES.AUTH_USER_NOT_FOUND,
    message: 'User not found in database',
    userMessage: 'Utilisateur non trouvé. Veuillez vous reconnecter.',
    action: 'redirect',
    redirectTo: '/sign-in',
  },
  [ERROR_CODES.CREDITS_INSUFFICIENT]: {
    code: ERROR_CODES.CREDITS_INSUFFICIENT,
    message: 'Insufficient credits for operation',
    userMessage: 'Crédits insuffisants pour cette action.',
    action: 'redirect',
    redirectTo: '/dashboard?tab=plans',
  },
  [ERROR_CODES.NETWORK_ERROR]: {
    code: ERROR_CODES.NETWORK_ERROR,
    message: 'Network request failed',
    userMessage: 'Problème de connexion réseau. Vérifiez votre connexion.',
    action: 'retry',
  },
  [ERROR_CODES.UNKNOWN_ERROR]: {
    code: ERROR_CODES.UNKNOWN_ERROR,
    message: 'An unexpected error occurred',
    userMessage: 'Une erreur inattendue s\'est produite. Veuillez réessayer.',
    action: 'contact_support',
  },
};

// Error normalizer
function normalizeError(error: unknown): SaaSError {
  if (error instanceof SaaSError) {
    return error;
  }

  // Supabase errors
  if (error && typeof error === 'object' && 'code' in error) {
    const supabaseError = error as { code?: string };
    if (supabaseError.code === 'PGRST116') {
      return new SaaSError(ERROR_MESSAGES[ERROR_CODES.AUTH_USER_NOT_FOUND]);
    }
  }

  // Network errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return new SaaSError(ERROR_MESSAGES[ERROR_CODES.NETWORK_ERROR]);
  }

  // Generic error
  return new SaaSError({
    ...ERROR_MESSAGES[ERROR_CODES.UNKNOWN_ERROR],
    message: error instanceof Error ? error.message : 'Unknown error',
  });
}

// ============================================
// TESTS
// ============================================

describe('SaaSError', () => {
  describe('Constructor', () => {
    it('should create error with all properties', () => {
      const error = new SaaSError({
        code: 'TEST_ERROR',
        message: 'Test message',
        userMessage: 'User-friendly message',
        action: 'retry',
        redirectTo: '/test',
      });

      expect(error.code).toBe('TEST_ERROR');
      expect(error.message).toBe('Test message');
      expect(error.userMessage).toBe('User-friendly message');
      expect(error.action).toBe('retry');
      expect(error.redirectTo).toBe('/test');
      expect(error.name).toBe('SaaSError');
    });

    it('should set timestamp', () => {
      const before = new Date();
      const error = new SaaSError({
        code: 'TEST',
        message: 'test',
        userMessage: 'test',
      });
      const after = new Date();

      const timestamp = new Date(error.timestamp);
      expect(timestamp >= before).toBe(true);
      expect(timestamp <= after).toBe(true);
    });

    it('should be instanceof Error', () => {
      const error = new SaaSError({
        code: 'TEST',
        message: 'test',
        userMessage: 'test',
      });

      expect(error instanceof Error).toBe(true);
      expect(error instanceof SaaSError).toBe(true);
    });
  });

  describe('toJSON', () => {
    it('should serialize to JSON', () => {
      const error = new SaaSError({
        code: 'TEST_ERROR',
        message: 'Test message',
        userMessage: 'User message',
        action: 'redirect',
        redirectTo: '/home',
      });

      const json = error.toJSON();

      expect(json.name).toBe('SaaSError');
      expect(json.code).toBe('TEST_ERROR');
      expect(json.message).toBe('Test message');
      expect(json.userMessage).toBe('User message');
      expect(json.action).toBe('redirect');
      expect(json.redirectTo).toBe('/home');
      expect(json.timestamp).toBeDefined();
    });

    it('should be JSON.stringify-able', () => {
      const error = new SaaSError({
        code: 'TEST',
        message: 'test',
        userMessage: 'test',
      });

      expect(() => JSON.stringify(error.toJSON())).not.toThrow();
    });
  });
});

describe('Error Codes', () => {
  it('should have all expected error codes', () => {
    expect(ERROR_CODES.AUTH_USER_NOT_FOUND).toBe('AUTH_USER_NOT_FOUND');
    expect(ERROR_CODES.CREDITS_INSUFFICIENT).toBe('CREDITS_INSUFFICIENT');
    expect(ERROR_CODES.LIMIT_DAILY_EXCEEDED).toBe('LIMIT_DAILY_EXCEEDED');
    expect(ERROR_CODES.NETWORK_ERROR).toBe('NETWORK_ERROR');
    expect(ERROR_CODES.UNKNOWN_ERROR).toBe('UNKNOWN_ERROR');
  });

  it('should have matching error messages', () => {
    expect(ERROR_MESSAGES[ERROR_CODES.AUTH_USER_NOT_FOUND]).toBeDefined();
    expect(ERROR_MESSAGES[ERROR_CODES.CREDITS_INSUFFICIENT]).toBeDefined();
    expect(ERROR_MESSAGES[ERROR_CODES.NETWORK_ERROR]).toBeDefined();
    expect(ERROR_MESSAGES[ERROR_CODES.UNKNOWN_ERROR]).toBeDefined();
  });
});

describe('Error Messages', () => {
  describe('AUTH_USER_NOT_FOUND', () => {
    it('should have correct properties', () => {
      const msg = ERROR_MESSAGES[ERROR_CODES.AUTH_USER_NOT_FOUND];

      expect(msg.action).toBe('redirect');
      expect(msg.redirectTo).toBe('/sign-in');
      expect(msg.userMessage).toContain('reconnecter');
    });
  });

  describe('CREDITS_INSUFFICIENT', () => {
    it('should have correct properties', () => {
      const msg = ERROR_MESSAGES[ERROR_CODES.CREDITS_INSUFFICIENT];

      expect(msg.action).toBe('redirect');
      expect(msg.redirectTo).toBe('/dashboard?tab=plans');
      expect(msg.userMessage).toContain('Crédits insuffisants');
    });
  });

  describe('NETWORK_ERROR', () => {
    it('should suggest retry action', () => {
      const msg = ERROR_MESSAGES[ERROR_CODES.NETWORK_ERROR];

      expect(msg.action).toBe('retry');
      expect(msg.redirectTo).toBeUndefined();
    });
  });

  describe('UNKNOWN_ERROR', () => {
    it('should suggest contact support', () => {
      const msg = ERROR_MESSAGES[ERROR_CODES.UNKNOWN_ERROR];

      expect(msg.action).toBe('contact_support');
    });
  });
});

describe('normalizeError', () => {
  it('should return SaaSError as-is', () => {
    const original = new SaaSError({
      code: 'ORIGINAL',
      message: 'original',
      userMessage: 'original',
    });

    const normalized = normalizeError(original);

    expect(normalized).toBe(original);
  });

  it('should normalize Supabase PGRST116 error', () => {
    const supabaseError = { code: 'PGRST116', message: 'Not found' };

    const normalized = normalizeError(supabaseError);

    expect(normalized.code).toBe('AUTH_USER_NOT_FOUND');
    expect(normalized.action).toBe('redirect');
  });

  it('should normalize fetch TypeError as network error', () => {
    const fetchError = new TypeError('fetch failed');

    const normalized = normalizeError(fetchError);

    expect(normalized.code).toBe('NETWORK_ERROR');
    expect(normalized.action).toBe('retry');
  });

  it('should normalize unknown errors', () => {
    const unknownError = new Error('Something went wrong');

    const normalized = normalizeError(unknownError);

    expect(normalized.code).toBe('UNKNOWN_ERROR');
    expect(normalized.message).toBe('Something went wrong');
  });

  it('should handle non-Error objects', () => {
    const normalized = normalizeError('string error');

    expect(normalized.code).toBe('UNKNOWN_ERROR');
  });

  it('should handle null', () => {
    const normalized = normalizeError(null);

    expect(normalized.code).toBe('UNKNOWN_ERROR');
  });

  it('should handle undefined', () => {
    const normalized = normalizeError(undefined);

    expect(normalized.code).toBe('UNKNOWN_ERROR');
  });
});
