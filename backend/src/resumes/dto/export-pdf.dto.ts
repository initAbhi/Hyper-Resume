import { IsIn, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class ExportPdfDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(3_000_000)
  html!: string;

  @IsString()
  @IsOptional()
  @MaxLength(3_000_000)
  styles?: string;

  @IsOptional()
  @IsIn(['A4', 'US Letter'])
  pageSize?: 'A4' | 'US Letter' = 'A4';

  @IsString()
  @IsOptional()
  @MaxLength(200)
  fileName?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  htmlClassName?: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  rootStyle?: string;
}

