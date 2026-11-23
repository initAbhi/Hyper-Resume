import type { SampleResume } from '@/data/sample-resumes';
import { getSampleTemplateKey } from '@/data/sample-resumes';
import type { ResumeContent } from '@/lib/api-client';

function toSafeUrl(raw?: string) {
  const trimmed = (raw || '').trim();
  if (!trimmed) return undefined;
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function parseHex(hex: string): { r: number; g: number; b: number } | null {
  const raw = hex.trim().replace('#', '');
  if (!/^[0-9a-fA-F]{6}$/.test(raw)) return null;
  return {
    r: parseInt(raw.slice(0, 2), 16),
    g: parseInt(raw.slice(2, 4), 16),
    b: parseInt(raw.slice(4, 6), 16),
  };
}

function rgbToHsl(r: number, g: number, b: number) {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
  else if (max === gn) h = ((bn - rn) / d + 2) / 6;
  else h = ((rn - gn) / d + 4) / 6;
  return { h: h * 360, s, l };
}

/** Curated professional ink tones — no neon greens, hot pinks, or candy oranges. */
const PROFESSIONAL_INKS = {
  navy: '#142d4c',
  ink: '#1e293b',
  slate: '#334155',
  charcoal: '#0f172a',
  forest: '#1e3a32',
  teal: '#0f4c5c',
  burgundy: '#5c2a32',
  steel: '#1e3a5f',
} as const;

function pickInk(seed: string, options: string[]): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return options[hash % options.length];
}

/**
 * Resume document accent for sample library previews.
 * Company logos keep real brand colors in the card footer; the document itself
 * uses restrained professional inks so half-color / sidebar layouts never look flashy.
 */
export function getSampleAccentColor(resume: {
  id?: string;
  companyKey?: string;
  brandColor?: string;
  templateKey?: string;
  resumeStyle?: string;
}): string {
  const templateKey = getSampleTemplateKey(resume);
  const seed = resume.id || resume.companyKey || resume.brandColor || 'sample';
  const brand = (resume.brandColor || '').toUpperCase();
  const rgb = parseHex(brand);
  const hsl = rgb ? rgbToHsl(rgb.r, rgb.g, rgb.b) : null;

  // Full-bleed color panels (sidebar / crest) — always deep professional neutrals
  if (templateKey === 'elegant' || templateKey === 'sidebar' || templateKey === 'crest') {
    return pickInk(seed, [
      PROFESSIONAL_INKS.navy,
      PROFESSIONAL_INKS.charcoal,
      PROFESSIONAL_INKS.ink,
      PROFESSIONAL_INKS.steel,
      PROFESSIONAL_INKS.teal,
    ]);
  }

  // Already dark / near-black brands stay ink-like
  if (hsl && hsl.l < 0.18 && hsl.s < 0.35) {
    return PROFESSIONAL_INKS.charcoal;
  }
  if (hsl && hsl.l < 0.28 && hsl.s < 0.45) {
    return brand.startsWith('#') ? brand : `#${brand}`;
  }

  // Flashy / high-saturation brand fills → map by hue family to muted ink
  if (!hsl || hsl.s > 0.35 || hsl.l > 0.45) {
    const h = hsl?.h ?? 210;
    if (h < 25 || h >= 345) return PROFESSIONAL_INKS.burgundy; // reds / oranges
    if (h < 55) return PROFESSIONAL_INKS.ink; // amber / gold
    if (h < 95) return PROFESSIONAL_INKS.forest; // lime / neon green
    if (h < 165) return PROFESSIONAL_INKS.teal; // green / mint
    if (h < 200) return PROFESSIONAL_INKS.teal; // cyan
    if (h < 255) return PROFESSIONAL_INKS.navy; // blue
    if (h < 295) return PROFESSIONAL_INKS.steel; // indigo / violet
    return PROFESSIONAL_INKS.burgundy; // magenta / pink
  }

  // Moderately saturated but dark enough — soften toward navy/slate
  return pickInk(seed, [
    PROFESSIONAL_INKS.navy,
    PROFESSIONAL_INKS.steel,
    PROFESSIONAL_INKS.ink,
    PROFESSIONAL_INKS.slate,
  ]);
}

/** Map a sample library resume into ResumeContent for live template rendering. */
export function sampleResumeToContent(resume: SampleResume): ResumeContent {
  const templateKey = getSampleTemplateKey(resume);
  const accentColor = getSampleAccentColor(resume);
  const totalBullets = resume.experience.reduce((sum, exp) => sum + exp.bullets.length, 0);
  // Sparse samples get slightly larger type so the A4 preview reads fuller.
  const fontSizeScale = totalBullets >= 12 ? 1 : totalBullets >= 8 ? 1.04 : 1.08;

  return {
    contact: {
      fullName: resume.candidate.name,
      email: resume.candidate.email,
      phone: resume.candidate.phone,
      location: resume.candidate.location,
      linkedinUrl: toSafeUrl(resume.candidate.linkedin),
      githubUrl: toSafeUrl(resume.candidate.github),
      websiteUrl: toSafeUrl(resume.candidate.portfolio),
    },
    headline: resume.role,
    summary: resume.summary,
    skills: resume.skills.flatMap((cat) =>
      cat.skills.map((skillName) => ({
        name: skillName,
        category: cat.category,
      })),
    ),
    experience: resume.experience.map((exp) => ({
      company: exp.company,
      title: exp.title,
      location: exp.location,
      startDate: exp.startDate,
      endDate: exp.endDate,
      current: !!exp.current,
      bullets: exp.bullets,
    })),
    education: resume.education.map((edu) => ({
      school: edu.school,
      degree: edu.degree,
      field: edu.field || edu.degree,
      graduationDate: edu.graduationDate,
      gpa: edu.gpa,
    })),
    projects: resume.projects?.map((proj) => ({
      name: proj.name,
      description: proj.description,
      highlights: proj.highlights,
      url: toSafeUrl(proj.url),
    })),
    certifications: resume.certifications?.map((cert) => ({
      name: cert,
      issuer: '',
    })),
    layout: {
      accentColor,
      fontFamily: templateKey === 'ivy-league' || templateKey === 'jake-ats' ? 'serif' : 'sans',
      pageMargin: totalBullets >= 10 ? 28 : 24,
      fontSizeScale,
      lineHeight: 1.35,
    },
  };
}
