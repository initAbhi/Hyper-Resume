import { Type } from 'class-transformer';
import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateNested,
} from 'class-validator';

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
