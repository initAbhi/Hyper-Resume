'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SampleResume } from '@/data/sample-resumes';
import { CompanyBrandBadge } from './CompanyBrandBadge';
import {
  X,
  Sparkles,
  Copy,
  Check,
  Printer,
  ShieldCheck,
} from 'lucide-react';
import { apiClient, ResumeContent } from '@/lib/api-client';
import { logger } from '@/lib/logger';
import { useAuth } from '@/lib/auth-context';

interface SampleResumeModalProps {
  resume: SampleResume | null;
  isOpen: boolean;
  onClose: () => void;
}

export function SampleResumeModal({ resume, isOpen, onClose }: SampleResumeModalProps) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [isCloning, setIsCloning] = useState(false);
  const [copied, setCopied] = useState(false);
  const [cloneError, setCloneError] = useState<string | null>(null);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !resume) return null;

  const handleUseTemplate = async () => {
    setIsCloning(true);
    setCloneError(null);

    const resumeContent: ResumeContent = {
      contact: {
        fullName: user?.fullName || resume.candidate.name,
        email: user?.email || resume.candidate.email,
        phone: resume.candidate.phone,
        location: resume.candidate.location,
        linkedinUrl: resume.candidate.linkedin ? `https://${resume.candidate.linkedin}` : undefined,
        githubUrl: resume.candidate.github ? `https://${resume.candidate.github}` : undefined,
      },
      headline: resume.role,
      summary: resume.summary,
      skills: resume.skills.flatMap((cat) =>
        cat.skills.map((skillName) => ({
          name: skillName,
          category: cat.category,
        }))
      ),
      experience: resume.experience.map((exp) => ({
        company: exp.company,
        title: exp.title,
        location: exp.location,
        startDate: exp.startDate,
        endDate: exp.endDate,
        current: !!exp.current,
        bullets: exp.bullets,
      })),
      education: resume.education.map((edu) => ({
        school: edu.school,
        degree: edu.degree,
        field: edu.field,
        graduationDate: edu.graduationDate,
      })),
      projects: resume.projects?.map((proj) => ({
        name: proj.name,
        description: proj.description,
        highlights: proj.highlights,
        url: proj.url,
      })),
      certifications: resume.certifications?.map((cert) => ({
        name: cert,
        issuer: resume.company,
      })),
    };

    if (!isAuthenticated) {
      try {
        sessionStorage.setItem(
          'pending_cloned_resume',
          JSON.stringify({
            title: `${resume.company} - ${resume.role}`,
            targetRole: resume.role,
            targetCompany: resume.company,
            content: resumeContent,
          })
        );
      } catch {}
      router.push('/login?redirect=/app/resumes&action=clone_sample');
      return;
    }

    try {
      const created = await apiClient.createResume({
        name: `${resume.company} - ${resume.role}`,
        targetRole: resume.role,
        targetCompany: resume.company,
        content: resumeContent,
      });

      router.push(`/app/resumes/${created.id}`);
    } catch (err: unknown) {
      logger.error('Failed to clone resume sample', err);
      setCloneError(
        err instanceof Error ? err.message : 'Failed to clone resume into your workspace. Please try again.'
      );
      setIsCloning(false);
    }
  };

  const handleCopyText = async () => {
    const textLines: string[] = [
      `# ${resume.candidate.name}`,
      `${resume.candidate.title}`,
      `${resume.candidate.location} | ${resume.candidate.email} | ${resume.candidate.phone}`,
      `${resume.candidate.linkedin}${resume.candidate.github ? ` | ${resume.candidate.github}` : ''}`,
      '',
      '## PROFESSIONAL SUMMARY',
      resume.summary,
      '',
      '## SKILLS',
      ...resume.skills.map((s) => `**${s.category}:** ${s.skills.join(', ')}`),
      '',
      '## WORK EXPERIENCE',
      ...resume.experience.flatMap((exp) => [
        `### ${exp.title} | ${exp.company} (${exp.location})`,
        `${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}`,
        ...exp.bullets.map((b) => `- ${b}`),
        '',
      ]),
      '## EDUCATION',
      ...resume.education.map(
        (edu) =>
          `- **${edu.degree} in ${edu.field}**, ${edu.school} (${edu.graduationDate})${edu.gpa ? ` - GPA: ${edu.gpa}` : ''}${edu.honors ? ` [${edu.honors}]` : ''}`
      ),
    ];

    if (resume.projects && resume.projects.length > 0) {
      textLines.push('', '## PROJECTS');
      resume.projects.forEach((p) => {
        textLines.push(`### ${p.name}`);
        textLines.push(p.description);
        p.highlights.forEach((h) => textLines.push(`- ${h}`));
      });
    }

    if (resume.certifications && resume.certifications.length > 0) {
      textLines.push('', '## CERTIFICATIONS');
      resume.certifications.forEach((c) => textLines.push(`- ${c}`));
    }

    try {
      await navigator.clipboard.writeText(textLines.join('\n'));
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {}
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      id="sample-resume-modal-wrapper"
      onClick={onClose}
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-5 print:p-0 print:bg-white print:static print:block print:overflow-visible print:z-auto"
    >
      <div
        className="relative w-full max-w-5xl bg-white dark:bg-[#14171C] border border-[#E2E5E9] dark:border-[#252A33] rounded-2xl shadow-2xl flex flex-col h-[94vh] max-h-[960px] overflow-hidden print:h-auto print:max-h-none print:border-none print:shadow-none print:bg-white print:overflow-visible print:w-full print:max-w-none print:block"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sleek Top Header Bar */}
        <div className="h-auto py-2.5 sm:py-0 sm:h-16 px-3 sm:px-6 border-b border-[#E2E5E9] dark:border-[#252A33] bg-white/95 dark:bg-[#14171C]/95 backdrop-blur-md flex items-center justify-between gap-2.5 sm:gap-4 shrink-0 print:hidden z-10">
          {/* Left: Brand Badge + Role & Metadata */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="p-1 sm:p-2 rounded-lg bg-[#F7F8FA] dark:bg-[#1D2128] border border-[#E2E5E9] dark:border-[#252A33] shrink-0">
              <CompanyBrandBadge companyKey={resume.companyKey} companyName={resume.company} />
            </div>
            <div className="min-w-0 flex flex-col justify-center">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h3 className="text-xs sm:text-base font-bold text-[#1A1D23] dark:text-[#F0F2F5] truncate leading-tight">
                  {resume.role}
                </h3>
                {resume.badge === 'PRO' ? (
                  <span className="text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded border border-[#285FEA]/30 bg-[#285FEA]/10 text-[#285FEA] dark:bg-[#285FEA]/20 dark:text-[#60A5FA] shrink-0">
                    {resume.badge}
                  </span>
                ) : (
                  <span className="text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded border border-[#E2E5E9] dark:border-[#252A33] bg-[#F1F3F5] text-[#5A6270] dark:bg-[#1D2128] dark:text-[#9EA7B4] shrink-0">
                    {resume.badge}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-[#5A6270] dark:text-[#9EA7B4] mt-0.5">
                <span className="truncate">
                  Target: <strong className="text-[#1A1D23] dark:text-[#F0F2F5] font-semibold">{resume.company}</strong>
                </span>
                <span>&bull;</span>
                <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.2 rounded-full text-[10px] sm:text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/60 shrink-0">
                  <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  <span className="hidden xs:inline">{resume.atsScore}/100</span>
                  <span>ATS</span>
                </span>
              </div>
            </div>
          </div>

          {/* Right: Sleek Action Cluster */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Copy Button */}
            <button
              type="button"
              onClick={handleCopyText}
              className="h-8 sm:h-8.5 px-2.5 sm:px-3 rounded-lg text-xs font-semibold border border-[#E2E5E9] dark:border-[#252A33] bg-[#F7F8FA] dark:bg-[#1D2128] hover:bg-[#EAEFF5] dark:hover:bg-[#252A33] text-[#1A1D23] dark:text-[#F0F2F5] transition-all flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
              title="Copy formatted resume text"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold hidden sm:inline">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[#5A6270] dark:text-[#9EA7B4]" />
                  <span className="hidden sm:inline">Copy Text</span>
                </>
              )}
            </button>

            {/* Print / Save PDF Button */}
            <button
              type="button"
              onClick={handlePrint}
              className="hidden sm:flex h-8.5 px-3 rounded-lg text-xs font-semibold border border-[#E2E5E9] dark:border-[#252A33] bg-[#F7F8FA] dark:bg-[#1D2128] hover:bg-[#EAEFF5] dark:hover:bg-[#252A33] text-[#1A1D23] dark:text-[#F0F2F5] transition-all items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
              title="Print or save as PDF"
            >
              <Printer className="w-3.5 h-3.5 text-[#5A6270] dark:text-[#9EA7B4]" />
              <span>Print / PDF</span>
            </button>

            {/* Primary Action Button */}
            <button
              type="button"
              onClick={handleUseTemplate}
              disabled={isCloning}
              className="h-8 sm:h-8.5 px-3 sm:px-4 rounded-lg text-xs font-bold bg-[#285FEA] hover:bg-[#1E4BC8] text-white transition-all shadow-sm hover:shadow-[#285FEA]/25 flex items-center gap-1.5 active:scale-95 disabled:opacity-60 cursor-pointer"
            >
              {isCloning ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span className="hidden sm:inline">Cloning...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Use This Template</span>
                  <span className="sm:hidden">Use</span>
                </>
              )}
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="h-8 sm:h-8.5 w-8 sm:w-8.5 rounded-lg flex items-center justify-center text-[#848D9A] hover:text-[#1A1D23] dark:hover:text-[#F0F2F5] hover:bg-[#F1F3F5] dark:hover:bg-[#1D2128] transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Error notification if cloning fails */}
        {cloneError && (
          <div className="p-3 bg-red-50 dark:bg-red-950/60 border-b border-red-200 dark:border-red-800/80 text-red-700 dark:text-red-200 text-xs flex items-center justify-between shrink-0 print:hidden">
            <span>{cloneError}</span>
            <button onClick={() => setCloneError(null)} className="text-red-500 hover:text-red-800 dark:hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Document Viewport Canvas (Authentic A4 / US-Letter desk sheet) */}
        <div className="flex-1 overflow-y-auto p-2 sm:p-6 md:p-10 bg-[#EDF0F3] dark:bg-[#0B0D11] print:p-0 print:bg-white print:overflow-visible">
          <div
            id="resume-document-print"
            className="w-full max-w-[840px] min-h-[1140px] h-fit mx-auto bg-white text-zinc-900 shadow-[0_12px_40px_rgba(0,0,0,0.08)] border border-zinc-200/90 rounded-[3px] p-4 sm:p-8 md:p-14 flex flex-col justify-between print:shadow-none print:border-none print:p-0 print:rounded-none print:min-h-0 print:max-w-none print:w-full print:bg-white"
          >
            <div>
              {/* Header: Candidate Info */}
              <div className="text-center pb-2 mb-4">
                <h1 className="font-sans font-extrabold text-2xl sm:text-[28px] tracking-tight text-zinc-950 uppercase mb-1">
                  {resume.candidate.name}
                </h1>
                <p className="text-xs sm:text-sm font-semibold text-zinc-700 tracking-wide mb-1.5">
                  {resume.candidate.title}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 text-xs text-zinc-600 font-medium">
                  <span>{resume.candidate.location}</span>
                  <span>&bull;</span>
                  <span className="text-zinc-900 font-medium">{resume.candidate.email}</span>
                  <span>&bull;</span>
                  <span>{resume.candidate.phone}</span>
                  <span>&bull;</span>
                  <span className="text-[#285FEA] font-semibold">{resume.candidate.linkedin}</span>
                  {resume.candidate.github && (
                    <>
                      <span>&bull;</span>
                      <span className="text-[#285FEA] font-semibold">{resume.candidate.github}</span>
                    </>
                  )}
                  {resume.candidate.portfolio && (
                    <>
                      <span>&bull;</span>
                      <span className="text-[#285FEA] font-semibold">{resume.candidate.portfolio}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Bold Section Divider */}
              <div className="w-full h-[1.5px] bg-zinc-900 my-3" />

              {/* Section: Professional Summary */}
              <div className="mb-5">
                <h2 className="text-[11px] font-bold tracking-[0.14em] text-zinc-950 uppercase border-b border-zinc-300 pb-0.5 mb-2">
                  PROFESSIONAL SUMMARY
                </h2>
                <p className="text-xs leading-relaxed text-zinc-800 text-justify">
                  {resume.summary}
                </p>
              </div>

              {/* Section: Skills */}
              <div className="mb-5">
                <h2 className="text-[11px] font-bold tracking-[0.14em] text-zinc-950 uppercase border-b border-zinc-300 pb-0.5 mb-2">
                  TECHNICAL SKILLS
                </h2>
                <div className="space-y-1">
                  {resume.skills.map((group, idx) => (
                    <div key={idx} className="text-xs text-zinc-800 flex flex-wrap items-baseline gap-1.5 leading-relaxed">
                      <span className="font-bold text-zinc-950">{group.category}:</span>
                      <span>{group.skills.join(', ')}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section: Work Experience */}
              <div className="mb-5">
                <h2 className="text-[11px] font-bold tracking-[0.14em] text-zinc-950 uppercase border-b border-zinc-300 pb-0.5 mb-2.5">
                  PROFESSIONAL EXPERIENCE
                </h2>
                <div className="space-y-4">
                  {resume.experience.map((exp, idx) => (
                    <div key={idx} className="resume-entry space-y-1">
                      <div className="flex flex-wrap justify-between items-baseline gap-1">
                        <div className="text-xs font-bold text-zinc-950">
                          {exp.title}{' '}
                          <span className="font-semibold text-zinc-700">&mdash; {exp.company}</span>
                        </div>
                        <div className="text-xs text-zinc-600 font-medium">
                          {exp.startDate} &ndash; {exp.current ? 'Present' : exp.endDate}
                        </div>
                      </div>
                      <div className="text-[11px] italic text-zinc-600 font-medium">
                        {exp.location}
                      </div>
                      <ul className="list-disc list-outside pl-4 space-y-1 text-xs text-zinc-800 leading-relaxed text-justify">
                        {exp.bullets.map((bullet, bIdx) => (
                          <li key={bIdx}>{bullet}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section: Projects (if present) */}
              {resume.projects && resume.projects.length > 0 && (
                <div className="mb-5">
                  <h2 className="text-[11px] font-bold tracking-[0.14em] text-zinc-950 uppercase border-b border-zinc-300 pb-0.5 mb-2.5">
                    KEY PROJECTS
                  </h2>
                  <div className="space-y-3.5">
                    {resume.projects.map((proj, idx) => (
                      <div key={idx} className="resume-entry space-y-1">
                        <div className="flex flex-wrap justify-between items-baseline gap-1">
                          <div className="text-xs font-bold text-zinc-950">
                            {idx + 1}. {proj.name}
                            {proj.techStack && proj.techStack.length > 0 && (
                              <span className="font-normal text-zinc-600 ml-1.5 text-[11px]">
                                ({proj.techStack.join(' &bull; ')})
                              </span>
                            )}
                          </div>
                          {proj.url && (
                            <span className="text-[11px] text-[#285FEA] font-medium">
                              {proj.url}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-zinc-700 leading-relaxed">{proj.description}</p>
                        <ul className="list-disc list-outside pl-4 space-y-0.5 text-xs text-zinc-800 leading-relaxed">
                          {proj.highlights.map((hl, hIdx) => (
                            <li key={hIdx}>{hl}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Section: Education */}
              <div className="mb-5">
                <h2 className="text-[11px] font-bold tracking-[0.14em] text-zinc-950 uppercase border-b border-zinc-300 pb-0.5 mb-2">
                  EDUCATION
                </h2>
                <div className="space-y-2">
                  {resume.education.map((edu, idx) => (
                    <div key={idx} className="resume-entry text-xs text-zinc-800 flex justify-between items-baseline">
                      <div>
                        <span className="font-bold text-zinc-950">
                          {edu.degree} in {edu.field}
                        </span>
                        <span className="text-zinc-700"> &mdash; {edu.school}</span>
                        {edu.gpa && <span className="text-zinc-600 font-medium"> (GPA: {edu.gpa})</span>}
                        {edu.honors && <span className="text-zinc-600 italic"> [{edu.honors}]</span>}
                      </div>
                      <span className="text-xs text-zinc-600 font-medium shrink-0 ml-2">
                        {edu.graduationDate}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section: Certifications (if present) */}
              {resume.certifications && resume.certifications.length > 0 && (
                <div className="resume-entry">
                  <h2 className="text-[11px] font-bold tracking-[0.14em] text-zinc-950 uppercase border-b border-zinc-300 pb-0.5 mb-2">
                    CERTIFICATIONS
                  </h2>
                  <ul className="list-disc list-outside pl-4 space-y-1 text-xs text-zinc-800">
                    {resume.certifications.map((cert, idx) => (
                      <li key={idx} className="font-medium">
                        {cert}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Document Bottom Stamp */}
            <div className="mt-8 pt-3 border-t border-zinc-200 flex items-center justify-between text-[10px] text-zinc-400 print:hidden select-none">
              <span className="font-medium">HypeResume 100% ATS Verified Single-Column Architecture</span>
              <span>Standard Unicode UTF-8 &bull; Tableless Flow</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
