'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Sparkles, 
  Target, 
  Clock, 
  ArrowRight, 
  Award, 
  CheckCircle2, 
  AlertCircle, 
  Briefcase, 
  FileText, 
  Zap, 
  History,
  ShieldCheck,
  ChevronRight,
  RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { 
  apiClient, 
  type Resume, 
  type JobDescription, 
  type InterviewSession,
  type InterviewSessionMode,
  type InterviewDifficulty
} from '@/lib/api-client';

export default function AiInterviewStudioPage() {
  const router = useRouter();

  // State
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [jobs, setJobs] = useState<JobDescription[]>([]);
  const [pastSessions, setPastSessions] = useState<InterviewSession[]>([]);
  const [creditBalance, setCreditBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isStarting, setIsStarting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form selections
  const [selectedResumeId, setSelectedResumeId] = useState<string>('');
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [sessionMode, setSessionMode] = useState<InterviewSessionMode>('quick_practice');
  const [targetRole, setTargetRole] = useState<string>('Full Stack Developer');
  const [difficulty, setDifficulty] = useState<InterviewDifficulty>('mid');

  // Mode credit requirements
  const creditCosts: Record<InterviewSessionMode, number> = {
    quick_practice: 2,
    full_mock: 5,
    weak_area: 3,
  };

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const [resumesData, jobsData, balanceData, sessionsData] = await Promise.allSettled([
        apiClient.listResumes({ limit: 50 }),
        apiClient.listJobDescriptions({ limit: 50 }),
        apiClient.getCreditBalance(),
        apiClient.listInterviewSessions({ limit: 20 }),
      ]);

      if (resumesData.status === 'fulfilled') {
        const val: any = resumesData.value;
        const resList: Resume[] = Array.isArray(val) ? val : (val?.items || []);
        setResumes(resList);
        // Default to master resume or first resume
        const master = resList.find((r: Resume) => r.isMaster) || resList[0];
        if (master) setSelectedResumeId(master.id);
      }

      if (jobsData.status === 'fulfilled') {
        const val: any = jobsData.value;
        const jobList: JobDescription[] = Array.isArray(val) ? val : (val?.items || []);
        setJobs(jobList);
      }

      if (balanceData.status === 'fulfilled') {
        setCreditBalance(balanceData.value);
      }

      if (sessionsData.status === 'fulfilled') {
        setPastSessions(sessionsData.value.items || []);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load interview studio data.');
    } finally {
      setIsLoading(false);
    }
  }

  const selectedCost = creditCosts[sessionMode];
  const hasSufficientCredits = creditBalance >= selectedCost;

  async function handleStartInterview() {
    if (!selectedResumeId) {
      setErrorMsg('Please select a resume to ground your interview questions.');
      return;
    }
    if (!targetRole.trim()) {
      setErrorMsg('Please specify a target role.');
      return;
    }
    if (!hasSufficientCredits) {
      setErrorMsg(`Insufficient credits. You need ${selectedCost} credits, but have ${creditBalance}.`);
      return;
    }

    setIsStarting(true);
    setErrorMsg(null);

    try {
      const session = await apiClient.startInterview({
        resumeId: selectedResumeId,
        jobDescriptionId: selectedJobId || undefined,
        sessionMode,
        targetRole: targetRole.trim(),
        difficulty,
        idempotencyKey: `start-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      });

      router.push(`/app/interview/${session.id}`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to initialize interview session.');
      setIsStarting(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-4 px-2 sm:px-0">
      {/* Top Banner */}
      <div className="rounded-xl border border-border bg-card p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-medium border border-blue-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Interview Readiness Studio</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Role-Specific Interview Practice
          </h1>

          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Practice realistic hiring manager & technical interview rounds grounded in your actual resume bullet points and target job requirements. Get instant feedback on STAR structure, quantifiable impact, and technical accuracy.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <div className="inline-flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Grounded in your verified resume</span>
            </div>
            <div className="inline-flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-blue-500" />
              <span>Adaptive follow-up challenges</span>
            </div>
            <div className="inline-flex items-center gap-1.5">
              <Award className="w-4 h-4 text-purple-500" />
              <span>Personalized model answers</span>
            </div>
          </div>
        </div>

        {/* Credit Balance Pill */}
        <div className="mt-4 sm:mt-0 sm:absolute sm:top-6 sm:right-6 flex items-center gap-3 bg-muted/60 border border-border rounded-lg px-3.5 py-2">
          <div className="text-right">
            <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Your Balance</div>
            <div className="text-sm font-bold text-foreground">{creditBalance} Credits</div>
          </div>
          <Link href="/pricing">
            <Button variant="outline" size="sm">
              Recharge
            </Button>
          </Link>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Studio Setup Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Setup Wizard */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 space-y-6 border-border bg-card">
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
              <Target className="w-4 h-4 text-blue-600" />
              <span>Configure Your Practice Session</span>
            </h2>

            {/* Step 1: Select Practice Mode */}
            <div className="space-y-3">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                1. Select Interview Mode
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Quick Practice */}
                <div
                  onClick={() => setSessionMode('quick_practice')}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    sessionMode === 'quick_practice'
                      ? 'border-blue-600 bg-blue-500/5 ring-1 ring-blue-600'
                      : 'border-border bg-muted/20 hover:border-border/80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">Quick Practice</span>
                    <Badge variant="neutral" className="text-[10px]">
                      2 Credits
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1.5 leading-snug">
                    3 targeted questions. Warm-up confidence builder without follow-ups.
                  </p>
                </div>

                {/* Full Mock */}
                <div
                  onClick={() => setSessionMode('full_mock')}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    sessionMode === 'full_mock'
                      ? 'border-blue-600 bg-blue-500/5 ring-1 ring-blue-600'
                      : 'border-border bg-muted/20 hover:border-border/80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">Full Mock</span>
                    <Badge variant="info" className="text-[10px]">
                      5 Credits
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1.5 leading-snug">
                    5 deep questions + adaptive follow-ups & full readiness report.
                  </p>
                </div>

                {/* Weak Area */}
                <div
                  onClick={() => setSessionMode('weak_area')}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    sessionMode === 'weak_area'
                      ? 'border-blue-600 bg-blue-500/5 ring-1 ring-blue-600'
                      : 'border-border bg-muted/20 hover:border-border/80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">Weak Area Drill</span>
                    <Badge variant="neutral" className="text-[10px]">
                      3 Credits
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1.5 leading-snug">
                    Re-tests questions & competencies where your past scores were low.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 2: Select Resume & Target Job */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>Grounding Resume</span>
                </label>
                <select
                  value={selectedResumeId}
                  onChange={(e) => setSelectedResumeId(e.target.value)}
                  className="w-full text-xs rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-blue-600"
                >
                  {resumes.length === 0 ? (
                    <option value="">No resumes found. Please create one.</option>
                  ) : (
                    resumes.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} {r.isMaster ? '(Master Profile)' : ''}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>Target Job Description (Optional)</span>
                </label>
                <select
                  value={selectedJobId}
                  onChange={(e) => setSelectedJobId(e.target.value)}
                  className="w-full text-xs rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-blue-600"
                >
                  <option value="">General Role Practice (No specific JD)</option>
                  {jobs.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.title} {j.companyName ? `at ${j.companyName}` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Step 3: Target Role & Difficulty */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Target Role Title</label>
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g. Frontend Developer, Backend Engineer"
                  className="w-full text-xs rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Interview Seniority / Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as InterviewDifficulty)}
                  className="w-full text-xs rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-blue-600"
                >
                  <option value="junior">Junior / Associate (Foundational Concepts)</option>
                  <option value="mid">Mid-Level (Standard Technical & STAR)</option>
                  <option value="senior">Senior / Lead (Architecture & Scale)</option>
                </select>
              </div>
            </div>

            {/* Launch Action */}
            <div className="pt-2 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-muted-foreground">
                Costs <strong className="text-foreground">{selectedCost} Credits</strong> per session.
                {!hasSufficientCredits && (
                  <span className="text-red-500 ml-1.5">
                    (You need {selectedCost - creditBalance} more credits)
                  </span>
                )}
              </div>

              {hasSufficientCredits ? (
                <Button
                  onClick={handleStartInterview}
                  disabled={isStarting || resumes.length === 0}
                  variant="primary"
                  size="sm"
                  className="w-full sm:w-auto gap-2"
                >
                  {isStarting ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      <span>Generating Questions...</span>
                    </>
                  ) : (
                    <>
                      <span>Start Interview Studio</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </Button>
              ) : (
                <Link href="/pricing" className="w-full sm:w-auto">
                  <Button variant="primary" size="sm" className="w-full gap-2">
                    <span>Recharge Credit Pack to Start</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              )}
            </div>
          </Card>
        </div>

        {/* Right Col: Feature Highlights & Summary */}
        <div className="space-y-4">
          <Card className="p-5 border-border bg-card space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              What the Interviewer Evaluates
            </h3>

            <div className="space-y-3">
              <div className="flex gap-2.5">
                <div className="w-6 h-6 rounded-md bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0 text-xs font-bold">
                  S
                </div>
                <div>
                  <div className="text-xs font-semibold text-foreground">STAR Framework</div>
                  <div className="text-[11px] text-muted-foreground leading-snug">
                    Verifies Situation, Task, Action, and measurable business Outcome.
                  </div>
                </div>
              </div>

              <div className="flex gap-2.5">
                <div className="w-6 h-6 rounded-md bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0 text-xs font-bold">
                  R
                </div>
                <div>
                  <div className="text-xs font-semibold text-foreground">Resume Claim Grilling</div>
                  <div className="text-[11px] text-muted-foreground leading-snug">
                    Pulls your exact claimed metrics and asks how you achieved them.
                  </div>
                </div>
              </div>

              <div className="flex gap-2.5">
                <div className="w-6 h-6 rounded-md bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 text-xs font-bold">
                  G
                </div>
                <div>
                  <div className="text-xs font-semibold text-foreground">Job Description Gap Probing</div>
                  <div className="text-[11px] text-muted-foreground leading-snug">
                    Tests skills required by the employer that your resume left unevidenced.
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-5 border-border bg-card space-y-3">
            <div className="text-xs font-bold text-foreground">Free Starter Entitlement</div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              New accounts receive 1 complimentary Quick Practice trial (2 welcome credits). Upgrade to Job Hunt Pack (₹399) or Pro (₹899) to unlock full mock interviews and all model answers.
            </p>
          </Card>
        </div>
      </div>

      {/* Past Sessions History */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <History className="w-4 h-4" />
            <span>Past Interview Sessions</span>
          </h2>
          <Button variant="ghost" size="sm" onClick={loadData} className="gap-1 text-muted-foreground">
            <RotateCcw className="w-3 h-3" />
            <span>Refresh</span>
          </Button>
        </div>

        {pastSessions.length === 0 ? (
          <Card className="p-8 text-center border-dashed border-border text-muted-foreground space-y-2">
            <Briefcase className="w-8 h-8 mx-auto opacity-40" />
            <div className="text-xs font-medium">No past interview sessions yet.</div>
            <div className="text-[11px]">Configure a session above and click Start Interview Studio to practice.</div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pastSessions.map((sess) => (
              <Card key={sess.id} className="p-4 border-border bg-card hover:border-border/80 transition-all space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-foreground">{sess.targetRole}</div>
                  <Badge
                    variant={
                      sess.status === 'completed'
                        ? 'success'
                        : sess.status === 'in_progress'
                        ? 'info'
                        : 'neutral'
                    }
                    className="capitalize text-[10px]"
                  >
                    {sess.status.replace('_', ' ')}
                  </Badge>
                </div>

                <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                  <span className="capitalize">{sess.sessionMode.replace('_', ' ')}</span>
                  <span>•</span>
                  <span className="capitalize">{sess.difficulty} Level</span>
                  <span>•</span>
                  <span>{new Date(sess.createdAt).toLocaleDateString()}</span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border/60">
                  <div className="text-xs">
                    {sess.overallScore !== null && sess.overallScore !== undefined ? (
                      <span className="font-bold text-foreground">Score: {sess.overallScore}/100</span>
                    ) : (
                      <span className="text-muted-foreground">In Progress ({sess.currentQuestionIndex}/{sess.totalQuestions})</span>
                    )}
                  </div>

                  <Link href={sess.status === 'completed' ? `/app/interview/${sess.id}/report` : `/app/interview/${sess.id}`}>
                    <Button variant="outline" size="sm" className="gap-1">
                      <span>{sess.status === 'completed' ? 'View Scorecard' : 'Resume Interview'}</span>
                      <ChevronRight className="w-3 h-3" />
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
