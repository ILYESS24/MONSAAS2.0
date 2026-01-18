/**
 * Supabase Client Configuration
 * 
 * Provides a configured Supabase client instance with proper type safety.
 * 
 * SECURITY: All credentials must be provided via environment variables.
 * Never commit API keys to source control.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { logger, securityLogger } from './logger';
import type { Database } from '@/types/supabase';

// Environment variables - REQUIRED, no fallbacks for security
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate configuration on load
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  if (import.meta.env.PROD) {
    securityLogger.error('Supabase configuration missing in production', {
      hasUrl: !!SUPABASE_URL,
      hasKey: !!SUPABASE_ANON_KEY,
    });
  }
}

// Singleton instance
let supabaseInstance: SupabaseClient<Database> | null = null;

/**
 * Check if Supabase is configured
 */
export function isSupabaseConfigured(): boolean {
  return !!(SUPABASE_URL && SUPABASE_ANON_KEY);
}

/**
 * Get Supabase client instance
 * Returns null if not configured (for graceful degradation)
 */
export function getSupabaseClient(): SupabaseClient<Database> | null {
  if (!isSupabaseConfigured()) {
    logger.warn('Supabase is not configured. Some features may be unavailable.');
    return null;
  }

  if (!supabaseInstance) {
    supabaseInstance = createClient<Database>(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
      global: {
        headers: {
          'x-application-name': 'aurion-studio',
        },
      },
    });
    
    logger.info('Supabase client initialized');
  }

  return supabaseInstance;
}

/**
 * Get authenticated Supabase client with user token
 */
export function getAuthenticatedSupabaseClient(accessToken: string): SupabaseClient<Database> | null {
  if (!isSupabaseConfigured()) {
    return null;
  }

  return createClient<Database>(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });
}

// Export singleton
export const supabase = getSupabaseClient();

export default {
  getSupabaseClient,
  getAuthenticatedSupabaseClient,
  isSupabaseConfigured,
  supabase,
};
