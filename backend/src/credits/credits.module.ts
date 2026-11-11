import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreditLedger } from './entities/credit-ledger.entity.js';
import { User } from '../users/entities/user.entity.js';
import { CreditsService } from './credits.service.js';
import { CreditsController } from './credits.controller.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [TypeOrmModule.forFeature([CreditLedger, User]), AuthModule],
  controllers: [CreditsController],
  providers: [CreditsService],
  exports: [CreditsService],
})
export class CreditsModule {}
