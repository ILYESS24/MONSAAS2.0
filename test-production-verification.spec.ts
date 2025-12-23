import { test, expect } from '@playwright/test';

const BASE_URL = 'https://a34f5efd.aurion-saas.pages.dev';

test.describe('PRODUCTION VERIFICATION - ZERO TRUST AUDIT', () => {

  // AXE 1: AUTHENTIFICATION CLERK
  test('AXE 1 - Clerk Authentication Verification', async ({ page, context }) => {
    // Test 1: Tentative d'accès au dashboard sans authentification
    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForLoadState('networkidle');

    // Capture network requests
    const clerkRequests: string[] = [];
    page.on('request', request => {
      if (request.url().includes('clerk') || request.url().includes('auth')) {
        clerkRequests.push(`${request.method()} ${request.url()}`);
      }
    });

    // Vérifier si la page redirige ou bloque l'accès
    const currentUrl = page.url();
    const hasAuthBlock = await page.locator('text=Sign in').isVisible().catch(() => false);

    console.log('Dashboard access without auth:', {
      currentUrl,
      hasAuthBlock,
      clerkRequests: clerkRequests.length
    });

    // Si pas de blocage, c'est un FAIL
    if (!hasAuthBlock && !currentUrl.includes('sign-in')) {
      console.log('FAIL: No authentication required for dashboard');
    }
  });

  // AXE 2: STRIPE PAYMENT VERIFICATION
  test('AXE 2 - Stripe Payment Flow Verification', async ({ page }) => {
    await page.goto(`${BASE_URL}/pricing`);
    await page.waitForLoadState('networkidle');

    // Attendre que les boutons soient chargés
    await page.waitForSelector('button', { timeout: 10000 });

    // Tenter de cliquer sur "Passer au Pro"
    const proButton = page.locator('button').filter({ hasText: /Passer au Pro|Commencer avec Pro/i }).first();

    if (await proButton.isVisible()) {
      // Capture network requests before click
      const stripeRequests: string[] = [];
      page.on('request', request => {
        if (request.url().includes('stripe.com') || request.url().includes('checkout')) {
          stripeRequests.push(`${request.method()} ${request.url()}`);
        }
      });

      // Click the button
      await proButton.click();

      // Wait for navigation or new page
      await page.waitForTimeout(3000);

      const currentUrl = page.url();
      const hasStripeRedirect = currentUrl.includes('checkout.stripe.com') || stripeRequests.length > 0;

      console.log('Stripe payment test:', {
        buttonFound: true,
        currentUrl,
        hasStripeRedirect,
        stripeRequests: stripeRequests.length,
        stripeUrls: stripeRequests
      });

      if (!hasStripeRedirect) {
        console.log('FAIL: No Stripe redirect detected');
      }
    } else {
      console.log('FAIL: Pro button not found');
    }
  });

  // AXE 3: CREDITS & PLANS VERIFICATION
  test('AXE 3 - Credits System Verification', async ({ page }) => {
    // Cette partie nécessite authentification, donc on ne peut pas la tester sans compte
    console.log('AXE 3 - Credits system: REQUIRES AUTHENTICATION - cannot test without user account');

    // Vérifier si l'API backend existe au moins
    const response = await page.request.get(`${BASE_URL}/api/validate-tool-access`);
    console.log('API validate-tool-access status:', response.status());

    if (response.status() === 401 || response.status() === 403) {
      console.log('API requires authentication - GOOD');
    } else {
      console.log('API does not require authentication - POTENTIAL SECURITY ISSUE');
    }
  });

  // AXE 4: OPENROUTER AI VERIFICATION
  test('AXE 4 - OpenRouter AI Verification', async ({ page }) => {
    // Vérifier si les APIs AI existent
    const aiChatResponse = await page.request.get(`${BASE_URL}/api/ai-chat`);
    console.log('AI Chat API status:', aiChatResponse.status());

    if (aiChatResponse.status() === 401 || aiChatResponse.status() === 403) {
      console.log('AI API requires authentication - GOOD');
    } else {
      console.log('AI API accessible without auth - POTENTIAL SECURITY ISSUE');
    }
  });

  // AXE 5: IFRAMES SECURITY VERIFICATION
  test('AXE 5 - Iframes Security Verification', async ({ page }) => {
    await page.goto(`${BASE_URL}/tools/app-builder`);
    await page.waitForLoadState('networkidle');

    // Check if iframe loads
    const iframe = page.locator('iframe').first();
    const iframeExists = await iframe.isVisible().catch(() => false);

    if (iframeExists) {
      // Try to get iframe src
      const iframeSrc = await iframe.getAttribute('src').catch(() => null);
      console.log('Iframe found:', { iframeSrc });

      // Check if external iframe is directly accessible
      if (iframeSrc && iframeSrc.includes('http')) {
        const externalResponse = await page.request.get(iframeSrc);
        console.log('External iframe accessibility:', externalResponse.status());

        if (externalResponse.status() === 200) {
          console.log('SECURITY ISSUE: External iframe accessible without SaaS context');
        }
      }
    } else {
      console.log('No iframe found on tool page');
    }
  });

  // AXE 6: DASHBOARD LIVE DATA VERIFICATION
  test('AXE 6 - Dashboard Live Data Verification', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForLoadState('networkidle');

    // Capture all API calls to dashboard endpoints
    const dashboardRequests: string[] = [];
    page.on('request', request => {
      if (request.url().includes('/api/') || request.url().includes('supabase')) {
        dashboardRequests.push(`${request.method()} ${request.url()}`);
      }
    });

    await page.waitForTimeout(3000); // Wait for potential API calls

    console.log('Dashboard API calls detected:', dashboardRequests.length);
    console.log('Dashboard requests:', dashboardRequests);

    if (dashboardRequests.length === 0) {
      console.log('NO API CALLS: Dashboard likely shows static/mock data');
    }
  });

  // WEBHOOK VERIFICATION
  test('AXE WEBHOOK - Stripe Webhook Verification', async ({ page }) => {
    const webhookResponse = await page.request.post(`${BASE_URL}/api/stripe-webhook`, {
      data: { test: 'webhook_verification' }
    });

    console.log('Webhook endpoint response:', webhookResponse.status());

    if (webhookResponse.status() === 400) {
      console.log('Webhook requires proper Stripe signature - GOOD');
    } else if (webhookResponse.status() === 200) {
      console.log('Webhook accepts invalid requests - SECURITY ISSUE');
    }
  });

});
