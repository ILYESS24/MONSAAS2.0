/* eslint-disable @typescript-eslint/no-explicit-any */
// Cloudflare Function - GDPR Data Export
// POST /api/gdpr/export

import { createClient } from '@supabase/supabase-js';
import { withAuth } from '../../middleware/auth';

interface Env {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
}

interface ExportRequest {
  userId: string;
  includeUsageHistory?: boolean;
  includePayments?: boolean;
  includePreferences?: boolean;
}

export const onRequestPost: PagesFunction<Env> = withAuth(async (context) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };

  try {
    const user = (context as any).user;
    if (!user?.id) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: corsHeaders }
      );
    }

    const body: ExportRequest = await context.request.json();

    // Vérifier que l'utilisateur demande ses propres données
    if (body.userId !== user.id) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: You can only export your own data' }),
        { status: 403, headers: corsHeaders }
      );
    }

    // Initialiser Supabase avec service role
    const supabase = createClient(
      context.env.SUPABASE_URL,
      context.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Collecter toutes les données de l'utilisateur
    const exportData: Record<string, any> = {};

    // 1. Profil utilisateur
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    exportData.profile = profile;

    // 2. Plan et abonnements
    const { data: plans } = await supabase
      .from('user_plans')
      .select('*')
      .eq('user_id', user.id);
    exportData.plans = plans;

    // 3. Crédits
    const { data: credits } = await supabase
      .from('user_credits')
      .select('*')
      .eq('user_id', user.id);
    exportData.credits = credits;

    // 4. Historique d'utilisation (si demandé)
    if (body.includeUsageHistory !== false) {
      const { data: usageLogs } = await supabase
        .from('usage_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10000);
      exportData.usageHistory = usageLogs;
    }

    // 5. Sessions d'outils
    const { data: toolSessions } = await supabase
      .from('tool_sessions')
      .select('id, tool_id, created_at, expires_at, is_active, last_activity')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1000);
    exportData.toolSessions = toolSessions;

    // 6. Paiements (si demandé et si données disponibles)
    if (body.includePayments !== false) {
      const { data: stripeSessions } = await supabase
        .from('stripe_sessions')
        .select('id, plan_type, amount, currency, status, created_at, completed_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      exportData.payments = stripeSessions;
    }

    // Générer un ID d'export unique
    const exportId = `export_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Enregistrer la demande d'export
    await supabase
      .from('gdpr_exports')
      .insert([{
        id: exportId,
        user_id: user.id,
        status: 'completed',
        data_size: JSON.stringify(exportData).length,
        created_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
      }]);

    // Logger l'action pour conformité RGPD
    await supabase
      .from('usage_logs')
      .insert([{
        user_id: user.id,
        action_type: 'gdpr_data_export',
        credits_used: 0,
        metadata: {
          export_id: exportId,
          data_types: Object.keys(exportData),
          timestamp: new Date().toISOString(),
        },
        created_at: new Date().toISOString(),
      }]);

    // Retourner les données directement (pour téléchargement immédiat)
    // En production, on pourrait envoyer par email pour des exports volumineux
    return new Response(
      JSON.stringify({
        success: true,
        exportId,
        message: 'Export completed successfully',
        data: exportData,
        exportedAt: new Date().toISOString(),
        dataTypes: Object.keys(exportData),
        totalRecords: Object.values(exportData).reduce(
          (acc: number, val: any) => acc + (Array.isArray(val) ? val.length : 1),
          0
        ),
      }),
      { 
        status: 200, 
        headers: {
          ...corsHeaders,
          'Content-Disposition': `attachment; filename="aurion-data-export-${exportId}.json"`,
        }
      }
    );

  } catch (error: any) {
    console.error('❌ GDPR Export error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Export failed',
        details: error.message 
      }),
      { status: 500, headers: corsHeaders }
    );
  }
});

// OPTIONS handler for CORS
export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
};

