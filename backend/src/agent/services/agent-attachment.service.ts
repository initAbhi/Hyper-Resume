import {
  BadRequestException,
  Injectable,
  Logger,
  PayloadTooLargeException,
} from '@nestjs/common';
import { ResumeParserService } from '../../resume-parsing/resume-parser.service.js';
import { ResumesService } from '../../resumes/resumes.service.js';
import { JobsService } from '../../jobs/jobs.service.js';
import { evaluateStructuredResumeAts } from '../../ai/utils/ats-audit-engine.js';
import { PromptSanitizer } from '../../ai/utils/prompt-sanitizer.js';
import type { ResumeContent } from '../../resumes/entities/resume.types.js';
import type { ParsedProfileDraft } from '../../ai/interfaces/ai-provider.interface.js';
import { JdUrlParserService } from './jd-url-parser.service.js';

export type AttachmentParseKind = 'auto' | 'resume' | 'jd';

export interface UploadedAttachmentFile {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size?: number;
}

export interface ParsedResumeAttachmentResult {
  kind: 'resume';
  fileName: string;
  resumeId: string;
  resumeName: string;
  atsScore: number;
  topIssues: string[];
  extractedTextLength: number;
  headline?: string;
  skillsCount: number;
  experienceCount: number;
}

export interface ParsedJdAttachmentResult {
  kind: 'jd';
  fileName?: string;
  jobDescriptionId: string;
  title: string;
  companyName: string;
  location?: string;
  workplace?: 'Remote' | 'Hybrid' | 'Onsite';
  applyUrl?: string;
  descriptionText: string;
  source?: string;
  extractedTextLength: number;
}

export type ParsedAttachmentResult =
  | ParsedResumeAttachmentResult
  | ParsedJdAttachmentResult;

const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.txt'];

@Injectable()
export class AgentAttachmentService {
  private readonly logger = new Logger(AgentAttachmentService.name);

  constructor(
    private readonly resumeParserService: ResumeParserService,
    private readonly resumesService: ResumesService,
    private readonly jobsService: JobsService,
    private readonly jdUrlParserService: JdUrlParserService,
  ) {}

  async parseUploadedAttachment(
    userId: string,
    file: UploadedAttachmentFile | undefined,
    requestedKind: AttachmentParseKind = 'auto',
  ): Promise<ParsedAttachmentResult> {
    if (!file || !file.buffer || file.buffer.length === 0) {
      throw new BadRequestException('Please attach a non-empty PDF, DOCX, or TXT file.');
    }

    if (file.buffer.length > MAX_ATTACHMENT_BYTES) {
      throw new PayloadTooLargeException('File exceeds the 10 MB upload limit.');
    }

    const originalName = (file.originalname || 'attachment.pdf').trim();
    const lowerName = originalName.toLowerCase();
    const hasAllowedExt = ALLOWED_EXTENSIONS.some((ext) => lowerName.endsWith(ext));
    const allowedMime =
      file.mimetype === 'application/pdf' ||
      file.mimetype ===
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.mimetype === 'text/plain' ||
      file.mimetype === 'application/octet-stream';

    if (!hasAllowedExt && !allowedMime) {
      throw new BadRequestException(
        'Unsupported file format. Please upload a .pdf, .docx, or .txt resume or job description.',
      );
    }

    const kind: AttachmentParseKind =
      requestedKind === 'resume' || requestedKind === 'jd' ? requestedKind : 'auto';

    // Fast pre-extraction for explicit JD or obvious JD documents (avoids unnecessary AI resume parsing)
    if (kind === 'jd' || kind === 'auto') {
      const rawText = await this.resumeParserService.extractTextFromBuffer(
        file.buffer,
        file.mimetype,
        originalName,
      );
      if (!rawText || rawText.trim().length < 50) {
        throw new BadRequestException(
          'Could not extract enough readable text from the uploaded document. Ensure it is not scanned or password-protected.',
        );
      }
      if (kind === 'jd' || this.looksLikeJobDescriptionTextOnly(rawText)) {
        return this.persistExtractedJd(userId, rawText, originalName);
      }
    }

    // Parse with ResumeParserService (extracts text + builds structured draft)
    const parsed = await this.resumeParserService.parseUploadedFileWithRawText(
      file.buffer,
      originalName,
      file.mimetype,
    );

    if (kind === 'auto' && this.looksLikeJobDescription(parsed.extractedText, parsed.draft)) {
      return this.persistExtractedJd(userId, parsed.extractedText, originalName);
    }

    // Build structured ResumeContent and save a live Resume for the user
    const content = this.mapDraftToResumeContent(parsed.draft);
    const baseName = originalName
      .replace(/\.(pdf|docx|txt)$/i, '')
      .replace(/[_-]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    const resumeName = (baseName || content.contact.fullName || 'Uploaded Resume').slice(0, 90);

    const created = await this.resumesService.createResume(userId, {
      name: resumeName,
      templateKey: 'clean-modern',
      content,
    });

    const audit = evaluateStructuredResumeAts(created.content);
    const topIssues = [
      ...(audit.recommendations || []),
      ...(audit.findings?.parserRisks || []),
    ]
      .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
      .slice(0, 5);

    this.logger.log(
      `Imported uploaded resume "${created.name}" (${created.id}) for user ${userId} — instant ATS score: ${audit.atsScore}/100`,
    );

    return {
      kind: 'resume',
      fileName: originalName,
      resumeId: created.id,
      resumeName: created.name,
      atsScore: audit.atsScore,
      topIssues,
      extractedTextLength: parsed.extractedTextLength,
      headline: created.content.headline || undefined,
      skillsCount: created.content.skills.length,
      experienceCount: created.content.experience.length,
    };
  }

  async parseJobUrlAttachment(
    userId: string,
    url: string,
  ): Promise<ParsedJdAttachmentResult> {
    const parsed = await this.jdUrlParserService.fetchAndParseJobUrl(userId, url);
    return {
      kind: 'jd',
      jobDescriptionId: parsed.jobDescriptionId,
      title: parsed.title,
      companyName: parsed.companyName,
      location: parsed.location,
      workplace: parsed.workplace,
      applyUrl: parsed.applyUrl,
      descriptionText: parsed.descriptionText,
      source: parsed.extractionSource,
      extractedTextLength: parsed.descriptionText.length,
    };
  }

  private looksLikeJobDescriptionTextOnly(text: string): boolean {
    const lower = text.toLowerCase();
    const jdMatches = lower.match(
      /\b(responsibilities|what you['’]ll do|about the role|job description|minimum qualifications|preferred qualifications|required qualifications|who you are|apply now|equal opportunity employer|compensation range|benefits and perks)\b/gi,
    );
    const jdHits = jdMatches ? jdMatches.length : 0;
    const hasEmailOrPhone =
      /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i.test(text) ||
      /(?:\+?\d[\d\s\-()]{8,}\d)/.test(text);
    return jdHits >= 3 && !hasEmailOrPhone;
  }

  private looksLikeJobDescription(text: string, draft: ParsedProfileDraft): boolean {
    const lower = text.toLowerCase();
    const jdSignals = [
      /\b(responsibilities|what you['’]ll do|about the role|job description|minimum qualifications|preferred qualifications|required qualifications|who you are|apply now|equal opportunity employer|compensation range|benefits and perks)\b/gi,
    ];
    let jdHits = 0;
    for (const pattern of jdSignals) {
      const matches = lower.match(pattern);
      if (matches) jdHits += matches.length;
    }

    const hasCandidateIdentity =
      Boolean(draft.contact?.email) ||
      Boolean(draft.contact?.phone) ||
      (draft.experience?.length || 0) >= 2 ||
      (draft.education?.length || 0) >= 1;

    if (jdHits >= 3 && !hasCandidateIdentity) {
      return true;
    }
    if (jdHits >= 5 && (draft.experience?.length || 0) === 0) {
      return true;
    }
    return false;
  }

  private async persistExtractedJd(
    userId: string,
    rawText: string,
    fileName: string,
  ): Promise<ParsedJdAttachmentResult> {
    const sanitizedDoc = PromptSanitizer.sanitizeExternalDocument(rawText, 12000);
    if (sanitizedDoc.wasSanitized) {
      this.logger.warn(
        `Prompt-injection defense sanitized uploaded JD file "${fileName}": signals=[${sanitizedDoc.detectedSignals.join(', ')}], zeroWidth=${sanitizedDoc.strippedZeroWidthCount}`,
      );
    }
    const safeText = sanitizedDoc.sanitizedText;

    const lines = safeText
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 2);

    const cleanFileTitle = fileName
      .replace(/\.(pdf|docx|txt)$/i, '')
      .replace(/[_-]+/g, ' ')
      .trim();

    const firstHeading = lines[0] && lines[0].length <= 90 ? lines[0] : cleanFileTitle;
    let title = PromptSanitizer.sanitizeExternalDocument(firstHeading || 'Target Role', 120).sanitizedText || 'Target Role';
    let companyName = 'Target Company';

    const atMatch = title.match(/^(.+?)\s+(?:at|@|-|\|)\s+(.+)$/i);
    if (atMatch) {
      title = atMatch[1].trim().slice(0, 120);
      companyName = atMatch[2].trim().slice(0, 120);
    }

    const created = await this.jobsService.createJobDescription(userId, {
      title,
      companyName,
      originalText: safeText,
    });

    const lower = safeText.toLowerCase();
    const workplace: 'Remote' | 'Hybrid' | 'Onsite' | undefined = /\bremote\b/.test(lower)
      ? 'Remote'
      : /\bhybrid\b/.test(lower)
        ? 'Hybrid'
        : /\b(on-site|onsite)\b/.test(lower)
          ? 'Onsite'
          : undefined;

    return {
      kind: 'jd',
      fileName,
      jobDescriptionId: created.id,
      title: created.title,
      companyName: created.companyName || companyName,
      workplace,
      descriptionText: created.originalText,
      source: 'uploaded_file',
      extractedTextLength: safeText.length,
    };
  }

  private sanitizeField(val?: string, maxLen = 600): string {
    if (!val || typeof val !== 'string') return '';
    return PromptSanitizer.sanitizeExternalDocument(val, maxLen).sanitizedText;
  }

  private mapDraftToResumeContent(draft: ParsedProfileDraft): ResumeContent {
    return {
      contact: {
        fullName: this.sanitizeField(draft.contact?.fullName, 120),
        email: this.sanitizeField(draft.contact?.email, 160),
        phone: draft.contact?.phone ? this.sanitizeField(draft.contact.phone, 40) : undefined,
        location: this.sanitizeField(draft.contact?.location || draft.location, 120),
        linkedinUrl: draft.contact?.linkedinUrl ? this.sanitizeField(draft.contact.linkedinUrl, 240) : undefined,
        githubUrl: draft.contact?.githubUrl ? this.sanitizeField(draft.contact.githubUrl, 240) : undefined,
        websiteUrl: draft.contact?.websiteUrl ? this.sanitizeField(draft.contact.websiteUrl, 240) : undefined,
      },
      headline: this.sanitizeField(draft.headline, 180),
      summary: this.sanitizeField(draft.summary, 1500),
      skills: (draft.skills || [])
        .filter((s) => Boolean(s?.name))
        .map((s) => ({
          name: this.sanitizeField(s.name, 80),
          category: this.sanitizeField(s.category || 'Core Skills', 60) || 'Core Skills',
        }))
        .filter((s) => s.name.length > 0),
      experience: (draft.experience || []).map((exp, idx) => ({
        id: `exp-${idx + 1}`,
        company: this.sanitizeField(exp.company, 120) || 'Company',
        title: this.sanitizeField(exp.title, 120) || 'Role',
        location: exp.location ? this.sanitizeField(exp.location, 100) : undefined,
        startDate: this.sanitizeField(exp.startDate, 40),
        endDate: exp.endDate ? this.sanitizeField(exp.endDate, 40) : undefined,
        current: Boolean(exp.current),
        bullets: Array.isArray(exp.bullets)
          ? exp.bullets
              .filter((b) => typeof b === 'string' && b.trim().length > 0)
              .map((b) => this.sanitizeField(b, 500))
              .filter((b) => b.length > 0)
          : [],
      })),
      education: (draft.education || []).map((edu, idx) => ({
        id: `edu-${idx + 1}`,
        school: this.sanitizeField(edu.school, 140) || 'University',
        degree: this.sanitizeField(edu.degree, 120),
        field: this.sanitizeField(edu.field, 120),
        graduationDate: edu.graduationDate ? this.sanitizeField(edu.graduationDate, 40) : undefined,
      })),
      projects: (draft.projects || []).map((proj, idx) => ({
        id: `proj-${idx + 1}`,
        name: this.sanitizeField(proj.name, 140) || 'Project',
        description: this.sanitizeField(proj.description, 600),
        highlights: Array.isArray(proj.highlights)
          ? proj.highlights
              .filter((h) => typeof h === 'string' && h.trim().length > 0)
              .map((h) => this.sanitizeField(h, 500))
              .filter((h) => h.length > 0)
          : [],
        url: proj.url ? this.sanitizeField(proj.url, 240) : undefined,
      })),
      certifications: (draft.certifications || []).map((cert, idx) => ({
        id: `cert-${idx + 1}`,
        name: this.sanitizeField(cert.name, 140) || 'Certification',
        issuer: this.sanitizeField(cert.issuer, 120),
        issueDate: cert.issueDate ? this.sanitizeField(cert.issueDate, 40) : undefined,
      })),
    };
  }
}
