import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { JobDiscoveryService } from './job-discovery.service.js';
import {
  CACHE_TTL_MS,
  clearJobDiscoveryCache,
  computeResumeJobFit,
  sanitizeBoardToken,
  stripHtmlToText,
} from './job-discovery-providers.util.js';
import type { ResumeContent } from '../resumes/entities/resume.types.js';

describe('JobDiscoveryService & Providers', () => {
  let service: JobDiscoveryService;
  let mockResumeRepo: any;
  let mockAppRepo: any;
  let mockJobsService: any;
  let mockMatchService: any;
  let mockAppsService: any;

  const sampleResumeContent: ResumeContent = {
    contact: { fullName: 'Alexander Sharma', email: 'alex@example.com' },
    headline: 'Senior Backend & Cloud Platform Engineer',
    summary: 'Built TypeScript, Go, PostgreSQL, and Kubernetes systems handling millions of events.',
    skills: [
      { name: 'TypeScript' },
      { name: 'Go' },
      { name: 'PostgreSQL' },
      { name: 'Kubernetes' },
    ],
    experience: [
      {
        company: 'CloudScale Payments',
        title: 'Senior Backend Engineer',
        startDate: '2022',
        current: true,
        bullets: [
          'Architected Kafka event streaming and PostgreSQL ledger pipelines in Go.',
        ],
      },
    ],
    education: [],
  };

  beforeEach(() => {
    clearJobDiscoveryCache();

    mockResumeRepo = {
      findOne: vi.fn().mockResolvedValue({
        id: 'res-1',
        userId: 'user-a',
        name: 'Alexander Master Resume',
        isMaster: true,
        isArchived: false,
        content: sampleResumeContent,
      }),
      find: vi.fn().mockResolvedValue([
        {
          id: 'res-1',
          userId: 'user-a',
          name: 'Alexander Master Resume',
          isMaster: true,
          isArchived: false,
          content: sampleResumeContent,
        },
      ]),
    };

    mockAppRepo = {
      find: vi.fn().mockResolvedValue([
        {
          id: 'app-existing-1',
          userId: 'user-a',
          company: 'Stripe',
          role: 'Staff Go Engineer',
          jobUrl: 'https://boards.greenhouse.io/stripe/jobs/100',
        },
      ]),
      findOne: vi.fn().mockResolvedValue(null),
    };

    mockJobsService = {
      createJobDescription: vi.fn().mockResolvedValue({
        id: 'jd-new-1',
        title: 'Platform Engineer',
        companyName: 'Linear',
      }),
    };

    mockMatchService = {
      createJobMatch: vi.fn().mockResolvedValue({
        id: 'match-new-1',
        overallScore: 84,
      }),
    };

    mockAppsService = {
      createApplication: vi.fn().mockResolvedValue({
        id: 'app-new-1',
        company: 'Linear',
        role: 'Platform Engineer',
        status: 'bookmarked',
      }),
    };

    service = new JobDiscoveryService(
      mockResumeRepo,
      mockAppRepo,
      mockJobsService,
      mockMatchService,
      mockAppsService,
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    clearJobDiscoveryCache();
  });

  it('sanitizes ATS board tokens against traversal/SSRF and strips unsafe HTML cleanly', () => {
    expect(sanitizeBoardToken('Stripe')).toBe('stripe');
    expect(() => sanitizeBoardToken('../etc/passwd')).toThrow(BadRequestException);
    expect(() => sanitizeBoardToken('http://evil.local')).toThrow(BadRequestException);

    const cleaned = stripHtmlToText(
      '<p>Build APIs</p><ul><li>Go &amp; PostgreSQL</li></ul><script>alert(1)</script>',
    );
    expect(cleaned).not.toContain('<script>');
    expect(cleaned).not.toContain('alert(1)');
    expect(cleaned).toContain('Build APIs');
    expect(cleaned).toContain('Go & PostgreSQL');
  });

  it('computes honest resume compatibility and leaves un-evidenced terms in missingKeywords', () => {
    const fit = computeResumeJobFit(
      {
        id: 'j1',
        externalId: '1',
        title: 'Senior Go Infrastructure Engineer',
        company: 'Stripe',
        location: 'Remote',
        workplaceType: 'Remote',
        employmentType: 'Full-time',
        source: 'Greenhouse',
        applyUrl: 'https://boards.greenhouse.io/stripe/jobs/1',
        postedAt: new Date().toISOString(),
        tags: ['Go', 'PostgreSQL', 'Kafka', 'Rust'],
        snippet: 'Work on Go, PostgreSQL, Kafka, and Rust services.',
        descriptionText: 'Seeking experience with Go, PostgreSQL, Kafka, and Rust systems.',
        isLive: true,
      },
      sampleResumeContent,
    );

    expect(fit.matchedSkills).toEqual(expect.arrayContaining(['Go', 'PostgreSQL', 'Kafka']));
    expect(fit.missingKeywords).toContain('Rust');
    expect(fit.matchScore).toBeGreaterThan(60);
    expect(fit.matchScore).toBeLessThan(100);
  });

  it('aggregates partial live ATS feeds gracefully, filters results, and annotates tracker bookmarks', async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('boards-api.greenhouse.io/v1/boards/stripe')) {
        return {
          ok: true,
          json: async () => ({
            jobs: [
              {
                id: 100,
                title: 'Staff Go Engineer',
                location: { name: 'Remote (US)' },
                absolute_url: 'https://boards.greenhouse.io/stripe/jobs/100',
                updated_at: '2026-11-09T10:00:00Z',
                content: '<p>Build financial systems with Go and PostgreSQL.</p>',
              },
              {
                id: 101,
                title: 'Senior Product Designer',
                location: { name: 'San Francisco, CA' },
                absolute_url: 'https://boards.greenhouse.io/stripe/jobs/101',
                updated_at: '2026-11-08T10:00:00Z',
                content: '<p>Figma systems design.</p>',
              },
            ],
          }),
        } as unknown as Response;
      }
      // Simulate upstream outage on secondary boards
      return { ok: false, status: 503 } as unknown as Response;
    });

    vi.stubGlobal('fetch', fetchMock);

    const res = await service.searchJobs('user-a', {
      source: 'greenhouse',
      workplace: 'remote',
      q: 'Go',
    });

    expect(res.feedMode).toBe('live');
    expect(res.liveCount).toBe(2);
    expect(res.total).toBe(1);
    expect(res.jobs).toHaveLength(1);
    expect(res.jobs[0].title).toBe('Staff Go Engineer');
    expect(res.jobs[0].isSavedInTracker).toBe(true);
    expect(res.jobs[0].trackedApplicationId).toBe('app-existing-1');
  });

  it('falls back gracefully to offline_fallback mode when all upstream providers fail', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new Error('Network unavailable')),
    );

    const res = await service.searchJobs('user-a', { source: 'remotive' });
    expect(res.feedMode).toBe('offline_fallback');
    expect(res.liveCount).toBe(0);
    expect(res.jobs.length).toBeGreaterThan(0);
  });

  it('enforces 15-minute TTL cache on job discovery feeds and avoids redundant network requests', async () => {
    expect(CACHE_TTL_MS).toBe(15 * 60 * 1000);

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        jobs: [
          {
            id: 991,
            title: 'Senior Distributed Systems Architect',
            company_name: 'Stripe',
            candidate_required_location: 'Remote',
            job_type: 'full_time',
            url: 'https://remotive.com/jobs/991',
            publication_date: '2026-11-13T12:00:00Z',
            tags: ['Go', 'PostgreSQL'],
            description: '<p>Build payment scale infrastructure in Go and PostgreSQL.</p>',
          },
        ],
      }),
    });
    vi.stubGlobal('fetch', mockFetch);

    // First fetch: network request triggered
    const res1 = await service.searchJobs('user-a', { source: 'remotive' });
    expect(res1.sourcesStatus[0].cached).toBe(false);
    expect(mockFetch).toHaveBeenCalledTimes(1);

    // Second fetch without refresh flag: cached hit, zero extra network requests
    const res2 = await service.searchJobs('user-a', { source: 'remotive' });
    expect(res2.sourcesStatus[0].cached).toBe(true);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('saves discovered jobs cleanly without duplicate tracking and enforces resume ownership on match', async () => {
    const saved = await service.saveDiscoveredJobToTracker('user-a', {
      title: 'Platform Engineer',
      company: 'Linear',
      location: 'Remote',
      applyUrl: 'https://jobs.ashbyhq.com/linear/123',
      source: 'Ashby',
      descriptionText: 'Build fast distributed sync services in TypeScript and PostgreSQL.',
    });
    expect(saved.alreadyTracked).toBe(false);
    expect(mockAppsService.createApplication).toHaveBeenCalled();

    // Already tracked URL should short-circuit without creating duplicate row
    mockAppRepo.findOne.mockResolvedValueOnce({ id: 'app-new-1' });
    const dup = await service.saveDiscoveredJobToTracker('user-a', {
      title: 'Platform Engineer',
      company: 'Linear',
      applyUrl: 'https://jobs.ashbyhq.com/linear/123',
      descriptionText: 'Build fast distributed sync services.',
    });
    expect(dup.alreadyTracked).toBe(true);

    // Cross-user resume protection on runDiscoveredJobMatch
    mockResumeRepo.findOne.mockResolvedValueOnce(null);
    await expect(
      service.runDiscoveredJobMatch('user-a', {
        title: 'Platform Engineer',
        company: 'Linear',
        descriptionText: 'Full stack role.',
        resumeId: 'res-foreign',
      }),
    ).rejects.toThrow(NotFoundException);
  });
});
