'use client';

import React from 'react';
import { DoubleColumnTemplate } from './DoubleColumnTemplate';
import { IvyLeagueTemplate } from './IvyLeagueTemplate';
import { SidebarTemplate } from './SidebarTemplate';
import { CrestTemplate } from './CrestTemplate';
import { ClassicTemplate } from './ClassicTemplate';
import { ModernTemplate } from './ModernTemplate';
import { TemplateProps } from './types';

export * from './types';
export * from './DoubleColumnTemplate';
export * from './IvyLeagueTemplate';
export * from './SidebarTemplate';
export * from './CrestTemplate';
export * from './ClassicTemplate';
export * from './ModernTemplate';

export interface TemplateDefinition {
  key: string;
  name: string;
  badge?: string;
  category: 'Modern' | 'Classic' | 'Two-Column' | 'Creative';
  component: React.ComponentType<TemplateProps>;
  description: string;
}

export const AVAILABLE_TEMPLATES: TemplateDefinition[] = [
  {
    key: 'double-column',
    name: 'Double column',
    category: 'Two-Column',
    component: DoubleColumnTemplate,
    description: 'Our #1 most popular layout with signature two-column split, photo avatar, and clear section dividers.',
  },
  {
    key: 'ivy-league',
    name: 'Ivy League',
    category: 'Classic',
    component: IvyLeagueTemplate,
    description: 'Classic serif typography modeled on Harvard and Yale academic standards. Best for executive & leadership roles.',
  },
  {
    key: 'elegant',
    name: 'Elegant',
    category: 'Two-Column',
    component: SidebarTemplate,
    description: 'Dark navy sidebar with circular photo avatar and high-contrast right content area.',
  },
  {
    key: 'crest',
    name: 'Crest',
    badge: 'NEW',
    category: 'Modern',
    component: CrestTemplate,
    description: 'Contemporary header banner with colored accent block and clear visual hierarchy.',
  },
  {
    key: 'clean-modern',
    name: 'Modern Tech',
    category: 'Modern',
    component: ModernTemplate,
    description: 'Clean single-column tech layout with bold left accent bars and tag-based skills.',
  },
  {
    key: 'classic-ats',
    name: 'Classic ATS',
    category: 'Classic',
    component: ClassicTemplate,
    description: '100% ATS parser compliant single-column format optimized for enterprise scanning systems.',
  },
];

export function getTemplateComponent(templateKey: string): React.ComponentType<TemplateProps> {
  switch (templateKey) {
    case 'double-column':
      return DoubleColumnTemplate;
    case 'ivy-league':
    case 'executive':
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
    default:
      return DoubleColumnTemplate;
  }
}

