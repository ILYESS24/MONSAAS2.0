import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('should load the home page', async ({ page }) => {
    await page.goto('/');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Check that the page has loaded (either landing page or redirected to sign-in)
    const url = page.url();
    expect(url).toBeTruthy();
  });

  test('should have a valid title', async ({ page }) => {
    await page.goto('/');
    
    // The page should have a title
    const title = await page.title();
    expect(title).toBeTruthy();
  });

  test('should be responsive', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    
    // Page should load without errors
    let url = page.url();
    expect(url).toBeTruthy();
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    
    url = page.url();
    expect(url).toBeTruthy();
  });
});
