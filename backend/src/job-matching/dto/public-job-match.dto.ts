import { IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class PublicJobMatchDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(25)
  @MaxLength(20000)
  resumeText!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(25)
  @MaxLength(20000)
  jobDescriptionText!: string;

  @IsString()
  @IsOptional()
  @MaxLength(160)
  targetRole?: string;
}

