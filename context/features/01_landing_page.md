# Landing Page & Marketing Studio — Feature Specification

**Component Path**: `frontend/app/page.tsx`  
**Associated Components**: `frontend/components/home/*`  
**Status**: 🟢 Production Live (`https://resume.fourth-coffee.shop/`)  

---

## 1. Overview & Business Objective

The HyperResume Landing Page is engineered to convert job-seeking professionals by establishing immediate credibility, demonstrating technical rigor, and visually debunking gimmicky AI resume spin. Rather than making unsubstantiated claims, the page walks candidates through transparent ATS parsing requirements, live interactive simulations, and evidence-grounded scoring.

---

## 2. Key Sections & Component Architecture

### 2.1 Hero Section & Interactive Hero Studio
* **Component**: `frontend/components/home/InteractiveHeroStudio.tsx`
* **Features**:
  * **Dual-State Simulator**: Allows visitors to toggle between a "Generic Weak Resume" and an "Optimized STAR Resume".
  * **Real-Time Score Meter**: Dynamically shifts score from 42/100 (Red) to 94/100 (Emerald) as visitor toggles between states.
  * **Interactive Bullet Breakdown**: Displays before-and-after comparisons:
    * *Before*: "Helped with website redesign and fixed bugs."
    * *After*: "Spearheaded frontend overhaul using Next.js and TypeScript, cutting TTFB by 42% and raising conversion by 18% across 1.2M monthly users."
  * **Direct Conversion CTAs**: "Build My Resume — Free" (`/login`) and "Try Free ATS Checker" (`/tools/resume-checker`).

### 2.2 Company Logo Cloud
* **Component**: `frontend/components/home/CompanyLogoCloud.tsx`
* **Features**:
  * Showcases high-resolution monochrome and brand SVGs of top companies where users have landed offers (Google, Meta, Amazon, Apple, Netflix, Microsoft, Stripe, OpenAI).
  * Smooth infinite-scroll marquee with hover pause.

### 2.3 ATS Compatibility Cloud
* **Component**: `frontend/components/home/AtsCompatibilityCloud.tsx`
* **Features**:
  * Highlights verified compatibility with top enterprise Applicant Tracking Systems:
    * **Workday** (Clean text layer, strict single-column flow)
    * **Greenhouse** (Semantic section tags, standard contact headers)
    * **Lever** (UTF-8 encoding, zero floating graphics)
    * **Taleo / Oracle** (No nested tables, clean chronological work history)
    * **BambooHR & iCIMS** (Standardized dates `Month YYYY` and job title recognition)
  * Explains *why* two-column canvas designs and floating tables cause 75% of ATS rejections.

### 2.4 Rezi-Style 100-Point Score Feature Section
* **Component**: `frontend/components/home/ReziStyleScoreFeatureSection.tsx`
* **Features**:
  * An interactive breakdown of HyperResume's 4-factor scoring rubric:
    1. **Content Quality (30 pts)**: Presence of quantifiable metrics, STAR formula structure, strong action verbs.
    2. **Formatting & Structure (25 pts)**: Standardized headers, bullet length optimization (1-2 lines), margin bounds.
    3. **Keyword Competency (25 pts)**: Mapping of required skills from the job description without keyword stuffing.
    4. **Contact & Metadata Completeness (20 pts)**: LinkedIn, GitHub, email, phone, location formatting.
  * Interactive tabs allowing visitors to explore each scoring category with live diagnostic examples.

### 2.5 Product Workflow Preview
* **Component**: `frontend/components/home/ProductWorkflowPreview.tsx`
* **Features**:
  * Visual 3-step pipeline illustrating the core user journey:
    * **Step 1: Input Career Facts**: Add verified employment history, degrees, and technologies.
    * **Step 2: Evidence-Backed Optimization**: AI assists in structuring raw achievements into quantifiable impact.
    * **Step 3: Export ATS-Compliant PDF**: One-click download of vector-standard, selectable-text PDFs.

### 2.6 Interactive Template Showcase
* **Component**: `frontend/components/home/InteractiveTemplateShowcase.tsx`
* **Features**:
  * Live carousel featuring our ATS-optimized document layouts (Classic Tech, Executive Modern, Minimalist, Engineering Standard).
  * "Preview Template" modal opening realistic high-resolution previews.

### 2.7 System Status Badge & Uptime Monitor
* **Component**: `frontend/components/home/SystemStatusBadge.tsx`
* **Features**:
  * Real-time heartbeat indicator showing system status: `Operational (14ms latency)`.
  * Demonstrates high availability and production readiness to enterprise users.

### 2.8 Editorial FAQ Accordion
* **Location**: Directly integrated into `page.tsx`
* **6 Key FAQs Addressed**:
  1. *How parser compatibility is ensured* (strict single-column, UTF-8, no floating tables).
  2. *Zero-hallucination policy* (AI clarifies candidate facts; never fabricates fake companies or fake degrees).
  3. *Multi-resume management* (version snapshots for each unique job application).
  4. *Competency matching vs keyword stuffing* (semantic matching rather than dumb word-frequency counting).
  5. *Free PDF export policy* (unwatermarked, selectable-text vector PDFs are 100% free).
  6. *Data privacy guarantees* (resumes stored in isolated private storage; never sold or used for model training).

---

## 3. SEO & Metadata Implementation

* **Title**: `HyperResume — Free AI Resume Builder & ATS Resume Checker`
* **Meta Description**: `Create ATS-compliant resumes tailored to real job descriptions. Strict evidence-grounding, standard single-column formats, and zero hallucination.`
* **OpenGraph**: Configured in `frontend/app/layout.tsx` with dynamic title, canonical URL (`https://resume.fourth-coffee.shop`), and high-resolution banner.
* **Semantic HTML**: Hierarchical `<h1>`, `<h2>`, `<section>`, `<article>`, and accessibility tags (`aria-expanded`, `aria-label`).
