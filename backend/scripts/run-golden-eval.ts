/**
 * Zero-Mock Automated Golden Eval Suite (10 Real Resumes Regression Gate)
 *
 * Usage:
 *   bun --cwd backend eval:golden
 *   bun --cwd backend eval:golden -- --concurrency=2
 */
import 'reflect-metadata';
import fs from 'node:fs';
import path from 'node:path';
import { ConfigService } from '@nestjs/config';
import { GeminiAiProvider } from '../src/ai/providers/gemini-ai.provider.js';
import { AiModelRouterService } from '../src/ai/services/ai-model-router.service.js';
import { MockAiProvider } from '../src/ai/providers/mock-ai.provider.js';
import { AiService } from '../src/ai/ai.service.js';
import { ProposeEditsTool } from '../src/agent/tools/definitions/propose-edits.tool.js';
import { GOLDEN_EVAL_CASES } from '../src/agent/evals/golden-resumes.fixture.js';
import {
  aggregateGoldenReport,
  DEFAULT_GOLDEN_REGRESSION_GATES,
  evaluateGoldenProposal,
  formatGoldenReportMarkdown,
  type GoldenCaseEvalResult,
} from '../src/agent/evals/golden-eval.runner.js';

function loadDotEnv(envPath: string): Record<string, string> {
  const out: Record<string, string> = {};
  if (!fs.existsSync(envPath)) return out;
  const raw = fs.readFileSync(envPath, 'utf8');
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
    out[key] = val;
  }
  return out;
}

async function main() {
  const envFromFile = loadDotEnv(path.resolve(process.cwd(), '.env'));
  const mergedEnv: Record<string, string | undefined> = {
    ...envFromFile,
    ...process.env,
  };

  if (!mergedEnv.AI_API_KEY && !mergedEnv.GEMINI_API_KEY) {
    console.error('FATAL: AI_API_KEY or GEMINI_API_KEY must be set in backend/.env for Zero-Mock Golden Eval.');
    process.exit(1);
  }

  // Ensure ProposeEditsTool runs its REAL Gemini path (not Vitest/NODE_ENV=test fallback)
  process.env.NODE_ENV = 'development';
  delete process.env.VITEST;

  const configService = new ConfigService(mergedEnv);
  const modelRouter = new AiModelRouterService(configService);
  const geminiProvider = new GeminiAiProvider(configService, modelRouter);
  const mockProvider = new MockAiProvider();
  const aiService = new AiService(configService, mockProvider, geminiProvider);

  const concurrencyArg = process.argv.find((a) => a.startsWith('--concurrency='));
  const concurrency = Math.max(1, Math.min(3, Number(concurrencyArg?.split('=')[1] || 2)));

  console.log(
    `Running HyperResume Zero-Mock Golden Eval across ${GOLDEN_EVAL_CASES.length} resumes (fast="${modelRouter.getFastModel()}", reasoning="${modelRouter.getReasoningModel()}", concurrency=${concurrency})...\n`,
  );

  const results: GoldenCaseEvalResult[] = new Array(GOLDEN_EVAL_CASES.length);
  let cursor = 0;

  async function worker() {
    while (true) {
      const idx = cursor++;
      if (idx >= GOLDEN_EVAL_CASES.length) break;
      const evalCase = GOLDEN_EVAL_CASES[idx];

      // In-memory resume adapter serving the exact golden resume fixture (zero AI mocking!)
      const resumeMap = new Map([
        [
          evalCase.id,
          {
            id: evalCase.id,
            name: evalCase.resumeName,
            templateKey: evalCase.templateKey,
            version: 1,
            content: structuredClone(evalCase.content),
          },
        ],
      ]);

      const resumesServiceStub = {
        getResume: async (_userId: string, resumeId: string) => resumeMap.get(resumeId),
      } as any;

      const tool = new ProposeEditsTool(resumesServiceStub, aiService, undefined, geminiProvider);

      const t0 = Date.now();
      const output = await tool.execute(
        {
          userId: 'golden-eval-user',
          taskId: `golden-task-${idx + 1}`,
          conversationId: `golden-conv-${idx + 1}`,
          activeResumeId: evalCase.id,
        },
        {
          resumeId: evalCase.id,
          targetRole: evalCase.targetRole,
          targetJobDescription: evalCase.targetJobDescription,
          customInstruction: evalCase.customInstruction,
        },
      );
      const latencyMs = Date.now() - t0;

      const caseEval = evaluateGoldenProposal(evalCase, output as any, latencyMs);
      results[idx] = caseEval;
      console.log(
        `[${idx + 1}/${GOLDEN_EVAL_CASES.length}] ${caseEval.passed ? 'PASS' : 'FAIL'} | ${evalCase.label} | ATS ${caseEval.beforeAtsScore}->${caseEval.projectedAtsScore} (${caseEval.atsDelta >= 0 ? '+' : ''}${caseEval.atsDelta}) | verbs=${Math.round(caseEval.verbDiversityRatio * 100)}% | fab=${caseEval.fabricatedMetricViolations.length} | strictJSON=${caseEval.jsonParseStrict} | ${caseEval.modelUsed || 'fallback'} | ${latencyMs}ms${caseEval.failureReasons.length ? ` | reasons=${caseEval.failureReasons.join('; ')}` : ''}`,
      );
    }
  }

  await Promise.all(Array.from({ length: concurrency }, () => worker()));

  const report = aggregateGoldenReport(results, DEFAULT_GOLDEN_REGRESSION_GATES);
  const md = formatGoldenReportMarkdown(report);
  console.log('\n' + md + '\n');

  const outDir = path.resolve(process.cwd(), 'eval-reports');
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(
    path.join(outDir, 'latest-golden-eval.json'),
    JSON.stringify(report, null, 2),
    'utf8',
  );
  fs.writeFileSync(path.join(outDir, 'latest-golden-eval.md'), md, 'utf8');
  console.log(`Saved report to ${path.join(outDir, 'latest-golden-eval.json')}`);

  if (!report.gatePassed) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Golden Eval fatal error:', err);
  process.exit(1);
});
