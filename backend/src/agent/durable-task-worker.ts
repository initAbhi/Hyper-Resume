import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
  Optional,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import crypto from 'node:crypto';
import { AgentTask } from './entities/agent-task.entity.js';
import { AgentPlannerService } from './agent-planner.service.js';
import { AgentExecutorService } from './agent-executor.service.js';
import { AgentService } from './agent.service.js';
import { CreditsService } from '../credits/credits.service.js';

@Injectable()
export class DurableTaskWorker implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DurableTaskWorker.name);
  public readonly workerInstanceId = crypto.randomUUID();

  private pollInterval?: NodeJS.Timeout;
  private reservationReaperInterval?: NodeJS.Timeout;
  private unsubscribeTaskQueued?: () => void;
  private isRunning = false;
  private isStopping = false;
  private readonly activeHeartbeats = new Map<string, NodeJS.Timeout>();

  constructor(
    @InjectRepository(AgentTask)
    private readonly taskRepo: Repository<AgentTask>,
    private readonly plannerService: AgentPlannerService,
    private readonly executorService: AgentExecutorService,
    private readonly dataSource: DataSource,
    @Optional()
    private readonly creditsService?: CreditsService,
    @Optional()
    private readonly agentService?: AgentService,
  ) { }

  onModuleInit(): void {
    this.startWorker();
  }

  onModuleDestroy(): void {
    this.stopWorker();
  }

  public startWorker(intervalMs: number = 1000): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.isStopping = false;

    this.pollInterval = setInterval(async () => {
      if (this.isStopping) return;
      try {
        await this.pollOnce();
      } catch (err: any) {
        this.logger.error(`Error in durable worker poll: ${err.message}`);
      }
    }, intervalMs);

    // Event-driven wake-up: lease newly submitted tasks immediately instead of waiting for next poll tick
    if (this.agentService && typeof this.agentService.onTaskQueued === 'function') {
      this.unsubscribeTaskQueued = this.agentService.onTaskQueued(() => {
        if (this.isStopping) return;
        setTimeout(() => {
          if (this.isStopping) return;
          void this.pollOnce().catch((err: any) => {
            this.logger.error(`Error in immediate worker poll: ${err.message}`);
          });
        }, 30);
      });
    }

    // Release expired credit reservations every 5 minutes
    if (this.creditsService) {
      this.reservationReaperInterval = setInterval(async () => {
        if (this.isStopping) return;
        try {
          const released = await this.creditsService!.releaseExpiredReservations();
          if (released > 0) {
            this.logger.log(`Released ${released} expired credit reservation(s)`);
          }
        } catch (err: any) {
          this.logger.warn(`Expired credit reservation cleanup failed: ${err.message}`);
        }
      }, 5 * 60 * 1000);
    }

    this.logger.log(`DurableTaskWorker started with instance ID: ${this.workerInstanceId}`);
  }

  public stopWorker(): void {
    this.isStopping = true;
    this.isRunning = false;

    if (this.unsubscribeTaskQueued) {
      this.unsubscribeTaskQueued();
      this.unsubscribeTaskQueued = undefined;
    }

    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = undefined;
    }

    if (this.reservationReaperInterval) {
      clearInterval(this.reservationReaperInterval);
      this.reservationReaperInterval = undefined;
    }

    const ownedTaskIds = Array.from(this.activeHeartbeats.keys());
    for (const [taskId, timer] of this.activeHeartbeats.entries()) {
      clearInterval(timer);
      this.activeHeartbeats.delete(taskId);
    }

    // Release active leases immediately on graceful shutdown so a restarted worker reclaims tasks in ~1s instead of waiting 60s
    if (ownedTaskIds.length > 0 && typeof this.taskRepo?.createQueryBuilder === 'function') {
      void this.taskRepo
        .createQueryBuilder()
        .update(AgentTask)
        .set({
          status: 'PENDING',
          heartbeatAt: null as unknown as Date,
          updatedAt: new Date(),
        })
        .where("lease_token = :leaseToken AND status IN ('PLANNING', 'RUNNING')", {
          leaseToken: this.workerInstanceId,
        })
        .execute()
        .catch((err: any) => {
          this.logger.warn(`Graceful lease release failed: ${err?.message || err}`);
        });
    }

    this.logger.log(`DurableTaskWorker stopped (${this.workerInstanceId})`);
  }

  /**
   * Performs a single atomic lease acquisition and execution cycle.
   * Can be invoked directly by tests or periodically by the polling timer.
   */
  public async pollOnce(): Promise<AgentTask | null> {
    if (this.isStopping) return null;

    const leasedTask = await this.acquireNextLease();
    if (!leasedTask) {
      return null;
    }

    this.logger.log(
      `Leased task ${leasedTask.id} (fence_token: ${leasedTask.fenceToken}) on worker ${this.workerInstanceId}`,
    );

    // Start 5-second heartbeat for this leased task
    this.startHeartbeat(leasedTask.id, leasedTask.fenceToken);

    try {
      // Step 1: Formulate plan if task metadata doesn't have an active plan
      let task = leasedTask;
      if (!task.metadata?.plan) {
        await this.plannerService.planTask(task);
        // Refresh task after planning
        const refreshed = await this.taskRepo.findOne({ where: { id: task.id } });
        if (refreshed) {
          task = refreshed;
        }
      }

      // Step 2: Transition to RUNNING with fencing verification
      const updateResult = await this.taskRepo
        .createQueryBuilder()
        .update(AgentTask)
        .set({
          status: 'RUNNING',
          heartbeatAt: new Date(),
          updatedAt: new Date(),
        })
        .where('id = :id AND fence_token = :fenceToken AND lease_token = :leaseToken', {
          id: task.id,
          fenceToken: task.fenceToken,
          leaseToken: this.workerInstanceId,
        })
        .execute();

      if (updateResult.affected === 0) {
        this.logger.warn(
          `STALE_FENCE_TOKEN: Lost lease fencing token (${task.fenceToken}) on task ${task.id}. Aborting execution.`,
        );
        return task;
      }

      task.status = 'RUNNING';

      // Step 3: Execute plan steps
      await this.executorService.executeTask(task, task.fenceToken, this.workerInstanceId);
      return task;
    } catch (err: any) {
      this.logger.error(`Execution error for task ${leasedTask.id}: ${err.message}`, err.stack);
      try {
        leasedTask.status = 'FAILED';
        leasedTask.metadata = { ...leasedTask.metadata, executionError: err.message };
        await this.taskRepo.save(leasedTask);
        if (this.agentService) {
          await this.agentService.publishEvent(
            leasedTask.id,
            leasedTask.conversationId,
            'task_failed',
            {
              taskId: leasedTask.id,
              status: 'FAILED',
              error: err.message || 'Unhandled worker execution failure',
            },
          );
        }
      } catch (saveErr: any) {
        this.logger.error(`Failed to record failure for task ${leasedTask.id}: ${saveErr.message}`);
      }
      return leasedTask;
    } finally {
      this.stopHeartbeat(leasedTask.id);
    }
  }

  public async acquireNextLease(overrideWorkerId?: string): Promise<AgentTask | null> {
    const workerId = overrideWorkerId || this.workerInstanceId;
    const isPostgres = this.dataSource.options.type === 'postgres';
    const leaseTtlSeconds = Math.max(5, Number(process.env.AGENT_LEASE_TTL_SECONDS || 60));

    if (isPostgres) {
      try {
        const query = `
          WITH next_task AS MATERIALIZED (
            SELECT id
            FROM agent_tasks
            WHERE status = 'PENDING'
               OR (status IN ('PLANNING', 'RUNNING') AND (heartbeat_at IS NULL OR heartbeat_at < NOW() - ($2 * INTERVAL '1 second')))
            ORDER BY created_at ASC, id ASC
            FOR UPDATE SKIP LOCKED
            LIMIT 1
          )
          UPDATE agent_tasks t
          SET status = 'PLANNING',
              lease_token = $1,
              fence_token = t.fence_token + 1,
              heartbeat_at = NOW(),
              updated_at = NOW()
          FROM next_task
          WHERE t.id = next_task.id
          RETURNING t.*;
        `;
        const rawResult = await this.dataSource.query(query, [workerId, leaseTtlSeconds]);
        // TypeORM Postgres driver returns [rows, affectedCount] for UPDATE ... RETURNING
        const rows = Array.isArray(rawResult?.[0]) ? rawResult[0] : rawResult;
        if (Array.isArray(rows) && rows.length > 0 && rows[0]?.id) {
          return this.taskRepo.findOne({ where: { id: rows[0].id } });
        }
        return null;
      } catch (err: any) {
        this.logger.warn(`PostgreSQL SKIP LOCKED query fallback: ${err.message}`);
      }
    }

    // Portable fallback for SQLite or unit tests
    return this.dataSource.transaction(async (manager) => {
      const staleThreshold = new Date(Date.now() - leaseTtlSeconds * 1000);
      const candidate = await manager
        .getRepository(AgentTask)
        .createQueryBuilder('task')
        .where('task.status = :pending', { pending: 'PENDING' })
        .orWhere(
          "(task.status IN ('PLANNING', 'RUNNING') AND (task.heartbeat_at IS NULL OR task.heartbeat_at < :staleThreshold))",
          { staleThreshold },
        )
        .orderBy('task.created_at', 'ASC')
        .getOne();

      if (!candidate) {
        return null;
      }

      candidate.status = 'PLANNING';
      candidate.leaseToken = workerId;
      candidate.fenceToken = (candidate.fenceToken || 0) + 1;
      candidate.heartbeatAt = new Date();
      return manager.getRepository(AgentTask).save(candidate);
    });
  }

  private startHeartbeat(taskId: string, fenceToken: number): void {
    this.stopHeartbeat(taskId);

    const heartbeatIntervalMs = Math.max(500, Number(process.env.AGENT_HEARTBEAT_INTERVAL_MS || 5000));
    const timer = setInterval(async () => {
      try {
        await this.taskRepo
          .createQueryBuilder()
          .update(AgentTask)
          .set({ heartbeatAt: new Date() })
          .where('id = :id AND fence_token = :fenceToken AND lease_token = :leaseToken', {
            id: taskId,
            fenceToken,
            leaseToken: this.workerInstanceId,
          })
          .execute();
      } catch (err: any) {
        this.logger.warn(`Heartbeat update failed for task ${taskId}: ${err.message}`);
      }
    }, heartbeatIntervalMs);

    this.activeHeartbeats.set(taskId, timer);
  }

  private stopHeartbeat(taskId: string): void {
    const timer = this.activeHeartbeats.get(taskId);
    if (timer) {
      clearInterval(timer);
      this.activeHeartbeats.delete(taskId);
    }
  }
}

