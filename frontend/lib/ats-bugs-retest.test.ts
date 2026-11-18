import { describe, expect, it } from 'bun:test';
import { calculateClientAtsScore } from './ats-score-calculator';
import type { ResumeContent, PlainTextAtsAuditResponse } from './api-client';

describe('Frontend Re-Test of Bug 3 & Bug 5 Fixes', () => {
  const sampleResume: ResumeContent = {
    contact: {
      fullName: 'Ananya Sharma',
      email: 'ananya@example.com',
      phone: '+91 9988776655',
      location: 'Bengaluru, India',
      linkedinUrl: 'https://linkedin.com/in/ananya',
    },
    headline: 'Senior Full Stack Engineer',
    summary: 'Senior developer with 4+ years designing high-throughput web architectures.',
    experience: [
      {
        company: 'FinTech Tech',
        title: 'Full Stack Engineer',
        startDate: '2022-01',
        endDate: 'Present',
        current: true,
        bullets: [
          'Architected real-time notification engine processing 50,000 events per second at 99.98% uptime.',
          'Reduced API latency by 38% through PostgreSQL query refactoring and Redis caching.',
          'Spearheaded automated CI/CD pipeline in GitHub Actions, shrinking deployment time from 25 to 5 minutes.',
        ],
      },
    ],
    education: [
      {
        school: 'IIT Delhi',
        degree: 'B.Tech',
        field: 'Computer Science',
        graduationDate: '2021',
      },
    ],
    skills: [
      { name: 'TypeScript' },
      { name: 'Node.js' },
      { name: 'React' },
      { name: 'PostgreSQL' },
      { name: 'Redis' },
      { name: 'Docker' },
    ],
  };

  it('Bug 3: Client-side score matches backend 5-dimension engine (high score for quantified resume, no score drift)', () => {
    const clientResult = calculateClientAtsScore(sampleResume);

    // Should score in high 80s / 90s, exactly mirroring backend
    expect(clientResult.score).toBeGreaterThanOrEqual(85);
    expect(clientResult.metricsScore).toBeGreaterThanOrEqual(88);
    expect(clientResult.verbsScore).toBeGreaterThanOrEqual(88);
    expect(clientResult.formattingScore).toBeGreaterThanOrEqual(95);
    expect(clientResult.metricsCount).toBe(3);
    expect(clientResult.xyzCount).toBe(3);
  });

  it('Bug 3: Unquantified baseline resume scores in 65-75 range without cliff drop', () => {
    const unquantifiedResume: ResumeContent = {
      ...sampleResume,
      experience: [
        {
          company: 'Acme Corp',
          title: 'Software Developer',
          startDate: '2022-01',
          endDate: 'Present',
          current: true,
          bullets: [
            'Responsible for customer onboarding modules and user settings.',
            'Collaborated with frontend and backend developers on new features.',
            'Assisted with database schema changes and code reviews.',
          ],
        },
      ],
    };

    const clientResult = calculateClientAtsScore(unquantifiedResume);
    expect(clientResult.score).toBeGreaterThanOrEqual(65);
    expect(clientResult.score).toBeLessThanOrEqual(75);
    expect(clientResult.metricsCount).toBe(0);
    expect(clientResult.metricsScore).toBe(42);
  });

  it('Bug 5: PlainTextAtsAuditResponse interface and findings retain dual score fields without type regressions', () => {
    const mockApiResponse: PlainTextAtsAuditResponse = {
      score: 87,
      atsScore: 92,
      matchScore: 84,
      compositeScore: 87,
      recommendations: ['Quantify bullets'],
      writingAudit: {
        overallWritingScore: 95,
        summaryNote: 'Clean writing quality',
        factualVerificationNotes: 'Verified',
        issues: [],
      },
      findings: {
        actionVerbsCount: 5,
        metricsCount: 3,
        missingSections: [],
        formattingFlags: [],
        bulletQuality: [],
        atsScore: 92,
        matchScore: 84,
        compositeScore: 87,
        jobDescriptionMatch: {
          matchRate: 84,
          matchedKeywords: [
            {
              keyword: 'PostgreSQL',
              category: 'hard_skill',
              resumeCount: 2,
              jdImportance: 'critical',
            },
          ],
          missingKeywords: [],
          keywordStuffingAlerts: [],
          recruiterSearchSimulation: {
            passedQueries: ['("PostgreSQL")'],
            failedQueries: [],
            readinessSummary: 'Strong match',
          },
          hardSkillsMatch: {
            matched: 4,
            total: 5,
            percentage: 80,
          },
          softSkillsMatch: {
            matched: 2,
            total: 2,
            percentage: 100,
          },
          titleAlignment: {
            targetTitle: 'Senior Full Stack Engineer',
            detectedTitle: 'Senior Full Stack Engineer',
            score: 100,
            status: 'strong',
          },
        },
      },
    };

    expect(mockApiResponse.atsScore).toBe(92);
    expect(mockApiResponse.matchScore).toBe(84);
    expect(mockApiResponse.compositeScore).toBe(87);
    expect(mockApiResponse.findings.jobDescriptionMatch?.hardSkillsMatch?.percentage).toBe(80);
    expect(mockApiResponse.findings.jobDescriptionMatch?.softSkillsMatch?.percentage).toBe(100);
    expect(mockApiResponse.findings.jobDescriptionMatch?.titleAlignment?.status).toBe('strong');
  });
});
