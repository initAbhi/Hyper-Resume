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

export const SAMPLE_RESUMES: SampleResume[] = [
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
    experienceLevel: 'Staff / 8+ YOE',
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
      'Staff Software Engineer with 8+ years designing high-throughput, fault-tolerant distributed infrastructure at hyper-scale. Core contributor to low-latency RPC frameworks and multi-region consensus engines handling tens of billions of daily operations.',
    skills: [
      { category: 'Languages', skills: ['Go', 'C++20', 'Rust', 'Java', 'Python', 'SQL'] },
      { category: 'Distributed Systems', skills: ['gRPC', 'Protobuf', 'Raft', 'Paxos', 'Kafka', 'Apache Pulsar', 'Redis'] },
      { category: 'Cloud & Infrastructure', skills: ['Google Cloud (GCP)', 'Kubernetes', 'Borg', 'Terraform', 'Prometheus', 'Envoy'] },
      { category: 'Architecture', skills: ['Fault Tolerance', 'Multi-Region Replication', 'CAP Theorem Tradeoffs', 'High-Concurreny Systems'] },
    ],
    experience: [
      {
        company: 'Google',
        title: 'Senior Software Engineer (L5 -> L6)',
        location: 'Sunnyvale, CA',
        startDate: '2021-03',
        endDate: 'Present',
        current: true,
        bullets: [
          'Architected and led the development of a zero-copy gRPC payload streaming pipeline processing 1.8M requests/sec, reducing p99 tail latency by 43% and lowering fleet-wide CPU utilization by 18%.',
          'Engineered a multi-region Raft-based metadata consensus service guaranteeing strong consistency across 6 continental datacenters, maintaining 99.999% service availability during major fiber disruptions.',
          'Spearheaded automated chaos engineering and canary rollout controllers in Borg/Kubernetes, eliminating sev-1 production outage occurrences over 7 consecutive quarters.',
          'Mentored 6 senior and staff engineers through design reviews, RFC consensus, and promotion cycles across Cloud Core Infrastructure.',
        ],
      },
      {
        company: 'Cloudflare',
        title: 'Systems Software Engineer',
        location: 'San Francisco, CA',
        startDate: '2018-06',
        endDate: '2021-02',
        bullets: [
          'Authored high-performance edge proxy plugins in Rust and C++ for Cloudflare Workers, handling 25M+ HTTP requests/sec with median processing overhead below 1.2ms.',
          'Optimized TCP/QUIC connection termination pipelines, reducing handshake round-trips for mobile clients by 35% in APAC and EMEA regions.',
          'Designed automated DDoS mitigation filter rules blocking volumetric SYN floods of up to 1.2 Tbps without impacting legitimate customer traffic.',
        ],
      },
    ],
    education: [
      {
        school: 'University of California, Berkeley',
        degree: 'Master of Science',
        field: 'Computer Science (Distributed Systems Focus)',
        graduationDate: '2018',
        gpa: '3.94 / 4.0',
        honors: 'EECS Departmental Fellowship',
      },
      {
        school: 'University of Michigan',
        degree: 'Bachelor of Science',
        field: 'Computer Science & Engineering',
        graduationDate: '2016',
        gpa: '3.91 / 4.0',
        honors: 'Summa Cum Laude',
      },
    ],
    projects: [
      {
        name: 'Raft-KV Engine (github.com/avance-dist/raft-kv)',
        description: 'Open-source distributed key-value store implementing Raft consensus in Go.',
        highlights: ['1,800+ GitHub stars', 'Benchmarked to 120,000 durable writes/sec on 5-node cluster'],
        techStack: ['Go', 'Raft', 'gRPC', 'RocksDB'],
      },
    ],
    certifications: ['Google Cloud Certified Professional Cloud Architect', 'Certified Kubernetes Administrator (CKA)'],
  },
  {
    id: 'meta-senior-data-engineer',
    company: 'Meta',
    companyKey: 'meta',
    brandColor: '#0081FB',
    brandTextColor: '#FFFFFF',
    role: 'Senior Data Engineer (Core Analytics)',
    category: 'PROGRAMMING',
    badge: 'PRO',
    atsScore: 98,
    experienceLevel: 'Senior / 6+ YOE',
    candidate: {
      name: 'Sophia Chen',
      title: 'Senior Data Infrastructure Engineer',
      location: 'Menlo Park, CA',
      email: 'sophia.chen.data@outlook.com',
      phone: '+1 (415) 890-3321',
      linkedin: 'linkedin.com/in/sophiachen-data',
      github: 'github.com/sophia-chen-data',
    },
    summary:
      'Data Engineer with 6+ years specializing in petabyte-scale streaming pipelines, real-time analytics data warehouses, and data lake governance. Track record of reducing ETL cycle times by 70% and slashing cloud storage expenditure.',
    skills: [
      { category: 'Data & Processing', skills: ['Apache Spark', 'Apache Flink', 'Apache Kafka', 'Presto / Trino', 'Airflow', 'dbt'] },
      { category: 'Languages', skills: ['Python', 'SQL (Advanced)', 'Scala', 'Java', 'Bash'] },
      { category: 'Warehousing & Storage', skills: ['Snowflake', 'BigQuery', 'Apache Iceberg', 'Delta Lake', 'ClickHouse', 'PostgreSQL'] },
      { category: 'DevOps & Monitoring', skills: ['Docker', 'Kubernetes', 'Datadog', 'Great Expectations', 'Terraform'] },
    ],
    experience: [
      {
        company: 'Meta',
        title: 'Senior Data Engineer',
        location: 'Menlo Park, CA',
        startDate: '2021-08',
        endDate: 'Present',
        current: true,
        bullets: [
          'Engineered streaming analytics pipelines in Apache Flink and Kafka processing 14TB of user engagement events daily with sub-5-second data freshness SLAs for Ads ranking models.',
          'Migrated legacy Hive batch tables to Apache Iceberg on S3, reducing query latency by 62% across 2,500 daily analytical queries executed by product science teams.',
          'Architected an automated data quality framework using Great Expectations and dbt, intercepting 99.4% of upstream schema anomalies before downstream model ingestion.',
          'Lowered monthly compute cluster overhead by $1.2M through dynamic partition pruning, adaptive query execution, and Z-order clustering optimization.',
        ],
      },
      {
        company: 'Lyft',
        title: 'Data Engineer II',
        location: 'San Francisco, CA',
        startDate: '2019-01',
        endDate: '2021-07',
        bullets: [
          'Developed core ETL pipelines in Apache Airflow and PySpark for driver compensation reconciliation, processing $45M+ in weekly marketplace payouts with 100% financial audit accuracy.',
          'Built dimensional dimensional star-schema models in Snowflake serving executive business intelligence dashboards and supply-demand forecasting.',
        ],
      },
    ],
    education: [
      {
        school: 'University of Washington',
        degree: 'Bachelor of Science',
        field: 'Informatics & Data Science',
        graduationDate: '2018',
        gpa: '3.88 / 4.0',
        honors: 'Dean’s List (All Quarters)',
      },
    ],
    certifications: ['AWS Certified Big Data - Specialty', 'Databricks Certified Spark Developer'],
  },
  {
    id: 'apple-core-os-engineer',
    company: 'Apple',
    companyKey: 'apple',
    brandColor: '#000000',
    brandTextColor: '#FFFFFF',
    role: 'Core OS & Embedded Software Engineer',
    category: 'ENGINEERING',
    badge: 'PRO',
    atsScore: 97,
    experienceLevel: 'Senior / 6+ YOE',
    candidate: {
      name: 'Marcus Reed',
      title: 'Systems & Embedded Software Engineer',
      location: 'Cupertino, CA',
      email: 'm.reed.systems@gmail.com',
      phone: '+1 (408) 551-7892',
      linkedin: 'linkedin.com/in/marcus-reed-os',
      github: 'github.com/mreed-embedded',
    },
    summary:
      'Systems Engineer with deep background in POSIX kernel internals, ARM architecture, memory allocators, and real-time audio/sensor drivers. Specialized in maximizing battery efficiency and minimizing interrupt latency on consumer hardware.',
    skills: [
      { category: 'Languages', skills: ['C (Modern C17)', 'C++20', 'Rust', 'ARM64 Assembly', 'Python'] },
      { category: 'Systems & Kernel', skills: ['Mach/XNU Kernel', 'Linux Kernel', 'RTOS (FreeRTOS)', 'Memory Management', 'Device Drivers'] },
      { category: 'Protocols & Hardware', skills: ['I2C', 'SPI', 'UART', 'PCIe', 'DMA', 'Logic Analyzers', 'Oscilloscopes'] },
      { category: 'Tooling', skills: ['LLDB', 'GDB', 'Instruments', 'QEMU', 'CMake', 'Git'] },
    ],
    experience: [
      {
        company: 'Apple',
        title: 'Core OS Systems Engineer',
        location: 'Cupertino, CA',
        startDate: '2021-05',
        endDate: 'Present',
        current: true,
        bullets: [
          'Engineered custom memory allocator subsystems for iOS and macOS runtime, reducing heap fragmentation by 28% and saving up to 140MB of active RAM across background daemon processes.',
          'Optimized power-state transitions (DVFS) on Apple Silicon M-series processors, extending battery life during audio/video playback workflows by 11%.',
          'Authored low-latency DMA sensor drivers in C and ARM64 assembly, achieving deterministic interrupt response times under 15 microseconds for real-time spatial sensors.',
          'Collaborated closely with silicon hardware teams to validate pre-silicon RTL models using FPGA emulation boards and custom bare-metal diagnostic suites.',
        ],
      },
      {
        company: 'Qualcomm',
        title: 'Embedded Software Engineer',
        location: 'San Diego, CA',
        startDate: '2018-07',
        endDate: '2021-04',
        bullets: [
          'Developed board support packages (BSP) and peripheral device drivers for Snapdragon LTE/5G IoT modem chipsets on FreeRTOS.',
          'Resolved critical race conditions in inter-processor communication (IPC) queues, preventing kernel panics under high packet throughput.',
        ],
      },
    ],
    education: [
      {
        school: 'Georgia Institute of Technology',
        degree: 'Bachelor of Science',
        field: 'Computer Engineering (Hardware/Software Systems)',
        graduationDate: '2018',
        gpa: '3.92 / 4.0',
        honors: 'President’s Undergraduate Research Award',
      },
    ],
    certifications: ['ARM Accredited Engineer (AAE)'],
  },
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
    experienceLevel: 'Principal / 10+ YOE',
    candidate: {
      name: 'David K. Miller',
      title: 'Principal Cloud Solutions Architect',
      location: 'Seattle, WA',
      email: 'david.miller.cloud@gmail.com',
      phone: '+1 (206) 778-1902',
      linkedin: 'linkedin.com/in/david-miller-architect',
    },
    summary:
      'Enterprise Cloud Solutions Architect with 10+ years designing resilient, secure, distributed cloud systems on AWS for Fortune 100 enterprises. Proven track record executing multi-region active-active migrations, implementing zero-trust security postures, and optimizing infrastructure spend across multi-account AWS organizations. Deep expertise in AWS Well-Architected Framework, Kubernetes (EKS), Terraform, event-driven microservices, and regulatory compliance (SOC 2, PCI-DSS, HIPAA).',
    skills: [
      { category: 'Cloud Architecture', skills: ['AWS (All Core Services)', 'Well-Architected Framework', 'Multi-Region Active-Active', 'Disaster Recovery (RTO/RPO)', 'Hybrid Cloud'] },
      { category: 'Container & Serverless', skills: ['Amazon EKS', 'ECS Fargate', 'AWS Lambda', 'API Gateway', 'Amazon EventBridge', 'AWS Step Functions'] },
      { category: 'Infrastructure as Code', skills: ['Terraform Enterprise', 'AWS CDK (TypeScript/Python)', 'CloudFormation', 'Terragrunt', 'GitOps (ArgoCD)'] },
      { category: 'Security & Governance', skills: ['AWS Control Tower', 'AWS IAM Identity Center', 'KMS', 'AWS Organizations', 'SOC 2 Type II', 'PCI-DSS', 'HIPAA'] },
      { category: 'Data & Networking', skills: ['Amazon Aurora PostgreSQL', 'DynamoDB', 'Direct Connect', 'Transit Gateway', 'VPC Peering', 'AWS WAF', 'Route 53'] },
      { category: 'Observability & SRE', skills: ['Amazon CloudWatch', 'AWS X-Ray', 'Prometheus', 'Grafana', 'Datadog', 'Chaos Engineering'] },
    ],
    experience: [
      {
        company: 'Amazon Web Services (AWS)',
        title: 'Principal Solutions Architect',
        location: 'Seattle, WA',
        startDate: '2020-04',
        endDate: 'Present',
        current: true,
        bullets: [
          'Advised C-suite executives and principal engineers across 15+ Fortune 100 enterprise accounts on strategic cloud modernization, directly influencing $38M in incremental annual cloud consumption.',
          'Architected an active-active multi-region Kubernetes (EKS) migration for a global fintech client processing $2B in monthly settlements, achieving an RPO of 0 and RTO under 60 seconds across us-east-1 and us-west-2.',
          'Conducted 45+ AWS Well-Architected Framework reviews, identifying critical security, resilience, and cost bottlenecks that saved clients an average of 34% on monthly AWS bills.',
          'Engineered a standardized Terraform landing zone template adopted by 120+ enterprise customers to automate multi-account security baselines and IAM permission boundaries.',
          'Published 4 official AWS technical whitepapers on high-availability container patterns and delivered keynote technical sessions at AWS re:Invent to audiences exceeding 5,000 attendees.',
          'Partnered with AWS service engineering teams (EKS, Aurora, Transit Gateway) to deliver 18 customer-requested feature enhancements into general availability.',
        ],
      },
      {
        company: 'Slalom Consulting',
        title: 'Director of Cloud Architecture',
        location: 'Chicago, IL',
        startDate: '2016-03',
        endDate: '2020-03',
        bullets: [
          'Led a dedicated practice of 22 senior cloud consultants and DevOps engineers delivering end-to-end cloud migrations, CI/CD automation, and infrastructure governance for healthcare and retail clients.',
          'Directed the cloud transformation program for a national healthcare provider, migrating 400+ virtual machines and 45TB of HIPAA-regulated patient records to AWS with zero unplanned downtime.',
          'Designed an automated multi-tenant microservices deployment platform using Terraform, Docker, and AWS ECS, accelerating engineering release velocity from monthly to multiple times daily.',
          'Established cloud FinOps practices and automated idle resource termination routines, recovering $4.2M in annual unallocated cloud expenditure across 12 client portfolios.',
          'Spearheaded hiring, career progression frameworks, and AWS certification bootcamps, growing practice certifications by 140% over three years.',
        ],
      },
      {
        company: 'Accenture',
        title: 'Senior Cloud Infrastructure Consultant',
        location: 'Chicago, IL',
        startDate: '2014-06',
        endDate: '2016-02',
        bullets: [
          'Engineered automated AWS infrastructure deployment pipelines using CloudFormation and Python scripts for financial services clients.',
          'Implemented secure hybrid cloud connectivity connecting on-premises data centers to AWS VPCs via dual 10Gbps AWS Direct Connect circuits.',
          'Configured centralized logging and audit aggregation pipelines using Amazon Kinesis, S3, and Splunk to satisfy stringent SEC regulatory mandates.',
          'Automated disaster recovery testing procedures, validating automated database failover across availability zones.',
        ],
      },
    ],
    projects: [
      {
        name: 'Enterprise Control Tower Landing Zone Architecture',
        description: 'Comprehensive multi-account governance framework enforcing security baselines, guardrails, and audit logging across 150+ AWS accounts.',
        techStack: ['AWS Control Tower', 'Terraform', 'AWS Organizations', 'AWS IAM', 'KMS'],
        highlights: [
          'Automated account vending with pre-configured VPCs, Transit Gateway attachments, and security service integrations.',
          'Implemented Service Control Policies (SCPs) preventing unauthorized region usage and enforcing encryption at rest fleet-wide.',
          'Established central security audit account receiving consolidated AWS CloudTrail and AWS Config logs.',
        ],
      },
      {
        name: 'Multi-Region Active-Active Clearing Engine',
        description: 'Global transaction processing platform resilient to complete AWS regional outages with sub-minute failover.',
        techStack: ['Amazon EKS', 'Aurora Global Database', 'Route 53', 'EventBridge', 'Terraform'],
        highlights: [
          'Configured cross-region Aurora storage replication with write-forwarding latency under 800 milliseconds.',
          'Engineered Route 53 Application Recovery Controller (ARC) readiness checks for automated traffic shifting during degradation.',
          'Achieved 99.999% uptime SLA across 4 consecutive operating quarters.',
        ],
      },
      {
        name: 'Serverless Real-Time Telemetry Pipeline',
        description: 'High-throughput event streaming architecture ingesting 50,000 telemetry messages/second from connected devices.',
        techStack: ['AWS IoT Core', 'Amazon Kinesis Data Streams', 'AWS Lambda', 'Amazon Timestream'],
        highlights: [
          'Engineered zero-server ingestion topology scaling dynamically from zero to peak volume with sub-second processing overhead.',
          'Reduced telemetry infrastructure costs by 62% compared to the legacy dedicated EC2 cluster.',
        ],
      },
    ],
    education: [
      {
        school: 'University of Illinois Urbana-Champaign',
        degree: 'Bachelor of Science',
        field: 'Computer Engineering (Systems & Distributed Software)',
        graduationDate: '2014',
        gpa: '3.88 / 4.0',
        honors: 'Eta Kappa Nu Honor Society, Dean’s List (All Semesters)',
      },
    ],
    certifications: [
      'AWS Certified Solutions Architect – Professional (Active)',
      'AWS Certified Security – Specialty',
      'AWS Certified Advanced Networking – Specialty',
      'Certified Information Systems Security Professional (CISSP)',
      'Certified Kubernetes Administrator (CKA)',
    ],
  },
  {
    id: 'microsoft-senior-technical-product-manager',
    company: 'Microsoft',
    companyKey: 'microsoft',
    brandColor: '#00A4EF',
    brandTextColor: '#FFFFFF',
    role: 'Senior Technical Product Manager (Azure AI)',
    category: 'BUSINESS',
    badge: 'PRO',
    atsScore: 97,
    experienceLevel: 'Senior / 7+ YOE',
    candidate: {
      name: 'Elena Rostova',
      title: 'Senior Technical Product Manager',
      location: 'Redmond, WA',
      email: 'elena.rostova.pm@gmail.com',
      phone: '+1 (425) 332-9011',
      linkedin: 'linkedin.com/in/elena-rostova-pm',
    },
    summary:
      'Technical PM with 7+ years delivering developer-facing cloud platforms and AI API services. Proven track record of taking 0-to-1 enterprise SaaS products from ideation to $25M+ ARR with data-informed prioritization and customer empathy.',
    skills: [
      { category: 'Product Strategy', skills: ['Product Lifecycle Management', '0-to-1 Product Launch', 'PRD Authoring', 'OKRs', 'Competitive Analysis'] },
      { category: 'Technical Acumen', skills: ['REST & gRPC APIs', 'LLM Inference', 'SQL Analytics', 'A/B Testing', 'System Architecture'] },
      { category: 'Methodologies & Tools', skills: ['Agile / Scrum', 'Jira', 'Figma', 'Azure DevOps', 'Mixpanel', 'Power BI'] },
      { category: 'Go-To-Market', skills: ['Enterprise Developer Relations', 'Pricing & Packaging', 'Technical Sales Enablement'] },
    ],
    experience: [
      {
        company: 'Microsoft',
        title: 'Senior Technical Product Manager (Azure AI Platform)',
        location: 'Redmond, WA',
        startDate: '2021-11',
        endDate: 'Present',
        current: true,
        bullets: [
          'Owned the product roadmap and developer experience for Azure OpenAI SDKs and API Gateway, scaling from launch to 14,000+ monthly active enterprise organizations.',
          'Spearheaded enterprise throughput reservation models, reducing customer API throttling by 68% and securing $28M in committed annual contract value (ACV).',
          'Conducted 60+ in-depth interviews with enterprise CTOs and lead architects, synthesizing user feedback into actionable quarterly engineering sprints.',
          'Cross-functionally aligned 4 distributed engineering teams, UX design, legal/compliance, and developer marketing to deliver GA features on time.',
        ],
      },
      {
        company: 'Twilio',
        title: 'Product Manager (Developer Platforms)',
        location: 'San Francisco, CA',
        startDate: '2018-08',
        endDate: '2021-10',
        bullets: [
          'Managed developer onboarding workflows and API documentation portal, cutting developer time-to-first-API-call from 18 minutes to 4 minutes.',
          'A/B tested self-serve checkout flows, boosting developer trial conversion rates by 22%.',
        ],
      },
    ],
    education: [
      {
        school: 'Northwestern University',
        degree: 'Bachelor of Science',
        field: 'Computer Science & Industrial Engineering',
        graduationDate: '2018',
        gpa: '3.86 / 4.0',
      },
    ],
    certifications: ['Pragmatic Institute Certified (PMC-III)', 'Certified Scrum Product Owner (CSPO)'],
  },
  {
    id: 'netflix-senior-sre-streaming',
    company: 'Netflix',
    companyKey: 'netflix',
    brandColor: '#E50914',
    brandTextColor: '#FFFFFF',
    role: 'Senior Streaming Reliability Engineer',
    category: 'ENGINEERING',
    badge: 'PRO',
    atsScore: 98,
    experienceLevel: 'Senior / 7+ YOE',
    candidate: {
      name: 'Liam O’Connor',
      title: 'Senior Site Reliability Engineer',
      location: 'Los Gatos, CA',
      email: 'liam.oconnor.sre@gmail.com',
      phone: '+1 (408) 772-4910',
      linkedin: 'linkedin.com/in/liam-oconnor-sre',
      github: 'github.com/liam-reliability',
    },
    summary:
      'Site Reliability Engineer with 7+ years ensuring high-availability video playback across hundreds of millions of concurrent global sessions. Specialist in automated failure injection (Chaos Monkey), multi-region traffic steering, and observability at scale.',
    skills: [
      { category: 'SRE & Reliability', skills: ['SLIs / SLOs / SLAs', 'Chaos Engineering', 'Capacity Planning', 'Incident Management', 'Root Cause Analysis'] },
      { category: 'Infrastructure & Tools', skills: ['AWS', 'Kubernetes (Titus)', 'Spinnaker', 'Envoy Proxy', 'Terraform', 'Kafka'] },
      { category: 'Observability', skills: ['Prometheus', 'Grafana', 'Atlas', 'OpenTelemetry', 'Distributed Tracing'] },
      { category: 'Languages', skills: ['Python', 'Go', 'Java', 'Bash'] },
    ],
    experience: [
      {
        company: 'Netflix',
        title: 'Senior Reliability Engineer',
        location: 'Los Gatos, CA',
        startDate: '2021-04',
        endDate: 'Present',
        current: true,
        bullets: [
          'Architected global automated traffic evacuation controller in Envoy, shifting 40M+ concurrent video streams across AWS regions within 90 seconds during datacenter brownouts.',
          'Formulated SLO dashboards and dynamic error-budget alerts across 45 core playback microservices, cutting Mean Time to Detect (MTTD) by 55%.',
          'Implemented continuous chaos testing scenarios injecting network latency, packet loss, and CPU starvation into production canary clusters.',
          'Reduced annual AWS egress compute costs by $2.3M by optimizing CDN origin-shield caching policies and pre-fetching algorithms.',
        ],
      },
      {
        company: 'Twitch (Amazon)',
        title: 'Site Reliability Engineer',
        location: 'San Francisco, CA',
        startDate: '2018-09',
        endDate: '2021-03',
        bullets: [
          'Maintained 99.99% video ingest pipeline availability for live broadcasting infrastructure processing 2M+ concurrent live video streams.',
          'Automated incident runbooks with Python and AWS Step Functions, decreasing Mean Time to Resolution (MTTR) from 32 minutes to 7 minutes.',
        ],
      },
    ],
    education: [
      {
        school: 'University of Texas at Austin',
        degree: 'Bachelor of Science',
        field: 'Computer Science',
        graduationDate: '2018',
        gpa: '3.89 / 4.0',
      },
    ],
    certifications: ['AWS Certified DevOps Engineer – Professional'],
  },
  {
    id: 'tesla-autopilot-systems-engineer',
    company: 'Tesla',
    companyKey: 'tesla',
    brandColor: '#E82127',
    brandTextColor: '#FFFFFF',
    role: 'Autopilot & Vision Systems Engineer',
    category: 'ENGINEERING',
    badge: 'PRO',
    atsScore: 98,
    experienceLevel: 'Senior / 5+ YOE',
    candidate: {
      name: 'Rajiv Sharma',
      title: 'Senior Autopilot Software Engineer',
      location: 'Palo Alto, CA',
      email: 'rajiv.sharma.vision@gmail.com',
      phone: '+1 (650) 619-3022',
      linkedin: 'linkedin.com/in/rajiv-sharma-cv',
      github: 'github.com/rsharma-autopilot',
    },
    summary:
      'Computer Vision & Autonomous Systems Engineer with 5+ years building real-time neural network inference engines for camera-based perception. Specialized in multi-camera temporal tracking, occupancy networks, and embedded tensor optimization.',
    skills: [
      { category: 'AI & Vision', skills: ['PyTorch', 'TensorRT', 'OpenCV', 'Occupancy Networks', 'Object Detection', 'Point Clouds', '3D Perception'] },
      { category: 'Languages', skills: ['C++17/20', 'CUDA', 'Python', 'ARM NEON'] },
      { category: 'Embedded & Systems', skills: ['Embedded Linux', 'QNX', 'Hardware-in-the-Loop (HIL)', 'CAN Bus', 'ROS/ROS2'] },
      { category: 'Optimization', skills: ['Quantization (INT8/FP16)', 'Kernel Profiling', 'Memory Alignment', 'Zero-Copy Data Pipelines'] },
    ],
    experience: [
      {
        company: 'Tesla',
        title: 'Senior Autopilot Vision Engineer',
        location: 'Palo Alto, CA',
        startDate: '2022-01',
        endDate: 'Present',
        current: true,
        bullets: [
          'Engineered end-to-end multi-camera 3D occupancy perception networks running at 36 FPS on custom Tesla FSD hardware, reducing inference latency by 28%.',
          'Authored high-throughput INT8 TensorRT plugins with custom CUDA kernels, minimizing quantization error to <0.3% mAP degradation.',
          'Built automated regression testing suites on Hardware-In-The-Loop (HIL) simulators replaying 100,000+ real-world intervention scenarios prior to fleet releases.',
          'Optimized video frame DMA buffers from 8 surround cameras, eliminating memory copy bottlenecks and freeing 18% memory bandwidth.',
        ],
      },
      {
        company: 'Cruise Automation',
        title: 'Computer Vision Engineer',
        location: 'San Francisco, CA',
        startDate: '2019-06',
        endDate: '2021-12',
        bullets: [
          'Developed real-time pedestrian and cyclist trajectory prediction models fusing LiDAR point clouds and camera features with 96.8% accuracy.',
        ],
      },
    ],
    education: [
      {
        school: 'Carnegie Mellon University',
        degree: 'Master of Science',
        field: 'Robotics & Computer Vision',
        graduationDate: '2019',
        gpa: '3.95 / 4.0',
      },
      {
        school: 'Purdue University',
        degree: 'Bachelor of Science',
        field: 'Electrical & Computer Engineering',
        graduationDate: '2017',
        gpa: '3.92 / 4.0',
      },
    ],
    projects: [
      {
        name: 'FastOccupancy3D (github.com/rsharma-autopilot/fast-occ)',
        description: 'Voxelized occupancy prediction engine written in C++ and CUDA.',
        highlights: ['1,200+ stars', 'Demonstrated 120 FPS on RTX 4090'],
      },
    ],
  },
  {
    id: 'nvidia-deep-learning-research-engineer',
    company: 'NVIDIA',
    companyKey: 'nvidia',
    brandColor: '#76B900',
    brandTextColor: '#FFFFFF',
    role: 'Deep Learning & GPU Systems Engineer',
    category: 'ENGINEERING',
    badge: 'PRO',
    atsScore: 99,
    experienceLevel: 'Senior / 6+ YOE',
    candidate: {
      name: 'Dr. Adrian Sterling',
      title: 'Senior GPU Systems & Deep Learning Engineer',
      location: 'Santa Clara, CA',
      email: 'adrian.sterling.ai@gmail.com',
      phone: '+1 (408) 892-7711',
      linkedin: 'linkedin.com/in/adrian-sterling-gpu',
      github: 'github.com/asterling-cuda',
    },
    summary:
      'GPU Performance Engineer with Ph.D. in Computer Architecture. Specialized in writing custom CUDA kernels, distributed multi-GPU training algorithms (Megatron-LM), and optimizing TensorRT inference pipelines on H100 and Grace Hopper architectures.',
    skills: [
      { category: 'GPU Programming', skills: ['CUDA C/C++', 'PTX Assembly', 'TensorRT', 'Triton (OpenAI)', 'cuDNN', 'NCCL', 'cuBLAS'] },
      { category: 'Deep Learning', skills: ['PyTorch Internals', 'Tensor Parallelism', 'FlashAttention', 'Pipeline Parallelism', 'Mixed Precision'] },
      { category: 'Profiling & Tools', skills: ['Nsight Systems', 'Nsight Compute', 'NVLink', 'InfiniBand', 'Slurm'] },
      { category: 'Languages', skills: ['C++20', 'Python', 'C', 'Rust'] },
    ],
    experience: [
      {
        company: 'NVIDIA',
        title: 'Senior Deep Learning Systems Engineer',
        location: 'Santa Clara, CA',
        startDate: '2021-09',
        endDate: 'Present',
        current: true,
        bullets: [
          'Engineered 20+ custom fused CUDA kernels utilizing Tensor Core FP8/FP16 matrix engines, achieving 84% of theoretical peak memory bandwidth on H100 SXM5.',
          'Optimized all-reduce collective communications in NCCL across 2,048 GPUs via NVLink and Quantum-2 InfiniBand, accelerating 70B parameter LLM training throughput by 24%.',
          'Integrated custom FlashAttention-2 operators with Triton Inference Server, slashing per-token generation latency from 18ms to 7.4ms at concurrency of 64.',
          'Collaborated with foundational model partners to diagnose SM stalls and memory coalescing bottlenecks using NVIDIA Nsight Compute.',
        ],
      },
      {
        company: 'Argonne National Laboratory',
        title: 'Postdoctoral Computational Scientist',
        location: 'Lemont, IL',
        startDate: '2019-08',
        endDate: '2021-08',
        bullets: [
          'Benchmarked parallel scaling of astrophysical simulation codes across 10,000+ GPU nodes, authoring 5 peer-reviewed IEEE papers.',
        ],
      },
    ],
    education: [
      {
        school: 'University of Illinois at Urbana-Champaign',
        degree: 'Ph.D.',
        field: 'Computer Science (High-Performance Computing)',
        graduationDate: '2019',
      },
      {
        school: 'Cornell University',
        degree: 'Bachelor of Science',
        field: 'Applied Physics & Computer Science',
        graduationDate: '2014',
      },
    ],
    certifications: ['NVIDIA Deep Learning Institute (DLI) Ambassador'],
  },
  {
    id: 'stripe-payments-infrastructure',
    company: 'Stripe',
    companyKey: 'stripe',
    brandColor: '#635BFF',
    brandTextColor: '#FFFFFF',
    role: 'Staff Payments Infrastructure Engineer',
    category: 'PROGRAMMING',
    badge: 'PRO',
    atsScore: 99,
    experienceLevel: 'Staff / 8+ YOE',
    candidate: {
      name: 'Julian Thorne',
      title: 'Staff Software Engineer (Payments Core)',
      location: 'San Francisco, CA',
      email: 'julian.thorne.swe@gmail.com',
      phone: '+1 (415) 602-9914',
      linkedin: 'linkedin.com/in/julian-thorne-payments',
      github: 'github.com/jthorne-fintech',
    },
    summary:
      'Staff Software Engineer with 8+ years architecting zero-loss financial ledgers, idempotent payment processing pipelines, and high-security compliance systems handling tens of billions of dollars in global annual payment volume.',
    skills: [
      { category: 'Languages', skills: ['Ruby (Sorbet)', 'Java', 'Go', 'TypeScript', 'SQL'] },
      { category: 'Financial Systems', skills: ['Double-Entry Ledgers', 'Idempotency', 'PCI-DSS Level 1', 'Card Networks (Visa/Mastercard)', 'ACH/SEPA'] },
      { category: 'Infrastructure', skills: ['Kafka', 'Temporal Workflows', 'PostgreSQL', 'Redis', 'AWS', 'Kubernetes'] },
      { category: 'Architecture', skills: ['Event Sourcing', 'Distributed Transactions', 'High Reliability (99.999%)', 'SLA Management'] },
    ],
    experience: [
      {
        company: 'Stripe',
        title: 'Staff Software Engineer (Payments Infrastructure)',
        location: 'San Francisco, CA',
        startDate: '2021-02',
        endDate: 'Present',
        current: true,
        bullets: [
          'Architected and led the migration of core authorization routing pipelines to Temporal workflows and Kafka, processing $450M+ in daily transaction volume with zero financial discrepancy.',
          'Engineered global idempotency guarantees and automatic fallback payment rails across 60+ regional banking partners, increasing transaction authorization rates by 1.8% ($240M revenue lift).',
          'Designed immutable double-entry ledger database models on PostgreSQL with cryptographic audit trails, passing annual PCI-DSS Level 1 audits with 0 critical findings.',
          'Reduced p99 checkout payment creation API latency from 480ms to 140ms through intelligent connection pooling and async risk evaluation.',
        ],
      },
      {
        company: 'Square (Block)',
        title: 'Senior Software Engineer',
        location: 'San Francisco, CA',
        startDate: '2017-06',
        endDate: '2021-01',
        bullets: [
          'Built point-of-sale payment capture and offline transaction synchronization services in Java and Go, ensuring merchants could take payments during cellular outages.',
        ],
      },
    ],
    education: [
      {
        school: 'Brown University',
        degree: 'Bachelor of Science',
        field: 'Computer Science & Mathematics',
        graduationDate: '2017',
        gpa: '3.91 / 4.0',
      },
    ],
    certifications: ['PCI-DSS Internal Security Assessor (ISA)'],
  },
  {
    id: 'uber-realtime-marketplace-engineer',
    company: 'Uber',
    companyKey: 'uber',
    brandColor: '#000000',
    brandTextColor: '#FFFFFF',
    role: 'Lead Marketplace & Logistics Engineer',
    category: 'PROGRAMMING',
    badge: 'PRO',
    atsScore: 98,
    experienceLevel: 'Lead / 7+ YOE',
    candidate: {
      name: 'Tariq Al-Mansoor',
      title: 'Lead Software Engineer (Marketplace Dispatch)',
      location: 'San Francisco, CA',
      email: 'tariq.almansoor.tech@gmail.com',
      phone: '+1 (415) 309-8812',
      linkedin: 'linkedin.com/in/tariq-almansoor',
      github: 'github.com/talmansoor-geo',
    },
    summary:
      'Backend Software Engineer with 7+ years building real-time geospatial dispatch, dynamic marketplace pricing, and high-concurrency matching engines processing millions of events per minute across global metropolitan markets.',
    skills: [
      { category: 'Geospatial & Systems', skills: ['Uber H3 (Hexagonal Grid)', 'Geofencing', 'Dynamic Pricing', 'Graph Routing', 'Kafka Streams'] },
      { category: 'Languages', skills: ['Go', 'Java', 'Python', 'C++', 'SQL'] },
      { category: 'Data & Storage', skills: ['Cassandra', 'Redis Cluster', 'Elasticsearch', 'Apache Flink', 'PostgreSQL / PostGIS'] },
      { category: 'Cloud & Tooling', skills: ['Docker', 'Kubernetes', 'Jaeger Tracing', 'Terraform', 'gRPC'] },
    ],
    experience: [
      {
        company: 'Uber',
        title: 'Lead Software Engineer (Dispatch Engine)',
        location: 'San Francisco, CA',
        startDate: '2021-06',
        endDate: 'Present',
        current: true,
        bullets: [
          'Spearheaded the redesign of the core batch-matching dispatch engine in Go using H3 spatial indexing, reducing average rider wait times (ETA) by 14% across 80 international cities.',
          'Scaled real-time driver supply-demand heatmaps to 2.2M state updates/sec on Apache Flink and Redis Cluster with sub-100ms end-to-end propagation latency.',
          'Implemented automated circuit breakers and degraded-mode fallbacks, averting catastrophic dispatch blackouts during high-demand New Year’s Eve surges.',
          'Mentored an engineering squad of 8 across San Francisco and Amsterdam, driving coding standards, telemetry instrumentation, and design docs.',
        ],
      },
      {
        company: 'DoorDash',
        title: 'Senior Software Engineer (Logistics)',
        location: 'San Francisco, CA',
        startDate: '2018-05',
        endDate: '2021-05',
        bullets: [
          'Engineered batch order bundling algorithms that increased Dasher efficiency by 18% and reduced per-delivery vehicle miles traveled.',
        ],
      },
    ],
    education: [
      {
        school: 'Stanford University',
        degree: 'Bachelor of Science',
        field: 'Computer Science (Systems Specialization)',
        graduationDate: '2018',
        gpa: '3.87 / 4.0',
      },
    ],
  },
  {
    id: 'deloitte-senior-business-analyst',
    company: 'Deloitte',
    companyKey: 'deloitte',
    brandColor: '#86BC25',
    brandTextColor: '#FFFFFF',
    role: 'Senior Business Analyst & Strategy Consultant',
    category: 'BUSINESS',
    badge: 'PRO',
    atsScore: 98,
    experienceLevel: 'Senior / 6+ YOE',
    candidate: {
      name: 'Charlotte Bloomberg',
      title: 'Senior Business Analyst (Strategy & Analytics)',
      location: 'New York, NY',
      email: 'charlotte.bloomberg.cons@gmail.com',
      phone: '+1 (212) 554-7801',
      linkedin: 'linkedin.com/in/charlotte-bloomberg-consulting',
    },
    summary:
      'Senior Business Analyst with 6+ years delivering large-scale digital transformations, operating model modernizations, and requirements engineering for Fortune 500 financial and healthcare institutions. Expert in bridging executive stakeholders and technical agile squads.',
    skills: [
      { category: 'Requirements & Strategy', skills: ['BRD / FRD Authoring', 'Gap Analysis', 'As-Is / To-Be Process Mapping', 'User Stories', 'UAT Management'] },
      { category: 'Data & Analytics', skills: ['SQL Queries', 'Tableau', 'Power BI', 'Financial Modeling (DCF/NPV)', 'Excel Advanced (VBA)'] },
      { category: 'Agile & Tooling', skills: ['Jira', 'Confluence', 'Miro', 'MS Visio', 'Salesforce CRM', 'Scrum / SAFe'] },
      { category: 'Domain Expertise', skills: ['Banking Digitalization', 'Regulatory Compliance', 'Post-Merger Integration', 'Stakeholder Alignment'] },
    ],
    experience: [
      {
        company: 'Deloitte Consulting LLP',
        title: 'Senior Business Analyst',
        location: 'New York, NY',
        startDate: '2021-01',
        endDate: 'Present',
        current: true,
        bullets: [
          'Led requirements discovery workshops with C-suite and VP stakeholders for a $45M core banking platform replacement, scoping out 180+ epics and 600+ user stories.',
          'Authored comprehensive As-Is and To-Be process workflows in MS Visio, pinpointing operational bottlenecks and saving client an estimated $2.8M in annual back-office manual reconciliation.',
          'Managed User Acceptance Testing (UAT) execution across 4 global regional teams, managing defect triage with zero critical defects at go-live.',
          'Designed real-time executive progress dashboards in Tableau tracking KPI milestones, budget burn, and agile sprint velocity.',
        ],
      },
      {
        company: 'Accenture',
        title: 'Business Analyst',
        location: 'Boston, MA',
        startDate: '2018-07',
        endDate: '2020-12',
        bullets: [
          'Facilitated sprint planning and backlog refinement for a top 5 insurance client’s customer claims portal, accelerating claim cycle times by 32%.',
          'Created detailed data dictionary and field-mapping specifications for Salesforce Financial Services Cloud integration.',
        ],
      },
    ],
    education: [
      {
        school: 'New York University (Stern School of Business)',
        degree: 'Bachelor of Science',
        field: 'Finance & Information Systems',
        graduationDate: '2018',
        gpa: '3.85 / 4.0',
        honors: 'Beta Gamma Sigma Honor Society',
      },
    ],
    certifications: [
      'Certified ScrumMaster (CSM)',
      'PMI Professional in Business Analysis (PMI-PBA)',
      'Tableau Desktop Specialist',
    ],
  },
  {
    id: 'goldman-sachs-quantitative-strategist',
    company: 'Goldman Sachs',
    companyKey: 'goldman',
    brandColor: '#002D62',
    brandTextColor: '#FFFFFF',
    role: 'Quantitative Strategist (Electronic Trading)',
    category: 'FINANCE',
    badge: 'PRO',
    atsScore: 99,
    experienceLevel: 'Senior / 5+ YOE',
    candidate: {
      name: 'Nathaniel Hayes',
      title: 'Quantitative Strategist (Vice President)',
      location: 'New York, NY',
      email: 'nathaniel.hayes.quant@gmail.com',
      phone: '+1 (212) 902-3310',
      linkedin: 'linkedin.com/in/nathaniel-hayes-quant',
      github: 'github.com/nhayes-quant',
    },
    summary:
      'Quantitative Strategist with 5+ years developing ultra-low-latency electronic execution algorithms, tick-level statistical arbitrage models, and real-time risk controls. Advanced proficiency in C++20, Python, and stochastic calculus.',
    skills: [
      { category: 'Quantitative Finance', skills: ['Statistical Arbitrage', 'Order Book Dynamics (L2/L3)', 'Market Making', 'Stochastic Calculus', 'Backtesting'] },
      { category: 'Languages', skills: ['C++20 (Modern)', 'Python (NumPy/Pandas)', 'Rust', 'SQL', 'KDB+/q'] },
      { category: 'Systems & HPC', skills: ['Low Latency Systems', 'Lock-Free Queues', 'Kernel Bypass (Solarflare OpenOnload)', 'FPGA Interfacing'] },
      { category: 'Math & Modeling', skills: ['Linear Algebra', 'Monte Carlo Simulation', 'Convex Optimization', 'Time Series Analysis'] },
    ],
    experience: [
      {
        company: 'Goldman Sachs',
        title: 'Quantitative Strategist - Electronic Trading (VP)',
        location: 'New York, NY',
        startDate: '2022-02',
        endDate: 'Present',
        current: true,
        bullets: [
          'Engineered algorithmic order execution strategies (VWAP/TWAP/Implementation Shortfall) in C++20 for US Equities, reducing client execution slippage by 1.4 basis points ($12M annual savings).',
          'Optimized core matching and risk gateway code paths using cache alignment and lock-free ring buffers, lowering median tick-to-trade response latency to 820 nanoseconds.',
          'Developed historical simulation engine in Python and KDB+/q testing execution performance against 15TB of raw Level-3 market feed data.',
          'Implemented real-time risk limit controls monitoring gross notionals and VaR thresholds, halting aberrant runaway orders in under 5 microseconds.',
        ],
      },
      {
        company: 'Citadel Securities',
        title: 'Quantitative Research Analyst',
        location: 'Chicago, IL',
        startDate: '2019-07',
        endDate: '2022-01',
        bullets: [
          'Researched and deployed predictive machine learning alphas for cross-asset futures arbitrage, generating a Sharpe ratio of 3.4.',
        ],
      },
    ],
    education: [
      {
        school: 'Columbia University',
        degree: 'Master of Science',
        field: 'Financial Engineering',
        graduationDate: '2019',
        gpa: '3.96 / 4.0',
      },
      {
        school: 'MIT',
        degree: 'Bachelor of Science',
        field: 'Mathematics with Computer Science',
        graduationDate: '2017',
        gpa: '3.92 / 4.0',
      },
    ],
    certifications: ['Chartered Financial Analyst (CFA) Level III Passed'],
  },
  {
    id: 'airbnb-design-technologist',
    company: 'Airbnb',
    companyKey: 'airbnb',
    brandColor: '#FF5A5F',
    brandTextColor: '#FFFFFF',
    role: 'Senior Design Technologist & UI Engineer',
    category: 'DESIGN',
    badge: 'PRO',
    atsScore: 98,
    experienceLevel: 'Senior / 6+ YOE',
    candidate: {
      name: 'Chloe Dupond',
      title: 'Senior Design Technologist',
      location: 'San Francisco, CA',
      email: 'chloe.dupond.design@gmail.com',
      phone: '+1 (415) 761-4402',
      linkedin: 'linkedin.com/in/chloe-dupond-ui',
      portfolio: 'chloedupond.design',
    },
    summary:
      'Design Technologist and Senior Frontend Engineer bridging the gap between product design and production engineering. Creator of design systems, fluid micro-animations, and accessible WCAG 2.1 AAA component primitives used by millions.',
    skills: [
      { category: 'Frontend & UI', skills: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'CSS Architecture', 'Framer Motion'] },
      { category: 'Design Systems', skills: ['Token Architecture', 'Component Libraries', 'Figma Variables & Plugins', 'Storybook', 'Visual Regression'] },
      { category: 'Accessibility (a11y)', skills: ['WCAG 2.1 AAA Compliance', 'Screen Readers (VoiceOver/NVDA)', 'Keyboard Navigation', 'ARIA Primitives'] },
      { category: 'Tooling & Testing', skills: ['Jest / Vitest', 'Playwright', 'Turborepo', 'Lighthouse Optimization'] },
    ],
    experience: [
      {
        company: 'Airbnb',
        title: 'Senior Design Technologist (Design Systems)',
        location: 'San Francisco, CA',
        startDate: '2021-04',
        endDate: 'Present',
        current: true,
        bullets: [
          'Architected and maintained Airbnb’s multi-platform design system tokens and React components, adopted by 35+ product squads across Web, iOS, and Android.',
          'Pioneered automated Figma-to-code token synchronization pipeline via GitHub Actions, eliminating design-to-engineering handoff discrepancies by 90%.',
          'Overhauled checkout and listing booking flows for WCAG 2.1 AAA accessibility compliance, adding full screen-reader audit coverage and keyboard trap prevention.',
          'Improved Core Web Vitals across top search result pages (LCP < 1.4s, CLS = 0), driving a measurable 2.3% uplift in completed reservations.',
        ],
      },
      {
        company: 'Pinterest',
        title: 'Frontend Engineer (Design Platform)',
        location: 'San Francisco, CA',
        startDate: '2018-08',
        endDate: '2021-03',
        bullets: [
          'Engineered Gestalt open-source design system components in React and Flow, used by 100% of web surfaces at Pinterest.',
          'Implemented dark mode theming across web application with zero cumulative layout shift (CLS).',
        ],
      },
    ],
    education: [
      {
        school: 'Rhode Island School of Design (RISD)',
        degree: 'Bachelor of Fine Arts',
        field: 'Graphic Design & Digital Media',
        graduationDate: '2018',
        gpa: '3.90 / 4.0',
      },
    ],
  },
  {
    id: 'spotify-ml-recommendations-engineer',
    company: 'Spotify',
    companyKey: 'spotify',
    brandColor: '#1DB954',
    brandTextColor: '#FFFFFF',
    role: 'Senior Machine Learning Engineer (Audio Discovery)',
    category: 'PROGRAMMING',
    badge: 'PRO',
    atsScore: 98,
    experienceLevel: 'Senior / 6+ YOE',
    candidate: {
      name: 'Frederik Lindqvist',
      title: 'Senior ML Engineer (Personalization)',
      location: 'Stockholm, Sweden / New York, NY',
      email: 'f.lindqvist.ml@gmail.com',
      phone: '+1 (917) 441-2099',
      linkedin: 'linkedin.com/in/frederik-lindqvist',
      github: 'github.com/flindqvist-ml',
    },
    summary:
      'Machine Learning Engineer with 6+ years specializing in two-tower recommendation architectures, vector similarity search, and audio acoustic embeddings. Led ranking algorithms powering Discover Weekly and daily algorithmic playlists.',
    skills: [
      { category: 'Machine Learning', skills: ['Two-Tower Models', 'Collaborative Filtering', 'Vector Embeddings', 'ANN (Milvus/FAISS)', 'Transformer Models'] },
      { category: 'Frameworks & Tools', skills: ['PyTorch', 'TensorFlow', 'Apache Beam / Dataflow', 'Triton Inference Server', 'Feast Feature Store'] },
      { category: 'Languages', skills: ['Python', 'Scala', 'Java', 'SQL'] },
      { category: 'Cloud & Infrastructure', skills: ['GCP (Google Cloud)', 'BigQuery', 'Kubeflow', 'Docker', 'Kubernetes'] },
    ],
    experience: [
      {
        company: 'Spotify',
        title: 'Senior Machine Learning Engineer',
        location: 'New York, NY',
        startDate: '2021-07',
        endDate: 'Present',
        current: true,
        bullets: [
          'Re-architected candidate generation stage of Discover Weekly using deep collaborative filtering and Annoy/FAISS vector indexing, increasing 30-second song save rate by 8.4%.',
          'Built real-time session-based listening state embedding model running on Triton Inference Server, personalizing home screen feeds within 150ms of session start.',
          'Engineered multi-task ranking neural network in PyTorch predicting user skip, completion, and repeat probability across 200M+ active listeners.',
          'Established automated offline-to-online evaluation pipelines and multi-armed bandit A/B testing infrastructure.',
        ],
      },
      {
        company: 'SoundCloud',
        title: 'Machine Learning Engineer',
        location: 'Berlin, Germany',
        startDate: '2018-09',
        endDate: '2021-06',
        bullets: [
          'Extracted acoustic audio spectrogram features using CNNs to identify unindexed indie artist tracks for recommendation queues.',
        ],
      },
    ],
    education: [
      {
        school: 'KTH Royal Institute of Technology',
        degree: 'Master of Science',
        field: 'Machine Learning & Computational Science',
        graduationDate: '2018',
      },
    ],
  },
  {
    id: 'disney-college-program-operations',
    company: 'The Walt Disney Company',
    companyKey: 'disney',
    brandColor: '#113CCF',
    brandTextColor: '#FFFFFF',
    role: 'Guest Experience & Operations Specialist (College Program)',
    category: 'STUDENT',
    badge: 'PRO',
    atsScore: 97,
    experienceLevel: 'Entry / College Program',
    candidate: {
      name: 'Charles Bloomberg',
      title: 'Disney College Program Alum / Hospitality Specialist',
      location: 'Orlando, FL',
      email: 'charles.bloomberg.cp@gmail.com',
      phone: '+1 (407) 824-2222',
      linkedin: 'linkedin.com/in/charles-bloomberg-disney',
    },
    summary:
      'High-performing collegiate leader and Disney College Program Alum selected from top 4% of national applicant pool. Proven excellence in fast-paced guest operations, crowd management, safety protocols, and conflict de-escalation for 45,000+ daily theme park visitors.',
    skills: [
      { category: 'Guest Services & Ops', skills: ['Guest Relations', 'Crowd Flow Management', 'Conflict Resolution', 'Safety Auditing', 'Cash Handling / POS'] },
      { category: 'Communication', skills: ['Public Speaking', 'Cross-Cultural Teamwork', 'Team Leadership', 'Customer Advocacy'] },
      { category: 'Technology', skills: ['Disney MyMagic+ Systems', 'Matra POS', 'Excel', 'Google Workspace', 'ServiceNow'] },
    ],
    experience: [
      {
        company: 'Walt Disney World Resort',
        title: 'Guest Operations & Cast Member (Disney College Program)',
        location: 'Lake Buena Vista, FL',
        startDate: '2023-01',
        endDate: '2023-08',
        bullets: [
          'Selected among top 4% of 15,000+ national applicants for the prestigious Walt Disney World College Program internship.',
          'Coordinated safe entry, crowd management, and queuing operations for Magic Kingdom attractions welcoming 45,000+ guests daily, exceeding park efficiency targets by 12%.',
          'Awarded 4 Disney Guest Service Fanatic recognitions for exemplary guest conflict resolution and creating personalized magical moments for international visitors.',
          'Trained 14 incoming seasonal cast members on emergency evacuation procedures, disability accessibility services (DAS), and Disney’s Four Keys (Safety, Courtesy, Show, Efficiency).',
        ],
      },
      {
        company: 'University Student Union',
        title: 'Operations Supervisor',
        location: 'Chapel Hill, NC',
        startDate: '2021-09',
        endDate: '2022-12',
        bullets: [
          'Supervised 12 student workers managing event setups, audio-visual technical support, and facility operations for 250+ university events annually.',
        ],
      },
    ],
    education: [
      {
        school: 'University of North Carolina at Chapel Hill',
        degree: 'Bachelor of Arts',
        field: 'Communications & Business Administration',
        graduationDate: '2024',
        gpa: '3.82 / 4.0',
        honors: 'Dean’s List, National Honor Society',
      },
    ],
    certifications: ['Disney Leadership Excellence Certificate', 'American Red Cross Adult CPR/AED Certified'],
  },
  {
    id: 'chime-fintech-project-manager',
    company: 'Chime',
    companyKey: 'chime',
    brandColor: '#25C974',
    brandTextColor: '#FFFFFF',
    role: 'Senior Fintech Project Manager',
    category: 'BUSINESS',
    badge: 'PRO',
    atsScore: 98,
    experienceLevel: 'Senior / 6+ YOE',
    candidate: {
      name: 'Jessica Morales',
      title: 'Senior Technical Project Manager',
      location: 'San Francisco, CA',
      email: 'jessica.morales.pm@gmail.com',
      phone: '+1 (415) 518-9034',
      linkedin: 'linkedin.com/in/jessica-morales-pmp',
    },
    summary:
      'PMP-certified Technical Project Manager with 6+ years spearheading mobile banking features, fraud mitigation tools, and regulatory payment rollouts. Proven record of managing $8M budgets and delivering complex cross-functional sprints with zero critical milestone slippage.',
    skills: [
      { category: 'Project Management', skills: ['Agile / Scrum / Kanban', 'Sprint Planning', 'Risk Mitigation', 'Budget Oversight ($8M+)', 'Resource Allocation'] },
      { category: 'Technical & Compliance', skills: ['Fintech Regulatory Protocols (NACHA/CFPB)', 'Card Issuing (Galileo/Marqeta)', 'API Integrations', 'Jira / Confluence'] },
      { category: 'Stakeholder Leadership', skills: ['C-Suite Executive Presentations', 'Vendor Management', 'Cross-Functional Engineering Alignment'] },
    ],
    experience: [
      {
        company: 'Chime',
        title: 'Senior Technical Project Manager',
        location: 'San Francisco, CA',
        startDate: '2021-05',
        endDate: 'Present',
        current: true,
        bullets: [
          'Orchestrated end-to-end rollout of Chime Direct Deposit early-access payment enhancements, coordinating across 3 engineering squads, legal, and compliance for 3.5M active members.',
          'Reduced sprint cycle scope creep by 34% by establishing clear definition-of-done criteria, automated Jira workflow triggers, and structured stakeholder intake reviews.',
          'Managed 3rd-party banking partner integration roadmap, resolving 45+ critical regulatory compliance dependencies ahead of rigid NACHA federal deadlines.',
          'Mentored 4 associate project coordinators on agile estimation techniques, risk registers, and critical path analysis.',
        ],
      },
      {
        company: 'SoFi',
        title: 'Technical Project Manager',
        location: 'San Francisco, CA',
        startDate: '2018-06',
        endDate: '2021-04',
        bullets: [
          'Led launch of personal loan refinancing mobile application features, driving a 27% increase in digital application completion rates.',
        ],
      },
    ],
    education: [
      {
        school: 'Santa Clara University',
        degree: 'Bachelor of Science',
        field: 'Management Information Systems',
        graduationDate: '2018',
        gpa: '3.88 / 4.0',
      },
    ],
    certifications: ['Project Management Professional (PMP) - PMI', 'Certified ScrumMaster (CSM) - Scrum Alliance'],
  },
  {
    id: 'adidas-senior-project-manager',
    company: 'adidas',
    companyKey: 'adidas',
    brandColor: '#000000',
    brandTextColor: '#FFFFFF',
    role: 'Senior Project Manager (Digital Consumer Experience)',
    category: 'MARKETING',
    badge: 'PRO',
    atsScore: 97,
    experienceLevel: 'Senior / 6+ YOE',
    candidate: {
      name: 'Henrik Müller',
      title: 'Senior Digital Project Manager',
      location: 'Portland, OR / Herzogenaurach, Germany',
      email: 'henrik.mueller.pm@gmail.com',
      phone: '+1 (503) 912-4411',
      linkedin: 'linkedin.com/in/henrik-mueller-pm',
    },
    summary:
      'Senior Project Manager with 6+ years driving global omnichannel product rollouts, mobile app e-commerce initiatives, and digital supply chain initiatives for tier-1 sportswear brands. Specialist in concept-to-consumer (CtC) agile delivery.',
    skills: [
      { category: 'Product Delivery', skills: ['Concept-to-Consumer (CtC)', 'Omnichannel Retail', 'E-Commerce Localization', 'Sprint Governance'] },
      { category: 'Methodologies', skills: ['Agile / Scrum', 'Design Thinking', 'Change Management', 'Vendor Management', 'KPI Tracking'] },
      { category: 'Tools', skills: ['Jira', 'Confluence', 'Asana', 'Salesforce Commerce Cloud', 'SAP S/4HANA', 'Tableau'] },
    ],
    experience: [
      {
        company: 'adidas',
        title: 'Senior Project Manager - Digital Flagship & App',
        location: 'Portland, OR',
        startDate: '2021-03',
        endDate: 'Present',
        current: true,
        bullets: [
          'Directed the global rollout of the Confirmed App sneaker release queue system across 18 international markets, handling 4M+ concurrent shoppers during high-demand drops.',
          'Spearheaded cross-functional alignment between European design headquarters, US marketing, and Bangalore development hubs, slashing time-to-market by 22%.',
          'Managed $6.5M annual digital product project budget, maintaining variance within 2.5% of forecast across all quarterly accounting reviews.',
          'Established standardized post-launch retrospective framework, lifting team sprint velocity by 19% over 12 months.',
        ],
      },
      {
        company: 'Nike',
        title: 'Digital Project Coordinator',
        location: 'Beaverton, OR',
        startDate: '2018-05',
        endDate: '2021-02',
        bullets: [
          'Facilitated digital retail store app integrations across 40 North American flagship locations, increasing digital member scan rates by 35%.',
        ],
      },
    ],
    education: [
      {
        school: 'University of Oregon',
        degree: 'Bachelor of Science',
        field: 'Business Administration (Sports Marketing & Operations)',
        graduationDate: '2018',
        gpa: '3.84 / 4.0',
      },
    ],
    certifications: ['Certified Agile Project Manager (IAPM)', 'Scrum Product Owner (CSPO)'],
  },
  {
    id: 'sony-rotational-graduate',
    company: 'SONY',
    companyKey: 'sony',
    brandColor: '#000000',
    brandTextColor: '#FFFFFF',
    role: 'Corporate Rotational Graduate (Software & Systems)',
    category: 'STUDENT',
    badge: 'PRO',
    atsScore: 98,
    experienceLevel: 'Graduate / 0-2 YOE',
    candidate: {
      name: 'Charles Bloomberg',
      title: 'Corporate Rotational Graduate Engineer',
      location: 'San Diego, CA',
      email: 'c.bloomberg.eng@gmail.com',
      phone: '+1 (212) 791-7314',
      linkedin: 'linkedin.com/in/charles-bloomberg',
      github: 'github.com/cbloomberg-dev',
    },
    summary:
      'High-performing Graduate Software Engineer selected for Sony Global Rotational Program across PlayStation Network Services and Consumer Imaging Systems. Strong foundation in embedded C++, graphics rendering pipelines, and scalable cloud telemetry.',
    skills: [
      { category: 'Languages', skills: ['C++17', 'Python', 'C#', 'Rust', 'JavaScript', 'SQL'] },
      { category: 'Core Tech', skills: ['Vulkan', 'DirectX 12', 'Unity Engine', 'Docker', 'RESTful APIs', 'Linux Kernel Internals'] },
      { category: 'Methodologies', skills: ['Test-Driven Development (TDD)', 'Git / Perforce', 'Agile / Scrum', 'CI/CD Pipelines'] },
    ],
    experience: [
      {
        company: 'Sony Interactive Entertainment',
        title: 'Corporate Rotational Engineer - PSN Services',
        location: 'San Diego, CA',
        startDate: '2023-07',
        endDate: 'Present',
        current: true,
        bullets: [
          'Engineered microservices telemetry module in C++ and Go, ingesting 80M+ daily events from PlayStation 5 consoles with 99.99% availability.',
          'Optimized memory footprint of client networking layer by 28% through custom arena allocators and zero-copy ring buffers.',
          'Collaborated with senior architects across Tokyo and San Mateo campuses to implement OAuth 2.0 PKCE authentication flow for mobile companion applications.',
          'Automated regression testing test suite using GitHub Actions and Python, reducing release build verification from 4 hours to 35 minutes.',
        ],
      },
      {
        company: 'Sony Electronics',
        title: 'Firmware & Imaging Software Intern',
        location: 'San Jose, CA',
        startDate: '2022-05',
        endDate: '2022-08',
        bullets: [
          'Implemented RAW sensor data decompression algorithms in SIMD AVX2, boosting frame rendering speed by 34% on Alpha mirrorless camera testbenches.',
        ],
      },
    ],
    education: [
      {
        school: 'University of California, San Diego (UCSD)',
        degree: 'Bachelor of Science',
        field: 'Computer Engineering',
        graduationDate: '2023',
        gpa: '3.91 / 4.0',
        honors: 'Summa Cum Laude, Tau Beta Pi Honor Society',
      },
    ],
    projects: [
      {
        name: 'Vulkan Real-Time Raytracer',
        description: 'Cross-platform real-time path tracer written from scratch in modern C++20 and Vulkan API.',
        highlights: [
          'Implemented BVH acceleration structures and Disney BRDF shading model running at 60 FPS on RTX 4080.',
        ],
      },
    ],
  },
  {
    id: 'accenture-assistant-policy-intern',
    company: 'Accenture',
    companyKey: 'accenture',
    brandColor: '#A100FF',
    brandTextColor: '#FFFFFF',
    role: 'Assistant Policy & Technology Analyst',
    category: 'BUSINESS',
    badge: 'PRO',
    atsScore: 96,
    experienceLevel: 'Associate / 1-3 YOE',
    candidate: {
      name: 'Maya Lin',
      title: 'Technology & Public Policy Analyst',
      location: 'Washington, DC',
      email: 'maya.lin.policy@gmail.com',
      phone: '+1 (202) 555-0143',
      linkedin: 'linkedin.com/in/maya-lin-policy',
    },
    summary:
      'Technology Policy and Management Analyst with experience consulting federal and enterprise clients on digital modernization, AI governance compliance, and cloud migration frameworks. Skilled in data analytics, regulatory mapping, and executive stakeholder briefing.',
    skills: [
      { category: 'Strategy & Governance', skills: ['NIST AI RMF', 'GDPR / CCPA Compliance', 'Federal Enterprise Architecture', 'Risk Mitigation'] },
      { category: 'Analytics & Tools', skills: ['Power BI', 'Tableau', 'SQL (PostgreSQL)', 'Advanced Excel (VBA)', 'Python (Pandas)'] },
      { category: 'Consulting', skills: ['Stakeholder Management', 'Business Case Formulation', 'Process Mapping (BPMN)', 'Agile Delivery'] },
    ],
    experience: [
      {
        company: 'Accenture Federal Services',
        title: 'Assistant Policy & Technology Analyst',
        location: 'Arlington, VA',
        startDate: '2022-08',
        endDate: 'Present',
        current: true,
        bullets: [
          'Formulated comprehensive AI risk management playbook for DoD modernization program, evaluating 14 vendor LLM models against NIST governance criteria.',
          'Built automated compliance dashboard in Power BI tracking 180+ cloud modernization milestones across 6 federal agency sub-bureaus.',
          'Conducted quantitative cost-benefit analysis for $24M legacy mainframe migration, identifying $4.2M in annual recurring operational savings.',
          'Authored 45-page executive strategy whitepaper delivered to cabinet-level leadership on responsible generative AI adoption.',
        ],
      },
      {
        company: 'Brookings Institution',
        title: 'Technology Policy Research Fellow',
        location: 'Washington, DC',
        startDate: '2021-06',
        endDate: '2022-05',
        bullets: [
          'Co-authored 3 policy briefs analyzing semiconductor supply chain vulnerabilities and domestic foundry tax incentive structures.',
        ],
      },
    ],
    education: [
      {
        school: 'Georgetown University',
        degree: 'Master of Public Policy (MPP)',
        field: 'Technology Policy & Economic Analytics',
        graduationDate: '2022',
        gpa: '3.89 / 4.0',
      },
      {
        school: 'University of Virginia',
        degree: 'Bachelor of Arts',
        field: 'Economics & Foreign Affairs',
        graduationDate: '2020',
        gpa: '3.82 / 4.0',
      },
    ],
    certifications: ['Certified Information Privacy Professional (CIPP/US)', 'AWS Certified Cloud Practitioner'],
  },
  {
    id: 'ncstate-it-security-architect',
    company: 'NC State',
    companyKey: 'ncstate',
    brandColor: '#CC0000',
    brandTextColor: '#FFFFFF',
    role: 'IT Security Architect',
    category: 'ENGINEERING',
    badge: 'PRO',
    atsScore: 98,
    experienceLevel: 'Lead / 7+ YOE',
    candidate: {
      name: 'Marcus Sterling',
      title: 'Principal IT Security Architect',
      location: 'Raleigh, NC',
      email: 'm.sterling.infosec@gmail.com',
      phone: '+1 (919) 834-6290',
      linkedin: 'linkedin.com/in/marcus-sterling-sec',
    },
    summary:
      'Enterprise IT Security Architect with 7+ years designing defense-in-depth zero-trust architectures for research universities and multi-tenant cloud ecosystems. Specialist in threat modeling, SIEM engineering, automated SOAR incident response, and NIST 800-171 / CMMC compliance.',
    skills: [
      { category: 'Security Architecture', skills: ['Zero Trust Network Access (ZTNA)', 'Threat Modeling (STRIDE)', 'Public Key Infrastructure (PKI)', 'SAML / OIDC SSO'] },
      { category: 'SecOps & Detection', skills: ['Splunk Enterprise Security', 'CrowdStrike Falcon', 'Palo Alto Cortex XSOAR', 'Snort / Zeek IDS'] },
      { category: 'Cloud Security & IaC', skills: ['AWS Security Hub', 'GuardDuty', 'Terraform', 'Kubernetes NetworkPolicies', 'Vault by HashiCorp'] },
    ],
    experience: [
      {
        company: 'North Carolina State University',
        title: 'Senior IT Security Architect',
        location: 'Raleigh, NC',
        startDate: '2020-04',
        endDate: 'Present',
        current: true,
        bullets: [
          'Architected and implemented enterprise Zero Trust architecture securing 45,000+ endpoints and 120 research laboratory networks across campus.',
          'Engineered automated SOAR playbooks in Cortex XSOAR, shrinking Mean Time to Respond (MTTR) for phishing and malware incidents from 4 hours to 9 minutes.',
          'Led NIST SP 800-171 and CMMC Level 2 compliance certification for $40M DoD advanced materials research contracts with zero non-conformances.',
          'Designed high-availability Splunk cluster ingesting 2.4 TB daily log volume, with custom detection rules identifying 14 zero-day exploitation attempts.',
        ],
      },
      {
        company: 'Red Hat',
        title: 'Information Security Engineer',
        location: 'Raleigh, NC',
        startDate: '2017-06',
        endDate: '2020-03',
        bullets: [
          'Hardened OpenShift Kubernetes clusters across multi-cloud environments, writing automated OPA Gatekeeper policies for CIS benchmark compliance.',
        ],
      },
    ],
    education: [
      {
        school: 'North Carolina State University',
        degree: 'Bachelor of Science',
        field: 'Computer Science (Cybersecurity Concentration)',
        graduationDate: '2017',
        gpa: '3.86 / 4.0',
      },
    ],
    certifications: [
      'Certified Information Systems Security Professional (CISSP)',
      'Certified Cloud Security Professional (CCSP)',
      'GIAC Certified Incident Handler (GCIH)',
    ],
  },
];
