 
import { test, expect } from '@playwright/test';

test.describe('Iframe Integration Tests', () => {

  test.beforeEach(async ({ page }) => {
    // Aller sur la page de développement
    await page.goto('http://localhost:5173');

    // Simuler l'authentification (mode démo)
    await page.context().addCookies([{
      name: 'demo-mode',
      value: 'true',
      url: 'http://localhost:5173'
    }]);
  });

  test('should load app builder iframe', async ({ page }) => {
    // Aller sur l'outil app-builder
    await page.goto('http://localhost:5173/tools/app-builder');

    // Vérifier que la page se charge
    await expect(page.locator('h1')).toContainText('AI App Builder');

    // Vérifier que l'iframe existe
    const iframe = page.locator('iframe');
    await expect(iframe).toBeVisible();

    // Vérifier que l'iframe charge l'URL correcte
    await expect(iframe).toHaveAttribute('src', 'https://aurion-app-v2.pages.dev');

    // Attendre que l'iframe se charge (ou timeout avec message d'erreur)
    try {
      await page.waitForFunction(() => {
        const iframeEl = document.querySelector('iframe');
        return iframeEl && iframeEl.contentDocument && iframeEl.contentDocument.readyState === 'complete';
      }, { timeout: 10000 });
      console.log('✅ App Builder iframe loaded successfully');
    } catch {
      console.log('⚠️ App Builder iframe has CORS restrictions (expected)');
      // Vérifier qu'un message d'avertissement s'affiche
      await expect(page.locator('.border-yellow-200')).toBeVisible();
    }
  });

  test('should load ai agents iframe', async ({ page }) => {
    await page.goto('http://localhost:5173/tools/ai-agents');

    await expect(page.locator('h1')).toContainText('AI Agents Builder');

    const iframe = page.locator('iframe');
    await expect(iframe).toBeVisible();
    await expect(iframe).toHaveAttribute('src', 'https://flo-1-2ba8.onrender.com');

    try {
      await page.waitForFunction(() => {
        const iframeEl = document.querySelector('iframe');
        return iframeEl && iframeEl.contentDocument && iframeEl.contentDocument.readyState === 'complete';
      }, { timeout: 10000 });
      console.log('✅ AI Agents iframe loaded successfully');
    } catch {
      console.log('⚠️ AI Agents iframe has CORS restrictions (expected)');
      await expect(page.locator('.border-yellow-200')).toBeVisible();
    }
  });

  test('should load text editor iframe', async ({ page }) => {
    await page.goto('http://localhost:5173/tools/text-editor');

    await expect(page.locator('h1')).toContainText('AI Rich Text Editor');

    const iframe = page.locator('iframe');
    await expect(iframe).toBeVisible();
    await expect(iframe).toHaveAttribute('src', 'https://aieditor-do0wmlcpa-ibagencys-projects.vercel.app');

    try {
      await page.waitForFunction(() => {
        const iframeEl = document.querySelector('iframe');
        return iframeEl && iframeEl.contentDocument && iframeEl.contentDocument.readyState === 'complete';
      }, { timeout: 10000 });
      console.log('✅ Text Editor iframe loaded successfully');
    } catch {
      console.log('⚠️ Text Editor iframe has CORS restrictions (expected)');
      await expect(page.locator('.border-yellow-200')).toBeVisible();
    }
  });

  test('should show credit requirements', async ({ page }) => {
    await page.goto('http://localhost:5173/tools/app-builder');

    // Vérifier l'affichage des coûts
    await expect(page.locator('text=50 crédits')).toBeVisible();
    await expect(page.locator('text=Crédits disponibles:')).toBeVisible();
  });

  test('should handle blocked tools', async ({ page }) => {
    // Simuler des crédits insuffisants
    await page.context().addCookies([{
      name: 'test-low-credits',
      value: 'true',
      url: 'http://localhost:5173'
    }]);

    await page.goto('http://localhost:5173/tools/app-builder');

    // Devrait afficher un message d'erreur ou rediriger
    const errorMessage = page.locator('text=Crédits insuffisants');
    const blockedMessage = page.locator('text=cet outil a été bloqué');

    await expect(errorMessage.or(blockedMessage)).toBeVisible();
  });

  test('should integrate with dashboard tools grid', async ({ page }) => {
    await page.goto('http://localhost:5173/dashboard');

    // Aller dans l'onglet Tools
    await page.click('text=Tools');

    // Vérifier que les outils sont affichés
    await expect(page.locator('text=AI App Builder')).toBeVisible();
    await expect(page.locator('text=AI Agents Builder')).toBeVisible();
    await expect(page.locator('text=AI Rich Text Editor')).toBeVisible();

    // Cliquer sur un outil
    await page.click('text=AI App Builder');

    // Devrait naviguer vers l'iframe
    await expect(page).toHaveURL(/\/tools\/app-builder/);
  });

  test('should communicate via iframe bridge', async ({ page }) => {
    await page.goto('http://localhost:5173/tools/app-builder');

    // Écouter les messages postMessage
    const messages: string[] = [];
    page.on('console', msg => {
      if (msg.text().includes('IframeBridge')) {
        messages.push(msg.text());
      }
    });

    // Attendre un peu pour que l'initialisation se fasse
    await page.waitForTimeout(2000);

    // Vérifier que des messages de bridge ont été loggés
    expect(messages.length).toBeGreaterThan(0);
    expect(messages.some(msg => msg.includes('Registered iframe'))).toBe(true);
  });

});
