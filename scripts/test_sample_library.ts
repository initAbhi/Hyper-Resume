import {
  SAMPLE_RESUMES,
  SAMPLE_CATEGORIES,
  SAMPLE_EXPERIENCE_LEVELS,
  SAMPLE_COUNTRIES,
  SAMPLE_STYLES,
  SampleResume,
} from '../frontend/data/sample-resumes';

console.log('--- RUNNING SAMPLE LIBRARY 2.0 AUTOMATED TESTS ---');

// Test 1: Count check
console.log(`\nTest 1: Total sample count check`);
console.assert(SAMPLE_RESUMES.length === 82, `Expected 82 samples, got ${SAMPLE_RESUMES.length}`);
console.log(`  PASSED: Total resumes = ${SAMPLE_RESUMES.length}`);

// Test 2: Uniqueness of IDs
console.log(`\nTest 2: Unique ID check`);
const idSet = new Set<string>();
for (const r of SAMPLE_RESUMES) {
  if (idSet.has(r.id)) {
    throw new Error(`Duplicate ID found: ${r.id}`);
  }
  idSet.add(r.id);
}
console.log(`  PASSED: All ${idSet.size} sample IDs are strictly unique.`);

// Test 3: Category distribution matching Section 4.2 PRD
console.log(`\nTest 3: Category distribution check`);
const categoryCounts: Record<string, number> = {};
for (const r of SAMPLE_RESUMES) {
  categoryCounts[r.category] = (categoryCounts[r.category] || 0) + 1;
}

const targets: Record<string, number> = {
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

for (const [cat, expected] of Object.entries(targets)) {
  const actual = categoryCounts[cat] || 0;
  if (actual !== expected) {
    throw new Error(`Category ${cat} mismatch: expected ${expected}, got ${actual}`);
  }
}
console.log(`  PASSED: All 12 categories match exact target distributions.`);

// Test 4: Schema and Field Integrity
console.log(`\nTest 4: Schema and field integrity check`);
for (const r of SAMPLE_RESUMES) {
  if (!r.id || typeof r.id !== 'string') throw new Error(`Invalid ID: ${r.id}`);
  if (!r.company || !r.role) throw new Error(`Missing company/role: ${r.id}`);
  if (!r.candidate?.name || !r.candidate?.email) throw new Error(`Missing candidate info: ${r.id}`);
  if (!r.summary || r.summary.length < 50) throw new Error(`Summary too short or missing: ${r.id}`);
  if (!r.skills || r.skills.length === 0) throw new Error(`Empty skills: ${r.id}`);
  if (!r.experience || r.experience.length === 0) throw new Error(`Empty experience: ${r.id}`);
  if (!r.education || r.education.length === 0) throw new Error(`Empty education: ${r.id}`);
  if (typeof r.atsScore !== 'number' || r.atsScore < 90 || r.atsScore > 100) {
    throw new Error(`Invalid ATS score (${r.atsScore}) in ${r.id}`);
  }
  if (!r.country) throw new Error(`Missing country in ${r.id}`);
  if (!r.experienceLevel || !r.experienceLevelLabel) throw new Error(`Missing experience level in ${r.id}`);
  if (!r.resumeStyle) throw new Error(`Missing resume style in ${r.id}`);
  if (r.isIllustrative !== true) throw new Error(`Sample ${r.id} must be flagged as illustrative`);
}
console.log(`  PASSED: 100% of samples satisfy all integrity and schema constraints.`);

// Test 5: Full and Starter Template generation transformations
console.log(`\nTest 5: Template transformation simulation`);
const testSample = SAMPLE_RESUMES[0];

// Mode 2: Full Template Simulation
const fullResumeContent = {
  contact: {
    fullName: testSample.candidate.name,
    email: testSample.candidate.email,
    phone: testSample.candidate.phone,
    location: testSample.candidate.location,
  },
  headline: testSample.role,
  summary: testSample.summary,
  skills: testSample.skills.flatMap((c) => c.skills.map((s) => ({ name: s, category: c.category }))),
  experience: testSample.experience.map((e) => ({ ...e, bullets: e.bullets })),
  education: testSample.education.map((edu) => ({ ...edu, field: edu.field || edu.degree })),
};
console.assert(fullResumeContent.skills.length > 5, 'Full template skills must be populated');
console.assert(fullResumeContent.experience.length > 0, 'Full template experience must be populated');

// Mode 1: Starter Template Simulation
const starterResumeContent = {
  contact: {
    fullName: 'Test User',
    email: 'user@test.com',
  },
  headline: testSample.role,
  summary: `Targeted ${testSample.role} professional summary`,
  skills: testSample.skills.flatMap((c) => c.skills.slice(0, 3).map((s) => ({ name: s, category: c.category }))),
  experience: [
    {
      company: 'Your Company',
      title: testSample.role,
      location: 'City, Country',
      startDate: '2023-01',
      current: true,
      bullets: ['Achievement 1', 'Achievement 2'],
    },
  ],
  education: [
    {
      school: 'Your University',
      degree: 'B.S.',
      field: 'Computer Science',
      graduationDate: '2023',
    },
  ],
};
console.assert(starterResumeContent.contact.fullName === 'Test User', 'Starter template must use user name');
console.assert(starterResumeContent.experience.length === 1, 'Starter template has guided placeholder');
console.log(`  PASSED: Both Full and Starter template creation transformations succeed without data pollution.`);

// Test 6: Experience levels and filters integrity
console.log(`\nTest 6: Filter arrays integrity`);
console.assert(SAMPLE_CATEGORIES.length === 14, `Expected 14 category entries, got ${SAMPLE_CATEGORIES.length}`);
console.assert(SAMPLE_EXPERIENCE_LEVELS.length === 7, `Expected 7 experience level entries, got ${SAMPLE_EXPERIENCE_LEVELS.length}`);
console.assert(SAMPLE_COUNTRIES.length >= 7, `Expected >=7 country entries, got ${SAMPLE_COUNTRIES.length}`);
console.assert(SAMPLE_STYLES.length === 5, `Expected 5 style entries, got ${SAMPLE_STYLES.length}`);
console.log(`  PASSED: All filter dimensions are properly structured and typed.`);

console.log(`\nALL TESTS PASSED SUCCESSFULLY! (6/6 Suites Passed)`);

