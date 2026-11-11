import {
  BadGatewayException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, In, Repository } from 'typeorm';
import crypto from 'node:crypto';
import {
  InterviewSession,
  type InterviewSessionMode,
} from './entities/interview-session.entity.js';
import { InterviewQuestion } from './entities/interview-question.entity.js';
import {
  InterviewTurn,
  type TurnEvaluation,
} from './entities/interview-turn.entity.js';
import { Resume } from '../resumes/entities/resume.entity.js';
import { JobDescription } from '../jobs/entities/job-description.entity.js';
import { Payment } from '../payments/entities/payment.entity.js';
import { CreditsService } from '../credits/credits.service.js';
import { GeminiInterviewProvider } from '../ai/providers/gemini-interview.provider.js';
import { ContextDossierBuilder } from '../ai/utils/context-dossier-builder.js';
import { StartInterviewDto } from './dto/start-interview.dto.js';
import { SubmitAnswerDto } from './dto/submit-answer.dto.js';
import { SubmitFollowUpDto } from './dto/submit-follow-up.dto.js';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto.js';

export const INTERVIEW_CREDIT_COSTS: Record<InterviewSessionMode, number> = {
  quick_practice: 2,
  full_mock: 5,
  weak_area: 3,
};

@Injectable()
export class InterviewsService {
  private readonly logger = new Logger(InterviewsService.name);
  private readonly STALE_EVALUATION_MS = 30000; // 30 seconds stale recovery

  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(InterviewSession)
    private readonly sessionRepository: Repository<InterviewSession>,
    @InjectRepository(InterviewQuestion)
    private readonly questionRepository: Repository<InterviewQuestion>,
    @InjectRepository(InterviewTurn)
    private readonly turnRepository: Repository<InterviewTurn>,
    @InjectRepository(Resume)
    private readonly resumeRepository: Repository<Resume>,
    @InjectRepository(JobDescription)
    private readonly jobDescriptionRepository: Repository<JobDescription>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    private readonly creditsService: CreditsService,
    private readonly aiProvider: GeminiInterviewProvider,
  ) {}

  private async hasProAccess(userId: string): Promise<boolean> {
    if (typeof this.creditsService.hasActivePro === 'function') {
      return this.creditsService.hasActivePro(userId);
    }
    return false;
  }

  /**
   * Starts an interview session using the safe non-blocking 7-step pattern.
   */
  async startSession(
    userId: string,
    dto: StartInterviewDto,
    headerIdempotencyKey?: string,
  ): Promise<InterviewSession & { activeQuestion?: InterviewQuestion }> {
    const idempotencyKey =
      headerIdempotencyKey?.trim() ||
      dto.idempotencyKey?.trim() ||
      crypto.randomUUID();

    // 0. Check request idempotency
    const existingSession = await this.sessionRepository.findOne({
      where: { userId, idempotencyKey },
    });
    if (existingSession) {
      if (existingSession.status === 'in_progress' || existingSession.status === 'completed') {
        this.logger.debug(`Idempotent hit for session ${existingSession.id}`);
        const firstQ = await this.questionRepository.findOne({
          where: { sessionId: existingSession.id, orderIndex: existingSession.currentQuestionIndex },
        });
        return Object.assign(existingSession, { activeQuestion: firstQ || undefined });
      }
      if (existingSession.status === 'initializing') {
        throw new ConflictException('Interview session initialization already in progress. Please wait.');
      }
    }

    // 1. Verify user ownership of resume
    const resume = await this.resumeRepository.findOne({
      where: { id: dto.resumeId, userId },
    });
    if (!resume) {
      throw new NotFoundException('Resume not found or not owned by user.');
    }

    // Verify JD ownership if provided
    let jobDescription: JobDescription | null = null;
    if (dto.jobDescriptionId) {
      jobDescription = await this.jobDescriptionRepository.findOne({
        where: { id: dto.jobDescriptionId, userId },
      });
      if (!jobDescription) {
        throw new NotFoundException('Job description not found or not owned by user.');
      }
    }

    // 2. Server-Side Entitlement Check
    const hasProPass = await this.hasProAccess(userId);
    const isPaidUser =
      hasProPass ||
      (await this.paymentRepository.exists({
        where: { userId, status: 'succeeded' },
      }));

    if (!isPaidUser) {
      if (dto.sessionMode !== 'quick_practice') {
        throw new ForbiddenException(
          'Full Mock and Weak Area interviews require a paid Pro Pass or credit pack. Please upgrade to unlock.',
        );
      }
      const existingTrial = await this.sessionRepository.findOne({
        where: {
          userId,
          isFreeTrial: true,
          status: In(['initializing', 'in_progress', 'completed']),
        },
      });
      if (existingTrial) {
        throw new ForbiddenException(
          'You have already completed your free Quick Practice trial. Please activate a Pro Pass to continue.',
        );
      }
    }

    const requiredCredits = hasProPass ? 0 : INTERVIEW_CREDIT_COSTS[dto.sessionMode];
    const questionCount = dto.sessionMode === 'full_mock' ? 5 : 3;

    // STEP 1-3: Fast DB Transaction (<10ms)
    const session = await this.dataSource.transaction(async (manager: EntityManager) => {
      if (requiredCredits > 0) {
        // Check credit balance with manager
        const balance = await this.creditsService.getBalance(userId, manager);
        if (balance < requiredCredits) {
          throw new ForbiddenException(
            `Insufficient credit balance (${balance} available, ${requiredCredits} required). Please recharge or upgrade to Pro.`,
          );
        }

        // Deduct credits with manager
        const ledgerKey = `interview-start-${idempotencyKey}`;
        await this.creditsService.deductCredits(
          userId,
          requiredCredits,
          'mock_interview',
          ledgerKey,
          `Interview session initialization (${dto.sessionMode}: ${dto.targetRole})`,
          {
            sessionMode: dto.sessionMode,
            targetRole: dto.targetRole,
            isFreeTrial: !isPaidUser,
            costBasis: isPaidUser ? 10.7647 : 0.0,
          },
          manager,
        );
      }

      // Create session in 'initializing' state with explicit is_free_trial flag
      const newSession = manager.create(InterviewSession, {
        userId,
        resumeId: dto.resumeId,
        jobDescriptionId: dto.jobDescriptionId,
        sessionMode: dto.sessionMode,
        targetRole: dto.targetRole,
        difficulty: dto.difficulty || 'mid',
        status: 'initializing',
        isFreeTrial: !isPaidUser,
        totalQuestions: questionCount,
        currentQuestionIndex: 0,
        creditsCharged: requiredCredits,
        idempotencyKey,
        expiresAt: new Date(Date.now() + 2 * 3600 * 1000), // 2 hour validity
      });

      return manager.save(InterviewSession, newSession);
    });

    // STEP 4: AI Generation Outside of Database Transaction
    let generatedQuestions;
    let telemetry;
    try {
      const dossier = ContextDossierBuilder.buildDossier(
        dto.targetRole,
        resume.content,
        jobDescription || undefined,
      );
      let dossierText = ContextDossierBuilder.formatDossierText(dossier);

      if (dto.sessionMode === 'weak_area' && typeof this.turnRepository.createQueryBuilder === 'function') {
        const weakTurns = await this.turnRepository
          .createQueryBuilder('turn')
          .innerJoin('turn.session', 'sess')
          .innerJoinAndSelect('turn.question', 'q')
          .where('sess.user_id = :userId', { userId })
          .andWhere('turn.turn_score IS NOT NULL')
          .andWhere('turn.turn_score < :threshold', { threshold: 75 })
          .orderBy('turn.turn_score', 'ASC')
          .take(5)
          .getMany();

        if (weakTurns.length > 0) {
          const weakLines = weakTurns.map(
            (t) =>
              `- Previous weak score (${t.turnScore}/100) in ${t.question?.category || 'general'}: ${t.evaluation?.improvementTip || t.question?.questionText || ''}`,
          );
          dossierText += `\n\n[PRIOR WEAK AREAS TO RE-TEST]\n${weakLines.join('\n')}`;
        }
      }

      const result = await this.aiProvider.generateQuestions(
        dossierText,
        dto.sessionMode,
        dto.difficulty || 'mid',
        questionCount,
      );
      generatedQuestions = result.questions;
      telemetry = result.telemetry;
    } catch (err: any) {
      this.logger.error(`AI Question generation failed for session ${session.id}: ${err.message}`);
      // STEP 6: Atomic Compensating Refund Transaction
      await this.atomicRefundAndFail(session);
      throw new BadGatewayException(
        'Failed to generate interview questions from AI provider. Your credits have been automatically refunded.',
      );
    }

    // STEP 5: Fast DB Persistence (<15ms)
    const savedQuestions = await this.dataSource.transaction(async (manager: EntityManager) => {
      const questionEntities = generatedQuestions.map((q) =>
        manager.create(InterviewQuestion, {
          sessionId: session.id,
          orderIndex: q.orderIndex,
          category: q.category,
          questionText: q.questionText,
          contextHint: q.contextHint,
          idealAnswerOutline: q.idealAnswerOutline,
        }),
      );
      const saved = await manager.save(InterviewQuestion, questionEntities);

      session.status = 'in_progress';
      session.totalInputTokens += telemetry.inputTokens;
      session.totalOutputTokens += telemetry.outputTokens;
      session.thinkingTokens += telemetry.thinkingTokens;
      session.estimatedCostUsd = Number(telemetry.estimatedCostUsd.toFixed(6));
      await manager.save(InterviewSession, session);

      return saved;
    });

    const activeQuestion = savedQuestions.find((q) => q.orderIndex === 0) || savedQuestions[0];
    return Object.assign(session, { activeQuestion });
  }

  /**
   * Retrieves active session details, questions, and completed turns.
   */
  async getSession(userId: string, sessionId: string) {
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId, userId },
    });
    if (!session) {
      throw new NotFoundException('Interview session not found or unauthorized.');
    }

    // Auto-expire check
    if (session.status === 'in_progress' && new Date() > new Date(session.expiresAt)) {
      session.status = 'expired';
      await this.sessionRepository.save(session);
    }

    const questions = await this.questionRepository.find({
      where: { sessionId },
      order: { orderIndex: 'ASC' },
    });

    const turns = await this.turnRepository.find({
      where: { sessionId },
      order: { createdAt: 'ASC' },
    });

    const activeQuestion = questions.find((q) => q.orderIndex === session.currentQuestionIndex);

    return {
      session,
      questions,
      turns,
      activeQuestion: activeQuestion || null,
    };
  }

  /**
   * Evaluates candidate's answer for active question with stale-state recovery.
   */
  async submitAnswer(userId: string, sessionId: string, dto: SubmitAnswerDto) {
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId, userId },
    });
    if (!session) {
      throw new NotFoundException('Interview session not found.');
    }

    if (session.status !== 'in_progress') {
      throw new ConflictException(`Session is not active (current status: ${session.status}).`);
    }

    if (new Date() > new Date(session.expiresAt)) {
      session.status = 'expired';
      await this.sessionRepository.save(session);
      throw new ConflictException('Interview session has expired.');
    }

    const question = await this.questionRepository.findOne({
      where: { id: dto.questionId, sessionId },
    });
    if (!question) {
      throw new NotFoundException('Question does not belong to this interview session.');
    }

    // Stale Processing-State Recovery & Concurrency Guard
    let turn = await this.turnRepository.findOne({
      where: { sessionId, questionId: dto.questionId },
    });

    if (turn) {
      if (turn.status === 'evaluated') {
        this.logger.debug(`Returning cached evaluation for turn ${turn.id}`);
        return turn;
      }
      if (turn.status === 'evaluating') {
        const elapsed = Date.now() - new Date(turn.updatedAt).getTime();
        if (elapsed < this.STALE_EVALUATION_MS) {
          throw new ConflictException('Answer evaluation already in progress. Please wait.');
        }
        this.logger.warn(`Recovering stale evaluating state for turn ${turn.id} (${elapsed}ms elapsed)`);
      }
    } else {
      // Atomic Turn Reservation
      try {
        turn = this.turnRepository.create({
          sessionId,
          questionId: dto.questionId,
          status: 'evaluating',
          candidateAnswer: dto.candidateAnswer,
          timeTakenSeconds: dto.timeTakenSeconds,
        });
        turn = await this.turnRepository.save(turn);
      } catch (err: any) {
        if (err.code === '23505') {
          throw new ConflictException('Answer evaluation already in progress.');
        }
        throw err;
      }
    }

    // Outside DB: Call Gemini Evaluator
    try {
      const { evaluation, telemetry } = await this.aiProvider.evaluateAnswer(
        question.category,
        question.questionText,
        question.contextHint,
        dto.candidateAnswer,
        session.sessionMode === 'quick_practice', // Skip adaptive follow-ups in Quick Practice mode
      );

      turn.status = 'evaluated';
      turn.turnScore = evaluation.turnScore;
      turn.candidateAnswer = dto.candidateAnswer;
      turn.timeTakenSeconds = dto.timeTakenSeconds;
      turn.evaluation = evaluation;
      turn.followUpQuestion = evaluation.followUpQuestion;
      turn.evaluatedAt = new Date();

      const savedTurn = await this.turnRepository.save(turn);

      // Telemetry update
      session.totalInputTokens += telemetry.inputTokens;
      session.totalOutputTokens += telemetry.outputTokens;
      session.thinkingTokens += telemetry.thinkingTokens;
      session.estimatedCostUsd = Number(
        (Number(session.estimatedCostUsd) + telemetry.estimatedCostUsd).toFixed(6),
      );

      // If no follow-up was generated, advance current question index
      if (!evaluation.followUpQuestion) {
        session.currentQuestionIndex = Math.min(
          session.totalQuestions,
          session.currentQuestionIndex + 1,
        );
      }
      await this.sessionRepository.save(session);

      return savedTurn;
    } catch (err: any) {
      this.logger.error(`Answer evaluation failed: ${err.message}`);
      turn.status = 'failed';
      await this.turnRepository.save(turn);
      throw new BadGatewayException('Failed to evaluate answer. Please try submitting again.');
    }
  }

  /**
   * Evaluates candidate's follow-up answer.
   */
  async submitFollowUp(userId: string, sessionId: string, dto: SubmitFollowUpDto) {
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId, userId },
    });
    if (!session || session.status !== 'in_progress') {
      throw new ConflictException('Interview session is not active.');
    }

    const question = await this.questionRepository.findOne({
      where: { id: dto.questionId, sessionId },
    });
    if (!question) {
      throw new NotFoundException('Question not found in session.');
    }

    const turn = await this.turnRepository.findOne({
      where: { sessionId, questionId: dto.questionId },
    });
    if (!turn || !turn.followUpQuestion) {
      throw new ConflictException('No active follow-up question exists for this turn.');
    }

    if (turn.followUpStatus === 'evaluated') {
      return turn;
    }

    const { score, notes, telemetry } = await this.aiProvider.evaluateFollowUp(
      question.questionText,
      turn.followUpQuestion,
      dto.followUpAnswer,
    );

    turn.followUpAnswer = dto.followUpAnswer;
    turn.followUpScore = score;
    turn.followUpStatus = 'evaluated';
    if (turn.evaluation) {
      turn.evaluation.technicalAccuracyNotes += ` | Follow-up check: ${notes}`;
    }

    const updatedTurn = await this.turnRepository.save(turn);

    // Advance question index
    session.currentQuestionIndex = Math.min(
      session.totalQuestions,
      session.currentQuestionIndex + 1,
    );
    session.totalInputTokens += telemetry.inputTokens;
    session.totalOutputTokens += telemetry.outputTokens;
    session.estimatedCostUsd = Number(
      (Number(session.estimatedCostUsd) + telemetry.estimatedCostUsd).toFixed(6),
    );
    await this.sessionRepository.save(session);

    return updatedTurn;
  }

  /**
   * Completes session and synthesizes overall report.
   */
  async finishSession(userId: string, sessionId: string) {
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId, userId },
    });
    if (!session) {
      throw new NotFoundException('Session not found.');
    }

    if (session.status === 'completed') {
      return session;
    }

    const turns = await this.turnRepository.find({
      where: { sessionId, status: 'evaluated' },
    });

    const questions = await this.questionRepository.find({
      where: { sessionId },
    });

    const turnSummaries = turns.map((t) => {
      const q = questions.find((item) => item.id === t.questionId);
      return {
        category: q?.category || 'general',
        question: q?.questionText || '',
        score: t.turnScore || 60,
        feedback: t.evaluation?.improvementTip || '',
      };
    });

    const { report, telemetry } = await this.aiProvider.synthesizeFinalReport(
      session.targetRole,
      turnSummaries,
    );

    session.status = 'completed';
    session.overallScore = report.overallScore;
    session.scoreBreakdown = report.scoreBreakdown;
    session.summaryFeedback = report.summaryFeedback;
    session.completedAt = new Date();
    session.totalInputTokens += telemetry.inputTokens;
    session.totalOutputTokens += telemetry.outputTokens;
    session.estimatedCostUsd = Number(
      (Number(session.estimatedCostUsd) + telemetry.estimatedCostUsd).toFixed(6),
    );

    return this.sessionRepository.save(session);
  }

  /**
   * Retrieves scorecard report with server-side entitlement redaction for free users.
   */
  async getReport(userId: string, sessionId: string) {
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId, userId },
    });
    if (!session) {
      throw new NotFoundException('Session not found or unauthorized.');
    }

    const turns = await this.turnRepository.find({
      where: { sessionId },
      order: { createdAt: 'ASC' },
    });

    const questions = await this.questionRepository.find({
      where: { sessionId },
      order: { orderIndex: 'ASC' },
    });

    const hasProPass = await this.hasProAccess(userId);
    const isPaidUser =
      hasProPass ||
      (await this.paymentRepository.exists({
        where: { userId, status: 'succeeded' },
      }));

    // Server-Side Entitlement Redaction: Free trial users see sample model answer on Q1 only
    const sanitizedTurns = turns.map((turn, idx) => {
      const clone = { ...turn };
      if (!isPaidUser && idx > 0 && clone.evaluation) {
        clone.evaluation = {
          ...clone.evaluation,
          idealAnswerDraft: undefined,
          isLockedForPro: true,
        };
      }
      return clone;
    });

    return {
      session,
      questions,
      turns: sanitizedTurns,
      isPaidUser,
    };
  }

  /**
   * Lists past interview sessions.
   */
  async listSessions(userId: string, pagination: PaginationQueryDto) {
    const [items, total] = await this.sessionRepository.findAndCount({
      where: { userId, status: In(['in_progress', 'completed', 'expired']) },
      order: { createdAt: 'DESC' },
      skip: pagination.skip,
      take: pagination.limit,
    });

    return {
      items,
      total,
      page: pagination.page,
      limit: pagination.limit,
    };
  }

  /**
   * Helper: Atomic refund and session failure transition inside a single transaction.
   */
  private async atomicRefundAndFail(session: InterviewSession): Promise<void> {
    const refundKey = `refund-session-${session.id}`;
    await this.dataSource.transaction(async (manager: EntityManager) => {
      if (session.creditsCharged > 0) {
        await this.creditsService.refundCredits(
          session.userId,
          session.creditsCharged,
          refundKey,
          'Compensating refund: AI question generation failed',
          manager,
        );
      }
      session.status = 'failed';
      session.isFreeTrial = false;
      await manager.save(InterviewSession, session);
    });
    this.logger.log(`Atomically refunded ${session.creditsCharged} credits for failed session ${session.id}`);
  }
}

