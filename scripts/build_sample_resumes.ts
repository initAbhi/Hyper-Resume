import * as fs from 'fs';
import * as path from 'path';
import type { SampleResume, SampleCategory, ExperienceLevel, ResumeStyle } from './sample-data/types';
import { ADDITIONAL_54_SAMPLES as PART1 } from './sample-data/additional-samples-part1';
import { ADDITIONAL_PART2_SAMPLES as PART2 } from './sample-data/additional-samples-part2';
import { ADDITIONAL_PART3_SAMPLES as PART3 } from './sample-data/additional-samples-part3';
import { ADDITIONAL_PART4_SAMPLES as PART4 } from './sample-data/additional-samples-part4';

// 1. Load the original 28 resumes from existing file
const targetPath = path.resolve(__dirname, '../frontend/data/sample-resumes.ts');
let existingRaw = '';
try {
  existingRaw = fs.readFileSync(targetPath, 'utf8');
} catch {
  console.error('Could not read existing file at:', targetPath);
}

const match = existingRaw.match(/export const SAMPLE_RESUMES: SampleResume\[\] = (\[[\s\S]*?\]);\n/);
if (!match) {
  console.error('Could not find SAMPLE_RESUMES in targetPath');
  process.exit(1);
}

const raw28: any[] = JSON.parse(match[1]);
console.log(`Loaded ${raw28.length} baseline resumes from ${targetPath}`);

// 2. Enrich the baseline 28 resumes with the enhanced metadata
const enriched28: SampleResume[] = raw28.slice(0, 28).map((r) => {
  let category: SampleCategory = 'SOFTWARE_ENGINEERING';
  let experienceLevel: ExperienceLevel = 'SENIOR_LEVEL';
  let experienceLevelLabel = 'Senior (6–9 yrs)';
  let country = 'United States';
  let resumeStyle: ResumeStyle = 'ATS Classic';

  if (r.id === 'technova-alexander-sharma-full-stack') {
    category = 'SOFTWARE_ENGINEERING';
    experienceLevel = 'MID_LEVEL';
    experienceLevelLabel = 'Mid Level (3–5 yrs)';
    country = 'India';
    resumeStyle = 'Modern Technical';
  } else if (r.id === 'google-staff-distributed-systems') {
    category = 'SOFTWARE_ENGINEERING';
    experienceLevel = 'STAFF_LEAD';
    experienceLevelLabel = 'Staff / Lead (8+ yrs)';
    resumeStyle = 'Modern Technical';
  } else if (r.id === 'meta-senior-data-engineer') {
    category = 'DATA_AI';
    experienceLevel = 'STAFF_LEAD';
    experienceLevelLabel = 'Staff / Lead (8+ yrs)';
    resumeStyle = 'Modern Technical';
  } else if (r.id === 'apple-core-os-engineer') {
    category = 'CORE_ENGINEERING';
    experienceLevel = 'SENIOR_LEVEL';
    experienceLevelLabel = 'Senior (6–9 yrs)';
  } else if (r.id === 'amazon-principal-solutions-architect') {
    category = 'DEVOPS_CLOUD';
    experienceLevel = 'EXECUTIVE';
    experienceLevelLabel = 'Executive (10+ yrs)';
    resumeStyle = 'Executive Clean';
  } else if (r.id === 'microsoft-senior-technical-product-manager') {
    category = 'PRODUCT_BUSINESS';
    experienceLevel = 'EXECUTIVE';
    experienceLevelLabel = 'Executive (10+ yrs)';
    resumeStyle = 'Executive Clean';
  } else if (r.id === 'netflix-senior-sre-streaming') {
    category = 'DEVOPS_CLOUD';
    experienceLevel = 'SENIOR_LEVEL';
    experienceLevelLabel = 'Senior (6–9 yrs)';
    resumeStyle = 'Modern Technical';
  } else if (r.id === 'tesla-autopilot-systems-engineer') {
    category = 'CORE_ENGINEERING';
    experienceLevel = 'STAFF_LEAD';
    experienceLevelLabel = 'Staff / Lead (8+ yrs)';
  } else if (r.id === 'nvidia-deep-learning-research-engineer') {
    category = 'DATA_AI';
    experienceLevel = 'SENIOR_LEVEL';
    experienceLevelLabel = 'Senior (6–9 yrs)';
    resumeStyle = 'Modern Technical';
  } else if (r.id === 'stripe-payments-infrastructure') {
    category = 'SOFTWARE_ENGINEERING';
    experienceLevel = 'STAFF_LEAD';
    experienceLevelLabel = 'Staff / Lead (8+ yrs)';
  } else if (r.id === 'uber-realtime-marketplace-engineer') {
    category = 'SOFTWARE_ENGINEERING';
    experienceLevel = 'STAFF_LEAD';
    experienceLevelLabel = 'Staff / Lead (8+ yrs)';
  } else if (r.id === 'goldman-sachs-quantitative-strategist') {
    category = 'FINANCE_BANKING';
    experienceLevel = 'STAFF_LEAD';
    experienceLevelLabel = 'Staff / Lead (8+ yrs)';
    resumeStyle = 'Executive Clean';
  } else if (r.id === 'openai-systems-research-engineer') {
    category = 'DATA_AI';
    experienceLevel = 'SENIOR_LEVEL';
    experienceLevelLabel = 'Senior (6–9 yrs)';
    resumeStyle = 'Modern Technical';
  } else if (r.id === 'palantir-forward-deployed-engineer') {
    category = 'SOFTWARE_ENGINEERING';
    experienceLevel = 'SENIOR_LEVEL';
    experienceLevelLabel = 'Senior (6–9 yrs)';
  } else if (r.id === 'databricks-lakehouse-engine-architect') {
    category = 'DATA_AI';
    experienceLevel = 'STAFF_LEAD';
    experienceLevelLabel = 'Staff / Lead (8+ yrs)';
  } else if (r.id === 'figma-graphics-canvas-architect') {
    category = 'DESIGN_UX';
    experienceLevel = 'STAFF_LEAD';
    experienceLevelLabel = 'Staff / Lead (8+ yrs)';
    resumeStyle = 'Modern Technical';
  } else if (r.id === 'citadel-low-latency-cpp-engineer') {
    category = 'FINANCE_BANKING';
    experienceLevel = 'SENIOR_LEVEL';
    experienceLevelLabel = 'Senior (6–9 yrs)';
  } else if (r.id === 'bytedance-recommendation-engineer') {
    category = 'DATA_AI';
    experienceLevel = 'STAFF_LEAD';
    experienceLevelLabel = 'Staff / Lead (8+ yrs)';
    country = 'Singapore';
  } else if (r.id === 'snowflake-database-kernel-engineer') {
    category = 'SOFTWARE_ENGINEERING';
    experienceLevel = 'SENIOR_LEVEL';
    experienceLevelLabel = 'Senior (6–9 yrs)';
  } else if (r.id === 'airbnb-design-technologist') {
    category = 'DESIGN_UX';
    experienceLevel = 'SENIOR_LEVEL';
    experienceLevelLabel = 'Senior (6–9 yrs)';
    resumeStyle = 'Modern Technical';
  } else if (r.id === 'spotify-ml-recommendations-engineer') {
    category = 'DATA_AI';
    experienceLevel = 'SENIOR_LEVEL';
    experienceLevelLabel = 'Senior (6–9 yrs)';
    country = 'United Kingdom';
  } else if (r.id === 'deloitte-senior-business-analyst') {
    category = 'PRODUCT_BUSINESS';
    experienceLevel = 'MID_LEVEL';
    experienceLevelLabel = 'Mid Level (3–5 yrs)';
    resumeStyle = 'Executive Clean';
  } else if (r.id === 'chime-fintech-project-manager') {
    category = 'PRODUCT_BUSINESS';
    experienceLevel = 'SENIOR_LEVEL';
    experienceLevelLabel = 'Senior (6–9 yrs)';
  } else if (r.id === 'disney-college-program-operations') {
    category = 'STUDENT_FRESHER';
    experienceLevel = 'STUDENT_INTERN';
    experienceLevelLabel = 'Student / Intern';
    resumeStyle = 'Compact Single-Column';
  } else if (r.id === 'adidas-senior-project-manager') {
    category = 'MARKETING_SEO';
    experienceLevel = 'SENIOR_LEVEL';
    experienceLevelLabel = 'Senior (6–9 yrs)';
    country = 'Germany';
  } else if (r.id === 'sony-rotational-graduate') {
    category = 'STUDENT_FRESHER';
    experienceLevel = 'ENTRY_LEVEL';
    experienceLevelLabel = 'Entry Level (0–2 yrs)';
    country = 'United Kingdom';
  } else if (r.id === 'accenture-assistant-policy-intern') {
    category = 'PRODUCT_BUSINESS';
    experienceLevel = 'ENTRY_LEVEL';
    experienceLevelLabel = 'Entry Level (0–2 yrs)';
    resumeStyle = 'Compact Single-Column';
  } else if (r.id === 'ncstate-it-security-architect') {
    category = 'DEVOPS_CLOUD';
    experienceLevel = 'STAFF_LEAD';
    experienceLevelLabel = 'Staff / Lead (8+ yrs)';
  }

  return {
    ...r,
    category,
    experienceLevel,
    experienceLevelLabel,
    country,
    resumeStyle,
    isIllustrative: true,
  };
});

// 3. Combine all samples (28 enriched + 54 new)
const rawCombined: SampleResume[] = [
  ...enriched28,
  ...PART1,
  ...PART2,
  ...PART3,
  ...PART4,
];

const allSamples: SampleResume[] = rawCombined.map((s) => ({
  ...s,
  education: s.education.map((edu) => ({
    ...edu,
    field: edu.field || edu.degree,
  })),
}));

console.log(`Total assembled samples: ${allSamples.length}`);

// 4. Quality & Integrity Assertions
const expectedTotal = 82;
if (allSamples.length !== expectedTotal) {
  console.error(`FATAL: Expected ${expectedTotal} samples, but got ${allSamples.length}`);
  process.exit(1);
}

// Check unique IDs
const idSet = new Set<string>();
const duplicates: string[] = [];
for (const s of allSamples) {
  if (idSet.has(s.id)) {
    duplicates.push(s.id);
  }
  idSet.add(s.id);
}

if (duplicates.length > 0) {
  console.error('FATAL: Duplicate IDs found:', duplicates);
  process.exit(1);
}

// Category Distribution Check
const categoryCounts: Record<string, number> = {};
for (const s of allSamples) {
  categoryCounts[s.category] = (categoryCounts[s.category] || 0) + 1;
}

console.log('\n--- Category Distribution ---');
console.table(categoryCounts);

const expectedTargets: Record<string, number> = {
  SOFTWARE_ENGINEERING: 15,
  DATA_AI: 8,
  DEVOPS_CLOUD: 7,
  PRODUCT_BUSINESS: 8,
  DESIGN_UX: 6,
  MARKETING_SEO: 7,
  FINANCE_BANKING: 7,
  HEALTHCARE: 6,
  LEGAL: 4,
  SALES_HR: 5,
  CORE_ENGINEERING: 4,
  STUDENT_FRESHER: 5,
};

let categoryMismatch = false;
for (const [cat, target] of Object.entries(expectedTargets)) {
  const actual = categoryCounts[cat] || 0;
  if (actual !== target) {
    console.error(`Mismatch for category ${cat}: expected ${target}, got ${actual}`);
    categoryMismatch = true;
  }
}

if (categoryMismatch) {
  console.error('FATAL: Category distribution does not match PRD Section 4.2 targets!');
  process.exit(1);
}

// Field Integrity Check
for (const s of allSamples) {
  if (!s.candidate?.name || !s.role || !s.company || !s.summary) {
    console.error(`FATAL: Missing candidate, role, company or summary in sample ${s.id}`);
    process.exit(1);
  }
  if (!s.experience || s.experience.length === 0) {
    console.error(`FATAL: Sample ${s.id} has no experience entries!`);
    process.exit(1);
  }
  if (!s.education || s.education.length === 0) {
    console.error(`FATAL: Sample ${s.id} has no education entries!`);
    process.exit(1);
  }
  if (!s.skills || s.skills.length === 0) {
    console.error(`FATAL: Sample ${s.id} has no skills entries!`);
    process.exit(1);
  }
}

console.log('All 82 samples passed schema, integrity, and category distribution tests successfully!');

// 5. Generate Target File: frontend/data/sample-resumes.ts
const fileHeader = `// Auto-generated by scripts/build_sample_resumes.ts
// Industry-leading, company-tailored resume profiles (82 Benchmark Resumes)

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

export const SAMPLE_CATEGORIES = [
  { id: 'ALL', label: 'All Industries' },
  { id: 'SOFTWARE_ENGINEERING', label: 'Software Engineering' },
  { id: 'DATA_AI', label: 'Data & AI / ML' },
  { id: 'DEVOPS_CLOUD', label: 'DevOps & Cloud' },
  { id: 'PRODUCT_BUSINESS', label: 'Product & Business' },
  { id: 'DESIGN_UX', label: 'UI/UX & Design' },
  { id: 'MARKETING_SEO', label: 'Marketing & SEO' },
  { id: 'FINANCE_BANKING', label: 'Finance & Banking' },
  { id: 'HEALTHCARE', label: 'Healthcare & Medical' },
  { id: 'LEGAL', label: 'Legal & Compliance' },
  { id: 'SALES_HR', label: 'Sales & HR' },
  { id: 'CORE_ENGINEERING', label: 'Core Engineering' },
  { id: 'STUDENT_FRESHER', label: 'Students & Freshers' },
  { id: 'PRO', label: 'PRO Benchmarks' },
] as const;

export const SAMPLE_EXPERIENCE_LEVELS = [
  { id: 'ALL', label: 'All Experience Levels' },
  { id: 'STUDENT_INTERN', label: 'Student / Intern' },
  { id: 'ENTRY_LEVEL', label: 'Entry Level (0–2 yrs)' },
  { id: 'MID_LEVEL', label: 'Mid Level (3–5 yrs)' },
  { id: 'SENIOR_LEVEL', label: 'Senior (6–9 yrs)' },
  { id: 'STAFF_LEAD', label: 'Staff / Lead (8+ yrs)' },
  { id: 'EXECUTIVE', label: 'Executive (10+ yrs)' },
] as const;

export const SAMPLE_COUNTRIES = [
  { id: 'ALL', label: 'All Countries' },
  { id: 'United States', label: 'United States' },
  { id: 'India', label: 'India' },
  { id: 'United Kingdom', label: 'United Kingdom' },
  { id: 'Canada', label: 'Canada' },
  { id: 'Germany', label: 'Germany' },
  { id: 'Singapore', label: 'Singapore' },
] as const;

export const SAMPLE_STYLES = [
  { id: 'ALL', label: 'All Styles' },
  { id: 'ATS Classic', label: 'ATS Classic' },
  { id: 'Modern Technical', label: 'Modern Technical' },
  { id: 'Executive Clean', label: 'Executive Clean' },
  { id: 'Compact Single-Column', label: 'Compact Single-Column' },
] as const;

export const SAMPLE_RESUMES: SampleResume[] = `;

const fileContent = fileHeader + JSON.stringify(allSamples, null, 2) + ';\n';
fs.writeFileSync(targetPath, fileContent, 'utf8');
console.log(`Successfully generated and verified ${allSamples.length} sample resumes at ${targetPath}`);
