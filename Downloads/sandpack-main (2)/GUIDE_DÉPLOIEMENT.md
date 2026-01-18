# 🚀 Guide de Déploiement - Cursor Clone

Bienvenue dans le guide complet pour déployer votre éditeur de code Cursor Clone !

## 📁 Fichiers créés

- `deploy.html` - Page web avec tous les liens de déploiement cliquables
- `deploy.js` - Script Node.js pour déploiement automatisé
- `deploy.bat` - Script Windows pour déploiement interactif
- `deploy.sh` - Script Linux/Mac pour déploiement interactif
- `README.md` - Documentation complète du projet
- `package.json` - Configuration npm avec scripts de déploiement
- `.gitignore` - Fichiers à ignorer dans git

## 🌐 Liens de déploiement direct

### Option la plus simple : Ouvrez `deploy.html`

Cette page contient tous les liens cliquables pour déployer instantanément :

1. **Netlify** (Recommandé) - https://app.netlify.com/start/deploy?repository=https://github.com/yourusername/cursor-clone
2. **Vercel** - https://vercel.com/new/clone?repository-url=https://github.com/yourusername/cursor-clone
3. **GitHub Pages** - Configuration automatique
4. **Render** - Plateforme cloud complète
5. **Surge** - Déploiement ultra-rapide

## 🖱️ Déploiement en 1 clic

### Depuis la page HTML
1. Double-cliquez sur `deploy.html`
2. Cliquez sur la plateforme de votre choix
3. Suivez les instructions à l'écran

### Depuis les boutons
- **Netlify** : Glissez-déposez `index.html` sur https://netlify.com
- **Surge** : `npm install -g surge && surge`
- **Vercel** : `npm install -g vercel && vercel`

## 💻 Scripts de déploiement automatisés

### Windows (deploy.bat)
```cmd
# Double-cliquez sur deploy.bat ou exécutez :
deploy.bat
```

### Linux/Mac (deploy.sh)
```bash
# Rendez-le exécutable puis lancez :
chmod +x deploy.sh
./deploy.sh
```

### Node.js (deploy.js)
```bash
# Installation des dépendances
npm install

# Déploiement direct
npm run deploy:netlify
npm run deploy:vercel
npm run deploy:surge
npm run deploy:github

# Ou déploiement interactif
npm run deploy
```

## 📋 Instructions détaillées par plateforme

### 🌐 Netlify (Recommandé)

**Méthode 1 - Glisser-déposer :**
1. Allez sur https://netlify.com
2. Glissez-déposez le fichier `index.html`
3. Votre site est en ligne !

**Méthode 2 - Repository :**
1. Poussez le code sur GitHub
2. Connectez votre repo à Netlify
3. Déploiement automatique

### ⚡ Vercel

**Via CLI :**
```bash
npm install -g vercel
vercel login
vercel
```

**Via interface web :**
1. https://vercel.com/new
2. Importez votre repository

### 🌊 Surge (Le plus rapide)

```bash
npm install -g surge
surge
# Choisissez un domaine ou laissez par défaut
```

### 📄 GitHub Pages (Gratuit)

```bash
# Initialiser git
git init
git add .
git commit -m "Initial commit"

# Créer un repo sur GitHub
# Puis :
git remote add origin https://github.com/yourusername/cursor-clone.git
git push -u origin main

# Activer Pages dans Settings > Pages
# URL : https://yourusername.github.io/cursor-clone
```

### 🛠️ Déploiement manuel

Pour tester localement :
```bash
# Python
python -m http.server 8000
# Allez sur http://localhost:8000

# Node.js
npm install -g http-server
http-server

# PHP
php -S localhost:8000
```

## 🔧 Configuration personnalisée

### Variables d'environnement
Si vous utilisez des APIs IA, configurez les clés dans l'application :
- OpenAI API Key
- Anthropic API Key
- Google AI API Key

### Domaine personnalisé
1. Déployez d'abord sur une plateforme
2. Achetez un domaine chez Namecheap/GoDaddy
3. Configurez les DNS vers votre hébergeur

### HTTPS automatique
Toutes les plateformes proposent HTTPS gratuit via Let's Encrypt.

## 🚀 Performance et optimisation

L'application a été optimisée pour :
- ⚡ Chargement rapide (< 2 secondes)
- 📱 Responsive design
- 🔒 Sécurité (HTTPS obligatoire)
- 🎯 Bon SEO

## 🐛 Dépannage

### Problème : "Command not found"
```bash
# Installez Node.js depuis https://nodejs.org
node --version
npm --version
```

### Problème : Erreur de déploiement
- Vérifiez votre connexion internet
- Vérifiez que les fichiers ne sont pas corrompus
- Essayez une autre plateforme

### Problème : L'application ne se charge pas
- Vérifiez que JavaScript est activé
- Désactivez les bloqueurs de publicités
- Essayez un autre navigateur

## 📞 Support

Si vous rencontrez des problèmes :
1. Vérifiez ce guide
2. Consultez les issues GitHub
3. Ouvrez une nouvelle issue avec les détails

## 🎉 Félicitations !

Votre Cursor Clone est maintenant déployé ! 🎊

**Liens utiles :**
- 🌐 Application : [Votre URL de déploiement]
- 📖 Documentation : README.md
- 🐛 Issues : https://github.com/yourusername/cursor-clone/issues
- ⭐ GitHub : https://github.com/yourusername/cursor-clone

---

*Généré automatiquement par le système de déploiement Cursor Clone*
