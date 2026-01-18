import { test, expect, devices } from '@playwright/test'

const viewports = [
  { name: 'Mobile S', width: 320, height: 568 },
  { name: 'Mobile M', width: 375, height: 667 },
  { name: 'Mobile L', width: 425, height: 812 },
  { name: 'Tablet', width: 768, height: 1024 },
  { name: 'Laptop', width: 1024, height: 768 },
  { name: 'Desktop', width: 1440, height: 900 },
  { name: '4K', width: 2560, height: 1440 }
]

test.describe('Responsive Design Tests', () => {
  for (const viewport of viewports) {
    test.describe(`${viewport.name} (${viewport.width}x${viewport.height})`, () => {
      test.beforeEach(async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height })
      })

      test('should load without horizontal scrollbar', async ({ page }) => {
        await page.goto('/')
        await page.waitForLoadState('networkidle')
        
        const bodyWidth = await page.evaluate(() => document.body.scrollWidth)
        const viewportWidth = await page.evaluate(() => window.innerWidth)
        
        // Body should not exceed viewport width significantly
        expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 50)
      })

      test('should have readable text', async ({ page }) => {
        await page.goto('/')
        await page.waitForLoadState('networkidle')
        
        // Check that body font size is at least 12px
        const fontSize = await page.evaluate(() => {
          const body = document.body
          return parseInt(window.getComputedStyle(body).fontSize)
        })
        
        expect(fontSize).toBeGreaterThanOrEqual(12)
      })

      test('should display content', async ({ page }) => {
        await page.goto('/')
        await page.waitForLoadState('networkidle')
        
        // Page should have title
        const title = await page.title()
        expect(title).toBeTruthy()
      })
    })
  }
})

test.describe('Device Emulation Tests', () => {
  test('should work on iPhone 12', async ({ browser }) => {
    const context = await browser.newContext({
      ...devices['iPhone 12']
    })
    const page = await context.newPage()
    
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    expect(await page.title()).toBeTruthy()
    await context.close()
  })

  test('should work on iPad', async ({ browser }) => {
    const context = await browser.newContext({
      ...devices['iPad Pro']
    })
    const page = await context.newPage()
    
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    expect(await page.title()).toBeTruthy()
    await context.close()
  })

  test('should work on Pixel 5', async ({ browser }) => {
    const context = await browser.newContext({
      ...devices['Pixel 5']
    })
    const page = await context.newPage()
    
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    expect(await page.title()).toBeTruthy()
    await context.close()
  })
})

test.describe('Orientation Tests', () => {
  test('should handle portrait orientation', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    expect(await page.title()).toBeTruthy()
  })

  test('should handle landscape orientation', async ({ page }) => {
    await page.setViewportSize({ width: 812, height: 375 })
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    expect(await page.title()).toBeTruthy()
  })
})
