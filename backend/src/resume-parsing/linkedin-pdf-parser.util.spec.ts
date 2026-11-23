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

  it('does not let a single hallucinated AI experience wipe deterministic jobs', () => {
    const resumeText = `
      Abhi Singh
      Full Stack Developer
      developerabhi17@gmail.com
      Mumbai, India
      PROFESSIONAL SUMMARY
      Full Stack Developer with 2 years of experience building NestJS and Next.js systems.
      WORK EXPERIENCE
      Full Stack developer
      Algoocean | Mumbai
      June 2024 – Present
      - Built NestJS APIs for a dating platform with 500K users.
      - Deployed services on AWS EC2 with Docker and GitHub Actions.
      Full Stack developer
      SAAR IT | Remote
      June 2023 – May 2024
      - Delivered 3D GIS features with React, Node.js, and PostgreSQL.
      PROJECTS
      Infodatabox - Cloud Storage Platform
      - Built NestJS/AWS S3 storage APIs.
      Init.new – AI Website Builder
      - Integrated Gemini API with Next.js and Convex.
      EDUCATION
      Bachelors in Computer Application (BCA)
      Tilak Maharashtra Vidyapeeth
      2026
    `;
    const aiDraft = {
      contact: { fullName: 'Abhi Singh', email: 'developerabhi17@gmail.com' },
      headline: 'Full Stack Developer',
      summary: 'Wrong single-job hallucinated draft.',
      location: 'Mumbai, India',
      skills: [{ name: 'TypeScript', category: 'Tech' }],
      experience: [
        {
          company: 'HyperResume Tech',
          title: 'Senior Full Stack Engineer',
          startDate: '2023',
          current: true,
          bullets: ['Built a resume product.'],
        },
      ],
      education: [],
      projects: [],
      certifications: [],
      confidenceScore: 88,
    };

    const normalized = normalizeParsedProfileDraft(aiDraft, resumeText);
    const companies = normalized.experience.map((e) => e.company);
    expect(companies).toEqual(expect.arrayContaining(['Algoocean', 'SAAR IT']));
    expect(companies).not.toEqual(['HyperResume Tech']);
    expect(normalized.experience.length).toBeGreaterThanOrEqual(2);
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
    // Bullets-only experience must NOT invent a sentinel "Work Experience" role
    expect(draft.experience.every((e) => e.company !== 'Work Experience')).toBe(true);
  });

  it('parses ATS title|date same-line roles and keeps projects intact without View Project ghosts', () => {
    const atsText = `
      Abhi Singh
      Full Stack Developer
      Mumbai, India | developerabhi17@gmail.com | +91 6268644194
      linkedin.com/in/developer-abhi-j1714 | github.com/initAbhi | myportfolio
      PROFESSIONAL SUMMARY
      Full Stack Developer with 2 years of experience building NestJS and Next.js systems.
      WORK EXPERIENCE
      Full Stack developer June 2024 - Present
      Algoocean | Mumbai
      - Developed NestJS APIs for a dating platform with 500K users.
      - Deployed services on AWS EC2 with Docker and GitHub Actions.
      Full Stack developer June 2023 - May 2024
      SAAR IT | Remote
      - Delivered 3D GIS features with React, Node.js, and PostgreSQL.
      SKILLS
      Languages - TypeScript | JavaScript | Python
      Frontend - Next.js | React.js
      PROJECTS
      Infodatabox - Cloud Storage Platform (Algoocean) View Project
      Next.js | NestJS | PostgreSQL | AWS S3
      - Built NestJS/AWS S3 storage APIs.
      - Deployed on EC2 with Nginx and PM2.
      Init.new - AI Website Builder
      Next.js | Convex | MongoDB
      - Integrated Gemini API with Next.js and Convex.
      EDUCATION
      Bachelors in Computer Application (BCA)
      Tilak Maharashtra Vidyapeeth
      2026
    `;

    const draft = parseGenericResumeText(atsText);
    expect(draft.contact?.fullName).toBe('Abhi Singh');
    expect(draft.headline.toLowerCase()).not.toContain('linkedin.com');
    expect(draft.experience.map((e) => e.company)).toEqual(['Algoocean', 'SAAR IT']);
    expect(draft.experience[0].title).toMatch(/full stack/i);
    expect(draft.experience[0].bullets.length).toBeGreaterThanOrEqual(2);
    expect(draft.projects.length).toBe(2);
    expect(draft.projects[0].name).toMatch(/Infodatabox/i);
    expect(draft.projects[0].description).toMatch(/Next\.js/i);
    expect(draft.projects[0].highlights.length).toBeGreaterThanOrEqual(2);
    expect(draft.projects.every((p) => !/view project/i.test(p.name))).toBe(true);
    expect(draft.projects.every((p) => p.description !== p.name)).toBe(true);

    const aiDraft = {
      contact: { fullName: 'Abhi Singh', email: 'developerabhi17@gmail.com' },
      headline: 'Full Stack Developer',
      summary: 'AI summary',
      location: 'Mumbai, India',
      skills: [{ name: 'TypeScript', category: 'Languages' }],
      experience: [
        {
          company: 'Algoocean',
          title: 'Full Stack developer',
          startDate: 'June 2024',
          current: true,
          bullets: ['AI bullet'],
        },
      ],
      education: [],
      projects: [
        {
          name: 'Infodatabox - Cloud Storage Platform (Algoocean)',
          description: 'Next.js | NestJS',
          highlights: ['Built storage APIs'],
        },
      ],
      certifications: [],
      confidenceScore: 90,
    };

    const normalized = normalizeParsedProfileDraft(aiDraft, atsText);
    expect(normalized.experience.map((e) => e.company)).toEqual(
      expect.arrayContaining(['Algoocean', 'SAAR IT']),
    );
    expect(normalized.experience.every((e) => e.company !== 'Work Experience')).toBe(true);
    expect(normalized.projects.length).toBeGreaterThanOrEqual(2);
  });
});

