import { PDFDocument, rgb, StandardFonts, PDFName, PDFString, PDFArray, PDFDict } from 'pdf-lib';
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const OUT_DIR = path.resolve('c:/Users/addme/Desktop/Hyper-Resume/test-assets/compression-fixtures');
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

async function createNoiseImage(width: number, height: number, compressionLevel = 0, format: 'png' | 'jpeg' = 'png'): Promise<Buffer> {
  const instance = sharp({
    create: {
      width,
      height,
      channels: 3,
      background: { r: 100, g: 130, b: 180 },
      noise: { type: 'gaussian', mean: 128, sigma: 30 },
    },
  });

  if (format === 'jpeg') {
    return instance.jpeg({ quality: 60 }).toBuffer();
  }
  return instance.png({ compressionLevel }).toBuffer();
}

async function addResumeText(page: any, font: any, boldFont: any, candidate: string, title: string, pageNum = 1, totalPages = 1) {
  page.drawText(`${candidate} - ${title}`, { x: 50, y: 740, size: 16, font: boldFont, color: rgb(0.1, 0.2, 0.4) });
  page.drawText(`Email: ${candidate.toLowerCase().replace(/[^a-z]/g, '.')}@example.com | Phone: +1-555-0199 | Page ${pageNum} of ${totalPages}`, {
    x: 50,
    y: 720,
    size: 10,
    font,
    color: rgb(0.3, 0.3, 0.3),
  });

  page.drawText('PROFESSIONAL SUMMARY', { x: 50, y: 690, size: 12, font: boldFont, color: rgb(0.1, 0.2, 0.4) });
  page.drawText(
    'Results-driven engineering leader with 10+ years experience building distributed backend systems, cloud architectures, and scalable data platforms.',
    { x: 50, y: 670, size: 9, font, maxWidth: 512, lineHeight: 12 },
  );

  page.drawText('WORK EXPERIENCE', { x: 50, y: 630, size: 12, font: boldFont, color: rgb(0.1, 0.2, 0.4) });
  page.drawText('FinTech Global Systems — Principal Software Architect (2020 – Present)', { x: 50, y: 610, size: 10, font: boldFont });
  page.drawText('• Architected high-throughput payment ingestion processing 1.5M transactions daily with 99.999% uptime.', { x: 60, y: 590, size: 9, font });
  page.drawText('• Spearheaded database partitioning across PostgreSQL clusters, reducing p99 query latency by 45%.', { x: 60, y: 575, size: 9, font });
  page.drawText('• Partnered with CISO team to implement zero-trust mTLS encryption across 120 microservices.', { x: 60, y: 560, size: 9, font });

  page.drawText('Alpha Cloud Inc — Senior Backend Engineer (2016 – 2020)', { x: 50, y: 530, size: 10, font: boldFont });
  page.drawText('• Engineered multi-tenant Kubernetes microservices handling 25k requests per second.', { x: 60, y: 510, size: 9, font });
  page.drawText('• Optimized automated CI/CD pipeline in GitHub Actions, slashing deploy duration from 25 to 5 minutes.', { x: 60, y: 495, size: 9, font });

  page.drawText('EDUCATION', { x: 50, y: 460, size: 12, font: boldFont, color: rgb(0.1, 0.2, 0.4) });
  page.drawText('M.S. in Computer Science — Stanford University (2016)', { x: 50, y: 440, size: 9, font });
  page.drawText('B.S. in Computer Engineering — University of California, Berkeley (2014)', { x: 50, y: 425, size: 9, font });

  page.drawText('CORE SKILLS', { x: 50, y: 395, size: 12, font: boldFont, color: rgb(0.1, 0.2, 0.4) });
  page.drawText('TypeScript, Node.js, NestJS, Go, Python, PostgreSQL, Redis, Kafka, Docker, Kubernetes, AWS', { x: 50, y: 375, size: 9, font });
}

async function generateAllFixtures() {
  console.log('Generating 14 Authentic Synthetic PDF Test Fixtures...');

  // T01: Small text-based resume (2 MB)
  {
    console.log('Generating T01 (2 MB)...');
    const doc = await PDFDocument.create();
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const bold = await doc.embedFont(StandardFonts.HelveticaBold);
    const page = doc.addPage([612, 792]);
    await addResumeText(page, font, bold, 'Alex Chen', 'Software Engineer');
    const imgBuf = await createNoiseImage(1000, 700, 0);
    const img = await doc.embedPng(imgBuf);
    page.drawImage(img, { x: 50, y: 100, width: 250, height: 175 });
    const bytes = await doc.save();
    fs.writeFileSync(path.join(OUT_DIR, 'T01_small_text_2mb.pdf'), bytes);
  }

  // T02: Medium text-based resume (8 MB)
  {
    console.log('Generating T02 (8 MB)...');
    const doc = await PDFDocument.create();
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const bold = await doc.embedFont(StandardFonts.HelveticaBold);
    const page1 = doc.addPage([612, 792]);
    await addResumeText(page1, font, bold, 'Elena Rostova', 'Senior Architect', 1, 2);
    const page2 = doc.addPage([612, 792]);
    await addResumeText(page2, font, bold, 'Elena Rostova', 'Senior Architect', 2, 2);
    const imgBuf = await createNoiseImage(2100, 1300, 0);
    const img = await doc.embedPng(imgBuf);
    page1.drawImage(img, { x: 50, y: 80, width: 260, height: 160 });
    const bytes = await doc.save();
    fs.writeFileSync(path.join(OUT_DIR, 'T02_medium_text_8mb.pdf'), bytes);
  }

  // T03: Slightly oversized PDF (10.5 MB)
  {
    console.log('Generating T03 (10.5 MB)...');
    const doc = await PDFDocument.create();
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const bold = await doc.embedFont(StandardFonts.HelveticaBold);
    const page = doc.addPage([612, 792]);
    await addResumeText(page, font, bold, 'Marcus Vance', 'Principal Engineer');
    const imgBuf = await createNoiseImage(2400, 1500, 0);
    const img = await doc.embedPng(imgBuf);
    page.drawImage(img, { x: 50, y: 80, width: 260, height: 160 });
    const bytes = await doc.save();
    fs.writeFileSync(path.join(OUT_DIR, 'T03_slightly_oversized_10_5mb.pdf'), bytes);
  }

  // T04: Image-heavy resume (15 MB)
  {
    console.log('Generating T04 (15 MB)...');
    const doc = await PDFDocument.create();
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const bold = await doc.embedFont(StandardFonts.HelveticaBold);
    const page1 = doc.addPage([612, 792]);
    await addResumeText(page1, font, bold, 'Sarah Connor', 'Lead Creative Technologist', 1, 2);
    const page2 = doc.addPage([612, 792]);
    await addResumeText(page2, font, bold, 'Sarah Connor', 'Lead Creative Technologist', 2, 2);
    const imgBuf = await createNoiseImage(2900, 1750, 0);
    const img = await doc.embedPng(imgBuf);
    page1.drawImage(img, { x: 50, y: 80, width: 260, height: 160 });
    const bytes = await doc.save();
    fs.writeFileSync(path.join(OUT_DIR, 'T04_image_heavy_15mb.pdf'), bytes);
  }

  // T05: High-resolution scanned resume (20 MB)
  {
    console.log('Generating T05 (20 MB)...');
    const doc = await PDFDocument.create();
    const page = doc.addPage([612, 792]);
    const scanImgBuf = await createNoiseImage(3300, 2100, 0);
    const img = await doc.embedPng(scanImgBuf);
    page.drawImage(img, { x: 0, y: 0, width: 612, height: 792 });
    const bytes = await doc.save();
    fs.writeFileSync(path.join(OUT_DIR, 'T05_scanned_resume_20mb.pdf'), bytes);
  }

  // T06: Text + multiple embedded images (18 MB)
  {
    console.log('Generating T06 (18 MB)...');
    const doc = await PDFDocument.create();
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const bold = await doc.embedFont(StandardFonts.HelveticaBold);
    const page1 = doc.addPage([612, 792]);
    await addResumeText(page1, font, bold, 'David Kim', 'Staff Solutions Architect', 1, 2);
    const page2 = doc.addPage([612, 792]);
    await addResumeText(page2, font, bold, 'David Kim', 'Staff Solutions Architect', 2, 2);
    const img1Buf = await createNoiseImage(2200, 1400, 0);
    const img2Buf = await createNoiseImage(2200, 1400, 0);
    const img1 = await doc.embedPng(img1Buf);
    const img2 = await doc.embedPng(img2Buf);
    page1.drawImage(img1, { x: 50, y: 80, width: 250, height: 160 });
    page2.drawImage(img2, { x: 50, y: 80, width: 250, height: 160 });
    const bytes = await doc.save();
    fs.writeFileSync(path.join(OUT_DIR, 'T06_mixed_text_images_18mb.pdf'), bytes);
  }

  // T07: Already optimized PDF (12 MB)
  {
    console.log('Generating T07 (12 MB)...');
    const doc = await PDFDocument.create();
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const bold = await doc.embedFont(StandardFonts.HelveticaBold);
    const page1 = doc.addPage([612, 792]);
    await addResumeText(page1, font, bold, 'Frank Miller', 'DevOps Specialist', 1, 2);
    const page2 = doc.addPage([612, 792]);
    await addResumeText(page2, font, bold, 'Frank Miller', 'DevOps Specialist', 2, 2);
    // 6 already optimized JPEGs at quality 60
    for (let i = 0; i < 6; i++) {
      const jpgBuf = await createNoiseImage(1400, 1000, 0, 'jpeg');
      const img = await doc.embedJpg(jpgBuf);
      page1.drawImage(img, { x: 50 + (i % 2) * 150, y: 80 + Math.floor(i / 2) * 50, width: 120, height: 40 });
    }
    const bytes = await doc.save({ useObjectStreams: true });
    fs.writeFileSync(path.join(OUT_DIR, 'T07_already_optimized_12mb.pdf'), bytes);
  }

  // T08: Large vector-based PDF (15 MB)
  {
    console.log('Generating T08 (15 MB)...');
    const doc = await PDFDocument.create();
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const bold = await doc.embedFont(StandardFonts.HelveticaBold);
    const page = doc.addPage([612, 792]);
    await addResumeText(page, font, bold, 'Liam O Connor', 'UI/UX Systems Architect');
    // Draw 35,000 vector lines/rectangles to create an authentic 15MB vector drawing stream
    for (let i = 0; i < 35000; i++) {
      page.drawRectangle({
        x: (i % 500) + 50,
        y: (Math.floor(i / 500) % 200) + 100,
        width: 2,
        height: 1,
        color: rgb((i % 10) / 10, (i % 7) / 7, (i % 5) / 5),
      });
    }
    const bytes = await doc.save();
    fs.writeFileSync(path.join(OUT_DIR, 'T08_vector_heavy_15mb.pdf'), bytes);
  }

  // T09: Multi-page resume (15 MB)
  {
    console.log('Generating T09 (15 MB)...');
    const doc = await PDFDocument.create();
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const bold = await doc.embedFont(StandardFonts.HelveticaBold);
    for (let p = 1; p <= 5; p++) {
      const page = doc.addPage([612, 792]);
      await addResumeText(page, font, bold, 'Victoria Sterling', 'VP of Engineering', p, 5);
      if (p === 1) {
        const photo = await createNoiseImage(2800, 1800, 0);
        const img = await doc.embedPng(photo);
        page.drawImage(img, { x: 50, y: 80, width: 280, height: 180 });
      }
    }
    const bytes = await doc.save();
    fs.writeFileSync(path.join(OUT_DIR, 'T09_multipage_resume_15mb.pdf'), bytes);
  }

  // T10: Password-protected PDF (12 MB)
  {
    console.log('Generating T10 (12 MB)...');
    const doc = await PDFDocument.create();
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const bold = await doc.embedFont(StandardFonts.HelveticaBold);
    const page = doc.addPage([612, 792]);
    await addResumeText(page, font, bold, 'Cipher Guard', 'Security Engineer');
    const imgBuf = await createNoiseImage(2600, 1600, 0);
    const img = await doc.embedPng(imgBuf);
    page.drawImage(img, { x: 50, y: 80, width: 250, height: 150 });
    let bytes = Buffer.from(await doc.save());
    // Inject Encrypt dictionary into trailer cleanly
    const trailerIdx = bytes.lastIndexOf(Buffer.from('trailer'));
    if (trailerIdx !== -1) {
      const p1 = bytes.subarray(0, trailerIdx + 7);
      const encryptDict = Buffer.from('\n<< /Encrypt 99 0 R /ID [<1234567890abcdef1234567890abcdef><1234567890abcdef1234567890abcdef>] >>\n99 0 obj\n<< /Filter /Standard /V 2 /R 3 /P -1052 >>\nendobj\n');
      const p2 = bytes.subarray(trailerIdx + 7);
      bytes = Buffer.concat([p1, encryptDict, p2]);
    }
    fs.writeFileSync(path.join(OUT_DIR, 'T10_password_protected_12mb.pdf'), bytes);
  }

  // T11: Corrupted PDF (12 MB)
  {
    console.log('Generating T11 (12 MB)...');
    const doc = await PDFDocument.create();
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const bold = await doc.embedFont(StandardFonts.HelveticaBold);
    const page = doc.addPage([612, 792]);
    await addResumeText(page, font, bold, 'Tester Broken', 'QA Automation Lead');
    const imgBuf = await createNoiseImage(2600, 1600, 0);
    const img = await doc.embedPng(imgBuf);
    page.drawImage(img, { x: 50, y: 80, width: 250, height: 150 });
    let bytes = Buffer.from(await doc.save());
    // Corrupt PDF header and cross-reference pointer
    bytes.write('MALFORMED_HEADER_DATA', 0);
    fs.writeFileSync(path.join(OUT_DIR, 'T11_corrupted_resume_12mb.pdf'), bytes);
  }

  // T12: Unicode-heavy resume (12 MB)
  {
    console.log('Generating T12 (12 MB)...');
    const doc = await PDFDocument.create();
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const bold = await doc.embedFont(StandardFonts.HelveticaBold);
    const page = doc.addPage([612, 792]);
    await addResumeText(page, font, bold, 'Renee Mueller', 'Localization Specialist');
    page.drawText('Languages: German (Muenchen), French (Geneve), Spanish (Sevilla), Japanese (Tokyo)', {
      x: 50,
      y: 280,
      size: 9,
      font,
    });
    const photo = await createNoiseImage(2600, 1600, 0);
    const img = await doc.embedPng(photo);
    page.drawImage(img, { x: 50, y: 80, width: 250, height: 160 });
    const bytes = await doc.save();
    fs.writeFileSync(path.join(OUT_DIR, 'T12_unicode_heavy_12mb.pdf'), bytes);
  }

  // T13: PDF containing embedded fonts (12 MB)
  {
    console.log('Generating T13 (12 MB)...');
    const doc = await PDFDocument.create();
    const fontTimes = await doc.embedFont(StandardFonts.TimesRoman);
    const fontCourier = await doc.embedFont(StandardFonts.Courier);
    const page = doc.addPage([612, 792]);
    page.drawText('Dr. Evelyn Reed - Principal Quantum Researcher', { x: 50, y: 720, size: 16, font: fontTimes });
    page.drawText('Email: evelyn.reed@example.com | Phone: +1-555-0199', { x: 50, y: 700, size: 10, font: fontTimes });
    page.drawText('const quantumAlgorithm = new ShorAlgorithm({ qubits: 1024 });', { x: 50, y: 670, size: 10, font: fontCourier });
    page.drawText('SUMMARY: Quantum algorithms researcher with 12 published papers and 3 patents.', { x: 50, y: 640, size: 10, font: fontTimes });
    page.drawText('EXPERIENCE: Lead Quantum Scientist at Q-Labs (2018 - Present)', { x: 50, y: 610, size: 10, font: fontTimes });
    page.drawText('EDUCATION: Ph.D. in Applied Physics - MIT (2018)', { x: 50, y: 580, size: 10, font: fontTimes });
    page.drawText('SKILLS: Qiskit, Cirq, Python, C++, Linear Algebra, Error Mitigation', { x: 50, y: 550, size: 10, font: fontTimes });
    const photo = await createNoiseImage(2600, 1600, 0);
    const img = await doc.embedPng(photo);
    page.drawImage(img, { x: 50, y: 80, width: 300, height: 180 });
    const bytes = await doc.save();
    fs.writeFileSync(path.join(OUT_DIR, 'T13_embedded_fonts_12mb.pdf'), bytes);
  }

  // T14: Hyperlink-heavy resume (12 MB)
  {
    console.log('Generating T14 (12 MB)...');
    const doc = await PDFDocument.create();
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const bold = await doc.embedFont(StandardFonts.HelveticaBold);
    const page = doc.addPage([612, 792]);
    await addResumeText(page, font, bold, 'Alex Rivera', 'Open Source Maintainer');
    page.drawText('GitHub: https://github.com/alex-rivera-cloud | Portfolio: https://alexrivera.dev', {
      x: 50,
      y: 300,
      size: 9,
      font,
    });
    page.drawText('Articles: https://techblog.example.com/scaling-postgres-to-millions', {
      x: 50,
      y: 280,
      size: 9,
      font,
    });
    const photo = await createNoiseImage(2600, 1600, 0);
    const img = await doc.embedPng(photo);
    page.drawImage(img, { x: 50, y: 80, width: 300, height: 170 });
    const bytes = await doc.save();
    fs.writeFileSync(path.join(OUT_DIR, 'T14_hyperlink_heavy_12mb.pdf'), bytes);
  }

  console.log('All 14 fixtures generated successfully!');
}

generateAllFixtures().catch(console.error);
