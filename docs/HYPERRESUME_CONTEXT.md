# HyperResume — Project Context

**Purpose:** Read this file first when continuing HyperResume work. It records the current product direction and points to the canonical strategy document.

## Product direction

HyperResume is planned as an **AI job-application optimization platform with a resume builder at its core**. It is not intended to be another generic AI resume generator.

**Core promise:** Help users turn their real experience into a stronger, truthful, job-specific application.

**Initial audience:** Indian job seekers, particularly freshers, early-career candidates, and software developers. Keep the product internationally usable.

**Business objective:** Build a small, bootstrapped, low-overhead product that can produce meaningful profit to fund other ideas.

## The first workflow to build

1. Upload/parse a resume.
2. Paste a job description.
3. Extract job requirements.
4. Match requirements to evidence in the user's real experience.
5. Show an explainable match report and actionable gaps.
6. Suggest changes that users can accept, reject, or edit.
7. Export a polished, ATS-friendly, job-specific resume.
8. Optionally save the application in a tracker later.

Never fabricate skills, qualifications, metrics, or experience. Scores must be described as internal compatibility indicators, not a universal ATS score or a hiring probability.

## MVP scope

- Resume upload and parsing.
- Master resume editor.
- Job description parsing.
- Resume-to-job matching.
- Evidence-backed AI suggestions and bullet rewriting.
- Basic ATS/formatting checks.
- 5–8 excellent ATS-friendly templates.
- Reliable PDF export.
- Basic analytics, payments, and credit tracking.

Defer job scraping, auto-apply, mobile apps, browser extensions, large template libraries, institutional dashboards, and advanced interview agents until demand is validated.

## Product design direction

Modern, polished productivity SaaS. Clear hierarchy, restrained styling, high-quality empty/loading/error states, responsive layout, live resume preview, and an editor with AI recommendations. Suggested desktop layout: sections/content on the left, live preview in the centre, recommendations on the right.

## Monetization hypotheses (not validated)

- Free: one master resume, basic checks, one job match, limited suggestions, basic export.
- One-time Job Hunt Pack: test ₹299–₹499.
- Premium package or subscription: test ₹699–₹999.
- Test credit packs before relying on subscriptions, because job search may be temporary.
- Consider coaches, colleges, and human reviews only after the B2C workflow proves value.

## Distribution priorities

1. Free tools + useful SEO landing pages.
2. Founder-led content and screen recordings.
3. Helpful, rule-compliant community participation.
4. Product Hunt as a launch event, not a permanent growth engine.
5. Referrals, career coaches, and college placement cells after validation.
6. Paid ads only after organic conversion and positive unit economics are measured.

## Technical direction

Keep the system small. Next.js frontend; choose Next.js backend or NestJS rather than maintaining both without a reason; PostgreSQL; private object storage; structured AI outputs; deterministic HTML/CSS-to-PDF rendering; payment webhooks with idempotency; basic analytics. Add queues only when justified.

## Trust and privacy

- Private file storage and short-lived signed URLs.
- Clear retention, deletion, and export controls.
- Disclose third-party AI processing.
- Do not train on uploaded resumes by default.
- Minimize sensitive information in logs.
- Do not guarantee interviews or ATS passage.

## Validation plan

- Days 1–30: talk to 10–15 job seekers, build the core workflow, recruit 20–50 active testers.
- Days 31–60: test organic distribution, publish a small set of quality pages, launch the first paid credit pack.
- Days 61–90: measure paid conversion, variable costs, acquisition channels, and decide whether to scale, reposition, or stop.

## Primary reference

See [`HYPERRESUME_PRODUCT_STRATEGY.md`](./HYPERRESUME_PRODUCT_STRATEGY.md) for the full product strategy, UX concept, competitor references, roadmap, pricing hypotheses, distribution plan, engineering direction, privacy requirements, unit economics, and validation milestones.

## Instructions for future work

- Treat the strategy document as the baseline, not as immutable truth.
- Separate confirmed decisions from hypotheses and experiments.
- Do not add features without explaining which user problem or business metric they improve.
- Prioritize the core resume-to-job workflow, document quality, trust, and distribution.
- Before proposing pricing or market claims, validate them with current evidence.
- Keep this context file concise and update it when major decisions change.
