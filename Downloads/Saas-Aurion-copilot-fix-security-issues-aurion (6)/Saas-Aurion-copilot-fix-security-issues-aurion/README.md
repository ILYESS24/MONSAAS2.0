# AURION - AI Creation Platform

Une plateforme complète de création IA avec génération d'images, vidéos, code, agents et applications.

*Dernier déploiement: $(date)*

> ⚠️ **IMPORTANT**: Avant de déployer en production, lisez la [Documentation Complète](#-documentation-complète) ci-dessous.

## 🚀 Fonctionnalités

- **Génération d'images IA** - Créez des visuels uniques
- **Génération de vidéos IA** - Montez vos vidéos automatiquement
- **Génération de code IA** - Codez avec assistance IA
- **Agents IA** - Automatisez vos tâches complexes
- **Création d'applications** - Créez des apps sans coder
- **Éditeur de texte enrichi** - Éditeur de texte avec IA

## 🛠️ Technologies

- **Frontend**: React + TypeScript + Vite
- **UI**: Tailwind CSS + Radix UI + Framer Motion
- **Authentification**: Clerk
- **Base de données**: Supabase
- **Paiements**: Stripe
- **Déploiement**: Cloudflare Pages

## 📋 Prérequis

- Node.js 18+
- npm ou yarn

## 🚀 Installation

1. **Cloner le repository**
   ```bash
   git clone <repository-url>
   cd SAASTEMPO
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configurer les variables d'environnement**
   ```bash
   cp env.example .env
   ```

   Remplissez les variables dans `.env` :
   - `VITE_CLERK_PUBLISHABLE_KEY` - Clé publique Clerk
   - `VITE_SUPABASE_URL` - URL Supabase
   - `VITE_SUPABASE_ANON_KEY` - Clé anonyme Supabase
   - `STRIPE_PUBLISHABLE_KEY` - Clé publique Stripe
   - `STRIPE_SECRET_KEY` - Clé secrète Stripe
   - `STRIPE_WEBHOOK_SECRET` - Clé secrète pour valider les webhooks Stripe
   - `SUPABASE_SERVICE_ROLE_KEY` - Clé service role Supabase (pour les opérations admin)
   - `JWT_SECRET` - Clé secrète pour les tokens de session d'outils (Cloudflare Workers)
   - `OPENROUTER_API_KEY` - Clé API OpenRouter (pour AI Chat, Code, Document)
   - `FREEPIK_API_KEY` - Clé API Freepik (pour Génération d'images)

## 🏃‍♂️ Développement

```bash
# Démarrer le serveur de développement
npm run dev

# Démarrer le serveur backend Stripe (dans un autre terminal)
npm run dev:backend

# Démarrer les deux serveurs simultanément
npm run dev:stripe
```

L'application sera disponible sur `http://localhost:5178`

## 🧪 Tests

```bash
# Tests unitaires
npm test

# Tests E2E
npm run test:e2e

# Tests E2E avec interface graphique
npm run test:e2e:ui
```

## 🏗️ Build

```bash
# Build de production
npm run build

# Prévisualisation du build
npm run preview
```

## 🚀 Production & Monitoring

### Rate Limiting
Le système inclut un **rate limiting intelligent** :
- **10 lancements d'outils/minute** par utilisateur
- **20 générations d'images/minute** par utilisateur
- **100 webhooks Stripe/minute** (protection anti-spam)
- **60 requêtes/minute** par défaut

Headers de réponse :
```http
X-RateLimit-Remaining: 5
X-RateLimit-Reset: 1640995200000
Retry-After: 60
```

### Monitoring & Métriques
**Métriques temps réel** collectées automatiquement :
```sql
-- Performance par endpoint (dernières 24h)
SELECT * FROM get_performance_metrics(24);

-- Erreurs par endpoint
SELECT * FROM get_error_metrics(24);

-- Intégrité des données
SELECT * FROM verify_data_integrity();
```

### Backups Automatiques
**Maintenance quotidienne** :
```sql
-- Exécuter la maintenance complète
SELECT daily_maintenance();

-- Créer un backup manuel
SELECT create_backup_snapshot();
```

### Tests de Production
```bash
# Tests e2e complets pour Stripe
npm run test:e2e -- stripe-webhooks.spec.ts

# Tests de monitoring et backups
npm run test:e2e -- monitoring-backup.spec.ts

# Tests de sécurité et rate limiting
npm run test:e2e -- security-integration.spec.ts
```

## 🔧 Déploiement Production

### Checklist Pré-déploiement
- [ ] **Clés API configurées** : Stripe, Supabase, OpenRouter, Freepik
- [ ] **Variables d'environnement** validées
- [ ] **Base de données** migrée avec `supabase-setup.sql`
- [ ] **Webhooks Stripe** configurés avec l'URL de production
- [ ] **Rate limiting** activé
- [ ] **Monitoring** opérationnel
- [ ] **Backups** automatiques configurés

### Configuration Stripe
1. **Dashboard Stripe** > Webhooks > Add endpoint
2. **URL** : `https://your-domain.com/api/stripe-webhook`
3. **Événements** :
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`

## 📁 Structure du projet

```
src/
├── components/          # Composants React
│   ├── auth/           # Composants d'authentification
│   ├── blocks/         # Composants de blocs (header, footer)
│   ├── landing/        # Page d'accueil
│   ├── ui/             # Composants d'interface
│   └── ...
├── pages/              # Pages de l'application
│   ├── dashboard/      # Pages du dashboard
│   └── ...
├── services/           # Services (Stripe, Supabase, etc.)
├── hooks/              # Hooks personnalisés
├── types/              # Types TypeScript
└── lib/                # Utilitaires
```

## 🔧 Scripts disponibles

- `npm run dev` - Serveur de développement
- `npm run dev:backend` - Serveur backend Stripe
- `npm run build` - Build de production
- `npm run lint` - Vérification ESLint
- `npm run test` - Tests unitaires
- `npm run test:e2e` - Tests E2E

## 🚀 Déploiement

L'application est configurée pour le déploiement sur Cloudflare Pages :

```bash
npm run build
# Les fichiers sont générés dans le dossier `dist/`
```

## 📝 Notes de développement

- ESLint est configuré pour React/TypeScript
- Vitest pour les tests unitaires avec jsdom
- Playwright pour les tests E2E
- PWA support avec Vite PWA plugin

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT.

---

## 📚 Documentation Complète

### 🚨 NOUVEAU: Audit de Sécurité & Guide de Production

Avant tout déploiement en production, consultez ces guides essentiels:

#### 📖 Guides Principaux

1. **[SECURITY_AUDIT_SUMMARY.md](./SECURITY_AUDIT_SUMMARY.md)** 🇬🇧 (English)
   - Résumé exécutif de l'audit de sécurité
   - Failles critiques identifiées et corrigées
   - Architecture système complète
   - Guide de démarrage rapide (5 min)

2. **[AUDIT_TECHNIQUE.md](./AUDIT_TECHNIQUE.md)** 🇫🇷 (Français)
   - Analyse technique approfondie (400+ lignes)
   - Ce qui fonctionne vs ce qui ne fonctionne pas
   - Correctifs de sécurité implémentés
   - Recommandations pour la production

3. **[DEPLOYMENT.md](./DEPLOYMENT.md)** 🇫🇷 (Français)
   - Guide de déploiement étape par étape
   - Configuration Supabase, Stripe, Clerk
   - Variables d'environnement requises
   - Résolution de problèmes

4. **[TESTING.md](./TESTING.md)** 🇫🇷 (Français)
   - 13 scénarios de test critiques
   - Tests de sécurité, performance, régression
   - Parcours utilisateur E2E complet
   - Checklist pré-production

#### 🗄️ Base de Données

5. **[supabase-schema.sql](./supabase-schema.sql)**
   - Schéma complet de la base de données (400+ lignes)
   - Tables, triggers, fonctions RPC
   - Row Level Security (RLS)
   - **⚠️ REQUIS avant déploiement**

#### ⚡ Démarrage Rapide Production

```bash
# 1. Déployer le schéma de base de données
# Copier supabase-schema.sql → Supabase SQL Editor → Exécuter

# 2. Configurer les variables d'environnement
# Voir DEPLOYMENT.md pour la liste complète

# 3. Tester l'initialisation des tokens
# Créer un compte → Vérifier 100 crédits dans user_credits

# 4. Valider le système de paiement
# Paiement test → Vérifier crédit de tokens

# Pour plus de détails, voir DEPLOYMENT.md
```

#### 🔒 Fonctionnalités Clés du Système de Crédits

- ✅ **100 tokens gratuits** automatiquement attribués à chaque nouvel utilisateur
- ✅ **Consommation dynamique** basée sur l'utilisation réelle des outils
- ✅ **Blocage strict** quand les crédits sont épuisés (pas de mode démo)
- ✅ **Paiement Stripe** → Crédit immédiat des tokens (1000-100000 selon le plan)
- ✅ **Sécurité entreprise** : Transactions atomiques, RLS, rate limiting
- ✅ **Audit complet** : Chaque action enregistrée dans usage_logs

#### 📊 Metrics & Monitoring

Voir `DEPLOYMENT.md` section "Métriques à Surveiller" pour:
- Requêtes SQL de monitoring
- Métriques business (conversion, churn)
- Métriques techniques (latence, erreurs)

---

## 🆘 Support

- **GitHub Issues**: Pour les bugs et demandes de fonctionnalités
- **Documentation**: Voir les guides ci-dessus
- **Email**: support@aurion.app

---

**Version**: 1.0.0  
**Statut**: ✅ Production-Ready (avec déploiement du schéma)  
**Dernière mise à jour**: 2024-12-26
    sourceType: 'module',
    project: ['./tsconfig.json', './tsconfig.node.json'],
    tsconfigRootDir: __dirname,
  },
}
```

- Replace `plugin:@typescript-eslint/recommended` to `plugin:@typescript-eslint/recommended-type-checked` or `plugin:@typescript-eslint/strict-type-checked`
- Optionally add `plugin:@typescript-eslint/stylistic-type-checked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and add `plugin:react/recommended` & `plugin:react/jsx-runtime` to the `extends` list
