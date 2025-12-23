// ============================================
// SHARED CONSTANTS FOR BACKEND API FUNCTIONS
// ============================================
//
// Centralized configuration for all backend API endpoints.
// This file ensures consistency across all Cloudflare Functions.
//
// NOTE: There are TWO tool ID formats:
//   1. Hyphenated (iframe tools): 'app-builder', 'code-editor'
//   2. Underscore (API tools): 'ai_chat', 'image_generation'
// ============================================

/**
 * Tool costs in credits for IFRAME tools (hyphenated IDs)
 * These are the tools accessed via /tools/:toolId routes
 */
export const IFRAME_TOOL_COSTS: Record<string, number> = {
  'app-builder': 50,
  'website-builder': 50,
  'ai-agents': 30,
  'text-editor': 5,
  'code-editor': 10,
  'content-generator': 15,
};

/**
 * Tool costs in credits for API tools (underscore IDs)
 * Must match frontend TOOL_COSTS in @/types/plans.ts
 */
export const API_TOOL_COSTS: Record<string, number> = {
  'image_generation': 10,
  'video_generation': 50,
  'code_generation': 5,
  'ai_chat': 1,
  'agent_builder': 20,
  'app_builder': 100,
  'website_builder': 50,
  'text_editor': 0,
};

/**
 * Combined tool costs - supports both naming formats
 */
// ============================================
// CENTRALIZED CONSTANTS FOR CLOUDFLARE FUNCTIONS
// SINGLE SOURCE OF TRUTH - NO DUPLICATION ALLOWED
// ============================================

// ⚠️  WARNING: DO NOT DUPLICATE THESE CONSTANTS
// All tool costs should be imported from @/types/plans.ts in frontend
// Backend functions should import from this file only

export const TOOL_COSTS: Record<string, number> = {
  // Iframe tools (hyphenated)
  'app-builder': 50,
  'website-builder': 50,
  'ai-agents': 30,
  'text-editor': 5,
  'code-editor': 10,
  'content-generator': 15,
  // API tools (underscore)
  'image_generation': 10,
  'video_generation': 50,
  'code_generation': 5,
  'ai_chat': 1,
  'agent_builder': 20,
  'app_builder': 100,
  'website_builder': 50,
  // Explicit zero for text_editor
  'text_editor': 0,
};

/**
 * External tool URLs for iframe embedding
 */
export const TOOL_URLS: Record<string, string> = {
  'app-builder': 'https://aurion-app-v2.pages.dev/',
  'website-builder': 'https://790d4da4.ai-assistant-xlv.pages.dev',
  'ai-agents': 'https://flo-1-2ba8.onrender.com',
  'text-editor': 'https://aieditor-do0wmlcpa-ibagencys-projects.vercel.app',
  'code-editor': 'https://790d4da4.ai-assistant-xlv.pages.dev',
  'content-generator': 'https://790d4da4.ai-assistant-xlv.pages.dev',
};

/**
 * Default allowed origins for CORS
 */
export const DEFAULT_ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://aurion.app',
  'https://www.aurion.app',
  'https://genim.app',
  'https://www.genim.app',
];

/**
 * Rate limiting configuration
 */
export const RATE_LIMITS = {
  ai_chat: { requests: 30, windowSeconds: 60 },    // 30 req/min
  image_generation: { requests: 10, windowSeconds: 60 }, // 10 req/min
  tool_access: { requests: 20, windowSeconds: 60 }, // 20 req/min
  default: { requests: 60, windowSeconds: 60 },     // 60 req/min
};

/**
 * Session configuration
 */
export const SESSION_CONFIG = {
  tokenExpirationHours: 24,
  maxActiveSessionsPerTool: 3,
};
