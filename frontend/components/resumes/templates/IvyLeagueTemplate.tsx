'use client';

import React from 'react';
import { TemplateProps, renderHighlightedText } from './types';

export function IvyLeagueTemplate({
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
      className={`resume-paper-canvas bg-white text-zinc-950 p-6 sm:p-12 rounded-sm shadow-md border border-zinc-200/80 w-full max-w-[820px] mx-auto text-left font-serif leading-relaxed ${className}`}
      style={{ boxSizing: 'border-box' }}
    >
      {/* Centered Academic Header */}
      <div className="text-center pb-3 border-b border-zinc-300">
        <h1 className="text-2xl sm:text-3xl font-normal tracking-wide text-zinc-950 uppercase font-serif">
          {contact.fullName || 'Candidate Name'}
        </h1>

        {headline && (
          <p className="text-xs sm:text-[12px] italic text-zinc-700 mt-1">
            {headline}
          </p>
        )}

        <div className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 text-[10.5px] text-zinc-600 mt-2 font-sans">
          {contact.location && <span>{contact.location}</span>}
          {contact.location && contact.phone && <span>•</span>}
          {contact.phone && <span>{contact.phone}</span>}
          {contact.phone && contact.email && <span>•</span>}
          {contact.email && <span>{contact.email}</span>}
          {contact.linkedinUrl && <span>•</span>}
          {contact.linkedinUrl && (
            <span>{contact.linkedinUrl.replace(/^https?:\/\/(www\.)?/, '')}</span>
          )}
          {contact.githubUrl && <span>•</span>}
          {contact.githubUrl && (
            <span>{contact.githubUrl.replace(/^https?:\/\/(www\.)?/, '')}</span>
          )}
        </div>
      </div>

      {/* Summary */}
      {summary && (
        <section className="mt-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-900 border-b border-zinc-900 pb-0.5 mb-1.5 text-center font-serif">
            Executive Summary
          </h2>
          <p className="text-[11px] text-zinc-800 leading-relaxed text-justify">
            {renderHighlightedText(summary, highlightKeywords, showHighlights)}
          </p>
        </section>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <section className="mt-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-900 border-b border-zinc-900 pb-0.5 mb-2 text-center font-serif">
            Professional Experience
          </h2>

          <div className="space-y-3.5">
            {experience.map((exp, idx) => (
              <div key={exp.id || idx} className="space-y-1">
                <div className="flex justify-between items-baseline text-xs font-bold text-zinc-950">
                  <span>{exp.company}</span>
                  <span className="text-[10px] font-normal text-zinc-600 font-sans">
                    {exp.location || ''}
                  </span>
                </div>
                <div className="flex justify-between items-baseline text-[11px] italic text-zinc-800">
                  <span>{exp.title}</span>
                  <span className="text-[10px] not-italic text-zinc-600 font-sans">
                    {exp.startDate} – {exp.current ? 'Present' : exp.endDate || ''}
                  </span>
                </div>

                {exp.bullets && exp.bullets.length > 0 && (
                  <ul className="list-disc pl-4 space-y-0.5 text-[10.5px] text-zinc-800 leading-relaxed">
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

      {/* Education */}
      {education.length > 0 && (
        <section className="mt-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-900 border-b border-zinc-900 pb-0.5 mb-2 text-center font-serif">
            Education
          </h2>
          <div className="space-y-2">
            {education.map((edu, idx) => (
              <div key={idx} className="space-y-0.5">
                <div className="flex justify-between items-baseline text-[11px] font-bold text-zinc-950">
                  <span>{edu.school}</span>
                  <span className="text-[10px] font-normal text-zinc-600 font-sans">
                    {edu.graduationDate}
                  </span>
                </div>
                <div className="flex justify-between items-baseline text-[10.5px] italic text-zinc-800">
                  <span>
                    {edu.degree}
                    {edu.field ? `, ${edu.field}` : ''}
                  </span>
                  {edu.location && (
                    <span className="text-[10px] not-italic text-zinc-500 font-sans">
                      {edu.location}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <section className="mt-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-900 border-b border-zinc-900 pb-0.5 mb-2 text-center font-serif">
            Key Projects
          </h2>
          <div className="space-y-2">
            {projects.map((proj, idx) => (
              <div key={idx} className="space-y-0.5 text-[10.5px]">
                <div className="font-bold text-zinc-950">
                  {proj.name}
                </div>
                <p className="text-zinc-800">
                  {renderHighlightedText(proj.description, highlightKeywords, showHighlights)}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <section className="mt-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-900 border-b border-zinc-900 pb-0.5 mb-1.5 text-center font-serif">
            Areas of Expertise & Skills
          </h2>
          <p className="text-[10.5px] text-zinc-800 text-center leading-relaxed font-sans">
            {skills.map((s) => s.name).join(' • ')}
          </p>
        </section>
      )}
    </div>
  );
}

