import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobMatch } from './entities/job-match.entity.js';
import { Resume } from '../resumes/entities/resume.entity.js';
import { JobDescription } from '../jobs/entities/job-description.entity.js';
import { CreditLedger } from '../credits/entities/credit-ledger.entity.js';
import { JobMatchingService } from './job-matching.service.js';
import { JobMatchingController } from './job-matching.controller.js';
import { AiModule } from '../ai/ai.module.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([JobMatch, Resume, JobDescription, CreditLedger]),
    AiModule,
    AuthModule,
  ],
  controllers: [JobMatchingController],
  providers: [JobMatchingService],
  exports: [JobMatchingService],
})
export class JobMatchingModule {}
