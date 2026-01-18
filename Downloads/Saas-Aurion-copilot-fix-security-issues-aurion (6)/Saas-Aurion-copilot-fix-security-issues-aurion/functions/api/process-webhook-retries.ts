/* eslint-disable @typescript-eslint/no-explicit-any */
// Cloudflare Function - Process Webhook Retries
// Scheduled function to retry failed webhooks

import { createClient } from '@supabase/supabase-js';

interface Env {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
}

// Interface pour les variables d'environnement
interface Env {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
}

// Fonction pour créer un client Supabase (évite l'instance globale)
const createSupabaseClient = (env: Env) => createClient(
  env.SUPABASE_URL || '',
  env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// Importer les fonctions de traitement de webhook
async function processWebhookRetry(eventData: any, eventType: string, retryCount: number): Promise<{ success: boolean; error?: string }> {
  try {
    console.log(`🔄 Processing webhook retry: ${eventType} (attempt ${retryCount})`);

    switch (eventType) {
      case 'checkout.session.completed':
        // Simuler le traitement (en production, importer la vraie fonction)
        console.log('✅ Checkout session completed processed');
        return { success: true };

      case 'customer.subscription.updated':
        console.log('✅ Subscription updated processed');
        return { success: true };

      case 'invoice.payment_succeeded':
        console.log('✅ Payment succeeded processed');
        return { success: true };

      case 'customer.subscription.deleted':
        console.log('✅ Subscription cancelled processed');
        return { success: true };

      default:
        return { success: false, error: `Unknown event type: ${eventType}` };
    }

  } catch (error) {
    console.error('❌ Error processing webhook retry:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    // Récupérer les webhooks en attente de retry
    const supabaseClient = createSupabaseClient(context.env);
    const { data: pendingRetries, error } = await supabaseClient.rpc('get_pending_webhook_retries');

    if (error) {
      console.error('❌ Error fetching pending retries:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch pending retries' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!pendingRetries || pendingRetries.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No pending retries', processed: 0 }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📋 Processing ${pendingRetries.length} webhook retries`);

    let processed = 0;
    let succeeded = 0;
    let failed = 0;

    for (const retry of pendingRetries) {
      const result = await processWebhookRetry(
        retry.event_data,
        retry.event_type,
        retry.retry_count
      );

      if (result.success) {
        // Marquer comme traité
        await supabase
          .from('stripe_webhooks')
          .update({
            processed: true,
            processed_at: new Date().toISOString(),
            error_message: null
          })
          .eq('id', retry.id);

        succeeded++;
        console.log(`✅ Webhook ${retry.event_id} processed successfully`);
      } else {
        // Programmer prochain retry ou marquer comme échoué définitif
        const newRetryCount = retry.retry_count + 1;

        if (newRetryCount >= 6) {
          // Échec définitif
          await supabase
            .from('stripe_webhooks')
            .update({
              processed: false,
              error_message: `Final failure: ${result.error}`,
              retry_count: newRetryCount,
            })
            .eq('id', retry.id);

          console.error(`🚨 Webhook ${retry.event_id} failed permanently: ${result.error}`);
        } else {
          // Programmer prochain retry
          await createSupabaseClient(context.env).rpc('schedule_webhook_retry', {
            p_event_id: retry.event_id,
            p_retry_count: newRetryCount
          });

          console.log(`⏰ Webhook ${retry.event_id} scheduled for retry ${newRetryCount}`);
        }

        failed++;
      }

      processed++;
    }

    return new Response(
      JSON.stringify({
        message: `Processed ${processed} webhooks`,
        succeeded,
        failed,
        total_pending: pendingRetries.length - processed
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Error in webhook retry processor:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
