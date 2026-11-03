import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { AdminGuard } from './guards/admin.guard.js';
import { AdminService } from './admin.service.js';
import { DodoPaymentProvider } from '../payments/providers/dodo-payment.provider.js';

export class UpdatePaymentModeDto {
  @IsIn(['test_mode', 'live_mode'])
  @IsNotEmpty()
  mode!: 'test_mode' | 'live_mode';
}

export class TestCheckoutDto {
  @IsOptional()
  @IsString()
  planId?: string;
}

export class GrantCreditsDto {
  @IsNumber()
  @Min(1)
  amount!: number;

  @IsOptional()
  @IsString()
  reason?: string;
}

@ApiTags('admin')
@ApiBearerAuth('JWT')
@Controller('admin')
@UseGuards(AdminGuard)
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly dodoProvider: DodoPaymentProvider,
  ) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get administrative dashboard overview statistics' })
  async getStats() {
    return this.adminService.getStats();
  }

  @Get('analytics/overview')
  @ApiOperation({ summary: 'Get aggregated time-series analytics and traffic breakdown' })
  async getAnalytics() {
    return this.adminService.getAnalyticsOverview();
  }

  @Get('settings/payment')
  @ApiOperation({ summary: 'Get current payment gateway configuration and active mode' })
  async getPaymentSettings() {
    return this.adminService.getPaymentSettings();
  }

  @Patch('settings/payment')
  @ApiOperation({ summary: 'Toggle payment gateway mode between test_mode and live_mode' })
  async updatePaymentMode(@Body() dto: UpdatePaymentModeDto) {
    return this.adminService.updatePaymentMode(dto.mode);
  }

  @Get('users')
  @ApiOperation({ summary: 'List all registered users with credit balances and resume metrics' })
  async getUsers(
    @Query('search') search?: string,
    @Query('role') role?: string,
    @Query('limit') limit?: number,
  ) {
    return this.adminService.getUsers(search, role, limit ? Number(limit) : 50);
  }

  @Post('users/:userId/grant-credits')
  @ApiOperation({ summary: 'Manually award credits to a specific user' })
  async grantCredits(@Param('userId') userId: string, @Body() dto: GrantCreditsDto) {
    return this.adminService.grantUserCredits(userId, dto.amount, dto.reason);
  }

  @Get('payments')
  @ApiOperation({ summary: 'List and filter all payment transactions across test and live modes' })
  async getPayments(
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('mode') mode?: string,
    @Query('limit') limit?: number,
  ) {
    return this.adminService.getPayments(search, status, mode, limit ? Number(limit) : 50);
  }

  @Get('payments/recent')
  @ApiOperation({ summary: 'Backward-compatible recent payments alias' })
  async getRecentPayments(@Query('limit') limit?: number) {
    return this.adminService.getPayments(undefined, undefined, undefined, limit ? Number(limit) : 25);
  }

  @Get('resumes')
  @ApiOperation({ summary: 'List all resumes and variants created on platform' })
  async getResumes(@Query('search') search?: string, @Query('limit') limit?: number) {
    return this.adminService.getResumes(search, limit ? Number(limit) : 50);
  }

  @Get('credits/ledger')
  @ApiOperation({ summary: 'Audit trail of platform credit ledger operations' })
  async getCreditsAudit(@Query('limit') limit?: number) {
    return this.adminService.getCreditsAudit(limit ? Number(limit) : 50);
  }

  @Post('test-checkout')
  @ApiOperation({ summary: 'Generate a test checkout link using current mode for verification' })
  async testCheckout(@Body() body: TestCheckoutDto) {
    const planId = body?.planId || 'job_hunt_pack';
    const amountMinor = planId === 'job_hunt_pro' ? 89900 : 39900;
    const testOrderId = `ord_admin_verify_${Date.now()}`;

    const order = await this.dodoProvider.createOrder(testOrderId, amountMinor, 'INR', {
      planId,
      email: 'admin@hyperresume.ai',
      fullName: 'System Administrator (Test)',
      userId: 'admin-verification',
    });

    return {
      orderId: testOrderId,
      mode: this.dodoProvider.getMode(),
      checkoutUrl: order.checkoutUrl,
      providerOrderId: order.providerOrderId,
    };
  }
}
