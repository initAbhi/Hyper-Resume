import {
  BadRequestException,
  Injectable,
  Logger,
} from '@nestjs/common';
import dns from 'node:dns/promises';
import net from 'node:net';
import { JobsService } from '../../jobs/jobs.service.js';
import { PromptSanitizer } from '../../ai/utils/prompt-sanitizer.js';

export interface ParsedJobUrlResult {
  jobDescriptionId: string;
  title: string;
  companyName: string;
  location?: string;
  workplace?: 'Remote' | 'Hybrid' | 'Onsite';
  applyUrl: string;
  descriptionText: string;
  extractionSource: 'greenhouse_api' | 'lever_api' | 'json_ld' | 'linkedin_guest' | 'html_heuristic';
  promptInjectionDefense?: {
    sanitized: boolean;
    detectedSignals: string[];
    strippedHiddenHtmlCount: number;
    strippedZeroWidthCount: number;
  };
}

const MAX_REDIRECTS = 3;
const FETCH_TIMEOUT_MS = 8000;
const MAX_RESPONSE_BYTES = 2 * 1024 * 1024; // 2MB hard cap

@Injectable()
export class JdUrlParserService {
  private readonly logger = new Logger(JdUrlParserService.name);

  constructor(private readonly jobsService: JobsService) {}

  /**
   * Strictly checks whether an IPv4 or IPv6 address falls in private, loopback,
   * link-local, carrier-grade NAT, or cloud metadata ranges.
   */
  public isPrivateOrReservedIp(ip: string): boolean {
    const clean = ip.trim().toLowerCase().replace(/^\[|\]$/g, '');
    if (!clean) return true;

    // Handle IPv4-mapped IPv6 addresses like ::ffff:127.0.0.1
    if (clean.startsWith('::ffff:')) {
      const mapped = clean.slice(7);
      if (net.isIPv4(mapped)) {
        return this.isPrivateOrReservedIp(mapped);
      }
      return true;
    }

    if (net.isIPv4(clean)) {
      const parts = clean.split('.').map(Number);
      if (parts.length !== 4 || parts.some((n) => Number.isNaN(n) || n < 0 || n > 255)) {
        return true;
      }
      const [a, b] = parts;
      if (a === 0) return true; // 0.0.0.0/8
      if (a === 10) return true; // 10.0.0.0/8
      if (a === 127) return true; // 127.0.0.0/8 loopback
      if (a === 169 && b === 254) return true; // 169.254.0.0/16 link-local & cloud metadata
      if (a === 172 && b >= 16 && b <= 31) return true; // 172.16.0.0/12
      if (a === 192 && b === 168) return true; // 192.168.0.0/16
      if (a === 100 && b >= 64 && b <= 127) return true; // 100.64.0.0/10 CGNAT
      if (a >= 224) return true; // multicast & reserved
      return false;
    }

    if (net.isIPv6(clean)) {
      if (clean === '::' || clean === '::1') return true;
      if (clean.startsWith('fc') || clean.startsWith('fd')) return true; // fc00::/7 ULA
      if (clean.startsWith('fe8') || clean.startsWith('fe9') || clean.startsWith('fea') || clean.startsWith('feb')) {
        return true; // fe80::/10 link-local
      }
      if (clean.startsWith('ff')) return true; // multicast
      return false;
    }

    return true;
  }

  /**
   * Validates URL syntax, scheme, hostname, and resolves DNS to block SSRF & private-network targets.
   */
  public async validateSafeExternalUrl(rawUrl: string): Promise<URL> {
    let parsed: URL;
    try {
      parsed = new URL(rawUrl.trim());
    } catch {
      throw new BadRequestException('Invalid URL format. Please provide a valid https:// job posting URL.');
    }

    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      throw new BadRequestException('Only http:// and https:// URLs are supported.');
    }

    if (parsed.username || parsed.password) {
      throw new BadRequestException('URLs containing embedded credentials are not allowed.');
    }

    const host = parsed.hostname.toLowerCase().replace(/^\[|\]$/g, '');
    if (
      !host ||
      host === 'localhost' ||
      host.endsWith('.localhost') ||
      host.endsWith('.local') ||
      host.endsWith('.internal') ||
      host === 'metadata.google.internal' ||
      /^(\d+|0x[0-9a-f]+)$/i.test(host)
    ) {
      throw new BadRequestException('Internal, loopback, or metadata URLs are blocked for security.');
    }

    if (net.isIP(host)) {
      if (this.isPrivateOrReservedIp(host)) {
        throw new BadRequestException('Private or reserved IP addresses are blocked for security.');
      }
      return parsed;
    }

    // DNS resolution check (defends against DNS-based SSRF pointing to private/metadata IPs)
    try {
      const addresses = await dns.lookup(host, { all: true });
      if (!addresses || addresses.length === 0) {
        throw new BadRequestException(`Could not resolve hostname "${host}".`);
      }
      for (const entry of addresses) {
        if (this.isPrivateOrReservedIp(entry.address)) {
          throw new BadRequestException(
            `Blocked URL: hostname "${host}" resolves to a private or reserved network address.`,
          );
        }
      }
    } catch (err) {
      if (err instanceof BadRequestException) throw err;
      throw new BadRequestException(`Unable to resolve hostname "${host}". Please verify the job URL.`);
    }

    return parsed;
  }

  /**
   * Fetches an external URL safely with manual redirect validation, timeout, and byte cap.
   */
  public async safeFetchText(
    urlString: string,
    acceptHeader = 'text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.8',
  ): Promise<{ text: string; finalUrl: string; contentType: string; status: number }> {
    let currentUrl = urlString;

    for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
      const validated = await this.validateSafeExternalUrl(currentUrl);
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

      try {
        const res = await fetch(validated.toString(), {
          method: 'GET',
          redirect: 'manual',
          signal: controller.signal,
          headers: {
            'User-Agent':
              'Mozilla/5.0 (compatible; HyperResumeBot/1.0; +https://hyperresume.app)',
            Accept: acceptHeader,
            'Accept-Language': 'en-US,en;q=0.9',
          },
        });

        // Handle redirects with per-hop SSRF re-validation
        if (res.status >= 300 && res.status < 400) {
          const location = res.headers.get('location');
          if (!location) {
            throw new BadRequestException('Target job URL returned an incomplete redirect.');
          }
          currentUrl = new URL(location, validated.toString()).toString();
          continue;
        }

        const contentType = res.headers.get('content-type') || '';
        const contentLength = Number(res.headers.get('content-length') || 0);
        if (contentLength > MAX_RESPONSE_BYTES) {
          throw new BadRequestException('Target job posting page exceeds the 2MB safety limit.');
        }

        const reader = res.body?.getReader();
        if (!reader) {
          const fallbackText = await res.text();
          return {
            text: fallbackText.slice(0, MAX_RESPONSE_BYTES),
            finalUrl: validated.toString(),
            contentType,
            status: res.status,
          };
        }

        const chunks: Uint8Array[] = [];
        let received = 0;
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (value) {
            received += value.byteLength;
            if (received > MAX_RESPONSE_BYTES) {
              reader.cancel().catch(() => {});
              throw new BadRequestException('Target job posting page exceeds the 2MB safety limit.');
            }
            chunks.push(value);
          }
        }

        const fullBuf = Buffer.concat(chunks.map((c) => Buffer.from(c)));
        return {
          text: fullBuf.toString('utf-8'),
          finalUrl: validated.toString(),
          contentType,
          status: res.status,
        };
      } catch (err: any) {
        if (err instanceof BadRequestException) throw err;
        if (err?.name === 'AbortError') {
          throw new BadRequestException(
            'Timed out fetching the job posting URL. You can copy & paste the job description text directly into chat instead.',
          );
        }
        throw new BadRequestException(
          `Could not fetch job URL (${err?.message || 'network error'}). Paste the job description text directly into chat instead.`,
        );
      } finally {
        clearTimeout(timeout);
      }
    }

    throw new BadRequestException('Too many redirects while fetching the job posting URL.');
  }

  private stripHtmlWithTelemetry(html: string): { text: string; strippedHiddenHtmlCount: number } {
    const { cleanedHtml, strippedCount } = PromptSanitizer.stripHiddenHtmlElements(html);
    const text = cleanedHtml
      .replace(/<(?:br|\/p|\/div|\/li|\/h[1-6]|\/tr)\b[^>]*>/gi, '\n')
      .replace(/<li\b[^>]*>/gi, '\n• ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/gi, ' ')
      .replace(/&amp;/gi, '&')
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>')
      .replace(/&quot;/gi, '"')
      .replace(/&#39;|&apos;/gi, "'")
      .replace(/[ \t]+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
    return { text, strippedHiddenHtmlCount: strippedCount };
  }

  public stripHtmlToText(html: string): string {
    return this.stripHtmlWithTelemetry(html).text;
  }

  private inferWorkplace(text: string, location?: string): 'Remote' | 'Hybrid' | 'Onsite' | undefined {
    const combined = `${location || ''} ${text.slice(0, 1200)}`.toLowerCase();
    if (/\bremote\b/i.test(combined)) return 'Remote';
    if (/\bhybrid\b/i.test(combined)) return 'Hybrid';
    if (/\bon-?site\b|\bin-?office\b/i.test(combined)) return 'Onsite';
    return undefined;
  }

  private extractJsonLdJobPosting(html: string): {
    title?: string;
    companyName?: string;
    location?: string;
    descriptionText?: string;
  } | null {
    const scriptRegex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
    let match: RegExpExecArray | null;

    const findJobPosting = (node: any): any => {
      if (!node || typeof node !== 'object') return null;
      if (Array.isArray(node)) {
        for (const item of node) {
          const found = findJobPosting(item);
          if (found) return found;
        }
        return null;
      }
      const nodeType = node['@type'];
      const isJob =
        nodeType === 'JobPosting' ||
        (Array.isArray(nodeType) && nodeType.includes('JobPosting'));
      if (isJob) return node;
      if (Array.isArray(node['@graph'])) {
        return findJobPosting(node['@graph']);
      }
      return null;
    };

    while ((match = scriptRegex.exec(html)) !== null) {
      const rawJson = (match[1] || '').trim();
      if (!rawJson) continue;
      try {
        const parsed = JSON.parse(rawJson);
        const jp = findJobPosting(parsed);
        if (!jp) continue;
        const title = typeof jp.title === 'string' ? jp.title.trim() : undefined;
        const companyName =
          typeof jp.hiringOrganization === 'string'
            ? jp.hiringOrganization.trim()
            : typeof jp.hiringOrganization?.name === 'string'
              ? jp.hiringOrganization.name.trim()
              : undefined;
        const locObj = Array.isArray(jp.jobLocation) ? jp.jobLocation[0] : jp.jobLocation;
        const addr = locObj?.address;
        const location =
          typeof locObj === 'string'
            ? locObj
            : [addr?.addressLocality, addr?.addressRegion, addr?.addressCountry]
                .filter(Boolean)
                .join(', ') ||
              (jp.jobLocationType === 'TELECOMMUTE' ? 'Remote' : undefined);
        const rawDesc = typeof jp.description === 'string' ? jp.description : '';
        const descriptionText = this.stripHtmlToText(rawDesc);
        if (descriptionText.length >= 60) {
          return { title, companyName, location, descriptionText };
        }
      } catch {
        // Ignore malformed JSON-LD blocks
      }
    }
    return null;
  }

  private extractHtmlHeuristic(html: string, finalUrl: string): {
    title: string;
    companyName: string;
    location?: string;
    descriptionText: string;
  } {
    const ogTitle =
      html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i)?.[1] ||
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i)?.[1];
    const ogSite =
      html.match(/<meta[^>]+property=["']og:site_name["'][^>]+content=["']([^"']+)["']/i)?.[1] ||
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:site_name["']/i)?.[1];
    const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1];
    const titleTag = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1];

    const rawTitle = this.stripHtmlToText(ogTitle || h1 || titleTag || 'Target Role');
    let title = rawTitle.slice(0, 140);
    let companyName = this.stripHtmlToText(ogSite || '');

    // Split patterns like "Senior Engineer - Stripe" or "Senior Engineer at Linear"
    if (!companyName && /\s(?:at|@|\||-|–|—)\s/.test(title)) {
      const parts = title.split(/\s(?:at|@|\||-|–|—)\s/);
      if (parts.length >= 2) {
        title = parts[0].trim();
        companyName = parts[1].trim();
      }
    }

    if (!companyName) {
      try {
        const host = new URL(finalUrl).hostname.replace(/^www\.|^jobs\.|^boards\./i, '');
        const label = host.split('.')[0] || 'Target Company';
        companyName = label.charAt(0).toUpperCase() + label.slice(1);
      } catch {
        companyName = 'Target Company';
      }
    }

    // Prefer <main> or <article> body if present, stripping nav/footer/header boilerplate
    const mainBlock =
      html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1] ||
      html.match(/<article\b[^>]*>([\s\S]*?)<\/article>/i)?.[1] ||
      html
        .replace(/<header\b[\s\S]*?<\/header>/gi, ' ')
        .replace(/<footer\b[\s\S]*?<\/footer>/gi, ' ')
        .replace(/<nav\b[\s\S]*?<\/nav>/gi, ' ');

    const descriptionText = this.stripHtmlToText(mainBlock).slice(0, 15000);
    return { title: title || 'Target Role', companyName, descriptionText };
  }

  /**
   * Fetches, parses, sanitizes, and persists a Job Description from a public URL.
   */
  public async fetchAndParseJobUrl(
    userId: string,
    rawUrl: string,
  ): Promise<ParsedJobUrlResult> {
    const validated = await this.validateSafeExternalUrl(rawUrl);
    const normalizedUrl = validated.toString();
    const host = validated.hostname.toLowerCase();

    let title = '';
    let companyName = '';
    let location: string | undefined;
    let descriptionText = '';
    let extractionSource: ParsedJobUrlResult['extractionSource'] = 'html_heuristic';

    // 1. Native Greenhouse Public API (boards.greenhouse.io / job-boards.greenhouse.io)
    const ghMatch = normalizedUrl.match(
      /(?:job-)?boards\.greenhouse\.io\/([^/?#]+)\/jobs\/(\d+)/i,
    );
    if (ghMatch) {
      try {
        const [, board, jobId] = ghMatch;
        const apiUrl = `https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(board)}/jobs/${encodeURIComponent(jobId)}`;
        const ghRes = await this.safeFetchText(apiUrl, 'application/json');
        if (ghRes.status === 200) {
          const data = JSON.parse(ghRes.text);
          if (data?.title && data?.content) {
            title = String(data.title).trim();
            companyName = board.charAt(0).toUpperCase() + board.slice(1);
            location = data.location?.name ? String(data.location.name).trim() : undefined;
            descriptionText = this.stripHtmlToText(String(data.content)).slice(0, 15000);
            extractionSource = 'greenhouse_api';
          }
        }
      } catch {
        // Fall back to HTML/JSON-LD below
      }
    }

    // 2. Native Lever Public API (jobs.lever.co/<board>/<id>)
    const leverMatch = !descriptionText
      ? normalizedUrl.match(/jobs\.lever\.co\/([^/?#]+)\/([a-f0-9-]{8,})/i)
      : null;
    if (leverMatch) {
      try {
        const [, board, postingId] = leverMatch;
        const apiUrl = `https://api.lever.co/v0/postings/${encodeURIComponent(board)}/${encodeURIComponent(postingId)}`;
        const lvRes = await this.safeFetchText(apiUrl, 'application/json');
        if (lvRes.status === 200) {
          const data = JSON.parse(lvRes.text);
          if (data?.text) {
            title = String(data.text).trim();
            companyName = board.charAt(0).toUpperCase() + board.slice(1);
            location = data.categories?.location ? String(data.categories.location).trim() : undefined;
            const listSections = Array.isArray(data.lists)
              ? data.lists.map((l: any) => `${l.text || ''}\n${this.stripHtmlToText(l.content || '')}`).join('\n\n')
              : '';
            descriptionText = [
              this.stripHtmlToText(String(data.description || data.descriptionPlain || '')),
              listSections,
              this.stripHtmlToText(String(data.additional || data.additionalPlain || '')),
            ]
              .filter(Boolean)
              .join('\n\n')
              .slice(0, 15000);
            extractionSource = 'lever_api';
          }
        }
      } catch {
        // Fall back to HTML/JSON-LD below
      }
    }

    // 3. LinkedIn Guest Job API fallback (linkedin.com/jobs/view/<id>)
    const liMatch = !descriptionText && host.includes('linkedin.com')
      ? normalizedUrl.match(/\/jobs\/view\/(?:[^/]*-)?(\d+)/i) ||
        normalizedUrl.match(/currentJobId=(\d+)/i)
      : null;
    if (liMatch) {
      const jobId = liMatch[1];
      try {
        const guestUrl = `https://www.linkedin.com/jobs-guest/jobs/api/jobPosting/${encodeURIComponent(jobId)}`;
        const liRes = await this.safeFetchText(guestUrl);
        if (liRes.status === 200 && liRes.text.length > 200) {
          const extracted = this.extractHtmlHeuristic(liRes.text, normalizedUrl);
          if (extracted.descriptionText.length >= 80) {
            title = extracted.title;
            companyName = extracted.companyName;
            descriptionText = extracted.descriptionText;
            extractionSource = 'linkedin_guest';
          }
        }
      } catch {
        // Handled cleanly below
      }
      if (!descriptionText) {
        throw new BadRequestException(
          'LinkedIn restricts automated fetching on this job link. Copy & paste the job description text directly into chat — I can match and tailor your resume immediately!',
        );
      }
    }

    // 4. General HTML Fetch -> JSON-LD JobPosting -> Semantic HTML Fallback
    if (!descriptionText) {
      const pageRes = await this.safeFetchText(normalizedUrl);
      if (pageRes.status === 403 || pageRes.status === 401 || pageRes.status === 429) {
        throw new BadRequestException(
          `This job site blocked automated access (HTTP ${pageRes.status}). Copy & paste the job description text directly into chat — I will match and tailor your resume immediately.`,
        );
      }
      if (pageRes.status >= 400) {
        throw new BadRequestException(
          `Job posting page returned HTTP ${pageRes.status}. Please check the link or paste the job description text directly.`,
        );
      }

      const jsonLd = this.extractJsonLdJobPosting(pageRes.text);
      if (jsonLd && jsonLd.descriptionText && jsonLd.descriptionText.length >= 60) {
        title = jsonLd.title || 'Target Role';
        companyName = jsonLd.companyName || 'Target Company';
        location = jsonLd.location;
        descriptionText = jsonLd.descriptionText.slice(0, 15000);
        extractionSource = 'json_ld';
      } else {
        const heuristic = this.extractHtmlHeuristic(pageRes.text, pageRes.finalUrl);
        title = heuristic.title;
        companyName = heuristic.companyName;
        descriptionText = heuristic.descriptionText;
        extractionSource = 'html_heuristic';
      }
    }

    if (!descriptionText || descriptionText.trim().length < 60) {
      throw new BadRequestException(
        'Could not extract enough job description text from that URL (the site may require JavaScript login). Copy & paste the JD text directly into chat instead.',
      );
    }

    // Strict Prompt-Injection Defense on all external JD content before storage or LLM consumption
    const sanitizedDesc = PromptSanitizer.sanitizeExternalDocument(descriptionText, 15000);
    const sanitizedTitle = PromptSanitizer.sanitizeExternalDocument(title || 'Target Role', 140);
    const sanitizedCompany = PromptSanitizer.sanitizeExternalDocument(
      companyName || 'Target Company',
      120,
    );
    const sanitizedLocation = location
      ? PromptSanitizer.sanitizeExternalDocument(location, 120).sanitizedText
      : undefined;

    const allDetectedSignals = Array.from(
      new Set([
        ...sanitizedDesc.detectedSignals,
        ...sanitizedTitle.detectedSignals,
        ...sanitizedCompany.detectedSignals,
      ]),
    );
    const totalZeroWidth =
      sanitizedDesc.strippedZeroWidthCount +
      sanitizedTitle.strippedZeroWidthCount +
      sanitizedCompany.strippedZeroWidthCount;
    const wasSanitized =
      sanitizedDesc.wasSanitized || sanitizedTitle.wasSanitized || sanitizedCompany.wasSanitized;

    if (wasSanitized) {
      this.logger.warn(
        `Prompt-injection defense sanitized external JD "${normalizedUrl}" (${extractionSource}): signals=[${allDetectedSignals.join(', ')}], zeroWidth=${totalZeroWidth}`,
      );
    }

    descriptionText = sanitizedDesc.sanitizedText;
    title = sanitizedTitle.sanitizedText || 'Target Role';
    companyName = sanitizedCompany.sanitizedText || 'Target Company';
    location = sanitizedLocation;

    const saved = await this.jobsService.createJobDescription(userId, {
      title,
      companyName,
      originalText: descriptionText,
      sourceUrl: normalizedUrl,
    });

    const workplace = this.inferWorkplace(descriptionText, location);
    this.logger.log(
      `Parsed JD URL (${extractionSource}) -> "${saved.title}" @ "${saved.companyName}" (${descriptionText.length} chars)`,
    );

    return {
      jobDescriptionId: saved.id,
      title: saved.title,
      companyName: saved.companyName || companyName || 'Target Company',
      location,
      workplace,
      applyUrl: normalizedUrl,
      descriptionText,
      extractionSource,
      promptInjectionDefense: {
        sanitized: wasSanitized,
        detectedSignals: allDetectedSignals,
        strippedHiddenHtmlCount: 0,
        strippedZeroWidthCount: totalZeroWidth,
      },
    };
  }
}

