/**
 * Multi-Factor Authentication (MFA) Module
 * 
 * Provides MFA utilities including:
 * - TOTP (Time-based One-Time Password) generation and validation
 * - Backup codes generation and validation
 * - Device fingerprinting
 * - Session tracking
 * 
 * @module security/mfa
 */

// =============================================================================
// TYPES
// =============================================================================

export interface MfaConfig {
  totpDigits?: number;
  totpPeriod?: number;
  totpAlgorithm?: 'SHA1' | 'SHA256' | 'SHA512';
  backupCodesCount?: number;
  backupCodeLength?: number;
  issuer?: string;
}

export interface TotpSecret {
  secret: string;
  uri: string;
  qrCode?: string;
}

export interface DeviceFingerprint {
  id: string;
  userAgent: string;
  language: string;
  platform: string;
  screenResolution: string;
  timezone: string;
  timestamp: number;
}

export interface MfaSession {
  userId: string;
  deviceFingerprint: string;
  lastVerified: number;
  mfaCompleted: boolean;
  expiresAt: number;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const DEFAULT_CONFIG: Required<MfaConfig> = {
  totpDigits: 6,
  totpPeriod: 30,
  totpAlgorithm: 'SHA1',
  backupCodesCount: 10,
  backupCodeLength: 8,
  issuer: 'Aurion Studio',
};

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Convert ArrayBuffer to hex string
 */
function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Convert hex string to Uint8Array
 */
function hexToBuffer(hex: string): Uint8Array {
  const result = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    result[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return result;
}

/**
 * Base32 encode
 */
function base32Encode(buffer: Uint8Array): string {
  let result = '';
  let bits = 0;
  let value = 0;

  for (let i = 0; i < buffer.length; i++) {
    value = (value << 8) | buffer[i];
    bits += 8;

    while (bits >= 5) {
      result += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) {
    result += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  }

  return result;
}

/**
 * Base32 decode
 */
function base32Decode(encoded: string): Uint8Array {
  const cleanedInput = encoded.toUpperCase().replace(/=+$/, '');
  const output: number[] = [];
  let bits = 0;
  let value = 0;

  for (let i = 0; i < cleanedInput.length; i++) {
    const idx = BASE32_ALPHABET.indexOf(cleanedInput[i]);
    if (idx === -1) continue;

    value = (value << 5) | idx;
    bits += 5;

    if (bits >= 8) {
      output.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }

  return new Uint8Array(output);
}

/**
 * Generate random bytes
 */
function generateRandomBytes(length: number): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(length));
}

// =============================================================================
// TOTP IMPLEMENTATION
// =============================================================================

/**
 * TOTP (Time-based One-Time Password) Manager
 * 
 * Implements RFC 6238 TOTP algorithm for two-factor authentication.
 * Compatible with Google Authenticator, Authy, and other TOTP apps.
 * 
 * @example
 * ```typescript
 * const totp = new TotpManager();
 * 
 * // Generate a new secret for a user
 * const secret = totp.generateSecret('user@example.com');
 * 
 * // Validate a code entered by the user
 * const isValid = await totp.validateCode(secret.secret, '123456');
 * ```
 */
export class TotpManager {
  private config: Required<MfaConfig>;

  constructor(config?: MfaConfig) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Generate a new TOTP secret
   */
  generateSecret(accountName: string): TotpSecret {
    const secretBytes = generateRandomBytes(20);
    const secret = base32Encode(secretBytes);

    const uri = this.generateTotpUri(secret, accountName);

    return {
      secret,
      uri,
    };
  }

  /**
   * Generate TOTP URI for QR code
   */
  private generateTotpUri(secret: string, accountName: string): string {
    const params = new URLSearchParams({
      secret,
      issuer: this.config.issuer,
      algorithm: this.config.totpAlgorithm,
      digits: this.config.totpDigits.toString(),
      period: this.config.totpPeriod.toString(),
    });

    return `otpauth://totp/${encodeURIComponent(this.config.issuer)}:${encodeURIComponent(
      accountName
    )}?${params.toString()}`;
  }

  /**
   * Generate current TOTP code
   */
  async generateCode(secret: string, timestamp?: number): Promise<string> {
    const time = timestamp || Date.now();
    const counter = Math.floor(time / 1000 / this.config.totpPeriod);

    return this.generateHotp(secret, counter);
  }

  /**
   * Generate HOTP code (HMAC-based One-Time Password)
   */
  private async generateHotp(secret: string, counter: number): Promise<string> {
    const secretBytes = base32Decode(secret);

    // Convert counter to 8-byte buffer
    const counterBuffer = new ArrayBuffer(8);
    const view = new DataView(counterBuffer);
    view.setBigUint64(0, BigInt(counter), false);

    // Import key
    const key = await crypto.subtle.importKey(
      'raw',
      secretBytes,
      { name: 'HMAC', hash: `SHA-${this.config.totpAlgorithm.replace('SHA', '')}` },
      false,
      ['sign']
    );

    // Generate HMAC
    const hmac = await crypto.subtle.sign('HMAC', key, counterBuffer);
    const hmacArray = new Uint8Array(hmac);

    // Dynamic truncation
    const offset = hmacArray[hmacArray.length - 1] & 0x0f;
    const binary =
      ((hmacArray[offset] & 0x7f) << 24) |
      ((hmacArray[offset + 1] & 0xff) << 16) |
      ((hmacArray[offset + 2] & 0xff) << 8) |
      (hmacArray[offset + 3] & 0xff);

    const otp = binary % Math.pow(10, this.config.totpDigits);
    return otp.toString().padStart(this.config.totpDigits, '0');
  }

  /**
   * Validate a TOTP code
   * Allows for 1 period of time drift in either direction
   */
  async validateCode(
    secret: string,
    code: string,
    windowSize: number = 1
  ): Promise<boolean> {
    const now = Date.now();

    // Check current and adjacent time windows
    for (let i = -windowSize; i <= windowSize; i++) {
      const timestamp = now + i * this.config.totpPeriod * 1000;
      const expectedCode = await this.generateCode(secret, timestamp);

      if (this.constantTimeCompare(code, expectedCode)) {
        return true;
      }
    }

    return false;
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
   * Get remaining seconds until next code
   */
  getTimeRemaining(): number {
    const now = Math.floor(Date.now() / 1000);
    return this.config.totpPeriod - (now % this.config.totpPeriod);
  }
}

// =============================================================================
// BACKUP CODES
// =============================================================================

/**
 * Backup Codes Manager
 * 
 * Generates and validates one-time backup codes for MFA recovery.
 */
export class BackupCodesManager {
  private config: Required<MfaConfig>;
  private usedCodes: Set<string> = new Set();

  constructor(config?: MfaConfig) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Generate a set of backup codes
   */
  generateCodes(): string[] {
    const codes: string[] = [];

    for (let i = 0; i < this.config.backupCodesCount; i++) {
      codes.push(this.generateCode());
    }

    return codes;
  }

  /**
   * Generate a single backup code
   */
  private generateCode(): string {
    const bytes = generateRandomBytes(Math.ceil(this.config.backupCodeLength / 2));
    return bufferToHex(bytes.buffer)
      .substring(0, this.config.backupCodeLength)
      .toUpperCase();
  }

  /**
   * Validate and consume a backup code
   */
  validateCode(code: string, validCodes: string[]): boolean {
    const normalizedCode = code.toUpperCase().replace(/[^A-Z0-9]/g, '');

    if (this.usedCodes.has(normalizedCode)) {
      return false;
    }

    const isValid = validCodes.some((validCode) =>
      this.constantTimeCompare(normalizedCode, validCode.toUpperCase())
    );

    if (isValid) {
      this.usedCodes.add(normalizedCode);
    }

    return isValid;
  }

  /**
   * Get remaining unused codes count
   */
  getRemainingCount(validCodes: string[]): number {
    return validCodes.filter(
      (code) => !this.usedCodes.has(code.toUpperCase())
    ).length;
  }

  /**
   * Mark a code as used
   */
  markAsUsed(code: string): void {
    this.usedCodes.add(code.toUpperCase());
  }

  /**
   * Clear used codes (for regeneration)
   */
  clearUsedCodes(): void {
    this.usedCodes.clear();
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
}

// =============================================================================
// DEVICE FINGERPRINTING
// =============================================================================

/**
 * Generate a device fingerprint for trusted device tracking
 */
export async function generateDeviceFingerprint(): Promise<DeviceFingerprint> {
  const components = [
    navigator.userAgent,
    navigator.language,
    navigator.platform,
    `${screen.width}x${screen.height}`,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    new Date().getTimezoneOffset().toString(),
  ];

  // Hash the components
  const encoder = new TextEncoder();
  const data = encoder.encode(components.join('|'));
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const id = bufferToHex(hashBuffer).substring(0, 32);

  return {
    id,
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    screenResolution: `${screen.width}x${screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    timestamp: Date.now(),
  };
}

/**
 * Check if current device matches a stored fingerprint
 */
export async function verifyDeviceFingerprint(
  storedFingerprint: DeviceFingerprint
): Promise<boolean> {
  const currentFingerprint = await generateDeviceFingerprint();
  return currentFingerprint.id === storedFingerprint.id;
}

// =============================================================================
// MFA SESSION MANAGEMENT
// =============================================================================

/**
 * MFA Session Manager
 * 
 * Tracks MFA verification state per session/device
 */
export class MfaSessionManager {
  private sessions: Map<string, MfaSession> = new Map();
  private sessionDuration: number = 30 * 60 * 1000; // 30 minutes

  /**
   * Create a new MFA session
   */
  async createSession(userId: string): Promise<MfaSession> {
    const fingerprint = await generateDeviceFingerprint();
    const session: MfaSession = {
      userId,
      deviceFingerprint: fingerprint.id,
      lastVerified: 0,
      mfaCompleted: false,
      expiresAt: Date.now() + this.sessionDuration,
    };

    const sessionKey = `${userId}:${fingerprint.id}`;
    this.sessions.set(sessionKey, session);

    return session;
  }

  /**
   * Mark MFA as completed for a session
   */
  async completeMfa(userId: string): Promise<void> {
    const fingerprint = await generateDeviceFingerprint();
    const sessionKey = `${userId}:${fingerprint.id}`;
    const session = this.sessions.get(sessionKey);

    if (session) {
      session.mfaCompleted = true;
      session.lastVerified = Date.now();
      session.expiresAt = Date.now() + this.sessionDuration;
      this.sessions.set(sessionKey, session);
    }
  }

  /**
   * Check if MFA is required for current session
   */
  async isMfaRequired(userId: string): Promise<boolean> {
    const fingerprint = await generateDeviceFingerprint();
    const sessionKey = `${userId}:${fingerprint.id}`;
    const session = this.sessions.get(sessionKey);

    if (!session) {
      return true;
    }

    if (Date.now() > session.expiresAt) {
      this.sessions.delete(sessionKey);
      return true;
    }

    return !session.mfaCompleted;
  }

  /**
   * Get session info
   */
  async getSession(userId: string): Promise<MfaSession | null> {
    const fingerprint = await generateDeviceFingerprint();
    const sessionKey = `${userId}:${fingerprint.id}`;
    return this.sessions.get(sessionKey) || null;
  }

  /**
   * Invalidate a session
   */
  async invalidateSession(userId: string): Promise<void> {
    const fingerprint = await generateDeviceFingerprint();
    const sessionKey = `${userId}:${fingerprint.id}`;
    this.sessions.delete(sessionKey);
  }

  /**
   * Invalidate all sessions for a user
   */
  invalidateAllSessions(userId: string): void {
    const keysToDelete: string[] = [];
    this.sessions.forEach((_, key) => {
      if (key.startsWith(`${userId}:`)) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach((key) => this.sessions.delete(key));
  }

  /**
   * Cleanup expired sessions
   */
  cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];
    this.sessions.forEach((session, key) => {
      if (now > session.expiresAt) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach((key) => this.sessions.delete(key));
  }
}

// =============================================================================
// SINGLETON EXPORTS
// =============================================================================

export const totpManager = new TotpManager();
export const backupCodesManager = new BackupCodesManager();
export const mfaSessionManager = new MfaSessionManager();

export default {
  TotpManager,
  BackupCodesManager,
  MfaSessionManager,
  totpManager,
  backupCodesManager,
  mfaSessionManager,
  generateDeviceFingerprint,
  verifyDeviceFingerprint,
};
