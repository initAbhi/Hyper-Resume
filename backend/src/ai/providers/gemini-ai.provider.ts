import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type {
  AiProvider,
  AdaptationProviderResult,
  BulletRewriteResult,
  ParsedProfileDraft,
  RequirementMatchOutput,
  SectionAdaptationProviderResult,
} from '../interfaces/ai-provider.interface.js';
import type { ParsedJobRequirement } from '../../jobs/entities/job-description.entity.js';
import type { ResumeContent } from '../../resumes/entities/resume.types.js';
import { calculateUsageCost, getModelPricing } from '../config/ai-model-pricing.js';
import type { RawAiAdaptationPayload } from '../utils/factual-integrity-validator.js';

@Injectable()
export class GeminiAiProvider implements AiProvider {
  public readonly name = 'gemini';
  private readonly logger = new Logger(GeminiAiProvider.name);
  private readonly apiKey?: string;
  private readonly model: string;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('AI_API_KEY') || this.configService.get<string>('GEMINI_API_KEY');
    const rawModel = this.configService.get<string>('AI_MODEL', 'gemini-3.1-flash-lite');
    this.model = (!rawModel || rawModel.includes('1.5') || rawModel.includes('2.0') || rawModel.includes('2.5'))
      ? 'gemini-3.1-flash-lite'
      : rawModel;

    // Safeguard 1: Verify model pricing exists on initialization
    getModelPricing(this.model);
  }

  async parseResumeText(text: string): Promise<ParsedProfileDraft> {
    const prompt = `You are an expert ATS resume parsing engine. Extract the candidate's complete profile into JSON.
CRITICAL INVARIANTS:
1. DO NOT invent or fabricate any details, employers, dates, metrics, or credentials. Only extract what is explicitly written in the resume text.
2. Extract the candidate's full name, email, phone number, location, and social profile links (LinkedIn, GitHub, portfolio) into the "contact" object.
3. Extract all work experience positions, bullet points, skills, education, and projects thoroughly without truncation.

Return JSON in this shape:
{
  "contact": {
    "fullName": string,
    "email": string,
    "phone": string,
    "location": string,
    "linkedinUrl": string,
    "githubUrl": string,
    "websiteUrl": string
  },
  "headline": string,
  "summary": string,
  "location": string,
  "skills": [{"name": string, "category": string}],
  "experience": [{"company": string, "title": string, "startDate": string, "endDate": string, "current": boolean, "bullets": [string]}],
  "education": [{"school": string, "degree": string, "field": string, "graduationDate": string}],
  "projects": [{"name": string, "description": string, "highlights": [string]}],
  "certifications": [{"name": string, "issuer": string}],
  "confidenceScore": number
}

Resume text:
${text}`;

    const { data } = await this.callGeminiWithUsage<ParsedProfileDraft>(prompt);
    return data;
  }

  async parseJobDescription(text: string): Promise<ParsedJobRequirement[]> {
    const prompt = `Extract all job requirements from this job description.
Return JSON array of requirements:
[
  {
    "id": "req-1",
    "text": "Exact or synthesized requirement",
    "type": "required_skill" | "preferred_skill" | "experience" | "education" | "responsibility" | "domain",
    "importance": "critical" | "high" | "medium" | "low",
    "keywords": ["keyword1", "keyword2"]
  }
]

Job Description:
${text}`;

    const { data } = await this.callGeminiWithUsage<ParsedJobRequirement[]>(prompt);
    return data;
  }

  async matchRequirements(
    resumeContent: ResumeContent,
    requirements: ParsedJobRequirement[],
  ): Promise<RequirementMatchOutput[]> {
    const prompt = `Analyze each requirement against the candidate's resume content.
CRITICAL INVARIANT: NEVER invent or hallucinate evidence. If the candidate never mentioned a skill, mark it as 'not_evidenced'. If mentioned in skills but no experience bullet demonstrates it, mark as 'needs_confirmation'. If documented in experience bullets, mark as 'supported'.

Requirements:
${JSON.stringify(requirements, null, 2)}

Candidate Content:
${JSON.stringify(resumeContent, null, 2)}

Return JSON array:
[
  {
    "requirementId": string,
    "status": "supported" | "needs_confirmation" | "not_evidenced" | "not_applicable",
    "confidence": number,
    "evidenceQuotes": [string],
    "explanation": string,
    "suggestedAction": string
  }
]`;

    const { data } = await this.callGeminiWithUsage<RequirementMatchOutput[]>(prompt);
    return data;
  }

  async rewriteBullet(
    bullet: string,
    targetRole?: string,
    metricHint?: string,
  ): Promise<BulletRewriteResult> {
    const prompt = `Rewrite this resume bullet point into a high-impact, ATS-optimized STAR or XYZ bullet.
CRITICAL INVARIANT: DO NOT invent metrics, percentages, dollar values, or technologies that are not provided in the original bullet or metric hint. If the bullet lacks a metric, keep it factual and request candidate verification.

Original bullet: "${bullet}"
Target role: "${targetRole || 'Software Engineer'}"
Candidate confirmed metric: "${metricHint || 'none'}"

Return JSON:
{
  "originalBullet": "${bullet}",
  "rewrittenBullet": string,
  "actionVerbUsed": string,
  "framework": "XYZ" | "STAR",
  "explanation": string,
  "factualVerificationNotes": string
}`;

    const { data } = await this.callGeminiWithUsage<BulletRewriteResult>(prompt);
    return data;
  }

  async adaptResume(
    sourceResume: ResumeContent,
    benchmarkSample: ResumeContent,
    targetRole?: string,
  ): Promise<AdaptationProviderResult> {
    const role = targetRole || benchmarkSample.headline || sourceResume.headline;

    const prompt = `You are an elite ATS resume adaptation engine.
Your task is to take a candidate's actual factual profile and adapt its phrasing, executive punchiness, structure, and tone to match the benchmark sample resume, tailored for the target role "${role}".

CRITICAL INVARIANTS AND FACTUAL INTEGRITY SAFEGUARDS:
1. STRICT FACTUAL PRESERVATION: Never invent, hallucinate, or fabricate employer names, job titles, start/end dates, locations, degrees, schools, or certifications.
2. ZERO SAMPLE CONTAMINATION: Never inject companies, products, client names, or proprietary systems from the benchmark sample into the candidate's work history. The candidate NEVER worked at the benchmark's companies.
3. NO FABRICATED METRICS: Do NOT invent numbers, percentages (e.g. 45%), dollar figures (e.g. $1M), or scale claims (e.g. "doubled", "millions of users") unless they explicitly appeared in the candidate's source text. If a bullet lacks metrics, use qualitative high-impact phrasing.
4. SKILLS VAULT ISOLATION: Return relevant skills suggested by the benchmark in "recommendedBenchmarkSkills" array. Do NOT modify the candidate's core skills directly.
5. BULLET MAPPING: Rewrite the candidate's experience bullets to employ strong action verbs (Architected, Spearheaded, Orchestrated) and clear cause-and-effect structure.

Candidate Source Profile:
${JSON.stringify({
  headline: sourceResume.headline,
  summary: sourceResume.summary,
  experience: (sourceResume.experience || []).map((e) => ({
    company: e.company,
    title: e.title,
    bullets: e.bullets,
  })),
  projects: (sourceResume.projects || []).map((p) => ({
    name: p.name,
    description: p.description,
    highlights: p.highlights,
  })),
}, null, 2)}

Benchmark Sample (Style & Structure Reference):
${JSON.stringify({
  headline: benchmarkSample.headline,
  summary: benchmarkSample.summary,
  skills: benchmarkSample.skills,
  experience: (benchmarkSample.experience || []).map((e) => ({
    title: e.title,
    bullets: e.bullets,
  })),
}, null, 2)}

Return JSON conforming strictly to this format:
{
  "headline": string,
  "summary": string,
  "experienceBullets": [
    {
      "company": string,
      "title": string,
      "bullets": [string]
    }
  ],
  "recommendedBenchmarkSkills": [string],
  "projects": [
    {
      "name": string,
      "description": string,
      "highlights": [string]
    }
  ]
}`;

    const { data, telemetry } = await this.callGeminiWithUsage<RawAiAdaptationPayload>(prompt);

    return {
      payload: data,
      telemetry,
    };
  }

  async adaptSection(
    sectionKey: string,
    sourceSectionData: any,
    benchmarkSectionData: any,
    targetRole?: string,
  ): Promise<SectionAdaptationProviderResult> {
    const prompt = `You are an elite ATS resume adaptation engine.
Adapt the specific section "${sectionKey}" from the candidate's resume to match the style, executive impact, and phrasing of the benchmark sample for role "${targetRole || 'Industry Specialist'}".

CRITICAL INVARIANTS:
1. Do not invent employers, dates, credentials, or unevidenced metrics.
2. Do not inject benchmark company or project names.

Candidate Section:
${JSON.stringify(sourceSectionData, null, 2)}

Benchmark Section Reference:
${JSON.stringify(benchmarkSectionData, null, 2)}

Return JSON:
{
  "adaptedContent": any
}`;

    const { data, telemetry } = await this.callGeminiWithUsage<{ adaptedContent: any }>(prompt);

    return {
      sectionKey,
      adaptedContent: data.adaptedContent,
      telemetry,
    };
  }

  private async callGeminiWithUsage<T>(prompt: string): Promise<{ data: T; telemetry: any }> {
    if (!this.apiKey) {
      throw new Error(
        'Gemini API key is not configured. Set AI_API_KEY in backend .env to enable real Gemini inference.',
      );
    }

    const fallbackCandidates = ['gemini-3.1-flash-lite', 'gemini-3.6-flash', 'gemini-3.5-flash-lite'];
    const modelsToTry = [this.model, ...fallbackCandidates].filter(
      (m, idx, arr) => m && arr.indexOf(m) === idx,
    );

    let lastError: Error | null = null;

    for (const modelToUse of modelsToTry) {
      for (let attempt = 1; attempt <= 2; attempt++) {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelToUse}:generateContent?key=${this.apiKey}`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 25000);

        try {
          const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: controller.signal,
            body: JSON.stringify({
              contents: [{ role: 'user', parts: [{ text: prompt }] }],
              generationConfig: {
                responseMimeType: 'application/json',
                temperature: 0.1,
              },
            }),
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            const errorText = await response.text();
            this.logger.warn(
              `Gemini API warning (model: ${modelToUse}, attempt ${attempt}): status ${response.status} - ${errorText.substring(0, 150)}`,
            );

            lastError = new Error(`AI Provider model ${modelToUse} failed with status ${response.status}`);

            // Transient retry on 503 (Overloaded) or 429 (Rate Limit) or 500
            if (response.status === 503 || response.status === 429 || response.status === 500) {
              await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
              continue;
            }

            // For 404 (deprecated) or other client errors, immediately fall back to next model
            break;
          }

          const data = await response.json();
          const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;

          if (!candidateText) {
            throw new Error('Malformed or empty response from AI Provider');
          }

          const parsedData = JSON.parse(candidateText) as T;

          // Usage Telemetry and dynamic cost accounting
          const usage = data.usageMetadata || {};
          const promptTokens = usage.promptTokenCount || 0;
          const completionTokens = usage.candidatesTokenCount || 0;
          const totalTokens = usage.totalTokenCount || (promptTokens + completionTokens);

          const costInfo = calculateUsageCost(modelToUse, promptTokens, completionTokens);

          const telemetry = {
            promptTokens,
            completionTokens,
            totalTokens,
            costUsd: costInfo.costUsd,
            modelId: costInfo.modelId,
            pricingVersion: costInfo.pricingVersion,
          };

          return { data: parsedData, telemetry };
        } catch (err: any) {
          clearTimeout(timeoutId);
          this.logger.warn(
            `Gemini API invocation exception (model: ${modelToUse}, attempt ${attempt}): ${err.message}`,
          );
          lastError = err;
          if (attempt < 2) {
            await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
          }
        }
      }
    }

    throw lastError || new Error('All AI models failed to generate content');
  }
}
