import { test, expect } from '@playwright/test';

const BASE_URL = 'https://eb416500.aurion-saas.pages.dev';

test.describe('CLERK AUTHENTICATION TEST', () => {

  test('Check if Clerk is loaded and configured', async ({ page }) => {
    await page.goto(BASE_URL);

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Check if Clerk scripts are loaded
    const clerkScripts = await page.locator('script[src*="clerk"]').count();
    console.log('Clerk scripts found:', clerkScripts);

    // Check for Clerk provider in DOM
    const clerkProvider = await page.locator('[data-clerk-provider]').count();
    console.log('Clerk providers found:', clerkProvider);

    // Check if sign-in/sign-up elements exist
    const signInButton = await page.locator('text=Sign in').count();
    const signUpButton = await page.locator('text=Sign up').count();
    console.log('Sign in buttons:', signInButton);
    console.log('Sign up buttons:', signUpButton);

    // Check network requests to Clerk
    const clerkRequests: string[] = [];
    page.on('request', request => {
      if (request.url().includes('clerk')) {
        clerkRequests.push(request.url());
      }
    });

    await page.waitForTimeout(2000);

    console.log('Clerk network requests:', clerkRequests.length);
    console.log('Requests:', clerkRequests);
  });

  test('Try to access dashboard without auth', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`);

    // Wait and check what happens
    await page.waitForTimeout(3000);

    const currentUrl = page.url();
    const hasRedirect = !currentUrl.includes('/dashboard');
    const hasAuthError = await page.locator('text=Sign in').isVisible().catch(() => false);

    console.log('Dashboard access test:');
    console.log('- Current URL:', currentUrl);
    console.log('- Has redirect:', hasRedirect);
    console.log('- Has auth error:', hasAuthError);

    // If we're still on dashboard without auth elements, Clerk is not working
    if (currentUrl.includes('/dashboard') && !hasAuthError) {
      console.log('FAIL: Clerk authentication not enforced');
    } else {
      console.log('PASS: Clerk authentication working');
    }
  });
});
