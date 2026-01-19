/**
 * Security Audit Trail Module
 * 
 * Provides comprehensive security event logging and audit trail
 * for compliance (RGPD, SOC2) and security monitoring.
 * 
 * @module security/audit
 */

// =============================================================================
// TYPES
// =============================================================================

export type SecurityEventType =
  | 'AUTH_LOGIN_SUCCESS'
  | 'AUTH_LOGIN_FAILURE'
  | 'AUTH_LOGOUT'
  | 'AUTH_MFA_SUCCESS'
  | 'AUTH_MFA_FAILURE'
  | 'AUTH_PASSWORD_CHANGE'
  | 'AUTH_PASSWORD_RESET_REQUEST'
  | 'AUTH_PASSWORD_RESET_COMPLETE'
  | 'AUTH_SESSION_EXPIRED'
  | 'AUTH_TOKEN_REFRESH'
  | 'AUTH_TOKEN_REVOKED'
  | 'ACCESS_DENIED'
  | 'ACCESS_GRANTED'
  | 'DATA_ACCESS'
  | 'DATA_MODIFICATION'
  | 'DATA_DELETION'
  | 'DATA_EXPORT'
  | 'RATE_LIMIT_EXCEEDED'
  | 'SUSPICIOUS_ACTIVITY'
  | 'SECURITY_ALERT'
  | 'ADMIN_ACTION'
  | 'CONFIGURATION_CHANGE'
  | 'ERROR'
  | 'CUSTOM';

export type SecurityEventSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface SecurityEvent {
  id: string;
  timestamp: number;
  type: SecurityEventType;
  severity: SecurityEventSeverity;
  userId?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  resource?: string;
  action?: string;
  outcome: 'success' | 'failure' | 'blocked';
  details?: Record<string, unknown>;
  metadata?: {
    deviceFingerprint?: string;
    geoLocation?: {
      country?: string;
      city?: string;
      latitude?: number;
      longitude?: number;
    };
    requestId?: string;
  };
}

export interface AuditConfig {
  maxEvents?: number;
  retentionDays?: number;
  enableConsoleLog?: boolean;
  enableRemoteLogging?: boolean;
  remoteEndpoint?: string;
  batchSize?: number;
  flushInterval?: number;
}

export interface AuditSummary {
  totalEvents: number;
  byType: Record<SecurityEventType, number>;
  bySeverity: Record<SecurityEventSeverity, number>;
  byOutcome: Record<string, number>;
  recentFailures: SecurityEvent[];
  suspiciousPatterns: string[];
}

// =============================================================================
// CONSTANTS
// =============================================================================

const DEFAULT_CONFIG: Required<AuditConfig> = {
  maxEvents: 10000,
  retentionDays: 90,
  enableConsoleLog: import.meta.env.DEV,
  enableRemoteLogging: false,
  remoteEndpoint: '',
  batchSize: 50,
  flushInterval: 30000, // 30 seconds
};

const SEVERITY_LEVELS: Record<SecurityEventType, SecurityEventSeverity> = {
  AUTH_LOGIN_SUCCESS: 'low',
  AUTH_LOGIN_FAILURE: 'medium',
  AUTH_LOGOUT: 'low',
  AUTH_MFA_SUCCESS: 'low',
  AUTH_MFA_FAILURE: 'high',
  AUTH_PASSWORD_CHANGE: 'medium',
  AUTH_PASSWORD_RESET_REQUEST: 'medium',
  AUTH_PASSWORD_RESET_COMPLETE: 'medium',
  AUTH_SESSION_EXPIRED: 'low',
  AUTH_TOKEN_REFRESH: 'low',
  AUTH_TOKEN_REVOKED: 'medium',
  ACCESS_DENIED: 'high',
  ACCESS_GRANTED: 'low',
  DATA_ACCESS: 'low',
  DATA_MODIFICATION: 'medium',
  DATA_DELETION: 'high',
  DATA_EXPORT: 'high',
  RATE_LIMIT_EXCEEDED: 'medium',
  SUSPICIOUS_ACTIVITY: 'critical',
  SECURITY_ALERT: 'critical',
  ADMIN_ACTION: 'high',
  CONFIGURATION_CHANGE: 'high',
  ERROR: 'medium',
  CUSTOM: 'low',
};

// =============================================================================
// AUDIT LOGGER CLASS
// =============================================================================

/**
 * Security Audit Logger
 * 
 * Comprehensive security event logging for compliance and monitoring.
 * 
 * @example
 * ```typescript
 * const auditLogger = new AuditLogger();
 * 
 * // Log a login success
 * auditLogger.log({
 *   type: 'AUTH_LOGIN_SUCCESS',
 *   userId: 'user123',
 *   outcome: 'success'
 * });
 * 
 * // Get audit summary
 * const summary = auditLogger.getSummary();
 * ```
 */
export class AuditLogger {
  private config: Required<AuditConfig>;
  private events: SecurityEvent[] = [];
  private pendingBatch: SecurityEvent[] = [];
  private flushTimer: ReturnType<typeof setInterval> | null = null;

  constructor(config?: AuditConfig) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.loadFromStorage();
    this.startFlushTimer();
  }

  /**
   * Log a security event
   */
  log(event: Omit<SecurityEvent, 'id' | 'timestamp' | 'severity'>): SecurityEvent {
    const fullEvent: SecurityEvent = {
      id: this.generateEventId(),
      timestamp: Date.now(),
      severity: event.type ? SEVERITY_LEVELS[event.type] : 'low',
      ...event,
    };

    this.events.push(fullEvent);
    this.pendingBatch.push(fullEvent);

    // Console log in dev mode
    if (this.config.enableConsoleLog) {
      this.consoleLog(fullEvent);
    }

    // Trim events if exceeding max
    if (this.events.length > this.config.maxEvents) {
      this.events = this.events.slice(-this.config.maxEvents);
    }

    // Remove old events
    this.pruneOldEvents();

    // Save to storage
    this.saveToStorage();

    // Check for suspicious patterns
    this.checkSuspiciousPatterns(fullEvent);

    return fullEvent;
  }

  /**
   * Generate unique event ID
   */
  private generateEventId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 10);
    return `${timestamp}-${random}`;
  }

  /**
   * Console log with color coding
   */
  private consoleLog(event: SecurityEvent): void {
    const colors: Record<SecurityEventSeverity, string> = {
      low: '\x1b[32m',      // Green
      medium: '\x1b[33m',   // Yellow
      high: '\x1b[31m',     // Red
      critical: '\x1b[35m', // Magenta
    };

    const reset = '\x1b[0m';
    const color = colors[event.severity];

    // Use console.info for audit logs (allowed by ESLint config)
    console.info(
      `${color}[AUDIT][${event.severity.toUpperCase()}]${reset}`,
      event.type,
      event.outcome,
      event.userId ? `User: ${event.userId}` : '',
      event.details || ''
    );
  }

  /**
   * Check for suspicious patterns
   */
  private checkSuspiciousPatterns(event: SecurityEvent): void {
    // Multiple login failures
    if (event.type === 'AUTH_LOGIN_FAILURE' && event.userId) {
      const recentFailures = this.getRecentEvents(5 * 60 * 1000) // Last 5 minutes
        .filter(
          (e) =>
            e.type === 'AUTH_LOGIN_FAILURE' &&
            e.userId === event.userId
        );

      if (recentFailures.length >= 5) {
        this.log({
          type: 'SUSPICIOUS_ACTIVITY',
          userId: event.userId,
          outcome: 'blocked',
          details: {
            pattern: 'multiple_login_failures',
            count: recentFailures.length,
            timeWindow: '5 minutes',
          },
        });
      }
    }

    // Rate limit exceeded multiple times
    if (event.type === 'RATE_LIMIT_EXCEEDED') {
      const recentLimits = this.getRecentEvents(60 * 1000) // Last minute
        .filter((e) => e.type === 'RATE_LIMIT_EXCEEDED');

      if (recentLimits.length >= 3) {
        this.log({
          type: 'SUSPICIOUS_ACTIVITY',
          userId: event.userId,
          outcome: 'blocked',
          details: {
            pattern: 'rate_limit_abuse',
            count: recentLimits.length,
            timeWindow: '1 minute',
          },
        });
      }
    }
  }

  /**
   * Prune events older than retention period
   */
  private pruneOldEvents(): void {
    const cutoff = Date.now() - this.config.retentionDays * 24 * 60 * 60 * 1000;
    this.events = this.events.filter((e) => e.timestamp >= cutoff);
  }

  /**
   * Get events from the last N milliseconds
   */
  getRecentEvents(windowMs: number): SecurityEvent[] {
    const cutoff = Date.now() - windowMs;
    return this.events.filter((e) => e.timestamp >= cutoff);
  }

  /**
   * Get events by type
   */
  getEventsByType(type: SecurityEventType): SecurityEvent[] {
    return this.events.filter((e) => e.type === type);
  }

  /**
   * Get events by user
   */
  getEventsByUser(userId: string): SecurityEvent[] {
    return this.events.filter((e) => e.userId === userId);
  }

  /**
   * Get events by severity
   */
  getEventsBySeverity(severity: SecurityEventSeverity): SecurityEvent[] {
    return this.events.filter((e) => e.severity === severity);
  }

  /**
   * Get audit summary
   */
  getSummary(): AuditSummary {
    const byType: Record<string, number> = {};
    const bySeverity: Record<string, number> = {};
    const byOutcome: Record<string, number> = {};

    for (const event of this.events) {
      byType[event.type] = (byType[event.type] || 0) + 1;
      bySeverity[event.severity] = (bySeverity[event.severity] || 0) + 1;
      byOutcome[event.outcome] = (byOutcome[event.outcome] || 0) + 1;
    }

    const recentFailures = this.getRecentEvents(24 * 60 * 60 * 1000) // Last 24 hours
      .filter((e) => e.outcome === 'failure')
      .slice(-10);

    const suspiciousPatterns = this.detectSuspiciousPatterns();

    return {
      totalEvents: this.events.length,
      byType: byType as Record<SecurityEventType, number>,
      bySeverity: bySeverity as Record<SecurityEventSeverity, number>,
      byOutcome,
      recentFailures,
      suspiciousPatterns,
    };
  }

  /**
   * Detect suspicious patterns in the audit log
   */
  private detectSuspiciousPatterns(): string[] {
    const patterns: string[] = [];
    const recentEvents = this.getRecentEvents(60 * 60 * 1000); // Last hour

    // Multiple failed logins from same user
    const userFailures: Record<string, number> = {};
    recentEvents
      .filter((e) => e.type === 'AUTH_LOGIN_FAILURE' && e.userId)
      .forEach((e) => {
        if (e.userId) {
          userFailures[e.userId] = (userFailures[e.userId] || 0) + 1;
        }
      });

    for (const [userId, count] of Object.entries(userFailures)) {
      if (count >= 3) {
        patterns.push(`User ${userId} had ${count} failed login attempts in the last hour`);
      }
    }

    // Multiple access denied events
    const accessDeniedCount = recentEvents.filter(
      (e) => e.type === 'ACCESS_DENIED'
    ).length;
    if (accessDeniedCount >= 5) {
      patterns.push(`${accessDeniedCount} access denied events in the last hour`);
    }

    // Critical events
    const criticalCount = recentEvents.filter(
      (e) => e.severity === 'critical'
    ).length;
    if (criticalCount > 0) {
      patterns.push(`${criticalCount} critical security events in the last hour`);
    }

    return patterns;
  }

  /**
   * Export events for compliance
   */
  export(format: 'json' | 'csv' = 'json'): string {
    if (format === 'csv') {
      const headers = [
        'id',
        'timestamp',
        'type',
        'severity',
        'userId',
        'outcome',
        'resource',
        'action',
      ];
      const rows = this.events.map((e) => [
        e.id,
        new Date(e.timestamp).toISOString(),
        e.type,
        e.severity,
        e.userId || '',
        e.outcome,
        e.resource || '',
        e.action || '',
      ]);

      return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    }

    return JSON.stringify(this.events, null, 2);
  }

  /**
   * Clear all events
   */
  clear(): void {
    this.events = [];
    this.clearStorage();
  }

  /**
   * Start flush timer for remote logging
   */
  private startFlushTimer(): void {
    if (this.config.enableRemoteLogging && this.config.remoteEndpoint) {
      this.flushTimer = setInterval(() => {
        this.flushToRemote();
      }, this.config.flushInterval);
    }
  }

  /**
   * Flush pending events to remote endpoint
   */
  private async flushToRemote(): Promise<void> {
    if (
      !this.config.enableRemoteLogging ||
      !this.config.remoteEndpoint ||
      this.pendingBatch.length === 0
    ) {
      return;
    }

    const batch = this.pendingBatch.splice(0, this.config.batchSize);

    try {
      await fetch(this.config.remoteEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(batch),
      });
    } catch {
      // Put events back in batch on failure
      this.pendingBatch.unshift(...batch);
    }
  }

  /**
   * Save to storage
   */
  private saveToStorage(): void {
    try {
      sessionStorage.setItem('audit_log', JSON.stringify(this.events.slice(-1000)));
    } catch {
      // Storage not available or quota exceeded
    }
  }

  /**
   * Load from storage
   */
  private loadFromStorage(): void {
    try {
      const stored = sessionStorage.getItem('audit_log');
      if (stored) {
        this.events = JSON.parse(stored);
      }
    } catch {
      this.events = [];
    }
  }

  /**
   * Clear storage
   */
  private clearStorage(): void {
    try {
      sessionStorage.removeItem('audit_log');
    } catch {
      // Storage not available
    }
  }

  /**
   * Stop the flush timer
   */
  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
  }
}

// =============================================================================
// CONVENIENCE FUNCTIONS
// =============================================================================

/**
 * Create a pre-configured audit logger
 */
export function createAuditLogger(config?: AuditConfig): AuditLogger {
  return new AuditLogger(config);
}

// =============================================================================
// SINGLETON EXPORT
// =============================================================================

export const auditLogger = new AuditLogger();

export default {
  AuditLogger,
  createAuditLogger,
  auditLogger,
};
