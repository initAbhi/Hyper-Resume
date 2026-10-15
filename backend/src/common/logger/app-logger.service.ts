import { Injectable, LoggerService, LogLevel } from '@nestjs/common';

const SENSITIVE_KEYS = new Set([
  'password',
  'passwordhash',
  'password_hash',
  'token',
  'refreshtoken',
  'accesstoken',
  'secret',
  'jwt_secret',
  'authorization',
  'cookie',
  'apikey',
  'api_key',
  'creditcard',
  'database_password',
]);

@Injectable()
export class AppLoggerService implements LoggerService {
  private logLevels: LogLevel[] = ['log', 'error', 'warn', 'debug', 'verbose'];

  setLogLevels(levels: LogLevel[]) {
    this.logLevels = levels;
  }

  log(message: any, ...optionalParams: any[]) {
    this.print('INFO', message, optionalParams);
  }

  error(message: any, ...optionalParams: any[]) {
    this.print('ERROR', message, optionalParams);
  }

  warn(message: any, ...optionalParams: any[]) {
    this.print('WARN', message, optionalParams);
  }

  debug(message: any, ...optionalParams: any[]) {
    this.print('DEBUG', message, optionalParams);
  }

  verbose(message: any, ...optionalParams: any[]) {
    this.print('VERBOSE', message, optionalParams);
  }

  private print(level: string, message: any, optionalParams: any[]) {
    const context = optionalParams.length > 0 && typeof optionalParams[0] === 'string'
      ? optionalParams[0]
      : 'Application';

    const timestamp = new Date().toISOString();
    const sanitizedMessage = this.redactSensitiveData(message);

    const logObject: Record<string, any> = {
      timestamp,
      level,
      context,
      message: sanitizedMessage,
    };

    if (optionalParams.length > 1) {
      logObject.extra = this.redactSensitiveData(optionalParams.slice(1));
    }

    if (process.env.NODE_ENV === 'production') {
      process.stdout.write(JSON.stringify(logObject) + '\n');
    } else {
      const formatted = `[${timestamp}] [${level}] [${context}] ${
        typeof sanitizedMessage === 'object' ? JSON.stringify(sanitizedMessage) : sanitizedMessage
      }`;
      if (level === 'ERROR') {
        process.stderr.write(formatted + '\n');
      } else {
        process.stdout.write(formatted + '\n');
      }
    }
  }

  public redactSensitiveData(data: any): any {
    if (data === null || data === undefined) return data;
    if (typeof data === 'string') {
      try {
        const parsed = JSON.parse(data);
        return JSON.stringify(this.redactSensitiveData(parsed));
      } catch {
        return data;
      }
    }

    if (Array.isArray(data)) {
      return data.map((item) => this.redactSensitiveData(item));
    }

    if (typeof data === 'object') {
      const sanitized: Record<string, any> = {};
      for (const [key, value] of Object.entries(data)) {
        if (SENSITIVE_KEYS.has(key.toLowerCase())) {
          sanitized[key] = '[REDACTED]';
        } else if (typeof value === 'object' && value !== null) {
          sanitized[key] = this.redactSensitiveData(value);
        } else {
          sanitized[key] = value;
        }
      }
      return sanitized;
    }

    return data;
  }
}
