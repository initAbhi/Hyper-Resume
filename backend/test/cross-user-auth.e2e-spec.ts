import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';

describe('Cross-User Ownership & Authorization (e2e)', () => {
  let app: INestApplication;
  let userAToken: string;
  let userBToken: string;
  let userAResumeId: string;
  let userAJobId: string;
  let userAAppId: string;

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

    // 1. Sign up User A
    const userAEmail = `user_a_${Date.now()}@test.io`;
    const signupARes = await request(app.getHttpServer())
      .post('/api/v1/auth/signup')
      .send({
        email: userAEmail,
        password: 'PasswordA123!',
        fullName: 'Candidate A',
      })
      .expect(201);
    userAToken = signupARes.body.data.tokens.accessToken;

    // 2. Sign up User B
    const userBEmail = `user_b_${Date.now()}@test.io`;
    const signupBRes = await request(app.getHttpServer())
      .post('/api/v1/auth/signup')
      .send({
        email: userBEmail,
        password: 'PasswordB123!',
        fullName: 'Candidate B',
      })
      .expect(201);
    userBToken = signupBRes.body.data.tokens.accessToken;

    // 3. User A creates a Resume
    const resumeRes = await request(app.getHttpServer())
      .post('/api/v1/resumes')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        name: 'User A Private Master Resume',
        templateKey: 'clean-modern',
      })
      .expect(201);
    userAResumeId = resumeRes.body.data.id;

    // 4. User A creates a Job Description
    const jobRes = await request(app.getHttpServer())
      .post('/api/v1/job-descriptions')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        title: 'User A Target Staff Engineer',
        originalText: 'Requirements: Go, Kafka, Distributed Systems.',
      })
      .expect(201);
    userAJobId = jobRes.body.data.id;

    // 5. User A creates a Job Application
    const appRes = await request(app.getHttpServer())
      .post('/api/v1/applications')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        company: 'Confidential Corp',
        role: 'Lead Architect',
      })
      .expect(201);
    userAAppId = appRes.body.data.id;
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('Resume Ownership Enforcement', () => {
    it('User B cannot GET User A resume by ID', async () => {
      await request(app.getHttpServer())
        .get(`/api/v1/resumes/${userAResumeId}`)
        .set('Authorization', `Bearer ${userBToken}`)
        .expect(404);
    });

    it('User B cannot PATCH User A resume', async () => {
      await request(app.getHttpServer())
        .patch(`/api/v1/resumes/${userAResumeId}`)
        .set('Authorization', `Bearer ${userBToken}`)
        .send({ name: 'Hacked Name' })
        .expect(404);
    });

    it('User B cannot DELETE User A resume', async () => {
      await request(app.getHttpServer())
        .delete(`/api/v1/resumes/${userAResumeId}`)
        .set('Authorization', `Bearer ${userBToken}`)
        .expect(404);
    });

    it('User B cannot view User A resume versions', async () => {
      await request(app.getHttpServer())
        .get(`/api/v1/resumes/${userAResumeId}/versions`)
        .set('Authorization', `Bearer ${userBToken}`)
        .expect(404);
    });
  });

  describe('Job Description Ownership Enforcement', () => {
    it('User B cannot access User A private job description', async () => {
      await request(app.getHttpServer())
        .get(`/api/v1/job-descriptions/${userAJobId}`)
        .set('Authorization', `Bearer ${userBToken}`)
        .expect(404);
    });
  });

  describe('Job Match Ownership Enforcement', () => {
    it('User B cannot run match analysis using User A resume ID', async () => {
      // User B creates their own job
      const userBJobRes = await request(app.getHttpServer())
        .post('/api/v1/job-descriptions')
        .set('Authorization', `Bearer ${userBToken}`)
        .send({
          title: 'User B Target Job',
          originalText: 'Requirements: Python, SQL.',
        })
        .expect(201);

      await request(app.getHttpServer())
        .post('/api/v1/job-matches')
        .set('Authorization', `Bearer ${userBToken}`)
        .send({
          resumeId: userAResumeId, // User A's resume ID
          jobDescriptionId: userBJobRes.body.data.id,
        })
        .expect(404);
    });
  });

  describe('Application Pipeline Ownership Enforcement', () => {
    it('User B cannot GET User A application', async () => {
      await request(app.getHttpServer())
        .get(`/api/v1/applications/${userAAppId}`)
        .set('Authorization', `Bearer ${userBToken}`)
        .expect(404);
    });

    it('User B cannot PATCH User A application', async () => {
      await request(app.getHttpServer())
        .patch(`/api/v1/applications/${userAAppId}`)
        .set('Authorization', `Bearer ${userBToken}`)
        .send({ company: 'Compromised Inc' })
        .expect(404);
    });

    it('User B cannot DELETE User A application', async () => {
      await request(app.getHttpServer())
        .delete(`/api/v1/applications/${userAAppId}`)
        .set('Authorization', `Bearer ${userBToken}`)
        .expect(404);
    });
  });
});
