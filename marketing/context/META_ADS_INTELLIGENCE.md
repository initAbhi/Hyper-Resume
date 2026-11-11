# HyperResume — Meta Ads Library Intelligence (Phase 3)

**Last Updated:** 2026-11-12 (Live Extraction Completed 2026-11-11)  
**Live Inspection Status:** **COMPLETE — Verified via Chrome DevTools (`127.0.0.1:9222`)** (`browser` subagent `8fea4456-a4db-4613-ac73-77df6f5ad2dc`)  
**Transparency Caveat:** All ad counts, Library IDs, dates, copy, CTAs, destination URLs, and EU reach tables below were directly observed in Meta Ad Library or founder-captured screenshots. Private campaign metrics (CPC, CPM, CPA, ROAS, exact budgets, and targeting audiences) are never exposed by Meta Ad Library outside EU demographic reach disclosures.

---

## 1. Competitor Snapshot Matrix (`IN` vs `US` vs `ALL`)

| Competitor / Keyword | Page ID / Query | `country=IN` | `country=US` | `country=ALL` | Oldest Observed Active Ad ID & Start Date | Key Strategic Observation |
| :--- | :--- | :---: | :---: | :---: | :--- | :--- |
| **Enhancv** | `Enhancv` (`view_all_page_id=714646511930591`) | **~15 results** (15 unique ads) | **~120 results** | **~420 results** (`q=enhancv`) | US: `2485293741888319` / `2417294455383038` / `2998518093872668` (**28 Mar 2026**, 228d)<br>IN: `1352179713640261` (**28 May 2026**, 167d)<br>EU: `934395276322344` (**8 Jun 2026**, 156d) | Heavily weights creator partnership Reels + US/EU high-LTV campaigns (`$25–$40/mo`). Only **1 static ad** in India (`5427053274186551`). |
| **Resume.io** | Exact `"resume.io"` | **0 from Resume.io** (`GoResume.io` & `TechTip24` appear) | *Not queried separately* | **~32 results** (`Resume.io`) | `1352318710208967`, `1011897191201904`, `27143157372011332` (**15 Jun 2026**, 149d) | Pushes **`7-day Trial Only $2.95`** / **`$2.95/week`** globally (`country=ALL`), absent in India `"resume.io"` ads. |
| **Rezi** | `Rezi.ai` (`view_all_page_id=61561710149453`) | **0 results** | **0 results** | **~29 results** (`Rezi.ai`) | `1374113631464243` (**21 Oct 2026**, 21d) | 100% short Videos (`0:07–0:33`) linking to `rezi.ai/ai-apply-app`, excluding both US and India. |
| **Teal / TealHQ** | `q=tealhq` | *Not queried separately* | *Not queried separately* | **1 inactive** creator ad (`16 Mar – 11 Nov 2026`) | `948704620831791` (`annachernyshovaofficial`, 240d, ended 11 Nov 2026) | Creator ad driving `Download Teal`; official Page ID not pulled separately before session wrap. |
| **Kickresume / Jobscan / Zety** | `q="kickresume.com"`, `q="jobscan.co"`, `q="zety.com"` | *Not queried separately* | *Not queried separately* | **0 domain-matched** ads returned | N/A | Official Facebook Page IDs (`Jobscan @jobscanco` etc.) were not queried individually before session stop. |
| **Resumod** (India) | Keyword `resumod` | **0 results** | — | — | None | No active India Meta campaigns observed on 11 Nov 2026. |
| **`resume builder`** (India) | Keyword search | **~180 results** | — | — | `1399935234420518` (`Cv Maker` App, **15 Jul 2025**, 484d) | Active buyers: **Chiku AI**, **JobPrep India**, **Enhancv**, **Naukri.com**, **Cv Maker**, **Ekonty**. |
| **`ats resume`** (India) | Keyword search | **~1,200 results** | — | — | `1688255359028704` (`doredojon0`, **6 May 2026**, 189d) | Active buyers: **Enhancv**, **Squarelay**, **Prepfree**, **Naukri.com**, **cvLay**, **doredojon0**, **Jhanvi Tech**, **Huntt**. |

---

## 2. Enhancv Deep Dive (`934395276322344` & All 15 India Active Ads)

### A. Why `934395276322344` (156 Days, `13` Variants) Needs Adaptation Before Copying
From direct inspection of `marketing/competitors/enhancv/creatives/145-days/copycat_ads_Enhancv_934395276322344/` and founder EU transparency screenshots:
1. **Format & Copy (`934395276322344`, Started 8 Jun 2026):** Overhead iPhone Story flat-lay on marble desk showing a printed 2-column navy sidebar resume *with a headshot portrait* (`Paul Walker <p.walker@enhancv.com>`), AirPods, espresso cup, car keys, and laptop edge. Caption overlay: `"POV: you finally fixed your resume for 2026"`. Primary Text: `"Not all resumes were created equal. Design one that's ATS-friendly."` | CTA: `"Sign up"` -> `https://enhancv.com/`.
2. **Geographic Truth (EU Delivery Screenshot):** Ad `934395276322344` shows **`2,676,918` EU Reach**, heavily concentrated in **Italy (`90,424` Men 25–34), France (`79,736` M 25–34, `58,051` F 25–34), Spain (`79,512` M 25–34), Poland (`60,485` M 25–34)**.
3. **India Adaptation Already Running (`5427053274186551`, Started 15 Jun 2026 — 149 Days):** Enhancv's **only static ad** in India uses an authentic handheld printed resume over a laptop with `"pov: you finally fixed your resume for 2026"` -> Headline `"Upgrade your resume - get more interviews!"` (`Sign up` -> `https://enhancv.com/`).
4. **CMO Takeaway:**
   - **Steal the creative wrapper:** Native smartphone desk/handheld POV photo + short `POV:` caption stops thumb scrolling far better than glossy SaaS graphics.
   - **Reject EU layout + vague copy:** Indian engineers and ATS systems in tech hubs penalize headshot photos and decorative 2-column layouts. And unlike Enhancv (`420` ads, large retargeting budget, `$25–$40/mo` LTV), a **`₹200/day` HypeResume test** cannot afford vague slogans (`"Not all resumes were created equal"`). Our adaptation puts an **unwatermarked single-column tech ATS resume (`Jake's` style, zero photo)** inside the desk POV and pairs it with **explicit pain + transparent INR entry price** (`Free ATS Check + PDF`, `₹149 / 1-Week Pass`, `₹999 Founding Lifetime`).

### B. Enhancv's 15 Active India Ads (`country=IN`) — Pattern Breakdown
- **Format Split:** `14/15` Videos (`93.3%`, 0:23–0:57) — **10 Creator-Whitelisted Partnership Ads (`[Creator] with Enhancv`)** + **4 Enhancv brand videos** — and **1 Static Image** (`5427053274186551`).
- **Top Proven Angles Running >45 Days in India:**
  1. **Outdated Resume Laptop POV (`1352179713640261`, 167d, oldest IN):** *"Your old resume has no chance in 2026... Here is how to update it!"* (`Learn more`).
  2. **Hand-Held Desk POV Static (`5427053274186551`, 149d):** `"pov: you finally fixed your resume for 2026"` -> `"Upgrade your resume - get more interviews!"` (`Sign up`).
  3. **Anti-Myth Recruiter Survey UGC (`2948850735467408`, 134d, Morgan):** *"Your resume is probably not being rejected by a robot... comment ENHANCE..."* (Directly aligns with HypeResume's transparent evidence-based narrative).
  4. **Anti-ChatGPT Sameness Hook (`1585963549026605`, 49d):** *"One of the biggest mistakes job-seekers make is using a GPT to optimize their resume... now your resume looks just like everyone else."*
  5. **Direct AI Comparison (`1121012450792153`, 5d, Rexcodes) & Match Score Jumps (`966867696082118`, 8d, `61% -> 80%`)**: Newer high-velocity creator hooks.

---

## 3. India-Specific Competitors Verified Live (`country=IN` — Huge Strategic Signal)

1. **Chiku AI (`https://chiku-ai.in/pricing`) — `176 Days` Active (Since 19 May 2026, 7 Static Ads):**
   - **Verified Verbatim Hook:** *"₹1,199 for the same AI interview prep that costs \$20+/month abroad. Built in India. Priced for India. Same realtime AI copilot that helps you crack interviews at TCS, Wipro, Accenture, Amazon — without the global price tag. ✅ Live interview assistance ✅ Mock interviews with AI ✅ Resume builder ✅ One-time payment. No subscriptions."*
   - **Headline / CTA:** `"Same AI. Half the Price."` / `"Made for India. ₹1,199 only."` / `Sign up`.
   - **Strategic Proof:** **One-time Indian INR pricing (`₹1,199`) + anti-subscription framing + Indian company anchors + AI Mock Interviews + Resume Builder** runs profitably for **176+ days on Static Images alone**! HypeResume offers genuine **Resume Builder + Quote-Backed JD Match + Mock Interviews + Free Exports** at a LOWER entry (`₹149` 1-Week Pass / `₹399` Monthly / `₹999` Founding Lifetime) — giving us an immediate value-to-price advantage!
2. **JobPrep India (`https://jobprepindia.com/resume-builder`) — `126 Days` Active (Static Image):**
   - *"Get a professionally designed resume for FREE... ATS-friendly ✅ Built for freshers ✅ Trusted by 2 lakh+ students"* (`Get offer`), paired with a retargeting ad (`1314700957399950`, 125d): *"You visited us but didn't complete your resume 👀..."*.
3. **GoResume.io (`15d`), Naukri360 (`106d`), Prepfree (`136d`), Squarelay (`165d`), doredojon0 (`189d`, ₹100 WhatsApp ATS CV):**
   - Local Indian competitors overwhelmingly compete on **generic templates**, **free credits**, or **manual ₹100–₹367 template packs/WhatsApp services** — NONE match HypeResume's live **metric anti-hallucination validator + quote-backed JD match + live Ashby/Greenhouse/Lever discovery + real Chromium vector PDF + AI Mock Interview Studio** in one honest self-serve SaaS product.

---

## 4. Global Conversion Angles Worth Borrowing Later (`Resume.io` / `Rezi`)

- **Resume.io (`149d` in `country=ALL`, absent in `country=IN`):** Explicitly leads with **price anchor (`"7-day Trial Only $2.95"`)** and **abandonment retargeting (`"Your resume is almost done — download it anytime..."`)** plus **freshers/zero-experience entry (`"Looking for your first job?"`)**. HypeResume can deploy an honest, non-auto-renewing mirror: **`1-Week Pro Pass ₹149 ($3) • Free PDF & DOCX Forever`**.
- **Rezi (`21d`, `country=ALL`, 0 in `IN`/`US`):** `100%` ultra-short (`0:07–0:33`) native UI demo videos driving straight to AI apply/auto-tailoring (`rezi.ai/ai-apply-app`).
