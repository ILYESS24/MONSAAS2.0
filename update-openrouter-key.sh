#!/bin/bash

echo "🔑 MISE À JOUR DE LA CLÉ OPENROUTER"
echo ""
echo "Entrez votre clé API OpenRouter valide :"
read -s OPENROUTER_KEY

echo ""
echo "Configuration de la clé dans Cloudflare..."

echo "$OPENROUTER_KEY" | npx wrangler secret put OPENROUTER_API_KEY

echo ""
echo "✅ Clé OpenRouter configurée !"
echo ""
echo "Redéploiement en cours..."

npx wrangler pages deploy dist --project-name=aurion-saas --commit-dirty=true

echo ""
echo "🎉 Déploiement terminé !"
echo "Vous pouvez maintenant tester l'IA avec votre vraie clé."
