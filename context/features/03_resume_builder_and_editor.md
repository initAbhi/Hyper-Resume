# Resume Builder & Studio Editor — Feature Specification

**Routes**: 
* Resume Overview: `/app/resumes` (`frontend/app/app/resumes/page.tsx`)
* Deep Resume Studio: `/app/resumes/[resumeId]` (`frontend/app/app/resumes/[resumeId]/page.tsx` — 71 KB)
**Preview Canvas**: `frontend/components/resumes/AtsResumeDocument.tsx` (32 KB)  
**Score Engine**: `frontend/components/resumes/ScoreMeter.tsx`  
**Status**: 🟢 Production Live (`https://resume.fourth-coffee.shop/app/resumes`)  

---

## 1. Overview & Core Philosophy

The **Resume Builder & Studio Editor** is the central productivity hub of HyperResume. Unlike legacy editors that offer free-form rich text where users accidentally break ATS formatting, HyperResume enforces a structured data model. Every section, role, and bullet point is stored as typed JSON schema that compiles deterministically into a 100% ATS-compliant single-column layout.

---

## 2. Editor Layout & Workspace Architecture

The Studio is architected into a split-pane workstation:
* **Left Pane (50% Desktop)**: Structured Form Editor with Section Tabs, STAR Bullet Assistant, and ATS Diagnostic Warnings.
* **Right Pane (50% Desktop)**: Real-Time High-Fidelity A4 Paper Preview (`AtsResumeDocument`), updating keystroke-by-keystroke.

```
┌────────────────────────────────────────────────────────────────────────┐
│ Top Bar: Title | ATS Score: 94/100 | Save Status | PDF Export | Revert │
├───────────────────────────────────┬────────────────────────────────────┤
│ Form Section Tabs:                │ A4 Document Paper Canvas:          │
│ [Contact] [Summary] [Experience]  │                                    │
│ [Skills]  [Projects] [Education]  │ ┌────────────────────────────────┐ │
│                                   │ │ ALEXANDER SHARMA               │ │
│ Current Section: Work Experience  │ │ Software Engineer              │ │
│ ───────────────────────────────── │ │ Bengaluru · alex@email.com     │ │
│ Company: TechNova Solutions       │ │ ────────────────────────────── │ │
│ Title: Full-Stack Engineer        │ │ PROFESSIONAL SUMMARY           │ │
│ Dates: Jan 2023 - Present         │ │ ...                            │ │
│                                   │ │ EXPERIENCE                     │ │
│ Bullet 1:                         │ │ TechNova Solutions             │ │
│ [Architected distributed ...]     │ │ • Architected distributed ...  │ │
│ [✨ Optimize with STAR]           │ │ • Built Redis caching ...      │ │
│                                   │ └────────────────────────────────┘ │
└───────────────────────────────────┴────────────────────────────────────┘
```

---

## 3. Data Schema & Section Modules

The resume data model is strictly typed in `backend/src/resumes/entities/resume.entity.ts`:

### 3.1 Personal Contact Information
* `fullName`: Candidate's legal or professional name.
* `headline`: Target role title (e.g., *Staff Software Engineer \| Distributed Systems*).
* `email`, `phone`, `location`: Standard contact fields parsed by ATS headers.
* `links`: Array of verified social/portfolio URLs (`github`, `linkedin`, `portfolio`, `twitter`).

### 3.2 Professional Summary
* 3 to 5 sentence high-impact summary emphasizing years of experience, core tech stack, and primary career achievements.

### 3.3 Work Experience (Core Focus)
* For each employment record:
  * `company`: Employer name.
  * `title`: Official job title.
  * `location`: City, State/Country or "Remote".
  * `startDate` & `endDate`: Standardized month/year strings (`Jan 2023`, `Present`).
  * `bullets`: Array of achievement strings.

### 3.4 STAR / XYZ Bullet Optimizer
Users can highlight or enter any draft bullet point and click **"✨ Optimize with STAR"**:
* **Input**: *"Helped speed up database queries."*
* **AI Engine Analysis**:
  * Action Verb Missing: Replace passive "helped" with "Optimized" or "Architected".
  * Metric Missing: Introduce quantifiable performance metric.
  * Technology Missing: Identify indexing or caching mechanism.
* **Output Suggestion**: *"Optimized PostgreSQL query performance across 14 high-traffic tables by introducing composite indexes and connection pooling, reducing p99 latency from 450ms to 65ms (85% improvement)."*

### 3.5 Skills Categorization
To prevent parsing confusion, skills are grouped into logical domains:
* `Languages`: TypeScript, Python, Go, Rust, Java, SQL, C++.
* `Frameworks & Frontend`: React, Next.js, Node.js, Tailwind CSS, GraphQL.
* `Cloud & DevOps`: AWS (EC2, S3, ECS, Lambda), Docker, Kubernetes, Terraform, GitHub Actions.
* `Databases & Storage`: PostgreSQL, Redis, MongoDB, Elasticsearch, Kafka.

### 3.6 Projects & Education
* `Projects`: Name, live URL, GitHub repo, tech stack tags, and 2-3 impact bullets.
* `Education`: Degree, institution, graduation year, relevant coursework, honors/GPA.
* `Certifications`: Credential name, issuing body, date, credential ID.

---

## 4. Real-Time ATS Score Engine (`ScoreMeter.tsx`)

The editor recalculates an ATS compatibility score in real-time as fields are modified:

| Evaluation Factor | Weight | Scoring Logic |
| :--- | :---: | :--- |
| **Contact Completeness** | 15% | +5 name, +3 valid email, +3 phone, +2 location, +2 LinkedIn link |
| **Experience Density** | 35% | Checks for minimum 3 roles, minimum 3-5 bullets per role, presence of action verbs |
| **Quantifiable Metrics** | 20% | Scans for numbers, percentages, dollar signs, throughput metrics in bullets |
| **Skills Coverage** | 15% | Minimum 8 recognized technical skills mapped to standard taxonomy |
| **Format & Length** | 15% | Page height constraint check (prevents awkward 1.2 page spillover) |

---

## 5. Export Engine & PDF Fidelity

* **Vector Text PDF**: Uses `@media print` CSS directives and browser print drivers to generate clean vector PDFs where all text is selectable and searchable.
* **Zero Floating Elements**: Eliminates HTML `<canvas>`, multi-column `float`, and absolute coordinates, guaranteeing 100% text parsing by Workday, Greenhouse, and Lever.
* **One-Click Plain Text Copy**: Generates clean Markdown/Plaintext representation for direct copy-pasting into legacy ATS job application forms.
