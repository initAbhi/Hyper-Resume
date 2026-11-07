'use client';

import React from 'react';
import { TemplateProps, renderHighlightedText } from './types';

/**
 * Jake's Resume Template
 * Modeled after the world-famous Jake Gutierrez Overleaf / LaTeX CS resume template.
 * 100% ATS parser compliant, clean single-column geometry, tight horizontal rules,
 * tabular two-sided alignment (Title/Company left, Date/Location right).
 */
export function JakeTemplate({
  content,
  accentColor = '#000000',
  fontFamily = 'serif',
  showPhoto = false,
  photoUrl,
  highlightKeywords,
  showHighlights = false,
  className = '',
}: TemplateProps) {
  const { contact, headline, summary, experience = [], education = [], skills = [], projects = [] } = content;

  // Group skills by category if available, else group into standard buckets
  const skillsByCategory = React.useMemo(() => {
    if (!skills || skills.length === 0) return [];
    const map = new Map<string, string[]>();
    skills.forEach((s) => {
      const cat = s.category || 'Core Skills';
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(s.name);
    });
    return Array.from(map.entries()).map(([category, items]) => ({
      category,
      items: items.join(', '),
    }));
  }, [skills]);

  return (
    <div
      className={`resume-page-a4 resume-paper-canvas bg-white text-zinc-950 p-8 sm:p-11 rounded-sm shadow-md border border-zinc-200/80 w-full max-w-[820px] mx-auto text-left leading-relaxed ${
        fontFamily === 'serif' ? 'font-serif' : fontFamily === 'mono' ? 'font-mono' : 'font-sans'
      } ${className}`}
      style={{ boxSizing: 'border-box' }}
    >
      {/* Centered Name & Contact Header */}
      <header className="text-center pb-3 border-b border-transparent">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950 uppercase">
          {contact.fullName || 'Candidate Name'}
        </h1>
        {headline && (
          <p className="text-xs font-medium text-zinc-700 mt-0.5 tracking-wide">
            {headline}
          </p>
        )}

        {/* Contact Line with Separators */}
        <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[10.5px] text-zinc-700 mt-2 font-normal">
          {contact.phone && <span>{contact.phone}</span>}
          {contact.phone && (contact.email || contact.location || contact.linkedinUrl || contact.githubUrl) && (
            <span className="text-zinc-400 select-none">|</span>
          )}

          {contact.email && (
            <a href={`mailto:${contact.email}`} className="text-zinc-800 hover:underline">
              {contact.email}
            </a>
          )}
          {contact.email && (contact.location || contact.linkedinUrl || contact.githubUrl) && (
            <span className="text-zinc-400 select-none">|</span>
          )}

          {contact.location && <span>{contact.location}</span>}
          {contact.location && (contact.linkedinUrl || contact.githubUrl) && (
            <span className="text-zinc-400 select-none">|</span>
          )}

          {contact.linkedinUrl && (
            <a
              href={contact.linkedinUrl.startsWith('http') ? contact.linkedinUrl : `https://${contact.linkedinUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-800 hover:underline"
            >
              {contact.linkedinUrl.replace(/^https?:\/\/(www\.)?/, '')}
            </a>
          )}
          {contact.linkedinUrl && contact.githubUrl && (
            <span className="text-zinc-400 select-none">|</span>
          )}

          {contact.githubUrl && (
            <a
              href={contact.githubUrl.startsWith('http') ? contact.githubUrl : `https://${contact.githubUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-800 hover:underline"
            >
              {contact.githubUrl.replace(/^https?:\/\/(www\.)?/, '')}
            </a>
          )}
        </div>
      </header>

      {/* Main Content Sections */}
      <div className="space-y-4 pt-1">
        {/* Education (LaTeX standard places Education at top or after summary) */}
        {education.length > 0 && (
          <section className="resume-section">
            <h2
              className="text-xs font-bold uppercase tracking-wider text-zinc-950 pb-0.5 mb-2 border-b"
              style={{ borderBottomColor: accentColor !== '#000000' ? accentColor : '#18181b', borderBottomWidth: '1.5px' }}
            >
              Education
            </h2>
            <div className="space-y-2">
              {education.map((edu, idx) => (
                <div key={edu.id || idx} className="resume-entry text-[11px]">
                  <div className="flex justify-between items-baseline font-bold text-zinc-950">
                    <span>{edu.school}</span>
                    <span className="font-semibold text-zinc-700 text-[10.5px]">
                      {edu.location || ''}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline text-zinc-700 italic text-[10.5px]">
                    <span>
                      {edu.degree} in {edu.field}
                    </span>
                    <span className="not-italic text-zinc-600 font-normal">
                      {edu.graduationDate || ''}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Experience Section */}
        {experience.length > 0 && (
          <section className="resume-section">
            <h2
              className="text-xs font-bold uppercase tracking-wider text-zinc-950 pb-0.5 mb-2 border-b"
              style={{ borderBottomColor: accentColor !== '#000000' ? accentColor : '#18181b', borderBottomWidth: '1.5px' }}
            >
              Experience
            </h2>
            <div className="space-y-3">
              {experience.map((exp, idx) => (
                <div key={exp.id || idx} className="resume-entry space-y-1">
                  <div className="flex justify-between items-baseline text-[11px]">
                    <span className="font-bold text-zinc-950">{exp.company}</span>
                    <span className="font-medium text-zinc-700 text-[10.5px]">
                      {exp.location || ''}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline text-[10.5px] italic text-zinc-700">
                    <span>{exp.title}</span>
                    <span className="not-italic text-zinc-600 font-normal">
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

        {/* Projects Section */}
        {projects && projects.length > 0 && (
          <section className="resume-section">
            <h2
              className="text-xs font-bold uppercase tracking-wider text-zinc-950 pb-0.5 mb-2 border-b"
              style={{ borderBottomColor: accentColor !== '#000000' ? accentColor : '#18181b', borderBottomWidth: '1.5px' }}
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

        {/* Technical Skills Section */}
        {skills.length > 0 && (
          <section className="resume-section">
            <h2
              className="text-xs font-bold uppercase tracking-wider text-zinc-950 pb-0.5 mb-1.5 border-b"
              style={{ borderBottomColor: accentColor !== '#000000' ? accentColor : '#18181b', borderBottomWidth: '1.5px' }}
            >
              Technical Skills
            </h2>
            <div className="space-y-1 text-[10.5px] text-zinc-800">
              {skillsByCategory.length > 0 ? (
                skillsByCategory.map((group, idx) => (
                  <div key={idx} className="flex gap-1.5 items-baseline">
                    <span className="font-bold text-zinc-950 shrink-0">
                      {group.category}:
                    </span>
                    <span className="text-zinc-700">{group.items}</span>
                  </div>
                ))
              ) : (
                <div className="flex gap-1.5 items-baseline">
                  <span className="font-bold text-zinc-950">Skills:</span>
                  <span className="text-zinc-700">
                    {skills.map((s) => s.name).join(', ')}
                  </span>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Professional Summary (if present) */}
        {summary && (
          <section className="resume-section pt-1">
            <h2
              className="text-xs font-bold uppercase tracking-wider text-zinc-950 pb-0.5 mb-1.5 border-b"
              style={{ borderBottomColor: accentColor !== '#000000' ? accentColor : '#18181b', borderBottomWidth: '1.5px' }}
            >
              Professional Summary
            </h2>
            <p className="text-[10.5px] text-zinc-700 leading-relaxed">
              {renderHighlightedText(summary, highlightKeywords, showHighlights)}
            </p>
          </section>
        )}
      </div>
    </div>
  );
}

