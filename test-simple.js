// TEST SIMPLE - Vérifier que TOOL_URLS fonctionne
console.log('🧪 TEST SIMPLE TOOL_URLS');

// Simuler l'import exact
const TOOL_URLS = {
  'app-builder': 'https://aurion-app-v2.pages.dev/',
  'website-builder': 'https://790d4da4.ai-assistant-xlv.pages.dev',
  'ai-agents': 'https://flo-1-2ba8.onrender.com',
  'text-editor': 'https://aieditor-do0wmlcpa-ibagencys-projects.vercel.app',
  'code-editor': 'https://790d4da4.ai-assistant-xlv.pages.dev',
  'content-generator': 'https://790d4da4.ai-assistant-xlv.pages.dev',
};

// Simuler handleToolNavigate exact
function handleToolNavigate(toolId) {
    const toolUrl = TOOL_URLS[toolId];
    if (toolUrl) {
      console.log(`✅ REDIRECTING to: ${toolUrl}`);
      // Au lieu de window.location.href, on log juste
      console.log(`🔄 window.location.href = '${toolUrl}'`);
      return { success: true, url: toolUrl };
    } else {
      console.error(`❌ URL not found for tool: ${toolId}`);
      return { success: false, error: 'URL not found' };
    }
}

// Tester tous les boutons
console.log('🧪 TESTING ALL BUTTONS:');
console.log('website-builder:', handleToolNavigate('website-builder'));
console.log('app-builder:', handleToolNavigate('app-builder'));
console.log('content-generator:', handleToolNavigate('content-generator'));
console.log('ai-agents:', handleToolNavigate('ai-agents'));

console.log('✅ TEST FINISHED');


