# HyperResume — Creative Library & Asset Audit

**Last Updated:** 2026-11-12  
**Existing Asset Directory Audited:** `/home/abhi-singh/Workarea/Business/Resume-builder/assets/` & `/home/abhi-singh/Workarea/Business/Resume-builder/marketing/generations/`

---

## 1. Visual Audit of Existing Assets (`/assets/social-media-assets/`)

### Brand Consistency Defect Detected Inside Draft Graphics
Direct visual inspection on 2026-11-11 revealed **two issues across the draft creative folder** that must be corrected before publishing:
1. **Mixed Spelling Inside Single Images:**
   - `assets/social-media-assets/first-post/Build a Resume That Gets Noticed.png`: Top header logo and laptop UI say **`HypeResume`**, while the pill badge says **`🚀 Introducing HyperResume`**.
   - `assets/social-media-assets/first-post/hyperesume_carousel_slide_5_1080x1350.png`: Header logo, laptop screen, and footer URL say **`HypeResume` / `hype-resume.com`**, while body copy says **`manage your resume with HyperResume`** (and filename contains typo `hyperesume`).
2. **Generic "AI Builder" Copy:** Draft posts (`hype-resume-launch-post-concept.png`, `hype-resume-features-post-concept.png`, `hype-resume-ats-tip-post-concept.png`, `Why Great Resumes Feel So Hard.png`) recycle generic template-builder messaging (*"Build in minutes / ATS optimized / Use standard section titles"*) that looks indistinguishable from Zety/Resume.io/Kickresume and hides HypeResume's sharpest differentiators.

### File Inventory
- **Logos (`/assets/logos/`):**
  - Canonical candidates: `HypeResume-Full-Logo.png`, `HypeResume-Icon-Logo.png`, `logo-full.png`
  - Legacy / backup: `HyperResume-Full-Logo.png`, `backup/HyperResume-Full-Logo.png`, `backup/text-logo.png`
- **Social Drafts (`/assets/social-media-assets/`):**
  - `first-post/`: `Build a Resume That Gets Noticed.png`, `Why Great Resumes Feel So Hard.png`, `hyperesume_carousel_slide_3_1080x1350.png`, `hyperesume_carousel_slide_4_1080x1350.png`, `hyperesume_carousel_slide_5_1080x1350.png` *(re-export fixing `HyperResume` -> chosen canonical name before publishing!)*
  - Standalone concepts: `hype-resume-launch-post-concept.png`, `hype-resume-features-post-concept.png`, `hype-resume-ats-tip-post-concept.png`, `hype-resume-facebook-cover-concept.png`, `hype-resume-profile-concept.png`, `HypeResume Document Checkmark Logo.png`, `Gemini_Generated_COVER_IMAGE.png`.

---

## 2. Production-Ready Creative Briefs (Replace Generic Concepts)

All new creatives adopt the dark `#090A10` precision aesthetic matching `app/page.tsx` (or high-contrast side-by-side white-vs-dark UI comparisons) and spotlight real shipped product features.

### Creative #C1 — "Anti-Paywall Trap" Static Comparison Card (`1080x1080` & `1080x1350`)
- **Persona:** P1 Freshers, P4 Career Switchers, burned Zety/Resume.io visitors.
- **Visual Spec:** Split card. Left (muted red/gray warning tint): *"Other Builders After 45 Mins"* -> Lock icon, `.txt only download` OR `$29.95 every 4 weeks` notice. Right (crisp emerald/cobalt): *"HypeResume (`hype-resume.com`)"* -> Unlocked PDF & DOCX icons, `Vector PDF Verified (UTF-8) — ₹0`, `Native .docx — ₹0`, `Zero Monthly Subscriptions`.
- **Headline Overlay:** `Spend 45 mins writing. Pay ₹0 to download.`
- **CTA:** `Audit & Export Free -> /tools/resume-checker`

### Creative #C2 — "ChatGPT Hallucination vs Deterministic Proof" Carousel (5 Slides, `1080x1350`)
- **Persona:** P2 Mid-Level Devs (2–5 YOE), P1 CS Grads.
- **Slides:**
  1. *Slide 1 (Hook):* `ChatGPT lies on your resume. Here's how recruiters catch it in 10 seconds.`
  2. *Slide 2:* Screenshot-style mock of raw GPT bullet: *"Reduced DB latency by 45% for 2M users"* with red tag `⚠ Invented metric — gets exposed in EM round`.
  3. *Slide 3:* HypeResume validator UI showing `[Confirm measurable impact: e.g. latency reduction or scale]` + `⚠ Source lock protected company & dates`.
  4. *Slide 4:* HypeResume Evidence Matcher showing 🟢 `Supported (with verbatim quote from your bullet)` vs 🟡 `Needs Confirmation (unproven skill tag)`.
  5. *Slide 5 (CTA):* `Check your real resume match free — no login required.` -> `hype-resume.com/tools/job-match`

### Creative #C3 — "The Indian Resume Tax" Educational Carousel (6 Slides, `1080x1350`)
- **Persona:** P1 India B.Tech Freshers & Campuses.
- **Slides:**
  1. `Why 300 applications get 0 callbacks (The Indian Resume Tax)`
  2. `Mistake 1: 2-Column Canva PDFs -> Workday scrambles your job history.` (Show `Jake's Resume` clean single-column alternative).
  3. `Mistake 2: Photo + DOB + "Declaration:" -> Wastes 20% of 1-page engineering real estate.`
  4. `Mistake 3: 12 MB Portfolio PDFs -> Bounces on portals or gets blurred into unsearchable images.` (Spotlight >10 MB lossless-text compressor).
  5. `Mistake 4: Listing "To-Do App" without architecture/deployment context.` (Before/After real project bullet).
  6. `Run all 5 checks free at hype-resume.com/tools/resume-checker`

### Creative #C4 — 35s Screen-Recording Reel / Short: `Overleaf Syntax vs 1-Click Vector Jake's PDF`
- **Visual Sequence:**
  - `0–3s`: Overleaf LaTeX compile error red console + misaligned page 2 spill. Text overlay: *"Still fighting Overleaf brackets at 2 AM?"*
  - `3–15s`: Open HypeResume Editor -> toggle **`Jake's Resume`** -> edit bullet cleanly -> run **`Fix Mistakes` (`84` typo/passive rules)**.
  - `15–26s`: Hit `Download PDF` -> show server check badge: `ATS Verified • Selectable UTF-8 Text • ₹0`.
  - `26–35s`: Also show `/r/[slug]` link toggle: *"Know the exact minute a recruiter views or downloads your resume."*

### Creative #C5 — Trackable `/r/[slug]` + Direct Ashby/Greenhouse Loop (`1080x1080` Carousel / LinkedIn Image)
- **Persona:** P2 Mid-Level Devs sick of LinkedIn Easy Apply black holes.
- **Copy Hook:** `Stop throwing PDFs into 1,000-applicant black holes.`
- **UI Panels:** Show `/app/job-search` querying **Linear (Ashby)** & **Stripe (Greenhouse)** live roles -> 1-click **Evidence Match** -> **Recruiter Share Analytics (`/r/[slug]`: Views, PDF Downloads, Hide Contact Details)** -> **Mock Interview Studio** follow-up probe.

### Creative #C6 — Pre-Launch OG Social Share Banner (`1200x630` -> `/public/og-image.png`)
- **Status:** **SHIPPED (`frontend/public/og-image.png` & `frontend/public/icon.png` created 2026-11-12).**

---

## 3. Enhancv Long-Running Meta Ad Teardown (`934395276322344`) — What to Steal vs What to Change

Source files inspected directly: `marketing/competitors/enhancv/creatives/145-days/copycat_ads_Enhancv_934395276322344/copycat_ads_Enhancv_934395276322344 (1).txt`, `image_1.jpg`, and Meta Ad Library screenshots shared by founder on 2026-11-12.

### Verified Facts on Enhancv Ad `934395276322344` & Sibling Winners
- **Ad `934395276322344` (`156 days` active since `8 Jun 2026`, `13` ad versions):**
  - **Format & Visual:** Overhead iPhone Story flat-lay on white marble desk showing a printed 2-column dark-navy sidebar resume *with circular headshot photo* (`Paul Walker <p.walker@enhancv.com>`), beside AirPods, coffee cup, car keys, and laptop edge. Top white caption: `"POV: you finally fixed your resume for 2026"`.
  - **Copy & Destination:** Primary Text `"Not all resumes were created equal. Design one that's ATS-friendly."` | CTA `"Sign up"` -> `https://enhancv.com/`.
  - **Geographic Reality (Crucial Context):** EU Ad Delivery disclosure shows **`2,676,918` reach**, led by **Italy (`90,424` M 25–34), France (`79,736` M 25–34, `58,051` F 25–34), Spain (`79,512` M 25–34), Poland (`60,485` M 25–34)**. That explains why the printed CV has a **headshot photo + 2 columns** (European CV norm!) and why vague copy still clears CAC (Enhancv runs `$24.99–$39.99/mo` high-LTV remarketing across hundreds of ads).
- **Sibling Long-Runners Observed in Founder Screenshots:**
  - `1742442443631399` (`86 days`, `22 ads use this creative and text`, started `17 Aug 2026`): Laptop-on-wooden-desk native POV photo showing resume editor screen + top caption.
  - `2948850735467408` (`134 days`, `5 ads`, started `30 Jun 2026`, Morgan UGC): *"Your resume is probably not being rejected by a robot. And the reason you're not hearing back is actually more fixable than you think."* (Strong anti-myth education angle).

### Adaptation Rule for HypeResume (`₹200/day` Constraint)
- **Steal the Format:** Native iPhone overhead desk POV (`4:5` Feed + `9:16` Story) and laptop-in-cafe POV — zero corporate stock feel, stops thumb scroll organically.
- **Upgrade the Resume & Offer (Do NOT Blindly Copy):**
  1. Replace EU headshot 2-col layout with an **unwatermarked single-column ATS engineering resume** (`Jake's Resume` / `Classic ATS` — zero photo, crisp metrics).
  2. Replace generic slogan (`"Not all resumes were created equal"`) with **specific zero-risk proof + concrete entry price** (*Free ATS Audit & Vector PDF • Pro 1-Week Pass `₹149` / Founding Lifetime `₹999`* on `/tools/resume-checker` or `/`).

---

## 4. Launch Paid Creative Pack — Seedream 5.0 Flash (`bytedance-seed/seedream-5-0-flash`)

Prompt specs & OpenRouter batch generator staged and ready to run:
- Generator script: `brain/.../scratch/generate_creatives.py` targeting `/marketing/generations/ads/` (`n: 1`, `resolution: 2K`).
- **Current Generation Blocker:** `marketing/generations/.env` holds an OpenRouter **Provisioning / Management Key** (`GET /api/v1/auth/key` -> `is_management_key: true, is_provisioning_key: true`), which OpenRouter rejects on inference (`POST https://openrouter.ai/api/v1/images` -> `HTTP 401: User not found`). Swapping `open_router_api_key` with a standard Inference API Key unblocks one-command rendering of all 4 files:
  1. `ads/ad01_pov_desk_ats_4x5.png` (`4:5` Feed): Overhead sunlit marble/oak desk POV with printed **single-column headshot-free ATS SWE resume** + top Story caption `'POV: you finally fixed your resume for ATS'`.
  2. `ads/ad01_pov_desk_ats_story_9x16.png` (`9:16` Story/Reels): Vertical Story adaptation with `'POV: your resume actually passes ATS now'`.
  3. `ads/ad02_laptop_evidence_check_4x5.png` (`4:5` Feed): Laptop-on-desk POV displaying `#090A10` dark UI split-screen (`94/100 ATS Match`) + `'Check what ChatGPT misses before you apply'`.
  4. `ads/ad03_zero_paywall_comparison_4x5.png` (`4:5` Feed): Dark `#090A10` vs `#5525F5` direct-response comparison (`Other Builders: TXT only + $29.95 auto-renewal` vs `HypeResume: Free PDF & DOCX + No Subscription Traps`).

### Existing Landing Page Image Assets Audit
- `frontend/components/home/InteractiveTemplateShowcase.tsx` currently loads crisp static template showcase `.avif` assets (`HTTP 200` verified) from Webflow CDN, and `frontend/public/icon.png` + `og-image.png` are local. Optionally, Seedream `ad02` or custom dark hero/editor mockups can replace external Webflow CDN dependencies later if branding updates are desired.
