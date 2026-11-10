'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowRight,
  Sparkles,
  FileText,
  Upload,
  Minimize2,
  RefreshCw,
  FileCheck2,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { apiClient, PdfCompressionResponse } from '@/lib/api-client';
import { analytics } from '@/lib/analytics';

export type CheckerState =
  | 'IDLE'
  | 'FILE_SELECTED'
  | 'VALIDATING'
  | 'SIZE_LIMIT_EXCEEDED'
  | 'COMPRESSION_CONFIRMATION'
  | 'COMPRESSING'
  | 'VERIFYING'
  | 'COMPRESSION_SUCCESS'
  | 'COMPRESSION_FAILED'
  | 'ATS_ANALYSIS_IN_PROGRESS'
  | 'COMPLETED';

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export const MAX_UPLOAD_LIMIT_BYTES = 10 * 1024 * 1024; // 10 MB

export default function ResumeCheckerPage() {
  const [resumeText, setResumeText] = useState('');
  const [checkerState, setCheckerState] = useState<CheckerState>('IDLE');
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [compressionMeta, setCompressionMeta] = useState<PdfCompressionResponse | null>(null);
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
      'architected',
      'developed',
      'engineered',
      'spearheaded',
      'optimized',
      'reduced',
      'increased',
      'partnered',
      'designed',
      'built',
      'created',
      'led',
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
    setCheckerState('ATS_ANALYSIS_IN_PROGRESS');
    setTimeout(() => {
      runAuditAnalysis(resumeText);
      setCheckerState('COMPLETED');
    }, 400);
  };

  /**
   * File selection handler with upfront size limit inspection
   */
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setCompressionMeta(null);
    setPendingFile(file);

    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

    // Scenario B: File exceeds 10 MB limit
    if (file.size > MAX_UPLOAD_LIMIT_BYTES) {
      if (!isPdf) {
        setUploadError(
          `Your file is ${formatFileSize(file.size)}, which exceeds our 10 MB upload limit. Smart optimization is currently supported for PDF files only.`,
        );
        setCheckerState('IDLE');
        return;
      }

      // Display compression consent prompt
      setCheckerState('COMPRESSION_CONFIRMATION');
      return;
    }

    // Scenario A: File is within 10 MB limit -> Normal flow unchanged
    setCheckerState('ATS_ANALYSIS_IN_PROGRESS');
    analytics.track('resume_checker_started', { source: 'file_upload' });

    try {
      const data = await apiClient.uploadAndParseResume(file);
      analytics.track('resume_upload_completed', {
        fileFormat: file.name.endsWith('.docx') ? 'docx' : 'pdf',
      });

      const bullets = (data.draft.experience || []).flatMap((exp) => exp.bullets || []);
      const skills = (data.draft.skills || []).map((s) => s.name).join(', ');
      const reconstructed = `${data.draft.headline || 'Software Engineer'}\n\nSUMMARY\n${data.draft.summary || ''}\n\nEXPERIENCE\n${bullets.map((b) => `• ${b}`).join('\n')}\n\nSKILLS\n${skills}`;

      setResumeText(reconstructed);
      runAuditAnalysis(reconstructed);
      setCheckerState('COMPLETED');
    } catch (err: unknown) {
      setUploadError(
        err instanceof Error ? err.message : 'Failed to parse file. Please paste plain text.',
      );
      setCheckerState('IDLE');
    }
  };

  /**
   * Compress and Continue handler triggered when user consents
   */
  const handleCompressAndContinue = async () => {
    if (!pendingFile) return;

    // Prevent duplicate compression requests
    if (checkerState === 'COMPRESSING' || checkerState === 'VERIFYING') return;

    setCheckerState('COMPRESSING');
    setUploadError(null);

    // Provide transition feedback for verification phase
    const verifyTimer = setTimeout(() => {
      setCheckerState('VERIFYING');
    }, 1200);

    try {
      const result = await apiClient.compressAndParseResume(pendingFile);
      clearTimeout(verifyTimer);
      setCompressionMeta(result);

      // Scenario D: Compression failed to reach 10 MB or failed verification
      if (!result.success || !result.withinUploadLimit || !result.parsed) {
        setCheckerState('COMPRESSION_FAILED');
        return;
      }

      // Scenario C: Compression succeeded and verified!
      setCheckerState('COMPRESSION_SUCCESS');

      analytics.track('resume_upload_completed', {
        fileFormat: 'pdf',
      });

      const bullets = (result.parsed.draft.experience || []).flatMap((exp) => exp.bullets || []);
      const skills = (result.parsed.draft.skills || []).map((s) => s.name).join(', ');
      const reconstructed = `${result.parsed.draft.headline || 'Software Engineer'}\n\nSUMMARY\n${result.parsed.draft.summary || ''}\n\nEXPERIENCE\n${bullets.map((b) => `• ${b}`).join('\n')}\n\nSKILLS\n${skills}`;

      setResumeText(reconstructed);
      runAuditAnalysis(reconstructed);

      // Allow user to see the success stats banner
      setCheckerState('COMPLETED');
    } catch (err: unknown) {
      clearTimeout(verifyTimer);
      setCheckerState('COMPRESSION_FAILED');
      setUploadError(
        err instanceof Error
          ? err.message
          : 'Could not complete PDF compression. Please check that the PDF is valid and not password-protected.',
      );
    }
  };

  const handleCancelCompression = () => {
    setPendingFile(null);
    setUploadError(null);
    setCompressionMeta(null);
    setCheckerState('IDLE');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const isProcessing =
    checkerState === 'COMPRESSING' ||
    checkerState === 'VERIFYING' ||
    checkerState === 'ATS_ANALYSIS_IN_PROGRESS';

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
        {/* Left Column: Input Form & Compression UX */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {/* Scenario B: Compression Confirmation Prompt */}
          {checkerState === 'COMPRESSION_CONFIRMATION' && pendingFile && (
            <Card className="border-amber-300 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20 shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 shrink-0">
                    <Minimize2 className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base text-zinc-900 dark:text-zinc-100">
                      Your resume exceeds the upload limit
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                      Your PDF is <strong className="text-zinc-900 dark:text-zinc-200">{formatFileSize(pendingFile.size)}</strong>, while our maximum upload size is 10 MB. We can optimize your PDF to reduce its file size so you can continue with ATS analysis.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 rounded-lg bg-white dark:bg-zinc-900 border border-amber-200 dark:border-amber-900/60 text-xs grid grid-cols-3 gap-2 text-center">
                  <div>
                    <span className="text-zinc-500 block text-[10px] uppercase font-semibold">File Name</span>
                    <span className="font-medium text-zinc-800 dark:text-zinc-200 truncate block" title={pendingFile.name}>
                      {pendingFile.name}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px] uppercase font-semibold">Original Size</span>
                    <span className="font-bold text-amber-600 dark:text-amber-400">
                      {formatFileSize(pendingFile.size)}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px] uppercase font-semibold">Target Limit</span>
                    <span className="font-medium text-zinc-700 dark:text-zinc-300">
                      10 MB
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
                  <Button
                    variant="primary"
                    onClick={handleCompressAndContinue}
                    className="w-full sm:w-auto text-xs gap-1.5"
                  >
                    <Minimize2 className="w-4 h-4" />
                    <span>Compress & Continue</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCancelCompression}
                    className="w-full sm:w-auto text-xs"
                  >
                    Cancel / Choose Another File
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Processing States: Compressing & Verifying */}
          {(checkerState === 'COMPRESSING' || checkerState === 'VERIFYING') && (
            <Card className="border-blue-200 dark:border-blue-900 bg-blue-50/40 dark:bg-blue-950/20">
              <CardContent className="py-6 space-y-3">
                <div className="flex items-center gap-3">
                  <Loader2 className="w-5 h-5 text-blue-600 animate-spin shrink-0" />
                  <div className="space-y-0.5">
                    <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      {checkerState === 'COMPRESSING'
                        ? 'Optimizing PDF structure & embedded images...'
                        : 'Verifying structural & text integrity...'}
                    </h4>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {checkerState === 'COMPRESSING'
                        ? 'Losslessly compressing streams and scaling heavy raster graphics while preserving all fonts and layout.'
                        : 'Validating PDF parseability, page count consistency, and ATS text extraction.'}
                    </p>
                  </div>
                </div>

                {/* Accessible native semantic progress bar */}
                <progress
                  className="w-full h-1.5 rounded-full overflow-hidden appearance-none accent-blue-600 bg-blue-100 dark:bg-blue-950"
                  aria-label="PDF compression progress"
                />

                <div role="status" aria-live="polite" className="sr-only">
                  {checkerState === 'COMPRESSING'
                    ? 'Compressing resume PDF in progress.'
                    : 'Verifying compressed resume integrity.'}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Scenario D & Failure State */}
          {checkerState === 'COMPRESSION_FAILED' && (
            <Card className="border-rose-300 dark:border-rose-800 bg-rose-50/50 dark:bg-rose-950/20">
              <CardContent className="py-5 space-y-3">
                <div className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold text-rose-900 dark:text-rose-200">
                      {compressionMeta && !compressionMeta.withinUploadLimit
                        ? 'Size Limit Not Reached'
                        : 'Compression Incomplete'}
                    </h4>
                    <p className="text-xs text-rose-700 dark:text-rose-300">
                      {compressionMeta?.message ||
                        uploadError ||
                        'We optimized your resume, but its size is still above our 10 MB limit. You can try another file or use a more optimized PDF.'}
                    </p>
                    {compressionMeta && (
                      <div className="text-xs text-zinc-600 dark:text-zinc-400 mt-2 font-mono">
                        Original: {formatFileSize(compressionMeta.originalSize)} → Compressed: {formatFileSize(compressionMeta.compressedSize)} (-{compressionMeta.reductionPercentage}%)
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCompressAndContinue}
                    className="text-xs gap-1"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Retry</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setPendingFile(null);
                      setCheckerState('IDLE');
                      fileInputRef.current?.click();
                    }}
                    className="text-xs"
                  >
                    Upload Another PDF
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCancelCompression}
                    className="text-xs"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Scenario C: Compression Success Banner */}
          {compressionMeta?.success && compressionMeta.withinUploadLimit && (
            <div className="p-3.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-emerald-900 dark:text-emerald-200 font-medium">
                  Your resume has been successfully optimized ({formatFileSize(compressionMeta.originalSize)} → {formatFileSize(compressionMeta.compressedSize)}, -{compressionMeta.reductionPercentage}%).
                </span>
              </div>
              <Badge variant="success" className="text-[10px] shrink-0">
                Verified ATS Ready
              </Badge>
            </div>
          )}

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
                  disabled={isProcessing}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isProcessing ? 'Processing...' : 'Upload File'}</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setResumeText(sampleResume);
                    runAuditAnalysis(sampleResume);
                  }}
                  className="text-xs"
                  disabled={isProcessing}
                >
                  Sample
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {uploadError && checkerState !== 'COMPRESSION_FAILED' && (
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
                  isLoading={checkerState === 'ATS_ANALYSIS_IN_PROGRESS'}
                  disabled={!resumeText.trim() || isProcessing}
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
                <div className="grid grid-cols-3 gap-1.5 sm:gap-2 text-center">
                  <div className="p-2 sm:p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                    <div className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100">{results.metricsCount}</div>
                    <div className="text-[9.5px] sm:text-[10px] text-zinc-500 uppercase font-semibold truncate">Metrics</div>
                  </div>
                  <div className="p-2 sm:p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                    <div className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100">{results.actionVerbsCount}</div>
                    <div className="text-[9.5px] sm:text-[10px] text-zinc-500 uppercase font-semibold truncate">Action Verbs</div>
                  </div>
                  <div className="p-2 sm:p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                    <div className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100">{results.detectedSections.length}/5</div>
                    <div className="text-[9.5px] sm:text-[10px] text-zinc-500 uppercase font-semibold truncate">Sections</div>
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
