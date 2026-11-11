# Project Overview — HyperResume / HypeResume

> **Last Updated:** November 12, 2026  
> **Live Production Domain:** `https://hype-resume.com` (API: `https://api.hype-resume.com/api/v1`)  
> **Configured Currencies:** INR (`₹`) & USD (`$`) via Dodo Payments (`test_mode` + `live_mode`)  
> **Status:** Live SaaS product (10-module AI career optimization suite); Week-1 P0 engineering/pricing/attribution fixes completed & verified — ready for pre-launch checks and initial acquisition tests.

---

## 1. What the Product Actually Is

Based on full codebase inspection across `/frontend` and `/backend`, the platform is not a single-purpose resume template generator. It is a **full-stack AI career optimization and job-application platform** spanning the entire lifecycle from resume auditing and tailoring to live job discovery, cover letters, LinkedIn optimization, application pipeline management, recruiter sharing, and AI mock interviews.

**Legacy vs. Current Reality:**
* **Early Strategy Baseline (`docs/HYPERRESUME_PRODUCT_STRATEGY.md`, Oct 13, 2026):** Positioned HyperResume as a truthful, India-initial-wedge resume builder + JD matcher with anti-hallucination guarantees.
* **Observed Current Codebase (Nov 12, 2026):** 10 live integrated modules powered by Next.js 16, NestJS 12, PostgreSQL/TypeORM, Google Gemini Flash models (`gemini-3.1-flash-lite` fallback chain with deterministic rule fallbacks), headless Chromium vector PDF rendering, native OOXML DOCX generation, live ATS job-board integrations (Ashby, Greenhouse, Lever, Remotive, Arbeitnow), Dodo Payments (**INR + USD**, one-time Pro tiers: `₹149/$3` 1-wk, `₹399/$9` 1-mo, `₹1,200/$29` 6-mo, `₹999/$19` Founding Lifetime), and Meta Pixel + Conversions API (CAPI) + first-party `AnalyticsModule`.

---

## 2. Core Mission & Marketing Objective

1. **Product Promise:** Help job seekers (starting with Indian software developers, freshers, and tech switchers, alongside global remote applicants) turn verifiable experience into higher ATS shortlist rates and interview readiness **without fabricating fake numbers, fake jobs, or unverified skills**.
2. **Commercial Objective:** Build a transparent, anti-dark-pattern monetization engine (1 unified HypeResume Pro plan across 1-week trial, monthly, 6-month, and limited Founding Lifetime one-time passes — zero forced auto-renewals) that converts high-intent organic and paid traffic sustainably.
3. **Marketing Mandate:** Leverage fixed conversion/pricing/trust funnels, weaponize existing free no-login tools (`/tools/*`, `/examples/*`) for SEO/product-led acquisition, fill the first 10 Founding Lifetime cohorts (`₹999`/`$19`), and scale repeatable organic + performance marketing loops.

---

## 3. Target Segments (Initial Wedge to Expansion)

| Priority | Segment | Core Need | Primary Wedge into Product |
| :--- | :--- | :--- | :--- |
| **P1 (Immediate Wedge)** | **Indian Fresh Graduates & Final-Year Tech Students** | Passing brutal campus/off-campus screening filters without generic "Canva resume" parsing failures or fake metrics | Free `/tools/resume-checker`, ATS single-column tech templates (`Jake's Resume`, `Deedy Pro`, `Awesome CV`), `/examples/fresher`, **`₹149` 1-Week Pass** / **`₹999` Lifetime** |
| **P1 (High ARPU Core)** | **Indian Software Developers & IT Professionals (1–6 yrs exp)** | Switching out of IT services/saturated roles into product companies/GCCs; quantifying real system impact and tailoring per JD | `/tools/job-match` evidence gap check, Sample Adaptation, LinkedIn Studio, Live Job Search, AI Mock Interview, **`₹399/mo` or `₹999` Founding Lifetime** |
| **P2 (Secondary Domestic)** | **Experienced Switchers (Tech Leads, PMs, Data, Non-Tech Corporate)** | Framing leadership impact, updating stale CVs, aligning LinkedIn headline/fold hook + cover letters | LinkedIn PDF Import + Optimization, Cover Letter Studio, Recruiter Share Links (`/r/[slug]`), **`₹1,200` 6-Month Plan** |
| **P3 (Global Unlocked)** | **International Tech & Remote Seekers (US, UK, CA, DE, SG)** | Cross-market ATS compliance + multi-company targeting without `$29–$50/mo` recurring subscriptions | Live USD Dodo checkout unlocked (`$3` 1-wk, `$9` 1-mo, `$29` 6-mo, `$19` Founding Lifetime) |

---

## 4. Resolved Launch Blockers & Remaining Operational Checks

The four P0 blockers identified during the Nov 11 audit have been **resolved in code (Nov 12, 2026)**:
1. **Brand Alignment:** External app UI, metadata, modals, SEO assets (`/public/og-image.png`, `/icon.png`) unified on **`HypeResume`** (`hype-resume.com`).
2. **Unified Real Pricing (INR + USD):** Homepage `PricingSection.tsx`, `/pricing`, `pricing-plans.ts`, `/app/interview`, and `/terms` all unified on **HypeResume Pro** (`₹149/$3` 1-wk, `₹399/$9` monthly, `₹1,200/$29` 6-mo, `₹999/$19` Founding Lifetime) + real DB-backed `FoundingSalesBanner`.
3. **Conversion & Entitlements Hardened:** Hero/Navbar CTAs route to `/register`; signup preserves `?redirect=`, `?plan=`, `?currency=`; `/app/resumes/new` 404 eliminated; credit & active-Pro gating (`CreditsService.consumeFeatureAccess`) enforced across all AI modules with atomic error refunds.
4. **Payment Security & Attribution Closed:** `POST /payments/verify` strictly requires gateway-confirmed settlement from Dodo; fallback test keys & static signature bypasses removed; Meta Pixel + CAPI (`clientIp`/`clientUserAgent`) + first-party `AnalyticsModule` active. **Only remaining action before public repo push/live launch:** rotate older git-history Dodo keys and verify HTTPS webhook receipt in `live_mode`.
