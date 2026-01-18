 
// ============================================
// VALIDATE TOOL ACCESS
// POST /api/validate-tool-access
// ============================================
//
// Endpoint appelé par IframeTool pour créer une session
// et obtenir l'URL de l'iframe pour un outil.
// ============================================

import { withAuth, withMonitoring } from '../middleware/auth';
import { createToolSession } from '../middleware/tool-tokens';
import { TOOL_COSTS } from '../middleware/constants';
import { createClient } from '@supabase/supabase-js';

interface Env {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  JWT_SECRET: string;
}

// ============================================
// HANDLER PRINCIPAL
// ============================================

async function handleValidateToolAccess(user: any, request: Request, env: Env): Promise<Response> {
  try {
    const body = await request.json() as { toolId: string; reuseSession?: boolean };
    const { toolId, reuseSession = true } = body;

    if (!toolId || !TOOL_COSTS[toolId]) {
      return new Response(
        JSON.stringify({
          error: 'Invalid tool ID',
          code: 'TOOL_NOT_FOUND'
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      );
    }

    const cost = TOOL_COSTS[toolId];

    // CRITICAL: Vérifier et CONSOMMER les crédits immédiatement au lancement
    // NO DEMO MODE - Si pas de crédits, BLOQUER TOTALEMENT
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
    
    let creditResult;
    try {
      creditResult = await supabase.rpc('consume_user_credits', {
        p_user_id: user.id,
        p_cost: cost,
        p_action_type: `launch_tool_${toolId}`,
        p_metadata: { tool_id: toolId, action: 'launch' }
      });
    } catch (error) {
      console.error('Credit consumption error:', error);
      return new Response(
        JSON.stringify({
          error: 'Credit system unavailable. Please try again later.',
          code: 'CREDIT_SYSTEM_ERROR'
        }),
        {
          status: 503,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      );
    }

    // STRICT BLOCKING: If not enough credits, DENY ACCESS completely
    if (!creditResult.data?.success) {
      return new Response(
        JSON.stringify({
          error: 'Insufficient credits',
          code: 'INSUFFICIENT_CREDITS',
          message: creditResult.data?.error_message || 'You do not have enough credits to use this tool',
          required: cost,
          available: creditResult.data?.available_credits || 0,
          upgrade_url: '/pricing'
        }),
        {
          status: 403,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      );
    }

    // Créer la session outil seulement après débit réussi
    const toolSession = await createToolSession(user, toolId, cost, env);

    if (!toolSession) {
      return new Response(
        JSON.stringify({
          error: 'Failed to create tool session',
          code: 'SESSION_CREATION_FAILED'
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      );
    }

    // Définir l'URL de l'outil selon l'ID
    const toolUrls: Record<string, string> = {
      'app-builder': 'https://aurion-app-v2.pages.dev/',
      'website-builder': 'https://790d4da4.ai-assistant-xlv.pages.dev',
      'ai-agents': 'https://flo-1-2ba8.onrender.com',
      'text-editor': 'https://aieditor-do0wmlcpa-ibagencys-projects.vercel.app',
      'code-editor': 'https://790d4da4.ai-assistant-xlv.pages.dev',
      'content-generator': 'https://790d4da4.ai-assistant-xlv.pages.dev',
    };

    const iframeUrl = toolUrls[toolId];
    if (!iframeUrl) {
      return new Response(
        JSON.stringify({
          error: 'Tool URL not configured',
          code: 'TOOL_URL_MISSING'
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      );
    }

    // Récupérer les informations utilisateur actuelles
    const { data: userCredits } = await supabase
      .from('user_credits')
      .select('total_credits, used_credits')
      .eq('user_id', user.id)
      .single();

    const { data: userPlan } = await supabase
      .from('user_plans')
      .select('plan_type, status')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    return new Response(
      JSON.stringify({
        sessionToken: toolSession.session_token,
        sessionId: toolSession.id,
        isReusedSession: false,
        creditsConsumed: cost,
        iframeUrl: iframeUrl,
        credits: {
          total: userCredits?.total_credits || 0,
          used: userCredits?.used_credits || 0,
          remaining: (userCredits?.total_credits || 0) - (userCredits?.used_credits || 0),
        },
        plan: {
          type: userPlan?.plan_type || 'free',
          status: userPlan?.status || 'inactive',
        },
        expiresAt: toolSession.expires_at,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': 'true',
        }
      }
    );

  } catch (error: unknown) {
    console.error('[Tool Access] Error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Internal server error',
        code: 'INTERNAL_ERROR'
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      }
    );
  }
}

// ============================================
// EXPORTS
// ============================================

export const onRequestPost: PagesFunction<Env> = withMonitoring(async (context) => {
  return withAuth(context.request, context.env, handleValidateToolAccess, {
    requireCredits: true,
    rateLimit: true,
    endpoint: 'validate-tool-access'
  });
}, 'validate-tool-access');

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
    },
  });
};
