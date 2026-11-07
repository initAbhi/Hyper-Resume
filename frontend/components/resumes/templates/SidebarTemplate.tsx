'use client';

import React from 'react';
import {
  MapPin,
  Mail,
  Phone,
  Globe,
  Calendar,
  User,
  GraduationCap,
  Sparkles,
  Award,
} from 'lucide-react';
import { TemplateProps, renderHighlightedText, LinkedinIcon, GithubIcon } from './types';

export function SidebarTemplate({
  content,
  accentColor = '#142d4c', // Deep Navy (Enhancv Elegant benchmark)
  showPhoto = true,
  photoUrl,
  highlightKeywords,
  showHighlights = false,
  className = '',
}: TemplateProps) {
  const { contact, headline, summary, experience = [], education = [], skills = [], projects = [] } = content;

  return (
    <div
      className={`resume-paper-canvas bg-white text-zinc-950 rounded-sm shadow-md border border-zinc-200/80 w-full max-w-[820px] mx-auto text-left flex flex-col md:flex-row print:flex-row overflow-hidden min-h-[1050px] ${className}`}
      style={{ boxSizing: 'border-box' }}
    >
      {/* LEFT MAIN AREA (65% width, Crisp White Canvas) */}
      <div className="w-full md:w-[65%] print:w-[65%] p-6 sm:p-8 space-y-5 flex-1 order-1">
        {/* Header: Name, Headline & Contact */}
        <div className="space-y-1.5 pb-3 border-b border-zinc-200">
          <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-zinc-950">
            {contact.fullName || 'Candidate Name'}
          </h1>

          {headline && (
            <p
              className="text-xs sm:text-[13px] font-semibold leading-snug"
              style={{ color: accentColor === '#142d4c' ? '#0284c7' : accentColor }}
            >
              {headline}
            </p>
          )}

          {/* Contact Row with Micro Icons */}
          <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1 text-[10.5px] text-zinc-600 pt-1">
            {contact.phone && (
              <span className="inline-flex items-center gap-1">
                <Phone className="w-3 h-3 text-zinc-400 shrink-0" />
                <span>{contact.phone}</span>
              </span>
            )}
            {contact.email && (
              <span className="inline-flex items-center gap-1">
                <Mail className="w-3 h-3 text-zinc-400 shrink-0" />
                <span>{contact.email}</span>
              </span>
            )}
            {contact.linkedinUrl && (
              <span className="inline-flex items-center gap-1">
                <LinkedinIcon className="w-3 h-3 text-zinc-400 shrink-0" />
                <span className="truncate max-w-[190px]">
                  {contact.linkedinUrl.replace(/^https?:\/\/(www\.)?/, '')}
                </span>
              </span>
            )}
            {contact.location && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="w-3 h-3 text-zinc-400 shrink-0" />
                <span>{contact.location}</span>
              </span>
            )}
            {contact.githubUrl && (
              <span className="inline-flex items-center gap-1">
                <GithubIcon className="w-3 h-3 text-zinc-400 shrink-0" />
                <span className="truncate max-w-[170px]">
                  {contact.githubUrl.replace(/^https?:\/\/(www\.)?/, '')}
                </span>
              </span>
            )}
            {contact.websiteUrl && (
              <span className="inline-flex items-center gap-1">
                <Globe className="w-3 h-3 text-zinc-400 shrink-0" />
                <span className="truncate max-w-[170px]">
                  {contact.websiteUrl.replace(/^https?:\/\/(www\.)?/, '')}
                </span>
              </span>
            )}
          </div>
        </div>

        {/* Summary */}
        {summary && (
          <section className="space-y-1.5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900 pb-1 border-b border-zinc-200">
              Summary
            </h2>
            <p className="text-[11px] text-zinc-700 leading-relaxed pt-0.5">
              {renderHighlightedText(summary, highlightKeywords, showHighlights)}
            </p>
          </section>
        )}

        {/* Work Experience */}
        {experience.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900 pb-1 border-b border-zinc-200">
              Experience
            </h2>

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
                    style={{ color: accentColor === '#142d4c' ? '#0284c7' : accentColor }}
                  >
                    {exp.company}
                    {exp.location && (
                      <span className="text-zinc-500 font-normal"> • {exp.location}</span>
                    )}
                  </div>

                  {exp.bullets && exp.bullets.length > 0 && (
                    <ul className="list-disc pl-3.5 space-y-1 text-[10.5px] text-zinc-700 leading-relaxed pt-0.5">
                      {exp.bullets.map((bullet, bIdx) => (
                        <li key={bIdx} className="pl-0.5">
                          {renderHighlightedText(bullet, highlightKeywords, showHighlights)}
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
          <section className="space-y-2.5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900 pb-1 border-b border-zinc-200">
              Selected Projects
            </h2>
            <div className="space-y-3">
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
                  <p className="text-zinc-700 leading-relaxed">
                    {renderHighlightedText(proj.description, highlightKeywords, showHighlights)}
                  </p>
                  {proj.highlights && proj.highlights.length > 0 && (
                    <ul className="list-disc pl-3.5 space-y-0.5 text-zinc-600 text-[10px]">
                      {proj.highlights.map((h, hIdx) => (
                        <li key={hIdx}>{renderHighlightedText(h, highlightKeywords, showHighlights)}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* RIGHT ACCENT SIDEBAR (35% width, Deep Navy Two-Tone Column) */}
      <div
        className="w-full md:w-[35%] print:w-[35%] p-6 sm:p-7 text-white flex flex-col justify-between shrink-0 order-2"
        style={{
          backgroundColor: accentColor,
          WebkitPrintColorAdjust: 'exact',
          printColorAdjust: 'exact',
        }}
      >
        <div className="space-y-6">
          {/* Circular Photo (Positioned at Top of Sidebar) */}
          {showPhoto && (
            <div className="flex justify-center pt-1 pb-1">
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt={contact.fullName || 'Candidate'}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-white/20 shadow-xl"
                />
              ) : (
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-white/10 border-4 border-white/20 flex items-center justify-center text-white/50 shadow-xl">
                  <User className="w-14 h-14" />
                </div>
              )}
            </div>
          )}

          {/* Education in Sidebar */}
          {education.length > 0 && (
            <div className="space-y-2.5">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-white/90 border-b border-white/20 pb-1 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-white/70" />
                <span>Education</span>
              </h3>
              <div className="space-y-3">
                {education.map((edu, idx) => {
                  const schoolName = edu.school || (edu as any).institution || '';
                  const dateDisplay =
                    edu.graduationDate ||
                    ((edu as any).startDate
                      ? `${(edu as any).startDate} – ${(edu as any).current ? 'Present' : (edu as any).endDate || ''}`
                      : '');

                  return (
                    <div key={idx} className="space-y-0.5 text-[10px]">
                      <div className="font-bold text-white text-[11px] leading-snug">
                        {edu.degree}
                        {edu.field ? `, ${edu.field}` : ''}
                      </div>
                      {schoolName && (
                        <div className="text-white/80 font-medium">
                          {schoolName}
                        </div>
                      )}
                      {dateDisplay && (
                        <div className="flex items-center gap-1 text-white/60 text-[9.5px]">
                          <Calendar className="w-2.5 h-2.5 text-white/50" />
                          <span>{dateDisplay}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Skills in Sidebar */}
          {skills.length > 0 && (
            <div className="space-y-2.5">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-white/90 border-b border-white/20 pb-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-white/70" />
                <span>Key Skills</span>
              </h3>
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {skills.map((skill, idx) => {
                  const skillName = typeof skill === 'string' ? skill : (skill as any).name || '';
                  return (
                    <span
                      key={idx}
                      className="inline-block px-2 py-0.5 rounded-md text-[10px] font-medium bg-white/15 text-white border border-white/10 backdrop-blur-xs"
                    >
                      {skillName}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="pt-6 text-[9px] text-white/40 text-center font-mono">
          Verified ATS Two-Tone
        </div>
      </div>
    </div>
  );
}
