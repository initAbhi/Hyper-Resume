import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GeminiAiProvider } from './gemini-ai.provider.js';

function makeSseReadableStream(chunks: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      for (const c of chunks) {
        controller.enqueue(encoder.encode(c));
      }
      controller.close();
    },
  });
}

describe('GeminiAiProvider.streamGeminiWithFunctions (Native SSE Token Streaming)', () => {
  let provider: GeminiAiProvider;
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    const mockConfig: any = {
      get: vi.fn((key: string, defaultVal?: string) => {
        if (key === 'AI_API_KEY') return 'test-api-key';
        if (key === 'AI_MODEL') return 'gemini-2.5-flash';
        return defaultVal;
      }),
    };
    provider = new GeminiAiProvider(mockConfig);
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('streams text deltas incrementally across split SSE frames and strips thought parts', async () => {
    const frame1 = `data: ${JSON.stringify({
      candidates: [{ content: { parts: [{ text: 'Internal reasoning...', thought: true }] } }],
    })}\n\n`;
    const frame2 = `data: ${JSON.stringify({
      candidates: [{ content: { parts: [{ text: '### ATS ' }] } }],
    })}\n\n`;
    const frame3 = `data: ${JSON.stringify({
      candidates: [{ content: { parts: [{ text: 'Score: **92/100**' }] } }],
      usageMetadata: { promptTokenCount: 120, candidatesTokenCount: 18, totalTokenCount: 138 },
    })}\n\n`;

    // Deliberately split frame2 right across a JSON boundary to prove line-buffering handles partial TCP chunks
    const splitPoint = Math.floor(frame2.length / 2);
    const stream = makeSseReadableStream([
      frame1,
      frame2.slice(0, splitPoint),
      frame2.slice(splitPoint),
      frame3,
    ]);

    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      body: stream,
    } as any);

    const deltas: string[] = [];
    const res = await provider.streamGeminiWithFunctions(
      [{ role: 'user', parts: [{ text: 'Audit my resume' }] }],
      undefined,
      {
        onTextDelta: (delta) => {
          deltas.push(delta);
        },
      },
    );

    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining(':streamGenerateContent?alt=sse&key=test-api-key'),
      expect.objectContaining({ method: 'POST' }),
    );
    expect(deltas).toEqual(['### ATS ', 'Score: **92/100**']);
    expect(res.text).toBe('### ATS Score: **92/100**');
    expect(res.text).not.toContain('Internal reasoning');
    expect(res.telemetry.totalTokens).toBe(138);
  });

  it('extracts functionCalls cleanly during streaming when model invokes tools', async () => {
    const frame = `data: ${JSON.stringify({
      candidates: [
        {
          content: {
            parts: [{ functionCall: { name: 'run_ats_audit', args: { resumeId: 'res-1' } } }],
          },
        },
      ],
      usageMetadata: { promptTokenCount: 50, candidatesTokenCount: 12, totalTokenCount: 62 },
    })}\n\n`;

    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      body: makeSseReadableStream([frame]),
    } as any);

    const deltas: string[] = [];
    const res = await provider.streamGeminiWithFunctions(
      [{ role: 'user', parts: [{ text: 'Audit my resume' }] }],
      [{ name: 'run_ats_audit', description: 'Run audit', parameters: {} }],
      { onTextDelta: (d) => { deltas.push(d); } },
    );

    expect(deltas).toEqual([]);
    expect(res.functionCalls).toEqual([{ name: 'run_ats_audit', args: { resumeId: 'res-1' } }]);
  });

  it('falls back to next model when primary model returns 404 before emitting tokens', async () => {
    const okFrame = `data: ${JSON.stringify({
      candidates: [{ content: { parts: [{ text: 'Hello from fallback!' }] } }],
    })}\n\n`;

    globalThis.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        status: 404,
        text: () => Promise.resolve('Model not found'),
      } as any)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        body: makeSseReadableStream([okFrame]),
      } as any);

    const deltas: string[] = [];
    const res = await provider.streamGeminiWithFunctions(
      [{ role: 'user', parts: [{ text: 'Hi' }] }],
      undefined,
      { onTextDelta: (d) => { deltas.push(d); } },
    );

    expect(deltas).toEqual(['Hello from fallback!']);
    expect(res.text).toBe('Hello from fallback!');
    expect(globalThis.fetch).toHaveBeenCalledTimes(2);
  });

  it('sends cachedContent without duplicate systemInstruction/tools and auto-recovers if cache handle expired (404)', async () => {
    const okFrame = `data: ${JSON.stringify({
      candidates: [{ content: { parts: [{ text: 'Cached answer!' }] } }],
      usageMetadata: {
        promptTokenCount: 2500,
        cachedContentTokenCount: 2000,
        candidatesTokenCount: 10,
        totalTokenCount: 2510,
      },
    })}\n\n`;

    const fetchMock = vi
      .fn()
      // First call returns 404 (expired cachedContent handle)
      .mockResolvedValueOnce({
        ok: false,
        status: 404,
        text: () => Promise.resolve('CachedContent not found'),
      } as any)
      // Retry without cachedContent succeeds with fallbackPrefixContents + systemInstruction + tools
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        body: makeSseReadableStream([okFrame]),
      } as any);
    globalThis.fetch = fetchMock;

    const evicted: string[] = [];
    const res = await provider.streamGeminiWithFunctions(
      [{ role: 'user', parts: [{ text: 'Follow-up turn' }] }],
      [{ name: 'run_ats_audit', description: 'Audit', parameters: {} }],
      {
        systemInstruction: 'Static system',
        cachedContent: 'cachedContents/expired-1',
        fallbackPrefixContents: [{ role: 'user', parts: [{ text: 'Resume JSON prefix' }] }],
        onCacheEvict: (h) => evicted.push(h),
      },
    );

    expect(evicted).toEqual(['cachedContents/expired-1']);
    expect(res.text).toBe('Cached answer!');
    expect(res.telemetry.cachedInputTokens).toBe(2000);
    expect(res.telemetry.savedCostUsd).toBeGreaterThan(0);

    const firstBody = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(firstBody.cachedContent).toBe('cachedContents/expired-1');
    expect(firstBody.systemInstruction).toBeUndefined();
    expect(firstBody.tools).toBeUndefined();

    const retryBody = JSON.parse(fetchMock.mock.calls[1][1].body);
    expect(retryBody.cachedContent).toBeUndefined();
    expect(retryBody.systemInstruction).toBeDefined();
    expect(retryBody.tools).toBeDefined();
    expect(retryBody.contents[0].parts[0].text).toBe('Resume JSON prefix');
  });
});

