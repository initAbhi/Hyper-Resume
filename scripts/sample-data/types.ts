export interface ResumeExperience {
  company: string;
  title: string;
  location: string;
  startDate: string;
  endDate: string;
  current?: boolean;
  bullets: string[];
}

export interface ResumeEducation {
  school: string;
  degree: string;
  field?: string;
  graduationDate: string;
  gpa?: string;
  honors?: string;
}

export interface ResumeSkillCategory {
  category: string;
  skills: string[];
}

export interface ResumeProject {
  name: string;
  description: string;
  highlights: string[];
  url?: string;
  techStack?: string[];
}

export type SampleCategory =
  | 'SOFTWARE_ENGINEERING'
  | 'DATA_AI'
  | 'DEVOPS_CLOUD'
  | 'PRODUCT_BUSINESS'
  | 'DESIGN_UX'
  | 'MARKETING_SEO'
  | 'FINANCE_BANKING'
  | 'HEALTHCARE'
  | 'LEGAL'
  | 'SALES_HR'
  | 'CORE_ENGINEERING'
  | 'STUDENT_FRESHER'
  // Backward compatibility
  | 'PROGRAMMING'
  | 'ENGINEERING'
  | 'BUSINESS'
  | 'FINANCE'
  | 'DESIGN'
  | 'STUDENT'
  | 'MARKETING'
  | 'OTHER';

export type ExperienceLevel =
  | 'STUDENT_INTERN'
  | 'ENTRY_LEVEL'
  | 'MID_LEVEL'
  | 'SENIOR_LEVEL'
  | 'STAFF_LEAD'
  | 'EXECUTIVE';

export type ResumeStyle =
  | 'ATS Classic'
  | 'Modern Technical'
  | 'Executive Clean'
  | 'Compact Single-Column';

export interface SampleResume {
  id: string;
  company: string;
  companyKey: string;
  brandColor: string;
  brandTextColor: string;
  role: string;
  category: SampleCategory;
  badge: string;
  atsScore: number;
  experienceLevel: ExperienceLevel;
  experienceLevelLabel: string;
  country: string;
  resumeStyle: ResumeStyle;
  isIllustrative: boolean;
  candidate: {
    name: string;
    title: string;
    location: string;
    email: string;
    phone: string;
    linkedin: string;
    github?: string;
    portfolio?: string;
  };
  summary: string;
  skills: ResumeSkillCategory[];
  experience: ResumeExperience[];
  education: ResumeEducation[];
  projects?: ResumeProject[];
  certifications?: string[];
}
