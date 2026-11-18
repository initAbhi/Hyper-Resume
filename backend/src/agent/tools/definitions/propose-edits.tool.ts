import { Injectable, Optional } from '@nestjs/common';
import crypto from 'node:crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ResumesService } from '../../../resumes/resumes.service.js';
import { AiService } from '../../../ai/ai.service.js';
import { GeminiAiProvider } from '../../../ai/providers/gemini-ai.provider.js';
import { validateAndSanitizeMetrics } from '../../../ai/utils/factual-integrity-validator.js';
import { AgentToolExecution } from '../../entities/agent-tool-execution.entity.js';
import {
  AgentTool,
  checkNoForbiddenUserId,
  ToolExecutionContext,
  ToolPermissionTier,
  ToolResult,
  ToolValidationResult,
  UUID_REGEX,
} from '../tool.interface.js';

export interface ProposeEditsArgs {
  resumeId?: string;
  targetRole?: string;
  targetJobDescription?: string;
  focusSections?: string[];
  customInstruction?: string;
}

export function canonicalJsonStringify(obj: unknown): string {
  if (obj === null || typeof obj !== 'object') {
    return JSON.stringify(obj);
  }
  if (Array.isArray(obj)) {
    return '[' + obj.map(canonicalJsonStringify).join(',') + ']';
  }
  const keys = Object.keys(obj as Record<string, unknown>).sort();
  const entries = keys.map(
    (k) => JSON.stringify(k) + ':' + canonicalJsonStringify((obj as Record<string, unknown>)[k]),
  );
  return '{' + entries.join(',') + '}';
}

export function computeProposalHash(payload: unknown): string {
  const canonical = canonicalJsonStringify(payload);
  return crypto.createHash('sha256').update(canonical).digest('hex');
}

@Injectable()
export class ProposeEditsTool implements AgentTool<ProposeEditsArgs, unknown> {
  readonly name = 'propose_resume_edits';
  readonly description =
    'Formulates a targeted set of proposed resume improvements with evidence provenance, metric verification, and cryptographic hash. Does NOT commit changes directly to the resume.';
  readonly permissionTier = ToolPermissionTier.AI_ANALYSIS;
  readonly requiresApproval = false;
  readonly creditCost = 2;
  readonly timeoutMs = 25000;

  readonly inputSchema = {
    type: 'object',
    properties: {
      resumeId: {
        type: 'string',
        description: 'UUID of the target resume. If omitted, active resume is used.',
      },
      targetRole: {
        type: 'string',
        description: 'Target role title (e.g. Principal Distributed Systems Engineer)',
      },
      targetJobDescription: {
        type: 'string',
        description: 'Target job description text',
      },
      focusSections: {
        type: 'array',
        items: { type: 'string' },
        description: "Specific sections to optimize (e.g. ['experience', 'headline', 'skills'])",
      },
      customInstruction: {
        type: 'string',
        description: 'Candidate preferences or custom instructions',
      },
    },
    required: [],
  };

  constructor(
    private readonly resumesService: ResumesService,
    private readonly aiService: AiService,
    @Optional()
    @InjectRepository(AgentToolExecution)
    private readonly toolExecutionRepo?: Repository<AgentToolExecution>,
    @Optional()
    private readonly geminiProvider?: GeminiAiProvider,
  ) {}

  validate(args: unknown): ToolValidationResult<ProposeEditsArgs> {
    const forbidden = checkNoForbiddenUserId(args);
    if (forbidden) return { valid: false, errors: [forbidden] };

    if (!args || typeof args !== 'object') {
      return { valid: true, data: {} };
    }

    const raw = args as Record<string, unknown>;
    const errors: string[] = [];

    if (raw.resumeId !== undefined) {
      if (typeof raw.resumeId !== 'string' || !UUID_REGEX.test(raw.resumeId)) {
        errors.push('resumeId must be a valid UUIDv4 string');
      }
    }

    if (errors.length > 0) return { valid: false, errors };

    return {
      valid: true,
      data: {
        resumeId: raw.resumeId as string | undefined,
        targetRole: typeof raw.targetRole === 'string' ? raw.targetRole.trim() : undefined,
        targetJobDescription:
          typeof raw.targetJobDescription === 'string' ? raw.targetJobDescription.trim() : undefined,
        focusSections: Array.isArray(raw.focusSections) ? raw.focusSections.map(String) : undefined,
        customInstruction:
          typeof raw.customInstruction === 'string' ? raw.customInstruction.trim() : undefined,
      },
    };
  }

  async execute(
    context: ToolExecutionContext,
    args: ProposeEditsArgs,
  ): Promise<ToolResult<unknown>> {
    const targetResumeId = args.resumeId || context.activeResumeId;
    if (!targetResumeId) {
      return {
        success: false,
        error: 'No target resume specified and no active resume in conversation context.',
      };
    }

    try {
      const resume = await this.resumesService.getResume(context.userId, targetResumeId);
      const role = args.targetRole || resume.content?.headline || 'Software Engineer';
      const customLower = (args.customInstruction || '').toLowerCase();
      const wantsSkillsUpdate =
        (args.focusSections || []).some((s) => s.toLowerCase() === 'skills') ||
        /\b(skill|skills|stack|tech|technologies|ats|95|score|keywords?)\b/i.test(customLower) ||
        (resume.content?.skills || []).length < 10;

      const defaultSections = ['headline', 'summary', 'experience'];
      if (wantsSkillsUpdate) defaultSections.push('skills');
      const focusSet = new Set(
        (args.focusSections && args.focusSections.length > 0
          ? [...args.focusSections, ...(wantsSkillsUpdate ? ['skills'] : [])]
          : defaultSections
        ).map((s) => s.toLowerCase()),
      );
      const metricHint = [args.customInstruction, args.targetJobDescription?.slice(0, 400)]
        .filter(Boolean)
        .join(' | ');

      const extractNumbers = (text: string): string[] => {
        const matches = text.match(/(?:\$|€|£)?\d+(?:[.,]\d+)?(?:\s?(?:%|x|X|k|K|M|B|\+))?/g) || [];
        return Array.from(new Set(matches.map((m) => m.trim())));
      };

      // 1. Generate improved headline & summary via AiService when available
      const originalHeadline = resume.content?.headline || '';
      const originalSummary = resume.content?.summary || '';
      let proposedHeadline = args.targetRole ? `${args.targetRole}` : originalHeadline;
      let proposedSummary = originalSummary;

      if (
        (focusSet.has('summary') || focusSet.has('headline')) &&
        typeof this.aiService?.generateSummaryAndHeadlines === 'function'
      ) {
        try {
          const sumRes = await this.aiService.generateSummaryAndHeadlines({
            currentHeadline: originalHeadline,
            currentSummary: originalSummary,
            targetRole: role,
            skills: (resume.content?.skills || []).map((s) => s.name).slice(0, 15),
            experience: (resume.content?.experience || []).slice(0, 3).map((e) => ({
              title: e.title,
              company: e.company,
              bullets: (e.bullets || []).slice(0, 3),
            })),
          });
          if (focusSet.has('headline') && sumRes?.headlineSuggestions?.[0]?.headline) {
            proposedHeadline = sumRes.headlineSuggestions[0].headline.trim();
          }
          if (focusSet.has('summary') && sumRes?.summaryOptions?.[0]?.summary) {
            proposedSummary = sumRes.summaryOptions[0].summary.trim();
          }
        } catch {
          // Graceful deterministic fallback below
          if (focusSet.has('summary') && originalSummary && args.targetRole && !originalSummary.toLowerCase().includes(args.targetRole.toLowerCase())) {
            proposedSummary = `${originalSummary.replace(/\.$/, '')}, aligned for ${args.targetRole} impact.`;
          }
        }
      }

      // 2. Rewrite top experience bullets via AiService (bounded to first 2 roles, up to 3 bullets each for latency)
      const experienceList = resume.content?.experience || [];
      const experienceDiffs = await Promise.all(
        experienceList.map(async (exp, expIdx) => {
          const bullets = exp.bullets || [];
          const shouldRewriteExp = focusSet.has('experience') && expIdx < 2;

          const bulletDiffs = await Promise.all(
            bullets.map(async (bullet, bulletIdx) => {
              let proposedText = bullet;
              if (
                shouldRewriteExp &&
                bulletIdx < 3 &&
                bullet.trim().length > 10 &&
                typeof this.aiService?.rewriteBullet === 'function'
              ) {
                try {
                  const rewritten = await this.aiService.rewriteBullet(
                    bullet,
                    role,
                    metricHint || undefined,
                  );
                  if (rewritten?.rewrittenBullet && rewritten.rewrittenBullet.trim().length > 5) {
                    proposedText = rewritten.rewrittenBullet.trim();
                  }
                } catch {
                  // Keep original bullet on per-bullet AI error
                }
              }

              const sanitizedCheck = validateAndSanitizeMetrics(
                bullet,
                proposedText,
                `Exp[${expIdx}].Bullet[${bulletIdx}]`,
              );
              const origNums = new Set(extractNumbers(bullet));
              const addedMetrics = extractNumbers(proposedText).filter((m) => !origNums.has(m));
              const needsConfirm = addedMetrics.length > 0 || sanitizedCheck.metricFlag;

              return {
                bulletIndex: bulletIdx,
                original: bullet,
                proposed: proposedText,
                evidenceProvenance: {
                  sourceBulletIndex: bulletIdx,
                  originalEvidenceQuote: bullet,
                  addedMetrics,
                  candidateConfirmationRequired: needsConfirm,
                  confirmationPrompt: needsConfirm
                    ? `Please confirm whether you achieved the metrics (${addedMetrics.join(', ') || 'listed metrics'}) in: "${proposedText}"`
                    : undefined,
                },
              };
            }),
          );

          return {
            company: exp.company,
            title: exp.title,
            bulletDiffs,
          };
        }),
      );

      const sectionDiffs: Record<string, any> = {
        headline: {
          original: originalHeadline,
          proposed: proposedHeadline,
        },
        summary: {
          original: originalSummary,
          proposed: proposedSummary,
        },
        experience: experienceDiffs,
      };

      // 3. Propose high-signal ATS skills grounded in the resume's experience, projects & target role
      if (focusSet.has('skills')) {
        const existingSkills = Array.isArray(resume.content?.skills) ? resume.content.skills : [];
        const existingNamesLower = new Set(
          existingSkills.map((s) => (s?.name || '').trim().toLowerCase()).filter(Boolean),
        );
        let suggestedSkills: Array<{ name: string; category?: string }> = [];

        if (this.geminiProvider && process.env.NODE_ENV !== 'test' && !process.env.VITEST) {
          try {
            const resumeCorpus = JSON.stringify({
              headline: originalHeadline,
              summary: originalSummary,
              existingSkills: existingSkills.map((s) => s.name),
              experience: (resume.content?.experience || []).slice(0, 4).map((e) => ({
                title: e.title,
                company: e.company,
                bullets: (e.bullets || []).slice(0, 4),
              })),
              projects: (resume.content?.projects || []).slice(0, 3).map((p) => ({
                name: p.name,
                description: p.description,
                highlights: (p.highlights || []).slice(0, 3),
              })),
            });
            const skillResp = await this.geminiProvider.callGeminiWithFunctions(
              [
                {
                  role: 'user',
                  parts: [
                    {
                      text: `Target Role: ${role}\nUser Request: ${args.customInstruction || 'Add relevant ATS skills'}\nJob Description: ${(args.targetJobDescription || 'None').slice(0, 1200)}\nCandidate Resume Data: ${resumeCorpus}\n\nReturn ONLY a raw JSON array of 5 to 8 concrete, ATS-relevant technical or domain skills to ADD that are NOT already in existingSkills. Prefer technologies already implied by their experience/projects/role. Format: [{"name":"Skill Name","category":"Category"}]`,
                    },
                  ],
                },
              ],
              undefined,
              {
                systemInstruction:
                  'You extract and recommend concise, industry-standard ATS resume skills. Output ONLY valid JSON array, no markdown fences.',
                temperature: 0.2,
              },
            );
            const rawJson = (skillResp.text || '')
              .replace(/^```(?:json)?\s*/i, '')
              .replace(/\s*```$/i, '')
              .trim();
            const parsed = JSON.parse(rawJson);
            if (Array.isArray(parsed)) {
              suggestedSkills = parsed
                .filter(
                  (item) =>
                    item &&
                    typeof item.name === 'string' &&
                    item.name.trim().length > 1 &&
                    !existingNamesLower.has(item.name.trim().toLowerCase()),
                )
                .slice(0, 8)
                .map((item) => ({
                  name: item.name.trim(),
                  category: typeof item.category === 'string' && item.category.trim() ? item.category.trim() : 'Core Skills',
                }));
            }
          } catch {
            // Fall through to deterministic extraction below
          }
        }

        // Deterministic extraction from candidate's own projects/bullets if Gemini didn't return any
        if (suggestedSkills.length === 0) {
          const corpusText = [
            originalHeadline,
            originalSummary,
            ...(resume.content?.experience || []).flatMap((e) => [e.title, ...(e.bullets || [])]),
            ...(resume.content?.projects || []).flatMap((p) => [
              p.name,
              p.description || '',
              ...(p.highlights || []),
            ]),
            args.targetJobDescription || '',
          ]
            .join(' ')
            .toLowerCase();

          const catalog: Array<{ name: string; category: string; match: RegExp }> = [
            { name: 'System Design', category: 'Architecture', match: /architect|scale|distributed|microservice|system/i },
            { name: 'REST APIs', category: 'Backend', match: /api|rest|endpoint|backend|express|nest/i },
            { name: 'CI/CD', category: 'DevOps', match: /deploy|pipeline|github|docker|ci\/cd|devops/i },
            { name: 'Performance Optimization', category: 'Engineering', match: /latency|optimi|performance|cache|speed/i },
            { name: 'SQL & Relational Databases', category: 'Databases', match: /sql|postgres|mysql|database|query/i },
            { name: 'Automated Testing', category: 'Quality', match: /test|qa|jest|vitest|playwright|cypress/i },
            { name: 'Cloud Infrastructure', category: 'Cloud', match: /aws|gcp|azure|cloud|kubernetes|docker/i },
            { name: 'Agile & Cross-Functional Delivery', category: 'Delivery', match: /agile|scrum|sprint|team|lead|collaborat/i },
          ];

          for (const candidate of catalog) {
            if (
              !existingNamesLower.has(candidate.name.toLowerCase()) &&
              (candidate.match.test(corpusText) || suggestedSkills.length < 4)
            ) {
              suggestedSkills.push({ name: candidate.name, category: candidate.category });
              if (suggestedSkills.length >= 5) break;
            }
          }
        }

        if (suggestedSkills.length > 0) {
          sectionDiffs.skills = {
            original: existingSkills,
            proposed: [...existingSkills, ...suggestedSkills],
            addedSkills: suggestedSkills.map((s) => s.name),
          };
        }
      }

      const proposalId = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15-minute expiry
      const expectedResumeVersion = resume.version;

      const diffPayload = {
        proposalId,
        resumeId: targetResumeId,
        expectedResumeVersion,
        sectionDiffs,
      };

      const proposalHash = computeProposalHash(diffPayload);

      // Persist staged proposal if tool execution repository and taskId are available
      if (this.toolExecutionRepo && context.taskId) {
        const execution = this.toolExecutionRepo.create({
          id: proposalId,
          taskId: context.taskId,
          userId: context.userId,
          toolName: this.name,
          status: 'PENDING_APPROVAL',
          proposalHash,
          expectedResumeVersion,
          resumeId: targetResumeId,
          isConsumed: false,
          expiresAt,
          outputPayload: {
            proposalId,
            proposalHash,
            expectedResumeVersion,
            sectionDiffs,
            changeSummary: `AI Optimization for ${role}`,
          },
        });
        await this.toolExecutionRepo.save(execution);
      }

      return {
        success: true,
        data: {
          proposalId,
          proposalHash,
          resumeId: targetResumeId,
          expectedResumeVersion,
          expiresAt: expiresAt.toISOString(),
          sectionDiffs,
        },
        metadata: {
          targetRole: role,
          resumeVersion: expectedResumeVersion,
        },
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Failed to propose resume edits',
      };
    }
  }
}

