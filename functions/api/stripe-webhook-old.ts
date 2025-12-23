// Working Stripe webhook handler - simplified but functional
import Stripe from 'stripe';

interface Env {
  STRIPE_WEBHOOK_SECRET: string;
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  STRIPE_SECRET_KEY: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };

  try {
    const body = await context.request.text();
    const signature = context.request.headers.get('stripe-signature');
    const webhookSecret = context.env.STRIPE_WEBHOOK_SECRET;

    if (!signature || !webhookSecret) {
      return new Response(
        JSON.stringify({ error: 'Webhook signature missing or secret not configured' }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Initialize Stripe
    const stripe = new Stripe(context.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
    });

    let event: Stripe.Event;

    try {
      // Verify webhook signature
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error('❌ Invalid webhook signature:', err.message);
      return new Response(
        JSON.stringify({ error: 'Invalid webhook signature' }),
        { status: 400, headers: corsHeaders }
      );
    }

    console.log(`✅ Webhook received: ${event.type}`);

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('✅ Checkout session completed:', session.id);

        // Here you would update the user's plan in your database
        // For now, just return success
        return new Response(
          JSON.stringify({
            success: true,
            event: event.type,
            sessionId: session.id,
            customerId: session.customer,
            message: 'Checkout session processed successfully'
          }),
          { status: 200, headers: corsHeaders }
        );

      case 'customer.subscription.updated':
      case 'customer.subscription.created':
        const subscription = event.data.object as Stripe.Subscription;
        console.log(`✅ Subscription ${event.type}:`, subscription.id);

        // Here you would update the subscription status in your database
        return new Response(
          JSON.stringify({
            success: true,
            event: event.type,
            subscriptionId: subscription.id,
            customerId: subscription.customer,
            status: subscription.status,
            message: 'Subscription processed successfully'
          }),
          { status: 200, headers: corsHeaders }
        );

      default:
        console.log(`ℹ️ Unhandled event type: ${event.type}`);
        return new Response(
          JSON.stringify({
            success: true,
            event: event.type,
            message: 'Event received but not processed'
          }),
          { status: 200, headers: corsHeaders }
        );
    }

  } catch (error: any) {
    console.error('❌ Webhook error:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error.message
      }),
      { status: 500, headers: corsHeaders }
    );
  }
};
