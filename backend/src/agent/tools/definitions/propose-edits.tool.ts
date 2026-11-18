import { Injectable, Logger, Optional } from '@nestjs/common';
import crypto from 'node:crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ResumesService } from '../../../resumes/resumes.service.js';
import { AiService } from '../../../ai/ai.service.js';
import { GeminiAiProvider } from '../../../ai/providers/gemini-ai.provider.js';
import { evaluateStructuredResumeAts } from '../../../ai/utils/ats-audit-engine.js';
import { validateAndSanitizeMetrics } from '../../../ai/utils/factual-integrity-validator.js';
import { AgentToolExecution } from '../../entities/agent-tool-execution.entity.js';
import { AgentMessage } from '../../entities/agent-message.entity.js';
import { applySectionDiffsToResumeContent } from './resume-diff-applier.js';
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

const VALID_TEMPLATE_KEYS = new Set([
  'clean-modern',
  'jake-classic',
  'awesome-cv',
  'double-column',
  'executive',
  'minimalist',
  'sidebar',
  'crest',
  'deedy-academic',
  'creative-accent',
]);

@Injectable()
export class ProposeEditsTool implements AgentTool<ProposeEditsArgs, unknown> {
  private readonly logger = new Logger(ProposeEditsTool.name);

  readonly name = 'propose_resume_edits';
  readonly description =
    'Holistically analyzes the full resume, live ATS audit findings, and recent conversation suggestions to propose targeted edits across ANY resume section (headline, summary, contact, experience bullets, projects, skills, education, certifications, custom sections, template, and layout) with verified before/after ATS scores and cryptographic approval hash. Does NOT commit changes directly until approved.';
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
        description: 'Target role title (e.g. Senior Full-Stack Engineer)',
      },
      targetJobDescription: {
        type: 'string',
        description: 'Target job description text',
      },
      focusSections: {
        type: 'array',
        items: { type: 'string' },
        description:
          "Specific sections to edit (e.g. ['headline', 'summary', 'experience', 'projects', 'skills', 'contact', 'education', 'certifications', 'customSections', 'templateKey', 'layout'])",
      },
      customInstruction: {
        type: 'string',
        description: 'Exact user instruction or changes requested',
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
    @Optional()
    @InjectRepository(AgentMessage)
    private readonly messageRepo?: Repository<AgentMessage>,
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

  private extractNumbers(text: string): string[] {
    const matches =
      text.match(/(?:\$|€|£|₹)?\d+(?:[.,]\d+)?(?:\s?(?:%|x|X|k|K|M|B|ms|s|\+))?/g) || [];
    return Array.from(new Set(matches.map((m) => m.trim())));
  }

  private buildAtsDiagnosticDigest(audit: ReturnType<typeof evaluateStructuredResumeAts>) {
    const findings: any = audit.findings || {};
    const overusedVerbs = Array.isArray(findings.actionVerbAnalysis?.overusedVerbs)
      ? findings.actionVerbAnalysis.overusedVerbs
      : [];
    const unbackedSkills = Array.isArray(findings.stackAlignment?.unbackedSkills)
      ? findings.stackAlignment.unbackedSkills
      : [];
    const weakBullets = Array.isArray(findings.bulletQuality)
      ? findings.bulletQuality
          .filter((b: any) => !b.xyzCompliant || b.isPassiveOpener || b.wordCount > 36 || b.wordCount < 7)
          .slice(0, 12)
          .map((b: any) => ({
            text: String(b.text || '').slice(0, 140),
            wordCount: b.wordCount,
            feedback: b.feedback,
            hasMetric: b.hasMetric,
            actionVerb: b.actionVerb,
          }))
      : [];
    const writingIssues = Array.isArray(audit.writingAudit?.issues)
      ? audit.writingAudit.issues.slice(0, 10).map((i: any) => ({
          category: i.category,
          original: i.originalText || i.matchedText,
          suggestion: i.suggestion || i.replacement,
          message: i.message,
        }))
      : [];

    return {
      atsScore: audit.atsScore,
      dimensions: Array.isArray(findings.dimensions)
        ? findings.dimensions.map((d: any) => ({
            name: d.name || d.key,
            score: d.score,
            status: d.status,
          }))
        : [],
      recommendations: Array.isArray(audit.recommendations) ? audit.recommendations : [],
      overusedVerbs,
      unbackedSkills,
      weakBullets,
      writingIssues,
      wordCount: findings.wordCount,
    };
  }

  private parseJsonResponse(raw: string): Record<string, any> | null {
    if (!raw || typeof raw !== 'string') return null;
    const cleaned = raw
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();
    try {
      return JSON.parse(cleaned);
    } catch {
      const start = cleaned.indexOf('{');
      const end = cleaned.lastIndexOf('}');
      if (start >= 0 && end > start) {
        try {
          return JSON.parse(cleaned.slice(start, end + 1));
        } catch {
          return null;
        }
      }
      return null;
    }
  }

  private buildValidatedSectionDiffs(
    resume: any,
    rawPlan: Record<string, any>,
  ): Record<string, any> {
    const content = resume.content || {};
    const sectionDiffs: Record<string, any> = {};

    // 1. Headline
    const origHeadline = content.headline || '';
    const propHeadline =
      typeof rawPlan.headline === 'string' && rawPlan.headline.trim()
        ? rawPlan.headline.trim()
        : origHeadline;
    sectionDiffs.headline = {
      original: origHeadline,
      proposed: propHeadline,
    };

    // 2. Summary
    const origSummary = content.summary || '';
    const propSummary =
      typeof rawPlan.summary === 'string' && rawPlan.summary.trim()
        ? rawPlan.summary.trim()
        : origSummary;
    sectionDiffs.summary = {
      original: origSummary,
      proposed: propSummary,
    };

    // 3. Contact (only include if actually changed)
    if (rawPlan.contact && typeof rawPlan.contact === 'object') {
      const allowedKeys = ['fullName', 'email', 'phone', 'location', 'linkedinUrl', 'githubUrl', 'websiteUrl'];
      const origContact = content.contact || {};
      const changedContact: Record<string, string> = {};
      for (const key of allowedKeys) {
        if (
          typeof rawPlan.contact[key] === 'string' &&
          rawPlan.contact[key].trim() !== String(origContact[key] || '').trim()
        ) {
          changedContact[key] = rawPlan.contact[key].trim();
        }
      }
      if (Object.keys(changedContact).length > 0) {
        sectionDiffs.contact = {
          original: origContact,
          proposed: { ...origContact, ...changedContact },
          changedFields: Object.keys(changedContact),
        };
      }
    }

    // 4. Experience (covers ALL roles & ALL bullets + optional addedBullets)
    const expList = Array.isArray(content.experience) ? content.experience : [];
    const proposedExpMap = new Map<number, any>();
    if (Array.isArray(rawPlan.experience)) {
      for (const item of rawPlan.experience) {
        if (item && typeof item.experienceIndex === 'number') {
          proposedExpMap.set(item.experienceIndex, item);
        }
      }
    }

    sectionDiffs.experience = expList.map((exp: any, expIdx: number) => {
      const bullets: string[] = Array.isArray(exp.bullets) ? exp.bullets : [];
      const aiExp = proposedExpMap.get(expIdx);
      const aiBulletMap = new Map<number, string>();
      if (aiExp && Array.isArray(aiExp.bulletEdits)) {
        for (const edit of aiExp.bulletEdits) {
          if (
            edit &&
            typeof edit.bulletIndex === 'number' &&
            typeof edit.proposed === 'string' &&
            edit.proposed.trim().length > 3
          ) {
            aiBulletMap.set(edit.bulletIndex, edit.proposed.trim());
          }
        }
      }

      const bulletDiffs = bullets.map((bullet: string, bulletIdx: number) => {
        const proposedText = aiBulletMap.get(bulletIdx) ?? bullet;
        const sanitizedCheck = validateAndSanitizeMetrics(
          bullet,
          proposedText,
          `Exp[${expIdx}].Bullet[${bulletIdx}]`,
        );
        const origNums = new Set(this.extractNumbers(bullet));
        const addedMetrics = this.extractNumbers(proposedText).filter((m) => !origNums.has(m));
        const needsConfirm =
          proposedText !== bullet && (addedMetrics.length > 0 || sanitizedCheck.metricFlag);

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
              ? `Confirm you achieved (${addedMetrics.join(', ') || 'listed metrics'}) in: "${proposedText}"`
              : undefined,
          },
        };
      });

      const addedBullets = Array.isArray(aiExp?.addedBullets)
        ? aiExp.addedBullets
            .filter((b: unknown) => typeof b === 'string' && b.trim().length > 8)
            .map((b: string) => b.trim())
            .slice(0, 3)
        : [];

      return {
        experienceIndex: expIdx,
        company: exp.company,
        title: exp.title,
        bulletDiffs,
        ...(addedBullets.length > 0 ? { addedBullets } : {}),
      };
    });

    // 5. Projects (descriptions & highlights across ALL projects)
    const projList = Array.isArray(content.projects) ? content.projects : [];
    if (Array.isArray(rawPlan.projects) && projList.length > 0) {
      const projDiffs: any[] = [];
      for (const item of rawPlan.projects) {
        if (!item || typeof item.projectIndex !== 'number') continue;
        const target = projList[item.projectIndex];
        if (!target) continue;
        const highlights: string[] = Array.isArray(target.highlights) ? target.highlights : [];
        const hDiffs: any[] = [];
        if (Array.isArray(item.highlightEdits)) {
          for (const hEdit of item.highlightEdits) {
            if (
              hEdit &&
              typeof hEdit.highlightIndex === 'number' &&
              hEdit.highlightIndex >= 0 &&
              hEdit.highlightIndex < highlights.length &&
              typeof hEdit.proposed === 'string' &&
              hEdit.proposed.trim() &&
              hEdit.proposed.trim() !== highlights[hEdit.highlightIndex].trim()
            ) {
              hDiffs.push({
                highlightIndex: hEdit.highlightIndex,
                original: highlights[hEdit.highlightIndex],
                proposed: hEdit.proposed.trim(),
              });
            }
          }
        }
        const descChanged =
          typeof item.description === 'string' &&
          item.description.trim() &&
          item.description.trim() !== (target.description || '').trim();
        const addedHighlights = Array.isArray(item.addedHighlights)
          ? item.addedHighlights
              .filter((h: unknown) => typeof h === 'string' && h.trim().length > 6)
              .map((h: string) => h.trim())
              .slice(0, 2)
          : [];

        if (descChanged || hDiffs.length > 0 || addedHighlights.length > 0) {
          projDiffs.push({
            projectIndex: item.projectIndex,
            name: target.name,
            ...(descChanged
              ? { description: { original: target.description || '', proposed: item.description.trim() } }
              : {}),
            ...(hDiffs.length > 0 ? { highlightDiffs: hDiffs } : {}),
            ...(addedHighlights.length > 0 ? { addedHighlights } : {}),
          });
        }
      }
      if (projDiffs.length > 0) {
        sectionDiffs.projects = projDiffs;
      }
    }

    // 6. Skills (supports additions, removals, and recategorizations)
    if (Array.isArray(rawPlan.skills)) {
      const origSkills: Array<{ name: string; category?: string }> = Array.isArray(content.skills)
        ? content.skills
        : [];
      const seenLower = new Set<string>();
      const cleanedProposed: Array<{ name: string; category?: string }> = [];
      for (const s of rawPlan.skills) {
        const name = typeof s === 'string' ? s.trim() : typeof s?.name === 'string' ? s.name.trim() : '';
        if (!name || seenLower.has(name.toLowerCase())) continue;
        seenLower.add(name.toLowerCase());
        cleanedProposed.push({
          name,
          category:
            typeof s?.category === 'string' && s.category.trim() ? s.category.trim() : 'Core Skills',
        });
      }

      if (cleanedProposed.length > 0) {
        const origLower = new Set(origSkills.map((s) => (s?.name || '').trim().toLowerCase()));
        const propLower = new Set(cleanedProposed.map((s) => s.name.toLowerCase()));
        const addedSkills = cleanedProposed
          .filter((s) => !origLower.has(s.name.toLowerCase()))
          .map((s) => s.name);
        const removedSkills = origSkills
          .filter((s) => s?.name && !propLower.has(s.name.trim().toLowerCase()))
          .map((s) => s.name);

        if (addedSkills.length > 0 || removedSkills.length > 0) {
          sectionDiffs.skills = {
            original: origSkills,
            proposed: cleanedProposed,
            addedSkills,
            removedSkills,
          };
        }
      }
    }

    // 7. Certifications / Education / CustomSections (when explicitly proposed)
    if (Array.isArray(rawPlan.certifications) && rawPlan.certifications.length > 0) {
      const origCerts = Array.isArray(content.certifications) ? content.certifications : [];
      if (JSON.stringify(rawPlan.certifications) !== JSON.stringify(origCerts)) {
        sectionDiffs.certifications = {
          original: origCerts,
          proposed: rawPlan.certifications,
        };
      }
    }
    if (Array.isArray(rawPlan.education) && rawPlan.education.length > 0) {
      const origEdu = Array.isArray(content.education) ? content.education : [];
      if (JSON.stringify(rawPlan.education) !== JSON.stringify(origEdu)) {
        sectionDiffs.education = {
          original: origEdu,
          proposed: rawPlan.education,
        };
      }
    }
    if (Array.isArray(rawPlan.customSections) && rawPlan.customSections.length > 0) {
      const origCustom = Array.isArray(content.customSections) ? content.customSections : [];
      if (JSON.stringify(rawPlan.customSections) !== JSON.stringify(origCustom)) {
        sectionDiffs.customSections = {
          original: origCustom,
          proposed: rawPlan.customSections,
        };
      }
    }

    // 8. Template Key & Layout Settings
    if (
      typeof rawPlan.templateKey === 'string' &&
      VALID_TEMPLATE_KEYS.has(rawPlan.templateKey.trim()) &&
      rawPlan.templateKey.trim() !== resume.templateKey
    ) {
      sectionDiffs.templateKey = {
        original: resume.templateKey || 'clean-modern',
        proposed: rawPlan.templateKey.trim(),
      };
    }

    if (rawPlan.layout && typeof rawPlan.layout === 'object') {
      const allowedLayout = [
        'accentColor',
        'fontFamily',
        'pageMode',
        'fontSizeScale',
        'lineHeight',
        'sectionSpacing',
        'pageMargin',
      ];
      const origLayout = content.layout || {};
      const nextLayout: Record<string, any> = {};
      for (const k of allowedLayout) {
        if (rawPlan.layout[k] !== undefined && rawPlan.layout[k] !== origLayout[k]) {
          nextLayout[k] = rawPlan.layout[k];
        }
      }
      if (Object.keys(nextLayout).length > 0) {
        sectionDiffs.layout = {
          original: origLayout,
          proposed: { ...origLayout, ...nextLayout },
          changedFields: Object.keys(nextLayout),
        };
      }
    }

    return sectionDiffs;
  }

  private async runHolisticGeminiProposal(
    resume: any,
    role: string,
    args: ProposeEditsArgs,
    preAuditDigest: ReturnType<ProposeEditsTool['buildAtsDiagnosticDigest']>,
    recentChatContext: string,
    refinementFeedback?: string,
  ): Promise<Record<string, any> | null> {
    if (!this.geminiProvider) return null;

    const systemInstruction = `You are HyperResume's Principal Resume Editor AI. You have FULL control over the candidate's entire resume and must produce a single, surgical, high-impact JSON edit plan.

STRICT RULES (CRITICAL — NEVER VIOLATE):
1. ZERO VERB SPAM: Never start more than 2 bullets across the ENTIRE resume with the same opening verb. Actively replace any overused verbs listed in the ATS audit (e.g., if "engineered" is overused, diversify across: Architected, Spearheaded, Built, Launched, Automated, Streamlined, Accelerated, Scaled, Designed, Delivered, Orchestrated, Led, Migrated, Reduced, Optimized, Implemented, Refactored).
2. SMART SKILLS MANAGEMENT (DO NOT SPAM UNBACKED SKILLS):
   - NEVER add random skills the user didn't ask for — unbacked skills HURT ATS score!
   - If the ATS audit reports "unbackedSkills", either (a) naturally weave the candidate's genuine listed skills into relevant existing experience/project bullets where truthful, OR (b) remove redundant/unbacked fluff skills from the skills array.
   - Only add new skills if the user explicitly requested adding skills OR if a skill is clearly proven in their experience/projects/target JD.
3. BULLET QUALITY & LENGTH: Keep every bullet crisp (12–32 words — NEVER over 36 words!), start with a strong unique action verb, fix all grammar/spelling/buzzword issues, and preserve all existing verified metrics verbatim.
4. FACTUAL INTEGRITY: Never fabricate companies, degrees, or fake metrics. Keep every existing metric intact. Do NOT invent random fake percentages when none existed unless directly implied or requested; prefer strong concrete scope/architecture/outcome phrasing.
5. FOLLOW PREVIOUS SUGGESTIONS: If the user says "yes fix with the suggestion", "implement your suggestions", "apply all", or similar, read the Recent Chat Context and implement EVERY SINGLE point you previously recommended.
6. FULL SECTION CONTROL: You may edit ANY section the user asked for or that improves ATS: headline, summary, contact, experience (ALL roles & ALL bullets), projects (descriptions & highlights), skills (add/remove/clean), education, certifications, customSections, templateKey, and layout.
   - Valid templateKey values: clean-modern, jake-classic, awesome-cv, double-column, executive, minimalist, sidebar, crest, deedy-academic, creative-accent.
   - Only include contact / education / certifications / customSections / templateKey / layout if the user asked to change them or there is an explicit fix needed.

OUTPUT FORMAT: Return ONLY valid JSON (no markdown fences, no commentary):
{
  "changeSummary": "Short 1-sentence summary of what was improved",
  "headline": "optional updated headline string",
  "summary": "optional updated summary string",
  "contact": { "location": "..." },
  "experience": [
    {
      "experienceIndex": 0,
      "bulletEdits": [
        { "bulletIndex": 0, "proposed": "improved bullet text" }
      ],
      "addedBullets": ["optional new bullet if requested"]
    }
  ],
  "projects": [
    {
      "projectIndex": 0,
      "description": "optional improved project description",
      "highlightEdits": [
        { "highlightIndex": 0, "proposed": "improved highlight" }
      ],
      "addedHighlights": []
    }
  ],
  "skills": [{ "name": "React", "category": "Frontend" }],
  "templateKey": "optional templateKey",
  "layout": { "pageMode": "single", "accentColor": "#1d4ed8" }
}
Omit any top-level key you do NOT want to modify.`;

    const promptBody = [
      `Target Role: ${role}`,
      `User Instruction: ${args.customInstruction || 'Optimize resume for maximum ATS score and recruiter clarity.'}`,
      args.focusSections?.length ? `Requested Focus Sections: ${args.focusSections.join(', ')}` : '',
      args.targetJobDescription
        ? `Target Job Description:\n${args.targetJobDescription.slice(0, 2000)}`
        : '',
      recentChatContext ? `Recent Chat Context (implement previous suggestions if user confirmed):\n${recentChatContext}` : '',
      `Live Deterministic ATS Audit (Current Score: ${preAuditDigest.atsScore}/100):\n${JSON.stringify(preAuditDigest)}`,
      refinementFeedback ? `REFINEMENT PASS — Previous draft still had these remaining ATS issues. Fix ALL of them now:\n${refinementFeedback}` : '',
      `COMPLETE Current Resume (templateKey: "${resume.templateKey || 'clean-modern'}"):\n${JSON.stringify(resume.content)}`,
    ]
      .filter(Boolean)
      .join('\n\n');

    const resp = await this.geminiProvider.callGeminiWithFunctions(
      [{ role: 'user', parts: [{ text: promptBody }] }],
      undefined,
      { systemInstruction, temperature: 0.2 },
    );

    return this.parseJsonResponse(resp.text || '');
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

      // 1. Instant deterministic ATS Pre-Audit
      const preAudit = evaluateStructuredResumeAts(
        resume.content,
        undefined,
        resume.content?.headline,
        args.targetJobDescription,
      );
      const preAuditDigest = this.buildAtsDiagnosticDigest(preAudit);
      const beforeAtsScore = preAudit.atsScore;

      // 2. Load recent conversation messages so "yes fix with the suggestion" works seamlessly
      let recentChatContext = '';
      if (this.messageRepo && context.conversationId) {
        try {
          const recentMsgs = await this.messageRepo.find({
            where: { conversationId: context.conversationId },
            order: { createdAt: 'DESC' },
            take: 5,
          });
          recentChatContext = recentMsgs
            .reverse()
            .map((m) => `${m.role.toUpperCase()}: ${m.content.slice(0, 900)}`)
            .join('\n---\n');
        } catch {
          // Non-fatal
        }
      }

      let sectionDiffs: Record<string, any> | null = null;
      let changeSummary = `AI Optimization for ${role}`;
      let projectedAtsScore = beforeAtsScore;
      let remainingRecommendations: string[] = [];

      // 3. Primary Path: Holistic Whole-Resume Gemini Editor + Live ATS Verification
      const useHolisticGemini =
        Boolean(this.geminiProvider) && process.env.NODE_ENV !== 'test' && !process.env.VITEST;

      if (useHolisticGemini) {
        const startedAt = Date.now();
        try {
          const rawPlan = await this.runHolisticGeminiProposal(
            resume,
            role,
            args,
            preAuditDigest,
            recentChatContext,
          );
          if (rawPlan) {
            sectionDiffs = this.buildValidatedSectionDiffs(resume, rawPlan);
            if (typeof rawPlan.changeSummary === 'string' && rawPlan.changeSummary.trim()) {
              changeSummary = rawPlan.changeSummary.trim();
            }

            // Simulate applying edits & verify REAL ATS score improvement!
            const sim1 = applySectionDiffsToResumeContent(resume.content, sectionDiffs, {
              currentTemplateKey: resume.templateKey,
            });
            const postAudit1 = evaluateStructuredResumeAts(
              sim1.content,
              undefined,
              sim1.content.headline,
              args.targetJobDescription,
            );
            projectedAtsScore = postAudit1.atsScore;
            remainingRecommendations = postAudit1.recommendations || [];

            // Auto-Refinement Pass: if user wants high ATS and score < 94 AND we have time budget (< 12s elapsed)
            const wantsHighAts =
              /\b(ats|95|90|100|score|fix|suggest|optimiz|improv|weak)\b/i.test(
                args.customInstruction || '',
              );
            if (
              wantsHighAts &&
              projectedAtsScore < 94 &&
              remainingRecommendations.length > 0 &&
              Date.now() - startedAt < 12000
            ) {
              const postDigest1 = this.buildAtsDiagnosticDigest(postAudit1);
              const refineFeedback = JSON.stringify({
                scoreAfterPass1: projectedAtsScore,
                remainingRecommendations: postDigest1.recommendations,
                remainingOverusedVerbs: postDigest1.overusedVerbs,
                remainingUnbackedSkills: postDigest1.unbackedSkills,
                remainingWritingIssues: postDigest1.writingIssues,
              });
              const refinedPlan = await this.runHolisticGeminiProposal(
                { ...resume, content: sim1.content, templateKey: sim1.templateKey },
                role,
                args,
                postDigest1,
                recentChatContext,
                refineFeedback,
              );
              if (refinedPlan) {
                const mergedDiffs = this.buildValidatedSectionDiffs(resume, {
                  ...rawPlan,
                  ...refinedPlan,
                  headline: refinedPlan.headline ?? rawPlan.headline,
                  summary: refinedPlan.summary ?? rawPlan.summary,
                  skills: refinedPlan.skills ?? rawPlan.skills,
                });
                const sim2 = applySectionDiffsToResumeContent(resume.content, mergedDiffs, {
                  currentTemplateKey: resume.templateKey,
                });
                const postAudit2 = evaluateStructuredResumeAts(
                  sim2.content,
                  undefined,
                  sim2.content.headline,
                  args.targetJobDescription,
                );
                if (postAudit2.atsScore >= projectedAtsScore) {
                  sectionDiffs = mergedDiffs;
                  projectedAtsScore = postAudit2.atsScore;
                  remainingRecommendations = postAudit2.recommendations || [];
                }
              }
            }
          }
        } catch (err: any) {
          this.logger.warn(
            `Holistic Gemini proposal failed (${err?.message}); falling back to AiService.`,
          );
        }
      }

      // 4. Deterministic / Unit-Test Fallback Path (when Gemini unavailable or in Vitest)
      if (!sectionDiffs) {
        const focusSet = new Set(
          (args.focusSections && args.focusSections.length > 0
            ? args.focusSections
            : ['headline', 'summary', 'experience']
          ).map((s) => s.toLowerCase()),
        );
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
            // Keep original
          }
        }

        const experienceList = resume.content?.experience || [];
        const experienceDiffs = await Promise.all(
          experienceList.map(async (exp, expIdx) => {
            const bullets = exp.bullets || [];
            const bulletDiffs = await Promise.all(
              bullets.map(async (bullet, bulletIdx) => {
                let proposedText = bullet;
                if (
                  focusSet.has('experience') &&
                  expIdx < 2 &&
                  bulletIdx < 3 &&
                  bullet.trim().length > 10 &&
                  typeof this.aiService?.rewriteBullet === 'function'
                ) {
                  try {
                    const rewritten = await this.aiService.rewriteBullet(
                      bullet,
                      role,
                      args.customInstruction || undefined,
                    );
                    if (rewritten?.rewrittenBullet && rewritten.rewrittenBullet.trim().length > 5) {
                      proposedText = rewritten.rewrittenBullet.trim();
                    }
                  } catch {
                    // Keep original
                  }
                }
                const sanitizedCheck = validateAndSanitizeMetrics(
                  bullet,
                  proposedText,
                  `Exp[${expIdx}].Bullet[${bulletIdx}]`,
                );
                const origNums = new Set(this.extractNumbers(bullet));
                const addedMetrics = this.extractNumbers(proposedText).filter((m) => !origNums.has(m));
                const needsConfirm =
                  proposedText !== bullet && (addedMetrics.length > 0 || sanitizedCheck.metricFlag);

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
                      ? `Confirm you achieved (${addedMetrics.join(', ') || 'listed metrics'}) in: "${proposedText}"`
                      : undefined,
                  },
                };
              }),
            );
            return {
              experienceIndex: expIdx,
              company: exp.company,
              title: exp.title,
              bulletDiffs,
            };
          }),
        );

        sectionDiffs = {
          headline: { original: originalHeadline, proposed: proposedHeadline },
          summary: { original: originalSummary, proposed: proposedSummary },
          experience: experienceDiffs,
        };

        const simFallback = applySectionDiffsToResumeContent(resume.content, sectionDiffs, {
          currentTemplateKey: resume.templateKey,
        });
        projectedAtsScore = evaluateStructuredResumeAts(
          simFallback.content,
          undefined,
          simFallback.content.headline,
          args.targetJobDescription,
        ).atsScore;
      }

      const proposalId = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
      const expectedResumeVersion = resume.version;

      const diffPayload = {
        proposalId,
        resumeId: targetResumeId,
        expectedResumeVersion,
        sectionDiffs,
      };

      const proposalHash = computeProposalHash(diffPayload);

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
            changeSummary,
            beforeAtsScore,
            projectedAtsScore,
            remainingRecommendations: remainingRecommendations.slice(0, 4),
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
          sectionDiffs,
          changeSummary,
          beforeAtsScore,
          projectedAtsScore,
          remainingRecommendations: remainingRecommendations.slice(0, 4),
          expiresAt: expiresAt.toISOString(),
        },
        metadata: {
          proposalId,
          expectedResumeVersion,
          beforeAtsScore,
          projectedAtsScore,
        },
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Failed to formulate resume edit proposal',
      };
    }
  }
}
