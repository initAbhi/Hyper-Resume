# HypeResume Visual Design System

**Product:** Hype-Resume (https://hype-resume.com/)  
**Role:** Principal Product Designer, Senior Frontend Engineer & SaaS UX Architect  
**Specification Level:** Production-Grade Design System  
**Date:** November 2026  

---

## 1. Core Principles & Philosophy

1. **Grounded in Career Reality**: Design for intense document legibility, precise typographic hierarchy, and deterministic parsing rather than decorative flashiness.
2. **Intentionality over Templated Defaults**: Reject generic AI-generated tropes:
   - No muddy, uncalibrated drop shadows.
   - No excessive decorative gradients or gratuitous glassmorphism.
   - No unmotivated ALL-CAPS tracked eyebrows across every section.
   - No mismatched radii where one card has 24px and another has 4px.
3. **Calm Desk Aesthetic**: Clean neutral surfaces (`#F7F8FA` in light mode, `#0D0F12` in dark mode) paired with a purposeful Royal Blue accent (`#285FEA` / `#3B75F2`) that keeps the user focused on writing and editing high-impact accomplishments.
4. **Predictable Density & Structure**: High-density utility for authenticated workspaces (dashboard, resume editor, interview simulator) and balanced, high-converting readability for public landing and tool pages.

---

## 2. Color System & Semantic Tokens

### 2.1 Surfaces & Backgrounds
| Token | Light Mode | Dark Mode | Usage |
| :--- | :--- | :--- | :--- |
| `--background` | `#F7F8FA` | `#0D0F12` | Root page background |
| `--surface` | `#FFFFFF` | `#14171C` | Primary content panels, sidebars |
| `--surface-subtle` | `#F1F3F5` | `#1D2128` | Hover backgrounds, input fills |
| `--surface-muted` | `#EAECEF` | `#252A33` | Secondary toolbars, active chips |
| `--surface-card` | `#FFFFFF` | `#14171C` | Cards, modals, drawers |

### 2.2 Foreground & Typography
| Token | Light Mode | Dark Mode | Contrast / Usage |
| :--- | :--- | :--- | :--- |
| `--foreground` | `#1A1D23` | `#F0F2F5` | Primary headings, document text (WCAG AAA) |
| `--foreground-muted` | `#5A6270` | `#9EA7B4` | Descriptions, labels, secondary info |
| `--foreground-subtle` | `#848D9A` | `#6C7584` | Placeholder text, timestamps, icons |
| `--foreground-disabled` | `#B0B7C3` | `#4A515E` | Disabled actions |

### 2.3 Brand Primary Accent
| Token | Light Mode | Dark Mode | Usage |
| :--- | :--- | :--- | :--- |
| `--primary` | `#285FEA` | `#3B75F2` | Primary buttons, active tabs, links |
| `--primary-hover` | `#1E4BC8` | `#5C8FF5` | Button hover state |
| `--primary-active` | `#173DA3` | `#285FEA` | Button active / press state |
| `--primary-subtle` | `#EDF3FD` | `#13203D` | Active badge backgrounds, selection highlights |
| `--primary-border` | `#C7DBF9` | `#1E3A78` | Active focus borders, subtle outlines |
| `--primary-foreground` | `#FFFFFF` | `#FFFFFF` | Text on primary buttons |

### 2.4 Semantic State Tokens
| State | Accent | Subtle Fill | Border | Text |
| :--- | :--- | :--- | :--- | :--- |
| **Success** | `#059669` | `#ECFDF5` (dark: `#064E3B`) | `#A7F3D0` (dark: `#047857`) | `#065F46` (dark: `#A7F3D0`) |
| **Warning** | `#D97706` | `#FFFBEB` (dark: `#78350F`) | `#FDE68A` (dark: `#B45309`) | `#92400E` (dark: `#FDE68A`) |
| **Error** | `#DC2626` | `#FEF2F2` (dark: `#7F1D1D`) | `#FECACA` (dark: `#B91C1C`) | `#991B1B` (dark: `#FECACA`) |
| **Info** | `#0284C7` | `#F0F9FF` (dark: `#0C4A6E`) | `#BAE6FD` (dark: `#0369A1`) | `#075985` (dark: `#BAE6FD`) |

### 2.5 Borders & Dividers
| Token | Light Mode | Dark Mode | Usage |
| :--- | :--- | :--- | :--- |
| `--border` | `#E2E5E9` | `#252A33` | Standard card and container borders |
| `--border-subtle` | `#EDEFF2` | `#1D2128` | Inner dividers, table row borders |
| `--border-strong` | `#CBD0D7` | `#333945` | Hovered borders, active inputs |

---

## 3. Typography Scale & Hierarchy

- **Primary Typeface**: `Inter`, `-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, `Roboto`, `sans-serif`
- **Monospace Typeface**: `ui-monospace`, `SFMono-Regular`, `Menlo`, `Monaco`, `Consolas`, monospace (used strictly for scores, timestamps, token IDs)
- **Features**: `cv02`, `cv03`, `cv04`, `cv11`, `tnum` (tabular numbers for metrics and timers)

| Role | Size | Line Height | Weight | Tracking | Class / Selector |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Display / Hero** | 48px – 60px | 1.12 | 700 / 800 | `-0.025em` | `text-4xl sm:text-6xl font-bold tracking-tight` |
| **Page Title (H1)** | 24px – 30px | 1.2 | 700 | `-0.02em` | `text-2xl sm:text-3xl font-bold tracking-tight` |
| **Section Title (H2)**| 18px – 22px | 1.3 | 600 | `-0.015em` | `text-lg sm:text-xl font-semibold tracking-tight` |
| **Card Header (H3)**| 15px – 16px | 1.4 | 600 | `-0.01em` | `text-base font-semibold tracking-tight` |
| **Body (Default)** | 14px | 1.55 | 400 | `-0.006em` | `text-sm text-foreground` |
| **Body (Small / Sub)**| 12px – 13px | 1.5 | 400 / 500 | `0` | `text-xs text-foreground-muted` |
| **Micro / Eyebrow** | 11px | 1.4 | 600 | `+0.04em` | `text-[11px] font-mono tracking-wider uppercase` |

---

## 4. Spacing, Radii & Shadows

### 4.1 Spacing Scale (4px Base Grid)
- `2` (8px): Compact inline spacing (icon to text).
- `3` (12px): Standard form element gap.
- `4` (16px): Card inner padding on mobile, standard flex gap.
- `6` (24px): Card inner padding on desktop, section item separation.
- `8` (32px): Subsection separation.
- `12`–`16` (48px–64px): Major page section breaks.

### 4.2 Border Radius Philosophy
- **Standard Controls & Inputs**: `rounded-lg` (8px).
- **Cards & Modals**: `rounded-xl` (10px–12px).
- **Pills, Badges & Avatars**: `rounded-full` (9999px).
- *Strict Rule*: Disallow erratic 24px–32px corner roundings on square cards, which read as playful toy interfaces rather than professional career software.

### 4.3 Natural Elevation Shadows
- `--shadow-xs`: `0 1px 2px 0 rgba(16, 24, 40, 0.05)` (Buttons, compact cards).
- `--shadow-sm`: `0 1px 3px 0 rgba(16, 24, 40, 0.08), 0 1px 2px -1px rgba(16, 24, 40, 0.06)` (Dropdowns, hover cards).
- `--shadow-md`: `0 4px 6px -2px rgba(16, 24, 40, 0.04), 0 8px 12px -2px rgba(16, 24, 40, 0.06)` (Flyout menus, tooltips).
- `--shadow-lg`: `0 10px 15px -3px rgba(16, 24, 40, 0.06), 0 4px 6px -4px rgba(16, 24, 40, 0.04)` (Modals, drawers).

---

## 5. UI Primitives Specification

### 5.1 Buttons (`components/ui/button.tsx`)
- **Primary**: Royal Blue solid fill with subtle hover elevation (`hover:bg-[#1E4BC8]`).
- **Secondary**: Subtle gray surface (`bg-[#F1F3F5]` / dark `bg-[#1D2128]`).
- **Outline**: Thin border (`border-[#E2E5E9]` / dark `border-[#252A33]`), crisp white interior.
- **Ghost**: Transparent until hover.
- **Destructive**: Red accent (`bg-[#DC2626] hover:bg-[#B91C1C]`).
- **Touch Targets**: Minimum 36px desktop (`size="sm"`), 40px standard (`size="md"`), 44px on mobile viewports.

### 5.2 Cards (`components/ui/card.tsx`)
- Clean 1px border (`border-[#E2E5E9]` / dark `border-[#252A33]`).
- Uniform padding: `p-5 sm:p-6`.
- Separated card headers with border dividers where complex settings or tables are enclosed.

### 5.3 Inputs & Form Controls (`components/ui/input.tsx`)
- Clear, visible `<label>` bound by `htmlFor`.
- Height: `h-9` or `h-10` with `rounded-lg`.
- Prominent focus ring: `focus-visible:ring-2 focus-visible:ring-[#285FEA]/20 focus-visible:border-[#285FEA]`.
- Explicit `aria-invalid` and `aria-describedby` referencing error messages.

### 5.4 Badges (`components/ui/badge.tsx`)
- Semantic variants: `neutral`, `success`, `warning`, `destructive`, `info`.
- Height: 20px–22px, font size 11px, font-weight 500, with proportional border for light and dark contrast.

---

## 6. Motion & Transitions

- **Duration Standard**: 150ms–200ms for micro-interactions (hover, active press, focus transitions).
- **Drawer / Modal Transitions**: 250ms with `cubic-bezier(0.16, 1, 0.3, 1)`.
- **Accessibility**: All keyframe animations and transitions wrap within `@media (prefers-reduced-motion: reduce)` to disable decorative movement for users with vestibular sensitivities.

