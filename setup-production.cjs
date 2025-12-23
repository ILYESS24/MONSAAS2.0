#!/usr/bin/env node
// ============================================
// SETUP PRODUCTION - GUIDE AUTOMATISÉ
// ============================================

const { execSync } = require('child_process');

console.log('🚀 SETUP PRODUCTION AURION SaaS - GUIDE AUTOMATISÉ\n');

// 1. Vérifier l'état actuel
console.log('1️⃣ VÉRIFICATION ÉTAT ACTUEL');
console.log('==========================');

try {
  execSync('git status --porcelain', { stdio: 'inherit' });
  console.log('✅ Git status OK\n');
} catch (error) {
  console.log('❌ Erreur Git\n');
}

// 2. Build de sécurité
console.log('2️⃣ BUILD DE SÉCURITÉ');
console.log('===================');

try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build réussi\n');
} catch (error) {
  console.log('❌ Build échoué - Corriger les erreurs\n');
  process.exit(1);
}

// 3. Instructions Cloudflare
console.log('3️⃣ CONFIGURATION CLOUDFLARE (À FAIRE MANUELLEMENT)');
console.log('==================================================');

console.log('🔐 ALLER DANS : https://dash.cloudflare.com → Pages → aurion-saas → Settings → Environment variables');
console.log('');
console.log('AJOUTER CES SECRETS (cryptés côté serveur) :');
console.log('');
console.log('• SUPABASE_SERVICE_ROLE_KEY=[votre_clé_admin_Supabase]');
console.log('• OPENROUTER_API_KEY=sk-or-v1-[votre_clé_OpenRouter]');
console.log('• FREEPIK_API_KEY=[votre_clé_FreePick]');
console.log('• STRIPE_SECRET_KEY=sk_live_[votre_clé_Secret_Stripe]');
console.log('• STRIPE_WEBHOOK_SECRET=whsec_[votre_secret_webhook]');
console.log('');

// 4. Instructions de déploiement
console.log('4️⃣ DÉPLOIEMENT SÉCURISÉ');
console.log('========================');

console.log('APRÈS avoir configuré les secrets dans Cloudflare, exécuter :');
console.log('');
console.log('  ./deploy-vars.sh');
console.log('');
console.log('Ce script :');
console.log('✅ Utilise uniquement les variables publiques');
console.log('✅ Vérifie que le build fonctionne');
console.log('✅ Annule le déploiement si problème');
console.log('✅ Ne commet jamais de clés sensibles');
console.log('');

// 5. Tests post-déploiement
console.log('5️⃣ TESTS POST-DÉPLOIEMENT');
console.log('==========================');

console.log('À tester après déploiement :');
console.log('• 🔐 Authentification Clerk fonctionne');
console.log('• 💳 Paiements Stripe opérationnels');
console.log('• 🤖 APIs IA répondent (OpenRouter, FreePick)');
console.log('• 📊 Dashboard temps réel actif');
console.log('• 🛡️ Iframes sécurisées (pas d\'accès direct)');
console.log('• 💰 Crédits consommés correctement');
console.log('');

console.log('🎯 RÉSULTAT ATTENDU : SaaS production-ready avec sécurité maximale !');
console.log('');
console.log('⚠️  IMPORTANT : Ne jamais committer de vraies clés API dans le repo !');
