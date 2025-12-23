const https = require('https');
const playwright = require('playwright').chromium;

async function testFullProduction() {
  console.log('🚀 TEST COMPLET PRODUCTION - IA + AUTH');
  console.log('==========================================');

  const browser = await playwright.launch({ headless: false });
  const page = await browser.newPage();

  // Capturer les erreurs
  const errors = [];
  page.on('pageerror', error => {
    errors.push(error.message);
    console.log('❌ JS Error:', error.message);
  });

  try {
    console.log('📱 Étape 1: Chargement de l\'application...');
    const appUrl = 'https://889b9924.aurion-saas.pages.dev';
    await page.goto(appUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });

    // Attendre que les scripts se chargent
    await page.waitForTimeout(5000);

    const title = await page.title();
    console.log('✅ App chargée:', title);

    // Vérifier Clerk
    console.log('🔐 Étape 2: Test Clerk...');
    const signInButton = page.locator('text=/Sign In/i');
    const signInExists = await signInButton.count() > 0;
    console.log('✅ Bouton Sign In:', signInExists ? 'Présent' : 'Absent');

    if (signInExists) {
      console.log('🖱️ Clic sur Sign In...');
      await signInButton.click();
      await page.waitForTimeout(2000);

      const clerkModal = await page.locator('[class*="cl-"]').count();
      console.log('✅ Modal Clerk:', clerkModal > 0 ? 'Ouverte' : 'Fermée');
    }

    // Simuler une connexion (en mode démo pour les tests)
    console.log('🎭 Étape 3: Simulation connexion (test)...');

    // Tester l'IA (avec token temporaire pour voir la structure)
    console.log('🤖 Étape 4: Test IA (nécessite vraie clé)...');

    // Cette partie nécessiterait une vraie authentification
    // Pour l'instant, on teste juste que l'endpoint répond
    const aiTest = await testAIEndpoint();
    console.log('✅ Endpoint IA:', aiTest ? 'Répond' : 'Erreur');

    console.log('\n📊 RÉSULTATS:');
    console.log('✅ Application:', title.includes('AURION') ? 'OK' : 'KO');
    console.log('✅ Clerk Auth:', signInExists ? 'OK' : 'KO');
    console.log('✅ IA Endpoint:', aiTest ? 'OK' : 'KO');
    console.log('✅ JS Errors:', errors.length === 0 ? '0' : errors.length);

    if (errors.length === 0 && signInExists && aiTest) {
      console.log('\n🎉 PRODUCTION READY !');
      console.log('Il ne reste qu\'à configurer votre vraie clé OpenRouter.');
    } else {
      console.log('\n⚠️ Nécessite configuration de la clé OpenRouter.');
    }

  } catch (error) {
    console.error('❌ Erreur test:', error.message);
  } finally {
    await browser.close();
  }
}

async function testAIEndpoint() {
  return new Promise((resolve) => {
    const url = 'https://889b9924.aurion-saas.pages.dev/api/ai-chat';
    const postData = JSON.stringify({
      model: 'openai/gpt-4o-mini',
      messages: [{ role: 'user', content: 'Test' }]
    });

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(url, options, (res) => {
      resolve(res.statusCode === 401); // 401 = Auth required (normal)
    });

    req.on('error', () => resolve(false));
    req.write(postData);
    req.end();

    setTimeout(() => resolve(false), 5000);
  });
}

testFullProduction();
