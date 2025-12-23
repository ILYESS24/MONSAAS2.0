/* eslint-disable @typescript-eslint/no-explicit-any */
// Cloudflare Function - Launch Tool with Session Token
// POST /api/launch-tool

import { withAuth, withMonitoring } from '../middleware/auth';
import { createToolSession } from '../middleware/tool-tokens';
import { TOOL_COSTS } from '../middleware/constants';

interface Env {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  JWT_SECRET: string;
}

async function handleLaunchTool(user: any, request: Request, env: Env) {
  try {
    const body = await request.json() as { toolId: string };
    const { toolId } = body;

    if (!toolId || !TOOL_COSTS[toolId]) {
      return new Response(
        JSON.stringify({ error: 'Invalid tool ID' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const cost = TOOL_COSTS[toolId];

    // Vérifier et CONSOMMER les crédits immédiatement au lancement
    try {
      const creditResult = await supabase.rpc('consume_user_credits', {
        p_user_id: user.id,
        p_cost: cost,
        p_action_type: `launch_tool_${toolId}`,
        p_metadata: { tool_id: toolId, action: 'launch' }
      });

      if (!creditResult.data?.success) {
        return new Response(
          JSON.stringify({
            error: creditResult.data?.error_message || 'Failed to consume credits',
            required: cost,
            available: creditResult.data?.available_credits || 0
          }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        );
      }
    } catch (error) {
      console.error('Credit consumption error:', error);
      return new Response(
        JSON.stringify({ error: 'Credit system error' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Créer la session outil seulement après débit réussi
    const toolSession = await createToolSession(user, toolId, cost, env);

    if (!toolSession) {
      return new Response(
        JSON.stringify({ error: 'Failed to create tool session' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Définir l'URL de l'outil selon l'ID
    const toolUrls: Record<string, string> = {
      'app-builder': 'https://790d4da4.ai-assistant-xlv.pages.dev',
      'website-builder': 'https://790d4da4.ai-assistant-xlv.pages.dev',
      'text-editor': 'https://aieditor-juoq4bl3z-ibagencys-projects.vercel.app',
      'ai-agents': 'https://flo-1-2ba8.onrender.com',
      'code-editor': 'https://790d4da4.ai-assistant-xlv.pages.dev',
      'content-generator': 'https://790d4da4.ai-assistant-xlv.pages.dev',
    };

    const toolUrl = toolUrls[toolId];
    if (!toolUrl) {
      return new Response(
        JSON.stringify({ error: 'Tool URL not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Construire l'URL avec le token de session
    const sessionUrl = `${toolUrl}?session_token=${encodeURIComponent(toolSession.session_token)}&tool_id=${toolId}`;

    return new Response(
      JSON.stringify({
        success: true,
        toolUrl: sessionUrl,
        sessionToken: toolSession.session_token,
        creditsConsumed: cost,
        expiresAt: toolSession.expires_at,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Launch tool error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export const onRequestPost: PagesFunction<Env> = withMonitoring(async (context) => {
  return withAuth(context.request, context.env, handleLaunchTool, {
    requireCredits: true, // Le middleware vérifiera les crédits minimum
    rateLimit: true,
    endpoint: 'launch-tool' // Rate limiting spécifique aux lancements d'outils
  });
}, 'launch-tool');

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
