import { BadRequestException } from '@nestjs/common';

export interface ModelPricing {
  modelId: string;
  version: string;
  inputPerMillionUsd: number;
  outputPerMillionUsd: number;
}

export const AI_MODEL_PRICING_REGISTRY: Record<string, ModelPricing> = {
  'gemini-3.1-flash-lite': {
    modelId: 'gemini-3.1-flash-lite',
    version: '2026-Q1',
    inputPerMillionUsd: 0.25,
    outputPerMillionUsd: 2.00,
  },
  'gemini-3.1-flash-lite-preview': {
    modelId: 'gemini-3.1-flash-lite-preview',
    version: '2026-Q1',
    inputPerMillionUsd: 0.25,
    outputPerMillionUsd: 2.00,
  },
  'gemini-flash-lite-latest': {
    modelId: 'gemini-flash-lite-latest',
    version: '2026-Q1',
    inputPerMillionUsd: 0.25,
    outputPerMillionUsd: 2.00,
  },
  'gemini-flash-latest': {
    modelId: 'gemini-flash-latest',
    version: '2026-Q1',
    inputPerMillionUsd: 0.50,
    outputPerMillionUsd: 3.00,
  },
  'gemini-3-flash-preview': {
    modelId: 'gemini-3-flash-preview',
    version: '2026-Q1',
    inputPerMillionUsd: 0.50,
    outputPerMillionUsd: 3.00,
  },
  'gemini-3.1-pro-preview': {
    modelId: 'gemini-3.1-pro-preview',
    version: '2026-Q1',
    inputPerMillionUsd: 1.25,
    outputPerMillionUsd: 10.00,
  },
  'gemini-2.5-flash-lite': {
    modelId: 'gemini-2.5-flash-lite',
    version: '2026-Q1',
    inputPerMillionUsd: 0.10,
    outputPerMillionUsd: 0.40,
  },
  'gemini-2.5-pro': {
    modelId: 'gemini-2.5-pro',
    version: '2026-Q1',
    inputPerMillionUsd: 1.25,
    outputPerMillionUsd: 10.00,
  },
  'gemini-3.5-flash-lite': {
    modelId: 'gemini-3.5-flash-lite',
    version: '2026-Q1',
    inputPerMillionUsd: 0.30,
    outputPerMillionUsd: 2.50,
  },
  'gemini-3.5-flash': {
    modelId: 'gemini-3.5-flash',
    version: '2026-Q1',
    inputPerMillionUsd: 0.50,
    outputPerMillionUsd: 3.00,
  },
  'gemini-3.6-flash': {
    modelId: 'gemini-3.6-flash',
    version: '2026-Q1',
    inputPerMillionUsd: 0.50,
    outputPerMillionUsd: 3.00,
  },
  'gemini-2.5-flash': {
    modelId: 'gemini-2.5-flash',
    version: '2026-Q1',
    inputPerMillionUsd: 0.15,
    outputPerMillionUsd: 0.60,
  },
  'gemini-2.0-flash': {
    modelId: 'gemini-2.0-flash',
    version: '2026-Q1',
    inputPerMillionUsd: 0.10,
    outputPerMillionUsd: 0.40,
  },
  'gemini-1.5-pro': {
    modelId: 'gemini-1.5-pro',
    version: '2026-Q1',
    inputPerMillionUsd: 1.25,
    outputPerMillionUsd: 5.00,
  },
  'mock': {
    modelId: 'mock',
    version: '2026-Q1',
    inputPerMillionUsd: 0.00,
    outputPerMillionUsd: 0.00,
  },
};

/**
 * Returns model pricing or throws BadRequestException if the model pricing is unconfigured.
 * Safeguard 1: Unknown/unconfigured AI model pricing must block generation until verified pricing is configured.
 */
export function getModelPricing(modelId: string): ModelPricing {
  const normalized = (modelId || '').trim().toLowerCase();
  const pricing = AI_MODEL_PRICING_REGISTRY[normalized];
  if (!pricing) {
    throw new BadRequestException(
      `Unconfigured AI model pricing for '${modelId}'. Generation blocked until verified pricing is registered in AI_MODEL_PRICING_REGISTRY.`,
    );
  }
  return pricing;
}

export function calculateUsageCost(
  modelId: string,
  promptTokens: number,
  completionTokens: number,
  cachedInputTokens = 0,
): {
  costUsd: number;
  savedCostUsd: number;
  cachedInputTokens: number;
  pricingVersion: string;
  modelId: string;
} {
  const pricing = getModelPricing(modelId);
  const clampedCached = Math.max(0, Math.min(cachedInputTokens || 0, promptTokens || 0));
  const uncachedPromptTokens = Math.max(0, (promptTokens || 0) - clampedCached);
  // Gemini context caching bills cached input reads at 10% of standard input token price (90% discount)
  const uncachedInputCost = (uncachedPromptTokens / 1_000_000) * pricing.inputPerMillionUsd;
  const cachedInputCost = (clampedCached / 1_000_000) * (pricing.inputPerMillionUsd * 0.1);
  const outputCost = (completionTokens / 1_000_000) * pricing.outputPerMillionUsd;
  const totalCost = Number((uncachedInputCost + cachedInputCost + outputCost).toFixed(8));
  const savedCostUsd = Number(
    ((clampedCached / 1_000_000) * (pricing.inputPerMillionUsd * 0.9)).toFixed(8),
  );
  return {
    costUsd: totalCost,
    savedCostUsd,
    cachedInputTokens: clampedCached,
    pricingVersion: pricing.version,
    modelId: pricing.modelId,
  };
}

