import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateJobDescriptionDto {
  @IsString()
  @IsNotEmpty({ message: 'Job title is required' })
  @MaxLength(200)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  companyName?: string;

  @IsString()
  @IsNotEmpty({ message: 'Job description text is required' })
  originalText!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  sourceUrl?: string;
}
