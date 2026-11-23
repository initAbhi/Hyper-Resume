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

  // Required behind Nginx so req.ip / x-forwarded-for resolve to the real client
  const expressApp = app.getHttpAdapter().getInstance();
  if (expressApp?.set) {
    expressApp.set('trust proxy', 1);
  }

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
  const allowedOrigins = [
    frontendUrl,
    'https://hype-resume.com',
    'http://hype-resume.com',
    'https://api.hype-resume.com',
    'http://api.hype-resume.com',
    'https://resume.fourth-coffee.shop',
    'http://resume.fourth-coffee.shop',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
  ].filter(Boolean);

  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      if (!origin) return callback(null, true);
      const isAllowed =
        allowedOrigins.includes(origin) ||
        /^https?:\/\/([a-z0-9-]+\.)*hype-resume\.com(:\d+)?$/.test(origin) ||
        /^https?:\/\/([a-z0-9-]+\.)*fourth-coffee\.shop(:\d+)?$/.test(origin) ||
        /^https?:\/\/localhost(:\d+)?$/.test(origin) ||
        /^https?:\/\/127\.0\.0\.1(:\d+)?$/.test(origin);
      if (isAllowed) {
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
      'Last-Event-ID',
      'last-event-id',
      'X-Stream-Ticket',
      'x-stream-ticket',
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

  // Fast, leak-free shutdown so open SSE/HTTP keep-alive sockets never orphan dist/main.js on port 3001
  const httpServer = app.getHttpServer();
  let isShuttingDown = false;

  const gracefulShutdown = (reason: string) => {
    if (isShuttingDown) return;
    isShuttingDown = true;
    logger.log(`Shutting down server (${reason})...`, 'Shutdown');

    const forceExitTimer = setTimeout(() => {
      process.exit(0);
    }, 1500);
    forceExitTimer.unref();

    if (typeof httpServer?.closeIdleConnections === 'function') {
      httpServer.closeIdleConnections();
    }
    if (typeof httpServer?.closeAllConnections === 'function') {
      httpServer.closeAllConnections();
    }

    app
      .close()
      .catch(() => undefined)
      .finally(() => {
        clearTimeout(forceExitTimer);
        process.exit(0);
      });
  };

  for (const sig of ['SIGINT', 'SIGTERM', 'SIGBREAK', 'SIGHUP'] as const) {
    process.on(sig, () => gracefulShutdown(sig));
  }

  // In dev watch mode, self-terminate immediately if either the direct parent (nest --watch)
  // or the top-level dev-watch runner dies (prevents orphaned dist/main.js holding port 3001 on Windows)
  if (isDev && process.env.NEST_DEV_WATCH === '1') {
    const watchedPids = [
      process.ppid,
      Number(process.env.NEST_DEV_WATCH_PID || 0),
    ].filter((pid, idx, arr) => Number.isInteger(pid) && pid > 1 && arr.indexOf(pid) === idx);

    if (watchedPids.length > 0) {
      const parentWatchdog = setInterval(() => {
        for (const pid of watchedPids) {
          try {
            process.kill(pid, 0);
          } catch (err: any) {
            if (err?.code === 'ESRCH') {
              clearInterval(parentWatchdog);
              // Also terminate orphaned nest --watch parent if top-level dev-watch died
              if (process.ppid > 1 && process.ppid !== pid) {
                try {
                  process.kill(process.ppid, 'SIGTERM');
                } catch {
                  // Ignore if already exited
                }
              }
              gracefulShutdown(`parent watcher ${pid} exited`);
              return;
            }
          }
        }
      }, 1000);
      parentWatchdog.unref();
    }
  }
}

await bootstrap();
