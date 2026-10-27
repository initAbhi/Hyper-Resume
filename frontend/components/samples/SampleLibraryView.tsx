'use client';

import React, { useState, useMemo } from 'react';
import { SAMPLE_RESUMES, SAMPLE_CATEGORIES, SampleResume } from '@/data/sample-resumes';
import { SampleResumeCard } from './SampleResumeCard';
import { SampleResumeModal } from './SampleResumeModal';
import { Search, Sparkles, Filter, CheckCircle2, FileText, ArrowRight, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { apiClient, ResumeContent } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';

interface SampleLibraryViewProps {
  isPublic?: boolean;
}

export function SampleLibraryView({ isPublic = false }: SampleLibraryViewProps) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewResume, setPreviewResume] = useState<SampleResume | null>(null);

  // Filter logic
  const filteredResumes = useMemo(() => {
    return SAMPLE_RESUMES.filter((resume) => {
      // Category match
      if (selectedCategory === 'PRO') {
        if (resume.badge !== 'PRO') return false;
      } else if (selectedCategory !== 'ALL') {
        if (resume.category !== selectedCategory) return false;
      }

      // Search match
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesCompany = resume.company.toLowerCase().includes(query);
        const matchesRole = resume.role.toLowerCase().includes(query);
        const matchesSkills = resume.skills.some((cat) =>
          cat.skills.some((s) => s.toLowerCase().includes(query))
        );
        const matchesCandidate = resume.candidate.name.toLowerCase().includes(query);
        const matchesSummary = resume.summary.toLowerCase().includes(query);

        return matchesCompany || matchesRole || matchesSkills || matchesCandidate || matchesSummary;
      }

      return true;
    });
  }, [selectedCategory, searchQuery]);

  const handleUseTemplateDirect = async (resume: SampleResume) => {
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
    } catch (err) {
      // Fallback: open modal preview
      setPreviewResume(resume);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Top Controls: Filter Pills & Search Bar */}
      <div className="flex flex-col gap-4">
        {/* Category Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none select-none">
          {SAMPLE_CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.id;
            const isProPill = cat.id === 'PRO';

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-md text-xs font-bold tracking-wider transition-all uppercase whitespace-nowrap shrink-0 ${
                  isActive
                    ? isProPill
                      ? 'bg-[#285FEA] text-white shadow-xs'
                      : 'bg-[#1A1D23] text-white dark:bg-white dark:text-[#0D0F12] shadow-xs'
                    : isProPill
                    ? 'bg-[#285FEA]/10 text-[#285FEA] dark:bg-[#285FEA]/20 dark:text-[#60A5FA] border border-[#285FEA]/20 hover:bg-[#285FEA]/15'
                    : 'bg-white dark:bg-[#14171C] text-[#5A6270] dark:text-[#9EA7B4] hover:text-[#1A1D23] dark:hover:text-[#F0F2F5] hover:bg-[#F1F3F5] dark:hover:bg-[#1D2128] border border-[#E2E5E9] dark:border-[#252A33]'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Search & Active Info Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#848D9A] pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by company (Google, Meta, Disney...), role, or skill..."
              className="w-full pl-9 pr-8 py-2 rounded-lg bg-white dark:bg-[#14171C] border border-[#E2E5E9] dark:border-[#252A33] text-xs text-[#1A1D23] dark:text-[#F0F2F5] placeholder:text-[#848D9A] focus:outline-none focus:border-[#285FEA] focus:ring-1 focus:ring-[#285FEA] transition-all shadow-xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#848D9A] hover:text-[#1A1D23] dark:hover:text-[#F0F2F5]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3 text-xs text-[#5A6270] dark:text-[#9EA7B4]">
            <span>
              Showing <strong className="text-[#1A1D23] dark:text-[#F0F2F5]">{filteredResumes.length}</strong> ATS Resumes
            </span>
            <div className="hidden md:flex items-center gap-1.5 text-[11px] text-[#848D9A]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              <span>Verified ATS Standard Single-Column</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4-Column Grid matching Rezi Layout with Unified Light/Dark Tokens */}
      {filteredResumes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredResumes.map((resume) => (
            <SampleResumeCard
              key={resume.id}
              resume={resume}
              onPreview={(item) => setPreviewResume(item)}
              onUseTemplate={(item) => handleUseTemplateDirect(item)}
            />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center rounded-2xl bg-white dark:bg-[#14171C] border border-[#E2E5E9] dark:border-[#252A33] p-8 space-y-4 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-[#F1F3F5] dark:bg-[#1D2128] text-[#848D9A] flex items-center justify-center mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#1A1D23] dark:text-[#F0F2F5]">No sample resumes found</h3>
            <p className="text-xs text-[#5A6270] dark:text-[#9EA7B4] mt-1 max-w-sm mx-auto">
              No resumes match &ldquo;{searchQuery}&rdquo; in category {selectedCategory}. Try searching for a different keyword or company name.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('ALL');
              setSearchQuery('');
            }}
            className="px-4 py-2 rounded-lg bg-[#285FEA] hover:bg-[#1E4BC8] text-white text-xs font-semibold transition-colors shadow-xs"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Interactive Full Resume Preview & Clone Modal */}
      <SampleResumeModal
        resume={previewResume}
        isOpen={!!previewResume}
        onClose={() => setPreviewResume(null)}
      />
    </div>
  );
}
