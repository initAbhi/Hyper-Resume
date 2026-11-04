import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'node:crypto';
import { RequestContext } from '../logger/request-context.js';

export const CORRELATION_ID_HEADER = 'x-request-id';

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const existingId = req.headers[CORRELATION_ID_HEADER] as string | undefined;
    const correlationId = existingId && existingId.trim() !== '' ? existingId : randomUUID();

    req.headers[CORRELATION_ID_HEADER] = correlationId;
    (req as any).id = correlationId;
    res.setHeader(CORRELATION_ID_HEADER, correlationId);

    const forwarded = req.headers['x-forwarded-for'];
    const clientIp = typeof forwarded === 'string'
      ? forwarded.split(',')[0].trim()
      : req.ip || req.socket.remoteAddress;

    RequestContext.run(
      {
        requestId: correlationId,
        method: req.method,
        url: req.originalUrl || req.url,
        ip: clientIp,
        startTime: Date.now(),
      },
      () => {
        next();
      },
    );
  }
}
