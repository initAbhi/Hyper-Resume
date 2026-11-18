import { beforeEach, describe, expect, it, vi } from 'vitest';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { of } from 'rxjs';
import { AgentController } from './agent.controller.js';
import { CreateAgentMessageDto } from './dto/agent-message.dto.js';
import { ApproveToolDto } from './dto/approve-tool.dto.js';

describe('AgentController & DTO Validation (Phase 2)', () => {
  let controller: AgentController;
  let mockAgentService: any;
  let mockExecutorService: any;
  const mockUser: any = { id: '11111111-1111-1111-1111-111111111111', email: 'test@example.com' };

  beforeEach(() => {
    mockAgentService = {
      createConversation: vi.fn().mockResolvedValue({ id: 'conv-1', userId: mockUser.id }),
      getConversations: vi.fn().mockResolvedValue([{ id: 'conv-1' }]),
      getConversation: vi.fn().mockResolvedValue({ id: 'conv-1', userId: mockUser.id }),
      getConversationMessages: vi.fn().mockResolvedValue([{ id: 'msg-1', role: 'user', content: 'Hi' }]),
      submitMessage: vi.fn().mockResolvedValue({
        taskId: 'task-1',
        conversationId: 'conv-1',
        messageId: 'msg-1',
      }),
      generateStreamTicket: vi.fn().mockResolvedValue({
        ticket: 'f'.repeat(64),
        expiresInSeconds: 30,
      }),
      subscribeToConversationStream: vi.fn().mockReturnValue(
        of({ id: '1', type: 'task_status', data: { status: 'PENDING' } }),
      ),
      cancelTask: vi.fn().mockResolvedValue({ id: 'task-1', status: 'CANCELLED' }),
    };

    mockExecutorService = {
      approveAndApplyProposal: vi.fn().mockResolvedValue({ success: true, newVersion: 5 }),
      rejectProposal: vi.fn().mockResolvedValue(undefined),
    };

    controller = new AgentController(mockAgentService, mockExecutorService);
  });

  describe('Conversation & Messaging Endpoints', () => {
    it('POST /conversations creates a conversation for the authenticated user', async () => {
      const dto = { activeResumeId: '22222222-2222-2222-2222-222222222222', title: 'ATS Audit' };
      const res = await controller.createConversation(mockUser, dto);

      expect(res.id).toBe('conv-1');
      expect(mockAgentService.createConversation).toHaveBeenCalledWith(mockUser.id, dto);
    });

    it('POST /conversations/:id/messages submits instruction and returns taskId', async () => {
      const dto: CreateAgentMessageDto = {
        content: 'Audit my resume for Senior Backend roles',
        activeResumeId: '22222222-2222-2222-2222-222222222222',
      };
      const res = await controller.submitMessage(mockUser, 'conv-1', dto);

      expect(res).toEqual({
        taskId: 'task-1',
        conversationId: 'conv-1',
        messageId: 'msg-1',
      });
      expect(mockAgentService.submitMessage).toHaveBeenCalledWith(mockUser.id, 'conv-1', dto);
    });

    it('POST /conversations/:id/stream-ticket returns single-use ticket with 30s TTL', async () => {
      const res = await controller.generateStreamTicket(mockUser, 'conv-1');

      expect(res.ticket.length).toBe(64);
      expect(res.expiresInSeconds).toBe(30);
      expect(mockAgentService.generateStreamTicket).toHaveBeenCalledWith(mockUser.id, 'conv-1');
    });

    it('GET /conversations/:id/stream uses query lastEventId or falls back to Last-Event-ID header', () => {
      controller.streamConversation('conv-1', { id: mockUser.id }, '42', '40');
      expect(mockAgentService.subscribeToConversationStream).toHaveBeenCalledWith('conv-1', mockUser.id, '42');

      controller.streamConversation('conv-1', { id: mockUser.id }, undefined, '40');
      expect(mockAgentService.subscribeToConversationStream).toHaveBeenCalledWith('conv-1', mockUser.id, '40');
    });
  });

  describe('Approval & Cancellation Endpoints', () => {
    it('POST /tasks/:taskId/approve delegates to approveAndApplyProposal on approve decision', async () => {
      const dto: ApproveToolDto = {
        executionId: '33333333-3333-3333-3333-333333333333',
        proposalHash: 'a'.repeat(64),
        decision: 'approve',
      };

      const res = await controller.approveTask(mockUser, 'task-1', dto);

      expect(res).toEqual({ success: true, newVersion: 5 });
      expect(mockExecutorService.approveAndApplyProposal).toHaveBeenCalledWith(
        'task-1',
        dto.executionId,
        dto.proposalHash,
        mockUser.id,
      );
    });

    it('POST /tasks/:taskId/approve delegates to rejectProposal on reject decision', async () => {
      const dto: ApproveToolDto = {
        executionId: '33333333-3333-3333-3333-333333333333',
        proposalHash: 'a'.repeat(64),
        decision: 'reject',
      };

      const res = await controller.approveTask(mockUser, 'task-1', dto);

      expect(res).toEqual({ success: true, rejected: true });
      expect(mockExecutorService.rejectProposal).toHaveBeenCalledWith(
        'task-1',
        dto.executionId,
        mockUser.id,
      );
    });

    it('POST /tasks/:taskId/cancel cancels the active task', async () => {
      const res = await controller.cancelTask(mockUser, 'task-1');

      expect(res.status).toBe('CANCELLED');
      expect(mockAgentService.cancelTask).toHaveBeenCalledWith('task-1', mockUser.id);
    });
  });

  describe('DTO Validation Rules', () => {
    it('rejects ApproveToolDto with non-64-char proposalHash or invalid decision', async () => {
      const badDto = plainToInstance(ApproveToolDto, {
        executionId: 'not-a-uuid',
        proposalHash: 'short-hash',
        decision: 'force_apply',
      });

      const errors = await validate(badDto);
      expect(errors.length).toBe(3);
    });

    it('rejects CreateAgentMessageDto with empty content', async () => {
      const badDto = plainToInstance(CreateAgentMessageDto, {
        content: '',
      });

      const errors = await validate(badDto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });
});

