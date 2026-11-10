import { describe, expect, it, vi, beforeEach } from 'vitest';
import { AiService } from './ai.service.js';
import { MockAiProvider } from './providers/mock-ai.provider.js';
import { sanitizeSectionRewriteResult } from './utils/section-rewriter.util.js';

describe('AiService & Providers', () => {
  let aiService: AiService;
  let mockProvider: MockAiProvider;
  let geminiProvider: any;
  let mockConfigService: any;

  beforeEach(() => {
    mockProvider = new MockAiProvider();
    geminiProvider = {
      name: 'gemini',
      parseResumeText: vi.fn(),
      parseJobDescription: vi.fn(),
      matchRequirements: vi.fn(),
      rewriteBullet: vi.fn(),
      generateBullets: vi.fn(),
      generateSummaryAndHeadlines: vi.fn(),
      generateCoverLetter: vi.fn(),
      checkWritingQuality: vi.fn(),
    };

    mockConfigService = {
      get: vi.fn((key: string, defaultVal?: any) => {
        if (key === 'AI_PROVIDER') return 'mock';
        return defaultVal;
      }),
    };

    aiService = new AiService(
      mockConfigService,
      mockProvider,
      geminiProvider,
    );
  });

  describe('MockAiProvider', () => {
    it('should extract known technical skills deterministically', async () => {
      const text = 'Extensive experience in Go, TypeScript, Docker, and PostgreSQL.';
      const draft = await mockProvider.parseResumeText(text);

      const skillNames = draft.skills.map((s) => s.name);
      expect(skillNames).toContain('Go');
      expect(skillNames).toContain('TypeScript');
      expect(skillNames).toContain('Docker');
      expect(skillNames).toContain('PostgreSQL');
      expect(draft.confidenceScore).toBe(92);
    });

    it('should rewrite bullet points using XYZ formula without inventing facts or passive prefixes', async () => {
      const original = 'Responsible for worked on redis caching layer';
      const result = await mockProvider.rewriteBullet(original, 'Backend Engineer', '30% latency reduction');

      expect(result.originalBullet).toBe(original);
      expect(result.rewrittenBullet).toMatch(/^[A-Z][a-z]+ed/);
      expect(result.rewrittenBullet).not.toContain('Responsible for');
      expect(result.rewrittenBullet).toContain('30% latency reduction');
      expect(result.framework).toBe('XYZ');
      expect(result.factualVerificationNotes).toBeDefined();
      expect(result.variants?.length).toBe(3);
    });

    it('should generate 3 role-specific STAR/XYZ bullet drafts without inventing metrics', async () => {
      const generated = await mockProvider.generateBullets({
        roleTitle: 'Store Manager',
        focusArea: 'inventory scheduling and cashier onboarding',
      });

      expect(generated.roleTitle).toBe('Store Manager');
      expect(generated.bullets.length).toBe(3);
      expect(generated.bullets[0].bullet).toContain('inventory scheduling');
      expect(generated.factualVerificationNotes).toBeDefined();
    });

    it('should synthesize 3 grounded headlines and 3 tone-distinct summaries', async () => {
      const result = await mockProvider.generateSummaryAndHeadlines({
        targetRole: 'Principal Backend Engineer',
        skills: ['NestJS', 'PostgreSQL', 'Redis', 'Kubernetes'],
        experience: [
          {
            title: 'Senior Backend Engineer',
            company: 'CloudScale Payments',
            bullets: ['Architected event-driven ledger handling 25,000+ RPS at 99.98% uptime'],
          },
        ],
      });

      expect(result.headlineSuggestions).toHaveLength(3);
      expect(result.headlineSuggestions[0].headline).toContain('Principal Backend Engineer');
      expect(result.summaryOptions).toHaveLength(3);
      expect(result.summaryOptions.map((o) => o.tone)).toEqual([
        'Executive',
        'Impact & Metrics',
        'Technical & Concise',
      ]);
      expect(result.summaryOptions[1].summary).toContain('25,000+ RPS');
      expect(result.factualVerificationNotes).toContain('zero external metrics invented');
    });

    it('should categorize missing skills as not_evidenced instead of hallucinating', async () => {
      const resumeContent = {
        contact: { fullName: 'Abhinav Singh', email: 'test@hyperresume.io' },
        headline: 'Go Backend Developer',
        summary: 'Go and Redis backend developer',
        skills: [{ name: 'Go' }, { name: 'Redis' }],
        experience: [{ bullets: ['Developed Go microservices'] }],
        education: [],
      };

      const requirements = [
        {
          id: 'req-1',
          text: 'Rust systems programming',
          type: 'required_skill' as const,
          importance: 'critical' as const,
          keywords: ['rust'],
        },
      ];

      const match = await mockProvider.matchRequirements(resumeContent as any, requirements);
      expect(match[0].status).toBe('not_evidenced');
      expect(match[0].suggestedAction).toContain('Do not invent this skill');
    });
  });

  describe('Resilience and Outage Fallback', () => {
    it('should fallback gracefully to MockAiProvider when primary provider throws', async () => {
      // Simulate active Gemini provider that throws
      geminiProvider.parseJobDescription.mockRejectedValue(new Error('Rate limit exceeded (429)'));
      (aiService as any).activeProvider = geminiProvider;

      const result = await aiService.parseJobDescription('Looking for Go and Kubernetes engineer');
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      expect(result.some((r) => r.keywords.includes('go'))).toBe(true);
    });

    it('should fallback to MockAiProvider when generateBullets fails on primary provider', async () => {
      geminiProvider.generateBullets.mockRejectedValue(new Error('Gemini timeout'));
      (aiService as any).activeProvider = geminiProvider;

      const result = await aiService.generateBullets({ roleTitle: 'Product Manager' });
      expect(result.bullets.length).toBe(3);
      expect(result.provider).toBe('mock');
    });

    it('should fallback to MockAiProvider when generateSummaryAndHeadlines fails on primary provider', async () => {
      geminiProvider.generateSummaryAndHeadlines.mockRejectedValue(
        new Error('Gemini unavailable'),
      );
      (aiService as any).activeProvider = geminiProvider;

      const result = await aiService.generateSummaryAndHeadlines({
        targetRole: 'Staff Platform Engineer',
        skills: ['TypeScript', 'PostgreSQL'],
        experience: [
          {
            title: 'Senior Engineer',
            company: 'Nexus FinTech',
            bullets: ['Eliminated N+1 queries reducing p99 database latency by 65%'],
          },
        ],
      });

      expect(result.headlineSuggestions).toHaveLength(3);
      expect(result.summaryOptions).toHaveLength(3);
      expect(result.provider).toBe('mock');
    });

    it('should synthesize tailored cover letter with MockAiProvider and fallback cleanly when Gemini fails', async () => {
      const sampleResume = {
        contact: { fullName: 'Alexander Sharma', email: 'alex@example.com' },
        headline: 'Senior Full Stack Engineer',
        summary: 'Scalable distributed microservices architect.',
        skills: [{ name: 'NestJS' }, { name: 'PostgreSQL' }, { name: 'Redis' }],
        experience: [
          {
            title: 'Senior Full Stack Engineer',
            company: 'CloudScale Payments',
            startDate: '2023-01',
            current: true,
            bullets: ['Architected event-driven ledger handling 25,000+ RPS'],
          },
        ],
        education: [],
      };

      const mockDraft = await mockProvider.generateCoverLetter({
        resumeContent: sampleResume as any,
        targetRole: 'Staff Platform Engineer',
        companyName: 'Stripe',
        hiringManager: 'Maya Lin',
        jobDescription: 'Seeking Staff Platform Engineer with PostgreSQL and Redis expertise.',
        tone: 'Technical',
      });

      expect(mockDraft.salutation).toBe('Dear Maya Lin,');
      expect(mockDraft.bodyParagraphs.length).toBe(2);
      expect(mockDraft.highlightedKeywords).toContain('PostgreSQL');
      expect(mockDraft.factualVerificationNotes).toContain('zero invented metrics');

      geminiProvider.generateCoverLetter.mockRejectedValue(new Error('Gemini rate limit'));
      (aiService as any).activeProvider = geminiProvider;

      const fallbackDraft = await aiService.generateCoverLetter({
        resumeContent: sampleResume as any,
        targetRole: 'Staff Platform Engineer',
        companyName: 'Stripe',
        tone: 'Executive',
      });

      expect(fallbackDraft.provider).toBe('mock');
      expect(fallbackDraft.openingParagraph).toContain('Stripe');
    });

    it('should detect spelling, grammar, buzzwords, pronouns, and weak phrasing accurately with zero false positives on clean bullets', async () => {
      const cleanReport = await mockProvider.checkWritingQuality({
        headline: 'Senior Full Stack Engineer | TypeScript | React | NestJS',
        summary: 'Distributed systems architect scaling event-driven financial APIs.',
        experience: [
          {
            title: 'Senior Full Stack Engineer',
            company: 'CloudScale Payments',
            current: true,
            bullets: [
              'Architected event-driven ledger microservices using NestJS, PostgreSQL, and Redis handling 25,000+ RPS at 99.98% uptime.',
              'Engineered interactive analytics dashboard in Next.js 15 and TypeScript, reducing p95 page load latency by 42% across 180K merchants.',
            ],
          },
        ],
      });

      expect(cleanReport.issues).toHaveLength(0);
      expect(cleanReport.overallWritingScore).toBe(100);

      const noisyReport = await mockProvider.checkWritingQuality({
        summary: 'Hardworking team player with 5 years experince building synergy in the the cloud.',
        experience: [
          {
            title: 'Software Engineer',
            company: 'Acme Co',
            current: false,
            endDate: '2022',
            bullets: [
              'Responsible for building a architecture and utilize Redis for my team.',
            ],
          },
        ],
      });

      const categories = new Set(noisyReport.issues.map((i) => i.category));
      expect(categories.has('spelling')).toBe(true);
      expect(categories.has('grammar')).toBe(true);
      expect(categories.has('buzzword')).toBe(true);
      expect(categories.has('weak_phrasing')).toBe(true);
      expect(noisyReport.issues.some((i) => i.rewrittenText.includes('Built'))).toBe(true);
      expect(noisyReport.issues.some((i) => i.rewrittenText.includes('experience'))).toBe(true);

      geminiProvider.checkWritingQuality.mockRejectedValue(new Error('Gemini offline'));
      (aiService as any).activeProvider = geminiProvider;
      const fallbackCheck = await aiService.checkWritingQuality({
        summary: 'Hardworking specialist with great experince.',
        experience: [],
      });
      expect(fallbackCheck.provider).toBe('mock');
      expect(fallbackCheck.issues.length).toBeGreaterThanOrEqual(2);
    });

    it('should generate LinkedIn optimization options cleanly and fallback when Gemini throws', async () => {
      const sampleContent = {
        contact: { fullName: 'Rohan Mehta', email: 'rohan@example.com' },
        headline: 'Backend Engineer',
        summary: 'Distributed systems engineer building Go and Kafka pipelines.',
        skills: [{ name: 'Go' }, { name: 'Kafka' }],
        experience: [
          {
            title: 'Staff Backend Engineer',
            company: 'FinEdge Payments',
            startDate: '2022',
            current: true,
            bullets: ['Engineered Go and Kubernetes ledger processing 14M events/day.'],
          },
        ],
        education: [],
      };

      const direct = await mockProvider.optimizeLinkedInProfile({
        profile: sampleContent as any,
        targetRole: 'Staff Backend Engineer',
        industry: 'FinTech',
      });
      expect(direct.headlineSuggestions).toHaveLength(5);
      expect(direct.aboutOptions).toHaveLength(3);
      expect(direct.skillsStrategy.evidencedSkillsToAdd).toContain('Kubernetes');

      geminiProvider.optimizeLinkedInProfile = vi.fn().mockRejectedValue(new Error('Timeout'));
      (aiService as any).activeProvider = geminiProvider;
      const fallback = await aiService.optimizeLinkedInProfile({
        profile: sampleContent as any,
        targetRole: 'Staff Backend Engineer',
      });
      expect(fallback.provider).toBe('mock');
      expect(fallback.headlineSuggestions).toHaveLength(5);
    });

    it('should rewrite sections in distinct tones, scrub fabricated AI metrics, and fall back safely when Gemini throws', async () => {
      const expInput = {
        sectionType: 'experience' as const,
        tone: 'executive' as const,
        targetRole: 'Principal Platform Engineer',
        candidateSkills: ['Go', 'Kubernetes', 'PostgreSQL'],
        experienceEntries: [
          {
            title: 'Senior Backend Engineer',
            company: 'CloudScale Payments',
            bullets: [
              'Responsible for worked on distributed Go payment ledger processing 25,000+ RPS.',
            ],
          },
        ],
      };

      const direct = await mockProvider.rewriteSection(expInput);
      expect(direct.experienceRewrites).toHaveLength(1);
      expect(direct.experienceRewrites![0].title).toBe('Senior Backend Engineer');
      expect(direct.experienceRewrites![0].company).toBe('CloudScale Payments');
      expect(direct.experienceRewrites![0].rewrittenBullets[0]).not.toContain('Responsible for');
      expect(direct.experienceRewrites![0].rewrittenBullets[0]).toContain('25,000+ RPS');

      // Sanitizer scrubs un-evidenced hallucinated numbers injected by an LLM
      const sanitized = sanitizeSectionRewriteResult(expInput, {
        experienceRewrites: [
          {
            index: 0,
            title: 'Tampered Title',
            company: 'Fake Corp',
            originalBullets: expInput.experienceEntries[0].bullets,
            rewrittenBullets: [
              'Spearheaded Go ledger processing 25,000+ RPS and saved $4M annually.',
            ],
          },
        ],
      });
      expect(sanitized.experienceRewrites![0].title).toBe('Senior Backend Engineer');
      expect(sanitized.experienceRewrites![0].company).toBe('CloudScale Payments');
      expect(sanitized.experienceRewrites![0].rewrittenBullets[0]).not.toContain('$4M');
      expect(sanitized.warnings!.length).toBeGreaterThan(0);

      // Service fallback when Gemini fails
      geminiProvider.rewriteSection = vi.fn().mockRejectedValue(new Error('Gemini offline'));
      (aiService as any).activeProvider = geminiProvider;
      const customResult = await aiService.rewriteSection({
        sectionType: 'custom',
        sectionTitle: 'Awards & Honors',
        tone: 'impact',
        customEntries: [
          {
            heading: 'Engineering Excellence Award',
            bullets: ['Responsible for leading zero-downtime DB migration tool.'],
          },
        ],
      });
      expect(customResult.provider).toBe('mock');
      expect(customResult.customRewrites![0].heading).toBe('Engineering Excellence Award');
      expect(customResult.customRewrites![0].rewrittenBullets[0]).not.toContain('Responsible for');
    });
  });
});
