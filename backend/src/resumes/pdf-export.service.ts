import {
  BadRequestException,
  Injectable,
  Logger,
  OnModuleDestroy,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import fs from 'node:fs';
import puppeteer, { type Browser } from 'puppeteer-core';
import pdfParse from 'pdf-parse-fork';
import type { ExportPdfDto } from './dto/export-pdf.dto.js';

export interface VectorPdfExportResult {
  buffer: Buffer;
  fileName: string;
  pageCount: number;
  sizeBytes: number;
  extractableChars: number;
  extractableWords: number;
  atsVerified: boolean;
}

const CHROME_CANDIDATE_PATHS: string[] = [
  // Linux / Production VPS
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
  '/snap/bin/chromium',
  // macOS
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  // Windows
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
];

@Injectable()
export class PdfExportService implements OnModuleDestroy {
  private readonly logger = new Logger(PdfExportService.name);
  private browser: Browser | null = null;
  private browserLaunchPromise: Promise<Browser> | null = null;

  constructor(private readonly configService: ConfigService) {}

  async onModuleDestroy(): Promise<void> {
    if (this.browser) {
      try {
        await this.browser.close();
      } catch {
        // Ignore shutdown errors
      }
      this.browser = null;
    }
  }

  /**
   * Resolves a local Chromium, Chrome, or Edge executable path across Windows, macOS, and Linux.
   */
  public resolveExecutablePath(): string {
    const envPath =
      this.configService.get<string>('CHROME_PATH') ||
      this.configService.get<string>('PUPPETEER_EXECUTABLE_PATH') ||
      process.env.CHROME_PATH ||
      process.env.PUPPETEER_EXECUTABLE_PATH;

    if (envPath && fs.existsSync(envPath)) {
      return envPath;
    }

    for (const candidate of CHROME_CANDIDATE_PATHS) {
      if (fs.existsSync(candidate)) {
        return candidate;
      }
    }

    throw new ServiceUnavailableException(
      'Vector PDF rendering engine (Chrome/Chromium) is not configured on this server. Set CHROME_PATH in backend environment.',
    );
  }

  /**
   * Strips executable scripts, event handlers, and unsafe URLs from HTML markup and CSS.
   */
  public sanitizeMarkup(rawHtml: string, rawStyles = ''): { html: string; styles: string } {
    if (!rawHtml || !rawHtml.trim()) {
      throw new BadRequestException('Resume HTML content cannot be empty.');
    }

    const html = rawHtml
      .replace(/<script\b[\s\S]*?>[\s\S]*?<\/script>/gi, '')
      .replace(/<(iframe|object|embed|applet|base|meta)\b[\s\S]*?(?:>[\s\S]*?<\/\1>|\/?>)/gi, '')
      .replace(/\son[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
      .replace(/(href|src|xlink:href)\s*=\s*(["'])\s*(?:javascript|vbscript):[^"']*\2/gi, '$1=$2#$2');

    const styles = (rawStyles || '')
      .replace(/<\/style>/gi, '')
      .replace(/@import\s+url\s*\(\s*["']?(?:javascript:|vbscript:|file:|http:\/\/169\.254\.)[^)]*\)\s*;?/gi, '')
      .replace(/expression\s*\([^)]*\)/gi, '');

    return { html, styles };
  }

  /**
   * Builds a self-contained, print-ready HTML document enforcing ATS page geometry.
   */
  public buildPrintDocument(dto: ExportPdfDto): string {
    const { html, styles } = this.sanitizeMarkup(dto.html, dto.styles || '');
    const isLetter = dto.pageSize === 'US Letter';
    const cssPageSize = isLetter ? 'letter portrait' : 'A4 portrait';
    const pageWidthMm = isLetter ? '215.9mm' : '210mm';
    const pageHeightMm = isLetter ? '279.4mm' : '297mm';

    const safeHtmlClass = (dto.htmlClassName || '').replace(/[^a-zA-Z0-9_\-\s]/g, '').replace(/\bdark\b/g, '');
    const safeRootStyle = (dto.rootStyle || '')
      .replace(/<\/?[a-z][^>]*>/gi, '')
      .replace(/url\s*\([^)]*\)/gi, '');

    const frontendOrigin = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000');

    return `<!DOCTYPE html>
<html lang="en" class="${safeHtmlClass}" style="${safeRootStyle}">
<head>
  <meta charset="utf-8" />
  <meta http-equiv="Content-Security-Policy" content="default-src 'self' data: blob: https: ${frontendOrigin} http://localhost:3000; script-src 'none'; object-src 'none'; style-src 'unsafe-inline' data: https: ${frontendOrigin} http://localhost:3000;" />
  <title>${this.sanitizeFileName(dto.fileName || 'Resume')}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Rubik:wght@500;600;700;800&display=swap" rel="stylesheet" />
  <style>
${styles}
  </style>
  <style id="hyperresume-vector-pdf-overrides">
    @page {
      size: ${cssPageSize};
      margin: 0mm !important;
    }

    html, body {
      background: #ffffff !important;
      color: #111827;
      margin: 0 !important;
      padding: 0 !important;
      width: ${pageWidthMm} !important;
      height: auto !important;
      overflow: visible !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    .print\\:hidden,
    [data-export-exclude="true"] {
      display: none !important;
    }

    #resume-document-print {
      width: ${pageWidthMm} !important;
      max-width: ${pageWidthMm} !important;
      margin: 0 auto !important;
      padding: 0 !important;
      background: #ffffff !important;
      border: none !important;
      box-shadow: none !important;
    }

    /* Single-flow templates: remove artificial gap and allow clean multi-page flow */
    .resume-page-a4 {
      box-shadow: none !important;
      border: none !important;
      border-radius: 0 !important;
      margin: 0 auto !important;
      width: ${pageWidthMm} !important;
      max-width: ${pageWidthMm} !important;
      min-height: ${pageHeightMm} !important;
      justify-content: flex-start !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    .resume-page-a4:not(#resume-page-1):not(#resume-page-2) {
      height: auto !important;
      max-height: none !important;
      overflow: visible !important;
      -webkit-box-decoration-break: clone;
      box-decoration-break: clone;
    }

    /* Explicit 2-page templates keep fixed page bounds and footer alignment */
    #resume-page-1,
    #resume-page-2 {
      height: ${pageHeightMm} !important;
      max-height: ${pageHeightMm} !important;
      overflow: hidden !important;
      justify-content: space-between !important;
      page-break-after: always !important;
      break-after: page !important;
    }

    #resume-page-1:last-child,
    #resume-page-2:last-child {
      page-break-after: avoid !important;
      break-after: avoid !important;
    }

    .ats-keyword-highlight,
    mark {
      background: transparent !important;
      background-color: transparent !important;
      border: none !important;
      padding: 0 !important;
      color: inherit !important;
      font-weight: inherit !important;
      box-shadow: none !important;
    }

    a {
      text-decoration: none;
    }
  </style>
</head>
<body>
${html}
</body>
</html>`;
  }

  public sanitizeFileName(rawName: string): string {
    const cleaned = (rawName || 'Resume')
      .replace(/\.pdf$/i, '')
      .trim()
      .replace(/[/\\?%*:|"<>]/g, '-')
      .slice(0, 140);
    return `${cleaned || 'Resume'}.pdf`;
  }

  private async getBrowser(): Promise<Browser> {
    if (this.browser && this.browser.connected) {
      return this.browser;
    }

    if (this.browserLaunchPromise) {
      return this.browserLaunchPromise;
    }

    const executablePath = this.resolveExecutablePath();
    this.browserLaunchPromise = puppeteer
      .launch({
        executablePath,
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--font-render-hinting=none',
        ],
      })
      .then((browser) => {
        this.browser = browser;
        browser.on('disconnected', () => {
          if (this.browser === browser) {
            this.browser = null;
          }
        });
        return browser;
      })
      .finally(() => {
        this.browserLaunchPromise = null;
      });

    return this.browserLaunchPromise;
  }

  private isAllowedExternalUrl(urlString: string): boolean {
    if (urlString.startsWith('data:') || urlString.startsWith('blob:')) {
      return true;
    }
    try {
      const parsed = new URL(urlString);
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        return false;
      }
      const host = parsed.hostname.toLowerCase();
      const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000');
      const allowedFrontendHost = new URL(frontendUrl).hostname.toLowerCase();

      // Permit local frontend static fonts/assets, block other private/metadata IP SSRF targets
      if (host === allowedFrontendHost || host === 'localhost' || host === '127.0.0.1') {
        return parsed.port === '' || parsed.port === '3000' || parsed.port === '3082';
      }
      if (
        host === 'metadata.google.internal' ||
        host.startsWith('169.254.') ||
        host.startsWith('10.') ||
        host.startsWith('192.168.') ||
        /^172\.(1[6-9]|2\d|3[01])\./.test(host) ||
        host === '[::1]'
      ) {
        return false;
      }
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Generates a 100% vector, ATS-parseable PDF and verifies extractable text via pdf-parse-fork.
   */
  async generateVectorPdf(dto: ExportPdfDto): Promise<VectorPdfExportResult> {
    const startTime = Date.now();
    const documentHtml = this.buildPrintDocument(dto);
    const fileName = this.sanitizeFileName(dto.fileName || 'Resume');
    const isLetter = dto.pageSize === 'US Letter';

    const browser = await this.getBrowser();
    const page = await browser.newPage();

    try {
      await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 1 });
      await page.setRequestInterception(true);

      page.on('request', (req) => {
        if (this.isAllowedExternalUrl(req.url())) {
          req.continue().catch(() => {});
        } else {
          this.logger.warn(`Blocked disallowed PDF asset request: ${req.url()}`);
          req.abort().catch(() => {});
        }
      });

      await page.setContent(documentHtml, {
        waitUntil: 'load',
        timeout: 10000,
      }).catch(async () => {
        // Fallback if an external avatar/font times out: continue with loaded DOM
        await page.setContent(documentHtml, { waitUntil: 'domcontentloaded', timeout: 6000 });
      });

      await page.waitForNetworkIdle({ idleTime: 250, timeout: 4000 }).catch(() => {});

      await page.emulateMediaType('print');

      const pdfUint8 = await page.pdf({
        format: isLetter ? 'Letter' : 'A4',
        printBackground: true,
        preferCSSPageSize: true,
        margin: { top: '0mm', right: '0mm', bottom: '0mm', left: '0mm' },
        tagged: true,
      });

      const buffer = Buffer.from(pdfUint8);

      // Independent ATS text layer verification using pdf-parse-fork
      let extractableChars = 0;
      let extractableWords = 0;
      let pageCount = 1;

      try {
        const parsed = await pdfParse(buffer);
        const text = (parsed.text || '').trim();
        extractableChars = text.length;
        extractableWords = text ? text.split(/\s+/).length : 0;
        pageCount = parsed.numpages || 1;
      } catch (parseErr: any) {
        this.logger.warn(`PDF text verification warning: ${parseErr?.message}`);
      }

      const atsVerified = extractableChars > 20;

      this.logger.log(
        `Generated vector PDF "${fileName}" (${buffer.length} bytes, ${pageCount} pages, ${extractableWords} ATS words) in ${Date.now() - startTime}ms`,
      );

      return {
        buffer,
        fileName,
        pageCount,
        sizeBytes: buffer.length,
        extractableChars,
        extractableWords,
        atsVerified,
      };
    } finally {
      await page.close().catch(() => {});
    }
  }
}
