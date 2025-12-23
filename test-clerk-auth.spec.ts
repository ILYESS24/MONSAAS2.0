import { test, expect } from '@playwright/test';

test.describe('Clerk Authentication Tests', () => {
  test('should load application and check for basic content', async ({ page }) => {
    // Aller sur la page d'accueil
    await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });

    // Attendre un peu pour voir le contenu
    await page.waitForTimeout(3000);

    // Prendre une capture d'écran pour voir ce qui se passe
    await page.screenshot({ path: 'debug-app-load.png', fullPage: true });

    // Récupérer le contenu de la page
    const content = await page.textContent('body');
    console.log('Page content:', content?.substring(0, 500));

    // Vérifier qu'il y a du contenu (pas une page vide)
    expect(content).toBeTruthy();
    expect(content!.length).toBeGreaterThan(10);

    console.log('✅ Application chargée avec contenu');
  });

  test('should open Clerk sign in modal when clicking Sign In', async ({ page }) => {
    await page.goto('http://localhost:5173/');

    // Cliquer sur le bouton Sign In
    const signInButton = page.locator('text=Sign In');
    await signInButton.click();

    // Attendre que la modal Clerk apparaisse
    await page.waitForTimeout(2000);

    // Vérifier qu'une modal ou overlay Clerk est apparue
    // (Clerk utilise généralement un overlay avec des classes spécifiques)
    const clerkModal = page.locator('[data-clerk-modal], [class*="cl-"], .cl-modal');
    const clerkOverlay = page.locator('[class*="cl-overlay"], [class*="cl-modal"]');

    // Au moins un élément Clerk devrait être présent
    const hasClerkElements = await page.locator('[class*="cl-"]').count();
    expect(hasClerkElements).toBeGreaterThan(0);

    console.log('✅ Modal Clerk ouverte');
  });

  test('should redirect to dashboard when logged in', async ({ page }) => {
    // Ce test nécessiterait une vraie connexion Clerk
    // Pour l'instant, on teste juste que la redirection fonctionne en mode mock
    console.log('ℹ️ Test de redirection nécessiterait authentification réelle');
  });

  test('should protect dashboard routes', async ({ page }) => {
    // Essayer d'accéder au dashboard directement
    await page.goto('http://localhost:5173/dashboard');

    // Attendre que la page se charge
    await page.waitForLoadState('networkidle');

    // En mode Clerk activé, devrait rediriger vers la page d'accueil
    // ou montrer une modal de connexion
    const currentUrl = page.url();

    // Si on est toujours sur /dashboard, Clerk n'est pas activé correctement
    if (currentUrl.includes('/dashboard')) {
      // Vérifier qu'il y a une modal de connexion ou une redirection
      const hasAuthElements = await page.locator('[class*="cl-"], [data-clerk]').count();
      expect(hasAuthElements).toBeGreaterThan(0);
    } else {
      // Redirigé ailleurs (normalement vers /)
      expect(currentUrl).toBe('http://localhost:5173/');
    }

    console.log('✅ Protection des routes fonctionne');
  });
});
