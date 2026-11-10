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

  it('should compress resume pdf via /resume-parsing/compress', async () => {
    const mockCompressRes = {
      data: {
        success: true,
        status: 'COMPRESSED',
        originalSize: 15728640,
        compressedSize: 4500000,
        reductionPercentage: 71.4,
        withinUploadLimit: true,
        verification: {
          validPdf: true,
          pageCountPreserved: true,
          textExtractionPassed: true,
        },
      },
      meta: { requestId: 'req-compress-1', timestamp: new Date().toISOString() },
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers(),
      json: async () => mockCompressRes,
    } as unknown as Response) as unknown as typeof fetch;

    const client = new ApiClient('http://localhost:3001/api/v1');
    const fakeFile = new File(['%PDF-1.4 ... large binary data'], 'heavy_resume.pdf', {
      type: 'application/pdf',
    });
    const result = await client.compressResumePdf(fakeFile);

    expect(result.success).toBe(true);
    expect(result.status).toBe('COMPRESSED');
    expect(result.reductionPercentage).toBe(71.4);
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3001/api/v1/resume-parsing/compress',
      expect.objectContaining({
        method: 'POST',
        body: expect.any(FormData),
      }),
    );
  });

  it('should compress and parse resume pdf via /resume-parsing/compress-and-parse', async () => {
    const mockCompressAndParseRes = {
      data: {
        success: true,
        status: 'COMPRESSED',
        originalSize: 15728640,
        compressedSize: 4194304,
        reductionPercentage: 73.3,
        withinUploadLimit: true,
        verification: {
          validPdf: true,
          pageCountPreserved: true,
          textExtractionPassed: true,
        },
        parsed: {
          fileName: 'heavy_resume.pdf',
          extractedTextLength: 600,
          draft: {
            headline: 'Staff Infrastructure Architect',
            summary: 'Experienced distributed systems engineer',
            skills: [{ name: 'Go' }],
            experience: [],
            education: [],
          },
        },
      },
      meta: { requestId: 'req-compress-parse-1', timestamp: new Date().toISOString() },
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers(),
      json: async () => mockCompressAndParseRes,
    } as unknown as Response) as unknown as typeof fetch;

    const client = new ApiClient('http://localhost:3001/api/v1');
    const fakeFile = new File(['%PDF-1.4 ... 15mb binary data'], 'heavy_resume.pdf', {
      type: 'application/pdf',
    });
    const result = await client.compressAndParseResume(fakeFile);

    expect(result.success).toBe(true);
    expect(result.withinUploadLimit).toBe(true);
    expect(result.parsed?.draft.headline).toBe('Staff Infrastructure Architect');
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3001/api/v1/resume-parsing/compress-and-parse',
      expect.objectContaining({
        method: 'POST',
        body: expect.any(FormData),
      }),
    );
  });

  it('should silently refresh access token on 401 and retry the original request', async () => {
    const client = new ApiClient('http://localhost:3001/api/v1');
    client.setTokens('expired-access-token', 'valid-refresh-token');

    let callCount = 0;
    global.fetch = vi.fn().mockImplementation(async (url: string) => {
      callCount++;
      if (url.includes('/resumes') && callCount === 1) {
        return {
          ok: false,
          status: 401,
          headers: new Headers(),
          json: async () => ({ statusCode: 401, message: 'Invalid or expired authentication token' }),
        };
      }
      if (url.includes('/auth/refresh')) {
        return {
          ok: true,
          status: 200,
          headers: new Headers(),
          json: async () => ({
            data: {
              tokens: {
                accessToken: 'refreshed-access-token-999',
                refreshToken: 'new-refresh-token-888',
                expiresIn: 604800,
              },
            },
          }),
        };
      }
      if (url.includes('/resumes') && callCount === 3) {
        return {
          ok: true,
          status: 200,
          headers: new Headers(),
          json: async () => ({ data: [{ id: 'res-1', name: 'Refreshed Profile' }] }),
        };
      }
      return { ok: true, json: async () => ({}) };
    }) as unknown as typeof fetch;

    const result = await client.listResumes();
    expect(client.getToken()).toBe('refreshed-access-token-999');
    expect(client.getRefreshToken()).toBe('new-refresh-token-888');
    expect(result).toBeDefined();
  });
});
