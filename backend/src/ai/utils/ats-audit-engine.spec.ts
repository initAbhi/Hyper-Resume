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

    // Verify parsed preview exists
    expect(result.findings.parsedPreview).toBeDefined();
    expect(result.findings.parsedPreview?.contact.fullName).toBe('Abhishek Singh');
    expect(result.findings.parsedPreview?.skillsByCategory.hardSkills.length).toBeGreaterThan(0);
  });

  it('performs Jobscan-style Job Description keyword matching and simulation', () => {
    const rawResume = `Priya Patel
priya@example.com | +1 555-019-2834 | San Francisco, CA | linkedin.com/in/priya-patel

SUMMARY
Senior Software Engineer specializing in distributed backend architecture with Go, Kubernetes, and PostgreSQL.

EXPERIENCE
FinTech Labs — Senior Backend Engineer (2021 - Present)
• Architected payment streaming pipelines in Go and Kafka processing 50,000 QPS with sub-10ms latency.
• Engineered Kubernetes automated deployments with Docker and Terraform across AWS cloud regions.
• Optimized PostgreSQL indexing strategy, reducing query wait times by 40%.

SKILLS
Go, Python, Kubernetes, Docker, AWS, PostgreSQL, Kafka, Terraform, Redis

EDUCATION
B.S. in Computer Science — UC Berkeley (2020)`;

    const targetJd = `We are looking for a Senior Backend Engineer to build resilient distributed services.
Required Skills:
- 4+ years of professional experience with Go or Python
- Deep expertise in Kubernetes, Docker, and AWS
- Strong relational database experience with PostgreSQL and Redis
- Event streaming with Kafka is required
- Experience with GraphQL is a plus`;

    const result = analyzePlainResumeTextAts(rawResume, 'Senior Backend Engineer', targetJd);

    expect(result.findings.jobDescriptionMatch).toBeDefined();
    const jdMatch = result.findings.jobDescriptionMatch!;
    expect(jdMatch.matchRate).toBeGreaterThanOrEqual(75);

    const matchedNames = jdMatch.matchedKeywords.map((k) => k.keyword.toLowerCase());
    expect(matchedNames).toContain('go');
    expect(matchedNames).toContain('kubernetes');
    expect(matchedNames).toContain('postgresql');
    expect(matchedNames).toContain('kafka');

    // Missing preferred skill
    const missingNames = jdMatch.missingKeywords.map((k) => k.keyword.toLowerCase());
    expect(missingNames).toContain('graphql');

    // Recruiter boolean search simulation
    expect(jdMatch.recruiterSearchSimulation.passedQueries.length).toBeGreaterThan(0);
  });

  it('evaluates Google XYZ formula, action verb repetition, and ATS platform readiness', () => {
    const rawResume = `Rahul Verma
rahul@example.com | +91 9988776655 | Bengaluru, India | linkedin.com/in/rahul-dev

SUMMARY
Full-Stack Engineer with 3+ years experience building web applications.

EXPERIENCE
NextGen Tech — Software Engineer (2022 - Present)
• Developed responsive user interfaces in React lifting client conversion by 22%.
• Developed billing microservice in Node.js slashing checkout latency by 35%.
• Developed automated CI/CD pipeline in GitHub Actions cutting build times from 20 to 5 minutes.
• Helped with database backups.

SKILLS
React, Node.js, Next.js, TypeScript, PostgreSQL, GitHub Actions, Redis

EDUCATION
B.Tech in Information Technology (2022)`;

    const result = analyzePlainResumeTextAts(rawResume);

    // Google XYZ formula
    expect(result.findings.xyzFormulaBulletsCount).toBeGreaterThanOrEqual(2);

    // Verb repetition: "Developed" is used 3 times
    expect(result.findings.repeatedVerbsCount).toBeGreaterThanOrEqual(1);
    expect(
      result.findings.actionVerbAnalysis?.repeatedVerbs.some((v) => v.verb.toLowerCase() === 'developed'),
    ).toBe(true);

    // ATS platform simulations
    expect(result.findings.atsSystemSimulations).toBeDefined();
    expect(result.findings.atsSystemSimulations?.workdayReadiness.status).toBe('pass');
    expect(result.findings.atsSystemSimulations?.greenhouseReadiness.status).toBe('pass');
    expect(result.findings.atsSystemSimulations?.taleoReadiness.status).toBe('pass');
  });
});

