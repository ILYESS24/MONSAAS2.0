# 🔐 GUIDE DE SÉCURITÉ - DÉPLOIEMENT AURION SaaS

## 🚨 RÈGLES ABSOLUES DE SÉCURITÉ

### ❌ INTERDIT - JAMAIS COMMITTER :
- Clés API privées (`sk_live_*`, `OPENROUTER_API_KEY`, etc.)
- Tokens d'accès personnels
- Mots de passe
- Clés secrètes Stripe (`sk_*`)
- Clés privées Supabase

### ✅ AUTORISÉ - VARIABLES PUBLIQUES SEULEMENT :
- URLs publiques
- Clés publiques Stripe (`pk_live_*`)
- Clés publiques Clerk (`pk_test_*`, `pk_live_*`)
- Clés anonymes Supabase

---

## 🔧 CONFIGURATION CLOUDFLARE SECURE

### 1. Secrets Cloudflare (Cryptés - Côté Serveur)
Aller dans : **Cloudflare Dashboard → Pages → aurion-saas → Settings → Environment variables**

Ajouter ces **secrets** (ils seront cryptés et accessibles seulement côté serveur) :

```bash
# Base de données
SUPABASE_URL=https://otxxjczxwhtngcferckz.supabase.co
SUPABASE_SERVICE_ROLE_KEY=[VOTRE_CLÉ_SECRETE_SUPABASE]

# IA APIs
OPENROUTER_API_KEY=sk-or-v1-[VOTRE_CLÉ_OPENROUTER]
FREEPIK_API_KEY=[VOTRE_CLÉ_FREEPIK]

# Paiements
STRIPE_SECRET_KEY=sk_live_[VOTRE_CLÉ_STRIPE_SECRETE]
STRIPE_WEBHOOK_SECRET=whsec_[VOTRE_SECRET_WEBHOOK]
```

### 2. Variables Publiques (Côté Client)
Ces variables sont dans le script de déploiement et sont publiques :

```bash
# URLs et clés publiques (non sensibles)
VITE_SUPABASE_URL=https://otxxjczxwhtngcferckz.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

---

## 🚀 PROCÉDURE DE DÉPLOIEMENT SÉCURISÉ

### Étape 1 : Configuration des Secrets
```bash
# Dans Cloudflare Dashboard, ajouter les secrets listés ci-dessus
# NE PAS les mettre dans des fichiers locaux
```

### Étape 2 : Build et Déploiement
```bash
# Le script sécurisé fait tout automatiquement
./deploy-vars.sh
```

### Étape 3 : Vérification Post-Déploiement
```bash
# Tester que l'app fonctionne avec les vraies APIs
# Vérifier que les paiements Stripe fonctionnent
# Vérifier que l'IA OpenRouter répond
```

---

## 🔍 VÉRIFICATIONS DE SÉCURITÉ

### Checklist Pré-Déploiement
- [ ] Aucun fichier `.env*` committé avec des clés privées
- [ ] Aucun fichier `deploy*.env` dans le repo
- [ ] Tous les secrets configurés dans Cloudflare Dashboard
- [ ] Build réussi sans erreurs
- [ ] Tests de sécurité passés

### Checklist Post-Déploiement
- [ ] Authentification Clerk fonctionne
- [ ] Paiements Stripe fonctionnels
- [ ] APIs IA répondent correctement
- [ ] Dashboard affiche les bonnes données
- [ ] Aucune erreur 500 liée aux APIs

---

## 🚨 PROCÉDURES D'URGENCE

### Si une clé est accidentellement committée :
1. **INMÉDIAT :** Régénérer la clé compromise
2. **URGENT :** Supprimer le commit du repo
3. **OBLIGATOIRE :** Mettre à jour Cloudflare avec la nouvelle clé

### Commandes d'urgence :
```bash
# Supprimer le dernier commit (si pas poussé)
git reset --hard HEAD~1

# Supprimer un fichier du repo (même après commit)
git rm --cached fichier_compromis.env
git commit -m "Remove compromised file"
```

---

## 📋 BONNES PRATIQUES

### 1. Séparation des Environnements
- **Development** : Clés de test uniquement
- **Staging** : Clés de test uniquement
- **Production** : Clés live uniquement

### 2. Rotation des Clés
- Faire tourner les clés API régulièrement
- Avoir un plan de contingence pour chaque API

### 3. Monitoring
- Surveiller les logs pour détecter les utilisations suspectes
- Alertes sur les échecs d'API répétés

### 4. Principe du Moindre Privilège
- Clés API avec scopes minimaux
- Permissions limitées aux besoins réels

---

## 🔐 ARCHITECTURE SÉCURISÉE

```
Frontend (Navigateur)
    ↓ (Clés publiques seulement)
Cloudflare Pages (Static)
    ↓ (Variables publiques)
API Routes Cloudflare (Fonctions)
    ↓ (Secrets cryptés uniquement)
Services Externes (Stripe, OpenRouter, etc.)
```

**RÈGLE D'OR :** Aucune clé privée ne quitte jamais le côté serveur crypté.

---

## 📞 SUPPORT

En cas de problème de sécurité :
1. Régénérer immédiatement les clés compromises
2. Contacter l'équipe immédiatement
3. Documenter l'incident
4. Mettre à jour les procédures si nécessaire

**SOUVENIR : La sécurité n'est jamais "terminée" - c'est un processus continu.** 🔒
