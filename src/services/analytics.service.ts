/**
 * Analytics Service
 * 
 * Centralized analytics tracking for the application.
 */

import { logger } from '@/lib/logger';
import { ANALYTICS_EVENTS } from '@/constants';
import { FEATURES } from '@/config';

// =============================================================================
// TYPES
// =============================================================================

interface EventProperties {
  [key: string]: string | number | boolean | undefined;
}

interface PageViewData {
  path: string;
  title?: string;
  referrer?: string;
}

interface UserProperties {
  userId?: string;
  email?: string;
  name?: string;
  plan?: string;
  [key: string]: string | undefined;
}

// =============================================================================
// ANALYTICS SERVICE
// =============================================================================

class AnalyticsService {
  private isEnabled: boolean;
  private userProperties: UserProperties = {};

  constructor() {
    this.isEnabled = FEATURES.ANALYTICS_ENABLED;
    
    if (this.isEnabled) {
      logger.info('Analytics service initialized');
    } else {
      logger.debug('Analytics service disabled');
    }
  }

  /**
   * Set user properties for all subsequent events
   */
  identify(properties: UserProperties): void {
    if (!this.isEnabled) return;
    
    this.userProperties = { ...this.userProperties, ...properties };
    logger.debug('User identified', { userId: properties.userId });
    
    // Send to analytics provider
    this.sendToProvider('identify', properties);
  }

  /**
   * Track a page view
   */
  pageView(data: PageViewData): void {
    if (!this.isEnabled) return;
    
    const eventData = {
      ...data,
      timestamp: new Date().toISOString(),
      ...this.userProperties,
    };
    
    logger.debug('Page view', { path: data.path });
    this.sendToProvider('pageView', eventData);
  }

  /**
   * Track a custom event
   */
  track(eventName: string, properties?: EventProperties): void {
    if (!this.isEnabled) return;
    
    const eventData = {
      event: eventName,
      properties: properties || {},
      timestamp: new Date().toISOString(),
      ...this.userProperties,
    };
    
    logger.debug('Event tracked', { event: eventName });
    this.sendToProvider('track', eventData);
  }

  // ==========================================================================
  // CONVENIENCE METHODS
  // ==========================================================================

  /**
   * Track user sign in
   */
  trackSignIn(userId: string, method: string = 'email'): void {
    this.identify({ userId });
    this.track(ANALYTICS_EVENTS.USER_SIGN_IN, { method });
  }

  /**
   * Track user sign up
   */
  trackSignUp(userId: string, method: string = 'email'): void {
    this.identify({ userId });
    this.track(ANALYTICS_EVENTS.USER_SIGN_UP, { method });
  }

  /**
   * Track user sign out
   */
  trackSignOut(): void {
    this.track(ANALYTICS_EVENTS.USER_SIGN_OUT);
    this.userProperties = {};
  }

  /**
   * Track tool opened
   */
  trackToolOpened(toolName: string): void {
    this.track(ANALYTICS_EVENTS.TOOL_OPENED, { toolName });
  }

  /**
   * Track tool closed
   */
  trackToolClosed(toolName: string, duration?: number): void {
    this.track(ANALYTICS_EVENTS.TOOL_CLOSED, { toolName, duration });
  }

  /**
   * Track quick action clicked
   */
  trackQuickAction(actionName: string): void {
    this.track(ANALYTICS_EVENTS.QUICK_ACTION_CLICKED, { actionName });
  }

  /**
   * Track error occurred
   */
  trackError(error: Error, context?: string): void {
    this.track(ANALYTICS_EVENTS.ERROR_OCCURRED, {
      errorName: error.name,
      errorMessage: error.message,
      context,
    });
  }

  // ==========================================================================
  // PRIVATE METHODS
  // ==========================================================================

  /**
   * Send data to the analytics provider
   * In production, this would integrate with Google Analytics, Mixpanel, etc.
   */
  private sendToProvider(type: string, data: Record<string, unknown>): void {
    // In development, just log
    if (import.meta.env.DEV) {
      logger.debug(`Analytics [${type}]`, data);
      return;
    }

    // Production: Send to analytics provider
    // Example: Google Analytics
    if (typeof window !== 'undefined' && 'gtag' in window) {
      const gtag = (window as { gtag?: (...args: unknown[]) => void }).gtag;
      if (type === 'pageView' && gtag) {
        gtag('event', 'page_view', data);
      } else if (type === 'track' && gtag) {
        const eventData = data as { event: string; properties?: EventProperties };
        gtag('event', eventData.event, eventData.properties);
      }
    }
  }
}

// =============================================================================
// SINGLETON EXPORT
// =============================================================================

export const analyticsService = new AnalyticsService();

export default analyticsService;
