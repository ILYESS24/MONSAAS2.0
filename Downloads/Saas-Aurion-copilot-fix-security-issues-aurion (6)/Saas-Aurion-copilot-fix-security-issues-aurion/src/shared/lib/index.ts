/**
 * @module shared/lib
 * @description Shared utility library exports
 */

// Re-export from existing lib
export { cn } from '@/lib/utils';
export { sanitizeString, sanitizeHtml, sanitizeEmail, sanitizeUrl, sanitizeObject } from '@/lib/sanitize';
export { circuitBreaker, ApiError } from '@/lib/circuit-breaker';
export { realtimeManager } from '@/lib/realtime-manager';
export * from '@/lib/validation';
