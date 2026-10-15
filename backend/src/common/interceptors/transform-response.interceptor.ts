import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request } from 'express';
import { CORRELATION_ID_HEADER } from '../middleware/correlation-id.middleware.js';

export interface ApiResponse<T> {
  data: T;
  meta: Record<string, any>;
}

@Injectable()
export class TransformResponseInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T> | T>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T> | T> {
    const httpCtx = context.switchToHttp();
    const request = httpCtx.getRequest<Request>();

    // Skip transformation for health endpoints or OpenAPI json/raw endpoints
    if (
      request.url?.includes('/health') ||
      request.url?.includes('/docs') ||
      request.url?.includes('/api-json')
    ) {
      return next.handle();
    }

    const requestId =
      (request.headers[CORRELATION_ID_HEADER] as string) ||
      (request as any).id ||
      'unknown';

    return next.handle().pipe(
      map((body) => {
        // If already structured with data and meta, return as is
        if (body && typeof body === 'object' && 'data' in body && 'meta' in body) {
          return body;
        }

        // If body has a custom meta, merge it
        const meta: Record<string, any> = {
          requestId,
          timestamp: new Date().toISOString(),
        };

        if (body && typeof body === 'object' && 'meta' in body) {
          Object.assign(meta, body.meta);
          delete body.meta;
        }

        return {
          data: body,
          meta,
        };
      }),
    );
  }
}
