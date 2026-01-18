import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { logger } from '@/services/logger';

// Configuration Supabase - approche simplifiée
// On utilise des valeurs par défaut et on les met à jour plus tard
let supabaseUrl = 'https://placeholder.supabase.co';
let supabaseKey = 'placeholder-key';
let supabaseClient: SupabaseClient | null = null;

// Charger la configuration au démarrage
async function loadSupabaseConfig() {
  try {
    const response = await fetch('/api/config');
    if (response.ok) {
      const config = await response.json();
      if (config.VITE_SUPABASE_URL && config.VITE_SUPABASE_ANON_KEY) {
        supabaseUrl = config.VITE_SUPABASE_URL;
        supabaseKey = config.VITE_SUPABASE_ANON_KEY;

        // Recréer le client avec les vraies valeurs
        supabaseClient = createClient(supabaseUrl, supabaseKey);
        logger.debug('Supabase client updated with real config');
        return true;
      }
    }
  } catch (error) {
    logger.warn('Could not load Supabase config from API', { error });
  }
  return false;
}

// Initialiser avec des valeurs par défaut
supabaseClient = createClient(supabaseUrl, supabaseKey);

// Charger la vraie config en arrière-plan
loadSupabaseConfig();

// Helper to check if Supabase is configured
export const isSupabaseConfigured = (): boolean => {
  return supabaseUrl !== 'https://placeholder.supabase.co' && supabaseKey !== 'placeholder-key';
};

// Create Supabase client only if configured
export const getSupabase = (): SupabaseClient | null => {
  if (!isSupabaseConfigured()) {
    logger.warn('Supabase not configured - returning null client');
    return null;
  }
  return supabaseClient;
};

// For backwards compatibility
export { supabaseClient as supabase };
