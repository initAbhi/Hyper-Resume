'use client';

import React from 'react';
import {
  MapPin,
  Mail,
  Phone,
  Globe,
  Calendar,
  ExternalLink,
} from 'lucide-react';
import { TemplateProps, renderHighlightedText, LinkedinIcon, GithubIcon } from './types';

/**
 * Deedy Resume Template
 * Inspired by Debarghya Das's famous Deedy Resume LaTeX template.
 * High-density asymmetric 2-column layout (32% left sidebar for metadata/skills,
 * 68% right column for deep experience & project narratives).
 */
export function DeedyTemplate({
  content,
  accentColor = '#2563eb', // Blue accent default
  fontFamily = 'sans',
  showPhoto = false,
  photoUrl,
  highlightKeywords,
  showHighlights = false,
  className = '',
}: TemplateProps) {
  const { contact, headline, summary, experience = [], education = [], skills = [], projects = [] } = content;

  return (
    <div
      className={`resume-page-a4 resume-paper-canvas bg-white text-zinc-900 p-8 sm:p-10 rounded-sm shadow-md border border-zinc-200/80 w-full max-w-[820px] mx-auto text-left leading-relaxed ${
        fontFamily === 'serif' ? 'font-serif' : fontFamily === 'mono' ? 'font-mono' : 'font-sans'
      } ${className}`}
      style={{ boxSizing: 'border-box' }}
    >
      {/* Header: Large Clean Name */}
      <header className="pb-3 border-b border-zinc-200 mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl sm:text-4xl font-light tracking-tight text-zinc-900">
              <span className="font-extrabold uppercase">{contact.fullName?.split(' ')[0] || 'Candidate'}</span>{' '}
              <span className="text-zinc-600 uppercase font-light">
                {contact.fullName?.split(' ').slice(1).join(' ') || ''}
              </span>
            </h1>
            {headline && (
              <p
                className="text-xs font-semibold tracking-wider uppercase mt-0.5"
                style={{
                  color: accentColor,
                  WebkitPrintColorAdjust: 'exact',
                  printColorAdjust: 'exact',
                }}
              >
                {headline}
              </p>
            )}
          </div>

          {showPhoto && photoUrl && (
            <img
              src={photoUrl}
              alt={contact.fullName || 'Candidate'}
              className="w-16 h-16 rounded-full object-cover border-2 border-zinc-200 shadow-xs shrink-0"
            />
          )}
        </div>
      </header>

      {/* Asymmetric 2-Column Body: Left 32% | Right 68% */}
      <div className="flex flex-col md:flex-row print:flex-row gap-6">
        {/* Left Column (32%): Education, Links, Skills */}
        <aside className="w-full md:w-[32%] print:w-[32%] space-y-4 shrink-0 text-[10.5px]">
          {/* Contact Details */}
          <section className="space-y-1.5 pb-2 border-b border-zinc-100">
            <h2
              className="text-[11px] font-bold uppercase tracking-wider text-zinc-900"
              style={{
                color: accentColor,
                WebkitPrintColorAdjust: 'exact',
                printColorAdjust: 'exact',
              }}
            >
              Contact
            </h2>
            <div className="space-y-1 text-zinc-700">
              {contact.email && (
                <div className="flex items-center gap-1.5 break-all">
                  <Mail className="w-3 h-3 text-zinc-400 shrink-0" />
                  <a href={`mailto:${contact.email}`} className="hover:underline">
                    {contact.email}
                  </a>
                </div>
              )}
              {contact.phone && (
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3 h-3 text-zinc-400 shrink-0" />
                  <span>{contact.phone}</span>
                </div>
              )}
              {contact.location && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3 h-3 text-zinc-400 shrink-0" />
                  <span>{contact.location}</span>
                </div>
              )}
            </div>
          </section>

          {/* Links */}
          {(contact.linkedinUrl || contact.githubUrl) && (
            <section className="space-y-1.5 pb-2 border-b border-zinc-100">
              <h2
                className="text-[11px] font-bold uppercase tracking-wider text-zinc-900"
                style={{
                  color: accentColor,
                  WebkitPrintColorAdjust: 'exact',
                  printColorAdjust: 'exact',
                }}
              >
                Links
              </h2>
              <div className="space-y-1 text-zinc-700">
                {contact.linkedinUrl && (
                  <div className="flex items-center gap-1.5 truncate">
                    <LinkedinIcon className="w-3 h-3 text-zinc-400 shrink-0" />
                    <a
                      href={contact.linkedinUrl.startsWith('http') ? contact.linkedinUrl : `https://${contact.linkedinUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline truncate"
                    >
                      {contact.linkedinUrl.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, '')}
                    </a>
                  </div>
                )}
                {contact.githubUrl && (
                  <div className="flex items-center gap-1.5 truncate">
                    <GithubIcon className="w-3 h-3 text-zinc-400 shrink-0" />
                    <a
                      href={contact.githubUrl.startsWith('http') ? contact.githubUrl : `https://${contact.githubUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline truncate"
                    >
                      {contact.githubUrl.replace(/^https?:\/\/(www\.)?github\.com\//, '')}
                    </a>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Education in Left Column (Deedy Style) */}
          {education.length > 0 && (
            <section className="space-y-2 pb-2 border-b border-zinc-100">
              <h2
                className="text-[11px] font-bold uppercase tracking-wider text-zinc-900"
                style={{
                  color: accentColor,
                  WebkitPrintColorAdjust: 'exact',
                  printColorAdjust: 'exact',
                }}
              >
                Education
              </h2>
              <div className="space-y-2">
                {education.map((edu, idx) => (
                  <div key={edu.id || idx} className="space-y-0.5">
                    <div className="font-bold text-zinc-900 text-[11px] leading-tight">
                      {edu.school}
                    </div>
                    <div className="text-zinc-600 italic">
                      {edu.degree} in {edu.field}
                    </div>
                    <div className="text-[10px] text-zinc-500">
                      {edu.graduationDate} {edu.location ? `| ${edu.location}` : ''}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Skills in Left Column */}
          {skills.length > 0 && (
            <section className="space-y-2">
              <h2
                className="text-[11px] font-bold uppercase tracking-wider text-zinc-900"
                style={{
                  color: accentColor,
                  WebkitPrintColorAdjust: 'exact',
                  printColorAdjust: 'exact',
                }}
              >
                Skills
              </h2>
              <div className="flex flex-wrap gap-1 pt-0.5">
                {skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="inline-block px-1.5 py-0.5 rounded text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200/60 dark:border-zinc-700/60 font-medium"
                    style={{
                      WebkitPrintColorAdjust: 'exact',
                      printColorAdjust: 'exact',
                    }}
                  >
                    {skill.name}
                  </span>
                ))}
              </div>
            </section>
          )}
        </aside>

        {/* Right Column (68%): Summary, Experience, Projects */}
        <main className="w-full md:w-[68%] print:w-[68%] space-y-4">
          {/* Summary */}
          {summary && (
            <section className="resume-section">
              <h2
                className="text-xs font-bold uppercase tracking-wider text-zinc-900 pb-0.5 mb-1.5 border-b"
                style={{
                  borderBottomColor: accentColor,
                  WebkitPrintColorAdjust: 'exact',
                  printColorAdjust: 'exact',
                }}
              >
                Overview
              </h2>
              <p className="text-[10.5px] text-zinc-700 leading-relaxed">
                {renderHighlightedText(summary, highlightKeywords, showHighlights)}
              </p>
            </section>
          )}

          {/* Experience */}
          {experience.length > 0 && (
            <section className="resume-section">
              <h2
                className="text-xs font-bold uppercase tracking-wider text-zinc-900 pb-0.5 mb-2.5 border-b"
                style={{
                  borderBottomColor: accentColor,
                  WebkitPrintColorAdjust: 'exact',
                  printColorAdjust: 'exact',
                }}
              >
                Experience
              </h2>

              <div className="space-y-3.5">
                {experience.map((exp, idx) => (
                  <div key={exp.id || idx} className="resume-entry space-y-1">
                    <div className="flex justify-between items-baseline text-[11.5px]">
                      <div>
                        <span className="font-bold text-zinc-950">{exp.company}</span>
                        <span className="text-zinc-500 font-normal ml-1.5 text-[11px]">
                          | {exp.title}
                        </span>
                      </div>
                      <span className="text-[10px] text-zinc-500 font-medium shrink-0">
                        {exp.startDate} – {exp.current ? 'Present' : exp.endDate || 'Present'}
                      </span>
                    </div>

                    {exp.bullets && exp.bullets.length > 0 && (
                      <ul className="list-disc list-outside ml-4 space-y-0.5 text-[10.5px] text-zinc-800 leading-relaxed">
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
          {projects && projects.length > 0 && (
            <section className="resume-section">
              <h2
                className="text-xs font-bold uppercase tracking-wider text-zinc-900 pb-0.5 mb-2 border-b"
                style={{
                  borderBottomColor: accentColor,
                  WebkitPrintColorAdjust: 'exact',
                  printColorAdjust: 'exact',
                }}
              >
                Projects
              </h2>

              <div className="space-y-2.5">
                {projects.map((proj, idx) => (
                  <div key={proj.id || idx} className="resume-entry space-y-0.5">
                    <div className="flex justify-between items-baseline text-[11px]">
                      <div className="font-bold text-zinc-950 flex items-center gap-1.5">
                        <span>{proj.name}</span>
                        {proj.url && (
                          <span className="text-[10px] text-zinc-500 font-normal underline">
                            ({proj.url.replace(/^https?:\/\/(www\.)?/, '')})
                          </span>
                        )}
                      </div>
                    </div>
                    {proj.description && (
                      <p className="text-[10.5px] text-zinc-700 leading-normal">
                        {renderHighlightedText(proj.description, highlightKeywords, showHighlights)}
                      </p>
                    )}
                    {proj.highlights && proj.highlights.length > 0 && (
                      <ul className="list-disc list-outside ml-4 space-y-0.5 text-[10.5px] text-zinc-800 leading-relaxed">
                        {proj.highlights.map((h, hIdx) => (
                          <li key={hIdx} className="pl-0.5">
                            {renderHighlightedText(h, highlightKeywords, showHighlights)}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}

