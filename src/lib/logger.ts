/**
 * Logger Utility
 * 
 * Provides structured logging with different log levels.
 * In production, logs are filtered to show only warnings and errors.
 * Security-sensitive information is never logged.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: string;
  data?: Record<string, unknown>;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

// Get minimum log level based on environment
function getMinLogLevel(): number {
  return import.meta.env.PROD ? LOG_LEVELS.warn : LOG_LEVELS.debug;
}

// Sanitize data to remove sensitive information
function sanitizeData(data?: Record<string, unknown>): Record<string, unknown> | undefined {
  if (!data) return undefined;
  
  // Comprehensive list of sensitive key patterns
  const sensitiveKeys = [
    'password', 'passwd', 'pwd',
    'token', 'accesstoken', 'refreshtoken', 'authtoken', 'bearertoken',
    'secret', 'secretkey',
    'key', 'apikey', 'accesskey', 'privatekey', 'publickey',
    'auth', 'authorization',
    'credential', 'credentials',
    'session', 'sessionid', 'sessionsecret',
    'cookie',
    'jwt',
    'bearer',
    'hash', 'salt',
    'signature',
    'certificate', 'cert',
    'private',
  ];
  const sanitized: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(data)) {
    const lowerKey = key.toLowerCase();
    if (sensitiveKeys.some(sensitive => lowerKey.includes(sensitive))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeData(value as Record<string, unknown>);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}

// Format log entry
function formatLog(entry: LogEntry): string {
  const { level, message, timestamp, context } = entry;
  const prefix = context ? `[${context}]` : '';
  return `[${timestamp}] [${level.toUpperCase()}] ${prefix} ${message}`;
}

// Create logger instance
class Logger {
  private context: string;

  constructor(context: string = 'App') {
    this.context = context;
  }

  private log(level: LogLevel, message: string, data?: Record<string, unknown>): void {
    const minLevel = getMinLogLevel();
    if (LOG_LEVELS[level] < minLevel) return;

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context: this.context,
      data: sanitizeData(data),
    };

    const formattedMessage = formatLog(entry);

    switch (level) {
      case 'debug':
        console.debug(formattedMessage, entry.data || '');
        break;
      case 'info':
        console.info(formattedMessage, entry.data || '');
        break;
      case 'warn':
        console.warn(formattedMessage, entry.data || '');
        break;
      case 'error':
        console.error(formattedMessage, entry.data || '');
        break;
    }
  }

  debug(message: string, data?: Record<string, unknown>): void {
    this.log('debug', message, data);
  }

  info(message: string, data?: Record<string, unknown>): void {
    this.log('info', message, data);
  }

  warn(message: string, data?: Record<string, unknown>): void {
    this.log('warn', message, data);
  }

  error(message: string, data?: Record<string, unknown>): void {
    this.log('error', message, data);
  }

  // Create a child logger with a specific context
  child(context: string): Logger {
    return new Logger(`${this.context}:${context}`);
  }
}

// Security event logger
export const securityLogger = new Logger('Security');

// Auth event logger  
export const authLogger = new Logger('Auth');

// Default logger
export const logger = new Logger('App');

// Create a logger for a specific context
export function createLogger(context: string): Logger {
  return new Logger(context);
}

export default logger;
