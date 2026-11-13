import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import express from 'express';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module.js';
import { AppLoggerService } from './common/logger/app-logger.service.js';
import { isAllowedCorsOrigin, parseAdditionalCorsOrigins } from './common/utils/cors.util.js';

async function bootstrap() {
  const logger = new AppLoggerService();
  const app = await NestFactory.create(AppModule, {
    logger,
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3001);
  const frontendUrl = configService.get<string>('FRONTEND_URL', 'http://localhost:3000');
  const isDev = configService.get<string>('NODE_ENV') === 'development';

  // Security Headers
  app.use(
    helmet({
      contentSecurityPolicy: isDev ? false : undefined,
    }),
  );

  // Cookie parsing
  app.use(cookieParser());

  // Request size limits & raw body capture for cryptographic webhook signatures
  app.use(
    express.json({
      limit: '10mb',
      verify: (req: any, _res, buf) => {
        req.rawBody = buf;
      },
    }),
  );
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // CORS configuration
  const additionalOrigins = parseAdditionalCorsOrigins(
    configService.get<string>('ADDITIONAL_CORS_ORIGINS'),
  );

  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      if (isAllowedCorsOrigin(origin, frontendUrl, additionalOrigins, isDev)) {
        callback(null, true);
      } else {
        logger.warn(`Blocked CORS request from origin: ${origin}`, 'CORS');
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Request-ID',
      'x-request-id',
      'Idempotency-Key',
      'idempotency-key',
      'X-Idempotency-Key',
      'x-idempotency-key',
      'Accept',
      'Origin',
      'X-Requested-With',
      'Access-Control-Request-Headers',
      'Access-Control-Request-Method',
      'Range',
      'Cache-Control',
      'Pragma',
      'If-Match',
      'If-None-Match',
      'If-Modified-Since',
    ],
    exposedHeaders: [
      'Content-Disposition',
      'X-Request-ID',
      'x-request-id',
      'Idempotency-Key',
      'idempotency-key',
      'X-ATS-Text-Verified',
      'X-ATS-Extractable-Chars',
      'X-ATS-Extractable-Words',
      'X-PDF-Page-Count',
      'X-PDF-Size-Bytes',
      'X-DOCX-Size-Bytes',
    ],
  });

  // Global API Prefix
  app.setGlobalPrefix('api/v1');

  // Global DTO Validation and Transformation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // OpenAPI / Swagger Documentation
  const enableSwagger = isDev || configService.get<string>('ENABLE_SWAGGER') === 'true';
  if (enableSwagger) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('HypeResume API')
      .setDescription('Core API documentation for HypeResume backend')
      .setVersion('1.0.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document, {
      customSiteTitle: 'HypeResume API Documentation',
    });
  }

  await app.listen(port);
  logger.log(`Server started on port ${port} in ${configService.get('NODE_ENV')} mode`, 'Bootstrap');
  if (enableSwagger) {
    logger.log(`Swagger documentation available at http://localhost:${port}/api/docs`, 'Bootstrap');
  }
}

await bootstrap();
