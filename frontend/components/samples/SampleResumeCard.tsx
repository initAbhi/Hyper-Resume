'use client';

import React from 'react';
import { SampleResume, getSampleTemplateKey } from '@/data/sample-resumes';
import { CompanyBrandBadge } from './CompanyBrandBadge';
import { Eye, Sparkles, MapPin, Wand2 } from 'lucide-react';

interface SampleResumeCardProps {
  resume: SampleResume;
  onPreview: (resume: SampleResume) => void;
  onUseTemplate: (resume: SampleResume) => void;
  onAdapt?: (resume: SampleResume) => void;
  isCloning?: boolean;
}

// Map each company profile to a distinctive, high-end resume template variant
export type TemplateVariant =
  | 'sidebar'
  | 'double-column'
  | 'clean-modern'
  | 'executive'
  | 'jake-ats'
  | 'ivy-league'
  | 'classic';

export function getTemplateVariant(resume: SampleResume): TemplateVariant {
  const tpl = getSampleTemplateKey(resume);
  if (tpl === 'sidebar' || tpl === 'elegant') return 'sidebar';
  if (tpl === 'double-column' || tpl === 'deedy') return 'double-column';
  if (tpl === 'clean-modern' || tpl === 'modern' || tpl === 'technical-ats' || tpl === 'crest' || tpl === 'awesome-cv') return 'clean-modern';
  if (tpl === 'executive' || tpl === 'executive-leader') return 'executive';
  if (tpl === 'jake-ats' || tpl === 'jake') return 'jake-ats';
  if (tpl === 'ivy-league') return 'ivy-league';
  return 'classic';
}

export function SampleResumeCard({ resume, onPreview, onUseTemplate, onAdapt, isCloning = false }: SampleResumeCardProps) {
  const variant = getTemplateVariant(resume);
  const exp1 = resume.experience[0];
  const exp2 = resume.experience[1];
  const proj1 = resume.projects?.[0];
  const certs = resume.certifications;

  return (
    <div
      onClick={() => onPreview(resume)}
      className="group relative flex flex-col rounded-xl bg-white dark:bg-[#14171C] border border-[#E2E5E9] dark:border-[#252A33] hover:border-[#285FEA]/50 dark:hover:border-[#285FEA]/60 shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer select-none"
    >
      {/* 1. Miniature ATS Document Preview Sheet (decorative visual thumbnail marked aria-hidden so 5px preview text doesn't fail AT/contrast audits) */}
      <div className="relative bg-white text-zinc-900 aspect-[8.5/11] overflow-hidden flex flex-col border-b border-[#E2E5E9] dark:border-[#252A33]">
        <div aria-hidden="true" className="w-full h-full flex flex-col">
        {/* Subtle Illustrative Badge positioned at bottom-right away from header/contact */}
        <div className="absolute bottom-1 right-1.5 z-10 pointer-events-none opacity-80">
          <span className="text-[6.5px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/95 text-zinc-600 border border-zinc-200/90 shadow-2xs">
            Illustrative
          </span>
        </div>

        {/* VARIANT A: SIDEBAR (Executive Navy/Slate Left Panel - Replicating Kickresume Elegant) */}
        {variant === 'sidebar' && (
          <div className="w-full h-full flex select-none pointer-events-none">
            {/* Left Accent Sidebar */}
            <div className="w-[34%] bg-[#142d4c] text-white p-2.5 sm:p-3 flex flex-col justify-between box-border">
              <div>
                <div className="w-7 h-7 rounded-full bg-[#1D4ED8] text-white flex items-center justify-center text-[10px] font-bold mx-auto mb-1.5 shadow-xs">
                  {resume.candidate.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)}
                </div>
                <div className="text-[5.8px] font-bold text-[#E2E8F0] uppercase tracking-wider border-b border-[#334155] pb-0.5 mb-1">
                  Contact
                </div>
                <div className="text-[4.8px] text-[#CBD5E1] leading-[1.35] space-y-0.5">
                  <div className="truncate">{resume.candidate.location}</div>
                  <div className="truncate">{resume.candidate.email}</div>
                  <div className="truncate">{resume.candidate.phone}</div>
                  <div className="text-[#93C5FD] truncate">
                    {resume.candidate.linkedin ? resume.candidate.linkedin.replace('linkedin.com/in/', '') : ''}
                  </div>
                </div>
              </div>

              <div>
                <div className="text-[5.8px] font-bold text-[#E2E8F0] uppercase tracking-wider border-b border-[#334155] pb-0.5 mb-1">
                  Core Skills
                </div>
                <div className="text-[4.8px] text-[#CBD5E1] leading-[1.35] space-y-1">
                  {resume.skills.slice(0, 3).map((s, idx) => (
                    <div key={idx}>
                      <span className="text-[#F8FAFC] font-semibold">{s.category}:</span>
                      <div className="truncate text-[#E2E8F0]">{s.skills.slice(0, 4).join(', ')}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-[5.8px] font-bold text-[#E2E8F0] uppercase tracking-wider border-b border-[#334155] pb-0.5 mb-1">
                  Education
                </div>
                <div className="text-[4.8px] text-[#CBD5E1] leading-[1.3]">
                  <div className="font-semibold text-white truncate">{resume.education[0]?.degree}</div>
                  <div className="text-[#E2E8F0] truncate">{resume.education[0]?.school}</div>
                </div>
              </div>
            </div>

            {/* Right Main Canvas */}
            <div className="w-[66%] p-2.5 sm:p-3 flex flex-col justify-between box-border text-[#1E293B]">
              <div>
                <h4 className="text-[11px] font-extrabold text-[#0F172A] leading-tight tracking-tight">
                  {resume.candidate.name}
                </h4>
                <p className="text-[5.8px] font-semibold text-[#1D4ED8] mt-0.5 leading-none">
                  {resume.candidate.title}
                </p>
                <div className="h-[1.5px] bg-[#2563EB] w-6 my-1" />
                <p className="text-[5px] leading-[1.35] text-[#475569] line-clamp-2">
                  {resume.summary}
                </p>
              </div>

              <div>
                <div className="text-[5.8px] font-bold uppercase tracking-wider text-[#0F172A] border-b border-[#E2E8F0] pb-0.5 mb-1">
                  Experience
                </div>
                {exp1 && (
                  <div className="mb-1">
                    <div className="flex justify-between items-baseline text-[5.2px] font-bold text-[#0F172A]">
                      <span className="truncate max-w-[110px]">{exp1.title}</span>
                      <span className="text-[4.6px] text-[#475569] font-normal shrink-0">
                        {exp1.startDate} &ndash; {exp1.current ? 'Present' : exp1.endDate}
                      </span>
                    </div>
                    <div className="text-[4.8px] text-[#475569] italic mb-0.5">
                      {exp1.company} &bull; {exp1.location}
                    </div>
                    <ul className="space-y-0.5">
                      {exp1.bullets.slice(0, 3).map((b, idx) => (
                        <li key={idx} className="text-[4.8px] leading-[1.3] text-[#334155] flex items-start gap-0.5">
                          <span className="text-[#475569] shrink-0">&bull;</span>
                          <span className="line-clamp-2">{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {exp2 && (
                  <div>
                    <div className="flex justify-between items-baseline text-[5.2px] font-bold text-[#0F172A]">
                      <span className="truncate max-w-[110px]">{exp2.title}</span>
                      <span className="text-[4.6px] text-[#475569] font-normal shrink-0">
                        {exp2.startDate} &ndash; {exp2.endDate}
                      </span>
                    </div>
                    <div className="text-[4.8px] text-[#475569] italic mb-0.5">
                      {exp2.company} &bull; {exp2.location}
                    </div>
                    <ul className="space-y-0.5">
                      {exp2.bullets.slice(0, 2).map((b, idx) => (
                        <li key={idx} className="text-[4.8px] leading-[1.3] text-[#334155] flex items-start gap-0.5">
                          <span className="text-[#475569] shrink-0">&bull;</span>
                          <span className="line-clamp-2">{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {proj1 && (
                <div>
                  <div className="text-[5.8px] font-bold uppercase tracking-wider text-[#0F172A] border-b border-[#E2E8F0] pb-0.5 mb-1">
                    Key Project
                  </div>
                  <div className="text-[5.2px] font-bold text-[#0F172A] truncate">
                    {proj1.name}
                  </div>
                  {proj1.highlights?.[0] && (
                    <div className="text-[4.8px] leading-[1.3] text-[#334155] line-clamp-1">
                      {proj1.highlights[0]}
                    </div>
                  )}
                </div>
              )}

              <div className="border-t border-[#E2E8F0] pt-1 flex justify-between items-center text-[4.5px] text-[#475569]">
                <span>ATS Score: {resume.atsScore}/100</span>
                <span>Verified Executive Sidebar</span>
              </div>
            </div>
          </div>
        )}

        {/* VARIANT B: DOUBLE COLUMN (Modern Creative Two-Column - Experience Left, Skills Right) */}
        {variant === 'double-column' && (
          <div className="w-full h-full p-2.5 sm:p-3 flex flex-col justify-between box-border select-none pointer-events-none">
            {/* Top Full-width Header */}
            <div className="flex justify-between items-end border-b border-[#0F172A] pb-1">
              <div>
                <h4 className="text-[11px] font-extrabold text-[#0F172A] leading-tight tracking-tight">
                  {resume.candidate.name}
                </h4>
                <p className="text-[5.8px] font-semibold text-[#047857] mt-0.5 leading-none">
                  {resume.candidate.title}
                </p>
              </div>
              <div className="text-[4.8px] text-[#475569] text-right leading-[1.3]">
                <div>{resume.candidate.location} &bull; {resume.candidate.phone}</div>
                <div className="text-[#047857] truncate font-medium">{resume.candidate.email}</div>
              </div>
            </div>

            {/* Two-Column Body */}
            <div className="flex gap-2 flex-1 py-1">
              {/* Left Column (64% - Summary & Experience) */}
              <div className="w-[64%] flex flex-col justify-between pr-1">
                <div>
                  <div className="text-[5.8px] font-bold uppercase tracking-wider text-[#0F172A] border-b border-[#CBD5E1] pb-0.5 mb-1">
                    Profile Summary
                  </div>
                  <p className="text-[4.8px] leading-[1.35] text-[#475569] line-clamp-2">
                    {resume.summary}
                  </p>
                </div>

                <div>
                  <div className="text-[5.8px] font-bold uppercase tracking-wider text-[#0F172A] border-b border-[#CBD5E1] pb-0.5 mb-1">
                    Experience
                  </div>
                  {exp1 && (
                    <div className="mb-1">
                      <div className="flex justify-between items-baseline text-[5px] font-bold text-[#0F172A]">
                        <span className="truncate max-w-[100px]">{exp1.title}</span>
                        <span className="text-[#475569] font-normal text-[4.5px] shrink-0">
                          {exp1.startDate} &ndash; {exp1.current ? 'Present' : exp1.endDate}
                        </span>
                      </div>
                      <div className="text-[4.8px] text-[#475569] italic mb-0.5">{exp1.company}</div>
                      <ul className="space-y-0.5">
                        {exp1.bullets.slice(0, 3).map((b, idx) => (
                          <li key={idx} className="text-[4.8px] leading-[1.3] text-[#334155] flex items-start gap-0.5">
                            <span className="text-[#475569] shrink-0">&bull;</span>
                            <span className="line-clamp-2">{b}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {exp2 && (
                    <div>
                      <div className="flex justify-between items-baseline text-[5px] font-bold text-[#0F172A]">
                        <span className="truncate max-w-[100px]">{exp2.title}</span>
                        <span className="text-[#475569] font-normal text-[4.5px] shrink-0">
                          {exp2.startDate} &ndash; {exp2.endDate}
                        </span>
                      </div>
                      <div className="text-[4.8px] text-[#475569] italic mb-0.5">{exp2.company}</div>
                      <ul className="space-y-0.5">
                        {exp2.bullets.slice(0, 2).map((b, idx) => (
                          <li key={idx} className="text-[4.8px] leading-[1.3] text-[#334155] flex items-start gap-0.5">
                            <span className="text-[#475569] shrink-0">&bull;</span>
                            <span className="line-clamp-2">{b}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {proj1 && (
                  <div>
                    <div className="text-[5.8px] font-bold uppercase tracking-wider text-[#0F172A] border-b border-[#CBD5E1] pb-0.5 mb-1">
                      Key Project
                    </div>
                    <div className="text-[5px] font-bold text-[#0F172A] truncate">{proj1.name}</div>
                    {proj1.highlights?.[0] && (
                      <div className="text-[4.8px] leading-[1.3] text-[#475569] line-clamp-1">
                        {proj1.highlights[0]}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Right Column (36% - Skills & Education) */}
              <div className="w-[36%] flex flex-col justify-between border-l border-[#E2E8F0] pl-1.5">
                <div>
                  <div className="text-[5.8px] font-bold uppercase tracking-wider text-[#0F172A] border-b border-[#CBD5E1] pb-0.5 mb-1">
                    Technical Skills
                  </div>
                  <div className="space-y-1">
                    {resume.skills.slice(0, 4).map((s, idx) => (
                      <div key={idx} className="text-[4.8px] leading-[1.25]">
                        <span className="font-bold text-[#0F172A]">{s.category}:</span>
                        <div className="text-[#475569] truncate">{s.skills.slice(0, 3).join(', ')}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-[5.8px] font-bold uppercase tracking-wider text-[#0F172A] border-b border-[#CBD5E1] pb-0.5 mb-1">
                    Education
                  </div>
                  <div className="text-[4.8px] text-[#334155] leading-tight">
                    <div className="font-bold text-[#0F172A] truncate">{resume.education[0]?.degree}</div>
                    <div className="text-[#475569] truncate">{resume.education[0]?.school}</div>
                    <div className="text-[#047857] font-medium">{resume.education[0]?.graduationDate}</div>
                  </div>
                </div>

                {certs && certs.length > 0 && (
                  <div>
                    <div className="text-[5.8px] font-bold uppercase tracking-wider text-[#0F172A] border-b border-[#CBD5E1] pb-0.5 mb-1">
                      Certifications
                    </div>
                    <div className="text-[4.8px] text-[#475569] space-y-0.5">
                      {certs.slice(0, 2).map((c, idx) => (
                        <div key={idx} className="truncate">&bull; {c}</div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom ATS Stamp */}
            <div className="border-t border-[#E2E8F0] pt-1 flex justify-between items-center text-[4.5px] text-[#475569]">
              <span>Verified ATS Double-Column</span>
              <span>ATS Score: {resume.atsScore}/100</span>
            </div>
          </div>
        )}

        {/* VARIANT C: CLEAN MODERN (Modern Tech - Left Accent Bars & Badge Skills) */}
        {variant === 'clean-modern' && (
          <div className="w-full h-full p-2.5 sm:p-3 flex flex-col justify-between box-border select-none pointer-events-none text-zinc-900">
            {/* Modern Left-Aligned Header with Bottom Accent Rule */}
            <div
              className="pb-1 border-b-2"
              style={{ borderColor: resume.brandColor || '#2563EB' }}
            >
              <h4
                className="text-[11px] font-extrabold leading-tight tracking-tight truncate"
                style={{ color: '#1E3A8A' }}
              >
                {resume.candidate.name}
              </h4>
              <p className="text-[5.8px] font-semibold text-zinc-800 mt-0.5 leading-none">
                {resume.candidate.title}
              </p>
              <div className="text-[4.8px] text-zinc-600 mt-0.5 flex flex-wrap gap-x-1.5 leading-none">
                <span>{resume.candidate.location}</span>
                <span>&bull;</span>
                <span>{resume.candidate.email}</span>
                <span>&bull;</span>
                <span>{resume.candidate.phone}</span>
                {resume.candidate.linkedin && (
                  <>
                    <span>&bull;</span>
                    <span className="truncate">{resume.candidate.linkedin.replace('linkedin.com/in/', '')}</span>
                  </>
                )}
              </div>
            </div>

            {/* Professional Summary */}
            <div>
              <div
                className="text-[5.8px] font-bold uppercase tracking-wider pl-1 border-l-2 mb-1"
                style={{ borderColor: resume.brandColor || '#2563EB', color: '#0F172A' }}
              >
                Professional Summary
              </div>
              <p className="text-[4.9px] leading-[1.35] text-zinc-700 line-clamp-2">
                {resume.summary}
              </p>
            </div>

            {/* Experience */}
            <div>
              <div
                className="text-[5.8px] font-bold uppercase tracking-wider pl-1 border-l-2 mb-1"
                style={{ borderColor: resume.brandColor || '#2563EB', color: '#0F172A' }}
              >
                Experience
              </div>
              {exp1 && (
                <div className="mb-1">
                  <div className="flex justify-between items-baseline text-[5.2px] font-bold text-zinc-950">
                    <span className="truncate max-w-[125px]">{exp1.title}</span>
                    <span className="text-[4.6px] text-zinc-700 font-normal shrink-0">
                      {exp1.startDate} &ndash; {exp1.current ? 'Present' : exp1.endDate}
                    </span>
                  </div>
                  <div
                    className="text-[4.8px] font-medium mb-0.5"
                    style={{ color: '#1E3A8A' }}
                  >
                    {exp1.company} &bull; <span className="text-zinc-700 font-normal">{exp1.location}</span>
                  </div>
                  <ul className="space-y-0.5">
                    {exp1.bullets.slice(0, 3).map((b, idx) => (
                      <li key={idx} className="text-[4.8px] leading-[1.3] text-zinc-700 flex items-start gap-0.5">
                        <span className="text-zinc-700 shrink-0">&bull;</span>
                        <span className="line-clamp-2">{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {exp2 && (
                <div>
                  <div className="flex justify-between items-baseline text-[5.2px] font-bold text-zinc-950">
                    <span className="truncate max-w-[125px]">{exp2.title}</span>
                    <span className="text-[4.6px] text-zinc-700 font-normal shrink-0">
                      {exp2.startDate} &ndash; {exp2.endDate}
                    </span>
                  </div>
                  <div
                    className="text-[4.8px] font-medium mb-0.5"
                    style={{ color: '#1E3A8A' }}
                  >
                    {exp2.company} &bull; <span className="text-zinc-700 font-normal">{exp2.location}</span>
                  </div>
                  <ul className="space-y-0.5">
                    {exp2.bullets.slice(0, 2).map((b, idx) => (
                      <li key={idx} className="text-[4.8px] leading-[1.3] text-zinc-700 flex items-start gap-0.5">
                        <span className="text-zinc-700 shrink-0">&bull;</span>
                        <span className="line-clamp-2">{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Technical Skills (Badge Pills) */}
            <div>
              <div
                className="text-[5.8px] font-bold uppercase tracking-wider pl-1 border-l-2 mb-1"
                style={{ borderColor: resume.brandColor || '#2563EB', color: '#0F172A' }}
              >
                Technical Skills
              </div>
              <div className="flex flex-wrap gap-1">
                {resume.skills.flatMap((cat) => cat.skills).slice(0, 8).map((skill, idx) => (
                  <span
                    key={idx}
                    className="text-[4.5px] px-1 py-0.2 rounded bg-zinc-100 text-zinc-700 border border-zinc-200"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Education */}
            {resume.education?.[0] && (
              <div>
                <div
                  className="text-[5.8px] font-bold uppercase tracking-wider pl-1 border-l-2 mb-0.5"
                  style={{ borderColor: resume.brandColor || '#2563EB', color: '#0F172A' }}
                >
                  Education
                </div>
                <div className="flex justify-between items-baseline text-[5px] text-zinc-900 font-semibold">
                  <span className="truncate max-w-[145px]">
                    {resume.education[0].degree} &ndash; {resume.education[0].school}
                  </span>
                  <span className="text-[4.5px] text-zinc-700 font-normal shrink-0">
                    {resume.education[0].graduationDate}
                  </span>
                </div>
              </div>
            )}

            {/* Bottom ATS Marker */}
            <div className="border-t border-zinc-200 pt-1 flex justify-between items-center text-[4.5px] text-zinc-700">
              <span>Verified Modern Technical Standard</span>
              <span>ATS Score: {resume.atsScore}/100</span>
            </div>
          </div>
        )}

        {/* VARIANT D: EXECUTIVE LEADER (C-Suite / Director Format) */}
        {variant === 'executive' && (
          <div className="w-full h-full p-2.5 sm:p-3 flex flex-col justify-between box-border select-none pointer-events-none text-zinc-900">
            {/* Executive Header */}
            <div className="pb-1 border-b border-zinc-300">
              <h4 className="text-[11.5px] font-black uppercase tracking-tight text-zinc-950 leading-tight">
                {resume.candidate.name}
              </h4>
              <p
                className="text-[5.5px] font-bold tracking-wider uppercase mt-0.5 leading-none"
                style={{ color: '#1E3A8A' }}
              >
                {resume.candidate.title}
              </p>
              <div className="text-[4.8px] text-zinc-600 mt-0.5 leading-none">
                {resume.candidate.location} &bull; {resume.candidate.email} &bull; {resume.candidate.phone}
              </div>
            </div>

            {/* Executive Summary */}
            <div>
              <div
                className="text-[5.8px] font-bold uppercase tracking-wider pl-1 border-l-2 mb-1"
                style={{ borderColor: resume.brandColor || '#1E3A8A', color: '#0F172A' }}
              >
                Executive Profile
              </div>
              <p className="text-[4.9px] leading-[1.35] text-zinc-700 line-clamp-2">
                {resume.summary}
              </p>
            </div>

            {/* Experience */}
            <div>
              <div
                className="text-[5.8px] font-bold uppercase tracking-wider pl-1 border-l-2 mb-1"
                style={{ borderColor: resume.brandColor || '#1E3A8A', color: '#0F172A' }}
              >
                Professional Leadership
              </div>
              {exp1 && (
                <div className="mb-1">
                  <div className="flex justify-between items-baseline text-[5.2px] font-bold text-zinc-950">
                    <span className="truncate max-w-[125px]">{exp1.title}</span>
                    <span className="text-[4.6px] text-zinc-700 font-normal shrink-0">
                      {exp1.startDate} &ndash; {exp1.current ? 'Present' : exp1.endDate}
                    </span>
                  </div>
                  <div className="text-[4.8px] text-zinc-600 italic mb-0.5">
                    {exp1.company} &bull; {exp1.location}
                  </div>
                  <ul className="space-y-0.5">
                    {exp1.bullets.slice(0, 3).map((b, idx) => (
                      <li key={idx} className="text-[4.8px] leading-[1.3] text-zinc-700 flex items-start gap-0.5">
                        <span className="text-zinc-700 shrink-0">&bull;</span>
                        <span className="line-clamp-2">{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {exp2 && (
                <div>
                  <div className="flex justify-between items-baseline text-[5.2px] font-bold text-zinc-950">
                    <span className="truncate max-w-[125px]">{exp2.title}</span>
                    <span className="text-[4.6px] text-zinc-700 font-normal shrink-0">
                      {exp2.startDate} &ndash; {exp2.endDate}
                    </span>
                  </div>
                  <div className="text-[4.8px] text-zinc-600 italic mb-0.5">
                    {exp2.company} &bull; {exp2.location}
                  </div>
                  <ul className="space-y-0.5">
                    {exp2.bullets.slice(0, 2).map((b, idx) => (
                      <li key={idx} className="text-[4.8px] leading-[1.3] text-zinc-700 flex items-start gap-0.5">
                        <span className="text-zinc-700 shrink-0">&bull;</span>
                        <span className="line-clamp-2">{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Core Competencies */}
            <div>
              <div
                className="text-[5.8px] font-bold uppercase tracking-wider pl-1 border-l-2 mb-1"
                style={{ borderColor: resume.brandColor || '#1E3A8A', color: '#0F172A' }}
              >
                Core Competencies &amp; Frameworks
              </div>
              <div className="space-y-0.5">
                {resume.skills.slice(0, 3).map((s, idx) => (
                  <div key={idx} className="text-[4.8px] leading-[1.25] text-zinc-700 truncate">
                    <strong className="text-zinc-900">{s.category}: </strong>
                    {s.skills.join(', ')}
                  </div>
                ))}
              </div>
            </div>

            {/* Education & Credentials */}
            {resume.education?.[0] && (
              <div>
                <div
                  className="text-[5.8px] font-bold uppercase tracking-wider pl-1 border-l-2 mb-0.5"
                  style={{ borderColor: resume.brandColor || '#1E3A8A', color: '#0F172A' }}
                >
                  Education &amp; Credentials
                </div>
                <div className="flex justify-between items-baseline text-[5px] text-zinc-900 font-semibold">
                  <span className="truncate max-w-[145px]">
                    {resume.education[0].degree} &ndash; {resume.education[0].school}
                  </span>
                  <span className="text-[4.5px] text-zinc-700 font-normal shrink-0">
                    {resume.education[0].graduationDate}
                  </span>
                </div>
              </div>
            )}

            {/* Bottom ATS Marker */}
            <div className="border-t border-zinc-200 pt-1 flex justify-between items-center text-[4.5px] text-zinc-700">
              <span>Verified Executive Leadership Standard</span>
              <span>ATS Score: {resume.atsScore}/100</span>
            </div>
          </div>
        )}

        {/* VARIANT E: JAKE ATS (LaTeX Silicon Valley Standard) */}
        {variant === 'jake-ats' && (
          <div className="w-full h-full p-2.5 sm:p-3 flex flex-col justify-between box-border select-none pointer-events-none text-zinc-900 font-serif">
            {/* Centered LaTeX Header */}
            <div className="text-center pb-1">
              <h4 className="font-bold text-[11.5px] uppercase tracking-tight text-zinc-950 leading-none">
                {resume.candidate.name}
              </h4>
              <p className="text-[5.5px] italic text-zinc-700 mt-0.5 leading-none">
                {resume.candidate.title}
              </p>
              <div className="text-[4.8px] text-zinc-600 mt-0.5 font-sans leading-none">
                {resume.candidate.location} &bull; {resume.candidate.email} &bull; {resume.candidate.phone}
              </div>
            </div>

            {/* Experience */}
            <div>
              <div className="text-[6px] font-bold uppercase tracking-wider text-zinc-950 border-b border-zinc-900 pb-0.5 mb-1">
                Experience
              </div>
              {exp1 && (
                <div className="mb-1 font-sans">
                  <div className="flex justify-between items-baseline text-[5.2px] font-bold text-zinc-950">
                    <span className="truncate max-w-[125px]">{exp1.title}</span>
                    <span className="text-[4.6px] text-zinc-600 font-normal shrink-0">
                      {exp1.startDate} &ndash; {exp1.current ? 'Present' : exp1.endDate}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline text-[4.8px] text-zinc-700 italic mb-0.5">
                    <span>{exp1.company}</span>
                    <span className="text-zinc-700 not-italic">{exp1.location}</span>
                  </div>
                  <ul className="space-y-0.5">
                    {exp1.bullets.slice(0, 3).map((b, idx) => (
                      <li key={idx} className="text-[4.8px] leading-[1.3] text-zinc-800 flex items-start gap-0.5">
                        <span className="text-zinc-700 shrink-0">&bull;</span>
                        <span className="line-clamp-2">{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {exp2 && (
                <div className="font-sans">
                  <div className="flex justify-between items-baseline text-[5.2px] font-bold text-zinc-950">
                    <span className="truncate max-w-[125px]">{exp2.title}</span>
                    <span className="text-[4.6px] text-zinc-600 font-normal shrink-0">
                      {exp2.startDate} &ndash; {exp2.endDate}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline text-[4.8px] text-zinc-700 italic mb-0.5">
                    <span>{exp2.company}</span>
                    <span className="text-zinc-700 not-italic">{exp2.location}</span>
                  </div>
                  <ul className="space-y-0.5">
                    {exp2.bullets.slice(0, 2).map((b, idx) => (
                      <li key={idx} className="text-[4.8px] leading-[1.3] text-zinc-800 flex items-start gap-0.5">
                        <span className="text-zinc-700 shrink-0">&bull;</span>
                        <span className="line-clamp-2">{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Projects */}
            {proj1 && (
              <div>
                <div className="text-[6px] font-bold uppercase tracking-wider text-zinc-950 border-b border-zinc-900 pb-0.5 mb-1">
                  Projects
                </div>
                <div className="text-[5.2px] font-bold text-zinc-950 font-sans truncate">
                  {proj1.name}{' '}
                  <span className="font-normal text-zinc-600">&ndash; {proj1.description}</span>
                </div>
              </div>
            )}

            {/* Technical Skills */}
            <div>
              <div className="text-[6px] font-bold uppercase tracking-wider text-zinc-950 border-b border-zinc-900 pb-0.5 mb-1">
                Technical Skills
              </div>
              <div className="space-y-0.5 font-sans">
                {resume.skills.slice(0, 3).map((s, idx) => (
                  <div key={idx} className="text-[4.8px] leading-[1.25] text-zinc-800 truncate">
                    <strong className="text-zinc-950">{s.category}: </strong>
                    {s.skills.join(', ')}
                  </div>
                ))}
              </div>
            </div>

            {/* Education */}
            {resume.education?.[0] && (
              <div>
                <div className="text-[6px] font-bold uppercase tracking-wider text-zinc-950 border-b border-zinc-900 pb-0.5 mb-0.5">
                  Education
                </div>
                <div className="flex justify-between items-baseline text-[5px] text-zinc-900 font-sans font-semibold">
                  <span className="truncate max-w-[145px]">
                    {resume.education[0].school} &ndash; {resume.education[0].degree}
                  </span>
                  <span className="text-[4.5px] text-zinc-600 font-normal shrink-0">
                    {resume.education[0].graduationDate}
                  </span>
                </div>
              </div>
            )}

            {/* Bottom ATS Marker */}
            <div className="border-t border-zinc-900 pt-1 flex justify-between items-center text-[4.5px] text-zinc-600 font-sans">
              <span>Verified LaTeX ATS Standard (Jake)</span>
              <span>ATS Score: {resume.atsScore}/100</span>
            </div>
          </div>
        )}

        {/* VARIANT F: IVY LEAGUE (Academic Serif & Clean Rules - Harvard / Ivy League) */}
        {variant === 'ivy-league' && (
          <div className="w-full h-full p-2.5 sm:p-3 flex flex-col justify-between box-border font-serif select-none pointer-events-none text-zinc-900">
            {/* Centered Serif Header */}
            <div className="text-center border-b border-double border-zinc-900 pb-1">
              <h4 className="font-bold text-[11.5px] tracking-wide text-zinc-950 uppercase leading-none">
                {resume.candidate.name}
              </h4>
              <p className="text-[5.5px] italic text-zinc-700 mt-0.5 leading-none">
                {resume.candidate.title}
              </p>
              <p className="text-[4.8px] text-zinc-600 mt-0.5 font-sans leading-none">
                {resume.candidate.location} &bull; {resume.candidate.email} &bull; {resume.candidate.phone}
              </p>
            </div>

            {/* Summary */}
            <div>
              <div className="text-[6px] font-bold tracking-widest text-zinc-950 uppercase border-b border-zinc-900 pb-0.5 mb-1">
                Executive Profile
              </div>
              <p className="text-[4.9px] leading-[1.35] text-zinc-800 line-clamp-2">
                {resume.summary}
              </p>
            </div>

            {/* Experience */}
            <div>
              <div className="text-[6px] font-bold tracking-widest text-zinc-950 uppercase border-b border-zinc-900 pb-0.5 mb-1">
                Professional Experience
              </div>
              {exp1 && (
                <div className="mb-1">
                  <div className="flex justify-between items-baseline text-[5.2px] font-bold text-zinc-950">
                    <span className="truncate max-w-[130px]">{exp1.title}</span>
                    <span className="italic font-normal text-[4.6px] shrink-0 font-sans">
                      {exp1.startDate} &ndash; {exp1.current ? 'Present' : exp1.endDate}
                    </span>
                  </div>
                  <div className="text-[4.8px] text-zinc-600 font-sans italic mb-0.5">
                    {exp1.company} &bull; {exp1.location}
                  </div>
                  <ul className="space-y-0.5 font-sans">
                    {exp1.bullets.slice(0, 3).map((b, idx) => (
                      <li key={idx} className="text-[4.8px] leading-[1.3] text-zinc-800 flex items-start gap-0.5">
                        <span className="text-zinc-700 shrink-0">&bull;</span>
                        <span className="line-clamp-2">{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {exp2 && (
                <div>
                  <div className="flex justify-between items-baseline text-[5.2px] font-bold text-zinc-950">
                    <span className="truncate max-w-[130px]">{exp2.title}</span>
                    <span className="italic font-normal text-[4.6px] shrink-0 font-sans">
                      {exp2.startDate} &ndash; {exp2.endDate}
                    </span>
                  </div>
                  <div className="text-[4.8px] text-zinc-600 font-sans italic mb-0.5">
                    {exp2.company} &bull; {exp2.location}
                  </div>
                  <ul className="space-y-0.5 font-sans">
                    {exp2.bullets.slice(0, 2).map((b, idx) => (
                      <li key={idx} className="text-[4.8px] leading-[1.3] text-zinc-800 flex items-start gap-0.5">
                        <span className="text-zinc-700 shrink-0">&bull;</span>
                        <span className="line-clamp-2">{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Education */}
            <div>
              <div className="text-[6px] font-bold tracking-widest text-zinc-950 uppercase border-b border-zinc-900 pb-0.5 mb-1">
                Education &amp; Honors
              </div>
              <div className="space-y-0.5">
                {resume.education.slice(0, 2).map((edu, idx) => (
                  <div key={idx} className="flex justify-between items-baseline text-[4.9px] text-zinc-900">
                    <span className="truncate max-w-[150px]">
                      {edu.degree} in {edu.field} &ndash; {edu.school}
                    </span>
                    <span className="font-sans text-[4.5px] text-zinc-600 shrink-0">{edu.graduationDate}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Skills */}
            <div>
              <div className="text-[6px] font-bold tracking-widest text-zinc-950 uppercase border-b border-zinc-900 pb-0.5 mb-1">
                Core Competencies &amp; Frameworks
              </div>
              <div className="space-y-0.5 font-sans">
                {resume.skills.slice(0, 3).map((s, idx) => (
                  <div key={idx} className="text-[4.8px] leading-[1.3] text-zinc-800 truncate">
                    <strong className="text-zinc-950">{s.category}:</strong> {s.skills.join(', ')}
                  </div>
                ))}
              </div>
            </div>

            {/* Certifications */}
            {certs && certs.length > 0 && (
              <div>
                <div className="text-[6px] font-bold tracking-widest text-zinc-950 uppercase border-b border-zinc-900 pb-0.5 mb-0.5">
                  Certifications
                </div>
                <div className="text-[4.8px] text-zinc-800 truncate font-sans">
                  &bull; {certs.slice(0, 3).join(' &bull; ')}
                </div>
              </div>
            )}

            {/* Bottom ATS Marker */}
            <div className="border-t border-zinc-700 pt-1 flex justify-between items-center text-[4.5px] text-zinc-600 font-sans">
              <span>Ivy League Academic Standard</span>
              <span>ATS Score: {resume.atsScore}/100</span>
            </div>
          </div>
        )}

        {/* VARIANT G: CLASSIC SINGLE-COLUMN (High-Density Silicon Valley Classic ATS) */}
        {variant === 'classic' && (
          <div className="w-full h-full p-2.5 sm:p-3 flex flex-col justify-between box-border select-none pointer-events-none text-zinc-900">
            {/* Header */}
            <div className="text-center border-b border-zinc-200 pb-1">
              <h4 className="font-serif font-bold text-[11px] sm:text-[12px] text-zinc-950 tracking-tight leading-tight">
                {resume.candidate.name}
              </h4>
              <p className="text-[5.8px] font-semibold text-[#1D4ED8] mt-0.5 leading-none">
                {resume.candidate.title}
              </p>
              <p className="text-[5px] text-zinc-600 mt-0.5 leading-none">
                {resume.candidate.location} &bull; {resume.candidate.email} &bull; {resume.candidate.phone}
              </p>
              <p className="text-[4.8px] text-[#1D4ED8] mt-0.5 leading-none font-medium truncate">
                {resume.candidate.linkedin} {resume.candidate.github ? `• ${resume.candidate.github}` : ''}
              </p>
            </div>

            {/* Summary */}
            <div>
              <div className="text-[6px] font-bold tracking-wider text-zinc-950 uppercase border-b border-zinc-200 pb-0.5 mb-1">
                Professional Summary
              </div>
              <p className="text-[5px] leading-[1.35] text-zinc-700 line-clamp-2">
                {resume.summary}
              </p>
            </div>

            {/* Experience */}
            <div>
              <div className="text-[6px] font-bold tracking-wider text-zinc-950 uppercase border-b border-zinc-200 pb-0.5 mb-1">
                Professional Experience
              </div>
              {exp1 && (
                <div className="mb-1">
                  <div className="flex justify-between items-baseline text-[5.2px] font-bold text-zinc-950">
                    <span className="truncate max-w-[130px]">{exp1.title}</span>
                    <span className="text-[4.6px] text-zinc-700 font-normal shrink-0">
                      {exp1.startDate} &ndash; {exp1.current ? 'Present' : exp1.endDate}
                    </span>
                  </div>
                  <div className="text-[4.8px] text-zinc-600 italic mb-0.5">
                    {exp1.company} &bull; {exp1.location}
                  </div>
                  <ul className="space-y-0.5">
                    {exp1.bullets.slice(0, 3).map((b, idx) => (
                      <li key={idx} className="text-[4.8px] leading-[1.3] text-zinc-700 flex items-start gap-0.5">
                        <span className="text-zinc-700 shrink-0">&bull;</span>
                        <span className="line-clamp-2">{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {exp2 && (
                <div>
                  <div className="flex justify-between items-baseline text-[5.2px] font-bold text-zinc-950">
                    <span className="truncate max-w-[130px]">{exp2.title}</span>
                    <span className="text-[4.6px] text-zinc-700 font-normal shrink-0">
                      {exp2.startDate} &ndash; {exp2.endDate}
                    </span>
                  </div>
                  <div className="text-[4.8px] text-zinc-600 italic mb-0.5">
                    {exp2.company} &bull; {exp2.location}
                  </div>
                  <ul className="space-y-0.5">
                    {exp2.bullets.slice(0, 2).map((b, idx) => (
                      <li key={idx} className="text-[4.8px] leading-[1.3] text-zinc-700 flex items-start gap-0.5">
                        <span className="text-zinc-700 shrink-0">&bull;</span>
                        <span className="line-clamp-2">{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Skills */}
            <div>
              <div className="text-[6px] font-bold tracking-wider text-zinc-950 uppercase border-b border-zinc-200 pb-0.5 mb-1">
                Core Skills &amp; Expertise
              </div>
              <div className="space-y-0.5">
                {resume.skills.slice(0, 4).map((s, idx) => (
                  <div key={idx} className="text-[4.8px] leading-[1.25] text-zinc-700 truncate">
                    <strong className="text-zinc-900">{s.category}: </strong>
                    {s.skills.join(', ')}
                  </div>
                ))}
              </div>
            </div>

            {/* Projects */}
            {proj1 && (
              <div>
                <div className="text-[6px] font-bold tracking-wider text-zinc-950 uppercase border-b border-zinc-200 pb-0.5 mb-1">
                  Key Projects &amp; Initiatives
                </div>
                <div className="text-[5.2px] font-bold text-zinc-950 truncate">
                  {proj1.name}{' '}
                  <span className="font-normal text-zinc-600">&ndash; {proj1.description}</span>
                </div>
                {proj1.highlights?.[0] && (
                  <div className="text-[4.8px] leading-[1.3] text-zinc-700 line-clamp-1 mt-0.5">
                    &bull; {proj1.highlights[0]}
                  </div>
                )}
              </div>
            )}

            {/* Education & Certifications */}
            <div>
              <div className="text-[6px] font-bold tracking-wider text-zinc-950 uppercase border-b border-zinc-200 pb-0.5 mb-1">
                Education &amp; Credentials
              </div>
              {resume.education?.[0] && (
                <div className="flex justify-between items-baseline text-[5px] text-zinc-900 font-semibold">
                  <span className="truncate max-w-[150px]">
                    {resume.education[0].degree} in {resume.education[0].field} &ndash; {resume.education[0].school}
                  </span>
                  <span className="text-[4.5px] text-zinc-700 font-normal shrink-0">
                    {resume.education[0].graduationDate}
                  </span>
                </div>
              )}
              {certs && certs.length > 0 && (
                <div className="text-[4.8px] text-zinc-700 truncate mt-0.5">
                  &bull; {certs.slice(0, 3).join(' &bull; ')}
                </div>
              )}
            </div>

            {/* Bottom ATS Marker */}
            <div className="border-t border-zinc-200 pt-1 flex justify-between items-center text-[4.5px] text-zinc-700">
              <span>Verified Single-Column ATS Format</span>
              <span>ATS Score: {resume.atsScore}/100</span>
            </div>
          </div>
        )}

        </div>

        {/* Hover / Focus Action Overlay */}
        <div className="absolute inset-0 bg-[#0D0F12]/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-2 p-3 sm:p-4 z-20">
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
            disabled={isCloning}
            onClick={(e) => {
              e.stopPropagation();
              onUseTemplate(resume);
            }}
            className="w-full py-1.5 px-3 rounded-lg bg-[#285FEA] text-white text-xs font-semibold shadow-md hover:bg-[#1E4BC8] flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-70"
          >
            {isCloning ? (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            <span>{isCloning ? 'Cloning Template...' : 'Use Full Template'}</span>
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
