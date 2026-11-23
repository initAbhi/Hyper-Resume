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
 * Jake's Resume — ATS-first single column.
 * Typography targets Jake Gutierrez / Overleaf defaults: 11pt body, ~0.5" margins,
 * ruled section headers, title|dates and company|location alignment.
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
      const cat = s.category || 'Skills';
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push({ name: s.name, idx });
    });
    return Array.from(map.entries()).map(([category, items]) => ({ category, items }));
  }, [skills]);

  const ruleColor = accentColor && accentColor !== '#000000' ? accentColor : '#111111';

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

  const sectionTitle = (label: string) => (
    <h2
      className="hr-ats-section-title"
      style={{
        color: ruleColor,
        borderBottomColor: ruleColor,
      }}
    >
      {label}
    </h2>
  );

  return (
    <div
      className={`resume-page-a4 resume-paper-canvas hr-ats-page bg-white text-zinc-950 w-full max-w-[820px] mx-auto text-left ${getTemplateFontClass(fontFamily)} ${className}`}
      style={{ boxSizing: 'border-box' }}
      data-hr-template="jake-ats"
    >
      <header className="text-center pb-2">
        {showPhoto && photoUrl && (
          <div className="flex justify-center mb-2">
            <img
              src={photoUrl}
              alt={contact.fullName || 'Candidate'}
              className="w-14 h-14 rounded-full object-cover border border-zinc-300"
            />
          </div>
        )}
        <EditableField
          as="h1"
          fieldPath="contact.fullName"
          value={contact.fullName}
          placeholder="Candidate Name"
          className="hr-ats-name uppercase tracking-wide block"
        />
        {(isEditable || headline) && (
          <EditableField
            as="p"
            fieldPath="headline"
            value={headline || ''}
            placeholder="Professional Headline"
            className="hr-ats-headline block mt-0.5"
          />
        )}
        <div className="hr-ats-contact flex flex-wrap items-center justify-center gap-x-1.5 gap-y-0.5 mt-1.5">
          {visibleContactItems.map((item, idx) => (
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
              placeholder="Write a concise 2–3 line professional summary highlighting key impact..."
              className="hr-ats-body-text block mt-1"
              highlightKeywords={highlightKeywords}
              showHighlights={showHighlights}
            />
          </section>
        )}

        {(isEditable || experience.length > 0) && (
          <section data-resume-section="experience" className="resume-section">
            <div className="flex items-center justify-between gap-2">
              {sectionTitle('Experience')}
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
                      placeholder="Title"
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
                    <EditableField
                      as="span"
                      fieldPath={`experience[${idx}].company`}
                      value={exp.company}
                      placeholder="Company"
                      className="hr-ats-entry-sub italic"
                    />
                    <EditableField
                      as="span"
                      fieldPath={`experience[${idx}].location`}
                      value={exp.location || ''}
                      placeholder="Location"
                      className="hr-ats-meta shrink-0"
                    />
                  </div>
                  <EditableBulletList
                    bullets={exp.bullets || []}
                    section="experience"
                    expIdx={idx}
                    highlightKeywords={highlightKeywords}
                    showHighlights={showHighlights}
                    className="hr-ats-bullets list-disc list-outside ml-[1.1em] mt-0.5 space-y-0"
                    liClassName="pl-0.5"
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {(isEditable || (projects && projects.length > 0)) && (
          <section data-resume-section="projects" className="resume-section">
            <div className="flex items-center justify-between gap-2">
              {sectionTitle('Projects')}
              <div className="flex items-center gap-1">
                <CanvasSectionMoveButtons sectionKey="projects" label="Projects" />
                <CanvasSectionAddButton label="Project" onClick={onAddProject} />
              </div>
            </div>
            <div className="mt-1 hr-entry-stack" data-hr-entry-stack="true">
              {(projects || []).map((proj, idx) => {
                const desc = (proj.description || '').trim();
                const name = (proj.name || '').trim();
                const showDesc = Boolean(desc) && desc.toLowerCase() !== name.toLowerCase();
                const urlLabel = (proj.url || '').trim();
                const showUrl =
                  Boolean(urlLabel) &&
                  !/^view\s+project$/i.test(urlLabel) &&
                  (isEditable || Boolean(urlLabel));

                return (
                  <div key={proj.id || idx} className="resume-entry group/entry relative">
                    <CanvasEntryDeleteButton onClick={() => onDeleteProject?.(idx)} label="Delete project" />
                    <div className="hr-ats-row items-baseline">
                      <div className="flex flex-wrap items-baseline gap-x-1.5 min-w-0">
                        <EditableField
                          as="span"
                          fieldPath={`projects[${idx}].name`}
                          value={proj.name}
                          placeholder="Project Name"
                          className="hr-ats-entry-title font-bold"
                        />
                        {showUrl && (
                          <EditableContactLink
                            fieldPath={`projects[${idx}].url`}
                            value={proj.url}
                            placeholder="project-url.com"
                            isUrl={true}
                            className="hr-ats-meta underline"
                          />
                        )}
                      </div>
                    </div>
                    {showDesc && (
                      <EditableField
                        as="p"
                        fieldPath={`projects[${idx}].description`}
                        value={proj.description || ''}
                        placeholder="Tech stack or one-line summary"
                        className="hr-ats-entry-sub italic block mt-0.5"
                      />
                    )}
                    <EditableBulletList
                      bullets={proj.highlights || []}
                      section="projects"
                      projIdx={idx}
                      highlightKeywords={highlightKeywords}
                      showHighlights={showHighlights}
                      className="hr-ats-bullets list-disc list-outside ml-[1.1em] mt-0.5 space-y-0"
                      liClassName="pl-0.5"
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
                      fieldPath={`education[${idx}].school`}
                      value={edu.school}
                      placeholder="University / School"
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
                  <div className="hr-ats-row">
                    <div className="flex flex-wrap items-baseline gap-1 min-w-0">
                      <EditableField
                        as="span"
                        fieldPath={`education[${idx}].degree`}
                        value={edu.degree}
                        placeholder="Degree"
                        className="hr-ats-entry-sub italic"
                      />
                      {(isEditable || edu.field) && edu.field !== 'N/A' && (
                        <>
                          <span className="hr-ats-meta">in</span>
                          <EditableField
                            as="span"
                            fieldPath={`education[${idx}].field`}
                            value={edu.field || ''}
                            placeholder="Field of Study"
                            className="hr-ats-entry-sub italic"
                          />
                        </>
                      )}
                    </div>
                    <EditableField
                      as="span"
                      fieldPath={`education[${idx}].location`}
                      value={edu.location || ''}
                      placeholder=""
                      className="hr-ats-meta shrink-0"
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {(isEditable || skills.length > 0) && (
          <section data-resume-section="skills" className="resume-section">
            <div className="flex items-center justify-between gap-2">
              {sectionTitle('Technical Skills')}
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
