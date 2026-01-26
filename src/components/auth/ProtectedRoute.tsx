/**
 * ProtectedRoute Component
 *
 * This component protects routes that require authentication.
 * It handles loading states and redirects unauthenticated users
 * to the sign-in page without flashing protected content.
 */

import { useAuth } from "@clerk/clerk-react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { isAuthConfigured } from "@/lib/env";
import { authLogger } from "@/lib/logger";

// Loading component shown while auth state is being determined
const AuthLoading = () => (
  <div className="min-h-screen bg-black flex items-center justify-center">
    <div className="text-white font-body text-center">
      <div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />
      <p className="text-white/60 text-sm">Verification de l'authentification...</p>
    </div>
  </div>
);

// Unauthorized access component
const UnauthorizedAccess = () => (
  <div className="min-h-screen bg-black flex items-center justify-center">
    <div className="text-white font-body text-center max-w-md px-6">
      <div className="w-16 h-16 border-2 border-red-500/50 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h1 className="text-2xl font-bold mb-2">Accès refusé</h1>
      <p className="text-white/60 mb-6">
        Vous devez être connecté pour accéder à cette page.
      </p>
      <a
        href="/sign-in"
        className="inline-block bg-white text-black px-6 py-3 rounded-xl font-medium hover:bg-white/90 transition-colors"
      >
        Se connecter
      </a>
    </div>
  </div>
);

interface ProtectedRouteProps {
  children?: React.ReactNode;
  requireAuth?: boolean;
}

// Component that uses Clerk auth hooks - only rendered when auth is configured
const ProtectedRouteWithAuth: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true
}) => {
  const location = useLocation();
  const { isSignedIn, isLoaded } = useAuth();

  // Show loading while auth state is being determined
  if (!isLoaded) {
    return <AuthLoading />;
  }

  // If authentication is required and user is not signed in
  if (requireAuth && !isSignedIn) {
    // Redirect to sign-in with return URL
    return <Navigate to="/sign-in" state={{ from: location }} replace />;
  }

  // User is authenticated, render the protected content
  return children ? <>{children}</> : <Outlet />;
};

// Standalone mode component - no auth required
const ProtectedRouteStandalone: React.FC<ProtectedRouteProps> = ({
  children
}) => {
  // In development without auth, allow access with warning
  if (import.meta.env.DEV) {
    authLogger.warn('Auth not configured - running in standalone mode');
    return children ? <>{children}</> : <Outlet />;
  }
  // In production without auth, deny access
  return <UnauthorizedAccess />;
};

export const ProtectedRoute: React.FC<ProtectedRouteProps> = (props) => {
  // Check auth configuration BEFORE calling any hooks
  const authConfigured = isAuthConfigured();
  
  if (!authConfigured) {
    return <ProtectedRouteStandalone {...props} />;
  }
  
  return <ProtectedRouteWithAuth {...props} />;
};

// Higher-order component version for wrapping components
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  requireAuth = true
): React.FC<P> {
  return function AuthenticatedComponent(props: P) {
    return (
      <ProtectedRoute requireAuth={requireAuth}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}

export default ProtectedRoute;
