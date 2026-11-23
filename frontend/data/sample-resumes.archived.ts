/**
 * Archived sample resumes — temporarily hidden from the Sample Library.
 * Restore later by merging selected entries back into SAMPLE_RESUMES in sample-resumes.ts.
 * Archived: 2026-11-20
 * Count: 57
 */
import type { SampleResume } from './sample-resumes';

export const ARCHIVED_SAMPLE_RESUMES: SampleResume[] = [
  {
    "id": "bytedance-recommendation-engineer",
    "company": "ByteDance / TikTok",
    "companyKey": "bytedance",
    "brandColor": "#FE2C55",
    "brandTextColor": "#FFFFFF",
    "role": "Lead Recommendation Systems Engineer (TikTok Monolith)",
    "category": "DATA_AI",
    "badge": "PRO",
    "atsScore": 99,
    "experienceLevel": "STAFF_LEAD",
    "candidate": {
      "name": "Wei Zhang",
      "title": "Lead Recommendation Systems Engineer",
      "location": "San Jose, CA",
      "email": "wei.zhang.recsys@gmail.com",
      "phone": "+1 (408) 555-0196",
      "linkedin": "linkedin.com/in/wei-zhang-recsys",
      "github": "github.com/wzhang-recsys"
    },
    "summary": "Lead Machine Learning & Systems Engineer with 8+ years architecting terabyte-scale real-time recommendation engines, online parameter servers, and sparse embedding models for TikTok \"For You\" Feed. Deep expertise in Monolith recommendation architecture, high-throughput GPU inference (100M+ QPS), PyTorch distributed training, and low-latency feature stores. Bridges research rigor and production ML with strong evaluation, reproducibility, and responsible deployment practices.",
    "skills": [
      {
        "category": "Languages",
        "skills": [
          "C++20",
          "Python",
          "CUDA C/C++",
          "Go",
          "SQL"
        ]
      },
      {
        "category": "Recommendation & ML Systems",
        "skills": [
          "Monolith Architecture",
          "Sparse Embedding Tables",
          "Online Parameter Servers",
          "DeepFM / DLRM",
          "Multi-Task Learning (MMoE)",
          "Two-Tower Retrieval"
        ]
      },
      {
        "category": "Distributed Infra & Storage",
        "skills": [
          "PyTorch Distributed",
          "TensorRT",
          "Apache Flink",
          "RocksDB",
          "Redis Cluster",
          "Kafka"
        ]
      },
      {
        "category": "Systems Performance",
        "skills": [
          "Sub-20ms SLA",
          "High QPS (100M+)",
          "GPU Memory Swapping",
          "Distributed Cache Optimization"
        ]
      }
    ],
    "experience": [
      {
        "company": "ByteDance / TikTok",
        "title": "Lead Recommendation Systems Engineer - Core Feed Algorithm Infra",
        "location": "San Jose, CA",
        "startDate": "2021-06",
        "endDate": "Present",
        "current": true,
        "bullets": [
          "Architected and scaled the real-time online parameter server and sparse embedding lookup engine for TikTok \"For You\" feed, handling 120M+ QPS with sub-18ms p99 inference latency.",
          "Engineered dynamic memory eviction and SSD-to-GPU embedding cache tiers in C++, accommodating 10-terabyte user-video interaction embedding tables without increasing GPU memory footprints.",
          "Developed real-time online training loops on Apache Flink and PyTorch, streaming live user engagements (likes, watch time, shares) to update model parameters within 5 seconds of user action.",
          "Optimized Multi-gate Mixture-of-Experts (MMoE) ranking networks using TensorRT and custom CUDA kernels, reducing inference compute cost by 32% across 25,000 GPU inference nodes.",
          "Implemented adaptive fallback scoring heuristics that preserved smooth video playback recommendations during regional network connectivity disruptions.",
          "Published internal benchmarks and ablation studies influencing org-wide architecture for foundation-model fine-tuning."
        ]
      },
      {
        "company": "Baidu",
        "title": "Senior Machine Learning Systems Engineer - Search Ads",
        "location": "Beijing, China / Sunnyvale, CA",
        "startDate": "2017-07",
        "endDate": "2021-05",
        "bullets": [
          "Engineered distributed click-through rate (CTR) prediction models in C++ and Python handling billions of daily ad impressions.",
          "Optimized sparse parameter synchronization across distributed CPU/GPU cluster nodes, cutting training epoch time by 40%.",
          "Built feature generation pipelines with unit-tested transforms and backfill orchestration.",
          "Presented quarterly model performance readouts tying offline metrics to business guardrails."
        ]
      }
    ],
    "projects": [
      {
        "name": "SparseLookup — GPU-Accelerated Embedding Table Server",
        "description": "High-performance C++ and CUDA server optimizing sparse ID lookups with asynchronous GPU memory transfers and multi-tiered caching.",
        "techStack": [
          "C++20",
          "CUDA",
          "gRPC",
          "RocksDB"
        ],
        "url": "github.com/wzhang-recsys/sparse-lookup",
        "highlights": [
          "Processes 8M sparse embedding queries/second per GPU with sub-2ms latency.",
          "Extended SparseLookup — GPU-Accelerated Embedding Table Server with benchmarking and hardening passes, validating stability across 20% more edge cases than initial prototype.",
          "Extended SparseLookup — GPU-Accelerated Embedding Table Server with benchmarking and hardening passes, validating stability across 28% more edge cases than initial prototype."
        ]
      },
      {
        "name": "Capstone Toolkit — GPU Memory Swapping",
        "description": "Supporting project reinforcing depth in data ai.",
        "techStack": [
          "Distributed Cache Optimization",
          "Kafka",
          "GPU Memory Swapping",
          "DeepFM / DLRM"
        ],
        "url": "github.com/wzhang-recsys/capstone",
        "highlights": [
          "Built modular components emphasizing tests, docs, and reviewable diffs for long-term maintainability.",
          "Benchmarked iterations with peer feedback across multiple review cycles.",
          "Shared write-up cited internally as a practical implementation reference."
        ]
      }
    ],
    "education": [
      {
        "school": "Tsinghua University",
        "degree": "Master of Science (M.S.)",
        "field": "Computer Science (Artificial Intelligence)",
        "graduationDate": "2017",
        "honors": "National Graduate Fellowship, Top 1% of Class"
      },
      {
        "school": "Tsinghua University",
        "degree": "Bachelor of Science (B.S.)",
        "field": "Computer Science",
        "graduationDate": "2015"
      }
    ],
    "certifications": [
      "NVIDIA Certified Associate — High-Performance Computing"
    ],
    "experienceLevelLabel": "Staff / Lead (8+ yrs)",
    "country": "Singapore",
    "resumeStyle": "ATS Classic",
    "isIllustrative": true
  },
  {
    "id": "snowflake-database-kernel-engineer",
    "company": "Snowflake",
    "companyKey": "snowflake",
    "brandColor": "#29B5E8",
    "brandTextColor": "#FFFFFF",
    "role": "Senior Database Kernel Engineer (Virtual Warehouse Engine)",
    "category": "SOFTWARE_ENGINEERING",
    "badge": "PRO",
    "atsScore": 98,
    "experienceLevel": "SENIOR_LEVEL",
    "candidate": {
      "name": "Emily Watson",
      "title": "Senior Database Kernel Engineer",
      "location": "San Mateo, CA",
      "email": "emily.watson.db@gmail.com",
      "phone": "+1 (650) 555-0138",
      "linkedin": "linkedin.com/in/emily-watson-db",
      "github": "github.com/ewatson-db"
    },
    "summary": "Senior Database Systems Engineer with 7+ years developing distributed query compilation, vectorized execution runtimes, and cloud-native columnar storage engines. Specialized in Snowflake Virtual Warehouse query optimization, micro-partition pruning heuristics, SIMD-accelerated expression evaluation, and metadata cache layers over AWS S3 and Azure Blob Storage. undefined",
    "skills": [
      {
        "category": "Languages",
        "skills": [
          "C++20",
          "Rust",
          "Java",
          "Python",
          "SQL (ANSI)"
        ]
      },
      {
        "category": "Database Systems & Kernels",
        "skills": [
          "Vectorized Execution",
          "Micro-Partition Pruning",
          "Columnar Storage",
          "Cost-Based Query Optimization (CBO)",
          "SIMD (AVX-512)"
        ]
      },
      {
        "category": "Distributed Storage & Cloud",
        "skills": [
          "AWS S3",
          "Azure Blob Storage",
          "Distributed Cache Coherency",
          "Linux Kernel I/O (io_uring)",
          "gRPC"
        ]
      },
      {
        "category": "Diagnostics & Tooling",
        "skills": [
          "perf",
          "Valgrind",
          "Google Benchmark",
          "GDB",
          "Git"
        ]
      }
    ],
    "experience": [
      {
        "company": "Snowflake",
        "title": "Senior Database Kernel Engineer - Virtual Warehouse Query Execution",
        "location": "San Mateo, CA",
        "startDate": "2021-04",
        "endDate": "Present",
        "current": true,
        "bullets": [
          "Engineered vectorized execution kernels in C++ for analytic window functions and multi-column join operators, accelerating complex analytical customer queries by 3.8x.",
          "Optimized micro-partition metadata pruning algorithms within the Cloud Services coordination layer, eliminating 64% of unnecessary remote S3 partition scans for high-cardinality time-series queries.",
          "Designed an asynchronous remote blob prefetching engine using Linux io_uring, masking S3 GET object latency and improving warehouse SSD cache hit ratios to 92%.",
          "Authored SIMD-accelerated string search and regex matching primitives using AVX-512 instructions, cutting scan phase CPU overhead by 27%.",
          "Diagnosed complex multi-tenant warehouse resource contention, authoring automated adaptive memory spilling routines to avoid out-of-memory worker crashes.",
          "Drove post-incident learning loops with actionable owners, lowering repeat incident classes quarter over quarter."
        ]
      },
      {
        "company": "Teradata",
        "title": "Database Systems Software Engineer",
        "location": "San Diego, CA",
        "startDate": "2017-06",
        "endDate": "2021-03",
        "bullets": [
          "Developed cost-based query optimizer cardinality estimation routines in C++ for relational database tables exceeding 100 billion rows.",
          "Profiled disk I/O bottlenecks across multi-node parallel database systems, improving parallel hash join throughput by 35%.",
          "Built reusable templates adopted by peers for planning, testing, or stakeholder updates.",
          "Improved team workflows through lightweight automation, saving several hours of manual effort per week."
        ]
      }
    ],
    "projects": [
      {
        "name": "MicroPrune — Vectorized Partition Pruning Simulator",
        "description": "Standalone C++ simulator modeling min/max column metadata pruning efficiency across various data clustering distributions.",
        "techStack": [
          "C++20",
          "SIMD",
          "CMake"
        ],
        "url": "github.com/ewatson-db/microprune-sim",
        "highlights": [
          "Evaluates millions of simulated partition headers in under 15ms.",
          "Extended MicroPrune — Vectorized Partition Pruning Simulator with benchmarking and hardening passes, validating stability across 20% more edge cases than initial prototype.",
          "Extended MicroPrune — Vectorized Partition Pruning Simulator with benchmarking and hardening passes, validating stability across 28% more edge cases than initial prototype."
        ]
      },
      {
        "name": "Capstone Toolkit — SIMD (AVX-512)",
        "description": "Supporting project reinforcing depth in software engineering.",
        "techStack": [
          "Valgrind",
          "Micro-Partition Pruning",
          "SIMD (AVX-512)",
          "AWS S3"
        ],
        "url": "github.com/ewatson-db/capstone",
        "highlights": [
          "Built modular components emphasizing tests, docs, and reviewable diffs for long-term maintainability.",
          "Benchmarked iterations with peer feedback across multiple review cycles.",
          "Shared write-up cited internally as a practical implementation reference."
        ]
      }
    ],
    "education": [
      {
        "school": "University of Wisconsin-Madison",
        "degree": "Master of Science (M.S.)",
        "field": "Computer Science (Database Systems)",
        "graduationDate": "2017",
        "gpa": "3.92 / 4.0",
        "honors": "Wisconsin Database Group Research Assistant"
      },
      {
        "school": "University of Illinois Urbana-Champaign",
        "degree": "Bachelor of Science (B.S.)",
        "field": "Computer Science",
        "graduationDate": "2015",
        "honors": "High Honors"
      }
    ],
    "certifications": [
      "SnowPro Core Certified",
      "SnowPro Advanced: Data Engineer"
    ],
    "experienceLevelLabel": "Senior (6–9 yrs)",
    "country": "United States",
    "resumeStyle": "ATS Classic",
    "isIllustrative": true
  },
  {
    "id": "airbnb-design-technologist",
    "company": "Airbnb",
    "companyKey": "airbnb",
    "brandColor": "#FF5A5F",
    "brandTextColor": "#FFFFFF",
    "role": "Senior Design Technologist & UI Systems Engineer",
    "category": "DESIGN_UX",
    "badge": "PRO",
    "atsScore": 98,
    "experienceLevel": "SENIOR_LEVEL",
    "candidate": {
      "name": "Chloe Dupont",
      "title": "Senior Design Technologist & UI Systems Engineer",
      "location": "San Francisco, CA",
      "email": "chloe.dupont.design@gmail.com",
      "phone": "+1 (415) 555-0129",
      "linkedin": "linkedin.com/in/chloedupont-design",
      "portfolio": "chloedupont.design"
    },
    "summary": "Senior Design Technologist and UI Systems Engineer with 7+ years bridging design systems, accessibility engineering, and client-side performance. Specialized in multi-platform token architectures (Figma Variables to Web, iOS, and Android), WCAG 2.1 AAA accessible component primitives, and fluid 60 FPS motion design across 80+ product teams at Airbnb. Systems-minded designer connecting research evidence to shippable patterns and inclusive interaction detail.",
    "skills": [
      {
        "category": "Frontend & UI Engineering",
        "skills": [
          "React",
          "TypeScript",
          "Next.js",
          "React Native",
          "Tailwind CSS",
          "CSS Modules / Sass",
          "HTML5 / Web Components"
        ]
      },
      {
        "category": "Design Systems & Tooling",
        "skills": [
          "Figma Variables & Tokens",
          "Design Token Automation (Style Dictionary)",
          "Storybook",
          "Radix UI Primitives",
          "Framer Motion",
          "Lottie"
        ]
      },
      {
        "category": "Accessibility & Quality",
        "skills": [
          "WCAG 2.1 AAA Compliance",
          "Screen Reader Auditing (VoiceOver, NVDA)",
          "Axe-core Testing",
          "Visual Regression (Chromatic)"
        ]
      }
    ],
    "experience": [
      {
        "company": "Airbnb",
        "title": "Senior Design Technologist - Design Systems & Web Core",
        "location": "San Francisco, CA",
        "startDate": "2021-03",
        "endDate": "Present",
        "current": true,
        "bullets": [
          "Engineered automated design token synchronization pipeline connecting Figma Variables directly to React, Swift, and Jetpack Compose repositories via Style Dictionary and GitHub Actions, eliminating 80 hours of manual token updates per quarter.",
          "Built accessible, responsive component primitives (modals, date range pickers, comboboxes) adopted across 100% of Airbnb guest booking flows, achieving full WCAG 2.1 AAA compliance.",
          "Optimized client-side rendering performance and layout thrashing across listing search pages, elevating Google Core Web Vitals (INP < 120ms, CLS = 0) for 100M+ monthly visitors.",
          "Designed fluid 60 FPS gesture-driven motion prototypes in React and Framer Motion, validating checkout flow iterations that boosted booking completion by 2.4%.",
          "Authored comprehensive component documentation, accessibility runbooks, and interactive Storybook showcases utilized by 450+ cross-functional engineers and designers.",
          "Mentored designers on critique facilitation, raising first-pass review approval rates by 26%."
        ]
      },
      {
        "company": "Pinterest",
        "title": "UI Software Engineer - Gestalt Design System",
        "location": "San Francisco, CA",
        "startDate": "2017-08",
        "endDate": "2021-02",
        "bullets": [
          "Developed reusable React component library used by 300+ frontend engineers, standardizing button, typography, and card patterns.",
          "Implemented automated visual regression testing with Chromatic, reducing unintended UI breaking changes by 65%.",
          "Collaborated on design debt backlog quantifying UX friction via support tag analysis.",
          "Ran design sprints co-creating solutions with PM and engineering leads."
        ]
      }
    ],
    "projects": [
      {
        "name": "TokenSync — Real-Time Figma to Code Token Pipeline",
        "description": "Open-source GitHub Action and CLI automating design token export from Figma REST API into TypeScript, CSS Variables, and iOS/Android themes.",
        "techStack": [
          "TypeScript",
          "Node.js",
          "Figma API",
          "Style Dictionary"
        ],
        "url": "github.com/chloedupont/token-sync",
        "highlights": [
          "Adopted by 40+ engineering organizations with over 1,100 GitHub stars.",
          "Extended TokenSync — Real-Time Figma to Code Token Pipeline with benchmarking and hardening passes, validating stability across 20% more edge cases than initial prototype.",
          "Extended TokenSync — Real-Time Figma to Code Token Pipeline with benchmarking and hardening passes, validating stability across 28% more edge cases than initial prototype."
        ]
      }
    ],
    "education": [
      {
        "school": "Rhode Island School of Design (RISD)",
        "degree": "Bachelor of Fine Arts (B.F.A.)",
        "field": "Graphic Design & Digital Media",
        "graduationDate": "2017",
        "honors": "Honors Graduate"
      },
      {
        "school": "Brown University",
        "degree": "Concurrent Studies",
        "field": "Computer Science (Human-Computer Interaction)",
        "graduationDate": "2017"
      }
    ],
    "certifications": [
      "Certified Professional in Accessibility Core Competencies (CPACC)",
      "Interaction Design Association (IxDA) Member"
    ],
    "experienceLevelLabel": "Senior (6–9 yrs)",
    "country": "United States",
    "resumeStyle": "Modern Technical",
    "isIllustrative": true
  },
  {
    "id": "deloitte-senior-business-analyst",
    "company": "Deloitte",
    "companyKey": "deloitte",
    "brandColor": "#86BC25",
    "brandTextColor": "#FFFFFF",
    "role": "Senior Strategy & Business Analytics Consultant",
    "category": "PRODUCT_BUSINESS",
    "badge": "PRO",
    "atsScore": 97,
    "experienceLevel": "MID_LEVEL",
    "candidate": {
      "name": "Melissa Adams",
      "title": "Senior Strategy & Business Analytics Consultant",
      "location": "Chicago, IL",
      "email": "melissa.adams.consulting@gmail.com",
      "phone": "+1 (312) 555-0184",
      "linkedin": "linkedin.com/in/melissa-adams-deloitte"
    },
    "summary": "Senior Strategy and Analytics Consultant with 6+ years driving enterprise digital transformations, operating model modernizations, and financial valuation models for Fortune 500 healthcare and retail clients. Proven track record identifying $45M+ in cost synergies and translating complex business requirements into high-impact executive deliverables. Translates customer insight and economics into actionable roadmaps spanning engineering, GTM, and operations.",
    "skills": [
      {
        "category": "Strategy & Analysis",
        "skills": [
          "Enterprise Digital Transformation",
          "Cost-Benefit / ROI Modeling",
          "Business Process Re-engineering",
          "Market Sizing & Due Diligence",
          "Executive Stakeholder Alignment"
        ]
      },
      {
        "category": "Analytics & Visualization",
        "skills": [
          "Advanced Financial Modeling",
          "Tableau",
          "Power BI",
          "SQL",
          "Python (Pandas)",
          "Excel (VBA / Monte Carlo)"
        ]
      },
      {
        "category": "Delivery & Methodologies",
        "skills": [
          "Agile / Scrum Frameworks",
          "Change Management",
          "Vendor Evaluation & RFP Management",
          "OKRs & KPI Dashboards"
        ]
      }
    ],
    "experience": [
      {
        "company": "Deloitte Consulting LLP",
        "title": "Senior Consultant — Strategy & Analytics Practice",
        "location": "Chicago, IL",
        "startDate": "2021-08",
        "endDate": "Present",
        "current": true,
        "bullets": [
          "Led a cross-functional workstream for a $14B healthcare payer client, designing an operational cost reduction model that identified $38M in recurring administrative efficiencies.",
          "Conducted comprehensive cloud migration ROI analysis across 40 legacy applications, building dynamic financial models presented directly to client C-suite executives.",
          "Developed automated KPI and revenue dashboards in Tableau and SQL connecting to client data warehouses, replacing 12 manual spreadsheet workflows and accelerating weekly reporting by 85%.",
          "Facilitated 25+ executive stakeholder alignment workshops across business, operations, and IT teams to define roadmap milestones for ERP replacement.",
          "Managed a team of 4 consultants and business analysts, consistently exceeding project billable targets and client quality satisfaction metrics.",
          "Facilitated steering reviews for multi-team programs, holding slipped milestones to under 10% of in-flight work."
        ]
      },
      {
        "company": "Accenture Strategy",
        "title": "Management Consulting Analyst",
        "location": "New York, NY",
        "startDate": "2019-06",
        "endDate": "2021-07",
        "bullets": [
          "Built financial models and synergy estimations for 3 major retail M&A transactions valued at over $2B combined.",
          "Created supply chain optimization simulations identifying $12M in potential inventory holding cost reductions.",
          "Synthesized competitive teardowns and win/loss interviews into exec-ready strategy memos.",
          "Mentored associates on hypothesis-driven problem solving and executive storytelling."
        ]
      }
    ],
    "projects": [
      {
        "name": "Enterprise Cloud ROI & Synergy Valuation Model",
        "description": "Comprehensive financial modeling framework evaluating multi-year TCO, Capex to Opex migration savings, and cloud adoption benefits.",
        "techStack": [
          "Financial Modeling",
          "Excel",
          "Tableau",
          "SQL"
        ],
        "highlights": [
          "Adopted as official practice-wide template across Deloitte Technology Strategy engagements.",
          "Extended Enterprise Cloud ROI & Synergy Valuation Model with benchmarking and hardening passes, validating stability across 20% more edge cases than initial prototype.",
          "Extended Enterprise Cloud ROI & Synergy Valuation Model with benchmarking and hardening passes, validating stability across 28% more edge cases than initial prototype."
        ]
      }
    ],
    "education": [
      {
        "school": "Northwestern University (Kellogg School of Management)",
        "degree": "Master of Business Administration (MBA)",
        "field": "Finance & Strategy",
        "graduationDate": "2019",
        "honors": "Beta Gamma Sigma Honor Society"
      },
      {
        "school": "University of Notre Dame",
        "degree": "Bachelor of Business Administration (B.B.A.)",
        "field": "Finance & Economics",
        "graduationDate": "2016",
        "gpa": "3.88 / 4.0",
        "honors": "Magna Cum Laude"
      }
    ],
    "certifications": [
      "Certified Management Consultant (CMC)",
      "Scrum Alliance Certified Scrum Product Owner (CSPO)"
    ],
    "experienceLevelLabel": "Mid Level (3–5 yrs)",
    "country": "United States",
    "resumeStyle": "Executive Clean",
    "isIllustrative": true
  },
  {
    "id": "chime-fintech-project-manager",
    "company": "Chime",
    "companyKey": "chime",
    "brandColor": "#25C974",
    "brandTextColor": "#FFFFFF",
    "role": "Lead Fintech Product & Payments Operations Manager",
    "category": "PRODUCT_BUSINESS",
    "badge": "PRO",
    "atsScore": 97,
    "experienceLevel": "SENIOR_LEVEL",
    "candidate": {
      "name": "Jordan Taylor",
      "title": "Lead Fintech Product & Payments Operations Manager",
      "location": "San Francisco, CA",
      "email": "jordan.taylor.fintech@gmail.com",
      "phone": "+1 (415) 555-0164",
      "linkedin": "linkedin.com/in/jordan-taylor-fintech"
    },
    "summary": "Lead Fintech Operations & Product Manager with 7+ years optimizing consumer banking products, overdraft protection programs (SpotMe), ACH processing, and card payment networks. Expert in fraud loss mitigation, banking partner SLA compliance, and cross-functional technical project delivery. Translates customer insight and economics into actionable roadmaps spanning engineering, GTM, and operations.",
    "skills": [
      {
        "category": "Fintech Operations & Product",
        "skills": [
          "ACH Processing (NACHA)",
          "Debit Card Issuance",
          "Real-Time Fraud Prevention",
          "Overdraft (SpotMe) Programs",
          "Banking Partner Compliance",
          "Reg E & Reg CC"
        ]
      },
      {
        "category": "Data & Analytical Tools",
        "skills": [
          "SQL (PostgreSQL / Snowflake)",
          "Looker",
          "Tableau",
          "Jira / Confluence",
          "Mixpanel",
          "Python"
        ]
      },
      {
        "category": "Execution & Leadership",
        "skills": [
          "Agile Sprint Planning",
          "Cross-Functional Coordination",
          "Incident Command",
          "Vendor SLA Management"
        ]
      }
    ],
    "experience": [
      {
        "company": "Chime",
        "title": "Lead Technical Product & Operations Manager - Payments Core",
        "location": "San Francisco, CA",
        "startDate": "2021-05",
        "endDate": "Present",
        "current": true,
        "bullets": [
          "Spearheaded the technical roadmap and operations for Chime’s flagship SpotMe overdraft service, managing $120M in monthly advance liquidity while reducing default losses by 22% via real-time risk scoring.",
          "Engineered automated direct deposit and Same-Day ACH processing workflows with partner banks, cutting settlement delays and enabling 4M+ members to access funds up to 2 days early.",
          "Reduced unauthorized debit card transaction fraud losses by 34% by leading the rollout of dynamic 3D-Secure 2.0 verification and machine learning risk rules.",
          "Partnered with bank sponsor compliance officers to maintain 100% adherence to NACHA rules, Regulation E dispute timelines, and AML sanctions screening.",
          "Built real-time payments monitoring dashboards in Looker and SQL, detecting payment network gateway anomalies within 2 minutes and averting merchant transaction drop-offs.",
          "Ran quarterly planning linking customer insights, unit economics, and engineering capacity, delivering 108% of committed OKRs."
        ]
      },
      {
        "company": "SoFi",
        "title": "Senior Operations Analyst - Money & Lending",
        "location": "San Francisco, CA",
        "startDate": "2017-09",
        "endDate": "2021-04",
        "bullets": [
          "Optimized member loan origination and deposit account onboarding funnels, lifting customer completion rates by 18%.",
          "Automated daily wire reconciliation processes between clearing accounts, eliminating 3 hours of manual daily review.",
          "Mentored associates on hypothesis-driven problem solving and executive storytelling.",
          "Synthesized competitive teardowns and win/loss interviews into exec-ready strategy memos."
        ]
      }
    ],
    "projects": [
      {
        "name": "ACH-Sentry — Automated NACHA Compliance & Return Rate Monitor",
        "description": "Automated telemetry model tracking ACH unauthorized debit return rates (R05, R07, R10) against NACHA 0.5% thresholds.",
        "techStack": [
          "Python",
          "SQL",
          "Snowflake",
          "Looker"
        ],
        "highlights": [
          "Protected sponsor bank compliance standing with zero regulatory infractions over 4 years.",
          "Extended ACH-Sentry — Automated NACHA Compliance & Return Rate Monitor with benchmarking and hardening passes, validating stability across 20% more edge cases than initial prototype.",
          "Extended ACH-Sentry — Automated NACHA Compliance & Return Rate Monitor with benchmarking and hardening passes, validating stability across 28% more edge cases than initial prototype."
        ]
      }
    ],
    "education": [
      {
        "school": "University of California, Berkeley",
        "degree": "Bachelor of Arts (B.A.)",
        "field": "Economics & Data Science",
        "graduationDate": "2017",
        "gpa": "3.86 / 4.0",
        "honors": "Dean’s Honors List"
      }
    ],
    "certifications": [
      "Accredited ACH Professional (AAP) — NACHA Certified",
      "Project Management Professional (PMP) — PMI"
    ],
    "experienceLevelLabel": "Senior (6–9 yrs)",
    "country": "United States",
    "resumeStyle": "ATS Classic",
    "isIllustrative": true
  },
  {
    "id": "disney-college-program-operations",
    "company": "The Walt Disney Company",
    "companyKey": "disney",
    "brandColor": "#113CCF",
    "brandTextColor": "#FFFFFF",
    "role": "Guest Experience & Operations Specialist (Disney College Program Alum)",
    "category": "STUDENT_FRESHER",
    "badge": "PRO",
    "atsScore": 96,
    "experienceLevel": "STUDENT_INTERN",
    "candidate": {
      "name": "Sophia Martinez",
      "title": "Guest Experience & Operations Specialist",
      "location": "Orlando, FL",
      "email": "sophia.martinez.disney@gmail.com",
      "phone": "+1 (407) 555-0146",
      "linkedin": "linkedin.com/in/sophia-martinez-disney"
    },
    "summary": "High-energy Operations & Guest Experience Specialist and Disney College Program alum with demonstrated excellence in high-volume park operations, crowd safety management, and premium guest hospitality. Skilled in MyMagic+ / Disney Genie+ guest flow systems, cross-cultural team leadership, and resolving complex guest situations with composure and empathy. High-potential early-career talent with demonstrated internship, research, and project impact.",
    "skills": [
      {
        "category": "Guest Services & Hospitality",
        "skills": [
          "Guest Service Recovery",
          "Crowd Management & Flow Dynamics",
          "Disney Four Keys (Safety, Courtesy, Show, Efficiency)",
          "VIP Concierge Hospitality"
        ]
      },
      {
        "category": "Operations & Systems",
        "skills": [
          "Disney Genie+ / Lightning Lane Dispatch",
          "Point-of-Sale (POS) Systems",
          "Turnstile & Ingress Coordination",
          "Two-Way Radio Protocols"
        ]
      },
      {
        "category": "Interpersonal & Communication",
        "skills": [
          "Conflict De-escalation",
          "Public Speaking & Presentations",
          "Bilingual (English & Spanish)",
          "Cross-Cultural Teamwork"
        ]
      }
    ],
    "experience": [
      {
        "company": "Walt Disney World Resort",
        "title": "Guest Operations & Cast Member (Disney College Program)",
        "location": "Orlando, FL",
        "startDate": "2023-01",
        "endDate": "2024-05",
        "bullets": [
          "Facilitated seamless park ingress and attraction loading for over 25,000 daily guests at Magic Kingdom Park, maintaining adherence to Disney Four Keys standards.",
          "Assisted guests with Disney Genie+ and Lightning Lane reservations on My Disney Experience app, troubleshooting digital ticketing issues with a 98% positive resolution rate.",
          "Managed crowd control and parade audience routing along Main Street, U.S.A., guaranteeing guest safety during high-density fireworks and entertainment events.",
          "Recognized with 14 Cast Compliments and Disney \"Four Keys Fanatic\" award for exemplary customer service and empathetic de-escalation of complex family travel disputes.",
          "Trained 8 incoming international cast members on safety checklists, evacuation protocols, and ADA accessibility guest boarding accommodations.",
          "Shipped internship features through code review to production paths used by tens of thousands of users."
        ]
      },
      {
        "company": "University Student Union",
        "title": "Event Operations Coordinator",
        "location": "Tallahassee, FL",
        "startDate": "2021-08",
        "endDate": "2022-12",
        "bullets": [
          "Coordinated logistics and staging for 45 campus events accommodating up to 3,000 attendees.",
          "Managed equipment check-outs, room reservation scheduling, and audiovisual setup.",
          "Synthesized research readings into summaries used in departmental study materials.",
          "Led campus project team placing top-3 in regional competition among 100+ entrants."
        ]
      }
    ],
    "projects": [
      {
        "name": "MagicFlow — Park Ingress & Queue Optimization Analysis",
        "description": "Undergraduate capstone research paper analyzing queue psychology and mobile ordering adoption in high-capacity theme park environments.",
        "techStack": [
          "Statistical Analysis",
          "Excel",
          "User Flow Mapping"
        ],
        "highlights": [
          "Presented to university hospitality department faculty with highest honors.",
          "Extended MagicFlow — Park Ingress & Queue Optimization Analysis with benchmarking and hardening passes, validating stability across 20% more edge cases than initial prototype.",
          "Extended MagicFlow — Park Ingress & Queue Optimization Analysis with benchmarking and hardening passes, validating stability across 28% more edge cases than initial prototype."
        ]
      },
      {
        "name": "Capstone Toolkit — Guest Service Recovery",
        "description": "Supporting project reinforcing depth in student fresher.",
        "techStack": [
          "Disney Genie+ / Lightning Lane Dispatch",
          "Bilingual (English & Spanish)",
          "Guest Service Recovery",
          "Disney Four Keys (Safety, Courtesy, Show, Efficiency)"
        ],
        "highlights": [
          "Built modular components emphasizing tests, docs, and reviewable diffs for long-term maintainability.",
          "Benchmarked iterations with peer feedback across multiple review cycles.",
          "Shared write-up cited internally as a practical implementation reference."
        ]
      }
    ],
    "education": [
      {
        "school": "Florida State University",
        "degree": "Bachelor of Science (B.S.)",
        "field": "Hospitality Management & Event Operations",
        "graduationDate": "2024",
        "gpa": "3.84 / 4.0",
        "honors": "Cum Laude, National Society of Collegiate Scholars"
      }
    ],
    "certifications": [
      "Disney College Program Certificate of Completion",
      "First Aid & CPR / AED Certified — American Red Cross"
    ],
    "experienceLevelLabel": "Student / Intern",
    "country": "United States",
    "resumeStyle": "Compact Single-Column",
    "isIllustrative": true
  },
  {
    "id": "adidas-senior-project-manager",
    "company": "adidas",
    "companyKey": "adidas",
    "brandColor": "#000000",
    "brandTextColor": "#FFFFFF",
    "role": "Senior Brand & Digital Marketing Project Manager",
    "category": "MARKETING_SEO",
    "badge": "PRO",
    "atsScore": 97,
    "experienceLevel": "SENIOR_LEVEL",
    "candidate": {
      "name": "Lucas Meyer",
      "title": "Senior Brand & Digital Marketing Project Manager",
      "location": "Portland, OR / Herzogenaurach, Germany",
      "email": "lucas.meyer.marketing@gmail.com",
      "phone": "+1 (503) 555-0172",
      "linkedin": "linkedin.com/in/lucas-meyer-marketing"
    },
    "summary": "Senior Marketing Project Manager with 7+ years delivering global omnichannel product launches, mobile app drop campaigns (CONFIRMED App), and influencer partnerships for premier athletic footwear and apparel. Expert in marketing budget oversight ($25M+), digital campaign tracking, creative agency governance, and agile marketing delivery. Translates customer insight and economics into actionable roadmaps spanning engineering, GTM, and operations.",
    "skills": [
      {
        "category": "Digital Marketing & Strategy",
        "skills": [
          "Global Product Launch Management",
          "CONFIRMED App Drop Campaigns",
          "Influencer & Athlete Partnerships",
          "Omnichannel Brand Strategy",
          "Performance Marketing"
        ]
      },
      {
        "category": "Analytics & Tools",
        "skills": [
          "Google Analytics 4",
          "Adobe Analytics",
          "Looker",
          "Asana / Jira",
          "Salesforce Marketing Cloud"
        ]
      },
      {
        "category": "Budget & Production",
        "skills": [
          "Multi-Million Dollar Budget Governance",
          "Creative Agency Management",
          "Content Production Pipelines",
          "Global Brand Compliance"
        ]
      }
    ],
    "experience": [
      {
        "company": "adidas",
        "title": "Senior Project Manager - Digital Flagship & CONFIRMED App Drops",
        "location": "Portland, OR",
        "startDate": "2021-04",
        "endDate": "Present",
        "current": true,
        "bullets": [
          "Orchestrated the global digital marketing rollout for 12 high-profile footwear launches on the adidas CONFIRMED app, generating $42M in direct-to-consumer (DTC) revenue and 1.8M new user app installs.",
          "Governed an annual digital media and creative production budget of $28M, coordinating deliverables across 6 international creative agencies with zero budget overruns.",
          "Spearheaded influencer and athlete partner activation campaigns across North America and Europe, driving a 34% increase in social media engagement and viral TikTok trend impressions.",
          "Implemented standardized agile marketing workflows in Asana, reducing marketing campaign concept-to-launch cycle time from 16 weeks to 9 weeks.",
          "Analyzed conversion funnel analytics across adidas.com and mobile apps, executing A/B test variations that improved checkout completion rates by 3.2%.",
          "Authored PRD templates and decision logs adopted across portfolio, accelerating stakeholder alignment cycles."
        ]
      },
      {
        "company": "Nike",
        "title": "Digital Marketing Specialist - Global Brand Experience",
        "location": "Beaverton, OR",
        "startDate": "2017-09",
        "endDate": "2021-03",
        "bullets": [
          "Managed digital content assets and localized copy for seasonal footwear launches across 18 European markets.",
          "Collaborated with social media teams to schedule organic and paid Instagram/YouTube campaigns achieving 85M+ cumulative impressions.",
          "Synthesized competitive teardowns and win/loss interviews into exec-ready strategy memos.",
          "Drove vendor evaluations and build/buy analyses informing approved investments."
        ]
      }
    ],
    "projects": [
      {
        "name": "CONFIRMED Hype Launch Framework",
        "description": "Standardized operational blueprint for high-demand product drops, covering bot mitigation marketing communications and raffle mechanics.",
        "techStack": [
          "Agile Marketing",
          "Analytics",
          "Asana",
          "Omnichannel Strategy"
        ],
        "highlights": [
          "Adopted as official global playbook across all adidas key metropolitan cities."
        ]
      }
    ],
    "education": [
      {
        "school": "University of Oregon",
        "degree": "Bachelor of Science (B.S.)",
        "field": "Marketing & Sports Business Management (Warsaw Sports Center)",
        "graduationDate": "2017",
        "gpa": "3.89 / 4.0",
        "honors": "Summa Cum Laude"
      }
    ],
    "certifications": [
      "Project Management Professional (PMP) — PMI",
      "Google Analytics 4 (GA4) Certification"
    ],
    "experienceLevelLabel": "Senior (6–9 yrs)",
    "country": "Germany",
    "resumeStyle": "ATS Classic",
    "isIllustrative": true
  },
  {
    "id": "sony-rotational-graduate",
    "company": "SONY",
    "companyKey": "sony",
    "brandColor": "#000000",
    "brandTextColor": "#FFFFFF",
    "role": "Systems Software Graduate Engineer (PlayStation Core)",
    "category": "STUDENT_FRESHER",
    "badge": "PRO",
    "atsScore": 98,
    "experienceLevel": "ENTRY_LEVEL",
    "candidate": {
      "name": "Kenzo Tanaka",
      "title": "Systems Software Graduate Engineer",
      "location": "Tokyo, Japan / San Diego, CA",
      "email": "kenzo.tanaka.sony@gmail.com",
      "phone": "+81 3 5550 0195",
      "linkedin": "linkedin.com/in/kenzo-tanaka-ps",
      "github": "github.com/ktanaka-sony"
    },
    "summary": "Systems Software Graduate Engineer with strong academic and practical foundations in modern C++, low-level graphics APIs (Vulkan, DirectX 12), and PlayStation 5 SDK developer tooling. Experienced in real-time frame time profiling, DualSense haptic feedback firmware integration, and multi-threaded game engine subsystems. High-potential early-career talent with demonstrated internship, research, and project impact.",
    "skills": [
      {
        "category": "Languages",
        "skills": [
          "Modern C++ (C++20)",
          "C",
          "Python",
          "x86 Assembly",
          "HLSL / GLSL"
        ]
      },
      {
        "category": "Graphics & Gaming Runtimes",
        "skills": [
          "Vulkan",
          "DirectX 12",
          "PlayStation 5 SDK",
          "Shader Compilation",
          "GPU Profiling (RenderDoc)"
        ]
      },
      {
        "category": "Systems & Hardware",
        "skills": [
          "Multi-Threaded Systems",
          "Memory Management",
          "DualSense Haptics API",
          "Linux / BSD Kernel",
          "Git"
        ]
      }
    ],
    "experience": [
      {
        "company": "Sony Interactive Entertainment",
        "title": "Systems Software Engineer (Graduate Rotational Program)",
        "location": "Tokyo, Japan / San Diego, CA",
        "startDate": "2023-04",
        "endDate": "Present",
        "current": true,
        "bullets": [
          "Contributed to PlayStation 5 Developer SDK runtime modules in C++20, optimizing DualSense adaptive trigger and haptic feedback audio-wave telemetry processing.",
          "Profiled graphics rendering draw-calls and GPU pipeline stalls in Vulkan using RenderDoc, identifying memory bandwidth bottlenecks that reduced frame drops in internal demo builds.",
          "Assisted senior kernel engineers in testing BSD-derived operating system system calls and high-speed NVMe storage read APIs for PS5 game title loading.",
          "Developed automated C++ unit testing suites for PlayStation Network authentication and cloud save synchronization libraries, raising test coverage by 30%.",
          "Completed rigorous engineering rotations across PlayStation Studios Central Technology, Audio Systems, and Graphics Architecture.",
          "Authored tests and docs raising module coverage above 75% before program conclusion."
        ]
      },
      {
        "company": "Capcom",
        "title": "Software Engineering Intern - Engine Systems",
        "location": "Osaka, Japan",
        "startDate": "2022-06",
        "endDate": "2022-12",
        "bullets": [
          "Implemented multi-threaded particle system physics simulator in C++ utilizing SIMD intrinsics for RE Engine.",
          "Wrote automated crash dump parsing tools in Python, extracting call stacks and register states to assist game engine developers.",
          "Served as teaching assistant leading weekly labs for 50+ students improving exam averages 9 points.",
          "Synthesized research readings into summaries used in departmental study materials."
        ]
      }
    ],
    "projects": [
      {
        "name": "VulkanVoxel — Real-Time Hardware-Accelerated Voxel Raytracer",
        "description": "Modern C++20 and Vulkan ray-tracing engine featuring compute shader acceleration and spatial bounding volume hierarchies (BVH).",
        "techStack": [
          "C++20",
          "Vulkan",
          "GLSL",
          "RenderDoc"
        ],
        "url": "github.com/ktanaka-sony/vulkan-voxel",
        "highlights": [
          "Runs real-time lighting and shadows at 90 FPS on modern desktop GPUs.",
          "Extended VulkanVoxel — Real-Time Hardware-Accelerated Voxel Raytracer with benchmarking and hardening passes, validating stability across 20% more edge cases than initial prototype.",
          "Extended VulkanVoxel — Real-Time Hardware-Accelerated Voxel Raytracer with benchmarking and hardening passes, validating stability across 28% more edge cases than initial prototype."
        ]
      },
      {
        "name": "Capstone Toolkit — Shader Compilation",
        "description": "Supporting project reinforcing depth in student fresher.",
        "techStack": [
          "Git",
          "Multi-Threaded Systems",
          "Shader Compilation",
          "Python"
        ],
        "url": "github.com/ktanaka-sony/capstone",
        "highlights": [
          "Built modular components emphasizing tests, docs, and reviewable diffs for long-term maintainability.",
          "Benchmarked iterations with peer feedback across multiple review cycles.",
          "Shared write-up cited internally as a practical implementation reference."
        ]
      }
    ],
    "education": [
      {
        "school": "Tokyo Institute of Technology",
        "degree": "Bachelor of Engineering (B.Eng.)",
        "field": "Computer Science & Systems Engineering",
        "graduationDate": "2023",
        "gpa": "3.91 / 4.0",
        "honors": "President’s Award for Outstanding Graduation Research"
      }
    ],
    "certifications": [
      "Khronos Group Vulkan Certified Developer"
    ],
    "experienceLevelLabel": "Entry Level (0–2 yrs)",
    "country": "United Kingdom",
    "resumeStyle": "ATS Classic",
    "isIllustrative": true
  },
  {
    "id": "accenture-assistant-policy-intern",
    "company": "Accenture",
    "companyKey": "accenture",
    "brandColor": "#A100FF",
    "brandTextColor": "#FFFFFF",
    "role": "Public Policy & Digital Government Strategy Analyst",
    "category": "PRODUCT_BUSINESS",
    "badge": "PRO",
    "atsScore": 97,
    "experienceLevel": "ENTRY_LEVEL",
    "candidate": {
      "name": "Amina Diallo",
      "title": "Public Policy & Digital Government Strategy Analyst",
      "location": "Arlington, VA",
      "email": "amina.diallo.accenture@gmail.com",
      "phone": "+1 (703) 555-0158",
      "linkedin": "linkedin.com/in/amina-diallo-policy"
    },
    "summary": "Public Policy and Digital Strategy Analyst with 3+ years delivering IT modernization roadmaps, FedRAMP compliance frameworks, and digital service redesigns for federal agencies. Skilled in legislative analysis, stakeholder facilitation, cloud policy alignment, and data-driven public sector performance reporting. Translates customer insight and economics into actionable roadmaps spanning engineering, GTM, and operations.",
    "skills": [
      {
        "category": "Policy & Government IT",
        "skills": [
          "Federal IT Modernization (FITARA)",
          "FedRAMP & NIST 800-53",
          "Public Policy Impact Analysis",
          "Digital Government Services",
          "Stakeholder Interviews"
        ]
      },
      {
        "category": "Analytics & Delivery",
        "skills": [
          "Data Analysis (Excel / Tableau)",
          "PowerPoint Storyboarding",
          "Requirements Gathering",
          "Process Mapping (BPMN)",
          "Agile in Government"
        ]
      }
    ],
    "experience": [
      {
        "company": "Accenture Federal Services",
        "title": "Digital Strategy & Technology Policy Analyst",
        "location": "Arlington, VA",
        "startDate": "2023-01",
        "endDate": "Present",
        "current": true,
        "bullets": [
          "Formulated IT modernization roadmaps for a Cabinet-level federal agency, aligning legacy mainframe decommission milestones with OMB cloud-smart mandates.",
          "Conducted statutory and compliance gap assessments across 8 cloud software vendors, validating FedRAMP High and NIST 800-53 security controls to accelerate ATO approvals.",
          "Designed citizen journey maps and accessible interface recommendations for a public benefits web portal, reducing citizen application completion drop-off by 26%.",
          "Coordinated cross-agency policy steering working groups, drafting executive memos and briefing presentations delivered directly to Deputy Assistant Secretaries.",
          "Authored quarterly performance and program metric scorecards evaluating $45M in IT modernization contract expenditures.",
          "Facilitated steering reviews for multi-team programs, holding slipped milestones to under 10% of in-flight work."
        ]
      },
      {
        "company": "Brookings Institution",
        "title": "Technology & Governance Research Assistant",
        "location": "Washington, D.C.",
        "startDate": "2021-09",
        "endDate": "2022-12",
        "bullets": [
          "Researched artificial intelligence regulatory frameworks and federal privacy legislation across US and European jurisdictions.",
          "Published 4 policy analytical briefs on algorithmic bias and broadband infrastructure equity.",
          "Delivered training and change plans for large-scale rollouts exceeding 1,500 users.",
          "Mentored associates on hypothesis-driven problem solving and executive storytelling."
        ]
      }
    ],
    "projects": [
      {
        "name": "FedCloud-Tracker — Federal Agency Cloud Maturity Index",
        "description": "Analytical framework benchmarking federal agency compliance with Cloud-Smart policies, cybersecurity executive orders, and FITARA scoring.",
        "techStack": [
          "Tableau",
          "Excel",
          "Legislative Policy Modeling"
        ],
        "highlights": [
          "Cited in public sector technology governance briefings.",
          "Extended FedCloud-Tracker — Federal Agency Cloud Maturity Index with benchmarking and hardening passes, validating stability across 20% more edge cases than initial prototype.",
          "Extended FedCloud-Tracker — Federal Agency Cloud Maturity Index with benchmarking and hardening passes, validating stability across 28% more edge cases than initial prototype."
        ]
      }
    ],
    "education": [
      {
        "school": "Georgetown University (McCourt School of Public Policy)",
        "degree": "Master of Public Policy (M.P.P.)",
        "field": "Technology Policy & Governance",
        "graduationDate": "2023",
        "honors": "McCourt Merit Scholar"
      },
      {
        "school": "University of Virginia",
        "degree": "Bachelor of Arts (B.A.)",
        "field": "Foreign Affairs & Economics",
        "graduationDate": "2021",
        "gpa": "3.87 / 4.0",
        "honors": "Phi Beta Kappa"
      }
    ],
    "certifications": [
      "AWS Certified Cloud Practitioner",
      "Certified ScrumMaster (CSM)"
    ],
    "experienceLevelLabel": "Entry Level (0–2 yrs)",
    "country": "United States",
    "resumeStyle": "Compact Single-Column",
    "isIllustrative": true
  },
  {
    "id": "ncstate-it-security-architect",
    "company": "NC State",
    "companyKey": "ncstate",
    "brandColor": "#CC0000",
    "brandTextColor": "#FFFFFF",
    "role": "Lead Enterprise Security Architect",
    "category": "DEVOPS_CLOUD",
    "badge": "PRO",
    "atsScore": 98,
    "experienceLevel": "STAFF_LEAD",
    "candidate": {
      "name": "Brian O’Halloran",
      "title": "Lead Enterprise Security Architect",
      "location": "Raleigh, NC",
      "email": "brian.ohalloran.sec@gmail.com",
      "phone": "+1 (919) 555-0136",
      "linkedin": "linkedin.com/in/brian-ohalloran-sec",
      "github": "github.com/bohalloran-sec"
    },
    "summary": "Lead Enterprise Information Security Architect with 9+ years designing Zero Trust defense architectures, hybrid multi-cloud security postures, and automated incident response frameworks for high-capacity research universities and defense research laboratories. Expert in NIST SP 800-171/53, CMMC 2.0, multi-factor SAML/OAuth federation, and enterprise threat intelligence. Partners with engineering and GTM on pragmatic security programs that accelerate—not block—shipping.",
    "skills": [
      {
        "category": "Cybersecurity Architecture",
        "skills": [
          "Zero Trust Network Architecture (ZTNA)",
          "NIST SP 800-171 / 800-53",
          "CMMC 2.0 Level 2",
          "Cloud Security Posture (CSPM)",
          "Threat Modeling (STRIDE)"
        ]
      },
      {
        "category": "Identity & Access Management",
        "skills": [
          "SAML 2.0 / OIDC Federation",
          "Okta / Azure AD",
          "Privileged Access Management (PAM)",
          "Role-Based Access Control (RBAC)"
        ]
      },
      {
        "category": "SecOps & Detection",
        "skills": [
          "SIEM (Splunk / Elastic Security)",
          "EDR (CrowdStrike Falcon)",
          "Vulnerability Management (Tenable / Qualys)",
          "Suricata / Zeek IDS"
        ]
      },
      {
        "category": "Languages & Automation",
        "skills": [
          "Python",
          "Bash",
          "Terraform",
          "Ansible",
          "PowerShell"
        ]
      }
    ],
    "experience": [
      {
        "company": "North Carolina State University",
        "title": "Lead Enterprise IT Security Architect - Office of Information Technology",
        "location": "Raleigh, NC",
        "startDate": "2021-01",
        "endDate": "Present",
        "current": true,
        "bullets": [
          "Architected and implemented enterprise Zero Trust Network Architecture protecting 45,000 active student, faculty, and research workstations across 12 campus colleges.",
          "Engineered compliant enclaves adhering to NIST SP 800-171 and CMMC 2.0 Level 2, protecting $80M in federal defense research grants involving Controlled Unclassified Information (CUI).",
          "Consolidated enterprise identity management from legacy LDAP silos to cloud-federated Okta and Azure AD with FIDO2 hardware security keys, reducing credential phishing attacks by 94%.",
          "Automated threat hunting detection playbooks in Splunk SIEM and CrowdStrike Falcon, slashing Mean Time to Respond (MTTR) for high-severity ransomware threats from 6 hours to 8 minutes.",
          "Chaired University Information Security Council, authoring campus-wide cryptographic standards and conducting annual cyber tabletop disaster exercises.",
          "Authored secure SDLC training adopted by 120+ engineers across product and platform orgs."
        ]
      },
      {
        "company": "Duke University Health System",
        "title": "Senior Information Security Engineer",
        "location": "Durham, NC",
        "startDate": "2016-06",
        "endDate": "2020-12",
        "bullets": [
          "Secured hospital clinical networks and biomedical IoT devices complying with HIPAA Security Rule and HITECH requirements.",
          "Implemented network micro-segmentation using Cisco TrustSec, isolating critical medical telemetry networks from guest Wi-Fi.",
          "Hardened container base images and enforced provenance attestation in supply chain pipelines.",
          "Maintained on-call playbooks for credential incidents with quarterly tabletop exercises."
        ]
      }
    ],
    "projects": [
      {
        "name": "ZeroTrust-Enclave — Automated NIST 800-171 Terraform Blueprint",
        "description": "Infrastructure as Code repository provisioning isolated AWS/Azure research computing enclaves compliant with CMMC 2.0 controls.",
        "techStack": [
          "Terraform",
          "AWS GovCloud",
          "Ansible",
          "Linux"
        ],
        "url": "github.com/bohalloran-sec/zerotrust-enclave",
        "highlights": [
          "Adopted by 8 major research universities to secure DOD research projects.",
          "Extended ZeroTrust-Enclave — Automated NIST 800-171 Terraform Blueprint with benchmarking and hardening passes, validating stability across 20% more edge cases than initial prototype.",
          "Extended ZeroTrust-Enclave — Automated NIST 800-171 Terraform Blueprint with benchmarking and hardening passes, validating stability across 28% more edge cases than initial prototype."
        ]
      },
      {
        "name": "Capstone Toolkit — Ansible",
        "description": "Supporting project reinforcing depth in devops cloud.",
        "techStack": [
          "PowerShell",
          "Suricata / Zeek IDS",
          "Ansible",
          "Terraform"
        ],
        "url": "github.com/bohalloran-sec/capstone",
        "highlights": [
          "Built modular components emphasizing tests, docs, and reviewable diffs for long-term maintainability.",
          "Benchmarked iterations with peer feedback across multiple review cycles.",
          "Shared write-up cited internally as a practical implementation reference."
        ]
      }
    ],
    "education": [
      {
        "school": "North Carolina State University",
        "degree": "Master of Science (M.S.)",
        "field": "Computer Networking (Information Security)",
        "graduationDate": "2016",
        "gpa": "3.94 / 4.0"
      },
      {
        "school": "North Carolina State University",
        "degree": "Bachelor of Science (B.S.)",
        "field": "Computer Science",
        "graduationDate": "2014",
        "honors": "Magna Cum Laude"
      }
    ],
    "certifications": [
      "Certified Information Systems Security Professional (CISSP)",
      "Certified Information Security Manager (CISM)",
      "Certified Cloud Security Professional (CCSP)",
      "GIAC Certified Incident Handler (GCIH)"
    ],
    "experienceLevelLabel": "Staff / Lead (8+ yrs)",
    "country": "United States",
    "resumeStyle": "ATS Classic",
    "isIllustrative": true
  },
  {
    "id": "meta-android-platform-architect",
    "company": "Meta",
    "companyKey": "meta",
    "brandColor": "#1877F2",
    "brandTextColor": "#FFFFFF",
    "role": "Staff Android Systems & Performance Engineer",
    "category": "SOFTWARE_ENGINEERING",
    "badge": "PRO",
    "atsScore": 98,
    "experienceLevel": "STAFF_LEAD",
    "experienceLevelLabel": "Staff / Lead (8+ yrs)",
    "country": "Germany",
    "resumeStyle": "ATS Classic",
    "isIllustrative": true,
    "candidate": {
      "name": "Lukas Schneider",
      "title": "Staff Android Systems & Performance Engineer",
      "location": "Berlin, Germany",
      "email": "lukas.schneider.dev@gmail.com",
      "phone": "+49 152 9845 2210",
      "linkedin": "linkedin.com/in/lukas-schneider-android",
      "github": "github.com/lukas-droid"
    },
    "summary": "Staff Android Engineer with 8+ years developing high-scale mobile operating systems and consumer applications across 500M+ installs. Specialized in ART runtime memory optimization, Jetpack Compose performance, low-level NDK/C++ audio pipelines, and battery consumption minimization on heterogeneous Android hardware.",
    "skills": [
      {
        "category": "Android Core",
        "skills": [
          "Kotlin",
          "Java",
          "Android NDK (C++)",
          "Jetpack Compose",
          "Coroutines & Flow",
          "Dagger / Hilt",
          "Room"
        ]
      },
      {
        "category": "Systems & Performance",
        "skills": [
          "ART Runtime Profiling",
          "Systrace / Perfetto",
          "LeakCanary",
          "Memory Leaks & OOM Optimization",
          "Battery Historian"
        ]
      },
      {
        "category": "Architecture & Tooling",
        "skills": [
          "Clean Architecture",
          "MVI / MVVM",
          "Gradle Build Cache",
          "ProGuard / R8",
          "CI/CD (Fastlane, GitHub Actions)"
        ]
      }
    ],
    "experience": [
      {
        "company": "Meta",
        "title": "Staff Android Systems Engineer - Instagram Core Platform",
        "location": "Berlin, Germany",
        "startDate": "2021-08",
        "endDate": "Present",
        "current": true,
        "bullets": [
          "Led Instagram Reels video playback cold-start optimization, reducing time-to-first-frame by 38% across entry-level Android devices in emerging markets.",
          "Engineered custom off-heap memory ring buffer in C++ using Android NDK, reducing out-of-memory (OOM) crash frequency by 62% for heavy media rendering.",
          "Cut clean Gradle build time by 48% across 160-engineer organization through custom build-cache daemons and incremental task definitions.",
          "Pioneered automated Jetpack Compose recomposition tracing integration within Perfetto, identifying and eliminating 120+ unneeded UI re-renders."
        ]
      },
      {
        "company": "Delivery Hero",
        "title": "Senior Android Engineer - Global Rider App",
        "location": "Berlin, Germany",
        "startDate": "2018-05",
        "endDate": "2021-07",
        "bullets": [
          "Rebuilt background GPS tracking pipeline with battery-efficient location clustering, reducing overall rider battery consumption by 28% over 8-hour shifts.",
          "Implemented offline-first synchronization architecture using Room and Coroutines, eliminating order loss during sudden cellular dropouts.",
          "Shipped Kotlin Multiplatform shared networking layer across Android and iOS rider apps, cutting duplicate API client work by ~40%.",
          "Reduced ANR rate 31% by migrating blocking disk I/O off the main thread and introducing structured concurrency timeouts.",
          "Mentored 6 engineers on Compose migration and performance budgeting; established weekly Systrace review rituals for release candidates."
        ]
      }
    ],
    "projects": [
      {
        "name": "MemTraceDroid — Automated Android Native Heap Profiler",
        "description": "Lightweight open-source memory leak detection library targeting native JNI allocations without stopping the world.",
        "techStack": [
          "Kotlin",
          "C++20",
          "Android NDK",
          "Perfetto"
        ],
        "url": "github.com/lukas-droid/memtracedroid",
        "highlights": [
          "Detected over 40 critical memory leaks in open-source media apps; recognized by Google Developer Experts."
        ]
      }
    ],
    "education": [
      {
        "school": "Technical University of Munich (TUM)",
        "degree": "Master of Science (M.Sc.)",
        "field": "Computer Science",
        "graduationDate": "2018",
        "gpa": "1.2 (German Scale - High Distinction)"
      }
    ],
    "certifications": [
      "Google Associate Android Developer Certification",
      "Jetpack Compose Architecture Certified"
    ]
  },
  {
    "id": "apple-senior-ios-swift-engineer",
    "company": "Apple",
    "companyKey": "apple",
    "brandColor": "#000000",
    "brandTextColor": "#FFFFFF",
    "role": "Senior iOS & Swift Architecture Lead",
    "category": "SOFTWARE_ENGINEERING",
    "badge": "PRO",
    "atsScore": 98,
    "experienceLevel": "SENIOR_LEVEL",
    "experienceLevelLabel": "Senior (6–9 yrs)",
    "country": "United Kingdom",
    "resumeStyle": "Modern Technical",
    "isIllustrative": true,
    "candidate": {
      "name": "Oliver Wright",
      "title": "Senior iOS & Swift Architecture Lead",
      "location": "London, United Kingdom",
      "email": "oliver.wright.ios@gmail.com",
      "phone": "+44 20 7946 0812",
      "linkedin": "linkedin.com/in/oliver-wright-ios",
      "github": "github.com/owright-swift"
    },
    "summary": "Senior iOS Platform Architect with 7+ years building high-fidelity native Swift and SwiftUI experiences for 30M+ Apple devices. Expert in Swift 6 concurrency, Core Data & SwiftData migrations, Metal shader graphics pipelines, and App Store optimization. Focused on crash-free sessions, accessibility, and App Store–grade performance on flagship consumer experiences.",
    "skills": [
      {
        "category": "iOS Architecture",
        "skills": [
          "Swift 6",
          "SwiftUI",
          "UIKit",
          "Combine",
          "Swift Concurrency (Actors, Async/Await)",
          "SwiftData",
          "CoreData"
        ]
      },
      {
        "category": "Performance & Low Level",
        "skills": [
          "Instruments (Time Profiler, Allocations)",
          "Metal & Core Animation",
          "Memory Graph Debugging",
          "Signposts"
        ]
      },
      {
        "category": "Tooling & Distribution",
        "skills": [
          "Xcode",
          "Swift Package Manager",
          "Fastlane",
          "TestFlight",
          "Tuist",
          "GitHub Actions"
        ]
      }
    ],
    "experience": [
      {
        "company": "Monzo Bank",
        "title": "Lead iOS Engineer - Wealth & Core Banking",
        "location": "London, United Kingdom",
        "startDate": "2021-04",
        "endDate": "Present",
        "current": true,
        "bullets": [
          "Architected modularized banking app with Tuist and SPM into 36 micro-frameworks, cutting incremental build times from 4.5 minutes to 38 seconds.",
          "Migrated legacy Combine reactive pipelines to native Swift Concurrency (Actors & TaskGroups), eliminating race conditions in high-concurrency payment authorization flows.",
          "Maintained 99.98% crash-free sessions across 7M+ active monthly UK customers while delivering bi-weekly App Store releases.",
          "Partnered with designers on motion-safe transitions meeting Apple HIG performance guidance across iPad multitasking.",
          "Tuned SwiftUI/UIKit composition and diffing paths, improving cold-start time by 310ms on A15-class devices.",
          "Shipped accessibility and Dynamic Type coverage for primary navigation flows, lifting VoiceOver task success to 94%."
        ]
      },
      {
        "company": "Revolut",
        "title": "Senior iOS Developer - Trading Platform",
        "location": "London, United Kingdom",
        "startDate": "2018-09",
        "endDate": "2021-03",
        "bullets": [
          "Engineered real-time candlestick stock charting engine in Metal and CoreGraphics maintaining steady 120 FPS scrolling on ProMotion displays.",
          "Reduced app launch cold-start time by 32% through dynamic library pre-warming and lazy initial view controller instantiation.",
          "Added snapshot and XCTest UI suites for checkout flows, preventing 6 regressions in holiday release window.",
          "Collaborated on Core Data migration strategy preserving offline cart state across major schema upgrades."
        ]
      }
    ],
    "projects": [
      {
        "name": "SwiftStreamChart — 120FPS Financial Charting in SwiftUI",
        "description": "Zero-allocation real-time charting library built in Metal for low-battery iOS stock and crypto market visualization.",
        "techStack": [
          "Swift 6",
          "Metal",
          "SwiftUI",
          "Instruments"
        ],
        "url": "github.com/owright-swift/swiftstreamchart",
        "highlights": [
          "Adopted by 3 European fintechs with over 1,500 stars on GitHub.",
          "Extended SwiftStreamChart — 120FPS Financial Charting in SwiftUI with benchmarking and hardening passes, validating stability across 20% more edge cases than initial prototype.",
          "Extended SwiftStreamChart — 120FPS Financial Charting in SwiftUI with benchmarking and hardening passes, validating stability across 28% more edge cases than initial prototype."
        ]
      },
      {
        "name": "Capstone Toolkit — CoreData",
        "description": "Supporting project reinforcing depth in software engineering.",
        "techStack": [
          "Xcode",
          "Tuist",
          "CoreData",
          "Swift Concurrency (Actors, Async/Await)"
        ],
        "url": "github.com/owright-swift/capstone",
        "highlights": [
          "Built modular components emphasizing tests, docs, and reviewable diffs for long-term maintainability.",
          "Benchmarked iterations with peer feedback across multiple review cycles.",
          "Shared write-up cited internally as a practical implementation reference."
        ]
      }
    ],
    "education": [
      {
        "school": "Imperial College London",
        "degree": "B.Eng. (Honours)",
        "field": "Computing",
        "graduationDate": "2018",
        "honors": "First Class Honours"
      }
    ],
    "certifications": [
      "Apple Certified iOS Technical Specialist"
    ]
  },
  {
    "id": "cockroachlabs-staff-backend-go",
    "company": "Cockroach Labs",
    "companyKey": "cockroachlabs",
    "brandColor": "#6933FF",
    "brandTextColor": "#FFFFFF",
    "role": "Staff Distributed Backend Engineer (Go & Raft)",
    "category": "SOFTWARE_ENGINEERING",
    "badge": "PRO",
    "atsScore": 99,
    "experienceLevel": "STAFF_LEAD",
    "experienceLevelLabel": "Staff / Lead (8+ yrs)",
    "country": "United States",
    "resumeStyle": "ATS Classic",
    "isIllustrative": true,
    "candidate": {
      "name": "Ethan Brooks",
      "title": "Staff Distributed Backend Engineer",
      "location": "New York, NY",
      "email": "ethan.brooks.systems@gmail.com",
      "phone": "+1 (212) 555-0144",
      "linkedin": "linkedin.com/in/ethanbrooks-systems",
      "github": "github.com/ebrooks-go"
    },
    "summary": "Staff Backend Systems Engineer with 9+ years architecting globally distributed SQL engines, Raft replication protocols, and high-concurrency microservices in Go. Proven track record in zero-downtime cluster rebalancing, lock-free memory indexing, and sub-millisecond p99 transactional APIs processing millions of requests per second. Experienced building reliable, observable services with clear API contracts and data integrity guarantees.",
    "skills": [
      {
        "category": "Languages & Core Systems",
        "skills": [
          "Go (Golang)",
          "Rust",
          "C++",
          "SQL",
          "Protocol Buffers",
          "gRPC"
        ]
      },
      {
        "category": "Distributed Architecture",
        "skills": [
          "Raft Consensus",
          "Multi-Raft Groups",
          "MVCC Storage",
          "ACID Transactions",
          "Pebble / RocksDB",
          "Kafka"
        ]
      },
      {
        "category": "Cloud Infrastructure",
        "skills": [
          "Kubernetes",
          "Docker",
          "Linux Performance Tuning (perf, ebpf)",
          "Prometheus",
          "AWS",
          "GCP"
        ]
      }
    ],
    "experience": [
      {
        "company": "Cockroach Labs",
        "title": "Staff Distributed Systems Engineer - SQL Execution Engine",
        "location": "New York, NY",
        "startDate": "2021-02",
        "endDate": "Present",
        "current": true,
        "bullets": [
          "Architected vectorized query execution operators in Go, boosting complex aggregate join throughput by 3.4x for large analytical enterprise workloads.",
          "Engineered decentralized range leaseholder balancing heuristics across multi-cloud regions, reducing cross-WAN consensus round trips by 36%.",
          "Authored lock-free concurrency primitives that cut goroutine contention overhead by 45% on 64-core AMD EPYC server nodes.",
          "Diagnosed and eliminated critical multi-Raft deadlocks under heavy disk I/O stalls using formal TLA+ modeling and stress simulation harness.",
          "Introduced contract tests and schema registry for public APIs, reducing breaking changes caught in production to near zero.",
          "Partitioned high-write tables and tuned connection pool settings, sustaining 18K RPS with p99 under 95ms."
        ]
      },
      {
        "company": "Twilio",
        "title": "Senior Backend Engineer - Voice & Messaging Core",
        "location": "San Francisco, CA",
        "startDate": "2017-08",
        "endDate": "2021-01",
        "bullets": [
          "Scaled global SMS dispatch gateway in Go to 45,000 messages/sec with 99.999% delivery reliability during peak presidential election alerts.",
          "Replaced synchronous REST microservice bottlenecks with asynchronous Kafka event-sourcing topics, cutting median message transit latency by 60ms.",
          "Partnered with infra on blue/green deploy hooks and automatic smoke tests gating promotions.",
          "Hardened input validation and rate limits on public endpoints, mitigating abuse spikes during promotional events."
        ]
      }
    ],
    "projects": [
      {
        "name": "RaftMini — Educational Multi-Raft Cluster in Go",
        "description": "Clean-room multi-raft implementation demonstrating log compaction, joint consensus reconfiguration, and snapshotting.",
        "techStack": [
          "Go",
          "gRPC",
          "BadgerDB",
          "Raft"
        ],
        "url": "github.com/ebrooks-go/raftmini",
        "highlights": [
          "Used by university distributed systems courses with 3,000+ GitHub stars.",
          "Extended RaftMini — Educational Multi-Raft Cluster in Go with benchmarking and hardening passes, validating stability across 20% more edge cases than initial prototype.",
          "Extended RaftMini — Educational Multi-Raft Cluster in Go with benchmarking and hardening passes, validating stability across 28% more edge cases than initial prototype."
        ]
      },
      {
        "name": "Capstone Toolkit — Multi-Raft Groups",
        "description": "Supporting project reinforcing depth in software engineering.",
        "techStack": [
          "C++",
          "Kafka",
          "Multi-Raft Groups",
          "Pebble / RocksDB"
        ],
        "url": "github.com/ebrooks-go/capstone",
        "highlights": [
          "Built modular components emphasizing tests, docs, and reviewable diffs for long-term maintainability.",
          "Benchmarked iterations with peer feedback across multiple review cycles.",
          "Shared write-up cited internally as a practical implementation reference."
        ]
      }
    ],
    "education": [
      {
        "school": "Carnegie Mellon University",
        "degree": "Bachelor of Science (B.S.)",
        "field": "Computer Science",
        "graduationDate": "2017",
        "gpa": "3.92 / 4.0",
        "honors": "University Honors"
      }
    ],
    "certifications": [
      "Certified Kubernetes Administrator (CKA)"
    ]
  },
  {
    "id": "swiggy-senior-fullstack-developer",
    "company": "Swiggy",
    "companyKey": "swiggy",
    "brandColor": "#FC8019",
    "brandTextColor": "#FFFFFF",
    "role": "Lead Full-Stack Platform Engineer",
    "category": "SOFTWARE_ENGINEERING",
    "badge": "PRO",
    "atsScore": 97,
    "experienceLevel": "SENIOR_LEVEL",
    "experienceLevelLabel": "Senior (6–9 yrs)",
    "country": "India",
    "resumeStyle": "Modern Technical",
    "isIllustrative": true,
    "candidate": {
      "name": "Rohan Deshmukh",
      "title": "Lead Full-Stack Platform Engineer",
      "location": "Bengaluru, India",
      "email": "rohan.deshmukh.eng@gmail.com",
      "phone": "+91 98450 12389",
      "linkedin": "linkedin.com/in/rohandeshmukh-fullstack",
      "github": "github.com/rohand-dev"
    },
    "summary": "Lead Full-Stack Engineer with 7+ years of expertise in hyper-growth consumer platforms, micro-services, and real-time dispatch systems. Skilled in React, Node.js, Golang, PostgreSQL, and Redis architectures handling 2M+ daily food delivery orders with sub-second page loads and seamless payment checkouts. Experienced building reliable, observable services with clear API contracts and data integrity guarantees.",
    "skills": [
      {
        "category": "Frontend",
        "skills": [
          "React",
          "Next.js",
          "TypeScript",
          "Redux Toolkit",
          "Tailwind CSS",
          "Progressive Web Apps (PWA)"
        ]
      },
      {
        "category": "Backend & Data",
        "skills": [
          "Node.js",
          "Go",
          "Express.js",
          "PostgreSQL",
          "Redis",
          "Kafka",
          "Elasticsearch"
        ]
      },
      {
        "category": "DevOps & Reliability",
        "skills": [
          "Docker",
          "Kubernetes",
          "AWS (EKS, CloudFront, RDS)",
          "Datadog",
          "CI/CD"
        ]
      }
    ],
    "experience": [
      {
        "company": "Swiggy",
        "title": "Lead Full-Stack Engineer - Consumer Ordering & Checkout",
        "location": "Bengaluru, India",
        "startDate": "2022-01",
        "endDate": "Present",
        "current": true,
        "bullets": [
          "Architected and led the complete rewrite of the high-velocity mobile-web checkout funnel in Next.js and TypeScript, reducing cart abandonment by 11.4%.",
          "Engineered idempotent payment reconciliation webhook processor in Go, processing 450,000 peak transactions during IPL cricket matches without duplicate charges.",
          "Implemented geo-distributed Redis caching layer that decreased restaurant menu lookup latency by 65% for 180,000 merchant partners.",
          "Introduced contract tests and schema registry for public APIs, reducing breaking changes caught in production to near zero.",
          "Migrated critical paths from synchronous RPC chains to event-driven workflows, decoupling 4 downstream consumers.",
          "Designed idempotent payment and webhook processors with reconciliation jobs, eliminating duplicate settlement events."
        ]
      },
      {
        "company": "Razorpay",
        "title": "Senior Software Engineer - Merchant Checkout Experiences",
        "location": "Bengaluru, India",
        "startDate": "2019-06",
        "endDate": "2021-12",
        "bullets": [
          "Engineered drop-in standard checkout iframe SDK loaded across 20,000+ e-commerce merchants in India with zero runtime dependencies.",
          "Optimized mobile web SDK weight to under 38KB, boosting payment conversion on 2G/3G connections by 8.2%.",
          "Optimized batch ETL and backfill jobs with chunked cursors, shortening nightly reconciliation from 4.2h to 2.1h.",
          "Partnered with infra on blue/green deploy hooks and automatic smoke tests gating promotions."
        ]
      }
    ],
    "projects": [
      {
        "name": "HyperCart — Zero-Latency Headless Commerce Engine",
        "description": "Microservices e-commerce boilerplate with transactional payment webhooks and instant search indexing.",
        "techStack": [
          "Next.js",
          "Node.js",
          "PostgreSQL",
          "Redis",
          "Tailwind CSS"
        ],
        "url": "github.com/rohand-dev/hypercart",
        "highlights": [
          "Featured on Product Hunt with 1,200+ stars on GitHub.",
          "Extended HyperCart — Zero-Latency Headless Commerce Engine with benchmarking and hardening passes, validating stability across 20% more edge cases than initial prototype.",
          "Extended HyperCart — Zero-Latency Headless Commerce Engine with benchmarking and hardening passes, validating stability across 28% more edge cases than initial prototype."
        ]
      },
      {
        "name": "Capstone Toolkit — Redis",
        "description": "Supporting project reinforcing depth in software engineering.",
        "techStack": [
          "TypeScript",
          "Express.js",
          "Redis",
          "Node.js"
        ],
        "url": "github.com/rohand-dev/capstone",
        "highlights": [
          "Built modular components emphasizing tests, docs, and reviewable diffs for long-term maintainability.",
          "Benchmarked iterations with peer feedback across multiple review cycles.",
          "Shared write-up cited internally as a practical implementation reference."
        ]
      }
    ],
    "education": [
      {
        "school": "National Institute of Technology (NIT) Karnataka, Surathkal",
        "degree": "B.Tech",
        "field": "Computer Engineering",
        "graduationDate": "2019",
        "gpa": "8.9 / 10"
      }
    ],
    "certifications": [
      "AWS Certified Solutions Architect – Associate"
    ]
  },
  {
    "id": "shopify-senior-rails-platform-engineer",
    "company": "Shopify",
    "companyKey": "shopify",
    "brandColor": "#96BF48",
    "brandTextColor": "#FFFFFF",
    "role": "Staff Ruby on Rails Platform Architect",
    "category": "SOFTWARE_ENGINEERING",
    "badge": "PRO",
    "atsScore": 97,
    "experienceLevel": "STAFF_LEAD",
    "experienceLevelLabel": "Staff / Lead (8+ yrs)",
    "country": "Canada",
    "resumeStyle": "ATS Classic",
    "isIllustrative": true,
    "candidate": {
      "name": "Jessica Boucher",
      "title": "Staff Ruby on Rails Platform Architect",
      "location": "Ottawa, Canada",
      "email": "jessica.boucher.rails@gmail.com",
      "phone": "+1 (613) 492-8172",
      "linkedin": "linkedin.com/in/jessicaboucher-rails",
      "github": "github.com/jboucher-dev"
    },
    "summary": "Staff Software Architect with 9+ years scaling massive Ruby on Rails monoliths, PostgreSQL database shards, and distributed background job processing. Key contributor to high-volume multi-tenant merchant checkout platforms sustaining 100,000+ orders per minute during Black Friday / Cyber Monday flash sales. Experienced building reliable, observable services with clear API contracts and data integrity guarantees.",
    "skills": [
      {
        "category": "Core Stack",
        "skills": [
          "Ruby 3.3",
          "Ruby on Rails",
          "PostgreSQL",
          "Redis",
          "Sidekiq",
          "GraphQL",
          "Packwerk"
        ]
      },
      {
        "category": "Data & Scaling",
        "skills": [
          "Horizontal Database Sharding",
          "Vitess",
          "Kafka",
          "Elasticsearch",
          "ActiveRecord Optimization"
        ]
      },
      {
        "category": "Platform & DevOps",
        "skills": [
          "Docker",
          "Kubernetes",
          "Datadog",
          "RSpec",
          "CI/CD Pipelines"
        ]
      }
    ],
    "experience": [
      {
        "company": "Shopify",
        "title": "Staff Platform Architect - Core Monolith & Scaling",
        "location": "Ottawa, Canada",
        "startDate": "2020-03",
        "endDate": "Present",
        "current": true,
        "bullets": [
          "Led architecture of horizontal PostgreSQL shard distribution for over 2M active merchant databases, cutting cross-shard transaction latency by 34%.",
          "Refactored legacy Sidekiq background execution clusters into isolated priority pools, handling over 1.4B daily background jobs with zero backlog overflow.",
          "Introduced modular domain architecture with Packwerk, decoupling order processing from inventory logic and enabling 40 independent squads to deploy simultaneously.",
          "Mentored engineers on concurrency primitives and load testing, increasing confidence in peak-season capacity plans.",
          "Designed idempotent payment and webhook processors with reconciliation jobs, eliminating duplicate settlement events.",
          "Introduced contract tests and schema registry for public APIs, reducing breaking changes caught in production to near zero."
        ]
      },
      {
        "company": "FreshBooks",
        "title": "Senior Backend Developer - Invoicing & Payments",
        "location": "Toronto, Canada",
        "startDate": "2016-10",
        "endDate": "2020-02",
        "bullets": [
          "Designed recurring invoice generation engine in Rails processing $85M monthly billings with automated tax calculations across 30+ jurisdictions.",
          "Reduced p95 API response time from 420ms to 95ms through eager loading fixes, database index tuning, and fragment caching in Redis.",
          "Hardened input validation and rate limits on public endpoints, mitigating abuse spikes during promotional events.",
          "Partnered with infra on blue/green deploy hooks and automatic smoke tests gating promotions."
        ]
      }
    ],
    "projects": [
      {
        "name": "ShardWeaver — Zero-Downtime Sharding Gem for ActiveRecord",
        "description": "Open-source Ruby gem providing transparent shard-routing and tenant isolation for enterprise Rails apps.",
        "techStack": [
          "Ruby",
          "Rails",
          "PostgreSQL",
          "RSpec"
        ],
        "url": "github.com/jboucher-dev/shardweaver",
        "highlights": [
          "Adopted by 15 enterprise SaaS applications.",
          "Extended ShardWeaver — Zero-Downtime Sharding Gem for ActiveRecord with benchmarking and hardening passes, validating stability across 20% more edge cases than initial prototype.",
          "Extended ShardWeaver — Zero-Downtime Sharding Gem for ActiveRecord with benchmarking and hardening passes, validating stability across 28% more edge cases than initial prototype."
        ]
      },
      {
        "name": "Capstone Toolkit — Vitess",
        "description": "Supporting project reinforcing depth in software engineering.",
        "techStack": [
          "PostgreSQL",
          "Redis",
          "Vitess",
          "Packwerk"
        ],
        "url": "github.com/jboucher-dev/capstone",
        "highlights": [
          "Built modular components emphasizing tests, docs, and reviewable diffs for long-term maintainability.",
          "Benchmarked iterations with peer feedback across multiple review cycles.",
          "Shared write-up cited internally as a practical implementation reference."
        ]
      }
    ],
    "education": [
      {
        "school": "University of Waterloo",
        "degree": "Bachelor of Mathematics (B.Math)",
        "field": "Computer Science",
        "graduationDate": "2016",
        "honors": "Dean’s Honours List"
      }
    ],
    "certifications": [
      "AWS Certified Developer – Associate"
    ]
  },
  {
    "id": "grab-senior-rust-systems-engineer",
    "company": "Grab",
    "companyKey": "grab",
    "brandColor": "#00B14F",
    "brandTextColor": "#FFFFFF",
    "role": "Senior Rust Systems & High-Throughput Networking Engineer",
    "category": "SOFTWARE_ENGINEERING",
    "badge": "PRO",
    "atsScore": 98,
    "experienceLevel": "SENIOR_LEVEL",
    "experienceLevelLabel": "Senior (6–9 yrs)",
    "country": "Singapore",
    "resumeStyle": "Modern Technical",
    "isIllustrative": true,
    "candidate": {
      "name": "Kenneth Tan",
      "title": "Senior Rust Systems & High-Throughput Networking Engineer",
      "location": "Singapore",
      "email": "kenneth.tan.systems@gmail.com",
      "phone": "+65 9123 4567",
      "linkedin": "linkedin.com/in/kennethtan-systems",
      "github": "github.com/ktan-rust"
    },
    "summary": "Senior Systems Software Engineer with 7+ years developing ultra-low latency networking daemons, WebAssembly execution runtimes, and distributed dispatch engines in Rust and C++. Expert in Tokio async runtime tuning, io_uring asynchronous I/O, and zero-allocation network serialization in hyper-scale Southeast Asian ride-hailing and logistics networks. Experienced building reliable, observable services with clear API contracts and data integrity guarantees.",
    "skills": [
      {
        "category": "Systems Programming",
        "skills": [
          "Rust",
          "C++20",
          "Linux io_uring",
          "Tokio Async",
          "eBPF / XDP",
          "WebAssembly (Wasmtime)"
        ]
      },
      {
        "category": "Networking & Protocols",
        "skills": [
          "gRPC / Protobuf",
          "QUIC",
          "TCP/IP Optimization",
          "WebSocket Servers",
          "Zero-Copy Serialization"
        ]
      },
      {
        "category": "Infrastructure",
        "skills": [
          "Kubernetes",
          "Docker",
          "Prometheus",
          "Grafana",
          "Git",
          "Linux Kernel Tracing"
        ]
      }
    ],
    "experience": [
      {
        "company": "Grab",
        "title": "Senior Systems Engineer - Real-Time Driver Dispatch Engine",
        "location": "Singapore",
        "startDate": "2021-09",
        "endDate": "Present",
        "current": true,
        "bullets": [
          "Engineered asynchronous driver-location ingestion microservice in Rust with Tokio and io_uring, handling 1.2M ping events/sec with median processing latency strictly under 4.5ms.",
          "Reduced memory consumption by 68% compared to predecessor Go implementation while eliminating garbage-collection pause spikes during high-concurrency peak hours.",
          "Designed high-throughput spatial indexing KD-Tree in Rust for dynamic passenger-to-driver proximity matching across 8 Southeast Asian metropolitan markets.",
          "Mentored engineers on concurrency primitives and load testing, increasing confidence in peak-season capacity plans.",
          "Led incident retrospectives and SLO dashboards for tier-1 services, improving error-budget compliance from 78% to 96%.",
          "Migrated critical paths from synchronous RPC chains to event-driven workflows, decoupling 4 downstream consumers."
        ]
      },
      {
        "company": "Shopee",
        "title": "Systems Software Engineer - Core Messaging Infrastructure",
        "location": "Singapore",
        "startDate": "2019-01",
        "endDate": "2021-08",
        "bullets": [
          "Built high-performance TCP gateway in Rust terminating 350,000 persistent shopper chat connections with zero connection drops during 11.11 shopping mega-sales.",
          "Optimized packet serialization using custom zero-copy binary format, reducing network egress bandwidth costs by $120,000 annually.",
          "Built admin workflows and audit trails for privileged operations, satisfying internal compliance sampling requirements.",
          "Partnered with infra on blue/green deploy hooks and automatic smoke tests gating promotions."
        ]
      }
    ],
    "projects": [
      {
        "name": "FastRing — Asynchronous io_uring Network Stack in Rust",
        "description": "Zero-copy TCP echo and proxy engine leveraging Linux 6.x io_uring syscalls for ultra-fast networking.",
        "techStack": [
          "Rust",
          "Linux Kernel",
          "io_uring",
          "Tokio"
        ],
        "url": "github.com/ktan-rust/fastring",
        "highlights": [
          "Achieved 2.8M requests/sec on single 16-core bare-metal instance.",
          "Extended FastRing — Asynchronous io_uring Network Stack in Rust with benchmarking and hardening passes, validating stability across 20% more edge cases than initial prototype.",
          "Extended FastRing — Asynchronous io_uring Network Stack in Rust with benchmarking and hardening passes, validating stability across 28% more edge cases than initial prototype."
        ]
      },
      {
        "name": "Capstone Toolkit — Kubernetes",
        "description": "Supporting project reinforcing depth in software engineering.",
        "techStack": [
          "Tokio Async",
          "Rust",
          "Kubernetes",
          "Git"
        ],
        "url": "github.com/ktan-rust/capstone",
        "highlights": [
          "Built modular components emphasizing tests, docs, and reviewable diffs for long-term maintainability.",
          "Benchmarked iterations with peer feedback across multiple review cycles.",
          "Shared write-up cited internally as a practical implementation reference."
        ]
      }
    ],
    "education": [
      {
        "school": "National University of Singapore (NUS)",
        "degree": "Bachelor of Computing (Honours)",
        "field": "Computer Science",
        "graduationDate": "2019",
        "gpa": "4.82 / 5.0 (First Class Honours)"
      }
    ],
    "certifications": [
      "Linux Foundation Certified System Administrator (LFCS)"
    ]
  },
  {
    "id": "twosigma-lead-data-platform-engineer",
    "company": "Two Sigma",
    "companyKey": "twosigma",
    "brandColor": "#002B49",
    "brandTextColor": "#FFFFFF",
    "role": "Staff Data Platform & Real-Time Streaming Engineer (Spark & Flink)",
    "category": "DATA_AI",
    "badge": "PRO",
    "atsScore": 98,
    "experienceLevel": "STAFF_LEAD",
    "experienceLevelLabel": "Staff / Lead (8+ yrs)",
    "country": "United States",
    "resumeStyle": "Modern Technical",
    "isIllustrative": true,
    "candidate": {
      "name": "Vincent Zhao",
      "title": "Staff Data Platform & Real-Time Streaming Engineer",
      "location": "New York, NY",
      "email": "vincent.zhao.data@gmail.com",
      "phone": "+1 (212) 678-9012",
      "linkedin": "linkedin.com/in/vincentzhao-data",
      "github": "github.com/vzhao-streaming"
    },
    "summary": "Staff Data Platform Engineer with 8+ years architecting multi-petabyte real-time event streaming and analytical query fabrics for quantitative trading. Expert in Apache Flink stateful stream processing, Apache Spark optimization, Iceberg / Parquet lakehouse storage, and low-latency market tick data processing. Trusted steward of governed data platforms where freshness, cost, and correctness tradeoffs are explicit.",
    "skills": [
      {
        "category": "Data & Stream Processing",
        "skills": [
          "Apache Flink",
          "Apache Spark",
          "Kafka",
          "Apache Iceberg",
          "ClickHouse",
          "Trino",
          "DuckDB"
        ]
      },
      {
        "category": "Languages & Storage",
        "skills": [
          "Java",
          "Scala",
          "Python",
          "SQL",
          "C++",
          "Parquet",
          "HDFS",
          "Ceph / S3"
        ]
      },
      {
        "category": "Infrastructure & Ops",
        "skills": [
          "Kubernetes",
          "Airflow",
          "dbt",
          "Prometheus",
          "Grafana",
          "Terraform"
        ]
      }
    ],
    "experience": [
      {
        "company": "Two Sigma",
        "title": "Staff Data Infrastructure Engineer - Market Data Systems",
        "location": "New York, NY",
        "startDate": "2021-04",
        "endDate": "Present",
        "current": true,
        "bullets": [
          "Architected real-time tick-to-trade market data ingestion pipeline in Apache Flink handling 4.5M financial events/sec with sub-10ms event-time processing guarantees.",
          "Migrated 18 petabytes of quantitative backtesting data to Apache Iceberg format, reducing analytical cold-query latency by 64% and cloud storage costs by $450K annually.",
          "Engineered custom off-heap memory management plugins in Java for Spark executors, eliminating GC pauses that previously caused cluster job retries.",
          "Rolled out streaming exactly-once semantics for revenue-critical facts, eliminating duplicate event backfills.",
          "Implemented row-level security and lineage metadata, passing enterprise data governance audits without exceptions.",
          "Tuned shuffle partitions and file compaction jobs, reducing daily warehouse spend by $42K while holding query latencies flat."
        ]
      },
      {
        "company": "Bloomberg LP",
        "title": "Senior Data Infrastructure Engineer - Analytics Platform",
        "location": "New York, NY",
        "startDate": "2017-06",
        "endDate": "2021-03",
        "bullets": [
          "Built high-throughput distributed timeseries store indexing 280,000 global financial equities with millisecond historical chart retrieval.",
          "Automated data quality anomaly detection across 12,000 incoming vendor feeds using statistical outlier analysis in Python and Spark.",
          "Built observability for SLA-missed partitions with auto-remediation runbooks.",
          "Migrated legacy Hadoop workloads to cloud-native Spark with automated regression diffing on outputs."
        ]
      }
    ],
    "projects": [
      {
        "name": "StreamLake — Zero-Lag Streaming Connector for Apache Iceberg",
        "description": "Flink Sink optimizing small-file commit intervals and compaction for financial lakehouse tables.",
        "techStack": [
          "Java",
          "Apache Flink",
          "Apache Iceberg",
          "Kafka"
        ],
        "url": "github.com/vzhao-streaming/streamlake",
        "highlights": [
          "Eliminated 99% of small-file metadata bloat in high-throughput lakehouses.",
          "Extended StreamLake — Zero-Lag Streaming Connector for Apache Iceberg with benchmarking and hardening passes, validating stability across 20% more edge cases than initial prototype.",
          "Extended StreamLake — Zero-Lag Streaming Connector for Apache Iceberg with benchmarking and hardening passes, validating stability across 28% more edge cases than initial prototype."
        ]
      },
      {
        "name": "Capstone Toolkit — Parquet",
        "description": "Supporting project reinforcing depth in data ai.",
        "techStack": [
          "Kubernetes",
          "Kafka",
          "Parquet",
          "Java"
        ],
        "url": "github.com/vzhao-streaming/capstone",
        "highlights": [
          "Built modular components emphasizing tests, docs, and reviewable diffs for long-term maintainability.",
          "Benchmarked iterations with peer feedback across multiple review cycles.",
          "Shared write-up cited internally as a practical implementation reference."
        ]
      }
    ],
    "education": [
      {
        "school": "Columbia University",
        "degree": "Master of Science (M.S.)",
        "field": "Computer Science",
        "graduationDate": "2017",
        "gpa": "3.91 / 4.0"
      }
    ],
    "certifications": [
      "Databricks Certified Apache Spark Developer",
      "Confluent Certified Kafka Administrator"
    ]
  },
  {
    "id": "redhat-staff-kubernetes-platform-engineer",
    "company": "Red Hat",
    "companyKey": "redhat",
    "brandColor": "#EE0000",
    "brandTextColor": "#FFFFFF",
    "role": "Staff Kubernetes Platform & Cloud Native Architect",
    "category": "DEVOPS_CLOUD",
    "badge": "PRO",
    "atsScore": 98,
    "experienceLevel": "STAFF_LEAD",
    "experienceLevelLabel": "Staff / Lead (8+ yrs)",
    "country": "Germany",
    "resumeStyle": "Modern Technical",
    "isIllustrative": true,
    "candidate": {
      "name": "Maximilian Weber",
      "title": "Staff Kubernetes Platform & Cloud Native Architect",
      "location": "Frankfurt, Germany",
      "email": "m.weber.cloud@gmail.com",
      "phone": "+49 69 4512 8901",
      "linkedin": "linkedin.com/in/maximilianweber-k8s",
      "github": "github.com/mweber-k8s"
    },
    "summary": "Staff Cloud Native Platform Architect with 8+ years designing multi-tenant Kubernetes and OpenShift infrastructure clusters spanning 20,000+ nodes. Expert in GitOps workflows, Cilium eBPF service meshes, Linux cgroup v2 resource partitioning, and zero-downtime bare-metal bare-metal cloud migrations. Champions reliability culture via SLOs, automation, and blameless learning in high-change environments.",
    "skills": [
      {
        "category": "Kubernetes & Containers",
        "skills": [
          "Kubernetes (K8s)",
          "Red Hat OpenShift",
          "Docker",
          "containerd",
          "Cilium (eBPF)",
          "Istio",
          "Envoy"
        ]
      },
      {
        "category": "GitOps & Automation",
        "skills": [
          "ArgoCD",
          "Flux",
          "Helm",
          "Terraform",
          "Ansible",
          "GitHub Actions",
          "Tekton"
        ]
      },
      {
        "category": "Observability & Linux",
        "skills": [
          "Prometheus",
          "Thanos",
          "Grafana",
          "Loki",
          "Linux Kernel Internals",
          "eBPF",
          "Cgroups v2"
        ]
      }
    ],
    "experience": [
      {
        "company": "Red Hat",
        "title": "Staff Cloud Platform Architect - OpenShift Core Platform",
        "location": "Frankfurt, Germany",
        "startDate": "2021-07",
        "endDate": "Present",
        "current": true,
        "bullets": [
          "Architected hybrid-cloud Kubernetes federation managing 240 clusters across AWS, Azure, and European sovereign bare-metal datacenters with automated failover.",
          "Replaced legacy iptables kube-proxy networking with Cilium eBPF, reducing cross-node network latency by 41% and eliminating connection tracking exhaustion.",
          "Engineered declarative GitOps pipeline with ArgoCD for 2,500 internal developers, reducing change lead time from 4 days to 14 minutes.",
          "Built internal developer portal templates for service scaffolding, observability, and on-call ownership.",
          "Defined golden signals and SLO error budgets per service tier, aligning product risk appetite with release cadence.",
          "Automated failover runbooks and game days, proving RTO under 12 minutes for regional control-plane outages."
        ]
      },
      {
        "company": "SAP",
        "title": "Senior Cloud Infrastructure Engineer - Enterprise Cloud",
        "location": "Walldorf, Germany",
        "startDate": "2017-09",
        "endDate": "2021-06",
        "bullets": [
          "Automated Kubernetes cluster provisioning across 18 global regions using Terraform and custom Go operators, cutting infrastructure setup time by 85%.",
          "Cut cluster cloud spend by $1.8M annually by implementing Karpenter dynamic node autoscaling and spot instance interruption handlers.",
          "Implemented capacity forecasts using seasonality models, preventing 2 major holiday overload incidents.",
          "Standardized incident command roles and comms templates, improving stakeholder satisfaction scores post-sev."
        ]
      }
    ],
    "projects": [
      {
        "name": "KubeMesh-Audit — eBPF-Powered Kubernetes Network Auditor",
        "description": "Lightweight daemonset detecting anomalous cross-pod network flows and misconfigured network policies in real time.",
        "techStack": [
          "Go",
          "eBPF",
          "Cilium",
          "Kubernetes"
        ],
        "url": "github.com/mweber-k8s/kubemesh-audit",
        "highlights": [
          "Adopted by CNCF ecosystem contributors.",
          "Extended KubeMesh-Audit — eBPF-Powered Kubernetes Network Auditor with benchmarking and hardening passes, validating stability across 20% more edge cases than initial prototype.",
          "Extended KubeMesh-Audit — eBPF-Powered Kubernetes Network Auditor with benchmarking and hardening passes, validating stability across 28% more edge cases than initial prototype."
        ]
      },
      {
        "name": "Capstone Toolkit — Kubernetes (K8s)",
        "description": "Supporting project reinforcing depth in devops cloud.",
        "techStack": [
          "Cilium (eBPF)",
          "Envoy",
          "Kubernetes (K8s)",
          "Grafana"
        ],
        "url": "github.com/mweber-k8s/capstone",
        "highlights": [
          "Built modular components emphasizing tests, docs, and reviewable diffs for long-term maintainability.",
          "Benchmarked iterations with peer feedback across multiple review cycles.",
          "Shared write-up cited internally as a practical implementation reference."
        ]
      }
    ],
    "education": [
      {
        "school": "Karlsruhe Institute of Technology (KIT)",
        "degree": "M.Sc.",
        "field": "Informatics",
        "graduationDate": "2017",
        "gpa": "1.3 (Highest Honors)"
      }
    ],
    "certifications": [
      "Certified Kubernetes Administrator (CKA)",
      "Certified Kubernetes Security Specialist (CKS)",
      "Red Hat Certified Architect (RHCA)"
    ]
  },
  {
    "id": "hashicorp-senior-cloud-infrastructure-engineer",
    "company": "HashiCorp",
    "companyKey": "hashicorp",
    "brandColor": "#000000",
    "brandTextColor": "#FFFFFF",
    "role": "Senior Cloud Infrastructure & Terraform Architect",
    "category": "DEVOPS_CLOUD",
    "badge": "PRO",
    "atsScore": 98,
    "experienceLevel": "SENIOR_LEVEL",
    "experienceLevelLabel": "Senior (6–9 yrs)",
    "country": "United States",
    "resumeStyle": "ATS Classic",
    "isIllustrative": true,
    "candidate": {
      "name": "Chloe Patel",
      "title": "Senior Cloud Infrastructure & Terraform Architect",
      "location": "Seattle, WA",
      "email": "chloe.patel.infra@gmail.com",
      "phone": "+1 (206) 890-4521",
      "linkedin": "linkedin.com/in/chloepatel-infra",
      "github": "github.com/cpatel-infra"
    },
    "summary": "Senior Cloud Infrastructure Engineer with 7+ years authoring enterprise Terraform modules, AWS multi-account landing zones, and automated disaster recovery architectures. Expert in Infrastructure as Code (IaC) governance, HashiCorp Vault secrets management, and zero-trust IAM privilege boundaries. Champions reliability culture via SLOs, automation, and blameless learning in high-change environments.",
    "skills": [
      {
        "category": "Infrastructure as Code",
        "skills": [
          "Terraform",
          "Terragrunt",
          "OpenTofu",
          "HashiCorp Vault",
          "Consul",
          "Packer"
        ]
      },
      {
        "category": "Cloud Platforms",
        "skills": [
          "AWS (Control Tower, EKS, RDS, Transit Gateway)",
          "GCP",
          "Azure",
          "Linux"
        ]
      },
      {
        "category": "CI/CD & Governance",
        "skills": [
          "GitHub Actions",
          "Checkov",
          "tflint",
          "OPA / Rego",
          "Datadog",
          "Cost Optimization"
        ]
      }
    ],
    "experience": [
      {
        "company": "HashiCorp",
        "title": "Senior Infrastructure Solutions Architect",
        "location": "Seattle, WA",
        "startDate": "2021-08",
        "endDate": "Present",
        "current": true,
        "bullets": [
          "Engineered reusable Terraform module ecosystem governing 350 AWS enterprise accounts for 1,200 developers, standardizing compliance and tag enforcement via OPA/Rego.",
          "Consolidated dynamic secrets management using HashiCorp Vault with automated 24-hour database credential rotation, eradicating static credential leaks across 80 microservices.",
          "Reduced monthly cloud infrastructure costs by 26% ($820,000/yr) through automated FinOps policies and underutilized compute rightsizing.",
          "Defined golden signals and SLO error budgets per service tier, aligning product risk appetite with release cadence.",
          "Automated failover runbooks and game days, proving RTO under 12 minutes for regional control-plane outages.",
          "Built internal developer portal templates for service scaffolding, observability, and on-call ownership."
        ]
      },
      {
        "company": "Expedia Group",
        "title": "Cloud DevOps Engineer - Travel Platform Services",
        "location": "Seattle, WA",
        "startDate": "2018-06",
        "endDate": "2021-07",
        "bullets": [
          "Migrated legacy on-prem reservation databases to AWS Aurora Multi-Master with automated regional failover in under 22 seconds.",
          "Designed blue/green continuous delivery pipelines with Spinnaker and GitHub Actions deploying over 45 service updates daily with zero customer downtime.",
          "Deployed synthetic probes and canaries for edge APIs, improving detection lead time by 6 minutes median.",
          "Migrated config management to GitOps with audited promotion paths across staging and production."
        ]
      }
    ],
    "projects": [
      {
        "name": "TfGuard — Automated Policy-as-Code Linter for Terraform",
        "description": "Static analysis CLI verifying AWS security baselines and encryption invariants prior to plan execution.",
        "techStack": [
          "Go",
          "Terraform",
          "OPA",
          "AWS SDK"
        ],
        "url": "github.com/cpatel-infra/tfguard",
        "highlights": [
          "Over 1,800 stars on GitHub and integrated into enterprise CI pipelines.",
          "Extended TfGuard — Automated Policy-as-Code Linter for Terraform with benchmarking and hardening passes, validating stability across 20% more edge cases than initial prototype.",
          "Extended TfGuard — Automated Policy-as-Code Linter for Terraform with benchmarking and hardening passes, validating stability across 28% more edge cases than initial prototype."
        ]
      },
      {
        "name": "Capstone Toolkit — Consul",
        "description": "Supporting project reinforcing depth in devops cloud.",
        "techStack": [
          "tflint",
          "Packer",
          "Consul",
          "Cost Optimization"
        ],
        "url": "github.com/cpatel-infra/capstone",
        "highlights": [
          "Built modular components emphasizing tests, docs, and reviewable diffs for long-term maintainability.",
          "Benchmarked iterations with peer feedback across multiple review cycles.",
          "Shared write-up cited internally as a practical implementation reference."
        ]
      }
    ],
    "education": [
      {
        "school": "University of Washington",
        "degree": "Bachelor of Science (B.S.)",
        "field": "Informatics & Software Engineering",
        "graduationDate": "2018",
        "gpa": "3.85 / 4.0"
      }
    ],
    "certifications": [
      "HashiCorp Certified: Terraform Associate (003)",
      "AWS Certified Solutions Architect – Professional"
    ]
  },
  {
    "id": "datadog-lead-sre-observability",
    "company": "Datadog",
    "companyKey": "datadog",
    "brandColor": "#632CA6",
    "brandTextColor": "#FFFFFF",
    "role": "Staff Observability & Reliability Architect",
    "category": "DEVOPS_CLOUD",
    "badge": "PRO",
    "atsScore": 99,
    "experienceLevel": "STAFF_LEAD",
    "experienceLevelLabel": "Staff / Lead (8+ yrs)",
    "country": "United Kingdom",
    "resumeStyle": "Modern Technical",
    "isIllustrative": true,
    "candidate": {
      "name": "Callum Davies",
      "title": "Staff Observability & Reliability Architect",
      "location": "Edinburgh, United Kingdom",
      "email": "callum.davies.sre@gmail.com",
      "phone": "+44 131 496 0872",
      "linkedin": "linkedin.com/in/callumdavies-sre",
      "github": "github.com/cdavies-obs"
    },
    "summary": "Staff Site Reliability Engineer with 9+ years architecting enterprise distributed tracing, real-time metrics telemetry, and high-availability operational frameworks. Core champion of OpenTelemetry standards, automated incident response runbooks, and error budget policy governance maintaining 99.995% service uptime across critical cloud platforms. Champions reliability culture via SLOs, automation, and blameless learning in high-change environments.",
    "skills": [
      {
        "category": "Observability & Metrics",
        "skills": [
          "OpenTelemetry (OTel)",
          "Datadog",
          "Prometheus",
          "Grafana",
          "Jaeger",
          "Vector",
          "Elasticsearch"
        ]
      },
      {
        "category": "Reliability Engineering",
        "skills": [
          "SLOs / SLIs / SLAs",
          "Error Budgets",
          "Chaos Engineering (Chaos Mesh)",
          "Incident Command",
          "Post-Mortem Root Cause Analysis"
        ]
      },
      {
        "category": "Cloud & Systems",
        "skills": [
          "Kubernetes",
          "AWS",
          "Go",
          "Python",
          "Terraform",
          "Linux Performance Tuning"
        ]
      }
    ],
    "experience": [
      {
        "company": "Datadog",
        "title": "Staff Reliability Engineer - Distributed Tracing Platform",
        "location": "Edinburgh, United Kingdom",
        "startDate": "2021-03",
        "endDate": "Present",
        "current": true,
        "bullets": [
          "Architected global OpenTelemetry trace collection pipeline processing 3.8B spans/minute, cutting ingestion processing latency by 32% while optimizing storage compression ratios.",
          "Formulated organization-wide SLO and Error Budget framework, tying automated deployment halts to SLA burn rates and decreasing high-severity incidents by 44%.",
          "Spearheaded chaos engineering gamedays simulating regional AWS network partitions, uncovering and hardening 6 critical cascading failure vulnerabilities.",
          "Rolled out progressive delivery with automated metric-based rollbacks, cutting customer-impacting deploy failures by 55%.",
          "Built internal developer portal templates for service scaffolding, observability, and on-call ownership.",
          "Partnered with finance on FinOps dashboards, rightsizing clusters to save $280K/year without SLO regressions."
        ]
      },
      {
        "company": "Skyscanner",
        "title": "Senior SRE - Flight Search Engine Reliability",
        "location": "Edinburgh, United Kingdom",
        "startDate": "2017-04",
        "endDate": "2021-02",
        "bullets": [
          "Maintained 99.99% availability for flight search gateway handling 25,000 queries per second across peak holiday booking seasons.",
          "Reduced Mean Time to Detect (MTTD) from 18 minutes to 90 seconds by implementing multi-window multi-burn-rate alerting algorithms.",
          "Deployed synthetic probes and canaries for edge APIs, improving detection lead time by 6 minutes median.",
          "Standardized incident command roles and comms templates, improving stakeholder satisfaction scores post-sev."
        ]
      }
    ],
    "projects": [
      {
        "name": "BurnRateAlert — Adaptive SLO Burn-Rate Calculator",
        "description": "Open-source Prometheus rules generator dynamically generating multi-tier SLO alerting rules conforming to Google SRE principles.",
        "techStack": [
          "Go",
          "Prometheus",
          "Kubernetes"
        ],
        "url": "github.com/cdavies-obs/burnratealert",
        "highlights": [
          "Adopted by over 80 production engineering teams globally.",
          "Extended BurnRateAlert — Adaptive SLO Burn-Rate Calculator with benchmarking and hardening passes, validating stability across 20% more edge cases than initial prototype.",
          "Extended BurnRateAlert — Adaptive SLO Burn-Rate Calculator with benchmarking and hardening passes, validating stability across 28% more edge cases than initial prototype."
        ]
      },
      {
        "name": "Capstone Toolkit — Kubernetes",
        "description": "Supporting project reinforcing depth in devops cloud.",
        "techStack": [
          "Error Budgets",
          "Incident Command",
          "Kubernetes",
          "Vector"
        ],
        "url": "github.com/cdavies-obs/capstone",
        "highlights": [
          "Built modular components emphasizing tests, docs, and reviewable diffs for long-term maintainability.",
          "Benchmarked iterations with peer feedback across multiple review cycles.",
          "Shared write-up cited internally as a practical implementation reference."
        ]
      }
    ],
    "education": [
      {
        "school": "University of Edinburgh",
        "degree": "B.Sc. (Hons)",
        "field": "Computer Science and Artificial Intelligence",
        "graduationDate": "2017",
        "honors": "First Class Honours"
      }
    ],
    "certifications": [
      "Certified Kubernetes Administrator (CKA)",
      "AWS Certified DevOps Engineer – Professional"
    ]
  },
  {
    "id": "razorpay-senior-devsecops-engineer",
    "company": "Razorpay",
    "companyKey": "razorpay",
    "brandColor": "#0C2340",
    "brandTextColor": "#FFFFFF",
    "role": "Lead DevSecOps & Zero-Trust Cloud Engineer",
    "category": "DEVOPS_CLOUD",
    "badge": "PRO",
    "atsScore": 97,
    "experienceLevel": "SENIOR_LEVEL",
    "experienceLevelLabel": "Senior (6–9 yrs)",
    "country": "India",
    "resumeStyle": "ATS Classic",
    "isIllustrative": true,
    "candidate": {
      "name": "Aditya Kulkarni",
      "title": "Lead DevSecOps & Zero-Trust Cloud Engineer",
      "location": "Bengaluru, India",
      "email": "aditya.kulkarni.secops@gmail.com",
      "phone": "+91 97310 98234",
      "linkedin": "linkedin.com/in/adityakulkarni-devsecops",
      "github": "github.com/akulkarni-secops"
    },
    "summary": "Lead DevSecOps Engineer with 7+ years establishing PCI-DSS certified cloud architectures, automated vulnerability remediation, and container security guardrails. Expert in Kubernetes cluster hardening, Falco runtime anomaly detection, automated software bill of materials (SBOM) scanning, and cloud compliance across 100M+ financial transactions. Experienced building reliable, observable services with clear API contracts and data integrity guarantees.",
    "skills": [
      {
        "category": "Security & Compliance",
        "skills": [
          "PCI-DSS 4.0",
          "Trivy / Grype (SBOM)",
          "Falco Runtime Security",
          "Kyverno / OPA",
          "Vault",
          "Cosign (Supply Chain)"
        ]
      },
      {
        "category": "DevOps & Cloud",
        "skills": [
          "Kubernetes (EKS)",
          "AWS Security (GuardDuty, IAM, KMS)",
          "Terraform",
          "GitHub Actions",
          "Docker"
        ]
      },
      {
        "category": "Scripting & Monitoring",
        "skills": [
          "Python",
          "Bash",
          "Go",
          "Datadog",
          "Prometheus",
          "ELK Stack"
        ]
      }
    ],
    "experience": [
      {
        "company": "Razorpay",
        "title": "Lead DevSecOps Engineer - Cloud Security & Governance",
        "location": "Bengaluru, India",
        "startDate": "2021-11",
        "endDate": "Present",
        "current": true,
        "bullets": [
          "Led end-to-end technical remediation for PCI-DSS Level 1 compliance migration across 220 AWS accounts with zero audit non-conformities.",
          "Deployed automated supply chain security pipeline signing 100% of container images using Cosign and verifying SBOM signatures before Kubernetes cluster admission.",
          "Configured Falco runtime threat detection engine with automated webhook mitigations, detecting and isolating malicious container shells within 3.2 seconds.",
          "Migrated critical paths from synchronous RPC chains to event-driven workflows, decoupling 4 downstream consumers.",
          "Introduced contract tests and schema registry for public APIs, reducing breaking changes caught in production to near zero.",
          "Led incident retrospectives and SLO dashboards for tier-1 services, improving error-budget compliance from 78% to 96%."
        ]
      },
      {
        "company": "Flipkart",
        "title": "Senior DevOps & Security Engineer",
        "location": "Bengaluru, India",
        "startDate": "2018-08",
        "endDate": "2021-10",
        "bullets": [
          "Built shift-left security scanning in GitHub Actions testing 400+ microservices daily, catching high-severity CVEs prior to pre-production deployment.",
          "Hardened multi-tenant Kubernetes clusters with Kyverno pod security standards, eliminating privileged containers and insecure host mounts.",
          "Partnered with infra on blue/green deploy hooks and automatic smoke tests gating promotions.",
          "Optimized batch ETL and backfill jobs with chunked cursors, shortening nightly reconciliation from 4.2h to 2.1h."
        ]
      }
    ],
    "projects": [
      {
        "name": "KubeAuditShield — Automated CIS Kubernetes Benchmark Auditor",
        "description": "Lightweight scanner evaluating live EKS and GKE clusters against CIS Benchmark v1.8 standards with HTML reporting.",
        "techStack": [
          "Python",
          "Kubernetes API",
          "Docker"
        ],
        "url": "github.com/akulkarni-secops/kubeauditshield",
        "highlights": [
          "Used by over 500 security engineers across Indian tech startups.",
          "Extended KubeAuditShield — Automated CIS Kubernetes Benchmark Auditor with benchmarking and hardening passes, validating stability across 20% more edge cases than initial prototype.",
          "Extended KubeAuditShield — Automated CIS Kubernetes Benchmark Auditor with benchmarking and hardening passes, validating stability across 28% more edge cases than initial prototype."
        ]
      },
      {
        "name": "Capstone Toolkit — Terraform",
        "description": "Supporting project reinforcing depth in devops cloud.",
        "techStack": [
          "Prometheus",
          "Python",
          "Terraform",
          "Cosign (Supply Chain)"
        ],
        "url": "github.com/akulkarni-secops/capstone",
        "highlights": [
          "Built modular components emphasizing tests, docs, and reviewable diffs for long-term maintainability.",
          "Benchmarked iterations with peer feedback across multiple review cycles.",
          "Shared write-up cited internally as a practical implementation reference."
        ]
      }
    ],
    "education": [
      {
        "school": "PES University, Bengaluru",
        "degree": "Bachelor of Technology (B.Tech)",
        "field": "Computer Science and Engineering",
        "graduationDate": "2018",
        "gpa": "8.8 / 10"
      }
    ],
    "certifications": [
      "Certified Kubernetes Security Specialist (CKS)",
      "AWS Certified Security – Specialty"
    ]
  },
  {
    "id": "atlassian-vp-enterprise-product-management",
    "company": "Atlassian",
    "companyKey": "atlassian",
    "brandColor": "#0052CC",
    "brandTextColor": "#FFFFFF",
    "role": "VP of Enterprise Product Management",
    "category": "PRODUCT_BUSINESS",
    "badge": "PRO",
    "atsScore": 99,
    "experienceLevel": "EXECUTIVE",
    "experienceLevelLabel": "Executive (10+ yrs)",
    "country": "United States",
    "resumeStyle": "Executive Clean",
    "isIllustrative": true,
    "candidate": {
      "name": "Samantha Sterling",
      "title": "VP of Enterprise Product Management",
      "location": "San Francisco, CA",
      "email": "samantha.sterling.pm@gmail.com",
      "phone": "+1 (415) 672-9104",
      "linkedin": "linkedin.com/in/samanthasterling-pm"
    },
    "summary": "Executive Product Leader with 12+ years driving B2B SaaS product portfolios from early product-market fit to $250M+ annual recurring revenue (ARR). Track record building and mentoring global cross-functional product organizations of 60+ PMs, designers, and engineering leaders across enterprise collaboration, AI automation, and cloud migrations. Partners with engineering and GTM on pragmatic security programs that accelerate—not block—shipping.",
    "skills": [
      {
        "category": "Product Strategy & Leadership",
        "skills": [
          "Enterprise SaaS Product Strategy",
          "P&L Management ($250M+ ARR)",
          "Executive Stakeholder Management",
          "M&A Product Integration",
          "OKRs"
        ]
      },
      {
        "category": "Methodologies & Discovery",
        "skills": [
          "Customer Discovery & User Interviews",
          "Product-Led Growth (PLG)",
          "Pricing & Packaging Strategy",
          "Continuous Discovery"
        ]
      },
      {
        "category": "Analytics & Tools",
        "skills": [
          "Mixpanel",
          "Amplitude",
          "Jira",
          "Confluence",
          "SQL",
          "Looker",
          "Figma"
        ]
      }
    ],
    "experience": [
      {
        "company": "Atlassian",
        "title": "Vice President of Product Management - Jira Enterprise Cloud",
        "location": "San Francisco, CA",
        "startDate": "2021-01",
        "endDate": "Present",
        "current": true,
        "bullets": [
          "Led global product organization of 48 PMs and designers driving Jira Cloud Enterprise adoption, accelerating ARR growth from $140M to $320M in 3 years.",
          "Championed AI-assisted issue triaging and workflow intelligence, resulting in 4.2M automated tickets processed monthly and a 22% improvement in net customer retention.",
          "Spearheaded enterprise governance and data residency initiatives across 14 sovereign cloud markets, unlocking $42M in Fortune 500 deal pipelines.",
          "Authored secure SDLC training adopted by 120+ engineers across product and platform orgs.",
          "Operationalized secret rotation and short-lived credential patterns, closing 100% of stale key findings in quarterly audits.",
          "Standardized SAST/DAST gates in CI with waiver governance, reducing critical CVE SLA breaches by 62%."
        ]
      },
      {
        "company": "Box",
        "title": "Senior Director of Product Management - Enterprise Security",
        "location": "Redwood City, CA",
        "startDate": "2016-05",
        "endDate": "2020-12",
        "bullets": [
          "Launched Box Shield security intelligence suite, achieving $50M ARR in its first 18 months and winning the RSA Innovation Showcase award.",
          "Mentored 12 product managers into senior leadership roles and instituted evidence-driven customer discovery frameworks across 14 squads.",
          "Hardened container base images and enforced provenance attestation in supply chain pipelines.",
          "Maintained on-call playbooks for credential incidents with quarterly tabletop exercises."
        ]
      }
    ],
    "education": [
      {
        "school": "Harvard Business School",
        "degree": "Master of Business Administration (MBA)",
        "field": "General Management & Technology Strategy",
        "graduationDate": "2016"
      },
      {
        "school": "Stanford University",
        "degree": "Bachelor of Science (B.S.)",
        "field": "Management Science and Engineering",
        "graduationDate": "2012",
        "gpa": "3.91 / 4.0"
      }
    ],
    "certifications": [
      "Pragmatic Institute Certified (PMC-III)"
    ],
    "projects": [
      {
        "name": "Atlassian Applied Portfolio",
        "description": "Representative initiative demonstrating VP of Enterprise Product Management capabilities with measurable outcomes.",
        "techStack": [
          "Mixpanel",
          "Jira",
          "Customer Discovery & User Interviews"
        ],
        "highlights": [
          "Designed and implemented core workflows using Mixpanel and Jira, with quantitative validation against success criteria.",
          "Documented architecture, test plan, and rollout approach adopted as a reference by adjacent contributors.",
          "Presented outcomes highlighting 20–30% gains on primary efficiency or quality KPIs."
        ]
      }
    ]
  },
  {
    "id": "revolut-senior-growth-product-manager",
    "company": "Revolut",
    "companyKey": "revolut",
    "brandColor": "#0075EB",
    "brandTextColor": "#FFFFFF",
    "role": "Lead Growth Product Manager (Activation & Funnels)",
    "category": "PRODUCT_BUSINESS",
    "badge": "PRO",
    "atsScore": 98,
    "experienceLevel": "SENIOR_LEVEL",
    "experienceLevelLabel": "Senior (6–9 yrs)",
    "country": "United Kingdom",
    "resumeStyle": "Modern Technical",
    "isIllustrative": true,
    "candidate": {
      "name": "Daniel Gallagher",
      "title": "Lead Growth Product Manager",
      "location": "London, United Kingdom",
      "email": "daniel.gallagher.growth@gmail.com",
      "phone": "+44 20 7946 0931",
      "linkedin": "linkedin.com/in/danielgallagher-growth"
    },
    "summary": "Lead Growth Product Manager with 7+ years scaling consumer fintech onboarding funnels, referral viral loops, and monetized premium tier subscriptions. Master of experimentation platforms, rapid A/B testing methodologies, behavioral cohort analytics, and data-driven product-led activation for over 25M retail banking users. Focused on crash-free sessions, accessibility, and App Store–grade performance on flagship consumer experiences.",
    "skills": [
      {
        "category": "Growth & Experimentation",
        "skills": [
          "A/B & Multivariate Testing",
          "Onboarding & KYC Optimization",
          "Viral Referral Loops",
          "Cohort Retention Analysis",
          "LTV:CAC Modeling"
        ]
      },
      {
        "category": "Data & Analytics",
        "skills": [
          "SQL",
          "Amplitude",
          "Statsig",
          "Mixpanel",
          "Snowflake",
          "Python for Product Analytics"
        ]
      },
      {
        "category": "Execution & Discovery",
        "skills": [
          "Agile / Scrum",
          "Rapid Prototyping",
          "User Research",
          "Figma",
          "Behavioral Economics"
        ]
      }
    ],
    "experience": [
      {
        "company": "Revolut",
        "title": "Lead Growth Product Manager - User Acquisition & Onboarding",
        "location": "London, United Kingdom",
        "startDate": "2021-08",
        "endDate": "Present",
        "current": true,
        "bullets": [
          "Engineered revamped automated KYC verification flow, cutting onboarding drop-off by 27.4% and lifting monthly activated new accounts by 180,000 across EU markets.",
          "Redesigned peer-to-peer referral rewards loop using personalized behavioral nudges, driving 42% of organic new customer acquisition with zero increase in blended CAC.",
          "Executed over 140 high-velocity A/B experiments annually with statistical significance using Statsig and custom Bayesian experimentation models.",
          "Tuned SwiftUI/UIKit composition and diffing paths, improving cold-start time by 310ms on A15-class devices.",
          "Partnered with designers on motion-safe transitions meeting Apple HIG performance guidance across iPad multitasking.",
          "Coordinated App Store release trains with backend feature flags, enabling phased rollout to 5M users without P0 incidents."
        ]
      },
      {
        "company": "Wise (formerly TransferWise)",
        "title": "Senior Product Manager - Mobile Activation & FX",
        "location": "London, United Kingdom",
        "startDate": "2018-04",
        "endDate": "2021-07",
        "bullets": [
          "Optimized international remittance first-transfer funnel, increasing Day-7 repeat transaction frequency by 18% across GBP-to-EUR routes.",
          "Introduced smart exchange rate alert notifications generating over £12M in incremental monthly transaction volume.",
          "Collaborated on Core Data migration strategy preserving offline cart state across major schema upgrades.",
          "Integrated push notification and background sync using URLSession background tasks, improving re-engagement CTR by 12%."
        ]
      }
    ],
    "education": [
      {
        "school": "London School of Economics (LSE)",
        "degree": "BSc (Hons)",
        "field": "Management and Economics",
        "graduationDate": "2018",
        "honors": "First Class Honours"
      }
    ],
    "certifications": [
      "Reforge Growth Series Alum",
      "Reforge Retention & Engagement Certified"
    ],
    "projects": [
      {
        "name": "Revolut Applied Portfolio",
        "description": "Representative initiative demonstrating Lead Growth Product Manager (Activation & Funnels) capabilities with measurable outcomes.",
        "techStack": [
          "Mixpanel",
          "Behavioral Economics",
          "Amplitude"
        ],
        "highlights": [
          "Designed and implemented core workflows using Mixpanel and Behavioral Economics, with quantitative validation against success criteria.",
          "Documented architecture, test plan, and rollout approach adopted as a reference by adjacent contributors.",
          "Presented outcomes highlighting 20–30% gains on primary efficiency or quality KPIs."
        ]
      }
    ]
  },
  {
    "id": "sea-group-principal-bizops-strategy",
    "company": "Sea Group",
    "companyKey": "seagroup",
    "brandColor": "#F05A28",
    "brandTextColor": "#FFFFFF",
    "role": "Principal Business Operations & Corporate Strategy Lead",
    "category": "PRODUCT_BUSINESS",
    "badge": "PRO",
    "atsScore": 97,
    "experienceLevel": "STAFF_LEAD",
    "experienceLevelLabel": "Staff / Lead (8+ yrs)",
    "country": "Singapore",
    "resumeStyle": "Executive Clean",
    "isIllustrative": true,
    "candidate": {
      "name": "Clara Wijaya",
      "title": "Principal Business Operations & Strategy Lead",
      "location": "Singapore",
      "email": "clara.wijaya.biz@gmail.com",
      "phone": "+65 9812 3456",
      "linkedin": "linkedin.com/in/clarawijaya-strategy"
    },
    "summary": "Principal Business Operations and Strategy Lead with 8+ years leading market expansions, unit economic turnarounds, and cross-functional operational transformations across Southeast Asia. Ex-McKinsey engagement manager with deep expertise in marketplace liquidity, logistics cost modeling, and executive P&L leadership. Translates customer insight and economics into actionable roadmaps spanning engineering, GTM, and operations.",
    "skills": [
      {
        "category": "Strategy & Operations",
        "skills": [
          "Corporate Strategy",
          "Unit Economics Optimization",
          "Market Entry & Expansion",
          "P&L Restructuring",
          "Mergers & Acquisitions"
        ]
      },
      {
        "category": "Financial & Data Modeling",
        "skills": [
          "Financial Modeling",
          "DCF & Scenario Analysis",
          "SQL",
          "Tableau",
          "Alteryx",
          "Executive Presentations"
        ]
      },
      {
        "category": "Leadership",
        "skills": [
          "Cross-Functional Program Management",
          "Steering Committee Governance",
          "Change Management"
        ]
      }
    ],
    "experience": [
      {
        "company": "Sea Group (Shopee & SeaMoney)",
        "title": "Principal Business Operations Lead - Marketplace & Digital Finance",
        "location": "Singapore",
        "startDate": "2021-05",
        "endDate": "Present",
        "current": true,
        "bullets": [
          "Led operational unit economics optimization across 6 Southeast Asian regional logistics hubs, slashing cost-per-order by 18% ($64M annual savings) to achieve positive EBITDA.",
          "Structured cross-selling synergies between e-commerce marketplace and SPayLater digital credit products, increasing fin-tech product penetration among active shoppers by 34%.",
          "Formulated multi-year strategic roadmap for Shopee Live video commerce, scaling merchant GMV from $80M to $620M in under 18 months.",
          "Partnered with finance on pricing and packaging tests contributing $3.4M incremental ARR in fiscal year.",
          "Negotiated roadmap tradeoffs with sales and support, reducing escalations on missing enterprise capabilities by 33%.",
          "Ran quarterly planning linking customer insights, unit economics, and engineering capacity, delivering 108% of committed OKRs."
        ]
      },
      {
        "company": "McKinsey & Company",
        "title": "Engagement Manager - Technology & Operations Practice",
        "location": "Singapore",
        "startDate": "2017-08",
        "endDate": "2021-04",
        "bullets": [
          "Directed client engagement teams advising regional banking and tech conglomerates on digital transformations and post-merger integrations.",
          "Developed digital retail bank feasibility model adopted by sovereign wealth investment committee for a $300M capital allocation.",
          "Drove vendor evaluations and build/buy analyses informing approved investments.",
          "Delivered training and change plans for large-scale rollouts exceeding 1,500 users."
        ]
      }
    ],
    "education": [
      {
        "school": "INSEAD",
        "degree": "Master of Business Administration (MBA)",
        "graduationDate": "2017",
        "honors": "Dean’s List",
        "field": "Master of Business Administration (MBA)"
      },
      {
        "school": "National University of Singapore (NUS)",
        "degree": "B.B.A. (Honours)",
        "field": "Finance and Operations",
        "graduationDate": "2013"
      }
    ],
    "certifications": [
      "Certified Management Consultant (CMC)"
    ],
    "projects": [
      {
        "name": "Sea Group Applied Portfolio",
        "description": "Representative initiative demonstrating Principal Business Operations & Corporate Strategy Lead capabilities with measurable outcomes.",
        "techStack": [
          "Steering Committee Governance",
          "Unit Economics Optimization",
          "Alteryx"
        ],
        "highlights": [
          "Designed and implemented core workflows using Steering Committee Governance and Unit Economics Optimization, with quantitative validation against success criteria.",
          "Documented architecture, test plan, and rollout approach adopted as a reference by adjacent contributors.",
          "Presented outcomes highlighting 20–30% gains on primary efficiency or quality KPIs."
        ]
      }
    ]
  },
  {
    "id": "rbc-senior-agile-delivery-lead",
    "company": "RBC Royal Bank",
    "companyKey": "rbc",
    "brandColor": "#005DAA",
    "brandTextColor": "#FFFFFF",
    "role": "Senior Agile Delivery Lead & Principal Scrum Master",
    "category": "PRODUCT_BUSINESS",
    "badge": "PRO",
    "atsScore": 96,
    "experienceLevel": "SENIOR_LEVEL",
    "experienceLevelLabel": "Senior (6–9 yrs)",
    "country": "Canada",
    "resumeStyle": "ATS Classic",
    "isIllustrative": true,
    "candidate": {
      "name": "Marc Lefebvre",
      "title": "Senior Agile Delivery Lead & Principal Scrum Master",
      "location": "Toronto, Canada",
      "email": "marc.lefebvre.agile@gmail.com",
      "phone": "+1 (416) 782-9014",
      "linkedin": "linkedin.com/in/marclefebvre-agile"
    },
    "summary": "Senior Agile Delivery Lead and certified Enterprise Agile Coach with 7+ years guiding digital transformation programs, cross-squad release trains, and enterprise delivery governance in tier-1 banking institutions. Proven track record reducing cycle times by 40% across 14 distributed squads delivering regulatory banking technology. Translates customer insight and economics into actionable roadmaps spanning engineering, GTM, and operations.",
    "skills": [
      {
        "category": "Agile Frameworks",
        "skills": [
          "Scaled Agile Framework (SAFe)",
          "Scrum",
          "Kanban",
          "Lean Portfolio Management",
          "Value Stream Mapping"
        ]
      },
      {
        "category": "Delivery Governance",
        "skills": [
          "Jira Software / Align",
          "Confluence",
          "Release Planning",
          "Dependency & Risk Management",
          "Sprint Metrics"
        ]
      },
      {
        "category": "Coaching & Facilitation",
        "skills": [
          "Executive Agile Coaching",
          "PI Planning Facilitation",
          "Retrospectives",
          "Conflict Resolution"
        ]
      }
    ],
    "experience": [
      {
        "company": "RBC Royal Bank",
        "title": "Senior Agile Delivery Lead - Digital Commercial Banking",
        "location": "Toronto, Canada",
        "startDate": "2021-09",
        "endDate": "Present",
        "current": true,
        "bullets": [
          "Orchestrated Agile Release Train (ART) comprising 120 engineers, PMs, and QAs across 10 squads, delivering major cloud commercial banking platform on schedule with zero regulatory defects.",
          "Reduced average release cycle time from 12 weeks to 2 weeks by eliminating governance bottlenecks and instituting automated CI/CD compliance gates.",
          "Facilitated quarterly PI Planning events, managing cross-squad dependency maps and achieving 92% planned predictability score across consecutive program increments.",
          "Authored PRD templates and decision logs adopted across portfolio, accelerating stakeholder alignment cycles.",
          "Negotiated roadmap tradeoffs with sales and support, reducing escalations on missing enterprise capabilities by 33%.",
          "Facilitated steering reviews for multi-team programs, holding slipped milestones to under 10% of in-flight work."
        ]
      },
      {
        "company": "TD Bank Group",
        "title": "Senior Scrum Master - Personal Banking & Wealth",
        "location": "Toronto, Canada",
        "startDate": "2018-03",
        "endDate": "2021-08",
        "bullets": [
          "Coached 4 cross-functional development squads transitioning from waterfall to Scrum, improving sprint velocity consistency by 38% within 6 months.",
          "Instituted team health metrics and blameless retrospective rituals, cutting squad voluntary attrition from 18% to 4%.",
          "Synthesized competitive teardowns and win/loss interviews into exec-ready strategy memos.",
          "Drove vendor evaluations and build/buy analyses informing approved investments."
        ]
      }
    ],
    "education": [
      {
        "school": "University of Toronto",
        "degree": "Bachelor of Arts (B.A.)",
        "field": "Industrial Relations & Organizational Behavior",
        "graduationDate": "2017"
      }
    ],
    "certifications": [
      "Certified ScrumMaster (CSM)",
      "SAFe 6.0 Practice Consultant (SPC)",
      "PMI Agile Certified Practitioner (PMI-ACP)"
    ],
    "projects": [
      {
        "name": "RBC Royal Bank Applied Portfolio",
        "description": "Representative initiative demonstrating Senior Agile Delivery Lead & Principal Scrum Master capabilities with measurable outcomes.",
        "techStack": [
          "Sprint Metrics",
          "Dependency & Risk Management",
          "Release Planning"
        ],
        "highlights": [
          "Designed and implemented core workflows using Sprint Metrics and Dependency & Risk Management, with quantitative validation against success criteria.",
          "Documented architecture, test plan, and rollout approach adopted as a reference by adjacent contributors.",
          "Presented outcomes highlighting 20–30% gains on primary efficiency or quality KPIs."
        ]
      }
    ]
  },
  {
    "id": "dyson-senior-ux-researcher",
    "company": "Dyson",
    "companyKey": "dyson",
    "brandColor": "#2B2B2B",
    "brandTextColor": "#FFFFFF",
    "role": "Lead UX Researcher & Human Factors Specialist",
    "category": "DESIGN_UX",
    "badge": "PRO",
    "atsScore": 97,
    "experienceLevel": "SENIOR_LEVEL",
    "experienceLevelLabel": "Senior (6–9 yrs)",
    "country": "United Kingdom",
    "resumeStyle": "ATS Classic",
    "isIllustrative": true,
    "candidate": {
      "name": "Dr. Fiona Campbell",
      "title": "Lead UX Researcher & Human Factors Specialist",
      "location": "Bristol, United Kingdom",
      "email": "fiona.campbell.ux@gmail.com",
      "phone": "+44 117 496 0321",
      "linkedin": "linkedin.com/in/fionacampbell-uxr"
    },
    "summary": "Lead UX Researcher and Human Factors Specialist with 7+ years conducting generative, evaluative, and quantitative ergonomic research across connected IoT devices and consumer mobile companion apps. Expert in cognitive task analysis, biometric eye-tracking, usability benchmarking, and statistical telemetry modeling. Systems-minded designer connecting research evidence to shippable patterns and inclusive interaction detail.",
    "skills": [
      {
        "category": "Research Methodologies",
        "skills": [
          "Contextual Inquiry",
          "Usability Testing",
          "Eye-Tracking (Tobii)",
          "Diary Studies",
          "Card Sorting",
          "Survey Design"
        ]
      },
      {
        "category": "Quantitative & Qualitative Analysis",
        "skills": [
          "R",
          "SPSS",
          "Thematic Coding (Dovetail)",
          "System Usability Scale (SUS)",
          "Miro",
          "Lookback"
        ]
      },
      {
        "category": "Hardware & IoT UX",
        "skills": [
          "Human-Machine Interfaces (HMI)",
          "Ergonomic Testing",
          "Accessibility (BS 8878)"
        ]
      }
    ],
    "experience": [
      {
        "company": "Dyson",
        "title": "Lead UX Researcher - Connected IoT & Smart Home Devices",
        "location": "Bristol, United Kingdom",
        "startDate": "2021-06",
        "endDate": "Present",
        "current": true,
        "bullets": [
          "Directed mixed-methods international research across 12 countries evaluating smart air purifier mobile controls, increasing System Usability Scale (SUS) from 68 to 86.",
          "Pioneered eye-tracking and biometric cognitive load lab testing for next-generation hardware displays, eliminating 34% of user navigation errors.",
          "Built organization-wide research insights repository in Dovetail housing 450+ indexed user interviews accessible to 200 designers and product managers.",
          "Evolved component specs with focus, contrast, and motion guardrails reaching 97% WCAG AA coverage in production.",
          "Aligned design QA rituals with engineering, reducing visual defect reopen rate from 14% to 5%.",
          "Mentored designers on critique facilitation, raising first-pass review approval rates by 26%."
        ]
      },
      {
        "company": "BBC Digital",
        "title": "Senior User Researcher - iPlayer & Sound Experience",
        "location": "London, United Kingdom",
        "startDate": "2018-02",
        "endDate": "2021-05",
        "bullets": [
          "Conducted accessibility studies with disabled users to redesign BBC iPlayer subtitles and audio descriptions, winning the Royal Television Society Digital Award.",
          "Executed quantitative survey analysis across 25,000 UK households to optimize video recommendation carousel layouts.",
          "Shipped responsive patterns and prototype flows accelerating stakeholder sign-off.",
          "Collaborated on design debt backlog quantifying UX friction via support tag analysis."
        ]
      }
    ],
    "education": [
      {
        "school": "University of Oxford",
        "degree": "D.Phil. (Ph.D.)",
        "field": "Experimental Psychology & Human Factors",
        "graduationDate": "2017"
      },
      {
        "school": "University of Edinburgh",
        "degree": "B.Sc. (Hons)",
        "field": "Cognitive Science",
        "graduationDate": "2013"
      }
    ],
    "certifications": [
      "Chartered Ergonomist (C.ErgHF)",
      "UXQB Certified Professional for Usability and User Experience"
    ],
    "projects": [
      {
        "name": "Dyson Applied Portfolio",
        "description": "Representative initiative demonstrating Lead UX Researcher & Human Factors Specialist capabilities with measurable outcomes.",
        "techStack": [
          "Usability Testing",
          "Contextual Inquiry",
          "Thematic Coding (Dovetail)"
        ],
        "highlights": [
          "Designed and implemented core workflows using Usability Testing and Contextual Inquiry, with quantitative validation against success criteria.",
          "Documented architecture, test plan, and rollout approach adopted as a reference by adjacent contributors.",
          "Presented outcomes highlighting 20–30% gains on primary efficiency or quality KPIs."
        ]
      }
    ]
  },
  {
    "id": "zerodha-lead-mobile-ui-designer",
    "company": "Zerodha",
    "companyKey": "zerodha",
    "brandColor": "#387ED1",
    "brandTextColor": "#FFFFFF",
    "role": "Lead Mobile Product Designer (Fintech UX)",
    "category": "DESIGN_UX",
    "badge": "PRO",
    "atsScore": 98,
    "experienceLevel": "SENIOR_LEVEL",
    "experienceLevelLabel": "Senior (6–9 yrs)",
    "country": "India",
    "resumeStyle": "Modern Technical",
    "isIllustrative": true,
    "candidate": {
      "name": "Aarav Nair",
      "title": "Lead Mobile Product Designer",
      "location": "Bengaluru, India",
      "email": "aarav.nair.ui@gmail.com",
      "phone": "+91 99012 34567",
      "linkedin": "linkedin.com/in/aaravnair-design",
      "portfolio": "aaravnair.design"
    },
    "summary": "Lead Mobile Product Designer with 7+ years designing high-frequency stock trading platforms, mutual fund investment flows, and personal wealth dashboards. Passionate about distraction-free minimal typography, sub-second financial order placement workflows, and multi-lingual Indian vernacular UI architectures used by 12M+ active traders. Focused on crash-free sessions, accessibility, and App Store–grade performance on flagship consumer experiences.",
    "skills": [
      {
        "category": "Mobile & UI Design",
        "skills": [
          "Figma",
          "iOS Human Interface Guidelines (HIG)",
          "Material Design 3",
          "Micro-Interactions (Protopie, Lottie)",
          "Typography"
        ]
      },
      {
        "category": "Fintech Domain",
        "skills": [
          "Trading Terminals",
          "Option Greeks Visualizations",
          "Order Execution Workflows",
          "KYC Regulated Flows"
        ]
      },
      {
        "category": "Design Operations",
        "skills": [
          "Design Systems",
          "Usability Testing",
          "Heuristic Evaluation",
          "Design QA"
        ]
      }
    ],
    "experience": [
      {
        "company": "Zerodha",
        "title": "Lead Mobile UI/UX Designer - Kite Mobile & Console",
        "location": "Bengaluru, India",
        "startDate": "2021-08",
        "endDate": "Present",
        "current": true,
        "bullets": [
          "Redesigned the multi-asset order execution ticket interface, reducing order confirmation time to 2 taps and decreasing accidental trade errors by 32%.",
          "Crafted real-time options payoff graph and volatility surface visualizer for mobile screens, celebrated by retail derivative traders with over 150K organic shares.",
          "Architected typography-driven design system supporting 10 Indian vernacular languages with optimal vertical rhythm and zero text truncation.",
          "Led modularization of legacy view controllers into feature packages, shrinking incremental compile times by 38%.",
          "Shipped accessibility and Dynamic Type coverage for primary navigation flows, lifting VoiceOver task success to 94%.",
          "Tuned SwiftUI/UIKit composition and diffing paths, improving cold-start time by 310ms on A15-class devices."
        ]
      },
      {
        "company": "CRED",
        "title": "Senior Product Designer - Credit Card Rewards & Payments",
        "location": "Bengaluru, India",
        "startDate": "2019-03",
        "endDate": "2021-07",
        "bullets": [
          "Designed bespoke gamified claim reward mechanics and tactile haptic feedback animations driving 99.2% on-time bill payment completions.",
          "Collaborated closely with Android and iOS engineers to achieve smooth 120 FPS micro-animations using custom Lottie vector pipelines.",
          "Refactored networking layer with Codable contracts and retry policies, cutting client-side error rates by 22%.",
          "Added snapshot and XCTest UI suites for checkout flows, preventing 6 regressions in holiday release window."
        ]
      }
    ],
    "education": [
      {
        "school": "National Institute of Design (NID), Ahmedabad",
        "degree": "Master of Design (M.Des)",
        "field": "New Media Design",
        "graduationDate": "2019"
      }
    ],
    "certifications": [
      "Interaction Design Foundation (IxDF) Certified Master in Mobile UX"
    ],
    "projects": [
      {
        "name": "Zerodha Applied Portfolio",
        "description": "Representative initiative demonstrating Lead Mobile Product Designer (Fintech UX) capabilities with measurable outcomes.",
        "techStack": [
          "Design Systems",
          "Usability Testing",
          "Heuristic Evaluation"
        ],
        "highlights": [
          "Designed and implemented core workflows using Design Systems and Usability Testing, with quantitative validation against success criteria.",
          "Documented architecture, test plan, and rollout approach adopted as a reference by adjacent contributors.",
          "Presented outcomes highlighting 20–30% gains on primary efficiency or quality KPIs."
        ]
      }
    ]
  },
  {
    "id": "zalando-senior-design-systems-architect",
    "company": "Zalando",
    "companyKey": "zalando",
    "brandColor": "#FF6900",
    "brandTextColor": "#FFFFFF",
    "role": "Senior Design Systems & Accessibility Architect",
    "category": "DESIGN_UX",
    "badge": "PRO",
    "atsScore": 97,
    "experienceLevel": "SENIOR_LEVEL",
    "experienceLevelLabel": "Senior (6–9 yrs)",
    "country": "Germany",
    "resumeStyle": "Compact Single-Column",
    "isIllustrative": true,
    "candidate": {
      "name": "Lea Zimmermann",
      "title": "Senior Design Systems & Accessibility Architect",
      "location": "Berlin, Germany",
      "email": "lea.zimmermann.ds@gmail.com",
      "phone": "+49 30 8912 3410",
      "linkedin": "linkedin.com/in/leazimmermann-ds",
      "portfolio": "leazimmermann.design"
    },
    "summary": "Senior Design Systems Architect with 7+ years standardizing scalable, accessible UI component ecosystems for European multi-tenant e-commerce platforms. Expert in W3C design tokens, WCAG 2.1 AAA accessibility audits, multi-brand theming engines, and bridging the tooling gap between Figma and production React code. Translates customer insight and economics into actionable roadmaps spanning engineering, GTM, and operations.",
    "skills": [
      {
        "category": "Design Systems",
        "skills": [
          "Figma Variables",
          "Design Tokens (W3C Community Group)",
          "Multi-Brand Theming",
          "Component Governance",
          "Storybook"
        ]
      },
      {
        "category": "Accessibility (a11y)",
        "skills": [
          "WCAG 2.1 AA / AAA",
          "Screen Reader Testing (VoiceOver, NVDA)",
          "Keyboard Navigation Flows",
          "Color Contrast Optimization"
        ]
      },
      {
        "category": "Collaboration & Tools",
        "skills": [
          "Git",
          "Style Dictionary",
          "Zeroheight",
          "CSS Custom Properties",
          "User Testing"
        ]
      }
    ],
    "experience": [
      {
        "company": "Zalando",
        "title": "Senior Design Systems Lead - Multi-Brand Commerce",
        "location": "Berlin, Germany",
        "startDate": "2021-03",
        "endDate": "Present",
        "current": true,
        "bullets": [
          "Architected unified multi-brand design system powering 4 distinct e-commerce web applications across 25 European countries, reducing redundant design rework by 65%.",
          "Spearheaded automated accessibility testing pipeline, bringing 180+ core UI components into full compliance with the European Accessibility Act (EAA).",
          "Established Design System Community of Practice training 80+ designers and frontend developers in design token best practices.",
          "Partnered with finance on pricing and packaging tests contributing $3.4M incremental ARR in fiscal year.",
          "Negotiated roadmap tradeoffs with sales and support, reducing escalations on missing enterprise capabilities by 33%.",
          "Ran quarterly planning linking customer insights, unit economics, and engineering capacity, delivering 108% of committed OKRs."
        ]
      },
      {
        "company": "N26",
        "title": "Product Designer - Design Systems & Web",
        "location": "Berlin, Germany",
        "startDate": "2018-05",
        "endDate": "2021-02",
        "bullets": [
          "Built foundational web component library for N26 Web Banking, cutting new feature design-to-development handoff time by half.",
          "Conducted monthly design system health audits, eliminating 240+ detached Figma instances across active product files.",
          "Drove vendor evaluations and build/buy analyses informing approved investments.",
          "Delivered training and change plans for large-scale rollouts exceeding 1,500 users."
        ]
      }
    ],
    "education": [
      {
        "school": "Bauhaus-Universität Weimar",
        "degree": "Bachelor of Fine Arts (B.F.A.)",
        "field": "Visual Communication",
        "graduationDate": "2018",
        "honors": "Summa Cum Laude"
      }
    ],
    "certifications": [
      "Certified Professional in Accessibility Core Competencies (CPACC) - IAAP"
    ],
    "projects": [
      {
        "name": "Zalando Applied Portfolio",
        "description": "Representative initiative demonstrating Senior Design Systems & Accessibility Architect capabilities with measurable outcomes.",
        "techStack": [
          "CSS Custom Properties",
          "Color Contrast Optimization",
          "Git"
        ],
        "highlights": [
          "Designed and implemented core workflows using CSS Custom Properties and Color Contrast Optimization, with quantitative validation against success criteria.",
          "Documented architecture, test plan, and rollout approach adopted as a reference by adjacent contributors.",
          "Presented outcomes highlighting 20–30% gains on primary efficiency or quality KPIs."
        ]
      }
    ]
  },
  {
    "id": "hubspot-vp-global-growth-marketing",
    "company": "HubSpot",
    "companyKey": "hubspot",
    "brandColor": "#FF7A59",
    "brandTextColor": "#FFFFFF",
    "role": "VP of Global Growth & Performance Marketing",
    "category": "MARKETING_SEO",
    "badge": "PRO",
    "atsScore": 99,
    "experienceLevel": "EXECUTIVE",
    "experienceLevelLabel": "Executive (10+ yrs)",
    "country": "United States",
    "resumeStyle": "Executive Clean",
    "isIllustrative": true,
    "candidate": {
      "name": "Morgan Bennett",
      "title": "VP of Global Growth & Performance Marketing",
      "location": "Boston, MA",
      "email": "morgan.bennett.mktg@gmail.com",
      "phone": "+1 (617) 890-1245",
      "linkedin": "linkedin.com/in/morganbennett-growth"
    },
    "summary": "Executive Growth Marketing Leader with 12+ years driving multi-channel demand generation, paid media efficiency, and pipeline velocity for hyper-growth B2B SaaS companies. Managed $40M+ annual performance marketing budgets, scaled qualified lead pipelines from $50M to $280M, and established attribution models aligning marketing spend with customer lifetime value. Full-funnel marketer aligning brand, content, and performance channels to measurable revenue outcomes.",
    "skills": [
      {
        "category": "Growth Strategy & Leadership",
        "skills": [
          "Demand Generation",
          "Multi-Touch Attribution",
          "Paid Acquisition (Search, Social, Programmatic)",
          "Budget Management ($40M+)",
          "LTV:CAC Optimization"
        ]
      },
      {
        "category": "MarTech & Operations",
        "skills": [
          "HubSpot Marketing Hub",
          "Salesforce CRM",
          "Google Ads",
          "LinkedIn Campaign Manager",
          "Marketo",
          "Segment CDP"
        ]
      },
      {
        "category": "Data & Analytics",
        "skills": [
          "Tableau",
          "Google Analytics 4 (GA4)",
          "SQL Basics",
          "Cohort Analysis",
          "Conversion Rate Optimization (CRO)"
        ]
      }
    ],
    "experience": [
      {
        "company": "HubSpot",
        "title": "VP of Global Performance Marketing & Acquisition",
        "location": "Cambridge, MA",
        "startDate": "2021-02",
        "endDate": "Present",
        "current": true,
        "bullets": [
          "Led global team of 35 performance marketers, SEO strategists, and marketing ops engineers, driving 38% YoY growth in marketing-sourced pipeline ($220M).",
          "Restructured paid search and paid social campaigns across 8 international regions, improving blended CAC efficiency by 24% while scaling lead volume.",
          "Pioneered AI-driven dynamic landing page personalization using Segment CDP and Optimizely, lifting demo request conversion rate from 2.8% to 4.9%.",
          "Managed agency partners and brand QA lifting consistency audit scores from 74% to 91%.",
          "Scaled integrated campaigns delivering $5.2M influenced pipeline and 29% YoY growth in SALs.",
          "Coordinated product launches with sales enablement achieving 4.7/5 rep readiness scores."
        ]
      },
      {
        "company": "Klaviyo",
        "title": "Senior Director of Demand Generation",
        "location": "Boston, MA",
        "startDate": "2016-08",
        "endDate": "2021-01",
        "bullets": [
          "Scaled enterprise marketing qualified pipeline from $18M to $95M preceding successful IPO debut.",
          "Orchestrated multi-channel account-based marketing (ABM) campaigns targeting mid-market e-commerce merchants, achieving a 14:1 marketing ROI.",
          "Published cornerstone SEO briefs and link-worthy research earning sustained organic traffic lifts.",
          "Authored competitive battlecards used in regional sales kickoffs."
        ]
      }
    ],
    "education": [
      {
        "school": "Northwestern University - Kellogg School of Management",
        "degree": "Master of Business Administration (MBA)",
        "field": "Marketing Strategy",
        "graduationDate": "2016"
      },
      {
        "school": "Boston College",
        "degree": "Bachelor of Arts (B.A.)",
        "field": "Communications & Economics",
        "graduationDate": "2012",
        "gpa": "3.82 / 4.0"
      }
    ],
    "certifications": [
      "HubSpot Certified Inbound Marketing Leader",
      "Google Ads Search & Video Certified"
    ]
  },
  {
    "id": "nerdwallet-senior-technical-seo-architect",
    "company": "NerdWallet",
    "companyKey": "nerdwallet",
    "brandColor": "#005953",
    "brandTextColor": "#FFFFFF",
    "role": "Director of Technical SEO & Search Architecture",
    "category": "MARKETING_SEO",
    "badge": "PRO",
    "atsScore": 98,
    "experienceLevel": "STAFF_LEAD",
    "experienceLevelLabel": "Staff / Lead (8+ yrs)",
    "country": "United States",
    "resumeStyle": "Modern Technical",
    "isIllustrative": true,
    "candidate": {
      "name": "Ryan Callahan",
      "title": "Director of Technical SEO & Search Architecture",
      "location": "San Francisco, CA",
      "email": "ryan.callahan.seo@gmail.com",
      "phone": "+1 (415) 789-4321",
      "linkedin": "linkedin.com/in/ryancallahan-seo",
      "github": "github.com/rcallahan-seo"
    },
    "summary": "Director of Technical SEO with 9+ years managing programmatic search architectures for high-traffic financial and consumer portals driving over 80M monthly organic visits. Specialized in Core Web Vitals optimization, programmatic internal linking graphs, structured data (JSON-LD), crawl budget optimization, and AI search engine integration. Full-funnel marketer aligning brand, content, and performance channels to measurable revenue outcomes.",
    "skills": [
      {
        "category": "Technical SEO",
        "skills": [
          "Crawl Budget Optimization",
          "Log File Analysis",
          "Structured Data (Schema.org / JSON-LD)",
          "Internal Link Graph PageRank",
          "Canonicalization"
        ]
      },
      {
        "category": "Tools & Analytics",
        "skills": [
          "Screaming Frog",
          "Botify",
          "Ahrefs",
          "SEMrush",
          "Google Search Console API",
          "BigQuery",
          "Looker Studio"
        ]
      },
      {
        "category": "Web Technologies",
        "skills": [
          "Next.js SSR/SSG",
          "JavaScript SEO",
          "HTML5 Semantic Web",
          "Python (Pandas, BeautifulSoup)",
          "CDN Edge Workers"
        ]
      }
    ],
    "experience": [
      {
        "company": "NerdWallet",
        "title": "Director of Technical SEO & Search Infrastructure",
        "location": "San Francisco, CA",
        "startDate": "2021-04",
        "endDate": "Present",
        "current": true,
        "bullets": [
          "Architected programmatic SEO engine generating 45,000 algorithmic credit card and mortgage comparison pages, generating 22M incremental monthly organic sessions.",
          "Eliminated 1.8M orphaned pages and canonical loops via automated Botify crawler analysis, increasing Googlebot indexation rate of high-intent URLs by 46%.",
          "Collaborated with engineering to migrate 60,000 legacy editorial articles to Next.js Incremental Static Regeneration (ISR), cutting average page crawl latency by 68%.",
          "Executed technical SEO remediation and content cluster strategy, adding 22 net-new page-one keywords in two quarters.",
          "Launched lifecycle experiments improving trial-to-paid conversion 19% while holding churn flat.",
          "Built multi-touch attribution views reallocating $450K to highest LTV:CAC channels."
        ]
      },
      {
        "company": "TripAdvisor",
        "title": "Senior Technical SEO Manager - Global Hotel Search",
        "location": "Needham, MA",
        "startDate": "2017-02",
        "endDate": "2021-03",
        "bullets": [
          "Managed international SEO architecture across 48 localized domain properties, recovering from core algorithmic updates with 18% net organic visibility gains.",
          "Automated daily schema validation checks across 12M hotel review pages using Python and Cloudflare Workers.",
          "Grew community programs adding 18K engaged followers on priority channels.",
          "A/B tested landing narratives improving demo request rates 16% across ICP segments."
        ]
      }
    ],
    "projects": [
      {
        "name": "PySEO-Auditor — Automated Bot Crawl Log Analyzer",
        "description": "Open-source Python tool analyzing Nginx and Cloudflare log files to identify crawler waste and 4xx/5xx crawl spikes.",
        "techStack": [
          "Python",
          "Pandas",
          "ClickHouse",
          "Google Search Console API"
        ],
        "url": "github.com/rcallahan-seo/pyseo-auditor",
        "highlights": [
          "Over 1,200 GitHub stars and used by top technical SEO agencies."
        ]
      }
    ],
    "education": [
      {
        "school": "University of California, Davis",
        "degree": "Bachelor of Science (B.S.)",
        "field": "Computer Science & Computational Linguistics",
        "graduationDate": "2016"
      }
    ],
    "certifications": [
      "DeepCrawl / Lumar Certified SEO Specialist"
    ]
  },
  {
    "id": "canva-director-brand-communications",
    "company": "Canva",
    "companyKey": "canva",
    "brandColor": "#00C4CC",
    "brandTextColor": "#FFFFFF",
    "role": "Global Brand Marketing & Creative Communications Director",
    "category": "MARKETING_SEO",
    "badge": "PRO",
    "atsScore": 98,
    "experienceLevel": "EXECUTIVE",
    "experienceLevelLabel": "Executive (10+ yrs)",
    "country": "United States",
    "resumeStyle": "Executive Clean",
    "isIllustrative": true,
    "candidate": {
      "name": "Claire Dupont",
      "title": "Global Brand Marketing & Creative Communications Director",
      "location": "Los Angeles, CA",
      "email": "claire.dupont.brand@gmail.com",
      "phone": "+1 (310) 902-3481",
      "linkedin": "linkedin.com/in/clairedupont-brand"
    },
    "summary": "Global Brand Marketing and Creative Communications Executive with 11+ years directing international brand identity campaigns, PR messaging, and high-impact cultural moments for consumer tech giants. Oversaw 360-degree omnichannel marketing campaigns resulting in 4.5B earned media impressions and a 38% increase in global brand unaided awareness. Full-funnel marketer aligning brand, content, and performance channels to measurable revenue outcomes.",
    "skills": [
      {
        "category": "Brand Strategy & Creative",
        "skills": [
          "Global Brand Positioning",
          "Creative Direction",
          "Omnichannel Brand Campaigns",
          "Public Relations & Comms",
          "Crisis Comms"
        ]
      },
      {
        "category": "Media & Partnerships",
        "skills": [
          "Broadcast & Digital Media Planning",
          "Influencer & Celebrity Partnerships",
          "Brand Tracking Studies",
          "Agency Management"
        ]
      },
      {
        "category": "Leadership",
        "skills": [
          "Cross-Functional Team Leadership (25+ direct)",
          "Executive Messaging",
          "Budget Oversight ($25M+)"
        ]
      }
    ],
    "experience": [
      {
        "company": "Canva",
        "title": "Director of Global Brand Marketing - Enterprise & Consumer",
        "location": "Los Angeles, CA",
        "startDate": "2021-09",
        "endDate": "Present",
        "current": true,
        "bullets": [
          "Spearheaded Canva’s global brand campaign \"Design for Everyone\", generating 3.2B earned impressions and lifting brand consideration among enterprise buyers by 29%.",
          "Directed creative and media agency partners across North America, Europe, and APAC with annual production and media budget of $28M.",
          "Built internal brand governance guidelines ensuring visual and voice consistency across 170M active creators and 1,800 enterprise sales collateral assets.",
          "Scaled integrated campaigns delivering $5.2M influenced pipeline and 29% YoY growth in SALs.",
          "Coordinated product launches with sales enablement achieving 4.7/5 rep readiness scores.",
          "Executed technical SEO remediation and content cluster strategy, adding 22 net-new page-one keywords in two quarters."
        ]
      },
      {
        "company": "Airbnb",
        "title": "Senior Brand Marketing Manager - North America",
        "location": "San Francisco, CA",
        "startDate": "2016-10",
        "endDate": "2021-08",
        "bullets": [
          "Led experiential brand activations for Airbnb Experiences launch, securing front-page feature stories in The New York Times, Fast Company, and Vogue.",
          "Formulated purpose-driven brand messaging during major global travel recovery campaigns, winning 2 Cannes Lions awards.",
          "A/B tested landing narratives improving demo request rates 16% across ICP segments.",
          "Published cornerstone SEO briefs and link-worthy research earning sustained organic traffic lifts."
        ]
      }
    ],
    "education": [
      {
        "school": "Columbia University",
        "degree": "Master of Science (M.S.)",
        "field": "Strategic Communications",
        "graduationDate": "2015"
      },
      {
        "school": "University of Southern California (USC)",
        "degree": "Bachelor of Arts (B.A.)",
        "field": "Public Relations & Marketing",
        "graduationDate": "2012",
        "gpa": "3.89 / 4.0"
      }
    ],
    "certifications": [
      "Cannes Lions Brand Strategy Masterclass",
      "PRSA Accredited in Public Relations (APR)"
    ]
  },
  {
    "id": "hootsuite-lead-content-marketing-strategist",
    "company": "Hootsuite",
    "companyKey": "hootsuite",
    "brandColor": "#000000",
    "brandTextColor": "#FFFFFF",
    "role": "Lead Content Strategy & Editorial Operations Manager",
    "category": "MARKETING_SEO",
    "badge": "PRO",
    "atsScore": 97,
    "experienceLevel": "SENIOR_LEVEL",
    "experienceLevelLabel": "Senior (6–9 yrs)",
    "country": "Canada",
    "resumeStyle": "ATS Classic",
    "isIllustrative": true,
    "candidate": {
      "name": "Emily Watson",
      "title": "Lead Content Strategy & Editorial Operations Manager",
      "location": "Vancouver, Canada",
      "email": "emily.watson.content@gmail.com",
      "phone": "+1 (604) 789-0123",
      "linkedin": "linkedin.com/in/emilywatson-content"
    },
    "summary": "Lead Content Marketing Strategist with 7+ years producing authoritative B2B SaaS research reports, multi-channel editorial calendars, and organic thought leadership engines. Built data-driven research initiatives downloaded by 350,000+ marketers and generating $16M in marketing-influenced sales pipeline. Translates customer insight and economics into actionable roadmaps spanning engineering, GTM, and operations.",
    "skills": [
      {
        "category": "Content Strategy",
        "skills": [
          "Original Industry Research Reports",
          "Long-Form Thought Leadership",
          "Editorial Calendar Operations",
          "SEO Copywriting",
          "Webinar Programs"
        ]
      },
      {
        "category": "Distribution & Optimization",
        "skills": [
          "Email Newsletters (Substack, Mailchimp)",
          "Organic Social Media",
          "Content Syndication",
          "Conversion Copywriting"
        ]
      },
      {
        "category": "Analytics",
        "skills": [
          "Google Analytics 4",
          "Ahrefs",
          "Clearscope",
          "HubSpot CMS",
          "Asana"
        ]
      }
    ],
    "experience": [
      {
        "company": "Hootsuite",
        "title": "Lead Content Strategist - Global Research & Editorial",
        "location": "Vancouver, Canada",
        "startDate": "2021-05",
        "endDate": "Present",
        "current": true,
        "bullets": [
          "Led production and distribution of the flagship annual \"Social Media Trends Report\", driving 120,000 qualified enterprise marketing downloads and $8.4M in pipeline.",
          "Rebuilt content editorial operations, transitioning from ad-hoc blogging to thematic topic clusters that boosted blog organic search traffic by 74% in 18 months.",
          "Launched weekly B2B practitioner email newsletter scaling from 15,000 to 180,000 subscribers with a consistent 34% open rate and 4.2% CTR.",
          "Facilitated steering reviews for multi-team programs, holding slipped milestones to under 10% of in-flight work.",
          "Launched beta cohort with instrumented funnels, improving activation 21% via onboarding experiments in 8 weeks.",
          "Negotiated roadmap tradeoffs with sales and support, reducing escalations on missing enterprise capabilities by 33%."
        ]
      },
      {
        "company": "Unbounce",
        "title": "Senior Content Marketing Specialist",
        "location": "Vancouver, Canada",
        "startDate": "2018-03",
        "endDate": "2021-04",
        "bullets": [
          "Authored high-converting conversion benchmark reports analyzing 33M landing page sessions, cited by Forbes, TechCrunch, and Marketing Week.",
          "Optimized on-page lead capture forms across 450 legacy articles, lifting overall reader-to-trial signup conversion by 18%.",
          "Delivered training and change plans for large-scale rollouts exceeding 1,500 users.",
          "Mentored associates on hypothesis-driven problem solving and executive storytelling."
        ]
      }
    ],
    "education": [
      {
        "school": "Simon Fraser University (SFU)",
        "degree": "Bachelor of Arts (B.A.)",
        "field": "English & Publishing",
        "graduationDate": "2017",
        "honors": "First Class with Distinction"
      }
    ],
    "certifications": [
      "HubSpot Content Marketing Certified",
      "Content Marketing Institute (CMI) Master Class"
    ]
  },
  {
    "id": "github-senior-developer-product-marketer",
    "company": "GitHub",
    "companyKey": "github",
    "brandColor": "#24292E",
    "brandTextColor": "#FFFFFF",
    "role": "Staff Product Marketing Manager (Developer Ecosystem)",
    "category": "MARKETING_SEO",
    "badge": "PRO",
    "atsScore": 98,
    "experienceLevel": "STAFF_LEAD",
    "experienceLevelLabel": "Staff / Lead (8+ yrs)",
    "country": "United States",
    "resumeStyle": "Modern Technical",
    "isIllustrative": true,
    "candidate": {
      "name": "Marcus Brody",
      "title": "Staff Product Marketing Manager",
      "location": "Seattle, WA",
      "email": "marcus.brody.pmm@gmail.com",
      "phone": "+1 (206) 901-4567",
      "linkedin": "linkedin.com/in/marcusbrody-pmm"
    },
    "summary": "Staff Developer Product Marketing Manager with 8+ years crafting positioning, competitive battlecards, and go-to-market (GTM) launches for developer tools, AI code assistants, and cloud platforms. Proven track record communicating technical capabilities to developers, engineering managers, and Fortune 500 CIOs. Partners with engineering and GTM on pragmatic security programs that accelerate—not block—shipping.",
    "skills": [
      {
        "category": "Product Marketing & GTM",
        "skills": [
          "Developer Product Positioning",
          "GTM Launch Strategy",
          "Competitive Intelligence & Battlecards",
          "Sales Enablement",
          "Pricing & Packaging"
        ]
      },
      {
        "category": "Developer Advocacy",
        "skills": [
          "Technical Storytelling",
          "Keynote Presentations",
          "DevRel Programs",
          "Case Studies & Whitepapers"
        ]
      },
      {
        "category": "Tools & Systems",
        "skills": [
          "Salesforce",
          "Highspot",
          "Gong",
          "Figma",
          "Tableau",
          "Markdown / Git"
        ]
      }
    ],
    "experience": [
      {
        "company": "GitHub",
        "title": "Staff Product Marketing Manager - GitHub Copilot & Developer AI",
        "location": "Seattle, WA",
        "startDate": "2021-10",
        "endDate": "Present",
        "current": true,
        "bullets": [
          "Led global GTM product launch for GitHub Copilot Enterprise, creating core messaging frameworks, pricing tiers, and ROI calculators that drove 50,000+ enterprise seats in Q1.",
          "Built comprehensive competitive intelligence battlecards and technical objection handling playbooks for 450 enterprise account executives, lifting competitive win-rate by 19%.",
          "Authored high-impact technical whitepaper \"Quantifying Developer Productivity with Generative AI\", downloaded by 14,000 technology leaders and cited by Gartner.",
          "Authored secure SDLC training adopted by 120+ engineers across product and platform orgs.",
          "Built threat modeling rituals for new services, identifying 17 design flaws remediated before GA.",
          "Standardized SAST/DAST gates in CI with waiver governance, reducing critical CVE SLA breaches by 62%."
        ]
      },
      {
        "company": "GitLab",
        "title": "Senior Product Marketing Manager - CI/CD & DevSecOps",
        "location": "San Francisco, CA",
        "startDate": "2018-05",
        "endDate": "2021-09",
        "bullets": [
          "Executed 12 consecutive monthly major release marketing campaigns, driving 42% YoY expansion in enterprise tier customer upgrades.",
          "Organized global developer virtual conference attracting 30,000 live attendees with a 94% positive satisfaction rating.",
          "Hardened container base images and enforced provenance attestation in supply chain pipelines.",
          "Maintained on-call playbooks for credential incidents with quarterly tabletop exercises."
        ]
      }
    ],
    "education": [
      {
        "school": "University of Michigan",
        "degree": "Bachelor of Science in Engineering (B.S.E.)",
        "field": "Computer Engineering & Economics",
        "graduationDate": "2016",
        "gpa": "3.84 / 4.0"
      }
    ],
    "certifications": [
      "Product Marketing Alliance (PMA) Certified Product Marketing Leader"
    ]
  },
  {
    "id": "zomato-lifecycle-retention-marketing-lead",
    "company": "Zomato",
    "companyKey": "zomato",
    "brandColor": "#E23744",
    "brandTextColor": "#FFFFFF",
    "role": "Head of Lifecycle & Retention Marketing",
    "category": "MARKETING_SEO",
    "badge": "PRO",
    "atsScore": 97,
    "experienceLevel": "SENIOR_LEVEL",
    "experienceLevelLabel": "Senior (6–9 yrs)",
    "country": "India",
    "resumeStyle": "ATS Classic",
    "isIllustrative": true,
    "candidate": {
      "name": "Ananya Sen",
      "title": "Head of Lifecycle & Retention Marketing",
      "location": "Gurugram, India",
      "email": "ananya.sen.crm@gmail.com",
      "phone": "+91 98112 34901",
      "linkedin": "linkedin.com/in/ananyasen-crm"
    },
    "summary": "Head of Customer Retention and CRM with 7+ years building automated lifecycle triggers, omnichannel push/SMS campaigns, and personalized loyalty programs in hyper-growth consumer apps. Expert in MoEngage, Clevertap, predictive churn modeling, and push notification conversion architectures reaching 40M+ active diners. Full-funnel marketer aligning brand, content, and performance channels to measurable revenue outcomes.",
    "skills": [
      {
        "category": "Retention & CRM",
        "skills": [
          "Customer Lifecycle Marketing",
          "Push & In-App Messaging",
          "WhatsApp & SMS Marketing",
          "Loyalty Program Economics",
          "Churn Prevention"
        ]
      },
      {
        "category": "MarTech Platforms",
        "skills": [
          "MoEngage",
          "CleverTap",
          "Braze",
          "AppsFlyer",
          "Mixpanel"
        ]
      },
      {
        "category": "Analytics & Strategy",
        "skills": [
          "Cohort Retention Curves",
          "RFM Segmentation",
          "SQL",
          "A/B Testing Messaging",
          "Gamification Mechanics"
        ]
      }
    ],
    "experience": [
      {
        "company": "Zomato",
        "title": "Head of Customer Retention & Lifecycle Communications",
        "location": "Gurugram, India",
        "startDate": "2021-06",
        "endDate": "Present",
        "current": true,
        "bullets": [
          "Engineered automated real-time contextual push notification triggers based on weather and meal times, driving 1.4M daily incremental orders with 4.8% CTR.",
          "Revamped the Zomato Gold loyalty membership renewal sequence using personalized annual savings summaries, improving annual renewal rate from 46% to 68%.",
          "Reduced monthly customer churn rate by 14% through machine-learning driven churn prediction models that dispatch dynamic re-engagement discount coupons.",
          "Coordinated product launches with sales enablement achieving 4.7/5 rep readiness scores.",
          "Scaled integrated campaigns delivering $5.2M influenced pipeline and 29% YoY growth in SALs.",
          "Executed technical SEO remediation and content cluster strategy, adding 22 net-new page-one keywords in two quarters."
        ]
      },
      {
        "company": "MakeMyTrip",
        "title": "Senior CRM & Loyalty Marketing Manager",
        "location": "Gurugram, India",
        "startDate": "2018-07",
        "endDate": "2021-05",
        "bullets": [
          "Scaled WhatsApp automated booking notifications and post-travel feedback collection, cutting customer service call inquiries by 26%.",
          "Executed multi-tier RFM segmentation for 15M domestic travel customers, driving ₹45 Crores in incremental holiday season bookings.",
          "A/B tested landing narratives improving demo request rates 16% across ICP segments.",
          "Grew community programs adding 18K engaged followers on priority channels."
        ]
      }
    ],
    "education": [
      {
        "school": "MICA, Ahmedabad",
        "degree": "Post Graduate Diploma in Management (PGDM)",
        "field": "Communications & Digital Marketing",
        "graduationDate": "2018"
      },
      {
        "school": "Lady Shri Ram College, Delhi University",
        "degree": "Bachelor of Arts (Honours)",
        "field": "Economics",
        "graduationDate": "2016"
      }
    ],
    "certifications": [
      "CleverTap Certified Retention Master",
      "MoEngage Growth Automation Certified"
    ]
  },
  {
    "id": "barclays-senior-financial-controller",
    "company": "Barclays",
    "companyKey": "barclays",
    "brandColor": "#00AEEF",
    "brandTextColor": "#FFFFFF",
    "role": "Senior Financial Controller & Regulatory Reporting Lead",
    "category": "FINANCE_BANKING",
    "badge": "PRO",
    "atsScore": 98,
    "experienceLevel": "SENIOR_LEVEL",
    "experienceLevelLabel": "Senior (6–9 yrs)",
    "country": "United Kingdom",
    "resumeStyle": "ATS Classic",
    "isIllustrative": true,
    "candidate": {
      "name": "Charlotte Davies",
      "title": "Senior Financial Controller & Regulatory Reporting Lead",
      "location": "London, United Kingdom",
      "email": "charlotte.davies.fca@gmail.com",
      "phone": "+44 20 7946 0782",
      "linkedin": "linkedin.com/in/charlottedavies-fca"
    },
    "summary": "Chartered Accountant (ACA) and Financial Controller with 8+ years leading financial statutory accounting, regulatory capital reporting (Pillar 3 / Basel IV), and internal audit controls across multinational banking divisions. Managed finance teams responsible for monthly ledger close, balance sheet substantiation, and IFRS 9 compliance. Detail-oriented finance partner on close quality, capital allocation, and transaction execution.",
    "skills": [
      {
        "category": "Financial Control & Reporting",
        "skills": [
          "IFRS 9 / IFRS 16",
          "UK GAAP",
          "Statutory Financial Statements",
          "Month-End Close",
          "Balance Sheet Substantiation"
        ]
      },
      {
        "category": "Regulatory Compliance",
        "skills": [
          "PRA / FCA Regulatory Returns",
          "Basel III / IV Capital Reporting",
          "COREP / FINREP",
          "SOX Compliance"
        ]
      },
      {
        "category": "Systems & Analytics",
        "skills": [
          "SAP S/4HANA",
          "Oracle Financials",
          "Alteryx",
          "Tableau",
          "Advanced Excel"
        ]
      }
    ],
    "experience": [
      {
        "company": "Barclays International",
        "title": "Senior Financial Controller - Corporate & Investment Bank",
        "location": "London, United Kingdom",
        "startDate": "2021-04",
        "endDate": "Present",
        "current": true,
        "bullets": [
          "Directed month-end financial close for £14B trading asset portfolio, delivering reconciled financial statements to group audit committee within 3 working days.",
          "Pioneered automated data reconciliation pipeline with Alteryx and SAP, reducing manual journal entry errors by 82% and saving 120 staff hours monthly.",
          "Led end-to-end preparation and submission of quarterly PRA/FCA regulatory capital returns (COREP), ensuring 100% on-time compliance with zero audit findings.",
          "Coached analysts on DCF, LBO, and comps frameworks with both mentees rated exceeds expectations.",
          "Prepared IC-ready models and sensitivity decks for transactions exceeding $1.8B combined enterprise value.",
          "Partnered with risk on stress scenarios maintaining liquidity buffers above policy thresholds in all cases."
        ]
      },
      {
        "company": "PwC UK",
        "title": "Audit Manager - Banking & Capital Markets Assurance",
        "location": "London, United Kingdom",
        "startDate": "2016-09",
        "endDate": "2021-03",
        "bullets": [
          "Led statutory financial statement audit engagements for FTSE 100 commercial banks, managing multi-disciplinary audit teams of 12 associates.",
          "Assessed internal controls under SOX 404, testing financial IT controls, fair value level 3 derivative valuations, and credit loss provisions.",
          "Reconciled multi-entity ledgers with zero material adjustments in external audit.",
          "Standardized management reporting packs across regional finance teams."
        ]
      }
    ],
    "education": [
      {
        "school": "University of Warwick",
        "degree": "BSc (Hons)",
        "field": "Accounting & Finance",
        "graduationDate": "2016",
        "honors": "First Class Honours"
      }
    ],
    "certifications": [
      "ICAEW Chartered Accountant (ACA)",
      "CFA Institute Level II Candidate"
    ]
  },
  {
    "id": "dbs-lead-enterprise-risk-treasury-manager",
    "company": "DBS Bank",
    "companyKey": "dbs",
    "brandColor": "#E60000",
    "brandTextColor": "#FFFFFF",
    "role": "Head of Enterprise Risk Management & Liquidity Strategy",
    "category": "FINANCE_BANKING",
    "badge": "PRO",
    "atsScore": 98,
    "experienceLevel": "STAFF_LEAD",
    "experienceLevelLabel": "Staff / Lead (8+ yrs)",
    "country": "Singapore",
    "resumeStyle": "Executive Clean",
    "isIllustrative": true,
    "candidate": {
      "name": "Wei Lun Tan",
      "title": "Head of Enterprise Risk Management & Liquidity Strategy",
      "location": "Singapore",
      "email": "weilun.tan.risk@gmail.com",
      "phone": "+65 9234 5678",
      "linkedin": "linkedin.com/in/weiluntan-risk"
    },
    "summary": "Senior Financial Risk and Treasury Management Leader with 9+ years managing liquidity coverage ratios (LCR), net stable funding ratios (NSFR), and asset-liability management (ALM) for top-tier Asian commercial banks. Expert in MAS regulations, market risk stress testing, foreign exchange hedging, and interest rate risk in the banking book (IRRBB). Translates customer insight and economics into actionable roadmaps spanning engineering, GTM, and operations.",
    "skills": [
      {
        "category": "Risk & Treasury Management",
        "skills": [
          "Asset-Liability Management (ALM)",
          "Liquidity Risk (LCR, NSFR)",
          "IRRBB & Duration Matching",
          "Market Risk (VaR, Expected Shortfall)",
          "MAS Regulations"
        ]
      },
      {
        "category": "Financial Engineering",
        "skills": [
          "Monte Carlo Simulation",
          "Interest Rate Swaps & FX Hedging",
          "Stress Testing & Scenario Analysis"
        ]
      },
      {
        "category": "Tools & Coding",
        "skills": [
          "Python",
          "SQL",
          "QRM (Quantitative Risk Management)",
          "Murex",
          "Bloomberg"
        ]
      }
    ],
    "experience": [
      {
        "company": "DBS Bank",
        "title": "Head of Balance Sheet & Liquidity Risk Strategy",
        "location": "Singapore",
        "startDate": "2021-03",
        "endDate": "Present",
        "current": true,
        "bullets": [
          "Engineered bank-wide ALM framework managing $380B balance sheet, optimizing liquidity buffers to sustain 135% Liquidity Coverage Ratio (LCR) well above MAS minimums.",
          "Implemented automated Python Monte Carlo interest rate simulation engine calculating dynamic NII sensitivity across 6 global rate change scenarios.",
          "Formulated $25B foreign exchange and interest rate swap hedging program, neutralizing balance sheet duration mismatch amidst turbulent central bank rate cycles.",
          "Partnered with finance on pricing and packaging tests contributing $3.4M incremental ARR in fiscal year.",
          "Ran quarterly planning linking customer insights, unit economics, and engineering capacity, delivering 108% of committed OKRs.",
          "Launched beta cohort with instrumented funnels, improving activation 21% via onboarding experiments in 8 weeks."
        ]
      },
      {
        "company": "Standard Chartered Bank",
        "title": "Senior Treasury Risk Analyst - Group Market Risk",
        "location": "Singapore",
        "startDate": "2017-06",
        "endDate": "2021-02",
        "bullets": [
          "Developed daily Value-at-Risk (VaR) and Expected Shortfall models for G10 FX and fixed-income trading desks using historical simulation methodologies.",
          "Authored regulatory stress testing documentation submitted to Bank of England (PRA) and Monetary Authority of Singapore (MAS).",
          "Drove vendor evaluations and build/buy analyses informing approved investments.",
          "Delivered training and change plans for large-scale rollouts exceeding 1,500 users."
        ]
      }
    ],
    "education": [
      {
        "school": "National University of Singapore (NUS)",
        "degree": "Master of Science (M.Sc.)",
        "field": "Financial Engineering",
        "graduationDate": "2017",
        "gpa": "4.85 / 5.0"
      },
      {
        "school": "Nanyang Technological University (NTU)",
        "degree": "Bachelor of Business (Honours)",
        "field": "Banking & Finance",
        "graduationDate": "2014"
      }
    ],
    "certifications": [
      "Financial Risk Manager (FRM) - GARP",
      "Chartered Financial Analyst (CFA) Charterholder"
    ]
  },
  {
    "id": "blackstone-senior-private-equity-associate",
    "company": "Blackstone",
    "companyKey": "blackstone",
    "brandColor": "#000000",
    "brandTextColor": "#FFFFFF",
    "role": "Senior Private Equity Investment Associate",
    "category": "FINANCE_BANKING",
    "badge": "PRO",
    "atsScore": 98,
    "experienceLevel": "MID_LEVEL",
    "experienceLevelLabel": "Mid Level (3–5 yrs)",
    "country": "United States",
    "resumeStyle": "Executive Clean",
    "isIllustrative": true,
    "candidate": {
      "name": "Alexander Sterling",
      "title": "Senior Private Equity Investment Associate",
      "location": "New York, NY",
      "email": "alex.sterling.pe@gmail.com",
      "phone": "+1 (212) 890-4521",
      "linkedin": "linkedin.com/in/alexsterling-pe"
    },
    "summary": "Private Equity Investment Associate with 4+ years of institutional investing and investment banking experience across enterprise software and business services. Proven track record sourcing, modeling, and executing buyout transactions exceeding $3.2B in aggregate enterprise value with top-quartile projected returns. Detail-oriented finance partner on close quality, capital allocation, and transaction execution.",
    "skills": [
      {
        "category": "Private Equity Investing",
        "skills": [
          "LBO Financial Modeling",
          "Investment Committee Memorandums",
          "Commercial Due Diligence",
          "Portfolio Company Value Creation",
          "Exit Structuring"
        ]
      },
      {
        "category": "Valuation & Diligence",
        "skills": [
          "Quality of Earnings (QoE)",
          "Competitive Moat Analysis",
          "Debt Financing Structuring",
          "Accretion / Dilution"
        ]
      },
      {
        "category": "Software & Data",
        "skills": [
          "Excel (Complex Financial Models)",
          "PitchBook",
          "CapIQ",
          "Bloomberg",
          "Alphasense"
        ]
      }
    ],
    "experience": [
      {
        "company": "Blackstone",
        "title": "Senior Private Equity Associate - Technology Buyouts",
        "location": "New York, NY",
        "startDate": "2023-01",
        "endDate": "Present",
        "current": true,
        "bullets": [
          "Evaluated over 70 platform investment opportunities, developing bespoke LBO models incorporating complex debt structures, management rollovers, and tax step-up benefits.",
          "Led end-to-end commercial due diligence and financing negotiation for a $1.4B take-private acquisition of an enterprise workflow automation software provider.",
          "Collaborated with portfolio executive leadership on post-acquisition 100-day plan, executing 2 bolt-on acquisitions and improving adjusted EBITDA margins by 480 bps.",
          "Supported structuring analyses influencing $120M capital deployment with documented return hurdles.",
          "Improved rolling forecast accuracy to ±3.2% via driver-based models adopted by segment leads.",
          "Prepared IC-ready models and sensitivity decks for transactions exceeding $1.8B combined enterprise value."
        ]
      },
      {
        "company": "Goldman Sachs",
        "title": "Investment Banking Analyst - Technology, Media & Telecom (TMT)",
        "location": "New York, NY",
        "startDate": "2021-07",
        "endDate": "2022-12",
        "bullets": [
          "Built comprehensive financial models, merger models, and board presentations for 4 closed software M&A transactions totaling $2.8B in deal value.",
          "Conducted detailed recurring revenue (ARR), net retention (NDR), and cohort lifetime value analyses for sell-side M&A pitches.",
          "Prepared diligence binders and management Q&A for live deals contributing to successful signings.",
          "Reconciled multi-entity ledgers with zero material adjustments in external audit."
        ]
      }
    ],
    "education": [
      {
        "school": "Princeton University",
        "degree": "Bachelor of Arts (A.B.)",
        "field": "Economics",
        "graduationDate": "2021",
        "gpa": "3.94 / 4.0",
        "honors": "Summa Cum Laude, Phi Beta Kappa"
      }
    ],
    "certifications": [
      "CFA Level I Passed"
    ]
  },
  {
    "id": "wealthsimple-senior-fpa-saas-manager",
    "company": "Wealthsimple",
    "companyKey": "wealthsimple",
    "brandColor": "#2B2B2B",
    "brandTextColor": "#FFFFFF",
    "role": "Director of FP&A and SaaS Financial Operations",
    "category": "FINANCE_BANKING",
    "badge": "PRO",
    "atsScore": 97,
    "experienceLevel": "STAFF_LEAD",
    "experienceLevelLabel": "Staff / Lead (8+ yrs)",
    "country": "Canada",
    "resumeStyle": "ATS Classic",
    "isIllustrative": true,
    "candidate": {
      "name": "Stephanie Tremblay",
      "title": "Director of FP&A and SaaS Financial Operations",
      "location": "Toronto, Canada",
      "email": "stephanie.tremblay.fpa@gmail.com",
      "phone": "+1 (416) 902-3481",
      "linkedin": "linkedin.com/in/stephanietremblay-fpa"
    },
    "summary": "Director of Financial Planning and Analysis with 8+ years leading enterprise budgeting, ARR forecasting, and strategic finance operations in high-growth fintech and SaaS platforms. Expert in multi-currency rolling forecasts, board financial reporting packages, unit economic cohort models, and headcount planning for 1,500+ employees. Detail-oriented finance partner on close quality, capital allocation, and transaction execution.",
    "skills": [
      {
        "category": "Corporate FP&A",
        "skills": [
          "Rolling Financial Forecasts",
          "Annual Operating Plans (AOP)",
          "Board Reporting Packages",
          "Variance Analysis",
          "SaaS Metrics (CAC, LTV, NDR)"
        ]
      },
      {
        "category": "Strategic Finance",
        "skills": [
          "Pricing & Margin Optimization",
          "Capital Allocation",
          "Cash Flow Modeling",
          "Runway Management"
        ]
      },
      {
        "category": "Financial Systems",
        "skills": [
          "Adaptive Planning",
          "NetSuite ERP",
          "Anaplan",
          "SQL",
          "Tableau",
          "Excel"
        ]
      }
    ],
    "experience": [
      {
        "company": "Wealthsimple",
        "title": "Director of Financial Planning & Analysis (FP&A)",
        "location": "Toronto, Canada",
        "startDate": "2021-08",
        "endDate": "Present",
        "current": true,
        "bullets": [
          "Led corporate financial planning for $60M operating expense budget, collaborating with C-suite leadership to deliver a 3-year path to profitable adjusted EBITDA.",
          "Constructed dynamic rolling revenue model forecasting Assets Under Management (AUM) and fee yields across 3M active Canadian retail investors with 98% accuracy.",
          "Instituted cloud hosting and third-party software procurement review committee, saving $3.4M in recurring annual operational expenditure.",
          "Improved rolling forecast accuracy to ±3.2% via driver-based models adopted by segment leads.",
          "Coached analysts on DCF, LBO, and comps frameworks with both mentees rated exceeds expectations.",
          "Supported structuring analyses influencing $120M capital deployment with documented return hurdles."
        ]
      },
      {
        "company": "Lightspeed Commerce",
        "title": "Senior Manager of Financial Planning & Analysis",
        "location": "Montreal, Canada",
        "startDate": "2017-09",
        "endDate": "2021-07",
        "bullets": [
          "Engineered multi-currency consolidation model in Adaptive Insights for 8 international subsidiaries following 3 cross-border acquisitions.",
          "Built monthly executive KPI dashboard tracking organic vs acquired ARR growth, customer acquisition cost payback, and gross margin evolution.",
          "Built portfolio monitoring dashboards highlighting EBITDA bridge opportunities pre-close.",
          "Prepared diligence binders and management Q&A for live deals contributing to successful signings."
        ]
      }
    ],
    "education": [
      {
        "school": "McGill University - Desautels Faculty of Management",
        "degree": "Bachelor of Commerce (B.Com)",
        "field": "Finance & Accounting",
        "graduationDate": "2017",
        "honors": "Great Distinction"
      }
    ],
    "certifications": [
      "Chartered Professional Accountant (CPA, CA) Canada",
      "Certified Corporate FP&A Professional (FPAC)"
    ]
  },
  {
    "id": "apollo-consultant-interventional-cardiologist",
    "company": "Apollo Hospitals",
    "companyKey": "apollo",
    "brandColor": "#005A9C",
    "brandTextColor": "#FFFFFF",
    "role": "Consultant Interventional Cardiologist (MD / DM)",
    "category": "HEALTHCARE",
    "badge": "PRO",
    "atsScore": 98,
    "experienceLevel": "STAFF_LEAD",
    "experienceLevelLabel": "Staff / Lead (8+ yrs)",
    "country": "India",
    "resumeStyle": "Executive Clean",
    "isIllustrative": true,
    "candidate": {
      "name": "Dr. Rahul Verma",
      "title": "Consultant Interventional Cardiologist",
      "location": "Mumbai, India",
      "email": "dr.rahul.verma.cardio@gmail.com",
      "phone": "+91 98201 45678",
      "linkedin": "linkedin.com/in/drrahulverma-cardio"
    },
    "summary": "Board-certified Consultant Interventional Cardiologist with 8+ years of advanced clinical practice in high-volume tertiary cardiovascular care centers. Successfully performed over 2,200 coronary angiographies and angioplasties (radial & femoral approaches). Expert in complex bifurcation lesions, intravascular ultrasound (IVUS), FFR/iFR, and post-operative cardiac intensive care management. Translates customer insight and economics into actionable roadmaps spanning engineering, GTM, and operations.",
    "skills": [
      {
        "category": "Interventional Cardiology",
        "skills": [
          "Transradial Coronary Angiography (CAG)",
          "Percutaneous Coronary Intervention (PCI)",
          "Primary PTCA in Acute STEMI",
          "Bifurcation Stenting",
          "Rotablation"
        ]
      },
      {
        "category": "Diagnostic & Imaging",
        "skills": [
          "Intravascular Ultrasound (IVUS)",
          "Optical Coherence Tomography (OCT)",
          "Fractional Flow Reserve (FFR)",
          "2D/3D Echocardiography"
        ]
      },
      {
        "category": "Clinical Governance",
        "skills": [
          "Cardiac ICU Management",
          "NABH Quality Accreditation",
          "Clinical Research & Protocols",
          "Patient Safety Protocols"
        ]
      }
    ],
    "experience": [
      {
        "company": "Apollo Hospitals",
        "title": "Senior Consultant Interventional Cardiologist",
        "location": "Mumbai, India",
        "startDate": "2021-04",
        "endDate": "Present",
        "current": true,
        "bullets": [
          "Conducted over 1,400 diagnostic coronary angiographies and 650 complex angioplasties with a 99.1% technical procedural success rate and zero hospital mortality in elective cases.",
          "Pioneered primary transradial PTCA pathway for acute myocardial infarction, reducing median door-to-balloon time to 42 minutes (well under the 90-minute international guideline).",
          "Instituted systematic post-CABG and post-stenting patient rehabilitation monitoring, cutting 30-day unplanned readmission rate by 18.4%.",
          "Chaired hospital clinical mortality review committee and mentored 14 cardiology residents in catheterization lab technique.",
          "Authored PRD templates and decision logs adopted across portfolio, accelerating stakeholder alignment cycles.",
          "Negotiated roadmap tradeoffs with sales and support, reducing escalations on missing enterprise capabilities by 33%."
        ]
      },
      {
        "company": "Fortis Healthcare",
        "title": "Associate Consultant - Cardiology & Critical Care",
        "location": "Mumbai, India",
        "startDate": "2018-08",
        "endDate": "2021-03",
        "bullets": [
          "Managed 24-bed Cardiac Intensive Care Unit (CICU), stabilizing patients with acute cardiogenic shock, intra-aortic balloon pump (IABP) support, and severe arrhythmias.",
          "Published 4 peer-reviewed research papers on drug-eluting stent longevity in Indian diabetic cohorts in the Indian Heart Journal.",
          "Delivered training and change plans for large-scale rollouts exceeding 1,500 users.",
          "Synthesized competitive teardowns and win/loss interviews into exec-ready strategy memos."
        ]
      }
    ],
    "education": [
      {
        "school": "All India Institute of Medical Sciences (AIIMS), New Delhi",
        "degree": "Doctorate of Medicine (DM)",
        "field": "Cardiology",
        "graduationDate": "2018",
        "honors": "Gold Medalist in Cardiology"
      },
      {
        "school": "King Edward Memorial (KEM) Hospital & Seth GS Medical College",
        "degree": "Doctor of Medicine (MD)",
        "field": "General Medicine",
        "graduationDate": "2015"
      },
      {
        "school": "Grant Government Medical College & Sir JJ Hospital",
        "degree": "Bachelor of Medicine, Bachelor of Surgery (MBBS)",
        "graduationDate": "2011",
        "field": "Bachelor of Medicine, Bachelor of Surgery (MBBS)"
      }
    ],
    "certifications": [
      "Fellow of the European Society of Cardiology (FESC)",
      "Medical Council of India (MCI) Registered Specialist"
    ]
  },
  {
    "id": "mayo-clinic-senior-nurse-practitioner-icu",
    "company": "Mayo Clinic",
    "companyKey": "mayoclinic",
    "brandColor": "#002855",
    "brandTextColor": "#FFFFFF",
    "role": "Senior Critical Care Nurse Practitioner (MSN / APRN)",
    "category": "HEALTHCARE",
    "badge": "PRO",
    "atsScore": 99,
    "experienceLevel": "SENIOR_LEVEL",
    "experienceLevelLabel": "Senior (6–9 yrs)",
    "country": "United States",
    "resumeStyle": "ATS Classic",
    "isIllustrative": true,
    "candidate": {
      "name": "Jennifer Ross",
      "title": "Senior Critical Care Nurse Practitioner",
      "location": "Rochester, MN",
      "email": "jennifer.ross.aprn@gmail.com",
      "phone": "+1 (507) 890-2341",
      "linkedin": "linkedin.com/in/jenniferross-aprn"
    },
    "summary": "Board-certified Acute Care Nurse Practitioner (AGACNP-BC) with 8+ years delivering advanced physiological care to critically ill patients in Level-1 trauma and medical-surgical ICUs. Expert in mechanical ventilation management, central line & arterial line placement, hemodynamic monitoring, and multidisciplinary ICU team leadership. Patient-centered clinician-operator focused on safety, throughput, and evidence-based quality improvement.",
    "skills": [
      {
        "category": "Critical Care & Procedures",
        "skills": [
          "Endotracheal Intubation",
          "Central Venous Catheterization (CVC)",
          "Arterial Lines",
          "Thoracentesis",
          "Lumbar Puncture"
        ]
      },
      {
        "category": "Hemodynamic & Life Support",
        "skills": [
          "Advanced Cardiac Life Support (ACLS)",
          "CRRT (Continuous Renal Replacement)",
          "ECMO Patient Management",
          "Vasoactive Drug Titration"
        ]
      },
      {
        "category": "Clinical Systems",
        "skills": [
          "Epic Systems (EHR)",
          "Point-of-Care Ultrasound (POCUS)",
          "Quality & Sepsis Bundles",
          "Hospital-Acquired Infection (HAI) Prevention"
        ]
      }
    ],
    "experience": [
      {
        "company": "Mayo Clinic Hospital",
        "title": "Lead Advanced Practice Registered Nurse (APRN) - Medical ICU",
        "location": "Rochester, MN",
        "startDate": "2021-05",
        "endDate": "Present",
        "current": true,
        "bullets": [
          "Managed daily complex clinical care plans for 24-bed Medical ICU, conducting independent clinical assessments, invasive line procedures, and diagnostic interpretation.",
          "Championed evidence-based hospital-wide Sepsis Protocol revamp, reducing sepsis-related mortality in the MICU by 21.6% over a 24-month period.",
          "Performed over 400 ultrasound-guided central line and arterial catheterizations with zero procedural complications and zero catheter-associated bloodstream infections (CLABSI).",
          "Served as clinical preceptor for 12 graduate nurse practitioner students and chaired the Critical Care Quality and Patient Safety Committee.",
          "Maintained Joint Commission readiness with 100% successful mock survey outcomes two years running.",
          "Led pathway redesign reducing length of stay 0.5 days while improving quality composite scores 7 points."
        ]
      },
      {
        "company": "Johns Hopkins Hospital",
        "title": "Critical Care Registered Nurse (RN) - Surgical Trauma ICU",
        "location": "Baltimore, MD",
        "startDate": "2017-06",
        "endDate": "2021-04",
        "bullets": [
          "Delivered continuous bedside nursing care for unstable surgical trauma patients requiring ECMO support, intracranial pressure monitoring, and massive blood transfusions.",
          "Achieved Beacon Award for Excellence in Nursing by sustaining 100% adherence to ventilator-associated pneumonia (VAP) reduction bundles.",
          "Delivered staff education improving protocol adherence audits to 96%.",
          "Managed high-acuity panels with mortality indices within risk-adjusted expectations."
        ]
      }
    ],
    "education": [
      {
        "school": "Johns Hopkins University School of Nursing",
        "degree": "Master of Science in Nursing (MSN)",
        "field": "Adult-Gerontology Acute Care Nurse Practitioner",
        "graduationDate": "2021",
        "gpa": "3.96 / 4.0"
      },
      {
        "school": "University of Minnesota",
        "degree": "Bachelor of Science in Nursing (BSN)",
        "graduationDate": "2017",
        "honors": "Summa Cum Laude",
        "field": "Bachelor of Science in Nursing (BSN)"
      }
    ],
    "certifications": [
      "Adult-Gerontology Acute Care Nurse Practitioner (AGACNP-BC) - ANCC",
      "Critical Care Registered Nurse (CCRN) - AACN",
      "Advanced Cardiovascular Life Support (ACLS) Instructor"
    ]
  },
  {
    "id": "astrazeneca-director-clinical-trials",
    "company": "AstraZeneca",
    "companyKey": "astrazeneca",
    "brandColor": "#003865",
    "brandTextColor": "#FFFFFF",
    "role": "Director of Global Clinical Trial Operations & Oncology Protocols",
    "category": "HEALTHCARE",
    "badge": "PRO",
    "atsScore": 98,
    "experienceLevel": "EXECUTIVE",
    "experienceLevelLabel": "Executive (10+ yrs)",
    "country": "United Kingdom",
    "resumeStyle": "Executive Clean",
    "isIllustrative": true,
    "candidate": {
      "name": "Dr. Alistair MacLeod",
      "title": "Director of Global Clinical Trial Operations",
      "location": "Cambridge, United Kingdom",
      "email": "alistair.macleod.trials@gmail.com",
      "phone": "+44 1223 890123",
      "linkedin": "linkedin.com/in/alistairmacleod-clinical"
    },
    "summary": "Executive Clinical Operations Director with 11+ years directing Phase I–III global oncology and immunology clinical trials. Oversaw clinical trial budgets exceeding $140M across 120 global investigation sites spanning North America, Europe, and Asia. Expert in ICH-GCP regulatory compliance, CRO vendor management, FDA/EMA NDA filings, and decentralized clinical trial protocols. Patient-centered clinician-operator focused on safety, throughput, and evidence-based quality improvement.",
    "skills": [
      {
        "category": "Clinical Operations",
        "skills": [
          "Global Phase I-III Clinical Trials",
          "ICH-GCP / FDA 21 CFR Part 11",
          "Trial Protocol Design",
          "CRO & Site Vendor Oversight",
          "Patient Recruitment & Retention"
        ]
      },
      {
        "category": "Regulatory & Quality",
        "skills": [
          "FDA NDA / EMA MAA Filings",
          "Institutional Review Board (IRB) Submissions",
          "Clinical Data Quality (CDISC / SDTM)",
          "Audit Readiness"
        ]
      },
      {
        "category": "Trial Systems",
        "skills": [
          "Medidata Rave EDC",
          "Veeva Vault CTMS",
          "eTMF Governance",
          "R / SAS for Clinical Data"
        ]
      }
    ],
    "experience": [
      {
        "company": "AstraZeneca",
        "title": "Director of Global Clinical Operations - Immuno-Oncology",
        "location": "Cambridge, United Kingdom",
        "startDate": "2020-09",
        "endDate": "Present",
        "current": true,
        "bullets": [
          "Led global execution of Phase III multi-center immunotherapy trial involving 1,450 oncology patients across 18 countries, achieving primary clinical endpoint 4 months ahead of schedule.",
          "Managed $85M clinical trial program budget, optimizing patient screening workflows to decrease per-patient recruitment cost by 22%.",
          "Successfully led FDA and EMA pre-approval inspection audit audits across European clinical investigator sites with zero Form 483 critical observations.",
          "Implemented decentralized clinical trial technology (wearables & telemedicine), increasing patient protocol retention from 78% to 94%.",
          "Partnered with informatics reducing duplicate orders 17%, saving $900K annual supply costs.",
          "Coordinated throughput initiatives raising HCAHPS percentile ranks 12 points regionally."
        ]
      },
      {
        "company": "GlaxoSmithKline (GSK)",
        "title": "Senior Clinical Trial Program Manager - Oncology",
        "location": "London, United Kingdom",
        "startDate": "2016-03",
        "endDate": "2020-08",
        "bullets": [
          "Supervised 4 global Phase II solid-tumor clinical studies, managing contract research organizations (CROs) and central laboratory vendors.",
          "Authored Clinical Study Reports (CSR) and integrated safety summaries supporting successful European Medicines Agency (EMA) accelerated approval filing.",
          "Ran QI cycles cutting CLABSI rates 32% over 16 months.",
          "Delivered staff education improving protocol adherence audits to 96%."
        ]
      }
    ],
    "education": [
      {
        "school": "University of Cambridge",
        "degree": "Ph.D.",
        "field": "Pharmacology & Molecular Oncology",
        "graduationDate": "2015"
      },
      {
        "school": "University College London (UCL)",
        "degree": "B.Sc. (Hons)",
        "field": "Biochemistry",
        "graduationDate": "2011",
        "honors": "First Class Honours"
      }
    ],
    "certifications": [
      "Certified Clinical Research Professional (CCRP) - SoCRA",
      "Project Management Professional (PMP)"
    ]
  },
  {
    "id": "kaiser-senior-health-informatics-architect",
    "company": "Kaiser Permanente",
    "companyKey": "kaiser",
    "brandColor": "#006699",
    "brandTextColor": "#FFFFFF",
    "role": "Principal Health Informatics & Epic EHR Architect",
    "category": "HEALTHCARE",
    "badge": "PRO",
    "atsScore": 97,
    "experienceLevel": "STAFF_LEAD",
    "experienceLevelLabel": "Staff / Lead (8+ yrs)",
    "country": "United States",
    "resumeStyle": "Modern Technical",
    "isIllustrative": true,
    "candidate": {
      "name": "Nathaniel Hayes",
      "title": "Principal Health Informatics & Epic EHR Architect",
      "location": "Oakland, CA",
      "email": "nathaniel.hayes.ehr@gmail.com",
      "phone": "+1 (510) 789-2310",
      "linkedin": "linkedin.com/in/nathanielhayes-ehr"
    },
    "summary": "Principal Health Informatics Architect with 9+ years architecting enterprise Epic EHR integrations, HL7 FHIR interoperability pipelines, and clinical decision support (CDS) algorithms. Guided clinical workflow optimizations for 39 acute care hospitals and 700+ outpatient facilities serving 12.5M members while ensuring strict HIPAA and HITECH compliance. Patient-centered clinician-operator focused on safety, throughput, and evidence-based quality improvement.",
    "skills": [
      {
        "category": "Health Informatics & Standards",
        "skills": [
          "Epic EHR (Bridges, Chronicles, Cogito)",
          "HL7 FHIR (R4)",
          "SMART on FHIR",
          "C-CDA Standards",
          "HIPAA / HITECH Compliance"
        ]
      },
      {
        "category": "Data & Architecture",
        "skills": [
          "SQL / Oracle",
          "Python",
          "InterSystems Caché / IRIS",
          "Mirth Connect Integration Engine",
          "Snowflake Healthcare Data Cloud"
        ]
      },
      {
        "category": "Clinical Systems",
        "skills": [
          "Clinical Decision Support (CDS Hooks)",
          "Computerized Physician Order Entry (CPOE)",
          "PACS / DICOM Integration"
        ]
      }
    ],
    "experience": [
      {
        "company": "Kaiser Permanente",
        "title": "Principal Health Informatics Architect - Enterprise Clinical Systems",
        "location": "Oakland, CA",
        "startDate": "2021-02",
        "endDate": "Present",
        "current": true,
        "bullets": [
          "Architected real-time HL7 FHIR API gateway connecting Epic EHR with external state health information exchanges (HIE), facilitating 18M secure patient record transfers annually.",
          "Engineered algorithmic sepsis early-warning CDS Hooks alert within the physician EHR workflow, cutting inpatient sepsis mortality by 16.2% across Northern California hospitals.",
          "Eliminated redundant clinical documentation clicks by 28% through custom clinician order sets and automated telemetry flowsheets, recovering 45 minutes of daily physician documentation time.",
          "Implemented CDS and order-set updates lowering preventable adverse events 18% in pilot units.",
          "Partnered with informatics reducing duplicate orders 17%, saving $900K annual supply costs.",
          "Mentored trainees with 93% board pass rates across supervised cohorts."
        ]
      },
      {
        "company": "Sutter Health",
        "title": "Senior Clinical Systems Analyst - Epic Inpatient",
        "location": "Sacramento, CA",
        "startDate": "2017-08",
        "endDate": "2021-01",
        "bullets": [
          "Led Epic ClinDoc and CPOE module rollout for 3 regional hospitals, training 850 nurses and attending physicians with 98% post-go-live satisfaction.",
          "Built real-time medication reconciliation interface reducing adverse drug event errors by 34% during emergency room admissions.",
          "Managed high-acuity panels with mortality indices within risk-adjusted expectations.",
          "Delivered staff education improving protocol adherence audits to 96%."
        ]
      }
    ],
    "education": [
      {
        "school": "University of California, San Francisco (UCSF)",
        "degree": "Master of Science (M.S.)",
        "field": "Biomedical Informatics",
        "graduationDate": "2017"
      },
      {
        "school": "University of California, Berkeley",
        "degree": "Bachelor of Arts (B.A.)",
        "field": "Public Health & Computer Science",
        "graduationDate": "2014"
      }
    ],
    "certifications": [
      "Epic Certified Bridges Interface Specialist",
      "Epic Certified Cogito Analytics Consultant",
      "Certified in Healthcare Information and Management Systems (CPHIMS)"
    ]
  },
  {
    "id": "uhn-clinical-pharmacy-specialist",
    "company": "University Health Network",
    "companyKey": "uhn",
    "brandColor": "#003366",
    "brandTextColor": "#FFFFFF",
    "role": "Clinical Pharmacy Specialist & Pharmacotherapy Lead",
    "category": "HEALTHCARE",
    "badge": "PRO",
    "atsScore": 98,
    "experienceLevel": "SENIOR_LEVEL",
    "experienceLevelLabel": "Senior (6–9 yrs)",
    "country": "Canada",
    "resumeStyle": "ATS Classic",
    "isIllustrative": true,
    "candidate": {
      "name": "Sarah Tremblay-Roy",
      "title": "Clinical Pharmacy Specialist & Pharmacotherapy Lead",
      "location": "Toronto, Canada",
      "email": "sarah.tremblay.pharm@gmail.com",
      "phone": "+1 (416) 890-4512",
      "linkedin": "linkedin.com/in/sarahtremblay-pharm"
    },
    "summary": "Board-Certified Pharmacotherapy Specialist (BCPS) with 7+ years of advanced clinical hospital practice in multi-organ transplant and medical oncology units. Proven expert in therapeutic drug monitoring (TDM), antimicrobial stewardship, pharmacogenomics, and adverse drug event prevention across complex polypharmacy patient populations. Patient-centered clinician-operator focused on safety, throughput, and evidence-based quality improvement.",
    "skills": [
      {
        "category": "Clinical Pharmacy",
        "skills": [
          "Therapeutic Drug Monitoring (Vancomycin, Aminoglycosides, Tacrolimus)",
          "Antimicrobial Stewardship",
          "Chemotherapy Regimen Validation",
          "Parenteral Nutrition (TPN)"
        ]
      },
      {
        "category": "Governance & Safety",
        "skills": [
          "Hospital Formulary Management",
          "Adverse Drug Reaction (ADR) Reporting",
          "Epic Willow Inpatient",
          "Pharmacokinetics Modeling"
        ]
      },
      {
        "category": "Interprofessional Practice",
        "skills": [
          "Multidisciplinary ICU Rounds",
          "Patient Medication Counseling",
          "Clinical Preceptorship"
        ]
      }
    ],
    "experience": [
      {
        "company": "University Health Network (Toronto General Hospital)",
        "title": "Clinical Pharmacy Specialist - Solid Organ Transplant",
        "location": "Toronto, Canada",
        "startDate": "2021-07",
        "endDate": "Present",
        "current": true,
        "bullets": [
          "Led pharmacotherapy management for kidney and liver transplant recipients, dosing immunosuppressive regimens (Tacrolimus/Cyclosporine) based on Bayesian pharmacokinetic curves.",
          "Spearheaded hospital Antimicrobial Stewardship Program (ASP) audit, reducing inappropriate broad-spectrum antibiotic days of therapy by 28% and hospital pharmaceutical spend by $420,000.",
          "Detected and resolved over 1,200 potential drug-drug interactions and dosing errors during daily ICU multidisciplinary clinical rounds.",
          "Mentored trainees with 93% board pass rates across supervised cohorts.",
          "Coordinated throughput initiatives raising HCAHPS percentile ranks 12 points regionally.",
          "Implemented CDS and order-set updates lowering preventable adverse events 18% in pilot units."
        ]
      },
      {
        "company": "Sunnybrook Health Sciences Centre",
        "title": "Clinical Staff Pharmacist - Critical Care & Oncology",
        "location": "Toronto, Canada",
        "startDate": "2018-06",
        "endDate": "2021-06",
        "bullets": [
          "Verified and compounded high-risk parenteral chemotherapy protocols in sterile cleanroom compliant with USP 797/800 guidelines.",
          "Educated over 500 discharged heart failure and oncology patients on complex medication adherence, cutting 30-day readmissions by 14%.",
          "Delivered staff education improving protocol adherence audits to 96%.",
          "Contributed registry enrollments meeting 100% data integrity for sponsor monitoring."
        ]
      }
    ],
    "education": [
      {
        "school": "University of Toronto - Leslie Dan Faculty of Pharmacy",
        "degree": "Doctor of Pharmacy (Pharm.D.)",
        "graduationDate": "2018",
        "honors": "Dean’s Honour List",
        "field": "Doctor of Pharmacy (Pharm.D.)"
      },
      {
        "school": "University of Toronto",
        "degree": "Post-Graduate Pharmacy Residency (CPRB Accredited)",
        "graduationDate": "2019",
        "field": "Post-Graduate Pharmacy Residency (CPRB Accredited)"
      }
    ],
    "certifications": [
      "Board Certified Pharmacotherapy Specialist (BCPS)",
      "Licensed Pharmacist - Ontario College of Pharmacists (OCP)"
    ]
  },
  {
    "id": "siemens-healthineers-biomedical-systems-lead",
    "company": "Siemens Healthineers",
    "companyKey": "siemens",
    "brandColor": "#EB780A",
    "brandTextColor": "#FFFFFF",
    "role": "Staff Biomedical Systems & Diagnostic Imaging Engineer",
    "category": "HEALTHCARE",
    "badge": "PRO",
    "atsScore": 98,
    "experienceLevel": "STAFF_LEAD",
    "experienceLevelLabel": "Staff / Lead (8+ yrs)",
    "country": "Germany",
    "resumeStyle": "Modern Technical",
    "isIllustrative": true,
    "candidate": {
      "name": "Felix Hartmann",
      "title": "Staff Biomedical Systems & Diagnostic Imaging Engineer",
      "location": "Erlangen, Germany",
      "email": "felix.hartmann.med@gmail.com",
      "phone": "+49 9131 890123",
      "linkedin": "linkedin.com/in/felixhartmann-biomed"
    },
    "summary": "Staff Biomedical Systems Engineer with 8+ years developing high-resolution Magnetic Resonance Imaging (MRI) and Computed Tomography (CT) hardware and image reconstruction algorithms. Expert in medical device regulatory standards (IEC 60601, ISO 13485, FDA 510(k)), RF coil design, DICOM networking, and real-time GPU image filtering. Patient-centered clinician-operator focused on safety, throughput, and evidence-based quality improvement.",
    "skills": [
      {
        "category": "Medical Device Engineering",
        "skills": [
          "MRI / CT System Architecture",
          "IEC 60601-1 / IEC 62304 Compliance",
          "ISO 13485",
          "RF Pulse Sequence Design",
          "DICOM / PACS"
        ]
      },
      {
        "category": "Hardware & Systems",
        "skills": [
          "C++20",
          "CUDA",
          "Python",
          "MATLAB / Simulink",
          "Signal Processing",
          "FPGA Interfacing"
        ]
      },
      {
        "category": "Image Processing",
        "skills": [
          "Deep Learning Denoising",
          "Iterative CT Reconstruction",
          "Fourier Transform Analysis",
          "Image Segmentation"
        ]
      }
    ],
    "experience": [
      {
        "company": "Siemens Healthineers",
        "title": "Staff Systems Engineer - MRI Scanner Hardware & Reconstruction",
        "location": "Erlangen, Germany",
        "startDate": "2021-04",
        "endDate": "Present",
        "current": true,
        "bullets": [
          "Led systems engineering for 3-Tesla clinical MRI scanner gradient coil subsystem, reducing acoustic noise emission by 18 dBA while maintaining gradient slew rate performance.",
          "Engineered deep-learning image reconstruction kernel in CUDA and C++, cutting patient scan acquisition times by 45% with zero diagnostic image SNR degradation.",
          "Authored system verification and risk management documentation for FDA 510(k) and CE Mark regulatory submissions, achieving approval with zero deficiency letters.",
          "Maintained Joint Commission readiness with 100% successful mock survey outcomes two years running.",
          "Partnered with informatics reducing duplicate orders 17%, saving $900K annual supply costs.",
          "Implemented CDS and order-set updates lowering preventable adverse events 18% in pilot units."
        ]
      },
      {
        "company": "Philips Healthcare",
        "title": "Biomedical Engineer - Diagnostic CT Imaging Systems",
        "location": "Hamburg, Germany",
        "startDate": "2017-09",
        "endDate": "2021-03",
        "bullets": [
          "Optimized X-ray tube thermal dissipation control algorithms in MATLAB/Simulink, increasing scanner daily patient throughput capacity by 28%.",
          "Conducted electromagnetic compatibility (EMC) and electrical safety testing per IEC 60601-1-2 standards across 4 production prototypes.",
          "Delivered staff education improving protocol adherence audits to 96%.",
          "Managed high-acuity panels with mortality indices within risk-adjusted expectations."
        ]
      }
    ],
    "projects": [
      {
        "name": "DicomScan-Pro — Fast C++20 DICOM Metadata Inspector",
        "description": "Ultra-fast medical imaging tag validator and anonymization engine conforming to IHE Radiology technical profiles.",
        "techStack": [
          "C++20",
          "DICOM",
          "Qt",
          "CMake"
        ],
        "url": "github.com/fhartmann-med/dicomscan-pro",
        "highlights": [
          "Adopted by 15 academic radiology research labs across Europe."
        ]
      }
    ],
    "education": [
      {
        "school": "RWTH Aachen University",
        "degree": "M.Sc.",
        "field": "Biomedical Engineering & Medical Electronics",
        "graduationDate": "2017",
        "gpa": "1.2 (High Honors)"
      }
    ],
    "certifications": [
      "Certified Biomedical Equipment Technician (CBET)",
      "IEC 62304 Medical Device Software Standard Certification"
    ]
  },
  {
    "id": "salesforce-associate-general-counsel-saas",
    "company": "Salesforce",
    "companyKey": "salesforce",
    "brandColor": "#00A1E0",
    "brandTextColor": "#FFFFFF",
    "role": "Associate General Counsel (Enterprise Commercial & AI SaaS)",
    "category": "LEGAL",
    "badge": "PRO",
    "atsScore": 99,
    "experienceLevel": "EXECUTIVE",
    "experienceLevelLabel": "Executive (10+ yrs)",
    "country": "United States",
    "resumeStyle": "Executive Clean",
    "isIllustrative": true,
    "candidate": {
      "name": "Victoria Vance",
      "title": "Associate General Counsel",
      "location": "San Francisco, CA",
      "email": "victoria.vance.esq@gmail.com",
      "phone": "+1 (415) 890-1123",
      "linkedin": "linkedin.com/in/victoriavance-esq"
    },
    "summary": "Corporate Technology Attorney and Associate General Counsel with 11+ years negotiating high-stakes multi-million dollar enterprise SaaS licensing, cloud master service agreements (MSAs), AI liability indemnities, and cross-border commercial transactions. Expert in European & US data protection, intellectual property licensing, and executive risk management. Bridges research rigor and production ML with strong evaluation, reproducibility, and responsible deployment practices.",
    "skills": [
      {
        "category": "Commercial Law & SaaS",
        "skills": [
          "Enterprise SaaS MSAs",
          "Service Level Agreements (SLAs)",
          "Data Processing Addendums (DPAs)",
          "AI & IP Indemnification",
          "Revenue Recognition (ASC 606)"
        ]
      },
      {
        "category": "Data Privacy & Governance",
        "skills": [
          "GDPR",
          "CCPA / CPRA",
          "EU AI Act Compliance",
          "HIPAA Business Associate Agreements",
          "SOC 2 / ISO 27001 Legal Reviews"
        ]
      },
      {
        "category": "Dispute Resolution & Negotiation",
        "skills": [
          "Cross-Border Negotiations",
          "Risk Allocation Strategies",
          "Outside Counsel Management",
          "Executive Advisory"
        ]
      }
    ],
    "experience": [
      {
        "company": "Salesforce",
        "title": "Associate General Counsel - Global Commercial Transactions & AI",
        "location": "San Francisco, CA",
        "startDate": "2020-10",
        "endDate": "Present",
        "current": true,
        "bullets": [
          "Structured and negotiated over $380M in aggregate contract value across Fortune 100 enterprise software and generative AI cloud transactions.",
          "Formulated company-wide AI Trust Legal Addendum addressing training data provenance, customer data confidentiality, and intellectual property non-infringement indemnities.",
          "Reduced contract review turnaround time from 14 business days to 3.5 days by designing modular negotiation playbooks and fallback clause matrices for 60 regional counsel.",
          "Partnered with infra on inference autoscaling and batching, cutting p95 latency 27% without GPU fleet expansion.",
          "Established data versioning and reproducible experiment manifests for cross-team model handoffs.",
          "Shipped offline evaluation harnesses with slice analysis, catching 9 regressions before online experiments launched."
        ]
      },
      {
        "company": "Latham & Watkins LLP",
        "title": "Senior Associate - Technology Transactions Practice",
        "location": "Silicon Valley, CA",
        "startDate": "2015-09",
        "endDate": "2020-09",
        "bullets": [
          "Represented technology clients in complex IP licensing agreements, joint ventures, and M&A intellectual property due diligence exceeding $8B in deal value.",
          "Drafted cross-border technology transfer agreements, patent licenses, and open-source software compliance policies.",
          "Collaborated on labeling guidelines and inter-annotator agreement studies improving gold-set quality.",
          "Presented quarterly model performance readouts tying offline metrics to business guardrails."
        ]
      }
    ],
    "education": [
      {
        "school": "Stanford Law School",
        "degree": "Juris Doctor (J.D.)",
        "graduationDate": "2015",
        "honors": "Order of the Coif, Senior Editor of Stanford Technology Law Review",
        "field": "Juris Doctor (J.D.)"
      },
      {
        "school": "Georgetown University",
        "degree": "Bachelor of Arts (B.A.)",
        "field": "Government & Philosophy",
        "graduationDate": "2012",
        "gpa": "3.91 / 4.0",
        "honors": "Magna Cum Laude"
      }
    ],
    "certifications": [
      "State Bar of California Active Member",
      "Certified Information Privacy Professional / United States (CIPP/US)"
    ]
  },
  {
    "id": "arm-lead-data-privacy-gdpr-counsel",
    "company": "Arm",
    "companyKey": "arm",
    "brandColor": "#0091BD",
    "brandTextColor": "#FFFFFF",
    "role": "Lead Privacy & Global Data Protection Counsel (CIPP/E)",
    "category": "LEGAL",
    "badge": "PRO",
    "atsScore": 98,
    "experienceLevel": "STAFF_LEAD",
    "experienceLevelLabel": "Staff / Lead (8+ yrs)",
    "country": "United Kingdom",
    "resumeStyle": "ATS Classic",
    "isIllustrative": true,
    "candidate": {
      "name": "Oliver St. John",
      "title": "Lead Privacy & Global Data Protection Counsel",
      "location": "Cambridge, United Kingdom",
      "email": "oliver.stjohn.law@gmail.com",
      "phone": "+44 1223 892341",
      "linkedin": "linkedin.com/in/oliverstjohn-privacy"
    },
    "summary": "Lead Privacy and Data Protection Counsel with 8+ years advising semiconductor, cloud, and AI engineering enterprises on international data transfer frameworks (Standard Contractual Clauses), UK/EU GDPR compliance, and privacy-by-design architectures. Advised engineering teams through major international privacy regulatory audits with zero sanctions. Partners with engineering and GTM on pragmatic security programs that accelerate—not block—shipping.",
    "skills": [
      {
        "category": "Data Privacy & Privacy Law",
        "skills": [
          "UK & EU GDPR",
          "Standard Contractual Clauses (SCCs)",
          "Transfer Impact Assessments (TIAs)",
          "Data Protection Impact Assessments (DPIAs)",
          "ePrivacy Directive"
        ]
      },
      {
        "category": "Compliance & Governance",
        "skills": [
          "Data Breach Response Protocols",
          "Data Subject Access Requests (DSARs)",
          "Binding Corporate Rules (BCRs)",
          "Vendor Due Diligence"
        ]
      },
      {
        "category": "Technical Privacy",
        "skills": [
          "Privacy-by-Design",
          "Differential Privacy Basics",
          "Data Pseudonymization & Anonymization Standards"
        ]
      }
    ],
    "experience": [
      {
        "company": "Arm",
        "title": "Lead Privacy Counsel - Global Intellectual Property & Cloud",
        "location": "Cambridge, United Kingdom",
        "startDate": "2021-05",
        "endDate": "Present",
        "current": true,
        "bullets": [
          "Spearheaded global privacy compliance framework covering 7,500 employees across 16 countries following Brexit and the EU-US Data Privacy Framework enactment.",
          "Conducted over 180 Data Protection Impact Assessments (DPIAs) and Transfer Impact Assessments (TIAs) for cloud EDA toolchains and machine learning analytics systems.",
          "Formulated automated Data Subject Access Request (DSAR) processing workflow, decreasing fulfillment time by 60% while maintaining 100% regulatory deadline adherence.",
          "Deployed WAF rules and bot mitigation tuned with false-positive review loops, blocking 2.1M malicious requests/month.",
          "Standardized SAST/DAST gates in CI with waiver governance, reducing critical CVE SLA breaches by 62%.",
          "Built threat modeling rituals for new services, identifying 17 design flaws remediated before GA."
        ]
      },
      {
        "company": "Clifford Chance LLP",
        "title": "Senior Associate - Data Privacy & Cybersecurity Practice",
        "location": "London, United Kingdom",
        "startDate": "2016-09",
        "endDate": "2021-04",
        "bullets": [
          "Advised multinational banking and technology institutions on cross-border data transfer structures, regulatory investigations, and ICO inquiries.",
          "Led breach response legal war-room for a high-profile ransomware incident, guiding notifications to European Data Protection Authorities in under 72 hours.",
          "Partnered with legal on vendor security questionnaires, shortening enterprise sales security review cycles.",
          "Implemented least-privilege IAM baselines and automated policy-as-code drift detection."
        ]
      }
    ],
    "education": [
      {
        "school": "University of Cambridge (Clare College)",
        "degree": "Master of Laws (LL.M.)",
        "field": "International Intellectual Property & Information Law",
        "graduationDate": "2016",
        "honors": "First Class with Distinction"
      },
      {
        "school": "King’s College London",
        "degree": "Bachelor of Laws (LL.B.)",
        "graduationDate": "2014",
        "field": "Bachelor of Laws (LL.B.)"
      }
    ],
    "certifications": [
      "Solicitor of the Senior Courts of England and Wales",
      "Certified Information Privacy Professional / Europe (CIPP/E)",
      "Certified Information Privacy Manager (CIPM)"
    ]
  },
  {
    "id": "qualcomm-senior-ip-patent-attorney",
    "company": "Qualcomm",
    "companyKey": "qualcomm",
    "brandColor": "#003B71",
    "brandTextColor": "#FFFFFF",
    "role": "Senior Intellectual Property & Patent Prosecution Counsel",
    "category": "LEGAL",
    "badge": "PRO",
    "atsScore": 98,
    "experienceLevel": "SENIOR_LEVEL",
    "experienceLevelLabel": "Senior (6–9 yrs)",
    "country": "United States",
    "resumeStyle": "Executive Clean",
    "isIllustrative": true,
    "candidate": {
      "name": "Dr. Gregory Chang",
      "title": "Senior Intellectual Property & Patent Prosecution Counsel",
      "location": "San Diego, CA",
      "email": "gregory.chang.patent@gmail.com",
      "phone": "+1 (858) 890-4521",
      "linkedin": "linkedin.com/in/gregorychang-patent"
    },
    "summary": "Registered Patent Attorney (USPTO) with 7+ years managing patent portfolio strategies, patent prosecution, and freedom-to-operate (FTO) analyses in 5G wireless standards, semiconductor chip architecture, and neural processing units. Authored and successfully prosecuted over 240 granted patent applications across USPTO, EPO, and JPO. Business-aware counsel translating regulatory complexity into scalable contract and privacy playbooks.",
    "skills": [
      {
        "category": "Patent Law & Prosecution",
        "skills": [
          "Patent Drafting & Prosecution",
          "Freedom-to-Operate (FTO) Opinions",
          "Patentability & Prior Art Searches",
          "Standard Essential Patents (SEPs)",
          "Inter Partes Review (IPR)"
        ]
      },
      {
        "category": "Technical Specialties",
        "skills": [
          "5G/6G Wireless Telecommunications",
          "Semiconductor Microarchitectures",
          "NPU & GPU Acceleration",
          "System-on-Chip (SoC)"
        ]
      },
      {
        "category": "IP Strategy",
        "skills": [
          "Portfolio Lifecycle Management",
          "Patent Landscaping",
          "Competitor Reverse Engineering Analysis",
          "Trade Secret Protection"
        ]
      }
    ],
    "experience": [
      {
        "company": "Qualcomm",
        "title": "Senior Patent Counsel - Wireless Technologies & Neural Systems",
        "location": "San Diego, CA",
        "startDate": "2021-06",
        "endDate": "Present",
        "current": true,
        "bullets": [
          "Managed worldwide patent portfolio for Qualcomm AI Engine and modem chipsets, prosecuting 85 high-value patent applications with 94% first-action allowance success.",
          "Conducted freedom-to-operate (FTO) clearing studies for 3 generations of Snapdragon flagship processors, mitigating patent infringement risks against rival patent assertions.",
          "Collaborated with 3GPP standards engineering delegates to identify and file priority patent applications covering Standard Essential Patents (SEPs) for 5G-Advanced networks.",
          "Updated IP and open-source policies reducing legal review queue time 35%.",
          "Presented governance updates commended by board risk committee for actionable remediation tracking.",
          "Partnered with sales on security exhibits enabling 8 Fortune 500 closes within risk appetite."
        ]
      },
      {
        "company": "Fish & Richardson P.C.",
        "title": "Patent Associate - Electrical & Computer Technology Practice",
        "location": "San Diego, CA",
        "startDate": "2017-09",
        "endDate": "2021-05",
        "bullets": [
          "Drafted and prosecuted over 150 patent applications before the USPTO in wireless communications, quantum computing, and cryptography.",
          "Prepared invalidity and non-infringement claim charts for patent litigation in the U.S. District Court for the District of Delaware.",
          "Maintained knowledge base improving self-service FAQ resolution 27%.",
          "Trained business partners on marketing substantiation eliminating warning-letter exposure."
        ]
      }
    ],
    "education": [
      {
        "school": "University of California, Berkeley - School of Law",
        "degree": "Juris Doctor (J.D.)",
        "graduationDate": "2017",
        "honors": "Berkeley Center for Law & Technology Certificate",
        "field": "Juris Doctor (J.D.)"
      },
      {
        "school": "University of California, San Diego (UCSD)",
        "degree": "Ph.D.",
        "field": "Electrical Engineering (Wireless Communications)",
        "graduationDate": "2014"
      }
    ],
    "certifications": [
      "Registered Patent Attorney before the USPTO (Reg. No. 72,410)",
      "State Bar of California Active Member"
    ]
  },
  {
    "id": "temasek-corporate-governance-counsel",
    "company": "Temasek Holdings",
    "companyKey": "temasek",
    "brandColor": "#002D62",
    "brandTextColor": "#FFFFFF",
    "role": "Head of Corporate Governance & Cross-Border M&A Counsel",
    "category": "LEGAL",
    "badge": "PRO",
    "atsScore": 98,
    "experienceLevel": "EXECUTIVE",
    "experienceLevelLabel": "Executive (10+ yrs)",
    "country": "Singapore",
    "resumeStyle": "Executive Clean",
    "isIllustrative": true,
    "candidate": {
      "name": "Adeline Tan",
      "title": "Head of Corporate Governance & Cross-Border M&A Counsel",
      "location": "Singapore",
      "email": "adeline.tan.legal@gmail.com",
      "phone": "+65 9345 6789",
      "linkedin": "linkedin.com/in/adelinetan-legal"
    },
    "summary": "Corporate Legal Counsel and Governance Executive with 10+ years advising sovereign wealth funds, institutional asset managers, and public multinational boards across Asia-Pacific. Expert in cross-border foreign direct investment (FDI), SGX listing rule compliance, ESG regulatory frameworks, and board secretariat operations. Detail-oriented finance partner on close quality, capital allocation, and transaction execution.",
    "skills": [
      {
        "category": "Corporate Governance & Law",
        "skills": [
          "Corporate Governance Codes",
          "Board Secretariat Operations",
          "SGX / MAS Securities Regulations",
          "ESG Compliance (TCFD / ISSB)",
          "Cross-Border FDI Structuring"
        ]
      },
      {
        "category": "Transaction Execution",
        "skills": [
          "Joint Ventures & Consortium Agreements",
          "Private Equity Shareholder Agreements",
          "Regulatory Approvals & CFIUS",
          "Antitrust Filings"
        ]
      },
      {
        "category": "Jurisdictions",
        "skills": [
          "Singapore Law",
          "English Law",
          "Hong Kong SAR Law",
          "BVI / Cayman Offshore Entities"
        ]
      }
    ],
    "experience": [
      {
        "company": "Temasek Holdings",
        "title": "Managing Director & Head of Legal - Global Governance & Investment",
        "location": "Singapore",
        "startDate": "2020-08",
        "endDate": "Present",
        "current": true,
        "bullets": [
          "Supervised legal structuring for $14B in global private equity, venture, and infrastructure direct investments across the Americas, Europe, and Southeast Asia.",
          "Formulated group-wide ESG Corporate Governance Framework adopted across 40 portfolio operating companies, establishing Board oversight of decarbonization targets.",
          "Successfully led foreign investment regulatory clearance filings before CFIUS (US), FIRB (Australia), and national security investment review authorities in Europe.",
          "Coached analysts on DCF, LBO, and comps frameworks with both mentees rated exceeds expectations.",
          "Improved rolling forecast accuracy to ±3.2% via driver-based models adopted by segment leads.",
          "Compressed monthly close cadence by automating flux commentary and reconciliations without audit exceptions."
        ]
      },
      {
        "company": "Allen & Gledhill LLP",
        "title": "Partner - Corporate M&A and Capital Markets Practice",
        "location": "Singapore",
        "startDate": "2014-07",
        "endDate": "2020-07",
        "bullets": [
          "Advised public listed issuers and investment banks on major SGX mainboard IPOs, rights issues, and public takeover bids totaling $6.5B in deal volume.",
          "Served as legal counsel to independent board committees evaluating related-party transactions and hostile takeover defenses.",
          "Reconciled multi-entity ledgers with zero material adjustments in external audit.",
          "Standardized management reporting packs across regional finance teams."
        ]
      }
    ],
    "education": [
      {
        "school": "National University of Singapore (NUS) Faculty of Law",
        "degree": "Bachelor of Laws (LL.B. Honours)",
        "graduationDate": "2014",
        "honors": "First Class Honours, Lee Kuan Yew Gold Medalist",
        "field": "Bachelor of Laws (LL.B. Honours)"
      }
    ],
    "certifications": [
      "Advocate and Solicitor of the Supreme Court of Singapore",
      "Fellow of the Singapore Institute of Directors (FSID)"
    ]
  },
  {
    "id": "snowflake-enterprise-strategic-account-exec",
    "company": "Snowflake",
    "companyKey": "snowflake",
    "brandColor": "#29B5E8",
    "brandTextColor": "#FFFFFF",
    "role": "Principal Enterprise Strategic Account Executive",
    "category": "SALES_HR",
    "badge": "PRO",
    "atsScore": 99,
    "experienceLevel": "STAFF_LEAD",
    "experienceLevelLabel": "Staff / Lead (8+ yrs)",
    "country": "United States",
    "resumeStyle": "Executive Clean",
    "isIllustrative": true,
    "candidate": {
      "name": "Jackson Miller",
      "title": "Principal Enterprise Strategic Account Executive",
      "location": "Chicago, IL",
      "email": "jackson.miller.sales@gmail.com",
      "phone": "+1 (312) 890-4521",
      "linkedin": "linkedin.com/in/jacksonmiller-sales"
    },
    "summary": "Enterprise Software Sales Leader with 9+ years exceeding multi-million dollar annual quotas selling cloud data platform, AI infrastructure, and analytics solutions to Fortune 100 financial and healthcare enterprises. Achieved 164% average quota attainment over 5 consecutive years, closing over $48M in total contract value (TCV). Builder of quota-attaining GTM and people programs with coaching-first leadership.",
    "skills": [
      {
        "category": "Enterprise Sales",
        "skills": [
          "MEDDIC / MEDDPICC Qualification",
          "Command of the Message",
          "Challenger Sales Methodology",
          "C-Level Executive Selling (CIO / CDO)",
          "Territory Planning"
        ]
      },
      {
        "category": "Deal Execution & Contract",
        "skills": [
          "Enterprise Cloud Agreements (ECA)",
          "Contract Negotiation ($1M - $10M+ TCV)",
          "Consumption-Based Pricing Models",
          "Ecosystem Co-Selling (AWS, Azure)"
        ]
      },
      {
        "category": "Tools & CRM",
        "skills": [
          "Salesforce",
          "Clari",
          "Gong.io",
          "LinkedIn Sales Navigator",
          "ZoomInfo"
        ]
      }
    ],
    "experience": [
      {
        "company": "Snowflake",
        "title": "Principal Strategic Account Executive - Midwest Major Accounts",
        "location": "Chicago, IL",
        "startDate": "2021-04",
        "endDate": "Present",
        "current": true,
        "bullets": [
          "Delivered $14.2M in Net New ARR against an $8.5M annual quota (167% attainment), winning President’s Club honors for 3 consecutive years.",
          "Closed the largest financial services consumption commitment in regional company history: a 3-year, $18M enterprise migration deal displacing legacy on-prem Teradata.",
          "Built joint go-to-market motions with AWS and Accenture systems integration practices, accelerating pipeline creation by 45% across Fortune 200 accounts.",
          "Launched customer success plays lifting gross retention from 90% to 95% in mid-market.",
          "Built enablement certifications adopted by 180+ customer-facing staff globally.",
          "Improved forecast accuracy from 70% to 88% via stage hygiene and mutual close plans."
        ]
      },
      {
        "company": "Salesforce",
        "title": "Senior Enterprise Account Executive - Financial Services Cloud",
        "location": "Chicago, IL",
        "startDate": "2016-08",
        "endDate": "2021-03",
        "bullets": [
          "Consistently outperformed annual sales quota, closing 22 enterprise multi-year subscription transactions totaling $21M in Total Contract Value.",
          "Championed MEDDPICC deal inspection rigor across a 6-person account team, maintaining 96% quarterly forecast accuracy in Clari.",
          "Administered engagement surveys with 87% participation and 90% action-item closure.",
          "Ran QBRs surfacing $2.1M expansion pipeline at 36% win rate."
        ]
      }
    ],
    "education": [
      {
        "school": "University of Notre Dame - Mendoza College of Business",
        "degree": "Bachelor of Business Administration (B.B.A.)",
        "field": "Finance & Marketing",
        "graduationDate": "2015",
        "gpa": "3.86 / 4.0"
      }
    ],
    "certifications": [
      "MEDDPICC Master Certified - Force Management",
      "Snowflake SnowPro Core Certified"
    ]
  },
  {
    "id": "deepmind-global-head-tech-recruiting",
    "company": "DeepMind",
    "companyKey": "deepmind",
    "brandColor": "#1A73E8",
    "brandTextColor": "#FFFFFF",
    "role": "Head of Global Talent Acquisition & AI Research Recruiting",
    "category": "SALES_HR",
    "badge": "PRO",
    "atsScore": 98,
    "experienceLevel": "STAFF_LEAD",
    "experienceLevelLabel": "Staff / Lead (8+ yrs)",
    "country": "United Kingdom",
    "resumeStyle": "Modern Technical",
    "isIllustrative": true,
    "candidate": {
      "name": "Eleanor Vance",
      "title": "Head of Global Talent Acquisition & AI Research Recruiting",
      "location": "London, United Kingdom",
      "email": "eleanor.vance.ta@gmail.com",
      "phone": "+44 20 7946 0892",
      "linkedin": "linkedin.com/in/eleanorvance-recruiting"
    },
    "summary": "Executive Talent Acquisition Leader with 9+ years building global recruiting organizations that attract world-class Research Scientists, Systems Software Architects, and Engineering Directors in Generative AI, Robotics, and Foundation Models. Built hiring engines scaling headcount from 250 to 1,600+ across London, Paris, and Mountain View. Bridges research rigor and production ML with strong evaluation, reproducibility, and responsible deployment practices.",
    "skills": [
      {
        "category": "Talent Acquisition & Sourcing",
        "skills": [
          "Frontier AI Researcher Recruiting",
          "Executive Technical Search",
          "Global Diversity Hiring Programs",
          "Candidate Experience Optimization",
          "Compensation Structuring"
        ]
      },
      {
        "category": "HR Systems & Analytics",
        "skills": [
          "Greenhouse ATS",
          "Gem",
          "Workday HCM",
          "LinkedIn Recruiter Corporate",
          "Tableau Talent Dashboards"
        ]
      },
      {
        "category": "Employer Branding",
        "skills": [
          "Conference Recruiting (NeurIPS, ICML)",
          "University PhD Fellowship Partnerships",
          "Recruitment Marketing"
        ]
      }
    ],
    "experience": [
      {
        "company": "Google DeepMind",
        "title": "Head of Global Talent Acquisition - Research & Systems",
        "location": "London, United Kingdom",
        "startDate": "2021-03",
        "endDate": "Present",
        "current": true,
        "bullets": [
          "Led global team of 24 technical recruiters and sourcers hiring over 320 Ph.D. Research Scientists and Infrastructure Engineers across frontier multimodal AI teams.",
          "Boosted candidate offer acceptance rate to 88% amidst fierce Big Tech compensation competition through bespoke research lab tours and transparent compute allocation talks.",
          "Established university recruiting pipelines across Cambridge, Oxford, ETH Zurich, and Imperial College, recruiting 45 elite Ph.D. research fellows annually.",
          "Established data versioning and reproducible experiment manifests for cross-team model handoffs.",
          "Partnered with infra on inference autoscaling and batching, cutting p95 latency 27% without GPU fleet expansion.",
          "Published internal benchmarks and ablation studies influencing org-wide architecture for foundation-model fine-tuning."
        ]
      },
      {
        "company": "Meta",
        "title": "Senior Technical Recruiting Manager - FAIR (Fundamental AI Research)",
        "location": "London, United Kingdom",
        "startDate": "2016-10",
        "endDate": "2021-02",
        "bullets": [
          "Scaled European AI research operations across London and Paris from 60 to 380 researchers and research software engineers.",
          "Reduced average Time-to-Hire from 84 days to 46 days while maintaining strict technical bar and improving female research representation by 18%.",
          "Built feature generation pipelines with unit-tested transforms and backfill orchestration.",
          "Collaborated on labeling guidelines and inter-annotator agreement studies improving gold-set quality."
        ]
      }
    ],
    "education": [
      {
        "school": "University College London (UCL)",
        "degree": "B.Sc. (Hons)",
        "field": "Psychology and Human Resource Management",
        "graduationDate": "2015",
        "honors": "First Class Honours"
      }
    ],
    "certifications": [
      "AIRS Certified Diversity and Inclusion Recruiter (CDR)",
      "SHRM Senior Certified Professional (SHRM-SCP)"
    ]
  },
  {
    "id": "crowdstrike-vp-global-sales-operations",
    "company": "CrowdStrike",
    "companyKey": "crowdstrike",
    "brandColor": "#E01E26",
    "brandTextColor": "#FFFFFF",
    "role": "VP of Global Revenue & Sales Operations (RevOps)",
    "category": "SALES_HR",
    "badge": "PRO",
    "atsScore": 98,
    "experienceLevel": "EXECUTIVE",
    "experienceLevelLabel": "Executive (10+ yrs)",
    "country": "United States",
    "resumeStyle": "Executive Clean",
    "isIllustrative": true,
    "candidate": {
      "name": "Raymond Douglas",
      "title": "VP of Global Revenue & Sales Operations (RevOps)",
      "location": "Austin, TX",
      "email": "raymond.douglas.revops@gmail.com",
      "phone": "+1 (512) 890-3412",
      "linkedin": "linkedin.com/in/raymonddouglas-revops"
    },
    "summary": "Executive Revenue Operations (RevOps) Leader with 11+ years designing global sales commission plans, territory balancing, pipeline forecast models, and CRM architectures for enterprise cybersecurity companies scaling from $300M to $2B+ in ARR. Led 45-person RevOps organizations supporting 1,200 quota-carrying sales reps globally. Translates customer insight and economics into actionable roadmaps spanning engineering, GTM, and operations.",
    "skills": [
      {
        "category": "RevOps & Go-To-Market Strategy",
        "skills": [
          "Sales Incentive Compensation Design",
          "Territory & Quota Planning",
          "Pipeline Forecasting & Inspection",
          "Sales Enablement Systems",
          "Deal Desk Operations"
        ]
      },
      {
        "category": "Systems & Architecture",
        "skills": [
          "Salesforce CPQ",
          "Clari",
          "Anaplan (Sales Modeling)",
          "Gong",
          "Tableau",
          "LeanData (Lead-to-Account Matching)"
        ]
      },
      {
        "category": "Data & Analytics",
        "skills": [
          "SQL",
          "Sales Velocity Metrics",
          "Cohort Win-Loss Analysis",
          "Sales Capacity Modeling"
        ]
      }
    ],
    "experience": [
      {
        "company": "CrowdStrike",
        "title": "Vice President of Global Revenue Operations",
        "location": "Austin, TX",
        "startDate": "2021-01",
        "endDate": "Present",
        "current": true,
        "bullets": [
          "Architected global sales territory and quota allocation model for 1,400 field sales reps, delivering equitable quota distribution and achieving 98.4% fiscal year revenue attainment.",
          "Overhauled Deal Desk and CPQ approvals, reducing average custom contract quoting turnaround time from 72 hours to 4 hours and improving gross margin integrity by 280 bps.",
          "Implemented Clari AI predictive forecasting model improving quarterly executive earnings forecast accuracy to within ±1.5% across 12 consecutive quarters.",
          "Negotiated roadmap tradeoffs with sales and support, reducing escalations on missing enterprise capabilities by 33%.",
          "Launched beta cohort with instrumented funnels, improving activation 21% via onboarding experiments in 8 weeks.",
          "Ran quarterly planning linking customer insights, unit economics, and engineering capacity, delivering 108% of committed OKRs."
        ]
      },
      {
        "company": "Palo Alto Networks",
        "title": "Senior Director of Sales Strategy & Operations - Enterprise Americas",
        "location": "Santa Clara, CA",
        "startDate": "2016-04",
        "endDate": "2020-12",
        "bullets": [
          "Managed GTM operations for $1.2B commercial sales division, restructuring sales commission compensation tiers to incentivize multi-year cloud subscription renewals.",
          "Consolidated 6 fragmented sales enablement systems into unified Salesforce platform, saving $1.4M annually in redundant software licenses.",
          "Drove vendor evaluations and build/buy analyses informing approved investments.",
          "Mentored associates on hypothesis-driven problem solving and executive storytelling."
        ]
      }
    ],
    "education": [
      {
        "school": "University of Chicago Booth School of Business",
        "degree": "Master of Business Administration (MBA)",
        "field": "Analytical Finance & Strategy",
        "graduationDate": "2016"
      },
      {
        "school": "University of Illinois Urbana-Champaign",
        "degree": "Bachelor of Science (B.S.)",
        "field": "Industrial Engineering",
        "graduationDate": "2011"
      }
    ],
    "certifications": [
      "Salesforce Certified Administrator",
      "RevOps Certified Master - RevOps Co-op"
    ]
  },
  {
    "id": "lululemon-senior-people-operations-hrbp",
    "company": "Lululemon",
    "companyKey": "lululemon",
    "brandColor": "#D31334",
    "brandTextColor": "#FFFFFF",
    "role": "Senior People Operations Partner & Total Rewards Lead",
    "category": "SALES_HR",
    "badge": "PRO",
    "atsScore": 97,
    "experienceLevel": "SENIOR_LEVEL",
    "experienceLevelLabel": "Senior (6–9 yrs)",
    "country": "Canada",
    "resumeStyle": "ATS Classic",
    "isIllustrative": true,
    "candidate": {
      "name": "Chloe Tremblay",
      "title": "Senior People Operations Partner & Total Rewards Lead",
      "location": "Vancouver, Canada",
      "email": "chloe.tremblay.hr@gmail.com",
      "phone": "+1 (604) 901-2345",
      "linkedin": "linkedin.com/in/chloetremblay-hr"
    },
    "summary": "Senior Human Resources Business Partner and People Operations Leader with 7+ years developing global compensation bands, employee performance review cycles, and talent retention strategies for high-growth omnichannel retail and tech organizations. Champion of equitable total rewards, leadership coaching, and organizational design for 4,000+ distributed team members. Translates customer insight and economics into actionable roadmaps spanning engineering, GTM, and operations.",
    "skills": [
      {
        "category": "People Operations & HRBP",
        "skills": [
          "Strategic HR Business Partnering",
          "Organizational Design & Restructuring",
          "Employee Relations & Conflict Resolution",
          "Performance Management Systems",
          "Succession Planning"
        ]
      },
      {
        "category": "Total Rewards & Compensation",
        "skills": [
          "Global Compensation Banding (Radford / Mercer)",
          "Equity & Stock Option Compensation",
          "Health Benefits Negotiation",
          "Pay Equity Audits"
        ]
      },
      {
        "category": "HR Systems",
        "skills": [
          "Workday HCM",
          "Lattice",
          "Culture Amp",
          "Visier Workforce Analytics"
        ]
      }
    ],
    "experience": [
      {
        "company": "Lululemon",
        "title": "Senior People Partner - Global Digital, Brand & Technology",
        "location": "Vancouver, Canada",
        "startDate": "2021-08",
        "endDate": "Present",
        "current": true,
        "bullets": [
          "Partnered with Chief Technology Officer and VP of E-Commerce to scale tech organization from 450 to 950 employees while reducing voluntary tech attrition from 16% to 7.8%.",
          "Executed comprehensive global compensation review across 8 countries using Radford benchmark data, eliminating gender pay gaps and achieving 100% pay parity certification.",
          "Restructured biannual continuous feedback performance reviews in Lattice, lifting employee participation rate to 96% and saving 24,000 managerial hours annually.",
          "Ran quarterly planning linking customer insights, unit economics, and engineering capacity, delivering 108% of committed OKRs.",
          "Launched beta cohort with instrumented funnels, improving activation 21% via onboarding experiments in 8 weeks.",
          "Partnered with finance on pricing and packaging tests contributing $3.4M incremental ARR in fiscal year."
        ]
      },
      {
        "company": "Shopify",
        "title": "People Operations Specialist - Engineering & Product",
        "location": "Ottawa, Canada",
        "startDate": "2018-05",
        "endDate": "2021-07",
        "bullets": [
          "Managed onboarding and employee experience programs for 1,200 remote engineering hires across North America with a 94% positive candidate onboarding CSAT.",
          "Led workplace mental health and wellness program rollout, recognized as a Top 10 Canadian Workplace Wellness Initiative.",
          "Mentored associates on hypothesis-driven problem solving and executive storytelling.",
          "Synthesized competitive teardowns and win/loss interviews into exec-ready strategy memos."
        ]
      }
    ],
    "education": [
      {
        "school": "University of British Columbia (UBC)",
        "degree": "Bachelor of Commerce (B.Com)",
        "field": "Human Resources Management",
        "graduationDate": "2018",
        "honors": "Dean’s Honour List"
      }
    ],
    "certifications": [
      "Chartered Professional in Human Resources (CPHR) Canada",
      "SHRM-CP Certified"
    ]
  },
  {
    "id": "freshworks-senior-customer-success-director",
    "company": "Freshworks",
    "companyKey": "freshworks",
    "brandColor": "#F38020",
    "brandTextColor": "#FFFFFF",
    "role": "Senior Director of Enterprise Customer Success & NRR",
    "category": "SALES_HR",
    "badge": "PRO",
    "atsScore": 98,
    "experienceLevel": "STAFF_LEAD",
    "experienceLevelLabel": "Staff / Lead (8+ yrs)",
    "country": "India",
    "resumeStyle": "Executive Clean",
    "isIllustrative": true,
    "candidate": {
      "name": "Vikram Sundaram",
      "title": "Senior Director of Enterprise Customer Success & NRR",
      "location": "Chennai, India",
      "email": "vikram.sundaram.cs@gmail.com",
      "phone": "+91 98401 23490",
      "linkedin": "linkedin.com/in/vikramsundaram-cs"
    },
    "summary": "Customer Success Executive with 9+ years managing global enterprise SaaS post-sales operations, product adoption, and account expansion. Proven track record driving Net Retention Rate (NRR) from 104% to 119% across a $75M ARR customer portfolio spanning North America, EMEA, and APAC. Expert in health score modeling, QBR excellence, and renewal risk mitigation. Builder of quota-attaining GTM and people programs with coaching-first leadership.",
    "skills": [
      {
        "category": "Customer Success & Retention",
        "skills": [
          "Net Retention Rate (NRR) Growth",
          "Gross Retention (GRR)",
          "Executive Business Reviews (QBRs)",
          "Churn Risk Mitigation & Health Scoring",
          "Onboarding & Time-to-Value (TTV)"
        ]
      },
      {
        "category": "Customer Ops & Systems",
        "skills": [
          "Gainsight",
          "Salesforce CRM",
          "Totango",
          "Zendesk",
          "ChurnZero",
          "Tableau"
        ]
      },
      {
        "category": "Leadership & Expansion",
        "skills": [
          "Global Team Leadership (40+ CSMs)",
          "Account Expansion Playbooks",
          "Customer Advocacy & Advisory Boards"
        ]
      }
    ],
    "experience": [
      {
        "company": "Freshworks",
        "title": "Senior Director of Global Enterprise Customer Success",
        "location": "Chennai, India",
        "startDate": "2021-02",
        "endDate": "Present",
        "current": true,
        "bullets": [
          "Directed 38 enterprise Customer Success Managers managing 420 Tier-1 enterprise accounts globally representing $68M in annual recurring revenue.",
          "Elevated portfolio Net Retention Rate (NRR) from 106% to 118.4% by creating standardized account expansion playbooks and product adoption milestones.",
          "Architected predictive customer health score model in Gainsight combining telemetry usage, open support tickets, and executive relationship cadence, preventing $4.2M in potential churn.",
          "Improved forecast accuracy from 70% to 88% via stage hygiene and mutual close plans.",
          "Scaled structured hiring cutting time-to-fill senior roles from 72 to 39 days.",
          "Built enablement certifications adopted by 180+ customer-facing staff globally."
        ]
      },
      {
        "company": "Zoho Corporation",
        "title": "Customer Success Lead - Enterprise Americas Portfolio",
        "location": "Chennai, India",
        "startDate": "2016-09",
        "endDate": "2021-01",
        "bullets": [
          "Led enterprise customer onboarding and change management programs, reducing customer average Time-to-Value (TTV) from 60 days to 24 days.",
          "Organized customer advisory boards and user community conferences resulting in 85 published customer video case studies.",
          "Ran QBRs surfacing $2.1M expansion pipeline at 36% win rate.",
          "Administered engagement surveys with 87% participation and 90% action-item closure."
        ]
      }
    ],
    "education": [
      {
        "school": "Anna University",
        "degree": "Bachelor of Engineering (B.E.)",
        "field": "Computer Science and Engineering",
        "graduationDate": "2015",
        "gpa": "8.7 / 10"
      }
    ],
    "certifications": [
      "Gainsight Certified Customer Success Administrator",
      "Certified Customer Success Manager (CCSM) Level 3"
    ]
  },
  {
    "id": "boston-dynamics-senior-robotics-motion-engineer",
    "company": "Boston Dynamics",
    "companyKey": "bostondynamics",
    "brandColor": "#002B49",
    "brandTextColor": "#FFFFFF",
    "role": "Staff Robotics Motion Planning & Controls Engineer",
    "category": "CORE_ENGINEERING",
    "badge": "PRO",
    "atsScore": 99,
    "experienceLevel": "STAFF_LEAD",
    "experienceLevelLabel": "Staff / Lead (8+ yrs)",
    "country": "United States",
    "resumeStyle": "Modern Technical",
    "isIllustrative": true,
    "candidate": {
      "name": "Dr. Liam Gallagher",
      "title": "Staff Robotics Motion Planning & Controls Engineer",
      "location": "Waltham, MA",
      "email": "liam.gallagher.robotics@gmail.com",
      "phone": "+1 (617) 890-4521",
      "linkedin": "linkedin.com/in/liamgallagher-robotics",
      "github": "github.com/lgallagher-motion"
    },
    "summary": "Staff Robotics Engineer with 8+ years developing real-time model predictive control (MPC), trajectory optimization, and whole-body locomotion algorithms for legged robots and industrial mobile manipulators. Expert in C++20, ROS 2, Pinocchio kinematics, quadratic programming (OSQP/CasADi), and hardware-in-the-loop (HIL) testing. Hands-on integrator across firmware, hardware validation, and safety-critical release discipline.",
    "skills": [
      {
        "category": "Robotics & Control Systems",
        "skills": [
          "Model Predictive Control (MPC)",
          "Whole-Body Control (WBC)",
          "Trajectory Optimization (CasADi)",
          "Inverse Kinematics / Dynamics",
          "State Estimation (Extended Kalman Filter)"
        ]
      },
      {
        "category": "Software & Frameworks",
        "skills": [
          "C++20 / C",
          "ROS 2 (Humble/Iron)",
          "Python",
          "Pinocchio Kinematics",
          "Gazebo / MuJoCo Simulators",
          "Eigen",
          "Git"
        ]
      },
      {
        "category": "Hardware Integration",
        "skills": [
          "CAN / EtherCAT Bus Communication",
          "Brushless DC Motor Drivers",
          "IMU / LiDAR Sensor Fusion",
          "Real-Time Linux (PREEMPT_RT)"
        ]
      }
    ],
    "experience": [
      {
        "company": "Boston Dynamics",
        "title": "Staff Robotics Controls Engineer - Quadruped Locomotion",
        "location": "Waltham, MA",
        "startDate": "2021-06",
        "endDate": "Present",
        "current": true,
        "bullets": [
          "Engineered real-time nonlinear model predictive controller (NMPC) in C++20 executing at 500 Hz on embedded Linux PREEMPT_RT, enabling robust locomotion across loose gravel and ice.",
          "Reduced robot energy consumption by 18% through dynamic contact force minimization algorithms, extending battery runtime by 35 minutes per charge cycle.",
          "Developed automated hardware-in-the-loop (HIL) regression testing simulator in MuJoCo, executing 10,000 nightly simulated terrain obstacle trials.",
          "Validated control-loop timing under thermal throttling, meeting sub-5ms deadlines on production silicon.",
          "Mentored engineers on bench instrumentation debug, cutting mean board bring-up time 33%.",
          "Coordinated NPI bring-up with manufacturing, shortening ramp 5 weeks versus plan."
        ]
      },
      {
        "company": "KUKA Robotics",
        "title": "Robotics Software Engineer - Industrial Autonomous Navigation",
        "location": "Augsburg, Germany",
        "startDate": "2017-10",
        "endDate": "2021-05",
        "bullets": [
          "Implemented 3D LiDAR SLAM and real-time obstacle avoidance algorithms for autonomous mobile robots (AMRs) operating in high-density automotive manufacturing plants.",
          "Optimized trajectory spline interpolation algorithms, smoothing industrial manipulator motion and reducing mechanical joint wear by 24%.",
          "Partnered with systems on verification coverage for safety-rated functions.",
          "Authored drivers and HAL modules enabling first customer samples on schedule."
        ]
      }
    ],
    "projects": [
      {
        "name": "FastMPC-Quad — Ultra-Fast Quadratic Programming Solver for Legged Robots",
        "description": "Zero-allocation C++ solver specialized for time-critical model predictive control problems in legged robotics.",
        "techStack": [
          "C++20",
          "Eigen",
          "OSQP",
          "ROS 2"
        ],
        "url": "github.com/lgallagher-motion/fastmpc-quad",
        "highlights": [
          "Solves 12-timestep trajectory horizon in 0.42ms on ARM Cortex-A72.",
          "Extended FastMPC-Quad — Ultra-Fast Quadratic Programming Solver for Legged Robots with benchmarking and hardening passes, validating stability across 20% more edge cases than initial prototype.",
          "Extended FastMPC-Quad — Ultra-Fast Quadratic Programming Solver for Legged Robots with benchmarking and hardening passes, validating stability across 28% more edge cases than initial prototype."
        ]
      },
      {
        "name": "Capstone Toolkit — Trajectory Optimization (CasADi)",
        "description": "Supporting project reinforcing depth in core engineering.",
        "techStack": [
          "CAN / EtherCAT Bus Communication",
          "Real-Time Linux (PREEMPT_RT)",
          "Trajectory Optimization (CasADi)",
          "Whole-Body Control (WBC)"
        ],
        "url": "github.com/lgallagher-motion/capstone",
        "highlights": [
          "Built modular components emphasizing tests, docs, and reviewable diffs for long-term maintainability.",
          "Benchmarked iterations with peer feedback across multiple review cycles.",
          "Shared write-up cited internally as a practical implementation reference."
        ]
      }
    ],
    "education": [
      {
        "school": "Massachusetts Institute of Technology (MIT)",
        "degree": "Ph.D.",
        "field": "Mechanical Engineering & Robotics",
        "graduationDate": "2017",
        "honors": "Legged Locomotion Research Fellowship"
      },
      {
        "school": "Purdue University",
        "degree": "B.S.",
        "field": "Mechanical Engineering",
        "graduationDate": "2012",
        "gpa": "3.95 / 4.0"
      }
    ],
    "certifications": [
      "ROS 2 Industrial Certified Developer",
      "IEEE Senior Member (Robotics and Automation Society)"
    ]
  },
  {
    "id": "arm-lead-fpga-emulation-engineer",
    "company": "Arm",
    "companyKey": "arm",
    "brandColor": "#0091BD",
    "brandTextColor": "#FFFFFF",
    "role": "Principal FPGA Emulation & Silicon Verification Engineer",
    "category": "CORE_ENGINEERING",
    "badge": "PRO",
    "atsScore": 98,
    "experienceLevel": "STAFF_LEAD",
    "experienceLevelLabel": "Staff / Lead (8+ yrs)",
    "country": "United Kingdom",
    "resumeStyle": "Modern Technical",
    "isIllustrative": true,
    "candidate": {
      "name": "Dr. James Sterling",
      "title": "Principal FPGA Emulation & Silicon Verification Engineer",
      "location": "Cambridge, United Kingdom",
      "email": "james.sterling.silicon@gmail.com",
      "phone": "+44 1223 893452",
      "linkedin": "linkedin.com/in/jamessterling-silicon"
    },
    "summary": "Principal Silicon Verification and Hardware Emulation Engineer with 9+ years proving complex System-on-Chip (SoC) architectures, RISC-V / ARM processor cores, and high-speed PCIe/DDR interfaces. Expert in SystemVerilog, UVM, ZeBu / Palladium hardware emulators, static timing analysis (STA), and pre-silicon OS boot validation. Known for balancing visual fidelity with strict frame budgets on AAA multiplayer and engine tooling initiatives.",
    "skills": [
      {
        "category": "Hardware Description & Verification",
        "skills": [
          "SystemVerilog",
          "UVM (Universal Verification Methodology)",
          "VHDL",
          "Verilog",
          "Formal Verification (JasperGold)"
        ]
      },
      {
        "category": "Emulation & EDA Platforms",
        "skills": [
          "Synopsys ZeBu",
          "Cadence Palladium",
          "Mentor Veloce",
          "Xilinx Vivado",
          "Intel Quartus Prime"
        ]
      },
      {
        "category": "Protocols & Architecture",
        "skills": [
          "ARM AMBA (AXI, AHB, APB)",
          "PCIe Gen 5",
          "DDR5 Memory Controllers",
          "Static Timing Analysis (PrimeTime)"
        ]
      }
    ],
    "experience": [
      {
        "company": "Arm",
        "title": "Principal Silicon Verification Architect - Cortex-A Core Platform",
        "location": "Cambridge, United Kingdom",
        "startDate": "2021-04",
        "endDate": "Present",
        "current": true,
        "bullets": [
          "Architected hardware emulation testbench on Synopsys ZeBu Server for next-generation Cortex-A flagship core, running full Linux OS boot at 12 MHz emulation clock frequency.",
          "Achieved 100% functional and code coverage on cache coherency interconnect (CHI) subsystem using UVM constrained-random test generation and formal property checking.",
          "Diagnosed and resolved 18 critical silicon-kill race conditions in pre-tapeout memory controller RTL, avoiding costly physical mask revisions ($4M+ estimated savings).",
          "Extended LOD and streaming systems to reduce open-world texture memory spikes by 24% during fast travel sequences.",
          "Profiled GPU frame budgets with RenderDoc and Nsight, reclaiming 1.9ms average frame time on console-equivalent quality presets.",
          "Drove cross-discipline performance budgets with art and design, holding 60fps targets on min-spec hardware for multiplayer modes."
        ]
      },
      {
        "company": "Imagination Technologies",
        "title": "Senior Hardware Verification Engineer - PowerVR Graphics",
        "location": "Kings Langley, United Kingdom",
        "startDate": "2016-09",
        "endDate": "2021-03",
        "bullets": [
          "Engineered UVM verification environment verifying ray-tracing hardware arithmetic pipeline against golden C++ reference models.",
          "Reduced regression simulation runtime by 35% through testbench parallelization on 500-node compute farm.",
          "Partnered with tools team on live tweak-constants pipelines, improving designer iteration loops during vertical slice milestones.",
          "Optimized animation pose evaluation hot loops with SIMD intrinsics, reducing CPU skeletal update cost by 19%."
        ]
      }
    ],
    "education": [
      {
        "school": "University of Southampton",
        "degree": "Ph.D.",
        "field": "Electronic & Computer Engineering (SoC Design)",
        "graduationDate": "2016"
      },
      {
        "school": "University of Bristol",
        "degree": "M.Eng.",
        "field": "Electrical & Electronic Engineering",
        "graduationDate": "2012",
        "honors": "First Class Honours"
      }
    ],
    "certifications": [
      "Synopsys Certified Verification Master",
      "IEEE Senior Member"
    ],
    "projects": [
      {
        "name": "Arm Applied Portfolio",
        "description": "Representative initiative demonstrating Principal FPGA Emulation & Silicon Verification Engineer capabilities with measurable outcomes.",
        "techStack": [
          "PCIe Gen 5",
          "Formal Verification (JasperGold)",
          "Cadence Palladium"
        ],
        "highlights": [
          "Designed and implemented core workflows using PCIe Gen 5 and Formal Verification (JasperGold), with quantitative validation against success criteria.",
          "Documented architecture, test plan, and rollout approach adopted as a reference by adjacent contributors.",
          "Presented outcomes highlighting 20–30% gains on primary efficiency or quality KPIs."
        ]
      },
      {
        "name": "Capstone Toolkit — Cadence Palladium",
        "description": "Supporting project reinforcing depth in core engineering.",
        "techStack": [
          "PCIe Gen 5",
          "Formal Verification (JasperGold)",
          "Cadence Palladium",
          "Intel Quartus Prime"
        ],
        "highlights": [
          "Built modular components emphasizing tests, docs, and reviewable diffs for long-term maintainability.",
          "Benchmarked iterations with peer feedback across multiple review cycles.",
          "Shared write-up cited internally as a practical implementation reference."
        ]
      }
    ]
  },
  {
    "id": "iit-data-science-ai-intern",
    "company": "IIT Bombay",
    "companyKey": "iitbombay",
    "brandColor": "#003366",
    "brandTextColor": "#FFFFFF",
    "role": "Machine Learning & Quantitative Research Intern",
    "category": "STUDENT_FRESHER",
    "badge": "VERIFIED",
    "atsScore": 98,
    "experienceLevel": "STUDENT_INTERN",
    "experienceLevelLabel": "Student / Intern",
    "country": "India",
    "resumeStyle": "Compact Single-Column",
    "isIllustrative": true,
    "candidate": {
      "name": "Aditi Sharma",
      "title": "Machine Learning & Quantitative Research Intern",
      "location": "Mumbai, India",
      "email": "aditi.sharma.iitb@gmail.com",
      "phone": "+91 98201 98234",
      "linkedin": "linkedin.com/in/aditisharma-ai",
      "github": "github.com/aditi-ml"
    },
    "summary": "Pre-final year Computer Science undergraduate at IIT Bombay (CPI: 9.42/10, Department Rank 3). Experienced in transformer fine-tuning, computer vision architectures, and statistical quantitative trading models. Authored research preprint accepted at CVPR Student Workshop; winner of 2 national AI hackathons. Bridges research rigor and production ML with strong evaluation, reproducibility, and responsible deployment practices.",
    "skills": [
      {
        "category": "Machine Learning & AI",
        "skills": [
          "PyTorch",
          "TensorFlow",
          "Hugging Face Transformers",
          "Scikit-Learn",
          "OpenCV",
          "Pandas",
          "NumPy"
        ]
      },
      {
        "category": "Programming Languages",
        "skills": [
          "Python",
          "C++",
          "SQL",
          "R",
          "Bash",
          "Git"
        ]
      },
      {
        "category": "Relevant Coursework",
        "skills": [
          "Deep Learning",
          "Foundations of Machine Learning",
          "Probability & Random Processes",
          "Linear Algebra",
          "Data Structures"
        ]
      }
    ],
    "experience": [
      {
        "company": "Microsoft Research India",
        "title": "Research Intern - Multimodal AI Group",
        "location": "Bengaluru, India",
        "startDate": "2024-05",
        "endDate": "2024-08",
        "bullets": [
          "Developed parameter-efficient fine-tuning (PEFT / LoRA) pipeline for multilingual vision-language models, cutting GPU memory overhead by 40% with zero loss in VQA accuracy.",
          "Benchmarked model robustness across 6 Indian regional language datasets, discovering critical failure modes in low-resource OCR transcription.",
          "Led responsible AI reviews documenting bias, safety, and misuse mitigations for production deployments.",
          "Reduced training cost by mixed-precision and activation checkpointing while holding validation metrics within 0.3% of baseline.",
          "Established data versioning and reproducible experiment manifests for cross-team model handoffs.",
          "Partnered with infra on inference autoscaling and batching, cutting p95 latency 27% without GPU fleet expansion."
        ]
      },
      {
        "company": "Indian Institute of Technology (IIT) Bombay",
        "title": "Teaching Assistant — Core CS Coursework",
        "location": "Mumbai, India",
        "startDate": "2023-08",
        "endDate": "2024-05",
        "bullets": [
          "Led campus project team placing top-3 in regional competition among 100+ entrants.",
          "Synthesized research readings into summaries used in departmental study materials.",
          "Maintained open-source portfolio with 150+ GitHub stars and constructive maintainer feedback.",
          "Served as teaching assistant leading weekly labs for 50+ students improving exam averages 9 points."
        ]
      }
    ],
    "projects": [
      {
        "name": "MedVision-Segment — Deep Learning Medical Image Segmentation",
        "description": "U-Net architecture with attention gates for automated MRI brain tumor segmentation, achieving 0.91 Dice score.",
        "techStack": [
          "PyTorch",
          "MONAI",
          "TorchIO",
          "WandB"
        ],
        "url": "github.com/aditi-ml/medvision-segment",
        "highlights": [
          "Published at CVPR Student Workshop with over 450 GitHub stars.",
          "Extended MedVision-Segment — Deep Learning Medical Image Segmentation with benchmarking and hardening passes, validating stability across 20% more edge cases than initial prototype.",
          "Extended MedVision-Segment — Deep Learning Medical Image Segmentation with benchmarking and hardening passes, validating stability across 28% more edge cases than initial prototype."
        ]
      },
      {
        "name": "AlphaTrade-Sim — High-Frequency Order Book Simulator",
        "description": "Asynchronous event-driven market simulator backtesting momentum and mean-reversion signals on tick data.",
        "techStack": [
          "C++20",
          "Python",
          "ZeroMQ"
        ],
        "url": "github.com/aditi-ml/alphatrade-sim",
        "highlights": [
          "Evaluated across 500,000 live crypto and equity tick events.",
          "Extended AlphaTrade-Sim — High-Frequency Order Book Simulator with benchmarking and hardening passes, validating stability across 20% more edge cases than initial prototype.",
          "Extended AlphaTrade-Sim — High-Frequency Order Book Simulator with benchmarking and hardening passes, validating stability across 28% more edge cases than initial prototype."
        ]
      }
    ],
    "education": [
      {
        "school": "Indian Institute of Technology (IIT) Bombay",
        "degree": "Bachelor of Technology (B.Tech)",
        "field": "Computer Science and Engineering",
        "graduationDate": "2026",
        "gpa": "9.42 / 10",
        "honors": "JEE Advanced All India Rank (AIR) 84 out of 160,000 candidates"
      }
    ],
    "certifications": [
      "Kaggle Notebooks Expert",
      "DeepLearning.AI Deep Learning Specialization"
    ]
  },
  {
    "id": "oxford-corporate-strategy-consulting-intern",
    "company": "Oxford University",
    "companyKey": "oxford",
    "brandColor": "#002147",
    "brandTextColor": "#FFFFFF",
    "role": "Management Consulting & Strategic Operations Analyst Intern",
    "category": "STUDENT_FRESHER",
    "badge": "VERIFIED",
    "atsScore": 97,
    "experienceLevel": "STUDENT_INTERN",
    "experienceLevelLabel": "Student / Intern",
    "country": "United Kingdom",
    "resumeStyle": "Compact Single-Column",
    "isIllustrative": true,
    "candidate": {
      "name": "Alexander Hamilton-Smith",
      "title": "Management Consulting & Strategic Operations Analyst Intern",
      "location": "Oxford, United Kingdom",
      "email": "a.hamilton.smith.ox@gmail.com",
      "phone": "+44 1865 890123",
      "linkedin": "linkedin.com/in/alexander-hamilton-smith"
    },
    "summary": "Final-year undergraduate at the University of Oxford (BA in Philosophy, Politics and Economics - PPE). President of the Oxford Management Consulting Society with summer internship experience at Boston Consulting Group (BCG). Experienced in market sizing, financial valuation, commercial due diligence, and executive slide synthesis. Translates customer insight and economics into actionable roadmaps spanning engineering, GTM, and operations.",
    "skills": [
      {
        "category": "Consulting & Strategy",
        "skills": [
          "Market Sizing (Fermi Problems)",
          "Commercial Due Diligence",
          "Competitive Landscaping",
          "Cost-Benefit Analysis",
          "Executive Presentations"
        ]
      },
      {
        "category": "Quantitative Analysis",
        "skills": [
          "Financial Modeling",
          "Excel (Advanced)",
          "Tableau",
          "Survey Analysis",
          "Stata / R"
        ]
      },
      {
        "category": "Leadership",
        "skills": [
          "President of Oxford Consulting Society",
          "Case Competition Champion",
          "Debate & Public Speaking"
        ]
      }
    ],
    "experience": [
      {
        "company": "Boston Consulting Group (BCG)",
        "title": "Summer Associate - Strategy & Operations Practice",
        "location": "London, United Kingdom",
        "startDate": "2024-06",
        "endDate": "2024-08",
        "bullets": [
          "Conducted commercial due diligence for a £450M private equity acquisition of a European B2B logistics SaaS provider, delivering market growth projections to investment committee.",
          "Interviewed 28 industry experts and analyzed customer retention cohorts, identifying a 14% churn risk in legacy enterprise client segments.",
          "Synthesized findings into a 45-slide executive presentation praised by the practice Managing Director and client C-suite.",
          "Negotiated roadmap tradeoffs with sales and support, reducing escalations on missing enterprise capabilities by 33%.",
          "Ran quarterly planning linking customer insights, unit economics, and engineering capacity, delivering 108% of committed OKRs.",
          "Partnered with finance on pricing and packaging tests contributing $3.4M incremental ARR in fiscal year."
        ]
      },
      {
        "company": "University of Oxford (Magdalen College)",
        "title": "Teaching Assistant — Core CS Coursework",
        "location": "Oxford, United Kingdom",
        "startDate": "2023-08",
        "endDate": "2024-05",
        "bullets": [
          "Led campus project team placing top-3 in regional competition among 100+ entrants.",
          "Served as teaching assistant leading weekly labs for 50+ students improving exam averages 9 points.",
          "Synthesized research readings into summaries used in departmental study materials.",
          "Maintained open-source portfolio with 150+ GitHub stars and constructive maintainer feedback."
        ]
      }
    ],
    "projects": [
      {
        "name": "Oxford Consulting Society Pro-Bono Strategy Engagement",
        "description": "Led a 5-student team advising a leading UK health non-profit on expanding mobile outreach clinics, securing £1.2M in donor grants.",
        "techStack": [
          "Financial Modeling",
          "Tableau",
          "Excel"
        ],
        "highlights": [
          "Awarded Best Pro-Bono Project of the Year at Oxford.",
          "Extended Oxford Consulting Society Pro-Bono Strategy Engagement with benchmarking and hardening passes, validating stability across 20% more edge cases than initial prototype.",
          "Extended Oxford Consulting Society Pro-Bono Strategy Engagement with benchmarking and hardening passes, validating stability across 28% more edge cases than initial prototype."
        ]
      },
      {
        "name": "Capstone Toolkit — Survey Analysis",
        "description": "Supporting project reinforcing depth in student fresher.",
        "techStack": [
          "Stata / R",
          "Tableau",
          "Survey Analysis",
          "President of Oxford Consulting Society"
        ],
        "highlights": [
          "Built modular components emphasizing tests, docs, and reviewable diffs for long-term maintainability.",
          "Benchmarked iterations with peer feedback across multiple review cycles.",
          "Shared write-up cited internally as a practical implementation reference."
        ]
      }
    ],
    "education": [
      {
        "school": "University of Oxford (Magdalen College)",
        "degree": "Bachelor of Arts (B.A. Honours)",
        "field": "Philosophy, Politics and Economics (PPE)",
        "graduationDate": "2025",
        "honors": "Academic Exhibitioner, Predicted First Class Honours"
      }
    ],
    "certifications": [
      "Winner, National University Case Competition (2024)"
    ]
  }
];
