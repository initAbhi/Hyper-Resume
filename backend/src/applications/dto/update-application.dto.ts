import {
  IsDateString,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import type { ApplicationStatus } from '../entities/job-application.entity.js';

export class UpdateApplicationDto {
  @IsOptional()
  @IsString()
  @MaxLength(150)
  company?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  role?: string;

  @IsOptional()
  @IsUUID()
  resumeVersionId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  jobUrl?: string;

  @IsOptional()
  @IsIn(['draft', 'applied', 'interviewing', 'offer', 'rejected', 'archived'])
  status?: ApplicationStatus;

  @IsOptional()
  @IsDateString()
  appliedDate?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
