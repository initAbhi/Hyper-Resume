'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Resume,
  JobApplicationStatus,
  ApplicationRichMetadata,
  serializeApplicationMetadata,
} from '@/lib/api-client';
import { X, Building2, Briefcase, DollarSign, MapPin, Star, Calendar, Sparkles } from 'lucide-react';

interface AddApplicationModalProps {
  isOpen: boolean;
  resumes: Resume[];
  onClose: () => void;
  onSubmit: (data: {
    companyName: string;
    jobTitle: string;
    resumeId?: string;
    status: JobApplicationStatus;
    applicationUrl?: string;
    appliedDate?: string;
    notes?: string;
  }) => Promise<void>;
}

export function AddApplicationModal({
  isOpen,
  resumes,
  onClose,
  onSubmit,
}: AddApplicationModalProps) {
  const [companyName, setCompanyName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [location, setLocation] = useState('Remote');
  const [salary, setSalary] = useState('');
  const [selectedResumeId, setSelectedResumeId] = useState(
    resumes.length > 0 ? resumes[0].id : '',
  );
  const [status, setStatus] = useState<JobApplicationStatus>('bookmarked');
  const [applicationUrl, setApplicationUrl] = useState('');
  const [deadline, setDeadline] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [excitement, setExcitement] = useState(3);
  const [jobDescription, setJobDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !jobTitle.trim()) return;

    setIsSubmitting(true);
    try {
      const meta: ApplicationRichMetadata = {
        salary: salary.trim() || undefined,
        location: location.trim() || undefined,
        excitement,
        deadline: deadline || undefined,
        followUpDate: followUpDate || undefined,
        savedDate: new Date().toISOString().slice(0, 10),
        jobDescription: jobDescription.trim() || undefined,
        interviews: [],
        contacts: [],
        checklist: [
          { id: '1', text: 'Tailor resume with job description keywords', completed: false, category: 'applying' },
          { id: '2', text: 'Review team background on LinkedIn', completed: false, category: 'applying' },
          { id: '3', text: 'Follow up after 5 business days', completed: false, category: 'interviewing' },
        ],
      };

      await onSubmit({
        companyName: companyName.trim(),
        jobTitle: jobTitle.trim(),
        resumeId: selectedResumeId || undefined,
        status,
        applicationUrl: applicationUrl.trim() || undefined,
        appliedDate: status === 'applied' ? new Date().toISOString() : undefined,
        notes: serializeApplicationMetadata(meta),
      });

      // Reset
      setCompanyName('');
      setJobTitle('');
      setSalary('');
      setJobDescription('');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <Card className="w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
          <div>
            <CardTitle className="text-lg font-bold">Track New Job</CardTitle>
            <CardDescription className="text-xs">
              Record position details, compensation target, and link your tailored resume variant.
            </CardDescription>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
          >
            <X className="w-5 h-5" />
          </button>
        </CardHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto flex flex-col">
          <CardContent className="space-y-4 p-5 flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                id="add-company"
                label="Company Name *"
                placeholder="e.g. Acme Corp, Stripe, Google"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
              />
              <Input
                id="add-role"
                label="Job Position / Role *"
                placeholder="e.g. Operations Manager, Staff Engineer"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  placeholder="e.g. Remote, San Francisco"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Salary Range
                </label>
                <input
                  type="text"
                  placeholder="e.g. $140k - $175k"
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Initial Stage
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as JobApplicationStatus)}
                  className="w-full text-xs p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-medium"
                >
                  <option value="bookmarked">Bookmarked</option>
                  <option value="applying">Applying</option>
                  <option value="applied">Applied</option>
                  <option value="interviewing">Interviewing</option>
                  <option value="negotiating">Negotiating</option>
                  <option value="offer">Offer Received</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                  Excitement Rating
                </label>
                <div className="flex items-center gap-1 p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 h-[38px]">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setExcitement(s)}
                      className="p-0.5 text-zinc-300 dark:text-zinc-700 hover:text-amber-400 transition-colors"
                    >
                      <Star
                        className={`w-4 h-4 ${
                          s <= excitement
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-zinc-300 dark:text-zinc-700'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                id="add-url"
                label="Job Posting URL"
                placeholder="https://company.com/careers/role"
                value={applicationUrl}
                onChange={(e) => setApplicationUrl(e.target.value)}
              />
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Application Deadline
                </label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Job Description & Qualifications (Optional)
              </label>
              <textarea
                rows={4}
                placeholder="Paste the job responsibilities and requirements here for instant ATS keyword extraction..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>
          </CardContent>

          <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-2 shrink-0 bg-zinc-50/50 dark:bg-zinc-900/50">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
              disabled={!companyName.trim() || !jobTitle.trim()}
            >
              Add Job to Pipeline
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
