import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class AdaptSectionDto {
  @IsUUID('4', { message: 'sourceResumeId must be a valid UUID v4' })
  @IsNotEmpty({ message: 'sourceResumeId is required' })
  sourceResumeId!: string;

  @IsString()
  @IsIn(['summary', 'experience', 'skills', 'projects'], {
    message: 'sectionKey must be one of: summary, experience, skills, projects',
  })
  sectionKey!: 'summary' | 'experience' | 'skills' | 'projects';

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
  sourceSectionData?: any;

  @IsOptional()
  benchmarkSectionData?: any;
}

