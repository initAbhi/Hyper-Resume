import { describe, expect, it } from 'bun:test';
import type { CoverLetter } from '@/lib/api-client';
import {
  countCoverLetterWords,
  estimateReadTimeLabel,
  formatCoverLetterPlainText,
} from '@/lib/cover-letter-utils';

const sampleLetter: CoverLetter = {
  id: 'cl-1',
  userId: 'u-1',
  resumeId: 'res-1',
  title: 'Stripe — Staff Platform Engineer',
  targetRole: 'Staff Platform Engineer',
  companyName: 'Stripe',
  hiringManager: 'Maya Lin',
  tone: 'Executive',
  templateKey: 'executive',
  accentColor: '#285FEA',
  senderName: 'Alexander Sharma',
  senderEmail: 'alex@example.com',
  senderPhone: '+1 415 555 0192',
  senderLocation: 'San Francisco, CA',
  recipientLine: 'Maya Lin — Stripe',
  salutation: 'Dear Maya Lin,',
  openingParagraph: 'Scaling distributed payment ledgers taught me resilience.',
  bodyParagraphs: [
    'At CloudScale Payments I scaled systems to 25,000+ RPS.',
    'Previously at Nexus FinTech I cut p99 latency by 65%.',
  ],
  closingParagraph: 'I welcome a conversation about how I can help Stripe.',
  signOff: 'Sincerely,',
  highlightedKeywords: ['PostgreSQL', 'Redis'],
  factualVerificationNotes: 'Verified against resume.',
  provider: 'gemini',
  createdAt: '2026-11-10T10:00:00Z',
  updatedAt: '2026-11-10T10:00:00Z',
};

describe('cover-letter-utils', () => {
  it('counts body words and computes recruiter reading time', () => {
    const words = countCoverLetterWords(sampleLetter);
    expect(words).toBe(36);
    expect(estimateReadTimeLabel(words)).toContain('sec read');
    expect(estimateReadTimeLabel(260)).toContain('min read');
  });

  it('formats complete clean plain text including contact header, recipient, paragraphs, and signature', () => {
    const plain = formatCoverLetterPlainText(sampleLetter);
    expect(plain).toContain('Alexander Sharma');
    expect(plain).toContain('alex@example.com | +1 415 555 0192 | San Francisco, CA');
    expect(plain).toContain('Dear Maya Lin,');
    expect(plain).toContain('Scaling distributed payment ledgers');
    expect(plain).toContain('25,000+ RPS');
    expect(plain).toContain('Sincerely,\nAlexander Sharma');
  });
});

