import {
  IsBoolean,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import type { ResumeContent } from '../entities/resume.types.js';

export class CreateResumeDto {
  @IsString()
  @IsNotEmpty({ message: 'Resume name is required' })
  @MaxLength(200)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  templateKey?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  locale?: string;

  @IsOptional()
  @IsBoolean()
  isMaster?: boolean;

  @IsOptional()
  @IsObject()
  content?: ResumeContent;
}
