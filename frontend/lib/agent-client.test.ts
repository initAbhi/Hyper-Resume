import { describe, expect, it, mock } from 'bun:test';
import {
  AgentApiClient,
  formatAgentApprovalError,
  normalizeStreamEventType,
  type EventSourceLike,
  type RequestExecutor,
} from './agent-client';
import { ApiError } from './api-client';

class FakeEventSource implements EventSourceLike {
  static instances: FakeEventSource[] = [];
  readyState = 1;
  onopen: ((ev: Event) => unknown) | null = null;
  onerror: ((ev: Event) => unknown) | null = null;
  onmessage: ((ev: MessageEvent) => unknown) | null = null;
  closed = false;
  url: string;
  private listeners = new Map<string, Array<(ev: MessageEvent) => void>>();

  constructor(url: string) {
    this.url = url;
    FakeEventSource.instances.push(this);
  }

  addEventListener(type: string, listener: (ev: MessageEvent) => void) {
    const list = this.listeners.get(type) || [];
    list.push(listener);
    this.listeners.set(type, list);
  }

  removeEventListener(type: string, listener: (ev: MessageEvent) => void) {
    const list = this.listeners.get(type) || [];
    this.listeners.set(
      type,
      list.filter((l) => l !== listener),
    );
  }

  emitOpen() {
    this.onopen?.(new Event('open'));
  }

  emitEvent(type: string, data: unknown, lastEventId: string = '') {
    const payload = typeof data === 'string' ? data : JSON.stringify(data);
    const ev = { data: payload, lastEventId } as MessageEvent;
    const handlers = this.listeners.get(type) || [];
    handlers.forEach((h) => h(ev));
  }

  emitMessage(data: unknown, lastEventId: string = '') {
    const payload = typeof data === 'string' ? data : JSON.stringify(data);
    this.onmessage?.({ data: payload, lastEventId } as MessageEvent);
  }

  emitError() {
    this.onerror?.(new Event('error'));
  }

  close() {
    this.closed = true;
    this.readyState = 2;
  }
}

function createMockTransport(responses: Record<string, unknown> = {}) {
  const calls: Array<{ endpoint: string; options?: RequestInit }> = [];
  const transport: RequestExecutor = {
    getBaseUrl: () => 'http://localhost:3001/api/v1',
    request: mock(async (endpoint: string, options?: RequestInit) => {
      calls.push({ endpoint, options });
      const key = `${(options?.method || 'GET').toUpperCase()} ${endpoint}`;
      if (key in responses) {
        const val = responses[key];
        if (val instanceof Error) throw val;
        return { data: typeof val === 'function' ? (val as () => unknown)() : val };
      }
      throw new Error(`Unexpected endpoint call: ${key}`);
    }) as RequestExecutor['request'],
  };
  return { transport, calls };
}

describe('AgentApiClient & Ticket-Authenticated SSE Stream (Phase 3)', () => {
  it('creates a conversation via POST /agent/conversations', async () => {
    const { transport, calls } = createMockTransport({
      'POST /agent/conversations': {
        id: 'conv-1',
        userId: 'user-1',
        activeResumeId: 'res-1',
        title: 'Tailoring Session',
        createdAt: '2026-11-18T00:00:00Z',
        updatedAt: '2026-11-18T00:00:00Z',
      },
    });
    const client = new AgentApiClient(transport);

    const conv = await client.createConversation({
      activeResumeId: 'res-1',
      title: 'Tailoring Session',
    });

    expect(conv.id).toBe('conv-1');
    expect(calls[0].endpoint).toBe('/agent/conversations');
    expect(JSON.parse(String(calls[0].options?.body))).toEqual({
      activeResumeId: 'res-1',
      title: 'Tailoring Session',
    });
  });

  it('submits user message via POST /agent/conversations/:id/messages with idempotencyKey', async () => {
    const { transport, calls } = createMockTransport({
      'POST /agent/conversations/conv-1/messages': {
        taskId: 'task-42',
        conversationId: 'conv-1',
        messageId: 'msg-99',
      },
    });
    const client = new AgentApiClient(transport);

    const res = await client.submitMessage('conv-1', {
      content: 'Audit my resume for ATS compliance',
      activeResumeId: 'res-1',
      idempotencyKey: 'idem-1',
    });

    expect(res).toEqual({
      taskId: 'task-42',
      conversationId: 'conv-1',
      messageId: 'msg-99',
    });
    expect(JSON.parse(String(calls[0].options?.body))).toEqual({
      content: 'Audit my resume for ATS compliance',
      activeResumeId: 'res-1',
      idempotencyKey: 'idem-1',
    });
  });

  it('exchanges a single-use ticket and connects EventSource without exposing JWT in query params', async () => {
    FakeEventSource.instances = [];
    const { transport } = createMockTransport({
      'POST /agent/conversations/conv-1/stream-ticket': {
        ticket: 'a'.repeat(64),
        expiresInSeconds: 30,
      },
    });
    const client = new AgentApiClient(transport);

    let opened = false;
    const conn = client.connectToStream(
      'conv-1',
      {
        onOpen: () => {
          opened = true;
        },
      },
      { EventSourceCtor: FakeEventSource },
    );

    await new Promise((r) => setTimeout(r, 10));

    expect(FakeEventSource.instances.length).toBe(1);
    const es = FakeEventSource.instances[0];
    expect(es.url).toBe(
      `http://localhost:3001/api/v1/agent/conversations/conv-1/stream?ticket=${'a'.repeat(64)}`,
    );
    expect(es.url).not.toContain('Bearer');
    expect(es.url).not.toContain('jwt');

    es.emitOpen();
    expect(opened).toBe(true);

    conn.disconnect();
    expect(es.closed).toBe(true);
  });

  it('parses ordered SSE events, suppresses duplicates, and handles unknown events safely', async () => {
    FakeEventSource.instances = [];
    const { transport } = createMockTransport({
      'POST /agent/conversations/conv-1/stream-ticket': {
        ticket: 'b'.repeat(64),
        expiresInSeconds: 30,
      },
    });
    const client = new AgentApiClient(transport);

    const order: string[] = [];
    const unknownTypes: string[] = [];
    let approvalHash = '';

    const conn = client.connectToStream(
      'conv-1',
      {
        onTaskStatus: (d, id) => order.push(`status:${id}:${d.status}`),
        onPlanCreated: (d, id) => order.push(`plan:${id}:${d.steps.length}`),
        onStepProgress: (d, id) => order.push(`step:${id}:${d.toolName}:${d.status}`),
        onApprovalRequested: (p, id) => {
          approvalHash = p.proposalHash;
          order.push(`approval:${id}`);
        },
        onUnknownEvent: (ev) => unknownTypes.push(ev.rawType),
      },
      { EventSourceCtor: FakeEventSource },
    );

    await new Promise((r) => setTimeout(r, 10));
    const es = FakeEventSource.instances[0];

    es.emitEvent('task_status', { taskId: 't-1', status: 'PLANNING' }, '1');
    // Duplicate sequence 1 must be suppressed
    es.emitEvent('task_status', { taskId: 't-1', status: 'PLANNING' }, '1');
    es.emitEvent(
      'plan_created',
      {
        taskId: 't-1',
        goal: 'Optimize resume',
        steps: [{ stepIndex: 0, toolName: 'read_resume', description: 'Read', status: 'PENDING' }],
      },
      '2',
    );
    es.emitEvent(
      'step_progress',
      { taskId: 't-1', stepIndex: 0, toolName: 'read_resume', status: 'COMPLETED' },
      '3',
    );
    // Out-of-order stale event 2 must be dropped
    es.emitEvent('plan_created', { taskId: 't-1', goal: 'Stale', steps: [] }, '2');
    // Unknown event via message channel must not throw
    es.emitMessage({ type: 'future_event_v9', id: '4', data: { hello: 'world' } });
    es.emitEvent(
      'approval_requested',
      {
        taskId: 't-1',
        executionId: 'exec-1',
        proposalHash: 'c'.repeat(64),
        resumeId: 'res-1',
        expectedResumeVersion: 2,
        sectionDiffs: { headline: { original: 'Dev', proposed: 'Senior Dev' } },
        expiresAt: new Date(Date.now() + 60000).toISOString(),
      },
      '5',
    );

    expect(order).toEqual([
      'status:1:PLANNING',
      'plan:2:1',
      'step:3:read_resume:COMPLETED',
      'approval:5',
    ]);
    expect(unknownTypes).toEqual(['future_event_v9']);
    expect(approvalHash).toBe('c'.repeat(64));
    expect(conn.getLastEventId()).toBe('5');

    conn.disconnect();
  });

  it('reconnects with bounded exponential backoff, fresh ticket, and lastEventId watermark', async () => {
    FakeEventSource.instances = [];
    let ticketCounter = 0;
    const { transport } = createMockTransport({
      'POST /agent/conversations/conv-1/stream-ticket': () => ({
        ticket: `ticket-${++ticketCounter}`,
        expiresInSeconds: 30,
      }),
    });
    const client = new AgentApiClient(transport);

    const reconnectDelays: number[] = [];
    const conn = client.connectToStream(
      'conv-1',
      {
        onReconnecting: (_attempt, delayMs) => reconnectDelays.push(delayMs),
      },
      {
        EventSourceCtor: FakeEventSource,
        baseRetryDelayMs: 15,
        maxRetryDelayMs: 60,
        maxRetries: 2,
      },
    );

    await new Promise((r) => setTimeout(r, 10));
    expect(FakeEventSource.instances.length).toBe(1);

    // Emit event 7 so lastEventId advances before drop
    FakeEventSource.instances[0].emitEvent('task_status', { taskId: 't-1', status: 'RUNNING' }, '7');
    FakeEventSource.instances[0].emitError();

    await new Promise((r) => setTimeout(r, 35));
    expect(FakeEventSource.instances.length).toBe(2);
    expect(FakeEventSource.instances[1].url).toContain('ticket=ticket-2');
    expect(FakeEventSource.instances[1].url).toContain('lastEventId=7');
    expect(reconnectDelays[0]).toBe(15);

    // Trigger second error -> backoff doubles to 30ms
    FakeEventSource.instances[1].emitError();
    await new Promise((r) => setTimeout(r, 50));
    expect(FakeEventSource.instances.length).toBe(3);
    expect(reconnectDelays[1]).toBe(30);

    // Third error exceeds maxRetries (2) -> stops reconnecting
    let fatalError = '';
    const errors: string[] = [];
    FakeEventSource.instances[2].emitError();
    await new Promise((r) => setTimeout(r, 40));
    expect(FakeEventSource.instances.length).toBe(3);
    expect(fatalError).toBe('');
    expect(errors.length).toBe(0);

    conn.disconnect();
  });

  it('does not reconnect after reaching a terminal task state (task_completed)', async () => {
    FakeEventSource.instances = [];
    const { transport } = createMockTransport({
      'POST /agent/conversations/conv-1/stream-ticket': {
        ticket: 'term-ticket',
        expiresInSeconds: 30,
      },
    });
    const client = new AgentApiClient(transport);

    let completed = false;
    const conn = client.connectToStream(
      'conv-1',
      {
        onTaskCompleted: () => {
          completed = true;
        },
      },
      { EventSourceCtor: FakeEventSource, baseRetryDelayMs: 10 },
    );

    await new Promise((r) => setTimeout(r, 10));
    const es = FakeEventSource.instances[0];
    es.emitEvent('task_completed', { taskId: 't-1', summary: 'Done' }, '10');

    expect(completed).toBe(true);
    expect(es.closed).toBe(true);
    expect(conn.isActive()).toBe(false);

    // Late error after completion must not spawn reconnect
    es.emitError();
    await new Promise((r) => setTimeout(r, 25));
    expect(FakeEventSource.instances.length).toBe(1);
  });

  it('sends approve, reject, and cancel requests with exact Phase 2 DTO contracts', async () => {
    const { transport, calls } = createMockTransport({
      'POST /agent/tasks/task-1/approve': { success: true, newVersion: 5 },
      'POST /agent/tasks/task-2/approve': { success: true, rejected: true },
      'POST /agent/tasks/task-3/cancel': { id: 'task-3', status: 'CANCELLED' },
    });
    const client = new AgentApiClient(transport);

    const approveRes = await client.approveProposal('task-1', {
      executionId: 'exec-1',
      proposalHash: 'd'.repeat(64),
    });
    expect(approveRes).toEqual({ success: true, newVersion: 5 });
    expect(JSON.parse(String(calls[0].options?.body))).toEqual({
      executionId: 'exec-1',
      proposalHash: 'd'.repeat(64),
      decision: 'approve',
    });

    const rejectRes = await client.rejectProposal('task-2', {
      executionId: 'exec-2',
      proposalHash: 'e'.repeat(64),
    });
    expect(rejectRes).toEqual({ success: true, rejected: true });
    expect(JSON.parse(String(calls[1].options?.body))).toEqual({
      executionId: 'exec-2',
      proposalHash: 'e'.repeat(64),
      decision: 'reject',
    });

    const cancelRes = await client.cancelTask('task-3');
    expect(cancelRes.status).toBe('CANCELLED');
    expect(calls[2].endpoint).toBe('/agent/tasks/task-3/cancel');
  });

  it('normalizes uppercase event aliases and maps approval HTTP errors cleanly', () => {
    expect(normalizeStreamEventType('PLAN_CREATED')).toBe('plan_created');
    expect(normalizeStreamEventType('AWAITING_APPROVAL')).toBe('approval_requested');
    expect(normalizeStreamEventType('TASK_FAILED')).toBe('task_failed');
    expect(normalizeStreamEventType('unrecognized_event')).toBe('unknown');

    const conflict = formatAgentApprovalError(
      new ApiError({
        statusCode: 409,
        code: 'CONFLICT',
        message: 'Resume modified',
        details: [],
        requestId: 'r1',
      }),
    );
    expect(conflict.code).toBe('VERSION_CONFLICT');

    const expired = formatAgentApprovalError(
      new ApiError({
        statusCode: 410,
        code: 'GONE',
        message: 'Expired',
        details: [],
        requestId: 'r2',
      }),
    );
    expect(expired.code).toBe('EXPIRED');

    const hashErr = formatAgentApprovalError(
      new ApiError({
        statusCode: 403,
        code: 'FORBIDDEN',
        message: 'Hash mismatch',
        details: [],
        requestId: 'r3',
      }),
    );
    expect(hashErr.code).toBe('HASH_MISMATCH');
  });

  it('retries transient ticket fetch failures silently and ignores heartbeat events', async () => {
    FakeEventSource.instances = [];
    let attempt = 0;
    const { transport } = createMockTransport({
      'POST /agent/conversations/conv-1/stream-ticket': () => {
        attempt += 1;
        if (attempt === 1) {
          throw new TypeError('Failed to fetch');
        }
        return {
          ticket: 'recovered-ticket',
          expiresInSeconds: 30,
        };
      },
    });
    const client = new AgentApiClient(transport);

    const errors: string[] = [];
    const reconnects: number[] = [];
    const unknownEvents: string[] = [];
    let opened = false;

    const conn = client.connectToStream(
      'conv-1',
      {
        onOpen: () => {
          opened = true;
        },
        onReconnecting: (n) => reconnects.push(n),
        onError: (err) => errors.push(err.message),
        onUnknownEvent: (ev) => unknownEvents.push(ev.rawType),
      },
      { EventSourceCtor: FakeEventSource, baseRetryDelayMs: 15, maxRetryDelayMs: 30, maxRetries: 3 },
    );

    await new Promise((r) => setTimeout(r, 45));

    // Must recover without surfacing a premature "Failed to fetch" error
    expect(errors).toEqual([]);
    expect(reconnects).toEqual([1]);
    expect(FakeEventSource.instances.length).toBe(1);
    expect(FakeEventSource.instances[0].url).toContain('ticket=recovered-ticket');

    FakeEventSource.instances[0].emitOpen();
    FakeEventSource.instances[0].emitEvent('heartbeat', { ts: Date.now() }, '');
    expect(opened).toBe(true);
    expect(unknownEvents).toEqual([]);

    conn.disconnect();
  });

  it('delivers ephemeral message_chunk events even when EventSource repeats the previous durable lastEventId', async () => {
    FakeEventSource.instances = [];
    const { transport } = createMockTransport({
      'POST /agent/conversations/conv-1/stream-ticket': () => ({
        ticket: 'stream-ticket-1',
        expiresInSeconds: 30,
      }),
    });
    const client = new AgentApiClient(transport);

    const chunks: string[] = [];
    const statuses: string[] = [];
    const conn = client.connectToStream(
      'conv-1',
      {
        onTaskStatus: (d) => statuses.push(d.status),
        onMessageChunk: (d) => chunks.push(d.chunk || ''),
      },
      { EventSourceCtor: FakeEventSource, taskId: 'task-1' },
    );

    await new Promise((r) => setTimeout(r, 10));
    const es = FakeEventSource.instances[0];
    es.emitOpen();

    // Durable event advances highestNumericSeq to 10
    es.emitEvent('task_status', { taskId: 'task-1', status: 'RUNNING' }, '10');
    // Per WHATWG EventSource spec, id-less ephemeral message_chunk events inherit lastEventId = '10'
    es.emitEvent('message_chunk', { taskId: 'task-1', chunk: 'Hello ' }, '10');
    es.emitEvent('message_chunk', { taskId: 'task-1', chunk: 'world!' }, '10');
    // Duplicate durable event '10' must still be deduplicated
    es.emitEvent('task_status', { taskId: 'task-1', status: 'RUNNING' }, '10');

    expect(statuses).toEqual(['RUNNING']);
    expect(chunks).toEqual(['Hello ', 'world!']);

    conn.disconnect();
  });
});

