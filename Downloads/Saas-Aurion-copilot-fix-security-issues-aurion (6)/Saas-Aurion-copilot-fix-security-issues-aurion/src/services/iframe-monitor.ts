// ============================================
// MONITORING DES IFRAMES
// Métriques de performance et d'utilisation
// ============================================

import { logger } from '@/services/logger';

interface IframeMetrics {
  toolId: string;
  userId: string;
  loadTime: number;
  errorCount: number;
  sessionDuration: number;
  creditsConsumed: number;
  timestamp: number;
  origin: string;
  userAgent: string;
}

class IframeMonitor {
  private metrics: IframeMetrics[] = [];
  private batchSize = 10;

  recordMetric(metric: Omit<IframeMetrics, 'timestamp'>) {
    const fullMetric: IframeMetrics = {
      ...metric,
      timestamp: Date.now()
    };

    this.metrics.push(fullMetric);

    // Flush automatiquement si batch size atteint
    if (this.metrics.length >= this.batchSize) {
      this.flush();
    }
  }

  recordLoadTime(toolId: string, userId: string, loadTime: number, origin: string) {
    this.recordMetric({
      toolId,
      userId,
      loadTime,
      errorCount: 0,
      sessionDuration: 0,
      creditsConsumed: 0,
      origin,
      userAgent: navigator.userAgent
    });
  }

  recordError(toolId: string, userId: string, _error: string, origin: string) {
    // Trouver la métrique existante ou créer une nouvelle
    const existingMetric = this.metrics.find(m =>
      m.toolId === toolId && m.userId === userId && m.errorCount === 0
    );

    if (existingMetric) {
      existingMetric.errorCount++;
    } else {
      this.recordMetric({
        toolId,
        userId,
        loadTime: 0,
        errorCount: 1,
        sessionDuration: 0,
        creditsConsumed: 0,
        origin,
        userAgent: navigator.userAgent
      });
    }
  }

  recordSessionEnd(toolId: string, userId: string, sessionDuration: number, creditsConsumed: number, origin: string) {
    this.recordMetric({
      toolId,
      userId,
      loadTime: 0,
      errorCount: 0,
      sessionDuration,
      creditsConsumed,
      origin,
      userAgent: navigator.userAgent
    });
  }

  private async flush() {
    if (this.metrics.length === 0) return;

    try {
      // Envoyer les métriques au backend pour logging
      const response = await fetch('/api/log-iframe-metrics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Note: Auth header sera ajouté automatiquement par les intercepteurs
        },
        body: JSON.stringify({
          metrics: this.metrics,
          clientVersion: '1.0.0'
        })
      });

      if (response.ok) {
        logger.debug('[IframeMonitor] Flushed metrics', { count: this.metrics.length });
        this.metrics = [];
      } else {
        logger.warn('[IframeMonitor] Failed to flush metrics', { status: response.status });
        // Garder les métriques pour retry plus tard
      }
    } catch (error) {
      logger.error('[IframeMonitor] Failed to flush iframe metrics', error);
      // En cas d'erreur réseau, garder les métriques pour retry
    }
  }

  // Force flush (utile avant unload de page)
  async forceFlush() {
    if (this.metrics.length > 0) {
      await this.flush();
    }
  }

  // Statistiques en temps réel
  getStats() {
    const totalMetrics = this.metrics.length;
    const errors = this.metrics.filter(m => m.errorCount > 0).length;
    const avgLoadTime = this.metrics.reduce((sum, m) => sum + m.loadTime, 0) / Math.max(1, this.metrics.length);

    return {
      pendingMetrics: totalMetrics,
      errorRate: totalMetrics > 0 ? (errors / totalMetrics) * 100 : 0,
      avgLoadTime: Math.round(avgLoadTime),
      toolsUsed: [...new Set(this.metrics.map(m => m.toolId))]
    };
  }
}

// Instance globale
export const iframeMonitor = new IframeMonitor();

// Cleanup automatique avant unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    iframeMonitor.forceFlush();
  });
}
