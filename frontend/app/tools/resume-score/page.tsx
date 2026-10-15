import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, CheckCircle2, ShieldAlert } from 'lucide-react';
import { constructMetadata } from '@/lib/seo';

export const metadata = constructMetadata({
  title: 'Resume Score & ATS Audit',
  description: 'Understand how recruitment software parses your resume. Real feedback on formatting, keyword density, and experience metrics.',
  path: '/tools/resume-score',
});

export default function ResumeScorePage() {
  const scoreDimensions = [
    {
      title: 'ATS Formatting & Hierarchy',
      desc: 'Checks if section headers (Experience, Education, Skills) follow ISO/standard naming conventions and avoid unreadable multi-column tables.',
      weight: '25%',
    },
    {
      title: 'Quantified Metrics & Impact',
      desc: 'Measures density of verifiable metrics (percentages, revenue, throughput, latency) rather than generic duties.',
      weight: '25%',
    },
    {
      title: 'Action Verb Dominance',
      desc: 'Evaluates the ratio of active leadership verbs (Architected, Spearheaded, Engineered) versus passive responsibilities.',
      weight: '20%',
    },
    {
      title: 'Technical Depth & Stack Alignment',
      desc: 'Checks that technical skills mentioned in project sections align with candidate tools listed in your core profile.',
      weight: '15%',
    },
    {
      title: 'Brevity & Information Density',
      desc: 'Identifies fluff words, buzzwords, and redundant phrases that bloat page count without adding evidence.',
      weight: '15%',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <Badge variant="info" className="mb-3">Scoring Framework</Badge>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
          How HyperResume Scores Resumes
        </h1>
        <p className="mt-3 text-base text-zinc-600 dark:text-zinc-400">
          No black boxes. No fake hiring percentages. We evaluate 5 objective dimensions of technical resume quality.
        </p>
      </div>

      <div className="space-y-4 mb-10">
        {scoreDimensions.map((dim, idx) => (
          <Card key={idx}>
            <CardHeader className="py-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  {dim.title}
                </CardTitle>
                <Badge variant="neutral" className="text-xs font-mono">Weight: {dim.weight}</Badge>
              </div>
              <CardDescription className="text-xs sm:text-sm mt-1">{dim.desc}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-900 text-center flex flex-col items-center gap-4">
        <ShieldAlert className="w-8 h-8 text-blue-600" />
        <div>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            Audit Your Resume with the Free Checker
          </h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-md mx-auto mt-1">
            Get an instant score breakdown and actionable line-by-line feedback in under 10 seconds.
          </p>
        </div>
        <Link href="/tools/resume-checker">
          <Button variant="primary" size="md">
            Check My Resume Now
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
