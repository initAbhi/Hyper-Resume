/**
 * HyperResume Universal Production-Ready Frontend Logger
 *
 * Features:
 * - Isomorphic: Works seamlessly in Browser (Client Components) and Node.js (SSR / Server Components)
 * - Level filtering: DEBUG (0), INFO (1), WARN (2), ERROR (3), NONE (4)
 * - Environment awareness: 'debug' in development, 'warn' in production
 * - Dynamic runtime override: `localStorage.setItem('HYPER_LOG_LEVEL', 'debug')` in DevTools
 * - Sensitive data masking: tokens, passwords, authorization headers, credit cards
 * - In-memory ring buffer: Keeps last 100 logs accessible via `window.__HYPER_RESUME_LOGS__`
 * - Scoped child loggers: `logger.child('ModuleName')`
 * - Global uncaught exception and unhandled rejection tracking
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'none';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  namespace: string;
  message: string;
  data?: unknown;
}

export type LogSubscriber = (entry: LogEntry) => void;

const LOG_LEVEL_SEVERITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  none: 4,
};

const SENSITIVE_KEY_PATTERNS = [
  'password',
  'token',
  'secret',
  'authorization',
  'cookie',
  'key',
  'creditcard',
  'cardnumber',
  'cvv',
  'cvc',
  'ssn',
];

export class Logger {
  private bufferSize = 100;
  private buffer: LogEntry[] = [];
  private subscribers: Set<LogSubscriber> = new Set();
  private namespace: string;
  private isBrowser: boolean;

  constructor(namespace: string = 'App') {
    this.namespace = namespace;
    this.isBrowser = typeof window !== 'undefined';
  }

  /**
   * Resolves the active log level from environment or localStorage override
   */
  public getLogLevel(): LogLevel {
    if (this.isBrowser) {
      try {
        const override = localStorage.getItem('HYPER_LOG_LEVEL') as LogLevel | null;
        if (override && override in LOG_LEVEL_SEVERITY) {
          return override;
        }
      } catch {
        // Ignore localStorage access failures (e.g. security sandboxes)
      }
    }

    const envLevel = (
      typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_LOG_LEVEL : ''
    )?.toLowerCase() as LogLevel | undefined;

    if (envLevel && envLevel in LOG_LEVEL_SEVERITY) {
      return envLevel;
    }

    const isDev =
      typeof process !== 'undefined'
        ? process.env.NODE_ENV !== 'production'
        : true;

    return isDev ? 'debug' : 'warn';
  }

  private isLevelEnabled(level: LogLevel): boolean {
    const activeLevel = this.getLogLevel();
    return LOG_LEVEL_SEVERITY[level] >= LOG_LEVEL_SEVERITY[activeLevel];
  }

  /**
   * Recursively redacts sensitive keys and values
   */
  public redact(data: unknown): unknown {
    if (data === null || data === undefined) return data;

    if (typeof data === 'string') {
      if (/^bearer\s+[a-zA-Z0-9._-]+$/i.test(data.trim())) {
        return 'Bearer [REDACTED]';
      }
      try {
        const parsed = JSON.parse(data);
        if (typeof parsed === 'object' && parsed !== null) {
          return JSON.stringify(this.redact(parsed));
        }
      } catch {
        // Plain string
      }
      return data;
    }

    if (Array.isArray(data)) {
      return data.map((item) => this.redact(item));
    }

    if (typeof data === 'object') {
      if (data instanceof Error) {
        return {
          name: data.name,
          message: data.message,
          stack: data.stack,
          ...(data as unknown as Record<string, unknown>),
        };
      }

      const clean: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(data as Record<string, unknown>)) {
        const lowerKey = key.toLowerCase().replace(/[-_]/g, '');
        const isSensitive = SENSITIVE_KEY_PATTERNS.some((pattern) =>
          lowerKey.includes(pattern),
        );

        if (isSensitive) {
          clean[key] = '[REDACTED]';
        } else if (typeof val === 'object' && val !== null) {
          clean[key] = this.redact(val);
        } else if (
          typeof val === 'string' &&
          /^bearer\s+[a-zA-Z0-9._-]+$/i.test(val.trim())
        ) {
          clean[key] = 'Bearer [REDACTED]';
        } else {
          clean[key] = val;
        }
      }
      return clean;
    }

    return data;
  }

  private pushToBuffer(entry: LogEntry): void {
    if (this.buffer.length >= this.bufferSize) {
      this.buffer.shift();
    }
    this.buffer.push(entry);

    if (this.isBrowser) {
      (window as unknown as { __HYPER_RESUME_LOGS__?: LogEntry[] }).__HYPER_RESUME_LOGS__ =
        this.buffer;
    }

    for (const sub of this.subscribers) {
      try {
        sub(entry);
      } catch {
        // Do not fail if subscriber throws
      }
    }
  }

  private emit(level: LogLevel, message: string, data?: unknown): void {
    const timestamp = new Date().toISOString();
    const sanitizedData = data !== undefined ? this.redact(data) : undefined;

    const entry: LogEntry = {
      timestamp,
      level,
      namespace: this.namespace,
      message,
      data: sanitizedData,
    };

    this.pushToBuffer(entry);

    if (!this.isLevelEnabled(level)) {
      return;
    }

    if (this.isBrowser) {
      const styles = {
        badge: 'background: #3b82f6; color: white; border-radius: 3px; padding: 1px 5px; font-weight: bold; font-size: 11px;',
        debugBadge: 'background: #64748b; color: white; border-radius: 3px; padding: 1px 5px; font-weight: bold; font-size: 11px;',
        warnBadge: 'background: #f59e0b; color: black; border-radius: 3px; padding: 1px 5px; font-weight: bold; font-size: 11px;',
        errorBadge: 'background: #ef4444; color: white; border-radius: 3px; padding: 1px 5px; font-weight: bold; font-size: 11px;',
        namespace: 'color: #06b6d4; font-weight: bold;',
        time: 'color: #9ca3af; font-size: 11px;',
      };

      const timeStr = timestamp.split('T')[1].replace('Z', '');
      const badgeStyle =
        level === 'error'
          ? styles.errorBadge
          : level === 'warn'
          ? styles.warnBadge
          : level === 'debug'
          ? styles.debugBadge
          : styles.badge;

      const consoleArgs = [
        `%c${level.toUpperCase()}%c %c[${this.namespace}]%c %c${timeStr}%c ${message}`,
        badgeStyle,
        '',
        styles.namespace,
        '',
        styles.time,
        '',
      ];

      if (sanitizedData !== undefined) {
        consoleArgs.push(sanitizedData as any);
      }

      switch (level) {
        case 'debug':
          console.debug(...consoleArgs);
          break;
        case 'info':
          console.info(...consoleArgs);
          break;
        case 'warn':
          console.warn(...consoleArgs);
          break;
        case 'error':
          console.error(...consoleArgs);
          break;
      }
    } else {
      // Server-side (Node.js / Next SSR)
      const prefix = `[${timestamp}] [${level.toUpperCase()}] [${this.namespace}] ${message}`;
      if (level === 'error') {
        if (sanitizedData !== undefined) {
          console.error(prefix, sanitizedData);
        } else {
          console.error(prefix);
        }
      } else if (level === 'warn') {
        if (sanitizedData !== undefined) {
          console.warn(prefix, sanitizedData);
        } else {
          console.warn(prefix);
        }
      } else {
        if (sanitizedData !== undefined) {
          console.log(prefix, sanitizedData);
        } else {
          console.log(prefix);
        }
      }
    }
  }

  public debug(message: string, data?: unknown): void {
    this.emit('debug', message, data);
  }

  public info(message: string, data?: unknown): void {
    this.emit('info', message, data);
  }

  public warn(message: string, data?: unknown): void {
    this.emit('warn', message, data);
  }

  public error(message: string, data?: unknown): void {
    this.emit('error', message, data);
  }

  /**
   * Spawns a sub-logger inheriting memory buffer but scoped with a custom namespace
   */
  public child(subNamespace: string): Logger {
    const childLogger = new Logger(`${this.namespace}:${subNamespace}`);
    childLogger.buffer = this.buffer;
    childLogger.subscribers = this.subscribers;
    return childLogger;
  }

  /**
   * Subscribe to log events (e.g., error reporting services)
   */
  public subscribe(callback: LogSubscriber): () => void {
    this.subscribers.add(callback);
    return () => {
      this.subscribers.delete(callback);
    };
  }

  /**
   * Retrieves recorded in-memory logs
   */
  public getRecentLogs(limit?: number): LogEntry[] {
    if (!limit || limit >= this.buffer.length) {
      return [...this.buffer];
    }
    return this.buffer.slice(this.buffer.length - limit);
  }

  /**
   * Exports recent logs as formatted JSON string
   */
  public exportLogs(): string {
    return JSON.stringify(this.buffer, null, 2);
  }

  /**
   * Clears in-memory buffer
   */
  public clearLogs(): void {
    this.buffer = [];
    if (this.isBrowser) {
      (window as unknown as { __HYPER_RESUME_LOGS__?: LogEntry[] }).__HYPER_RESUME_LOGS__ = [];
    }
  }

  /**
   * Attaches window error & promise rejection listeners for holistic frontend diagnostics
   */
  public initGlobalErrorHandlers(): void {
    if (!this.isBrowser) return;

    window.addEventListener('error', (event) => {
      this.error(`Uncaught window error: ${event.message}`, {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error ? this.redact(event.error) : undefined,
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.error('Unhandled Promise Rejection', {
        reason: event.reason instanceof Error
          ? {
              message: event.reason.message,
              stack: event.reason.stack,
            }
          : event.reason,
      });
    });
  }
}

// Global default logger instance
export const logger = new Logger('HyperResume');
