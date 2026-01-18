/* eslint-disable @typescript-eslint/no-explicit-any */
// Cloudflare Function - Production Logging Endpoint
// POST /api/logs

import { createClient } from '@supabase/supabase-js';
import { withMonitoring } from '../middleware/auth';

interface Env {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  LOG_LEVEL?: string;
}

interface LogEntry {
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error' | 'security';
  message: string;
  userId?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  context?: Record<string, any>;
  stack?: string;
}

interface LogsRequest {
  logs: LogEntry[];
}

// Configuration du niveau de log minimum
const LOG_LEVELS: Record<string, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  security: 4,
};

export const onRequestPost: PagesFunction<Env> = withMonitoring(async (context) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };

  try {
    const body: LogsRequest = await context.request.json();
    
    if (!body.logs || !Array.isArray(body.logs) || body.logs.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid request: logs array required' }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Limiter le nombre de logs par requête
    const MAX_LOGS_PER_REQUEST = 100;
    const logsToProcess = body.logs.slice(0, MAX_LOGS_PER_REQUEST);

    // Niveau de log minimum (par défaut: warn en production)
    const minLevel = context.env.LOG_LEVEL || 'warn';
    const minLevelValue = LOG_LEVELS[minLevel] || 2;

    // Filtrer les logs selon le niveau minimum
    const filteredLogs = logsToProcess.filter(log => {
      const logLevel = LOG_LEVELS[log.level] || 0;
      return logLevel >= minLevelValue;
    });

    if (filteredLogs.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No logs to process at current log level',
          received: logsToProcess.length,
          processed: 0,
        }),
        { status: 200, headers: corsHeaders }
      );
    }

    // Initialiser Supabase
    const supabase = createClient(
      context.env.SUPABASE_URL,
      context.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Récupérer l'IP client depuis Cloudflare
    const clientIP = context.request.headers.get('CF-Connecting-IP') || 'unknown';
    const country = context.request.headers.get('CF-IPCountry') || 'unknown';

    // Préparer les logs pour insertion
    const logsToInsert = filteredLogs.map(log => ({
      timestamp: log.timestamp || new Date().toISOString(),
      level: log.level,
      message: log.message.substring(0, 2000), // Limiter la taille
      user_id: log.userId || null,
      session_id: log.sessionId || null,
      ip_address: clientIP,
      country: country,
      user_agent: (log.userAgent || context.request.headers.get('User-Agent') || '').substring(0, 500),
      context: log.context ? JSON.stringify(log.context).substring(0, 5000) : null,
      stack: log.stack ? log.stack.substring(0, 5000) : null,
      created_at: new Date().toISOString(),
    }));

    // Insérer les logs dans la base
    const { error: insertError } = await supabase
      .from('application_logs')
      .insert(logsToInsert);

    if (insertError) {
      console.error('Failed to insert logs:', insertError);
      // Ne pas échouer la requête si l'insertion échoue
      // Les logs sont aussi envoyés à la console Cloudflare
    }

    // Pour les logs de sécurité, créer une alerte
    const securityLogs = filteredLogs.filter(log => log.level === 'security');
    if (securityLogs.length > 0) {
      await supabase
        .from('security_alerts')
        .insert(securityLogs.map(log => ({
          level: 'high',
          message: log.message,
          user_id: log.userId || null,
          ip_address: clientIP,
          context: log.context,
          created_at: new Date().toISOString(),
          status: 'new',
        })));
    }

    // Pour les erreurs, incrémenter le compteur
    const errorLogs = filteredLogs.filter(log => log.level === 'error');
    if (errorLogs.length > 0) {
      // Logique de comptage d'erreurs pour monitoring
      console.error(`[PRODUCTION] ${errorLogs.length} errors received from frontend`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        received: logsToProcess.length,
        processed: filteredLogs.length,
        securityAlerts: securityLogs.length,
        errors: errorLogs.length,
      }),
      { status: 200, headers: corsHeaders }
    );

  } catch (error: any) {
    console.error('❌ Logging endpoint error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Logging failed',
        details: error.message 
      }),
      { status: 500, headers: corsHeaders }
    );
  }
}, 'logs');

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

