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
  Search,
  Filter,
} from 'lucide-react';
import { apiClient, Resume, ParsedProfileDraft, ResumeContent } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';

export default function ResumesListPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'master' | 'tailored'>('all');

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

  // Auto-restore template cloned before sign-in
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const pending = sessionStorage.getItem('pending_cloned_resume');
    if (!pending) return;
    sessionStorage.removeItem('pending_cloned_resume');
    try {
      const data = JSON.parse(pending);
      setIsSubmitting(true);
      apiClient.createResume({
        name: data.title || 'Cloned Resume',
        content: data.content,
      }).then((created) => {
        router.push('/app/resumes/' + created.id);
      }).catch((err) => {
        setErrorMessage(err instanceof Error ? err.message : 'Failed to clone template.');
        setIsSubmitting(false);
      });
    } catch {}
  }, [router]);

  useEffect(() => {
    let isMounted = true;
    apiClient
      .listResumes()
      .then((data) => {
        if (isMounted) {
          const safeResumes = Array.isArray(data)
            ? data
            : ((data as unknown) as { items: Resume[] })?.items || [];
          setResumes(safeResumes);
        }
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
          fullName: user?.fullName || 'Candidate',
          email: user?.email || 'candidate@example.com',
        },
        headline: newResumeRole.trim() || 'Software Engineer',
        summary: 'Experienced professional with a proven track record of delivering measurable outcomes.',
        skills: [{ name: 'TypeScript' }, { name: 'PostgreSQL' }],
        experience: [
          {
            company: newResumeCompany.trim() || 'Tech Company',
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
          fullName: parsedDraft.contact?.fullName || user?.fullName || 'Candidate',
          email: parsedDraft.contact?.email || user?.email || '',
          phone: parsedDraft.contact?.phone || '',
          location: parsedDraft.contact?.location || parsedDraft.location || undefined,
          linkedinUrl: parsedDraft.contact?.linkedinUrl || undefined,
          githubUrl: parsedDraft.contact?.githubUrl || undefined,
          websiteUrl: parsedDraft.contact?.websiteUrl || undefined,
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

  const filteredResumes = resumes.filter((r) => {
    if (filterType === 'master' && !r.isMaster) return false;
    if (filterType === 'tailored' && r.isMaster) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = r.name.toLowerCase().includes(q);
      const matchRole = r.targetRole?.toLowerCase().includes(q);
      const matchCompany = r.targetCompany?.toLowerCase().includes(q);
      if (!matchName && !matchRole && !matchCompany) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-[#E2E5E9] dark:border-[#252A33]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1A1D23] dark:text-[#F0F2F5]">
            My Resumes
          </h1>
          <p className="text-xs sm:text-sm text-[#5A6270] dark:text-[#9EA7B4] mt-0.5">
            Maintain your master career profile and manage tailored versions with verified evidence.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setUploadFile(null);
              setParsedDraft(null);
              setUploadError(null);
              setIsUploadModalOpen(true);
            }}
            className="gap-1.5"
          >
            <Upload className="w-3.5 h-3.5 text-[#285FEA]" />
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
            className="gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Resume</span>
          </Button>
        </div>
      </div>

      {/* Global Error Banner */}
      {errorMessage && (
        <Alert variant="destructive">{errorMessage}</Alert>
      )}

      {/* Search & Filter Bar */}
      {resumes.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#848D9A]" />
            <input
              type="text"
              placeholder="Search resumes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 pl-8 pr-3 text-xs rounded-md border border-[#E2E5E9] dark:border-[#252A33] bg-white dark:bg-[#14171C] text-[#1A1D23] dark:text-[#F0F2F5] placeholder:text-[#848D9A] focus:outline-none focus:ring-1 focus:ring-[#285FEA] w-full"
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs text-[#5A6270] dark:text-[#9EA7B4]">
            <span className="text-[11px] font-medium text-[#848D9A]">Filter:</span>
            <button
              onClick={() => setFilterType('all')}
              className={`px-2.5 py-1 rounded text-xs transition-colors ${
                filterType === 'all'
                  ? 'bg-[#F1F3F5] dark:bg-[#1D2128] text-[#1A1D23] dark:text-[#F0F2F5] font-semibold'
                  : 'text-[#5A6270] hover:text-[#1A1D23]'
              }`}
            >
              All ({resumes.length})
            </button>
            <button
              onClick={() => setFilterType('master')}
              className={`px-2.5 py-1 rounded text-xs transition-colors ${
                filterType === 'master'
                  ? 'bg-[#F1F3F5] dark:bg-[#1D2128] text-[#1A1D23] dark:text-[#F0F2F5] font-semibold'
                  : 'text-[#5A6270] hover:text-[#1A1D23]'
              }`}
            >
              Master ({resumes.filter((r) => r.isMaster).length})
            </button>
            <button
              onClick={() => setFilterType('tailored')}
              className={`px-2.5 py-1 rounded text-xs transition-colors ${
                filterType === 'tailored'
                  ? 'bg-[#F1F3F5] dark:bg-[#1D2128] text-[#1A1D23] dark:text-[#F0F2F5] font-semibold'
                  : 'text-[#5A6270] hover:text-[#1A1D23]'
              }`}
            >
              Tailored ({resumes.filter((r) => !r.isMaster).length})
            </button>
          </div>
        </div>
      )}

      {/* Resumes Grid */}
      {isLoading ? (
        <div className="p-12 text-center text-xs text-[#848D9A] border border-[#E2E5E9] dark:border-[#252A33] rounded-lg bg-white dark:bg-[#14171C]">
          Loading your resumes...
        </div>
      ) : filteredResumes.length === 0 ? (
        <div className="p-10 rounded-lg border border-dashed border-[#CBD0D7] dark:border-[#333945] bg-white dark:bg-[#14171C] text-center flex flex-col items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-[#F1F3F5] dark:bg-[#1D2128] text-[#5A6270] dark:text-[#9EA7B4] flex items-center justify-center mb-3">
            <FileText className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-semibold text-[#1A1D23] dark:text-[#F0F2F5]">
            {resumes.length === 0 ? 'No resumes in workspace' : 'No matching resumes found'}
          </h3>
          <p className="text-xs text-[#5A6270] dark:text-[#9EA7B4] max-w-sm mt-1 mb-4 leading-relaxed">
            {resumes.length === 0
              ? 'Create your first master resume or import an existing document to start tailoring for target job applications.'
              : 'Try clearing your search query or filter to view other resumes.'}
          </p>
          {resumes.length === 0 && (
            <div className="flex gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsCreateModalOpen(true)}
                className="gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create from Scratch</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsUploadModalOpen(true)}
                className="gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Import Document</span>
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredResumes.map((resume) => (
            <div
              key={resume.id}
              className="p-5 rounded-lg border border-[#E2E5E9] dark:border-[#252A33] bg-white dark:bg-[#14171C] hover:border-[#CBD0D7] dark:hover:border-[#333945] transition-all flex flex-col justify-between shadow-xs group"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded bg-[#F1F3F5] dark:bg-[#1D2128] text-[#285FEA] flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="font-semibold text-[#1A1D23] dark:text-[#F0F2F5] text-sm group-hover:text-[#285FEA] transition-colors">
                        <Link href={`/app/resumes/${resume.id}`}>
                          {resume.name}
                        </Link>
                      </h2>
                      <p className="text-[11px] text-[#848D9A]">
                        Updated {new Date(resume.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })} · v{resume.version}
                      </p>
                    </div>
                  </div>
                  {resume.isMaster && (
                    <Badge variant="neutral" className="text-[10px]">
                      Master Profile
                    </Badge>
                  )}
                </div>

                <div className="mt-3 pt-3 border-t border-[#F1F3F5] dark:border-[#1D2128] grid grid-cols-3 gap-2 text-center">
                  <div className="p-1.5 rounded bg-[#F7F8FA] dark:bg-[#1D2128]/50">
                    <div className="text-[10px] text-[#848D9A]">Target Role</div>
                    <div
                      className="text-xs font-medium text-[#1A1D23] dark:text-[#F0F2F5] truncate mt-0.5"
                      title={resume.targetRole || 'Not specified'}
                    >
                      {resume.targetRole || 'General'}
                    </div>
                  </div>
                  <div className="p-1.5 rounded bg-[#F7F8FA] dark:bg-[#1D2128]/50">
                    <div className="text-[10px] text-[#848D9A]">Experience</div>
                    <div className="text-xs font-medium text-[#1A1D23] dark:text-[#F0F2F5] mt-0.5">
                      {(resume.content?.experience || []).length} Roles
                    </div>
                  </div>
                  <div className="p-1.5 rounded bg-[#F7F8FA] dark:bg-[#1D2128]/50">
                    <div className="text-[10px] text-[#848D9A]">Skills</div>
                    <div className="text-xs font-medium text-[#285FEA] mt-0.5">
                      {(resume.content?.skills || []).length} Verified
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#F1F3F5] dark:border-[#1D2128] flex items-center justify-between">
                <Link
                  href={`/app/resumes/${resume.id}`}
                  className="text-xs font-semibold text-[#285FEA] hover:underline inline-flex items-center gap-1"
                >
                  Open Editor &rarr;
                </Link>
                <div className="flex items-center gap-1.5">
                  <Link
                    href={`/app/match?resumeId=${resume.id}`}
                    className="px-2 py-1 text-xs rounded border border-[#E2E5E9] dark:border-[#252A33] hover:bg-[#F7F8FA] dark:hover:bg-[#1D2128] text-[#5A6270] dark:text-[#9EA7B4] transition-colors"
                  >
                    Match JD
                  </Link>
                  <button
                    onClick={() => handleArchiveResume(resume.id)}
                    className="p-1 rounded text-[#848D9A] hover:text-[#DC2626] transition-colors"
                    title="Archive resume"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Create from Scratch */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <Card className="w-full max-w-md shadow-lg bg-white dark:bg-[#14171C]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-base">Create New Resume</CardTitle>
                <CardDescription>Start with a structured single-column ATS profile.</CardDescription>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-[#848D9A] hover:text-[#1A1D23] dark:hover:text-[#F0F2F5]"
              >
                <X className="w-4 h-4" />
              </button>
            </CardHeader>
            <form onSubmit={handleCreateFromScratch}>
              <CardContent className="space-y-3 pt-2">
                <Input
                  id="create-resume-name"
                  label="Resume Title"
                  placeholder="e.g. Senior Backend Engineer"
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
              <div className="p-3.5 border-t border-[#F1F3F5] dark:border-[#1D2128] flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCreateModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <Card className="w-full max-w-lg shadow-lg bg-white dark:bg-[#14171C]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-base">Import Resume Document</CardTitle>
                <CardDescription>
                  Upload your existing PDF or DOCX file to extract verified career facts.
                </CardDescription>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="text-[#848D9A] hover:text-[#1A1D23] dark:hover:text-[#F0F2F5]"
              >
                <X className="w-4 h-4" />
              </button>
            </CardHeader>

            <CardContent className="space-y-3 pt-2">
              {uploadError && (
                <Alert variant="destructive">{uploadError}</Alert>
              )}

              {!parsedDraft ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="p-8 border border-dashed border-[#CBD0D7] dark:border-[#333945] hover:border-[#285FEA] rounded-lg flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-[#F7F8FA] dark:bg-[#1D2128]/40"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                  <div className="w-9 h-9 rounded-full bg-white dark:bg-[#14171C] text-[#285FEA] border border-[#E2E5E9] dark:border-[#252A33] flex items-center justify-center mb-2 shadow-2xs">
                    <Upload className="w-4 h-4" />
                  </div>
                  <p className="text-xs font-semibold text-[#1A1D23] dark:text-[#F0F2F5]">
                    {uploadFile ? uploadFile.name : 'Select or drag a PDF / DOCX file'}
                  </p>
                  <p className="text-[11px] text-[#848D9A] mt-0.5">
                    Up to 10MB · Plain text extraction preserves verified facts
                  </p>
                  {isUploading && (
                    <div className="mt-3 flex items-center gap-1.5 text-xs text-[#285FEA] font-medium animate-pulse">
                      <Clock className="w-3.5 h-3.5 animate-spin" />
                      Parsing career history with AI extraction engine...
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-2.5 rounded-md bg-[#ECFDF5] dark:bg-[#064E3B]/30 border border-[#A7F3D0]/60 dark:border-[#047857]/40 text-xs text-[#065F46] dark:text-[#A7F3D0] flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#059669] shrink-0" />
                    <span>
                      Successfully extracted {(parsedDraft.experience || []).length} positions and {(parsedDraft.skills || []).length} verified skills.
                    </span>
                  </div>

                  <Input
                    id="import-resume-name"
                    label="Resume Title"
                    value={importedResumeName}
                    onChange={(e) => setImportedResumeName(e.target.value)}
                    required
                  />

                  <div className="p-2.5 rounded-md border border-[#E2E5E9] dark:border-[#252A33] text-xs space-y-1.5 bg-[#F7F8FA] dark:bg-[#1D2128]/50">
                    <div>
                      <span className="font-semibold text-[#5A6270] dark:text-[#9EA7B4]">Headline: </span>
                      <span className="text-[#1A1D23] dark:text-[#F0F2F5]">{parsedDraft.headline || 'None detected'}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-[#5A6270] dark:text-[#9EA7B4]">Extracted Skills: </span>
                      <span className="text-[#1A1D23] dark:text-[#F0F2F5]">
                        {(parsedDraft.skills || []).map((s) => s.name).slice(0, 8).join(', ')}
                        {(parsedDraft.skills || []).length > 8 ? '...' : ''}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>

            <div className="p-3.5 border-t border-[#F1F3F5] dark:border-[#1D2128] flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsUploadModalOpen(false)}
              >
                Cancel
              </Button>
              {parsedDraft && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleConfirmImport}
                  isLoading={isSubmitting}
                >
                  <FileCheck className="w-3.5 h-3.5 mr-1.5" />
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
