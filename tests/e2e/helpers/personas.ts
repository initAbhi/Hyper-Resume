export interface PersonaDefinition {
  key: string;
  label: string;
  name: string;
  targetRole: string;
  templateKey: string;
  objective: string;
  content: Record<string, any>;
}

export const ALL_TEMPLATE_KEYS = [
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
] as const;

export const TEN_PERSONAS: PersonaDefinition[] = [
  // 01 — Minimal Fresher Resume
  {
    key: 'persona-01-fresher',
    label: 'Resume 01 — Minimal Fresher',
    name: 'P01 Minimal Fresher Resume',
    targetRole: 'Junior Software Developer',
    templateKey: 'jake-ats',
    objective: 'Empty states, default behavior, spacing, one-page rendering',
    content: {
      contact: {
        fullName: 'Aarav Patel',
        email: 'aarav.patel.qa@example.com',
        phone: '+1 555-010-1001',
        location: 'Austin, TX',
      },
      headline: 'Computer Science Graduate & Junior Developer',
      summary: 'Recent Computer Science graduate eager to build reliable web applications.',
      skills: [
        { name: 'JavaScript', category: 'Languages' },
        { name: 'HTML/CSS', category: 'Web' },
        { name: 'Git', category: 'Tools' },
      ],
      experience: [],
      education: [
        {
          school: 'University of Texas at Austin',
          degree: 'B.S.',
          field: 'Computer Science',
          graduationDate: '2026',
          gpa: '3.8',
        },
      ],
      projects: [
        {
          name: 'Campus Study Matcher',
          description: 'Web app connecting study groups by course schedule.',
          highlights: ['Built responsive search UI and PostgreSQL backend for 120 student beta users.'],
        },
      ],
      certifications: [],
      customSections: [],
    },
  },

  // 02 — Senior Software Engineer
  {
    key: 'persona-02-senior-swe',
    label: 'Resume 02 — Senior Software Engineer',
    name: 'P02 Senior Software Engineer',
    targetRole: 'Staff Software Engineer',
    templateKey: 'awesome-cv',
    objective: 'Long-content rendering, overflow, multi-page pagination, dense layouts',
    content: {
      contact: {
        fullName: 'Marcus Vance',
        email: 'marcus.vance.qa@example.com',
        phone: '+1 (415) 555-0142',
        location: 'San Francisco, CA',
        linkedinUrl: 'https://linkedin.com/in/marcus-vance-qa',
        githubUrl: 'https://github.com/marcus-vance-qa',
      },
      headline: 'Staff Software Engineer — Distributed Cloud & Platform Architecture',
      summary:
        'Staff Software Engineer with 11+ years designing fault-tolerant distributed systems, multi-region Kubernetes platforms, and high-throughput financial event pipelines processing over 250M daily transactions.',
      skills: [
        { name: 'Go', category: 'Languages' },
        { name: 'TypeScript', category: 'Languages' },
        { name: 'Rust', category: 'Languages' },
        { name: 'Kubernetes', category: 'Infrastructure' },
        { name: 'PostgreSQL', category: 'Databases' },
        { name: 'Kafka', category: 'Messaging' },
        { name: 'Terraform', category: 'Infrastructure' },
        { name: 'gRPC', category: 'APIs' },
        { name: 'AWS', category: 'Cloud' },
        { name: 'OpenTelemetry', category: 'Observability' },
      ],
      experience: [
        {
          company: 'Stratos Financial Infrastructure',
          title: 'Staff Software Engineer',
          location: 'San Francisco, CA',
          startDate: 'Jan 2022',
          endDate: 'Present',
          current: true,
          bullets: [
            'Architected active-active multi-region settlement ledger across 3 AWS regions achieving 99.995% availability and sub-45ms p99 commit latency.',
            'Led migration of 18 legacy monolithic services to Go and gRPC microservices, cutting cloud compute costs by $1.8M annually.',
            'Established RFC review process and mentored 14 senior engineers across payments, risk, and developer productivity squads.',
            'Designed idempotent transactional outbox pattern eliminating duplicate settlement webhooks during Kafka broker failovers.',
          ],
        },
        {
          company: 'Nimbus Data Systems',
          title: 'Senior Software Engineer',
          location: 'Seattle, WA',
          startDate: 'Jun 2018',
          endDate: 'Dec 2021',
          current: false,
          bullets: [
            'Scaled real-time streaming ingestion pipeline from 40K to 420K events/sec using partitioned Kafka consumers and PostgreSQL Citus.',
            'Built automated canary rollout controller in Kubernetes reducing failed production deployments by 78%.',
            'Implemented distributed tracing with OpenTelemetry across 60+ services cutting mean time to resolution from 45m to 9m.',
          ],
        },
        {
          company: 'Vertex Cloud Corp',
          title: 'Software Engineer',
          location: 'Denver, CO',
          startDate: 'Jul 2015',
          endDate: 'May 2018',
          current: false,
          bullets: [
            'Engineered OAuth2/OIDC identity federation service handling 4M daily sign-ins with zero critical CVEs.',
            'Refactored slow SQL reporting queries using partial B-tree indexes reducing dashboard load time from 6.4s to 310ms.',
          ],
        },
      ],
      education: [
        {
          school: 'Carnegie Mellon University',
          degree: 'M.S.',
          field: 'Distributed Systems',
          graduationDate: '2015',
        },
      ],
      projects: [
        {
          name: 'raft-kv-lite',
          description: 'Open-source Raft consensus key-value store written in Go with snapshot compaction.',
          highlights: [
            'Passed Jepsen-style partition fault-injection tests with 0 linearizability violations.',
            'Adopted by 3 university distributed systems courses with 1.4K GitHub stars.',
          ],
          url: 'https://github.com/marcus-vance-qa/raft-kv-lite',
        },
        {
          name: 'pg-lock-inspector',
          description: 'Zero-dependency CLI tool visualizing PostgreSQL lock trees and deadlocks in real time.',
          highlights: ['Reduced DBA lock-contention triage time by 60% across 12 production clusters.'],
        },
      ],
      certifications: [
        { name: 'Certified Kubernetes Administrator (CKA)', issuer: 'CNCF', issueDate: '2023' },
        { name: 'AWS Solutions Architect Professional', issuer: 'Amazon Web Services', issueDate: '2022' },
      ],
      customSections: [],
    },
  },

  // 03 — Frontend Developer
  {
    key: 'persona-03-frontend',
    label: 'Resume 03 — Frontend Developer',
    name: 'P03 Frontend Developer Resume',
    targetRole: 'Senior Frontend Engineer',
    templateKey: 'clean-modern',
    objective: 'Skill management, bullet editing, links, inline formatting',
    content: {
      contact: {
        fullName: 'Chloe Bennett',
        email: 'chloe.bennett.qa@example.com',
        phone: '+1 (206) 555-0193',
        location: 'Seattle, WA',
        linkedinUrl: 'https://linkedin.com/in/chloebennett-qa',
        githubUrl: 'https://github.com/chloebennett-qa',
        websiteUrl: 'https://chloebennett.dev',
      },
      headline: 'Senior Frontend Engineer | React, Next.js, TypeScript & Design Systems',
      summary:
        'Frontend specialist building accessible, sub-second web applications with React 19, Next.js, TypeScript, and modular design systems.',
      skills: [
        { name: 'React', category: 'Frontend' },
        { name: 'Next.js', category: 'Frontend' },
        { name: 'TypeScript', category: 'Languages' },
        { name: 'JavaScript (ES2024)', category: 'Languages' },
        { name: 'Tailwind CSS', category: 'Styling' },
        { name: 'WCAG 2.1 AA', category: 'Accessibility' },
        { name: 'Playwright', category: 'Testing' },
      ],
      experience: [
        {
          company: 'PixelForge Labs',
          title: 'Senior Frontend Engineer',
          location: 'Seattle, WA',
          startDate: 'Mar 2022',
          endDate: 'Present',
          current: true,
          bullets: [
            'Re-architected collaborative canvas editor in React and TypeScript reducing INP from 290ms to 48ms.',
            'Built shared 45-component accessible UI library achieving 100% axe-core compliance across 12 web apps.',
            'Implemented incremental static regeneration in Next.js improving LCP by 54% on mobile devices.',
          ],
        },
        {
          company: 'BrightCart Commerce',
          title: 'Frontend Engineer',
          location: 'Portland, OR',
          startDate: 'Aug 2019',
          endDate: 'Feb 2022',
          current: false,
          bullets: [
            'Shipped real-time checkout flow increasing mobile conversion rate by 14.3%.',
            'Automated visual regression testing across 8 breakpoints eliminating CSS regressions in production.',
          ],
        },
      ],
      education: [
        {
          school: 'University of Washington',
          degree: 'B.S.',
          field: 'Human-Centered Design & Engineering',
          graduationDate: '2019',
        },
      ],
      projects: [
        {
          name: 'A11yKit Primitives',
          description: 'Headless keyboard-navigable dialog, combobox, and drawer components.',
          highlights: ['Full focus-trap, Escape dismissal, and screen reader live region announcements.'],
          url: 'https://a11ykit.dev',
        },
      ],
      certifications: [],
      customSections: [],
    },
  },

  // 04 — Backend Engineer
  {
    key: 'persona-04-backend',
    label: 'Resume 04 — Backend Engineer',
    name: 'P04 Backend Engineer Resume',
    targetRole: 'Senior Backend Engineer',
    templateKey: 'deedy',
    objective: 'Long technical terms, wrapping, alignment, two-column density',
    content: {
      contact: {
        fullName: 'Devon Kowalski',
        email: 'devon.kowalski.qa@example.com',
        phone: '+1 (312) 555-0177',
        location: 'Chicago, IL',
        githubUrl: 'https://github.com/dkowalski-qa',
      },
      headline: 'Senior Backend Engineer — Node.js, NestJS, PostgreSQL & Redis',
      summary:
        'Backend engineer specializing in high-concurrency NestJS APIs, PostgreSQL transactional isolation, Redis caching topologies, and deterministic background workers.',
      skills: [
        { name: 'Node.js', category: 'Runtime' },
        { name: 'NestJS', category: 'Frameworks' },
        { name: 'PostgreSQL', category: 'Databases' },
        { name: 'Redis Cluster', category: 'Caching' },
        { name: 'TypeORM', category: 'ORM' },
        { name: 'GraphQL Federation', category: 'APIs' },
        { name: 'Docker & Compose', category: 'DevOps' },
      ],
      experience: [
        {
          company: 'FinLedger Core',
          title: 'Senior Backend Engineer',
          location: 'Chicago, IL',
          startDate: 'May 2021',
          endDate: 'Present',
          current: true,
          bullets: [
            'Implemented PostgreSQL advisory locks and FOR UPDATE SKIP LOCKED job queues eliminating double-billing race conditions.',
            'Optimized Redis write-through caching layer slashing PostgreSQL read IOPS by 68% under peak load.',
            'Authored OpenAPI 3.1 contract validation middleware preventing breaking schema changes across 22 microservices.',
          ],
        },
      ],
      education: [
        {
          school: 'Illinois Institute of Technology',
          degree: 'B.S.',
          field: 'Computer Engineering',
          graduationDate: '2018',
        },
      ],
      projects: [
        {
          name: 'NestJS Durable Worker Kit',
          description: 'Fencing-token lease orchestrator with PostgreSQL LISTEN/NOTIFY event replay.',
          highlights: ['Benchmarked at 50 concurrent workers with 0 duplicate leases in under 250ms.'],
        },
      ],
      certifications: [],
      customSections: [],
    },
  },

  // 05 — Product Manager
  {
    key: 'persona-05-pm',
    label: 'Resume 05 — Product Manager',
    name: 'P05 Product Manager Resume',
    targetRole: 'Principal Product Manager',
    templateKey: 'executive',
    objective: 'Section ordering, emphasis, spacing, executive content hierarchy',
    content: {
      contact: {
        fullName: 'Priya Nair',
        email: 'priya.nair.qa@example.com',
        phone: '+1 (646) 555-0164',
        location: 'New York, NY',
        linkedinUrl: 'https://linkedin.com/in/priyanair-pm-qa',
      },
      headline: 'Principal Product Manager | B2B SaaS Growth & AI Workflows',
      summary:
        'Outcome-driven Principal Product Manager with 9 years scaling enterprise SaaS platforms from $4M to $48M ARR through data-informed experimentation and cross-functional leadership.',
      skills: [
        { name: 'Product Strategy', category: 'Leadership' },
        { name: 'A/B Experimentation', category: 'Analytics' },
        { name: 'SQL & Amplitude', category: 'Analytics' },
        { name: 'Enterprise GTM', category: 'Growth' },
        { name: 'AI Product Design', category: 'Product' },
      ],
      experience: [
        {
          company: 'Vanguard Workflow Cloud',
          title: 'Principal Product Manager',
          location: 'New York, NY',
          startDate: 'Jan 2022',
          endDate: 'Present',
          current: true,
          bullets: [
            'Launched AI-assisted workflow builder driving $11.4M net-new ARR within 12 months of GA.',
            'Improved 90-day enterprise retention from 84% to 94.5% via guided onboarding and usage telemetry.',
            'Aligned 4 engineering squads, 3 designers, and enterprise sales on quarterly OKR roadmap.',
          ],
        },
        {
          company: 'MetricPulse Analytics',
          title: 'Senior Product Manager',
          location: 'Boston, MA',
          startDate: 'Apr 2018',
          endDate: 'Dec 2021',
          current: false,
          bullets: [
            'Grew self-serve trial-to-paid conversion by 31% through redesigned pricing tiers and in-app triggers.',
          ],
        },
      ],
      education: [
        {
          school: 'New York University Stern',
          degree: 'MBA',
          field: 'Product Management & Strategy',
          graduationDate: '2018',
        },
      ],
      projects: [],
      certifications: [
        { name: 'Pragmatic Institute Certified (PMC-IV)', issuer: 'Pragmatic Institute', issueDate: '2021' },
        { name: 'Reforge Product Strategy', issuer: 'Reforge', issueDate: '2023' },
      ],
      customSections: [],
    },
  },

  // 06 — Designer / Creative Professional
  {
    key: 'persona-06-designer',
    label: 'Resume 06 — Designer / Creative',
    name: 'P06 Product Designer Resume',
    targetRole: 'Lead Product Designer',
    templateKey: 'elegant',
    objective: 'Hyperlinks, visual balance, dark sidebar contrast, custom sections',
    content: {
      contact: {
        fullName: 'Sofia Rossi',
        email: 'sofia.rossi.qa@example.com',
        phone: '+1 (310) 555-0188',
        location: 'Los Angeles, CA',
        websiteUrl: 'https://sofiarossi.design',
        linkedinUrl: 'https://linkedin.com/in/sofiarossi-qa',
      },
      headline: 'Lead Product Designer — Design Systems & Interactive Prototyping',
      summary:
        'Multidisciplinary product designer crafting cohesive multi-platform experiences, accessible design tokens, and high-craft interactive prototypes.',
      skills: [
        { name: 'Figma', category: 'Design' },
        { name: 'Design Tokens', category: 'Systems' },
        { name: 'Prototyping', category: 'Interaction' },
        { name: 'User Research', category: 'UX' },
        { name: 'Typography', category: 'Visual' },
      ],
      experience: [
        {
          company: 'Atelier Digital Studio',
          title: 'Lead Product Designer',
          location: 'Los Angeles, CA',
          startDate: 'Feb 2021',
          endDate: 'Present',
          current: true,
          bullets: [
            'Unified 3 web and mobile brand surfaces into a single Figma token library cutting handoff time by 45%.',
            'Led usability testing with 60+ participants elevating task completion rate from 71% to 96%.',
          ],
        },
      ],
      education: [
        {
          school: 'Rhode Island School of Design',
          degree: 'B.F.A.',
          field: 'Graphic Design',
          graduationDate: '2018',
        },
      ],
      projects: [
        {
          name: 'Chroma Accessibility Palette',
          description: 'Open-source APCA/WCAG contrast generator for dark and light themes.',
          highlights: ['Used by 18,000+ monthly designers across Figma Community.'],
          url: 'https://sofiarossi.design/chroma',
        },
      ],
      certifications: [],
      customSections: [
        {
          id: 'custom-awards-06',
          title: 'Design Awards',
          kind: 'awards',
          entries: [
            {
              id: 'award-1',
              heading: 'Webby Honoree — Best Productivity UI',
              subtitle: 'International Academy of Digital Arts',
              dateRange: '2024',
              locationOrLink: 'https://sofiarossi.design/awards',
              bullets: ['Recognized for accessible real-time document collaboration workspace.'],
            },
          ],
        },
      ],
    },
  },

  // 07 — Career Switcher
  {
    key: 'persona-07-career-switcher',
    label: 'Resume 07 — Career Switcher',
    name: 'P07 Career Switcher Resume',
    targetRole: 'Data Analyst',
    templateKey: 'crest',
    objective: 'Empty & partially completed sections, optional sections, visibility toggles',
    content: {
      contact: {
        fullName: 'Jordan Ellis',
        email: 'jordan.ellis.qa@example.com',
        location: 'Denver, CO',
      },
      headline: 'Operations Lead Transitioning to Data Analytics',
      summary:
        'Former healthcare operations coordinator combining 5 years of process optimization with newly acquired SQL, Python, and Tableau analytics skills.',
      skills: [
        { name: 'SQL', category: 'Data' },
        { name: 'Python (pandas)', category: 'Data' },
        { name: 'Tableau', category: 'BI' },
        { name: 'Stakeholder Management', category: 'Transferable' },
        { name: 'Process Improvement', category: 'Transferable' },
        { name: 'Excel Modeling', category: 'Analytics' },
      ],
      experience: [
        {
          company: 'Summit Regional Clinic',
          title: 'Operations Coordinator',
          location: 'Denver, CO',
          startDate: '2020',
          endDate: '2025',
          current: false,
          bullets: [
            'Analyzed patient scheduling wait times in Excel & SQL reducing appointment backlog by 22%.',
          ],
        },
      ],
      education: [
        {
          school: 'Colorado State University',
          degree: 'B.A.',
          field: 'Economics',
          graduationDate: '2019',
        },
      ],
      projects: [
        {
          name: 'Clinic Wait-Time Forecasting Dashboard',
          description: 'Interactive Tableau and Python cohort analysis dashboard.',
          highlights: ['Modeled hourly demand surges with 89% forecast accuracy.'],
        },
      ],
      certifications: [
        { name: 'Google Data Analytics Professional Certificate', issuer: 'Coursera', issueDate: '2025' },
      ],
      customSections: [],
    },
  },

  // 08 — Academic / Research Resume
  {
    key: 'persona-08-academic',
    label: 'Resume 08 — Academic / Research',
    name: 'P08 Academic Research CV',
    targetRole: 'Research Scientist',
    templateKey: 'ivy-league',
    objective: 'Education-heavy structure, publications custom section, special characters, pagination',
    content: {
      contact: {
        fullName: 'Dr. Elena Rostova',
        email: 'elena.rostova.qa@example.com',
        phone: '+1 (617) 555-0155',
        location: 'Cambridge, MA',
        websiteUrl: 'https://rostova-lab.example.edu',
      },
      headline: 'Computational Biology & Machine Learning Research Scientist',
      summary:
        'Postdoctoral researcher investigating graph neural networks for protein-ligand binding affinity with 14 peer-reviewed publications and $1.2M in grant funding.',
      skills: [
        { name: 'PyTorch Geometric', category: 'ML' },
        { name: 'Statistical Inference', category: 'Math' },
        { name: 'R & Bioconductor', category: 'Bioinformatics' },
        { name: 'LaTeX', category: 'Publishing' },
      ],
      experience: [
        {
          company: 'Broad Computational Institute',
          title: 'Postdoctoral Research Fellow',
          location: 'Cambridge, MA',
          startDate: 'Sep 2022',
          endDate: 'Present',
          current: true,
          bullets: [
            'Developed SE(3)-equivariant GNN achieving R² = 0.87 (p < 0.001) on PDBbind v2024 benchmark.',
            'Supervised 4 Ph.D. candidates and co-authored 6 Nature / NeurIPS workshop papers.',
          ],
        },
      ],
      education: [
        {
          school: 'Massachusetts Institute of Technology',
          degree: 'Ph.D.',
          field: 'Computational & Systems Biology',
          graduationDate: '2022',
          gpa: '4.9/5.0',
        },
        {
          school: 'ETH Zürich',
          degree: 'M.Sc.',
          field: 'Computational Science',
          graduationDate: '2017',
        },
        {
          school: 'University of Toronto',
          degree: 'B.Sc. (Honours)',
          field: 'Mathematics & Physics',
          graduationDate: '2015',
        },
      ],
      projects: [
        {
          name: 'MolGraph-Bench',
          description: 'Standardized molecular graph evaluation suite with α/β structural fold splits.',
          highlights: ['Cited 190+ times across ICML & ICLR 2024–2026 proceedings.'],
        },
      ],
      certifications: [
        { name: 'NIH Responsible Conduct of Research', issuer: 'NIH', issueDate: '2023' },
      ],
      customSections: [
        {
          id: 'custom-pubs-08',
          title: 'Selected Publications',
          kind: 'publications',
          entries: [
            {
              id: 'pub-1',
              heading: 'Equivariant Attention for Allosteric Binding — Nature Methods',
              subtitle: 'Rostova E., Chen L., Müller K.',
              dateRange: '2025',
              locationOrLink: 'https://doi.org/10.1038/example-2025',
              bullets: ['Demonstrated 3.1× faster virtual screening across 10⁶ candidate compounds.'],
            },
            {
              id: 'pub-2',
              heading: 'Bayesian Uncertainty Calibration in Molecular Graphs — NeurIPS',
              subtitle: 'Rostova E., Lindqvist Å.',
              dateRange: '2024',
              locationOrLink: 'https://arxiv.org/abs/2401.00001',
              bullets: ['Reduced expected calibration error (ECE) by 44% on out-of-distribution scaffolds.'],
            },
          ],
        },
      ],
    },
  },

  // 09 — International Resume
  {
    key: 'persona-09-international',
    label: 'Resume 09 — International / Unicode',
    name: 'P09 International Unicode Resume',
    targetRole: 'Solutions Architect',
    templateKey: 'double-column',
    objective: 'International phone, date formats, accented & Unicode chars, PDF export compatibility',
    content: {
      contact: {
        fullName: 'François-Xavier Müller-Sørensen',
        email: 'fx.muller.qa@example.eu',
        phone: '+49 30 5550-1928 / +33 1 42 68 53 00',
        location: 'Zürich, Switzerland · München, Deutschland',
        linkedinUrl: 'https://linkedin.com/in/fx-muller-qa',
      },
      headline: 'Solutions Architect — Cloud FinOps & Réglementation Européenne (GDPR / DORA)',
      summary:
        'Bilingual architect (Français / Deutsch / English / 日本語基礎) delivering compliant pan-European banking platforms across Zürich, Genève, München, and São Paulo.',
      skills: [
        { name: 'Architecture Cloud (AWS / GCP)', category: 'Cloud' },
        { name: 'Sécurité & Conformité (ISO-27001)', category: 'Security' },
        { name: 'Kubernetes & Istio', category: 'Platform' },
        { name: 'PostgreSQL / CockroachDB', category: 'Data' },
      ],
      experience: [
        {
          company: 'Société Générale de Technologie & Systèmes Européens AG',
          title: 'Principal Solutions Architect',
          location: 'Zürich, CH',
          startDate: '01/2021',
          endDate: 'Heute',
          current: true,
          bullets: [
            'Conçu une plateforme multi-devises (€, CHF, £, ¥) traitant €4.2B/an avec latence < 35ms.',
            'Piloté la conformité DORA & RGPD auprès de 14 filiales européennes (España, Österreich, Sverige).',
          ],
        },
      ],
      education: [
        {
          school: 'École Polytechnique Fédérale de Lausanne (EPFL)',
          degree: 'Diplôme d’Ingénieur (M.Sc.)',
          field: 'Systèmes de Communication',
          graduationDate: '06/2016',
        },
      ],
      projects: [
        {
          name: 'EuroPay ISO-20022 Validator',
          description: 'Validateur SEPA XML avec prise en charge complète UTF-8 et diacritiques.',
          highlights: ['Validé 100% des jeux de caractères européens (é, ü, ö, ñ, ø, ł, č).'],
        },
      ],
      certifications: [],
      customSections: [],
    },
  },

  // 10 — Extreme Edge-Case Resume
  {
    key: 'persona-10-extreme',
    label: 'Resume 10 — Extreme Edge-Case',
    name: 'P10 Extreme Stress Edge Case',
    targetRole: 'Distinguished Principal Staff Enterprise Distributed Systems & AI Platform Architect',
    templateKey: 'classic-ats',
    objective: 'Extreme lengths, 22 bullets, 28 skills, long unbroken URLs, special HTML chars, stress clipping/overflow',
    content: {
      contact: {
        fullName: 'Alexandria Bartholomew-Montgomery-Fitzwilliam-Vanderbilt III',
        email: 'alexandria.bartholomew.montgomery.extremely.long.qa@enterprise-subdomain-example.co.uk',
        phone: '+44 (0) 20 7946 0958 ext. 44812',
        location: 'London, United Kingdom / Remote Worldwide (UTC+0 to UTC-8)',
        linkedinUrl: 'https://www.linkedin.com/in/alexandria-bartholomew-montgomery-fitzwilliam-vanderbilt-architect-2026',
        githubUrl: 'https://github.com/alexandria-extremely-long-organization-handle/distributed-platform-monorepo',
        websiteUrl: 'https://portfolio.extremely-long-custom-domain-for-wrapping-stress-test.example.org/architecture/case-studies/2026',
      },
      headline: 'Distinguished Principal Staff Enterprise Distributed Systems & AI Platform Architect (C++ / Rust / Go / TypeScript)',
      summary:
        'Testing special characters <script>alert("xss")</script> & ampersands & "quotes" \'apostrophes\' plus an unbroken_super_long_identifier_token_without_spaces_abcdefghijklmnopqrstuvwxyz_0123456789_ABCDEFGHIJKLMNOPQRSTUVWXYZ to verify zero horizontal overflow and safe text escaping across every template and PDF export.',
      skills: Array.from({ length: 28 }, (_, i) => ({
        name:
          i === 0
            ? 'C++20 / C# / F# & Rust'
            : i === 1
              ? 'SuperLongEnterpriseArchitectureFrameworkWithoutSpacesV12'
              : `Skill-${String(i + 1).padStart(2, '0')} (${['Core', 'Cloud', 'Data', 'AI'][i % 4]})`,
        category: ['Core', 'Cloud', 'Data', 'AI'][i % 4],
      })),
      experience: [
        {
          company: 'International Consolidated Quantum Financial & Hyperscale Infrastructure Holdings Corporation Ltd.',
          title: 'Distinguished Principal Staff Enterprise Distributed Systems Architect',
          location: 'London, UK & New York, NY',
          startDate: 'January 2019',
          endDate: 'Present',
          current: true,
          bullets: Array.from({ length: 14 }, (_, i) =>
            `[Bullet ${i + 1}] Engineered mission-critical multi-region failover subsystem #${i + 1} achieving 99.999% SLA, reducing tail latency by ${15 + i * 2}%, and saving $${(i + 1) * 120}K/yr across 40+ global edge PoPs.`,
          ),
        },
        {
          company: 'Global Telemetry & Observability Systems Inc.',
          title: 'Principal Infrastructure Engineer',
          location: 'Remote',
          startDate: 'March 2014',
          endDate: 'December 2018',
          current: false,
          bullets: Array.from({ length: 8 }, (_, i) =>
            `[Legacy Bullet ${i + 1}] Delivered high-throughput ingestion pipeline #${i + 1} handling ${(i + 2) * 100}K events/sec with zero data loss during regional outages.`,
          ),
        },
      ],
      education: [
        {
          school: 'University of Cambridge — Trinity College Department of Computer Science and Technology',
          degree: 'M.Eng. & B.A. (Hons)',
          field: 'Computer Science & Information Engineering',
          graduationDate: '2014',
          gpa: 'First Class Honours',
        },
      ],
      projects: [
        {
          name: 'HyperScale-ZeroCopy-Mesh-Engine',
          description: 'Ultra-low-latency DPDK/eBPF service mesh proxy with deterministic chaos testing.',
          highlights: [
            'Sustained 12M RPS on 8-node bare-metal cluster with < 0.8ms p99.9 latency.',
            'Zero memory leaks verified over 72-hour soak test with ASan & Valgrind.',
          ],
          url: 'https://github.com/alexandria-extremely-long-organization-handle/hyperscale-zerocopy-mesh-engine-v3',
        },
      ],
      certifications: [
        { name: 'AWS Certified Security Specialty', issuer: 'Amazon Web Services', issueDate: '2025' },
      ],
      customSections: [
        {
          id: 'custom-speaking-10',
          title: 'Keynote Talks & Patents',
          kind: 'speaking',
          entries: [
            {
              id: 'talk-1',
              heading: 'KubeCon + CloudNativeCon Keynote: Surviving 100-Region Partitions',
              subtitle: 'CNCF Global Summit',
              dateRange: '2025',
              locationOrLink: 'https://events.example.org/kubecon-2025-keynote',
              bullets: ['Presented live chaos engineering demo to 6,500+ attendees.'],
            },
          ],
        },
      ],
    },
  },
];

