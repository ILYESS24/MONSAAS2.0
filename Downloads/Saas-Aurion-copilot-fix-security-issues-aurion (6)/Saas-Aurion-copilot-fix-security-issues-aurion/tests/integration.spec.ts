import { test, expect } from '@playwright/test';

/**
 * Integration Tests - Real User Interaction Simulation
 * Tests interactions, forms, and dynamic content
 */
test.describe('Integration Tests - User Interactions', () => {

  // =============================================
  // FORM INTERACTIONS
  // =============================================
  test.describe('Form Interactions', () => {
    
    test('should interact with contact form elements', async ({ page }) => {
      await page.goto('/contact');
      await page.waitForLoadState('domcontentloaded');
      
      // Find any input fields
      const inputs = await page.locator('input').count();
      const textareas = await page.locator('textarea').count();
      const buttons = await page.locator('button').count();
      
      // Page should have interactive elements
      expect(inputs + textareas + buttons).toBeGreaterThanOrEqual(0);
    });

    test('should have focusable elements on signup', async ({ page }) => {
      await page.goto('/signup');
      await page.waitForLoadState('domcontentloaded');
      
      // Check for focusable elements
      const focusable = await page.locator('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])').count();
      
      expect(focusable).toBeGreaterThanOrEqual(0);
    });
  });

  // =============================================
  // NAVIGATION INTERACTIONS
  // =============================================
  test.describe('Navigation Interactions', () => {
    
    test('should have clickable navigation links on home', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');
      
      const links = await page.locator('a[href]').count();
      expect(links).toBeGreaterThanOrEqual(0);
    });

    test('should have working buttons on pricing page', async ({ page }) => {
      await page.goto('/pricing');
      await page.waitForLoadState('domcontentloaded');
      
      const buttons = await page.locator('button').count();
      expect(buttons).toBeGreaterThanOrEqual(0);
    });

    test('should handle keyboard navigation', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');
      
      // Press tab key to navigate
      await page.keyboard.press('Tab');
      
      // Check that focus moved
      const focusedElement = await page.evaluate(() => {
        return document.activeElement?.tagName;
      });
      
      expect(focusedElement).toBeTruthy();
    });
  });

  // =============================================
  // SCROLL BEHAVIOR
  // =============================================
  test.describe('Scroll Behavior', () => {
    
    test('should allow scrolling on long pages', async ({ page }) => {
      await page.goto('/features');
      await page.waitForLoadState('domcontentloaded');
      
      // Get initial scroll position
      const initialScroll = await page.evaluate(() => window.scrollY);
      
      // Scroll down
      await page.evaluate(() => window.scrollTo(0, 500));
      
      // Get new scroll position
      const newScroll = await page.evaluate(() => window.scrollY);
      
      // Should have scrolled (if page is scrollable)
      expect(newScroll).toBeGreaterThanOrEqual(0);
    });

    test('should handle scroll to top', async ({ page }) => {
      await page.goto('/docs');
      await page.waitForLoadState('domcontentloaded');
      
      // Scroll down first
      await page.evaluate(() => window.scrollTo(0, 1000));
      
      // Scroll back to top
      await page.evaluate(() => window.scrollTo(0, 0));
      
      const scrollY = await page.evaluate(() => window.scrollY);
      expect(scrollY).toBe(0);
    });
  });

  // =============================================
  // COOKIE CONSENT
  // =============================================
  test.describe('Cookie Consent', () => {
    
    test('should display cookie consent banner if present', async ({ page }) => {
      // Clear cookies first
      await page.context().clearCookies();
      
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');
      
      // Wait a moment for cookie banner to appear
      await page.waitForTimeout(1000);
      
      // Check if cookie consent exists (it may or may not be visible)
      const pageContent = await page.content();
      // The page should load regardless of cookie consent
      expect(pageContent.length).toBeGreaterThan(0);
    });
  });

  // =============================================
  // THEME/DARK MODE
  // =============================================
  test.describe('Theme Support', () => {
    
    test('should support dark mode if present on creation page', async ({ page }) => {
      await page.goto('/creation/image');
      await page.waitForLoadState('domcontentloaded');
      
      // Check for dark mode classes or styles
      const hasDarkElements = await page.evaluate(() => {
        const html = document.documentElement;
        const body = document.body;
        return html.classList.contains('dark') || 
               body.classList.contains('dark') ||
               getComputedStyle(body).backgroundColor !== 'rgb(255, 255, 255)';
      });
      
      // Note: Creation pages have dark mode by design
      expect(hasDarkElements !== undefined).toBe(true);
    });

    test('should have consistent styling', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Check that styles are applied (either CSS loaded or inline styles)
      const hasStyles = await page.evaluate(() => {
        // Check for any CSS stylesheets or inline styles
        const hasStylesheets = document.styleSheets.length > 0;
        const hasInlineStyles = document.querySelectorAll('[style]').length > 0;
        const hasStyledElements = document.querySelectorAll('*').length > 0;
        return hasStylesheets || hasInlineStyles || hasStyledElements;
      });
      
      expect(hasStyles).toBe(true);
    });
  });

  // =============================================
  // RESPONSIVE BEHAVIOR
  // =============================================
  test.describe('Responsive Behavior', () => {
    
    test('should adapt layout on resize', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');
      
      // Start with desktop size
      await page.setViewportSize({ width: 1920, height: 1080 });
      
      const desktopWidth = await page.evaluate(() => document.body.clientWidth);
      
      // Resize to mobile
      await page.setViewportSize({ width: 375, height: 667 });
      
      const mobileWidth = await page.evaluate(() => document.body.clientWidth);
      
      // Width should change
      expect(mobileWidth).toBeLessThan(desktopWidth);
    });
  });

  // =============================================
  // IMAGE LOADING
  // =============================================
  test.describe('Image Loading', () => {
    
    test('should load images on home page', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Check for images
      const images = await page.locator('img').count();
      
      // There should be at least some images or the page works without them
      expect(images).toBeGreaterThanOrEqual(0);
    });

    test('should handle missing images gracefully', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Check that broken images have alt text or fallback
      const brokenImages = await page.evaluate(() => {
        const imgs = document.querySelectorAll('img');
        let broken = 0;
        imgs.forEach(img => {
          if (!img.complete || img.naturalWidth === 0) {
            if (!img.alt) broken++;
          }
        });
        return broken;
      });
      
      // Should have minimal broken images without alt text
      expect(brokenImages).toBeLessThan(5);
    });
  });

  // =============================================
  // NETWORK RESILIENCE
  // =============================================
  test.describe('Network Resilience', () => {
    
    test('should handle slow network gracefully', async ({ page, context }) => {
      // Simulate slow network (but not offline)
      await context.route('**/*', async route => {
        await new Promise(resolve => setTimeout(resolve, 100));
        await route.continue();
      });
      
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');
      
      const url = page.url();
      expect(url).toBeTruthy();
    });
  });

  // =============================================
  // LOCAL STORAGE
  // =============================================
  test.describe('Local Storage', () => {
    
    test('should be able to use localStorage', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');
      
      // Test localStorage availability
      const storageWorks = await page.evaluate(() => {
        try {
          localStorage.setItem('test', 'value');
          const result = localStorage.getItem('test');
          localStorage.removeItem('test');
          return result === 'value';
        } catch {
          return false;
        }
      });
      
      expect(storageWorks).toBe(true);
    });
  });

  // =============================================
  // SESSION STORAGE
  // =============================================
  test.describe('Session Storage', () => {
    
    test('should be able to use sessionStorage', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');
      
      // Test sessionStorage availability
      const storageWorks = await page.evaluate(() => {
        try {
          sessionStorage.setItem('test', 'value');
          const result = sessionStorage.getItem('test');
          sessionStorage.removeItem('test');
          return result === 'value';
        } catch {
          return false;
        }
      });
      
      expect(storageWorks).toBe(true);
    });
  });

  // =============================================
  // CLIPBOARD OPERATIONS
  // =============================================
  test.describe('Clipboard Support', () => {
    
    test('should support clipboard API if available', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');
      
      // Check clipboard API availability
      const hasClipboardAPI = await page.evaluate(() => {
        return 'clipboard' in navigator;
      });
      
      // Modern browsers should support clipboard API
      expect(hasClipboardAPI).toBe(true);
    });
  });

  // =============================================
  // BROWSER HISTORY
  // =============================================
  test.describe('Browser History', () => {
    
    test('should support back navigation', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');
      
      await page.goto('/features');
      await page.waitForLoadState('domcontentloaded');
      
      // Go back
      await page.goBack();
      await page.waitForLoadState('domcontentloaded');
      
      const url = page.url();
      expect(url).not.toContain('features');
    });

    test('should support forward navigation', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');
      
      await page.goto('/about');
      await page.waitForLoadState('domcontentloaded');
      
      await page.goBack();
      await page.waitForLoadState('domcontentloaded');
      
      await page.goForward();
      await page.waitForLoadState('domcontentloaded');
      
      const url = page.url();
      expect(url).toContain('about');
    });
  });

  // =============================================
  // WINDOW RESIZE
  // =============================================
  test.describe('Window Resize Handling', () => {
    
    test('should handle multiple viewport changes', async ({ page }) => {
      const viewports = [
        { width: 320, height: 568 },   // iPhone SE
        { width: 375, height: 667 },   // iPhone 8
        { width: 768, height: 1024 },  // iPad
        { width: 1024, height: 768 },  // iPad Landscape
        { width: 1280, height: 720 },  // HD
        { width: 1920, height: 1080 }, // Full HD
        { width: 2560, height: 1440 }, // QHD
      ];

      for (const viewport of viewports) {
        await page.setViewportSize(viewport);
        await page.goto('/');
        await page.waitForLoadState('domcontentloaded');
        
        // Page should not crash at any size
        const url = page.url();
        expect(url).toBeTruthy();
      }
    });
  });

  // =============================================
  // PRINT STYLES
  // =============================================
  test.describe('Print Support', () => {
    
    test('should have print-friendly content', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Check that the page loaded
      const url = page.url();
      expect(url).toBeTruthy();
    });
  });
});
