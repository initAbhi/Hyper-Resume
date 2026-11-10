'use client';

import React from 'react';
import type { CustomResumeSection, ResumeContent } from '@/lib/api-client';
import { renderHighlightedText } from './types';

interface CustomSectionsBlockProps {
  content: ResumeContent;
  accentColor?: string;
  highlightKeywords?: string[];
  showHighlights?: boolean;
  variant?: 'clean' | 'serif' | 'bar';
  spacingClassName?: string;
}

/**
 * Shared renderer for user-defined custom resume sections (Publications,
 * Awards & Honors, Volunteer Work, Languages, etc.) across all 10 templates.
 * Emits `<section data-resume-section="custom:<id>">` nodes inside the main
 * section container so `applyResumeLayoutToDom` can reorder and hide them identically
 * to built-in sections.
 */
export function CustomSectionsBlock({
  content,
  accentColor = '#18181b',
  highlightKeywords,
  showHighlights = false,
  variant = 'clean',
  spacingClassName = 'space-y-2',
}: CustomSectionsBlockProps) {
  const customSections: CustomResumeSection[] = Array.isArray(
    content.customSections,
  )
    ? content.customSections.filter(
        (sec) =>
          Boolean(sec?.id) &&
          Boolean(sec?.title?.trim()) &&
          Array.isArray(sec.entries) &&
          sec.entries.some(
            (e) =>
              Boolean(e.heading?.trim()) ||
              (e.bullets || []).some((b) => Boolean(b.trim())),
          ),
      )
    : [];

  if (customSections.length === 0) return null;

  return (
    <>
      {customSections.map((sec) => (
        <section
          key={sec.id}
          data-resume-section={`custom:${sec.id}`}
          className={`resume-section ${spacingClassName}`}
        >
          {variant === 'serif' ? (
            <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-900 border-b border-zinc-900 pb-0.5 mb-2 text-center font-serif">
              {sec.title}
            </h2>
          ) : variant === 'bar' ? (
            <h2
              className="text-xs font-bold uppercase tracking-wider pl-2 border-l-3"
              style={{ borderColor: accentColor, color: '#09090b' }}
            >
              {sec.title}
            </h2>
          ) : (
            <h2
              className="text-[11.5px] font-bold uppercase tracking-wider text-zinc-900 pb-1 border-b"
              style={{
                borderBottomColor:
                  accentColor !== '#000000' ? accentColor : '#d4d4d8',
              }}
            >
              {sec.title}
            </h2>
          )}

          <div className="space-y-2">
            {sec.entries.map((entry, idx) => (
              <div key={entry.id || idx} className="resume-entry space-y-0.5 text-[10.5px]">
                <div className="flex flex-wrap justify-between items-baseline gap-2">
                  <div className="font-bold text-zinc-950">
                    <span>{entry.heading}</span>
                    {entry.subtitle?.trim() && (
                      <span className="font-medium text-zinc-600">
                        {' '}
                        — {entry.subtitle}
                      </span>
                    )}
                  </div>
                  {(entry.locationOrLink?.trim() || entry.dateRange?.trim()) && (
                    <span className="text-[10px] text-zinc-500 font-normal shrink-0">
                      {[entry.locationOrLink?.trim(), entry.dateRange?.trim()]
                        .filter(Boolean)
                        .join(' · ')}
                    </span>
                  )}
                </div>

                {Array.isArray(entry.bullets) &&
                  entry.bullets.some((b) => b.trim().length > 0) && (
                    <ul className="list-disc pl-4 space-y-0.5 text-zinc-700 leading-relaxed">
                      {entry.bullets
                        .filter((b) => b.trim().length > 0)
                        .map((bullet, bIdx) => (
                          <li key={bIdx}>
                            {renderHighlightedText(
                              bullet,
                              highlightKeywords,
                              showHighlights,
                            )}
                          </li>
                        ))}
                    </ul>
                  )}
              </div>
            ))}
          </div>
        </section>
      ))}
    </>
  );
}

