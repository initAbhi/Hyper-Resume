import {
  IsBoolean,
  IsIn,
  IsISO8601,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateResumeShareDto {
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @IsOptional()
  @MinLength(4)
  @MaxLength(80)
  @Matches(/^[a-z0-9][a-z0-9-]*[a-z0-9]$/, {
    message:
      'Share slug must be lowercase alphanumeric words separated by hyphens (4-80 chars).',
  })
  slug?: string;

  @IsBoolean()
  @IsOptional()
  allowPdfDownload?: boolean;

  @IsBoolean()
  @IsOptional()
  allowDocxDownload?: boolean;

  @IsBoolean()
  @IsOptional()
  hideContactDetails?: boolean;

  @IsString()
  @IsOptional()
  @MaxLength(280)
  recruiterNote?: string | null;

  @IsOptional()
  @IsISO8601({ strict: true })
  expiresAt?: string | null;
}

export class RecordShareEventDto {
  @IsIn(['view', 'download_pdf', 'download_docx', 'print', 'contact_click'])
  eventType!: 'view' | 'download_pdf' | 'download_docx' | 'print' | 'contact_click';
}

