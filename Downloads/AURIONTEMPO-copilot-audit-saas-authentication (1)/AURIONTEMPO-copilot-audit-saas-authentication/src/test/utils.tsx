/**
 * Test Utilities
 * 
 * Common test utilities and helpers.
 */

import React, { ReactElement } from 'react';
import { render, RenderOptions, RenderResult } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';

/**
 * All providers wrapper for testing
 */
interface AllProvidersProps {
  children: React.ReactNode;
}

function AllProviders({ children }: AllProvidersProps) {
  return (
    <BrowserRouter>
      {children}
    </BrowserRouter>
  );
}

/**
 * Custom render function that wraps components with all necessary providers
 */
function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
): RenderResult {
  return render(ui, { wrapper: AllProviders, ...options });
}

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };

/**
 * Create a mock function with typed return value
 */
export function createMockFn<T>(returnValue?: T) {
  const mockFn = vi.fn();
  if (returnValue !== undefined) {
    mockFn.mockReturnValue(returnValue);
  }
  return mockFn;
}

/**
 * Wait for condition to be true
 */
export async function waitForCondition(
  condition: () => boolean,
  timeout: number = 5000,
  interval: number = 100
): Promise<void> {
  const startTime = Date.now();
  
  return new Promise((resolve, reject) => {
    const checkCondition = () => {
      if (condition()) {
        resolve();
        return;
      }
      
      if (Date.now() - startTime > timeout) {
        reject(new Error('Condition not met within timeout'));
        return;
      }
      
      setTimeout(checkCondition, interval);
    };
    
    checkCondition();
  });
}

/**
 * Create mock API response
 */
export function createMockResponse<T>(data: T, status: number = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
  };
}
