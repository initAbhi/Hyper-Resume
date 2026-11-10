'use client';

import React from 'react';
import { X, Check, Palette, RotateCcw, SlidersHorizontal } from 'lucide-react';
import type { ResumeLayoutSettings } from '@/lib/api-client';
import {
  DEFAULT_LAYOUT_SETTINGS,
  LAYOUT_DENSITY_PRESETS,
  normalizeLayoutSettings,
} from '@/lib/resume-layout';

export const ACCENT_SWATCHES = [
  { id: 'blue', hex: '#2563eb', label: 'Royal Blue' },
  { id: 'navy', hex: '#1e3a8a', label: 'Deep Navy' },
  { id: 'teal', hex: '#0d9488', label: 'Teal' },
  { id: 'purple', hex: '#7c3aed', label: 'Purple' },
  { id: 'coral', hex: '#e11d48', label: 'Coral' },
  { id: 'charcoal', hex: '#18181b', label: 'Charcoal' },
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

interface DesignPanelProps {
  isOpen: boolean;
  onClose: () => void;
  accentColor: string;
  onAccentColorChange: (color: string) => void;
  fontFamily: 'sans' | 'serif' | 'mono';
  onFontFamilyChange: (font: 'sans' | 'serif' | 'mono') => void;
  showPhoto: boolean;
  onShowPhotoChange: (show: boolean) => void;
  photoUrl: string;
  onPhotoUrlChange: (url: string) => void;
  showHighlights: boolean;
  onShowHighlightsChange: (show: boolean) => void;
  layout?: ResumeLayoutSettings;
  onLayoutChange?: (nextLayout: ResumeLayoutSettings) => void;
}

export function DesignPanel({
  isOpen,
  onClose,
  accentColor,
  onAccentColorChange,
  fontFamily,
  onFontFamilyChange,
  showPhoto,
  onShowPhotoChange,
  photoUrl,
  onPhotoUrlChange,
  showHighlights,
  onShowHighlightsChange,
  layout,
  onLayoutChange,
}: DesignPanelProps) {
  if (!isOpen) return null;

  const spacing = normalizeLayoutSettings(layout);

  const updateSpacingField = (patch: Partial<ResumeLayoutSettings>) => {
    onLayoutChange?.({
      ...(layout || {}),
      ...patch,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Slide-in Right Panel */}
      <div className="relative w-full max-w-[380px] bg-white dark:bg-zinc-900 h-full shadow-2xl border-l border-zinc-200 dark:border-zinc-800 flex flex-col z-10 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
          <div className="flex items-center gap-2 font-bold text-sm text-zinc-900 dark:text-zinc-100">
            <Palette className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Design & Typography</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 text-xs">
          {/* 1. Accent Color Palette */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider text-[11px]">
                Accent Color
              </span>
              <span className="font-mono text-[10px] text-zinc-500">{accentColor}</span>
            </div>

            <div className="grid grid-cols-4 gap-2.5 pt-1">
              {ACCENT_SWATCHES.map((swatch) => (
                <button
                  key={swatch.id}
                  type="button"
                  onClick={() => onAccentColorChange(swatch.hex)}
                  className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all cursor-pointer ${
                    accentColor.toLowerCase() === swatch.hex.toLowerCase()
                      ? 'border-zinc-900 dark:border-white ring-2 ring-zinc-900/10 dark:ring-white/20 bg-zinc-50 dark:bg-zinc-800/80 shadow-xs scale-102'
                      : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600'
                  }`}
                >
                  <div
                    className="w-7 h-7 rounded-full shadow-inner flex items-center justify-center text-white"
                    style={{ backgroundColor: swatch.hex }}
                  >
                    {accentColor.toLowerCase() === swatch.hex.toLowerCase() && (
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    )}
                  </div>
                  <span className="text-[10px] text-zinc-600 dark:text-zinc-400 font-medium">
                    {swatch.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Font Family Selection */}
          <div className="space-y-2.5 pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <span className="font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider text-[11px] block">
              Font Family
            </span>
            <div className="space-y-2">
              {FONT_OPTIONS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => onFontFamilyChange(f.id)}
                  className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                    fontFamily === f.id
                      ? 'border-blue-600 ring-2 ring-blue-600/20 bg-blue-50/20 dark:bg-blue-950/20'
                      : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
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
                  {fontFamily === f.id && (
                    <Check className="w-4 h-4 text-blue-600 shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* 2b. Layout Density & Precision Spacing Controls */}
          <div className="space-y-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
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
                return (
                  <button
                    key={presetKey}
                    type="button"
                    data-testid={`density-preset-${presetKey}`}
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
                        : 'border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 font-medium'
                    }`}
                  >
                    <span className="block text-[11px] leading-tight">
                      {presetKey === 'compact'
                        ? 'Compact'
                        : presetKey === 'balanced'
                          ? 'Balanced'
                          : 'Spacious'}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Precision Range Sliders */}
            <div className="space-y-3 pt-1">
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <label htmlFor="slider-font-scale" className="font-medium text-zinc-700 dark:text-zinc-300">
                    Font Size Scale
                  </label>
                  <span data-testid="readout-font-scale" className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                    {Math.round(spacing.fontSizeScale * 100)}%
                  </span>
                </div>
                <input
                  id="slider-font-scale"
                  type="range"
                  min={0.85}
                  max={1.15}
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
                  <label htmlFor="slider-line-height" className="font-medium text-zinc-700 dark:text-zinc-300">
                    Line Height
                  </label>
                  <span data-testid="readout-line-height" className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                    {spacing.lineHeight.toFixed(2)}
                  </span>
                </div>
                <input
                  id="slider-line-height"
                  type="range"
                  min={1.2}
                  max={1.75}
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
                  <label htmlFor="slider-section-spacing" className="font-medium text-zinc-700 dark:text-zinc-300">
                    Section Spacing
                  </label>
                  <span data-testid="readout-section-spacing" className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                    {spacing.sectionSpacing}px
                  </span>
                </div>
                <input
                  id="slider-section-spacing"
                  type="range"
                  min={8}
                  max={28}
                  step={2}
                  value={spacing.sectionSpacing}
                  onChange={(e) =>
                    updateSpacingField({ sectionSpacing: parseInt(e.target.value, 10) })
                  }
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <label htmlFor="slider-page-margin" className="font-medium text-zinc-700 dark:text-zinc-300">
                    Page Margins
                  </label>
                  <span data-testid="readout-page-margin" className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                    {spacing.pageMargin}px
                  </span>
                </div>
                <input
                  id="slider-page-margin"
                  type="range"
                  min={16}
                  max={52}
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
          <div className="space-y-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider text-[11px] block">
                  Profile Photo Avatar
                </span>
                <span className="text-[11px] text-zinc-500">
                  Display circular headshot on applicable templates
                </span>
              </div>
              <button
                type="button"
                onClick={() => onShowPhotoChange(!showPhoto)}
                className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                  showPhoto ? 'bg-blue-600' : 'bg-zinc-300 dark:bg-zinc-700'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform ${
                    showPhoto ? 'left-4.5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>

            {showPhoto && (
              <div className="space-y-1.5 pt-1 animate-in fade-in">
                <label className="text-[11px] font-medium text-zinc-700 dark:text-zinc-300">
                  Photo URL or Image Link
                </label>
                <input
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
          <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider text-[11px] block">
                  ATS Keyword Highlighting
                </span>
                <span className="text-[11px] text-zinc-500">
                  Highlight verified skills & keywords with soft contrast
                </span>
              </div>
              <button
                type="button"
                onClick={() => onShowHighlightsChange(!showHighlights)}
                className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                  showHighlights ? 'bg-rose-500' : 'bg-zinc-300 dark:bg-zinc-700'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform ${
                    showHighlights ? 'left-4.5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 text-white dark:text-zinc-900 text-xs font-bold rounded-lg transition-colors"
          >
            Apply Design
          </button>
        </div>
      </div>
    </div>
  );
}

