/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
// ============================================
// MIDDLEWARE D'AUTHENTIFICATION CLOUDFLARE
// ============================================

import { createClient } from '@supabase/supabase-js';

// ============================================
// MONITORING & LOGGING AVANCÉ
// ============================================

interface Env {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  JWT_SECRET: string;
  ALLOWED_ORIGINS?: string;
}

interface PerformanceMetric {
  endpoint: string;
  method: string;
  duration: number;
  statusCode: number;
  userId?: string;
  ipAddress: string;
  userAgent?: string;
  timestamp: number;
  memoryUsage?: number;
  cpuTime?: number;
}

interface ErrorMetric {
  endpoint: string;
  error: string;
  stack?: string;
  userId?: string;
  ipAddress: string;
  timestamp: number;
  context?: Record<string, any>;
}

class MonitoringService {
  private metrics: PerformanceMetric[] = [];
  private errors: ErrorMetric[] = [];
  private batchSize = 10;
  private env: Env;

  constructor(env: Env) {
    this.env = env;
    // Supprimé le setInterval automatique pour éviter les problèmes de scope global
  }

  /**
   * Enregistre une métrique de performance
   */
  recordPerformance(metric: Omit<PerformanceMetric, 'timestamp'>) {
    const fullMetric: PerformanceMetric = {
      ...metric,
      timestamp: Date.now()
    };

    this.metrics.push(fullMetric);

    // Flush immédiat si batch size atteint
    if (this.metrics.length >= this.batchSize) {
      this.flush();
    }
  }

  /**
   * Enregistre une erreur
   */
  recordError(error: Omit<ErrorMetric, 'timestamp'>) {
    const fullError: ErrorMetric = {
      ...error,
      timestamp: Date.now()
    };

    this.errors.push(fullError);

    // Flush immédiat pour les erreurs
    this.flush();
  }

  /**
   * Flush les métriques vers Supabase
   */
  private async flush(env: Env) {
    try {
      if (this.metrics.length === 0 && this.errors.length === 0) return;

      const supabase = createSupabaseClient(env);

      // Insérer les métriques de performance
      if (this.metrics.length > 0) {
        const performanceLogs = this.metrics.map(metric => ({
          user_id: metric.userId || '00000000-0000-0000-0000-000000000000',
          action_type: 'performance_metric',
          credits_used: 0,
          metadata: {
            endpoint: metric.endpoint,
            method: metric.method,
            duration: metric.duration,
            status_code: metric.statusCode,
            ip_address: metric.ipAddress,
            user_agent: metric.userAgent,
            memory_usage: metric.memoryUsage,
            cpu_time: metric.cpuTime
          }
        }));

        await supabase.from('usage_logs').insert(performanceLogs);
        this.metrics = [];
      }

      // Insérer les erreurs
      if (this.errors.length > 0) {
        const errorLogs = this.errors.map(error => ({
          user_id: error.userId || '00000000-0000-0000-0000-000000000000',
          action_type: 'error_metric',
          credits_used: 0,
          metadata: {
            endpoint: error.endpoint,
            error: error.error,
            stack: error.stack,
            ip_address: error.ipAddress,
            context: error.context
          }
        }));

        await supabase.from('usage_logs').insert(errorLogs);
        this.errors = [];
      }

    } catch (error) {
      console.error('Failed to flush monitoring data:', error);
    }
  }
}

// Fonction pour créer une instance de monitoring (évite les problèmes de scope global)
export const createMonitoring = (env: Env) => new MonitoringService(env);

// Instance temporaire pour compatibilité (sera supprimée)
export const monitoring = null;

/**
 * Middleware de monitoring des performances
 */
export function withMonitoring(
  handler: (request: Request, env: Env) => Promise<Response>,
  endpoint: string
) {
  return async (request: Request, env: Env): Promise<Response> => {
    const startTime = Date.now();
    const method = request.method;
    const ipAddress = getClientIP(request);
    const userAgent = request.headers.get('User-Agent') || undefined;

    try {
      const response = await handler(request, env);
      const duration = Date.now() - startTime;

      // Enregistrer la métrique de performance
      createMonitoring(env).recordPerformance({
        endpoint,
        method,
        duration,
        statusCode: response.status,
        ipAddress,
        userAgent
      });

      // Ajouter des headers de performance à la réponse
      const newResponse = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: {
          ...Object.fromEntries(response.headers.entries()),
          'X-Response-Time': `${duration}ms`,
          'X-Server-Timing': `total;dur=${duration}`
        }
      });

      return newResponse;

    } catch (error: any) {
      const duration = Date.now() - startTime;

      // Enregistrer l'erreur
      createMonitoring(env).recordError({
        endpoint,
        error: error.message,
        stack: error.stack,
        ipAddress,
        context: {
          method,
          userAgent,
          url: request.url
        }
      });

      throw error;
    }
  };
}

// ============================================
// RATE LIMITING MIDDLEWARE
// ============================================

interface RateLimitConfig {
  windowMs: number;    // Fenêtre de temps en ms
  maxRequests: number; // Nombre max de requêtes par fenêtre
  keyPrefix: string;   // Préfixe pour les clés cache
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

// Configuration par endpoint
const RATE_LIMITS: Record<string, RateLimitConfig> = {
  'launch-tool': {
    windowMs: 60 * 1000,     // 1 minute
    maxRequests: 10,         // 10 lancements max/minute
    keyPrefix: 'ratelimit:launch:'
  },
  'generate-image': {
    windowMs: 60 * 1000,     // 1 minute
    maxRequests: 20,         // 20 générations max/minute
    keyPrefix: 'ratelimit:image:'
  },
  'ai-chat': {
    windowMs: 60 * 1000,     // 1 minute
    maxRequests: 30,         // 30 requêtes AI max/minute
    keyPrefix: 'ratelimit:ai-chat:'
  },
  'stripe-webhook': {
    windowMs: 60 * 1000,     // 1 minute
    maxRequests: 100,        // 100 webhooks max/minute (Stripe peut spammer)
    keyPrefix: 'ratelimit:webhook:'
  },
  'default': {
    windowMs: 60 * 1000,     // 1 minute
    maxRequests: 60,         // 60 requêtes max/minute par défaut
    keyPrefix: 'ratelimit:default:'
  }
};

/**
 * Vérifie et applique le rate limiting
 */
export async function checkRateLimit(
  request: Request,
  endpoint: string,
  env: Env,
  userId?: string
): Promise<RateLimitResult> {
  try {
    const config = RATE_LIMITS[endpoint] || RATE_LIMITS.default;

    // Clé unique : userId si authentifié, sinon IP
    const clientKey = userId || getClientIP(request);
    const cacheKey = `${config.keyPrefix}${clientKey}`;

    // Récupérer le compteur actuel depuis le cache Cloudflare
    const cache = caches.default;
    const cacheUrl = new URL(`https://cache.cloudflare.com/${cacheKey}`);

    // Vérifier le cache actuel
    const cachedResponse = await cache.match(cacheUrl);
    let requestCount = 0;
    let windowStart = Date.now();

    if (cachedResponse) {
      const cachedData = await cachedResponse.json();
      requestCount = cachedData.count || 0;
      windowStart = cachedData.windowStart || Date.now();
    }

    // Reset window si expirée
    const now = Date.now();
    if (now - windowStart >= config.windowMs) {
      requestCount = 0;
      windowStart = now;
    }

    // Incrémenter le compteur
    requestCount += 1;

    // Calculer le temps restant dans la fenêtre
    const resetTime = windowStart + config.windowMs;
    const remaining = Math.max(0, config.maxRequests - requestCount);

    // Vérifier si limite dépassée
    const allowed = requestCount <= config.maxRequests;

    // Mettre à jour le cache
    const cacheData = {
      count: requestCount,
      windowStart,
      lastRequest: now
    };

    // Créer une réponse cache avec expiration
    const cacheResponse = new Response(JSON.stringify(cacheData), {
      headers: {
        'Cache-Control': `max-age=${Math.ceil(config.windowMs / 1000)}`,
        'Content-Type': 'application/json'
      }
    });

    await cache.put(cacheUrl, cacheResponse);

    // Résultat
    const result: RateLimitResult = {
      allowed,
      remaining,
      resetTime
    };

    if (!allowed) {
      result.retryAfter = Math.ceil((resetTime - now) / 1000);
    }

    return result;

  } catch (error) {
    console.error('Rate limiting error:', error);
    // En cas d'erreur, autoriser pour éviter de bloquer les utilisateurs
    return {
      allowed: true,
      remaining: 999,
      resetTime: Date.now() + 60000
    };
  }
}

/**
 * Extrait l'IP client depuis les headers
 */
function getClientIP(request: Request): string {
  // Essayer plusieurs headers pour l'IP
  const forwardedFor = request.headers.get('CF-Connecting-IP') ||
                      request.headers.get('X-Forwarded-For') ||
                      request.headers.get('X-Real-IP') ||
                      'unknown';

  // Prendre la première IP si plusieurs
  return forwardedFor.split(',')[0].trim();
}

interface Env {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
}

// Fonction pour créer un client Supabase (évite l'instance globale)
const createSupabaseClient = (env: Env) => createClient(
  env.SUPABASE_URL || '',
  env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export interface AuthenticatedUser {
  id: string;
  email: string;
  credits: {
    total: number;
    used: number;
    available: number;
  };
  plan: {
    plan_type: string;
    status: string;
  };
}

/**
 * Authentifie l'utilisateur via JWT Supabase
 */
export async function authenticateUser(request: Request, env: Env): Promise<AuthenticatedUser | null> {
  try {
    // Récupérer le token d'autorisation
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('❌ Authorization header manquant ou invalide');
      return null;
    }

    const token = authHeader.substring(7); // Enlever "Bearer "

    // Vérifier le token avec Supabase
    const supabaseClient = createSupabaseClient(env);
    const { data: { user }, error } = await supabaseClient.auth.getUser(token);

    if (error || !user) {
      console.error('❌ Token invalide:', error?.message);
      return null;
    }

    // Récupérer les informations complètes de l'utilisateur
    const userInfo = await getUserInfo(user.id, env);

    if (!userInfo) {
      console.error('❌ Utilisateur non trouvé dans la DB');
      return null;
    }

    return userInfo;

  } catch (error) {
    console.error('❌ Erreur authentification:', error);
    return null;
  }
}

/**
 * Récupère les informations complètes de l'utilisateur
 */
async function getUserInfo(userId: string, env: Env): Promise<AuthenticatedUser | null> {
  try {
    // Créer le client Supabase pour ce contexte
    const supabase = createSupabaseClient(env);
    
    // Récupérer le profil
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      return null;
    }

    // Récupérer les crédits
    const { data: credits, error: creditsError } = await supabase
      .from('user_credits')
      .select('total_credits, used_credits')
      .eq('user_id', userId)
      .single();

    if (creditsError || !credits) {
      return null;
    }

    // Récupérer le plan
    const { data: plan, error: planError } = await supabase
      .from('user_plans')
      .select('plan_type, status')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (planError || !plan) {
      return null;
    }

    return {
      id: profile.id,
      email: profile.email,
      credits: {
        total: credits.total_credits,
        used: credits.used_credits,
        available: credits.total_credits - credits.used_credits,
      },
      plan: {
        plan_type: plan.plan_type,
        status: plan.status,
      },
    };

  } catch (error) {
    console.error('❌ Erreur récupération info utilisateur:', error);
    return null;
  }
}

/**
 * Vérifie si l'utilisateur a assez de crédits pour une action
 */
export function hasEnoughCredits(user: AuthenticatedUser, requiredCredits: number): boolean {
  return user.credits.available >= requiredCredits;
}

/**
 * Génère une réponse d'erreur standardisée
 */
export function createErrorResponse(message: string, status: number = 403): Response {
  return new Response(
    JSON.stringify({
      error: message,
      code: 'AUTHENTICATION_FAILED'
    }),
    {
      status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    }
  );
}

/**
 * Génère une réponse de succès standardisée
 */
export function createSuccessResponse(data: any, status: number = 200): Response {
  return new Response(
    JSON.stringify(data),
    {
      status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    }
  );
}

/**
 * Middleware complet avec authentification, rate limiting et vérification crédits
 */
export async function withAuth(
  request: Request,
  env: Env,
  handler: (user: AuthenticatedUser, request: Request, env: Env) => Promise<Response>,
  options: {
    requireCredits?: boolean;
    requiredCredits?: number;
    rateLimit?: boolean;
    endpoint?: string;
  } = {}
): Promise<Response> {
  try {
    // Appliquer le rate limiting si activé
    if (options.rateLimit !== false) { // Par défaut activé
      const endpoint = options.endpoint || 'default';
      const rateLimitResult = await checkRateLimit(request, endpoint, env);

      if (!rateLimitResult.allowed) {
        return new Response(
          JSON.stringify({
            error: 'Rate limit exceeded',
            retryAfter: rateLimitResult.retryAfter,
            resetTime: rateLimitResult.resetTime
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'Retry-After': rateLimitResult.retryAfter?.toString() || '60',
              'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
              'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
              'Access-Control-Allow-Origin': '*',
            }
          }
        );
      }
    }

    // Authentifier l'utilisateur
    const user = await authenticateUser(request, env);

    if (!user) {
      return createErrorResponse('Authentication required', 401);
    }

    // Appliquer rate limiting spécifique à l'utilisateur si pas déjà fait
    if (options.rateLimit !== false && user) {
      const endpoint = options.endpoint || 'default';
      const rateLimitResult = await checkRateLimit(request, endpoint, env, user.id);

      if (!rateLimitResult.allowed) {
        return new Response(
          JSON.stringify({
            error: 'Rate limit exceeded for your account',
            retryAfter: rateLimitResult.retryAfter,
            resetTime: rateLimitResult.resetTime
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'Retry-After': rateLimitResult.retryAfter?.toString() || '60',
              'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
              'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
              'Access-Control-Allow-Origin': '*',
            }
          }
        );
      }
    }

    // Vérifier les crédits si requis
    if (options.requireCredits && options.requiredCredits) {
      if (!hasEnoughCredits(user, options.requiredCredits)) {
        return createErrorResponse(`Insufficient credits. Required: ${options.requiredCredits}, Available: ${user.credits.available}`, 403);
      }
    }

    // Enregistrer métriques utilisateur (seulement si monitoring est initialisé)
    const monitoringInstance = createMonitoring(env);
    if (monitoringInstance) {
      monitoringInstance.recordPerformance({
        endpoint: options.endpoint || 'authenticated_endpoint',
        method: request.method,
        duration: 0, // Sera calculé par withMonitoring
        statusCode: 200, // Sera mis à jour par withMonitoring
        userId: user.id,
        ipAddress: getClientIP(request),
        userAgent: request.headers.get('User-Agent') || undefined
      });
    }

    // Exécuter le handler
    return await handler(user, request, env);

  } catch (error) {
    console.error('❌ Erreur middleware auth:', error);
    return createErrorResponse('Internal server error', 500);
  }
}
