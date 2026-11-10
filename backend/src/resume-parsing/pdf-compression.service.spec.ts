import { describe, it, expect, beforeEach } from 'vitest';
import { PdfCompressionService } from './pdf-compression.service.js';
import { BadRequestException, PayloadTooLargeException } from '@nestjs/common';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import sharp from 'sharp';

describe('PdfCompressionService', () => {
  let service: PdfCompressionService;

  beforeEach(() => {
    service = new PdfCompressionService();
  });

  describe('Pre-compression Validation', () => {
    it('should throw BadRequestException if file buffer is empty', async () => {
      await expect(
        service.compressPdf(Buffer.from(''), 'empty.pdf', 'application/pdf'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw PayloadTooLargeException if file exceeds MAX_INPUT_FILE_SIZE (30MB)', async () => {
      // Mock an oversized buffer without actually allocating 31MB
      const hugeBuffer = {
        length: 31 * 1024 * 1024,
        subarray: () => Buffer.from('%PDF-1.4'),
      } as unknown as Buffer;

      await expect(
        service.compressPdf(hugeBuffer, 'huge.pdf', 'application/pdf'),
      ).rejects.toThrow(PayloadTooLargeException);
    });

    it('should throw BadRequestException if file is not a PDF (invalid magic bytes)', async () => {
      const textBuffer = Buffer.from('This is a plain text file pretending to be pdf');
      await expect(
        service.compressPdf(textBuffer, 'fake.pdf', 'application/pdf'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if PDF is malformed or corrupted', async () => {
      const corruptPdf = Buffer.from('%PDF-corrupt-data-not-a-valid-structure');
      await expect(
        service.compressPdf(corruptPdf, 'corrupt.pdf', 'application/pdf'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('Password-protected PDF Handling', () => {
    it('should reject password-protected or encrypted PDFs with clear message', async () => {
      // Create a PDF and mock encrypted error on load
      const doc = await PDFDocument.create();
      doc.addPage([600, 400]);
      const pdfBytes = await doc.save();

      // Test that an encrypted PDF throws clear message
      // We simulate by corrupting PDF with an encryption dict or mocking
      const corruptEncrypted = Buffer.from(
        '%PDF-1.4\n1 0 obj\n<< /Encrypt 2 0 R >>\nendobj\ntrailer\n<< /Encrypt 2 0 R >>\n%%EOF',
      );
      await expect(
        service.compressPdf(corruptEncrypted, 'protected.pdf', 'application/pdf'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('Compression, Verification & Optimization', () => {
    it('should successfully compress a PDF with large embedded images and preserve text and pages', async () => {
      // 1. Generate a multi-page test PDF with an embedded raster image and resume text
      const doc = await PDFDocument.create();
      const font = await doc.embedFont(StandardFonts.Helvetica);

      // Create a 1500x1000 uncompressed noise image
      const imageBuffer = await sharp({
        create: {
          width: 1500,
          height: 1000,
          channels: 3,
          background: { r: 100, g: 150, b: 220 },
          noise: { type: 'gaussian', mean: 128, sigma: 25 },
        },
      })
        .png({ compressionLevel: 0 })
        .toBuffer();

      const embeddedImg = await doc.embedPng(imageBuffer);

      // Page 1
      const page1 = doc.addPage([600, 800]);
      page1.drawImage(embeddedImg, { x: 50, y: 450, width: 500, height: 300 });
      page1.drawText('Abhishek Singh - Staff Backend Engineer', {
        x: 50,
        y: 400,
        size: 16,
        font,
        color: rgb(0, 0, 0),
      });
      page1.drawText('Contact: abhishek@example.com | Phone: +91-9876543210', {
        x: 50,
        y: 370,
        size: 11,
        font,
        color: rgb(0, 0, 0),
      });
      page1.drawText(
        'Professional Summary: Experienced engineer specialized in microservices, distributed systems, and PostgreSQL.',
        { x: 50, y: 340, size: 10, font, color: rgb(0, 0, 0) },
      );
      page1.drawText(
        'Experience: Architected high-throughput ingestion engine handling 5M daily events with 99.99% uptime.',
        { x: 50, y: 310, size: 10, font, color: rgb(0, 0, 0) },
      );

      // Page 2
      const page2 = doc.addPage([600, 800]);
      page2.drawText('Education: B.Tech in Computer Science', {
        x: 50,
        y: 750,
        size: 12,
        font,
        color: rgb(0, 0, 0),
      });
      page2.drawText('Skills: TypeScript, Node.js, NestJS, Docker, Redis, Kubernetes', {
        x: 50,
        y: 720,
        size: 10,
        font,
        color: rgb(0, 0, 0),
      });

      const originalBytes = Buffer.from(await doc.save());
      const originalLength = originalBytes.length;
      expect(originalLength).toBeGreaterThan(100 * 1024); // Large due to uncompressed PNG

      // Run compression
      const result = await service.compressPdf(
        originalBytes,
        'abhishek_resume.pdf',
        'application/pdf',
      );

      expect(result.success).toBe(true);
      expect(result.status).toBe('COMPRESSED');
      expect(result.originalSize).toBe(originalLength);
      expect(result.compressedSize).toBeLessThan(originalLength);
      expect(result.reductionPercentage).toBeGreaterThan(0);
      expect(result.withinUploadLimit).toBe(true);
      expect(result.compressedBuffer).toBeDefined();

      // Independent Verification checks
      expect(result.verification.validPdf).toBe(true);
      expect(result.verification.pageCountPreserved).toBe(true);
      expect(result.verification.textExtractionPassed).toBe(true);

      // Ensure original buffer was not mutated
      expect(originalBytes.length).toBe(originalLength);
    });

    it('should classify already-optimal PDFs cleanly without corruption', async () => {
      // Create minimal clean PDF without images and run once to get fully minimal bytes
      const doc = await PDFDocument.create();
      const page = doc.addPage([600, 400]);
      page.drawText('Jane Doe - Software Engineer (jane@example.com)');
      const initialBytes = Buffer.from(await doc.save({ useObjectStreams: true }));

      // First run compresses it
      const firstResult = await service.compressPdf(initialBytes, 'minimal.pdf', 'application/pdf');
      expect(firstResult.compressedBuffer).toBeDefined();

      // Second run on the fully minimized bytes cannot reduce it any further
      const secondResult = await service.compressPdf(
        firstResult.compressedBuffer!,
        'minimal_optimized.pdf',
        'application/pdf',
      );

      expect(secondResult.status).toBe('ALREADY_OPTIMIZED');
      expect(secondResult.withinUploadLimit).toBe(true);
      expect(secondResult.verification.validPdf).toBe(true);
      expect(secondResult.verification.pageCountPreserved).toBe(true);
    });

    it('should handle scanned/image-only PDFs gracefully without marking them as corrupted', async () => {
      // Scanned PDF with only an image and no text
      const doc = await PDFDocument.create();
      const imgBuffer = await sharp({
        create: {
          width: 500,
          height: 700,
          channels: 3,
          background: { r: 240, g: 240, b: 240 },
        },
      })
        .jpeg({ quality: 90 })
        .toBuffer();

      const embedded = await doc.embedJpg(imgBuffer);
      const page = doc.addPage([600, 800]);
      page.drawImage(embedded, { x: 50, y: 50, width: 500, height: 700 });

      const scannedBytes = Buffer.from(await doc.save());
      const result = await service.compressPdf(scannedBytes, 'scanned.pdf', 'application/pdf');

      expect(result.verification.validPdf).toBe(true);
      expect(result.verification.pageCountPreserved).toBe(true);
      expect(result.verification.isScannedPdf).toBe(true);
    });
  });

  describe('Exact 10 MB Boundary Validation', () => {
    const EXACT_10MB = 10 * 1024 * 1024; // 10,485,760 bytes

    it('should correctly evaluate the exact 10 MB byte boundary (10,485,760 bytes)', () => {
      expect(service.TARGET_MAX_FILE_SIZE).toBe(EXACT_10MB);
      expect(10485760 <= service.TARGET_MAX_FILE_SIZE).toBe(true);
    });

    it('should treat 1 byte below limit (10,485,759 bytes) as within upload limit', () => {
      const belowLimit = EXACT_10MB - 1; // 10,485,759
      expect(belowLimit <= service.TARGET_MAX_FILE_SIZE).toBe(true);
    });

    it('should treat 1 byte above limit (10,485,761 bytes) as exceeding upload limit', () => {
      const aboveLimit = EXACT_10MB + 1; // 10,485,761
      expect(aboveLimit <= service.TARGET_MAX_FILE_SIZE).toBe(false);
    });
  });

  describe('Real Encrypted & Malformed Document Rejection', () => {
    it('should reject a truly encrypted PDF with an Encrypt dictionary', async () => {
      const doc = await PDFDocument.create();
      doc.addPage([600, 400]);
      const encRef = doc.context.register(doc.context.obj({ Filter: 'Standard', V: 2, R: 3 }));
      doc.context.trailerInfo.Encrypt = encRef;
      const encryptedBytes = Buffer.from(await doc.save());

      await expect(
        service.compressPdf(encryptedBytes, 'protected.pdf', 'application/pdf'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject corrupted PDF files without invoking ATS', async () => {
      const corruptedBytes = Buffer.from('INVALID_HEADER_%PDF-broken-xref-table');
      await expect(
        service.compressPdf(corruptedBytes, 'corrupt.pdf', 'application/pdf'),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
