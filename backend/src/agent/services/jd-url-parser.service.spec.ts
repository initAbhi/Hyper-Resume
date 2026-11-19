import { describe, expect, it, vi, beforeEach } from 'vitest';
import { JdUrlParserService } from './jd-url-parser.service.js';

describe('JdUrlParserService', () => {
  let service: JdUrlParserService;
  let mockJobsService: any;

  beforeEach(() => {
    mockJobsService = {
      createJobDescription: vi.fn().mockImplementation((_userId, dto) =>
        Promise.resolve({
          id: 'jd-uuid-1',
          title: dto.title,
          companyName: dto.companyName,
          originalText: dto.originalText,
        }),
      ),
    };
    service = new JdUrlParserService(mockJobsService);
  });

  describe('SSRF Protection (isPrivateOrReservedIp & validateSafeExternalUrl)', () => {
    it('identifies loopback, private RFC1918, cloud metadata, and IPv6 local addresses as reserved', () => {
      const blockedIps = [
        '127.0.0.1',
        '127.10.20.30',
        '10.0.0.5',
        '172.16.0.1',
        '172.31.255.254',
        '192.168.1.1',
        '169.254.169.254',
        '100.64.0.1',
        '0.0.0.0',
        '224.0.0.1',
        '::1',
        '::',
        '::ffff:127.0.0.1',
        '::ffff:169.254.169.254',
        'fe80::1',
        'fc00::1',
        'fd12:3456:789a::1',
      ];
      for (const ip of blockedIps) {
        expect(service.isPrivateOrReservedIp(ip)).toBe(true);
      }

      const publicIps = ['8.8.8.8', '1.1.1.1', '142.250.190.78', '172.32.0.1', '2606:4700:4700::1111'];
      for (const ip of publicIps) {
        expect(service.isPrivateOrReservedIp(ip)).toBe(false);
      }
    });

    it('rejects localhost, cloud metadata, private IPs, file://, and credentialed URLs', async () => {
      const dangerousUrls = [
        'http://localhost:3001/api/v1/health',
        'http://sub.localhost/admin',
        'http://127.0.0.1:5432/',
        'http://169.254.169.254/latest/meta-data/',
        'http://metadata.google.internal/computeMetadata/v1/',
        'http://10.0.0.1/internal',
        'http://192.168.0.1/router',
        'http://[::1]:3000/',
        'http://[::ffff:127.0.0.1]/',
        'file:///etc/passwd',
        'ftp://example.com/job.txt',
        'https://user:pass@boards.greenhouse.io/acme/jobs/123',
        'not-a-valid-url',
      ];

      for (const url of dangerousUrls) {
        await expect(service.validateSafeExternalUrl(url)).rejects.toThrow();
      }
    });
  });

  describe('Structured Job Extraction', () => {
    it('extracts JSON-LD JobPosting fields and persists via JobsService', async () => {
      const jsonLdHtml = `<!doctype html>
      <html>
        <head>
          <title>Senior Backend Engineer - Acme Corp</title>
          <script type="application/ld+json">
            {
              "@context": "https://schema.org/",
              "@type": "JobPosting",
              "title": "Senior Backend Engineer",
              "hiringOrganization": { "@type": "Organization", "name": "Acme Corp" },
              "jobLocationType": "TELECOMMUTE",
              "description": "<p>Build distributed TypeScript and PostgreSQL services handling 50k RPS. Requirements: 5+ years Node.js, NestJS, Redis, AWS, Docker, Kubernetes, and observability.</p>"
            }
          </script>
        </head>
        <body><h1>Senior Backend Engineer</h1></body>
      </html>`;

      vi.spyOn(service, 'validateSafeExternalUrl').mockResolvedValueOnce(
        new URL('https://careers.acme.example/jobs/senior-backend'),
      );
      vi.spyOn(service, 'safeFetchText').mockResolvedValueOnce({
        text: jsonLdHtml,
        finalUrl: 'https://careers.acme.example/jobs/senior-backend',
        contentType: 'text/html',
        status: 200,
      });

      const result = await service.fetchAndParseJobUrl(
        'user-1',
        'https://careers.acme.example/jobs/senior-backend',
      );

      expect(result.extractionSource).toBe('json_ld');
      expect(result.title).toBe('Senior Backend Engineer');
      expect(result.companyName).toBe('Acme Corp');
      expect(result.workplace).toBe('Remote');
      expect(result.descriptionText).toContain('distributed TypeScript and PostgreSQL');
      expect(result.jobDescriptionId).toBe('jd-uuid-1');
      expect(mockJobsService.createJobDescription).toHaveBeenCalledTimes(1);
    });

    it('falls back to HTML semantic extraction when no JSON-LD is present', async () => {
      const html = `<!doctype html>
      <html>
        <head><title>Staff Frontend Engineer at Orbit Labs</title></head>
        <body>
          <nav>Home Careers Blog</nav>
          <main>
            <h1>Staff Frontend Engineer</h1>
            <p>We are hiring a Staff Frontend Engineer (Hybrid in New York) to lead our React, Next.js, TypeScript, and Design System architecture across web applications serving millions of users.</p>
            <p>Qualifications: Strong experience with React 19, WCAG accessibility, Core Web Vitals optimization, and GraphQL APIs.</p>
          </main>
          <footer>Copyright Orbit Labs</footer>
        </body>
      </html>`;

      vi.spyOn(service, 'validateSafeExternalUrl').mockResolvedValueOnce(
        new URL('https://orbitlabs.example/careers/staff-frontend'),
      );
      vi.spyOn(service, 'safeFetchText').mockResolvedValueOnce({
        text: html,
        finalUrl: 'https://orbitlabs.example/careers/staff-frontend',
        contentType: 'text/html',
        status: 200,
      });

      const result = await service.fetchAndParseJobUrl(
        'user-1',
        'https://orbitlabs.example/careers/staff-frontend',
      );

      expect(result.extractionSource).toBe('html_heuristic');
      expect(result.title).toContain('Staff Frontend Engineer');
      expect(result.workplace).toBe('Hybrid');
      expect(result.descriptionText).toContain('React 19');
      expect(result.jobDescriptionId).toBe('jd-uuid-1');
    });
  });
});
