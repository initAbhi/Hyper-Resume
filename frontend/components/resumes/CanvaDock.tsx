'use client';

import React from 'react';
import {
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

export interface CanvaDockProps {
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
  return (
    <div
      data-export-exclude="true"
      className="print:hidden relative w-full lg:w-16 xl:w-18 shrink-0 lg:sticky lg:top-20 sticky top-14 sm:top-16 z-20"
    >
      <aside
        className="w-full flex flex-row lg:flex-col items-center overflow-x-auto lg:overflow-visible py-2 lg:py-3 px-2 lg:px-0 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800 rounded-xl lg:rounded-2xl shadow-sm gap-1.5 sm:gap-2 select-none no-scrollbar touch-pan-x"
        aria-label="Canva Tools Dock"
      >
      {/* 1. Templates */}
      <button
        type="button"
        id="canva-dock-templates"
        onClick={onOpenTemplates}
        className="w-12 h-12 shrink-0 rounded-xl flex flex-col items-center justify-center gap-0.5 text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/80 dark:hover:bg-blue-950/40 transition-colors group cursor-pointer"
        title="Templates (10 ATS Presets)"
      >
        <LayoutTemplate className="w-4 h-4 group-hover:scale-110 transition-transform text-blue-600 dark:text-blue-400" />
        <span className="text-[9.5px] font-semibold tracking-tight">Templates</span>
      </button>

      {/* 2. Design & Colors */}
      <button
        type="button"
        id="canva-dock-design"
        onClick={onOpenDesign}
        className="w-12 h-12 shrink-0 rounded-xl flex flex-col items-center justify-center gap-0.5 text-zinc-600 dark:text-zinc-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50/80 dark:hover:bg-purple-950/40 transition-colors group cursor-pointer relative"
        title="Design, Fonts & Colors"
      >
        <Palette className="w-4 h-4 group-hover:scale-110 transition-transform text-purple-600 dark:text-purple-400" />
        <span className="text-[9.5px] font-semibold tracking-tight">Design</span>
        <span
          className="w-1.5 h-1.5 rounded-full absolute top-1 right-2 border border-white dark:border-zinc-900"
          style={{ backgroundColor: activeAccentColor }}
        />
      </button>

      {/* 3. Add Content & Sections */}
      {onOpenAddContent && (
        <button
          type="button"
          id="canva-dock-add-content"
          onClick={onOpenAddContent}
          className="w-12 h-12 shrink-0 rounded-xl flex flex-col items-center justify-center gap-0.5 text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50/80 dark:hover:bg-indigo-950/40 transition-colors group cursor-pointer"
          title="Add Work Experience, Projects, Education & Skills"
        >
          <PlusCircle className="w-4 h-4 group-hover:scale-110 transition-transform text-indigo-600 dark:text-indigo-400" />
          <span className="text-[9.5px] font-semibold tracking-tight">Content</span>
        </button>
      )}

      {/* 4. ATS Audit */}
      <button
        type="button"
        id="canva-dock-ats"
        onClick={onOpenAtsAudit}
        className="w-12 h-12 shrink-0 rounded-xl flex flex-col items-center justify-center gap-0.5 text-zinc-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50/80 dark:hover:bg-emerald-950/40 transition-colors group cursor-pointer relative"
        title="ATS Score & Diagnostics Audit"
      >
        <ShieldCheck className="w-4 h-4 group-hover:scale-110 transition-transform text-emerald-600 dark:text-emerald-400" />
        <span className="text-[9.5px] font-semibold tracking-tight">ATS Audit</span>
        {atsScore > 0 && (
          <span className="absolute -top-1 -right-1 px-1 py-0.2 rounded-full text-[9px] font-extrabold bg-emerald-700 text-white shadow-xs">
            {atsScore}
          </span>
        )}
      </button>

      {/* 4. Job Tailor */}
      <button
        type="button"
        id="canva-dock-tailor"
        onClick={onOpenTailor}
        className="w-12 h-12 shrink-0 rounded-xl flex flex-col items-center justify-center gap-0.5 text-zinc-600 dark:text-zinc-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-cyan-50/80 dark:hover:bg-cyan-950/40 transition-colors group cursor-pointer relative"
        title="Tailor to Job Description"
      >
        <Briefcase className="w-4 h-4 group-hover:scale-110 transition-transform text-cyan-600 dark:text-cyan-400" />
        <span className="text-[9.5px] font-semibold tracking-tight">Job Match</span>
        {matchScore !== null && (
          <span className="absolute -top-1 -right-1 px-1 py-0.2 rounded-full text-[9px] font-extrabold bg-cyan-600 text-white shadow-xs">
            {matchScore}%
          </span>
        )}
      </button>

      {/* 5. Fix Mistakes */}
      <button
        type="button"
        id="canva-dock-mistakes"
        onClick={onOpenFixMistakes}
        className="w-12 h-12 shrink-0 rounded-xl flex flex-col items-center justify-center gap-0.5 text-zinc-600 dark:text-zinc-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50/80 dark:hover:bg-amber-950/40 transition-colors group cursor-pointer relative"
        title="Grammar, Action Verbs & Spelling Checker"
      >
        <CheckCircle2 className="w-4 h-4 group-hover:scale-110 transition-transform text-amber-500" />
        <span className="text-[9.5px] font-semibold tracking-tight">Mistakes</span>
        {mistakesCount > 0 && (
          <span className="absolute -top-1 -right-1 px-1 py-0.2 rounded-full text-[9px] font-extrabold bg-rose-500 text-white shadow-xs">
            {mistakesCount}
          </span>
        )}
      </button>

      {/* 6. Sections & Order */}
      <button
        type="button"
        id="canva-dock-sections"
        onClick={onOpenRearrange}
        className="w-12 h-12 shrink-0 rounded-xl flex flex-col items-center justify-center gap-0.5 text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/80 dark:hover:bg-blue-950/40 transition-colors group cursor-pointer"
        title="Rearrange or Hide Sections"
      >
        <ArrowUpDown className="w-4 h-4 group-hover:scale-110 transition-transform text-blue-500" />
        <span className="text-[9.5px] font-semibold tracking-tight">Sections</span>
      </button>

      {/* 7. Photo */}
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

      {/* 8. Version History */}
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

      <div className="hidden lg:block w-8 h-[1px] bg-zinc-200 dark:bg-zinc-800 my-1" />
      <div className="lg:hidden w-[1px] h-6 bg-zinc-200 dark:bg-zinc-800 mx-1 shrink-0" />

      {/* 9. Export PDF */}
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

      {/* 10. Share Recruiter Link */}
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
