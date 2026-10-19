'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Mic, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  MessageSquare, 
  Volume2, 
  Award, 
  Bot, 
  Clock, 
  Bell, 
  Check, 
  FileText,
  Target
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function AiInterviewPage() {
  const [isNotified, setIsNotified] = useState(false);

  return (
    <div className="max-w-5xl mx-auto space-y-10 py-6">
      
      {/* Top Banner / Hero */}
      <div className="relative rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 sm:p-12 shadow-sm overflow-hidden text-center sm:text-left">
        {/* Soft background glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-200/60 dark:border-blue-900 text-blue-700 dark:text-blue-300 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span>Coming Soon • Private Beta</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
            AI Mock Interviewer & Speech Coach
          </h1>

          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Practice role-specific behavioral and technical interviews generated directly from your tailored resume and target job descriptions. Get actionable real-time feedback on STAR method articulation and executive presence.
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

      {/* Feature Architecture Preview */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-600" />
          <span>What to expect in HyperResume Interview Coach</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center font-bold">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
              STAR Method Grading
            </h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Every answer is evaluated on Situation, Task, Action, and measurable Results. Instantly identify missing metrics before speaking with hiring managers.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 flex items-center justify-center font-bold">
              <Volume2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
              Cadence & Tone Analysis
            </h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Real-time voice AI flags filler words (&quot;um&quot;, &quot;like&quot;, &quot;you know&quot;), pacing bottlenecks, and offers suggestions to sound clear and authoritative.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center font-bold">
              <Target className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
              Job-Specific Question Bank
            </h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Paste your target job posting to face realistic technical queries, architectural challenges, and recruiter screening questions tailored to that exact team.
            </p>
          </div>
        </div>
      </div>

      {/* Simulated Question Card Mockup */}
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
            &quot;Looking at your experience at ClearPath Analytics, can you walk me through how you designed and evaluated the checkout pricing A/B experiments that yielded $180K ARR?&quot;
          </p>
        </div>

        <div className="flex items-center justify-between pt-2 text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Voice & Audio Input Enabled in Beta</span>
          </div>
          <span className="font-semibold text-blue-600">Expected Response: 90–120s</span>
        </div>
      </div>

    </div>
  );
}
