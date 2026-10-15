import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import express from 'express';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module.js';
import { AppLoggerService } from './common/logger/app-logger.service.js';

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

  // Request size limits
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // CORS configuration
  app.enableCors({
    origin: [frontendUrl, 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
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
  if (isDev) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('HyperResume API')
      .setDescription('Core API documentation for HyperResume backend')
      .setVersion('1.0.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document, {
      customSiteTitle: 'HyperResume API Documentation',
    });
  }

  await app.listen(port);
  logger.log(`Server started on port ${port} in ${configService.get('NODE_ENV')} mode`, 'Bootstrap');
  if (isDev) {
    logger.log(`Swagger documentation available at http://localhost:${port}/api/docs`, 'Bootstrap');
  }
}

await bootstrap();
