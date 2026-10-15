import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JobMatch, type RequirementMatchAnalysis, type ScoreComponents } from './entities/job-match.entity.js';
import { Resume } from '../resumes/entities/resume.entity.js';
import { JobDescription } from '../jobs/entities/job-description.entity.js';
import { CreditLedger } from '../credits/entities/credit-ledger.entity.js';
import { AiService } from '../ai/ai.service.js';
import { CreateJobMatchDto } from './dto/create-job-match.dto.js';

@Injectable()
export class JobMatchingService {
  constructor(
    @InjectRepository(JobMatch)
    private readonly jobMatchRepository: Repository<JobMatch>,
    @InjectRepository(Resume)
    private readonly resumeRepository: Repository<Resume>,
    @InjectRepository(JobDescription)
    private readonly jobRepository: Repository<JobDescription>,
    @InjectRepository(CreditLedger)
    private readonly creditLedgerRepository: Repository<CreditLedger>,
    private readonly aiService: AiService,
  ) {}

  async createJobMatch(userId: string, dto: CreateJobMatchDto): Promise<JobMatch> {
    // 1. Verify Resume ownership
    const resume = await this.resumeRepository.findOne({
      where: { id: dto.resumeId, userId, isArchived: false },
    });
    if (!resume) {
      throw new NotFoundException('Resume not found or access denied');
    }

    // 2. Verify Job Description ownership
    const job = await this.jobRepository.findOne({
      where: { id: dto.jobDescriptionId, userId },
    });
    if (!job) {
      throw new NotFoundException('Job description not found or access denied');
    }

    // 3. Match requirements against resume evidence via AI Provider
    const requirementsAnalysis = (await this.aiService.matchRequirements(
      resume.content,
      job.parsedRequirements,
    )) as RequirementMatchAnalysis[];

    // 4. Calculate deterministic 5-component scores
    const scoreComponents = this.calculateScoreComponents(
      requirementsAnalysis,
      job.parsedRequirements,
      resume.content,
    );

    const overallScore = Math.round(
      scoreComponents.requiredSkillsScore * 0.35 +
      scoreComponents.experienceScore * 0.25 +
      scoreComponents.preferredSkillsScore * 0.15 +
      scoreComponents.responsibilityScore * 0.15 +
      scoreComponents.formattingScore * 0.10,
    );

    // 5. Generate transparent, fact-anchored recommendations
    const recommendations = this.generateRecommendations(requirementsAnalysis);

    // 6. Persist Job Match
    const jobMatch = this.jobMatchRepository.create({
      userId,
      resumeId: resume.id,
      jobDescriptionId: job.id,
      overallScore,
      scoreComponents,
      requirementsAnalysis,
      recommendations,
    });
    const savedMatch = await this.jobMatchRepository.save(jobMatch);

    // 7. Deduct 1 credit for completed match analysis (if available)
    const { sum } = await this.creditLedgerRepository
      .createQueryBuilder('ledger')
      .select('COALESCE(SUM(ledger.amount), 0)', 'sum')
      .where('ledger.user_id = :userId', { userId })
      .getRawOne();

    if (Number(sum) > 0) {
      const deduction = this.creditLedgerRepository.create({
        userId,
        amount: -1,
        transactionType: 'resume_analysis',
        idempotencyKey: `match-${savedMatch.id}`,
        description: `Job match analysis: ${job.title}`,
        metadata: { matchId: savedMatch.id },
      });
      await this.creditLedgerRepository.save(deduction);
    }

    return savedMatch;
  }

  async getJobMatch(userId: string, matchId: string): Promise<JobMatch> {
    const match = await this.jobMatchRepository.findOne({
      where: { id: matchId, userId },
      relations: { resume: true, jobDescription: true },
    });

    if (!match) {
      throw new NotFoundException('Job match report not found or access denied');
    }

    return match;
  }

  private calculateScoreComponents(
    analysis: RequirementMatchAnalysis[],
    requirements: any[],
    resumeContent: any,
  ): ScoreComponents {
    // 1. Required Skills Score
    const requiredReqs = analysis.filter((a) => {
      const req = requirements.find((r) => r.id === a.requirementId);
      return req?.type === 'required_skill';
    });
    const supportedRequired = requiredReqs.filter((a) => a.status === 'supported').length;
    const requiredSkillsScore =
      requiredReqs.length > 0
        ? Math.round((supportedRequired / requiredReqs.length) * 100)
        : 85;

    // 2. Preferred Skills Score
    const preferredReqs = analysis.filter((a) => {
      const req = requirements.find((r) => r.id === a.requirementId);
      return req?.type === 'preferred_skill';
    });
    const supportedPreferred = preferredReqs.filter((a) => a.status === 'supported').length;
    const preferredSkillsScore =
      preferredReqs.length > 0
        ? Math.round((supportedPreferred / preferredReqs.length) * 100)
        : 75;

    // 3. Experience Relevance Score
    const hasExp = (resumeContent.experience || []).length > 0;
    const experienceScore = hasExp ? 88 : 40;

    // 4. Responsibility & Domain Alignment Score
    const domainReqs = analysis.filter((a) => {
      const req = requirements.find((r) => r.id === a.requirementId);
      return req?.type === 'responsibility' || req?.type === 'domain';
    });
    const supportedDomain = domainReqs.filter((a) => a.status === 'supported').length;
    const responsibilityScore =
      domainReqs.length > 0
        ? Math.round((supportedDomain / domainReqs.length) * 100)
        : 80;

    // 5. Formatting Score
    const formattingScore = resumeContent.contact?.email && resumeContent.headline ? 95 : 70;

    return {
      requiredSkillsScore,
      preferredSkillsScore,
      experienceScore,
      responsibilityScore,
      formattingScore,
    };
  }

  private generateRecommendations(analysis: RequirementMatchAnalysis[]): string[] {
    const recs: string[] = [];

    const unevidenced = analysis.filter((a) => a.status === 'not_evidenced');
    if (unevidenced.length > 0) {
      recs.push(
        `Missing evidence for ${unevidenced.length} requirement(s). If you possess these capabilities, add them to your Master Profile before generating a tailored submission. Never invent credentials.`,
      );
    }

    const needsConfirm = analysis.filter((a) => a.status === 'needs_confirmation');
    if (needsConfirm.length > 0) {
      recs.push(
        `${needsConfirm.length} skill(s) are listed in your skills vault without supporting bullets demonstrating production impact. Click to add context bullets.`,
      );
    }

    const supported = analysis.filter((a) => a.status === 'supported');
    if (supported.length > 0) {
      recs.push(
        `Highlight your verified strengths (${supported.length} matched requirements) prominently near the top of your experience bullets.`,
      );
    }

    return recs;
  }
}
