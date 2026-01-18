/**
 * Logger Tests
 * 
 * Tests for the logging utility with sensitive data redaction.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { logger, createLogger, authLogger, securityLogger } from '@/lib/logger';

describe('Logger', () => {
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  let consoleDebugSpy: ReturnType<typeof vi.spyOn>;
  let consoleInfoSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    consoleDebugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
    consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ===========================================================================
  // LOGGER METHODS
  // ===========================================================================
  describe('logger methods', () => {
    it('should have info method', () => {
      expect(typeof logger.info).toBe('function');
    });

    it('should have warn method', () => {
      expect(typeof logger.warn).toBe('function');
    });

    it('should have error method', () => {
      expect(typeof logger.error).toBe('function');
    });

    it('should have debug method', () => {
      expect(typeof logger.debug).toBe('function');
    });
  });

  // ===========================================================================
  // LOGGING CALLS
  // ===========================================================================
  describe('logging calls', () => {
    it('should call warn without throwing', () => {
      expect(() => logger.warn('Test warning')).not.toThrow();
    });

    it('should call error without throwing', () => {
      expect(() => logger.error('Test error')).not.toThrow();
    });

    it('should call info without throwing', () => {
      expect(() => logger.info('Test info')).not.toThrow();
    });

    it('should call debug without throwing', () => {
      expect(() => logger.debug('Test debug')).not.toThrow();
    });

    it('should accept data parameter', () => {
      expect(() => logger.info('Test with data', { key: 'value' })).not.toThrow();
    });
  });

  // ===========================================================================
  // LOGGER CREATION
  // ===========================================================================
  describe('createLogger', () => {
    it('should create a new logger instance', () => {
      const customLogger = createLogger('CustomContext');
      expect(customLogger).toBeDefined();
      expect(typeof customLogger.info).toBe('function');
    });
  });

  // ===========================================================================
  // SPECIALIZED LOGGERS
  // ===========================================================================
  describe('specialized loggers', () => {
    it('should have authLogger available', () => {
      expect(authLogger).toBeDefined();
      expect(typeof authLogger.info).toBe('function');
    });

    it('should have securityLogger available', () => {
      expect(securityLogger).toBeDefined();
      expect(typeof securityLogger.info).toBe('function');
    });
  });

  // ===========================================================================
  // CHILD LOGGER
  // ===========================================================================
  describe('child logger', () => {
    it('should create child logger', () => {
      const childLogger = logger.child('ChildContext');
      expect(childLogger).toBeDefined();
      expect(typeof childLogger.info).toBe('function');
    });
  });
});
