import { PDFDocument, rgb, StandardFonts, PDFName, PDFNumber, PDFRawStream } from 'pdf-lib';
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const OUT_DIR = path.resolve('c:/Users/addme/Desktop/Hyper-Resume/test-assets/compression-fixtures');

async function createNoiseImage(width: number, height: number, quality = 70): Promise<Buffer> {
  return sharp({
    create: {
      width,
      height,
      channels: 3,
      background: { r: 100, g: 130, b: 180 },
      noise: { type: 'gaussian', mean: 128, sigma: 30 },
    },
  }).jpeg({ quality }).toBuffer();
}

async function updateSpecificFixtures() {
  console.log('Finalizing target sizes for T03, T07, T08...');

  // T03: 10.6 MB (> 10MB limit)
  {
    const doc = await PDFDocument.create();
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const page = doc.addPage([612, 792]);
    page.drawText('Marcus Vance - Principal Engineer (marcus@example.com)');
    const imgBuf = await sharp({
      create: { width: 2600, height: 1600, channels: 3, background: { r: 90, g: 120, b: 160 }, noise: { type: 'gaussian', mean: 130, sigma: 35 } },
    }).png({ compressionLevel: 0 }).toBuffer();
    const img = await doc.embedPng(imgBuf);
    page.drawImage(img, { x: 50, y: 80, width: 260, height: 160 });
    const bytes = await doc.save();
    console.log('T03 size:', (bytes.length / (1024 * 1024)).toFixed(2), 'MB');
    fs.writeFileSync(path.join(OUT_DIR, 'T03_slightly_oversized_10_5mb.pdf'), bytes);
  }

  // T07: 12.2 MB (Already compressed JPEGs)
  {
    const doc = await PDFDocument.create();
    for (let p = 1; p <= 8; p++) {
      const page = doc.addPage([612, 792]);
      page.drawText(`Frank Miller - DevOps Specialist (frank@example.com) - Page ${p}`);
      for (let j = 0; j < 2; j++) {
        const jpgBuf = await createNoiseImage(1900, 1300, 75);
        const img = await doc.embedJpg(jpgBuf);
        page.drawImage(img, { x: 50 + j * 160, y: 80, width: 140, height: 100 });
      }
    }
    const bytes = await doc.save({ useObjectStreams: true });
    console.log('T07 size:', (bytes.length / (1024 * 1024)).toFixed(2), 'MB');
    fs.writeFileSync(path.join(OUT_DIR, 'T07_already_optimized_12mb.pdf'), bytes);
  }

  // T08: 15.1 MB (Large vector drawing stream)
  {
    const doc = await PDFDocument.create();
    const page = doc.addPage([612, 792]);
    page.drawText('Liam O Connor - UI/UX Systems Architect (liam@example.com)');
    
    // Build uncompressed raw stream with 15MB of vector drawing commands
    const chunkSize = 1024 * 1024; // 1 MB
    const totalChunks = 15;
    let singleMbStream = '';
    for (let i = 0; i < 28000; i++) {
      const x = ((i * 17) % 500) + 50;
      const y = ((i * 31) % 600) + 100;
      singleMbStream += `${x.toFixed(1)} ${y.toFixed(1)} m ${(x + 5).toFixed(1)} ${(y + 3).toFixed(1)} l S\n`;
    }
    
    for (let c = 0; c < totalChunks; c++) {
      const rawStream = PDFRawStream.of(
        doc.context.obj({
          Type: 'XObject',
          Subtype: 'Form',
          BBox: [0, 0, 612, 792],
          Length: singleMbStream.length,
        }),
        Buffer.from(singleMbStream),
      );
      const ref = doc.context.register(rawStream);
      (page.node as any).addContentStream(ref);
    }

    const bytes = await doc.save();
    console.log('T08 size:', (bytes.length / (1024 * 1024)).toFixed(2), 'MB');
    fs.writeFileSync(path.join(OUT_DIR, 'T08_vector_heavy_15mb.pdf'), bytes);
  }
}

updateSpecificFixtures().catch(console.error);
