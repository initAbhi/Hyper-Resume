import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobApplication } from './entities/job-application.entity.js';
import { Resume } from '../resumes/entities/resume.entity.js';
import { ResumeVersion } from '../resumes/entities/resume-version.entity.js';
import { ApplicationsService } from './applications.service.js';
import { ApplicationsController } from './applications.controller.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [TypeOrmModule.forFeature([JobApplication, Resume, ResumeVersion]), AuthModule],
  controllers: [ApplicationsController],
  providers: [ApplicationsService],
  exports: [ApplicationsService],
})
export class ApplicationsModule {}
