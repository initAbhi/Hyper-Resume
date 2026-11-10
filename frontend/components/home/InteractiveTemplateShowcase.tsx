'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ArrowRight, Check, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TemplateItem {
  name: string;
  img: string;
  desc: string;
  tag: string;
}

type CategoryKey = 'Most Popular' | 'Simple' | 'Modern' | 'Creative' | 'Compact';

const CATEGORIES: { id: CategoryKey; label: string }[] = [
  { id: 'Most Popular', label: 'Most Popular' },
  { id: 'Simple', label: 'Simple' },
  { id: 'Modern', label: 'Modern' },
  { id: 'Creative', label: 'Creative' },
  { id: 'Compact', label: 'Compact' },
];

const TEMPLATES_BY_CATEGORY: Record<CategoryKey, TemplateItem[]> = {
  'Most Popular': [
    {
      name: 'Double Column',
      img: 'https://cdn.prod.website-files.com/69e64c7c6b31ed98618646c6/6a04c224ed91a362b6b2a1ae_Modern.avif',
      desc: 'Balanced dual-column architecture designed for technical candidates with extensive skills and project portfolios.',
      tag: 'Developer Standard',
    },
    {
      name: 'Modern ATS',
      img: 'https://cdn.prod.website-files.com/69e64c7c6b31ed98618646c6/6a04c20cd82f8eb0925b4fc7_Highlight.avif',
      desc: 'Restrained typography hierarchy with subtle color accents to guide reviewer focus while ensuring 100% linear text extraction.',
      tag: 'Product & Tech',
    },
    {
      name: 'Ivy League',
      img: 'https://cdn.prod.website-files.com/69e64c7c6b31ed98618646c6/6a04c201876b772ccf521976_Harvard.avif',
      desc: 'Education-first academic standard trusted across competitive finance, consulting, and law applications.',
      tag: 'Finance & Consulting',
    },
    {
      name: 'Jake Classic',
      img: 'https://cdn.prod.website-files.com/69e64c7c6b31ed98618646c6/6a04c207ce2523cbb765e4f2_Jake.avif',
      desc: 'High-density single-column engineering standard adapted from LaTeX conventions for developers and researchers.',
      tag: 'Software Engineering',
    },
  ],
  Simple: [
    {
      name: 'Standard ATS',
      img: 'https://cdn.prod.website-files.com/69e64c7c6b31ed98618646c6/6a04c2131d23a352ea63a098_Standard.avif',
      desc: 'Classic reverse-chronological layout prioritizing pure readability and maximum parsing compatibility.',
      tag: 'Corporate & Legal',
    },
    {
      name: 'Minimalist',
      img: 'https://cdn.prod.website-files.com/69e64c7c6b31ed98618646c6/6a04d6546aa9344414c7d0bc_Simple.avif',
      desc: 'Clean, distraction-free typography allowing documented achievements and leadership metrics to command attention.',
      tag: 'Executive & Senior',
    },
    {
      name: 'Basic Chronological',
      img: 'https://cdn.prod.website-files.com/69e64c7c6b31ed98618646c6/6a04c219a552dc670bd77e8f_Basic.avif',
      desc: 'Traditional resume structure that executive recruiters recognize and trust across conservative enterprise sectors.',
      tag: 'Traditional Enterprise',
    },
  ],
  Modern: [
    {
      name: 'Modern Clean',
      img: 'https://cdn.prod.website-files.com/69e64c7c6b31ed98618646c6/6a04c224ed91a362b6b2a1ae_Modern.avif',
      desc: 'Distinct sections for technical competencies and verified career impact. Optimized for modern technology teams.',
      tag: 'Tech & Engineering',
    },
    {
      name: 'Smart Progression',
      img: 'https://cdn.prod.website-files.com/69e64c7c6b31ed98618646c6/6a04c2292196df57f604fd50_Smart.avif',
      desc: 'Structured timeline headers designed to showcase consistent promotional velocity and organizational ownership.',
      tag: 'Management & Leads',
    },
    {
      name: 'Neat Enterprise',
      img: 'https://cdn.prod.website-files.com/69e64c7c6b31ed98618646c6/6a04c22d00c27dc827b837aa_Neat.avif',
      desc: 'Conservative, high-density format engineered for large enterprise recruiting systems and hiring boards.',
      tag: 'Enterprise Roles',
    },
  ],
  Creative: [
    {
      name: 'Highlight Portfolio',
      img: 'https://cdn.prod.website-files.com/69e64c7c6b31ed98618646c6/6a04c20cd82f8eb0925b4fc7_Highlight.avif',
      desc: 'Subtle accent rules and structured metadata pills to organize multi-disciplinary creative and technical work.',
      tag: 'Design & Product',
    },
    {
      name: 'Executive Crest',
      img: 'https://cdn.prod.website-files.com/69e64c7c6b31ed98618646c6/6a04c2a20fe0381da4ad115d_Dense.avif',
      desc: 'Authoritative layout with sophisticated serif headline accents designed for VP and Director level applications.',
      tag: 'Executive Leadership',
    },
  ],
  Compact: [
    {
      name: 'One-Page Compact',
      img: 'https://cdn.prod.website-files.com/69e64c7c6b31ed98618646c6/6a04c249d6dfd6b5121900d9_Compact.avif',
      desc: 'High-density layout maximizing printable A4 surface area to fit multi-year career histories onto 1 page.',
      tag: '1-Page Invariant',
    },
    {
      name: 'Structured Flow',
      img: 'https://cdn.prod.website-files.com/69e64c7c6b31ed98618646c6/6a04c28c23c19c75ffef183d_Structured.avif',
      desc: 'Tight vertical rhythm and micro-spacing engineered for deep technical skills and extensive certification lists.',
      tag: 'High Density',
    },
  ],
};

export function InteractiveTemplateShowcase() {
  const [activeCategory, setActiveCategory] = useState<CategoryKey>('Most Popular');
  const [activeIndex, setActiveIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  const currentTemplates = TEMPLATES_BY_CATEGORY[activeCategory] || TEMPLATES_BY_CATEGORY['Most Popular'];
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
      
      {/* Editorial Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6">
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] text-zinc-300 text-xs font-semibold tracking-wider uppercase font-mono shadow-inner">
            <span className="w-1.5 h-1.5 rounded-full bg-[#5525F5] animate-pulse" />
            <span>Template Architecture</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight leading-tight">
            Professional formats. Clear first impressions.
          </h2>
          <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
            Choose a layout that presents your experience with clarity and consistency. Every format enforces standard ATS parsing rules and exports clean vector A4 PDFs.
          </p>
        </div>

        {/* Category Filter Tabs */}
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

      {/* Template Carousel Viewport */}
      <div
        ref={carouselRef}
        className="relative w-full flex gap-5 sm:gap-6 overflow-x-auto pb-6 snap-x snap-mandatory scroll-smooth no-scrollbar"
      >
        {currentTemplates.map((tpl, idx) => {
          const isActive = idx === activeIndex;

          return (
            <div
              key={`${tpl.name}-${idx}`}
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
              {/* Paper Preview Frame */}
              <div className="relative w-full rounded-xl bg-white overflow-hidden shadow-xl aspect-[1/1.3] flex items-center justify-center">
                <img
                  src={tpl.img}
                  alt={`${tpl.name} resume template preview`}
                  loading="lazy"
                  className="w-full h-full object-cover object-top select-none pointer-events-none"
                />

                {/* Hover / Active Quick Actions */}
                <div
                  className={`absolute inset-x-0 bottom-3 flex items-center justify-center gap-2 z-10 transition-all duration-200 ${
                    isActive
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 group-hover:opacity-100 translate-y-1'
                  }`}
                >
                  <Link
                    href={`/login?template=${encodeURIComponent(tpl.name.toLowerCase())}`}
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

              {/* Template Meta */}
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

      {/* Carousel Footer & Pagination Controls */}
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
