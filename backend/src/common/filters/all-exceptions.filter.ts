import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AppLoggerService } from '../logger/app-logger.service.js';
import { CORRELATION_ID_HEADER } from '../middleware/correlation-id.middleware.js';

export interface ApiErrorResponse {
  statusCode: number;
  code: string;
  message: string;
  details: unknown[];
  requestId: string;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: AppLoggerService) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const requestId =
      (request.headers[CORRELATION_ID_HEADER] as string) ||
      (request as any).id ||
      'unknown';

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'INTERNAL_SERVER_ERROR';
    let message = 'An unexpected internal server error occurred.';
    let details: unknown[] = [];

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
        code = this.getErrorCodeFromStatus(statusCode);
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null
      ) {
        const resObj = exceptionResponse as Record<string, any>;
        message = resObj.message || exception.message;
        code = this.getErrorCodeFromStatus(statusCode);

        if (Array.isArray(resObj.message)) {
          // Typically class-validator output
          code = 'VALIDATION_ERROR';
          message = 'The request contains invalid fields.';
          details = resObj.message;
        } else if (resObj.error && typeof resObj.error === 'string') {
          code = resObj.error.toUpperCase().replace(/\s+/g, '_');
        } else if (resObj.details) {
          details = Array.isArray(resObj.details)
            ? resObj.details
            : [resObj.details];
        }
      }
    } else {
      // Unhandled / server errors
      this.logger.error(
        `Unhandled exception for request [${requestId}] on ${request.method} ${request.url}`,
        exception instanceof Error ? exception.stack : JSON.stringify(exception),
        'AllExceptionsFilter',
      );

      // In development or test, provide the error message in details for developer clarity
      if (process.env.NODE_ENV !== 'production' && exception instanceof Error) {
        details = [exception.message];
      }
    }

    const errorResponse: ApiErrorResponse = {
      statusCode,
      code,
      message,
      details,
      requestId,
    };

    response.status(statusCode).json(errorResponse);
  }

  private getErrorCodeFromStatus(status: number): string {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return 'BAD_REQUEST';
      case HttpStatus.UNAUTHORIZED:
        return 'UNAUTHORIZED';
      case HttpStatus.FORBIDDEN:
        return 'FORBIDDEN';
      case HttpStatus.NOT_FOUND:
        return 'NOT_FOUND';
      case HttpStatus.CONFLICT:
        return 'CONFLICT';
      case HttpStatus.UNPROCESSABLE_ENTITY:
        return 'UNPROCESSABLE_ENTITY';
      case HttpStatus.SERVICE_UNAVAILABLE:
        return 'SERVICE_UNAVAILABLE';
      default:
        return 'INTERNAL_SERVER_ERROR';
    }
  }
}
