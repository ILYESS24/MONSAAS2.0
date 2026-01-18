// ============================================
// LOG IFRAME METRICS
// POST /api/log-iframe-metrics
// ============================================
// Endpoint pour logger les métriques de performance
// des iframes (chargement, erreurs, utilisation)

import { withMonitoring } from '../middleware/auth';
import { createClient } from '@supabase/supabase-js';

interface Env {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
}

interface IframeMetric {
  toolId: string;
  userId: string;
  loadTime: number;
  errorCount: number;
  sessionDuration: number;
  creditsConsumed: number;
  timestamp: number;
  origin: string;
  userAgent: string;
}

async function handleLogIframeMetrics(user: any, request: Request, env: Env): Promise<Response> {
  try {
    const body = await request.json() as {
      metrics: IframeMetric[];
      clientVersion: string;
    };

    const { metrics, clientVersion } = body;

    if (!metrics || !Array.isArray(metrics)) {
      return new Response(
        JSON.stringify({ error: 'Invalid metrics data' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      );
    }

    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

    // Convertir les métriques en logs d'usage
    const usageLogs = metrics.map(metric => ({
      user_id: metric.userId === 'anonymous' ? '00000000-0000-0000-0000-000000000000' : metric.userId,
      action_type: 'iframe_metric',
      credits_used: 0,
      metadata: {
        tool_id: metric.toolId,
        load_time: metric.loadTime,
        error_count: metric.errorCount,
        session_duration: metric.sessionDuration,
        credits_consumed: metric.creditsConsumed,
        origin: metric.origin,
        user_agent: metric.userAgent,
        client_version: clientVersion,
        metric_type: metric.loadTime > 0 ? 'load_time' :
                    metric.errorCount > 0 ? 'error' :
                    metric.sessionDuration > 0 ? 'session_end' : 'unknown'
      },
      created_at: new Date(metric.timestamp).toISOString()
    }));

    // Insérer en batch
    const { error } = await supabase
      .from('usage_logs')
      .insert(usageLogs);

    if (error) {
      console.error('[Iframe Metrics] Insert error:', error);
      return new Response(
        JSON.stringify({
          error: 'Failed to log metrics',
          details: error.message
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

    console.log(`[Iframe Metrics] Logged ${metrics.length} metrics for user ${user.id}`);

    return new Response(
      JSON.stringify({
        success: true,
        logged: metrics.length
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );

  } catch (error: any) {
    console.error('[Iframe Metrics] Error:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error.message
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
}

// ============================================
// EXPORTS
// ============================================

export const onRequestPost: PagesFunction<Env> = withMonitoring(async (context) => {
  return withAuth(context.request, context.env, handleLogIframeMetrics, {
    endpoint: 'log-iframe-metrics'
  });
}, 'log-iframe-metrics');

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
