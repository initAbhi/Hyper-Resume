import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Resume } from './entities/resume.entity.js';
import { ResumeVersion } from './entities/resume-version.entity.js';
import { ResumeAnalysis } from './entities/resume-analysis.entity.js';
import { ResumeAdaptation } from './entities/resume-adaptation.entity.js';
import { ResumeShare } from './entities/resume-share.entity.js';
import { ResumeShareEvent } from './entities/resume-share-event.entity.js';
import { CandidateProfile } from '../profiles/entities/candidate-profile.entity.js';
import { ResumesService } from './resumes.service.js';
import { ResumeSharesService } from './resume-shares.service.js';
import { PdfExportService } from './pdf-export.service.js';
import { DocxExportService } from './docx-export.service.js';
import { ResumesController } from './resumes.controller.js';
import { PublicResumeSharesController } from './public-resume-shares.controller.js';
import { AuthModule } from '../auth/auth.module.js';
import { CreditsModule } from '../credits/credits.module.js';
import { AiModule } from '../ai/ai.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Resume,
      ResumeVersion,
      ResumeAnalysis,
      ResumeAdaptation,
      ResumeShare,
      ResumeShareEvent,
      CandidateProfile,
    ]),
    AuthModule,
    CreditsModule,
    AiModule,
  ],
  controllers: [ResumesController, PublicResumeSharesController],
  providers: [
    ResumesService,
    ResumeSharesService,
    PdfExportService,
    DocxExportService,
  ],
  exports: [
    ResumesService,
    ResumeSharesService,
    PdfExportService,
    DocxExportService,
  ],
})
export class ResumesModule {}
