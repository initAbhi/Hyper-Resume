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

// Map each company profile to a distinctive, high-end resume template variant
function getTemplateVariant(companyKey: string): 'double-column' | 'ivy-league' | 'sidebar' | 'classic' {
  if (['spotify', 'airbnb', 'figma', 'bytedance', 'uber', 'apple'].includes(companyKey)) {
    return 'double-column';
  }
  if (['goldman', 'citadel', 'deloitte', 'accenture', 'chime'].includes(companyKey)) {
    return 'ivy-league';
  }
  if (['netflix', 'stripe', 'sony', 'disney', 'tesla'].includes(companyKey)) {
    return 'sidebar';
  }
  return 'classic';
}

export function SampleResumeCard({ resume, onPreview, onUseTemplate, onAdapt }: SampleResumeCardProps) {
  const variant = getTemplateVariant(resume.companyKey);
  const exp1 = resume.experience[0];
  const exp2 = resume.experience[1];
  const proj1 = resume.projects?.[0];
  const certs = resume.certifications;

  return (
    <div
      onClick={() => onPreview(resume)}
      className="group relative flex flex-col rounded-xl bg-white dark:bg-[#14171C] border border-[#E2E5E9] dark:border-[#252A33] hover:border-[#285FEA]/50 dark:hover:border-[#285FEA]/60 shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer select-none"
    >
      {/* 1. Miniature ATS Document Preview Sheet (100% full-page canvas with ZERO blank voids) */}
      <div className="relative bg-white text-zinc-900 aspect-[8.5/11] overflow-hidden flex flex-col border-b border-[#E2E5E9] dark:border-[#252A33]">
        {/* Subtle Illustrative Badge */}
        <div className="absolute top-1.5 right-1.5 z-10 pointer-events-none">
          <span className="text-[7px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-zinc-100/90 text-zinc-500 border border-zinc-200">
            Illustrative
          </span>
        </div>

        {/* VARIANT A: SIDEBAR (Executive Navy/Slate Left Panel - Replicating Kickresume Elegant) */}
        {variant === 'sidebar' && (
          <div className="w-full h-full flex select-none pointer-events-none">
            {/* Left Accent Sidebar */}
            <div className="w-[34%] bg-[#1E293B] text-white p-2.5 sm:p-3 flex flex-col justify-between box-border">
              <div>
                <div className="w-7 h-7 rounded-full bg-[#3B82F6] text-white flex items-center justify-center text-[10px] font-bold mx-auto mb-1.5 shadow-xs">
                  {resume.candidate.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)}
                </div>
                <div className="text-[5.8px] font-bold text-[#94A3B8] uppercase tracking-wider border-b border-[#334155] pb-0.5 mb-1">
                  Contact
                </div>
                <div className="text-[4.8px] text-[#CBD5E1] leading-[1.35] space-y-0.5">
                  <div className="truncate">{resume.candidate.location}</div>
                  <div className="truncate">{resume.candidate.email}</div>
                  <div className="truncate">{resume.candidate.phone}</div>
                  <div className="text-[#60A5FA] truncate">
                    {resume.candidate.linkedin ? resume.candidate.linkedin.replace('linkedin.com/in/', '') : ''}
                  </div>
                </div>
              </div>

              <div>
                <div className="text-[5.8px] font-bold text-[#94A3B8] uppercase tracking-wider border-b border-[#334155] pb-0.5 mb-1">
                  Core Skills
                </div>
                <div className="text-[4.8px] text-[#CBD5E1] leading-[1.35] space-y-1">
                  {resume.skills.slice(0, 3).map((s, idx) => (
                    <div key={idx}>
                      <span className="text-[#F8FAFC] font-semibold">{s.category}:</span>
                      <div className="truncate text-[#94A3B8]">{s.skills.slice(0, 4).join(', ')}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-[5.8px] font-bold text-[#94A3B8] uppercase tracking-wider border-b border-[#334155] pb-0.5 mb-1">
                  Education
                </div>
                <div className="text-[4.8px] text-[#CBD5E1] leading-[1.3]">
                  <div className="font-semibold text-white truncate">{resume.education[0]?.degree}</div>
                  <div className="text-[#94A3B8] truncate">{resume.education[0]?.school}</div>
                </div>
              </div>
            </div>

            {/* Right Main Canvas */}
            <div className="w-[66%] p-2.5 sm:p-3 flex flex-col justify-between box-border text-[#1E293B]">
              <div>
                <h4 className="text-[11px] font-extrabold text-[#0F172A] leading-tight tracking-tight">
                  {resume.candidate.name}
                </h4>
                <p className="text-[5.8px] font-semibold text-[#2563EB] mt-0.5 leading-none">
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
                      <span className="text-[4.6px] text-[#64748B] font-normal shrink-0">
                        {exp1.startDate} &ndash; {exp1.current ? 'Present' : exp1.endDate}
                      </span>
                    </div>
                    <div className="text-[4.8px] text-[#64748B] italic mb-0.5">
                      {exp1.company} &bull; {exp1.location}
                    </div>
                    <ul className="space-y-0.5">
                      {exp1.bullets.slice(0, 3).map((b, idx) => (
                        <li key={idx} className="text-[4.8px] leading-[1.3] text-[#334155] flex items-start gap-0.5">
                          <span className="text-[#94A3B8] shrink-0">&bull;</span>
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
                      <span className="text-[4.6px] text-[#64748B] font-normal shrink-0">
                        {exp2.startDate} &ndash; {exp2.endDate}
                      </span>
                    </div>
                    <div className="text-[4.8px] text-[#64748B] italic mb-0.5">
                      {exp2.company} &bull; {exp2.location}
                    </div>
                    <ul className="space-y-0.5">
                      {exp2.bullets.slice(0, 2).map((b, idx) => (
                        <li key={idx} className="text-[4.8px] leading-[1.3] text-[#334155] flex items-start gap-0.5">
                          <span className="text-[#94A3B8] shrink-0">&bull;</span>
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

              <div className="border-t border-[#E2E8F0] pt-1 flex justify-between items-center text-[4.5px] text-[#94A3B8]">
                <span>ATS Score: {resume.atsScore}/100</span>
                <span>Verified Executive Sidebar</span>
              </div>
            </div>
          </div>
        )}

        {/* VARIANT B: DOUBLE COLUMN (Modern Creative Two-Column - Replicating Kickresume Double Column) */}
        {variant === 'double-column' && (
          <div className="w-full h-full p-2.5 sm:p-3 flex flex-col justify-between box-border select-none pointer-events-none">
            {/* Top Full-width Header */}
            <div className="flex justify-between items-end border-b border-[#0F172A] pb-1">
              <div>
                <h4 className="text-[11px] font-extrabold text-[#0F172A] leading-tight tracking-tight">
                  {resume.candidate.name}
                </h4>
                <p className="text-[5.8px] font-semibold text-[#059669] mt-0.5 leading-none">
                  {resume.candidate.title}
                </p>
              </div>
              <div className="text-[4.8px] text-[#64748B] text-right leading-[1.3]">
                <div>{resume.candidate.location} &bull; {resume.candidate.phone}</div>
                <div className="text-[#059669] truncate font-medium">{resume.candidate.email}</div>
              </div>
            </div>

            {/* Two-Column Body */}
            <div className="flex gap-2 flex-1 py-1">
              {/* Left Column (35%) */}
              <div className="w-[35%] flex flex-col justify-between border-r border-[#E2E8F0] pr-1.5">
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
                    <div className="text-[#64748B] truncate">{resume.education[0]?.school}</div>
                    <div className="text-[#059669] font-medium">{resume.education[0]?.graduationDate}</div>
                  </div>
                </div>

                <div>
                  <div className="text-[5.8px] font-bold uppercase tracking-wider text-[#0F172A] border-b border-[#CBD5E1] pb-0.5 mb-1">
                    Certifications
                  </div>
                  <div className="text-[4.8px] text-[#475569] space-y-0.5">
                    {certs?.slice(0, 2).map((c, idx) => (
                      <div key={idx} className="truncate">&bull; {c}</div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column (65%) */}
              <div className="w-[65%] flex flex-col justify-between pl-0.5">
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
                        <span className="text-[#64748B] font-normal text-[4.5px] shrink-0">
                          {exp1.startDate} &ndash; {exp1.current ? 'Present' : exp1.endDate}
                        </span>
                      </div>
                      <div className="text-[4.8px] text-[#64748B] italic mb-0.5">{exp1.company}</div>
                      <ul className="space-y-0.5">
                        {exp1.bullets.slice(0, 3).map((b, idx) => (
                          <li key={idx} className="text-[4.8px] leading-[1.3] text-[#334155] flex items-start gap-0.5">
                            <span className="text-[#94A3B8] shrink-0">&bull;</span>
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
                        <span className="text-[#64748B] font-normal text-[4.5px] shrink-0">
                          {exp2.startDate} &ndash; {exp2.endDate}
                        </span>
                      </div>
                      <div className="text-[4.8px] text-[#64748B] italic mb-0.5">{exp2.company}</div>
                      <ul className="space-y-0.5">
                        {exp2.bullets.slice(0, 2).map((b, idx) => (
                          <li key={idx} className="text-[4.8px] leading-[1.3] text-[#334155] flex items-start gap-0.5">
                            <span className="text-[#94A3B8] shrink-0">&bull;</span>
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
            </div>

            {/* Bottom ATS Stamp */}
            <div className="border-t border-[#E2E8F0] pt-1 flex justify-between items-center text-[4.5px] text-[#94A3B8]">
              <span>Verified ATS Double-Column</span>
              <span>ATS Score: {resume.atsScore}/100</span>
            </div>
          </div>
        )}

        {/* VARIANT C: IVY LEAGUE (Academic Serif & Clean Rules - Replicating Harvard / Ivy League) */}
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
                        <span className="text-zinc-400 shrink-0">&bull;</span>
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
                        <span className="text-zinc-400 shrink-0">&bull;</span>
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

        {/* VARIANT D: CLASSIC SINGLE-COLUMN (High-Density Silicon Valley Standard - Jake/Stanford) */}
        {variant === 'classic' && (
          <div className="w-full h-full p-2.5 sm:p-3 flex flex-col justify-between box-border select-none pointer-events-none text-zinc-900">
            {/* Header */}
            <div className="text-center border-b border-zinc-200 pb-1">
              <h4 className="font-serif font-bold text-[11px] sm:text-[12px] text-zinc-950 tracking-tight leading-tight">
                {resume.candidate.name}
              </h4>
              <p className="text-[5.8px] font-semibold text-[#285FEA] mt-0.5 leading-none">
                {resume.candidate.title}
              </p>
              <p className="text-[5px] text-zinc-600 mt-0.5 leading-none">
                {resume.candidate.location} &bull; {resume.candidate.email} &bull; {resume.candidate.phone}
              </p>
              <p className="text-[4.8px] text-[#285FEA] mt-0.5 leading-none font-medium truncate">
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

            {/* Experience */}
            <div>
              <div className="text-[6px] font-bold tracking-wider text-zinc-950 uppercase border-b border-zinc-200 pb-0.5 mb-1">
                Professional Experience
              </div>
              {exp1 && (
                <div className="mb-1">
                  <div className="flex justify-between items-baseline text-[5.2px] font-bold text-zinc-950">
                    <span className="truncate max-w-[130px]">{exp1.title}</span>
                    <span className="text-[4.6px] text-zinc-500 font-normal shrink-0">
                      {exp1.startDate} &ndash; {exp1.current ? 'Present' : exp1.endDate}
                    </span>
                  </div>
                  <div className="text-[4.8px] text-zinc-600 italic mb-0.5">
                    {exp1.company} &bull; {exp1.location}
                  </div>
                  <ul className="space-y-0.5">
                    {exp1.bullets.slice(0, 3).map((b, idx) => (
                      <li key={idx} className="text-[4.8px] leading-[1.3] text-zinc-700 flex items-start gap-0.5">
                        <span className="text-zinc-400 shrink-0">&bull;</span>
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
                    <span className="text-[4.6px] text-zinc-500 font-normal shrink-0">
                      {exp2.startDate} &ndash; {exp2.endDate}
                    </span>
                  </div>
                  <div className="text-[4.8px] text-zinc-600 italic mb-0.5">
                    {exp2.company} &bull; {exp2.location}
                  </div>
                  <ul className="space-y-0.5">
                    {exp2.bullets.slice(0, 2).map((b, idx) => (
                      <li key={idx} className="text-[4.8px] leading-[1.3] text-zinc-700 flex items-start gap-0.5">
                        <span className="text-zinc-400 shrink-0">&bull;</span>
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
                  <span className="text-[4.5px] text-zinc-500 font-normal shrink-0">
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
            <div className="border-t border-zinc-200 pt-1 flex justify-between items-center text-[4.5px] text-zinc-400">
              <span>Verified Single-Column ATS Format</span>
              <span>ATS Score: {resume.atsScore}/100</span>
            </div>
          </div>
        )}

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
          <span
            className="text-xs font-semibold text-[#1A1D23] dark:text-[#F0F2F5] truncate block group-hover:text-[#285FEA] transition-colors"
            title={resume.role}
          >
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
