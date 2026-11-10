import { describe, expect, it, vi, beforeEach } from 'vitest';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { ResumesService } from './resumes.service.js';

describe('ResumesService', () => {
  let service: ResumesService;
  let mockResumeRepo: any;
  let mockVersionRepo: any;
  let mockAnalysisRepo: any;
  let mockProfileRepo: any;

  beforeEach(() => {
    mockResumeRepo = {
      create: vi.fn((data) => ({ id: 'res-1', ...data, version: 1 })),
      save: vi.fn((data) => Promise.resolve({ id: 'res-1', ...data })),
      findOne: vi.fn(),
      findAndCount: vi.fn(),
    };

    mockVersionRepo = {
      create: vi.fn((data) => ({ id: 'ver-1', ...data })),
      save: vi.fn((data) => Promise.resolve({ id: 'ver-1', ...data })),
      find: vi.fn(),
      findOne: vi.fn(),
    };

    mockAnalysisRepo = {
      create: vi.fn((data) => ({ id: 'ana-1', ...data })),
      save: vi.fn((data) => Promise.resolve({ id: 'ana-1', ...data })),
    };

    mockProfileRepo = {
      findOne: vi.fn().mockResolvedValue({
        headline: 'Staff Engineer',
        location: 'Bengaluru',
        skills: [{ name: 'Go', category: 'Backend' }],
        experience: [],
        education: [],
        projects: [],
        certifications: [],
      }),
    };

    service = new ResumesService(
      mockResumeRepo,
      mockVersionRepo,
      mockAnalysisRepo,
      mockProfileRepo,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
    );
  });

  describe('createResume', () => {
    it('should seed resume from master profile and initialize version 1', async () => {
      const result = await service.createResume('user-1', {
        name: 'Target: Stripe Staff Infrastructure',
      });

      expect(result.id).toBe('res-1');
      expect(result.name).toBe('Target: Stripe Staff Infrastructure');
      expect(mockVersionRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          resumeId: 'res-1',
          versionNumber: 1,
          changeSummary: 'Initial version created',
        }),
      );
    });
  });

  describe('updateResume', () => {
    it('should throw ConflictException when expectedVersion conflicts with database', async () => {
      mockResumeRepo.findOne.mockResolvedValue({
        id: 'res-1',
        userId: 'user-1',
        version: 3,
        isArchived: false,
      });

      await expect(
        service.updateResume('user-1', 'res-1', {
          name: 'Conflicting Name',
          expectedVersion: 2, // Outdated version submitted
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should successfully update and preserve changes when version matches', async () => {
      const activeResume = {
        id: 'res-1',
        userId: 'user-1',
        name: 'Old Name',
        version: 2,
        isArchived: false,
      };
      mockResumeRepo.findOne.mockResolvedValue(activeResume);

      const result = await service.updateResume('user-1', 'res-1', {
        name: 'Updated Name',
        expectedVersion: 2,
      });

      expect(result.name).toBe('Updated Name');
    });
  });

  describe('runAnalysis', () => {
    it('should evaluate action verbs, quantifiable metrics, and calculate ATS audit score', async () => {
      mockResumeRepo.findOne.mockResolvedValue({
        id: 'res-1',
        userId: 'user-1',
        isArchived: false,
        content: {
          contact: { fullName: 'Abhinav Singh', email: 'test@hyperresume.io' },
          headline: 'Senior Backend Engineer',
          summary: 'Experienced distributed systems engineer.',
          skills: [{ name: 'Go' }, { name: 'PostgreSQL' }],
          experience: [
            {
              company: 'Acme Corp',
              title: 'Senior Engineer',
              startDate: '2022',
              current: true,
              bullets: [
                'Architected distributed microservices reducing p99 latency by 34% across 8M transactions.',
                'Refactored legacy queries and migrated tables.',
              ],
            },
          ],
          education: [{ school: 'MIT', degree: 'BS', field: 'CS' }],
        },
      });

      const analysis = await service.runAnalysis('user-1', 'res-1', {
        analysisType: 'ats_check',
      });

      expect(mockAnalysisRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-1',
          resumeId: 'res-1',
        }),
      );
      expect(analysis.score).toBeGreaterThanOrEqual(70);
      expect(analysis.findings.actionVerbsCount).toBe(2);
      expect(analysis.findings.metricsCount).toBe(1);
      expect(analysis.findings.writingQuality?.score).toBe(100);
      expect(analysis.findings.dimensions).toHaveLength(5);
      expect(analysis.findings.parserRisks?.length).toBeGreaterThan(0);
      expect(analysis.findings.stackAlignment?.totalSkills).toBe(2);
      expect(analysis.recommendations).toBeDefined();
    });
  });

  describe('restoreVersion', () => {
    it('should create an auto-backup if content diverged, restore snapshot content, and record restore event', async () => {
      const currentContent = { headline: 'Unsaved headline draft', summary: 'New', skills: [] };
      const snapshotV1 = { headline: 'Original v1 headline', summary: 'Initial', skills: [{ name: 'Go' }] };

      mockResumeRepo.findOne.mockResolvedValue({
        id: 'res-1',
        userId: 'user-1',
        version: 4,
        isArchived: false,
        content: currentContent,
      });

      mockVersionRepo.findOne
        // 1st call: target version to restore
        .mockResolvedValueOnce({
          id: 'ver-1',
          resumeId: 'res-1',
          versionNumber: 1,
          contentSnapshot: snapshotV1,
        })
        // 2nd call: latest version check for pre-restore auto-backup
        .mockResolvedValueOnce({
          id: 'ver-2',
          resumeId: 'res-1',
          versionNumber: 2,
          contentSnapshot: { headline: 'Older v2 headline', summary: 'Old', skills: [] },
        })
        // 3rd call: createVersion(Auto-backup) latest check
        .mockResolvedValueOnce({
          id: 'ver-2',
          resumeId: 'res-1',
          versionNumber: 2,
        })
        // 4th call: createVersion(Restored) latest check
        .mockResolvedValueOnce({
          id: 'ver-3',
          resumeId: 'res-1',
          versionNumber: 3,
        });

      const restored = await service.restoreVersion('user-1', 'res-1', 'ver-1');

      expect(restored.content).toEqual(snapshotV1);
      expect(mockVersionRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          changeSummary: 'Auto-backup before restoring v1',
          versionNumber: 3,
        }),
      );
      expect(mockVersionRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          changeSummary: 'Restored from version 1',
          versionNumber: 4,
        }),
      );
    });

    it('should throw NotFoundException when restoring non-existent version', async () => {
      mockResumeRepo.findOne.mockResolvedValue({
        id: 'res-1',
        userId: 'user-1',
        version: 2,
        isArchived: false,
      });
      mockVersionRepo.findOne.mockResolvedValueOnce(null);

      await expect(
        service.restoreVersion('user-1', 'res-1', 'missing-ver'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should duplicate an existing resume cleanly with (Copy) name, preserved target metadata, and isMaster false', async () => {
      mockResumeRepo.findOne.mockResolvedValue({
        id: 'res-master-1',
        userId: 'user-1',
        name: 'Master Engineering Profile',
        templateKey: 'jake-ats',
        locale: 'en-US',
        isMaster: true,
        isArchived: false,
        version: 4,
        content: {
          meta: { targetRole: 'Staff Backend Engineer', targetCompany: 'Stripe' },
          contact: { fullName: 'Alex', email: 'alex@example.com' },
          headline: 'Staff Backend Engineer',
          summary: 'Experienced backend architect.',
          skills: [{ name: 'Go' }],
          experience: [],
          education: [],
        },
      });
      mockResumeRepo.create.mockImplementation((d: any) => ({ id: 'res-copy-2', ...d }));
      mockResumeRepo.save.mockImplementation(async (d: any) => d);
      mockVersionRepo.create.mockImplementation((d: any) => d);
      mockVersionRepo.save.mockResolvedValue({});

      const cloned = await service.duplicateResume('user-1', 'res-master-1');

      expect(cloned.name).toBe('Master Engineering Profile (Copy)');
      expect(cloned.isMaster).toBe(false);
      expect(cloned.templateKey).toBe('jake-ats');
      expect(cloned.content.meta?.tailoredFromResumeId).toBe('res-master-1');
      expect(cloned.content.meta?.targetRole).toBe('Staff Backend Engineer');
    });
  });
});
