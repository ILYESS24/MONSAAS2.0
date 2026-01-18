# URGENT: Correction du déploiement Render

## Problème
Render utilise un Dockerfile Node.js (`FROM node:22-slim`) au lieu du Dockerfile PHP (`FROM php:8.2-apache`).

## Solution IMMÉDIATE

### Étape 1: Vérifier le Dockerfile dans le Dashboard Render

1. Allez sur https://dashboard.render.com
2. Ouvrez votre service "opencart"
3. Cliquez sur **"Settings"** (en haut à droite)
4. Dans la section **"Build & Deploy"**, vérifiez :
   - **Dockerfile Path**: Doit être exactement `Dockerfile` (pas `Dockerfile.render`, pas `./Dockerfile`, juste `Dockerfile`)
   - **Docker Context**: Doit être vide ou `.`
   - **Root Directory**: Doit être vide

### Étape 2: Supprimer toute configuration automatique

1. Dans les **"Environment Variables"**, vérifiez qu'il n'y a pas de variable `DOCKERFILE_PATH` ou similaire
2. Dans **"Build Command"**, supprimez toute commande personnalisée (doit être vide)
3. Dans **"Start Command"**, supprimez toute commande personnalisée (doit être vide)

### Étape 3: Forcer le redéploiement

1. Cliquez sur **"Manual Deploy"** → **"Deploy latest commit"**
2. Attendez que le build se termine
3. Vérifiez les logs pour confirmer qu'il utilise `FROM php:8.2-apache`

## Si le problème persiste

### Option A: Supprimer et recréer le service

1. **Notez les variables d'environnement** de votre service actuel
2. Supprimez le service actuel
3. Créez un nouveau service web :
   - **Name**: opencart
   - **Runtime**: Docker
   - **Repository**: https://github.com/ILYESS24/ECOM.git
   - **Branch**: main
   - **Root Directory**: (laisser vide)
   - **Dockerfile Path**: `Dockerfile` (exactement comme ça)
   - **Docker Context**: (laisser vide)
   - **Build Command**: (laisser vide)
   - **Start Command**: (laisser vide)
4. Ajoutez les variables d'environnement nécessaires

### Option B: Vérifier le Dockerfile dans GitHub

1. Allez sur https://github.com/ILYESS24/ECOM
2. Vérifiez que le fichier `Dockerfile` à la racine contient `FROM php:8.2-apache`
3. Si ce n'est pas le cas, le Dockerfile n'a pas été poussé correctement

## Vérification

Le Dockerfile correct doit commencer par :
```dockerfile
FROM php:8.2-apache
```

Et NON par :
```dockerfile
FROM node:22-slim
```

## Contact

Si le problème persiste après ces étapes, le service Render dans le dashboard est probablement mal configuré et doit être recréé.

