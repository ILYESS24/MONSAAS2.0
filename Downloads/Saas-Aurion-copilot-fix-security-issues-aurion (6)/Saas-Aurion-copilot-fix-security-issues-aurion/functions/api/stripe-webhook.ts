// Production Stripe webhook handler with monitoring
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

interface Env {
  STRIPE_WEBHOOK_SECRET: string;
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  STRIPE_SECRET_KEY: string;
  WEBHOOK_MONITORING_EMAIL?: string; // Optional: Email for critical alerts
  SENTRY_DSN?: string; // Optional: Sentry for error tracking
}

// ============================================
// MONITORING & ALERTING
// ============================================

/**
 * Log webhook failure to monitoring system
 * This helps track failed payments and subscription issues
 */
async function logWebhookFailure(
  eventType: string,
  error: Error,
  metadata: Record<string, any>,
  env: Env
) {
  const failureLog = {
    timestamp: new Date().toISOString(),
    event_type: eventType,
    error_message: error.message,
    error_stack: error.stack,
    metadata,
  };

  console.error('🚨 WEBHOOK FAILURE:', JSON.stringify(failureLog, null, 2));

  // TODO: Send to monitoring service (Sentry, Datadog, etc.)
  // if (env.SENTRY_DSN) {
  //   Sentry.captureException(error, {
  //     tags: { event_type: eventType },
  //     extra: metadata
  //   });
  // }

  // Store failure in Supabase for audit trail
  try {
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
    await supabase.from('webhook_failures').insert({
      event_type: eventType,
      error_message: error.message,
      error_stack: error.stack,
      metadata: metadata,
      created_at: new Date().toISOString(),
    });
  } catch (dbError) {
    console.error('Failed to log webhook failure to database:', dbError);
  }

  // Send email alert for critical failures
  if (env.WEBHOOK_MONITORING_EMAIL && isCriticalFailure(eventType)) {
    await sendCriticalAlert(eventType, error, metadata, env);
  }
}

/**
 * Determine if a webhook failure is critical and requires immediate attention
 */
function isCriticalFailure(eventType: string): boolean {
  const criticalEvents = [
    'customer.subscription.created',
    'customer.subscription.updated',
    'checkout.session.completed',
    'invoice.payment_succeeded',
  ];
  return criticalEvents.includes(eventType);
}

/**
 * Send critical alert via email or notification service
 */
async function sendCriticalAlert(
  eventType: string,
  error: Error,
  metadata: Record<string, any>,
  env: Env
) {
  console.error(`🚨 CRITICAL STRIPE WEBHOOK FAILURE: ${eventType}`);
  console.error(`Error: ${error.message}`);
  console.error(`Metadata:`, metadata);

  // TODO: Implement email notification
  // This would typically use SendGrid, AWS SES, or similar
  // Example:
  // await fetch('https://api.sendgrid.com/v3/mail/send', {
  //   method: 'POST',
  //   headers: {
  //     'Authorization': `Bearer ${env.SENDGRID_API_KEY}`,
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify({
  //     personalizations: [{
  //       to: [{ email: env.WEBHOOK_MONITORING_EMAIL }],
  //     }],
  //     from: { email: 'alerts@aurion.app' },
  //     subject: `🚨 Critical Stripe Webhook Failure: ${eventType}`,
  //     content: [{
  //       type: 'text/plain',
  //       value: `Webhook Event: ${eventType}\nError: ${error.message}\nTime: ${new Date().toISOString()}\n\nMetadata: ${JSON.stringify(metadata, null, 2)}`,
  //     }],
  //   }),
  // });
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
          
          // Log failure for monitoring
          await logWebhookFailure(
            event.type,
            error as Error,
            {
              sessionId: session.id,
              customerId: session.customer,
              customerEmail: session.customer_details?.email,
            },
            context.env
          );
          
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

              // Calculate credits for the new plan
              const planCredits: Record<string, number> = {
                'starter': 1000,
                'plus': 5000,
                'pro': 25000,
                'enterprise': 100000,
              };
              const newCredits = planCredits[planType] || 1000;

              // Update user plan
              await supabase
                .from('user_plans')
                .upsert({
                  user_id: userData.id,
                  plan_type: planType,
                  stripe_subscription_id: subscription.id,
                  status: subscription.status,
                  credits_monthly: newCredits,
                  current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
                  current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                });

              // CRITICAL: Reset credits to the new plan's amount immediately
              await supabase
                .from('user_credits')
                .update({
                  total_credits: newCredits,
                  used_credits: 0, // Reset usage
                  last_reset_date: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                })
                .eq('user_id', userData.id);

              // Log the upgrade
              await supabase
                .from('usage_logs')
                .insert({
                  user_id: userData.id,
                  action_type: 'plan_upgraded',
                  credits_used: 0,
                  metadata: {
                    plan_type: planType,
                    credits_granted: newCredits,
                    stripe_subscription_id: subscription.id,
                    event_type: event.type
                  }
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

              console.log(`✅ Credits granted: ${newCredits} for plan ${planType}`);
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
          
          // Log failure for monitoring
          await logWebhookFailure(
            event.type,
            error as Error,
            {
              subscriptionId: subscription.id,
              customerId: subscription.customer,
              status: subscription.status,
            },
            context.env
          );
          
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
          
          // Log failure for monitoring
          await logWebhookFailure(
            event.type,
            error as Error,
            {
              subscriptionId: cancelledSubscription.id,
            },
            context.env
          );
          
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
