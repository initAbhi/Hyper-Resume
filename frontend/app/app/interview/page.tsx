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
  RotateCcw,
  Coins,
  Gauge,
  HelpCircle,
  Bot,
  Trash2,
  MessageSquare,
  Volume2,
  Bell,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth-context';
import { useOptionalGlobalAgent } from '@/lib/global-agent-context';
import { 
  apiClient, 
  type Resume, 
  type JobDescription, 
  type InterviewSession,
  type InterviewSessionMode,
  type InterviewDifficulty
} from '@/lib/api-client';

/**
 * Public route — Coming Soon (restored richer Private Beta layout from git history).
 * Full studio kept below as AiInterviewStudioPageLegacy.
 */
export default function AiInterviewStudioPage() {
  const [isNotified, setIsNotified] = useState(false);

  return (
    <div className="max-w-5xl mx-auto space-y-10 py-6 px-4">
      <div className="relative rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 sm:p-12 shadow-sm overflow-hidden text-center sm:text-left">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-200/60 dark:border-blue-900 text-blue-700 dark:text-blue-300 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span>Coming Soon • Private Beta</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
            AI Mock Interviewer &amp; Speech Coach
          </h1>

          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Practice role-specific behavioral and technical interviews generated directly from your
            tailored resume and target job descriptions. Get actionable real-time feedback on STAR
            method articulation and executive presence.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <Button
              onClick={() => setIsNotified(!isNotified)}
              className="w-full sm:w-auto rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-6 h-11 gap-2 shadow-sm"
            >
              {isNotified ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>You&apos;re On The Early Access List</span>
                </>
              ) : (
                <>
                  <Bell className="w-4 h-4" />
                  <span>Notify Me When Live</span>
                </>
              )}
            </Button>

            <Link href="/app/resumes" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full sm:w-auto rounded-full text-xs font-semibold h-11 px-6">
                Back to My Resumes
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-600" />
          <span>What to expect in HyperResume Interview Coach</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center font-bold">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">STAR Method Grading</h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Every answer is evaluated on Situation, Task, Action, and measurable Results. Instantly
              identify missing metrics before speaking with hiring managers.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 flex items-center justify-center font-bold">
              <Volume2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">Cadence &amp; Tone Analysis</h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Real-time voice AI flags filler words (&quot;um&quot;, &quot;like&quot;, &quot;you know&quot;), pacing bottlenecks,
              and offers suggestions to sound clear and authoritative.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center font-bold">
              <Target className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">Job-Specific Question Bank</h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Paste your target job posting to face realistic technical queries, architectural
              challenges, and recruiter screening questions tailored to that exact team.
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800 text-xs">
          <span className="font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
            <Bot className="w-4 h-4 text-blue-600" />
            Interview Session Simulator Preview
          </span>
          <span className="text-zinc-400 font-mono">Question 1 of 5</span>
        </div>

        <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700 text-sm">
          <p className="font-semibold text-zinc-900 dark:text-zinc-100">
            &quot;Looking at your experience at ClearPath Analytics, can you walk me through how you
            designed and evaluated the checkout pricing A/B experiments that yielded $180K ARR?&quot;
          </p>
        </div>

        <div className="flex items-center justify-between pt-2 text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Voice &amp; Audio Input Enabled in Beta</span>
          </div>
          <span className="font-semibold text-blue-600">Expected Response: 90–120s</span>
        </div>
      </div>
    </div>
  );
}

/** Legacy full AI Interview studio — preserved for re-enable; not mounted while Coming Soon is live. */
export function AiInterviewStudioPageLegacy() {
  const router = useRouter();
  const { refreshUser } = useAuth();

  // State
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [jobs, setJobs] = useState<JobDescription[]>([]);
  const [pastSessions, setPastSessions] = useState<InterviewSession[]>([]);
  const [sessionsLimit, setSessionsLimit] = useState<number>(20);
  const [totalSessions, setTotalSessions] = useState<number>(0);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
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
  const globalAgent = useOptionalGlobalAgent();

  // Hydrate target role & resume from Global Agent Context if arriving from Job Search / Match
  useEffect(() => {
    if (!globalAgent || isLoading) return;
    const ctx = globalAgent.pageContext;
    if (ctx.jobTitle && targetRole === 'Full Stack Developer') {
      setTargetRole(ctx.jobTitle);
    }
    if (ctx.activeResumeId && !selectedResumeId) {
      setSelectedResumeId(ctx.activeResumeId);
    }
  }, [globalAgent, isLoading, targetRole, selectedResumeId]);

  // Sync interview setup context into Global Agent Context
  useEffect(() => {
    if (!globalAgent) return;
    const selectedResume = resumes.find((r) => r.id === selectedResumeId);
    const selectedJob = jobs.find((j) => j.id === selectedJobId);
    globalAgent.updateContext({
      activeResumeId: selectedResumeId || undefined,
      activeResumeName: selectedResume?.name,
      jobTitle: selectedJob?.title || targetRole || undefined,
      companyName: selectedJob?.companyName || undefined,
      jobDescriptionId: selectedJob?.id || undefined,
      jobDescriptionText: selectedJob?.originalText || undefined,
    });
  }, [globalAgent, resumes, jobs, selectedResumeId, selectedJobId, targetRole]);

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
        apiClient.listInterviewSessions({ limit: sessionsLimit }),
      ]);

      if (resumesData.status === 'fulfilled') {
        const val: any = resumesData.value;
        const resList: Resume[] = Array.isArray(val) ? val : (val?.items || []);
        setResumes(resList);
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
        setTotalSessions(sessionsData.value.total || (sessionsData.value.items || []).length);
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

      await refreshUser().catch(() => {});
      router.push(`/app/interview/${session.id}`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to initialize interview session.');
      setIsStarting(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-2">
      {/* Sleek Hero Banner */}
      <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-gradient-to-br from-blue-50/70 via-indigo-50/20 to-purple-50/40 dark:from-blue-950/25 dark:via-zinc-900 dark:to-purple-950/20 p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100/70 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800/60 text-blue-700 dark:text-blue-300 text-xs font-semibold shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>AI Interview Readiness Studio</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
              Role-Specific Interview Practice
            </h1>

            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-2xl">
              Practice realistic hiring manager & technical interview rounds grounded in your actual resume bullet points and target job requirements. Get instant feedback on STAR structure, quantifiable impact, and technical accuracy.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-zinc-600 dark:text-zinc-400 font-medium">
              <div className="inline-flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Grounded in your verified resume</span>
              </div>
              <div className="inline-flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Adaptive follow-up challenges</span>
              </div>
              <div className="inline-flex items-center gap-1.5">
                <Award className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>Personalized model answers</span>
              </div>
            </div>
          </div>

          {/* Credit Balance Card (responsive, never overlaps hero copy on tablet) */}
          <div className="flex items-center gap-3.5 self-start shrink-0 bg-white/90 dark:bg-zinc-800/90 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-700/80 rounded-xl px-4 py-2.5 shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Coins className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-zinc-500 dark:text-zinc-400 tracking-wider">Your Balance</div>
              <div className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100">{creditBalance} Credits</div>
            </div>
            <Link
              href="/pricing"
              className="ml-1 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:text-blue-300 hover:text-blue-800 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 rounded-lg transition-colors"
            >
              Recharge
            </Link>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Studio Setup Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Setup Wizard */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 sm:p-8 space-y-6 shadow-xs">
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-zinc-800">
              <Target className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Configure Your Practice Session</span>
            </h2>

            {/* Step 1: Select Practice Mode */}
            <div className="space-y-3">
              <span id="interview-mode-label" className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider block">
                1. Select Interview Mode
              </span>

              <div role="radiogroup" aria-labelledby="interview-mode-label" className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Quick Practice */}
                <button
                  type="button"
                  role="radio"
                  aria-checked={sessionMode === 'quick_practice'}
                  onClick={() => setSessionMode('quick_practice')}
                  className={`text-left p-4 rounded-xl border cursor-pointer transition-all ${
                    sessionMode === 'quick_practice'
                      ? 'border-blue-500 bg-blue-50/60 dark:bg-blue-950/40 ring-3 ring-blue-500/15 shadow-xs'
                      : 'border-slate-200 dark:border-zinc-800 bg-slate-50/40 dark:bg-zinc-800/30 hover:border-slate-300 dark:hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Quick Practice</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-200/80 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300">
                      2 Credits
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-2 leading-relaxed">
                    3 targeted questions. Warm-up confidence builder without follow-ups.
                  </p>
                </button>

                {/* Full Mock */}
                <button
                  type="button"
                  role="radio"
                  aria-checked={sessionMode === 'full_mock'}
                  onClick={() => setSessionMode('full_mock')}
                  className={`text-left p-4 rounded-xl border cursor-pointer transition-all relative ${
                    sessionMode === 'full_mock'
                      ? 'border-blue-500 bg-blue-50/60 dark:bg-blue-950/40 ring-3 ring-blue-500/15 shadow-xs'
                      : 'border-slate-200 dark:border-zinc-800 bg-slate-50/40 dark:bg-zinc-800/30 hover:border-slate-300 dark:hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Full Mock</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800">
                      5 Credits
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-2 leading-relaxed">
                    5 deep questions + adaptive follow-ups & full readiness report.
                  </p>
                </button>

                {/* Weak Area */}
                <button
                  type="button"
                  role="radio"
                  aria-checked={sessionMode === 'weak_area'}
                  onClick={() => setSessionMode('weak_area')}
                  className={`text-left p-4 rounded-xl border cursor-pointer transition-all ${
                    sessionMode === 'weak_area'
                      ? 'border-blue-500 bg-blue-50/60 dark:bg-blue-950/40 ring-3 ring-blue-500/15 shadow-xs'
                      : 'border-slate-200 dark:border-zinc-800 bg-slate-50/40 dark:bg-zinc-800/30 hover:border-slate-300 dark:hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Weak Area Drill</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-200/80 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300">
                      3 Credits
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-2 leading-relaxed">
                    Re-tests questions & competencies where your past scores were low.
                  </p>
                </button>
              </div>
            </div>

            {/* Step 2: Select Resume & Target Job */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="interview-grounding-resume" className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Grounding Resume</span>
                </label>
                <select
                  id="interview-grounding-resume"
                  aria-label="Grounding Resume"
                  value={selectedResumeId}
                  onChange={(e) => setSelectedResumeId(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50/60 dark:bg-zinc-800/50 px-3 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-900 transition-all font-medium"
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
                <label htmlFor="interview-target-jd" className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Target Job Description (Optional)</span>
                </label>
                <select
                  id="interview-target-jd"
                  aria-label="Target Job Description"
                  value={selectedJobId}
                  onChange={(e) => setSelectedJobId(e.target.value)}
                  className="w-full text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/50 px-3 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
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
                <label htmlFor="interview-target-role" className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                  Target Role Title
                </label>
                <input
                  id="interview-target-role"
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g. Frontend Developer, Backend Engineer"
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50/60 dark:bg-zinc-800/50 px-3 py-2.5 text-zinc-900 dark:text-zinc-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-900 transition-all font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="interview-difficulty" className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                  Interview Seniority / Difficulty
                </label>
                <select
                  id="interview-difficulty"
                  aria-label="Interview Seniority or Difficulty"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as InterviewDifficulty)}
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50/60 dark:bg-zinc-800/50 px-3 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-900 transition-all font-medium"
                >
                  <option value="junior">Junior / Associate (Foundational Concepts)</option>
                  <option value="mid">Mid-Level (Standard Technical & STAR)</option>
                  <option value="senior">Senior / Lead (Architecture & Scale)</option>
                </select>
              </div>
            </div>

            {/* Launch Action Bar */}
            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-zinc-500 dark:text-zinc-400">
                Costs <strong className="text-zinc-900 dark:text-zinc-100">{selectedCost} Credits</strong> per session.
                {!hasSufficientCredits && (
                  <span className="text-rose-600 dark:text-rose-400 font-semibold ml-1.5">
                    (You need {selectedCost - creditBalance} more credits)
                  </span>
                )}
              </div>

              {hasSufficientCredits ? (
                <button
                  type="button"
                  onClick={handleStartInterview}
                  disabled={isStarting || resumes.length === 0}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs sm:text-sm font-semibold shadow-xs hover:shadow transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isStarting ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      <span>Generating Questions...</span>
                    </>
                  ) : (
                    <>
                      <span>Start Interview Studio</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              ) : (
                <Link href="/pricing" className="w-full sm:w-auto">
                  <button
                    type="button"
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold shadow-xs hover:shadow transition-all cursor-pointer"
                  >
                    <span>Recharge Credit Pack to Start</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Right Col: Feature Highlights & Summary */}
        <div className="space-y-5">
          {/* Phase 4: AI Agent Interview Prep Launcher */}
          {globalAgent && (
            <div
              data-testid="interview-agent-launcher"
              className="rounded-2xl border border-blue-200/80 dark:border-blue-900/60 bg-blue-50/40 dark:bg-blue-950/20 p-5 space-y-3 shadow-xs"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#285FEA] text-white flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    AI Agent Interview Prep
                  </h3>
                  <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
                    Grounded in your selected resume &amp; role
                  </p>
                </div>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                Let the AI Agent inspect your resume, align with the job requirements, launch a personalized interview session, and present Question 1.
              </p>
              <button
                type="button"
                disabled={resumes.length === 0}
                onClick={() => {
                  const selectedResume = resumes.find((r) => r.id === selectedResumeId);
                  const selectedJob = jobs.find((j) => j.id === selectedJobId);
                  globalAgent.launchPrompt({
                    prompt: `Prepare me for a technical screening for ${selectedJob?.title || targetRole || 'this role'}${selectedJob?.companyName ? ` at ${selectedJob.companyName}` : ''} and ask me the first question.`,
                    autoSubmit: true,
                    context: {
                      activeResumeId: selectedResumeId || undefined,
                      activeResumeName: selectedResume?.name,
                      jobTitle: selectedJob?.title || targetRole || undefined,
                      companyName: selectedJob?.companyName || undefined,
                      jobDescriptionId: selectedJob?.id || undefined,
                      jobDescriptionText: selectedJob?.originalText || undefined,
                    },
                  });
                }}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#285FEA] hover:bg-[#1E4BC8] text-white text-xs font-semibold shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Prepare with AI Agent &amp; Ask Q1</span>
              </button>
            </div>
          )}

          <div className="rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-5 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
              What the Interviewer Evaluates
            </h3>

            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 text-xs font-extrabold border border-blue-200/60 dark:border-blue-800/60">
                  S
                </div>
                <div>
                  <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">STAR Framework</div>
                  <div className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed mt-0.5">
                    Verifies Situation, Task, Action, and measurable business Outcome in every response.
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 text-xs font-extrabold border border-purple-200/60 dark:border-purple-800/60">
                  R
                </div>
                <div>
                  <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Resume Claim Grilling</div>
                  <div className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed mt-0.5">
                    Pulls your exact claimed metrics and asks deep questions on how you achieved them.
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 text-xs font-extrabold border border-emerald-200/60 dark:border-emerald-800/60">
                  G
                </div>
                <div>
                  <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Job Description Gap Probing</div>
                  <div className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed mt-0.5">
                    Tests skills required by the employer that your resume left unevidenced.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-800/40 p-6 space-y-2.5">
            <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Free Starter Entitlement</span>
            </div>
            <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
              New accounts receive 5 welcome credits for quick practice trials. Upgrade to HypeResume Pro (starting at ₹149 / $3 for 1 week, ₹399/mo, ₹1,200/6 mo, or ₹999/$19 Founding Lifetime) for unlimited mock interviews and all model answers.
            </p>
          </div>
        </div>
      </div>

      {/* Past Sessions History */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
            <History className="w-3.5 h-3.5 text-zinc-400" />
            <span>Past Interview Sessions</span>
          </h2>
          <button
            type="button"
            onClick={loadData}
            className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Refresh</span>
          </button>
        </div>

        {pastSessions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 p-8 text-center text-zinc-500 space-y-2 bg-zinc-50/30 dark:bg-zinc-900/30">
            <Briefcase className="w-8 h-8 mx-auto opacity-30" />
            <div className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">No past interview sessions yet.</div>
            <div className="text-[11px] text-zinc-600 dark:text-zinc-400">Configure a session above and click Start Interview Studio to practice.</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pastSessions.map((sess) => (
              <div
                key={sess.id}
                className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all space-y-3.5 shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{sess.targetRole}</div>
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

                <div className="flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400">
                  <span className="capitalize">{sess.sessionMode.replace('_', ' ')}</span>
                  <span>•</span>
                  <span className="capitalize">{sess.difficulty} Level</span>
                  <span>•</span>
                  <span>{new Date(sess.createdAt).toLocaleDateString()}</span>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800">
                  <div className="text-xs">
                    {sess.overallScore !== null && sess.overallScore !== undefined ? (
                      <span className="font-extrabold text-zinc-900 dark:text-zinc-100">Score: {sess.overallScore}/100</span>
                    ) : (
                      <span className="text-zinc-400">In Progress ({sess.currentQuestionIndex}/{sess.totalQuestions})</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {confirmDeleteId === sess.id ? (
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          disabled={deletingId === sess.id}
                          onClick={async () => {
                            setDeletingId(sess.id);
                            try {
                              await apiClient.deleteInterviewSession(sess.id);
                              setPastSessions((prev) => prev.filter((s) => s.id !== sess.id));
                              setTotalSessions((prev) => Math.max(0, prev - 1));
                            } catch (err: any) {
                              setErrorMsg(err?.message || 'Failed to delete session.');
                            } finally {
                              setDeletingId(null);
                              setConfirmDeleteId(null);
                            }
                          }}
                          className="px-2 py-1 text-[11px] font-semibold rounded bg-rose-600 text-white hover:bg-rose-700 cursor-pointer"
                        >
                          Delete
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(null)}
                          className="px-2 py-1 text-[11px] rounded border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        aria-label={`Delete interview session ${sess.targetRole}`}
                        onClick={() => setConfirmDeleteId(sess.id)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                        title="Delete session"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <Link
                      href={sess.status === 'completed' ? `/app/interview/${sess.id}/report` : `/app/interview/${sess.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-xs font-semibold transition-all"
                    >
                      <span>{sess.status === 'completed' ? 'View Scorecard' : 'Resume Interview'}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {pastSessions.length < totalSessions && (
          <div className="flex justify-center pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={async () => {
                const nextLimit = sessionsLimit + 20;
                setSessionsLimit(nextLimit);
                const res = await apiClient.listInterviewSessions({ limit: nextLimit }).catch(() => null);
                if (res) {
                  setPastSessions(res.items || []);
                  setTotalSessions(res.total || res.items.length);
                }
              }}
            >
              Load More Sessions ({pastSessions.length} of {totalSessions})
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
