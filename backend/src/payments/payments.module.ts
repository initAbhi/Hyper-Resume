import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity.js';
import { User } from '../users/entities/user.entity.js';
import { PaymentsService } from './payments.service.js';
import { PaymentsController } from './payments.controller.js';
import { CreditsModule } from '../credits/credits.module.js';
import { AuthModule } from '../auth/auth.module.js';
import { SandboxPaymentProvider } from './providers/sandbox-payment.provider.js';
import { RazorpayPaymentProvider } from './providers/razorpay-payment.provider.js';

@Module({
  imports: [TypeOrmModule.forFeature([Payment, User]), CreditsModule, AuthModule],
  controllers: [PaymentsController],
  providers: [PaymentsService, SandboxPaymentProvider, RazorpayPaymentProvider],
  exports: [PaymentsService],
})
export class PaymentsModule {}
