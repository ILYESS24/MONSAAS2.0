# Configuration Clerk pour l'authentification

## Étape 1 : Créer un compte Clerk
1. Allez sur [https://clerk.com](https://clerk.com)
2. Créez un compte gratuit
3. Créez une nouvelle application

## Étape 2 : Obtenir votre clé publique
1. Dans votre dashboard Clerk, allez dans "API Keys"
2. Copiez la **Publishable key** (commence par `pk_test_` ou `pk_live_`)

## Étape 3 : Configurer la variable d'environnement
Créez un fichier `.env.local` à la racine du projet :

```bash
VITE_CLERK_PUBLISHABLE_KEY=pk_test_votre_clé_ici
```

## Étape 4 : Redémarrer le serveur
Après avoir ajouté la variable d'environnement, redémarrez le serveur de développement :

```bash
npm run dev
```

## Résultat
Maintenant, quand vous cliquez sur le bouton "Get Started", il ouvrira l'interface d'authentification Clerk où les utilisateurs peuvent :
- Se connecter avec leur email/mot de passe
- S'inscrire
- Se connecter avec Google, GitHub, etc. (si configuré)

## Configuration supplémentaire (optionnel)
Vous pouvez personnaliser l'apparence de l'interface Clerk dans votre dashboard Clerk sous "Customization".
