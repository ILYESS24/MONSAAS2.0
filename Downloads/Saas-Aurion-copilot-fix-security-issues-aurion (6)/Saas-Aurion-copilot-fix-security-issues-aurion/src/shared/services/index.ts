/**
 * @module shared/services
 * @description Shared services exports
 */

// Re-export from existing services
export { logger } from '@/services/logger';
export { securityMonitor } from '@/services/security-monitor';
export { monitoring } from '@/services/monitoring';
export { SaaSError, ERROR_MESSAGES } from '@/services/error-handler';
