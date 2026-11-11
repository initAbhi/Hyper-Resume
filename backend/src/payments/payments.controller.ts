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
import { PaymentsService, RequestMetaContext } from './payments.service.js';
import { CreateOrderDto } from './dto/create-order.dto.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { User } from '../users/entities/user.entity.js';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  private extractRequestContext(req: Request): RequestMetaContext {
    const xff = req.headers['x-forwarded-for'];
    const clientIp =
      (Array.isArray(xff) ? xff[0] : xff)?.split(',')[0]?.trim() ||
      (typeof req.ip === 'string' ? req.ip : undefined);
    const clientUserAgent =
      typeof req.headers['user-agent'] === 'string' ? req.headers['user-agent'] : undefined;
    const sourceUrl =
      typeof req.headers['referer'] === 'string'
        ? req.headers['referer']
        : typeof req.headers['origin'] === 'string'
        ? `${req.headers['origin']}/pricing`
        : undefined;

    return { clientIp, clientUserAgent, sourceUrl };
  }

  @Get('plans')
  getPlans() {
    return this.paymentsService.getPlans();
  }

  @Get('promo-status')
  getPromoStatus() {
    return this.paymentsService.getPromoStatus();
  }

  @Post('create-order')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createOrder(
    @CurrentUser() user: User,
    @Body() dto: CreateOrderDto,
    @Req() req: Request,
  ) {
    return this.paymentsService.createOrder(
      user.id,
      dto,
      this.extractRequestContext(req),
    );
  }

  @Post('verify')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async verifyPayment(
    @CurrentUser() user: User,
    @Body() body: { orderId: string; providerPaymentId?: string },
    @Req() req: Request,
  ) {
    return this.paymentsService.verifyPayment(
      user.id,
      body.orderId,
      body.providerPaymentId,
      this.extractRequestContext(req),
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
