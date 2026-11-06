'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SampleResume } from '@/data/sample-resumes';
import { apiClient, Resume } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import {
  X,
  Wand2,
  FileText,
  AlertCircle,
  Coins,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Loader2,
} from 'lucide-react';

interface SourceResumeSelectorModalProps {
  sampleResume: SampleResume | null;
  isOpen: boolean;
  onClose: () => void;
  onAdaptationStarted: (adaptationData: any) => void;
}

export function SourceResumeSelectorModal({
  sampleResume,
  isOpen,
  onClose,
  onAdaptationStarted,
}: SourceResumeSelectorModalProps) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedResumeId, setSelectedResumeId] = useState<string>('');
  const [targetRole, setTargetRole] = useState<string>('');
  const [isAdapting, setIsAdapting] = useState(false);
  const [adaptationStep, setAdaptationStep] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (sampleResume) {
      setTargetRole(sampleResume.role);
    }
  }, [sampleResume]);

  useEffect(() => {
    if (!isOpen) return;

    if (!isAuthenticated) {
      return;
    }

    const fetchUserResumes = async () => {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const list = await apiClient.listResumes({ limit: 50 });
        setResumes(list);
        if (list.length > 0 && !selectedResumeId) {
          // Default select the master or most recently updated resume
          const master = list.find((r) => r.isMaster) || list[0];
          setSelectedResumeId(master.id);
        }
      } catch (err: any) {
        setErrorMessage(err?.message || 'Failed to load your resumes.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserResumes();
  }, [isOpen, isAuthenticated]);

  if (!isOpen || !sampleResume) return null;

  const handleStartAdaptation = async () => {
    if (!selectedResumeId) {
      setErrorMessage('Please select a source resume from your library.');
      return;
    }

    setIsAdapting(true);
    setErrorMessage(null);

    // Multi-step loading narrative
    setAdaptationStep('Retrieving source career facts...');
    const stepTimer1 = setTimeout(() => {
      setAdaptationStep('Aligning executive structure to benchmark...');
    }, 1200);

    const stepTimer2 = setTimeout(() => {
      setAdaptationStep('Running server-side factual integrity assertions...');
    }, 2800);

    try {
      // Genuine UUID v4 generated on client
      const idempotencyKey = crypto.randomUUID();

      const adaptation = await apiClient.adaptResume({
        sourceResumeId: selectedResumeId,
        sampleId: sampleResume.id,
        idempotencyKey,
        targetRole: targetRole.trim() || sampleResume.role,
        sampleBenchmarkData: {
          contact: { fullName: sampleResume.candidate.name, email: sampleResume.candidate.email },
          headline: sampleResume.role,
          summary: sampleResume.summary,
          skills: sampleResume.skills.flatMap((c) =>
            c.skills.map((s) => ({ name: s, category: c.category }))
          ),
          experience: sampleResume.experience.map((e) => ({
            company: e.company,
            title: e.title,
            location: e.location,
            startDate: e.startDate,
            endDate: e.endDate,
            current: !!e.current,
            bullets: e.bullets,
          })),
          education: sampleResume.education.map((edu) => ({
            school: edu.school,
            degree: edu.degree,
            field: edu.field || edu.degree,
            graduationDate: edu.graduationDate,
          })),
        },
      });

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      onAdaptationStarted(adaptation);
    } catch (err: any) {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      setErrorMessage(
        err?.message || 'Adaptation failed. Your credits were not deducted. Please retry.'
      );
      setIsAdapting(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5"
    >
      <div
        className="relative w-full max-w-xl bg-white dark:bg-[#14171C] border border-[#E2E5E9] dark:border-[#252A33] rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-[#E2E5E9] dark:border-[#252A33] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#285FEA]/10 text-[#285FEA] dark:text-[#60A5FA] flex items-center justify-center font-bold">
              <Wand2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1A1D23] dark:text-[#F0F2F5]">
                Adapt With My Profile
              </h3>
              <p className="text-xs text-[#5A6270] dark:text-[#9EA7B4]">
                Benchmark Target: <span className="font-semibold text-zinc-900 dark:text-zinc-100">{sampleResume.role}</span> ({sampleResume.company})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isAdapting}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-5">
          {!isAuthenticated ? (
            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800 text-amber-900 dark:text-amber-200 space-y-3">
              <div className="flex items-center gap-2 font-semibold text-sm">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span>Account Required</span>
              </div>
              <p className="text-xs leading-relaxed">
                To adapt an existing resume to this benchmark sample, please sign in or create an account. Your original resume remains 100% untouched.
              </p>
              <button
                type="button"
                onClick={() => router.push(`/login?redirect=/app/samples`)}
                className="w-full py-2.5 rounded-lg bg-[#285FEA] text-white text-xs font-bold hover:bg-[#1E4BC8] transition-all"
              >
                Sign In to Adapt
              </button>
            </div>
          ) : (
            <>
              {/* Credit & Security Notice */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-800/40 text-xs">
                <div className="flex items-center gap-2 text-blue-900 dark:text-blue-200">
                  <Coins className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span>Cost: <strong>3 Credits</strong> (Full Profile Adaptation)</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-medium">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Source Preserved</span>
                </div>
              </div>

              {/* Target Role Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Target Role Title
                </label>
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g. Staff Distributed Systems Engineer"
                  disabled={isAdapting}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-[#E2E5E9] dark:border-[#252A33] bg-white dark:bg-[#1A1D23] text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#285FEA]"
                />
              </div>

              {/* Source Resume Selection */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    Select Source Resume (Factual Source)
                  </label>
                  <span className="text-[11px] text-zinc-500">
                    {resumes.length} {resumes.length === 1 ? 'resume' : 'resumes'} found
                  </span>
                </div>

                {isLoading ? (
                  <div className="py-8 text-center text-xs text-zinc-500 flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-[#285FEA]" />
                    <span>Loading your resumes...</span>
                  </div>
                ) : resumes.length === 0 ? (
                  <div className="p-4 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 text-center space-y-2">
                    <FileText className="w-8 h-8 text-zinc-400 mx-auto" />
                    <p className="text-xs text-zinc-600 dark:text-zinc-400">
                      You don't have any existing resumes to adapt yet.
                    </p>
                    <button
                      type="button"
                      onClick={() => router.push('/app/resumes/new')}
                      className="px-3 py-1.5 text-xs font-bold rounded-lg bg-[#285FEA] text-white hover:bg-[#1E4BC8]"
                    >
                      Create Source Resume
                    </button>
                  </div>
                ) : (
                  <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                    {resumes.map((resume) => {
                      const isSelected = selectedResumeId === resume.id;
                      const expCount = resume.content?.experience?.length || 0;
                      const skillsCount = resume.content?.skills?.length || 0;

                      return (
                        <div
                          key={resume.id}
                          onClick={() => !isAdapting && setSelectedResumeId(resume.id)}
                          className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                            isSelected
                              ? 'border-[#285FEA] bg-[#285FEA]/5 dark:bg-[#285FEA]/10 shadow-xs'
                              : 'border-[#E2E5E9] dark:border-[#252A33] hover:border-zinc-400 dark:hover:border-zinc-600'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                isSelected
                                  ? 'border-[#285FEA] bg-[#285FEA]'
                                  : 'border-zinc-300 dark:border-zinc-600'
                              }`}
                            >
                              {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                                  {resume.name}
                                </span>
                                {resume.isMaster && (
                                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200">
                                    Master
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-zinc-500 mt-0.5">
                                {expCount} positions &bull; {skillsCount} skills
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Error Alert */}
              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Progress State during adaptation */}
              {isAdapting && (
                <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                    <Loader2 className="w-4 h-4 animate-spin text-[#285FEA]" />
                    <span>{adaptationStep || 'Synthesizing adaptation...'}</span>
                  </div>
                  <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#285FEA] h-full rounded-full animate-pulse w-3/4" />
                  </div>
                  <p className="text-[10px] text-zinc-500">
                    Locking factual dates, titles, and institutions while applying benchmark phrasing formulas.
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        {isAuthenticated && (
          <div className="px-5 py-3.5 bg-zinc-50/80 dark:bg-zinc-900/60 border-t border-[#E2E5E9] dark:border-[#252A33] flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              disabled={isAdapting}
              className="px-3 py-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleStartAdaptation}
              disabled={isAdapting || isLoading || resumes.length === 0}
              className="px-4 py-2 rounded-xl bg-[#285FEA] hover:bg-[#1E4BC8] text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isAdapting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Adapting Profile...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Start AI Adaptation (3 Credits)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
