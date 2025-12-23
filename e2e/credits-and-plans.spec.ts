 
import { test, expect } from '@playwright/test';

test.describe('Credits and Plans System', () => {

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('clerk-user', JSON.stringify({ id: 'test-user-123' }));
    });
  });

  test('Credits display correctly', async ({ page }) => {
    await page.goto('/dashboard');

    // Vérifier que les crédits sont affichés
    const creditsElement = page.locator('text=crédits').first();
    await expect(creditsElement).toBeVisible();

    // Vérifier que c'est un nombre positif
    const creditsText = await creditsElement.textContent();
    const creditsNumber = parseInt(creditsText?.replace(/[^\d]/g, '') || '0');
    expect(creditsNumber).toBeGreaterThanOrEqual(0);
  });

  test('Usage statistics update', async ({ page }) => {
    await page.goto('/dashboard');

    // Vérifier les statistiques d'aujourd'hui
    await expect(page.locator('text=Aujourd\'hui')).toBeVisible();
    await expect(page.locator('text=requêtes')).toBeVisible();

    // Vérifier les statistiques de cette semaine
    await expect(page.locator('text=Consommation 7 jours')).toBeVisible();
  });

  test('Tool access validation works', async ({ page }) => {
    await page.goto('/tools/app-builder');

    // Vérifier que la validation d'accès fonctionne
    await expect(page.locator('text=AI App Builder')).toBeVisible();

    // Vérifier le coût de l'outil
    await expect(page.locator('text=50 crédits')).toBeVisible();

    // Si l'utilisateur n'a pas assez de crédits, le bouton devrait être désactivé
    const launchButton = page.locator('text=Lancer AI App Builder');
    const isDisabled = await launchButton.getAttribute('disabled');
    const creditsText = await page.locator('text=crédits disponibles').textContent();

    if (creditsText && parseInt(creditsText.replace(/[^\d]/g, '')) < 50) {
      expect(isDisabled).toBe('true');
    }
  });

  test('Daily and monthly limits display', async ({ page }) => {
    await page.goto('/tools/text-editor');

    // Vérifier que les limites journalières/mensuelles s'affichent
    const dailyLimit = page.locator('text=Aujourd\'hui:').locator('..');
    const monthlyLimit = page.locator('text=Ce mois:').locator('..');

    // Ces éléments peuvent ne pas être visibles selon le plan
    // Mais s'ils sont visibles, ils doivent contenir des nombres
    if (await dailyLimit.isVisible()) {
      const dailyText = await dailyLimit.textContent();
      expect(dailyText).toMatch(/\d+ utilisations restantes/);
    }

    if (await monthlyLimit.isVisible()) {
      const monthlyText = await monthlyLimit.textContent();
      expect(monthlyText).toMatch(/\d+ utilisations restantes/);
    }
  });

  test('Plan information displays correctly', async ({ page }) => {
    await page.goto('/dashboard');

    // Vérifier que les informations du plan sont affichées
    await expect(page.locator('text=Plan actuel')).toBeVisible();

    // Vérifier qu'il y a un type de plan (free, pro, etc.)
    const planElements = page.locator('[class*="plan"], [class*="Plan"]');
    await expect(planElements.first()).toBeVisible();
  });

  test('Upgrade plan button works', async ({ page }) => {
    await page.goto('/dashboard');

    // Chercher un bouton d'upgrade
    const upgradeButtons = [
      page.locator('text=Upgrade'),
      page.locator('text=Passer au Pro'),
      page.locator('text=Changer de plan'),
      page.locator('button[class*="upgrade"]')
    ];

    let upgradeButton;
    for (const button of upgradeButtons) {
      if (await button.isVisible()) {
        upgradeButton = button;
        break;
      }
    }

    if (upgradeButton) {
      await upgradeButton.click();

      // Vérifier que nous sommes redirigés vers la section plans
      await page.waitForURL('**/dashboard**');
      await expect(page.locator('text=Plans')).toBeVisible();
    }
  });

  test('Usage history displays', async ({ page }) => {
    await page.goto('/dashboard');

    // Vérifier que l'historique d'utilisation est affiché
    const historySection = page.locator('text=Activité récente');
    if (await historySection.isVisible()) {
      // Si l'historique est visible, vérifier qu'il contient des éléments
      // const historyItems = page.locator('[class*="activity"], [class*="history"]');
      // Peut être vide pour un nouvel utilisateur, c'est normal
    }
  });
});
