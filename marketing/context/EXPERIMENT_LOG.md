# HyperResume — Growth Experiment Log

**Last Updated:** 2026-11-12  
**Baseline Status:** Pre-launch tracking (`AnalyticsModule` + Meta Pixel/CAPI + Unified Pro Pricing shipped 2026-11-12). Ready to run EXP-002 onward cleanly once live domain + webhook checks complete.

---

## Experiment Queue (Ranked by ICE Impact × Speed)

### EXP-001 — Fix Funnel Dead-Ends, Security & Unified Pro Pricing (CRO Prerequisite)
- **Hypothesis:** Aligning homepage `PricingSection.tsx` with `/pricing` (**HypeResume Pro:** `₹149/$3` 1-wk, `₹399/$9` 1-mo, `₹1,200/$29` 6-mo, `₹999/$19` Founding Lifetime), changing Hero/Navbar `"Get Started"` buttons from `/login` to `/register`, preserving `?redirect=` & `?plan=`, fixing `/app/resumes/new` 404, removing watermarks, and fixing light-mode Navbar contrast eliminates broken-funnel abandonment.
- **Metric & Target:** Signup completion rate from `/` & `/tools/*`; `?redirect=/pricing` checkout arrival rate.
- **Status:** **IMPLEMENTED IN CODE (2026-11-12 — Ready for Live Baseline Measurement)**

### EXP-002 — First-Screen "Drop Resume PDF" Hook & Founding Lifetime Banner on `/`
- **Hypothesis:** Surfacing the real PostgreSQL-backed `FoundingSalesBanner` (`₹999 / $19` Founding Lifetime limited to initial 10 seats) alongside routing Hero/tool traffic directly into `/tools/resume-checker` will raise Landing-to-Pro trial/lifetime conversion above generic SaaS signup pages.
- **Metric & Target:** `% of / visitors completing 1 audit or clicking Founding Offer` + `Trial/Lifetime checkout start rate`.
- **Duration:** 14 days baseline cohort monitoring.
- **Status:** **Ready to Measure (Week 1–2)**

### EXP-003 — Enforced 5-Credit Trial -> `₹149` 1-Week Pass vs `₹399` Monthly vs `₹999` Lifetime Split
- **Hypothesis:** Now that `CreditsService.consumeFeatureAccess()` meters Cover Letters, LinkedIn Optimizer, Job Match, Sample Adapt, PDF Compression, and Mock Interviews cleanly out of `5` welcome credits (while exports stay 100% free), active job seekers will exhaust free credits within 1–2 sessions and convert highest on `₹149` (1-Week Pass) or `₹999` (Founding Lifetime while available).
- **Guardrail:** Never charge for PDF export, DOCX export, basic editing, or `/tools/*` public audits (preserve trust promise).
- **Duration:** 14 days post-launch.
- **Status:** **IMPLEMENTED IN CODE (2026-11-12 — Ready for Live Observation)**

### EXP-004 — `Jake's Resume` Programmatic & Community Entry Wedge (`r/developersIndia` + Search)
- **Hypothesis:** Exposing all 10 templates prominently in the top editor dropdown (featuring `jake-ats`, `awesome-cv`, `deedy`) + creating `/templates/jakes-resume-online` targeting Indian devs who dislike Overleaf syntax friction will drive high-retention organic signups cleanly.
- **Metric & Target:** Organic clicks, editor activations on `jake-ats`, first-session verified PDF exports.
- **Duration:** 30 days SEO + Week 2 Reddit transparent launch test.
- **Status:** **UI Ready (SEO Page Planned Week 2)**

### EXP-005 — Mock Interview Model-Answer Preview Gate (`₹149` 1-Wk vs `₹999` Lifetime Upsell)
- **Hypothesis:** Showing Q1's personalized STAR model answer unlocked on free `quick_practice` reports while gating Q2–Q5 behind HypeResume Pro (now with real Gemini error refunds active and `overallScore: 0` display fixed) converts anxious interview candidates quickly into `₹149` (1-Week Pass) or `₹999` Lifetime buyers.
- **Metric & Target:** Upgrade rate among users completing 1 `quick_practice` session; tier distribution across `pro_weekly`, `pro_monthly`, `pro_lifetime`.
- **Duration:** 14 days post-launch.
- **Status:** **UI & Backend Ready (Measure Week 2–3)**

### EXP-006 — Meta Ads Hook Duel: Anti-Paywall (`M1-A`) vs Anti-Hallucination (`M1-B`) vs `₹149`/`₹999` Value Offer (`M1-C`)
- **Hypothesis:** On Indian tech developer audiences (`Ages 21–30`), `M1-B` (exposing ChatGPT metric lies + showing quoted evidence) or `M1-A` (anti-`.txt`-trap free PDF + `₹149` 1-Week Pass / `₹999` Founding Lifetime) will yield `>=30%` lower Cost per Registered User than generic `"Build your AI resume in minutes"` copy.
- **Prerequisites:** Rotate historical Dodo keys, verify `live_mode` webhook in production, complete live Meta Ad Library check (`chrome://inspect/#remote-debugging`), re-export dark obsidian creatives.
- **Budget & Stop-Loss:** `₹300/day` per creative × 7 days; kill if CTR `<0.8%` or tool activation `<25%`.
- **Status:** **Pre-Flight Ops Pending (Target Week 2–3)**

### EXP-007 — Campus Placement Cohort + 2-Sided Credit Referral Pilot
- **Hypothesis:** Offering 2 college placement clubs a free 30-minute live ATS teardown workshop + referral code (`Give 3 cr, Get 3 cr` upon friend verifying email/creating resume) + `₹149` 1-Week Placement Pass generates zero-CAC fresher clusters cleanly.
- **Metric & Target:** New student signups per workshop, referral K-factor, batch upgrades.
- **Status:** **Planned (Week 4)**
