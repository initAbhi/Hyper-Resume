'use client';

import React from 'react';
import { MapPin, Mail, Phone, Globe, Calendar, User } from 'lucide-react';
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

export function DoubleColumnTemplate({
  content,
  accentColor = '#00b5cb',
  fontFamily = 'sans',
  showPhoto = true,
  photoUrl,
  highlightKeywords,
  showHighlights = false,
  className = '',
}: TemplateProps) {
  const {
    contact,
    headline,
    summary,
    experience = [],
    education = [],
    skills = [],
    projects = [],
  } = content;
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

  const pageMode = (content.layout as any)?.pageMode || 'auto';

  const totalExpBullets = experience.reduce((acc, exp) => acc + (exp.bullets?.length || 1), 0);
  const totalProjHighlights = projects.reduce((acc, p) => acc + (p.highlights?.length || 1), 0);

  const needsSecondPage =
    pageMode === 'single'
      ? false
      : pageMode === 'multi'
        ? true
        : experience.length >= 4 ||
        totalExpBullets >= 14 ||
        totalExpBullets + totalProjHighlights >= 16 ||
        (experience.length >= 3 && totalExpBullets >= 10 && projects.length >= 2);

  let page1Experiences: typeof experience = [];
  let page2Experiences: typeof experience = [];
  let page1Projects: typeof projects = [];
  let page2Projects: typeof projects = [];

  if (!needsSecondPage) {
    page1Experiences = experience;
    page1Projects = projects;
  } else {
    if (experience.length >= 3) {
      page1Experiences = experience.slice(0, 2);
      page2Experiences = experience.slice(2);
      page1Projects = [];
      page2Projects = projects;
    } else if (experience.length === 2) {
      page1Experiences = [experience[0]];
      page2Experiences = [experience[1]];
      page1Projects = projects.length > 0 ? [projects[0]] : [];
      page2Projects = projects.slice(1);
    } else {
      page1Experiences = experience;
      page2Experiences = [];
      page1Projects = projects.slice(0, 1);
      page2Projects = projects.slice(1);
    }
  }

  const page1Skills = needsSecondPage && skills.length > 20 ? skills.slice(0, 20) : skills;
  const page2Skills = needsSecondPage && skills.length > 20 ? skills.slice(20) : [];

  const fontClass = getTemplateFontClass(fontFamily);

  const renderExperienceEntry = (exp: (typeof experience)[number], targetExpIdx: number) => (
    <div key={exp.id || targetExpIdx} className="group/entry relative space-y-0.5">
      <CanvasEntryDeleteButton onClick={() => onDeleteExperience?.(targetExpIdx)} label="Delete role" />
      <div className="flex justify-between items-baseline gap-2">
        <EditableField
          as="span"
          fieldPath={`experience[${targetExpIdx}].title`}
          value={exp.title}
          placeholder="Title"
          className="font-bold text-xs text-zinc-900"
        />
        <span className="inline-flex items-center gap-1 text-[10px] text-zinc-500 shrink-0">
          <Calendar className="w-2.5 h-2.5 text-zinc-400" />
          <EditableDateRange
            startDate={exp.startDate}
            endDate={exp.endDate}
            current={exp.current}
            startFieldPath={`experience[${targetExpIdx}].startDate`}
            endFieldPath={`experience[${targetExpIdx}].endDate`}
            className="text-[10px] text-zinc-500"
          />
        </span>
      </div>

      <div className="text-[11px] font-medium flex flex-wrap items-center gap-1" style={{ color: accentColor }}>
        <EditableField
          as="span"
          fieldPath={`experience[${targetExpIdx}].company`}
          value={exp.company}
          placeholder="Company"
          className="font-medium"
          style={{ color: accentColor }}
        />
        {(isEditable || exp.location) && (
          <>
            <span className="text-zinc-400">•</span>
            <EditableField
              as="span"
              fieldPath={`experience[${targetExpIdx}].location`}
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
        expIdx={targetExpIdx}
        highlightKeywords={highlightKeywords}
        showHighlights={showHighlights}
        className="list-disc pl-3.5 space-y-0.5 text-[10.5px] text-zinc-700 leading-[1.45] pt-0.5"
        liClassName="pl-0.5"
      />
    </div>
  );

  const renderProjectEntry = (proj: (typeof projects)[number], targetProjIdx: number) => (
    <div key={proj.id || targetProjIdx} className="group/entry relative space-y-0.5 text-[10.5px]">
      <CanvasEntryDeleteButton onClick={() => onDeleteProject?.(targetProjIdx)} label="Delete project" />
      <div className="font-bold text-zinc-900 flex items-center justify-between gap-2">
        <EditableField
          as="span"
          fieldPath={`projects[${targetProjIdx}].name`}
          value={proj.name}
          placeholder="Project Name"
        />
        {(isEditable || proj.url) && (
          <EditableContactLink
            fieldPath={`projects[${targetProjIdx}].url`}
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
          fieldPath={`projects[${targetProjIdx}].description`}
          value={proj.description || ''}
          placeholder="Project description..."
          className="text-zinc-700 leading-relaxed block"
        />
      )}
      <EditableBulletList
        bullets={proj.highlights || []}
        section="projects"
        projIdx={targetProjIdx}
        highlightKeywords={highlightKeywords}
        showHighlights={showHighlights}
        className="list-disc pl-3.5 space-y-0.5 text-zinc-600 text-[10px]"
      />
    </div>
  );

  return (
    <div className={`w-full max-w-[794px] mx-auto text-left leading-relaxed ${fontClass} ${className}`}>
      {/* ================= PAGE 1 ================= */}
      <div
        className="resume-page-a4 flex flex-col justify-between"
        id="resume-page-1"
        style={{ boxSizing: 'border-box' }}
      >
        <div className="space-y-4">
          {/* Top Header */}
          <div className="flex items-start justify-between gap-6 pb-3 border-b border-zinc-200">
            <div className="space-y-1 flex-1 min-w-0">
              <EditableField
                as="h1"
                fieldPath="contact.fullName"
                value={contact.fullName}
                placeholder="Candidate Name"
                className="text-2xl sm:text-[27px] font-bold uppercase tracking-tight text-zinc-900 leading-tight block"
              />

              {(isEditable || headline) && (
                <EditableField
                  as="p"
                  fieldPath="headline"
                  value={headline || ''}
                  placeholder="Professional Headline"
                  className="text-xs sm:text-[12.5px] font-medium leading-snug block"
                  style={{ color: accentColor }}
                />
              )}

              {/* Contact Details */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10.5px] text-zinc-600 pt-0.5">
                {(isEditable || contact.phone) && (
                  <span className="inline-flex items-center gap-1.5">
                    <Phone className="w-3 h-3 text-zinc-400 shrink-0" />
                    <EditableContactLink fieldPath="contact.phone" value={contact.phone} placeholder="Phone" />
                  </span>
                )}
                {(isEditable || contact.email) && (
                  <span className="inline-flex items-center gap-1.5">
                    <Mail className="w-3 h-3 text-zinc-400 shrink-0" />
                    <EditableContactLink fieldPath="contact.email" value={contact.email} placeholder="email@example.com" />
                  </span>
                )}
                {(isEditable || contact.linkedinUrl) && (
                  <span className="inline-flex items-center gap-1.5">
                    <LinkedinIcon className="w-3 h-3 text-zinc-400 shrink-0" />
                    <EditableContactLink fieldPath="contact.linkedinUrl" value={contact.linkedinUrl} placeholder="linkedin.com/in/you" isUrl={true} className="truncate max-w-[220px]" />
                  </span>
                )}
                {(isEditable || contact.location) && (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 text-zinc-400 shrink-0" />
                    <EditableContactLink fieldPath="contact.location" value={contact.location} placeholder="City, State" />
                  </span>
                )}
                {(isEditable || contact.githubUrl) && (
                  <span className="inline-flex items-center gap-1.5">
                    <GithubIcon className="w-3 h-3 text-zinc-400 shrink-0" />
                    <EditableContactLink fieldPath="contact.githubUrl" value={contact.githubUrl} placeholder="github.com/you" isUrl={true} className="truncate max-w-[180px]" />
                  </span>
                )}
                {(isEditable || contact.websiteUrl) && (
                  <span className="inline-flex items-center gap-1.5">
                    <Globe className="w-3 h-3 text-zinc-400 shrink-0" />
                    <EditableContactLink fieldPath="contact.websiteUrl" value={contact.websiteUrl} placeholder="portfolio.dev" isUrl={true} className="truncate max-w-[180px]" />
                  </span>
                )}
              </div>
            </div>

            {showPhoto && photoUrl && (
              <div className="shrink-0 pt-0.5">
                <img
                  src={photoUrl}
                  alt={contact.fullName || 'Candidate'}
                  className="w-18 h-18 sm:w-20 sm:h-20 rounded-full object-cover border-2 shadow-xs"
                  style={{ borderColor: accentColor }}
                />
              </div>
            )}
          </div>

          {/* 2-Column Split */}
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-7 space-y-4">
              {(isEditable || summary) && (
                <section data-resume-section="summary" className="space-y-1">
                  <div className="flex items-center justify-between pb-1 border-b border-zinc-200">
                    <h2 className="text-[11.5px] font-bold uppercase tracking-wider text-zinc-800">
                      Summary
                    </h2>
                    <CanvasSectionMoveButtons sectionKey="summary" label="Summary" />
                  </div>
                  <EditableField
                    as="p"
                    id="summary-textarea"
                    fieldPath="summary"
                    value={summary || ''}
                    placeholder="Summary..."
                    className="text-[10.5px] text-zinc-700 leading-[1.48] pt-0.5 whitespace-pre-line block"
                    highlightKeywords={highlightKeywords}
                    showHighlights={showHighlights}
                  />
                </section>
              )}

              {page1Experiences.length > 0 && (
                <section data-resume-section="experience" className="space-y-2.5">
                  <div className="flex items-center justify-between pb-1 border-b border-zinc-200">
                    <h2 className="text-[11.5px] font-bold uppercase tracking-wider text-zinc-800">
                      Experience
                    </h2>
                    <div className="flex items-center gap-1">
                      <CanvasSectionMoveButtons sectionKey="experience" label="Experience" />
                      <CanvasSectionAddButton label="Role" onClick={onAddExperience} />
                    </div>
                  </div>

                  <div className="space-y-3.5">
                    {page1Experiences.map((exp, idx) => renderExperienceEntry(exp, idx))}
                  </div>
                </section>
              )}

              {page1Projects.length > 0 && (
                <section data-resume-section="projects" className="space-y-2 pt-1">
                  <div className="flex items-center justify-between pb-1 border-b border-zinc-200">
                    <h2 className="text-[11.5px] font-bold uppercase tracking-wider text-zinc-800">
                      Selected Projects
                    </h2>
                    <div className="flex items-center gap-1">
                      <CanvasSectionMoveButtons sectionKey="projects" label="Projects" />
                      <CanvasSectionAddButton label="Project" onClick={onAddProject} />
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    {page1Projects.map((proj, idx) => renderProjectEntry(proj, idx))}
                  </div>
                </section>
              )}

              {!needsSecondPage && (
                <>
                  <CertificationsBlock content={content} accentColor={accentColor} />
                  <CustomSectionsBlock
                    content={content}
                    accentColor={accentColor}
                    highlightKeywords={highlightKeywords}
                    showHighlights={showHighlights}
                  />
                </>
              )}
            </div>

            {/* Right Column: EDUCATION & KEY SKILLS */}
            <div className="col-span-5 space-y-4">
              {education.length > 0 && (
                <section data-resume-section="education" className="space-y-2">
                  <div className="flex items-center justify-between pb-1 border-b border-zinc-200">
                    <h2 className="text-[11.5px] font-bold uppercase tracking-wider text-zinc-800">
                      Education
                    </h2>
                    <div className="flex items-center gap-1">
                      <CanvasSectionMoveButtons sectionKey="education" label="Education" />
                      <CanvasSectionAddButton label="Degree" onClick={onAddEducation} />
                    </div>
                  </div>

                  <div className="space-y-3">
                    {education.map((edu, idx) => {
                      const schoolName = edu.school || (edu as any).institution || '';
                      const dateDisplay =
                        edu.graduationDate ||
                        ((edu as any).startDate
                          ? `${(edu as any).startDate} – ${(edu as any).current ? 'Present' : (edu as any).endDate || ''}`
                          : '');

                      return (
                        <div key={edu.id || idx} className="group/entry relative space-y-0.5 text-[10.5px]">
                          <CanvasEntryDeleteButton onClick={() => onDeleteEducation?.(idx)} label="Delete degree" />
                          <div className="font-bold text-zinc-900 text-[11px] leading-snug">
                            <EditableField
                              as="span"
                              fieldPath={`education[${idx}].degree`}
                              value={edu.degree}
                              placeholder="Degree"
                            />
                            {(isEditable || edu.field) && (
                              <>
                                {', '}
                                <EditableField
                                  as="span"
                                  fieldPath={`education[${idx}].field`}
                                  value={edu.field || ''}
                                  placeholder="Field"
                                />
                              </>
                            )}
                          </div>
                          {(isEditable || schoolName) && (
                            <EditableField
                              as="div"
                              fieldPath={`education[${idx}].school`}
                              value={schoolName}
                              placeholder="School"
                              className="font-medium text-[10.5px]"
                              style={{ color: accentColor }}
                            />
                          )}
                          {(isEditable || dateDisplay || edu.location) && (
                            <div className="flex flex-wrap items-center gap-1 text-[10px] text-zinc-400">
                              <Calendar className="w-2.5 h-2.5 text-zinc-400 shrink-0" />
                              <EditableField
                                as="span"
                                fieldPath={`education[${idx}].graduationDate`}
                                value={dateDisplay}
                                placeholder="Year"
                              />
                              {(isEditable || edu.location) && (
                                <>
                                  <span>·</span>
                                  <EditableField
                                    as="span"
                                    fieldPath={`education[${idx}].location`}
                                    value={edu.location || ''}
                                    placeholder="Location"
                                  />
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {page1Skills.length > 0 && (
                <section data-resume-section="skills" className="space-y-2">
                  <div className="flex items-center justify-between pb-1 border-b border-zinc-200">
                    <h2 className="text-[11.5px] font-bold uppercase tracking-wider text-zinc-800">
                      Key Skills
                    </h2>
                    <div className="flex items-center gap-1">
                      <CanvasSectionMoveButtons sectionKey="skills" label="Skills" />
                      <CanvasSectionAddButton label="Skill" onClick={() => onAddSkill && onAddSkill()} />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {page1Skills.map((skill, idx) => {
                      const skillName = typeof skill === 'string' ? skill : (skill as any).name || '';
                      return (
                        <span
                          key={idx}
                          className="group/skill inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-100 text-zinc-800 border border-zinc-200/80"
                        >
                          <EditableField
                            as="span"
                            fieldPath={`skills[${idx}].name`}
                            value={skillName}
                            placeholder="Skill"
                          />
                          <CanvasEntryDeleteButton variant="chip" onClick={() => onDeleteSkill?.(idx)} label="Remove skill" />
                        </span>
                      );
                    })}
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>

        {needsSecondPage && (
          <div className="pt-3 mt-auto border-t border-zinc-100 flex items-center justify-end text-[10px] text-zinc-400 select-none">
            <span>Page 1 of 2</span>
          </div>
        )}
      </div>

      {/* ================= PAGE BREAK DIVIDER (Screen Only) ================= */}
      {needsSecondPage && (
        <div data-export-exclude="true" className="flex items-center justify-center my-8 py-2 select-none print:hidden">
          <div className="h-[1px] bg-zinc-300 w-28 sm:w-44" />
          <span className="mx-4 text-xs font-semibold text-zinc-500 tracking-wider uppercase">
            —— Page 2 ——
          </span>
          <div className="h-[1px] bg-zinc-300 w-28 sm:w-44" />
        </div>
      )}

      {/* ================= PAGE 2 ================= */}
      {needsSecondPage && (
        <div
          className="resume-page-a4 flex flex-col justify-between"
          id="resume-page-2"
          style={{ boxSizing: 'border-box' }}
        >
          <div className="space-y-4">
            <div className={`grid ${page2Skills.length > 0 ? 'grid-cols-12 gap-6' : 'grid-cols-1 gap-4'}`}>
              <div className={page2Skills.length > 0 ? 'col-span-7 space-y-4' : 'space-y-4'}>
                {page2Experiences.length > 0 && (
                  <section className="space-y-2.5">
                    <div className="flex items-center justify-between pb-1 border-b border-zinc-200">
                      <h2 className="text-[11.5px] font-bold uppercase tracking-wider text-zinc-800">
                        Experience (Continued)
                      </h2>
                      <CanvasSectionAddButton label="Role" onClick={onAddExperience} />
                    </div>
                    <div className="space-y-3.5">
                      {page2Experiences.map((exp, idx) => {
                        const originalExpIdx = experience.indexOf(exp);
                        const targetExpIdx = originalExpIdx >= 0 ? originalExpIdx : idx;
                        return renderExperienceEntry(exp, targetExpIdx);
                      })}
                    </div>
                  </section>
                )}

                {page2Projects.length > 0 && (
                  <section className="space-y-2 pt-1">
                    <div className="flex items-center justify-between pb-1 border-b border-zinc-200">
                      <h2 className="text-[11.5px] font-bold uppercase tracking-wider text-zinc-800">
                        Selected Projects
                      </h2>
                      <CanvasSectionAddButton label="Project" onClick={onAddProject} />
                    </div>
                    <div className="space-y-2.5">
                      {page2Projects.map((proj, idx) => {
                        const originalProjIdx = projects.indexOf(proj);
                        const targetProjIdx = originalProjIdx >= 0 ? originalProjIdx : idx;
                        return renderProjectEntry(proj, targetProjIdx);
                      })}
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

              {page2Skills.length > 0 && (
                <div className="col-span-5 space-y-4">
                  <section className="space-y-2">
                    <div className="flex items-center justify-between pb-1 border-b border-zinc-200">
                      <h2 className="text-[11.5px] font-bold uppercase tracking-wider text-zinc-800">
                        Tools & Technologies
                      </h2>
                      <CanvasSectionAddButton label="Skill" onClick={() => onAddSkill && onAddSkill()} />
                    </div>
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {page2Skills.map((skill, idx) => {
                        const originalSkillIdx = skills.indexOf(skill);
                        const targetSkillIdx = originalSkillIdx >= 0 ? originalSkillIdx : idx;
                        const skillName = typeof skill === 'string' ? skill : (skill as any).name || '';
                        return (
                          <span
                            key={idx}
                            className="group/skill inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-100 text-zinc-800 border border-zinc-200/80"
                          >
                            <EditableField
                              as="span"
                              fieldPath={`skills[${targetSkillIdx}].name`}
                              value={skillName}
                              placeholder="Skill"
                            />
                            <CanvasEntryDeleteButton variant="chip" onClick={() => onDeleteSkill?.(targetSkillIdx)} label="Remove skill" />
                          </span>
                        );
                      })}
                    </div>
                  </section>
                </div>
              )}
            </div>
          </div>

          <div className="pt-3 mt-auto border-t border-zinc-100 flex items-center justify-end text-[10px] text-zinc-400 select-none">
            <span>Page 2 of 2</span>
          </div>
        </div>
      )}
    </div>
  );
}
