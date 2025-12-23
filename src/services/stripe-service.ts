/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
// Stripe Service - Frontend Integration
// Gère les redirections vers Stripe Checkout

import { env } from '@/config/env';
import { logger } from '@/services/logger';
import { safeJsonResponse } from '@/lib/utils';

// Utiliser la clé publique depuis la configuration
const STRIPE_PUBLISHABLE_KEY = env.STRIPE_PUBLISHABLE_KEY;

// Types
export type PlanId = 'starter' | 'plus' | 'pro' | 'enterprise';

export interface CheckoutResult {
  success: boolean;
  url?: string;
  error?: string;
}

export interface SubscriptionStatus {
  active: boolean;
  planId: PlanId | null;
  expiresAt: string | null;
}

// Prix IDs Stripe (à configurer dans le dashboard Stripe)
// Ces IDs doivent correspondre aux produits/prix créés dans votre compte Stripe
const STRIPE_PRICE_IDS: Record<PlanId, { monthly: string; yearly: string }> = {
  starter: {
    monthly: 'price_starter_monthly', // Remplacer par le vrai ID
    yearly: 'price_starter_yearly',
  },
  plus: {
    monthly: 'price_plus_monthly',
    yearly: 'price_plus_yearly',
  },
  pro: {
    monthly: 'price_pro_monthly',
    yearly: 'price_pro_yearly',
  },
  enterprise: {
    monthly: 'price_enterprise_monthly',
    yearly: 'price_enterprise_yearly',
  },
};

// ============================================
// STRIPE CHECKOUT
// ============================================

/**
 * Crée une session Stripe Checkout et redirige l'utilisateur
 */
export async function redirectToCheckout(
  planId: PlanId,
  customerEmail?: string
): Promise<CheckoutResult> {
  try {
    console.log('🔄 redirectToCheckout called with:', { planId, customerEmail });
    console.log('🔑 STRIPE_PUBLISHABLE_KEY available:', !!STRIPE_PUBLISHABLE_KEY, STRIPE_PUBLISHABLE_KEY?.substring(0, 10) + '...');

    // Vérifier si la clé Stripe est configurée
    if (!STRIPE_PUBLISHABLE_KEY) {
      logger.warn('Stripe publishable key not configured');
      return {
        success: false,
        error: 'Stripe n\'est pas configuré. Veuillez configurer VITE_STRIPE_PUBLISHABLE_KEY dans .env.local'
      };
    }

    // Utiliser l'API publique qui ne nécessite pas d'authentification
    const apiUrl = '/api/create-checkout-public';
    console.log('📡 Calling API:', apiUrl);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        planId,
        successUrl: `${window.location.origin}/dashboard?payment=success`,
        cancelUrl: `${window.location.origin}/dashboard?payment=cancelled`,
        customerEmail,
      }),
    });

    console.log('📡 API response status:', response.status);

    if (response.ok) {
      const data = await safeJsonResponse(response);
      console.log('📦 API response data:', data);

      if (data.url) {
        console.log('✅ Checkout URL received:', data.url);
        // Retourner les données de succès - la redirection sera gérée par le composant
        return { success: true, url: data.url };
      } else {
        console.log('❌ No URL in API response');
        return { success: false, error: 'No checkout URL received from server' };
      }
    }

    // Si l'API échoue, afficher un message d'erreur
    let errorData;
    try {
      errorData = await safeJsonResponse(response);
    } catch (e) {
      errorData = { error: `Server error (HTTP ${response.status})` };
    }
    console.log('❌ API error response:', errorData);
    logger.error('Checkout API failed:', errorData);
    return { success: false, error: errorData.error || 'API request failed' };

  } catch (error: any) {
    console.error('❌ Checkout error:', error);
    logger.error('Checkout error:', error);
    return { success: false, error: error.message || 'Failed to create checkout session' };
  }
}

// Fonction supprimée - évite la duplication

// ============================================
// PLAN DETAILS
// ============================================

export const STRIPE_PLANS = {
  starter: {
    id: 'starter',
    name: 'Starter',
    price: 9,
    priceDisplay: '9€',
    interval: 'mois',
    features: [
      '500 crédits IA pour tous vos projets',
      'Création d\'images et vidéos de base',
      'Accès à tous les outils IA',
      'Support par email sous 48h',
      'Utilisation personnelle et commerciale',
    ],
  },
  plus: {
    id: 'plus',
    name: 'Plus',
    price: 29,
    priceDisplay: '29€',
    interval: 'mois',
    popular: true,
    features: [
      '2 000 crédits IA par mois',
      'Générations d\'images haute qualité',
      'Création de vidéos professionnelles',
      'Support prioritaire 24h/7j',
      'Accès anticipé aux nouvelles fonctionnalités',
      'API pour intégrations simples',
    ],
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 79,
    priceDisplay: '79€',
    interval: 'mois',
    features: [
      '10 000 crédits IA par mois',
      'Générations d\'images et vidéos illimitées',
      'Exports en haute définition',
      'Support technique dédié par chat',
      'Accès à toutes les fonctionnalités avancées',
      'API complète pour développeurs',
      'Exports et téléchargements prioritaires',
    ],
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 199,
    priceDisplay: '199€',
    interval: 'mois',
    features: [
      'Crédits IA véritablement illimités',
      'Account manager dédié',
      'Support téléphonique prioritaire',
      'Formation personnalisée pour votre équipe',
      'Intégrations API sur mesure',
      'SLA de disponibilité 99,9%',
      'Solution personnalisable (white-label)',
    ],
  },
} as const;

// ============================================
// HELPERS
// ============================================

/**
 * Vérifie si le paiement a réussi (après redirection)
 */
export function checkPaymentStatus(): 'success' | 'cancelled' | null {
  const params = new URLSearchParams(window.location.search);
  
  if (params.get('payment') === 'success') {
    return 'success';
  }
  
  if (params.get('payment') === 'cancelled') {
    return 'cancelled';
  }
  
  return null;
}

/**
 * Nettoie les paramètres de paiement de l'URL
 */
export function clearPaymentParams(): void {
  const url = new URL(window.location.href);
  url.searchParams.delete('payment');
  url.searchParams.delete('session_id');
  window.history.replaceState({}, '', url.toString());
}

