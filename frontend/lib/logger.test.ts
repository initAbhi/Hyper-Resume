import { describe, it, expect, beforeEach, vi } from 'bun:test';
import { Logger } from './logger';

describe('Frontend Logger', () => {
  let logger: Logger;

  beforeEach(() => {
    logger = new Logger('TestApp');
    logger.clearLogs();
  });

  it('should store log entries in the in-memory buffer', () => {
    logger.info('System initiated', { version: '1.0.0' });
    logger.warn('Resource warning', { memoryMb: 512 });

    const recent = logger.getRecentLogs();
    expect(recent).toHaveLength(2);
    expect(recent[0].level).toBe('info');
    expect(recent[0].message).toBe('System initiated');
    expect(recent[0].namespace).toBe('TestApp');
    expect(recent[0].data).toEqual({ version: '1.0.0' });

    expect(recent[1].level).toBe('warn');
    expect(recent[1].message).toBe('Resource warning');
  });

  it('should redact sensitive keys in payload objects', () => {
    const rawData = {
      user: 'alice@example.com',
      password: 'TopSecretPassword',
      token: 'jwt.token.here',
      creditCard: '4111111111111111',
      apiKey: 'xyz-secret-key',
      auth: 'Bearer my-secret-jwt-token',
      metadata: {
        safeField: 'all good',
        clientSecret: 'secret_value',
      },
    };

    const redacted = logger.redact(rawData) as Record<string, any>;
    expect(redacted.user).toBe('alice@example.com');
    expect(redacted.password).toBe('[REDACTED]');
    expect(redacted.token).toBe('[REDACTED]');
    expect(redacted.creditCard).toBe('[REDACTED]');
    expect(redacted.apiKey).toBe('[REDACTED]');
    expect(redacted.auth).toBe('Bearer [REDACTED]');
    expect(redacted.metadata.safeField).toBe('all good');
    expect(redacted.metadata.clientSecret).toBe('[REDACTED]');
  });

  it('should maintain scoped namespace in child logger and share the same memory buffer', () => {
    const child = logger.child('Payments');
    child.info('Payment order created', { orderId: 'ord_123' });

    const logs = logger.getRecentLogs();
    expect(logs).toHaveLength(1);
    expect(logs[0].namespace).toBe('TestApp:Payments');
    expect(logs[0].message).toBe('Payment order created');
  });

  it('should notify subscribers when log is emitted', () => {
    const subscriber = vi.fn();
    const unsubscribe = logger.subscribe(subscriber);

    logger.error('Critical failure occurred', { code: 'CRIT_01' });

    expect(subscriber).toHaveBeenCalledTimes(1);
    expect(subscriber).toHaveBeenCalledWith(
      expect.objectContaining({
        level: 'error',
        message: 'Critical failure occurred',
      }),
    );

    unsubscribe();
    logger.info('Another message');
    expect(subscriber).toHaveBeenCalledTimes(1);
  });

  it('should enforce circular buffer capacity limit of 100 entries', () => {
    for (let i = 0; i < 120; i++) {
      logger.info(`Message #${i}`);
    }

    const recent = logger.getRecentLogs();
    expect(recent).toHaveLength(100);
    expect(recent[0].message).toBe('Message #20');
    expect(recent[99].message).toBe('Message #119');
  });

  it('should export formatted JSON logs', () => {
    logger.warn('Export test');
    const exported = logger.exportLogs();
    const parsed = JSON.parse(exported);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed[0].message).toBe('Export test');
  });
});
