'use client';

import React, { useState } from 'react';
import { X, Check, Sparkles, Info } from 'lucide-react';
import { AVAILABLE_TEMPLATES, TemplateDefinition } from './templates';

interface TemplatePickerProps {
  isOpen: boolean;
  onClose: () => void;
  currentTemplateKey: string;
  onSelectTemplate: (templateKey: string) => void;
  pageSize?: 'A4' | 'US Letter';
  onPageSizeChange?: (size: 'A4' | 'US Letter') => void;
}

export function TemplatePicker({
  isOpen,
  onClose,
  currentTemplateKey,
  onSelectTemplate,
  pageSize = 'A4',
  onPageSizeChange,
}: TemplatePickerProps) {
  const [selectedSize, setSelectedSize] = useState<'A4' | 'US Letter'>(pageSize);
  const [language, setLanguage] = useState('English (US)');

  if (!isOpen) return null;

  const handleSizeClick = (size: 'A4' | 'US Letter') => {
    setSelectedSize(size);
    if (onPageSizeChange) onPageSizeChange(size);
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Slide-in Left Drawer (Matching Screenshot 3) */}
      <div className="relative w-full max-w-[420px] bg-white dark:bg-zinc-900 h-full shadow-2xl border-r border-zinc-200 dark:border-zinc-800 flex flex-col z-10 animate-in slide-in-from-left duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
            Select a template
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Close template picker"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Templates Grid (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {AVAILABLE_TEMPLATES.map((tpl) => {
              const isSelected =
                currentTemplateKey === tpl.key ||
                (tpl.key === 'double-column' &&
                  (currentTemplateKey === 'clean-modern' || currentTemplateKey === 'default'));

              return (
                <div
                  key={tpl.key}
                  onClick={() => onSelectTemplate(tpl.key)}
                  className="group cursor-pointer space-y-1.5"
                >
                  {/* Miniature Visual Preview Card */}
                  <div
                    className={`relative aspect-[3/4] w-full rounded-lg border-2 overflow-hidden bg-white dark:bg-zinc-950 p-2 shadow-xs transition-all duration-200 ${
                      isSelected
                        ? 'border-emerald-600 ring-2 ring-emerald-600/20 shadow-md'
                        : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500 hover:shadow-sm'
                    }`}
                  >
                    {/* Realistic CSS Mock Preview based on template type */}
                    <div className="w-full h-full pointer-events-none select-none text-[5px] flex flex-col justify-between">
                      {/* Double Column Preview */}
                      {tpl.key === 'double-column' && (
                        <div className="h-full flex flex-col justify-between">
                          <div className="flex items-start justify-between border-b border-zinc-200 pb-1">
                            <div className="space-y-0.5">
                              <div className="w-14 h-1.5 bg-zinc-900 rounded-xs" />
                              <div className="w-18 h-1 bg-blue-600 rounded-xs" />
                              <div className="w-24 h-0.5 bg-zinc-300 rounded-xs" />
                            </div>
                            <div className="w-4 h-4 rounded-full bg-zinc-200 shrink-0" />
                          </div>
                          <div className="grid grid-cols-12 gap-1.5 flex-1 pt-1">
                            <div className="col-span-7 space-y-1">
                              <div className="w-10 h-1 bg-zinc-800 rounded-xs" />
                              <div className="space-y-0.5">
                                <div className="w-full h-0.5 bg-zinc-300 rounded-xs" />
                                <div className="w-4/5 h-0.5 bg-zinc-200 rounded-xs" />
                                <div className="w-5/6 h-0.5 bg-zinc-200 rounded-xs" />
                              </div>
                              <div className="space-y-0.5 pt-0.5">
                                <div className="w-full h-0.5 bg-zinc-300 rounded-xs" />
                                <div className="w-3/4 h-0.5 bg-zinc-200 rounded-xs" />
                                <div className="w-4/5 h-0.5 bg-zinc-200 rounded-xs" />
                              </div>
                              <div className="space-y-0.5 pt-0.5">
                                <div className="w-10 h-0.5 bg-zinc-700 rounded-xs" />
                                <div className="w-full h-0.5 bg-zinc-200 rounded-xs" />
                                <div className="w-3/5 h-0.5 bg-zinc-200 rounded-xs" />
                              </div>
                            </div>
                            <div className="col-span-5 space-y-1 border-l border-zinc-100 pl-1">
                              <div className="w-8 h-1 bg-zinc-800 rounded-xs" />
                              <div className="space-y-0.5">
                                <div className="w-full h-0.5 bg-zinc-200 rounded-xs" />
                                <div className="w-full h-0.5 bg-zinc-200 rounded-xs" />
                                <div className="w-3/4 h-0.5 bg-zinc-200 rounded-xs" />
                              </div>
                              <div className="w-8 h-1 bg-zinc-800 rounded-xs pt-0.5" />
                              <div className="space-y-0.5">
                                <div className="w-full h-0.5 bg-zinc-200 rounded-xs" />
                                <div className="w-4/5 h-0.5 bg-zinc-200 rounded-xs" />
                              </div>
                              <div className="w-7 h-1 bg-zinc-800 rounded-xs pt-0.5" />
                              <div className="w-full h-0.5 bg-zinc-200 rounded-xs" />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Ivy League Preview */}
                      {tpl.key === 'ivy-league' && (
                        <div className="h-full flex flex-col justify-between items-center text-center">
                          <div className="w-full pb-1 border-b border-zinc-300 space-y-0.5">
                            <div className="w-16 h-1.5 bg-zinc-900 mx-auto rounded-xs" />
                            <div className="w-24 h-0.5 bg-zinc-400 mx-auto rounded-xs" />
                          </div>
                          <div className="w-full flex-1 pt-1 space-y-1">
                            <div className="w-12 h-0.5 bg-zinc-800 mx-auto border-b border-zinc-800" />
                            <div className="space-y-0.5">
                              <div className="w-full h-0.5 bg-zinc-200 rounded-xs" />
                              <div className="w-5/6 h-0.5 bg-zinc-200 mx-auto rounded-xs" />
                            </div>
                            <div className="w-14 h-0.5 bg-zinc-800 mx-auto border-b border-zinc-800 pt-0.5" />
                            <div className="space-y-0.5">
                              <div className="w-full h-0.5 bg-zinc-300 rounded-xs" />
                              <div className="w-4/5 h-0.5 bg-zinc-200 mx-auto rounded-xs" />
                              <div className="w-3/4 h-0.5 bg-zinc-200 mx-auto rounded-xs" />
                            </div>
                            <div className="w-12 h-0.5 bg-zinc-800 mx-auto border-b border-zinc-800 pt-0.5" />
                            <div className="space-y-0.5">
                              <div className="w-full h-0.5 bg-zinc-200 rounded-xs" />
                              <div className="w-5/6 h-0.5 bg-zinc-200 mx-auto rounded-xs" />
                            </div>
                            <div className="w-10 h-0.5 bg-zinc-800 mx-auto border-b border-zinc-800 pt-0.5" />
                            <div className="w-3/4 h-0.5 bg-zinc-200 mx-auto rounded-xs" />
                          </div>
                        </div>
                      )}

                      {/* Elegant (Sidebar) Preview */}
                      {tpl.key === 'elegant' && (
                        <div className="h-full flex -m-2">
                          <div className="w-1/3 bg-slate-800 p-1 flex flex-col justify-between items-center space-y-1">
                            <div className="w-full flex flex-col items-center space-y-1">
                              <div className="w-3.5 h-3.5 rounded-full bg-white/30 mt-0.5" />
                              <div className="w-full h-0.5 bg-white/40 rounded-xs" />
                              <div className="w-3/4 h-0.5 bg-white/40 rounded-xs" />
                              <div className="w-full h-0.5 bg-white/25 rounded-xs mt-0.5" />
                              <div className="w-2/3 h-0.5 bg-white/25 rounded-xs" />
                              <div className="w-full h-0.5 bg-white/25 rounded-xs mt-0.5" />
                              <div className="w-4/5 h-0.5 bg-white/25 rounded-xs" />
                            </div>
                            <div className="w-full space-y-0.5 pb-0.5">
                              <div className="w-full h-0.5 bg-white/20 rounded-xs" />
                              <div className="w-2/3 h-0.5 bg-white/20 rounded-xs" />
                            </div>
                          </div>
                          <div className="w-2/3 p-1.5 space-y-1 flex flex-col justify-between">
                            <div>
                              <div className="w-12 h-1.5 bg-zinc-900 rounded-xs" />
                              <div className="w-16 h-1 bg-slate-600 rounded-xs mt-0.5" />
                              <div className="w-10 h-1 bg-slate-800 border-b border-slate-300 pt-1" />
                              <div className="space-y-0.5 mt-0.5">
                                <div className="w-full h-0.5 bg-zinc-300 rounded-xs" />
                                <div className="w-4/5 h-0.5 bg-zinc-200 rounded-xs" />
                                <div className="w-5/6 h-0.5 bg-zinc-200 rounded-xs" />
                              </div>
                              <div className="w-10 h-1 bg-slate-800 border-b border-slate-300 pt-1" />
                              <div className="space-y-0.5 mt-0.5">
                                <div className="w-full h-0.5 bg-zinc-200 rounded-xs" />
                                <div className="w-3/4 h-0.5 bg-zinc-200 rounded-xs" />
                              </div>
                            </div>
                            <div className="space-y-0.5 pt-0.5">
                              <div className="w-8 h-0.5 bg-slate-700 rounded-xs" />
                              <div className="w-full h-0.5 bg-zinc-200 rounded-xs" />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Crest Preview */}
                      {tpl.key === 'crest' && (
                        <div className="h-full flex flex-col justify-between -m-2">
                          <div className="bg-teal-700 p-1.5 space-y-0.5">
                            <div className="w-14 h-1.5 bg-white rounded-xs" />
                            <div className="w-20 h-0.5 bg-white/70 rounded-xs" />
                          </div>
                          <div className="bg-zinc-100 px-1 py-0.5 flex gap-1 border-b border-zinc-200">
                            <div className="w-10 h-0.5 bg-zinc-400 rounded-xs" />
                            <div className="w-10 h-0.5 bg-zinc-400 rounded-xs" />
                          </div>
                          <div className="p-1.5 space-y-1 flex-1 flex flex-col justify-between">
                            <div className="space-y-1">
                              <div className="w-10 h-1 bg-teal-800 rounded-xs" />
                              <div className="w-full h-0.5 bg-zinc-200 rounded-xs" />
                              <div className="w-4/5 h-0.5 bg-zinc-200 rounded-xs" />
                              <div className="w-10 h-1 bg-teal-800 rounded-xs pt-0.5" />
                              <div className="w-full h-0.5 bg-zinc-300 rounded-xs" />
                              <div className="w-5/6 h-0.5 bg-zinc-200 rounded-xs" />
                            </div>
                            <div className="space-y-0.5">
                              <div className="w-8 h-0.5 bg-teal-700 rounded-xs" />
                              <div className="w-full h-0.5 bg-zinc-200 rounded-xs" />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Clean Modern Tech Preview */}
                      {tpl.key === 'clean-modern' && (
                        <div className="h-full flex flex-col justify-between p-0.5">
                          <div className="border-b-2 border-blue-600 pb-1 space-y-0.5">
                            <div className="w-16 h-1.5 bg-blue-600 rounded-xs" />
                            <div className="w-12 h-0.5 bg-zinc-600 rounded-xs" />
                          </div>
                          <div className="space-y-1 pt-1 flex-1 flex flex-col justify-between">
                            <div className="space-y-1">
                              <div className="border-l-2 border-blue-600 pl-1">
                                <div className="w-10 h-1 bg-zinc-900 rounded-xs" />
                              </div>
                              <div className="w-full h-0.5 bg-zinc-200 rounded-xs" />
                              <div className="w-4/5 h-0.5 bg-zinc-200 rounded-xs" />
                              <div className="border-l-2 border-blue-600 pl-1 pt-0.5">
                                <div className="w-10 h-1 bg-zinc-900 rounded-xs" />
                              </div>
                              <div className="w-full h-0.5 bg-zinc-300 rounded-xs" />
                              <div className="w-3/4 h-0.5 bg-zinc-200 rounded-xs" />
                            </div>
                            <div className="space-y-0.5 border-t border-zinc-100 pt-0.5">
                              <div className="w-8 h-0.5 bg-blue-600 rounded-xs" />
                              <div className="w-full h-0.5 bg-zinc-200 rounded-xs" />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Classic ATS Preview */}
                      {tpl.key === 'classic-ats' && (
                        <div className="h-full flex flex-col justify-between p-0.5">
                          <div className="border-b-2 border-zinc-900 pb-1 space-y-0.5 text-center">
                            <div className="w-16 h-1.5 bg-zinc-900 mx-auto rounded-xs" />
                            <div className="w-24 h-0.5 bg-zinc-600 mx-auto rounded-xs" />
                          </div>
                          <div className="space-y-1 pt-1 flex-1 flex flex-col justify-between">
                            <div className="space-y-1">
                              <div className="border-b border-zinc-900 pb-0.5">
                                <div className="w-12 h-1 bg-zinc-900 rounded-xs" />
                              </div>
                              <div className="w-full h-0.5 bg-zinc-200 rounded-xs" />
                              <div className="w-5/6 h-0.5 bg-zinc-200 rounded-xs" />
                              <div className="border-b border-zinc-900 pb-0.5 pt-0.5">
                                <div className="w-12 h-1 bg-zinc-900 rounded-xs" />
                              </div>
                              <div className="w-full h-0.5 bg-zinc-300 rounded-xs" />
                              <div className="w-4/5 h-0.5 bg-zinc-200 rounded-xs" />
                            </div>
                            <div className="space-y-0.5 border-t border-zinc-200 pt-0.5">
                              <div className="w-8 h-0.5 bg-zinc-800 rounded-xs" />
                              <div className="w-full h-0.5 bg-zinc-200 rounded-xs" />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Corner Checkmark Pill (Screenshot 3 style) */}
                    {isSelected && (
                      <div className="absolute bottom-1.5 right-1.5 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-md animate-in zoom-in-75">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </div>

                  {/* Label & Optional Badge */}
                  <div className="flex items-center justify-center gap-1.5 text-center pt-0.5">
                    <span
                      className={`text-xs font-semibold ${
                        isSelected
                          ? 'text-emerald-700 dark:text-emerald-400'
                          : 'text-zinc-800 dark:text-zinc-200'
                      }`}
                    >
                      {tpl.name}
                    </span>
                    {tpl.badge && (
                      <span className="px-1.5 py-0.2 bg-emerald-600 text-white text-[9px] font-bold rounded uppercase tracking-wider">
                        {tpl.badge}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Fixed Controls Bar (Screenshot 3 style) */}
        <div className="p-5 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 space-y-4 shrink-0">
          {/* Continue Editing Button */}
          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all duration-150 flex items-center justify-center gap-2"
          >
            Continue Editing
          </button>

          {/* Document Size Selector */}
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-zinc-600 dark:text-zinc-400">
              Document size:
            </span>
            <div className="inline-flex rounded-lg border border-zinc-300 dark:border-zinc-700 p-0.5 bg-white dark:bg-zinc-900">
              <button
                type="button"
                onClick={() => handleSizeClick('A4')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  selectedSize === 'A4'
                    ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-bold'
                    : 'text-zinc-500 hover:text-zinc-900'
                }`}
              >
                A4
              </button>
              <button
                type="button"
                onClick={() => handleSizeClick('US Letter')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  selectedSize === 'US Letter'
                    ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-bold'
                    : 'text-zinc-500 hover:text-zinc-900'
                }`}
              >
                US Letter
              </button>
            </div>
          </div>

          {/* Resume Language Dropdown */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1 text-zinc-600 dark:text-zinc-400 font-medium">
              <Info className="w-3.5 h-3.5 text-zinc-400" />
              <span>Resume language:</span>
            </div>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="text-xs py-1 px-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 font-medium focus:ring-1 focus:ring-emerald-600"
            >
              <option value="English (US)">English (US)</option>
              <option value="English (UK)">English (UK)</option>
              <option value="German">German (Deutsch)</option>
              <option value="French">French (Français)</option>
              <option value="Spanish">Spanish (Español)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

