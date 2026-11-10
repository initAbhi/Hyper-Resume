import {
  ArrayMaxSize,
  IsArray,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import type {
  CoverLetterTemplateKey,
  CoverLetterTone,
} from '../entities/cover-letter.entity.js';
import type { CoverLetterSectionFocus } from '../../ai/interfaces/ai-provider.interface.js';

export class GenerateCoverLetterDto {
  @IsUUID()
  resumeId!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(180)
  targetRole!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(180)
  companyName!: string;

  @IsString()
  @IsOptional()
  @MaxLength(140)
  hiringManager?: string;

  @IsString()
  @IsOptional()
  @MaxLength(15000)
  jobDescription?: string;

  @IsUUID()
  @IsOptional()
  jobMatchId?: string;

  @IsIn(['Executive', 'Enthusiastic', 'Technical', 'Concise'])
  @IsOptional()
  tone?: CoverLetterTone;

  @IsIn(['executive', 'modern', 'classic'])
  @IsOptional()
  templateKey?: CoverLetterTemplateKey;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  accentColor?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  customFocus?: string;
}

export class RegenerateCoverLetterDto {
  @IsIn(['Executive', 'Enthusiastic', 'Technical', 'Concise'])
  @IsOptional()
  tone?: CoverLetterTone;

  @IsIn(['all', 'opening', 'body', 'closing'])
  @IsOptional()
  sectionFocus?: CoverLetterSectionFocus;

  @IsString()
  @IsOptional()
  @MaxLength(15000)
  jobDescription?: string;

  @IsString()
  @IsOptional()
  @MaxLength(140)
  hiringManager?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  customFocus?: string;
}

export class UpdateCoverLetterDto {
  @IsString()
  @IsOptional()
  @MaxLength(200)
  title?: string;

  @IsString()
  @IsOptional()
  @MaxLength(180)
  targetRole?: string;

  @IsString()
  @IsOptional()
  @MaxLength(180)
  companyName?: string;

  @IsString()
  @IsOptional()
  @MaxLength(140)
  hiringManager?: string;

  @IsIn(['Executive', 'Enthusiastic', 'Technical', 'Concise'])
  @IsOptional()
  tone?: CoverLetterTone;

  @IsIn(['executive', 'modern', 'classic'])
  @IsOptional()
  templateKey?: CoverLetterTemplateKey;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  accentColor?: string;

  @IsString()
  @IsOptional()
  @MaxLength(150)
  senderName?: string;

  @IsString()
  @IsOptional()
  @MaxLength(150)
  senderEmail?: string;

  @IsString()
  @IsOptional()
  @MaxLength(80)
  senderPhone?: string;

  @IsString()
  @IsOptional()
  @MaxLength(150)
  senderLocation?: string;

  @IsString()
  @IsOptional()
  @MaxLength(220)
  recipientLine?: string;

  @IsString()
  @IsOptional()
  @MaxLength(150)
  salutation?: string;

  @IsString()
  @IsOptional()
  @MaxLength(5000)
  openingParagraph?: string;

  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(6)
  @IsOptional()
  bodyParagraphs?: string[];

  @IsString()
  @IsOptional()
  @MaxLength(3000)
  closingParagraph?: string;

  @IsString()
  @IsOptional()
  @MaxLength(120)
  signOff?: string;
}
