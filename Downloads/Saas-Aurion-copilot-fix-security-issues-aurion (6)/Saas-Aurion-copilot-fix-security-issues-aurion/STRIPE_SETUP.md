# 🔧 Configuration Stripe - Résolution de l'erreur 500

## ❌ Problème identifié
Votre application retourne une **erreur 500** lors des paiements Stripe car les clés configurées sont des **placeholders** (fausses clés).

## ✅ Solution - Configuration des vraies clés Stripe

### 1. Obtenir vos clés Stripe
1. Allez sur [https://dashboard.stripe.com](https://dashboard.stripe.com)
2. Connectez-vous à votre compte Stripe
3. Allez dans **"Developers" > "API keys"**
4. Copiez vos clés :
   - **Publishable key** (commence par `pk_live_...` pour production)
   - **Secret key** (commence par `sk_live_...` pour production)

### 2. Configuration dans wrangler.toml
Modifiez le fichier `wrangler.toml` et remplacez les lignes :

```toml
# AVANT (PLACEHOLDERS - NE MARCHENT PAS)
STRIPE_SECRET_KEY = "sk_live_placeholder_stripe_secret_key_for_testing"
STRIPE_PUBLISHABLE_KEY = "pk_live_placeholder_stripe_publishable_key"

# APRÈS (VRAIES CLÉS STRIPE)
STRIPE_SECRET_KEY = "sk_live_51QXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
STRIPE_PUBLISHABLE_KEY = "pk_live_51QXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
```

### 3. Configuration pour le développement local
Créez un fichier `.env.local` à la racine du projet :

```bash
# Clés Stripe pour développement
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51QXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_STRIPE_SECRET_KEY=sk_test_51QXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

### 4. Produits Stripe requis
Votre application utilise ces produits Stripe (déjà configurés) :
- **prod_Te15MpLvqryJHB** - AURION Starter (1000 crédits)
- **prod_Te17AfjPBXJkMf** - AURION Plus (5000 crédits)
- **prod_Te4WWQ2JdqTiJ0** - AURION Pro (25000 crédits)
- **prod_Te19LcD17x07QV** - AURION Enterprise (100000 crédits)

### 5. Prix automatiques
Les prix sont créés automatiquement :
- **Starter**: 9€
- **Plus**: 29€
- **Pro**: 79€
- **Enterprise**: 199€

### 6. Déploiement
Après avoir configuré les vraies clés :

```bash
npm run build
npx wrangler pages deployment create dist --project-name aurion-saas
```

## 🔍 Vérification
Une fois déployé, testez un paiement pour vérifier que l'erreur 500 est résolue.

## ❓ Support
Si vous n'avez pas de compte Stripe, créez-en un sur [https://stripe.com](https://stripe.com)

