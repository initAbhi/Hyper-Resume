import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MockAiProvider } from './providers/mock-ai.provider.js';
import { GeminiAiProvider } from './providers/gemini-ai.provider.js';
import { AiService } from './ai.service.js';

import { AiController } from './ai.controller.js';

import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [ConfigModule, AuthModule],
  controllers: [AiController],
  providers: [MockAiProvider, GeminiAiProvider, AiService],
  exports: [AiService],
})
export class AiModule {}


