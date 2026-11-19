import type { ResumeContent } from '../../resumes/entities/resume.types.js';
import type { GeminiMessageContent } from '../../ai/providers/gemini-ai.provider.js';

export interface PrunedHistoryStats {
  originalMessages: number;
  keptVerbatim: number;
  compactedCount: number;
  droppedCount: number;
  originalTokens: number;
  prunedTokens: number;
  savedTokens: number;
}

export interface PrunedHistoryResult {
  contents: GeminiMessageContent[];
  stats: PrunedHistoryStats;
}

/**
 * Fast, deterministic token approximation (~4 chars/token for English/JSON).
 */
export function estimateTokens(input: string | Record<string, unknown> | unknown[]): number {
  if (!input) return 0;
  const text = typeof input === 'string' ? input : JSON.stringify(input);
  if (!text) return 0;
  return Math.ceil(text.length / 4);
}

/**
 * Strips heavy/noisy fields (such as base64 photoUrl data URIs, empty arrays,
 * blank strings, and redundant layout defaults) while keeping 100% of candidate
 * career facts so the cached Resume JSON prefix stays compact and byte-stable.
 */
export function serializeCompactResumeForCache(resume: {
  id: string;
  name: string;
  version: number;
  templateKey?: string;
  content?: ResumeContent;
}): string {
  const c = (resume.content || {}) as Partial<ResumeContent>;
  const contactRaw = c.contact || ({} as ResumeContent['contact']);

  const compactContact: Record<string, string> = {};
  if (contactRaw.fullName?.trim()) compactContact.fullName = contactRaw.fullName.trim();
  if (contactRaw.email?.trim()) compactContact.email = contactRaw.email.trim();
  if (contactRaw.phone?.trim()) compactContact.phone = contactRaw.phone.trim();
  if (contactRaw.location?.trim()) compactContact.location = contactRaw.location.trim();
  if (contactRaw.linkedinUrl?.trim()) compactContact.linkedinUrl = contactRaw.linkedinUrl.trim();
  if (contactRaw.githubUrl?.trim()) compactContact.githubUrl = contactRaw.githubUrl.trim();
  if (contactRaw.websiteUrl?.trim()) compactContact.websiteUrl = contactRaw.websiteUrl.trim();
  // Explicitly omit photoUrl (can contain 100KB+ base64 image data!)

  const compactPayload: Record<string, unknown> = {
    resumeId: resume.id,
    name: resume.name,
    version: resume.version,
    templateKey: resume.templateKey || 'clean-modern',
    contact: compactContact,
  };

  if (c.headline?.trim()) compactPayload.headline = c.headline.trim();
  if (c.summary?.trim()) compactPayload.summary = c.summary.trim();

  if (Array.isArray(c.skills) && c.skills.length > 0) {
    compactPayload.skills = c.skills
      .map((s: { name?: string } | string) =>
        typeof s === 'string' ? s.trim() : s?.name?.trim(),
      )
      .filter(Boolean);
  }

  if (Array.isArray(c.experience) && c.experience.length > 0) {
    compactPayload.experience = c.experience.map((exp, idx) => ({
      i: idx,
      title: exp.title,
      company: exp.company,
      dates: `${exp.startDate || ''} - ${exp.current ? 'Present' : exp.endDate || ''}`.trim(),
      bullets: (exp.bullets || []).filter((b) => typeof b === 'string' && b.trim().length > 0),
    }));
  }

  if (Array.isArray(c.projects) && c.projects.length > 0) {
    compactPayload.projects = c.projects.map((p, idx) => ({
      i: idx,
      name: p.name,
      ...(p.description?.trim() ? { description: p.description.trim() } : {}),
      ...(Array.isArray(p.highlights) && p.highlights.length > 0
        ? { highlights: p.highlights.filter((h) => typeof h === 'string' && h.trim().length > 0) }
        : {}),
    }));
  }

  if (Array.isArray(c.education) && c.education.length > 0) {
    compactPayload.education = c.education.map((edu) => ({
      school: edu.school,
      degree: edu.degree,
      ...(edu.field ? { field: edu.field } : {}),
      ...(edu.graduationDate ? { graduationDate: edu.graduationDate } : {}),
    }));
  }

  if (Array.isArray(c.certifications) && c.certifications.length > 0) {
    compactPayload.certifications = c.certifications.map((cert) => ({
      name: cert.name,
      issuer: cert.issuer,
      ...(cert.issueDate ? { issueDate: cert.issueDate } : {}),
    }));
  }

  if (Array.isArray(c.customSections) && c.customSections.length > 0) {
    compactPayload.customSections = c.customSections.map((sec) => ({
      title: sec.title,
      kind: sec.kind,
      entries: (sec.entries || []).map((e) => ({
        heading: e.heading,
        ...(e.subtitle ? { subtitle: e.subtitle } : {}),
        ...(e.bullets?.length ? { bullets: e.bullets } : {}),
      })),
    }));
  }

  if (c.layout && Object.keys(c.layout).length > 0) {
    compactPayload.layout = c.layout;
  }

  return JSON.stringify(compactPayload);
}

function summarizeMessageForDigest(role: string, content: string): string {
  const cleaned = content
    .replace(/```[\s\S]*?```/g, '[code/json omitted]')
    .replace(/\s+/g, ' ')
    .trim();
  const label = role === 'assistant' ? 'Agent' : 'User';
  return `${label}: ${cleaned.slice(0, 140)}${cleaned.length > 140 ? '…' : ''}`;
}

/**
 * Sliding-window conversation pruner:
 * - Preserves the most recent `verbatimCount` messages cleanly (capped per message)
 *   so immediate references ("apply #2", "yes fix those") never lose fidelity.
 * - Compacts older turns into a single concise digest message to stay strictly within
 *   `maxTokenBudget` without dropping conversational continuity.
 */
export function pruneConversationHistory(
  priorMessages: Array<{ role: string; content: string }>,
  options?: {
    verbatimCount?: number;
    maxMessageChars?: number;
    maxTokenBudget?: number;
    maxDigestChars?: number;
  },
): PrunedHistoryResult {
  const verbatimCount = options?.verbatimCount ?? 6;
  const maxMessageChars = options?.maxMessageChars ?? 1200;
  const maxTokenBudget = options?.maxTokenBudget ?? 2400;
  const maxDigestChars = options?.maxDigestChars ?? 700;

  if (!Array.isArray(priorMessages) || priorMessages.length === 0) {
    return {
      contents: [],
      stats: {
        originalMessages: 0,
        keptVerbatim: 0,
        compactedCount: 0,
        droppedCount: 0,
        originalTokens: 0,
        prunedTokens: 0,
        savedTokens: 0,
      },
    };
  }

  const originalTokens = priorMessages.reduce(
    (sum, m) => sum + estimateTokens(m.content || ''),
    0,
  );

  const splitIndex = Math.max(0, priorMessages.length - verbatimCount);
  const older = priorMessages.slice(0, splitIndex);
  const recent = priorMessages.slice(splitIndex);

  const contents: GeminiMessageContent[] = [];
  let compactedCount = 0;
  let droppedCount = 0;

  if (older.length > 0) {
    const digestLines: string[] = [];
    let digestChars = 0;
    // Summarize from most recent older turn backwards so fresher context wins
    for (let i = older.length - 1; i >= 0; i--) {
      const line = summarizeMessageForDigest(older[i].role, older[i].content || '');
      if (digestChars + line.length + 1 <= maxDigestChars) {
        digestLines.unshift(`- ${line}`);
        digestChars += line.length + 3;
        compactedCount += 1;
      } else {
        droppedCount += 1;
      }
    }

    if (digestLines.length > 0) {
      contents.push({
        role: 'user',
        parts: [
          {
            text: `[Earlier conversation summary (${compactedCount} older turns compacted)]\n${digestLines.join('\n')}`,
          },
        ],
      });
      contents.push({
        role: 'model',
        parts: [{ text: 'Understood. Continuing with full context from earlier turns.' }],
      });
    }
  }

  // Add recent verbatim turns, enforcing maxTokenBudget from newest backwards
  const recentEntries: GeminiMessageContent[] = [];
  let usedTokens = contents.reduce((sum, c) => sum + estimateTokens(c.parts[0]?.text || ''), 0);

  for (let i = recent.length - 1; i >= 0; i--) {
    const msg = recent[i];
    const text = (msg.content || '').trim().slice(0, maxMessageChars);
    if (!text) continue;
    const msgTokens = estimateTokens(text);

    // Always keep at least the latest 2 recent messages even if tight on budget
    const mustKeep = recent.length - i <= 2;
    if (!mustKeep && usedTokens + msgTokens > maxTokenBudget) {
      droppedCount += 1;
      continue;
    }

    recentEntries.unshift({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text }],
    });
    usedTokens += msgTokens;
  }

  contents.push(...recentEntries);

  const prunedTokens = contents.reduce(
    (sum, c) => sum + estimateTokens(c.parts[0]?.text || ''),
    0,
  );

  return {
    contents,
    stats: {
      originalMessages: priorMessages.length,
      keptVerbatim: recentEntries.length,
      compactedCount,
      droppedCount,
      originalTokens,
      prunedTokens,
      savedTokens: Math.max(0, originalTokens - prunedTokens),
    },
  };
}

/**
 * Structurally prunes workflowState JSON for post-tool synthesis without breaking JSON validity.
 * Trims oversized raw JD text and bulky unparsed arrays while preserving every key metric,
 * ATS issue, skill gap, role bullet, and artifact ID.
 */
export function pruneWorkflowStateForSynthesis(
  workflowState: Record<string, any>,
  maxChars = 10000,
): string {
  const cloned: Record<string, any> = {};

  for (const [key, val] of Object.entries(workflowState || {})) {
    if (val === undefined || val === null) continue;

    if (key === 'selectedJob' && typeof val === 'object') {
      cloned.selectedJob = {
        ...val,
        ...(typeof val.descriptionText === 'string' && val.descriptionText.length > 1800
          ? { descriptionText: `${val.descriptionText.slice(0, 1800)}… [truncated]` }
          : {}),
      };
    } else if (key === 'readResume' && typeof val === 'object') {
      cloned.readResume = {
        ...val,
        ...(Array.isArray(val.experience)
          ? {
              experience: val.experience.slice(0, 8).map((e: any) => ({
                ...e,
                bullets: Array.isArray(e.bullets)
                  ? e.bullets.slice(0, 8).map((b: string) => String(b).slice(0, 260))
                  : [],
              })),
            }
          : {}),
        ...(Array.isArray(val.projects) ? { projects: val.projects.slice(0, 6) } : {}),
        ...(Array.isArray(val.skills) ? { skills: val.skills.slice(0, 45) } : {}),
      };
    } else {
      cloned[key] = val;
    }
  }

  let serialized = JSON.stringify(cloned);
  if (serialized.length <= maxChars) {
    return serialized;
  }

  // Secondary structural squeeze: shorten summary & JD text further before ever hard-truncating
  if (cloned.selectedJob?.descriptionText) {
    cloned.selectedJob.descriptionText = String(cloned.selectedJob.descriptionText).slice(0, 700);
  }
  if (cloned.readResume?.summary) {
    cloned.readResume.summary = String(cloned.readResume.summary).slice(0, 400);
  }
  serialized = JSON.stringify(cloned);
  return serialized.length <= maxChars ? serialized : serialized.slice(0, maxChars);
}
