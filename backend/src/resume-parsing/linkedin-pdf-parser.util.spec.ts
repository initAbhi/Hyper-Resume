import { describe, expect, it } from 'vitest';
import {
  detectLinkedInProfilePdf,
  normalizeParsedProfileDraft,
  parseGenericResumeText,
  parseLinkedInProfileText,
} from './linkedin-pdf-parser.util.js';

const SAMPLE_LINKEDIN_TEXT = `
Contact
rohan.mehta@cloudscale.dev
+91 98450 22190
www.linkedin.com/in/
rohan-mehta-9482b1 (LinkedIn)
github.com/rohanmehta-sys (Other)

Top Skills
Distributed Systems
Go (Programming Language)
Kubernetes
Apache Kafka

Languages
English (Full Professional)
Hindi (Native or Bilingual)

Certifications
AWS Certified Solutions Architect - Professional

Rohan Mehta
Staff Backend Engineer at FinEdge Payments
Bengaluru, Karnataka, India

Summary
Backend systems engineer with 7+ years designing low-latency payment ledgers and multi-region Kafka pipelines.

Experience
FinEdge Payments
3 years 8 months
Staff Backend Engineer
April 2024 - Present (1 year 8 months)
Bengaluru, Karnataka, India
- Re-architected multi-region settlement ledger in Go and PostgreSQL, cutting p99 checkout latency to 38ms.

Senior Backend Engineer
April 2022 - March 2024 (2 years)
Bengaluru, Karnataka, India
- Built idempotent webhook dispatch worker maintaining 99.98% delivery SLA.

Education
National Institute of Technology Karnataka
Bachelor of Technology, Computer Science and Engineering · (2015 - 2019)

Page 1 of 1
`;

describe('linkedin-pdf-parser.util', () => {
  it('detects LinkedIn Save-to-PDF layout and rejoins wrapped profile URLs', () => {
    const detection = detectLinkedInProfilePdf(SAMPLE_LINKEDIN_TEXT);
    expect(detection.isLinkedInPdf).toBe(true);
    expect(detection.linkedinSlug).toBe('rohan-mehta-9482b1');
    expect(detection.hasCustomSlug).toBe(false);
    expect(detection.detectedSections).toContain('Top Skills');
  });

  it('parses grouped multi-role experience and separates spoken Languages from Skills', () => {
    const draft = parseLinkedInProfileText(SAMPLE_LINKEDIN_TEXT);
    expect(draft.sourceType).toBe('linkedin_pdf');
    expect(draft.contact?.fullName).toBe('Rohan Mehta');
    expect(draft.contact?.email).toBe('rohan.mehta@cloudscale.dev');
    expect(draft.contact?.linkedinUrl).toBe('https://linkedin.com/in/rohan-mehta-9482b1');

    expect(draft.experience.length).toBe(2);
    expect(draft.experience[0].company).toBe('FinEdge Payments');
    expect(draft.experience[0].title).toBe('Staff Backend Engineer');
    expect(draft.experience[0].current).toBe(true);
    expect(draft.experience[1].company).toBe('FinEdge Payments');
    expect(draft.experience[1].title).toBe('Senior Backend Engineer');
    expect(draft.experience[1].current).toBe(false);

    const skillNames = draft.skills.map((s) => s.name);
    expect(skillNames).toContain('Go');
    expect(skillNames).toContain('Kubernetes');
    expect(skillNames).not.toContain('English');
    expect(skillNames).not.toContain('Hindi');
    expect(draft.languages).toContain('English (Full Professional)');
    expect(draft.education[0].school).toBe('National Institute of Technology Karnataka');
    expect(draft.certifications.length).toBe(1);
  });

  it('strips spoken language pollution when normalizing AI-parsed drafts from LinkedIn PDFs', () => {
    const aiDraftWithLanguageNoise = {
      contact: { fullName: 'Rohan Mehta', email: 'rohan.mehta@cloudscale.dev' },
      headline: 'Staff Backend Engineer at FinEdge Payments',
      summary: 'Distributed systems engineer.',
      location: 'Bengaluru, India',
      skills: [
        { name: 'Kubernetes', category: 'Tech' },
        { name: 'English', category: 'Language' },
        { name: 'Hindi', category: 'Language' },
      ],
      experience: [],
      education: [],
      projects: [],
      certifications: [],
      confidenceScore: 91,
    };

    const normalized = normalizeParsedProfileDraft(aiDraftWithLanguageNoise, SAMPLE_LINKEDIN_TEXT);
    const skillNames = normalized.skills.map((s) => s.name);
    expect(normalized.sourceType).toBe('linkedin_pdf');
    expect(skillNames).not.toContain('English');
    expect(skillNames).not.toContain('Hindi');
    expect(skillNames).toContain('Kubernetes');
    expect(normalized.experience.length).toBe(2);
  });

  it('parses generic non-LinkedIn resumes faithfully without fabricating Acme Cloud Infrastructure', () => {
    const genericText = `
      Maya Lin
      Product Data Analyst
      maya.lin@datahub.io
      https://github.com/mayalin-analytics
      Summary
      Data analyst specializing in SQL, Python, and revenue cohort modeling.
      Experience
      - Built PostgreSQL funnel dashboards cutting weekly reporting lag by 65%.
    `;
    const draft = parseGenericResumeText(genericText);
    expect(draft.sourceType).toBe('standard_resume');
    expect(draft.contact?.email).toBe('maya.lin@datahub.io');
    expect(JSON.stringify(draft)).not.toContain('Acme Cloud Infrastructure');
    expect(draft.skills.map((s) => s.name)).toEqual(expect.arrayContaining(['SQL', 'Python', 'PostgreSQL']));
  });
});

