import { describe, expect, it, afterAll } from 'vitest';
import { BadRequestException } from '@nestjs/common';
import pdfParse from 'pdf-parse-fork';
import { PdfExportService } from './pdf-export.service.js';

describe('PdfExportService', () => {
  const mockConfig = {
    get: (key: string, defaultVal?: string) => {
      if (key === 'FRONTEND_URL') return 'http://localhost:3000';
      return defaultVal;
    },
  } as any;

  const service = new PdfExportService(mockConfig);

  afterAll(async () => {
    await service.onModuleDestroy();
  });

  describe('sanitizeMarkup', () => {
    it('strips scripts, iframes, event handlers, and javascript: URIs', () => {
      const dirtyHtml = `
        <div id="resume-document-print" onclick="alert(1)">
          <script>window.evil = true;</script>
          <iframe src="https://evil.example"></iframe>
          <a href="javascript:alert(2)">Bad Link</a>
          <a href="https://linkedin.com/in/alex">Good Link</a>
        </div>
      `;
      const dirtyStyles = `body { color: #111; } </style><script>alert(3)</script>`;

      const { html, styles } = service.sanitizeMarkup(dirtyHtml, dirtyStyles);

      expect(html).not.toContain('<script');
      expect(html).not.toContain('<iframe');
      expect(html).not.toContain('onclick=');
      expect(html).not.toContain('javascript:alert');
      expect(html).toContain('https://linkedin.com/in/alex');
      expect(styles).not.toContain('</style>');
    });

    it('throws BadRequestException on empty HTML', () => {
      expect(() => service.sanitizeMarkup('   ')).toThrow(BadRequestException);
    });
  });

  describe('buildPrintDocument', () => {
    it('configures US Letter page size when requested and enables strict CSP', () => {
      const doc = service.buildPrintDocument({
        html: '<div id="resume-document-print"><h1>Alex</h1></div>',
        styles: '.foo { color: red; }',
        pageSize: 'US Letter',
        fileName: 'Alex/Resume?.pdf',
      });

      expect(doc).toContain("script-src 'none'");
      expect(doc).toContain('size: letter portrait');
      expect(doc).toContain('width: 215.9mm');
      expect(doc).toContain('<title>Alex-Resume-.pdf</title>');
    });
  });

  describe('generateVectorPdf', () => {
    it('generates a valid vector PDF with extractable ATS text (not a raster image)', async () => {
      const result = await service.generateVectorPdf({
        html: `
          <div id="resume-document-print">
            <div class="resume-page-a4">
              <header>
                <h1>ALEXANDER SHARMA</h1>
                <p>Senior Full Stack Engineer | Distributed Systems</p>
                <a href="https://linkedin.com/in/alexandersharma">linkedin.com/in/alexandersharma</a>
              </header>
              <section>
                <h2>Experience</h2>
                <ul>
                  <li>Architected event-driven microservices handling 25,000 RPS at 99.98% uptime.</li>
                  <li>Reduced p95 latency by 42% using PostgreSQL read replicas and Redis caching.</li>
                </ul>
              </section>
            </div>
          </div>
        `,
        styles: '.resume-page-a4 { padding: 24px; font-family: sans-serif; }',
        pageSize: 'A4',
        fileName: 'Alexander Sharma ATS Test',
      });

      expect(result.buffer.subarray(0, 5).toString('ascii')).toBe('%PDF-');
      expect(result.atsVerified).toBe(true);
      expect(result.extractableChars).toBeGreaterThan(150);
      expect(result.extractableWords).toBeGreaterThan(20);
      expect(result.pageCount).toBe(1);

      // Verify exact text matches with pdf-parse-fork
      const reparsed = await pdfParse(result.buffer);
      expect(reparsed.text).toContain('ALEXANDER SHARMA');
      expect(reparsed.text).toContain('25,000 RPS');
      expect(reparsed.text).toContain('PostgreSQL');
    }, 20000);
  });
});

