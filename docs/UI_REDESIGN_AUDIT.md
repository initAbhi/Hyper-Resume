# HyperResume — UI/UX Redesign Audit & Architecture Plan

**Role:** Principal Product Designer, Senior Design-Systems Engineer & Frontend Architect  
**Date:** 2026-10-19  
**Status:** Approved for Implementation  
**Reference Documents:** `docs/HYPERRESUME_CONTEXT.md`, `docs/HYPERRESUME_PRODUCT_STRATEGY.md`

---

## 1. Executive Summary & Design Direction

HyperResume is being systematically redesigned from a generic AI-themed prototype into a **mature, credible, calm career productivity SaaS** (benchmarked against product standards like **Linear**, **Notion**, **Rezi**, and **Teal**).

### Core Design Philosophy
- **Restrained & Neutral-First:** The interface prioritizes typography, content hierarchy, whitespace, and micro-alignment over bright decorative colors, gradients, and thick borders.
- **Truthful & Transparent:** Eliminates deceptive claims ("100% ATS guarantee", "beat the algorithm", fabricated testimonials) and replaces them with explainable, evidence-grounded career assistance.
- **Document-Centric Ergonomics:** The resume editor treats the candidate's document as the focal point, framed on a neutral desk surface with clean typography and real-time autosave.
- **Quiet Status Indicators:** Semantic colors (green, amber, red, blue) are reserved strictly for functional status, never used for arbitrary card accents or decorative badges.

---

## 2. Audit of Existing Application

### 2.1 Design Inconsistencies & AI Tropes Identified
1. **Global Styles (`globals.css`)**:
   - Contains decorative gradient text classes (`text-gradient`, `text-gradient-warm`) and pulsing animation glow effects (`animate-pulse-glow`) characteristic of early-stage AI wrappers.
   - Saturated colors scattered across components with lack of unified CSS custom properties.
2. **Application Shell (`frontend/app/app/layout.tsx`)**:
   - Sidebar had high-contrast fills and inconsistent icon stroke weights.
   - Top navigation had crowded right-aligned buttons competing for attention.
3. **Dashboard (`/app`)**:
   - Competing colored icon squares (emerald, blue, amber, purple).
   - Metrics presented without contextual next steps.
4. **My Resumes (`/app/resumes`)**:
   - Disconnected modal styling between scratch creation and resume upload.
   - Card grid lacked scannable document metadata.
5. **Resume Editor (`/app/resumes/[resumeId]`)**:
   - Dense nested borders around form sections.
   - AI suggestions styled like chatbot dialogs rather than structured editorial change proposals.
6. **Job Match (`/app/match`)**:
   - Heavy emphasis on arbitrary single-number scores rather than the breakdown of supported vs. unsupported evidence.
7. **Application Tracker (`/app/applications`)**:
   - Multi-layer bordered boxes, 12-stage colored chevron ribbon that overwhelmed the viewport, and competing action buttons.

### 2.2 Reusable Components & Working Features (Do Not Regress)
- **Deterministic ATS Resume Renderer** (`components/resumes/AtsResumeDocument.tsx`): 5 ATS templates (Modern, Executive Serif, Simple ATS, Compact, Creative).
- **Backend API Integration** (`lib/api-client.ts`): Fully typed NestJS endpoints for resumes, job descriptions, matches, applications, and auth.
- **Authentication & Credits Session** (`lib/auth-context.tsx`): State preservation, credit balance, token management.
- **Autosave Engine & Conflict Resolution**: Debounced persistence with optimistic UI and server version tracking.
- **STAR/XYZ Rewrite Analysis**: Structural suggestions with explainable impact.

---

## 3. The New Unified Design System

### 3.1 Color System (Tokens in `globals.css`)
- **Page Background (Light)**: `#F7F8FA` (neutral desk surface)
- **Primary Surface**: `#FFFFFF`
- **Secondary Surface**: `#F1F3F5` (subtle panel backgrounds)
- **Elevated Surface**: `#FFFFFF` with `0 4px 12px -2px rgba(0, 0, 0, 0.05)`
- **Borders**: `#E2E5E9` (1px clean neutral rules)
- **Primary Text**: `#1A1D23` (high legibility, high contrast)
- **Secondary Text**: `#5A6270`
- **Muted Text**: `#848D9A`
- **Brand Accent**: `#285FEA` (mature, trustworthy royal blue)
- **Hover Accent**: `#1E4BC8`
- **Dark Mode**: Neutral slate deep surfaces (`#0D0F12`, `#14171C`, `#1D2128`) maintaining identical contrast ratios and brand blue accent.

### 3.2 Typography Scale
- **Display / H1**: 28px–32px, `font-bold`, tracking `-0.025em`
- **Section Heading / H2**: 20px–22px, `font-semibold`, tracking `-0.02em`
- **Card / Subsection / H3**: 15px–16px, `font-semibold`, tracking `-0.01em`
- **Body Regular**: 14px, `font-normal`, leading `1.5`
- **Small / Metadata**: 12px–13px, `font-medium`, text-secondary
- **Micro / Badge**: 11px, `font-semibold`, uppercase tracking `0.04em`

### 3.3 Geometry & Radii
- Controls (Buttons, Inputs, Selects): `6px`–`8px`
- Cards & Panels: `10px`–`12px`
- Modals & Drawers: `12px`–`16px`
- Shadows: Soft, natural elevation (`shadow-xs`, `shadow-sm`) reserved exclusively for overlays and dropdowns.

---

## 4. Implementation Sequence

1. **Stage 1 — Design Tokens & Core UI Primitives**:
   - Refactor `globals.css` with the clean neutral palette.
   - Refactor `button.tsx`, `input.tsx`, `card.tsx`, `badge.tsx`.
2. **Stage 2 — Application Shell**:
   - Modernize `app/app/layout.tsx` (sidebar, breadcrumb header, credit counter, responsive drawer).
3. **Stage 3 — Public Marketing Website**:
   - Refactor `app/page.tsx` and home components: credible editorial messaging, authentic product previews, no fake guarantees.
4. **Stage 4 — Core Workspace**:
   - Redesign Dashboard (`/app`).
   - Redesign My Resumes (`/app/resumes`).
   - Redesign Resume Editor (`/app/resumes/[resumeId]`) with 3-panel ergonomics, neutral desk canvas, and quiet editorial suggestions.
5. **Stage 5 — Job Match (`/app/match`)**:
   - Transparent requirement extraction, evidence alignment, and gap analysis.
6. **Stage 6 — Application Tracking (`/app/applications`)**:
   - Simplify ribbon and cards; provide scannable data list and clean detail drawer.
7. **Stage 7 — Settings & Dialogs**:
   - Clean settings tabs (profile, credits, preferences, API keys).
8. **Stage 8 — Responsive & Visual QA**:
   - Browser subagent visual inspection, mobile viewport checks, and automated typecheck.

---

## 5. Acceptance Criteria
- [x] Zero generic AI glowing borders, gradient texts, or decorative orbs.
- [x] Restrained neutral-first color palette consistently applied.
- [x] Clean typography hierarchy across every route.
- [x] Working functionality 100% preserved (auth, editor, autosave, exports, matching, tracker).
- [x] Verified via browser screenshot testing.
