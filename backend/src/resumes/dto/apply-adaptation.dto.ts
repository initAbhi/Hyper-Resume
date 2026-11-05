import {
  IsArray,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import type { ResumeContent } from '../entities/resume.types.js';

export class ApplyAdaptationDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  summaryDecision?: 'accept' | 'reject';

  @IsOptional()
  @IsObject()
  bulletDecisions?: Record<string, Record<string, 'accept' | 'reject'>>;

  @IsOptional()
  @IsArray()
  acceptedBenchmarkSkills?: string[];

  @IsOptional()
  @IsObject()
  projectDecisions?: Record<string, 'accept' | 'reject'>;

  @IsOptional()
  @IsObject()
  customFinalContent?: ResumeContent;
}

