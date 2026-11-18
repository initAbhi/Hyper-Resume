import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UnauthorizedException } from '@nestjs/common';
import crypto from 'node:crypto';
import { AgentService } from './agent.service.js';
import { SseTicketGuard } from './guards/sse-ticket.guard.js';

describe('SSE Stream & Ticket Authentication (Phase 2)', () => {
  let agentService: AgentService;
  let sseTicketGuard: SseTicketGuard;
  let mockTicketRepo: any;
  let mockConversationRepo: any;
  let mockMessageRepo: any;
  let mockTaskRepo: any;
  let mockTaskEventRepo: any;
  let mockCreditsService: any;
  let mockDataSource: any;

  beforeEach(() => {
    mockTicketRepo = {
      create: vi.fn((data) => ({ id: 'ticket-1', ...data })),
      save: vi.fn((data) => Promise.resolve(data)),
      findOne: vi.fn(),
    };

    mockConversationRepo = {
      findOne: vi.fn().mockResolvedValue({ id: 'conv-1', userId: 'user-1' }),
      save: vi.fn((d) => Promise.resolve(d)),
    };

    mockMessageRepo = {
      create: vi.fn((d) => d),
      save: vi.fn((d) => Promise.resolve(d)),
    };

    mockTaskRepo = {
      create: vi.fn((d) => d),
      save: vi.fn((d) => Promise.resolve(d)),
    };

    mockTaskEventRepo = {
      create: vi.fn((d) => d),
      save: vi.fn((d) => Promise.resolve(d)),
      createQueryBuilder: vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        getRawOne: vi.fn().mockResolvedValue({ nextSeq: '1' }),
        getMany: vi.fn().mockResolvedValue([]),
      })),
    };

    mockCreditsService = {
      releaseReservation: vi.fn(),
    };

    mockDataSource = {
      isInitialized: true,
      query: vi.fn().mockResolvedValue([]),
    };

    agentService = new AgentService(
      mockConversationRepo,
      mockMessageRepo,
      mockTaskRepo,
      mockTaskEventRepo,
      mockTicketRepo,
      mockCreditsService,
      mockDataSource,
    );

    sseTicketGuard = new SseTicketGuard(mockTicketRepo);
  });

  describe('Single-Use Ticket Authentication', () => {
    it('generates a 32-byte hex ticket and stores its SHA-256 hash with 30s expiry', async () => {
      const result = await agentService.generateStreamTicket('user-1', 'conv-1');

      expect(result.ticket).toBeDefined();
      expect(result.ticket.length).toBe(64); // 32 bytes in hex = 64 characters
      expect(result.expiresInSeconds).toBe(30);

      const expectedHash = crypto.createHash('sha256').update(result.ticket).digest('hex');
      expect(mockTicketRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          conversationId: 'conv-1',
          userId: 'user-1',
          ticketHash: expectedHash,
        }),
      );
      expect(mockTicketRepo.save).toHaveBeenCalled();
    });

    it('SseTicketGuard rejects connection when ticket is missing', async () => {
      const mockContext: any = {
        switchToHttp: () => ({
          getRequest: () => ({ query: {}, params: { id: 'conv-1' } }),
        }),
      };

      await expect(sseTicketGuard.canActivate(mockContext)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('SseTicketGuard rejects connection when ticket is unknown', async () => {
      mockTicketRepo.findOne.mockResolvedValue(null);

      const mockContext: any = {
        switchToHttp: () => ({
          getRequest: () => ({ query: { ticket: 'unknown-ticket' }, params: { id: 'conv-1' } }),
        }),
      };

      await expect(sseTicketGuard.canActivate(mockContext)).rejects.toThrow(
        /Invalid stream ticket/,
      );
    });

    it('SseTicketGuard rejects connection if ticket has already been consumed (single-use invariant)', async () => {
      mockTicketRepo.findOne.mockResolvedValue({
        id: 'ticket-1',
        conversationId: 'conv-1',
        userId: 'user-1',
        ticketHash: 'some-hash',
        consumedAt: new Date(Date.now() - 5000), // already consumed
        expiresAt: new Date(Date.now() + 20000),
      });

      const mockContext: any = {
        switchToHttp: () => ({
          getRequest: () => ({ query: { ticket: 'some-ticket' }, params: { id: 'conv-1' } }),
        }),
      };

      await expect(sseTicketGuard.canActivate(mockContext)).rejects.toThrow(
        /already been consumed/,
      );
    });

    it('SseTicketGuard rejects connection if ticket has expired (> 30s)', async () => {
      mockTicketRepo.findOne.mockResolvedValue({
        id: 'ticket-1',
        conversationId: 'conv-1',
        userId: 'user-1',
        ticketHash: 'some-hash',
        consumedAt: null,
        expiresAt: new Date(Date.now() - 1000), // expired
      });

      const mockContext: any = {
        switchToHttp: () => ({
          getRequest: () => ({ query: { ticket: 'some-ticket' }, params: { id: 'conv-1' } }),
        }),
      };

      await expect(sseTicketGuard.canActivate(mockContext)).rejects.toThrow(
        /ticket has expired/,
      );
    });

    it('SseTicketGuard atomically burns ticket on valid access and injects user identity', async () => {
      const validTicketRecord = {
        id: 'ticket-1',
        conversationId: 'conv-1',
        userId: 'user-1',
        ticketHash: 'some-hash',
        consumedAt: null,
        expiresAt: new Date(Date.now() + 25000),
      };
      mockTicketRepo.findOne.mockResolvedValue(validTicketRecord);

      const req: any = { query: { ticket: 'some-ticket' }, params: { id: 'conv-1' } };
      const mockContext: any = {
        switchToHttp: () => ({
          getRequest: () => req,
        }),
      };

      const result = await sseTicketGuard.canActivate(mockContext);

      expect(result).toBe(true);
      expect(validTicketRecord.consumedAt).toBeInstanceOf(Date);
      expect(mockTicketRepo.save).toHaveBeenCalledWith(validTicketRecord);
      expect(req.user).toEqual({ id: 'user-1', userId: 'user-1' });
    });
  });

  describe('Durable Event Replay & Deduplication', () => {
    it('replays historical events in sequence before streaming live events', async () => {
      const historicalEvents = [
        { sequenceNumber: '1', eventType: 'task_status', eventPayload: { step: 1 } },
        { sequenceNumber: '2', eventType: 'step_progress', eventPayload: { step: 2 } },
      ];

      mockTaskEventRepo.createQueryBuilder = vi.fn(() => ({
        where: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        getMany: vi.fn().mockResolvedValue(historicalEvents),
      }));

      const observable = agentService.subscribeToConversationStream('conv-1', 'user-1');
      const received: any[] = [];

      const subscription = observable.subscribe({
        next: (event) => received.push(event),
      });

      // Wait a microtask tick for async query
      await new Promise((r) => setTimeout(r, 10));

      expect(received.length).toBe(2);
      expect(received[0].id).toBe('1');
      expect(received[1].id).toBe('2');

      subscription.unsubscribe();
    });

    it('filters historical events using lastEventId reconnect watermark', async () => {
      mockTaskEventRepo.createQueryBuilder = vi.fn(() => {
        const qb: any = {
          where: vi.fn().mockReturnThis(),
          andWhere: vi.fn().mockReturnThis(),
          orderBy: vi.fn().mockReturnThis(),
          getMany: vi.fn().mockResolvedValue([
            { sequenceNumber: '3', eventType: 'step_progress', eventPayload: { step: 3 } },
          ]),
        };
        return qb;
      });

      const observable = agentService.subscribeToConversationStream('conv-1', 'user-1', '2');
      const received: any[] = [];

      const subscription = observable.subscribe({
        next: (event) => received.push(event),
      });

      await new Promise((r) => setTimeout(r, 10));

      expect(received.length).toBe(1);
      expect(received[0].id).toBe('3');

      subscription.unsubscribe();
    });

    it('deduplicates overlapping live events buffered while historical replay query is in-flight', async () => {
      let resolveHistory!: (rows: any[]) => void;
      const historyPromise = new Promise<any[]>((resolve) => {
        resolveHistory = resolve;
      });

      mockTaskEventRepo.createQueryBuilder = vi.fn(() => ({
        where: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        getMany: vi.fn().mockReturnValue(historyPromise),
      }));

      const observable = agentService.subscribeToConversationStream('conv-1', 'user-1', '42');
      const received: any[] = [];
      const subscription = observable.subscribe({
        next: (event) => received.push(event),
      });

      // Live events 45 (overlapping with history) and 46 (newer) arrive BEFORE historical query resolves
      (agentService as any).eventEmitter.emit('conversation:conv-1', {
        id: '45',
        type: 'step_progress',
        data: { seq: 45 },
      });
      (agentService as any).eventEmitter.emit('conversation:conv-1', {
        id: '46',
        type: 'step_progress',
        data: { seq: 46 },
      });

      // Now historical query resolves with [43, 44, 45]
      resolveHistory([
        { sequenceNumber: '43', eventType: 'task_status', eventPayload: { seq: 43 } },
        { sequenceNumber: '44', eventType: 'plan_created', eventPayload: { seq: 44 } },
        { sequenceNumber: '45', eventType: 'step_progress', eventPayload: { seq: 45 } },
      ]);

      await new Promise((r) => setTimeout(r, 15));

      // Live event 47 arrives after replay finishes
      (agentService as any).eventEmitter.emit('conversation:conv-1', {
        id: '47',
        type: 'task_completed',
        data: { seq: 47 },
      });

      // Strictly ordered [43, 44, 45, 46, 47] with zero duplicates and zero drops!
      expect(received.map((e) => e.id)).toEqual(['43', '44', '45', '46', '47']);

      subscription.unsubscribe();
    });
  });
});

