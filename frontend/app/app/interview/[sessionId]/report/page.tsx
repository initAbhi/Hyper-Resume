'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Award, 
  CheckCircle2, 
  AlertCircle, 
  Printer, 
  Sparkles, 
  Lock, 
  RotateCcw, 
  Check, 
  ChevronRight,
  TrendingUp,
  Briefcase,
  ShieldCheck,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { 
  apiClient, 
  type InterviewReportData 
} from '@/lib/api-client';

interface PageProps {
  params: Promise<{ sessionId: string }>;
}

export default function InterviewScorecardReportPage({ params }: PageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const sessionId = resolvedParams.sessionId;

  const [reportData, setReportData] = useState<InterviewReportData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    loadReport();
  }, [sessionId]);

  async function loadReport() {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const data = await apiClient.getInterviewReport(sessionId);
      setReportData(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load interview scorecard report.');
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto py-16 text-center space-y-3">
        <span className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin inline-block" />
        <div className="text-xs text-muted-foreground">Compiling interview readiness scorecard...</div>
      </div>
    );
  }

  if (!reportData || !reportData.session) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center space-y-4">
        <div className="text-sm font-semibold text-foreground">Scorecard Not Available</div>
        <p className="text-xs text-muted-foreground">{errorMsg || 'Could not find report for this session.'}</p>
        <Link href="/app/interview">
          <Button variant="outline" size="sm">Back to Studio Hub</Button>
        </Link>
      </div>
    );
  }

  const { session, questions, turns, isPaidUser } = reportData;
  const overall = typeof session.overallScore === 'number' ? session.overallScore : 0;

  function getRatingTier(score: number) {
    if (score >= 85) return { label: 'Interview Ready', variant: 'success' as const, color: 'text-emerald-500' };
    if (score >= 70) return { label: 'Solid Potential', variant: 'info' as const, color: 'text-blue-500' };
    return { label: 'Needs Practice', variant: 'warning' as const, color: 'text-amber-500' };
  }

  const ratingTier = getRatingTier(overall);

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-6 px-2 sm:px-0 print:py-0 print:max-w-none">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between border-b border-border pb-4 print:hidden">
        <Link href="/app/interview">
          <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Studio Hub</span>
          </Button>
        </Link>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Scorecard</span>
          </Button>

          <Link href="/app/interview">
            <Button variant="primary" size="sm" className="gap-1.5">
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Practice Again</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Hero Scorecard Card */}
      <div className="rounded-xl border border-border bg-card p-6 sm:p-8 shadow-xs relative overflow-hidden space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-border/80 pb-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-medium border border-blue-500/20">
              <Award className="w-3.5 h-3.5" />
              <span>Interview Readiness Scorecard</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {session.targetRole}
            </h1>
            <p className="text-xs text-muted-foreground">
              Mode: <span className="capitalize">{session.sessionMode.replace('_', ' ')}</span> • Difficulty: <span className="capitalize">{session.difficulty}</span> • Completed: {new Date(session.completedAt || session.updatedAt).toLocaleDateString()}
            </p>
          </div>

          {/* Overall Score Badge */}
          <div className="flex items-center gap-4 bg-muted/40 border border-border rounded-xl p-4 shrink-0">
            <div className="text-center">
              <div className="text-3xl font-extrabold text-foreground tracking-tight">{overall}</div>
              <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Out of 100</div>
            </div>
            <div className="h-10 w-px bg-border" />
            <div>
              <Badge variant={ratingTier.variant} className="text-xs">
                {ratingTier.label}
              </Badge>
              <div className="text-[10px] text-muted-foreground mt-1">Based on STAR & Tech rubrics</div>
            </div>
          </div>
        </div>

        {/* Competency Sub-Scores */}
        {session.scoreBreakdown && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-lg bg-muted/30 border border-border/70 space-y-1">
              <div className="text-[10px] uppercase font-bold text-muted-foreground">STAR Adherence</div>
              <div className="text-lg font-bold text-foreground">{session.scoreBreakdown.starScore}%</div>
              <div className="text-[10px] text-muted-foreground">Situation & Outcome check</div>
            </div>

            <div className="p-3.5 rounded-lg bg-muted/30 border border-border/70 space-y-1">
              <div className="text-[10px] uppercase font-bold text-muted-foreground">Technical Depth</div>
              <div className="text-lg font-bold text-foreground">{session.scoreBreakdown.technicalScore}%</div>
              <div className="text-[10px] text-muted-foreground">Accuracy & Architecture</div>
            </div>

            <div className="p-3.5 rounded-lg bg-muted/30 border border-border/70 space-y-1">
              <div className="text-[10px] uppercase font-bold text-muted-foreground">Relevance</div>
              <div className="text-lg font-bold text-foreground">{session.scoreBreakdown.relevanceScore}%</div>
              <div className="text-[10px] text-muted-foreground">Directness to question</div>
            </div>

            <div className="p-3.5 rounded-lg bg-muted/30 border border-border/70 space-y-1">
              <div className="text-[10px] uppercase font-bold text-muted-foreground">Clarity</div>
              <div className="text-lg font-bold text-foreground">{session.scoreBreakdown.clarityScore}%</div>
              <div className="text-[10px] text-muted-foreground">Conciseness & focus</div>
            </div>
          </div>
        )}

        {/* Panelist Feedback Summary */}
        {session.summaryFeedback && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-border/60 text-xs">
            <div className="space-y-2">
              <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                <span>Key Panelist Strengths</span>
              </span>
              <ul className="space-y-1 text-muted-foreground list-disc list-inside">
                {session.summaryFeedback.strengths.map((str, i) => (
                  <li key={i}>{str}</li>
                ))}
              </ul>
            </div>

            <div className="space-y-2">
              <span className="font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Identified Improvement Areas</span>
              </span>
              <ul className="space-y-1 text-muted-foreground list-disc list-inside">
                {session.summaryFeedback.improvements.map((imp, i) => (
                  <li key={i}>{imp}</li>
                ))}
              </ul>
            </div>

            <div className="space-y-2">
              <span className="font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Priority Action Items</span>
              </span>
              <ul className="space-y-1 text-muted-foreground list-disc list-inside">
                {session.summaryFeedback.actionItems.map((act, i) => (
                  <li key={i}>{act}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Disclaimer Banner */}
        <div className="text-[11px] text-muted-foreground/80 italic pt-2 border-t border-border/40">
          AI Practice Assessment — This evaluation is an educational preparation tool designed for interview confidence and does not guarantee employer hiring decisions.
        </div>
      </div>

      {/* Question-by-Question Deep Dive */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Question-by-Question Detailed Breakdown
        </h2>

        <div className="space-y-4">
          {questions.map((q, idx) => {
            const turn = turns.find((t) => t.questionId === q.id);
            const isModelAnswerLocked = !isPaidUser && idx > 0;

            return (
              <Card key={q.id} className="p-6 border-border bg-card space-y-4 shadow-xs">
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-muted text-foreground flex items-center justify-center text-[10px] font-bold">
                      {idx + 1}
                    </span>
                    <Badge variant="neutral" className="capitalize text-[10px]">
                      {q.category.replace('_', ' ')}
                    </Badge>
                    {q.contextHint && (
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-blue-500" />
                        <span>{q.contextHint}</span>
                      </span>
                    )}
                  </div>

                  {turn && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-foreground">Score: {turn.turnScore}/100</span>
                    </div>
                  )}
                </div>

                {/* Question Text */}
                <div className="text-sm font-semibold text-foreground">
                  {q.questionText}
                </div>

                {/* Candidate Answer */}
                {turn && (
                  <div className="p-3.5 rounded-lg bg-muted/40 border border-border text-xs space-y-1">
                    <div className="text-[10px] uppercase font-bold text-muted-foreground">Your Submitted Response</div>
                    <p className="text-foreground leading-relaxed">&ldquo;{turn.candidateAnswer}&rdquo;</p>
                  </div>
                )}

                {/* Turn Feedback */}
                {turn?.evaluation && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1">
                    <div className="space-y-1">
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">Strong Points:</span>
                      <ul className="text-muted-foreground list-disc list-inside space-y-0.5">
                        {turn.evaluation.strengths.map((str, i) => (
                          <li key={i}>{str}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-1">
                      <span className="font-semibold text-amber-600 dark:text-amber-400">Coaching Note:</span>
                      <p className="text-muted-foreground leading-relaxed">
                        {turn.evaluation.improvementTip}
                      </p>
                    </div>
                  </div>
                )}

                {/* Follow-up Section if present */}
                {turn?.followUpQuestion && (
                  <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20 text-xs space-y-1.5">
                    <div className="font-semibold text-amber-700 dark:text-amber-400">Interviewer Adaptive Probe:</div>
                    <div className="text-foreground">{turn.followUpQuestion}</div>
                    {turn.followUpAnswer && (
                      <div className="pt-1 text-muted-foreground italic">
                        Your answer: &ldquo;{turn.followUpAnswer}&rdquo; (Score: {typeof turn.followUpScore === 'number' ? turn.followUpScore : 0}/100)
                      </div>
                    )}
                  </div>
                )}

                {/* Personalized Model Answer */}
                <div className="pt-2 border-t border-border/60">
                  {isModelAnswerLocked ? (
                    /* Locked Pro Preview Card */
                    <div className="p-4 rounded-xl border border-dashed border-blue-500/30 bg-blue-500/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                      <div className="space-y-1">
                        <div className="font-semibold text-foreground flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5 text-blue-600" />
                          <span>Personalized Model Answer Locked for Pro</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                          Upgrade to HypeResume Pro (starting at ₹149/$3 weekly pass) to unlock staff-level model answers for all questions and unlimited mock interviews.
                        </p>
                      </div>

                      <Link href="/pricing" className="shrink-0">
                        <Button variant="primary" size="sm" className="gap-1.5">
                          <span>Unlock Pro</span>
                          <Sparkles className="w-3 h-3" />
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    /* Unlocked Model Answer */
                    turn?.evaluation?.idealAnswerDraft && (
                      <div className="p-4 rounded-xl bg-muted/30 border border-border text-xs space-y-1.5">
                        <div className="font-semibold text-foreground flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                          <span>Staff-Level Model Answer Recommendation</span>
                        </div>
                        <p className="text-muted-foreground leading-relaxed italic">
                          &ldquo;{turn.evaluation.idealAnswerDraft}&rdquo;
                        </p>
                      </div>
                    )
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Bottom CTA Card */}
      <div className="rounded-xl border border-border bg-card p-6 flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
        <div>
          <h3 className="text-sm font-bold text-foreground">Ready to improve your interview readiness?</h3>
          <p className="text-xs text-muted-foreground">
            Practice another round or run a targeted Weak Area Drill on questions where you scored below 80%.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/app/resumes">
            <Button variant="outline" size="sm">
              My Resumes
            </Button>
          </Link>
          <Link href="/app/interview">
            <Button variant="primary" size="sm" className="gap-1.5">
              <span>Studio Hub</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
