# Solution au problème de déploiement Render

## Problème
Render utilise un Dockerfile Node.js (`FROM node:22-slim`) au lieu du Dockerfile PHP (`FROM php:8.2-apache`).

## Cause
Le service Render dans le dashboard est probablement configuré pour utiliser un Dockerfile spécifique ou un template automatique qui détecte Node.js.

## Solution IMMÉDIATE

### Option 1: Reconfigurer le service dans le Dashboard (RECOMMANDÉ)

1. Allez sur https://dashboard.render.com
2. Ouvrez votre service "opencart"
3. Cliquez sur **"Settings"** (en haut à droite)
4. Dans la section **"Build & Deploy"**, vérifiez/modifiez :
   - **Dockerfile Path**: Doit être exactement `Dockerfile` (pas `Dockerfile.render`, pas `./Dockerfile`, juste `Dockerfile`)
   - **Docker Context**: Doit être vide ou `.`
   - **Root Directory**: Doit être vide
5. **IMPORTANT**: Vérifiez qu'il n'y a pas de "Build Command" ou "Start Command" personnalisés qui pourraient interférer
6. Cliquez sur **"Save Changes"**
7. Allez dans l'onglet **"Events"** et cliquez sur **"Manual Deploy"** → **"Deploy latest commit"**

### Option 2: Supprimer et recréer le service

Si la reconfiguration ne fonctionne pas :

1. **Notez les variables d'environnement** actuelles (copiez-les)
2. Supprimez le service actuel
3. Créez un nouveau service web :
   - **Name**: opencart
   - **Runtime**: Docker (pas PHP, pas Node)
   - **Repository**: https://github.com/ILYESS24/ECOM.git
   - **Branch**: main
   - **Root Directory**: (laisser VIDE)
   - **Dockerfile Path**: `Dockerfile` (exactement ce nom, rien d'autre)
   - **Docker Context**: (laisser VIDE)
   - **Build Command**: (laisser VIDE)
   - **Start Command**: (laisser VIDE - défini dans le Dockerfile)
4. Ajoutez les variables d'environnement
5. Liez la base de données `opencart-db`

## Vérification

Le Dockerfile correct à la racine contient :
- `FROM php:8.2-apache` (pas `FROM node:22-slim`)
- `composer install` (pas `npm ci`)
- Configuration Apache pour le port 8080

## Si le problème persiste

Vérifiez dans le dashboard Render :
1. Que le "Dockerfile Path" est bien `Dockerfile` (sans chemin, sans extension)
2. Qu'il n'y a pas de "Build Command" personnalisé
3. Que le "Runtime" est bien "Docker" (pas "PHP" ou "Node")

Le Dockerfile correct est maintenant dans le repository à la racine. Une fois le service reconfiguré, le build devrait fonctionner.

