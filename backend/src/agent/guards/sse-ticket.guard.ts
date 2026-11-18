import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import crypto from 'node:crypto';
import { AgentStreamTicket } from '../entities/agent-stream-ticket.entity.js';

@Injectable()
export class SseTicketGuard implements CanActivate {
  constructor(
    @InjectRepository(AgentStreamTicket)
    private readonly ticketRepository: Repository<AgentStreamTicket>,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const ticket = (request.query?.ticket as string) || (request.headers?.['x-stream-ticket'] as string);

    if (!ticket || typeof ticket !== 'string') {
      throw new UnauthorizedException('Missing SSE stream ticket');
    }

    const conversationId = request.params?.id || request.params?.conversationId;
    if (!conversationId) {
      throw new UnauthorizedException('Missing conversationId context');
    }

    const ticketHash = crypto.createHash('sha256').update(ticket).digest('hex');
    const now = new Date();

    // Atomic compare-and-set single-use burn on PostgreSQL to prevent TOCTOU replay races
    if (typeof this.ticketRepository.createQueryBuilder === 'function') {
      const burnResult = await this.ticketRepository
        .createQueryBuilder()
        .update(AgentStreamTicket)
        .set({ consumedAt: now })
        .where(
          'ticket_hash = :ticketHash AND conversation_id = :conversationId AND consumed_at IS NULL AND expires_at > :now',
          { ticketHash, conversationId, now },
        )
        .returning(['user_id'])
        .execute();

      if (burnResult.affected === 1) {
        const returnedUserId = burnResult.raw?.[0]?.user_id;
        let userId = returnedUserId;
        if (!userId) {
          const record = await this.ticketRepository.findOne({ where: { ticketHash, conversationId } });
          userId = record?.userId;
        }
        if (!userId) {
          throw new UnauthorizedException('Invalid stream ticket');
        }
        request.user = { id: userId, userId };
        return true;
      }

      // Diagnose failure reason cleanly without leaking cross-tenant details
      const existing = await this.ticketRepository.findOne({
        where: { ticketHash, conversationId },
      });
      if (!existing) {
        throw new UnauthorizedException('Invalid stream ticket');
      }
      if (existing.consumedAt) {
        throw new UnauthorizedException('Stream ticket has already been consumed (single-use enforcement)');
      }
      if (now > existing.expiresAt) {
        throw new UnauthorizedException('Stream ticket has expired (30-second window exceeded)');
      }
      throw new UnauthorizedException('Invalid stream ticket');
    }

    // Fallback for lightweight unit-test mock repositories without createQueryBuilder
    const ticketRecord = await this.ticketRepository.findOne({
      where: { ticketHash, conversationId },
    });

    if (!ticketRecord) {
      throw new UnauthorizedException('Invalid stream ticket');
    }

    if (ticketRecord.consumedAt) {
      throw new UnauthorizedException('Stream ticket has already been consumed (single-use enforcement)');
    }

    if (now > ticketRecord.expiresAt) {
      throw new UnauthorizedException('Stream ticket has expired (30-second window exceeded)');
    }

    ticketRecord.consumedAt = now;
    await this.ticketRepository.save(ticketRecord);

    request.user = {
      id: ticketRecord.userId,
      userId: ticketRecord.userId,
    };

    return true;
  }
}
