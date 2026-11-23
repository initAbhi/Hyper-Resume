'use client';

import React from 'react';
import {
  Bot,
  LayoutTemplate,
  Palette,
  ShieldCheck,
  Briefcase,
  CheckCircle2,
  ArrowUpDown,
  History,
  Camera,
  Download,
  Share2,
  PlusCircle,
} from 'lucide-react';

export type StudioPanel =
  | 'agent'
  | 'templates'
  | 'design'
  | 'content'
  | 'sections'
  | 'ats'
  | 'tailor'
  | 'mistakes'
  | null;

export interface CanvaDockProps {
  activePanel?: StudioPanel;
  onOpenAgent?: () => void;
  hasPendingProposal?: boolean;
  onOpenTemplates: () => void;
  onOpenDesign: () => void;
  onOpenAddContent?: () => void;
  onOpenAtsAudit: () => void;
  onOpenTailor: () => void;
  onOpenFixMistakes: () => void;
  onOpenRearrange: () => void;
  onOpenVersions: () => void;
  onOpenPhoto: () => void;
  onOpenExport: () => void;
  onOpenShare: () => void;
  atsScore?: number;
  matchScore?: number | null;
  mistakesCount?: number;
  activeAccentColor?: string;
}

export function CanvaDock({
  activePanel = null,
  onOpenAgent,
  hasPendingProposal = false,
  onOpenTemplates,
  onOpenDesign,
  onOpenAddContent,
  onOpenAtsAudit,
  onOpenTailor,
  onOpenFixMistakes,
  onOpenRearrange,
  onOpenVersions,
  onOpenPhoto,
  onOpenExport,
  onOpenShare,
  atsScore = 0,
  matchScore = null,
  mistakesCount = 0,
  activeAccentColor = '#000000',
}: CanvaDockProps) {
  // Labels under icons; active = filled rounded box only (no left rail / ActiveIndicator)
  const itemClasses = (isActive: boolean, activeColors: string, hoverColors: string) =>
    `w-11 h-11 shrink-0 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all group cursor-pointer relative isolate ${
      isActive
        ? `${activeColors}`
        : `text-zinc-600 dark:text-zinc-400 ${hoverColors}`
    }`;

  return (
    <div
      data-export-exclude="true"
      className="print:hidden relative w-full lg:w-[54px] xl:w-[58px] shrink-0 sticky top-0 z-20 lg:static lg:h-full lg:min-h-0 lg:flex lg:flex-col overflow-x-clip"
    >
      <aside
        className="w-full max-w-full flex flex-row lg:flex-col items-center overflow-x-auto lg:overflow-y-auto lg:overflow-x-clip lg:max-h-full py-2 lg:py-2 px-1 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800 rounded-xl lg:rounded-2xl shadow-sm gap-0.5 select-none no-scrollbar overscroll-contain"
        aria-label="Canva Tools Dock"
      >
        {onOpenAgent && (
          <button
            type="button"
            id="canva-dock-agent"
            aria-pressed={activePanel === 'agent'}
            onClick={onOpenAgent}
            className={itemClasses(
              activePanel === 'agent',
              'bg-blue-600 text-white ring-blue-500/40',
              'hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/80 dark:hover:bg-blue-950/40',
            )}
            title="AI Resume Agent"
          >
            <Bot
              className={`w-4 h-4 ${
                activePanel === 'agent' ? 'text-white' : 'text-blue-600 dark:text-blue-400'
              }`}
            />
            <span className="text-[7px] font-semibold tracking-tight leading-none">AI Agent</span>
            {hasPendingProposal && activePanel !== 'agent' && (
              <span className="w-2 h-2 rounded-full bg-amber-400 absolute top-1 right-1 ring-2 ring-white dark:ring-zinc-900" />
            )}
          </button>
        )}

        <button
          type="button"
          id="canva-dock-design"
          aria-pressed={activePanel === 'design'}
          onClick={onOpenDesign}
          className={itemClasses(
            activePanel === 'design',
            'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 ring-purple-300 dark:ring-purple-700',
            'hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50/80 dark:hover:bg-purple-950/40',
          )}
          title="Design, Colors, Fonts & Spacing"
        >
          <Palette className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <span className="text-[7px] font-semibold tracking-tight leading-none">Design</span>
          <span
            className="w-2 h-2 rounded-full absolute top-1 right-1 border border-white dark:border-zinc-900"
            style={{ backgroundColor: activeAccentColor }}
          />
        </button>

        <button
          type="button"
          id="canva-dock-templates"
          aria-pressed={activePanel === 'templates'}
          onClick={onOpenTemplates}
          className={itemClasses(
            activePanel === 'templates',
            'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 ring-blue-300 dark:ring-blue-700',
            'hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/80 dark:hover:bg-blue-950/40',
          )}
          title="Templates"
        >
          <LayoutTemplate className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="text-[7px] font-semibold tracking-tight leading-none">Templates</span>
        </button>

        <button
          type="button"
          id="canva-dock-sections"
          aria-pressed={activePanel === 'sections'}
          onClick={onOpenRearrange}
          className={itemClasses(
            activePanel === 'sections',
            'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 ring-sky-300 dark:ring-sky-700',
            'hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/80 dark:hover:bg-blue-950/40',
          )}
          title="Rearrange Sections"
        >
          <ArrowUpDown className="w-4 h-4 text-blue-500" />
          <span className="text-[7px] font-semibold tracking-tight leading-none">Sections</span>
        </button>

        {onOpenAddContent && (
          <button
            type="button"
            id="canva-dock-add-content"
            aria-pressed={activePanel === 'content'}
            onClick={onOpenAddContent}
            className={itemClasses(
              activePanel === 'content',
              'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 ring-indigo-300 dark:ring-indigo-700',
              'hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50/80 dark:hover:bg-indigo-950/40',
            )}
            title="Add Content"
          >
            <PlusCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span className="text-[7px] font-semibold tracking-tight leading-none">Content</span>
          </button>
        )}

        <div className="hidden lg:block w-7 h-px bg-zinc-200 dark:bg-zinc-800 my-0.5" />
        <div className="lg:hidden w-px h-5 bg-zinc-200 dark:bg-zinc-800 mx-0.5 shrink-0" />

        <button
          type="button"
          id="canva-dock-ats"
          aria-pressed={activePanel === 'ats'}
          onClick={onOpenAtsAudit}
          className={itemClasses(
            activePanel === 'ats',
            'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 ring-emerald-300 dark:ring-emerald-700',
            'hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50/80 dark:hover:bg-emerald-950/40',
          )}
          title="ATS Audit"
        >
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span className="text-[7px] font-semibold tracking-tight leading-none">ATS Audit</span>
          {atsScore > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[14px] h-3.5 px-0.5 rounded-full text-[8px] font-extrabold bg-emerald-700 text-white flex items-center justify-center">
              {atsScore}
            </span>
          )}
        </button>

        <button
          type="button"
          id="canva-dock-tailor"
          aria-pressed={activePanel === 'tailor'}
          onClick={onOpenTailor}
          className={itemClasses(
            activePanel === 'tailor',
            'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 ring-cyan-300 dark:ring-cyan-700',
            'hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-cyan-50/80 dark:hover:bg-cyan-950/40',
          )}
          title="Job Match"
        >
          <Briefcase className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          <span className="text-[7px] font-semibold tracking-tight leading-none">Job Match</span>
          {matchScore !== null && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[14px] h-3.5 px-0.5 rounded-full text-[8px] font-extrabold bg-cyan-600 text-white flex items-center justify-center">
              {matchScore}%
            </span>
          )}
        </button>

        <button
          type="button"
          id="canva-dock-mistakes"
          aria-pressed={activePanel === 'mistakes'}
          onClick={onOpenFixMistakes}
          className={itemClasses(
            activePanel === 'mistakes',
            'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 ring-amber-300 dark:ring-amber-700',
            'hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50/80 dark:hover:bg-amber-950/40',
          )}
          title="Mistakes"
        >
          <CheckCircle2 className="w-4 h-4 text-amber-500" />
          <span className="text-[7px] font-semibold tracking-tight leading-none">Mistakes</span>
          {mistakesCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[14px] h-3.5 px-0.5 rounded-full text-[8px] font-extrabold bg-rose-500 text-white flex items-center justify-center">
              {mistakesCount}
            </span>
          )}
        </button>

        <button
          type="button"
          id="canva-dock-photo"
          onClick={onOpenPhoto}
          className="w-11 h-11 shrink-0 rounded-xl flex flex-col items-center justify-center gap-0.5 text-zinc-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50/80 dark:hover:bg-emerald-950/40 transition-colors cursor-pointer"
          title="Profile Photo"
        >
          <Camera className="w-4 h-4 text-emerald-500" />
          <span className="text-[7px] font-semibold tracking-tight leading-none">Photo</span>
        </button>

        <button
          type="button"
          id="canva-dock-history"
          onClick={onOpenVersions}
          className="w-11 h-11 shrink-0 rounded-xl flex flex-col items-center justify-center gap-0.5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          title="Version History"
        >
          <History className="w-4 h-4 text-zinc-500" />
          <span className="text-[7px] font-semibold tracking-tight leading-none">History</span>
        </button>

        <div className="hidden lg:block w-7 h-px bg-zinc-200 dark:bg-zinc-800 my-0.5" />
        <div className="lg:hidden w-px h-5 bg-zinc-200 dark:bg-zinc-800 mx-0.5 shrink-0" />

        <button
          type="button"
          id="canva-dock-export"
          onClick={onOpenExport}
          className="w-11 h-11 shrink-0 rounded-xl flex flex-col items-center justify-center gap-0.5 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors cursor-pointer"
          title="Download PDF"
        >
          <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span className="text-[7px] font-semibold tracking-tight leading-none">Download</span>
        </button>

        <button
          type="button"
          id="canva-dock-share"
          onClick={onOpenShare}
          className="w-11 h-11 shrink-0 rounded-xl flex flex-col items-center justify-center gap-0.5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          title="Share"
        >
          <Share2 className="w-4 h-4 text-zinc-500" />
          <span className="text-[7px] font-semibold tracking-tight leading-none">Share</span>
        </button>
      </aside>
    </div>
  );
}
