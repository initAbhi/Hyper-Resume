import { User } from '../users/entities/user.entity.js';
import { UserSession } from '../auth/entities/user-session.entity.js';
import { CandidateProfile } from '../profiles/entities/candidate-profile.entity.js';
import { Resume } from '../resumes/entities/resume.entity.js';
import { ResumeVersion } from '../resumes/entities/resume-version.entity.js';
import { ResumeAnalysis } from '../resumes/entities/resume-analysis.entity.js';
import { JobDescription } from '../jobs/entities/job-description.entity.js';
import { JobMatch } from '../job-matching/entities/job-match.entity.js';
import { Template } from '../templates/entities/template.entity.js';
import { JobApplication } from '../applications/entities/job-application.entity.js';
import { CreditLedger } from '../credits/entities/credit-ledger.entity.js';
import { Payment } from '../payments/entities/payment.entity.js';

export const ALL_ENTITIES = [
  User,
  UserSession,
  CandidateProfile,
  Resume,
  ResumeVersion,
  ResumeAnalysis,
  JobDescription,
  JobMatch,
  Template,
  JobApplication,
  CreditLedger,
  Payment,
];
