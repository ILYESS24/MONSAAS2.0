/**
 * Providers
 * 
 * Application-wide providers wrapped in a single component.
 * Simplifies the provider hierarchy in main.tsx.
 */

import { ReactNode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ClerkProvider } from '@clerk/clerk-react';
import { AppProvider, NotificationProvider } from '@/contexts';
import { ErrorBoundary } from '@/components/common';
import { getClerkPublishableKey, getEnvConfig } from '@/lib/env';
import { logger } from '@/lib/logger';

interface AppProvidersProps {
  children: ReactNode;
}

// Clerk appearance configuration
const clerkAppearance = {
  baseTheme: undefined,
  variables: {
    colorPrimary: '#ffffff',
    colorBackground: '#171717',
    colorText: '#ffffff',
    colorTextSecondary: '#a3a3a3',
    colorInputBackground: 'rgba(255,255,255,0.05)',
    colorInputText: '#ffffff',
  },
  elements: {
    formButtonPrimary: 'bg-white text-black hover:bg-white/90',
    card: 'bg-neutral-900 border border-white/10',
  },
};

// Configuration error fallback
function ConfigurationError() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <div className="text-white font-body text-center max-w-md">
        <div className="w-16 h-16 border-2 border-red-500/50 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold mb-3">Configuration Error</h1>
        <p className="text-white/60 mb-4">
          The application is not properly configured. Please contact support.
        </p>
        <p className="text-white/40 text-xs">
          Error: Authentication service not configured
        </p>
      </div>
    </div>
  );
}

/**
 * Core providers without auth (for demo mode)
 */
function CoreProviders({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
      <AppProvider>
        <NotificationProvider>
          {children}
        </NotificationProvider>
      </AppProvider>
    </ErrorBoundary>
  );
}

/**
 * Main application providers
 */
export function AppProviders({ children }: AppProvidersProps) {
  const clerkKey = getClerkPublishableKey();
  const { IS_PRODUCTION } = getEnvConfig();
  const basename = import.meta.env.BASE_URL;

  // Use Clerk authentication with real keys
  logger.info('Running with Clerk authentication - Real user authentication enabled');

  return (
    <BrowserRouter basename={basename}>
      <CoreProviders>
        <ClerkProvider publishableKey={clerkKey} appearance={clerkAppearance}>
          {children}
        </ClerkProvider>
      </CoreProviders>
    </BrowserRouter>
  );
}

export default AppProviders;
