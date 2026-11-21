'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import {
  FileText,
  Upload,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Download,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api-client';
import { generateLatexFromResume } from '@/lib/latex-generator';

export default function LinkedInPdfToResumeToolPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importedResume, setImportedResume] = useState<any | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    if (!selected.name.toLowerCase().endsWith('.pdf')) {
      setError('Please upload a valid LinkedIn PDF file (exported from your LinkedIn profile).');
      return;
    }
    setError(null);
    setFile(selected);
  };

  const handleConvert = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError(null);
    try {
      const res = await apiClient.importLinkedInPdf(file);
      setImportedResume(res);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'Could not parse LinkedIn PDF. Ensure it was exported directly from LinkedIn using "More -> Save to PDF".',
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadTex = () => {
    if (!importedResume?.content) return;
    const tex = generateLatexFromResume(importedResume.content);
    const blob = new Blob([tex], { type: 'text/x-tex;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(importedResume.content.contact?.fullName || 'LinkedIn_Resume').replace(/\s+/g, '_')}.tex`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>100% Free · No Watermarks · Jake's Resume Standard</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
            Convert LinkedIn PDF to ATS Resume
          </h1>
          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto">
            LinkedIn's default PDF export is multi-column and often fails enterprise ATS parsers. Convert it into a clean, single-column vector resume in seconds.
          </p>
        </div>

        {/* Upload Card */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xl p-6 sm:p-8 space-y-6">
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
              file
                ? 'border-blue-500 bg-blue-50/20 dark:bg-blue-950/20'
                : 'border-zinc-300 dark:border-zinc-700 hover:border-blue-400 dark:hover:border-blue-600'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={handleFileChange}
            />
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {file ? file.name : 'Click to select or drag your LinkedIn Profile PDF'}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  On LinkedIn: Click your profile ➔ "More" ➔ "Save to PDF"
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              type="button"
              disabled={!file || isProcessing}
              onClick={handleConvert}
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-md"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  <span>Parsing LinkedIn Structure...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  <span>Convert to ATS Resume</span>
                </>
              )}
            </Button>
          </div>

          {importedResume && (
            <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800 space-y-4 animate-in fade-in">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-sm">
                <CheckCircle2 className="w-5 h-5" />
                <span>Conversion Complete! Candidate: {importedResume.content?.contact?.fullName}</span>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                Extracted {importedResume.content?.experience?.length || 0} roles, {importedResume.content?.education?.length || 0} education items, and {importedResume.content?.skills?.length || 0} skills into single-column ATS vector structure.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href={`/app/resumes/${importedResume.id || ''}`}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 text-xs font-semibold"
                >
                  <FileText className="w-4 h-4" />
                  <span>Open in Visual ATS Builder</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <button
                  type="button"
                  onClick={handleDownloadTex}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-semibold"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Jake's LaTeX (.tex)</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 space-y-1">
            <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mx-auto" />
            <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">100% Parsable</h3>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Reads cleanly across Workday, Greenhouse & Lever</p>
          </div>
          <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 space-y-1">
            <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400 mx-auto" />
            <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">AI Tailoring Ready</h3>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">One-click AI bullet enhancement with STAR formula</p>
          </div>
          <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 space-y-1">
            <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400 mx-auto" />
            <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Overleaf & Word</h3>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Export in Vector PDF, Word (.docx), or LaTeX (.tex)</p>
          </div>
        </div>
      </div>
    </div>
  );
}

