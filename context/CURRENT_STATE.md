# Current Production State — HyperResume

**Last Updated**: October 29, 2026, 01:30 IST  
**Environment**: Production Live (Ubuntu 24.04 LTS on Cloud VPS)  
**System Status**: 🟢 All Systems Fully Operational (Migrated to hype-resume.com)

---

## 🌐 Public Endpoints & Routing

| Endpoint | Target URL | Upstream Port | Protocol | Certificate |
| :--- | :--- | :--- | :--- | :--- |
| **Web Frontend** | `https://hype-resume.com` | `127.0.0.1:3082` | HTTP/2 (SSL) | Let's Encrypt (Certbot - `hype-resume.com`) |
| **REST API** | `https://api.hype-resume.com/api/v1` | `127.0.0.1:3002` | HTTP/2 (SSL) | Let's Encrypt (Certbot - `hype-resume.com`) |
| **Sample Library** | `https://hype-resume.com/examples` | `127.0.0.1:3082` | HTTP/2 (SSL) | Let's Encrypt (Certbot - `hype-resume.com`) |
| **Workspace App** | `https://hype-resume.com/app` | `127.0.0.1:3082` | HTTP/2 (SSL) | Let's Encrypt (Certbot - `hype-resume.com`) |
| **Legacy Frontend**| `https://resume.fourth-coffee.shop` | N/A (301 Redirect) | HTTP/2 (SSL) | 301 Permanent Redirect to `https://hype-resume.com` |
| **Legacy API** | `https://resume-api.fourth-coffee.shop` | N/A (301 Redirect) | HTTP/2 (SSL) | 301 Permanent Redirect to `https://api.hype-resume.com` |

---

## 🖥️ Server Infrastructure (`210.79.128.247`)

* **Operating System**: Ubuntu 24.04.4 LTS (GNU/Linux 6.8.0-106-generic x86_64)
* **Access User**: `ubuntu` (SSH Key: `~/.ssh/id_ed25519`)
* **Project Root**: `/var/www/hyper-resume`
* **Process Manager**: PM2 running under root (`/var/www/hyper-resume/ecosystem.config.cjs`)

### PM2 Process Status Table

| ID | Name | Mode | Status | Port | Memory | Restarts | Uptime |
| :---: | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **14** | `hyper-resume-frontend` | fork | **online** | `3082` | ~89 MB | 4 | Stable |
| **13** | `hyper-resume-backend` | fork | **online** | `3002` | ~104 MB | 0 | 7D+ |

---

## 🗄️ Database Status

* **Engine**: PostgreSQL 16
* **Database Name**: `hyper_resume`
* **Host**: `localhost:5432` on remote server
* **Status**: Complete database backup taken and restored from local environment. Includes all user schemas, resume content trees, application tracking records, and credit ledger tables.

---

## 🔑 Authentication & Testing Accounts

* **Demo User**: `demo@hyperresume.ai`
* **Password**: `demo123`
* **Credits Available**: `33 Credits`
* **1-Click Auto-Fill**: Implemented on `/login` page via the "Auto-fill Demo Account" helper button.
* **Token Storage**: JWT Access Tokens stored in `localStorage` (`hyperresume_token`) with automatic Authorization header injection across all API requests.

---

## 🎨 UI & Design Implementation Summary

### 1. Logo & Typography
* **Official Vector Typography**: `<span className="text-[#1A1D23] dark:text-[#F0F2F5]">Hyper</span><span className="text-[#285FEA]">Resume</span>`
* **Official Icon**: `/logos/logo-icon.png` (32px balanced height)
* **Responsive Sizing**: `sm` (26px), `md` (32px), `lg` (38px), `xl` (48px).

### 2. Elimination of Hardcoded Dark Themes
* **Sample Filter Pills**: Replaced `#121620` with `bg-white dark:bg-[#14171C]` and subtle borders. Active states use `#1A1D23` or `#285FEA`.
* **Search Input**: Clean light input with gray icon and focus ring.
* **Resume Cards**: Harmonious `bg-white dark:bg-[#14171C]` container with subtle hover lift and adaptive company badges.
* **Adaptive Company Badges**: Brands with black/white text (Apple, Amazon, Adidas, Disney, Sony, TechNova) automatically adapt to `text-zinc-900 dark:text-white`.

### 3. Sleek Modal & True A4 Document Canvas
* **Sleek Action Buttons**: Compact `Copy Text`, `Print / PDF`, and primary `#285FEA` `Use This Template` buttons.
* **Eliminated Redundant Bottom Bar**: Viewport height is 100% focused on the document.
* **Authentic A4 Paper Viewport**: Standardized document dimensions (`min-h-[1140px] max-w-[840px]`) with elevated paper drop shadows on desk background (`#EDF0F3` / `#0B0D11`).

### 4. Rich Content Density
* **Flagship Alexander Sharma Resume**: Full-stack developer resume with 22 STAR bullet points across 3 roles, 3 deep multi-tenant projects, 8 skill groups, education, and certifications.
* **Enriched Benchmark Resumes**: David K. Miller (Amazon AWS Principal Solutions Architect) expanded to 3 roles and 3 enterprise projects.
