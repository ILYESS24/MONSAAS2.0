# 🚀 AURION SaaS - Guide de Déploiement Production

## ⚡ Déploiement Rapide (5 minutes)

Ce guide vous permet de déployer AURION en production avec un système de crédits/tokens entièrement fonctionnel.

---

## 📋 Prérequis

- [ ] Compte Supabase (https://supabase.com)
- [ ] Compte Stripe (https://stripe.com)
- [ ] Compte Clerk (https://clerk.dev)
- [ ] Compte Cloudflare Pages (https://pages.cloudflare.com)
- [ ] Node.js 18+ installé

---

## 🗄️ Étape 1: Configuration Base de Données Supabase

### 1.1 Créer un Projet Supabase

1. Allez sur https://app.supabase.com
2. Cliquez sur "New Project"
3. Notez votre:
   - `SUPABASE_URL` (ex: https://xxxxx.supabase.co)
   - `SUPABASE_ANON_KEY` (clé publique)
   - `SUPABASE_SERVICE_ROLE_KEY` (clé privée)

### 1.2 Exécuter le Schéma de Base de Données ⭐

**CRITIQUE**: Cette étape initialise TOUT le système de crédits.

1. Ouvrez le SQL Editor dans Supabase
2. Copiez le contenu de `supabase-schema.sql`
3. Cliquez sur "Run"
4. Vérifiez que toutes les tables sont créées:

```sql
-- Vérification rapide
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Devrait afficher:
-- - profiles
-- - user_plans
-- - user_credits ⭐
-- - usage_logs
-- - tool_sessions
-- - stripe_sessions
-- - user_subscriptions
```

5. Vérifiez que le trigger est actif:

```sql
SELECT trigger_name, event_object_table 
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- Devrait retourner: on_auth_user_created | users
```

✅ **Test**: Créer un compte test et vérifier que 100 crédits sont auto-assignés:

```sql
-- Après avoir créé un compte test via l'interface
SELECT u.email, c.total_credits, c.used_credits
FROM auth.users u
JOIN public.user_credits c ON u.id = c.user_id
WHERE u.email = 'votre-email-test@example.com';

-- Devrait afficher: total_credits = 100, used_credits = 0
```

---

## 💳 Étape 2: Configuration Stripe

### 2.1 Créer des Produits Stripe

1. Allez sur https://dashboard.stripe.com/products
2. Créez 4 produits avec prix récurrents mensuels:

| Plan | Prix Mensuel | ID Produit (à noter) |
|------|--------------|----------------------|
| Starter | $9 | prod_xxxxx1 |
| Plus | $29 | prod_xxxxx2 |
| Pro | $99 | prod_xxxxx3 |
| Enterprise | $499 | prod_xxxxx4 |

3. **Important**: Notez les Product IDs

### 2.2 Mapper les Produits dans le Code

Modifiez `functions/api/stripe-webhook.ts` ligne 13-18:

```typescript
const STRIPE_PRODUCT_TO_PLAN = {
  'prod_xxxxx1': 'starter',    // Votre Product ID Starter
  'prod_xxxxx2': 'plus',       // Votre Product ID Plus
  'prod_xxxxx3': 'pro',        // Votre Product ID Pro
  'prod_xxxxx4': 'enterprise', // Votre Product ID Enterprise
};
```

### 2.3 Configurer le Webhook Stripe

1. Allez sur https://dashboard.stripe.com/webhooks
2. Cliquez "Add endpoint"
3. URL: `https://votre-domaine.com/api/stripe-webhook`
4. Sélectionnez ces événements:
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.payment_succeeded`
   - ✅ `invoice.payment_failed`

5. **Notez** le `Webhook Signing Secret` (commence par `whsec_`)

---

## 🔐 Étape 3: Configuration Clerk (Authentification)

### 3.1 Créer une Application Clerk

1. Allez sur https://dashboard.clerk.dev
2. Créez une nouvelle application
3. Activez les providers:
   - ✅ Email + Password
   - ✅ Google OAuth (optionnel)
   - ✅ GitHub OAuth (optionnel)

### 3.2 Configurer le JWT Template

**CRITIQUE**: Clerk doit générer des tokens compatibles avec Supabase.

1. Dans Clerk Dashboard → JWT Templates
2. Créez un template "Supabase"
3. Configurez:

```json
{
  "aud": "authenticated",
  "exp": "{{user.expiresAt}}",
  "sub": "{{user.id}}",
  "email": "{{user.primaryEmailAddress}}",
  "role": "authenticated"
}
```

4. Notez:
   - `CLERK_PUBLISHABLE_KEY` (pk_test_... ou pk_live_...)
   - `CLERK_SECRET_KEY` (sk_test_... ou sk_live_...)

---

## 🌐 Étape 4: Configuration Cloudflare Pages

### 4.1 Variables d'Environnement

Dans Cloudflare Pages → Settings → Environment Variables, ajoutez:

```env
# Supabase
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Stripe
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# Clerk
VITE_CLERK_PUBLISHABLE_KEY=pk_live_xxxxx
CLERK_SECRET_KEY=sk_live_xxxxx

# Security
JWT_SECRET=<générer une chaîne aléatoire de 32+ caractères>

# OpenRouter (pour AI features)
OPENROUTER_API_KEY=sk-or-v1-xxxxx

# Freepik (pour image generation)
FREEPIK_API_KEY=xxxxx
```

### 4.2 Générer JWT_SECRET

```bash
# Méthode 1: OpenSSL
openssl rand -base64 32

# Méthode 2: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Utilisez la sortie comme JWT_SECRET
```

---

## 🚀 Étape 5: Build et Déploiement

### 5.1 Installation Locale

```bash
# Cloner le repo
git clone https://github.com/ILYESS24/AURION-ON.git
cd AURION-ON

# Installer les dépendances
npm install

# Créer .env local pour tests
cp .env.example .env
# Remplir avec vos vraies clés
```

### 5.2 Build Production

```bash
# Build optimisé
npm run build:prod

# Le dossier dist/ est généré
```

### 5.3 Déployer sur Cloudflare

```bash
# Option 1: Via Wrangler CLI
npm run deploy:cloudflare

# Option 2: Via Git (recommandé)
git push origin main
# Cloudflare détecte automatiquement et build
```

### 5.4 Configuration DNS

1. Dans Cloudflare → DNS Records
2. Ajoutez un CNAME pointant vers votre Cloudflare Pages:
   ```
   @ CNAME aurion-saas.pages.dev
   www CNAME aurion-saas.pages.dev
   ```

---

## ✅ Étape 6: Tests de Validation

### Test 1: Création de Compte (CRITICAL)

```bash
1. Allez sur https://votre-domaine.com
2. Créez un nouveau compte
3. Vérifiez dans Supabase SQL Editor:

SELECT 
  p.email,
  c.total_credits,
  c.used_credits,
  pl.plan_type,
  pl.status
FROM profiles p
JOIN user_credits c ON p.id = c.user_id
JOIN user_plans pl ON p.id = pl.user_id
WHERE p.email = 'votre-test@example.com';

✅ PASS si: total_credits = 100, used_credits = 0, plan_type = 'free'
```

### Test 2: Consommation de Crédits

```bash
1. Connectez-vous avec votre compte test
2. Allez sur un outil (ex: /tools/app-builder)
3. Cliquez "Launch Tool"
4. Vérifiez dans Supabase:

SELECT * FROM user_credits 
WHERE user_id = (SELECT id FROM profiles WHERE email = 'votre-test@example.com');

✅ PASS si: used_credits > 0 (doit avoir augmenté)

5. Vérifiez les logs:

SELECT * FROM usage_logs 
WHERE user_id = (SELECT id FROM profiles WHERE email = 'votre-test@example.com')
ORDER BY created_at DESC LIMIT 5;

✅ PASS si: action_type = 'launch_tool_app-builder', credits_used = 50
```

### Test 3: Blocage à Zéro Crédit (CRITICAL)

```bash
1. Dans Supabase SQL Editor, épuisez les crédits:

UPDATE user_credits 
SET used_credits = total_credits 
WHERE user_id = (SELECT id FROM profiles WHERE email = 'votre-test@example.com');

2. Tentez de lancer un outil depuis l'interface
3. Vérifiez:
   - ❌ Modal "Credits Exhausted" apparaît
   - ❌ Iframe ne se charge PAS
   - ❌ Bouton "Launch Tool" est désactivé

✅ PASS si: Aucun moyen d'utiliser les outils
```

### Test 4: Paiement Stripe (CRITICAL)

```bash
1. Restaurez les crédits pour le test:

UPDATE user_credits 
SET total_credits = 100, used_credits = 90 
WHERE user_id = (SELECT id FROM profiles WHERE email = 'votre-test@example.com');

2. Depuis l'interface, cliquez "Upgrade" → Sélectionnez "Starter Plan"
3. Utilisez carte test Stripe: 4242 4242 4242 4242
4. Complétez le paiement

5. Vérifiez immédiatement dans Supabase:

SELECT c.total_credits, c.used_credits, pl.plan_type 
FROM user_credits c
JOIN user_plans pl ON c.user_id = pl.user_id
WHERE c.user_id = (SELECT id FROM profiles WHERE email = 'votre-test@example.com');

✅ PASS si: total_credits = 1000, used_credits = 0, plan_type = 'starter'

6. Vérifiez les logs:

SELECT metadata FROM usage_logs 
WHERE user_id = (SELECT id FROM profiles WHERE email = 'votre-test@example.com')
AND action_type = 'plan_upgraded'
ORDER BY created_at DESC LIMIT 1;

✅ PASS si: metadata contient credits_granted = 1000
```

### Test 5: Webhook Stripe

```bash
# Test manuel du webhook avec Stripe CLI
stripe listen --forward-to https://votre-domaine.com/api/stripe-webhook

# Dans un autre terminal, déclencher un événement test
stripe trigger checkout.session.completed

# Vérifiez les logs Cloudflare Workers:
# Devrait afficher: "✅ Checkout session completed"
```

---

## 🔒 Sécurité Post-Déploiement

### Checklist Sécurité

- [ ] **Row Level Security (RLS)** activée sur toutes les tables Supabase
- [ ] **Variables secrètes** JAMAIS committées dans Git
- [ ] **Webhook Stripe** vérifie la signature (ligne 47 de stripe-webhook.ts)
- [ ] **Rate limiting** actif sur tous les endpoints (auth.ts ligne 226-252)
- [ ] **CORS** configuré pour domaines autorisés uniquement
- [ ] **JWT_SECRET** fort (32+ caractères aléatoires)
- [ ] **HTTPS** forcé sur le domaine de production

### Monitoring Recommandé

1. **Supabase Dashboard** → Database → Logs
   - Surveiller les erreurs de trigger
   - Surveiller les requêtes lentes

2. **Stripe Dashboard** → Webhooks → Events
   - Vérifier que les webhooks sont bien reçus (200 OK)
   - Vérifier aucun événement en échec

3. **Cloudflare Dashboard** → Analytics
   - Surveiller le trafic
   - Surveiller les erreurs 403 (crédits insuffisants)
   - Surveiller les erreurs 500 (bugs)

4. **Sentry** (optionnel mais recommandé)
   ```bash
   npm install @sentry/react
   # Configurer dans src/main.tsx
   ```

---

## 🐛 Dépannage

### Problème: "User credits not found" après signup

**Cause**: Trigger `handle_new_user()` pas actif

**Solution**:
```sql
-- Vérifier le trigger
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';

-- Si absent, re-exécuter supabase-schema.sql
```

### Problème: "Demo mode enabled" dans les logs

**Cause**: Code pas à jour après ce PR

**Solution**:
```bash
git pull origin main
npm run build:prod
# Re-déployer
```

### Problème: Stripe webhook échoue

**Cause**: Secret webhook incorrect

**Solution**:
1. Vérifiez `STRIPE_WEBHOOK_SECRET` dans Cloudflare variables
2. Comparez avec Stripe Dashboard → Webhooks → Signing secret
3. Re-déployez après correction

### Problème: Credits ne se réinitialisent pas après paiement

**Cause**: Mapping Product ID incorrect

**Solution**:
1. Vérifiez les Product IDs dans Stripe Dashboard
2. Mettez à jour `STRIPE_PRODUCT_TO_PLAN` dans stripe-webhook.ts
3. Re-déployez

---

## 📊 Architecture de Production

```
┌────────────────────────────────────────────┐
│        Users (Browser)                     │
│  - React Frontend (Cloudflare Pages CDN)   │
│  - Clerk Authentication                    │
└────────────────────────────────────────────┘
                    ↓ HTTPS
┌────────────────────────────────────────────┐
│    Cloudflare Workers (Edge Functions)     │
│  - /api/validate-tool-access               │
│  - /api/stripe-webhook                     │
│  - /api/generate-image                     │
│  - Middleware: auth, rate-limit            │
└────────────────────────────────────────────┘
                    ↓ PostgreSQL Protocol
┌────────────────────────────────────────────┐
│         Supabase (PostgreSQL)              │
│  - user_credits (100 tokens on signup)     │
│  - user_plans (free → paid transitions)    │
│  - usage_logs (audit trail)                │
│  - RPC: consume_user_credits()             │
│  - Trigger: handle_new_user()              │
└────────────────────────────────────────────┘
                    ↑
                    │ Webhooks
┌────────────────────────────────────────────┐
│              Stripe                        │
│  - Checkout Sessions                       │
│  - Subscriptions Management                │
│  - Webhooks → /api/stripe-webhook          │
└────────────────────────────────────────────┘
```

---

## 📈 Métriques à Surveiller

### Métriques Business

- **Taux de conversion**: Free → Starter (cible: >5%)
- **Churn rate**: Annulations mensuelles (cible: <5%)
- **Crédits moyens consommés**: Par user (baseline)
- **Revenue MRR**: Revenu récurrent mensuel

### Métriques Techniques

- **Latence API**: /api/validate-tool-access (<200ms)
- **Taux d'erreur**: 500 errors (<1%)
- **Disponibilité**: Uptime (>99.9%)
- **Temps de réponse Webhook**: Stripe (<3s)

### SQL pour métriques

```sql
-- Utilisateurs par plan
SELECT plan_type, COUNT(*) as users
FROM user_plans
WHERE status = 'active'
GROUP BY plan_type;

-- Consommation moyenne par jour
SELECT 
  DATE(created_at) as date,
  SUM(credits_used) as total_credits,
  COUNT(DISTINCT user_id) as active_users,
  SUM(credits_used) / COUNT(DISTINCT user_id) as avg_per_user
FROM usage_logs
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Top outils utilisés
SELECT 
  action_type,
  COUNT(*) as usage_count,
  SUM(credits_used) as total_credits
FROM usage_logs
WHERE action_type LIKE 'launch_tool_%'
GROUP BY action_type
ORDER BY usage_count DESC;
```

---

## 🎓 Formation Équipe

### Checklist Onboarding

- [ ] Lire `AUDIT_TECHNIQUE.md` en entier
- [ ] Comprendre le flow: Signup → Credits → Tools → Blocking → Payment
- [ ] Tester manuellement les 5 scénarios critiques
- [ ] Savoir lire les logs Supabase et Cloudflare
- [ ] Connaître les commandes SQL de debug

### Commandes Utiles

```sql
-- Reset crédits pour un utilisateur (testing)
UPDATE user_credits 
SET total_credits = 100, used_credits = 0 
WHERE user_id = 'uuid-here';

-- Voir l'historique complet d'un user
SELECT * FROM usage_logs 
WHERE user_id = 'uuid-here' 
ORDER BY created_at DESC;

-- Compter les users sans crédits
SELECT COUNT(*) FROM user_credits 
WHERE total_credits - used_credits <= 0;
```

---

## 📞 Support

### En cas de problème critique en production:

1. **Vérifier les logs**:
   - Cloudflare Dashboard → Workers → Logs
   - Supabase Dashboard → Logs
   - Stripe Dashboard → Webhooks → Events

2. **Rollback rapide**:
   ```bash
   # Revenir au commit précédent
   git revert HEAD
   git push origin main
   # Cloudflare redéploie automatiquement
   ```

3. **Contact**:
   - GitHub Issues: https://github.com/ILYESS24/AURION-ON/issues
   - Email: support@aurion.app

---

**Date de mise à jour**: 2024-12-26  
**Version**: 1.0.0  
**Statut**: ✅ Production-Ready
