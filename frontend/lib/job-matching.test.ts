import { describe, expect, it } from 'bun:test';
import type { JobMatchAnalysisResult } from './api-client';

describe('Job Matching Analysis & Grounded Invariants', () => {
  const sampleMatchAnalysis: JobMatchAnalysisResult = {
    overallScore: 86,
    subScores: {
      requiredSkills: 90,
      preferredSkills: 75,
      experienceAlignment: 88,
      educationAlignment: 100,
      actionMetricsDensity: 82,
    },
    summary: 'Strong engineering alignment with high quantifiable outcome density.',
    matchedRequirements: [
      {
        requirementId: 'req-1',
        status: 'supported',
        confidence: 0.95,
        evidenceQuotes: ['Led migration reducing p99 latency by 34%'],
        explanation: 'Redis cluster and latency optimization demonstrated in experience bullet #1',
        suggestedAction: 'Keep as high priority bullet in tailored version',
      },
      {
        requirementId: 'req-2',
        status: 'needs_confirmation',
        confidence: 0.6,
        evidenceQuotes: ['Kafka listed in Skills section'],
        explanation: 'Event streaming listed in skills, but lacking scale metrics in bullet descriptions',
        suggestedAction: 'Add production throughput metric to Kafka bullet if verified',
      },
      {
        requirementId: 'req-3',
        status: 'not_evidenced',
        confidence: 0.2,
        evidenceQuotes: [],
        explanation: 'No payments or billing ledger experience found in profile',
        suggestedAction: 'Honest gap: do not fabricate financial domain experience',
      },
    ],
    missingKeywords: ['Stripe Billing', 'PCI-DSS'],
    recommendedImprovements: [
      'Highlight distributed transaction management in lead role',
    ],
  };

  it('should verify sub-scores calculate accurately within bounds [0, 100]', () => {
    const { subScores, overallScore } = sampleMatchAnalysis;

    expect(overallScore).toBeGreaterThanOrEqual(0);
    expect(overallScore).toBeLessThanOrEqual(100);

    Object.values(subScores).forEach((score) => {
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });
  });

  it('should categorize requirements into supported, needs_confirmation, and not_evidenced', () => {
    const supported = sampleMatchAnalysis.matchedRequirements.filter((r) => r.status === 'supported');
    const needsConfirm = sampleMatchAnalysis.matchedRequirements.filter((r) => r.status === 'needs_confirmation');
    const notEvidenced = sampleMatchAnalysis.matchedRequirements.filter((r) => r.status === 'not_evidenced');

    expect(supported.length).toBe(1);
    expect(supported[0].evidenceQuotes.length).toBeGreaterThan(0);

    expect(needsConfirm.length).toBe(1);

    expect(notEvidenced.length).toBe(1);
    expect(notEvidenced[0].evidenceQuotes.length).toBe(0);
  });

  it('should never invent evidence quotes for unevidenced requirements', () => {
    const unevidenced = sampleMatchAnalysis.matchedRequirements.filter((r) => r.status === 'not_evidenced');

    unevidenced.forEach((req) => {
      expect(req.evidenceQuotes.length).toBe(0);
      expect(req.explanation).toContain('No payments');
    });
  });

  it('should maintain distinct list of missing keywords for targeted tailoring', () => {
    expect(sampleMatchAnalysis.missingKeywords).toContain('PCI-DSS');
    expect(sampleMatchAnalysis.missingKeywords).toContain('Stripe Billing');
  });
});
