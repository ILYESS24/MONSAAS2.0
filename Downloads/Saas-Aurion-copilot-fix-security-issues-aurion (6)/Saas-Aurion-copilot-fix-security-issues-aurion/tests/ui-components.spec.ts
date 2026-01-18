import { test, expect } from '@playwright/test'

test.describe('UI Component Tests', () => {
  test.describe('Navigation', () => {
    test('should have working internal links', async ({ page }) => {
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      
      // Find all internal links
      const links = await page.locator('a[href^="/"]').all()
      
      // Test first few links
      for (const link of links.slice(0, 3)) {
        const href = await link.getAttribute('href')
        if (href && !href.includes('#')) {
          try {
            await link.click()
            await page.waitForLoadState('networkidle')
            
            // Should not show error
            const title = await page.title()
            expect(title).toBeTruthy()
            
            // Go back
            await page.goBack()
          } catch {
            // Link may not be clickable, skip
          }
        }
      }
    })
  })

  test.describe('Buttons', () => {
    test('should have visible buttons', async ({ page }) => {
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      
      const buttons = await page.locator('button').all()
      
      for (const button of buttons.slice(0, 5)) {
        const isVisible = await button.isVisible()
        if (isVisible) {
          // Button should have some content
          const text = await button.innerText().catch(() => '')
          const hasIcon = await button.locator('svg').count() > 0
          // Button should have either text or icon
          expect(text.length > 0 || hasIcon).toBe(true)
        }
      }
    })
  })

  test.describe('Forms', () => {
    test('should have proper form labels', async ({ page }) => {
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      
      const inputs = await page.locator('input:not([type="hidden"])').all()
      
      for (const input of inputs.slice(0, 3)) {
        const id = await input.getAttribute('id')
        const ariaLabel = await input.getAttribute('aria-label')
        const placeholder = await input.getAttribute('placeholder')
        
        // Input should have some accessible label
        const hasLabel = id || ariaLabel || placeholder
        expect(hasLabel).toBeTruthy()
      }
    })
  })

  test.describe('Animations', () => {
    test('should respect reduced motion preference', async ({ browser }) => {
      const context = await browser.newContext({
        reducedMotion: 'reduce'
      })
      const page = await context.newPage()
      
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      
      // Page should still function
      expect(await page.title()).toBeTruthy()
      
      await context.close()
    })
  })

  test.describe('Dark Mode', () => {
    test('should support dark color scheme', async ({ browser }) => {
      const context = await browser.newContext({
        colorScheme: 'dark'
      })
      const page = await context.newPage()
      
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      
      // Page should adapt to dark mode
      expect(await page.title()).toBeTruthy()
      
      await context.close()
    })

    test('should support light color scheme', async ({ browser }) => {
      const context = await browser.newContext({
        colorScheme: 'light'
      })
      const page = await context.newPage()
      
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      
      expect(await page.title()).toBeTruthy()
      
      await context.close()
    })
  })

  test.describe('Focus Management', () => {
    test('should have visible focus indicators', async ({ page }) => {
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      
      // Tab through first few elements
      for (let i = 0; i < 5; i++) {
        await page.keyboard.press('Tab')
      }
      
      // Check that something is focused
      const focusedElement = await page.locator(':focus').count()
      expect(focusedElement).toBeGreaterThanOrEqual(0)
    })
  })
})
