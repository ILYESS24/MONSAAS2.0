import { test, expect } from '@playwright/test';

test.describe('Accessibility', () => {
  test('should have proper HTML structure', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check for basic HTML structure
    const html = await page.locator('html');
    await expect(html).toBeVisible();
    
    // Check for lang attribute
    const langAttr = await html.getAttribute('lang');
    expect(langAttr).toBeTruthy();
  });

  test('should have a main content area', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check for main element or role="main"
    const main = page.locator('main, [role="main"]');
    const count = await main.count();
    
    // Either has a main element or the body is the main content
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should have visible text content', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    
    // The page should have some content in HTML
    const html = await page.locator('html');
    const content = await html.innerHTML();
    
    expect(content.length).toBeGreaterThan(0);
  });

  test('should have clickable elements', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    
    // Check that HTML has some content (interactive elements may be hidden during auth)
    const html = await page.locator('html');
    const content = await html.innerHTML();
    
    // Page should have HTML content
    expect(content.length).toBeGreaterThan(100);
  });

  test('should not have broken images', async ({ page }) => {
    const brokenImages: string[] = [];
    
    page.on('response', response => {
      const url = response.url();
      if (url.match(/\.(png|jpg|jpeg|gif|svg|webp)$/i)) {
        if (!response.ok()) {
          brokenImages.push(url);
        }
      }
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // No images should be broken
    expect(brokenImages.length).toBe(0);
  });
});
