import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GeminiAiProvider } from './gemini-ai.provider.js';

describe('GeminiAiProvider.callGeminiWithFunctions (Phase 2)', () => {
  let provider: GeminiAiProvider;
  let mockConfigService: any;
  const originalFetch = global.fetch;

  beforeEach(() => {
    mockConfigService = {
      get: vi.fn((key: string, defaultVal?: string) => {
        if (key === 'AI_API_KEY') return 'test-gemini-api-key';
        if (key === 'AI_MODEL') return 'gemini-3.1-flash-lite';
        return defaultVal;
      }),
    };

    provider = new GeminiAiProvider(mockConfigService);
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('sends tools.functionDeclarations and systemInstruction, and parses functionCall responses', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        candidates: [
          {
            content: {
              role: 'model',
              parts: [
                { text: 'I will inspect your resume first.' },
                {
                  functionCall: {
                    name: 'read_resume',
                    args: { resumeId: '22222222-2222-2222-2222-222222222222' },
                  },
                },
              ],
            },
          },
        ],
        usageMetadata: {
          promptTokenCount: 120,
          candidatesTokenCount: 35,
          totalTokenCount: 155,
        },
      }),
    });
    global.fetch = fetchMock as any;

    const toolDeclarations = [
      {
        name: 'read_resume',
        description: 'Reads structured resume content',
        parameters: { type: 'object', properties: { resumeId: { type: 'string' } } },
      },
    ];

    const result = await provider.callGeminiWithFunctions(
      [{ role: 'user', parts: [{ text: 'Audit my resume' }] }],
      toolDeclarations,
      { systemInstruction: 'You are an AI Career Agent.', temperature: 0.1 },
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [calledUrl, init] = fetchMock.mock.calls[0];
    expect(calledUrl).toContain('gemini-3.1-flash-lite:generateContent?key=test-gemini-api-key');

    const sentBody = JSON.parse(init.body);
    expect(sentBody.systemInstruction).toEqual({
      parts: [{ text: 'You are an AI Career Agent.' }],
    });
    expect(sentBody.tools).toEqual([{ functionDeclarations: toolDeclarations }]);
    expect(sentBody.generationConfig).toEqual({ temperature: 0.1 });

    expect(result.text).toBe('I will inspect your resume first.');
    expect(result.functionCalls).toEqual([
      {
        name: 'read_resume',
        args: { resumeId: '22222222-2222-2222-2222-222222222222' },
      },
    ]);
    expect(result.telemetry.promptTokens).toBe(120);
    expect(result.telemetry.completionTokens).toBe(35);
    expect(result.telemetry.totalTokens).toBe(155);
    expect(result.telemetry.modelId).toBeDefined();
  });

  it('omits tools field when no function declarations are passed and returns text only', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        candidates: [
          {
            content: {
              role: 'model',
              parts: [{ text: 'Your resume looks strong!' }],
            },
          },
        ],
        usageMetadata: { promptTokenCount: 50, candidatesTokenCount: 10 },
      }),
    });
    global.fetch = fetchMock as any;

    const result = await provider.callGeminiWithFunctions(
      [{ role: 'user', parts: [{ text: 'Summarize my profile' }] }],
    );

    const sentBody = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(sentBody.tools).toBeUndefined();
    expect(result.text).toBe('Your resume looks strong!');
    expect(result.functionCalls).toBeUndefined();
  });

  it('falls back to the next candidate model when primary model returns 404', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        status: 404,
        text: async () => 'Model not found',
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          candidates: [
            {
              content: {
                role: 'model',
                parts: [{ functionCall: { name: 'run_ats_audit', args: {} } }],
              },
            },
          ],
          usageMetadata: { promptTokenCount: 80, candidatesTokenCount: 20 },
        }),
      });
    global.fetch = fetchMock as any;

    const result = await provider.callGeminiWithFunctions(
      [{ role: 'user', parts: [{ text: 'Run ATS audit' }] }],
      [{ name: 'run_ats_audit', description: 'ATS Audit', parameters: {} }],
    );

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[1][0]).toContain('gemini-2.5-flash:generateContent');
    expect(result.functionCalls?.[0].name).toBe('run_ats_audit');
  });

  it('throws clear configuration error when AI_API_KEY is missing', async () => {
    const noKeyConfig: any = {
      get: vi.fn((key: string, defaultVal?: string) => {
        if (key === 'AI_API_KEY' || key === 'GEMINI_API_KEY') return undefined;
        return defaultVal;
      }),
    };
    const noKeyProvider = new GeminiAiProvider(noKeyConfig);

    await expect(
      noKeyProvider.callGeminiWithFunctions([{ role: 'user', parts: [{ text: 'Hello' }] }]),
    ).rejects.toThrow(/Gemini API key is not configured/);
  });
});

