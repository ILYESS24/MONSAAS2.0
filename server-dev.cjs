// Serveur de développement local avec Stripe fonctionnel
const express = require('express');
const cors = require('cors');
const Stripe = require('stripe');

const app = express();
app.use(cors());
app.use(express.json());

// Clé secrète Stripe - CHARGER DEPUIS LES VARIABLES D'ENVIRONNEMENT
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

if (!STRIPE_SECRET_KEY) {
  console.error('❌ STRIPE_SECRET_KEY manquante dans les variables d\'environnement');
  process.exit(1);
}
const stripe = new Stripe(STRIPE_SECRET_KEY);

// Prix par plan
const PLAN_PRICES = {
  starter: { monthly: 900, name: 'AURION Starter' },
  plus: { monthly: 2900, name: 'AURION Plus' },
  pro: { monthly: 7900, name: 'AURION Pro' },
  enterprise: { monthly: 19900, name: 'AURION Enterprise' },
};

// Route pour créer une session de checkout Stripe
app.post('/api/create-checkout', async (req, res) => {
  try {
    const { planId, successUrl, cancelUrl, customerEmail } = req.body;

    console.log('🔵 Demande de checkout reçue:', { planId, customerEmail });

    if (!planId || !PLAN_PRICES[planId]) {
      return res.status(400).json({ error: 'Invalid plan ID' });
    }

    const plan = PLAN_PRICES[planId];

    // Créer la session Stripe Checkout
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      success_url: successUrl + '?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: cancelUrl,
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: plan.name,
              description: `Abonnement mensuel ${plan.name}`,
            },
            unit_amount: plan.monthly,
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      customer_email: customerEmail,
      metadata: {
        plan_id: planId,
      },
      allow_promotion_codes: true,
      billing_address_collection: 'required',
    });

    console.log('✅ Session Stripe créée:', session.id);
    console.log('🔗 URL de paiement:', session.url);

    res.json({
      sessionId: session.id,
      url: session.url,
    });

  } catch (error) {
    console.error('❌ Erreur Stripe:', error.message);
    res.status(500).json({ 
      error: error.message || 'Failed to create checkout session' 
    });
  }
});

// Route de health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', stripe: 'ready' });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log('\n🚀 ========================================');
  console.log('🎉 Serveur backend Stripe démarré !');
  console.log('📍 Port:', PORT);
  console.log('🔗 API Stripe: http://localhost:' + PORT + '/api/create-checkout');
  console.log('✅ Stripe configuré avec la clé live');
  console.log('========================================\n');
});

