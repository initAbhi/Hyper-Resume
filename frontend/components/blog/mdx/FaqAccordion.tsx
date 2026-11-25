'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { BlogFaq } from '@/lib/blog';

export function FaqAccordion({ items }: { items: BlogFaq[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  if (!items || items.length === 0) return null;

  return (
    <section className="not-prose mt-12 border-t border-[#E4E7EC] pt-8 dark:border-[#22262E]">
      <h2 className="mb-5 text-2xl font-bold tracking-tight text-[#1A1D23] dark:text-[#F0F2F5]">
        Frequently Asked Questions
      </h2>
      <div className="space-y-3">
        {items.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={faq.question}
              className="overflow-hidden rounded-xl border border-[#E4E7EC] bg-white dark:border-[#22262E] dark:bg-[#14171C]"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-semibold text-[#1A1D23] transition-colors hover:bg-[#F7F8FA] dark:text-[#F0F2F5] dark:hover:bg-white/[0.02] cursor-pointer"
              >
                <span>{faq.question}</span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-[#868C98] transition-transform duration-200 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {isOpen && (
                <div className="border-t border-[#E4E7EC] px-5 py-4 text-sm leading-relaxed text-[#525866] dark:border-[#22262E] dark:text-[#9CA3AF]">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
