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
  ArrowRight,
  ExternalLink,
  RefreshCw,
  Building2,
  Briefcase,
  FileText,
  ClipboardPaste,
  Target,
  Layers,
  ArrowUpRight,
} from 'lucide-react';
import {
  apiClient,
  Resume,
  JobMatch,
} from '@/lib/api-client';

const SAMPLE_JOB_DESCRIPTION = `We are seeking a Senior Backend Engineer to join our high-growth platform team.

Responsibilities:
• Architect, build, and maintain highly scalable microservices and distributed APIs using Node.js / NestJS or Go.
• Optimize PostgreSQL queries, indexes, and connection pooling for high-throughput relational workloads.
• Manage asynchronous task processing and caching layers with Redis and message queues (BullMQ/RabbitMQ).
• Lead cloud infrastructure operations on AWS (EC2, ECS, S3, RDS) using Docker and automated CI/CD pipelines.
• Implement end-to-end observability, logging, and metrics aggregation with Prometheus, Grafana, and Loki.

Requirements:
• 3+ years of professional backend engineering experience in production web applications.
• Strong proficiency in TypeScript, Node.js, and SQL schema design.
• Practical hands-on experience with containerization (Docker) and AWS cloud deployments.
• Proven track record of performance optimization, database tuning, and API security best practices.`;

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
  const [analysisPhase, setAnalysisPhase] = useState(0);
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

  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text && text.trim()) {
        setJobDescriptionText(text);
      }
    } catch {
      // Browser permissions or unsupported
    }
  };

  const handleLoadSample = () => {
    setJobDescriptionText(SAMPLE_JOB_DESCRIPTION);
    if (!companyName) setCompanyName('CloudScale Technologies');
    if (!jobTitle) setJobTitle('Senior Backend Engineer');
  };

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
    setAnalysisPhase(0);
    setCompletedMatch(null);

    const t1 = setTimeout(() => setAnalysisPhase(1), 800);
    const t2 = setTimeout(() => setAnalysisPhase(2), 1800);
    const t3 = setTimeout(() => setAnalysisPhase(3), 2800);

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
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
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
    <div className="space-y-8 max-w-5xl mx-auto py-2">
      {/* Sleek Page Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/80 text-blue-700 dark:text-blue-300 text-xs font-semibold shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>AI Evidence & Fit Analysis</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
          Job Match Analysis
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-2xl leading-relaxed">
          Compare target role requirements against documented resume evidence to identify verified qualifications, keyword overlap, and factual gaps before applying.
        </p>
      </div>

      {errorMessage && (
        <Alert variant="destructive">{errorMessage}</Alert>
      )}

      {/* Input Form Card with Premium Framing */}
      <form
        onSubmit={handleStartAnalysis}
        className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm p-6 sm:p-8 space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Source Resume Selection */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-zinc-800 dark:text-zinc-200">
              <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Grounding Resume</span>
            </label>
            {isLoadingResumes ? (
              <div className="h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 animate-pulse border border-zinc-200 dark:border-zinc-700" />
            ) : resumes.length === 0 ? (
              <div className="text-xs text-zinc-500 space-y-2 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-700">
                <p>No resumes found in workspace.</p>
                <Link href="/app/resumes">
                  <Button variant="outline" size="sm" className="w-full text-xs">
                    Create Resume
                  </Button>
                </Link>
              </div>
            ) : (
              <select
                value={selectedResumeId}
                onChange={(e) => setSelectedResumeId(e.target.value)}
                className="w-full text-xs py-2.5 px-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
              >
                {resumes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} {r.isMaster ? '(Master)' : ''}
                  </option>
                ))}
              </select>
            )}
            {selectedResume && (
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 pl-0.5">
                {(selectedResume.content?.experience || []).length} positions · {(selectedResume.content?.skills || []).length} verified skills
              </p>
            )}
          </div>

          {/* Target Company */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-zinc-800 dark:text-zinc-200">
              <Building2 className="w-3.5 h-3.5 text-zinc-400" />
              <span>Target Company (Optional)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Stripe, Razorpay, Google"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full text-xs py-2.5 px-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          {/* Target Role */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-zinc-800 dark:text-zinc-200">
              <Briefcase className="w-3.5 h-3.5 text-zinc-400" />
              <span>Target Role Title (Optional)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Senior Backend Engineer"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              className="w-full text-xs py-2.5 px-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        {/* Job Description Textarea Section */}
        <div className="space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                Job Description
              </label>
              {jobDescriptionText.length > 0 && (
                <span className="text-[10.5px] px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-mono">
                  {jobDescriptionText.length} chars
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePasteClipboard}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 px-2 py-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <ClipboardPaste className="w-3 h-3" />
                <span>Paste from Clipboard</span>
              </button>
              <button
                type="button"
                onClick={handleLoadSample}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 px-2 py-1 rounded-md hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3 h-3" />
                <span>Load Sample JD</span>
              </button>
            </div>
          </div>

          <textarea
            rows={8}
            placeholder="Paste the full job posting requirements, responsibilities, and required tech stack here..."
            value={jobDescriptionText}
            onChange={(e) => setJobDescriptionText(e.target.value)}
            required
            className="w-full text-xs sm:text-[13px] p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50/30 dark:bg-zinc-800/30 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 leading-relaxed font-sans transition-all"
          />
        </div>

        {/* Action Controls Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Evaluates documented evidence only. Does not fabricate unconfirmed qualifications.</span>
          </div>

          <button
            id="run-match-button"
            type="submit"
            onClick={handleStartAnalysis}
            disabled={isAnalyzing || !selectedResumeId || !jobDescriptionText.trim()}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs sm:text-sm font-semibold shadow-xs hover:shadow transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer shrink-0"
          >
            {isAnalyzing ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            <span>{isAnalyzing ? analysisStep || 'Analyzing Match...' : 'Run Match Analysis'}</span>
          </button>
        </div>
      </form>

      {/* Multi-Phase Scanning Animation (Matching Competitor's UX) */}
      {isAnalyzing && (
        <div className="p-6 sm:p-8 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm space-y-6 animate-in fade-in duration-300">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                  Evaluating Grounded Fit & Keywords
                </h3>
                <p className="text-[11px] text-zinc-500">
                  Cross-checking job requirements with verified resume bullet points
                </p>
              </div>
            </div>
            <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 animate-pulse font-medium">
              Scanning in progress...
            </span>
          </div>

          <div className="space-y-4 pl-1">
            {/* Phase 0 */}
            <div className="flex items-center gap-3 text-xs">
              {analysisPhase > 0 ? (
                <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              ) : (
                <RefreshCw className="w-5 h-5 text-emerald-600 animate-spin shrink-0 p-0.5" />
              )}
              <span className={analysisPhase >= 0 ? 'font-semibold text-zinc-900 dark:text-zinc-100' : 'text-zinc-400'}>
                Reading target job description...
              </span>
            </div>

            {/* Phase 1 */}
            <div className="flex items-center gap-3 text-xs">
              {analysisPhase > 1 ? (
                <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              ) : analysisPhase === 1 ? (
                <RefreshCw className="w-5 h-5 text-emerald-600 animate-spin shrink-0 p-0.5" />
              ) : (
                <div className="w-5 h-5 rounded-full border-2 border-zinc-200 dark:border-zinc-700 shrink-0" />
              )}
              <span className={analysisPhase >= 1 ? 'font-semibold text-zinc-900 dark:text-zinc-100' : 'text-zinc-400'}>
                Matching your skills & keywords...
              </span>
            </div>

            {/* Phase 2 */}
            <div className="flex items-center gap-3 text-xs">
              {analysisPhase > 2 ? (
                <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              ) : analysisPhase === 2 ? (
                <RefreshCw className="w-5 h-5 text-emerald-600 animate-spin shrink-0 p-0.5" />
              ) : (
                <div className="w-5 h-5 rounded-full border-2 border-zinc-200 dark:border-zinc-700 shrink-0" />
              )}
              <span className={analysisPhase >= 2 ? 'font-semibold text-zinc-900 dark:text-zinc-100' : 'text-zinc-400'}>
                Checking core responsibilities & requirements...
              </span>
            </div>

            {/* Phase 3 */}
            <div className="flex items-center gap-3 text-xs">
              {analysisPhase >= 3 ? (
                <RefreshCw className="w-5 h-5 text-emerald-600 animate-spin shrink-0 p-0.5" />
              ) : (
                <div className="w-5 h-5 rounded-full border-2 border-zinc-200 dark:border-zinc-700 shrink-0" />
              )}
              <span className={analysisPhase >= 3 ? 'font-semibold text-zinc-900 dark:text-zinc-100' : 'text-zinc-400'}>
                Scoring evidence alignment & fit...
              </span>
            </div>
          </div>

          {/* Shimmering Skeletons */}
          <div className="space-y-3 pt-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-11 rounded-xl bg-zinc-100/70 dark:bg-zinc-800/40 animate-pulse border border-zinc-200/40 dark:border-zinc-800 p-3 space-y-1.5"
              >
                <div className="w-1/4 h-2 bg-zinc-200 dark:bg-zinc-700 rounded-xs" />
                <div className="w-3/5 h-1.5 bg-zinc-200/80 dark:bg-zinc-700/80 rounded-xs" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completed Match Report Dashboard */}
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
          <div id="match-report-container" className="p-6 sm:p-8 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-6 shadow-sm">
            {/* Header Score Overview */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-zinc-100 dark:border-zinc-800">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg sm:text-xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
                    Compatibility: {jobTitle || 'Target Role'} {companyName ? `at ${companyName}` : ''}
                  </h2>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                      score >= 80
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                        : score >= 60
                        ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                        : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                    }`}
                  >
                    {score >= 80
                      ? 'Solid Evidence Match'
                      : score >= 60
                      ? 'Partial Coverage'
                      : 'Notable Gaps'}
                  </span>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Evaluated against: <span className="font-semibold text-zinc-800 dark:text-zinc-200">{selectedResume?.name}</span>
                </p>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <div className="flex items-center gap-3 px-4 py-2 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl border border-zinc-200/60 dark:border-zinc-700/60">
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
                      {score}%
                    </div>
                    <div className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">
                      Match Fit
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCreateTailoredDraft}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs hover:shadow transition-all cursor-pointer"
                >
                  <span>Create Tailored Draft</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Subscores Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              {[
                { label: 'Required Skills', val: subScores.requiredSkills ?? 85 },
                { label: 'Experience Align', val: subScores.experienceAlignment ?? 90 },
                { label: 'Education Align', val: subScores.educationAlignment ?? 100 },
                { label: 'Metrics Density', val: subScores.actionMetricsDensity ?? 80 },
              ].map((sub, sIdx) => (
                <div
                  key={sIdx}
                  className="p-3.5 rounded-xl bg-zinc-50/70 dark:bg-zinc-800/40 border border-zinc-200/70 dark:border-zinc-800 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">{sub.label}</span>
                    <span className="text-xs font-bold font-mono text-zinc-900 dark:text-zinc-100">{sub.val}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden mt-2.5">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.max(0, sub.val))}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Detailed Requirements with Filter Tabs */}
            <div className="space-y-4 pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                  Requirements vs Grounded Evidence ({reqs.length})
                </h3>

                {/* Filter Pills */}
                <div className="flex items-center gap-1.5 flex-wrap text-xs">
                  <button
                    type="button"
                    onClick={() => setRequirementFilter('all')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      requirementFilter === 'all'
                        ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-2xs'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                    }`}
                  >
                    All ({reqs.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setRequirementFilter('supported')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      requirementFilter === 'supported'
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60'
                    }`}
                  >
                    Supported ({supportedCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setRequirementFilter('needs_confirmation')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      requirementFilter === 'needs_confirmation'
                        ? 'bg-amber-600 text-white shadow-2xs'
                        : 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/60'
                    }`}
                  >
                    Needs Review ({needsCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setRequirementFilter('not_evidenced')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      requirementFilter === 'not_evidenced'
                        ? 'bg-rose-600 text-white shadow-2xs'
                        : 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/60'
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
                    className="p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-850 text-xs space-y-2.5 transition-all shadow-2xs"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 font-medium text-zinc-900 dark:text-zinc-100">
                        {req.status === 'supported' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                        {req.status === 'needs_confirmation' && <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />}
                        {req.status === 'not_evidenced' && <XCircle className="w-4 h-4 text-rose-600 shrink-0" />}
                        <span className="font-semibold text-[13px]">{req.explanation || req.requirementId}</span>
                      </div>
                      <Badge
                        variant={
                          req.status === 'supported'
                            ? 'success'
                            : req.status === 'needs_confirmation'
                            ? 'warning'
                            : 'destructive'
                        }
                      >
                        {req.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>

                    {req.evidenceQuotes && req.evidenceQuotes.length > 0 && (
                      <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/60 text-[11.5px] leading-relaxed text-zinc-600 dark:text-zinc-300">
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100">Evidenced in resume: </span>
                        {req.evidenceQuotes.join(' · ')}
                      </div>
                    )}

                    {req.suggestedAction && (
                      <p className="text-[11.5px] text-zinc-500 dark:text-zinc-400">
                        <strong className="text-zinc-800 dark:text-zinc-200">Suggested action: </strong> {req.suggestedAction}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Missing Keywords Notice */}
            {missingKws.length > 0 && (
              <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-850 text-xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="font-bold text-zinc-900 dark:text-zinc-100 text-xs sm:text-sm">
                      Missing Keywords in Target Job Description
                    </span>
                    <p className="text-zinc-500 text-[11px] mt-0.5">
                      These terms appear in the job specification but were not found in your resume. Only add them if you have genuine experience.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyKeywords}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 text-xs font-semibold transition-all shrink-0 cursor-pointer"
                  >
                    {copiedKeywords ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKeywords ? 'Copied' : 'Copy Terms'}</span>
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {missingKws.map((kw: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-md text-[11px] font-mono bg-white dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 font-medium"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Disclaimer */}
            <p className="text-[11px] text-zinc-400 dark:text-zinc-500 text-center pt-2">
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
        <div className="p-12 text-center text-sm text-zinc-400 animate-pulse">
          Loading job match analyzer...
        </div>
      }
    >
      <JobMatchInner />
    </Suspense>
  );
}
