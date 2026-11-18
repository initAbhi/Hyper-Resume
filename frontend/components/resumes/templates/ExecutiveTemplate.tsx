'use client';

import React from 'react';
import { MapPin, Mail, Phone, Globe } from 'lucide-react';
import {
  TemplateProps,
  getTemplateFontClass,
  LinkedinIcon,
  GithubIcon,
  EditableField,
  EditableBulletList,
  EditableContactLink,
  EditableDateRange,
  CanvasSectionAddButton,
  CanvasSectionMoveButtons,
  CanvasEntryDeleteButton,
  useCanvasEdit,
} from './types';
import { CertificationsBlock } from './CertificationsBlock';
import { CustomSectionsBlock } from './CustomSectionsBlock';

/**
 * Executive Leadership Template
 */
export function ExecutiveTemplate({
  content,
  accentColor = '#1e3a8a',
  fontFamily = 'serif',
  showPhoto = false,
  photoUrl,
  highlightKeywords,
  showHighlights = false,
  className = '',
}: TemplateProps) {
  const { contact, headline, summary, experience = [], education = [], skills = [], projects = [] } = content;
  const {
    isEditable,
    onAddExperience,
    onAddProject,
    onAddEducation,
    onAddSkill,
    onDeleteExperience,
    onDeleteProject,
    onDeleteEducation,
    onDeleteSkill,
  } = useCanvasEdit();

  return (
    <div
      className={`resume-page-a4 resume-paper-canvas bg-white text-zinc-900 p-8 sm:p-12 rounded-sm shadow-md border border-zinc-200/80 w-full max-w-[820px] mx-auto text-left leading-relaxed ${getTemplateFontClass(fontFamily)} ${className}`}
      style={{ boxSizing: 'border-box' }}
    >
      {/* Executive Header */}
      <header className="pb-5 border-b border-zinc-200/80 mb-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <EditableField
              as="h1"
              fieldPath="contact.fullName"
              value={contact.fullName}
              placeholder="Candidate Name"
              className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-950 uppercase block"
            />
            {(isEditable || headline) && (
              <EditableField
                as="p"
                fieldPath="headline"
                value={headline || ''}
                placeholder="Professional Headline"
                className="text-xs sm:text-sm font-semibold tracking-wide uppercase block"
                style={{
                  color: accentColor,
                  WebkitPrintColorAdjust: 'exact',
                  printColorAdjust: 'exact',
                }}
              />
            )}

            {/* Horizontal Contact Strip */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10.5px] text-zinc-600 pt-1.5">
              {(isEditable || contact.location) && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-zinc-400 shrink-0" />
                  <EditableContactLink fieldPath="contact.location" value={contact.location} placeholder="City, State" />
                </span>
              )}
              {(isEditable || contact.phone) && (
                <span className="inline-flex items-center gap-1">
                  <Phone className="w-3 h-3 text-zinc-400 shrink-0" />
                  <EditableContactLink fieldPath="contact.phone" value={contact.phone} placeholder="Phone" />
                </span>
              )}
              {(isEditable || contact.email) && (
                <span className="inline-flex items-center gap-1 text-zinc-700">
                  <Mail className="w-3 h-3 text-zinc-400 shrink-0" />
                  <EditableContactLink fieldPath="contact.email" value={contact.email} placeholder="email@example.com" />
                </span>
              )}
              {(isEditable || contact.linkedinUrl) && (
                <span className="inline-flex items-center gap-1 text-zinc-700">
                  <LinkedinIcon className="w-3 h-3 text-zinc-400 shrink-0" />
                  <EditableContactLink fieldPath="contact.linkedinUrl" value={contact.linkedinUrl} placeholder="linkedin.com/in/you" isUrl={true} />
                </span>
              )}
              {(isEditable || contact.githubUrl) && (
                <span className="inline-flex items-center gap-1 text-zinc-700">
                  <GithubIcon className="w-3 h-3 text-zinc-400 shrink-0" />
                  <EditableContactLink fieldPath="contact.githubUrl" value={contact.githubUrl} placeholder="github.com/you" isUrl={true} />
                </span>
              )}
              {(isEditable || contact.websiteUrl) && (
                <span className="inline-flex items-center gap-1 text-zinc-700">
                  <Globe className="w-3 h-3 text-zinc-400 shrink-0" />
                  <EditableContactLink fieldPath="contact.websiteUrl" value={contact.websiteUrl} placeholder="portfolio.dev" isUrl={true} />
                </span>
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
        {(isEditable || summary) && (
          <section data-resume-section="summary" className="resume-section">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span
                  className="w-1 h-3.5 rounded-full inline-block"
                  style={{
                    backgroundColor: accentColor,
                    WebkitPrintColorAdjust: 'exact',
                    printColorAdjust: 'exact',
                  }}
                />
                <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-950">
                  Executive Profile
                </h2>
              </div>
              <CanvasSectionMoveButtons sectionKey="summary" label="Profile" />
            </div>
            <EditableField
              as="p"
              id="summary-textarea"
              fieldPath="summary"
              value={summary || ''}
              placeholder="Executive Profile..."
              className="text-[10.5px] text-zinc-700 leading-relaxed pl-3 border-l-2 border-zinc-100 block"
              highlightKeywords={highlightKeywords}
              showHighlights={showHighlights}
            />
          </section>
        )}

        {/* Professional Experience */}
        {experience.length > 0 && (
          <section data-resume-section="experience" className="resume-section">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <span
                  className="w-1 h-3.5 rounded-full inline-block"
                  style={{
                    backgroundColor: accentColor,
                    WebkitPrintColorAdjust: 'exact',
                    printColorAdjust: 'exact',
                  }}
                />
                <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-950">
                  Professional Experience
                </h2>
              </div>
              <div className="flex items-center gap-1">
                <CanvasSectionMoveButtons sectionKey="experience" label="Experience" />
                <CanvasSectionAddButton label="Role" onClick={onAddExperience} />
              </div>
            </div>

            <div className="space-y-3.5">
              {experience.map((exp, idx) => (
                <div key={exp.id || idx} className="resume-entry group/entry relative space-y-1">
                  <CanvasEntryDeleteButton onClick={() => onDeleteExperience?.(idx)} label="Delete role" />
                  <div className="flex justify-between items-baseline text-[11.5px] gap-2">
                    <EditableField
                      as="span"
                      fieldPath={`experience[${idx}].company`}
                      value={exp.company}
                      placeholder="Company"
                      className="font-bold text-zinc-950"
                    />
                    <EditableField
                      as="span"
                      fieldPath={`experience[${idx}].location`}
                      value={exp.location || ''}
                      placeholder="Location"
                      className="text-[10.5px] text-zinc-500 font-medium"
                    />
                  </div>

                  <div className="flex justify-between items-baseline text-[11px] gap-2">
                    <EditableField
                      as="span"
                      fieldPath={`experience[${idx}].title`}
                      value={exp.title}
                      placeholder="Title"
                      className="font-semibold italic"
                      style={{
                        color: accentColor,
                        WebkitPrintColorAdjust: 'exact',
                        printColorAdjust: 'exact',
                      }}
                    />
                    <EditableDateRange
                      startDate={exp.startDate}
                      endDate={exp.endDate}
                      current={exp.current}
                      startFieldPath={`experience[${idx}].startDate`}
                      endFieldPath={`experience[${idx}].endDate`}
                      className="text-[10px] text-zinc-500 font-medium"
                    />
                  </div>

                  <EditableBulletList
                    bullets={exp.bullets || []}
                    section="experience"
                    expIdx={idx}
                    highlightKeywords={highlightKeywords}
                    showHighlights={showHighlights}
                    className="list-disc list-outside ml-4 space-y-0.5 pt-0.5 text-[10.5px] text-zinc-800 leading-relaxed"
                    liClassName="pl-0.5"
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Selected Initiatives & Projects */}
        {projects && projects.length > 0 && (
          <section data-resume-section="projects" className="resume-section">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span
                  className="w-1 h-3.5 rounded-full inline-block"
                  style={{
                    backgroundColor: accentColor,
                    WebkitPrintColorAdjust: 'exact',
                    printColorAdjust: 'exact',
                  }}
                />
                <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-950">
                  Key Initiatives & Projects
                </h2>
              </div>
              <div className="flex items-center gap-1">
                <CanvasSectionMoveButtons sectionKey="projects" label="Projects" />
                <CanvasSectionAddButton label="Project" onClick={onAddProject} />
              </div>
            </div>

            <div className="space-y-2.5">
              {projects.map((proj, idx) => (
                <div key={proj.id || idx} className="resume-entry group/entry relative space-y-0.5">
                  <CanvasEntryDeleteButton onClick={() => onDeleteProject?.(idx)} label="Delete project" />
                  <div className="flex justify-between items-baseline text-[11px] gap-2">
                    <div className="font-bold text-zinc-950 flex flex-wrap items-center gap-1.5">
                      <EditableField
                        as="span"
                        fieldPath={`projects[${idx}].name`}
                        value={proj.name}
                        placeholder="Project Name"
                      />
                      {(isEditable || proj.url) && (
                        <span className="text-[10px] text-zinc-500 font-normal underline">
                          <EditableContactLink
                            fieldPath={`projects[${idx}].url`}
                            value={proj.url}
                            placeholder="project-url.com"
                            isUrl={true}
                          />
                        </span>
                      )}
                    </div>
                  </div>
                  {(isEditable || proj.description) && (
                    <EditableField
                      as="p"
                      fieldPath={`projects[${idx}].description`}
                      value={proj.description || ''}
                      placeholder="Project description..."
                      className="text-[10.5px] text-zinc-700 leading-normal block"
                    />
                  )}
                  <EditableBulletList
                    bullets={proj.highlights || []}
                    section="projects"
                    projIdx={idx}
                    highlightKeywords={highlightKeywords}
                    showHighlights={showHighlights}
                    className="list-disc list-outside ml-4 space-y-0.5 text-[10.5px] text-zinc-800 leading-relaxed"
                    liClassName="pl-0.5"
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 2-Column Row for Core Competencies & Education */}
        <div className="grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-6 pt-1">
          {skills.length > 0 && (
            <section data-resume-section="skills" className="resume-section">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className="w-1 h-3.5 rounded-full inline-block"
                    style={{
                      backgroundColor: accentColor,
                      WebkitPrintColorAdjust: 'exact',
                      printColorAdjust: 'exact',
                    }}
                  />
                  <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-950">
                    Core Competencies
                  </h2>
                </div>
                <div className="flex items-center gap-1">
                  <CanvasSectionMoveButtons sectionKey="skills" label="Skills" />
                  <CanvasSectionAddButton label="Skill" onClick={() => onAddSkill && onAddSkill()} />
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="group/skill inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-100 text-zinc-800 border border-zinc-200/80"
                    style={{
                      WebkitPrintColorAdjust: 'exact',
                      printColorAdjust: 'exact',
                    }}
                  >
                    <EditableField
                      as="span"
                      fieldPath={`skills[${idx}].name`}
                      value={skill.name}
                      placeholder="Skill"
                    />
                    <CanvasEntryDeleteButton variant="chip" onClick={() => onDeleteSkill?.(idx)} label="Remove skill" />
                  </span>
                ))}
              </div>
            </section>
          )}

          {education.length > 0 && (
            <section data-resume-section="education" className="resume-section">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className="w-1 h-3.5 rounded-full inline-block"
                    style={{
                      backgroundColor: accentColor,
                      WebkitPrintColorAdjust: 'exact',
                      printColorAdjust: 'exact',
                    }}
                  />
                  <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-950">
                    Education & Credentials
                  </h2>
                </div>
                <div className="flex items-center gap-1">
                  <CanvasSectionMoveButtons sectionKey="education" label="Education" />
                  <CanvasSectionAddButton label="Degree" onClick={onAddEducation} />
                </div>
              </div>
              <div className="space-y-1.5">
                {education.map((edu, idx) => (
                  <div key={edu.id || idx} className="resume-entry group/entry relative text-[10.5px]">
                    <CanvasEntryDeleteButton onClick={() => onDeleteEducation?.(idx)} label="Delete degree" />
                    <EditableField
                      as="div"
                      fieldPath={`education[${idx}].school`}
                      value={edu.school}
                      placeholder="School"
                      className="font-bold text-zinc-950"
                    />
                    <div className="text-zinc-600">
                      <EditableField
                        as="span"
                        fieldPath={`education[${idx}].degree`}
                        value={edu.degree}
                        placeholder="Degree"
                      />
                      {(isEditable || edu.field) && (
                        <>
                          {' in '}
                          <EditableField
                            as="span"
                            fieldPath={`education[${idx}].field`}
                            value={edu.field || ''}
                            placeholder="Field"
                          />
                        </>
                      )}
                    </div>
                    <div className="text-[10px] text-zinc-500">
                      <EditableField
                        as="span"
                        fieldPath={`education[${idx}].graduationDate`}
                        value={edu.graduationDate || ''}
                        placeholder="Year"
                      />
                      {(isEditable || edu.location) && (
                        <>
                          {' | '}
                          <EditableField
                            as="span"
                            fieldPath={`education[${idx}].location`}
                            value={edu.location || ''}
                            placeholder="Location"
                          />
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        <CertificationsBlock content={content} accentColor={accentColor} variant="bar" />

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
