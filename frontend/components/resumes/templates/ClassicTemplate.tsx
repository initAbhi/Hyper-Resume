'use client';

import React from 'react';
import { TemplateProps, renderHighlightedText } from './types';

export function ClassicTemplate({
  content,
  accentColor = '#18181b',
  showPhoto = false,
  photoUrl,
  highlightKeywords,
  showHighlights = false,
  className = '',
}: TemplateProps) {
  const { contact, headline, summary, experience = [], education = [], skills = [], projects = [] } = content;

  return (
    <div
      className={`resume-paper-canvas bg-white text-zinc-950 p-6 sm:p-12 rounded-sm shadow-md border border-zinc-200/80 w-full max-w-[820px] mx-auto text-left font-sans leading-relaxed ${className}`}
      style={{ boxSizing: 'border-box' }}
    >
      {/* Header */}
      <div className="text-center pb-2 border-b-2 border-zinc-950">
        <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-wider text-zinc-950">
          {contact.fullName || 'Candidate Name'}
        </h1>

        {headline && (
          <p className="text-xs sm:text-[12px] font-bold text-zinc-800 mt-0.5">
            {headline}
          </p>
        )}

        <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[10.5px] text-zinc-700 mt-1">
          {contact.location && <span>{contact.location}</span>}
          {contact.location && contact.phone && <span>|</span>}
          {contact.phone && <span>{contact.phone}</span>}
          {contact.phone && contact.email && <span>|</span>}
          {contact.email && <span>{contact.email}</span>}
          {contact.linkedinUrl && <span>|</span>}
          {contact.linkedinUrl && (
            <span>{contact.linkedinUrl.replace(/^https?:\/\/(www\.)?/, '')}</span>
          )}
          {contact.githubUrl && <span>|</span>}
          {contact.githubUrl && (
            <span>{contact.githubUrl.replace(/^https?:\/\/(www\.)?/, '')}</span>
          )}
        </div>
      </div>

      {/* Professional Summary */}
      {summary && (
        <section className="mt-3.5">
          <h2 className="text-xs font-black uppercase tracking-wider text-zinc-950 border-b border-zinc-950 pb-0.5 mb-1">
            Professional Summary
          </h2>
          <p className="text-[10.5px] text-zinc-800 leading-relaxed text-justify">
            {renderHighlightedText(summary, highlightKeywords, showHighlights)}
          </p>
        </section>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <section className="mt-3.5">
          <h2 className="text-xs font-black uppercase tracking-wider text-zinc-950 border-b border-zinc-950 pb-0.5 mb-2">
            Work Experience
          </h2>

          <div className="space-y-3">
            {experience.map((exp, idx) => (
              <div key={exp.id || idx} className="space-y-0.5">
                <div className="flex justify-between items-baseline text-xs font-bold text-zinc-950">
                  <span>
                    {exp.title}
                    <span className="font-semibold text-zinc-700"> — {exp.company}</span>
                  </span>
                  <span className="text-[10px] text-zinc-600 font-normal shrink-0">
                    {exp.startDate} – {exp.current ? 'Present' : exp.endDate || ''}
                  </span>
                </div>

                {exp.bullets && exp.bullets.length > 0 && (
                  <ul className="list-disc pl-4 space-y-0.5 text-[10px] text-zinc-800 leading-snug">
                    {exp.bullets.map((bullet, bIdx) => (
                      <li key={bIdx}>
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

      {/* Technical Skills */}
      {skills.length > 0 && (
        <section className="mt-3.5">
          <h2 className="text-xs font-black uppercase tracking-wider text-zinc-950 border-b border-zinc-950 pb-0.5 mb-1">
            Technical & Core Competencies
          </h2>
          <p className="text-[10px] text-zinc-800 leading-relaxed">
            {skills.map((s) => s.name).join(' • ')}
          </p>
        </section>
      )}

      {/* Education */}
      {education.length > 0 && (
        <section className="mt-3.5">
          <h2 className="text-xs font-black uppercase tracking-wider text-zinc-950 border-b border-zinc-950 pb-0.5 mb-1.5">
            Education
          </h2>
          <div className="space-y-1">
            {education.map((edu, idx) => (
              <div key={idx} className="flex justify-between items-baseline text-[10px] text-zinc-800">
                <div>
                  <span className="font-bold text-zinc-950">
                    {edu.degree}
                    {edu.field ? ` in ${edu.field}` : ''}
                  </span>
                  <span className="text-zinc-600"> — {edu.school}</span>
                  {edu.location && <span className="text-zinc-500">, {edu.location}</span>}
                </div>
                <span className="text-zinc-600 shrink-0">{edu.graduationDate}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <section className="mt-3.5">
          <h2 className="text-xs font-black uppercase tracking-wider text-zinc-950 border-b border-zinc-950 pb-0.5 mb-1.5">
            Projects
          </h2>
          <div className="space-y-1 text-[10px] text-zinc-800">
            {projects.map((proj, idx) => (
              <div key={idx}>
                <span className="font-bold text-zinc-950">{proj.name}: </span>
                <span>{renderHighlightedText(proj.description, highlightKeywords, showHighlights)}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

