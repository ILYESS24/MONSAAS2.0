#!/bin/bash

# Cursor Clone - Script de déploiement
# Compatible Linux/Mac

set -e

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Fonction d'affichage
log() {
    echo -e "${2:-$NC}$1${NC}"
}

# Fonction d'exécution avec gestion d'erreur
execute() {
    log "📦 $2..." "$CYAN"
    if eval "$1"; then
        log "✅ $2 terminé" "$GREEN"
        return 0
    else
        log "❌ Erreur lors de $2" "$RED"
        return 1
    fi
}

# Menu principal
show_menu() {
    clear
    echo
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                     🚀 CURSOR CLONE                        ║"
    echo "║                     DÉPLOIEMENT RAPIDE                     ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo
    echo "Choisissez votre plateforme de déploiement :"
    echo
    echo "[1] 🌐 Netlify (Recommandé)"
    echo "[2] ⚡ Vercel"
    echo "[3] 🌊 Surge (Plus rapide)"
    echo "[4] 📄 GitHub Pages (Gratuit)"
    echo "[5] 🛠️  Déploiement manuel"
    echo "[6] 📖 Ouvrir la page de déploiement"
    echo "[0] ❌ Quitter"
    echo
}

# Fonction de déploiement Netlify
deploy_netlify() {
    log "🚀 Déploiement sur Netlify..." "$MAGENTA"

    # Vérifier Netlify CLI
    if ! command -v netlify &> /dev/null; then
        log "Netlify CLI n'est pas installé. Installation..." "$YELLOW"
        if ! execute "npm install -g netlify-cli" "Installation de Netlify CLI"; then
            log "Veuillez installer Netlify CLI manuellement: npm install -g netlify-cli" "$RED"
            return 1
        fi
    fi

    # Connexion
    if ! execute "netlify login" "Connexion à Netlify"; then
        return 1
    fi

    # Déploiement
    if ! execute "netlify deploy --prod --dir ." "Déploiement sur Netlify"; then
        return 1
    fi

    log "🎉 Application déployée avec succès sur Netlify !" "$GREEN"
}

# Fonction de déploiement Vercel
deploy_vercel() {
    log "🚀 Déploiement sur Vercel..." "$MAGENTA"

    # Vérifier Vercel CLI
    if ! command -v vercel &> /dev/null; then
        log "Vercel CLI n'est pas installé. Installation..." "$YELLOW"
        if ! execute "npm install -g vercel" "Installation de Vercel CLI"; then
            log "Veuillez installer Vercel CLI manuellement: npm install -g vercel" "$RED"
            return 1
        fi
    fi

    # Connexion
    if ! execute "vercel login" "Connexion à Vercel"; then
        return 1
    fi

    # Déploiement
    if ! execute "vercel --prod" "Déploiement sur Vercel"; then
        return 1
    fi

    log "🎉 Application déployée avec succès sur Vercel !" "$GREEN"
}

# Fonction de déploiement Surge
deploy_surge() {
    log "🚀 Déploiement sur Surge..." "$MAGENTA"

    # Vérifier Surge
    if ! command -v surge &> /dev/null; then
        log "Surge n'est pas installé. Installation..." "$YELLOW"
        if ! execute "npm install -g surge" "Installation de Surge"; then
            log "Veuillez installer Surge manuellement: npm install -g surge" "$RED"
            return 1
        fi
    fi

    # Générer un nom de domaine
    DOMAIN="cursor-clone-$(openssl rand -hex 4).surge.sh"

    # Déploiement
    if ! execute "surge . $DOMAIN" "Déploiement sur Surge ($DOMAIN)"; then
        return 1
    fi

    log "🎉 Application déployée avec succès sur Surge !" "$GREEN"
    log "🌐 URL: https://$DOMAIN" "$CYAN"
}

# Fonction GitHub Pages
deploy_github() {
    log "🚀 Configuration GitHub Pages..." "$MAGENTA"

    # Initialiser git si nécessaire
    if [ ! -d ".git" ]; then
        log "Initialisation du repository git..." "$YELLOW"
        if ! execute "git init" "Initialisation git"; then
            return 1
        fi
    fi

    # Ajouter les fichiers
    if ! execute "git add ." "Ajout des fichiers"; then
        return 1
    fi

    # Commit
    if ! execute "git commit -m 'Deploy Cursor Clone'" "Commit des fichiers"; then
        return 1
    fi

    # Instructions
    echo
    log "📋 Instructions GitHub Pages :" "$YELLOW"
    echo "1. Créez un repository sur GitHub"
    echo "2. Ajoutez le remote :"
    echo -e "   ${CYAN}git remote add origin https://github.com/yourusername/your-repo.git${NC}"
    echo "3. Poussez le code :"
    echo -e "   ${CYAN}git push -u origin main${NC}"
    echo "4. Allez dans Settings > Pages"
    echo "5. Sélectionnez 'main' branch et '/ (root)'"
    echo "6. Votre site sera disponible à : https://yourusername.github.io/your-repo"
    echo
}

# Fonction de déploiement manuel
manual_deploy() {
    echo
    log "📋 Instructions de déploiement manuel :" "$YELLOW"
    echo
    echo "1. Ouvrez index.html dans votre navigateur"
    echo "2. Ou utilisez un serveur local :"
    echo -e "   ${CYAN}python3 -m http.server 8000${NC}"
    echo "   Puis allez sur http://localhost:8000"
    echo
    echo "3. Pour un déploiement en ligne :"
    echo "   - Glissez-déposez index.html sur https://netlify.com"
    echo "   - Utilisez Surge : npm install -g surge && surge"
    echo "   - Ou tout autre hébergeur de fichiers statiques"
    echo
}

# Fonction pour ouvrir la page de déploiement
open_deploy_page() {
    log "🌐 Ouverture de la page de déploiement..." "$BLUE"

    # Détecter le système d'exploitation
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        open deploy.html
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        if command -v xdg-open &> /dev/null; then
            xdg-open deploy.html
        elif command -v firefox &> /dev/null; then
            firefox deploy.html
        else
            log "Impossible d'ouvrir automatiquement le navigateur" "$YELLOW"
            log "Ouvrez manuellement deploy.html dans votre navigateur" "$YELLOW"
        fi
    else
        log "Système d'exploitation non supporté pour l'ouverture automatique" "$YELLOW"
        log "Ouvrez manuellement deploy.html dans votre navigateur" "$YELLOW"
    fi
}

# Boucle principale
while true; do
    show_menu

    read -p "Votre choix (0-6) : " choice

    case $choice in
        1)
            deploy_netlify
            ;;
        2)
            deploy_vercel
            ;;
        3)
            deploy_surge
            ;;
        4)
            deploy_github
            ;;
        5)
            manual_deploy
            read -p "Appuyez sur Entrée pour continuer..."
            continue
            ;;
        6)
            open_deploy_page
            read -p "Appuyez sur Entrée pour continuer..."
            continue
            ;;
        0)
            log "Au revoir ! 👋" "$CYAN"
            exit 0
            ;;
        *)
            log "Choix invalide. Veuillez réessayer." "$RED"
            sleep 2
            continue
            ;;
    esac

    echo
    read -p "Voulez-vous déployer ailleurs ? (o/N) : " again
    if [[ ! "$again" =~ ^[oOyY]$ ]]; then
        break
    fi
done

log "✅ Déploiement terminé !" "$GREEN"
