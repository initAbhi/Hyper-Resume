import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HttpLoggerMiddleware } from './http-logger.middleware.js';
import { AppLoggerService } from '../logger/app-logger.service.js';

describe('HttpLoggerMiddleware', () => {
  let middleware: HttpLoggerMiddleware;
  let logger: AppLoggerService;

  beforeEach(() => {
    logger = new AppLoggerService();
    middleware = new HttpLoggerMiddleware(logger);
  });

  it('should log incoming request on finish with duration and status code', () => {
    const logSpy = vi.spyOn(logger, 'log').mockImplementation(() => {});
    const finishCallbacks: Array<() => void> = [];

    const mockReq: any = {
      method: 'GET',
      originalUrl: '/api/v1/resumes',
      ip: '127.0.0.1',
      get: vi.fn().mockReturnValue('Mozilla/5.0'),
      headers: { 'x-request-id': 'req-http-123' },
    };

    const mockRes: any = {
      statusCode: 200,
      get: vi.fn().mockReturnValue('1024'),
      on: vi.fn().mockImplementation((event: string, cb: () => void) => {
        if (event === 'finish') finishCallbacks.push(cb);
      }),
    };

    const next = vi.fn();
    middleware.use(mockReq, mockRes, next);

    expect(next).toHaveBeenCalled();

    // Trigger finish
    finishCallbacks.forEach((cb) => cb());

    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining('GET /api/v1/resumes 200'),
      expect.objectContaining({
        method: 'GET',
        url: '/api/v1/resumes',
        statusCode: 200,
        requestId: 'req-http-123',
      }),
      'HTTP',
    );
  });

  it('should log 4xx as warning and 5xx as error', () => {
    const warnSpy = vi.spyOn(logger, 'warn').mockImplementation(() => {});
    const errorSpy = vi.spyOn(logger, 'error').mockImplementation(() => {});

    // 404 test
    let finishCb: (() => void) | undefined;
    const req404: any = {
      method: 'GET',
      originalUrl: '/api/v1/unknown',
      get: vi.fn(),
      headers: {},
    };
    const res404: any = {
      statusCode: 404,
      get: vi.fn(),
      on: vi.fn().mockImplementation((_, cb) => {
        finishCb = cb;
      }),
    };

    middleware.use(req404, res404, vi.fn());
    finishCb?.();
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('404'), expect.any(Object), 'HTTP');

    // 500 test
    const req500: any = {
      method: 'POST',
      originalUrl: '/api/v1/fail',
      get: vi.fn(),
      headers: {},
    };
    const res500: any = {
      statusCode: 500,
      get: vi.fn(),
      on: vi.fn().mockImplementation((_, cb) => {
        finishCb = cb;
      }),
    };

    middleware.use(req500, res500, vi.fn());
    finishCb?.();
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('500'), expect.any(Object), 'HTTP');
  });
});
