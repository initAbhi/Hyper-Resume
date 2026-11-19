import { afterEach, describe, expect, it, vi } from 'vitest';
import { AiModelRouterService } from './ai-model-router.service.js';
import { GeminiAiProvider } from '../providers/gemini-ai.provider.js';

function makeConfig(overrides: Record<string, string | undefined> = {}): any {
  return {
    get: vi.fn((key: string, def?: string) =>
      Object.prototype.hasOwnProperty.call(overrides, key) ? overrides[key] : def,
    ),
  };
}

describe('AiModelRouterService (Smart Model Tiering)', () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('routes lightweight tasks to fast tier and deep tasks to reasoning tier', () => {
    const router = new AiModelRouterService(
      makeConfig({
        AI_MODEL: 'gemini-3.1-flash-lite',
        AI_MODEL_FAST: 'gemini-flash-lite-latest',
        AI_MODEL_REASONING: 'gemini-flash-latest',
      }),
    );

    const fastTasks = [
      'intent_routing',
      'simple_qa',
      'metadata_extraction',
      'bullet_rewrite',
      'tool_synthesis',
      'interview_questions',
    ] as const;

    for (const task of fastTasks) {
      const route = router.resolveForTask(task);
      expect(route.tier).toBe('fast');
      expect(route.primaryModel).toBe('gemini-flash-lite-latest');
      expect(route.fallbackModels.length).toBeGreaterThan(0);
    }

    const reasoningTasks = [
      'holistic_resume_edit',
      'deep_jd_tailoring',
      'interview_evaluation',
    ] as const;

    for (const task of reasoningTasks) {
      const route = router.resolveForTask(task);
      expect(route.tier).toBe('reasoning');
      expect(route.primaryModel).toBe('gemini-flash-latest');
      expect(route.fallbackModels).toContain('gemini-3-flash-preview');
    }
  });

  it('falls back to verified priced defaults if env supplies an unconfigured model ID', () => {
    const router = new AiModelRouterService(
      makeConfig({
        AI_MODEL_FAST: 'unknown-unpriced-model-x',
        AI_MODEL_REASONING: 'another-unknown-model-y',
      }),
    );

    expect(router.getFastModel()).toBe('gemini-flash-lite-latest');
    expect(router.getReasoningModel()).toBe('gemini-flash-latest');
  });

  it('quantifies real cost savings (40–60%+) when routing lightweight turns to fast tier vs reasoning baseline', () => {
    const router = new AiModelRouterService(
      makeConfig({
        AI_MODEL_FAST: 'gemini-flash-lite-latest',
        AI_MODEL_REASONING: 'gemini-flash-latest',
      }),
    );

    const savings = router.computeTierSavings('gemini-flash-lite-latest', 4000, 400, 0);
    expect(savings.actualCostUsd).toBeLessThan(savings.reasoningBaselineCostUsd);
    expect(savings.tierSavingsUsd).toBeGreaterThan(0);
    expect(savings.tierSavingsPct).toBeGreaterThanOrEqual(40);
  });

  it('dispatches GeminiAiProvider HTTP calls to the exact tier endpoint and emits tier telemetry', async () => {
    const config = makeConfig({
      AI_API_KEY: 'test-key',
      AI_MODEL: 'gemini-3.1-flash-lite',
      AI_MODEL_FAST: 'gemini-flash-lite-latest',
      AI_MODEL_REASONING: 'gemini-flash-latest',
    });
    const router = new AiModelRouterService(config);
    const provider = new GeminiAiProvider(config, router);

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          candidates: [{ content: { parts: [{ text: 'OK' }] } }],
          usageMetadata: { promptTokenCount: 2000, candidatesTokenCount: 200, totalTokenCount: 2200 },
        }),
    } as any);
    globalThis.fetch = fetchMock;

    // Call 1: Intent routing -> FAST tier
    const fastRes = await provider.callGeminiWithFunctions(
      [{ role: 'user', parts: [{ text: 'Hello' }] }],
      undefined,
      { taskKind: 'intent_routing' },
    );
    expect(fetchMock.mock.calls[0][0]).toContain('/models/gemini-flash-lite-latest:generateContent');
    expect(fastRes.telemetry.modelTier).toBe('fast');
    expect(fastRes.telemetry.modelId).toBe('gemini-flash-lite-latest');
    expect(fastRes.telemetry.tierSavingsPct).toBeGreaterThanOrEqual(40);

    // Call 2: Holistic resume edit -> REASONING tier
    const reasoningRes = await provider.callGeminiWithFunctions(
      [{ role: 'user', parts: [{ text: 'Optimize full resume' }] }],
      undefined,
      { taskKind: 'holistic_resume_edit' },
    );
    expect(fetchMock.mock.calls[1][0]).toContain('/models/gemini-flash-latest:generateContent');
    expect(reasoningRes.telemetry.modelTier).toBe('reasoning');
    expect(reasoningRes.telemetry.modelId).toBe('gemini-flash-latest');
    expect(reasoningRes.telemetry.tierSavingsUsd).toBe(0);
  });
});

