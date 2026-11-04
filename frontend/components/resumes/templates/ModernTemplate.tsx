'use client';

import React from 'react';
import {
  MapPin,
  Mail,
  Phone,
  Globe,
  Calendar,
} from 'lucide-react';
import { TemplateProps, renderHighlightedText, LinkedinIcon, GithubIcon } from './types';

export function ModernTemplate({
  content,
  accentColor = '#2563eb', // Modern Blue
  showPhoto = false,
  photoUrl,
  highlightKeywords,
  showHighlights = false,
  className = '',
}: TemplateProps) {
  const { contact, headline, summary, experience = [], education = [], skills = [], projects = [] } = content;

  return (
    <div
      className={`resume-paper-canvas bg-white text-zinc-950 p-6 sm:p-10 rounded-sm shadow-md border border-zinc-200/80 w-full max-w-[820px] mx-auto text-left font-sans leading-relaxed ${className}`}
      style={{ boxSizing: 'border-box' }}
    >
      {/* Header */}
      <div className="pb-3 border-b-2" style={{ borderColor: accentColor }}>
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h1
              className="text-2xl sm:text-3xl font-extrabold tracking-tight"
              style={{ color: accentColor }}
            >
              {contact.fullName || 'Candidate Name'}
            </h1>
            {headline && (
              <p className="text-xs sm:text-[13px] font-semibold text-zinc-800">
                {headline}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1 text-[10.5px] text-zinc-600 pt-1">
              {contact.email && (
                <span className="inline-flex items-center gap-1">
                  <Mail className="w-3 h-3 text-zinc-400" />
                  <span>{contact.email}</span>
                </span>
              )}
              {contact.phone && (
                <span className="inline-flex items-center gap-1">
                  <Phone className="w-3 h-3 text-zinc-400" />
                  <span>{contact.phone}</span>
                </span>
              )}
              {contact.location && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-zinc-400" />
                  <span>{contact.location}</span>
                </span>
              )}
              {contact.linkedinUrl && (
                <span className="inline-flex items-center gap-1">
                  <LinkedinIcon className="w-3 h-3 text-zinc-400" />
                  <span>{contact.linkedinUrl.replace(/^https?:\/\/(www\.)?/, '')}</span>
                </span>
              )}
              {contact.githubUrl && (
                <span className="inline-flex items-center gap-1">
                  <GithubIcon className="w-3 h-3 text-zinc-400" />
                  <span>{contact.githubUrl.replace(/^https?:\/\/(www\.)?/, '')}</span>
                </span>
              )}
            </div>
          </div>

          {showPhoto && photoUrl && (
            <img
              src={photoUrl}
              alt={contact.fullName || 'Candidate'}
              className="w-16 h-16 rounded-full object-cover border-2 shadow-sm shrink-0"
              style={{ borderColor: accentColor }}
            />
          )}
        </div>
      </div>

      {/* Summary */}
      {summary && (
        <section className="mt-4 space-y-1.5">
          <h2
            className="text-xs font-bold uppercase tracking-wider pl-2 border-l-3"
            style={{ borderColor: accentColor, color: '#09090b' }}
          >
            Professional Summary
          </h2>
          <p className="text-[10.5px] text-zinc-700 leading-relaxed pt-0.5">
            {renderHighlightedText(summary, highlightKeywords, showHighlights)}
          </p>
        </section>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <section className="mt-4 space-y-3">
          <h2
            className="text-xs font-bold uppercase tracking-wider pl-2 border-l-3"
            style={{ borderColor: accentColor, color: '#09090b' }}
          >
            Work Experience
          </h2>

          <div className="space-y-3.5">
            {experience.map((exp, idx) => (
              <div key={exp.id || idx} className="space-y-1">
                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-xs text-zinc-950">
                    {exp.title}
                  </span>
                  <span className="text-[10px] text-zinc-500 font-medium">
                    {exp.startDate} – {exp.current ? 'Present' : exp.endDate || ''}
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
                  <ul className="list-disc pl-3.5 space-y-0.5 text-[10.5px] text-zinc-700 leading-relaxed pt-0.5">
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
        <section className="mt-4 space-y-2">
          <h2
            className="text-xs font-bold uppercase tracking-wider pl-2 border-l-3"
            style={{ borderColor: accentColor, color: '#09090b' }}
          >
            Skills & Technologies
          </h2>
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {skills.map((s, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 text-[10px] rounded font-medium bg-zinc-100 text-zinc-800 border border-zinc-200"
              >
                {s.name}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {education.length > 0 && (
        <section className="mt-4 space-y-2">
          <h2
            className="text-xs font-bold uppercase tracking-wider pl-2 border-l-3"
            style={{ borderColor: accentColor, color: '#09090b' }}
          >
            Education
          </h2>
          <div className="space-y-1.5">
            {education.map((edu, idx) => (
              <div key={idx} className="flex justify-between items-baseline text-[10.5px] text-zinc-800">
                <div>
                  <span className="font-bold text-zinc-950">
                    {edu.degree}
                    {edu.field ? `, ${edu.field}` : ''}
                  </span>
                  <span className="text-zinc-600"> — {edu.school}</span>
                </div>
                <span className="text-[10px] text-zinc-500 shrink-0">{edu.graduationDate}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <section className="mt-4 space-y-2">
          <h2
            className="text-xs font-bold uppercase tracking-wider pl-2 border-l-3"
            style={{ borderColor: accentColor, color: '#09090b' }}
          >
            Projects
          </h2>
          <div className="space-y-2 text-[10.5px] text-zinc-800">
            {projects.map((proj, idx) => (
              <div key={idx} className="space-y-0.5">
                <div className="font-bold text-zinc-950">
                  {proj.name}
                </div>
                <p className="text-zinc-700">
                  {renderHighlightedText(proj.description, highlightKeywords, showHighlights)}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
