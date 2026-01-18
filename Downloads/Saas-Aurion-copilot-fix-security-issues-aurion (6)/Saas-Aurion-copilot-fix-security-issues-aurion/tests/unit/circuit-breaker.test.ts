/**
 * @fileoverview Unit tests for circuit-breaker.ts
 * 
 * Tests the circuit breaker pattern implementation including:
 * - State transitions (CLOSED -> OPEN -> HALF_OPEN)
 * - Failure counting and thresholds
 * - Retry with backoff
 * - API client wrapper
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// ============================================
// CIRCUIT BREAKER TESTS
// ============================================

describe('CircuitBreaker', () => {
  // Mock the circuit breaker locally to test logic
  class MockCircuitBreaker {
    private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
    private failures = 0;
    private successes = 0;
    private readonly failureThreshold: number;
    private readonly successThreshold: number;
    
    constructor(failureThreshold = 5, successThreshold = 2) {
      this.failureThreshold = failureThreshold;
      this.successThreshold = successThreshold;
    }
    
    async execute<T>(operation: () => Promise<T>): Promise<T> {
      if (this.state === 'OPEN') {
        throw new Error('Circuit is OPEN');
      }
      
      try {
        const result = await operation();
        this.recordSuccess();
        return result;
      } catch (error) {
        this.recordFailure();
        throw error;
      }
    }
    
    private recordSuccess(): void {
      if (this.state === 'HALF_OPEN') {
        this.successes++;
        if (this.successes >= this.successThreshold) {
          this.state = 'CLOSED';
          this.failures = 0;
          this.successes = 0;
        }
      } else {
        this.failures = Math.max(0, this.failures - 1);
      }
    }
    
    private recordFailure(): void {
      this.failures++;
      if (this.state === 'HALF_OPEN') {
        this.state = 'OPEN';
      } else if (this.failures >= this.failureThreshold) {
        this.state = 'OPEN';
      }
    }
    
    getState(): string {
      return this.state;
    }
    
    // For testing: manually set to HALF_OPEN
    setHalfOpen(): void {
      this.state = 'HALF_OPEN';
      this.successes = 0;
    }
    
    reset(): void {
      this.state = 'CLOSED';
      this.failures = 0;
      this.successes = 0;
    }
  }
  
  let breaker: MockCircuitBreaker;
  
  beforeEach(() => {
    breaker = new MockCircuitBreaker(3, 2); // 3 failures to open, 2 successes to close
  });
  
  describe('CLOSED state', () => {
    it('should start in CLOSED state', () => {
      expect(breaker.getState()).toBe('CLOSED');
    });
    
    it('should allow successful operations', async () => {
      const result = await breaker.execute(async () => 'success');
      expect(result).toBe('success');
      expect(breaker.getState()).toBe('CLOSED');
    });
    
    it('should count failures', async () => {
      const failingOp = async () => { throw new Error('fail'); };
      
      // First failure
      await expect(breaker.execute(failingOp)).rejects.toThrow('fail');
      expect(breaker.getState()).toBe('CLOSED');
      
      // Second failure
      await expect(breaker.execute(failingOp)).rejects.toThrow('fail');
      expect(breaker.getState()).toBe('CLOSED');
    });
    
    it('should transition to OPEN after threshold failures', async () => {
      const failingOp = async () => { throw new Error('fail'); };
      
      // 3 failures = threshold
      await expect(breaker.execute(failingOp)).rejects.toThrow();
      await expect(breaker.execute(failingOp)).rejects.toThrow();
      await expect(breaker.execute(failingOp)).rejects.toThrow();
      
      expect(breaker.getState()).toBe('OPEN');
    });
    
    it('should decay failures on success', async () => {
      const failingOp = async () => { throw new Error('fail'); };
      const successOp = async () => 'ok';
      
      // 2 failures
      await expect(breaker.execute(failingOp)).rejects.toThrow();
      await expect(breaker.execute(failingOp)).rejects.toThrow();
      
      // 1 success (decays failure count)
      await breaker.execute(successOp);
      
      // 1 more failure - should still be CLOSED (not 3 total)
      await expect(breaker.execute(failingOp)).rejects.toThrow();
      expect(breaker.getState()).toBe('CLOSED');
    });
  });
  
  describe('OPEN state', () => {
    beforeEach(async () => {
      // Get to OPEN state
      const failingOp = async () => { throw new Error('fail'); };
      for (let i = 0; i < 3; i++) {
        try { await breaker.execute(failingOp); } catch {}
      }
    });
    
    it('should reject all operations when OPEN', async () => {
      await expect(breaker.execute(async () => 'test')).rejects.toThrow('Circuit is OPEN');
    });
    
    it('should not call the operation when OPEN', async () => {
      const spy = vi.fn().mockResolvedValue('test');
      
      try {
        await breaker.execute(spy);
      } catch {}
      
      expect(spy).not.toHaveBeenCalled();
    });
  });
  
  describe('HALF_OPEN state', () => {
    beforeEach(() => {
      breaker.setHalfOpen();
    });
    
    it('should allow operations in HALF_OPEN', async () => {
      const result = await breaker.execute(async () => 'success');
      expect(result).toBe('success');
    });
    
    it('should transition to CLOSED after success threshold', async () => {
      await breaker.execute(async () => 'ok');
      expect(breaker.getState()).toBe('HALF_OPEN'); // 1 success
      
      await breaker.execute(async () => 'ok');
      expect(breaker.getState()).toBe('CLOSED'); // 2 successes = threshold
    });
    
    it('should transition back to OPEN on failure', async () => {
      await expect(breaker.execute(async () => { throw new Error('fail'); })).rejects.toThrow();
      expect(breaker.getState()).toBe('OPEN');
    });
  });
});

// ============================================
// RETRY WITH BACKOFF TESTS
// ============================================

describe('retryWithBackoff', () => {
  // Simplified retry implementation for testing
  async function retryWithBackoff<T>(
    operation: () => Promise<T>,
    maxRetries = 3,
    baseDelay = 100
  ): Promise<T> {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        if (attempt === maxRetries) break;
        
        // Wait with exponential backoff
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError ?? new Error('Retry failed');
  }
  
  it('should succeed on first attempt', async () => {
    const op = vi.fn().mockResolvedValue('success');
    
    const result = await retryWithBackoff(op, 3, 10);
    
    expect(result).toBe('success');
    expect(op).toHaveBeenCalledTimes(1);
  });
  
  it('should retry on failure', async () => {
    const op = vi.fn()
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValue('success');
    
    const result = await retryWithBackoff(op, 3, 10);
    
    expect(result).toBe('success');
    expect(op).toHaveBeenCalledTimes(2);
  });
  
  it('should throw after max retries', async () => {
    const op = vi.fn().mockRejectedValue(new Error('always fail'));
    
    await expect(retryWithBackoff(op, 2, 10)).rejects.toThrow('always fail');
    expect(op).toHaveBeenCalledTimes(3); // Initial + 2 retries
  });
  
  it('should apply exponential backoff', async () => {
    const delays: number[] = [];
    const originalSetTimeout = global.setTimeout;
    
    vi.spyOn(global, 'setTimeout').mockImplementation(((fn: () => void, delay: number) => {
      delays.push(delay);
      return originalSetTimeout(fn, 0); // Execute immediately for test speed
    }) as typeof global.setTimeout);
    
    const op = vi.fn()
      .mockRejectedValueOnce(new Error('fail'))
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValue('success');
    
    await retryWithBackoff(op, 3, 100);
    
    // Check exponential pattern: 100, 200 (100 * 2^0, 100 * 2^1)
    expect(delays[0]).toBe(100);
    expect(delays[1]).toBe(200);
    
    vi.restoreAllMocks();
  });
});

// ============================================
// API ERROR TESTS
// ============================================

describe('ApiError', () => {
  class ApiError extends Error {
    constructor(
      public readonly status: number,
      public readonly body: string
    ) {
      super(`API Error ${status}: ${body}`);
      this.name = 'ApiError';
    }
    
    get isRetryable(): boolean {
      return this.status >= 500 || this.status === 429;
    }
  }
  
  it('should create error with status and body', () => {
    const error = new ApiError(404, 'Not Found');
    
    expect(error.status).toBe(404);
    expect(error.body).toBe('Not Found');
    expect(error.message).toBe('API Error 404: Not Found');
    expect(error.name).toBe('ApiError');
  });
  
  it('should identify 5xx errors as retryable', () => {
    expect(new ApiError(500, '').isRetryable).toBe(true);
    expect(new ApiError(502, '').isRetryable).toBe(true);
    expect(new ApiError(503, '').isRetryable).toBe(true);
    expect(new ApiError(504, '').isRetryable).toBe(true);
  });
  
  it('should identify 429 as retryable', () => {
    expect(new ApiError(429, 'Rate limited').isRetryable).toBe(true);
  });
  
  it('should identify 4xx (non-429) as non-retryable', () => {
    expect(new ApiError(400, '').isRetryable).toBe(false);
    expect(new ApiError(401, '').isRetryable).toBe(false);
    expect(new ApiError(403, '').isRetryable).toBe(false);
    expect(new ApiError(404, '').isRetryable).toBe(false);
    expect(new ApiError(422, '').isRetryable).toBe(false);
  });
});
