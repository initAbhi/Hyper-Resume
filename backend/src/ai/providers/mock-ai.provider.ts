import { Injectable } from '@nestjs/common';
import type {
  AiProvider,
  AdaptationProviderResult,
  BulletGenerateRequest,
  BulletGenerateResult,
  BulletRewriteResult,
  BulletVariantOption,
  JobTailorSuggestions,
  SummaryGenerateRequest,
  SummaryGenerateResult,
  CoverLetterGenerateRequest,
  CoverLetterGenerateResult,
  LinkedInOptimizeRequest,
  LinkedInOptimizeResult,
  SectionRewriteRequest,
  SectionRewriteResult,
  WritingCheckRequest,
  WritingCheckResult,
  ParsedProfileDraft,
  RequirementMatchOutput,
  SectionAdaptationProviderResult,
} from '../interfaces/ai-provider.interface.js';
import type { ParsedJobRequirement } from '../../jobs/entities/job-description.entity.js';
import type { ResumeContent } from '../../resumes/entities/resume.types.js';
import { calculateUsageCost } from '../config/ai-model-pricing.js';
import { runDeterministicWritingCheck } from '../utils/writing-quality-rules.js';
import {
  detectLinkedInProfilePdf,
  parseGenericResumeText,
  parseLinkedInProfileText,
} from '../../resume-parsing/linkedin-pdf-parser.util.js';
import { buildDeterministicLinkedInOptimization } from '../utils/linkedin-optimizer.util.js';
import { buildDeterministicSectionRewrite } from '../utils/section-rewriter.util.js';

@Injectable()
export class MockAiProvider implements AiProvider {
  public readonly name = 'mock';

  async parseResumeText(text: string): Promise<ParsedProfileDraft> {
    const detection = detectLinkedInProfilePdf(text);
    if (detection.isLinkedInPdf) {
      return parseLinkedInProfileText(text);
    }
    return parseGenericResumeText(text);
  }

  async parseJobDescription(text: string): Promise<ParsedJobRequirement[]> {
    const requirements: ParsedJobRequirement[] = [];

    const skillCatalog = [
      { name: 'TypeScript', type: 'required_skill' as const, importance: 'critical' as const },
      { name: 'Go', type: 'required_skill' as const, importance: 'high' as const },
      { name: 'PostgreSQL', type: 'required_skill' as const, importance: 'high' as const },
      { name: 'Redis', type: 'required_skill' as const, importance: 'medium' as const },
      { name: 'Kafka', type: 'preferred_skill' as const, importance: 'medium' as const },
      { name: 'Docker', type: 'required_skill' as const, importance: 'medium' as const },
      { name: 'Kubernetes', type: 'preferred_skill' as const, importance: 'low' as const },
      { name: 'AWS', type: 'preferred_skill' as const, importance: 'medium' as const },
      { name: 'Distributed Systems', type: 'domain' as const, importance: 'critical' as const },
    ];

    let counter = 1;
    skillCatalog.forEach((item) => {
      if (new RegExp(`\\b${item.name}\\b`, 'i').test(text)) {
        requirements.push({
          id: `req-${counter++}`,
          text: `Demonstrated expertise in ${item.name}`,
          type: item.type,
          importance: item.importance,
          keywords: [item.name.toLowerCase()],
        });
      }
    });

    // Experience requirement detection
    const expMatch = /(\d+)\+?\s*years/i.exec(text);
    if (expMatch) {
      requirements.push({
        id: `req-${counter++}`,
        text: `At least ${expMatch[1]} years of professional software engineering experience`,
        type: 'experience',
        importance: 'critical',
        keywords: ['years', 'experience'],
      });
    }

    if (requirements.length === 0) {
      requirements.push({
        id: 'req-fallback',
        text: 'Core software engineering skills and problem-solving ability',
        type: 'required_skill',
        importance: 'high',
        keywords: ['software', 'engineering'],
      });
    }

    return requirements;
  }

  async matchRequirements(
    resumeContent: ResumeContent,
    requirements: ParsedJobRequirement[],
  ): Promise<RequirementMatchOutput[]> {
    // Gather all candidate text evidence
    const candidateBullets: string[] = [];
    (resumeContent.experience || []).forEach((exp) => {
      (exp.bullets || []).forEach((b) => candidateBullets.push(b));
    });

    const candidateSkillNames = (resumeContent.skills || []).map((s) => s.name.toLowerCase());

    return requirements.map((req) => {
      const matchingBullets = candidateBullets.filter((b) =>
        req.keywords.some((kw) => b.toLowerCase().includes(kw)),
      );

      const skillMentioned = req.keywords.some((kw) =>
        candidateSkillNames.some((cs) => cs.includes(kw) || kw.includes(cs)),
      );

      if (matchingBullets.length > 0) {
        return {
          requirementId: req.id,
          status: 'supported',
          confidence: 95,
          evidenceQuotes: matchingBullets.slice(0, 2),
          explanation: `Strongly evidenced by your experience bullets referencing ${req.keywords.join(', ')}.`,
          suggestedAction: 'Keep bullet prioritized in the top 3 items of this job-tailored variation.',
        };
      }

      if (skillMentioned) {
        return {
          requirementId: req.id,
          status: 'needs_confirmation',
          confidence: 70,
          evidenceQuotes: [],
          explanation: `Listed in your skills vault (${req.keywords.join(', ')}), but no specific experience bullet demonstrates production impact.`,
          suggestedAction: 'Confirm whether you worked with this in production, and add an evidence bullet if true.',
        };
      }

      return {
        requirementId: req.id,
        status: 'not_evidenced',
        confidence: 90,
        evidenceQuotes: [],
        explanation: `No mention of ${req.keywords.join(', ')} found in your Master Profile.`,
        suggestedAction: 'Do not invent this skill. If you have unrecorded experience with this, add it to your master profile first.',
      };
    });
  }

  async rewriteBullet(
    bullet: string,
    targetRole?: string,
    metricHint?: string,
  ): Promise<BulletRewriteResult> {
    const cleanedCore = bullet
      .trim()
      .replace(/^(responsible for|tasked with|helped with|worked on|assisted with|duties included)\s+/i, '')
      .replace(/^(i|we)\s+/i, '')
      .replace(/[.]+$/, '');

    const lowerCore = cleanedCore.charAt(0).toLowerCase() + cleanedCore.slice(1);
    const roleLabel = targetRole?.trim() ? ` as ${targetRole.trim()}` : '';
    const metricClause = metricHint?.trim() ? `, delivering ${metricHint.trim()}` : '';
    const hasExistingMetric = /\d+%|\$\d+|\b\d+\b/.test(cleanedCore);

    const impactBullet = `Spearheaded ${lowerCore}${metricClause || (hasExistingMetric ? '' : ', driving measurable operational efficiency ([X%])')}.`;
    const starBullet = `Orchestrated cross-functional execution to ${lowerCore.replace(/^[a-z]+ing\b/, (m) => m)}${roleLabel}${metricClause}.`;
    const conciseBullet = `Executed ${lowerCore}${metricClause}.`;

    const variants: BulletVariantOption[] = [
      {
        style: 'Impact (XYZ)',
        bullet: impactBullet,
        actionVerbUsed: 'Spearheaded',
        framework: 'XYZ',
        rationale: 'Leads with an authoritative action verb and anchors the achievement to measurable business outcomes.',
      },
      {
        style: 'Executive (STAR)',
        bullet: starBullet,
        actionVerbUsed: 'Orchestrated',
        framework: 'STAR',
        rationale: 'Highlights ownership, cross-functional coordination, and role alignment.',
      },
      {
        style: 'Technical & Concise',
        bullet: conciseBullet,
        actionVerbUsed: 'Executed',
        framework: 'XYZ',
        rationale: 'Removes filler phrasing for fast ATS keyword scanning and scannable brevity.',
      },
    ];

    return {
      originalBullet: bullet,
      rewrittenBullet: impactBullet,
      actionVerbUsed: 'Spearheaded',
      framework: 'XYZ',
      explanation: 'Formatted using the Google XYZ formula: Accomplished [X] as measured by [Y] by doing [Z].',
      factualVerificationNotes: metricHint?.trim()
        ? 'Anchored strictly to your original bullet and confirmed metric hint.'
        : 'All facts come from your input. Replace any [X%] placeholder with your verified metric before finalizing.',
      variants,
      provider: this.name,
    };
  }

  async generateBullets(input: BulletGenerateRequest): Promise<BulletGenerateResult> {
    const role = input.roleTitle.trim() || 'Specialist';
    const focus = input.focusArea?.trim() || `core ${role} workflows and deliverables`;

    const bullets: BulletVariantOption[] = [
      {
        style: 'Impact (XYZ)',
        bullet: `Spearheaded end-to-end delivery of ${focus}, improving operational efficiency by [X%] across key stakeholders.`,
        actionVerbUsed: 'Spearheaded',
        framework: 'XYZ',
        rationale: 'Impact-first structure linking domain execution directly to measurable KPIs.',
      },
      {
        style: 'Executive (STAR)',
        bullet: `Collaborated with cross-functional teams in ${role} capacity to streamline ${focus}, reducing turnaround bottlenecks by [X%].`,
        actionVerbUsed: 'Collaborated',
        framework: 'STAR',
        rationale: 'Demonstrates leadership, cross-team alignment, and bottleneck resolution.',
      },
      {
        style: 'Technical & Concise',
        bullet: `Standardized best practices and quality checks for ${focus}, supporting [N+] deliverables with [X%] accuracy.`,
        actionVerbUsed: 'Standardized',
        framework: 'XYZ',
        rationale: 'Concise, repeatable process ownership format preferred by technical screeners.',
      },
    ];

    return {
      roleTitle: role,
      bullets,
      factualVerificationNotes:
        'Draft templates use explicit [X%] / [N+] placeholders so no false metrics are assumed. Replace placeholders with your true outcomes.',
      provider: this.name,
    };
  }

  async adaptResume(
    sourceResume: ResumeContent,
    benchmarkSample: ResumeContent,
    targetRole?: string,
  ): Promise<AdaptationProviderResult> {
    const role = targetRole || benchmarkSample.headline || sourceResume.headline;

    const adaptedSummary = `${sourceResume.summary} Aligned to ${role} excellence leveraging proven patterns in high-reliability execution.`;

    const experienceBullets = (sourceResume.experience || []).map((exp) => ({
      company: exp.company,
      title: exp.title,
      bullets: exp.bullets.map((b) => {
        if (/^(spearheaded|architected|orchestrated|engineered|optimized)/i.test(b)) {
          return b;
        }
        return `Architected and delivered ${b.charAt(0).toLowerCase() + b.slice(1)}`;
      }),
    }));

    const sourceSkills = new Set((sourceResume.skills || []).map((s) => s.name.toLowerCase()));
    const recommendedBenchmarkSkills = (benchmarkSample.skills || [])
      .map((s) => s.name)
      .filter((name) => !sourceSkills.has(name.toLowerCase()))
      .slice(0, 10);

    const projects = (sourceResume.projects || []).map((p) => ({
      name: p.name,
      description: p.description,
      highlights: p.highlights.map((h) => `Engineered ${h.charAt(0).toLowerCase() + h.slice(1)}`),
    }));

    const pricing = calculateUsageCost('mock', 1500, 800);

    return {
      payload: {
        headline: role,
        summary: adaptedSummary,
        experienceBullets,
        recommendedBenchmarkSkills,
        projects,
      },
      telemetry: {
        promptTokens: 1500,
        completionTokens: 800,
        totalTokens: 2300,
        costUsd: pricing.costUsd,
        modelId: pricing.modelId,
        pricingVersion: pricing.pricingVersion,
      },
    };
  }

  async adaptSection(
    sectionKey: string,
    sourceSectionData: any,
    benchmarkSectionData: any,
    targetRole?: string,
  ): Promise<SectionAdaptationProviderResult> {
    let adaptedContent: any;
    if (sectionKey === 'summary') {
      adaptedContent = `${typeof sourceSectionData === 'string' ? sourceSectionData : ''} Polished for ${targetRole || 'industry leadership'}.`;
    } else if (sectionKey === 'experience' && Array.isArray(sourceSectionData)) {
      adaptedContent = sourceSectionData.map((exp: any) => ({
        ...exp,
        bullets: (exp.bullets || []).map((b: string) => `Engineered and scaled ${b.charAt(0).toLowerCase() + b.slice(1)}`),
      }));
    } else {
      adaptedContent = sourceSectionData;
    }

    const pricing = calculateUsageCost('mock', 500, 300);

    return {
      sectionKey,
      adaptedContent,
      telemetry: {
        promptTokens: 500,
        completionTokens: 300,
        totalTokens: 800,
        costUsd: pricing.costUsd,
        modelId: pricing.modelId,
        pricingVersion: pricing.pricingVersion,
      },
    };
  }

  async tailorForJob(
    resumeContent: ResumeContent,
    jobTitle: string,
    companyName: string | undefined,
    requirements: ParsedJobRequirement[],
  ): Promise<JobTailorSuggestions> {
    const candidateSkillNames = (resumeContent.skills || []).map((s) => s.name);
    const reqKeywords = requirements.flatMap((r) => r.keywords || []);
    const verifiedOverlap = candidateSkillNames
      .filter((s) => reqKeywords.some((k) => s.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(s.toLowerCase())))
      .slice(0, 5);

    const focusSkills = verifiedOverlap.length > 0 ? verifiedOverlap.join(', ') : candidateSkillNames.slice(0, 4).join(', ');
    const suggestedHeadline = focusSkills
      ? `${jobTitle} | ${focusSkills}`
      : jobTitle || resumeContent.headline;

    const suggestedSummary = `${resumeContent.summary || ''} Focused on delivering ${jobTitle} outcomes${companyName ? ` aligned with ${companyName}` : ''}${focusSkills ? ` utilizing ${focusSkills}` : ''}.`.trim();

    const firstExp = resumeContent.experience?.[0];
    const bulletImprovements = firstExp
      ? (firstExp.bullets || []).slice(0, 2).map((b) => ({
          company: firstExp.company,
          originalBullet: b,
          tailoredBullet: b,
          matchedKeywords: verifiedOverlap.slice(0, 2),
        }))
      : [];

    return {
      suggestedHeadline,
      suggestedSummary,
      bulletImprovements,
      factualVerificationNotes:
        'Anchored strictly to verified candidate skills and bullets; unverified JD skills were excluded.',
      provider: this.name,
    };
  }

  async generateSummaryAndHeadlines(
    input: SummaryGenerateRequest,
  ): Promise<SummaryGenerateResult> {
    const baseRole =
      input.targetRole?.trim() ||
      input.experience[0]?.title?.trim() ||
      input.currentHeadline?.split('|')[0]?.trim() ||
      'Software Engineer';

    const verifiedSkills = input.skills.map((s) => s.trim()).filter(Boolean);
    const topTwoSkills = verifiedSkills.slice(0, 2).join(' & ');
    const topThreeSkills = verifiedSkills.slice(0, 3).join(', ');
    const topFiveSkills = verifiedSkills.slice(0, 5).join(', ');

    const allBullets = input.experience
      .flatMap((exp) => exp.bullets || [])
      .map((b) => b.trim())
      .filter(Boolean);
    const metricBullet = allBullets.find((b) => /\d+[%+xX]|\$\d+|\d+\s*(M|K|ms|rps|users|merchants)/i.test(b));
    const leadAchievement = (metricBullet || allBullets[0] || '').replace(/\.$/, '');

    const companies = input.experience
      .map((e) => e.company?.trim())
      .filter(Boolean);
    const primaryCompany = companies[0];

    const headlineSuggestions = [
      {
        style: 'Role + Core Stack',
        headline: topTwoSkills
          ? `${baseRole} | ${topTwoSkills}`
          : `${baseRole} | Systems & Architecture`,
      },
      {
        style: 'Domain & Scale',
        headline: primaryCompany
          ? `${baseRole} · ${primaryCompany} | ${verifiedSkills[0] || 'Engineering Delivery'}`
          : `${baseRole} | High-Reliability Platform Delivery`,
      },
      {
        style: 'Executive Impact',
        headline: topThreeSkills
          ? `${baseRole} | Scalable Architecture (${topThreeSkills})`
          : `${baseRole} | Architecture, Performance & Delivery`,
      },
    ];

    const stackClause = topFiveSkills
      ? `specializing in ${topFiveSkills}`
      : 'focused on reliable system architecture and production execution';

    const achievementClause = leadAchievement
      ? ` Proven record including: ${leadAchievement}.`
      : '';

    const companyClause = primaryCompany
      ? ` across production initiatives at ${companies.slice(0, 2).join(' and ')}`
      : '';

    const summaryOptions: SummaryGenerateResult['summaryOptions'] = [
      {
        tone: 'Executive',
        summary: `${baseRole} ${stackClause}${companyClause}. Combines hands-on technical architecture with end-to-end delivery discipline to build resilient, maintainable systems aligned with business growth.${achievementClause}`.trim(),
        focus: 'Leadership positioning, cross-role scope, and reliability',
      },
      {
        tone: 'Impact & Metrics',
        summary: `${baseRole} driving measurable system performance and operational efficiency${topThreeSkills ? ` with ${topThreeSkills}` : ''}.${achievementClause || ' Focused on quantifiable throughput, latency, and release reliability improvements.'}`.trim(),
        focus: 'Foregrounds verified quantitative bullets without invented numbers',
      },
      {
        tone: 'Technical & Concise',
        summary: `${baseRole} experienced in ${topFiveSkills || 'full-stack architecture and cloud delivery'}${primaryCompany ? ` at ${primaryCompany}` : ''}.${allBullets[0] ? ` ${allBullets[0].replace(/\.$/, '')}.` : ''}`.trim(),
        focus: 'Compact ATS keyword density in 2 tight sentences',
      },
    ];

    return {
      headlineSuggestions,
      summaryOptions,
      factualVerificationNotes: `Synthesized deterministically from ${input.experience.length} listed role(s) and ${verifiedSkills.length} verified skill(s); zero external metrics invented.`,
      provider: this.name,
    };
  }

  async generateCoverLetter(
    input: CoverLetterGenerateRequest,
  ): Promise<CoverLetterGenerateResult> {
    const rc = input.resumeContent;
    const role = input.targetRole.trim();
    const company = input.companyName.trim();
    const manager = input.hiringManager?.trim();
    const salutation = manager
      ? `Dear ${manager},`
      : `Dear ${company} Hiring Team,`;

    const skills = (rc.skills || []).map((s) => s.name.trim()).filter(Boolean);
    const jdLower = (input.jobDescription || '').toLowerCase();
    const jdMatchedSkills = jdLower
      ? skills.filter((s) => jdLower.includes(s.toLowerCase()))
      : [];
    const highlightedKeywords = (
      jdMatchedSkills.length > 0 ? jdMatchedSkills : skills
    ).slice(0, 8);

    const latestRole = rc.experience?.[0];
    const secondRole = rc.experience?.[1];
    const allBullets = (rc.experience || [])
      .flatMap((e) => e.bullets || [])
      .map((b) => b.trim().replace(/\.$/, ''))
      .filter(Boolean);

    const leadBullet = allBullets[0];
    const secondaryBullet = allBullets[1] || allBullets[0];
    const topProject = rc.projects?.[0];

    const skillStackText =
      highlightedKeywords.slice(0, 4).join(', ') || 'full-stack delivery';

    let toneLead = `Bringing proven hands-on ownership as a ${latestRole?.title || 'software specialist'} at ${latestRole?.company || 'high-growth engineering teams'}, I am excited to contribute to ${company} as your next ${role}.`;
    if (input.tone === 'Executive') {
      toneLead = `With strategic engineering leadership grounded in production delivery${latestRole ? ` as ${latestRole.title} at ${latestRole.company}` : ''}, I bring a disciplined track record aligned with ${company}'s ${role} mandate.`;
    } else if (input.tone === 'Technical') {
      toneLead = `Specializing in ${skillStackText}${latestRole ? ` from my work at ${latestRole.company}` : ''}, I am eager to bring systems rigor and high-throughput reliability to ${company}'s ${role} team.`;
    } else if (input.tone === 'Concise') {
      toneLead = `As a ${latestRole?.title || role} experienced in ${skillStackText}, I can make an immediate, measurable impact in ${company}'s ${role} role.`;
    }

    const focusClause = input.customFocus?.trim()
      ? ` Specifically aligning with your priorities around ${input.customFocus.trim()}, my verified background bridges architecture and measurable execution.`
      : '';

    const openingParagraph =
      input.sectionFocus &&
      input.sectionFocus !== 'all' &&
      input.sectionFocus !== 'opening' &&
      input.existingDraft?.openingParagraph?.trim()
        ? input.existingDraft.openingParagraph.trim()
        : `${toneLead}${leadBullet ? ` Notably, I ${leadBullet.charAt(0).toLowerCase()}${leadBullet.slice(1)}.` : ''}${focusClause}`;

    const p1 = latestRole
      ? `During my tenure as ${latestRole.title} at ${latestRole.company}, I delivered core initiatives spanning ${skillStackText}.${secondaryBullet ? ` For example, I ${secondaryBullet.charAt(0).toLowerCase()}${secondaryBullet.slice(1)}.` : ''}`
      : `My practical experience in ${skillStackText} positions me to ramp rapidly and strengthen delivery quality from week one.`;

    const p2 =
      input.tone === 'Concise'
        ? `${secondRole ? `Previously at ${secondRole.company}, I strengthened cross-functional product execution and maintainability.` : `I pair pragmatic engineering trade-offs with collaborative documentation and ownership.`}`
        : `${secondRole ? `Earlier as ${secondRole.title} at ${secondRole.company}, I reinforced this foundation through ${(secondRole.bullets?.[0] || 'end-to-end production delivery').replace(/\.$/, '').toLowerCase()}.` : `Across recent work, I have consistently paired architectural clarity with reliable execution.`}${topProject ? ` Beyond core product teams, building ${topProject.name} deepened my command of ${(topProject.description || 'scalable systems').replace(/\.$/, '').toLowerCase()}.` : ''}`;

    const bodyParagraphs =
      input.sectionFocus &&
      input.sectionFocus !== 'all' &&
      input.sectionFocus !== 'body' &&
      input.existingDraft?.bodyParagraphs?.length
        ? input.existingDraft.bodyParagraphs
        : [p1, p2];

    const closingParagraph =
      input.sectionFocus &&
      input.sectionFocus !== 'all' &&
      input.sectionFocus !== 'closing' &&
      input.existingDraft?.closingParagraph?.trim()
        ? input.existingDraft.closingParagraph.trim()
        : `I welcome the opportunity to discuss how my verified background in ${highlightedKeywords.slice(0, 3).join(', ') || 'systems engineering'} can support ${company}'s upcoming milestones for the ${role} position. Thank you for your consideration.`;

    return {
      salutation,
      openingParagraph,
      bodyParagraphs,
      closingParagraph,
      signOff: 'Sincerely,',
      highlightedKeywords,
      factualVerificationNotes: `Synthesized deterministically from verified resume roles (${rc.experience?.length || 0}) and skills (${highlightedKeywords.length} matched); zero invented metrics.`,
      provider: this.name,
    };
  }

  async checkWritingQuality(
    input: WritingCheckRequest,
  ): Promise<WritingCheckResult> {
    return runDeterministicWritingCheck(input);
  }

  async optimizeLinkedInProfile(
    input: LinkedInOptimizeRequest,
  ): Promise<LinkedInOptimizeResult> {
    return buildDeterministicLinkedInOptimization(input, this.name);
  }

  async rewriteSection(
    input: SectionRewriteRequest,
  ): Promise<SectionRewriteResult> {
    return {
      ...buildDeterministicSectionRewrite(input),
      provider: this.name,
    };
  }
}
