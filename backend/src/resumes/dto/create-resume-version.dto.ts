import { IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateResumeVersionDto {
  @IsString()
  @IsNotEmpty({ message: 'Change summary is required' })
  @MaxLength(255)
  changeSummary!: string;

  @IsOptional()
  @IsUUID()
  jobMatchId?: string;
}
