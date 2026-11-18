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

export function ModernTemplate({
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
      className={`resume-page-a4 resume-paper-canvas bg-white text-zinc-950 p-6 sm:p-10 rounded-sm shadow-md border border-zinc-200/80 w-full max-w-[820px] mx-auto text-left leading-relaxed ${getTemplateFontClass(fontFamily)} ${className}`}
      style={{ boxSizing: 'border-box' }}
    >
      {/* Header */}
      <div className="pb-3 border-b-2" style={{ borderColor: accentColor }}>
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <EditableField
              as="h1"
              fieldPath="contact.fullName"
              value={contact.fullName}
              placeholder="Candidate Name"
              className="text-2xl sm:text-3xl font-extrabold tracking-tight block"
              style={{ color: accentColor }}
            />
            {(isEditable || headline) && (
              <EditableField
                as="p"
                fieldPath="headline"
                value={headline || ''}
                placeholder="Professional Headline"
                className="text-xs sm:text-[13px] font-semibold text-zinc-800 block"
              />
            )}
            <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1 text-[10.5px] text-zinc-600 pt-1">
              {(isEditable || contact.email) && (
                <span className="inline-flex items-center gap-1">
                  <Mail className="w-3 h-3 text-zinc-400 shrink-0" />
                  <EditableContactLink fieldPath="contact.email" value={contact.email} placeholder="email@example.com" />
                </span>
              )}
              {(isEditable || contact.phone) && (
                <span className="inline-flex items-center gap-1">
                  <Phone className="w-3 h-3 text-zinc-400 shrink-0" />
                  <EditableContactLink fieldPath="contact.phone" value={contact.phone} placeholder="Phone" />
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
      {(isEditable || summary) && (
        <section data-resume-section="summary" className="mt-4 space-y-1.5">
          <div className="flex items-center justify-between pl-2 border-l-3" style={{ borderColor: accentColor }}>
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-950">
              Professional Summary
            </h2>
            <CanvasSectionMoveButtons sectionKey="summary" label="Summary" />
          </div>
          <EditableField
            as="p"
            id="summary-textarea"
            fieldPath="summary"
            value={summary || ''}
            placeholder="Professional Summary..."
            className="text-[10.5px] text-zinc-700 leading-relaxed pt-0.5 block"
            highlightKeywords={highlightKeywords}
            showHighlights={showHighlights}
          />
        </section>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <section data-resume-section="experience" className="mt-4 space-y-3">
          <div className="flex items-center justify-between pl-2 border-l-3" style={{ borderColor: accentColor }}>
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-950">
              Work Experience
            </h2>
            <div className="flex items-center gap-1">
              <CanvasSectionMoveButtons sectionKey="experience" label="Experience" />
              <CanvasSectionAddButton label="Role" onClick={onAddExperience} />
            </div>
          </div>

          <div className="space-y-3.5">
            {experience.map((exp, idx) => (
              <div key={exp.id || idx} className="group/entry relative space-y-1">
                <CanvasEntryDeleteButton onClick={() => onDeleteExperience?.(idx)} label="Delete role" />
                <div className="flex justify-between items-baseline gap-2">
                  <EditableField
                    as="span"
                    fieldPath={`experience[${idx}].title`}
                    value={exp.title}
                    placeholder="Role Title"
                    className="font-bold text-xs text-zinc-950"
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

                <div className="text-[11px] font-semibold flex flex-wrap items-center gap-1" style={{ color: accentColor }}>
                  <EditableField
                    as="span"
                    fieldPath={`experience[${idx}].company`}
                    value={exp.company}
                    placeholder="Company Name"
                    className="font-semibold"
                    style={{ color: accentColor }}
                  />
                  {(isEditable || exp.location) && (
                    <>
                      <span className="text-zinc-400">•</span>
                      <EditableField
                        as="span"
                        fieldPath={`experience[${idx}].location`}
                        value={exp.location || ''}
                        placeholder="Location"
                        className="text-zinc-500 font-normal"
                      />
                    </>
                  )}
                </div>

                <EditableBulletList
                  bullets={exp.bullets || []}
                  section="experience"
                  expIdx={idx}
                  highlightKeywords={highlightKeywords}
                  showHighlights={showHighlights}
                  className="list-disc pl-3.5 space-y-0.5 text-[10.5px] text-zinc-700 leading-relaxed pt-0.5"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Technical Skills */}
      {skills.length > 0 && (
        <section data-resume-section="skills" className="mt-4 space-y-2">
          <div className="flex items-center justify-between pl-2 border-l-3" style={{ borderColor: accentColor }}>
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-950">
              Skills & Technologies
            </h2>
            <div className="flex items-center gap-1">
              <CanvasSectionMoveButtons sectionKey="skills" label="Skills" />
              <CanvasSectionAddButton label="Skill" onClick={() => onAddSkill && onAddSkill()} />
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {skills.map((s, idx) => (
              <span
                key={idx}
                className="group/skill inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] rounded font-medium bg-zinc-100 text-zinc-800 border border-zinc-200"
              >
                <EditableField
                  as="span"
                  fieldPath={`skills[${idx}].name`}
                  value={s.name}
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
        <section data-resume-section="education" className="mt-4 space-y-2">
          <div className="flex items-center justify-between pl-2 border-l-3" style={{ borderColor: accentColor }}>
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-950">
              Education
            </h2>
            <div className="flex items-center gap-1">
              <CanvasSectionMoveButtons sectionKey="education" label="Education" />
              <CanvasSectionAddButton label="Degree" onClick={onAddEducation} />
            </div>
          </div>
          <div className="space-y-1.5">
            {education.map((edu, idx) => (
              <div key={edu.id || idx} className="group/entry relative flex justify-between items-baseline gap-2 text-[10.5px] text-zinc-800">
                <CanvasEntryDeleteButton onClick={() => onDeleteEducation?.(idx)} label="Delete degree" />
                <div className="flex items-center gap-1 flex-wrap">
                  <EditableField
                    as="span"
                    fieldPath={`education[${idx}].degree`}
                    value={edu.degree}
                    placeholder="Degree"
                    className="font-bold text-zinc-950"
                  />
                  {(isEditable || edu.field) && (
                    <>
                      <span>,</span>
                      <EditableField
                        as="span"
                        fieldPath={`education[${idx}].field`}
                        value={edu.field || ''}
                        placeholder="Field"
                        className="font-bold text-zinc-950"
                      />
                    </>
                  )}
                  <span className="text-zinc-600"> — </span>
                  <EditableField
                    as="span"
                    fieldPath={`education[${idx}].school`}
                    value={edu.school}
                    placeholder="School"
                    className="text-zinc-600 font-medium"
                  />
                  {(isEditable || edu.location) && (
                    <>
                      <span className="text-zinc-400">·</span>
                      <EditableField
                        as="span"
                        fieldPath={`education[${idx}].location`}
                        value={edu.location || ''}
                        placeholder="Location"
                        className="text-zinc-500"
                      />
                    </>
                  )}
                </div>
                <EditableField
                  as="span"
                  fieldPath={`education[${idx}].graduationDate`}
                  value={edu.graduationDate || ''}
                  placeholder="Date"
                  className="text-[10px] text-zinc-500 shrink-0"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <section data-resume-section="projects" className="mt-4 space-y-2">
          <div className="flex items-center justify-between pl-2 border-l-3" style={{ borderColor: accentColor }}>
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-950">
              Projects
            </h2>
            <div className="flex items-center gap-1">
              <CanvasSectionMoveButtons sectionKey="projects" label="Projects" />
              <CanvasSectionAddButton label="Project" onClick={onAddProject} />
            </div>
          </div>
          <div className="space-y-2 text-[10.5px] text-zinc-800">
            {projects.map((proj, idx) => (
              <div key={proj.id || idx} className="group/entry relative space-y-0.5">
                <CanvasEntryDeleteButton onClick={() => onDeleteProject?.(idx)} label="Delete project" />
                <div className="flex items-baseline justify-between gap-2">
                  <EditableField
                    as="span"
                    fieldPath={`projects[${idx}].name`}
                    value={proj.name}
                    placeholder="Project Name"
                    className="font-bold text-zinc-950"
                  />
                  {(isEditable || proj.url) && (
                    <EditableContactLink
                      fieldPath={`projects[${idx}].url`}
                      value={proj.url}
                      placeholder="project-url.com"
                      isUrl={true}
                      className="text-[10px] text-blue-600 font-normal"
                    />
                  )}
                </div>
                {(isEditable || proj.description) && (
                  <EditableField
                    as="p"
                    fieldPath={`projects[${idx}].description`}
                    value={proj.description || ''}
                    placeholder="Project description..."
                    className="text-zinc-700 block"
                  />
                )}
                <EditableBulletList
                  bullets={proj.highlights || []}
                  section="projects"
                  projIdx={idx}
                  highlightKeywords={highlightKeywords}
                  showHighlights={showHighlights}
                  className="list-disc pl-3.5 space-y-0.5 text-[10px] text-zinc-700 leading-relaxed pt-0.5"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      <CertificationsBlock
        content={content}
        accentColor={accentColor}
        variant="bar"
        spacingClassName="mt-4 space-y-2"
      />

      <CustomSectionsBlock
        content={content}
        accentColor={accentColor}
        highlightKeywords={highlightKeywords}
        showHighlights={showHighlights}
        variant="bar"
        spacingClassName="mt-4 space-y-2"
      />
    </div>
  );
}
