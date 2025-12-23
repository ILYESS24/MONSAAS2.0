#!/bin/bash

# ============================================
# DÉPLOIEMENT OPTIMISÉ AURION SaaS
# Build + Performance + Monitoring Automatique
# ============================================

set -e

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Fonction principale
main() {
    echo "🚀 DÉPLOIEMENT OPTIMISÉ AURION SaaS"
    echo "===================================="

    # 1. Build optimisé
    log_info "🔨 Build optimisé en cours..."
    npm run build:prod

    if [ $? -eq 0 ]; then
        log_success "✅ Build réussi"
    else
        log_error "❌ Échec du build"
        exit 1
    fi

    # 2. Analyse statique du bundle
    log_info "📊 Analyse du bundle..."
    npx vite-bundle-analyzer dist

    # 3. Variables d'environnement
    log_info "🔐 Configuration des variables..."
    cat > deploy-env.tmp << EOF
VITE_SUPABASE_URL=https://otxxjczxwhtngcferckz.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90eHhqY3p4d2h0bmdjZmVyY2t6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU2NDcxOTEsImV4cCI6MjA4MTIyMzE5MX0.B4A300qQZCwP-aG4J29KfeazJM_Pp1eHKXQ98_bLMw8
VITE_CLERK_PUBLISHABLE_KEY=pk_test_YXNzdXJlZC1zYWxtb24tMzkuY2xlcmsuYWNjb3VudHMuZGV2JA
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_51PrM0F018rEaMULFvPnbftQHXqZtMtvJUJQ6qMZ2tA3WfYfP8Z2iN98vrDhxwTIuhp5mGlvNLcryQ8ejt9btwRQW00aUZCV0e5
EOF

    # 4. Déploiement
    log_info "🚀 Déploiement Cloudflare..."
    npx wrangler pages deploy dist --project-name=aurion-saas --env-file=deploy-env.tmp

    if [ $? -eq 0 ]; then
        log_success "✅ Déploiement réussi"
    else
        log_error "❌ Échec du déploiement"
        rm -f deploy-env.tmp
        exit 1
    fi

    # 5. Nettoyage
    rm -f deploy-env.tmp

    # 6. Tests de performance (optionnel)
    echo ""
    log_info "🧪 Voulez-vous lancer les tests de performance ? (y/n)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        log_info "📊 Lancement des tests Lighthouse..."

        # Attendre que le déploiement soit propagé
        log_info "⏳ Attente de propagation du déploiement (30s)..."
        sleep 30

        # Tests de performance
        npm run performance:test

        if [ $? -eq 0 ]; then
            log_success "✅ Tests de performance réussis"
        else
            log_warning "⚠️ Quelques tests de performance ont échoué (vérifier les logs)"
        fi
    fi

    # 7. Résumé
    echo ""
    echo "===================================="
    log_success "🎉 DÉPLOIEMENT TERMINÉ !"
    echo "===================================="
    echo ""
    echo "📊 Métriques à surveiller :"
    echo "  • Performance: https://pagespeed.web.dev/"
    echo "  • Core Web Vitals: Dans Chrome DevTools"
    echo "  • Lighthouse CI: npm run performance:test"
    echo ""
    echo "🔧 Optimisations appliquées :"
    echo "  • ✅ Code splitting intelligent"
    echo "  • ✅ Lazy loading des composants"
    echo "  • ✅ Images optimisées (WebP/AVIF)"
    echo "  • ✅ Service Worker pour le cache"
    echo "  • ✅ Core Web Vitals monitoring"
    echo "  • ✅ Resource hints pour LCP"
    echo ""
    echo "🌐 URL de production: https://0c114c34.aurion-saas.pages.dev"
}

# Exécution
main "$@"
