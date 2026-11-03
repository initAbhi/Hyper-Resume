import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class GoogleAuthDto {
  @IsString()
  @IsNotEmpty({ message: 'Google credential / ID token is required' })
  credential!: string;

  @IsOptional()
  @IsString()
  targetRole?: string;

  @IsOptional()
  @IsString()
  targetGoal?: string;

  @IsOptional()
  @IsString()
  experienceLevel?: string;
}

