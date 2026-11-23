'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { SampleResume, getSampleTemplateKey } from '@/data/sample-resumes';
import { getSampleAccentColor, sampleResumeToContent } from '@/lib/sample-resume-content';
import { ResumeTemplateRenderer } from '@/components/resumes/templates/ResumeTemplateRenderer';
import { CompanyBrandBadge } from './CompanyBrandBadge';
import { MapPin } from 'lucide-react';

interface SampleResumeCardProps {
  resume: SampleResume;
  onPreview: (resume: SampleResume) => void;
  /** @deprecated Kept optional for call-site compatibility; hover only shows Preview */
  onUseTemplate?: (resume: SampleResume) => void;
  onAdapt?: (resume: SampleResume) => void;
  isCloning?: boolean;
}

/** Live scaled A4 thumbnail — same templates as the full preview modal. */
function SampleTemplateThumbnail({ resume }: { resume: SampleResume }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const templateKey = getSampleTemplateKey(resume);
  const content = useMemo(() => sampleResumeToContent(resume), [resume]);
  const fontFamily = content.layout?.fontFamily === 'serif' ? 'serif' : 'sans';

  useEffect(() => {
    if (!containerRef.current) return;
    const node = containerRef.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px 0px', threshold: 0.01 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible || !containerRef.current) return;
    const updateScale = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;
      if (width > 0) setScale(width / 794);
    };
    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [isVisible]);

  // Crop to the dense top of the page and scale slightly larger so cards read fuller.
  const VIEW_HEIGHT = 980;

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-[794/980] bg-white overflow-hidden select-none pointer-events-none"
    >
      {!isVisible && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-b from-zinc-50 via-zinc-100/80 to-zinc-50" />
      )}
      {isVisible && scale > 0 && (
        <div
          aria-hidden
          className="template-thumbnail-render pointer-events-none select-none bg-white text-zinc-950"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: 794,
            height: VIEW_HEIGHT,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
          }}
        >
          <ResumeTemplateRenderer
            templateKey={templateKey}
            content={content}
            accentColor={getSampleAccentColor(resume)}
            fontFamily={fontFamily}
            showPhoto={false}
            showHighlights={false}
          />
        </div>
      )}
    </div>
  );
}

export function SampleResumeCard({ resume, onPreview }: SampleResumeCardProps) {
  return (
    <div
      onClick={() => onPreview(resume)}
      className="group relative flex flex-col rounded-xl bg-white dark:bg-[#14171C] border border-[#E2E5E9] dark:border-[#252A33] hover:border-[#285FEA]/50 dark:hover:border-[#285FEA]/60 shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer select-none"
    >
      <div className="relative bg-zinc-100 dark:bg-[#1a1d24] overflow-hidden border-b border-[#E2E5E9] dark:border-[#252A33]">
        <div aria-hidden="true" className="w-full">
          <SampleTemplateThumbnail resume={resume} />
        </div>

        <div className="absolute bottom-1.5 right-1.5 z-10 pointer-events-none opacity-90">
          <span className="text-[6.5px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/95 text-zinc-600 border border-zinc-200/90 shadow-2xs">
            Illustrative
          </span>
        </div>

        <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#0D0F12]/55 opacity-0 backdrop-blur-[1px] transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onPreview(resume);
            }}
            className="rounded-lg bg-[#c4b5fd] px-8 py-2.5 text-xs font-bold uppercase tracking-wide text-zinc-950 shadow-lg transition hover:bg-[#d8b4fe] cursor-pointer"
          >
            Preview
          </button>
        </div>
      </div>

      <div className="bg-[#F7F8FA] dark:bg-[#161920] p-3 sm:p-3.5 flex flex-col justify-between gap-2 min-h-[78px]">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <CompanyBrandBadge companyKey={resume.companyKey} companyName={resume.company} />
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {resume.badge === 'PRO' ? (
              <span className="text-[9px] font-bold tracking-wider px-1.5 py-0.5 rounded border border-[#1D4ED8]/30 bg-blue-50 text-[#1D4ED8] dark:bg-[#285FEA]/20 dark:text-[#93C5FD] uppercase">
                {resume.badge}
              </span>
            ) : (
              <span className="text-[9px] font-bold tracking-wider px-1.5 py-0.5 rounded border border-[#E2E5E9] dark:border-[#252A33] bg-white dark:bg-[#1D2128] text-[#475569] dark:text-[#CBD5E1] uppercase">
                {resume.badge}
              </span>
            )}
            <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60">
              {resume.atsScore} ATS
            </span>
          </div>
        </div>

        <div className="min-w-0">
          <span
            className="text-xs font-semibold text-[#1A1D23] dark:text-[#F0F2F5] truncate block group-hover:text-[#1D4ED8] transition-colors"
            title={resume.role}
          >
            {resume.role}
          </span>
          <div className="flex items-center gap-1.5 text-[10px] text-[#475569] dark:text-[#CBD5E1] mt-0.5 truncate">
            <span className="font-medium text-zinc-800 dark:text-zinc-200">{resume.experienceLevelLabel}</span>
            <span>&bull;</span>
            <span className="inline-flex items-center gap-0.5">
              <MapPin className="w-2.5 h-2.5 text-zinc-700 dark:text-zinc-300" />
              {resume.country}
            </span>
            <span>&bull;</span>
            <span className="text-[#1D4ED8] dark:text-[#93C5FD] font-medium">{resume.resumeStyle}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
