'use client';

import React from 'react';
import {
  MapPin,
  Mail,
  Phone,
  Globe,
  Calendar,
  Briefcase,
  GraduationCap,
  Sparkles,
  FolderGit2,
} from 'lucide-react';
import { TemplateProps, renderHighlightedText, LinkedinIcon, GithubIcon } from './types';
import { CustomSectionsBlock } from './CustomSectionsBlock';

export function CrestTemplate({
  content,
  accentColor = '#0d9488', // Emerald/Teal default
  showPhoto = false,
  photoUrl,
  highlightKeywords,
  showHighlights = false,
  className = '',
}: TemplateProps) {
  const { contact, headline, summary, experience = [], education = [], skills = [], projects = [] } = content;

  return (
    <div
      className={`resume-page-a4 resume-paper-canvas bg-white text-zinc-950 rounded-sm shadow-md border border-zinc-200/80 w-full max-w-[820px] mx-auto text-left overflow-hidden ${className}`}
      style={{ boxSizing: 'border-box' }}
    >
      {/* Bold Full-Width Top Accent Banner */}
      <div
        className="p-6 sm:p-8 text-white relative"
        style={{
          backgroundColor: accentColor,
          WebkitPrintColorAdjust: 'exact',
          printColorAdjust: 'exact',
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-white">
              {contact.fullName || 'Candidate Name'}
            </h1>
            {headline && (
              <p className="text-xs sm:text-sm font-medium text-white/90">
                {headline}
              </p>
            )}
          </div>

          {showPhoto && photoUrl && (
            <img
              src={photoUrl}
              alt={contact.fullName || 'Candidate'}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-white/40 shadow shrink-0"
            />
          )}
        </div>
      </div>

      {/* Sub-bar Ribbon for Contact Info */}
      <div className="bg-zinc-50 border-b border-zinc-200 px-6 sm:px-8 py-2.5 text-[10.5px] text-zinc-700 flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
        {contact.email && (
          <span className="inline-flex items-center gap-1.5">
            <Mail className="w-3 h-3 text-zinc-500" />
            <span>{contact.email}</span>
          </span>
        )}
        {contact.phone && (
          <span className="inline-flex items-center gap-1.5">
            <Phone className="w-3 h-3 text-zinc-500" />
            <span>{contact.phone}</span>
          </span>
        )}
        {contact.location && (
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="w-3 h-3 text-zinc-500" />
            <span>{contact.location}</span>
          </span>
        )}
        {contact.linkedinUrl && (
          <span className="inline-flex items-center gap-1.5">
            <LinkedinIcon className="w-3 h-3 text-zinc-500" />
            <span>{contact.linkedinUrl.replace(/^https?:\/\/(www\.)?/, '')}</span>
          </span>
        )}
        {contact.githubUrl && (
          <span className="inline-flex items-center gap-1.5">
            <GithubIcon className="w-3 h-3 text-zinc-500" />
            <span>{contact.githubUrl.replace(/^https?:\/\/(www\.)?/, '')}</span>
          </span>
        )}
        {contact.websiteUrl && (
          <span className="inline-flex items-center gap-1.5">
            <Globe className="w-3 h-3 text-zinc-500" />
            <span>{contact.websiteUrl.replace(/^https?:\/\/(www\.)?/, '')}</span>
          </span>
        )}
      </div>

      {/* Main Body */}
      <div className="p-6 sm:p-8 space-y-5">
        {/* Summary */}
        {summary && (
          <section className="space-y-1.5">
            <div className="flex items-center gap-2 pb-1 border-b border-zinc-200">
              <Sparkles className="w-3.5 h-3.5" style={{ color: accentColor }} />
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                Professional Profile
              </h2>
            </div>
            <p className="text-[10.5px] text-zinc-700 leading-relaxed pt-0.5">
              {renderHighlightedText(summary, highlightKeywords, showHighlights)}
            </p>
          </section>
        )}

        {/* 2-Column Split: Experience (65%) | Skills & Education (35%) */}
        <div className="grid grid-cols-1 md:grid-cols-12 print:grid-cols-12 gap-6 pt-1">
          {/* Experience Column */}
          <div className="md:col-span-8 print:col-span-8 space-y-4">
            {experience.length > 0 && (
              <section className="space-y-3">
                <div className="flex items-center gap-2 pb-1 border-b border-zinc-200">
                  <Briefcase className="w-3.5 h-3.5" style={{ color: accentColor }} />
                  <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                    Work Experience
                  </h2>
                </div>

                <div className="space-y-4">
                  {experience.map((exp, idx) => (
                    <div key={exp.id || idx} className="space-y-1">
                      <div className="flex justify-between items-baseline gap-2">
                        <span className="font-bold text-xs text-zinc-950">
                          {exp.title}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[10px] text-zinc-500 font-medium shrink-0">
                          <Calendar className="w-2.5 h-2.5 text-zinc-400" />
                          <span>{exp.startDate} – {exp.current ? 'Present' : exp.endDate || ''}</span>
                        </span>
                      </div>
                      <div
                        className="text-[11px] font-semibold"
                        style={{ color: accentColor }}
                      >
                        {exp.company}
                        {exp.location && (
                          <span className="text-zinc-500 font-normal"> • {exp.location}</span>
                        )}
                      </div>

                      {exp.bullets && exp.bullets.length > 0 && (
                        <ul className="list-disc pl-3.5 space-y-1 text-[10.5px] text-zinc-700 leading-relaxed pt-0.5">
                          {exp.bullets.map((b, bIdx) => (
                            <li key={bIdx}>
                              {renderHighlightedText(b, highlightKeywords, showHighlights)}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Projects */}
            {projects.length > 0 && (
              <section className="space-y-2.5 pt-2">
                <div className="flex items-center gap-2 pb-1 border-b border-zinc-200">
                  <FolderGit2 className="w-3.5 h-3.5" style={{ color: accentColor }} />
                  <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                    Selected Projects
                  </h2>
                </div>
                <div className="space-y-2.5">
                  {projects.map((proj, idx) => (
                    <div key={idx} className="space-y-0.5 text-[10.5px]">
                      <div className="font-bold text-zinc-950 flex items-center justify-between">
                        <span>{proj.name}</span>
                        {proj.url && (
                          <span className="text-[10px] text-blue-600 font-normal">
                            {proj.url.replace(/^https?:\/\//, '')}
                          </span>
                        )}
                      </div>
                      <p className="text-zinc-700">
                        {renderHighlightedText(proj.description, highlightKeywords, showHighlights)}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <CustomSectionsBlock
              content={content}
              accentColor={accentColor}
              highlightKeywords={highlightKeywords}
              showHighlights={showHighlights}
            />
          </div>

          {/* Right Column: Skills & Education */}
          <div className="md:col-span-4 print:col-span-4 space-y-5 border-l border-zinc-100 pl-0 md:pl-2 print:pl-2">
            {/* Skills */}
            {skills.length > 0 && (
              <section className="space-y-2">
                <div className="flex items-center gap-2 pb-1 border-b border-zinc-200">
                  <Sparkles className="w-3.5 h-3.5" style={{ color: accentColor }} />
                  <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                    Core Skills
                  </h2>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {skills.map((s, idx) => {
                    const skillName = typeof s === 'string' ? s : s.name;
                    return (
                      <span
                        key={idx}
                        className="px-2 py-0.5 text-[10px] rounded font-medium border"
                        style={{
                          backgroundColor: `${accentColor}10`,
                          borderColor: `${accentColor}30`,
                          color: accentColor,
                        }}
                      >
                        {skillName}
                      </span>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Education */}
            {education.length > 0 && (
              <section className="space-y-2.5">
                <div className="flex items-center gap-2 pb-1 border-b border-zinc-200">
                  <GraduationCap className="w-3.5 h-3.5" style={{ color: accentColor }} />
                  <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                    Education
                  </h2>
                </div>
                <div className="space-y-3">
                  {education.map((edu, idx) => {
                    const schoolName = edu.school || (edu as any).institution || '';
                    const dateDisplay =
                      edu.graduationDate ||
                      ((edu as any).startDate
                        ? `${(edu as any).startDate} – ${(edu as any).current ? 'Present' : (edu as any).endDate || ''}`
                        : '');

                    return (
                      <div key={idx} className="space-y-0.5 text-[10.5px]">
                        <div className="font-bold text-zinc-950 text-[11px] leading-snug">
                          {edu.degree}
                          {edu.field ? `, ${edu.field}` : ''}
                        </div>
                        {schoolName && <div className="text-zinc-700 font-medium">{schoolName}</div>}
                        {dateDisplay && <div className="text-[10px] text-zinc-500">{dateDisplay}</div>}
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
