/**
 * Supabase Client Configuration
 * 
 * Provides a configured Supabase client instance with proper type safety.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { logger } from './logger';
import type { Database } from '@/types/supabase';

// Environment variables - with production fallback for demo
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ||
  (import.meta.env.PROD ? 'https://otxxjczxwhtngcferckz.supabase.co' : undefined);
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY ||
  (import.meta.env.PROD ? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90eHhqY3p4d2h0bmdjZmVyY2t6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU2NDcxOTEsImV4cCI6MjA4MTIyMzE5MX0.B4A300qQZCwP-aG4J29KfeazJM_Pp1eHKXQ98_bLMw8' : undefined);

// Clerk configuration - use demo key in production for testing
const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ||
  (import.meta.env.PROD ? 'pk_test_Y2xlcmsuYXVyaW9uLXN0dWRpby5kZXYk' : undefined);

export { CLERK_PUBLISHABLE_KEY };

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
