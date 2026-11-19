import { Injectable, Logger } from '@nestjs/common';
import { JdUrlParserService } from '../../services/jd-url-parser.service.js';
import { JobsService } from '../../../jobs/jobs.service.js';
import { PromptSanitizer } from '../../../ai/utils/prompt-sanitizer.js';
import {
  AgentTool,
  checkNoForbiddenUserId,
  ToolExecutionContext,
  ToolPermissionTier,
  ToolResult,
  ToolValidationResult,
} from '../tool.interface.js';

export interface ParseJdOrPdfArgs {
  url?: string;
  rawText?: string;
  jobTitle?: string;
  companyName?: string;
}

@Injectable()
export class ParseJdOrPdfTool implements AgentTool<ParseJdOrPdfArgs, unknown> {
  private readonly logger = new Logger(ParseJdOrPdfTool.name);
  readonly name = 'parse_uploaded_jd_or_pdf';
  readonly description =
    'Fetches and extracts a structured Job Description from an external job posting URL (Greenhouse, Lever, Ashby, JSON-LD career pages) with SSRF and prompt-injection protection, or stores sanitized raw pasted JD text so subsequent match, resume tailoring, cover letter, and interview tools can use it.';
  readonly permissionTier = ToolPermissionTier.AI_ANALYSIS;
  readonly requiresApproval = false;
  readonly isModelCallable = true;
  readonly creditCost = 0;
  readonly timeoutMs = 30000;

  readonly inputSchema = {
    type: 'object',
    properties: {
      url: {
        type: 'string',
        description: 'Public https:// job posting URL to fetch and parse (e.g. Greenhouse, Lever, Ashby, career page).',
      },
      rawText: {
        type: 'string',
        description: 'Optional raw job description text to parse and store if no URL is provided.',
      },
      jobTitle: {
        type: 'string',
        description: 'Optional job title hint when parsing rawText.',
      },
      companyName: {
        type: 'string',
        description: 'Optional company name hint when parsing rawText.',
      },
    },
    required: [],
  };

  constructor(
    private readonly jdUrlParserService: JdUrlParserService,
    private readonly jobsService: JobsService,
  ) {}

  validate(args: unknown): ToolValidationResult<ParseJdOrPdfArgs> {
    const forbidden = checkNoForbiddenUserId(args);
    if (forbidden) return { valid: false, errors: [forbidden] };

    if (!args || typeof args !== 'object') {
      return { valid: false, errors: ['Provide either a job posting url or rawText to parse.'] };
    }

    const raw = args as Record<string, unknown>;
    const url = typeof raw.url === 'string' ? raw.url.trim() : undefined;
    const rawText = typeof raw.rawText === 'string' ? raw.rawText.trim() : undefined;

    if (!url && !rawText) {
      return { valid: false, errors: ['Either url or rawText is required for parse_uploaded_jd_or_pdf.'] };
    }

    if (url && !/^https?:\/\//i.test(url)) {
      return { valid: false, errors: ['url must start with http:// or https://'] };
    }

    return {
      valid: true,
      data: {
        url,
        rawText,
        jobTitle: typeof raw.jobTitle === 'string' ? raw.jobTitle.trim() : undefined,
        companyName: typeof raw.companyName === 'string' ? raw.companyName.trim() : undefined,
      },
    };
  }

  async execute(
    context: ToolExecutionContext,
    args: ParseJdOrPdfArgs,
  ): Promise<ToolResult<unknown>> {
    try {
      if (args.url) {
        const parsed = await this.jdUrlParserService.fetchAndParseJobUrl(context.userId, args.url);
        return {
          success: true,
          data: {
            kind: 'jd',
            jobDescriptionId: parsed.jobDescriptionId,
            title: parsed.title,
            company: parsed.companyName,
            companyName: parsed.companyName,
            location: parsed.location,
            workplace: parsed.workplace,
            applyUrl: parsed.applyUrl,
            descriptionText: parsed.descriptionText,
            extractionSource: parsed.extractionSource,
          },
          metadata: {
            jobDescriptionId: parsed.jobDescriptionId,
            extractionSource: parsed.extractionSource,
          },
        };
      }

      if (args.rawText && args.rawText.length >= 40) {
        const sanitized = PromptSanitizer.sanitizeExternalDocument(args.rawText, 15000);
        if (sanitized.wasSanitized) {
          this.logger.warn(
            `Neutralized prompt-injection payload in raw JD text (${sanitized.detectedSignals.join(', ') || 'zero-width chars'})`,
          );
        }
        const safeTitle = args.jobTitle
          ? PromptSanitizer.sanitizeExternalDocument(args.jobTitle, 140).sanitizedText || 'Target Role'
          : 'Target Role';
        const safeCompany = args.companyName
          ? PromptSanitizer.sanitizeExternalDocument(args.companyName, 120).sanitizedText || 'Target Company'
          : 'Target Company';
        const saved = await this.jobsService.createJobDescription(context.userId, {
          title: safeTitle,
          companyName: safeCompany,
          originalText: sanitized.sanitizedText,
        });
        return {
          success: true,
          data: {
            kind: 'jd',
            jobDescriptionId: saved.id,
            title: saved.title,
            company: saved.companyName || safeCompany,
            companyName: saved.companyName || safeCompany,
            descriptionText: sanitized.sanitizedText,
            extractionSource: 'raw_text',
            promptInjectionDefense: {
              sanitized: sanitized.wasSanitized,
              detectedSignalsCount: sanitized.detectedSignals.length,
            },
          },
          metadata: {
            jobDescriptionId: saved.id,
            promptInjectionSanitized: sanitized.wasSanitized,
            promptInjectionSignals: sanitized.detectedSignals,
          },
        };
      }

      return {
        success: false,
        error: 'Insufficient job description content provided.',
      };
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || 'Failed to parse job description URL or text.',
      };
    }
  }
}

