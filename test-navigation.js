// Script de test pour vérifier la navigation des outils
// À exécuter dans la console du navigateur sur la page de l'application

console.log('🧪 DÉBUT DU TEST DE NAVIGATION');

const TOOL_URLS = {
  'app-builder': 'https://aurion-app-v2.pages.dev/',
  'website-builder': 'https://790d4da4.ai-assistant-xlv.pages.dev',
  'ai-agents': 'https://flo-1-2ba8.onrender.com',
  'text-editor': 'https://aieditor-do0wmlcpa-ibagencys-projects.vercel.app',
  'code-editor': 'https://790d4da4.ai-assistant-xlv.pages.dev',
  'content-generator': 'https://790d4da4.ai-assistant-xlv.pages.dev',
};

// Fonction de test identique à handleToolNavigate
function testToolNavigate(toolId) {
    console.log(`🧪 TEST: Clic simulé sur outil ${toolId}`);

    const toolUrl = TOOL_URLS[toolId];
    if (toolUrl) {
        console.log(`✅ URL trouvée: ${toolUrl}`);
        console.log(`🔄 DEVRAIT rediriger vers: ${toolUrl}`);
        console.log(`📍 window.location.href sera défini à: ${toolUrl}`);

        // Simuler la redirection (sans l'exécuter réellement)
        console.log(`⚠️ REDIRECTION ANNULÉE POUR LE TEST`);
        console.log(`💡 Pour tester réellement, exécutez: window.location.href = '${toolUrl}'`);

        return {
            success: true,
            toolId,
            toolUrl,
            action: 'redirect_simulated'
        };

    } else {
        console.error(`❌ URL non trouvée pour outil: ${toolId}`);
        return {
            success: false,
            toolId,
            error: 'URL not found'
        };
    }
}

// Tester tous les outils
console.log('📋 TEST DE TOUS LES OUTILS:');
Object.keys(TOOL_URLS).forEach(toolId => {
    const result = testToolNavigate(toolId);
    console.log(`Résultat pour ${toolId}:`, result);
});

// Fonction pour tester la vraie redirection
window.testRealRedirect = function(toolId) {
    const toolUrl = TOOL_URLS[toolId];
    if (toolUrl) {
        console.log(`🚀 REDIRECTION RÉELLE VERS: ${toolUrl}`);
        if (confirm(`Aller vers ${toolUrl} ?`)) {
            window.location.href = toolUrl;
        }
    } else {
        alert(`URL non trouvée pour ${toolId}`);
    }
};

console.log('✅ FONCTIONS DE TEST DISPONIBLES:');
console.log('- testToolNavigate(toolId): Test simulé');
console.log('- testRealRedirect(toolId): Redirection réelle');
console.log('- TOOL_URLS: Liste des URLs');

console.log('🎯 EXEMPLE D\'UTILISATION:');
console.log('testToolNavigate("app-builder")');
console.log('testRealRedirect("website-builder")');

console.log('🔍 FIN DU TEST DE NAVIGATION');
