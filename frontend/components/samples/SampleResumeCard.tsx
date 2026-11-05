'use client';

import React from 'react';
import { SampleResume } from '@/data/sample-resumes';
import { CompanyBrandBadge } from './CompanyBrandBadge';
import { Eye, Sparkles, MapPin, Wand2 } from 'lucide-react';

interface SampleResumeCardProps {
  resume: SampleResume;
  onPreview: (resume: SampleResume) => void;
  onUseTemplate: (resume: SampleResume) => void;
  onAdapt?: (resume: SampleResume) => void;
}

export function SampleResumeCard({ resume, onPreview, onUseTemplate, onAdapt }: SampleResumeCardProps) {
  const exp1 = resume.experience[0];
  const exp2 = resume.experience[1];
  const exp3 = resume.experience[2];
  const proj1 = resume.projects?.[0];
  const certs = resume.certifications;

  return (
    <div
      onClick={() => onPreview(resume)}
      className="group relative flex flex-col rounded-xl bg-white dark:bg-[#14171C] border border-[#E2E5E9] dark:border-[#252A33] hover:border-[#285FEA]/50 dark:hover:border-[#285FEA]/60 shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer select-none"
    >
      {/* 1. Miniature ATS Document Preview Sheet (Full-page authentic resume layout) */}
      <div className="relative bg-white text-zinc-900 p-2.5 sm:p-3 aspect-[8.5/11] overflow-hidden flex flex-col border-b border-[#E2E5E9] dark:border-[#252A33]">
        {/* Subtle Illustrative Badge */}
        <div className="absolute top-1.5 right-1.5 z-10 pointer-events-none">
          <span className="text-[7px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-zinc-100/90 text-zinc-500 border border-zinc-200">
            Illustrative
          </span>
        </div>

        <div className="space-y-1 sm:space-y-1.5">
          {/* Candidate Header */}
          <div className="text-center pb-0.5">
            <h4 className="font-serif font-bold text-[10.5px] sm:text-[11.5px] text-zinc-950 tracking-tight leading-tight">
              {resume.candidate.name}
            </h4>
            <p className="text-[5.2px] sm:text-[5.8px] font-semibold text-[#285FEA] truncate mt-0.5 leading-none">
              {resume.candidate.title}
            </p>
            <p className="text-[4.6px] sm:text-[5.2px] text-zinc-600 truncate mt-0.5 leading-none">
              {resume.candidate.location} &bull; {resume.candidate.email} &bull; {resume.candidate.phone}
            </p>
            <p className="text-[4.4px] sm:text-[5px] text-[#285FEA] truncate mt-0.5 leading-none font-medium">
              {resume.candidate.linkedin} {resume.candidate.github && `• ${resume.candidate.github}`}
            </p>
          </div>

          {/* Hairline Divider */}
          <div className="w-full h-[0.5px] bg-zinc-200 my-0.5" />

          {/* Section: SUMMARY */}
          <div>
            <div className="text-[5.5px] sm:text-[6px] font-bold tracking-wider text-zinc-950 uppercase border-b border-zinc-200 pb-0.5 mb-0.5">
              PROFESSIONAL SUMMARY
            </div>
            <p className="text-[4.6px] sm:text-[5px] leading-[1.3] text-zinc-700 line-clamp-3">
              {resume.summary}
            </p>
          </div>

          {/* Section: TECHNICAL SKILLS */}
          <div>
            <div className="text-[5.5px] sm:text-[6px] font-bold tracking-wider text-zinc-950 uppercase border-b border-zinc-200 pb-0.5 mb-0.5">
              CORE SKILLS &amp; EXPERTISE
            </div>
            <div className="space-y-0.5">
              {resume.skills.slice(0, 4).map((cat, idx) => (
                <p key={idx} className="text-[4.5px] sm:text-[4.9px] leading-tight text-zinc-700 truncate">
                  <span className="font-bold text-zinc-900">{cat.category}: </span>
                  {cat.skills.join(', ')}
                </p>
              ))}
            </div>
          </div>

          {/* Section: WORK EXPERIENCE */}
          <div>
            <div className="text-[5.5px] sm:text-[6px] font-bold tracking-wider text-zinc-950 uppercase border-b border-zinc-200 pb-0.5 mb-0.5">
              PROFESSIONAL EXPERIENCE
            </div>

            {/* Experience 1 */}
            {exp1 && (
              <div className="mb-1">
                <div className="flex justify-between items-baseline text-[4.9px] sm:text-[5.3px] font-bold text-zinc-950">
                  <span className="truncate max-w-[140px]">{exp1.title}</span>
                  <span className="text-[4.4px] sm:text-[4.8px] text-zinc-500 font-medium shrink-0">
                    {exp1.startDate} &ndash; {exp1.current ? 'Present' : exp1.endDate}
                  </span>
                </div>
                <div className="text-[4.5px] sm:text-[4.8px] text-zinc-600 italic leading-none mb-0.5">
                  {exp1.company} &bull; {exp1.location}
                </div>
                <ul className="space-y-0.5">
                  {exp1.bullets.slice(0, 3).map((bullet, idx) => (
                    <li key={idx} className="text-[4.5px] sm:text-[4.9px] leading-[1.3] text-zinc-700 flex items-start gap-0.5">
                      <span className="text-zinc-400 shrink-0">&bull;</span>
                      <span className="line-clamp-2">{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Experience 2 */}
            {exp2 && exp2 !== exp1 && (
              <div className={exp3 ? 'mb-1' : ''}>
                <div className="flex justify-between items-baseline text-[4.9px] sm:text-[5.3px] font-bold text-zinc-950">
                  <span className="truncate max-w-[140px]">{exp2.title}</span>
                  <span className="text-[4.4px] sm:text-[4.8px] text-zinc-500 font-medium shrink-0">
                    {exp2.startDate} &ndash; {exp2.endDate}
                  </span>
                </div>
                <div className="text-[4.5px] sm:text-[4.8px] text-zinc-600 italic leading-none mb-0.5">
                  {exp2.company} &bull; {exp2.location}
                </div>
                <ul className="space-y-0.5">
                  {exp2.bullets.slice(0, 2).map((bullet, idx) => (
                    <li key={idx} className="text-[4.5px] sm:text-[4.9px] leading-[1.3] text-zinc-700 flex items-start gap-0.5">
                      <span className="text-zinc-400 shrink-0">&bull;</span>
                      <span className="line-clamp-2">{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Experience 3 */}
            {exp3 && (
              <div>
                <div className="flex justify-between items-baseline text-[4.9px] sm:text-[5.3px] font-bold text-zinc-950">
                  <span className="truncate max-w-[140px]">{exp3.title}</span>
                  <span className="text-[4.4px] sm:text-[4.8px] text-zinc-500 font-medium shrink-0">
                    {exp3.startDate} &ndash; {exp3.endDate}
                  </span>
                </div>
                <div className="text-[4.5px] sm:text-[4.8px] text-zinc-600 italic leading-none mb-0.5">
                  {exp3.company} &bull; {exp3.location}
                </div>
                <ul className="space-y-0.5">
                  {exp3.bullets.slice(0, 1).map((bullet, idx) => (
                    <li key={idx} className="text-[4.5px] sm:text-[4.9px] leading-[1.3] text-zinc-700 flex items-start gap-0.5">
                      <span className="text-zinc-400 shrink-0">&bull;</span>
                      <span className="line-clamp-1">{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Section: KEY PROJECTS */}
          {proj1 && (
            <div>
              <div className="text-[5.5px] sm:text-[6px] font-bold tracking-wider text-zinc-950 uppercase border-b border-zinc-200 pb-0.5 mb-0.5">
                KEY PROJECTS
              </div>
              <p className="text-[4.9px] sm:text-[5.3px] font-semibold text-zinc-950 truncate">
                {proj1.name}
              </p>
              <p className="text-[4.5px] sm:text-[4.9px] leading-[1.3] text-zinc-700 line-clamp-2">
                {proj1.description}
              </p>
            </div>
          )}

          {/* Section: EDUCATION */}
          {resume.education && resume.education.length > 0 && (
            <div>
              <div className="text-[5.5px] sm:text-[6px] font-bold tracking-wider text-zinc-950 uppercase border-b border-zinc-200 pb-0.5 mb-0.5">
                EDUCATION
              </div>
              <div className="space-y-0.5">
                {resume.education.slice(0, 1).map((edu, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between items-baseline text-[4.9px] sm:text-[5.3px] text-zinc-900 font-semibold">
                      <span className="truncate max-w-[150px]">
                        {edu.degree} in {edu.field} &ndash; {edu.school}
                      </span>
                      <span className="text-[4.4px] sm:text-[4.8px] text-zinc-500 font-medium shrink-0 ml-1">
                        {edu.graduationDate}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section: CERTIFICATIONS */}
          {certs && certs.length > 0 && (
            <div>
              <div className="text-[5.5px] sm:text-[6px] font-bold tracking-wider text-zinc-950 uppercase border-b border-zinc-200 pb-0.5 mb-0.5">
                CERTIFICATIONS
              </div>
              <p className="text-[4.5px] sm:text-[4.9px] text-zinc-700 truncate">
                &bull; {certs.slice(0, 3).join(' • ')}
              </p>
            </div>
          )}
        </div>

        {/* Hover Action Overlay */}
        <div className="absolute inset-0 bg-[#0D0F12]/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-2 p-3 sm:p-4 z-20">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onPreview(resume);
            }}
            className="w-full py-1.5 px-3 rounded-lg bg-white text-[#1A1D23] text-xs font-semibold shadow-md hover:bg-[#F7F8FA] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-[#5A6270]" />
            <span>Preview Resume</span>
          </button>

          {onAdapt && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onAdapt(resume);
              }}
              className="w-full py-1.5 px-3 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>Adapt With Profile</span>
            </button>
          )}

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onUseTemplate(resume);
            }}
            className="w-full py-1.5 px-3 rounded-lg bg-[#285FEA] text-white text-xs font-semibold shadow-md hover:bg-[#1E4BC8] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Use Full Template</span>
          </button>
        </div>
      </div>

      {/* 2. Brand & Role Card Footer (with Seniority, Country, Style metadata) */}
      <div className="bg-[#F7F8FA] dark:bg-[#161920] p-3 sm:p-3.5 flex flex-col justify-between gap-2 min-h-[78px]">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <CompanyBrandBadge companyKey={resume.companyKey} companyName={resume.company} />
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {resume.badge === 'PRO' ? (
              <span className="text-[9px] font-bold tracking-wider px-1.5 py-0.5 rounded border border-[#285FEA]/30 bg-[#285FEA]/10 text-[#285FEA] dark:bg-[#285FEA]/20 dark:text-[#60A5FA] uppercase">
                {resume.badge}
              </span>
            ) : (
              <span className="text-[9px] font-bold tracking-wider px-1.5 py-0.5 rounded border border-[#E2E5E9] dark:border-[#252A33] bg-white dark:bg-[#1D2128] text-[#5A6270] dark:text-[#9EA7B4] uppercase">
                {resume.badge}
              </span>
            )}
            <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/60">
              {resume.atsScore} ATS
            </span>
          </div>
        </div>

        <div className="min-w-0">
          <span className="text-xs font-semibold text-[#1A1D23] dark:text-[#F0F2F5] truncate block group-hover:text-[#285FEA] transition-colors" title={resume.role}>
            {resume.role}
          </span>
          <div className="flex items-center gap-1.5 text-[10px] text-[#5A6270] dark:text-[#9EA7B4] mt-0.5 truncate">
            <span className="font-medium text-zinc-700 dark:text-zinc-300">{resume.experienceLevelLabel}</span>
            <span>&bull;</span>
            <span className="inline-flex items-center gap-0.5">
              <MapPin className="w-2.5 h-2.5 text-zinc-400" />
              {resume.country}
            </span>
            <span>&bull;</span>
            <span className="text-[#285FEA] dark:text-[#60A5FA] font-medium">{resume.resumeStyle}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
