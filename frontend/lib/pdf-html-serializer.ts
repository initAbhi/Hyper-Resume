/**
 * Shared client helper for serializing the rendered resume canvas HTML and active
 * stylesheets for true vector ATS PDF rendering across authenticated exports and
 * public recruiter views.
 */
export function collectDocumentStyles(origin: string): string {
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

export function serializeCleanResumeHtml(
  targetContainerId: string,
  origin: string,
): string {
  const container = document.getElementById(targetContainerId);
  if (!container) {
    throw new Error('Resume canvas container not found.');
  }

  const clone = container.cloneNode(true) as HTMLElement;
  clone.classList.add('pdf-export-mode');

  clone
    .querySelectorAll('.print\\:hidden, [data-export-exclude="true"]')
    .forEach((el) => el.remove());

  clone
    .querySelectorAll<HTMLElement>('.ats-keyword-highlight, mark')
    .forEach((m) => {
      m.style.setProperty('background', 'transparent', 'important');
      m.style.setProperty('background-color', 'transparent', 'important');
      m.style.setProperty('border', 'none', 'important');
      m.style.setProperty('padding', '0', 'important');
      m.style.setProperty('color', 'inherit', 'important');
      m.style.setProperty('font-weight', 'inherit', 'important');
      m.style.setProperty('box-shadow', 'none', 'important');
    });

  clone.querySelectorAll<HTMLImageElement>('img').forEach((img) => {
    const rawSrc = img.getAttribute('src');
    if (rawSrc && rawSrc.startsWith('/') && !rawSrc.startsWith('//')) {
      img.setAttribute('src', `${origin}${rawSrc}`);
    }
  });

  return clone.outerHTML;
}

export function buildVectorPdfPayload(
  targetContainerId: string,
  fileName: string,
  pageSize: 'A4' | 'US Letter' = 'A4',
) {
  const origin = window.location.origin;
  const html = serializeCleanResumeHtml(targetContainerId, origin);
  const styles = collectDocumentStyles(origin);

  const computedRoot = window.getComputedStyle(document.documentElement);
  const fontInter = computedRoot.getPropertyValue('--font-inter').trim();
  const fontRubik = computedRoot.getPropertyValue('--font-rubik').trim();
  const rootVars = [
    fontInter ? `--font-inter: ${fontInter};` : '',
    fontRubik ? `--font-rubik: ${fontRubik};` : '',
  ]
    .filter(Boolean)
    .join(' ');

  return {
    html,
    styles,
    pageSize,
    fileName,
    htmlClassName: document.documentElement.className,
    rootStyle: rootVars,
  };
}

