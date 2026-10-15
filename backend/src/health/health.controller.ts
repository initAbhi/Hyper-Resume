import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { HealthService } from './health.service.js';
import type { LivenessStatus, ReadinessStatus } from './health.service.js';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get('live')
  @ApiOperation({ summary: 'Liveness check' })
  @ApiResponse({ status: 200, description: 'Application is running' })
  checkLiveness(): LivenessStatus {
    return this.healthService.checkLiveness();
  }

  @Get('ready')
  @ApiOperation({ summary: 'Readiness check' })
  @ApiResponse({ status: 200, description: 'Application and dependencies are ready' })
  @ApiResponse({ status: 503, description: 'Dependencies are unavailable' })
  async checkReadiness(): Promise<ReadinessStatus> {
    return await this.healthService.checkReadiness();
  }

  @Get()
  @ApiOperation({ summary: 'Combined health status' })
  async checkAll() {
    const live = this.healthService.checkLiveness();
    const ready = await this.healthService.checkReadiness();
    return {
      status: 'ok',
      live,
      ready,
    };
  }
}
