import { useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

// Types pour les métriques Core Web Vitals
type MetricName = 'CLS' | 'FCP' | 'FID' | 'LCP' | 'TTFB';

interface WebVitalsMetric {
  name: MetricName;
  value: number;
  delta: number;
  id: string;
  entries: PerformanceEntry[];
}

// Hook pour optimiser les Core Web Vitals
export const useCoreWebVitals = () => {
  const location = useLocation();

  // Fonction pour envoyer les métriques (peut être étendu pour analytics)
  const reportWebVitals = useCallback((metric: WebVitalsMetric) => {
    // Log des métriques pour le développement
    console.log(`📊 Core Web Vitals - ${metric.name}:`, {
      value: metric.value,
      delta: metric.delta,
      path: location.pathname,
    });

    // Ici vous pouvez envoyer les métriques à votre service d'analytics
    // Exemple: gtag('event', metric.name, { value: metric.value });

    // Seuils recommandés par Google:
    const thresholds = {
      LCP: { good: 2500, needsImprovement: 4000 }, // ms
      FID: { good: 100, needsImprovement: 300 },   // ms
      CLS: { good: 0.1, needsImprovement: 0.25 },  // score
      FCP: { good: 1800, needsImprovement: 3000 }, // ms
      TTFB: { good: 800, needsImprovement: 1800 }, // ms
    };

    const threshold = thresholds[metric.name];
    if (threshold) {
      const status = metric.value <= threshold.good ? 'good' :
                    metric.value <= threshold.needsImprovement ? 'needs-improvement' : 'poor';

      console.log(`🎯 ${metric.name} Status: ${status} (${metric.value}${metric.name === 'CLS' ? '' : 'ms'})`);
    }
  }, [location.pathname]);

  // Fonction pour mesurer le LCP (Largest Contentful Paint)
  const measureLCP = useCallback(() => {
    let lcpValue = 0;
    let lcpEntry: PerformanceEntry | null = null;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1] as any;

      if (lastEntry.startTime > lcpValue) {
        lcpValue = lastEntry.startTime;
        lcpEntry = lastEntry;

        reportWebVitals({
          name: 'LCP',
          value: lcpValue,
          delta: lcpValue,
          id: 'lcp',
          entries: [lastEntry],
        });
      }
    });

    try {
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (error) {
      // Fallback pour les navigateurs qui ne supportent pas LCP
      console.log('LCP not supported in this browser');
    }

    return () => observer.disconnect();
  }, [reportWebVitals]);

  // Fonction pour mesurer le FID (First Input Delay)
  const measureFID = useCallback(() => {
    let fidValue = 0;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        if (entry.processingStart && entry.processingStart > fidValue) {
          fidValue = entry.processingStart - entry.startTime;

          reportWebVitals({
            name: 'FID',
            value: fidValue,
            delta: fidValue,
            id: 'fid',
            entries: [entry],
          });
        }
      });
    });

    try {
      observer.observe({ entryTypes: ['first-input'] });
    } catch (error) {
      console.log('FID not supported in this browser');
    }

    return () => observer.disconnect();
  }, [reportWebVitals]);

  // Fonction pour mesurer le CLS (Cumulative Layout Shift)
  const measureCLS = useCallback(() => {
    let clsValue = 0;
    let clsEntries: PerformanceEntry[] = [];

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
          clsEntries.push(entry);
        }
      });

      reportWebVitals({
        name: 'CLS',
        value: clsValue,
        delta: clsValue,
        id: 'cls',
        entries: clsEntries,
      });
    });

    try {
      observer.observe({ entryTypes: ['layout-shift'] });
    } catch (error) {
      console.log('CLS not supported in this browser');
    }

    return () => observer.disconnect();
  }, [reportWebVitals]);

  // Fonction pour mesurer le FCP (First Contentful Paint)
  const measureFCP = useCallback(() => {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        reportWebVitals({
          name: 'FCP',
          value: entry.startTime,
          delta: entry.startTime,
          id: 'fcp',
          entries: [entry],
        });
      });
    });

    try {
      observer.observe({ entryTypes: ['paint'] });
    } catch (error) {
      console.log('FCP not supported in this browser');
    }

    return () => observer.disconnect();
  }, [reportWebVitals]);

  // Fonction pour mesurer le TTFB (Time to First Byte)
  const measureTTFB = useCallback(() => {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        reportWebVitals({
          name: 'TTFB',
          value: entry.responseStart - entry.requestStart,
          delta: entry.responseStart - entry.requestStart,
          id: 'ttfb',
          entries: [entry],
        });
      });
    });

    try {
      observer.observe({ entryTypes: ['navigation'] });
    } catch (error) {
      console.log('TTFB not supported in this browser');
    }

    return () => observer.disconnect();
  }, [reportWebVitals]);

  // Initialiser toutes les mesures
  useEffect(() => {
    // Mesurer les métriques seulement en production pour éviter le bruit en dev
    if (import.meta.env.PROD) {
      const cleanupLCP = measureLCP();
      const cleanupFID = measureFID();
      const cleanupCLS = measureCLS();
      const cleanupFCP = measureFCP();
      const cleanupTTFB = measureTTFB();

      return () => {
        cleanupLCP?.();
        cleanupFID?.();
        cleanupCLS?.();
        cleanupFCP?.();
        cleanupTTFB?.();
      };
    }
  }, [measureLCP, measureFID, measureCLS, measureFCP, measureTTFB]);

  // Fonction pour forcer le recalcul des métriques (utile pour les tests)
  const recalculateMetrics = useCallback(() => {
    // Forcer un recalcul en simulant une navigation
    if (window.performance && window.performance.mark) {
      window.performance.mark('metric-recalculation');
    }
  }, []);

  return {
    reportWebVitals,
    recalculateMetrics,
  };
};
