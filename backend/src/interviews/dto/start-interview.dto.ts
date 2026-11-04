import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import type {
  InterviewDifficulty,
  InterviewSessionMode,
} from '../entities/interview-session.entity.js';

export class StartInterviewDto {
  @IsUUID()
  @IsNotEmpty()
  resumeId!: string;

  @IsUUID()
  @IsOptional()
  jobDescriptionId?: string;

  @IsEnum(['quick_practice', 'full_mock', 'weak_area'])
  @IsNotEmpty()
  sessionMode!: InterviewSessionMode;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  targetRole!: string;

  @IsEnum(['junior', 'mid', 'senior'])
  @IsOptional()
  difficulty?: InterviewDifficulty;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  idempotencyKey?: string;
}

