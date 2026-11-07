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
  Code2,
} from 'lucide-react';
import { TemplateProps, renderHighlightedText, LinkedinIcon, GithubIcon } from './types';

/**
 * Awesome CV Template
 * Inspired by Claud D. Park's world-famous Awesome-CV LaTeX/XeTeX template.
 * Features customizable accent-colored typography, sleek vector contact bar,
 * prominent section underline rules, and crisp tabular entry hierarchy.
 */
export function AwesomeCVTemplate({
  content,
  accentColor = '#dc2626', // Classic Awesome Red default, customizable
  fontFamily = 'sans',
  showPhoto = false,
  photoUrl,
  highlightKeywords,
  showHighlights = false,
  className = '',
}: TemplateProps) {
  const { contact, headline, summary, experience = [], education = [], skills = [], projects = [] } = content;

  // Split name for Awesome-CV two-tone effect (e.g. "Claud D." + "PARK")
  const nameParts = (contact.fullName || 'Candidate Name').trim().split(' ');
  const firstName = nameParts.slice(0, -1).join(' ') || nameParts[0] || '';
  const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';

  return (
    <div
      className={`resume-page-a4 resume-paper-canvas bg-white text-zinc-900 p-8 sm:p-11 rounded-sm shadow-md border border-zinc-200/80 w-full max-w-[820px] mx-auto text-left leading-relaxed ${
        fontFamily === 'serif' ? 'font-serif' : fontFamily === 'mono' ? 'font-mono' : 'font-sans'
      } ${className}`}
      style={{ boxSizing: 'border-box' }}
    >
      {/* Awesome CV Header */}
      <header className="pb-4 text-center">
        <div className="flex flex-col items-center">
          {showPhoto && photoUrl && (
            <img
              src={photoUrl}
              alt={contact.fullName || 'Candidate'}
              className="w-20 h-20 rounded-full object-cover border-2 shadow-sm mb-3"
              style={{ borderColor: accentColor }}
            />
          )}

          {/* Two-tone Name */}
          <h1 className="text-3xl sm:text-4xl tracking-tight text-zinc-900">
            <span className="font-light text-zinc-700">{firstName} </span>
            <span
              className="font-extrabold uppercase"
              style={{
                color: accentColor,
                WebkitPrintColorAdjust: 'exact',
                printColorAdjust: 'exact',
              }}
            >
              {lastName || firstName}
            </span>
          </h1>

          {/* Subtitle / Headline */}
          {headline && (
            <p
              className="text-xs sm:text-[13px] font-semibold tracking-wider uppercase mt-1"
              style={{
                color: accentColor,
                WebkitPrintColorAdjust: 'exact',
                printColorAdjust: 'exact',
              }}
            >
              {headline}
            </p>
          )}

          {/* Vector Icon Contact Bar */}
          <div className="flex flex-wrap items-center justify-center gap-x-3.5 gap-y-1 text-[10.5px] text-zinc-600 mt-2.5">
            {contact.phone && (
              <span className="inline-flex items-center gap-1">
                <Phone className="w-3 h-3 text-zinc-400 shrink-0" />
                <span>{contact.phone}</span>
              </span>
            )}
            {contact.email && (
              <a
                href={`mailto:${contact.email}`}
                className="inline-flex items-center gap-1 hover:text-zinc-900 transition-colors"
              >
                <Mail className="w-3 h-3 text-zinc-400 shrink-0" />
                <span>{contact.email}</span>
              </a>
            )}
            {contact.location && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="w-3 h-3 text-zinc-400 shrink-0" />
                <span>{contact.location}</span>
              </span>
            )}
            {contact.linkedinUrl && (
              <a
                href={contact.linkedinUrl.startsWith('http') ? contact.linkedinUrl : `https://${contact.linkedinUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 hover:text-zinc-900 transition-colors"
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
                className="inline-flex items-center gap-1 hover:text-zinc-900 transition-colors"
              >
                <GithubIcon className="w-3 h-3 text-zinc-400 shrink-0" />
                <span>{contact.githubUrl.replace(/^https?:\/\/(www\.)?/, '')}</span>
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Sections Container */}
      <div className="space-y-4 pt-1">
        {/* Profile Summary */}
        {summary && (
          <section className="resume-section">
            <h2
              className="text-xs font-bold uppercase tracking-wider text-zinc-900 pb-0.5 mb-1.5 flex items-center justify-between border-b-2"
              style={{
                borderBottomColor: accentColor,
                WebkitPrintColorAdjust: 'exact',
                printColorAdjust: 'exact',
              }}
            >
              <span>Profile</span>
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
              className="text-xs font-bold uppercase tracking-wider text-zinc-900 pb-0.5 mb-2.5 flex items-center justify-between border-b-2"
              style={{
                borderBottomColor: accentColor,
                WebkitPrintColorAdjust: 'exact',
                printColorAdjust: 'exact',
              }}
            >
              <span>Work Experience</span>
            </h2>

            <div className="space-y-3.5">
              {experience.map((exp, idx) => (
                <div key={exp.id || idx} className="resume-entry space-y-1">
                  {/* Row 1: Title & Location */}
                  <div className="flex justify-between items-baseline text-[11.5px]">
                    <span className="font-bold text-zinc-950">{exp.title}</span>
                    <span className="text-[10.5px] text-zinc-500 font-medium">
                      {exp.location || ''}
                    </span>
                  </div>

                  {/* Row 2: Company in Accent & Dates */}
                  <div className="flex justify-between items-baseline text-[10.5px]">
                    <span
                      className="font-semibold text-xs"
                      style={{
                        color: accentColor,
                        WebkitPrintColorAdjust: 'exact',
                        printColorAdjust: 'exact',
                      }}
                    >
                      {exp.company}
                    </span>
                    <span className="text-zinc-500 font-medium">
                      {exp.startDate} – {exp.current ? 'Present' : exp.endDate || 'Present'}
                    </span>
                  </div>

                  {/* Bullets */}
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

        {/* Projects */}
        {projects && projects.length > 0 && (
          <section className="resume-section">
            <h2
              className="text-xs font-bold uppercase tracking-wider text-zinc-900 pb-0.5 mb-2 flex items-center justify-between border-b-2"
              style={{
                borderBottomColor: accentColor,
                WebkitPrintColorAdjust: 'exact',
                printColorAdjust: 'exact',
              }}
            >
              <span>Projects</span>
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

        {/* Skills */}
        {skills.length > 0 && (
          <section className="resume-section">
            <h2
              className="text-xs font-bold uppercase tracking-wider text-zinc-900 pb-0.5 mb-2 flex items-center justify-between border-b-2"
              style={{
                borderBottomColor: accentColor,
                WebkitPrintColorAdjust: 'exact',
                printColorAdjust: 'exact',
              }}
            >
              <span>Skills & Competencies</span>
            </h2>

            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200/60 dark:border-zinc-700/60"
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
            <h2
              className="text-xs font-bold uppercase tracking-wider text-zinc-900 pb-0.5 mb-2 flex items-center justify-between border-b-2"
              style={{
                borderBottomColor: accentColor,
                WebkitPrintColorAdjust: 'exact',
                printColorAdjust: 'exact',
              }}
            >
              <span>Education</span>
            </h2>

            <div className="space-y-2">
              {education.map((edu, idx) => (
                <div key={edu.id || idx} className="resume-entry text-[11px]">
                  <div className="flex justify-between items-baseline font-bold text-zinc-950">
                    <span>{edu.school}</span>
                    <span className="font-normal text-zinc-500 text-[10.5px]">
                      {edu.location || ''}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline text-zinc-700 text-[10.5px]">
                    <span
                      className="font-medium"
                      style={{
                        color: accentColor,
                        WebkitPrintColorAdjust: 'exact',
                        printColorAdjust: 'exact',
                      }}
                    >
                      {edu.degree} in {edu.field}
                    </span>
                    <span className="text-zinc-500 font-normal">
                      {edu.graduationDate || ''}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

