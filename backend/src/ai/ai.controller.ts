import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { AiService } from './ai.service.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';

export class BulletImproveDto {
  @IsString()
  @IsNotEmpty()
  bulletText!: string;

  @IsString()
  @IsOptional()
  targetRole?: string;

  @IsString()
  @IsOptional()
  metricHint?: string;
}

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('bullet-improve')
  @HttpCode(HttpStatus.OK)
  async improveBullet(@Body() dto: BulletImproveDto) {
    const result = await this.aiService.rewriteBullet(
      dto.bulletText,
      dto.targetRole,
      dto.metricHint,
    );

    return {
      improvedBullet: result.rewrittenBullet,
      originalBullet: result.originalBullet,
      framework: result.framework,
      actionVerbUsed: result.actionVerbUsed,
      explanation: result.explanation,
      factualVerificationNotes: result.factualVerificationNotes,
    };
  }
}
