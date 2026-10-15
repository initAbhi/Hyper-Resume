import { Module } from '@nestjs/common';
import { ResumeParserService } from './resume-parser.service.js';
import { ResumeParsingController } from './resume-parsing.controller.js';
import { AiModule } from '../ai/ai.module.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [AiModule, AuthModule],
  controllers: [ResumeParsingController],
  providers: [ResumeParserService],
  exports: [ResumeParserService],
})
export class ResumeParsingModule {}
