import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class RunResumeAnalysisDto {
  @IsOptional()
  @IsIn(['ats_check', 'comprehensive_audit', 'ats_audit'])
  analysisType: 'ats_check' | 'comprehensive_audit' | 'ats_audit' = 'ats_check';

  @IsOptional()
  @IsString()
  @MaxLength(300)
  targetRole?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20000)
  jobDescriptionText?: string;
}
