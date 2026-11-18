'use client';

import React from 'react';
import {
  Undo2,
  Redo2,
  Minus,
  Plus,
  Maximize2,
  FileCheck,
} from 'lucide-react';

export type ZoomMode = 'fit' | '50' | '75' | '100' | '125' | '150';

const ZOOM_STEPS: Exclude<ZoomMode, 'fit'>[] = ['50', '75', '100', '125', '150'];

export interface CanvaBottomBarProps {
  zoomMode: ZoomMode;
  effectiveScale: number;
  onSetZoomMode: (mode: ZoomMode) => void;
  pageCount?: number;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  onFitPage?: () => void;
  onOpenAddContent?: () => void;
  shiftRight?: boolean;
}

export function CanvaBottomBar({
  zoomMode,
  effectiveScale,
  onSetZoomMode,
  pageCount = 1,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
  onFitPage,
  onOpenAddContent,
  shiftRight = false,
}: CanvaBottomBarProps) {
  const currentPercent = Math.round(effectiveScale * 100);

  const handleZoomOut = () => {
    if (zoomMode === 'fit') {
      const nextLower = [...ZOOM_STEPS].reverse().find((s) => Number(s) < currentPercent);
      onSetZoomMode(nextLower || '50');
      return;
    }
    const idx = ZOOM_STEPS.indexOf(zoomMode);
    if (idx > 0) onSetZoomMode(ZOOM_STEPS[idx - 1]);
  };

  const handleZoomIn = () => {
    if (zoomMode === 'fit') {
      const nextHigher = ZOOM_STEPS.find((s) => Number(s) > currentPercent);
      onSetZoomMode(nextHigher || '150');
      return;
    }
    const idx = ZOOM_STEPS.indexOf(zoomMode);
    if (idx >= 0 && idx < ZOOM_STEPS.length - 1) onSetZoomMode(ZOOM_STEPS[idx + 1]);
  };

  return (
    <div
      data-export-exclude="true"
      data-testid="canva-bottom-bar"
      className={`print:hidden fixed bottom-[max(0.75rem,env(safe-area-inset-bottom,12px))] ${shiftRight ? 'left-1/2 lg:left-[calc(50vw+220px)]' : 'left-1/2'
        } -translate-x-1/2 z-30 flex items-center gap-1.5 sm:gap-3 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-2xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800 shadow-xl text-xs text-zinc-700 dark:text-zinc-200 select-none animate-in fade-in slide-in-from-bottom-2 duration-200 max-w-[calc(100vw-1rem)] overflow-x-auto no-scrollbar transition-[left] duration-300`}
    >
      {/* Undo / Redo controls */}
      <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
        <button
          type="button"
          onClick={onUndo}
          disabled={!canUndo}
          className="p-1.5 min-w-[32px] min-h-[32px] sm:min-w-[36px] sm:min-h-[36px] flex items-center justify-center rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-600 dark:text-zinc-300 transition-colors cursor-pointer"
          title="Undo (Ctrl+Z)"
          aria-label="Undo"
        >
          <Undo2 className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={onRedo}
          disabled={!canRedo}
          className="p-1.5 min-w-[32px] min-h-[32px] sm:min-w-[36px] sm:min-h-[36px] flex items-center justify-center rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-600 dark:text-zinc-300 transition-colors cursor-pointer"
          title="Redo (Ctrl+Y)"
          aria-label="Redo"
        >
          <Redo2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="w-[1px] h-4 bg-zinc-200 dark:bg-zinc-800 shrink-0" />

      {/* Zoom Controls */}
      <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
        <button
          type="button"
          onClick={handleZoomOut}
          disabled={zoomMode === '50'}
          className="p-1 min-w-[28px] min-h-[28px] sm:min-w-[32px] sm:min-h-[32px] flex items-center justify-center rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40 text-zinc-600 dark:text-zinc-300 font-bold cursor-pointer"
          title="Zoom Out"
          aria-label="Zoom Out"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>

        <span className="font-mono text-[10.5px] sm:text-[11px] font-semibold w-10 sm:w-12 text-center tabular-nums">
          {currentPercent}%
        </span>

        <button
          type="button"
          onClick={handleZoomIn}
          disabled={zoomMode === '150'}
          className="p-1 min-w-[28px] min-h-[28px] sm:min-w-[32px] sm:min-h-[32px] flex items-center justify-center rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40 text-zinc-600 dark:text-zinc-300 font-bold cursor-pointer"
          title="Zoom In"
          aria-label="Zoom In"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={onFitPage}
          className={`px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-[10.5px] font-medium transition-colors flex items-center gap-1 cursor-pointer min-h-[28px] shrink-0 ${zoomMode === 'fit'
              ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
              : 'bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300'
            }`}
          title="Fit to Page"
          aria-label="Fit to Page"
        >
          <Maximize2 className="w-3 h-3" />
          <span className="hidden sm:inline">Fit</span>
        </button>
      </div>

      <div className="w-[1px] h-4 bg-zinc-200 dark:bg-zinc-800 shrink-0" />

      {/* Page Count Indicator */}
      <div className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-500 dark:text-zinc-400 whitespace-nowrap shrink-0">
        <FileCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
        <span>
          {pageCount} {pageCount === 1 ? 'Page' : 'Pages'}
        </span>
      </div>

      {onOpenAddContent && (
        <>
          <div className="w-[1px] h-4 bg-zinc-200 dark:bg-zinc-800 shrink-0" />
          <button
            type="button"
            id="canva-bottom-add-btn"
            onClick={onOpenAddContent}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-[11px] shadow-2xs transition-all cursor-pointer shrink-0 whitespace-nowrap"
            title="Insert Work Experience, Projects, Education, Skills or Certifications"
            aria-label="Add Content"
          >
            <Plus className="w-3 h-3" />
            <span>Add</span>
          </button>
        </>
      )}
    </div>
  );
}
