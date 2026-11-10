import type { CoverLetter } from '@/lib/api-client';

export function countCoverLetterWords(
  letter: Pick<
    CoverLetter,
    'openingParagraph' | 'bodyParagraphs' | 'closingParagraph'
  >,
): number {
  const parts = [
    letter.openingParagraph || '',
    ...(letter.bodyParagraphs || []),
    letter.closingParagraph || '',
  ];
  return parts
    .join(' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

export function estimateReadTimeLabel(wordCount: number): string {
  if (wordCount <= 0) return '0 sec read';
  const seconds = Math.max(15, Math.round((wordCount / 220) * 60));
  if (seconds < 60) return `~${seconds} sec read`;
  const mins = Math.round((seconds / 60) * 10) / 10;
  return `~${mins} min read`;
}

export function formatCoverLetterDate(dateInput?: string | Date): string {
  const dt = dateInput ? new Date(dateInput) : new Date();
  if (Number.isNaN(dt.getTime())) {
    return new Date().toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }
  return dt.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatCoverLetterPlainText(letter: CoverLetter): string {
  const contactParts = [
    letter.senderEmail,
    letter.senderPhone,
    letter.senderLocation,
  ].filter(Boolean);

  const lines: string[] = [
    letter.senderName,
    ...(contactParts.length > 0 ? [contactParts.join(' | ')] : []),
    '',
    formatCoverLetterDate(letter.updatedAt || letter.createdAt),
    '',
    ...(letter.recipientLine ? [letter.recipientLine, ''] : []),
    letter.salutation,
    '',
    letter.openingParagraph,
    '',
    ...(letter.bodyParagraphs || []).flatMap((p) => [p, '']),
    letter.closingParagraph,
    '',
    letter.signOff,
    letter.senderName,
  ];

  return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

export function collectCoverLetterDocumentStyles(origin: string): string {
  const chunks: string[] = [];

  for (const sheet of Array.from(document.styleSheets)) {
    try {
      const rules = Array.from(sheet.cssRules || []);
      const cssText = rules.map((r) => r.cssText).join('\n');
      const resolvedCss = cssText.replace(
        /url\(\s*(["']?)\/(?!\/)/g,
        `url($1${origin}/`,
      );
      chunks.push(resolvedCss);
    } catch {
      if (sheet.href) {
        chunks.push(`@import url("${sheet.href}");`);
      }
    }
  }

  return chunks.join('\n');
}

export function serializeCoverLetterDocumentHtml(
  elementId: string,
  origin: string,
): string {
  const el = document.getElementById(elementId);
  if (!el) {
    throw new Error('Cover letter preview document is not mounted.');
  }

  const clone = el.cloneNode(true) as HTMLElement;
  clone.querySelectorAll('.print\\:hidden, [data-export-exclude="true"]').forEach((node) => {
    node.remove();
  });

  clone.querySelectorAll<HTMLImageElement>('img').forEach((img) => {
    const rawSrc = img.getAttribute('src');
    if (rawSrc && rawSrc.startsWith('/') && !rawSrc.startsWith('//')) {
      img.setAttribute('src', `${origin}${rawSrc}`);
    }
  });

  return clone.outerHTML;
}

