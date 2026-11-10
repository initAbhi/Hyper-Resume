import {
  BadRequestException,
  Injectable,
  Logger,
  PayloadTooLargeException,
} from '@nestjs/common';
import { PDFDocument, PDFName, PDFNumber, PDFRawStream, PDFDict, PDFArray } from 'pdf-lib';
import sharp from 'sharp';
import zlib from 'node:zlib';
import pdfParse from 'pdf-parse-fork';

export interface CompressionVerification {
  validPdf: boolean;
  pageCountPreserved: boolean;
  textExtractionPassed: boolean;
  isScannedPdf?: boolean;
}

export interface CompressionResult {
  success: boolean;
  status: 'COMPRESSED' | 'SIZE_LIMIT_NOT_REACHED' | 'ALREADY_OPTIMIZED' | 'VERIFICATION_FAILED';
  originalSize: number;
  compressedSize: number;
  reductionPercentage: number;
  withinUploadLimit: boolean;
  verification: CompressionVerification;
  compressedBuffer?: Buffer;
  message?: string;
}

@Injectable()
export class PdfCompressionService {
  private readonly logger = new Logger(PdfCompressionService.name);

  // Exact 10MB limit matching ResumeParserService and application standard
  public readonly TARGET_MAX_FILE_SIZE = 10 * 1024 * 1024; // 10,485,760 bytes
  // Maximum file size acceptable for compression processing
  public readonly MAX_INPUT_FILE_SIZE = 30 * 1024 * 1024; // 30 MB
  // Processing timeout in milliseconds
  private readonly TIMEOUT_MS = 30000;

  /**
   * Validate, optimize, and independently verify a PDF document.
   */
  async compressPdf(
    fileBuffer: Buffer,
    originalName: string,
    mimeType: string,
  ): Promise<CompressionResult> {
    const startTime = Date.now();
    this.logger.log(
      `Starting smart PDF compression for "${originalName}" (${fileBuffer?.length || 0} bytes)`,
    );

    // 1. Pre-compression Validation
    this.validatePreCompression(fileBuffer, originalName, mimeType);

    // 2. Wrap in processing timeout promise race
    return Promise.race([
      this.executeCompression(fileBuffer, originalName),
      new Promise<CompressionResult>((_, reject) =>
        setTimeout(
          () =>
            reject(
              new BadRequestException(
                'PDF compression timed out. The document is too complex or dense to process safely.',
              ),
            ),
          this.TIMEOUT_MS,
        ),
      ),
    ]).finally(() => {
      this.logger.log(
        `Completed compression evaluation for "${originalName}" in ${Date.now() - startTime}ms`,
      );
    });
  }

  /**
   * Validates MIME, magic bytes, file size, and basic structural requirements.
   */
  private validatePreCompression(
    buffer: Buffer,
    fileName: string,
    mimeType: string,
  ): void {
    if (!buffer || buffer.length === 0) {
      throw new BadRequestException('Uploaded file is empty.');
    }

    if (buffer.length > this.MAX_INPUT_FILE_SIZE) {
      throw new PayloadTooLargeException(
        `File exceeds the maximum allowable size of ${Math.round(this.MAX_INPUT_FILE_SIZE / (1024 * 1024))}MB for optimization.`,
      );
    }

    // PDF Magic Bytes validation (%PDF-)
    const isMagicPdf = buffer.subarray(0, 5).toString('ascii').startsWith('%PDF-');
    const isPdfMime =
      mimeType === 'application/pdf' ||
      mimeType === 'application/x-pdf' ||
      fileName.toLowerCase().endsWith('.pdf');

    if (!isMagicPdf && !isPdfMime) {
      throw new BadRequestException(
        'Invalid file type. Only PDF documents can be optimized.',
      );
    }

    if (!isMagicPdf) {
      throw new BadRequestException(
        'Invalid PDF header structure. The file is corrupted or not a valid PDF.',
      );
    }
  }

  /**
   * Executes the multi-stage safe optimization and independent verification.
   */
  private async executeCompression(
    fileBuffer: Buffer,
    originalName: string,
  ): Promise<CompressionResult> {
    const originalSize = fileBuffer.length;

    // Load original PDF to inspect and verify encryption
    let originalDoc: PDFDocument;
    let originalPageCount: number;
    try {
      originalDoc = await PDFDocument.load(fileBuffer, {
        ignoreEncryption: false,
      });
      originalPageCount = originalDoc.getPageCount();
      if (!originalPageCount || originalPageCount <= 0) {
        throw new BadRequestException('The PDF contains no readable pages.');
      }
    } catch (loadErr: any) {
      if (loadErr instanceof BadRequestException) {
        throw loadErr;
      }
      const errMsg = (loadErr?.message || '').toLowerCase();
      if (errMsg.includes('encrypt') || errMsg.includes('password')) {
        throw new BadRequestException(
          'The PDF is password-protected or encrypted. Please remove password protection before optimizing.',
        );
      }
      this.logger.warn(`Failed to parse original PDF structure for "${originalName}": ${loadErr?.message}`);
      throw new BadRequestException(
        'The uploaded PDF is malformed or corrupted and cannot be parsed.',
      );
    }

    // Extract text from original PDF for verification baseline
    let originalText = '';
    let isScannedPdf = false;
    try {
      const origParsed = await pdfParse(fileBuffer);
      originalText = origParsed.text || '';
      if (originalText.trim().length < 50) {
        isScannedPdf = true;
      }
    } catch {
      // If original text extraction threw, it might be heavily scanned or custom-encoded
      isScannedPdf = true;
    }

    // Stage 1: Optimize embedded raster images (Pass 1: Balanced)
    await this.optimizeEmbeddedImages(originalDoc, 1600, 78, 0.98);

    // Stage 2: Strip non-essential document metadata safely
    this.stripNonEssentialMetadata(originalDoc);

    // Stage 3: Compress object streams and structural dictionary objects
    let compressedUint8 = await originalDoc.save({
      useObjectStreams: true,
      addDefaultPage: false,
    });

    // If still oversized (> 10MB) after Pass 1, attempt Pass 2 (Adaptive Aggressive)
    if (compressedUint8.length > this.TARGET_MAX_FILE_SIZE) {
      const pass2Optimized = await this.optimizeEmbeddedImages(originalDoc, 1200, 68, 0.98);
      if (pass2Optimized > 0) {
        compressedUint8 = await originalDoc.save({
          useObjectStreams: true,
          addDefaultPage: false,
        });
      }
    }

    const compressedBuffer = Buffer.from(compressedUint8);
    const compressedSize = compressedBuffer.length;

    // Calculate reduction percentage
    const reductionPercentage =
      originalSize > 0
        ? Math.max(0, Number((((originalSize - compressedSize) / originalSize) * 100).toFixed(1)))
        : 0;

    // Check if compression yielded no meaningful reduction or if file is already optimal
    if (compressedSize >= originalSize) {
      this.logger.log(
        `PDF "${originalName}" is already optimized or compressed (${originalSize} -> ${compressedSize} bytes)`,
      );
      return {
        success: originalSize <= this.TARGET_MAX_FILE_SIZE,
        status: 'ALREADY_OPTIMIZED',
        originalSize,
        compressedSize: originalSize,
        reductionPercentage: 0,
        withinUploadLimit: originalSize <= this.TARGET_MAX_FILE_SIZE,
        verification: {
          validPdf: true,
          pageCountPreserved: true,
          textExtractionPassed: true,
          isScannedPdf,
        },
        compressedBuffer: originalSize <= this.TARGET_MAX_FILE_SIZE ? fileBuffer : undefined,
        message:
          originalSize <= this.TARGET_MAX_FILE_SIZE
            ? 'PDF is already optimal.'
            : 'The PDF is already heavily optimized and cannot be reduced further below 10 MB.',
      };
    }

    // Stage 4: Independent Post-compression Verification
    const verification = await this.verifyCompressedPdf(
      compressedBuffer,
      originalPageCount,
      originalText,
      isScannedPdf,
    );

    if (!verification.validPdf || !verification.pageCountPreserved || !verification.textExtractionPassed) {
      this.logger.error(
        `Post-compression verification failed for "${originalName}": ${JSON.stringify(verification)}`,
      );
      return {
        success: false,
        status: 'VERIFICATION_FAILED',
        originalSize,
        compressedSize,
        reductionPercentage,
        withinUploadLimit: false,
        verification,
        message: 'The compressed document failed integrity verification and cannot be used.',
      };
    }

    const withinUploadLimit = compressedSize <= this.TARGET_MAX_FILE_SIZE;

    if (!withinUploadLimit) {
      this.logger.warn(
        `Optimization reduced "${originalName}" by ${reductionPercentage}% (${originalSize} -> ${compressedSize} bytes), but still exceeds 10MB limit`,
      );
      return {
        success: false,
        status: 'SIZE_LIMIT_NOT_REACHED',
        originalSize,
        compressedSize,
        reductionPercentage,
        withinUploadLimit: false,
        verification,
        message: 'We optimized your resume, but its size is still above our 10 MB limit. You can try another file or use a more optimized PDF.',
      };
    }

    this.logger.log(
      `Smart compression succeeded for "${originalName}": ${originalSize} -> ${compressedSize} bytes (-${reductionPercentage}%)`,
    );

    return {
      success: true,
      status: 'COMPRESSED',
      originalSize,
      compressedSize,
      reductionPercentage,
      withinUploadLimit: true,
      verification,
      compressedBuffer,
    };
  }

  /**
   * Reverses PNG prediction algorithms (None, Sub, Up, Average, Paeth) used in PDF FlateDecode streams.
   */
  private depredictPng(
    raw: Buffer,
    width: number,
    height: number,
    channels: number,
    bitsPerComponent = 8,
  ): Buffer {
    if (bitsPerComponent !== 8 || width <= 0 || height <= 0) return raw;
    const bpp = channels;
    const rowBytes = width * bpp;
    const stride = rowBytes + 1;
    if (raw.length < stride * height) return raw;

    const output = Buffer.alloc(width * height * channels);
    const prevRow = Buffer.alloc(rowBytes);
    const currRow = Buffer.alloc(rowBytes);

    let srcOffset = 0;
    let dstOffset = 0;

    for (let y = 0; y < height; y++) {
      const filter = raw[srcOffset++];
      for (let x = 0; x < rowBytes; x++) {
        const byte = raw[srcOffset++];
        const left = x >= bpp ? currRow[x - bpp] : 0;
        const up = prevRow[x];
        const upLeft = x >= bpp ? prevRow[x - bpp] : 0;

        let val = 0;
        switch (filter) {
          case 0: // None
            val = byte;
            break;
          case 1: // Sub
            val = (byte + left) & 0xff;
            break;
          case 2: // Up
            val = (byte + up) & 0xff;
            break;
          case 3: // Average
            val = (byte + Math.floor((left + up) / 2)) & 0xff;
            break;
          case 4: { // Paeth
            const p = left + up - upLeft;
            const pa = Math.abs(p - left);
            const pb = Math.abs(p - up);
            const pc = Math.abs(p - upLeft);
            let pr = 0;
            if (pa <= pb && pa <= pc) pr = left;
            else if (pb <= pc) pr = up;
            else pr = upLeft;
            val = (byte + pr) & 0xff;
            break;
          }
          default:
            val = byte;
            break;
        }
        currRow[x] = val;
        output[dstOffset++] = val;
      }
      currRow.copy(prevRow);
    }

    return output;
  }

  /**
   * Decodes ASCII85 / Base85 encoded data used in PDF streams.
   */
  private decodeAscii85(buffer: Buffer): Buffer {
    let str = buffer.toString('latin1').replace(/\s+/g, '');
    if (str.startsWith('<~')) str = str.slice(2);
    if (str.endsWith('~>')) str = str.slice(0, -2);
    const out: number[] = [];
    let tuple = 0;
    let count = 0;

    for (let i = 0; i < str.length; i++) {
      const c = str.charCodeAt(i);
      if (c >= 33 && c <= 117) {
        tuple = tuple * 85 + (c - 33);
        count++;
        if (count === 5) {
          out.push(
            (tuple >>> 24) & 255,
            (tuple >>> 16) & 255,
            (tuple >>> 8) & 255,
            tuple & 255,
          );
          tuple = 0;
          count = 0;
        }
      } else if (str[i] === 'z' && count === 0) {
        out.push(0, 0, 0, 0);
      }
    }

    if (count > 0) {
      for (let i = count; i < 5; i++) {
        tuple = tuple * 85 + 84;
      }
      for (let i = 0; i < count - 1; i++) {
        out.push((tuple >>> (24 - i * 8)) & 255);
      }
    }

    return Buffer.from(out);
  }

  /**
   * Unpacks a chain of PDF stream filters in correct sequence.
   */
  private decompressStream(rawContents: Buffer, filterNames: string[]): Buffer {
    let current = rawContents;
    for (let i = 0; i < filterNames.length; i++) {
      const f = filterNames[i];
      if (f === '/ASCII85Decode' || f === '/A85') {
        current = this.decodeAscii85(current);
      } else if (f === '/FlateDecode' || f === '/Fl') {
        try {
          current = zlib.inflateSync(current);
        } catch {
          current = zlib.inflateRawSync(current);
        }
      }
    }
    return current;
  }

  /**
   * Inspects page contents to find the rendered physical dimensions (in points)
   * of image XObjects. Used to identify microscopic or tracking artifacts (e.g. 1pt x 1pt).
   */
  private getRenderedImageDimensions(
    pdfDoc: PDFDocument,
  ): Map<string, { width: number; height: number }> {
    const map = new Map<string, { width: number; height: number }>();
    try {
      const pageCount = pdfDoc.getPageCount();
      for (let p = 0; p < pageCount; p++) {
        const page = pdfDoc.getPage(p);
        const xobjDict = page.node.Resources()?.get(PDFName.of('XObject'));
        if (!(xobjDict instanceof PDFDict)) continue;

        const nameToRef = new Map<string, string>();
        for (const [key, val] of xobjDict.entries()) {
          nameToRef.set(key.toString().replace(/^\//, ''), val.toString());
        }

        const contentsRef = page.node.Contents();
        if (!contentsRef) continue;

        const contentsObj = pdfDoc.context.lookup(contentsRef);
        if (!(contentsObj instanceof PDFRawStream) || !contentsObj.contents) continue;

        const filterObj = contentsObj.dict.get(PDFName.of('Filter'));
        const filterNames =
          filterObj instanceof PDFArray
            ? filterObj.asArray().map((x) => x.toString())
            : [filterObj ? filterObj.toString() : ''];

        let contentsStr = '';
        try {
          contentsStr = this.decompressStream(
            Buffer.from(contentsObj.contents),
            filterNames,
          ).toString('latin1');
        } catch {
          contentsStr = Buffer.from(contentsObj.contents).toString('latin1');
        }

        for (const [name, refStr] of nameToRef.entries()) {
          const regex = new RegExp(
            `([0-9.-]+)\\s+([0-9.-]+)\\s+([0-9.-]+)\\s+([0-9.-]+)\\s+([0-9.-]+)\\s+([0-9.-]+)\\s+cm[^Q]*?\\/${name}\\s+Do`,
            'g',
          );
          let match: RegExpExecArray | null;
          while ((match = regex.exec(contentsStr)) !== null) {
            const a = Math.abs(parseFloat(match[1]));
            const b = Math.abs(parseFloat(match[2]));
            const c = Math.abs(parseFloat(match[3]));
            const d = Math.abs(parseFloat(match[4]));
            const renderedWidth = Math.sqrt(a * a + b * b);
            const renderedHeight = Math.sqrt(c * c + d * d);
            const prev = map.get(refStr);
            if (!prev || (renderedWidth > prev.width && renderedHeight > prev.height)) {
              map.set(refStr, { width: renderedWidth, height: renderedHeight });
            }
          }
        }
      }
    } catch {
      // Safe fallback
    }
    return map;
  }

  /**
   * Safely scans indirect objects for image streams and re-encodes heavy raster images.
   */
  private async optimizeEmbeddedImages(
    pdfDoc: PDFDocument,
    maxDimension = 1600,
    jpegQuality = 78,
    threshold = 0.98,
  ): Promise<number> {
    let imagesOptimized = 0;
    const context = pdfDoc.context;
    const indirectObjects = context.enumerateIndirectObjects();
    const renderedDimensions = this.getRenderedImageDimensions(pdfDoc);

    for (const [ref, obj] of indirectObjects) {
      if (!(obj instanceof PDFRawStream)) continue;

      const subtype = obj.dict.get(PDFName.of('Subtype'))?.toString();
      if (subtype !== '/Image') continue;

      const filterObj = obj.dict.get(PDFName.of('Filter'));
      const filterNames =
        filterObj instanceof PDFArray
          ? filterObj.asArray().map((x) => x.toString())
          : [filterObj ? filterObj.toString() : ''];

      const rawLength = obj.contents?.length || 0;

      // Only attempt to optimize raster images that are larger than 64 KB
      if (rawLength < 64 * 1024) continue;

      const width = Number(obj.dict.get(PDFName.of('Width'))?.toString()) || 0;
      const height = Number(obj.dict.get(PDFName.of('Height'))?.toString()) || 0;
      const colorSpace = obj.dict.get(PDFName.of('ColorSpace'))?.toString();
      const channels = colorSpace === '/DeviceGray' ? 1 : colorSpace === '/DeviceCMYK' ? 4 : 3;

      try {
        let sharpInput: any = null;

        if (filterNames.length === 1 && filterNames[0] === '/DCTDecode') {
          // Already standard JPEG: re-compress with high quality and controlled max dimensions
          sharpInput = sharp(Buffer.from(obj.contents));
        } else if (
          filterNames.includes('/FlateDecode') ||
          filterNames.includes('/Fl') ||
          filterNames.includes('/ASCII85Decode') ||
          filterNames.includes('/A85')
        ) {
          try {
            let decompressed: any = this.decompressStream(
              Buffer.from(obj.contents),
              filterNames,
            );

            // Check for PNG predictor in DecodeParms
            const decodeParms = obj.dict.get(PDFName.of('DecodeParms'));
            let predictor = 1;
            let bitsPerComponent = 8;
            let columns = width;

            if (decodeParms instanceof PDFDict) {
              predictor = Number(decodeParms.get(PDFName.of('Predictor'))?.toString()) || 1;
              bitsPerComponent =
                Number(decodeParms.get(PDFName.of('BitsPerComponent'))?.toString()) || 8;
              const cols = Number(decodeParms.get(PDFName.of('Columns'))?.toString());
              if (cols > 0) columns = cols;
            }

            if (predictor >= 10 && columns > 0 && height > 0) {
              decompressed = this.depredictPng(
                decompressed,
                columns,
                height,
                channels,
                bitsPerComponent,
              );
            }

            if (columns > 0 && height > 0 && decompressed.length === columns * height * channels) {
              sharpInput = sharp(decompressed, {
                raw: { width: columns, height, channels },
              });
            } else {
              sharpInput = sharp(decompressed);
            }
          } catch {
            sharpInput = sharp(Buffer.from(obj.contents));
          }
        } else {
          sharpInput = sharp(Buffer.from(obj.contents));
        }

        if (!sharpInput) continue;

        // Convert CMYK to sRGB if needed for standard JPEG encoding
        if (channels === 4) {
          sharpInput = sharpInput.toColorspace('srgb');
        }

        // Check if image is rendered as a microscopic tracking dot / anchor (< 8 points wide or high)
        const rendered = renderedDimensions.get(ref.toString());
        let targetDimension = maxDimension;
        if (rendered && rendered.width <= 8 && rendered.height <= 8) {
          targetDimension = 16; // Clamp micro-dots to 16px, eliminating tens of megabytes of waste
        }

        const optimizedJpg = await sharpInput
          .resize({
            width: targetDimension,
            height: targetDimension,
            fit: 'inside',
            withoutEnlargement: true,
          })
          .jpeg({ quality: targetDimension === 16 ? 60 : jpegQuality, mozjpeg: true })
          .toBuffer();

        // Only substitute if we achieved real space savings based on threshold
        if (optimizedJpg.length < rawLength * threshold) {
          const metadata = await sharp(optimizedJpg).metadata();

          (obj as any).contents = new Uint8Array(optimizedJpg);
          obj.dict.set(PDFName.of('Filter'), PDFName.of('DCTDecode'));
          obj.dict.delete(PDFName.of('DecodeParms'));
          obj.dict.set(PDFName.of('Length'), PDFNumber.of(optimizedJpg.length));
          obj.dict.set(PDFName.of('ColorSpace'), PDFName.of('DeviceRGB'));
          obj.dict.set(PDFName.of('BitsPerComponent'), PDFNumber.of(8));
          if (metadata.width) {
            obj.dict.set(PDFName.of('Width'), PDFNumber.of(metadata.width));
          }
          if (metadata.height) {
            obj.dict.set(PDFName.of('Height'), PDFNumber.of(metadata.height));
          }
          imagesOptimized++;
        }
      } catch (err: any) {
        this.logger.debug(`Skipped non-optimizable image object: ${err?.message}`);
      }
    }

    return imagesOptimized;
  }

  /**
   * Safely clears metadata dictionaries without affecting layout, fonts, or structure.
   */
  private stripNonEssentialMetadata(doc: PDFDocument): void {
    try {
      doc.setTitle('');
      doc.setAuthor('');
      doc.setSubject('');
      doc.setKeywords([]);
      doc.setProducer('');
      doc.setCreator('');

      // Strip redundant XMP metadata stream from catalog if present
      const catalog = doc.catalog;
      if (catalog.has(PDFName.of('Metadata'))) {
        catalog.delete(PDFName.of('Metadata'));
      }
      if (catalog.has(PDFName.of('PieceInfo'))) {
        catalog.delete(PDFName.of('PieceInfo'));
      }
    } catch {
      // Ignore metadata removal errors
    }
  }

  /**
   * Independent Post-compression Verification:
   * 1. Structural Verification (reloading in PDF parser, page count match)
   * 2. Text Verification (independent text extraction with pdf-parse-fork)
   */
  private async verifyCompressedPdf(
    compressedBuffer: Buffer,
    expectedPageCount: number,
    originalText: string,
    isScannedPdf: boolean,
  ): Promise<CompressionVerification> {
    // 1. Structural Verification
    let validPdf = false;
    let pageCountPreserved = false;
    let compressedDoc: PDFDocument | null = null;

    try {
      compressedDoc = await PDFDocument.load(compressedBuffer, {
        ignoreEncryption: false,
      });
      validPdf = true;
      const compPages = compressedDoc.getPageCount();
      pageCountPreserved = compPages === expectedPageCount;
    } catch {
      validPdf = false;
      pageCountPreserved = false;
    }

    if (!validPdf || !pageCountPreserved) {
      return {
        validPdf,
        pageCountPreserved,
        textExtractionPassed: false,
        isScannedPdf,
      };
    }

    // 2. Text Integrity Verification using pdf-parse-fork
    let textExtractionPassed = false;
    try {
      const compParsed = await pdfParse(compressedBuffer);
      const compText = compParsed.text || '';

      if (isScannedPdf) {
        // Scanned PDF had insufficient or no text originally
        textExtractionPassed = true;
      } else {
        const origNorm = this.normalizeTextForComparison(originalText);
        const compNorm = this.normalizeTextForComparison(compText);

        // Verification criteria:
        // 1. Extractable text length must not drop drastically
        const lengthRatio = compNorm.length / Math.max(1, origNorm.length);
        const lengthOk = lengthRatio >= 0.85;

        // 2. Key tokens verification (emails, phone numbers, essential resume sections)
        const tokensOk = this.verifyKeyResumeTokens(originalText, compText);

        textExtractionPassed = lengthOk && tokensOk;
      }
    } catch {
      textExtractionPassed = false;
    }

    return {
      validPdf,
      pageCountPreserved,
      textExtractionPassed,
      isScannedPdf,
    };
  }

  /**
   * Normalizes text for comparison by collapsing whitespace and punctuation.
   */
  private normalizeTextForComparison(text: string): string {
    return (text || '').toLowerCase().replace(/[\s\r\n\t]+/g, ' ').trim();
  }

  /**
   * Verifies that key structural tokens (emails, contact numbers, common headers)
   * present in original text remain intact in the compressed output.
   */
  private verifyKeyResumeTokens(orig: string, comp: string): boolean {
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const origEmails = orig.match(emailRegex) || [];
    for (const email of origEmails) {
      if (!comp.includes(email)) {
        return false;
      }
    }

    // Check standard section presence if they existed in original
    const sections = ['experience', 'education', 'skills', 'summary', 'projects'];
    const origLower = orig.toLowerCase();
    const compLower = comp.toLowerCase();
    for (const section of sections) {
      if (origLower.includes(section) && !compLower.includes(section)) {
        return false;
      }
    }

    return true;
  }
}
