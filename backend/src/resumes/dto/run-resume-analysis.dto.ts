import { IsIn, IsOptional } from 'class-validator';

export class RunResumeAnalysisDto {
  @IsOptional()
  @IsIn(['ats_check', 'comprehensive_audit', 'ats_audit'])
  analysisType: 'ats_check' | 'comprehensive_audit' | 'ats_audit' = 'ats_check';
}
