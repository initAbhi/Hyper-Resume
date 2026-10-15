import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type {
  AiProvider,
  BulletRewriteResult,
  ParsedProfileDraft,
  RequirementMatchOutput,
} from '../interfaces/ai-provider.interface.js';
import type { ParsedJobRequirement } from '../../jobs/entities/job-description.entity.js';
import type { ResumeContent } from '../../resumes/entities/resume.types.js';

@Injectable()
export class GeminiAiProvider implements AiProvider {
  public readonly name = 'gemini';
  private readonly logger = new Logger(GeminiAiProvider.name);
  private readonly apiKey?: string;
  private readonly model: string;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('AI_API_KEY');
    this.model = this.configService.get<string>('AI_MODEL', 'gemini-1.5-flash');
  }

  async parseResumeText(text: string): Promise<ParsedProfileDraft> {
    const prompt = `You are a resume parsing engine. Extract the candidate's profile into JSON.
CRITICAL INVARIANT: DO NOT invent or fabricate any details, employers, dates, metrics, or credentials. Only extract what is explicitly written in the resume text.

Return JSON in this shape:
{
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

    return this.callGeminiJson<ParsedProfileDraft>(prompt);
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

    return this.callGeminiJson<ParsedJobRequirement[]>(prompt);
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

    return this.callGeminiJson<RequirementMatchOutput[]>(prompt);
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

    return this.callGeminiJson<BulletRewriteResult>(prompt);
  }

  private async callGeminiJson<T>(prompt: string): Promise<T> {
    if (!this.apiKey) {
      throw new Error(
        'Gemini API key is not configured. Set AI_API_KEY in backend .env to enable real Gemini inference.',
      );
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.1, // Low temperature for deterministic, factual extraction
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      this.logger.error(`Gemini API error: ${response.status} - ${errorText}`);
      throw new Error(`AI Provider request failed with status ${response.status}`);
    }

    const data = await response.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!candidateText) {
      throw new Error('Malformed or empty response from AI Provider');
    }

    return JSON.parse(candidateText) as T;
  }
}
