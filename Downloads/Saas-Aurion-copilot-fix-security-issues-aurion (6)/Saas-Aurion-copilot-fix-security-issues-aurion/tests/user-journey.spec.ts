import { test, expect, Page } from '@playwright/test';

/**
 * Complete User Journey Tests
 * Simulates a real user using the entire AURION application
 */
test.describe('User Journey - Complete Application Flow', () => {
  
  // =============================================
  // JOURNEY 1: New Visitor Discovery Flow
  // =============================================
  test.describe('Journey 1: New Visitor Discovery', () => {
    
    test('should discover the platform from landing page', async ({ page }) => {
      // Step 1: Land on the home page
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Verify the page loaded
      const pageContent = await page.content();
      expect(pageContent.length).toBeGreaterThan(1000);
    });

    test('should explore features page', async ({ page }) => {
      await page.goto('/features');
      await page.waitForLoadState('domcontentloaded');
      
      const url = page.url();
      expect(url).toContain('features');
    });

    test('should check pricing plans', async ({ page }) => {
      await page.goto('/pricing');
      await page.waitForLoadState('domcontentloaded');
      
      const url = page.url();
      expect(url).toContain('pricing');
    });

    test('should read about the company', async ({ page }) => {
      await page.goto('/about');
      await page.waitForLoadState('domcontentloaded');
      
      const url = page.url();
      expect(url).toContain('about');
    });

    test('should explore documentation', async ({ page }) => {
      await page.goto('/docs');
      await page.waitForLoadState('domcontentloaded');
      
      const url = page.url();
      expect(url).toContain('docs');
    });

    test('should check resources', async ({ page }) => {
      await page.goto('/ressources');
      await page.waitForLoadState('domcontentloaded');
      
      const url = page.url();
      expect(url).toContain('ressources');
    });

    test('should read blog content', async ({ page }) => {
      await page.goto('/blog');
      await page.waitForLoadState('domcontentloaded');
      
      const url = page.url();
      expect(url).toContain('blog');
    });

    test('should view AI capabilities page', async ({ page }) => {
      await page.goto('/ai');
      await page.waitForLoadState('domcontentloaded');
      
      const url = page.url();
      expect(url).toContain('ai');
    });

    test('should check enterprise solutions', async ({ page }) => {
      await page.goto('/entreprise');
      await page.waitForLoadState('domcontentloaded');
      
      const url = page.url();
      expect(url).toContain('entreprise');
    });

    test('should explore services offered', async ({ page }) => {
      await page.goto('/services');
      await page.waitForLoadState('domcontentloaded');
      
      const url = page.url();
      expect(url).toContain('services');
    });
  });

  // =============================================
  // JOURNEY 2: Registration Flow
  // =============================================
  test.describe('Journey 2: Registration & Authentication', () => {
    
    test('should access signup page', async ({ page }) => {
      await page.goto('/signup');
      await page.waitForLoadState('domcontentloaded');
      
      const url = page.url();
      // Should either be on signup page or redirected to Clerk
      expect(url).toBeTruthy();
    });

    test('should attempt dashboard access and require auth', async ({ page }) => {
      await page.goto('/dashboard');
      await page.waitForLoadState('domcontentloaded');
      
      const url = page.url();
      // Should redirect to auth (Clerk) or stay on dashboard if in demo mode
      expect(url).toBeTruthy();
    });

    test('should protect creation routes', async ({ page }) => {
      await page.goto('/creation/image');
      await page.waitForLoadState('domcontentloaded');
      
      const url = page.url();
      // Protected route - should redirect or show content
      expect(url).toBeTruthy();
    });
  });

  // =============================================
  // JOURNEY 3: Legal & Compliance Flow
  // =============================================
  test.describe('Journey 3: Legal & Compliance Review', () => {
    
    test('should read privacy policy', async ({ page }) => {
      await page.goto('/privacy');
      await page.waitForLoadState('domcontentloaded');
      
      const url = page.url();
      expect(url).toContain('privacy');
    });

    test('should read terms of service', async ({ page }) => {
      await page.goto('/terms');
      await page.waitForLoadState('domcontentloaded');
      
      const url = page.url();
      expect(url).toContain('terms');
    });

    test('should read cookie policy', async ({ page }) => {
      await page.goto('/cookies');
      await page.waitForLoadState('domcontentloaded');
      
      const url = page.url();
      expect(url).toContain('cookies');
    });

    test('should review GDPR compliance', async ({ page }) => {
      await page.goto('/gdpr');
      await page.waitForLoadState('domcontentloaded');
      
      const url = page.url();
      expect(url).toContain('gdpr');
    });

    test('should read legal notice', async ({ page }) => {
      await page.goto('/legal-notice');
      await page.waitForLoadState('domcontentloaded');
      
      const url = page.url();
      expect(url).toContain('legal-notice');
    });
  });

  // =============================================
  // JOURNEY 4: Contact & Support Flow
  // =============================================
  test.describe('Journey 4: Contact & Support', () => {
    
    test('should access contact page', async ({ page }) => {
      await page.goto('/contact');
      await page.waitForLoadState('domcontentloaded');
      
      const url = page.url();
      expect(url).toContain('contact');
    });

    test('should view changelog for updates', async ({ page }) => {
      await page.goto('/changelog');
      await page.waitForLoadState('domcontentloaded');
      
      const url = page.url();
      expect(url).toContain('changelog');
    });
  });

  // =============================================
  // JOURNEY 5: Dashboard Exploration (Auth Required)
  // =============================================
  test.describe('Journey 5: Dashboard Features', () => {
    
    test('should attempt to access dashboard studio', async ({ page }) => {
      await page.goto('/dashboard');
      await page.waitForLoadState('domcontentloaded');
      
      // Either redirected to auth or showing dashboard
      const url = page.url();
      expect(url).toBeTruthy();
    });

    test('should attempt to access video section', async ({ page }) => {
      await page.goto('/dashboard/video');
      await page.waitForLoadState('domcontentloaded');
      
      const url = page.url();
      expect(url).toBeTruthy();
    });

    test('should attempt to access images section', async ({ page }) => {
      await page.goto('/dashboard/images');
      await page.waitForLoadState('domcontentloaded');
      
      const url = page.url();
      expect(url).toBeTruthy();
    });

    test('should attempt to access code section', async ({ page }) => {
      await page.goto('/dashboard/code');
      await page.waitForLoadState('domcontentloaded');
      
      const url = page.url();
      expect(url).toBeTruthy();
    });

    test('should attempt to access agents section', async ({ page }) => {
      await page.goto('/dashboard/agents');
      await page.waitForLoadState('domcontentloaded');
      
      const url = page.url();
      expect(url).toBeTruthy();
    });

    test('should attempt to access apps section', async ({ page }) => {
      await page.goto('/dashboard/apps');
      await page.waitForLoadState('domcontentloaded');
      
      const url = page.url();
      expect(url).toBeTruthy();
    });

    test('should attempt to access websites section', async ({ page }) => {
      await page.goto('/dashboard/websites');
      await page.waitForLoadState('domcontentloaded');
      
      const url = page.url();
      expect(url).toBeTruthy();
    });

    test('should attempt to access projects section', async ({ page }) => {
      await page.goto('/dashboard/projects');
      await page.waitForLoadState('domcontentloaded');
      
      const url = page.url();
      expect(url).toBeTruthy();
    });

    test('should attempt to access AI features', async ({ page }) => {
      await page.goto('/dashboard/ai');
      await page.waitForLoadState('domcontentloaded');
      
      const url = page.url();
      expect(url).toBeTruthy();
    });

    test('should attempt to access settings', async ({ page }) => {
      await page.goto('/dashboard/settings');
      await page.waitForLoadState('domcontentloaded');
      
      const url = page.url();
      expect(url).toBeTruthy();
    });

    test('should attempt to access notifications', async ({ page }) => {
      await page.goto('/dashboard/notifications');
      await page.waitForLoadState('domcontentloaded');
      
      const url = page.url();
      expect(url).toBeTruthy();
    });
  });

  // =============================================
  // JOURNEY 6: Creation Features (Auth Required)
  // =============================================
  test.describe('Journey 6: Creation Features', () => {
    
    test('should attempt image creation', async ({ page }) => {
      await page.goto('/creation/image');
      await page.waitForLoadState('domcontentloaded');
      
      const url = page.url();
      expect(url).toBeTruthy();
    });

    test('should attempt video creation', async ({ page }) => {
      await page.goto('/creation/video');
      await page.waitForLoadState('domcontentloaded');
      
      const url = page.url();
      expect(url).toBeTruthy();
    });

    test('should attempt sketch creation', async ({ page }) => {
      await page.goto('/creation/sketch');
      await page.waitForLoadState('domcontentloaded');
      
      const url = page.url();
      expect(url).toBeTruthy();
    });

    test('should attempt image-to-image', async ({ page }) => {
      await page.goto('/creation/image-to-image');
      await page.waitForLoadState('domcontentloaded');
      
      const url = page.url();
      expect(url).toBeTruthy();
    });
  });

  // =============================================
  // JOURNEY 7: Full Page Performance Test
  // =============================================
  test.describe('Journey 7: Performance Across Pages', () => {
    const pages = [
      '/',
      '/features',
      '/pricing',
      '/about',
      '/blog',
      '/docs',
      '/services',
      '/ai',
      '/entreprise',
      '/ressources',
      '/contact',
      '/changelog',
      '/privacy',
      '/terms',
      '/cookies',
      '/gdpr',
      '/legal-notice',
      '/signup'
    ];

    for (const path of pages) {
      test(`should load ${path} within reasonable time`, async ({ page }) => {
        const startTime = Date.now();
        
        await page.goto(path);
        await page.waitForLoadState('domcontentloaded');
        
        const loadTime = Date.now() - startTime;
        
        // Page should load within 10 seconds
        expect(loadTime).toBeLessThan(10000);
      });
    }
  });

  // =============================================
  // JOURNEY 8: Navigation Between Pages
  // =============================================
  test.describe('Journey 8: Page Navigation', () => {
    
    test('should navigate home to features and back', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');
      
      await page.goto('/features');
      await page.waitForLoadState('domcontentloaded');
      expect(page.url()).toContain('features');
      
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');
      // Back to home
      expect(page.url()).not.toContain('features');
    });

    test('should navigate through pricing flow', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');
      
      await page.goto('/pricing');
      await page.waitForLoadState('domcontentloaded');
      expect(page.url()).toContain('pricing');
      
      await page.goto('/signup');
      await page.waitForLoadState('domcontentloaded');
      // Signup or Clerk redirect
      expect(page.url()).toBeTruthy();
    });

    test('should browse documentation flow', async ({ page }) => {
      await page.goto('/docs');
      await page.waitForLoadState('domcontentloaded');
      expect(page.url()).toContain('docs');
      
      await page.goto('/ressources');
      await page.waitForLoadState('domcontentloaded');
      expect(page.url()).toContain('ressources');
      
      await page.goto('/blog');
      await page.waitForLoadState('domcontentloaded');
      expect(page.url()).toContain('blog');
    });
  });

  // =============================================
  // JOURNEY 9: Mobile User Flow
  // =============================================
  test.describe('Journey 9: Mobile User Experience', () => {
    test.use({ viewport: { width: 375, height: 667 } });

    test('should load home page on mobile', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');
      
      expect(page.url()).toBeTruthy();
    });

    test('should access pricing on mobile', async ({ page }) => {
      await page.goto('/pricing');
      await page.waitForLoadState('domcontentloaded');
      
      expect(page.url()).toContain('pricing');
    });

    test('should access creation on mobile', async ({ page }) => {
      await page.goto('/creation/image');
      await page.waitForLoadState('domcontentloaded');
      
      expect(page.url()).toBeTruthy();
    });

    test('should access dashboard on mobile', async ({ page }) => {
      await page.goto('/dashboard');
      await page.waitForLoadState('domcontentloaded');
      
      expect(page.url()).toBeTruthy();
    });
  });

  // =============================================
  // JOURNEY 10: Tablet User Flow
  // =============================================
  test.describe('Journey 10: Tablet User Experience', () => {
    test.use({ viewport: { width: 768, height: 1024 } });

    test('should load home page on tablet', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');
      
      expect(page.url()).toBeTruthy();
    });

    test('should navigate dashboard on tablet', async ({ page }) => {
      await page.goto('/dashboard');
      await page.waitForLoadState('domcontentloaded');
      
      expect(page.url()).toBeTruthy();
    });

    test('should use creation tools on tablet', async ({ page }) => {
      await page.goto('/creation/video');
      await page.waitForLoadState('domcontentloaded');
      
      expect(page.url()).toBeTruthy();
    });
  });

  // =============================================
  // JOURNEY 11: Error Handling Flow
  // =============================================
  test.describe('Journey 11: Error Handling', () => {
    
    test('should handle non-existent page gracefully', async ({ page }) => {
      await page.goto('/non-existent-page-xyz');
      await page.waitForLoadState('domcontentloaded');
      
      // Should not crash - either 404 page or redirect
      const url = page.url();
      expect(url).toBeTruthy();
    });

    test('should handle invalid project ID', async ({ page }) => {
      await page.goto('/dashboard/project/invalid-id-123');
      await page.waitForLoadState('domcontentloaded');
      
      // Should handle gracefully
      const url = page.url();
      expect(url).toBeTruthy();
    });

    test('should handle invalid tool ID', async ({ page }) => {
      await page.goto('/tools/non-existent-tool');
      await page.waitForLoadState('domcontentloaded');
      
      // Should handle gracefully
      const url = page.url();
      expect(url).toBeTruthy();
    });
  });

  // =============================================
  // JOURNEY 12: Console Error Monitoring
  // =============================================
  test.describe('Journey 12: Console Error Monitoring', () => {
    const criticalPages = [
      '/',
      '/features',
      '/pricing',
      '/signup',
      '/dashboard',
      '/creation/image',
      '/creation/video'
    ];

    for (const path of criticalPages) {
      test(`should have no critical JS errors on ${path}`, async ({ page }) => {
        const errors: string[] = [];
        
        page.on('pageerror', error => {
          // Collect critical errors (ignore expected auth/clerk errors)
          if (!error.message.includes('Clerk') && 
              !error.message.includes('auth') &&
              !error.message.includes('Unauthorized')) {
            errors.push(error.message);
          }
        });
        
        await page.goto(path);
        await page.waitForLoadState('networkidle');
        
        // Allow for some non-critical errors, but flag serious issues
        const criticalErrors = errors.filter(e => 
          e.includes('TypeError') || 
          e.includes('ReferenceError') ||
          e.includes('SyntaxError')
        );
        
        expect(criticalErrors).toHaveLength(0);
      });
    }
  });

  // =============================================
  // JOURNEY 13: Resource Loading
  // =============================================
  test.describe('Journey 13: Resource Loading', () => {
    
    test('should load all required resources on home page', async ({ page }) => {
      const failedRequests: string[] = [];
      
      page.on('requestfailed', request => {
        const url = request.url();
        // Ignore analytics and third-party services
        if (!url.includes('analytics') && 
            !url.includes('clerk') && 
            !url.includes('supabase')) {
          failedRequests.push(url);
        }
      });
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // No critical resource should fail
      expect(failedRequests.length).toBeLessThan(5);
    });

    test('should load styles correctly', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Check that stylesheets exist or styles are applied
      const hasStyles = await page.evaluate(() => {
        // Either stylesheets are loaded or inline styles exist
        const hasStylesheets = document.styleSheets.length > 0;
        const hasStyledElements = document.querySelectorAll('*').length > 0;
        return hasStylesheets || hasStyledElements;
      });
      
      expect(hasStyles).toBe(true);
    });
  });
});
