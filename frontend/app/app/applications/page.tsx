'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Alert } from '@/components/ui/alert';
import {
  Briefcase,
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import { apiClient, JobApplication, Resume } from '@/lib/api-client';

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // New Application Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [status, setStatus] = useState<JobApplication['status']>('applied');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;
    Promise.all([apiClient.listApplications(), apiClient.listResumes()])
      .then(([appsData, resumesData]) => {
        if (!isMounted) return;
        setApplications(appsData);
        setResumes(resumesData);
        if (resumesData.length > 0) {
          setSelectedResumeId(resumesData[0].id);
        }
      })
      .catch((err: unknown) => {
        if (!isMounted) return;
        setErrorMessage(
          err instanceof Error ? err.message : 'Failed to load applications pipeline.',
        );
      })
      .finally(() => {
        if (!isMounted) return;
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleCreateApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !jobTitle.trim()) return;

    setIsSubmitting(true);
    try {
      const created = await apiClient.createApplication({
        companyName: companyName.trim(),
        jobTitle: jobTitle.trim(),
        resumeId: selectedResumeId || undefined,
        status,
        notes: notes.trim() || undefined,
        appliedDate: new Date().toISOString(),
      });
      setApplications((prev) => [created, ...prev]);
      setIsModalOpen(false);
      setCompanyName('');
      setJobTitle('');
      setNotes('');
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to create application');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (appId: string, newStatus: JobApplication['status']) => {
    try {
      const updated = await apiClient.updateApplication(appId, { status: newStatus });
      setApplications((prev) =>
        prev.map((app) => (app.id === appId ? { ...app, status: updated.status } : app)),
      );
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to update status');
    }
  };

  const handleDeleteApplication = async (appId: string) => {
    if (!confirm('Are you sure you want to delete this application record?')) return;
    try {
      await apiClient.deleteApplication(appId);
      setApplications((prev) => prev.filter((app) => app.id !== appId));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to delete application');
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Job Application Pipeline
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Track which tailored resume variant was submitted to each role to keep your job search organized and honest.
          </p>
        </div>
        <div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsModalOpen(true)}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Track New Application</span>
          </Button>
        </div>
      </div>

      {errorMessage && (
        <Alert variant="destructive">{errorMessage}</Alert>
      )}

      {/* Summary KPI Cards (Honest counts based on actual applications) */}
      {applications.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <div className="text-xs text-zinc-500">Active Pipeline</div>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-1">
              {applications.length}
            </div>
          </div>
          <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <div className="text-xs text-zinc-500">Interviewing</div>
            <div className="text-2xl font-bold text-blue-600 mt-1">
              {applications.filter((a) => a.status === 'interviewing').length}
            </div>
          </div>
          <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <div className="text-xs text-zinc-500">Offers</div>
            <div className="text-2xl font-bold text-emerald-600 mt-1">
              {applications.filter((a) => a.status === 'offer').length}
            </div>
          </div>
          <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <div className="text-xs text-zinc-500">Applied</div>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-1">
              {applications.filter((a) => a.status === 'applied').length}
            </div>
          </div>
        </div>
      )}

      {/* Applications Table / Empty State */}
      {isLoading ? (
        <div className="p-12 text-center text-sm text-zinc-500 animate-pulse border rounded-xl bg-white dark:bg-zinc-900">
          Loading applications pipeline...
        </div>
      ) : applications.length === 0 ? (
        <div className="p-10 rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-center flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center mb-3">
            <Briefcase className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
            No tracked applications yet
          </h3>
          <p className="text-xs text-zinc-500 max-w-sm mt-1 mb-5 leading-relaxed">
            Record every role you apply to along with the specific tailored resume variant used, keeping interview prep seamless.
          </p>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsModalOpen(true)}
            className="gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Track First Application</span>
          </Button>
        </div>
      ) : (
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Active Submissions ({applications.length})
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/40 text-xs text-zinc-500">
                  <th className="py-3 px-4 font-semibold">Company & Role</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Applied Date</th>
                  <th className="py-3 px-4 font-semibold">Notes</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-zinc-900 dark:text-zinc-100">{app.jobTitle}</div>
                      <div className="text-xs text-zinc-500">{app.companyName}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <select
                        value={app.status}
                        onChange={(e) =>
                          handleUpdateStatus(app.id, e.target.value as JobApplication['status'])
                        }
                        className="text-xs p-1 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200"
                      >
                        <option value="draft">Draft</option>
                        <option value="applied">Applied</option>
                        <option value="interviewing">Interviewing</option>
                        <option value="offer">Offer</option>
                        <option value="rejected">Rejected</option>
                        <option value="archived">Archived</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-zinc-500">
                      {app.appliedDate ? new Date(app.appliedDate).toLocaleDateString() : 'Draft'}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-zinc-600 dark:text-zinc-400 max-w-xs truncate">
                      {app.notes || '—'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {app.resumeId && (
                          <Link
                            href={`/app/resumes/${app.resumeId}`}
                            className="text-xs font-semibold text-blue-600 hover:underline"
                          >
                            View CV
                          </Link>
                        )}
                        <button
                          onClick={() => handleDeleteApplication(app.id)}
                          className="p-1 rounded text-zinc-400 hover:text-rose-600"
                          title="Delete application"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* New Application Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md shadow-xl bg-white dark:bg-zinc-900 animate-in fade-in zoom-in-95">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-lg">Track Application</CardTitle>
                <CardDescription>Record role details and link the tailored resume.</CardDescription>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-600"
              >
                <X className="w-5 h-5" />
              </button>
            </CardHeader>

            <form onSubmit={handleCreateApplication}>
              <CardContent className="space-y-4 pt-2">
                <Input
                  id="app-company"
                  label="Company Name"
                  placeholder="e.g. Stripe, Razorpay"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                />
                <Input
                  id="app-role"
                  label="Role Title"
                  placeholder="e.g. Staff Infrastructure Engineer"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  required
                />
                {resumes.length > 0 && (
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Resume Variant Used
                    </label>
                    <select
                      value={selectedResumeId}
                      onChange={(e) => setSelectedResumeId(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                    >
                      {resumes.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Initial Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as JobApplication['status'])}
                    className="w-full text-xs p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  >
                    <option value="applied">Applied</option>
                    <option value="interviewing">Interviewing</option>
                    <option value="draft">Draft / Preparing</option>
                    <option value="offer">Offer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Notes
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Recruiter contact, referral name, or stage notes..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              </CardContent>

              <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isSubmitting}
                  disabled={!companyName.trim() || !jobTitle.trim()}
                >
                  Save Application
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
