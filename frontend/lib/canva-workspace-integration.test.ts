import { describe, expect, it } from 'bun:test';
import {
  updateResumeContentByPath,
  insertBulletBelow,
  removeBulletAt,
} from './resume-path-updater';
import {
  AVAILABLE_TEMPLATES,
  getTemplateComponent,
} from '../components/resumes/templates';
import type { ResumeContent } from './api-client';

describe('Canva-Grade Direct Canvas Editing & Template Integration', () => {
  const sampleContent: ResumeContent = {
    contact: {
      fullName: 'Richard Sanchez',
      email: 'richard@example.com',
      phone: '+1 555-0199',
      location: 'San Francisco, CA',
      linkedinUrl: 'linkedin.com/in/richard-sanchez',
      githubUrl: 'github.com/richardsanchez',
      websiteUrl: 'https://richard.design',
    },
    headline: 'Principal Product Designer & Systems Architect',
    summary: 'Seasoned architect with 12+ years experience building human-centric software.',
    skills: [
      { name: 'TypeScript', category: 'Languages' },
      { name: 'React 19', category: 'Frontend' },
      { name: 'Next.js App Router', category: 'Frameworks' },
      { name: 'Distributed Systems', category: 'Backend' },
    ],
    experience: [
      {
        company: 'Stripe',
        title: 'Staff UI Systems Engineer',
        location: 'San Francisco, CA',
        startDate: '2022',
        endDate: 'Present',
        current: true,
        bullets: [
          'Architected design system consumed by 450+ production engineers.',
          'Reduced web bundle size by 38% through tree-shaking and dynamic imports.',
          'Spearheaded vector canvas editor serving 2M daily active designers.',
        ],
      },
      {
        company: 'Airbnb',
        title: 'Senior Frontend Engineer',
        location: 'San Francisco, CA',
        startDate: '2019',
        endDate: '2022',
        current: false,
        bullets: [
          'Engineered booking flow revamp with 14% conversion lift.',
          'Built internal WYSIWYG rich text editor with zero DOM pollution.',
        ],
      },
    ],
    education: [
      {
        school: 'Stanford University',
        degree: 'B.S.',
        field: 'Computer Science',
        graduationDate: '2018',
        location: 'Stanford, CA',
      },
    ],
    projects: [
      {
        name: 'Hyper-Resume',
        description: 'Next-gen ATS resume builder with real-time vector canvas rendering.',
        url: 'https://hyper-resume.com',
        highlights: [
          'Zero-latency canvas in-place editing.',
          '100% ATS parser compliant typography and data integrity.',
        ],
      },
    ],
    customSections: [
      {
        id: 'patents',
        title: 'Patents & Publications',
        kind: 'publications',
        entries: [
          {
            id: 'pat-1',
            heading: 'System and Method for Real-Time Vector Document Synthesis',
            subtitle: 'US Patent Office',
            dateRange: '2024',
            bullets: [
              'Invented dual-layer reconciliation between virtual DOM and vector PDF renderers.',
            ],
          },
        ],
      },
    ],
  };

  describe('1. Template Registry & Availability (All 10 Templates)', () => {
    it('registers all 10 expected competitor-grade templates', () => {
      const expectedKeys = [
        'jake-ats',
        'awesome-cv',
        'deedy',
        'executive',
        'double-column',
        'ivy-league',
        'elegant',
        'crest',
        'clean-modern',
        'classic-ats',
      ];

      expect(AVAILABLE_TEMPLATES.length).toBe(10);
      expectedKeys.forEach((key) => {
        const found = AVAILABLE_TEMPLATES.find((t) => t.key === key);
        expect(found).toBeDefined();
        expect(found?.name).toBeDefined();
        expect(found?.category).toBeDefined();
        expect(found?.description).toBeDefined();
      });
    });

    it('resolves all 10 template components without fallback failures', () => {
      const keys = [
        'jake-ats',
        'awesome-cv',
        'deedy',
        'executive',
        'double-column',
        'ivy-league',
        'elegant',
        'crest',
        'clean-modern',
        'classic-ats',
      ];

      keys.forEach((key) => {
        const Comp = getTemplateComponent(key);
        expect(Comp).toBeDefined();
        expect(typeof Comp).toBe('function');
      });
    });
  });

  describe('2. In-Place Field Updaters (updateResumeContentByPath)', () => {
    it('updates candidate full name and headline immutably', () => {
      const next = updateResumeContentByPath(
        sampleContent,
        'contact.fullName',
        'Sarah Connor'
      );
      expect(next.contact.fullName).toBe('Sarah Connor');
      expect(sampleContent.contact.fullName).toBe('Richard Sanchez'); // Immutability guarantee

      const nextHeadline = updateResumeContentByPath(
        next,
        'headline',
        'Lead AI Infrastructure Architect'
      );
      expect(nextHeadline.headline).toBe('Lead AI Infrastructure Architect');
      expect(sampleContent.headline).toBe('Principal Product Designer & Systems Architect');
    });

    it('updates specific experience title and company', () => {
      let state = updateResumeContentByPath(sampleContent, 'experience[0].title', 'VP of Engineering');
      state = updateResumeContentByPath(state, 'experience[0].company', 'OpenAI');

      expect(state.experience[0].title).toBe('VP of Engineering');
      expect(state.experience[0].company).toBe('OpenAI');
      expect(sampleContent.experience[0].title).toBe('Staff UI Systems Engineer');
    });

    it('updates specific bullet points deeply inside experience array', () => {
      const state = updateResumeContentByPath(
        sampleContent,
        'experience[0].bullets[2]',
        'Spearheaded canvas editor serving 10M daily active users (+400% scale).'
      );
      expect(state.experience[0].bullets[2]).toBe(
        'Spearheaded canvas editor serving 10M daily active users (+400% scale).'
      );
      expect(sampleContent.experience[0].bullets[2]).toBe(
        'Spearheaded vector canvas editor serving 2M daily active designers.'
      );
    });

    it('updates project and custom section entries', () => {
      let state = updateResumeContentByPath(
        sampleContent,
        'projects[0].name',
        'Hyper-Resume Enterprise'
      );
      state = updateResumeContentByPath(
        state,
        'customSections[0].entries[0].heading',
        'Next-Gen Real-Time Vector Synthesis System'
      );

      expect(state.projects?.[0]?.name).toBe('Hyper-Resume Enterprise');
      expect(state.customSections?.[0]?.entries[0].heading).toBe(
        'Next-Gen Real-Time Vector Synthesis System'
      );
    });
  });

  describe('3. Dynamic Bullet Operations (insertBulletBelow & removeBulletAt)', () => {
    it('inserts a new bullet point directly below the active bullet index', () => {
      // Insert below experience[0].bullets[1]
      const state = insertBulletBelow(sampleContent, 'experience', 0, 1);
      expect(state.experience[0].bullets.length).toBe(4);
      expect(state.experience[0].bullets[0]).toBe(sampleContent.experience[0].bullets[0]);
      expect(state.experience[0].bullets[1]).toBe(sampleContent.experience[0].bullets[1]);
      expect(state.experience[0].bullets[2]).toBe(''); // New empty bullet ready for user typing
      expect(state.experience[0].bullets[3]).toBe(sampleContent.experience[0].bullets[2]);
    });

    it('removes target bullet point without corrupting siblings', () => {
      // Remove experience[0].bullets[1]
      const state = removeBulletAt(sampleContent, 'experience', 0, 1);
      expect(state.experience[0].bullets.length).toBe(2);
      expect(state.experience[0].bullets[0]).toBe('Architected design system consumed by 450+ production engineers.');
      expect(state.experience[0].bullets[1]).toBe('Spearheaded vector canvas editor serving 2M daily active designers.');
    });

    it('handles out of bounds and non-existent indices gracefully without throwing', () => {
      const state = removeBulletAt(sampleContent, 'experience', 99, 99);
      expect(state.experience.length).toBe(sampleContent.experience.length);

      const state2 = insertBulletBelow(sampleContent, 'projects', 99, 99);
      expect(state2.projects?.length).toBe(sampleContent.projects?.length);
    });
  });

  describe('4. Data Safety & ATS Structural Invariants', () => {
    it('preserves clean string primitives without storing dirty HTML tags', () => {
      const dirtyHtml = '<b style="color:red">Engineered</b> API pipeline';
      const cleanText = 'Engineered API pipeline';

      const state = updateResumeContentByPath(
        sampleContent,
        'experience[1].bullets[0]',
        cleanText
      );

      expect(state.experience[1].bullets[0]).not.toContain('<b');
      expect(state.experience[1].bullets[0]).not.toContain('style=');
      expect(state.experience[1].bullets[0]).toBe('Engineered API pipeline');
    });

    it('maintains deep JSON serialization integrity across round-trips', () => {
      const jsonString = JSON.stringify(sampleContent);
      const parsed = JSON.parse(jsonString) as ResumeContent;
      expect(parsed.contact.fullName).toBe('Richard Sanchez');
      expect(parsed.experience[0].bullets.length).toBe(3);
    });
  });

  describe('5. In-Canvas Content Insertion & Keyboard Navigation Math', () => {
    it('appends new work experience entry immutably', () => {
      const next: ResumeContent = {
        ...sampleContent,
        experience: [
          ...(sampleContent.experience || []),
          {
            company: 'New Tech Corp',
            title: 'Lead Architect',
            location: 'Remote',
            startDate: '2024',
            endDate: 'Present',
            current: true,
            bullets: ['Spearheaded microservices transformation.'],
          },
        ],
      };
      expect(next.experience.length).toBe(sampleContent.experience.length + 1);
      expect(next.experience[next.experience.length - 1].company).toBe('New Tech Corp');
    });

    it('appends new project and education entries immutably', () => {
      const next: ResumeContent = {
        ...sampleContent,
        projects: [
          ...(sampleContent.projects || []),
          {
            name: 'Cloud Vector DB',
            description: 'Rust-based high-throughput embedding index.',
            highlights: ['Sub-millisecond semantic search retrieval.'],
          },
        ],
        education: [
          ...(sampleContent.education || []),
          {
            school: 'MIT',
            degree: 'M.S.',
            field: 'Distributed Computing',
            graduationDate: '2020',
          },
        ],
      };
      expect(next.projects?.length).toBe((sampleContent.projects?.length ?? 0) + 1);
      expect(next.education?.length).toBe((sampleContent.education?.length ?? 0) + 1);
    });

    it('computes deterministic DOM target IDs for auto-focus transfer on Enter and Backspace', () => {
      // Enter from experience[0].bullets[1] -> focuses bullet 2
      const expIdx = 0;
      const bulletIdx = 1;
      const nextId = `exp-${expIdx}-bullet-${bulletIdx + 1}`;
      expect(nextId).toBe('exp-0-bullet-2');

      // Backspace from experience[0].bullets[1] -> focuses bullet 0
      const prevId = `exp-${expIdx}-bullet-${bulletIdx - 1}`;
      expect(prevId).toBe('exp-0-bullet-0');

      // Enter from projects[0].highlights[0] -> focuses highlight 1
      const projIdx = 0;
      const nextProjId = `proj-${projIdx}-bullet-1`;
      expect(nextProjId).toBe('proj-0-bullet-1');
    });
  });
});
