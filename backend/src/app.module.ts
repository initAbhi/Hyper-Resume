import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { validate } from './config/env.validation.js';
import { getTypeOrmConfig } from './database/typeorm.config.js';
import { CorrelationIdMiddleware } from './common/middleware/correlation-id.middleware.js';
import { AppLoggerService } from './common/logger/app-logger.service.js';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter.js';
import { TransformResponseInterceptor } from './common/interceptors/transform-response.interceptor.js';
import { HealthModule } from './health/health.module.js';
import { UsersModule } from './users/users.module.js';
import { AuthModule } from './auth/auth.module.js';
import { ProfilesModule } from './profiles/profiles.module.js';
import { ResumesModule } from './resumes/resumes.module.js';
import { JobsModule } from './jobs/jobs.module.js';
import { JobMatchingModule } from './job-matching/job-matching.module.js';
import { AiModule } from './ai/ai.module.js';
import { ResumeParsingModule } from './resume-parsing/resume-parsing.module.js';
import { ApplicationsModule } from './applications/applications.module.js';
import { CreditsModule } from './credits/credits.module.js';
import { PaymentsModule } from './payments/payments.module.js';
import { TemplatesModule } from './templates/templates.module.js';
import { EmailModule } from './email/email.module.js';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate,
      envFilePath: ['.env', '.env.local'],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: getTypeOrmConfig,
    }),
    HealthModule,
    UsersModule,
    AuthModule,
    ProfilesModule,
    ResumesModule,
    JobsModule,
    JobMatchingModule,
    AiModule,
    ResumeParsingModule,
    ApplicationsModule,
    CreditsModule,
    PaymentsModule,
    TemplatesModule,
    EmailModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    AppLoggerService,
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformResponseInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationIdMiddleware).forRoutes('*');
  }
}
