# ============================================
# DÉPLOIEMENT OPTIMISÉ AURION SaaS - PowerShell
# Build + Performance + Monitoring Automatique
# ============================================

param(
    [switch]$SkipTests,
    [switch]$SkipBuild
)

# Simple logging functions
function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message"
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message"
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message"
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message"
}

# Main function
function Main {
    Write-Host "DEPLOIEMENT OPTIMISE AURION SaaS"
    Write-Host "================================="
    Write-Host ""

    # 1. Build (optional)
    if (-not $SkipBuild) {
        Write-Info "Build en cours..."
        try {
            $env:NODE_ENV = "production"
            & npx tsc
            if ($LASTEXITCODE -ne 0) { throw "TypeScript compilation failed" }

            & npx vite build --mode production
            if ($LASTEXITCODE -ne 0) { throw "Vite build failed" }

            Write-Success "Build reussi"
        }
        catch {
            Write-Error "Echec du build: $($_.Exception.Message)"
            exit 1
        }
    } else {
        Write-Info "Build ignore (--SkipBuild)"
    }

    # 2. Bundle analysis (optional)
    if (-not $SkipBuild -and (Test-Path "node_modules/.bin/vite-bundle-analyzer")) {
        Write-Info "Analyse du bundle..."
        try {
            & npx vite-bundle-analyzer dist
        }
        catch {
            Write-Warning "Analyse du bundle echouee (non critique)"
        }
    }

    # 3. Environment variables
    Write-Info "Configuration des variables..."
    $envContent = @"
# Frontend variables
VITE_SUPABASE_URL=https://otxxjczxwhtngcferckz.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90eHhqY3p4d2h0bmdjZmVyY2t6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU2NDcxOTEsImV4cCI6MjA4MTIyMzE5MX0.B4A300qQZCwP-aG4J29KfeazJM_Pp1eHKXQ98_bLMw8
VITE_CLERK_PUBLISHABLE_KEY=pk_test_YXNzdXJlZC1zYWxtb24tMzkuY2xlcmsuYWNjb3VudHMuZGV2JA
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_51PrM0F018rEaMULFvPnbftQHXqZtMtvJUJQ6qMZ2tA3WfYfP8Z2iN98vrDhxwTIuhp5mGlvNLcryQ8ejt9btwRQW00aUZCV0e5

# Backend variables (for functions)
SUPABASE_URL=https://otxxjczxwhtngcferckz.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90eHhqY3p4d2h0bmdjZmVyY2t6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY0MzM4NzU5MCwiZXhwIjoyMDA4OTYzNTkwfQ.placeholder_service_role_key
JWT_SECRET=aurion-secure-jwt-secret-key-for-tool-sessions-256-bit-random-string
STRIPE_SECRET_KEY=sk_live_placeholder_stripe_secret_key_for_testing
STRIPE_WEBHOOK_SECRET=whsec_placeholder_webhook_secret
OPENROUTER_API_KEY=sk-or-v1-placeholder-openrouter-api-key-for-testing
FREEPIK_API_KEY=placeholder-freepik-api-key-for-testing
ALLOWED_ORIGINS=https://aurion.app,https://www.aurion.app,https://genim.app,https://www.genim.app
"@

    $envContent | Out-File -FilePath "deploy-env.tmp" -Encoding utf8

    # 4. Deployment
    Write-Info "Deploiement Cloudflare..."
    try {
        & npx wrangler pages deploy dist --project-name=aurion-saas --env-file=deploy-env.tmp
        if ($LASTEXITCODE -ne 0) { throw "Wrangler deploy failed" }

        Write-Success "Deploiement reussi"
    }
    catch {
        Write-Error "Echec du deploiement: $($_.Exception.Message)"
        Remove-Item "deploy-env.tmp" -ErrorAction SilentlyContinue
        exit 1
    }

    # 5. Cleanup
    Remove-Item "deploy-env.tmp" -ErrorAction SilentlyContinue

    # 6. Performance tests (optional)
    if (-not $SkipTests) {
        Write-Host ""
        $runTests = Read-Host "Voulez-vous lancer les tests de performance ? (y/n)"
        if ($runTests -match "^(y|Y|yes|Yes|YES)$") {
            Write-Info "Lancement des tests Lighthouse..."

            # Wait for deployment to propagate
            Write-Info "Attente de propagation du deploiement (30s)..."
            Start-Sleep -Seconds 30

            # Performance tests
            try {
                & npm run performance:test
                if ($LASTEXITCODE -eq 0) {
                    Write-Success "Tests de performance reussis"
                }
                else {
                    Write-Warning "Quelques tests de performance ont echoue (verifier les logs)"
                }
            }
            catch {
                Write-Warning "Tests de performance non disponibles"
            }
        }
    }

    # 7. Summary
    Write-Host ""
    Write-Host "================================="
    Write-Success "DEPLOIEMENT TERMINE !"
    Write-Host "================================="
    Write-Host ""
    Write-Host "Metriques a surveiller :"
    Write-Host "  - Performance: https://pagespeed.web.dev/"
    Write-Host "  - Core Web Vitals: Dans Chrome DevTools"
    Write-Host "  - Lighthouse CI: npm run performance:test"
    Write-Host ""
    Write-Host "Optimisations appliquees :"
    Write-Host "  - Code splitting intelligent"
    Write-Host "  - Lazy loading des composants"
    Write-Host "  - Images optimisees (WebP/AVIF)"
    Write-Host "  - Service Worker pour le cache"
    Write-Host "  - Core Web Vitals monitoring"
    Write-Host "  - Resource hints pour LCP"
    Write-Host "  - Copywriting value-first complet"
    Write-Host ""
    Write-Host "URL de production: https://0c114c34.aurion-saas.pages.dev"
}

# Exécution
Main

