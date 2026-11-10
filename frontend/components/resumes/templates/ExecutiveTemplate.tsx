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
  Award,
} from 'lucide-react';
import { TemplateProps, renderHighlightedText, LinkedinIcon, GithubIcon } from './types';
import { CustomSectionsBlock } from './CustomSectionsBlock';

/**
 * Executive Leadership Template
 * Inspired by Kickresume & Novoresume C-suite and Senior Director formats.
 * Features an authoritative header, thick accent left-edge section indicators,
 * dedicated executive summary styling, and metric-focused typography.
 */
export function ExecutiveTemplate({
  content,
  accentColor = '#1e3a8a', // Deep Navy default
  fontFamily = 'serif',
  showPhoto = false,
  photoUrl,
  highlightKeywords,
  showHighlights = false,
  className = '',
}: TemplateProps) {
  const { contact, headline, summary, experience = [], education = [], skills = [], projects = [] } = content;

  return (
    <div
      className={`resume-page-a4 resume-paper-canvas bg-white text-zinc-900 p-8 sm:p-12 rounded-sm shadow-md border border-zinc-200/80 w-full max-w-[820px] mx-auto text-left leading-relaxed ${
        fontFamily === 'serif' ? 'font-serif' : fontFamily === 'mono' ? 'font-mono' : 'font-sans'
      } ${className}`}
      style={{ boxSizing: 'border-box' }}
    >
      {/* Executive Header */}
      <header className="pb-5 border-b border-zinc-200/80 mb-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-950 uppercase">
              {contact.fullName || 'Candidate Name'}
            </h1>
            {headline && (
              <p
                className="text-xs sm:text-sm font-semibold tracking-wide uppercase"
                style={{
                  color: accentColor,
                  WebkitPrintColorAdjust: 'exact',
                  printColorAdjust: 'exact',
                }}
              >
                {headline}
              </p>
            )}

            {/* Horizontal Contact Strip */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10.5px] text-zinc-600 pt-1.5 font-sans">
              {contact.location && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-zinc-400 shrink-0" />
                  <span>{contact.location}</span>
                </span>
              )}
              {contact.phone && (
                <span className="inline-flex items-center gap-1">
                  <Phone className="w-3 h-3 text-zinc-400 shrink-0" />
                  <span>{contact.phone}</span>
                </span>
              )}
              {contact.email && (
                <a
                  href={`mailto:${contact.email}`}
                  className="inline-flex items-center gap-1 text-zinc-700 hover:underline"
                >
                  <Mail className="w-3 h-3 text-zinc-400 shrink-0" />
                  <span>{contact.email}</span>
                </a>
              )}
              {contact.linkedinUrl && (
                <a
                  href={contact.linkedinUrl.startsWith('http') ? contact.linkedinUrl : `https://${contact.linkedinUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-zinc-700 hover:underline"
                >
                  <LinkedinIcon className="w-3 h-3 text-zinc-400 shrink-0" />
                  <span>{contact.linkedinUrl.replace(/^https?:\/\/(www\.)?/, '')}</span>
                </a>
              )}
              {contact.githubUrl && (
                <a
                  href={contact.githubUrl.startsWith('http') ? contact.githubUrl : `https://${contact.githubUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-zinc-700 hover:underline"
                >
                  <GithubIcon className="w-3 h-3 text-zinc-400 shrink-0" />
                  <span>{contact.githubUrl.replace(/^https?:\/\/(www\.)?/, '')}</span>
                </a>
              )}
            </div>
          </div>

          {showPhoto && photoUrl && (
            <img
              src={photoUrl}
              alt={contact.fullName || 'Candidate'}
              className="w-20 h-20 rounded-xl object-cover border-2 shadow-sm shrink-0"
              style={{
                borderColor: accentColor,
                WebkitPrintColorAdjust: 'exact',
                printColorAdjust: 'exact',
              }}
            />
          )}
        </div>
      </header>

      {/* Main Content Body */}
      <div className="space-y-5">
        {/* Executive Summary */}
        {summary && (
          <section className="resume-section">
            <div className="flex items-center gap-2 mb-1.5">
              <span
                className="w-1 h-3.5 rounded-full inline-block"
                style={{
                  backgroundColor: accentColor,
                  WebkitPrintColorAdjust: 'exact',
                  printColorAdjust: 'exact',
                }}
              />
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-950 font-sans">
                Executive Profile
              </h2>
            </div>
            <p className="text-[10.5px] text-zinc-700 leading-relaxed pl-3 border-l-2 border-zinc-100">
              {renderHighlightedText(summary, highlightKeywords, showHighlights)}
            </p>
          </section>
        )}

        {/* Professional Experience */}
        {experience.length > 0 && (
          <section className="resume-section">
            <div className="flex items-center gap-2 mb-2.5">
              <span
                className="w-1 h-3.5 rounded-full inline-block"
                style={{
                  backgroundColor: accentColor,
                  WebkitPrintColorAdjust: 'exact',
                  printColorAdjust: 'exact',
                }}
              />
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-950 font-sans">
                Professional Experience
              </h2>
            </div>

            <div className="space-y-3.5">
              {experience.map((exp, idx) => (
                <div key={exp.id || idx} className="resume-entry space-y-1">
                  <div className="flex justify-between items-baseline text-[11.5px]">
                    <span className="font-bold text-zinc-950">{exp.company}</span>
                    <span className="text-[10.5px] text-zinc-500 font-medium font-sans">
                      {exp.location || ''}
                    </span>
                  </div>

                  <div className="flex justify-between items-baseline text-[11px]">
                    <span
                      className="font-semibold italic"
                      style={{
                        color: accentColor,
                        WebkitPrintColorAdjust: 'exact',
                        printColorAdjust: 'exact',
                      }}
                    >
                      {exp.title}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-sans font-medium">
                      {exp.startDate} – {exp.current ? 'Present' : exp.endDate || 'Present'}
                    </span>
                  </div>

                  {exp.bullets && exp.bullets.length > 0 && (
                    <ul className="list-disc list-outside ml-4 space-y-0.5 pt-0.5 text-[10.5px] text-zinc-800 leading-relaxed">
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

        {/* Selected Initiatives & Projects */}
        {projects && projects.length > 0 && (
          <section className="resume-section">
            <div className="flex items-center gap-2 mb-2">
              <span
                className="w-1 h-3.5 rounded-full inline-block"
                style={{
                  backgroundColor: accentColor,
                  WebkitPrintColorAdjust: 'exact',
                  printColorAdjust: 'exact',
                }}
              />
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-950 font-sans">
                Key Initiatives & Projects
              </h2>
            </div>

            <div className="space-y-2.5">
              {projects.map((proj, idx) => (
                <div key={proj.id || idx} className="resume-entry space-y-0.5">
                  <div className="flex justify-between items-baseline text-[11px]">
                    <div className="font-bold text-zinc-950 flex items-center gap-1.5">
                      <span>{proj.name}</span>
                      {proj.url && (
                        <span className="text-[10px] text-zinc-500 font-normal font-sans underline">
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

        {/* 2-Column Row for Core Competencies & Education */}
        <div className="grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-6 pt-1">
          {/* Skills */}
          {skills.length > 0 && (
            <section className="resume-section">
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="w-1 h-3.5 rounded-full inline-block"
                  style={{
                    backgroundColor: accentColor,
                    WebkitPrintColorAdjust: 'exact',
                    printColorAdjust: 'exact',
                  }}
                />
                <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-950 font-sans">
                  Core Competencies
                </h2>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200/60 dark:border-zinc-700/60 font-sans"
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

          {/* Education */}
          {education.length > 0 && (
            <section className="resume-section">
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="w-1 h-3.5 rounded-full inline-block"
                  style={{
                    backgroundColor: accentColor,
                    WebkitPrintColorAdjust: 'exact',
                    printColorAdjust: 'exact',
                  }}
                />
                <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-950 font-sans">
                  Education & Credentials
                </h2>
              </div>
              <div className="space-y-1.5">
                {education.map((edu, idx) => (
                  <div key={edu.id || idx} className="resume-entry text-[10.5px]">
                    <div className="font-bold text-zinc-950">{edu.school}</div>
                    <div className="text-zinc-600">
                      {edu.degree} in {edu.field}
                    </div>
                    <div className="text-[10px] text-zinc-500 font-sans">
                      {edu.graduationDate} {edu.location ? `| ${edu.location}` : ''}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        <CustomSectionsBlock
          content={content}
          accentColor={accentColor}
          highlightKeywords={highlightKeywords}
          showHighlights={showHighlights}
          variant="bar"
        />
      </div>
    </div>
  );
}

