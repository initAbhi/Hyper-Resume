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

  const skillsByCategory = React.useMemo(() => {
    if (!skills || skills.length === 0) return [];
    const map = new Map<string, Array<{ name: string; idx: number }>>();
    skills.forEach((s, idx) => {
      const cat = s.category || 'Core Skills';
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push({ name: s.name, idx });
    });
    return Array.from(map.entries()).map(([category, items]) => ({
      category,
      items,
    }));
  }, [skills]);

  const ruleColor = accentColor !== '#000000' ? accentColor : '#18181b';

  const contactItems: Array<{
    key: string;
    fieldPath: string;
    value?: string;
    placeholder: string;
    isUrl?: boolean;
  }> = [
    { key: 'phone', fieldPath: 'contact.phone', value: contact.phone, placeholder: 'Phone' },
    { key: 'email', fieldPath: 'contact.email', value: contact.email, placeholder: 'email@example.com' },
    { key: 'location', fieldPath: 'contact.location', value: contact.location, placeholder: 'City, State' },
    { key: 'linkedin', fieldPath: 'contact.linkedinUrl', value: contact.linkedinUrl, placeholder: 'linkedin.com/in/you', isUrl: true },
    { key: 'github', fieldPath: 'contact.githubUrl', value: contact.githubUrl, placeholder: 'github.com/you', isUrl: true },
    { key: 'website', fieldPath: 'contact.websiteUrl', value: contact.websiteUrl, placeholder: 'portfolio.dev', isUrl: true },
  ];

  const visibleContactItems = isEditable
    ? contactItems.filter(
        (item) =>
          item.key === 'phone' ||
          item.key === 'email' ||
          item.key === 'location' ||
          Boolean(item.value?.trim()),
      )
    : contactItems.filter((item) => Boolean(item.value?.trim()));

  return (
    <div
      className={`resume-page-a4 resume-paper-canvas bg-white text-zinc-950 p-8 sm:p-11 rounded-sm shadow-md border border-zinc-200/80 w-full max-w-[820px] mx-auto text-left leading-relaxed ${getTemplateFontClass(fontFamily)} ${className}`}
      style={{ boxSizing: 'border-box' }}
    >
      {/* Centered Name & Contact Header */}
      <header className="text-center pb-3 border-b border-transparent">
        {showPhoto && photoUrl && (
          <div className="flex justify-center mb-2">
            <img
              src={photoUrl}
              alt={contact.fullName || 'Candidate'}
              className="w-16 h-16 rounded-full object-cover border border-zinc-300 shadow-xs"
            />
          </div>
        )}
        <EditableField
          as="h1"
          fieldPath="contact.fullName"
          value={contact.fullName}
          placeholder="Candidate Name"
          className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950 uppercase block"
        />
        {(isEditable || headline) && (
          <EditableField
            as="p"
            fieldPath="headline"
            value={headline || ''}
            placeholder="Professional Headline"
            className="text-xs font-medium text-zinc-700 mt-0.5 tracking-wide block"
          />
        )}

        {/* Contact Line with Separators */}
        <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[10.5px] text-zinc-700 mt-2 font-normal">
          {visibleContactItems.map((item, idx) => (
            <React.Fragment key={item.key}>
              {idx > 0 && <span className="text-zinc-400 select-none">|</span>}
              <EditableContactLink
                fieldPath={item.fieldPath}
                value={item.value}
                placeholder={item.placeholder}
                isUrl={item.isUrl}
                className="text-zinc-800 hover:underline"
              />
            </React.Fragment>
          ))}
        </div>
      </header>

      {/* Main Content Sections */}
      <div className="space-y-4 pt-1">
        {/* Professional Summary */}
        {(isEditable || summary) && (
          <section data-resume-section="summary" className="resume-section">
            <div
              className="flex items-center justify-between pb-0.5 mb-1.5 border-b"
              style={{ borderBottomColor: ruleColor, borderBottomWidth: '1.5px' }}
            >
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
              placeholder="Write a concise 2–3 line professional summary highlighting key impact..."
              className="text-[10.5px] text-zinc-700 leading-relaxed block"
              highlightKeywords={highlightKeywords}
              showHighlights={showHighlights}
            />
          </section>
        )}

        {/* Experience Section */}
        {experience.length > 0 && (
          <section data-resume-section="experience" className="resume-section">
            <div
              className="flex items-center justify-between pb-0.5 mb-2 border-b"
              style={{ borderBottomColor: ruleColor, borderBottomWidth: '1.5px' }}
            >
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-950">
                Experience
              </h2>
              <div className="flex items-center gap-1">
                <CanvasSectionMoveButtons sectionKey="experience" label="Experience" />
                <CanvasSectionAddButton label="Role" onClick={onAddExperience} />
              </div>
            </div>
            <div className="space-y-3">
              {experience.map((exp, idx) => (
                <div key={exp.id || idx} className="resume-entry group/entry relative space-y-1">
                  <CanvasEntryDeleteButton onClick={() => onDeleteExperience?.(idx)} label="Delete role" />
                  <div className="flex justify-between items-baseline text-[11px] gap-2">
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
                      className="font-medium text-zinc-700 text-[10.5px]"
                    />
                  </div>
                  <div className="flex justify-between items-baseline text-[10.5px] italic text-zinc-700 gap-2">
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
                      className="not-italic text-zinc-600 font-normal text-[10.5px]"
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

        {/* Projects Section */}
        {projects && projects.length > 0 && (
          <section data-resume-section="projects" className="resume-section">
            <div
              className="flex items-center justify-between pb-0.5 mb-2 border-b"
              style={{ borderBottomColor: ruleColor, borderBottomWidth: '1.5px' }}
            >
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-950">
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
                      placeholder="Project description and key technical architecture..."
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

        {/* Education Section */}
        {education.length > 0 && (
          <section data-resume-section="education" className="resume-section">
            <div
              className="flex items-center justify-between pb-0.5 mb-2 border-b"
              style={{ borderBottomColor: ruleColor, borderBottomWidth: '1.5px' }}
            >
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-950">
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
                      placeholder="University / School"
                    />
                    <EditableField
                      as="span"
                      fieldPath={`education[${idx}].location`}
                      value={edu.location || ''}
                      placeholder="Location"
                      className="font-semibold text-zinc-700 text-[10.5px]"
                    />
                  </div>
                  <div className="flex justify-between items-baseline text-zinc-700 italic text-[10.5px] gap-2">
                    <div className="flex items-center gap-1 flex-wrap">
                      <EditableField
                        as="span"
                        fieldPath={`education[${idx}].degree`}
                        value={edu.degree}
                        placeholder="Degree"
                      />
                      {(isEditable || edu.field) && (
                        <>
                          <span className="not-italic text-zinc-500">in</span>
                          <EditableField
                            as="span"
                            fieldPath={`education[${idx}].field`}
                            value={edu.field || ''}
                            placeholder="Field of Study"
                          />
                        </>
                      )}
                    </div>
                    <EditableField
                      as="span"
                      fieldPath={`education[${idx}].graduationDate`}
                      value={edu.graduationDate || ''}
                      placeholder="Graduation Date"
                      className="not-italic text-zinc-600 font-normal"
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Technical Skills Section */}
        {skills.length > 0 && (
          <section data-resume-section="skills" className="resume-section">
            <div
              className="flex items-center justify-between pb-0.5 mb-1.5 border-b"
              style={{ borderBottomColor: ruleColor, borderBottomWidth: '1.5px' }}
            >
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-950">
                Technical Skills
              </h2>
              <div className="flex items-center gap-1">
                <CanvasSectionMoveButtons sectionKey="skills" label="Skills" />
                <CanvasSectionAddButton label="Skill" onClick={() => onAddSkill && onAddSkill()} />
              </div>
            </div>
            <div className="space-y-1 text-[10.5px] text-zinc-800">
              {skillsByCategory.map((group, gIdx) => (
                <div key={gIdx} className="flex gap-1.5 items-baseline">
                  <span className="font-bold text-zinc-950 shrink-0">
                    {group.category}:
                  </span>
                  <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-zinc-700">
                    {group.items.map((item, iIdx) => (
                      <span key={item.idx} className="group/skill inline-flex items-center gap-0.5">
                        {iIdx > 0 && <span className="text-zinc-400 select-none mr-1">,</span>}
                        <EditableField
                          as="span"
                          fieldPath={`skills[${item.idx}].name`}
                          value={item.name}
                          placeholder="Skill"
                        />
                        <CanvasEntryDeleteButton variant="chip" onClick={() => onDeleteSkill?.(item.idx)} label="Remove skill" />
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <CertificationsBlock content={content} accentColor={ruleColor} />

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
