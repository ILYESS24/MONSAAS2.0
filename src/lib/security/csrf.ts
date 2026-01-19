/**
 * CSRF Protection Module
 * 
 * Provides Cross-Site Request Forgery protection with token generation
 * and validation for client-side applications.
 * 
 * This module has two parts:
 * 1. Core CSRF protection (no dependencies) - CsrfProtection class
 * 2. React integration - useCsrf hook (requires React)
 * 
 * @module security/csrf
 */

// React imports for the useCsrf hook
// These are tree-shaken if the hook is not used
import { useState, useCallback, useMemo } from 'react';

// =============================================================================
// TYPES
// =============================================================================

export interface CsrfConfig {
  tokenLength?: number;
  headerName?: string;
  cookieName?: string;
  maxAge?: number; // Token validity in milliseconds
}

export interface CsrfToken {
  token: string;
  expires: number;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const DEFAULT_CONFIG: Required<CsrfConfig> = {
  tokenLength: 32,
  headerName: 'X-CSRF-Token',
  cookieName: 'csrf_token',
  maxAge: 60 * 60 * 1000, // 1 hour
};

// =============================================================================
// CSRF PROTECTION CLASS
// =============================================================================

/**
 * CSRF Protection Manager
 * 
 * Handles generation and validation of CSRF tokens.
 * Implements double-submit cookie pattern for SPAs.
 * 
 * @example
 * ```typescript
 * const csrf = new CsrfProtection();
 * 
 * // Generate token for a form
 * const token = csrf.generateToken();
 * 
 * // Validate token on form submission
 * if (!csrf.validateToken(submittedToken)) {
 *   throw new Error('CSRF validation failed');
 * }
 * ```
 */
export class CsrfProtection {
  private config: Required<CsrfConfig>;
  private currentToken: CsrfToken | null = null;

  constructor(config?: CsrfConfig) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Generate a cryptographically secure random token
   */
  private generateRandomToken(length: number): string {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Generate a new CSRF token
   */
  generateToken(): string {
    const token = this.generateRandomToken(this.config.tokenLength);
    const expires = Date.now() + this.config.maxAge;

    this.currentToken = { token, expires };

    return token;
  }

  /**
   * Get the current token or generate a new one if expired
   */
  getToken(): string {
    if (!this.currentToken || this.isExpired(this.currentToken)) {
      return this.generateToken();
    }
    return this.currentToken.token;
  }

  /**
   * Check if a token is expired
   */
  private isExpired(csrfToken: CsrfToken): boolean {
    return Date.now() > csrfToken.expires;
  }

  /**
   * Validate a submitted CSRF token
   */
  validateToken(submittedToken: string): boolean {
    if (!this.currentToken) {
      return false;
    }

    if (this.isExpired(this.currentToken)) {
      this.currentToken = null;
      return false;
    }

    // Constant-time comparison to prevent timing attacks
    return this.constantTimeCompare(submittedToken, this.currentToken.token);
  }

  /**
   * Constant-time string comparison
   */
  private constantTimeCompare(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false;
    }

    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return result === 0;
  }

  /**
   * Rotate the CSRF token (generate a new one)
   */
  rotateToken(): string {
    return this.generateToken();
  }

  /**
   * Clear the current token
   */
  clearToken(): void {
    this.currentToken = null;
  }

  /**
   * Get configuration values
   */
  getHeaderName(): string {
    return this.config.headerName;
  }

  getCookieName(): string {
    return this.config.cookieName;
  }

  /**
   * Create headers object with CSRF token
   */
  getHeaders(): Record<string, string> {
    return {
      [this.config.headerName]: this.getToken(),
    };
  }
}

// =============================================================================
// REQUEST INTERCEPTOR
// =============================================================================

/**
 * Create a fetch wrapper that automatically includes CSRF tokens
 */
export function createCsrfFetch(
  csrf: CsrfProtection,
  baseFetch: typeof fetch = fetch
): typeof fetch {
  return async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const method = init?.method?.toUpperCase() || 'GET';

    // Only add CSRF token for state-changing methods
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      const headers = new Headers(init?.headers);
      headers.set(csrf.getHeaderName(), csrf.getToken());

      return baseFetch(input, {
        ...init,
        headers,
      });
    }

    return baseFetch(input, init);
  };
}

// =============================================================================
// REACT HOOK
// =============================================================================

/**
 * React hook for CSRF protection
 * 
 * @example
 * ```typescript
 * function MyForm() {
 *   const { token, refreshToken, headers } = useCsrf();
 *   
 *   const handleSubmit = async (data) => {
 *     await fetch('/api/submit', {
 *       method: 'POST',
 *       headers: { ...headers, 'Content-Type': 'application/json' },
 *       body: JSON.stringify(data)
 *     });
 *   };
 * 
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       <input type="hidden" name="_csrf" value={token} />
 *       ...
 *     </form>
 *   );
 * }
 * ```
 */
export function useCsrf(config?: CsrfConfig) {
  const csrf = useMemo(() => new CsrfProtection(config), [config]);
  const [token, setToken] = useState(() => csrf.getToken());

  const refreshToken = useCallback(() => {
    const newToken = csrf.rotateToken();
    setToken(newToken);
    return newToken;
  }, [csrf]);

  const validateToken = useCallback(
    (submittedToken: string) => csrf.validateToken(submittedToken),
    [csrf]
  );

  const headers = useMemo(
    () => ({ [csrf.getHeaderName()]: token }),
    [csrf, token]
  );

  return {
    token,
    refreshToken,
    validateToken,
    headers,
    headerName: csrf.getHeaderName(),
  };
}

// =============================================================================
// SINGLETON EXPORT
// =============================================================================

export const csrfProtection = new CsrfProtection();
export const csrfFetch = createCsrfFetch(csrfProtection);

export default {
  CsrfProtection,
  createCsrfFetch,
  useCsrf,
  csrfProtection,
  csrfFetch,
};
