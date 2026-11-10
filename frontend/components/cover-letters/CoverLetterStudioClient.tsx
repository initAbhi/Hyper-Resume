'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  AlertCircle,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Copy,
  Download,
  FileText,
  Loader2,
  Mail,
  Plus,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  apiClient,
  downloadExportBlob,
  type CoverLetter,
  type CoverLetterSectionFocus,
  type CoverLetterTemplateKey,
  type CoverLetterTone,
  type JobMatch,
  type Resume,
} from '@/lib/api-client';
import {
  collectCoverLetterDocumentStyles,
  countCoverLetterWords,
  estimateReadTimeLabel,
  formatCoverLetterPlainText,
  serializeCoverLetterDocumentHtml,
} from '@/lib/cover-letter-utils';
import CoverLetterDocumentPreview from '@/components/cover-letters/CoverLetterDocumentPreview';

const TONE_OPTIONS: Array<{
  value: CoverLetterTone;
  label: string;
  desc: string;
}> = [
  {
    value: 'Executive',
    label: 'Executive',
    desc: 'Strategic ownership & business impact',
  },
  {
    value: 'Technical',
    label: 'Technical',
    desc: 'Systems depth, scale & architecture',
  },
  {
    value: 'Enthusiastic',
    label: 'Enthusiastic',
    desc: 'Mission-driven energy & growth fit',
  },
  {
    value: 'Concise',
    label: 'Concise',
    desc: 'Crisp <220-word recruiter summary',
  },
];

const TEMPLATE_OPTIONS: Array<{ value: CoverLetterTemplateKey; label: string }> = [
  { value: 'executive', label: 'Executive' },
  { value: 'modern', label: 'Modern' },
  { value: 'classic', label: 'Classic' },
];

const ACCENT_COLORS = [
  '#285FEA',
  '#0F172A',
  '#059669',
  '#4F46E5',
  '#7C3AED',
];

export default function CoverLetterStudioClient() {
  const searchParams = useSearchParams();
  const queryResumeId = searchParams.get('resumeId') || '';
  const queryMatchId = searchParams.get('matchId') || '';

  const [resumes, setResumes] = useState<Resume[]>([]);
  const [matches, setMatches] = useState<JobMatch[]>([]);
  const [letters, setLetters] = useState<CoverLetter[]>([]);
  const [activeLetterId, setActiveLetterId] = useState<string | null>(null);
  const [leftTab, setLeftTab] = useState<'generate' | 'edit'>('generate');

  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [regeneratingSection, setRegeneratingSection] =
    useState<CoverLetterSectionFocus | null>(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isExportingDocx, setIsExportingDocx] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>(
    'saved',
  );
  const [copiedNotice, setCopiedNotice] = useState(false);
  const [pdfMetaNotice, setPdfMetaNotice] = useState<string | null>(null);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [showHeaderDetails, setShowHeaderDetails] = useState(false);

  // Generator Form Fields
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [selectedJobMatchId, setSelectedJobMatchId] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [hiringManager, setHiringManager] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [selectedTone, setSelectedTone] = useState<CoverLetterTone>('Executive');
  const [customFocus, setCustomFocus] = useState('');

  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);

  const activeLetter = useMemo(
    () => letters.find((l) => l.id === activeLetterId) || null,
    [letters, activeLetterId],
  );

  const selectedResume = useMemo(
    () => resumes.find((r) => r.id === selectedResumeId) || resumes[0] || null,
    [resumes, selectedResumeId],
  );

  useEffect(() => {
    let mounted = true;

    async function loadStudioData() {
      setIsLoading(true);
      setErrorBanner(null);

      try {
        const [resumesRes, lettersRes, matchesRes] = await Promise.allSettled([
          apiClient.listResumes({ limit: 50 }),
          apiClient.listCoverLetters(),
          apiClient.listJobMatches(),
        ]);

        if (!mounted) return;

        let loadedResumes: Resume[] = [];
        if (resumesRes.status === 'fulfilled') {
          const val = resumesRes.value as Resume[] | { items: Resume[] };
          loadedResumes = Array.isArray(val) ? val : val?.items || [];
          setResumes(loadedResumes);
        }

        const defaultResume =
          loadedResumes.find((r) => r.id === queryResumeId) ||
          loadedResumes.find((r) => r.isMaster) ||
          loadedResumes[0];
        if (defaultResume) {
          setSelectedResumeId(defaultResume.id);
          const headlineRole =
            defaultResume.content?.headline?.split('|')[0]?.trim() || '';
          if (headlineRole) {
            setTargetRole((prev) => prev || headlineRole);
          }
        }

        if (matchesRes.status === 'fulfilled') {
          const loadedMatches = matchesRes.value || [];
          setMatches(loadedMatches);
          if (queryMatchId) {
            const targetMatch = loadedMatches.find((m) => m.id === queryMatchId);
            if (targetMatch) {
              setSelectedJobMatchId(targetMatch.id);
              if (targetMatch.jobDescription?.title) {
                setTargetRole(targetMatch.jobDescription.title);
              }
              if (targetMatch.jobDescription?.companyName) {
                setCompanyName(targetMatch.jobDescription.companyName);
              }
              if (targetMatch.jobDescription?.originalText) {
                setJobDescription(targetMatch.jobDescription.originalText);
              }
            }
          }
        }

        if (lettersRes.status === 'fulfilled') {
          const loadedLetters = lettersRes.value || [];
          setLetters(loadedLetters);
          if (loadedLetters.length > 0 && !queryMatchId) {
            setActiveLetterId(loadedLetters[0].id);
            setLeftTab('edit');
          } else {
            setLeftTab('generate');
          }
        }
      } catch (err) {
        if (mounted) {
          setErrorBanner(
            err instanceof Error
              ? err.message
              : 'Failed to load Cover Letter Studio data.',
          );
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    loadStudioData();
    return () => {
      mounted = false;
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [queryResumeId, queryMatchId]);

  const buildCoverLetterPatch = useCallback((patch: Partial<CoverLetter>) => ({
    title: patch.title,
    targetRole: patch.targetRole,
    companyName: patch.companyName,
    hiringManager: patch.hiringManager ?? undefined,
    tone: patch.tone,
    templateKey: patch.templateKey,
    accentColor: patch.accentColor,
    senderName: patch.senderName,
    senderEmail: patch.senderEmail ?? undefined,
    senderPhone: patch.senderPhone ?? undefined,
    senderLocation: patch.senderLocation ?? undefined,
    recipientLine: patch.recipientLine ?? undefined,
    salutation: patch.salutation,
    openingParagraph: patch.openingParagraph,
    bodyParagraphs: patch.bodyParagraphs,
    closingParagraph: patch.closingParagraph,
    signOff: patch.signOff,
  }), []);

  const scheduleAutosave = useCallback(
    (letterId: string, patch: Partial<CoverLetter>) => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      setSaveStatus('unsaved');
      saveTimerRef.current = setTimeout(async () => {
        setSaveStatus('saving');
        try {
          await apiClient.updateCoverLetter(
            letterId,
            buildCoverLetterPatch(patch),
          );
          setSaveStatus('saved');
        } catch {
          setSaveStatus('unsaved');
        }
      }, 650);
    },
    [buildCoverLetterPatch],
  );

  const updateActiveLetterField = (updater: (prev: CoverLetter) => CoverLetter) => {
    if (!activeLetter) return;
    const updated = updater(activeLetter);
    setLetters((prev) =>
      prev.map((item) => (item.id === updated.id ? updated : item)),
    );
    scheduleAutosave(updated.id, updated);
  };

  const handleJobMatchChange = (matchId: string) => {
    setSelectedJobMatchId(matchId);
    const match = matches.find((m) => m.id === matchId);
    if (!match?.jobDescription) return;
    if (match.jobDescription.title) setTargetRole(match.jobDescription.title);
    if (match.jobDescription.companyName)
      setCompanyName(match.jobDescription.companyName);
    if (match.jobDescription.originalText)
      setJobDescription(match.jobDescription.originalText);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResumeId) {
      setErrorBanner('Create or select a resume first so we can ground your cover letter in real experience.');
      return;
    }
    if (!targetRole.trim() || !companyName.trim()) {
      setErrorBanner('Target Role and Company Name are required.');
      return;
    }

    setErrorBanner(null);
    setPdfMetaNotice(null);
    setIsGenerating(true);

    try {
      const created = await apiClient.generateCoverLetter({
        resumeId: selectedResumeId,
        targetRole: targetRole.trim(),
        companyName: companyName.trim(),
        hiringManager: hiringManager.trim() || undefined,
        jobDescription: jobDescription.trim() || undefined,
        jobMatchId: selectedJobMatchId || undefined,
        tone: selectedTone,
        templateKey: activeLetter?.templateKey || 'executive',
        accentColor: activeLetter?.accentColor || '#285FEA',
        customFocus: customFocus.trim() || undefined,
      });

      setLetters((prev) => [created, ...prev]);
      setActiveLetterId(created.id);
      setLeftTab('edit');
      setSaveStatus('saved');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setErrorBanner(
        err instanceof Error
          ? err.message
          : 'Failed to generate cover letter.',
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerateSection = async (
    sectionFocus: CoverLetterSectionFocus,
    toneOverride?: CoverLetterTone,
  ) => {
    if (!activeLetter) return;
    setErrorBanner(null);
    setRegeneratingSection(sectionFocus);

    try {
      const updated = await apiClient.regenerateCoverLetter(activeLetter.id, {
        sectionFocus,
        tone: toneOverride || activeLetter.tone,
        jobDescription: activeLetter.jobDescription || jobDescription.trim() || undefined,
        hiringManager: activeLetter.hiringManager || undefined,
        customFocus: customFocus.trim() || undefined,
      });
      setLetters((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item)),
      );
      setSaveStatus('saved');
    } catch (err) {
      setErrorBanner(
        err instanceof Error
          ? err.message
          : 'Unable to regenerate section right now.',
      );
    } finally {
      setRegeneratingSection(null);
    }
  };

  const handleImmediateStyleUpdate = async (
    patch: Partial<Pick<CoverLetter, 'templateKey' | 'accentColor'>>,
  ) => {
    if (!activeLetter) return;
    const optimistic = { ...activeLetter, ...patch };
    setLetters((prev) =>
      prev.map((item) => (item.id === optimistic.id ? optimistic : item)),
    );
    setSaveStatus('saving');
    try {
      const saved = await apiClient.updateCoverLetter(activeLetter.id, patch);
      setLetters((prev) =>
        prev.map((item) => (item.id === saved.id ? saved : item)),
      );
      setSaveStatus('saved');
    } catch {
      setSaveStatus('unsaved');
    }
  };

  const handleCopyPlainText = async () => {
    if (!activeLetter) return;
    const text = formatCoverLetterPlainText(activeLetter);
    let copied = false;

    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        copied = true;
      } catch {
        // Fall through to execCommand fallback
      }
    }

    if (!copied && typeof document !== 'undefined') {
      try {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        copied = document.execCommand('copy');
        textarea.remove();
      } catch {
        copied = false;
      }
    }

    if (copied) {
      setCopiedNotice(true);
      setTimeout(() => setCopiedNotice(false), 2400);
    } else {
      setErrorBanner('Clipboard access is blocked by your browser settings.');
    }
  };

  const handleDownloadPdf = async () => {
    if (!activeLetter) return;
    setIsExportingPdf(true);
    setErrorBanner(null);
    setPdfMetaNotice(null);

    try {
      const origin = window.location.origin;
      const html = serializeCoverLetterDocumentHtml(
        'cover-letter-document-print',
        origin,
      );
      const styles = collectCoverLetterDocumentStyles(origin);
      const safeName = `${activeLetter.companyName} - ${activeLetter.targetRole} Cover Letter`;

      const result = await apiClient.exportCoverLetterPdf(activeLetter.id, {
        html,
        styles,
        pageSize: 'A4',
        fileName: safeName,
        htmlClassName: document.documentElement.className,
      });

      downloadExportBlob(result.blob, result.fileName, '.pdf');

      const kb = (result.sizeBytes / 1024).toFixed(1);
      setPdfMetaNotice(
        `${result.atsVerified ? 'ATS Vector PDF Verified' : 'PDF Exported'} · ${result.pageCount} page · ${result.extractableWords} words · ${kb} KB`,
      );
    } catch (err) {
      setErrorBanner(
        err instanceof Error
          ? err.message
          : 'Failed to export vector PDF.',
      );
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleDownloadDocx = async () => {
    if (!activeLetter || isExportingDocx) return;
    setIsExportingDocx(true);
    setErrorBanner(null);
    setPdfMetaNotice(null);

    try {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
        await apiClient.updateCoverLetter(
          activeLetter.id,
          buildCoverLetterPatch(activeLetter),
        );
        setSaveStatus('saved');
      }

      const safeName = `${activeLetter.companyName} - ${activeLetter.targetRole} Cover Letter`;
      const result = await apiClient.exportCoverLetterDocx(activeLetter.id, {
        fileName: safeName,
      });
      downloadExportBlob(result.blob, result.fileName, '.docx');

      const kb = (result.sizeBytes / 1024).toFixed(1);
      setPdfMetaNotice(
        `${result.atsVerified ? 'ATS Word (.docx) Verified' : 'Word (.docx) Exported'} · ${result.extractableWords} words · ${kb} KB`,
      );
    } catch (err) {
      setErrorBanner(
        err instanceof Error
          ? err.message
          : 'Failed to export Word (.docx).',
      );
    } finally {
      setIsExportingDocx(false);
    }
  };

  const handleDeleteLetter = async (id: string) => {
    setIsDeleting(true);
    setErrorBanner(null);
    try {
      await apiClient.deleteCoverLetter(id);
      const remaining = letters.filter((l) => l.id !== id);
      setLetters(remaining);
      setConfirmDeleteId(null);
      if (activeLetterId === id) {
        const next = remaining[0] || null;
        setActiveLetterId(next?.id || null);
        setLeftTab(next ? 'edit' : 'generate');
      }
    } catch (err) {
      setErrorBanner(
        err instanceof Error ? err.message : 'Failed to delete cover letter.',
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const wordCount = activeLetter ? countCoverLetterWords(activeLetter) : 0;
  const readTime = estimateReadTimeLabel(wordCount);

  // Dynamic blueprint preview when user hasn't picked a generated letter yet
  const blueprintLetter: CoverLetter = useMemo(() => {
    const contact = selectedResume?.content?.contact;
    const roleLabel = targetRole.trim() || 'Senior Software Engineer';
    const companyLabel = companyName.trim() || 'Target Company';
    const managerLabel = hiringManager.trim();
    return {
      id: 'preview-blueprint',
      userId: 'preview',
      title: `${companyLabel} — ${roleLabel}`,
      targetRole: roleLabel,
      companyName: companyLabel,
      hiringManager: managerLabel || null,
      tone: selectedTone,
      templateKey: 'executive',
      accentColor: '#285FEA',
      senderName: contact?.fullName || 'Your Name',
      senderEmail: contact?.email || 'you@example.com',
      senderPhone: contact?.phone || null,
      senderLocation: contact?.location || null,
      recipientLine: managerLabel
        ? `${managerLabel} — ${companyLabel}`
        : `${companyLabel} Hiring Team`,
      salutation: managerLabel
        ? `Dear ${managerLabel},`
        : `Dear ${companyLabel} Hiring Team,`,
      openingParagraph:
        'Your AI-tailored opening hook will lead with a high-impact, factual achievement aligned directly to the target role without inventing skills or metrics.',
      bodyParagraphs: [
        'Body paragraph 1 maps your highest-leverage production work and verified scale metrics from your selected resume directly to this company’s core priorities.',
        'Body paragraph 2 highlights relevant technical breadth, architecture leadership, or cross-functional impact drawn exclusively from your career history.',
      ],
      closingParagraph:
        'Your concise closing call-to-action invites an introductory conversation while matching your chosen Executive, Technical, Enthusiastic, or Concise tone.',
      signOff: 'Sincerely,',
      highlightedKeywords: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }, [selectedResume, targetRole, companyName, hiringManager, selectedTone]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto py-16 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-[#285FEA]" />
        <p className="text-xs font-medium text-zinc-500">
          Loading AI Cover Letter Studio...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto space-y-5">
      {/* Studio Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E2E5E9] dark:border-[#252A33] pb-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center shrink-0">
            <Mail className="w-5 h-5 text-[#285FEA]" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                AI Cover Letter Studio
              </h1>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                {letters.length} saved
              </span>
              {activeLetter && (
                <span
                  data-testid="cl-save-status"
                  className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                    saveStatus === 'saved'
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                      : saveStatus === 'saving'
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300'
                        : 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300'
                  }`}
                >
                  {saveStatus === 'saved'
                    ? 'Saved ✓'
                    : saveStatus === 'saving'
                      ? 'Saving...'
                      : 'Unsaved'}
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Draft factual, job-tailored cover letters grounded strictly in your verified resume history &amp; export clean ATS PDFs.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            id="new-cover-letter-btn"
            variant={leftTab === 'generate' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setLeftTab('generate')}
            className="gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            New Cover Letter
          </Button>
        </div>
      </div>

      {/* Saved Cover Letters Library Switcher */}
      {letters.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 shrink-0">
            Your Letters:
          </span>
          {letters.map((letter) => {
            const isSelected = activeLetter?.id === letter.id;
            return (
              <button
                key={letter.id}
                type="button"
                data-testid={`cl-library-item-${letter.id}`}
                onClick={() => {
                  setActiveLetterId(letter.id);
                  setLeftTab('edit');
                  setConfirmDeleteId(null);
                  setPdfMetaNotice(null);
                }}
                className={`shrink-0 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[#285FEA] bg-blue-50/70 text-[#285FEA] dark:bg-blue-950/40 dark:text-blue-300'
                    : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300'
                }`}
              >
                <FileText className="w-3.5 h-3.5 shrink-0" />
                <span className="max-w-[220px] truncate">{letter.title}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                  {letter.tone}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {errorBanner && (
        <div className="rounded-xl border border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/40 p-3 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorBanner}</span>
        </div>
      )}

      {/* Main Split Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Pane: Generator Setup OR Live Structured Section Editor */}
        <div className="lg:col-span-5 bg-white dark:bg-[#14171C] border border-[#E2E5E9] dark:border-[#252A33] rounded-2xl shadow-xs overflow-hidden">
          {activeLetter && (
            <div className="grid grid-cols-2 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/50 p-1.5 gap-1.5">
              <button
                type="button"
                data-testid="cl-tab-edit"
                onClick={() => setLeftTab('edit')}
                className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  leftTab === 'edit'
                    ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs'
                    : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400'
                }`}
              >
                Edit &amp; Refine Active
              </button>
              <button
                type="button"
                data-testid="cl-tab-generate"
                onClick={() => setLeftTab('generate')}
                className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  leftTab === 'generate'
                    ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs'
                    : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400'
                }`}
              >
                + Generate New Draft
              </button>
            </div>
          )}

          {leftTab === 'generate' || !activeLetter ? (
            <form onSubmit={handleGenerate} className="p-5 space-y-4">
              <div className="space-y-1">
                <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#285FEA]" />
                  Generate Tailored Cover Letter
                </h2>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Pulls verified skills, employers, and metrics from your chosen resume.
                </p>
              </div>

              {/* Source Resume Selector */}
              <div>
                <label
                  htmlFor="cl-resume-select"
                  className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1"
                >
                  Source Resume
                </label>
                <select
                  id="cl-resume-select"
                  value={selectedResumeId}
                  onChange={(e) => setSelectedResumeId(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#285FEA]"
                >
                  {resumes.length === 0 ? (
                    <option value="">No resumes found — create one first</option>
                  ) : (
                    resumes.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                        {r.isMaster ? ' (Master)' : ''}
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* Optional Job Match Preset */}
              {matches.length > 0 && (
                <div>
                  <label
                    htmlFor="cl-job-match-select"
                    className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1"
                  >
                    Import from Saved Job Match (Optional)
                  </label>
                  <select
                    id="cl-job-match-select"
                    value={selectedJobMatchId}
                    onChange={(e) => handleJobMatchChange(e.target.value)}
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#285FEA]"
                  >
                    <option value="">— Enter role &amp; JD manually —</option>
                    {matches.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.jobDescription?.title || 'Job Match'}
                        {m.jobDescription?.companyName
                          ? ` @ ${m.jobDescription.companyName}`
                          : ''}{' '}
                        ({m.score}% match)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Target Role & Company */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="cl-target-role"
                    className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1"
                  >
                    Target Role *
                  </label>
                  <input
                    id="cl-target-role"
                    type="text"
                    required
                    placeholder="e.g. Staff Backend Engineer"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#285FEA]"
                  />
                </div>
                <div>
                  <label
                    htmlFor="cl-company-name"
                    className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1"
                  >
                    Company Name *
                  </label>
                  <input
                    id="cl-company-name"
                    type="text"
                    required
                    placeholder="e.g. Stripe"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#285FEA]"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="cl-hiring-manager"
                  className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1"
                >
                  Hiring Manager / Team Name (Optional)
                </label>
                <input
                  id="cl-hiring-manager"
                  type="text"
                  placeholder="Defaults cleanly to Hiring Team if left blank"
                  value={hiringManager}
                  onChange={(e) => setHiringManager(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#285FEA]"
                />
              </div>

              {/* Writing Tone Selector */}
              <div className="space-y-1.5">
                <span className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Writing Tone
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {TONE_OPTIONS.map((t) => {
                    const active = selectedTone === t.value;
                    return (
                      <button
                        key={t.value}
                        type="button"
                        data-testid={`cl-tone-${t.value}`}
                        onClick={() => setSelectedTone(t.value)}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          active
                            ? 'border-[#285FEA] bg-blue-50/70 dark:bg-blue-950/40 ring-1 ring-[#285FEA]/20'
                            : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'
                        }`}
                      >
                        <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                          {t.label}
                        </p>
                        <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                          {t.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Job Description */}
              <div>
                <label
                  htmlFor="cl-job-description"
                  className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1"
                >
                  Target Job Description (Recommended)
                </label>
                <textarea
                  id="cl-job-description"
                  rows={4}
                  placeholder="Paste the job posting so AI aligns your real achievements and keywords..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#285FEA] leading-relaxed"
                />
              </div>

              <div>
                <label
                  htmlFor="cl-custom-focus"
                  className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1"
                >
                  Special Emphasis Note (Optional)
                </label>
                <input
                  id="cl-custom-focus"
                  type="text"
                  placeholder="e.g. Emphasize event-driven payment ledger & PostgreSQL latency work"
                  value={customFocus}
                  onChange={(e) => setCustomFocus(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#285FEA]"
                />
              </div>

              <button
                id="generate-cover-letter-btn"
                type="submit"
                disabled={isGenerating || !selectedResumeId}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#285FEA] hover:bg-[#1E4FD6] text-white text-xs font-semibold px-4 py-3 shadow-sm transition-colors disabled:opacity-60 cursor-pointer"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Crafting Tailored Cover Letter with Gemini AI...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate Tailored Cover Letter
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Live Structured Section Editor */
            <div className="p-5 space-y-4">
              {/* Document Title & Tone Regenerator */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <label
                    htmlFor="cl-edit-title"
                    className="text-xs font-bold text-zinc-700 dark:text-zinc-300"
                  >
                    Letter Title
                  </label>
                  {activeLetter.provider && (
                    <span className="text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800">
                      {activeLetter.provider === 'gemini' ? 'Gemini AI' : 'Smart Draft'}
                    </span>
                  )}
                </div>
                <input
                  id="cl-edit-title"
                  type="text"
                  value={activeLetter.title}
                  onChange={(e) =>
                    updateActiveLetterField((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  className="w-full text-xs font-medium px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#285FEA]"
                />
              </div>

              {/* Switch Tone & Whole-Letter Regenerate */}
              <div className="rounded-xl border border-indigo-200/80 dark:border-indigo-900/60 bg-indigo-50/50 dark:bg-indigo-950/25 p-3 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200">
                    Switch Tone &amp; Regenerate
                  </span>
                  <button
                    type="button"
                    data-testid="cl-regenerate-all-btn"
                    disabled={regeneratingSection !== null}
                    onClick={() => handleRegenerateSection('all')}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 cursor-pointer disabled:opacity-50"
                  >
                    {regeneratingSection === 'all' ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <RefreshCw className="w-3 h-3" />
                    )}
                    Rewrite Full Letter
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {TONE_OPTIONS.map((t) => {
                    const active = activeLetter.tone === t.value;
                    return (
                      <button
                        key={t.value}
                        type="button"
                        disabled={regeneratingSection !== null}
                        onClick={() => handleRegenerateSection('all', t.value)}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors cursor-pointer ${
                          active
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:border-indigo-400'
                        }`}
                      >
                        {t.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Collapsible Header & Sender Contact Details */}
              <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowHeaderDetails((v) => !v)}
                  className="w-full px-3.5 py-2.5 flex items-center justify-between text-xs font-semibold text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800/40 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  <span>Sender Contact &amp; Addressing Details</span>
                  {showHeaderDetails ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
                {showHeaderDetails && (
                  <div className="p-3.5 space-y-2.5 text-xs bg-white dark:bg-zinc-900">
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Sender Name"
                        value={activeLetter.senderName}
                        onChange={(e) =>
                          updateActiveLetterField((p) => ({
                            ...p,
                            senderName: e.target.value,
                          }))
                        }
                        className="px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800"
                      />
                      <input
                        type="text"
                        placeholder="Email"
                        value={activeLetter.senderEmail || ''}
                        onChange={(e) =>
                          updateActiveLetterField((p) => ({
                            ...p,
                            senderEmail: e.target.value,
                          }))
                        }
                        className="px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800"
                      />
                      <input
                        type="text"
                        placeholder="Phone"
                        value={activeLetter.senderPhone || ''}
                        onChange={(e) =>
                          updateActiveLetterField((p) => ({
                            ...p,
                            senderPhone: e.target.value,
                          }))
                        }
                        className="px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800"
                      />
                      <input
                        type="text"
                        placeholder="Location"
                        value={activeLetter.senderLocation || ''}
                        onChange={(e) =>
                          updateActiveLetterField((p) => ({
                            ...p,
                            senderLocation: e.target.value,
                          }))
                        }
                        className="px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800"
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Recipient Line"
                      value={activeLetter.recipientLine || ''}
                      onChange={(e) =>
                        updateActiveLetterField((p) => ({
                          ...p,
                          recipientLine: e.target.value,
                        }))
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        id="cl-edit-salutation"
                        type="text"
                        placeholder="Salutation"
                        value={activeLetter.salutation}
                        onChange={(e) =>
                          updateActiveLetterField((p) => ({
                            ...p,
                            salutation: e.target.value,
                          }))
                        }
                        className="px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800"
                      />
                      <input
                        type="text"
                        placeholder="Sign-off"
                        value={activeLetter.signOff}
                        onChange={(e) =>
                          updateActiveLetterField((p) => ({
                            ...p,
                            signOff: e.target.value,
                          }))
                        }
                        className="px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Opening Paragraph */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="cl-edit-opening"
                    className="text-xs font-bold text-zinc-800 dark:text-zinc-200"
                  >
                    Opening Hook
                  </label>
                  <button
                    type="button"
                    data-testid="cl-regen-opening-btn"
                    disabled={regeneratingSection !== null}
                    onClick={() => handleRegenerateSection('opening')}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#285FEA] hover:underline disabled:opacity-50 cursor-pointer"
                  >
                    {regeneratingSection === 'opening' ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Sparkles className="w-3 h-3" />
                    )}
                    Rewrite Opening
                  </button>
                </div>
                <textarea
                  id="cl-edit-opening"
                  rows={4}
                  value={activeLetter.openingParagraph}
                  onChange={(e) =>
                    updateActiveLetterField((p) => ({
                      ...p,
                      openingParagraph: e.target.value,
                    }))
                  }
                  className="w-full text-xs p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#285FEA] leading-relaxed"
                />
              </div>

              {/* Body Paragraphs */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                    Experience &amp; Value Alignment
                  </span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      data-testid="cl-regen-body-btn"
                      disabled={regeneratingSection !== null}
                      onClick={() => handleRegenerateSection('body')}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#285FEA] hover:underline disabled:opacity-50 cursor-pointer"
                    >
                      {regeneratingSection === 'body' ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Sparkles className="w-3 h-3" />
                      )}
                      Rewrite Body
                    </button>
                    {(activeLetter.bodyParagraphs || []).length < 4 && (
                      <button
                        type="button"
                        onClick={() =>
                          updateActiveLetterField((p) => ({
                            ...p,
                            bodyParagraphs: [...(p.bodyParagraphs || []), ''],
                          }))
                        }
                        className="text-[11px] font-semibold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 cursor-pointer"
                      >
                        + Add Paragraph
                      </button>
                    )}
                  </div>
                </div>
                {(activeLetter.bodyParagraphs || []).map((para, idx) => (
                  <div key={idx} className="relative space-y-1">
                    <textarea
                      data-testid={`cl-edit-body-${idx}`}
                      rows={4}
                      value={para}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateActiveLetterField((p) => ({
                          ...p,
                          bodyParagraphs: (p.bodyParagraphs || []).map((b, i) =>
                            i === idx ? val : b,
                          ),
                        }));
                      }}
                      className="w-full text-xs p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#285FEA] leading-relaxed"
                    />
                    {(activeLetter.bodyParagraphs || []).length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          updateActiveLetterField((p) => ({
                            ...p,
                            bodyParagraphs: (p.bodyParagraphs || []).filter(
                              (_, i) => i !== idx,
                            ),
                          }))
                        }
                        className="text-[10px] text-zinc-400 hover:text-red-500 cursor-pointer"
                      >
                        Remove paragraph {idx + 1}
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Closing Paragraph */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="cl-edit-closing"
                    className="text-xs font-bold text-zinc-800 dark:text-zinc-200"
                  >
                    Closing Call-to-Action
                  </label>
                  <button
                    type="button"
                    data-testid="cl-regen-closing-btn"
                    disabled={regeneratingSection !== null}
                    onClick={() => handleRegenerateSection('closing')}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#285FEA] hover:underline disabled:opacity-50 cursor-pointer"
                  >
                    {regeneratingSection === 'closing' ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Sparkles className="w-3 h-3" />
                    )}
                    Rewrite Closing
                  </button>
                </div>
                <textarea
                  id="cl-edit-closing"
                  rows={3}
                  value={activeLetter.closingParagraph}
                  onChange={(e) =>
                    updateActiveLetterField((p) => ({
                      ...p,
                      closingParagraph: e.target.value,
                    }))
                  }
                  className="w-full text-xs p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#285FEA] leading-relaxed"
                />
              </div>

              {/* Keywords & Factual Guard */}
              {(activeLetter.highlightedKeywords?.length > 0 ||
                activeLetter.factualVerificationNotes) && (
                <div className="rounded-xl border border-emerald-200 dark:border-emerald-900/70 bg-emerald-50/50 dark:bg-emerald-950/25 p-3.5 space-y-2.5">
                  {activeLetter.highlightedKeywords?.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                        Verified Keywords Woven In
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {activeLetter.highlightedKeywords.map((kw) => (
                          <span
                            key={kw}
                            className="px-2 py-0.5 rounded-md bg-white dark:bg-zinc-900 border border-emerald-200 dark:border-emerald-800 text-[11px] font-medium text-emerald-700 dark:text-emerald-300"
                          >
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {activeLetter.factualVerificationNotes && (
                    <div className="flex items-start gap-2 text-[11px] text-emerald-800 dark:text-emerald-300">
                      <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
                      <span>{activeLetter.factualVerificationNotes}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Pane: Template Styling Bar + Live A4 Preview + Export */}
        <div className="lg:col-span-7 space-y-4">
          {/* Styling & Export Action Toolbar */}
          <div className="bg-white dark:bg-[#14171C] border border-[#E2E5E9] dark:border-[#252A33] rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-xs">
            <div className="flex flex-wrap items-center gap-3">
              {/* Template Switcher */}
              <div className="inline-flex rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 p-0.5 text-xs">
                {TEMPLATE_OPTIONS.map((tpl) => {
                  const selected =
                    (activeLetter?.templateKey || 'executive') === tpl.value;
                  return (
                    <button
                      key={tpl.value}
                      type="button"
                      disabled={!activeLetter}
                      data-testid={`cl-template-${tpl.value}`}
                      onClick={() =>
                        handleImmediateStyleUpdate({ templateKey: tpl.value })
                      }
                      className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer disabled:opacity-50 ${
                        selected
                          ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
                          : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400'
                      }`}
                    >
                      {tpl.label}
                    </button>
                  );
                })}
              </div>

              {/* Accent Swatches */}
              <div className="flex items-center gap-1.5">
                {ACCENT_COLORS.map((hex) => {
                  const isCurrent =
                    (activeLetter?.accentColor || '#285FEA').toUpperCase() ===
                    hex;
                  return (
                    <button
                      key={hex}
                      type="button"
                      aria-label={`Accent ${hex}`}
                      disabled={!activeLetter}
                      onClick={() =>
                        handleImmediateStyleUpdate({ accentColor: hex })
                      }
                      className={`w-5 h-5 rounded-full border-2 transition-transform cursor-pointer disabled:opacity-40 ${
                        isCurrent
                          ? 'border-zinc-900 dark:border-white scale-110'
                          : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: hex }}
                    />
                  );
                })}
              </div>

              {activeLetter && (
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
                  {wordCount} words &middot; {readTime}
                </span>
              )}
            </div>

            {/* Export & Actions */}
            {activeLetter && (
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  data-testid="cl-copy-text-btn"
                  onClick={handleCopyPlainText}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
                >
                  {copiedNotice ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Copy Text
                    </>
                  )}
                </button>

                <button
                  type="button"
                  data-testid="cl-download-pdf-btn"
                  disabled={isExportingPdf}
                  onClick={handleDownloadPdf}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#285FEA] hover:bg-[#1E4FD6] text-white text-xs font-semibold shadow-xs transition-colors disabled:opacity-60 cursor-pointer"
                >
                  {isExportingPdf ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Download className="w-3.5 h-3.5" />
                  )}
                  Download PDF
                </button>

                <button
                  type="button"
                  data-testid="cl-download-docx-btn"
                  disabled={isExportingDocx}
                  onClick={handleDownloadDocx}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50/70 dark:bg-blue-950/40 hover:bg-blue-100/80 text-blue-700 dark:text-blue-300 text-xs font-semibold transition-colors disabled:opacity-60 cursor-pointer"
                >
                  {isExportingDocx ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <FileText className="w-3.5 h-3.5" />
                  )}
                  Download DOCX
                </button>

                {confirmDeleteId === activeLetter.id ? (
                  <div className="inline-flex items-center gap-1">
                    <button
                      type="button"
                      disabled={isDeleting}
                      onClick={() => handleDeleteLetter(activeLetter.id)}
                      className="px-2.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[11px] font-semibold cursor-pointer"
                    >
                      Confirm Delete
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(null)}
                      className="px-2 py-1.5 rounded-lg text-[11px] text-zinc-500 hover:text-zinc-800 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    data-testid="cl-delete-btn"
                    aria-label="Delete cover letter"
                    onClick={() => setConfirmDeleteId(activeLetter.id)}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>

          {pdfMetaNotice && (
            <div
              data-testid="cl-pdf-verified-banner"
              className="rounded-xl border border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/40 px-3.5 py-2 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{pdfMetaNotice}</span>
            </div>
          )}

          {/* Live Paper Document Preview */}
          <div className="bg-zinc-200/70 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-6 overflow-x-auto">
            {!activeLetter && (
              <div className="mb-3 flex items-center justify-between text-[11px] text-zinc-600 dark:text-zinc-400 px-1">
                <span className="font-semibold">
                  Interactive Blueprint Preview
                </span>
                <span>
                  Click &ldquo;Generate Tailored Cover Letter&rdquo; on the left to replace this blueprint with your verified draft.
                </span>
              </div>
            )}
            <CoverLetterDocumentPreview
              letter={activeLetter || blueprintLetter}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
