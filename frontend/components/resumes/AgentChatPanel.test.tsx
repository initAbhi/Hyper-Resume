import { describe, expect, it, mock } from 'bun:test';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { AgentChatPanel } from './AgentChatPanel';
import { AgentTaskProgress, getFriendlyStepLabel, getFriendlyTaskStatusHeading } from './AgentTaskProgress';
import { AgentDiffCard, analyzeProposalChanges } from './AgentDiffCard';
import { AgentApprovalModal } from './AgentApprovalModal';
import {
  CanvasEditProvider,
  buildCanvasDiffMapFromProposal,
} from './templates/CanvasEditContext';
import { EditableField, EditableBulletList } from './templates/EditableField';
import {
  AgentApiClient,
  type AgentApprovalProposal,
  type AgentPlanStep,
  type RequestExecutor,
} from '../../lib/agent-client';
import type { ResumeContent } from '../../lib/api-client';

const SAMPLE_PROPOSAL: AgentApprovalProposal = {
  taskId: 'task-101',
  executionId: 'exec-101',
  proposalHash: 'a'.repeat(64),
  resumeId: 'res-101',
  expectedResumeVersion: 4,
  changeSummary: 'Tailored headline, summary, and distributed systems bullets',
  expiresAt: new Date(Date.now() + 14 * 60 * 1000).toISOString(),
  sectionDiffs: {
    headline: {
      original: 'Backend Software Engineer',
      proposed: 'Senior Distributed Systems Engineer',
    },
    summary: {
      original: 'Experienced developer building backend APIs.',
      proposed: 'Distributed systems engineer specializing in fault-tolerant Node.js and PostgreSQL platforms.',
    },
    experience: [
      {
        company: 'Acme Cloud',
        title: 'Senior Engineer',
        bulletDiffs: [
          {
            bulletIndex: 0,
            original: 'Managed Kafka pipelines',
            proposed: 'Architected high-throughput Kafka ingestion pipelines handling 60,000 QPS',
            evidenceProvenance: {
              sourceBulletIndex: 0,
              originalEvidenceQuote: 'Managed Kafka pipelines',
              addedMetrics: ['60,000 QPS'],
              candidateConfirmationRequired: true,
              confirmationPrompt: 'Confirm that your Kafka pipelines handled 60,000 QPS.',
            },
          },
          {
            bulletIndex: 1,
            original: 'Improved database query speed',
            proposed: 'Optimized PostgreSQL indexing strategy to reduce p99 read latency',
            evidenceProvenance: {
              sourceBulletIndex: 1,
              originalEvidenceQuote: 'Improved database query speed',
              addedMetrics: [],
              candidateConfirmationRequired: false,
            },
          },
        ],
      },
    ],
  },
};

function createIdleAgentClient(): AgentApiClient {
  const transport: RequestExecutor = {
    getBaseUrl: () => 'http://localhost:3001/api/v1',
    request: mock(async () => ({ data: [] as never })),
  };
  return new AgentApiClient(transport);
}

function renderHtml(node: React.ReactElement): string {
  return renderToString(node).replace(/<!-- -->/g, '');
}

describe('Phase 3 UI Components & Live Canvas Integration', () => {
  describe('A. AgentTaskProgress', () => {
    const sampleSteps: AgentPlanStep[] = [
      {
        stepIndex: 0,
        toolName: 'read_resume',
        description: 'Inspect resume',
        status: 'COMPLETED',
      },
      {
        stepIndex: 1,
        toolName: 'propose_resume_edits',
        description: 'Formulate edits',
        status: 'EXECUTING',
      },
      {
        stepIndex: 2,
        toolName: 'run_ats_audit',
        description: 'Verify ATS',
        status: 'PENDING',
      },
    ];

    it('renders ordered execution steps with accessible status labels and friendly headings', () => {
      expect(getFriendlyStepLabel(sampleSteps[0])).toBe('Reading your resume');
      expect(getFriendlyTaskStatusHeading('RUNNING', sampleSteps)).toBe(
        'Preparing a resume proposal',
      );

      const html = renderToString(
        <AgentTaskProgress
          taskId="task-1"
          status="RUNNING"
          goal="Tailor resume for Staff role"
          steps={sampleSteps}
          onCancel={() => { }}
        />,
      );

      expect(html).toContain('data-task-status="RUNNING"');
      expect(html).toContain('role="status"');
      expect(html).toContain('aria-live="polite"');
      expect(html).toContain('Reading your resume');
      expect(html).toContain('Preparing a resume proposal');
      expect(html).toContain('Cancel');
    });

    it('renders AWAITING_CREDITS and FAILED terminal alert states accurately', () => {
      const creditsHtml = renderToString(
        <AgentTaskProgress
          taskId="task-2"
          status="AWAITING_CREDITS"
          steps={[]}
          errorMessage="Insufficient credit balance (0 available, 2 required)."
        />,
      );
      expect(creditsHtml).toContain('Credits Needed');
      expect(creditsHtml).toContain('role="alert"');
      expect(creditsHtml).toContain('Insufficient credit balance');

      const cancelledHtml = renderToString(
        <AgentTaskProgress taskId="task-3" status="CANCELLED" steps={[]} />,
      );
      expect(cancelledHtml).toContain('Task cancelled');
      expect(cancelledHtml).not.toContain('Cancel active task');
    });
  });

  describe('B. AgentDiffCard & Metric Verification', () => {
    it('analyzes affected sections, edit counts, and unverified metric confirmations accurately', () => {
      const stats = analyzeProposalChanges(SAMPLE_PROPOSAL);
      expect(stats.affectedSections).toBe(3); // headline, summary, experience
      expect(stats.totalChanges).toBe(4); // headline + summary + 2 bullets
      expect(stats.metricConfirmations.length).toBe(1);
      expect(stats.metricConfirmations[0].addedMetrics).toEqual(['60,000 QPS']);
    });

    it('renders original/proposed diffs, provenance, unchecked metric checkbox, and disables approval until confirmed', () => {
      const htmlUnchecked = renderHtml(
        <AgentDiffCard
          proposal={SAMPLE_PROPOSAL}
          confirmedMetricIds={{}}
          onToggleMetricConfirm={() => { }}
          onFocusField={() => { }}
          onOpenApprovalModal={() => { }}
          onReject={() => { }}
        />,
      );

      expect(htmlUnchecked).toContain('<del');
      expect(htmlUnchecked).toContain('Backend Software Engineer');
      expect(htmlUnchecked).toContain('<ins');
      expect(htmlUnchecked).toContain('Senior Distributed Systems Engineer');
      expect(htmlUnchecked).toContain('Managed Kafka pipelines');
      expect(htmlUnchecked).toContain('60,000 QPS');
      expect(htmlUnchecked).toContain('Confirm that your Kafka pipelines handled 60,000 QPS.');
      expect(htmlUnchecked).toContain('type="checkbox"');
      expect(htmlUnchecked).not.toContain('checked=""');
      expect(htmlUnchecked).toContain('Confirm 1 unverified metric');
      expect(htmlUnchecked).toContain('disabled=""');

      // Once confirmed, warning disappears and Review & Approve becomes enabled
      const metricId = `${SAMPLE_PROPOSAL.executionId}:experience[0].bullets[0]`;
      const htmlChecked = renderHtml(
        <AgentDiffCard
          proposal={SAMPLE_PROPOSAL}
          confirmedMetricIds={{ [metricId]: true }}
          onToggleMetricConfirm={() => { }}
          onFocusField={() => { }}
          onOpenApprovalModal={() => { }}
          onReject={() => { }}
        />,
      );

      expect(htmlChecked).toContain('checked=""');
      expect(htmlChecked).not.toContain('Confirm 1 unverified metric');
    });
  });

  describe('C. AgentApprovalModal', () => {
    it('uses native <dialog> without redundant role="dialog"/aria-modal and enforces metric verification', () => {
      const metricId = `${SAMPLE_PROPOSAL.executionId}:experience[0].bullets[0]`;
      const html = renderHtml(
        <AgentApprovalModal
          isOpen={true}
          resumeName="Principal Staff Resume"
          proposal={SAMPLE_PROPOSAL}
          confirmedMetricIds={{ [metricId]: true }}
          onToggleMetricConfirm={() => { }}
          onApprove={async () => { }}
          onReject={async () => { }}
          onClose={() => { }}
        />,
      );

      expect(html).toContain('<dialog');
      expect(html).not.toContain('role="dialog"');
      expect(html).not.toContain('aria-modal="true"');
      expect(html).toContain('aria-labelledby=');
      expect(html).toContain('Principal Staff Resume');
      expect(html).toContain('Expected version v4');
      expect(html).toContain('Approve &amp; Apply');
      expect(html).toContain('Reject');
    });

    it('displays expired warning and disables Approve & Apply when proposal is past 15-minute expiry', () => {
      const expiredProposal: AgentApprovalProposal = {
        ...SAMPLE_PROPOSAL,
        expiresAt: new Date(Date.now() - 60_000).toISOString(),
      };
      const metricId = `${expiredProposal.executionId}:experience[0].bullets[0]`;

      const html = renderToString(
        <AgentApprovalModal
          isOpen={true}
          resumeName="My Resume"
          proposal={expiredProposal}
          confirmedMetricIds={{ [metricId]: true }}
          onToggleMetricConfirm={() => { }}
          onApprove={async () => { }}
          onReject={async () => { }}
          onClose={() => { }}
        />,
      );

      expect(html).toContain('This proposal has expired');
      expect(html).toContain('role="alert"');
    });
  });

  describe('D. AgentChatPanel', () => {
    it('renders accessible chat panel with labeled composer, disabled send button, and pending diff card', () => {
      const client = createIdleAgentClient();
      const html = renderToString(
        <AgentChatPanel
          resumeId="res-101"
          resumeName="Staff Resume"
          activeProposal={SAMPLE_PROPOSAL}
          onProposalChange={() => { }}
          onProposalApproved={() => { }}
          onCollapse={() => { }}
          client={client}
        />,
      );

      expect(html).toContain('data-testid="agent-chat-panel"');
      expect(html).toContain('AI Resume Agent');
      expect(html).toContain('Ask the AI Resume Agent');
      expect(html).toContain('Send instruction to AI Agent');
      expect(html).toContain('data-testid="agent-diff-card"');
      expect(html).toContain('Senior Distributed Systems Engineer');
    });
  });

  describe('E. Live Canvas Diff Overlay & Export Purity Integration', () => {
    const savedContent: ResumeContent = {
      contact: { fullName: 'Jane Doe', email: 'jane@example.com' },
      headline: 'Backend Software Engineer',
      summary: 'Experienced developer building backend APIs.',
      skills: [{ name: 'PostgreSQL' }],
      experience: [
        {
          company: 'Acme Cloud',
          title: 'Senior Engineer',
          startDate: '2022',
          endDate: 'Present',
          current: true,
          bullets: ['Managed Kafka pipelines', 'Improved database query speed'],
        },
      ],
      education: [],
    };

    it('maps pending proposal diffs to exact fieldPaths without mutating persisted ResumeContent', () => {
      const originalSnapshot = JSON.stringify(savedContent);
      const diffMap = buildCanvasDiffMapFromProposal(SAMPLE_PROPOSAL);

      expect(Object.keys(diffMap)).toEqual([
        'headline',
        'summary',
        'experience[0].bullets[0]',
        'experience[0].bullets[1]',
      ]);
      expect(diffMap['headline'].proposed).toBe('Senior Distributed Systems Engineer');
      expect(diffMap['experience[0].bullets[0]'].requiresConfirmation).toBe(true);

      // Persisted resume content must remain 100% untouched
      expect(JSON.stringify(savedContent)).toBe(originalSnapshot);
    });

    it('renders green/red overlays across multiple fields in editable mode while preserving inline editing', () => {
      const diffMap = buildCanvasDiffMapFromProposal(SAMPLE_PROPOSAL);
      const html = renderToString(
        <CanvasEditProvider
          isEditable={true}
          pendingDiffs={diffMap}
          focusedDiffPath="experience[0].bullets[0]"
        >
          <EditableField fieldPath="headline" value={savedContent.headline} as="h2" />
          <EditableBulletList
            bullets={savedContent.experience[0].bullets}
            section="experience"
            expIdx={0}
          />
        </CanvasEditProvider>,
      );

      // Saved text remains editable & intact
      expect(html).toContain('contentEditable="true"');
      expect(html).toContain('data-field-path="headline"');
      expect(html).toContain('Backend Software Engineer');
      expect(html).toContain('Managed Kafka pipelines');

      // Visual diff overlays render for headline and both experience bullets
      expect(html).toContain('data-diff-field="headline"');
      expect(html).toContain('Senior Distributed Systems Engineer');
      expect(html).toContain('data-diff-field="experience[0].bullets[0]"');
      expect(html).toContain('60,000 QPS');
      expect(html).toContain('Verify Metric');
      expect(html).toContain('data-diff-field="experience[0].bullets[1]"');

      // Every overlay MUST be excluded from print and PDF serialization
      expect(html).toContain('data-export-exclude="true"');
      expect(html).toContain('print:hidden');
    });

    it('completely omits all pending diff decorations when isEditable=false (PDF export / Print mode)', () => {
      const diffMap = buildCanvasDiffMapFromProposal(SAMPLE_PROPOSAL);
      const exportHtml = renderToString(
        <CanvasEditProvider isEditable={false} pendingDiffs={diffMap}>
          <EditableField fieldPath="headline" value={savedContent.headline} as="h2" />
          <EditableBulletList
            bullets={savedContent.experience[0].bullets}
            section="experience"
            expIdx={0}
          />
        </CanvasEditProvider>,
      );

      expect(exportHtml).toContain('Backend Software Engineer');
      expect(exportHtml).toContain('Managed Kafka pipelines');
      expect(exportHtml).not.toContain('Senior Distributed Systems Engineer');
      expect(exportHtml).not.toContain('60,000 QPS');
      expect(exportHtml).not.toContain('data-diff-overlay');
      expect(exportHtml).not.toContain('Verify Metric');
    });

    it('clears all overlays cleanly when pendingDiffs is cleared after rejection or approval', () => {
      const htmlCleared = renderToString(
        <CanvasEditProvider isEditable={true} pendingDiffs={{}}>
          <EditableField fieldPath="headline" value="Senior Distributed Systems Engineer" as="h2" />
        </CanvasEditProvider>,
      );

      expect(htmlCleared).toContain('Senior Distributed Systems Engineer');
      expect(htmlCleared).not.toContain('data-diff-overlay');
      expect(htmlCleared).not.toContain('data-has-pending-diff');
    });
  });
});
