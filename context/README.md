# HyperResume — Project Context & Documentation Hub

Welcome to the comprehensive documentation and context repository for **HyperResume** — an enterprise-grade AI Resume Builder and ATS Career Productivity Platform.

This directory contains full architectural specifications, design system standards, feature documentation, live deployment details, complete history logs, and raw Antigravity agent transcripts and visual artifacts.

---

## 📁 Repository Directory Structure

```
context/
├── README.md                              # This master index and context guide
├── CURRENT_STATE.md                       # Real-time production status, endpoints, and credentials
├── ARCHITECTURE.md                        # Full-stack architectural specifications and data flow
├── DESIGN_SYSTEM.md                       # Design tokens, typography, colors, and layout rules
├── CHANGELOG_AND_HISTORY.md               # Chronological log of all user requests and revisions
│
├── features/                              # Feature-by-feature specifications and code maps
│   ├── 01_landing_page.md                 # Interactive hero, live score gauge, logo cloud, FAQs
│   ├── 02_sample_library.md               # 4-column ATS benchmark grid, search, filters, modal
│   ├── 03_resume_builder_and_editor.md    # Multi-step resume editor, STAR bullet optimizer, export
│   ├── 04_authentication_and_user_mgmt.md# JWT auth, demo auto-fill, token rotation, credits
│   ├── 05_job_matcher_and_checker.md      # Requirement extraction, match scoring, bullet improver
│   ├── 06_application_tracker.md         # Kanban/table job tracker, status updates, interview prep
│   └── 07_brand_and_logos.md              # Official logos, vector typography, SVG badges, favicon
│
├── infrastructure/                        # Hosting, server, database, and devops setup
│   ├── server_and_deployment.md           # Ubuntu 24.04, PM2 process management, Nginx, SSL
│   ├── database_and_backups.md            # PostgreSQL schema, migrations, backup & restore procedures
│   └── environment_and_cors.md            # Environment variables, proxy routing, and CORS policies
│
├── chat_transcripts/                      # Antigravity pair-programming conversation logs
│   ├── session_metadata.json              # Session IDs, machine info, timestamps, and model configs
│   ├── transcript.jsonl                   # Token-efficient JSONL conversation log
│   └── transcript_full.jsonl              # Complete untruncated conversation history
│
└── artifacts/                             # Visual verification assets from all milestones
    ├── screenshots/                       # 110 High-resolution visual QA screenshots
    │   ├── landing_page/                  # Hero, features, logo cloud, and footer
    │   ├── sample_library_and_modal/      # Sample grid, modal preview, ATS documents
    │   ├── dashboard_and_editor/          # Workspace overview, resume editor, job tracker
    │   ├── mobile_responsive/             # Mobile navigation drawer, responsive cards
    │   └── all/                           # Master collection of all raw screenshots
    └── recordings/                        # 25 WebP subagent session interaction recordings
```

---

## ⚡ Quick Reference

| Component | Production URL / Host | Local Port / Path | Status |
| :--- | :--- | :--- | :--- |
| **Frontend Application** | [hype-resume.com](https://hype-resume.com) | `localhost:3000` (dev), `localhost:3082` (prod) | 🟢 Live & Operational |
| **Backend REST API** | [api.hype-resume.com](https://api.hype-resume.com/api/v1) | `localhost:3001` (dev), `localhost:3002` (prod) | 🟢 Live & Operational |
| **Sample Resume Library**| [hype-resume.com/examples](https://hype-resume.com/examples) | `/examples` & `/app/samples` | 🟢 21 Company Resumes |
| **Workspace Dashboard** | [hype-resume.com/app](https://hype-resume.com/app) | `/app` | 🟢 Protected Route |
| **Database Server** | PostgreSQL 16 on `210.79.128.247:5432` | Local PostgreSQL | 🟢 Synchronized |

### Demo Credentials
* **Email**: `demo@hyperresume.ai`
* **Password**: `demo123`
* **Starting Credits**: `33 Credits`
* **1-Click Auto-Fill**: Available on [hype-resume.com/login](https://hype-resume.com/login)

---

## 🎯 Design Philosophy & Core Principle
HyperResume is built around **Evidence-Grounded Career Productivity**, deliberately avoiding gimmicky AI text generators:
1. **Zero Hallucination / Exaggeration**: The engine does not invent employers, fake degrees, or false metrics. It structures user-provided facts into STAR/XYZ formulas.
2. **100% Parser Compatibility**: Strict single-column layouts, standard headers, clean UTF-8 encoding, and tableless flow for Workday, Greenhouse, Lever, and Taleo.
3. **Harmonious Enterprise Aesthetic**: Sleek light/dark adaptive palettes (`#F7F8FA` / `#0D0F12`), high-contrast typography, and refined micro-interactions.
