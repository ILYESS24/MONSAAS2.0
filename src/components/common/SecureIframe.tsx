/**
 * SecureIframe Component
 * 
 * A secure iframe wrapper that implements best practices for iframe security:
 * - Sandbox attribute with minimal permissions
 * - Loading state with skeleton
 * - Error handling
 * - Lazy loading
 * - Origin validation
 * - PostMessage validation (when needed)
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ALLOWED_IFRAME_ORIGINS } from '@/lib/env';
import { securityLogger } from '@/lib/logger';
import { AlertCircle, RefreshCw, Loader2 } from 'lucide-react';

// Sandbox permissions - minimal by default
type SandboxPermission = 
  | 'allow-scripts'
  | 'allow-same-origin'
  | 'allow-forms'
  | 'allow-popups'
  | 'allow-popups-to-escape-sandbox'
  | 'allow-modals'
  | 'allow-downloads';

interface SecureIframeProps {
  src: string;
  title: string;
  className?: string;
  sandbox?: SandboxPermission[];
  allowClipboard?: boolean;
  onLoad?: () => void;
  onError?: (error: Error) => void;
  onStatusChange?: (status: 'loading' | 'connected' | 'error') => void;
  validateOrigin?: boolean;
  showLoadingState?: boolean;
}

// Loading skeleton component
const IframeLoadingSkeleton = () => (
  <div className="absolute inset-0 bg-neutral-900 flex flex-col items-center justify-center">
    <Loader2 className="w-10 h-10 text-white/40 animate-spin mb-4" />
    <p className="text-white/60 text-sm">Loading application...</p>
    <div className="mt-6 flex gap-2">
      {[...Array(3)].map((_, i) => (
        <div 
          key={i}
          className="w-2 h-2 bg-white/20 rounded-full animate-pulse"
          style={{ animationDelay: `${i * 0.2}s` }}
        />
      ))}
    </div>
  </div>
);

// Error state component
const IframeErrorState = ({ 
  error, 
  onRetry 
}: { 
  error: string; 
  onRetry: () => void;
}) => (
  <div className="absolute inset-0 bg-neutral-900 flex flex-col items-center justify-center p-6">
    <div className="p-4 bg-red-500/10 rounded-full mb-4">
      <AlertCircle className="w-10 h-10 text-red-500" />
    </div>
    <h3 className="text-white text-lg font-semibold mb-2">Failed to Load</h3>
    <p className="text-white/60 text-sm text-center max-w-md mb-6">
      {error}
    </p>
    <button
      onClick={onRetry}
      className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm transition-colors"
    >
      <RefreshCw className="w-4 h-4" />
      Try Again
    </button>
  </div>
);

// Validate if the origin is allowed (exact match to prevent subdomain attacks)
function isOriginAllowed(src: string): boolean {
  try {
    const url = new URL(src);
    const origin = url.origin;
    // Use exact origin matching to prevent subdomain attacks
    // e.g., 'https://example.com' should NOT match 'https://example.com.evil.com'
    return ALLOWED_IFRAME_ORIGINS.some(allowed => {
      const allowedOrigin = new URL(allowed).origin;
      return origin === allowedOrigin;
    });
  } catch {
    return false;
  }
}

export const SecureIframe: React.FC<SecureIframeProps> = ({
  src,
  title,
  className = '',
  sandbox = ['allow-scripts', 'allow-same-origin', 'allow-forms', 'allow-popups'],
  allowClipboard = true,
  onLoad,
  onError,
  onStatusChange,
  validateOrigin = true,
  showLoadingState = true,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [key, setKey] = useState(0); // For retry functionality
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Notify status changes
  useEffect(() => {
    if (error) {
      onStatusChange?.('error');
    } else if (isLoading) {
      onStatusChange?.('loading');
    } else {
      onStatusChange?.('connected');
    }
  }, [isLoading, error, onStatusChange]);

  // Validate origin on mount
  useEffect(() => {
    if (validateOrigin && !isOriginAllowed(src)) {
      const errorMsg = `Origin not allowed: ${src}`;
      setError(errorMsg);
      onError?.(new Error(errorMsg));
    }
  }, [src, validateOrigin, onError]);

  // Handle iframe load
  const handleLoad = useCallback(() => {
    setIsLoading(false);
    setError(null);
    onLoad?.();
  }, [onLoad]);

  // Handle iframe error
  const handleError = useCallback(() => {
    const errorMsg = 'Failed to load the application. Please try again.';
    setIsLoading(false);
    setError(errorMsg);
    onError?.(new Error(errorMsg));
  }, [onError]);

  // Retry loading
  const handleRetry = useCallback(() => {
    setIsLoading(true);
    setError(null);
    setKey(prev => prev + 1);
  }, []);

  // Listen for postMessage from iframe (with exact origin validation)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Validate origin with exact matching to prevent subdomain attacks
      const isOriginValid = ALLOWED_IFRAME_ORIGINS.some(allowed => {
        try {
          const allowedOrigin = new URL(allowed).origin;
          return event.origin === allowedOrigin;
        } catch {
          return false;
        }
      });
      
      if (!isOriginValid) {
        securityLogger.warn('Message from unauthorized origin', { origin: event.origin });
        return;
      }

      // Handle specific messages if needed
      // This is where you'd handle communication from the iframe
      securityLogger.debug('Message received from iframe', { data: event.data });
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Build sandbox attribute
  const sandboxValue = sandbox.join(' ');

  // Build allow attribute
  const allowValue = [
    allowClipboard && 'clipboard-read',
    allowClipboard && 'clipboard-write',
  ].filter(Boolean).join('; ');

  // If origin validation failed
  if (error && validateOrigin && !isOriginAllowed(src)) {
    return (
      <div className={`relative ${className}`}>
        <IframeErrorState 
          error="This application cannot be loaded due to security restrictions." 
          onRetry={handleRetry} 
        />
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Loading state */}
      {showLoadingState && isLoading && !error && (
        <IframeLoadingSkeleton />
      )}

      {/* Error state */}
      {error && (
        <IframeErrorState error={error} onRetry={handleRetry} />
      )}

      {/* Iframe */}
      <motion.iframe
        key={key}
        ref={iframeRef}
        src={src}
        title={title}
        className={`w-full h-full border-0 ${isLoading || error ? 'invisible' : 'visible'}`}
        sandbox={sandboxValue}
        allow={allowValue}
        referrerPolicy="strict-origin-when-cross-origin"
        loading="lazy"
        onLoad={handleLoad}
        onError={handleError}
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoading || error ? 0 : 1 }}
        transition={{ duration: 0.3 }}
      />
    </div>
  );
};

export default SecureIframe;
