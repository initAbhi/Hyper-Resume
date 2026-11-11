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
import { CustomSectionsBlock } from './CustomSectionsBlock';

export function DoubleColumnTemplate({
  content,
  accentColor = '#00b5cb', // Enhancv Teal / Sky Blue
  fontFamily = 'sans',
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

  // True Dynamic Pagination (Exact Enhancv Multi-Page Standard):
  // A standard A4 page holds contact header, summary, education, and ~1 major role + 1 project.
  // Any resume with >= 2 roles and projects, or >= 7 bullets, MUST paginate across 2 discrete A4 sheets.
  const totalExpBullets = experience.reduce((acc, exp) => acc + (exp.bullets?.length || 1), 0);
  const totalProjCount = projects.length;
  const totalProjHighlights = projects.reduce((acc, p) => acc + (p.highlights?.length || 1), 0);

  const needsSecondPage =
    experience.length >= 3 ||
    (experience.length >= 2 && projects.length >= 1) ||
    totalExpBullets >= 7 ||
    (totalExpBullets + totalProjHighlights >= 8);

  let page1Experiences: typeof experience = [];
  let page2Experiences: typeof experience = [];
  let page1Projects: typeof projects = [];
  let page2Projects: typeof projects = [];

  if (!needsSecondPage) {
    page1Experiences = experience;
    page1Projects = projects;
  } else {
    // Balanced 2-Page Distribution:
    if (experience.length === 2 && projects.length >= 2) {
      // Role 1 (Algoocean, 6 bullets) + Project 1 (Infodatabox, 4 highlights) on Page 1
      // Role 2 (SAAR IT, 3 bullets) + Project 2 & 3 (Init.new & Trading Bot) on Page 2
      page1Experiences = [experience[0]];
      page1Projects = [projects[0]];
      page2Experiences = [experience[1]];
      page2Projects = projects.slice(1);
    } else if (experience.length >= 3) {
      page1Experiences = experience.slice(0, 2);
      page2Experiences = experience.slice(2);
      page1Projects = [];
      page2Projects = projects;
    } else if (experience.length === 1 && projects.length >= 2) {
      page1Experiences = experience;
      page1Projects = [projects[0]];
      page2Experiences = [];
      page2Projects = projects.slice(1);
    } else {
      page1Experiences = experience.slice(0, 1);
      page2Experiences = experience.slice(1);
      page1Projects = projects.slice(0, 1);
      page2Projects = projects.slice(1);
    }
  }

  // Split skills if there are many (> 20) across both pages
  const page1Skills = needsSecondPage && skills.length > 20 ? skills.slice(0, 20) : skills;
  const page2Skills = needsSecondPage && skills.length > 20 ? skills.slice(20) : [];

  const fontClass =
    fontFamily === 'serif'
      ? 'font-serif'
      : fontFamily === 'mono'
      ? 'font-mono'
      : 'font-inter';

  return (
    <div className={`w-full max-w-[794px] mx-auto text-left leading-relaxed ${fontClass} ${className}`}>
      {/* ================= PAGE 1 ================= */}
      <div
        className="resume-page-a4 flex flex-col justify-between"
        id="resume-page-1"
        style={{ boxSizing: 'border-box' }}
      >
        <div className="space-y-4">
          {/* Top Header: Candidate Name, Subtitle, Contact Details & Avatar */}
          <div className="flex items-start justify-between gap-6 pb-3 border-b border-zinc-200">
            <div className="space-y-1 flex-1 min-w-0">
              <h1 className="text-2xl sm:text-[27px] font-bold uppercase tracking-tight text-zinc-900 font-rubik leading-tight">
                {contact.fullName || 'Candidate Name'}
              </h1>

              {headline && (
                <p
                  className="text-xs sm:text-[12.5px] font-medium leading-snug font-rubik"
                  style={{ color: accentColor }}
                >
                  {headline}
                </p>
              )}

              {/* Contact Details with Micro Icons */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10.5px] text-zinc-600 font-inter pt-0.5">
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
                    <span className="truncate max-w-[220px]">
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
                    <span className="truncate max-w-[180px]">
                      {contact.githubUrl.replace(/^https?:\/\/(www\.)?/, '')}
                    </span>
                  </span>
                )}
                {contact.websiteUrl && (
                  <span className="inline-flex items-center gap-1.5">
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
                    className="w-18 h-18 sm:w-20 sm:h-20 rounded-full object-cover border-2 shadow-xs"
                    style={{ borderColor: accentColor }}
                  />
                ) : (
                  <div
                    className="w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 border-2 shadow-xs overflow-hidden"
                    style={{ borderColor: accentColor }}
                  >
                    <User className="w-10 h-10" />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 2-Column Split: Left (60% Summary + Experiences + Projects) | Right (40% Education + Skills) */}
          <div className="grid grid-cols-1 md:grid-cols-12 print:grid-cols-12 gap-6">
            {/* Left Column (7 cols / 58%) */}
            <div className="md:col-span-7 print:col-span-7 space-y-4">
              {/* Summary */}
              {summary && (
                <section className="space-y-1">
                  <h2 className="text-[11.5px] font-bold uppercase tracking-wider text-zinc-800 font-rubik pb-1 border-b border-zinc-200">
                    Summary
                  </h2>
                  <p className="text-[10.5px] text-zinc-700 font-inter leading-[1.48] pt-0.5 whitespace-pre-line">
                    {renderHighlightedText(summary, highlightKeywords, showHighlights)}
                  </p>
                </section>
              )}

              {/* Experience (Page 1 Entries) */}
              {page1Experiences.length > 0 && (
                <section className="space-y-2.5">
                  <h2 className="text-[11.5px] font-bold uppercase tracking-wider text-zinc-800 font-rubik pb-1 border-b border-zinc-200">
                    Experience
                  </h2>

                  <div className="space-y-3.5">
                    {page1Experiences.map((exp, idx) => (
                      <div key={exp.id || idx} className="space-y-0.5">
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
                          style={{ color: accentColor }}
                        >
                          {exp.company}
                          {exp.location && (
                            <span className="text-zinc-500 font-normal font-inter"> • {exp.location}</span>
                          )}
                        </div>

                        {exp.bullets && exp.bullets.length > 0 && (
                          <ul className="list-disc pl-3.5 space-y-0.5 text-[10.5px] text-zinc-700 font-inter leading-[1.45] pt-0.5">
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

              {/* Projects (Page 1 Entries when fitting on single page) */}
              {page1Projects.length > 0 && (
                <section className="space-y-2 pt-1">
                  <h2 className="text-[11.5px] font-bold uppercase tracking-wider text-zinc-800 font-rubik pb-1 border-b border-zinc-200">
                    Selected Projects
                  </h2>

                  <div className="space-y-2.5">
                    {page1Projects.map((proj, idx) => (
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

              {!needsSecondPage && (
                <CustomSectionsBlock
                  content={content}
                  accentColor={accentColor}
                  highlightKeywords={highlightKeywords}
                  showHighlights={showHighlights}
                />
              )}
            </div>

            {/* Right Column (5 cols / 42%): EDUCATION & KEY SKILLS */}
            <div className="md:col-span-5 print:col-span-5 space-y-4">
              {/* Education */}
              {education.length > 0 && (
                <section className="space-y-2">
                  <h2 className="text-[11.5px] font-bold uppercase tracking-wider text-zinc-800 font-rubik pb-1 border-b border-zinc-200">
                    Education
                  </h2>

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
                          <div className="font-bold text-zinc-900 text-[11px] font-rubik leading-snug">
                            {edu.degree}
                            {edu.field ? `, ${edu.field}` : ''}
                          </div>
                          {schoolName && (
                            <div
                              className="font-medium font-rubik text-[10.5px]"
                              style={{ color: accentColor }}
                            >
                              {schoolName}
                            </div>
                          )}
                          {dateDisplay && (
                            <div className="flex items-center gap-1 text-[10px] text-zinc-400 font-inter">
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
              {page1Skills.length > 0 && (
                <section className="space-y-2">
                  <h2 className="text-[11.5px] font-bold uppercase tracking-wider text-zinc-800 font-rubik pb-1 border-b border-zinc-200">
                    Key Skills
                  </h2>
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {page1Skills.map((skill, idx) => {
                      const skillName = typeof skill === 'string' ? skill : (skill as any).name || '';
                      return (
                        <span
                          key={idx}
                          className="inline-block px-2 py-0.5 rounded text-[10px] font-medium font-inter bg-zinc-100 text-zinc-800 border border-zinc-200/80"
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
        </div>

        {/* Page 1 Footer */}
        {needsSecondPage && (
          <div className="pt-3 mt-auto border-t border-zinc-100 flex items-center justify-end text-[10px] text-zinc-400 font-inter select-none">
            <span>Page 1 of 2</span>
          </div>
        )}
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
          className="resume-page-a4 flex flex-col justify-between"
          id="resume-page-2"
          style={{ boxSizing: 'border-box' }}
        >
          <div className="space-y-4">
            <div className={`grid grid-cols-1 ${page2Skills.length > 0 ? 'md:grid-cols-12 print:grid-cols-12 gap-6' : 'gap-4'}`}>
              {/* Left Area (7 cols if skills present, else full width) */}
              <div className={page2Skills.length > 0 ? 'md:col-span-7 print:col-span-7 space-y-4' : 'space-y-4'}>
                {/* Experience Continuation */}
                {page2Experiences.length > 0 && (
                  <section className="space-y-2.5">
                    <h2 className="text-[11.5px] font-bold uppercase tracking-wider text-zinc-800 font-rubik pb-1 border-b border-zinc-200">
                      Experience (Continued)
                    </h2>

                    <div className="space-y-3.5">
                      {page2Experiences.map((exp, idx) => (
                        <div key={exp.id || idx} className="space-y-0.5">
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
                            style={{ color: accentColor }}
                          >
                            {exp.company}
                            {exp.location && (
                              <span className="text-zinc-500 font-normal font-inter"> • {exp.location}</span>
                            )}
                          </div>

                          {exp.bullets && exp.bullets.length > 0 && (
                            <ul className="list-disc pl-3.5 space-y-0.5 text-[10.5px] text-zinc-700 font-inter leading-[1.45] pt-0.5">
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
                {page2Projects.length > 0 && (
                  <section className="space-y-2 pt-1">
                    <h2 className="text-[11.5px] font-bold uppercase tracking-wider text-zinc-800 font-rubik pb-1 border-b border-zinc-200">
                      Selected Projects
                    </h2>
                    <div className="space-y-2.5">
                      {page2Projects.map((proj, idx) => (
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

                <CustomSectionsBlock
                  content={content}
                  accentColor={accentColor}
                  highlightKeywords={highlightKeywords}
                  showHighlights={showHighlights}
                />
              </div>

              {/* Right Area (5 cols): Tools & Technologies */}
              {page2Skills.length > 0 && (
                <div className="md:col-span-5 print:col-span-5 space-y-4">
                  <section className="space-y-2">
                    <h2 className="text-[11.5px] font-bold uppercase tracking-wider text-zinc-800 font-rubik pb-1 border-b border-zinc-200">
                      Tools & Technologies
                    </h2>
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {page2Skills.map((skill, idx) => {
                        const skillName = typeof skill === 'string' ? skill : (skill as any).name || '';
                        return (
                          <span
                            key={idx}
                            className="inline-block px-2 py-0.5 rounded text-[10px] font-medium font-inter bg-zinc-100 text-zinc-800 border border-zinc-200/80"
                          >
                            {skillName}
                          </span>
                        );
                      })}
                    </div>
                  </section>
                </div>
              )}
            </div>
          </div>

          {/* Page 2 Footer */}
          <div className="pt-3 mt-auto border-t border-zinc-100 flex items-center justify-between text-[10px] text-zinc-400 font-inter select-none">
            <span>hype-resume.com</span>
            <span>Page 2 of 2</span>
          </div>
        </div>
      )}
    </div>
  );
}
