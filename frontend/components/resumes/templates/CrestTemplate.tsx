'use client';

import React from 'react';
import {
  MapPin,
  Mail,
  Phone,
  Globe,
  Calendar,
  Briefcase,
  GraduationCap,
  Sparkles,
  FolderGit2,
} from 'lucide-react';
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

export function CrestTemplate({
  content,
  accentColor = '#0d9488',
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
      className={`resume-page-a4 p-0! resume-paper-canvas bg-white text-zinc-950 rounded-sm shadow-md border border-zinc-200/80 w-full max-w-[820px] mx-auto text-left break-words [overflow-wrap:anywhere] ${getTemplateFontClass(fontFamily)} ${className}`}
      style={{ boxSizing: 'border-box' }}
    >
      {/* Bold Full-Width Top Accent Banner */}
      <div
        className="p-6 sm:p-8 text-white relative overflow-hidden rounded-t-sm"
        style={{
          backgroundColor: accentColor,
          WebkitPrintColorAdjust: 'exact',
          printColorAdjust: 'exact',
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 min-w-0">
          <div className="space-y-1 min-w-0 flex-1">
            <EditableField
              as="h1"
              fieldPath="contact.fullName"
              value={contact.fullName}
              placeholder="Candidate Name"
              darkSurface={true}
              className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-white block break-words"
            />
            {(isEditable || headline) && (
              <EditableField
                as="p"
                fieldPath="headline"
                value={headline || ''}
                placeholder="Professional Headline"
                darkSurface={true}
                className="text-xs sm:text-sm font-medium text-white/90 block break-words"
              />
            )}
          </div>

          {showPhoto && photoUrl && (
            <img
              src={photoUrl}
              alt={contact.fullName || 'Candidate'}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-white/40 shadow shrink-0"
            />
          )}
        </div>
      </div>

      {/* Sub-bar Ribbon for Contact Info */}
      <div className="bg-zinc-50 border-b border-zinc-200 px-6 sm:px-8 py-2.5 text-[10.5px] text-zinc-700 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 min-w-0 max-w-full">
        {(isEditable || contact.email) && (
          <span className="inline-flex items-center gap-1.5 min-w-0 max-w-full">
            <Mail className="w-3 h-3 text-zinc-500 shrink-0" />
            <EditableContactLink fieldPath="contact.email" value={contact.email} placeholder="email@example.com" className="break-all" />
          </span>
        )}
        {(isEditable || contact.phone) && (
          <span className="inline-flex items-center gap-1.5 min-w-0 max-w-full">
            <Phone className="w-3 h-3 text-zinc-500 shrink-0" />
            <EditableContactLink fieldPath="contact.phone" value={contact.phone} placeholder="Phone" className="break-words" />
          </span>
        )}
        {(isEditable || contact.location) && (
          <span className="inline-flex items-center gap-1.5 min-w-0 max-w-full">
            <MapPin className="w-3 h-3 text-zinc-500 shrink-0" />
            <EditableContactLink fieldPath="contact.location" value={contact.location} placeholder="City, State" className="break-words" />
          </span>
        )}
        {(isEditable || contact.linkedinUrl) && (
          <span className="inline-flex items-center gap-1.5 min-w-0 max-w-full">
            <LinkedinIcon className="w-3 h-3 text-zinc-500 shrink-0" />
            <EditableContactLink fieldPath="contact.linkedinUrl" value={contact.linkedinUrl} placeholder="linkedin.com/in/you" isUrl={true} className="break-all" />
          </span>
        )}
        {(isEditable || contact.githubUrl) && (
          <span className="inline-flex items-center gap-1.5 min-w-0 max-w-full">
            <GithubIcon className="w-3 h-3 text-zinc-500 shrink-0" />
            <EditableContactLink fieldPath="contact.githubUrl" value={contact.githubUrl} placeholder="github.com/you" isUrl={true} className="break-all" />
          </span>
        )}
        {(isEditable || contact.websiteUrl) && (
          <span className="inline-flex items-center gap-1.5 min-w-0 max-w-full">
            <Globe className="w-3 h-3 text-zinc-500 shrink-0" />
            <EditableContactLink fieldPath="contact.websiteUrl" value={contact.websiteUrl} placeholder="portfolio.dev" isUrl={true} className="break-all" />
          </span>
        )}
      </div>

      {/* Main Body */}
      <div className="p-6 sm:p-8 space-y-5">
        {(isEditable || summary) && (
          <section data-resume-section="summary" className="space-y-1.5">
            <div className="flex items-center justify-between pb-1 border-b border-zinc-200">
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5" style={{ color: accentColor }} />
                <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                  Professional Profile
                </h2>
              </div>
              <CanvasSectionMoveButtons sectionKey="summary" label="Profile" />
            </div>
            <EditableField
              as="p"
              id="summary-textarea"
              fieldPath="summary"
              value={summary || ''}
              placeholder="Professional Profile..."
              className="text-[10.5px] text-zinc-700 leading-relaxed pt-0.5 block"
              highlightKeywords={highlightKeywords}
              showHighlights={showHighlights}
            />
          </section>
        )}

        {/* 2-Column Split */}
        <div className="grid grid-cols-1 md:grid-cols-12 print:grid-cols-12 gap-6 pt-1 min-w-0">
          <div className="md:col-span-8 print:col-span-8 space-y-4 min-w-0">
            {experience.length > 0 && (
              <section data-resume-section="experience" className="space-y-3">
                <div className="flex items-center justify-between pb-1 border-b border-zinc-200">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-3.5 h-3.5" style={{ color: accentColor }} />
                    <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                      Work Experience
                    </h2>
                  </div>
                  <div className="flex items-center gap-1">
                    <CanvasSectionMoveButtons sectionKey="experience" label="Experience" />
                    <CanvasSectionAddButton label="Role" onClick={onAddExperience} />
                  </div>
                </div>

                <div className="space-y-4">
                  {experience.map((exp, idx) => (
                    <div key={exp.id || idx} className="group/entry relative space-y-1">
                      <CanvasEntryDeleteButton onClick={() => onDeleteExperience?.(idx)} label="Delete role" />
                      <div className="flex justify-between items-baseline gap-2">
                        <EditableField
                          as="span"
                          fieldPath={`experience[${idx}].title`}
                          value={exp.title}
                          placeholder="Title"
                          className="font-bold text-xs text-zinc-950"
                        />
                        <span className="inline-flex items-center gap-1 text-[10px] text-zinc-500 font-medium shrink-0">
                          <Calendar className="w-2.5 h-2.5 text-zinc-400" />
                          <EditableDateRange
                            startDate={exp.startDate}
                            endDate={exp.endDate}
                            current={exp.current}
                            startFieldPath={`experience[${idx}].startDate`}
                            endFieldPath={`experience[${idx}].endDate`}
                            className="text-[10px] text-zinc-500"
                          />
                        </span>
                      </div>
                      <div className="text-[11px] font-semibold flex flex-wrap items-center gap-1" style={{ color: accentColor }}>
                        <EditableField
                          as="span"
                          fieldPath={`experience[${idx}].company`}
                          value={exp.company}
                          placeholder="Company"
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
                        className="list-disc pl-3.5 space-y-1 text-[10.5px] text-zinc-700 leading-relaxed pt-0.5"
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {projects.length > 0 && (
              <section data-resume-section="projects" className="space-y-2.5 pt-2">
                <div className="flex items-center justify-between pb-1 border-b border-zinc-200">
                  <div className="flex items-center gap-2">
                    <FolderGit2 className="w-3.5 h-3.5" style={{ color: accentColor }} />
                    <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                      Selected Projects
                    </h2>
                  </div>
                  <div className="flex items-center gap-1">
                    <CanvasSectionMoveButtons sectionKey="projects" label="Projects" />
                    <CanvasSectionAddButton label="Project" onClick={onAddProject} />
                  </div>
                </div>
                <div className="space-y-2.5">
                  {projects.map((proj, idx) => (
                    <div key={proj.id || idx} className="group/entry relative space-y-0.5 text-[10.5px]">
                      <CanvasEntryDeleteButton onClick={() => onDeleteProject?.(idx)} label="Delete project" />
                      <div className="font-bold text-zinc-950 flex flex-wrap items-center justify-between gap-2 min-w-0">
                        <EditableField
                          as="span"
                          fieldPath={`projects[${idx}].name`}
                          value={proj.name}
                          placeholder="Project Name"
                          className="min-w-0 break-words"
                        />
                        {(isEditable || proj.url) && (
                          <EditableContactLink
                            fieldPath={`projects[${idx}].url`}
                            value={proj.url}
                            placeholder="project-url.com"
                            isUrl={true}
                            className="text-[10px] text-blue-600 font-normal break-all max-w-full"
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

            <CertificationsBlock content={content} accentColor={accentColor} />

            <CustomSectionsBlock
              content={content}
              accentColor={accentColor}
              highlightKeywords={highlightKeywords}
              showHighlights={showHighlights}
            />
          </div>

          <div className="md:col-span-4 print:col-span-4 space-y-5 border-l border-zinc-100 pl-0 md:pl-2 print:pl-2 min-w-0">
            {skills.length > 0 && (
              <section data-resume-section="skills" className="space-y-2 min-w-0">
                <div className="flex items-center justify-between pb-1 border-b border-zinc-200">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5" style={{ color: accentColor }} />
                    <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                      Core Skills
                    </h2>
                  </div>
                  <div className="flex items-center gap-1">
                    <CanvasSectionMoveButtons sectionKey="skills" label="Skills" />
                    <CanvasSectionAddButton label="Skill" onClick={() => onAddSkill && onAddSkill()} />
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-0.5 min-w-0 max-w-full">
                  {skills.map((s, idx) => {
                    const skillName = typeof s === 'string' ? s : s.name;
                    return (
                      <span
                        key={idx}
                        className="group/skill inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] rounded font-medium border max-w-full min-w-0 break-words [overflow-wrap:anywhere]"
                        style={{
                          backgroundColor: `${accentColor}10`,
                          borderColor: `${accentColor}30`,
                          color: accentColor,
                        }}
                      >
                        <EditableField
                          as="span"
                          fieldPath={`skills[${idx}].name`}
                          value={skillName}
                          placeholder="Skill"
                          className="min-w-0 break-words [overflow-wrap:anywhere]"
                        />
                        <CanvasEntryDeleteButton variant="chip" onClick={() => onDeleteSkill?.(idx)} label="Remove skill" />
                      </span>
                    );
                  })}
                </div>
              </section>
            )}

            {education.length > 0 && (
              <section data-resume-section="education" className="space-y-2.5">
                <div className="flex items-center justify-between pb-1 border-b border-zinc-200">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-3.5 h-3.5" style={{ color: accentColor }} />
                    <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                      Education
                    </h2>
                  </div>
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
                        <div className="font-bold text-zinc-950 text-[11px] leading-snug">
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
                            className="text-zinc-700 font-medium"
                          />
                        )}
                        {(isEditable || dateDisplay || edu.location) && (
                          <div className="text-[10px] text-zinc-500 flex flex-wrap items-center gap-1">
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
          </div>
        </div>
      </div>
    </div>
  );
}
