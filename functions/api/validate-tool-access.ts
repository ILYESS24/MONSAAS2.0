/* eslint-disable @typescript-eslint/no-explicit-any */
// ============================================
// VALIDATE TOOL ACCESS - VERSION SIMPLE
// POST /api/validate-tool-access
// ============================================

import { TOOL_URLS } from '../middleware/constants';

interface Env {
  SUPABASE_URL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
}

// Headers CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Content-Type': 'application/json',
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const body = await context.request.json() as { toolId: string };
    const { toolId } = body;

    if (!toolId) {
      return new Response(
        JSON.stringify({ error: 'Tool ID required' }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Retourner toujours succès sans vérification
    return new Response(
      JSON.stringify({
        success: true,
        toolUrl: TOOL_URLS[toolId] || 'https://example.com',
        sessionToken: 'no-auth-token-' + Date.now(),
        creditsUsed: 0,
        remainingCredits: 99999,
        message: 'Tool access granted (no auth required)'
      }),
      { status: 200, headers: corsHeaders }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        details: error.message
      }),
      { status: 500, headers: corsHeaders }
    );
  }
};

// ============================================
// CORS pour les requêtes OPTIONS
// ============================================

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
};
