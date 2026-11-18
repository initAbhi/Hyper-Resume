import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ConflictException,
  ForbiddenException,
  GoneException,
} from '@nestjs/common';
import { AgentExecutorService } from './agent-executor.service.js';
import { AgentTask } from './entities/agent-task.entity.js';
import { AgentToolExecution } from './entities/agent-tool-execution.entity.js';
import { Resume } from '../resumes/entities/resume.entity.js';
import { ToolPermissionTier } from './tools/tool.interface.js';

describe('AgentExecutorService (Phase 2)', () => {
  let service: AgentExecutorService;
  let mockToolRegistry: any;
  let mockCreditsService: any;
  let mockAgentService: any;
  let mockTaskRepo: any;
  let mockToolExecutionRepo: any;
  let mockMessageRepo: any;
  let mockDataSource: any;

  beforeEach(() => {
    mockToolRegistry = {
      getTool: vi.fn(),
    };

    mockCreditsService = {
      reserveCredits: vi.fn().mockResolvedValue({ success: true, reservationKey: 'res:1' }),
      commitReservation: vi.fn().mockResolvedValue({}),
      releaseReservation: vi.fn().mockResolvedValue({}),
    };

    mockAgentService = {
      publishEvent: vi.fn().mockResolvedValue({}),
    };

    mockTaskRepo = {
      findOne: vi.fn(),
      save: vi.fn((t) => Promise.resolve(t)),
    };

    mockToolExecutionRepo = {
      findOne: vi.fn(),
      save: vi.fn((e) => Promise.resolve(e)),
    };

    mockMessageRepo = {
      create: vi.fn((m) => ({ id: 'msg-1', ...m })),
      save: vi.fn((m) => Promise.resolve(m)),
    };

    mockDataSource = {
      transaction: vi.fn(async (cb) => {
        const manager: any = {
          findOne: vi.fn(),
          save: vi.fn((entity) => Promise.resolve(entity)),
          create: vi.fn((entityClass, data) => data),
        };
        return cb(manager);
      }),
    };

    service = new AgentExecutorService(
      mockToolRegistry,
      mockCreditsService,
      mockAgentService,
      mockTaskRepo,
      mockToolExecutionRepo,
      mockMessageRepo,
      mockDataSource,
    );
  });

  describe('executeTask', () => {
    it('aborts execution when fencing token does not match DB state (zombie worker elimination)', async () => {
      mockTaskRepo.findOne.mockResolvedValue({
        id: 'task-1',
        fenceToken: 5, // DB has token 5
      });

      const workerTask = { id: 'task-1', fenceToken: 4 } as AgentTask; // Worker holds token 4
      await service.executeTask(workerTask, 4, 'worker-1');

      expect(mockToolRegistry.getTool).not.toHaveBeenCalled();
      expect(mockAgentService.publishEvent).not.toHaveBeenCalled();
    });

    it('pauses and marks AWAITING_APPROVAL when propose_resume_edits produces a proposal hash', async () => {
      const taskInDb = {
        id: 'task-10',
        userId: 'user-1',
        conversationId: 'conv-1',
        status: 'RUNNING',
        fenceToken: 1,
        metadata: {
          plan: {
            goal: 'Tailor resume',
            steps: [
              {
                stepIndex: 0,
                toolName: 'propose_resume_edits',
                description: 'Propose edits',
                inputArguments: {},
                permissionTier: ToolPermissionTier.AI_ANALYSIS,
                status: 'PENDING',
              },
            ],
          },
        },
      };

      mockTaskRepo.findOne.mockResolvedValue(taskInDb);

      mockToolRegistry.getTool.mockReturnValue({
        name: 'propose_resume_edits',
        creditCost: 2,
        execute: vi.fn().mockResolvedValue({
          success: true,
          data: {
            proposalId: 'prop-123',
            proposalHash: 'a'.repeat(64),
            resumeId: 'resume-1',
            expectedResumeVersion: 3,
            expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
            sectionDiffs: { headline: { original: 'Old', proposed: 'New' } },
          },
        }),
      });

      await service.executeTask(taskInDb as any, 1, 'worker-1');

      expect(taskInDb.status).toBe('AWAITING_APPROVAL');
      expect(mockTaskRepo.save).toHaveBeenCalled();
      expect(mockAgentService.publishEvent).toHaveBeenCalledWith(
        'task-10',
        'conv-1',
        'approval_requested',
        expect.objectContaining({
          executionId: 'prop-123',
          proposalHash: 'a'.repeat(64),
        }),
      );
    });

    it('halts and marks FAILED when credit reservation fails', async () => {
      const taskInDb = {
        id: 'task-broke',
        userId: 'user-poor',
        conversationId: 'conv-1',
        status: 'RUNNING',
        fenceToken: 1,
        metadata: {
          plan: {
            goal: 'Analyze',
            steps: [
              {
                stepIndex: 0,
                toolName: 'match_job_description',
                description: 'Match job',
                inputArguments: {},
                permissionTier: ToolPermissionTier.AI_ANALYSIS,
                status: 'PENDING',
              },
            ],
          },
        },
      };

      mockTaskRepo.findOne.mockResolvedValue(taskInDb);
      mockToolRegistry.getTool.mockReturnValue({
        name: 'match_job_description',
        creditCost: 1,
        execute: vi.fn(),
      });
      mockCreditsService.reserveCredits.mockRejectedValue(
        new Error('Insufficient credit balance (0 available, 1 required).'),
      );

      await service.executeTask(taskInDb as any, 1, 'worker-1');

      expect(taskInDb.status).toBe('AWAITING_CREDITS');
      expect(mockAgentService.publishEvent).toHaveBeenCalledWith(
        'task-broke',
        'conv-1',
        'task_failed',
        expect.objectContaining({
          status: 'AWAITING_CREDITS',
          reason: 'INSUFFICIENT_CREDITS',
        }),
      );
    });

    it('halts and marks FAILED with TASK_SPENDING_LIMIT_EXCEEDED when task ceiling is hit', async () => {
      const taskInDb = {
        id: 'task-cap',
        userId: 'user-1',
        conversationId: 'conv-1',
        status: 'RUNNING',
        fenceToken: 1,
        metadata: {
          plan: {
            goal: 'Analyze',
            steps: [
              {
                stepIndex: 0,
                toolName: 'propose_resume_edits',
                description: 'Propose edits',
                inputArguments: {},
                permissionTier: ToolPermissionTier.AI_ANALYSIS,
                status: 'PENDING',
              },
            ],
          },
        },
      };

      mockTaskRepo.findOne.mockResolvedValue(taskInDb);
      mockToolRegistry.getTool.mockReturnValue({
        name: 'propose_resume_edits',
        creditCost: 2,
        execute: vi.fn(),
      });
      mockCreditsService.reserveCredits.mockRejectedValue(
        new Error('Task credit spending limit exceeded (6 spent/reserved, 2 requested, max 6 per task).'),
      );

      await service.executeTask(taskInDb as any, 1, 'worker-1');

      expect(taskInDb.status).toBe('FAILED');
      expect(mockAgentService.publishEvent).toHaveBeenCalledWith(
        'task-cap',
        'conv-1',
        'task_failed',
        expect.objectContaining({
          status: 'FAILED',
          reason: 'TASK_SPENDING_LIMIT_EXCEEDED',
        }),
      );
    });
  });

  describe('approveAndApplyProposal (HITL Security)', () => {
    it('throws ForbiddenException if client proposal hash does not match staged hash (tampering check)', async () => {
      mockDataSource.transaction = vi.fn(async (cb) => {
        const manager: any = {
          findOne: vi.fn().mockImplementation((entity) => {
            if (entity === AgentToolExecution) {
              return Promise.resolve({
                id: 'exec-1',
                taskId: 'task-1',
                userId: 'user-1',
                status: 'PENDING_APPROVAL',
                isConsumed: false,
                expiresAt: new Date(Date.now() + 60000),
                proposalHash: 'canonical_server_hash_' + 'a'.repeat(42),
                resumeId: 'resume-1',
              });
            }
            return null;
          }),
        };
        return cb(manager);
      });

      await expect(
        service.approveAndApplyProposal(
          'task-1',
          'exec-1',
          'tampered_client_hash_' + 'b'.repeat(43),
          'user-1',
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('throws ConflictException if resume version has changed since proposal formulation', async () => {
      mockDataSource.transaction = vi.fn(async (cb) => {
        const manager: any = {
          findOne: vi.fn().mockImplementation((entity) => {
            if (entity === AgentToolExecution) {
              return Promise.resolve({
                id: 'exec-1',
                taskId: 'task-1',
                userId: 'user-1',
                status: 'PENDING_APPROVAL',
                isConsumed: false,
                expiresAt: new Date(Date.now() + 60000),
                proposalHash: 'valid_hash_' + 'a'.repeat(53),
                expectedResumeVersion: 2,
                resumeId: 'resume-1',
              });
            }
            if (entity === Resume) {
              return Promise.resolve({
                id: 'resume-1',
                version: 3, // Version advanced to 3!
                content: { headline: 'Developer' },
              });
            }
            return null;
          }),
        };
        return cb(manager);
      });

      await expect(
        service.approveAndApplyProposal(
          'task-1',
          'exec-1',
          'valid_hash_' + 'a'.repeat(53),
          'user-1',
        ),
      ).rejects.toThrow(ConflictException);
    });

    it('throws ConflictException if proposal has already been consumed (single-use invariant)', async () => {
      mockDataSource.transaction = vi.fn(async (cb) => {
        const manager: any = {
          findOne: vi.fn().mockImplementation((entity) => {
            if (entity === AgentToolExecution) {
              return Promise.resolve({
                id: 'exec-1',
                taskId: 'task-1',
                userId: 'user-1',
                isConsumed: true, // already consumed
              });
            }
            return null;
          }),
        };
        return cb(manager);
      });

      await expect(
        service.approveAndApplyProposal('task-1', 'exec-1', 'some-hash', 'user-1'),
      ).rejects.toThrow(ConflictException);
    });

    it('throws GoneException if proposal window (> 15m) has expired', async () => {
      mockDataSource.transaction = vi.fn(async (cb) => {
        const manager: any = {
          findOne: vi.fn().mockImplementation((entity) => {
            if (entity === AgentToolExecution) {
              return Promise.resolve({
                id: 'exec-1',
                taskId: 'task-1',
                userId: 'user-1',
                status: 'PENDING_APPROVAL',
                isConsumed: false,
                expiresAt: new Date(Date.now() - 1000), // expired
              });
            }
            return null;
          }),
        };
        return cb(manager);
      });

      await expect(
        service.approveAndApplyProposal('task-1', 'exec-1', 'some-hash', 'user-1'),
      ).rejects.toThrow(GoneException);
    });

    it('applies server-staged payload, increments resume version, and creates snapshot on valid approval', async () => {
      const executionRecord = {
        id: 'exec-1',
        taskId: 'task-1',
        userId: 'user-1',
        status: 'PENDING_APPROVAL',
        isConsumed: false,
        expiresAt: new Date(Date.now() + 60000),
        proposalHash: 'verified_hash_' + 'c'.repeat(50),
        expectedResumeVersion: 4,
        resumeId: 'resume-1',
        outputPayload: {
          sectionDiffs: {
            headline: { original: 'Junior Dev', proposed: 'Senior Staff Engineer' },
            experience: [
              {
                company: 'Acme',
                title: 'Engineer',
                bulletDiffs: [
                  { bulletIndex: 0, original: 'Built APIs', proposed: 'Architected high-throughput APIs' },
                ],
              },
            ],
          },
          changeSummary: 'Tailored for Staff Role',
        },
      };

      const resumeRecord = {
        id: 'resume-1',
        version: 4,
        content: {
          headline: 'Junior Dev',
          experience: [{ company: 'Acme', title: 'Engineer', bullets: ['Built APIs'] }],
        },
      };

      let savedResume: any;
      let savedExecution: any;

      mockDataSource.transaction = vi.fn(async (cb) => {
        const manager: any = {
          findOne: vi.fn().mockImplementation((entity) => {
            if (entity === AgentToolExecution) return Promise.resolve(executionRecord);
            if (entity === Resume) return Promise.resolve(resumeRecord);
            if (entity === AgentTask) return Promise.resolve({ id: 'task-1', conversationId: 'conv-1' });
            return null;
          }),
          save: vi.fn((entity) => {
            if (entity.version !== undefined) savedResume = entity;
            if (entity.isConsumed !== undefined) savedExecution = entity;
            return Promise.resolve(entity);
          }),
          create: vi.fn((entityClass, data) => data),
        };
        return cb(manager);
      });

      const result = await service.approveAndApplyProposal(
        'task-1',
        'exec-1',
        'verified_hash_' + 'c'.repeat(50),
        'user-1',
      );

      expect(result.success).toBe(true);
      expect(result.newVersion).toBe(5);
      expect(savedResume.content.headline).toBe('Senior Staff Engineer');
      expect(savedResume.content.experience[0].bullets[0]).toBe('Architected high-throughput APIs');
      expect(savedExecution.isConsumed).toBe(true);
      expect(savedExecution.status).toBe('APPROVED');
    });

    it('rejectProposal marks execution REJECTED, cancels task, and emits task_cancelled', async () => {
      const execution = { id: 'exec-rej', taskId: 'task-rej', userId: 'user-1', status: 'PENDING_APPROVAL', isConsumed: false };
      const task = { id: 'task-rej', conversationId: 'conv-1', userId: 'user-1', status: 'AWAITING_APPROVAL' };

      mockToolExecutionRepo.findOne.mockResolvedValue(execution);
      mockTaskRepo.findOne.mockResolvedValue(task);

      await service.rejectProposal('task-rej', 'exec-rej', 'user-1');

      expect(execution.status).toBe('REJECTED');
      expect(execution.isConsumed).toBe(true);
      expect(task.status).toBe('CANCELLED');
      expect(mockAgentService.publishEvent).toHaveBeenCalledWith(
        'task-rej',
        'conv-1',
        'task_cancelled',
        expect.objectContaining({ taskId: 'task-rej' }),
      );
    });
  });
});

