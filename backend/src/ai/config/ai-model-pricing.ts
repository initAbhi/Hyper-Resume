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
  'gemini-1.5-flash': {
    modelId: 'gemini-1.5-flash',
    version: '2026-Q1',
    inputPerMillionUsd: 0.075,
    outputPerMillionUsd: 0.30,
  },
  'gemini-1.5-flash-latest': {
    modelId: 'gemini-1.5-flash-latest',
    version: '2026-Q1',
    inputPerMillionUsd: 0.075,
    outputPerMillionUsd: 0.30,
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
): { costUsd: number; pricingVersion: string; modelId: string } {
  const pricing = getModelPricing(modelId);
  const inputCost = (promptTokens / 1_000_000) * pricing.inputPerMillionUsd;
  const outputCost = (completionTokens / 1_000_000) * pricing.outputPerMillionUsd;
  const totalCost = Number((inputCost + outputCost).toFixed(8));
  return {
    costUsd: totalCost,
    pricingVersion: pricing.version,
    modelId: pricing.modelId,
  };
}

