'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AlertCircle, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { apiClient, type PlainTextAtsAuditResponse } from '@/lib/api-client';
import { AtsAuditBreakdown } from '@/components/resumes/AtsAuditBreakdown';

const BENCHMARK_SAMPLE = `Abhishek Singh
abhishek@example.com | +91 98765 43210 | linkedin.com/in/abhishek-dev

PROFESSIONAL SUMMARY
Distributed Backend Engineer with 4+ years building resilient microservices and low-latency APIs using TypeScript, Node.js, PostgreSQL, and Redis.

EXPERIENCE
FinTech Corp — Senior Backend Engineer (2023-01 – Present)
• Architected payment ingestion pipeline in TypeScript and PostgreSQL handling 1.2M daily transactions, cutting p99 latency by 35%.
• Spearheaded Redis read-through caching tier across 180K merchants, achieving 99.98% uptime and lowering database load by 42%.

Tech Innovations — Software Engineer (2021-06 – 2022-12)
• Developed customer billing portal in Next.js, lifting self-serve conversion by 19%.
• Optimized automated CI/CD workflows in GitHub Actions and Docker, shrinking build duration from 14 to 4 minutes.

EDUCATION
B.Tech Computer Science — 2021

SKILLS
TypeScript, Node.js, Next.js, PostgreSQL, Redis, Docker, GitHub Actions`;

export function ResumeScoreInteractiveAudit() {
  const [resumeText, setResumeText] = useState(BENCHMARK_SAMPLE);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [auditResult, setAuditResult] = useState<PlainTextAtsAuditResponse | null>(null);

  const handleEvaluate = async () => {
    if (resumeText.trim().length < 25) return;
    setIsEvaluating(true);
    setErrorMessage(null);

    try {
      const res = await apiClient.auditPlainTextResume({
        resumeText: resumeText.trim(),
      });
      setAuditResult(res);
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'Unable to calculate live 5-dimension ATS score right now.',
      );
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <Card className="border-blue-200 dark:border-blue-900 shadow-sm mb-10" data-testid="resume-score-interactive">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Test the 5-Dimension Scoring Formula Live</CardTitle>
        <CardDescription>
          Run the real backend ATS evaluation across these exact 5 dimension weights on our sample or your own resume copy.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <textarea
          rows={8}
          value={resumeText}
          onChange={(e) => setResumeText(e.target.value)}
          placeholder="Paste plain resume text to evaluate across the 5 weighted dimensions..."
          className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-3 text-xs sm:text-sm font-mono text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-600 resize-y"
        />

        {errorMessage && (
          <div
            role="alert"
            className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button
            variant="primary"
            onClick={handleEvaluate}
            isLoading={isEvaluating}
            disabled={resumeText.trim().length < 25}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Run Live 5-Dimension Audit
          </Button>
          <Link href="/tools/resume-checker">
            <Button variant="outline" size="sm">
              Upload PDF / DOCX in Full Checker
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </Link>
        </div>

        {auditResult && (
          <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800">
            <AtsAuditBreakdown
              score={auditResult.score}
              findings={auditResult.findings}
              recommendations={auditResult.recommendations}
              showScoreRing
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

