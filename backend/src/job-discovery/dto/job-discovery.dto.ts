import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class SearchDiscoveredJobsDto {
  @IsOptional()
  @IsString()
  @MaxLength(150)
  q?: string;

  @IsOptional()
  @IsIn(['all', 'greenhouse', 'ashby', 'lever', 'remotive', 'arbeitnow'])
  source?: 'all' | 'greenhouse' | 'ashby' | 'lever' | 'remotive' | 'arbeitnow';

  @IsOptional()
  @IsIn(['all', 'remote', 'hybrid', 'onsite'])
  workplace?: 'all' | 'remote' | 'hybrid' | 'onsite';

  @IsOptional()
  @IsString()
  @MaxLength(64)
  boardToken?: string;

  @IsOptional()
  @IsIn(['greenhouse', 'ashby', 'lever'])
  boardProvider?: 'greenhouse' | 'ashby' | 'lever';

  @IsOptional()
  @IsUUID()
  resumeId?: string;

  @IsOptional()
  @IsIn(['match', 'recent'])
  sort?: 'match' | 'recent';

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  refresh?: boolean;
}

export class SaveDiscoveredJobDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(180)
  title!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  company!: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  location?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  applyUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  source?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(15000)
  descriptionText!: string;

  @IsOptional()
  @IsUUID()
  resumeId?: string;
}

export class RunDiscoveredMatchDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(180)
  title!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  company!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  applyUrl?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(15000)
  descriptionText!: string;

  @IsUUID()
  resumeId!: string;
}

