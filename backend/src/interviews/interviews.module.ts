import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InterviewSession } from './entities/interview-session.entity.js';
import { InterviewQuestion } from './entities/interview-question.entity.js';
import { InterviewTurn } from './entities/interview-turn.entity.js';
import { Resume } from '../resumes/entities/resume.entity.js';
import { JobDescription } from '../jobs/entities/job-description.entity.js';
import { Payment } from '../payments/entities/payment.entity.js';
import { CreditsModule } from '../credits/credits.module.js';
import { AiModule } from '../ai/ai.module.js';
import { AuthModule } from '../auth/auth.module.js';
import { UsersModule } from '../users/users.module.js';
import { InterviewsService } from './interviews.service.js';
import { InterviewsController } from './interviews.controller.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      InterviewSession,
      InterviewQuestion,
      InterviewTurn,
      Resume,
      JobDescription,
      Payment,
    ]),
    CreditsModule,
    AiModule,
    AuthModule,
    UsersModule,
  ],
  controllers: [InterviewsController],
  providers: [InterviewsService],
  exports: [InterviewsService],
})
export class InterviewsModule {}

