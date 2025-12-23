/* eslint-disable @typescript-eslint/no-explicit-any */
// ============================================
// RATE LIMITER - Protection contre les abus
// Implémentation pour Cloudflare Workers
// ============================================

export interface RateLimitConfig {
  maxRequests: number;       // Nombre max de requêtes
  windowMs: number;          // Fenêtre en millisecondes
  keyPrefix?: string;        // Préfixe pour la clé de stockage
  blockDurationMs?: number;  // Durée de blocage après dépassement
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  blocked: boolean;
  retryAfter?: number;
}

// Configuration par défaut par endpoint
export const RATE_LIMIT_CONFIGS: Record<string, RateLimitConfig> = {
  // API d'authentification - Très restrictif
  'auth': {
    maxRequests: 5,
    windowMs: 60 * 1000, // 1 minute
    keyPrefix: 'rl:auth:',
    blockDurationMs: 5 * 60 * 1000 // 5 minutes de blocage
  },

  // API de paiement - Restrictif
  'payment': {
    maxRequests: 10,
    windowMs: 60 * 1000,
    keyPrefix: 'rl:payment:',
    blockDurationMs: 2 * 60 * 1000
  },

  // API de génération - Modéré
  'generation': {
    maxRequests: 30,
    windowMs: 60 * 1000,
    keyPrefix: 'rl:gen:',
    blockDurationMs: 60 * 1000
  },

  // API de lecture - Permissif
  'read': {
    maxRequests: 100,
    windowMs: 60 * 1000,
    keyPrefix: 'rl:read:',
    blockDurationMs: 30 * 1000
  },

  // Webhook Stripe - Très permissif
  'webhook': {
    maxRequests: 1000,
    windowMs: 60 * 1000,
    keyPrefix: 'rl:webhook:',
    blockDurationMs: 0
  },

  // Défaut
  'default': {
    maxRequests: 50,
    windowMs: 60 * 1000,
    keyPrefix: 'rl:default:',
    blockDurationMs: 60 * 1000
  }
};

// Stockage en mémoire pour le rate limiting (pour Cloudflare Workers)
// En production, utiliser Cloudflare KV ou Durable Objects
const rateLimitStore = new Map<string, { count: number; resetAt: number; blockedUntil?: number }>();

export class RateLimiter {
  private config: RateLimitConfig;

  constructor(configType: keyof typeof RATE_LIMIT_CONFIGS = 'default') {
    this.config = RATE_LIMIT_CONFIGS[configType] || RATE_LIMIT_CONFIGS['default'];
  }

  /**
   * Vérifie si la requête est autorisée
   * @param identifier - Identifiant unique (IP, userId, etc.)
   * @returns RateLimitResult
   */
  check(identifier: string): RateLimitResult {
    const key = (this.config.keyPrefix || 'rl:') + identifier;
    const now = Date.now();

    // Récupérer l'état actuel
    let state = rateLimitStore.get(key);

    // Vérifier si bloqué
    if (state?.blockedUntil && state.blockedUntil > now) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: state.blockedUntil,
        blocked: true,
        retryAfter: Math.ceil((state.blockedUntil - now) / 1000)
      };
    }

    // Réinitialiser si la fenêtre est expirée
    if (!state || state.resetAt <= now) {
      state = {
        count: 0,
        resetAt: now + this.config.windowMs
      };
    }

    // Incrémenter le compteur
    state.count++;

    // Vérifier la limite
    if (state.count > this.config.maxRequests) {
      // Appliquer le blocage si configuré
      if (this.config.blockDurationMs && this.config.blockDurationMs > 0) {
        state.blockedUntil = now + this.config.blockDurationMs;
      }

      rateLimitStore.set(key, state);

      return {
        allowed: false,
        remaining: 0,
        resetAt: state.blockedUntil || state.resetAt,
        blocked: !!state.blockedUntil,
        retryAfter: Math.ceil((state.resetAt - now) / 1000)
      };
    }

    // Sauvegarder l'état
    rateLimitStore.set(key, state);

    return {
      allowed: true,
      remaining: this.config.maxRequests - state.count,
      resetAt: state.resetAt,
      blocked: false
    };
  }

  /**
   * Réinitialise le compteur pour un identifiant
   * @param identifier - Identifiant unique
   */
  reset(identifier: string): void {
    const key = (this.config.keyPrefix || 'rl:') + identifier;
    rateLimitStore.delete(key);
  }
}

// ============================================
// MIDDLEWARE RATE LIMITER POUR CLOUDFLARE WORKERS
// ============================================

export interface RateLimitMiddlewareOptions {
  type?: keyof typeof RATE_LIMIT_CONFIGS;
  getIdentifier?: (request: Request, context: any) => string;
  onRateLimited?: (request: Request, result: RateLimitResult) => Response;
}

/**
 * Middleware de rate limiting pour Cloudflare Workers
 */
export function withRateLimit(
  handler: (request: Request, context: any) => Promise<Response>,
  options: RateLimitMiddlewareOptions = {}
): (request: Request, context: any) => Promise<Response> {
  const limiter = new RateLimiter(options.type || 'default');

  return async (request: Request, context: any): Promise<Response> => {
    // Identifier la requête (par défaut: IP)
    const identifier = options.getIdentifier
      ? options.getIdentifier(request, context)
      : getClientIP(request);

    // Vérifier le rate limit
    const result = limiter.check(identifier);

    // Ajouter les headers de rate limit
    const headers = new Headers();
    headers.set('X-RateLimit-Limit', String(RATE_LIMIT_CONFIGS[options.type || 'default'].maxRequests));
    headers.set('X-RateLimit-Remaining', String(result.remaining));
    headers.set('X-RateLimit-Reset', String(Math.ceil(result.resetAt / 1000)));

    if (!result.allowed) {
      // Rate limited
      if (result.retryAfter) {
        headers.set('Retry-After', String(result.retryAfter));
      }

      // Utiliser le handler personnalisé ou la réponse par défaut
      if (options.onRateLimited) {
        return options.onRateLimited(request, result);
      }

      return new Response(
        JSON.stringify({
          error: 'Too Many Requests',
          message: result.blocked
            ? 'You have been temporarily blocked due to excessive requests'
            : 'Rate limit exceeded. Please try again later.',
          retryAfter: result.retryAfter
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            ...Object.fromEntries(headers.entries())
          }
        }
      );
    }

    // Appeler le handler original
    const response = await handler(request, context);

    // Ajouter les headers de rate limit à la réponse
    const newHeaders = new Headers(response.headers);
    headers.forEach((value, key) => {
      newHeaders.set(key, value);
    });

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders
    });
  };
}

/**
 * Récupère l'IP du client depuis les headers Cloudflare
 */
function getClientIP(request: Request): string {
  // Cloudflare met l'IP réelle dans CF-Connecting-IP
  return (
    request.headers.get('CF-Connecting-IP') ||
    request.headers.get('X-Forwarded-For')?.split(',')[0]?.trim() ||
    request.headers.get('X-Real-IP') ||
    'unknown'
  );
}

// ============================================
// NETTOYAGE PÉRIODIQUE (pour éviter les fuites mémoire)
// ============================================

/**
 * Nettoie les entrées expirées du store
 */
export function cleanupExpiredEntries(): number {
  const now = Date.now();
  let cleaned = 0;

  rateLimitStore.forEach((state, key) => {
    // Supprimer si fenêtre expirée et pas bloqué
    if (state.resetAt <= now && (!state.blockedUntil || state.blockedUntil <= now)) {
      rateLimitStore.delete(key);
      cleaned++;
    }
  });

  return cleaned;
}

// Nettoyage automatique toutes les 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    cleanupExpiredEntries();
  }, 5 * 60 * 1000);
}
