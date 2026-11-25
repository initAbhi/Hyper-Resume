import type { PrimaryToolKey } from '@/lib/blog';

export interface ToolCtaMeta {
  key: PrimaryToolKey;
  badge: string;
  title: string;
  description: string;
  ctaLabel: string;
  href: string;
  highlights: string[];
}

export const BLOG_TOOL_CONFIG: Record<PrimaryToolKey, ToolCtaMeta> = {
  'resume-checker': {
    key: 'resume-checker',
    badge: 'Free · No Signup Required',
    title: 'Test Your PDF Through a Real ATS Parser',
    description:
      'Upload your resume to verify raw UTF-8 text extraction, catch 84+ formatting & typo traps, and compress >10 MB Canva PDFs without turning text into an image.',
    ctaLabel: 'Run Free ATS Audit',
    href: '/tools/resume-checker',
    highlights: [
      'Checks real pdf-parse text extractability',
      'Detects scrambled 2-column Workday layouts',
      'Zero login wall · Instant results',
    ],
  },
  'job-match': {
    key: 'job-match',
    badge: 'Evidence-Grounded · ₹0',
    title: 'Compare Your Resume Against Any Job Description',
    description:
      'Stop chasing vanity 95% keyword scores. See which JD requirements are proven in your bullets (Supported) vs sitting unproven in Skills (Needs Confirmation).',
    ctaLabel: 'Check Job Match Free',
    href: '/tools/job-match',
    highlights: [
      'Verbatim evidence quotes from your bullets',
      'Separates proven skills from unproven keywords',
      'No fabricated metrics or keyword stuffing',
    ],
  },
  'bullet-improver': {
    key: 'bullet-improver',
    badge: 'Anti-Hallucination AI',
    title: 'Rewrite Weak Resume Bullets Without Fake Metrics',
    description:
      'Our deterministic validator strips invented numbers and replaces unverified claims with [Confirm measurable impact] so you never get caught in an interview.',
    ctaLabel: 'Improve a Bullet Free',
    href: '/tools/bullet-improver',
    highlights: [
      'Deterministic metric hallucination blocker',
      'Preserves your real stack & scope',
      'XYZ / STAR engineering structure',
    ],
  },
};
