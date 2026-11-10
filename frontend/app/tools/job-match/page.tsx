'use client';

import React, { useId, useState } from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  apiClient,
  type JobMatchRequirementAnalysis,
  type PublicJobMatchResponse,
} from '@/lib/api-client';

const SAMPLE_RESUME = `Abhinav Sharma
abhinav@example.com | +91 98765 43210 | linkedin.com/in/abhinav-sharma

Senior Full Stack Engineer
Distributed systems engineer building production TypeScript, React, Next.js, Node.js, and PostgreSQL applications on AWS.

EXPERIENCE
CloudScale Payments — Senior Full Stack Engineer (2022-06 – Present)
• Architected event-driven NestJS and PostgreSQL microservices handling 25,000+ req/s at 99.98% uptime.
• Engineered Next.js 15 analytics portal using TypeScript and Redis, reducing p95 dashboard load latency by 42%.
• Automated Docker and GitHub Actions CI/CD deployments across AWS ECS clusters.

SKILLS
TypeScript, React, Next.js, Node.js, NestJS, PostgreSQL, Redis, Docker, AWS, GitHub Actions`;

const SAMPLE_JOB = `Senior Platform Engineer (Full Stack)
We are looking for a Senior Engineer to scale our financial ledger APIs and merchant dashboard.
Required Skills:
- 4+ years of production TypeScript, React, Next.js, Node.js, and PostgreSQL experience
- Proven microservices architecture and automated CI/CD pipelines (Docker, AWS)
Preferred Skills:
- Experience with Redis caching, Kubernetes orchestration, or GraphQL federation`;

function getScoreStrokeColor(score: number): string {
  if (score >= 80) return '#059669';
  if (score >= 55) return '#d97706';
  return '#dc2626';
}

export default function JobMatchToolPage() {
  const uid = useId();
  const [targetRole, setTargetRole] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [jobText, setJobText] = useState('');
  const [isMatching, setIsMatching] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [matchResult, setMatchResult] = useState<PublicJobMatchResponse | null>(null);

  const handleMatch = async () => {
    if (!resumeText.trim() || !jobText.trim()) return;
    setIsMatching(true);
    setErrorMessage(null);

    try {
      const response = await apiClient.analyzePublicJobMatch({
        resumeText: resumeText.trim(),
        jobDescriptionText: jobText.trim(),
        targetRole: targetRole.trim() || undefined,
      });
      setMatchResult(response);
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'Unable to run requirement compatibility analysis. Ensure both inputs contain at least 25 characters.',
      );
    } finally {
      setIsMatching(false);
    }
  };

  const supported = (matchResult?.requirementsAnalysis || []).filter(
    (r) => r.status === 'supported',
  );
  const needsConfirmation = (matchResult?.requirementsAnalysis || []).filter(
    (r) => r.status === 'needs_confirmation',
  );
  const notEvidenced = (matchResult?.requirementsAnalysis || []).filter(
    (r) => r.status === 'not_evidenced',
  );

  const breakdownRows = matchResult
    ? [
        {
          key: 'required',
          label: 'Required Skills Alignment',
          weight: '35%',
          score: matchResult.scoreComponents.requiredSkillsScore,
        },
        {
          key: 'experience',
          label: 'Experience Relevance',
          weight: '25%',
          score: matchResult.scoreComponents.experienceScore,
        },
        {
          key: 'preferred',
          label: 'Preferred Stack Bonus',
          weight: '15%',
          score: matchResult.scoreComponents.preferredSkillsScore,
        },
        {
          key: 'responsibility',
          label: 'Domain & Responsibility Fit',
          weight: '15%',
          score: matchResult.scoreComponents.responsibilityScore,
        },
        {
          key: 'formatting',
          label: 'Resume Formatting & Extractability',
          weight: '10%',
          score: matchResult.scoreComponents.formattingScore,
        },
      ]
    : [];

  const renderRequirementGroup = (
    title: string,
    icon: React.ReactNode,
    items: JobMatchRequirementAnalysis[],
    badgeVariant: 'success' | 'warning' | 'destructive',
    helperNote?: string,
  ) => {
    if (items.length === 0) return null;
    return (
      <div className="space-y-2.5">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
            {title} ({items.length})
          </span>
        </div>
        {helperNote && (
          <p className="text-xs text-zinc-500 dark:text-zinc-400">{helperNote}</p>
        )}
        <section className="hr-accordion space-y-2" aria-label={title}>
          {items.map((req, idx) => (
            <details
              key={req.requirementId || `${title}-${idx}`}
              className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/60 px-3.5 py-2.5"
            >
              <summary className="text-xs sm:text-sm font-medium text-zinc-900 dark:text-zinc-100 select-none justify-between gap-2">
                <span className="flex-1 text-left">
                  {req.text || req.explanation || 'Extracted job requirement'}
                </span>
                <Badge variant={badgeVariant} className="ml-auto shrink-0 text-[10px]">
                  {req.importance || 'standard'}
                </Badge>
              </summary>
              <div className="pt-2.5 space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
                <p>{req.explanation}</p>
                {Array.isArray(req.keywords) && req.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {req.keywords.map((kw) => (
                      <Badge key={kw} variant="neutral" className="text-[10.5px]">
                        {kw}
                      </Badge>
                    ))}
                  </div>
                )}
                {Array.isArray(req.evidenceQuotes) && req.evidenceQuotes.length > 0 && (
                  <div className="p-2 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/50 text-[11px] text-emerald-900 dark:text-emerald-200">
                    Evidence matched: &ldquo;{req.evidenceQuotes[0]}&rdquo;
                  </div>
                )}
              </div>
            </details>
          ))}
        </section>
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center max-w-3xl mx-auto mb-10">
        <Badge variant="info" className="mb-3">Free Tool</Badge>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
          Truthful Job-to-Resume Matcher
        </h1>
        <p className="mt-3 text-base sm:text-lg text-zinc-600 dark:text-zinc-400">
          Powered by live AI requirement parsing and 5-component scoring. Compare candidate evidence against job requirements without hallucinating skills.
        </p>
      </div>

      <div className="mb-5 max-w-md mx-auto">
        <label
          htmlFor={`${uid}-target-role`}
          className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5"
        >
          Target Role (Optional)
        </label>
        <input
          id={`${uid}-target-role`}
          type="text"
          value={targetRole}
          onChange={(e) => setTargetRole(e.target.value)}
          placeholder="e.g. Senior Backend Engineer"
          className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-base">1. Your Resume</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setResumeText(SAMPLE_RESUME)}
              className="text-xs"
            >
              Load Sample
            </Button>
          </CardHeader>
          <CardContent>
            <textarea
              rows={9}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-3 text-xs sm:text-sm font-mono text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-600 resize-y"
              placeholder="Paste your resume skills & experience (min 25 chars)..."
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-base">2. Target Job Description</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setJobText(SAMPLE_JOB)}
              className="text-xs"
            >
              Load Sample
            </Button>
          </CardHeader>
          <CardContent>
            <textarea
              rows={9}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-3 text-xs sm:text-sm font-mono text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-600 resize-y"
              placeholder="Paste the job description here (min 25 chars)..."
              value={jobText}
              onChange={(e) => setJobText(e.target.value)}
            />
          </CardContent>
        </Card>
      </div>

      {errorMessage && (
        <div
          role="alert"
          className="max-w-2xl mx-auto mb-6 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2"
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="flex justify-center mb-10">
        <Button
          size="lg"
          variant="primary"
          onClick={handleMatch}
          isLoading={isMatching}
          disabled={resumeText.trim().length < 25 || jobText.trim().length < 25}
          className="px-8 shadow-md"
        >
          <Sparkles className="w-5 h-5 mr-2" />
          Analyze Compatibility
        </Button>
      </div>

      {matchResult && (
        <Card className="border-blue-200 dark:border-blue-900 shadow-lg" data-testid="public-job-match-report">
          <CardHeader className="border-b border-zinc-100 dark:border-zinc-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <CardTitle className="text-xl">Evidence Compatibility Analysis</CardTitle>
                  <Badge variant="info" className="text-[10.5px]">
                    {matchResult.parsedRequirementsCount} Extracted Requirements
                  </Badge>
                </div>
                <CardDescription>
                  5-component backend match breakdown using truthful evidence verification.
                </CardDescription>
              </div>

              <div className="hr-progress-ring-wrapper shrink-0">
                <progress
                  value={matchResult.overallScore}
                  max={100}
                  aria-label="Job Compatibility Score"
                  aria-valuetext={`${matchResult.overallScore} percent match`}
                  className="hr-progress-ring"
                  style={
                    {
                      '--value': matchResult.overallScore,
                      '--size': '84px',
                      '--thickness': '8px',
                      '--fill-color': getScoreStrokeColor(matchResult.overallScore),
                    } as React.CSSProperties
                  }
                />
                <div className="hr-progress-ring-content" aria-hidden="true">
                  <span className="text-xl font-black text-zinc-900 dark:text-zinc-50 leading-none">
                    {matchResult.overallScore}%
                  </span>
                  <span className="text-[9.5px] font-semibold text-zinc-500 uppercase tracking-wider mt-0.5">
                    Match
                  </span>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 pt-6">
            {/* 5-Component Match Breakdown */}
            <div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/50"
              data-testid="job-match-components"
            >
              {breakdownRows.map((row) => {
                const barId = `${uid}-${row.key}`;
                return (
                  <div key={row.key} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <label htmlFor={barId} className="font-medium text-zinc-700 dark:text-zinc-300">
                        {row.label} <span className="text-zinc-400">({row.weight})</span>
                      </label>
                      <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                        {row.score}%
                      </span>
                    </div>
                    <progress
                      id={barId}
                      value={row.score}
                      max={100}
                      className="hr-score-progress"
                      style={
                        {
                          '--progress-bar-fill': getScoreStrokeColor(row.score),
                        } as React.CSSProperties
                      }
                    />
                  </div>
                );
              })}
            </div>

            {renderRequirementGroup(
              'Supported with Candidate Evidence',
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
              supported,
              'success',
            )}

            {renderRequirementGroup(
              'Needs Candidate Confirmation',
              <AlertTriangle className="w-4 h-4 text-amber-600" />,
              needsConfirmation,
              'warning',
              'Mentioned in the JD without strong bullet proof in your resume. Only add these if genuinely part of your experience.',
            )}

            {renderRequirementGroup(
              'Not Evidenced in Profile',
              <XCircle className="w-4 h-4 text-rose-600" />,
              notEvidenced,
              'destructive',
            )}

            {matchResult.recommendations.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                  Actionable Recommendations
                </h4>
                <ul className="space-y-1.5 text-xs">
                  {matchResult.recommendations.map((rec, idx) => (
                    <li
                      key={idx}
                      className="p-3 rounded-lg bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 text-amber-900 dark:text-amber-200 leading-relaxed"
                    >
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3">
              <Link href="/app/match">
                <Button variant="outline" size="sm">
                  Open Full Match &amp; Tailored Draft Workspace
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="primary" size="md">
                  Tailor My Resume for this Role
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
