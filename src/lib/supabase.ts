import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Helper to check if Supabase is configured
export const isSupabaseConfigured = (): boolean => {
  // Vérifier que l'URL et la clé existent et ne sont pas des placeholders
  const hasValidUrl = Boolean(supabaseUrl &&
    supabaseUrl.includes('supabase') &&
    !supabaseUrl.includes('placeholder'));

  const hasValidKey = Boolean(supabaseAnonKey &&
    supabaseAnonKey.length > 10 &&
    !supabaseAnonKey.includes('placeholder'));

  const isConfigured = hasValidUrl && hasValidKey;

  if (!isConfigured) {
    console.warn('Supabase not properly configured:', {
      hasUrl: !!supabaseUrl,
      hasValidUrl,
      hasKey: !!supabaseAnonKey,
      hasValidKey
    });
  }

  return isConfigured;
};

// Create Supabase client only if configured
let supabase: SupabaseClient | null = null;

if (isSupabaseConfigured()) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
  } catch (error) {
    console.warn('Failed to initialize Supabase client:', error);
    supabase = null;
  }
}

// Export a safe getter
export const getSupabase = (): SupabaseClient | null => {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured - returning null client');
    return null;
  }
  return supabase;
};

// For backwards compatibility, export supabase (but it might be null)
export { supabase };
