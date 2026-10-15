import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'node:crypto';

export const CORRELATION_ID_HEADER = 'x-request-id';

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const existingId = req.headers[CORRELATION_ID_HEADER] as string | undefined;
    const correlationId = existingId && existingId.trim() !== '' ? existingId : randomUUID();

    req.headers[CORRELATION_ID_HEADER] = correlationId;
    (req as any).id = correlationId;
    res.setHeader(CORRELATION_ID_HEADER, correlationId);

    next();
  }
}
