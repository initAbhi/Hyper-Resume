import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApplicationsService } from './applications.service.js';
import { CreateApplicationDto } from './dto/create-application.dto.js';
import { UpdateApplicationDto } from './dto/update-application.dto.js';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { User } from '../users/entities/user.entity.js';

@Controller('applications')
@UseGuards(JwtAuthGuard)
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  private mapApplication(app: any) {
    if (!app) return app;
    return {
      ...app,
      companyName: app.company,
      jobTitle: app.role,
      resumeId: app.resumeVersionId,
      applicationUrl: app.jobUrl,
    };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() user: User,
    @Body() dto: CreateApplicationDto,
  ) {
    const created = await this.applicationsService.createApplication(user.id, dto);
    return this.mapApplication(created);
  }

  @Get()
  async list(
    @CurrentUser() user: User,
    @Query() pagination: PaginationQueryDto,
  ) {
    const result = await this.applicationsService.listApplications(user.id, pagination);
    return {
      ...result,
      items: (result.items || []).map((app) => this.mapApplication(app)),
    };
  }

  @Get(':id')
  async getOne(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ) {
    const app = await this.applicationsService.getApplication(user.id, id);
    return this.mapApplication(app);
  }

  @Patch(':id')
  async update(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: UpdateApplicationDto,
  ) {
    const updated = await this.applicationsService.updateApplication(user.id, id, dto);
    return this.mapApplication(updated);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async delete(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ) {
    return this.applicationsService.deleteApplication(user.id, id);
  }
}
