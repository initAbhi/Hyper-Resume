import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { PaymentsService } from './payments.service.js';
import { CreateOrderDto } from './dto/create-order.dto.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { User } from '../users/entities/user.entity.js';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get('plans')
  getPlans() {
    return this.paymentsService.getPlans();
  }

  @Post('create-order')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createOrder(
    @CurrentUser() user: User,
    @Body() dto: CreateOrderDto,
  ) {
    return this.paymentsService.createOrder(user.id, dto);
  }

  @Post('verify')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async verifyPayment(
    @CurrentUser() user: User,
    @Body() body: { orderId: string; providerPaymentId?: string },
  ) {
    return this.paymentsService.verifyPayment(
      user.id,
      body.orderId,
      body.providerPaymentId,
    );
  }

  @Get('history')
  @UseGuards(JwtAuthGuard)
  async getPaymentHistory(@CurrentUser() user: User) {
    return this.paymentsService.getPaymentHistory(user.id);
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async webhook(
    @Req() req: Request & { rawBody?: Buffer },
    @Headers('webhook-signature') dodoSig?: string,
    @Headers('webhook-id') webhookId?: string,
    @Headers('webhook-timestamp') webhookTimestamp?: string,
    @Headers('x-razorpay-signature') razorpaySig?: string,
    @Headers('x-webhook-signature') genericSig?: string,
    @Body() body?: any,
  ) {
    const signature = dodoSig || razorpaySig || genericSig || '';
    const rawPayload = req.rawBody || JSON.stringify(body || {});
    const headers = {
      'webhook-id': webhookId,
      'webhook-timestamp': webhookTimestamp,
      'webhook-signature': dodoSig,
    };

    return this.paymentsService.processWebhook(
      rawPayload,
      signature,
      body || {},
      headers,
    );
  }
}
