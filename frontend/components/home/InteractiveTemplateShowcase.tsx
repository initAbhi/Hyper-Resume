'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface TemplateItem {
  key: string;
  name: string;
  img: string;
  desc: string;
  tag: string;
}

type CategoryKey = 'Popular' | 'Classic' | 'Modern' | 'Two-Column';

const CATEGORIES: { id: CategoryKey; label: string }[] = [
  { id: 'Popular', label: 'All 10 Templates' },
  { id: 'Classic', label: 'Classic ATS' },
  { id: 'Modern', label: 'Modern' },
  { id: 'Two-Column', label: 'Two-Column' },
];

const ALL_TEMPLATES: (TemplateItem & { category: Exclude<CategoryKey, 'Popular'> })[] = [
  {
    key: 'jake-ats',
    name: "Jake's Resume",
    category: 'Classic',
    img: 'https://cdn.prod.website-files.com/69e64c7c6b31ed98618646c6/6a04c207ce2523cbb765e4f2_Jake.avif',
    desc: 'High-density single-column engineering standard modeled on LaTeX conventions.',
    tag: 'TOP ATS',
  },
  {
    key: 'awesome-cv',
    name: 'Awesome CV',
    category: 'Modern',
    img: 'https://cdn.prod.website-files.com/69e64c7c6b31ed98618646c6/6a04c20cd82f8eb0925b4fc7_Highlight.avif',
    desc: 'Two-tone typography with sharp accent dividers for product and engineering roles.',
    tag: 'POPULAR',
  },
  {
    key: 'double-column',
    name: 'Double column',
    category: 'Two-Column',
    img: 'https://cdn.prod.website-files.com/69e64c7c6b31ed98618646c6/6a04c224ed91a362b6b2a1ae_Modern.avif',
    desc: 'Balanced asymmetric split highlighting deep skill matrices beside core experience.',
    tag: 'Two-Column',
  },
  {
    key: 'ivy-league',
    name: 'Ivy League',
    category: 'Classic',
    img: 'https://cdn.prod.website-files.com/69e64c7c6b31ed98618646c6/6a04c201876b772ccf521976_Harvard.avif',
    desc: 'Classic serif hierarchy trusted across finance, consulting, and academic roles.',
    tag: 'Classic Serif',
  },
  {
    key: 'deedy',
    name: 'Deedy Pro',
    category: 'Two-Column',
    img: 'https://cdn.prod.website-files.com/69e64c7c6b31ed98618646c6/6a04c249d6dfd6b5121900d9_Compact.avif',
    desc: 'Asymmetric 2-column layout (32% sidebar for skills & coursework, 68% impact).',
    tag: 'TECH',
  },
  {
    key: 'executive',
    name: 'Executive Leader',
    category: 'Modern',
    img: 'https://cdn.prod.website-files.com/69e64c7c6b31ed98618646c6/6a04c2a20fe0381da4ad115d_Dense.avif',
    desc: 'Executive Director & VP format with leadership summary and credential blocks.',
    tag: 'Leadership',
  },
  {
    key: 'classic-ats',
    name: 'Classic ATS',
    category: 'Classic',
    img: 'https://cdn.prod.website-files.com/69e64c7c6b31ed98618646c6/6a04c2131d23a352ea63a098_Standard.avif',
    desc: 'Reverse-chronological single-column standard for enterprise ATS scanners.',
    tag: '100% ATS',
  },
  {
    key: 'clean-modern',
    name: 'Modern Tech',
    category: 'Modern',
    img: 'https://cdn.prod.website-files.com/69e64c7c6b31ed98618646c6/6a04d6546aa9344414c7d0bc_Simple.avif',
    desc: 'Single-column modern tech layout with accent rules and crisp skills pills.',
    tag: 'Modern Tech',
  },
  {
    key: 'elegant',
    name: 'Elegant',
    category: 'Two-Column',
    img: 'https://cdn.prod.website-files.com/69e64c7c6b31ed98618646c6/6a04c2292196df57f604fd50_Smart.avif',
    desc: 'High-contrast dark navy sidebar paired with an expansive experience canvas.',
    tag: 'Sidebar',
  },
  {
    key: 'crest',
    name: 'Crest',
    category: 'Modern',
    img: 'https://cdn.prod.website-files.com/69e64c7c6b31ed98618646c6/6a04c28c23c19c75ffef183d_Structured.avif',
    desc: 'Contemporary header accent block with clear vertical progression.',
    tag: 'Clean Banner',
  },
];

export function InteractiveTemplateShowcase() {
  const [activeCategory, setActiveCategory] = useState<CategoryKey>('Popular');
  const [activeIndex, setActiveIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  const currentTemplates =
    activeCategory === 'Popular'
      ? ALL_TEMPLATES
      : ALL_TEMPLATES.filter((t) => t.category === activeCategory);
  const activeTemplate = currentTemplates[activeIndex] || currentTemplates[0];

  const scrollToIndex = (idx: number) => {
    if (carouselRef.current) {
      const children = carouselRef.current.children;
      if (children && children[idx]) {
        (children[idx] as HTMLElement).scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'start',
        });
      }
    }
  };

  const handleCategoryChange = (cat: CategoryKey) => {
    setActiveCategory(cat);
    setActiveIndex(0);
    if (carouselRef.current) {
      carouselRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    setActiveIndex((prev) => {
      const nextIdx = prev > 0 ? prev - 1 : currentTemplates.length - 1;
      scrollToIndex(nextIdx);
      return nextIdx;
    });
  };

  const handleNext = () => {
    setActiveIndex((prev) => {
      const nextIdx = prev < currentTemplates.length - 1 ? prev + 1 : 0;
      scrollToIndex(nextIdx);
      return nextIdx;
    });
  };

  useEffect(() => {
    if (activeIndex >= currentTemplates.length) {
      setActiveIndex(0);
    }
  }, [activeCategory, currentTemplates.length, activeIndex]);

  return (
    <div className="w-full space-y-10 text-white">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6">
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] text-zinc-300 text-xs font-semibold tracking-wider uppercase font-mono shadow-inner">
            <span className="w-1.5 h-1.5 rounded-full bg-[#5525F5] animate-pulse" />
            <span>10 Built-In Templates</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight leading-tight">
            Professional formats. Zero watermarks.
          </h2>
          <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
            Switch seamlessly across all 10 production templates — from Classic single-column ATS layouts to modern LaTeX-inspired and two-column styles — and export crisp, unwatermarked PDFs.
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-[#0E101B]/90 backdrop-blur-md rounded-xl overflow-x-auto no-scrollbar shrink-0 self-start md:self-end shadow-lg">
          {CATEGORIES.map((cat) => {
            const isSelected = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategoryChange(cat.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'bg-[#5525F5] text-white shadow-lg shadow-violet-500/25'
                    : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      <div
        ref={carouselRef}
        className="relative w-full flex gap-5 sm:gap-6 overflow-x-auto pb-6 snap-x snap-mandatory scroll-smooth no-scrollbar"
      >
        {currentTemplates.map((tpl, idx) => {
          const isActive = idx === activeIndex;

          return (
            <div
              key={tpl.key}
              onClick={() => {
                setActiveIndex(idx);
                scrollToIndex(idx);
              }}
              className={`snap-start group relative rounded-2xl p-4 sm:p-5 transition-all duration-300 cursor-pointer select-none shrink-0 w-[82vw] xs:w-[75vw] sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] ${
                isActive
                  ? 'bg-[#121526] shadow-[0_0_35px_rgba(85,37,245,0.25)] ring-1 ring-[#5525F5]/40'
                  : 'bg-[#0E101B]/90 hover:bg-[#131626] shadow-xl hover:shadow-2xl hover:shadow-violet-950/30 hover:-translate-y-1'
              }`}
            >
              <div className="relative w-full rounded-xl bg-white overflow-hidden shadow-xl aspect-[1/1.3] flex items-center justify-center">
                <img
                  src={tpl.img}
                  alt={`${tpl.name} resume template preview`}
                  loading="lazy"
                  className="w-full h-full object-cover object-top select-none pointer-events-none"
                />

                <div
                  className={`absolute inset-x-0 bottom-3 flex items-center justify-center gap-2 z-10 transition-all duration-200 ${
                    isActive
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 group-hover:opacity-100 translate-y-1'
                  }`}
                >
                  <Link
                    href={`/register?template=${encodeURIComponent(tpl.key)}`}
                    className="px-4 py-2 rounded-lg bg-[#5525F5] hover:bg-[#4318D8] text-white font-semibold text-xs shadow-lg shadow-violet-500/30 transition-all cursor-pointer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Use Template
                  </Link>
                  <Link
                    href="/examples"
                    className="px-3.5 py-2 rounded-lg bg-black/80 hover:bg-black text-white font-medium text-xs backdrop-blur-md transition-all shadow-md"
                    onClick={(e) => e.stopPropagation()}
                  >
                    View Samples
                  </Link>
                </div>
              </div>

              <div className="pt-3.5 flex items-baseline justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-violet-300 transition-colors">
                    {tpl.name}
                  </h3>
                  <p className="text-[11px] text-zinc-400 mt-0.5 line-clamp-1">
                    {tpl.desc}
                  </p>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.06] text-zinc-300 font-semibold shrink-0">
                  {tpl.tag}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 text-xs">
        <div className="text-zinc-400 flex items-center gap-2">
          <span className="font-semibold text-white">{activeTemplate.name}</span>
          <span>·</span>
          <span>{activeTemplate.desc}</span>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
          <button
            type="button"
            onClick={handlePrev}
            title="Previous template"
            className="w-8 h-8 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] flex items-center justify-center text-zinc-300 hover:text-white transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            title="Next template"
            className="w-8 h-8 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] flex items-center justify-center text-zinc-300 hover:text-white transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
