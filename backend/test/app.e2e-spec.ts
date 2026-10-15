import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';

describe('Application Foundation (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('Health Endpoints', () => {
    it('/api/v1/health/live (GET) should report liveness and return correlation ID', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/health/live')
        .expect(200);

      expect(response.headers['x-request-id']).toBeDefined();
      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('timestamp');
    });

    it('/api/v1/health/ready (GET) should report database readiness without leaking secrets', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/health/ready')
        .expect(200);

      expect(response.headers['x-request-id']).toBeDefined();
      expect(response.body).toEqual({
        status: 'ok',
        database: 'connected',
        timestamp: expect.any(String),
      });

      // Crucial: ensure no credentials or host details are exposed
      const bodyStr = JSON.stringify(response.body);
      expect(bodyStr).not.toContain('postgres');
      expect(bodyStr).not.toContain('password');
      expect(bodyStr).not.toContain('12345');
      expect(bodyStr).not.toContain('localhost');
    });
  });

  describe('Response Transformation & Correlation IDs', () => {
    it('/api/v1 (GET) should format response with { data, meta } structure', async () => {
      const customRequestId = 'test-correlation-uuid-12345';
      const response = await request(app.getHttpServer())
        .get('/api/v1')
        .set('x-request-id', customRequestId)
        .expect(200);

      expect(response.headers['x-request-id']).toBe(customRequestId);
      expect(response.body).toHaveProperty('data', 'Hello World!');
      expect(response.body).toHaveProperty('meta');
      expect(response.body.meta).toHaveProperty('requestId', customRequestId);
      expect(response.body.meta).toHaveProperty('timestamp');
    });
  });

  describe('Error Handling & Invariant Protection', () => {
    it('should return consistent error response format on 404', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/non-existent-route')
        .expect(404);

      expect(response.headers['x-request-id']).toBeDefined();
      expect(response.body).toMatchObject({
        statusCode: 404,
        code: 'NOT_FOUND',
        message: expect.any(String),
        details: expect.any(Array),
        requestId: expect.any(String),
      });
    });
  });
});
