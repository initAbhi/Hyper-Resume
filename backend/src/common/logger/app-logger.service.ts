import { Injectable, LoggerService, LogLevel } from '@nestjs/common';
import { RequestContext } from './request-context.js';

export type SupportedLogLevel = 'fatal' | 'error' | 'warn' | 'info' | 'log' | 'debug' | 'verbose';

const LOG_LEVEL_PRIORITY: Record<SupportedLogLevel, number> = {
  fatal: 0,
  error: 1,
  warn: 2,
  info: 3,
  log: 3,
  debug: 4,
  verbose: 5,
};

const SENSITIVE_KEYS = new Set([
  'password',
  'passwordhash',
  'password_hash',
  'passwordconfirmation',
  'password_confirmation',
  'token',
  'refreshtoken',
  'refresh_token',
  'accesstoken',
  'access_token',
  'secret',
  'jwt_secret',
  'authorization',
  'cookie',
  'set-cookie',
  'apikey',
  'api_key',
  'client_secret',
  'secret_key',
  'private_key',
  'privatekey',
  'creditcard',
  'credit_card',
  'cardnumber',
  'card_number',
  'cvv',
  'cvc',
  'ssn',
  'signature',
  'database_password',
  'db_password',
]);

const ANSI = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m',
  bgRed: '\x1b[41m',
};

export interface ScopedLogger {
  log(message: any, metadata?: any): void;
  info(message: any, metadata?: any): void;
  error(message: any, trace?: any, metadata?: any): void;
  warn(message: any, metadata?: any): void;
  debug(message: any, metadata?: any): void;
  verbose(message: any, metadata?: any): void;
  fatal(message: any, trace?: any, metadata?: any): void;
}

@Injectable()
export class AppLoggerService implements LoggerService {
  private logLevels: LogLevel[] = ['log', 'error', 'warn', 'debug', 'verbose'];
  private currentLogLevel: SupportedLogLevel;

  constructor() {
    const configuredLevel = (process.env.LOG_LEVEL || '').toLowerCase() as SupportedLogLevel;
    if (configuredLevel && configuredLevel in LOG_LEVEL_PRIORITY) {
      this.currentLogLevel = configuredLevel;
    } else {
      this.currentLogLevel = process.env.NODE_ENV === 'production' ? 'info' : 'debug';
    }
  }

  setLogLevels(levels: LogLevel[]) {
    this.logLevels = levels;
  }

  setLogLevel(level: SupportedLogLevel) {
    this.currentLogLevel = level;
  }

  getLogLevel(): SupportedLogLevel {
    return this.currentLogLevel;
  }

  private isLevelEnabled(level: SupportedLogLevel): boolean {
    const configuredPriority = LOG_LEVEL_PRIORITY[this.currentLogLevel] ?? 4;
    const targetPriority = LOG_LEVEL_PRIORITY[level] ?? 3;
    return targetPriority <= configuredPriority;
  }

  log(message: any, ...optionalParams: any[]) {
    if (!this.isLevelEnabled('info')) return;
    this.print('INFO', message, optionalParams);
  }

  info(message: any, ...optionalParams: any[]) {
    this.log(message, ...optionalParams);
  }

  error(message: any, ...optionalParams: any[]) {
    if (!this.isLevelEnabled('error')) return;
    this.print('ERROR', message, optionalParams);
  }

  warn(message: any, ...optionalParams: any[]) {
    if (!this.isLevelEnabled('warn')) return;
    this.print('WARN', message, optionalParams);
  }

  debug(message: any, ...optionalParams: any[]) {
    if (!this.isLevelEnabled('debug')) return;
    this.print('DEBUG', message, optionalParams);
  }

  verbose(message: any, ...optionalParams: any[]) {
    if (!this.isLevelEnabled('verbose')) return;
    this.print('VERBOSE', message, optionalParams);
  }

  fatal(message: any, ...optionalParams: any[]) {
    if (!this.isLevelEnabled('fatal')) return;
    this.print('FATAL', message, optionalParams);
  }

  createChild(context: string): ScopedLogger {
    return {
      log: (message: any, metadata?: any) => this.log(message, metadata, context),
      info: (message: any, metadata?: any) => this.info(message, metadata, context),
      error: (message: any, trace?: any, metadata?: any) => this.error(message, trace, metadata, context),
      warn: (message: any, metadata?: any) => this.warn(message, metadata, context),
      debug: (message: any, metadata?: any) => this.debug(message, metadata, context),
      verbose: (message: any, metadata?: any) => this.verbose(message, metadata, context),
      fatal: (message: any, trace?: any, metadata?: any) => this.fatal(message, trace, metadata, context),
    };
  }

  private parseParams(level: string, message: any, optionalParams: any[]) {
    let context = 'Application';
    let stack: string | undefined;
    let metadata: Record<string, any> | undefined;

    // NestJS conventions:
    // log('msg', 'Context')
    // log('msg', { extra: 1 }, 'Context')
    // error('msg', 'stack trace', 'Context')
    // error('msg', err, 'Context')

    const remaining = [...optionalParams];

    // Check if the last param is a string (often the context)
    if (remaining.length > 0 && typeof remaining[remaining.length - 1] === 'string') {
      context = remaining.pop() as string;
    }

    if (level === 'ERROR' || level === 'FATAL') {
      if (remaining.length > 0) {
        const potentialTrace = remaining[0];
        if (typeof potentialTrace === 'string') {
          stack = remaining.shift();
        } else if (potentialTrace instanceof Error) {
          stack = potentialTrace.stack;
          remaining.shift();
        }
      }
    }

    // Remaining params become metadata
    if (remaining.length === 1 && typeof remaining[0] === 'object' && remaining[0] !== null) {
      metadata = remaining[0];
    } else if (remaining.length > 0) {
      metadata = { args: remaining };
    }

    // Check if message itself is an Error
    let formattedMessage = message;
    if (message instanceof Error) {
      formattedMessage = message.message;
      if (!stack) {
        stack = message.stack;
      }
    }

    return { context, stack, metadata, formattedMessage };
  }

  private print(level: string, message: any, optionalParams: any[]) {
    const { context, stack, metadata, formattedMessage } = this.parseParams(level, message, optionalParams);

    const timestamp = new Date().toISOString();
    const reqContext = RequestContext.get();
    const requestId = reqContext?.requestId || metadata?.requestId;
    const userId = reqContext?.userId || metadata?.userId;

    const sanitizedMessage = this.redactSensitiveData(formattedMessage);
    const sanitizedMetadata = metadata ? this.redactSensitiveData(metadata) : undefined;

    const isProd = process.env.NODE_ENV === 'production' || process.env.LOG_FORMAT === 'json';

    if (isProd) {
      const logRecord: Record<string, any> = {
        timestamp,
        level,
        context,
        message: sanitizedMessage,
      };

      if (requestId) logRecord.requestId = requestId;
      if (userId) logRecord.userId = userId;
      if (reqContext?.method) logRecord.method = reqContext.method;
      if (reqContext?.url) logRecord.url = reqContext.url;
      if (sanitizedMetadata) logRecord.meta = sanitizedMetadata;
      if (stack) logRecord.stack = stack;

      const output = JSON.stringify(logRecord) + '\n';
      if (level === 'ERROR' || level === 'FATAL') {
        process.stderr.write(output);
      } else {
        process.stdout.write(output);
      }
    } else {
      // Colorized Development Format
      const levelColors: Record<string, string> = {
        INFO: `${ANSI.green}${ANSI.bold}[INFO   ]${ANSI.reset}`,
        WARN: `${ANSI.yellow}${ANSI.bold}[WARN   ]${ANSI.reset}`,
        ERROR: `${ANSI.red}${ANSI.bold}[ERROR  ]${ANSI.reset}`,
        FATAL: `${ANSI.bgRed}${ANSI.white}${ANSI.bold}[FATAL  ]${ANSI.reset}`,
        DEBUG: `${ANSI.cyan}[DEBUG  ]${ANSI.reset}`,
        VERBOSE: `${ANSI.magenta}[VERBOSE]${ANSI.reset}`,
      };

      const levelBadge = levelColors[level] || `[${level}]`;
      const timeBadge = `${ANSI.gray}[${timestamp}]${ANSI.reset}`;
      const contextBadge = `${ANSI.blue}${ANSI.bold}[${context}]${ANSI.reset}`;
      const reqBadge = requestId ? ` ${ANSI.dim}${ANSI.gray}[req: ${requestId.substring(0, 8)}]${ANSI.reset}` : '';
      const userBadge = userId ? ` ${ANSI.dim}${ANSI.cyan}[usr: ${userId.substring(0, 8)}]${ANSI.reset}` : '';

      const msgStr = typeof sanitizedMessage === 'object'
        ? JSON.stringify(sanitizedMessage, null, 2)
        : sanitizedMessage;

      let logLine = `${timeBadge} ${levelBadge} ${contextBadge}${reqBadge}${userBadge} ${msgStr}`;

      if (sanitizedMetadata && Object.keys(sanitizedMetadata).length > 0) {
        logLine += `\n${ANSI.gray}${JSON.stringify(sanitizedMetadata, null, 2)}${ANSI.reset}`;
      }

      if (stack) {
        logLine += `\n${ANSI.red}${stack}${ANSI.reset}`;
      }

      logLine += '\n';

      if (level === 'ERROR' || level === 'FATAL') {
        process.stderr.write(logLine);
      } else {
        process.stdout.write(logLine);
      }
    }
  }

  public redactSensitiveData(data: any): any {
    if (data === null || data === undefined) return data;

    if (typeof data === 'string') {
      // Redact Authorization Bearer token strings
      if (/^bearer\s+[a-zA-Z0-9._-]+$/i.test(data.trim())) {
        return 'Bearer [REDACTED]';
      }

      // Try parsing stringified JSON
      try {
        const parsed = JSON.parse(data);
        if (typeof parsed === 'object' && parsed !== null) {
          return JSON.stringify(this.redactSensitiveData(parsed));
        }
      } catch {
        // Not a JSON string
      }

      return data;
    }

    if (Array.isArray(data)) {
      return data.map((item) => this.redactSensitiveData(item));
    }

    if (typeof data === 'object') {
      const sanitized: Record<string, any> = {};
      for (const [key, value] of Object.entries(data)) {
        const lowerKey = key.toLowerCase().replace(/[-_]/g, '');
        const isSensitive =
          SENSITIVE_KEYS.has(lowerKey) ||
          SENSITIVE_KEYS.has(key.toLowerCase()) ||
          lowerKey.includes('password') ||
          (lowerKey.includes('token') && !lowerKey.includes('tokenizer')) ||
          lowerKey.includes('secret') ||
          lowerKey.includes('creditcard');

        if (isSensitive) {
          sanitized[key] = '[REDACTED]';
        } else if (typeof value === 'object' && value !== null) {
          sanitized[key] = this.redactSensitiveData(value);
        } else if (typeof value === 'string' && /^bearer\s+[a-zA-Z0-9._-]+$/i.test(value.trim())) {
          sanitized[key] = 'Bearer [REDACTED]';
        } else {
          sanitized[key] = value;
        }
      }
      return sanitized;
    }

    return data;
  }
}
