import { chromium } from 'playwright';

async function simpleIframeTest() {
  console.log('🚀 Simple Iframe Integration Test\n');

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    // Test direct de la route iframe app-builder
    console.log('📋 Test: Direct iframe route access...');
    await page.goto('http://localhost:5173/tools/app-builder');

    // Attendre que la page se charge
    await page.waitForLoadState('networkidle');

    // Vérifier le titre
    const title = await page.title();
    console.log(`📄 Page title: ${title}`);

    // Vérifier si l'iframe existe
    const iframeCount = await page.locator('iframe').count();
    console.log(`📺 Number of iframes: ${iframeCount}`);

    if (iframeCount > 0) {
      // Obtenir les attributs de l'iframe
      const iframeSrc = await page.locator('iframe').getAttribute('src');
      console.log(`🔗 Iframe source: ${iframeSrc}`);

      // Vérifier si c'est l'URL attendue
      if (iframeSrc && iframeSrc.includes('aurion-app-v2.pages.dev')) {
        console.log('✅ Correct iframe URL loaded');
      } else {
        console.log('❌ Wrong iframe URL');
      }

      // Tester la visibilité
      const isVisible = await page.locator('iframe').isVisible();
      console.log(`👁️ Iframe visible: ${isVisible ? 'Yes' : 'No'}`);

    } else {
      console.log('❌ No iframe found on page');
    }

    // Vérifier les messages d'erreur ou d'avertissement
    const errorMessages = await page.locator('.border-red-200, .border-yellow-200').count();
    if (errorMessages > 0) {
      console.log('⚠️ Error/warning messages detected');
      const errorText = await page.locator('.border-red-200, .border-yellow-200').textContent();
      console.log(`   Message: ${errorText?.substring(0, 100)}...`);
    }

    // Vérifier l'affichage des crédits
    const creditText = await page.locator('text=crédits').textContent();
    if (creditText) {
      console.log('💰 Credit information displayed');
    } else {
      console.log('❌ No credit information found');
    }

    console.log('\n🎉 Test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

simpleIframeTest().catch(console.error);
