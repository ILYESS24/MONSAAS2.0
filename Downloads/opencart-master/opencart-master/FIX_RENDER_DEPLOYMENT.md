# Correction du déploiement Render

## Problème
Render essaie d'utiliser un Dockerfile Node.js au lieu du Dockerfile PHP/Apache.

## Solution

### Option 1: Reconfigurer le service dans le Dashboard Render (Recommandé)

1. Allez sur https://dashboard.render.com
2. Trouvez votre service "opencart"
3. Cliquez sur "Settings"
4. Dans la section "Build & Deploy", vérifiez :
   - **Dockerfile Path**: Doit être `Dockerfile` (pas `Dockerfile.render` ou autre)
   - **Docker Context**: Doit être vide ou `.`
5. Cliquez sur "Save Changes"
6. Déclenchez un nouveau déploiement : "Manual Deploy" → "Deploy latest commit"

### Option 2: Supprimer et recréer le service

Si la reconfiguration ne fonctionne pas :

1. Supprimez le service actuel
2. Créez un nouveau service web :
   - **Name**: opencart
   - **Runtime**: Docker
   - **Repository**: https://github.com/ILYESS24/ECOM.git
   - **Branch**: main
   - **Root Directory**: (laisser vide)
   - **Dockerfile Path**: `Dockerfile`
   - **Build Command**: (laisser vide)
   - **Start Command**: (laisser vide, défini dans le Dockerfile)

### Variables d'environnement requises

Assurez-vous d'ajouter ces variables dans le service :

```
PHP_VERSION=8.2
APP_ENV=production
DB_HOSTNAME=dpg-d4vuga3e5dus73anb62g-a
DB_DATABASE=opencart_db
DB_USERNAME=opencart_db_user
DB_PASSWORD=<obtenez-le depuis le dashboard de la base de données>
DB_PORT=5432
DB_DRIVER=pgsql
```

### Lier la base de données

Dans la section "Environment" du service, cliquez sur "Add Database" et sélectionnez "opencart-db". Render ajoutera automatiquement les variables de connexion.

## Vérification

Après le déploiement, le build devrait :
1. Utiliser `FROM php:8.2-apache`
2. Installer les extensions PHP (gd, mysqli, pdo_mysql, zip)
3. Installer Composer
4. Installer les dépendances PHP avec `composer install`
5. Configurer Apache pour écouter sur le port 8080
6. Définir le document root sur `/var/www/html/upload`

## Fichiers créés

- ✅ `Dockerfile` - Dockerfile principal pour Render
- ✅ `Dockerfile.render` - Alternative (non utilisé si Dockerfile existe)
- ✅ `.dockerignore` - Pour éviter les conflits
- ✅ `render.yaml` - Configuration Render (optionnel)

## Notes

- Le Dockerfile utilise le port 8080 car Render utilise la variable d'environnement `$PORT`
- Le document root est configuré sur `/var/www/html/upload` (répertoire OpenCart)
- Les permissions sont configurées automatiquement dans le Dockerfile

