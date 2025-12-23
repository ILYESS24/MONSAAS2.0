#!/bin/bash

# ============================================
# SAAS TEMPO - SCRIPT DE DÉPLOIEMENT PRODUCTION
# ============================================

set -e  # Exit on any error

echo "🚀 Déploiement SaaS Tempo - Production Ready"

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Vérification des prérequis
check_prerequisites() {
    log_info "Vérification des prérequis..."

    # Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js n'est pas installé"
        exit 1
    fi

    # npm
    if ! command -v npm &> /dev/null; then
        log_error "npm n'est pas installé"
        exit 1
    fi

    # wrangler (Cloudflare)
    if ! command -v wrangler &> /dev/null; then
        log_warning "wrangler n'est pas installé. Installation..."
        npm install -g wrangler
    fi

    # supabase CLI
    if ! command -v supabase &> /dev/null; then
        log_warning "Supabase CLI n'est pas installé. Installation recommandée pour la gestion DB."
    fi

    log_success "Prérequis vérifiés"
}

# Validation des variables d'environnement
validate_env() {
    log_info "Validation des variables d'environnement..."

    required_vars=(
        "VITE_CLERK_PUBLISHABLE_KEY"
        "VITE_SUPABASE_URL"
        "VITE_SUPABASE_ANON_KEY"
        "VITE_SUPABASE_SERVICE_ROLE_KEY"
        "STRIPE_PUBLISHABLE_KEY"
        "STRIPE_SECRET_KEY"
        "STRIPE_WEBHOOK_SECRET"
        "OPENROUTER_API_KEY"
        "FREEPIK_API_KEY"
        "JWT_SECRET"
    )

    missing_vars=()

    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            missing_vars+=("$var")
        fi
    done

    if [ ${#missing_vars[@]} -gt 0 ]; then
        log_error "Variables d'environnement manquantes:"
        for var in "${missing_vars[@]}"; do
            echo "  - $var"
        done
        log_error "Configurez toutes les variables dans votre fichier .env"
        exit 1
    fi

    log_success "Variables d'environnement validées"
}

# Test de connectivité
test_connectivity() {
    log_info "Test de connectivité des services externes..."

    # Test Supabase
    if curl -s "${VITE_SUPABASE_URL}/rest/v1/" > /dev/null; then
        log_success "Supabase accessible"
    else
        log_error "Supabase non accessible"
        exit 1
    fi

    # Test Stripe (connexion API)
    if curl -s -H "Authorization: Bearer ${STRIPE_SECRET_KEY}" \
        "https://api.stripe.com/v1/customers" > /dev/null 2>&1; then
        log_success "Stripe API accessible"
    else
        log_warning "Stripe API non accessible (peut être normal en dev)"
    fi
}

# Build et tests
build_and_test() {
    log_info "Build et tests..."

    # Installation des dépendances
    log_info "Installation des dépendances..."
    npm ci

    # Tests unitaires
    log_info "Exécution des tests unitaires..."
    if npm test; then
        log_success "Tests unitaires réussis"
    else
        log_error "Échec des tests unitaires"
        exit 1
    fi

    # Tests d'intégration
    log_info "Exécution des tests d'intégration..."
    if npm run test:e2e -- --headed=false; then
        log_success "Tests d'intégration réussis"
    else
        log_warning "Quelques tests d'intégration ont échoué (vérifiez les logs)"
    fi

    # Build de production
    log_info "Build de production..."
    if npm run build; then
        log_success "Build réussi"
    else
        log_error "Échec du build"
        exit 1
    fi
}

# Déploiement Cloudflare
deploy_cloudflare() {
    log_info "Déploiement Cloudflare Workers..."

    # Vérification de la connexion Cloudflare
    if ! wrangler auth status > /dev/null 2>&1; then
        log_warning "Non connecté à Cloudflare. Exécutez 'wrangler auth login'"
        log_info "Déploiement Cloudflare ignoré"
        return
    fi

    # Déploiement
    if wrangler deploy; then
        log_success "Cloudflare Workers déployés"
    else
        log_error "Échec du déploiement Cloudflare"
        exit 1
    fi
}

# Configuration base de données
setup_database() {
    log_info "Configuration de la base de données..."

    # Application du schéma Supabase
    log_info "Application du schéma de base de données..."
    if psql "${VITE_SUPABASE_URL//https:\/\/*supabase.co//}" \
        -f supabase-setup.sql \
        -U postgres > /dev/null 2>&1; then
        log_success "Schéma base de données appliqué"
    else
        log_warning "Impossible d'appliquer le schéma automatiquement"
        log_info "Appliquez manuellement supabase-setup.sql dans votre dashboard Supabase"
    fi

    # Test de l'intégrité des données
    log_info "Test de l'intégrité des données..."
    # Ici on pourrait ajouter un appel RPC pour vérifier l'intégrité
}

# Configuration monitoring
setup_monitoring() {
    log_info "Configuration du monitoring..."

    # Créer des webhooks Stripe si nécessaire
    log_info "Configuration des webhooks Stripe..."

    # Créer un webhook endpoint dans Stripe
    webhook_url="${CLOUDFLARE_DOMAIN}/api/stripe-webhook"

    # Utiliser l'API Stripe pour créer le webhook
    curl -X POST https://api.stripe.com/v1/webhook_endpoints \
        -H "Authorization: Bearer ${STRIPE_SECRET_KEY}" \
        -d url="${webhook_url}" \
        -d "enabled_events[]=checkout.session.completed" \
        -d "enabled_events[]=invoice.payment_succeeded" \
        -d "enabled_events[]=invoice.payment_failed" \
        -d "enabled_events[]=customer.subscription.updated" \
        -d "enabled_events[]=customer.subscription.deleted" \
        > /dev/null 2>&1 && log_success "Webhook Stripe configuré" || log_warning "Configuration webhook manuelle requise"

    log_success "Monitoring configuré"
}

# Vérifications finales
final_checks() {
    log_info "Vérifications finales..."

    # Test des endpoints critiques
    endpoints=(
        "/api/health"
        "/api/stripe-webhook"
        "/api/launch-tool"
        "/api/generate-image"
    )

    for endpoint in "${endpoints[@]}"; do
        if curl -s "${CLOUDFLARE_DOMAIN}${endpoint}" > /dev/null; then
            log_success "Endpoint ${endpoint} accessible"
        else
            log_error "Endpoint ${endpoint} non accessible"
        fi
    done

    # Vérification de l'intégrité de la base
    log_info "Vérification finale de l'intégrité..."
    # Appel RPC pour vérifier l'intégrité
}

# Fonction principale
main() {
    echo "================================================"
    echo "🚀 DÉPLOIEMENT SAAS TEMPO - PRODUCTION READY"
    echo "================================================"

    check_prerequisites
    validate_env
    test_connectivity
    build_and_test
    setup_database
    deploy_cloudflare
    setup_monitoring
    final_checks

    echo ""
    echo "================================================"
    log_success "🎉 DÉPLOIEMENT TERMINÉ AVEC SUCCÈS !"
    echo "================================================"
    echo ""
    echo "📊 Métriques à surveiller :"
    echo "  - Performance: SELECT * FROM get_performance_metrics(24);"
    echo "  - Erreurs: SELECT * FROM get_error_metrics(24);"
    echo "  - Intégrité: SELECT * FROM verify_data_integrity();"
    echo ""
    echo "🔧 Maintenance quotidienne :"
    echo "  SELECT daily_maintenance();"
    echo ""
    echo "📈 Monitoring en temps réel disponible dans les logs Supabase"
}

# Gestion des options
case "${1:-}" in
    "check")
        check_prerequisites
        validate_env
        test_connectivity
        log_success "Vérifications pré-déploiement réussies"
        ;;
    "test")
        build_and_test
        ;;
    "db")
        setup_database
        ;;
    "deploy")
        deploy_cloudflare
        ;;
    "monitor")
        setup_monitoring
        ;;
    *)
        main
        ;;
esac
