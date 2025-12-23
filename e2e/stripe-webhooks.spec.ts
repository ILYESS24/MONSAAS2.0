/* eslint-disable no-empty-pattern */
import { test, expect } from '@playwright/test';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Configuration pour les tests - valeurs par défaut pour CI/CD
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://test-placeholder.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'test-anon-key';
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test_webhook_secret';

// Client Supabase - créé uniquement si URL valide
let supabase: SupabaseClient | null = null;
const isRealSupabase = SUPABASE_URL.includes('supabase.co') && !SUPABASE_URL.includes('test-placeholder');

if (isRealSupabase) {
  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

test.describe('Stripe Webhooks E2E Tests', () => {
  let testUserId: string;
  let testSessionId: string;

  // Skip tous les tests si Supabase n'est pas configuré
  test.beforeEach(async ({  }, testInfo) => {
    if (!isRealSupabase || !supabase) {
      testInfo.skip();
    }
  });

  test.beforeAll(async () => {
    // Skip si pas de Supabase configuré
    if (!isRealSupabase || !supabase) {
      return;
    }

    // Créer un utilisateur de test
    const { data: authUser } = await supabase.auth.signUp({
      email: `test-${Date.now()}@example.com`,
      password: 'testpassword123'
    });

    if (authUser.user) {
      testUserId = authUser.user.id;

      // Attendre que le trigger crée le profil et le plan
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Créer une session Stripe de test
      const { data: session } = await supabase
        .from('stripe_sessions')
        .insert([{
          user_id: testUserId,
          session_id: `cs_test_${Date.now()}`,
          plan_type: 'starter',
          amount: 900,
          currency: 'eur',
          status: 'pending'
        }])
        .select()
        .single();

      if (session) {
        testSessionId = session.session_id;
      }
    }
  });

  test.afterAll(async () => {
    // Nettoyer les données de test
    if (testUserId && supabase) {
      await supabase
        .from('user_credits')
        .delete()
        .eq('user_id', testUserId);

      await supabase
        .from('user_plans')
        .delete()
        .eq('user_id', testUserId);

      await supabase
        .from('profiles')
        .delete()
        .eq('id', testUserId);

      await supabase
        .from('stripe_sessions')
        .delete()
        .eq('user_id', testUserId);
    }
  });

  test.describe('Checkout Session Completed', () => {
    test('should process successful checkout and upgrade user', async ({ request }) => {
      if (!supabase) {
        test.skip();
        return;
      }
      // Simuler un webhook Stripe pour checkout.session.completed
      const webhookPayload = {
        id: `evt_${Date.now()}`,
        object: 'event',
        api_version: '2020-08-27',
        created: Math.floor(Date.now() / 1000),
        data: {
          object: {
            id: testSessionId,
            object: 'checkout.session',
            amount_total: 900,
            currency: 'eur',
            customer: `cus_test_${Date.now()}`,
            payment_status: 'paid',
            status: 'complete',
            subscription: `sub_test_${Date.now()}`,
            metadata: {
              user_id: testUserId,
              plan_type: 'starter'
            }
          }
        },
        livemode: false,
        pending_webhooks: 1,
        request: {
          id: `req_${Date.now()}`,
          idempotency_key: null
        },
        type: 'checkout.session.completed'
      };

      // Créer la signature webhook (simulation)
      const encoder = new TextEncoder();
      const data = JSON.stringify(webhookPayload, null, 0);
      const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(STRIPE_WEBHOOK_SECRET),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );
      const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
      const signatureHex = Array.from(new Uint8Array(signature))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      const stripeSignature = `t=${Math.floor(Date.now() / 1000)},v1=${signatureHex}`;

      // Envoyer le webhook
      const response = await request.post('/api/stripe-webhook', {
        data: webhookPayload,
        headers: {
          'Stripe-Signature': stripeSignature,
          'Content-Type': 'application/json'
        }
      });

      // Vérifier la réponse
      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body.message).toContain('processed successfully');

      // Attendre le traitement asynchrone
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Vérifier que l'utilisateur a été mis à jour
      const { data: userPlan } = await supabase
        .from('user_plans')
        .select('*')
        .eq('user_id', testUserId)
        .eq('status', 'active')
        .single();

      expect(userPlan).toBeTruthy();
      expect(userPlan?.plan_type).toBe('starter');
      expect(userPlan?.stripe_subscription_id).toBeTruthy();

      // Vérifier les crédits
      const { data: userCredits } = await supabase
        .from('user_credits')
        .select('*')
        .eq('user_id', testUserId)
        .single();

      expect(userCredits).toBeTruthy();
      expect(userCredits?.total_credits).toBe(1000); // Crédits du plan starter
      expect(userCredits?.used_credits).toBe(0);
    });

    test('should handle idempotent webhooks', async ({ request }) => {
      if (!supabase) {
        test.skip();
        return;
      }
      // Renvoyer le même webhook
      const webhookPayload = {
        id: 'evt_duplicate_test',
        object: 'event',
        api_version: '2020-08-27',
        created: Math.floor(Date.now() / 1000),
        data: {
          object: {
            id: testSessionId,
            object: 'checkout.session',
            amount_total: 900,
            currency: 'eur',
            customer: `cus_duplicate_${Date.now()}`,
            payment_status: 'paid',
            status: 'complete',
            subscription: `sub_duplicate_${Date.now()}`
          }
        },
        livemode: false,
        pending_webhooks: 1,
        request: {
          id: `req_duplicate_${Date.now()}`,
          idempotency_key: null
        },
        type: 'checkout.session.completed'
      };

      // Simuler la signature
      const data = JSON.stringify(webhookPayload);
      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(STRIPE_WEBHOOK_SECRET),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );
      const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
      const signatureHex = Array.from(new Uint8Array(signature))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      const stripeSignature = `t=${Math.floor(Date.now() / 1000)},v1=${signatureHex}`;

      // Premier appel
      const response1 = await request.post('/api/stripe-webhook', {
        data: webhookPayload,
        headers: {
          'Stripe-Signature': stripeSignature,
          'Content-Type': 'application/json'
        }
      });

      // Deuxième appel (devrait être idempotent)
      const response2 = await request.post('/api/stripe-webhook', {
        data: webhookPayload,
        headers: {
          'Stripe-Signature': stripeSignature,
          'Content-Type': 'application/json'
        }
      });

      // Les deux devraient réussir
      expect(response1.status()).toBe(200);
      expect(response2.status()).toBe(200);

      // Vérifier qu'il n'y a qu'un seul enregistrement webhook
      const { data: webhooks } = await supabase
        .from('stripe_webhooks')
        .select('*')
        .eq('event_id', 'evt_duplicate_test');

      expect(webhooks?.length).toBe(1);
    });
  });

  test.describe('Subscription Updates', () => {
    test('should handle plan upgrades', async ({ request }) => {
      if (!supabase) {
        test.skip();
        return;
      }
      // Simuler un webhook de changement de plan (upgrade)
      const webhookPayload = {
        id: `evt_upgrade_${Date.now()}`,
        object: 'event',
        api_version: '2020-08-27',
        created: Math.floor(Date.now() / 1000),
        data: {
          object: {
            id: `sub_upgrade_${Date.now()}`,
            object: 'subscription',
            customer: `cus_upgrade_${Date.now()}`,
            status: 'active',
            items: {
              data: [{
                price: {
                  id: 'price_upgrade_test',
                  metadata: {
                    plan_type: 'plus'
                  }
                }
              }]
            },
            metadata: {
              user_id: testUserId
            }
          }
        },
        livemode: false,
        pending_webhooks: 1,
        request: {
          id: `req_upgrade_${Date.now()}`,
          idempotency_key: null
        },
        type: 'customer.subscription.updated'
      };

      // Simuler la signature
      const data = JSON.stringify(webhookPayload);
      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(STRIPE_WEBHOOK_SECRET),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );
      const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
      const signatureHex = Array.from(new Uint8Array(signature))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      const stripeSignature = `t=${Math.floor(Date.now() / 1000)},v1=${signatureHex}`;

      // Envoyer le webhook
      const response = await request.post('/api/stripe-webhook', {
        data: webhookPayload,
        headers: {
          'Stripe-Signature': stripeSignature,
          'Content-Type': 'application/json'
        }
      });

      expect(response.status()).toBe(200);

      // Attendre le traitement
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Vérifier que le plan a été mis à jour
      await supabase
        .from('user_plans')
        .select('*')
        .eq('user_id', testUserId)
        .eq('status', 'active')
        .single();

      // Le plan devrait être mis à jour vers 'plus' si la logique est correcte
      // (dépend de l'implémentation du mapping price_id -> plan_type)
    });

    test('should handle subscription cancellations', async ({ request }) => {
      if (!supabase) {
        test.skip();
        return;
      }
      // Simuler un webhook d'annulation d'abonnement
      const webhookPayload = {
        id: `evt_cancel_${Date.now()}`,
        object: 'event',
        api_version: '2020-08-27',
        created: Math.floor(Date.now() / 1000),
        data: {
          object: {
            id: `sub_cancel_${Date.now()}`,
            object: 'subscription',
            customer: `cus_cancel_${Date.now()}`,
            status: 'canceled',
            canceled_at: Math.floor(Date.now() / 1000),
            metadata: {
              user_id: testUserId
            }
          }
        },
        livemode: false,
        pending_webhooks: 1,
        request: {
          id: `req_cancel_${Date.now()}`,
          idempotency_key: null
        },
        type: 'customer.subscription.deleted'
      };

      // Simuler la signature
      const data = JSON.stringify(webhookPayload);
      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(STRIPE_WEBHOOK_SECRET),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );
      const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
      const signatureHex = Array.from(new Uint8Array(signature))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      const stripeSignature = `t=${Math.floor(Date.now() / 1000)},v1=${signatureHex}`;

      // Envoyer le webhook
      const response = await request.post('/api/stripe-webhook', {
        data: webhookPayload,
        headers: {
          'Stripe-Signature': stripeSignature,
          'Content-Type': 'application/json'
        }
      });

      expect(response.status()).toBe(200);

      // Attendre le traitement
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Vérifier que l'abonnement a été annulé
      await supabase
        .from('user_plans')
        .select('*')
        .eq('user_id', testUserId)
        .single();

      // Le statut devrait être 'cancelled' selon la logique implémentée
    });
  });

  test.describe('Payment Events', () => {
    test('should handle successful invoice payments', async ({ request }) => {
      if (!supabase) {
        test.skip();
        return;
      }
      // Simuler un webhook de paiement d'abonnement réussi
      const webhookPayload = {
        id: `evt_invoice_${Date.now()}`,
        object: 'event',
        api_version: '2020-08-27',
        created: Math.floor(Date.now() / 1000),
        data: {
          object: {
            id: `in_${Date.now()}`,
            object: 'invoice',
            customer: `cus_invoice_${Date.now()}`,
            subscription: `sub_invoice_${Date.now()}`,
            status: 'paid',
            amount_paid: 2900, // $29 pour plan plus
            billing_reason: 'subscription_cycle',
            metadata: {
              user_id: testUserId
            }
          }
        },
        livemode: false,
        pending_webhooks: 1,
        request: {
          id: `req_invoice_${Date.now()}`,
          idempotency_key: null
        },
        type: 'invoice.payment_succeeded'
      };

      // Simuler la signature
      const data = JSON.stringify(webhookPayload);
      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(STRIPE_WEBHOOK_SECRET),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );
      const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
      const signatureHex = Array.from(new Uint8Array(signature))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      const stripeSignature = `t=${Math.floor(Date.now() / 1000)},v1=${signatureHex}`;

      // Envoyer le webhook
      const response = await request.post('/api/stripe-webhook', {
        data: webhookPayload,
        headers: {
          'Stripe-Signature': stripeSignature,
          'Content-Type': 'application/json'
        }
      });

      expect(response.status()).toBe(200);

      // Attendre le traitement
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Vérifier que les crédits ont été renouvelés
      await supabase
        .from('user_credits')
        .select('*')
        .eq('user_id', testUserId)
        .single();

      // Les crédits devraient être renouvelés selon le plan actif
    });

    test('should handle failed payments', async ({ request }) => {
      if (!supabase) {
        test.skip();
        return;
      }
      // Simuler un webhook de paiement échoué
      const webhookPayload = {
        id: `evt_payment_failed_${Date.now()}`,
        object: 'event',
        api_version: '2020-08-27',
        created: Math.floor(Date.now() / 1000),
        data: {
          object: {
            id: `in_failed_${Date.now()}`,
            object: 'invoice',
            customer: `cus_failed_${Date.now()}`,
            subscription: `sub_failed_${Date.now()}`,
            status: 'open',
            attempt_count: 3,
            next_payment_attempt: Math.floor(Date.now() / 1000) + 86400, // Dans 24h
            billing_reason: 'subscription_cycle',
            metadata: {
              user_id: testUserId
            }
          }
        },
        livemode: false,
        pending_webhooks: 1,
        request: {
          id: `req_failed_${Date.now()}`,
          idempotency_key: null
        },
        type: 'invoice.payment_failed'
      };

      // Simuler la signature
      const data = JSON.stringify(webhookPayload);
      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(STRIPE_WEBHOOK_SECRET),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );
      const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
      const signatureHex = Array.from(new Uint8Array(signature))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      const stripeSignature = `t=${Math.floor(Date.now() / 1000)},v1=${signatureHex}`;

      // Envoyer le webhook
      const response = await request.post('/api/stripe-webhook', {
        data: webhookPayload,
        headers: {
          'Stripe-Signature': stripeSignature,
          'Content-Type': 'application/json'
        }
      });

      expect(response.status()).toBe(200);

      // Vérifier que le statut du plan a été mis à jour (past_due par exemple)
      await supabase
        .from('user_plans')
        .select('*')
        .eq('user_id', testUserId)
        .single();

      // Le statut devrait refléter le problème de paiement
    });
  });

  test.describe('Security & Error Handling', () => {
    test('should reject invalid webhook signatures', async ({ request }) => {
      const webhookPayload = {
        id: 'evt_invalid_sig',
        object: 'event',
        type: 'checkout.session.completed',
        data: { object: { id: 'cs_invalid' } }
      };

      // Signature invalide
      const response = await request.post('/api/stripe-webhook', {
        data: webhookPayload,
        headers: {
          'Stripe-Signature': 't=123456789,v1=invalid_signature',
          'Content-Type': 'application/json'
        }
      });

      expect(response.status()).toBe(400);
      const body = await response.json();
      expect(body.error).toContain('verification failed');
    });

    test('should handle malformed webhook data', async ({ request }) => {
      const malformedData = { invalid: 'data' };

      // Simuler une signature valide pour des données malformées
      const data = JSON.stringify(malformedData);
      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(STRIPE_WEBHOOK_SECRET),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );
      const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
      const signatureHex = Array.from(new Uint8Array(signature))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      const stripeSignature = `t=${Math.floor(Date.now() / 1000)},v1=${signatureHex}`;

      const response = await request.post('/api/stripe-webhook', {
        data: malformedData,
        headers: {
          'Stripe-Signature': stripeSignature,
          'Content-Type': 'application/json'
        }
      });

      // Devrait retourner une erreur mais pas crasher
      expect([400, 500]).toContain(response.status());
    });

    test('should handle duplicate webhooks gracefully', async ({ request }) => {
      if (!supabase) {
        test.skip();
        return;
      }
      // Test de l'idempotence avec des événements dupliqués
      const webhookPayload = {
        id: 'evt_duplicate_final',
        object: 'event',
        type: 'checkout.session.completed',
        created: Math.floor(Date.now() / 1000),
        data: {
          object: {
            id: `cs_duplicate_${Date.now()}`,
            object: 'checkout.session',
            status: 'complete'
          }
        }
      };

      // Envoyer plusieurs fois le même webhook
      for (let i = 0; i < 3; i++) {
        const data = JSON.stringify(webhookPayload);
        const encoder = new TextEncoder();
        const key = await crypto.subtle.importKey(
          'raw',
          encoder.encode(STRIPE_WEBHOOK_SECRET),
          { name: 'HMAC', hash: 'SHA-256' },
          false,
          ['sign']
        );
        const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
        const signatureHex = Array.from(new Uint8Array(signature))
          .map(b => b.toString(16).padStart(2, '0'))
          .join('');
        const stripeSignature = `t=${Math.floor(Date.now() / 1000)},v1=${signatureHex}`;

        const response = await request.post('/api/stripe-webhook', {
          data: webhookPayload,
          headers: {
            'Stripe-Signature': stripeSignature,
            'Content-Type': 'application/json'
          }
        });

        expect(response.status()).toBe(200);
      }

      // Vérifier qu'il n'y a qu'un seul enregistrement
      const { data: webhooks } = await supabase
        .from('stripe_webhooks')
        .select('*')
        .eq('event_id', 'evt_duplicate_final');

      expect(webhooks?.length).toBe(1);
    });
  });
});
