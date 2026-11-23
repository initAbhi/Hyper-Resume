'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { X, Check, Info, RotateCcw, Search, Sparkles, Lock, Crown } from 'lucide-react';
import { AVAILABLE_TEMPLATES, ResumeTemplateRenderer, isTemplatePremium } from './templates';
import { TemplatePaywallModal } from './TemplatePaywallModal';
import type { ResumeContent } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';

interface TemplatePickerProps {
  isOpen: boolean;
  onClose: () => void;
  docked?: boolean;
  currentTemplateKey: string;
  onSelectTemplate: (templateKey: string) => void;
  onPreviewTemplate?: (preview: { templateKey: string; label: string } | null) => void;
  pageSize?: 'A4' | 'US Letter';
  onPageSizeChange?: (size: 'A4' | 'US Letter') => void;
  content?: ResumeContent | null;
  accentColor?: string;
  fontFamily?: 'sans' | 'serif' | 'mono';
  showPhoto?: boolean;
  photoUrl?: string;
}

const DEFAULT_SAMPLE_CONTENT: ResumeContent = {
  contact: {
    fullName: 'Sushilkumar Suresh Sharma',
    email: 'sushil.sharma@example.com',
    phone: '+1 (555) 019-2834',
    location: 'San Francisco, CA',
    linkedinUrl: 'https://linkedin.com/in/sushil',
    githubUrl: 'https://github.com/sushil',
  },
  headline: 'Senior Deep Learning Scientist & Machine Learning Engineer',
  summary:
    'Senior Deep Learning Scientist & Systems Engineer with 7+ years of experience specializing in high-performance computing, distributed ML architectures, and production deployment.',
  experience: [
    {
      company: 'Tensors Inc',
      title: 'Senior Deep Learning Scientist',
      location: 'San Francisco, CA',
      startDate: '2022',
      endDate: 'Present',
      current: true,
      bullets: [
        'Architected distributed training pipelines scaling throughput by 4.2x across GPU clusters',
        'Optimized CUDA kernels and inference latency for multi-billion parameter foundation models',
      ],
    },
    {
      company: 'Neural Dynamics',
      title: 'Machine Learning Engineer',
      location: 'New York, NY',
      startDate: '2019',
      endDate: '2022',
      current: false,
      bullets: [
        'Engineered real-time recommendation engines serving 20M+ queries daily with sub-15ms p99',
      ],
    },
  ],
  education: [
    {
      school: 'University of Illinois Urbana-Champaign',
      degree: 'Master of Science (M.S.)',
      field: 'Computer Science (High-Performance Computing)',
      graduationDate: '2019',
    },
    {
      school: 'Institute of Engineering & Tech',
      degree: 'Bachelor of Engineering (B.E.)',
      field: 'Information Technology',
      graduationDate: '2017',
    },
  ],
  skills: [
    { name: 'Python / PyTorch', category: 'Machine Learning' },
    { name: 'CUDA / C++', category: 'Systems' },
    { name: 'Distributed Systems', category: 'Architecture' },
    { name: 'Docker / Kubernetes', category: 'DevOps' },
    { name: 'PostgreSQL', category: 'Databases' },
  ],
  projects: [
    {
      name: 'DeepSpeed Acceleration Suite',
      description: 'Distributed memory optimization for fine-tuning trillion-token models.',
      highlights: [
        'Reduced GPU peak memory by 40% with zero-redundancy optimizer partitioning',
      ],
    },
  ],
  customSections: [],
  certifications: [],
};

function getSafePreviewContent(content?: ResumeContent | null): ResumeContent {
  if (!content) return DEFAULT_SAMPLE_CONTENT;

  const contact = content.contact || DEFAULT_SAMPLE_CONTENT.contact;

  return {
    ...content,
    contact: {
      fullName: contact.fullName || DEFAULT_SAMPLE_CONTENT.contact.fullName,
      email: contact.email || DEFAULT_SAMPLE_CONTENT.contact.email,
      phone: contact.phone || DEFAULT_SAMPLE_CONTENT.contact.phone,
      location: contact.location || DEFAULT_SAMPLE_CONTENT.contact.location,
      linkedinUrl: contact.linkedinUrl || DEFAULT_SAMPLE_CONTENT.contact.linkedinUrl,
      githubUrl: contact.githubUrl || DEFAULT_SAMPLE_CONTENT.contact.githubUrl,
      websiteUrl: contact.websiteUrl,
      photoUrl: contact.photoUrl,
    },
    headline: content.headline || DEFAULT_SAMPLE_CONTENT.headline,
    summary: content.summary || DEFAULT_SAMPLE_CONTENT.summary,
    experience:
      content.experience && content.experience.length > 0
        ? content.experience.slice(0, 2).map((exp) => ({
          ...exp,
          bullets: (exp.bullets || []).slice(0, 3),
        }))
        : DEFAULT_SAMPLE_CONTENT.experience,
    education:
      content.education && content.education.length > 0
        ? content.education.slice(0, 2)
        : DEFAULT_SAMPLE_CONTENT.education,
    skills:
      content.skills && content.skills.length > 0
        ? content.skills.slice(0, 15)
        : DEFAULT_SAMPLE_CONTENT.skills,
    projects:
      content.projects && content.projects.length > 0
        ? content.projects.slice(0, 2)
        : DEFAULT_SAMPLE_CONTENT.projects,
    customSections: content.customSections || [],
    certifications: content.certifications || [],
  };
}

function TemplateThumbnail({
  templateKey,
  content,
  accentColor,
  fontFamily,
  showPhoto,
  photoUrl,
}: {
  templateKey: string;
  content: ResumeContent;
  accentColor?: string;
  fontFamily?: 'sans' | 'serif' | 'mono';
  showPhoto?: boolean;
  photoUrl?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.22);

  useEffect(() => {
    if (!containerRef.current) return;
    const updateScale = () => {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth;
        if (width > 0) {
          setScale(width / 794);
        }
      }
    };
    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-[794/1123] bg-white overflow-hidden select-none pointer-events-none"
    >
      <div
        style={{
          width: 794,
          height: 1123,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
        className="template-thumbnail-render origin-top-left pointer-events-none select-none bg-white text-zinc-950"
      >
        <ResumeTemplateRenderer
          templateKey={templateKey}
          content={content}
          accentColor={accentColor}
          fontFamily={fontFamily}
          showPhoto={showPhoto}
          photoUrl={photoUrl}
          showHighlights={false}
        />
      </div>
    </div>
  );
}

export function TemplatePicker({
  isOpen,
  onClose,
  docked = false,
  currentTemplateKey,
  onSelectTemplate,
  onPreviewTemplate,
  pageSize = 'A4',
  onPageSizeChange,
  content,
  accentColor,
  fontFamily,
  showPhoto,
  photoUrl,
}: TemplatePickerProps) {
  const { hasActivePro } = useAuth();
  const [selectedSize, setSelectedSize] = useState<'A4' | 'US Letter'>(pageSize);
  const [language, setLanguage] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.localStorage.getItem('hr_resume_language') || 'English (US)';
    }
    return 'English (US)';
  });
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [paywallTemplateName, setPaywallTemplateName] = useState<string | undefined>();

  const handleLanguageChange = (nextLang: string) => {
    setLanguage(nextLang);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('hr_resume_language', nextLang);
      const langMap: Record<string, string> = {
        'English (US)': 'en-US',
        'English (UK)': 'en-GB',
        German: 'de',
        French: 'fr',
        Spanish: 'es',
      };
      const printEl = document.getElementById('resume-document-print');
      if (printEl) {
        printEl.setAttribute('lang', langMap[nextLang] || 'en-US');
      }
    }
  };

  // Keep track of the initial template when the picker was opened, allowing 1-click revert
  const initialTemplateKeyRef = useRef(currentTemplateKey);
  useEffect(() => {
    if (isOpen) {
      initialTemplateKeyRef.current = currentTemplateKey;
    }
  }, [isOpen]);

  // Sync selectedSize with prop
  useEffect(() => {
    if (pageSize) {
      setSelectedSize(pageSize);
    }
  }, [pageSize]);

  // Close on Escape; clear preview only when panel closes — do NOT depend on
  // onPreviewTemplate identity (parent re-renders were clearing hover preview mid-hover).
  const onPreviewTemplateRef = useRef(onPreviewTemplate);
  onPreviewTemplateRef.current = onPreviewTemplate;

  useEffect(() => {
    if (!isOpen) {
      onPreviewTemplateRef.current?.(null);
      return;
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onPreviewTemplateRef.current?.(null);
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      onPreviewTemplateRef.current?.(null);
    };
  }, [isOpen, onClose]);

  const previewContent = useMemo(() => {
    return getSafePreviewContent(content);
  }, [content]);

  const categories = ['All', 'Classic', 'Modern', 'Two-Column'];

  const filteredTemplates = useMemo(() => {
    return AVAILABLE_TEMPLATES.filter((tpl) => {
      const matchesCategory = activeCategory === 'All' || tpl.category === activeCategory;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        tpl.name.toLowerCase().includes(q) ||
        tpl.description.toLowerCase().includes(q) ||
        (tpl.badge && tpl.badge.toLowerCase().includes(q));
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  const activeTemplate = useMemo(() => {
    return (
      AVAILABLE_TEMPLATES.find((tpl) => tpl.key === currentTemplateKey) ||
      AVAILABLE_TEMPLATES.find((tpl) => tpl.key === 'double-column') ||
      AVAILABLE_TEMPLATES[0]
    );
  }, [currentTemplateKey]);

  const initialTemplate = useMemo(() => {
    return AVAILABLE_TEMPLATES.find((tpl) => tpl.key === initialTemplateKeyRef.current);
  }, [currentTemplateKey]);

  if (!isOpen) return null;

  const handleSizeClick = (size: 'A4' | 'US Letter') => {
    setSelectedSize(size);
    if (onPageSizeChange) onPageSizeChange(size);
  };

  const asidePanel = (
      <aside
        data-export-exclude="true"
        aria-label="Resume Templates Panel"
        className={
          docked
            ? 'w-full h-full bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/90 dark:border-zinc-800 shadow-sm flex flex-col overflow-hidden'
            : 'fixed inset-y-0 left-0 z-40 w-full sm:w-[420px] lg:w-[440px] bg-white dark:bg-zinc-900 shadow-2xl border-r border-zinc-200 dark:border-zinc-800 flex flex-col pointer-events-auto animate-in slide-in-from-left duration-200 ease-out'
        }
      >
        {/* Drawer Header */}
        <div className="px-4 sm:px-5 py-3.5 border-b border-zinc-200 dark:border-zinc-800 shrink-0 bg-white/95 dark:bg-zinc-900/95">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <span>Templates</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  {AVAILABLE_TEMPLATES.length} Styles
                </span>
              </h2>
              <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>Hover to preview live · Click to apply</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                onPreviewTemplate?.(null);
                onClose();
              }}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              aria-label="Close template picker"
              title="Close (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Search */}
          <div className="relative mt-3">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search templates (e.g. ATS, Modern, Jake)..."
              className="w-full pl-8 pr-7 py-1.5 text-xs bg-zinc-50 dark:bg-zinc-800/70 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 mt-2.5 overflow-x-auto pb-0.5 scrollbar-none">
            {categories.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all shrink-0 cursor-pointer ${isActive
                      ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs'
                      : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'
                    }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Revert Banner (shown if user changed template during this session) */}
        {initialTemplateKeyRef.current &&
          currentTemplateKey !== initialTemplateKeyRef.current && (
            <div className="px-4 py-2 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200/80 dark:border-amber-900/60 flex items-center justify-between text-xs shrink-0 animate-in fade-in">
              <span className="text-amber-800 dark:text-amber-200 truncate text-[11px]">
                Testing styles · Originally was <strong>{initialTemplate?.name || initialTemplateKeyRef.current}</strong>
              </span>
              <button
                type="button"
                onClick={() => onSelectTemplate(initialTemplateKeyRef.current)}
                className="text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100 font-bold flex items-center gap-1 shrink-0 ml-2 transition-colors cursor-pointer text-[11px] underline underline-offset-2"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Revert</span>
              </button>
            </div>
          )}

        {/* Templates Grid (Scrollable) */}
        <div
          className="flex-1 overflow-y-auto p-4 space-y-4 overscroll-contain studio-preview-group"
          onMouseLeave={(e) => {
            // Only clear when leaving the scroll region entirely (not when crossing card gaps)
            const next = e.relatedTarget as Node | null;
            if (next && e.currentTarget.contains(next)) return;
            onPreviewTemplate?.(null);
          }}
        >
          {filteredTemplates.length === 0 ? (
            <div className="py-12 text-center text-xs text-zinc-500">
              No templates match &ldquo;{searchQuery}&rdquo;
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-3.5">
              {filteredTemplates.map((tpl) => {
                const isSelected =
                  currentTemplateKey === tpl.key ||
                  (!currentTemplateKey && tpl.key === 'jake-ats') ||
                  (currentTemplateKey === 'default' && tpl.key === 'jake-ats');
                const locked = Boolean(tpl.isPremium || isTemplatePremium(tpl.key)) && !hasActivePro;

                return (
                  <button
                    key={tpl.key}
                    type="button"
                    {...({ interestfor: 'resume-document-print' } as Record<string, string>)}
                    data-template-key={tpl.key}
                    onMouseEnter={() =>
                      onPreviewTemplate?.({ templateKey: tpl.key, label: tpl.name })
                    }
                    onFocus={() =>
                      onPreviewTemplate?.({ templateKey: tpl.key, label: tpl.name })
                    }
                    onBlur={(e) => {
                      // Keep preview when focus moves to another template card
                      const next = e.relatedTarget as HTMLElement | null;
                      if (next?.closest?.('[data-template-key]')) return;
                      onPreviewTemplate?.(null);
                    }}
                    onClick={() => {
                      onPreviewTemplate?.(null);
                      if (locked) {
                        setPaywallTemplateName(tpl.name);
                        setPaywallOpen(true);
                        return;
                      }
                      onSelectTemplate(tpl.key);
                    }}
                    className="group cursor-pointer flex flex-col text-left space-y-1.5 focus:outline-none rounded-lg"
                  >
                    {/* Miniature Visual Resume Preview Card */}
                    <div
                      aria-hidden="true"
                      inert={true}
                      className={`relative aspect-[794/1123] w-full rounded-lg border-2 overflow-hidden bg-white shadow-xs transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-md ${isSelected
                          ? 'border-emerald-700 ring-2 ring-emerald-700/30 shadow-md'
                          : locked
                            ? 'border-amber-300/80 dark:border-amber-700/60 hover:border-amber-400'
                          : 'border-zinc-200 dark:border-zinc-700 hover:border-emerald-500 dark:hover:border-emerald-500'
                        }`}
                    >
                      <TemplateThumbnail
                        templateKey={tpl.key}
                        content={previewContent}
                        accentColor={accentColor}
                        fontFamily={fontFamily}
                        showPhoto={showPhoto}
                        photoUrl={photoUrl}
                      />

                      {locked && (
                        <div className="absolute top-2 left-2 z-10 inline-flex items-center gap-1 rounded-full bg-amber-500 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white shadow-md">
                          <Crown className="h-3 w-3" />
                          Premium
                        </div>
                      )}

                      {/* Corner Checkmark Pill */}
                      {isSelected && !locked && (
                        <div className="absolute top-2 right-2 flex items-center gap-1 bg-emerald-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md animate-in zoom-in-75 z-10">
                          <Check className="w-3 h-3 stroke-[3]" />
                          <span>Active</span>
                        </div>
                      )}

                      {/* Hover Overlay */}
                      {!isSelected && (
                        <div className="absolute inset-0 bg-emerald-950/10 dark:bg-emerald-400/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2 text-center">
                          <span className="bg-zinc-900/95 text-white text-[10.5px] font-semibold px-2.5 py-1 rounded-full shadow-md inline-flex items-center gap-1">
                            {locked ? (
                              <>
                                <Lock className="h-3 w-3" />
                                Unlock with Pro
                              </>
                            ) : (
                              'Preview live'
                            )}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Label & Optional Badge */}
                    <div className="pt-0.5 px-0.5 space-y-0.5">
                      <div className="flex items-center justify-between gap-1">
                        <span
                          className={`text-xs font-bold truncate ${isSelected
                              ? 'text-emerald-700 dark:text-emerald-400'
                              : 'text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors'
                            }`}
                        >
                          {tpl.name}
                        </span>
                        {tpl.badge && (
                          <span
                            className={`shrink-0 px-1.5 py-0.2 text-white text-[8.5px] font-bold rounded uppercase tracking-wider ${
                              tpl.badge === 'Recommended'
                                ? 'bg-[#1A1D23] dark:bg-zinc-100 dark:text-zinc-900'
                                : tpl.badge === 'Premium'
                                  ? 'bg-amber-500'
                                : 'bg-emerald-700'
                            }`}
                          >
                            {tpl.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-zinc-600 dark:text-zinc-400 line-clamp-1 leading-tight">
                        {tpl.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Bottom Fixed Controls Bar */}
        <div className="p-3.5 sm:p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/90 dark:bg-zinc-950/70 space-y-2.5 shrink-0">
          {/* Document Size Selector */}
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-zinc-700 dark:text-zinc-300">
              Document size:
            </span>
            <div className="inline-flex rounded-lg border border-zinc-300 dark:border-zinc-700 p-0.5 bg-white dark:bg-zinc-900">
              <button
                type="button"
                onClick={() => handleSizeClick('A4')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${selectedSize === 'A4'
                    ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-bold'
                    : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
                  }`}
              >
                A4
              </button>
              <button
                type="button"
                onClick={() => handleSizeClick('US Letter')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${selectedSize === 'US Letter'
                    ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-bold'
                    : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
                  }`}
              >
                US Letter
              </button>
            </div>
          </div>

          {/* Resume Language Dropdown */}
          <div className="flex items-center justify-between text-xs">
            <label
              htmlFor="template-picker-language"
              className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300 font-medium"
            >
              <Info className="w-3.5 h-3.5 text-zinc-500 shrink-0" aria-hidden="true" />
              <span>Resume language:</span>
            </label>
            <select
              id="template-picker-language"
              aria-label="Resume language"
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="text-xs py-1 px-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 font-medium focus:ring-1 focus:ring-emerald-700 cursor-pointer"
            >
              <option value="English (US)">English (US)</option>
              <option value="English (UK)">English (UK)</option>
              <option value="German">German (Deutsch)</option>
              <option value="French">French (Français)</option>
              <option value="Spanish">Spanish (Español)</option>
            </select>
          </div>

          {/* Active Template Live Status */}
          <div className="pt-2 border-t border-zinc-200/70 dark:border-zinc-800 flex items-center justify-between text-[11px]">
            <span className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-medium truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
              <span className="truncate">Active: {activeTemplate.name}</span>
            </span>
            <button
              type="button"
              onClick={() => {
                onPreviewTemplate?.(null);
                onClose();
              }}
              className="px-2.5 py-1 rounded-md font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/70 dark:hover:bg-zinc-800 transition-colors cursor-pointer shrink-0"
            >
              Collapse
            </button>
          </div>
        </div>
      </aside>
  );

  const paywall = (
    <TemplatePaywallModal
      isOpen={paywallOpen}
      onClose={() => setPaywallOpen(false)}
      templateName={paywallTemplateName}
    />
  );

  if (docked) {
    return (
      <>
        {asidePanel}
        {paywall}
      </>
    );
  }

  return (
    <>
      {/* Mobile-only subtle backdrop: dismiss on tap, NO BLUR */}
      <div
        className="fixed inset-0 bg-black/25 z-30 lg:hidden transition-opacity animate-in fade-in"
        onClick={onClose}
        aria-hidden="true"
      />
      {asidePanel}
      {paywall}
    </>
  );
}
