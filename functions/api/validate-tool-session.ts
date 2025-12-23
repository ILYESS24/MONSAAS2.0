 
// ============================================
// VALIDATE TOOL SESSION
// POST /api/validate-tool-session
// ============================================
//
// Endpoint appelé par les iframes pour valider
// leur session et vérifier que l'utilisateur
// a toujours accès à l'outil.
// ============================================

import { withMonitoring } from '../middleware/auth';
import { validateToolSession } from '../middleware/tool-tokens';
import { createClient } from '@supabase/supabase-js';

interface Env {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  JWT_SECRET: string;
  ALLOWED_ORIGINS?: string;
}

// ============================================
// VALIDATION ORIGINE POUR IFRAMES
// ============================================

function validateIframeOrigin(request: Request, env: Env): boolean {
  const origin = request.headers.get('Origin');
  
  const allowedOrigins = [
    'https://790d4da4.ai-assistant-xlv.pages.dev',
    'https://flo-1-2ba8.onrender.com',
    'https://aieditor-do0wmlcpa-ibagencys-projects.vercel.app',
    // Ajouter d'autres origines d'iframes ici
  ];

  // Ajouter les origines personnalisées
  if (env.ALLOWED_ORIGINS) {
    allowedOrigins.push(...env.ALLOWED_ORIGINS.split(',').map(o => o.trim()));
  }

  // Développement : autoriser localhost
  if (origin?.startsWith('http://localhost') || origin?.startsWith('http://127.0.0.1')) {
    return true;
  }

  return origin ? allowedOrigins.includes(origin) : false;
}

// ============================================
// HANDLER PRINCIPAL
// ============================================

async function handleValidateToolSession(request: Request, env: Env): Promise<Response> {
  try {
    // Vérifier l'origine
    if (!validateIframeOrigin(request, env)) {
      console.warn('[Session Validation] Invalid origin:', request.headers.get('Origin'));
      return new Response(
        JSON.stringify({ 
          valid: false, 
          error: 'Invalid origin',
          code: 'ORIGIN_INVALID'
        }),
        { 
          status: 403, 
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': request.headers.get('Origin') || '*',
          } 
        }
      );
    }

    const body = await request.json() as { 
      sessionToken: string; 
      toolId: string;
      actionType?: string;
      actionCost?: number;
    };

    const { sessionToken, toolId, actionType, actionCost = 0 } = body;

    if (!sessionToken || !toolId) {
      return new Response(
        JSON.stringify({ 
          valid: false, 
          error: 'Missing sessionToken or toolId',
          code: 'MISSING_PARAMS'
        }),
        { 
          status: 400, 
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': request.headers.get('Origin') || '*',
          } 
        }
      );
    }

    // Valider la session
    const result = await validateToolSession(sessionToken, toolId, actionCost, env);

    if (!result.valid) {
      return new Response(
        JSON.stringify({ 
          valid: false, 
          error: result.error,
          code: getErrorCode(result.error)
        }),
        { 
          status: 401, 
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': request.headers.get('Origin') || '*',
          } 
        }
      );
    }

    // Récupérer les informations utilisateur actuelles
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

    const { data: userCredits } = await supabase
      .from('user_credits')
      .select('total_credits, used_credits')
      .eq('user_id', result.user_id)
      .single();

    const { data: userPlan } = await supabase
      .from('user_plans')
      .select('plan_type, status')
      .eq('user_id', result.user_id)
      .eq('status', 'active')
      .single();

    // Logger l'action si spécifiée
    if (actionType) {
      await supabase
        .from('usage_logs')
        .insert([{
          user_id: result.user_id,
          action_type: actionType,
          credits_used: 0, // Crédits déjà consommés au lancement
          metadata: {
            session_id: result.session?.id,
            tool_id: toolId,
            action_type: actionType,
            timestamp: new Date().toISOString()
          },
          created_at: new Date().toISOString(),
        }]);
    }

    return new Response(
      JSON.stringify({ 
        valid: true,
        userId: result.user_id,
        sessionId: result.session?.id,
        credits: {
          total: userCredits?.total_credits || 0,
          used: userCredits?.used_credits || 0,
          remaining: (userCredits?.total_credits || 0) - (userCredits?.used_credits || 0),
        },
        plan: {
          type: userPlan?.plan_type || 'free',
          status: userPlan?.status || 'inactive',
        },
        expiresAt: result.session?.expires_at,
      }),
      { 
        status: 200, 
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': request.headers.get('Origin') || '*',
          'Access-Control-Allow-Credentials': 'true',
        } 
      }
    );

  } catch (error) {
    console.error('[Session Validation] Error:', error);
    return new Response(
      JSON.stringify({ 
        valid: false, 
        error: 'Internal server error',
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

function getErrorCode(error?: string): string {
  if (!error) return 'UNKNOWN_ERROR';
  
  if (error.includes('Invalid token')) return 'TOKEN_INVALID';
  if (error.includes('does not match')) return 'TOKEN_MISMATCH';
  if (error.includes('expired')) return 'SESSION_EXPIRED';
  if (error.includes('not found')) return 'SESSION_NOT_FOUND';
  if (error.includes('exhausted')) return 'CREDITS_EXHAUSTED';
  
  return 'VALIDATION_FAILED';
}

// ============================================
// EXPORTS
// ============================================

export const onRequestPost: PagesFunction<Env> = withMonitoring(
  handleValidateToolSession,
  'validate-tool-session'
);

export const onRequestOptions: PagesFunction = async (context) => {
  const origin = context.request.headers.get('Origin') || '*';
  
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age': '86400',
    },
  });
};
