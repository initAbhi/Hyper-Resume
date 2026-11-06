import {
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import type { ResumeContent } from '../entities/resume.types.js';

export class AdaptResumeDto {
  @IsUUID('4', { message: 'sourceResumeId must be a valid UUID v4' })
  @IsNotEmpty({ message: 'sourceResumeId is required' })
  sourceResumeId!: string;

  @IsString()
  @IsNotEmpty({ message: 'sampleId is required' })
  @MaxLength(100)
  sampleId!: string;

  @IsUUID('4', { message: 'idempotencyKey must be a valid client-generated UUID v4' })
  @IsNotEmpty({ message: 'idempotencyKey is required' })
  idempotencyKey!: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  targetRole?: string;

  @IsOptional()
  @IsObject()
  sampleBenchmarkData?: ResumeContent;
}

