import { Injectable, Logger } from '@nestjs/common';
import mammoth from 'mammoth';
import {
  AlignmentType,
  BorderStyle,
  Document,
  ExternalHyperlink,
  Packer,
  Paragraph,
  TabStopType,
  TextRun,
} from 'docx';
import type { Resume } from './entities/resume.entity.js';
import type {
  BuiltInSectionKey,
  CustomResumeSection,
  ResumeContent,
  ResumeSectionKey,
} from './entities/resume.types.js';
import type { CoverLetter } from '../cover-letters/entities/cover-letter.entity.js';

const DEFAULT_SECTION_ORDER: BuiltInSectionKey[] = [
  'summary',
  'experience',
  'projects',
  'skills',
  'education',
  'certifications',
];

export interface DocxExportResult {
  buffer: Buffer;
  fileName: string;
  sizeBytes: number;
  extractableChars: number;
  extractableWords: number;
  atsVerified: boolean;
}

@Injectable()
export class DocxExportService {
  private readonly logger = new Logger(DocxExportService.name);

  public sanitizeFileName(rawName: string, fallback = 'Resume'): string {
    const cleaned = (rawName || fallback)
      .trim()
      .replace(/[/\\?%*:|"<>]/g, '-')
      .replace(/\s+/g, ' ')
      .slice(0, 140);
    const base = cleaned || fallback;
    return base.toLowerCase().endsWith('.docx') ? base : `${base}.docx`;
  }

  private normalizeUrl(raw?: string): string | null {
    const trimmed = raw?.trim();
    if (!trimmed) return null;
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return `https://${trimmed}`;
  }

  private buildSectionHeading(title: string, accentHex = '285FEA'): Paragraph {
    return new Paragraph({
      spacing: { before: 220, after: 80 },
      border: {
        bottom: {
          style: BorderStyle.SINGLE,
          size: 6,
          color: accentHex,
        },
      },
      children: [
        new TextRun({
          text: title.toUpperCase(),
          bold: true,
          size: 21,
          color: '111827',
          font: 'Calibri',
        }),
      ],
    });
  }

  private buildContactChildren(content: ResumeContent): (TextRun | ExternalHyperlink)[] {
    const contact = content.contact || ({} as ResumeContent['contact']);
    const items: (TextRun | ExternalHyperlink)[] = [];

    const appendText = (text: string) => {
      if (items.length > 0) {
        items.push(
          new TextRun({ text: '  |  ', size: 19, color: '6B7280', font: 'Calibri' }),
        );
      }
      items.push(
        new TextRun({ text, size: 19, color: '374151', font: 'Calibri' }),
      );
    };

    const appendLink = (label: string, rawUrl?: string) => {
      const href = this.normalizeUrl(rawUrl);
      if (!href) return;
      if (items.length > 0) {
        items.push(
          new TextRun({ text: '  |  ', size: 19, color: '6B7280', font: 'Calibri' }),
        );
      }
      items.push(
        new ExternalHyperlink({
          link: href,
          children: [
            new TextRun({
              text: label,
              size: 19,
              color: '285FEA',
              underline: {},
              font: 'Calibri',
            }),
          ],
        }),
      );
    };

    if (contact.email) appendText(contact.email);
    if (contact.phone) appendText(contact.phone);
    if (contact.location) appendText(contact.location);
    if (contact.linkedinUrl) appendLink(contact.linkedinUrl, contact.linkedinUrl);
    if (contact.githubUrl) appendLink(contact.githubUrl, contact.githubUrl);
    if (contact.websiteUrl) appendLink(contact.websiteUrl, contact.websiteUrl);

    return items;
  }

  async generateResumeDocx(
    resume: Resume,
    options?: { pageSize?: 'A4' | 'US Letter'; fileName?: string },
  ): Promise<DocxExportResult> {
    const startedAt = Date.now();
    const content = resume.content || ({} as ResumeContent);
    const layout = content.layout || {};

    const isLetter = options?.pageSize === 'US Letter';
    const rawMarginPx =
      typeof layout.pageMargin === 'number'
        ? Math.min(52, Math.max(16, layout.pageMargin))
        : 36;
    const marginTwips = Math.round((rawMarginPx / 36) * 864);
    const pageWidthTwips = isLetter ? 12240 : 11906;
    const pageHeightTwips = isLetter ? 15840 : 16838;
    const rightTabTwips = pageWidthTwips - marginTwips * 2;

    const fontScale =
      typeof layout.fontSizeScale === 'number'
        ? Math.min(1.15, Math.max(0.85, layout.fontSizeScale))
        : 1;
    const scalePt = (halfPts: number) => Math.max(14, Math.round(halfPts * fontScale));
    const lineHeightFactor =
      typeof layout.lineHeight === 'number'
        ? Math.min(1.75, Math.max(1.2, layout.lineHeight))
        : 1.45;
    const lineTwips = Math.round(lineHeightFactor * 180);
    const rawAccent = (layout.accentColor || '#285FEA').replace('#', '').trim();
    const accentHex = /^[0-9a-fA-F]{6}$/.test(rawAccent) ? rawAccent : '285FEA';
    const fontName =
      layout.fontFamily === 'serif'
        ? 'Georgia'
        : layout.fontFamily === 'mono'
          ? 'Consolas'
          : 'Calibri';

    const children: Paragraph[] = [];

    // 1. Candidate Name + Headline + Contact Header
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 40 },
        children: [
          new TextRun({
            text: content.contact?.fullName || resume.name || 'Candidate Resume',
            bold: true,
            size: scalePt(38),
            color: '111827',
            font: fontName,
          }),
        ],
      }),
    );

    if (content.headline?.trim()) {
      children.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 60 },
          children: [
            new TextRun({
              text: content.headline.trim(),
              size: scalePt(22),
              color: accentHex,
              bold: true,
              font: fontName,
            }),
          ],
        }),
      );
    }

    const contactChildren = this.buildContactChildren(content);
    if (contactChildren.length > 0) {
      children.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 140 },
          children: contactChildren,
        }),
      );
    }

    const buildSummarySection = (): Paragraph[] => {
      if (!content.summary?.trim()) return [];
      return [
        this.buildSectionHeading('Professional Summary', accentHex),
        new Paragraph({
          spacing: { after: 100, line: lineTwips },
          children: [
            new TextRun({
              text: content.summary.trim(),
              size: scalePt(20),
              color: '1F2937',
              font: fontName,
            }),
          ],
        }),
      ];
    };

    const buildExperienceSection = (): Paragraph[] => {
      if (!content.experience?.length) return [];
      const out: Paragraph[] = [this.buildSectionHeading('Experience', accentHex)];
      for (const exp of content.experience) {
        const dateRange = `${exp.startDate || ''}${exp.startDate ? ' – ' : ''}${
          exp.current ? 'Present' : exp.endDate || ''
        }`.trim();

        out.push(
          new Paragraph({
            spacing: { before: 120, after: 20 },
            tabStops: [{ type: TabStopType.RIGHT, position: rightTabTwips }],
            children: [
              new TextRun({
                text: exp.company || 'Company',
                bold: true,
                size: scalePt(21),
                color: '111827',
                font: fontName,
              }),
              ...(dateRange
                ? [
                    new TextRun({ text: '\t' }),
                    new TextRun({
                      text: dateRange,
                      size: scalePt(19),
                      color: '4B5563',
                      font: fontName,
                    }),
                  ]
                : []),
            ],
          }),
        );

        out.push(
          new Paragraph({
            spacing: { after: 50 },
            tabStops: [{ type: TabStopType.RIGHT, position: rightTabTwips }],
            children: [
              new TextRun({
                text: exp.title || 'Role',
                italics: true,
                size: scalePt(20),
                color: '374151',
                font: fontName,
              }),
              ...(exp.location
                ? [
                    new TextRun({ text: '\t' }),
                    new TextRun({
                      text: exp.location,
                      italics: true,
                      size: scalePt(18),
                      color: '6B7280',
                      font: fontName,
                    }),
                  ]
                : []),
            ],
          }),
        );

        for (const bullet of exp.bullets || []) {
          if (!bullet?.trim()) continue;
          out.push(
            new Paragraph({
              bullet: { level: 0 },
              spacing: { after: 40, line: lineTwips },
              children: [
                new TextRun({
                  text: bullet.trim(),
                  size: scalePt(20),
                  color: '1F2937',
                  font: fontName,
                }),
              ],
            }),
          );
        }
      }
      return out;
    };

    const buildProjectsSection = (): Paragraph[] => {
      if (!content.projects?.length) return [];
      const out: Paragraph[] = [this.buildSectionHeading('Projects', accentHex)];
      for (const proj of content.projects) {
        const urlHref = this.normalizeUrl(proj.url);
        out.push(
          new Paragraph({
            spacing: { before: 100, after: 30 },
            children: [
              new TextRun({
                text: proj.name || 'Project',
                bold: true,
                size: scalePt(21),
                color: '111827',
                font: fontName,
              }),
              ...(urlHref
                ? [
                    new TextRun({ text: '  ·  ', size: scalePt(19), color: '6B7280' }),
                    new ExternalHyperlink({
                      link: urlHref,
                      children: [
                        new TextRun({
                          text: proj.url!,
                          size: scalePt(18),
                          color: accentHex,
                          underline: {},
                          font: fontName,
                        }),
                      ],
                    }),
                  ]
                : []),
            ],
          }),
        );

        if (proj.description?.trim()) {
          out.push(
            new Paragraph({
              spacing: { after: 40, line: lineTwips },
              children: [
                new TextRun({
                  text: proj.description.trim(),
                  size: scalePt(20),
                  color: '374151',
                  font: fontName,
                }),
              ],
            }),
          );
        }

        for (const h of proj.highlights || []) {
          if (!h?.trim()) continue;
          out.push(
            new Paragraph({
              bullet: { level: 0 },
              spacing: { after: 30, line: lineTwips },
              children: [
                new TextRun({
                  text: h.trim(),
                  size: scalePt(19),
                  color: '1F2937',
                  font: fontName,
                }),
              ],
            }),
          );
        }
      }
      return out;
    };

    const buildSkillsSection = (): Paragraph[] => {
      if (!content.skills?.length) return [];
      const out: Paragraph[] = [this.buildSectionHeading('Technical Skills', accentHex)];
      const grouped = new Map<string, string[]>();
      for (const sk of content.skills) {
        if (!sk?.name?.trim()) continue;
        const cat = sk.category?.trim() || 'Core Stack';
        const list = grouped.get(cat) || [];
        list.push(sk.name.trim());
        grouped.set(cat, list);
      }

      if (grouped.size > 1) {
        for (const [category, items] of grouped.entries()) {
          out.push(
            new Paragraph({
              spacing: { after: 40, line: lineTwips },
              children: [
                new TextRun({
                  text: `${category}: `,
                  bold: true,
                  size: scalePt(20),
                  color: '111827',
                  font: fontName,
                }),
                new TextRun({
                  text: items.join(', '),
                  size: scalePt(20),
                  color: '374151',
                  font: fontName,
                }),
              ],
            }),
          );
        }
      } else {
        out.push(
          new Paragraph({
            spacing: { after: 60, line: lineTwips },
            children: [
              new TextRun({
                text: content.skills.map((s) => s.name).filter(Boolean).join(', '),
                size: scalePt(20),
                color: '374151',
                font: fontName,
              }),
            ],
          }),
        );
      }
      return out;
    };

    const buildEducationSection = (): Paragraph[] => {
      if (!content.education?.length) return [];
      const out: Paragraph[] = [this.buildSectionHeading('Education', accentHex)];
      for (const edu of content.education) {
        out.push(
          new Paragraph({
            spacing: { before: 80, after: 20 },
            tabStops: [{ type: TabStopType.RIGHT, position: rightTabTwips }],
            children: [
              new TextRun({
                text: edu.school || 'University',
                bold: true,
                size: scalePt(21),
                color: '111827',
                font: fontName,
              }),
              ...(edu.graduationDate
                ? [
                    new TextRun({ text: '\t' }),
                    new TextRun({
                      text: edu.graduationDate,
                      size: scalePt(19),
                      color: '4B5563',
                      font: fontName,
                    }),
                  ]
                : []),
            ],
          }),
        );

        const degreeLine = [edu.degree, edu.field].filter(Boolean).join(' in ');
        if (degreeLine) {
          out.push(
            new Paragraph({
              spacing: { after: 50 },
              children: [
                new TextRun({
                  text: degreeLine,
                  size: scalePt(20),
                  color: '374151',
                  font: fontName,
                }),
              ],
            }),
          );
        }
      }
      return out;
    };

    const buildCertificationsSection = (): Paragraph[] => {
      if (!content.certifications?.length) return [];
      const out: Paragraph[] = [
        this.buildSectionHeading('Certifications', accentHex),
      ];
      for (const cert of content.certifications) {
        out.push(
          new Paragraph({
            bullet: { level: 0 },
            spacing: { after: 30, line: lineTwips },
            children: [
              new TextRun({
                text: [cert.name, cert.issuer, cert.issueDate]
                  .filter(Boolean)
                  .join(' — '),
                size: scalePt(20),
                color: '1F2937',
                font: fontName,
              }),
            ],
          }),
        );
      }
      return out;
    };

    const buildCustomSection = (section: CustomResumeSection): Paragraph[] => {
      if (!section?.title?.trim() || !Array.isArray(section.entries) || section.entries.length === 0) {
        return [];
      }
      const out: Paragraph[] = [
        this.buildSectionHeading(section.title.trim(), accentHex),
      ];
      for (const entry of section.entries) {
        const headingText = (entry.heading || '').trim();
        if (!headingText) continue;
        const headerRuns: TextRun[] = [
          new TextRun({
            text: headingText,
            bold: true,
            size: scalePt(21),
            color: '111827',
            font: fontName,
          }),
        ];
        if (entry.subtitle?.trim()) {
          headerRuns.push(
            new TextRun({
              text: ` — ${entry.subtitle.trim()}`,
              italics: true,
              size: scalePt(20),
              color: '374151',
              font: fontName,
            }),
          );
        }
        const metaRight = [entry.locationOrLink?.trim(), entry.dateRange?.trim()]
          .filter(Boolean)
          .join('  |  ');
        if (metaRight) {
          headerRuns.push(new TextRun({ text: '\t' }));
          headerRuns.push(
            new TextRun({
              text: metaRight,
              size: scalePt(19),
              color: '4B5563',
              font: fontName,
            }),
          );
        }
        out.push(
          new Paragraph({
            tabStops: [{ type: TabStopType.RIGHT, position: rightTabTwips }],
            spacing: { before: 40, after: entry.bullets?.length ? 20 : 50 },
            children: headerRuns,
          }),
        );
        for (const bullet of entry.bullets || []) {
          const clean = (bullet || '').trim();
          if (!clean) continue;
          out.push(
            new Paragraph({
              bullet: { level: 0 },
              spacing: { after: 30, line: lineTwips },
              children: [
                new TextRun({
                  text: clean,
                  size: scalePt(20),
                  color: '1F2937',
                  font: fontName,
                }),
              ],
            }),
          );
        }
      }
      return out;
    };

    const customSections = Array.isArray(content.customSections)
      ? content.customSections
      : [];
    const customSectionMap = new Map<string, CustomResumeSection>();
    for (const sec of customSections) {
      if (sec?.id) {
        customSectionMap.set(`custom:${sec.id}`, sec);
      }
    }

    const builders: Record<BuiltInSectionKey, () => Paragraph[]> = {
      summary: buildSummarySection,
      experience: buildExperienceSection,
      projects: buildProjectsSection,
      skills: buildSkillsSection,
      education: buildEducationSection,
      certifications: buildCertificationsSection,
    };

    const validCustomKeys = Array.from(customSectionMap.keys()) as ResumeSectionKey[];
    const allAllowedSet = new Set<string>([...DEFAULT_SECTION_ORDER, ...validCustomKeys]);
    const requested = Array.isArray(layout.sectionOrder)
      ? layout.sectionOrder.filter((k): k is ResumeSectionKey => allAllowedSet.has(k))
      : [];
    const seenKeys = new Set<string>(requested);
    const orderedKeys: ResumeSectionKey[] = [
      ...requested,
      ...DEFAULT_SECTION_ORDER.filter((k) => !seenKeys.has(k)),
      ...validCustomKeys.filter((k) => !seenKeys.has(k)),
    ];
    const hiddenSet = new Set<ResumeSectionKey>(layout.hiddenSections || []);

    for (const key of orderedKeys) {
      if (hiddenSet.has(key)) continue;
      if (key.startsWith('custom:')) {
        const customSec = customSectionMap.get(key);
        if (customSec) children.push(...buildCustomSection(customSec));
      } else {
        children.push(...builders[key as BuiltInSectionKey]());
      }
    }

    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              size: {
                width: pageWidthTwips,
                height: pageHeightTwips,
              },
              margin: {
                top: marginTwips,
                right: marginTwips,
                bottom: marginTwips,
                left: marginTwips,
              },
            },
          },
          children,
        },
      ],
    });

    const buffer = await Packer.toBuffer(doc);
    const verified = await this.verifyDocxExtractability(buffer);
    const fileName = this.sanitizeFileName(options?.fileName || resume.name);

    this.logger.log(
      `Generated native DOCX "${fileName}" (${buffer.length} bytes, ${verified.extractableWords} words) in ${Date.now() - startedAt}ms`,
    );

    return {
      buffer,
      fileName,
      sizeBytes: buffer.length,
      ...verified,
    };
  }

  async generateCoverLetterDocx(
    letter: CoverLetter,
    fileName?: string,
  ): Promise<DocxExportResult> {
    const accentHex = (letter.accentColor || '#285FEA').replace('#', '');
    const marginTwips = 1080; // 0.75 inch executive letter margin
    const contactLine = [
      letter.senderEmail,
      letter.senderPhone,
      letter.senderLocation,
    ]
      .filter(Boolean)
      .join('  |  ');

    const children: Paragraph[] = [
      new Paragraph({
        spacing: { after: 40 },
        children: [
          new TextRun({
            text: letter.senderName,
            bold: true,
            size: 34,
            color: '111827',
            font: 'Calibri',
          }),
        ],
      }),
      new Paragraph({
        spacing: { after: contactLine ? 40 : 120 },
        children: [
          new TextRun({
            text: `Candidate — ${letter.targetRole}`,
            size: 20,
            bold: true,
            color: accentHex,
            font: 'Calibri',
          }),
        ],
      }),
      ...(contactLine
        ? [
            new Paragraph({
              spacing: { after: 160 },
              border: {
                bottom: {
                  style: BorderStyle.SINGLE,
                  size: 8,
                  color: accentHex,
                },
              },
              children: [
                new TextRun({
                  text: contactLine,
                  size: 19,
                  color: '4B5563',
                  font: 'Calibri',
                }),
              ],
            }),
          ]
        : []),
      new Paragraph({
        spacing: { before: 120, after: 100 },
        children: [
          new TextRun({
            text: new Date(letter.updatedAt || letter.createdAt).toLocaleDateString(
              'en-US',
              { month: 'long', day: 'numeric', year: 'numeric' },
            ),
            size: 20,
            color: '6B7280',
            font: 'Calibri',
          }),
        ],
      }),
      new Paragraph({
        spacing: { after: 180 },
        children: [
          new TextRun({
            text: letter.recipientLine || `${letter.companyName} Hiring Team`,
            bold: true,
            size: 21,
            color: '111827',
            font: 'Calibri',
          }),
        ],
      }),
      new Paragraph({
        spacing: { after: 140 },
        children: [
          new TextRun({
            text: letter.salutation,
            bold: true,
            size: 21,
            color: '111827',
            font: 'Calibri',
          }),
        ],
      }),
      ...[
        letter.openingParagraph,
        ...(letter.bodyParagraphs || []),
        letter.closingParagraph,
      ]
        .filter((p) => p?.trim())
        .map(
          (paragraph) =>
            new Paragraph({
              spacing: { after: 160, line: 288 },
              children: [
                new TextRun({
                  text: paragraph.trim(),
                  size: 21,
                  color: '1F2937',
                  font: 'Calibri',
                }),
              ],
            }),
        ),
      new Paragraph({
        spacing: { before: 120, after: 80 },
        children: [
          new TextRun({
            text: letter.signOff || 'Sincerely,',
            size: 21,
            color: '1F2937',
            font: 'Calibri',
          }),
        ],
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: letter.senderName,
            bold: true,
            size: 22,
            color: '111827',
            font: 'Calibri',
          }),
        ],
      }),
    ];

    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              size: { width: 11906, height: 16838 },
              margin: {
                top: marginTwips,
                right: marginTwips,
                bottom: marginTwips,
                left: marginTwips,
              },
            },
          },
          children,
        },
      ],
    });

    const buffer = await Packer.toBuffer(doc);
    const verified = await this.verifyDocxExtractability(buffer);
    const outName = this.sanitizeFileName(
      fileName || `${letter.title} - Cover Letter`,
      'Cover-Letter',
    );

    return {
      buffer,
      fileName: outName,
      sizeBytes: buffer.length,
      ...verified,
    };
  }

  private async verifyDocxExtractability(buffer: Buffer): Promise<{
    extractableChars: number;
    extractableWords: number;
    atsVerified: boolean;
  }> {
    try {
      const parsed = await mammoth.extractRawText({ buffer });
      const cleanText = (parsed.value || '').replace(/\s+/g, ' ').trim();
      const words = cleanText ? cleanText.split(' ').filter(Boolean).length : 0;
      return {
        extractableChars: cleanText.length,
        extractableWords: words,
        atsVerified: cleanText.length >= 80 && words >= 15,
      };
    } catch {
      return {
        extractableChars: 0,
        extractableWords: 0,
        atsVerified: false,
      };
    }
  }
}
