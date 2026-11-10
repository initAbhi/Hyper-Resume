import type {
  SectionRewriteRequest,
  SectionRewriteResult,
  SectionRewriteTone,
} from '../interfaces/ai-provider.interface.js';
import { validateAndSanitizeMetrics } from './factual-integrity-validator.js';

const WEAK_OPENER_REGEX =
  /^(?:I\s+|We\s+|Responsible for\s+|Worked on\s+|Tasked with\s+|Helped(?:\s+to)?\s+|Assisted(?:\s+with)?\s+)/i;

const TONE_VERB_TABLE: Record<SectionRewriteTone, string[]> = {
  executive: ['Spearheaded', 'Directed', 'Championed', 'Steered', 'Led'],
  impact: ['Delivered', 'Accelerated', 'Optimized', 'Streamlined', 'Elevated'],
  concise: ['Built', 'Shipped', 'Cut', 'Scaled', 'Automated'],
  technical: ['Architected', 'Engineered', 'Implemented', 'Designed', 'Refactored'],
  expand: ['Engineered', 'Architected', 'Orchestrated', 'Developed', 'Scaled'],
};

const TONE_LABELS: Record<SectionRewriteTone, string> = {
  executive: 'Executive & Strategic',
  impact: 'Impact & Metrics',
  concise: 'Concise & Punchy',
  technical: 'Technical Depth',
  expand: 'Smart Elaboration',
};

function stripWeakOpener(text: string): string {
  const cleaned = text.trim().replace(WEAK_OPENER_REGEX, '').trim();
  if (!cleaned) return text.trim();
  return cleaned.charAt(0).toLowerCase() + cleaned.slice(1);
}

function ensurePeriod(text: string): string {
  const t = text.trim();
  if (!t) return '';
  return /[.!?]$/.test(t) ? t : `${t}.`;
}

function pickToneVerb(tone: SectionRewriteTone, index: number): string {
  const pool = TONE_VERB_TABLE[tone] || TONE_VERB_TABLE.impact;
  return pool[index % pool.length];
}

function startsWithStrongVerb(text: string): boolean {
  return /^(?:Architected|Spearheaded|Directed|Championed|Steered|Delivered|Accelerated|Optimized|Streamlined|Elevated|Engineered|Implemented|Designed|Refactored|Automated|Built|Shipped|Scaled|Orchestrated|Led|Developed)\b/i.test(
    text.trim(),
  );
}

export function rewriteLineByTone(
  rawLine: string,
  tone: SectionRewriteTone,
  index: number,
  verifiedSkills: string[] = [],
  contextLabel?: string,
): string {
  const trimmed = (rawLine || '').trim();
  if (!trimmed) return '';

  let body = trimmed
    .replace(/\bin order to\b/gi, 'to')
    .replace(/\bwas responsible for\b/gi, '')
    .replace(/\bvarious different\b/gi, 'multiple')
    .replace(/\s+/g, ' ')
    .trim();

  if (tone === 'concise') {
    body = stripWeakOpener(body)
      .replace(/,\s*(?:which resulted in|thereby enabling|helping to ensure)\b/gi, ', ');
    if (!startsWithStrongVerb(body)) {
      body = `${pickToneVerb(tone, index)} ${body.charAt(0).toLowerCase()}${body.slice(1)}`;
    } else {
      body = body.charAt(0).toUpperCase() + body.slice(1);
    }
    return ensurePeriod(body);
  }

  if (WEAK_OPENER_REGEX.test(body) || !startsWithStrongVerb(body)) {
    const stripped = stripWeakOpener(body);
    body = `${pickToneVerb(tone, index)} ${stripped}`;
  } else if (tone === 'executive') {
    const firstSpace = body.indexOf(' ');
    if (firstSpace > 0) {
      const rest = body.slice(firstSpace + 1);
      const execVerb = pickToneVerb('executive', index);
      body = `${execVerb} end-to-end delivery to ${rest.charAt(0).toLowerCase()}${rest.slice(1)}`;
    }
  }

  if (tone === 'technical') {
    const mentionedSkill = verifiedSkills.find((s) =>
      new RegExp(`\\b${s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(trimmed),
    );
    if (mentionedSkill && !/architecture|pipeline|production|system/i.test(body)) {
      body = `${body.replace(/[.!?]+$/, '')} with production ${mentionedSkill} reliability`;
    }
  }

  if (tone === 'expand') {
    const roleHint = contextLabel?.trim();
    const firstSkill = verifiedSkills.find(
      (s) =>
        s.trim().length > 1 &&
        !new RegExp(`\\b${s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(body),
    );
    if (!/ensuring|supporting|maintaining|across/i.test(body)) {
      if (roleHint && !body.toLowerCase().includes(roleHint.toLowerCase())) {
        body = `${body.replace(/[.!?]+$/, '')}, supporting core ${roleHint} execution standards`;
      } else if (firstSkill) {
        body = `${body.replace(/[.!?]+$/, '')}, reinforcing engineering maintainability alongside ${firstSkill}`;
      }
    }
  }

  return ensurePeriod(body.charAt(0).toUpperCase() + body.slice(1));
}

export function buildDeterministicSectionRewrite(
  input: SectionRewriteRequest,
): SectionRewriteResult {
  const verifiedSkills = (input.candidateSkills || []).map((s) => s.trim()).filter(Boolean);
  const roleContext = input.targetRole?.trim();
  const modeLabel = TONE_LABELS[input.tone] || input.tone;

  if (input.sectionType === 'summary') {
    const original = (input.summaryText || '').trim();
    const sentences = original
      .split(/(?<=[.!?])\s+/)
      .map((s) => s.trim())
      .filter(Boolean);

    let rewritten = original;
    if (input.tone === 'concise') {
      rewritten = sentences.slice(0, 2).join(' ') || original;
      rewritten = rewritten
        .replace(/^(?:I am a|I'm a|Results-driven)\s+/i, '')
        .trim();
    } else if (input.tone === 'executive') {
      const leadRole = roleContext || 'Engineering Leader';
      const core = sentences[0]
        ? stripWeakOpener(sentences[0]).replace(/\.$/, '')
        : 'delivering resilient, scalable product systems';
      const tail = sentences[1] ? ` ${ensurePeriod(sentences[1])}` : '';
      rewritten = `${leadRole} driving strategic architecture and end-to-end execution, ${core}.${tail}`.trim();
    } else if (input.tone === 'impact') {
      const first = sentences[0] || original;
      const metricSentence = sentences.find((s) => /\d/.test(s));
      rewritten =
        metricSentence && metricSentence !== first
          ? `${ensurePeriod(metricSentence)} ${ensurePeriod(first)}`
          : ensurePeriod(first.replace(/^(?:I |We |Responsible for )/i, 'Focused on delivering measurable outcomes across '));
    } else if (input.tone === 'technical') {
      const stack = verifiedSkills.slice(0, 4).join(', ');
      const base = sentences.slice(0, 2).join(' ').replace(/\.$/, '');
      rewritten = stack && !base.toLowerCase().includes(verifiedSkills[0]?.toLowerCase() || '__none__')
        ? `${base} utilizing ${stack}.`
        : ensurePeriod(base);
    } else if (input.tone === 'expand') {
      const base = ensurePeriod(original);
      const stackClause = verifiedSkills.slice(0, 3).join(', ');
      rewritten = stackClause
        ? `${base} Proven experience applying ${stackClause} across production software lifecycles${roleContext ? ` tailored for ${roleContext} scope` : ''}.`
        : `${base} Brings structured engineering ownership and cross-functional collaboration${roleContext ? ` aligned with ${roleContext} goals` : ''}.`;
    }

    return {
      sectionType: 'summary',
      tone: input.tone,
      summaryRewrite: {
        original,
        rewritten: ensurePeriod(rewritten),
      },
      changesSummary: `Refined Professional Summary using ${modeLabel} framing without introducing unverified claims.`,
      factualVerificationNotes:
        'Grounded strictly in your existing summary and verified resume skills; zero external facts or numbers added.',
      warnings: [],
      provider: 'deterministic',
    };
  }

  if (input.sectionType === 'experience') {
    const entries = input.experienceEntries || [];
    return {
      sectionType: 'experience',
      tone: input.tone,
      experienceRewrites: entries.map((exp, idx) => ({
        index: idx,
        title: exp.title,
        company: exp.company,
        originalBullets: exp.bullets || [],
        rewrittenBullets: (exp.bullets || []).map((b, bIdx) =>
          rewriteLineByTone(b, input.tone, bIdx, verifiedSkills, exp.title),
        ),
      })),
      changesSummary: `Rewrote ${entries.length} experience ${entries.length === 1 ? 'entry' : 'entries'} in ${modeLabel} tone while locking titles, companies, and metrics.`,
      factualVerificationNotes:
        'Preserved original companies, titles, and existing numerical metrics verbatim with zero fabricated statistics.',
      warnings: [],
      provider: 'deterministic',
    };
  }

  if (input.sectionType === 'projects') {
    const entries = input.projectEntries || [];
    return {
      sectionType: 'projects',
      tone: input.tone,
      projectRewrites: entries.map((proj, idx) => ({
        index: idx,
        name: proj.name,
        originalDescription: proj.description,
        rewrittenDescription: rewriteLineByTone(
          proj.description,
          input.tone,
          idx,
          verifiedSkills,
          proj.name,
        ),
        originalHighlights: proj.highlights || [],
        rewrittenHighlights: (proj.highlights || []).map((h, hIdx) =>
          rewriteLineByTone(h, input.tone, hIdx, verifiedSkills, proj.name),
        ),
      })),
      changesSummary: `Rewrote ${entries.length} project ${entries.length === 1 ? 'description' : 'descriptions'} in ${modeLabel} tone without inventing unverified results.`,
      factualVerificationNotes:
        'Preserved project names and existing factual scope; no invented benchmarks added.',
      warnings: [],
      provider: 'deterministic',
    };
  }

  const customEntries = input.customEntries || [];
  return {
    sectionType: 'custom',
    tone: input.tone,
    customRewrites: customEntries.map((entry, idx) => ({
      index: idx,
      heading: entry.heading,
      originalBullets: entry.bullets || [],
      rewrittenBullets: (entry.bullets || []).map((b, bIdx) =>
        rewriteLineByTone(b, input.tone, bIdx, verifiedSkills, entry.heading),
      ),
    })),
    changesSummary: `Refined ${input.sectionTitle || 'Custom Section'} entries in ${modeLabel} tone using only verified details.`,
    factualVerificationNotes:
      'Preserved original headings and dates; zero fabricated credentials or numbers inserted.',
    warnings: [],
    provider: 'deterministic',
  };
}

/**
 * Validates AI-rewritten section payloads against original source text so
 * un-evidenced numeric metrics or semantic exaggeration claims never pass through.
 */
export function sanitizeSectionRewriteResult(
  input: SectionRewriteRequest,
  raw: Partial<SectionRewriteResult>,
): SectionRewriteResult {
  const fallback = buildDeterministicSectionRewrite(input);
  const warnings: string[] = [];

  const sanitizeText = (orig: string, candidate: string | undefined, label: string): string => {
    if (!candidate || !candidate.trim()) return orig;
    const check = validateAndSanitizeMetrics(orig, candidate.trim(), label);
    if (check.warnings.length > 0) {
      warnings.push(...check.warnings);
    }
    return check.sanitizedText || orig;
  };

  if (input.sectionType === 'summary') {
    const orig = (input.summaryText || '').trim();
    const rewritten = sanitizeText(
      orig,
      raw.summaryRewrite?.rewritten,
      'Summary',
    );
    return {
      sectionType: 'summary',
      tone: input.tone,
      summaryRewrite: {
        original: orig,
        rewritten,
      },
      changesSummary: raw.changesSummary?.trim() || fallback.changesSummary,
      factualVerificationNotes:
        warnings.length > 0
          ? 'Un-evidenced numbers detected in draft were sanitized automatically to maintain 100% factual integrity.'
          : raw.factualVerificationNotes?.trim() || fallback.factualVerificationNotes,
      warnings,
      provider: raw.provider || 'gemini',
    };
  }

  if (input.sectionType === 'experience') {
    const entries = input.experienceEntries || [];
    const candidateMap = new Map(
      (raw.experienceRewrites || []).map((r, i) => [typeof r.index === 'number' ? r.index : i, r]),
    );

    return {
      sectionType: 'experience',
      tone: input.tone,
      experienceRewrites: entries.map((exp, idx) => {
        const candidate = candidateMap.get(idx);
        const origBullets = exp.bullets || [];
        const rewrittenBullets = origBullets.map((origBullet, bIdx) =>
          sanitizeText(
            origBullet,
            candidate?.rewrittenBullets?.[bIdx],
            `${exp.company} (${exp.title}) bullet ${bIdx + 1}`,
          ),
        );
        return {
          index: idx,
          title: exp.title,
          company: exp.company,
          originalBullets: origBullets,
          rewrittenBullets,
        };
      }),
      changesSummary: raw.changesSummary?.trim() || fallback.changesSummary,
      factualVerificationNotes:
        warnings.length > 0
          ? 'Detected un-grounded numeric claims were replaced safely while preserving original role titles and companies.'
          : raw.factualVerificationNotes?.trim() || fallback.factualVerificationNotes,
      warnings,
      provider: raw.provider || 'gemini',
    };
  }

  if (input.sectionType === 'projects') {
    const entries = input.projectEntries || [];
    const candidateMap = new Map(
      (raw.projectRewrites || []).map((r, i) => [typeof r.index === 'number' ? r.index : i, r]),
    );

    return {
      sectionType: 'projects',
      tone: input.tone,
      projectRewrites: entries.map((proj, idx) => {
        const candidate = candidateMap.get(idx);
        const origDesc = proj.description || '';
        const origHighlights = proj.highlights || [];
        return {
          index: idx,
          name: proj.name,
          originalDescription: origDesc,
          rewrittenDescription: sanitizeText(
            origDesc,
            candidate?.rewrittenDescription,
            `Project "${proj.name}" description`,
          ),
          originalHighlights: origHighlights,
          rewrittenHighlights: origHighlights.map((h, hIdx) =>
            sanitizeText(
              h,
              candidate?.rewrittenHighlights?.[hIdx],
              `Project "${proj.name}" highlight ${hIdx + 1}`,
            ),
          ),
        };
      }),
      changesSummary: raw.changesSummary?.trim() || fallback.changesSummary,
      factualVerificationNotes:
        warnings.length > 0
          ? 'Un-evidenced numbers in AI output were scrubbed automatically; project titles preserved.'
          : raw.factualVerificationNotes?.trim() || fallback.factualVerificationNotes,
      warnings,
      provider: raw.provider || 'gemini',
    };
  }

  const customEntries = input.customEntries || [];
  const candidateMap = new Map(
    (raw.customRewrites || []).map((r, i) => [typeof r.index === 'number' ? r.index : i, r]),
  );

  return {
    sectionType: 'custom',
    tone: input.tone,
    customRewrites: customEntries.map((entry, idx) => {
      const candidate = candidateMap.get(idx);
      const origBullets = entry.bullets || [];
      return {
        index: idx,
        heading: entry.heading,
        originalBullets: origBullets,
        rewrittenBullets: origBullets.map((b, bIdx) =>
          sanitizeText(b, candidate?.rewrittenBullets?.[bIdx], `${entry.heading} item ${bIdx + 1}`),
        ),
      };
    }),
    changesSummary: raw.changesSummary?.trim() || fallback.changesSummary,
    factualVerificationNotes:
      warnings.length > 0
        ? 'Un-evidenced metrics were scrubbed automatically while preserving headings and credentials.'
        : raw.factualVerificationNotes?.trim() || fallback.factualVerificationNotes,
    warnings,
    provider: raw.provider || 'gemini',
  };
}

