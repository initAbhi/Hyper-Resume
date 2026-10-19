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

export class CreateApplicationDto {
  @IsOptional()
  @IsString()
  @MaxLength(150)
  @Transform(({ value, obj }) => (value || obj.companyName || '')?.trim())
  company!: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  companyName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  @Transform(({ value, obj }) => (value || obj.jobTitle || '')?.trim())
  role!: string;

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
  @Transform(({ value, obj }) => value || obj.applicationUrl)
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

  @IsOptional()
  @IsUUID()
  jobDescriptionId?: string;
}

