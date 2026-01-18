/**
 * Encryption Module
 * 
 * Provides client-side encryption utilities using Web Crypto API.
 * Note: For truly sensitive data, always encrypt on the server.
 * 
 * @module security/encryption
 */

// =============================================================================
// TYPES
// =============================================================================

export interface EncryptedData {
  ciphertext: string;
  iv: string;
  salt: string;
  algorithm: string;
}

export interface EncryptionConfig {
  algorithm?: 'AES-GCM' | 'AES-CBC';
  keyLength?: 128 | 192 | 256;
  iterations?: number;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const DEFAULT_CONFIG: Required<EncryptionConfig> = {
  algorithm: 'AES-GCM',
  keyLength: 256,
  iterations: 100000,
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Convert ArrayBuffer to base64 string
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Convert base64 string to ArrayBuffer
 */
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Generate a random salt or IV
 */
function generateRandomBytes(length: number): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(length));
}

/**
 * Derive encryption key from password using PBKDF2
 */
async function deriveKey(
  password: string,
  salt: Uint8Array,
  config: Required<EncryptionConfig>
): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);

  // Import password as key
  const baseKey = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    'PBKDF2',
    false,
    ['deriveKey']
  );

  // Derive the actual encryption key
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: config.iterations,
      hash: 'SHA-256',
    },
    baseKey,
    {
      name: config.algorithm,
      length: config.keyLength,
    },
    false,
    ['encrypt', 'decrypt']
  );
}

// =============================================================================
// ENCRYPTION CLASS
// =============================================================================

/**
 * DataEncryption - Client-side encryption using Web Crypto API
 * 
 * @example
 * ```typescript
 * const encryption = new DataEncryption();
 * const encrypted = await encryption.encrypt('sensitive data', 'user-password');
 * const decrypted = await encryption.decrypt(encrypted, 'user-password');
 * ```
 */
export class DataEncryption {
  private config: Required<EncryptionConfig>;

  constructor(config?: EncryptionConfig) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Encrypt data with a password
   */
  async encrypt(plaintext: string, password: string): Promise<EncryptedData> {
    const encoder = new TextEncoder();
    const data = encoder.encode(plaintext);

    // Generate salt and IV
    const salt = generateRandomBytes(16);
    const iv = generateRandomBytes(12); // 12 bytes for GCM, 16 for CBC

    // Derive key from password
    const key = await deriveKey(password, salt, this.config);

    // Encrypt the data
    const ciphertext = await crypto.subtle.encrypt(
      {
        name: this.config.algorithm,
        iv: iv,
        ...(this.config.algorithm === 'AES-GCM' ? { tagLength: 128 } : {}),
      },
      key,
      data
    );

    return {
      ciphertext: arrayBufferToBase64(ciphertext),
      iv: arrayBufferToBase64(iv),
      salt: arrayBufferToBase64(salt),
      algorithm: this.config.algorithm,
    };
  }

  /**
   * Decrypt data with a password
   */
  async decrypt(encryptedData: EncryptedData, password: string): Promise<string> {
    const salt = new Uint8Array(base64ToArrayBuffer(encryptedData.salt));
    const iv = new Uint8Array(base64ToArrayBuffer(encryptedData.iv));
    const ciphertext = base64ToArrayBuffer(encryptedData.ciphertext);

    // Derive key from password
    const key = await deriveKey(password, salt, this.config);

    // Decrypt the data
    const decrypted = await crypto.subtle.decrypt(
      {
        name: encryptedData.algorithm || this.config.algorithm,
        iv: iv,
        ...(this.config.algorithm === 'AES-GCM' ? { tagLength: 128 } : {}),
      },
      key,
      ciphertext
    );

    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  }

  /**
   * Hash a value using SHA-256 (for content hashing, not passwords)
   */
  async hash(value: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(value);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return arrayBufferToBase64(hashBuffer);
  }

  /**
   * Generate a secure random token
   */
  generateToken(length: number = 32): string {
    const bytes = generateRandomBytes(length);
    return arrayBufferToBase64(bytes.buffer);
  }

  /**
   * Compare two strings in constant time to prevent timing attacks
   */
  constantTimeCompare(a: string, b: string): boolean {
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
// FIELD-LEVEL ENCRYPTION
// =============================================================================

/**
 * Field-level encryption for sensitive database columns
 */
export class FieldEncryption {
  private encryption: DataEncryption;
  private masterKey: string;

  constructor(masterKey: string) {
    this.encryption = new DataEncryption();
    this.masterKey = masterKey;
  }

  /**
   * Encrypt a field value
   */
  async encryptField(value: string, fieldKey?: string): Promise<string> {
    const key = fieldKey ? `${this.masterKey}:${fieldKey}` : this.masterKey;
    const encrypted = await this.encryption.encrypt(value, key);
    return JSON.stringify(encrypted);
  }

  /**
   * Decrypt a field value
   */
  async decryptField(encryptedValue: string, fieldKey?: string): Promise<string> {
    const key = fieldKey ? `${this.masterKey}:${fieldKey}` : this.masterKey;
    const encrypted = JSON.parse(encryptedValue) as EncryptedData;
    return this.encryption.decrypt(encrypted, key);
  }

  /**
   * Check if a value is encrypted
   */
  isEncrypted(value: string): boolean {
    try {
      const parsed = JSON.parse(value);
      return (
        typeof parsed === 'object' &&
        'ciphertext' in parsed &&
        'iv' in parsed &&
        'salt' in parsed
      );
    } catch {
      return false;
    }
  }
}

// =============================================================================
// SINGLETON EXPORTS
// =============================================================================

export const dataEncryption = new DataEncryption();

export default {
  DataEncryption,
  FieldEncryption,
  dataEncryption,
};
