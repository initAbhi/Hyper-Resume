import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MockAiProvider } from './providers/mock-ai.provider.js';
import { GeminiAiProvider } from './providers/gemini-ai.provider.js';
import { GeminiInterviewProvider } from './providers/gemini-interview.provider.js';
import { GeminiContextCacheService } from './services/gemini-context-cache.service.js';
import { AiModelRouterService } from './services/ai-model-router.service.js';
import { AiService } from './ai.service.js';
import { AiController } from './ai.controller.js';
import { AuthModule } from '../auth/auth.module.js';
import { CreditsModule } from '../credits/credits.module.js';

@Module({
  imports: [ConfigModule, AuthModule, CreditsModule],
  controllers: [AiController],
  providers: [
    MockAiProvider,
    GeminiAiProvider,
    GeminiInterviewProvider,
    GeminiContextCacheService,
    AiModelRouterService,
    AiService,
  ],
  exports: [
    AiService,
    GeminiInterviewProvider,
    GeminiAiProvider,
    GeminiContextCacheService,
    AiModelRouterService,
  ],
})
export class AiModule { }
