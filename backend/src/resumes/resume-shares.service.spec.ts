import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ConflictException,
  ForbiddenException,
  GoneException,
  NotFoundException,
} from '@nestjs/common';
import { ResumeSharesService } from './resume-shares.service.js';

describe('ResumeSharesService', () => {
  let service: ResumeSharesService;
  let resumeRepo: any;
  let shareRepo: any;
  let eventRepo: any;
  let docxExportService: any;
  let pdfExportService: any;

  const sampleResume = {
    id: 'res-1',
    userId: 'user-1',
    name: 'Alexander Sharma — Staff Engineer',
    templateKey: 'double-column',
    isArchived: false,
    updatedAt: new Date('2026-11-10T10:00:00.000Z'),
    content: {
      contact: {
        fullName: 'Alexander Sharma',
        email: 'alex@example.com',
        phone: '+1 (415) 555-0192',
        location: 'San Francisco, CA',
        linkedinUrl: 'https://linkedin.com/in/alexsharma',
      },
      headline: 'Staff Platform Engineer',
      summary: 'Distributed ledger and systems architecture.',
      skills: [{ name: 'NestJS' }],
      experience: [],
      education: [],
    },
  };

  beforeEach(() => {
    resumeRepo = {
      findOne: vi.fn().mockResolvedValue(sampleResume),
    };
    shareRepo = {
      findOne: vi.fn(),
      find: vi.fn().mockResolvedValue([]),
      create: vi.fn((data) => ({
        id: 'share-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        ...data,
      })),
      save: vi.fn((entity) => Promise.resolve({ ...entity })),
    };
    eventRepo = {
      findOne: vi.fn().mockResolvedValue(null),
      find: vi.fn().mockResolvedValue([]),
      create: vi.fn((data) => ({
        id: `ev-${Math.random()}`,
        createdAt: new Date(),
        ...data,
      })),
      save: vi.fn((entity) => Promise.resolve(entity)),
      delete: vi.fn().mockResolvedValue({ affected: 1 }),
    };
    docxExportService = {
      generateResumeDocx: vi.fn().mockResolvedValue({
        buffer: Buffer.from('DOCX_BYTES'),
        fileName: 'Alexander.docx',
        atsVerified: true,
        extractableChars: 120,
        extractableWords: 20,
        sizeBytes: 10,
      }),
    };
    pdfExportService = {
      generateVectorPdf: vi.fn().mockResolvedValue({
        buffer: Buffer.from('PDF_BYTES'),
        fileName: 'Alexander.pdf',
        atsVerified: true,
        extractableChars: 120,
        extractableWords: 20,
        pageCount: 1,
        sizeBytes: 9,
      }),
    };

    service = new ResumeSharesService(
      resumeRepo,
      shareRepo,
      eventRepo,
      docxExportService,
      pdfExportService,
    );
  });

  it('creates an active share link with auto-generated slug and returns analytics skeleton', async () => {
    shareRepo.findOne.mockResolvedValue(null);

    const res = await service.upsertShareSettings('user-1', 'res-1', {
      isActive: true,
      recruiterNote: 'Open to Staff Infrastructure roles',
    });

    expect(res.share?.slug).toMatch(/^alexander-sharma-[a-f0-9]{6}$/);
    expect(res.share?.isActive).toBe(true);
    expect(res.share?.recruiterNote).toBe('Open to Staff Infrastructure roles');
    expect(res.analytics.dailyTrend).toHaveLength(14);
    expect(res.analytics.totalViews).toBe(0);
  });

  it('rejects duplicate custom slug claimed by another share with ConflictException', async () => {
    shareRepo.findOne
      .mockResolvedValueOnce({ id: 'share-1', resumeId: 'res-1', userId: 'user-1', slug: 'old-slug' })
      .mockResolvedValueOnce({ id: 'other-share', resumeId: 'res-2', userId: 'user-2', slug: 'alex-staff' });

    await expect(
      service.upsertShareSettings('user-1', 'res-1', { slug: 'alex-staff' }),
    ).rejects.toThrow(ConflictException);
  });

  it('enforces inactive (404), expired (410 Gone), and server-side contact privacy redaction', async () => {
    shareRepo.findOne.mockResolvedValueOnce({
      id: 'share-1',
      resumeId: 'res-1',
      slug: 'alex-live',
      isActive: false,
    });
    await expect(service.getPublicResumeBySlug('alex-live')).rejects.toThrow(
      NotFoundException,
    );

    shareRepo.findOne.mockResolvedValueOnce({
      id: 'share-1',
      resumeId: 'res-1',
      slug: 'alex-live',
      isActive: true,
      expiresAt: new Date(Date.now() - 60_000),
    });
    await expect(service.getPublicResumeBySlug('alex-live')).rejects.toThrow(
      GoneException,
    );

    shareRepo.findOne.mockResolvedValueOnce({
      id: 'share-1',
      resumeId: 'res-1',
      slug: 'alex-live',
      isActive: true,
      allowPdfDownload: true,
      allowDocxDownload: false,
      hideContactDetails: true,
      viewCount: 0,
      uniqueVisitorCount: 0,
      downloadCount: 0,
    });

    const payload = await service.getPublicResumeBySlug('alex-live', {
      ip: '203.0.113.10',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/135.0',
      referer: 'https://www.linkedin.com/jobs/view/123',
    });

    expect(payload.content.contact.email).toBe('');
    expect(payload.content.contact.phone).toBeUndefined();
    expect(payload.content.contact.linkedinUrl).toBe('https://linkedin.com/in/alexsharma');
    expect(eventRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: 'view',
        deviceType: 'desktop',
        browser: 'Chrome',
        os: 'macOS',
        referrer: 'linkedin.com',
      }),
    );
  });

  it('blocks public DOCX download when candidate disables allowDocxDownload', async () => {
    shareRepo.findOne.mockResolvedValue({
      id: 'share-1',
      resumeId: 'res-1',
      slug: 'alex-live',
      isActive: true,
      allowDocxDownload: false,
      hideContactDetails: true,
    });

    await expect(service.exportPublicDocx('alex-live')).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('tracks public PDF downloads and aggregates device, referrer, and 14-day analytics', async () => {
    const shareObj = {
      id: 'share-1',
      resumeId: 'res-1',
      userId: 'user-1',
      slug: 'alex-live',
      isActive: true,
      allowPdfDownload: true,
      allowDocxDownload: true,
      hideContactDetails: false,
      viewCount: 3,
      uniqueVisitorCount: 2,
      downloadCount: 1,
      lastViewedAt: new Date(),
    };

    shareRepo.findOne.mockResolvedValue(shareObj);
    await service.exportPublicPdf(
      'alex-live',
      { html: '<div>Resume</div>', pageSize: 'A4' },
      { ip: '198.51.100.2', userAgent: 'Mozilla/5.0 Chrome/135.0' },
    );

    expect(pdfExportService.generateVectorPdf).toHaveBeenCalledTimes(1);
    expect(shareObj.downloadCount).toBe(2);

    eventRepo.find.mockResolvedValue([
      {
        id: 'e1',
        eventType: 'view',
        deviceType: 'desktop',
        browser: 'Chrome',
        os: 'macOS',
        referrer: 'linkedin.com',
        createdAt: new Date(),
      },
      {
        id: 'e2',
        eventType: 'download_pdf',
        deviceType: 'desktop',
        browser: 'Chrome',
        os: 'macOS',
        referrer: 'linkedin.com',
        createdAt: new Date(),
      },
    ]);

    const summary = await service.getShareWithAnalytics('user-1', 'res-1');
    expect(summary.analytics.pdfDownloads).toBe(1);
    expect(summary.analytics.deviceBreakdown[0]).toEqual({
      device: 'desktop',
      count: 1,
    });
    expect(summary.analytics.referrerBreakdown[0]).toEqual({
      referrer: 'linkedin.com',
      count: 1,
    });
  });
});
