/**
 * Environment Configuration Tests
 * 
 * Tests for environment validation and configuration.
 */

import { describe, it, expect } from 'vitest';
import {
  getEnvConfig,
  validateEnv,
  isAuthConfigured,
  getClerkPublishableKey,
  logEnvInfo,
  ALLOWED_IFRAME_ORIGINS,
} from '@/lib/env';

describe('Environment Configuration', () => {
  // ===========================================================================
  // GET ENV CONFIG
  // ===========================================================================
  describe('getEnvConfig', () => {
    it('should be a function', () => {
      expect(typeof getEnvConfig).toBe('function');
    });

    it('should return an object with required properties', () => {
      const config = getEnvConfig();
      expect(config).toHaveProperty('CLERK_PUBLISHABLE_KEY');
      expect(config).toHaveProperty('BASE_URL');
      expect(config).toHaveProperty('NODE_ENV');
      expect(config).toHaveProperty('IS_DEVELOPMENT');
      expect(config).toHaveProperty('IS_PRODUCTION');
    });

    it('should return boolean for IS_DEVELOPMENT', () => {
      const config = getEnvConfig();
      expect(typeof config.IS_DEVELOPMENT).toBe('boolean');
    });

    it('should return boolean for IS_PRODUCTION', () => {
      const config = getEnvConfig();
      expect(typeof config.IS_PRODUCTION).toBe('boolean');
    });
  });

  // ===========================================================================
  // VALIDATE ENV
  // ===========================================================================
  describe('validateEnv', () => {
    it('should be a function', () => {
      expect(typeof validateEnv).toBe('function');
    });

    it('should return validation result object', () => {
      const result = validateEnv();
      expect(result).toHaveProperty('isValid');
      expect(result).toHaveProperty('errors');
    });

    it('should return boolean for isValid', () => {
      const result = validateEnv();
      expect(typeof result.isValid).toBe('boolean');
    });

    it('should return array for errors', () => {
      const result = validateEnv();
      expect(Array.isArray(result.errors)).toBe(true);
    });
  });

  // ===========================================================================
  // IS AUTH CONFIGURED
  // ===========================================================================
  describe('isAuthConfigured', () => {
    it('should be a function', () => {
      expect(typeof isAuthConfigured).toBe('function');
    });

    it('should return a boolean', () => {
      const result = isAuthConfigured();
      expect(typeof result).toBe('boolean');
    });
  });

  // ===========================================================================
  // GET CLERK PUBLISHABLE KEY
  // ===========================================================================
  describe('getClerkPublishableKey', () => {
    it('should be a function', () => {
      expect(typeof getClerkPublishableKey).toBe('function');
    });

    it('should return string or undefined', () => {
      const result = getClerkPublishableKey();
      expect(result === undefined || typeof result === 'string').toBe(true);
    });
  });

  // ===========================================================================
  // LOG ENV INFO
  // ===========================================================================
  describe('logEnvInfo', () => {
    it('should be a function', () => {
      expect(typeof logEnvInfo).toBe('function');
    });

    it('should not throw when called', () => {
      expect(() => logEnvInfo()).not.toThrow();
    });
  });

  // ===========================================================================
  // ALLOWED IFRAME ORIGINS
  // ===========================================================================
  describe('ALLOWED_IFRAME_ORIGINS', () => {
    it('should be an array', () => {
      expect(Array.isArray(ALLOWED_IFRAME_ORIGINS)).toBe(true);
    });

    it('should contain only https URLs', () => {
      ALLOWED_IFRAME_ORIGINS.forEach(origin => {
        expect(origin.startsWith('https://')).toBe(true);
      });
    });

    it('should not be empty', () => {
      expect(ALLOWED_IFRAME_ORIGINS.length).toBeGreaterThan(0);
    });
  });
});
