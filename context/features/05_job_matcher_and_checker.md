# Job Matcher & ATS Resume Checker — Feature Specification

**Routes**: 
* Public ATS Checker: `/tools/resume-checker` (`frontend/app/tools/resume-checker/page.tsx`)
* Deep Job Match Engine: `/app/match` (`frontend/app/app/match/page.tsx` — 22 KB)
**Backend Matching Module**: `backend/src/job-matching/*`  
**Backend Jobs Module**: `backend/src/jobs/*`  
**Status**: 🟢 Production Live (`https://resume.fourth-coffee.shop/app/match`)  

---

## 1. Overview & Problem Definition

Standard job applications often fail automated ATS screening because candidates fail to align their terminology with the exact phrasing in the Job Description (JD). However, traditional "keyword counters" encourage candidates to blindly stuff keywords into white text or nonsensical lists, which leads to immediate rejection during human recruiter review.

HyperResume's **Job Matcher** uses semantic competency extraction: it identifies the core engineering requirements, tools, and methodologies in a JD, cross-references them with evidence in the candidate's resume, and provides evidence-grounded recommendations.

---

## 2. Public ATS Resume Checker (`/tools/resume-checker`)

* **No Login Required**: Top-of-funnel lead generation tool.
* **Input**: Candidate pastes raw resume text or uploads a `.pdf` / `.docx` file.
* **Automated Diagnostics**:
  * Contact information detection (name, email, phone, location, links).
  * Section header standard compliance (verifies recognition of Experience, Education, Skills).
  * Bullet structure check (presence of action verbs, avoidance of first-person pronouns "I/me/my").
  * Quantifiable metrics ratio (checks what percentage of bullets contain numbers or metrics).
* **Instant Score**: Outputs overall ATS Readiness Score (0-100) with prioritized fix recommendations.

---

## 3. Deep Job Match Engine (`/app/match`)

In the authenticated workspace, users can match any of their existing resumes against a specific target role.

### 3.1 Two-Step Match Workflow
1. **Select Source Resume**: Dropdown of candidate's active resumes (e.g., *Alexander Sharma — TechNova Full-Stack*).
2. **Paste Job Description**: Full text input for the target job listing (e.g., *Senior Backend Engineer at Stripe*).
3. **Execute Analysis**: Clicking **"Analyze Match & Competency"** triggers `POST /api/v1/job-matching/analyze`.

### 3.2 Visual Analysis Report
The analysis produces an interactive 4-card diagnostic dashboard:

```
┌────────────────────────────────────────────────────────────────────────┐
│ MATCH SUMMARY: 88% Strong Match (Senior Backend Engineer @ Stripe)    │
├───────────────────────────────────┬────────────────────────────────────┤
│ Matched Competencies (14)         │ Missing Critical Skills (3)        │
│ ✓ TypeScript   ✓ PostgreSQL       │ ✗ Apache Kafka                     │
│ ✓ REST APIs    ✓ Docker           │ ✗ Distributed Consensus (Raft)     │
│ ✓ Redis        ✓ Microservices    │ ✗ PCI-DSS Compliance               │
│ ✓ AWS ECS      ✓ CI/CD Pipelines  │                                    │
├───────────────────────────────────┴────────────────────────────────────┤
│ Contextual Optimization Recommendations:                               │
│ 1. [Kafka]: The role emphasizes high-throughput event streaming. In   │
│    your TechNova role, you mentioned "distributed webhook delivery";   │
│    specify if you used Kafka, RabbitMQ, or SQS.                        │
│ 2. [PCI-DSS]: You built Stripe payment integrations at CloudScale;     │
│    explicitly mention adherence to PCI-DSS Level 1 security standards. │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Keyword & Competency Taxonomy

The backend engine classifies JD requirements into three distinct tiers:
1. **Hard Requirements (Must-Have)**: Explicit prerequisites (e.g., "5+ years with Go or Rust", "Experience with Kubernetes in production").
2. **Preferred Qualifications (Nice-to-Have)**: Secondary technologies (e.g., "Familiarity with Terraform", "GraphQL experience").
3. **Domain Competencies**: Methodologies (e.g., "Idempotent API design", "Zero-downtime database migrations").

---

## 5. One-Click Tailoring Flow

From the match results screen, the user can click **"Create Tailored Version for this Role"**:
* Creates a duplicate snapshot of the resume linked to that specific Job Description.
* Pre-populates recommended keyword insertions into the appropriate experience and skills sections.
* Links the tailored resume to the Job Application Tracker automatically.
