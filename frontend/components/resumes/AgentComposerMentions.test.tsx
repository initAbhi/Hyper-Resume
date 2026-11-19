import { describe, expect, it } from 'bun:test';
import React from 'react';
import { renderToString } from 'react-dom/server';
import {
  AgentMentionPopover,
  AgentMentionTriggerButton,
  AgentPinnedChipsBar,
  buildPinnedSubmissionPayload,
  extractActiveMentionQuery,
  stripActiveMentionToken,
  type ComposerPinnedItem,
  type MentionOption,
} from './AgentComposerMentions';
import { AgentChatPanel } from './AgentChatPanel';
import type { AgentApiClient } from '../../lib/agent-client';

function createStubClient(): AgentApiClient {
  return {
    listConversations: async () => [],
    createConversation: async () => ({
      id: 'conv-1',
      userId: 'u-1',
      title: 'Assistant',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }),
    getConversation: async () => ({} as any),
    updateConversation: async () => ({} as any),
    deleteConversation: async () => ({ deleted: true }),
    getMessages: async () => [],
    getTasks: async () => [],
    submitMessage: async () => ({ taskId: 't-1', conversationId: 'conv-1', messageId: 'm-1' }),
    approveProposal: async () => ({ success: true, newVersion: 2 }),
    rejectProposal: async () => ({ success: true, rejected: true }),
    cancelTask: async () => ({} as any),
    uploadAttachment: async () => ({} as any),
    parseJobUrl: async () => ({} as any),
    connectStream: () => ({ close: () => {} }),
  } as unknown as AgentApiClient;
}

describe('@ Mention & Section / Bullet Pinning in Chat Composer', () => {
  it('extracts active @ mention queries and ignores email addresses', () => {
    expect(extractActiveMentionQuery('@', 1)).toEqual({ query: '', startIndex: 0, endIndex: 1 });
    expect(extractActiveMentionQuery('Tailor @exp', 11)).toEqual({
      query: 'exp',
      startIndex: 7,
      endIndex: 11,
    });
    expect(extractActiveMentionQuery('Tailor (@stripe', 15)).toEqual({
      query: 'stripe',
      startIndex: 8,
      endIndex: 15,
    });
    expect(extractActiveMentionQuery('email alex@stripe.com', 21)).toBeNull();

    const stripped = stripActiveMentionToken('Tailor @exp bullets', {
      query: 'exp',
      startIndex: 7,
      endIndex: 11,
    });
    expect(stripped.nextText).toBe('Tailor bullets');
  });

  it('compiles pinned @Experience, canvas bullet, @Job: Stripe, and @Resume: Backend into structured context', () => {
    const pins: ComposerPinnedItem[] = [
      { kind: 'section', id: 'section:experience', label: '@Experience', sectionKey: 'experience' },
      { kind: 'section', id: 'section:projects', label: '@Projects', sectionKey: 'projects' },
      {
        kind: 'bullet',
        id: 'bullet:experience[0].bullets[1]',
        label: 'Exp #1 · Bullet #2: "Built APIs"',
        sectionKey: 'experience',
        fieldPath: 'experience[0].bullets[1]',
        excerpt: 'Built Node.js APIs serving 50k RPS across multi-region clusters',
      },
      {
        kind: 'job',
        id: 'job:11111111-1111-4111-8111-111111111111',
        label: '@Job: Stripe',
        jobId: '11111111-1111-4111-8111-111111111111',
        jobTitle: 'Staff Backend Engineer',
        companyName: 'Stripe',
        jobDescriptionText: 'Distributed payments infrastructure in Go, TypeScript, and PostgreSQL.',
      },
      {
        kind: 'resume',
        id: 'resume:res-backend-1',
        label: '@Resume: Backend Resume',
        resumeId: 'res-backend-1',
      },
    ];

    const payload = buildPinnedSubmissionPayload('strengthen impact metrics', pins);
    expect(payload.overrideResumeId).toBe('res-backend-1');
    expect(payload.contextPatch.activeResumeId).toBe('res-backend-1');
    expect(payload.contextPatch.activeResumeName).toBe('Backend Resume');
    expect(payload.contextPatch.focusSections).toEqual(['experience', 'projects']);
    expect(payload.contextPatch.jobDescriptionId).toBe('11111111-1111-4111-8111-111111111111');
    expect(payload.contextPatch.companyName).toBe('Stripe');
    expect(payload.contextPatch.jobTitle).toBe('Staff Backend Engineer');
    expect(payload.contextPatch.pinnedTargets).toHaveLength(5);
    expect(payload.content).toContain('Pinned experience[0].bullets[1]');
    expect(payload.content).toContain('@Job: Stripe');
    expect(payload.content).toContain('strengthen impact metrics');
  });

  it('renders accessible AgentMentionPopover listbox with sections, jobs, resumes, and empty filter state', () => {
    const sampleOptions: MentionOption[] = [
      {
        id: 'section:experience',
        kind: 'section',
        label: '@Experience',
        displayTitle: 'Experience',
        subtitle: 'Work history & achievement bullets',
        keywords: 'experience',
        item: { kind: 'section', id: 'section:experience', label: '@Experience', sectionKey: 'experience' },
      },
      {
        id: 'job:jd-stripe-1',
        kind: 'job',
        label: '@Job: Stripe',
        displayTitle: 'Stripe',
        subtitle: 'Staff Backend Engineer',
        keywords: 'job stripe',
        item: { kind: 'job', id: 'job:jd-stripe-1', label: '@Job: Stripe', companyName: 'Stripe', jobTitle: 'Staff Backend Engineer' },
      },
      {
        id: 'resume:res-backend-1',
        kind: 'resume',
        label: '@Resume: Backend',
        displayTitle: 'Backend',
        subtitle: 'Active resume',
        keywords: 'resume backend',
        item: { kind: 'resume', id: 'resume:res-backend-1', label: '@Resume: Backend', resumeId: 'res-backend-1' },
      },
    ];

    expect(
      renderToString(
        <AgentMentionPopover
          listboxId="lb-1"
          isOpen={false}
          query=""
          options={sampleOptions}
          highlightedIndex={0}
          onHighlight={() => {}}
          onSelect={() => {}}
          onClose={() => {}}
        />,
      ),
    ).toBe('');

    const html = renderToString(
      <AgentMentionPopover
        listboxId="lb-1"
        isOpen
        query=""
        options={sampleOptions}
        highlightedIndex={1}
        onHighlight={() => {}}
        onSelect={() => {}}
        onClose={() => {}}
      />,
    );
    expect(html).toContain('role="listbox"');
    expect(html).toContain('role="option"');
    expect(html).toContain('aria-selected="true"');
    expect(html).toContain('@Experience');
    expect(html).toContain('@Job: Stripe');
    expect(html).toContain('@Resume: Backend');

    const emptyHtml = renderToString(
      <AgentMentionPopover
        listboxId="lb-2"
        isOpen
        query="nonexistent"
        options={[]}
        highlightedIndex={0}
        onHighlight={() => {}}
        onSelect={() => {}}
        onClose={() => {}}
      />,
    );
    expect(emptyHtml).toContain('No matching sections, jobs, or resumes');
  });

  it('renders AgentPinnedChipsBar with bullet, section, job, and resume chips + live announcement', () => {
    const chips: ComposerPinnedItem[] = [
      {
        kind: 'bullet',
        id: 'bullet:experience[0].bullets[0]',
        label: 'Exp #1 · Bullet #1: "Architected Kafka pipeline"',
        sectionKey: 'experience',
        fieldPath: 'experience[0].bullets[0]',
        excerpt: 'Architected Kafka pipeline processing 120k events/sec',
      },
      { kind: 'section', id: 'section:skills', label: '@Skills', sectionKey: 'skills' },
      { kind: 'job', id: 'job:stripe', label: '@Job: Stripe', companyName: 'Stripe' },
      { kind: 'resume', id: 'resume:backend', label: '@Resume: Backend', resumeId: 'res-1' },
    ];

    const html = renderToString(
      <AgentPinnedChipsBar
        items={chips}
        onRemove={() => {}}
        liveAnnouncement="Pinned Exp #1 · Bullet #1 to chat context."
      />,
    );
    expect(html).toContain('data-testid="agent-pinned-chips-bar"');
    expect(html).toContain('data-testid="pinned-chip-bullet"');
    expect(html).toContain('data-testid="pinned-chip-section"');
    expect(html).toContain('data-testid="pinned-chip-job"');
    expect(html).toContain('data-testid="pinned-chip-resume"');
    expect(html).toContain('role="status"');
    expect(html).toContain('Pinned Exp #1');
  });

  it('renders AgentMentionTriggerButton and combobox-enabled AgentChatPanel composer', () => {
    const triggerHtml = renderToString(
      <AgentMentionTriggerButton isOpen={false} onClick={() => {}} />,
    );
    expect(triggerHtml).toContain('data-testid="agent-mention-trigger-btn"');
    expect(triggerHtml).toContain('aria-expanded="false"');

    const panelHtml = renderToString(
      <AgentChatPanel
        resumeId="res-backend-1"
        resumeName="Backend Resume"
        activeProposal={null}
        onProposalChange={() => {}}
        onProposalApproved={() => {}}
        client={createStubClient()}
      />,
    );
    expect(panelHtml).toContain('role="combobox"');
    expect(panelHtml).toContain('aria-autocomplete="list"');
    expect(panelHtml).toContain('data-testid="agent-mention-trigger-btn"');
    expect(panelHtml).toContain('Type @ to pin');
  });
});
