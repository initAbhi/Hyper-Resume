# Product Analysis — HyperResume / HypeResume

> **Audit Date:** November 11, 2026 (Updated & Remediated November 12, 2026)  
> **Methodology:** Initial read-only audit of `/frontend` & `/backend`, followed by P0–P2 remediation & pricing unification verified via backend (`29` test files, `166` tests) and frontend (`17` test files, `85` tests + Next 16 build) on 2026-11-12.  
> **Scope Note:** All statements below reflect verified current codebase state as of 2026-11-12.

---

## 1. Architecture & Technical Stack Overview

* **Frontend:** Next.js 16 (App Router), React, TypeScript, Tailwind CSS. Default SEO metadata lives in [`frontend/app/layout.tsx`](../../frontend/app/layout.tsx) and [`frontend/lib/seo.ts`](../../frontend/lib/seo.ts).
* **Backend:** NestJS 12 REST API under `/api/v1` with TypeORM + PostgreSQL (`users`, `user_sessions`, `candidate_profiles`, `resumes`, `resume_versions`, `resume_analyses`, `resume_adaptations`, `resume_shares`, `resume_share_events`, `job_descriptions`, `job_matches`, `job_applications`, `cover_letters`, `linkedin_audits`, `interview_sessions`, `interview_questions`, `interview_turns`, `credit_ledger`, `payments`, `system_settings`).
* **AI Layer:** `GeminiAiProvider` (`backend/src/ai/providers/gemini-ai.provider.ts`, default `gemini-3.1-flash-lite` with fallback chain `3.1-flash-lite -> 3.6-flash -> 3.5-flash-lite`) and `GeminiInterviewProvider` (default `gemini-3.5-flash-lite`, 8.5s timeout), plus deterministic `MockAiProvider` and `AI_MODEL_PRICING_REGISTRY` (`2026-Q1`).
  * *Runtime Note:* `env.validation.ts` defaults `AI_PROVIDER = 'mock'` and `PAYMENT_PROVIDER = 'sandbox'` unless configured in environment variables (`AI_PROVIDER=gemini` + API key).
* **Document Rendering & Parsing:** Server-side `puppeteer-core` headless Chromium tagged vector PDF generation (`pdf-parse-fork` extractability verification), native `docx` OOXML generation (`mammoth` verification), `pdf-lib` + `sharp` two-pass PDF image raster compression (up to 30MB -> <=10MB), and custom LinkedIn PDF sidebar-vs-body parser.
* **Payments & Tracking:** Dodo Payments SDK (`dodopayments`, **INR + USD multi-currency**, admin-switchable `test_mode` / `live_mode`, gateway-verified settlement + Standard Webhooks HMAC enforcement), fail-closed `RazorpayPaymentProvider`, `SandboxPaymentProvider`, plus env-driven Meta Pixel (`NEXT_PUBLIC_FACEBOOK_PIXEL_ID`), Meta Conversions API (`v21.0` w/ `clientIp`/`clientUserAgent`), and first-party `AnalyticsModule` (`analytics_events`).

---

## 2. Actual Product Capabilities (10 Integrated Modules)

Contrary to outdated October status snapshots (`status/PROJECT_STATUS_REPORT.md` claiming 4 templates and `window.print()`), the live application implements 10 distinct modules:

### Module 1: Evidence-Grounded Core & Anti-Hallucination Engine
Located in `backend/src/ai/utils/factual-integrity-validator.ts`, `writing-quality-rules.ts`, and `ats-audit-engine.ts`:
* **`validateAndSanitizeMetrics()`:** Scans adapted text for numeric metrics (`%`, `$`, `+`, `ms`, `x`, `k/m/b`, standalone numbers) and semantic scale claims (`doubled`, `tripled`, `quadrupled`, `halved`, `millions of`, `2x/3x/5x/10x`, `cut latency by`). Any invented metric not present in `originalText` is deterministically replaced in-place with **`"[Confirm measurable impact: e.g. latency reduction or scale]"`** and flagged in warnings.
* **`validateAndReconstructAdaptation()`:** Quarantines sample company names and project names (`benchmark.experience[].company`, `benchmark.projects[].name`) so benchmark names cannot leak into a user's tailored resume; preserves `contact`, `education`, `certifications`, `skills`, and `experience` dates/titles/companies verbatim from the user's real resume; isolates `recommendedBenchmarkSkills` from owned `skills`.
* **Evidence-Cited Job Matching:** Categorizes every JD requirement into `supported` (backed by verbatim `evidenceQuotes` from the user's bullets), `needs_confirmation` (listed in Skills without experience/project proof), `not_evidenced`, or `not_applicable`.
* **Important Remediation Note (2026-11-12):** Programmatic `validateAndSanitizeMetrics()` is now applied across AI rewrite/bullet/summary/adapt endpoints, Cover Letters (`cover-letters.service.ts`), LinkedIn Optimizer (`linkedin.service.ts`), and `job-matches/:id/tailor-resume`, alongside `CreditsService.consumeFeatureAccess()` entitlement checks and atomic failure refunds.

### Module 2: Deterministic + AI 5-Dimension ATS Audit & Writing Checker
* **Weights (`ats-audit-engine.ts`):**
  1. Formatting & Hierarchy (**25%**)
  2. Quantified Metrics & Impact (**25%**)
  3. Action Verb Dominance (**20%**)
  4. Technical Depth & Stack Alignment (**15%** — cross-checks skills listed vs. actual bullets/projects)
  5. Brevity & Information Density (**15%** — integrates deterministic `writing-quality-rules.ts` checking 84+ spelling typos, passive openers like `responsible for`, first-person pronouns except `I/O`, tense errors on past roles, duplicate words, `a/an` grammar, lowercase bullet openers preserving `eBPF`/`iOS`/`gRPC`/`p95`, and 14 buzzwords).
* Exposed inside the editor (`FixMistakesDrawer`, `AtsAuditBreakdown`) and publicly without login on `/tools/resume-checker` and `/tools/resume-score`.

### Module 3: Structured Resume Builder, 10 Templates & Verified Exports
* **Dashboard & Workspace (`/app/resumes`, `/app/resumes/[resumeId]`):** Split form-and-A4-canvas editor with Optimistic Concurrency Control (`expectedVersion`), `VersionHistoryDrawer` (snapshot save/restore), `SectionRearrangeDrawer`, `DesignPanel` (8 accent swatches, `sans`/`serif`/`mono` typography, page size/margin/density controls), `PhotoUploadModal`, `SectionRewriterDialog` (5 tones: `executive`, `impact`, `concise`, `technical`, `expand`), and `CheckAndTailorDrawer`.
* **10 Live Builder Templates (`frontend/components/resumes/templates/index.ts`):**
  * Single-column / classic / modern: `jake-ats` ("Jake's Resume"), `awesome-cv` ("Awesome CV"), `executive` ("Executive Leader"), `ivy-league` ("Ivy League"), `crest` ("Crest"), `clean-modern` ("Modern Tech"), `classic-ats` ("Classic ATS").
  * Two-column: `deedy` ("Deedy Pro"), `double-column` ("Double column"), `elegant` ("Elegant" / `SidebarTemplate`).
* **PDF & DOCX Exports (Free on all tiers):**
  * `PdfExportService` renders DOM HTML/CSS via headless Chromium with `{ tagged: true }`, SSRF filtering, and `pdf-parse-fork` verification reporting `atsVerified` and `extractableWords` (`ExportPdfModal.tsx`), plus browser print fallback.
  * `DocxExportService` builds native OOXML server-side from DB `Resume.content` and verifies via `mammoth.extractRawText`.

### Module 4: Benchmark Sample Library & "Adapt to My Profile"
* **Dataset (`frontend/data/sample-resumes.ts`):** **82 benchmark resumes** (`79 PRO`, `3 VERIFIED`) across **78 companies** (Google, Meta, Apple, AWS, Stripe, OpenAI, Databricks, Goldman Sachs, Deloitte, etc.), **12 categories** (`SOFTWARE_ENGINEERING: 15`, `DATA_AI: 8`, `PRODUCT_BUSINESS: 8`, `DEVOPS_CLOUD: 7`, `FINANCE_BANKING: 7`, `MARKETING_SEO: 7`, `DESIGN_UX: 6`, `HEALTHCARE: 6`, `STUDENT_FRESHER: 5`, `SALES_HR: 5`, `CORE_ENGINEERING: 4`, `LEGAL: 4`), and **6 countries** (`US: 45`, `UK: 12`, `India: 8`, `Canada: 7`, `Germany: 5`, `Singapore: 5`).
* **Workflows:** Visitors/users inspect full A4 samples at `/examples` or `/app/samples`, clone full/starter skeletons (`Use Full Template`), or click **`Adapt With My Profile` (3 Credits)** to map their real career history onto the sample's structure with diff review (`AdaptationComparisonModal`) before applying.
* **SEO Guides (`/examples/[role]`):** 6 static role guides (`software-engineer`, `backend-developer`, `frontend-developer`, `full-stack-developer`, `devops-engineer`, `fresher`).

### Module 5: Live Multi-Board Job Discovery & Application Pipeline
* **Live Job Discovery (`/app/job-search`, `backend/src/job-discovery/`):** Fetches **real live postings** via public ATS APIs (10-min cache, 15s timeout):
  * **Ashby** (defaults: `linear`, `notion`)
  * **Greenhouse** (defaults: `stripe`, `figma`; plus `vercel`, `datadog` chips & custom board lookup)
  * **Lever** (custom / `spotify`)
  * **Remotive** & **Arbeitnow**
  * Deterministic `computeResumeJobFit()` overlap score + matched/missing pills, 1-click `Save to Tracker`, and `Match CV`. Only displays `Offline Fallback Feed` (2 jobs) if all remote providers fail.
* **Job Match (`/app/match`):** Creates persisted `JobMatch`, shows evidence-verified fit gaps, generates tailoring suggestions, and spawns tailored resume variants (`/app/resumes/[id]?tailor=1`).
* **Applications Tracker (`/app/applications`):** Live Table + Kanban CRUD workspace packing salary, location, excitement rating, interview rounds, contacts, JD text, checklist, and 4 static outreach email templates.

### Module 6: AI Mock Interview Studio (`/app/interview`)
* **Modes (`interviews.service.ts`):**
  * `quick_practice` (`2 Credits`, 3 questions; unpaid users get 1 trial tracked by unique DB index `idx_one_free_trial_per_user`, paid out of welcome balance).
  * `full_mock` (`5 Credits`, 5 questions, paid users only).
  * `weak_area` (`3 Credits`, 5 questions, paid users only).
* **Capabilities:** Grounded in selected resume + optional JD via `buildInterviewContextDossier`; live question timer; browser Web Speech API dictation (`SpeechRecognition`); turn-by-turn evaluation (`starScore`, `technicalScore`, `relevanceScore`, `clarityScore`), `idealAnswerDraft`, adaptive follow-ups, printable scorecard.
* **Monetization Hook:** Unpaid users get Q1's `idealAnswerDraft` unlocked on the report, while Q2+ (`idx > 0`) display `"Personalized Model Answer Locked for Pro"` linking to `/pricing`.

### Module 7: Cover Letter Studio (`/app/cover-letters`)
* Persisted DB module (`cover_letters`) linked to resumes/job matches; 4 tones (`Executive`, `Technical`, `Enthusiastic`, `Concise`), 3 A4 visual templates (`executiveSplit`, `modern`, `classic`), 5 accent colors, section-by-section regeneration (`opening`, `body`, `closing`, `all`), autosave, plain-text copy, and verified vector PDF + native OOXML DOCX exports. **Now enforces `1` credit for free users (or unlimited under active HypeResume Pro) via `CreditsService.consumeFeatureAccess`.**

### Module 8: LinkedIn Profile Optimizer (`/app/linkedin`)
* **Dedicated LinkedIn PDF Parser (`linkedin-pdf-parser.util.ts`):** Detects exported LinkedIn PDFs, splits sidebar metadata from main experience body, removes spoken languages (`KNOWN_SPOKEN_LANGUAGES`) from skill extraction, checks custom `/in/` slug hygiene, and imports into Resume/CandidateProfile.
* **6-Category Scoring (`/100`):** Headline SEO (`/20`, `220`-char meter), About Narrative & `265`-char `...see more` Fold Hook (`/25`, `2,600`-char meter), Experience Impact (`/25`), Skills Taxonomy (`/15`), Completeness & URL Hygiene (`/10`), Contact & Featured Link (`/5`). Generates 5 Headline variants, 3 About drafts, bullet rewrites, gap list, and 1-click workspace sync. **Now enforces `1` credit for free users (or unlimited under active HypeResume Pro).**

### Module 9: Recruiter Share Links (`/r/[slug]`) & Analytics
* Generates trackable public URL `https://hype-resume.com/r/<slug>` with custom slugs, expiration presets (`never`/days), PDF/DOCX download toggles, `hideContactDetails` mask, optional recruiter note, and event analytics (`view` w/ 3s deduplication, `download_pdf`, `download_docx`, `print`, `contact_click`).

### Module 10: Free Public No-Login Acquisition Tools (`/tools/*`)
* `/tools/resume-checker` — Paste or upload PDF/DOCX (`<=10MB`) or trigger consented **30MB-to-10MB browser/server compression** flow + full 5-dimension ATS audit + 84-rule writing audit (IP limit: 10 req/10 min).
* `/tools/job-match` — Paste resume + JD for instant evidence-cited requirement breakdown (IP limit: 15 req/10 min).
* `/tools/bullet-improver` — Rewrite passive bullets or generate role-specific STAR/XYZ bullets with zero-fabrication badge (IP limit: 15 req/10 min).
* `/tools/resume-score` — Interactive scorer & transparent breakdown of the 5 audit weights (`25/25/20/15/15%`).

---

## 3. Actual User Journey & Monetization Audit (Updated 2026-11-12)

```text
Visitor -> Lands on `/` (`HypeResume`, dark #090A10 / violet #5525F5 w/ Founding Lifetime banner)
        -> OR lands via SEO on `/tools/*` or `/examples/*` (solid white Navbar)
        -> Hero & Navbar CTAs ("Build My Resume", "Get Started") route directly to `/register`
        -> Registers at `/register` (preserving ?redirect, ?plan, ?currency, ?template) -> gets 5 welcome credits
        -> Uses Editor (10 templates + Certifications tab), Free unwatermarked PDF/DOCX exports, Deterministic Writing Check
        -> Consumes 1–5 credits on AI features (or bypasses credit caps completely with Active HypeResume Pro)
        -> Clicks Upgrade -> chooses 1-Week (₹149/$3), Monthly (₹399/$9), 6-Month (₹1,200/$29), or Founding Lifetime (₹999/$19)
        -> Pays via Dodo Checkout (INR or USD, test_mode / live_mode) -> Gateway-verified Settlement + Meta Pixel & CAPI `Purchase`
```

### Canonical Unified Pricing (`PricingSection.tsx` = `/pricing` = `pricing-plans.ts` = `terms/page.tsx`)

| Tier / Plan ID | INR Price | USD Price | Access / Entitlements |
| :--- | :--- | :--- | :--- |
| **Free Starter** | **₹0** | **$0** | **5 welcome AI credits**, all **10 ATS templates**, unlimited **unwatermarked vector PDF & OOXML DOCX** exports, 4 free public `/tools/*` utilities |
| **`pro_weekly` (1 Week Pass)** | **₹149** (`14900`) | **$3** (`300`) | **7 days** unlimited HypeResume Pro AI access (Tailoring, Sample Adapt, Cover Letters, LinkedIn Studio, Mock Interviews, PDF Compression) |
| **`pro_monthly` (Monthly Plan)** | **₹399** (`39900`) | **$9** (`900`) | **30 days** unlimited HypeResume Pro AI access (`Best Flexibility`) |
| **`pro_6month` (6 Months Plan)** | **₹1,200** (`120000`) | **$29** (`2900`) | **180 days** unlimited HypeResume Pro AI access (`₹200/mo`) |
| **`pro_lifetime` (Founding Lifetime Offer)** | **₹999** (`99900`) | **$19** (`1900`) | **Permanent lifetime HypeResume Pro access** (`isLifetimePro: true`), one-time payment (never auto-renews), capped by real PostgreSQL `GET /api/v1/payments/promo-status` seat limit (default `10` seats, admin-configurable) |

### Enforced Credit & Pro Entitlements (`backend/src`)
* **Entitlement Gate (`CreditsService.consumeFeatureAccess`):** Users with an active `proExpiresAt` or `isLifetimePro` bypass credit charges automatically; Free Starter users deduct from their 5 welcome credits cleanly (w/ atomic refunds on provider error): `POST /resumes/adapt` (`3 cr`), `POST /resumes/adapt-section` (`1 cr`), `POST /interviews/start` (`2`/`3`/`5 cr`), `POST /job-matches` & `run-match` (`2 cr`), `tailor-resume`, `cover-letters`, `linkedin`, AI bullet/summary/section rewriters (`1 cr`), and `compress-and-parse` (`1 cr`).
* **Permanently Free Utilities (0 Credits):** Manual Resume Editor (all 10 templates), Chrome PDF export (`ExportPdfModal`), Native OOXML DOCX export, Deterministic Writing Quality audit (`FixMistakes`), ATS score breakdown, Job Tracker, Job Discovery feed, and Recruiter Share Links (`/r/[slug]`).

---

## 4. Strongest Marketable Differentiators (Verified in Code)

1. **Deterministic Anti-Hallucination & Evidence Grounding:** Unlike generic GPT wrappers that invent `"increased revenue by 40%"`, HypeResume runs code-level regex + semantic scale sanitization inserting `[Confirm measurable impact: e.g. latency reduction or scale]` across AI tailoring/rewrite/cover-letter/LinkedIn endpoints, locks user employment dates/companies/titles, quarantines sample company leakage, and cites verbatim `evidenceQuotes` per JD requirement.
2. **Real Technical Depth & Developer Credibility:** Ships genuine developer-beloved templates (`Jake's Resume`, `Awesome CV`, `Deedy Pro`), tech-token-aware writing rules (`eBPF`, `iOS`, `gRPC`, `p95` preserved), and direct live ATS job board feeds (`Ashby`, `Greenhouse`, `Lever` for Stripe, Figma, Linear, Notion, Vercel, Datadog) rather than scraped spam.
3. **Full Career Loop in One Workspace (Zero Dark Patterns):** Transparent one-time HypeResume Pro options starting at **`₹149/$3` (1 week)** up to **`₹999/$19` Founding Lifetime** with genuinely free unwatermarked vector PDF + native OOXML DOCX exports across all 10 templates, plus a 30MB PDF compressor, LinkedIn 265-char fold analyzer, Cover Letter Studio, Application Kanban, Recruiter Share Links, and AI Mock Interviews.
4. **Best-in-Class No-Signup SEO Acquisition Assets (`/tools/*`, `/examples/*`):** Interactive tools that deliver immediate real AI/deterministic value before asking for an email.

---

## 5. Historical Bugs & Risks Audit — Remediation Status (2026-11-12)

### A. Security, Payment & Entitlement Bugs — ALL RESOLVED (2026-11-12)
1. **Gateway-Verified Settlement (`payments.service.ts`):** `POST /api/v1/payments/verify` now verifies settlement strictly against `DodoPaymentProvider.verifyOrderStatus()` and rejects unpaid/pending/spoofed orders; `RazorpayPaymentProvider` fails closed rather than stubbing fake orders.
2. **Dodo Credentials & HMAC Security (`dodo-payment.provider.ts`):** Removed all hardcoded API/webhook fallback keys and static test signature bypasses; supports admin-switchable `test_mode` and `live_mode` for all 4 Pro plans in **INR + USD**. *(Founder action item: rotate older keys exposed in historical git commits before pushing public repos.)*
3. **Credit/Pro Gating + Atomic Refunds:** Enforced server-side `CreditsService.consumeFeatureAccess()` on all AI endpoints, Job Match/Tailor, Cover Letters, LinkedIn Studio, PDF Compression, and Interviews, with atomic error refunds (incl. removing silent mock error swallowing in `GeminiInterviewProvider`).
4. **Cross-Tenant `ResumeVersion` IDOR (`applications.service.ts`):** Fixed ownership verification on `ResumeVersion` parent `Resume`.
5. **Verified Dynamic Return Receipts (`PricingClient.tsx`):** Reads real settled amount, currency, and Pro plan grant directly from backend `verifyPayment` response.

### B. Funnel, Brand, Watermark & Analytics Gaps — ALL RESOLVED (2026-11-12)
1. **Unified Brand Identity (`HypeResume`):** Standardized modals, admin shell, SEO helpers (`SITE_URL` default `https://hype-resume.com`), `/public/icon.png` + `/public/og-image.png`, and `robots.ts` / `/r/[slug]` `noindex`. *(Pending marketing asset tweak: re-export `assets/social-media-assets/first-post/` slides if reused.)*
2. **Unified Pricing Across All Surfaces:** `PricingSection.tsx`, `/pricing`, `terms/page.tsx`, `interview/page.tsx`, and `/admin/payments` all align 100% on Free Starter (`5 cr`) + HypeResume Pro (`₹149/$3`, `₹399/$9`, `₹1,200/$29`, `₹999/$19` Founding Lifetime).
3. **Auth & Conversion Flows:** Fixed Hero/Navbar CTAs -> `/register`; preserved `?redirect=`, `?plan=`, `?currency=`, `?template=` across signup/login/Google OAuth (`<Suspense>` wrapped); hid Google spinner when client ID is absent; fixed `/app/resumes/new` 404; fixed light-mode `Navbar` contrast; added Change Password + GDPR Delete Account in `/app/settings`.
4. **Honesty & Watermark Cleanup:** Removed footer watermarks from `DoubleColumnTemplate.tsx` & `SidebarTemplate.tsx`; exposed all 10 `AVAILABLE_TEMPLATES` + `certifications` tab in editor `<select>`; aligned homepage copy (`10` ATS-verified templates, `82` benchmark resumes across `12` disciplines, deterministic reading-order claims); wiped sample PII on clone.
5. **Real Attribution & Analytics:** Replaced synthetic `/admin` stats (`45,687`/`128,450`/fake percentages) with real PostgreSQL `AnalyticsModule` (`POST /analytics/event`); wired env-driven `MetaPixel` (`PageView`, `CompleteRegistration`, `Lead`, `ViewContent`, `InitiateCheckout`, `Purchase`) + CAPI `clientIp`/`clientUserAgent`; fixed Kanban `'offer'` column & Interview `overallScore: 0` display bug.
