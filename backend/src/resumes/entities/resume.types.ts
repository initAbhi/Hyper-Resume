export type BuiltInSectionKey =
  | 'summary'
  | 'experience'
  | 'projects'
  | 'skills'
  | 'education'
  | 'certifications';

export type ResumeSectionKey = BuiltInSectionKey | `custom:${string}`;

export type CustomSectionKind =
  | 'publications'
  | 'awards'
  | 'volunteer'
  | 'languages'
  | 'custom';

export interface CustomSectionEntry {
  id: string;
  heading: string;
  subtitle?: string;
  dateRange?: string;
  locationOrLink?: string;
  bullets: string[];
}

export interface CustomResumeSection {
  id: string;
  title: string;
  kind: CustomSectionKind;
  entries: CustomSectionEntry[];
}

export interface ResumeLayoutSettings {
  sectionOrder?: ResumeSectionKey[];
  hiddenSections?: ResumeSectionKey[];
  fontSizeScale?: number;
  lineHeight?: number;
  sectionSpacing?: number;
  pageMargin?: number;
  accentColor?: string;
  fontFamily?: 'sans' | 'serif' | 'mono';
}

export interface ResumeContentMeta {
  targetRole?: string;
  targetCompany?: string;
  tailoredFromMatchId?: string;
  tailoredFromResumeId?: string;
}

export interface ResumeContent {
  meta?: ResumeContentMeta;
  layout?: ResumeLayoutSettings;
  contact: {
    fullName: string;
    email: string;
    phone?: string;
    location?: string;
    linkedinUrl?: string;
    githubUrl?: string;
    websiteUrl?: string;
    photoUrl?: string;
  };
  headline: string;
  summary: string;
  skills: Array<{ name: string; category?: string }>;
  experience: Array<{
    id?: string;
    company: string;
    title: string;
    location?: string;
    startDate: string;
    endDate?: string;
    current: boolean;
    bullets: string[];
  }>;
  education: Array<{
    id?: string;
    school: string;
    degree: string;
    field: string;
    graduationDate?: string;
  }>;
  projects?: Array<{
    id?: string;
    name: string;
    description: string;
    highlights: string[];
    url?: string;
  }>;
  certifications?: Array<{
    id?: string;
    name: string;
    issuer: string;
    issueDate?: string;
  }>;
  customSections?: CustomResumeSection[];
}
