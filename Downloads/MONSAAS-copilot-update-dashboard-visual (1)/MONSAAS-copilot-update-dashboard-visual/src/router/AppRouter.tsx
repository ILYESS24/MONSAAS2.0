/**
 * App Router
 * 
 * Main router component that renders all application routes.
 */

import { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '@/components/auth';
import { publicRoutes, authRoutes, protectedRoutes } from './routes';
import { ROUTES } from '@/constants';
import { getClerkPublishableKey } from '@/lib/env';

// =============================================================================
// LOADING FALLBACK
// =============================================================================

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-white font-body text-center">
        <div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white/60 text-sm">Loading...</p>
      </div>
    </div>
  );
}

// =============================================================================
// ROUTE RENDERER
// =============================================================================

function renderRoute(route: typeof publicRoutes[0], index: number) {
  const { path, component: Component } = route;
  return <Route key={`${path}-${index}`} path={path} element={<Component />} />;
}

// =============================================================================
// APP ROUTER
// =============================================================================

export function AppRouter() {
  const hasAuth = !!getClerkPublishableKey();

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* Public Routes */}
        {publicRoutes.map((route, index) => renderRoute(route, index))}
        
        {/* Auth Routes */}
        {authRoutes.map((route, index) => renderRoute(route, index))}
        
        {/* Protected Routes */}
        {hasAuth ? (
          <Route element={<ProtectedRoute />}>
            {protectedRoutes.map((route, index) => renderRoute(route, index))}
          </Route>
        ) : (
          /* Demo mode - routes accessible without auth */
          protectedRoutes.map((route, index) => renderRoute(route, index))
        )}
        
        {/* 404 Redirect */}
        <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
      </Routes>
    </Suspense>
  );
}

export default AppRouter;
