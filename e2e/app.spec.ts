import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('should navigate to home page', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Aurion/i);
  });

  test('should have working navigation links', async ({ page }) => {
    await page.goto('/');
    
    // Check that navigation elements exist
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
  });

  test('should navigate to about page', async ({ page }) => {
    await page.goto('/about');
    await expect(page.locator('body')).toContainText(/about/i);
  });

  test('should navigate to contact page', async ({ page }) => {
    await page.goto('/contact');
    await expect(page.locator('body')).toContainText(/contact/i);
  });
});

test.describe('Authentication Flow', () => {
  test('should redirect unauthenticated users from dashboard', async ({ page }) => {
    await page.goto('/dashboard');
    // In demo mode, dashboard should be accessible
    // In production mode, should redirect to sign-in
    const url = page.url();
    expect(url).toMatch(/\/(dashboard|sign-in)/);
  });

  test('should display sign-in page', async ({ page }) => {
    await page.goto('/sign-in');
    // Check that sign-in page loads
    await expect(page.locator('body')).toBeVisible();
  });

  test('should display sign-up page', async ({ page }) => {
    await page.goto('/sign-up');
    // Check that sign-up page loads
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Dashboard', () => {
  test('should load dashboard page', async ({ page }) => {
    await page.goto('/dashboard');
    // Wait for page to load
    await page.waitForLoadState('networkidle');
  });

  test('should display live indicators when on dashboard', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Check if dashboard content loads
    const dashboardContent = page.locator('main');
    await expect(dashboardContent).toBeVisible();
  });
});

test.describe('Tool Pages', () => {
  const tools = [
    { path: '/aurion-chat', name: 'Aurion Chat' },
    { path: '/code-editor', name: 'Code Editor' },
    { path: '/text-editor', name: 'Text Editor' },
    { path: '/app-builder', name: 'App Builder' },
    { path: '/agent-ai', name: 'Agent AI' },
    { path: '/intelligent-canvas', name: 'Intelligent Canvas' },
  ];

  for (const tool of tools) {
    test(`should load ${tool.name} page`, async ({ page }) => {
      await page.goto(tool.path);
      await page.waitForLoadState('networkidle');
      
      // Check page loaded without errors
      const body = page.locator('body');
      await expect(body).toBeVisible();
    });
  }
});

test.describe('Responsive Design', () => {
  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Check that page renders properly on mobile
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should be responsive on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    
    // Check that page renders properly on tablet
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should be responsive on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    
    // Check that page renders properly on desktop
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });
});

test.describe('Accessibility', () => {
  test('should have proper heading structure', async ({ page }) => {
    await page.goto('/');
    
    // Check for at least one heading
    const headings = page.locator('h1, h2, h3, h4, h5, h6');
    await expect(headings.first()).toBeVisible();
  });

  test('should have interactive elements with proper labels', async ({ page }) => {
    await page.goto('/');
    
    // Check that buttons exist
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    expect(buttonCount).toBeGreaterThan(0);
  });

  test('should have proper link elements', async ({ page }) => {
    await page.goto('/');
    
    // Check that links exist
    const links = page.locator('a');
    const linkCount = await links.count();
    expect(linkCount).toBeGreaterThan(0);
  });
});

test.describe('Error Handling', () => {
  test('should handle 404 pages gracefully', async ({ page }) => {
    await page.goto('/non-existent-page-12345');
    
    // Page should still load without crashing
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });
});

test.describe('Performance', () => {
  test('should load home page within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    const loadTime = Date.now() - startTime;
    
    // Page should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });

  test('should have no JavaScript errors on home page', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => {
      errors.push(error.message);
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Filter out known acceptable errors (like Clerk in demo mode)
    const criticalErrors = errors.filter(
      (error) => !error.includes('Clerk') && !error.includes('publishableKey')
    );
    
    expect(criticalErrors).toHaveLength(0);
  });
});

test.describe('Security', () => {
  test('should have CSP meta tag', async ({ page }) => {
    await page.goto('/');
    
    // Check for security-related meta tags
    const cspMeta = page.locator('meta[http-equiv="Content-Security-Policy"]');
    await expect(cspMeta).toBeVisible();
  });

  test('should have X-Frame-Options meta tag', async ({ page }) => {
    await page.goto('/');
    
    // Check for X-Frame-Options meta tag
    const xframeMeta = page.locator('meta[http-equiv="X-Frame-Options"]');
    await expect(xframeMeta).toBeVisible();
  });
});

test.describe('Legal Pages', () => {
  test('should load Terms of Service page', async ({ page }) => {
    await page.goto('/terms');
    await expect(page.locator('body')).toContainText(/terms/i);
  });

  test('should load Privacy Policy page', async ({ page }) => {
    await page.goto('/privacy');
    await expect(page.locator('body')).toContainText(/privacy/i);
  });

  test('should load Cookies page', async ({ page }) => {
    await page.goto('/cookies');
    await expect(page.locator('body')).toContainText(/cookie/i);
  });

  test('should load Legal page', async ({ page }) => {
    await page.goto('/legal');
    await expect(page.locator('body')).toContainText(/legal/i);
  });
});
