import {
  IsDateString,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';
import type { ApplicationStatus } from '../entities/job-application.entity.js';

export class UpdateApplicationDto {
  @IsOptional()
  @IsString()
  @MaxLength(150)
  @Transform(({ value, obj }) => (value !== undefined ? value : obj?.companyName)?.trim?.())
  company?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  companyName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  @Transform(({ value, obj }) => (value !== undefined ? value : obj?.jobTitle)?.trim?.())
  role?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  jobTitle?: string;

  @IsOptional()
  @IsUUID()
  resumeVersionId?: string;

  @IsOptional()
  @IsUUID()
  resumeId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  @Transform(({ value, obj }) => (value !== undefined ? value : obj?.applicationUrl)?.trim?.())
  jobUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  applicationUrl?: string;

  @IsOptional()
  @IsIn([
    'bookmarked',
    'applying',
    'applied',
    'interviewing',
    'negotiating',
    'offer',
    'accepted',
    'withdrawn',
    'rejected',
    'ghosted',
    'archived',
    'draft',
  ])
  status?: ApplicationStatus;

  @IsOptional()
  @IsDateString()
  appliedDate?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

