import { describe, expect, it, vi, beforeEach } from 'vitest';
import { ParseJdOrPdfTool } from './parse-jd-or-pdf.tool.js';

describe('ParseJdOrPdfTool', () => {
  let tool: ParseJdOrPdfTool;
  let mockJdUrlParser: any;
  let mockJobsService: any;

  beforeEach(() => {
    mockJdUrlParser = {
      fetchAndParseJobUrl: vi.fn().mockResolvedValue({
        jobDescriptionId: 'jd-123',
        title: 'Senior Full-Stack Engineer',
        companyName: 'Linear',
        location: 'Remote',
        workplace: 'Remote',
        applyUrl: 'https://jobs.ashbyhq.com/linear/123',
        descriptionText: 'Build fast TypeScript and GraphQL web applications at Linear.',
        extractionSource: 'json_ld',
      }),
    };
    mockJobsService = {
      createJobDescription: vi.fn().mockResolvedValue({
        id: 'jd-raw-1',
        title: 'Platform Engineer',
        companyName: 'Stripe',
        originalText: 'Design resilient payment APIs using Go, Ruby, and PostgreSQL.',
      }),
    };
    tool = new ParseJdOrPdfTool(mockJdUrlParser, mockJobsService);
  });

  it('rejects forbidden userId in arguments', () => {
    const res = tool.validate({ url: 'https://example.com/job', userId: 'attacker' });
    expect(res.valid).toBe(false);
  });

  it('rejects missing url and rawText, and rejects non-http protocols', () => {
    expect(tool.validate({}).valid).toBe(false);
    expect(tool.validate({ url: 'file:///etc/passwd' }).valid).toBe(false);
    expect(tool.validate({ url: 'https://boards.greenhouse.io/acme/jobs/1' }).valid).toBe(true);
  });

  it('parses a job URL via JdUrlParserService and returns structured JD payload', async () => {
    const res = await tool.execute(
      { userId: 'user-1', taskId: 'task-1', conversationId: 'conv-1' },
      { url: 'https://jobs.ashbyhq.com/linear/123' },
    );

    expect(res.success).toBe(true);
    expect((res.data as any).jobDescriptionId).toBe('jd-123');
    expect((res.data as any).title).toBe('Senior Full-Stack Engineer');
    expect((res.data as any).companyName).toBe('Linear');
    expect(mockJdUrlParser.fetchAndParseJobUrl).toHaveBeenCalledWith(
      'user-1',
      'https://jobs.ashbyhq.com/linear/123',
    );
  });

  it('persists rawText job description when no URL is supplied', async () => {
    const res = await tool.execute(
      { userId: 'user-1', taskId: 'task-1', conversationId: 'conv-1' },
      {
        rawText:
          'We are looking for a Platform Engineer to design resilient payment APIs using Go, Ruby, and PostgreSQL with high availability.',
        jobTitle: 'Platform Engineer',
        companyName: 'Stripe',
      },
    );

    expect(res.success).toBe(true);
    expect((res.data as any).jobDescriptionId).toBe('jd-raw-1');
    expect((res.data as any).extractionSource).toBe('raw_text');
  });
});

