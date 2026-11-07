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
} from 'lucide-react';
import { TemplateProps, renderHighlightedText, LinkedinIcon, GithubIcon } from './types';

export function DoubleColumnTemplate({
  content,
  accentColor = '#0284c7', // Sky / Royal Blue benchmark
  fontFamily = 'sans',
  showPhoto = true,
  photoUrl,
  highlightKeywords,
  showHighlights = false,
  className = '',
}: TemplateProps) {
  const { contact, headline, summary, experience = [], education = [], skills = [], projects = [] } = content;

  const fontClass =
    fontFamily === 'serif'
      ? 'font-serif'
      : fontFamily === 'mono'
      ? 'font-mono'
      : 'font-sans';

  return (
    <div
      className={`resume-paper-canvas bg-white text-zinc-950 p-6 sm:p-8 rounded-sm shadow-md border border-zinc-200/80 w-full max-w-[820px] mx-auto text-left leading-relaxed ${fontClass} ${className}`}
      style={{ boxSizing: 'border-box' }}
    >
      {/* Top Header with Avatar (Enhancv Double Column Layout) */}
      <div className="flex items-start justify-between gap-6 pb-4 border-b border-zinc-200">
        <div className="space-y-1.5 flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-zinc-950 leading-tight">
            {contact.fullName || 'Candidate Name'}
          </h1>

          {headline && (
            <p
              className="text-xs sm:text-[13px] font-semibold leading-snug"
              style={{ color: accentColor }}
            >
              {headline}
            </p>
          )}

          {/* Contact Details with Micro Icons */}
          <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1 text-[10.5px] text-zinc-600 pt-0.5">
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
                <span className="truncate max-w-[200px]">
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
                <span className="truncate max-w-[180px]">
                  {contact.githubUrl.replace(/^https?:\/\/(www\.)?/, '')}
                </span>
              </span>
            )}
            {contact.websiteUrl && (
              <span className="inline-flex items-center gap-1">
                <Globe className="w-3 h-3 text-zinc-400 shrink-0" />
                <span className="truncate max-w-[180px]">
                  {contact.websiteUrl.replace(/^https?:\/\/(www\.)?/, '')}
                </span>
              </span>
            )}
          </div>
        </div>

        {/* Profile Avatar (Top-Right) */}
        {showPhoto && (
          <div className="shrink-0 pt-0.5">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={contact.fullName || 'Candidate'}
                className="w-20 h-20 sm:w-22 sm:h-22 rounded-full object-cover border-2 shadow-sm"
                style={{ borderColor: accentColor }}
              />
            ) : (
              <div
                className="w-20 h-20 sm:w-22 sm:h-22 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 border-2 shadow-sm overflow-hidden"
                style={{ borderColor: accentColor }}
              >
                <User className="w-11 h-11" />
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2-Column Split: Left (32% Education + Skills) | Right (68% Summary + Experience + Projects) */}
      <div className="grid grid-cols-1 md:grid-cols-12 print:grid-cols-12 gap-6 pt-5">
        {/* Left Column (4 cols / 33%): EDUCATION & SKILLS */}
        <div className="md:col-span-4 print:col-span-4 space-y-5">
          {/* Education */}
          {education.length > 0 && (
            <section className="space-y-2.5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900 pb-1 border-b border-zinc-200">
                Education
              </h2>

              <div className="space-y-3.5">
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
                      {schoolName && (
                        <div className="text-zinc-600 font-medium">
                          {schoolName}
                        </div>
                      )}
                      {dateDisplay && (
                        <div className="flex items-center gap-1 text-[10px] text-zinc-400 font-medium">
                          <Calendar className="w-2.5 h-2.5 text-zinc-400" />
                          <span>{dateDisplay}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Key Skills */}
          {skills.length > 0 && (
            <section className="space-y-2.5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900 pb-1 border-b border-zinc-200">
                Key Skills
              </h2>
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {skills.map((skill, idx) => {
                  const skillName = typeof skill === 'string' ? skill : (skill as any).name || '';
                  return (
                    <span
                      key={idx}
                      className="inline-block px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-100 text-zinc-800 border border-zinc-200/80"
                    >
                      {skillName}
                    </span>
                  );
                })}
              </div>
            </section>
          )}
        </div>

        {/* Right Column (8 cols / 67%): SUMMARY, EXPERIENCE, PROJECTS */}
        <div className="md:col-span-8 print:col-span-8 space-y-5 border-l border-zinc-100 pl-0 md:pl-3 print:pl-3">
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

          {/* Experience */}
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
                      style={{ color: accentColor }}
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

          {/* Selected Projects */}
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
      </div>
    </div>
  );
}
