'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Briefcase,
  FolderGit2,
  GraduationCap,
  Code2,
  Award,
  Sparkles,
  Plus,
  Check,
  BookOpen,
  HeartHandshake,
  Trophy,
  Mic2,
  FileCheck2,
} from 'lucide-react';
import type { ResumeContent, CustomSectionKind } from '@/lib/api-client';

export interface AddContentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  docked?: boolean;
  content: ResumeContent;
  onUpdateContent: (updater: (prev: ResumeContent) => ResumeContent) => void;
  onScrollToSection?: (sectionId: string) => void;
}

export function AddContentDrawer({
  isOpen,
  onClose,
  docked = false,
  content,
  onUpdateContent,
  onScrollToSection,
}: AddContentDrawerProps) {
  const [recentlyAdded, setRecentlyAdded] = useState<string | null>(null);
  const [skillInput, setSkillInput] = useState('');
  const [skillNotice, setSkillNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const markAdded = (id: string, targetSelector?: string) => {
    setRecentlyAdded(id);
    setTimeout(() => setRecentlyAdded(null), 1800);
    if (targetSelector) {
      setTimeout(() => {
        const fieldEl = document.querySelector<HTMLElement>(`[data-field-path="${targetSelector}"]`);
        if (fieldEl) {
          fieldEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          fieldEl.focus();
          return;
        }
        onScrollToSection?.(targetSelector);
      }, 90);
    }
  };

  const handleAddExperience = () => {
    const newIdx = (content.experience || []).length;
    onUpdateContent((prev) => ({
      ...prev,
      experience: [
        ...(prev.experience || []),
        {
          company: 'Company / Organization',
          title: 'Role / Job Title',
          location: 'City, Country',
          startDate: '2023',
          endDate: 'Present',
          current: true,
          bullets: [
            'Led technical architecture and scaled services, delivering measurable 30% performance gains.',
            'Collaborated with cross-functional product teams to ship mission-critical features on schedule.',
          ],
        },
      ],
    }));
    markAdded('experience', `experience[${newIdx}].title`);
  };

  const handleAddProject = () => {
    const newIdx = (content.projects || []).length;
    onUpdateContent((prev) => ({
      ...prev,
      projects: [
        ...(prev.projects || []),
        {
          name: 'Project Name',
          description: 'High-performance cloud-native application built with modern architecture.',
          highlights: [
            'Architected distributed microservices handling concurrent real-time transactions.',
          ],
        },
      ],
    }));
    markAdded('projects', `projects[${newIdx}].name`);
  };

  const handleAddEducation = () => {
    const newIdx = (content.education || []).length;
    onUpdateContent((prev) => ({
      ...prev,
      education: [
        ...(prev.education || []),
        {
          school: 'University / Institution',
          degree: 'Bachelor of Science',
          field: 'Computer Science',
          graduationDate: '2024',
        },
      ],
    }));
    markAdded('education', `education[${newIdx}].school`);
  };

  const handleAddSkill = (skillName?: string) => {
    const name = (skillName || skillInput).trim();
    if (!name) return;
    const exists = (content.skills || []).some(
      (s) => (typeof s === 'string' ? s : s.name || '').trim().toLowerCase() === name.toLowerCase(),
    );
    if (exists) {
      setSkillNotice(`"${name}" is already in your skills list.`);
      setTimeout(() => setSkillNotice(null), 2200);
      return;
    }
    setSkillNotice(null);
    onUpdateContent((prev) => ({
      ...prev,
      skills: [...(prev.skills || []), { name }],
    }));
    setSkillInput('');
    markAdded('skills', 'resume-document-print');
  };

  const handleAddCertification = () => {
    const newIdx = (content.certifications || []).length;
    onUpdateContent((prev) => ({
      ...prev,
      certifications: [
        ...(prev.certifications || []),
        {
          name: 'AWS Certified Solutions Architect',
          issuer: 'Amazon Web Services',
          issueDate: '2024',
        },
      ],
    }));
    markAdded('certifications', `certifications[${newIdx}].name`);
  };

  const handleAddCustomSection = (kind: CustomSectionKind, title: string, sampleBullet: string) => {
    const customId = `custom-${Date.now()}`;
    onUpdateContent((prev) => ({
      ...prev,
      customSections: [
        ...(prev.customSections || []),
        {
          id: customId,
          title,
          kind,
          entries: [
            {
              id: `${customId}-1`,
              heading: `Initial ${title} Entry`,
              subtitle: 'Organization / Publisher',
              dateRange: '2024',
              locationOrLink: '',
              bullets: [sampleBullet],
            },
          ],
        },
      ],
    }));
    markAdded(`custom-${kind}`, `customSections[${customId}].entries[0].heading`);
  };

  const customPresets: Array<{
    kind: CustomSectionKind;
    title: string;
    icon: React.ComponentType<{ className?: string }>;
    bullet: string;
  }> = [
    {
      kind: 'publications',
      title: 'Publications & Research',
      icon: BookOpen,
      bullet: 'Authored peer-reviewed paper on scalable distributed systems.',
    },
    {
      kind: 'volunteer',
      title: 'Volunteer Experience',
      icon: HeartHandshake,
      bullet: 'Mentored 20+ aspiring engineers in algorithms and system design.',
    },
    {
      kind: 'awards',
      title: 'Honors & Awards',
      icon: Trophy,
      bullet: '1st Place Hackathon Winner among 150+ international engineering teams.',
    },
    {
      kind: 'languages',
      title: 'Language Proficiencies',
      icon: Mic2,
      bullet: 'Fluent in English (Professional), German (Bilingual).',
    },
  ];

  const panelBody = (
      <div
        id="canva-add-content-drawer"
        role={docked ? 'region' : 'dialog'}
        aria-label="Add Content and Sections"
        className={
          docked
            ? 'w-full h-full bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/90 dark:border-zinc-800 shadow-sm flex flex-col overflow-hidden'
            : 'relative w-full max-w-md bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl h-full flex flex-col overflow-hidden animate-in slide-in-from-right duration-200 pointer-events-auto z-10'
        }
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold shrink-0">
              <Plus className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h2 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 truncate">
                Add Section &amp; Content
              </h2>
              <p className="text-[11px] text-zinc-500 truncate">
                Inserts directly onto your live canvas
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer shrink-0"
            aria-label="Close add content drawer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Items List */}
        <div className="p-4 sm:p-5 space-y-4 flex-1 overflow-y-auto overscroll-contain">
          {/* Core Sections */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
              Core Career Elements
            </h3>

            {/* 1. Work Experience */}
            <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 flex items-center justify-between gap-3 hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 flex items-center justify-center shrink-0">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-xs text-zinc-900 dark:text-zinc-100">
                    Work Experience
                  </p>
                  <p className="text-[10.5px] text-zinc-500 truncate">
                    {(content.experience || []).length} current roles listed
                  </p>
                </div>
              </div>
              <button
                type="button"
                id="btn-add-experience-entry"
                onClick={handleAddExperience}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  recentlyAdded === 'experience'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-blue-600 hover:bg-blue-500 text-white shadow-xs'
                }`}
              >
                {recentlyAdded === 'experience' ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Added</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Role</span>
                  </>
                )}
              </button>
            </div>

            {/* 2. Key Projects */}
            <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 flex items-center justify-between gap-3 hover:border-purple-300 dark:hover:border-purple-700 transition-colors">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 flex items-center justify-center shrink-0">
                  <FolderGit2 className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-xs text-zinc-900 dark:text-zinc-100">
                    Key Projects
                  </p>
                  <p className="text-[10.5px] text-zinc-500 truncate">
                    {(content.projects || []).length} projects listed
                  </p>
                </div>
              </div>
              <button
                type="button"
                id="btn-add-project-entry"
                onClick={handleAddProject}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  recentlyAdded === 'projects'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-purple-600 hover:bg-purple-500 text-white shadow-xs'
                }`}
              >
                {recentlyAdded === 'projects' ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Added</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Project</span>
                  </>
                )}
              </button>
            </div>

            {/* 3. Education */}
            <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 flex items-center justify-between gap-3 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-xs text-zinc-900 dark:text-zinc-100">
                    Education Degree
                  </p>
                  <p className="text-[10.5px] text-zinc-500 truncate">
                    {(content.education || []).length} degrees listed
                  </p>
                </div>
              </div>
              <button
                type="button"
                id="btn-add-education-entry"
                onClick={handleAddEducation}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  recentlyAdded === 'education'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs'
                }`}
              >
                {recentlyAdded === 'education' ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Added</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Degree</span>
                  </>
                )}
              </button>
            </div>

            {/* 4. Certifications */}
            <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 flex items-center justify-between gap-3 hover:border-amber-300 dark:hover:border-amber-700 transition-colors">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
                  <Award className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-xs text-zinc-900 dark:text-zinc-100">
                    Certifications &amp; Licenses
                  </p>
                  <p className="text-[10.5px] text-zinc-500 truncate">
                    {(content.certifications || []).length} credentials
                  </p>
                </div>
              </div>
              <button
                type="button"
                id="btn-add-certification-entry"
                onClick={handleAddCertification}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  recentlyAdded === 'certifications'
                    ? 'bg-emerald-700 text-white'
                    : 'bg-amber-700 hover:bg-amber-800 text-white shadow-xs'
                }`}
              >
                {recentlyAdded === 'certifications' ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Added</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Cert</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Skill Inserter */}
          <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <h3 className="text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5 text-blue-500" />
              <span>Quick Add Technical Skill</span>
            </h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
                placeholder="e.g. TypeScript, Docker, Kubernetes, GraphQL..."
                className="flex-1 text-xs px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-blue-500"
              />
              <button
                type="button"
                onClick={() => handleAddSkill()}
                disabled={!skillInput.trim()}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shrink-0"
              >
                + Add
              </button>
            </div>
            {skillNotice && (
              <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                {skillNotice}
              </p>
            )}
            {/* Quick Suggestions Chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {['GraphQL', 'Redis', 'Terraform', 'Next.js', 'System Architecture'].map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => handleAddSkill(chip)}
                  className="text-[10.5px] px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-blue-50 dark:hover:bg-blue-950 hover:text-blue-600 transition-colors cursor-pointer border border-zinc-200/60 dark:border-zinc-700/60"
                >
                  +{chip}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Sections Presets */}
          <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <h3 className="text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-500" />
              <span>Specialized Custom Sections</span>
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {customPresets.map((preset) => {
                const Icon = preset.icon;
                const isAdded = recentlyAdded === `custom-${preset.kind}`;
                return (
                  <button
                    key={preset.kind}
                    type="button"
                    onClick={() => handleAddCustomSection(preset.kind, preset.title, preset.bullet)}
                    className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-purple-400 dark:hover:border-purple-600 bg-white dark:bg-zinc-800/40 text-left transition-all group cursor-pointer shadow-2xs hover:shadow-xs"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <Icon className="w-4 h-4 text-zinc-500 group-hover:text-purple-600 transition-colors" />
                      {isAdded ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Plus className="w-3.5 h-3.5 text-zinc-400 group-hover:text-purple-600" />
                      )}
                    </div>
                    <p className="font-semibold text-[11px] text-zinc-800 dark:text-zinc-200 leading-tight">
                      {preset.title}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-950/60 text-[11px] flex items-center justify-between shrink-0">
          <span className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Instant live canvas sync
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-2.5 py-1 rounded-md font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/70 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            Collapse
          </button>
        </div>
      </div>
  );

  if (docked) {
    return panelBody;
  }

  return (
    <div
      data-export-exclude="true"
      className="fixed inset-0 z-50 flex justify-end pointer-events-none print:hidden"
    >
      <div
        className="fixed inset-0 bg-black/20 lg:hidden pointer-events-auto transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      {panelBody}
    </div>
  );
}
