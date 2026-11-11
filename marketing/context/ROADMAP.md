# HyperResume — Execution Roadmap (First 30 Days & 90-Day Horizon)

**Last Updated:** 2026-11-12  
**Operating Principle:** **Engineering P0–P2 Shipped (2026-11-12) -> Pre-Launch Security Rotation & Live Webhook Check -> Founding 10 Lifetime Outreach + SEO/Organic -> Small-Budget Paid Validation (`₹149` / `₹999` + `$3` / `$19`) -> Global & B2B2C Scale.**

---

## Days 1–7: Conversion, Security & Brand Stabilization (Code Complete 2026-11-12)

**Engineering / Product Tasks (Completed & Verified 2026-11-12):**
- [x] **P0-1 Checkout & Pricing Integrity:** Fixed `POST /payments/verify` gateway-confirmed settlement with Dodo, removed hardcoded fallback keys & static signature bypasses in `dodo-payment.provider.ts`, replaced Razorpay stub fail-closed, unified homepage `PricingSection.tsx`, `/pricing`, `pricing-plans.ts`, `interview/page.tsx`, & `terms/page.tsx` onto **HypeResume Pro** (`pro_weekly` ₹149/$3, `pro_monthly` ₹399/$9, `pro_6month` ₹1,200/$29, `pro_lifetime` ₹999/$19), added **INR + USD** Dodo checkout (`test_mode` & `live_mode`), and shipped real DB-backed `FoundingSalesBanner` + `/admin/settings` controls.
- [x] **P0-2 Canonical Brand Unification & SEO Assets:** Standardized modals/headers/pricing UI on `HypeResume`, created `frontend/public/og-image.png` & `/icon.png`, updated `lib/seo.ts` `SITE_URL` fallback (`https://hype-resume.com`), disallowed `/admin` & `/r/` in `robots.ts` (`noindex` layout on `/r/[slug]`), and added GDPR self-serve Delete Account + Change Password in `/app/settings`.
- [x] **P0-3 Conversion Funnel Fixes:** Routed `"Get Started"` / Hero CTAs to `/register`; preserved `?redirect=`, `?plan=`, `?currency=`, `?template=` across `/register` & `/login`; fixed `/app/resumes/new` 404; fixed light-mode `Navbar` overlap on `/tools/*` & `/pricing`; exposed all 10 templates in editor `<select>` + added `certifications` tab.
- [x] **P0-4 Honesty & Watermark Alignment:** Removed `"Powered by HypeResume"` / `"hype-resume.com"` watermarks from `DoubleColumnTemplate` & `SidebarTemplate`; fixed homepage column claims & exact `"82 Benchmark Resumes"` / `"10 Templates"` counts; wiped sample PII on clone and fixed `"2 welcome credits"` -> `"5"` in Interview UI.
- [x] **P0-5 Attribution & Entitlement Guardrails:** Wired `MetaPixel.tsx`, first-party `AnalyticsModule` (removing synthetic `/admin` stats), & CAPI `Purchase` with `clientIp`/`clientUserAgent`; unified `CreditsService.hasActivePro` / `consumeFeatureAccess` with atomic refunds across AI modules, Cover Letters, LinkedIn Optimizer, Job Match/Tailor, PDF compression, & Interview Studio; fixed `ResumeVersion` IDOR & Interview `overallScore: 0` fallback.

**Immediate Pre-Spend Ops & Marketing Prep Tasks (Days 1–7 Remaining):**
- [x] Enable Chrome `chrome://inspect/#remote-debugging` (`127.0.0.1:9222`) and complete live Phase 3 Meta Ads Library scrape (`META_ADS_INTELLIGENCE.md` + `934395276322344` breakdown complete).
- [x] Fix homepage Hero & workspace `/login` CTA dead-ends (`app/page.tsx`, `InteractiveHeroStudio.tsx`, `ProductWorkflowStorytelling.tsx`, `ApplicationPipelineWorkspace.tsx`, `FaqAndFinalCta.tsx` -> `/register` & `/tools/resume-checker`).
- [ ] **Ops:** Rotate older Dodo Payments keys previously committed in git history, flip `/admin/payments` to `live_mode`, and run 1 live `₹149` checkout + webhook + Meta CAPI check on production.
- [ ] **Generate Launch Creatives:** Update OpenRouter key in `marketing/generations/.env` to a standard Inference API Key and run `generate_creatives.py` (`bytedance-seed/seedream-5-0-flash`) for `ad01_feed`, `ad01_story`, `ad02_laptop`, `ad03_antipaywall` (also re-export `first-post/` social slides cleanly).
- [ ] Configure Google Search Console (`sitemap.xml` verification) + optionally verify Pixel/CAPI deduplication with `META_TEST_EVENT_CODE` before turning on paid spend.

---

## Days 8–14: SEO Foundations + Founding Lifetime Outreach + Organic Launch

- [ ] **Ship Technical SEO Upgrades (`SEO_STRATEGY.md`):** Add unique `metadata` + `SoftwareApplication` / `FAQPage` schema on all 4 `/tools/*` routes; hydrate `/examples?discipline=`; publish first 2 comparison/guide pages (`/compare/zety-and-resume-io-alternative-india`, `/templates/jakes-resume-online`).
- [ ] **Founder LinkedIn & X Ignition (`CONTENT_STRATEGY.md`):** Publish LinkedIn Posts #1–#3 + X Threads #1–#2 highlighting *"5 welcome credits, free unwatermarked PDFs, and first 10 Founding Lifetime seats at ₹999 / $19"*.
- [ ] **First-10 Real User Teardowns:** Offer 10–15 free live teardowns to freshers/2–5 YOE devs via X/LinkedIn -> convert initial cohort cleanly onto Founding `₹999` Lifetime seats -> collect verbatim before/after proof and testimonials (with permission).

---

## Days 15–21: Short-Form Video + Developer Community Launch

- [ ] **Reels / YouTube Shorts Sprint:** Record & publish Video Scripts #1 (`Overleaf / 12 MB PDF compressor / Free PDF`) and #2 (`ChatGPT fake metrics vs HypeResume validator`) + 2–3 iterations testing `₹149 1-Week Pass` vs `₹999 Lifetime` CTAs.
- [ ] **Value-First Reddit Entry (`r/developersIndia`, `r/resumes`):** Start with 10+ genuinely helpful zero-link resume critiques; publish 1 honest *"We built an anti-subscription ATS resume tool with Jake's template & free PDF/DOCX export — roast it"* feedback post.
- [ ] **Monitor Credit-to-Pro Conversion Funnel (`EXP-003`):** Track how quickly active free users exhaust 5 welcome credits across Cover Letter/LinkedIn/Job Match/Adapt and convert to `₹149` (`pro_weekly`) vs `₹999` (`pro_lifetime`).

---

## Days 22–30: Bootstrap Paid Validation (`₹200/day`) -> First 5 Customers & Creator Pilot

- [ ] **Paid Validation Launch (`PAID_ADVERTISING.md`):** Turn on **`₹200/day`** Metro India English (`21–32`) Meta Campaign (`1 Campaign -> 1 Ad Set -> 3 Ads`: `ad01_pov_desk`, `ad02_laptop_evidence`, `ad03_antipaywall`; optimize `CompleteRegistration`); protect budget with 72h & Day-7 stop-loss rules; **goal: close first 5 paying customers -> double budget to `₹400/day` -> add `UAE + Singapore` (`USD`) & `₹400/day` Google Exact Search.**
- [ ] **Micro-Creator Seed (`5` Indian Placement / Coding Creators):** Recruit 5 creators (`10k–75k` followers on YouTube Shorts/IG/LinkedIn) with trackable UTM/coupon links (`25–30%` rev share or small per-video + view-bonus model inspired by Rezi Creator Program).
- [ ] **First 2 Campus Placement Cell / Coding Club Outreach Pilots:** Run 1–2 live "ATS Myths & Resume Teardown" sessions for final-year batches using `/tools/resume-checker` (`₹149` 1-Week Interview Pass angle for placement week!).
- [ ] **End-of-Month 1 Gate Review:** Inspect first real `AnalyticsModule` + Dodo PostgreSQL funnel metrics (landing -> audit -> signup -> PDF/match -> checkout conversion). Cut underperforming creatives; double down on winning organic/paid angles.

---

## Days 31–60 (Month 2): Scale Winners & Global Product Hunt Launch

- Expand SEO `/examples/[role]` guides from 6 to **20+ India + Global tech & non-tech roles** using the 82-profile dataset.
- Launch **`/tools/linkedin-pdf-to-resume`** as a 5th public no-login tool (leveraging existing `linkedin-pdf-parser.util.ts` backend!).
- Launch **2-sided Referral Loop ("Give 3 Credits, Get 3 Credits")** post-PDF download and **opt-in subtle `/r/[slug]` share badge** backlink loop.
- Run coordinated **Product Hunt Launch** targeting P3 Global applicants cleanly powered by already-live **USD Dodo checkout (`$3` 1-wk / `$9` monthly / `$29` 6-mo / `$19` Founding Lifetime)**!

---

## Days 61–90 (Month 3): Compounding Organic Engine & Institutional B2B2C

- Publish the **"Open ATS Parsing Benchmark Report"** (PR/backlink magnet testing Canva/Word/Overleaf/HypeResume exports across parsers).
- Build lightweight **B2B2C Campus & Bootcamp Portal pilot** (modeled after Rezi Enterprise: cohort seat packs with placement-officer progress dashboard).
- Optimize paid acquisition via lookalike audiences built from verified `Purchase` CAPI events (separating India INR and US/Global USD value-based optimization) and expand Google Search comparison clusters (`Jobscan`, `Zety`, `Resume.io`, `Teal` alternatives).
