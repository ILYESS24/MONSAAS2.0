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
  version: '2.0.0',
  description: 'AI-Powered Development Platform - Build faster with intelligent tools',
  author: 'Aurion Team',
  supportEmail: 'support@aurion.studio',
  legalEmail: 'legal@aurion.studio',
  website: 'https://aurion.studio',
  social: {
    twitter: '@aurionstudio',
    github: 'https://github.com/aurion-studio',
    linkedin: 'https://linkedin.com/company/aurion-studio',
  },
} as const;

/**
 * Feature flags - control feature availability
 * Use environment variables to toggle features
 */
export const FEATURES = {
  // Analytics & Monitoring
  ANALYTICS_ENABLED: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  ERROR_REPORTING_ENABLED: import.meta.env.VITE_ENABLE_ERROR_REPORTING === 'true',
  PERFORMANCE_MONITORING_ENABLED: import.meta.env.VITE_ENABLE_PERFORMANCE_MONITORING === 'true',
  
  // Application Modes
  DEMO_MODE_ENABLED: !import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
  DEBUG_MODE_ENABLED: import.meta.env.DEV || import.meta.env.VITE_DEBUG_MODE === 'true',
  
  // Feature Toggles
  ENABLE_PWA: import.meta.env.VITE_ENABLE_PWA === 'true',
  ENABLE_OFFLINE_MODE: import.meta.env.VITE_ENABLE_OFFLINE_MODE === 'true',
  ENABLE_MULTI_TENANT: import.meta.env.VITE_ENABLE_MULTI_TENANT === 'true',
  ENABLE_DARK_MODE: true,
  ENABLE_SOUND_ALERTS: true,
  ENABLE_KEYBOARD_SHORTCUTS: true,
  
  // Tools Availability
  ENABLE_CODE_EDITOR: true,
  ENABLE_APP_BUILDER: true,
  ENABLE_AGENT_AI: true,
  ENABLE_AURION_CHAT: true,
  ENABLE_TEXT_EDITOR: true,
  ENABLE_INTELLIGENT_CANVAS: true,
  ENABLE_WORKFLOWS: true,
  ENABLE_MONITORING: true,
} as const;

/**
 * API configuration
 */
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || '/api',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
  MAX_RETRY_DELAY: 30000,
  CACHE_TTL: 5 * 60 * 1000, // 5 minutes
  STALE_TTL: 1 * 60 * 1000, // 1 minute
} as const;

/**
 * Authentication configuration
 */
export const AUTH_CONFIG = {
  SIGN_IN_PATH: '/sign-in',
  SIGN_UP_PATH: '/sign-up',
  AFTER_SIGN_IN_PATH: '/dashboard',
  AFTER_SIGN_UP_PATH: '/dashboard',
  FORGOT_PASSWORD_PATH: '/forgot-password',
  VERIFY_EMAIL_PATH: '/verify-email',
  SESSION_STORAGE_KEY: 'aurion_session',
} as const;

/**
 * Dashboard configuration
 */
export const DASHBOARD_CONFIG = {
  STATS_REFRESH_INTERVAL: 30000, // 30 seconds
  ACTIVITY_REFRESH_INTERVAL: 45000, // 45 seconds
  TIME_REFRESH_INTERVAL: 1000, // 1 second
  MAX_RECENT_PROJECTS: 6,
  MAX_RECENT_ACTIVITIES: 10,
  CHART_ANIMATION_DURATION: 300,
} as const;

/**
 * Security configuration
 */
export const SECURITY_CONFIG = {
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_REQUIRE_UPPERCASE: true,
  PASSWORD_REQUIRE_LOWERCASE: true,
  PASSWORD_REQUIRE_NUMBER: true,
  PASSWORD_REQUIRE_SPECIAL: true,
  MFA_CODE_LENGTH: 6,
  MFA_CODE_EXPIRY: 30, // seconds
  CSRF_TOKEN_EXPIRY: 60 * 60 * 1000, // 1 hour
  JWT_ACCESS_TOKEN_EXPIRY: '15m',
  JWT_REFRESH_TOKEN_EXPIRY: '7d',
} as const;

/**
 * Storage configuration
 */
export const STORAGE_CONFIG = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10 MB
  ALLOWED_FILE_TYPES: ['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.txt', '.md', '.json'],
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  UPLOAD_CHUNK_SIZE: 1024 * 1024, // 1 MB chunks for large files
  LOCAL_STORAGE_PREFIX: 'aurion_',
} as const;

/**
 * UI configuration
 */
export const UI_CONFIG = {
  TOAST_DURATION: 5000,
  MODAL_ANIMATION_DURATION: 200,
  SIDEBAR_WIDTH: 280,
  SIDEBAR_COLLAPSED_WIDTH: 80,
  HEADER_HEIGHT: 64,
  FOOTER_HEIGHT: 56,
  MOBILE_BREAKPOINT: 768,
  TABLET_BREAKPOINT: 1024,
  DESKTOP_BREAKPOINT: 1280,
} as const;

/**
 * Performance configuration
 */
export const PERFORMANCE_CONFIG = {
  DEBOUNCE_DELAY: 300,
  THROTTLE_DELAY: 100,
  LAZY_LOAD_THRESHOLD: 100,
  INTERSECTION_OBSERVER_MARGIN: '50px',
  VIRTUAL_LIST_OVERSCAN: 5,
} as const;

/**
 * Localization configuration
 */
export const LOCALE_CONFIG = {
  DEFAULT_LOCALE: 'fr',
  SUPPORTED_LOCALES: ['fr', 'en'] as const,
  CURRENCY: 'EUR',
  DATE_FORMAT: 'DD/MM/YYYY',
  TIME_FORMAT: 'HH:mm',
  TIMEZONE: 'Europe/Paris',
} as const;

/**
 * SEO configuration
 */
export const SEO_CONFIG = {
  SITE_NAME: 'Aurion Studio',
  SITE_URL: 'https://aurion.studio',
  DEFAULT_TITLE: 'Aurion Studio - Plateforme de Développement IA',
  DEFAULT_DESCRIPTION: 'Plateforme SaaS tout-en-un avec éditeur de code, App Builder, Agent AI intelligent et plus. Boostez votre productivité avec des outils propulsés par l\'IA.',
  DEFAULT_KEYWORDS: ['saas', 'ia', 'développement', 'code editor', 'app builder', 'agent ai', 'productivité'],
  TWITTER_HANDLE: '@aurionstudio',
  OG_IMAGE: '/og-image.png',
  OG_IMAGE_WIDTH: 1200,
  OG_IMAGE_HEIGHT: 630,
} as const;

/**
 * Helper to check if a feature is enabled
 */
export function isFeatureEnabled(feature: keyof typeof FEATURES): boolean {
  return FEATURES[feature] === true;
}

/**
 * Helper to get configuration for a specific environment
 */
export function getConfigForEnv<T>(devValue: T, prodValue: T): T {
  return import.meta.env.DEV ? devValue : prodValue;
}

export default {
  APP_CONFIG,
  FEATURES,
  API_CONFIG,
  AUTH_CONFIG,
  DASHBOARD_CONFIG,
  SECURITY_CONFIG,
  STORAGE_CONFIG,
  UI_CONFIG,
  PERFORMANCE_CONFIG,
  LOCALE_CONFIG,
  SEO_CONFIG,
  isFeatureEnabled,
  getConfigForEnv,
};
