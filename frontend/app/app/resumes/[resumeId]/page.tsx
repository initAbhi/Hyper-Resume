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
  Check,
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
  PenTool,
  Columns2,
  Bot,
  PanelLeftOpen,
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
  ResumeSectionKey,
  ApiError,
} from '@/lib/api-client';
import {
  applyResumeLayoutToDom,
  moveSectionKey,
  normalizeLayoutSettings,
} from '@/lib/resume-layout';
import { analyzeResumeWriting, mergeWritingIssues } from '@/lib/writing-checker';
import { calculateClientAtsScore } from '@/lib/ats-score-calculator';
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
import { AtsScoreBanner } from '@/components/resumes/AtsScoreBanner';
import { AtsAuditDrawer } from '@/components/resumes/AtsAuditDrawer';
import {
  AVAILABLE_TEMPLATES,
  getTemplateComponent,
  CanvasEditProvider,
  type BulletSelectionMeta,
} from '@/components/resumes/templates';
import {
  updateResumeContentByPath,
  insertBulletBelow,
  removeBulletAt,
  moveBulletAt,
} from '@/lib/resume-path-updater';
import { TemplatePicker } from '@/components/resumes/TemplatePicker';
import { DesignPanel, ACCENT_SWATCHES } from '@/components/resumes/DesignPanel';
import { PhotoUploadModal } from '@/components/resumes/PhotoUploadModal';
import { CheckAndTailorDrawer } from '@/components/resumes/CheckAndTailorDrawer';
import { ExportPdfModal } from '@/components/resumes/ExportPdfModal';
import { CanvasFloatingToolbar } from '@/components/resumes/CanvasFloatingToolbar';
import { CanvaDock, type StudioPanel } from '@/components/resumes/CanvaDock';
import { CanvaBottomBar } from '@/components/resumes/CanvaBottomBar';
import { AddContentDrawer } from '@/components/resumes/AddContentDrawer';
import { AgentChatPanel } from '@/components/resumes/AgentChatPanel';
import { buildCanvasDiffMapFromProposal } from '@/components/resumes/templates/CanvasEditContext';
import type { AgentApprovalProposal } from '@/lib/agent-client';

interface ResumeEditorPageProps {
  params: Promise<{ resumeId: string }>;
}

type EditorSection = 'contact' | 'summary' | 'experience' | 'skills' | 'education' | 'projects' | 'custom' | 'certifications';
export type EditorMode = 'canvas' | 'form';

export default function ResumeDetailPage({ params }: ResumeEditorPageProps) {
  const resolvedParams = use(params);
  const resumeId = resolvedParams.resumeId;

  // Dual-Mode State: Visual Canvas (Canva-Grade) vs Classic Forms
  const [editorMode, setEditorMode] = useState<EditorMode>('canvas');

  // Hydrate user editor mode preference from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('hyper_resume_editor_mode');
      if (saved === 'canvas' || saved === 'form') {
        setEditorMode(saved);
      }
    } catch {
      // Storage unavailable or SSR
    }
  }, []);

  const handleToggleEditorMode = (mode: EditorMode) => {
    setEditorMode(mode);
    try {
      localStorage.setItem('hyper_resume_editor_mode', mode);
    } catch {
      // Storage unavailable
    }
  };

  // Primary Resume Data State
  const [resume, setResume] = useState<Resume | null>(null);
  const [content, setContent] = useState<ResumeContent | null>(null);
  const [resumeName, setResumeName] = useState('');
  const [templateKey, setTemplateKey] = useState('double-column');
  const [serverVersion, setServerVersion] = useState<number>(1);

  // Unified Docked Live-Studio Inspector Panel State (zero backdrop blur, zero canvas overlap)
  const [activePanel, setActivePanel] = useState<StudioPanel>('agent');
  const [isDesktopLg, setIsDesktopLg] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(min-width: 1024px)');
    const sync = () => setIsDesktopLg(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  const isTemplatePickerOpen = activePanel === 'templates';
  const isDesignPanelOpen = activePanel === 'design';
  const isAddContentOpen = activePanel === 'content';
  const isRearrangeDrawerOpen = activePanel === 'sections';
  const isAuditDrawerOpen = activePanel === 'ats';
  const isCheckTailorOpen = activePanel === 'tailor';
  const isFixMistakesOpen = activePanel === 'mistakes';
  const isAgentPanelOpen = activePanel === 'agent';

  // Instant Hover / Focus Live Preview State (direct impact without needing an extra click)
  const [livePreview, setLivePreview] = useState<{
    templateKey?: string;
    accentColor?: string;
    fontFamily?: 'sans' | 'serif' | 'mono';
    layout?: Partial<ResumeLayoutSettings>;
    label?: string;
  } | null>(null);

  const openStudioPanel = useCallback((panel: Exclude<StudioPanel, null>) => {
    setLivePreview(null);
    if (panel === 'agent') {
      setHasMountedDesktopAgent(true);
    }
    setActivePanel(panel);
  }, []);

  const toggleStudioPanel = useCallback((panel: Exclude<StudioPanel, null>) => {
    setLivePreview(null);
    if (panel === 'agent') {
      setHasMountedDesktopAgent(true);
    }
    setActivePanel((prev) => (prev === panel ? null : panel));
  }, []);

  const closeStudioPanel = useCallback(() => {
    setLivePreview(null);
    setActivePanel(null);
  }, []);

  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
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

  // Effective live-rendered visual props (merges hover/focus preview seamlessly)
  const effectiveTemplateKey = livePreview?.templateKey ?? templateKey;
  const effectiveAccentColor = livePreview?.accentColor ?? accentColor;
  const effectiveFontFamily = livePreview?.fontFamily ?? fontFamily;
  const effectiveLayout = React.useMemo<ResumeLayoutSettings | undefined>(() => {
    if (!livePreview?.layout) return content?.layout;
    return {
      ...(content?.layout || {}),
      ...livePreview.layout,
    };
  }, [content?.layout, livePreview?.layout]);

  // Scaled True A4 Canvas Simulator State
  const [canvasContainerEl, setCanvasContainerEl] = useState<HTMLDivElement | null>(null);
  const canvasContainerRef = useCallback((node: HTMLDivElement | null) => {
    setCanvasContainerEl(node);
  }, []);

  const [resumePrintEl, setResumePrintEl] = useState<HTMLDivElement | null>(null);
  const resumePrintRef = useRef<HTMLDivElement | null>(null);
  const setResumePrintRef = useCallback((node: HTMLDivElement | null) => {
    resumePrintRef.current = node;
    setResumePrintEl(node);
  }, []);

  const [containerWidth, setContainerWidth] = useState<number | null>(null);
  const [canvasHeight, setCanvasHeight] = useState<number | null>(null);
  const [zoomMode, setZoomMode] = useState<'fit' | '50' | '75' | '100' | '125' | '150'>('fit');

  useEffect(() => {
    if (!resumePrintEl) return;
    const updateHeight = () => {
      const h = resumePrintEl.scrollHeight || resumePrintEl.clientHeight;
      if (h > 0) setCanvasHeight(h);
    };
    updateHeight();
    const observer = new ResizeObserver(() => {
      updateHeight();
    });
    observer.observe(resumePrintEl);
    return () => observer.disconnect();
  }, [resumePrintEl, content, effectiveTemplateKey, effectiveLayout, pageSize]);

  useEffect(() => {
    if (!canvasContainerEl) return;
    const measure = () => {
      const w = canvasContainerEl.clientWidth;
      if (w > 0) {
        setContainerWidth(w);
      }
    };
    measure();

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === canvasContainerEl) {
          const w = entry.contentRect.width;
          if (w > 0) {
            setContainerWidth(w);
          }
        }
      }
    });
    observer.observe(canvasContainerEl);
    window.addEventListener('resize', measure);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [canvasContainerEl]);

  const targetA4Width = pageSize === 'US Letter' ? 816 : 794;
  const fitScale = containerWidth
    ? Math.min(1.0, Math.max(0.2, (containerWidth - 24) / targetA4Width))
    : 0.6;
  const effectiveScale =
    zoomMode === 'fit'
      ? fitScale
      : zoomMode === '50'
        ? 0.5
        : zoomMode === '75'
          ? 0.75
          : zoomMode === '125'
            ? 1.25
            : zoomMode === '150'
              ? 1.5
              : 1.0;

  const scaledWidth = Math.ceil(targetA4Width * effectiveScale);
  const scaledHeight = canvasHeight
    ? Math.ceil(canvasHeight * effectiveScale)
    : Math.ceil((pageSize === 'US Letter' ? 1056 : 1123) * effectiveScale);

  // Editor Navigation & Layout State
  const [activeSection, setActiveSection] = useState<EditorSection>('experience');
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview' | 'ai'>('editor');

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

  // Phase 3: Split-Screen Agent Workspace & Visual Diff State
  const [hasMountedDesktopAgent, setHasMountedDesktopAgent] = useState(false);
  const [isMobileAgentOpen, setIsMobileAgentOpen] = useState(false);
  const [hasMountedMobileAgent, setHasMountedMobileAgent] = useState(false);
  const [activeAgentProposal, setActiveAgentProposal] = useState<AgentApprovalProposal | null>(null);
  const [focusedDiffPath, setFocusedDiffPath] = useState<string | null>(null);
  const [agentToast, setAgentToast] = useState<{ type: 'success' | 'info'; message: string } | null>(null);

  const pendingCanvasDiffs = React.useMemo(
    () => buildCanvasDiffMapFromProposal(activeAgentProposal),
    [activeAgentProposal],
  );

  const showAgentToast = useCallback((type: 'success' | 'info', message: string) => {
    setAgentToast({ type, message });
  }, []);

  useEffect(() => {
    if (!agentToast) return;
    const timer = setTimeout(() => setAgentToast(null), 4500);
    return () => clearTimeout(timer);
  }, [agentToast]);

  useEffect(() => {
    if (!isMobileAgentOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileAgentOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isMobileAgentOpen]);

  const handleAgentProposalApproved = useCallback(
    async ({ newVersion }: { newVersion: number; proposal: AgentApprovalProposal }) => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }

      try {
        const refreshed = await apiClient.getResume(resumeId);
        setResume(refreshed);
        if (refreshed.content) {
          setContent(refreshed.content);
          if (refreshed.content.layout?.accentColor) {
            setAccentColor(refreshed.content.layout.accentColor);
          }
          if (refreshed.content.layout?.fontFamily) {
            setFontFamily(refreshed.content.layout.fontFamily);
          }
          if (typeof refreshed.content.layout?.showPhoto === 'boolean') {
            setShowPhoto(refreshed.content.layout.showPhoto);
          }
          if (typeof refreshed.content.layout?.showHighlights === 'boolean') {
            setShowHighlights(refreshed.content.layout.showHighlights);
          }
        }
        setResumeName(refreshed.name);
        setTemplateKey(refreshed.templateKey || templateKey);
        setServerVersion(refreshed.version || newVersion);
        setSaveStatus('saved');
        setHasConflict(false);
        setLastSavedTime(
          new Date(refreshed.updatedAt || Date.now()).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
        );
        setActiveAgentProposal(null);
        setFocusedDiffPath(null);
        showAgentToast(
          'success',
          `Approved changes applied to your resume (v${refreshed.version || newVersion}).`,
        );
      } catch {
        setServerVersion(newVersion);
        setActiveAgentProposal(null);
        setFocusedDiffPath(null);
        showAgentToast(
          'success',
          `Approved changes applied (v${newVersion}). Refresh if latest fields are delayed.`,
        );
      }
    },
    [resumeId, templateKey, showAgentToast],
  );

  const handleAgentProposalRejected = useCallback(() => {
    setActiveAgentProposal(null);
    setFocusedDiffPath(null);
    showAgentToast('info', 'Proposal rejected — your saved resume was not modified.');
  }, [showAgentToast]);

  // Grammar, Spelling & Buzzword Checker State
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
    section?: 'experience' | 'projects' | 'custom';
    expIdx: number;
    projIdx?: number;
    customSectionId?: string;
    customEntryIdx?: number;
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

  // Calibrated Live ATS Score (mirrors backend 5-dimension engine in real time)
  const clientAtsEvaluation = React.useMemo(() => {
    return calculateClientAtsScore(content);
  }, [content]);

  const liveScore = clientAtsEvaluation.score;

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
        }
        if (typeof res.content?.layout?.showPhoto === 'boolean') {
          setShowPhoto(res.content.layout.showPhoto);
        } else if (res.content?.contact?.photoUrl) {
          setShowPhoto(true);
        }
        if (typeof res.content?.layout?.showHighlights === 'boolean') {
          setShowHighlights(res.content.layout.showHighlights);
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

  // Immutable Undo / Redo History Stack for Canvas Editing
  const [historyStack, setHistoryStack] = useState<ResumeContent[]>([]);
  const [redoStack, setRedoStack] = useState<ResumeContent[]>([]);

  // Handlers for Content Modifications
  const updateContent = (updater: (prev: ResumeContent) => ResumeContent) => {
    if (!content) return;
    setHistoryStack((prev) => [...prev.slice(-30), content]);
    setRedoStack([]);
    const next = updater({ ...content });
    setContent(next);
    scheduleAutosave(next);
  };

  const handleUndo = useCallback(() => {
    if (historyStack.length === 0 || !content) return;
    setActiveCanvasSelection(null);
    const previous = historyStack[historyStack.length - 1];
    setHistoryStack((prev) => prev.slice(0, prev.length - 1));
    setRedoStack((prev) => [content, ...prev]);
    setContent(previous);
    scheduleAutosave(previous, resumeName, templateKey);
  }, [historyStack, content, scheduleAutosave, resumeName, templateKey]);

  const handleRedo = useCallback(() => {
    if (redoStack.length === 0 || !content) return;
    setActiveCanvasSelection(null);
    const next = redoStack[0];
    setRedoStack((prev) => prev.slice(1));
    setHistoryStack((prev) => [...prev, content]);
    setContent(next);
    scheduleAutosave(next, resumeName, templateKey);
  }, [redoStack, content, scheduleAutosave, resumeName, templateKey]);

  // Global Keyboard Shortcuts (Ctrl+Z for Undo, Ctrl+Y or Ctrl+Shift+Z for Redo)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = (document.activeElement?.tagName || '').toLowerCase();
      const isInput = activeTag === 'input' || activeTag === 'textarea';
      if (isInput) return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          e.preventDefault();
          handleRedo();
        } else {
          e.preventDefault();
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  const handleRunAudit = async () => {
    if (!content) return;
    setIsAnalyzing(true);
    try {
      const result = await apiClient.runAnalysis(resumeId, {
        analysisType: 'ats_check',
        targetRole: resume?.targetRole,
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
    if (!isDesktopLg) closeStudioPanel();
    setMobileTab('editor');

    let targetSection: EditorSection = 'summary';
    let targetElId = 'summary-textarea';
    let canvasFieldPath = 'summary';
    if (issue.locationType === 'headline') {
      targetSection = 'summary';
      targetElId = 'summary-headline';
      canvasFieldPath = 'headline';
    } else if (issue.locationType === 'summary') {
      targetSection = 'summary';
      targetElId = 'summary-textarea';
      canvasFieldPath = 'summary';
    } else if (issue.locationType === 'experience_bullet') {
      targetSection = 'experience';
      targetElId = `exp-${issue.expIdx ?? 0}-bullet-${issue.bulletIdx ?? 0}`;
      canvasFieldPath = `experience[${issue.expIdx ?? 0}].bullets[${issue.bulletIdx ?? 0}]`;
    } else if (issue.locationType === 'project_description') {
      targetSection = 'projects';
      targetElId = `proj-${issue.projIdx ?? 0}-desc`;
      canvasFieldPath = `projects[${issue.projIdx ?? 0}].description`;
    }

    setActiveSection(targetSection);
    requestAnimationFrame(() => {
      setTimeout(() => {
        const el =
          document.getElementById(targetElId) ||
          (document.querySelector(
            `[data-field-path="${canvasFieldPath}"]`,
          ) as HTMLElement | null);
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
    targetMeta?: {
      section?: 'experience' | 'projects' | 'custom';
      projIdx?: number;
      customSectionId?: string;
      customEntryIdx?: number;
    },
  ) => {
    const trimmed = currentText.trim();
    if (!trimmed) return;

    const expRole = content?.experience?.[expIdx]?.title || resume?.targetRole || content?.headline;

    setActiveSuggestion({
      section: targetMeta?.section || 'experience',
      expIdx,
      projIdx: targetMeta?.projIdx,
      customSectionId: targetMeta?.customSectionId,
      customEntryIdx: targetMeta?.customEntryIdx,
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

  // Canva-Style Canvas In-Place Selection & Field Updaters
  const [activeCanvasSelection, setActiveCanvasSelection] = useState<BulletSelectionMeta | null>(null);

  const handleCanvasFieldUpdate = useCallback(
    (fieldPath: string, value: string) => {
      updateContent((prev) => updateResumeContentByPath(prev, fieldPath, value));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [updateContent],
  );

  const handleCanvasAddBulletBelow = useCallback(
    (meta: BulletSelectionMeta) => {
      const targetSection = meta.section;
      if (targetSection === 'summary') return;
      updateContent((prev) =>
        insertBulletBelow(
          prev,
          targetSection,
          meta.expIdx,
          meta.bulletIdx,
          meta.projIdx,
          meta.customSectionId,
          meta.customEntryIdx,
        ),
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [updateContent],
  );

  const handleCanvasDeleteBullet = useCallback(
    (meta: BulletSelectionMeta) => {
      const targetSection = meta.section;
      if (targetSection === 'summary') return;
      updateContent((prev) =>
        removeBulletAt(
          prev,
          targetSection,
          meta.expIdx,
          meta.bulletIdx,
          meta.projIdx,
          meta.customSectionId,
          meta.customEntryIdx,
        ),
      );
      setActiveCanvasSelection(null);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [updateContent],
  );

  const handleCanvasMoveBullet = useCallback(
    (meta: BulletSelectionMeta, direction: 'up' | 'down') => {
      const targetSection = meta.section;
      if (targetSection === 'summary') return;
      updateContent((prev) =>
        moveBulletAt(
          prev,
          targetSection,
          direction,
          meta.expIdx,
          meta.bulletIdx,
          meta.projIdx,
          meta.customSectionId,
          meta.customEntryIdx,
        ),
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [updateContent],
  );

  const handleCanvasAddExperience = useCallback(() => {
    updateContent((prev) => ({
      ...prev,
      experience: [
        ...(prev.experience || []),
        {
          company: 'Company / Organization',
          title: 'Role / Job Title',
          location: 'City, Country',
          startDate: '2023',
          endDate: 'Present',
          current: true,
          bullets: ['Led strategic technical initiatives and delivered measurable impact.'],
        },
      ],
    }));
  }, [updateContent]);

  const handleCanvasAddProject = useCallback(() => {
    updateContent((prev) => ({
      ...prev,
      projects: [
        ...(prev.projects || []),
        {
          name: 'Project Name',
          description: 'High-performance cloud-native application.',
          highlights: ['Architected scalable backend microservices with real-time sync.'],
        },
      ],
    }));
  }, [updateContent]);

  const handleCanvasAddEducation = useCallback(() => {
    updateContent((prev) => ({
      ...prev,
      education: [
        ...(prev.education || []),
        {
          school: 'University / Institution',
          degree: 'Bachelor of Science',
          field: 'Computer Science',
          graduationDate: '2024',
        },
      ],
    }));
  }, [updateContent]);

  const handleCanvasAddSkill = useCallback((name?: string) => {
    updateContent((prev) => ({
      ...prev,
      skills: [...(prev.skills || []), { name: name || 'New Skill' }],
    }));
  }, [updateContent]);

  const handleCanvasAddCertification = useCallback(() => {
    updateContent((prev) => ({
      ...prev,
      certifications: [
        ...(prev.certifications || []),
        {
          name: 'AWS Certified Solutions Architect',
          issuer: 'Amazon Web Services',
          issueDate: '2024',
        },
      ],
    }));
  }, [updateContent]);

  const handleCanvasDeleteExperience = useCallback(
    (index: number) => {
      setActiveCanvasSelection(null);
      updateContent((prev) => ({
        ...prev,
        experience: (prev.experience || []).filter((_, i) => i !== index),
      }));
    },
    [updateContent],
  );

  const handleCanvasDeleteProject = useCallback(
    (index: number) => {
      setActiveCanvasSelection(null);
      updateContent((prev) => ({
        ...prev,
        projects: (prev.projects || []).filter((_, i) => i !== index),
      }));
    },
    [updateContent],
  );

  const handleCanvasDeleteEducation = useCallback(
    (index: number) => {
      setActiveCanvasSelection(null);
      updateContent((prev) => ({
        ...prev,
        education: (prev.education || []).filter((_, i) => i !== index),
      }));
    },
    [updateContent],
  );

  const handleCanvasDeleteSkill = useCallback(
    (index: number) => {
      updateContent((prev) => ({
        ...prev,
        skills: (prev.skills || []).filter((_, i) => i !== index),
      }));
    },
    [updateContent],
  );

  const handleCanvasMoveSection = useCallback(
    (sectionKey: ResumeSectionKey, direction: 'up' | 'down') => {
      updateContent((prev) => {
        const normalized = normalizeLayoutSettings(prev.layout, prev.customSections);
        const order = [...normalized.sectionOrder];
        const hasContentForKey = (k: ResumeSectionKey): boolean => {
          if (k === 'summary') return Boolean(prev.summary?.trim());
          if (k === 'experience') return (prev.experience?.length || 0) > 0;
          if (k === 'projects') return (prev.projects?.length || 0) > 0;
          if (k === 'skills') return (prev.skills?.length || 0) > 0;
          if (k === 'education') return (prev.education?.length || 0) > 0;
          if (k === 'certifications') return (prev.certifications?.length || 0) > 0;
          return true;
        };

        const idx = order.indexOf(sectionKey);
        if (idx === -1) return prev;

        let targetIdx = direction === 'up' ? idx - 1 : idx + 1;
        while (targetIdx >= 0 && targetIdx < order.length && !hasContentForKey(order[targetIdx])) {
          targetIdx += direction === 'up' ? -1 : 1;
        }

        const nextOrder =
          targetIdx >= 0 && targetIdx < order.length
            ? (() => {
              const copy = [...order];
              const [moved] = copy.splice(idx, 1);
              copy.splice(targetIdx, 0, moved);
              return copy;
            })()
            : moveSectionKey(order, sectionKey, direction, prev.customSections);

        return {
          ...prev,
          layout: {
            ...prev.layout,
            sectionOrder: nextOrder,
          },
        };
      });
    },
    [updateContent],
  );

  const handleTriggerAiEnhanceFromCanvas = useCallback(
    (
      meta: BulletSelectionMeta,
      mode: 'star' | 'xyz' | 'metric' | 'executive' | 'technical' | 'concise' = 'star',
    ) => {
      if (meta.fieldPath === 'summary' || meta.section === 'summary') {
        setSectionRewriteTarget({
          sectionType: 'summary',
          sectionLabel: 'Professional Summary',
        });
        return;
      }
      const modeHints: Record<typeof mode, string> = {
        star: 'Rewrite using STAR framework (Situation, Task, Action, Result)',
        xyz: 'Rewrite using Google XYZ formula (Accomplished X as measured by Y by doing Z)',
        metric: 'Emphasize measurable business outcome, latency, revenue, or scale',
        executive: 'Use concise executive leadership tone focused on strategic impact',
        technical: 'Emphasize technical architecture, system scale, and engineering rigor',
        concise: 'Tighten into a crisp, high-density single-line impact bullet',
      };
      const metricHint = modeHints[mode] || '';
      if (meta.section === 'experience' && typeof meta.expIdx === 'number' && typeof meta.bulletIdx === 'number') {
        const text = meta.currentText || content?.experience?.[meta.expIdx]?.bullets?.[meta.bulletIdx] || '';
        void runAiBulletImprove(meta.expIdx, meta.bulletIdx, text, metricHint, { section: 'experience' });
      } else if (meta.section === 'projects' && typeof meta.projIdx === 'number' && typeof meta.bulletIdx === 'number') {
        const text = meta.currentText || content?.projects?.[meta.projIdx]?.highlights?.[meta.bulletIdx] || '';
        void runAiBulletImprove(0, meta.bulletIdx, text, metricHint, {
          section: 'projects',
          projIdx: meta.projIdx,
        });
      } else if (
        meta.section === 'custom' &&
        meta.customSectionId &&
        typeof meta.customEntryIdx === 'number' &&
        typeof meta.bulletIdx === 'number'
      ) {
        const sec = (content?.customSections || []).find((s) => s.id === meta.customSectionId);
        const text = meta.currentText || sec?.entries?.[meta.customEntryIdx]?.bullets?.[meta.bulletIdx] || '';
        void runAiBulletImprove(0, meta.bulletIdx, text, metricHint, {
          section: 'custom',
          customSectionId: meta.customSectionId,
          customEntryIdx: meta.customEntryIdx,
        });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [content],
  );

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
    if (openTailor === '1' || openTailor === 'true') openStudioPanel('tailor');
  }, [openStudioPanel]);

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
      if (saveStatus === 'unsaved' || saveStatus === 'saving') {
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
      effectiveLayout,
      content.customSections,
    );
  }, [content, effectiveLayout, effectiveTemplateKey, effectiveAccentColor, effectiveFontFamily, showPhoto, showHighlights, isExportModalOpen, pageSize]);

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
    if (errorMessage) {
      return (
        <div className="flex min-h-[420px] items-center justify-center px-4">
          <div
            role="alert"
            className="max-w-md w-full rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-white dark:bg-zinc-900 p-6 text-center shadow-sm space-y-4"
          >
            <div className="mx-auto w-11 h-11 rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" aria-hidden="true" />
            </div>
            <div className="space-y-1.5">
              <h1 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
                Unable to load resume
              </h1>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                {errorMessage}
              </p>
            </div>
            <div className="pt-1 flex items-center justify-center gap-2">
              <Link
                href="/app/resumes"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Back to My Resumes</span>
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-sm text-zinc-600 dark:text-zinc-400 animate-pulse flex items-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin" aria-hidden="true" />
          Loading resume editor...
        </div>
      </div>
    );
  }

  const isNonAgentToolActive = Boolean(activePanel && activePanel !== 'agent');

  const handleQuickAccentColor = (newColor: string) => {
    setLivePreview(null);
    setAccentColor(newColor);
    handleUpdateLayout({
      ...(content.layout || {}),
      accentColor: newColor,
    });
  };

  const handleQuickFontFamily = (newFont: 'sans' | 'serif' | 'mono') => {
    setLivePreview(null);
    setFontFamily(newFont);
    handleUpdateLayout({
      ...(content.layout || {}),
      fontFamily: newFont,
    });
  };

  const renderStudioToolPanel = (docked: boolean) => {
    if (isTemplatePickerOpen) {
      return (
        <TemplatePicker
          isOpen={true}
          docked={docked}
          onClose={closeStudioPanel}
          currentTemplateKey={templateKey}
          onSelectTemplate={(newKey) => {
            setLivePreview(null);
            setTemplateKey(newKey);
            scheduleAutosave(content, resumeName, newKey);
          }}
          onPreviewTemplate={(preview) =>
            setLivePreview(
              preview
                ? { templateKey: preview.templateKey, label: preview.label }
                : null,
            )
          }
          pageSize={pageSize}
          onPageSizeChange={setPageSize}
          content={content}
          accentColor={effectiveAccentColor}
          fontFamily={effectiveFontFamily}
          showPhoto={showPhoto}
          photoUrl={photoUrl}
        />
      );
    }

    if (isDesignPanelOpen) {
      return (
        <DesignPanel
          isOpen={true}
          docked={docked}
          onClose={closeStudioPanel}
          accentColor={accentColor}
          onAccentColorChange={handleQuickAccentColor}
          fontFamily={fontFamily}
          onFontFamilyChange={handleQuickFontFamily}
          showPhoto={showPhoto}
          onShowPhotoChange={(nextShow) => {
            setShowPhoto(nextShow);
            updateContent((prev) => ({
              ...prev,
              layout: {
                ...prev.layout,
                showPhoto: nextShow,
              },
            }));
          }}
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
          onShowHighlightsChange={(nextHighlights) => {
            setShowHighlights(nextHighlights);
            updateContent((prev) => ({
              ...prev,
              layout: {
                ...prev.layout,
                showHighlights: nextHighlights,
              },
            }));
          }}
          layout={content.layout}
          onLayoutChange={handleUpdateLayout}
          onPreviewChange={(preview) => setLivePreview(preview)}
        />
      );
    }

    if (isRearrangeDrawerOpen) {
      return (
        <SectionRearrangeDrawer
          isOpen={true}
          docked={docked}
          onClose={closeStudioPanel}
          content={content}
          onUpdateLayout={handleUpdateLayout}
          onPreviewLayout={(preview) =>
            setLivePreview(
              preview
                ? { layout: preview.layout, label: preview.label }
                : null,
            )
          }
        />
      );
    }

    if (isAddContentOpen) {
      return (
        <AddContentDrawer
          isOpen={true}
          docked={docked}
          onClose={closeStudioPanel}
          content={content}
          onUpdateContent={updateContent}
          onScrollToSection={(sectionId) => {
            const el = document.getElementById(sectionId);
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'center' });
              el.focus();
            }
          }}
        />
      );
    }

    if (isCheckTailorOpen) {
      return (
        <CheckAndTailorDrawer
          isOpen={true}
          docked={docked}
          onClose={closeStudioPanel}
          resumeId={resumeId}
          resumeContent={content}
          onUpdateContent={updateContent}
          initialMatchId={activeMatchId}
          onMatchChange={handleMatchChange}
          onToggleHighlights={setShowHighlights}
          isHighlightsEnabled={showHighlights}
        />
      );
    }

    if (isFixMistakesOpen) {
      return (
        <FixMistakesDrawer
          isOpen={true}
          docked={docked}
          onClose={closeStudioPanel}
          resumeTitle={resumeName}
          resumeTargetRole={resume?.targetRole}
          content={content}
          localReport={localWritingReport}
          aiReport={aiWritingReport}
          activeReport={activeWritingReport}
          ignoredIds={ignoredWritingIssueIds}
          onIgnoreIssue={(id) =>
            setIgnoredWritingIssueIds((prev) =>
              prev.includes(id) ? prev : [...prev, id],
            )
          }
          onResetIgnored={() => setIgnoredWritingIssueIds([])}
          onApplyContent={(nextContent) => {
            updateContent(() => nextContent);
          }}
          onRunAiDeepCheck={handleRunAiWritingCheck}
          isRunningAiCheck={isRunningAiWritingCheck}
          aiCheckError={aiWritingCheckError}
          onLocateIssue={handleLocateWritingIssue}
        />
      );
    }

    if (isAuditDrawerOpen || (!docked && mobileTab === 'ai')) {
      return (
        <AtsAuditDrawer
          isOpen={true}
          docked={docked}
          onClose={() => {
            closeStudioPanel();
            if (mobileTab === 'ai') setMobileTab('preview');
          }}
          score={analysis?.score ?? liveScore}
          analysis={analysis}
          isAnalyzing={isAnalyzing}
          onRunAudit={handleRunAudit}
          onOpenFixMistakes={() => openStudioPanel('mistakes')}
          resumeId={resumeId}
          resumeTitle={resumeName || content?.headline}
        />
      );
    }

    return null;
  };

  return (
    <div
      className={`print:space-y-0 print:p-0 print:m-0 print:max-w-none print:block print:h-auto print:overflow-visible max-w-[1680px] mx-auto px-2 sm:px-4 ${editorMode === 'canvas'
          ? 'flex flex-col gap-3 lg:h-[calc(100dvh-5.5rem)] lg:overflow-hidden pb-28 sm:pb-36 lg:pb-0 print:pb-0'
          : 'space-y-4'
        }`}
    >
      {errorMessage && (
        <div className="shrink-0 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs">
          {errorMessage}
        </div>
      )}
      {/* Top Action Bar */}
      <div className="print:hidden shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-3 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <Link
            href="/app/resumes"
            className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-900 transition-colors shrink-0"
            title="Back to Resumes"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 min-w-0">
              <input
                type="text"
                aria-label="Resume title"
                value={resumeName}
                onChange={(e) => {
                  setResumeName(e.target.value);
                  scheduleAutosave(content, e.target.value, templateKey);
                }}
                className="text-sm sm:text-base md:text-lg font-bold bg-transparent border-b border-transparent hover:border-zinc-300 focus:border-blue-600 focus:outline-none text-zinc-900 dark:text-zinc-50 px-1 truncate max-w-[170px] sm:max-w-xs md:max-w-md"
              />
              {resume?.isMaster && (
                <Badge variant="success" className="shrink-0">Master</Badge>
              )}
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-zinc-600 dark:text-zinc-400 mt-0.5 px-1 truncate">
              <span>v{serverVersion}</span>
              <span>·</span>
              <span className="flex items-center gap-1 truncate">
                {saveStatus === 'saving' && (
                  <span className="text-blue-700 dark:text-blue-400 animate-pulse">Saving changes...</span>
                )}
                {saveStatus === 'saved' && (
                  <span className="text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
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
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          {/* Dual-Mode Switcher: Visual Canvas (Canva Style) vs Classic Forms */}
          <div
            className="flex items-center p-0.5 rounded-lg bg-zinc-100 dark:bg-zinc-800/90 border border-zinc-200 dark:border-zinc-700/80 shadow-2xs text-xs"
            role="group"
            aria-label="Editor Layout Mode"
          >
            <button
              type="button"
              id="editor-mode-canvas-btn"
              onClick={() => handleToggleEditorMode('canvas')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${editorMode === 'canvas'
                ? 'bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-xs border border-zinc-200/80 dark:border-zinc-700/80'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              title="Visual Canvas Mode: Direct on-paper Canva-style editing with floating AI actions"
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>Visual Canvas</span>
              <span className="text-[9px] px-1 py-0.2 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold hidden sm:inline">
                Canva
              </span>
            </button>
            <button
              type="button"
              id="editor-mode-form-btn"
              onClick={() => handleToggleEditorMode('form')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${editorMode === 'form'
                ? 'bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-xs border border-zinc-200/80 dark:border-zinc-700/80'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              title="Classic Forms Mode: Form-driven input fields with side-by-side preview"
            >
              <Columns2 className="w-3.5 h-3.5" />
              <span>Classic Forms</span>
            </button>
          </div>

          {/* Template Switcher */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 hidden sm:inline">Template:</span>
            <select
              aria-label="Resume template"
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
          <Link href={`/app/cover-letters?resumeId=${resumeId}`} className={editorMode === 'canvas' ? 'hidden xl:inline-flex' : ''}>
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

          {/* Open ATS Score & Audit Drawer Button (Desktop) */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => toggleStudioPanel('ats')}
            className={`hidden lg:flex items-center gap-1.5 text-xs font-semibold ${
              isAuditDrawerOpen
                ? 'border-blue-500 bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-200'
                : 'border-blue-200 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50'
            }`}
            title="Inspect ATS Score & Evidence Audit"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>ATS Score: {analysis?.score ?? liveScore}</span>
          </Button>

          {/* Desktop AI Agent Split-Screen Toggle */}
          <button
            type="button"
            id="toggle-desktop-agent-btn"
            aria-expanded={editorMode === 'canvas' ? isAgentPanelOpen : isMobileAgentOpen}
            aria-controls={editorMode === 'canvas' ? 'desktop-agent-pane' : 'mobile-agent-drawer'}
            onClick={() => {
              if (editorMode !== 'canvas') {
                setHasMountedMobileAgent(true);
                setIsMobileAgentOpen((prev) => !prev);
              } else {
                toggleStudioPanel('agent');
              }
            }}
            className={`hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer relative ${
              (editorMode === 'canvas' ? isAgentPanelOpen : isMobileAgentOpen)
                ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700 shadow-xs'
                : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700 hover:border-blue-300 hover:text-blue-600'
            }`}
            title={isAgentPanelOpen ? 'Collapse AI Agent panel' : 'Expand AI Agent panel'}
          >
            {(editorMode === 'canvas' ? isAgentPanelOpen : isMobileAgentOpen) ? (
              <Bot className="w-3.5 h-3.5" aria-hidden="true" />
            ) : (
              <PanelLeftOpen className="w-3.5 h-3.5" aria-hidden="true" />
            )}
            <span>AI Agent</span>
            {activeAgentProposal && !isAgentPanelOpen && (
              <span
                className="w-2 h-2 rounded-full bg-amber-400 ring-2 ring-white dark:ring-zinc-900"
                aria-label="Pending proposal"
              />
            )}
          </button>

          {/* Mobile & Tablet AI Agent Drawer Toggle */}
          <button
            type="button"
            id="toggle-mobile-agent-btn"
            aria-expanded={isMobileAgentOpen}
            aria-controls="mobile-agent-drawer"
            onClick={() => {
              setHasMountedMobileAgent(true);
              setIsMobileAgentOpen(true);
            }}
            className="lg:hidden inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-xs transition-colors cursor-pointer relative"
          >
            <Bot className="w-3.5 h-3.5" aria-hidden="true" />
            <span>AI Agent</span>
            {activeAgentProposal && (
              <span
                className="w-2 h-2 rounded-full bg-amber-300"
                aria-label="Pending proposal"
              />
            )}
          </button>
        </div>
      </div>

      {/* Competitor-Style Secondary Action Toolbar (Visible in Classic Forms Mode) */}
      {editorMode === 'form' && (
        <div className="print:hidden flex items-center justify-between py-2 px-2.5 sm:px-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs shadow-xs overflow-x-auto no-scrollbar gap-2 max-w-full">
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Fix Mistakes Button (Live Grammar, Spelling & Buzzword Checker) */}
            <button
              id="fix-mistakes-btn"
              type="button"
              onClick={() => toggleStudioPanel('mistakes')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                isFixMistakesOpen
                  ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-200 ring-1 ring-amber-300 dark:ring-amber-700'
                  : 'text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
              title="Inspect grammar, spelling, buzzwords, and weak phrasing with 1-click fixes"
            >
              <CheckCircle2
                className={`w-4 h-4 ${visibleWritingIssueCount === 0
                  ? 'text-emerald-600'
                  : 'text-amber-500'
                  }`}
              />
              <span className="font-semibold">Fix Mistakes</span>
              <span
                id="fix-mistakes-badge"
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold text-white shadow-xs ${visibleWritingIssueCount === 0
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
              onClick={() => toggleStudioPanel('tailor')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                isCheckTailorOpen
                  ? 'bg-cyan-50 dark:bg-cyan-950/50 text-cyan-800 dark:text-cyan-200 ring-1 ring-cyan-300 dark:ring-cyan-700'
                  : 'text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
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
              onClick={() => toggleStudioPanel('sections')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                isRearrangeDrawerOpen
                  ? 'bg-sky-50 dark:bg-sky-950/50 text-sky-800 dark:text-sky-200 ring-1 ring-sky-300 dark:ring-sky-700'
                  : 'text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
              title="Drag & drop to reorder or hide resume sections"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Rearrange</span>
            </button>

            {/* Templates Drawer Button */}
            <button
              type="button"
              onClick={() => toggleStudioPanel('templates')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold border transition-colors shadow-2xs cursor-pointer ${
                isTemplatePickerOpen
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/40'
              }`}
            >
              <LayoutTemplate className="w-3.5 h-3.5" />
              <span>Templates</span>
            </button>

            {/* Color Button (opens Design panel) */}
            <button
              type="button"
              onClick={() => toggleStudioPanel('design')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                isDesignPanelOpen
                  ? 'bg-purple-50 dark:bg-purple-950/50 text-purple-800 dark:text-purple-200 ring-1 ring-purple-300 dark:ring-purple-700'
                  : 'text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
              title="Customize accent colors"
            >
              <Palette className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span>Color</span>
              <span
                className="w-2.5 h-2.5 rounded-full border border-black/10 dark:border-white/20 inline-block shrink-0"
                style={{ backgroundColor: effectiveAccentColor }}
              />
            </button>

            {/* Font Button (opens Design panel) */}
            <button
              type="button"
              onClick={() => openStudioPanel('design')}
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
              onClick={() => openStudioPanel('design')}
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
              className={`p-1.5 rounded-lg border transition-colors flex items-center gap-1 text-[11px] font-medium ${showHighlights
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
              className={`px-2.5 py-1.5 rounded-lg border transition-colors flex items-center gap-1.5 text-[11px] font-semibold cursor-pointer ${shareState?.share?.isActive
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
      )}

      {/* Mobile Sticky Segmented Navigation (< lg) - Active in Classic Forms Mode */}
      {editorMode === 'form' && (
        <div className="print:hidden lg:hidden sticky top-0 z-20 pb-3 pt-1 bg-zinc-50/95 dark:bg-zinc-950/95 backdrop-blur-xs">
          <div className="grid grid-cols-3 p-1 rounded-xl bg-zinc-200/80 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-xs shadow-inner">
            <button
              onClick={() => setMobileTab('editor')}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-lg font-semibold transition-all ${mobileTab === 'editor'
                ? 'bg-white dark:bg-zinc-900 shadow-sm text-blue-600 dark:text-blue-400'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Form</span>
            </button>
            <button
              onClick={() => setMobileTab('preview')}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-lg font-semibold transition-all ${mobileTab === 'preview'
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
              className={`flex items-center justify-center gap-1.5 py-2 rounded-lg font-semibold transition-all ${mobileTab === 'ai'
                ? 'bg-white dark:bg-zinc-900 shadow-sm text-blue-600 dark:text-blue-400'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Audit</span>
            </button>
          </div>
        </div>
      )}

      {/* Conflict Resolution Banner */}
      {hasConflict && (
        <div className="print:hidden shrink-0 p-4 rounded-xl border border-rose-300 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 flex items-center justify-between text-xs">
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
              onClick={async () => {
                try {
                  const latest = await apiClient.getResume(resumeId);
                  setServerVersion(latest.version);
                  setHasConflict(false);
                  await performSave(content, resumeName, templateKey, latest.version);
                } catch {
                  await performSave(content, resumeName, templateKey, serverVersion);
                }
              }}
              className="text-xs"
            >
              Overwrite
            </Button>
          </div>
        </div>
      )}

      {/* Main Layout: Adapts dynamically between Canva-style Full Canvas and Classic Split-Form */}
      <div
        className={`print:block print:w-full print:m-0 print:p-0 print:h-auto print:overflow-visible ${editorMode === 'form'
          ? 'grid grid-cols-1 lg:grid-cols-12 gap-5 items-start'
          : 'flex flex-col lg:flex-row items-start lg:items-stretch lg:flex-1 lg:min-h-0 gap-4 lg:gap-5'
          }`}
      >
        {/* Canva Left Tool Dock (Always visible in Canvas Mode so user can switch tools in 1 click) */}
        {editorMode === 'canvas' && (
          <CanvaDock
            activePanel={activePanel}
            onOpenAgent={() => toggleStudioPanel('agent')}
            hasPendingProposal={Boolean(activeAgentProposal)}
            onOpenTemplates={() => toggleStudioPanel('templates')}
            onOpenDesign={() => toggleStudioPanel('design')}
            onOpenAddContent={() => toggleStudioPanel('content')}
            onOpenAtsAudit={() => toggleStudioPanel('ats')}
            onOpenTailor={() => toggleStudioPanel('tailor')}
            onOpenFixMistakes={() => toggleStudioPanel('mistakes')}
            onOpenRearrange={() => toggleStudioPanel('sections')}
            onOpenVersions={handleOpenVersions}
            onOpenPhoto={() => setIsPhotoModalOpen(true)}
            onOpenExport={() => setIsExportModalOpen(true)}
            onOpenShare={() => setIsShareDrawerOpen(true)}
            atsScore={analysis?.score ?? liveScore}
            matchScore={activeMatchScore}
            mistakesCount={visibleWritingIssueCount}
            activeAccentColor={effectiveAccentColor}
          />
        )}

        {/* Phase 3: Desktop Split-Screen AI Agent Pane (kept mounted once opened so SSE never drops on tool switch) */}
        {(hasMountedDesktopAgent || isAgentPanelOpen) && (
          <div
            id="desktop-agent-pane"
            className={`${
              editorMode === 'canvas' && isAgentPanelOpen
                ? 'hidden lg:flex lg:flex-col'
                : 'hidden'
            } lg:w-[370px] xl:w-[410px] shrink-0 lg:h-full lg:min-h-0 print:hidden min-w-0`}
          >
            <AgentChatPanel
              resumeId={resumeId}
              resumeName={resumeName || 'Untitled Resume'}
              activeProposal={activeAgentProposal}
              onProposalChange={(proposal) => {
                setActiveAgentProposal(proposal);
                if (!proposal) setFocusedDiffPath(null);
              }}
              focusedDiffPath={focusedDiffPath}
              onFocusDiffField={(path) => setFocusedDiffPath(path)}
              onProposalApproved={handleAgentProposalApproved}
              onProposalRejected={handleAgentProposalRejected}
              onCollapse={closeStudioPanel}
            />
          </div>
        )}

        {/* Docked Left Studio Inspector Pane (Desktop Canvas Mode — zero blur, zero overlap over resume canvas) */}
        {editorMode === 'canvas' && isDesktopLg && isNonAgentToolActive && (
          <div
            id="desktop-studio-inspector"
            data-testid="desktop-studio-inspector"
            className="hidden lg:flex lg:flex-col lg:w-[360px] xl:w-[400px] shrink-0 lg:h-full lg:min-h-0 print:hidden min-w-0 animate-in fade-in slide-in-from-left-2 duration-150"
          >
            {renderStudioToolPanel(true)}
          </div>
        )}

        {/* PANEL 1: Left Section Editor OR Docked Tool Inspector (Visible in Classic Form Mode) */}
        {editorMode === 'form' && (
          <div className={`print:hidden min-w-0 lg:col-span-5 space-y-3 ${mobileTab !== 'editor' ? 'hidden lg:block' : ''}`}>
            {isDesktopLg && isNonAgentToolActive ? (
              <div className="space-y-2.5 lg:sticky lg:top-4">
                <button
                  type="button"
                  onClick={closeStudioPanel}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Form Fields</span>
                </button>
                <div className="h-[calc(100dvh-11rem)] min-h-[520px]">
                  {renderStudioToolPanel(true)}
                </div>
              </div>
            ) : (
            <>
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
                  className={`flex-none px-3 py-1.5 rounded-md whitespace-nowrap transition-colors cursor-pointer ${activeSection === s.id
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

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
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
                            const val = e.target.value;
                            list[expIdx] = {
                              ...list[expIdx],
                              endDate: val,
                              current: /^present|current$/i.test(val.trim()),
                            };
                            return { ...prev, experience: list };
                          })
                        }
                        className="text-xs p-1.5 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                      />
                      <input
                        type="text"
                        placeholder="Location (e.g. Remote)"
                        value={exp.location || ''}
                        onChange={(e) =>
                          updateContent((prev) => {
                            const list = [...(prev.experience || [])];
                            list[expIdx] = { ...list[expIdx], location: e.target.value };
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
                                const list = (prev.experience || []).map((item, idx) =>
                                  idx === expIdx
                                    ? { ...item, bullets: [...(item.bullets || []), ''] }
                                    : item,
                                );
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
                              aria-label={`Experience ${expIdx + 1} bullet ${bulletIdx + 1}`}
                              rows={2}
                              value={bullet}
                              onChange={(e) => {
                                const nextVal = e.target.value;
                                updateContent((prev) => {
                                  const list = (prev.experience || []).map((item, idx) => {
                                    if (idx !== expIdx) return item;
                                    const nextBullets = [...(item.bullets || [])];
                                    nextBullets[bulletIdx] = nextVal;
                                    return { ...item, bullets: nextBullets };
                                  });
                                  return { ...prev, experience: list };
                                });
                              }}
                              placeholder="Describe outcome with metrics (e.g. Led migration reducing p99 latency by 34%)..."
                              className="flex-1 text-xs p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-600 leading-relaxed"
                            />
                            <div className="flex flex-col gap-1">
                              <button
                                type="button"
                                onClick={() => handleEnhanceBullet(expIdx, bulletIdx, bullet)}
                                className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded transition-colors"
                                title="Enhance with STAR / XYZ formula"
                                aria-label={`Enhance bullet ${bulletIdx + 1} with AI`}
                              >
                                <Sparkles className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  updateContent((prev) => {
                                    const list = (prev.experience || []).map((item, idx) =>
                                      idx === expIdx
                                        ? {
                                            ...item,
                                            bullets: (item.bullets || []).filter((_, i) => i !== bulletIdx),
                                          }
                                        : item,
                                    );
                                    return { ...prev, experience: list };
                                  })
                                }
                                className="p-1 text-zinc-400 hover:text-rose-600 rounded"
                                title="Delete bullet"
                                aria-label={`Delete bullet ${bulletIdx + 1}`}
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
            </>
            )}
          </div>
        )}

        {/* PANEL 2: Interactive Resume Canvas (Always visible, bright, unblurred, auto-scales beside active docked tool) */}
        <div
          className={`${editorMode === 'form'
            ? 'lg:col-span-7 space-y-3'
            : activePanel
              ? 'w-full flex-1 min-w-0 lg:h-full lg:min-h-0 lg:flex lg:flex-col'
              : 'flex-1 min-w-0 max-w-5xl mx-auto w-full lg:h-full lg:min-h-0 lg:flex lg:flex-col'
            } print:space-y-0 print:p-0 print:m-0 print:w-full print:h-auto print:block ${mobileTab !== 'preview' && editorMode === 'form' ? 'hidden lg:block' : ''
            }`}
        >
          {/* ATS Alignment Score & Audit Banner (Visible in Classic Forms Mode) */}
          {editorMode === 'form' && (
            <AtsScoreBanner
              score={analysis?.score ?? liveScore}
              analysis={analysis}
              isAnalyzing={isAnalyzing}
              onRunAudit={handleRunAudit}
              onOpenDetails={() => toggleStudioPanel('ats')}
              resumeId={resumeId}
            />
          )}

          {/* Document Canvas Preview Card */}
          <div
            className={`p-2 sm:p-4 md:p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-[#F7F8FA] dark:bg-[#111317] print:p-0 print:border-none print:shadow-none print:bg-transparent overflow-clip print:overflow-visible print:block print:h-auto ${
              editorMode === 'canvas' ? 'lg:flex-1 lg:min-h-0 lg:flex lg:flex-col' : ''
            }`}
          >
            {/* Compact Direct Live-Design Canvas Header Bar (1-click + hover preview without opening any modal!) */}
            <div className="print:hidden shrink-0 flex flex-wrap items-center justify-between pb-2.5 border-b border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500 mb-3 gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                  Live Canvas
                </span>
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono hidden xl:inline">
                  {pageSize === 'A4' ? 'A4' : 'Letter'}
                </span>

                {/* Instant Quick Color Dots (Hover to live-preview, click to commit) */}
                <div
                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-700/80 shadow-2xs studio-preview-group"
                  onMouseLeave={() => setLivePreview(null)}
                  aria-label="Quick accent colors"
                >
                  {ACCENT_SWATCHES.slice(0, 6).map((swatch) => {
                    const isSelected = accentColor.toLowerCase() === swatch.hex.toLowerCase();
                    return (
                      <button
                        key={swatch.id}
                        type="button"
                        {...({ interestfor: 'resume-document-print' } as Record<string, string>)}
                        onMouseEnter={() =>
                          setLivePreview({ accentColor: swatch.hex, label: swatch.label })
                        }
                        onFocus={() =>
                          setLivePreview({ accentColor: swatch.hex, label: swatch.label })
                        }
                        onBlur={() => setLivePreview(null)}
                        onClick={() => handleQuickAccentColor(swatch.hex)}
                        title={`Color: ${swatch.label} (hover to preview, click to apply)`}
                        aria-label={`Set accent color to ${swatch.label}`}
                        className={`w-4 h-4 rounded-full transition-transform cursor-pointer flex items-center justify-center ${
                          isSelected
                            ? 'ring-2 ring-offset-1 ring-zinc-900 dark:ring-white dark:ring-offset-zinc-900 scale-110'
                            : 'hover:scale-115'
                        }`}
                        style={{ backgroundColor: swatch.hex }}
                      />
                    );
                  })}
                  <label
                    className="w-4 h-4 rounded-full border border-zinc-300 dark:border-zinc-600 overflow-hidden cursor-pointer flex items-center justify-center ml-0.5 hover:scale-110 transition-transform"
                    title="Pick custom accent color (live)"
                  >
                    <input
                      type="color"
                      aria-label="Quick custom accent color"
                      value={/^#[0-9a-f]{6}$/i.test(accentColor) ? accentColor : '#2563eb'}
                      onInput={(e) =>
                        handleQuickAccentColor((e.target as HTMLInputElement).value)
                      }
                      onChange={(e) => handleQuickAccentColor(e.target.value)}
                      className="w-6 h-6 -m-1 border-0 cursor-pointer bg-transparent p-0"
                    />
                  </label>
                </div>

                {/* Instant Quick Font Switcher (Hover to live-preview, click to commit) */}
                <div
                  className="flex items-center bg-zinc-200/70 dark:bg-zinc-800 p-0.5 rounded-lg text-[10px] studio-preview-group"
                  onMouseLeave={() => setLivePreview(null)}
                  role="group"
                  aria-label="Quick font family"
                >
                  {(
                    [
                      { id: 'sans', label: 'Sans', title: 'Inter (Sans-serif)' },
                      { id: 'serif', label: 'Serif', title: 'Georgia (Serif)' },
                      { id: 'mono', label: 'Mono', title: 'Roboto Mono (Tech)' },
                    ] as const
                  ).map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      {...({ interestfor: 'resume-document-print' } as Record<string, string>)}
                      onMouseEnter={() =>
                        setLivePreview({ fontFamily: f.id, label: f.title })
                      }
                      onFocus={() =>
                        setLivePreview({ fontFamily: f.id, label: f.title })
                      }
                      onBlur={() => setLivePreview(null)}
                      onClick={() => handleQuickFontFamily(f.id)}
                      title={`Font: ${f.title}`}
                      className={`px-2 py-0.5 rounded-md font-medium transition-colors cursor-pointer ${
                        f.id === 'serif'
                          ? 'font-serif'
                          : f.id === 'mono'
                            ? 'font-mono'
                            : 'font-sans'
                      } ${
                        fontFamily === f.id
                          ? 'bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 font-bold shadow-xs'
                          : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                {/* Quick Page Mode Toggle */}
                <div className="flex items-center bg-zinc-200/70 dark:bg-zinc-800 p-0.5 rounded-lg text-[10px]">
                  <button
                    type="button"
                    onClick={() =>
                      handleUpdateLayout({
                        ...(content?.layout || {}),
                        pageMode: 'single',
                      })
                    }
                    className={`px-2 py-0.5 rounded-md font-medium transition-colors cursor-pointer ${content?.layout?.pageMode === 'single'
                      ? 'bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 font-bold shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                      }`}
                    title="Fit entire resume on 1 A4 page (no empty gaps)"
                  >
                    1 Page
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleUpdateLayout({
                        ...(content?.layout || {}),
                        pageMode: 'auto',
                      })
                    }
                    className={`px-2 py-0.5 rounded-md font-medium transition-colors cursor-pointer ${!content?.layout?.pageMode || content.layout.pageMode === 'auto'
                      ? 'bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 font-bold shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                      }`}
                    title="Smart auto-fit based on content length"
                  >
                    Auto
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleUpdateLayout({
                        ...(content?.layout || {}),
                        pageMode: 'multi',
                        fontSizeScale: 1.0,
                        lineHeight: 1.45,
                        sectionSpacing: 16,
                        pageMargin: 36,
                      })
                    }
                    className={`px-2 py-0.5 rounded-md font-medium transition-colors cursor-pointer ${
                      content?.layout?.pageMode === 'multi'
                        ? 'bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 font-bold shadow-xs'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                    }`}
                    title="Allow multi-page split"
                  >
                    2 Pages
                  </button>
                </div>

                {/* Live Hover Preview Pill (intentionally non-live-region per accessibility guidance) */}
                {livePreview?.label && (
                  <span
                    data-testid="live-preview-pill"
                    className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white shadow-xs"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    Previewing: {livePreview.label}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                {/* Quick Score Capsule Pill */}
                <button
                  type="button"
                  onClick={() => toggleStudioPanel('ats')}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10.5px] font-bold bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors cursor-pointer"
                  title="Inspect ATS Alignment & Evidence Audit"
                >
                  <Sparkles className="w-2.5 h-2.5 text-blue-600 dark:text-blue-400" />
                  <span>{analysis?.score ?? liveScore}/100</span>
                </button>

                {/* Quick Inspector Shortcut: Design */}
                <button
                  type="button"
                  onClick={() => toggleStudioPanel('design')}
                  className={`font-medium text-[11px] border px-2 py-1 rounded-md transition-colors flex items-center gap-1 shadow-2xs cursor-pointer ${
                    isDesignPanelOpen
                      ? 'bg-purple-600 text-white border-purple-600'
                      : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-purple-400'
                  }`}
                  title="Open full Design, Spacing & Margins controls"
                >
                  <Palette className="w-3 h-3" />
                  <span className="hidden sm:inline">Design</span>
                </button>

                {/* Quick Inspector Shortcut: Templates */}
                <button
                  type="button"
                  onClick={() => toggleStudioPanel('templates')}
                  className={`font-medium text-[11px] border px-2 py-1 rounded-md transition-colors flex items-center gap-1 shadow-2xs cursor-pointer ${
                    isTemplatePickerOpen
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-blue-400'
                  }`}
                  title="Browse & live-preview all 10 ATS templates"
                >
                  <LayoutTemplate className="w-3 h-3" />
                  <span className="hidden sm:inline">Templates</span>
                </button>

                {/* Zoom Controls */}
                <div className="flex items-center bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-0.5 text-[11px] shadow-2xs">
                  <button
                    type="button"
                    onClick={() => {
                      if (zoomMode === '125') setZoomMode('100');
                      else if (zoomMode === '100') setZoomMode('75');
                      else setZoomMode('fit');
                    }}
                    className="w-5 h-5 flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded text-zinc-600 dark:text-zinc-300 font-semibold cursor-pointer"
                    title="Zoom Out"
                  >
                    –
                  </button>
                  <button
                    type="button"
                    onClick={() => setZoomMode(zoomMode === 'fit' ? '100' : 'fit')}
                    className="px-1.5 py-0.5 font-mono text-[10px] text-zinc-700 dark:text-zinc-300 font-medium hover:text-blue-600 cursor-pointer"
                    title="Toggle Fit / 100%"
                  >
                    {zoomMode === 'fit' ? `${Math.round(fitScale * 100)}%` : `${zoomMode}%`}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (zoomMode === 'fit' || zoomMode === '75') setZoomMode('100');
                      else if (zoomMode === '100') setZoomMode('125');
                    }}
                    className="w-5 h-5 flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded text-zinc-600 dark:text-zinc-300 font-semibold cursor-pointer"
                    title="Zoom In"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Scaled A4 True-Canvas Container */}
            <div
              ref={canvasContainerRef}
              className={`w-full overflow-x-auto py-2 print:overflow-visible print:p-0 print:h-auto print:block select-text ${
                editorMode === 'canvas'
                  ? 'overflow-y-hidden lg:flex-1 lg:min-h-0 lg:overflow-y-auto overscroll-x-contain lg:overscroll-contain [scrollbar-gutter:stable] pb-24 lg:pb-24 print:pb-0'
                  : 'overflow-y-hidden overscroll-x-contain'
              }`}
            >
              <div
                style={{
                  width: `${scaledWidth}px`,
                  minWidth: `${scaledWidth}px`,
                  height: `${scaledHeight}px`,
                  minHeight: `${scaledHeight}px`,
                }}
                className="mx-auto relative shrink-0 print:w-full print:h-auto print:min-w-0 print:m-0"
              >
                <div
                  style={{
                    width: `${targetA4Width}px`,
                    transform: `scale(${effectiveScale})`,
                    transformOrigin: 'top left',
                    transition: 'transform 0.12s ease-out',
                  }}
                  className="origin-top-left print:transform-none print:w-full print:h-auto"
                >
                  <div
                    ref={setResumePrintRef}
                    id="resume-document-print"
                    data-live-preview={livePreview ? 'true' : undefined}
                    style={{ width: `${targetA4Width}px` }}
                    className="w-full print:w-full print:max-w-full"
                  >
                    {(() => {
                      const TemplateComponent = getTemplateComponent(effectiveTemplateKey);
                      return (
                        <CanvasEditProvider
                          isEditable={editorMode === 'canvas' && !isExportModalOpen}
                          onUpdateField={handleCanvasFieldUpdate}
                          activeSelection={activeCanvasSelection}
                          setActiveSelection={setActiveCanvasSelection}
                          onAddBulletBelow={handleCanvasAddBulletBelow}
                          onDeleteBullet={handleCanvasDeleteBullet}
                          onMoveBullet={handleCanvasMoveBullet}
                          onAddExperience={handleCanvasAddExperience}
                          onAddProject={handleCanvasAddProject}
                          onAddEducation={handleCanvasAddEducation}
                          onAddSkill={handleCanvasAddSkill}
                          onAddCertification={handleCanvasAddCertification}
                          onDeleteExperience={handleCanvasDeleteExperience}
                          onDeleteProject={handleCanvasDeleteProject}
                          onDeleteEducation={handleCanvasDeleteEducation}
                          onDeleteSkill={handleCanvasDeleteSkill}
                          onMoveSection={handleCanvasMoveSection}
                          pendingDiffs={isExportModalOpen ? undefined : pendingCanvasDiffs}
                          focusedDiffPath={focusedDiffPath}
                          onFocusDiff={setFocusedDiffPath}
                        >
                          <TemplateComponent
                            content={content}
                            accentColor={effectiveAccentColor}
                            fontFamily={effectiveFontFamily}
                            showPhoto={showPhoto}
                            photoUrl={photoUrl}
                            highlightKeywords={activeJobKeywords.length > 0 ? activeJobKeywords : undefined}
                            showHighlights={isExportModalOpen ? false : showHighlights}
                          />
                          <CanvasFloatingToolbar onTriggerAiEnhance={handleTriggerAiEnhanceFromCanvas} />
                        </CanvasEditProvider>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
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
                      {
                        section: activeSuggestion.section,
                        projIdx: activeSuggestion.projIdx,
                        customSectionId: activeSuggestion.customSectionId,
                        customEntryIdx: activeSuggestion.customEntryIdx,
                      },
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
                            className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer ${activeSuggestion.selectedVariantIdx === vIdx
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
      {/* Mobile / Tablet Overlay Fallback for Studio Inspector Tools (< lg only; desktop uses docked Left Studio Inspector) */}
      {!isDesktopLg && renderStudioToolPanel(false)}

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

      {/* Canva-Grade Floating Bottom Workspace Bar (Zoom, Pages, Undo/Redo) */}
      {editorMode === 'canvas' && (
        <CanvaBottomBar
          zoomMode={zoomMode}
          effectiveScale={effectiveScale}
          onSetZoomMode={setZoomMode}
          pageCount={pageSize === 'US Letter' ? 1 : 1}
          canUndo={historyStack.length > 0}
          canRedo={redoStack.length > 0}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onFitPage={() => setZoomMode('fit')}
          onOpenAddContent={() => toggleStudioPanel('content')}
          shiftForInspector={Boolean(activePanel)}
        />
      )}
      {/* Phase 3: Mobile & Form-Mode Slide-Over AI Agent Drawer (kept mounted once opened so SSE survives close/locate) */}
      {(hasMountedMobileAgent || isMobileAgentOpen) && (
        <div
          id="mobile-agent-drawer"
          className={`fixed inset-0 z-40 print:hidden justify-end ${
            isMobileAgentOpen ? 'flex' : 'hidden'
          }`}
          role="dialog"
          aria-modal="true"
          aria-label="AI Resume Agent"
        >
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setIsMobileAgentOpen(false)}
            aria-hidden="true"
          />
          <div className="relative z-10 w-full max-w-md h-full shadow-2xl">
            <AgentChatPanel
              resumeId={resumeId}
              resumeName={resumeName || 'Untitled Resume'}
              activeProposal={activeAgentProposal}
              onProposalChange={(proposal) => {
                setActiveAgentProposal(proposal);
                if (!proposal) setFocusedDiffPath(null);
              }}
              focusedDiffPath={focusedDiffPath}
              onFocusDiffField={(path) => {
                setFocusedDiffPath(path);
                setIsMobileAgentOpen(false);
              }}
              onProposalApproved={async (res) => {
                await handleAgentProposalApproved(res);
                setIsMobileAgentOpen(false);
              }}
              onProposalRejected={handleAgentProposalRejected}
              onCollapse={() => setIsMobileAgentOpen(false)}
              isMobileDrawer
            />
          </div>
        </div>
      )}

      {/* Phase 3: Accessible Toast Notification for Agent Approval / Rejection */}
      {agentToast && (
        <div
          role="status"
          aria-live="polite"
          data-testid="agent-toast"
          className={`print:hidden fixed bottom-6 right-6 z-50 max-w-sm rounded-xl border px-4 py-3 text-xs font-medium shadow-lg flex items-center gap-2.5 ${agentToast.type === 'success'
            ? 'bg-emerald-950 text-emerald-50 border-emerald-800'
            : 'bg-zinc-900 text-zinc-100 border-zinc-700'
            }`}
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
          <span className="flex-1">{agentToast.message}</span>
          <button
            type="button"
            onClick={() => setAgentToast(null)}
            className="p-0.5 rounded hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Dismiss notification"
          >
            <X className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}
