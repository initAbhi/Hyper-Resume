import type {
  BuiltInSectionKey,
  CustomResumeSection,
  ResumeContent,
  ResumeLayoutSettings,
  ResumeSectionKey,
} from '@/lib/api-client';

export const DEFAULT_SECTION_ORDER: BuiltInSectionKey[] = [
  'summary',
  'experience',
  'projects',
  'skills',
  'education',
  'certifications',
];

export const CUSTOM_SECTION_PREFIX = 'custom:';

export function isCustomSectionKey(
  key: string,
): key is `custom:${string}` {
  return key.startsWith(CUSTOM_SECTION_PREFIX) && key.length > CUSTOM_SECTION_PREFIX.length;
}

export const DEFAULT_LAYOUT_SETTINGS: Required<
  Pick<
    ResumeLayoutSettings,
    | 'sectionOrder'
    | 'hiddenSections'
    | 'fontSizeScale'
    | 'lineHeight'
    | 'sectionSpacing'
    | 'pageMargin'
  >
> = {
  sectionOrder: [...DEFAULT_SECTION_ORDER],
  hiddenSections: [],
  fontSizeScale: 1,
  lineHeight: 1.45,
  sectionSpacing: 16,
  pageMargin: 36,
};

export interface NormalizedLayoutSettings {
  sectionOrder: ResumeSectionKey[];
  hiddenSections: ResumeSectionKey[];
  fontSizeScale: number;
  lineHeight: number;
  sectionSpacing: number;
  pageMargin: number;
  accentColor?: string;
  fontFamily?: 'sans' | 'serif' | 'mono';
}

export const LAYOUT_DENSITY_PRESETS: Record<
  'compact' | 'balanced' | 'spacious',
  {
    label: string;
    description: string;
    fontSizeScale: number;
    lineHeight: number;
    sectionSpacing: number;
    pageMargin: number;
  }
> = {
  compact: {
    label: 'Compact (1 Page)',
    description: 'Tighter spacing & 92% scale to fit dense histories cleanly',
    fontSizeScale: 0.92,
    lineHeight: 1.28,
    sectionSpacing: 10,
    pageMargin: 24,
  },
  balanced: {
    label: 'Balanced (Standard)',
    description: 'Recommended recruiter readability & ATS margin balance',
    fontSizeScale: 1.0,
    lineHeight: 1.45,
    sectionSpacing: 16,
    pageMargin: 36,
  },
  spacious: {
    label: 'Spacious (Executive)',
    description: 'Airy executive breathing room & 106% typography scale',
    fontSizeScale: 1.06,
    lineHeight: 1.6,
    sectionSpacing: 22,
    pageMargin: 44,
  },
};

export const SECTION_ORDER_PRESETS: Record<
  'ats_standard' | 'student_grad' | 'project_first',
  { label: string; order: ResumeSectionKey[] }
> = {
  ats_standard: {
    label: 'Experience First (ATS Default)',
    order: [
      'summary',
      'experience',
      'skills',
      'projects',
      'education',
      'certifications',
    ],
  },
  student_grad: {
    label: 'Education First (New Grad)',
    order: [
      'summary',
      'education',
      'skills',
      'projects',
      'experience',
      'certifications',
    ],
  },
  project_first: {
    label: 'Projects First (Builder / Portfolio)',
    order: [
      'summary',
      'projects',
      'experience',
      'skills',
      'education',
      'certifications',
    ],
  },
};

function clamp(val: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, val));
}

export function normalizeLayoutSettings(
  layout?: ResumeLayoutSettings,
  customSections?: CustomResumeSection[],
): NormalizedLayoutSettings {
  const knownCustomKeys = Array.isArray(customSections)
    ? customSections
      .filter((s) => Boolean(s?.id))
      .map((s) => `${CUSTOM_SECTION_PREFIX}${s.id}` as ResumeSectionKey)
    : null;
  const knownCustomSet = knownCustomKeys ? new Set(knownCustomKeys) : null;

  const isAllowedKey = (k: ResumeSectionKey): boolean => {
    if ((DEFAULT_SECTION_ORDER as string[]).includes(k)) return true;
    if (isCustomSectionKey(k)) {
      return knownCustomSet ? knownCustomSet.has(k) : true;
    }
    return false;
  };

  const seen = new Set<ResumeSectionKey>();
  const customOrder: ResumeSectionKey[] = [];
  for (const key of layout?.sectionOrder || []) {
    if (isAllowedKey(key) && !seen.has(key)) {
      seen.add(key);
      customOrder.push(key);
    }
  }
  const sectionOrder: ResumeSectionKey[] = [
    ...customOrder,
    ...DEFAULT_SECTION_ORDER.filter((k) => !seen.has(k)),
    ...(knownCustomKeys ? knownCustomKeys.filter((k) => !seen.has(k)) : []),
  ];

  const hiddenSections = Array.from(
    new Set(
      (layout?.hiddenSections || []).filter((k): k is ResumeSectionKey =>
        isAllowedKey(k),
      ),
    ),
  );

  return {
    sectionOrder,
    hiddenSections,
    fontSizeScale:
      typeof layout?.fontSizeScale === 'number' && !Number.isNaN(layout.fontSizeScale)
        ? clamp(Number(layout.fontSizeScale.toFixed(2)), 0.85, 1.15)
        : DEFAULT_LAYOUT_SETTINGS.fontSizeScale,
    lineHeight:
      typeof layout?.lineHeight === 'number' && !Number.isNaN(layout.lineHeight)
        ? clamp(Number(layout.lineHeight.toFixed(2)), 1.2, 1.75)
        : DEFAULT_LAYOUT_SETTINGS.lineHeight,
    sectionSpacing:
      typeof layout?.sectionSpacing === 'number' && !Number.isNaN(layout.sectionSpacing)
        ? Math.round(clamp(layout.sectionSpacing, 8, 28))
        : DEFAULT_LAYOUT_SETTINGS.sectionSpacing,
    pageMargin:
      typeof layout?.pageMargin === 'number' && !Number.isNaN(layout.pageMargin)
        ? Math.round(clamp(layout.pageMargin, 16, 52))
        : DEFAULT_LAYOUT_SETTINGS.pageMargin,
    accentColor: layout?.accentColor,
    fontFamily: layout?.fontFamily,
  };
}

export function reorderSectionKeys(
  order: ResumeSectionKey[],
  fromIndex: number,
  toIndex: number,
  customSections?: CustomResumeSection[],
): ResumeSectionKey[] {
  const normalized = normalizeLayoutSettings(
    { sectionOrder: order },
    customSections,
  ).sectionOrder;
  if (
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= normalized.length ||
    toIndex >= normalized.length ||
    fromIndex === toIndex
  ) {
    return normalized;
  }
  const next = [...normalized];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}

export function moveSectionKey(
  order: ResumeSectionKey[],
  key: ResumeSectionKey,
  direction: 'up' | 'down',
  customSections?: CustomResumeSection[],
): ResumeSectionKey[] {
  const normalized = normalizeLayoutSettings(
    { sectionOrder: order },
    customSections,
  ).sectionOrder;
  const idx = normalized.indexOf(key);
  if (idx === -1) return normalized;
  const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
  return reorderSectionKeys(normalized, idx, targetIdx, customSections);
}

export function detectSectionKeyFromHeading(
  headingText?: string | null,
): ResumeSectionKey | null {
  const normalized = (headingText || '').trim().toLowerCase();
  if (!normalized) return null;
  if (normalized.includes('summary') || normalized.includes('profile')) {
    return 'summary';
  }
  if (
    normalized.includes('experience') ||
    normalized.includes('employment') ||
    normalized.includes('work history')
  ) {
    return 'experience';
  }
  if (normalized.includes('project')) {
    return 'projects';
  }
  if (
    normalized.includes('skill') ||
    normalized.includes('competenc') ||
    normalized.includes('technolog') ||
    normalized.includes('stack')
  ) {
    return 'skills';
  }
  if (normalized.includes('education') || normalized.includes('academic')) {
    return 'education';
  }
  if (normalized.includes('certif') || normalized.includes('license')) {
    return 'certifications';
  }
  return null;
}

export function getSectionCountSummary(
  content: ResumeContent,
  key: ResumeSectionKey,
): string {
  switch (key) {
    case 'summary': {
      const words = (content.summary || '').trim().split(/\s+/).filter(Boolean).length;
      return words > 0 ? `${words} words` : 'Empty';
    }
    case 'experience': {
      const n = content.experience?.length || 0;
      return `${n} role${n === 1 ? '' : 's'}`;
    }
    case 'projects': {
      const n = content.projects?.length || 0;
      return `${n} project${n === 1 ? '' : 's'}`;
    }
    case 'skills': {
      const n = content.skills?.length || 0;
      return `${n} skill${n === 1 ? '' : 's'}`;
    }
    case 'education': {
      const n = content.education?.length || 0;
      return `${n} entr${n === 1 ? 'y' : 'ies'}`;
    }
    case 'certifications': {
      const n = content.certifications?.length || 0;
      return `${n} item${n === 1 ? '' : 's'}`;
    }
    default: {
      if (isCustomSectionKey(key)) {
        const id = key.slice(CUSTOM_SECTION_PREFIX.length);
        const sec = content.customSections?.find((c) => c.id === id);
        const n = sec?.entries?.length || 0;
        return `${n} entr${n === 1 ? 'y' : 'ies'}`;
      }
      return '';
    }
  }
}

export function applyResumeLayoutToDom(
  container: HTMLElement,
  layout?: ResumeLayoutSettings,
  customSections?: CustomResumeSection[],
): void {
  const cfg = normalizeLayoutSettings(layout, customSections);
  const rankMap = new Map<ResumeSectionKey, number>();
  cfg.sectionOrder.forEach((key, idx) => rankMap.set(key, idx));
  const hiddenSet = new Set<ResumeSectionKey>(cfg.hiddenSections);

  const isDefaultOrder =
    cfg.sectionOrder.length === DEFAULT_SECTION_ORDER.length &&
    cfg.sectionOrder.every((k, i) => k === DEFAULT_SECTION_ORDER[i]) &&
    hiddenSet.size === 0;
  const isDefaultSpacing =
    Math.abs(cfg.sectionSpacing - DEFAULT_LAYOUT_SETTINGS.sectionSpacing) < 0.5;
  const isDefaultMargin =
    Math.abs(cfg.pageMargin - DEFAULT_LAYOUT_SETTINGS.pageMargin) < 0.5;
  const isDefaultFontScale = Math.abs(cfg.fontSizeScale - 1) < 0.001;
  const isDefaultLineHeight = Math.abs(cfg.lineHeight - 1.45) < 0.005;

  // 1. Section Reordering, Visibility, and Section Gap
  const sectionParents = new Set<HTMLElement>();
  const sections = Array.from(container.querySelectorAll<HTMLElement>('section'));

  for (const section of sections) {
    const preMarked = section.dataset.resumeSection;
    const headingEl = section.querySelector('h2, h3');
    const detectedKey: ResumeSectionKey | null =
      preMarked && isCustomSectionKey(preMarked)
        ? preMarked
        : detectSectionKeyFromHeading(headingEl?.textContent);
    if (!detectedKey) continue;

    section.dataset.resumeSection = detectedKey;
    if (section.parentElement) {
      sectionParents.add(section.parentElement);
    }

    if (hiddenSet.has(detectedKey)) {
      section.style.display = 'none';
      section.dataset.hrHidden = 'true';
    } else {
      section.style.display = '';
      delete section.dataset.hrHidden;
    }

    if (!isDefaultOrder || !isDefaultSpacing) {
      section.style.order = String(rankMap.get(detectedKey) ?? 99);
      section.style.marginTop = '0px';
    } else {
      section.style.order = '';
      section.style.marginTop = '';
    }
  }

  for (const parent of sectionParents) {
    if (!isDefaultOrder || !isDefaultSpacing) {
      parent.style.display = 'flex';
      parent.style.flexDirection = 'column';
      parent.style.rowGap = `${cfg.sectionSpacing}px`;
      parent.dataset.hrFlexManaged = 'true';
    } else if (parent.dataset.hrFlexManaged === 'true') {
      parent.style.display = '';
      parent.style.flexDirection = '';
      parent.style.rowGap = '';
      delete parent.dataset.hrFlexManaged;
    }
  }

  // 2. Page Margin Application (respecting templates with flush full-bleed sidebars)
  const pageEls = Array.from(
    container.querySelectorAll<HTMLElement>('.resume-page-a4'),
  );
  for (const pageEl of pageEls) {
    const cs = window.getComputedStyle(pageEl);
    const hasOuterPadding = parseFloat(cs.paddingLeft || '0') > 4;
    if (!isDefaultMargin && (hasOuterPadding || pageEl.dataset.hrMarginManaged === 'true')) {
      pageEl.style.padding = `${cfg.pageMargin}px`;
      pageEl.dataset.hrMarginManaged = 'true';
    } else if (isDefaultMargin && pageEl.dataset.hrMarginManaged === 'true') {
      pageEl.style.padding = '';
      delete pageEl.dataset.hrMarginManaged;
    }
  }

  // 3. Read-first, Write-second Typography Scaling & Line Height
  const textEls = Array.from(
    container.querySelectorAll<HTMLElement>('h1, h2, h3, p, li, span, a'),
  ).filter((el) => !el.closest('svg') && !el.classList.contains('sr-only'));

  // Pass A (Read baseline font sizes once before mutating any inline fontSize)
  const baseSizes = textEls.map((el) => {
    const existing = el.dataset.hrBaseFs;
    if (existing) return parseFloat(existing);
    const computed = parseFloat(window.getComputedStyle(el).fontSize || '0');
    if (computed > 0) {
      el.dataset.hrBaseFs = computed.toFixed(2);
    }
    return computed;
  });

  // Pass B (Write scaled sizes & line heights)
  textEls.forEach((el, idx) => {
    const base = baseSizes[idx];
    if (!isDefaultFontScale && base > 0) {
      el.style.fontSize = `${(base * cfg.fontSizeScale).toFixed(2)}px`;
    } else if (isDefaultFontScale && el.dataset.hrBaseFs) {
      el.style.fontSize = '';
    }

    if (el.tagName === 'P' || el.tagName === 'LI') {
      if (!isDefaultLineHeight) {
        el.style.lineHeight = String(cfg.lineHeight);
      } else {
        el.style.lineHeight = '';
      }
    }
  });
}

