/**
 * Global teardown for Playwright tests
 * Runs once after all tests
 */

async function globalTeardown() {
  console.log('🧹 Running global teardown...');
  
  // Cleanup any test data or resources
  // Add cleanup logic here if needed
  
  console.log('✅ Global teardown complete');
}

export default globalTeardown;
