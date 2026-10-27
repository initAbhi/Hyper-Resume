# Brand Assets, Logos & Vector Typography — Feature Specification

**Source Asset Directory**: `c:\Users\AbhiSingh\Pictures\builder\assets\logos\`  
**Target Public Directory**: `frontend/public/logos/`  
**Brand Logo Component**: `frontend/components/ui/Logo.tsx`  
**Favicon & App Icons**: `frontend/app/favicon.ico`, `frontend/app/icon.png`, `frontend/app/apple-icon.png`  
**Status**: 🟢 Production Live (`https://resume.fourth-coffee.shop`)  

---

## 1. Official Brand Assets

The HyperResume brand identity consists of three primary assets delivered in high-resolution PNG format:

| Asset Name | Source Path | Public Path | Dimensions | Usage |
| :--- | :--- | :--- | :---: | :--- |
| **Full Brand Logo** | `assets/logos/logo.png` | `public/logos/logo.png` | 1024x1024 | Social share cards, OpenGraph, marketing hero |
| **Wordmark Text** | `assets/logos/logo-text.png`| `public/logos/logo-text.png`| 800x200 | Legacy banners, documentation headers |
| **Official Icon** | `assets/logos/logo-icon.png`| `public/logos/logo-icon.png`| 512x512 | App favicon, navbar icon, browser tabs |

---

## 2. Vector Typography Solution (`Logo.tsx`)

### 2.1 The Problem with Raster Text Logos
Early iterations attempted to render `logo-text.png` directly inside the top navigation bar. Because the image contained pre-rendered raster text at fixed aspect ratios, it suffered from:
1. **Blurriness on High-DPI Displays**: Fixed pixel height constraints resulted in fuzzy lettering on Retina screens.
2. **Inflexible Dark Mode Contrast**: If the raster image contained dark text, it became unreadable against dark navigation bars.
3. **Imbalanced Proportions**: At 24-32px heights, the text was too small and difficult to read.

### 2.2 The Vector Typography Pattern
To solve this permanently, `Logo.tsx` was rewritten to pair the sharp **official icon** with pure **vector HTML/CSS typography**:

```tsx
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  href?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showText = true,
  className,
  href = '/',
}) => {
  const sizeMap = {
    sm: { icon: 24, text: 'text-lg', gap: 'gap-2' },
    md: { icon: 32, text: 'text-xl', gap: 'gap-2.5' },
    lg: { icon: 40, text: 'text-2xl', gap: 'gap-3' },
    xl: { icon: 52, text: 'text-4xl', gap: 'gap-3.5' },
  };

  const currentSize = sizeMap[size];

  const content = (
    <div className={cn("inline-flex items-center select-none group", currentSize.gap, className)}>
      <div className="relative shrink-0 transition-transform duration-200 group-hover:scale-105">
        <Image
          src="/logos/logo-icon.png"
          alt="HyperResume Logo"
          width={currentSize.icon}
          height={currentSize.icon}
          className="object-contain"
          priority
        />
      </div>
      {showText && (
        <span className={cn("font-extrabold tracking-tight font-sans", currentSize.text)}>
          <span className="text-[#1A1D23] dark:text-[#F0F2F5] transition-colors">Hyper</span>
          <span className="text-[#285FEA]">Resume</span>
        </span>
      )}
    </div>
  );

  return href ? <Link href={href} className="inline-block">{content}</Link> : content;
};
```

---

## 3. Favicon & Web Manifest Generation

The official `logo-icon.png` was converted and distributed across browser metadata endpoints in `frontend/app/`:
* `favicon.ico`: Standard 32x32 multi-resolution browser tab icon.
* `icon.png`: 192x192 PNG for desktop shortcut and Android homescreen.
* `apple-icon.png`: 180x180 PNG with standard iOS touch icon padding.
* Declared in `frontend/app/layout.tsx`:
  ```tsx
  export const metadata: Metadata = {
    icons: {
      icon: '/icon.png',
      shortcut: '/favicon.ico',
      apple: '/apple-icon.png',
    },
  };
  ```

---

## 4. Adaptive Company Brand SVGs

In the Sample Resume Library (`CompanyBrandBadge.tsx`) and Company Logo Cloud (`CompanyLogoCloud.tsx`), top corporate brands are rendered using custom vector paths:

* **Google**: Multi-colored G icon (Blue, Red, Yellow, Green).
* **Meta**: Infinity loop in signature Meta Blue.
* **Amazon**: Amazon smile arrow with adaptive text:
  * Light Mode: Dark text `#1A1D23`
  * Dark Mode: White text `#FFFFFF`
* **Apple**: Apple silhouette:
  * Light Mode: Zinc-900 `#18181B`
  * Dark Mode: Pure White `#FFFFFF`
* **Microsoft**: 4-quadrant colored squares (Red, Green, Blue, Yellow).
* **Netflix**: Netflix N curve in signature `#E50914`.
* **Stripe**: Stripe S in `#635BFF`.
* **OpenAI**: Spiral flower geometry.
