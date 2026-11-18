'use client';

import React, { useState, useEffect } from 'react';
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Eye,
  EyeOff,
  GripVertical,
  RotateCcw,
  Sparkles,
  X,
} from 'lucide-react';
import type {
  BuiltInSectionKey,
  ResumeContent,
  ResumeLayoutSettings,
  ResumeSectionKey,
} from '@/lib/api-client';
import {
  CUSTOM_SECTION_PREFIX,
  DEFAULT_SECTION_ORDER,
  getSectionCountSummary,
  isCustomSectionKey,
  moveSectionKey,
  normalizeLayoutSettings,
  reorderSectionKeys,
  SECTION_ORDER_PRESETS,
} from '@/lib/resume-layout';

interface SectionRearrangeDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  docked?: boolean;
  content: ResumeContent;
  onUpdateLayout: (nextLayout: ResumeLayoutSettings) => void;
  onPreviewLayout?: (
    preview: { layout: Partial<ResumeLayoutSettings>; label: string } | null,
  ) => void;
}

const SECTION_META: Record<
  BuiltInSectionKey,
  { label: string; description: string }
> = {
  summary: {
    label: 'Professional Summary',
    description: 'Executive intro & value statement',
  },
  experience: {
    label: 'Work Experience',
    description: 'Chronological roles & STAR/XYZ bullets',
  },
  projects: {
    label: 'Key Projects',
    description: 'Architecture highlights & open-source builds',
  },
  skills: {
    label: 'Technical Skills',
    description: 'Verified stack, frameworks & cloud tools',
  },
  education: {
    label: 'Education',
    description: 'Degrees, institutions & graduation dates',
  },
  certifications: {
    label: 'Certifications',
    description: 'Credentials, cloud certs & licenses',
  },
};

const INTEREST_TARGET_ATTRS = {
  interestfor: 'resume-document-print',
} as Record<string, string>;

export function SectionRearrangeDrawer({
  isOpen,
  onClose,
  docked = false,
  content,
  onUpdateLayout,
  onPreviewLayout,
}: SectionRearrangeDrawerProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!isOpen) {
      onPreviewLayout?.(null);
      return;
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onPreviewLayout?.(null);
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      onPreviewLayout?.(null);
    };
  }, [isOpen, onClose, onPreviewLayout]);

  if (!isOpen) return null;

  const normalized = normalizeLayoutSettings(
    content.layout,
    content.customSections,
  );
  const hiddenSet = new Set(normalized.hiddenSections);

  const commitOrder = (nextOrder: ResumeSectionKey[]) => {
    onPreviewLayout?.(null);
    onUpdateLayout({
      ...(content.layout || {}),
      sectionOrder: nextOrder,
    });
  };

  const buildPresetOrder = (presetOrder: ResumeSectionKey[]) => {
    const customKeys = normalized.sectionOrder.filter((k) =>
      isCustomSectionKey(k),
    );
    return [
      ...presetOrder.filter((k) => !isCustomSectionKey(k)),
      ...customKeys,
    ];
  };

  const applyPresetOrder = (presetOrder: ResumeSectionKey[]) => {
    commitOrder(buildPresetOrder(presetOrder));
  };

  const toggleVisibility = (key: ResumeSectionKey) => {
    onPreviewLayout?.(null);
    const nextHidden = new Set(hiddenSet);
    if (nextHidden.has(key)) {
      nextHidden.delete(key);
    } else {
      nextHidden.add(key);
    }
    onUpdateLayout({
      ...(content.layout || {}),
      hiddenSections: Array.from(nextHidden),
    });
  };

  const handleReset = () => {
    onPreviewLayout?.(null);
    const customKeys = (content.customSections || [])
      .filter((s) => Boolean(s?.id))
      .map((s) => `${CUSTOM_SECTION_PREFIX}${s.id}` as ResumeSectionKey);
    onUpdateLayout({
      ...(content.layout || {}),
      sectionOrder: [...DEFAULT_SECTION_ORDER, ...customKeys],
      hiddenSections: [],
    });
  };

  const resolveSectionMeta = (
    key: ResumeSectionKey,
  ): { label: string; description: string; isCustom: boolean } => {
    if (isCustomSectionKey(key)) {
      const id = key.slice(CUSTOM_SECTION_PREFIX.length);
      const sec = content.customSections?.find((c) => c.id === id);
      const kindLabel = sec?.kind
        ? sec.kind.charAt(0).toUpperCase() + sec.kind.slice(1)
        : 'Custom';
      return {
        label: sec?.title?.trim() || 'Custom Section',
        description: `${kindLabel} section entries & highlights`,
        isCustom: true,
      };
    }
    return {
      ...SECTION_META[key],
      isCustom: false,
    };
  };

  const panelBody = (
    <div
      data-export-exclude="true"
      className={
        docked
          ? 'w-full h-full bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/90 dark:border-zinc-800 shadow-sm flex flex-col overflow-hidden'
          : 'relative w-full max-w-[400px] bg-white dark:bg-zinc-900 h-full shadow-2xl border-l border-zinc-200 dark:border-zinc-800 flex flex-col z-10 animate-in slide-in-from-right duration-200 pointer-events-auto'
      }
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
        <div className="min-w-0">
          <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 min-w-0">
            <ArrowUpDown className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <span className="truncate">Rearrange Sections</span>
          </div>
          <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="truncate">Drag, reorder, or hide — updates live on canvas</span>
          </div>
        </div>
        <button
          type="button"
          aria-label="Close Rearrange Drawer"
          title="Close (Esc)"
          onClick={() => {
            onPreviewLayout?.(null);
            onClose();
          }}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shrink-0 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div
        className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 sm:space-y-5 text-xs overscroll-contain"
        onMouseLeave={() => onPreviewLayout?.(null)}
      >
        {/* Quick Order Presets */}
        <div className="space-y-2 studio-preview-group">
          <div className="flex items-center justify-between">
            <span className="font-bold uppercase tracking-wider text-[11px] text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              Quick Section Presets
            </span>
            <button
              type="button"
              data-testid="reset-section-order-btn"
              onClick={handleReset}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          </div>
          <div
            className="grid grid-cols-1 gap-1.5"
            onMouseLeave={() => onPreviewLayout?.(null)}
          >
            {Object.entries(SECTION_ORDER_PRESETS).map(([presetKey, preset]) => {
              const builtInCurrent = normalized.sectionOrder.filter(
                (k) => !isCustomSectionKey(k),
              );
              const isActive =
                JSON.stringify(builtInCurrent) ===
                  JSON.stringify(preset.order) && hiddenSet.size === 0;
              return (
                <button
                  key={presetKey}
                  type="button"
                  {...INTEREST_TARGET_ATTRS}
                  data-testid={`preset-order-${presetKey}`}
                  onMouseEnter={() =>
                    onPreviewLayout?.({
                      layout: {
                        sectionOrder: buildPresetOrder([...preset.order]),
                        hiddenSections: [],
                      },
                      label: preset.label,
                    })
                  }
                  onFocus={() =>
                    onPreviewLayout?.({
                      layout: {
                        sectionOrder: buildPresetOrder([...preset.order]),
                        hiddenSections: [],
                      },
                      label: preset.label,
                    })
                  }
                  onBlur={() => onPreviewLayout?.(null)}
                  onClick={() => applyPresetOrder([...preset.order])}
                  className={`px-3 py-2 rounded-lg border text-left font-medium transition-colors cursor-pointer ${
                    isActive
                      ? 'border-blue-600 bg-blue-50/70 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'
                      : 'border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-blue-300 dark:hover:border-blue-700'
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Drag-and-Drop Section List */}
        <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <span className="font-bold uppercase tracking-wider text-[11px] text-zinc-700 dark:text-zinc-300">
              Drag or Step Reorder
            </span>
            <span className="text-[10px] text-zinc-500">
              Persists to canvas, PDF &amp; DOCX
            </span>
          </div>

          <div className="space-y-2">
            {normalized.sectionOrder.map((key, idx) => {
              const meta = resolveSectionMeta(key);
              const isHidden = hiddenSet.has(key);
              const countText = getSectionCountSummary(content, key);
              const isDragging = draggedIndex === idx;
              const isDragOver = dragOverIndex === idx && draggedIndex !== idx;

              return (
                <div
                  key={key}
                  draggable
                  data-testid={`rearrange-row-${key}`}
                  onDragStart={(e) => {
                    setDraggedIndex(idx);
                    e.dataTransfer.effectAllowed = 'move';
                    e.dataTransfer.setData('text/plain', key);
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                    if (dragOverIndex !== idx) setDragOverIndex(idx);
                  }}
                  onDragLeave={() => {
                    if (dragOverIndex === idx) setDragOverIndex(null);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (draggedIndex !== null && draggedIndex !== idx) {
                      commitOrder(
                        reorderSectionKeys(
                          normalized.sectionOrder,
                          draggedIndex,
                          idx,
                          content.customSections,
                        ),
                      );
                    }
                    setDraggedIndex(null);
                    setDragOverIndex(null);
                  }}
                  onDragEnd={() => {
                    setDraggedIndex(null);
                    setDragOverIndex(null);
                  }}
                  className={`group flex items-center gap-2.5 p-2.5 rounded-xl border transition-all select-none ${
                    isDragging
                      ? 'opacity-50 border-blue-400 bg-blue-50/40'
                      : isDragOver
                        ? 'border-blue-600 ring-2 ring-blue-500/20 bg-blue-50/30 dark:bg-blue-950/30'
                        : isHidden
                          ? 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900 opacity-60'
                          : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800/50 hover:border-zinc-300 dark:hover:border-zinc-700'
                  }`}
                >
                  <div
                    className="text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 cursor-grab active:cursor-grabbing shrink-0"
                    title="Drag to reorder"
                  >
                    <GripVertical className="w-4 h-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                        {meta.label}
                      </span>
                      {meta.isCustom && (
                        <span className="text-[9px] font-bold uppercase px-1 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shrink-0">
                          Custom
                        </span>
                      )}
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 shrink-0">
                        {countText}
                      </span>
                    </div>
                    <p className="text-[10.5px] text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                      {meta.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      data-testid={`move-up-${key}`}
                      aria-label={`Move ${meta.label} up`}
                      disabled={idx === 0}
                      onClick={() =>
                        commitOrder(
                          moveSectionKey(
                            normalized.sectionOrder,
                            key,
                            'up',
                            content.customSections,
                          ),
                        )
                      }
                      className="p-1 rounded-md text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 dark:hover:text-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 cursor-pointer"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      data-testid={`move-down-${key}`}
                      aria-label={`Move ${meta.label} down`}
                      disabled={idx === normalized.sectionOrder.length - 1}
                      onClick={() =>
                        commitOrder(
                          moveSectionKey(
                            normalized.sectionOrder,
                            key,
                            'down',
                            content.customSections,
                          ),
                        )
                      }
                      className="p-1 rounded-md text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 dark:hover:text-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 cursor-pointer"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      data-testid={`toggle-visibility-${key}`}
                      aria-label={
                        isHidden
                          ? `Show ${meta.label} on resume`
                          : `Hide ${meta.label} from resume`
                      }
                      onClick={() => toggleVisibility(key)}
                      className={`p-1 rounded-md transition-colors cursor-pointer ${
                        isHidden
                          ? 'text-amber-600 bg-amber-50 dark:bg-amber-950/40'
                          : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                      }`}
                    >
                      {isHidden ? (
                        <EyeOff className="w-3.5 h-3.5" />
                      ) : (
                        <Eye className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Live Status Footer */}
      <div className="px-4 py-2.5 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-950/60 shrink-0 flex items-center justify-between text-[11px]">
        <span className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Live sync · Auto-saved
        </span>
        <button
          type="button"
          onClick={() => {
            onPreviewLayout?.(null);
            onClose();
          }}
          className="px-2.5 py-1 rounded-md font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/70 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
        >
          Collapse
        </button>
      </div>
    </div>
  );

  if (docked) {
    return panelBody;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end pointer-events-none"
      role="dialog"
      aria-label="Rearrange Resume Sections"
    >
      {/* Mobile-only light backdrop (NO blur) */}
      <div
        className="fixed inset-0 bg-black/20 lg:hidden pointer-events-auto transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      {panelBody}
    </div>
  );
}
