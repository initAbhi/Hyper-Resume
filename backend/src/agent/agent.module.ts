import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgentConversation } from './entities/agent-conversation.entity.js';
import { AgentMessage } from './entities/agent-message.entity.js';
import { AgentTask } from './entities/agent-task.entity.js';
import { AgentToolExecution } from './entities/agent-tool-execution.entity.js';
import { AgentTaskEvent } from './entities/agent-task-event.entity.js';
import { AgentStreamTicket } from './entities/agent-stream-ticket.entity.js';
import { Resume } from '../resumes/entities/resume.entity.js';

import { ResumesModule } from '../resumes/resumes.module.js';
import { JobsModule } from '../jobs/jobs.module.js';
import { JobMatchingModule } from '../job-matching/job-matching.module.js';
import { JobDiscoveryModule } from '../job-discovery/job-discovery.module.js';
import { ProfilesModule } from '../profiles/profiles.module.js';
import { CoverLettersModule } from '../cover-letters/cover-letters.module.js';
import { InterviewsModule } from '../interviews/interviews.module.js';
import { AiModule } from '../ai/ai.module.js';
import { CreditsModule } from '../credits/credits.module.js';
import { AuthModule } from '../auth/auth.module.js';

import { ToolRegistryService } from './tools/tool-registry.service.js';
import { AgentService } from './agent.service.js';
import { AgentPlannerService } from './agent-planner.service.js';
import { AgentExecutorService } from './agent-executor.service.js';
import { DurableTaskWorker } from './durable-task-worker.js';
import { SseTicketGuard } from './guards/sse-ticket.guard.js';
import { AgentController } from './agent.controller.js';
import { ReadResumeTool } from './tools/definitions/read-resume.tool.js';
import { ReadResumeVersionsTool } from './tools/definitions/read-resume-versions.tool.js';
import { SearchJobsTool } from './tools/definitions/search-jobs.tool.js';
import { ReadCareerProfileTool } from './tools/definitions/read-career-profile.tool.js';
import { RunAtsAuditTool } from './tools/definitions/run-ats-audit.tool.js';
import { MatchJobTool } from './tools/definitions/match-job.tool.js';
import { GenerateBulletsTool } from './tools/definitions/generate-bullets.tool.js';
import { ProposeEditsTool } from './tools/definitions/propose-edits.tool.js';
import { GenerateCoverLetterTool } from './tools/definitions/generate-cover-letter.tool.js';
import { StartInterviewTool } from './tools/definitions/start-interview.tool.js';
import { SaveJobTool } from './tools/definitions/save-job.tool.js';
import { CreateResumeTool } from './tools/definitions/create-resume.tool.js';
import { ApplyApprovedEditsTool } from './tools/definitions/apply-edits.tool.js';
import { RestoreVersionTool } from './tools/definitions/restore-version.tool.js';
import { UpdateCareerProfileTool } from './tools/definitions/update-career-profile.tool.js';

const TOOLS = [
  ReadResumeTool,
  ReadResumeVersionsTool,
  SearchJobsTool,
  ReadCareerProfileTool,
  RunAtsAuditTool,
  MatchJobTool,
  GenerateBulletsTool,
  ProposeEditsTool,
  GenerateCoverLetterTool,
  StartInterviewTool,
  SaveJobTool,
  CreateResumeTool,
  ApplyApprovedEditsTool,
  RestoreVersionTool,
  UpdateCareerProfileTool,
];

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AgentConversation,
      AgentMessage,
      AgentTask,
      AgentToolExecution,
      AgentTaskEvent,
      AgentStreamTicket,
      Resume,
    ]),
    ResumesModule,
    JobsModule,
    JobMatchingModule,
    JobDiscoveryModule,
    ProfilesModule,
    CoverLettersModule,
    InterviewsModule,
    AiModule,
    CreditsModule,
    AuthModule,
  ],
  controllers: [AgentController],
  providers: [
    ToolRegistryService,
    AgentService,
    AgentPlannerService,
    AgentExecutorService,
    DurableTaskWorker,
    SseTicketGuard,
    ...TOOLS,
  ],
  exports: [
    TypeOrmModule,
    ToolRegistryService,
    AgentService,
    AgentPlannerService,
    AgentExecutorService,
    DurableTaskWorker,
    SseTicketGuard,
    ...TOOLS,
  ],
})
export class AgentModule {}

