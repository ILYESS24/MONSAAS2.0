/**
 * @module config
 * @description Application configuration
 */

// Environment configuration
export const config = {
  // API URLs
  api: {
    supabase: import.meta.env.VITE_SUPABASE_URL,
    freepik: 'https://api.freepik.com/v1',
  },
  
  // Feature flags
  features: {
    videoGeneration: true,
    imageGeneration: true,
    aiChat: true,
    codeGeneration: true,
    agents: true,
  },
  
  // Rate limiting
  rateLimit: {
    imageGenerationsPerMinute: 5,
    videoGenerationsPerMinute: 2,
    chatMessagesPerMinute: 30,
  },
  
  // UI configuration
  ui: {
    defaultTheme: 'dark' as const,
    animationsEnabled: true,
  },
} as const;

// Environment variables type
export type Config = typeof config;
