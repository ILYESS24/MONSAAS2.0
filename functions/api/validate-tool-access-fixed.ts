/* eslint-disable @typescript-eslint/no-explicit-any */
// ============================================
// VALIDATE TOOL ACCESS - VERSION AUTHENTIFIÉE
// POST /api/validate-tool-access
// ============================================

import { createClient } from '@supabase/supabase-js';
import { withAuth, withMonitoring, AuthenticatedUser, createErrorResponse } from '../middleware/auth';
import { createToolSession, reuseExistingSession } from '../middleware/tool-tokens';
import { ALL_TOOL_COSTS as TOOL_COSTS, TOOL_URLS } from '../../src/types/plans';
import { DEFAULT_ALLOWED_ORIGINS } from '../middleware/constants';

interface Env {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  JWT_SECRET: string;
  ALLOWED_ORIGINS?: string;
}

export const onRequestPost: PagesFunction<Env> = withMonitoring(async (context) => {
  return withAuth(context.request, context.env, handleValidateToolAccess, {
    requireCredits: true,
    rateLimit: true,
    endpoint: 'validate-tool-access'
  });
}, 'validate-tool-access');

async function handleValidateToolAccess(user: AuthenticatedUser, request: Request, env: Env) {
  try {
    const originCheck = validateOrigin(request, env);
    if (!originCheck.valid) {
      return new Response(
        JSON.stringify({ error: originCheck.error, reason: 'security_violation' }),
        {
          status: 403,
          headers: {
            'Content-Type': 'application/json',
            'X-Security-Block': 'origin-validation-failed'
          }
        }
      );
    }

    const body = await request.json() as { toolId: string; reuseSession?: boolean };
    const { toolId, reuseSession = true } = body;

    if (!toolId || !TOOL_COSTS[toolId]) {
      return createErrorResponse('Invalid tool ID', 400);
    }

    const cost = TOOL_COSTS[toolId];
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

    if (reuseSession) {
      const existingSession = await reuseExistingSession(user.id, toolId, env);
      if (existingSession) {
        console.log(`[Session] Reusing existing session for user ${user.id}, tool ${toolId}`);
        return createSuccessResponse(existingSession, toolId, cost, env, request, true);
      }
    }

    const { data: userPlan, error: planError } = await supabase
      .from('user_plans')
      .select('plan_type, status, credits_monthly')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (planError || !userPlan) {
      return createErrorResponse('No active plan found', 403);
    }

    const { data: planDetails } = await supabase
      .from('plans')
      .select('features')
      .eq('plan_type', userPlan.plan_type)
      .single();

    if (!planDetails?.features) {
      return createErrorResponse('Plan configuration not found', 500);
    }

    interface ToolFeatureConfig {
      tool: string;
      enabled: boolean;
      dailyLimit?: number;
      monthlyLimit?: number;
    }
    const toolConfig = planDetails.features.find((f: ToolFeatureConfig) => f.tool === toolId);
    if (!toolConfig?.enabled) {
      return createErrorResponse('Tool not available in your plan', 403);
    }

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    if (toolConfig.dailyLimit) {
      const { data: dailyUsage } = await supabase
        .from('usage_logs')
        .select('credits_used')
        .eq('user_id', user.id)
        .eq('action_type', `${toolId}_action`)
        .gte('created_at', startOfDay.toISOString());

      const dailyUsed = dailyUsage?.reduce((sum, log) => sum + log.credits_used, 0) || 0;

      if (dailyUsed >= toolConfig.dailyLimit) {
        return createErrorResponse('Daily limit exceeded', 429);
      }
    }

    if (toolConfig.monthlyLimit) {
      const { data: monthlyUsage } = await supabase
        .from('usage_logs')
        .select('credits_used')
        .eq('user_id', user.id)
        .eq('action_type', `${toolId}_action`)
        .gte('created_at', startOfMonth.toISOString());

      const monthlyUsed = monthlyUsage?.reduce((sum, log) => sum + log.credits_used, 0) || 0;

      if (monthlyUsed >= toolConfig.monthlyLimit) {
        return createErrorResponse('Monthly limit exceeded', 429);
      }
    }

    try {
      const creditResult = await supabase.rpc('consume_user_credits', {
        p_user_id: user.id,
        p_cost: cost,
        p_action_type: `tool_access_${toolId}`,
        p_metadata: {
          tool_id: toolId,
          plan_type: userPlan.plan_type,
          access_type: 'iframe_session'
        }
      });

      if (!creditResult.data?.success) {
        return createErrorResponse(creditResult.data?.error_message || 'Credit consumption failed', 402);
      }
    } catch (error) {
      console.error('Credit consumption error:', error);
      return createErrorResponse('Credit system error', 500);
    }

    const toolSession = await createToolSession(user, toolId, cost, env);

    if (!toolSession) {
      await supabase.rpc('refund_user_credits', {
        p_user_id: user.id,
        p_amount: cost,
        p_reason: 'session_creation_failed'
      });
      return createErrorResponse('Failed to create tool session', 500);
    }

    return createSuccessResponse(toolSession, toolId, cost, env, request, false);

  } catch (error) {
    console.error('Validate tool access error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return createErrorResponse(errorMessage, 500);
  }
}

function validateOrigin(request: Request, env: Env): { valid: boolean; error?: string } {
  const origin = request.headers.get('Origin');
  const referer = request.headers.get('Referer');

  const allowedOrigins = env.ALLOWED_ORIGINS
    ? env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
    : DEFAULT_ALLOWED_ORIGINS;

  if (origin && !allowedOrigins.some(allowed => origin.startsWith(allowed))) {
    console.warn(`[Security] Rejected origin: ${origin}`);
    return { valid: false, error: 'Invalid origin' };
  }

  if (referer && !allowedOrigins.some(allowed => referer.startsWith(allowed))) {
    console.warn(`[Security] Rejected referer: ${referer}`);
    return { valid: false, error: 'Invalid referer' };
  }

  return { valid: true };
}

function createSuccessResponse(
  toolSession: any,
  toolId: string,
  cost: number,
  env: Env,
  request: Request,
  isReused: boolean
): Response {
  const baseUrl = TOOL_URLS[toolId];

  const iframeUrl = `${baseUrl}?tool_id=${toolId}&session_id=${toolSession.id}`;

  const isProduction = !request.url.includes('localhost');

  const cookieOptions = [
    `genim_session_${toolId}=${toolSession.session_token}`,
    'HttpOnly',
    'Path=/',
    `Max-Age=${24 * 60 * 60}`, // 24 heures
    'SameSite=Strict',
  ];

  if (isProduction) {
    cookieOptions.push('Secure');
  }

  const responseBody = {
    success: true,
    sessionId: toolSession.id,
    toolId,
    cost: isReused ? 0 : cost,
    creditsConsumed: isReused ? 0 : cost,
    expiresAt: toolSession.expires_at,
    iframeUrl,
    isReusedSession: isReused,
    sessionToken: toolSession.session_token,
  };

  return new Response(
    JSON.stringify(responseBody),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': cookieOptions.join('; '),
        'X-Session-Reused': isReused ? 'true' : 'false',
      }
    }
  );
}

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
