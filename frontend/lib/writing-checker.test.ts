import { describe, expect, it } from 'bun:test';
import type { ResumeContent } from './api-client';
import {
  analyzePlainResumeText,
  analyzeResumeWriting,
  applyAllSafeFixes,
  applyWritingIssueFix,
} from './writing-checker';

describe('Resume Grammar, Spelling & Buzzword Checker', () => {
  it('returns zero issues and 100 score on crisp, well-written engineering bullets', () => {
    const cleanResume: ResumeContent = {
      contact: { fullName: 'Alexander Sharma', email: 'alex@example.com' },
      headline: 'Senior Full Stack Engineer | TypeScript | React | NestJS',
      summary:
        'Distributed systems architect scaling event-driven financial APIs and low-latency analytics.',
      skills: [{ name: 'NestJS' }, { name: 'PostgreSQL' }],
      education: [{ school: 'UW', degree: 'B.S.', field: 'Computer Science' }],
      experience: [
        {
          company: 'CloudScale Payments',
          title: 'Senior Full Stack Engineer',
          startDate: '2023-01',
          current: true,
          bullets: [
            'Architected event-driven ledger microservices using NestJS, PostgreSQL, and Redis handling 25,000+ RPS at 99.98% uptime.',
            'Engineered interactive analytics dashboard in Next.js 15 and TypeScript, reducing p95 page load latency by 42% across 180K merchants.',
            'Automated zero-downtime CI/CD pipelines with Docker and GitHub Actions, cutting deployment cycles from 4 days to 35 minutes.',
          ],
        },
        {
          company: 'Nexus FinTech Labs',
          title: 'Software Engineer',
          startDate: '2020-06',
          endDate: '2022-12',
          current: false,
          bullets: [
            'Spearheaded checkout settlement API optimization, eliminating N+1 queries and lowering p99 database latency by 65%.',
            'Built WCAG 2.1 AA compliant customer billing portal using React and Tailwind CSS, lifting self-serve conversion by 19%.',
          ],
        },
      ],
    };

    const report = analyzeResumeWriting(cleanResume);
    expect(report.overallWritingScore).toBe(100);
    expect(report.issues).toHaveLength(0);
  });

  it('detects typos, repeated words, articles, past-role present tense, pronouns, and buzzwords with accurate 1-click fixes', () => {
    const noisyResume: ResumeContent = {
      contact: { fullName: 'Test Candidate', email: 'test@example.com' },
      headline: 'Hardworking software engineer with strong experince',
      summary:
        'Results-driven team player building synergy in the the kuberentes cloud.',
      skills: [{ name: 'Go' }],
      education: [],
      experience: [
        {
          company: 'Legacy Corp',
          title: 'Software Engineer',
          startDate: '2020',
          endDate: '2022',
          current: false,
          bullets: [
            'Responsible for building a architecture and utilize Redis for my team.',
            'Manage PostgreSQL migrations  across clusters .',
          ],
        },
      ],
    };

    const report = analyzeResumeWriting(noisyResume);
    const categories = new Set(report.issues.map((i) => i.category));

    expect(categories.has('spelling')).toBe(true);
    expect(categories.has('grammar')).toBe(true);
    expect(categories.has('buzzword')).toBe(true);
    expect(categories.has('weak_phrasing')).toBe(true);
    expect(report.overallWritingScore).toBeLessThan(70);

    // Single targeted fix applies cleanly without side-effects
    const typoIssue = report.issues.find((i) => i.matchedText.toLowerCase() === 'experince');
    expect(typoIssue).toBeDefined();
    if (typoIssue) {
      const onceFixed = applyWritingIssueFix(noisyResume, typoIssue);
      expect(onceFixed.headline).toContain('experience');
    }

    // Batch fix eliminates all auto-fixable errors
    const { updated, appliedCount } = applyAllSafeFixes(noisyResume, report.issues);
    expect(appliedCount).toBeGreaterThanOrEqual(6);
    expect(updated.headline).not.toContain('experince');
    expect(updated.summary).not.toContain('the the');
    expect(updated.summary).toContain('Kubernetes');
    expect(updated.experience[0].bullets[0]).toContain('Built');
    expect(updated.experience[0].bullets[0]).toContain('an architecture');
    expect(updated.experience[0].bullets[1]).toContain('Managed');

    const recheck = analyzeResumeWriting(updated);
    expect(recheck.issues.filter((i) => i.severity === 'error')).toHaveLength(0);
    expect(recheck.overallWritingScore).toBeGreaterThan(report.overallWritingScore);
  });

  it('analyzes unstructured plain resume text cleanly', () => {
    const plain = `SUMMARY
Responsible for maintaining backend APIs wiht team player mindset.
• Helped with deploying kuberentes clusters and the the database.`;
    const report = analyzePlainResumeText(plain);
    expect(report.issues.length).toBeGreaterThanOrEqual(4);
    expect(report.issues.some((i) => i.category === 'spelling')).toBe(true);
    expect(report.issues.some((i) => i.category === 'buzzword')).toBe(true);
  });
});

