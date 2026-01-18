/**
 * Application Configuration
 * 
 * Centralized configuration management for the entire application.
 * All configuration values should be imported from here.
 */

export { getEnvConfig, validateEnv, logEnvInfo, getClerkPublishableKey } from '@/lib/env';

/**
 * Application metadata
 */
export const APP_CONFIG = {
  name: 'Aurion Studio',
  version: '1.0.0',
  description: 'AI-Powered Development Platform',
  author: 'Aurion Team',
} as const;

/**
 * Feature flags
 */
export const FEATURES = {
  ANALYTICS_ENABLED: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  ERROR_REPORTING_ENABLED: import.meta.env.VITE_ENABLE_ERROR_REPORTING === 'true',
  PERFORMANCE_MONITORING_ENABLED: import.meta.env.VITE_ENABLE_PERFORMANCE_MONITORING === 'true',
  DEMO_MODE_ENABLED: !import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
} as const;

/**
 * API configuration
 */
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || '/api',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
} as const;

/**
 * Authentication configuration
 */
export const AUTH_CONFIG = {
  SIGN_IN_PATH: '/sign-in',
  SIGN_UP_PATH: '/sign-up',
  AFTER_SIGN_IN_PATH: '/dashboard',
  AFTER_SIGN_UP_PATH: '/dashboard',
} as const;

/**
 * Dashboard configuration
 */
export const DASHBOARD_CONFIG = {
  STATS_REFRESH_INTERVAL: 30000, // 30 seconds
  ACTIVITY_REFRESH_INTERVAL: 45000, // 45 seconds
  TIME_REFRESH_INTERVAL: 1000, // 1 second
} as const;

/**
 * Security configuration
 */
export const SECURITY_CONFIG = {
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
} as const;

export default {
  APP_CONFIG,
  FEATURES,
  API_CONFIG,
  AUTH_CONFIG,
  DASHBOARD_CONFIG,
  SECURITY_CONFIG,
};
