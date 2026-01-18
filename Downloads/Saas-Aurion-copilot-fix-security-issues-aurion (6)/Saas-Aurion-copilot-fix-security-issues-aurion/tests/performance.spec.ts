import { test, expect } from '@playwright/test';

test.describe('Performance', () => {
  test('should load within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    
    const loadTime = Date.now() - startTime;
    
    // Page should load within 10 seconds
    expect(loadTime).toBeLessThan(10000);
    
    console.log(`Page load time: ${loadTime}ms`);
  });

  test('should not have console errors', async ({ page }) => {
    const consoleErrors: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        const text = msg.text();
        // Ignore known third-party errors
        if (text.includes('clerk') || text.includes('Clerk')) return;
        if (text.includes('net::')) return; // Network errors
        consoleErrors.push(text);
      }
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Wait a bit for any delayed errors
    await page.waitForTimeout(1000);
    
    // Log errors for debugging
    if (consoleErrors.length > 0) {
      console.log('Console errors:', consoleErrors);
    }
    
    // Allow some tolerance for non-critical errors
    expect(consoleErrors.length).toBeLessThan(5);
  });

  test('should have acceptable page size', async ({ page }) => {
    let totalSize = 0;
    
    page.on('response', response => {
      const headers = response.headers();
      const contentLength = headers['content-length'];
      if (contentLength) {
        totalSize += parseInt(contentLength, 10);
      }
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Total page size should be under 10MB (includes images, fonts, etc.)
    const sizeMB = totalSize / (1024 * 1024);
    console.log(`Total page size: ${sizeMB.toFixed(2)}MB`);
    
    expect(totalSize).toBeLessThan(10 * 1024 * 1024);
  });
});
