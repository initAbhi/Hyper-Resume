import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';

export class TailoredBulletUpdateDto {
  @IsOptional()
  @IsString()
  @MaxLength(160)
  company?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(800)
  originalBullet!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(800)
  tailoredBullet!: string;
}

export class CreateTailoredResumeDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(250)
  applyHeadline?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2500)
  applySummary?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TailoredBulletUpdateDto)
  @ArrayMaxSize(25)
  bulletUpdates?: TailoredBulletUpdateDto[];
}
