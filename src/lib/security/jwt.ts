/**
 * JWT Security Module
 * 
 * Provides JWT token utilities including:
 * - Token parsing and validation
 * - Token refresh management
 * - Secure token storage
 * - Token family tracking for refresh token rotation
 * 
 * Note: Actual JWT signing should be done server-side.
 * This module handles client-side token management.
 * 
 * @module security/jwt
 */

// =============================================================================
// TYPES
// =============================================================================

export interface JwtHeader {
  alg: string;
  typ: string;
  kid?: string;
}

export interface JwtPayload {
  sub: string;        // Subject (user ID)
  iss?: string;       // Issuer
  aud?: string;       // Audience
  exp?: number;       // Expiration time (Unix timestamp)
  iat?: number;       // Issued at (Unix timestamp)
  nbf?: number;       // Not before (Unix timestamp)
  jti?: string;       // JWT ID
  [key: string]: unknown; // Custom claims
}

export interface ParsedJwt {
  header: JwtHeader;
  payload: JwtPayload;
  signature: string;
  raw: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiry: number;
  refreshTokenExpiry: number;
}

export interface TokenFamily {
  familyId: string;
  tokens: string[];
  createdAt: number;
  lastUsed: number;
  revoked: boolean;
}

export interface TokenStorageConfig {
  accessTokenKey?: string;
  refreshTokenKey?: string;
  tokenFamilyKey?: string;
  useSecureStorage?: boolean;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const DEFAULT_STORAGE_CONFIG: Required<TokenStorageConfig> = {
  accessTokenKey: 'access_token',
  refreshTokenKey: 'refresh_token',
  tokenFamilyKey: 'token_family',
  useSecureStorage: true,
};

// =============================================================================
// JWT PARSER
// =============================================================================

/**
 * Base64Url decode
 */
function base64UrlDecode(str: string): string {
  // Replace URL-safe characters
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');

  // Add padding if needed
  const padding = base64.length % 4;
  if (padding) {
    base64 += '='.repeat(4 - padding);
  }

  // Decode
  return atob(base64);
}

/**
 * Parse a JWT token without verifying the signature
 * Note: Always verify tokens server-side
 */
export function parseJwt(token: string): ParsedJwt | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const [headerB64, payloadB64, signature] = parts;

    const header = JSON.parse(base64UrlDecode(headerB64)) as JwtHeader;
    const payload = JSON.parse(base64UrlDecode(payloadB64)) as JwtPayload;

    return {
      header,
      payload,
      signature,
      raw: token,
    };
  } catch {
    return null;
  }
}

/**
 * Check if a JWT is expired
 */
export function isTokenExpired(token: string, bufferSeconds: number = 30): boolean {
  const parsed = parseJwt(token);
  if (!parsed || !parsed.payload.exp) {
    return true;
  }

  // Add buffer to account for clock skew
  const expiryWithBuffer = parsed.payload.exp - bufferSeconds;
  return Date.now() / 1000 > expiryWithBuffer;
}

/**
 * Get token expiration time
 */
export function getTokenExpiry(token: string): number | null {
  const parsed = parseJwt(token);
  return parsed?.payload.exp ?? null;
}

/**
 * Get time until token expires (in seconds)
 */
export function getTimeUntilExpiry(token: string): number {
  const expiry = getTokenExpiry(token);
  if (!expiry) {
    return 0;
  }
  return Math.max(0, expiry - Math.floor(Date.now() / 1000));
}

// =============================================================================
// TOKEN MANAGER
// =============================================================================

/**
 * JWT Token Manager
 * 
 * Manages access and refresh tokens with automatic refresh
 * and token family tracking for secure refresh token rotation.
 * 
 * @example
 * ```typescript
 * const tokenManager = new TokenManager();
 * 
 * // Store tokens after login
 * tokenManager.setTokens({
 *   accessToken: 'eyJ...',
 *   refreshToken: 'eyJ...',
 *   accessTokenExpiry: Date.now() + 15 * 60 * 1000,
 *   refreshTokenExpiry: Date.now() + 7 * 24 * 60 * 60 * 1000
 * });
 * 
 * // Get current access token (will refresh if needed)
 * const token = await tokenManager.getAccessToken();
 * ```
 */
export class TokenManager {
  private config: Required<TokenStorageConfig>;
  private tokenPair: TokenPair | null = null;
  private tokenFamily: TokenFamily | null = null;
  private refreshPromise: Promise<TokenPair | null> | null = null;
  private onRefresh: ((newTokens: TokenPair) => Promise<TokenPair>) | null = null;

  constructor(config?: TokenStorageConfig) {
    this.config = { ...DEFAULT_STORAGE_CONFIG, ...config };
    this.loadFromStorage();
  }

  /**
   * Set the token refresh callback
   */
  setRefreshCallback(callback: (newTokens: TokenPair) => Promise<TokenPair>): void {
    this.onRefresh = callback;
  }

  /**
   * Store tokens
   */
  setTokens(tokens: TokenPair): void {
    this.tokenPair = tokens;
    this.initTokenFamily(tokens.refreshToken);
    this.saveToStorage();
  }

  /**
   * Get access token (refreshes if needed)
   */
  async getAccessToken(): Promise<string | null> {
    if (!this.tokenPair) {
      return null;
    }

    // Check if access token is expired or about to expire
    if (this.shouldRefresh()) {
      await this.refresh();
    }

    return this.tokenPair?.accessToken ?? null;
  }

  /**
   * Get refresh token
   */
  getRefreshToken(): string | null {
    return this.tokenPair?.refreshToken ?? null;
  }

  /**
   * Check if should refresh token
   */
  private shouldRefresh(): boolean {
    if (!this.tokenPair) {
      return false;
    }

    // Refresh 1 minute before expiry
    const bufferMs = 60 * 1000;
    return Date.now() + bufferMs > this.tokenPair.accessTokenExpiry;
  }

  /**
   * Refresh the access token
   */
  async refresh(): Promise<TokenPair | null> {
    // Prevent concurrent refresh requests
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    if (!this.tokenPair || !this.onRefresh) {
      return null;
    }

    // Check if refresh token is expired
    if (Date.now() > this.tokenPair.refreshTokenExpiry) {
      this.clear();
      return null;
    }

    // Check token family for reuse detection
    if (this.tokenFamily?.revoked) {
      this.clear();
      throw new Error('Token family revoked - possible token theft detected');
    }

    this.refreshPromise = this.performRefresh();

    try {
      return await this.refreshPromise;
    } finally {
      this.refreshPromise = null;
    }
  }

  /**
   * Perform the actual refresh
   */
  private async performRefresh(): Promise<TokenPair | null> {
    if (!this.onRefresh || !this.tokenPair) {
      return null;
    }

    try {
      const newTokens = await this.onRefresh(this.tokenPair);
      this.setTokens(newTokens);
      return newTokens;
    } catch (error) {
      // If refresh fails, clear tokens
      this.clear();
      throw error;
    }
  }

  /**
   * Initialize token family for refresh token rotation tracking
   */
  private initTokenFamily(refreshToken: string): void {
    if (this.tokenFamily && !this.tokenFamily.revoked) {
      // Add to existing family
      this.tokenFamily.tokens.push(refreshToken);
      this.tokenFamily.lastUsed = Date.now();
    } else {
      // Create new family
      this.tokenFamily = {
        familyId: this.generateFamilyId(),
        tokens: [refreshToken],
        createdAt: Date.now(),
        lastUsed: Date.now(),
        revoked: false,
      };
    }
  }

  /**
   * Generate a unique family ID
   */
  private generateFamilyId(): string {
    const bytes = crypto.getRandomValues(new Uint8Array(16));
    return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Check if a refresh token was previously used (replay detection)
   */
  isRefreshTokenReused(token: string): boolean {
    if (!this.tokenFamily) {
      return false;
    }

    const tokenIndex = this.tokenFamily.tokens.indexOf(token);
    if (tokenIndex === -1) {
      return false;
    }

    // If it's not the latest token, it's being reused
    return tokenIndex < this.tokenFamily.tokens.length - 1;
  }

  /**
   * Revoke the token family (used when token theft is detected)
   */
  revokeFamily(): void {
    if (this.tokenFamily) {
      this.tokenFamily.revoked = true;
    }
    this.clear();
  }

  /**
   * Clear all tokens
   */
  clear(): void {
    this.tokenPair = null;
    this.tokenFamily = null;
    this.clearStorage();
  }

  /**
   * Check if authenticated
   */
  isAuthenticated(): boolean {
    return (
      this.tokenPair !== null &&
      Date.now() < this.tokenPair.refreshTokenExpiry
    );
  }

  /**
   * Save to storage
   */
  private saveToStorage(): void {
    try {
      if (this.tokenPair) {
        sessionStorage.setItem(
          this.config.accessTokenKey,
          JSON.stringify(this.tokenPair)
        );
      }
      if (this.tokenFamily) {
        sessionStorage.setItem(
          this.config.tokenFamilyKey,
          JSON.stringify(this.tokenFamily)
        );
      }
    } catch {
      // Storage not available, tokens will only persist in memory
    }
  }

  /**
   * Load from storage
   */
  private loadFromStorage(): void {
    try {
      const tokenPairStr = sessionStorage.getItem(this.config.accessTokenKey);
      if (tokenPairStr) {
        this.tokenPair = JSON.parse(tokenPairStr);
      }

      const familyStr = sessionStorage.getItem(this.config.tokenFamilyKey);
      if (familyStr) {
        this.tokenFamily = JSON.parse(familyStr);
      }
    } catch {
      // Storage not available or corrupted
      this.tokenPair = null;
      this.tokenFamily = null;
    }
  }

  /**
   * Clear storage
   */
  private clearStorage(): void {
    try {
      sessionStorage.removeItem(this.config.accessTokenKey);
      sessionStorage.removeItem(this.config.refreshTokenKey);
      sessionStorage.removeItem(this.config.tokenFamilyKey);
    } catch {
      // Storage not available
    }
  }

  /**
   * Get token info for debugging
   */
  getTokenInfo(): {
    hasAccessToken: boolean;
    hasRefreshToken: boolean;
    accessTokenExpiry: number | null;
    refreshTokenExpiry: number | null;
    isAuthenticated: boolean;
    familyId: string | null;
  } {
    return {
      hasAccessToken: !!this.tokenPair?.accessToken,
      hasRefreshToken: !!this.tokenPair?.refreshToken,
      accessTokenExpiry: this.tokenPair?.accessTokenExpiry ?? null,
      refreshTokenExpiry: this.tokenPair?.refreshTokenExpiry ?? null,
      isAuthenticated: this.isAuthenticated(),
      familyId: this.tokenFamily?.familyId ?? null,
    };
  }
}

// =============================================================================
// SECURE TOKEN STORAGE (for sensitive tokens)
// =============================================================================

/**
 * Secure token storage using encryption
 */
export class SecureTokenStorage {
  private encryptionKey: CryptoKey | null = null;
  private storageKey: string;
  private storedSalt: Uint8Array | null = null;

  constructor(storageKey: string = 'secure_tokens') {
    this.storageKey = storageKey;
  }

  /**
   * Initialize encryption key with user-specific salt
   * @param password - User password or device identifier
   * @param userIdentifier - Optional user-specific identifier for salt derivation
   */
  async initialize(password: string, userIdentifier?: string): Promise<void> {
    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(password);

    // Derive key from password
    const baseKey = await crypto.subtle.importKey(
      'raw',
      passwordBuffer,
      'PBKDF2',
      false,
      ['deriveKey']
    );

    // Generate or retrieve user-specific salt
    const salt = await this.getSalt(userIdentifier);

    this.encryptionKey = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations: 100000,
        hash: 'SHA-256',
      },
      baseKey,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Get or generate user-specific salt
   */
  private async getSalt(userIdentifier?: string): Promise<Uint8Array> {
    const saltKey = `${this.storageKey}:salt`;
    
    // Try to retrieve existing salt
    const existingSalt = sessionStorage.getItem(saltKey);
    if (existingSalt) {
      try {
        const parsed = JSON.parse(existingSalt);
        return new Uint8Array(parsed);
      } catch {
        // Salt corrupted, generate new one
      }
    }

    // Generate new salt (16 bytes)
    let salt: Uint8Array;
    if (userIdentifier) {
      // Derive salt from user identifier for consistency across sessions
      const encoder = new TextEncoder();
      const identifierData = encoder.encode(userIdentifier + '-aurion-studio');
      const hashBuffer = await crypto.subtle.digest('SHA-256', identifierData);
      salt = new Uint8Array(hashBuffer.slice(0, 16));
    } else {
      // Random salt for anonymous sessions
      salt = crypto.getRandomValues(new Uint8Array(16));
    }

    // Store salt
    sessionStorage.setItem(saltKey, JSON.stringify(Array.from(salt)));
    this.storedSalt = salt;

    return salt;
  }

  /**
   * Store encrypted token
   */
  async store(key: string, value: string): Promise<void> {
    if (!this.encryptionKey) {
      throw new Error('Storage not initialized');
    }

    const encoder = new TextEncoder();
    const data = encoder.encode(value);
    const iv = crypto.getRandomValues(new Uint8Array(12));

    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      this.encryptionKey,
      data
    );

    const stored = {
      iv: Array.from(iv),
      data: Array.from(new Uint8Array(encrypted)),
    };

    sessionStorage.setItem(`${this.storageKey}:${key}`, JSON.stringify(stored));
  }

  /**
   * Retrieve and decrypt token
   */
  async retrieve(key: string): Promise<string | null> {
    if (!this.encryptionKey) {
      throw new Error('Storage not initialized');
    }

    const storedStr = sessionStorage.getItem(`${this.storageKey}:${key}`);
    if (!storedStr) {
      return null;
    }

    try {
      const stored = JSON.parse(storedStr);
      const iv = new Uint8Array(stored.iv);
      const data = new Uint8Array(stored.data);

      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        this.encryptionKey,
        data
      );

      const decoder = new TextDecoder();
      return decoder.decode(decrypted);
    } catch {
      return null;
    }
  }

  /**
   * Remove token
   */
  remove(key: string): void {
    sessionStorage.removeItem(`${this.storageKey}:${key}`);
  }

  /**
   * Clear all tokens
   */
  clear(): void {
    const keysToRemove: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key?.startsWith(`${this.storageKey}:`)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => sessionStorage.removeItem(key));
  }
}

// =============================================================================
// SINGLETON EXPORTS
// =============================================================================

export const tokenManager = new TokenManager();
export const secureTokenStorage = new SecureTokenStorage();

export default {
  parseJwt,
  isTokenExpired,
  getTokenExpiry,
  getTimeUntilExpiry,
  TokenManager,
  SecureTokenStorage,
  tokenManager,
  secureTokenStorage,
};
