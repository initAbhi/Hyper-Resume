import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AppLoggerService } from './app-logger.service.js';
import { RequestContext } from './request-context.js';

describe('AppLoggerService', () => {
  let logger: AppLoggerService;
  let stdoutSpy: any;
  let stderrSpy: any;
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.LOG_LEVEL;
    delete process.env.LOG_FORMAT;
    stdoutSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
    stderrSpy = vi.spyOn(process.stderr, 'write').mockImplementation(() => true);
    logger = new AppLoggerService();
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  describe('Sensitive Data Redaction', () => {
    it('should redact sensitive keys like password, token, and secret', () => {
      const sensitiveData = {
        email: 'user@example.com',
        password: 'mySecretPassword123',
        password_confirmation: 'mySecretPassword123',
        token: 'eyJh.token.val',
        accessToken: 'access-12345',
        refreshToken: 'refresh-67890',
        creditCard: '4111222233334444',
        database_password: 'supersecretroot',
        nested: {
          apiKey: 'key_xyz',
          normalKey: 'public-value',
        },
      };

      const redacted = logger.redactSensitiveData(sensitiveData);

      expect(redacted.email).toBe('user@example.com');
      expect(redacted.password).toBe('[REDACTED]');
      expect(redacted.password_confirmation).toBe('[REDACTED]');
      expect(redacted.token).toBe('[REDACTED]');
      expect(redacted.accessToken).toBe('[REDACTED]');
      expect(redacted.refreshToken).toBe('[REDACTED]');
      expect(redacted.creditCard).toBe('[REDACTED]');
      expect(redacted.database_password).toBe('[REDACTED]');
      expect(redacted.nested.apiKey).toBe('[REDACTED]');
      expect(redacted.nested.normalKey).toBe('public-value');
    });

    it('should redact Bearer authorization header strings', () => {
      const header = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.signature';
      const redacted = logger.redactSensitiveData(header);
      expect(redacted).toBe('Bearer [REDACTED]');
    });

    it('should parse and redact stringified JSON', () => {
      const jsonString = JSON.stringify({ password: 'secretpassword', normal: 'hello' });
      const redacted = logger.redactSensitiveData(jsonString);
      const parsed = JSON.parse(redacted);
      expect(parsed.password).toBe('[REDACTED]');
      expect(parsed.normal).toBe('hello');
    });
  });

  describe('Log Level Filtering', () => {
    it('should suppress debug logs when log level is set to info', () => {
      logger.setLogLevel('info');
      logger.debug('This debug message should not print');
      expect(stdoutSpy).not.toHaveBeenCalled();

      logger.log('This info message should print');
      expect(stdoutSpy).toHaveBeenCalled();
    });

    it('should suppress warn and info when log level is error', () => {
      logger.setLogLevel('error');
      logger.log('Info msg');
      logger.warn('Warn msg');
      expect(stdoutSpy).not.toHaveBeenCalled();

      logger.error('Error msg');
      expect(stderrSpy).toHaveBeenCalled();
    });
  });

  describe('Production JSON Formatting', () => {
    it('should write single-line JSON with context and correlation ID in production', () => {
      process.env.NODE_ENV = 'production';
      logger = new AppLoggerService();

      RequestContext.run(
        { requestId: 'test-req-999', userId: 'user-777', method: 'GET', url: '/api/v1/test' },
        () => {
          logger.log('Server is running smoothly', 'TestContext');
        },
      );

      expect(stdoutSpy).toHaveBeenCalled();
      const output = stdoutSpy.mock.calls[0][0];
      const parsed = JSON.parse(output);

      expect(parsed.level).toBe('INFO');
      expect(parsed.context).toBe('TestContext');
      expect(parsed.message).toBe('Server is running smoothly');
      expect(parsed.requestId).toBe('test-req-999');
      expect(parsed.userId).toBe('user-777');
      expect(parsed.method).toBe('GET');
      expect(parsed.url).toBe('/api/v1/test');
      expect(parsed.timestamp).toBeDefined();
    });

    it('should output errors to stderr with stack trace in production', () => {
      process.env.NODE_ENV = 'production';
      logger = new AppLoggerService();

      const testError = new Error('Database connection failed');
      logger.error('DB failure', testError.stack, 'DatabaseModule');

      expect(stderrSpy).toHaveBeenCalled();
      const output = stderrSpy.mock.calls[0][0];
      const parsed = JSON.parse(output);

      expect(parsed.level).toBe('ERROR');
      expect(parsed.context).toBe('DatabaseModule');
      expect(parsed.message).toBe('DB failure');
      expect(parsed.stack).toContain('Database connection failed');
    });
  });

  describe('Scoped Child Loggers', () => {
    it('should inherit context from createChild', () => {
      process.env.NODE_ENV = 'production';
      logger = new AppLoggerService();

      const child = logger.createChild('PaymentsWorker');
      child.info('Processed refund event', { orderId: 'ord_123' });

      expect(stdoutSpy).toHaveBeenCalled();
      const parsed = JSON.parse(stdoutSpy.mock.calls[0][0]);
      expect(parsed.context).toBe('PaymentsWorker');
      expect(parsed.message).toBe('Processed refund event');
      expect(parsed.meta).toEqual({ orderId: 'ord_123' });
    });
  });
});
