import { describe, expect, it, vi, beforeEach } from 'bun:test';
import { ApiClient, ApiError } from './api-client';

describe('ApiClient', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should generate a correlation ID and parse successful data', async () => {
    const mockResponse = {
      data: { status: 'ok', uptime: 120 },
      meta: { requestId: 'req-123', timestamp: '2026-10-14T00:00:00.000Z' },
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ 'x-request-id': 'req-123' }),
      json: async () => mockResponse,
    } as unknown as Response) as unknown as typeof fetch;

    const client = new ApiClient('http://localhost:3001/api/v1');
    const result = await client.request('/test');

    expect(result.data).toEqual({ status: 'ok', uptime: 120 });
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3001/api/v1/test',
      expect.objectContaining({
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'X-Request-ID': expect.any(String),
        }),
      }),
    );
  });

  it('should throw ApiError with structured payload when API returns 400', async () => {
    const errorBody = {
      statusCode: 400,
      code: 'VALIDATION_ERROR',
      message: 'The request contains invalid fields.',
      details: ['Email is invalid'],
      requestId: 'req-err-456',
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      headers: new Headers({ 'x-request-id': 'req-err-456' }),
      json: async () => errorBody,
    } as unknown as Response) as unknown as typeof fetch;

    const client = new ApiClient('http://localhost:3001/api/v1');

    try {
      await client.request('/invalid');
      expect.unreachable('Should have thrown an ApiError');
    } catch (err: unknown) {
      expect(err).toBeInstanceOf(ApiError);
      const apiErr = err as ApiError;
      expect(apiErr.statusCode).toBe(400);
      expect(apiErr.code).toBe('VALIDATION_ERROR');
      expect(apiErr.details).toEqual(['Email is invalid']);
      expect(apiErr.requestId).toBe('req-err-456');
    }
  });

  it('should attach Bearer token and handle login response', async () => {
    const mockLoginRes = {
      data: {
        user: { id: 'usr-1', email: 'user@test.com', fullName: 'Tester', role: 'user' },
        tokens: { accessToken: 'jwt-access-token-123', refreshToken: 'jwt-refresh-123', expiresIn: 3600 },
      },
      meta: { requestId: 'req-auth', timestamp: '2026-10-14T00:00:00.000Z' },
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ 'x-request-id': 'req-auth' }),
      json: async () => mockLoginRes,
    } as unknown as Response) as unknown as typeof fetch;

    const client = new ApiClient('http://localhost:3001/api/v1');
    const result = await client.login({ email: 'user@test.com', password: 'password123' });

    expect(result.tokens.accessToken).toBe('jwt-access-token-123');
    expect(client.getToken()).toBe('jwt-access-token-123');

    // Subsequent request should carry Authorization header
    const mockResumeRes = {
      data: [{ id: 'res-1', name: 'Master Profile' }],
      meta: { requestId: 'req-res', timestamp: '2026-10-14T00:00:00.000Z' },
    };
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers(),
      json: async () => mockResumeRes,
    } as unknown as Response) as unknown as typeof fetch;

    await client.listResumes();
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3001/api/v1/resumes',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer jwt-access-token-123',
        }),
      }),
    );
  });

  it('should handle optimistic concurrency conflict (409) during resume update', async () => {
    const conflictBody = {
      statusCode: 409,
      code: 'CONCURRENCY_CONFLICT',
      message: 'Resume was modified by another request. Please reload and retry.',
      details: [],
      requestId: 'req-conflict-999',
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 409,
      headers: new Headers({ 'x-request-id': 'req-conflict-999' }),
      json: async () => conflictBody,
    } as unknown as Response) as unknown as typeof fetch;

    const client = new ApiClient('http://localhost:3001/api/v1');

    try {
      await client.updateResume('res-1', {
        name: 'New Title',
        expectedVersion: 1,
      });
      expect.unreachable('Should have thrown a 409 Conflict');
    } catch (err: unknown) {
      expect(err).toBeInstanceOf(ApiError);
      const apiErr = err as ApiError;
      expect(apiErr.statusCode).toBe(409);
      expect(apiErr.code).toBe('CONCURRENCY_CONFLICT');
    }
  });

  it('should upload and parse resume file with multipart/form-data', async () => {
    const mockParseRes = {
      data: {
        fileName: 'resume.pdf',
        extractedTextLength: 1200,
        draft: {
          headline: 'Full Stack Engineer',
          summary: 'Experienced developer',
          location: 'Bengaluru',
          skills: [{ name: 'TypeScript' }],
          experience: [],
          education: [],
          projects: [],
          certifications: [],
          confidenceScore: 0.95,
        },
      },
      meta: { requestId: 'req-upload', timestamp: '2026-10-14T00:00:00.000Z' },
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers(),
      json: async () => mockParseRes,
    } as unknown as Response) as unknown as typeof fetch;

    const client = new ApiClient('http://localhost:3001/api/v1');
    const fakeFile = new File(['%PDF-1.4 ... binary text'], 'resume.pdf', { type: 'application/pdf' });
    const result = await client.uploadAndParseResume(fakeFile);

    expect(result.fileName).toBe('resume.pdf');
    expect(result.draft.headline).toBe('Full Stack Engineer');
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3001/api/v1/resume-parsing/upload',
      expect.objectContaining({
        method: 'POST',
        body: expect.any(FormData),
      }),
    );
  });
});
