import * as fs from 'fs';
import * as path from 'path';

export interface ResumeExperience {
  company: string;
  title: string;
  location: string;
  startDate: string;
  endDate: string;
  current?: boolean;
  bullets: string[];
}

export interface ResumeEducation {
  school: string;
  degree: string;
  field: string;
  graduationDate: string;
  gpa?: string;
  honors?: string;
}

export interface ResumeSkillCategory {
  category: string;
  skills: string[];
}

export interface ResumeProject {
  name: string;
  description: string;
  highlights: string[];
  url?: string;
  techStack?: string[];
}

export interface SampleResume {
  id: string;
  company: string;
  companyKey: string;
  brandColor: string;
  brandTextColor: string;
  role: string;
  category: 'PROGRAMMING' | 'ENGINEERING' | 'BUSINESS' | 'FINANCE' | 'DESIGN' | 'STUDENT' | 'MARKETING' | 'OTHER';
  badge: string;
  atsScore: number;
  experienceLevel: string;
  candidate: {
    name: string;
    title: string;
    location: string;
    email: string;
    phone: string;
    linkedin: string;
    github?: string;
    portfolio?: string;
  };
  summary: string;
  skills: ResumeSkillCategory[];
  experience: ResumeExperience[];
  education: ResumeEducation[];
  projects?: ResumeProject[];
  certifications?: string[];
}

const SAMPLE_RESUMES: SampleResume[] = [
  // 1. TechNova (Full-Stack Engineer)
  {
    id: 'technova-alexander-sharma-full-stack',
    company: 'TechNova',
    companyKey: 'technova',
    brandColor: '#285FEA',
    brandTextColor: '#FFFFFF',
    role: 'Software Engineer | Full-Stack Developer',
    category: 'PROGRAMMING',
    badge: 'PRO',
    atsScore: 99,
    experienceLevel: 'Full-Stack / 3+ YOE',
    candidate: {
      name: 'Alexander Sharma',
      title: 'Software Engineer | Full-Stack Developer',
      location: 'Bengaluru, India',
      email: 'alex.sharma@email.com',
      phone: '+91 98765 43210',
      linkedin: 'linkedin.com/in/alexsharma',
      github: 'github.com/alexsharma',
      portfolio: 'alexsharma.dev',
    },
    summary:
      'Full-Stack Software Engineer with 3+ years of experience designing, developing, testing, and deploying scalable web applications using TypeScript, React, Next.js, Node.js, and PostgreSQL. Experienced in building RESTful APIs, distributed background jobs, authentication systems, payment integrations, and cloud-based applications. Proven ability to improve application performance, optimize database queries, automate operational workflows, and collaborate with cross-functional teams to deliver reliable software. Familiar with AWS, Docker, CI/CD pipelines, automated testing, and Agile development practices.',
    skills: [
      {
        category: 'Programming Languages',
        skills: ['JavaScript', 'TypeScript', 'Java', 'SQL', 'Python'],
      },
      {
        category: 'Frontend',
        skills: ['React.js', 'Next.js', 'HTML5', 'CSS3', 'Tailwind CSS', 'Redux Toolkit', 'Responsive Design'],
      },
      {
        category: 'Backend',
        skills: ['Node.js', 'Express.js', 'REST APIs', 'WebSockets', 'Authentication', 'Role-Based Access Control'],
      },
      {
        category: 'Databases',
        skills: ['PostgreSQL', 'MongoDB', 'Redis', 'Prisma ORM', 'Mongoose'],
      },
      {
        category: 'Cloud & DevOps',
        skills: ['AWS (EC2, S3, SES, CloudWatch)', 'Docker', 'Nginx', 'GitHub Actions', 'Linux', 'CI/CD', 'PM2'],
      },
      {
        category: 'Testing',
        skills: ['Jest', 'Vitest', 'React Testing Library', 'Playwright', 'API Testing'],
      },
      {
        category: 'Tools',
        skills: ['Git', 'GitHub', 'Postman', 'Jira', 'Figma', 'VS Code'],
      },
      {
        category: 'Engineering Practices',
        skills: ['Data Structures & Algorithms', 'Object-Oriented Programming', 'System Design', 'Database Optimization', 'Code Reviews', 'Agile/Scrum'],
      },
    ],
    experience: [
      {
        company: 'TechNova Solutions Pvt. Ltd.',
        title: 'Software Engineer',
        location: 'Bengaluru, India',
        startDate: '2025-01',
        endDate: 'Present',
        current: true,
        bullets: [
          'Developed and maintained full-stack SaaS applications using Next.js, React, TypeScript, Node.js, and PostgreSQL, supporting business-critical workflows for more than 10,000 registered users.',
          'Designed and implemented RESTful APIs for user management, subscription billing, notifications, and reporting, improving API response times by 35% through query optimization and efficient data access patterns.',
          'Integrated a payment gateway with webhook validation, idempotent transaction processing, and automated payment-status reconciliation, reducing manual payment verification by 70%.',
          'Optimized PostgreSQL queries, added appropriate indexes, and introduced Redis caching for frequently accessed resources, reducing average database response time by 40%.',
          'Built role-based access control and secure authentication flows, including session management, input validation, rate limiting, and protected API routes.',
          'Automated build, test, and deployment workflows using GitHub Actions and Docker, reducing routine deployment time from approximately 30 minutes to 10 minutes.',
          'Collaborated with product managers, designers, QA engineers, and backend developers to plan features, review pull requests, resolve production bugs, and deliver releases in two-week Agile sprints.',
          'Improved application reliability by introducing structured logging, error monitoring, automated tests, and health-check endpoints.',
        ],
      },
      {
        company: 'CodeCraft Technologies',
        title: 'Junior Software Engineer',
        location: 'Pune, India',
        startDate: '2023-07',
        endDate: '2024-12',
        bullets: [
          'Built responsive frontend modules using React, TypeScript, and Tailwind CSS for an internal business management platform used by operations and customer support teams.',
          'Developed Node.js and Express.js APIs for employee records, inventory management, search, filtering, pagination, and report generation.',
          'Designed MongoDB schemas and PostgreSQL tables for transactional workflows, improving data consistency and simplifying maintenance of business records.',
          'Implemented JWT-based authentication and role-based authorization to restrict access to sensitive administrative features.',
          'Integrated third-party email and file-storage services to automate notifications and document uploads, reducing repetitive manual work by approximately 50%.',
          'Investigated and fixed frontend rendering issues, API failures, and database-related bugs using browser developer tools, Postman, and application logs.',
          'Wrote unit and integration tests for critical business logic, increasing test coverage for the team’s core API modules from 45% to 75%.',
          'Participated in sprint planning, daily stand-ups, code reviews, technical documentation, and release verification.',
        ],
      },
      {
        company: 'Innovate Labs',
        title: 'Software Developer Intern',
        location: 'Remote',
        startDate: '2023-01',
        endDate: '2023-06',
        bullets: [
          'Developed reusable React components and responsive web pages based on Figma designs.',
          'Created CRUD endpoints using Node.js and Express.js and connected them to MongoDB.',
          'Implemented form validation, loading states, error handling, and API integration for user-facing features.',
          'Used Git branches and pull requests to collaborate with other developers and follow team coding standards.',
          'Wrote basic unit tests and documented API endpoints to support testing and future development.',
          'Delivered assigned features through weekly code reviews and sprint demonstrations.',
        ],
      },
    ],
    projects: [
      {
        name: 'CloudDesk — Multi-Tenant SaaS Management Platform',
        description: 'Multi-tenant organization management, team invitations, role-based permissions, usage dashboards, and subscription billing.',
        techStack: ['Next.js', 'TypeScript', 'Node.js', 'PostgreSQL', 'Prisma', 'Redis', 'AWS'],
        url: 'github.com/alexsharma/clouddesk',
        highlights: [
          'Built a multi-tenant SaaS application with organization management, team invitations, role-based permissions, usage dashboards, and subscription billing.',
          'Implemented tenant-aware database access and authorization checks to isolate organization data.',
          'Integrated payment webhooks and background jobs for subscription lifecycle events, invoices, and email notifications.',
          'Added caching, pagination, database indexes, and request validation to improve performance and reliability.',
          'Deployed the application using Docker, Nginx, AWS infrastructure, and automated CI/CD workflows.',
        ],
      },
      {
        name: 'ShopSphere — E-Commerce Platform',
        description: 'E-commerce platform featuring product discovery, search, category filters, shopping carts, checkout, and order tracking.',
        techStack: ['Next.js', 'React', 'TypeScript', 'MongoDB', 'Razorpay', 'Cloudinary'],
        url: 'github.com/alexsharma/shopsphere',
        highlights: [
          'Developed an e-commerce platform featuring product discovery, search, category filters, shopping carts, checkout, and order tracking.',
          'Integrated Razorpay payments with server-side payment verification and webhook handling.',
          'Built an administrative dashboard for product management, inventory updates, order processing, and sales analytics.',
          'Implemented image uploads, responsive layouts, authentication, and server-side input validation.',
          'Optimized product listings and image delivery to improve page loading and mobile usability.',
        ],
      },
      {
        name: 'DevFlow — AI-Powered Developer Productivity Tool',
        description: 'Collaborative workspace that generates task summaries, organizes project notes, and assists users with routine documentation.',
        techStack: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'AI API'],
        url: 'github.com/alexsharma/devflow',
        highlights: [
          'Developed a collaborative workspace that generates task summaries, organizes project notes, and assists users with routine documentation.',
          'Integrated an AI API through a backend service with request validation, usage limits, and error handling.',
          'Implemented searchable workspaces, saved conversations, user authentication, and usage tracking.',
          'Designed reusable UI components and a responsive interface for desktop and mobile users.',
          'Added API tests and logging to diagnose failures and monitor application behavior.',
        ],
      },
    ],
    education: [
      {
        school: 'ABC Institute of Technology, Pune, India',
        degree: 'Bachelor of Technology (B.Tech.)',
        field: 'Computer Science and Engineering',
        graduationDate: '2023',
        gpa: '8.4 / 10',
        honors: 'Relevant Coursework: Data Structures & Algorithms, Operating Systems, Database Management Systems, Computer Networks, Object-Oriented Programming, Software Engineering',
      },
    ],
    certifications: [
      'AWS Certified Developer – Associate',
      'Meta Front-End Developer Professional Certificate',
      'HackerRank SQL (Intermediate) Certificate',
    ],
  },

  // 2. Google (Staff Distributed Systems Engineer)
  {
    id: 'google-staff-distributed-systems',
    company: 'Google',
    companyKey: 'google',
    brandColor: '#4285F4',
    brandTextColor: '#FFFFFF',
    role: 'Staff Distributed Systems Engineer',
    category: 'PROGRAMMING',
    badge: 'PRO',
    atsScore: 99,
    experienceLevel: 'Staff (L6) / 9+ YOE',
    candidate: {
      name: 'Alexander Vance',
      title: 'Staff Distributed Systems Engineer',
      location: 'Mountain View, CA',
      email: 'a.vance.eng@gmail.com',
      phone: '+1 (650) 412-8890',
      linkedin: 'linkedin.com/in/alex-vance-systems',
      github: 'github.com/avance-dist',
    },
    summary:
      'Staff Software Engineer (L6) with 9+ years architecting planetary-scale distributed systems, multi-region consensus engines, and high-throughput RPC frameworks. Core contributor to Cloud Spanner storage engines, TrueTime transactional synchronization, and Borg container scheduling primitives handling tens of billions of daily RPCs across Google global fleet.',
    skills: [
      { category: 'Languages', skills: ['C++20', 'Go', 'Rust', 'Java', 'Python', 'SQL'] },
      { category: 'Distributed Systems & Storage', skills: ['Cloud Spanner', 'Bigtable', 'Colossus', 'Borg', 'Stubby / gRPC', 'TrueTime API', 'Paxos', 'Raft', 'Kafka'] },
      { category: 'Infrastructure & Cloud', skills: ['Google Cloud Platform (GCP)', 'Kubernetes', 'Borglet', 'Bazel', 'Envoy', 'Prometheus', 'Linux Kernel eBPF'] },
      { category: 'System Architecture', skills: ['Multi-Region Consensus', 'External Consistency (ACID)', 'CAP Theorem Trade-Offs', 'Zero-Copy Serialization', 'Fault Tolerance'] },
    ],
    experience: [
      {
        company: 'Google',
        title: 'Staff Software Engineer (L6) - Distributed Storage & Spanner',
        location: 'Sunnyvale, CA',
        startDate: '2021-03',
        endDate: 'Present',
        current: true,
        bullets: [
          'Architected and led the multi-year redesign of Spanner Paxos group rebalancing, reducing cross-datacenter commit latency by 38% for TrueTime-coordinated multi-region transactions handling 650,000 QPS.',
          'Designed zero-copy gRPC payload streaming pipeline over Stubby and Protocol Buffers processing 2.4M requests/sec, decreasing p99 tail latency by 41% and saving 18% fleet-wide compute utilization across 140,000 Borg containers.',
          'Architected dual-write zero-downtime migration layer between Bigtable and Spanner for Google Drive metadata, seamlessly migrating 450M daily active user records with zero data regression or SLA breaches.',
          'Implemented Borg cluster scheduler cooperative preemption heuristics in C++, improving aggregate CPU and memory utilization across global TPU v4/v5 pods by 14.6%.',
          'Chaired Google Core Systems Architecture Review Board, reviewing 40+ system designs annually and authoring organization-wide technical standards for Paxos invariant validation and formal verification using TLA+.',
          'Mentored 8 senior (L5) and staff (L6) engineers through promotions, technical roadmap formulation, and production post-mortem root cause investigations.',
        ],
      },
      {
        company: 'Cloudflare',
        title: 'Senior Systems Software Engineer - Edge Infrastructure',
        location: 'San Francisco, CA',
        startDate: '2017-06',
        endDate: '2021-02',
        bullets: [
          'Authored high-performance edge proxy plugins in Rust and C++ for Cloudflare Workers, handling 28M+ HTTP requests/sec with median processing overhead strictly below 1.1ms.',
          'Optimized TCP/QUIC connection termination pipelines in the Linux network stack, reducing mobile TLS handshake round-trips by 35% across APAC and EMEA edge nodes.',
          'Engineered automated BGP routing mitigation controllers that repelled volumetric SYN and UDP floods up to 1.6 Tbps without impacting legitimate enterprise tenant traffic.',
          'Built internal lock-free shared memory caching daemon in C, eliminating 82% of cross-process IPC context switches.',
        ],
      },
    ],
    projects: [
      {
        name: 'ConsensusCore — Distributed Raft/Paxos Engine in C++20',
        description: 'High-throughput, asynchronous consensus library implementing Raft with batched pipelining, snapshot isolation, and formal TLA+ model checking verification.',
        techStack: ['C++20', 'Asio', 'Protocol Buffers', 'gRPC', 'TLA+'],
        url: 'github.com/avance-dist/consensus-core',
        highlights: [
          'Sustained 420,000 committed entries/second with 3-node in-memory replication across gigabit Ethernet links.',
          'Implemented zero-copy log serialization and dynamic leader lease renewals, avoiding false re-election storms.',
        ],
      },
      {
        name: 'TurboRPC — High-Efficiency Zero-Copy Serialization Framework',
        description: 'Micro-benchmark and experimental RPC transport library leveraging Linux io_uring and custom binary memory layouts for zero-copy deserialization.',
        techStack: ['Rust', 'C++', 'io_uring', 'Linux Kernel'],
        url: 'github.com/avance-dist/turborpc',
        highlights: [
          'Demonstrated 3.2x throughput improvement over standard gRPC on synthetic 64-byte payload echo workloads.',
          'Published technical benchmarks adopted by 3,000+ open-source systems engineers.',
        ],
      },
    ],
    education: [
      {
        school: 'University of California, Berkeley',
        degree: 'Bachelor of Science (B.S.)',
        field: 'Electrical Engineering & Computer Science (EECS)',
        graduationDate: '2017',
        gpa: '3.92 / 4.0',
        honors: 'Summa Cum Laude, Eta Kappa Nu (EECS Honor Society), Regents & Chancellor’s Scholar',
      },
    ],
    certifications: [
      'Google Cloud Certified Fellow — Hybrid Multi-Cloud',
      'Linux Foundation Certified Kubernetes Administrator (CKA)',
    ],
  },

  // 3. Meta (Staff Data Infrastructure Engineer)
  {
    id: 'meta-senior-data-engineer',
    company: 'Meta',
    companyKey: 'meta',
    brandColor: '#0668E1',
    brandTextColor: '#FFFFFF',
    role: 'Staff Data Infrastructure Engineer',
    category: 'PROGRAMMING',
    badge: 'PRO',
    atsScore: 98,
    experienceLevel: 'Staff (IC6) / 8+ YOE',
    candidate: {
      name: 'Elena Rostova',
      title: 'Staff Data Infrastructure Engineer',
      location: 'Menlo Park, CA',
      email: 'elena.rostova.eng@gmail.com',
      phone: '+1 (650) 892-4412',
      linkedin: 'linkedin.com/in/elena-rostova-data',
      github: 'github.com/elena-rostova',
    },
    summary:
      'Staff Data Infrastructure Engineer (IC6) with 8+ years designing petabyte-scale real-time telemetry pipelines, distributed OLAP engines, and frontier foundation model training data infrastructure at Meta. Deep expertise in Presto/Trino internals, Scuba real-time analytics, RocksDB state compaction, and PyTorch FSDP data loaders supporting 3.2B daily active users.',
    skills: [
      { category: 'Languages', skills: ['Python', 'C++20', 'Java', 'Scala', 'SQL (ANSI/Presto)', 'Rust'] },
      { category: 'Data & Stream Processing', skills: ['Dataswarm', 'Presto / Trino', 'Scuba', 'Apache Flink', 'Apache Spark', 'Kafka', 'RocksDB', 'Apache Iceberg'] },
      { category: 'AI Infrastructure', skills: ['PyTorch FSDP', 'Llama Pre-Training Data Ingestion', 'Tokenization Engines', 'Arrow / Parquet', 'Ray'] },
      { category: 'Distributed Storage & Cloud', skills: ['HDFS', 'Ceph', 'AWS S3', 'Kubernetes', 'Grafana', 'Prometheus', 'Hive Metastore'] },
    ],
    experience: [
      {
        company: 'Meta',
        title: 'Staff Data Infrastructure Engineer (IC6) - Core Analytics & AI Data',
        location: 'Menlo Park, CA',
        startDate: '2021-04',
        endDate: 'Present',
        current: true,
        bullets: [
          'Architected and deployed real-time stream aggregation pipelines on Scuba and Presto handling 4.8TB/minute of ad engagement telemetry, reducing end-to-end data freshness latency from 9 minutes to 3.2 seconds for Ads ranking models.',
          'Re-engineered RocksDB state store compaction and write-ahead log flush algorithms across 2,800-node Dataswarm cluster, eliminating write stalls and reclaiming 1.4PB in NVMe solid-state storage.',
          'Designed the distributed tokenization and dataset staging pipeline for Llama 3 pre-training corpus (15T+ tokens), coordinating streaming chunking across 16,384 GPU nodes with zero data corruption.',
          'Optimized Presto distributed query planner pushdown predicates and dynamic partition pruning for 200PB+ data warehouse tables, slashing p90 query turnaround time by 52%.',
          'Built automated data governance framework enforcing CCPA/GDPR compliance deletions across 18,000 downstream pipeline dependencies, guaranteeing 100% legal SLA verification.',
          'Mentored 6 senior and staff engineers across Meta Infrastructure, leading cross-org working groups on columnar storage efficiency and Parquet vectorization.',
        ],
      },
      {
        company: 'Uber',
        title: 'Senior Data Engineer - Marketplace Intelligence',
        location: 'San Francisco, CA',
        startDate: '2018-05',
        endDate: '2021-03',
        bullets: [
          'Engineered Apache Flink and Kafka streaming pipelines ingesting 14M geospatial events/second to compute dynamic driver-rider supply/demand features with sub-100ms latency.',
          'Migrated 650TB of raw telemetry tables into Apache Iceberg format on HDFS, cutting query scan bytes by 44% and saving $1.4M annually in cluster compute costs.',
          'Developed automated anomaly detection framework monitoring 1,200+ ETL metrics using statistical z-score thresholds, preventing corrupt telemetry from degrading production dispatch models.',
        ],
      },
    ],
    projects: [
      {
        name: 'FastStream-Rocks — High-Throughput Stream State Store',
        description: 'Optimized RocksDB storage engine wrapper designed for high-cardinality streaming stateful joins in Apache Flink, utilizing io_uring and custom bloom filters.',
        techStack: ['C++', 'RocksDB', 'Java', 'io_uring', 'Flink'],
        url: 'github.com/elena-rostova/faststream-rocks',
        highlights: [
          'Achieved 1.8M write operations/sec per node with 40% lower memory footprint than standard Flink RocksDB statebackend.',
          'Adopted by multiple enterprise stream processing teams.',
        ],
      },
      {
        name: 'ParquetVector — SIMD-Accelerated Columnar Reader',
        description: 'Experimental AVX-512 accelerated columnar data decompression and filter scan library for high-throughput analytical query engines.',
        techStack: ['Rust', 'AVX-512', 'Apache Arrow', 'Parquet'],
        url: 'github.com/elena-rostova/parquet-vector',
        highlights: [
          'Demonstrated 4.4x faster decompression on Snappy-compressed integer dictionary columns.',
        ],
      },
    ],
    education: [
      {
        school: 'Carnegie Mellon University',
        degree: 'Master of Science (M.S.)',
        field: 'Computer Science (Systems & Data Infrastructure)',
        graduationDate: '2018',
        gpa: '3.94 / 4.0',
        honors: 'Graduate Research Assistant in Parallel Data Laboratory (PDL)',
      },
      {
        school: 'University of Washington',
        degree: 'Bachelor of Science (B.S.)',
        field: 'Computer Science',
        graduationDate: '2016',
        gpa: '3.89 / 4.0',
        honors: 'Dean’s List All Quarters, Magna Cum Laude',
      },
    ],
    certifications: [
      'Databricks Certified Apache Spark Developer',
      'AWS Certified Data Analytics — Specialty',
    ],
  },

  // 4. Apple (Senior Core OS & Embedded Software Engineer)
  {
    id: 'apple-core-os-engineer',
    company: 'Apple',
    companyKey: 'apple',
    brandColor: '#000000',
    brandTextColor: '#FFFFFF',
    role: 'Senior Core OS & Embedded Software Engineer',
    category: 'ENGINEERING',
    badge: 'PRO',
    atsScore: 98,
    experienceLevel: 'Senior (ICT4/ICT5) / 8+ YOE',
    candidate: {
      name: 'Marcus Thorne',
      title: 'Senior Core OS & Embedded Software Engineer',
      location: 'Cupertino, CA',
      email: 'marcus.thorne.eng@gmail.com',
      phone: '+1 (408) 555-0193',
      linkedin: 'linkedin.com/in/marcus-thorne-coreos',
      github: 'github.com/mthorne',
    },
    summary:
      'Senior Core OS Systems Engineer with 8+ years developing low-level Darwin kernel subsystems, Mach IPC messaging layers, and hardware-software drivers for Apple Silicon (M-series / A-series). Deep expertise in XNU kernel memory allocators, ARM64 low-power states, I/O Kit driver frameworks, and hard real-time CoreAudio pipelines in iOS and macOS.',
    skills: [
      { category: 'Languages', skills: ['C', 'C++20', 'ARM64 Assembly', 'Objective-C', 'Rust', 'Python'] },
      { category: 'Kernel & Systems', skills: ['Darwin / XNU Kernel', 'Mach IPC', 'I/O Kit', 'DriverKit', 'POSIX', 'Virtual Memory (VM)', 'Thread Scheduling'] },
      { category: 'Hardware & Architecture', skills: ['Apple Silicon (M1/M2/M3/M4)', 'ARM v8/v9 Architecture', 'Unified Memory Architecture', 'DMA', 'Interrupts / ISR'] },
      { category: 'Tooling & Profiling', skills: ['Instruments', 'LLVM / Clang', 'LLDB', 'DTrace', 'GDB', 'Logic Analyzers', 'Oscilloscopes'] },
    ],
    experience: [
      {
        company: 'Apple',
        title: 'Senior Core OS Systems Engineer - Darwin Kernel & I/O Kit',
        location: 'Cupertino, CA',
        startDate: '2020-09',
        endDate: 'Present',
        current: true,
        bullets: [
          'Engineered custom slab memory allocator enhancements within the XNU kernel for iOS and macOS, reducing heap fragmentation by 32% and reclaiming up to 180MB of active RAM across background daemon processes.',
          'Optimized Mach IPC message dispatching for Apple Silicon unified memory architecture, cutting inter-process context switch latency by 45% for high-frequency CoreAudio daemons in Logic Pro and Final Cut Pro.',
          'Co-developed power-aware thread scheduling primitives for heterogeneous Apple Silicon (Performance vs Efficiency cores), extending MacBook battery endurance by 1.6 hours during heavy 4K ProRes rendering.',
          'Authored high-throughput device drivers in DriverKit for next-generation camera sensor ISP interfaces, guaranteeing deterministic sub-millisecond frame delivery without dropped buffers.',
          'Implemented lock-free ring buffers in C++20 for sensor fusion telemetry, eliminating priority inversion across hard real-time hardware interrupt handlers.',
        ],
      },
      {
        company: 'Qualcomm',
        title: 'Embedded Software Engineer - Snapdragon Mobile Platforms',
        location: 'San Diego, CA',
        startDate: '2016-07',
        endDate: '2020-08',
        bullets: [
          'Authored Linux kernel device drivers and hardware abstraction layer (HAL) modules for Snapdragon application processors in C and ARM64 assembly.',
          'Profiled and optimized hardware interrupt service routines (ISRs) on ARM Cortex-A76 cores, reducing audio latency glitch rates to 0.001% under full CPU load.',
          'Developed automated power-state profiling harness utilizing custom debug probes and Python, shortening board bring-up validation from 6 weeks to 10 days.',
        ],
      },
    ],
    projects: [
      {
        name: 'MachMicro — Minimalist Microkernel IPC Benchmark',
        description: 'Comprehensive benchmarking suite measuring Mach IPC, shared memory rings, and Unix domain socket throughput on macOS Apple Silicon.',
        techStack: ['C', 'ARM64 Assembly', 'Mach APIs', 'Instruments'],
        url: 'github.com/mthorne/machmicro',
        highlights: [
          'Measures nano-second precision latency across thread migration and cache invalidation boundaries.',
          'Cited in several systems engineering blogs on Apple Silicon internals.',
        ],
      },
      {
        name: 'LockFreeDSP — Real-Time Audio Circular Buffer',
        description: 'Single-producer single-consumer circular buffer implemented with strict C++ memory models and cache-line alignment to eliminate false sharing.',
        techStack: ['C++20', 'SIMD', 'CoreAudio'],
        url: 'github.com/mthorne/lockfreedsp',
        highlights: [
          'Zero allocations in audio thread, tested under 192kHz/32-bit floating point audio workloads.',
        ],
      },
    ],
    education: [
      {
        school: 'Georgia Institute of Technology',
        degree: 'Bachelor of Science (B.S.)',
        field: 'Computer Engineering',
        graduationDate: '2016',
        gpa: '3.94 / 4.0',
        honors: 'Highest Honors, President’s Undergraduate Research Award',
      },
    ],
    certifications: [
      'Arm Certified Engineer — SoC Architecture',
      'IEEE Senior Member',
    ],
  },

  // 5. Amazon Web Services (Principal Solutions Architect)
  {
    id: 'amazon-principal-solutions-architect',
    company: 'Amazon Web Services',
    companyKey: 'amazon',
    brandColor: '#FF9900',
    brandTextColor: '#111827',
    role: 'Principal Solutions Architect',
    category: 'ENGINEERING',
    badge: 'PRO',
    atsScore: 99,
    experienceLevel: 'Principal (L7) / 10+ YOE',
    candidate: {
      name: 'David Chen',
      title: 'Principal Solutions Architect',
      location: 'Seattle, WA',
      email: 'david.chen.aws@gmail.com',
      phone: '+1 (206) 555-0142',
      linkedin: 'linkedin.com/in/davidchen-cloud',
      github: 'github.com/dchen-cloud',
    },
    summary:
      'Enterprise Cloud Solutions Architect with 10+ years designing resilient, secure, distributed cloud systems on AWS for Fortune 100 enterprises. Proven track record executing multi-region active-active migrations, implementing zero-trust security postures, and optimizing infrastructure spend across multi-account AWS organizations. Deep expertise in AWS Well-Architected Framework, Kubernetes (EKS), Terraform, event-driven microservices, and regulatory compliance (SOC 2, PCI-DSS, HIPAA).',
    skills: [
      {
        category: 'Cloud & Infrastructure',
        skills: ['AWS (Compute, Storage, Networking, Security)', 'Multi-Region Architecture', 'Disaster Recovery (RTO < 5m, RPO < 1m)', 'AWS Well-Architected Framework', 'Hybrid Cloud', 'Direct Connect'],
      },
      {
        category: 'Containers & Orchestration',
        skills: ['Kubernetes (EKS)', 'Docker', 'ECS / Fargate', 'Helm', 'Service Mesh (Istio, AWS App Mesh)', 'GitOps (ArgoCD)'],
      },
      {
        category: 'Infrastructure as Code & CI/CD',
        skills: ['Terraform', 'AWS CDK', 'CloudFormation', 'Terragrunt', 'GitHub Actions', 'GitLab CI', 'Packer'],
      },
      {
        category: 'Data & Event-Driven Systems',
        skills: ['Amazon Aurora (Global Database)', 'DynamoDB (Global Tables)', 'Apache Kafka / Amazon MSK', 'Amazon Kinesis', 'Amazon SQS/SNS', 'EventBridge'],
      },
      {
        category: 'Security & Compliance',
        skills: ['AWS IAM & Organizations', 'KMS & Secrets Manager', 'AWS WAF & Shield', 'Zero-Trust Architecture', 'SOC 2 Type II', 'PCI-DSS Level 1', 'HIPAA'],
      },
      {
        category: 'Observability & Networking',
        skills: ['Amazon CloudWatch', 'Datadog', 'OpenTelemetry', 'Transit Gateway', 'VPC Peering & PrivateLink', 'Route 53 (Latency / Geolocation Routing)'],
      },
    ],
    experience: [
      {
        company: 'Amazon Web Services (AWS)',
        title: 'Principal Solutions Architect — Financial Services & Enterprise',
        location: 'Seattle, WA',
        startDate: '2022-01',
        endDate: 'Present',
        current: true,
        bullets: [
          'Advised C-suite executives and principal engineers across 15+ Fortune 100 enterprise accounts on strategic cloud modernization, directly influencing $38M in incremental annual cloud consumption.',
          'Architected a multi-region active-active core banking transaction platform using Amazon Aurora Global Database, DynamoDB Global Tables, and Route 53 Application Recovery Controller, achieving 99.999% availability with RTO < 30 seconds and RPO < 1 second.',
          'Led the cloud migration architecture of a legacy monolithic payments processing platform to event-driven microservices on AWS EKS and Amazon MSK, scaling throughput to 85,000 transactions/second.',
          'Conducted 40+ AWS Well-Architected Reviews across enterprise customer workloads, identifying critical reliability and security risks that averted potential sev-1 outages during peak retail periods.',
          'Designed a cell-based architecture pattern for hyper-scale multi-tenant SaaS clients, isolating blast radius and cutting global failover times from 45 minutes to under 2 minutes.',
          'Authored AWS whitepapers and reference architectures on multi-region active-active resilience and zero-trust IAM governance downloaded by 50,000+ practitioners.',
        ],
      },
      {
        company: 'Capital One',
        title: 'Lead Cloud Architect — Core Platform Engineering',
        location: 'McLean, VA',
        startDate: '2018-03',
        endDate: '2021-12',
        bullets: [
          'Architected and executed the end-to-end migration of 120+ mission-critical workloads from on-premises datacenters to AWS, retiring 3 physical datacenters and saving $14M in annual operating costs.',
          'Designed enterprise multi-account AWS Organization structure with 350+ AWS accounts, automated SCP guardrails, centralized egress filtering via AWS Transit Gateway, and federated Okta IAM SSO.',
          'Established Infrastructure as Code (IaC) governance framework with Terraform and Terragrunt, standardizing 60+ modular blueprints adopted by 400+ developers.',
          'Automated SOC 2 and PCI-DSS compliance verification using AWS Config Rules and CloudWatch, eliminating 80% of manual audit prep time.',
        ],
      },
      {
        company: 'Deloitte Consulting',
        title: 'Senior Cloud Consultant — Technology Strategy',
        location: 'Chicago, IL',
        startDate: '2015-06',
        endDate: '2018-02',
        bullets: [
          'Delivered cloud readiness assessments, TCO analyses, and cloud adoption roadmaps for healthcare, retail, and manufacturing enterprises migrating to AWS.',
          'Implemented automated CI/CD deployment pipelines using Jenkins, Docker, and AWS CloudFormation for 18 enterprise client engagements.',
        ],
      },
    ],
    projects: [
      {
        name: 'Enterprise Multi-Region Cell-Based Architecture Blueprint',
        description: 'Production-ready reference implementation of cell-based architecture on AWS with automated routing failover, cell provisioning, and cross-cell data replication.',
        techStack: ['AWS CDK (TypeScript)', 'Amazon EKS', 'Aurora Global Database', 'DynamoDB', 'Route 53 ARC'],
        url: 'github.com/dchen-cloud/aws-cell-based-architecture',
        highlights: [
          'Demonstrated zero-data-loss failover under synthetic regional blackhole network partition tests.',
          'Adopted by 3 global fintech enterprises processing $10B+ in annual transaction volume.',
        ],
      },
      {
        name: 'Terraform AWS Enterprise Landing Zone Module',
        description: 'Modular Terraform framework provisioning secure, compliant multi-account AWS environments with centralized logging, guardrails, and Transit Gateway networking.',
        techStack: ['Terraform', 'Terragrunt', 'AWS Organizations', 'AWS SSO', 'Transit Gateway'],
        url: 'github.com/dchen-cloud/terraform-aws-landing-zone',
        highlights: [
          'Over 1,400 GitHub stars and 200,000+ module downloads on Terraform Registry.',
        ],
      },
    ],
    education: [
      {
        school: 'University of Michigan',
        degree: 'Bachelor of Science (B.S.)',
        field: 'Computer Science & Engineering',
        graduationDate: '2015',
        gpa: '3.88 / 4.0',
        honors: 'Summa Cum Laude, Tau Beta Pi Engineering Honor Society',
      },
    ],
    certifications: [
      'AWS Certified Solutions Architect — Professional',
      'AWS Certified Security — Specialty',
      'AWS Certified Advanced Networking — Specialty',
      'Certified Kubernetes Administrator (CKA)',
      'HashiCorp Certified: Terraform Associate',
    ],
  },

  // 6. Microsoft (Principal Technical Product Manager)
  {
    id: 'microsoft-senior-technical-product-manager',
    company: 'Microsoft',
    companyKey: 'microsoft',
    brandColor: '#00A4EF',
    brandTextColor: '#FFFFFF',
    role: 'Principal Technical Product Manager (Azure AI & Copilot)',
    category: 'BUSINESS',
    badge: 'PRO',
    atsScore: 98,
    experienceLevel: 'Principal (L65) / 8+ YOE',
    candidate: {
      name: 'Sarah Jenkins',
      title: 'Principal Technical Product Manager (Azure AI)',
      location: 'Redmond, WA',
      email: 'sarah.jenkins.pm@gmail.com',
      phone: '+1 (425) 555-0188',
      linkedin: 'linkedin.com/in/sarahjenkins-pm',
    },
    summary:
      'Principal Technical Product Manager with 8+ years leading developer platforms, cloud API infrastructure, and generative AI services at hyperscale. Currently driving the enterprise developer experience and governance platform for Azure OpenAI Service and Microsoft Copilot Studio. Track record of taking zero-to-one developer infrastructure products to $120M+ in annualized run-rate with 45,000+ enterprise tenants.',
    skills: [
      { category: 'Product Strategy & Leadership', skills: ['0-to-1 Product Incubation', 'Enterprise SaaS Roadmapping', 'Developer Experience (DX)', 'API Product Management', 'Go-To-Market (GTM) Strategy', 'OKRs & Metrics'] },
      { category: 'AI & Cloud Platform', skills: ['Azure OpenAI Service', 'Large Language Models (LLMs)', 'RAG Architecture', 'Vector Databases', 'Content Safety & Alignment', 'Fine-Tuning APIs'] },
      { category: 'Technical Proficiencies', skills: ['REST / GraphQL APIs', 'SDK Design', 'System Architecture', 'SQL & Kusto (KQL)', 'Telemetry & Instrumentation', 'SOC 2 & GDPR Governance'] },
      { category: 'Methodologies', skills: ['Customer Discovery', 'Data-Informed Prioritization', 'Competitive Analysis', 'Agile / Scrum', 'Cross-Functional Team Leadership'] },
    ],
    experience: [
      {
        company: 'Microsoft',
        title: 'Principal Technical Product Manager - Azure AI Platform & Copilot',
        location: 'Redmond, WA',
        startDate: '2021-08',
        endDate: 'Present',
        current: true,
        bullets: [
          'Owned the enterprise platform roadmap and developer ecosystem for Azure OpenAI Service, scaling the product from initial private preview to 45,000+ paying enterprise organizations generating $120M+ in ARR.',
          'Spearheaded the design and launch of Provisioned Throughput Units (PTU), delivering deterministic latency guarantees and dedicated GPU reservations for Tier-1 banking and healthcare customers.',
          'Conducted deep user research with 120+ Fortune 500 engineering leaders to design enterprise RAG evaluation APIs, resulting in a 4.6/5 customer satisfaction score and 62% reduction in onboarding time.',
          'Partnered with OpenAI leadership and Microsoft AI Safety teams to co-develop automated content filtering and prompt injection defense suites adopted by 100% of managed enterprise deployments.',
          'Championed multi-region failover and quota management UX across 14 Azure datacenter regions, reducing API throttling incidents by 74%.',
          'Mentored 5 mid-level and senior PMs across Azure Cognitive Services on technical product specification writing and telemetry instrumentation.',
        ],
      },
      {
        company: 'Amazon Web Services (AWS)',
        title: 'Senior Product Manager - Developer Tools & SDKs',
        location: 'Seattle, WA',
        startDate: '2018-06',
        endDate: '2021-07',
        bullets: [
          'Led product definition for AWS Cloud Development Kit (CDK) v2, simplifying multi-language infrastructure-as-code authoring and growing monthly active developer downloads by 310%.',
          'Defined telemetry and metrics dashboards using AWS Athena and QuickSight, identifying developer friction in API authentication that reduced CLI drop-off by 28%.',
          'Authored comprehensive PR/FAQs, feature specifications, and ROI business cases presented directly to VP of Developer Tools.',
        ],
      },
    ],
    projects: [
      {
        name: 'Enterprise GenAI Deployment Playbook & Reference App',
        description: 'Comprehensive open-source architectural guide and Next.js/Python reference application demonstrating enterprise RAG with Azure OpenAI and Azure AI Search.',
        techStack: ['Azure OpenAI', 'Python', 'Next.js', 'Azure AI Search', 'Cosmos DB'],
        url: 'github.com/azure-samples/enterprise-rag-blueprint',
        highlights: [
          'Featured in Microsoft Build keynote presentation with 12,000+ GitHub stars.',
          'Adopted as official enterprise onboarding sample by global sales engineering.',
        ],
      },
    ],
    education: [
      {
        school: 'Stanford University',
        degree: 'Master of Business Administration (MBA)',
        field: 'Technology Management & Strategy',
        graduationDate: '2018',
        honors: 'Arjay Miller Scholar (Top 10% of Class)',
      },
      {
        school: 'University of Illinois Urbana-Champaign',
        degree: 'Bachelor of Science (B.S.)',
        field: 'Computer Engineering',
        graduationDate: '2014',
        gpa: '3.91 / 4.0',
        honors: 'Bronze Tablet (Top 3% of University Graduate Class)',
      },
    ],
    certifications: [
      'Pragmatic Institute Certified (PMC-III)',
      'Microsoft Certified: Azure Solutions Architect Expert',
    ],
  },

  // 7. Netflix (Senior Streaming Reliability Engineer)
  {
    id: 'netflix-senior-sre-streaming',
    company: 'Netflix',
    companyKey: 'netflix',
    brandColor: '#E50914',
    brandTextColor: '#FFFFFF',
    role: 'Senior Streaming Reliability Engineer',
    category: 'ENGINEERING',
    badge: 'PRO',
    atsScore: 99,
    experienceLevel: 'Senior / 8+ YOE',
    candidate: {
      name: 'Soren Lindqvist',
      title: 'Senior Streaming Reliability Engineer',
      location: 'Los Gatos, CA',
      email: 'soren.lindqvist.sre@gmail.com',
      phone: '+1 (408) 555-0177',
      linkedin: 'linkedin.com/in/soren-lindqvist-sre',
      github: 'github.com/slindqvist-sre',
    },
    summary:
      'Senior Streaming Reliability Engineer with 8+ years ensuring uninterrupted 4K HDR playback for 270M+ global members. Specialized in Titus container runtime resilience, eBPF network telemetry, automated regional evacuation (Chaos Monkey / Spinnaker), and Mantis stream processing handling tens of millions of concurrent video streams.',
    skills: [
      { category: 'SRE & Reliability', skills: ['Chaos Engineering', 'Chaos Monkey / Simian Army', 'Automated Regional Evacuation', 'eBPF Tracing', 'Root Cause Analysis', 'SLIs/SLOs'] },
      { category: 'Container & Cloud Infrastructure', skills: ['Titus Container Runtime', 'AWS (EC2, VPC, S3)', 'Docker', 'Spinnaker', 'Envoy Proxy', 'Zuul Gateway'] },
      { category: 'Observability & Streaming', skills: ['Mantis Stream Processing', 'Atlas Telemetry Engine', 'Prometheus', 'Vector', 'Distributed Tracing (Zipkin)'] },
      { category: 'Languages & Scripting', skills: ['Go', 'Python', 'C', 'Java', 'Bash', 'BCC / libbpf'] },
    ],
    experience: [
      {
        company: 'Netflix',
        title: 'Senior Streaming Reliability Engineer - Edge & Playback Infrastructure',
        location: 'Los Gatos, CA',
        startDate: '2021-02',
        endDate: 'Present',
        current: true,
        bullets: [
          'Architected global automated traffic evacuation controller in Envoy, shifting 45M+ concurrent video streams across AWS regions within 75 seconds during catastrophic cloud datacenter fiber cuts.',
          'Authored custom eBPF kernel probes for Titus container runtime to capture TCP retransmits and socket buffer drops across 18,000 microservice pods, feeding real-time anomaly metrics into Mantis.',
          'Executed multi-region chaos experiments simulating sudden AWS region blackouts, discovering and remediating 14 cascading retry storms before major holiday streaming peaks.',
          'Engineered adaptive rate-limiting and shedding heuristics for Zuul API Gateway, safeguarding playback initiation APIs and sustaining 99.999% stream start success rate during live sporting broadcasts.',
          'Reduced global customer playback rebuffering rate by 18% through automated dynamic edge manifest server selection and DNS latency optimizations.',
          'Led blameless post-mortem program for Streaming Platform organization, driving 100% remediation of sev-1 prevention action items within 30 days.',
        ],
      },
      {
        company: 'Spotify',
        title: 'Site Reliability Engineer - Core Audio Pipeline',
        location: 'Stockholm, Sweden / Boston, MA',
        startDate: '2017-08',
        endDate: '2021-01',
        bullets: [
          'Ensured 99.99% availability for Spotify core audio transcoding and distribution clusters serving 150M+ active music listeners.',
          'Built automated canary analysis service using Prometheus and Python, automatically halting flawed service deployments that degraded audio stream bitrates.',
          'Optimized Linux kernel TCP buffer configurations on edge CDN termination nodes, decreasing audio track start latency by 32ms globally.',
        ],
      },
    ],
    projects: [
      {
        name: 'eBPF-StreamSentry — Kernel-Level TCP Anomaly Probe',
        description: 'Lightweight Linux eBPF probe monitoring microburst TCP queue drops and latency spikes with sub-0.5% CPU overhead.',
        techStack: ['C', 'eBPF / BCC', 'Go', 'Prometheus'],
        url: 'github.com/slindqvist-sre/streamsentry',
        highlights: [
          'Featured in Linux Systems & SRE conference talks with 1,800+ GitHub stars.',
        ],
      },
    ],
    education: [
      {
        school: 'KTH Royal Institute of Technology',
        degree: 'Master of Science (M.S.)',
        field: 'Distributed Systems & Network Architecture',
        graduationDate: '2017',
        honors: 'Graduated with Highest Distinction',
      },
      {
        school: 'KTH Royal Institute of Technology',
        degree: 'Bachelor of Science (B.S.)',
        field: 'Computer Engineering',
        graduationDate: '2015',
      },
    ],
    certifications: [
      'Linux Foundation Certified Systems Administrator (LFCS)',
      'AWS Certified DevOps Engineer — Professional',
    ],
  },

  // 8. Tesla (Staff Autopilot & Computer Vision Systems Engineer)
  {
    id: 'tesla-autopilot-systems-engineer',
    company: 'Tesla',
    companyKey: 'tesla',
    brandColor: '#E82127',
    brandTextColor: '#FFFFFF',
    role: 'Staff Autopilot & Computer Vision Systems Engineer',
    category: 'ENGINEERING',
    badge: 'PRO',
    atsScore: 99,
    experienceLevel: 'Staff / 8+ YOE',
    candidate: {
      name: 'Priya Patel',
      title: 'Staff Autopilot & Computer Vision Systems Engineer',
      location: 'Palo Alto, CA',
      email: 'priya.patel.autopilot@gmail.com',
      phone: '+1 (650) 555-0163',
      linkedin: 'linkedin.com/in/priyapatel-vision',
      github: 'github.com/ppatel-autopilot',
    },
    summary:
      'Staff Autopilot Systems Engineer with 8+ years developing real-time multi-camera computer vision backbones, neural network quantization pipelines, and low-latency inference loops for Tesla Full Self-Driving (FSD) Hardware (HW3/HW4) and Dojo supercomputer clusters. Expert in HydraNet multi-task vision, C++20 real-time robotics runtimes, and INT8/FP8 TensorRT acceleration.',
    skills: [
      { category: 'Languages', skills: ['C++20', 'Python', 'CUDA C/C++', 'C', 'PyTorch'] },
      { category: 'Autopilot & Computer Vision', skills: ['HydraNet Architecture', 'Occupancy Networks', 'Multi-Camera Feature Stitching', 'Vector Space Reconstruction', 'Object Detection / Tracking'] },
      { category: 'Hardware & Acceleration', skills: ['Tesla FSD Computer (HW3/HW4)', 'Tesla Dojo Architecture', 'NVIDIA TensorRT', 'INT8 / FP8 Quantization', 'Neural Processing Units (NPU)'] },
      { category: 'Systems & Robotics', skills: ['Hard Real-Time Inference (<20ms)', 'POSIX / QNX', 'CAN Bus / Automotive Ethernet', 'SIMD Intrinsics', 'Autonomous Robotics'] },
    ],
    experience: [
      {
        company: 'Tesla',
        title: 'Staff Autopilot Systems Engineer - Vision & Neural Inference',
        location: 'Palo Alto, CA',
        startDate: '2021-05',
        endDate: 'Present',
        current: true,
        bullets: [
          'Architected the real-time inference pipeline for Tesla FSD Occupancy Networks on FSD Computer HW4, running continuous 36-frame 3D volumetric reconstruction at 36 FPS within a strict 18ms latency budget.',
          'Quantized HydraNet multi-task vision backbone from FP32 to INT8 using Post-Training Quantization (PTQ) and Quantization-Aware Training (QAT), recovering 99.8% precision while cutting neural compute energy by 42%.',
          'Optimized inter-camera frame synchronization and hardware DMA memory transfers across all 8 external HDR cameras, eliminating frame tearing under intense sunlight transition scenarios.',
          'Developed custom C++20 trajectory planner integration routines, slashing end-to-end perception-to-actuation response latency by 14ms across 3.5M production FSD vehicles.',
          'Collaborated with Dojo hardware engineers to optimize training data batching over high-bandwidth Dojo tiles, accelerating Foundation Vision model training iterations by 2.8x.',
        ],
      },
      {
        company: 'Waymo',
        title: 'Senior Autonomous Systems Software Engineer',
        location: 'Mountain View, CA',
        startDate: '2017-09',
        endDate: '2021-04',
        bullets: [
          'Engineered real-time sensor fusion modules combining 64-channel LiDAR point clouds with high-resolution radar and camera feeds in C++17.',
          'Implemented Kalman filtering and Hungarian tracking algorithms for pedestrian intention forecasting, reducing false-positive phantom braking events by 68%.',
          'Conducted hardware-in-the-loop (HIL) simulation testing across 10,000 synthetic collision-avoidance scenarios before production fleet deployment.',
        ],
      },
    ],
    projects: [
      {
        name: 'VoxelFlow — Real-Time 3D Occupancy Grid Engine',
        description: 'High-performance C++20 and CUDA implementation of real-time 3D camera-based occupancy grid reconstruction for mobile robots.',
        techStack: ['C++20', 'CUDA', 'TensorRT', 'OpenGL'],
        url: 'github.com/ppatel-autopilot/voxelflow',
        highlights: [
          'Executes dense 128x128x32 voxel prediction at 60 FPS on mobile GPU hardware.',
        ],
      },
    ],
    education: [
      {
        school: 'Stanford University',
        degree: 'Master of Science (M.S.)',
        field: 'Computer Science (Robotics & Artificial Intelligence)',
        graduationDate: '2017',
        gpa: '3.96 / 4.0',
        honors: 'Stanford Robotics Lab Graduate Fellowship',
      },
      {
        school: 'University of California, San Diego',
        degree: 'Bachelor of Science (B.S.)',
        field: 'Electrical Engineering',
        graduationDate: '2015',
        gpa: '3.91 / 4.0',
        honors: 'Summa Cum Laude',
      },
    ],
    certifications: [
      'ISO 26262 Automotive Functional Safety Professional',
      'NVIDIA Deep Learning Institute — Computer Vision & TensorRT',
    ],
  },

  // 9. NVIDIA (Senior Deep Learning Compiler & CUDA Systems Engineer)
  {
    id: 'nvidia-deep-learning-research-engineer',
    company: 'NVIDIA',
    companyKey: 'nvidia',
    brandColor: '#76B900',
    brandTextColor: '#FFFFFF',
    role: 'Senior Deep Learning Compiler & CUDA Systems Engineer',
    category: 'ENGINEERING',
    badge: 'PRO',
    atsScore: 99,
    experienceLevel: 'Senior / 7+ YOE',
    candidate: {
      name: 'Kenji Takahashi',
      title: 'Senior Deep Learning Compiler & CUDA Systems Engineer',
      location: 'Santa Clara, CA',
      email: 'kenji.takahashi.cuda@gmail.com',
      phone: '+1 (408) 555-0155',
      linkedin: 'linkedin.com/in/kenji-takahashi-cuda',
      github: 'github.com/ktakahashi-gpu',
    },
    summary:
      'Senior Deep Learning Systems Engineer with 7+ years optimizing frontier LLM training and inference runtimes on NVIDIA Hopper (H100/H200) and Blackwell (B200) architectures. Core developer of custom FlashAttention-3 kernels, FP8 GEMM optimizations in TensorRT-LLM, Megatron-LM tensor parallelism, and NVLink inter-GPU collective communication.',
    skills: [
      { category: 'Languages', skills: ['CUDA C/C++', 'Modern C++ (C++20)', 'Python', 'PTX Assembly', 'Rust'] },
      { category: 'GPU Architectures & Tooling', skills: ['NVIDIA Hopper (H100)', 'NVIDIA Blackwell (B200)', 'TensorRT-LLM', 'Triton', 'CUTLASS', 'NVIDIA Nsight Compute', 'Nsight Systems'] },
      { category: 'Distributed Training & Kernels', skills: ['FlashAttention-2/3', 'Megatron-LM', 'Tensor / Pipeline Parallelism', 'NCCL', 'NVLink / NVSwitch', 'FP8 / INT4 GEMM'] },
      { category: 'Frameworks & Systems', skills: ['PyTorch Internals', 'DeepSpeed', 'vLLM', 'Slurm', 'Linux Kernel GPU Driver'] },
    ],
    experience: [
      {
        company: 'NVIDIA',
        title: 'Senior Deep Learning Compiler & Systems Engineer - TensorRT-LLM',
        location: 'Santa Clara, CA',
        startDate: '2021-06',
        endDate: 'Present',
        current: true,
        bullets: [
          'Authored custom CUTLASS and PTX kernels for Hopper H100 Tensor Cores, optimizing FlashAttention-3 backward pass and achieving 78% of theoretical peak FP8 TFLOPS.',
          'Engineered low-latency KV-cache paging and continuous batching mechanisms in TensorRT-LLM, reducing Time-to-First-Token (TTFT) by 44% for Llama 70B parameter models.',
          'Optimized NCCL AllReduce and AllGather collective routines over NVLink 4 / NVSwitch fabrics across 1,024-GPU clusters, cutting inter-node communication bubbles by 26%.',
          'Profiled memory bandwidth bottlenecks using Nsight Compute, redesigning shared memory (SRAM) tile loading to completely eliminate bank conflicts during grouped-query attention (GQA).',
          'Contributed core C++ runtime optimizations to open-source vLLM and TensorRT-LLM repositories, enabling seamless INT4/FP8 mixed-precision deployment.',
        ],
      },
      {
        company: 'Intel Corporation',
        title: 'HPC & Parallel Computing Systems Engineer',
        location: 'Hillsboro, OR',
        startDate: '2018-06',
        endDate: '2021-05',
        bullets: [
          'Developed parallel linear algebra benchmarks and GEMM kernel optimizations for Intel Xeon processors utilizing AVX-512 instructions in C++ and OpenMP.',
          'Collaborated on oneAPI Level Zero driver profiling, diagnosing memory latency bottlenecks and reducing PCIe host-to-device transfer overhead by 31%.',
        ],
      },
    ],
    projects: [
      {
        name: 'FlashAttention-Custom — FP8 Warp-Specialized Attention Kernel',
        description: 'Custom CUDA attention kernel utilizing Hopper TMA (Tensor Memory Accelerator) and warp-specialization to overlap compute and global memory copies.',
        techStack: ['CUDA C++', 'CUTLASS', 'PTX', 'Nsight Compute'],
        url: 'github.com/ktakahashi-gpu/flash-fp8',
        highlights: [
          'Demonstrates 1.35x speedup over standard baseline on 8k context length inference workloads.',
        ],
      },
    ],
    education: [
      {
        school: 'University of Illinois Urbana-Champaign (UIUC)',
        degree: 'Master of Science (M.S.)',
        field: 'Computer Science (High-Performance Computing)',
        graduationDate: '2018',
        gpa: '3.93 / 4.0',
      },
      {
        school: 'University of Tokyo',
        degree: 'Bachelor of Engineering (B.Eng.)',
        field: 'Information Science',
        graduationDate: '2016',
        honors: 'Top Graduate Honors',
      },
    ],
    certifications: [
      'NVIDIA Certified Associate — High-Performance Computing',
      'NVIDIA DLI Certified Instructor — Accelerated Computing with CUDA C/C++',
    ],
  },

  // 10. Stripe (Staff Payments Infrastructure Architect)
  {
    id: 'stripe-payments-infrastructure',
    company: 'Stripe',
    companyKey: 'stripe',
    brandColor: '#635BFF',
    brandTextColor: '#FFFFFF',
    role: 'Staff Payments Infrastructure Architect',
    category: 'PROGRAMMING',
    badge: 'PRO',
    atsScore: 99,
    experienceLevel: 'Staff (IC6) / 9+ YOE',
    candidate: {
      name: 'Liam O’Connor',
      title: 'Staff Payments Infrastructure Architect',
      location: 'San Francisco, CA',
      email: 'liam.oconnor.payments@gmail.com',
      phone: '+1 (415) 555-0144',
      linkedin: 'linkedin.com/in/liam-oconnor-fintech',
      github: 'github.com/liam-payments',
    },
    summary:
      'Staff Software Engineer (IC6) with 9+ years scaling global financial infrastructure, immutable ledger engines, and payment rail integrations processing over $20B in annualized volume. Deep expertise in distributed idempotency layers, double-entry bookkeeping ledgers, Sorbet static analysis on hyper-scale Ruby monoliths, and Raft-based state machines guaranteeing zero double-charging.',
    skills: [
      { category: 'Languages', skills: ['Ruby (with Sorbet)', 'Go', 'Java', 'SQL', 'TypeScript', 'C++'] },
      { category: 'Financial Systems & Storage', skills: ['Immutable Double-Entry Ledgers', 'Idempotency Frameworks', 'Distributed Transactions', 'PostgreSQL', 'Redis', 'Kafka', 'Raft Consensus'] },
      { category: 'Architecture & Resilience', skills: ['Exactly-Once Semantics', 'Outbox Projection Pattern', 'Network Partition Tolerance', 'Event-Sourced Systems', 'Zero-Downtime Schema Evolution'] },
      { category: 'Security & Compliance', skills: ['PCI-DSS Level 1', 'SOX Compliance', 'Tokenization Engines', 'HSM Integration', 'mTLS'] },
    ],
    experience: [
      {
        company: 'Stripe',
        title: 'Staff Software Engineer (IC6) - Core Payments & Ledger Infrastructure',
        location: 'San Francisco, CA',
        startDate: '2021-03',
        endDate: 'Present',
        current: true,
        bullets: [
          'Architected and deployed an append-only distributed ledger engine in Go and Ruby processing $20B+ in annual transactional volume, eliminating double-charging anomalies under extreme network retry storms.',
          'Engineered a multi-layered distributed idempotency framework utilizing deterministic SHA-256 request signatures and atomic check-and-lock Redis primitives, guaranteeing exactly-once processing across 35M+ daily API calls.',
          'Led the migration of critical financial payment paths to strict Sorbet static typing across a 4M-line Ruby monolith, reducing runtime production type errors by 46% for 350+ engineers.',
          'Implemented outbox-driven transaction projections with Kafka, decoupling synchronous payment authorizations from downstream balance ledger updates and slashing p99 API response time from 380ms to 92ms.',
          'Designed automated bank settlement reconciliation engine, resolving 99.98% of cross-border currency conversion mismatches without human intervention.',
          'Chaired Payments Infrastructure Architecture Working Group, establishing backward-compatible API versioning guidelines adopted across all Stripe product surfaces.',
        ],
      },
      {
        company: 'Adyen',
        title: 'Senior Backend Engineer - Acquiring Systems',
        location: 'Amsterdam, Netherlands / San Francisco, CA',
        startDate: '2017-06',
        endDate: '2021-02',
        bullets: [
          'Engineered direct card scheme integrations (Visa, Mastercard, Amex) in Java processing 2,500 transactions/second with sub-100ms authorization latency.',
          'Implemented tokenization vaults compliant with PCI-DSS Level 1, protecting sensitive PAN data using AES-256-GCM hardware security modules (HSMs).',
          'Reduced merchant chargeback processing overhead by 40% through automated webhook distribution pipelines.',
        ],
      },
    ],
    projects: [
      {
        name: 'IdempotencyKit — Atomic Exactly-Once Execution Library',
        description: 'Production-tested Go library providing atomic idempotency keys, lock lease management, and replay buffers over Redis and PostgreSQL.',
        techStack: ['Go', 'Redis', 'PostgreSQL', 'Docker'],
        url: 'github.com/liam-payments/idempotency-kit',
        highlights: [
          'Over 2,200 GitHub stars, utilized in production by multiple high-growth fintech startups.',
        ],
      },
    ],
    education: [
      {
        school: 'Trinity College Dublin',
        degree: 'Bachelor of Arts (B.A.) & Master of Science (M.Sc.)',
        field: 'Computer Science',
        graduationDate: '2016',
        honors: 'Gold Medal (First Class Honours, Ranked 1st in Class)',
      },
    ],
    certifications: [
      'PCI-DSS Internal Security Assessor (ISA)',
      'Certified Information Systems Security Professional (CISSP)',
    ],
  },

  // 11. Uber (Staff Real-Time Marketplace & Dispatch Engineer)
  {
    id: 'uber-realtime-marketplace-engineer',
    company: 'Uber',
    companyKey: 'uber',
    brandColor: '#000000',
    brandTextColor: '#FFFFFF',
    role: 'Staff Real-Time Marketplace & Dispatch Engineer',
    category: 'PROGRAMMING',
    badge: 'PRO',
    atsScore: 99,
    experienceLevel: 'Staff (L6) / 8+ YOE',
    candidate: {
      name: 'Tariq Al-Mansoor',
      title: 'Staff Real-Time Marketplace & Dispatch Engineer',
      location: 'San Francisco, CA',
      email: 'tariq.almansoor.uber@gmail.com',
      phone: '+1 (415) 555-0182',
      linkedin: 'linkedin.com/in/tariq-almansoor-uber',
      github: 'github.com/tariq-dispatch',
    },
    summary:
      'Staff Software Engineer with 8+ years architecting high-throughput distributed geospatial marketplaces, dynamic surge pricing algorithms, and real-time dispatch systems. Deep expertise in Uber H3 hexagonal spatial indexing, Apache Flink stateful streaming, Apache Cassandra/Docstore, and low-latency supply-demand matching handling 30M+ daily completed trips.',
    skills: [
      { category: 'Languages', skills: ['Go (Golang)', 'Java', 'Python', 'C++', 'SQL'] },
      { category: 'Geospatial & Marketplace', skills: ['Uber H3 Indexing', 'Dynamic Surge Pricing', 'Supply / Demand Matching', 'Routing & ETA Engines', 'Geofencing'] },
      { category: 'Distributed Streaming & Data', skills: ['Apache Flink', 'Apache Kafka', 'Cassandra', 'Docstore', 'Redis', 'gRPC'] },
      { category: 'Systems Architecture', skills: ['High-Concurrency Systems', 'Circuit Breaking', 'Backpressure Handling', 'Multi-DC Consistency'] },
    ],
    experience: [
      {
        company: 'Uber',
        title: 'Staff Software Engineer (L6) - Marketplace Dispatch & Pricing',
        location: 'San Francisco, CA',
        startDate: '2021-04',
        endDate: 'Present',
        current: true,
        bullets: [
          'Spearheaded the complete architectural redesign of Uber’s core dispatch engine using Uber H3 hierarchical hexagonal spatial indexing (resolution 8/9), cutting driver-rider matching latency from 450ms to 48ms across 30M+ daily trips.',
          'Architected and deployed multi-region Apache Flink streaming pipelines processing 3.5M events/second, computing sub-second geospatial supply/demand aggregates feeding real-time dynamic surge pricing models.',
          'Eliminated cascading system outages during major metropolitan surges (New Year’s Eve, World Cup) by designing adaptive backpressure sheds and circuit-breaking proxies in Go.',
          'Optimized driver location ingestion pipeline into Cassandra and Docstore, decreasing fleet telemetry write amplification by 38% and saving $2.1M in annualized cloud infrastructure costs.',
          'Mentored 7 senior engineers and led the technical strategy for unified multi-modal dispatch (UberX, Comfort, Uber Eats delivery courier pooling).',
        ],
      },
      {
        company: 'Lyft',
        title: 'Senior Software Engineer - Driver Core Platform',
        location: 'San Francisco, CA',
        startDate: '2017-08',
        endDate: '2021-03',
        bullets: [
          'Engineered real-time driver state machine tracking online/offline status, queue position, and dispatch eligibility using Go and Redis.',
          'Built driver destination filter matching algorithm, resulting in a 14% increase in driver retention during evening commute hours.',
        ],
      },
    ],
    projects: [
      {
        name: 'HexMatch — Low-Latency H3 Hexagonal Spatial Matching Engine',
        description: 'Open-source distributed supply-demand matching service leveraging Uber H3 indexing, k-ring lookups, and concurrent Go routines.',
        techStack: ['Go', 'Uber H3', 'Redis', 'gRPC'],
        url: 'github.com/tariq-dispatch/hexmatch',
        highlights: [
          'Benchmarked at 150,000 matches/sec with sub-5ms p99 response time on standard 8-core hardware.',
        ],
      },
    ],
    education: [
      {
        school: 'University of Texas at Austin',
        degree: 'Bachelor of Science (B.S.)',
        field: 'Computer Science',
        graduationDate: '2017',
        gpa: '3.90 / 4.0',
        honors: 'Turing Scholars Honors Program',
      },
    ],
    certifications: [
      'Confluent Certified Distributed Streaming Specialist (Flink & Kafka)',
    ],
  },

  // 12. Goldman Sachs (Lead Quantitative Developer)
  {
    id: 'goldman-sachs-quantitative-strategist',
    company: 'Goldman Sachs',
    companyKey: 'goldman',
    brandColor: '#7399C6',
    brandTextColor: '#FFFFFF',
    role: 'Lead Quantitative Developer (Electronic Trading)',
    category: 'FINANCE',
    badge: 'PRO',
    atsScore: 99,
    experienceLevel: 'Vice President / 8+ YOE',
    candidate: {
      name: 'Daniel Roth',
      title: 'Lead Quantitative Developer — Electronic Trading',
      location: 'New York, NY',
      email: 'daniel.roth.quant@gmail.com',
      phone: '+1 (212) 555-0133',
      linkedin: 'linkedin.com/in/daniel-roth-trading',
      github: 'github.com/droth-hft',
    },
    summary:
      'Lead Quantitative Developer (VP) with 8+ years architecting ultra-low latency algorithmic trading engines, kernel-bypass network feed handlers, and hardware-accelerated risk gateways for US Equities and FX options. Specialized in modern C++ (C++20), Solarflare OpenOnload, lock-free ring buffers, cache-conscious data layouts, and FPGA SmartNIC co-design achieving sub-850ns tick-to-trade latency.',
    skills: [
      { category: 'Languages', skills: ['Modern C++ (C++20/C++23)', 'Python', 'C', 'Bash', 'SystemVerilog / VHDL'] },
      { category: 'Low-Latency & Systems', skills: ['Kernel Bypass (Solarflare OpenOnload, DPDK)', 'Lock-Free Queues', 'Cache-Conscious Architecture', 'CPU Pinning & isolcpus', 'NUMA Optimization'] },
      { category: 'Trading Protocols & Exchanges', skills: ['NASDAQ ITCH/OUCH', 'CME MDP 3.0 / iLink3', 'BATS PITCH', 'FIX Protocol', 'Order Book Construction', 'Real-Time Pre-Trade Risk'] },
      { category: 'Profiling & Tooling', skills: ['Intel VTune', 'Linux perf', 'Solarflare ef_vi', 'Wireshark / Pcap', 'Valgrind'] },
    ],
    experience: [
      {
        company: 'Goldman Sachs',
        title: 'Lead Quantitative Developer (Vice President) - Electronic Trading Systems',
        location: 'New York, NY',
        startDate: '2021-02',
        endDate: 'Present',
        current: true,
        bullets: [
          'Architected and deployed an ultra-low latency NASDAQ ITCH market data feed handler in modern C++20 using Solarflare OpenOnload kernel-bypass networking, slashing parsing latency from 1.6μs to 420ns.',
          'Engineered a deterministic, lock-free limit order book engine with custom memory arenas and hugepages, maintaining p99.9 latency under 850ns under heavy market volatility spikes.',
          'Collaborated with FPGA engineering teams to offload pre-trade margin and risk constraint checks to SmartNICs, shaving 2.4μs off the critical tick-to-trade execution path.',
          'Mitigated CPU L1/L2 cache misses by refactoring memory layouts to enforce strict 64-byte cache line alignment and avoid false sharing across core-pinned worker threads.',
          'Developed backtesting and market replay framework in C++ and Python processing 15TB of raw exchange PCAP pcaps, reproducing production order fills with microsecond accuracy.',
        ],
      },
      {
        company: 'Two Sigma',
        title: 'Quantitative Software Engineer - High Frequency Execution',
        location: 'New York, NY',
        startDate: '2017-07',
        endDate: '2021-01',
        bullets: [
          'Engineered high-throughput CME futures feed handler processing 180,000 messages/second with zero packet drop.',
          'Implemented custom zero-copy binary message deserializers for FIX/FAST protocols, reducing parsing overhead by 55%.',
          'Automated daily exchange trade reconciliation pipelines, identifying trading desk routing slippage.',
        ],
      },
    ],
    projects: [
      {
        name: 'NanoITCH — Sub-Microsecond NASDAQ ITCH Parser',
        description: 'Single-header C++20 market data feed parser leveraging SIMD intrinsics, zero heap allocations, and zero-copy packet reading.',
        techStack: ['C++20', 'SIMD', 'Solarflare ef_vi', 'PCAP'],
        url: 'github.com/droth-hft/nano-itch',
        highlights: [
          'Processes synthetic ITCH 5.0 packets in 280 nanoseconds on standard Xeon CPU.',
        ],
      },
    ],
    education: [
      {
        school: 'Columbia University',
        degree: 'Bachelor of Science (B.S.)',
        field: 'Computer Engineering & Applied Mathematics',
        graduationDate: '2017',
        gpa: '3.95 / 4.0',
        honors: 'Summa Cum Laude, Tau Beta Pi',
      },
    ],
    certifications: [
      'FINRA Series 7 & Series 57 Licensed',
      'CFA Institute — Level I Passed',
    ],
  },

  // 13. OpenAI (Large Language Model Post-Training & Systems Researcher)
  {
    id: 'openai-systems-research-engineer',
    company: 'OpenAI',
    companyKey: 'openai',
    brandColor: '#10A37F',
    brandTextColor: '#FFFFFF',
    role: 'Large Language Model Post-Training & Systems Researcher',
    category: 'PROGRAMMING',
    badge: 'PRO',
    atsScore: 99,
    experienceLevel: 'Staff Researcher / 7+ YOE',
    candidate: {
      name: 'Dr. Maya Lin',
      title: 'Large Language Model Post-Training & Systems Researcher',
      location: 'San Francisco, CA',
      email: 'maya.lin.ai@gmail.com',
      phone: '+1 (415) 555-0199',
      linkedin: 'linkedin.com/in/dr-maya-lin-ai',
      github: 'github.com/mayalin-ai',
    },
    summary:
      'AI Research & Systems Engineer with 7+ years scaling distributed foundation model post-training, reinforcement learning from human feedback (RLHF), and GPU kernel optimization for frontier LLMs. Core developer of asynchronous PPO actor-critic architectures, custom OpenAI Triton attention kernels, and high-throughput vLLM serving runtimes operating across 16,384 H100 GPU clusters.',
    skills: [
      { category: 'Languages', skills: ['Python', 'CUDA C/C++', 'C++20', 'OpenAI Triton', 'PyTorch Internals'] },
      { category: 'Distributed Training & RL', skills: ['RLHF / PPO / DPO', 'Megatron-DeepSpeed', 'PyTorch FSDP', 'Ray Distributed', 'Slurm', 'NCCL Tuning'] },
      { category: 'Kernel & Inference Runtimes', skills: ['OpenAI Triton Kernels', 'FlashAttention', 'vLLM (PagedAttention)', 'TensorRT-LLM', 'Continuous Batching', 'FP8 Quantization'] },
      { category: 'Infrastructure & Tooling', skills: ['NVIDIA H100 / B200 Clusters', 'InfiniBand (HDR/NDR)', 'Nsight Systems', 'WandB', 'Docker / Kubernetes'] },
    ],
    experience: [
      {
        company: 'OpenAI',
        title: 'Member of Technical Staff (MTS) - Post-Training & Alignment Systems',
        location: 'San Francisco, CA',
        startDate: '2022-03',
        endDate: 'Present',
        current: true,
        bullets: [
          'Engineered distributed Reinforcement Learning from Human Feedback (RLHF) infrastructure across 16,384 H100 GPUs using Megatron-DeepSpeed and Ray, achieving 98.2% linear scaling efficiency for large-scale actor-critic gradient updates.',
          'Authored custom OpenAI Triton kernels for non-standard attention masks and fused reward model score projections, reducing memory round-trips to HBM3 and accelerating training throughput by 28%.',
          'Scaled production inference engine leveraging continuous batching and PagedAttention in vLLM, cutting Time-to-First-Token (TTFT) by 45% and doubling inference requests per second (RPS) per GPU node.',
          'Profiled inter-node InfiniBand communication bottlenecks using NVIDIA Nsight Systems, reorganizing NCCL collective AllGather operations to eliminate 14% GPU idle bubble times during pipeline-parallel pre-training.',
          'Co-authored 4 top-tier conference publications (NeurIPS, ICML) on scalable alignment, synthetic data generation, and reasoning model evaluation benchmarks.',
        ],
      },
      {
        company: 'Google DeepMind',
        title: 'Research Engineer - Large Scale Learning',
        location: 'Mountain View, CA',
        startDate: '2019-06',
        endDate: '2022-02',
        bullets: [
          'Developed distributed PyTorch and JAX training pipelines for multi-modal foundation models on TPU v3/v4 pods.',
          'Implemented automated gradient checkpointing and mixed-precision FP16/BF16 training stability guards, eliminating numerical overflow instabilities during billion-parameter model training runs.',
        ],
      },
    ],
    projects: [
      {
        name: 'TritonFusedAttention — Hardware-Accelerated Attention Kernel',
        description: 'Open-source OpenAI Triton kernel implementing fused linear bias, causal masking, and rotary embedding for next-generation LLM architectures.',
        techStack: ['Python', 'OpenAI Triton', 'PyTorch', 'CUDA'],
        url: 'github.com/mayalin-ai/triton-fused-attention',
        highlights: [
          'Used by 1,200+ AI researchers worldwide, demonstrating 1.25x speedup over PyTorch standard SDPA.',
        ],
      },
      {
        name: 'DistributedRLHF-Bench — Multi-GPU PPO Scaling Suite',
        description: 'Benchmarking harness evaluating communication overhead and gradient synchronization efficiency in large-scale RLHF pipelines.',
        techStack: ['Python', 'PyTorch FSDP', 'Ray', 'DeepSpeed'],
        url: 'github.com/mayalin-ai/rlhf-bench',
        highlights: [
          'Adopted as reference benchmark across several academic and industrial AI research labs.',
        ],
      },
    ],
    education: [
      {
        school: 'Stanford University',
        degree: 'Doctor of Philosophy (Ph.D.)',
        field: 'Computer Science (Artificial Intelligence & Systems)',
        graduationDate: '2019',
        honors: 'Stanford Graduate Fellowship (SGF), Best Paper Award at NeurIPS Workshop',
      },
      {
        school: 'Massachusetts Institute of Technology (MIT)',
        degree: 'Bachelor of Science (B.S.)',
        field: 'Computer Science & Mathematics',
        graduationDate: '2014',
        gpa: '4.9 / 5.0',
        honors: 'Phi Beta Kappa, Top Undergraduate Thesis',
      },
    ],
    certifications: [
      'NVIDIA Deep Learning Institute — Transformer Model Optimization',
    ],
  },

  // 14. Palantir (Lead Forward Deployed Software Engineer)
  {
    id: 'palantir-forward-deployed-engineer',
    company: 'Palantir',
    companyKey: 'palantir',
    brandColor: '#101113',
    brandTextColor: '#FFFFFF',
    role: 'Lead Forward Deployed Software Engineer (Foundry & Ontology)',
    category: 'PROGRAMMING',
    badge: 'PRO',
    atsScore: 98,
    experienceLevel: 'Lead (FDSE) / 7+ YOE',
    candidate: {
      name: 'Julian Vance',
      title: 'Lead Forward Deployed Software Engineer',
      location: 'Washington, D.C.',
      email: 'julian.vance.fdse@gmail.com',
      phone: '+1 (202) 555-0181',
      linkedin: 'linkedin.com/in/julian-vance-fdse',
      github: 'github.com/jvance-palantir',
    },
    summary:
      'Lead Forward Deployed Software Engineer with 7+ years integrating enterprise data meshes, Palantir Foundry Ontologies, and real-time operational decision applications for Defense and Fortune 50 clients. Expert in large-scale PySpark data pipelines, Foundry Workshop write-back action types, Ontology SDK (OSDK), and high-security government data governance (FedRAMP High / IL6).',
    skills: [
      { category: 'Platforms & Concepts', skills: ['Palantir Foundry', 'Palantir Gotham', 'Foundry Ontology (Object/Link/Action Types)', 'Foundry Workshop', 'Foundry AIP', 'OSDK (Ontology SDK)'] },
      { category: 'Data Engineering & Processing', skills: ['PySpark', 'Apache Spark', 'Python', 'SQL', 'Code Repositories', 'Pipeline Builder', 'Delta Lake'] },
      { category: 'Frontend & Integrations', skills: ['TypeScript', 'React', 'REST APIs', 'Data Governance (Markings, Restricted Views)', 'Git / CI/CD'] },
      { category: 'FDSE Capabilities', skills: ['Rapid Prototyping', 'Client-Facing Architecture', 'Mission Deployment', 'Executive Technical Presentations'] },
    ],
    experience: [
      {
        company: 'Palantir Technologies',
        title: 'Lead Forward Deployed Software Engineer (FDSE) - Defense & Critical Infrastructure',
        location: 'Washington, D.C.',
        startDate: '2021-06',
        endDate: 'Present',
        current: true,
        bullets: [
          'Led forward-deployed engineering engagements with federal defense and aerospace clients, architecting enterprise Foundry Ontologies unifying 180+ disconnected ERP, telemetry, and supply chain silos.',
          'Engineered scalable PySpark batch and streaming transformation pipelines in Foundry Code Repositories processing 60M+ daily records, feeding clean operational datasets into core Object and Link types.',
          'Developed mission-critical operational applications in Foundry Workshop utilizing TypeScript functions and write-back Action Types, enabling field commanders to execute resource reallocations directly from live dashboards.',
          'Optimized legacy Apache Spark shuffle partitions and memory configurations within Foundry, cutting pipeline runtimes by 58% and saving $850k in enterprise compute resource allocations.',
          'Configured complex security classification markings, cryptographic access controls, and restricted views compliant with DoD Impact Level 6 (IL6) and FedRAMP High security standards.',
          'Delivered end-to-end mission-ready production deployments within 30-day turnaround windows, receiving formal commendations from senior government program executives.',
        ],
      },
      {
        company: 'Booz Allen Hamilton',
        title: 'Senior Data Systems Consultant',
        location: 'McLean, VA',
        startDate: '2018-05',
        endDate: '2021-05',
        bullets: [
          'Engineered ETL pipelines in Python and SQL for Department of Defense logistics modernization initiatives.',
          'Built interactive data visualization dashboards in React and D3.js, tracking equipment readiness metrics across 40 military bases.',
        ],
      },
    ],
    projects: [
      {
        name: 'Foundry-OSDK-Mesh — Semantic Ontology Integration Gateway',
        description: 'Demonstration harness showcasing how to connect external React applications to Palantir Foundry via the Ontology SDK (OSDK) with typed action workflows.',
        techStack: ['TypeScript', 'Foundry OSDK', 'React', 'Node.js'],
        url: 'github.com/jvance-palantir/osdk-mesh-sample',
        highlights: [
          'Demonstrates sub-100ms bidirectional synchronization between enterprise web apps and Palantir Object Types.',
        ],
      },
    ],
    education: [
      {
        school: 'Johns Hopkins University',
        degree: 'Master of Science (M.S.)',
        field: 'Systems Engineering',
        graduationDate: '2018',
        gpa: '3.91 / 4.0',
      },
      {
        school: 'University of Virginia',
        degree: 'Bachelor of Science (B.S.)',
        field: 'Computer Science',
        graduationDate: '2016',
        honors: 'Distinguished Major Program',
      },
    ],
    certifications: [
      'Palantir Certified Foundry Platform Developer',
      'AWS Certified Big Data — Specialty',
      'DoD Top Secret / SCI Security Clearance',
    ],
  },

  // 15. Databricks (Staff Lakehouse & Query Engine Architect)
  {
    id: 'databricks-lakehouse-engine-architect',
    company: 'Databricks',
    companyKey: 'databricks',
    brandColor: '#FF3621',
    brandTextColor: '#FFFFFF',
    role: 'Staff Lakehouse & Query Engine Architect (Photon & Delta Lake)',
    category: 'PROGRAMMING',
    badge: 'PRO',
    atsScore: 99,
    experienceLevel: 'Staff / 8+ YOE',
    candidate: {
      name: 'Rachel Zimmerman',
      title: 'Staff Lakehouse & Query Engine Architect',
      location: 'San Francisco, CA',
      email: 'rachel.zimmerman.db@gmail.com',
      phone: '+1 (415) 555-0173',
      linkedin: 'linkedin.com/in/rachel-zimmerman-db',
      github: 'github.com/rzimmerman-data',
    },
    summary:
      'Staff Software Engineer with 8+ years architecting distributed database kernels, vectorized execution engines, and open table formats at petabyte scale. Core contributor to Databricks Photon vectorized C++ engine, Delta Lake 3.0 transaction log protocols, Apache Spark Tungsten memory management, and Liquid Clustering algorithms accelerating analytical queries by up to 5x.',
    skills: [
      { category: 'Languages', skills: ['C++20', 'Scala', 'Java', 'Python', 'SQL (ANSI & Spark SQL)', 'Rust'] },
      { category: 'Query Engines & Runtimes', skills: ['Databricks Photon Engine', 'Vectorized Execution', 'SIMD Intrinsics (AVX-512)', 'Apache Spark (Catalyst & Tungsten)', 'Apache Arrow'] },
      { category: 'Storage Formats & Lakehouse', skills: ['Delta Lake 3.0', 'Liquid Clustering / Z-Ordering', 'Deletion Vectors', 'Unity Catalog', 'Parquet', 'ACID Transaction Logs'] },
      { category: 'Cloud & Distributed Systems', skills: ['AWS S3', 'Azure ADLS Gen2', 'Kubernetes', 'RocksDB', 'Distributed Query Optimization'] },
    ],
    experience: [
      {
        company: 'Databricks',
        title: 'Staff Software Engineer - Photon Engine & Delta Lake Core',
        location: 'San Francisco, CA',
        startDate: '2021-05',
        endDate: 'Present',
        current: true,
        bullets: [
          'Architected and implemented vectorized hash join and aggregation operators in C++ for the Photon query engine, utilizing AVX-512 SIMD intrinsics to accelerate compute-heavy TPC-DS benchmarks by 4.2x.',
          'Co-developed Delta Lake Liquid Clustering algorithms in Scala and C++, eliminating rigid multi-column partitioning hierarchies and reducing write amplification by 48% on 500TB+ production tables.',
          'Engineered Delta Lake Deletion Vector read/write path integration, converting costly file rewrites during UPDATE and DELETE operations into lightweight inline bitmasks.',
          'Optimized Apache Spark Catalyst optimizer rule pushdowns for Unity Catalog fine-grained row/column masking, reducing security check planning overhead from 250ms to 8ms.',
          'Diagnosed low-level JVM-to-C++ JNI memory transfer bottlenecks, cutting inter-runtime data serialization costs by 35%.',
          'Authored Databricks engineering blog posts and research papers presented at ACM SIGMOD and VLDB.',
        ],
      },
      {
        company: 'Snowflake',
        title: 'Senior Database Systems Software Engineer',
        location: 'San Mateo, CA',
        startDate: '2017-08',
        endDate: '2021-04',
        bullets: [
          'Engineered columnar micro-partition pruning algorithms for Snowflake virtual warehouse clusters in C++.',
          'Optimized remote object store (S3/GCS) prefetching cache daemons, cutting median cold-query wait times by 40%.',
        ],
      },
    ],
    projects: [
      {
        name: 'VectorizedParquet — SIMD-Accelerated Parquet Reader in C++',
        description: 'Micro-library demonstrating vectorized dictionary decoding and bit-unpacking using AVX-512 instructions for fast columnar ingestion.',
        techStack: ['C++20', 'AVX-512', 'Parquet', 'CMake'],
        url: 'github.com/rzimmerman-data/vector-parquet',
        highlights: [
          'Decodes 100M integer records/second on single CPU core with zero allocations.',
        ],
      },
    ],
    education: [
      {
        school: 'University of California, Berkeley',
        degree: 'Master of Science (M.S.)',
        field: 'Computer Science (AMPLab / RISELab)',
        graduationDate: '2017',
        gpa: '3.94 / 4.0',
        honors: 'Graduate Fellow in Data-Intensive Systems',
      },
      {
        school: 'University of Michigan',
        degree: 'Bachelor of Science (B.S.)',
        field: 'Computer Science',
        graduationDate: '2015',
        gpa: '3.91 / 4.0',
        honors: 'Summa Cum Laude',
      },
    ],
    certifications: [
      'Databricks Certified Apache Spark Developer & Lakehouse Architect',
    ],
  },

  // 16. Figma (Senior Graphics & Collaborative Canvas Systems Architect)
  {
    id: 'figma-graphics-canvas-architect',
    company: 'Figma',
    companyKey: 'figma',
    brandColor: '#F24E1E',
    brandTextColor: '#FFFFFF',
    role: 'Senior Graphics & Collaborative Canvas Systems Architect',
    category: 'DESIGN',
    badge: 'PRO',
    atsScore: 99,
    experienceLevel: 'Senior / 7+ YOE',
    candidate: {
      name: 'Nathan Brooks',
      title: 'Senior Graphics & Collaborative Canvas Systems Architect',
      location: 'San Francisco, CA',
      email: 'nathan.brooks.graphics@gmail.com',
      phone: '+1 (415) 555-0168',
      linkedin: 'linkedin.com/in/nathan-brooks-canvas',
      github: 'github.com/nbrooks-graphics',
    },
    summary:
      'Senior Graphics & Client Systems Engineer with 7+ years building high-performance browser rendering engines, WebGL/WebAssembly graphics pipelines, and real-time multiplayer document synchronization. Core contributor to 60 FPS vector canvas rendering, custom GLSL shaders, conflict-free replicated data types (CRDTs), and memory-efficient SceneGraph trees supporting 100+ concurrent editors.',
    skills: [
      { category: 'Languages & Runtimes', skills: ['C++20', 'WebAssembly (Wasm)', 'TypeScript', 'GLSL / WGSL', 'Rust', 'JavaScript'] },
      { category: 'Graphics & Rendering', skills: ['WebGL 2.0', 'WebGPU', 'HTML5 Canvas', 'SceneGraph Architecture', '2D Vector Graphics (Bézier Curves)', 'GPU Memory Management'] },
      { category: 'Real-Time Systems & Sync', skills: ['CRDTs (Conflict-Free Replicated Data Types)', 'Operational Transformation (OT)', 'WebSockets', 'Binary Protocol Buffers', 'State Reconciliation'] },
      { category: 'Performance & Tooling', skills: ['Chrome DevTools Performance Profiling', 'WebAssembly Memory Allocators', 'SIMD in Wasm', 'Jest / Playwright'] },
    ],
    experience: [
      {
        company: 'Figma',
        title: 'Senior Systems & Graphics Engineer - Core Canvas Engine',
        location: 'San Francisco, CA',
        startDate: '2021-04',
        endDate: 'Present',
        current: true,
        bullets: [
          'Re-architected the WebGL/WebAssembly 2D vector rendering engine in C++ and compiled via Emscripten, maintaining flawless 60 FPS panning and zooming across complex design files with 120,000+ vector paths.',
          'Designed custom GLSL anti-aliased Bézier curve evaluation shaders offloading vector path tessellation to GPU vertex pipelines, reducing CPU frame rendering time by 48%.',
          'Engineered a decentralized real-time multiplayer synchronization engine using state-based CRDTs, seamlessly resolving concurrent layout edits for 100+ simultaneous collaborators with sub-25ms state propagation.',
          'Optimized WebAssembly linear memory layout with a custom bump-allocator, slashing garbage collection pauses and eliminating client-side memory fragmentation crashes.',
          'Built high-fidelity font rasterization and dynamic glyph atlas caching pipeline, reducing text rendering latency for complex multilingual typography by 60%.',
        ],
      },
      {
        company: 'Unity Technologies',
        title: 'Graphics Software Engineer - WebGL Runtime',
        location: 'San Francisco, CA',
        startDate: '2018-05',
        endDate: '2021-03',
        bullets: [
          'Optimized Unity WebGL exporter pipeline, reducing initial wasm bundle sizes by 34% through dead-code stripping and Link-Time Optimization (LTO).',
          'Implemented shader translation modules mapping HLSL to GLSL for browser execution with zero visual regressions.',
        ],
      },
    ],
    projects: [
      {
        name: 'WasmCanvas — High-Performance 2D Vector Engine in WebAssembly',
        description: 'Experimental browser vector graphics engine written in C++ and compiled to WebAssembly, featuring GPU batching and custom anti-aliasing.',
        techStack: ['C++', 'WebAssembly', 'WebGL', 'GLSL', 'TypeScript'],
        url: 'github.com/nbrooks-graphics/wasm-canvas',
        highlights: [
          'Renders 50,000 animated circles and Bézier paths at steady 60 FPS in Chrome and Safari.',
        ],
      },
      {
        name: 'CRDT-SceneTree — Real-Time Collaborative Document Tree',
        description: 'Hierarchical conflict-free replicated tree structure in Rust/Wasm supporting atomic reparenting, property updates, and offline sync.',
        techStack: ['Rust', 'WebAssembly', 'CRDTs', 'TypeScript'],
        url: 'github.com/nbrooks-graphics/crdt-scenetree',
        highlights: [
          'Formally verified convergence properties under network split-brain simulations.',
        ],
      },
    ],
    education: [
      {
        school: 'University of Waterloo',
        degree: 'Bachelor of Computer Science (B.C.S.)',
        field: 'Computer Science & Computer Graphics',
        graduationDate: '2018',
        gpa: '3.92 / 4.0',
        honors: 'With Distinction, Undergraduate Research Fellowship in Computational Geometry',
      },
    ],
    certifications: [
      'Khronos Group OpenGL & Vulkan Certified Specialist',
    ],
  },

  // 17. Citadel (Ultra Low-Latency Market Making C++ Software Engineer)
  {
    id: 'citadel-low-latency-cpp-engineer',
    company: 'Citadel',
    companyKey: 'citadel',
    brandColor: '#002B49',
    brandTextColor: '#FFFFFF',
    role: 'Ultra Low-Latency Market Making C++ Software Engineer',
    category: 'FINANCE',
    badge: 'PRO',
    atsScore: 99,
    experienceLevel: 'Senior / 7+ YOE',
    candidate: {
      name: 'James Callahan',
      title: 'Ultra Low-Latency Market Making C++ Software Engineer',
      location: 'Chicago, IL',
      email: 'james.callahan.hft@gmail.com',
      phone: '+1 (312) 555-0149',
      linkedin: 'linkedin.com/in/james-callahan-hft',
      github: 'github.com/jcallahan-hft',
    },
    summary:
      'Ultra Low-Latency C++ Software Engineer with 7+ years developing market-making infrastructure, high-frequency execution algorithms, and kernel-bypass network feed handlers for tier-1 trading desks. Deep expertise in C++20, DPDK / Solarflare OpenOnload, hardware timestamping, lock-free ring buffers, cache-hierarchy optimization, and FPGA SmartNIC co-design achieving sub-240ns market feed parsing.',
    skills: [
      { category: 'Languages', skills: ['Modern C++ (C++20/C++23)', 'C', 'Python', 'x86-64 Assembly', 'SystemVerilog'] },
      { category: 'Low-Latency & Kernel Bypass', skills: ['Solarflare OpenOnload', 'DPDK', 'ef_vi', 'Linux isolcpus & CPU Pinning', 'Hugepages', 'Lock-Free Data Structures'] },
      { category: 'HFT Domain & Protocols', skills: ['Market Making', 'NASDAQ ITCH', 'CME MDP 3.0', 'Cboe PITCH', 'OUCH / FIX Gateway', 'Tick-to-Trade Optimization'] },
      { category: 'Hardware & Profiling', skills: ['Intel VTune Profiler', 'perf', 'Hardware Timestamping (PTP/IEEE 1588)', 'PCIe Gen5 DMA', 'SIMD Intrinsics (AVX-512)'] },
    ],
    experience: [
      {
        company: 'Citadel Securities',
        title: 'Senior Low-Latency Software Engineer - Global Equities & Options',
        location: 'Chicago, IL',
        startDate: '2021-03',
        endDate: 'Present',
        current: true,
        bullets: [
          'Architected and implemented a sub-240ns NASDAQ ITCH and Cboe market data feed handler in C++20 utilizing Solarflare ef_vi kernel-bypass networking and zero-copy packet descriptors.',
          'Eliminated OS jitter and latency tail spikes (p99.99) by configuring custom Linux kernel boot parameters (isolcpus, nohz_full, rcu_nocbs) and pinning worker threads to dedicated NUMA socket cores.',
          'Partnered with FPGA quantitative hardware teams to design a hybrid SmartNIC filtering path, offloading book snapshot aggregation and sub-microsecond risk checks to FPGA registers.',
          'Mitigated CPU L1/L2 cache misses by refactoring limit order book state trees into contiguous cache-aligned flat arrays, accelerating quote update throughput by 2.4x.',
          'Engineered a deterministic PCAP network replay testbed reproducing extreme volatility market conditions (e.g., FOMC rate decisions) with cycle-accurate precision.',
        ],
      },
      {
        company: 'Jump Trading',
        title: 'Low-Latency Systems Software Engineer',
        location: 'Chicago, IL',
        startDate: '2018-06',
        endDate: '2021-02',
        bullets: [
          'Authored high-throughput futures order execution gateways in modern C++ connecting directly to CME Aurora datacenter matching engines.',
          'Engineered custom memory pools and lock-free SPSC ring buffers, reducing median order submission latency from 1.2μs to 480ns.',
          'Profiled branch mispredictions using Intel VTune, refactoring critical hot paths using `[[likely]]` / `[[unlikely]]` attributes and branchless bitwise arithmetic.',
        ],
      },
    ],
    projects: [
      {
        name: 'NanoRing — Lock-Free Inter-Thread Ring Buffer in C++20',
        description: 'Single-producer single-consumer circular queue guaranteeing zero heap allocations, zero system calls, and full cache-line separation.',
        techStack: ['C++20', 'x86-64 Assembly', 'Google Benchmark'],
        url: 'github.com/jcallahan-hft/nano-ring',
        highlights: [
          'Sustains 45M messages/sec with median latency under 22 nanoseconds.',
        ],
      },
    ],
    education: [
      {
        school: 'Princeton University',
        degree: 'Bachelor of Science in Engineering (B.S.E.)',
        field: 'Electrical & Computer Engineering',
        graduationDate: '2018',
        gpa: '3.94 / 4.0',
        honors: 'Summa Cum Laude, Shapiro Prize for Academic Excellence',
      },
    ],
    certifications: [
      'FINRA Series 57 — Proprietary Trader Licensed',
    ],
  },

  // 18. ByteDance / TikTok (Lead Recommendation Systems Engineer)
  {
    id: 'bytedance-recommendation-engineer',
    company: 'ByteDance / TikTok',
    companyKey: 'bytedance',
    brandColor: '#FE2C55',
    brandTextColor: '#FFFFFF',
    role: 'Lead Recommendation Systems Engineer (TikTok Monolith)',
    category: 'PROGRAMMING',
    badge: 'PRO',
    atsScore: 99,
    experienceLevel: 'Lead / 8+ YOE',
    candidate: {
      name: 'Wei Zhang',
      title: 'Lead Recommendation Systems Engineer',
      location: 'San Jose, CA',
      email: 'wei.zhang.recsys@gmail.com',
      phone: '+1 (408) 555-0196',
      linkedin: 'linkedin.com/in/wei-zhang-recsys',
      github: 'github.com/wzhang-recsys',
    },
    summary:
      'Lead Machine Learning & Systems Engineer with 8+ years architecting terabyte-scale real-time recommendation engines, online parameter servers, and sparse embedding models for TikTok "For You" Feed. Deep expertise in Monolith recommendation architecture, high-throughput GPU inference (100M+ QPS), PyTorch distributed training, and low-latency feature stores.',
    skills: [
      { category: 'Languages', skills: ['C++20', 'Python', 'CUDA C/C++', 'Go', 'SQL'] },
      { category: 'Recommendation & ML Systems', skills: ['Monolith Architecture', 'Sparse Embedding Tables', 'Online Parameter Servers', 'DeepFM / DLRM', 'Multi-Task Learning (MMoE)', 'Two-Tower Retrieval'] },
      { category: 'Distributed Infra & Storage', skills: ['PyTorch Distributed', 'TensorRT', 'Apache Flink', 'RocksDB', 'Redis Cluster', 'Kafka'] },
      { category: 'Systems Performance', skills: ['Sub-20ms SLA', 'High QPS (100M+)', 'GPU Memory Swapping', 'Distributed Cache Optimization'] },
    ],
    experience: [
      {
        company: 'ByteDance / TikTok',
        title: 'Lead Recommendation Systems Engineer - Core Feed Algorithm Infra',
        location: 'San Jose, CA',
        startDate: '2021-06',
        endDate: 'Present',
        current: true,
        bullets: [
          'Architected and scaled the real-time online parameter server and sparse embedding lookup engine for TikTok "For You" feed, handling 120M+ QPS with sub-18ms p99 inference latency.',
          'Engineered dynamic memory eviction and SSD-to-GPU embedding cache tiers in C++, accommodating 10-terabyte user-video interaction embedding tables without increasing GPU memory footprints.',
          'Developed real-time online training loops on Apache Flink and PyTorch, streaming live user engagements (likes, watch time, shares) to update model parameters within 5 seconds of user action.',
          'Optimized Multi-gate Mixture-of-Experts (MMoE) ranking networks using TensorRT and custom CUDA kernels, reducing inference compute cost by 32% across 25,000 GPU inference nodes.',
          'Implemented adaptive fallback scoring heuristics that preserved smooth video playback recommendations during regional network connectivity disruptions.',
        ],
      },
      {
        company: 'Baidu',
        title: 'Senior Machine Learning Systems Engineer - Search Ads',
        location: 'Beijing, China / Sunnyvale, CA',
        startDate: '2017-07',
        endDate: '2021-05',
        bullets: [
          'Engineered distributed click-through rate (CTR) prediction models in C++ and Python handling billions of daily ad impressions.',
          'Optimized sparse parameter synchronization across distributed CPU/GPU cluster nodes, cutting training epoch time by 40%.',
        ],
      },
    ],
    projects: [
      {
        name: 'SparseLookup — GPU-Accelerated Embedding Table Server',
        description: 'High-performance C++ and CUDA server optimizing sparse ID lookups with asynchronous GPU memory transfers and multi-tiered caching.',
        techStack: ['C++20', 'CUDA', 'gRPC', 'RocksDB'],
        url: 'github.com/wzhang-recsys/sparse-lookup',
        highlights: [
          'Processes 8M sparse embedding queries/second per GPU with sub-2ms latency.',
        ],
      },
    ],
    education: [
      {
        school: 'Tsinghua University',
        degree: 'Master of Science (M.S.)',
        field: 'Computer Science (Artificial Intelligence)',
        graduationDate: '2017',
        honors: 'National Graduate Fellowship, Top 1% of Class',
      },
      {
        school: 'Tsinghua University',
        degree: 'Bachelor of Science (B.S.)',
        field: 'Computer Science',
        graduationDate: '2015',
      },
    ],
    certifications: [
      'NVIDIA Certified Associate — High-Performance Computing',
    ],
  },

  // 19. Snowflake (Senior Database Kernel Engineer)
  {
    id: 'snowflake-database-kernel-engineer',
    company: 'Snowflake',
    companyKey: 'snowflake',
    brandColor: '#29B5E8',
    brandTextColor: '#FFFFFF',
    role: 'Senior Database Kernel Engineer (Virtual Warehouse Engine)',
    category: 'PROGRAMMING',
    badge: 'PRO',
    atsScore: 98,
    experienceLevel: 'Senior / 7+ YOE',
    candidate: {
      name: 'Emily Watson',
      title: 'Senior Database Kernel Engineer',
      location: 'San Mateo, CA',
      email: 'emily.watson.db@gmail.com',
      phone: '+1 (650) 555-0138',
      linkedin: 'linkedin.com/in/emily-watson-db',
      github: 'github.com/ewatson-db',
    },
    summary:
      'Senior Database Systems Engineer with 7+ years developing distributed query compilation, vectorized execution runtimes, and cloud-native columnar storage engines. Specialized in Snowflake Virtual Warehouse query optimization, micro-partition pruning heuristics, SIMD-accelerated expression evaluation, and metadata cache layers over AWS S3 and Azure Blob Storage.',
    skills: [
      { category: 'Languages', skills: ['C++20', 'Rust', 'Java', 'Python', 'SQL (ANSI)'] },
      { category: 'Database Systems & Kernels', skills: ['Vectorized Execution', 'Micro-Partition Pruning', 'Columnar Storage', 'Cost-Based Query Optimization (CBO)', 'SIMD (AVX-512)'] },
      { category: 'Distributed Storage & Cloud', skills: ['AWS S3', 'Azure Blob Storage', 'Distributed Cache Coherency', 'Linux Kernel I/O (io_uring)', 'gRPC'] },
      { category: 'Diagnostics & Tooling', skills: ['perf', 'Valgrind', 'Google Benchmark', 'GDB', 'Git'] },
    ],
    experience: [
      {
        company: 'Snowflake',
        title: 'Senior Database Kernel Engineer - Virtual Warehouse Query Execution',
        location: 'San Mateo, CA',
        startDate: '2021-04',
        endDate: 'Present',
        current: true,
        bullets: [
          'Engineered vectorized execution kernels in C++ for analytic window functions and multi-column join operators, accelerating complex analytical customer queries by 3.8x.',
          'Optimized micro-partition metadata pruning algorithms within the Cloud Services coordination layer, eliminating 64% of unnecessary remote S3 partition scans for high-cardinality time-series queries.',
          'Designed an asynchronous remote blob prefetching engine using Linux io_uring, masking S3 GET object latency and improving warehouse SSD cache hit ratios to 92%.',
          'Authored SIMD-accelerated string search and regex matching primitives using AVX-512 instructions, cutting scan phase CPU overhead by 27%.',
          'Diagnosed complex multi-tenant warehouse resource contention, authoring automated adaptive memory spilling routines to avoid out-of-memory worker crashes.',
        ],
      },
      {
        company: 'Teradata',
        title: 'Database Systems Software Engineer',
        location: 'San Diego, CA',
        startDate: '2017-06',
        endDate: '2021-03',
        bullets: [
          'Developed cost-based query optimizer cardinality estimation routines in C++ for relational database tables exceeding 100 billion rows.',
          'Profiled disk I/O bottlenecks across multi-node parallel database systems, improving parallel hash join throughput by 35%.',
        ],
      },
    ],
    projects: [
      {
        name: 'MicroPrune — Vectorized Partition Pruning Simulator',
        description: 'Standalone C++ simulator modeling min/max column metadata pruning efficiency across various data clustering distributions.',
        techStack: ['C++20', 'SIMD', 'CMake'],
        url: 'github.com/ewatson-db/microprune-sim',
        highlights: [
          'Evaluates millions of simulated partition headers in under 15ms.',
        ],
      },
    ],
    education: [
      {
        school: 'University of Wisconsin-Madison',
        degree: 'Master of Science (M.S.)',
        field: 'Computer Science (Database Systems)',
        graduationDate: '2017',
        gpa: '3.92 / 4.0',
        honors: 'Wisconsin Database Group Research Assistant',
      },
      {
        school: 'University of Illinois Urbana-Champaign',
        degree: 'Bachelor of Science (B.S.)',
        field: 'Computer Science',
        graduationDate: '2015',
        honors: 'High Honors',
      },
    ],
    certifications: [
      'SnowPro Core Certified',
      'SnowPro Advanced: Data Engineer',
    ],
  },

  // 20. Airbnb (Senior Design Technologist & UI Systems Engineer)
  {
    id: 'airbnb-design-technologist',
    company: 'Airbnb',
    companyKey: 'airbnb',
    brandColor: '#FF5A5F',
    brandTextColor: '#FFFFFF',
    role: 'Senior Design Technologist & UI Systems Engineer',
    category: 'DESIGN',
    badge: 'PRO',
    atsScore: 98,
    experienceLevel: 'Senior / 7+ YOE',
    candidate: {
      name: 'Chloe Dupont',
      title: 'Senior Design Technologist & UI Systems Engineer',
      location: 'San Francisco, CA',
      email: 'chloe.dupont.design@gmail.com',
      phone: '+1 (415) 555-0129',
      linkedin: 'linkedin.com/in/chloedupont-design',
      portfolio: 'chloedupont.design',
    },
    summary:
      'Senior Design Technologist and UI Systems Engineer with 7+ years bridging design systems, accessibility engineering, and client-side performance. Specialized in multi-platform token architectures (Figma Variables to Web, iOS, and Android), WCAG 2.1 AAA accessible component primitives, and fluid 60 FPS motion design across 80+ product teams at Airbnb.',
    skills: [
      { category: 'Frontend & UI Engineering', skills: ['React', 'TypeScript', 'Next.js', 'React Native', 'Tailwind CSS', 'CSS Modules / Sass', 'HTML5 / Web Components'] },
      { category: 'Design Systems & Tooling', skills: ['Figma Variables & Tokens', 'Design Token Automation (Style Dictionary)', 'Storybook', 'Radix UI Primitives', 'Framer Motion', 'Lottie'] },
      { category: 'Accessibility & Quality', skills: ['WCAG 2.1 AAA Compliance', 'Screen Reader Auditing (VoiceOver, NVDA)', 'Axe-core Testing', 'Visual Regression (Chromatic)'] },
    ],
    experience: [
      {
        company: 'Airbnb',
        title: 'Senior Design Technologist - Design Systems & Web Core',
        location: 'San Francisco, CA',
        startDate: '2021-03',
        endDate: 'Present',
        current: true,
        bullets: [
          'Engineered automated design token synchronization pipeline connecting Figma Variables directly to React, Swift, and Jetpack Compose repositories via Style Dictionary and GitHub Actions, eliminating 80 hours of manual token updates per quarter.',
          'Built accessible, responsive component primitives (modals, date range pickers, comboboxes) adopted across 100% of Airbnb guest booking flows, achieving full WCAG 2.1 AAA compliance.',
          'Optimized client-side rendering performance and layout thrashing across listing search pages, elevating Google Core Web Vitals (INP < 120ms, CLS = 0) for 100M+ monthly visitors.',
          'Designed fluid 60 FPS gesture-driven motion prototypes in React and Framer Motion, validating checkout flow iterations that boosted booking completion by 2.4%.',
          'Authored comprehensive component documentation, accessibility runbooks, and interactive Storybook showcases utilized by 450+ cross-functional engineers and designers.',
        ],
      },
      {
        company: 'Pinterest',
        title: 'UI Software Engineer - Gestalt Design System',
        location: 'San Francisco, CA',
        startDate: '2017-08',
        endDate: '2021-02',
        bullets: [
          'Developed reusable React component library used by 300+ frontend engineers, standardizing button, typography, and card patterns.',
          'Implemented automated visual regression testing with Chromatic, reducing unintended UI breaking changes by 65%.',
        ],
      },
    ],
    projects: [
      {
        name: 'TokenSync — Real-Time Figma to Code Token Pipeline',
        description: 'Open-source GitHub Action and CLI automating design token export from Figma REST API into TypeScript, CSS Variables, and iOS/Android themes.',
        techStack: ['TypeScript', 'Node.js', 'Figma API', 'Style Dictionary'],
        url: 'github.com/chloedupont/token-sync',
        highlights: [
          'Adopted by 40+ engineering organizations with over 1,100 GitHub stars.',
        ],
      },
    ],
    education: [
      {
        school: 'Rhode Island School of Design (RISD)',
        degree: 'Bachelor of Fine Arts (B.F.A.)',
        field: 'Graphic Design & Digital Media',
        graduationDate: '2017',
        honors: 'Honors Graduate',
      },
      {
        school: 'Brown University',
        degree: 'Concurrent Studies',
        field: 'Computer Science (Human-Computer Interaction)',
        graduationDate: '2017',
      },
    ],
    certifications: [
      'Certified Professional in Accessibility Core Competencies (CPACC)',
      'Interaction Design Association (IxDA) Member',
    ],
  },

  // 21. Spotify (Senior Audio ML & Recommendations Engineer)
  {
    id: 'spotify-ml-recommendations-engineer',
    company: 'Spotify',
    companyKey: 'spotify',
    brandColor: '#1ED760',
    brandTextColor: '#000000',
    role: 'Senior Audio Machine Learning & Recommendations Engineer',
    category: 'PROGRAMMING',
    badge: 'PRO',
    atsScore: 98,
    experienceLevel: 'Senior / 7+ YOE',
    candidate: {
      name: 'Johan Bergström',
      title: 'Senior Audio ML & Recommendations Engineer',
      location: 'Stockholm, Sweden / New York, NY',
      email: 'johan.bergstrom.ml@gmail.com',
      phone: '+46 8 555 0192',
      linkedin: 'linkedin.com/in/johan-bergstrom-spotify',
      github: 'github.com/jbergstrom-audio',
    },
    summary:
      'Senior Machine Learning Engineer with 7+ years designing high-throughput vector embedding search, session-based recommendation models, and audio discovery algorithms serving 600M+ music and podcast listeners at Spotify. Deep expertise in Annoy/ScaNN approximate nearest neighbor indexing, multi-armed bandits, collaborative filtering, and PyTorch inference at scale.',
    skills: [
      { category: 'Machine Learning & Audio', skills: ['Audio Feature Extraction', 'Two-Tower Retrieval', 'Approximate Nearest Neighbors (Annoy / ScaNN)', 'Collaborative Filtering', 'Multi-Armed Bandits', 'Session-Based Recs'] },
      { category: 'Languages & Tools', skills: ['Python', 'C++20', 'Java', 'PyTorch', 'TensorFlow', 'SQL', 'Hugging Face'] },
      { category: 'Data & Production Infrastructure', skills: ['Apache Spark', 'Kafka', 'GCP (BigQuery, Dataflow)', 'Docker', 'Kubernetes', 'Ray'] },
    ],
    experience: [
      {
        company: 'Spotify',
        title: 'Senior Machine Learning Engineer - Personalization & Audio Discovery',
        location: 'Stockholm, Sweden',
        startDate: '2021-02',
        endDate: 'Present',
        current: true,
        bullets: [
          'Architected and deployed candidate retrieval pipelines for "Discover Weekly" and "Daily Mix" utilizing Annoy approximate nearest neighbor search over 120M track embeddings, keeping p95 latency under 22ms.',
          'Developed session-based context models using Transformer architectures in PyTorch, adapting recommendations to user acoustic preferences within 3 song skips and lifting listen duration by 3.8%.',
          'Engineered reinforcement learning multi-armed bandit algorithms to balance music exploitation vs novel artist exploration, generating a 12% increase in new artist catalog discovery.',
          'Optimized feature extraction pipelines on Google Cloud Dataflow, processing 40TB of daily user listening events with 99.98% pipeline uptime.',
          'Mentored junior ML engineers on offline evaluation methodologies, counterfactual policy evaluation, and A/B test design.',
        ],
      },
      {
        company: 'SoundCloud',
        title: 'Machine Learning Engineer - Search & Discovery',
        location: 'Berlin, Germany',
        startDate: '2017-09',
        endDate: '2021-01',
        bullets: [
          'Built neural audio fingerprinting and music similarity models using convolutional networks (CNNs) in PyTorch.',
          'Designed real-time playlist continuation API serving 5,000 requests/second with sub-50ms latency.',
        ],
      },
    ],
    projects: [
      {
        name: 'AudioEmbed — High-Speed Vector Retrieval Engine for Acoustic Signals',
        description: 'Lightweight C++ and Python library for generating and querying Mel-spectrogram embedding vectors at scale.',
        techStack: ['C++', 'Python', 'PyTorch', 'Annoy'],
        url: 'github.com/jbergstrom-audio/audio-embed',
        highlights: [
          'Evaluates 10M audio vectors in 12ms with 98.6% recall accuracy.',
        ],
      },
    ],
    education: [
      {
        school: 'KTH Royal Institute of Technology',
        degree: 'Master of Science (M.S.)',
        field: 'Machine Learning & Media Technology',
        graduationDate: '2017',
        honors: 'Dean’s Honor List',
      },
      {
        school: 'Uppsala University',
        degree: 'Bachelor of Science (B.S.)',
        field: 'Computer Science',
        graduationDate: '2015',
      },
    ],
    certifications: [
      'Google Cloud Certified Professional Machine Learning Engineer',
    ],
  },

  // 22. Deloitte (Senior Business & Strategy Consultant)
  {
    id: 'deloitte-senior-business-analyst',
    company: 'Deloitte',
    companyKey: 'deloitte',
    brandColor: '#86BC25',
    brandTextColor: '#FFFFFF',
    role: 'Senior Strategy & Business Analytics Consultant',
    category: 'BUSINESS',
    badge: 'PRO',
    atsScore: 97,
    experienceLevel: 'Senior Consultant / 6+ YOE',
    candidate: {
      name: 'Melissa Adams',
      title: 'Senior Strategy & Business Analytics Consultant',
      location: 'Chicago, IL',
      email: 'melissa.adams.consulting@gmail.com',
      phone: '+1 (312) 555-0184',
      linkedin: 'linkedin.com/in/melissa-adams-deloitte',
    },
    summary:
      'Senior Strategy and Analytics Consultant with 6+ years driving enterprise digital transformations, operating model modernizations, and financial valuation models for Fortune 500 healthcare and retail clients. Proven track record identifying $45M+ in cost synergies and translating complex business requirements into high-impact executive deliverables.',
    skills: [
      { category: 'Strategy & Analysis', skills: ['Enterprise Digital Transformation', 'Cost-Benefit / ROI Modeling', 'Business Process Re-engineering', 'Market Sizing & Due Diligence', 'Executive Stakeholder Alignment'] },
      { category: 'Analytics & Visualization', skills: ['Advanced Financial Modeling', 'Tableau', 'Power BI', 'SQL', 'Python (Pandas)', 'Excel (VBA / Monte Carlo)'] },
      { category: 'Delivery & Methodologies', skills: ['Agile / Scrum Frameworks', 'Change Management', 'Vendor Evaluation & RFP Management', 'OKRs & KPI Dashboards'] },
    ],
    experience: [
      {
        company: 'Deloitte Consulting LLP',
        title: 'Senior Consultant — Strategy & Analytics Practice',
        location: 'Chicago, IL',
        startDate: '2021-08',
        endDate: 'Present',
        current: true,
        bullets: [
          'Led a cross-functional workstream for a $14B healthcare payer client, designing an operational cost reduction model that identified $38M in recurring administrative efficiencies.',
          'Conducted comprehensive cloud migration ROI analysis across 40 legacy applications, building dynamic financial models presented directly to client C-suite executives.',
          'Developed automated KPI and revenue dashboards in Tableau and SQL connecting to client data warehouses, replacing 12 manual spreadsheet workflows and accelerating weekly reporting by 85%.',
          'Facilitated 25+ executive stakeholder alignment workshops across business, operations, and IT teams to define roadmap milestones for ERP replacement.',
          'Managed a team of 4 consultants and business analysts, consistently exceeding project billable targets and client quality satisfaction metrics.',
        ],
      },
      {
        company: 'Accenture Strategy',
        title: 'Management Consulting Analyst',
        location: 'New York, NY',
        startDate: '2019-06',
        endDate: '2021-07',
        bullets: [
          'Built financial models and synergy estimations for 3 major retail M&A transactions valued at over $2B combined.',
          'Created supply chain optimization simulations identifying $12M in potential inventory holding cost reductions.',
        ],
      },
    ],
    projects: [
      {
        name: 'Enterprise Cloud ROI & Synergy Valuation Model',
        description: 'Comprehensive financial modeling framework evaluating multi-year TCO, Capex to Opex migration savings, and cloud adoption benefits.',
        techStack: ['Financial Modeling', 'Excel', 'Tableau', 'SQL'],
        highlights: [
          'Adopted as official practice-wide template across Deloitte Technology Strategy engagements.',
        ],
      },
    ],
    education: [
      {
        school: 'Northwestern University (Kellogg School of Management)',
        degree: 'Master of Business Administration (MBA)',
        field: 'Finance & Strategy',
        graduationDate: '2019',
        honors: 'Beta Gamma Sigma Honor Society',
      },
      {
        school: 'University of Notre Dame',
        degree: 'Bachelor of Business Administration (B.B.A.)',
        field: 'Finance & Economics',
        graduationDate: '2016',
        gpa: '3.88 / 4.0',
        honors: 'Magna Cum Laude',
      },
    ],
    certifications: [
      'Certified Management Consultant (CMC)',
      'Scrum Alliance Certified Scrum Product Owner (CSPO)',
    ],
  },

  // 23. Chime (Lead Fintech Product & Payments Operations Manager)
  {
    id: 'chime-fintech-project-manager',
    company: 'Chime',
    companyKey: 'chime',
    brandColor: '#25C974',
    brandTextColor: '#FFFFFF',
    role: 'Lead Fintech Product & Payments Operations Manager',
    category: 'BUSINESS',
    badge: 'PRO',
    atsScore: 97,
    experienceLevel: 'Lead / 7+ YOE',
    candidate: {
      name: 'Jordan Taylor',
      title: 'Lead Fintech Product & Payments Operations Manager',
      location: 'San Francisco, CA',
      email: 'jordan.taylor.fintech@gmail.com',
      phone: '+1 (415) 555-0164',
      linkedin: 'linkedin.com/in/jordan-taylor-fintech',
    },
    summary:
      'Lead Fintech Operations & Product Manager with 7+ years optimizing consumer banking products, overdraft protection programs (SpotMe), ACH processing, and card payment networks. Expert in fraud loss mitigation, banking partner SLA compliance, and cross-functional technical project delivery.',
    skills: [
      { category: 'Fintech Operations & Product', skills: ['ACH Processing (NACHA)', 'Debit Card Issuance', 'Real-Time Fraud Prevention', 'Overdraft (SpotMe) Programs', 'Banking Partner Compliance', 'Reg E & Reg CC'] },
      { category: 'Data & Analytical Tools', skills: ['SQL (PostgreSQL / Snowflake)', 'Looker', 'Tableau', 'Jira / Confluence', 'Mixpanel', 'Python'] },
      { category: 'Execution & Leadership', skills: ['Agile Sprint Planning', 'Cross-Functional Coordination', 'Incident Command', 'Vendor SLA Management'] },
    ],
    experience: [
      {
        company: 'Chime',
        title: 'Lead Technical Product & Operations Manager - Payments Core',
        location: 'San Francisco, CA',
        startDate: '2021-05',
        endDate: 'Present',
        current: true,
        bullets: [
          'Spearheaded the technical roadmap and operations for Chime’s flagship SpotMe overdraft service, managing $120M in monthly advance liquidity while reducing default losses by 22% via real-time risk scoring.',
          'Engineered automated direct deposit and Same-Day ACH processing workflows with partner banks, cutting settlement delays and enabling 4M+ members to access funds up to 2 days early.',
          'Reduced unauthorized debit card transaction fraud losses by 34% by leading the rollout of dynamic 3D-Secure 2.0 verification and machine learning risk rules.',
          'Partnered with bank sponsor compliance officers to maintain 100% adherence to NACHA rules, Regulation E dispute timelines, and AML sanctions screening.',
          'Built real-time payments monitoring dashboards in Looker and SQL, detecting payment network gateway anomalies within 2 minutes and averting merchant transaction drop-offs.',
        ],
      },
      {
        company: 'SoFi',
        title: 'Senior Operations Analyst - Money & Lending',
        location: 'San Francisco, CA',
        startDate: '2017-09',
        endDate: '2021-04',
        bullets: [
          'Optimized member loan origination and deposit account onboarding funnels, lifting customer completion rates by 18%.',
          'Automated daily wire reconciliation processes between clearing accounts, eliminating 3 hours of manual daily review.',
        ],
      },
    ],
    projects: [
      {
        name: 'ACH-Sentry — Automated NACHA Compliance & Return Rate Monitor',
        description: 'Automated telemetry model tracking ACH unauthorized debit return rates (R05, R07, R10) against NACHA 0.5% thresholds.',
        techStack: ['Python', 'SQL', 'Snowflake', 'Looker'],
        highlights: [
          'Protected sponsor bank compliance standing with zero regulatory infractions over 4 years.',
        ],
      },
    ],
    education: [
      {
        school: 'University of California, Berkeley',
        degree: 'Bachelor of Arts (B.A.)',
        field: 'Economics & Data Science',
        graduationDate: '2017',
        gpa: '3.86 / 4.0',
        honors: 'Dean’s Honors List',
      },
    ],
    certifications: [
      'Accredited ACH Professional (AAP) — NACHA Certified',
      'Project Management Professional (PMP) — PMI',
    ],
  },

  // 24. The Walt Disney Company (Entertainment Operations Coordinator)
  {
    id: 'disney-college-program-operations',
    company: 'The Walt Disney Company',
    companyKey: 'disney',
    brandColor: '#113CCF',
    brandTextColor: '#FFFFFF',
    role: 'Guest Experience & Operations Specialist (Disney College Program Alum)',
    category: 'STUDENT',
    badge: 'PRO',
    atsScore: 96,
    experienceLevel: 'Entry / Recent Grad',
    candidate: {
      name: 'Sophia Martinez',
      title: 'Guest Experience & Operations Specialist',
      location: 'Orlando, FL',
      email: 'sophia.martinez.disney@gmail.com',
      phone: '+1 (407) 555-0146',
      linkedin: 'linkedin.com/in/sophia-martinez-disney',
    },
    summary:
      'High-energy Operations & Guest Experience Specialist and Disney College Program alum with demonstrated excellence in high-volume park operations, crowd safety management, and premium guest hospitality. Skilled in MyMagic+ / Disney Genie+ guest flow systems, cross-cultural team leadership, and resolving complex guest situations with composure and empathy.',
    skills: [
      { category: 'Guest Services & Hospitality', skills: ['Guest Service Recovery', 'Crowd Management & Flow Dynamics', 'Disney Four Keys (Safety, Courtesy, Show, Efficiency)', 'VIP Concierge Hospitality'] },
      { category: 'Operations & Systems', skills: ['Disney Genie+ / Lightning Lane Dispatch', 'Point-of-Sale (POS) Systems', 'Turnstile & Ingress Coordination', 'Two-Way Radio Protocols'] },
      { category: 'Interpersonal & Communication', skills: ['Conflict De-escalation', 'Public Speaking & Presentations', 'Bilingual (English & Spanish)', 'Cross-Cultural Teamwork'] },
    ],
    experience: [
      {
        company: 'Walt Disney World Resort',
        title: 'Guest Operations & Cast Member (Disney College Program)',
        location: 'Orlando, FL',
        startDate: '2023-01',
        endDate: '2024-05',
        bullets: [
          'Facilitated seamless park ingress and attraction loading for over 25,000 daily guests at Magic Kingdom Park, maintaining adherence to Disney Four Keys standards.',
          'Assisted guests with Disney Genie+ and Lightning Lane reservations on My Disney Experience app, troubleshooting digital ticketing issues with a 98% positive resolution rate.',
          'Managed crowd control and parade audience routing along Main Street, U.S.A., guaranteeing guest safety during high-density fireworks and entertainment events.',
          'Recognized with 14 Cast Compliments and Disney "Four Keys Fanatic" award for exemplary customer service and empathetic de-escalation of complex family travel disputes.',
          'Trained 8 incoming international cast members on safety checklists, evacuation protocols, and ADA accessibility guest boarding accommodations.',
        ],
      },
      {
        company: 'University Student Union',
        title: 'Event Operations Coordinator',
        location: 'Tallahassee, FL',
        startDate: '2021-08',
        endDate: '2022-12',
        bullets: [
          'Coordinated logistics and staging for 45 campus events accommodating up to 3,000 attendees.',
          'Managed equipment check-outs, room reservation scheduling, and audiovisual setup.',
        ],
      },
    ],
    projects: [
      {
        name: 'MagicFlow — Park Ingress & Queue Optimization Analysis',
        description: 'Undergraduate capstone research paper analyzing queue psychology and mobile ordering adoption in high-capacity theme park environments.',
        techStack: ['Statistical Analysis', 'Excel', 'User Flow Mapping'],
        highlights: [
          'Presented to university hospitality department faculty with highest honors.',
        ],
      },
    ],
    education: [
      {
        school: 'Florida State University',
        degree: 'Bachelor of Science (B.S.)',
        field: 'Hospitality Management & Event Operations',
        graduationDate: '2024',
        gpa: '3.84 / 4.0',
        honors: 'Cum Laude, National Society of Collegiate Scholars',
      },
    ],
    certifications: [
      'Disney College Program Certificate of Completion',
      'First Aid & CPR / AED Certified — American Red Cross',
    ],
  },

  // 25. adidas (Senior Brand & Digital Marketing Project Manager)
  {
    id: 'adidas-senior-project-manager',
    company: 'adidas',
    companyKey: 'adidas',
    brandColor: '#000000',
    brandTextColor: '#FFFFFF',
    role: 'Senior Brand & Digital Marketing Project Manager',
    category: 'MARKETING',
    badge: 'PRO',
    atsScore: 97,
    experienceLevel: 'Senior / 7+ YOE',
    candidate: {
      name: 'Lucas Meyer',
      title: 'Senior Brand & Digital Marketing Project Manager',
      location: 'Portland, OR / Herzogenaurach, Germany',
      email: 'lucas.meyer.marketing@gmail.com',
      phone: '+1 (503) 555-0172',
      linkedin: 'linkedin.com/in/lucas-meyer-marketing',
    },
    summary:
      'Senior Marketing Project Manager with 7+ years delivering global omnichannel product launches, mobile app drop campaigns (CONFIRMED App), and influencer partnerships for premier athletic footwear and apparel. Expert in marketing budget oversight ($25M+), digital campaign tracking, creative agency governance, and agile marketing delivery.',
    skills: [
      { category: 'Digital Marketing & Strategy', skills: ['Global Product Launch Management', 'CONFIRMED App Drop Campaigns', 'Influencer & Athlete Partnerships', 'Omnichannel Brand Strategy', 'Performance Marketing'] },
      { category: 'Analytics & Tools', skills: ['Google Analytics 4', 'Adobe Analytics', 'Looker', 'Asana / Jira', 'Salesforce Marketing Cloud'] },
      { category: 'Budget & Production', skills: ['Multi-Million Dollar Budget Governance', 'Creative Agency Management', 'Content Production Pipelines', 'Global Brand Compliance'] },
    ],
    experience: [
      {
        company: 'adidas',
        title: 'Senior Project Manager - Digital Flagship & CONFIRMED App Drops',
        location: 'Portland, OR',
        startDate: '2021-04',
        endDate: 'Present',
        current: true,
        bullets: [
          'Orchestrated the global digital marketing rollout for 12 high-profile footwear launches on the adidas CONFIRMED app, generating $42M in direct-to-consumer (DTC) revenue and 1.8M new user app installs.',
          'Governed an annual digital media and creative production budget of $28M, coordinating deliverables across 6 international creative agencies with zero budget overruns.',
          'Spearheaded influencer and athlete partner activation campaigns across North America and Europe, driving a 34% increase in social media engagement and viral TikTok trend impressions.',
          'Implemented standardized agile marketing workflows in Asana, reducing marketing campaign concept-to-launch cycle time from 16 weeks to 9 weeks.',
          'Analyzed conversion funnel analytics across adidas.com and mobile apps, executing A/B test variations that improved checkout completion rates by 3.2%.',
        ],
      },
      {
        company: 'Nike',
        title: 'Digital Marketing Specialist - Global Brand Experience',
        location: 'Beaverton, OR',
        startDate: '2017-09',
        endDate: '2021-03',
        bullets: [
          'Managed digital content assets and localized copy for seasonal footwear launches across 18 European markets.',
          'Collaborated with social media teams to schedule organic and paid Instagram/YouTube campaigns achieving 85M+ cumulative impressions.',
        ],
      },
    ],
    projects: [
      {
        name: 'CONFIRMED Hype Launch Framework',
        description: 'Standardized operational blueprint for high-demand product drops, covering bot mitigation marketing communications and raffle mechanics.',
        techStack: ['Agile Marketing', 'Analytics', 'Asana', 'Omnichannel Strategy'],
        highlights: [
          'Adopted as official global playbook across all adidas key metropolitan cities.',
        ],
      },
    ],
    education: [
      {
        school: 'University of Oregon',
        degree: 'Bachelor of Science (B.S.)',
        field: 'Marketing & Sports Business Management (Warsaw Sports Center)',
        graduationDate: '2017',
        gpa: '3.89 / 4.0',
        honors: 'Summa Cum Laude',
      },
    ],
    certifications: [
      'Project Management Professional (PMP) — PMI',
      'Google Analytics 4 (GA4) Certification',
    ],
  },

  // 26. SONY (Systems Software Graduate Engineer)
  {
    id: 'sony-rotational-graduate',
    company: 'SONY',
    companyKey: 'sony',
    brandColor: '#000000',
    brandTextColor: '#FFFFFF',
    role: 'Systems Software Graduate Engineer (PlayStation Core)',
    category: 'STUDENT',
    badge: 'PRO',
    atsScore: 98,
    experienceLevel: 'Graduate / Rotational',
    candidate: {
      name: 'Kenzo Tanaka',
      title: 'Systems Software Graduate Engineer',
      location: 'Tokyo, Japan / San Diego, CA',
      email: 'kenzo.tanaka.sony@gmail.com',
      phone: '+81 3 5550 0195',
      linkedin: 'linkedin.com/in/kenzo-tanaka-ps',
      github: 'github.com/ktanaka-sony',
    },
    summary:
      'Systems Software Graduate Engineer with strong academic and practical foundations in modern C++, low-level graphics APIs (Vulkan, DirectX 12), and PlayStation 5 SDK developer tooling. Experienced in real-time frame time profiling, DualSense haptic feedback firmware integration, and multi-threaded game engine subsystems.',
    skills: [
      { category: 'Languages', skills: ['Modern C++ (C++20)', 'C', 'Python', 'x86 Assembly', 'HLSL / GLSL'] },
      { category: 'Graphics & Gaming Runtimes', skills: ['Vulkan', 'DirectX 12', 'PlayStation 5 SDK', 'Shader Compilation', 'GPU Profiling (RenderDoc)'] },
      { category: 'Systems & Hardware', skills: ['Multi-Threaded Systems', 'Memory Management', 'DualSense Haptics API', 'Linux / BSD Kernel', 'Git'] },
    ],
    experience: [
      {
        company: 'Sony Interactive Entertainment',
        title: 'Systems Software Engineer (Graduate Rotational Program)',
        location: 'Tokyo, Japan / San Diego, CA',
        startDate: '2023-04',
        endDate: 'Present',
        current: true,
        bullets: [
          'Contributed to PlayStation 5 Developer SDK runtime modules in C++20, optimizing DualSense adaptive trigger and haptic feedback audio-wave telemetry processing.',
          'Profiled graphics rendering draw-calls and GPU pipeline stalls in Vulkan using RenderDoc, identifying memory bandwidth bottlenecks that reduced frame drops in internal demo builds.',
          'Assisted senior kernel engineers in testing BSD-derived operating system system calls and high-speed NVMe storage read APIs for PS5 game title loading.',
          'Developed automated C++ unit testing suites for PlayStation Network authentication and cloud save synchronization libraries, raising test coverage by 30%.',
          'Completed rigorous engineering rotations across PlayStation Studios Central Technology, Audio Systems, and Graphics Architecture.',
        ],
      },
      {
        company: 'Capcom',
        title: 'Software Engineering Intern - Engine Systems',
        location: 'Osaka, Japan',
        startDate: '2022-06',
        endDate: '2022-12',
        bullets: [
          'Implemented multi-threaded particle system physics simulator in C++ utilizing SIMD intrinsics for RE Engine.',
          'Wrote automated crash dump parsing tools in Python, extracting call stacks and register states to assist game engine developers.',
        ],
      },
    ],
    projects: [
      {
        name: 'VulkanVoxel — Real-Time Hardware-Accelerated Voxel Raytracer',
        description: 'Modern C++20 and Vulkan ray-tracing engine featuring compute shader acceleration and spatial bounding volume hierarchies (BVH).',
        techStack: ['C++20', 'Vulkan', 'GLSL', 'RenderDoc'],
        url: 'github.com/ktanaka-sony/vulkan-voxel',
        highlights: [
          'Runs real-time lighting and shadows at 90 FPS on modern desktop GPUs.',
        ],
      },
    ],
    education: [
      {
        school: 'Tokyo Institute of Technology',
        degree: 'Bachelor of Engineering (B.Eng.)',
        field: 'Computer Science & Systems Engineering',
        graduationDate: '2023',
        gpa: '3.91 / 4.0',
        honors: 'President’s Award for Outstanding Graduation Research',
      },
    ],
    certifications: [
      'Khronos Group Vulkan Certified Developer',
    ],
  },

  // 27. Accenture (Public Policy & Digital Government Strategy Analyst)
  {
    id: 'accenture-assistant-policy-intern',
    company: 'Accenture',
    companyKey: 'accenture',
    brandColor: '#A100FF',
    brandTextColor: '#FFFFFF',
    role: 'Public Policy & Digital Government Strategy Analyst',
    category: 'BUSINESS',
    badge: 'PRO',
    atsScore: 97,
    experienceLevel: 'Analyst / 3+ YOE',
    candidate: {
      name: 'Amina Diallo',
      title: 'Public Policy & Digital Government Strategy Analyst',
      location: 'Arlington, VA',
      email: 'amina.diallo.accenture@gmail.com',
      phone: '+1 (703) 555-0158',
      linkedin: 'linkedin.com/in/amina-diallo-policy',
    },
    summary:
      'Public Policy and Digital Strategy Analyst with 3+ years delivering IT modernization roadmaps, FedRAMP compliance frameworks, and digital service redesigns for federal agencies. Skilled in legislative analysis, stakeholder facilitation, cloud policy alignment, and data-driven public sector performance reporting.',
    skills: [
      { category: 'Policy & Government IT', skills: ['Federal IT Modernization (FITARA)', 'FedRAMP & NIST 800-53', 'Public Policy Impact Analysis', 'Digital Government Services', 'Stakeholder Interviews'] },
      { category: 'Analytics & Delivery', skills: ['Data Analysis (Excel / Tableau)', 'PowerPoint Storyboarding', 'Requirements Gathering', 'Process Mapping (BPMN)', 'Agile in Government'] },
    ],
    experience: [
      {
        company: 'Accenture Federal Services',
        title: 'Digital Strategy & Technology Policy Analyst',
        location: 'Arlington, VA',
        startDate: '2023-01',
        endDate: 'Present',
        current: true,
        bullets: [
          'Formulated IT modernization roadmaps for a Cabinet-level federal agency, aligning legacy mainframe decommission milestones with OMB cloud-smart mandates.',
          'Conducted statutory and compliance gap assessments across 8 cloud software vendors, validating FedRAMP High and NIST 800-53 security controls to accelerate ATO approvals.',
          'Designed citizen journey maps and accessible interface recommendations for a public benefits web portal, reducing citizen application completion drop-off by 26%.',
          'Coordinated cross-agency policy steering working groups, drafting executive memos and briefing presentations delivered directly to Deputy Assistant Secretaries.',
          'Authored quarterly performance and program metric scorecards evaluating $45M in IT modernization contract expenditures.',
        ],
      },
      {
        company: 'Brookings Institution',
        title: 'Technology & Governance Research Assistant',
        location: 'Washington, D.C.',
        startDate: '2021-09',
        endDate: '2022-12',
        bullets: [
          'Researched artificial intelligence regulatory frameworks and federal privacy legislation across US and European jurisdictions.',
          'Published 4 policy analytical briefs on algorithmic bias and broadband infrastructure equity.',
        ],
      },
    ],
    projects: [
      {
        name: 'FedCloud-Tracker — Federal Agency Cloud Maturity Index',
        description: 'Analytical framework benchmarking federal agency compliance with Cloud-Smart policies, cybersecurity executive orders, and FITARA scoring.',
        techStack: ['Tableau', 'Excel', 'Legislative Policy Modeling'],
        highlights: [
          'Cited in public sector technology governance briefings.',
        ],
      },
    ],
    education: [
      {
        school: 'Georgetown University (McCourt School of Public Policy)',
        degree: 'Master of Public Policy (M.P.P.)',
        field: 'Technology Policy & Governance',
        graduationDate: '2023',
        honors: 'McCourt Merit Scholar',
      },
      {
        school: 'University of Virginia',
        degree: 'Bachelor of Arts (B.A.)',
        field: 'Foreign Affairs & Economics',
        graduationDate: '2021',
        gpa: '3.87 / 4.0',
        honors: 'Phi Beta Kappa',
      },
    ],
    certifications: [
      'AWS Certified Cloud Practitioner',
      'Certified ScrumMaster (CSM)',
    ],
  },

  // 28. NC State (Lead Enterprise Security Architect)
  {
    id: 'ncstate-it-security-architect',
    company: 'NC State',
    companyKey: 'ncstate',
    brandColor: '#CC0000',
    brandTextColor: '#FFFFFF',
    role: 'Lead Enterprise Security Architect',
    category: 'ENGINEERING',
    badge: 'PRO',
    atsScore: 98,
    experienceLevel: 'Lead / 9+ YOE',
    candidate: {
      name: 'Brian O’Halloran',
      title: 'Lead Enterprise Security Architect',
      location: 'Raleigh, NC',
      email: 'brian.ohalloran.sec@gmail.com',
      phone: '+1 (919) 555-0136',
      linkedin: 'linkedin.com/in/brian-ohalloran-sec',
      github: 'github.com/bohalloran-sec',
    },
    summary:
      'Lead Enterprise Information Security Architect with 9+ years designing Zero Trust defense architectures, hybrid multi-cloud security postures, and automated incident response frameworks for high-capacity research universities and defense research laboratories. Expert in NIST SP 800-171/53, CMMC 2.0, multi-factor SAML/OAuth federation, and enterprise threat intelligence.',
    skills: [
      { category: 'Cybersecurity Architecture', skills: ['Zero Trust Network Architecture (ZTNA)', 'NIST SP 800-171 / 800-53', 'CMMC 2.0 Level 2', 'Cloud Security Posture (CSPM)', 'Threat Modeling (STRIDE)'] },
      { category: 'Identity & Access Management', skills: ['SAML 2.0 / OIDC Federation', 'Okta / Azure AD', 'Privileged Access Management (PAM)', 'Role-Based Access Control (RBAC)'] },
      { category: 'SecOps & Detection', skills: ['SIEM (Splunk / Elastic Security)', 'EDR (CrowdStrike Falcon)', 'Vulnerability Management (Tenable / Qualys)', 'Suricata / Zeek IDS'] },
      { category: 'Languages & Automation', skills: ['Python', 'Bash', 'Terraform', 'Ansible', 'PowerShell'] },
    ],
    experience: [
      {
        company: 'North Carolina State University',
        title: 'Lead Enterprise IT Security Architect - Office of Information Technology',
        location: 'Raleigh, NC',
        startDate: '2021-01',
        endDate: 'Present',
        current: true,
        bullets: [
          'Architected and implemented enterprise Zero Trust Network Architecture protecting 45,000 active student, faculty, and research workstations across 12 campus colleges.',
          'Engineered compliant enclaves adhering to NIST SP 800-171 and CMMC 2.0 Level 2, protecting $80M in federal defense research grants involving Controlled Unclassified Information (CUI).',
          'Consolidated enterprise identity management from legacy LDAP silos to cloud-federated Okta and Azure AD with FIDO2 hardware security keys, reducing credential phishing attacks by 94%.',
          'Automated threat hunting detection playbooks in Splunk SIEM and CrowdStrike Falcon, slashing Mean Time to Respond (MTTR) for high-severity ransomware threats from 6 hours to 8 minutes.',
          'Chaired University Information Security Council, authoring campus-wide cryptographic standards and conducting annual cyber tabletop disaster exercises.',
        ],
      },
      {
        company: 'Duke University Health System',
        title: 'Senior Information Security Engineer',
        location: 'Durham, NC',
        startDate: '2016-06',
        endDate: '2020-12',
        bullets: [
          'Secured hospital clinical networks and biomedical IoT devices complying with HIPAA Security Rule and HITECH requirements.',
          'Implemented network micro-segmentation using Cisco TrustSec, isolating critical medical telemetry networks from guest Wi-Fi.',
        ],
      },
    ],
    projects: [
      {
        name: 'ZeroTrust-Enclave — Automated NIST 800-171 Terraform Blueprint',
        description: 'Infrastructure as Code repository provisioning isolated AWS/Azure research computing enclaves compliant with CMMC 2.0 controls.',
        techStack: ['Terraform', 'AWS GovCloud', 'Ansible', 'Linux'],
        url: 'github.com/bohalloran-sec/zerotrust-enclave',
        highlights: [
          'Adopted by 8 major research universities to secure DOD research projects.',
        ],
      },
    ],
    education: [
      {
        school: 'North Carolina State University',
        degree: 'Master of Science (M.S.)',
        field: 'Computer Networking (Information Security)',
        graduationDate: '2016',
        gpa: '3.94 / 4.0',
      },
      {
        school: 'North Carolina State University',
        degree: 'Bachelor of Science (B.S.)',
        field: 'Computer Science',
        graduationDate: '2014',
        honors: 'Magna Cum Laude',
      },
    ],
    certifications: [
      'Certified Information Systems Security Professional (CISSP)',
      'Certified Information Security Manager (CISM)',
      'Certified Cloud Security Professional (CCSP)',
      'GIAC Certified Incident Handler (GCIH)',
    ],
  },
];

const fileHeader = `// Auto-generated by scripts/build_sample_resumes.ts
// Industry-leading, company-tailored resume profiles

export interface ResumeExperience {
  company: string;
  title: string;
  location: string;
  startDate: string;
  endDate: string;
  current?: boolean;
  bullets: string[];
}

export interface ResumeEducation {
  school: string;
  degree: string;
  field: string;
  graduationDate: string;
  gpa?: string;
  honors?: string;
}

export interface ResumeSkillCategory {
  category: string;
  skills: string[];
}

export interface ResumeProject {
  name: string;
  description: string;
  highlights: string[];
  url?: string;
  techStack?: string[];
}

export interface SampleResume {
  id: string;
  company: string;
  companyKey: string;
  brandColor: string;
  brandTextColor: string;
  role: string;
  category: 'PROGRAMMING' | 'ENGINEERING' | 'BUSINESS' | 'FINANCE' | 'DESIGN' | 'STUDENT' | 'MARKETING' | 'OTHER';
  badge: string;
  atsScore: number;
  experienceLevel: string;
  candidate: {
    name: string;
    title: string;
    location: string;
    email: string;
    phone: string;
    linkedin: string;
    github?: string;
    portfolio?: string;
  };
  summary: string;
  skills: ResumeSkillCategory[];
  experience: ResumeExperience[];
  education: ResumeEducation[];
  projects?: ResumeProject[];
  certifications?: string[];
}

export const SAMPLE_CATEGORIES = [
  { id: 'ALL', label: 'ALL SAMPLES' },
  { id: 'PRO', label: 'PRO' },
  { id: 'BUSINESS', label: 'BUSINESS' },
  { id: 'PROGRAMMING', label: 'PROGRAMMING' },
  { id: 'ENGINEERING', label: 'ENGINEERING' },
  { id: 'MARKETING', label: 'MARKETING' },
  { id: 'DESIGN', label: 'DESIGN' },
  { id: 'STUDENT', label: 'STUDENT' },
  { id: 'MEDICAL', label: 'MEDICAL' },
  { id: 'FINANCE', label: 'FINANCE' },
  { id: 'EDUCATION', label: 'EDUCATION' },
  { id: 'LEGAL', label: 'LEGAL' },
  { id: 'OTHER', label: 'OTHER' },
] as const;

export const SAMPLE_RESUMES: SampleResume[] = `;

const targetPath = path.resolve(__dirname, '../frontend/data/sample-resumes.ts');
const fileContent = fileHeader + JSON.stringify(SAMPLE_RESUMES, null, 2) + ';\n';
fs.writeFileSync(targetPath, fileContent, 'utf8');
console.log(`Successfully generated ${SAMPLE_RESUMES.length} sample resumes at ${targetPath}`);

