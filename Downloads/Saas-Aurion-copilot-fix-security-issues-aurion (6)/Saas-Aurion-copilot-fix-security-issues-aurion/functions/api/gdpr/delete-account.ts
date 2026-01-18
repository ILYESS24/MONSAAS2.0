/* eslint-disable @typescript-eslint/no-explicit-any */
// Cloudflare Function - GDPR Account Deletion
// DELETE /api/gdpr/delete-account

import { createClient } from '@supabase/supabase-js';
import { withAuth } from '../../middleware/auth';

interface Env {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  STRIPE_SECRET_KEY: string;
}

interface DeleteRequest {
  userId: string;
  confirmation: string;
  reason?: string;
}

// Délai de grâce pour annuler la suppression (en jours)
const GRACE_PERIOD_DAYS = 30;

export const onRequestDelete: PagesFunction<Env> = withAuth(async (context) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };

  try {
    const user = (context as any).user;
    if (!user?.id) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: corsHeaders }
      );
    }

    const body: DeleteRequest = await context.request.json();

    // Vérifier que l'utilisateur demande sa propre suppression
    if (body.userId !== user.id) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: You can only delete your own account' }),
        { status: 403, headers: corsHeaders }
      );
    }

    // Vérifier la confirmation exacte
    if (body.confirmation !== 'SUPPRIMER MON COMPTE') {
      return new Response(
        JSON.stringify({ error: 'Invalid confirmation text' }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Initialiser Supabase avec service role
    const supabase = createClient(
      context.env.SUPABASE_URL,
      context.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Calculer la date de suppression effective
    const scheduledDeletionDate = new Date();
    scheduledDeletionDate.setDate(scheduledDeletionDate.getDate() + GRACE_PERIOD_DAYS);

    // Vérifier si une demande de suppression existe déjà
    const { data: existingRequest } = await supabase
      .from('gdpr_deletion_requests')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .single();

    if (existingRequest) {
      return new Response(
        JSON.stringify({
          error: 'Deletion request already pending',
          scheduledDate: existingRequest.scheduled_deletion_date,
          message: 'You can cancel this request by contacting support.',
        }),
        { status: 409, headers: corsHeaders }
      );
    }

    // Récupérer le plan actif pour annuler les abonnements
    const { data: activePlan } = await supabase
      .from('user_plans')
      .select('stripe_subscription_id, stripe_customer_id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .not('plan_type', 'eq', 'free')
      .single();

    // Annuler l'abonnement Stripe si présent
    let stripeSubscriptionCancelled = false;
    if (activePlan?.stripe_subscription_id && context.env.STRIPE_SECRET_KEY) {
      try {
        const Stripe = (await import('stripe')).default;
        const stripe = new Stripe(context.env.STRIPE_SECRET_KEY, {
          apiVersion: '2023-10-16',
        });

        // Annuler à la fin de la période courante
        await stripe.subscriptions.update(activePlan.stripe_subscription_id, {
          cancel_at_period_end: true,
          metadata: {
            cancellation_reason: 'gdpr_account_deletion',
            user_requested_at: new Date().toISOString(),
          },
        });

        stripeSubscriptionCancelled = true;
        console.log('✅ Stripe subscription scheduled for cancellation:', activePlan.stripe_subscription_id);
      } catch (stripeError) {
        console.error('⚠️ Failed to cancel Stripe subscription:', stripeError);
        // Continue même si l'annulation Stripe échoue
      }
    }

    // Créer la demande de suppression
    const deletionRequestId = `del_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    await supabase
      .from('gdpr_deletion_requests')
      .insert([{
        id: deletionRequestId,
        user_id: user.id,
        status: 'pending',
        reason: body.reason || 'user_request',
        confirmation_text: body.confirmation,
        requested_at: new Date().toISOString(),
        scheduled_deletion_date: scheduledDeletionDate.toISOString(),
        stripe_subscription_cancelled: stripeSubscriptionCancelled,
        metadata: {
          user_email: user.email,
          ip_address: context.request.headers.get('CF-Connecting-IP'),
          user_agent: context.request.headers.get('User-Agent'),
        },
      }]);

    // Marquer le profil comme en attente de suppression
    await supabase
      .from('profiles')
      .update({
        deletion_requested: true,
        deletion_scheduled_at: scheduledDeletionDate.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    // Désactiver les sessions de l'utilisateur
    await supabase
      .from('tool_sessions')
      .update({ is_active: false })
      .eq('user_id', user.id);

    // Logger l'action pour conformité RGPD
    await supabase
      .from('usage_logs')
      .insert([{
        user_id: user.id,
        action_type: 'gdpr_account_deletion_requested',
        credits_used: 0,
        metadata: {
          deletion_request_id: deletionRequestId,
          scheduled_date: scheduledDeletionDate.toISOString(),
          grace_period_days: GRACE_PERIOD_DAYS,
          stripe_cancelled: stripeSubscriptionCancelled,
          reason: body.reason,
        },
        created_at: new Date().toISOString(),
      }]);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Your account will be permanently deleted on ${scheduledDeletionDate.toLocaleDateString('fr-FR')}`,
        deletionRequestId,
        scheduledDate: scheduledDeletionDate.toISOString(),
        gracePeriodDays: GRACE_PERIOD_DAYS,
        stripeSubscriptionCancelled,
        cancellationInfo: 'You can cancel this request by contacting support within the grace period.',
        supportEmail: 'privacy@aurion.ai',
      }),
      { status: 200, headers: corsHeaders }
    );

  } catch (error: any) {
    console.error('❌ GDPR Account Deletion error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Deletion request failed',
        details: error.message 
      }),
      { status: 500, headers: corsHeaders }
    );
  }
});

// POST handler (alternative method)
export const onRequestPost: PagesFunction<Env> = onRequestDelete;

// OPTIONS handler for CORS
export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'DELETE, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
};

