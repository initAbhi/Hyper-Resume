import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Resume } from '../resumes/entities/resume.entity.js';
import { JobApplication } from '../applications/entities/job-application.entity.js';
import { JobDiscoveryService } from './job-discovery.service.js';
import { JobDiscoveryController } from './job-discovery.controller.js';
import { AuthModule } from '../auth/auth.module.js';
import { JobsModule } from '../jobs/jobs.module.js';
import { JobMatchingModule } from '../job-matching/job-matching.module.js';
import { ApplicationsModule } from '../applications/applications.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Resume, JobApplication]),
    AuthModule,
    JobsModule,
    JobMatchingModule,
    ApplicationsModule,
  ],
  controllers: [JobDiscoveryController],
  providers: [JobDiscoveryService],
  exports: [JobDiscoveryService],
})
export class JobDiscoveryModule {}

