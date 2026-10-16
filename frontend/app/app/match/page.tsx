'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert } from '@/components/ui/alert';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ShieldCheck,
  ChevronRight,
  Copy,
  Check,
  FileCheck,
} from 'lucide-react';
import {
  apiClient,
  Resume,
  JobMatch,
} from '@/lib/api-client';

function JobMatchInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedResumeId = searchParams.get('resumeId');

  // Input State
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string>(preselectedResumeId || '');
  const [companyName, setCompanyName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescriptionText, setJobDescriptionText] = useState('');

  // Workflow State
  const [isLoadingResumes, setIsLoadingResumes] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [completedMatch, setCompletedMatch] = useState<JobMatch | null>(null);
  const [requirementFilter, setRequirementFilter] = useState<'all' | 'supported' | 'needs_confirmation' | 'not_evidenced'>('all');
  const [copiedKeywords, setCopiedKeywords] = useState(false);

  // Load existing resumes on mount
  useEffect(() => {
    let isMounted = true;
    async function loadUserResumes() {
      try {
        const data = await apiClient.listResumes();
        if (!isMounted) return;
        setResumes(data);
        if (data.length > 0 && !selectedResumeId) {
          const preselected = data.find((r) => r.id === preselectedResumeId);
          setSelectedResumeId(preselected ? preselected.id : data[0].id);
        }
      } catch {
        // Ignore initial load failure
      } finally {
        if (isMounted) setIsLoadingResumes(false);
      }
    }

    loadUserResumes();
    return () => {
      isMounted = false;
    };
  }, [preselectedResumeId, selectedResumeId]);

  const handleStartAnalysis = async (e?: React.FormEvent | React.MouseEvent) => {
    e?.preventDefault();
    if (!selectedResumeId) {
      setErrorMessage('Please select a resume profile from your workspace.');
      return;
    }
    if (!jobDescriptionText.trim() || jobDescriptionText.trim().length < 40) {
      setErrorMessage('Please provide a meaningful job description (at least 40 characters).');
      return;
    }

    setErrorMessage(null);
    setIsAnalyzing(true);
    setCompletedMatch(null);

    try {
      setAnalysisStep('Parsing target job requirements...');
      const jd = await apiClient.createJobDescription({
        title: jobTitle.trim() || 'Target Role',
        companyName: companyName.trim() || undefined,
        originalText: jobDescriptionText.trim(),
      });

      setAnalysisStep('Evaluating resume evidence & computing alignment...');
      const match = await apiClient.createJobMatch({
        resumeId: selectedResumeId,
        jobDescriptionId: jd.id,
      });

      setCompletedMatch(match);
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Match analysis failed. Please try again.',
      );
    } finally {
      setIsAnalyzing(false);
      setAnalysisStep('');
    }
  };

  const handleCreateTailoredDraft = async () => {
    if (!completedMatch) return;
    try {
      const selectedResume = resumes.find((r) => r.id === completedMatch.resumeId);
      if (!selectedResume) return;

      const tailoredName = `${jobTitle.trim() || 'Tailored'} (${companyName.trim() || 'Targeted'})`;
      const newResume = await apiClient.createResume({
        name: tailoredName,
        targetRole: jobTitle.trim() || undefined,
        targetCompany: companyName.trim() || undefined,
        templateKey: selectedResume.templateKey,
        content: selectedResume.content,
      });

      router.push(`/app/resumes/${newResume.id}`);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to create tailored draft');
    }
  };

  const selectedResume = resumes.find((r) => r.id === selectedResumeId);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="pb-6 border-b border-zinc-200 dark:border-zinc-800">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Job Match & Grounded Gap Analyzer
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          Compare any job description against your resume to identify verified claims, missing requirements, and evidence citations without inventing experience.
        </p>
      </div>

      {/* Grounded Truth Banner */}
      <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/60 dark:bg-blue-950/30 dark:border-blue-900 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm">
          <span className="font-semibold text-blue-950 dark:text-blue-200">
            Evidence-Based Compatibility Engine:{' '}
          </span>
          <span className="text-blue-900/90 dark:text-blue-300">
            HyperResume accurately validates your experience against target role requirements. Unverified skills or missing qualifications are flagged transparently for your review.
          </span>
        </div>
      </div>

      {errorMessage && (
        <Alert variant="destructive">{errorMessage}</Alert>
      )}

      {/* Input Stage: Resume Selector & JD Input */}
      <form onSubmit={handleStartAnalysis} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Step 1: Select Resume (4 cols) */}
        <div className="lg:col-span-4 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
              Step 1
            </span>
            <span className="text-xs text-zinc-500">Source Profile</span>
          </div>

          <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            Select Resume to Analyze
          </h2>

          {isLoadingResumes ? (
            <p className="text-xs text-zinc-500 animate-pulse">Loading resumes...</p>
          ) : resumes.length === 0 ? (
            <div className="text-xs text-zinc-500 space-y-2">
              <p>No resumes found in your workspace.</p>
              <Link href="/app/resumes">
                <Button variant="outline" size="sm" className="w-full text-xs">
                  Create Resume First
                </Button>
              </Link>
            </div>
          ) : (
            <select
              value={selectedResumeId}
              onChange={(e) => setSelectedResumeId(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              {resumes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} {r.isMaster ? '(Master Profile)' : ''}
                </option>
              ))}
            </select>
          )}

          {selectedResume && (
            <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 text-xs space-y-1 text-zinc-600 dark:text-zinc-400">
              <div>
                <strong>Positions:</strong> {(selectedResume.content?.experience || []).length} recorded
              </div>
              <div>
                <strong>Verified Skills:</strong> {(selectedResume.content?.skills || []).length} tags
              </div>
            </div>
          )}
        </div>

        {/* Step 2: Paste Job Description (8 cols) */}
        <div className="lg:col-span-8 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
              Step 2
            </span>
            <span className="text-xs text-zinc-500">Target Role & Requirements</span>
          </div>

          <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            Target Job Description
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              id="jd-company"
              label="Company Name (Optional)"
              placeholder="e.g. Stripe, Razorpay, Google"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
            <Input
              id="jd-role"
              label="Job Title (Optional)"
              placeholder="e.g. Staff Backend Infrastructure Engineer"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Job Description Text
            </label>
            <textarea
              rows={6}
              placeholder="Paste target job description or requirements here..."
              value={jobDescriptionText}
              onChange={(e) => setJobDescriptionText(e.target.value)}
              required
              className="w-full text-xs p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-600 leading-relaxed font-mono"
            />
          </div>

          <div className="flex justify-end pt-1">
            <Button
              id="run-match-button"
              type="submit"
              onClick={handleStartAnalysis}
              variant="primary"
              size="sm"
              isLoading={isAnalyzing}
              disabled={isAnalyzing || !selectedResumeId || !jobDescriptionText.trim()}
              className="gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isAnalyzing ? analysisStep || 'Analyzing Match...' : 'Run Match Analysis'}</span>
            </Button>
          </div>
        </div>
      </form>

      {/* Completed Match Report */}
      {completedMatch && (() => {
        const analysis = completedMatch.analysis || (completedMatch as any);
        const reqs = analysis.matchedRequirements || (completedMatch as any).requirementsAnalysis || [];
        const score = typeof completedMatch.score === 'number' ? completedMatch.score : Number((completedMatch as any).overallScore || 0);
        const supportedCount = reqs.filter((r: any) => r.status === 'supported').length;
        const needsCount = reqs.filter((r: any) => r.status === 'needs_confirmation').length;
        const gapsCount = reqs.filter((r: any) => r.status === 'not_evidenced').length;

        const filteredReqs = reqs.filter((r: any) => {
          if (requirementFilter === 'supported') return r.status === 'supported';
          if (requirementFilter === 'needs_confirmation') return r.status === 'needs_confirmation';
          if (requirementFilter === 'not_evidenced') return r.status === 'not_evidenced';
          return true;
        });

        const scoreColor =
          score >= 80
            ? 'text-emerald-600 dark:text-emerald-400'
            : score >= 60
            ? 'text-amber-600 dark:text-amber-400'
            : 'text-rose-600 dark:text-rose-400';

        const missingKws =
          analysis.missingKeywords ||
          (reqs as any[])
            .filter((r: any) => r.status === 'not_evidenced' || r.status === 'needs_confirmation')
            .flatMap((r: any) => r.keywords || (r.text ? [r.text] : []))
            .filter(Boolean);

        const handleCopyKeywords = () => {
          if (missingKws.length === 0) return;
          navigator.clipboard.writeText(missingKws.join(', '));
          setCopiedKeywords(true);
          setTimeout(() => setCopiedKeywords(false), 2000);
        };

        const subScores = analysis.subScores || {
          requiredSkills: (completedMatch as any).scoreComponents?.requiredSkillsScore ?? 85,
          experienceAlignment: (completedMatch as any).scoreComponents?.experienceScore ?? 88,
          educationAlignment: (completedMatch as any).scoreComponents?.responsibilityScore ?? 90,
          actionMetricsDensity: (completedMatch as any).scoreComponents?.formattingScore ?? 80,
        };

        return (
          <div id="match-report-container" className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-6 shadow-sm">
            {/* Header Score Overview */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    Match Report: {jobTitle || 'Target Role'} {companyName ? `at ${companyName}` : ''}
                  </h3>
                  <Badge
                    variant={
                      score >= 80
                        ? 'success'
                        : score >= 60
                        ? 'neutral'
                        : 'destructive'
                    }
                  >
                    {score >= 80
                      ? 'Strong Alignment'
                      : score >= 60
                      ? 'Tailoring Advised'
                      : 'Significant Gaps'}
                  </Badge>
                </div>
                <p className="text-xs text-zinc-500 mt-1">
                  Evaluated against: <span className="font-semibold text-zinc-700 dark:text-zinc-300">{selectedResume?.name}</span>
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className={`text-3xl font-black ${scoreColor}`}>
                    {score}%
                  </div>
                  <div className="text-[10px] text-zinc-400 uppercase font-semibold">
                    Overall Compatibility
                  </div>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleCreateTailoredDraft}
                  className="gap-1.5 shadow-sm"
                >
                  <span>Create Tailored Draft</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Subscores Grid with Mini Progress Bars */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                {
                  label: 'Required Skills',
                  val: subScores.requiredSkills ?? 85,
                  color: 'bg-blue-600',
                },
                {
                  label: 'Experience Align',
                  val: subScores.experienceAlignment ?? 90,
                  color: 'bg-emerald-600',
                },
                {
                  label: 'Education Align',
                  val: subScores.educationAlignment ?? 100,
                  color: 'bg-indigo-600',
                },
                {
                  label: 'Metrics Density',
                  val: subScores.actionMetricsDensity ?? 80,
                  color: 'bg-amber-600',
                },
              ].map((sub, sIdx) => (
                <div
                  key={sIdx}
                  className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-zinc-500 font-medium">{sub.label}</span>
                    <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{sub.val}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden mt-2">
                    <div
                      className={`h-full ${sub.color} rounded-full transition-all duration-500`}
                      style={{ width: `${Math.min(100, Math.max(0, sub.val))}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Detailed Requirements with Filter Tabs */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                  Requirements vs Grounded Evidence ({reqs.length})
                </h4>

                {/* Filter Pills */}
                <div className="flex items-center gap-1.5 flex-wrap text-xs">
                  <button
                    onClick={() => setRequirementFilter('all')}
                    className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                      requirementFilter === 'all'
                        ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200'
                    }`}
                  >
                    All ({reqs.length})
                  </button>
                  <button
                    onClick={() => setRequirementFilter('supported')}
                    className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                      requirementFilter === 'supported'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100'
                    }`}
                  >
                    Supported ({supportedCount})
                  </button>
                  <button
                    onClick={() => setRequirementFilter('needs_confirmation')}
                    className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                      requirementFilter === 'needs_confirmation'
                        ? 'bg-amber-600 text-white'
                        : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 hover:bg-amber-100'
                    }`}
                  >
                    Needs Review ({needsCount})
                  </button>
                  <button
                    onClick={() => setRequirementFilter('not_evidenced')}
                    className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                      requirementFilter === 'not_evidenced'
                        ? 'bg-rose-600 text-white'
                        : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 hover:bg-rose-100'
                    }`}
                  >
                    Missing Gaps ({gapsCount})
                  </button>
                </div>
              </div>

              {/* Requirement Items */}
              <div className="space-y-3">
                {filteredReqs.map((req, rIdx) => (
                  <div
                    key={rIdx}
                    className={`p-4 rounded-xl border text-xs space-y-2 transition-all ${
                      req.status === 'supported'
                        ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60 text-emerald-950 dark:text-emerald-200'
                        : req.status === 'needs_confirmation'
                        ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/60 text-amber-950 dark:text-amber-200'
                        : 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/60 text-rose-950 dark:text-rose-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 font-bold text-sm">
                        {req.status === 'supported' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                        {req.status === 'needs_confirmation' && <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />}
                        {req.status === 'not_evidenced' && <XCircle className="w-4 h-4 text-rose-600 shrink-0" />}
                        <span>{req.explanation || req.requirementId}</span>
                      </div>
                      <Badge
                        variant={
                          req.status === 'supported'
                            ? 'success'
                            : req.status === 'needs_confirmation'
                            ? 'neutral'
                            : 'destructive'
                        }
                      >
                        {req.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>

                    {req.evidenceQuotes && req.evidenceQuotes.length > 0 && (
                      <div className="p-2.5 rounded-lg bg-white/80 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 text-[11px] font-mono leading-relaxed">
                        <span className="font-bold text-zinc-700 dark:text-zinc-300">Evidenced in resume: </span>
                        {req.evidenceQuotes.join(' · ')}
                      </div>
                    )}

                    {req.suggestedAction && (
                      <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
                        <strong>Suggested action: </strong> {req.suggestedAction}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Missing Keywords Notice */}
            {missingKws.length > 0 && (
              <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 text-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-zinc-800 dark:text-zinc-200">
                      Missing Keywords Detected in Target Job Description
                    </span>
                    <p className="text-zinc-500 text-[11px] mt-0.5">
                      These terms appear in the job specification but were not found in your resume. Only add them if you have genuine experience.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyKeywords}
                    className="gap-1.5 text-xs shrink-0"
                  >
                    {copiedKeywords ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKeywords ? 'Copied!' : 'Copy Keywords'}</span>
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {missingKws.map((kw: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-md text-[11px] font-mono bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 shadow-2xs"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Disclaimer */}
            <p className="text-[11px] text-zinc-400 text-center pt-2">
              Disclaimer: The compatibility score is an internal heuristic indicator comparing documented evidence against role requirements. It is not an algorithmic guarantee of interview invitation or automated ATS filter passage.
            </p>
          </div>
        );
      })()}
    </div>
  );
}

export default function AppJobMatchPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-sm text-zinc-500 animate-pulse">
          Loading job match analyzer...
        </div>
      }
    >
      <JobMatchInner />
    </Suspense>
  );
}
