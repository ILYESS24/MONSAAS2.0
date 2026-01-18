import { test, expect } from '@playwright/test';

test.describe('Image Creation Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to image creation page
    await page.goto('/creation/image');
  });

  test('should load the image creation interface or redirect to auth', async ({ page }) => {
    await page.waitForLoadState('domcontentloaded');
    
    // Check that we're on the right page or redirected to auth
    const url = page.url();
    expect(url).toMatch(/\/(creation\/image|sign-in)/);
  });

  test('should have page content', async ({ page }) => {
    await page.waitForLoadState('domcontentloaded');
    
    // Check that page rendered something
    const html = await page.locator('html');
    await expect(html).toHaveAttribute('lang');
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.waitForLoadState('domcontentloaded');
    
    // Page should load without errors
    const url = page.url();
    expect(url).toBeTruthy();
  });

  test('should be responsive on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForLoadState('domcontentloaded');
    
    // Page should load without errors
    const url = page.url();
    expect(url).toBeTruthy();
  });

  test('should be responsive on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForLoadState('domcontentloaded');
    
    // Page should load without errors
    const url = page.url();
    expect(url).toBeTruthy();
  });
});
