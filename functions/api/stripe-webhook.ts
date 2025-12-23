// Production Stripe webhook handler
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

interface Env {
  STRIPE_WEBHOOK_SECRET: string;
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  STRIPE_SECRET_KEY: string;
}

// Plan mapping from Stripe products to internal plan types
const STRIPE_PRODUCT_TO_PLAN = {
  'prod_Te15MpLvqryJHB': 'starter',
  'prod_Te17AfjPBXJkMf': 'plus',
  'prod_Te4WWQ2JdqTiJ0': 'pro',
  'prod_Te19LcD17x07QV': 'enterprise',
};

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

    // Initialize Supabase client
    const supabase = createClient(context.env.SUPABASE_URL, context.env.SUPABASE_SERVICE_ROLE_KEY);

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('✅ Checkout session completed:', session.id);

        try {
          // Extract customer email and subscription info
          const customerEmail = session.customer_details?.email;
          const subscriptionId = session.subscription as string;

          if (customerEmail && subscriptionId) {
            // Find user by email
            const { data: userData, error: userError } = await supabase
              .from('profiles')
              .select('id')
              .eq('email', customerEmail)
              .single();

            if (userError || !userData) {
              console.error('User not found for email:', customerEmail);
            } else {
              // Update user subscription
              await supabase
                .from('user_subscriptions')
                .upsert({
                  user_id: userData.id,
                  stripe_subscription_id: subscriptionId,
                  stripe_customer_id: session.customer,
                  status: 'active',
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                });
            }
          }

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
        } catch (error) {
          console.error('Error processing checkout session:', error);
          return new Response(
            JSON.stringify({ error: 'Failed to process checkout session' }),
            { status: 500, headers: corsHeaders }
          );
        }

      case 'customer.subscription.updated':
      case 'customer.subscription.created':
        const subscription = event.data.object as Stripe.Subscription;
        console.log(`✅ Subscription ${event.type}:`, subscription.id);

        try {
          // Get customer email from subscription
          const customer = await stripe.customers.retrieve(subscription.customer as string) as Stripe.Customer;
          const customerEmail = customer.email;

          if (customerEmail) {
            // Find user by email
            const { data: userData } = await supabase
              .from('profiles')
              .select('id')
              .eq('email', customerEmail)
              .single();

            if (userData) {
              // Map Stripe product to internal plan
              const productId = subscription.items.data[0]?.price.product as string;
              const planType = STRIPE_PRODUCT_TO_PLAN[productId as keyof typeof STRIPE_PRODUCT_TO_PLAN] || 'starter';

              // Update user plan and subscription
              await supabase
                .from('user_plans')
                .upsert({
                  user_id: userData.id,
                  plan_type: planType,
                  stripe_subscription_id: subscription.id,
                  status: subscription.status,
                  current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
                  current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                });

              // Update subscription record
              await supabase
                .from('user_subscriptions')
                .upsert({
                  user_id: userData.id,
                  stripe_subscription_id: subscription.id,
                  stripe_customer_id: subscription.customer,
                  status: subscription.status,
                  plan_type: planType,
                  updated_at: new Date().toISOString()
                });
            }
          }

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
        } catch (error) {
          console.error('Error processing subscription:', error);
          return new Response(
            JSON.stringify({ error: 'Failed to process subscription' }),
            { status: 500, headers: corsHeaders }
          );
        }

      case 'customer.subscription.deleted':
        const cancelledSubscription = event.data.object as Stripe.Subscription;
        console.log('❌ Subscription cancelled:', cancelledSubscription.id);

        try {
          // Update subscription status to cancelled
          await supabase
            .from('user_subscriptions')
            .update({
              status: 'cancelled',
              updated_at: new Date().toISOString()
            })
            .eq('stripe_subscription_id', cancelledSubscription.id);

          return new Response(
            JSON.stringify({
              success: true,
              event: event.type,
              subscriptionId: cancelledSubscription.id,
              message: 'Subscription cancelled successfully'
            }),
            { status: 200, headers: corsHeaders }
          );
        } catch (error) {
          console.error('Error processing subscription cancellation:', error);
          return new Response(
            JSON.stringify({ error: 'Failed to process subscription cancellation' }),
            { status: 500, headers: corsHeaders }
          );
        }

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
