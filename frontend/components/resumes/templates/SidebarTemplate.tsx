'use client';

import React from 'react';
import {
  MapPin,
  Mail,
  Phone,
  Globe,
  Calendar,
  User,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import { TemplateProps, renderHighlightedText, LinkedinIcon, GithubIcon } from './types';

export function SidebarTemplate({
  content,
  accentColor = '#1e3a8a', // Dark Navy default
  showPhoto = true,
  photoUrl,
  highlightKeywords,
  showHighlights = false,
  className = '',
}: TemplateProps) {
  const { contact, headline, summary, experience = [], education = [], skills = [], projects = [] } = content;

  return (
    <div
      className={`resume-paper-canvas bg-white text-zinc-950 rounded-sm shadow-md border border-zinc-200/80 w-full max-w-[820px] mx-auto text-left flex flex-col md:flex-row overflow-hidden min-h-[950px] ${className}`}
      style={{ boxSizing: 'border-box' }}
    >
      {/* Dark Navy Left Sidebar (35%) */}
      <div
        className="w-full md:w-[34%] p-6 sm:p-7 text-white flex flex-col justify-between shrink-0"
        style={{ backgroundColor: accentColor }}
      >
        <div className="space-y-6">
          {/* Circular Photo */}
          {showPhoto && (
            <div className="flex justify-center pt-2">
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt={contact.fullName || 'Candidate'}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-white/20 shadow-lg"
                />
              ) : (
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-white/10 border-4 border-white/20 flex items-center justify-center text-white/50 shadow-lg">
                  <User className="w-14 h-14" />
                </div>
              )}
            </div>
          )}

          {/* Contact Details */}
          <div className="space-y-2.5 pt-2">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-white/80 border-b border-white/20 pb-1">
              Contact
            </h3>
            <div className="space-y-2 text-[10.5px] text-white/90">
              {contact.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-3 h-3 text-white/60 shrink-0" />
                  <span>{contact.phone}</span>
                </div>
              )}
              {contact.email && (
                <div className="flex items-center gap-2 break-all">
                  <Mail className="w-3 h-3 text-white/60 shrink-0" />
                  <span>{contact.email}</span>
                </div>
              )}
              {contact.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-3 h-3 text-white/60 shrink-0" />
                  <span>{contact.location}</span>
                </div>
              )}
              {contact.linkedinUrl && (
                <div className="flex items-center gap-2 truncate">
                  <LinkedinIcon className="w-3 h-3 text-white/60 shrink-0" />
                  <span className="truncate">
                    {contact.linkedinUrl.replace(/^https?:\/\/(www\.)?/, '')}
                  </span>
                </div>
              )}
              {contact.githubUrl && (
                <div className="flex items-center gap-2 truncate">
                  <GithubIcon className="w-3 h-3 text-white/60 shrink-0" />
                  <span className="truncate">
                    {contact.githubUrl.replace(/^https?:\/\/(www\.)?/, '')}
                  </span>
                </div>
              )}
              {contact.websiteUrl && (
                <div className="flex items-center gap-2 truncate">
                  <Globe className="w-3 h-3 text-white/60 shrink-0" />
                  <span className="truncate">
                    {contact.websiteUrl.replace(/^https?:\/\/(www\.)?/, '')}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Education in Sidebar */}
          {education.length > 0 && (
            <div className="space-y-2.5 pt-1">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-white/80 border-b border-white/20 pb-1">
                Education
              </h3>
              <div className="space-y-3">
                {education.map((edu, idx) => (
                  <div key={idx} className="space-y-0.5 text-[10px]">
                    <div className="font-bold text-white leading-tight">
                      {edu.degree}
                      {edu.field ? `, ${edu.field}` : ''}
                    </div>
                    <div className="text-white/80">{edu.school}</div>
                    <div className="text-white/60 text-[9.5px]">
                      {edu.graduationDate} {edu.location ? `• ${edu.location}` : ''}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills in Sidebar */}
          {skills.length > 0 && (
            <div className="space-y-2.5 pt-1">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-white/80 border-b border-white/20 pb-1">
                Key Skills
              </h3>
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="inline-block px-2 py-0.5 rounded text-[10px] bg-white/15 text-white border border-white/20 font-medium"
                  >
                    {skill.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="pt-6 text-[9px] text-white/40 text-center font-mono">
          ATS-Compliant Profile
        </div>
      </div>

      {/* White Right Content Area (66%) */}
      <div className="w-full md:w-[66%] p-6 sm:p-9 space-y-5 flex-1">
        {/* Name & Headline Header */}
        <div className="space-y-1 pb-3 border-b-2 border-zinc-100">
          <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-zinc-950">
            {contact.fullName || 'Candidate Name'}
          </h1>
          {headline && (
            <p
              className="text-xs sm:text-[13px] font-semibold tracking-wide"
              style={{ color: accentColor }}
            >
              {headline}
            </p>
          )}
        </div>

        {/* Professional Summary */}
        {summary && (
          <section className="space-y-1.5">
            <h2
              className="text-xs font-bold uppercase tracking-wider pb-1 border-b"
              style={{ color: accentColor, borderColor: `${accentColor}33` }}
            >
              Professional Summary
            </h2>
            <p className="text-[10.5px] text-zinc-700 leading-relaxed">
              {renderHighlightedText(summary, highlightKeywords, showHighlights)}
            </p>
          </section>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <section className="space-y-3">
            <h2
              className="text-xs font-bold uppercase tracking-wider pb-1 border-b"
              style={{ color: accentColor, borderColor: `${accentColor}33` }}
            >
              Work Experience
            </h2>

            <div className="space-y-4">
              {experience.map((exp, idx) => (
                <div key={exp.id || idx} className="space-y-1">
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-xs text-zinc-950">
                      {exp.title}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-medium shrink-0">
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
                    <ul className="list-disc pl-3.5 space-y-1 text-[10.5px] text-zinc-700 leading-relaxed pt-0.5">
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

        {/* Projects */}
        {projects.length > 0 && (
          <section className="space-y-2.5">
            <h2
              className="text-xs font-bold uppercase tracking-wider pb-1 border-b"
              style={{ color: accentColor, borderColor: `${accentColor}33` }}
            >
              Key Projects
            </h2>
            <div className="space-y-2.5">
              {projects.map((proj, idx) => (
                <div key={idx} className="space-y-0.5 text-[10.5px]">
                  <div className="font-bold text-zinc-950 flex items-center justify-between">
                    <span>{proj.name}</span>
                    {proj.url && (
                      <span className="text-[10px] text-blue-600 font-normal">
                        {proj.url.replace(/^https?:\/\//, '')}
                      </span>
                    )}
                  </div>
                  <p className="text-zinc-700 leading-relaxed">
                    {renderHighlightedText(proj.description, highlightKeywords, showHighlights)}
                  </p>
                  {proj.highlights && proj.highlights.length > 0 && (
                    <ul className="list-disc pl-3.5 space-y-0.5 text-zinc-600 text-[10px]">
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
    </div>
  );
}
