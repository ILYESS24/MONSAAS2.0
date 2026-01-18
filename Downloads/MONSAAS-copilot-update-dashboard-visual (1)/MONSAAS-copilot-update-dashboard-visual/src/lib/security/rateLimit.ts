/**
 * Rate Limiting Module
 * 
 * Client-side rate limiting to prevent abuse.
 * Note: Server-side rate limiting is essential; this is a supplementary layer.
 * 
 * @module security/rateLimit
 */

// =============================================================================
// TYPES
// =============================================================================

export interface RateLimitConfig {
  windowMs: number;      // Time window in milliseconds
  maxRequests: number;   // Maximum requests per window
  blockDuration?: number; // How long to block after limit exceeded (ms)
  keyGenerator?: (action: string) => string;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

interface RateLimitEntry {
  count: number;
  windowStart: number;
  blockedUntil?: number;
}

// =============================================================================
// RATE LIMITER CLASS
// =============================================================================

/**
 * Client-side rate limiter using sliding window algorithm
 * 
 * @example
 * ```typescript
 * const limiter = new RateLimiter({
 *   windowMs: 60000,    // 1 minute
 *   maxRequests: 10,    // 10 requests per minute
 *   blockDuration: 300000 // Block for 5 minutes if exceeded
 * });
 * 
 * const result = limiter.check('login');
 * if (!result.allowed) {
 *   throw new Error(`Rate limit exceeded. Retry after ${result.retryAfter}ms`);
 * }
 * ```
 */
export class RateLimiter {
  private config: Required<RateLimitConfig>;
  private store: Map<string, RateLimitEntry> = new Map();
  private cleanupInterval: ReturnType<typeof setInterval> | null = null;

  constructor(config: RateLimitConfig) {
    this.config = {
      windowMs: config.windowMs,
      maxRequests: config.maxRequests,
      blockDuration: config.blockDuration || config.windowMs * 2,
      keyGenerator: config.keyGenerator || ((action: string) => action),
    };

    // Cleanup old entries periodically
    this.cleanupInterval = setInterval(() => this.cleanup(), this.config.windowMs);
  }

  /**
   * Check if an action is allowed under rate limits
   */
  check(action: string): RateLimitResult {
    const key = this.config.keyGenerator(action);
    const now = Date.now();
    const entry = this.store.get(key);

    // Check if blocked
    if (entry?.blockedUntil && entry.blockedUntil > now) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.blockedUntil,
        retryAfter: entry.blockedUntil - now,
      };
    }

    // Initialize or reset window if needed
    if (!entry || now - entry.windowStart >= this.config.windowMs) {
      this.store.set(key, {
        count: 1,
        windowStart: now,
      });

      return {
        allowed: true,
        remaining: this.config.maxRequests - 1,
        resetTime: now + this.config.windowMs,
      };
    }

    // Check if limit exceeded
    if (entry.count >= this.config.maxRequests) {
      // Block the key
      entry.blockedUntil = now + this.config.blockDuration;
      this.store.set(key, entry);

      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.blockedUntil,
        retryAfter: entry.blockedUntil - now,
      };
    }

    // Increment count
    entry.count++;
    this.store.set(key, entry);

    return {
      allowed: true,
      remaining: this.config.maxRequests - entry.count,
      resetTime: entry.windowStart + this.config.windowMs,
    };
  }

  /**
   * Consume a request (same as check but with explicit consume semantics)
   */
  consume(action: string): RateLimitResult {
    return this.check(action);
  }

  /**
   * Reset rate limit for a specific action
   */
  reset(action: string): void {
    const key = this.config.keyGenerator(action);
    this.store.delete(key);
  }

  /**
   * Reset all rate limits
   */
  resetAll(): void {
    this.store.clear();
  }

  /**
   * Get current status without consuming
   */
  getStatus(action: string): RateLimitResult {
    const key = this.config.keyGenerator(action);
    const now = Date.now();
    const entry = this.store.get(key);

    if (!entry || now - entry.windowStart >= this.config.windowMs) {
      return {
        allowed: true,
        remaining: this.config.maxRequests,
        resetTime: now + this.config.windowMs,
      };
    }

    if (entry.blockedUntil && entry.blockedUntil > now) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.blockedUntil,
        retryAfter: entry.blockedUntil - now,
      };
    }

    return {
      allowed: entry.count < this.config.maxRequests,
      remaining: Math.max(0, this.config.maxRequests - entry.count),
      resetTime: entry.windowStart + this.config.windowMs,
    };
  }

  /**
   * Cleanup expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    this.store.forEach((entry, key) => {
      if (
        now - entry.windowStart >= this.config.windowMs * 2 &&
        (!entry.blockedUntil || entry.blockedUntil <= now)
      ) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach((key) => this.store.delete(key));
  }

  /**
   * Stop the cleanup interval
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
}

// =============================================================================
// PRE-CONFIGURED LIMITERS
// =============================================================================

/**
 * Rate limiter for login attempts
 * 5 attempts per minute, blocked for 15 minutes
 */
export const loginRateLimiter = new RateLimiter({
  windowMs: 60 * 1000,       // 1 minute
  maxRequests: 5,            // 5 attempts
  blockDuration: 15 * 60 * 1000, // 15 minutes
  keyGenerator: (action) => `login:${action}`,
});

/**
 * Rate limiter for API requests
 * 100 requests per minute
 */
export const apiRateLimiter = new RateLimiter({
  windowMs: 60 * 1000,       // 1 minute
  maxRequests: 100,          // 100 requests
  blockDuration: 60 * 1000,  // 1 minute
  keyGenerator: (action) => `api:${action}`,
});

/**
 * Rate limiter for password reset requests
 * 3 attempts per hour
 */
export const passwordResetRateLimiter = new RateLimiter({
  windowMs: 60 * 60 * 1000,  // 1 hour
  maxRequests: 3,            // 3 attempts
  blockDuration: 60 * 60 * 1000, // 1 hour
  keyGenerator: (action) => `password-reset:${action}`,
});

/**
 * Rate limiter for signup
 * 5 signups per hour per IP
 */
export const signupRateLimiter = new RateLimiter({
  windowMs: 60 * 60 * 1000,  // 1 hour
  maxRequests: 5,            // 5 signups
  blockDuration: 60 * 60 * 1000, // 1 hour
  keyGenerator: (action) => `signup:${action}`,
});

// =============================================================================
// RATE LIMIT DECORATOR
// =============================================================================

/**
 * Higher-order function to wrap actions with rate limiting
 */
export function withRateLimit<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  limiter: RateLimiter,
  keyGenerator: (...args: Parameters<T>) => string
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    const key = keyGenerator(...args);
    const result = limiter.check(key);

    if (!result.allowed) {
      throw new RateLimitError(
        `Rate limit exceeded. Retry after ${Math.ceil((result.retryAfter || 0) / 1000)} seconds`,
        result
      );
    }

    return fn(...args) as ReturnType<T>;
  };
}

/**
 * Custom error class for rate limit violations
 */
export class RateLimitError extends Error {
  public rateLimitResult: RateLimitResult;

  constructor(message: string, result: RateLimitResult) {
    super(message);
    this.name = 'RateLimitError';
    this.rateLimitResult = result;
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

export default {
  RateLimiter,
  RateLimitError,
  loginRateLimiter,
  apiRateLimiter,
  passwordResetRateLimiter,
  signupRateLimiter,
  withRateLimit,
};
