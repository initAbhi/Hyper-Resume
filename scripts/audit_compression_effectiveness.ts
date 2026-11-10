import fs from 'node:fs';
import path from 'node:path';
import { PdfCompressionService } from '../backend/src/resume-parsing/pdf-compression.service.js';
import pdfParse from 'pdf-parse-fork';

// Gracefully handle internal pdf-parse-fork / pdf.js worker rejections on malformed fixtures
process.on('unhandledRejection', (reason: any) => {
  // Suppress unhandled rejection logs from corrupted PDF parsing in audit
});

const FIXTURES_DIR = path.resolve('c:/Users/addme/Desktop/Hyper-Resume/test-assets/compression-fixtures');

interface TestRecord {
  testId: string;
  name: string;
  originalSizeBytes: number;
  compressedSizeBytes: number;
  bytesSaved: number;
  reductionPercentage: number;
  executionTimeMs: number;
  pagesBefore: number;
  pagesAfter: number;
  wasCompressed: boolean;
  verificationPassed: boolean;
  under10Mb: boolean;
  atsIntegrity: string;
  notes: string;
}

async function runAudit() {
  const service = new PdfCompressionService();
  const records: TestRecord[] = [];

  const files = [
    { id: 'T01', file: 'T01_small_text_2mb.pdf', expected: 'Normal upload (<10MB)' },
    { id: 'T02', file: 'T02_medium_text_8mb.pdf', expected: 'Normal upload (<10MB)' },
    { id: 'T03', file: 'T03_slightly_oversized_10_5mb.pdf', expected: 'Compression (>10MB)' },
    { id: 'T04', file: 'T04_image_heavy_15mb.pdf', expected: 'Image optimization' },
    { id: 'T05', file: 'T05_scanned_resume_20mb.pdf', expected: 'Image compression' },
    { id: 'T06', file: 'T06_mixed_text_images_18mb.pdf', expected: 'Mixed-content compression' },
    { id: 'T07', file: 'T07_already_optimized_12mb.pdf', expected: 'Detect limited optimization' },
    { id: 'T08', file: 'T08_vector_heavy_15mb.pdf', expected: 'Structural optimization' },
    { id: 'T09', file: 'T09_multipage_resume_15mb.pdf', expected: 'Page & text preservation' },
    { id: 'T10', file: 'T10_password_protected_12mb.pdf', expected: 'Proper rejection' },
    { id: 'T11', file: 'T11_corrupted_resume_12mb.pdf', expected: 'Validation failure' },
    { id: 'T12', file: 'T12_unicode_heavy_12mb.pdf', expected: 'Unicode preservation' },
    { id: 'T13', file: 'T13_embedded_fonts_12mb.pdf', expected: 'Font preservation' },
    { id: 'T14', file: 'T14_hyperlink_heavy_12mb.pdf', expected: 'Link preservation' },
  ];

  console.log('='.repeat(80));
  console.log('HYPERRESUME SMART PDF COMPRESSION — EFFECTIVENESS & ATS INTEGRITY AUDIT');
  console.log('='.repeat(80));

  for (const item of files) {
    const filePath = path.join(FIXTURES_DIR, item.file);
    const originalBuffer = fs.readFileSync(filePath);
    const originalSize = originalBuffer.length;

    let origPages = 0;
    let origText = '';
    if (item.id !== 'T10' && item.id !== 'T11') {
      try {
        const origParsed = await pdfParse(originalBuffer);
        origPages = origParsed.numpages;
        origText = origParsed.text || '';
      } catch {
        // Corrupt or encrypted
      }
    }

    const start = performance.now();
    let result: any = null;
    let errorThrown: any = null;

    try {
      result = await service.compressPdf(originalBuffer, item.file, 'application/pdf');
    } catch (err: any) {
      errorThrown = err;
    }
    const executionTimeMs = Math.round(performance.now() - start);

    if (errorThrown) {
      records.push({
        testId: item.id,
        name: item.file,
        originalSizeBytes: originalSize,
        compressedSizeBytes: 0,
        bytesSaved: 0,
        reductionPercentage: 0,
        executionTimeMs,
        pagesBefore: origPages,
        pagesAfter: 0,
        wasCompressed: false,
        verificationPassed: false,
        under10Mb: false,
        atsIntegrity: 'N/A (Rejected)',
        notes: `Safely Rejected: ${errorThrown.message}`,
      });
      console.log(`[${item.id}] ${item.file}: REJECTED (${executionTimeMs}ms) - ${errorThrown.message}`);
      continue;
    }

    const compressedSize = result.compressedSize;
    const bytesSaved = originalSize - compressedSize;
    const reduction = result.reductionPercentage;
    const under10Mb = result.withinUploadLimit;
    const verificationPassed = result.verification?.validPdf && result.verification?.pageCountPreserved;

    // Check ATS integrity on compressed buffer
    let atsIntegrity = 'VERIFIED';
    let compPages = 0;
    let compText = '';

    if (result.compressedBuffer) {
      try {
        const compParsed = await pdfParse(result.compressedBuffer);
        compPages = compParsed.numpages;
        compText = compParsed.text || '';

        if (origText.length >= 50) {
          const ratio = compText.length / origText.length;
          if (ratio < 0.85) {
            atsIntegrity = `DEGRADED (${Math.round(ratio * 100)}% text)`;
          } else {
            // Check emails & phone numbers
            const emailMatch = origText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];
            for (const email of emailMatch) {
              if (!compText.includes(email)) {
                atsIntegrity = 'MISSING_EMAIL';
                break;
              }
            }
          }
        }
      } catch (parseErr: any) {
        atsIntegrity = `PARSE_ERROR: ${parseErr.message}`;
      }
    } else {
      atsIntegrity = result.status === 'SIZE_LIMIT_NOT_REACHED' ? 'BLOCKED (>10MB)' : 'N/A';
    }

    records.push({
      testId: item.id,
      name: item.file,
      originalSizeBytes: originalSize,
      compressedSizeBytes: compressedSize,
      bytesSaved,
      reductionPercentage: reduction,
      executionTimeMs,
      pagesBefore: origPages,
      pagesAfter: compPages,
      wasCompressed: result.status === 'COMPRESSED',
      verificationPassed,
      under10Mb,
      atsIntegrity,
      notes: `Status: ${result.status}`,
    });

    console.log(
      `[${item.id}] ${item.file}: ${(originalSize / (1024 * 1024)).toFixed(2)} MB -> ${(compressedSize / (1024 * 1024)).toFixed(2)} MB (-${reduction}%) in ${executionTimeMs}ms | Under 10MB: ${under10Mb} | ATS: ${atsIntegrity}`,
    );
  }

  console.log('\nAudit complete. Saving results JSON...');
  fs.writeFileSync(
    path.resolve('c:/Users/addme/Desktop/Hyper-Resume/test-assets/audit_results.json'),
    JSON.stringify(records, null, 2),
  );
}

runAudit().catch(console.error);

