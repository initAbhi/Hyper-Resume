# Design System & UI Specification — HyperResume

**Design System Name**: HyperNova Enterprise Design System  
**Version**: 2.1.0  
**Last Updated**: October 27, 2026  
**Aesthetic Philosophy**: Harmonious Enterprise Minimalism, High Information Density, Zero-Gimmick Professionalism

---

## 1. Color Palette & Token Architecture

HyperResume employs an adaptive dual-theme palette engineered for long-session productivity without eye fatigue. Unlike generic UI kits that mix random dark and light tones, HyperNova enforces strict tonal harmony between foreground, surface, desk, and accent layers.

### 1.1 Core Tokens Table

| Token Name | Light Mode Value | Dark Mode Value | Usage Context |
| :--- | :--- | :--- | :--- |
| **Surface Background** | `#FFFFFF` | `#14171C` | Cards, modals, dropdowns, and input containers |
| **Desk / App Canvas** | `#EDF0F3` | `#0B0D11` | Background canvas behind elevated A4 paper documents |
| **Page Background** | `#F7F8FA` | `#0D0F12` | Main page view background |
| **Brand Primary** | `#285FEA` | `#3B82F6` | Primary action buttons, active tabs, brand accents |
| **Brand Hover** | `#1E4ECC` | `#2563EB` | Hover state for primary buttons and interactive links |
| **Text Primary** | `#1A1D23` | `#F0F2F5` | Headings, bold labels, candidate names |
| **Text Secondary** | `#525866` | `#9CA3AF` | Supporting descriptions, subtitles, dates |
| **Text Muted** | `#868C98` | `#6B7280` | Placeholder text, disabled labels, timestamps |
| **Border Subtle** | `#E4E7EC` | `#22262E` | Card borders, dividers, table row separations |
| **Border Active / Focus**| `#285FEA` | `#3B82F6` | Input focus rings, selected card borders |

### 1.2 Metric & Status Colors

* **Success / High ATS Score (85-100)**: `#10B981` (Emerald) — Used for high ATS match scores, verified badges, and successful imports.
* **Warning / Moderate Score (60-84)**: `#F59E0B` (Amber) — Used for missing keywords, warnings, and medium match scores.
* **Alert / Low Score (0-59)**: `#EF4444` (Rose / Red) — Used for formatting errors, unparsed bullets, and critical missing fields.
* **Info / AI Processing**: `#6366F1` (Indigo / Violet) — Used for AI optimization pills and loading states.

---

## 2. Typography & Font Hierarchy

The system uses **Inter** (via `next/font/google`) as the primary UI typeface, with optimized fallback to system sans-serif (`-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto`).

```
Font Family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif
```

### 2.1 Hierarchy Scale

| Level | Size | Weight | Line Height | Tracking | Application |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Hero H1** | `48px / 3rem` | 800 (ExtraBold)| `1.15` | `-0.025em` | Landing page hero headline |
| **Page H2** | `32px / 2rem` | 700 (Bold) | `1.25` | `-0.02em` | Section titles, Library header |
| **Section H3** | `22px / 1.375rem`| 600 (SemiBold) | `1.3` | `-0.015em` | Card titles, Modal headlines |
| **Subhead** | `16px / 1rem` | 500 (Medium) | `1.5` | `normal` | Subtitles, helper text |
| **Body Regular** | `14px / 0.875rem`| 400 (Regular) | `1.5` | `normal` | General content, table items |
| **Label / Button** | `13px / 0.8125rem`| 600 (SemiBold) | `1.2` | `0.01em` | Buttons, badge tags, filter pills |
| **Caption / Small** | `11px / 0.6875rem`| 500 (Medium) | `1.3` | `0.02em` | Metadata, timestamps, ATS counters |

---

## 3. Brand Identity & Vector Typography

### 3.1 The Wordmark Standard (`Logo.tsx`)
Rather than relying on low-resolution raster text or rigid bitmaps, the HyperResume brand uses a composite vector text pattern paired with the high-resolution official icon:

```tsx
<div className="flex items-center gap-2.5">
  <Image 
    src="/logos/logo-icon.png" 
    alt="HyperResume Icon" 
    width={32} 
    height={32} 
    className="h-8 w-8 object-contain"
  />
  <span className="font-extrabold tracking-tight text-xl font-sans">
    <span className="text-[#1A1D23] dark:text-[#F0F2F5]">Hyper</span>
    <span className="text-[#285FEA]">Resume</span>
  </span>
</div>
```

* **Size Scales**:
  * `sm`: 24px icon, `text-lg`
  * `md`: 32px icon, `text-xl` (Default Navbar)
  * `lg`: 40px icon, `text-2xl`
  * `xl`: 52px icon, `text-4xl` (Auth & Hero banners)

---

## 4. Component Design Patterns

### 4.1 Filter Pills & Search Inputs (Adaptive Contrast)
Previous iterations used hardcoded dark pills (`bg-[#121620]`) that created poor visual contrast in light mode. The revised design system unifies all interactive controls:

```tsx
// Filter Pill Component Pattern
<button
  className={cn(
    "px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 border",
    isActive
      ? "bg-[#1A1D23] text-white border-[#1A1D23] dark:bg-[#285FEA] dark:border-[#285FEA] shadow-sm"
      : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 dark:bg-[#14171C] dark:text-zinc-400 dark:border-zinc-800 dark:hover:border-zinc-700"
  )}
>
  {label}
</button>
```

### 4.2 Adaptive Company Brand Badges (`CompanyBrandBadge.tsx`)
Top tech and enterprise brands have unique color profiles. For brands with monochrome logos (such as Apple, Amazon, Adidas, Disney, Sony, and TechNova), hardcoded black text would disappear in dark mode.

The `CompanyBrandBadge` component dynamically detects the active theme and brand:
```tsx
const isAdaptiveMonochrome = ['Apple', 'Amazon', 'Adidas', 'Disney', 'Sony', 'TechNova'].includes(company);

<div className={cn(
  "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border",
  isAdaptiveMonochrome
    ? "bg-zinc-100 text-zinc-900 border-zinc-200 dark:bg-zinc-800/80 dark:text-white dark:border-zinc-700"
    : getCompanyThemeStyles(company)
)}>
  <CompanyIcon className="w-3.5 h-3.5" />
  <span>{company}</span>
</div>
```

### 4.3 True A4 Document Canvas Specification
The resume preview modal (`SampleResumeModal.tsx`) and the resume editor preview render a mathematically accurate A4 paper layout:

* **Aspect Ratio**: Standard ISO 216 A4 ratio ($1 : \sqrt{2} \approx 1 : 1.414$)
* **Target Container Dimensions**: `max-w-[840px] min-h-[1140px]`
* **Paper Color**: Pure White (`#FFFFFF`) in both light and dark modes to preserve true printed document fidelity.
* **Canvas Backdrop**: Elevated paper dropshadow (`shadow-2xl ring-1 ring-black/5`) sitting atop a neutral desk surface:
  * Light Desk: `#EDF0F3`
  * Dark Desk: `#0B0D11`
* **Typography Inside Resume Document**:
  * Name: `22pt / 28px` Bold, centered or left-aligned
  * Section Headers: `11pt / 14px` Bold uppercase with bottom border divider (`1px solid #1A1D23`)
  * Body Text: `9.5pt / 12px` Regular with `1.4` line spacing
  * Margins: `0.75 inch (54px)` print padding

---

## 5. Micro-Animations & State Feedback

1. **Subtle Hover Elevation**: Cards lift by `translate-y-[-2px]` with a transition timing of `200ms cubic-bezier(0.16, 1, 0.3, 1)`.
2. **Score Gauge Progress**: The Rezi-style 100-point circle fills dynamically via SVG `stroke-dashoffset` transition of `800ms ease-out`.
3. **Copy to Clipboard Pulse**: "Copy Raw Text" button transforms to an emerald checkmark with a `fade-in-scale` keyframe animation for 2000ms before returning to neutral state.
4. **Modal Backdrop Blur**: Modal overlay uses `backdrop-blur-md bg-black/60` with smooth opacity fade.
