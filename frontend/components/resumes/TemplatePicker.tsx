'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { X, Check, Info } from 'lucide-react';
import { AVAILABLE_TEMPLATES, ResumeTemplateRenderer } from './templates';
import type { ResumeContent } from '@/lib/api-client';

interface TemplatePickerProps {
  isOpen: boolean;
  onClose: () => void;
  currentTemplateKey: string;
  onSelectTemplate: (templateKey: string) => void;
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
  currentTemplateKey,
  onSelectTemplate,
  pageSize = 'A4',
  onPageSizeChange,
  content,
  accentColor,
  fontFamily,
  showPhoto,
  photoUrl,
}: TemplatePickerProps) {
  const [selectedSize, setSelectedSize] = useState<'A4' | 'US Letter'>(pageSize);
  const [language, setLanguage] = useState('English (US)');
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const previewContent = useMemo(() => {
    return getSafePreviewContent(content);
  }, [content]);

  if (!isOpen) return null;

  const handleSizeClick = (size: 'A4' | 'US Letter') => {
    setSelectedSize(size);
    if (onPageSizeChange) onPageSizeChange(size);
  };

  const categories = ['All', 'Classic', 'Modern', 'Two-Column'];

  const filteredTemplates = AVAILABLE_TEMPLATES.filter((tpl) => {
    if (activeCategory === 'All') return true;
    return tpl.category === activeCategory;
  });

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Slide-in Left Drawer */}
      <div className="relative w-full max-w-[460px] bg-white dark:bg-zinc-900 h-full shadow-2xl border-r border-zinc-200 dark:border-zinc-800 flex flex-col z-10 animate-in slide-in-from-left duration-200">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <span>Select a template</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  {AVAILABLE_TEMPLATES.length} Styles
                </span>
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Previewed live with your resume details
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              aria-label="Close template picker"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 mt-3 overflow-x-auto pb-0.5 scrollbar-none">
            {categories.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all shrink-0 ${
                    isActive
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

        {/* Templates Grid (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3.5 sm:gap-4">
            {filteredTemplates.map((tpl) => {
              const isSelected =
                currentTemplateKey === tpl.key ||
                (!currentTemplateKey && tpl.key === 'double-column') ||
                (currentTemplateKey === 'default' && tpl.key === 'double-column');

              return (
                <div
                  key={tpl.key}
                  onClick={() => onSelectTemplate(tpl.key)}
                  className="group cursor-pointer flex flex-col text-left space-y-1.5"
                >
                  {/* Miniature Visual Resume Preview Card */}
                  <div
                    className={`relative aspect-[794/1123] w-full rounded-lg border-2 overflow-hidden bg-white shadow-xs transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-md ${
                      isSelected
                        ? 'border-emerald-600 ring-2 ring-emerald-600/30 shadow-md'
                        : 'border-zinc-200 dark:border-zinc-700 hover:border-emerald-400 dark:hover:border-emerald-500'
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

                    {/* Corner Checkmark Pill */}
                    {isSelected && (
                      <div className="absolute top-2 right-2 flex items-center gap-1 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md animate-in zoom-in-75 z-10">
                        <Check className="w-3 h-3 stroke-[3]" />
                        <span>Active</span>
                      </div>
                    )}

                    {/* Hover Click to Apply Overlay */}
                    {!isSelected && (
                      <div className="absolute inset-0 bg-emerald-950/5 dark:bg-emerald-400/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="bg-zinc-900/85 text-white text-[10.5px] font-semibold px-2.5 py-1 rounded-full shadow-md backdrop-blur-xs">
                          Click to apply
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Label & Optional Badge */}
                  <div className="pt-0.5 px-0.5 space-y-0.5">
                    <div className="flex items-center justify-between gap-1">
                      <span
                        className={`text-xs font-bold truncate ${
                          isSelected
                            ? 'text-emerald-700 dark:text-emerald-400'
                            : 'text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors'
                        }`}
                      >
                        {tpl.name}
                      </span>
                      {tpl.badge && (
                        <span className="shrink-0 px-1.5 py-0.2 bg-emerald-600 text-white text-[8.5px] font-bold rounded uppercase tracking-wider">
                          {tpl.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400 line-clamp-1 leading-tight">
                      {tpl.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Fixed Controls Bar */}
        <div className="p-4 sm:p-5 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 space-y-3.5 shrink-0">
          {/* Continue Editing Button */}
          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center justify-center gap-2"
          >
            <span>Continue Editing</span>
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
                    : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
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
                    : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
                }`}
              >
                US Letter
              </button>
            </div>
          </div>

          {/* Resume Language Dropdown */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400 font-medium">
              <Info className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              <span>Resume language:</span>
            </div>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="text-xs py-1 px-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 font-medium focus:ring-1 focus:ring-emerald-600"
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
