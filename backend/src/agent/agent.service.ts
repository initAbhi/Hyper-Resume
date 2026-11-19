import {
  Injectable,
  Logger,
  NotFoundException,
  OnModuleDestroy,
  Optional,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import crypto from 'node:crypto';
import { EventEmitter } from 'node:events';
import { Observable } from 'rxjs';
import { AgentConversation } from './entities/agent-conversation.entity.js';
import { AgentMessage } from './entities/agent-message.entity.js';
import { AgentTask } from './entities/agent-task.entity.js';
import { AgentTaskEvent } from './entities/agent-task-event.entity.js';
import { AgentStreamTicket } from './entities/agent-stream-ticket.entity.js';
import { AgentToolExecution } from './entities/agent-tool-execution.entity.js';
import { CreditsService } from '../credits/credits.service.js';
import { CreateAgentMessageDto, CreateConversationDto } from './dto/agent-message.dto.js';
import { AgentUsageGuardService } from './services/agent-usage-guard.service.js';

export interface SseStreamEvent {
  id?: string;
  type: string;
  data: Record<string, unknown>;
  ephemeral?: boolean;
  originInstanceId?: string;
}

@Injectable()
export class AgentService implements OnModuleDestroy {
  private readonly logger = new Logger(AgentService.name);
  private readonly instanceId = crypto.randomUUID();
  private readonly eventEmitter = new EventEmitter();
  private pgListenerClient: any = null;
  private pgListenerInitPromise: Promise<any> | null = null;
  private readonly channelRefCounts = new Map<string, number>();
  private readonly channelToConversation = new Map<string, string>();

  constructor(
    @InjectRepository(AgentConversation)
    private readonly conversationRepo: Repository<AgentConversation>,
    @InjectRepository(AgentMessage)
    private readonly messageRepo: Repository<AgentMessage>,
    @InjectRepository(AgentTask)
    private readonly taskRepo: Repository<AgentTask>,
    @InjectRepository(AgentTaskEvent)
    private readonly taskEventRepo: Repository<AgentTaskEvent>,
    @InjectRepository(AgentStreamTicket)
    private readonly ticketRepo: Repository<AgentStreamTicket>,
    private readonly creditsService: CreditsService,
    private readonly dataSource: DataSource,
    @Optional()
    private readonly usageGuard?: AgentUsageGuardService,
  ) {
    this.eventEmitter.setMaxListeners(1000);
  }

  async createConversation(userId: string, dto?: CreateConversationDto): Promise<AgentConversation> {
    const conversation = this.conversationRepo.create({
      userId,
      activeResumeId: dto?.activeResumeId,
      title: dto?.title?.trim() || 'New Conversation',
      metadata: {},
    });
    return this.conversationRepo.save(conversation);
  }

  async getConversations(userId: string): Promise<AgentConversation[]> {
    return this.conversationRepo.find({
      where: { userId },
      order: { updatedAt: 'DESC' },
      take: 50,
    });
  }

  async getConversation(userId: string, conversationId: string): Promise<AgentConversation> {
    const conversation = await this.conversationRepo.findOne({
      where: { id: conversationId, userId },
    });
    if (!conversation) {
      throw new NotFoundException('Conversation not found or access denied');
    }
    return conversation;
  }

  async getConversationMessages(userId: string, conversationId: string): Promise<AgentMessage[]> {
    await this.getConversation(userId, conversationId);
    return this.messageRepo.find({
      where: { conversationId },
      order: { createdAt: 'ASC' },
      take: 100,
    });
  }

  async getConversationTasks(userId: string, conversationId: string): Promise<AgentTask[]> {
    await this.getConversation(userId, conversationId);
    const tasks = await this.taskRepo.find({
      where: { conversationId, userId },
      order: { createdAt: 'DESC' },
      take: 25,
    });

    // Hydrate full stagedProposal for any AWAITING_APPROVAL task so page refreshes & SSE reconnects
    // always recover the complete diff card without losing pending proposals.
    const awaiting = tasks.filter((t) => {
      const activeProp = (t.metadata?.activeProposal as Record<string, any> | undefined);
      return t.status === 'AWAITING_APPROVAL' && typeof activeProp?.proposalId === 'string';
    });
    if (awaiting.length > 0 && typeof this.dataSource?.getRepository === 'function') {
      try {
        const execRepo = this.dataSource.getRepository(AgentToolExecution);
        for (const task of awaiting) {
          const activeProp = (task.metadata?.activeProposal as Record<string, any> | undefined);
          const proposalId = activeProp?.proposalId as string | undefined;
          if (!proposalId) continue;
          const exec = await execRepo.findOne({
            where: { id: proposalId, userId, status: 'PENDING_APPROVAL' },
          });
          if (exec?.outputPayload) {
            const payload = exec.outputPayload as Record<string, any>;
            task.metadata = {
              ...task.metadata,
              stagedProposal: {
                taskId: task.id,
                executionId: exec.id,
                proposalHash: exec.proposalHash,
                resumeId: exec.resumeId,
                expectedResumeVersion: exec.expectedResumeVersion ?? payload.expectedResumeVersion ?? 1,
                sectionDiffs: payload.sectionDiffs || {},
                beforeAtsScore: payload.beforeAtsScore,
                projectedAtsScore: payload.projectedAtsScore,
                changeSummary: payload.changeSummary,
                expiresAt: exec.expiresAt?.toISOString() || activeProp?.expiresAt,
              },
            };
          }
        }
      } catch {
        // Non-fatal hydration fallback
      }
    }

    return tasks;
  }

  async updateConversation(
    userId: string,
    conversationId: string,
    updates: { title?: string },
  ): Promise<AgentConversation> {
    const conversation = await this.getConversation(userId, conversationId);
    if (typeof updates.title === 'string' && updates.title.trim()) {
      conversation.title = updates.title.trim().slice(0, 120);
      return this.conversationRepo.save(conversation);
    }
    return conversation;
  }

  async deleteConversation(userId: string, conversationId: string): Promise<{ deleted: true }> {
    const conversation = await this.getConversation(userId, conversationId);
    await this.conversationRepo.remove(conversation);
    return { deleted: true };
  }

  async submitMessage(
    userId: string,
    conversationId: string,
    dto: CreateAgentMessageDto,
  ): Promise<{ taskId: string; conversationId: string; messageId: string }> {
    const conversation = await this.getConversation(userId, conversationId);

    const isResumeDetached = Boolean(dto.context?.resumeDetached);
    const resolvedResumeId = isResumeDetached
      ? undefined
      : dto.activeResumeId || dto.context?.activeResumeId || conversation.activeResumeId || undefined;

    const existingConvContext =
      ((conversation.metadata as Record<string, any>)?.workflowContext as Record<string, unknown>) ||
      {};

    const mergedContext: Record<string, unknown> = {
      ...existingConvContext,
      ...dto.context,
      activeResumeId: resolvedResumeId,
    };
    if (isResumeDetached) {
      delete mergedContext.activeResumeId;
      delete mergedContext.activeResumeName;
      delete mergedContext.resumeDetached;
    }

    // Strip any model/client-supplied userId defensively
    delete mergedContext.userId;

    if (dto.activeResumeId || dto.context) {
      if (isResumeDetached) {
        conversation.activeResumeId = null as unknown as string;
      } else if (resolvedResumeId) {
        conversation.activeResumeId = resolvedResumeId;
      }
      // Persist only lightweight references on conversation metadata (avoid duplicating large raw JDs)
      const lightweightRefs = { ...mergedContext };
      delete lightweightRefs.jobDescriptionText;
      conversation.metadata = {
        ...conversation.metadata,
        workflowContext: lightweightRefs,
      };
      await this.conversationRepo.save(conversation);
    }

    // Idempotency check if key is provided (must run before rate-limit accounting so retries don't double-count)
    if (dto.idempotencyKey) {
      const existingTask = await this.taskRepo
        .createQueryBuilder('task')
        .where('task.conversation_id = :conversationId', { conversationId })
        .andWhere("task.metadata->>'idempotencyKey' = :key", { key: dto.idempotencyKey })
        .getOne();

      if (existingTask) {
        this.logger.debug(`Idempotent message hit for key ${dto.idempotencyKey}, returning existing taskId ${existingTask.id}`);
        return {
          taskId: existingTask.id,
          conversationId,
          messageId: 'idempotent-repeat',
        };
      }
    }

    // Enforce Per-User & Per-Conversation Burst Rate Limits + Daily AI Token/Cost Caps (Free & Pro)
    if (this.usageGuard) {
      await this.usageGuard.enforceMessageGuard(userId, conversationId, Date.now(), {
        holdInFlightSlot: true,
      });
    }

    let savedMessage: AgentMessage;
    let savedTask: AgentTask;
    try {
      // Save user message
      const userMessage = this.messageRepo.create({
        conversationId,
        role: 'user',
        content: dto.content.trim(),
      });
      savedMessage = await this.messageRepo.save(userMessage);

      // Create AgentTask in PENDING state
      const task = this.taskRepo.create({
        conversationId,
        userId,
        status: 'PENDING',
        fenceToken: 0,
        taskInput: {
          content: dto.content.trim(),
          activeResumeId: resolvedResumeId,
          context: mergedContext,
          messageId: savedMessage.id,
        },
        metadata: {
          idempotencyKey: dto.idempotencyKey,
          retries: 0,
        },
      });
      savedTask = await this.taskRepo.save(task);
    } finally {
      this.usageGuard?.releaseInFlightSubmit(userId);
    }

    // Publish task_created event
    await this.publishEvent(savedTask.id, conversationId, 'task_status', {
      taskId: savedTask.id,
      status: 'PENDING',
      message: 'Task created and queued for worker leasing',
    });

    // Immediately wake local DurableTaskWorker (eliminates ~500-1000ms poll delay for <1.2s TTFT)
    this.eventEmitter.emit('task:queued', savedTask.id);

    return {
      taskId: savedTask.id,
      conversationId,
      messageId: savedMessage.id,
    };
  }

  onTaskQueued(listener: (taskId: string) => void): () => void {
    this.eventEmitter.on('task:queued', listener);
    return () => {
      this.eventEmitter.removeListener('task:queued', listener);
    };
  }

  async generateStreamTicket(
    userId: string,
    conversationId: string,
  ): Promise<{ ticket: string; expiresInSeconds: number }> {
    await this.getConversation(userId, conversationId);

    const rawTicket = crypto.randomBytes(32).toString('hex');
    const ticketHash = crypto.createHash('sha256').update(rawTicket).digest('hex');
    const expiresAt = new Date(Date.now() + 30 * 1000); // 30-second window

    const ticket = this.ticketRepo.create({
      conversationId,
      userId,
      ticketHash,
      expiresAt,
    });
    await this.ticketRepo.save(ticket);

    return {
      ticket: rawTicket,
      expiresInSeconds: 30,
    };
  }

  async publishEvent(
    taskId: string,
    conversationId: string,
    eventType: string,
    eventPayload: Record<string, unknown>,
    manager?: EntityManager,
  ): Promise<AgentTaskEvent> {
    const eventRepo = manager ? manager.getRepository(AgentTaskEvent) : this.taskEventRepo;

    // Monotonic sequence number query
    const rawResult = await eventRepo
      .createQueryBuilder('e')
      .select('COALESCE(MAX(e.sequence_number::bigint), 0) + 1', 'nextSeq')
      .where('e.conversation_id = :conversationId', { conversationId })
      .getRawOne();

    const sequenceNumber = String(rawResult?.nextSeq || '1');

    const event = eventRepo.create({
      taskId,
      conversationId,
      sequenceNumber,
      eventType,
      eventPayload,
    });

    const savedEvent = await eventRepo.save(event);

    const sseEvent: SseStreamEvent = {
      id: sequenceNumber,
      type: eventType,
      data: eventPayload,
    };

    // 1. Emit on in-process EventEmitter
    this.eventEmitter.emit(`conversation:${conversationId}`, sseEvent);

    // 2. Publish via PostgreSQL NOTIFY for multi-instance PM2/cluster scaling
    // Guard against PostgreSQL's 8000-byte NOTIFY payload limit by sending a slim pointer for large payloads
    try {
      const channel = `agent_events_${conversationId.replace(/-/g, '_')}`;
      let payloadString = JSON.stringify(sseEvent);
      if (Buffer.byteLength(payloadString, 'utf8') > 7500) {
        payloadString = JSON.stringify({
          __hydrateFromDb: true,
          eventId: savedEvent.id,
          id: sequenceNumber,
          type: eventType,
        });
      }
      if (this.dataSource.isInitialized) {
        await this.dataSource.query(`SELECT pg_notify($1, $2)`, [channel, payloadString]);
      }
    } catch (err: any) {
      // In SQLite / mock test environments or if pg_notify fails, in-process eventEmitter ensures delivery
      this.logger.debug(`PostgreSQL pg_notify non-fatal note: ${err.message}`);
    }

    return savedEvent;
  }

  /**
   * Emits a real-time ephemeral SSE event (e.g. token-by-token message_chunk) directly to
   * connected subscribers without writing a row to agent_task_events on every token.
   */
  publishEphemeralEvent(
    taskId: string,
    conversationId: string,
    eventType: string,
    eventPayload: Record<string, unknown>,
  ): void {
    const sseEvent: SseStreamEvent = {
      type: eventType,
      data: {
        taskId,
        ...eventPayload,
      },
      ephemeral: true,
    };

    // 1. Immediate in-process EventEmitter delivery (sub-millisecond)
    this.eventEmitter.emit(`conversation:${conversationId}`, sseEvent);

    // 2. Best-effort multi-instance PostgreSQL NOTIFY fan-out (tagged with originInstanceId to prevent self-echo)
    if (this.dataSource?.isInitialized && this.dataSource?.options?.type === 'postgres') {
      const channel = this.getPgChannelName(conversationId);
      if (channel) {
        const payloadString = JSON.stringify({
          ...sseEvent,
          originInstanceId: this.instanceId,
        });
        if (Buffer.byteLength(payloadString, 'utf8') <= 7500) {
          void this.dataSource
            .query(`SELECT pg_notify($1, $2)`, [channel, payloadString])
            .catch(() => {
              // Non-fatal in single-instance / mock environments
            });
        }
      }
    }
  }

  async onModuleDestroy(): Promise<void> {
    this.channelRefCounts.clear();
    this.channelToConversation.clear();
    if (this.pgListenerClient) {
      try {
        this.pgListenerClient.release?.();
      } catch {
        // Ignore cleanup errors during shutdown
      }
      this.pgListenerClient = null;
      this.pgListenerInitPromise = null;
    }
  }

  private getPgChannelName(conversationId: string): string | null {
    const sanitized = `agent_events_${conversationId.replace(/-/g, '_')}`;
    // Strict alphanumeric + underscore allowlist to prevent SQL injection in LISTEN/UNLISTEN
    if (!/^[a-zA-Z0-9_]+$/.test(sanitized) || sanitized.length > 63) {
      return null;
    }
    return sanitized;
  }

  private async ensurePgListenerClient(): Promise<any | null> {
    if (this.pgListenerClient) {
      return this.pgListenerClient;
    }
    if (this.pgListenerInitPromise) {
      return this.pgListenerInitPromise;
    }

    if (!this.dataSource?.isInitialized || this.dataSource?.options?.type !== 'postgres') {
      return null;
    }

    const pool = (this.dataSource.driver as any)?.master;
    if (!pool || typeof pool.connect !== 'function') {
      return null;
    }

    this.pgListenerInitPromise = (async () => {
      try {
        const client = await pool.connect();
        client.on('notification', async (msg: { channel?: string; payload?: string }) => {
          if (!msg?.channel || !msg?.payload) return;
          const convId = this.channelToConversation.get(msg.channel);
          if (!convId) return;
          try {
            const parsed = JSON.parse(msg.payload) as SseStreamEvent & {
              __hydrateFromDb?: boolean;
              eventId?: string;
            };
            if (parsed.__hydrateFromDb && parsed.eventId) {
              const dbEvent = await this.taskEventRepo.findOne({ where: { id: parsed.eventId } });
              if (dbEvent) {
                this.eventEmitter.emit(`conversation:${convId}`, {
                  id: dbEvent.sequenceNumber,
                  type: dbEvent.eventType,
                  data: dbEvent.eventPayload,
                });
              }
              return;
            }
            if (parsed.ephemeral && parsed.originInstanceId === this.instanceId) {
              return;
            }
            this.eventEmitter.emit(`conversation:${convId}`, parsed);
          } catch (parseErr: any) {
            this.logger.warn(`Failed to parse pg_notify payload on ${msg.channel}: ${parseErr.message}`);
          }
        });
        client.on('error', (err: Error) => {
          this.logger.warn(`PostgreSQL LISTEN client error: ${err.message}`);
          this.pgListenerClient = null;
          this.pgListenerInitPromise = null;
        });
        this.pgListenerClient = client;
        return client;
      } catch (err: any) {
        this.logger.debug(`PostgreSQL LISTEN initialization skipped: ${err.message}`);
        this.pgListenerInitPromise = null;
        return null;
      }
    })();

    return this.pgListenerInitPromise;
  }

  private async subscribePgChannel(conversationId: string): Promise<void> {
    const channel = this.getPgChannelName(conversationId);
    if (!channel) return;

    const currentCount = this.channelRefCounts.get(channel) || 0;
    this.channelRefCounts.set(channel, currentCount + 1);
    this.channelToConversation.set(channel, conversationId);

    if (currentCount === 0) {
      const client = await this.ensurePgListenerClient();
      if (client) {
        try {
          await client.query(`LISTEN ${channel}`);
        } catch (err: any) {
          this.logger.debug(`PostgreSQL LISTEN ${channel} failed: ${err.message}`);
        }
      }
    }
  }

  private async unsubscribePgChannel(conversationId: string): Promise<void> {
    const channel = this.getPgChannelName(conversationId);
    if (!channel) return;

    const currentCount = this.channelRefCounts.get(channel) || 0;
    if (currentCount <= 1) {
      this.channelRefCounts.delete(channel);
      this.channelToConversation.delete(channel);
      if (this.pgListenerClient) {
        try {
          await this.pgListenerClient.query(`UNLISTEN ${channel}`);
        } catch {
          // Ignore unlisten errors on closed connection
        }
      }
    } else {
      this.channelRefCounts.set(channel, currentCount - 1);
    }
  }

  private parseSequenceId(value?: string): bigint | null {
    if (!value || !/^\d+$/.test(value.trim())) {
      return null;
    }
    try {
      return BigInt(value.trim());
    } catch {
      return null;
    }
  }

  subscribeToConversationStream(
    conversationId: string,
    userId: string,
    lastEventId?: string,
    taskId?: string,
  ): Observable<{ id?: string; type?: string; data: Record<string, unknown> }> {
    return new Observable((observer) => {
      let isDisposed = false;
      const buffer: SseStreamEvent[] = [];
      let replayCompleted = false;
      const parsedLastEventId = this.parseSequenceId(lastEventId);
      let highestReplayedSeq = parsedLastEventId ?? 0n;

      // Step 1: Subscribe & Buffer live events
      const liveListener = (event: SseStreamEvent) => {
        if (isDisposed) return;
        if (taskId && event.data?.taskId && String(event.data.taskId) !== taskId) {
          return;
        }
        if (!replayCompleted) {
          buffer.push(event);
        } else if (event.ephemeral || !event.id) {
          observer.next({
            type: event.type,
            data: event.data,
          });
        } else {
          const eventSeq = this.parseSequenceId(event.id) ?? 0n;
          if (eventSeq > highestReplayedSeq) {
            highestReplayedSeq = eventSeq;
            observer.next({
              id: event.id,
              type: event.type,
              data: event.data,
            });
          }
        }
      };

      this.eventEmitter.on(`conversation:${conversationId}`, liveListener);

      // Periodic 8s keepalive heartbeat prevents idle SSE disconnects across proxies/browsers during long AI steps
      const heartbeatTimer = setInterval(() => {
        if (!isDisposed) {
          observer.next({
            type: 'heartbeat',
            data: { ts: Date.now() },
          });
        }
      }, 8_000);
      heartbeatTimer.unref?.();

      // Step 2 & 3: Subscribe to PG LISTEN (multi-instance) and query historical replay
      (async () => {
        try {
          await this.subscribePgChannel(conversationId);

          const queryBuilder = this.taskEventRepo
            .createQueryBuilder('e')
            .where('e.conversation_id = :conversationId', { conversationId })
            .orderBy('e.sequence_number::bigint', 'ASC');

          if (taskId) {
            queryBuilder.andWhere('e.task_id = :taskId', { taskId });
          }

          if (parsedLastEventId !== null) {
            queryBuilder.andWhere('e.sequence_number::bigint > :lastEventId', {
              lastEventId: parsedLastEventId.toString(),
            });
          }

          const historicalEvents = await queryBuilder.getMany();

          for (const hist of historicalEvents) {
            if (isDisposed) return;
            const seq = this.parseSequenceId(hist.sequenceNumber) ?? 0n;
            if (seq > highestReplayedSeq) {
              highestReplayedSeq = seq;
            }
            observer.next({
              id: hist.sequenceNumber,
              type: hist.eventType,
              data: hist.eventPayload,
            });
          }

          // Step 4: Flush buffered live events (deduplicating durable events against highestReplayedSeq)
          replayCompleted = true;
          for (const buffered of buffer) {
            if (isDisposed) return;
            if (buffered.ephemeral || !buffered.id) {
              observer.next({
                type: buffered.type,
                data: buffered.data,
              });
              continue;
            }
            const bSeq = this.parseSequenceId(buffered.id) ?? 0n;
            if (bSeq > highestReplayedSeq) {
              highestReplayedSeq = bSeq;
              observer.next({
                id: buffered.id,
                type: buffered.type,
                data: buffered.data,
              });
            }
          }
          buffer.length = 0;
        } catch (err) {
          if (!isDisposed) {
            observer.error(err);
          }
        }
      })();

      return () => {
        isDisposed = true;
        clearInterval(heartbeatTimer);
        this.eventEmitter.removeListener(`conversation:${conversationId}`, liveListener);
        void this.unsubscribePgChannel(conversationId);
      };
    });
  }

  async cancelTask(taskId: string, userId: string): Promise<AgentTask> {
    const task = await this.taskRepo.findOne({
      where: { id: taskId, userId },
    });

    if (!task) {
      throw new NotFoundException('Task not found or access denied');
    }

    if (['COMPLETED', 'FAILED', 'CANCELLED'].includes(task.status)) {
      return task;
    }

    task.status = 'CANCELLED';
    const saved = await this.taskRepo.save(task);

    // Release any active credit reservations for this task
    try {
      const plan = (task.metadata?.plan as any)?.steps || [];
      for (let i = 0; i < plan.length; i++) {
        await this.creditsService.releaseReservation(`res:${taskId}:${i}`, 'Task cancelled by user');
      }
    } catch (err: any) {
      this.logger.warn(`Failed to release reservations for cancelled task ${taskId}: ${err.message}`);
    }

    await this.publishEvent(taskId, task.conversationId, 'task_cancelled', {
      taskId,
      reason: 'User cancelled task',
    });

    return saved;
  }
}

