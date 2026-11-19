import { describe, expect, it } from 'bun:test';
import React from 'react';
import { renderToString } from 'react-dom/server';
import {
  AgentAttachmentStatusBar,
  AgentAttachmentToolbar,
  AgentDropOverlay,
  type ComposerAttachmentState,
} from './AgentComposerAttachments';
import { AgentApiClient, type RequestExecutor } from '../../lib/agent-client';

describe('AgentComposerAttachments & AgentApiClient attachment endpoints', () => {
  it('renders drop overlay only when visible is true', () => {
    expect(renderToString(<AgentDropOverlay visible={false} />)).toBe('');
    const html = renderToString(<AgentDropOverlay visible />);
    expect(html).toContain('Drop PDF, DOCX, or TXT to attach');
    expect(html).toContain('agent-drop-overlay');
  });

  it('renders parsed resume chip with instant ATS score and quick actions', () => {
    const state: ComposerAttachmentState = {
      status: 'ready',
      fileName: 'Alex_Resume.pdf',
      parsedResume: {
        kind: 'resume',
        fileName: 'Alex_Resume.pdf',
        resumeId: 'res-42',
        resumeName: 'Alex Resume',
        atsScore: 84,
        topIssues: ['Quantify 2 bullets'],
        extractedTextLength: 1200,
        skillsCount: 10,
        experienceCount: 3,
      },
      parsedJd: null,
      errorMessage: null,
      liveAnnouncement: 'Resume Alex Resume parsed.',
    };

    const html = renderToString(
      <AgentAttachmentStatusBar
        state={state}
        showUrlBar={false}
        urlInput=""
        onUrlInputChange={() => {}}
        onSubmitUrl={() => {}}
        onCloseUrlBar={() => {}}
        onClearResume={() => {}}
        onClearJd={() => {}}
        onClearError={() => {}}
        onQuickPrompt={() => {}}
        showOpenResumeLink
      />,
    );

    expect(html).toContain('Alex Resume');
    expect(html).toContain('ATS 84/100');
    expect(html).toContain('Fix to ATS 95+');
    expect(html).toContain('/app/resumes/res-42');
  });

  it('renders parsed JD chip, inline JD URL bar, and error alert cleanly', () => {
    const state: ComposerAttachmentState = {
      status: 'ready',
      parsedResume: null,
      parsedJd: {
        kind: 'jd',
        jobDescriptionId: 'jd-99',
        title: 'Senior Full-Stack Engineer',
        companyName: 'Linear',
        workplace: 'Remote',
        applyUrl: 'https://jobs.ashbyhq.com/linear/123',
        descriptionText: 'Build fast TypeScript apps.',
        extractedTextLength: 26,
      },
      errorMessage: 'Private IP blocked for security.',
      liveAnnouncement: 'Job description parsed.',
    };

    const html = renderToString(
      <AgentAttachmentStatusBar
        state={state}
        showUrlBar
        urlInput="https://jobs.ashbyhq.com/linear/123"
        onUrlInputChange={() => {}}
        onSubmitUrl={() => {}}
        onCloseUrlBar={() => {}}
        onClearResume={() => {}}
        onClearJd={() => {}}
        onClearError={() => {}}
        onQuickPrompt={() => {}}
      />,
    );

    expect(html).toContain('agent-jd-url-bar');
    expect(html).toContain('Senior Full-Stack Engineer @ Linear');
    expect(html).toContain('Remote');
    expect(html).toContain('Match Resume');
    expect(html).toContain('Tailor Resume');
    expect(html).toContain('Private IP blocked for security.');
  });

  it('renders accessible file and URL toolbar controls', () => {
    const ref = { current: null } as React.RefObject<HTMLInputElement | null>;
    const html = renderToString(
      <AgentAttachmentToolbar
        fileInputRef={ref}
        onFileSelected={() => {}}
        onOpenFilePicker={() => {}}
        showUrlBar={false}
        onToggleUrlBar={() => {}}
      />,
    );

    expect(html).toContain('agent-attach-file-btn');
    expect(html).toContain('agent-attach-url-btn');
    expect(html).toContain('.pdf,.docx,.txt');
  });

  it('calls POST /agent/attachments/parse and POST /agent/attachments/parse-url via AgentApiClient', async () => {
    const calls: Array<{ endpoint: string; method?: string; body?: unknown }> = [];
    const transport: RequestExecutor = {
      async request<T>(endpoint: string, options?: RequestInit) {
        calls.push({ endpoint, method: options?.method, body: options?.body });
        if (endpoint === '/agent/attachments/parse-url') {
          return {
            data: {
              kind: 'jd',
              jobDescriptionId: 'jd-1',
              title: 'Staff Engineer',
              companyName: 'Stripe',
              descriptionText: 'Payments API',
              extractedTextLength: 12,
            } as T,
          };
        }
        return {
          data: {
            kind: 'resume',
            fileName: 'cv.pdf',
            resumeId: 'res-1',
            resumeName: 'cv',
            atsScore: 79,
            topIssues: [],
            extractedTextLength: 500,
            skillsCount: 5,
            experienceCount: 2,
          } as T,
        };
      },
      getBaseUrl: () => 'http://localhost:3001/api/v1',
    };

    const client = new AgentApiClient(transport);
    const jdRes = await client.parseJobUrl('https://stripe.com/jobs/123');
    expect(jdRes.jobDescriptionId).toBe('jd-1');
    expect(calls[0].endpoint).toBe('/agent/attachments/parse-url');
    expect(calls[0].method).toBe('POST');

    const file = new File(['%PDF-1.4 test'], 'cv.pdf', { type: 'application/pdf' });
    const fileRes = await client.uploadAttachment(file);
    expect(fileRes.kind).toBe('resume');
    expect(calls[1].endpoint).toBe('/agent/attachments/parse');
    expect(calls[1].body instanceof FormData).toBe(true);
  });
});
