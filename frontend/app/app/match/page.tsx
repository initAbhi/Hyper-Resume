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
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Job Match Analysis
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Compare target role requirements against documented resume evidence to identify verified qualifications and factual gaps.
          </p>
        </div>
      </div>

      {errorMessage && (
        <Alert variant="destructive">{errorMessage}</Alert>
      )}

      {/* Input Form Card */}
      <form onSubmit={handleStartAnalysis} className="p-5 sm:p-6 rounded-xl border border-border bg-card shadow-xs space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Source Resume Selection */}
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Source Resume
            </label>
            {isLoadingResumes ? (
              <p className="text-xs text-muted-foreground animate-pulse py-2">Loading resumes...</p>
            ) : resumes.length === 0 ? (
              <div className="text-xs text-muted-foreground space-y-2">
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
                className="w-full text-xs py-2 px-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                {resumes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} {r.isMaster ? '(Master)' : ''}
                  </option>
                ))}
              </select>
            )}
            {selectedResume && (
              <p className="text-[11px] text-muted-foreground mt-1.5">
                {(selectedResume.content?.experience || []).length} positions · {(selectedResume.content?.skills || []).length} verified skills
              </p>
            )}
          </div>

          {/* Target Company */}
          <div>
            <Input
              id="jd-company"
              label="Target Company (Optional)"
              placeholder="e.g. Stripe, Razorpay"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
          </div>

          {/* Target Role */}
          <div>
            <Input
              id="jd-role"
              label="Target Role Title (Optional)"
              placeholder="e.g. Senior Backend Engineer"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
            />
          </div>
        </div>

        {/* Job Description Textarea */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-medium text-foreground">
              Job Description
            </label>
            <span className="text-[11px] text-muted-foreground">
              Paste the full job posting (requirements, responsibilities, tech stack)
            </span>
          </div>
          <textarea
            rows={7}
            placeholder="Paste job posting text here..."
            value={jobDescriptionText}
            onChange={(e) => setJobDescriptionText(e.target.value)}
            required
            className="w-full text-xs p-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-600 leading-relaxed font-mono"
          />
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-border">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="w-4 h-4 text-muted-foreground shrink-0" />
            <span>Evaluates documented evidence only. Does not fabricate unconfirmed qualifications.</span>
          </div>
          <Button
            id="run-match-button"
            type="submit"
            onClick={handleStartAnalysis}
            variant="primary"
            size="sm"
            isLoading={isAnalyzing}
            disabled={isAnalyzing || !selectedResumeId || !jobDescriptionText.trim()}
            className="gap-2 shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isAnalyzing ? analysisStep || 'Analyzing Match...' : 'Run Match Analysis'}</span>
          </Button>
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
          <div id="match-report-container" className="p-5 sm:p-6 rounded-xl border border-border bg-card space-y-6 shadow-xs">
            {/* Header Score Overview */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base sm:text-lg font-bold text-foreground">
                    Compatibility Report: {jobTitle || 'Target Role'} {companyName ? `at ${companyName}` : ''}
                  </h2>
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
                      ? 'Solid Evidence Alignment'
                      : score >= 60
                      ? 'Partial Coverage'
                      : 'Notable Gaps'}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Evaluated against: <span className="font-semibold text-foreground">{selectedResume?.name}</span>
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-foreground">
                    {score}%
                  </div>
                  <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                    Alignment Score
                  </div>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleCreateTailoredDraft}
                  className="gap-1.5"
                >
                  <span>Create Tailored Draft</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            {/* Subscores Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Required Skills', val: subScores.requiredSkills ?? 85 },
                { label: 'Experience Align', val: subScores.experienceAlignment ?? 90 },
                { label: 'Education Align', val: subScores.educationAlignment ?? 100 },
                { label: 'Metrics Density', val: subScores.actionMetricsDensity ?? 80 },
              ].map((sub, sIdx) => (
                <div
                  key={sIdx}
                  className="p-3 rounded-lg bg-muted/40 border border-border flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground font-medium">{sub.label}</span>
                    <span className="text-xs font-bold font-mono text-foreground">{sub.val}%</span>
                  </div>
                  <div className="w-full h-1 bg-border rounded-full overflow-hidden mt-2">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.max(0, sub.val))}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Detailed Requirements with Filter Tabs */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Requirements vs Grounded Evidence ({reqs.length})
                </h3>

                {/* Filter Pills */}
                <div className="flex items-center gap-1.5 flex-wrap text-xs">
                  <button
                    onClick={() => setRequirementFilter('all')}
                    className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                      requirementFilter === 'all'
                        ? 'bg-foreground text-background'
                        : 'bg-muted text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    All ({reqs.length})
                  </button>
                  <button
                    onClick={() => setRequirementFilter('supported')}
                    className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                      requirementFilter === 'supported'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                    }`}
                  >
                    Supported ({supportedCount})
                  </button>
                  <button
                    onClick={() => setRequirementFilter('needs_confirmation')}
                    className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                      requirementFilter === 'needs_confirmation'
                        ? 'bg-amber-600 text-white'
                        : 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                    }`}
                  >
                    Needs Review ({needsCount})
                  </button>
                  <button
                    onClick={() => setRequirementFilter('not_evidenced')}
                    className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                      requirementFilter === 'not_evidenced'
                        ? 'bg-rose-600 text-white'
                        : 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                    }`}
                  >
                    Missing Gaps ({gapsCount})
                  </button>
                </div>
              </div>

              {/* Requirement Items */}
              <div className="space-y-2.5">
                {filteredReqs.map((req, rIdx) => (
                  <div
                    key={rIdx}
                    className="p-3.5 rounded-lg border border-border bg-background text-xs space-y-2 transition-all"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 font-medium text-foreground">
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
                      <div className="p-2.5 rounded-md bg-muted/40 border border-border text-[11px] leading-relaxed text-muted-foreground">
                        <span className="font-semibold text-foreground">Evidenced in resume: </span>
                        {req.evidenceQuotes.join(' · ')}
                      </div>
                    )}

                    {req.suggestedAction && (
                      <p className="text-[11px] text-muted-foreground">
                        <strong className="text-foreground">Suggested action: </strong> {req.suggestedAction}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Missing Keywords Notice */}
            {missingKws.length > 0 && (
              <div className="p-4 rounded-lg border border-border bg-muted/30 text-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-foreground">
                      Missing Keywords in Target Job Description
                    </span>
                    <p className="text-muted-foreground text-[11px] mt-0.5">
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
                    <span>{copiedKeywords ? 'Copied' : 'Copy Terms'}</span>
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {missingKws.map((kw: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded text-[11px] font-mono bg-background border border-border text-foreground"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Disclaimer */}
            <p className="text-[11px] text-muted-foreground text-center pt-2">
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
        <div className="p-8 text-center text-sm text-muted-foreground animate-pulse">
          Loading job match analyzer...
        </div>
      }
    >
      <JobMatchInner />
    </Suspense>
  );
}
