import type { ResumeContent } from '../../resumes/entities/resume.types.js';
import { evaluateStructuredResumeAts } from '../../ai/utils/ats-audit-engine.js';
import { applySectionDiffsToResumeContent } from '../tools/definitions/resume-diff-applier.js';
import type { GoldenResumeEvalCase } from './golden-resumes.fixture.js';

export interface GoldenCaseEvalResult {
  caseId: string;
  label: string;
  targetRole: string;
  success: boolean;
  error?: string;
  beforeAtsScore: number;
  projectedAtsScore: number;
  atsDelta: number;
  verbDiversityRatio: number;
  maxVerbRepeats: number;
  totalBullets: number;
  fabricatedMetricViolations: string[];
  structuredOutputEnforced: boolean;
  jsonParseStrict: boolean;
  modelUsed?: string;
  modelTier?: string;
  latencyMs: number;
  passed: boolean;
  failureReasons: string[];
}

export interface GoldenRegressionGates {
  minPassRate: number;
  minStrictJsonRate: number;
  maxFabricatedMetricViolations: number;
  minAvgAtsDelta: number;
  minAvgVerbDiversity: number;
  maxP95LatencyMs: number;
}

export interface GoldenEvalReport {
  timestamp: string;
  totalCases: number;
  passedCases: number;
  passRate: number;
  avgBeforeAts: number;
  avgAfterAts: number;
  avgAtsDelta: number;
  avgVerbDiversity: number;
  totalFabricatedMetricViolations: number;
  strictJsonRate: number;
  p50LatencyMs: number;
  p95LatencyMs: number;
  avgLatencyMs: number;
  gates: GoldenRegressionGates;
  gatePassed: boolean;
  gateFailures: string[];
  cases: GoldenCaseEvalResult[];
}

export const DEFAULT_GOLDEN_REGRESSION_GATES: GoldenRegressionGates = {
  minPassRate: 0.8,
  minStrictJsonRate: 1.0,
  maxFabricatedMetricViolations: 0,
  minAvgAtsDelta: 0.5,
  minAvgVerbDiversity: 0.7,
  maxP95LatencyMs: 25000,
};

const METRIC_TOKEN_REGEX =
  /(?:\$\d[\d,.]*(?:\s?[kKmMbB])?|\b\d+(?:\.\d+)?%|\b\d+(?:\.\d+)?[xX]\b|\b\d{1,3}(?:,\d{3})+(?:\+)?\b|\b\d+(?:\.\d+)?\s?(?:ms|s|sec|seconds?|mins?|minutes?|hrs?|hours?|days?|tps|rps|qps|k|m|b)\b)/gi;

function normalizeMetricToken(token: string): string {
  return token.toLowerCase().replace(/,/g, '').replace(/\s+/g, '').trim();
}

/**
 * Extracts all concrete numeric metric tokens from arbitrary text.
 */
export function extractMetricTokens(text: string): string[] {
  if (!text) return [];
  const matches = text.match(METRIC_TOKEN_REGEX) || [];
  return matches.map(normalizeMetricToken).filter(Boolean);
}

/**
 * Computes leading action-verb diversity across all experience bullets.
 */
export function measureVerbDiversity(content: ResumeContent): {
  verbDiversityRatio: number;
  maxVerbRepeats: number;
  totalBullets: number;
} {
  const bullets: string[] = [];
  for (const exp of content.experience || []) {
    for (const b of exp.bullets || []) {
      if (typeof b === 'string' && b.trim().length > 0) {
        bullets.push(b.trim());
      }
    }
  }

  if (bullets.length === 0) {
    return { verbDiversityRatio: 1, maxVerbRepeats: 0, totalBullets: 0 };
  }

  const verbCounts = new Map<string, number>();
  for (const bullet of bullets) {
    const firstWord = (bullet.replace(/^[^a-zA-Z]+/, '').split(/\s+/)[0] || '').toLowerCase();
    if (!firstWord) continue;
    verbCounts.set(firstWord, (verbCounts.get(firstWord) || 0) + 1);
  }

  const uniqueCount = verbCounts.size;
  const maxRepeats = Math.max(0, ...Array.from(verbCounts.values()));
  const ratio = Number((uniqueCount / bullets.length).toFixed(3));
  return {
    verbDiversityRatio: ratio,
    maxVerbRepeats: maxRepeats,
    totalBullets: bullets.length,
  };
}

/**
 * Checks every proposed experience bullet for silent fabricated metrics:
 * any numeric metric NOT present anywhere in the original resume content
 * and NOT explicitly flagged with candidateConfirmationRequired === true.
 */
export function detectSilentFabricatedMetrics(
  originalContent: ResumeContent,
  sectionDiffs: Record<string, any>,
): string[] {
  const sourceBlob = JSON.stringify(originalContent || {});
  const allowedMetrics = new Set(extractMetricTokens(sourceBlob));
  // Also allow raw bare numbers that appeared in the original resume (e.g. "44" -> "44%")
  const bareOriginalNumbers = new Set(
    (sourceBlob.match(/\b\d+(?:\.\d+)?\b/g) || []).map((n) => n.trim()),
  );

  const violations: string[] = [];
  const expDiffs = Array.isArray(sectionDiffs?.experience) ? sectionDiffs.experience : [];

  for (const exp of expDiffs) {
    const bulletDiffs = Array.isArray(exp?.bulletDiffs) ? exp.bulletDiffs : [];
    for (const diff of bulletDiffs) {
      if (diff?.evidenceProvenance?.candidateConfirmationRequired) {
        continue; // Properly flagged for candidate verification — not a silent fabrication
      }
      const proposed = String(diff?.proposed || '');
      const proposedMetrics = extractMetricTokens(proposed);
      for (const m of proposedMetrics) {
        const numericCore = m.replace(/[^0-9.]/g, '');
        if (!allowedMetrics.has(m) && (!numericCore || !bareOriginalNumbers.has(numericCore))) {
          violations.push(`Unbacked metric "${m}" in "${proposed.slice(0, 90)}"`);
        }
      }
    }
  }

  return violations;
}

/**
 * Evaluates a single ProposeEditsTool output against deterministic golden criteria.
 */
export function evaluateGoldenProposal(
  evalCase: GoldenResumeEvalCase,
  toolOutput: {
    success: boolean;
    data?: Record<string, any>;
    metadata?: Record<string, any>;
    error?: string;
  },
  latencyMs: number,
): GoldenCaseEvalResult {
  const beforeAudit = evaluateStructuredResumeAts(
    evalCase.content,
    undefined,
    evalCase.content.headline,
    evalCase.targetJobDescription,
  );
  const beforeAtsScore = beforeAudit.atsScore;

  if (!toolOutput.success || !toolOutput.data?.sectionDiffs) {
    return {
      caseId: evalCase.id,
      label: evalCase.label,
      targetRole: evalCase.targetRole,
      success: false,
      error: toolOutput.error || 'Proposal failed or returned empty sectionDiffs',
      beforeAtsScore,
      projectedAtsScore: beforeAtsScore,
      atsDelta: 0,
      verbDiversityRatio: 0,
      maxVerbRepeats: 0,
      totalBullets: 0,
      fabricatedMetricViolations: [],
      structuredOutputEnforced: Boolean(toolOutput.metadata?.structuredOutputEnforced),
      jsonParseStrict: Boolean(toolOutput.metadata?.jsonParseStrict),
      modelUsed: toolOutput.metadata?.modelId as string | undefined,
      modelTier: toolOutput.metadata?.modelTier as string | undefined,
      latencyMs,
      passed: false,
      failureReasons: [toolOutput.error || 'Tool execution failed'],
    };
  }

  const sectionDiffs = toolOutput.data.sectionDiffs;
  const applied = applySectionDiffsToResumeContent(evalCase.content, sectionDiffs, {
    currentTemplateKey: evalCase.templateKey,
  });
  const afterAudit = evaluateStructuredResumeAts(
    applied.content,
    undefined,
    applied.content.headline,
    evalCase.targetJobDescription,
  );
  const projectedAtsScore = afterAudit.atsScore;
  const atsDelta = projectedAtsScore - beforeAtsScore;

  const verbStats = measureVerbDiversity(applied.content);
  const fabricatedMetricViolations = detectSilentFabricatedMetrics(evalCase.content, sectionDiffs);
  const structuredOutputEnforced = Boolean(toolOutput.metadata?.structuredOutputEnforced);
  const jsonParseStrict = Boolean(toolOutput.metadata?.jsonParseStrict);

  const failureReasons: string[] = [];
  if (atsDelta < 0) {
    failureReasons.push(`ATS regressed (${beforeAtsScore} -> ${projectedAtsScore})`);
  }
  if (fabricatedMetricViolations.length > 0) {
    failureReasons.push(`Fabricated metrics: ${fabricatedMetricViolations.join('; ')}`);
  }
  if (structuredOutputEnforced && !jsonParseStrict) {
    failureReasons.push('Non-strict JSON parse fallback triggered despite responseSchema');
  }
  if (verbStats.totalBullets >= 2 && verbStats.verbDiversityRatio < 0.6) {
    failureReasons.push(`Low verb diversity (${verbStats.verbDiversityRatio})`);
  }

  return {
    caseId: evalCase.id,
    label: evalCase.label,
    targetRole: evalCase.targetRole,
    success: true,
    beforeAtsScore,
    projectedAtsScore,
    atsDelta,
    verbDiversityRatio: verbStats.verbDiversityRatio,
    maxVerbRepeats: verbStats.maxVerbRepeats,
    totalBullets: verbStats.totalBullets,
    fabricatedMetricViolations,
    structuredOutputEnforced,
    jsonParseStrict,
    modelUsed: toolOutput.metadata?.modelId as string | undefined,
    modelTier: toolOutput.metadata?.modelTier as string | undefined,
    latencyMs,
    passed: failureReasons.length === 0,
    failureReasons,
  };
}

function percentile(sortedValues: number[], p: number): number {
  if (sortedValues.length === 0) return 0;
  const idx = Math.min(
    sortedValues.length - 1,
    Math.max(0, Math.ceil((p / 100) * sortedValues.length) - 1),
  );
  return Math.round(sortedValues[idx]);
}

/**
 * Aggregates individual case evaluations and evaluates CI/CD regression gates.
 */
export function aggregateGoldenReport(
  cases: GoldenCaseEvalResult[],
  gates: GoldenRegressionGates = DEFAULT_GOLDEN_REGRESSION_GATES,
): GoldenEvalReport {
  const totalCases = cases.length;
  const passedCases = cases.filter((c) => c.passed).length;
  const passRate = totalCases > 0 ? Number((passedCases / totalCases).toFixed(3)) : 0;

  const avgBeforeAts =
    totalCases > 0
      ? Number((cases.reduce((s, c) => s + c.beforeAtsScore, 0) / totalCases).toFixed(2))
      : 0;
  const avgAfterAts =
    totalCases > 0
      ? Number((cases.reduce((s, c) => s + c.projectedAtsScore, 0) / totalCases).toFixed(2))
      : 0;
  const avgAtsDelta =
    totalCases > 0
      ? Number((cases.reduce((s, c) => s + c.atsDelta, 0) / totalCases).toFixed(2))
      : 0;
  const avgVerbDiversity =
    totalCases > 0
      ? Number((cases.reduce((s, c) => s + c.verbDiversityRatio, 0) / totalCases).toFixed(3))
      : 0;

  const totalFabricatedMetricViolations = cases.reduce(
    (s, c) => s + c.fabricatedMetricViolations.length,
    0,
  );

  const strictEnforcedCases = cases.filter((c) => c.structuredOutputEnforced);
  const strictJsonRate =
    strictEnforcedCases.length > 0
      ? Number(
          (
            strictEnforcedCases.filter((c) => c.jsonParseStrict).length /
            strictEnforcedCases.length
          ).toFixed(3),
        )
      : 0;

  const sortedLatencies = cases.map((c) => c.latencyMs).sort((a, b) => a - b);
  const p50LatencyMs = percentile(sortedLatencies, 50);
  const p95LatencyMs = percentile(sortedLatencies, 95);
  const avgLatencyMs =
    totalCases > 0
      ? Math.round(cases.reduce((s, c) => s + c.latencyMs, 0) / totalCases)
      : 0;

  const gateFailures: string[] = [];
  if (passRate < gates.minPassRate) {
    gateFailures.push(`Pass rate ${(passRate * 100).toFixed(1)}% < ${(gates.minPassRate * 100).toFixed(1)}%`);
  }
  if (strictEnforcedCases.length > 0 && strictJsonRate < gates.minStrictJsonRate) {
    gateFailures.push(
      `Strict JSON rate ${(strictJsonRate * 100).toFixed(1)}% < ${(gates.minStrictJsonRate * 100).toFixed(1)}%`,
    );
  }
  if (totalFabricatedMetricViolations > gates.maxFabricatedMetricViolations) {
    gateFailures.push(
      `Fabricated metrics ${totalFabricatedMetricViolations} > ${gates.maxFabricatedMetricViolations}`,
    );
  }
  if (avgAtsDelta < gates.minAvgAtsDelta) {
    gateFailures.push(`Avg ATS delta ${avgAtsDelta} < ${gates.minAvgAtsDelta}`);
  }
  if (avgVerbDiversity < gates.minAvgVerbDiversity) {
    gateFailures.push(`Avg verb diversity ${avgVerbDiversity} < ${gates.minAvgVerbDiversity}`);
  }
  if (p95LatencyMs > gates.maxP95LatencyMs) {
    gateFailures.push(`p95 latency ${p95LatencyMs}ms > ${gates.maxP95LatencyMs}ms`);
  }

  return {
    timestamp: new Date().toISOString(),
    totalCases,
    passedCases,
    passRate,
    avgBeforeAts,
    avgAfterAts,
    avgAtsDelta,
    avgVerbDiversity,
    totalFabricatedMetricViolations,
    strictJsonRate,
    p50LatencyMs,
    p95LatencyMs,
    avgLatencyMs,
    gates,
    gatePassed: gateFailures.length === 0,
    gateFailures,
    cases,
  };
}

export function formatGoldenReportMarkdown(report: GoldenEvalReport): string {
  const header = [
    '# HyperResume Automated Golden Eval Report (Zero-Mock Regression Gate)',
    `Timestamp: ${report.timestamp}`,
    '',
    '| # | Case | Before | After | Delta | Verb Div | Fab. Metrics | Strict JSON | Model | Latency | Status |',
    '|---|------|--------|-------|-------|----------|--------------|-------------|-------|---------|--------|',
  ];

  const rows = report.cases.map((c, i) => {
    const deltaStr = c.atsDelta >= 0 ? `+${c.atsDelta}` : `${c.atsDelta}`;
    const strictStr = c.structuredOutputEnforced ? (c.jsonParseStrict ? 'YES' : 'FALLBACK') : 'N/A';
    return `| ${i + 1} | ${c.label} | ${c.beforeAtsScore} | ${c.projectedAtsScore} | ${deltaStr} | ${Math.round(c.verbDiversityRatio * 100)}% | ${c.fabricatedMetricViolations.length} | ${strictStr} | ${c.modelUsed || 'fallback'} | ${c.latencyMs}ms | ${c.passed ? 'PASS' : 'FAIL'} |`;
  });

  const summary = [
    '',
    '## Aggregate Metrics & Regression Gates',
    `- **Pass Rate:** ${report.passedCases}/${report.totalCases} (${(report.passRate * 100).toFixed(1)}%) [gate >= ${(report.gates.minPassRate * 100).toFixed(0)}%]`,
    `- **Avg ATS Score:** ${report.avgBeforeAts} -> ${report.avgAfterAts} (**${report.avgAtsDelta >= 0 ? '+' : ''}${report.avgAtsDelta}** avg delta) [gate >= +${report.gates.minAvgAtsDelta}]`,
    `- **Avg Action Verb Diversity:** ${(report.avgVerbDiversity * 100).toFixed(1)}% [gate >= ${(report.gates.minAvgVerbDiversity * 100).toFixed(0)}%]`,
    `- **Silent Fabricated Metrics:** ${report.totalFabricatedMetricViolations} [gate <= ${report.gates.maxFabricatedMetricViolations}]`,
    `- **Strict responseSchema JSON Rate:** ${(report.strictJsonRate * 100).toFixed(1)}% [gate >= ${(report.gates.minStrictJsonRate * 100).toFixed(0)}%]`,
    `- **Latency:** p50=${report.p50LatencyMs}ms, p95=${report.p95LatencyMs}ms, avg=${report.avgLatencyMs}ms [gate p95 <= ${report.gates.maxP95LatencyMs}ms]`,
    `- **REGRESSION GATE VERDICT:** **${report.gatePassed ? 'PASS' : 'FAIL'}**${report.gateFailures.length ? ` (${report.gateFailures.join(' | ')})` : ''}`,
  ];

  return [...header, ...rows, ...summary].join('\n');
}

