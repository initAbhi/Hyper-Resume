import type { ResumeContent } from '@/lib/api-client';

/**
 * Escapes reserved LaTeX characters in plain text to prevent compile errors.
 */
export function escapeLatex(text: string | null | undefined): string {
  if (!text) return '';
  return text
    .replace(/\\/g, '\0BS\0')
    .replace(/&/g, '\\&')
    .replace(/%/g, '\\%')
    .replace(/\$/g, '\\$')
    .replace(/#/g, '\\#')
    .replace(/_/g, '\\_')
    .replace(/\{/g, '\\{')
    .replace(/\}/g, '\\}')
    .replace(/~/g, '\\textasciitilde{}')
    .replace(/\^/g, '\\textasciicircum{}')
    .replace(/\0BS\0/g, '\\textbackslash{}');
}

/**
 * Generates production-grade ATS-verified LaTeX source (.tex)
 * modeled after the canonical Jake's Resume single-column standard.
 */
export function generateLatexFromResume(content: ResumeContent): string {
  const contact = content.contact || { fullName: '', email: '' };
  const contactItems: string[] = [];

  if (contact.email) {
    contactItems.push(`\\href{mailto:${escapeLatex(contact.email)}}{\\underline{${escapeLatex(contact.email)}}}`);
  }
  if (contact.phone) {
    contactItems.push(escapeLatex(contact.phone));
  }
  if (contact.linkedinUrl) {
    contactItems.push(`\\href{${escapeLatex(contact.linkedinUrl)}}{\\underline{LinkedIn}}`);
  }
  if (contact.githubUrl) {
    contactItems.push(`\\href{${escapeLatex(contact.githubUrl)}}{\\underline{GitHub}}`);
  }
  if (contact.websiteUrl) {
    contactItems.push(`\\href{${escapeLatex(contact.websiteUrl)}}{\\underline{Portfolio}}`);
  }
  if (contact.location) {
    contactItems.push(escapeLatex(contact.location));
  }

  const sections: string[] = [];

  // 1. Summary
  if (content.summary && content.summary.trim()) {
    sections.push(`%----------- SUMMARY -----------
\\section{Professional Summary}
\\small{
  ${escapeLatex(content.summary.trim())}
}
`);
  }

  // 2. Education
  if (content.education && content.education.length > 0) {
    const eduItems = content.education
      .map((edu) => {
        const degree = [edu.degree, edu.field].filter(Boolean).join(' in ');
        const date = edu.graduationDate || '';
        return `    \\resumeSubheading
      {${escapeLatex(edu.school || 'University')}}{${escapeLatex(edu.location || '')}}
      {${escapeLatex(degree || 'Degree')}}{${escapeLatex(date)}}`;
      })
      .join('\n');

    sections.push(`%----------- EDUCATION -----------
\\section{Education}
  \\resumeSubHeadingListStart
${eduItems}
  \\resumeSubHeadingListEnd
`);
  }

  // 3. Experience
  if (content.experience && content.experience.length > 0) {
    const expItems = content.experience
      .map((exp) => {
        const dates = [exp.startDate, exp.endDate || (exp.current ? 'Present' : '')].filter(Boolean).join(' -- ');
        const bullets = (exp.bullets || [])
          .filter((b) => Boolean(b && b.trim()))
          .map((b) => `        \\resumeItem{${escapeLatex(b.trim())}}`)
          .join('\n');

        return `    \\resumeSubheading
      {${escapeLatex(exp.title || 'Role')}}{${escapeLatex(dates)}}
      {${escapeLatex(exp.company || 'Company')}}{${escapeLatex(exp.location || '')}}
      \\resumeItemListStart
${bullets || '        \\resumeItem{Demonstrated impact and engineering contribution.}'}
      \\resumeItemListEnd`;
      })
      .join('\n');

    sections.push(`%----------- EXPERIENCE -----------
\\section{Experience}
  \\resumeSubHeadingListStart
${expItems}
  \\resumeSubHeadingListEnd
`);
  }

  // 4. Projects
  if (content.projects && content.projects.length > 0) {
    const projItems = content.projects
      .map((proj) => {
        const bullets = (proj.highlights || [])
          .filter((h) => Boolean(h && h.trim()))
          .map((h) => `        \\resumeItem{${escapeLatex(h.trim())}}`)
          .join('\n');

        const urlText = proj.url ? ` $|$ \\href{${escapeLatex(proj.url)}}{\\underline{Demo}}` : '';

        return `    \\resumeProjectHeading
      {\\textbf{${escapeLatex(proj.name || 'Project')}}${urlText}}{}
      \\resumeItemListStart
${bullets || `        \\resumeItem{${escapeLatex(proj.description || 'Designed and implemented core architecture.')}}`}
      \\resumeItemListEnd`;
      })
      .join('\n');

    sections.push(`%----------- PROJECTS -----------
\\section{Projects}
  \\resumeSubHeadingListStart
${projItems}
  \\resumeSubHeadingListEnd
`);
  }

  // 5. Skills
  if (content.skills && content.skills.length > 0) {
    // Group skills by category if present
    const categories: Record<string, string[]> = {};
    for (const skill of content.skills) {
      if (!skill?.name) continue;
      const cat = (skill.category && skill.category.trim()) || 'Technical Skills';
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push(skill.name);
    }

    const skillLines = Object.entries(categories)
      .map(([cat, list]) => `     \\textbf{${escapeLatex(cat)}}{: ${escapeLatex(list.join(', '))}} \\\\`)
      .join('\n');

    sections.push(`%----------- TECHNICAL SKILLS -----------
\\section{Technical Skills}
 \\begin{itemize}[leftmargin=0.15in, label={}]
    \\small{\\item{
${skillLines}
    }}
 \\end{itemize}
`);
  }

  // 6. Certifications
  if (content.certifications && content.certifications.length > 0) {
    const certItems = content.certifications
      .map((c) => {
        const issuer = c.issuer ? ` -- ${escapeLatex(c.issuer)}` : '';
        const date = c.issueDate ? ` (${escapeLatex(c.issueDate)})` : '';
        return `    \\resumeItem{\\textbf{${escapeLatex(c.name || 'Certification')}}${issuer}${date}}`;
      })
      .join('\n');

    sections.push(`%----------- CERTIFICATIONS -----------
\\section{Certifications}
  \\begin{itemize}[leftmargin=0.15in, label={}]
${certItems}
  \\end{itemize}
`);
  }

  return `%-------------------------
% Auto-generated by HyperResume (https://hype-resume.com)
% Standard single-column Jake's Resume ATS LaTeX Template
%-------------------------

\\documentclass[letterpaper,11pt]{article}

\\usepackage{latexsym}
\\usepackage[empty]{fullpage}
\\usepackage{titlesec}
\\usepackage{marvosym}
\\usepackage[usenames,dvipsnames]{color}
\\usepackage{verbatim}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{fancyhdr}
\\usepackage[english]{babel}
\\usepackage{tabularx}
\\input{glyphtounicode}

\\pagestyle{fancy}
\\fancyhf{}
\\fancyfoot{}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0pt}

% Margins
\\addtolength{\\oddsidemargin}{-0.5in}
\\addtolength{\\evensidemargin}{-0.5in}
\\addtolength{\\textwidth}{1in}
\\addtolength{\\topmargin}{-.5in}
\\addtolength{\\textheight}{1.0in}

\\urlstyle{same}
\\raggedbottom
\\raggedright
\\setlength{\\tabcolsep}{0in}

% Sections formatting
\\titleformat{\\section}{
  \\vspace{-4pt}\\scshape\\raggedright\\large
}{}{0em}{}[\\color{black}\\titlerule \\vspace{-5pt}]

\\pdfgentounicode=1

% Custom commands
\\newcommand{\\resumeItem}[1]{
  \\item\\small{
    {#1 \\vspace{-2pt}}
  }
}

\\newcommand{\\resumeSubheading}[4]{
  \\vspace{-2pt}\\item
    \\begin{tabular*}{0.97\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
      \\textbf{#1} & #2 \\\\
      \\textit{\\small#3} & \\textit{\\small #4} \\\\
    \\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\resumeProjectHeading}[2]{
    \\item
    \\begin{tabular*}{0.97\\textwidth}{l@{\\extracolsep{\\fill}}r}
      \\small#1 & #2 \\\\
    \\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\resumeSubHeadingListStart}{\\begin{itemize}[leftmargin=0.15in, label={}]}
\\newcommand{\\resumeSubHeadingListEnd}{\\end{itemize}}
\\newcommand{\\resumeItemListStart}{\\begin{itemize}}
\\newcommand{\\resumeItemListEnd}{\\end{itemize}\\vspace{-5pt}}

\\begin{document}

%---------- HEADING ----------
\\begin{center}
    \\textbf{\\Huge \\scshape ${escapeLatex(contact.fullName || 'Candidate')}} \\\\ \\vspace{1pt}
    \\small ${contactItems.join(' $|$ ')}
\\end{center}

${sections.join('\n')}

\\end{document}
`;
}
