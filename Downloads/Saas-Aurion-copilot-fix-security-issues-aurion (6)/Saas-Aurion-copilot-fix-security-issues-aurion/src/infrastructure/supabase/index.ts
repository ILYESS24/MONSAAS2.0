/**
 * @module infrastructure/supabase
 * @description Supabase client and utilities
 */

// Re-export from existing lib
export { supabase } from '@/lib/supabase';

// Re-export database services
export {
  profileService,
  creditsService,
  planService,
  dashboardService,
} from '@/services/supabase-db';
