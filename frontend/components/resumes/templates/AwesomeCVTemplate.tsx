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
 * Awesome CV Template
 * Inspired by Claud D. Park's world-famous Awesome-CV LaTeX/XeTeX template.
 * Features customizable accent-colored typography, sleek vector contact bar,
 * prominent section underline rules, and crisp tabular entry hierarchy.
 */
export function AwesomeCVTemplate({
  content,
  accentColor = '#dc2626',
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
      className={`resume-page-a4 resume-paper-canvas bg-white text-zinc-900 p-8 sm:p-11 rounded-sm shadow-md border border-zinc-200/80 w-full max-w-[820px] mx-auto text-left leading-relaxed ${getTemplateFontClass(fontFamily)} ${className}`}
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

          <EditableField
            as="h1"
            fieldPath="contact.fullName"
            value={contact.fullName}
            placeholder="Candidate Name"
            className="text-3xl sm:text-4xl tracking-tight text-zinc-900 font-extrabold uppercase block"
            style={{
              color: accentColor,
              WebkitPrintColorAdjust: 'exact',
              printColorAdjust: 'exact',
            }}
          />

          {(isEditable || headline) && (
            <EditableField
              as="p"
              fieldPath="headline"
              value={headline || ''}
              placeholder="Professional Headline"
              className="text-xs sm:text-[13px] font-semibold tracking-wider uppercase mt-1 block"
              style={{
                color: accentColor,
                WebkitPrintColorAdjust: 'exact',
                printColorAdjust: 'exact',
              }}
            />
          )}

          {/* Vector Icon Contact Bar */}
          <div className="flex flex-wrap items-center justify-center gap-x-3.5 gap-y-1 text-[10.5px] text-zinc-600 mt-2.5">
            {(isEditable || contact.phone) && (
              <span className="inline-flex items-center gap-1">
                <Phone className="w-3 h-3 text-zinc-400 shrink-0" />
                <EditableContactLink fieldPath="contact.phone" value={contact.phone} placeholder="Phone" />
              </span>
            )}
            {(isEditable || contact.email) && (
              <span className="inline-flex items-center gap-1">
                <Mail className="w-3 h-3 text-zinc-400 shrink-0" />
                <EditableContactLink fieldPath="contact.email" value={contact.email} placeholder="email@example.com" />
              </span>
            )}
            {(isEditable || contact.location) && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="w-3 h-3 text-zinc-400 shrink-0" />
                <EditableContactLink fieldPath="contact.location" value={contact.location} placeholder="City, State" />
              </span>
            )}
            {(isEditable || contact.linkedinUrl) && (
              <span className="inline-flex items-center gap-1">
                <LinkedinIcon className="w-3 h-3 text-zinc-400 shrink-0" />
                <EditableContactLink fieldPath="contact.linkedinUrl" value={contact.linkedinUrl} placeholder="linkedin.com/in/you" isUrl={true} />
              </span>
            )}
            {(isEditable || contact.githubUrl) && (
              <span className="inline-flex items-center gap-1">
                <GithubIcon className="w-3 h-3 text-zinc-400 shrink-0" />
                <EditableContactLink fieldPath="contact.githubUrl" value={contact.githubUrl} placeholder="github.com/you" isUrl={true} />
              </span>
            )}
            {(isEditable || contact.websiteUrl) && (
              <span className="inline-flex items-center gap-1">
                <Globe className="w-3 h-3 text-zinc-400 shrink-0" />
                <EditableContactLink fieldPath="contact.websiteUrl" value={contact.websiteUrl} placeholder="portfolio.dev" isUrl={true} />
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Sections Container */}
      <div className="space-y-4 pt-1">
        {/* Profile Summary */}
        {(isEditable || summary) && (
          <section data-resume-section="summary" className="resume-section">
            <div
              className="pb-0.5 mb-1.5 flex items-center justify-between border-b-2"
              style={{
                borderBottomColor: accentColor,
                WebkitPrintColorAdjust: 'exact',
                printColorAdjust: 'exact',
              }}
            >
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                Profile
              </h2>
              <CanvasSectionMoveButtons sectionKey="summary" label="Profile" />
            </div>
            <EditableField
              as="p"
              id="summary-textarea"
              fieldPath="summary"
              value={summary || ''}
              placeholder="Profile summary..."
              className="text-[10.5px] text-zinc-700 leading-relaxed block"
              highlightKeywords={highlightKeywords}
              showHighlights={showHighlights}
            />
          </section>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <section data-resume-section="experience" className="resume-section">
            <div
              className="pb-0.5 mb-2.5 flex items-center justify-between border-b-2"
              style={{
                borderBottomColor: accentColor,
                WebkitPrintColorAdjust: 'exact',
                printColorAdjust: 'exact',
              }}
            >
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                Work Experience
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
                    <EditableField
                      as="span"
                      fieldPath={`experience[${idx}].title`}
                      value={exp.title}
                      placeholder="Title"
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

                  <div className="flex justify-between items-baseline text-[10.5px] gap-2">
                    <EditableField
                      as="span"
                      fieldPath={`experience[${idx}].company`}
                      value={exp.company}
                      placeholder="Company"
                      className="font-semibold text-xs"
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
                      className="text-zinc-500 font-medium text-[10.5px]"
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

        {/* Projects */}
        {projects && projects.length > 0 && (
          <section data-resume-section="projects" className="resume-section">
            <div
              className="pb-0.5 mb-2 flex items-center justify-between border-b-2"
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

        {/* Skills */}
        {skills.length > 0 && (
          <section data-resume-section="skills" className="resume-section">
            <div
              className="pb-0.5 mb-2 flex items-center justify-between border-b-2"
              style={{
                borderBottomColor: accentColor,
                WebkitPrintColorAdjust: 'exact',
                printColorAdjust: 'exact',
              }}
            >
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                Skills & Competencies
              </h2>
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

        {/* Education */}
        {education.length > 0 && (
          <section data-resume-section="education" className="resume-section">
            <div
              className="pb-0.5 mb-2 flex items-center justify-between border-b-2"
              style={{
                borderBottomColor: accentColor,
                WebkitPrintColorAdjust: 'exact',
                printColorAdjust: 'exact',
              }}
            >
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                Education
              </h2>
              <div className="flex items-center gap-1">
                <CanvasSectionMoveButtons sectionKey="education" label="Education" />
                <CanvasSectionAddButton label="Degree" onClick={onAddEducation} />
              </div>
            </div>

            <div className="space-y-2">
              {education.map((edu, idx) => (
                <div key={edu.id || idx} className="resume-entry group/entry relative text-[11px]">
                  <CanvasEntryDeleteButton onClick={() => onDeleteEducation?.(idx)} label="Delete degree" />
                  <div className="flex justify-between items-baseline font-bold text-zinc-950 gap-2">
                    <EditableField
                      as="span"
                      fieldPath={`education[${idx}].school`}
                      value={edu.school}
                      placeholder="School / University"
                    />
                    <EditableField
                      as="span"
                      fieldPath={`education[${idx}].location`}
                      value={edu.location || ''}
                      placeholder="Location"
                      className="font-normal text-zinc-500 text-[10.5px]"
                    />
                  </div>
                  <div className="flex justify-between items-baseline text-zinc-700 text-[10.5px] gap-2">
                    <div className="flex items-center gap-1 flex-wrap">
                      <EditableField
                        as="span"
                        fieldPath={`education[${idx}].degree`}
                        value={edu.degree}
                        placeholder="Degree"
                        className="font-medium"
                        style={{
                          color: accentColor,
                          WebkitPrintColorAdjust: 'exact',
                          printColorAdjust: 'exact',
                        }}
                      />
                      {(isEditable || edu.field) && (
                        <>
                          <span className="text-zinc-500">in</span>
                          <EditableField
                            as="span"
                            fieldPath={`education[${idx}].field`}
                            value={edu.field || ''}
                            placeholder="Field"
                            className="font-medium"
                            style={{
                              color: accentColor,
                              WebkitPrintColorAdjust: 'exact',
                              printColorAdjust: 'exact',
                            }}
                          />
                        </>
                      )}
                    </div>
                    <EditableField
                      as="span"
                      fieldPath={`education[${idx}].graduationDate`}
                      value={edu.graduationDate || ''}
                      placeholder="Date"
                      className="text-zinc-500 font-normal"
                    />
                  </div>
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
      </div>
    </div>
  );
}
