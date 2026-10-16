'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  Sparkles,
  Briefcase,
  Plus,
  ArrowRight,
  ShieldCheck,
  Upload,
  Clock,
  ChevronRight,
  AlertCircle,
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
              : 'Failed to load dashboard data. Please check your connection.',
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
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Welcome Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">
            Welcome back{user?.fullName ? `, ${user.fullName.split(' ')[0]}` : ''}
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
            Turn your verified career history into job-tailored applications without inventing skills.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/app/resumes">
            <Button variant="primary" size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              <span>Create or Upload Resume</span>
            </Button>
          </Link>
          <Link href="/app/match">
            <Button variant="outline" size="sm" className="gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Match a Job</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Status Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs">
          <div className="flex items-center justify-between text-zinc-500 mb-1">
            <span className="text-xs font-medium">My Resumes</span>
            <FileText className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {resumes.length}
          </div>
          <span className="text-[11px] text-zinc-400">
            {resumes.some((r) => r.isMaster) ? 'Master Profile active' : 'Draft created'}
          </span>
        </div>

        <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs">
          <div className="flex items-center justify-between text-zinc-500 mb-1">
            <span className="text-xs font-medium">Applications</span>
            <Briefcase className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {applications.length}
          </div>
          <span className="text-[11px] text-zinc-400">
            {applications.filter((a) => a.status === 'interviewing').length} interviewing
          </span>
        </div>

        <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs">
          <div className="flex items-center justify-between text-zinc-500 mb-1">
            <span className="text-xs font-medium">AI Credits</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {creditBalance}
          </div>
          <Link href="/pricing" className="text-[11px] text-blue-600 hover:underline font-medium">
            Get more credits &rarr;
          </Link>
        </div>

        <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs">
          <div className="flex items-center justify-between text-zinc-500 mb-1">
            <span className="text-xs font-medium">ATS Grounding</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            Active Guard
          </div>
          <span className="text-[11px] text-zinc-400">
            Verified experience
          </span>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl border border-rose-200 bg-rose-50 dark:bg-rose-950/30 text-rose-800 dark:text-rose-200 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <span>{error}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
            className="text-xs"
          >
            Retry
          </Button>
        </div>
      )}

      {/* Primary Next Actions Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:border-blue-500/40 transition-colors">
          <CardHeader>
            <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 w-fit mb-2">
              <FileText className="w-5 h-5" />
            </div>
            <CardTitle className="text-lg">Master Resume</CardTitle>
            <CardDescription className="text-xs">
              Your verified repository of career roles, metrics, and technical competencies.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/app/resumes">
              <Button variant="outline" size="sm" className="w-full justify-between">
                <span>Manage Resumes ({resumes.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:border-blue-500/40 transition-colors">
          <CardHeader>
            <div className="p-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 w-fit mb-2">
              <Sparkles className="w-5 h-5" />
            </div>
            <CardTitle className="text-lg">Match a Job</CardTitle>
            <CardDescription className="text-xs">
              Compare your experience against a target job description with grounded evidence quotes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/app/match">
              <Button variant="outline" size="sm" className="w-full justify-between">
                <span>Start New Match</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:border-blue-500/40 transition-colors">
          <CardHeader>
            <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 w-fit mb-2">
              <Briefcase className="w-5 h-5" />
            </div>
            <CardTitle className="text-lg">Application Tracker</CardTitle>
            <CardDescription className="text-xs">
              Track submitted applications, tailored variants, and interview pipeline status.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/app/applications">
              <Button variant="outline" size="sm" className="w-full justify-between">
                <span>Track Applications ({applications.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Resumes Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <span>My Resumes</span>
          </h2>
          <Link href="/app/resumes" className="text-xs font-semibold text-blue-600 hover:underline">
            View All ({resumes.length})
          </Link>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-sm text-zinc-500 animate-pulse border rounded-xl bg-white dark:bg-zinc-900">
            Loading resumes...
          </div>
        ) : (Array.isArray(resumes) ? resumes : []).length === 0 ? (
          <div className="p-8 sm:p-10 rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center mb-3">
              <Upload className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              No resumes created yet
            </h3>
            <p className="text-xs text-zinc-500 max-w-sm mt-1 mb-5 leading-relaxed">
              Start by creating a master profile from scratch or upload your existing PDF or DOCX file to extract your verified career history.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link href="/app/resumes">
                <Button variant="primary" size="sm" className="gap-1.5">
                  <Plus className="w-4 h-4" />
                  <span>Create from Scratch</span>
                </Button>
              </Link>
              <Link href="/app/resumes">
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Upload className="w-4 h-4" />
                  <span>Import PDF / DOCX</span>
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(Array.isArray(resumes) ? resumes : []).slice(0, 4).map((resume) => (
              <div
                key={resume.id}
                className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all flex flex-col justify-between"
              >

                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm hover:text-blue-600">
                        <Link href={`/app/resumes/${resume.id}`}>
                          {resume.name}
                        </Link>
                      </h3>
                      {resume.targetRole && (
                        <p className="text-xs text-zinc-500 mt-0.5">
                          Target: {resume.targetRole} {resume.targetCompany ? `at ${resume.targetCompany}` : ''}
                        </p>
                      )}
                    </div>
                    {resume.isMaster && (
                      <Badge variant="success">Master</Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-xs text-zinc-500 mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      v{resume.version}
                    </span>
                    <span>
                      {(resume.content?.experience || []).length} Roles
                    </span>
                    <span>
                      {(resume.content?.skills || []).length} Skills
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs">
                  <Link
                    href={`/app/resumes/${resume.id}`}
                    className="font-semibold text-blue-600 hover:underline flex items-center gap-1"
                  >
                    Open Editor
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    href={`/app/match?resumeId=${resume.id}`}
                    className="px-2.5 py-1 rounded border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
                  >
                    Match JD
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Applications Pipeline Summary (Only displayed when actual applications exist) */}
      {applications.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-emerald-600" />
              <span>Recent Applications</span>
            </h2>
            <Link href="/app/applications" className="text-xs font-semibold text-blue-600 hover:underline">
              View All ({applications.length})
            </Link>
          </div>

          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden divide-y divide-zinc-200 dark:divide-zinc-800 text-xs sm:text-sm">
            {applications.slice(0, 3).map((app) => (
              <div key={app.id} className="p-4 flex items-center justify-between gap-4">
                <div>
                  <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {app.jobTitle}
                  </div>
                  <div className="text-xs text-zinc-500 mt-0.5">
                    {app.companyName} {app.appliedDate ? `· Applied ${new Date(app.appliedDate).toLocaleDateString()}` : ''}
                  </div>
                </div>
                <Badge
                  variant={
                    app.status === 'interviewing'
                      ? 'info'
                      : app.status === 'offer'
                      ? 'success'
                      : 'neutral'
                  }
                >
                  {app.status.toUpperCase()}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Truthful Guarantee Notice */}
      <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-between text-xs text-zinc-500">
        <span className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          Evidence-backed integrity: Only your verified career history and authentic metrics are highlighted.
        </span>
        <Badge variant="neutral">Verified Workspace</Badge>
      </div>
    </div>
  );
}
