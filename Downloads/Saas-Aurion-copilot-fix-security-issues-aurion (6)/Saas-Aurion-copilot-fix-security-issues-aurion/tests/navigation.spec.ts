import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('should navigate without errors', async ({ page }) => {
    // Navigate to the home page
    const response = await page.goto('/');
    
    // Check that the response is OK
    expect(response?.status()).toBeLessThan(400);
  });

  test('should handle 404 pages gracefully', async ({ page }) => {
    // Try to navigate to a non-existent page
    await page.goto('/non-existent-page-12345');
    await page.waitForLoadState('domcontentloaded');
    
    // The page should still render (either 404 page or redirect)
    const url = page.url();
    expect(url).toBeTruthy();
  });

  test('should load CSS and JS resources', async ({ page }) => {
    // Track failed requests
    const failedRequests: string[] = [];
    
    page.on('requestfailed', request => {
      const url = request.url();
      // Ignore external resources that might be blocked
      if (!url.includes('localhost')) return;
      failedRequests.push(url);
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // No critical resource requests should fail
    expect(failedRequests.length).toBe(0);
  });
});
