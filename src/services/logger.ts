 
// ============================================
// PRODUCTION LOGGING SERVICE
// Remplace console.log par logging structuré
// ============================================

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'security';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  userId?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  context?: Record<string, unknown>;
  stack?: string;
}

class Logger {
  private isProduction = import.meta.env.PROD;
  private logQueue: LogEntry[] = [];
  private batchSize = 10;
  private flushInterval = 30000; // 30 secondes

  constructor() {
    // Flush automatique toutes les 30 secondes en production
    if (this.isProduction) {
      setInterval(() => this.flush(), this.flushInterval);
    }
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      userId: this.getUserId(),
      sessionId: this.getSessionId(),
      ipAddress: this.getClientIP(),
      userAgent: navigator.userAgent,
      context
    };
  }

  private getUserId(): string | undefined {
    // Essayer de récupérer l'ID utilisateur depuis Clerk ou localStorage
    try {
      const clerkUser = localStorage.getItem('clerk-user');
      if (clerkUser) {
        const user = JSON.parse(clerkUser);
        return user.id;
      }
    } catch {
      // Ignore errors
    }
    return undefined;
  }

  private getSessionId(): string | undefined {
    // Générer un ID de session basé sur la session browser
    try {
      let sessionId = sessionStorage.getItem('sessionId');
      if (!sessionId) {
        sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        sessionStorage.setItem('sessionId', sessionId);
      }
      return sessionId;
    } catch {
      return undefined;
    }
  }

  private getClientIP(): string | undefined {
    // Note: L'IP client n'est pas accessible côté frontend
    // Elle serait récupérée côté serveur via les logs Cloudflare
    return undefined;
  }

  private async flush() {
    if (this.logQueue.length === 0) return;

    try {
      // En développement, afficher dans console
      if (!this.isProduction) {
        console.group(`🚀 Flushing ${this.logQueue.length} logs`);
        this.logQueue.forEach(log => {
          const color = {
            debug: '\x1b[36m',    // Cyan
            info: '\x1b[32m',     // Green
            warn: '\x1b[33m',     // Yellow
            error: '\x1b[31m',    // Red
            security: '\x1b[35m'  // Magenta
          }[log.level];

          console.debug(`${color}[${log.level.toUpperCase()}] ${log.timestamp} - ${log.message}`, log.context || '');
        });
        console.groupEnd();
      }

      // En production, envoyer à un service de logging
      // TODO: Implémenter l'envoi vers un service comme LogRocket, Sentry, ou API personnalisée
      if (this.isProduction) {
        await this.sendToLoggingService(this.logQueue);
      }

      this.logQueue = [];
    } catch (error) {
      console.error('Failed to flush logs:', error);
    }
  }

  private async sendToLoggingService(logs: LogEntry[]) {
    try {
      // Exemple d'envoi vers une API de logging
      // Remplacer par votre service de logging (Sentry, LogRocket, etc.)
      const response = await fetch('/api/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ logs }),
      });

      if (!response.ok) {
        console.warn('Failed to send logs to logging service');
      }
    } catch (error) {
      console.warn('Logging service unavailable:', error);
    }
  }

  // ============================================
  // MÉTHODES PUBLIQUES DE LOGGING
  // ============================================

  debug(message: string, context?: Record<string, unknown>) {
    const entry = this.createLogEntry('debug', message, context);
    this.logQueue.push(entry);

    if (!this.isProduction) {
      console.debug(`🐛 ${message}`, context || '');
    }

    if (this.logQueue.length >= this.batchSize) {
      this.flush();
    }
  }

  info(message: string, context?: Record<string, unknown>) {
    const entry = this.createLogEntry('info', message, context);
    this.logQueue.push(entry);

    if (!this.isProduction) {
      console.info(`ℹ️ ${message}`, context || '');
    }

    if (this.logQueue.length >= this.batchSize) {
      this.flush();
    }
  }

  warn(message: string, context?: Record<string, unknown>) {
    const entry = this.createLogEntry('warn', message, context);
    this.logQueue.push(entry);

    if (!this.isProduction) {
      console.warn(`⚠️ ${message}`, context || '');
    }

    // Flush immédiatement pour les warnings
    this.flush();
  }

  error(message: string, error?: Error | unknown, context?: Record<string, unknown>) {
    const errorObj = error as Error | undefined;
    const fullContext = {
      ...context,
      error: errorObj?.message,
      stack: errorObj?.stack
    };

    const entry = this.createLogEntry('error', message, fullContext);
    this.logQueue.push(entry);

    if (!this.isProduction) {
      console.error(`❌ ${message}`, error, context || '');
    }

    // Flush immédiatement pour les erreurs
    this.flush();
  }

  security(message: string, context?: Record<string, unknown>) {
    const entry = this.createLogEntry('security', message, context);
    this.logQueue.push(entry);

    if (!this.isProduction) {
      console.error(`🔒 SECURITY: ${message}`, context || '');
    }

    // Flush immédiatement pour les événements de sécurité
    this.flush();
  }

  // ============================================
  // MÉTHODES UTILITAIRES
  // ============================================

  // Log d'événement utilisateur
  userAction(action: string, details?: Record<string, unknown>) {
    this.info(`User Action: ${action}`, {
      action,
      ...details
    });
  }

  // Log d'événement métier
  businessEvent(event: string, data?: Record<string, unknown>) {
    this.info(`Business Event: ${event}`, {
      event,
      ...data
    });
  }

  // Log de performance
  performance(metric: string, value: number, context?: Record<string, unknown>) {
    this.info(`Performance: ${metric}`, {
      metric,
      value,
      ...context
    });
  }
}

// Instance globale du logger
export const logger = new Logger();

// ============================================
// HELPERS POUR REMPLACER CONSOLE.LOG
// ============================================

// Remplacement des console.log existants
// Note: Cette fonction utilise les méthodes publiques du logger
export const replaceConsoleLogs = () => {
  if (import.meta.env.PROD) {
    const originalConsole = { ...console };

    console.log = (...args) => {
      logger.debug(args.join(' '));
      originalConsole.log(...args);
    };

    console.info = (...args) => {
      logger.info(args.join(' '));
      originalConsole.info(...args);
    };

    console.warn = (...args) => {
      logger.warn(args.join(' '));
      originalConsole.warn(...args);
    };

    console.error = (...args) => {
      logger.error(args.join(' '));
      originalConsole.error(...args);
    };
  }
};
