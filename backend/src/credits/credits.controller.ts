import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { CreditsService } from './credits.service.js';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { User } from '../users/entities/user.entity.js';

@Controller('credits')
@UseGuards(JwtAuthGuard)
export class CreditsController {
  constructor(private readonly creditsService: CreditsService) {}

  @Get('balance')
  async getBalance(@CurrentUser() user: User) {
    return this.creditsService.getEntitlementStatus(user.id);
  }

  @Get('history')
  async getHistory(
    @CurrentUser() user: User,
    @Query() pagination: PaginationQueryDto,
  ) {
    return this.creditsService.getTransactionHistory(user.id, pagination);
  }
}
