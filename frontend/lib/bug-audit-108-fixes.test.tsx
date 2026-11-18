import { describe, expect, test } from 'bun:test';
import React from 'react';
import { renderToString } from 'react-dom/server';
import {
  AVAILABLE_TEMPLATES,
  CanvasEditProvider,
  getTemplateComponent,
} from '@/components/resumes/templates';
import {
  updateResumeContentByPath,
  insertBulletBelow,
  moveBulletAt,
  addCustomSectionEntry,
  deleteCustomSectionEntry,
} from '@/lib/resume-path-updater';
import { getSampleTemplateKey } from '@/data/sample-resumes';
import type { ResumeContent } from '@/lib/api-client';

const RICH_CONTENT: ResumeContent = {
  contact: {
    fullName: 'Alex Rivera',
    email: 'alex.rivera@example.com',
    phone: '+1 415 555 0199',
    location: 'San Francisco, CA',
    linkedinUrl: 'linkedin.com/in/alexrivera',
    githubUrl: 'github.com/alexrivera',
    websiteUrl: 'alexrivera.dev',
  },
  headline: 'Staff Distributed Systems Engineer',
  summary: 'Built fault-tolerant cloud platforms serving 50M+ daily active users.',
  experience: [
    {
      company: 'Acme Cloud',
      title: 'Staff Engineer',
      location: 'San Francisco, CA',
      startDate: 'Jan 2022',
      endDate: 'Present',
      current: true,
      bullets: [
        'Reduced p99 latency by 48% across global edge routing nodes.',
        'Mentored 12 engineers across 3 core platform teams.',
      ],
    },
  ],
  projects: [
    {
      name: 'HyperQueue',
      url: 'github.com/alexrivera/hyperqueue',
      description: 'Low-latency distributed job scheduler in Rust.',
      highlights: ['Handled 120k jobs/sec with zero message loss.'],
    },
  ],
  education: [
    {
      school: 'Stanford University',
      degree: 'M.S.',
      field: 'Computer Science',
      location: 'Stanford, CA',
      graduationDate: '2020',
    },
  ],
  skills: [
    { name: 'TypeScript', category: 'Languages' },
    { name: 'PostgreSQL', category: 'Databases' },
  ],
  certifications: [
    {
      name: 'AWS Solutions Architect Professional',
      issuer: 'Amazon Web Services',
      issueDate: '2025',
    },
  ],
  customSections: [
    {
      id: 'custom-awards-1',
      title: 'Honors & Awards',
      kind: 'awards',
      entries: [
        {
          id: 'award-1',
          heading: 'Best Systems Paper',
          subtitle: 'USENIX ATC',
          dateRange: '2024',
          locationOrLink: 'Santa Clara, CA',
          bullets: ['Recognized among top 1% of peer-reviewed submissions.'],
        },
      ],
    },
  ],
};

describe('108-Bug Audit Regression Suite (Waves 1–5)', () => {
  test('BUG-004: updateResumeContentByPath resolves string-ID customSections paths accurately', () => {
    const updated1 = updateResumeContentByPath(
      RICH_CONTENT,
      'customSections[custom-awards-1].entries[0].heading',
      'Distinguished Paper Award',
    );
    expect(updated1.customSections?.[0].entries[0].heading).toBe('Distinguished Paper Award');

    const updated2 = updateResumeContentByPath(
      updated1,
      'customSections[custom-awards-1].entries[0].bullets[0]',
      'Top 0.5% systems research submission.',
    );
    expect(updated2.customSections?.[0].entries[0].bullets[0]).toBe(
      'Top 0.5% systems research submission.',
    );

    const updated3 = updateResumeContentByPath(
      updated2,
      'customSections[custom-awards-1].title',
      'Publications & Honors',
    );
    expect(updated3.customSections?.[0].title).toBe('Publications & Honors');
  });

  test('BUG-044: editing experience endDate automatically syncs current boolean', () => {
    const past = updateResumeContentByPath(RICH_CONTENT, 'experience[0].endDate', 'Dec 2024');
    expect(past.experience[0].endDate).toBe('Dec 2024');
    expect(past.experience[0].current).toBe(false);

    const present = updateResumeContentByPath(past, 'experience[0].endDate', 'Present');
    expect(present.experience[0].current).toBe(true);
  });

  test('BUG-013 & BUG-015: insertBulletBelow with bulletIdx -1 inserts first bullet cleanly on empty list', () => {
    const emptyProj: ResumeContent = {
      ...RICH_CONTENT,
      projects: [{ name: 'Solo', description: 'Desc', highlights: [] }],
    };
    const next = insertBulletBelow(emptyProj, 'projects', undefined, -1, 0);
    expect(next.projects?.[0].highlights).toEqual(['']);
  });

  test('BUG-040: moveBulletAt reorders experience, project, and custom bullets cleanly', () => {
    const movedDown = moveBulletAt(RICH_CONTENT, 'experience', 'down', 0, 0);
    expect(movedDown.experience[0].bullets[0]).toContain('Mentored 12 engineers');
    expect(movedDown.experience[0].bullets[1]).toContain('Reduced p99 latency');

    const movedBackUp = moveBulletAt(movedDown, 'experience', 'up', 0, 1);
    expect(movedBackUp.experience[0].bullets[0]).toContain('Reduced p99 latency');
  });

  test('BUG-049: addCustomSectionEntry and deleteCustomSectionEntry mutate entries immutably', () => {
    const added = addCustomSectionEntry(RICH_CONTENT, 'custom-awards-1');
    expect(added.customSections?.[0].entries.length).toBe(2);

    const deleted = deleteCustomSectionEntry(added, 'custom-awards-1', 1);
    expect(deleted.customSections?.[0].entries.length).toBe(1);
  });

  test('BUG-041..075: ALL 10 templates render certifications, editable contacts/dates/URLs, honor fontFamily, and have zero dark-paper or typo leaks', () => {
    expect(AVAILABLE_TEMPLATES.length).toBe(10);

    for (const tpl of AVAILABLE_TEMPLATES) {
      const Template = getTemplateComponent(tpl.key);

      // 1. Editable Canvas Mode (with serif fontFamily)
      const editableHtml = renderToString(
        <CanvasEditProvider
          isEditable={true}
          onUpdateField={() => {}}
          onAddBulletBelow={() => {}}
          onDeleteBullet={() => {}}
          onMoveBullet={() => {}}
          onAddExperience={() => {}}
          onAddProject={() => {}}
          onAddEducation={() => {}}
          onAddSkill={() => {}}
          onAddCertification={() => {}}
          onDeleteExperience={() => {}}
          onDeleteProject={() => {}}
          onDeleteEducation={() => {}}
          onDeleteSkill={() => {}}
          onDeleteCertification={() => {}}
          onAddCustomEntry={() => {}}
          onDeleteCustomEntry={() => {}}
          onMoveSection={() => {}}
        >
          <Template
            content={RICH_CONTENT}
            accentColor="#7c3aed"
            fontFamily="serif"
            showPhoto={true}
            photoUrl="https://example.com/photo.jpg"
          />
        </CanvasEditProvider>,
      );

      // Certifications rendered everywhere
      expect(editableHtml).toContain('AWS Solutions Architect Professional');
      expect(editableHtml).toContain('data-resume-section="certifications"');

      // Font family honored everywhere
      expect(editableHtml).toContain('font-serif');

      // Contact fields + Experience dates + Project URL editable everywhere
      expect(editableHtml).toContain('data-field-path="contact.email"');
      expect(editableHtml).toContain('data-field-path="contact.phone"');
      expect(editableHtml).toContain('data-field-path="contact.websiteUrl"');
      expect(editableHtml).toContain('data-field-path="experience[0].startDate"');
      expect(editableHtml).toContain('data-field-path="experience[0].endDate"');
      expect(editableHtml).toContain('data-field-path="projects[0].url"');
      expect(editableHtml).toContain('data-add-bullet-btn="true"');

      // Zero dark-mode white-paper leaks and zero typo watermarks
      expect(editableHtml).not.toContain('dark:bg-zinc-800');
      expect(editableHtml).not.toContain('hype-resume.com');

      // 2. Export / Print Mode (isEditable=false) -> ZERO edit chrome leaks!
      const exportHtml = renderToString(
        <CanvasEditProvider isEditable={false}>
          <Template
            content={RICH_CONTENT}
            accentColor="#7c3aed"
            fontFamily="mono"
            showPhoto={true}
            photoUrl="https://example.com/photo.jpg"
          />
        </CanvasEditProvider>,
      );

      expect(exportHtml).toContain('font-mono');
      expect(exportHtml).toContain('AWS Solutions Architect Professional');
      expect(exportHtml).not.toContain('contenteditable="true"');
      expect(exportHtml).not.toContain('data-export-exclude="true"');
      expect(exportHtml).not.toContain('data-add-bullet-btn="true"');
    }
  });

  test('BUG-102: getSampleTemplateKey covers all 10 templates including awesome-cv, deedy, crest, and elegant', () => {
    expect(getSampleTemplateKey({ companyKey: 'google' })).toBe('awesome-cv');
    expect(getSampleTemplateKey({ companyKey: 'amazon' })).toBe('deedy');
    expect(getSampleTemplateKey({ companyKey: 'shopify' })).toBe('crest');
    expect(getSampleTemplateKey({ companyKey: 'stripe' })).toBe('elegant');
    expect(getSampleTemplateKey({ companyKey: 'spotify' })).toBe('double-column');
    expect(getSampleTemplateKey({ companyKey: 'goldman' })).toBe('ivy-league');
    expect(getSampleTemplateKey({ companyKey: 'netflix' })).toBe('clean-modern');
    expect(getSampleTemplateKey({ resumeStyle: 'Executive Clean' })).toBe('executive');
    expect(getSampleTemplateKey({ resumeStyle: 'Compact Single-Column' })).toBe('jake-ats');
    expect(getSampleTemplateKey({ resumeStyle: 'ATS Classic' })).toBe('classic-ats');
  });
});
