import { describe, it, expect } from 'vitest';
import { BadRequestException } from '@nestjs/common';
import { getModelPricing, calculateUsageCost } from './ai-model-pricing.js';

describe('AI Model Pricing Registry (Safeguard 1)', () => {
  it('should return configured pricing for gemini-3.5-flash-lite', () => {
    const pricing = getModelPricing('gemini-3.5-flash-lite');
    expect(pricing).toBeDefined();
    expect(pricing.inputPerMillionUsd).toBe(0.30);
    expect(pricing.outputPerMillionUsd).toBe(2.50);
  });

  it('should return configured pricing for gemini-2.0-flash', () => {
    const pricing = getModelPricing('gemini-2.0-flash');
    expect(pricing.inputPerMillionUsd).toBe(0.10);
    expect(pricing.outputPerMillionUsd).toBe(0.40);
  });

  it('should return configured pricing for gemini-1.5-flash and alias', () => {
    const pricing = getModelPricing('gemini-1.5-flash');
    expect(pricing).toBeDefined();
    expect(pricing.inputPerMillionUsd).toBe(0.075);
    expect(pricing.outputPerMillionUsd).toBe(0.30);

    const aliasPricing = getModelPricing('gemini-1.5-flash-latest');
    expect(aliasPricing).toBeDefined();
    expect(aliasPricing.inputPerMillionUsd).toBe(0.075);
  });

  it('should return configured pricing for mock model', () => {
    const pricing = getModelPricing('mock');
    expect(pricing.inputPerMillionUsd).toBe(0.00);
    expect(pricing.outputPerMillionUsd).toBe(0.00);
  });

  it('safeguard 1: should throw BadRequestException for unknown/unconfigured model pricing', () => {
    expect(() => getModelPricing('gpt-5-ultra')).toThrow(BadRequestException);
    expect(() => getModelPricing('claude-4')).toThrow(BadRequestException);
    expect(() => getModelPricing('')).toThrow(BadRequestException);
  });

  it('should accurately calculate cost in USD from input and output tokens', () => {
    // 3,000 input tokens at $0.30/1M = $0.0009
    // 1,500 output tokens at $2.50/1M = $0.00375
    // Total = $0.00465
    const result = calculateUsageCost('gemini-3.5-flash-lite', 3000, 1500);
    expect(result.costUsd).toBeCloseTo(0.00465, 5);
    expect(result.pricingVersion).toBe('2026-Q1');
    expect(result.modelId).toBe('gemini-3.5-flash-lite');
  });
});

