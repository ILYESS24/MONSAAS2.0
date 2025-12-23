// Cloudflare Function - Create Stripe Checkout Session (Public - No Auth Required)
// POST /api/create-checkout-public

import Stripe from 'stripe';

interface Env {
  STRIPE_SECRET_KEY: string;
  STRIPE_PUBLISHABLE_KEY: string;
}

// Product IDs Stripe (vrais produits configurés dans le dashboard)
const STRIPE_PRODUCTS: Record<string, { productId: string; name: string; credits: number }> = {
  starter: { productId: 'prod_Te15MpLvqryJHB', name: 'AURION Starter', credits: 1000 },
  plus: { productId: 'prod_Te17AfjPBXJkMf', name: 'AURION Plus', credits: 5000 },
  pro: { productId: 'prod_Te4WWQ2JdqTiJ0', name: 'AURION Pro', credits: 25000 },
  enterprise: { productId: 'prod_Te19LcD17x07QV', name: 'AURION Enterprise', credits: 100000 },
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };

  // Log basic request info for debugging

  try {
    const body = await context.request.json() as {
      planId: string;
      successUrl: string;
      cancelUrl: string;
      customerEmail?: string;
    };

    const { planId, successUrl, cancelUrl, customerEmail } = body;

    if (!planId || !STRIPE_PRODUCTS[planId]) {
      return new Response(
        JSON.stringify({ error: 'Invalid plan ID', availablePlans: Object.keys(STRIPE_PRODUCTS) }),
        { status: 400, headers: corsHeaders }
      );
    }

    const plan = STRIPE_PRODUCTS[planId];

    // Initialize Stripe
    if (!context.env.STRIPE_SECRET_KEY) {
      return new Response(
        JSON.stringify({ error: 'Stripe configuration missing' }),
        { status: 500, headers: corsHeaders }
      );
    }

    const stripe = new Stripe(context.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
    });

    // Get prices for the product
    let prices;
    try {
      prices = await stripe.prices.list({
        product: plan.productId,
        active: true,
      });
    } catch (stripeError) {
      return new Response(
        JSON.stringify({ error: 'Stripe API error', details: stripeError.message }),
        { status: 500, headers: corsHeaders }
      );
    }

    let price;

    if (prices.data.length === 0) {
      // Create dynamic price if none exists
      const unitAmount = planId === 'starter' ? 900 : // 9€
                         planId === 'plus' ? 2900 :    // 29€
                         planId === 'pro' ? 9900 :     // 99€
                         49900; // Enterprise 499€

      try {
        price = await stripe.prices.create({
          product: plan.productId,
          unit_amount: unitAmount,
          currency: 'eur',
          recurring: {
            interval: 'month',
          },
          metadata: {
            plan_id: planId,
            credits: plan.credits.toString(),
          },
        });
      } catch (createError) {
        return new Response(
          JSON.stringify({ error: 'Failed to create price', details: createError.message }),
          { status: 500, headers: corsHeaders }
        );
      }
    } else {
      // Use existing active price
      price = prices.data[0];
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: price.id,
          quantity: 1,
        },
      ],
      mode: 'subscription', // Tous les plans utilisent des abonnements mensuels
      success_url: successUrl || `${new URL(context.request.url).origin}/dashboard?payment=success`,
      cancel_url: cancelUrl || `${new URL(context.request.url).origin}/dashboard?payment=cancelled`,
      customer_email: customerEmail,
      metadata: {
        plan_id: planId,
        credits: plan.credits.toString(),
        product_id: plan.productId,
      },
    });

    return new Response(
      JSON.stringify({
        url: session.url,
        sessionId: session.id
      }),
      { status: 200, headers: corsHeaders }
    );

  } catch (error: any) {
    console.error('❌ Checkout creation error:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to create checkout session',
        message: error.message
      }),
      { status: 500, headers: corsHeaders }
    );
  }
};
