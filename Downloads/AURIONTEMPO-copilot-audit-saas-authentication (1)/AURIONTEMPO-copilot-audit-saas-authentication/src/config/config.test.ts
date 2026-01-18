/**
 * Configuration Tests
 * 
 * Tests for app configuration, feature flags, and constants.
 */

import { describe, it, expect } from 'vitest';
import {
  APP_CONFIG,
  API_CONFIG,
  FEATURES,
  AUTH_CONFIG,
  DASHBOARD_CONFIG,
  SECURITY_CONFIG,
} from '@/config';
import {
  ROUTES,
  STORAGE_KEYS,
  ANALYTICS_EVENTS,
  BREAKPOINTS,
} from '@/constants';

describe('Configuration', () => {
  // ===========================================================================
  // APP CONFIG
  // ===========================================================================
  describe('APP_CONFIG', () => {
    it('should have app name', () => {
      expect(APP_CONFIG).toHaveProperty('name');
      expect(typeof APP_CONFIG.name).toBe('string');
    });

    it('should have app version', () => {
      expect(APP_CONFIG).toHaveProperty('version');
      expect(typeof APP_CONFIG.version).toBe('string');
    });

    it('should have app description', () => {
      expect(APP_CONFIG).toHaveProperty('description');
      expect(typeof APP_CONFIG.description).toBe('string');
    });
  });

  // ===========================================================================
  // API CONFIG
  // ===========================================================================
  describe('API_CONFIG', () => {
    it('should have BASE_URL', () => {
      expect(API_CONFIG).toHaveProperty('BASE_URL');
    });

    it('should have TIMEOUT', () => {
      expect(API_CONFIG).toHaveProperty('TIMEOUT');
      expect(typeof API_CONFIG.TIMEOUT).toBe('number');
    });

    it('should have RETRY_ATTEMPTS', () => {
      expect(API_CONFIG).toHaveProperty('RETRY_ATTEMPTS');
      expect(typeof API_CONFIG.RETRY_ATTEMPTS).toBe('number');
    });

    it('should have RETRY_DELAY', () => {
      expect(API_CONFIG).toHaveProperty('RETRY_DELAY');
      expect(typeof API_CONFIG.RETRY_DELAY).toBe('number');
    });
  });

  // ===========================================================================
  // FEATURES
  // ===========================================================================
  describe('FEATURES', () => {
    it('should have ANALYTICS_ENABLED flag', () => {
      expect(FEATURES).toHaveProperty('ANALYTICS_ENABLED');
      expect(typeof FEATURES.ANALYTICS_ENABLED).toBe('boolean');
    });

    it('should have ERROR_REPORTING_ENABLED flag', () => {
      expect(FEATURES).toHaveProperty('ERROR_REPORTING_ENABLED');
      expect(typeof FEATURES.ERROR_REPORTING_ENABLED).toBe('boolean');
    });

    it('should have DEMO_MODE_ENABLED flag', () => {
      expect(FEATURES).toHaveProperty('DEMO_MODE_ENABLED');
      expect(typeof FEATURES.DEMO_MODE_ENABLED).toBe('boolean');
    });
  });

  // ===========================================================================
  // AUTH CONFIG
  // ===========================================================================
  describe('AUTH_CONFIG', () => {
    it('should have SIGN_IN_PATH', () => {
      expect(AUTH_CONFIG).toHaveProperty('SIGN_IN_PATH');
      expect(AUTH_CONFIG.SIGN_IN_PATH).toContain('sign');
    });

    it('should have SIGN_UP_PATH', () => {
      expect(AUTH_CONFIG).toHaveProperty('SIGN_UP_PATH');
      expect(AUTH_CONFIG.SIGN_UP_PATH).toContain('sign');
    });

    it('should have AFTER_SIGN_IN_PATH', () => {
      expect(AUTH_CONFIG).toHaveProperty('AFTER_SIGN_IN_PATH');
    });
  });

  // ===========================================================================
  // DASHBOARD CONFIG
  // ===========================================================================
  describe('DASHBOARD_CONFIG', () => {
    it('should have STATS_REFRESH_INTERVAL', () => {
      expect(DASHBOARD_CONFIG).toHaveProperty('STATS_REFRESH_INTERVAL');
      expect(typeof DASHBOARD_CONFIG.STATS_REFRESH_INTERVAL).toBe('number');
    });

    it('should have ACTIVITY_REFRESH_INTERVAL', () => {
      expect(DASHBOARD_CONFIG).toHaveProperty('ACTIVITY_REFRESH_INTERVAL');
      expect(typeof DASHBOARD_CONFIG.ACTIVITY_REFRESH_INTERVAL).toBe('number');
    });
  });

  // ===========================================================================
  // SECURITY CONFIG
  // ===========================================================================
  describe('SECURITY_CONFIG', () => {
    it('should have SESSION_TIMEOUT', () => {
      expect(SECURITY_CONFIG).toHaveProperty('SESSION_TIMEOUT');
      expect(typeof SECURITY_CONFIG.SESSION_TIMEOUT).toBe('number');
    });

    it('should have MAX_LOGIN_ATTEMPTS', () => {
      expect(SECURITY_CONFIG).toHaveProperty('MAX_LOGIN_ATTEMPTS');
      expect(typeof SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS).toBe('number');
    });
  });
});

describe('Constants', () => {
  // ===========================================================================
  // ROUTES
  // ===========================================================================
  describe('ROUTES', () => {
    it('should have HOME route', () => {
      expect(ROUTES).toHaveProperty('HOME');
      expect(ROUTES.HOME).toBe('/');
    });

    it('should have DASHBOARD route', () => {
      expect(ROUTES).toHaveProperty('DASHBOARD');
      expect(ROUTES.DASHBOARD).toContain('dashboard');
    });

    it('should have SIGN_IN route', () => {
      expect(ROUTES).toHaveProperty('SIGN_IN');
      expect(ROUTES.SIGN_IN).toContain('sign');
    });

    it('should have all tool routes', () => {
      expect(ROUTES).toHaveProperty('AURION_CHAT');
      expect(ROUTES).toHaveProperty('CODE_EDITOR');
      expect(ROUTES).toHaveProperty('TEXT_EDITOR');
      expect(ROUTES).toHaveProperty('APP_BUILDER');
      expect(ROUTES).toHaveProperty('AGENT_AI');
      expect(ROUTES).toHaveProperty('INTELLIGENT_CANVAS');
    });
  });

  // ===========================================================================
  // STORAGE KEYS
  // ===========================================================================
  describe('STORAGE_KEYS', () => {
    it('should have THEME key', () => {
      expect(STORAGE_KEYS).toHaveProperty('THEME');
      expect(typeof STORAGE_KEYS.THEME).toBe('string');
    });

    it('should have USER_PREFERENCES key', () => {
      expect(STORAGE_KEYS).toHaveProperty('USER_PREFERENCES');
      expect(typeof STORAGE_KEYS.USER_PREFERENCES).toBe('string');
    });
  });

  // ===========================================================================
  // ANALYTICS EVENTS
  // ===========================================================================
  describe('ANALYTICS_EVENTS', () => {
    it('should have USER_SIGN_IN event', () => {
      expect(ANALYTICS_EVENTS).toHaveProperty('USER_SIGN_IN');
    });

    it('should have USER_SIGN_UP event', () => {
      expect(ANALYTICS_EVENTS).toHaveProperty('USER_SIGN_UP');
    });

    it('should have TOOL_OPENED event', () => {
      expect(ANALYTICS_EVENTS).toHaveProperty('TOOL_OPENED');
    });
  });

  // ===========================================================================
  // BREAKPOINTS
  // ===========================================================================
  describe('BREAKPOINTS', () => {
    it('should have responsive breakpoints', () => {
      expect(BREAKPOINTS).toHaveProperty('SM');
      expect(BREAKPOINTS).toHaveProperty('MD');
      expect(BREAKPOINTS).toHaveProperty('LG');
      expect(BREAKPOINTS).toHaveProperty('XL');
    });

    it('should have numeric values', () => {
      expect(typeof BREAKPOINTS.SM).toBe('number');
      expect(typeof BREAKPOINTS.MD).toBe('number');
      expect(typeof BREAKPOINTS.LG).toBe('number');
      expect(typeof BREAKPOINTS.XL).toBe('number');
    });

    it('should be in ascending order', () => {
      expect(BREAKPOINTS.SM).toBeLessThan(BREAKPOINTS.MD);
      expect(BREAKPOINTS.MD).toBeLessThan(BREAKPOINTS.LG);
      expect(BREAKPOINTS.LG).toBeLessThan(BREAKPOINTS.XL);
    });
  });
});
