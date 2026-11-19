import { describe, expect, it } from 'vitest';
import { GOLDEN_EVAL_CASES } from './golden-resumes.fixture.js';
import {
  aggregateGoldenReport,
  DEFAULT_GOLDEN_REGRESSION_GATES,
  detectSilentFabricatedMetrics,
  evaluateGoldenProposal,
  extractMetricTokens,
  formatGoldenReportMarkdown,
  measureVerbDiversity,
  type GoldenCaseEvalResult,
} from './golden-eval.runner.js';

describe('Automated Golden Eval Suite (10 Real Resumes Regression Gate)', () => {
  it('defines exactly 10 diverse realistic golden resume fixtures with unique IDs', () => {
    expect(GOLDEN_EVAL_CASES).toHaveLength(10);
    const ids = new Set(GOLDEN_EVAL_CASES.map((c) => c.id));
    expect(ids.size).toBe(10);
    for (const c of GOLDEN_EVAL_CASES) {
      expect(c.content.contact.fullName).toBeTruthy();
      expect(c.content.experience.length).toBeGreaterThanOrEqual(1);
      expect(c.content.skills.length).toBeGreaterThanOrEqual(3);
    }
  });

  it('extracts concrete metric tokens and detects silent fabricated metrics', () => {
    expect(extractMetricTokens('Cut API p95 latency by 42% and saved $120k with 3x throughput')).toEqual(
      expect.arrayContaining(['42%', '$120k', '3x']),
    );

    const original = GOLDEN_EVAL_CASES[0].content; // Junior Full-Stack with zero metrics in bullets
    const fabricatedDiffs = {
      experience: [
        {
          experienceIndex: 0,
          bulletDiffs: [
            {
              bulletIndex: 0,
              original: original.experience[0].bullets[0],
              proposed: 'Architected React dashboard that boosted conversion by 47% and saved $250k.',
            },
          ],
        },
      ],
    };
    const violations = detectSilentFabricatedMetrics(original, fabricatedDiffs);
    expect(violations.length).toBe(2);

    // Same metrics explicitly flagged for candidate confirmation are NOT silent fabrications
    const flaggedDiffs = {
      experience: [
        {
          experienceIndex: 0,
          bulletDiffs: [
            {
              bulletIndex: 0,
              original: original.experience[0].bullets[0],
              proposed: 'Architected React dashboard that boosted conversion by 47%.',
              evidenceProvenance: { candidateConfirmationRequired: true },
            },
          ],
        },
      ],
    };
    expect(detectSilentFabricatedMetrics(original, flaggedDiffs)).toEqual([]);

    // Existing numbers from original resume (case 2 has 38%, 3.4s, 1.2s, 180k) are allowed
    const metricsCase = GOLDEN_EVAL_CASES[2].content;
    const groundedDiffs = {
      experience: [
        {
          experienceIndex: 0,
          bulletDiffs: [
            {
              bulletIndex: 0,
              original: metricsCase.experience[0].bullets[0],
              proposed:
                'Spearheaded Next.js App Router migration reducing LCP from 3.4s to 1.2s across 180k monthly shoppers while trimming bundle size 38%.',
            },
          ],
        },
      ],
    };
    expect(detectSilentFabricatedMetrics(metricsCase, groundedDiffs)).toEqual([]);
  });

  it('measures action verb diversity accurately', () => {
    const repeated = measureVerbDiversity({
      ...GOLDEN_EVAL_CASES[0].content,
      experience: [
        {
          ...GOLDEN_EVAL_CASES[0].content.experience[0],
          bullets: [
            'Built feature A',
            'Built feature B',
            'Built feature C',
            'Deployed service D',
          ],
        },
      ],
    });
    expect(repeated.totalBullets).toBe(4);
    expect(repeated.maxVerbRepeats).toBe(3);
    expect(repeated.verbDiversityRatio).toBe(0.5);

    const diverse = measureVerbDiversity({
      ...GOLDEN_EVAL_CASES[0].content,
      experience: [
        {
          ...GOLDEN_EVAL_CASES[0].content.experience[0],
          bullets: [
            'Architected React SPA',
            'Engineered Node REST APIs',
            'Streamlined MongoDB queries',
            'Automated CI pipeline',
          ],
        },
      ],
    });
    expect(diverse.verbDiversityRatio).toBe(1);
    expect(diverse.maxVerbRepeats).toBe(1);
  });

  it('evaluates single proposals and fails cases with fabricated metrics or non-strict JSON', () => {
    const evalCase = GOLDEN_EVAL_CASES[0];
    const cleanEval = evaluateGoldenProposal(
      evalCase,
      {
        success: true,
        data: {
          sectionDiffs: {
            summary: {
              original: evalCase.content.summary,
              proposed:
                'Full-Stack Software Engineer building production React, TypeScript, Node.js, and MongoDB web applications with responsive UIs, automated tests, and scalable REST APIs.',
            },
            experience: [
              {
                experienceIndex: 0,
                bulletDiffs: [
                  {
                    bulletIndex: 0,
                    original: evalCase.content.experience[0].bullets[0],
                    proposed:
                      'Architected responsive React and TypeScript customer portal with modular component architecture.',
                  },
                  {
                    bulletIndex: 1,
                    original: evalCase.content.experience[0].bullets[1],
                    proposed:
                      'Engineered Node.js and Express REST API endpoints backed by indexed MongoDB collections.',
                  },
                  {
                    bulletIndex: 2,
                    original: evalCase.content.experience[0].bullets[2],
                    proposed:
                      'Resolved cross-browser UI defects and authored automated integration tests to stabilize releases.',
                  },
                  {
                    bulletIndex: 3,
                    original: evalCase.content.experience[0].bullets[3],
                    proposed:
                      'Partnered with product and QA peers in agile sprints to ship end-to-end customer workflows.',
                  },
                ],
              },
            ],
          },
        },
        metadata: {
          structuredOutputEnforced: true,
          jsonParseStrict: true,
          modelId: 'gemini-flash-latest',
          modelTier: 'reasoning',
        },
      },
      3200,
    );
    expect(cleanEval.passed).toBe(true);
    expect(cleanEval.fabricatedMetricViolations).toEqual([]);
    expect(cleanEval.verbDiversityRatio).toBe(1);
    expect(cleanEval.atsDelta).toBeGreaterThanOrEqual(0);

    const badJsonEval = evaluateGoldenProposal(
      evalCase,
      {
        success: true,
        data: {
          sectionDiffs: {
            experience: [
              {
                experienceIndex: 0,
                bulletDiffs: [
                  {
                    bulletIndex: 0,
                    original: evalCase.content.experience[0].bullets[0],
                    proposed: 'Engineered React portal raising revenue by 99%.',
                  },
                ],
              },
            ],
          },
        },
        metadata: {
          structuredOutputEnforced: true,
          jsonParseStrict: false,
        },
      },
      2100,
    );
    expect(badJsonEval.passed).toBe(false);
    expect(badJsonEval.failureReasons.some((r) => r.includes('Fabricated metrics'))).toBe(true);
    expect(badJsonEval.failureReasons.some((r) => r.includes('Non-strict JSON'))).toBe(true);
  });

  it('aggregates report metrics, enforces regression gates, and renders Markdown', () => {
    const sampleCases: GoldenCaseEvalResult[] = Array.from({ length: 10 }, (_, idx) => ({
      caseId: `case-${idx + 1}`,
      label: `Resume ${idx + 1}`,
      targetRole: 'Engineer',
      success: true,
      beforeAtsScore: 65,
      projectedAtsScore: 84,
      atsDelta: 19,
      verbDiversityRatio: 0.92,
      maxVerbRepeats: 1,
      totalBullets: 5,
      fabricatedMetricViolations: [],
      structuredOutputEnforced: true,
      jsonParseStrict: true,
      modelUsed: 'gemini-flash-latest',
      modelTier: 'reasoning',
      latencyMs: 3000 + idx * 500,
      passed: true,
      failureReasons: [],
    }));

    const passingReport = aggregateGoldenReport(sampleCases, DEFAULT_GOLDEN_REGRESSION_GATES);
    expect(passingReport.gatePassed).toBe(true);
    expect(passingReport.passRate).toBe(1);
    expect(passingReport.strictJsonRate).toBe(1);
    expect(passingReport.avgAtsDelta).toBe(19);
    expect(passingReport.p95LatencyMs).toBe(7500);

    const md = formatGoldenReportMarkdown(passingReport);
    expect(md).toContain('# HyperResume Automated Golden Eval Report');
    expect(md).toContain('**PASS**');

    // Introduce 1 fabricated metric -> gate MUST FAIL
    const failingCases = structuredClone(sampleCases);
    failingCases[0].fabricatedMetricViolations = ['Unbacked metric "88%"'];
    failingCases[0].passed = false;
    const failingReport = aggregateGoldenReport(failingCases, DEFAULT_GOLDEN_REGRESSION_GATES);
    expect(failingReport.gatePassed).toBe(false);
    expect(failingReport.gateFailures.some((f) => f.includes('Fabricated metrics'))).toBe(true);
  });
});

