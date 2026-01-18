import { test, expect } from '@playwright/test'

test.describe('API Endpoint Tests', () => {
  const baseUrl = 'http://localhost:5173'

  test.describe('Health Check', () => {
    test('should load index page', async ({ request }) => {
      const response = await request.get(baseUrl)
      expect(response.status()).toBe(200)
    })

    test('should return proper content type', async ({ request }) => {
      const response = await request.get(baseUrl)
      const contentType = response.headers()['content-type']
      expect(contentType).toContain('text/html')
    })
  })

  test.describe('Static Assets', () => {
    test('should serve JavaScript files', async ({ request }) => {
      const response = await request.get(baseUrl)
      const html = await response.text()
      
      // Extract script src from HTML
      const scriptMatch = html.match(/src="([^"]*\.js)"/)
      if (scriptMatch) {
        const scriptUrl = scriptMatch[1].startsWith('http') 
          ? scriptMatch[1] 
          : `${baseUrl}${scriptMatch[1]}`
        
        const scriptResponse = await request.get(scriptUrl)
        expect(scriptResponse.status()).toBe(200)
      }
    })

    test('should serve CSS files', async ({ request }) => {
      const response = await request.get(baseUrl)
      const html = await response.text()
      
      // Extract CSS href from HTML
      const cssMatch = html.match(/href="([^"]*\.css)"/)
      if (cssMatch) {
        const cssUrl = cssMatch[1].startsWith('http')
          ? cssMatch[1]
          : `${baseUrl}${cssMatch[1]}`
        
        const cssResponse = await request.get(cssUrl)
        expect(cssResponse.status()).toBe(200)
      }
    })
  })

  test.describe('404 Handling', () => {
    test('should handle non-existent routes', async ({ page }) => {
      const response = await page.goto(`${baseUrl}/this-route-does-not-exist-12345`)
      
      // SPA should return 200 and handle routing client-side
      // Or return 404
      expect([200, 404]).toContain(response?.status())
    })
  })

  test.describe('Rate Limiting', () => {
    test('should handle rapid requests', async ({ request }) => {
      const requests = []
      
      // Send 5 rapid requests
      for (let i = 0; i < 5; i++) {
        requests.push(request.get(baseUrl))
      }
      
      const responses = await Promise.all(requests)
      
      // All should succeed or return rate limit
      for (const response of responses) {
        expect([200, 429]).toContain(response.status())
      }
    })
  })
})
