import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { LinkedInService } from './linkedin.service.js';
import { evaluateLinkedInProfileScore } from './linkedin-scoring.util.js';
import { buildDeterministicLinkedInOptimization } from '../ai/utils/linkedin-optimizer.util.js';
import type { ResumeContent } from '../resumes/entities/resume.types.js';
import type { User } from '../users/entities/user.entity.js';

describe('LinkedInService & Scoring Engine', () => {
  let service: LinkedInService;
  let mockAuditRepo: any;
  let mockResumeRepo: any;
  let mockShareRepo: any;
  let mockAiService: any;
  let mockProfilesService: any;
  let mockResumesService: any;
  let mockParserService: any;

  const userA = { id: 'user-a', email: 'rohan@example.com', fullName: 'Rohan Mehta' } as User;

  const sampleProfile: ResumeContent = {
    contact: {
      fullName: 'Rohan Mehta',
      email: 'rohan@example.com',
      location: 'Bengaluru, India',
      linkedinUrl: 'https://linkedin.com/in/rohan-mehta-9482b1',
      githubUrl: 'https://github.com/rohanmehta-sys',
    },
    headline: 'Engineer',
    summary: 'Backend engineer working with Go and Kafka.',
    skills: [{ name: 'Go' }, { name: 'Kafka' }, { name: 'PostgreSQL' }],
    experience: [
      {
        company: 'FinEdge Payments',
        title: 'Staff Backend Engineer',
        startDate: '2022',
        current: true,
        bullets: [
          'Re-architected settlement ledger in Go, Kubernetes, and PostgreSQL cutting latency by 80%.',
        ],
      },
    ],
    education: [
      { school: 'NIT Karnataka', degree: 'BTech', field: 'Computer Science', graduationDate: '2019' },
    ],
  };

  beforeEach(() => {
    const audits = new Map<string, any>();

    mockAuditRepo = {
      find: vi.fn().mockImplementation(async () => Array.from(audits.values())),
      findOne: vi.fn().mockImplementation(async ({ where }: any) => {
        const found = audits.get(where.id);
        if (!found || (where.userId && found.userId !== where.userId)) return null;
        return found;
      }),
      create: vi.fn().mockImplementation((payload) => ({ id: 'audit-1', ...payload })),
      save: vi.fn().mockImplementation(async (entity) => {
        const saved = { id: entity.id || 'audit-1', ...entity };
        audits.set(saved.id, saved);
        return saved;
      }),
      remove: vi.fn().mockResolvedValue(undefined),
    };

    mockResumeRepo = {
      findOne: vi.fn().mockResolvedValue({
        id: 'resume-1',
        userId: 'user-a',
        isArchived: false,
        content: sampleProfile,
      }),
      save: vi.fn().mockImplementation(async (r) => r),
    };

    mockShareRepo = {
      findOne: vi.fn().mockResolvedValue({
        resumeId: 'resume-1',
        userId: 'user-a',
        isActive: true,
        slug: 'rohan-mehta-staff',
      }),
    };

    mockAiService = {
      name: 'mock',
      optimizeLinkedInProfile: vi.fn().mockImplementation(async (req) =>
        buildDeterministicLinkedInOptimization(req, 'mock'),
      ),
    };

    mockProfilesService = {
      getProfileByUserId: vi.fn().mockResolvedValue({
        headline: sampleProfile.headline,
        summary: sampleProfile.summary,
        location: sampleProfile.contact.location,
        skills: sampleProfile.skills,
        experience: sampleProfile.experience,
        education: sampleProfile.education,
      }),
      updateProfileByUserId: vi.fn().mockResolvedValue({}),
    };

    mockResumesService = {
      createResume: vi.fn().mockResolvedValue({ id: 'resume-imported', name: 'LinkedIn Import' }),
    };

    mockParserService = {
      parseUploadedFile: vi.fn().mockResolvedValue({
        fileName: 'Profile.pdf',
        extractedTextLength: 920,
        draft: {
          sourceType: 'linkedin_pdf',
          contact: sampleProfile.contact,
          headline: 'Staff Backend Engineer at FinEdge Payments',
          summary: sampleProfile.summary,
          location: 'Bengaluru, India',
          skills: sampleProfile.skills,
          experience: sampleProfile.experience,
          education: sampleProfile.education,
          projects: [],
          certifications: [],
          confidenceScore: 95,
        },
      }),
    };

    service = new LinkedInService(
      mockAuditRepo,
      mockResumeRepo,
      mockShareRepo,
      mockAiService,
      mockProfilesService,
      mockResumesService,
      mockParserService,
    );
  });

  it('scores headline/about gaps accurately and flags non-custom LinkedIn slug suffixes', () => {
    const report = evaluateLinkedInProfileScore({
      profile: sampleProfile,
      targetRole: 'Staff Backend Engineer',
      targetJobDescription: 'Go Kubernetes Kafka Rust Terraform',
      hasPublicShareUrl: true,
    });

    expect(report.overallScore).toBeGreaterThan(20);
    expect(report.overallScore).toBeLessThan(85);
    expect(report.urlHealth.hasCustomSlug).toBe(false);
    expect(report.urlHealth.suggestedSlug).toBe('rohan-mehta');
  });

  it('generates grounded optimization options within LinkedIn 220/2600 char limits and enforces cross-user isolation', async () => {
    const audit = await service.optimizeProfile(userA, {
      resumeId: 'resume-1',
      targetRole: 'Staff Backend Engineer',
      industry: 'FinTech Infrastructure',
      targetJobDescription: 'Looking for Staff Backend Engineer with Go, Kubernetes, Kafka, Terraform',
    });

    expect(audit.optimizations.headlineSuggestions.length).toBe(5);
    audit.optimizations.headlineSuggestions.forEach((h) => {
      expect(h.headline.length).toBeLessThanOrEqual(220);
      expect(h.charCount).toBe(h.headline.length);
    });

    expect(audit.optimizations.aboutOptions.length).toBe(3);
    audit.optimizations.aboutOptions.forEach((a) => {
      expect(a.about.length).toBeLessThanOrEqual(2600);
      expect(a.previewHook.length).toBeLessThanOrEqual(265);
    });

    // Zero hallucination: Kubernetes is in experience bullet -> evidencedSkillsToAdd; Terraform is in JD only -> targetRoleKeywordsToConfirm
    expect(audit.optimizations.skillsStrategy.evidencedSkillsToAdd).toContain('Kubernetes');
    expect(audit.optimizations.skillsStrategy.targetRoleKeywordsToConfirm).toContain('Terraform');
    expect(audit.optimizations.skillsStrategy.evidencedSkillsToAdd).not.toContain('Terraform');

    await expect(service.getAudit('other-user', audit.id)).rejects.toThrow(NotFoundException);
  });

  it('imports LinkedIn Profile PDF, creates resume, syncs profile, and creates audit report', async () => {
    const result = await service.importLinkedInPdfAndOptimize(
      userA,
      Buffer.from('%PDF-1.4 sample'),
      'Profile.pdf',
      'application/pdf',
      { createResume: true, syncToProfile: true, targetRole: 'Staff Backend Engineer' },
    );

    expect(result.draft.sourceType).toBe('linkedin_pdf');
    expect(mockResumesService.createResume).toHaveBeenCalled();
    expect(mockProfilesService.updateProfileByUserId).toHaveBeenCalled();
    expect(result.audit.sourceType).toBe('linkedin_pdf');
    expect(result.createdResume?.id).toBe('resume-imported');
  });

  it('syncs applied headline/about updates back to linked resume and master profile cleanly', async () => {
    const created = await service.optimizeProfile(userA, {
      resumeId: 'resume-1',
      targetRole: 'Staff Backend Engineer',
    });

    const newHeadline = created.optimizations.headlineSuggestions[0].headline;
    const newAbout = created.optimizations.aboutOptions[0].about;

    const updated = await service.applyAuditUpdates(userA.id, created.id, {
      appliedHeadline: newHeadline,
      appliedAbout: newAbout,
      appliedSkills: ['Kubernetes'],
      syncToResume: true,
      syncToProfile: true,
    });

    expect(updated.audit.appliedState.appliedHeadline).toBe(newHeadline);
    expect(updated.audit.overallScore).toBeGreaterThanOrEqual(created.overallScore);
    expect(mockResumeRepo.save).toHaveBeenCalled();
    expect(mockProfilesService.updateProfileByUserId).toHaveBeenCalled();
  });

  it('rejects empty optimization input with BadRequestException', async () => {
    mockResumeRepo.findOne.mockResolvedValueOnce({
      id: 'empty-res',
      userId: userA.id,
      content: { contact: { fullName: 'X', email: 'x@x.com' }, headline: '', summary: '', skills: [], experience: [], education: [] },
    });

    await expect(
      service.optimizeProfile(userA, { resumeId: 'empty-res', targetRole: 'Engineer' }),
    ).rejects.toThrow(BadRequestException);
  });
});
