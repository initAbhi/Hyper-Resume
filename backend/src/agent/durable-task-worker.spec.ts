import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DurableTaskWorker } from './durable-task-worker.js';

describe('DurableTaskWorker (Phase 2)', () => {
  let worker: DurableTaskWorker;
  let mockTaskRepo: any;
  let mockPlannerService: any;
  let mockExecutorService: any;
  let mockDataSource: any;

  beforeEach(() => {
    mockTaskRepo = {
      findOne: vi.fn(),
      save: vi.fn((t) => Promise.resolve(t)),
      createQueryBuilder: vi.fn(() => ({
        update: vi.fn().mockReturnThis(),
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        execute: vi.fn().mockResolvedValue({ affected: 1 }),
      })),
    };

    mockPlannerService = {
      planTask: vi.fn().mockResolvedValue({ goal: 'Goal', steps: [] }),
    };

    mockExecutorService = {
      executeTask: vi.fn().mockResolvedValue(undefined),
    };

    mockDataSource = {
      options: { type: 'better-sqlite3' },
      isInitialized: true,
      query: vi.fn(),
      transaction: vi.fn(async (cb) => {
        const manager: any = {
          getRepository: () => ({
            createQueryBuilder: () => ({
              where: vi.fn().mockReturnThis(),
              orWhere: vi.fn().mockReturnThis(),
              orderBy: vi.fn().mockReturnThis(),
              getOne: vi.fn().mockResolvedValue(null),
            }),
            save: vi.fn((t) => Promise.resolve(t)),
          }),
        };
        return cb(manager);
      }),
    };

    worker = new DurableTaskWorker(
      mockTaskRepo,
      mockPlannerService,
      mockExecutorService,
      mockDataSource,
    );
  });

  describe('Worker Identity & Lifecycle', () => {
    it('generates a unique workerInstanceId UUID on instantiation', () => {
      expect(worker.workerInstanceId).toBeDefined();
      expect(typeof worker.workerInstanceId).toBe('string');
      expect(worker.workerInstanceId.length).toBe(36);
    });

    it('starts and stops gracefully on module lifecycle hooks', () => {
      worker.onModuleInit();
      expect((worker as any).isRunning).toBe(true);

      worker.onModuleDestroy();
      expect((worker as any).isRunning).toBe(false);
      expect((worker as any).pollInterval).toBeUndefined();
    });
  });

  describe('Atomic Lease Acquisition & Fencing Tokens', () => {
    it('leases PENDING task and increments fence_token by 1', async () => {
      const pendingTask = {
        id: 'task-pending-1',
        status: 'PENDING',
        fenceToken: 3,
        heartbeatAt: null,
        metadata: {},
      };

      mockDataSource.transaction = vi.fn(async (cb) => {
        const manager: any = {
          getRepository: () => ({
            createQueryBuilder: () => ({
              where: vi.fn().mockReturnThis(),
              orWhere: vi.fn().mockReturnThis(),
              orderBy: vi.fn().mockReturnThis(),
              getOne: vi.fn().mockResolvedValue(pendingTask),
            }),
            save: vi.fn((t) => Promise.resolve(t)),
          }),
        };
        return cb(manager);
      });

      mockTaskRepo.findOne.mockResolvedValue(pendingTask);

      const leased = await worker.pollOnce();

      expect(leased).toBeDefined();
      expect(leased?.id).toBe('task-pending-1');
      expect(leased?.fenceToken).toBe(4); // incremented from 3 to 4
      expect(leased?.leaseToken).toBe(worker.workerInstanceId);
      expect(leased?.heartbeatAt).toBeInstanceOf(Date);
      expect(mockPlannerService.planTask).toHaveBeenCalled();
      expect(mockExecutorService.executeTask).toHaveBeenCalled();
    });

    it('leases stale RUNNING task (> 60s silence) and increments fence_token', async () => {
      const staleTask = {
        id: 'task-stale-1',
        status: 'RUNNING',
        fenceToken: 10,
        heartbeatAt: new Date(Date.now() - 75 * 1000), // 75 seconds silent
        metadata: { plan: { goal: 'Resume task' } },
      };

      mockDataSource.transaction = vi.fn(async (cb) => {
        const manager: any = {
          getRepository: () => ({
            createQueryBuilder: () => ({
              where: vi.fn().mockReturnThis(),
              orWhere: vi.fn().mockReturnThis(),
              orderBy: vi.fn().mockReturnThis(),
              getOne: vi.fn().mockResolvedValue(staleTask),
            }),
            save: vi.fn((t) => Promise.resolve(t)),
          }),
        };
        return cb(manager);
      });

      mockTaskRepo.findOne.mockResolvedValue(staleTask);

      const leased = await worker.pollOnce();

      expect(leased).toBeDefined();
      expect(leased?.fenceToken).toBe(11); // incremented from 10 to 11
      expect(leased?.leaseToken).toBe(worker.workerInstanceId);
    });

    it('STRICTLY EXCLUDES AWAITING_APPROVAL tasks from stale lease recovery', async () => {
      // Simulate database where only AWAITING_APPROVAL task exists
      mockDataSource.transaction = vi.fn(async (cb) => {
        const manager: any = {
          getRepository: () => ({
            createQueryBuilder: () => ({
              where: vi.fn().mockReturnThis(),
              orWhere: vi.fn().mockImplementation((condition: string) => {
                // Verify that query specifies PLANNING or RUNNING, and NOT AWAITING_APPROVAL
                expect(condition).toContain('PLANNING');
                expect(condition).toContain('RUNNING');
                expect(condition).not.toContain('AWAITING_APPROVAL');
                return {
                  orderBy: vi.fn().mockReturnThis(),
                  getOne: vi.fn().mockResolvedValue(null), // Nothing eligible
                };
              }),
            }),
            save: vi.fn(),
          }),
        };
        return cb(manager);
      });

      const leased = await worker.pollOnce();
      expect(leased).toBeNull();
      expect(mockExecutorService.executeTask).not.toHaveBeenCalled();
    });

    it('aborts execution when fencing update returns 0 affected rows (zombie prevention)', async () => {
      const task = {
        id: 'task-zombie',
        status: 'PENDING',
        fenceToken: 1,
        metadata: { plan: { steps: [] } },
      };

      mockDataSource.transaction = vi.fn(async (cb) => {
        const manager: any = {
          getRepository: () => ({
            createQueryBuilder: () => ({
              where: vi.fn().mockReturnThis(),
              orWhere: vi.fn().mockReturnThis(),
              orderBy: vi.fn().mockReturnThis(),
              getOne: vi.fn().mockResolvedValue(task),
            }),
            save: vi.fn((t) => Promise.resolve(t)),
          }),
        };
        return cb(manager);
      });

      mockTaskRepo.findOne.mockResolvedValue(task);

      // Simulate fencing mismatch: 0 rows affected by update
      mockTaskRepo.createQueryBuilder = vi.fn(() => ({
        update: vi.fn().mockReturnThis(),
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        execute: vi.fn().mockResolvedValue({ affected: 0 }),
      }));

      await worker.pollOnce();

      // Executor should NOT be called because lease was stolen
      expect(mockExecutorService.executeTask).not.toHaveBeenCalled();
    });
  });
});

