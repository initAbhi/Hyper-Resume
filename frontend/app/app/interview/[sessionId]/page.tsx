'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Clock, 
  Mic, 
  MicOff, 
  Send, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  ArrowRight, 
  Award,
  ChevronRight,
  ShieldCheck,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { 
  apiClient, 
  type InterviewSession, 
  type InterviewQuestion, 
  type InterviewTurn 
} from '@/lib/api-client';

interface PageProps {
  params: Promise<{ sessionId: string }>;
}

export default function ActiveInterviewStudioPage({ params }: PageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const sessionId = resolvedParams.sessionId;

  // Session & Question state
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [turns, setTurns] = useState<InterviewTurn[]>([]);
  const [activeQuestion, setActiveQuestion] = useState<InterviewQuestion | null>(null);
  const [activeTurn, setActiveTurn] = useState<InterviewTurn | null>(null);

  // Input & Timer state
  const [candidateAnswer, setCandidateAnswer] = useState<string>('');
  const [timeTakenSeconds, setTimeTakenSeconds] = useState<number>(0);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [speechSupported, setSpeechSupported] = useState<boolean>(false);

  // Follow-up state
  const [followUpAnswer, setFollowUpAnswer] = useState<string>('');
  const [isSubmittingFollowUp, setIsSubmittingFollowUp] = useState<boolean>(false);

  // Async states
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isFinishing, setIsFinishing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 1. Initial Load
  useEffect(() => {
    loadSession();
  }, [sessionId]);

  // 2. Timer Loop
  useEffect(() => {
    if (!session || session.status !== 'in_progress' || activeTurn) return;

    const interval = setInterval(() => {
      setTimeTakenSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [session, activeTurn]);

  // 3. Web Speech API Initialization
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasSpeech = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
      setSpeechSupported(hasSpeech);
    }
  }, []);

  async function loadSession() {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const data = await apiClient.getInterviewSession(sessionId);
      setSession(data.session);
      setQuestions(data.questions);
      setTurns(data.turns);

      if (data.session.status === 'completed') {
        router.push(`/app/interview/${sessionId}/report`);
        return;
      }

      // Find current active question
      const currIdx = data.session.currentQuestionIndex;
      const currentQ = data.questions.find((q) => q.orderIndex === currIdx) || data.questions[0];
      setActiveQuestion(currentQ || null);

      // Check if current question already has an evaluated turn
      const existingTurn = data.turns.find((t) => t.questionId === currentQ?.id);
      setActiveTurn(existingTurn || null);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load interview session.');
    } finally {
      setIsLoading(false);
    }
  }

  // Speech Recognition Toggle
  function toggleSpeechRecording() {
    if (!speechSupported) return;

    if (isRecording) {
      setIsRecording(false);
      return;
    }

    try {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsRecording(true);
      recognition.onend = () => setIsRecording(false);
      recognition.onerror = () => setIsRecording(false);

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        setCandidateAnswer((prev) => (prev ? `${prev} ${transcript}` : transcript).slice(0, 1500));
      };

      recognition.start();
    } catch {
      setIsRecording(false);
    }
  }

  async function handleSubmitAnswer() {
    if (!activeQuestion) return;
    if (candidateAnswer.trim().length < 15) {
      setErrorMsg('Please write at least 15 characters before submitting your response.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    if (isRecording) setIsRecording(false);

    try {
      const turn = await apiClient.submitInterviewAnswer(sessionId, {
        questionId: activeQuestion.id,
        candidateAnswer: candidateAnswer.trim(),
        timeTakenSeconds,
      });

      setActiveTurn(turn);
      setTurns((prev) => [...prev.filter((t) => t.questionId !== turn.questionId), turn]);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to evaluate answer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSubmitFollowUp() {
    if (!activeQuestion || !activeTurn) return;
    if (followUpAnswer.trim().length < 15) {
      setErrorMsg('Please write at least 15 characters for your follow-up answer.');
      return;
    }

    setIsSubmittingFollowUp(true);
    setErrorMsg(null);

    try {
      const updatedTurn = await apiClient.submitInterviewFollowUp(sessionId, {
        questionId: activeQuestion.id,
        followUpAnswer: followUpAnswer.trim(),
      });

      setActiveTurn(updatedTurn);
      setTurns((prev) => [...prev.filter((t) => t.id !== updatedTurn.id), updatedTurn]);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit follow-up answer.');
    } finally {
      setIsSubmittingFollowUp(false);
    }
  }

  async function handleNextQuestion() {
    if (!session) return;

    // Check if this was the last question
    const nextIdx = (session.currentQuestionIndex || 0) + 1;
    if (nextIdx >= session.totalQuestions) {
      handleFinishSession();
      return;
    }

    // Advance to next question locally
    const nextQ = questions.find((q) => q.orderIndex === nextIdx);
    setActiveQuestion(nextQ || null);
    setActiveTurn(null);
    setCandidateAnswer('');
    setFollowUpAnswer('');
    setTimeTakenSeconds(0);
    setSession({ ...session, currentQuestionIndex: nextIdx });
  }

  async function handleFinishSession() {
    setIsFinishing(true);
    setErrorMsg(null);
    try {
      await apiClient.finishInterviewSession(sessionId);
      router.push(`/app/interview/${sessionId}/report`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to finalize interview report.');
      setIsFinishing(false);
    }
  }

  function formatTime(totalSec: number) {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto py-16 text-center space-y-3">
        <span className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin inline-block" />
        <div className="text-xs text-muted-foreground">Loading interview studio...</div>
      </div>
    );
  }

  if (!session || !activeQuestion) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center space-y-4">
        <div className="text-sm font-semibold text-foreground">Interview Session Unavailable</div>
        <p className="text-xs text-muted-foreground">This session could not be found or may have expired.</p>
        <Link href="/app/interview">
          <Button variant="outline" size="sm">Back to Studio Hub</Button>
        </Link>
      </div>
    );
  }

  const isLastQuestion = (activeQuestion.orderIndex + 1) >= session.totalQuestions;

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-4 px-2 sm:px-0">
      {/* Studio Header Bar */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <Link href="/app/interview">
            <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Studio Hub</span>
            </Button>
          </Link>

          <div className="h-4 w-px bg-border" />

          <div>
            <div className="text-xs font-bold text-foreground">{session.targetRole}</div>
            <div className="text-[10px] text-muted-foreground capitalize">
              {session.sessionMode.replace('_', ' ')} • {session.difficulty} difficulty
            </div>
          </div>
        </div>

        {/* Progress & Timer */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
              Question {activeQuestion.orderIndex + 1} of {session.totalQuestions}
            </div>
            <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden mt-1">
              <div 
                className="h-full bg-blue-600 rounded-full transition-all duration-300"
                style={{ width: `${((activeQuestion.orderIndex + 1) / session.totalQuestions) * 100}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted text-xs font-mono font-semibold text-foreground border border-border">
            <Clock className="w-3.5 h-3.5 text-muted-foreground" />
            <span>{formatTime(timeTakenSeconds)}</span>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Active Question Card */}
      <Card className="p-6 border-border bg-card space-y-3 relative overflow-hidden shadow-xs">
        <div className="flex items-center justify-between">
          <Badge variant="neutral" className="capitalize text-[10px]">
            {activeQuestion.category.replace('_', ' ')}
          </Badge>

          {activeQuestion.contextHint && (
            <div className="text-[11px] text-muted-foreground flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
              <span>{activeQuestion.contextHint}</span>
            </div>
          )}
        </div>

        <h2 className="text-base sm:text-lg font-semibold tracking-tight text-foreground leading-relaxed">
          {activeQuestion.questionText}
        </h2>
      </Card>

      {/* Answer Form or Feedback Card */}
      {!activeTurn ? (
        /* Unanswered: Response Editor */
        <Card className="p-5 border-border bg-card space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-foreground">
              Your Response (STAR or Technical Architecture)
            </label>

            {speechSupported && (
              <Button
                variant={isRecording ? 'destructive' : 'outline'}
                size="sm"
                onClick={toggleSpeechRecording}
                className="gap-1.5"
              >
                {isRecording ? (
                  <>
                    <MicOff className="w-3 h-3 animate-pulse" />
                    <span>Listening... (Click to stop)</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-3 h-3" />
                    <span>Speak Response (Web Speech)</span>
                  </>
                )}
              </Button>
            )}
          </div>

          <textarea
            value={candidateAnswer}
            onChange={(e) => setCandidateAnswer(e.target.value.slice(0, 1500))}
            placeholder="Type your response here... Structure your answer with clear context, specific actions you took, and measurable results or architectural trade-offs."
            rows={7}
            className="w-full text-xs sm:text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/50 p-4 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 leading-relaxed resize-y transition-all"
          />

          <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
            <span>{candidateAnswer.length} / 1500 characters</span>

            <Button
              onClick={handleSubmitAnswer}
              disabled={isSubmitting || candidateAnswer.trim().length < 15}
              variant="primary"
              size="sm"
              className="gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span>Evaluating Response...</span>
                </>
              ) : (
                <>
                  <span>Submit Answer for Evaluation</span>
                  <Send className="w-3.5 h-3.5" />
                </>
              )}
            </Button>
          </div>
        </Card>
      ) : (
        /* Evaluated: Turn Evaluation Card */
        <div className="space-y-4">
          <Card className="p-6 border-blue-500/30 bg-blue-500/5 space-y-5 shadow-xs">
            {/* Score & Category Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/80 pb-4">
              <div>
                <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                  Turn Evaluation
                </div>
                <div className="text-xl font-bold text-foreground flex items-center gap-2">
                  <span>Score: {activeTurn.turnScore}/100</span>
                  <Badge variant={activeTurn.turnScore && activeTurn.turnScore >= 75 ? 'success' : 'warning'} className="text-[10px]">
                    {activeTurn.turnScore && activeTurn.turnScore >= 75 ? 'Strong Answer' : 'Developing'}
                  </Badge>
                </div>
              </div>

              {/* STAR Badges */}
              {activeTurn.evaluation?.starPresent && (
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-[10px] text-muted-foreground mr-1">STAR Check:</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${activeTurn.evaluation.starPresent.situation ? 'bg-emerald-500/20 text-emerald-600' : 'bg-muted text-muted-foreground'}`}>S</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${activeTurn.evaluation.starPresent.task ? 'bg-emerald-500/20 text-emerald-600' : 'bg-muted text-muted-foreground'}`}>T</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${activeTurn.evaluation.starPresent.action ? 'bg-emerald-500/20 text-emerald-600' : 'bg-muted text-muted-foreground'}`}>A</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${activeTurn.evaluation.starPresent.result ? 'bg-emerald-500/20 text-emerald-600' : 'bg-muted text-muted-foreground'}`}>R</span>
                </div>
              )}
            </div>

            {/* Strengths & Improvement Tip */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-2">
                <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>Key Strengths</span>
                </span>
                <ul className="space-y-1.5 text-muted-foreground list-disc list-inside">
                  {activeTurn.evaluation?.strengths.map((str, i) => (
                    <li key={i}>{str}</li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2">
                <span className="font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Coaching Recommendation</span>
                </span>
                <p className="text-muted-foreground leading-relaxed">
                  {activeTurn.evaluation?.improvementTip}
                </p>
              </div>
            </div>

            {/* Follow-up Question Block */}
            {activeTurn.followUpQuestion && !activeTurn.followUpAnswer && (
              <div className="mt-4 p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="warning" className="text-[10px]">
                    Adaptive Follow-Up
                  </Badge>
                  <span className="text-xs font-semibold text-foreground">
                    The interviewer probes your answer:
                  </span>
                </div>

                <p className="text-xs font-medium text-foreground">
                  {activeTurn.followUpQuestion}
                </p>

                <textarea
                  value={followUpAnswer}
                  onChange={(e) => setFollowUpAnswer(e.target.value.slice(0, 1500))}
                  placeholder="Address the interviewer's follow-up probe with specific technical or metric details..."
                  rows={3}
                  className="w-full text-xs rounded-lg border border-border bg-background p-2.5 text-foreground focus:outline-none focus:ring-1 focus:ring-blue-600"
                />

                <div className="flex justify-end">
                  <Button
                    onClick={handleSubmitFollowUp}
                    disabled={isSubmittingFollowUp || followUpAnswer.trim().length < 15}
                    variant="primary"
                    size="sm"
                    className="gap-1.5"
                  >
                    {isSubmittingFollowUp ? 'Evaluating Follow-up...' : 'Submit Follow-Up'}
                  </Button>
                </div>
              </div>
            )}

            {/* Completed Follow-up Notes */}
            {activeTurn.followUpAnswer && (
              <div className="p-3 rounded-lg bg-muted/40 border border-border text-xs space-y-1">
                <div className="font-semibold text-foreground">Follow-Up Answered (Score: {activeTurn.followUpScore || 80}/100)</div>
                <div className="text-muted-foreground italic">&ldquo;{activeTurn.followUpAnswer}&rdquo;</div>
              </div>
            )}
          </Card>

          {/* Action to proceed to next question */}
          {(!activeTurn.followUpQuestion || activeTurn.followUpAnswer) && (
            <div className="flex justify-end pt-2">
              <Button
                onClick={handleNextQuestion}
                disabled={isFinishing}
                variant="primary"
                size="sm"
                className="gap-2"
              >
                {isFinishing ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span>Synthesizing Final Scorecard...</span>
                  </>
                ) : isLastQuestion ? (
                  <>
                    <span>Finish Interview & View Scorecard</span>
                    <Award className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <span>Proceed to Question {activeQuestion.orderIndex + 2}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
