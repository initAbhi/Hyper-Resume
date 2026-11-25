'use client';

import React, { useEffect, useState } from 'react';
import { List } from 'lucide-react';
import type { BlogHeading } from '@/lib/blog';

export function TableOfContents({ headings }: { headings: BlogHeading[] }) {
  const [activeId, setActiveId] = useState<string>(headings[0]?.id ?? '');

  useEffect(() => {
    if (headings.length === 0) return;

    const elements = headings
      .map((h) => document.getElementById(h.id))
      .filter((el): el is HTMLElement => Boolean(el));

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: '-96px 0px -65% 0px', threshold: 0.1 },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <nav aria-label="Table of Contents" className="space-y-3">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#868C98] dark:text-[#6B7280]">
        <List className="h-3.5 w-3.5" />
        <span>On This Page</span>
      </div>
      <ul className="space-y-1.5 border-l border-[#E4E7EC] dark:border-[#22262E]">
        {headings.map((heading) => {
          const isActive = activeId === heading.id;
          return (
            <li key={heading.id}>
              <a
                href={`#${heading.id}`}
                className={`block border-l-2 py-1 text-[13px] leading-snug transition-colors ${
                  heading.level === 3 ? 'pl-5' : 'pl-3'
                } ${
                  isActive
                    ? 'border-[#285FEA] font-semibold text-[#285FEA] dark:border-[#3B82F6] dark:text-[#60A5FA]'
                    : 'border-transparent text-[#525866] hover:text-[#1A1D23] dark:text-[#9CA3AF] dark:hover:text-[#F0F2F5]'
                }`}
              >
                {heading.text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
