'use client';

import React, { useEffect, useRef } from 'react';
import { X, Check, Palette, RotateCcw, SlidersHorizontal } from 'lucide-react';
import type { ResumeLayoutSettings } from '@/lib/api-client';
import {
  DEFAULT_LAYOUT_SETTINGS,
  LAYOUT_DENSITY_PRESETS,
  normalizeLayoutSettings,
} from '@/lib/resume-layout';

export const ACCENT_SWATCHES = [
  { id: 'black', hex: '#000000', label: 'Black (Recommended)' },
  { id: 'charcoal', hex: '#18181b', label: 'Charcoal' },
  { id: 'navy', hex: '#1e3a8a', label: 'Deep Navy' },
  { id: 'blue', hex: '#2563eb', label: 'Royal Blue' },
  { id: 'teal', hex: '#0d9488', label: 'Teal' },
  { id: 'purple', hex: '#7c3aed', label: 'Purple' },
  { id: 'coral', hex: '#e11d48', label: 'Coral' },
  { id: 'forest', hex: '#15803d', label: 'Forest' },
  { id: 'amber', hex: '#b45309', label: 'Amber' },
];

export const FONT_OPTIONS: Array<{
  id: 'sans' | 'serif' | 'mono';
  name: string;
  preview: string;
}> = [
  { id: 'sans', name: 'Inter (Sans-serif)', preview: 'The quick brown fox' },
  { id: 'serif', name: 'Georgia (Serif)', preview: 'The quick brown fox' },
  { id: 'mono', name: 'Roboto Mono (Tech)', preview: 'The quick brown fox' },
];

export interface DesignLivePreview {
  accentColor?: string;
  fontFamily?: 'sans' | 'serif' | 'mono';
  layout?: Partial<ResumeLayoutSettings>;
  label?: string;
}

interface DesignPanelProps {
  isOpen: boolean;
  onClose: () => void;
  docked?: boolean;
  accentColor: string;
  onAccentColorChange: (color: string) => void;
  fontFamily: 'sans' | 'serif' | 'mono';
  onFontFamilyChange: (font: 'sans' | 'serif' | 'mono') => void;
  showPhoto: boolean;
  onShowPhotoChange: (show: boolean) => void;
  photoUrl: string;
  onPhotoUrlChange: (url: string) => void;
  /** When false, photo controls are disabled (template has no photo slot) */
  supportsPhoto?: boolean;
  showHighlights: boolean;
  onShowHighlightsChange: (show: boolean) => void;
  hasHighlightKeywords?: boolean;
  layout?: ResumeLayoutSettings;
  onLayoutChange?: (nextLayout: ResumeLayoutSettings) => void;
  onPreviewChange?: (preview: DesignLivePreview | null) => void;
}

const INTEREST_TARGET_ATTRS = {
  interestfor: 'resume-document-print',
} as Record<string, string>;

export function DesignPanel({
  isOpen,
  onClose,
  docked = false,
  accentColor,
  onAccentColorChange,
  fontFamily,
  onFontFamilyChange,
  showPhoto,
  onShowPhotoChange,
  photoUrl,
  onPhotoUrlChange,
  supportsPhoto = true,
  showHighlights,
  onShowHighlightsChange,
  hasHighlightKeywords = false,
  layout,
  onLayoutChange,
  onPreviewChange,
}: DesignPanelProps) {
  const onPreviewChangeRef = useRef(onPreviewChange);
  onPreviewChangeRef.current = onPreviewChange;

  useEffect(() => {
    if (!isOpen) {
      onPreviewChangeRef.current?.(null);
      return;
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onPreviewChangeRef.current?.(null);
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      onPreviewChangeRef.current?.(null);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const spacing = normalizeLayoutSettings(layout);

  const updateSpacingField = (patch: Partial<ResumeLayoutSettings>) => {
    onPreviewChange?.(null);
    onLayoutChange?.({
      ...(layout || {}),
      ...patch,
    });
  };

  const panelBody = (
    <div
      data-export-exclude="true"
      className={
        docked
          ? 'w-full h-full bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/90 dark:border-zinc-800 shadow-sm flex flex-col overflow-hidden'
          : 'relative w-full max-w-[380px] bg-white dark:bg-zinc-900 h-full shadow-2xl border-l border-zinc-200 dark:border-zinc-800 flex flex-col z-10 animate-in slide-in-from-right duration-200 pointer-events-auto'
      }
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
        <div className="min-w-0">
          <div className="flex items-center gap-2 font-bold text-sm text-zinc-900 dark:text-zinc-100">
            <Palette className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
            <span className="truncate">Design &amp; Typography</span>
          </div>
          <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="truncate">Hover to preview · Click applies instantly</span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            onPreviewChange?.(null);
            onClose();
          }}
          aria-label="Close design panel"
          title="Close (Esc)"
          className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div
        className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 text-xs overscroll-contain"
        onMouseLeave={() => onPreviewChange?.(null)}
      >
        {/* 1. Accent Color Palette */}
        <div className="space-y-2.5 studio-preview-group">
          <div className="flex items-center justify-between gap-2">
            <span className="font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider text-[11px]">
              Accent Color
            </span>
            <label className="inline-flex items-center gap-1.5 cursor-pointer px-2 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/70 hover:border-zinc-400 transition-colors">
              <input
                type="color"
                aria-label="Custom accent color"
                value={/^#[0-9a-f]{6}$/i.test(accentColor) ? accentColor : '#2563eb'}
                onInput={(e) => onAccentColorChange((e.target as HTMLInputElement).value)}
                onChange={(e) => onAccentColorChange(e.target.value)}
                className="w-4 h-4 rounded border-0 cursor-pointer bg-transparent p-0"
              />
              <span className="font-mono text-[10px] text-zinc-600 dark:text-zinc-300 uppercase">
                {accentColor}
              </span>
            </label>
          </div>

          <div
            className="grid grid-cols-4 gap-2 pt-0.5"
            onMouseLeave={() => onPreviewChange?.(null)}
          >
            {ACCENT_SWATCHES.map((swatch) => {
              const isSelected = accentColor.toLowerCase() === swatch.hex.toLowerCase();
              return (
                <button
                  key={swatch.id}
                  type="button"
                  {...INTEREST_TARGET_ATTRS}
                  data-preview-kind="color"
                  data-preview-value={swatch.hex}
                  onMouseEnter={() =>
                    onPreviewChange?.({ accentColor: swatch.hex, label: swatch.label })
                  }
                  onFocus={() =>
                    onPreviewChange?.({ accentColor: swatch.hex, label: swatch.label })
                  }
                  onBlur={() => onPreviewChange?.(null)}
                  onClick={() => {
                    onPreviewChange?.(null);
                    onAccentColorChange(swatch.hex);
                  }}
                  className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-zinc-900 dark:border-white ring-2 ring-zinc-900/10 dark:ring-white/20 bg-zinc-50 dark:bg-zinc-800/80 shadow-xs'
                      : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40'
                  }`}
                >
                  <div
                    className="w-7 h-7 rounded-full shadow-inner flex items-center justify-center text-white"
                    style={{ backgroundColor: swatch.hex }}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                  <span className="text-[10px] text-zinc-600 dark:text-zinc-400 font-medium leading-tight text-center">
                    {swatch.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Font Family Selection */}
        <div
          className="space-y-2 pt-3 border-t border-zinc-100 dark:border-zinc-800 studio-preview-group"
          onMouseLeave={() => onPreviewChange?.(null)}
        >
          <span className="font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider text-[11px] block">
            Font Family
          </span>
          <div className="space-y-1.5">
            {FONT_OPTIONS.map((f) => {
              const isSelected = fontFamily === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  {...INTEREST_TARGET_ATTRS}
                  data-preview-kind="font"
                  data-preview-value={f.id}
                  onMouseEnter={() =>
                    onPreviewChange?.({ fontFamily: f.id, label: f.name })
                  }
                  onFocus={() =>
                    onPreviewChange?.({ fontFamily: f.id, label: f.name })
                  }
                  onBlur={() => onPreviewChange?.(null)}
                  onClick={() => {
                    onPreviewChange?.(null);
                    onFontFamilyChange(f.id);
                  }}
                  className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                    isSelected
                      ? 'border-blue-600 ring-2 ring-blue-600/20 bg-blue-50/40 dark:bg-blue-950/30'
                      : 'border-zinc-200 dark:border-zinc-800 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40'
                  }`}
                >
                  <div>
                    <div className="font-semibold text-zinc-900 dark:text-zinc-100 text-xs">
                      {f.name}
                    </div>
                    <div
                      className={`text-[11px] text-zinc-500 mt-0.5 ${
                        f.id === 'serif'
                          ? 'font-serif'
                          : f.id === 'mono'
                            ? 'font-mono'
                            : 'font-sans'
                      }`}
                    >
                      {f.preview}
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2b. Layout Density & Precision Spacing Controls */}
        <div
          className="space-y-3 pt-3 border-t border-zinc-100 dark:border-zinc-800 studio-preview-group"
          onMouseLeave={() => onPreviewChange?.(null)}
        >
          <div className="flex items-center justify-between">
            <span className="font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" />
              Layout &amp; Spacing
            </span>
            <button
              type="button"
              data-testid="reset-spacing-btn"
              onClick={() =>
                updateSpacingField({
                  fontSizeScale: DEFAULT_LAYOUT_SETTINGS.fontSizeScale,
                  lineHeight: DEFAULT_LAYOUT_SETTINGS.lineHeight,
                  sectionSpacing: DEFAULT_LAYOUT_SETTINGS.sectionSpacing,
                  entrySpacing: DEFAULT_LAYOUT_SETTINGS.entrySpacing,
                  pageMargin: DEFAULT_LAYOUT_SETTINGS.pageMargin,
                })
              }
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          </div>

          {/* Density Presets */}
          <div className="grid grid-cols-3 gap-1.5">
            {Object.entries(LAYOUT_DENSITY_PRESETS).map(([presetKey, p]) => {
              const isActive =
                Math.abs(spacing.fontSizeScale - p.fontSizeScale) < 0.01 &&
                spacing.sectionSpacing === p.sectionSpacing;
              const label =
                presetKey === 'compact'
                  ? 'Compact'
                  : presetKey === 'balanced'
                    ? 'Balanced'
                    : 'Spacious';
              return (
                <button
                  key={presetKey}
                  type="button"
                  {...INTEREST_TARGET_ATTRS}
                  data-testid={`density-preset-${presetKey}`}
                  onMouseEnter={() =>
                    onPreviewChange?.({
                      layout: {
                        fontSizeScale: p.fontSizeScale,
                        lineHeight: p.lineHeight,
                        sectionSpacing: p.sectionSpacing,
                        pageMargin: p.pageMargin,
                      },
                      label: `${label} Spacing`,
                    })
                  }
                  onFocus={() =>
                    onPreviewChange?.({
                      layout: {
                        fontSizeScale: p.fontSizeScale,
                        lineHeight: p.lineHeight,
                        sectionSpacing: p.sectionSpacing,
                        pageMargin: p.pageMargin,
                      },
                      label: `${label} Spacing`,
                    })
                  }
                  onBlur={() => onPreviewChange?.(null)}
                  onClick={() =>
                    updateSpacingField({
                      fontSizeScale: p.fontSizeScale,
                      lineHeight: p.lineHeight,
                      sectionSpacing: p.sectionSpacing,
                      pageMargin: p.pageMargin,
                    })
                  }
                  className={`p-2 rounded-lg border text-center transition-colors cursor-pointer ${
                    isActive
                      ? 'border-blue-600 bg-blue-50/70 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 font-bold'
                      : 'border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-blue-300 dark:hover:border-blue-700 font-medium'
                  }`}
                >
                  <span className="block text-[11px] leading-tight">{label}</span>
                </button>
              );
            })}
          </div>

          {/* Target Page Length */}
          <div className="space-y-1.5 pt-1">
            <span className="font-semibold text-zinc-700 dark:text-zinc-300 text-[11px] block">
              Target Page Length
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              {(
                [
                  { id: 'single', label: '1 Page', desc: 'Fit to 1 A4' },
                  { id: 'auto', label: 'Auto Fit', desc: 'Smart ATS' },
                  { id: 'multi', label: '2 Pages', desc: 'Multi-Page' },
                ] as const
              ).map((mode) => {
                const currentMode = layout?.pageMode || 'auto';
                const isSelected = currentMode === mode.id;
                return (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => updateSpacingField({ pageMode: mode.id })}
                    className={`p-2 rounded-lg border text-center transition-colors cursor-pointer ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/70 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 font-bold'
                        : 'border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 font-medium'
                    }`}
                  >
                    <span className="block text-[11px] leading-tight font-semibold">
                      {mode.label}
                    </span>
                    <span className="block text-[9.5px] text-zinc-500 font-normal mt-0.5">
                      {mode.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Precision Range Sliders */}
          <div className="space-y-3 pt-1">
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <label
                  htmlFor="slider-font-scale"
                  className="font-medium text-zinc-700 dark:text-zinc-300"
                >
                  Font Size Scale
                </label>
                <span
                  data-testid="readout-font-scale"
                  className="font-mono font-semibold text-zinc-900 dark:text-zinc-100"
                >
                  {Math.round(spacing.fontSizeScale * 100)}%
                </span>
              </div>
              <input
                id="slider-font-scale"
                type="range"
                min={0.75}
                max={1.25}
                step={0.01}
                value={spacing.fontSizeScale}
                onChange={(e) =>
                  updateSpacingField({ fontSizeScale: parseFloat(e.target.value) })
                }
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <label
                  htmlFor="slider-line-height"
                  className="font-medium text-zinc-700 dark:text-zinc-300"
                >
                  Line Height
                </label>
                <span
                  data-testid="readout-line-height"
                  className="font-mono font-semibold text-zinc-900 dark:text-zinc-100"
                >
                  {spacing.lineHeight.toFixed(2)}
                </span>
              </div>
              <input
                id="slider-line-height"
                type="range"
                min={1.1}
                max={1.85}
                step={0.05}
                value={spacing.lineHeight}
                onChange={(e) =>
                  updateSpacingField({ lineHeight: parseFloat(e.target.value) })
                }
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <label
                  htmlFor="slider-section-spacing"
                  className="font-medium text-zinc-700 dark:text-zinc-300"
                >
                  Section Spacing
                </label>
                <span
                  data-testid="readout-section-spacing"
                  className="font-mono font-semibold text-zinc-900 dark:text-zinc-100"
                >
                  {spacing.sectionSpacing}px
                </span>
              </div>
              <input
                id="slider-section-spacing"
                type="range"
                min={2}
                max={36}
                step={1}
                value={spacing.sectionSpacing}
                onChange={(e) =>
                  updateSpacingField({ sectionSpacing: parseInt(e.target.value, 10) })
                }
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <label
                  htmlFor="slider-entry-spacing"
                  className="font-medium text-zinc-700 dark:text-zinc-300"
                >
                  Entry Spacing
                </label>
                <span
                  data-testid="readout-entry-spacing"
                  className="font-mono font-semibold text-zinc-900 dark:text-zinc-100"
                >
                  {spacing.entrySpacing}px
                </span>
              </div>
              <input
                id="slider-entry-spacing"
                type="range"
                min={2}
                max={28}
                step={1}
                value={spacing.entrySpacing}
                onChange={(e) =>
                  updateSpacingField({ entrySpacing: parseInt(e.target.value, 10) })
                }
                className="w-full accent-blue-600 cursor-pointer"
              />
              <p className="text-[10px] text-zinc-500 mt-1">
                Gap between roles, projects, and education rows
              </p>
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <label
                  htmlFor="slider-page-margin"
                  className="font-medium text-zinc-700 dark:text-zinc-300"
                >
                  Page Margins
                </label>
                <span
                  data-testid="readout-page-margin"
                  className="font-mono font-semibold text-zinc-900 dark:text-zinc-100"
                >
                  {spacing.pageMargin}px
                </span>
              </div>
              <input
                id="slider-page-margin"
                type="range"
                min={12}
                max={64}
                step={2}
                value={spacing.pageMargin}
                onChange={(e) =>
                  updateSpacingField({ pageMargin: parseInt(e.target.value, 10) })
                }
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* 3. Profile Photo Controls */}
        <div className={`space-y-3 pt-3 border-t border-zinc-100 dark:border-zinc-800 ${!supportsPhoto ? 'opacity-55' : ''}`}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <label
                htmlFor="design-show-photo-switch"
                className={`font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider text-[11px] block ${supportsPhoto ? 'cursor-pointer' : 'cursor-not-allowed'}`}
              >
                Profile Photo Avatar
              </label>
              <span
                id="design-show-photo-desc"
                className="text-[11px] text-zinc-600 dark:text-zinc-400"
              >
                {supportsPhoto
                  ? 'Display circular headshot on this template'
                  : 'This template has no photo slot — switch to Double Column / Sidebar to use a photo'}
              </span>
            </div>
            <label className={`relative inline-flex items-center shrink-0 ${supportsPhoto ? 'cursor-pointer' : 'cursor-not-allowed'}`}>
              <input
                id="design-show-photo-switch"
                type="checkbox"
                role="switch"
                checked={supportsPhoto && showPhoto}
                disabled={!supportsPhoto}
                aria-describedby="design-show-photo-desc"
                onChange={(e) => onShowPhotoChange(e.target.checked)}
                className="sr-only peer"
              />
              <span
                aria-hidden="true"
                className="w-9 h-5 rounded-full bg-zinc-300 dark:bg-zinc-700 peer-checked:bg-blue-600 peer-disabled:opacity-50 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-blue-600 transition-colors relative block after:content-[''] after:w-4 after:h-4 after:rounded-full after:bg-white after:shadow-xs after:absolute after:top-0.5 after:left-0.5 after:transition-transform peer-checked:after:translate-x-4"
              />
            </label>
          </div>

          {supportsPhoto && showPhoto && (
            <div className="space-y-1.5 pt-1 animate-in fade-in">
              <label
                htmlFor="design-photo-url"
                className="text-[11px] font-medium text-zinc-700 dark:text-zinc-300 block"
              >
                Photo URL or Image Link
              </label>
              <input
                id="design-photo-url"
                type="text"
                placeholder="https://example.com/avatar.jpg"
                value={photoUrl}
                onChange={(e) => onPhotoUrlChange(e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>
          )}
        </div>

        {/* 4. ATS Keyword Highlighting Toggle */}
        <div className="space-y-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center justify-between gap-3">
            <div>
              <label
                htmlFor="design-show-highlights-switch"
                className="font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider text-[11px] block cursor-pointer"
              >
                ATS Keyword Highlighting
              </label>
              <span
                id="design-show-highlights-desc"
                className="text-[11px] text-zinc-600 dark:text-zinc-400"
              >
                {hasHighlightKeywords
                  ? 'Highlight matched job keywords on the canvas'
                  : 'Open Job Match and save a job description to enable keyword highlights'}
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                id="design-show-highlights-switch"
                type="checkbox"
                role="switch"
                checked={showHighlights}
                aria-describedby="design-show-highlights-desc"
                onChange={(e) => onShowHighlightsChange(e.target.checked)}
                className="sr-only peer"
              />
              <span
                aria-hidden="true"
                className="w-9 h-5 rounded-full bg-zinc-300 dark:bg-zinc-700 peer-checked:bg-rose-600 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-rose-600 transition-colors relative block after:content-[''] after:w-4 after:h-4 after:rounded-full after:bg-white after:shadow-xs after:absolute after:top-0.5 after:left-0.5 after:transition-transform peer-checked:after:translate-x-4"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Live Status Footer (No misleading "Apply" button needed) */}
      <div className="px-4 py-2.5 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-950/60 shrink-0 flex items-center justify-between text-[11px]">
        <span className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Live sync · Auto-saved
        </span>
        <button
          type="button"
          onClick={() => {
            onPreviewChange?.(null);
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
    <div className="fixed inset-0 z-50 flex justify-end pointer-events-none">
      {/* Mobile-only light backdrop (NO blur) */}
      <div
        className="fixed inset-0 bg-black/20 lg:hidden pointer-events-auto transition-opacity animate-in fade-in"
        onClick={onClose}
        aria-hidden="true"
      />
      {panelBody}
    </div>
  );
}
