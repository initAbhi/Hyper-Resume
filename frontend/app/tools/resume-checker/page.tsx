'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertTriangle, XCircle, ArrowRight, Sparkles, FileText, Upload } from 'lucide-react';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';
import { analytics } from '@/lib/analytics';

export default function ResumeCheckerPage() {
  const [resumeText, setResumeText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [results, setResults] = useState<{
    score: number;
    metricsCount: number;
    actionVerbsCount: number;
    wordCount: number;
    detectedSections: string[];
    missingSections: string[];
    issues: { type: 'success' | 'warning' | 'error'; message: string }[];
  } | null>(null);

  const sampleResume = `Abhishek Singh
abhishek@example.com | +91 98765 43210 | Bengaluru, India | linkedin.com/in/abhishek-dev

PROFESSIONAL SUMMARY
Results-driven Software Engineer with 3+ years of experience building resilient microservices and distributed backend systems with TypeScript, Node.js, and PostgreSQL.

EXPERIENCE
FinTech Corp — Software Engineer (2023 – Present)
• Architected payment ingestion microservice handling 1.2M daily transactions, reducing p99 latency by 35%.
• Spearheaded migration from legacy monolith to PostgreSQL read-replicas, achieving 99.98% uptime.
• Partnered with security auditors to implement AES-256 field encryption for PCI-DSS compliance.

Tech Innovations — Associate Developer (2021 – 2023)
• Developed responsive client dashboard in Next.js, increasing daily active user retention by 18%.
• Optimized automated CI/CD pipeline in GitHub Actions, slashing build duration from 14 to 4 minutes.

EDUCATION
B.Tech in Computer Science & Engineering — 2021

SKILLS
TypeScript, Node.js, Next.js, PostgreSQL, Docker, Redis, TailwindCSS, Git`;

  const runAuditAnalysis = (textToAnalyze: string) => {
    const text = textToAnalyze.toLowerCase();
    const words = textToAnalyze.trim().split(/\s+/).filter(Boolean);
    const wordCount = words.length;

    // Detect common sections
    const standardSections = ['summary', 'experience', 'education', 'skills', 'projects'];
    const detectedSections = standardSections.filter((s) => text.includes(s));
    const missingSections = standardSections.filter((s) => !text.includes(s));

    // Action verbs check
    const actionVerbs = [
      'architected', 'developed', 'engineered', 'spearheaded', 'optimized',
      'reduced', 'increased', 'partnered', 'designed', 'built', 'created', 'led',
    ];
    const actionVerbsFound = actionVerbs.filter((v) => text.includes(v));

    // Metrics check (digits, percentages, multipliers)
    const metricsMatches = textToAnalyze.match(/\b\d+(\.\d+)?%|\b\d+x|\b\d+k|\b\d+m|\b\d+\+/gi) || [];

    // Calculate honest compatibility score
    let score = 50;
    if (detectedSections.length >= 4) score += 20;
    if (metricsMatches.length >= 3) score += 15;
    if (actionVerbsFound.length >= 4) score += 10;
    if (wordCount >= 200 && wordCount <= 700) score += 5;

    const issues: { type: 'success' | 'warning' | 'error'; message: string }[] = [];

    if (metricsMatches.length >= 3) {
      issues.push({
        type: 'success',
        message: `Found ${metricsMatches.length} quantifiable achievements (% or numbers). Excellent evidence-based impact.`,
      });
    } else {
      issues.push({
        type: 'warning',
        message: 'Low quantifiable outcomes detected. Add metrics (e.g. latency reduced by X%, users served) to prove scale.',
      });
    }

    if (actionVerbsFound.length >= 4) {
      issues.push({
        type: 'success',
        message: `Strong active leadership verbs detected (${actionVerbsFound.slice(0, 4).join(', ')}).`,
      });
    } else {
      issues.push({
        type: 'warning',
        message: 'Consider replacing passive verbs (e.g. "responsible for") with active impact verbs.',
      });
    }

    if (missingSections.length > 0) {
      issues.push({
        type: 'error',
        message: `Standard ATS section headers missing: ${missingSections.join(', ')}.`,
      });
    } else {
      issues.push({
        type: 'success',
        message: 'All standard ATS section headers present and correctly formatted.',
      });
    }

    const finalScore = Math.min(100, score);
    setResults({
      score: finalScore,
      metricsCount: metricsMatches.length,
      actionVerbsCount: actionVerbsFound.length,
      wordCount,
      detectedSections,
      missingSections,
      issues,
    });

    analytics.track('analysis_completed', {
      matchScoreBucket: finalScore >= 80 ? 'high' : finalScore >= 60 ? 'medium' : 'low',
      source: 'resume_checker',
    });
  };

  const handleAnalyze = () => {
    if (!resumeText.trim()) return;
    analytics.track('resume_checker_started', { source: 'resume_checker' });
    setIsAnalyzing(true);
    setTimeout(() => {
      runAuditAnalysis(resumeText);
      setIsAnalyzing(false);
    }, 400);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    analytics.track('resume_checker_started', { source: 'file_upload' });
    setIsUploading(true);
    setUploadError(null);

    try {
      const data = await apiClient.uploadAndParseResume(file);
      analytics.track('resume_upload_completed', {
        fileFormat: file.name.endsWith('.docx') ? 'docx' : 'pdf',
      });

      // Reconstruct formatted plain text from parsed draft
      const bullets = (data.draft.experience || []).flatMap((exp) => exp.bullets || []);
      const skills = (data.draft.skills || []).map((s) => s.name).join(', ');
      const reconstructed = `${data.draft.headline || 'Software Engineer'}\n\nSUMMARY\n${data.draft.summary || ''}\n\nEXPERIENCE\n${bullets.map((b) => `• ${b}`).join('\n')}\n\nSKILLS\n${skills}`;

      setResumeText(reconstructed);
      runAuditAnalysis(reconstructed);
    } catch (err: unknown) {
      setUploadError(
        err instanceof Error ? err.message : 'Failed to parse file. Please paste plain text.',
      );
    } finally {
      setIsUploading(false);
    }
  };


  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center max-w-3xl mx-auto mb-10">
        <Badge variant="info" className="mb-3">Free Tool</Badge>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
          Free ATS Resume Checker
        </h1>
        <p className="mt-3 text-base sm:text-lg text-zinc-600 dark:text-zinc-400">
          Analyze your resume for formatting standards, quantifiable metric density, action verbs, and section completeness without paywalls.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Input Form */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">Paste Resume Text or Upload File</CardTitle>
                <CardDescription>We analyze structure and wording without saving or training on your content.</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,application/pdf"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs gap-1"
                  disabled={isUploading}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isUploading ? 'Parsing...' : 'Upload File'}</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setResumeText(sampleResume);
                    runAuditAnalysis(sampleResume);
                  }}
                  className="text-xs"
                >
                  Sample
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {uploadError && (
                <div className="mb-3 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                  {uploadError}
                </div>
              )}
              <textarea
                rows={14}
                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-3.5 text-xs sm:text-sm font-mono text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-600 resize-y"
                placeholder="Paste your plain resume text here..."
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
              />
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-zinc-500 font-mono">
                  {resumeText.trim().split(/\s+/).filter(Boolean).length} words
                </span>
                <Button
                  variant="primary"
                  onClick={handleAnalyze}
                  isLoading={isAnalyzing}
                  disabled={!resumeText.trim()}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Analyze My Resume
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Analysis Report */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {results ? (
            <Card className="border-blue-200 dark:border-blue-900 shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Compatibility Score</CardTitle>
                  <div className="text-2xl font-black text-blue-600">
                    {results.score}/100
                  </div>
                </div>
                <CardDescription>Internal structural compatibility indicator.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                    <div className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{results.metricsCount}</div>
                    <div className="text-[10px] text-zinc-500 uppercase font-semibold">Metrics</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                    <div className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{results.actionVerbsCount}</div>
                    <div className="text-[10px] text-zinc-500 uppercase font-semibold">Action Verbs</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                    <div className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{results.detectedSections.length}/5</div>
                    <div className="text-[10px] text-zinc-500 uppercase font-semibold">Sections</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                    Key Recommendations
                  </span>
                  {results.issues.map((issue, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg text-xs flex items-start gap-2.5 border ${
                        issue.type === 'success'
                          ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                          : issue.type === 'warning'
                          ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                          : 'bg-rose-50 dark:bg-rose-950/30 text-rose-900 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                      }`}
                    >
                      {issue.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />}
                      {issue.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />}
                      {issue.type === 'error' && <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />}
                      <span>{issue.message}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
                  <Link href="/register" className="w-full block">
                    <Button variant="primary" size="sm" className="w-full justify-center">
                      <span>Create Free Account (5 Free Credits)</span>
                      <ArrowRight className="w-4 h-4 ml-1.5" />
                    </Button>
                  </Link>
                  <Link href="/tools/job-match" className="w-full block">
                    <Button variant="outline" size="sm" className="w-full justify-center">
                      <span>Match With a Job Description</span>
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-zinc-50/50 dark:bg-zinc-900/50 border-dashed">
              <CardContent className="py-16 text-center text-zinc-500 flex flex-col items-center gap-3">
                <FileText className="w-10 h-10 text-zinc-400 stroke-1" />
                <p className="text-sm">
                  Paste your resume or upload a PDF and click <br />
                  <strong className="text-zinc-700 dark:text-zinc-300">Analyze My Resume</strong> to see your report.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
