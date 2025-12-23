 
import { test, expect } from '@playwright/test';

test.describe('SaaS Application - Full User Flow', () => {

  test.beforeEach(async ({ page }) => {
    // Aller à la page d'accueil
    await page.goto('/');
  });

  test('1. Landing page loads correctly', async ({ page }) => {
    // Vérifier que la page se charge
    await expect(page).toHaveTitle(/SaaSTEMPO/);

    // Vérifier les éléments principaux
    await expect(page.locator('text=Ready to Start?')).toBeVisible();
    await expect(page.locator('text=Let\'s create something amazing together')).toBeVisible();

    // Vérifier les boutons CTA
    await expect(page.locator('text=Commencer maintenant')).toBeVisible();
    await expect(page.locator('text=Voir les tarifs')).toBeVisible();
  });

  test('2. Navigation works correctly', async ({ page }) => {
    // Tester la navigation vers les différentes sections
    await page.locator('text=Fonctionnalités').click();
    await expect(page.locator('text=Outils IA avancés')).toBeVisible();

    await page.locator('text=Tarifs').click();
    await expect(page.locator('text=Plans disponibles')).toBeVisible();

    await page.locator('text=À propos').click();
    await expect(page.locator('text=Notre mission')).toBeVisible();
  });

  test('3. Authentication flow (simulated)', async ({ page }) => {
    // Simuler le clic sur "Commencer maintenant"
    await page.locator('text=Commencer maintenant').click();

    // Vérifier que nous sommes redirigés vers Clerk (ou page de connexion)
    await page.waitForURL('**/sign-in**');
    expect(page.url()).toContain('sign-in');
  });

  test('4. Dashboard loads for authenticated user', async ({ page }) => {
    // Simuler un utilisateur connecté (en développement)
    await page.addInitScript(() => {
      // Simuler un état d'authentification
      localStorage.setItem('clerk-user', JSON.stringify({ id: 'test-user-123' }));
    });

    await page.goto('/dashboard');

    // Vérifier que le dashboard se charge
    await expect(page.locator('text=Vue d\'ensemble')).toBeVisible();
    await expect(page.locator('text=Tableau de bord')).toBeVisible();

    // Vérifier les éléments du dashboard
    await expect(page.locator('text=Aujourd\'hui')).toBeVisible();
    await expect(page.locator('text=Consommation 7 jours')).toBeVisible();
  });

  test('5. Credits system works', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('clerk-user', JSON.stringify({ id: 'test-user-123' }));
    });

    await page.goto('/dashboard');

    // Vérifier l'affichage des crédits
    await expect(page.locator('text=crédits')).toBeVisible();

    // Vérifier les statistiques
    await expect(page.locator('text=requêtes')).toBeVisible();
  });

  test('6. Tool access control works', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('clerk-user', JSON.stringify({ id: 'test-user-123' }));
    });

    // Aller directement à un outil
    await page.goto('/tools/app-builder');

    // Vérifier que la page de contrôle d'accès se charge
    await expect(page.locator('text=AI App Builder')).toBeVisible();
    await expect(page.locator('text=crédits')).toBeVisible();

    // Vérifier les contrôles d'accès
    await expect(page.locator('text=Lancer AI App Builder')).toBeVisible();
  });

  test('7. Plan upgrade flow', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('clerk-user', JSON.stringify({ id: 'test-user-123' }));
    });

    await page.goto('/dashboard');

    // Cliquer sur upgrade plan
    const upgradeButton = page.locator('text=Upgrade').first();
    if (await upgradeButton.isVisible()) {
      await upgradeButton.click();

      // Vérifier que nous sommes redirigés vers les plans
      await page.waitForURL('**/dashboard**');
      await expect(page.locator('text=Plans disponibles')).toBeVisible();
    }
  });

  test('8. Responsive design works', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // Mobile

    // Vérifier que la page s'adapte
    await expect(page.locator('text=Ready to Start?')).toBeVisible();

    await page.setViewportSize({ width: 1024, height: 768 }); // Desktop

    // Vérifier que la page fonctionne en desktop
    await expect(page.locator('text=Ready to Start?')).toBeVisible();
  });

  test('9. Error handling works', async ({ page }) => {
    // Aller à une page qui n'existe pas
    await page.goto('/non-existent-page');

    // Vérifier que nous avons une gestion d'erreur appropriée
    await expect(page.locator('text=Page non trouvée')).toBeVisible();
  });

  test('10. Performance is acceptable', async ({ page }) => {
    // Mesurer le temps de chargement
    const startTime = Date.now();

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(5000); // Moins de 5 secondes

    // Vérifier que les images se chargent
    const images = page.locator('img');
    const imageCount = await images.count();

    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      await expect(img).toBeVisible();
    }
  });
});
