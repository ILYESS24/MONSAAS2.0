/**
 * Services Tests
 * 
 * Tests for API services and analytics service.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { analyticsService } from '@/services/analytics.service';

// Mock the logger
vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe('Services', () => {
  // ===========================================================================
  // ANALYTICS SERVICE
  // ===========================================================================
  describe('analyticsService', () => {
    it('should have identify method', () => {
      expect(typeof analyticsService.identify).toBe('function');
    });

    it('should have pageView method', () => {
      expect(typeof analyticsService.pageView).toBe('function');
    });

    it('should have track method', () => {
      expect(typeof analyticsService.track).toBe('function');
    });

    it('should have trackSignIn method', () => {
      expect(typeof analyticsService.trackSignIn).toBe('function');
    });

    it('should have trackSignUp method', () => {
      expect(typeof analyticsService.trackSignUp).toBe('function');
    });

    it('should have trackSignOut method', () => {
      expect(typeof analyticsService.trackSignOut).toBe('function');
    });

    it('should have trackToolOpened method', () => {
      expect(typeof analyticsService.trackToolOpened).toBe('function');
    });

    it('should have trackToolClosed method', () => {
      expect(typeof analyticsService.trackToolClosed).toBe('function');
    });

    it('should have trackQuickAction method', () => {
      expect(typeof analyticsService.trackQuickAction).toBe('function');
    });

    it('should have trackError method', () => {
      expect(typeof analyticsService.trackError).toBe('function');
    });

    // Test method calls
    it('should call identify without error', () => {
      expect(() => {
        analyticsService.identify({ userId: 'test-123' });
      }).not.toThrow();
    });

    it('should call pageView without error', () => {
      expect(() => {
        analyticsService.pageView({ path: '/test' });
      }).not.toThrow();
    });

    it('should call track without error', () => {
      expect(() => {
        analyticsService.track('test_event', { key: 'value' });
      }).not.toThrow();
    });

    it('should call trackSignIn without error', () => {
      expect(() => {
        analyticsService.trackSignIn('user-123', 'google');
      }).not.toThrow();
    });

    it('should call trackToolOpened without error', () => {
      expect(() => {
        analyticsService.trackToolOpened('aurion-chat');
      }).not.toThrow();
    });

    it('should call trackError without error', () => {
      expect(() => {
        analyticsService.trackError(new Error('Test error'), 'test-context');
      }).not.toThrow();
    });
  });
});
