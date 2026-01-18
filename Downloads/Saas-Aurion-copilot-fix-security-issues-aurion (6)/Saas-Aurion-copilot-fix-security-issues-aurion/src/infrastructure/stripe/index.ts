/**
 * @module infrastructure/stripe
 * @description Stripe payment integration
 */

// Stripe constants
export const STRIPE_PUBLIC_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

// Plan price IDs
export const STRIPE_PRICES = {
  starter: {
    monthly: import.meta.env.VITE_STRIPE_STARTER_MONTHLY,
    yearly: import.meta.env.VITE_STRIPE_STARTER_YEARLY,
  },
  plus: {
    monthly: import.meta.env.VITE_STRIPE_PLUS_MONTHLY,
    yearly: import.meta.env.VITE_STRIPE_PLUS_YEARLY,
  },
  pro: {
    monthly: import.meta.env.VITE_STRIPE_PRO_MONTHLY,
    yearly: import.meta.env.VITE_STRIPE_PRO_YEARLY,
  },
  enterprise: {
    monthly: import.meta.env.VITE_STRIPE_ENTERPRISE_MONTHLY,
    yearly: import.meta.env.VITE_STRIPE_ENTERPRISE_YEARLY,
  },
} as const;
