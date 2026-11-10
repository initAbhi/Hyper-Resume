import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoverLetter } from './entities/cover-letter.entity.js';
import { Resume } from '../resumes/entities/resume.entity.js';
import { JobMatch } from '../job-matching/entities/job-match.entity.js';
import { CoverLettersService } from './cover-letters.service.js';
import { CoverLettersController } from './cover-letters.controller.js';
import { AiModule } from '../ai/ai.module.js';
import { AuthModule } from '../auth/auth.module.js';
import { ResumesModule } from '../resumes/resumes.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([CoverLetter, Resume, JobMatch]),
    AiModule,
    AuthModule,
    ResumesModule,
  ],
  controllers: [CoverLettersController],
  providers: [CoverLettersService],
  exports: [CoverLettersService],
})
export class CoverLettersModule {}

