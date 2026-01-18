/**
 * useAnalytics Hook
 * 
 * Provides analytics tracking for user interactions and page views.
 * In production, this would integrate with analytics services like
 * Google Analytics, Mixpanel, or Amplitude.
 */

import { useCallback, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { logger } from '@/lib/logger';

// Event types
export type AnalyticsEventType =
  | 'page_view'
  | 'button_click'
  | 'form_submit'
  | 'tool_opened'
  | 'tool_closed'
  | 'search'
  | 'error'
  | 'custom';

export interface AnalyticsEvent {
  type: AnalyticsEventType;
  name: string;
  properties?: Record<string, unknown>;
  timestamp: number;
}

// Performance metrics
export interface PerformanceMetrics {
  pageLoadTime: number;
  domContentLoaded: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  timeToInteractive: number;
}

// Store for events (in production, these would be sent to an analytics service)
const eventQueue: AnalyticsEvent[] = [];
const MAX_QUEUE_SIZE = 100;

/**
 * Add event to queue (batch processing)
 */
function queueEvent(event: AnalyticsEvent): void {
  eventQueue.push(event);
  
  // Keep queue size manageable
  if (eventQueue.length > MAX_QUEUE_SIZE) {
    eventQueue.shift();
  }
  
  // In production, you would flush events to your analytics service
  logger.debug('Analytics event queued', { type: event.type, name: event.name });
}

/**
 * Flush events to analytics service
 * NOTE: In production, implement actual API call here
 */
async function flushEvents(): Promise<void> {
  if (eventQueue.length === 0) return;
  
  const events = [...eventQueue];
  eventQueue.length = 0;
  
  // Simulate sending to analytics service
  logger.info('Analytics events flushed', { count: events.length });
  
  // In production:
  // await fetch('/api/analytics', {
  //   method: 'POST',
  //   body: JSON.stringify({ events }),
  // });
}

/**
 * Hook for tracking analytics events
 */
export function useAnalytics() {
  const location = useLocation();
  const lastPathRef = useRef<string>('');

  // Track page views
  useEffect(() => {
    if (location.pathname !== lastPathRef.current) {
      lastPathRef.current = location.pathname;
      
      queueEvent({
        type: 'page_view',
        name: location.pathname,
        properties: {
          path: location.pathname,
          search: location.search,
          referrer: document.referrer,
        },
        timestamp: Date.now(),
      });
    }
  }, [location]);

  // Track custom events
  const track = useCallback((
    name: string,
    properties?: Record<string, unknown>
  ) => {
    queueEvent({
      type: 'custom',
      name,
      properties,
      timestamp: Date.now(),
    });
  }, []);

  // Track button clicks
  const trackClick = useCallback((
    buttonName: string,
    properties?: Record<string, unknown>
  ) => {
    queueEvent({
      type: 'button_click',
      name: buttonName,
      properties,
      timestamp: Date.now(),
    });
  }, []);

  // Track form submissions
  const trackFormSubmit = useCallback((
    formName: string,
    properties?: Record<string, unknown>
  ) => {
    queueEvent({
      type: 'form_submit',
      name: formName,
      properties,
      timestamp: Date.now(),
    });
  }, []);

  // Track tool usage
  const trackToolOpen = useCallback((
    toolName: string,
    properties?: Record<string, unknown>
  ) => {
    queueEvent({
      type: 'tool_opened',
      name: toolName,
      properties,
      timestamp: Date.now(),
    });
  }, []);

  const trackToolClose = useCallback((
    toolName: string,
    properties?: Record<string, unknown>
  ) => {
    queueEvent({
      type: 'tool_closed',
      name: toolName,
      properties,
      timestamp: Date.now(),
    });
  }, []);

  // Track search
  const trackSearch = useCallback((
    query: string,
    resultsCount: number
  ) => {
    queueEvent({
      type: 'search',
      name: 'search',
      properties: { query, resultsCount },
      timestamp: Date.now(),
    });
  }, []);

  // Track errors
  const trackError = useCallback((
    errorName: string,
    errorDetails?: Record<string, unknown>
  ) => {
    queueEvent({
      type: 'error',
      name: errorName,
      properties: errorDetails,
      timestamp: Date.now(),
    });
  }, []);

  // Flush events on unmount
  useEffect(() => {
    return () => {
      flushEvents();
    };
  }, []);

  return {
    track,
    trackClick,
    trackFormSubmit,
    trackToolOpen,
    trackToolClose,
    trackSearch,
    trackError,
    flushEvents,
  };
}

/**
 * Hook for Web Vitals performance monitoring
 */
export function usePerformanceMonitoring() {
  useEffect(() => {
    // Only run in browser
    if (typeof window === 'undefined') return;

    const reportPerformance = () => {
      const navigationEntries = performance.getEntriesByType('navigation');
      
      // Check if entries exist before accessing
      if (navigationEntries && navigationEntries.length > 0) {
        const navigation = navigationEntries[0] as PerformanceNavigationTiming;
        
        const metrics = {
          pageLoadTime: navigation.loadEventEnd - navigation.startTime,
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.startTime,
          domInteractive: navigation.domInteractive - navigation.startTime,
          redirectTime: navigation.redirectEnd - navigation.redirectStart,
          dnsLookup: navigation.domainLookupEnd - navigation.domainLookupStart,
          tcpConnection: navigation.connectEnd - navigation.connectStart,
          serverResponse: navigation.responseEnd - navigation.requestStart,
        };

        logger.info('Performance metrics', metrics);
      }
    };

    // Report after page load
    if (document.readyState === 'complete') {
      reportPerformance();
    } else {
      window.addEventListener('load', reportPerformance);
      return () => window.removeEventListener('load', reportPerformance);
    }
  }, []);
}

export default {
  useAnalytics,
  usePerformanceMonitoring,
};
