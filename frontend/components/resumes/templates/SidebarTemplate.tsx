'use client';

import React from 'react';
import {
  MapPin,
  Mail,
  Phone,
  Globe,
  Calendar,
  User,
  Sparkles,
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
  const {
    contact,
    headline,
    summary,
    experience = [],
    education = [],
    skills = [],
    projects = [],
  } = content;

  // Threshold: if experience count > 2, or total items exceed Page 1 vertical budget, paginate to Page 2
  const needsSecondPage = experience.length > 2 || (experience.length === 2 && (projects.length > 0 || education.length > 2));

  const page1Experiences = needsSecondPage ? experience.slice(0, 2) : experience;
  const page2Experiences = needsSecondPage ? experience.slice(2) : [];

  return (
    <div className={`w-full max-w-[794px] mx-auto text-left leading-relaxed font-inter ${className}`}>
      {/* ================= PAGE 1 ================= */}
      <div
        className="resume-page-a4 p-0! overflow-hidden flex flex-col justify-between"
        id="resume-page-1"
        style={{ boxSizing: 'border-box' }}
      >
        <div className="flex flex-col md:flex-row print:flex-row flex-1">
          {/* LEFT MAIN AREA (65% width, Crisp White) */}
          <div className="w-full md:w-[65%] print:w-[65%] p-6 sm:p-7 space-y-5 order-1">
            {/* Header: Name, Headline & Contact */}
            <div className="space-y-1.5 pb-3 border-b border-zinc-200">
              <h1 className="text-2xl sm:text-[28px] font-bold uppercase tracking-tight text-zinc-900 font-rubik leading-tight">
                {contact.fullName || 'Candidate Name'}
              </h1>

              {headline && (
                <p
                  className="text-xs sm:text-[13px] font-medium leading-snug font-inter"
                  style={{ color: accentColor === '#142d4c' ? '#008bff' : accentColor }}
                >
                  {headline}
                </p>
              )}

              {/* Contact Row */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10.5px] text-zinc-600 font-inter pt-1">
                {contact.phone && (
                  <span className="inline-flex items-center gap-1.5">
                    <Phone className="w-3 h-3 text-zinc-400 shrink-0" />
                    <span>{contact.phone}</span>
                  </span>
                )}
                {contact.email && (
                  <span className="inline-flex items-center gap-1.5">
                    <Mail className="w-3 h-3 text-zinc-400 shrink-0" />
                    <span>{contact.email}</span>
                  </span>
                )}
                {contact.linkedinUrl && (
                  <span className="inline-flex items-center gap-1.5">
                    <LinkedinIcon className="w-3 h-3 text-zinc-400 shrink-0" />
                    <span className="truncate max-w-[200px]">
                      {contact.linkedinUrl.replace(/^https?:\/\/(www\.)?/, '')}
                    </span>
                  </span>
                )}
                {contact.location && (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 text-zinc-400 shrink-0" />
                    <span>{contact.location}</span>
                  </span>
                )}
                {contact.githubUrl && (
                  <span className="inline-flex items-center gap-1.5">
                    <GithubIcon className="w-3 h-3 text-zinc-400 shrink-0" />
                    <span className="truncate max-w-[170px]">
                      {contact.githubUrl.replace(/^https?:\/\/(www\.)?/, '')}
                    </span>
                  </span>
                )}
                {contact.websiteUrl && (
                  <span className="inline-flex items-center gap-1.5">
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
                <h2 className="text-[11.5px] font-bold uppercase tracking-wider text-zinc-800 font-rubik pb-1 border-b border-zinc-200">
                  Summary
                </h2>
                <p className="text-[10.5px] text-zinc-700 font-inter leading-[1.5] pt-0.5 whitespace-pre-line">
                  {renderHighlightedText(summary, highlightKeywords, showHighlights)}
                </p>
              </section>
            )}

            {/* Work Experience (Page 1 Entries) */}
            {page1Experiences.length > 0 && (
              <section className="space-y-3">
                <h2 className="text-[11.5px] font-bold uppercase tracking-wider text-zinc-800 font-rubik pb-1 border-b border-zinc-200">
                  Experience
                </h2>

                <div className="space-y-4">
                  {page1Experiences.map((exp, idx) => (
                    <div key={exp.id || idx} className="space-y-1">
                      <div className="flex justify-between items-baseline gap-2">
                        <span className="font-bold text-xs text-zinc-900 font-rubik">
                          {exp.title}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[10px] text-zinc-500 font-inter shrink-0">
                          <Calendar className="w-2.5 h-2.5 text-zinc-400" />
                          <span>{exp.startDate} – {exp.current ? 'Present' : exp.endDate || ''}</span>
                        </span>
                      </div>

                      <div
                        className="text-[11px] font-medium font-rubik"
                        style={{ color: accentColor === '#142d4c' ? '#008bff' : accentColor }}
                      >
                        {exp.company}
                        {exp.location && (
                          <span className="text-zinc-500 font-normal font-inter"> • {exp.location}</span>
                        )}
                      </div>

                      {exp.bullets && exp.bullets.length > 0 && (
                        <ul className="list-disc pl-3.5 space-y-1 text-[10.5px] text-zinc-700 font-inter leading-[1.45] pt-0.5">
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
          </div>

          {/* RIGHT SIDEBAR (35% width, Deep Navy Background #142d4c) */}
          <div className="w-full md:w-[35%] print:w-[35%] bg-[#142d4c] text-white p-6 sm:p-7 space-y-6 order-2">
            {/* Avatar Centered in Navy Sidebar */}
            {showPhoto && (
              <div className="flex justify-center pb-2">
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt={contact.fullName || 'Candidate'}
                    className="w-22 h-22 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-white/80 shadow-md"
                  />
                ) : (
                  <div className="w-22 h-22 sm:w-24 sm:h-24 rounded-full bg-white/10 flex items-center justify-center text-white/60 border-2 border-white/20">
                    <User className="w-12 h-12" />
                  </div>
                )}
              </div>
            )}

            {/* Education in Navy Sidebar */}
            {education.length > 0 && (
              <section className="space-y-3">
                <h2 className="text-[11.5px] font-bold uppercase tracking-wider text-white font-rubik pb-1 border-b border-white/20">
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
                        <div className="font-bold text-white text-[11px] font-rubik leading-snug">
                          {edu.degree}
                          {edu.field ? `, ${edu.field}` : ''}
                        </div>
                        {schoolName && (
                          <div className="text-white/80 font-medium font-rubik text-[10.5px]">
                            {schoolName}
                          </div>
                        )}
                        {dateDisplay && (
                          <div className="flex items-center gap-1 text-[10px] text-white/60 font-inter">
                            <Calendar className="w-2.5 h-2.5 text-white/50" />
                            <span>{dateDisplay}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Skills in Navy Sidebar */}
            {skills.length > 0 && (
              <section className="space-y-3">
                <h2 className="text-[11.5px] font-bold uppercase tracking-wider text-white font-rubik pb-1 border-b border-white/20">
                  Key Skills
                </h2>
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {skills.map((skill, idx) => {
                    const skillName = typeof skill === 'string' ? skill : (skill as any).name || '';
                    return (
                      <span
                        key={idx}
                        className="inline-block px-2 py-0.5 rounded text-[10px] font-medium font-inter bg-white/10 text-white border border-white/15"
                      >
                        {skillName}
                      </span>
                    );
                  })}
                </div>
              </section>
            )}
          </div>
        </div>

        {/* Page 1 Footer */}
        <div className="px-6 sm:px-7 py-3 border-t border-zinc-100 flex items-center justify-between text-[10px] text-zinc-400 font-inter select-none bg-white">
          <span>hype-resume.com</span>
          <span>{needsSecondPage ? 'Page 1 of 2' : 'Powered by HypeResume'}</span>
        </div>
      </div>

      {/* ================= PAGE BREAK DIVIDER (Screen Only) ================= */}
      {needsSecondPage && (
        <div className="flex items-center justify-center my-8 py-2 select-none print:hidden">
          <div className="h-[1px] bg-zinc-300 dark:bg-zinc-700 w-28 sm:w-44" />
          <span className="mx-4 text-xs font-semibold text-zinc-500 dark:text-zinc-400 tracking-wider uppercase font-inter">
            —— Page 2 ——
          </span>
          <div className="h-[1px] bg-zinc-300 dark:bg-zinc-700 w-28 sm:w-44" />
        </div>
      )}

      {/* ================= PAGE 2 ================= */}
      {needsSecondPage && (
        <div
          className="resume-page-a4 p-0! overflow-hidden flex flex-col justify-between"
          id="resume-page-2"
          style={{ boxSizing: 'border-box' }}
        >
          <div className="flex flex-col md:flex-row print:flex-row flex-1">
            {/* LEFT MAIN AREA (65% width, Crisp White) */}
            <div className="w-full md:w-[65%] print:w-[65%] p-6 sm:p-7 space-y-5 order-1">
              {/* Experience Continuation */}
              {page2Experiences.length > 0 && (
                <section className="space-y-3">
                  <h2 className="text-[11.5px] font-bold uppercase tracking-wider text-zinc-800 font-rubik pb-1 border-b border-zinc-200">
                    Experience
                  </h2>

                  <div className="space-y-4">
                    {page2Experiences.map((exp, idx) => (
                      <div key={exp.id || idx} className="space-y-1">
                        <div className="flex justify-between items-baseline gap-2">
                          <span className="font-bold text-xs text-zinc-900 font-rubik">
                            {exp.title}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[10px] text-zinc-500 font-inter shrink-0">
                            <Calendar className="w-2.5 h-2.5 text-zinc-400" />
                            <span>{exp.startDate} – {exp.current ? 'Present' : exp.endDate || ''}</span>
                          </span>
                        </div>

                        <div
                          className="text-[11px] font-medium font-rubik"
                          style={{ color: accentColor === '#142d4c' ? '#008bff' : accentColor }}
                        >
                          {exp.company}
                          {exp.location && (
                            <span className="text-zinc-500 font-normal font-inter"> • {exp.location}</span>
                          )}
                        </div>

                        {exp.bullets && exp.bullets.length > 0 && (
                          <ul className="list-disc pl-3.5 space-y-1 text-[10.5px] text-zinc-700 font-inter leading-[1.45] pt-0.5">
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
                <section className="space-y-2.5 pt-2">
                  <h2 className="text-[11.5px] font-bold uppercase tracking-wider text-zinc-800 font-rubik pb-1 border-b border-zinc-200">
                    Selected Projects
                  </h2>
                  <div className="space-y-3">
                    {projects.map((proj, idx) => (
                      <div key={idx} className="space-y-0.5 text-[10.5px]">
                        <div className="font-bold text-zinc-900 font-rubik flex items-center justify-between">
                          <span>{proj.name}</span>
                          {proj.url && (
                            <span className="text-[10px] text-blue-600 font-inter font-normal">
                              {proj.url.replace(/^https?:\/\//, '')}
                            </span>
                          )}
                        </div>
                        <p className="text-zinc-700 font-inter leading-relaxed">
                          {renderHighlightedText(proj.description, highlightKeywords, showHighlights)}
                        </p>
                        {proj.highlights && proj.highlights.length > 0 && (
                          <ul className="list-disc pl-3.5 space-y-0.5 text-zinc-600 font-inter text-[10px]">
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

            {/* RIGHT SIDEBAR CONTINUATION (35% width, Navy background) */}
            <div className="w-full md:w-[35%] print:w-[35%] bg-[#142d4c] text-white p-6 sm:p-7 space-y-6 order-2">
              <div className="text-[10px] text-white/40 uppercase tracking-widest font-rubik">
                Professional Evidence
              </div>
            </div>
          </div>

          {/* Page 2 Footer */}
          <div className="px-6 sm:px-7 py-3 border-t border-zinc-100 flex items-center justify-between text-[10px] text-zinc-400 font-inter select-none bg-white">
            <span>hype-resume.com</span>
            <span>Page 2 of 2</span>
          </div>
        </div>
      )}
    </div>
  );
}
