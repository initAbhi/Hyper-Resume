import { describe, expect, it, mock } from 'bun:test';
import React from 'react';
import { renderToString } from 'react-dom/server';
import {
  GlobalAgentProvider,
  mergeAgentContext,
  useGlobalAgent,
} from '../../lib/global-agent-context';
import { GlobalAgentButton } from './GlobalAgentButton';
import { GlobalAgentDrawer } from './GlobalAgentDrawer';
import {
  AgentApiClient,
  type RequestExecutor,
} from '../../lib/agent-client';

function renderHtml(node: React.ReactElement): string {
  return renderToString(node).replace(/<!-- -->/g, '');
}

function createMockAgentClient(responses: Record<string, unknown> = {}) {
  const calls: Array<{ endpoint: string; options?: RequestInit }> = [];
  const transport: RequestExecutor = {
    getBaseUrl: () => 'http://localhost:3001/api/v1',
    request: mock(async (endpoint: string, options?: RequestInit) => {
      calls.push({ endpoint, options });
      const key = `${(options?.method || 'GET').toUpperCase()} ${endpoint}`;
      if (key in responses) {
        return { data: responses[key] };
      }
      return { data: [] };
    }) as RequestExecutor['request'],
  };
  return { client: new AgentApiClient(transport), calls };
}

describe('Phase 4 Global Assistant Drawer & Cross-Service Context Sync', () => {
  describe('A. Context Model & Navigation Persistence', () => {
    it('preserves selected job and active resume across route navigation without overwriting', () => {
      const initial = {
        route: '/app/job-search',
        activeResumeId: 'res-1',
        activeResumeName: 'Staff Backend CV',
        activeJobId: 'job-stripe-1',
        jobTitle: 'Staff Infrastructure Engineer',
        companyName: 'Stripe',
      };

      // Navigate to /app/match -> keeps job & resume intact
      const onMatch = mergeAgentContext(initial, { route: '/app/match' });
      expect(onMatch.route).toBe('/app/match');
      expect(onMatch.activeResumeId).toBe('res-1');
      expect(onMatch.companyName).toBe('Stripe');
      expect(onMatch.jobTitle).toBe('Staff Infrastructure Engineer');

      // Navigate to /app/cover-letters with tone -> keeps all prior context
      const onCoverLetters = mergeAgentContext(onMatch, {
        route: '/app/cover-letters',
        tone: 'Technical',
      });
      expect(onCoverLetters.tone).toBe('Technical');
      expect(onCoverLetters.companyName).toBe('Stripe');
      expect(onCoverLetters.activeResumeId).toBe('res-1');

      // Duplicate identical update returns exact same reference (prevents render loops)
      const sameRef = mergeAgentContext(onCoverLetters, {
        route: '/app/cover-letters',
        tone: 'Technical',
      });
      expect(sameRef).toBe(onCoverLetters);
    });

    it('ignores undefined fields in context patch so explicit user selections are not cleared accidentally', () => {
      const prev = {
        route: '/app/match',
        activeResumeId: 'res-1',
        jobTitle: 'Senior Engineer',
        companyName: 'Linear',
      };
      const next = mergeAgentContext(prev, {
        activeResumeId: undefined,
        companyName: undefined,
        route: '/app/interview',
      });
      expect(next.activeResumeId).toBe('res-1');
      expect(next.companyName).toBe('Linear');
      expect(next.route).toBe('/app/interview');
    });
  });

  describe('B. GlobalAgentButton & GlobalAgentDrawer UI & Accessibility', () => {
    it('renders accessible floating button and native <dialog> drawer inside GlobalAgentProvider', () => {
      const { client } = createMockAgentClient();
      const html = renderHtml(
        <GlobalAgentProvider
          client={client}
          overrideUserId="user-1"
          overridePathname="/app/job-search"
        >
          <GlobalAgentButton />
          <GlobalAgentDrawer />
        </GlobalAgentProvider>,
      );

      // Floating trigger button
      expect(html).toContain('data-testid="global-agent-button"');
      expect(html).toContain('aria-controls="global-agent-drawer"');
      expect(html).toContain('aria-expanded="false"');
      expect(html).toContain('AI Career Agent');

      // Native top-layer <dialog> drawer (no redundant role="dialog" or aria-modal)
      expect(html).toContain('<dialog');
      expect(html).toContain('id="global-agent-drawer"');
      expect(html).not.toContain('role="dialog"');
      expect(html).not.toContain('aria-modal="true"');
      expect(html).toContain('AI Career Assistant');
      expect(html).toContain('Ask the AI Career Assistant');
      expect(html).toContain('Closing drawer keeps tasks running');
    });

    it('exposes GlobalAgentContext hook cleanly to nested page consumers', () => {
      const { client } = createMockAgentClient();
      function ContextProbe() {
        const ctx = useGlobalAgent();
        return <div data-route={ctx.pageContext.route} data-open={String(ctx.isOpen)} />;
      }

      const html = renderHtml(
        <GlobalAgentProvider
          client={client}
          overrideUserId="user-1"
          overridePathname="/app/cover-letters"
        >
          <ContextProbe />
        </GlobalAgentProvider>,
      );

      expect(html).toContain('data-route="/app/cover-letters"');
      expect(html).toContain('data-open="false"');
    });
  });

  describe('C. Cross-Service Client Payloads & Post-Approval Resumption', () => {
    it('submits cross-service page context alongside user instruction and handles resumed=true approval response', async () => {
      const { client, calls } = createMockAgentClient({
        'POST /agent/conversations/conv-global/messages': {
          taskId: 'task-wf-1',
          conversationId: 'conv-global',
          messageId: 'msg-1',
        },
        'POST /agent/tasks/task-wf-1/approve': {
          success: true,
          newVersion: 5,
          resumed: true,
        },
      });

      const submitRes = await client.submitMessage('conv-global', {
        content: 'Tailor my resume for this Stripe role and draft a Technical cover letter.',
        activeResumeId: 'res-1',
        idempotencyKey: 'idem-wf-1',
        context: {
          route: '/app/job-search',
          activeResumeId: 'res-1',
          jobTitle: 'Staff Infrastructure Engineer',
          companyName: 'Stripe',
          tone: 'Technical',
        },
      });

      expect(submitRes.taskId).toBe('task-wf-1');
      const sentBody = JSON.parse(String(calls[0].options?.body));
      expect(sentBody.context.companyName).toBe('Stripe');
      expect(sentBody.context.tone).toBe('Technical');

      const approveRes = await client.approveProposal('task-wf-1', {
        executionId: 'exec-1',
        proposalHash: 'a'.repeat(64),
      });

      expect(approveRes).toEqual({
        success: true,
        newVersion: 5,
        resumed: true,
      });
    });
  });
});
