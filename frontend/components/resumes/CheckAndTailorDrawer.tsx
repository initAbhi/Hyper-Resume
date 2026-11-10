'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import {
  X,
  CheckCircle2,
  Info,
  ChevronDown,
  ChevronUp,
  Bookmark,
  Sparkles,
  RefreshCw,
  Plus,
  ShieldCheck,
  Wand2,
  Briefcase,
  ClipboardPaste,
  ExternalLink,
} from 'lucide-react';
import {
  apiClient,
  type JobDescription,
  type JobMatch,
  type JobTailorSuggestionsResponse,
  type ResumeContent,
} from '@/lib/api-client';

interface KeywordItem {
  name: string;
  matched: boolean;
  priority: 'High' | 'Medium' | 'Low';
}

interface CheckAndTailorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  resumeId: string;
  resumeContent: ResumeContent;
  onUpdateContent: (updater: (prev: ResumeContent) => ResumeContent) => void;
  initialMatchId?: string | null;
  onMatchChange?: (score: number | null, keywords: string[]) => void;
  onToggleHighlights?: (enabled: boolean) => void;
  isHighlightsEnabled?: boolean;
}

const SAMPLE_JD_TITLE = 'Senior Backend Engineer';
const SAMPLE_JD_COMPANY = 'Stripe';
const SAMPLE_JD_TEXT = `We are seeking a Senior Backend Engineer to design and scale high-throughput payment and ledger microservices.

Requirements:
- 4+ years of backend engineering experience with TypeScript, Node.js, or NestJS.
- Deep expertise in PostgreSQL optimization, indexing, and transactional integrity.
- Production experience with Redis caching, message queues (BullMQ / Kafka), and Docker.
- Familiarity with AWS cloud infrastructure (ECS, RDS, S3), Kubernetes, and automated CI/CD pipelines.
- Experience building observability with Prometheus, Grafana, and distributed tracing.`;

function buildResumeSearchCorpus(content: ResumeContent): string {
  const parts: string[] = [
    content.headline || '',
    content.summary || '',
    ...(content.skills || []).map((s) => s.name),
    ...(content.experience || []).flatMap((e) => [e.title, e.company, ...(e.bullets || [])]),
    ...(content.projects || []).flatMap((p) => [p.name, p.description, ...(p.highlights || [])]),
    ...(content.certifications || []).map((c) => c.name),
  ];
  return parts.join(' ').toLowerCase();
}

function isValidSkillKeyword(kw: string): boolean {
  const clean = kw.trim();
  if (clean.length < 2 || clean.length > 40) return false;
  if (/^\d+\+?\s*(years?|yrs?|months?)$/i.test(clean)) return false;
  if (/^(years|experience|ability|skills?|requirements?)$/i.test(clean)) return false;
  return true;
}

function mapImportanceToPriority(importance?: string): 'High' | 'Medium' | 'Low' {
  if (importance === 'critical' || importance === 'high') return 'High';
  if (importance === 'low') return 'Low';
  return 'Medium';
}

export function CheckAndTailorDrawer({
  isOpen,
  onClose,
  resumeId,
  resumeContent,
  onUpdateContent,
  initialMatchId,
  onMatchChange,
  onToggleHighlights,
  isHighlightsEnabled = true,
}: CheckAndTailorDrawerProps) {
  const [savedMatches, setSavedMatches] = useState<JobMatch[]>([]);
  const [savedJobs, setSavedJobs] = useState<JobDescription[]>([]);
  const [activeMatch, setActiveMatch] = useState<JobMatch | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(false);

  // Scanning & New JD Form State
  const [isAddingNewJob, setIsAddingNewJob] = useState(false);
  const [jobTitleInput, setJobTitleInput] = useState('');
  const [companyInput, setCompanyInput] = useState('');
  const [jdTextInput, setJdTextInput] = useState('');
  const [selectedExistingJdId, setSelectedExistingJdId] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanPhase, setScanPhase] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Accordion & AI Tailoring State
  const [isKeywordsOpen, setIsKeywordsOpen] = useState(true);
  const [isRequirementsOpen, setIsRequirementsOpen] = useState(false);
  const [isTailoring, setIsTailoring] = useState(false);
  const [tailorPlan, setTailorPlan] = useState<JobTailorSuggestionsResponse | null>(null);
  const [appliedHeadline, setAppliedHeadline] = useState(false);
  const [appliedSummary, setAppliedSummary] = useState(false);
  const [appliedBullets, setAppliedBullets] = useState<number[]>([]);

  // Load saved job matches & job descriptions when drawer opens
  useEffect(() => {
    if (!isOpen || !resumeId) return;
    let isMounted = true;

    async function loadMatchState() {
      setIsInitialLoading(true);
      setErrorMessage(null);
      try {
        const [matchesRes, jobsRes, explicitMatch] = await Promise.all([
          apiClient.listJobMatches(resumeId).catch(() => [] as JobMatch[]),
          apiClient.listJobDescriptions({ limit: 25 }).catch(() => [] as JobDescription[]),
          initialMatchId ? apiClient.getJobMatch(initialMatchId).catch(() => null) : Promise.resolve(null),
        ]);

        if (!isMounted) return;
        const jobList = Array.isArray(jobsRes) ? jobsRes : [];
        setSavedJobs(jobList);

        const combinedMatches = [...matchesRes];
        if (explicitMatch && !combinedMatches.some((m) => m.id === explicitMatch.id)) {
          combinedMatches.unshift(explicitMatch);
        }
        setSavedMatches(combinedMatches);

        if (explicitMatch) {
          setActiveMatch(explicitMatch);
          setIsAddingNewJob(false);
        } else if (combinedMatches.length > 0) {
          setActiveMatch((prev) => prev || combinedMatches[0]);
          setIsAddingNewJob(false);
        } else {
          setIsAddingNewJob(true);
        }
      } finally {
        if (isMounted) setIsInitialLoading(false);
      }
    }

    void loadMatchState();
    return () => {
      isMounted = false;
    };
  }, [isOpen, resumeId, initialMatchId]);

  // Extract dynamic keywords from active JobMatch & compute live status against current resumeContent
  const keywordAudit = useMemo(() => {
    if (!activeMatch) {
      return {
        items: [] as KeywordItem[],
        matchedCount: 0,
        liveScore: null as number | null,
        allKeywords: [] as string[],
      };
    }

    const corpus = buildResumeSearchCorpus(resumeContent);
    const seen = new Map<string, 'High' | 'Medium' | 'Low'>();

    const reqs = activeMatch.analysis?.matchedRequirements || [];
    const parsedReqs = activeMatch.jobDescription?.parsedRequirements || [];

    reqs.forEach((r) => {
      const priority = mapImportanceToPriority(r.importance);
      (r.keywords || []).forEach((kw) => {
        const clean = kw.trim();
        if (isValidSkillKeyword(clean) && !seen.has(clean.toLowerCase())) {
          seen.set(clean.toLowerCase(), priority);
        }
      });
    });

    parsedReqs.forEach((pr) => {
      const priority = mapImportanceToPriority(pr.importance);
      (pr.keywords || []).forEach((kw) => {
        const clean = kw.trim();
        if (isValidSkillKeyword(clean) && !seen.has(clean.toLowerCase())) {
          seen.set(clean.toLowerCase(), priority);
        }
      });
    });

    // Preserve original casing from source keywords
    const originalCasing = new Map<string, string>();
    reqs.forEach((r) => (r.keywords || []).forEach((k) => originalCasing.set(k.toLowerCase(), k.trim())));
    parsedReqs.forEach((pr) => (pr.keywords || []).forEach((k) => originalCasing.set(k.toLowerCase(), k.trim())));

    const items: KeywordItem[] = Array.from(seen.entries()).map(([lowerKw, priority]) => {
      const displayName = originalCasing.get(lowerKw) || lowerKw;
      const matched = corpus.includes(lowerKw);
      return { name: displayName, matched, priority };
    });

    // Sort: High Priority missing first, then matched
    const priorityRank = { High: 0, Medium: 1, Low: 2 };
    items.sort((a, b) => {
      if (a.matched !== b.matched) return a.matched ? 1 : -1;
      return priorityRank[a.priority] - priorityRank[b.priority];
    });

    const matchedCount = items.filter((i) => i.matched).length;
    const baseScore = activeMatch.score;
    const liveKeywordRatio = items.length > 0 ? Math.round((matchedCount / items.length) * 100) : baseScore;
    // Blend official AI match score with live keyword coverage delta
    const blendedLiveScore =
      items.length > 0 ? Math.min(100, Math.round(baseScore * 0.6 + liveKeywordRatio * 0.4)) : baseScore;

    return {
      items,
      matchedCount,
      liveScore: blendedLiveScore,
      allKeywords: items.map((i) => i.name),
    };
  }, [activeMatch, resumeContent]);

  // Sync active job keywords & live score back to editor canvas highlighter
  useEffect(() => {
    onMatchChange?.(keywordAudit.liveScore, keywordAudit.allKeywords);
  }, [keywordAudit.liveScore, keywordAudit.allKeywords, onMatchChange]);

  const runLiveMatchPipeline = useCallback(
    async (jobDescriptionId: string) => {
      setIsScanning(true);
      setScanPhase(1);
      setErrorMessage(null);
      setTailorPlan(null);
      setAppliedHeadline(false);
      setAppliedSummary(false);
      setAppliedBullets([]);

      const t1 = setTimeout(() => setScanPhase(2), 700);
      const t2 = setTimeout(() => setScanPhase(3), 1500);

      try {
        const match = await apiClient.createJobMatch({
          resumeId,
          jobDescriptionId,
        });
        setScanPhase(4);
        setActiveMatch(match);
        setSavedMatches((prev) => [match, ...prev.filter((m) => m.id !== match.id)]);
        setIsAddingNewJob(false);
      } catch (err: unknown) {
        setErrorMessage(err instanceof Error ? err.message : 'Job match evaluation failed.');
      } finally {
        clearTimeout(t1);
        clearTimeout(t2);
        setIsScanning(false);
      }
    },
    [resumeId],
  );

  const handleAnalyzeNewJd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jdTextInput.trim() || jdTextInput.trim().length < 30) {
      setErrorMessage('Please paste a job description (at least 30 characters).');
      return;
    }

    setIsScanning(true);
    setScanPhase(0);
    setErrorMessage(null);

    try {
      const jd = await apiClient.createJobDescription({
        title: jobTitleInput.trim() || 'Target Role',
        companyName: companyInput.trim() || undefined,
        originalText: jdTextInput.trim(),
      });
      setSavedJobs((prev) => [jd, ...prev]);
      await runLiveMatchPipeline(jd.id);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to parse job description.');
      setIsScanning(false);
    }
  };

  const handleMatchSavedJd = async () => {
    if (!selectedExistingJdId) return;
    await runLiveMatchPipeline(selectedExistingJdId);
  };

  const handleGenerateTailorPlan = async () => {
    if (!activeMatch) return;
    setIsTailoring(true);
    setErrorMessage(null);
    setAppliedHeadline(false);
    setAppliedSummary(false);
    setAppliedBullets([]);

    try {
      const plan = await apiClient.generateJobTailoring(activeMatch.id);
      setTailorPlan(plan);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to generate AI tailoring plan.');
    } finally {
      setIsTailoring(false);
    }
  };

  const handleAddVerifiedSkill = (skillName: string) => {
    onUpdateContent((prev) => {
      const existing = prev.skills || [];
      if (existing.some((s) => s.name.toLowerCase() === skillName.toLowerCase())) {
        return prev;
      }
      return {
        ...prev,
        skills: [...existing, { name: skillName, category: 'Technical' }],
      };
    });
  };

  const handleApplyHeadline = () => {
    if (!tailorPlan?.suggestedHeadline) return;
    onUpdateContent((prev) => ({
      ...prev,
      headline: tailorPlan.suggestedHeadline,
    }));
    setAppliedHeadline(true);
  };

  const handleApplySummary = () => {
    if (!tailorPlan?.suggestedSummary) return;
    onUpdateContent((prev) => ({
      ...prev,
      summary: tailorPlan.suggestedSummary,
    }));
    setAppliedSummary(true);
  };

  const handleApplyTailoredBullet = (originalBullet: string, tailoredBullet: string, idx: number) => {
    onUpdateContent((prev) => {
      const expList = (prev.experience || []).map((exp) => ({
        ...exp,
        bullets: (exp.bullets || []).map((b) => (b.trim() === originalBullet.trim() ? tailoredBullet : b)),
      }));
      return { ...prev, experience: expList };
    });
    setAppliedBullets((prev) => (prev.includes(idx) ? prev : [...prev, idx]));
  };

  if (!isOpen) return null;

  const displayScore = keywordAudit.liveScore ?? activeMatch?.score ?? 0;
  const activeJobTitle = activeMatch?.jobDescription?.title || 'Target Role';
  const activeCompany = activeMatch?.jobDescription?.companyName || 'Target Company';
  const requirementsList = activeMatch?.analysis?.matchedRequirements || [];

  return (
    <div id="check-tailor-drawer" className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Slide-in Left Drawer */}
      <div className="relative w-full max-w-[460px] bg-white dark:bg-zinc-900 h-full shadow-2xl border-r border-zinc-200 dark:border-zinc-800 flex flex-col z-10 animate-in slide-in-from-left duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
          <div className="flex items-center gap-2 font-bold text-sm text-zinc-900 dark:text-zinc-100">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>Check &amp; Tailor (Live JD Engine)</span>
            <span title="Backed by live Job Matching & Gemini AI">
              <Info className="w-3.5 h-3.5 text-zinc-400" />
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Close Check & Tailor"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300">
              {errorMessage}
            </div>
          )}

          {isInitialLoading ? (
            <div className="space-y-3 py-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-14 rounded-xl bg-zinc-100 dark:bg-zinc-800/60 animate-pulse border border-zinc-200/50 dark:border-zinc-700/40"
                />
              ))}
            </div>
          ) : isScanning ? (
            /* Live Multi-Phase Scan State */
            <div className="space-y-6 animate-in fade-in">
              <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/60 space-y-1">
                <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100 block">
                  {jobTitleInput || activeJobTitle}
                </span>
                <span className="text-[11px] text-zinc-500">
                  {companyInput || activeCompany} · Running Gemini Requirement Extraction
                </span>
              </div>

              <div className="space-y-3.5 pl-2">
                {[
                  'Parsing job description requirements...',
                  'Matching your verified skills & keywords...',
                  'Auditing experience bullets for evidence...',
                  'Computing ATS fit & gap priorities...',
                ].map((label, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-xs">
                    {scanPhase > idx ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : scanPhase === idx ? (
                      <RefreshCw className="w-4 h-4 text-blue-600 animate-spin shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-zinc-300 dark:border-zinc-700 shrink-0" />
                    )}
                    <span
                      className={
                        scanPhase >= idx
                          ? 'font-medium text-zinc-900 dark:text-zinc-100'
                          : 'text-zinc-400'
                      }
                    >
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : isAddingNewJob || !activeMatch ? (
            /* Live Job Description Input / Selector */
            <div className="space-y-5 animate-in fade-in">
              {savedMatches.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIsAddingNewJob(false)}
                  className="text-xs font-semibold text-blue-600 hover:underline"
                >
                  &larr; Back to active match ({activeJobTitle})
                </button>
              )}

              {savedJobs.length > 0 && (
                <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-950/50 space-y-2.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 block">
                    Select Saved Job Description
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={selectedExistingJdId}
                      onChange={(e) => setSelectedExistingJdId(e.target.value)}
                      className="flex-1 text-xs p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                    >
                      <option value="">Choose a saved job...</option>
                      {savedJobs.map((j) => (
                        <option key={j.id} value={j.id}>
                          {j.title} {j.companyName ? `— ${j.companyName}` : ''}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      disabled={!selectedExistingJdId}
                      onClick={() => void handleMatchSavedJd()}
                      className="px-3 py-1.5 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-semibold disabled:opacity-40 cursor-pointer"
                    >
                      Match
                    </button>
                  </div>
                </div>
              )}

              <form onSubmit={handleAnalyzeNewJd} className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    Scan New Job Description
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          const txt = await navigator.clipboard.readText();
                          if (txt.trim()) setJdTextInput(txt);
                        } catch {
                          // Clipboard unavailable
                        }
                      }}
                      className="inline-flex items-center gap-1 text-[11px] text-zinc-500 hover:text-blue-600 cursor-pointer"
                    >
                      <ClipboardPaste className="w-3 h-3" />
                      <span>Paste</span>
                    </button>
                    <button
                      type="button"
                      id="drawer-load-sample-jd"
                      onClick={() => {
                        setJobTitleInput(SAMPLE_JD_TITLE);
                        setCompanyInput(SAMPLE_JD_COMPANY);
                        setJdTextInput(SAMPLE_JD_TEXT);
                      }}
                      className="text-[11px] font-semibold text-blue-600 hover:underline cursor-pointer"
                    >
                      Load Sample JD
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <input
                    id="drawer-job-title"
                    type="text"
                    placeholder="Target Role (e.g. Senior Backend Engineer)"
                    value={jobTitleInput}
                    onChange={(e) => setJobTitleInput(e.target.value)}
                    className="text-xs p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  />
                  <input
                    id="drawer-company-name"
                    type="text"
                    placeholder="Company (e.g. Stripe)"
                    value={companyInput}
                    onChange={(e) => setCompanyInput(e.target.value)}
                    className="text-xs p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  />
                </div>

                <textarea
                  id="drawer-jd-textarea"
                  rows={8}
                  placeholder="Paste the full job description responsibilities & required skills here..."
                  value={jdTextInput}
                  onChange={(e) => setJdTextInput(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-600 leading-relaxed"
                />

                <button
                  id="drawer-run-match-btn"
                  type="submit"
                  disabled={jdTextInput.trim().length < 30}
                  className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs disabled:opacity-50 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Scan &amp; Match Resume to JD</span>
                </button>
              </form>
            </div>
          ) : (
            /* Live Match Report & Tailoring Workspace */
            <div className="space-y-5 animate-in fade-in">
              {/* Saved Matches Selector if multiple exist */}
              {savedMatches.length > 1 && (
                <div className="flex items-center gap-2 text-xs">
                  <Briefcase className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                  <select
                    value={activeMatch.id}
                    onChange={(e) => {
                      const found = savedMatches.find((m) => m.id === e.target.value);
                      if (found) {
                        setActiveMatch(found);
                        setTailorPlan(null);
                      }
                    }}
                    className="flex-1 text-xs p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  >
                    {savedMatches.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.jobDescription?.title || 'Target Role'}{' '}
                        {m.jobDescription?.companyName ? `@ ${m.jobDescription.companyName}` : ''} ({m.score}%)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Job Match Score Card */}
              <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                    Live ATS Job Match
                  </span>
                  <span className="text-[11px] text-zinc-500 font-medium">
                    Ready to apply at 85%
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-baseline gap-2">
                    <span
                      id="drawer-live-match-score"
                      className={`text-3xl font-extrabold font-mono ${
                        displayScore >= 80
                          ? 'text-emerald-600'
                          : displayScore >= 60
                          ? 'text-amber-600'
                          : 'text-rose-600'
                      }`}
                    >
                      {displayScore}%
                    </span>
                    {keywordAudit.items.length > 0 && (
                      <span className="text-[11px] text-zinc-500 font-medium">
                        ({keywordAudit.matchedCount}/{keywordAudit.items.length} keywords)
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => void runLiveMatchPipeline(activeMatch.jobDescriptionId)}
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs flex items-center gap-1 font-medium transition-colors cursor-pointer"
                    title="Re-evaluate with AI and persist new score"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Re-evaluate</span>
                  </button>
                </div>

                {/* Progress Bar with 85% Benchmark Line */}
                <div className="relative w-full h-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      displayScore >= 80
                        ? 'bg-emerald-600'
                        : displayScore >= 60
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                    style={{ width: `${Math.min(100, displayScore)}%` }}
                  />
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-zinc-900 dark:bg-zinc-100 z-10"
                    style={{ left: '85%' }}
                    title="Target: 85%"
                  />
                </div>
              </div>

              {/* Active Target Role Card */}
              <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/60 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100 truncate">
                    {activeJobTitle}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 flex items-center gap-1 shrink-0">
                    <Bookmark className="w-3 h-3 fill-current" />
                    Active Target
                  </span>
                </div>
                <div className="text-[11px] text-zinc-500 flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-zinc-700 dark:text-zinc-300">{activeCompany}</span>
                  <span>•</span>
                  <Link
                    href="/app/applications"
                    className="text-blue-600 font-medium hover:underline inline-flex items-center gap-0.5"
                  >
                    <span>Job Tracker</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </Link>
                  <span>•</span>
                  <Link
                    href={`/app/match?resumeId=${resumeId}`}
                    className="text-zinc-600 dark:text-zinc-400 hover:underline"
                  >
                    Full Report
                  </Link>
                </div>
              </div>

              {/* Switch / Scan Another Job */}
              <button
                type="button"
                onClick={() => setIsAddingNewJob(true)}
                className="w-full py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:text-blue-600 flex items-center justify-center gap-1.5 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg transition-colors hover:border-blue-400 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Match another job description</span>
              </button>

              {/* Real AI Tailoring Engine Card */}
              <div className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-800/60 bg-gradient-to-br from-blue-50/70 to-indigo-50/40 dark:from-blue-950/25 dark:to-indigo-950/15 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Wand2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
                      AI Tailor to This Job
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                    Evidence-Grounded
                  </span>
                </div>

                <button
                  id="drawer-generate-tailor-plan-btn"
                  type="button"
                  disabled={isTailoring}
                  onClick={() => void handleGenerateTailorPlan()}
                  className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isTailoring ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}
                  <span>
                    {isTailoring
                      ? 'Generating Grounded Edits...'
                      : tailorPlan
                      ? 'Regenerate AI Tailoring Plan'
                      : 'Generate AI Tailoring Plan'}
                  </span>
                </button>

                {!tailorPlan && (
                  <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    Synthesizes a tailored headline, summary, and bullet phrasing using only your verified skills and work history.
                  </p>
                )}

                {tailorPlan && (
                  <div id="drawer-tailor-plan-results" className="space-y-3 pt-2 border-t border-indigo-200/60 dark:border-indigo-800/50">
                    {tailorPlan.factualVerificationNotes && (
                      <div className="p-2 rounded-lg bg-emerald-50/90 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[10.5px] text-emerald-800 dark:text-emerald-200 flex items-start gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{tailorPlan.factualVerificationNotes}</span>
                      </div>
                    )}

                    {/* Tailored Headline Suggestion */}
                    <div className="p-2.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10.5px] font-bold uppercase text-zinc-500">Suggested Headline</span>
                        <button
                          type="button"
                          onClick={handleApplyHeadline}
                          disabled={appliedHeadline}
                          className="text-[11px] font-semibold px-2 py-0.5 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:bg-emerald-600 cursor-pointer"
                        >
                          {appliedHeadline ? 'Applied ✓' : 'Apply'}
                        </button>
                      </div>
                      <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                        {tailorPlan.suggestedHeadline}
                      </p>
                    </div>

                    {/* Tailored Summary Suggestion */}
                    <div className="p-2.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10.5px] font-bold uppercase text-zinc-500">Suggested Summary</span>
                        <button
                          type="button"
                          onClick={handleApplySummary}
                          disabled={appliedSummary}
                          className="text-[11px] font-semibold px-2 py-0.5 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:bg-emerald-600 cursor-pointer"
                        >
                          {appliedSummary ? 'Applied ✓' : 'Apply'}
                        </button>
                      </div>
                      <p className="text-[11.5px] text-zinc-700 dark:text-zinc-300 leading-relaxed">
                        {tailorPlan.suggestedSummary}
                      </p>
                    </div>

                    {/* Grounded Bullet Improvements */}
                    {tailorPlan.bulletImprovements && tailorPlan.bulletImprovements.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-[10.5px] font-bold uppercase text-zinc-500 block">
                          Suggested Bullet Adjustments
                        </span>
                        {tailorPlan.bulletImprovements.map((item, bIdx) => {
                          const isApplied = appliedBullets.includes(bIdx);
                          return (
                            <div
                              key={bIdx}
                              className="p-2.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 space-y-1.5"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-[10px] font-semibold text-zinc-500 truncate">
                                  {item.company}
                                </span>
                                <button
                                  type="button"
                                  disabled={isApplied}
                                  onClick={() =>
                                    handleApplyTailoredBullet(item.originalBullet, item.tailoredBullet, bIdx)
                                  }
                                  className="text-[11px] font-semibold px-2 py-0.5 rounded bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-emerald-600 shrink-0 cursor-pointer"
                                >
                                  {isApplied ? 'Applied ✓' : 'Apply to Bullet'}
                                </button>
                              </div>
                              <p className="text-[11px] text-zinc-900 dark:text-zinc-100 leading-relaxed">
                                {item.tailoredBullet}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Keyword Highlights Toggle Pill */}
              <div className="flex items-center justify-between p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                  <span className="font-medium text-zinc-800 dark:text-zinc-200">
                    Highlight Target JD Keywords on Canvas
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onToggleHighlights?.(!isHighlightsEnabled)}
                  className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                    isHighlightsEnabled ? 'bg-rose-500' : 'bg-zinc-300 dark:bg-zinc-700'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform ${
                      isHighlightsEnabled ? 'left-4.5' : 'left-0.5'
                    }`}
                  />
                </button>
              </div>

              {/* Dynamic Live ATS Keywords Accordion */}
              <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-900 shadow-xs">
                <button
                  type="button"
                  onClick={() => setIsKeywordsOpen(!isKeywordsOpen)}
                  className="w-full px-4 py-3 flex items-center justify-between font-bold text-xs text-zinc-900 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer"
                >
                  <span>
                    ATS Keywords ({keywordAudit.matchedCount}/{keywordAudit.items.length} matched)
                  </span>
                  {isKeywordsOpen ? (
                    <ChevronUp className="w-4 h-4 text-zinc-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-zinc-400" />
                  )}
                </button>

                {isKeywordsOpen && (
                  <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 space-y-2.5">
                    {keywordAudit.items.length === 0 ? (
                      <p className="text-xs text-zinc-500">
                        No keywords extracted for this job description yet. Click Re-evaluate above.
                      </p>
                    ) : (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-400 pb-1 border-b border-zinc-100 dark:border-zinc-800">
                          <span>Keyword</span>
                          <div className="flex items-center gap-3">
                            <span>Status / Action</span>
                            <span className="w-14 text-right">Priority</span>
                          </div>
                        </div>

                        {keywordAudit.items.map((kw, idx) => (
                          <div
                            key={`${kw.name}-${idx}`}
                            className="flex items-center justify-between text-xs py-1.5 border-b border-zinc-50 dark:border-zinc-800/40 gap-2"
                          >
                            <span className="font-medium text-zinc-800 dark:text-zinc-200 truncate">
                              {kw.name}
                            </span>
                            <div className="flex items-center gap-2.5 shrink-0">
                              {kw.matched ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Matched</span>
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleAddVerifiedSkill(kw.name)}
                                  className="inline-flex items-center gap-0.5 text-[10.5px] font-semibold px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 cursor-pointer"
                                  title="Only click if you truly have experience with this skill"
                                >
                                  <Plus className="w-3 h-3" />
                                  <span>Add Skill</span>
                                </button>
                              )}
                              <span
                                className={`w-14 text-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${
                                  kw.priority === 'High'
                                    ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200/60'
                                    : kw.priority === 'Medium'
                                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200/60'
                                    : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                                }`}
                              >
                                {kw.priority}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Requirement-Level Evidence Breakdown Accordion */}
              {requirementsList.length > 0 && (
                <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-900 shadow-xs">
                  <button
                    type="button"
                    onClick={() => setIsRequirementsOpen(!isRequirementsOpen)}
                    className="w-full px-4 py-3 flex items-center justify-between font-bold text-xs text-zinc-900 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer"
                  >
                    <span>Requirement Evidence Audit ({requirementsList.length})</span>
                    {isRequirementsOpen ? (
                      <ChevronUp className="w-4 h-4 text-zinc-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-zinc-400" />
                    )}
                  </button>

                  {isRequirementsOpen && (
                    <div className="p-3.5 border-t border-zinc-100 dark:border-zinc-800 space-y-2.5 max-h-72 overflow-y-auto">
                      {requirementsList.map((req, rIdx) => (
                        <div
                          key={`${req.requirementId}-${rIdx}`}
                          className="p-2.5 rounded-lg border border-zinc-100 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/30 text-[11px] space-y-1"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                              {req.text || req.explanation}
                            </span>
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-semibold shrink-0 ${
                                req.status === 'supported'
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : req.status === 'needs_confirmation'
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-rose-100 text-rose-700'
                              }`}
                            >
                              {req.status === 'supported'
                                ? 'Verified'
                                : req.status === 'needs_confirmation'
                                ? 'Confirm'
                                : 'Gap'}
                            </span>
                          </div>
                          {req.suggestedAction && (
                            <p className="text-zinc-500 dark:text-zinc-400">{req.suggestedAction}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
