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
 * Classic ATS — clean Google-Docs / professional single column.
 * Title left / dates right, company | location, categorized skills with em-dash.
 */
export function ClassicTemplate({
  content,
  accentColor = '#1e3a5f',
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

  const ruleColor = accentColor || '#1e3a5f';

  const skillsByCategory = React.useMemo(() => {
    if (!skills || skills.length === 0) return [];
    const map = new Map<string, Array<{ name: string; idx: number }>>();
    skills.forEach((s, idx) => {
      const cat = s.category || 'Skills';
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push({ name: s.name, idx });
    });
    return Array.from(map.entries()).map(([category, items]) => ({ category, items }));
  }, [skills]);

  const contactItems = [
    { key: 'location', fieldPath: 'contact.location', value: contact.location, placeholder: 'City, State' },
    { key: 'email', fieldPath: 'contact.email', value: contact.email, placeholder: 'email@example.com' },
    { key: 'phone', fieldPath: 'contact.phone', value: contact.phone, placeholder: 'Phone' },
    { key: 'linkedin', fieldPath: 'contact.linkedinUrl', value: contact.linkedinUrl, placeholder: 'linkedin.com/in/you', isUrl: true },
    { key: 'github', fieldPath: 'contact.githubUrl', value: contact.githubUrl, placeholder: 'github.com/you', isUrl: true },
    { key: 'website', fieldPath: 'contact.websiteUrl', value: contact.websiteUrl, placeholder: 'portfolio.dev', isUrl: true },
  ];
  const visibleContact = isEditable
    ? contactItems
    : contactItems.filter((c) => Boolean(c.value?.trim()));

  const sectionTitle = (label: string) => (
    <h2
      className="hr-ats-section-title"
      style={{ color: ruleColor, borderBottomColor: ruleColor }}
    >
      {label}
    </h2>
  );

  return (
    <div
      className={`resume-page-a4 resume-paper-canvas hr-ats-page bg-white text-zinc-950 w-full max-w-[820px] mx-auto text-left ${getTemplateFontClass(fontFamily)} ${className}`}
      style={{ boxSizing: 'border-box' }}
      data-hr-template="classic-ats"
    >
      <header className="text-center pb-2">
        {showPhoto && photoUrl && (
          <div className="flex justify-center mb-2">
            <img
              src={photoUrl}
              alt={contact.fullName || 'Candidate'}
              className="w-14 h-14 rounded-full object-cover border"
              style={{ borderColor: ruleColor }}
            />
          </div>
        )}
        <EditableField
          as="h1"
          fieldPath="contact.fullName"
          value={contact.fullName}
          placeholder="Candidate Name"
          className="hr-ats-name tracking-wide block"
          style={{ color: ruleColor }}
        />
        {(isEditable || headline) && (
          <EditableField
            as="p"
            fieldPath="headline"
            value={headline || ''}
            placeholder="Professional Headline"
            className="hr-ats-headline font-semibold uppercase tracking-wide block mt-0.5"
          />
        )}
        <div className="hr-ats-contact flex flex-wrap items-center justify-center gap-x-1.5 gap-y-0.5 mt-1.5">
          {visibleContact.map((item, idx) => (
            <React.Fragment key={item.key}>
              {idx > 0 && <span className="text-zinc-400 select-none" aria-hidden="true">|</span>}
              <EditableContactLink
                fieldPath={item.fieldPath}
                value={item.value}
                placeholder={item.placeholder}
                isUrl={item.isUrl}
                className="hover:underline"
              />
            </React.Fragment>
          ))}
        </div>
      </header>

      <div className="hr-ats-body flex flex-col pt-1">
        {(isEditable || summary) && (
          <section data-resume-section="summary" className="resume-section">
            <div className="flex items-center justify-between gap-2">
              {sectionTitle('Professional Summary')}
              <CanvasSectionMoveButtons sectionKey="summary" label="Summary" />
            </div>
            <EditableField
              as="p"
              id="summary-textarea"
              fieldPath="summary"
              value={summary || ''}
              placeholder="Professional Summary..."
              className="hr-ats-body-text block mt-1"
              highlightKeywords={highlightKeywords}
              showHighlights={showHighlights}
            />
          </section>
        )}

        {(isEditable || experience.length > 0) && (
          <section data-resume-section="experience" className="resume-section">
            <div className="flex items-center justify-between gap-2">
              {sectionTitle('Work Experience')}
              <div className="flex items-center gap-1">
                <CanvasSectionMoveButtons sectionKey="experience" label="Experience" />
                <CanvasSectionAddButton label="Role" onClick={onAddExperience} />
              </div>
            </div>
            <div className="mt-1 hr-entry-stack" data-hr-entry-stack="true">
              {experience.map((exp, idx) => (
                <div key={exp.id || idx} className="resume-entry group/entry relative">
                  <CanvasEntryDeleteButton onClick={() => onDeleteExperience?.(idx)} label="Delete role" />
                  <div className="hr-ats-row">
                    <EditableField
                      as="span"
                      fieldPath={`experience[${idx}].title`}
                      value={exp.title}
                      placeholder="Role Title"
                      className="hr-ats-entry-title font-bold"
                    />
                    <EditableDateRange
                      startDate={exp.startDate}
                      endDate={exp.endDate}
                      current={exp.current}
                      startFieldPath={`experience[${idx}].startDate`}
                      endFieldPath={`experience[${idx}].endDate`}
                      className="hr-ats-meta shrink-0 whitespace-nowrap"
                    />
                  </div>
                  <div className="hr-ats-row">
                    <span className="hr-ats-entry-sub min-w-0">
                      <EditableField
                        as="span"
                        fieldPath={`experience[${idx}].company`}
                        value={exp.company}
                        placeholder="Company"
                        className="font-semibold"
                      />
                      {(isEditable || exp.location) && (
                        <>
                          <span className="text-zinc-400"> | </span>
                          <EditableField
                            as="span"
                            fieldPath={`experience[${idx}].location`}
                            value={exp.location || ''}
                            placeholder="Location"
                          />
                        </>
                      )}
                    </span>
                  </div>
                  <EditableBulletList
                    bullets={exp.bullets || []}
                    section="experience"
                    expIdx={idx}
                    highlightKeywords={highlightKeywords}
                    showHighlights={showHighlights}
                    className="hr-ats-bullets list-disc list-outside ml-[1.1em] mt-0.5 space-y-0"
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {(isEditable || skills.length > 0) && (
          <section data-resume-section="skills" className="resume-section">
            <div className="flex items-center justify-between gap-2">
              {sectionTitle('Skills')}
              <div className="flex items-center gap-1">
                <CanvasSectionMoveButtons sectionKey="skills" label="Skills" />
                <CanvasSectionAddButton label="Skill" onClick={() => onAddSkill && onAddSkill()} />
              </div>
            </div>
            <div className="mt-1 space-y-0">
              {skillsByCategory.map((group, gIdx) => (
                <div key={gIdx} className="hr-ats-skill-row">
                  <span className="hr-ats-skill-label font-bold">{group.category}: </span>
                  <span className="hr-ats-body-text">
                    {group.items.map((item, iIdx) => (
                      <React.Fragment key={item.idx}>
                        {iIdx > 0 ? ', ' : null}
                        <span className="group/skill">
                          <EditableField
                            as="span"
                            fieldPath={`skills[${item.idx}].name`}
                            value={item.name}
                            placeholder="Skill"
                          />
                          <CanvasEntryDeleteButton
                            variant="chip"
                            onClick={() => onDeleteSkill?.(item.idx)}
                            label="Remove skill"
                          />
                        </span>
                      </React.Fragment>
                    ))}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {(isEditable || projects.length > 0) && (
          <section data-resume-section="projects" className="resume-section">
            <div className="flex items-center justify-between gap-2">
              {sectionTitle('Projects')}
              <div className="flex items-center gap-1">
                <CanvasSectionMoveButtons sectionKey="projects" label="Projects" />
                <CanvasSectionAddButton label="Project" onClick={onAddProject} />
              </div>
            </div>
            <div className="mt-1 hr-entry-stack" data-hr-entry-stack="true">
              {projects.map((proj, idx) => {
                const desc = (proj.description || '').trim();
                const name = (proj.name || '').trim();
                const showDesc = Boolean(desc) && desc.toLowerCase() !== name.toLowerCase();
                const urlLabel = (proj.url || '').trim();
                const showUrl =
                  (isEditable || Boolean(urlLabel)) &&
                  Boolean(urlLabel) &&
                  !/^view\s+project$/i.test(urlLabel);

                return (
                  <div key={proj.id || idx} className="resume-entry group/entry relative">
                    <CanvasEntryDeleteButton onClick={() => onDeleteProject?.(idx)} label="Delete project" />
                    <div className="hr-ats-row items-baseline">
                      <EditableField
                        as="span"
                        fieldPath={`projects[${idx}].name`}
                        value={proj.name}
                        placeholder="Project Name"
                        className="hr-ats-entry-title font-bold min-w-0"
                      />
                      {showUrl ? (
                        <EditableContactLink
                          fieldPath={`projects[${idx}].url`}
                          value={proj.url}
                          placeholder="View Project"
                          isUrl={true}
                          className="hr-ats-meta underline shrink-0"
                        />
                      ) : null}
                    </div>
                    {showDesc && (
                      <EditableField
                        as="p"
                        fieldPath={`projects[${idx}].description`}
                        value={proj.description || ''}
                        placeholder="Tech stack"
                        className="hr-ats-entry-sub font-semibold block mt-0.5"
                      />
                    )}
                    <EditableBulletList
                      bullets={proj.highlights || []}
                      section="projects"
                      projIdx={idx}
                      highlightKeywords={highlightKeywords}
                      showHighlights={showHighlights}
                      className="hr-ats-bullets list-disc list-outside ml-[1.1em] mt-0.5 space-y-0"
                    />
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {(isEditable || education.length > 0) && (
          <section data-resume-section="education" className="resume-section">
            <div className="flex items-center justify-between gap-2">
              {sectionTitle('Education')}
              <div className="flex items-center gap-1">
                <CanvasSectionMoveButtons sectionKey="education" label="Education" />
                <CanvasSectionAddButton label="Degree" onClick={onAddEducation} />
              </div>
            </div>
            <div className="mt-1 hr-entry-stack" data-hr-entry-stack="true">
              {education.map((edu, idx) => (
                <div key={edu.id || idx} className="resume-entry group/entry relative">
                  <CanvasEntryDeleteButton onClick={() => onDeleteEducation?.(idx)} label="Delete degree" />
                  <div className="hr-ats-row">
                    <EditableField
                      as="span"
                      fieldPath={`education[${idx}].degree`}
                      value={edu.degree}
                      placeholder="Degree"
                      className="hr-ats-entry-title font-bold"
                    />
                    <EditableField
                      as="span"
                      fieldPath={`education[${idx}].graduationDate`}
                      value={edu.graduationDate || ''}
                      placeholder="Year"
                      className="hr-ats-meta shrink-0"
                    />
                  </div>
                  <EditableField
                    as="p"
                    fieldPath={`education[${idx}].school`}
                    value={edu.school}
                    placeholder="School"
                    className="hr-ats-entry-sub block"
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        <CertificationsBlock content={content} accentColor={ruleColor} spacingClassName="mt-3.5 space-y-1.5" />
        <CustomSectionsBlock
          content={content}
          accentColor={accentColor}
          highlightKeywords={highlightKeywords}
          showHighlights={showHighlights}
          spacingClassName="mt-3.5 space-y-1.5"
        />
      </div>
    </div>
  );
}
