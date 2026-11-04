'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  Sparkles,
  Briefcase,
  Plus,
  ArrowRight,
  Clock,
  AlertCircle,
  Upload,
} from 'lucide-react';
import { apiClient, Resume, JobApplication } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';

export default function AppDashboardPage() {
  const { user, creditBalance } = useAuth();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadDashboardData() {
      setIsLoading(true);
      setError(null);
      try {
        const [resumesData, appsData] = await Promise.all([
          apiClient.listResumes(),
          apiClient.listApplications(),
        ]);
        if (isMounted) {
          const safeResumes = Array.isArray(resumesData)
            ? resumesData
            : ((resumesData as unknown) as { items: Resume[] })?.items || [];
          const safeApps = Array.isArray(appsData)
            ? appsData
            : ((appsData as unknown) as { items: JobApplication[] })?.items || [];
          setResumes(safeResumes);
          setApplications(safeApps);
        }
      } catch (err: unknown) {
        if (isMounted) {
          setError(
            err instanceof Error
              ? err.message
              : 'Failed to load workspace data. Please check your connection.',
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadDashboardData();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Workspace Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E5E9] dark:border-[#252A33] pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1A1D23] dark:text-[#F0F2F5]">
            Welcome back{user?.fullName ? `, ${user.fullName.split(' ')[0]}` : ''}
          </h1>
          <p className="text-xs sm:text-sm text-[#5A6270] dark:text-[#9EA7B4] mt-0.5">
            Turn your verified career history into job-tailored applications without inventing skills.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/app/resumes">
            <Button variant="primary" size="sm" className="gap-1.5">
              <Plus className="w-3.5 h-3.5" />
              <span>New Resume</span>
            </Button>
          </Link>
          <Link href="/app/match">
            <Button variant="outline" size="sm" className="gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#285FEA]" />
              <span>Match a Job</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Summary Metrics Bar - Compact & Calm */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-lg border border-[#E2E5E9] dark:border-[#252A33] bg-white dark:bg-[#14171C]">
          <span className="text-xs font-medium text-[#5A6270] dark:text-[#9EA7B4] block">Resumes</span>
          <div className="text-xl font-bold text-[#1A1D23] dark:text-[#F0F2F5] mt-0.5">
            {resumes.length}
          </div>
          <span className="text-[11px] text-[#848D9A] mt-0.5 block">
            {resumes.some((r) => r.isMaster) ? 'Master profile active' : 'Draft created'}
          </span>
        </div>

        <div className="p-3.5 rounded-lg border border-[#E2E5E9] dark:border-[#252A33] bg-white dark:bg-[#14171C]">
          <span className="text-xs font-medium text-[#5A6270] dark:text-[#9EA7B4] block">Applications</span>
          <div className="text-xl font-bold text-[#1A1D23] dark:text-[#F0F2F5] mt-0.5">
            {applications.length}
          </div>
          <span className="text-[11px] text-[#848D9A] mt-0.5 block">
            {applications.filter((a) => a.status === 'interviewing').length} interviewing
          </span>
        </div>

        <div className="p-3.5 rounded-lg border border-[#E2E5E9] dark:border-[#252A33] bg-white dark:bg-[#14171C]">
          <span className="text-xs font-medium text-[#5A6270] dark:text-[#9EA7B4] block">AI Credits</span>
          <div className="text-xl font-bold text-[#285FEA] mt-0.5">
            {creditBalance}
          </div>
          <Link href="/pricing" className="text-[11px] text-[#285FEA] hover:underline mt-0.5 block font-medium">
            Manage plan &rarr;
          </Link>
        </div>

        <div className="p-3.5 rounded-lg border border-[#E2E5E9] dark:border-[#252A33] bg-white dark:bg-[#14171C]">
          <span className="text-xs font-medium text-[#5A6270] dark:text-[#9EA7B4] block">Matching Model</span>
          <div className="text-xs font-semibold text-[#059669] mt-1.5 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#059669]" />
            <span>Factual Grounding</span>
          </div>
          <span className="text-[11px] text-[#848D9A] mt-0.5 block">
            Zero hallucination guard
          </span>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-3.5 rounded-md border border-[#FDE68A] bg-[#FFFBEB] dark:bg-[#78350F]/20 text-[#92400E] dark:text-[#FDE68A] text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
            className="text-xs h-7"
          >
            Retry
          </Button>
        </div>
      )}

      {/* Workflow Navigation Panels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/app/resumes"
          className="p-4 rounded-lg bg-white dark:bg-[#14171C] border border-[#E2E5E9] dark:border-[#252A33] hover:border-[#CBD0D7] dark:hover:border-[#333945] transition-all flex flex-col justify-between group"
        >
          <div>
            <div className="w-7 h-7 rounded bg-[#F1F3F5] dark:bg-[#1D2128] text-[#285FEA] flex items-center justify-center mb-2.5">
              <FileText className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-sm font-semibold text-[#1A1D23] dark:text-[#F0F2F5] group-hover:text-[#285FEA] transition-colors">
              Master Resume
            </h3>
            <p className="text-xs text-[#5A6270] dark:text-[#9EA7B4] mt-1 leading-relaxed">
              Your canonical repository of experience, projects, skills, and metrics.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-[#F1F3F5] dark:border-[#1D2128] flex items-center justify-between text-xs text-[#5A6270] dark:text-[#9EA7B4]">
            <span>{resumes.length} saved</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Link>

        <Link
          href="/app/match"
          className="p-4 rounded-lg bg-white dark:bg-[#14171C] border border-[#E2E5E9] dark:border-[#252A33] hover:border-[#CBD0D7] dark:hover:border-[#333945] transition-all flex flex-col justify-between group"
        >
          <div>
            <div className="w-7 h-7 rounded bg-[#F1F3F5] dark:bg-[#1D2128] text-[#285FEA] flex items-center justify-center mb-2.5">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-sm font-semibold text-[#1A1D23] dark:text-[#F0F2F5] group-hover:text-[#285FEA] transition-colors">
              Match a Job
            </h3>
            <p className="text-xs text-[#5A6270] dark:text-[#9EA7B4] mt-1 leading-relaxed">
              Paste a target job description and evaluate requirement evidence and gaps.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-[#F1F3F5] dark:border-[#1D2128] flex items-center justify-between text-xs text-[#5A6270] dark:text-[#9EA7B4]">
            <span>Evaluate job description</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Link>

        <Link
          href="/app/applications"
          className="p-4 rounded-lg bg-white dark:bg-[#14171C] border border-[#E2E5E9] dark:border-[#252A33] hover:border-[#CBD0D7] dark:hover:border-[#333945] transition-all flex flex-col justify-between group"
        >
          <div>
            <div className="w-7 h-7 rounded bg-[#F1F3F5] dark:bg-[#1D2128] text-[#059669] flex items-center justify-center mb-2.5">
              <Briefcase className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-sm font-semibold text-[#1A1D23] dark:text-[#F0F2F5] group-hover:text-[#059669] transition-colors">
              Application Tracker
            </h3>
            <p className="text-xs text-[#5A6270] dark:text-[#9EA7B4] mt-1 leading-relaxed">
              Track submitted roles, interview dates, contacts, and version associations.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-[#F1F3F5] dark:border-[#1D2128] flex items-center justify-between text-xs text-[#5A6270] dark:text-[#9EA7B4]">
            <span>{applications.length} applications</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Link>
      </div>

      {/* Recent Resumes Table / Empty State */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[#1A1D23] dark:text-[#F0F2F5]">
            Recent Resumes
          </h2>
          <Link href="/app/resumes" className="text-xs text-[#285FEA] hover:underline font-medium">
            View all ({resumes.length})
          </Link>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-xs text-[#848D9A] border border-[#E2E5E9] dark:border-[#252A33] rounded-lg bg-white dark:bg-[#14171C]">
            Loading resumes...
          </div>
        ) : resumes.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-[#CBD0D7] dark:border-[#333945] rounded-lg bg-white dark:bg-[#14171C] space-y-3">
            <div className="w-9 h-9 rounded-full bg-[#F1F3F5] dark:bg-[#1D2128] text-[#5A6270] dark:text-[#9EA7B4] flex items-center justify-center mx-auto">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#1A1D23] dark:text-[#F0F2F5]">No resumes in workspace</h3>
              <p className="text-xs text-[#5A6270] dark:text-[#9EA7B4] mt-0.5">
                Create your first resume or upload an existing PDF to start tailoring.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-1">
              <Link href="/app/resumes">
                <Button size="sm" variant="primary">
                  Create Resume
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="border border-[#E2E5E9] dark:border-[#252A33] rounded-lg overflow-hidden bg-white dark:bg-[#14171C]">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[500px] sm:min-w-0">
                <thead className="bg-[#F7F8FA] dark:bg-[#1D2128] border-b border-[#E2E5E9] dark:border-[#252A33] text-[#5A6270] dark:text-[#9EA7B4]">
                  <tr>
                    <th className="py-2.5 px-3.5 font-medium">Resume Name</th>
                    <th className="py-2.5 px-3.5 font-medium hidden sm:table-cell">Target Role</th>
                    <th className="py-2.5 px-3.5 font-medium hidden md:table-cell">Last Modified</th>
                    <th className="py-2.5 px-3.5 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F3F5] dark:divide-[#1D2128]">
                  {resumes.slice(0, 5).map((r) => (
                    <tr key={r.id} className="hover:bg-[#F7F8FA] dark:hover:bg-[#1D2128]/50 transition-colors">
                      <td className="py-2.5 px-3.5">
                        <div className="flex items-center gap-2">
                          <FileText className="w-3.5 h-3.5 text-[#285FEA] shrink-0" />
                          <span className="font-semibold text-[#1A1D23] dark:text-[#F0F2F5]">
                            {r.name}
                          </span>
                          {r.isMaster && (
                            <Badge variant="neutral" className="text-[10px]">
                              Master
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="py-2.5 px-3.5 text-[#5A6270] dark:text-[#9EA7B4] hidden sm:table-cell">
                        {r.targetRole || 'General'}
                      </td>
                      <td className="py-2.5 px-3.5 text-[#848D9A] hidden md:table-cell">
                        {new Date(r.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="py-2.5 px-3.5 text-right">
                        <Link href={`/app/resumes/${r.id}`}>
                          <Button variant="ghost" size="sm" className="h-7 text-xs text-[#285FEA]">
                            Open
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Recent Applications Preview */}
      {applications.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[#1A1D23] dark:text-[#F0F2F5]">
              Active Applications
            </h2>
            <Link href="/app/applications" className="text-xs text-[#285FEA] hover:underline font-medium">
              View pipeline ({applications.length})
            </Link>
          </div>

          <div className="border border-[#E2E5E9] dark:border-[#252A33] rounded-lg overflow-hidden bg-white dark:bg-[#14171C]">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[460px] sm:min-w-0">
                <thead className="bg-[#F7F8FA] dark:bg-[#1D2128] border-b border-[#E2E5E9] dark:border-[#252A33] text-[#5A6270] dark:text-[#9EA7B4]">
                  <tr>
                    <th className="py-2.5 px-3.5 font-medium">Company</th>
                    <th className="py-2.5 px-3.5 font-medium">Role</th>
                    <th className="py-2.5 px-3.5 font-medium">Status</th>
                    <th className="py-2.5 px-3.5 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F3F5] dark:divide-[#1D2128]">
                  {applications.slice(0, 4).map((app) => (
                    <tr key={app.id} className="hover:bg-[#F7F8FA] dark:hover:bg-[#1D2128]/50 transition-colors">
                      <td className="py-2.5 px-3.5 font-semibold text-[#1A1D23] dark:text-[#F0F2F5]">
                        {app.companyName}
                      </td>
                      <td className="py-2.5 px-3.5 text-[#5A6270] dark:text-[#9EA7B4]">
                        {app.jobTitle}
                      </td>
                      <td className="py-2.5 px-3.5">
                        <span className="capitalize px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#F1F3F5] dark:bg-[#1D2128] text-[#5A6270] dark:text-[#9EA7B4] border border-[#E2E5E9] dark:border-[#252A33]">
                          {app.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3.5 text-right">
                        <Link href={`/app/applications?jobId=${app.id}`}>
                          <Button variant="ghost" size="sm" className="h-7 text-xs text-[#285FEA]">
                            View
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
