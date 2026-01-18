# Guide de déploiement OpenCart sur Render

## Base de données créée

La base de données PostgreSQL a été créée avec succès :
- **Nom**: opencart-db
- **ID**: dpg-d4vuga3e5dus73anb62g-a
- **Database**: opencart_db
- **User**: opencart_db_user
- **Status**: En cours de création

## Étapes pour déployer le service web

### Option 1: Via le Dashboard Render (Recommandé)

1. Allez sur https://dashboard.render.com
2. Cliquez sur "New +" puis "Web Service"
3. Connectez votre repository GitHub: `https://github.com/ILYESS24/ECOM.git`
4. Configurez le service :
   - **Name**: opencart
   - **Runtime**: Docker
   - **Region**: Oregon (ou celle de votre choix)
   - **Branch**: main
   - **Root Directory**: (laisser vide)
   - **Dockerfile Path**: `Dockerfile.render`
   - **Build Command**: (laisser vide, Render utilisera le Dockerfile)
   - **Start Command**: (laisser vide, défini dans le Dockerfile)

5. **Variables d'environnement** à ajouter :
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

6. **Lier la base de données** :
   - Dans la section "Environment", cliquez sur "Add Database"
   - Sélectionnez "opencart-db"
   - Render ajoutera automatiquement les variables d'environnement de connexion

7. Cliquez sur "Create Web Service"

### Option 2: Via render.yaml (Blueprint)

Le fichier `render.yaml` est déjà configuré. Vous pouvez :
1. Allez sur https://dashboard.render.com
2. Cliquez sur "New +" puis "Blueprint"
3. Connectez votre repository et sélectionnez le fichier `render.yaml`
4. Render créera automatiquement tous les services

## Configuration de la base de données

Une fois la base de données créée, vous devrez :
1. Obtenir le mot de passe depuis le dashboard Render
2. Configurer les variables d'environnement dans le service web
3. Exécuter l'installateur OpenCart via l'interface web

## Notes importantes

- **Plan requis**: Render nécessite un plan payant (Starter minimum) pour les services web Docker
- **Port**: Le Dockerfile est configuré pour utiliser le port 8080 (Render utilise la variable $PORT)
- **Permissions**: Les permissions des dossiers sont configurées dans le Dockerfile
- **Installation**: Après le déploiement, visitez votre URL pour lancer l'installateur OpenCart

## Support

Pour plus d'informations, consultez:
- [Documentation Render](https://render.com/docs)
- [Documentation OpenCart](https://docs.opencart.com/)

