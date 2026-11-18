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
  activeAccentColor = '#2563eb',
}: CanvaDockProps) {
  const itemClasses = (isActive: boolean, activeColors: string, hoverColors: string) =>
    `w-12 h-12 shrink-0 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all group cursor-pointer relative ${
      isActive
        ? `${activeColors} shadow-xs ring-1`
        : `text-zinc-600 dark:text-zinc-400 ${hoverColors}`
    }`;

  const ActiveIndicator = ({ colorClass }: { colorClass: string }) => (
    <span
      aria-hidden="true"
      className={`hidden lg:block absolute -left-1 top-2.5 bottom-2.5 w-1 rounded-r-full ${colorClass}`}
    />
  );

  return (
    <div
      data-export-exclude="true"
      className="print:hidden relative w-full lg:w-16 xl:w-[68px] shrink-0 sticky top-0 z-20 lg:static lg:h-full lg:min-h-0 lg:flex lg:flex-col"
    >
      <aside
        className="w-full flex flex-row lg:flex-col items-center overflow-x-auto lg:overflow-y-auto lg:overflow-x-hidden lg:max-h-full py-2 lg:py-2.5 px-2 lg:px-1.5 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800 rounded-xl lg:rounded-2xl shadow-sm gap-1.5 select-none no-scrollbar overscroll-contain"
        aria-label="Canva Tools Dock"
      >
        {/* 0. AI Agent */}
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
            title="AI Resume Agent (Split-Screen)"
          >
            {activePanel === 'agent' && <ActiveIndicator colorClass="bg-blue-400" />}
            <Bot
              className={`w-4 h-4 group-hover:scale-110 transition-transform ${
                activePanel === 'agent' ? 'text-white' : 'text-blue-600 dark:text-blue-400'
              }`}
            />
            <span className="text-[9.5px] font-semibold tracking-tight">AI Agent</span>
            {hasPendingProposal && activePanel !== 'agent' && (
              <span className="w-2 h-2 rounded-full bg-amber-400 absolute top-1 right-1.5 ring-2 ring-white dark:ring-zinc-900" />
            )}
          </button>
        )}

        {/* 1. Design & Colors (Promoted high for instant live styling!) */}
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
          title="Design, Colors, Fonts & Spacing (Live Preview)"
        >
          {activePanel === 'design' && <ActiveIndicator colorClass="bg-purple-500" />}
          <Palette className="w-4 h-4 group-hover:scale-110 transition-transform text-purple-600 dark:text-purple-400" />
          <span className="text-[9.5px] font-semibold tracking-tight">Design</span>
          <span
            className="w-2 h-2 rounded-full absolute top-1 right-1.5 border border-white dark:border-zinc-900 shadow-xs"
            style={{ backgroundColor: activeAccentColor }}
          />
        </button>

        {/* 2. Templates */}
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
          title="Templates (10 ATS Presets — Hover for Live Preview)"
        >
          {activePanel === 'templates' && <ActiveIndicator colorClass="bg-blue-500" />}
          <LayoutTemplate className="w-4 h-4 group-hover:scale-110 transition-transform text-blue-600 dark:text-blue-400" />
          <span className="text-[9.5px] font-semibold tracking-tight">Templates</span>
        </button>

        {/* 3. Sections & Order */}
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
          title="Rearrange or Hide Sections (Live)"
        >
          {activePanel === 'sections' && <ActiveIndicator colorClass="bg-sky-500" />}
          <ArrowUpDown className="w-4 h-4 group-hover:scale-110 transition-transform text-blue-500" />
          <span className="text-[9.5px] font-semibold tracking-tight">Sections</span>
        </button>

        {/* 4. Add Content & Sections */}
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
            title="Add Work Experience, Projects, Education & Skills"
          >
            {activePanel === 'content' && <ActiveIndicator colorClass="bg-indigo-500" />}
            <PlusCircle className="w-4 h-4 group-hover:scale-110 transition-transform text-indigo-600 dark:text-indigo-400" />
            <span className="text-[9.5px] font-semibold tracking-tight">Content</span>
          </button>
        )}

        <div className="hidden lg:block w-8 h-[1px] bg-zinc-200 dark:bg-zinc-800 my-0.5" />
        <div className="lg:hidden w-[1px] h-6 bg-zinc-200 dark:bg-zinc-800 mx-0.5 shrink-0" />

        {/* 5. ATS Audit */}
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
          title="ATS Score & Diagnostics Audit"
        >
          {activePanel === 'ats' && <ActiveIndicator colorClass="bg-emerald-500" />}
          <ShieldCheck className="w-4 h-4 group-hover:scale-110 transition-transform text-emerald-600 dark:text-emerald-400" />
          <span className="text-[9.5px] font-semibold tracking-tight">ATS Audit</span>
          {atsScore > 0 && (
            <span className="absolute -top-0.5 -right-0.5 px-1 py-0.2 rounded-full text-[8.5px] font-extrabold bg-emerald-700 text-white shadow-xs">
              {atsScore}
            </span>
          )}
        </button>

        {/* 6. Job Tailor */}
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
          title="Tailor to Job Description"
        >
          {activePanel === 'tailor' && <ActiveIndicator colorClass="bg-cyan-500" />}
          <Briefcase className="w-4 h-4 group-hover:scale-110 transition-transform text-cyan-600 dark:text-cyan-400" />
          <span className="text-[9.5px] font-semibold tracking-tight">Job Match</span>
          {matchScore !== null && (
            <span className="absolute -top-0.5 -right-0.5 px-1 py-0.2 rounded-full text-[8.5px] font-extrabold bg-cyan-600 text-white shadow-xs">
              {matchScore}%
            </span>
          )}
        </button>

        {/* 7. Fix Mistakes */}
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
          title="Grammar, Action Verbs & Spelling Checker"
        >
          {activePanel === 'mistakes' && <ActiveIndicator colorClass="bg-amber-500" />}
          <CheckCircle2 className="w-4 h-4 group-hover:scale-110 transition-transform text-amber-500" />
          <span className="text-[9.5px] font-semibold tracking-tight">Mistakes</span>
          {mistakesCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 px-1 py-0.2 rounded-full text-[8.5px] font-extrabold bg-rose-500 text-white shadow-xs">
              {mistakesCount}
            </span>
          )}
        </button>

        {/* 8. Photo */}
        <button
          type="button"
          id="canva-dock-photo"
          onClick={onOpenPhoto}
          className="w-12 h-12 shrink-0 rounded-xl flex flex-col items-center justify-center gap-0.5 text-zinc-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50/80 dark:hover:bg-emerald-950/40 transition-colors group cursor-pointer"
          title="Profile Photo"
        >
          <Camera className="w-4 h-4 group-hover:scale-110 transition-transform text-emerald-500" />
          <span className="text-[9.5px] font-semibold tracking-tight">Photo</span>
        </button>

        {/* 9. Version History */}
        <button
          type="button"
          id="canva-dock-history"
          onClick={onOpenVersions}
          className="w-12 h-12 shrink-0 rounded-xl flex flex-col items-center justify-center gap-0.5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors group cursor-pointer"
          title="Version History"
        >
          <History className="w-4 h-4 group-hover:scale-110 transition-transform text-zinc-500" />
          <span className="text-[9.5px] font-semibold tracking-tight">History</span>
        </button>

        <div className="hidden lg:block w-8 h-[1px] bg-zinc-200 dark:bg-zinc-800 my-0.5" />
        <div className="lg:hidden w-[1px] h-6 bg-zinc-200 dark:bg-zinc-800 mx-0.5 shrink-0" />

        {/* 10. Export PDF */}
        <button
          type="button"
          id="canva-dock-export"
          onClick={onOpenExport}
          className="w-12 h-12 shrink-0 rounded-xl flex flex-col items-center justify-center gap-0.5 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors group cursor-pointer"
          title="Download Vector PDF"
        >
          <Download className="w-4 h-4 group-hover:scale-110 transition-transform text-emerald-600 dark:text-emerald-400" />
          <span className="text-[9.5px] font-semibold tracking-tight">Download</span>
        </button>

        {/* 11. Share Recruiter Link */}
        <button
          type="button"
          id="canva-dock-share"
          onClick={onOpenShare}
          className="w-12 h-12 shrink-0 rounded-xl flex flex-col items-center justify-center gap-0.5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors group cursor-pointer"
          title="Share Live Recruiter Link"
        >
          <Share2 className="w-4 h-4 group-hover:scale-110 transition-transform text-zinc-500" />
          <span className="text-[9.5px] font-semibold tracking-tight">Share</span>
        </button>
      </aside>
      {/* Subtle right-edge scroll cue on mobile/tablet */}
      <div
        aria-hidden="true"
        className="lg:hidden pointer-events-none absolute right-0 top-0 bottom-0 w-7 rounded-r-xl bg-gradient-to-l from-white/95 dark:from-zinc-900/95 to-transparent"
      />
    </div>
  );
}
