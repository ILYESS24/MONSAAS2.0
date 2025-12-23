// Cloudflare Function - Create Stripe Checkout Session (Public - No Auth Required)
// POST /api/create-checkout-public

import Stripe from 'stripe';

interface Env {
  STRIPE_SECRET_KEY: string;
  STRIPE_PUBLISHABLE_KEY: string;
}

// Configuration avec les vrais Price IDs Stripe
const PLAN_CONFIGS = {
  starter: { priceId: 'price_1Sgj2s018rEaMULFGFZmqHQj', name: 'AURION Starter', credits: 1000 },
  plus: { priceId: 'price_1Sgj5E018rEaMULFKnB2L24E', name: 'AURION Plus', credits: 5000 },
  pro: { priceId: 'price_1SgmNR018rEaMULFf6eBgFpT', name: 'AURION Pro', credits: 25000 },
  enterprise: { priceId: 'price_1Sgj70018rEaMULFAr4izWzO', name: 'AURION Enterprise', credits: 100000 }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };

  try {
    const body = await context.request.json() as {
      planId: string;
      successUrl: string;
      cancelUrl: string;
      customerEmail?: string;
    };

    const { planId, successUrl, cancelUrl, customerEmail } = body;

    // Vérifier le plan ID
    if (!planId || !PLAN_CONFIGS[planId]) {
      return new Response(
        JSON.stringify({
          error: 'Invalid plan ID',
          availablePlans: Object.keys(PLAN_CONFIGS),
          receivedPlanId: planId
        }),
        { status: 400, headers: corsHeaders }
      );
    }

    const planConfig = PLAN_CONFIGS[planId];

    // Configuration Stripe simplifiée (comme avant)
    const STRIPE_SECRET_KEY = 'sk_live_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';

    const stripe = new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
    });

    // Créer une session de checkout simple (comme avant)
    try {
      const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: planConfig.name,
              description: `${planConfig.credits} crédits IA`,
            },
            unit_amount: planId === 'starter' ? 900 :
                        planId === 'plus' ? 2900 :
                        planId === 'pro' ? 9900 : 49900,
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl || `${new URL(context.request.url).origin}/dashboard?payment=success`,
      cancel_url: cancelUrl || `${new URL(context.request.url).origin}/dashboard?payment=cancelled`,
      customer_email: customerEmail,
      metadata: {
        plan_id: planId,
        credits: planConfig.credits.toString(),
      },
    });

      return new Response(
        JSON.stringify({
          url: session.url,
          sessionId: session.id,
          planId: planId
        }),
        { status: 200, headers: corsHeaders }
      );
    } catch (stripeError: any) {
      console.error('Stripe checkout error:', stripeError);
      return new Response(
        JSON.stringify({
          error: 'Stripe checkout creation failed',
          details: stripeError.message || 'Unknown Stripe error',
          type: stripeError.type || 'Unknown error type',
          code: stripeError.code || 'Unknown error code',
          planId: planId,
          priceId: planConfig.priceId
        }),
        { status: 500, headers: corsHeaders }
      );
    }

  } catch (error: any) {
    console.error('General error:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        details: error.message
      }),
      { status: 500, headers: corsHeaders }
    );
  }
};
