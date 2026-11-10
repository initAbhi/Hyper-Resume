import { describe, expect, it } from 'vitest';
import {
  analyzePlainResumeTextAts,
  evaluateStructuredResumeAts,
} from './ats-audit-engine.js';
import type { ResumeContent } from '../../resumes/entities/resume.types.js';

describe('5-Dimension Rezi-Style ATS & Parser Audit Engine', () => {
  it('computes 5 weighted dimensions, stack alignment, and bullet bounds on structured resumes', () => {
    const content: ResumeContent = {
      contact: {
        fullName: 'Abhinav Sharma',
        email: 'abhinav@example.com',
        phone: '+91 9876543210',
        linkedinUrl: 'linkedin.com/in/abhinavsharma',
      },
      headline: 'Senior Backend Engineer',
      summary:
        'Distributed systems engineer architecting low-latency NestJS and PostgreSQL payment pipelines.',
      skills: [
        { name: 'NestJS' },
        { name: 'PostgreSQL' },
        { name: 'Redis' },
        { name: 'Rust' },
      ],
      experience: [
        {
          company: 'CloudScale',
          title: 'Senior Backend Engineer',
          startDate: '2022-01',
          current: true,
          bullets: [
            'Architected event-driven NestJS and PostgreSQL ledger pipeline processing 25,000 req/s with 99.98% uptime.',
            'Spearheaded Redis read-through cache tier reducing p99 API latency by 42% across 180K active merchants.',
            'Worked on internal tooling.',
          ],
        },
      ],
      education: [
        {
          school: 'IIT Bombay',
          degree: 'B.Tech',
          field: 'Computer Science',
          graduationDate: '2020',
        },
      ],
    };

    const result = evaluateStructuredResumeAts(content);

    expect(result.findings.dimensions).toHaveLength(5);
    const weightSum = result.findings.dimensions!.reduce((s, d) => s + d.weight, 0);
    expect(weightSum).toBe(100);

    expect(result.findings.actionVerbsCount).toBe(2);
    expect(result.findings.metricsCount).toBe(2);
    expect(result.findings.shortBulletsCount).toBe(1);
    expect(result.findings.stackAlignment?.corroboratedSkills).toEqual([
      'NestJS',
      'PostgreSQL',
      'Redis',
    ]);
    expect(result.findings.stackAlignment?.unreferencedSkills).toEqual(['Rust']);
    expect(result.score).toBeGreaterThanOrEqual(70);
    expect(result.findings.parserRisks?.some((r) => r.id === 'contact-pass')).toBe(true);
  });

  it('extracts plain-text sections cleanly without flagging header emails as bullets and catches table/glyph parser risks', () => {
    const rawResume = `Abhishek Singh
abhishek@example.com | +91 98765 43210 | linkedin.com/in/abhishek-dev

PROFESSIONAL SUMMARY
Results-driven Backend Engineer with 4 years experience building distributed APIs in TypeScript and PostgreSQL.

EXPERIENCE
FinTech Corp — Backend Engineer (2022-01 – Present)
• Architected payment ingestion service handling 1.2M daily transactions, cutting latency by 35%.
• ★ Deployed ★ multi-region failover cluster saving $120K annually across cloud infrastructure.
TypeScript | Node.js | AWS | Docker

EDUCATION
B.Tech Computer Science — 2021

SKILLS
TypeScript, Node.js, PostgreSQL, AWS, Docker`;

    const result = analyzePlainResumeTextAts(rawResume);

    expect(result.findings.missingSections).toHaveLength(0);
    expect(result.findings.metricsCount).toBe(2);
    // Email header line must NOT be audited as a lowercase experience bullet typo
    expect(
      result.writingAudit.issues.some((i) =>
        i.matchedText.toLowerCase().includes('abhishek'),
      ),
    ).toBe(false);
    // Multi-column pipe line in experience body is caught as a formatting risk
    expect(
      result.findings.parserRisks?.some(
        (r) => r.id === 'layout-table-risk' && r.severity === 'warning',
      ),
    ).toBe(true);
  });
});

