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
 * Deedy Resume Template
 * Inspired by Debarghya Das's famous Deedy Resume LaTeX template.
 * High-density asymmetric 2-column layout (32% left sidebar for metadata/skills,
 * 68% right column for deep experience & project narratives).
 */
export function DeedyTemplate({
  content,
  accentColor = '#2563eb',
  fontFamily = 'sans',
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
      className={`resume-page-a4 resume-paper-canvas bg-white text-zinc-900 p-8 sm:p-10 rounded-sm shadow-md border border-zinc-200/80 w-full max-w-[820px] mx-auto text-left leading-relaxed ${getTemplateFontClass(fontFamily)} ${className}`}
      style={{ boxSizing: 'border-box' }}
    >
      {/* Header */}
      <header className="pb-3 border-b border-zinc-200 mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <EditableField
              as="h1"
              fieldPath="contact.fullName"
              value={contact.fullName}
              placeholder="Candidate Name"
              className="text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-zinc-900 block"
            />
            {(isEditable || headline) && (
              <EditableField
                as="p"
                fieldPath="headline"
                value={headline || ''}
                placeholder="Professional Headline"
                className="text-xs font-semibold tracking-wider uppercase mt-0.5 block"
                style={{
                  color: accentColor,
                  WebkitPrintColorAdjust: 'exact',
                  printColorAdjust: 'exact',
                }}
              />
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
        {/* Left Column (32%): Contact, Links, Education, Skills */}
        <aside className="w-full md:w-[32%] print:w-[32%] space-y-4 shrink-0 text-[10.5px]">
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
              {(isEditable || contact.email) && (
                <div className="flex items-center gap-1.5 break-all">
                  <Mail className="w-3 h-3 text-zinc-400 shrink-0" />
                  <EditableContactLink fieldPath="contact.email" value={contact.email} placeholder="email@example.com" />
                </div>
              )}
              {(isEditable || contact.phone) && (
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3 h-3 text-zinc-400 shrink-0" />
                  <EditableContactLink fieldPath="contact.phone" value={contact.phone} placeholder="Phone" />
                </div>
              )}
              {(isEditable || contact.location) && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3 h-3 text-zinc-400 shrink-0" />
                  <EditableContactLink fieldPath="contact.location" value={contact.location} placeholder="City, State" />
                </div>
              )}
            </div>
          </section>

          {(isEditable || contact.linkedinUrl || contact.githubUrl || contact.websiteUrl) && (
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
                {(isEditable || contact.linkedinUrl) && (
                  <div className="flex items-center gap-1.5 truncate">
                    <LinkedinIcon className="w-3 h-3 text-zinc-400 shrink-0" />
                    <EditableContactLink fieldPath="contact.linkedinUrl" value={contact.linkedinUrl} placeholder="linkedin.com/in/you" isUrl={true} className="truncate" />
                  </div>
                )}
                {(isEditable || contact.githubUrl) && (
                  <div className="flex items-center gap-1.5 truncate">
                    <GithubIcon className="w-3 h-3 text-zinc-400 shrink-0" />
                    <EditableContactLink fieldPath="contact.githubUrl" value={contact.githubUrl} placeholder="github.com/you" isUrl={true} className="truncate" />
                  </div>
                )}
                {(isEditable || contact.websiteUrl) && (
                  <div className="flex items-center gap-1.5 truncate">
                    <Globe className="w-3 h-3 text-zinc-400 shrink-0" />
                    <EditableContactLink fieldPath="contact.websiteUrl" value={contact.websiteUrl} placeholder="portfolio.dev" isUrl={true} className="truncate" />
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Education */}
          {education.length > 0 && (
            <section data-resume-section="education" className="space-y-2 pb-2 border-b border-zinc-100">
              <div className="flex items-center justify-between">
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
                <div className="flex items-center gap-1">
                  <CanvasSectionMoveButtons sectionKey="education" label="Education" />
                  <CanvasSectionAddButton label="Degree" onClick={onAddEducation} />
                </div>
              </div>
              <div className="space-y-2">
                {education.map((edu, idx) => (
                  <div key={edu.id || idx} className="group/entry relative space-y-0.5">
                    <CanvasEntryDeleteButton onClick={() => onDeleteEducation?.(idx)} label="Delete degree" />
                    <EditableField
                      as="div"
                      fieldPath={`education[${idx}].school`}
                      value={edu.school}
                      placeholder="School"
                      className="font-bold text-zinc-900 text-[11px] leading-tight"
                    />
                    <div className="text-zinc-600 italic">
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
                        placeholder="Graduation Date"
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

          {/* Skills */}
          {skills.length > 0 && (
            <section data-resume-section="skills" className="space-y-2">
              <div className="flex items-center justify-between">
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
                <div className="flex items-center gap-1">
                  <CanvasSectionMoveButtons sectionKey="skills" label="Skills" />
                  <CanvasSectionAddButton label="Skill" onClick={() => onAddSkill && onAddSkill()} />
                </div>
              </div>
              <div className="flex flex-wrap gap-1 pt-0.5">
                {skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="group/skill inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] bg-zinc-100 text-zinc-800 border border-zinc-200/80 font-medium"
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
        </aside>

        {/* Right Column (68%): Overview, Experience, Projects, Certifications, Custom */}
        <main className="w-full md:w-[68%] print:w-[68%] space-y-4">
          {(isEditable || summary) && (
            <section data-resume-section="summary" className="resume-section">
              <div
                className="pb-0.5 mb-1.5 flex items-center justify-between border-b"
                style={{
                  borderBottomColor: accentColor,
                  WebkitPrintColorAdjust: 'exact',
                  printColorAdjust: 'exact',
                }}
              >
                <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                  Overview
                </h2>
                <CanvasSectionMoveButtons sectionKey="summary" label="Overview" />
              </div>
              <EditableField
                as="p"
                id="summary-textarea"
                fieldPath="summary"
                value={summary || ''}
                placeholder="Overview..."
                className="text-[10.5px] text-zinc-700 leading-relaxed block"
                highlightKeywords={highlightKeywords}
                showHighlights={showHighlights}
              />
            </section>
          )}

          {experience.length > 0 && (
            <section data-resume-section="experience" className="resume-section">
              <div
                className="pb-0.5 mb-2.5 flex items-center justify-between border-b"
                style={{
                  borderBottomColor: accentColor,
                  WebkitPrintColorAdjust: 'exact',
                  printColorAdjust: 'exact',
                }}
              >
                <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                  Experience
                </h2>
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
                      <div className="min-w-0">
                        <EditableField
                          as="span"
                          fieldPath={`experience[${idx}].company`}
                          value={exp.company}
                          placeholder="Company"
                          className="font-bold text-zinc-950"
                        />
                        <span className="text-zinc-500 font-normal ml-1.5 text-[11px]">
                          |{' '}
                          <EditableField
                            as="span"
                            fieldPath={`experience[${idx}].title`}
                            value={exp.title}
                            placeholder="Title"
                          />
                        </span>
                      </div>
                      <EditableDateRange
                        startDate={exp.startDate}
                        endDate={exp.endDate}
                        current={exp.current}
                        startFieldPath={`experience[${idx}].startDate`}
                        endFieldPath={`experience[${idx}].endDate`}
                        className="text-[10px] text-zinc-500 font-medium shrink-0"
                      />
                    </div>

                    {(isEditable || exp.location) && (
                      <EditableField
                        as="div"
                        fieldPath={`experience[${idx}].location`}
                        value={exp.location || ''}
                        placeholder="Location"
                        className="text-[10px] text-zinc-500"
                      />
                    )}

                    <EditableBulletList
                      bullets={exp.bullets || []}
                      section="experience"
                      expIdx={idx}
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

          {projects && projects.length > 0 && (
            <section data-resume-section="projects" className="resume-section">
              <div
                className="pb-0.5 mb-2 flex items-center justify-between border-b"
                style={{
                  borderBottomColor: accentColor,
                  WebkitPrintColorAdjust: 'exact',
                  printColorAdjust: 'exact',
                }}
              >
                <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                  Projects
                </h2>
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

          <CertificationsBlock content={content} accentColor={accentColor} />

          <CustomSectionsBlock
            content={content}
            accentColor={accentColor}
            highlightKeywords={highlightKeywords}
            showHighlights={showHighlights}
          />
        </main>
      </div>
    </div>
  );
}
