'use client';

import React from 'react';
import {
  TemplateProps,
  getTemplateFontClass,
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

export function IvyLeagueTemplate({
  content,
  accentColor = '#18181b',
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

  const ruleColor = accentColor || '#18181b';

  const contactItems = [
    { key: 'location', fieldPath: 'contact.location', value: contact.location, placeholder: 'City, State' },
    { key: 'phone', fieldPath: 'contact.phone', value: contact.phone, placeholder: 'Phone' },
    { key: 'email', fieldPath: 'contact.email', value: contact.email, placeholder: 'email@example.com' },
    { key: 'linkedin', fieldPath: 'contact.linkedinUrl', value: contact.linkedinUrl, placeholder: 'linkedin.com/in/you', isUrl: true },
    { key: 'github', fieldPath: 'contact.githubUrl', value: contact.githubUrl, placeholder: 'github.com/you', isUrl: true },
    { key: 'website', fieldPath: 'contact.websiteUrl', value: contact.websiteUrl, placeholder: 'portfolio.dev', isUrl: true },
  ];
  const visibleContact = isEditable ? contactItems : contactItems.filter((c) => Boolean(c.value?.trim()));

  return (
    <div
      className={`resume-page-a4 resume-paper-canvas bg-white text-zinc-950 p-6 sm:p-12 rounded-sm shadow-md border border-zinc-200/80 w-full max-w-[820px] mx-auto text-left leading-relaxed ${getTemplateFontClass(fontFamily)} ${className}`}
      style={{ boxSizing: 'border-box' }}
    >
      {/* Centered Academic Header */}
      <div className="text-center pb-3 border-b" style={{ borderBottomColor: ruleColor }}>
        {showPhoto && photoUrl && (
          <div className="flex justify-center mb-2">
            <img
              src={photoUrl}
              alt={contact.fullName || 'Candidate'}
              className="w-16 h-16 rounded-full object-cover border shadow-xs"
              style={{ borderColor: ruleColor }}
            />
          </div>
        )}
        <EditableField
          as="h1"
          fieldPath="contact.fullName"
          value={contact.fullName}
          placeholder="Candidate Name"
          className="text-2xl sm:text-3xl font-normal tracking-wide uppercase block"
          style={{ color: ruleColor }}
        />

        {(isEditable || headline) && (
          <EditableField
            as="p"
            fieldPath="headline"
            value={headline || ''}
            placeholder="Professional Headline"
            className="text-xs sm:text-[12px] italic text-zinc-700 mt-1 block"
          />
        )}

        <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[10.5px] text-zinc-600 mt-2">
          {visibleContact.map((item, idx) => (
            <React.Fragment key={item.key}>
              {idx > 0 && <span className="select-none">•</span>}
              <EditableContactLink
                fieldPath={item.fieldPath}
                value={item.value}
                placeholder={item.placeholder}
                isUrl={item.isUrl}
              />
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Summary */}
      {(isEditable || summary) && (
        <section data-resume-section="summary" className="mt-4">
          <div
            className={`relative border-b pb-0.5 mb-1.5 flex items-center justify-center ${isEditable ? 'px-24' : ''}`}
            style={{ borderBottomColor: ruleColor }}
          >
            <h2 className="text-xs font-bold uppercase tracking-widest" style={{ color: ruleColor }}>
              Executive Summary
            </h2>
            <div className="absolute right-0">
              <CanvasSectionMoveButtons sectionKey="summary" label="Summary" />
            </div>
          </div>
          <EditableField
            as="p"
            id="summary-textarea"
            fieldPath="summary"
            value={summary || ''}
            placeholder="Executive Summary..."
            className="text-[11px] text-zinc-800 leading-relaxed text-justify block"
            highlightKeywords={highlightKeywords}
            showHighlights={showHighlights}
          />
        </section>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <section data-resume-section="experience" className="mt-4">
          <div
            className={`relative border-b pb-0.5 mb-2 flex items-center justify-center ${isEditable ? 'px-28' : ''}`}
            style={{ borderBottomColor: ruleColor }}
          >
            <h2 className="text-xs font-bold uppercase tracking-widest" style={{ color: ruleColor }}>
              Professional Experience
            </h2>
            <div className="absolute right-0 flex items-center gap-1">
              <CanvasSectionMoveButtons sectionKey="experience" label="Experience" />
              <CanvasSectionAddButton label="Role" onClick={onAddExperience} />
            </div>
          </div>

          <div className="space-y-3.5">
            {experience.map((exp, idx) => (
              <div key={exp.id || idx} className="group/entry relative space-y-1">
                <CanvasEntryDeleteButton onClick={() => onDeleteExperience?.(idx)} label="Delete role" />
                <div className="flex justify-between items-baseline text-xs font-bold text-zinc-950 gap-2">
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
                    className="text-[10px] font-normal text-zinc-600"
                  />
                </div>
                <div className="flex justify-between items-baseline text-[11px] italic text-zinc-800 gap-2">
                  <EditableField
                    as="span"
                    fieldPath={`experience[${idx}].title`}
                    value={exp.title}
                    placeholder="Title"
                  />
                  <EditableDateRange
                    startDate={exp.startDate}
                    endDate={exp.endDate}
                    current={exp.current}
                    startFieldPath={`experience[${idx}].startDate`}
                    endFieldPath={`experience[${idx}].endDate`}
                    className="text-[10px] not-italic text-zinc-600"
                  />
                </div>

                <EditableBulletList
                  bullets={exp.bullets || []}
                  section="experience"
                  expIdx={idx}
                  highlightKeywords={highlightKeywords}
                  showHighlights={showHighlights}
                  className="list-disc pl-4 space-y-0.5 text-[10.5px] text-zinc-800 leading-relaxed"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {education.length > 0 && (
        <section data-resume-section="education" className="mt-4">
          <div
            className={`relative border-b pb-0.5 mb-2 flex items-center justify-center ${isEditable ? 'px-28' : ''}`}
            style={{ borderBottomColor: ruleColor }}
          >
            <h2 className="text-xs font-bold uppercase tracking-widest" style={{ color: ruleColor }}>
              Education
            </h2>
            <div className="absolute right-0 flex items-center gap-1">
              <CanvasSectionMoveButtons sectionKey="education" label="Education" />
              <CanvasSectionAddButton label="Degree" onClick={onAddEducation} />
            </div>
          </div>
          <div className="space-y-2">
            {education.map((edu, idx) => (
              <div key={edu.id || idx} className="group/entry relative space-y-0.5">
                <CanvasEntryDeleteButton onClick={() => onDeleteEducation?.(idx)} label="Delete degree" />
                <div className="flex justify-between items-baseline text-[11px] font-bold text-zinc-950 gap-2">
                  <EditableField
                    as="span"
                    fieldPath={`education[${idx}].school`}
                    value={edu.school}
                    placeholder="School / University"
                    className="font-bold text-zinc-950"
                  />
                  <EditableField
                    as="span"
                    fieldPath={`education[${idx}].graduationDate`}
                    value={edu.graduationDate || ''}
                    placeholder="Year"
                    className="text-[10px] font-normal text-zinc-600"
                  />
                </div>
                <div className="flex justify-between items-baseline text-[10.5px] italic text-zinc-800 gap-2">
                  <div className="flex items-center gap-1 flex-wrap">
                    <EditableField
                      as="span"
                      fieldPath={`education[${idx}].degree`}
                      value={edu.degree}
                      placeholder="Degree"
                    />
                    {(isEditable || edu.field) && (
                      <>
                        <span className="not-italic">,</span>
                        <EditableField
                          as="span"
                          fieldPath={`education[${idx}].field`}
                          value={edu.field || ''}
                          placeholder="Field"
                        />
                      </>
                    )}
                  </div>
                  {(isEditable || edu.location) && (
                    <EditableField
                      as="span"
                      fieldPath={`education[${idx}].location`}
                      value={edu.location || ''}
                      placeholder="Location"
                      className="text-[10px] not-italic text-zinc-500"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <section data-resume-section="projects" className="mt-4">
          <div
            className={`relative border-b pb-0.5 mb-2 flex items-center justify-center ${isEditable ? 'px-28' : ''}`}
            style={{ borderBottomColor: ruleColor }}
          >
            <h2 className="text-xs font-bold uppercase tracking-widest" style={{ color: ruleColor }}>
              Key Projects
            </h2>
            <div className="absolute right-0 flex items-center gap-1">
              <CanvasSectionMoveButtons sectionKey="projects" label="Projects" />
              <CanvasSectionAddButton label="Project" onClick={onAddProject} />
            </div>
          </div>
          <div className="space-y-2">
            {projects.map((proj, idx) => (
              <div key={proj.id || idx} className="group/entry relative space-y-0.5 text-[10.5px]">
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
                      className="text-[10px] text-zinc-500 underline"
                    />
                  )}
                </div>
                {(isEditable || proj.description) && (
                  <EditableField
                    as="p"
                    fieldPath={`projects[${idx}].description`}
                    value={proj.description || ''}
                    placeholder="Project description..."
                    className="text-zinc-800 block"
                  />
                )}
                <EditableBulletList
                  bullets={proj.highlights || []}
                  section="projects"
                  projIdx={idx}
                  highlightKeywords={highlightKeywords}
                  showHighlights={showHighlights}
                  className="list-disc pl-4 space-y-0.5 text-[10.5px] text-zinc-800 leading-relaxed"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <section data-resume-section="skills" className="mt-4">
          <div
            className={`relative border-b pb-0.5 mb-1.5 flex items-center justify-center ${isEditable ? 'px-28' : ''}`}
            style={{ borderBottomColor: ruleColor }}
          >
            <h2 className="text-xs font-bold uppercase tracking-widest" style={{ color: ruleColor }}>
              Areas of Expertise & Skills
            </h2>
            <div className="absolute right-0 flex items-center gap-1">
              <CanvasSectionMoveButtons sectionKey="skills" label="Skills" />
              <CanvasSectionAddButton label="Skill" onClick={() => onAddSkill && onAddSkill()} />
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[10.5px] text-zinc-800">
            {skills.map((s, idx) => (
              <span key={idx} className="group/skill inline-flex items-center gap-0.5">
                {idx > 0 && <span className="text-zinc-400 select-none mr-1">•</span>}
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

      <CertificationsBlock
        content={content}
        accentColor={ruleColor}
        variant="serif"
        spacingClassName="mt-4 space-y-2"
      />

      <CustomSectionsBlock
        content={content}
        accentColor={accentColor}
        highlightKeywords={highlightKeywords}
        showHighlights={showHighlights}
        variant="serif"
        spacingClassName="mt-4 space-y-2"
      />
    </div>
  );
}
