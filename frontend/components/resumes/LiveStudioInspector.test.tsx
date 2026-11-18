import { describe, expect, it } from 'bun:test';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { CanvaDock } from './CanvaDock';
import { DesignPanel } from './DesignPanel';
import { SectionRearrangeDrawer } from './SectionRearrangeDrawer';
import { TemplatePicker } from './TemplatePicker';
import { AddContentDrawer } from './AddContentDrawer';
import { AtsAuditDrawer } from './AtsAuditDrawer';
import { FixMistakesDrawer } from './FixMistakesDrawer';
import type { ResumeContent } from '@/lib/api-client';

const SAMPLE_CONTENT: ResumeContent = {
  contact: {
    fullName: 'Sushil Sharma',
    email: 'sushil@example.com',
    phone: '+1 555-0100',
    location: 'San Francisco, CA',
  },
  headline: 'Staff Distributed Systems Engineer',
  summary: 'Architected low-latency cloud systems serving millions of requests.',
  experience: [
    {
      company: 'Acme Cloud',
      title: 'Staff Engineer',
      startDate: '2022',
      endDate: 'Present',
      current: true,
      bullets: ['Reduced p99 latency by 40% across edge nodes.'],
    },
  ],
  education: [
    {
      school: 'Stanford University',
      degree: 'M.S.',
      field: 'Computer Science',
      graduationDate: '2020',
    },
  ],
  skills: [{ name: 'TypeScript' }, { name: 'PostgreSQL' }],
  projects: [],
  certifications: [],
  customSections: [],
};

describe('Live-Studio Docked Inspector Redesign (Zero Blur, Instant Preview)', () => {
  it('DesignPanel docked mode renders inline without fixed overlay or backdrop blur and exposes interestfor hover previews', () => {
    const html = renderToString(
      <DesignPanel
        isOpen={true}
        docked={true}
        onClose={() => {}}
        accentColor="#2563eb"
        onAccentColorChange={() => {}}
        fontFamily="sans"
        onFontFamilyChange={() => {}}
        showPhoto={true}
        onShowPhotoChange={() => {}}
        photoUrl=""
        onPhotoUrlChange={() => {}}
        showHighlights={true}
        onShowHighlightsChange={() => {}}
      />,
    );

    expect(html).not.toContain('fixed inset-0');
    expect(html).not.toContain('backdrop-blur');
    expect(html).not.toContain('Apply Design');
    expect(html).toContain('interestfor="resume-document-print"');
    expect(html).toContain('Live sync');
  });

  it('SectionRearrangeDrawer docked mode renders without blocking backdrop blur or Done Reordering modal footer', () => {
    const html = renderToString(
      <SectionRearrangeDrawer
        isOpen={true}
        docked={true}
        onClose={() => {}}
        content={SAMPLE_CONTENT}
        onUpdateLayout={() => {}}
      />,
    );

    expect(html).not.toContain('fixed inset-0');
    expect(html).not.toContain('backdrop-blur');
    expect(html).not.toContain('Done Reordering');
    expect(html).toContain('interestfor="resume-document-print"');
    expect(html).toContain('data-testid="preset-order-ats_standard"');
    expect(html).toContain('data-testid="rearrange-row-experience"');
  });

  it('TemplatePicker docked mode renders inline with live-preview triggers and active template status', () => {
    const html = renderToString(
      <TemplatePicker
        isOpen={true}
        docked={true}
        onClose={() => {}}
        currentTemplateKey="awesome-cv"
        onSelectTemplate={() => {}}
        content={SAMPLE_CONTENT}
      />,
    );

    expect(html).not.toContain('fixed inset-y-0');
    expect(html).not.toContain('backdrop-blur');
    expect(html).toContain('interestfor="resume-document-print"');
    expect(html).toContain('Active:');
    expect(html).toContain('Awesome CV');
  });

  it('AddContentDrawer, AtsAuditDrawer, and FixMistakesDrawer render docked without modal backdrop blur', () => {
    const addHtml = renderToString(
      <AddContentDrawer
        isOpen={true}
        docked={true}
        onClose={() => {}}
        content={SAMPLE_CONTENT}
        onUpdateContent={() => {}}
      />,
    );
    expect(addHtml).not.toContain('fixed inset-0');
    expect(addHtml).not.toContain('backdrop-blur');

    const auditHtml = renderToString(
      <AtsAuditDrawer
        isOpen={true}
        docked={true}
        onClose={() => {}}
        score={88}
        analysis={null}
        isAnalyzing={false}
        onRunAudit={async () => {}}
        resumeId="res-1"
      />,
    );
    expect(auditHtml).not.toContain('fixed inset-0');
    expect(auditHtml).not.toContain('backdrop-blur');

    const mistakesHtml = renderToString(
      <FixMistakesDrawer
        isOpen={true}
        docked={true}
        onClose={() => {}}
        resumeTitle="Test Resume"
        content={SAMPLE_CONTENT}
        localReport={{ overallWritingScore: 95, summaryNote: '', issues: [], factualVerificationNotes: '' }}
        aiReport={null}
        activeReport={{ overallWritingScore: 95, summaryNote: '', issues: [], factualVerificationNotes: '' }}
        ignoredIds={[]}
        onIgnoreIssue={() => {}}
        onResetIgnored={() => {}}
        onApplyContent={() => {}}
        onRunAiDeepCheck={async () => {}}
        isRunningAiCheck={false}
        aiCheckError={null}
        onLocateIssue={() => {}}
      />,
    );
    expect(mistakesHtml).toContain('<aside');
    expect(mistakesHtml).not.toContain('<dialog');
    expect(mistakesHtml).not.toContain('backdrop-blur');
  });

  it('CanvaDock reflects the active docked studio panel with aria-pressed', () => {
    const html = renderToString(
      <CanvaDock
        activePanel="design"
        onOpenAgent={() => {}}
        onOpenTemplates={() => {}}
        onOpenDesign={() => {}}
        onOpenAddContent={() => {}}
        onOpenAtsAudit={() => {}}
        onOpenTailor={() => {}}
        onOpenFixMistakes={() => {}}
        onOpenRearrange={() => {}}
        onOpenVersions={() => {}}
        onOpenPhoto={() => {}}
        onOpenExport={() => {}}
        onOpenShare={() => {}}
      />,
    );

    expect(html).toContain('id="canva-dock-design"');
    expect(html).toContain('aria-pressed="true"');
    expect(html).toContain('id="canva-dock-agent"');
  });
});
