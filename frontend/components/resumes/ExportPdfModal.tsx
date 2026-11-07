'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { X, FileText, Briefcase, Bookmark, Eye } from 'lucide-react';
import * as htmlToImage from 'html-to-image';
import { jsPDF } from 'jspdf';

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
  const [progress, setProgress] = useState(20);
  const [isDone, setIsDone] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const isGeneratingRef = useRef(false);

  const cleanFileName = (resumeName || 'Resume').trim().replace(/[/\\?%*:|"<>]/g, '-') + '.pdf';

  const triggerDownload = useCallback((blobUrl: string) => {
    try {
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = cleanFileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (e) {
      console.warn('Auto download failed, fallback to manual click', e);
    }
  }, [cleanFileName]);

  const runExport = useCallback(async () => {
    try {
      setErrorMessage(null);
      setProgress(25);

      // Brief tick for DOM layout
      await new Promise((r) => setTimeout(r, 200));

      const container = document.getElementById(targetContainerId);
      if (!container) {
        throw new Error('Resume container not found');
      }

      // Collect all discrete A4 pages
      let pageElements = Array.from(
        container.querySelectorAll<HTMLElement>('.resume-page-a4')
      );

      if (pageElements.length === 0) {
        const directChild = container.firstElementChild as HTMLElement;
        pageElements = directChild ? [directChild] : [container];
      }

      setProgress(40);

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

        // High-fidelity capture via html-to-image (native browser SVG pipeline, supports oklch/lab/custom fonts)
        const dataUrl = await htmlToImage.toPng(pageEl, {
          quality: 0.98,
          pixelRatio: 2, // 2x DPI for crisp text
          backgroundColor: '#ffffff',
          cacheBust: true,
          filter: (node) => {
            // Skip any print:hidden or modal elements that might be inside
            if (node instanceof HTMLElement && node.classList.contains('print:hidden')) {
              return false;
            }
            return true;
          },
        });

        if (i > 0) {
          pdf.addPage('a4', 'portrait');
        }

        pdf.addImage(dataUrl, 'PNG', 0, 0, pageWidthMm, pageHeightMm, undefined, 'FAST');

        const stepProgress = Math.min(95, Math.round(40 + ((i + 1) / pageElements.length) * 50));
        setProgress(stepProgress);
      }

      setProgress(100);
      setIsDone(true);

      // Generate blob for direct file download
      const blob = pdf.output('blob');
      const blobUrl = URL.createObjectURL(blob);
      setPdfBlobUrl(blobUrl);

      // Trigger native file download
      triggerDownload(blobUrl);
    } catch (err: unknown) {
      console.error('PDF Export Error:', err);
      setErrorMessage(err instanceof Error ? err.message : 'Failed to generate PDF');
      setProgress(100);
      setIsDone(true);
    } finally {
      isGeneratingRef.current = false;
    }
  }, [targetContainerId, triggerDownload]);

  useEffect(() => {
    if (!isOpen) {
      setProgress(20);
      setIsDone(false);
      setErrorMessage(null);
      setPdfBlobUrl(null);
      isGeneratingRef.current = false;
      return;
    }

    if (isGeneratingRef.current) return;
    isGeneratingRef.current = true;
    runExport();
  }, [isOpen, runExport]);

  if (!isOpen) return null;

  return (
    <div
      id="export-pdf-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs print:hidden animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[460px] bg-white rounded-2xl shadow-xl border border-zinc-200 p-6 space-y-5 animate-in zoom-in-95 duration-200 text-zinc-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors"
          title="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header (Exact Enhancv Copy & Hierarchy) */}
        <div className="text-center space-y-1">
          <h2 className="text-xl font-bold tracking-tight text-zinc-900 font-rubik">
            Preparing the file
          </h2>
          <p className="text-xs font-semibold text-[#00c599]">
            {isDone ? '100% Complete!' : `${progress}% Complete...`}
          </p>
        </div>

        {/* Sleek Teal Progress Bar (Enhancv 1:1) */}
        <div className="w-full bg-zinc-100 rounded-full h-2.5 overflow-hidden">
          <div
            className="h-full bg-[#00c599] rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Context Card: Saved Role & Bookmark */}
        <div className="p-3.5 rounded-xl border border-zinc-100 bg-zinc-50/70 flex items-center justify-between gap-3">
          <div className="space-y-0.5 min-w-0">
            <p className="text-[11px] text-zinc-500">
              We&apos;ve added this role to your <strong className="text-zinc-700 font-semibold">Saved Jobs</strong>.
            </p>
            <p className="text-[11px] text-zinc-400">
              Staying organized keeps every opportunity within reach.
            </p>
          </div>

          <div className="shrink-0 text-right space-y-1">
            <div className="text-[11px] font-semibold text-zinc-800 truncate max-w-[130px]">
              {resumeName || 'Resume'}
            </div>
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-purple-100 text-purple-700 border border-purple-200">
              <Bookmark className="w-2.5 h-2.5" />
              <span>Bookmarked</span>
            </span>
          </div>
        </div>

        {/* What To Do Next Section */}
        <div className="space-y-2.5 pt-1">
          <h3 className="text-[11px] font-bold tracking-wider uppercase text-zinc-400 text-center font-rubik">
            What to do next
          </h3>

          <div className="grid grid-cols-2 gap-2.5">
            {/* Card 1: Add Cover Letter */}
            <Link
              href="/app/match"
              className="p-3.5 rounded-xl border border-emerald-100 bg-[#f0fdf9] hover:bg-[#e6faf4] transition-all group flex flex-col justify-between space-y-2 text-left relative"
            >
              <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-900">
                  <FileText className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Add Cover Letter</span>
                </div>
                <p className="text-[10px] text-zinc-500 leading-snug">
                  Create a cover letter that complements your resume and boosts your application.
                </p>
              </div>
              <span className="text-[10px] font-bold text-emerald-600 group-hover:underline pt-1">
                GENERATE COVER LETTER &gt;
              </span>
            </Link>

            {/* Card 2: Find More Jobs */}
            <Link
              href="/app/match"
              className="p-3.5 rounded-xl border border-purple-100 bg-[#faf5ff] hover:bg-[#f3e8ff] transition-all group flex flex-col justify-between space-y-2 text-left relative"
            >
              <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full bg-purple-500" />
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-900">
                  <Briefcase className="w-3.5 h-3.5 text-purple-600" />
                  <span>Find More Jobs</span>
                </div>
                <p className="text-[10px] text-zinc-500 leading-snug">
                  Find relevant roles to apply to using your new resume.
                </p>
              </div>
              <span className="text-[10px] font-bold text-purple-600 group-hover:underline pt-1">
                BROWSE JOBS &gt;
              </span>
            </Link>
          </div>
        </div>

        {/* Manual Direct Download Link (Fallback) */}
        <div className="pt-1 text-center text-[11px] text-zinc-400">
          <span>* If the download doesn&apos;t start automatically in a few seconds, please </span>
          {pdfBlobUrl ? (
            <button
              onClick={() => triggerDownload(pdfBlobUrl)}
              className="text-[#00c599] font-semibold underline hover:text-emerald-700 cursor-pointer"
            >
              click here
            </button>
          ) : (
            <button
              onClick={runExport}
              className="text-[#00c599] font-semibold underline hover:text-emerald-700 cursor-pointer"
            >
              click here to retry
            </button>
          )}
          <span>.</span>
        </div>

        {errorMessage && (
          <div className="text-[11px] text-rose-600 text-center bg-rose-50 p-2 rounded-lg border border-rose-100">
            {errorMessage}
          </div>
        )}
      </div>
    </div>
  );
}
