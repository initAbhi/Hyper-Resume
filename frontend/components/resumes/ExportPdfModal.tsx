'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { X, FileText, Briefcase, Bookmark, CheckCircle2, Download, Sparkles, ExternalLink } from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

interface ExportPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  resumeName: string;
  targetContainerId?: string;
}

export function ExportPdfModal({
  isOpen,
  onClose,
  resumeName,
  targetContainerId = 'resume-document-print',
}: ExportPdfModalProps) {
  const [progress, setProgress] = useState(10);
  const [statusText, setStatusText] = useState('Preparing the file');
  const [percentText, setPercentText] = useState('15% Complete...');
  const [isDone, setIsDone] = useState(false);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const isGeneratingRef = useRef(false);

  const cleanFileName = (resumeName || 'Resume').trim().replace(/[/\\?%*:|"<>]/g, '-') + '.pdf';

  useEffect(() => {
    if (!isOpen) {
      setProgress(10);
      setIsDone(false);
      setPdfBlobUrl(null);
      isGeneratingRef.current = false;
      return;
    }

    if (isGeneratingRef.current) return;
    isGeneratingRef.current = true;

    async function generatePdf() {
      try {
        setProgress(25);
        setPercentText('30% Complete...');

        // Wait brief tick for React render to stabilize
        await new Promise((r) => setTimeout(r, 200));

        const container = document.getElementById(targetContainerId);
        if (!container) {
          throw new Error('Resume container not found');
        }

        // Find all A4 page containers inside the container
        let pageElements = Array.from(
          container.querySelectorAll<HTMLElement>('.resume-page-a4')
        );

        // Fallback: If no .resume-page-a4 elements, treat the whole container as 1 page
        if (pageElements.length === 0) {
          const directChild = container.firstElementChild as HTMLElement;
          pageElements = directChild ? [directChild] : [container];
        }

        setProgress(45);
        setPercentText('50% Complete...');

        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4',
          compress: true,
        });

        const pageWidthMm = 210;
        const pageHeightMm = 297;

        for (let i = 0; i < pageElements.length; i++) {
          const pageEl = pageElements[i];

          // Capture high-DPI canvas (2x scale for crisp Rubik/Inter fonts)
          const canvas = await html2canvas(pageEl, {
            scale: 2.5,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            logging: false,
            windowWidth: 1024,
          });

          const imgData = canvas.toDataURL('image/jpeg', 0.96);

          if (i > 0) {
            pdf.addPage('a4', 'portrait');
          }

          pdf.addImage(imgData, 'JPEG', 0, 0, pageWidthMm, pageHeightMm, undefined, 'FAST');

          const stepProgress = Math.round(50 + ((i + 1) / pageElements.length) * 40);
          setProgress(stepProgress);
          setPercentText(`${stepProgress}% Complete...`);
        }

        setProgress(100);
        setPercentText('100% Complete!');
        setIsDone(true);

        // Automatically trigger download directly to user's browser
        pdf.save(cleanFileName);

        // Also create a blob URL for the manual "click here" fallback link
        const blob = pdf.output('blob');
        const url = URL.createObjectURL(blob);
        setPdfBlobUrl(url);
      } catch (err) {
        console.error('Direct PDF export error:', err);
        // Fallback: if html2canvas/jsPDF fails, fallback to window.print()
        setStatusText('Download ready');
        setPercentText('Complete');
        setIsDone(true);
      } finally {
        isGeneratingRef.current = false;
      }
    }

    generatePdf();
  }, [isOpen, targetContainerId, cleanFileName]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 space-y-6 animate-in zoom-in-95 duration-200 text-zinc-900 dark:text-zinc-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          title="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 font-rubik">
            {statusText}
          </h2>
          <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
            {percentText}
          </p>
        </div>

        {/* Animated Progress Bar (Enhancv Style) */}
        <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-3 overflow-hidden p-0.5 border border-zinc-200 dark:border-zinc-700">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Context Card */}
        <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/40 flex items-center justify-between gap-3">
          <div className="space-y-0.5 min-w-0">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              We&apos;ve added this resume to your workspace.
            </p>
            <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate">
              {resumeName || 'Untitled Resume'}
            </p>
          </div>
          <span className="shrink-0 inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
            <Bookmark className="w-3 h-3" />
            <span>Saved</span>
          </span>
        </div>

        {/* What To Do Next Section */}
        <div className="space-y-3 pt-1">
          <h3 className="text-xs font-bold tracking-wider uppercase text-zinc-500 dark:text-zinc-400 text-center">
            What to do next
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Action 1: Match with Job */}
            <Link
              href="/app/match"
              className="p-4 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50/60 dark:bg-emerald-950/20 hover:bg-emerald-50 hover:border-emerald-300 transition-all group flex flex-col justify-between space-y-2 text-left"
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Match a Job</span>
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>
                <p className="text-[11px] text-zinc-600 dark:text-zinc-300 leading-snug">
                  Compare this resume against target job postings to identify verified skill matches.
                </p>
              </div>
              <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 group-hover:underline flex items-center gap-1 pt-1">
                RUN MATCH ANALYSIS →
              </span>
            </Link>

            {/* Action 2: Practice Interview */}
            <Link
              href="/app/interview"
              className="p-4 rounded-xl border border-purple-200/80 dark:border-purple-800/60 bg-purple-50/60 dark:bg-purple-950/20 hover:bg-purple-50 hover:border-purple-300 transition-all group flex flex-col justify-between space-y-2 text-left"
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-900 dark:text-purple-200 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                    <span>Mock Interview</span>
                  </span>
                  <span className="w-2 h-2 rounded-full bg-purple-500" />
                </div>
                <p className="text-[11px] text-zinc-600 dark:text-zinc-300 leading-snug">
                  Practice STAR interview questions generated directly from your resume bullets.
                </p>
              </div>
              <span className="text-[11px] font-bold text-purple-700 dark:text-purple-300 group-hover:underline flex items-center gap-1 pt-1">
                START PRACTICE →
              </span>
            </Link>
          </div>
        </div>

        {/* Manual Download Link */}
        <div className="pt-2 text-center text-xs text-zinc-500 dark:text-zinc-400">
          <span>* If the download doesn&apos;t start automatically in a few seconds, please </span>
          {pdfBlobUrl ? (
            <a
              href={pdfBlobUrl}
              download={cleanFileName}
              className="text-emerald-600 dark:text-emerald-400 font-semibold underline hover:text-emerald-700"
            >
              click here
            </a>
          ) : (
            <button
              onClick={() => window.print()}
              className="text-emerald-600 dark:text-emerald-400 font-semibold underline hover:text-emerald-700"
            >
              click here to print
            </button>
          )}
          <span>.</span>
        </div>
      </div>
    </div>
  );
}
