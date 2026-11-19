import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { calculateUsageCost, getModelPricing } from '../config/ai-model-pricing.js';

export type AiModelTier = 'fast' | 'reasoning';

export type AiTaskKind =
  | 'intent_routing'
  | 'simple_qa'
  | 'metadata_extraction'
  | 'bullet_rewrite'
  | 'tool_synthesis'
  | 'interview_questions'
  | 'holistic_resume_edit'
  | 'deep_jd_tailoring'
  | 'interview_evaluation';

export interface ResolvedModelRoute {
  taskKind: AiTaskKind;
  tier: AiModelTier;
  primaryModel: string;
  fallbackModels: string[];
}

const TASK_TO_TIER: Record<AiTaskKind, AiModelTier> = {
  // Fast / cheap tier: routing, lightweight Q&A, parsing, formatting
  intent_routing: 'fast',
  simple_qa: 'fast',
  metadata_extraction: 'fast',
  bullet_rewrite: 'fast',
  tool_synthesis: 'fast',
  interview_questions: 'fast',

  // High-reasoning tier: whole-resume holistic editing, deep JD matching/tailoring, interview grading
  holistic_resume_edit: 'reasoning',
  deep_jd_tailoring: 'reasoning',
  interview_evaluation: 'reasoning',
};

const DEFAULT_FAST_CHAIN = [
  'gemini-flash-lite-latest',
  'gemini-3.1-flash-lite',
  'gemini-3.1-flash-lite-preview',
  'gemini-flash-latest',
];

const DEFAULT_REASONING_CHAIN = [
  'gemini-flash-latest',
  'gemini-3-flash-preview',
  'gemini-3.1-flash-lite',
  'gemini-flash-lite-latest',
];

@Injectable()
export class AiModelRouterService {
  private readonly logger = new Logger(AiModelRouterService.name);
  private readonly fastModel: string;
  private readonly reasoningModel: string;

  constructor(private readonly configService: ConfigService) {
    const legacyModel = this.normalizeModel(this.configService.get<string>('AI_MODEL'));
    const configuredFast = this.normalizeModel(this.configService.get<string>('AI_MODEL_FAST'));
    const configuredReasoning = this.normalizeModel(
      this.configService.get<string>('AI_MODEL_REASONING'),
    );

    // If AI_MODEL is explicitly a lite model, respect it for the fast tier unless AI_MODEL_FAST overrides it
    const inferredFast =
      configuredFast ||
      (legacyModel && /lite/i.test(legacyModel) ? legacyModel : 'gemini-flash-lite-latest');

    // Reasoning tier prefers explicit AI_MODEL_REASONING, or non-lite AI_MODEL, or live gemini-flash-latest
    const inferredReasoning =
      configuredReasoning ||
      (legacyModel && !/lite/i.test(legacyModel) ? legacyModel : 'gemini-flash-latest');

    this.fastModel = this.ensurePricedOrDefault(inferredFast, 'gemini-flash-lite-latest');
    this.reasoningModel = this.ensurePricedOrDefault(inferredReasoning, 'gemini-flash-latest');

    this.logger.log(
      `Smart Model Tiering active — fast="${this.fastModel}", reasoning="${this.reasoningModel}"`,
    );
  }

  private normalizeModel(raw?: string): string | undefined {
    const cleaned = (raw || '').trim();
    if (!cleaned || cleaned.includes('1.5')) return undefined;
    return cleaned;
  }

  private ensurePricedOrDefault(candidate: string, fallback: string): string {
    try {
      getModelPricing(candidate);
      return candidate;
    } catch {
      this.logger.warn(
        `Configured model "${candidate}" has no verified pricing entry; falling back to "${fallback}".`,
      );
      return fallback;
    }
  }

  public getTierForTask(taskKind: AiTaskKind): AiModelTier {
    return TASK_TO_TIER[taskKind] || 'fast';
  }

  public getFastModel(): string {
    return this.fastModel;
  }

  public getReasoningModel(): string {
    return this.reasoningModel;
  }

  /**
   * Resolves the ordered primary + fallback model chain for a given workload.
   */
  public resolveForTask(taskKind: AiTaskKind): ResolvedModelRoute {
    const tier = this.getTierForTask(taskKind);
    return this.resolveForTier(tier, taskKind);
  }

  /**
   * Resolves the ordered primary + fallback model chain directly by tier.
   */
  public resolveForTier(
    tier: AiModelTier,
    taskKind: AiTaskKind = tier === 'reasoning' ? 'holistic_resume_edit' : 'intent_routing',
  ): ResolvedModelRoute {
    const primaryModel = tier === 'reasoning' ? this.reasoningModel : this.fastModel;
    const baseChain = tier === 'reasoning' ? DEFAULT_REASONING_CHAIN : DEFAULT_FAST_CHAIN;
    const ordered = [primaryModel, ...baseChain].filter(
      (m, idx, arr) => Boolean(m) && arr.indexOf(m) === idx,
    );

    return {
      taskKind,
      tier,
      primaryModel: ordered[0],
      fallbackModels: ordered.slice(1),
    };
  }

  /**
   * Computes actual cost vs reasoning-tier baseline cost to quantify Smart Model Tiering savings.
   */
  public computeTierSavings(
    actualModelId: string,
    promptTokens: number,
    completionTokens: number,
    cachedInputTokens = 0,
  ): {
    actualCostUsd: number;
    reasoningBaselineCostUsd: number;
    tierSavingsUsd: number;
    tierSavingsPct: number;
  } {
    const actual = calculateUsageCost(
      actualModelId,
      promptTokens,
      completionTokens,
      cachedInputTokens,
    );
    const baseline = calculateUsageCost(
      this.reasoningModel,
      promptTokens,
      completionTokens,
      cachedInputTokens,
    );
    const savings = Math.max(0, Number((baseline.costUsd - actual.costUsd).toFixed(8)));
    const pct =
      baseline.costUsd > 0 ? Math.round((savings / baseline.costUsd) * 1000) / 10 : 0;

    return {
      actualCostUsd: actual.costUsd,
      reasoningBaselineCostUsd: baseline.costUsd,
      tierSavingsUsd: savings,
      tierSavingsPct: pct,
    };
  }
}

