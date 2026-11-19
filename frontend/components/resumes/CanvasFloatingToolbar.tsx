'use client';

import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Bot,
  Sparkles,
  Wand2,
  Plus,
  Trash2,
  X,
  TrendingUp,
  Zap,
  ChevronDown,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { useCanvasEdit, type BulletSelectionMeta } from './templates/CanvasEditContext';
import { focusAndPlaceCaretAtEnd } from './templates/EditableField';

export interface CanvasFloatingToolbarProps {
  onTriggerAiEnhance: (
    meta: BulletSelectionMeta,
    mode?: 'star' | 'xyz' | 'metric' | 'executive' | 'technical' | 'concise'
  ) => void;
  onAskAgent?: (meta: BulletSelectionMeta) => void;
}

export function CanvasFloatingToolbar({
  onTriggerAiEnhance,
  onAskAgent,
}: CanvasFloatingToolbarProps) {
  const {
    isEditable,
    activeSelection,
    setActiveSelection,
    onAddBulletBelow,
    onDeleteBullet,
    onMoveBullet,
  } = useCanvasEdit();
  const [coords, setCoords] = useState<{ top: number; left: number; openMenuUp?: boolean } | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [liveCharCount, setLiveCharCount] = useState<number>(0);
  const [mounted, setMounted] = useState(false);
  const toolbarRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Global Escape + outside mousedown listener to dismiss active selection and toolbar
  useEffect(() => {
    if (!activeSelection) return;
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
        setActiveSelection(null);
      }
    };
    const handleOutsideMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      if (toolbarRef.current?.contains(target)) return;
      if (target.closest('[data-editable-field="true"]')) return;
      setIsMenuOpen(false);
      setActiveSelection(null);
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    document.addEventListener('mousedown', handleOutsideMouseDown);
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
      document.removeEventListener('mousedown', handleOutsideMouseDown);
    };
  }, [activeSelection, setActiveSelection]);

  useEffect(() => {
    if (!activeSelection || !activeSelection.domRect || !isEditable) {
      setCoords(null);
      setIsMenuOpen(false);
      return;
    }

    const updatePosition = () => {
      const el =
        document.querySelector<HTMLElement>(`[data-field-path="${CSS.escape(activeSelection.fieldPath)}"]`) ||
        document.getElementById(activeSelection.fieldPath);
      const rect = el ? el.getBoundingClientRect() : activeSelection.domRect;

      if (el) {
        setLiveCharCount((el.innerText || '').trim().length);
      }

      if (!rect || (rect.width === 0 && rect.height === 0)) {
        return;
      }

      if (rect.bottom < 50 || rect.top > window.innerHeight - 50) {
        setCoords(null);
        return;
      }

      const toolbarHeight = 44;
      const toolbarWidth = Math.min(390, window.innerWidth - 24);

      let top = rect.top - toolbarHeight - 8;
      if (top < 65) {
        top = rect.bottom + 8;
      }

      const center = rect.left + rect.width / 2;
      let left = center - toolbarWidth / 2;
      left = Math.max(12, Math.min(window.innerWidth - toolbarWidth - 12, left));
      const openMenuUp = top > window.innerHeight - 190;

      setCoords({ top, left, openMenuUp });
    };

    updatePosition();
    const handleInputTrack = () => {
      const el = document.querySelector<HTMLElement>(
        `[data-field-path="${CSS.escape(activeSelection.fieldPath)}"]`
      );
      if (el) setLiveCharCount((el.innerText || '').trim().length);
    };
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    document.addEventListener('input', handleInputTrack, true);

    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
      document.removeEventListener('input', handleInputTrack, true);
    };
  }, [activeSelection, isEditable]);

  if (!mounted || !isEditable || !activeSelection || !coords) {
    return null;
  }

  const getFreshSelection = (): BulletSelectionMeta => {
    const el = document.querySelector<HTMLElement>(
      `[data-field-path="${CSS.escape(activeSelection.fieldPath)}"]`
    );
    const liveText = el ? el.innerText.trim() : activeSelection.currentText;
    return { ...activeSelection, currentText: liveText };
  };

  const getBulletDomId = (idx: number) =>
    activeSelection.section === 'experience'
      ? `exp-${activeSelection.expIdx ?? 0}-bullet-${idx}`
      : activeSelection.section === 'projects'
        ? `proj-${activeSelection.projIdx ?? 0}-bullet-${idx}`
        : `custom-${activeSelection.customSectionId ?? ''}-${activeSelection.customEntryIdx ?? 0}-bullet-${idx}`;

  const handleAddBullet = () => {
    if (onAddBulletBelow && activeSelection) {
      const nextBulletIdx = (activeSelection.bulletIdx ?? 0) + 1;
      const nextId = getBulletDomId(nextBulletIdx);

      onAddBulletBelow(getFreshSelection());

      if (typeof window !== 'undefined') {
        requestAnimationFrame(() => {
          setTimeout(() => {
            const nextEl = document.getElementById(nextId);
            if (nextEl) focusAndPlaceCaretAtEnd(nextEl);
          }, 60);
        });
      }
    }
  };

  const handleMove = (direction: 'up' | 'down') => {
    if (!onMoveBullet || !activeSelection || typeof activeSelection.bulletIdx !== 'number') return;
    const nextIdx = direction === 'up' ? activeSelection.bulletIdx - 1 : activeSelection.bulletIdx + 1;
    if (nextIdx < 0) return;
    onMoveBullet(getFreshSelection(), direction);
    const targetId = getBulletDomId(nextIdx);
    if (typeof window !== 'undefined') {
      requestAnimationFrame(() => {
        setTimeout(() => {
          const targetEl = document.getElementById(targetId);
          if (targetEl) focusAndPlaceCaretAtEnd(targetEl);
        }, 60);
      });
    }
  };

  const handleDeleteBullet = () => {
    if (onDeleteBullet && activeSelection) {
      const currIdx = activeSelection.bulletIdx ?? 0;
      const prevId = currIdx > 0 ? getBulletDomId(currIdx - 1) : null;
      const fallbackId = currIdx === 0 ? getBulletDomId(0) : null;

      onDeleteBullet(getFreshSelection());

      if (typeof window !== 'undefined') {
        requestAnimationFrame(() => {
          setTimeout(() => {
            const targetEl = prevId
              ? document.getElementById(prevId)
              : fallbackId
                ? document.getElementById(fallbackId)
                : null;
            if (targetEl) {
              focusAndPlaceCaretAtEnd(targetEl);
            } else {
              setActiveSelection(null);
            }
          }, 60);
        });
      }
    }
  };

  const isSummary = activeSelection.section === 'summary' || activeSelection.fieldPath === 'summary';
  const preventFocusLoss = (e: React.MouseEvent) => e.preventDefault();

  const toolbarNode = (
    <div
      ref={toolbarRef}
      role="toolbar"
      aria-label={isSummary ? 'Summary editing actions' : 'Bullet editing actions'}
      data-export-exclude="true"
      data-floating-toolbar="true"
      style={{
        position: 'fixed',
        top: `${coords.top}px`,
        left: `${coords.left}px`,
        zIndex: 99999,
      }}
      className="print:hidden animate-in fade-in zoom-in-95 duration-150 select-none shadow-2xl rounded-xl bg-zinc-950/95 backdrop-blur-md text-white border border-zinc-700/80 text-xs flex items-center p-1 gap-1 max-w-[calc(100vw-1.5rem)] overflow-visible pointer-events-auto"
    >
      {isSummary ? (
        /* Summary Specific AI Toolbar */
        <>
          <button
            type="button"
            id="fab-rewrite-summary-btn"
            onMouseDown={preventFocusLoss}
            onClick={() => onTriggerAiEnhance(getFreshSelection(), 'executive')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 min-h-[28px] rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold transition-all shadow-xs cursor-pointer group shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
            title="Rewrite Professional Summary with AI tones"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-200 group-hover:rotate-12 transition-transform" aria-hidden="true" />
            <span>AI Rewrite Summary</span>
          </button>

          {onAskAgent && (
            <button
              type="button"
              id="fab-ask-agent-btn"
              data-testid="canvas-ask-agent-btn"
              onMouseDown={preventFocusLoss}
              onClick={() => {
                setIsMenuOpen(false);
                onAskAgent(getFreshSelection());
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 min-h-[28px] rounded-lg bg-zinc-800 hover:bg-zinc-700 text-blue-300 hover:text-white border border-zinc-700 font-semibold transition-colors cursor-pointer shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
              title="Pin this summary into AI Agent chat"
            >
              <Bot className="w-3.5 h-3.5 text-blue-400" aria-hidden="true" />
              <span>Ask AI Agent</span>
            </button>
          )}

          <div className="relative">
            <button
              type="button"
              onMouseDown={preventFocusLoss}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-300 transition-colors cursor-pointer"
              title="Choose summary tone"
              aria-label="Choose summary tone"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {isMenuOpen && (
              <div
                data-floating-dropdown="true"
                className={`absolute ${coords.openMenuUp ? 'bottom-full mb-1.5' : 'top-full mt-1.5'} left-0 w-44 rounded-lg bg-zinc-900 border border-zinc-700 shadow-2xl p-1 space-y-0.5 z-[100000]`}
              >
                {(
                  [
                    { id: 'executive', label: 'Executive Tone' },
                    { id: 'technical', label: 'Technical Depth' },
                    { id: 'concise', label: 'Concise 2-Line' },
                  ] as const
                ).map((tone) => (
                  <button
                    key={tone.id}
                    type="button"
                    onMouseDown={preventFocusLoss}
                    onClick={() => {
                      setIsMenuOpen(false);
                      onTriggerAiEnhance(getFreshSelection(), tone.id);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md hover:bg-zinc-800 text-left text-[11px] text-zinc-200 cursor-pointer"
                  >
                    <Wand2 className="w-3 h-3 text-blue-400" />
                    <span>{tone.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <span
            className={`px-1.5 py-0.5 rounded text-[10px] font-mono tabular-nums shrink-0 ${liveCharCount > 450 ? 'text-amber-300 bg-amber-950/60' : 'text-zinc-400 bg-zinc-900'
              }`}
            title="Summary character count (ideal: 180–400 chars)"
          >
            {liveCharCount}c
          </span>
        </>
      ) : (
        /* Bullet Specific AI & Formatting Toolbar */
        <>
          <button
            type="button"
            id="fab-enhance-bullet-btn"
            onMouseDown={preventFocusLoss}
            onClick={() => onTriggerAiEnhance(getFreshSelection(), 'star')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 min-h-[28px] rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold transition-all shadow-xs cursor-pointer group shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
            title="Enhance bullet with Gemini AI STAR/XYZ Impact"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-200 group-hover:rotate-12 transition-transform" aria-hidden="true" />
            <span className="hidden sm:inline">Enhance Bullet</span>
            <span className="sm:hidden">Enhance</span>
          </button>

          {onAskAgent && (
            <button
              type="button"
              id="fab-ask-agent-btn"
              data-testid="canvas-ask-agent-btn"
              onMouseDown={preventFocusLoss}
              onClick={() => {
                setIsMenuOpen(false);
                onAskAgent(getFreshSelection());
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 min-h-[28px] rounded-lg bg-zinc-800 hover:bg-zinc-700 text-blue-300 hover:text-white border border-zinc-700 font-semibold transition-colors cursor-pointer shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
              title="Pin this bullet into AI Agent chat"
            >
              <Bot className="w-3.5 h-3.5 text-blue-400" aria-hidden="true" />
              <span className="hidden sm:inline">Ask AI Agent</span>
              <span className="sm:hidden">Ask AI</span>
            </button>
          )}

          {/* Quick Option Dropdown Trigger */}
          <div className="relative">
            <button
              type="button"
              id="fab-ai-options-btn"
              onMouseDown={preventFocusLoss}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-300 transition-colors cursor-pointer"
              title="More AI options"
              aria-label="More AI options"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {isMenuOpen && (
              <div
                data-floating-dropdown="true"
                className={`absolute ${coords.openMenuUp ? 'bottom-full mb-1.5' : 'top-full mt-1.5'} left-0 w-48 rounded-lg bg-zinc-900 border border-zinc-700 shadow-2xl p-1 space-y-0.5 z-[100000]`}
              >
                <button
                  type="button"
                  onMouseDown={preventFocusLoss}
                  onClick={() => {
                    setIsMenuOpen(false);
                    onTriggerAiEnhance(getFreshSelection(), 'star');
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md hover:bg-zinc-800 text-left text-[11px] text-zinc-200 cursor-pointer"
                >
                  <Zap className="w-3 h-3 text-amber-400" />
                  <span>STAR Formula</span>
                </button>
                <button
                  type="button"
                  onMouseDown={preventFocusLoss}
                  onClick={() => {
                    setIsMenuOpen(false);
                    onTriggerAiEnhance(getFreshSelection(), 'xyz');
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md hover:bg-zinc-800 text-left text-[11px] text-zinc-200 cursor-pointer"
                >
                  <TrendingUp className="w-3 h-3 text-emerald-400" />
                  <span>Google XYZ Impact</span>
                </button>
                <button
                  type="button"
                  onMouseDown={preventFocusLoss}
                  onClick={() => {
                    setIsMenuOpen(false);
                    onTriggerAiEnhance(getFreshSelection(), 'metric');
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md hover:bg-zinc-800 text-left text-[11px] text-zinc-200 cursor-pointer"
                >
                  <Wand2 className="w-3 h-3 text-cyan-400" />
                  <span>Add Verified Metric</span>
                </button>
              </div>
            )}
          </div>

          <div className="w-[1px] h-4 bg-zinc-800 mx-0.5" />

          {/* Move Bullet Up / Down */}
          {onMoveBullet && (
            <>
              <button
                type="button"
                id="fab-move-bullet-up-btn"
                onMouseDown={preventFocusLoss}
                onClick={() => handleMove('up')}
                disabled={(activeSelection.bulletIdx ?? 0) === 0}
                className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer shrink-0"
                title="Move bullet up"
                aria-label="Move bullet up"
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                id="fab-move-bullet-down-btn"
                onMouseDown={preventFocusLoss}
                onClick={() => handleMove('down')}
                disabled={(() => {
                  if (typeof document === 'undefined' || !activeSelection.fieldPath) return false;
                  const nextIdx = (activeSelection.bulletIdx ?? 0) + 1;
                  const nextPath = activeSelection.fieldPath.replace(
                    /(bullets|highlights)\[(\d+)\]$/,
                    `$1[${nextIdx}]`,
                  );
                  if (nextPath === activeSelection.fieldPath) return false;
                  return !document.querySelector(`[data-field-path="${CSS.escape(nextPath)}"]`);
                })()}
                className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer shrink-0"
                title="Move bullet down"
                aria-label="Move bullet down"
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
            </>
          )}

          {/* Insert Bullet Below */}
          <button
            type="button"
            id="fab-add-bullet-btn"
            onMouseDown={preventFocusLoss}
            onClick={handleAddBullet}
            className="flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors cursor-pointer shrink-0"
            title="Insert new bullet point below (or press Enter)"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px] hidden sm:inline">Add Below</span>
            <span className="text-[11px] sm:hidden">Add</span>
          </button>

          {/* Delete Bullet */}
          <button
            type="button"
            id="fab-delete-bullet-btn"
            onMouseDown={preventFocusLoss}
            onClick={handleDeleteBullet}
            className="p-1.5 rounded-lg hover:bg-rose-950/60 text-zinc-400 hover:text-rose-400 transition-colors cursor-pointer shrink-0"
            title="Delete this bullet"
            aria-label="Delete this bullet"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </>
      )}

      {/* Dismiss / Close Selection */}
      <button
        type="button"
        onMouseDown={preventFocusLoss}
        onClick={() => setActiveSelection(null)}
        className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer shrink-0"
        title="Dismiss toolbar"
        aria-label="Dismiss toolbar"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );

  return createPortal(toolbarNode, document.body);
}
