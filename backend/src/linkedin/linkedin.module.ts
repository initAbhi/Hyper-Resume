import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LinkedInAudit } from './entities/linkedin-audit.entity.js';
import { Resume } from '../resumes/entities/resume.entity.js';
import { ResumeShare } from '../resumes/entities/resume-share.entity.js';
import { LinkedInService } from './linkedin.service.js';
import { LinkedInController } from './linkedin.controller.js';
import { AuthModule } from '../auth/auth.module.js';
import { AiModule } from '../ai/ai.module.js';
import { ProfilesModule } from '../profiles/profiles.module.js';
import { ResumesModule } from '../resumes/resumes.module.js';
import { ResumeParsingModule } from '../resume-parsing/resume-parsing.module.js';
import { CreditsModule } from '../credits/credits.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([LinkedInAudit, Resume, ResumeShare]),
    AuthModule,
    AiModule,
    ProfilesModule,
    ResumesModule,
    ResumeParsingModule,
    CreditsModule,
  ],
  controllers: [LinkedInController],
  providers: [LinkedInService],
  exports: [LinkedInService],
})
export class LinkedInModule {}

