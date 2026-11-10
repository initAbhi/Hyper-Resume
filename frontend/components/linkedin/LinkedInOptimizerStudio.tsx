'use client';

import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  AlertCircle,
  ArrowUpRight,
  Award,
  CheckCircle2,
  FileSpreadsheet,
  Globe,
  History,
  Loader2,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
} from 'lucide-react';
import { LinkedInIcon } from '@/components/linkedin/LinkedInIcon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  apiClient,
  type LinkedInAudit,
  type LinkedInOptimizeTone,
  type LinkedInPdfImportResponse,
  type Resume,
} from '@/lib/api-client';
import {
  evaluateHeadlineBudget,
  formatLinkedInRoleCopyBlock,
  LINKEDIN_ABOUT_FOLD_CHARS,
  LINKEDIN_ABOUT_LIMIT,
  LINKEDIN_HEADLINE_LIMIT,
  splitAboutFold,
} from '@/lib/linkedin-utils';
import { AccessibleCopyButton } from '@/components/linkedin/AccessibleCopyButton';

type SourceTabKey = 'resume' | 'pdf' | 'manual';
type ResultTabKey = 'headlines' | 'about' | 'experience' | 'skills' | 'checklist';

const SOURCE_TABS: Array<{ key: SourceTabKey; label: string }> = [
  { key: 'resume', label: 'From Resume' },
  { key: 'pdf', label: 'LinkedIn PDF Import' },
  { key: 'manual', label: 'Tune Custom Text' },
];

const RESULT_TABS: Array<{ key: ResultTabKey; label: string }> = [
  { key: 'headlines', label: 'Headlines (5)' },
  { key: 'about', label: 'About (3)' },
  { key: 'experience', label: 'Experience' },
  { key: 'skills', label: 'Skills & Gaps' },
  { key: 'checklist', label: 'Checklist & Sync' },
];

const TONE_OPTIONS: LinkedInOptimizeTone[] = [
  'Impact & Metrics',
  'Executive',
  'Storytelling',
  'Technical SEO',
];

function handleTablistKeyDown<T extends string>(
  e: React.KeyboardEvent<HTMLButtonElement>,
  tabs: Array<{ key: T }>,
  currentKey: T,
  onSelect: (next: T) => void,
  tabRefs: React.MutableRefObject<Record<string, HTMLButtonElement | null>>,
) {
  const idx = tabs.findIndex((t) => t.key === currentKey);
  if (idx === -1) return;

  let nextIdx = idx;
  if (e.key === 'ArrowRight') nextIdx = (idx + 1) % tabs.length;
  else if (e.key === 'ArrowLeft') nextIdx = (idx - 1 + tabs.length) % tabs.length;
  else if (e.key === 'Home') nextIdx = 0;
  else if (e.key === 'End') nextIdx = tabs.length - 1;
  else return;

  e.preventDefault();
  const nextTab = tabs[nextIdx];
  onSelect(nextTab.key);
  const el = tabRefs.current[nextTab.key];
  if (el) {
    el.focus();
    el.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }
}

export default function LinkedInOptimizerStudio() {
  const uid = useId();
  const searchParams = useSearchParams();
  const queryResumeId = searchParams.get('resumeId') || '';

  const [resumes, setResumes] = useState<Resume[]>([]);
  const [audits, setAudits] = useState<LinkedInAudit[]>([]);
  const [activeAudit, setActiveAudit] = useState<LinkedInAudit | null>(null);
  const [importMetadata, setImportMetadata] =
    useState<LinkedInPdfImportResponse | null>(null);

  const [sourceTab, setSourceTab] = useState<SourceTabKey>('resume');
  const [resultTab, setResultTab] = useState<ResultTabKey>('headlines');

  const sourceTabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const resultTabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const pdfInputRef = useRef<HTMLInputElement>(null);

  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [pdfTargetRole, setPdfTargetRole] = useState('');
  const [industry, setIndustry] = useState('');
  const [selectedTone, setSelectedTone] =
    useState<LinkedInOptimizeTone>('Impact & Metrics');
  const [targetJobDescription, setTargetJobDescription] = useState('');

  // Custom / Paste mode inputs
  const [customLinkedinUrl, setCustomLinkedinUrl] = useState('');
  const [customHeadline, setCustomHeadline] = useState('');
  const [customAbout, setCustomAbout] = useState('');

  // LinkedIn PDF Import options
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [createResumeOnImport, setCreateResumeOnImport] = useState(true);
  const [syncProfileOnImport, setSyncProfileOnImport] = useState(true);
  const [isDraggingPdf, setIsDraggingPdf] = useState(false);

  // Sync / Checklist local draft selections
  const [stagedSkills, setStagedSkills] = useState<string[]>([]);
  const [checkedItems, setCheckedItems] = useState<string[]>([]);

  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [isRunningOptimization, setIsRunningOptimization] = useState(false);
  const [isImportingPdf, setIsImportingPdf] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusAnnouncement, setStatusAnnouncement] = useState('');

  const selectedResume = useMemo(
    () => resumes.find((r) => r.id === selectedResumeId) || null,
    [resumes, selectedResumeId],
  );

  const hydrateFromAudit = useCallback((audit: LinkedInAudit) => {
    setActiveAudit(audit);
    setTargetRole(audit.targetRole || '');
    setIndustry(audit.industry || '');
    setSelectedTone(audit.tone || 'Impact & Metrics');
    if (audit.resumeId) setSelectedResumeId(audit.resumeId);
    setCustomLinkedinUrl(
      audit.linkedinUrl || audit.profileSnapshot?.contact?.linkedinUrl || '',
    );
    setCustomHeadline(
      audit.appliedState?.appliedHeadline || audit.profileSnapshot?.headline || '',
    );
    setCustomAbout(
      audit.appliedState?.appliedAbout || audit.profileSnapshot?.summary || '',
    );
    setStagedSkills(audit.appliedState?.appliedSkills || []);
    const autoCompleted = (audit.scoreReport?.checklist || [])
      .filter((c) => c.completed)
      .map((c) => c.id);
    setCheckedItems(
      Array.from(
        new Set([
          ...(audit.appliedState?.checkedChecklistIds || []),
          ...autoCompleted,
        ]),
      ),
    );
  }, []);

  useEffect(() => {
    let mounted = true;
    async function bootstrap() {
      setIsLoadingInitial(true);
      setErrorMessage(null);
      try {
        const [resumesData, auditsData] = await Promise.all([
          apiClient.listResumes(),
          apiClient.listLinkedInAudits(),
        ]);
        if (!mounted) return;
        setResumes(resumesData);
        setAudits(auditsData);

        const initialResume =
          (queryResumeId && resumesData.find((r) => r.id === queryResumeId)) ||
          resumesData.find((r) => r.isMaster) ||
          resumesData[0] ||
          null;

        if (initialResume) {
          setSelectedResumeId(initialResume.id);
          const inferredHeadlineRole =
            initialResume.content?.experience?.[0]?.title ||
            initialResume.content?.headline?.split('|')[0]?.trim() ||
            initialResume.name ||
            'Software Engineer';
          setTargetRole((prev) => prev || inferredHeadlineRole);
          setCustomLinkedinUrl(initialResume.content?.contact?.linkedinUrl || '');
          setCustomHeadline(initialResume.content?.headline || '');
          setCustomAbout(initialResume.content?.summary || '');
        }

        if (auditsData.length > 0 && !queryResumeId) {
          hydrateFromAudit(auditsData[0]);
        }
      } catch (err) {
        if (mounted) {
          setErrorMessage(
            err instanceof Error ? err.message : 'Unable to load LinkedIn Studio data.',
          );
        }
      } finally {
        if (mounted) setIsLoadingInitial(false);
      }
    }
    bootstrap();
    return () => {
      mounted = false;
    };
  }, [queryResumeId, hydrateFromAudit]);

  const handleResumeChange = (nextId: string) => {
    setSelectedResumeId(nextId);
    const match = resumes.find((r) => r.id === nextId);
    if (match) {
      const inferred =
        match.content?.experience?.[0]?.title ||
        match.content?.headline?.split('|')[0]?.trim() ||
        '';
      if (inferred) setTargetRole(inferred);
      setCustomLinkedinUrl(match.content?.contact?.linkedinUrl || '');
      setCustomHeadline(match.content?.headline || '');
      setCustomAbout(match.content?.summary || '');
    }
  };

  const handleRunOptimization = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!targetRole.trim()) {
      setErrorMessage('Enter a Target Role (e.g. Staff Backend Engineer) to optimize against.');
      return;
    }

    setErrorMessage(null);
    setIsRunningOptimization(true);
    setStatusAnnouncement('');

    try {
      const audit = await apiClient.optimizeLinkedInProfile({
        resumeId: selectedResumeId || undefined,
        targetRole: targetRole.trim(),
        industry: industry.trim() || undefined,
        tone: selectedTone,
        targetJobDescription: targetJobDescription.trim() || undefined,
        linkedinUrl: customLinkedinUrl.trim() || undefined,
        customHeadline:
          sourceTab === 'manual' ? customHeadline.trim() || undefined : undefined,
        customAbout:
          sourceTab === 'manual' ? customAbout.trim() || undefined : undefined,
        saveAudit: true,
      });

      setAudits((prev) => [audit, ...prev.filter((a) => a.id !== audit.id)]);
      hydrateFromAudit(audit);
      setResultTab('headlines');
      setStatusAnnouncement(
        `LinkedIn audit completed with score ${audit.overallScore} out of 100.`,
      );
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Failed to run LinkedIn optimization.',
      );
    } finally {
      setIsRunningOptimization(false);
    }
  };

  const processPdfImport = async (file: File) => {
    setPdfFile(file);
    setErrorMessage(null);
    setIsImportingPdf(true);
    setStatusAnnouncement('');

    try {
      const res = await apiClient.importLinkedInPdf(file, {
        createResume: createResumeOnImport,
        syncToProfile: syncProfileOnImport,
        targetRole: pdfTargetRole.trim() || undefined,
        industry: industry.trim() || undefined,
      });

      setImportMetadata(res);
      if (res.createdResume) {
        setResumes((prev) => [res.createdResume!, ...prev]);
        setSelectedResumeId(res.createdResume.id);
      }
      setAudits((prev) => [res.audit, ...prev.filter((a) => a.id !== res.audit.id)]);
      hydrateFromAudit(res.audit);
      setResultTab('headlines');
      setStatusAnnouncement(
        `Imported ${file.name} and generated LinkedIn optimization with score ${res.audit.overallScore} out of 100.`,
      );
    } catch (err) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'Could not extract LinkedIn Profile PDF. Ensure it is an unlocked text PDF.',
      );
    } finally {
      setIsImportingPdf(false);
    }
  };

  const handleApplyHeadline = async (headlineText: string) => {
    if (!activeAudit) return;
    setErrorMessage(null);
    setIsSyncing(true);
    try {
      const res = await apiClient.applyLinkedInAuditUpdates(activeAudit.id, {
        appliedHeadline: headlineText,
        syncToResume: false,
        syncToProfile: false,
      });
      hydrateFromAudit(res.audit);
      setAudits((prev) => prev.map((a) => (a.id === res.audit.id ? res.audit : a)));
      setStatusAnnouncement(
        `Applied LinkedIn headline. Score updated to ${res.audit.overallScore} out of 100.`,
      );
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to apply headline.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleApplyAbout = async (aboutText: string) => {
    if (!activeAudit) return;
    setErrorMessage(null);
    setIsSyncing(true);
    try {
      const res = await apiClient.applyLinkedInAuditUpdates(activeAudit.id, {
        appliedAbout: aboutText,
        syncToResume: false,
        syncToProfile: false,
      });
      hydrateFromAudit(res.audit);
      setAudits((prev) => prev.map((a) => (a.id === res.audit.id ? res.audit : a)));
      setStatusAnnouncement(
        `Applied LinkedIn About narrative. Score updated to ${res.audit.overallScore} out of 100.`,
      );
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to apply About section.');
    } finally {
      setIsSyncing(false);
    }
  };

  const toggleStagedSkill = (skill: string) => {
    setStagedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill],
    );
  };

  const toggleChecklistItem = (id: string) => {
    setCheckedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleSyncToWorkspace = async () => {
    if (!activeAudit) return;
    setErrorMessage(null);
    setIsSyncing(true);
    try {
      const res = await apiClient.applyLinkedInAuditUpdates(activeAudit.id, {
        appliedHeadline:
          activeAudit.appliedState?.appliedHeadline ||
          activeAudit.optimizations?.headlineSuggestions?.[0]?.headline,
        appliedAbout:
          activeAudit.appliedState?.appliedAbout ||
          activeAudit.optimizations?.aboutOptions?.[0]?.about,
        appliedSkills: stagedSkills,
        checkedChecklistIds: checkedItems,
        syncToResume: Boolean(activeAudit.resumeId),
        syncToProfile: true,
      });
      hydrateFromAudit(res.audit);
      setAudits((prev) => prev.map((a) => (a.id === res.audit.id ? res.audit : a)));
      setStatusAnnouncement(
        `Synced LinkedIn updates to Master Profile${res.syncedResume ? ' and Resume' : ''}. Score: ${res.audit.overallScore}/100.`,
      );
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Sync failed.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDeleteAudit = async (auditId: string) => {
    try {
      await apiClient.deleteLinkedInAudit(auditId);
      const nextList = audits.filter((a) => a.id !== auditId);
      setAudits(nextList);
      if (activeAudit?.id === auditId) {
        if (nextList[0]) hydrateFromAudit(nextList[0]);
        else setActiveAudit(null);
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Could not remove audit.');
    }
  };

  const headlineBudget = useMemo(
    () => evaluateHeadlineBudget(customHeadline),
    [customHeadline],
  );

  const aboutChars = customAbout.trim().length;

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      {/* Studio Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-[#E2E5E9] dark:border-[#252A33]">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-[#0A66C2]/10 text-[#0A66C2] dark:bg-[#0A66C2]/20 dark:text-[#60A5FA]">
              <LinkedInIcon className="w-3.5 h-3.5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1A1D23] dark:text-[#F0F2F5]">
              LinkedIn Profile Optimizer &amp; PDF Importer
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[#5A6270] dark:text-[#9EA7B4] mt-1">
            Import your LinkedIn Save-to-PDF profile or audit your resume to craft search-indexed 220-char headlines, fold-optimized About hooks, and evidenced skills.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {selectedResume && (
            <Link href={`/app/resumes/${selectedResume.id}`}>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <span>Open Resume Editor</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Polite Status Announcement for Screen Readers + Subtle Visual Banner */}
      {statusAnnouncement && (
        <div
          role="status"
          aria-live="polite"
          className="px-3.5 py-2 rounded-lg border border-[#A7F3D0] bg-[#ECFDF5] dark:border-[#047857]/60 dark:bg-[#064E3B]/30 text-xs text-[#065F46] dark:text-[#A7F3D0] flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0" aria-hidden="true" />
          <span>{statusAnnouncement}</span>
        </div>
      )}

      {errorMessage && (
        <div
          role="alert"
          className="px-3.5 py-2.5 rounded-lg border border-[#FECACA] bg-[#FEF2F2] dark:border-[#7F1D1D] dark:bg-[#7F1D1D]/20 text-xs text-[#991B1B] dark:text-[#FCA5A5] flex items-center gap-2"
        >
          <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT COLUMN: Source Selector + LinkedIn PDF Importer + Audits History */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-xl border border-[#E2E5E9] dark:border-[#252A33] bg-white dark:bg-[#14171C] shadow-xs overflow-hidden">
            {/* Accessible Horizontal Single-Row Tabs */}
            <div
              role="tablist"
              aria-label="Profile Input Mode"
              className="hr-tablist-scroll flex overflow-x-auto border-b border-[#E2E5E9] dark:border-[#252A33] bg-[#F7F8FA] dark:bg-[#1D2128]/50 px-2 pt-1"
            >
              {SOURCE_TABS.map((tab) => {
                const selected = sourceTab === tab.key;
                const tabId = `${uid}-src-tab-${tab.key}`;
                return (
                  <button
                    key={tab.key}
                    id={tabId}
                    ref={(el) => {
                      sourceTabRefs.current[tab.key] = el;
                    }}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    tabIndex={selected ? 0 : -1}
                    onClick={() => setSourceTab(tab.key)}
                    onKeyDown={(e) =>
                      handleTablistKeyDown(e, SOURCE_TABS, sourceTab, setSourceTab, sourceTabRefs)
                    }
                    className={`relative shrink-0 px-3 py-2.5 text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer after:content-[''] after:absolute after:inset-x-2 after:bottom-0 after:border-b-[2.5px] ${
                      selected
                        ? 'text-[#0A66C2] dark:text-[#60A5FA] after:border-[#0A66C2] dark:after:border-[#60A5FA]'
                        : 'text-[#5A6270] dark:text-[#9EA7B4] hover:text-[#1A1D23] dark:hover:text-[#F0F2F5] after:border-transparent'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Source Tab Panel 1: From Resume / Master Profile */}
            <div
              role="tabpanel"
              aria-labelledby={`${uid}-src-tab-resume`}
              hidden={sourceTab !== 'resume'}
            >
              <form onSubmit={handleRunOptimization} className="p-4 space-y-3.5">
                <div>
                  <label
                    htmlFor={`${uid}-resume-select`}
                    className="block text-xs font-medium text-[#1A1D23] dark:text-[#F0F2F5] mb-1"
                  >
                    Source Resume / Master Profile
                  </label>
                  <select
                    id={`${uid}-resume-select`}
                    value={selectedResumeId}
                    onChange={(e) => handleResumeChange(e.target.value)}
                    disabled={isLoadingInitial}
                    className="w-full h-9 px-2.5 text-xs rounded-md border border-[#E2E5E9] dark:border-[#252A33] bg-white dark:bg-[#1D2128] text-[#1A1D23] dark:text-[#F0F2F5] focus:outline-none focus:ring-2 focus:ring-[#285FEA]"
                  >
                    <option value="">Use Master Profile Defaults</option>
                    {resumes.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                        {r.isMaster ? ' (Master)' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <Input
                  id={`${uid}-target-role`}
                  label="Target Role for Recruiter Search"
                  placeholder="e.g. Staff Backend Engineer"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  required
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    id={`${uid}-industry`}
                    label="Industry / Domain (Optional)"
                    placeholder="e.g. FinTech Infrastructure"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                  />
                  <div>
                    <label
                      htmlFor={`${uid}-tone`}
                      className="block text-xs font-medium text-[#1A1D23] dark:text-[#F0F2F5] mb-1"
                    >
                      Positioning Tone
                    </label>
                    <select
                      id={`${uid}-tone`}
                      value={selectedTone}
                      onChange={(e) => setSelectedTone(e.target.value as LinkedInOptimizeTone)}
                      className="w-full h-9 px-2.5 text-xs rounded-md border border-[#E2E5E9] dark:border-[#252A33] bg-white dark:bg-[#1D2128] text-[#1A1D23] dark:text-[#F0F2F5] focus:outline-none focus:ring-2 focus:ring-[#285FEA]"
                    >
                      {TONE_OPTIONS.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor={`${uid}-jd-context`}
                    className="block text-xs font-medium text-[#1A1D23] dark:text-[#F0F2F5] mb-1"
                  >
                    Target Job Description (Optional SEO Keywords)
                  </label>
                  <textarea
                    id={`${uid}-jd-context`}
                    rows={3}
                    placeholder="Paste target role requirements so we match verified skills and highlight unverified gaps separately..."
                    value={targetJobDescription}
                    onChange={(e) => setTargetJobDescription(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-md border border-[#E2E5E9] dark:border-[#252A33] bg-white dark:bg-[#1D2128] text-[#1A1D23] dark:text-[#F0F2F5] focus:outline-none focus:ring-2 focus:ring-[#285FEA]"
                  />
                </div>

                <Button
                  id="run-linkedin-optimize-btn"
                  type="submit"
                  variant="primary"
                  size="sm"
                  className="w-full h-9 bg-[#0A66C2] hover:bg-[#084D93] text-white gap-1.5"
                  isLoading={isRunningOptimization}
                >
                  <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Optimize LinkedIn Profile</span>
                </Button>
              </form>
            </div>

            {/* Source Tab Panel 2: LinkedIn PDF Importer */}
            <div
              role="tabpanel"
              aria-labelledby={`${uid}-src-tab-pdf`}
              hidden={sourceTab !== 'pdf'}
            >
              <div className="p-4 space-y-3.5">
                <div className="rounded-lg border border-[#BAE6FD] bg-[#F0F9FF] dark:border-[#1E3A8A] dark:bg-[#0F172A]/70 p-3 text-[11px] text-[#075985] dark:text-[#BAE6FD] space-y-1">
                  <p className="font-semibold flex items-center gap-1.5">
                    <FileSpreadsheet className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    How to export your real LinkedIn PDF cleanly:
                  </p>
                  <p>
                    Open your LinkedIn profile &rarr; click <strong>Resources</strong> (or <strong>More</strong>) &rarr; <strong>Save to PDF</strong>. Upload below — we isolate multi-role history, separate spoken Languages from Top Skills, and run a LinkedIn audit automatically.
                  </p>
                </div>

                <Input
                  id={`${uid}-pdf-target-role`}
                  label="Override Target Role (Optional)"
                  placeholder="Leave blank to auto-detect from uploaded LinkedIn PDF"
                  value={pdfTargetRole}
                  onChange={(e) => setPdfTargetRole(e.target.value)}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#5A6270] dark:text-[#9EA7B4]">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={createResumeOnImport}
                      onChange={(e) => setCreateResumeOnImport(e.target.checked)}
                      className="rounded border-[#CBD0D7] text-[#285FEA]"
                    />
                    <span>Create ATS Resume</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={syncProfileOnImport}
                      onChange={(e) => setSyncProfileOnImport(e.target.checked)}
                      className="rounded border-[#CBD0D7] text-[#285FEA]"
                    />
                    <span>Sync Master Profile</span>
                  </label>
                </div>

                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDraggingPdf(true);
                  }}
                  onDragLeave={() => setIsDraggingPdf(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDraggingPdf(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file) void processPdfImport(file);
                  }}
                  onClick={() => pdfInputRef.current?.click()}
                  className={`p-6 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${
                    isDraggingPdf
                      ? 'border-[#0A66C2] bg-[#EFF6FF] dark:bg-[#0F172A]'
                      : 'border-[#CBD0D7] dark:border-[#333945] hover:border-[#0A66C2] bg-[#F7F8FA] dark:bg-[#1D2128]/50'
                  }`}
                >
                  <input
                    ref={pdfInputRef}
                    id="linkedin-pdf-file-input"
                    type="file"
                    accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) void processPdfImport(file);
                    }}
                  />
                  <div className="w-10 h-10 rounded-full bg-white dark:bg-[#14171C] text-[#0A66C2] border border-[#E2E5E9] dark:border-[#252A33] flex items-center justify-center mb-2 shadow-2xs">
                    {isImportingPdf ? (
                      <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                    ) : (
                      <Upload className="w-4 h-4" aria-hidden="true" />
                    )}
                  </div>
                  <p className="text-xs font-semibold text-[#1A1D23] dark:text-[#F0F2F5]">
                    {pdfFile ? pdfFile.name : 'Select or drop your LinkedIn Profile PDF'}
                  </p>
                  <p className="text-[11px] text-[#848D9A] mt-0.5">
                    Up to 10MB · Extracts career timeline cleanly without skill hallucination
                  </p>
                </div>

                {importMetadata && (
                  <div className="rounded-lg border border-[#A7F3D0] bg-[#ECFDF5] dark:border-[#047857]/50 dark:bg-[#064E3B]/30 p-3 text-xs space-y-1.5 text-[#065F46] dark:text-[#A7F3D0]">
                    <div className="font-semibold flex items-center justify-between gap-2">
                      <span>
                        {importMetadata.draft.sourceType === 'linkedin_pdf'
                          ? 'LinkedIn Profile PDF Verified'
                          : 'Document Parsed'}
                      </span>
                      <span className="text-[10px] font-mono">
                        {importMetadata.draft.experience.length} roles ·{' '}
                        {importMetadata.draft.skills.length} skills
                      </span>
                    </div>
                    {(importMetadata.draft.languages?.length || 0) > 0 && (
                      <p className="text-[11px]">
                        <strong>Spoken Languages Isolated:</strong>{' '}
                        {importMetadata.draft.languages?.join(', ')}
                      </p>
                    )}
                    {importMetadata.createdResume && (
                      <Link
                        href={`/app/resumes/${importMetadata.createdResume.id}`}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold underline"
                      >
                        <span>Imported Resume Ready: {importMetadata.createdResume.name}</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Source Tab Panel 3: Tune Custom Text (Live 220 & 2600 Char Meters) */}
            <div
              role="tabpanel"
              aria-labelledby={`${uid}-src-tab-manual`}
              hidden={sourceTab !== 'manual'}
            >
              <div className="p-4 space-y-3.5">
                <Input
                  id={`${uid}-custom-url`}
                  label="LinkedIn Profile URL"
                  placeholder="https://linkedin.com/in/your-name"
                  value={customLinkedinUrl}
                  onChange={(e) => setCustomLinkedinUrl(e.target.value)}
                />

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label
                      htmlFor={`${uid}-custom-headline`}
                      className="text-xs font-medium text-[#1A1D23] dark:text-[#F0F2F5]"
                    >
                      Draft Headline
                    </label>
                    <span
                      className={`text-[10px] font-mono ${
                        headlineBudget.status === 'over'
                          ? 'text-[#DC2626]'
                          : headlineBudget.status === 'optimal'
                            ? 'text-[#059669]'
                            : 'text-[#848D9A]'
                      }`}
                    >
                      {headlineBudget.length}/{LINKEDIN_HEADLINE_LIMIT}
                    </span>
                  </div>
                  <input
                    id={`${uid}-custom-headline`}
                    type="text"
                    value={customHeadline}
                    onChange={(e) => setCustomHeadline(e.target.value)}
                    placeholder="Target Role | Core Skills | Domain Impact"
                    className="w-full h-9 px-2.5 text-xs rounded-md border border-[#E2E5E9] dark:border-[#252A33] bg-white dark:bg-[#1D2128] text-[#1A1D23] dark:text-[#F0F2F5] focus:outline-none focus:ring-2 focus:ring-[#285FEA]"
                  />
                  <progress
                    className="hr-progress w-full h-1.5 mt-1.5 block"
                    value={Math.min(headlineBudget.length, LINKEDIN_HEADLINE_LIMIT)}
                    max={LINKEDIN_HEADLINE_LIMIT}
                    aria-label="LinkedIn headline character budget"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label
                      htmlFor={`${uid}-custom-about`}
                      className="text-xs font-medium text-[#1A1D23] dark:text-[#F0F2F5]"
                    >
                      Draft About Section
                    </label>
                    <span
                      className={`text-[10px] font-mono ${
                        aboutChars > LINKEDIN_ABOUT_LIMIT
                          ? 'text-[#DC2626]'
                          : 'text-[#848D9A]'
                      }`}
                    >
                      {aboutChars}/{LINKEDIN_ABOUT_LIMIT}
                    </span>
                  </div>
                  <textarea
                    id={`${uid}-custom-about`}
                    rows={5}
                    value={customAbout}
                    onChange={(e) => setCustomAbout(e.target.value)}
                    placeholder="First 265 chars appear before LinkedIn's ...see more button..."
                    className="w-full text-xs p-2.5 rounded-md border border-[#E2E5E9] dark:border-[#252A33] bg-white dark:bg-[#1D2128] text-[#1A1D23] dark:text-[#F0F2F5] focus:outline-none focus:ring-2 focus:ring-[#285FEA]"
                  />
                  <progress
                    className="hr-progress w-full h-1.5 mt-1 block"
                    value={Math.min(aboutChars, LINKEDIN_ABOUT_LIMIT)}
                    max={LINKEDIN_ABOUT_LIMIT}
                    aria-label="LinkedIn About section character budget"
                  />
                </div>

                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => void handleRunOptimization()}
                  className="w-full h-9 bg-[#0A66C2] hover:bg-[#084D93] text-white gap-1.5"
                  isLoading={isRunningOptimization}
                >
                  <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Re-score &amp; Optimize Custom Draft</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Saved Audits History Panel */}
          <div className="rounded-xl border border-[#E2E5E9] dark:border-[#252A33] bg-white dark:bg-[#14171C] p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#5A6270] dark:text-[#9EA7B4] flex items-center gap-1.5">
                <History className="w-3.5 h-3.5" aria-hidden="true" />
                Saved Audits ({audits.length})
              </h2>
            </div>

            {audits.length === 0 ? (
              <p className="text-xs text-[#848D9A] py-2">
                Run an optimization or import a LinkedIn PDF to store audit snapshots here.
              </p>
            ) : (
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {audits.map((audit) => {
                  const isCurrent = activeAudit?.id === audit.id;
                  return (
                    <div
                      key={audit.id}
                      className={`flex items-center justify-between gap-2 p-2.5 rounded-lg border text-xs transition-colors ${
                        isCurrent
                          ? 'border-[#0A66C2] bg-[#EFF6FF]/60 dark:border-[#3B82F6] dark:bg-[#1E3A8A]/20'
                          : 'border-[#E2E5E9] dark:border-[#252A33] hover:bg-[#F7F8FA] dark:hover:bg-[#1D2128]'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => hydrateFromAudit(audit)}
                        className="flex-1 text-left min-w-0 cursor-pointer"
                      >
                        <div className="font-semibold text-[#1A1D23] dark:text-[#F0F2F5] truncate">
                          {audit.title}
                        </div>
                        <div className="text-[11px] text-[#848D9A] flex items-center gap-2 mt-0.5">
                          <span>Score: {audit.overallScore}/100</span>
                          <span>·</span>
                          <span>
                            {audit.sourceType === 'linkedin_pdf'
                              ? 'LinkedIn PDF'
                              : audit.sourceType}
                          </span>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDeleteAudit(audit.id)}
                        aria-label={`Delete audit ${audit.title}`}
                        className="p-1 rounded text-[#848D9A] hover:text-[#DC2626] transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Live Audit Scoreboard + Optimization Studio */}
        <div className="lg:col-span-7 space-y-4">
          {!activeAudit ? (
            <div className="rounded-xl border border-dashed border-[#CBD0D7] dark:border-[#333945] bg-white dark:bg-[#14171C] p-10 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#0A66C2]/10 text-[#0A66C2] mx-auto flex items-center justify-center">
                <LinkedInIcon className="w-6 h-6" />
              </div>
              <h2 className="text-base font-semibold text-[#1A1D23] dark:text-[#F0F2F5]">
                Ready to Optimize Your LinkedIn Presence
              </h2>
              <p className="text-xs text-[#5A6270] dark:text-[#9EA7B4] max-w-md mx-auto leading-relaxed">
                Select one of your resumes on the left or switch to <strong>LinkedIn PDF Import</strong> to generate your Recruiter Visibility Score, 5 custom headlines, fold-tested About stories, and evidenced skills.
              </p>
            </div>
          ) : (
            <>
              {/* Top Visibility Score Card */}
              <div className="rounded-xl border border-[#E2E5E9] dark:border-[#252A33] bg-white dark:bg-[#14171C] p-4 sm:p-5 space-y-4 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#0A66C2] dark:text-[#60A5FA]">
                        Recruiter Search Readiness
                      </span>
                      <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-[#F1F3F5] dark:bg-[#1D2128] text-[#1A1D23] dark:text-[#F0F2F5] border border-[#E2E5E9] dark:border-[#252A33]">
                        {activeAudit.scoreReport.gradeLabel}
                      </span>
                      <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-[#ECFDF5] dark:bg-[#064E3B]/40 text-[#065F46] dark:text-[#6EE7B7] border border-[#A7F3D0] dark:border-[#047857]/40 inline-flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" aria-hidden="true" />
                        {activeAudit.provider === 'gemini' ? 'Gemini Grounded' : 'Verified Grounding'}
                      </span>
                    </div>
                    <h2 className="text-base font-bold text-[#1A1D23] dark:text-[#F0F2F5] mt-1">
                      Target: {activeAudit.targetRole}
                    </h2>
                  </div>

                  <div className="flex items-baseline gap-1 shrink-0">
                    <span className="text-3xl font-extrabold text-[#1A1D23] dark:text-[#F0F2F5] tabular-nums">
                      {activeAudit.overallScore}
                    </span>
                    <span className="text-xs font-medium text-[#848D9A]">/100</span>
                  </div>
                </div>

                {/* Native Semantic Progress Element */}
                <progress
                  className="hr-progress w-full h-2.5 block"
                  value={activeAudit.overallScore}
                  max={100}
                  aria-label={`LinkedIn Recruiter Readiness Score ${activeAudit.overallScore} out of 100`}
                />

                {/* Sub-score Tiles */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 pt-1">
                  {[
                    { label: 'Headline', val: activeAudit.scoreReport.subScores.headline, max: 20 },
                    { label: 'About', val: activeAudit.scoreReport.subScores.about, max: 25 },
                    { label: 'Experience', val: activeAudit.scoreReport.subScores.experience, max: 25 },
                    { label: 'Skills', val: activeAudit.scoreReport.subScores.skills, max: 15 },
                    { label: 'Completeness', val: activeAudit.scoreReport.subScores.completeness, max: 10 },
                    { label: 'Contact', val: activeAudit.scoreReport.subScores.contactFeatured, max: 5 },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="p-2 rounded-lg border border-[#E2E5E9] dark:border-[#252A33] bg-[#F7F8FA] dark:bg-[#1D2128]/50 text-center"
                    >
                      <div className="text-[10px] font-medium text-[#5A6270] dark:text-[#9EA7B4]">
                        {item.label}
                      </div>
                      <div className="text-xs font-bold text-[#1A1D23] dark:text-[#F0F2F5] mt-0.5 tabular-nums">
                        {item.val}/{item.max}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Custom URL Hygiene Alert */}
                <div className="rounded-lg border border-[#E2E5E9] dark:border-[#252A33] bg-[#F7F8FA] dark:bg-[#1D2128]/40 px-3 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="flex items-start sm:items-center gap-2 min-w-0">
                    <Globe className="w-3.5 h-3.5 text-[#0A66C2] shrink-0 mt-0.5 sm:mt-0" aria-hidden="true" />
                    <span className="text-[#5A6270] dark:text-[#9EA7B4] truncate">
                      <strong className="text-[#1A1D23] dark:text-[#F0F2F5]">Custom URL:</strong>{' '}
                      {activeAudit.scoreReport.urlHealth.note}
                    </span>
                  </div>
                  {!activeAudit.scoreReport.urlHealth.hasCustomSlug && (
                    <span className="shrink-0 font-mono text-[11px] font-semibold text-[#0A66C2] dark:text-[#60A5FA]">
                      Suggested: /in/{activeAudit.scoreReport.urlHealth.suggestedSlug}
                    </span>
                  )}
                </div>
              </div>

              {/* Optimized Output Tabs Workspace */}
              <div className="rounded-xl border border-[#E2E5E9] dark:border-[#252A33] bg-white dark:bg-[#14171C] shadow-xs overflow-hidden">
                <div
                  role="tablist"
                  aria-label="Optimized LinkedIn Sections"
                  className="hr-tablist-scroll flex overflow-x-auto border-b border-[#E2E5E9] dark:border-[#252A33] bg-[#F7F8FA] dark:bg-[#1D2128]/50 px-2 pt-1"
                >
                  {RESULT_TABS.map((tab) => {
                    const selected = resultTab === tab.key;
                    const tabId = `${uid}-res-tab-${tab.key}`;
                    return (
                      <button
                        key={tab.key}
                        id={tabId}
                        ref={(el) => {
                          resultTabRefs.current[tab.key] = el;
                        }}
                        type="button"
                        role="tab"
                        aria-selected={selected}
                        tabIndex={selected ? 0 : -1}
                        onClick={() => setResultTab(tab.key)}
                        onKeyDown={(e) =>
                          handleTablistKeyDown(e, RESULT_TABS, resultTab, setResultTab, resultTabRefs)
                        }
                        className={`relative shrink-0 px-3.5 py-2.5 text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer after:content-[''] after:absolute after:inset-x-2 after:bottom-0 after:border-b-[2.5px] ${
                          selected
                            ? 'text-[#0A66C2] dark:text-[#60A5FA] after:border-[#0A66C2] dark:after:border-[#60A5FA]'
                            : 'text-[#5A6270] dark:text-[#9EA7B4] hover:text-[#1A1D23] dark:hover:text-[#F0F2F5] after:border-transparent'
                        }`}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>

                {/* Output Panel 1: Headlines (5) */}
                <div
                  role="tabpanel"
                  aria-labelledby={`${uid}-res-tab-headlines`}
                  hidden={resultTab !== 'headlines'}
                >
                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between gap-2 text-xs text-[#5A6270] dark:text-[#9EA7B4]">
                      <span>
                        All 5 formulas stay strictly within LinkedIn&apos;s 220-character headline cap using your verified stack.
                      </span>
                    </div>

                    {activeAudit.optimizations.headlineSuggestions.map((item) => {
                      const isApplied =
                        activeAudit.appliedState?.appliedHeadline === item.headline;
                      return (
                        <div
                          key={item.id}
                          className={`rounded-lg border p-3.5 space-y-2 transition-colors ${
                            isApplied
                              ? 'border-[#059669] bg-[#ECFDF5]/60 dark:border-[#047857] dark:bg-[#064E3B]/20'
                              : 'border-[#E2E5E9] dark:border-[#252A33] bg-[#F7F8FA]/50 dark:bg-[#1D2128]/30'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-[#0A66C2]/10 text-[#0A66C2] dark:bg-[#0A66C2]/20 dark:text-[#60A5FA]">
                                {item.style}
                              </span>
                              <span className="text-[11px] font-mono text-[#848D9A]">
                                {item.charCount}/220 chars
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <AccessibleCopyButton
                                text={item.headline}
                                label="Copy"
                                ariaLabel={`Copy ${item.style} headline`}
                              />
                              <Button
                                type="button"
                                size="sm"
                                variant={isApplied ? 'outline' : 'primary'}
                                disabled={isSyncing}
                                onClick={() => void handleApplyHeadline(item.headline)}
                                className="h-7 text-[11px]"
                              >
                                {isApplied ? 'Applied' : 'Use Headline'}
                              </Button>
                            </div>
                          </div>

                          <p className="text-xs sm:text-sm font-semibold text-[#1A1D23] dark:text-[#F0F2F5] leading-snug">
                            {item.headline}
                          </p>

                          <p className="text-[11px] text-[#5A6270] dark:text-[#9EA7B4]">
                            {item.whyItWorks}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Output Panel 2: About (3) with Fold Cutoff Preview */}
                <div
                  role="tabpanel"
                  aria-labelledby={`${uid}-res-tab-about`}
                  hidden={resultTab !== 'about'}
                >
                  <div className="p-4 space-y-3.5">
                    <p className="text-xs text-[#5A6270] dark:text-[#9EA7B4]">
                      Highlighted sections show the exact first{' '}
                      <strong>{LINKEDIN_ABOUT_FOLD_CHARS} characters</strong> visitors read before LinkedIn&apos;s{' '}
                      <code>&hellip;see more</code> button.
                    </p>

                    {activeAudit.optimizations.aboutOptions.map((opt) => {
                      const fold = splitAboutFold(opt.about);
                      const isApplied = activeAudit.appliedState?.appliedAbout === opt.about;
                      return (
                        <div
                          key={opt.id}
                          className={`rounded-lg border p-3.5 space-y-2.5 ${
                            isApplied
                              ? 'border-[#059669] bg-[#ECFDF5]/60 dark:border-[#047857] dark:bg-[#064E3B]/20'
                              : 'border-[#E2E5E9] dark:border-[#252A33] bg-[#F7F8FA]/40 dark:bg-[#1D2128]/30'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-[#285FEA]/10 text-[#285FEA] dark:text-[#60A5FA]">
                                {opt.tone}
                              </span>
                              <span className="text-[11px] font-mono text-[#848D9A]">
                                {opt.charCount}/2,600 chars
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <AccessibleCopyButton
                                text={opt.about}
                                label="Copy"
                                ariaLabel={`Copy ${opt.tone} About narrative`}
                              />
                              <Button
                                type="button"
                                size="sm"
                                variant={isApplied ? 'outline' : 'primary'}
                                disabled={isSyncing}
                                onClick={() => void handleApplyAbout(opt.about)}
                                className="h-7 text-[11px]"
                              >
                                {isApplied ? 'Applied' : 'Use About'}
                              </Button>
                            </div>
                          </div>

                          <div className="rounded-md border border-[#E2E5E9] dark:border-[#252A33] bg-white dark:bg-[#14171C] p-3 text-xs leading-relaxed whitespace-pre-line text-[#1A1D23] dark:text-[#F0F2F5]">
                            <mark className="bg-[#EFF6FF] dark:bg-[#1E3A8A]/40 text-inherit px-0.5 rounded-xs">
                              {fold.beforeFold}
                            </mark>
                            {fold.exceedsFold && (
                              <>
                                <span className="inline-block mx-1 text-[10px] font-mono font-semibold text-[#0A66C2] dark:text-[#60A5FA]">
                                  [...see more fold]
                                </span>
                                <span className="text-[#5A6270] dark:text-[#9EA7B4]">
                                  {fold.afterFold}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Output Panel 3: Experience Bullets */}
                <div
                  role="tabpanel"
                  aria-labelledby={`${uid}-res-tab-experience`}
                  hidden={resultTab !== 'experience'}
                >
                  <div className="p-4 space-y-3.5">
                    {activeAudit.optimizations.experienceOptimizations.length === 0 ? (
                      <p className="text-xs text-[#848D9A]">
                        No work experience entries present in the selected snapshot yet.
                      </p>
                    ) : (
                      activeAudit.optimizations.experienceOptimizations.map((exp, idx) => (
                        <div
                          key={`${exp.company}-${idx}`}
                          className="rounded-lg border border-[#E2E5E9] dark:border-[#252A33] p-3.5 space-y-2.5 bg-[#F7F8FA]/40 dark:bg-[#1D2128]/30"
                        >
                          <div className="flex items-start justify-between gap-2 flex-wrap">
                            <div>
                              <h3 className="text-xs font-bold text-[#1A1D23] dark:text-[#F0F2F5]">
                                {exp.title} · {exp.company}
                              </h3>
                              <p className="text-[11px] font-mono text-[#0A66C2] dark:text-[#60A5FA] mt-0.5">
                                Suggested LinkedIn Role Title: {exp.recruiterSearchHeadline}
                              </p>
                            </div>
                            <AccessibleCopyButton
                              text={formatLinkedInRoleCopyBlock(exp)}
                              label="Copy Role"
                              ariaLabel={`Copy optimized ${exp.title} role description`}
                            />
                          </div>

                          <div className="space-y-2">
                            {exp.optimizedBullets.map((b, bIdx) => (
                              <div
                                key={bIdx}
                                className="rounded border border-[#E2E5E9] dark:border-[#252A33] bg-white dark:bg-[#14171C] p-2.5 text-xs space-y-1"
                              >
                                <div className="text-[#1A1D23] dark:text-[#F0F2F5]">
                                  &bull; {b.optimized}
                                </div>
                                {b.matchedKeywords.length > 0 && (
                                  <div className="flex flex-wrap gap-1 pt-0.5">
                                    {b.matchedKeywords.map((kw) => (
                                      <span
                                        key={kw}
                                        className="px-1.5 py-0.5 text-[10px] rounded bg-[#F1F3F5] dark:bg-[#1D2128] text-[#5A6270] dark:text-[#9EA7B4]"
                                      >
                                        {kw}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Output Panel 4: Skills & Evidenced Gaps */}
                <div
                  role="tabpanel"
                  aria-labelledby={`${uid}-res-tab-skills`}
                  hidden={resultTab !== 'skills'}
                >
                  <div className="p-4 space-y-4">
                    <div className="rounded-lg border border-[#E2E5E9] dark:border-[#252A33] p-3.5 space-y-2">
                      <h3 className="text-xs font-bold text-[#1A1D23] dark:text-[#F0F2F5] flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-[#0A66C2]" aria-hidden="true" />
                        Top 3 Skills to Pin for Recruiter Search Cards
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {activeAudit.optimizations.skillsStrategy.top3PinnedSkills.map((sk) => (
                          <span
                            key={sk}
                            className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#0A66C2] text-white"
                          >
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-lg border border-[#A7F3D0] dark:border-[#047857]/50 bg-[#ECFDF5]/60 dark:bg-[#064E3B]/20 p-3.5 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-xs font-bold text-[#065F46] dark:text-[#A7F3D0]">
                          Evidenced in Experience — Safe to Add to LinkedIn Skills
                        </h3>
                      </div>
                      {activeAudit.optimizations.skillsStrategy.evidencedSkillsToAdd.length === 0 ? (
                        <p className="text-xs text-[#065F46] dark:text-[#A7F3D0]">
                          All skills mentioned in your work history are already indexed in your skills list.
                        </p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {activeAudit.optimizations.skillsStrategy.evidencedSkillsToAdd.map(
                            (sk) => {
                              const queued = stagedSkills.includes(sk);
                              return (
                                <button
                                  key={sk}
                                  type="button"
                                  onClick={() => toggleStagedSkill(sk)}
                                  className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                                    queued
                                      ? 'bg-[#059669] text-white border-[#059669]'
                                      : 'bg-white dark:bg-[#14171C] text-[#065F46] dark:text-[#A7F3D0] border-[#A7F3D0]'
                                  }`}
                                >
                                  {queued ? `✓ Queued: ${sk}` : `+ Add ${sk}`}
                                </button>
                              );
                            },
                          )}
                        </div>
                      )}
                    </div>

                    <div className="rounded-lg border border-[#FDE68A] dark:border-[#92400E]/60 bg-[#FFFBEB]/70 dark:bg-[#78350F]/20 p-3.5 space-y-2">
                      <h3 className="text-xs font-bold text-[#92400E] dark:text-[#FDE68A]">
                        Target Role Market Keywords (Not Evidenced Yet — Only Add If True)
                      </h3>
                      <p className="text-[11px] text-[#92400E] dark:text-[#FDE68A]">
                        HyperResume never fabricates unverified skills into your profile. Confirm firsthand projects before adding any keyword below:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {activeAudit.optimizations.skillsStrategy.targetRoleKeywordsToConfirm
                          .length === 0 ? (
                          <span className="text-xs text-[#92400E] dark:text-[#FDE68A]">
                            Zero missing target-role keyword gaps detected.
                          </span>
                        ) : (
                          activeAudit.optimizations.skillsStrategy.targetRoleKeywordsToConfirm.map(
                            (kw) => (
                              <span
                                key={kw}
                                className="px-2 py-0.5 rounded text-[11px] font-medium border border-[#FDE68A] dark:border-[#92400E] bg-white dark:bg-[#14171C] text-[#92400E] dark:text-[#FDE68A]"
                              >
                                {kw}
                              </span>
                            ),
                          )
                        )}
                      </div>
                    </div>

                    <p className="text-[11px] text-[#848D9A]">
                      {activeAudit.optimizations.factualVerificationNotes}
                    </p>
                  </div>
                </div>

                {/* Output Panel 5: Checklist, Featured Links & Two-Way Sync */}
                <div
                  role="tabpanel"
                  aria-labelledby={`${uid}-res-tab-checklist`}
                  hidden={resultTab !== 'checklist'}
                >
                  <div className="p-4 space-y-4">
                    <div className="space-y-2">
                      <h3 className="text-xs font-bold text-[#1A1D23] dark:text-[#F0F2F5]">
                        LinkedIn All-Star &amp; Recruiter Conversion Checklist
                      </h3>
                      {activeAudit.scoreReport.checklist.map((item) => {
                        const checked = item.completed || checkedItems.includes(item.id);
                        return (
                          <label
                            key={item.id}
                            className="flex items-start gap-2.5 p-2.5 rounded-lg border border-[#E2E5E9] dark:border-[#252A33] hover:bg-[#F7F8FA] dark:hover:bg-[#1D2128]/50 cursor-pointer text-xs"
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleChecklistItem(item.id)}
                              className="mt-0.5 rounded border-[#CBD0D7] text-[#0A66C2]"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-[#1A1D23] dark:text-[#F0F2F5]">
                                  {item.title}
                                </span>
                                <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-[#F1F3F5] dark:bg-[#1D2128] text-[#5A6270] dark:text-[#9EA7B4]">
                                  {item.impact} Impact
                                </span>
                              </div>
                              <p className="text-[11px] text-[#5A6270] dark:text-[#9EA7B4] mt-0.5">
                                {item.detail}
                              </p>
                            </div>
                          </label>
                        );
                      })}
                    </div>

                    {/* Featured Section Prompts */}
                    <div className="space-y-2">
                      <h3 className="text-xs font-bold text-[#1A1D23] dark:text-[#F0F2F5]">
                        Recommended LinkedIn Featured Items
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {activeAudit.optimizations.featuredSuggestions.map((f, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-lg border border-[#E2E5E9] dark:border-[#252A33] bg-[#F7F8FA]/50 dark:bg-[#1D2128]/40 text-xs space-y-1"
                          >
                            <div className="font-semibold text-[#1A1D23] dark:text-[#F0F2F5]">
                              {f.title}
                            </div>
                            <p className="text-[11px] text-[#5A6270] dark:text-[#9EA7B4]">
                              {f.description}
                            </p>
                            {f.suggestedUrl && (
                              <div className="pt-1 font-mono text-[10px] text-[#0A66C2] dark:text-[#60A5FA] truncate">
                                {f.suggestedUrl}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Sync Back to Master Profile & Resume */}
                    <div className="pt-2 border-t border-[#E2E5E9] dark:border-[#252A33] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="text-[11px] text-[#5A6270] dark:text-[#9EA7B4]">
                        Save applied Headline, About narrative, and queued Skills back to your Master Profile
                        {activeAudit.resumeId ? ' & linked Resume.' : '.'}
                      </div>
                      <Button
                        id="sync-linkedin-workspace-btn"
                        type="button"
                        variant="primary"
                        size="sm"
                        isLoading={isSyncing}
                        onClick={() => void handleSyncToWorkspace()}
                        className="shrink-0 bg-[#059669] hover:bg-[#047857] text-white"
                      >
                        Sync Applied Changes to Workspace
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
