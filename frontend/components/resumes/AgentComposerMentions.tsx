'use client';

import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import {
  AtSign,
  Briefcase,
  FileText,
  FolderKanban,
  GraduationCap,
  Layers,
  Pin,
  Sparkles,
  User,
  Wrench,
  X,
} from 'lucide-react';
import { apiClient, type JobApplication, type JobDescription, type Resume } from '@/lib/api-client';
import type { AgentMessageContext, PinnedAgentTarget } from '@/lib/agent-client';

export interface ComposerPinnedItem extends PinnedAgentTarget {
  /** Optional rich JD text attached when pinning a saved JobDescription */
  jobDescriptionText?: string;
  applyUrl?: string;
  location?: string;
}

export interface ActiveMentionMatch {
  query: string;
  startIndex: number;
  endIndex: number;
}

export interface MentionOption {
  id: string;
  kind: 'section' | 'job' | 'resume';
  label: string;
  displayTitle: string;
  subtitle?: string;
  keywords: string;
  item: ComposerPinnedItem;
}

const DEFAULT_SECTION_MENTIONS: MentionOption[] = [
  {
    id: 'section:experience',
    kind: 'section',
    label: '@Experience',
    displayTitle: 'Experience',
    subtitle: 'Work history & achievement bullets',
    keywords: 'experience work history roles bullets jobs',
    item: {
      kind: 'section',
      id: 'section:experience',
      label: '@Experience',
      sectionKey: 'experience',
    },
  },
  {
    id: 'section:projects',
    kind: 'section',
    label: '@Projects',
    displayTitle: 'Projects',
    subtitle: 'Project descriptions & highlights',
    keywords: 'projects portfolio highlights github',
    item: {
      kind: 'section',
      id: 'section:projects',
      label: '@Projects',
      sectionKey: 'projects',
    },
  },
  {
    id: 'section:skills',
    kind: 'section',
    label: '@Skills',
    displayTitle: 'Skills',
    subtitle: 'Technical stack & categorized skills',
    keywords: 'skills tech stack keywords tools languages',
    item: {
      kind: 'section',
      id: 'section:skills',
      label: '@Skills',
      sectionKey: 'skills',
    },
  },
  {
    id: 'section:summary',
    kind: 'section',
    label: '@Summary',
    displayTitle: 'Summary',
    subtitle: 'Professional summary & positioning',
    keywords: 'summary bio profile intro overview',
    item: {
      kind: 'section',
      id: 'section:summary',
      label: '@Summary',
      sectionKey: 'summary',
    },
  },
  {
    id: 'section:headline',
    kind: 'section',
    label: '@Headline',
    displayTitle: 'Headline',
    subtitle: 'Top target role headline',
    keywords: 'headline title role header',
    item: {
      kind: 'section',
      id: 'section:headline',
      label: '@Headline',
      sectionKey: 'headline',
    },
  },
  {
    id: 'section:education',
    kind: 'section',
    label: '@Education',
    displayTitle: 'Education',
    subtitle: 'Degrees, institutions & graduation dates',
    keywords: 'education degree university school college',
    item: {
      kind: 'section',
      id: 'section:education',
      label: '@Education',
      sectionKey: 'education',
    },
  },
  {
    id: 'section:certifications',
    kind: 'section',
    label: '@Certifications',
    displayTitle: 'Certifications',
    subtitle: 'Licenses & professional credentials',
    keywords: 'certifications certs credentials licenses',
    item: {
      kind: 'section',
      id: 'section:certifications',
      label: '@Certifications',
      sectionKey: 'certifications',
    },
  },
  {
    id: 'section:contact',
    kind: 'section',
    label: '@Contact',
    displayTitle: 'Contact',
    subtitle: 'Email, phone, LinkedIn, GitHub & location',
    keywords: 'contact email phone linkedin github location',
    item: {
      kind: 'section',
      id: 'section:contact',
      label: '@Contact',
      sectionKey: 'contact',
    },
  },
];

/**
 * Extracts an active `@query` mention token right before the cursor.
 * Ignores email addresses (requires start-of-input or preceding whitespace/bracket).
 */
export function extractActiveMentionQuery(
  text: string,
  caretIndex: number,
): ActiveMentionMatch | null {
  if (!text || caretIndex <= 0) return null;
  const clamped = Math.min(caretIndex, text.length);
  const beforeCaret = text.slice(0, clamped);
  const match = beforeCaret.match(/(?:^|[\s([{"'])@([^\s@]{0,40})$/);
  if (!match) return null;
  const query = match[1] ?? '';
  const atPos = clamped - query.length - 1;
  if (atPos < 0 || text[atPos] !== '@') return null;
  return {
    query,
    startIndex: atPos,
    endIndex: clamped,
  };
}

/**
 * Removes the `@query` token from draft text cleanly when a mention option is selected.
 */
export function stripActiveMentionToken(
  text: string,
  match: ActiveMentionMatch,
): { nextText: string; nextCaret: number } {
  const before = text.slice(0, match.startIndex);
  const after = text.slice(match.endIndex);
  const needsSpace = before.length > 0 && !/\s$/.test(before) && after.length > 0 && !/^\s/.test(after);
  const joined = `${before}${needsSpace ? ' ' : ''}${after}`.replace(/ {2,}/g, ' ');
  return {
    nextText: joined,
    nextCaret: before.length + (needsSpace ? 1 : 0),
  };
}

/**
 * Compiles pinned chips + raw user message into structured AgentMessageContext & enriched prompt.
 */
export function buildPinnedSubmissionPayload(
  rawMessage: string,
  pinnedItems: ComposerPinnedItem[],
  baseContext: Partial<AgentMessageContext> = {},
): {
  content: string;
  contextPatch: Partial<AgentMessageContext>;
  overrideResumeId?: string;
} {
  const trimmed = rawMessage.trim();
  if (pinnedItems.length === 0) {
    return { content: trimmed, contextPatch: baseContext };
  }

  const focusSections = new Set<string>(baseContext.focusSections || []);
  let overrideResumeId: string | undefined;
  let overrideResumeName: string | undefined;
  let jobPatch: Partial<AgentMessageContext> = {};

  for (const item of pinnedItems) {
    if (item.sectionKey) {
      focusSections.add(item.sectionKey);
    }
    if (item.kind === 'resume' && item.resumeId) {
      overrideResumeId = item.resumeId;
      overrideResumeName = item.label.replace(/^@Resume:\s*/i, '').trim();
    }
    if (item.kind === 'job') {
      const isUuid = Boolean(
        item.jobId &&
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(item.jobId),
      );
      jobPatch = {
        ...(isUuid ? { jobDescriptionId: item.jobId } : {}),
        ...(item.jobTitle ? { jobTitle: item.jobTitle } : {}),
        ...(item.companyName ? { companyName: item.companyName } : {}),
        ...(item.jobDescriptionText ? { jobDescriptionText: item.jobDescriptionText } : {}),
        ...(item.applyUrl ? { applyUrl: item.applyUrl } : {}),
        ...(item.location ? { location: item.location } : {}),
      };
    }
  }

  const pinnedTargets: PinnedAgentTarget[] = pinnedItems.map((item) => ({
    kind: item.kind,
    id: item.id,
    label: item.label,
    ...(item.sectionKey ? { sectionKey: item.sectionKey } : {}),
    ...(item.fieldPath ? { fieldPath: item.fieldPath } : {}),
    ...(item.excerpt ? { excerpt: item.excerpt.slice(0, 400) } : {}),
    ...(item.resumeId ? { resumeId: item.resumeId } : {}),
    ...(item.jobId ? { jobId: item.jobId } : {}),
    ...(item.jobTitle ? { jobTitle: item.jobTitle } : {}),
    ...(item.companyName ? { companyName: item.companyName } : {}),
  }));

  // Prepend compact inline mention tags only when not already written in the prompt
  const tagPrefix = pinnedItems
    .map((p) =>
      p.kind === 'bullet' && p.excerpt
        ? `[Pinned ${p.fieldPath || p.sectionKey || 'bullet'}: "${p.excerpt.slice(0, 140)}"]`
        : `[${p.label}]`,
    )
    .join(' ');

  const content = trimmed ? `${tagPrefix} ${trimmed}` : `Review and improve ${tagPrefix}`;

  return {
    content,
    overrideResumeId,
    contextPatch: {
      ...baseContext,
      ...jobPatch,
      ...(overrideResumeId ? { activeResumeId: overrideResumeId } : {}),
      ...(overrideResumeName ? { activeResumeName: overrideResumeName } : {}),
      ...(focusSections.size > 0 ? { focusSections: Array.from(focusSections) } : {}),
      pinnedTargets,
    },
  };
}

export interface UseComposerMentionsOptions {
  currentResumeId?: string;
  currentResumeName?: string;
  activeJob?: {
    jobDescriptionId?: string;
    jobTitle?: string;
    companyName?: string;
    jobDescriptionText?: string;
    applyUrl?: string;
    location?: string;
  } | null;
  availableResumes?: Resume[];
  availableJobs?: Array<{
    id: string;
    title: string;
    companyName: string;
    descriptionText?: string;
    applyUrl?: string;
    location?: string;
  }>;
  disableAutoFetch?: boolean;
}

export function useComposerMentions(options: UseComposerMentionsOptions = {}) {
  const {
    currentResumeId,
    currentResumeName,
    activeJob,
    availableResumes: providedResumes,
    availableJobs: providedJobs,
    disableAutoFetch = false,
  } = options;

  const [pinnedItems, setPinnedItems] = useState<ComposerPinnedItem[]>([]);
  const [activeMention, setActiveMention] = useState<ActiveMentionMatch | null>(null);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [fetchedResumes, setFetchedResumes] = useState<Resume[]>([]);
  const [fetchedJobs, setFetchedJobs] = useState<
    Array<{
      id: string;
      title: string;
      companyName: string;
      descriptionText?: string;
      applyUrl?: string;
      location?: string;
    }>
  >([]);
  const [liveAnnouncement, setLiveAnnouncement] = useState('');
  const hasFetchedRef = useRef(false);

  const loadDynamicMentions = useCallback(async () => {
    if (disableAutoFetch || hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    try {
      const [resumesRes, jdsRes, appsRes] = await Promise.allSettled([
        providedResumes ? Promise.resolve(providedResumes) : apiClient.listResumes({ limit: 12 }),
        providedJobs ? Promise.resolve([]) : apiClient.listJobDescriptions({ limit: 10 }),
        providedJobs ? Promise.resolve([]) : apiClient.listApplications({ limit: 10 }),
      ]);

      if (resumesRes.status === 'fulfilled' && Array.isArray(resumesRes.value)) {
        setFetchedResumes(resumesRes.value);
      }

      const combinedJobs: Array<{
        id: string;
        title: string;
        companyName: string;
        descriptionText?: string;
        applyUrl?: string;
        location?: string;
      }> = [];
      const seenJobKeys = new Set<string>();

      if (jdsRes.status === 'fulfilled' && Array.isArray(jdsRes.value)) {
        for (const jd of jdsRes.value as JobDescription[]) {
          const title = (jd.title || 'Target Role').trim();
          const company = (jd.companyName || 'Company').trim();
          const key = `${company.toLowerCase()}::${title.toLowerCase()}`;
          if (seenJobKeys.has(key)) continue;
          seenJobKeys.add(key);
          combinedJobs.push({
            id: jd.id,
            title,
            companyName: company,
            descriptionText: jd.originalText,
            applyUrl: (jd as any).sourceUrl,
          });
        }
      }

      if (appsRes.status === 'fulfilled' && Array.isArray(appsRes.value)) {
        for (const app of appsRes.value as Array<JobApplication & { role?: string; company?: string; jobUrl?: string }>) {
          const title = (app.jobTitle || app.role || 'Role').trim();
          const company = (app.companyName || app.company || 'Company').trim();
          const key = `${company.toLowerCase()}::${title.toLowerCase()}`;
          if (seenJobKeys.has(key)) continue;
          seenJobKeys.add(key);
          combinedJobs.push({
            id: app.jobDescriptionId || app.id,
            title,
            companyName: company,
            applyUrl: app.applicationUrl || app.jobUrl,
          });
        }
      }

      if (combinedJobs.length > 0) {
        setFetchedJobs(combinedJobs);
      }
    } catch {
      // Non-fatal; section mentions still work offline
    }
  }, [disableAutoFetch, providedJobs, providedResumes]);

  useEffect(() => {
    if (activeMention) {
      void loadDynamicMentions();
    }
  }, [activeMention, loadDynamicMentions]);

  const allOptions = useMemo<MentionOption[]>(() => {
    const out: MentionOption[] = [...DEFAULT_SECTION_MENTIONS];

    // Add Jobs (active context job + provided/fetched jobs)
    const jobEntries = [...(providedJobs || fetchedJobs)];
    if (activeJob?.companyName || activeJob?.jobTitle) {
      const alreadyPresent = jobEntries.some(
        (j) =>
          (activeJob.jobDescriptionId && j.id === activeJob.jobDescriptionId) ||
          (j.companyName.toLowerCase() === (activeJob.companyName || '').toLowerCase() &&
            j.title.toLowerCase() === (activeJob.jobTitle || '').toLowerCase()),
      );
      if (!alreadyPresent) {
        jobEntries.unshift({
          id: activeJob.jobDescriptionId || `active-job-${activeJob.companyName || 'role'}`,
          title: activeJob.jobTitle || 'Target Role',
          companyName: activeJob.companyName || 'Target Company',
          descriptionText: activeJob.jobDescriptionText,
          applyUrl: activeJob.applyUrl,
          location: activeJob.location,
        });
      }
    }

    for (const job of jobEntries.slice(0, 8)) {
      const label = `@Job: ${job.companyName}`;
      out.push({
        id: `job:${job.id}`,
        kind: 'job',
        label,
        displayTitle: `${job.companyName}`,
        subtitle: job.title,
        keywords: `job jd role company ${job.companyName} ${job.title}`,
        item: {
          kind: 'job',
          id: `job:${job.id}`,
          label,
          jobId: job.id,
          jobTitle: job.title,
          companyName: job.companyName,
          jobDescriptionText: job.descriptionText,
          applyUrl: job.applyUrl,
          location: job.location,
        },
      });
    }

    // Add Resumes (current resume + provided/fetched resumes)
    const resumeEntries = [...(providedResumes || fetchedResumes)];
    if (currentResumeId && currentResumeName) {
      if (!resumeEntries.some((r) => r.id === currentResumeId)) {
        resumeEntries.unshift({
          id: currentResumeId,
          name: currentResumeName,
        } as Resume);
      }
    }

    for (const res of resumeEntries.slice(0, 8)) {
      const label = `@Resume: ${res.name}`;
      out.push({
        id: `resume:${res.id}`,
        kind: 'resume',
        label,
        displayTitle: res.name,
        subtitle: res.id === currentResumeId ? 'Active resume' : 'Saved resume',
        keywords: `resume cv draft ${res.name}`,
        item: {
          kind: 'resume',
          id: `resume:${res.id}`,
          label,
          resumeId: res.id,
        },
      });
    }

    return out;
  }, [activeJob, currentResumeId, currentResumeName, fetchedJobs, fetchedResumes, providedJobs, providedResumes]);

  const filteredOptions = useMemo(() => {
    if (!activeMention) return [];
    const q = activeMention.query.trim().toLowerCase();
    if (!q) return allOptions.slice(0, 12);
    return allOptions
      .filter(
        (opt) =>
          opt.label.toLowerCase().includes(q) ||
          opt.displayTitle.toLowerCase().includes(q) ||
          (opt.subtitle || '').toLowerCase().includes(q) ||
          opt.keywords.toLowerCase().includes(q),
      )
      .slice(0, 12);
  }, [activeMention, allOptions]);

  const safeHighlightedIndex =
    filteredOptions.length === 0 ? 0 : Math.min(highlightedIndex, filteredOptions.length - 1);

  const pinItem = useCallback((item: ComposerPinnedItem) => {
    setPinnedItems((prev) => {
      if (prev.some((p) => p.id === item.id)) {
        return prev.map((p) => (p.id === item.id ? item : p));
      }
      // Keep at most 1 pinned resume or 1 pinned job to avoid ambiguous target conflicts
      const next = prev.filter((p) => {
        if (item.kind === 'resume' && p.kind === 'resume') return false;
        if (item.kind === 'job' && p.kind === 'job') return false;
        return true;
      });
      return [...next, item].slice(-8);
    });
    setLiveAnnouncement(`Pinned ${item.label} to chat context.`);
  }, []);

  const unpinItem = useCallback((id: string) => {
    setPinnedItems((prev) => {
      const removed = prev.find((p) => p.id === id);
      if (removed) {
        setLiveAnnouncement(`Removed ${removed.label} from chat context.`);
      }
      return prev.filter((p) => p.id !== id);
    });
  }, []);

  const clearPinnedItems = useCallback(() => {
    setPinnedItems([]);
  }, []);

  const handleTextChange = useCallback((value: string, caretIndex?: number | null) => {
    const pos = typeof caretIndex === 'number' ? caretIndex : value.length;
    const match = extractActiveMentionQuery(value, pos);
    setActiveMention(match);
    if (match) {
      setHighlightedIndex(0);
    }
  }, []);

  const openMentionMenu = useCallback(
    (currentValue: string, onSetValue: (next: string) => void) => {
      const needsLeadingSpace = currentValue.length > 0 && !/\s$/.test(currentValue);
      const nextVal = `${currentValue}${needsLeadingSpace ? ' ' : ''}@`;
      onSetValue(nextVal);
      setActiveMention({
        query: '',
        startIndex: nextVal.length - 1,
        endIndex: nextVal.length,
      });
      setHighlightedIndex(0);
      void loadDynamicMentions();
    },
    [loadDynamicMentions],
  );

  const closeMentionMenu = useCallback(() => {
    setActiveMention(null);
  }, []);

  const selectOption = useCallback(
    (
      option: MentionOption,
      currentValue: string,
      onSetValue: (next: string) => void,
    ) => {
      pinItem(option.item);
      if (activeMention) {
        const { nextText } = stripActiveMentionToken(currentValue, activeMention);
        onSetValue(nextText);
      }
      setActiveMention(null);
      setHighlightedIndex(0);
    },
    [activeMention, pinItem],
  );

  const handleMentionKeyDown = useCallback(
    (
      e: React.KeyboardEvent<HTMLTextAreaElement>,
      currentValue: string,
      onSetValue: (next: string) => void,
    ): boolean => {
      if (!activeMention) return false;

      if (e.key === 'Escape') {
        e.preventDefault();
        setActiveMention(null);
        return true;
      }

      if (filteredOptions.length === 0) {
        return false;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlightedIndex((prev) => (prev + 1) % filteredOptions.length);
        return true;
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlightedIndex((prev) => (prev - 1 + filteredOptions.length) % filteredOptions.length);
        return true;
      }

      if ((e.key === 'Enter' || e.key === 'Tab') && !e.shiftKey && !e.nativeEvent.isComposing) {
        e.preventDefault();
        const chosen = filteredOptions[safeHighlightedIndex];
        if (chosen) {
          selectOption(chosen, currentValue, onSetValue);
        }
        return true;
      }

      return false;
    },
    [activeMention, filteredOptions, safeHighlightedIndex, selectOption],
  );

  return {
    pinnedItems,
    pinItem,
    unpinItem,
    clearPinnedItems,
    activeMention,
    isOpen: Boolean(activeMention),
    filteredOptions,
    highlightedIndex: safeHighlightedIndex,
    setHighlightedIndex,
    liveAnnouncement,
    handleTextChange,
    openMentionMenu,
    closeMentionMenu,
    selectOption,
    handleMentionKeyDown,
  };
}

function getMentionIcon(kind: MentionOption['kind'], sectionKey?: string) {
  if (kind === 'job') return <Briefcase className="w-3.5 h-3.5 text-indigo-500 shrink-0" aria-hidden="true" />;
  if (kind === 'resume') return <FileText className="w-3.5 h-3.5 text-emerald-500 shrink-0" aria-hidden="true" />;
  switch (sectionKey) {
    case 'projects':
      return <FolderKanban className="w-3.5 h-3.5 text-purple-500 shrink-0" aria-hidden="true" />;
    case 'skills':
      return <Wrench className="w-3.5 h-3.5 text-amber-500 shrink-0" aria-hidden="true" />;
    case 'education':
      return <GraduationCap className="w-3.5 h-3.5 text-cyan-500 shrink-0" aria-hidden="true" />;
    case 'contact':
      return <User className="w-3.5 h-3.5 text-zinc-500 shrink-0" aria-hidden="true" />;
    case 'summary':
    case 'headline':
      return <Sparkles className="w-3.5 h-3.5 text-blue-500 shrink-0" aria-hidden="true" />;
    default:
      return <Layers className="w-3.5 h-3.5 text-blue-600 shrink-0" aria-hidden="true" />;
  }
}

export interface AgentMentionPopoverProps {
  listboxId: string;
  isOpen: boolean;
  query: string;
  options: MentionOption[];
  highlightedIndex: number;
  onHighlight: (index: number) => void;
  onSelect: (option: MentionOption) => void;
  onClose: () => void;
}

export function AgentMentionPopover({
  listboxId,
  isOpen,
  query,
  options,
  highlightedIndex,
  onHighlight,
  onSelect,
  onClose,
}: AgentMentionPopoverProps) {
  if (!isOpen) return null;

  return (
    <div
      id={listboxId}
      role="listbox"
      aria-label="Mention a resume section, job, or resume"
      data-testid="agent-mention-popover"
      className="absolute bottom-full left-0 right-0 mb-1.5 z-40 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-1 duration-100"
    >
      <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-950/60">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
          <AtSign className="w-3 h-3 text-blue-500" aria-hidden="true" />
          {query ? `Filtering "${query}"` : 'Pin context to AI prompt'}
        </span>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={onClose}
          aria-label="Close mention suggestions"
          className="text-[10px] text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer"
        >
          Esc
        </button>
      </div>

      {options.length === 0 ? (
        <div className="px-3 py-3 text-[11px] text-zinc-500 dark:text-zinc-400 text-center">
          No matching sections, jobs, or resumes for &ldquo;@{query}&rdquo;
        </div>
      ) : (
        <div className="max-h-56 overflow-y-auto p-1 space-y-0.5 overscroll-contain">
          {options.map((opt, idx) => {
            const isActive = idx === highlightedIndex;
            const kindBadge =
              opt.kind === 'job'
                ? 'Job'
                : opt.kind === 'resume'
                  ? 'Resume'
                  : 'Section';
            return (
              <button
                key={opt.id}
                id={`${listboxId}-opt-${idx}`}
                type="button"
                role="option"
                aria-selected={isActive}
                data-testid={`mention-option-${opt.id}`}
                onMouseDown={(e) => e.preventDefault()}
                onMouseEnter={() => onHighlight(idx)}
                onClick={() => onSelect(opt)}
                className={`w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-950/70 text-blue-900 dark:text-blue-100'
                    : 'text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100/80 dark:hover:bg-zinc-800/70'
                }`}
              >
                <span className="flex items-center gap-2 min-w-0">
                  {getMentionIcon(opt.kind, opt.item.sectionKey)}
                  <span className="min-w-0">
                    <span className="block text-[11.5px] font-semibold truncate">
                      {opt.label}
                    </span>
                    {opt.subtitle && (
                      <span className="block text-[10px] text-zinc-500 dark:text-zinc-400 truncate">
                        {opt.subtitle}
                      </span>
                    )}
                  </span>
                </span>
                <span className="text-[9.5px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 shrink-0">
                  {kindBadge}
                </span>
              </button>
            );
          })}
        </div>
      )}

      <div className="px-2.5 py-1 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/50 text-[10px] text-zinc-400 flex items-center justify-between">
        <span>↑↓ navigate · Enter / Tab to pin</span>
        <span>@Experience · @Job · @Resume</span>
      </div>
    </div>
  );
}

export function AgentPinnedChipsBar({
  items,
  onRemove,
  liveAnnouncement,
}: {
  items: ComposerPinnedItem[];
  onRemove: (id: string) => void;
  liveAnnouncement?: string;
}) {
  return (
    <>
      <div className="sr-only" role="status" aria-live="polite">
        {liveAnnouncement || ''}
      </div>
      {items.length > 0 && (
        <div
          data-testid="agent-pinned-chips-bar"
          aria-label="Pinned chat context items"
          className="flex flex-wrap items-center gap-1.5"
        >
          {items.map((item) => {
            const chipClasses =
              item.kind === 'bullet'
                ? 'border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-950/50 text-blue-900 dark:text-blue-200'
                : item.kind === 'job'
                  ? 'border-indigo-300 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-900 dark:text-indigo-200'
                  : item.kind === 'resume'
                    ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-200'
                    : 'border-violet-300 dark:border-violet-700 bg-violet-50 dark:bg-violet-950/50 text-violet-900 dark:text-violet-200';
            return (
              <span
                key={item.id}
                data-testid={`pinned-chip-${item.kind}`}
                title={item.excerpt ? `${item.label}\n${item.excerpt}` : item.label}
                className={`inline-flex items-center gap-1 max-w-full rounded-lg border px-2 py-0.5 text-[11px] font-semibold ${chipClasses}`}
              >
                {item.kind === 'bullet' ? (
                  <Pin className="w-3 h-3 shrink-0" aria-hidden="true" />
                ) : (
                  getMentionIcon(item.kind, item.sectionKey)
                )}
                <span className="truncate max-w-[210px]">{item.label}</span>
                <button
                  type="button"
                  onClick={() => onRemove(item.id)}
                  aria-label={`Remove pinned ${item.label}`}
                  className="p-0.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer shrink-0"
                >
                  <X className="w-2.5 h-2.5" aria-hidden="true" />
                </button>
              </span>
            );
          })}
        </div>
      )}
    </>
  );
}

export function AgentMentionTriggerButton({
  onClick,
  isOpen,
  disabled = false,
}: {
  onClick: () => void;
  isOpen: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-expanded={isOpen}
      title="Mention section, job, or resume (@)"
      aria-label="Mention a resume section, job, or resume"
      data-testid="agent-mention-trigger-btn"
      className={`h-9 w-9 rounded-xl border flex items-center justify-center transition-colors disabled:opacity-45 cursor-pointer shrink-0 ${
        isOpen
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400'
          : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-blue-600 dark:hover:text-blue-400'
      }`}
    >
      <AtSign className="w-4 h-4" aria-hidden="true" />
    </button>
  );
}

