import { describe, expect, it } from 'bun:test';
import React from 'react';
import { renderToString } from 'react-dom/server';
import {
  CanvasEditProvider,
  useCanvasEdit,
} from '../components/resumes/templates/CanvasEditContext';
import { EditableField } from '../components/resumes/templates/EditableField';
import {
  AVAILABLE_TEMPLATES,
  getTemplateComponent,
} from '../components/resumes/templates';
import type { ResumeContent } from './api-client';

const sampleContent: ResumeContent = {
  contact: {
    fullName: 'Alex Vance',
    email: 'alex@blackmesa.org',
    phone: '+1 555-4321',
    location: 'City 17, Earth',
    linkedinUrl: 'linkedin.com/in/alexvance',
    githubUrl: 'github.com/alexvance',
    websiteUrl: 'https://vance.tech',
  },
  headline: 'Principal Quantum Systems Architect',
  summary: 'Engineering robust distributed teleportation grids and high-frequency resonance cascades with 15+ years experience.',
  skills: [
    { name: 'Quantum Electrodynamics', category: 'Core Physics' },
    { name: 'TypeScript', category: 'Languages' },
    { name: 'Distributed Consensus', category: 'Architecture' },
  ],
  experience: [
    {
      company: 'Black Mesa Research',
      title: 'Senior Quantum Engineer',
      location: 'New Mexico',
      startDate: '2020',
      endDate: 'Present',
      current: true,
      bullets: [
        'Maintained 99.999% stability across high-energy sub-surface containment grids.',
        'Optimized telemetry throughput by 42% utilizing zero-copy vector serialization.',
      ],
    },
  ],
  education: [
    {
      school: 'MIT',
      degree: 'Ph.D.',
      field: 'Applied Physics & Computer Science',
      graduationDate: '2019',
      location: 'Cambridge, MA',
    },
  ],
  projects: [
    {
      name: 'Resonance Protocol',
      description: 'Zero-latency vector document and state synchronization engine.',
      url: 'https://resonance.io',
      highlights: [
        'Deterministic state reconciliation across 10,000 parallel workers.',
      ],
    },
  ],
  customSections: [
    {
      id: 'publications',
      title: 'Select Publications',
      kind: 'publications',
      entries: [
        {
          id: 'pub-1',
          heading: 'Quantum Synchronization in Real-Time User Interfaces',
          subtitle: 'IEEE Transactions',
          dateRange: '2023',
          bullets: [
            'Demonstrated sub-millisecond document sync using immutable state trees.',
          ],
        },
      ],
    },
  ],
};

describe('Canva Visual Canvas - Full Template Server-Side & Static Render Suite', () => {
  it('renders EditableField with contentEditable="true" when isEditable=true', () => {
    const html = renderToString(
      <CanvasEditProvider isEditable={true}>
        <EditableField
          fieldPath="contact.fullName"
          value="Alex Vance"
          placeholder="Full Name"
          className="name-heading"
        />
      </CanvasEditProvider>
    );

    expect(html).toContain('contentEditable="true"');
    expect(html).toContain('data-field-path="contact.fullName"');
    expect(html).toContain('Alex Vance');
  });

  it('renders EditableField as non-editable when isEditable=false (Print / Forms Mode)', () => {
    const html = renderToString(
      <CanvasEditProvider isEditable={false}>
        <EditableField
          fieldPath="contact.fullName"
          value="Alex Vance"
          placeholder="Full Name"
          className="name-heading"
        />
      </CanvasEditProvider>
    );

    // In read-only mode, contentEditable is completely absent for pure static print/ATS purity
    expect(html).not.toContain('contentEditable');
    expect(html).toContain('Alex Vance');
  });

  describe('Testing All 10 Templates under Visual Canvas Mode', () => {
    AVAILABLE_TEMPLATES.forEach((tpl) => {
      it(`renders template "${tpl.name}" (${tpl.key}) seamlessly in visual edit mode`, () => {
        const TemplateComponent = getTemplateComponent(tpl.key);
        expect(TemplateComponent).toBeDefined();

        const rendered = renderToString(
          <CanvasEditProvider isEditable={true}>
            <TemplateComponent
              content={sampleContent}
              accentColor="#2563eb"
              fontFamily="sans"
            />
          </CanvasEditProvider>
        );

        // Core invariants across every template:
        expect(rendered.length).toBeGreaterThan(200);
        expect(rendered).toContain('Alex Vance');
        expect(rendered).toContain('Principal Quantum Systems Architect');
        expect(rendered).toContain('Black Mesa Research');
        expect(rendered).toContain('contentEditable="true"');
        expect(rendered).toContain('data-field-path="contact.fullName"');
        expect(rendered).toContain('data-field-path="experience[0].bullets[0]"');
      });

      it(`renders template "${tpl.name}" (${tpl.key}) in read-only / export mode without editable handlers`, () => {
        const TemplateComponent = getTemplateComponent(tpl.key);
        const rendered = renderToString(
          <CanvasEditProvider isEditable={false}>
            <TemplateComponent
              content={sampleContent}
              accentColor="#000000"
              fontFamily="serif"
            />
          </CanvasEditProvider>
        );

        expect(rendered).toContain('Alex Vance');
        expect(rendered).not.toContain('contentEditable');
      });

      it(`handles empty/sparse resume content in "${tpl.name}" without crashing`, () => {
        const emptyContent: ResumeContent = {
          contact: {
            fullName: '',
            email: '',
            phone: '',
            location: '',
          },
          headline: '',
          summary: '',
          skills: [],
          experience: [],
          education: [],
          projects: [],
        };

        const TemplateComponent = getTemplateComponent(tpl.key);
        const rendered = renderToString(
          <CanvasEditProvider isEditable={true}>
            <TemplateComponent
              content={emptyContent}
              accentColor="#0f172a"
              fontFamily="mono"
            />
          </CanvasEditProvider>
        );

        expect(rendered.length).toBeGreaterThan(50);
      });
    });
  });
});
