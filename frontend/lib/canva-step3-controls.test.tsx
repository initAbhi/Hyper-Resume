import { describe, expect, it } from 'bun:test';
import React from 'react';
import { renderToString } from 'react-dom/server';
import {
  AVAILABLE_TEMPLATES,
  CanvasEditProvider,
  EditableField,
  getTemplateComponent,
} from '../components/resumes/templates';
import { detectSectionKeyFromHeading } from './resume-layout';
import type { ResumeContent } from './api-client';

const SAMPLE_RESUME: ResumeContent = {
  contact: {
    fullName: 'Alex Vance',
    email: 'alex.vance@example.com',
    phone: '+1 555-0199',
    location: 'San Francisco, CA',
    linkedinUrl: 'https://linkedin.com/in/alexvance',
    githubUrl: 'https://github.com/alexvance',
  },
  headline: 'Staff Systems Architect',
  summary: 'Distributed systems architect specializing in low-latency engines.',
  experience: [
    {
      company: 'Acme Cloud',
      title: 'Staff Engineer',
      location: 'San Francisco, CA',
      startDate: '2022',
      endDate: 'Present',
      current: true,
      bullets: ['Scaled event processing to 500k msg/sec across 3 regions.'],
    },
  ],
  education: [
    {
      school: 'Stanford University',
      degree: 'M.S.',
      field: 'Computer Science',
      graduationDate: '2020',
      location: '',
    },
  ],
  projects: [
    {
      name: 'HyperSync Engine',
      description: 'Real-time CRDT document engine.',
      highlights: ['Reduced sync latency by 65%.'],
    },
  ],
  skills: [
    { name: 'TypeScript', category: 'Languages' },
    { name: 'PostgreSQL', category: 'Databases' },
  ],
  customSections: [
    {
      id: 'awards-1',
      kind: 'awards',
      title: 'Awards',
      entries: [
        {
          id: 'e1',
          heading: 'Best Systems Paper',
          bullets: ['Recognized for zero-downtime migration design.'],
        },
      ],
    },
  ],
};

describe('Step 3: Direct Canvas Controls, Reordering, Deletion & Zero-Leak Export', () => {
  it('never leaks placeholder text when isEditable=false and value is empty', () => {
    const html = renderToString(
      <CanvasEditProvider isEditable={false}>
        <EditableField
          fieldPath="education[0].location"
          value=""
          placeholder="Location"
        />
      </CanvasEditProvider>,
    );

    expect(html).toBe('');
    expect(html).not.toContain('Location');
  });

  it('uses CSS data-placeholder instead of injecting literal text when isEditable=true and value is empty', () => {
    const html = renderToString(
      <CanvasEditProvider isEditable={true}>
        <EditableField
          fieldPath="education[0].location"
          value=""
          placeholder="Location"
        />
      </CanvasEditProvider>,
    );

    expect(html).toContain('data-placeholder="Location"');
    expect(html).toContain('empty:before:content-[attr(data-placeholder)]');
    expect(html).not.toContain('>Location<');
  });

  it('detects Deedy "Overview" heading as summary section key', () => {
    expect(detectSectionKeyFromHeading('Overview')).toBe('summary');
    expect(detectSectionKeyFromHeading('Executive Profile')).toBe('summary');
    expect(detectSectionKeyFromHeading('Work Experience')).toBe('experience');
  });

  describe('All 10 ATS Templates support Step 3 delete & reorder controls cleanly', () => {
    for (const tpl of AVAILABLE_TEMPLATES) {
      it(`${tpl.name} (${tpl.key}) renders section move buttons and entry/skill delete buttons when editable`, () => {
        const TemplateComponent = getTemplateComponent(tpl.key);
        const noop = () => {};
        const html = renderToString(
          <CanvasEditProvider
            isEditable={true}
            onAddExperience={noop}
            onAddProject={noop}
            onAddEducation={noop}
            onAddSkill={noop}
            onDeleteExperience={noop}
            onDeleteProject={noop}
            onDeleteEducation={noop}
            onDeleteSkill={noop}
            onMoveSection={noop}
          >
            <TemplateComponent content={SAMPLE_RESUME} />
          </CanvasEditProvider>,
        );

        expect(html).toContain('data-section-move-up="experience"');
        expect(html).toContain('data-section-move-down="experience"');
        expect(html).toContain('data-section-move-up="summary"');
        expect(html).toContain('data-entry-delete="entry"');
        expect(html).toContain('data-entry-delete="skill"');
        expect(html).toContain('data-export-exclude="true"');
      });

      it(`${tpl.name} (${tpl.key}) strips all edit, move, and delete controls when isEditable=false (PDF/Print)`, () => {
        const TemplateComponent = getTemplateComponent(tpl.key);
        const noop = () => {};
        const html = renderToString(
          <CanvasEditProvider
            isEditable={false}
            onAddExperience={noop}
            onAddProject={noop}
            onAddEducation={noop}
            onAddSkill={noop}
            onDeleteExperience={noop}
            onDeleteProject={noop}
            onDeleteEducation={noop}
            onDeleteSkill={noop}
            onMoveSection={noop}
          >
            <TemplateComponent content={SAMPLE_RESUME} />
          </CanvasEditProvider>,
        );

        expect(html).not.toContain('data-section-move-up');
        expect(html).not.toContain('data-section-move-down');
        expect(html).not.toContain('data-entry-delete');
        expect(html).not.toContain('contentEditable');
        // Empty education[0].location must not leak "Location" placeholder into exported PDF
        expect(html).not.toContain('>Location<');
      });
    }
  });
});
