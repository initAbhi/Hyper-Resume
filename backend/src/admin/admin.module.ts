import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SystemSetting } from './entities/system-setting.entity.js';
import { User } from '../users/entities/user.entity.js';
import { Payment } from '../payments/entities/payment.entity.js';
import { Resume } from '../resumes/entities/resume.entity.js';
import { CreditLedger } from '../credits/entities/credit-ledger.entity.js';
import { AnalyticsEvent } from '../analytics/analytics-event.entity.js';
import { AdminService } from './admin.service.js';
import { AdminController } from './admin.controller.js';
import { AdminGuard } from './guards/admin.guard.js';
import { AuthModule } from '../auth/auth.module.js';
import { PaymentsModule } from '../payments/payments.module.js';
import { CreditsModule } from '../credits/credits.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SystemSetting,
      User,
      Payment,
      Resume,
      CreditLedger,
      AnalyticsEvent,
    ]),
    AuthModule,
    PaymentsModule,
    CreditsModule,
  ],
  controllers: [AdminController],
  providers: [AdminService, AdminGuard],
  exports: [AdminService],
})
export class AdminModule {}
