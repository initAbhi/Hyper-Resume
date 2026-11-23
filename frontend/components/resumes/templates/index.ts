'use client';

import React from 'react';
import { DoubleColumnTemplate } from './DoubleColumnTemplate';
import { IvyLeagueTemplate } from './IvyLeagueTemplate';
import { SidebarTemplate } from './SidebarTemplate';
import { CrestTemplate } from './CrestTemplate';
import { ClassicTemplate } from './ClassicTemplate';
import { ModernTemplate } from './ModernTemplate';
import { JakeTemplate } from './JakeTemplate';
import { AwesomeCVTemplate } from './AwesomeCVTemplate';
import { DeedyTemplate } from './DeedyTemplate';
import { ExecutiveTemplate } from './ExecutiveTemplate';
import { TemplateProps } from './types';

export * from './types';
export * from './DoubleColumnTemplate';
export * from './IvyLeagueTemplate';
export * from './SidebarTemplate';
export * from './CrestTemplate';
export * from './ClassicTemplate';
export * from './ModernTemplate';
export * from './JakeTemplate';
export * from './AwesomeCVTemplate';
export * from './DeedyTemplate';
export * from './ExecutiveTemplate';
export * from './ResumeTemplateRenderer';

export interface TemplateDefinition {
  key: string;
  name: string;
  badge?: string;
  category: 'Modern' | 'Classic' | 'Two-Column' | 'Creative';
  component: React.ComponentType<TemplateProps>;
  description: string;
  /** Whether the template renders a profile photo slot */
  supportsPhoto?: boolean;
  /** Pro-only templates require an active Pro pass to apply */
  isPremium?: boolean;
}

/** Free forever on Starter — everyone else is Premium */
export const FREE_TEMPLATE_KEYS = new Set(['jake-ats', 'awesome-cv']);

export function isTemplatePremium(templateKey: string): boolean {
  const normalized = templateKey === 'jake' ? 'jake-ats' : templateKey === 'awesome' ? 'awesome-cv' : templateKey;
  return !FREE_TEMPLATE_KEYS.has(normalized);
}

/** Templates with a dedicated photo/avatar slot in the design */
const PHOTO_TEMPLATES = new Set([
  'double-column',
  'sidebar',
  'deedy',
  'crest',
  'executive',
  'modern',
]);

export function templateSupportsPhoto(templateKey: string): boolean {
  return PHOTO_TEMPLATES.has(templateKey);
}

export const AVAILABLE_TEMPLATES: TemplateDefinition[] = [
  {
    key: 'jake-ats',
    name: "Jake's Resume",
    badge: 'Recommended',
    category: 'Classic',
    component: JakeTemplate,
    description: 'Gold-standard LaTeX tech resume template. Single column, compact, 100% ATS parser compliant with right-aligned dates.',
  },
  {
    key: 'awesome-cv',
    name: 'Awesome CV',
    badge: 'POPULAR',
    category: 'Modern',
    component: AwesomeCVTemplate,
    description: 'World-famous LaTeX template with two-tone name typography, accent rule dividers, and sleek vector contact icons.',
  },
  {
    key: 'deedy',
    name: 'Deedy Pro',
    badge: 'Premium',
    category: 'Two-Column',
    component: DeedyTemplate,
    description: 'Debarghya Das asymmetric 2-column layout (32% left sidebar for skills & education, 68% for deep experience narratives).',
    isPremium: true,
  },
  {
    key: 'executive',
    name: 'Executive Leader',
    badge: 'Premium',
    category: 'Modern',
    component: ExecutiveTemplate,
    description: 'High-level C-suite and Director layout with accent indicators, dedicated executive profile, and credential grid.',
    isPremium: true,
  },
  {
    key: 'double-column',
    name: 'Double column',
    badge: 'Premium',
    category: 'Two-Column',
    component: DoubleColumnTemplate,
    description: 'Our #1 most popular layout with signature two-column split, photo avatar, and clear section dividers.',
    isPremium: true,
  },
  {
    key: 'ivy-league',
    name: 'Ivy League',
    badge: 'Premium',
    category: 'Classic',
    component: IvyLeagueTemplate,
    description: 'Classic serif typography modeled on Harvard and Yale academic standards. Best for executive & leadership roles.',
    isPremium: true,
  },
  {
    key: 'elegant',
    name: 'Elegant',
    badge: 'Premium',
    category: 'Two-Column',
    component: SidebarTemplate,
    description: 'Dark navy sidebar with circular photo avatar and high-contrast right content area.',
    isPremium: true,
  },
  {
    key: 'crest',
    name: 'Crest',
    badge: 'Premium',
    category: 'Modern',
    component: CrestTemplate,
    description: 'Contemporary header banner with colored accent block and clear visual hierarchy.',
    isPremium: true,
  },
  {
    key: 'clean-modern',
    name: 'Modern Tech',
    badge: 'Premium',
    category: 'Modern',
    component: ModernTemplate,
    description: 'Clean single-column tech layout with bold left accent bars and tag-based skills.',
    isPremium: true,
  },
  {
    key: 'classic-ats',
    name: 'Classic ATS',
    badge: 'Premium',
    category: 'Classic',
    component: ClassicTemplate,
    description: 'Clean professional single-column — title/dates alignment, categorized skills, 100% ATS-friendly export.',
    isPremium: true,
  },
];

export function getTemplateComponent(templateKey: string): React.ComponentType<TemplateProps> {
  switch (templateKey) {
    case 'jake-ats':
    case 'jake':
      return JakeTemplate;
    case 'awesome-cv':
    case 'awesome':
      return AwesomeCVTemplate;
    case 'deedy':
    case 'deedy-cv':
      return DeedyTemplate;
    case 'executive':
    case 'executive-leader':
      return ExecutiveTemplate;
    case 'double-column':
      return DoubleColumnTemplate;
    case 'ivy-league':
      return IvyLeagueTemplate;
    case 'elegant':
    case 'sidebar':
      return SidebarTemplate;
    case 'crest':
    case 'crest-new':
      return CrestTemplate;
    case 'classic-ats':
    case 'compact-ats':
    case 'simple-ats':
      return ClassicTemplate;
    case 'clean-modern':
    case 'modern':
    case 'technical-ats':
      return ModernTemplate;
    default:
      return JakeTemplate;
  }
}
