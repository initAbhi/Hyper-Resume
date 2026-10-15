import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateJobMatchDto {
  @IsUUID()
  @IsNotEmpty({ message: 'Resume ID is required' })
  resumeId!: string;

  @IsUUID()
  @IsNotEmpty({ message: 'Job Description ID is required' })
  jobDescriptionId!: string;
}
