'use client';

import React, {
  use,
  useState,
  useEffect,
  useLayoutEffect,
  useRef,
  useCallback,
} from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import SummaryHeadlinePanel from '@/components/resumes/SummaryHeadlinePanel';
import VersionHistoryDrawer from '@/components/resumes/VersionHistoryDrawer';
import {
  ArrowLeft,
  Printer,
  Sparkles,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  History,
  X,
  RefreshCw,
  Eye,
  FileText,
  LayoutTemplate,
  Palette,
  Type,
  Camera,
  Upload,
  Link2,
  ArrowUpDown,
  Share2,
  Download,
  ShieldCheck,
  Wand2,
  Loader2,
  Mail,
  SlidersHorizontal,
} from 'lucide-react';
import {
  apiClient,
  downloadExportBlob,
  Resume,
  ResumeContent,
  ResumeLayoutSettings,
  ResumeAnalysis,
  ResumeVersion,
  BulletVariantOption,
  WritingCheckResponse,
  WritingIssueItem,
  ResumeShareWithAnalytics,
  ApiError,
} from '@/lib/api-client';
import { applyResumeLayoutToDom } from '@/lib/resume-layout';
import { analyzeResumeWriting, mergeWritingIssues } from '@/lib/writing-checker';
import { SectionRearrangeDrawer } from '@/components/resumes/SectionRearrangeDrawer';
import {
  SectionRewriterDialog,
  type SectionRewriterTarget,
} from '@/components/resumes/SectionRewriterDialog';
import { CustomSectionsPanel } from '@/components/resumes/CustomSectionsPanel';
import { AtsAuditBreakdown } from '@/components/resumes/AtsAuditBreakdown';
import { FixMistakesDrawer } from '@/components/resumes/FixMistakesDrawer';
import { ShareAnalyticsDrawer } from '@/components/resumes/ShareAnalyticsDrawer';
import { ScoreMeter } from '@/components/resumes/ScoreMeter';
import { AVAILABLE_TEMPLATES, getTemplateComponent } from '@/components/resumes/templates';
import { TemplatePicker } from '@/components/resumes/TemplatePicker';
import { DesignPanel } from '@/components/resumes/DesignPanel';
import { PhotoUploadModal } from '@/components/resumes/PhotoUploadModal';
import { CheckAndTailorDrawer } from '@/components/resumes/CheckAndTailorDrawer';
import { ExportPdfModal } from '@/components/resumes/ExportPdfModal';

interface ResumeEditorPageProps {
  params: Promise<{ resumeId: string }>;
}

type EditorSection = 'contact' | 'summary' | 'experience' | 'skills' | 'education' | 'projects' | 'custom' | 'certifications';

export default function ResumeDetailPage({ params }: ResumeEditorPageProps) {
  const resolvedParams = use(params);
  const resumeId = resolvedParams.resumeId;

  // Primary Resume Data State
  const [resume, setResume] = useState<Resume | null>(null);
  const [content, setContent] = useState<ResumeContent | null>(null);
  const [resumeName, setResumeName] = useState('');
  const [templateKey, setTemplateKey] = useState('double-column');
  const [serverVersion, setServerVersion] = useState<number>(1);

  // Competitor-Grade Template & Customizer States
  const [isTemplatePickerOpen, setIsTemplatePickerOpen] = useState(false);
  const [isDesignPanelOpen, setIsDesignPanelOpen] = useState(false);
  const [isRearrangeDrawerOpen, setIsRearrangeDrawerOpen] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const resumePrintRef = useRef<HTMLDivElement | null>(null);
  const [isCheckTailorOpen, setIsCheckTailorOpen] = useState(false);
  const [activeMatchId, setActiveMatchId] = useState<string | null>(null);
  const [activeMatchScore, setActiveMatchScore] = useState<number | null>(null);
  const [activeJobKeywords, setActiveJobKeywords] = useState<string[]>([]);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [accentColor, setAccentColor] = useState('#2563eb');
  const [fontFamily, setFontFamily] = useState<'sans' | 'serif' | 'mono'>('sans');
  const [showPhoto, setShowPhoto] = useState(true);
  const [photoUrl, setPhotoUrl] = useState('');
  const [showHighlights, setShowHighlights] = useState(true);
  const [pageSize, setPageSize] = useState<'A4' | 'US Letter'>('A4');

  // Editor Navigation & Layout State
  const [activeSection, setActiveSection] = useState<EditorSection>('experience');
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview' | 'ai'>('editor');
  const [isAiPanelOpen, setIsAiPanelOpen] = useState(true);

  // Autosave & Network State
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved' | 'error' | 'conflict'>('saved');
  const [lastSavedTime, setLastSavedTime] = useState<string>('Just now');
  const [hasConflict, setHasConflict] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const requestSeqRef = useRef<number>(0);

  // AI & Analysis State
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Grammar, Spelling & Buzzword Checker State
  const [isFixMistakesOpen, setIsFixMistakesOpen] = useState(false);
  const [aiWritingReport, setAiWritingReport] = useState<WritingCheckResponse | null>(null);
  const [isRunningAiWritingCheck, setIsRunningAiWritingCheck] = useState(false);
  const [aiWritingCheckError, setAiWritingCheckError] = useState<string | null>(null);
  const [ignoredWritingIssueIds, setIgnoredWritingIssueIds] = useState<string[]>([]);

  // Recruiter Share Link & View Analytics State
  const [isShareDrawerOpen, setIsShareDrawerOpen] = useState(false);
  const [shareState, setShareState] = useState<ResumeShareWithAnalytics | null>(null);
  const [sectionRewriteTarget, setSectionRewriteTarget] = useState<SectionRewriterTarget | null>(null);

  // Active AI Bullet Rewrite Suggestion Modal/Popover State
  const [activeSuggestion, setActiveSuggestion] = useState<{
    expIdx: number;
    bulletIdx: number;
    original: string;
    suggested: string;
    why: string;
    framework: string;
    factualNotes: string;
    metricHint: string;
    variants: BulletVariantOption[];
    selectedVariantIdx: number;
    isLoading: boolean;
    error: string | null;
    provider?: string;
  } | null>(null);

  // AI Bullet Generator State (per Experience role)
  const [bulletGenModal, setBulletGenModal] = useState<{
    expIdx: number;
    roleTitle: string;
    companyName: string;
    focusArea: string;
    isLoading: boolean;
    error: string | null;
    bullets: BulletVariantOption[];
    factualNotes: string;
    insertedIndices: number[];
  } | null>(null);

  // Version History State
  const [versions, setVersions] = useState<ResumeVersion[]>([]);
  const [isVersionDrawerOpen, setIsVersionDrawerOpen] = useState(false);
  const [versionNote, setVersionNote] = useState('');
  const [isSavingVersion, setIsSavingVersion] = useState(false);
  const [isLoadingVersions, setIsLoadingVersions] = useState(false);
  const [isExportingDocx, setIsExportingDocx] = useState(false);

  // Live ATS Score Calculator (mirrors backend scoring engine)
  const liveScore = React.useMemo(() => {
    if (!content) return 0;
    let score = 100;
    
    // Check essential sections
    if (!content.experience || content.experience.length === 0) score -= 20;
    if (!content.education || content.education.length === 0) score -= 20;
    if (!content.skills || content.skills.length === 0) score -= 20;

    // Contact completeness
    if (!content.contact?.email) score -= 10;
    if (!content.headline) score -= 10;

    // Bullets metrics and action verbs density
    const allBullets: string[] = [];
    (content.experience || []).forEach((exp) => {
      (exp.bullets || []).forEach((b) => allBullets.push(b));
    });

    const actionVerbsList = [
      'architected', 'built', 'spearheaded', 'led', 'designed', 'developed',
      'engineered', 'optimized', 'reduced', 'increased', 'scaled', 'implemented',
      'refactored', 'migrated', 'automated', 'streamlined', 'cut', 'delivered',
    ];

    if (allBullets.length > 0) {
      let metricsCount = 0;
      let actionVerbsCount = 0;
      allBullets.forEach((bullet) => {
        const lower = bullet.toLowerCase();
        if (actionVerbsList.some((v) => lower.startsWith(v) || lower.includes(` ${v} `))) actionVerbsCount++;
        if (/\b\d+(%|\+)?\b|\b\$\d+|\b[0-9]+x\b/i.test(bullet)) metricsCount++;
      });

      const metricRatio = metricsCount / allBullets.length;
      if (metricRatio < 0.4) score -= 15;
      else if (metricRatio < 0.6) score -= 5;

      const verbRatio = actionVerbsCount / allBullets.length;
      if (verbRatio < 0.5) score -= 10;
    } else {
      score -= 30;
    }

    return Math.max(10, Math.min(100, score));
  }, [content]);

  const localWritingReport = React.useMemo<WritingCheckResponse>(() => {
    if (!content) {
      return {
        overallWritingScore: 100,
        summaryNote: '',
        issues: [],
        factualVerificationNotes: '',
      };
    }
    return analyzeResumeWriting(content);
  }, [content]);

  const activeWritingReport = React.useMemo<WritingCheckResponse>(() => {
    if (!content || !aiWritingReport) return localWritingReport;
    const stillValidAiIssues = (aiWritingReport.issues || []).filter((issue) => {
      if (issue.locationType === 'headline') {
        return (content.headline || '') === issue.originalText;
      }
      if (issue.locationType === 'summary') {
        return (content.summary || '') === issue.originalText;
      }
      if (
        issue.locationType === 'experience_bullet' &&
        typeof issue.expIdx === 'number' &&
        typeof issue.bulletIdx === 'number'
      ) {
        return (
          (content.experience?.[issue.expIdx]?.bullets?.[issue.bulletIdx] || '') ===
          issue.originalText
        );
      }
      if (
        issue.locationType === 'project_description' &&
        typeof issue.projIdx === 'number'
      ) {
        return (
          (content.projects?.[issue.projIdx]?.description || '') ===
          issue.originalText
        );
      }
      return false;
    });
    return mergeWritingIssues(localWritingReport, {
      ...aiWritingReport,
      issues: stillValidAiIssues,
    });
  }, [content, localWritingReport, aiWritingReport]);

  const visibleWritingIssueCount = React.useMemo(() => {
    const ignored = new Set(ignoredWritingIssueIds);
    return activeWritingReport.issues.filter((i) => !ignored.has(i.id)).length;
  }, [activeWritingReport.issues, ignoredWritingIssueIds]);

  // 1. Initial Data Fetch
  useEffect(() => {
    let isMounted = true;
    async function loadResume() {
      try {
        const res = await apiClient.getResume(resumeId);
        if (!isMounted) return;
        setResume(res);
        setContent(res.content || {
          contact: { fullName: '', email: '' },
          headline: '',
          summary: '',
          skills: [],
          experience: [],
          education: [],
        });
        setResumeName(res.name);
        setTemplateKey(res.templateKey || 'clean-modern');
        if (res.content?.contact?.photoUrl) {
          setPhotoUrl(res.content.contact.photoUrl);
          setShowPhoto(true);
        }
        if (res.content?.layout?.accentColor) {
          setAccentColor(res.content.layout.accentColor);
        }
        if (res.content?.layout?.fontFamily) {
          setFontFamily(res.content.layout.fontFamily);
        }
        setServerVersion(res.version || 1);
        setSaveStatus('saved');
        setLastSavedTime(new Date(res.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

        apiClient
          .getResumeShareAnalytics(resumeId)
          .then((s) => {
            if (isMounted) setShareState(s);
          })
          .catch(() => undefined);
      } catch (err: unknown) {
        if (!isMounted) return;
        setErrorMessage(
          err instanceof Error ? err.message : 'Failed to load resume details.',
        );
      }
    }

    loadResume();
    return () => {
      isMounted = false;
    };
  }, [resumeId]);

  // 2. Debounced Autosave Function with OCC
  const performSave = useCallback(
    async (
      updatedContent: ResumeContent,
      nameToSave: string,
      currentTpl: string,
      expectedVer: number,
    ) => {
      const currentSeq = ++requestSeqRef.current;
      setSaveStatus('saving');

      try {
        const updated = await apiClient.updateResume(resumeId, {
          name: nameToSave,
          templateKey: currentTpl,
          content: updatedContent,
          expectedVersion: expectedVer,
        });

        // Drop stale response
        if (currentSeq !== requestSeqRef.current) return;

        setServerVersion(updated.version);
        setSaveStatus('saved');
        setHasConflict(false);
        setLastSavedTime(
          new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        );
      } catch (err: unknown) {
        if (currentSeq !== requestSeqRef.current) return;

        if (err instanceof ApiError && err.statusCode === 409) {
          setSaveStatus('conflict');
          setHasConflict(true);
        } else {
          setSaveStatus('error');
        }
      }
    },
    [resumeId],
  );

  const scheduleAutosave = useCallback(
    (newContent: ResumeContent, newName = resumeName, newTpl = templateKey) => {
      setSaveStatus('unsaved');
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveTimeoutRef.current = setTimeout(() => {
        performSave(newContent, newName, newTpl, serverVersion);
      }, 800);
    },
    [performSave, resumeName, templateKey, serverVersion],
  );

  // Handlers for Content Modifications
  const updateContent = (updater: (prev: ResumeContent) => ResumeContent) => {
    if (!content) return;
    const next = updater({ ...content });
    setContent(next);
    scheduleAutosave(next);
  };

  const handleRunAudit = async () => {
    if (!content) return;
    setIsAnalyzing(true);
    try {
      const result = await apiClient.runAnalysis(resumeId, {
        analysisType: 'ats_check',
      });
      setAnalysis(result);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Audit failed to run.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRunAiWritingCheck = async () => {
    if (!content) return;
    setIsRunningAiWritingCheck(true);
    setAiWritingCheckError(null);
    try {
      const res = await apiClient.checkWritingQuality({
        headline: content.headline,
        summary: content.summary,
        targetRole: resume?.targetRole,
        experience: (content.experience || []).map((exp) => ({
          title: exp.title,
          company: exp.company,
          current: exp.current,
          endDate: exp.endDate,
          bullets: exp.bullets || [],
        })),
        projects: (content.projects || []).map((proj) => ({
          name: proj.name,
          description: proj.description,
        })),
      });
      setAiWritingReport(res);
    } catch (err: unknown) {
      setAiWritingCheckError(
        err instanceof Error ? err.message : 'AI writing audit failed. Local rule diagnostics remain active.',
      );
    } finally {
      setIsRunningAiWritingCheck(false);
    }
  };

  const handleLocateWritingIssue = (issue: WritingIssueItem) => {
    setIsFixMistakesOpen(false);
    setMobileTab('editor');

    let targetSection: EditorSection = 'summary';
    let targetElId = 'summary-textarea';
    if (issue.locationType === 'headline') {
      targetSection = 'summary';
      targetElId = 'summary-headline';
    } else if (issue.locationType === 'summary') {
      targetSection = 'summary';
      targetElId = 'summary-textarea';
    } else if (issue.locationType === 'experience_bullet') {
      targetSection = 'experience';
      targetElId = `exp-${issue.expIdx ?? 0}-bullet-${issue.bulletIdx ?? 0}`;
    } else if (issue.locationType === 'project_description') {
      targetSection = 'projects';
      targetElId = `proj-${issue.projIdx ?? 0}-desc`;
    }

    setActiveSection(targetSection);
    requestAnimationFrame(() => {
      setTimeout(() => {
        const el = document.getElementById(targetElId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.focus();
        }
      }, 60);
    });
  };

  // Enhance Bullet with live Gemini AI STAR / XYZ formula
  const runAiBulletImprove = async (
    expIdx: number,
    bulletIdx: number,
    currentText: string,
    metricHint: string = '',
  ) => {
    const trimmed = currentText.trim();
    if (!trimmed) return;

    const expRole = content?.experience?.[expIdx]?.title || resume?.targetRole || content?.headline;

    setActiveSuggestion({
      expIdx,
      bulletIdx,
      original: currentText,
      suggested: '',
      why: '',
      framework: 'STAR / XYZ',
      factualNotes: '',
      metricHint,
      variants: [],
      selectedVariantIdx: 0,
      isLoading: true,
      error: null,
    });

    try {
      const res = await apiClient.improveBullet({
        bulletText: trimmed,
        targetRole: expRole || undefined,
        metricHint: metricHint.trim() || undefined,
      });

      const variants: BulletVariantOption[] =
        res.variants && res.variants.length > 0
          ? res.variants
          : [
              {
                style: 'Impact (XYZ)',
                bullet: res.improvedBullet,
                actionVerbUsed: res.actionVerbUsed,
                framework: res.framework,
                rationale: res.explanation,
              },
            ];

      setActiveSuggestion((prev) =>
        prev
          ? {
              ...prev,
              suggested: variants[0]?.bullet || res.improvedBullet,
              why: variants[0]?.rationale || res.explanation,
              framework: variants[0]?.framework || res.framework,
              factualNotes: res.factualVerificationNotes,
              variants,
              selectedVariantIdx: 0,
              isLoading: false,
              error: null,
              provider: res.provider,
            }
          : null,
      );
    } catch (err: unknown) {
      setActiveSuggestion((prev) =>
        prev
          ? {
              ...prev,
              isLoading: false,
              error: err instanceof Error ? err.message : 'AI bullet optimization failed. Please try again.',
            }
          : null,
      );
    }
  };

  const handleEnhanceBullet = (expIdx: number, bulletIdx: number, currentText: string) => {
    if (!currentText.trim()) {
      alert('Please write a brief draft bullet first before optimizing with AI.');
      return;
    }
    void runAiBulletImprove(expIdx, bulletIdx, currentText, '');
  };

  const handleOpenBulletGenerator = (expIdx: number) => {
    const exp = content?.experience?.[expIdx];
    if (!exp) return;
    setBulletGenModal({
      expIdx,
      roleTitle: exp.title || resume?.targetRole || 'Specialist',
      companyName: exp.company || '',
      focusArea: '',
      isLoading: false,
      error: null,
      bullets: [],
      factualNotes: '',
      insertedIndices: [],
    });
  };

  const handleRunBulletGenerator = async () => {
    if (!bulletGenModal || !bulletGenModal.roleTitle.trim()) return;
    const existingBullets = content?.experience?.[bulletGenModal.expIdx]?.bullets || [];

    setBulletGenModal((prev) => (prev ? { ...prev, isLoading: true, error: null } : null));
    try {
      const res = await apiClient.generateBullets({
        roleTitle: bulletGenModal.roleTitle.trim(),
        companyName: bulletGenModal.companyName.trim() || undefined,
        focusArea: bulletGenModal.focusArea.trim() || undefined,
        existingBullets: existingBullets.filter(Boolean),
        targetRole: resume?.targetRole || undefined,
      });

      setBulletGenModal((prev) =>
        prev
          ? {
              ...prev,
              isLoading: false,
              bullets: res.bullets || [],
              factualNotes: res.factualVerificationNotes || '',
              insertedIndices: [],
            }
          : null,
      );
    } catch (err: unknown) {
      setBulletGenModal((prev) =>
        prev
          ? {
              ...prev,
              isLoading: false,
              error: err instanceof Error ? err.message : 'Failed to generate AI bullets.',
            }
          : null,
      );
    }
  };

  const handleInsertGeneratedBullet = (bulletText: string, idx: number) => {
    if (!bulletGenModal) return;
    const { expIdx } = bulletGenModal;
    updateContent((prev) => {
      const expList = [...(prev.experience || [])];
      if (expList[expIdx]) {
        const cleanedExisting = expList[expIdx].bullets.filter((b) => b.trim().length > 0);
        expList[expIdx] = {
          ...expList[expIdx],
          bullets: [...cleanedExisting, bulletText],
        };
      }
      return { ...prev, experience: expList };
    });
    setBulletGenModal((prev) =>
      prev
        ? {
            ...prev,
            insertedIndices: prev.insertedIndices.includes(idx)
              ? prev.insertedIndices
              : [...prev.insertedIndices, idx],
          }
        : null,
    );
  };

  const handleApplySuggestion = () => {
    if (!activeSuggestion || !content) return;
    const { expIdx, bulletIdx, suggested } = activeSuggestion;
    updateContent((prev) => {
      const expList = [...(prev.experience || [])];
      if (expList[expIdx]) {
        const bullets = [...expList[expIdx].bullets];
        bullets[bulletIdx] = suggested;
        expList[expIdx] = { ...expList[expIdx], bullets };
      }
      return { ...prev, experience: expList };
    });
    setActiveSuggestion(null);
  };

  const handleMatchChange = useCallback((score: number | null, keywords: string[]) => {
    setActiveMatchScore(score);
    setActiveJobKeywords((prev) => {
      if (prev.length === keywords.length && prev.every((k, i) => k === keywords[i])) {
        return prev;
      }
      return keywords;
    });
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const mId = params.get('matchId');
    const openTailor = params.get('tailor');
    if (mId) setActiveMatchId(mId);
    if (openTailor === '1' || openTailor === 'true') setIsCheckTailorOpen(true);
  }, []);

  // Version Snapshots & Rollback
  const handleOpenVersions = async () => {
    setIsVersionDrawerOpen(true);
    setIsLoadingVersions(true);
    try {
      const data = await apiClient.listVersions(resumeId);
      setVersions(data);
    } catch {
      // Ignore version fetch error
    } finally {
      setIsLoadingVersions(false);
    }
  };

  const handleCreateVersionSnapshot = async () => {
    if (!versionNote.trim() || !content) return;
    setIsSavingVersion(true);
    try {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }
      if (saveStatus === 'unsaved' || saveStatus === 'error') {
        await performSave(content, resumeName, templateKey, serverVersion);
      }

      const v = await apiClient.createVersion(resumeId, {
        changeSummary: versionNote.trim(),
      });
      setVersions((prev) => [v, ...prev]);
      setVersionNote('');
    } finally {
      setIsSavingVersion(false);
    }
  };

  const handleRestoreVersion = async (ver: ResumeVersion) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }
    ++requestSeqRef.current;

    const restored = await apiClient.restoreVersion(resumeId, ver.id);
    setContent(restored.content);
    setServerVersion(restored.version);
    setHasConflict(false);
    setSaveStatus('saved');
    setLastSavedTime(
      new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    );

    const refreshed = await apiClient.listVersions(resumeId);
    setVersions(refreshed);
  };

  const handleExportDocx = async () => {
    if (!content || isExportingDocx) return;
    setIsExportingDocx(true);
    try {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }
      if (saveStatus === 'unsaved' || saveStatus === 'error') {
        await performSave(content, resumeName, templateKey, serverVersion);
      }

      const result = await apiClient.exportResumeDocx(resumeId, {
        pageSize,
        fileName: resumeName,
      });
      downloadExportBlob(result.blob, result.fileName, '.docx');
    } catch (err) {
      console.error('DOCX export error:', err);
      setErrorMessage(
        err instanceof Error ? err.message : 'Unable to export DOCX file. Please try again.',
      );
    } finally {
      setIsExportingDocx(false);
    }
  };

  const handleUpdateLayout = useCallback(
    (nextLayout: ResumeLayoutSettings) => {
      updateContent((prev) => ({
        ...prev,
        layout: nextLayout,
      }));
    },
    [updateContent],
  );

  useLayoutEffect(() => {
    if (!resumePrintRef.current || !content) return;
    applyResumeLayoutToDom(
      resumePrintRef.current,
      content.layout,
      content.customSections,
    );
  }, [content, templateKey, accentColor, fontFamily, showPhoto, showHighlights, isExportModalOpen, pageSize]);

  // Conflict Resolution
  const handleReloadServerVersion = async () => {
    try {
      const res = await apiClient.getResume(resumeId);
      setResume(res);
      setContent(res.content);
      setServerVersion(res.version);
      setHasConflict(false);
      setSaveStatus('saved');
    } catch {
      window.location.reload();
    }
  };

  if (!content) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-sm text-zinc-500 animate-pulse flex items-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin" />
          Loading resume editor...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-[1600px] mx-auto print:space-y-0 print:p-0 print:m-0 print:max-w-none">
      {errorMessage && (
        <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs">
          {errorMessage}
        </div>
      )}
      {/* Top Action Bar */}
      <div className="print:hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <Link
            href="/app/resumes"
            className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-900 transition-colors"
            title="Back to Resumes"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={resumeName}
                onChange={(e) => {
                  setResumeName(e.target.value);
                  scheduleAutosave(content, e.target.value, templateKey);
                }}
                className="text-base sm:text-lg font-bold bg-transparent border-b border-transparent hover:border-zinc-300 focus:border-blue-600 focus:outline-none text-zinc-900 dark:text-zinc-50 px-1"
              />
              {resume?.isMaster && (
                <Badge variant="success">Master</Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-500 mt-0.5 px-1">
              <span>v{serverVersion}</span>
              <span>·</span>
              <span className="flex items-center gap-1">
                {saveStatus === 'saving' && (
                  <span className="text-blue-600 animate-pulse">Saving changes...</span>
                )}
                {saveStatus === 'saved' && (
                  <span className="text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Saved ({lastSavedTime})
                  </span>
                )}
                {saveStatus === 'unsaved' && (
                  <span className="text-amber-600">Unsaved edits</span>
                )}
                {saveStatus === 'error' && (
                  <span className="text-rose-600">Error saving (local edits preserved)</span>
                )}
                {saveStatus === 'conflict' && (
                  <span className="text-rose-600 font-semibold">Version conflict!</span>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Top Control Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Template Switcher */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-zinc-500 hidden sm:inline">Template:</span>
            <select
              value={templateKey}
              onChange={(e) => {
                const newTpl = e.target.value;
                setTemplateKey(newTpl);
                scheduleAutosave(content, resumeName, newTpl);
              }}
              className="text-xs py-1.5 px-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 font-medium focus:ring-2 focus:ring-blue-600"
            >
              {AVAILABLE_TEMPLATES.map((tpl) => (
                <option key={tpl.key} value={tpl.key}>
                  {tpl.name} ({tpl.category})
                </option>
              ))}
            </select>
          </div>

          {/* Version History Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenVersions}
            className="gap-1.5 text-xs"
          >
            <History className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Versions</span>
          </Button>

          {/* Cover Letter Deep Link */}
          <Link href={`/app/cover-letters?resumeId=${resumeId}`}>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs"
            >
              <Mail className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span className="hidden sm:inline">Cover Letter</span>
            </Button>
          </Link>

          {/* Direct PDF Export */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExportModalOpen(true)}
            className="gap-1.5 text-xs font-semibold px-2.5 sm:px-3 text-emerald-700 dark:text-emerald-300 border-emerald-300/80 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Download PDF</span>
            <span className="sm:hidden">PDF</span>
          </Button>

          {/* Direct Word (.docx) Export */}
          <Button
            id="export-resume-docx-btn"
            variant="outline"
            size="sm"
            isLoading={isExportingDocx}
            onClick={handleExportDocx}
            className="gap-1.5 text-xs font-semibold px-2.5 sm:px-3 text-blue-700 dark:text-blue-300 border-blue-300/80 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950/40"
            title="Download editable Microsoft Word (.docx)"
          >
            <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span className="hidden sm:inline">Export DOCX</span>
            <span className="sm:hidden">DOCX</span>
          </Button>

          {/* Toggle AI Panel Button (Desktop) */}
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAiPanelOpen(!isAiPanelOpen)}
            className="hidden lg:flex gap-1.5 text-xs font-semibold"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isAiPanelOpen ? 'Hide Audit' : 'Show Audit'}</span>
          </Button>
        </div>
      </div>

      {/* Competitor-Style Secondary Action Toolbar (Screenshot 1 & 3) */}
      <div className="print:hidden flex items-center justify-between py-2 px-3 sm:px-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs shadow-xs overflow-x-auto gap-2">
        <div className="flex items-center gap-1 sm:gap-3 flex-wrap">
          {/* Fix Mistakes Button (Live Grammar, Spelling & Buzzword Checker) */}
          <button
            id="fix-mistakes-btn"
            type="button"
            onClick={() => setIsFixMistakesOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Inspect grammar, spelling, buzzwords, and weak phrasing with 1-click fixes"
          >
            <CheckCircle2
              className={`w-4 h-4 ${
                visibleWritingIssueCount === 0
                  ? 'text-emerald-600'
                  : 'text-amber-500'
              }`}
            />
            <span className="font-semibold">Fix Mistakes</span>
            <span
              id="fix-mistakes-badge"
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold text-white shadow-xs ${
                visibleWritingIssueCount === 0
                  ? 'bg-emerald-600'
                  : 'bg-rose-500'
              }`}
            >
              {visibleWritingIssueCount}
            </span>
          </button>

          {/* ATS Check & Tailor Button */}
          <button
            type="button"
            onClick={() => setIsCheckTailorOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <span className="font-mono font-bold text-[11px] text-blue-600 dark:text-blue-400">
              ATS
            </span>
            <span className="font-semibold">Check &amp; Tailor</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-emerald-600 text-white shadow-xs">
              {activeMatchScore !== null ? `${activeMatchScore}%` : 'Match JD'}
            </span>
          </button>

          {/* Rearrange Section Button */}
          <button
            id="rearrange-sections-btn"
            type="button"
            onClick={() => setIsRearrangeDrawerOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Drag & drop to reorder or hide resume sections"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Rearrange</span>
          </button>

          {/* Templates Drawer Button */}
          <button
            type="button"
            onClick={() => setIsTemplatePickerOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors shadow-2xs"
          >
            <LayoutTemplate className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Templates</span>
          </button>

          {/* Color Button (opens Design panel) */}
          <button
            type="button"
            onClick={() => setIsDesignPanelOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title="Customize accent colors"
          >
            <Palette className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span>Color</span>
            <span
              className="w-2.5 h-2.5 rounded-full border border-black/10 dark:border-white/20 inline-block shrink-0"
              style={{ backgroundColor: accentColor }}
            />
          </button>

          {/* Font Button (opens Design panel) */}
          <button
            type="button"
            onClick={() => setIsDesignPanelOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Customize typography & font family"
          >
            <Type className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Font</span>
          </button>

          {/* Layout & Spacing Button (opens Design panel) */}
          <button
            id="design-spacing-btn"
            type="button"
            onClick={() => setIsDesignPanelOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Customize font scale, line height, margins & section spacing"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            <span>Spacing</span>
          </button>

          {/* Photo Button (opens 2-option Upload/Link modal) */}
          <button
            type="button"
            onClick={() => setIsPhotoModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title="Upload profile picture or paste image link"
          >
            <Camera className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Photo</span>
            {photoUrl && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
            )}
          </button>
        </div>

        {/* Right Utility Buttons */}
        <div className="flex items-center gap-1 text-zinc-500 shrink-0">
          <button
            type="button"
            onClick={() => setShowHighlights(!showHighlights)}
            className={`p-1.5 rounded-lg border transition-colors flex items-center gap-1 text-[11px] font-medium ${
              showHighlights
                ? 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300'
                : 'border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:text-zinc-800'
            }`}
            title={showHighlights ? 'Hide ATS Keyword Highlights' : 'Show ATS Keyword Highlights'}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden md:inline">{showHighlights ? 'Keywords On' : 'Keywords Off'}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsExportModalOpen(true)}
            className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition-colors"
            title="Download PDF Directly"
          >
            <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </button>

          <button
            id="share-analytics-btn"
            type="button"
            onClick={() => setIsShareDrawerOpen(true)}
            className={`px-2.5 py-1.5 rounded-lg border transition-colors flex items-center gap-1.5 text-[11px] font-semibold cursor-pointer ${
              shareState?.share?.isActive
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300'
                : 'border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200'
            }`}
            title="Public Recruiter Link & Share Analytics"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
            {shareState?.share?.isActive && (
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-600 text-white text-[10px] font-mono">
                {shareState.analytics.totalViews}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Sticky Segmented Navigation (< lg) */}
      <div className="print:hidden lg:hidden sticky top-0 z-20 pb-3 pt-1 bg-zinc-50/95 dark:bg-zinc-950/95 backdrop-blur-xs">
        <div className="grid grid-cols-3 p-1 rounded-xl bg-zinc-200/80 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-xs shadow-inner">
          <button
            onClick={() => setMobileTab('editor')}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-lg font-semibold transition-all ${
              mobileTab === 'editor'
                ? 'bg-white dark:bg-zinc-900 shadow-sm text-blue-600 dark:text-blue-400'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Form</span>
          </button>
          <button
            onClick={() => setMobileTab('preview')}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-lg font-semibold transition-all ${
              mobileTab === 'preview'
                ? 'bg-white dark:bg-zinc-900 shadow-sm text-blue-600 dark:text-blue-400'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Live Canvas</span>
            <span className="sm:hidden">Canvas</span>
          </button>
          <button
            onClick={() => setMobileTab('ai')}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-lg font-semibold transition-all ${
              mobileTab === 'ai'
                ? 'bg-white dark:bg-zinc-900 shadow-sm text-blue-600 dark:text-blue-400'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Audit</span>
          </button>
        </div>
      </div>

      {/* Conflict Resolution Banner */}
      {hasConflict && (
        <div className="print:hidden p-4 rounded-xl border border-rose-300 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>
              A newer version of this resume was committed from another session. You can reload the remote version or force-overwrite with your edits.
            </span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReloadServerVersion}
              className="text-xs"
            >
              Load Server Version
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => performSave(content, resumeName, templateKey, serverVersion + 1)}
              className="text-xs"
            >
              Overwrite
            </Button>
          </div>
        </div>
      )}

      {/* Main 3-Panel Desktop Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start print:block print:w-full print:m-0 print:p-0">
        {/* PANEL 1: Left Section Editor (4 or 5 cols depending on AI panel) - hidden on print */}
        <div className={`print:hidden ${isAiPanelOpen ? 'lg:col-span-4 xl:col-span-4' : 'lg:col-span-5'} space-y-3 ${mobileTab !== 'editor' ? 'hidden lg:block' : ''}`}>
          {/* Section Navigation Tabs (Single-Row Accessible Scrollable Tablist) */}
          <div
            role="tablist"
            aria-label="Resume Editor Sections"
            className="hr-editor-tabs flex items-center gap-1 p-1 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 overflow-x-auto text-xs font-medium"
          >
            {(
              [
                { id: 'contact', label: 'Contact' },
                { id: 'summary', label: 'Summary' },
                { id: 'experience', label: 'Experience' },
                { id: 'skills', label: 'Skills' },
                { id: 'education', label: 'Education' },
                { id: 'projects', label: 'Projects' },
                { id: 'certifications', label: 'Certs' },
                {
                  id: 'custom',
                  label:
                    (content.customSections || []).length > 0
                      ? `Custom (${(content.customSections || []).length})`
                      : 'Custom',
                },
              ] as const
            ).map((s, tabIdx, tabArr) => (
              <button
                key={s.id}
                type="button"
                role="tab"
                data-testid={`editor-tab-${s.id}`}
                aria-selected={activeSection === s.id}
                tabIndex={activeSection === s.id ? 0 : -1}
                onClick={(e) => {
                  setActiveSection(s.id);
                  e.currentTarget.scrollIntoView({
                    block: 'nearest',
                    inline: 'nearest',
                  });
                }}
                onKeyDown={(e) => {
                  let nextIdx = -1;
                  if (e.key === 'ArrowRight') nextIdx = (tabIdx + 1) % tabArr.length;
                  else if (e.key === 'ArrowLeft')
                    nextIdx = (tabIdx - 1 + tabArr.length) % tabArr.length;
                  else if (e.key === 'Home') nextIdx = 0;
                  else if (e.key === 'End') nextIdx = tabArr.length - 1;
                  if (nextIdx >= 0) {
                    e.preventDefault();
                    const nextTab = tabArr[nextIdx];
                    setActiveSection(nextTab.id);
                    const tabBtn = e.currentTarget.parentElement?.querySelector<HTMLButtonElement>(
                      `[data-testid="editor-tab-${nextTab.id}"]`,
                    );
                    tabBtn?.focus();
                    tabBtn?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
                  }
                }}
                className={`flex-none px-3 py-1.5 rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                  activeSection === s.id
                    ? 'bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 font-semibold shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Form Fields for Active Section */}
          <div className="p-4 sm:p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-4">
            {/* 1. Contact Information */}
            {activeSection === 'contact' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Contact Information
                </h3>
                <Input
                  id="contact-fullname"
                  label="Full Name"
                  value={content.contact.fullName}
                  onChange={(e) =>
                    updateContent((prev) => ({
                      ...prev,
                      contact: { ...prev.contact, fullName: e.target.value },
                    }))
                  }
                  required
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    id="contact-email"
                    label="Email Address"
                    type="email"
                    value={content.contact.email}
                    onChange={(e) =>
                      updateContent((prev) => ({
                        ...prev,
                        contact: { ...prev.contact, email: e.target.value },
                      }))
                    }
                    required
                  />
                  <Input
                    id="contact-phone"
                    label="Phone Number"
                    value={content.contact.phone || ''}
                    onChange={(e) =>
                      updateContent((prev) => ({
                        ...prev,
                        contact: { ...prev.contact, phone: e.target.value },
                      }))
                    }
                  />
                </div>
                <Input
                  id="contact-location"
                  label="Location (City, Country)"
                  value={content.contact.location || ''}
                  onChange={(e) =>
                    updateContent((prev) => ({
                      ...prev,
                      contact: { ...prev.contact, location: e.target.value },
                    }))
                  }
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    id="contact-linkedin"
                    label="LinkedIn Profile URL"
                    value={content.contact.linkedinUrl || ''}
                    onChange={(e) =>
                      updateContent((prev) => ({
                        ...prev,
                        contact: { ...prev.contact, linkedinUrl: e.target.value },
                      }))
                    }
                  />
                  <Input
                    id="contact-github"
                    label="GitHub Profile URL"
                    value={content.contact.githubUrl || ''}
                    onChange={(e) =>
                      updateContent((prev) => ({
                        ...prev,
                        contact: { ...prev.contact, githubUrl: e.target.value },
                      }))
                    }
                  />
                </div>
              </div>
            )}

            {/* 2. Professional Summary & Headline */}
            {activeSection === 'summary' && (
              <div className="space-y-4">
                {Boolean(content.summary?.trim()) && (
                  <div className="flex items-center justify-between gap-2 pb-2 border-b border-zinc-100 dark:border-zinc-800">
                    <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
                      Need a specific tone rewrite on your existing summary?
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      data-testid="rewrite-summary-section-btn"
                      onClick={() =>
                        setSectionRewriteTarget({
                          sectionType: 'summary',
                          sectionLabel: 'Professional Summary',
                        })
                      }
                      className="gap-1 text-xs text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800"
                    >
                      <Wand2 className="w-3.5 h-3.5" />
                      <span>AI Rewrite Section</span>
                    </Button>
                  </div>
                )}
                <SummaryHeadlinePanel
                  content={content}
                  onUpdateHeadline={(headline) =>
                    updateContent((prev) => ({
                      ...prev,
                      headline,
                    }))
                  }
                  onUpdateSummary={(summary) =>
                    updateContent((prev) => ({
                      ...prev,
                      summary,
                    }))
                  }
                />
              </div>
            )}

            {/* 3. Work Experience */}
            {activeSection === 'experience' && (
              <div className="space-y-5">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    Work Experience ({(content.experience || []).length})
                  </h3>
                  <div className="flex items-center gap-1.5">
                    {(content.experience || []).length > 0 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        data-testid="rewrite-experience-section-btn"
                        onClick={() =>
                          setSectionRewriteTarget({
                            sectionType: 'experience',
                            sectionLabel: 'Work Experience',
                          })
                        }
                        className="gap-1 text-xs text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800"
                      >
                        <Wand2 className="w-3.5 h-3.5" />
                        <span>AI Rewrite Section</span>
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        updateContent((prev) => ({
                          ...prev,
                          experience: [
                            {
                              company: 'New Company',
                              title: 'Role Title',
                              startDate: '2023',
                              current: true,
                              bullets: ['Accomplished [X] by doing [Y], resulting in [Z].'],
                            },
                            ...(prev.experience || []),
                          ],
                        }))
                      }
                      className="gap-1 text-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Role</span>
                    </Button>
                  </div>
                </div>

                {(content.experience || []).map((exp, expIdx) => (
                  <div
                    key={expIdx}
                    className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="grid grid-cols-2 gap-2 flex-1">
                        <input
                          type="text"
                          placeholder="Role Title"
                          value={exp.title}
                          onChange={(e) =>
                            updateContent((prev) => {
                              const list = [...(prev.experience || [])];
                              list[expIdx] = { ...list[expIdx], title: e.target.value };
                              return { ...prev, experience: list };
                            })
                          }
                          className="text-xs font-bold p-1.5 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                        />
                        <input
                          type="text"
                          placeholder="Company"
                          value={exp.company}
                          onChange={(e) =>
                            updateContent((prev) => {
                              const list = [...(prev.experience || [])];
                              list[expIdx] = { ...list[expIdx], company: e.target.value };
                              return { ...prev, experience: list };
                            })
                          }
                          className="text-xs font-semibold p-1.5 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                        />
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          data-testid={`rewrite-experience-role-${expIdx}`}
                          onClick={() =>
                            setSectionRewriteTarget({
                              sectionType: 'experience',
                              sectionLabel: `${exp.title || 'Role'} @ ${exp.company || 'Company'}`,
                              experienceIndex: expIdx,
                            })
                          }
                          className="px-2 py-1 rounded text-[10.5px] font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 inline-flex items-center gap-1 transition-colors cursor-pointer"
                          title="Rewrite all bullets in this role with AI"
                        >
                          <Wand2 className="w-3 h-3" />
                          <span>Rewrite Role</span>
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            updateContent((prev) => ({
                              ...prev,
                              experience: prev.experience.filter((_, i) => i !== expIdx),
                            }))
                          }
                          className="p-1.5 text-zinc-400 hover:text-rose-600 transition-colors"
                          title="Remove role"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <input
                        type="text"
                        placeholder="Start Date (e.g. 2021)"
                        value={exp.startDate}
                        onChange={(e) =>
                          updateContent((prev) => {
                            const list = [...(prev.experience || [])];
                            list[expIdx] = { ...list[expIdx], startDate: e.target.value };
                            return { ...prev, experience: list };
                          })
                        }
                        className="text-xs p-1.5 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                      />
                      <input
                        type="text"
                        placeholder="End Date (or Present)"
                        value={exp.endDate || ''}
                        onChange={(e) =>
                          updateContent((prev) => {
                            const list = [...(prev.experience || [])];
                            list[expIdx] = { ...list[expIdx], endDate: e.target.value };
                            return { ...prev, experience: list };
                          })
                        }
                        className="text-xs p-1.5 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                      />
                    </div>

                    {/* Bullets List */}
                    <div className="space-y-2 pt-2 border-t border-zinc-200 dark:border-zinc-700">
                      <div className="flex items-center justify-between text-xs text-zinc-500">
                        <span>STAR / XYZ Impact Bullets</span>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => handleOpenBulletGenerator(expIdx)}
                            className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
                            title="Generate role-tailored STAR/XYZ bullets with AI"
                          >
                            <Wand2 className="w-3 h-3" />
                            <span>AI Generate</span>
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              updateContent((prev) => {
                                const list = [...(prev.experience || [])];
                                list[expIdx].bullets = [...list[expIdx].bullets, ''];
                                return { ...prev, experience: list };
                              })
                            }
                            className="text-blue-600 hover:underline font-semibold"
                          >
                            + Add Bullet
                          </button>
                        </div>
                      </div>

                      {exp.bullets.map((bullet, bulletIdx) => (
                        <div key={bulletIdx} className="space-y-1">
                          <div className="flex items-start gap-1.5">
                            <textarea
                              id={`exp-${expIdx}-bullet-${bulletIdx}`}
                              rows={2}
                              value={bullet}
                              onChange={(e) =>
                                updateContent((prev) => {
                                  const list = [...(prev.experience || [])];
                                  list[expIdx].bullets[bulletIdx] = e.target.value;
                                  return { ...prev, experience: list };
                                })
                              }
                              placeholder="Describe outcome with metrics (e.g. Led migration reducing p99 latency by 34%)..."
                              className="flex-1 text-xs p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-600 leading-relaxed"
                            />
                            <div className="flex flex-col gap-1">
                              <button
                                onClick={() => handleEnhanceBullet(expIdx, bulletIdx, bullet)}
                                className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded transition-colors"
                                title="Enhance with STAR / XYZ formula"
                              >
                                <Sparkles className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() =>
                                  updateContent((prev) => {
                                    const list = [...(prev.experience || [])];
                                    list[expIdx].bullets = list[expIdx].bullets.filter((_, i) => i !== bulletIdx);
                                    return { ...prev, experience: list };
                                  })
                                }
                                className="p-1 text-zinc-400 hover:text-rose-600 rounded"
                                title="Delete bullet"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 4. Skills Section */}
            {activeSection === 'skills' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    Verified Technical Skills ({(content.skills || []).length})
                  </h3>
                </div>

                <div className="flex flex-wrap gap-2">
                  {(content.skills || []).map((skill, sIdx) => (
                    <span
                      key={sIdx}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700"
                    >
                      <span>{skill.name}</span>
                      <button
                        onClick={() =>
                          updateContent((prev) => ({
                            ...prev,
                            skills: prev.skills.filter((_, i) => i !== sIdx),
                          }))
                        }
                        className="text-zinc-400 hover:text-rose-600"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex gap-2 pt-2">
                  <input
                    id="new-skill-input"
                    type="text"
                    placeholder="Type skill name (e.g. Kafka, Docker, Go)..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const val = (e.target as HTMLInputElement).value.trim();
                        if (val) {
                          updateContent((prev) => ({
                            ...prev,
                            skills: [...(prev.skills || []), { name: val }],
                          }));
                          (e.target as HTMLInputElement).value = '';
                        }
                      }
                    }}
                    className="flex-1 text-xs p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const input = document.getElementById('new-skill-input') as HTMLInputElement;
                      if (input?.value.trim()) {
                        updateContent((prev) => ({
                          ...prev,
                          skills: [...(prev.skills || []), { name: input.value.trim() }],
                        }));
                        input.value = '';
                      }
                    }}
                  >
                    Add
                  </Button>
                </div>
              </div>
            )}

            {/* 5. Education Section */}
            {activeSection === 'education' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    Education ({(content.education || []).length})
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      updateContent((prev) => ({
                        ...prev,
                        education: [
                          ...(prev.education || []),
                          {
                            school: 'University Name',
                            degree: 'Bachelor of Science',
                            field: 'Computer Science',
                            graduationDate: '2021',
                          },
                        ],
                      }))
                    }
                    className="gap-1 text-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Degree</span>
                  </Button>
                </div>

                {(content.education || []).map((edu, eduIdx) => (
                  <div
                    key={eduIdx}
                    className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <input
                        type="text"
                        placeholder="School / University"
                        value={edu.school}
                        onChange={(e) =>
                          updateContent((prev) => {
                            const list = [...(prev.education || [])];
                            list[eduIdx] = { ...list[eduIdx], school: e.target.value };
                            return { ...prev, education: list };
                          })
                        }
                        className="font-bold p-1 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 flex-1 mr-2"
                      />
                      <button
                        onClick={() =>
                          updateContent((prev) => ({
                            ...prev,
                            education: prev.education.filter((_, i) => i !== eduIdx),
                          }))
                        }
                        className="text-zinc-400 hover:text-rose-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Degree"
                        value={edu.degree}
                        onChange={(e) =>
                          updateContent((prev) => {
                            const list = [...(prev.education || [])];
                            list[eduIdx] = { ...list[eduIdx], degree: e.target.value };
                            return { ...prev, education: list };
                          })
                        }
                        className="p-1 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                      />
                      <input
                        type="text"
                        placeholder="Field of Study"
                        value={edu.field}
                        onChange={(e) =>
                          updateContent((prev) => {
                            const list = [...(prev.education || [])];
                            list[eduIdx] = { ...list[eduIdx], field: e.target.value };
                            return { ...prev, education: list };
                          })
                        }
                        className="p-1 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 6. Projects Section */}
            {activeSection === 'projects' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    Projects ({(content.projects || []).length})
                  </h3>
                  <div className="flex items-center gap-1.5">
                    {(content.projects || []).length > 0 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        data-testid="rewrite-projects-section-btn"
                        onClick={() =>
                          setSectionRewriteTarget({
                            sectionType: 'projects',
                            sectionLabel: 'Projects',
                          })
                        }
                        className="gap-1 text-xs text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800"
                      >
                        <Wand2 className="w-3.5 h-3.5" />
                        <span>AI Rewrite Section</span>
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        updateContent((prev) => ({
                          ...prev,
                          projects: [
                            ...(prev.projects || []),
                            {
                              name: 'Project Title',
                              description: 'High-throughput system built with Node.js and PostgreSQL',
                              highlights: ['Reduced latency by 40% across 500k queries'],
                            },
                          ],
                        }))
                      }
                      className="gap-1 text-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Project</span>
                    </Button>
                  </div>
                </div>

                {(content.projects || []).map((proj, projIdx) => (
                  <div
                    key={projIdx}
                    className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <input
                        type="text"
                        placeholder="Project Name"
                        value={proj.name}
                        onChange={(e) =>
                          updateContent((prev) => {
                            const list = [...(prev.projects || [])];
                            list[projIdx] = { ...list[projIdx], name: e.target.value };
                            return { ...prev, projects: list };
                          })
                        }
                        className="font-bold p-1 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 flex-1 mr-2"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          updateContent((prev) => ({
                            ...prev,
                            projects: (prev.projects || []).filter((_, i) => i !== projIdx),
                          }))
                        }
                        className="text-zinc-400 hover:text-rose-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <textarea
                      id={`proj-${projIdx}-desc`}
                      rows={2}
                      placeholder="Project description and key technical architecture..."
                      value={proj.description}
                      onChange={(e) =>
                        updateContent((prev) => {
                          const list = [...(prev.projects || [])];
                          list[projIdx] = { ...list[projIdx], description: e.target.value };
                          return { ...prev, projects: list };
                        })
                      }
                      className="w-full p-1.5 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* 7. Certifications */}
            {activeSection === 'certifications' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    Certifications &amp; Licenses
                  </h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      updateContent((prev) => ({
                        ...prev,
                        certifications: [
                          ...(prev.certifications || []),
                          { name: '', issuer: '', issueDate: '' },
                        ],
                      }))
                    }
                    className="gap-1.5 text-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Certification</span>
                  </Button>
                </div>

                {(content.certifications || []).length === 0 ? (
                  <p className="text-xs text-zinc-500 py-4 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg">
                    No certifications added yet. Click &quot;Add Certification&quot; to include AWS, GCP, PMP, or other credentials.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {(content.certifications || []).map((cert, idx) => (
                      <div
                        key={cert.id || idx}
                        className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 space-y-2.5 text-xs"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-zinc-600 dark:text-zinc-400">
                            Certification #{idx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              updateContent((prev) => ({
                                ...prev,
                                certifications: (prev.certifications || []).filter((_, i) => i !== idx),
                              }))
                            }
                            className="text-zinc-400 hover:text-rose-600 p-1 rounded"
                            aria-label="Remove certification"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <input
                          type="text"
                          placeholder="Certification Name (e.g. AWS Solutions Architect)"
                          value={cert.name || ''}
                          onChange={(e) =>
                            updateContent((prev) => ({
                              ...prev,
                              certifications: (prev.certifications || []).map((c, i) =>
                                i === idx ? { ...c, name: e.target.value } : c,
                              ),
                            }))
                          }
                          className="w-full p-2 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                        />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input
                            type="text"
                            placeholder="Issuing Organization (e.g. Amazon Web Services)"
                            value={cert.issuer || ''}
                            onChange={(e) =>
                              updateContent((prev) => ({
                                ...prev,
                                certifications: (prev.certifications || []).map((c, i) =>
                                  i === idx ? { ...c, issuer: e.target.value } : c,
                                ),
                              }))
                            }
                            className="w-full p-2 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                          />
                          <input
                            type="text"
                            placeholder="Issue Date (e.g. 2025)"
                            value={cert.issueDate || ''}
                            onChange={(e) =>
                              updateContent((prev) => ({
                                ...prev,
                                certifications: (prev.certifications || []).map((c, i) =>
                                  i === idx ? { ...c, issueDate: e.target.value } : c,
                                ),
                              }))
                            }
                            className="w-full p-2 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 8. Custom Sections */}
            {activeSection === 'custom' && (
              <CustomSectionsPanel
                content={content}
                onUpdateContent={updateContent}
                onOpenSectionRewriter={(target) => setSectionRewriteTarget(target)}
              />
            )}
          </div>
        </div>

        {/* PANEL 2: Centre Live ATS Preview (expanded when AI panel is closed) */}
        <div
          className={`${
            isAiPanelOpen ? 'lg:col-span-8 xl:col-span-5' : 'lg:col-span-7'
          } space-y-3 print:space-y-0 print:p-0 print:m-0 print:w-full print:block ${mobileTab !== 'preview' ? 'hidden lg:block' : ''}`}
        >
          {/* Document Canvas Preview Card */}
          <div className="p-4 sm:p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-[#F7F8FA] dark:bg-[#111317] print:p-0 print:border-none print:shadow-none print:bg-transparent">
            <div className="print:hidden flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500 mb-4">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                  ATS Document Canvas
                </span>
                <span className="text-[10px] text-zinc-400 font-mono hidden sm:inline">
                  ({pageSize === 'A4' ? 'A4 Format' : 'US Letter (8.5" x 11")'})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsTemplatePickerOpen(true)}
                  className="font-medium text-[11px] bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-2.5 py-1 rounded-md text-zinc-700 dark:text-zinc-300 hover:border-zinc-400 transition-colors flex items-center gap-1.5 shadow-2xs"
                >
                  <LayoutTemplate className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Choose Template</span>
                </button>
              </div>
            </div>

            {/* Scrollable Container on Mobile */}
            <div className="overflow-x-auto pb-2 print:overflow-visible print:pb-0">
              <div ref={resumePrintRef} id="resume-document-print" className="w-full">
                {(() => {
                  const TemplateComponent = getTemplateComponent(templateKey);
                  return (
                    <TemplateComponent
                      content={content}
                      accentColor={accentColor}
                      fontFamily={fontFamily}
                      showPhoto={showPhoto}
                      photoUrl={photoUrl}
                      highlightKeywords={activeJobKeywords.length > 0 ? activeJobKeywords : undefined}
                      showHighlights={isExportModalOpen ? false : showHighlights}
                    />
                  );
                })()}
              </div>
            </div>
          </div>
        </div>

        {/* PANEL 3: Right AI Recommendations, Live Meter & Findings - hidden on print */}
        {isAiPanelOpen && (
          <div
            className={`print:hidden lg:col-span-4 xl:col-span-3 space-y-3 ${
              mobileTab !== 'ai' ? 'hidden lg:block' : ''
            }`}
          >
            {/* Live ATS Score Meter Card */}
            <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400" />
                  <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                    Resume Alignment Score
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAiPanelOpen(false)}
                  className="p-1 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  title="Close AI Panel"
                  aria-label="Close AI Panel"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Live Semi-Circle Meter */}
              <div className="pt-3 pb-1">
                <ScoreMeter score={analysis?.score ?? liveScore} />
              </div>

              <p className="text-[11px] text-zinc-500 text-center mt-1">
                HypeResume internal comparison metric evaluating quantified outcomes, action verbs, and section completeness.
              </p>
            </div>

            {/* Deep AI Audit Card */}
            <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
                  <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                    Evidence Audit
                  </h3>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRunAudit}
                  isLoading={isAnalyzing}
                  className="text-xs py-1 px-2.5 font-medium"
                >
                  Run Audit
                </Button>
              </div>

              {analysis ? (
                <AtsAuditBreakdown
                  findings={analysis.findings}
                  recommendations={analysis.recommendations}
                  compact
                  onOpenFixMistakes={() => setIsFixMistakesOpen(true)}
                />
              ) : (
                <div className="text-center py-4 text-xs text-zinc-500">
                  <Sparkles className="w-4 h-4 mx-auto mb-1.5 text-zinc-400" />
                  <p>Run an audit to check bullet structure and STAR/XYZ outcome density.</p>
                </div>
              )}
            </div>

            {/* Quick Match JD Link */}
            <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs space-y-2 shadow-xs">
              <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                Targeting a Specific Role?
              </span>
              <p className="text-zinc-500 text-[11px] leading-relaxed">
                Compare this resume with a target job description to verify required skills and evidence alignment.
              </p>
              <Link
                href={`/app/match?resumeId=${resumeId}`}
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors shadow-xs text-xs"
              >
                Match with Job Description
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* AI Suggestion Interactive Modal (Live Gemini STAR / XYZ Optimization) */}
      {activeSuggestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div
            id="ai-bullet-suggestion-modal"
            className="w-full max-w-xl rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl p-5 space-y-4 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                  AI Bullet Optimization (STAR / XYZ)
                </h3>
                {activeSuggestion.provider && !activeSuggestion.isLoading && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-medium">
                    {activeSuggestion.provider === 'mock' ? 'Deterministic Engine' : 'Gemini AI'}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setActiveSuggestion(null)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="font-medium text-zinc-500">Current Bullet Text:</span>
                <p className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 mt-1 border border-zinc-200 dark:border-zinc-700">
                  {activeSuggestion.original}
                </p>
              </div>

              {/* Optional Verified Metric Injection */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-2 p-2.5 rounded-lg bg-zinc-50/70 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-700/80">
                <div className="flex-1 space-y-1">
                  <label className="text-[11px] font-medium text-zinc-700 dark:text-zinc-300 block">
                    Verified Metric / Outcome (Optional — never fabricated)
                  </label>
                  <input
                    id="modal-metric-hint"
                    type="text"
                    placeholder="e.g. reduced query latency by 35%, saved 12 hrs/week"
                    value={activeSuggestion.metricHint}
                    onChange={(e) =>
                      setActiveSuggestion({
                        ...activeSuggestion,
                        metricHint: e.target.value,
                      })
                    }
                    className="w-full px-2.5 py-1.5 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={activeSuggestion.isLoading}
                  onClick={() =>
                    void runAiBulletImprove(
                      activeSuggestion.expIdx,
                      activeSuggestion.bulletIdx,
                      activeSuggestion.original,
                      activeSuggestion.metricHint,
                    )
                  }
                  className="text-xs shrink-0 gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${activeSuggestion.isLoading ? 'animate-spin' : ''}`} />
                  <span>Regenerate</span>
                </Button>
              </div>

              {activeSuggestion.isLoading ? (
                <div className="py-8 flex flex-col items-center justify-center gap-2.5 text-zinc-500">
                  <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                  <span className="text-xs font-medium">
                    Generating grounded STAR &amp; XYZ variants with Gemini AI...
                  </span>
                </div>
              ) : activeSuggestion.error ? (
                <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs">
                  {activeSuggestion.error}
                </div>
              ) : (
                <>
                  {/* Selectable AI Style Variants */}
                  {activeSuggestion.variants.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="font-medium text-zinc-500 block">Choose AI Style Variant:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {activeSuggestion.variants.map((variant, vIdx) => (
                          <button
                            key={variant.style}
                            type="button"
                            onClick={() =>
                              setActiveSuggestion({
                                ...activeSuggestion,
                                selectedVariantIdx: vIdx,
                                suggested: variant.bullet,
                                why: variant.rationale,
                                framework: variant.framework,
                              })
                            }
                            className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer ${
                              activeSuggestion.selectedVariantIdx === vIdx
                                ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                                : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:border-blue-400'
                            }`}
                          >
                            {variant.style}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-blue-600 dark:text-blue-400">
                        Proposed Revision ({activeSuggestion.framework}):
                      </span>
                    </div>
                    <textarea
                      id="ai-suggested-bullet-textarea"
                      rows={3}
                      value={activeSuggestion.suggested}
                      onChange={(e) =>
                        setActiveSuggestion({
                          ...activeSuggestion,
                          suggested: e.target.value,
                        })
                      }
                      className="w-full p-2.5 rounded-lg border border-blue-300 dark:border-blue-700 bg-blue-50/20 dark:bg-blue-950/20 text-zinc-900 dark:text-zinc-100 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-600 leading-relaxed font-sans"
                    />
                  </div>

                  {activeSuggestion.why && (
                    <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-[11px] text-zinc-700 dark:text-zinc-300">
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100">Rationale: </span>
                      {activeSuggestion.why}
                    </div>
                  )}

                  {activeSuggestion.factualNotes && (
                    <div className="p-2.5 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/25 border border-emerald-200/80 dark:border-emerald-900 text-[11px] text-emerald-800 dark:text-emerald-200 flex items-start gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>
                        <strong>Factual Guard:</strong> {activeSuggestion.factualNotes}
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800 text-xs">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setActiveSuggestion(null)}
              >
                Reject
              </Button>
              <Button
                id="accept-ai-bullet-btn"
                type="button"
                variant="primary"
                size="sm"
                disabled={activeSuggestion.isLoading || !activeSuggestion.suggested.trim()}
                onClick={handleApplySuggestion}
              >
                Accept &amp; Insert
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* AI Bullet Generator Modal (Role-Based Drafts) */}
      {bulletGenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div
            id="ai-bullet-generator-modal"
            className="w-full max-w-xl rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl p-5 space-y-4 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                  AI Bullet Generator — {bulletGenModal.roleTitle}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setBulletGenModal(null)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400">Role Title</label>
                  <input
                    type="text"
                    value={bulletGenModal.roleTitle}
                    onChange={(e) => setBulletGenModal({ ...bulletGenModal, roleTitle: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400">Company</label>
                  <input
                    type="text"
                    value={bulletGenModal.companyName}
                    onChange={(e) => setBulletGenModal({ ...bulletGenModal, companyName: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400">
                  Key Deliverables, Tech Stack, or Focus Area (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Migrated billing webhook queue to BullMQ + Redis, improved observability with Grafana..."
                  value={bulletGenModal.focusArea}
                  onChange={(e) => setBulletGenModal({ ...bulletGenModal, focusArea: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs"
                />
              </div>

              <div className="flex justify-end">
                <Button
                  id="run-editor-bullet-gen-btn"
                  type="button"
                  variant="primary"
                  size="sm"
                  isLoading={bulletGenModal.isLoading}
                  onClick={() => void handleRunBulletGenerator()}
                  className="gap-1.5 text-xs"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>{bulletGenModal.bullets.length > 0 ? 'Regenerate Drafts' : 'Generate 3 STAR/XYZ Bullets'}</span>
                </Button>
              </div>

              {bulletGenModal.error && (
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                  {bulletGenModal.error}
                </div>
              )}

              {bulletGenModal.bullets.length > 0 && (
                <div className="space-y-2.5 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                  {bulletGenModal.factualNotes && (
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-300 bg-emerald-50/70 dark:bg-emerald-950/25 p-2 rounded-lg border border-emerald-200/70 dark:border-emerald-900">
                      <ShieldCheck className="w-3.5 h-3.5 inline mr-1 -mt-0.5" />
                      {bulletGenModal.factualNotes}
                    </p>
                  )}

                  {bulletGenModal.bullets.map((b, bIdx) => {
                    const isInserted = bulletGenModal.insertedIndices.includes(bIdx);
                    return (
                      <div
                        key={bIdx}
                        className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/40 space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10.5px] font-semibold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300">
                            {b.style} · {b.framework}
                          </span>
                          <Button
                            type="button"
                            variant={isInserted ? 'outline' : 'primary'}
                            size="sm"
                            disabled={isInserted}
                            onClick={() => handleInsertGeneratedBullet(b.bullet, bIdx)}
                            className="h-7 text-[11px] px-2.5"
                          >
                            {isInserted ? 'Inserted ✓' : '+ Insert Bullet'}
                          </Button>
                        </div>
                        <p className="text-xs text-zinc-900 dark:text-zinc-100 leading-relaxed">{b.bullet}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <Button type="button" variant="outline" size="sm" onClick={() => setBulletGenModal(null)}>
                Done
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Version Snapshots Drawer */}
      <VersionHistoryDrawer
        isOpen={isVersionDrawerOpen}
        onClose={() => setIsVersionDrawerOpen(false)}
        versions={versions}
        isLoadingVersions={isLoadingVersions}
        currentContent={content}
        templateKey={templateKey}
        accentColor={accentColor}
        fontFamily={fontFamily}
        showPhoto={showPhoto}
        photoUrl={photoUrl}
        versionNote={versionNote}
        onVersionNoteChange={setVersionNote}
        isSavingVersion={isSavingVersion}
        onCreateSnapshot={handleCreateVersionSnapshot}
        onRestoreVersion={handleRestoreVersion}
      />
      {/* Template Picker Drawer */}
      <TemplatePicker
        isOpen={isTemplatePickerOpen}
        onClose={() => setIsTemplatePickerOpen(false)}
        currentTemplateKey={templateKey}
        onSelectTemplate={(newKey) => {
          setTemplateKey(newKey);
          scheduleAutosave(content, resumeName, newKey);
        }}
        pageSize={pageSize}
        onPageSizeChange={setPageSize}
      />

      {/* Design, Typography & Spacing Panel */}
      <DesignPanel
        isOpen={isDesignPanelOpen}
        onClose={() => setIsDesignPanelOpen(false)}
        accentColor={accentColor}
        onAccentColorChange={(newColor) => {
          setAccentColor(newColor);
          handleUpdateLayout({
            ...(content.layout || {}),
            accentColor: newColor,
          });
        }}
        fontFamily={fontFamily}
        onFontFamilyChange={(newFont) => {
          setFontFamily(newFont);
          handleUpdateLayout({
            ...(content.layout || {}),
            fontFamily: newFont,
          });
        }}
        showPhoto={showPhoto}
        onShowPhotoChange={setShowPhoto}
        photoUrl={photoUrl}
        onPhotoUrlChange={(newUrl) => {
          setPhotoUrl(newUrl);
          updateContent((prev) => ({
            ...prev,
            contact: {
              ...prev.contact,
              photoUrl: newUrl,
            },
          }));
        }}
        showHighlights={showHighlights}
        onShowHighlightsChange={setShowHighlights}
        layout={content.layout}
        onLayoutChange={handleUpdateLayout}
      />

      {/* Section Drag-and-Drop Reorder Drawer */}
      <SectionRearrangeDrawer
        isOpen={isRearrangeDrawerOpen}
        onClose={() => setIsRearrangeDrawerOpen(false)}
        content={content}
        onUpdateLayout={handleUpdateLayout}
      />

      {/* Native <dialog> AI Section Rewriter Modal */}
      <SectionRewriterDialog
        target={sectionRewriteTarget}
        content={content}
        targetRole={resume?.targetRole || undefined}
        onClose={() => setSectionRewriteTarget(null)}
        onApply={updateContent}
      />

      {/* Profile Photo Modal (Upload & Paste Link) */}
      <PhotoUploadModal
        isOpen={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
        photoUrl={photoUrl}
        showPhoto={showPhoto}
        onPhotoChange={(newUrl, shouldShow) => {
          setPhotoUrl(newUrl);
          setShowPhoto(shouldShow);
          updateContent((prev) => ({
            ...prev,
            contact: {
              ...prev.contact,
              photoUrl: newUrl,
            },
          }));
        }}
      />

      {/* Live Check & Tailor Drawer (Real Job Matching, Keyword Gap Analysis & AI Tailoring) */}
      <CheckAndTailorDrawer
        isOpen={isCheckTailorOpen}
        onClose={() => setIsCheckTailorOpen(false)}
        resumeId={resumeId}
        resumeContent={content}
        onUpdateContent={updateContent}
        initialMatchId={activeMatchId}
        onMatchChange={handleMatchChange}
        onToggleHighlights={setShowHighlights}
        isHighlightsEnabled={showHighlights}
      />

      {/* Grammar, Spelling & Buzzword Audit Drawer */}
      <FixMistakesDrawer
        isOpen={isFixMistakesOpen}
        onClose={() => setIsFixMistakesOpen(false)}
        resumeTitle={resumeName}
        resumeTargetRole={resume?.targetRole}
        content={content}
        localReport={localWritingReport}
        aiReport={aiWritingReport}
        activeReport={activeWritingReport}
        ignoredIds={ignoredWritingIssueIds}
        onIgnoreIssue={(id) =>
          setIgnoredWritingIssueIds((prev) => (prev.includes(id) ? prev : [...prev, id]))
        }
        onResetIgnored={() => setIgnoredWritingIssueIds([])}
        onApplyContent={(nextContent) => {
          setContent(nextContent);
          scheduleAutosave(nextContent);
        }}
        onRunAiDeepCheck={handleRunAiWritingCheck}
        isRunningAiCheck={isRunningAiWritingCheck}
        aiCheckError={aiWritingCheckError}
        onLocateIssue={handleLocateWritingIssue}
      />

      {/* Recruiter Share Link & View Analytics Drawer */}
      <ShareAnalyticsDrawer
        isOpen={isShareDrawerOpen}
        onClose={() => setIsShareDrawerOpen(false)}
        resumeId={resumeId}
        resumeTitle={resumeName || 'Resume'}
        shareState={shareState}
        onShareStateChange={setShareState}
      />

      {/* Direct Vector ATS PDF Export Modal */}
      <ExportPdfModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        resumeId={resumeId}
        resumeName={resumeName || 'Resume'}
        pageSize={pageSize}
        targetContainerId="resume-document-print"
      />
    </div>
  );
}
