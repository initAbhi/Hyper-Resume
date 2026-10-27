'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Mic, 
  Sparkles, 
  CheckCircle2, 
  MessageSquare, 
  Volume2, 
  Clock, 
  Bell, 
  Check, 
  Target
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function AiInterviewPage() {
  const [isNotified, setIsNotified] = useState(false);

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      {/* Top Banner */}
      <div className="rounded-xl border border-border bg-card p-6 sm:p-8 shadow-xs">
        <div className="max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-muted text-muted-foreground text-xs font-medium border border-border">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
            <span>Planned Feature · In Design</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Role-Specific Interview Practice
          </h1>

          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Practice behavioral and architectural interview scenarios tailored directly to your resume achievements and target job requirements. Receive feedback on STAR structure, quantifiable impact articulation, and clarity.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
            <Button
              onClick={() => setIsNotified(!isNotified)}
              variant="primary"
              size="sm"
              className="gap-2"
            >
              {isNotified ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Subscribed for Updates</span>
                </>
              ) : (
                <>
                  <Bell className="w-3.5 h-3.5" />
                  <span>Notify Me When Available</span>
                </>
              )}
            </Button>

            <Link href="/app/resumes">
              <Button variant="outline" size="sm">
                Back to My Resumes
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Feature Capabilities Overview */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Planned Capabilities
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-card border border-border shadow-xs space-y-2">
            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-foreground font-bold">
              <MessageSquare className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-sm text-foreground">
              STAR Structure Verification
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Checks spoken or written responses for Situation, Task, Action, and measurable business Outcome before speaking with recruiters.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-card border border-border shadow-xs space-y-2">
            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-foreground font-bold">
              <Volume2 className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-sm text-foreground">
              Conciseness & Filler Detection
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Flags excessive jargon, hesitation, and meandering answers to keep explanations crisp and focused.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-card border border-border shadow-xs space-y-2">
            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-foreground font-bold">
              <Target className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-sm text-foreground">
              Targeted Role Question Bank
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Generates questions based on the specific tech stack and leadership responsibilities in your target job description.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
