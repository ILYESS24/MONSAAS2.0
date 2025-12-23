const puppeteer = require('playwright').chromium;

async function testDeployedApp() {
  console.log('🚀 Testing deployed app with Playwright...');

  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  // Capturer les erreurs
  const errors = [];
  page.on('pageerror', error => {
    errors.push(error.message);
    console.log('❌ JS Error:', error.message);
  });

  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('⚠️ Console Error:', msg.text());
    }
  });

  try {
    console.log('📄 Loading page...');
    const response = await page.goto('https://08a5b438.aurion-saas.pages.dev/', { waitUntil: 'domcontentloaded', timeout: 10000 });
    console.log('📄 Response status:', response?.status());

    console.log('📸 Taking screenshot...');
    await page.screenshot({ path: 'deployed-app-test.png', fullPage: true });

    // Vérifier le contenu
    const title = await page.title();
    console.log('📋 Page title:', title);

    const bodyText = await page.evaluate(() => document.body.innerText);
    console.log('📝 Body text length:', bodyText.length);
    console.log('📝 Body preview:', bodyText.substring(0, 300));

    // Vérifier #root
    const rootContent = await page.$eval('#root', el => el.innerText);
    console.log('🏠 Root content length:', rootContent.length);

    // Chercher des éléments Clerk
    const clerkElements = await page.$$('[class*="cl-"], [data-clerk]');
    console.log('🔐 Clerk elements found:', clerkElements.length);

    // Chercher bouton Sign In
    const signInButtons = await page.$$('text=/Sign In|Connexion|Login/i');
    console.log('🔑 Sign In buttons found:', signInButtons.length);

    // Vérifier les erreurs
    if (errors.length > 0) {
      console.log('❌ JavaScript errors detected:', errors.length);
      errors.forEach((error, i) => console.log(`   ${i+1}. ${error}`));
    } else {
      console.log('✅ No JavaScript errors');
    }

    // Test du bouton Sign In
    if (signInButtons.length > 0) {
      console.log('🖱️ Clicking Sign In button...');
      await page.click('text=/Sign In|Connexion/i');

      await page.waitForTimeout(3000);

      const modalElements = await page.$$('[class*="cl-modal"], [class*="cl-overlay"]');
      console.log('📋 Modal elements after click:', modalElements.length);

      if (modalElements.length > 0) {
        console.log('✅ Clerk modal opened successfully');
      } else {
        console.log('❌ No Clerk modal found after clicking Sign In');
      }
    }

    console.log('\n📊 TEST RESULTS:');
    console.log('✅ Page loads:', title.includes('AURION') ? 'YES' : 'NO');
    console.log('✅ Has content:', bodyText.length > 50 ? 'YES' : 'NO');
    console.log('✅ React mounted:', rootContent.length > 0 ? 'YES' : 'NO');
    console.log('✅ Clerk loaded:', clerkElements.length > 0 ? 'YES' : 'NO');
    console.log('✅ Sign In available:', signInButtons.length > 0 ? 'YES' : 'NO');
    console.log('✅ No JS errors:', errors.length === 0 ? 'YES' : 'NO');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testDeployedApp();
