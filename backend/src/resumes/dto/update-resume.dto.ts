import {
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import type { ResumeContent } from '../entities/resume.types.js';

export class UpdateResumeDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  templateKey?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  locale?: string;

  @IsOptional()
  @IsObject()
  content?: ResumeContent;

  @IsOptional()
  @IsInt()
  @Min(1)
  expectedVersion?: number;
}
