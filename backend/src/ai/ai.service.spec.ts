import { describe, expect, it, vi, beforeEach } from 'vitest';
import { AiService } from './ai.service.js';
import { MockAiProvider } from './providers/mock-ai.provider.js';

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

    it('should rewrite bullet points using XYZ formula without inventing facts', async () => {
      const original = 'worked on redis caching layer';
      const result = await mockProvider.rewriteBullet(original, 'Backend Engineer', '30% latency reduction');

      expect(result.originalBullet).toBe(original);
      expect(result.rewrittenBullet).toMatch(/^[A-Z][a-z]+ed/);
      expect(result.rewrittenBullet).toContain('30% latency reduction');
      expect(result.framework).toBe('XYZ');
      expect(result.factualVerificationNotes).toBeDefined();
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
  });
});
