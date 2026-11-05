import { User } from '../users/entities/user.entity.js';
import { UserSession } from '../auth/entities/user-session.entity.js';
import { PasswordResetToken } from '../auth/entities/password-reset-token.entity.js';
import { CandidateProfile } from '../profiles/entities/candidate-profile.entity.js';
import { Resume } from '../resumes/entities/resume.entity.js';
import { ResumeVersion } from '../resumes/entities/resume-version.entity.js';
import { ResumeAnalysis } from '../resumes/entities/resume-analysis.entity.js';
import { ResumeAdaptation } from '../resumes/entities/resume-adaptation.entity.js';
import { JobDescription } from '../jobs/entities/job-description.entity.js';
import { JobMatch } from '../job-matching/entities/job-match.entity.js';
import { Template } from '../templates/entities/template.entity.js';
import { JobApplication } from '../applications/entities/job-application.entity.js';
import { CreditLedger } from '../credits/entities/credit-ledger.entity.js';
import { Payment } from '../payments/entities/payment.entity.js';
import { SystemSetting } from '../admin/entities/system-setting.entity.js';
import { InterviewSession } from '../interviews/entities/interview-session.entity.js';
import { InterviewQuestion } from '../interviews/entities/interview-question.entity.js';
import { InterviewTurn } from '../interviews/entities/interview-turn.entity.js';

export const ALL_ENTITIES = [
  User,
  UserSession,
  PasswordResetToken,
  CandidateProfile,
  Resume,
  ResumeVersion,
  ResumeAnalysis,
  ResumeAdaptation,
  JobDescription,
  JobMatch,
  Template,
  JobApplication,
  CreditLedger,
  Payment,
  SystemSetting,
  InterviewSession,
  InterviewQuestion,
  InterviewTurn,
];
