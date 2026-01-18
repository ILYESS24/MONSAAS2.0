 
// Cloudflare Function - Create Stripe Checkout Session
// POST /api/create-checkout

import { withAuth } from '../middleware/auth';

interface Env {
  STRIPE_SECRET_KEY: string;
  STRIPE_PUBLISHABLE_KEY: string;
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
}

// Prix par plan (en centimes pour Stripe)
const PLAN_PRICES: Record<string, { monthly: number; name: string; credits: number }> = {
  starter: { monthly: 900, name: 'AURION Starter', credits: 1000 },      // 9€
  plus: { monthly: 2900, name: 'AURION Plus', credits: 5000 },           // 29€
  pro: { monthly: 9900, name: 'AURION Pro', credits: 25000 },             // 99€
  enterprise: { monthly: 49900, name: 'AURION Enterprise', credits: 100000 }, // 499€
};

async function handleCreateCheckout(user: import('../middleware/auth').AuthenticatedUser, request: Request, env: Env) {
  try {
    const body = await request.json() as {
      planId: string;
      successUrl: string;
      cancelUrl: string;
    };

    const { planId, successUrl, cancelUrl } = body;

    if (!planId || !PLAN_PRICES[planId]) {
      return new Response(
        JSON.stringify({ error: 'Invalid plan ID' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const plan = PLAN_PRICES[planId];

    // Vérifier qu'il n'y a pas déjà un paiement en cours pour cet utilisateur
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

    // Vérifier sessions en cours (pending)
    const { data: existingSessions, error: checkError } = await supabase
      .from('stripe_sessions')
      .select('id, created_at')
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .gt('created_at', new Date(Date.now() - 10 * 60 * 1000).toISOString()); // Derniers 10 min

    if (checkError) {
      console.error('❌ Erreur vérification sessions existantes:', checkError);
    } else if (existingSessions && existingSessions.length > 0) {
      return new Response(
        JSON.stringify({
          error: 'Payment already in progress',
          message: 'Vous avez déjà une session de paiement en cours. Veuillez attendre la fin du processus.',
          existing_session_created: existingSessions[0].created_at
        }),
        { status: 409, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { error: sessionError } = await supabase
      .from('stripe_sessions')
      .insert([{
        user_id: user.id,
        session_id: `cs_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        plan_type: planId,
        amount: plan.monthly,
        currency: 'eur',
        status: 'pending',
      }]);

    if (sessionError) {
      console.error('❌ Erreur enregistrement session:', sessionError);
      return new Response(
        JSON.stringify({ error: 'Failed to create session record' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Créer la session Stripe Checkout
    const stripeResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'mode': 'subscription',
        'success_url': successUrl + '?session_id={CHECKOUT_SESSION_ID}',
        'cancel_url': cancelUrl,
        'line_items[0][price_data][currency]': 'eur',
        'line_items[0][price_data][product_data][name]': plan.name,
        'line_items[0][price_data][product_data][description]': `Abonnement mensuel ${plan.name}`,
        'line_items[0][price_data][unit_amount]': plan.monthly.toString(),
        'line_items[0][price_data][recurring][interval]': 'month',
        'line_items[0][quantity]': '1',
        'customer_email': user.email,
        'metadata[plan_id]': planId,
        'metadata[user_id]': user.id,
        'allow_promotion_codes': 'true',
        'billing_address_collection': 'required',
      }).toString(),
    });

    if (!stripeResponse.ok) {
      const error = await stripeResponse.text();
      console.error('Stripe error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to create checkout session' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const session = await stripeResponse.json();

    // Mettre à jour la session dans notre DB avec l'ID Stripe réel
    await supabase
      .from('stripe_sessions')
      .update({ session_id: session.id })
      .eq('user_id', user.id)
      .eq('status', 'pending');

    return new Response(
      JSON.stringify({
        sessionId: session.id,
        url: session.url,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Checkout error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  return withAuth(context.request, context.env, handleCreateCheckout);
};

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
};


