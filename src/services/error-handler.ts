 
// ============================================
// GESTION CENTRALISÉE DES ERREURS
// ============================================

export interface AppError {
  code: string;
  message: string;
  details?: unknown;
  userMessage: string;
  action?: 'retry' | 'redirect' | 'contact_support';
  redirectTo?: string;
}

export class SaaSError extends Error {
  public code: string;
  public details?: unknown;
  public userMessage: string;
  public action?: 'retry' | 'redirect' | 'contact_support';
  public redirectTo?: string;

  constructor(error: AppError) {
    super(error.message);
    this.name = 'SaaSError';
    this.code = error.code;
    this.details = error.details;
    this.userMessage = error.userMessage;
    this.action = error.action;
    this.redirectTo = error.redirectTo;
  }
}

// ============================================
// CATALOGUE DES ERREURS
// ============================================

export const ERROR_CODES = {
  // Authentification
  AUTH_USER_NOT_FOUND: 'AUTH_USER_NOT_FOUND',
  AUTH_SESSION_EXPIRED: 'AUTH_SESSION_EXPIRED',
  AUTH_UNAUTHORIZED: 'AUTH_UNAUTHORIZED',

  // Crédits
  CREDITS_INSUFFICIENT: 'CREDITS_INSUFFICIENT',
  CREDITS_UPDATE_FAILED: 'CREDITS_UPDATE_FAILED',

  // Limites d'utilisation
  LIMIT_DAILY_EXCEEDED: 'LIMIT_DAILY_EXCEEDED',
  LIMIT_MONTHLY_EXCEEDED: 'LIMIT_MONTHLY_EXCEEDED',

  // Outils
  TOOL_NOT_FOUND: 'TOOL_NOT_FOUND',
  TOOL_ACCESS_DENIED: 'TOOL_ACCESS_DENIED',
  TOOL_EXECUTION_FAILED: 'TOOL_EXECUTION_FAILED',

  // Plans
  PLAN_UPGRADE_FAILED: 'PLAN_UPGRADE_FAILED',
  PLAN_NOT_FOUND: 'PLAN_NOT_FOUND',

  // Paiements
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  PAYMENT_CANCELLED: 'PAYMENT_CANCELLED',
  WEBHOOK_PROCESSING_FAILED: 'WEBHOOK_PROCESSING_FAILED',

  // Base de données
  DATABASE_CONNECTION_FAILED: 'DATABASE_CONNECTION_FAILED',
  DATABASE_QUERY_FAILED: 'DATABASE_QUERY_FAILED',

  // Réseau
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',

  // Générique
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

export const ERROR_MESSAGES: Record<string, AppError> = {
  [ERROR_CODES.AUTH_USER_NOT_FOUND]: {
    code: ERROR_CODES.AUTH_USER_NOT_FOUND,
    message: 'User not found in database',
    userMessage: 'Utilisateur non trouvé. Veuillez vous reconnecter.',
    action: 'redirect',
    redirectTo: '/sign-in',
  },

  [ERROR_CODES.CREDITS_INSUFFICIENT]: {
    code: ERROR_CODES.CREDITS_INSUFFICIENT,
    message: 'Insufficient credits for operation',
    userMessage: 'Crédits insuffisants pour cette action.',
    action: 'redirect',
    redirectTo: '/dashboard?tab=plans',
  },

  [ERROR_CODES.LIMIT_DAILY_EXCEEDED]: {
    code: ERROR_CODES.LIMIT_DAILY_EXCEEDED,
    message: 'Daily usage limit exceeded',
    userMessage: 'Limite quotidienne dépassée. Réessayez demain.',
    action: 'retry',
  },

  [ERROR_CODES.TOOL_ACCESS_DENIED]: {
    code: ERROR_CODES.TOOL_ACCESS_DENIED,
    message: 'Access denied to tool',
    userMessage: 'Accès refusé à cet outil.',
    action: 'redirect',
    redirectTo: '/dashboard',
  },

  [ERROR_CODES.PAYMENT_FAILED]: {
    code: ERROR_CODES.PAYMENT_FAILED,
    message: 'Payment processing failed',
    userMessage: 'Échec du paiement. Veuillez réessayer.',
    action: 'retry',
  },

  [ERROR_CODES.DATABASE_CONNECTION_FAILED]: {
    code: ERROR_CODES.DATABASE_CONNECTION_FAILED,
    message: 'Failed to connect to database',
    userMessage: 'Problème de connexion. Veuillez réessayer.',
    action: 'retry',
  },

  [ERROR_CODES.NETWORK_ERROR]: {
    code: ERROR_CODES.NETWORK_ERROR,
    message: 'Network request failed',
    userMessage: 'Problème de connexion réseau. Vérifiez votre connexion.',
    action: 'retry',
  },

  [ERROR_CODES.UNKNOWN_ERROR]: {
    code: ERROR_CODES.UNKNOWN_ERROR,
    message: 'An unexpected error occurred',
    userMessage: 'Une erreur inattendue s\'est produite. Veuillez réessayer.',
    action: 'contact_support',
  },
};

// ============================================
// UTILITAIRES DE GESTION D'ERREUR
// ============================================

export const errorHandler = {
  /**
   * Convertit une erreur en SaaSError
   */
  normalizeError(error: unknown): SaaSError {
    if (error instanceof SaaSError) {
      return error;
    }

    // Erreurs Supabase
    if (error && typeof error === 'object' && 'code' in error) {
      const supabaseError = error as { code?: string; type?: string; message?: string };
      switch (supabaseError.code) {
        case 'PGRST116': // Not found
          return new SaaSError(ERROR_MESSAGES[ERROR_CODES.AUTH_USER_NOT_FOUND]);
        case '23505': // Unique constraint violation
          return new SaaSError({
            ...ERROR_MESSAGES[ERROR_CODES.UNKNOWN_ERROR],
            message: 'Duplicate entry',
            userMessage: 'Cette action a déjà été effectuée.',
          });
        default:
          return new SaaSError({
            ...ERROR_MESSAGES[ERROR_CODES.DATABASE_QUERY_FAILED],
            details: supabaseError,
          });
      }
    }

    // Erreurs réseau
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return new SaaSError(ERROR_MESSAGES[ERROR_CODES.NETWORK_ERROR]);
    }

    // Erreurs Stripe
    if (error && typeof error === 'object' && 'type' in error) {
      const stripeError = error as { code?: string; type?: string; message?: string };
      if (stripeError.type === 'card_error') {
        return new SaaSError({
          ...ERROR_MESSAGES[ERROR_CODES.PAYMENT_FAILED],
          details: stripeError,
          userMessage: stripeError.message || 'Erreur de paiement.',
        });
      }
    }

    // Erreur générique
    return new SaaSError({
      ...ERROR_MESSAGES[ERROR_CODES.UNKNOWN_ERROR],
      details: error,
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  },

  /**
   * Gère une erreur et retourne une réponse appropriée
   */
  handleError(error: unknown, context?: string): {
    error: SaaSError;
    toastMessage: string;
    action?: 'retry' | 'redirect' | 'contact_support';
    redirectTo?: string;
  } {
    const normalizedError = this.normalizeError(error);

    logger.error(`[${context || 'UNKNOWN'}] ${normalizedError.code}:`, normalizedError.message, normalizedError.details);

    return {
      error: normalizedError,
      toastMessage: normalizedError.userMessage,
      action: normalizedError.action,
      redirectTo: normalizedError.redirectTo,
    };
  },

  /**
   * Wrapper pour les opérations async avec gestion d'erreur
   */
  async withErrorHandling<T>(
    operation: () => Promise<T>,
    context?: string
  ): Promise<{ success: boolean; data?: T; error?: SaaSError }> {
    try {
      const data = await operation();
      return { success: true, data };
    } catch (error) {
      const { error: normalizedError } = this.handleError(error, context);
      return { success: false, error: normalizedError };
    }
  },

  /**
   * Valide les données d'entrée
   */
  validateInput(data: Record<string, unknown>, schema: Record<string, (value: unknown) => boolean>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    for (const [field, validator] of Object.entries(schema)) {
      if (!validator(data[field])) {
        errors.push(`${field} est invalide`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  },
};

// ============================================
// HOOK POUR GESTION D'ERREURS DANS LES COMPOSANTS
// ============================================

export function useErrorHandler() {
  const { toast } = useToast();

  const handleError = (error: unknown, context?: string) => {
    const { toastMessage, action, redirectTo } = errorHandler.handleError(error, context);

    toast({
      title: "Erreur",
      description: toastMessage,
      variant: "destructive",
    });

    if (action === 'redirect' && redirectTo) {
      // Utiliser navigate ou window.location selon le contexte
      setTimeout(() => {
        window.location.href = redirectTo;
      }, 2000);
    }
  };

  const withErrorHandling = async <T,>(
    operation: () => Promise<T>,
    context?: string
  ): Promise<T | null> => {
    const result = await errorHandler.withErrorHandling(operation, context);

    if (!result.success && result.error) {
      handleError(result.error, context);
      return null;
    }

    return result.data || null;
  };

  return {
    handleError,
    withErrorHandling,
  };
}

// Import dynamique pour éviter les dépendances circulaires
import { useToast } from "@/components/ui/use-toast";
import { logger } from '@/services/logger';
