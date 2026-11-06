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
  MapPin,
  FileText,
  Layers,
  Wand2,
} from 'lucide-react';
import { apiClient, ResumeContent } from '@/lib/api-client';
import { logger } from '@/lib/logger';
import { useAuth } from '@/lib/auth-context';

interface SampleResumeModalProps {
  resume: SampleResume | null;
  isOpen: boolean;
  onClose: () => void;
  onAdaptWithProfile?: (resume: SampleResume) => void;
}

export function SampleResumeModal({
  resume,
  isOpen,
  onClose,
  onAdaptWithProfile,
}: SampleResumeModalProps) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [isCloning, setIsCloning] = useState(false);
  const [cloningMode, setCloningMode] = useState<'full' | 'starter' | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
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

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2400);
  };

  if (!isOpen || !resume) return null;

  // Mode 2: Full Template (with complete editable illustrative sample content)
  const handleUseFullTemplate = async () => {
    setIsCloning(true);
    setCloningMode('full');
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
        field: edu.field || edu.degree,
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
        name: `${resume.company} - ${resume.role} (Full Template)`,
        targetRole: resume.role,
        targetCompany: resume.company,
        content: resumeContent,
      });

      router.push(`/app/resumes/${created.id}`);
    } catch (err: unknown) {
      logger.error('Failed to clone full resume template', err);
      setCloneError(
        err instanceof Error ? err.message : 'Failed to clone resume into your workspace. Please try again.'
      );
      setIsCloning(false);
      setCloningMode(null);
    }
  };

  // Mode 1: Starter Template (clean structure, cleared fictional identity & achievements)
  const handleUseStarterTemplate = async () => {
    setIsCloning(true);
    setCloningMode('starter');
    setCloneError(null);

    const starterContent: ResumeContent = {
      contact: {
        fullName: user?.fullName || 'Your Full Name',
        email: user?.email || 'your.email@example.com',
        phone: '',
        location: '',
      },
      headline: resume.role,
      summary: `Targeted ${resume.role} professional summary highlighting your key achievements, core technical competencies, and value delivered.`,
      skills: resume.skills.flatMap((cat) =>
        cat.skills.slice(0, 3).map((skillName) => ({
          name: skillName,
          category: cat.category,
        }))
      ),
      experience: [
        {
          company: 'Your Current or Most Recent Company',
          title: resume.role,
          location: 'City, Country',
          startDate: '2023-01',
          current: true,
          bullets: [
            'Led high-impact project or team initiative, achieving measurable business outcome (e.g. reduced latency, increased conversion, improved efficiency).',
            'Implemented core technical or domain features utilizing modern best practices, tools, and cross-functional collaboration.',
            'Optimized operational workflows or architectural performance, delivering reliability and measurable results.',
          ],
        },
      ],
      education: [
        {
          school: 'Your College / University',
          degree: 'Bachelor / Master of Science',
          field: 'Your Field of Study',
          graduationDate: 'Graduation Year',
        },
      ],
      projects: [
        {
          name: 'Key Project or Initiative Name',
          description: 'Brief 1-2 sentence overview of the project scope and business or technical objective.',
          highlights: [
            'Designed and delivered key project components with high code quality and test coverage.',
            'Achieved quantifiable performance or user engagement milestones.',
          ],
        },
      ],
    };

    if (!isAuthenticated) {
      try {
        sessionStorage.setItem(
          'pending_cloned_resume',
          JSON.stringify({
            title: `${resume.role} (Starter Template)`,
            targetRole: resume.role,
            targetCompany: resume.company,
            content: starterContent,
          })
        );
      } catch {}
      router.push('/login?redirect=/app/resumes&action=clone_starter');
      return;
    }

    try {
      const created = await apiClient.createResume({
        name: `${resume.role} (Starter Template)`,
        targetRole: resume.role,
        targetCompany: resume.company,
        content: starterContent,
      });

      router.push(`/app/resumes/${created.id}`);
    } catch (err: unknown) {
      logger.error('Failed to create starter template', err);
      setCloneError(
        err instanceof Error ? err.message : 'Failed to create starter template. Please try again.'
      );
      setIsCloning(false);
      setCloningMode(null);
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
      '## PROFESSIONAL EXPERIENCE',
      ...resume.experience.flatMap((exp) => [
        `### ${exp.title} - ${exp.company} (${exp.startDate} - ${exp.current ? 'Present' : exp.endDate})`,
        `*${exp.location}*`,
        ...exp.bullets.map((b) => `- ${b}`),
        '',
      ]),
      '## EDUCATION',
      ...resume.education.map(
        (edu) => `- ${edu.degree} in ${edu.field}, ${edu.school} (${edu.graduationDate})`
      ),
    ];

    try {
      await navigator.clipboard.writeText(textLines.join('\n'));
      showToast('Full resume text copied to clipboard!');
    } catch {}
  };

  const handleCopySummary = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(resume.summary);
      showToast('Summary copied to clipboard!');
    } catch {}
  };

  const handleCopySkills = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const skillsText = resume.skills
      .map((cat) => `${cat.category}: ${cat.skills.join(', ')}`)
      .join('\n');
    try {
      await navigator.clipboard.writeText(skillsText);
      showToast('Skills copied to clipboard!');
    } catch {}
  };

  const handleCopyBullet = async (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      showToast('Bullet point copied to clipboard!');
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
                <span className="text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded border border-[#285FEA]/30 bg-[#285FEA]/10 text-[#285FEA] dark:bg-[#285FEA]/20 dark:text-[#60A5FA] shrink-0">
                  {resume.badge}
                </span>
                <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                  Illustrative Sample
                </span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-[#5A6270] dark:text-[#9EA7B4] mt-0.5">
                <span className="font-medium text-zinc-700 dark:text-zinc-300">{resume.experienceLevelLabel}</span>
                <span>&bull;</span>
                <span className="inline-flex items-center gap-0.5">
                  <MapPin className="w-2.5 h-2.5" />
                  {resume.country}
                </span>
                <span>&bull;</span>
                <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.2 rounded-full text-[10px] sm:text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/60 shrink-0">
                  <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  <span>{resume.atsScore}/100 ATS</span>
                </span>
              </div>
            </div>
          </div>

          {/* Right: Actions Cluster */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Copy Full Text */}
            <button
              type="button"
              onClick={handleCopyText}
              className="h-8 sm:h-8.5 px-2.5 sm:px-3 rounded-lg text-xs font-semibold border border-[#E2E5E9] dark:border-[#252A33] bg-[#F7F8FA] dark:bg-[#1D2128] hover:bg-[#EAEFF5] dark:hover:bg-[#252A33] text-[#1A1D23] dark:text-[#F0F2F5] transition-all flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
              title="Copy formatted resume text"
            >
              <Copy className="w-3.5 h-3.5 text-[#5A6270] dark:text-[#9EA7B4]" />
              <span className="hidden sm:inline">Copy Text</span>
            </button>

            {/* Print / PDF */}
            <button
              type="button"
              onClick={handlePrint}
              className="hidden sm:flex h-8.5 px-3 rounded-lg text-xs font-semibold border border-[#E2E5E9] dark:border-[#252A33] bg-[#F7F8FA] dark:bg-[#1D2128] hover:bg-[#EAEFF5] dark:hover:bg-[#252A33] text-[#1A1D23] dark:text-[#F0F2F5] transition-all items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
              title="Print or save as PDF"
            >
              <Printer className="w-3.5 h-3.5 text-[#5A6270] dark:text-[#9EA7B4]" />
              <span>Print / PDF</span>
            </button>

            {/* Mode 1: Starter Template Action */}
            <button
              type="button"
              onClick={handleUseStarterTemplate}
              disabled={isCloning}
              className="h-8 sm:h-8.5 px-2.5 sm:px-3 rounded-lg text-xs font-bold border border-[#285FEA]/40 text-[#285FEA] dark:text-[#60A5FA] bg-[#285FEA]/5 hover:bg-[#285FEA]/10 transition-all flex items-center gap-1.5 active:scale-95 disabled:opacity-60 cursor-pointer"
              title="Create a clean resume using this structure without fictional achievements"
            >
              {isCloning && cloningMode === 'starter' ? (
                <div className="w-3.5 h-3.5 border-2 border-[#285FEA] border-t-transparent rounded-full animate-spin" />
              ) : (
                <Layers className="w-3.5 h-3.5" />
              )}
              <span className="hidden md:inline">Use Starter Template</span>
              <span className="md:hidden">Starter</span>
            </button>

            {/* Mode 3: Adapt With My Profile (AI Intelligence) */}
            <button
              type="button"
              onClick={() => {
                if (onAdaptWithProfile) {
                  onAdaptWithProfile(resume);
                }
              }}
              className="h-8 sm:h-8.5 px-2.5 sm:px-3 rounded-lg text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white transition-all shadow-sm flex items-center gap-1.5 active:scale-95 cursor-pointer"
              title="Adapt your existing profile facts to match this sample structure and phrasing (3 Credits)"
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Adapt With My Profile</span>
              <span className="lg:hidden">Adapt</span>
            </button>

            {/* Mode 2: Full Template Action */}
            <button
              type="button"
              onClick={handleUseFullTemplate}
              disabled={isCloning}
              className="h-8 sm:h-8.5 px-3 sm:px-3.5 rounded-lg text-xs font-bold bg-[#285FEA] hover:bg-[#1E4BC8] text-white transition-all shadow-sm flex items-center gap-1.5 active:scale-95 disabled:opacity-60 cursor-pointer"
              title="Clone complete sample resume into your workspace"
            >
              {isCloning && cloningMode === 'full' ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              <span className="hidden md:inline">Use Full Template</span>
              <span className="md:hidden">Full</span>
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

        {/* Global Toast Notification */}
        {toastMessage && (
          <div className="absolute top-18 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-zinc-900 text-white text-xs font-semibold shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-150">
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Error notification if cloning fails */}
        {cloneError && (
          <div className="p-3 bg-red-50 dark:bg-red-950/60 border-b border-red-200 dark:border-red-800/80 text-red-700 dark:text-red-200 text-xs flex items-center justify-between shrink-0 print:hidden">
            <span>{cloneError}</span>
            <button onClick={() => setCloneError(null)} className="text-red-500 hover:text-red-800 dark:hover:text-white cursor-pointer">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Document Body: Authentic A4 Single-Column ATS Resume */}
        <div className="flex-1 overflow-y-auto bg-[#F1F3F5] dark:bg-[#0D0F12] p-3 sm:p-8 flex justify-center print:p-0 print:bg-white print:overflow-visible">
          <div className="w-full max-w-[800px] bg-white text-zinc-900 shadow-xl rounded-md p-6 sm:p-10 border border-zinc-200 font-sans leading-normal print:shadow-none print:border-none print:p-0 print:w-full print:max-w-none">
            {/* Disclaimer Bar */}
            <div className="mb-4 pb-2 border-b border-zinc-100 flex items-center justify-between text-[11px] text-zinc-500 print:hidden">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="font-semibold text-zinc-700">Verified ATS Benchmark ({resume.resumeStyle})</span>
              </div>
              <span className="text-zinc-400 italic">
                Note: Candidate identity is illustrative for demonstration.
              </span>
            </div>

            {/* 1. Candidate Header */}
            <div className="text-center pb-3 border-b border-zinc-300">
              <h1 className="font-serif font-bold text-2xl sm:text-3xl text-zinc-950 tracking-tight">
                {resume.candidate.name}
              </h1>
              <p className="text-xs sm:text-sm font-semibold text-[#285FEA] mt-1 tracking-wide">
                {resume.candidate.title}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 text-xs text-zinc-600 mt-2">
                <span>{resume.candidate.location}</span>
                <span>&bull;</span>
                <span>{resume.candidate.email}</span>
                <span>&bull;</span>
                <span>{resume.candidate.phone}</span>
                <span>&bull;</span>
                <span className="text-[#285FEA] font-medium">{resume.candidate.linkedin}</span>
                {resume.candidate.github && (
                  <>
                    <span>&bull;</span>
                    <span className="text-[#285FEA] font-medium">{resume.candidate.github}</span>
                  </>
                )}
                {resume.candidate.portfolio && (
                  <>
                    <span>&bull;</span>
                    <span className="text-[#285FEA] font-medium">{resume.candidate.portfolio}</span>
                  </>
                )}
              </div>
            </div>

            {/* 2. Document Sections */}
            <div className="mt-4 space-y-4">
              {/* Section: Professional Summary */}
              <div className="group/section relative mb-4">
                <div className="flex items-center justify-between border-b border-zinc-300 pb-0.5 mb-2">
                  <h2 className="text-[11px] font-bold tracking-[0.14em] text-zinc-950 uppercase">
                    PROFESSIONAL SUMMARY
                  </h2>
                  <button
                    type="button"
                    onClick={handleCopySummary}
                    className="opacity-0 group-hover/section:opacity-100 transition-opacity px-2 py-0.5 rounded text-[10px] font-semibold bg-zinc-100 hover:bg-zinc-200 text-zinc-700 flex items-center gap-1 cursor-pointer print:hidden"
                    title="Copy summary"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy Summary</span>
                  </button>
                </div>
                <p className="text-xs text-zinc-800 leading-relaxed text-justify">
                  {resume.summary}
                </p>
              </div>

              {/* Section: Skills */}
              <div className="group/section relative mb-4">
                <div className="flex items-center justify-between border-b border-zinc-300 pb-0.5 mb-2">
                  <h2 className="text-[11px] font-bold tracking-[0.14em] text-zinc-950 uppercase">
                    CORE SKILLS &amp; EXPERTISE
                  </h2>
                  <button
                    type="button"
                    onClick={handleCopySkills}
                    className="opacity-0 group-hover/section:opacity-100 transition-opacity px-2 py-0.5 rounded text-[10px] font-semibold bg-zinc-100 hover:bg-zinc-200 text-zinc-700 flex items-center gap-1 cursor-pointer print:hidden"
                    title="Copy skills"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy Skills</span>
                  </button>
                </div>
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
              <div className="mb-4">
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
                          <li key={bIdx} className="group/bullet relative pl-0.5">
                            <span className="inline">{bullet}</span>
                            <button
                              type="button"
                              onClick={(e) => handleCopyBullet(e, bullet)}
                              className="inline-flex ml-1.5 opacity-0 group-hover/bullet:opacity-100 transition-opacity p-0.5 rounded text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 align-middle cursor-pointer print:hidden"
                              title="Copy this bullet point"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section: Projects */}
              {resume.projects && resume.projects.length > 0 && (
                <div className="mb-4">
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
                            <li key={hIdx} className="group/bullet relative pl-0.5">
                              <span className="inline">{hl}</span>
                              <button
                                type="button"
                                onClick={(e) => handleCopyBullet(e, hl)}
                                className="inline-flex ml-1.5 opacity-0 group-hover/bullet:opacity-100 transition-opacity p-0.5 rounded text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 align-middle cursor-pointer print:hidden"
                                title="Copy bullet"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Section: Education */}
              <div className="mb-4">
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

              {/* Section: Certifications */}
              {resume.certifications && resume.certifications.length > 0 && (
                <div className="resume-entry">
                  <h2 className="text-[11px] font-bold tracking-[0.14em] text-zinc-950 uppercase border-b border-zinc-300 pb-0.5 mb-2">
                    CERTIFICATIONS &amp; CREDENTIALS
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
              <span className="font-medium">HyperResume 100% ATS Verified Single-Column Architecture</span>
              <span>Unicode UTF-8 Standard &bull; Tableless Flow</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
