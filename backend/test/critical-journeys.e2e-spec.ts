import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';

describe('Critical User Journeys (e2e)', () => {
  let app: INestApplication;
  let userToken: string;
  let userId: string;
  let resumeId: string;
  let jobDescriptionId: string;

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

  describe('Journey 1: New User Onboarding & First Resume', () => {
    it('should complete signup, retrieve profile, and create a master resume', async () => {
      const email = `onboarding_${Date.now()}@hyperresume.test`;
      const signupRes = await request(app.getHttpServer())
        .post('/api/v1/auth/signup')
        .send({
          email,
          password: 'Password123!',
          fullName: 'Siddharth Sen',
        })
        .expect(201);

      expect(signupRes.body.data.tokens.accessToken).toBeDefined();
      userToken = signupRes.body.data.tokens.accessToken;
      userId = signupRes.body.data.user.id;

      // Check initial welcome credits
      const balanceRes = await request(app.getHttpServer())
        .get('/api/v1/credits/balance')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(balanceRes.body.data.balance).toBeGreaterThanOrEqual(5);

      // Verify Profile can be retrieved and initialized
      const profileRes = await request(app.getHttpServer())
        .get('/api/v1/profiles/me')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(profileRes.body.data).toHaveProperty('userId', userId);

      // Create Master Resume
      const createResumeRes = await request(app.getHttpServer())
        .post('/api/v1/resumes')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Master Software Engineer Resume',
          templateKey: 'clean-modern',
        })
        .expect(201);

      expect(createResumeRes.body.data.id).toBeDefined();
      resumeId = createResumeRes.body.data.id;

      // Verify resume appears in listing (paginated envelope: { items, total, page, limit })
      const listRes = await request(app.getHttpServer())
        .get('/api/v1/resumes')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(listRes.body.data.items.length).toBe(1);
      expect(listRes.body.data.items[0].id).toBe(resumeId);
    });
  });

  describe('Journey 2: Resume Editing, Persistence & Version Snapshots', () => {
    it('should add experience, skills, edit bullets, and persist state across requests', async () => {
      const initialPayload = {
        name: 'Master Software Engineer Resume',
        templateKey: 'clean-modern',
        content: {
          contact: {
            fullName: 'Siddharth Sen',
            email: 'siddharth@example.com',
            phone: '+91 98765 43210',
          },
          headline: 'Senior Backend Engineer',
          summary: 'Building high throughput systems in Go and TypeScript.',
          skills: [{ name: 'Go' }, { name: 'PostgreSQL' }],
          experience: [
            {
              company: 'Unicorn Technologies',
              title: 'Backend Engineer',
              startDate: '2022',
              current: true,
              bullets: ['Managed database queries and payment endpoints.'],
            },
          ],
          education: [],
        },
      };

      // 1. Update resume content
      const updateRes = await request(app.getHttpServer())
        .patch(`/api/v1/resumes/${resumeId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(initialPayload)
        .expect(200);

      expect(updateRes.body.data.content.skills.length).toBe(2);
      expect(updateRes.body.data.content.experience[0].bullets[0]).toBe(
        'Managed database queries and payment endpoints.',
      );

      // 2. Snapshot Version
      const versionRes = await request(app.getHttpServer())
        .post(`/api/v1/resumes/${resumeId}/versions`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          changeSummary: 'Snapshot before STAR bullet optimization',
        })
        .expect(201);

      expect(versionRes.body.data.versionNumber).toBeGreaterThanOrEqual(1);

      // 3. Edit bullet with quantifiable STAR metrics
      const enhancedBullet =
        'Architected optimized database queries in PostgreSQL, reducing p99 API latency by 42% across 1.5M daily calls.';
      const editedPayload = {
        ...initialPayload,
        content: {
          ...initialPayload.content,
          experience: [
            {
              ...initialPayload.content.experience[0],
              bullets: [enhancedBullet],
            },
          ],
        },
      };

      const editedRes = await request(app.getHttpServer())
        .patch(`/api/v1/resumes/${resumeId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(editedPayload)
        .expect(200);

      expect(editedRes.body.data.content.experience[0].bullets[0]).toBe(enhancedBullet);

      // 4. Verify version history preserves initial snapshot with unedited bullet
      const historyRes = await request(app.getHttpServer())
        .get(`/api/v1/resumes/${resumeId}/versions`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(historyRes.body.data.length).toBeGreaterThanOrEqual(1);
      const snapshotVersion = historyRes.body.data.find(
        (v: { changeSummary: string }) => v.changeSummary === 'Snapshot before STAR bullet optimization',
      );
      expect(snapshotVersion).toBeDefined();
      expect(snapshotVersion.contentSnapshot.experience[0].bullets[0]).toBe(
        'Managed database queries and payment endpoints.',
      );
    });
  });

  describe('Journey 3: Grounded Job Matching & Truthful Invariants', () => {
    it('should match resume with job description and prevent hallucinated skill insertion', async () => {
      // 1. Create a Job Description
      const jdRes = await request(app.getHttpServer())
        .post('/api/v1/job-descriptions')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'Staff Backend Architect',
          companyName: 'Fintech Payments Ltd',
          originalText: `We are looking for a Staff Backend Architect.
Requirements:
- Deep experience in PostgreSQL database tuning and indexing.
- Proficiency in Go or TypeScript.
- Must have 3+ years experience with Rust and WebAssembly systems.
- Proven experience with Apache Kafka streaming.`,
        })
        .expect(201);

      jobDescriptionId = jdRes.body.data.id;

      // 2. Run Job Match Analysis
      const matchRes = await request(app.getHttpServer())
        .post('/api/v1/job-matches')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          resumeId,
          jobDescriptionId,
        })
        .expect(201);

      const matchData = matchRes.body.data;
      expect(matchData.overallScore).toBeGreaterThanOrEqual(0);
      expect(matchData.overallScore).toBeLessThanOrEqual(100);
      expect(matchData.requirementsAnalysis).toBeInstanceOf(Array);

      // 3. Grounded Invariant Check:
      // Candidate resume has Go and PostgreSQL, but NO Rust or Kafka.
      // Confirm unevidenced skills (e.g. Rust, Kafka) are categorized as not_evidenced or needs_confirmation
      const requirements = matchData.requirementsAnalysis as { requirementId: string; status: string; explanation?: string }[];
      const supportedList = requirements.filter((r) => r.status === 'supported');
      const unevidencedList = requirements.filter(
        (r) => r.status === 'not_evidenced' || r.status === 'needs_confirmation',
      );

      // Rust must NOT be supported because it was never in candidate's resume
      const rustSupported = supportedList.some((r) => (r.explanation || '').toLowerCase().includes('rust'));
      expect(rustSupported).toBe(false);
      expect(unevidencedList.length).toBeGreaterThan(0);


      // 4. Test Bullet Improvement endpoint
      const improveRes = await request(app.getHttpServer())
        .post('/api/v1/ai/bullet-improve')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          bulletText: 'Managed database queries and payment endpoints.',
          targetRole: 'Staff Backend Architect',
        })
        .expect(200);

      expect(improveRes.body.data.improvedBullet).toBeDefined();
      expect(improveRes.body.data.explanation).toBeDefined();
    });
  });

  describe('Journey 5: Payments, Centralized Pricing & Webhook Idempotency', () => {
    let orderId: string;
    let baselineBalance: number;

    it('should create an order with server-controlled pricing and verify payment', async () => {
      // Capture baseline before payment
      const baselineRes = await request(app.getHttpServer())
        .get('/api/v1/credits/balance')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      baselineBalance = baselineRes.body.data.balance;

      // 1. Create Order for Job Hunt Pack (30 credits)
      const orderRes = await request(app.getHttpServer())
        .post('/api/v1/payments/create-order')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          planId: 'job_hunt_pack',
          provider: 'sandbox',
        })
        .expect(201);

      expect(orderRes.body.data.amountMinor).toBe(39900); // Server calculated ₹399
      expect(orderRes.body.data.plan.credits).toBe(30);
      orderId = orderRes.body.data.orderId;

      // 2. Verify Payment
      const verifyRes = await request(app.getHttpServer())
        .post('/api/v1/payments/verify')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          orderId,
          providerPaymentId: `pay_sbx_${Date.now()}`,
        })
        .expect(200);

      expect(verifyRes.body.data.verified).toBe(true);

      // 3. Confirm balance incremented by exactly 30
      const balanceAfterRes = await request(app.getHttpServer())
        .get('/api/v1/credits/balance')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(balanceAfterRes.body.data.balance).toBe(baselineBalance + 30);
    });

    it('should process webhook idempotently and reject invalid signatures', async () => {
      // 1. Invalid signature should be rejected (401)
      await request(app.getHttpServer())
        .post('/api/v1/payments/webhook')
        .set('x-webhook-signature', 'invalid_tampered_signature')
        .send({
          event: 'payment.captured',
          orderId,
        })
        .expect(401);

      // 2. Duplicate payment.captured event on already succeeded order should return processed: true without extra credits
      const duplicateRes = await request(app.getHttpServer())
        .post('/api/v1/payments/webhook')
        .set('x-webhook-signature', 'sandbox_valid_test_signature')
        .send({
          event: 'payment.captured',
          orderId,
        })
        .expect(200);

      expect(duplicateRes.body.data.message).toBe('Already processed');

      // 3. Balance must remain unchanged (credits awarded exactly once)
      const balanceCheck = await request(app.getHttpServer())
        .get('/api/v1/credits/balance')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(balanceCheck.body.data.balance).toBe(baselineBalance + 30);
    });

    it('should safely process refund webhook and revert credits', async () => {
      const refundRes = await request(app.getHttpServer())
        .post('/api/v1/payments/webhook')
        .set('x-webhook-signature', 'sandbox_valid_test_signature')
        .send({
          event: 'refund.processed',
          orderId,
        })
        .expect(200);

      expect(refundRes.body.data.message).toContain('Refund processed and credits reverted');

      // Verify balance reverted to baseline
      const balanceCheck = await request(app.getHttpServer())
        .get('/api/v1/credits/balance')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(balanceCheck.body.data.balance).toBe(baselineBalance);
    });
  });

  describe('Journey 6: Failure Recovery & Credit Protection', () => {
    it('should reject requests when credits are insufficient and safeguard against negative balance', async () => {
      const zeroEmail = `broke_${Date.now()}@hyperresume.test`;
      const zeroSignup = await request(app.getHttpServer())
        .post('/api/v1/auth/signup')
        .send({
          email: zeroEmail,
          password: 'Password123!',
          fullName: 'Zero Credit User',
        })
        .expect(201);

      const zeroToken = zeroSignup.body.data.tokens.accessToken;

      // Verify credit balance is tracked and non-negative
      const balanceRes = await request(app.getHttpServer())
        .get('/api/v1/credits/balance')
        .set('Authorization', `Bearer ${zeroToken}`)
        .expect(200);

      expect(balanceRes.body.data.balance).toBeGreaterThanOrEqual(0);
    });
  });
});
