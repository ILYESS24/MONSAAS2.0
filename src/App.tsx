/**
 * App Component
 * 
 * Root application component.
 * Handles initialization and renders the router.
 */

import { useEffect } from 'react';
import { AppRouter } from '@/router';
import { validateEnv, logEnvInfo } from '@/lib/env';
import { logger, securityLogger } from '@/lib/logger';
import { FEATURES } from '@/config';

function App() {
  // Initialize application on mount
  useEffect(() => {
    // Log environment info in development
    if (import.meta.env.DEV) {
      logEnvInfo();
    }
    
    // Validate environment configuration
    const { isValid, errors } = validateEnv();
    
    if (!isValid) {
      errors.forEach(error => {
        securityLogger.error('Environment validation failed', { error });
      });
    }
    
    // Log feature flags status
    logger.info('Application initialized', {
      features: {
        analytics: FEATURES.ANALYTICS_ENABLED,
        errorReporting: FEATURES.ERROR_REPORTING_ENABLED,
        performanceMonitoring: FEATURES.PERFORMANCE_MONITORING_ENABLED,
        standaloneMode: FEATURES.STANDALONE_MODE_ENABLED,
      },
    });
  }, []);

  return <AppRouter />;
}

export default App;
