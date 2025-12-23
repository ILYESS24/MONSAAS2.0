import { test, expect } from '@playwright/test';

test.describe('Clerk Authentication - Deployed App', () => {
  test('should load app and check for Clerk elements', async ({ page }) => {
    // Aller sur l'app déployée
    await page.goto('https://e81ed753.aurion-saas.pages.dev/', { waitUntil: 'domcontentloaded' });

    // Attendre que la page se charge
    await page.waitForTimeout(5000);

    // Capturer les erreurs console
    const errors: string[] = [];
    page.on('pageerror', error => {
      errors.push(error.message);
      console.log('JS Error:', error.message);
    });

    // Capturer les logs console
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('Console Error:', msg.text());
      }
    });

    // Prendre une capture d'écran
    await page.screenshot({ path: 'deployed-app-screenshot.png', fullPage: true });

    // Vérifier le contenu de la page
    const bodyText = await page.textContent('body');
    console.log('Page body text length:', bodyText?.length || 0);
    console.log('Page body preview:', bodyText?.substring(0, 200) || 'Empty');

    // Vérifier s'il y a du contenu dans #root
    const rootContent = await page.textContent('#root');
    console.log('Root content length:', rootContent?.length || 0);

    // Vérifier la présence d'éléments Clerk
    const clerkElements = await page.locator('[class*="cl-"], [data-clerk]').count();
    console.log('Clerk elements found:', clerkElements);

    // Vérifier la présence du bouton Sign In
    const signInButton = page.locator('text=/Sign In|Connexion|Login/i');
    const signInExists = await signInButton.count() > 0;
    console.log('Sign In button found:', signInExists);

    // Afficher les erreurs capturées
    if (errors.length > 0) {
      console.log('JavaScript errors:');
      errors.forEach(error => console.log('  -', error));
    }

    // Tests
    expect(errors.length).toBe(0); // Pas d'erreurs JS critiques
    expect(rootContent && rootContent.length > 0).toBe(true); // Le root doit avoir du contenu
    expect(signInExists).toBe(true); // Doit y avoir un bouton de connexion
  });

  test('should have Clerk modal when clicking Sign In', async ({ page }) => {
    await page.goto('https://e81ed753.aurion-saas.pages.dev/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    // Cliquer sur Sign In
    const signInButton = page.locator('text=/Sign In|Connexion/i').first();
    if (await signInButton.count() > 0) {
      await signInButton.click();

      // Attendre que la modal apparaisse
      await page.waitForTimeout(2000);

      // Vérifier la présence d'éléments Clerk
      const clerkModal = await page.locator('[class*="cl-modal"], [class*="cl-overlay"]').count();
      console.log('Clerk modal elements:', clerkModal);

      expect(clerkModal).toBeGreaterThan(0);
    } else {
      console.log('Sign In button not found, skipping modal test');
    }
  });
});
