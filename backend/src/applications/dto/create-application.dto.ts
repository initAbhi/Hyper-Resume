import {
  IsDateString,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import type { ApplicationStatus } from '../entities/job-application.entity.js';

export class CreateApplicationDto {
  @IsString()
  @IsNotEmpty({ message: 'Company name is required' })
  @MaxLength(150)
  company!: string;

  @IsString()
  @IsNotEmpty({ message: 'Role title is required' })
  @MaxLength(150)
  role!: string;

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
