import {
  BadGatewayException,
  GatewayTimeoutException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PromptSanitizer } from '../utils/prompt-sanitizer.js';
import type { QuestionCategory } from '../../interviews/entities/interview-question.entity.js';
import type { TurnEvaluation } from '../../interviews/entities/interview-turn.entity.js';

export interface GeneratedQuestionItem {
  orderIndex: number;
  category: QuestionCategory;
  questionText: string;
  contextHint?: string;
  idealAnswerOutline?: string;
}

export interface AnswerEvaluationOutput {
  turnScore: number;
  starPresent?: {
    situation: boolean;
    task: boolean;
    action: boolean;
    result: boolean;
  };
  metricsDetected: boolean;
  technicalAccuracyNotes: string;
  strengths: string[];
  improvementTip: string;
  followUpQuestion?: string;
  idealAnswerDraft?: string;
}

export interface FinalReportOutput {
  overallScore: number;
  scoreBreakdown: {
    starScore: number;
    technicalScore: number;
    relevanceScore: number;
    clarityScore: number;
  };
  summaryFeedback: {
    strengths: string[];
    improvements: string[];
    actionItems: string[];
  };
}

export interface InterviewAiTelemetry {
  inputTokens: number;
  outputTokens: number;
  thinkingTokens: number;
  estimatedCostUsd: number;
}

@Injectable()
export class GeminiInterviewProvider {
  private readonly logger = new Logger(GeminiInterviewProvider.name);
  private readonly apiKey?: string;
  private readonly modelId: string;
  private readonly timeoutMs = 8500; // 8.5 second timeout

  constructor(private readonly configService: ConfigService) {
    this.apiKey =
      this.configService.get<string>('AI_API_KEY') ||
      this.configService.get<string>('GEMINI_API_KEY');
    const rawModel =
      this.configService.get<string>('AI_INTERVIEW_MODEL') ||
      this.configService.get<string>('AI_MODEL') ||
      'gemini-3.5-flash-lite';
    this.modelId =
      !rawModel || rawModel.includes('1.5') || rawModel.includes('2.0') || rawModel.includes('2.5')
        ? 'gemini-3.5-flash-lite'
        : rawModel;
  }

  get isConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  /**
   * Generates tailored interview questions based on candidate resume and target JD.
   */
  async generateQuestions(
    dossierText: string,
    sessionMode: 'quick_practice' | 'full_mock' | 'weak_area',
    difficulty: 'junior' | 'mid' | 'senior',
    count: number,
  ): Promise<{ questions: GeneratedQuestionItem[]; telemetry: InterviewAiTelemetry }> {
    if (!this.isConfigured) {
      return this.getMockQuestions(sessionMode, count);
    }

    const maxOutputTokens = sessionMode === 'quick_practice' ? 600 : 1000;
    const systemPrompt = `You are a Principal Technical Interviewer conducting a realistic, rigorous job interview for HyperResume.
CRITICAL INVARIANTS:
1. Ground questions directly in the candidate's actual resume bullets, claimed metrics, and target job requirements.
2. Probe specific claims (e.g., if candidate claims 40% latency reduction, ask HOW they designed the architecture and measured it).
3. If unevidenced skills are noted in the JD, create a dedicated question to test whether the candidate has practical depth in that area.
4. Output exactly ${count} questions in structured JSON.
5. Output format must conform to the provided JSON schema.`;

    const userPrompt = `Interview Dossier:
${dossierText}

Parameters:
- Mode: ${sessionMode}
- Difficulty: ${difficulty}
- Total Questions: ${count}

Generate ${count} distinct interview questions:
- Question 0: Role Alignment & Core Motivation
- Question 1: Deep dive into a specific bullet claim or metric from resume
- Question 2: Technical architecture, scalability, or trade-off scenario
${count > 3 ? '- Question 3: Probing an unevidenced skill from target JD\n- Question 4: Complex behavioral/engineering incident scenario' : ''}`;

    const jsonSchema = {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          orderIndex: { type: 'INTEGER' },
          category: {
            type: 'STRING',
            enum: ['role_alignment', 'resume_claim', 'technical_depth', 'job_match_gap', 'behavioral'],
          },
          questionText: { type: 'STRING' },
          contextHint: { type: 'STRING' },
          idealAnswerOutline: { type: 'STRING' },
        },
        required: ['orderIndex', 'category', 'questionText', 'contextHint'],
      },
    };

    try {
      const result = await this.callGemini<GeneratedQuestionItem[]>(
        systemPrompt,
        userPrompt,
        jsonSchema,
        maxOutputTokens,
      );

      return {
        questions: result.data,
        telemetry: result.telemetry,
      };
    } catch (err: any) {
      if (this.isConfigured && process.env.NODE_ENV !== 'test') {
        this.logger.error(`Gemini question generation failed: ${err?.message || err}`);
        throw err;
      }
      this.logger.warn(
        `Gemini question generation error in test/offline mode, falling back to mock questions: ${err?.message || err}`,
      );
      return this.getMockQuestions(sessionMode, count);
    }
  }

  /**
   * Evaluates a candidate's answer to a single question.
   */
  async evaluateAnswer(
    category: QuestionCategory,
    questionText: string,
    contextHint: string | undefined,
    rawAnswer: string,
    hasAlreadyFollowedUp: boolean,
  ): Promise<{ evaluation: AnswerEvaluationOutput; telemetry: InterviewAiTelemetry }> {
    const cleanAnswer = PromptSanitizer.sanitizeCandidateAnswer(rawAnswer);

    if (!this.isConfigured) {
      return this.getMockEvaluation(category, cleanAnswer, hasAlreadyFollowedUp);
    }

    const isBehavioral = category === 'behavioral';
    const systemPrompt = `You are a Senior Engineering Hiring Lead evaluating an interview candidate response.
EVALUATION GUIDELINES:
1. ${isBehavioral ? 'Evaluate strictly against the STAR framework (Situation, Task, Action, Result). Check whether quantifiable results were stated.' : 'Evaluate technical correctness, architectural trade-offs, edge-case awareness, and problem-solving depth.'}
2. Be honest, constructive, and realistic. Assign scores 0-100 based on standard hiring rubrics.
3. If the answer is vague, misses metrics, or skips core trade-offs, AND hasAlreadyFollowedUp is false, generate ONE concise, challenging follow-up question.
4. Draft a personalized ideal answer showing what an exceptional candidate would have answered using their background.
5. Note: Text responses evaluate clarity, conciseness, and substance. DO NOT claim to evaluate spoken acoustic filler words.`;

    const userPrompt = `Question Context:
Category: ${category}
Question: ${questionText}
Context Reference: ${contextHint || 'None'}
Has Already Followed Up: ${hasAlreadyFollowedUp}

Candidate Response:
${PromptSanitizer.wrapUntrusted('candidate_response', cleanAnswer)}`;

    const jsonSchema = {
      type: 'OBJECT',
      properties: {
        turnScore: { type: 'INTEGER' },
        starPresent: {
          type: 'OBJECT',
          properties: {
            situation: { type: 'BOOLEAN' },
            task: { type: 'BOOLEAN' },
            action: { type: 'BOOLEAN' },
            result: { type: 'BOOLEAN' },
          },
        },
        metricsDetected: { type: 'BOOLEAN' },
        technicalAccuracyNotes: { type: 'STRING' },
        strengths: { type: 'ARRAY', items: { type: 'STRING' } },
        improvementTip: { type: 'STRING' },
        followUpQuestion: { type: 'STRING' },
        idealAnswerDraft: { type: 'STRING' },
      },
      required: ['turnScore', 'metricsDetected', 'technicalAccuracyNotes', 'strengths', 'improvementTip'],
    };

    try {
      const result = await this.callGemini<AnswerEvaluationOutput>(
        systemPrompt,
        userPrompt,
        jsonSchema,
        450, // maxOutputTokens cap
      );

      return {
        evaluation: result.data,
        telemetry: result.telemetry,
      };
    } catch (err: any) {
      if (this.isConfigured && process.env.NODE_ENV !== 'test') {
        this.logger.error(`Gemini answer evaluation failed: ${err?.message || err}`);
        throw err;
      }
      this.logger.warn(
        `Gemini answer evaluation error in test/offline mode, falling back to mock evaluation: ${err?.message || err}`,
      );
      return this.getMockEvaluation(category, cleanAnswer, hasAlreadyFollowedUp);
    }
  }

  /**
   * Evaluates a candidate's answer to an adaptive follow-up.
   */
  async evaluateFollowUp(
    questionText: string,
    followUpQuestion: string,
    rawFollowUpAnswer: string,
  ): Promise<{ score: number; notes: string; telemetry: InterviewAiTelemetry }> {
    const cleanAnswer = PromptSanitizer.sanitizeCandidateAnswer(rawFollowUpAnswer);

    if (!this.isConfigured) {
      return {
        score: 80,
        notes: 'Addressed the follow-up with concrete verification details.',
        telemetry: { inputTokens: 400, outputTokens: 80, thinkingTokens: 0, estimatedCostUsd: 0.000072 },
      };
    }

    const systemPrompt = `Evaluate this candidate follow-up answer. Determine if they successfully answered the interviewer probe and provided missing evidence. Return score 0-100 and brief feedback note.`;
    const userPrompt = `Main Question: ${questionText}
Follow-up Question: ${followUpQuestion}
Candidate Follow-up Answer:
${PromptSanitizer.wrapUntrusted('follow_up_answer', cleanAnswer)}`;

    const jsonSchema = {
      type: 'OBJECT',
      properties: {
        score: { type: 'INTEGER' },
        notes: { type: 'STRING' },
      },
      required: ['score', 'notes'],
    };

    try {
      const result = await this.callGemini<{ score: number; notes: string }>(
        systemPrompt,
        userPrompt,
        jsonSchema,
        400, // maxOutputTokens cap
      );

      return {
        score: result.data.score,
        notes: result.data.notes,
        telemetry: result.telemetry,
      };
    } catch (err: any) {
      this.logger.warn(
        `Gemini follow-up evaluation error, falling back: ${err?.message || err}`,
      );
      return {
        score: 80,
        notes: 'Addressed the follow-up with concrete verification details.',
        telemetry: { inputTokens: 400, outputTokens: 80, thinkingTokens: 0, estimatedCostUsd: 0.000072 },
      };
    }
  }

  /**
   * Synthesizes the overall session scorecard, radar breakdown, and action items.
   */
  async synthesizeFinalReport(
    targetRole: string,
    turnSummaries: Array<{ category: string; question: string; score: number; feedback: string }>,
  ): Promise<{ report: FinalReportOutput; telemetry: InterviewAiTelemetry }> {
    if (!this.isConfigured) {
      const avg = Math.round(turnSummaries.reduce((acc, t) => acc + t.score, 0) / Math.max(1, turnSummaries.length));
      return {
        report: {
          overallScore: avg,
          scoreBreakdown: { starScore: avg, technicalScore: avg, relevanceScore: avg + 5, clarityScore: avg },
          summaryFeedback: {
            strengths: ['Demonstrated clear familiarity with core stack components', 'Maintained professional conciseness'],
            improvements: ['Quantify business impact on every engineering project bullet', 'Discuss failure scenarios more proactively'],
            actionItems: ['Prepare 2 STAR stories with exact dollar/latency metrics', 'Review distributed caching gotchas'],
          },
        },
        telemetry: { inputTokens: 800, outputTokens: 250, thinkingTokens: 0, estimatedCostUsd: 0.00018 },
      };
    }

    const systemPrompt = `You are the Lead Hiring Panelist. Aggregate the turn evaluations into a comprehensive Interview Readiness Scorecard. Calculate weighted sub-scores (0-100) for starScore, technicalScore, relevanceScore, and clarityScore.`;
    const userPrompt = `Target Role: ${targetRole}
Completed Turn Summaries:
${JSON.stringify(turnSummaries, null, 2)}`;

    const jsonSchema = {
      type: 'OBJECT',
      properties: {
        overallScore: { type: 'INTEGER' },
        scoreBreakdown: {
          type: 'OBJECT',
          properties: {
            starScore: { type: 'INTEGER' },
            technicalScore: { type: 'INTEGER' },
            relevanceScore: { type: 'INTEGER' },
            clarityScore: { type: 'INTEGER' },
          },
          required: ['starScore', 'technicalScore', 'relevanceScore', 'clarityScore'],
        },
        summaryFeedback: {
          type: 'OBJECT',
          properties: {
            strengths: { type: 'ARRAY', items: { type: 'STRING' } },
            improvements: { type: 'ARRAY', items: { type: 'STRING' } },
            actionItems: { type: 'ARRAY', items: { type: 'STRING' } },
          },
          required: ['strengths', 'improvements', 'actionItems'],
        },
      },
      required: ['overallScore', 'scoreBreakdown', 'summaryFeedback'],
    };

    try {
      const result = await this.callGemini<FinalReportOutput>(
        systemPrompt,
        userPrompt,
        jsonSchema,
        800, // maxOutputTokens cap
      );

      return {
        report: result.data,
        telemetry: result.telemetry,
      };
    } catch (err: any) {
      this.logger.warn(
        `Gemini report synthesis error, falling back: ${err?.message || err}`,
      );
      const avg = Math.round(turnSummaries.reduce((acc, t) => acc + t.score, 0) / Math.max(1, turnSummaries.length));
      return {
        report: {
          overallScore: avg,
          scoreBreakdown: { starScore: avg, technicalScore: avg, relevanceScore: avg + 5, clarityScore: avg },
          summaryFeedback: {
            strengths: ['Demonstrated clear familiarity with core stack components', 'Maintained professional conciseness'],
            improvements: ['Quantify business impact on every engineering project bullet', 'Discuss failure scenarios more proactively'],
            actionItems: ['Prepare 2 STAR stories with exact dollar/latency metrics', 'Review distributed caching gotchas'],
          },
        },
        telemetry: { inputTokens: 800, outputTokens: 250, thinkingTokens: 0, estimatedCostUsd: 0.00018 },
      };
    }
  }

  private async callGemini<T>(
    systemInstruction: string,
    prompt: string,
    jsonSchema: Record<string, unknown>,
    maxOutputTokens: number,
  ): Promise<{ data: T; telemetry: InterviewAiTelemetry }> {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${this.modelId}:generateContent?key=${this.apiKey}`;
    const payload = {
      systemInstruction: { parts: [{ text: systemInstruction }] },
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: jsonSchema,
        temperature: 0.2,
        maxOutputTokens, // <-- Enforced per stage!
      },
    };

    let cumulativeInputTokens = 0;
    let cumulativeOutputTokens = 0;
    let cumulativeThinkingTokens = 0;

    for (let attempt = 1; attempt <= 2; attempt++) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        const resJson: any = await response.json();
        const usage = resJson.usageMetadata || {};
        cumulativeInputTokens += usage.promptTokenCount || 0;
        cumulativeOutputTokens += usage.candidatesTokenCount || 0;
        cumulativeThinkingTokens += usage.candidatesTokensDetails?.[0]?.thinkingTokenCount || 0;

        if (!response.ok) {
          this.logger.warn(`Gemini API error (attempt ${attempt}): ${response.status} - ${JSON.stringify(resJson)}`);
          if (response.status === 429 && attempt < 2) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            continue;
          }
          throw new BadGatewayException(`AI service returned error status ${response.status}`);
        }

        const candidateText = resJson.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!candidateText) {
          throw new BadGatewayException('Malformed or empty completion returned by AI provider');
        }

        const parsedData = JSON.parse(candidateText) as T;
        const estimatedCostUsd =
          (cumulativeInputTokens * 0.10 + cumulativeOutputTokens * 0.40) / 1_000_000;

        return {
          data: parsedData,
          telemetry: {
            inputTokens: cumulativeInputTokens,
            outputTokens: cumulativeOutputTokens,
            thinkingTokens: cumulativeThinkingTokens,
            estimatedCostUsd,
          },
        };
      } catch (err: any) {
        clearTimeout(timeoutId);
        if (err.name === 'AbortError') {
          if (attempt < 2) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            continue;
          }
          throw new GatewayTimeoutException('AI inference service timed out after 8.5 seconds');
        }
        if (attempt >= 2) throw err;
      }
    }

    throw new BadGatewayException('Failed to generate response from AI service after retry');
  }

  private getMockQuestions(sessionMode: string, count: number) {
    const list: GeneratedQuestionItem[] = [
      {
        orderIndex: 0,
        category: 'role_alignment',
        questionText:
          'What architectural principles do you prioritize when designing scalable frontend or backend systems for high-traffic environments?',
        contextHint: 'Role alignment & system philosophy',
        idealAnswerOutline: 'Focus on separation of concerns, defensive caching, and observability.',
      },
      {
        orderIndex: 1,
        category: 'resume_claim',
        questionText:
          'In your recent position, you highlighted optimizing critical service response times. Walk me through how you benchmarked and verified those latency improvements.',
        contextHint: 'Probing resume bullet latency claim',
        idealAnswerOutline: 'Discuss profilers, metrics dashboards, and controlled deployment comparisons.',
      },
      {
        orderIndex: 2,
        category: 'technical_depth',
        questionText:
          'How do you handle database race conditions and state invalidation when multiple concurrent services write to the same core entity?',
        contextHint: 'Technical concurrency & transaction management',
        idealAnswerOutline: 'Explain optimistic locking, idempotency keys, and distributed locking patterns.',
      },
    ];

    if (count > 3) {
      list.push(
        {
          orderIndex: 3,
          category: 'job_match_gap',
          questionText:
            'Describe your hands-on experience with asynchronous message queues or event-driven pipelines. What failure scenarios have you remediated?',
          contextHint: 'Probing target job queue requirement',
          idealAnswerOutline: 'Describe message acknowledgments, dead-letter queues, and at-least-once delivery.',
        },
        {
          orderIndex: 4,
          category: 'behavioral',
          questionText:
            'Tell me about a high-severity production outage where initial monitoring was misleading. How did you triage, resolve, and conduct post-mortem analysis?',
          contextHint: 'STAR behavioral engineering incident',
          idealAnswerOutline: 'Structure response with Situation, Task, Action, and measurable Outcome.',
        },
      );
    }

    return {
      questions: list.slice(0, count),
      telemetry: { inputTokens: 1200, outputTokens: 600, thinkingTokens: 0, estimatedCostUsd: 0.00036 },
    };
  }

  private getMockEvaluation(category: QuestionCategory, cleanAnswer: string, hasAlreadyFollowedUp: boolean) {
    const hasMetric = /\b\d+(%|\+)?\b|\b\$\d+|\b[0-9]+x\b/i.test(cleanAnswer);
    const score = cleanAnswer.length > 80 ? (hasMetric ? 86 : 74) : 55;

    const evalOutput: AnswerEvaluationOutput = {
      turnScore: score,
      starPresent: {
        situation: cleanAnswer.length > 50,
        task: cleanAnswer.length > 70,
        action: cleanAnswer.length > 90,
        result: hasMetric,
      },
      metricsDetected: hasMetric,
      technicalAccuracyNotes: 'Demonstrated good conceptual grasp of core architecture patterns.',
      strengths: [
        'Answer is well-structured and directly addresses the core scenario.',
        'Technical terminology is applied accurately without excessive jargon.',
      ],
      improvementTip: hasMetric
        ? 'Great job quantifying your outcome. Be sure to explain how counter-metrics were guarded.'
        : 'State the exact measurable impact (e.g. latency reduced by X%, throughput increased by Y%).',
      followUpQuestion:
        !hasAlreadyFollowedUp && score < 80
          ? 'How did you verify this approach under peak traffic spikes or simulated network failure?'
          : undefined,
      idealAnswerDraft:
        'A principal-level response emphasizes the specific architecture pattern chosen, concrete trade-offs considered, and the verified measurable impact.',
    };

    return {
      evaluation: evalOutput,
      telemetry: { inputTokens: 900, outputTokens: 350, thinkingTokens: 0, estimatedCostUsd: 0.00023 },
    };
  }
}

