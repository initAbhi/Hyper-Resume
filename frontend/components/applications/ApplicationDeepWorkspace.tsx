'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  JobApplication,
  JobApplicationStatus,
  ApplicationRichMetadata,
  ApplicationInterviewRound,
  ApplicationContact,
  ApplicationChecklistItem,
  Resume,
  parseApplicationMetadata,
  serializeApplicationMetadata,
} from '@/lib/api-client';
import {
  Building2,
  Calendar,
  Clock,
  DollarSign,
  MapPin,
  Star,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  ChevronLeft,
  X,
  FileText,
  Mail,
  User,
  Users,
  CheckSquare,
  Sparkles,
  Copy,
  Check,
  Plus,
  Trash2,
  Mic,
  Lightbulb,
  Edit2,
  Save,
  Ghost,
  Archive,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ApplicationDeepWorkspaceProps {
  applications: JobApplication[];
  activeAppId: string;
  resumes: Resume[];
  onSelectApp: (id: string) => void;
  onCloseWorkspace: () => void;
  onSaveApplication: (updatedApp: JobApplication) => Promise<void>;
  onDeleteApplication: (id: string) => Promise<void>;
}

const CHEVRON_STAGES: { key: JobApplicationStatus; label: string }[] = [
  { key: 'bookmarked', label: 'Bookmarked' },
  { key: 'applying', label: 'Applying' },
  { key: 'applied', label: 'Applied' },
  { key: 'interviewing', label: 'Interviewing' },
  { key: 'negotiating', label: 'Negotiating' },
  { key: 'accepted', label: 'Accepted' },
];

export function ApplicationDeepWorkspace({
  applications,
  activeAppId,
  resumes,
  onSelectApp,
  onCloseWorkspace,
  onSaveApplication,
  onDeleteApplication,
}: ApplicationDeepWorkspaceProps) {
  const currentApp = applications.find((a) => a.id === activeAppId);
  if (!currentApp) return null;

  const initialMeta = parseApplicationMetadata(currentApp.notes);

  // Deep view state
  const [activeTab, setActiveTab] = useState<
    'info' | 'notes' | 'resumes' | 'contacts' | 'templates' | 'checklist'
  >('info');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isCloseMenuOpen, setIsCloseMenuOpen] = useState(false);
  const [isDatesOpen, setIsDatesOpen] = useState(true);
  const [isGuidanceOpen, setIsGuidanceOpen] = useState(true);

  // Editable local state
  const [jobTitle, setJobTitle] = useState(currentApp.jobTitle);
  const [companyName, setCompanyName] = useState(currentApp.companyName);
  const [salary, setSalary] = useState(initialMeta.salary || '');
  const [isEditingSalary, setIsEditingSalary] = useState(false);
  const [location, setLocation] = useState(initialMeta.location || 'remote');
  const [excitement, setExcitement] = useState(initialMeta.excitement ?? 3);
  const [selectedResumeId, setSelectedResumeId] = useState(
    currentApp.resumeId || (resumes[0]?.id ?? ''),
  );

  // Dates state
  const [postedDate, setPostedDate] = useState(initialMeta.postedDate || '');
  const [savedDate, setSavedDate] = useState(
    initialMeta.savedDate || currentApp.createdAt?.slice(0, 10) || '',
  );
  const [deadline, setDeadline] = useState(initialMeta.deadline || '');
  const [appliedDate, setAppliedDate] = useState(
    currentApp.appliedDate?.slice(0, 10) || '',
  );
  const [followUpDate, setFollowUpDate] = useState(initialMeta.followUpDate || '');

  // Description & Keywords
  const [jobDescription, setJobDescription] = useState(
    initialMeta.jobDescription ||
      `Job Responsibilities:
• Lead technical design and implementation of distributed systems
• Collaborate with cross-functional product and design teams
• Optimize performance, scalability, and cloud infrastructure reliability

Requirements:
• Experience with modern microservices, CI/CD pipelines, and cloud APIs
• Strong communication and architectural leadership skills`,
  );
  const [isEditingDesc, setIsEditingDesc] = useState(false);

  // Interviews state
  const [interviews, setInterviews] = useState<ApplicationInterviewRound[]>(
    initialMeta.interviews && initialMeta.interviews.length > 0
      ? initialMeta.interviews
      : [
          {
            id: 'round-1',
            roundName: '1st Interview',
            date: '',
            type: 'Phone Screen',
            format: 'Video Call',
            interviewers: [{ name: '', title: '' }],
          },
        ],
  );
  const [activeRoundIdx, setActiveRoundIdx] = useState(0);

  // Contacts state
  const [contacts, setContacts] = useState<ApplicationContact[]>(
    initialMeta.contacts || [],
  );

  // Checklist state
  const [checklist, setChecklist] = useState<ApplicationChecklistItem[]>(
    initialMeta.checklist && initialMeta.checklist.length > 0
      ? initialMeta.checklist
      : [
          { id: '1', text: 'Tailor resume with job description keywords', completed: true, category: 'applying' },
          { id: '2', text: 'Connect with recruiter or hiring manager on LinkedIn', completed: false, category: 'applying' },
          { id: '3', text: 'Prepare 3 STAR behavioral impact stories', completed: false, category: 'interviewing' },
          { id: '4', text: 'Send post-interview thank you note within 24h', completed: false, category: 'interviewing' },
          { id: '5', text: 'Review market compensation benchmarks before offer talk', completed: false, category: 'offer' },
        ],
  );

  // Notes state
  const [notesText, setNotesText] = useState(initialMeta.notesText || '');

  // Copy notification state
  const [copiedTemplateIdx, setCopiedTemplateIdx] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Guidance percentage based on checklist
  const completedCount = checklist.filter((c) => c.completed).length;
  const progressPercent = checklist.length > 0 ? Math.round((completedCount / checklist.length) * 100) : 0;

  // Auto-extracted keyword tags from description
  const extractKeywords = (text: string) => {
    const commonStopwords = new Set([
      'and', 'the', 'with', 'for', 'that', 'this', 'from', 'have', 'experience', 'responsibilities', 'requirements', 'skills', 'team', 'teams', 'lead', 'work'
    ]);
    const words = text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 4 && !commonStopwords.has(w));
    const counts: Record<string, number> = {};
    words.forEach((w) => {
      counts[w] = (counts[w] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
  };

  const detectedKeywords = extractKeywords(jobDescription);

  // Save changes back to DB
  const handleSave = async (overrides?: Partial<JobApplication & { status: JobApplicationStatus }>) => {
    setIsSaving(true);
    try {
      const updatedMeta: ApplicationRichMetadata = {
        ...initialMeta,
        salary,
        location,
        excitement,
        postedDate,
        savedDate,
        deadline,
        followUpDate,
        jobDescription,
        notesText,
        interviews,
        contacts,
        checklist,
        closeReason: overrides?.metadata?.closeReason || initialMeta.closeReason,
      };

      const serializedNotes = serializeApplicationMetadata(updatedMeta);

      const payload: JobApplication = {
        ...currentApp,
        jobTitle,
        companyName,
        status: overrides?.status || currentApp.status,
        resumeId: selectedResumeId || undefined,
        appliedDate: appliedDate || undefined,
        notes: serializedNotes,
        metadata: updatedMeta,
      };

      await onSaveApplication(payload);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleStageChange = async (newStage: JobApplicationStatus) => {
    await handleSave({ status: newStage });
  };

  const handleCloseJobOption = async (reason: string, statusOverride: JobApplicationStatus) => {
    setIsCloseMenuOpen(false);
    await handleSave({
      status: statusOverride,
      metadata: { ...initialMeta, closeReason: reason },
    });
  };

  const handleCopyTemplate = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedTemplateIdx(idx);
    setTimeout(() => setCopiedTemplateIdx(null), 2000);
  };

  return (
    <div className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden shadow-xl flex flex-col md:flex-row min-h-[750px]">
      {/* 1. Left Sidebar: Quick Job Switcher (Collapsible, matching Teal Images 2-4) */}
      <div
        className={`border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/40 flex flex-col transition-all duration-200 shrink-0 ${
          isSidebarOpen ? 'w-full md:w-64' : 'w-12'
        }`}
      >
        <div className="p-3 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          {isSidebarOpen ? (
            <>
              <div className="flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-zinc-500" />
                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
                  Applications ({applications.length})
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsSidebarOpen(false)}
                title="Collapse sidebar"
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              title="Expand sidebar"
              className="w-full flex justify-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 py-1"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {isSidebarOpen && (
          <div className="flex-1 overflow-y-auto divide-y divide-zinc-200/60 dark:divide-zinc-800/60 no-scrollbar">
            {applications.map((app) => {
              const isSelected = app.id === activeAppId;
              const appMeta = parseApplicationMetadata(app.notes);

              return (
                <button
                  key={app.id}
                  type="button"
                  onClick={() => onSelectApp(app.id)}
                  className={`w-full text-left p-3 transition-colors cursor-pointer block ${
                    isSelected
                      ? 'bg-blue-50/80 dark:bg-blue-950/40 border-l-4 border-blue-600 text-blue-900 dark:text-blue-100'
                      : 'hover:bg-zinc-100/60 dark:hover:bg-zinc-800/40 text-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  <div className="text-xs font-bold truncate">{app.jobTitle}</div>
                  <div className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate mt-0.5 flex items-center justify-between">
                    <span>{app.companyName}</span>
                    <span className="capitalize text-[10px] font-medium text-zinc-400">
                      {app.status}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. Main Job Deep Workspace */}
      <div className="flex-1 flex flex-col overflow-y-auto min-w-0">
        {/* Workspace Top Action Bar */}
        <div className="p-4 sm:p-6 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            {/* Title, Company, Location */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  onBlur={() => handleSave()}
                  className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-zinc-50 bg-transparent border-b border-transparent hover:border-zinc-300 dark:hover:border-zinc-700 focus:border-blue-500 focus:outline-none transition-colors"
                />
              </div>
              <div className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 flex flex-wrap items-center gap-2">
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                  {companyName}
                </span>
                <span>—</span>
                <span>{location}</span>
                <span>•</span>
                <span>Saved {savedDate || 'recently'}</span>
              </div>
            </div>

            {/* Top Right: Salary, Stars, Close Workspace */}
            <div className="flex items-center gap-3">
              {/* Salary Inline Editor */}
              <div className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-300 font-mono">
                {isEditingSalary ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      value={salary}
                      placeholder="e.g. $140,000 - $180,000"
                      onChange={(e) => setSalary(e.target.value)}
                      onBlur={() => {
                        setIsEditingSalary(false);
                        handleSave();
                      }}
                      autoFocus
                      className="text-xs p-1 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsEditingSalary(true)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-md border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
                  >
                    <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{salary || 'Add Salary Range'}</span>
                    <Edit2 className="w-2.5 h-2.5 text-zinc-400" />
                  </button>
                )}
              </div>

              {/* Excitement Rating */}
              <div className="flex items-center gap-0.5 bg-zinc-50 dark:bg-zinc-900 px-2 py-1 rounded-md border border-zinc-200 dark:border-zinc-800">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      setExcitement(s);
                      handleSave({ metadata: { ...initialMeta, excitement: s } });
                    }}
                    className="p-0.5 text-zinc-300 dark:text-zinc-700 hover:text-amber-400 transition-colors"
                  >
                    <Star
                      className={`w-3.5 h-3.5 ${
                        s <= excitement
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-zinc-300 dark:text-zinc-700'
                      }`}
                    />
                  </button>
                ))}
              </div>

              {/* Close Workspace Button */}
              <button
                type="button"
                onClick={onCloseWorkspace}
                title="Return to pipeline table"
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* 3. Stage Progress Stepper */}
          <div className="mt-5 flex flex-col sm:flex-row sm:items-center gap-2">
            <div className="flex-1 flex items-center overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 no-scrollbar">
              {CHEVRON_STAGES.map((stg, idx) => {
                const stageIndex = CHEVRON_STAGES.findIndex(
                  (s) => s.key === currentApp.status,
                );
                const isCurrent = currentApp.status === stg.key;
                const isPassed = stageIndex >= idx;

                return (
                  <button
                    key={stg.key}
                    type="button"
                    onClick={() => handleStageChange(stg.key)}
                    className={`relative flex-1 py-2 px-3 text-xs font-semibold tracking-tight uppercase transition-all flex items-center justify-center gap-1 min-w-[100px] select-none cursor-pointer ${
                      isCurrent
                        ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs'
                        : isPassed
                        ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200'
                        : 'text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
                    }`}
                  >
                    <span>{stg.label}</span>
                    {idx < CHEVRON_STAGES.length - 1 && (
                      <span className="opacity-30 ml-auto font-normal">›</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Close Job Dropdown Menu */}
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => setIsCloseMenuOpen(!isCloseMenuOpen)}
                className="w-full sm:w-auto px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center justify-between gap-1.5 cursor-pointer"
              >
                <span>Close Job</span>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
              </button>

              {isCloseMenuOpen && (
                <div className="absolute right-0 mt-1 w-48 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl z-30 py-1.5 divide-y divide-zinc-100 dark:divide-zinc-800">
                  <div className="py-1">
                    <button
                      type="button"
                      onClick={() => handleCloseJobOption('withdrew', 'withdrawn')}
                      className="w-full text-left px-3 py-1.5 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-2"
                    >
                      <User className="w-3.5 h-3.5 text-zinc-400" />
                      <span>I Withdrew</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCloseJobOption('rejected', 'rejected')}
                      className="w-full text-left px-3 py-1.5 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-2"
                    >
                      <X className="w-3.5 h-3.5 text-rose-500" />
                      <span>Not Selected</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCloseJobOption('ghosted', 'ghosted')}
                      className="w-full text-left px-3 py-1.5 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-2"
                    >
                      <Ghost className="w-3.5 h-3.5 text-zinc-400" />
                      <span>No Response</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCloseJobOption('archived', 'archived')}
                      className="w-full text-left px-3 py-1.5 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-2"
                    >
                      <Archive className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Archived</span>
                    </button>
                  </div>
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={async () => {
                        setIsCloseMenuOpen(false);
                        if (confirm('Permanently delete this job application?')) {
                          await onDeleteApplication(currentApp.id);
                        }
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 font-medium"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Job</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Guidance Banner */}
          <div className="mt-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-2.5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-zinc-800 dark:text-zinc-200 font-medium">
              <Lightbulb className="w-4 h-4 text-zinc-500 shrink-0" />
              <span>
                Workflow &gt; <strong className="capitalize">{currentApp.status}</strong> Checklist:{' '}
                {progressPercent}% Complete
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-24 h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <button
                type="button"
                onClick={() => setIsGuidanceOpen(!isGuidanceOpen)}
                className="text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 p-0.5"
              >
                {isGuidanceOpen ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {isGuidanceOpen && (
            <div className="mt-2 text-xs text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div>
                {currentApp.status === 'bookmarked' &&
                  'Action: Compare your resume against role requirements to verify evidence alignment before submitting.'}
                {currentApp.status === 'applying' &&
                  'Action: Verify contact information and link your targeted resume version.'}
                {currentApp.status === 'applied' &&
                  'Action: Set a follow-up reminder for 5 business days after application submission.'}
                {currentApp.status === 'interviewing' &&
                  'Action: Review interview panel members and outline quantifiable project outcomes.'}
                {currentApp.status === 'negotiating' &&
                  'Action: Confirm base compensation, bonus structure, and equity parameters.'}
                {currentApp.status === 'accepted' &&
                  'Offer accepted. Verify start dates, onboarding paperwork, and written confirmation.'}
              </div>
            </div>
          )}
        </div>

        {/* 4. Tab Navigation (Job Info, Notes, Resumes, Contacts, Email Templates, Checklist) */}
        <div className="px-4 sm:px-6 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 flex items-center gap-1 overflow-x-auto no-scrollbar">
          {[
            { id: 'info', label: 'Job Info', icon: FileText },
            { id: 'notes', label: 'Notes', icon: Edit2 },
            { id: 'resumes', label: 'Resumes', icon: FileText },
            { id: 'contacts', label: 'Contacts', icon: Users },
            { id: 'templates', label: 'Email Templates', icon: Mail },
            { id: 'checklist', label: 'Checklist', icon: CheckSquare },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-1.5 py-3 px-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white/70 dark:bg-zinc-900/70'
                    : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* 5. Tab Content Area */}
        <div className="p-4 sm:p-6 space-y-6 flex-1">
          {/* TAB 1: JOB INFO (Dates + Description + ATS Keywords) */}
          {activeTab === 'info' && (
            <div className="space-y-6">
              {/* Accordion 1: Dates (Images 2-4) */}
              <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 p-4">
                <div
                  onClick={() => setIsDatesOpen(!isDatesOpen)}
                  className="flex items-center justify-between cursor-pointer select-none"
                >
                  <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Dates</span>
                  </h3>
                  <button type="button" className="text-zinc-400">
                    {isDatesOpen ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {isDatesOpen && (
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-4 pt-3 border-t border-zinc-200/60 dark:border-zinc-800/60">
                    <div>
                      <label className="block text-[11px] font-medium text-zinc-500 mb-1">
                        Posted
                      </label>
                      <input
                        type="date"
                        value={postedDate}
                        onChange={(e) => {
                          setPostedDate(e.target.value);
                          handleSave();
                        }}
                        className="w-full text-xs p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-zinc-500 mb-1">
                        Saved
                      </label>
                      <input
                        type="date"
                        value={savedDate}
                        onChange={(e) => {
                          setSavedDate(e.target.value);
                          handleSave();
                        }}
                        className="w-full text-xs p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-zinc-500 mb-1">
                        Deadline
                      </label>
                      <input
                        type="date"
                        value={deadline}
                        onChange={(e) => {
                          setDeadline(e.target.value);
                          handleSave();
                        }}
                        className="w-full text-xs p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-zinc-500 mb-1">
                        Applied
                      </label>
                      <input
                        type="date"
                        value={appliedDate}
                        onChange={(e) => {
                          setAppliedDate(e.target.value);
                          handleSave();
                        }}
                        className="w-full text-xs p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-zinc-500 mb-1">
                        Follow Up
                      </label>
                      <input
                        type="date"
                        value={followUpDate}
                        onChange={(e) => {
                          setFollowUpDate(e.target.value);
                          handleSave();
                        }}
                        className="w-full text-xs p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Accordion 2: Interview Tracking (Image 3) */}
              <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 p-4">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-200/60 dark:border-zinc-800/60">
                  <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Mic className="w-3.5 h-3.5 text-purple-500" />
                    <span>Interview Tracking</span>
                  </h3>
                  <Link
                    href="/app/interview"
                    className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-md bg-purple-600 hover:bg-purple-700 text-white transition-colors"
                  >
                    <Mic className="w-3 h-3" />
                    <span>New Practice Session</span>
                  </Link>
                </div>

                <div className="mt-4 flex flex-col md:flex-row gap-4">
                  {/* Round Tabs */}
                  <div className="w-full md:w-44 space-y-1">
                    {interviews.map((round, idx) => (
                      <button
                        key={round.id || idx}
                        type="button"
                        onClick={() => setActiveRoundIdx(idx)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center justify-between ${
                          activeRoundIdx === idx
                            ? 'bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-xs'
                            : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800/50'
                        }`}
                      >
                        <span>{round.roundName || `Round ${idx + 1}`}</span>
                        {interviews.length > 1 && (
                          <span
                            onClick={(e) => {
                              e.stopPropagation();
                              const updated = interviews.filter((_, i) => i !== idx);
                              setInterviews(updated);
                              setActiveRoundIdx(0);
                              handleSave();
                            }}
                            className="text-zinc-400 hover:text-rose-500 p-0.5"
                          >
                            ×
                          </span>
                        )}
                      </button>
                    ))}

                    <button
                      type="button"
                      onClick={() => {
                        const newRound: ApplicationInterviewRound = {
                          id: `round-${Date.now()}`,
                          roundName: `${interviews.length + 1}${
                            interviews.length === 1 ? 'nd' : interviews.length === 2 ? 'rd' : 'th'
                          } Interview`,
                          date: '',
                          type: 'Technical Screen',
                          format: 'Video Call',
                          interviewers: [{ name: '', title: '' }],
                        };
                        setInterviews([...interviews, newRound]);
                        setActiveRoundIdx(interviews.length);
                        handleSave();
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Interview</span>
                    </button>
                  </div>

                  {/* Round Details */}
                  {interviews[activeRoundIdx] && (
                    <div className="flex-1 bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] font-medium text-zinc-500 mb-1">
                            Date of Interview
                          </label>
                          <input
                            type="datetime-local"
                            value={interviews[activeRoundIdx].date || ''}
                            onChange={(e) => {
                              const updated = [...interviews];
                              updated[activeRoundIdx].date = e.target.value;
                              setInterviews(updated);
                              handleSave();
                            }}
                            className="w-full text-xs p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-medium text-zinc-500 mb-1">
                            Type
                          </label>
                          <select
                            value={interviews[activeRoundIdx].type || 'Phone Screen'}
                            onChange={(e) => {
                              const updated = [...interviews];
                              updated[activeRoundIdx].type = e.target.value;
                              setInterviews(updated);
                              handleSave();
                            }}
                            className="w-full text-xs p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200"
                          >
                            <option value="Phone Screen">Recruiter Phone Screen</option>
                            <option value="Hiring Manager">Hiring Manager 1-on-1</option>
                            <option value="Technical Assessment">Technical / Live Coding</option>
                            <option value="System Design">System Design & Architecture</option>
                            <option value="Behavioral Panel">Behavioral / STAR Panel</option>
                            <option value="Executive Chat">Executive / Culture Chat</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[11px] font-medium text-zinc-500 mb-1">
                            Format
                          </label>
                          <select
                            value={interviews[activeRoundIdx].format || 'Video Call'}
                            onChange={(e) => {
                              const updated = [...interviews];
                              updated[activeRoundIdx].format = e.target.value;
                              setInterviews(updated);
                              handleSave();
                            }}
                            className="w-full text-xs p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200"
                          >
                            <option value="Video Call">Google Meet / Zoom</option>
                            <option value="Phone">Phone Call</option>
                            <option value="Onsite">On-Site Office</option>
                          </select>
                        </div>
                      </div>

                      {/* Interviewers */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                            Interviewers
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = [...interviews];
                              const list = updated[activeRoundIdx].interviewers || [];
                              list.push({ name: '', title: '' });
                              updated[activeRoundIdx].interviewers = list;
                              setInterviews(updated);
                              handleSave();
                            }}
                            className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline font-medium flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Add Interviewer</span>
                          </button>
                        </div>

                        {(interviews[activeRoundIdx].interviewers || []).map((intr, i) => (
                          <div key={i} className="flex items-center gap-2 mb-2">
                            <input
                              type="text"
                              placeholder="Name (e.g. Alex Rivera)"
                              value={intr.name}
                              onChange={(e) => {
                                const updated = [...interviews];
                                updated[activeRoundIdx].interviewers![i].name = e.target.value;
                                setInterviews(updated);
                              }}
                              onBlur={() => handleSave()}
                              className="flex-1 text-xs p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200"
                            />
                            <input
                              type="text"
                              placeholder="Title (e.g. Engineering Director)"
                              value={intr.title || ''}
                              onChange={(e) => {
                                const updated = [...interviews];
                                updated[activeRoundIdx].interviewers![i].title = e.target.value;
                                setInterviews(updated);
                              }}
                              onBlur={() => handleSave()}
                              className="flex-1 text-xs p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const updated = [...interviews];
                                updated[activeRoundIdx].interviewers = updated[
                                  activeRoundIdx
                                ].interviewers!.filter((_, idx2) => idx2 !== i);
                                setInterviews(updated);
                                handleSave();
                              }}
                              className="text-zinc-400 hover:text-rose-500 p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Accordion 3: Job Description & ATS Keywords (Images 2-4) */}
              <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 p-4">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-200/60 dark:border-zinc-800/60 mb-4">
                  <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                    <span>Job Description & ATS Keywords</span>
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingDesc(!isEditingDesc);
                        if (isEditingDesc) handleSave();
                      }}
                      className="text-xs font-semibold px-2.5 py-1 rounded-md border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors"
                    >
                      {isEditingDesc ? 'Save Text' : 'Edit Description'}
                    </button>
                    <Link
                      href={`/app/match?role=${encodeURIComponent(
                        jobTitle,
                      )}&company=${encodeURIComponent(companyName)}`}
                      className="text-xs font-semibold px-2.5 py-1 rounded-md bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Optimize CV Match</span>
                    </Link>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column: Job Description Text */}
                  <div className="lg:col-span-2">
                    {isEditingDesc ? (
                      <textarea
                        rows={10}
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        placeholder="Paste the job responsibilities and qualifications here..."
                        className="w-full text-xs font-mono p-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500 leading-relaxed"
                      />
                    ) : (
                      <div className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap bg-white dark:bg-zinc-900/60 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
                        {jobDescription}
                      </div>
                    )}
                  </div>

                  {/* Right Column: ATS Detected Keywords Pill Cloud (Images 2-4) */}
                  <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                        Extracted Role Keywords
                      </span>
                      <span className="text-[10px] font-mono font-medium text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-700">
                        {detectedKeywords.length} terms
                      </span>
                    </div>

                    <p className="text-[11px] text-zinc-500 leading-normal">
                      Keywords identified in the role specification. Incorporate relevant terms where you have verifiable accomplishments.
                    </p>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {detectedKeywords.map(([kw, count]) => (
                        <span
                          key={kw}
                          className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700"
                        >
                          <span>{kw}</span>
                          <span className="text-[9px] text-zinc-400 font-mono">
                            ×{count}
                          </span>
                        </span>
                      ))}
                    </div>

                    <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800">
                      <Link
                        href="/app/match"
                        className="w-full text-center block text-xs font-medium py-1.5 px-3 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 transition-colors"
                      >
                        Compare with Resume in Match Analyzer
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: NOTES */}
          {activeTab === 'notes' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    Application Scratchpad & Interview Prep Notes
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Record recruiter impressions, interview questions to ask, compensation details, and team structure notes.
                  </p>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  isLoading={isSaving}
                  onClick={() => handleSave()}
                  className="gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{saveSuccess ? 'Saved!' : 'Save Notes'}</span>
                </Button>
              </div>

              <textarea
                rows={12}
                value={notesText}
                onChange={(e) => setNotesText(e.target.value)}
                placeholder="Write your notes here... (e.g. Recruiter mentioned team is expanding from 4 to 9 engineers. Target budget is $165k base + equity. First interview with Tech Lead next Tuesday.)"
                className="w-full text-xs font-sans p-4 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500 leading-relaxed"
              />
            </div>
          )}

          {/* TAB 3: RESUMES */}
          {activeTab === 'resumes' && (
            <div className="space-y-4 max-w-2xl">
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Linked Resume Variant
                </h3>
                <p className="text-xs text-zinc-500">
                  Track which tailored resume version was submitted to this position.
                </p>
              </div>

              {resumes.length === 0 ? (
                <div className="p-6 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 text-center text-xs text-zinc-500">
                  No resume profiles created yet.{' '}
                  <Link href="/app/resumes" className="text-blue-600 hover:underline">
                    Create your first resume
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  <select
                    value={selectedResumeId}
                    onChange={(e) => {
                      setSelectedResumeId(e.target.value);
                      handleSave();
                    }}
                    className="w-full text-xs p-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-medium"
                  >
                    {resumes.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} (Target: {r.targetRole || 'General'}, v{r.version || 1})
                      </option>
                    ))}
                  </select>

                  <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                          {resumes.find((r) => r.id === selectedResumeId)?.name || 'Resume'}
                        </div>
                        <div className="text-[11px] text-zinc-500">
                          Target Role: {resumes.find((r) => r.id === selectedResumeId)?.targetRole || 'General'}
                        </div>
                      </div>
                    </div>

                    <Link
                      href={`/app/resumes/${selectedResumeId}`}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 text-zinc-800 dark:text-zinc-200 transition-colors"
                    >
                      Open in CV Studio
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: CONTACTS */}
          {activeTab === 'contacts' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    Hiring Team & Network Contacts
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Track the recruiters, hiring managers, and internal referrers connected to this role.
                  </p>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    const newContact: ApplicationContact = {
                      id: `contact-${Date.now()}`,
                      name: '',
                      role: '',
                      email: '',
                      linkedin: '',
                    };
                    setContacts([...contacts, newContact]);
                    handleSave();
                  }}
                  className="gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Contact</span>
                </Button>
              </div>

              {contacts.length === 0 ? (
                <div className="p-8 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-400 text-xs">
                  No contacts recorded yet. Add recruiters and hiring managers to streamline communication.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {contacts.map((contact, idx) => (
                    <div
                      key={contact.id || idx}
                      className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-3 relative group"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          const updated = contacts.filter((_, i) => i !== idx);
                          setContacts(updated);
                          handleSave();
                        }}
                        className="absolute top-3 right-3 text-zinc-400 hover:text-rose-500 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <div className="space-y-2">
                        <input
                          type="text"
                          placeholder="Contact Name (e.g. Jordan Hayes)"
                          value={contact.name}
                          onChange={(e) => {
                            const updated = [...contacts];
                            updated[idx].name = e.target.value;
                            setContacts(updated);
                          }}
                          onBlur={() => handleSave()}
                          className="w-full text-xs font-bold p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                        />
                        <input
                          type="text"
                          placeholder="Title / Role (e.g. Senior Tech Recruiter)"
                          value={contact.role || ''}
                          onChange={(e) => {
                            const updated = [...contacts];
                            updated[idx].role = e.target.value;
                            setContacts(updated);
                          }}
                          onBlur={() => handleSave()}
                          className="w-full text-xs p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200"
                        />
                        <input
                          type="email"
                          placeholder="Email (e.g. j.hayes@company.com)"
                          value={contact.email || ''}
                          onChange={(e) => {
                            const updated = [...contacts];
                            updated[idx].email = e.target.value;
                            setContacts(updated);
                          }}
                          onBlur={() => handleSave()}
                          className="w-full text-xs p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200"
                        />
                        <input
                          type="url"
                          placeholder="LinkedIn Profile URL"
                          value={contact.linkedin || ''}
                          onChange={(e) => {
                            const updated = [...contacts];
                            updated[idx].linkedin = e.target.value;
                            setContacts(updated);
                          }}
                          onBlur={() => handleSave()}
                          className="w-full text-xs p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: EMAIL TEMPLATES */}
          {activeTab === 'templates' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Ready-to-Send Outreach & Follow-up Templates
                </h3>
                <p className="text-xs text-zinc-500">
                  High-converting email scripts customized with {companyName} and {jobTitle}.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    title: 'Cold Outreach to Hiring Manager',
                    stage: 'Applying',
                    body: `Subject: ${jobTitle} role at ${companyName} — Application & Quick note\n\nHi [Hiring Manager Name],\n\nI recently submitted my application for the ${jobTitle} opening at ${companyName}. Having followed ${companyName}'s work in this space, I wanted to reach out directly to express my enthusiasm.\n\nIn my recent experience, I led initiatives that directly improved system scalability and operational efficiency. I would welcome the opportunity to briefly share how my background aligns with what you're building.\n\nBest regards,\n[Your Name]\n[LinkedIn Profile Link]`,
                  },
                  {
                    title: '5-Day Post-Application Follow Up',
                    stage: 'Applied',
                    body: `Subject: Following up on application — ${jobTitle} (${companyName})\n\nHi [Recruiter Name],\n\nI hope you're having a productive week! I wanted to follow up on my application for the ${jobTitle} position submitted on ${appliedDate || 'earlier this week'}.\n\nI remain very excited about the prospect of contributing to ${companyName} and would love to know if there are any additional details or references I can provide at this stage.\n\nThank you for your time,\n[Your Name]`,
                  },
                  {
                    title: 'Post-Interview Thank You (Within 24h)',
                    stage: 'Interviewing',
                    body: `Subject: Thank you — ${jobTitle} interview with ${companyName}\n\nHi [Interviewer Name],\n\nThank you so much for taking the time to speak with me today regarding the ${jobTitle} position at ${companyName}. I really enjoyed learning more about the team's current technical priorities.\n\nOur conversation further reinforced my enthusiasm for the role. Please feel free to reach out if you need any additional work samples or clarification on my previous projects.\n\nBest regards,\n[Your Name]`,
                  },
                  {
                    title: 'Salary Negotiation Counter-Offer',
                    stage: 'Negotiating',
                    body: `Subject: ${companyName} — ${jobTitle} Offer Discussion\n\nDear [Hiring Manager / Recruiter],\n\nThank you for extending the offer to join ${companyName} as ${jobTitle}. I am genuinely excited about the team and the opportunity.\n\nBased on my specialized background and current industry compensation for this scope, I was hoping we could discuss bringing the base salary to [Target Base, e.g. $170,000], or exploring flexibility around the sign-on bonus / equity grant. I am confident I can make an immediate high-impact contribution.\n\nLooking forward to speaking soon,\n[Your Name]`,
                  },
                ].map((tmpl, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-3 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                          {tmpl.title}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-semibold uppercase">
                          {tmpl.stage}
                        </span>
                      </div>
                      <pre className="text-[11px] text-zinc-600 dark:text-zinc-300 font-sans whitespace-pre-wrap bg-zinc-50 dark:bg-zinc-950 p-3 rounded-lg border border-zinc-200/60 dark:border-zinc-800/60 max-h-48 overflow-y-auto leading-relaxed">
                        {tmpl.body}
                      </pre>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopyTemplate(tmpl.body, idx)}
                        className="gap-1.5 text-xs"
                      >
                        {copiedTemplateIdx === idx ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Copied to clipboard!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Template</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: CHECKLIST */}
          {activeTab === 'checklist' && (
            <div className="space-y-4 max-w-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    Application Action Checklist
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Step-by-step tasks to guarantee maximum conversion at every stage of the process.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const text = prompt('Enter new checklist task:');
                    if (text && text.trim()) {
                      const updated = [
                        ...checklist,
                        {
                          id: `task-${Date.now()}`,
                          text: text.trim(),
                          completed: false,
                        },
                      ];
                      setChecklist(updated);
                      handleSave();
                    }
                  }}
                  className="gap-1 text-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Task</span>
                </Button>
              </div>

              <div className="space-y-2">
                {checklist.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-between gap-3 group"
                  >
                    <label className="flex items-center gap-3 cursor-pointer flex-1 select-none">
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={() => {
                          const updated = [...checklist];
                          updated[idx].completed = !updated[idx].completed;
                          setChecklist(updated);
                          handleSave();
                        }}
                        className="rounded border-zinc-300 dark:border-zinc-700 text-blue-600 focus:ring-blue-500 cursor-pointer w-4 h-4"
                      />
                      <span
                        className={`text-xs ${
                          item.completed
                            ? 'line-through text-zinc-400 dark:text-zinc-500'
                            : 'text-zinc-800 dark:text-zinc-200 font-medium'
                        }`}
                      >
                        {item.text}
                      </span>
                    </label>

                    <button
                      type="button"
                      onClick={() => {
                        const updated = checklist.filter((_, i) => i !== idx);
                        setChecklist(updated);
                        handleSave();
                      }}
                      className="text-zinc-400 hover:text-rose-500 p-1 opacity-60 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
