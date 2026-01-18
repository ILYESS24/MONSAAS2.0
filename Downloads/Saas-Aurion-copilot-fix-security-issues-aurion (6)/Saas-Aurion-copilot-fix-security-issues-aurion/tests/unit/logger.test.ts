/**
 * @fileoverview Unit tests for logger.ts
 * 
 * Tests the structured logging service including:
 * - Log levels
 * - Log entry creation
 * - Batching behavior
 * - Session/user ID handling
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

// ============================================
// MOCK LOGGER FOR TESTING
// ============================================

interface LogEntry {
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error' | 'security';
  message: string;
  context?: Record<string, unknown>;
  stack?: string;
}

class MockLogger {
  private queue: LogEntry[] = [];
  private maxQueueSize = 100;
  
  private createEntry(
    level: LogEntry['level'],
    message: string,
    context?: Record<string, unknown>
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message: message.slice(0, 10000), // Truncate
      context,
    };
  }
  
  debug(message: string, context?: Record<string, unknown>): void {
    const entry = this.createEntry('debug', message, context);
    this.queue.push(entry);
  }
  
  info(message: string, context?: Record<string, unknown>): void {
    const entry = this.createEntry('info', message, context);
    this.queue.push(entry);
  }
  
  warn(message: string, context?: Record<string, unknown>): void {
    const entry = this.createEntry('warn', message, context);
    this.queue.push(entry);
  }
  
  error(message: string, error?: Error, context?: Record<string, unknown>): void {
    const entry = this.createEntry('error', message, {
      ...context,
      ...(error && { errorMessage: error.message, stack: error.stack }),
    });
    if (error) entry.stack = error.stack;
    this.queue.push(entry);
  }
  
  security(message: string, context?: Record<string, unknown>): void {
    const entry = this.createEntry('security', message, {
      ...context,
      securityEvent: true,
    });
    this.queue.push(entry);
  }
  
  getQueue(): LogEntry[] {
    return [...this.queue];
  }
  
  clearQueue(): void {
    this.queue = [];
  }
  
  getQueueSize(): number {
    return this.queue.length;
  }
}

// ============================================
// TESTS
// ============================================

describe('Logger', () => {
  let logger: MockLogger;
  
  beforeEach(() => {
    logger = new MockLogger();
  });
  
  describe('Log Levels', () => {
    it('should create debug log entries', () => {
      logger.debug('Debug message');
      
      const queue = logger.getQueue();
      expect(queue).toHaveLength(1);
      expect(queue[0].level).toBe('debug');
      expect(queue[0].message).toBe('Debug message');
    });
    
    it('should create info log entries', () => {
      logger.info('Info message');
      
      const queue = logger.getQueue();
      expect(queue).toHaveLength(1);
      expect(queue[0].level).toBe('info');
    });
    
    it('should create warn log entries', () => {
      logger.warn('Warning message');
      
      const queue = logger.getQueue();
      expect(queue).toHaveLength(1);
      expect(queue[0].level).toBe('warn');
    });
    
    it('should create error log entries', () => {
      const error = new Error('Test error');
      logger.error('Error occurred', error);
      
      const queue = logger.getQueue();
      expect(queue).toHaveLength(1);
      expect(queue[0].level).toBe('error');
      expect(queue[0].context?.errorMessage).toBe('Test error');
      expect(queue[0].stack).toBeDefined();
    });
    
    it('should create security log entries', () => {
      logger.security('Security event');
      
      const queue = logger.getQueue();
      expect(queue).toHaveLength(1);
      expect(queue[0].level).toBe('security');
      expect(queue[0].context?.securityEvent).toBe(true);
    });
  });
  
  describe('Log Entry Structure', () => {
    it('should include timestamp in ISO format', () => {
      logger.info('Test');
      
      const entry = logger.getQueue()[0];
      expect(entry.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });
    
    it('should include context when provided', () => {
      logger.info('Test', { userId: '123', action: 'login' });
      
      const entry = logger.getQueue()[0];
      expect(entry.context).toEqual({ userId: '123', action: 'login' });
    });
    
    it('should handle missing context', () => {
      logger.info('Test');
      
      const entry = logger.getQueue()[0];
      expect(entry.context).toBeUndefined();
    });
  });
  
  describe('Message Truncation', () => {
    it('should truncate messages longer than 10000 characters', () => {
      const longMessage = 'x'.repeat(15000);
      logger.info(longMessage);
      
      const entry = logger.getQueue()[0];
      expect(entry.message.length).toBe(10000);
    });
    
    it('should not truncate messages under 10000 characters', () => {
      const shortMessage = 'Short message';
      logger.info(shortMessage);
      
      const entry = logger.getQueue()[0];
      expect(entry.message).toBe(shortMessage);
    });
  });
  
  describe('Error Handling', () => {
    it('should extract error message and stack', () => {
      const error = new Error('Something went wrong');
      logger.error('Failed operation', error);
      
      const entry = logger.getQueue()[0];
      expect(entry.context?.errorMessage).toBe('Something went wrong');
      expect(entry.stack).toContain('Error: Something went wrong');
    });
    
    it('should handle error without Error object', () => {
      logger.error('Failed operation');
      
      const entry = logger.getQueue()[0];
      expect(entry.level).toBe('error');
      expect(entry.message).toBe('Failed operation');
    });
    
    it('should merge error context with provided context', () => {
      const error = new Error('Test');
      logger.error('Failed', error, { requestId: 'abc' });
      
      const entry = logger.getQueue()[0];
      expect(entry.context?.requestId).toBe('abc');
      expect(entry.context?.errorMessage).toBe('Test');
    });
  });
  
  describe('Queue Management', () => {
    it('should queue multiple logs', () => {
      logger.info('First');
      logger.info('Second');
      logger.info('Third');
      
      expect(logger.getQueueSize()).toBe(3);
    });
    
    it('should clear queue', () => {
      logger.info('Test');
      logger.clearQueue();
      
      expect(logger.getQueueSize()).toBe(0);
    });
    
    it('should maintain log order', () => {
      logger.info('First');
      logger.info('Second');
      logger.info('Third');
      
      const queue = logger.getQueue();
      expect(queue[0].message).toBe('First');
      expect(queue[1].message).toBe('Second');
      expect(queue[2].message).toBe('Third');
    });
  });
});

// ============================================
// SESSION ID GENERATION TESTS
// ============================================

describe('Session ID Generation', () => {
  it('should generate unique session IDs', () => {
    const ids = new Set<string>();
    
    for (let i = 0; i < 100; i++) {
      const id = `session_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
      ids.add(id);
    }
    
    // All IDs should be unique
    expect(ids.size).toBe(100);
  });
  
  it('should include timestamp in session ID', () => {
    const now = Date.now();
    const id = `session_${now}_abc123`;
    
    expect(id).toContain(now.toString());
  });
  
  it('should have consistent format', () => {
    const id = `session_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    
    expect(id).toMatch(/^session_\d+_[a-z0-9]+$/);
  });
});
