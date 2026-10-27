# Sample Resume Library & ATS Benchmarks — Feature Specification

**Routes**: 
* Public Surface: `/examples` (`frontend/app/examples/page.tsx`)
* Authenticated Workspace: `/app/samples` (`frontend/app/app/samples/page.tsx`)
**Primary Components**: `frontend/components/samples/*`  
**Data Repository**: `frontend/data/sample-resumes.ts` (81,539 bytes)  
**Status**: 🟢 Production Live (`https://resume.fourth-coffee.shop/examples`)  

---

## 1. Overview & Purpose

The **Sample Resume Library** provides job seekers with 21 high-density, real-world ATS benchmark resumes reverse-engineered from verified offers at top tech, finance, and enterprise firms. Every resume strictly satisfies single-column ATS parsing criteria, contains zero filler or lorem-ipsum placeholder text, and demonstrates concrete STAR/XYZ impact metrics.

---

## 2. Benchmark Resume Portfolio (21 Companies)

| Company | Role Title | ATS Score | Experience Level | Key Focus Areas |
| :--- | :--- | :---: | :--- | :--- |
| **TechNova** (Flagship) | Full-Stack Software Engineer | **97/100** | Mid-Senior (3+ yrs) | TypeScript, React, Next.js, Node.js, PostgreSQL, Distributed Jobs |
| **Amazon** | Principal Solutions Architect | **96/100** | Principal (10+ yrs) | AWS Serverless, Cloud Migration, Enterprise Well-Architected |
| **Google** | Staff Distributed Systems Engineer | **98/100** | Staff (8+ yrs) | Spanner, Kubernetes, Go, Multi-Region Consensus |
| **Meta** | Senior Frontend Platform Engineer | **97/100** | Senior (6+ yrs) | React Server Components, GraphQL, Performance, Webpack/Turbopack |
| **Apple** | Senior CoreOS Systems Engineer | **96/100** | Senior (7+ yrs) | Swift, Metal, Embedded C++, Memory Management, Darwin Kernel |
| **Netflix** | Senior Site Reliability Engineer | **98/100** | Senior (6+ yrs) | Chaos Engineering, Spinnaker, Telemetry, Linux Kernel Tuning |
| **Microsoft** | Principal Cloud Architect | **95/100** | Principal (9+ yrs) | Azure Kubernetes, Microservices, Enterprise Identity |
| **Stripe** | Senior FinTech Infrastructure Engineer| **98/100** | Senior (6+ yrs) | Idempotent APIs, Double-Entry Ledgers, PCI-DSS, Ruby/Go |
| **OpenAI** | Senior ML Infrastructure Engineer | **99/100** | Senior (5+ yrs) | Distributed GPU Clusters, Slurm, PyTorch, Model Checkpointing |
| **Uber** | Lead Backend Platform Engineer | **96/100** | Lead (7+ yrs) | Geospatial Dispatch, Ringpop, Kafka, Low-Latency Go |
| **Airbnb** | Senior Full-Stack Product Engineer | **95/100** | Senior (5+ yrs) | Design Systems, Checkout Flow, GraphQL, Next.js |
| **NVIDIA** | Senior GPU Systems Engineer | **97/100** | Senior (6+ yrs) | CUDA, TensorRT, C++, Kernel Optimization, Deep Learning |
| **Databricks** | Senior Data Infrastructure Engineer | **96/100** | Senior (6+ yrs) | Apache Spark, Delta Lake, Scala, Query Optimization |
| **Snowflake** | Senior Database Engine Engineer | **97/100** | Senior (7+ yrs) | Vectorized Execution, C++, Columnar Storage, ACID |
| **Spotify** | Senior Event-Driven Backend Engineer | **95/100** | Senior (5+ yrs) | Kafka Streams, Java, Microservices, Audio Ingestion |
| **Salesforce** | Principal Multi-Tenant Platform Architect| **95/100** | Principal (10+ yrs)| Multi-Tenant Metadata, Apex, Zero-Downtime Releases |
| **ByteDance** | Senior Recommendation Systems Engineer| **97/100** | Senior (6+ yrs) | Real-time CTR Prediction, High-Throughput Ranking, C++ |
| **Palantir** | Lead Forward Deployed Engineer | **96/100** | Lead (7+ yrs) | Foundry Ontology, Secure Data Integration, TypeScript |
| **Coinbase** | Senior Blockchain Infrastructure Engineer| **96/100** | Senior (5+ yrs) | MPC Key Custody, EVM Nodes, Rust, High-Value Settlement |
| **Adobe** | Senior WebAssembly Performance Engineer| **95/100** | Senior (6+ yrs) | WebAssembly, WebGL, C++, Creative Cloud Web App |
| **Tesla** | Senior Embedded Autopilot Engineer | **98/100** | Senior (7+ yrs) | Real-Time Embedded C++, CAN Bus, Computer Vision, Safety |

---

## 3. Flagship Resume Spotlight: Alexander Sharma

The **Alexander Sharma** resume (`tech-nova-full-stack`) was hand-engineered to serve as the gold standard for full-stack developers. It eliminates all whitespace and delivers maximum information density:

* **Professional Summary**: 3+ years full-stack experience in TypeScript, React, Next.js, Node.js, and PostgreSQL. Experienced in distributed jobs, auth, and cloud applications.
* **3 Progressive Roles (22 Total STAR Bullets)**:
  1. *Full-Stack Engineer at TechNova Solutions* (2023 - Present):
     - Engineered distributed webhook delivery microservice handling 4.8M daily events with 99.98% delivery rate.
     - Architected multi-tenant role-based access control (RBAC) using PostgreSQL Row-Level Security (RLS).
     - Reduced frontend bundle size by 38% and First Contentful Paint by 450ms.
     - Built Redis caching layer reducing database read queries by 64%.
  2. *Software Engineer at CloudScale Systems* (2021 - 2023):
     - Developed RESTful microservices in Node.js and TypeScript serving 850k monthly active users.
     - Designed automated database migration pipeline preventing downtime during schema updates.
     - Implemented Stripe payment gateway supporting multi-currency recurring subscriptions.
  3. *Junior Software Developer at ByteCraft Technologies* (2020 - 2021):
     - Built responsive client dashboards using React and Tailwind CSS.
     - Automated end-to-end testing with Playwright, raising test coverage from 34% to 82%.
* **3 Production Projects**:
  1. *DevFlow CI/CD Automation CLI*: Rust and Go CLI tool reducing container deployment times by 40%.
  2. *Enterprise Pulse Analytics Platform*: Real-time analytics dashboard processing 250k events/sec.
  3. *HyperCache In-Memory Key-Value Store*: Lightweight Redis clone with LRU eviction and snapshot persistence.
* **8 Skill Classifications**: Languages, Frontend, Backend, Cloud & DevOps, Databases, Architecture, Testing, Tools.
* **Education & Certifications**: B.Tech in Computer Science, AWS Certified Solutions Architect - Associate, Certified Kubernetes Administrator (CKA).

---

## 4. UI Architecture & Features

### 4.1 Search & Dynamic Filter System (`SampleLibraryView.tsx`)
* **Real-Time Search Bar**: Instant client-side filtering matching across role title, company name, skills, and summary keywords.
* **Unified Filter Pills**:
  * 9 Curated Filters: `All (21)`, `Frontend`, `Backend`, `Full-Stack`, `Cloud & DevOps`, `Machine Learning`, `Data Engineering`, `Systems & Low-Level`, `Security & Blockchain`.
  * Fully unified design tokens: avoids harsh black backgrounds in light mode. Light mode uses `bg-white text-zinc-600 border-zinc-200`; dark mode uses `bg-[#14171C] text-zinc-400 border-zinc-800`. Active pill uses high-contrast `#1A1D23` or `#285FEA`.

### 4.2 High-Contrast Card Grid (`SampleResumeCard.tsx`)
* 4-column responsive grid on desktop (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`).
* Displays:
  * Adaptive `CompanyBrandBadge` (auto-adjusts monochrome logos in dark mode).
  * Green ATS score badge (`95-99% ATS Pass`).
  * Role title and target level.
  * 3 key tech stack tags.
  * Direct action buttons: "Quick View" and "Clone Template".

### 4.3 True A4 Document Canvas Modal (`SampleResumeModal.tsx`)
* **Sleek Action Buttons Header**:
  * `Copy Text`: Copies complete formatted plaintext directly to clipboard with visual feedback.
  * `Print / PDF`: Triggers browser native print dialog with `@media print` rules for clean paper output.
  * `Use This Template`: Primary action button cloning the resume into the user's workspace.
* **Eliminated Redundant Bottom Bar**: Completely removed the old 80px bottom bar, expanding document reading area by 18%.
* **Standard A4 Paper Canvas**: Dimensions set to `min-h-[1140px] max-w-[840px]`, floating with realistic dropshadows atop a neutral desk surface (`#EDF0F3` light / `#0B0D11` dark).

---

## 5. Clone-to-Workspace Integration

When an authenticated user clicks **"Use This Template"**:
1. Frontend calls `apiClient.createResumeFromSample(sampleId)`.
2. Backend duplicates the structured sample payload into the user's `resumes` database table with a new UUID.
3. Automatically assigns ownership to the current user's session.
4. Redirects candidate directly into `app/app/resumes/[newResumeId]` with all 22 STAR bullet points ready for customization.
