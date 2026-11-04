import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from '../users/entities/user.entity.js';
import { UserSession } from './entities/user-session.entity.js';
import { PasswordResetToken } from './entities/password-reset-token.entity.js';
import { CandidateProfile } from '../profiles/entities/candidate-profile.entity.js';
import { CreditLedger } from '../credits/entities/credit-ledger.entity.js';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserSession, PasswordResetToken, CandidateProfile, CreditLedger]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const expiresIn =
          config.get<string>('JWT_ACCESS_EXPIRES_IN') ||
          config.get<string>('JWT_EXPIRATION') ||
          '7d';
        return {
          secret: config.get<string>(
            'JWT_SECRET',
            'dev-hyper-resume-secret-key-min-32-chars-long',
          ),
          signOptions: { expiresIn: expiresIn as any },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard],
  exports: [AuthService, JwtAuthGuard, JwtModule, TypeOrmModule],
})
export class AuthModule {}
