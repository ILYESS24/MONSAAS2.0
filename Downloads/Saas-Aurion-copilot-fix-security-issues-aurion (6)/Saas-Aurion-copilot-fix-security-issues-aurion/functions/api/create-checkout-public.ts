// Cloudflare Function - Create Stripe Checkout Session (Public - No Auth Required)
// POST /api/create-checkout-public

import Stripe from 'stripe';

interface Env {
  STRIPE_SECRET_KEY: string;
  STRIPE_PUBLISHABLE_KEY: string;
}

// Product IDs et Price IDs Stripe (vrais produits configurés dans le dashboard)
const STRIPE_PRODUCTS: Record<string, { productId: string; priceId: string; name: string; credits: number }> = {
  starter: { productId: 'prod_Te15MpLvqryJHB', priceId: 'price_1Sgj2s018rEaMULFGFZmqHQj', name: 'AURION Starter', credits: 1000 },
  plus: { productId: 'prod_Te17AfjPBXJkMf', priceId: 'price_1Sgj5E018rEaMULFKnB2L24E', name: 'AURION Plus', credits: 5000 },
  pro: { productId: 'prod_Te4WWQ2JdqTiJ0', priceId: 'price_1SgmNR018rEaMULFf6eBgFpT', name: 'AURION Pro', credits: 25000 },
  enterprise: { productId: 'prod_Te19LcD17x07QV', priceId: 'price_1Sgj70018rEaMULFAr4izWzO', name: 'AURION Enterprise', credits: 100000 },
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };

  // Log basic request info for debugging
  console.log('🔄 Create checkout session request received');
  console.log('📊 Environment check:', {
    hasStripeSecret: !!context.env.STRIPE_SECRET_KEY,
    stripeSecretLength: context.env.STRIPE_SECRET_KEY?.length,
    hasStripePublic: !!context.env.STRIPE_PUBLISHABLE_KEY,
    stripePublicLength: context.env.STRIPE_PUBLISHABLE_KEY?.length,
    allEnvVars: Object.keys(context.env),
  });
  console.log('🔑 STRIPE_SECRET_KEY value:', context.env.STRIPE_SECRET_KEY ? 'SET (length: ' + context.env.STRIPE_SECRET_KEY.length + ')' : 'NOT SET');

  try {
    const body = await context.request.json() as {
      planId: string;
      successUrl: string;
      cancelUrl: string;
      customerEmail?: string;
    };

    const { planId, successUrl, cancelUrl, customerEmail } = body;
    console.log('📦 Request body:', { planId, successUrl, cancelUrl, customerEmail });

    if (!planId || !STRIPE_PRODUCTS[planId]) {
      console.error('❌ Invalid plan ID:', planId);
      return new Response(
        JSON.stringify({ error: 'Invalid plan ID', availablePlans: Object.keys(STRIPE_PRODUCTS) }),
        { status: 400, headers: corsHeaders }
      );
    }

    const plan = STRIPE_PRODUCTS[planId];
    console.log('✅ Plan found:', plan);

    // Initialize Stripe with hardcoded key for now
    const stripeSecretKey = context.env.STRIPE_SECRET_KEY || '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';

    if (!stripeSecretKey) {
      console.error('❌ No STRIPE_SECRET_KEY available');
      return new Response(
        JSON.stringify({ error: 'Stripe configuration missing' }),
        { status: 500, headers: corsHeaders }
      );
    }

    console.log('✅ Stripe key found, initializing Stripe client');

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    });

    // Use the pre-configured price ID
    const priceId = plan.priceId;
    console.log('💰 Creating checkout session with price ID:', priceId);

    // Create Stripe Checkout Session
    console.log('🔄 Calling stripe.checkout.sessions.create...');
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
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

    console.log('✅ Checkout session created successfully:', { sessionId: session.id, url: session.url });

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
