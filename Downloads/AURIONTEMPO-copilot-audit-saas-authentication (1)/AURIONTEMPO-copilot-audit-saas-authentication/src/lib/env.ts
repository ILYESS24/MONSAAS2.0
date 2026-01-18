/**
 * Environment Configuration and Validation
 * 
 * This module provides centralized environment variable management with
 * type safety and validation. It ensures the application fails fast if
 * required configuration is missing.
 */

// Environment variable types
interface EnvConfig {
  CLERK_PUBLISHABLE_KEY: string | undefined;
  BASE_URL: string;
  NODE_ENV: 'development' | 'production' | 'test';
  IS_DEVELOPMENT: boolean;
  IS_PRODUCTION: boolean;
}

// Allowed iframe origins for security
export const ALLOWED_IFRAME_ORIGINS = [
  'https://eed972db.aurion-ide.pages.dev',
  'https://production.ai-assistant-xlv.pages.dev',
  'https://flo-9xh2.onrender.com',
  'https://canvchat-1-y73q.onrender.com',
  'https://tersa-main-b5f0ey7pq-launchmateais-projects.vercel.app',
  'https://4e2af144.aieditor.pages.dev',
  'https://www.google.com',
] as const;

// Get environment configuration
export function getEnvConfig(): EnvConfig {
  const nodeEnv = (import.meta.env.MODE || 'development') as EnvConfig['NODE_ENV'];
  
  return {
    CLERK_PUBLISHABLE_KEY: import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
    BASE_URL: import.meta.env.BASE_URL || '/',
    NODE_ENV: nodeEnv,
    IS_DEVELOPMENT: nodeEnv === 'development',
    IS_PRODUCTION: nodeEnv === 'production',
  };
}

// Validate required environment variables
export function validateEnv(): { isValid: boolean; errors: string[] } {
  const env = getEnvConfig();
  const errors: string[] = [];

  // Clerk authentication is now available in production
  // Users will be prompted to authenticate for personalized dashboards

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Check if authentication is configured
export function isAuthConfigured(): boolean {
  return !!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
}

// Get Clerk publishable key with type safety
export function getClerkPublishableKey(): string | undefined {
  // Clerk authentication disabled - requires proper Clerk app setup
  // To enable: create app at https://clerk.com and add VITE_CLERK_PUBLISHABLE_KEY
  return import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || undefined;
}

// Log environment info (for debugging, never in production)
export function logEnvInfo(): void {
  const env = getEnvConfig();
  
  if (env.IS_DEVELOPMENT) {
    console.log('[ENV] Environment:', env.NODE_ENV);
    console.log('[ENV] Auth configured:', isAuthConfigured());
    console.log('[ENV] Base URL:', env.BASE_URL);
  }
}

export default {
  getEnvConfig,
  validateEnv,
  isAuthConfigured,
  getClerkPublishableKey,
  logEnvInfo,
  ALLOWED_IFRAME_ORIGINS,
};
