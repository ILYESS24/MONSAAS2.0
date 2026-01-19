/**
 * Input Sanitization Module
 * 
 * Provides comprehensive input sanitization to prevent:
 * - Cross-Site Scripting (XSS)
 * - SQL Injection
 * - NoSQL Injection
 * - Command Injection
 * - Path Traversal
 * 
 * @module security/sanitization
 */

// =============================================================================
// TYPES
// =============================================================================

export interface SanitizationOptions {
  allowHtml?: boolean;
  allowedTags?: string[];
  maxLength?: number;
  trimWhitespace?: boolean;
  removeNewlines?: boolean;
}

export interface SqlSanitizationOptions {
  allowedOperators?: string[];
  maxLength?: number;
}

// =============================================================================
// HTML SANITIZATION
// =============================================================================

/**
 * HTML entities mapping for escaping
 */
const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;',
};

/**
 * Escape HTML special characters to prevent XSS
 */
export function escapeHtml(input: string): string {
  return input.replace(/[&<>"'`=/]/g, (char) => HTML_ENTITIES[char] || char);
}

/**
 * Strip all HTML tags from a string
 * Uses iterative replacement to handle nested/malformed tags
 */
export function stripHtml(input: string): string {
  let result = input;
  let previousResult = '';
  
  // Iterate until no more tags are found (handles nested tags)
  while (result !== previousResult) {
    previousResult = result;
    result = result.replace(/<[^>]*>/g, '');
  }
  
  // Also handle unclosed tags
  result = result.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  
  return result;
}

/**
 * Sanitize HTML with allowed tags (whitelist approach)
 */
export function sanitizeHtml(
  input: string,
  allowedTags: string[] = ['b', 'i', 'em', 'strong', 'p', 'br']
): string {
  // First, escape everything
  let result = escapeHtml(input);

  // Then, unescape allowed tags
  for (const tag of allowedTags) {
    const openTag = new RegExp(`&lt;(${tag})(&gt;|\\s[^&]*&gt;)`, 'gi');
    const closeTag = new RegExp(`&lt;\\/${tag}&gt;`, 'gi');

    // Use replacement function to properly handle captured groups
    result = result.replace(openTag, (_match, tagName, rest) => {
      const unescapedRest = rest.replace(/&gt;/g, '>');
      return `<${tagName}${unescapedRest}`;
    });
    result = result.replace(closeTag, `</${tag}>`);
  }

  return result;
}

// =============================================================================
// SQL INJECTION PREVENTION
// =============================================================================

/**
 * Characters that are dangerous in SQL contexts
 * Note: Semicolons are handled separately to avoid breaking legitimate queries
 */
const SQL_DANGEROUS_CHARS = /['"\\-]/g;

/**
 * Common SQL injection patterns
 */
const SQL_INJECTION_PATTERNS = [
  /(\s|^)(union|select|insert|update|delete|drop|truncate|exec|execute)(\s|$)/i,
  /--/,
  /\/\*/,
  /\*\//,
  /;\s*(union|select|insert|update|delete|drop|truncate|exec|execute)/i, // Dangerous semicolon patterns
  /xp_/i,
  /0x[0-9a-fA-F]+/,
];

/**
 * Escape special characters for SQL
 * Note: Always use parameterized queries when possible
 */
export function escapeSql(input: string): string {
  return input.replace(SQL_DANGEROUS_CHARS, (char) => {
    switch (char) {
      case "'":
        return "''";
      case '"':
        return '""';
      case '\\':
        return '\\\\';
      case '-':
        return '\\-';
      default:
        return char;
    }
  });
}

/**
 * Check if input contains SQL injection patterns
 */
export function hasSqlInjection(input: string): boolean {
  return SQL_INJECTION_PATTERNS.some((pattern) => pattern.test(input));
}

/**
 * Sanitize input for SQL queries
 */
export function sanitizeSql(input: string, options?: SqlSanitizationOptions): string {
  const { maxLength = 1000 } = options || {};

  // Check for injection patterns
  if (hasSqlInjection(input)) {
    throw new Error('Potential SQL injection detected');
  }

  // Truncate if needed
  let result = input.slice(0, maxLength);

  // Escape special characters
  result = escapeSql(result);

  return result;
}

// =============================================================================
// NOSQL INJECTION PREVENTION
// =============================================================================

/**
 * NoSQL injection patterns
 */
const NOSQL_DANGEROUS_KEYS = ['$where', '$gt', '$lt', '$gte', '$lte', '$ne', '$in', '$nin', '$or', '$and', '$not', '$regex'];

/**
 * Check if object contains NoSQL injection patterns
 */
export function hasNoSqlInjection(input: unknown): boolean {
  if (typeof input === 'string') {
    // Check for MongoDB operators in strings
    return NOSQL_DANGEROUS_KEYS.some((key) => input.includes(key));
  }

  if (typeof input === 'object' && input !== null) {
    for (const key of Object.keys(input)) {
      if (NOSQL_DANGEROUS_KEYS.includes(key)) {
        return true;
      }
      if (hasNoSqlInjection((input as Record<string, unknown>)[key])) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Sanitize input for NoSQL queries
 */
export function sanitizeNoSql<T extends object>(input: T): T {
  if (hasNoSqlInjection(input)) {
    throw new Error('Potential NoSQL injection detected');
  }
  return input;
}

// =============================================================================
// PATH TRAVERSAL PREVENTION
// =============================================================================

/**
 * Path traversal patterns
 */
const PATH_TRAVERSAL_PATTERNS = [
  /\.\./,
  /%2e%2e/i,
  /%252e%252e/i,
  /\.%2e/i,
  /%2e\./i,
];

/**
 * Check if path contains traversal patterns
 */
export function hasPathTraversal(path: string): boolean {
  return PATH_TRAVERSAL_PATTERNS.some((pattern) => pattern.test(path));
}

/**
 * Sanitize file paths
 */
export function sanitizePath(path: string, basePath?: string): string {
  // Remove null bytes
  let result = path.replace(/\0/g, '');

  // Check for traversal
  if (hasPathTraversal(result)) {
    throw new Error('Path traversal attempt detected');
  }

  // Normalize path separators
  result = result.replace(/\\/g, '/');

  // Remove leading slashes for relative paths
  if (basePath) {
    result = result.replace(/^\/+/, '');
    // Ensure path stays within base
    const fullPath = `${basePath}/${result}`;
    if (!fullPath.startsWith(basePath)) {
      throw new Error('Path escapes base directory');
    }
  }

  return result;
}

// =============================================================================
// COMMAND INJECTION PREVENTION
// =============================================================================

/**
 * Dangerous shell characters
 */
const SHELL_DANGEROUS_CHARS = /[;&|`$(){}[\]<>\\!]/g;

/**
 * Escape shell special characters
 */
export function escapeShell(input: string): string {
  return input.replace(SHELL_DANGEROUS_CHARS, '\\$&');
}

/**
 * Check for command injection patterns
 */
export function hasCommandInjection(input: string): boolean {
  const patterns = [
    /[;&|`$]/,
    /\$\(/,
    /`[^`]*`/,
    /\|\|/,
    /&&/,
  ];
  return patterns.some((pattern) => pattern.test(input));
}

/**
 * Sanitize input for shell commands
 */
export function sanitizeCommand(input: string): string {
  if (hasCommandInjection(input)) {
    throw new Error('Potential command injection detected');
  }
  return escapeShell(input);
}

// =============================================================================
// URL SANITIZATION
// =============================================================================

/**
 * Dangerous URL protocols
 */
const DANGEROUS_PROTOCOLS = ['javascript:', 'data:', 'vbscript:', 'file:'];

/**
 * Check if URL uses a dangerous protocol
 */
export function hasDangerousProtocol(url: string): boolean {
  const lowercaseUrl = url.toLowerCase().trim();
  return DANGEROUS_PROTOCOLS.some((proto) => lowercaseUrl.startsWith(proto));
}

/**
 * Sanitize URL to prevent XSS
 */
export function sanitizeUrl(url: string): string {
  const trimmed = url.trim();

  if (hasDangerousProtocol(trimmed)) {
    return 'about:blank';
  }

  // Encode special characters
  try {
    const parsed = new URL(trimmed);
    return parsed.href;
  } catch {
    // If not a valid URL, escape it
    return escapeHtml(trimmed);
  }
}

// =============================================================================
// GENERAL SANITIZATION
// =============================================================================

/**
 * General purpose input sanitizer
 */
export function sanitizeInput(input: string, options?: SanitizationOptions): string {
  const {
    allowHtml = false,
    allowedTags = [],
    maxLength = 10000,
    trimWhitespace = true,
    removeNewlines = false,
  } = options || {};

  let result = input;

  // Trim whitespace
  if (trimWhitespace) {
    result = result.trim();
  }

  // Remove newlines if needed
  if (removeNewlines) {
    result = result.replace(/[\r\n]/g, ' ');
  }

  // Truncate to max length
  result = result.slice(0, maxLength);

  // Handle HTML
  if (!allowHtml) {
    result = escapeHtml(result);
  } else if (allowedTags.length > 0) {
    result = sanitizeHtml(result, allowedTags);
  }

  // Remove null bytes
  result = result.replace(/\0/g, '');

  return result;
}

/**
 * Sanitize an object's string values recursively
 */
export function sanitizeObject<T extends object>(
  obj: T,
  options?: SanitizationOptions
): T {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      result[key] = sanitizeInput(value, options);
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      result[key] = sanitizeObject(value as object, options);
    } else if (Array.isArray(value)) {
      result[key] = value.map((item) =>
        typeof item === 'string'
          ? sanitizeInput(item, options)
          : typeof item === 'object' && item !== null
          ? sanitizeObject(item, options)
          : item
      );
    } else {
      result[key] = value;
    }
  }

  return result as T;
}

// =============================================================================
// SINGLETON EXPORT
// =============================================================================

export const sanitizer = {
  escapeHtml,
  stripHtml,
  sanitizeHtml,
  escapeSql,
  hasSqlInjection,
  sanitizeSql,
  hasNoSqlInjection,
  sanitizeNoSql,
  hasPathTraversal,
  sanitizePath,
  escapeShell,
  hasCommandInjection,
  sanitizeCommand,
  hasDangerousProtocol,
  sanitizeUrl,
  sanitizeInput,
  sanitizeObject,
};

export default sanitizer;
