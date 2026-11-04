import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AppLoggerService } from '../logger/app-logger.service.js';
import { RequestContext } from '../logger/request-context.js';

@Injectable()
export class HttpLoggerMiddleware implements NestMiddleware {
  constructor(private readonly logger: AppLoggerService) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const startTime = process.hrtime.bigint();
    const method = req.method;
    const url = req.originalUrl || req.url;

    res.on('finish', () => {
      const endTime = process.hrtime.bigint();
      const durationMs = Number(endTime - startTime) / 1_000_000;
      const roundedDuration = Math.round(durationMs * 100) / 100;
      const statusCode = res.statusCode;
      const contentLength = res.get('content-length') || '0';
      const user = (req as any).user;
      const userId = user?.id || RequestContext.getUserId();
      const requestId = RequestContext.getRequestId() || (req.headers['x-request-id'] as string) || (req as any).id;

      // Filter out noisy health checks unless error or log level is debug/verbose
      const isHealth = url.includes('/health');
      if (isHealth && statusCode < 400 && this.logger.getLogLevel() !== 'debug' && this.logger.getLogLevel() !== 'verbose') {
        return;
      }

      const logPayload: Record<string, any> = {
        method,
        url,
        statusCode,
        durationMs: roundedDuration,
        contentLength,
        ip: req.ip || req.socket?.remoteAddress,
        userAgent: req.get ? req.get('user-agent') : undefined,
        requestId,
      };

      if (userId) {
        logPayload.userId = userId;
      }

      const message = `${method} ${url} ${statusCode} - ${roundedDuration}ms`;

      if (statusCode >= 500) {
        this.logger.error(message, logPayload, 'HTTP');
      } else if (statusCode >= 400) {
        this.logger.warn(message, logPayload, 'HTTP');
      } else {
        this.logger.log(message, logPayload, 'HTTP');
      }
    });

    next();
  }
}
