import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateNested,
} from 'class-validator';

export class PinnedAgentTargetDto {
  @IsIn(['section', 'bullet', 'job', 'resume'])
  kind!: 'section' | 'bullet' | 'job' | 'resume';

  @IsOptional()
  @IsString()
  @MaxLength(200)
  id?: string;

  @IsString()
  @MaxLength(255)
  label!: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  sectionKey?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  fieldPath?: string;

  @IsOptional()
  @IsString()
  @MaxLength(600)
  excerpt?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  resumeId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  jobId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  jobTitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  companyName?: string;
}

export class AgentMessageContextDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  route?: string;

  @IsOptional()
  @IsUUID()
  activeResumeId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  activeResumeName?: string;

  @IsOptional()
  @IsBoolean()
  resumeDetached?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  activeJobId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  jobTitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  companyName?: string;

  @IsOptional()
  @IsUUID()
  jobDescriptionId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20000)
  jobDescriptionText?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  applyUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  location?: string;

  @IsOptional()
  @IsIn(['Remote', 'Hybrid', 'Onsite'])
  workplace?: 'Remote' | 'Hybrid' | 'Onsite';

  @IsOptional()
  @IsUUID()
  activeApplicationId?: string;

  @IsOptional()
  @IsUUID()
  activeInterviewSessionId?: string;

  @IsOptional()
  @IsIn(['Executive', 'Enthusiastic', 'Technical', 'Concise'])
  tone?: 'Executive' | 'Enthusiastic' | 'Technical' | 'Concise';

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(12)
  @IsString({ each: true })
  @MaxLength(64, { each: true })
  focusSections?: string[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(12)
  @ValidateNested({ each: true })
  @Type(() => PinnedAgentTargetDto)
  pinnedTargets?: PinnedAgentTargetDto[];
}

export class CreateConversationDto {
  @IsOptional()
  @IsUUID()
  activeResumeId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;
}

export class CreateAgentMessageDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(10000)
  content!: string;

  @IsOptional()
  @IsUUID()
  activeResumeId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  idempotencyKey?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => AgentMessageContextDto)
  context?: AgentMessageContextDto;
}
