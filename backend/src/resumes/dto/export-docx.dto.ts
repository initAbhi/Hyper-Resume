import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class ExportDocxDto {
  @IsIn(['A4', 'US Letter'])
  @IsOptional()
  pageSize?: 'A4' | 'US Letter';

  @IsString()
  @IsOptional()
  @MaxLength(160)
  fileName?: string;
}

