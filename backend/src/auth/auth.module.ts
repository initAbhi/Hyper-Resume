import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from '../users/entities/user.entity.js';
import { UserSession } from './entities/user-session.entity.js';
import { CandidateProfile } from '../profiles/entities/candidate-profile.entity.js';
import { CreditLedger } from '../credits/entities/credit-ledger.entity.js';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserSession, CandidateProfile, CreditLedger]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>(
          'JWT_SECRET',
          'dev-hyper-resume-secret-key-min-32-chars-long',
        ),
        signOptions: { expiresIn: '1h' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard],
  exports: [AuthService, JwtAuthGuard, JwtModule, TypeOrmModule],
})
export class AuthModule {}
