# 🚀 Cursor Clone - Ultimate Max Edition

Un éditeur de code AI-powered complet dans votre navigateur, inspiré de VS Code et Cursor.

## ✨ Fonctionnalités

- 🖥️ **Éditeur Monaco** - Le même éditeur que VS Code
- 🤖 **IA intégrée** - Support pour Claude, GPT-4, Gemini, et plus
- 💻 **Terminal intégré** - Commandes Linux complètes
- 📁 **Gestionnaire de fichiers** - Système de fichiers virtuel
- 🎨 **Thèmes** - Mode sombre/clair
- 🔍 **Recherche globale** - Recherche dans tous les fichiers
- 👁️ **Prévisualisation** - Aperçu HTML/CSS/JS en direct
- ⌨️ **Raccourcis** - Tous les raccourcis VS Code
- 📱 **Responsive** - Fonctionne sur mobile et desktop
- ⚡ **Optimisé** - Performance améliorée

## 🚀 Déploiement rapide

### Option 1: Netlify (Recommandé - 1 clic)
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/yourusername/cursor-clone)

### Option 2: Vercel
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/cursor-clone)

### Option 3: GitHub Pages
1. Poussez ce code sur GitHub
2. Allez dans Settings > Pages
3. Sélectionnez "main" branch et "/ (root)"
4. Votre site sera disponible à `https://yourusername.github.io/cursor-clone`

### Option 4: Déploiement manuel
Ouvrez simplement `index.html` dans votre navigateur !

## 🛠️ Installation locale

```bash
# Cloner le repository
git clone https://github.com/yourusername/cursor-clone.git
cd cursor-clone

# Ouvrir dans le navigateur
# Double-cliquez sur index.html ou utilisez un serveur local
python -m http.server 8000
# Puis allez sur http://localhost:8000
```

## 🎯 Utilisation

1. **Éditeur** : Cliquez sur un fichier pour l'ouvrir
2. **Terminal** : Ctrl/Cmd + ` pour ouvrir le terminal
3. **IA** : Ctrl/Cmd + L pour interagir avec l'IA
4. **Recherche** : Ctrl/Cmd + Shift + F pour rechercher
5. **Palette** : Ctrl/Cmd + Shift + P pour les commandes

## 🔧 Configuration IA

Pour utiliser les fonctionnalités IA, vous devez configurer une clé API :

1. Obtenez une clé API depuis :
   - [OpenAI](https://platform.openai.com/api-keys)
   - [Anthropic](https://console.anthropic.com/)
   - [Google AI](https://makersuite.google.com/app/apikey)

2. Dans l'application, allez dans les paramètres et entrez votre clé

## 📱 Fonctionnalités avancées

- **PWA** : Peut être installé comme application native
- **Offline** : Fonctionne sans connexion internet (sauf pour l'IA)
- **Import/Export** : Sauvegardez vos projets localement
- **Extensions** : Architecture extensible pour ajouter des fonctionnalités

## 🔒 Sécurité

- Toutes les données restent dans votre navigateur
- Les clés API sont stockées localement uniquement
- Aucun code n'est exécuté sur des serveurs externes (sauf les APIs IA)

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🙏 Remerciements

- [Monaco Editor](https://microsoft.github.io/monaco-editor/) - L'éditeur de code
- [XTerm.js](https://xtermjs.org/) - Le terminal
- [WebContainer](https://webcontainers.io/) - L'environnement d'exécution
- [VS Code](https://code.visualstudio.com/) - L'inspiration

---

**Note** : Cette application est un projet de démonstration. Pour un usage en production, considérez optimiser les dépendances externes et ajouter une gestion d'erreurs appropriée.

⭐ Si ce projet vous plaît, n'oubliez pas de mettre une étoile !
