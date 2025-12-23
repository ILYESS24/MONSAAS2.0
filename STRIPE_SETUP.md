# Configuration Stripe pour les paiements

## Étape 1 : Créer un compte Stripe
1. Allez sur [https://dashboard.stripe.com](https://dashboard.stripe.com)
2. Créez un compte ou connectez-vous

## Étape 2 : Obtenir vos clés API
1. Dans votre dashboard Stripe, allez dans "Developers" > "API keys"
2. Copiez votre **Publishable key** (commence par `pk_test_` ou `pk_live_`)
3. Copiez votre **Secret key** (commence par `sk_test_` ou `sk_live_`)

## Étape 3 : Configurer les variables d'environnement

### Pour le développement local
Créez un fichier `.env.local` à la racine du projet :

```bash
# Stripe - Paiements
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_votre_clé_publishable
VITE_STRIPE_SECRET_KEY=sk_test_votre_clé_secrète
```

### Pour Cloudflare Pages (production)
1. Allez dans votre dashboard Cloudflare Pages
2. Sélectionnez votre projet
3. Settings > Environment variables
4. Ajoutez :
   - `STRIPE_SECRET_KEY` = `sk_live_votre_clé_secrète`
   - `STRIPE_PUBLISHABLE_KEY` = `pk_live_votre_clé_publishable`

## Étape 4 : Configurer le Webhook Stripe

### 4.1 Créer un endpoint webhook
1. Dans Stripe Dashboard > Developers > Webhooks
2. Cliquez "Add endpoint"
3. URL : `https://votre-domaine.pages.dev/api/stripe-webhook`
4. Sélectionnez les événements :
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`

### 4.2 Obtenir le secret du webhook
1. Après création, cliquez sur le webhook
2. Copiez le "Signing secret" (commence par `whsec_`)
3. Ajoutez dans Cloudflare Pages :
   - `STRIPE_WEBHOOK_SECRET` = `whsec_votre_secret`

## Étape 5 : Créer des produits/prix (optionnel)

Pour une intégration complète, créez des produits dans Stripe :

1. Stripe Dashboard > Products
2. Créez 4 produits :
   - **Starter** : 9€/mois
   - **Plus** : 29€/mois
   - **Pro** : 79€/mois
   - **Enterprise** : 199€/mois

## Résultat

Une fois configuré, quand un utilisateur clique sur "Commencer avec Starter" (ou autre plan) :
1. Une session de paiement Stripe Checkout est créée
2. L'utilisateur est redirigé vers la page de paiement Stripe
3. Après paiement, il revient sur `/dashboard?payment=success`
4. Le webhook met à jour son abonnement dans Supabase

## Test en mode développement

Pour tester sans déployer :
1. Utilisez les clés de test (`pk_test_` et `sk_test_`)
2. Utilisez la carte de test : `4242 4242 4242 4242`
3. Date d'expiration : n'importe quelle date future
4. CVC : n'importe quel chiffre

## Troubleshooting

### "Stripe n'est pas configuré"
- Vérifiez que `VITE_STRIPE_PUBLISHABLE_KEY` est dans `.env.local`
- Redémarrez le serveur de développement

### "Failed to create checkout session"
- Vérifiez que l'application est déployée sur Cloudflare
- Vérifiez que `STRIPE_SECRET_KEY` est configuré dans Cloudflare
- Vérifiez les logs dans Cloudflare Pages

### Les webhooks ne fonctionnent pas
- Vérifiez que `STRIPE_WEBHOOK_SECRET` est correct
- Vérifiez les logs de webhook dans Stripe Dashboard
- Testez avec `stripe listen --forward-to localhost:5173/api/stripe-webhook`
