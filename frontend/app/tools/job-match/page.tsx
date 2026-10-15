'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertTriangle, XCircle, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function JobMatchToolPage() {
  const [resumeText, setResumeText] = useState('');
  const [jobText, setJobText] = useState('');
  const [isMatching, setIsMatching] = useState(false);
  const [matchResult, setMatchResult] = useState<{
    score: number;
    supported: string[];
    needsConfirmation: string[];
    notEvidenced: string[];
  } | null>(null);

  const sampleResume = `Experienced Full Stack Engineer with expertise in React, Next.js, TypeScript, Node.js, and PostgreSQL. Built scalable microservices, integrated payment gateways, and managed Docker deployments on AWS.`;
  const sampleJob = `We are seeking a Senior Full Stack Engineer. Must have strong TypeScript, React, Next.js, and PostgreSQL skills. Experience with Redis, Kubernetes, and GraphQL is highly preferred.`;

  const handleMatch = () => {
    if (!resumeText.trim() || !jobText.trim()) return;
    setIsMatching(true);

    setTimeout(() => {
      const resLower = resumeText.toLowerCase();
      const jobLower = jobText.toLowerCase();

      const candidateSkills = [
        'typescript', 'react', 'next.js', 'node.js', 'postgresql', 'docker', 'aws', 'python', 'java',
        'redis', 'kubernetes', 'graphql', 'tailwind', 'git', 'microservices', 'rest api', 'sql'
      ];

      const jobRequirements = candidateSkills.filter((s) => jobLower.includes(s));

      const supported: string[] = [];
      const needsConfirmation: string[] = [];
      const notEvidenced: string[] = [];

      jobRequirements.forEach((req) => {
        if (resLower.includes(req)) {
          supported.push(req);
        } else if (req === 'redis' || req === 'kubernetes' || req === 'graphql') {
          needsConfirmation.push(req);
        } else {
          notEvidenced.push(req);
        }
      });

      const total = jobRequirements.length || 1;
      const score = Math.round((supported.length / total) * 100);

      setMatchResult({
        score,
        supported,
        needsConfirmation,
        notEvidenced,
      });
      setIsMatching(false);
    }, 600);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center max-w-3xl mx-auto mb-10">
        <Badge variant="info" className="mb-3">Free Tool</Badge>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
          Truthful Job-to-Resume Matcher
        </h1>
        <p className="mt-3 text-base sm:text-lg text-zinc-600 dark:text-zinc-400">
          Compare candidate evidence against target job requirements. See what is verified, what requires confirmation, and what is missing.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-base">1. Your Resume</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setResumeText(sampleResume)}
              className="text-xs"
            >
              Load Sample
            </Button>
          </CardHeader>
          <CardContent>
            <textarea
              rows={8}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-3 text-xs sm:text-sm font-mono text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-600 resize-y"
              placeholder="Paste your resume skills & experience..."
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
              onClick={() => setJobText(sampleJob)}
              className="text-xs"
            >
              Load Sample
            </Button>
          </CardHeader>
          <CardContent>
            <textarea
              rows={8}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-3 text-xs sm:text-sm font-mono text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-600 resize-y"
              placeholder="Paste the job description here..."
              value={jobText}
              onChange={(e) => setJobText(e.target.value)}
            />
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center mb-10">
        <Button
          size="lg"
          variant="primary"
          onClick={handleMatch}
          isLoading={isMatching}
          disabled={!resumeText.trim() || !jobText.trim()}
          className="px-8 shadow-md"
        >
          <Sparkles className="w-5 h-5 mr-2" />
          Analyze Compatibility
        </Button>
      </div>

      {matchResult && (
        <Card className="border-blue-200 dark:border-blue-900 shadow-lg">
          <CardHeader className="border-b border-zinc-100 dark:border-zinc-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-xl">Evidence Compatibility Analysis</CardTitle>
                <CardDescription>
                  Compatibility indicator based on real extracted requirements.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-extrabold text-blue-600">{matchResult.score}%</span>
                <span className="text-xs text-zinc-500 uppercase font-semibold">Match Score</span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 pt-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                  Supported with Candidate Evidence ({matchResult.supported.length})
                </h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {matchResult.supported.map((skill) => (
                  <Badge key={skill} variant="success" className="capitalize text-xs py-1 px-3">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>

            {matchResult.needsConfirmation.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                    Needs Candidate Confirmation ({matchResult.needsConfirmation.length})
                  </h4>
                </div>
                <p className="text-xs text-zinc-500 mb-2">
                  Requested in job description, but not explicitly verified in your resume. HyperResume will never invent these for you.
                </p>
                <div className="flex flex-wrap gap-2">
                  {matchResult.needsConfirmation.map((skill) => (
                    <Badge key={skill} variant="warning" className="capitalize text-xs py-1 px-3">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {matchResult.notEvidenced.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <XCircle className="w-4 h-4 text-rose-600" />
                  <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                    Not Evidenced in Profile ({matchResult.notEvidenced.length})
                  </h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {matchResult.notEvidenced.map((skill) => (
                    <Badge key={skill} variant="destructive" className="capitalize text-xs py-1 px-3">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
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
