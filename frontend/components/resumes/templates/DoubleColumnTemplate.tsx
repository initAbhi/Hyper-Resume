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

  // Dynamic pagination & density distribution:
  // Calculate vertical load to avoid empty gaps on Page 1 or desert-like Page 2
  const summaryWeight = summary ? 60 + Math.min(180, Math.ceil(summary.length / 80) * 16) : 0;
  const expWeights = experience.map((exp) => 45 + (exp.bullets?.length || 1) * 22);
  const projWeights = projects.map((proj) => 50 + (proj.highlights?.length || 1) * 18);

  const totalExpWeight = expWeights.reduce((a, b) => a + b, 0);
  const totalProjWeight = projWeights.reduce((a, b) => a + b, 0);
  const totalWeight = summaryWeight + totalExpWeight + totalProjWeight;

  // Single-page threshold:
  // If total weight is <= 760, everything fits comfortably on a single A4 page!
  const fitsOnOnePage = totalWeight <= 760;

  let needsSecondPage = !fitsOnOnePage;
  let page1Experiences: typeof experience = [];
  let page2Experiences: typeof experience = [];
  let page1Projects: typeof projects = [];
  let page2Projects: typeof projects = [];

  if (fitsOnOnePage) {
    page1Experiences = experience;
    page1Projects = projects;
  } else {
    // Two-page layout:
    // If experience has 2 items and projects has >= 2 items (e.g. Abhi's profile with Algoocean + SAAR IT + 3 projects):
    // Put Exp 1 + Proj 1 on Page 1 to fill Page 1 to ~90%, and Exp 2 + Proj 2 & 3 on Page 2 to fill Page 2 to ~80%!
    if (experience.length === 2 && projects.length >= 2) {
      page1Experiences = [experience[0]];
      page1Projects = [projects[0]];
      page2Experiences = [experience[1]];
      page2Projects = projects.slice(1);
    } else {
      let currentP1Weight = summaryWeight;
      for (let i = 0; i < experience.length; i++) {
        const remaining = (experience.length - 1 - i) + projects.length;
        if (currentP1Weight + expWeights[i] <= 640 && remaining > 0) {
          page1Experiences.push(experience[i]);
          currentP1Weight += expWeights[i];
        } else {
          page2Experiences.push(...experience.slice(i));
          break;
        }
      }

      for (let j = 0; j < projects.length; j++) {
        if (page2Experiences.length > 0) {
          if (currentP1Weight + projWeights[j] <= 640) {
            page1Projects.push(projects[j]);
            currentP1Weight += projWeights[j];
          } else {
            page2Projects.push(...projects.slice(j));
            break;
          }
        } else {
          page2Projects.push(...projects.slice(j));
          break;
        }
      }

      if (page2Experiences.length === 0 && page2Projects.length === 0) {
        needsSecondPage = false;
        page1Experiences = experience;
        page1Projects = projects;
      }
    }
  }

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
        className="resume-page-a4"
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
              {skills.length > 0 && (
                <section className="space-y-2">
                  <h2 className="text-[11.5px] font-bold uppercase tracking-wider text-zinc-800 font-rubik pb-1 border-b border-zinc-200">
                    Key Skills
                  </h2>
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {skills.map((skill, idx) => {
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
        <div className="pt-3 mt-auto border-t border-zinc-100 flex items-center justify-between text-[10px] text-zinc-400 font-inter select-none">
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
          className="resume-page-a4"
          id="resume-page-2"
          style={{ boxSizing: 'border-box' }}
        >
          <div className="space-y-4">
            {/* Experience Continuation */}
            {page2Experiences.length > 0 && (
              <section className="space-y-2.5">
                <h2 className="text-[11.5px] font-bold uppercase tracking-wider text-zinc-800 font-rubik pb-1 border-b border-zinc-200">
                  Experience
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
