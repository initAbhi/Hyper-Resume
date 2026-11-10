import {
  IsArray,
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import type { LinkedInOptimizeTone } from '../../ai/interfaces/ai-provider.interface.js';

export class OptimizeLinkedInDto {
  @IsUUID()
  @IsOptional()
  resumeId?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(180)
  targetRole!: string;

  @IsString()
  @IsOptional()
  @MaxLength(150)
  industry?: string;

  @IsIn(['Executive', 'Impact & Metrics', 'Storytelling', 'Technical SEO'])
  @IsOptional()
  tone?: LinkedInOptimizeTone;

  @IsString()
  @IsOptional()
  @MaxLength(3500)
  targetJobDescription?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  linkedinUrl?: string;

  @IsString()
  @IsOptional()
  @MaxLength(300)
  customHeadline?: string;

  @IsString()
  @IsOptional()
  @MaxLength(3500)
  customAbout?: string;

  @IsBoolean()
  @IsOptional()
  saveAudit?: boolean;
}

export class ApplyLinkedInAuditDto {
  @IsString()
  @IsOptional()
  @MaxLength(220)
  appliedHeadline?: string;

  @IsString()
  @IsOptional()
  @MaxLength(2600)
  appliedAbout?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  appliedSkills?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  checkedChecklistIds?: string[];

  @IsBoolean()
  @IsOptional()
  syncToResume?: boolean;

  @IsBoolean()
  @IsOptional()
  syncToProfile?: boolean;
}

