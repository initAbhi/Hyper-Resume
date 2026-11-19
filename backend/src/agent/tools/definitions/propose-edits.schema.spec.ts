import { describe, expect, it, vi, afterEach } from 'vitest';
import { ConfigService } from '@nestjs/config';
import {
  ALLOWED_RESUME_TEMPLATE_KEYS,
  HOLISTIC_PROPOSE_EDITS_RESPONSE_SCHEMA,
  parseStrictStructuredProposalJson,
} from './propose-edits.schema.js';
import { GeminiAiProvider } from '../../../ai/providers/gemini-ai.provider.js';
import { AiModelRouterService } from '../../../ai/services/ai-model-router.service.js';

const VALID_GEMINI_TYPES = new Set([
  'OBJECT',
  'ARRAY',
  'STRING',
  'INTEGER',
  'NUMBER',
  'BOOLEAN',
]);

function assertValidGeminiSchemaNode(node: Record<string, any>, path = 'root') {
  expect(VALID_GEMINI_TYPES.has(node.type), `Invalid Gemini type "${node.type}" at ${path}`).toBe(
    true,
  );
  // Gemini OpenAPI-subset rejects additionalProperties
  expect(node.additionalProperties, `additionalProperties disallowed at ${path}`).toBeUndefined();

  if (node.type === 'OBJECT') {
    expect(
      node.properties && typeof node.properties === 'object' && Object.keys(node.properties).length > 0,
      `OBJECT at ${path} must define non-empty properties`,
    ).toBe(true);
    for (const [key, child] of Object.entries(node.properties)) {
      assertValidGeminiSchemaNode(child as Record<string, any>, `${path}.${key}`);
    }
    if (Array.isArray(node.required)) {
      for (const reqKey of node.required) {
        expect(
          Object.prototype.hasOwnProperty.call(node.properties, reqKey),
          `required field "${reqKey}" missing from properties at ${path}`,
        ).toBe(true);
      }
    }
  } else if (node.type === 'ARRAY') {
    expect(node.items && typeof node.items === 'object', `ARRAY at ${path} must define items`).toBe(
      true,
    );
    assertValidGeminiSchemaNode(node.items, `${path}[]`);
  }
}

describe('HOLISTIC_PROPOSE_EDITS_RESPONSE_SCHEMA & strict JSON parser', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('conforms strictly to Gemini REST OpenAPI-subset schema rules', () => {
    assertValidGeminiSchemaNode(HOLISTIC_PROPOSE_EDITS_RESPONSE_SCHEMA);

    const props = HOLISTIC_PROPOSE_EDITS_RESPONSE_SCHEMA.properties as Record<string, any>;
    expect(props.templateKey.enum).toEqual([...ALLOWED_RESUME_TEMPLATE_KEYS]);
    expect(props.layout.properties.pageMode.enum).toEqual(['auto', 'single', 'multi']);
    expect(props.layout.properties.fontFamily.enum).toEqual(['sans', 'serif', 'mono']);
    expect(HOLISTIC_PROPOSE_EDITS_RESPONSE_SCHEMA.required).toContain('changeSummary');
  });

  it('parses pure strict JSON with strictDirectParse=true', () => {
    const raw = JSON.stringify({
      changeSummary: 'Improved backend bullets and summary',
      headline: 'Senior Backend Engineer',
      experience: [
        {
          experienceIndex: 0,
          bulletEdits: [{ bulletIndex: 0, proposed: 'Architected distributed APIs' }],
        },
      ],
    });
    const result = parseStrictStructuredProposalJson(raw);
    expect(result.strictDirectParse).toBe(true);
    expect(result.parsed?.changeSummary).toBe('Improved backend bullets and summary');
    expect(result.parsed?.experience).toHaveLength(1);
  });

  it('marks markdown-fenced JSON as strictDirectParse=false fallback', () => {
    const fenced = '```json\n{"changeSummary":"Fenced output"}\n```';
    const result = parseStrictStructuredProposalJson(fenced);
    expect(result.strictDirectParse).toBe(false);
    expect(result.parsed?.changeSummary).toBe('Fenced output');
  });

  it('returns parsed=null on malformed non-JSON payloads', () => {
    expect(parseStrictStructuredProposalJson('Sorry I cannot do that.')).toEqual({
      parsed: null,
      strictDirectParse: false,
    });
    expect(parseStrictStructuredProposalJson('[1, 2, 3]')).toEqual({
      parsed: null,
      strictDirectParse: false,
    });
  });

  it('forwards generationConfig.responseMimeType and responseSchema via GeminiAiProvider', async () => {
    const configService = new ConfigService({
      AI_API_KEY: 'test-key-structured',
      AI_MODEL_REASONING: 'gemini-flash-latest',
      AI_MODEL_FAST: 'gemini-flash-lite-latest',
    });
    const router = new AiModelRouterService(configService);
    const provider = new GeminiAiProvider(configService, router);

    let capturedBody: Record<string, any> | undefined;
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (_url, init) => {
      capturedBody = JSON.parse(String(init?.body || '{}'));
      return new Response(
        JSON.stringify({
          candidates: [
            {
              content: {
                role: 'model',
                parts: [{ text: JSON.stringify({ changeSummary: 'Strict schema OK' }) }],
              },
            },
          ],
          usageMetadata: { promptTokenCount: 120, candidatesTokenCount: 30, totalTokenCount: 150 },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      );
    });

    const res = await provider.callGeminiWithFunctions(
      [{ role: 'user', parts: [{ text: 'Optimize this resume' }] }],
      [],
      {
        systemInstruction: 'You are an ATS resume editor.',
        tier: 'reasoning',
        temperature: 0.25,
        responseMimeType: 'application/json',
        responseSchema: HOLISTIC_PROPOSE_EDITS_RESPONSE_SCHEMA,
      },
    );

    expect(capturedBody?.generationConfig?.responseMimeType).toBe('application/json');
    expect(capturedBody?.generationConfig?.responseSchema).toEqual(
      HOLISTIC_PROPOSE_EDITS_RESPONSE_SCHEMA,
    );
    expect(capturedBody?.tools).toBeUndefined();
    expect(res.telemetry.modelTier).toBe('reasoning');
    expect(parseStrictStructuredProposalJson(res.text || '').strictDirectParse).toBe(true);
  });

  it('circuit-breaks a 503-degraded model so subsequent calls route directly to healthy fallback', async () => {
    const configService = new ConfigService({
      AI_API_KEY: 'test-key-circuit',
      AI_MODEL_REASONING: 'gemini-flash-latest',
      AI_MODEL_FAST: 'gemini-flash-lite-latest',
    });
    const router = new AiModelRouterService(configService);
    const provider = new GeminiAiProvider(configService, router);

    const calledUrls: string[] = [];
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (url) => {
      const u = String(url);
      calledUrls.push(u);
      if (u.includes('/models/gemini-flash-latest:')) {
        return new Response('overloaded', { status: 503 });
      }
      return new Response(
        JSON.stringify({
          candidates: [
            {
              content: {
                role: 'model',
                parts: [{ text: JSON.stringify({ changeSummary: 'Healthy failover' }) }],
              },
            },
          ],
          usageMetadata: { promptTokenCount: 50, candidatesTokenCount: 15, totalTokenCount: 65 },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      );
    });

    // Call 1 hits gemini-flash-latest (503) -> marks degraded -> succeeds on fallback
    await provider.callGeminiWithFunctions(
      [{ role: 'user', parts: [{ text: 'First call' }] }],
      [],
      { tier: 'reasoning', responseMimeType: 'application/json' },
    );
    expect(calledUrls.length).toBe(2);
    expect(calledUrls[0]).toContain('/models/gemini-flash-latest:');

    // Call 2 MUST skip degraded gemini-flash-latest and hit healthy model immediately on attempt 1
    calledUrls.length = 0;
    await provider.callGeminiWithFunctions(
      [{ role: 'user', parts: [{ text: 'Second call' }] }],
      [],
      { tier: 'reasoning', responseMimeType: 'application/json' },
    );
    expect(calledUrls.length).toBe(1);
    expect(calledUrls[0]).not.toContain('/models/gemini-flash-latest:');
  });
});
