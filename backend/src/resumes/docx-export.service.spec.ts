import { describe, expect, it } from 'vitest';
import mammoth from 'mammoth';
import { DocxExportService } from './docx-export.service.js';

describe('DocxExportService', () => {
  const service = new DocxExportService();

  it('should generate a valid OOXML resume .docx preserving contact, experience bullets, skills, and education', async () => {
    const resume: any = {
      id: 'res-1',
      name: 'Alexander Sharma - Staff Engineer',
      content: {
        contact: {
          fullName: 'Alexander Sharma',
          email: 'alexander@example.com',
          phone: '+1 415 555 0192',
          location: 'San Francisco, CA',
          linkedinUrl: 'linkedin.com/in/alexandersharma',
        },
        headline: 'Senior Full Stack Engineer | NestJS & React',
        summary: 'Scaling high-throughput fintech infrastructure serving 2M+ monthly active users.',
        experience: [
          {
            company: 'CloudScale Payments',
            title: 'Senior Full Stack Engineer',
            location: 'San Francisco, CA',
            startDate: '2023-01',
            current: true,
            bullets: [
              'Architected ledger microservices handling 25,000+ RPS at 99.98% uptime.',
            ],
          },
        ],
        skills: [
          { name: 'NestJS', category: 'Backend' },
          { name: 'PostgreSQL', category: 'Databases' },
        ],
        education: [
          {
            school: 'University of Washington',
            degree: 'B.S.',
            field: 'Computer Science',
            graduationDate: '2020',
          },
        ],
        projects: [],
        certifications: [],
      },
    };

    const result = await service.generateResumeDocx(resume, { pageSize: 'A4' });

    expect(result.buffer.subarray(0, 2).toString('ascii')).toBe('PK');
    expect(result.fileName).toBe('Alexander Sharma - Staff Engineer.docx');
    expect(result.atsVerified).toBe(true);
    expect(result.extractableWords).toBeGreaterThan(25);

    const parsed = await mammoth.extractRawText({ buffer: result.buffer });
    expect(parsed.value).toContain('Alexander Sharma');
    expect(parsed.value).toContain('CloudScale Payments');
    expect(parsed.value).toContain('25,000+ RPS');
    expect(parsed.value).toContain('University of Washington');
  });

  it('should generate a valid OOXML cover letter .docx', async () => {
    const letter: any = {
      title: 'Stripe — Staff Platform Engineer',
      targetRole: 'Staff Platform Engineer',
      companyName: 'Stripe',
      accentColor: '#285FEA',
      senderName: 'Alexander Sharma',
      senderEmail: 'alex@example.com',
      recipientLine: 'Maya Lin — Stripe',
      salutation: 'Dear Maya Lin,',
      openingParagraph: 'Scaling distributed payment ledgers at CloudScale Payments prepared me to support Stripe.',
      bodyParagraphs: ['Reduced database p99 latency by 65% eliminating N+1 queries.'],
      closingParagraph: 'I welcome discussing how I can contribute to Stripe platform resilience.',
      signOff: 'Sincerely,',
      updatedAt: '2026-11-10T10:00:00Z',
    };

    const result = await service.generateCoverLetterDocx(letter);
    expect(result.buffer.subarray(0, 2).toString('ascii')).toBe('PK');
    expect(result.atsVerified).toBe(true);
    const parsed = await mammoth.extractRawText({ buffer: result.buffer });
    expect(parsed.value).toContain('Dear Maya Lin,');
    expect(parsed.value).toContain('Reduced database p99 latency by 65%');
  });

  it('should respect custom sectionOrder and hiddenSections when generating resume DOCX', async () => {
    const resume: any = {
      id: 'res-2',
      name: 'Ordered Resume',
      content: {
        layout: {
          sectionOrder: ['education', 'skills', 'experience', 'summary'],
          hiddenSections: ['summary'],
          fontSizeScale: 0.95,
          lineHeight: 1.35,
          accentColor: '#0d9488',
        },
        contact: {
          fullName: 'Priya Nair',
          email: 'priya@example.com',
        },
        headline: 'Distributed Systems Engineer',
        summary: 'Should remain omitted because summary is hidden.',
        skills: [{ name: 'Go' }, { name: 'Kubernetes' }],
        experience: [
          {
            company: 'StreamPay Cloud',
            title: 'Principal Engineer',
            startDate: '2022',
            current: true,
            bullets: ['Scaled Kafka clusters to 40M events/day.'],
          },
        ],
        education: [
          {
            school: 'Georgia Tech',
            degree: 'M.S.',
            field: 'CS',
            graduationDate: '2019',
          },
        ],
      },
    };

    const result = await service.generateResumeDocx(resume);
    const parsed = await mammoth.extractRawText({ buffer: result.buffer });
    const eduIdx = parsed.value.indexOf('EDUCATION');
    const skillsIdx = parsed.value.indexOf('TECHNICAL SKILLS');
    const expIdx = parsed.value.indexOf('EXPERIENCE');

    expect(eduIdx).toBeGreaterThan(-1);
    expect(skillsIdx).toBeGreaterThan(eduIdx);
    expect(expIdx).toBeGreaterThan(skillsIdx);
    expect(parsed.value).not.toContain('Should remain omitted because summary is hidden');
  });

  it('should render customSections in specified layout.sectionOrder and skip hidden custom sections', async () => {
    const resume: any = {
      id: 'res-3',
      name: 'Resume With Custom Sections',
      content: {
        layout: {
          sectionOrder: ['custom:pub-1', 'experience', 'education', 'custom:hidden-awd'],
          hiddenSections: ['custom:hidden-awd'],
        },
        contact: {
          fullName: 'Nadia Patel',
          email: 'nadia@example.com',
        },
        headline: 'Distributed Systems Researcher',
        summary: 'Researcher and systems architect.',
        skills: [{ name: 'Rust' }],
        experience: [
          {
            company: 'GridLabs',
            title: 'Staff Systems Engineer',
            startDate: '2021',
            current: true,
            bullets: ['Designed Raft log compaction engine.'],
          },
        ],
        education: [],
        customSections: [
          {
            id: 'pub-1',
            title: 'Selected Publications',
            kind: 'publications',
            entries: [
              {
                id: 'entry-1',
                heading: 'Zero-Copy Consensus Pipelines',
                subtitle: 'USENIX ATC',
                dateRange: '2025',
                bullets: ['Reduced serialization overhead across geo-replicated clusters.'],
              },
            ],
          },
          {
            id: 'hidden-awd',
            title: 'Secret Awards',
            kind: 'awards',
            entries: [
              {
                id: 'entry-2',
                heading: 'Should Not Export',
                bullets: ['Hidden award detail'],
              },
            ],
          },
        ],
      },
    };

    const result = await service.generateResumeDocx(resume);
    const parsed = await mammoth.extractRawText({ buffer: result.buffer });
    const pubIdx = parsed.value.indexOf('SELECTED PUBLICATIONS');
    const expIdx = parsed.value.indexOf('EXPERIENCE');

    expect(pubIdx).toBeGreaterThan(-1);
    expect(expIdx).toBeGreaterThan(pubIdx);
    expect(parsed.value).toContain('Zero-Copy Consensus Pipelines');
    expect(parsed.value).not.toContain('SECRET AWARDS');
    expect(parsed.value).not.toContain('Should Not Export');
  });
});

