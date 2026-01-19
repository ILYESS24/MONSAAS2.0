/**
 * Auth Service
 * 
 * Authentication service wrapper for Clerk.
 * Provides a consistent interface for auth operations.
 */

import { logger, securityLogger } from '@/lib/logger';
import { AUTH_CONFIG } from '@/config';
import { analyticsService } from './analytics.service';

// =============================================================================
// TYPES
// =============================================================================

export interface AuthUser {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  fullName: string | null;
  imageUrl: string | null;
  createdAt: Date;
}

export interface AuthSession {
  id: string;
  userId: string;
  status: 'active' | 'expired' | 'revoked';
  lastActiveAt: Date;
  expireAt: Date;
}

// =============================================================================
// AUTH SERVICE
// =============================================================================

class AuthService {
  /**
   * Get the sign in path
   */
  getSignInPath(): string {
    return AUTH_CONFIG.SIGN_IN_PATH;
  }

  /**
   * Get the sign up path
   */
  getSignUpPath(): string {
    return AUTH_CONFIG.SIGN_UP_PATH;
  }

  /**
   * Get the redirect path after sign in
   */
  getAfterSignInPath(): string {
    return AUTH_CONFIG.AFTER_SIGN_IN_PATH;
  }

  /**
   * Get the redirect path after sign up
   */
  getAfterSignUpPath(): string {
    return AUTH_CONFIG.AFTER_SIGN_UP_PATH;
  }

  /**
   * Handle successful sign in
   */
  onSignIn(user: AuthUser): void {
    logger.info('User signed in', { userId: user.id });
    securityLogger.info('Authentication successful', { userId: user.id });
    analyticsService.trackSignIn(user.id);
  }

  /**
   * Handle successful sign up
   */
  onSignUp(user: AuthUser): void {
    logger.info('User signed up', { userId: user.id });
    securityLogger.info('New user registered', { userId: user.id });
    analyticsService.trackSignUp(user.id);
  }

  /**
   * Handle sign out
   */
  onSignOut(userId: string): void {
    logger.info('User signed out', { userId });
    securityLogger.info('User session ended', { userId });
    analyticsService.trackSignOut();
  }

  /**
   * Handle authentication error
   */
  onAuthError(error: Error, context?: string): void {
    securityLogger.error('Authentication error', {
      error: error.message,
      context,
    });
    analyticsService.trackError(error, context);
  }

  /**
   * Check if a path requires authentication
   */
  isProtectedPath(path: string): boolean {
    const protectedPaths = [
      '/dashboard',
      '/code-editor',
      '/intelligent-canvas',
      '/app-builder',
      '/text-editor',
      '/agent-ai',
      '/aurion-chat',
    ];
    
    return protectedPaths.some(
      protectedPath => path === protectedPath || path.startsWith(`${protectedPath}/`)
    );
  }

  /**
   * Check if a path is an auth path (sign in/up)
   */
  isAuthPath(path: string): boolean {
    return path.startsWith(AUTH_CONFIG.SIGN_IN_PATH) || 
           path.startsWith(AUTH_CONFIG.SIGN_UP_PATH);
  }
}

// =============================================================================
// SINGLETON EXPORT
// =============================================================================

export const authService = new AuthService();

export default authService;
