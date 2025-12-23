# 🔧 INSTRUCTIONS DE CONFIGURATION ENVIRONNEMENT

## 🚨 PROBLÈME IDENTIFIÉ

Votre application affiche une page blanche probablement à cause de variables d'environnement manquantes.

## ✅ SOLUTION

### Étape 1: Créer le fichier `.env.local`
Créez un fichier nommé `.env.local` à la racine du projet avec ce contenu :

```bash
# ============================================
# AURION SaaS - LOCAL ENVIRONMENT
# ============================================

# ============================================
# CLÉS CRITIQUES - DÉVELOPPEMENT
# ============================================

# Supabase - Base de données de développement
VITE_SUPABASE_URL=https://your-dev-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_dev_supabase_anon_key
VITE_SUPABASE_SERVICE_ROLE_KEY=your_dev_supabase_service_role_key

# Clerk - Authentification (mode test pour dev)
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_dev_key

# ============================================
# PAIEMENTS STRIPE - DEV (MODE TEST!)
# ============================================

VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_dev_key
STRIPE_SECRET_KEY=sk_test_your_stripe_dev_key
STRIPE_WEBHOOK_SECRET=whsec_your_dev_webhook_secret

# ============================================
# CONFIGURATION DÉVELOPPEMENT
# ============================================

NODE_ENV=development
VITE_APP_ENV=development

# ============================================
# DOMAINES AUTORISÉS (pour CORS)
# ============================================

ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

# ============================================
# SECRET POUR TOKENS DE SESSION IFRAME
# ============================================

TOOL_SESSION_SECRET=dev_secret_not_for_production
```

### Étape 2: Redémarrer le serveur
```bash
# Arrêter le serveur actuel (Ctrl+C)
npm run dev
```

### Étape 3: Tester
Ouvrez `http://localhost:5173` dans votre navigateur.

## 🎯 RÉSULTAT ATTENDU

- ✅ Page d'accueil avec LandingPage
- ✅ Navigation fonctionnelle
- ✅ Mode démo activé (sans authentification réelle)
- ✅ Boutons de paiement visibles mais nécessitant configuration Stripe

## 📝 NOTES IMPORTANTES

- Les clés commençant par `pk_test_` et `sk_test_` sont pour le développement uniquement
- Elles sont gratuites et ne débiteront pas de vraies cartes
- Pour la production, vous devrez obtenir des clés `pk_live_` et `sk_live_`
- Le mode démo fonctionne sans configuration Supabase/Clerk complète
