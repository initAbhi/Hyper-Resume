import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Resume } from './entities/resume.entity.js';
import { ResumeVersion } from './entities/resume-version.entity.js';
import { ResumeAnalysis } from './entities/resume-analysis.entity.js';
import { CandidateProfile } from '../profiles/entities/candidate-profile.entity.js';
import { ResumesService } from './resumes.service.js';
import { ResumesController } from './resumes.controller.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Resume,
      ResumeVersion,
      ResumeAnalysis,
      CandidateProfile,
    ]),
    AuthModule,
  ],
  controllers: [ResumesController],
  providers: [ResumesService],
  exports: [ResumesService],
})
export class ResumesModule {}
