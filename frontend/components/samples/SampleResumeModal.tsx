'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SampleResume, getSampleTemplateKey } from '@/data/sample-resumes';
import { CompanyBrandBadge } from './CompanyBrandBadge';
import { ResumeTemplateRenderer } from '@/components/resumes/templates/ResumeTemplateRenderer';
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

  const modalTemplateKey = getSampleTemplateKey(resume);
  const sampleContent: ResumeContent = {
    contact: {
      fullName: resume.candidate.name,
      email: resume.candidate.email,
      phone: resume.candidate.phone,
      location: resume.candidate.location,
      linkedinUrl: resume.candidate.linkedin ? `https://${resume.candidate.linkedin}` : undefined,
      githubUrl: resume.candidate.github ? `https://${resume.candidate.github}` : undefined,
      websiteUrl: resume.candidate.portfolio ? `https://${resume.candidate.portfolio}` : undefined,
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
    layout: {
      accentColor: resume.brandColor || '#285FEA',
      fontFamily: modalTemplateKey === 'ivy-league' ? 'serif' : 'sans',
      pageMargin: 16,
      fontSizeScale: 1,
      lineHeight: 1.4,
    },
  };

  // Mode 2: Full Template (with complete editable illustrative sample content)
  const handleUseFullTemplate = async () => {
    setIsCloning(true);
    setCloningMode('full');
    setCloneError(null);

    const templateKey = getSampleTemplateKey(resume);

    const resumeContent: ResumeContent = {
      contact: {
        fullName: user?.fullName || 'Your Full Name',
        email: user?.email || '',
        phone: '',
        location: '',
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
      layout: {
        accentColor: resume.brandColor || '#285FEA',
        fontFamily: templateKey === 'ivy-league' ? 'serif' : 'sans',
        pageMargin: 16,
        fontSizeScale: 1,
        lineHeight: 1.4,
      },
    };

    if (!isAuthenticated) {
      try {
        sessionStorage.setItem(
          'pending_cloned_resume',
          JSON.stringify({
            title: `${resume.company} - ${resume.role}`,
            targetRole: resume.role,
            targetCompany: resume.company,
            templateKey,
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
        templateKey,
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

    const templateKey = getSampleTemplateKey(resume);

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
      layout: {
        accentColor: resume.brandColor || '#285FEA',
        fontFamily: templateKey === 'ivy-league' ? 'serif' : 'sans',
        pageMargin: 16,
        fontSizeScale: 1,
        lineHeight: 1.4,
      },
    };

    if (!isAuthenticated) {
      try {
        sessionStorage.setItem(
          'pending_cloned_resume',
          JSON.stringify({
            title: `${resume.role} (Starter Template)`,
            targetRole: resume.role,
            targetCompany: resume.company,
            templateKey,
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
        templateKey,
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
        {/* Sleek Top Header Bar - Fully Responsive with clean 2-tier mobile & 1-tier desktop */}
        <div className="min-h-14 py-2.5 px-3 sm:px-6 border-b border-[#E2E5E9] dark:border-[#252A33] bg-white/95 dark:bg-[#14171C]/95 backdrop-blur-md flex flex-col md:flex-row md:items-center md:justify-between gap-2.5 sm:gap-4 shrink-0 print:hidden z-10">
          {/* Top/Left Tier: Brand Badge + Role & Metadata */}
          <div className="flex items-center justify-between md:justify-start gap-2.5 sm:gap-3 min-w-0 flex-1">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
              <div className="p-1 sm:p-2 rounded-lg bg-[#F7F8FA] dark:bg-[#1D2128] border border-[#E2E5E9] dark:border-[#252A33] shrink-0">
                <CompanyBrandBadge companyKey={resume.companyKey} companyName={resume.company} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                  <h3
                    title={resume.role}
                    className="text-xs sm:text-base font-bold text-[#1A1D23] dark:text-[#F0F2F5] truncate leading-tight"
                  >
                    {resume.role}
                  </h3>
                  <span className="text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded border border-[#285FEA]/30 bg-[#285FEA]/10 text-[#285FEA] dark:bg-[#285FEA]/20 dark:text-[#60A5FA] shrink-0">
                    {resume.badge}
                  </span>
                  <span className="hidden sm:inline-block text-[8px] sm:text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 shrink-0">
                    Illustrative Sample
                  </span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-[#5A6270] dark:text-[#9EA7B4] mt-0.5 min-w-0 overflow-hidden">
                  <span className="font-medium text-zinc-700 dark:text-zinc-300 truncate">{resume.experienceLevelLabel}</span>
                  <span className="shrink-0">&bull;</span>
                  <span className="inline-flex items-center gap-0.5 shrink-0">
                    <MapPin className="w-2.5 h-2.5" />
                    <span>{resume.country}</span>
                  </span>
                  <span className="shrink-0">&bull;</span>
                  <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/60 shrink-0">
                    <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    <span>{resume.atsScore}/100 ATS</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Mobile-only Close button in top row */}
            <button
              type="button"
              onClick={onClose}
              className="md:hidden p-2 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shrink-0"
              aria-label="Close sample preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Bottom/Right Tier: Actions Cluster */}
          <div className="flex items-center justify-end gap-1.5 sm:gap-2 shrink-0 overflow-x-auto pb-0.5 md:pb-0 scrollbar-none">
            {/* Copy Full Text */}
            <button
              type="button"
              onClick={handleCopyText}
              className="h-8 sm:h-8.5 px-2 sm:px-2.5 rounded-lg text-xs font-semibold border border-[#E2E5E9] dark:border-[#252A33] bg-[#F7F8FA] dark:bg-[#1D2128] hover:bg-[#EAEFF5] dark:hover:bg-[#252A33] text-[#1A1D23] dark:text-[#F0F2F5] transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-95 shrink-0"
              title="Copy formatted resume text"
              aria-label="Copy resume text"
            >
              <Copy className="w-3.5 h-3.5 text-[#5A6270] dark:text-[#9EA7B4]" />
              <span className="hidden xl:inline">Copy Text</span>
            </button>

            {/* Print / PDF */}
            <button
              type="button"
              onClick={handlePrint}
              className="h-8 sm:h-8.5 px-2 sm:px-2.5 rounded-lg text-xs font-semibold border border-[#E2E5E9] dark:border-[#252A33] bg-[#F7F8FA] dark:bg-[#1D2128] hover:bg-[#EAEFF5] dark:hover:bg-[#252A33] text-[#1A1D23] dark:text-[#F0F2F5] transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-95 shrink-0"
              title="Print or save as PDF"
              aria-label="Print or save as PDF"
            >
              <Printer className="w-3.5 h-3.5 text-[#5A6270] dark:text-[#9EA7B4]" />
              <span className="hidden xl:inline">Print / PDF</span>
            </button>

            {/* Mode 1: Starter Template Action */}
            <button
              type="button"
              onClick={handleUseStarterTemplate}
              disabled={isCloning}
              className="h-8 sm:h-8.5 px-2.5 sm:px-3 rounded-lg text-xs font-bold border border-[#285FEA]/40 text-[#285FEA] dark:text-[#60A5FA] bg-[#285FEA]/5 hover:bg-[#285FEA]/10 transition-all flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-60 cursor-pointer shrink-0"
              title="Create a clean resume using this structure without fictional achievements"
            >
              {isCloning && cloningMode === 'starter' ? (
                <div className="w-3.5 h-3.5 border-2 border-[#285FEA] border-t-transparent rounded-full animate-spin" />
              ) : (
                <Layers className="w-3.5 h-3.5" />
              )}
              <span className="hidden 2xl:inline">Use Starter Template</span>
              <span className="2xl:hidden">Starter</span>
            </button>

            {/* Mode 3: Adapt With My Profile (AI Intelligence) */}
            <button
              type="button"
              onClick={() => {
                if (onAdaptWithProfile) {
                  onAdaptWithProfile(resume);
                }
              }}
              className="h-8 sm:h-8.5 px-3 sm:px-3.5 rounded-lg text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white transition-all shadow-xs flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer shrink-0"
              title="Adapt your existing profile facts to match this sample structure and phrasing (3 Credits)"
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">Adapt With My Profile</span>
              <span className="xl:hidden">Adapt Profile</span>
            </button>

            {/* Mode 2: Full Template Action */}
            <button
              type="button"
              onClick={handleUseFullTemplate}
              disabled={isCloning}
              className="h-8 sm:h-8.5 px-3 sm:px-3.5 rounded-lg text-xs font-bold bg-[#285FEA] hover:bg-[#1E4BC8] text-white transition-all shadow-xs flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-60 cursor-pointer shrink-0"
              title="Clone complete sample resume into your workspace"
            >
              {isCloning && cloningMode === 'full' ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              <span className="hidden xl:inline">Use Full Template</span>
              <span className="xl:hidden">Full Template</span>
            </button>

            {/* Desktop Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="hidden md:flex h-8 sm:h-8.5 w-8 sm:w-8.5 rounded-lg items-center justify-center text-[#848D9A] hover:text-[#1A1D23] dark:hover:text-[#F0F2F5] hover:bg-[#F1F3F5] dark:hover:bg-[#1D2128] transition-colors cursor-pointer shrink-0"
              aria-label="Close sample preview"
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

        {/* Document Body: Authentic Live Template Renderer matching the demo */}
        <div className="flex-1 overflow-y-auto bg-[#F1F3F5] dark:bg-[#0D0F12] p-3 sm:p-8 print:p-0 print:bg-white print:overflow-visible">
          <div className="w-full max-w-[840px] mx-auto space-y-4">
            {/* Disclaimer Bar */}
            <div className="pb-2 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-[11px] text-zinc-500 print:hidden">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                  Verified ATS Benchmark ({resume.resumeStyle} &bull; {modalTemplateKey})
                </span>
              </div>
              <span className="text-zinc-400 italic">
                Candidate identity is illustrative for demonstration.
              </span>
            </div>

            {/* Live Template Component */}
            <div className="shadow-2xl rounded-sm overflow-hidden bg-white text-zinc-950">
              <ResumeTemplateRenderer
                templateKey={modalTemplateKey}
                content={sampleContent}
                accentColor={resume.brandColor || '#285FEA'}
                fontFamily={modalTemplateKey === 'ivy-league' ? 'serif' : 'sans'}
                showPhoto={false}
                showHighlights={false}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
