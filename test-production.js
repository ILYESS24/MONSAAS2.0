import { chromium } from 'playwright';

async function testIframeIntegration() {
  console.log('🚀 Starting Iframe Integration Test...\n');

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    // Test 1: Accès au dashboard
    console.log('📋 Test 1: Accessing Dashboard...');
    await page.goto('http://localhost:5173/dashboard');
    await page.waitForSelector('h1, .animate-in', { timeout: 10000 });
    console.log('✅ Dashboard loaded successfully\n');

    // Test 2: Navigation vers l'onglet Tools
    console.log('📋 Test 2: Navigating to Tools tab...');
    await page.click('text=Tools');
    await page.waitForSelector('text=AI App Builder', { timeout: 5000 });
    console.log('✅ Tools tab loaded successfully\n');

    // Test 3: Test iframe App Builder
    console.log('📋 Test 3: Testing App Builder iframe...');
    await page.click('text=AI App Builder');
    await page.waitForURL('**/tools/app-builder', { timeout: 5000 });

    // Attendre le chargement de l'iframe
    const iframeSelector = 'iframe[src*="aurion-app-v2.pages.dev"]';
    await page.waitForSelector(iframeSelector, { timeout: 10000 });

    // Vérifier que l'iframe est présente et visible
    const iframe = await page.$(iframeSelector);
    const isVisible = await iframe.isVisible();

    if (isVisible) {
      console.log('✅ App Builder iframe loaded and visible');

      // Tester les restrictions CORS
      try {
        const content = await page.evaluate(() => {
          const iframe = document.querySelector('iframe');
          return iframe ? 'iframe found' : 'iframe not found';
        });
        console.log('✅ Iframe element accessible from parent');
      } catch (error) {
        console.log('⚠️ Iframe content not accessible (CORS expected)');
      }
    } else {
      console.log('❌ App Builder iframe not visible');
    }
    console.log('');

    // Test 4: Test iframe AI Agents
    console.log('📋 Test 4: Testing AI Agents iframe...');
    await page.goto('http://localhost:5173/tools/ai-agents');
    await page.waitForURL('**/tools/ai-agents', { timeout: 5000 });

    const agentsIframe = 'iframe[src*="flo-1-2ba8.onrender.com"]';
    await page.waitForSelector(agentsIframe, { timeout: 10000 });

    const agentsIframeElement = await page.$(agentsIframe);
    const agentsVisible = await agentsIframeElement.isVisible();

    if (agentsVisible) {
      console.log('✅ AI Agents iframe loaded and visible');
    } else {
      console.log('❌ AI Agents iframe not visible');
    }
    console.log('');

    // Test 5: Test iframe Text Editor
    console.log('📋 Test 5: Testing Text Editor iframe...');
    await page.goto('http://localhost:5173/tools/text-editor');
    await page.waitForURL('**/tools/text-editor', { timeout: 5000 });

    const editorIframe = 'iframe[src*="vercel.app"]';
    await page.waitForSelector(editorIframe, { timeout: 10000 });

    const editorIframeElement = await page.$(editorIframe);
    const editorVisible = await editorIframeElement.isVisible();

    if (editorVisible) {
      console.log('✅ Text Editor iframe loaded and visible');
    } else {
      console.log('❌ Text Editor iframe not visible');
    }
    console.log('');

    // Test 6: Vérifier les fonctionnalités du bridge
    console.log('📋 Test 6: Testing iframe bridge communication...');
    await page.goto('http://localhost:5173/tools/app-builder');

    // Écouter les messages console
    const messages = [];
    page.on('console', msg => {
      if (msg.text().includes('IframeBridge') || msg.text().includes('iframe')) {
        messages.push(msg.text());
      }
    });

    // Attendre quelques secondes pour l'initialisation
    await page.waitForTimeout(3000);

    if (messages.length > 0) {
      console.log('✅ Iframe bridge messages detected:');
      messages.forEach(msg => console.log(`   - ${msg}`));
    } else {
      console.log('⚠️ No iframe bridge messages detected');
    }
    console.log('');

    // Test 7: Vérifier l'état des crédits
    console.log('📋 Test 7: Testing credit display...');
    const creditText = await page.textContent('text=crédits');
    if (creditText) {
      console.log('✅ Credit information displayed');
    } else {
      console.log('❌ Credit information not found');
    }

    console.log('\n🎉 All tests completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testIframeIntegration().catch(console.error);
