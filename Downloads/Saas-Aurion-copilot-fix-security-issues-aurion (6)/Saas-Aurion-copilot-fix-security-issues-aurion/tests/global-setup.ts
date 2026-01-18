import type { FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting global test setup...');
  
  // Wait for dev server using native fetch
  const baseURL = config.projects[0].use?.baseURL || 'http://localhost:5173';
  
  let retries = 0;
  const maxRetries = 30;
  
  while (retries < maxRetries) {
    try {
      const response = await fetch(baseURL);
      if (response.ok) {
        console.log('✅ Dev server is ready');
        break;
      }
    } catch (e) {
      // Server not ready yet
    }
    retries++;
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  if (retries >= maxRetries) {
    throw new Error(`Dev server at ${baseURL} did not become available`);
  }
  
  console.log('✅ Global setup complete');
}

export default globalSetup;
