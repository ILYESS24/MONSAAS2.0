# Configuration Clerk pour AURION SaaS

## 🚀 Configuration Requise pour l'Authentification

Pour activer l'authentification réelle dans AURION, vous devez configurer Clerk :

### 1. Créer un compte Clerk
- Allez sur https://dashboard.clerk.com/
- Créez un compte gratuit

### 2. Créer une application
- Cliquez sur "Add Application"
- Nommez-la "AURION SaaS"
- Choisissez "React" comme framework

### 3. Configurer les variables d'environnement
Créez un fichier `.env` à la racine du projet :

```bash
# Copiez le contenu suivant dans votre .env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_votre_clé_publique_clerk_ici
```

### 4. Obtenir votre clé publique
- Dans le dashboard Clerk : API Keys
- Copiez la "Publishable key"
- Collez-la dans votre `.env`

### 5. Configurer les URLs de redirection (optionnel)
```bash
VITE_CLERK_SIGN_IN_URL=/sign-in
VITE_CLERK_SIGN_UP_URL=/sign-up
VITE_CLERK_AFTER_SIGN_IN_URL=/dashboard
VITE_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

### 6. Personnaliser l'apparence (optionnel)
- Dans Clerk Dashboard : Customization
- Adaptez les couleurs et le style des modals

### 7. Déployer avec les variables d'environnement
Assurez-vous que `VITE_CLERK_PUBLISHABLE_KEY` est configurée dans votre environnement de déploiement (Cloudflare Pages, Vercel, etc.)

---

## ✅ Une fois configuré :
- Les boutons "Connexion" et "Commencer" ouvriront les vrais modals Clerk
- Les utilisateurs pourront s'inscrire/se connecter réellement
- Le dashboard sera accessible après authentification

## 🔧 Mode de secours :
Si Clerk n'est pas configuré, l'application affiche des messages d'alerte pour indiquer qu'il faut configurer l'authentification.