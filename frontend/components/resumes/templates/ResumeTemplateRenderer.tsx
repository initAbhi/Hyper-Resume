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
import type { TemplateProps } from './types';

export function ResumeTemplateRenderer({
  templateKey,
  ...props
}: TemplateProps & { templateKey: string }) {
  switch (templateKey) {
    case 'jake-ats':
    case 'jake':
      return <JakeTemplate {...props} />;
    case 'awesome-cv':
    case 'awesome':
      return <AwesomeCVTemplate {...props} />;
    case 'deedy':
    case 'deedy-cv':
      return <DeedyTemplate {...props} />;
    case 'executive':
    case 'executive-leader':
      return <ExecutiveTemplate {...props} />;
    case 'double-column':
      return <DoubleColumnTemplate {...props} />;
    case 'ivy-league':
      return <IvyLeagueTemplate {...props} />;
    case 'elegant':
    case 'sidebar':
      return <SidebarTemplate {...props} />;
    case 'crest':
    case 'crest-new':
      return <CrestTemplate {...props} />;
    case 'classic-ats':
    case 'compact-ats':
    case 'simple-ats':
      return <ClassicTemplate {...props} />;
    case 'clean-modern':
    case 'modern':
    case 'technical-ats':
      return <ModernTemplate {...props} />;
    default:
      return <DoubleColumnTemplate {...props} />;
  }
}

