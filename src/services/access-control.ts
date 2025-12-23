/* eslint-disable @typescript-eslint/no-explicit-any */
import { creditsService, planService } from './supabase-db';
import { logger } from '@/services/logger';
import { PLANS, TOOL_COSTS } from '@/types/plans';

export interface AccessCheck {
  allowed: boolean;
  reason?: string;
  suggestedPlan?: string;
  creditsRequired?: number;
  creditsAvailable?: number;
  dailyRemaining?: number | null;
  monthlyRemaining?: number | null;
}

export interface UsageResult {
  success: boolean;
  creditsUsed: number;
  remainingCredits: number;
  error?: string;
}

// ============================================
// SERVICE DE CONTRÔLE D'ACCÈS
// ============================================

export const accessControl = {
  /**
   * Checks if user can access a tool
   */
  async checkAccess(toolType: string): Promise<AccessCheck> {
    try {
      const [credits, plan] = await Promise.all([
        creditsService.getCredits(),
        planService.getCurrentPlan(),
      ]);

      if (!credits) {
        return {
          allowed: false,
          reason: 'User not found',
        };
      }

      // Vérifier les crédits disponibles
      const cost = TOOL_COSTS[toolType as keyof typeof TOOL_COSTS] || 0;
      const availableCredits = credits.total_credits - credits.used_credits;

      if (availableCredits < cost) {
        return {
          allowed: false,
          reason: `Insufficient credits. ${cost} credits required, ${availableCredits} available.`,
          creditsRequired: cost,
          creditsAvailable: availableCredits,
          suggestedPlan: this.getSuggestedPlan(plan?.plan_type, toolType),
        };
      }

      // Vérifier les limites du plan
      if (plan) {
        const planConfig = PLANS[plan.plan_type];
        const toolConfig = planConfig.features.find(f => f.tool === toolType);

        if (!toolConfig || !toolConfig.enabled) {
          return {
            allowed: false,
            reason: `Tool not available in your ${planConfig.name} plan`,
            suggestedPlan: this.getSuggestedPlan(plan.plan_type, toolType),
          };
        }

        // Vérifier les limites quotidiennes/mensuelles
        const limits = await this.checkUsageLimits(plan, toolType);
        if (!limits.allowed) {
          return {
            allowed: false,
            reason: limits.reason || 'Usage limit reached',
            creditsRequired: cost,
            creditsAvailable: availableCredits,
            suggestedPlan: this.getSuggestedPlan(plan.plan_type, toolType),
          };
        }
      }

      return { allowed: true };
    } catch (error) {
      logger.error('Error during access verification:', error);
      return {
        allowed: false,
        reason: 'Access verification error',
      };
    }
  },

  /**
   * Checks daily/monthly usage limits
   */
  async checkUsageLimits(plan: any, toolType: string): Promise<{ allowed: boolean; reason?: string; dailyRemaining?: number; monthlyRemaining?: number }> {
    try {
      const planConfig = PLANS[plan.plan_type];
      const toolConfig = planConfig.features.find(f => f.tool === toolType);

      if (!toolConfig) {
        return { allowed: false, reason: 'Tool configuration not found' };
      }

      // VERROUILLAGE BASE DE DONNÉES : Éviter race conditions sur limites
      // Utiliser une fonction PostgreSQL avec SELECT FOR UPDATE
      const { supabase } = await import('@/lib/supabase');

      // Calculer les dates
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

      try {
        // Fonction PostgreSQL sécurisée pour vérifier les limites avec verrouillage
        const { data: limitCheck, error } = await supabase.rpc('check_tool_limits', {
          p_user_id: plan.user_id,
          p_tool_type: toolType,
          p_today: today,
          p_current_month: currentMonth,
          p_daily_limit: toolConfig.dailyLimit || null,
          p_monthly_limit: toolConfig.monthlyLimit || null
        });

        if (error) {
          logger.error('Error checking tool limits:', error);
          return { allowed: false, reason: 'Limit verification error' };
        }

        // Interpréter le résultat
        if (!limitCheck.allowed) {
          return {
            allowed: false,
            reason: limitCheck.reason,
            dailyRemaining: limitCheck.daily_remaining,
            monthlyRemaining: limitCheck.monthly_remaining,
          };
        }

        return {
          allowed: true,
          dailyRemaining: limitCheck.daily_remaining,
          monthlyRemaining: limitCheck.monthly_remaining,
        };

      } catch (rpcError) {
        logger.error('RPC check_tool_limits failed:', rpcError);
        // Fallback: permettre l'accès en cas d'erreur technique
        // Mais logger pour monitoring
        logger.warn('⚠️ Fallback limit check - RPC failed', { userId: plan.user_id, toolType });
        return { allowed: true };
      }

    } catch (error) {
      logger.error('Error checking usage limits:', error);
      // En cas d'erreur, refuser l'accès pour sécurité
      return { allowed: false, reason: 'Usage limit verification failed' };
    }
  },

  /**
   * Consumes credits for an action
   */
  async consumeCredits(toolType: string, metadata: Record<string, unknown> = {}): Promise<UsageResult> {
    try {
      const cost = TOOL_COSTS[toolType as keyof typeof TOOL_COSTS] || 0;

      const result = await creditsService.useCredits(toolType, cost, metadata);

      return {
        success: result.success,
        creditsUsed: result.creditsUsed,
        remainingCredits: result.remaining,
        error: result.error,
      };
    } catch (error) {
      logger.error('Error during credit consumption:', error);
      return {
        success: false,
        creditsUsed: 0,
        remainingCredits: 0,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      };
    }
  },

  /**
   * Checks if user can perform an action without consuming it
   */
  async canPerformAction(toolType: string): Promise<boolean> {
    const check = await this.checkAccess(toolType);
    return check.allowed;
  },

  /**
   * Performs a complete action: verification + consumption
   */
  async performAction(toolType: string, metadata: Record<string, unknown> = {}): Promise<{
    allowed: boolean;
    performed: boolean;
    reason?: string;
    creditsUsed: number;
    remainingCredits: number;
  }> {
    const accessCheck = await this.checkAccess(toolType);

    if (!accessCheck.allowed) {
      return {
        allowed: false,
        performed: false,
        reason: accessCheck.reason,
        creditsUsed: 0,
        remainingCredits: accessCheck.creditsAvailable || 0,
      };
    }

    const usageResult = await this.consumeCredits(toolType, metadata);

    // Real-time notification if credits exhausted
    if (usageResult.success && usageResult.remainingCredits === 0) {
      // Émettre un événement temps réel via Supabase
      try {
        const { supabase } = await import('@/lib/supabase');
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase
            .from('usage_logs')
            .insert([{
              user_id: user.id,
              action_type: 'credits_exhausted',
              credits_used: 0,
              metadata: {
                tool_used: toolType,
                last_action: metadata,
                exhausted_at: new Date().toISOString()
              },
              created_at: new Date().toISOString(),
            }]);
        }
      } catch (error) {
        logger.warn('Error notifying exhausted credits:', error);
      }
    }

    return {
      allowed: true,
      performed: usageResult.success,
      reason: usageResult.error,
      creditsUsed: usageResult.creditsUsed,
      remainingCredits: usageResult.remainingCredits,
    };
  },

  /**
   * Suggests a higher plan to access a tool
   */
  getSuggestedPlan(currentPlan: string | undefined, toolType: string): string | undefined {
    const planHierarchy = ['free', 'starter', 'plus', 'pro', 'enterprise'];
    const currentIndex = currentPlan ? planHierarchy.indexOf(currentPlan) : 0;

    // Find the first plan that allows this tool
    for (let i = currentIndex + 1; i < planHierarchy.length; i++) {
      const planType = planHierarchy[i];
      const planConfig = PLANS[planType];
      const toolConfig = planConfig.features.find(f => f.tool === toolType);

      if (toolConfig?.enabled) {
        return planType;
      }
    }

    return undefined;
  },

  /**
   * Vérifie si l'utilisateur a épuisé ses crédits
   */
  async hasCreditsExhausted(): Promise<boolean> {
    try {
      const credits = await creditsService.getCredits();
      if (!credits) return true;

      return credits.total_credits - credits.used_credits <= 0;
    } catch {
      return true;
    }
  },

  /**
   * Obtient les informations de blocage pour l'utilisateur
   */
  async getBlockageInfo(): Promise<{
    isBlocked: boolean;
    reason: string;
    suggestedAction?: string;
    suggestedPlan?: string;
  }> {
    const creditsExhausted = await this.hasCreditsExhausted();

    if (creditsExhausted) {
      return {
        isBlocked: true,
        reason: 'Vous avez épuisé vos 100 crédits d\'essai gratuit',
        suggestedAction: 'Abonnez-vous à un plan payant pour continuer à utiliser nos outils',
        suggestedPlan: 'starter',
      };
    }

    return {
      isBlocked: false,
      reason: 'Accès autorisé',
    };
  },
};

// ============================================
// MIDDLEWARE POUR LES OUTILS
// ============================================

export const toolMiddleware = {
  /**
   * Middleware à utiliser avant d'ouvrir un outil
   */
  async beforeToolAccess(toolType: string): Promise<{
    canAccess: boolean;
    error?: string;
    redirectTo?: string;
  }> {
    const accessCheck = await accessControl.checkAccess(toolType);

    if (!accessCheck.allowed) {
      // Rediriger vers le dashboard avec un message d'erreur
      return {
        canAccess: false,
        error: accessCheck.reason,
        redirectTo: '/dashboard?error=access_denied&tool=' + toolType,
      };
    }

    return { canAccess: true };
  },

  /**
   * Middleware pour consommer des crédits après utilisation d'un outil
   */
  async afterToolUsage(toolType: string, metadata: Record<string, unknown> = {}): Promise<boolean> {
    try {
      const result = await accessControl.consumeCredits(toolType, metadata);
      return result.success;
    } catch (error) {
      logger.error('Error during credit consumption:', error);
      return false;
    }
  },
};
