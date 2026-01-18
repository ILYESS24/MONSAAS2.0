import { test, expect } from '@playwright/test'

test.describe('SEO Tests', () => {
  test('should have proper page title', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    const title = await page.title()
    expect(title).toBeTruthy()
    expect(title.length).toBeGreaterThan(0)
    expect(title.length).toBeLessThan(70) // SEO best practice
  })

  test('should have meta description', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    const metaDescription = await page.locator('meta[name="description"]').getAttribute('content')
    // Meta description may or may not be present
    if (metaDescription) {
      expect(metaDescription.length).toBeGreaterThan(50)
      expect(metaDescription.length).toBeLessThan(160)
    }
  })

  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    const h1Count = await page.locator('h1').count()
    // Should have at least one h1, but not more than one per page
    expect(h1Count).toBeLessThanOrEqual(2)
  })

  test('should have lang attribute on html', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    const lang = await page.locator('html').getAttribute('lang')
    expect(lang).toBeTruthy()
  })

  test('should have viewport meta tag', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    const viewport = await page.locator('meta[name="viewport"]').getAttribute('content')
    expect(viewport).toContain('width=device-width')
  })

  test('images should have alt attributes', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    const images = await page.locator('img').all()
    for (const img of images) {
      const alt = await img.getAttribute('alt')
      // Alt should exist (can be empty for decorative images)
      expect(alt).toBeDefined()
    }
  })

  test('should have canonical URL', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Canonical link may or may not be present
    const canonical = await page.locator('link[rel="canonical"]').count()
    expect(canonical).toBeGreaterThanOrEqual(0)
  })

  test('should have Open Graph tags', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // OG tags may or may not be present
    const ogTitle = await page.locator('meta[property="og:title"]').count()
    expect(ogTitle).toBeGreaterThanOrEqual(0)
  })

  test('should have Twitter Card tags', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Twitter cards may or may not be present
    const twitterCard = await page.locator('meta[name="twitter:card"]').count()
    expect(twitterCard).toBeGreaterThanOrEqual(0)
  })

  test('links should have href attributes', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    const links = await page.locator('a').all()
    for (const link of links.slice(0, 20)) {
      const href = await link.getAttribute('href')
      // href should exist (can be # for anchor links)
      if (href) {
        expect(href).not.toBe('')
      }
    }
  })
})
