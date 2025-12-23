 
import { test, expect } from '@playwright/test';

test.describe('Smoke Tests - Critical Functionality', () => {

  test('Application starts successfully', async ({ page }) => {
    await page.goto('/');

    // Vérifier que l'application se charge sans erreur 500
    await expect(page.locator('body')).not.toContainText('500');
    await expect(page.locator('body')).not.toContainText('Internal Server Error');

    // Vérifier que les éléments principaux sont présents
    await expect(page.locator('text=SaaSTEMPO')).toBeVisible();
  });

  test('All main routes are accessible', async ({ page }) => {
    const routes = [
      '/',
      '/dashboard',
      '/tools/app-builder',
      '/creation/image',
      '/creation/video',
    ];

    for (const route of routes) {
      await page.goto(route);

      // Vérifier qu'il n'y a pas d'erreur 404 explicite (certains redirigent)
      const hasError = await page.locator('text=404').isVisible().catch(() => false);
      expect(hasError).toBe(false);
    }
  });

  test('No console errors on main pages', async ({ context }) => {
    const pages = ['/', '/dashboard'];

    for (const pageUrl of pages) {
      const newPage = await context.newPage();
      const errors: string[] = [];

      newPage.on('console', (msg) => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });

      // Utiliser la variable pour éviter l'erreur de linting
      expect(newPage).toBeDefined();

      await newPage.goto(pageUrl);
      await newPage.waitForLoadState('networkidle');

      // Filtrer les erreurs non critiques (liées aux ressources externes)
      const criticalErrors = errors.filter(error =>
        !error.includes('favicon') &&
        !error.includes('google') &&
        !error.includes('analytics') &&
        !error.includes('clerk')
      );

      expect(criticalErrors).toHaveLength(0);

      await newPage.close();
    }
  });

  test('Responsive breakpoints work', async ({ page }) => {
    const breakpoints = [
      { width: 320, height: 568, name: 'Mobile S' },
      { width: 375, height: 667, name: 'Mobile M' },
      { width: 768, height: 1024, name: 'Tablet' },
      { width: 1024, height: 768, name: 'Desktop' },
      { width: 1440, height: 900, name: 'Desktop L' },
    ];

    for (const breakpoint of breakpoints) {
      await page.setViewportSize({ width: breakpoint.width, height: breakpoint.height });

      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');

      // Vérifier que la page s'affiche sans débordement horizontal
      const bodyWidth = await page.locator('body').evaluate(el => el.scrollWidth);
      expect(bodyWidth).toBeLessThanOrEqual(breakpoint.width + 50); // Tolérance de 50px
    }
  });

  test('Forms are accessible', async ({ page }) => {
    await page.goto('/');

    // Chercher tous les formulaires et inputs
    const inputs = page.locator('input, textarea, select');
    const inputCount = await inputs.count();

    // Vérifier que les inputs sont accessibles
    for (let i = 0; i < Math.min(inputCount, 5); i++) { // Tester max 5 inputs
      const input = inputs.nth(i);
      await expect(input).toBeVisible();

      // Vérifier les attributs d'accessibilité de base
      const hasLabel = await input.evaluate(el => {
        const id = el.id;
        const label = id ? document.querySelector(`label[for="${id}"]`) : null;
        const ariaLabel = el.getAttribute('aria-label');
        const ariaLabelledBy = el.getAttribute('aria-labelledby');
        return !!(label || ariaLabel || ariaLabelledBy || el.placeholder);
      });

      expect(hasLabel).toBe(true);
    }
  });

  test('Loading states work correctly', async ({ page }) => {
    await page.goto('/dashboard');

    // Attendre que les données se chargent
    await page.waitForTimeout(2000);

    // Vérifier qu'il n'y a pas de loaders indéfinis
    const loaders = page.locator('[class*="loading"], [class*="spinner"], [class*="Loader"]');
    const loaderCount = await loaders.count();

    if (loaderCount > 0) {
      // Si des loaders sont présents, ils ne devraient pas être là indéfiniment
      await page.waitForTimeout(5000);
      const stillLoading = await loaders.first().isVisible().catch(() => false);
      expect(stillLoading).toBe(false);
    }
  });

  test('Error boundaries work', async ({ page }) => {
    // Simuler une erreur JavaScript
    await page.addInitScript(() => {
      // Créer une erreur globale pour tester les error boundaries
      setTimeout(() => {
        throw new Error('Test error for error boundary');
      }, 1000);
    });

    await page.goto('/');
    await page.waitForTimeout(2000);

    // Vérifier que l'application ne crash pas complètement
    const errorBoundary = page.locator('text=Une erreur s\'est produite').first();
    const isAppStillVisible = await page.locator('text=SaaSTEMPO').isVisible();

    // Soit l'error boundary se déclenche, soit l'app continue de fonctionner
    expect(await errorBoundary.isVisible() || isAppStillVisible).toBe(true);
  });
});
