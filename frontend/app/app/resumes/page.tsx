'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert } from '@/components/ui/alert';
import {
  FileText,
  Plus,
  Upload,
  Clock,
  Sparkles,
  Trash2,
  CheckCircle2,
  X,
  FileCheck,
} from 'lucide-react';
import { apiClient, Resume, ParsedProfileDraft, ResumeContent } from '@/lib/api-client';

export default function ResumesListPage() {
  const router = useRouter();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Create Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newResumeName, setNewResumeName] = useState('');
  const [newResumeRole, setNewResumeRole] = useState('');
  const [newResumeCompany, setNewResumeCompany] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Upload Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [parsedDraft, setParsedDraft] = useState<ParsedProfileDraft | null>(null);
  const [importedResumeName, setImportedResumeName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let isMounted = true;
    apiClient
      .listResumes()
      .then((data) => {
        if (isMounted) setResumes(data);
      })
      .catch((err: unknown) => {
        if (isMounted) {
          setErrorMessage(
            err instanceof Error ? err.message : 'Failed to load your resumes.',
          );
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleCreateFromScratch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResumeName.trim()) return;

    setIsSubmitting(true);
    try {
      const defaultContent: ResumeContent = {
        contact: {
          fullName: 'New Candidate',
          email: 'candidate@example.com',
        },
        headline: newResumeRole.trim() || 'Software Engineer',
        summary: 'Experienced professional with a proven track record of delivering measurable outcomes.',
        skills: [{ name: 'TypeScript' }, { name: 'PostgreSQL' }],
        experience: [
          {
            company: 'Tech Company',
            title: newResumeRole.trim() || 'Software Engineer',
            startDate: '2022',
            current: true,
            bullets: [
              'Architected core services handling 100k+ daily transactions with 99.9% uptime.',
            ],
          },
        ],
        education: [
          {
            school: 'University of Technology',
            degree: 'Bachelor of Science',
            field: 'Computer Science',
            graduationDate: '2021',
          },
        ],
      };

      const newResume = await apiClient.createResume({
        name: newResumeName.trim(),
        targetRole: newResumeRole.trim() || undefined,
        targetCompany: newResumeCompany.trim() || undefined,
        content: defaultContent,
      });

      setIsCreateModalOpen(false);
      router.push(`/app/resumes/${newResume.id}`);
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Failed to create resume.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadFile(file);
    setIsUploading(true);
    setUploadError(null);
    setParsedDraft(null);

    try {
      const result = await apiClient.uploadAndParseResume(file);
      setParsedDraft(result.draft);
      setImportedResumeName(file.name.replace(/\.[^/.]+$/, ''));
    } catch (err: unknown) {
      setUploadError(
        err instanceof Error
          ? err.message
          : 'Could not parse document. Please ensure it is a valid, readable PDF or DOCX file.',
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!parsedDraft) return;

    setIsSubmitting(true);
    try {
      const convertedContent: ResumeContent = {
        contact: {
          fullName: parsedDraft.headline ? 'Candidate' : 'Applicant',
          email: '',
          location: parsedDraft.location || undefined,
        },
        headline: parsedDraft.headline || 'Professional Profile',
        summary: parsedDraft.summary || '',
        skills: parsedDraft.skills || [],
        experience: (parsedDraft.experience || []).map((exp) => ({
          company: exp.company || 'Company',
          title: exp.title || 'Role',
          location: exp.location,
          startDate: exp.startDate || '2020',
          endDate: exp.endDate,
          current: exp.current ?? false,
          bullets: exp.bullets || [],
        })),
        education: (parsedDraft.education || []).map((edu) => ({
          school: edu.school || 'University',
          degree: edu.degree || 'Degree',
          field: edu.field || 'Field',
          graduationDate: edu.graduationDate,
        })),
        projects: parsedDraft.projects || [],
        certifications: parsedDraft.certifications || [],
      };

      const resume = await apiClient.createResume({
        name: importedResumeName.trim() || 'Imported Resume',
        content: convertedContent,
      });

      setIsUploadModalOpen(false);
      router.push(`/app/resumes/${resume.id}`);
    } catch (err: unknown) {
      setUploadError(
        err instanceof Error ? err.message : 'Failed to save imported resume.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleArchiveResume = async (resumeId: string) => {
    if (!confirm('Are you sure you want to archive this resume?')) return;
    try {
      await apiClient.archiveResume(resumeId);
      setResumes((prev) => prev.filter((r) => r.id !== resumeId));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to archive resume');
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            My Resumes
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Maintain your master career profile and spawn job-tailored versions with verified evidence.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setUploadFile(null);
              setParsedDraft(null);
              setUploadError(null);
              setIsUploadModalOpen(true);
            }}
            className="gap-2"
          >
            <Upload className="w-4 h-4 text-blue-600" />
            <span>Import PDF / DOCX</span>
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setNewResumeName('');
              setNewResumeRole('');
              setNewResumeCompany('');
              setIsCreateModalOpen(true);
            }}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create from Scratch</span>
          </Button>
        </div>
      </div>

      {/* Grounded AI Invariant Banner */}
      <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/60 dark:bg-blue-950/30 dark:border-blue-900 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="text-sm">
          <span className="font-semibold text-blue-950 dark:text-blue-200">
            Evidence-Backed Resume Generation:{' '}
          </span>
          <span className="text-blue-900/90 dark:text-blue-300">
            HyperResume only uses bullet points, skills, and credentials present in your profile. We will never fabricate metrics or invent job titles.
          </span>
        </div>
      </div>

      {/* Global Error Banner */}
      {errorMessage && (
        <Alert variant="destructive">{errorMessage}</Alert>
      )}

      {/* Resumes Grid */}
      {isLoading ? (
        <div className="p-12 text-center text-sm text-zinc-500 border rounded-xl bg-white dark:bg-zinc-900 animate-pulse">
          Loading your resumes...
        </div>
      ) : resumes.length === 0 ? (
        <div className="p-10 rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-center flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center mb-3">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
            No resumes yet
          </h3>
          <p className="text-xs text-zinc-500 max-w-sm mt-1 mb-5 leading-relaxed">
            Create your first master resume or import an existing document to start tailoring for target job applications.
          </p>
          <div className="flex gap-3">
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsCreateModalOpen(true)}
              className="gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create from Scratch</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsUploadModalOpen(true)}
              className="gap-1.5"
            >
              <Upload className="w-4 h-4" />
              <span>Import Document</span>
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {resumes.map((resume) => (
            <div
              key={resume.id}
              className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center font-bold text-xs">
                      CV
                    </span>
                    <div>
                      <h2 className="font-semibold text-zinc-900 dark:text-zinc-100 text-base hover:text-blue-600 transition-colors">
                        <Link href={`/app/resumes/${resume.id}`}>
                          {resume.name}
                        </Link>
                      </h2>
                      <p className="text-xs text-zinc-500">
                        Updated {new Date(resume.updatedAt).toLocaleDateString()} · v{resume.version}
                      </p>
                    </div>
                  </div>
                  {resume.isMaster && (
                    <Badge variant="success">Master Profile</Badge>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/50">
                    <div className="text-[11px] text-zinc-500">Target Role</div>
                    <div
                      className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate mt-0.5"
                      title={resume.targetRole || 'Not specified'}
                    >
                      {resume.targetRole || 'General'}
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/50">
                    <div className="text-[11px] text-zinc-500">Experience</div>
                    <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 mt-0.5">
                      {(resume.content?.experience || []).length} Roles
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/50">
                    <div className="text-[11px] text-zinc-500">Skills</div>
                    <div className="text-xs font-semibold text-blue-600 mt-0.5">
                      {(resume.content?.skills || []).length} Verified
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                <Link
                  href={`/app/resumes/${resume.id}`}
                  className="text-xs font-semibold text-blue-600 hover:underline inline-flex items-center gap-1"
                >
                  Open in 3-Panel Editor →
                </Link>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/app/match?resumeId=${resume.id}`}
                    className="px-2.5 py-1 text-xs rounded border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition-colors"
                  >
                    Match JD
                  </Link>
                  <button
                    onClick={() => handleArchiveResume(resume.id)}
                    className="p-1 rounded text-zinc-400 hover:text-rose-600 transition-colors"
                    title="Archive resume"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Create from Scratch */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md shadow-xl bg-white dark:bg-zinc-900 animate-in fade-in zoom-in-95">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-lg">Create New Resume</CardTitle>
                <CardDescription>Start with a structured single-column ATS profile.</CardDescription>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-600"
              >
                <X className="w-5 h-5" />
              </button>
            </CardHeader>
            <form onSubmit={handleCreateFromScratch}>
              <CardContent className="space-y-4 pt-2">
                <Input
                  id="create-resume-name"
                  label="Resume Title"
                  placeholder="e.g. Senior Backend Engineer (Stripe)"
                  value={newResumeName}
                  onChange={(e) => setNewResumeName(e.target.value)}
                  required
                />
                <Input
                  id="create-resume-role"
                  label="Target Job Title (Optional)"
                  placeholder="e.g. Staff Infrastructure Engineer"
                  value={newResumeRole}
                  onChange={(e) => setNewResumeRole(e.target.value)}
                />
                <Input
                  id="create-resume-company"
                  label="Target Company (Optional)"
                  placeholder="e.g. Stripe, Razorpay"
                  value={newResumeCompany}
                  onChange={(e) => setNewResumeCompany(e.target.value)}
                />
              </CardContent>
              <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isSubmitting}
                  disabled={!newResumeName.trim()}
                >
                  Create & Open Editor
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Modal: Import PDF / DOCX */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-lg shadow-xl bg-white dark:bg-zinc-900 animate-in fade-in zoom-in-95">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-lg">Import Resume Document</CardTitle>
                <CardDescription>
                  Upload your existing PDF or DOCX file to extract verified career facts.
                </CardDescription>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-600"
              >
                <X className="w-5 h-5" />
              </button>
            </CardHeader>

            <CardContent className="space-y-4 pt-2">
              {uploadError && (
                <Alert variant="destructive">{uploadError}</Alert>
              )}

              {!parsedDraft ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="p-8 border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-blue-500 rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-colors"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                  <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center mb-3">
                    <Upload className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {uploadFile ? uploadFile.name : 'Click to select or drop a PDF / DOCX file'}
                  </p>
                  <p className="text-xs text-zinc-500 mt-1">
                    Up to 10MB · Plain text extraction preserves fact integrity
                  </p>
                  {isUploading && (
                    <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-blue-600 animate-pulse">
                      <Clock className="w-4 h-4 animate-spin" />
                      Parsing career history with AI extraction engine...
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      Successfully extracted {(parsedDraft.experience || []).length} positions and {(parsedDraft.skills || []).length} verified skills!
                    </span>
                  </div>

                  <Input
                    id="import-resume-name"
                    label="Resume Title"
                    value={importedResumeName}
                    onChange={(e) => setImportedResumeName(e.target.value)}
                    required
                  />

                  <div className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs space-y-2 bg-zinc-50 dark:bg-zinc-800/50">
                    <div>
                      <span className="font-semibold text-zinc-700 dark:text-zinc-300">Extracted Headline: </span>
                      <span className="text-zinc-900 dark:text-zinc-100">{parsedDraft.headline || 'None detected'}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-zinc-700 dark:text-zinc-300">Extracted Skills: </span>
                      <span className="text-zinc-900 dark:text-zinc-100">
                        {(parsedDraft.skills || []).map((s) => s.name).slice(0, 8).join(', ')}
                        {(parsedDraft.skills || []).length > 8 ? '...' : ''}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>

            <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsUploadModalOpen(false)}
              >
                Cancel
              </Button>
              {parsedDraft && (
                <Button
                  variant="primary"
                  onClick={handleConfirmImport}
                  isLoading={isSubmitting}
                >
                  <FileCheck className="w-4 h-4 mr-1.5" />
                  Save & Open in Editor
                </Button>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
