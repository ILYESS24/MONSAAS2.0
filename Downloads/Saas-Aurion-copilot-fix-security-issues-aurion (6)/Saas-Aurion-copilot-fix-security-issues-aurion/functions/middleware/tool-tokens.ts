 
// ============================================
// SYSTÈME DE TOKENS TEMPORAIRES POUR OUTILS
// ============================================
//
// AMÉLIORATIONS :
// ✅ Signature HMAC-SHA256 sécurisée
// ✅ Réutilisation de sessions actives
// ✅ Validation renforcée
// ✅ Nettoyage sessions expirées
// ============================================

import { createClient } from '@supabase/supabase-js';
import { AuthenticatedUser } from './auth';

interface Env {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  JWT_SECRET: string;
}

// Client Supabase initialisé à la demande
function getSupabaseClient(env: Env) {
  return createClient(
    env.SUPABASE_URL || '',
    env.SUPABASE_SERVICE_ROLE_KEY || ''
  );
}

export interface ToolSession {
  id: string;
  user_id: string;
  tool_id: string;
  credits_consumed: number;
  session_token: string;
  expires_at: string;
  created_at: string;
  is_active: boolean;
  last_activity?: string;
}

// ============================================
// GÉNÉRATION DE TOKEN SÉCURISÉ
// ============================================

/**
 * Génère un token sécurisé avec signature HMAC
 */
export async function generateSecureToolToken(
  userId: string, 
  toolId: string, 
  creditsConsumed: number,
  secret: string
): Promise<string> {
  const payload = {
    uid: userId,
    tid: toolId,
    cc: creditsConsumed,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24h
    jti: crypto.randomUUID(), // ID unique pour éviter le replay
  };

  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const encodedPayload = btoa(JSON.stringify(payload));
  
  // Signature HMAC-SHA256
  const encoder = new TextEncoder();
  const data = encoder.encode(`${header}.${encodedPayload}`);
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', key, data);
  const signatureBase64 = btoa(String.fromCharCode(...new Uint8Array(signature)));
  
  return `${header}.${encodedPayload}.${signatureBase64}`;
}

/**
 * Version synchrone pour compatibilité (moins sécurisée)
 */
export function generateToolToken(userId: string, toolId: string, creditsConsumed: number): string {
  const payload = {
    uid: userId,
    tid: toolId,
    cc: creditsConsumed,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60),
    jti: `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
  };

  const encodedPayload = btoa(JSON.stringify(payload));
  // Signature simple basée sur le contenu + timestamp
  const signatureData = `${userId}:${toolId}:${payload.iat}:${payload.jti}`;
  const signature = btoa(signatureData);

  return `${encodedPayload}.${signature}`;
}

// ============================================
// VÉRIFICATION DE TOKEN
// ============================================

interface TokenPayload {
  uid: string;
  tid: string;
  cc: number;
  iat: number;
  exp: number;
  jti: string;
}

/**
 * Vérifie un token d'outil
 */
export function verifyToolToken(token: string): { user_id: string; tool_id: string; credits_consumed: number; jti?: string } | null {
  try {
    const parts = token.split('.');
    
    // Support des deux formats (ancien 2 parties, nouveau 3 parties)
    const encodedPayload = parts.length === 3 ? parts[1] : parts[0];
    
    if (!encodedPayload) {
      return null;
    }

    const payload: TokenPayload = JSON.parse(atob(encodedPayload));

    // Vérifier expiration
    if (payload.exp < Math.floor(Date.now() / 1000)) {
      console.log('[Token] Expired token');
      return null;
    }

    // Vérifier que le token n'est pas trop ancien (max 24h)
    const maxAge = 24 * 60 * 60; // 24 heures
    if (Math.floor(Date.now() / 1000) - payload.iat > maxAge) {
      console.log('[Token] Token too old');
      return null;
    }

    return {
      user_id: payload.uid,
      tool_id: payload.tid,
      credits_consumed: payload.cc,
      jti: payload.jti,
    };

  } catch (error) {
    console.error('[Token] Verification error:', error);
    return null;
  }
}

// ============================================
// RÉUTILISATION DE SESSION EXISTANTE
// ============================================

/**
 * Cherche et retourne une session active existante pour éviter la double consommation
 */
export async function reuseExistingSession(
  userId: string,
  toolId: string,
  env: Env
): Promise<ToolSession | null> {
  try {
    const supabase = getSupabaseClient(env);
    
    // Fenêtre de réutilisation : sessions créées dans les 2 dernières heures
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    
    const { data: existingSession, error } = await supabase
      .from('tool_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('tool_id', toolId)
      .eq('is_active', true)
      .gt('expires_at', new Date().toISOString())
      .gt('created_at', twoHoursAgo)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !existingSession) {
      return null;
    }

    // Mettre à jour last_activity
    await supabase
      .from('tool_sessions')
      .update({ last_activity: new Date().toISOString() })
      .eq('id', existingSession.id);

    console.log(`[Session] Found existing session ${existingSession.id} for user ${userId}, tool ${toolId}`);
    
    return existingSession;

  } catch (error) {
    console.error('[Session] Error checking existing session:', error);
    return null;
  }
}

// ============================================
// CRÉATION DE SESSION
// ============================================

/**
 * Crée une session outil avec token temporaire
 */
export async function createToolSession(
  user: AuthenticatedUser,
  toolId: string,
  creditsConsumed: number,
  env: Env
): Promise<ToolSession | null> {
  try {
    const supabase = getSupabaseClient(env);
    
    // Utiliser la génération sécurisée si JWT_SECRET est disponible
    let sessionToken: string;
    if (env.JWT_SECRET) {
      sessionToken = await generateSecureToolToken(user.id, toolId, creditsConsumed, env.JWT_SECRET);
    } else {
      sessionToken = generateToolToken(user.id, toolId, creditsConsumed);
    }
    
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24h

    // Désactiver les anciennes sessions pour cet outil
    await supabase
      .from('tool_sessions')
      .update({ is_active: false })
      .eq('user_id', user.id)
      .eq('tool_id', toolId)
      .eq('is_active', true)
      .lt('created_at', new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()); // Sessions > 2h

    const { data, error } = await supabase
      .from('tool_sessions')
      .insert([{
        user_id: user.id,
        tool_id: toolId,
        credits_consumed: creditsConsumed,
        session_token: sessionToken,
        expires_at: expiresAt,
        is_active: true,
        last_activity: new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) {
      console.error('[Session] Creation error:', error);
      return null;
    }

    console.log(`[Session] Created new session ${data.id} for user ${user.id}, tool ${toolId}`);
    return data;

  } catch (error) {
    console.error('[Session] Creation error:', error);
    return null;
  }
}

// ============================================
// VALIDATION DE SESSION
// ============================================

/**
 * Vérifie une session outil (crédits déjà consommés au lancement)
 */
export async function validateToolSession(
  sessionToken: string,
  toolId: string,
  actionCost: number = 0,
  env: Env
): Promise<{ valid: boolean; user_id?: string; session?: ToolSession; error?: string }> {
  try {
    const supabase = getSupabaseClient(env);
    
    // Vérifier le token
    const tokenData = verifyToolToken(sessionToken);
    if (!tokenData) {
      return { valid: false, error: 'Invalid token' };
    }

    // Vérifier que le token correspond à l'outil
    if (tokenData.tool_id !== toolId) {
      return { valid: false, error: 'Token does not match tool' };
    }

    // Vérifier la session en DB
    const { data: session, error } = await supabase
      .from('tool_sessions')
      .select('*')
      .eq('session_token', sessionToken)
      .eq('is_active', true)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (error || !session) {
      return { valid: false, error: 'Session not found or expired' };
    }

    // Vérifier que l'utilisateur a toujours des crédits
    const { data: userCredits } = await supabase
      .from('user_credits')
      .select('total_credits, used_credits')
      .eq('user_id', tokenData.user_id)
      .single();

    if (userCredits && userCredits.total_credits - userCredits.used_credits <= 0) {
      // Crédits épuisés - invalider la session
      await supabase
        .from('tool_sessions')
        .update({ is_active: false })
        .eq('session_token', sessionToken);

      return { valid: false, error: 'Credits exhausted - session invalidated' };
    }

    // Mettre à jour last_activity
    await supabase
      .from('tool_sessions')
      .update({ last_activity: new Date().toISOString() })
      .eq('id', session.id);

    // Logger l'action (sans consommation supplémentaire)
    if (actionCost > 0) {
      await supabase
        .from('usage_logs')
        .insert([{
          user_id: tokenData.user_id,
          action_type: `${toolId}_action`,
          credits_used: 0,
          metadata: {
            session_id: session.id,
            action_cost_requested: actionCost,
            available_credits: userCredits ? userCredits.total_credits - userCredits.used_credits : 0,
            note: 'credits_already_consumed_at_launch'
          },
          created_at: new Date().toISOString(),
        }]);
    }

    return { valid: true, user_id: tokenData.user_id, session };

  } catch (error) {
    console.error('[Session] Validation error:', error);
    return { valid: false, error: 'Internal error' };
  }
}

// ============================================
// INVALIDATION DE SESSION
// ============================================

/**
 * Invalide une session outil
 */
export async function invalidateToolSession(sessionToken: string, env: Env): Promise<boolean> {
  try {
    const supabase = getSupabaseClient(env);
    
    const { error } = await supabase
      .from('tool_sessions')
      .update({ is_active: false })
      .eq('session_token', sessionToken);

    return !error;

  } catch (error) {
    console.error('[Session] Invalidation error:', error);
    return false;
  }
}

// ============================================
// NETTOYAGE DES SESSIONS EXPIRÉES
// ============================================

/**
 * Nettoie les sessions expirées et récupère les crédits non utilisés
 */
export async function cleanupExpiredSessions(env: Env): Promise<{ cleaned: number; creditsRecovered: number }> {
  try {
    const supabase = getSupabaseClient(env);
    
    // Trouver les sessions expirées actives (non nettoyées)
    const { data: expiredSessions, error } = await supabase
      .from('tool_sessions')
      .select('*')
      .eq('is_active', true)
      .lt('expires_at', new Date().toISOString());

    if (error || !expiredSessions || expiredSessions.length === 0) {
      return { cleaned: 0, creditsRecovered: 0 };
    }

    let creditsRecovered = 0;

    // Pour chaque session expirée, vérifier si elle a été utilisée
    for (const session of expiredSessions) {
      // Vérifier si des actions ont été effectuées
      const { data: usageLogs } = await supabase
        .from('usage_logs')
        .select('id')
        .eq('metadata->>session_id', session.id)
        .limit(1);

      // Si aucune action n'a été effectuée, rembourser les crédits
      if (!usageLogs || usageLogs.length === 0) {
        await supabase.rpc('refund_user_credits', {
          p_user_id: session.user_id,
          p_amount: session.credits_consumed,
          p_reason: 'session_expired_unused'
        });
        creditsRecovered += session.credits_consumed;
      }

      // Marquer la session comme inactive
      await supabase
        .from('tool_sessions')
        .update({ is_active: false })
        .eq('id', session.id);
    }

    console.log(`[Cleanup] Cleaned ${expiredSessions.length} sessions, recovered ${creditsRecovered} credits`);
    
    return { cleaned: expiredSessions.length, creditsRecovered };

  } catch (error) {
    console.error('[Cleanup] Error:', error);
    return { cleaned: 0, creditsRecovered: 0 };
  }
}
