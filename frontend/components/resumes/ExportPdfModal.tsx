'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  X,
  FileText,
  Briefcase,
  CheckCircle2,
  Download,
  ExternalLink,
  Printer,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { apiClient, downloadExportBlob } from '@/lib/api-client';
import { analytics } from '@/lib/analytics';
import { buildVectorPdfPayload } from '@/lib/pdf-html-serializer';

interface ExportPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  resumeId: string;
  resumeName: string;
  pageSize?: 'A4' | 'US Letter';
  targetContainerId?: string;
}

interface ExportVerificationMeta {
  atsVerified: boolean;
  extractableChars: number;
  extractableWords: number;
  pageCount: number;
  sizeBytes: number;
}

export function ExportPdfModal(props: ExportPdfModalProps) {
  if (!props.isOpen) return null;
  return <ExportPdfModalDialog {...props} />;
}

function ExportPdfModalDialog({
  onClose,
  resumeId,
  resumeName,
  pageSize = 'A4',
  targetContainerId = 'resume-document-print',
}: ExportPdfModalProps) {
  const [progress, setProgress] = useState(15);
  const [statusLabel, setStatusLabel] = useState('Preparing vector layout...');
  const [isDone, setIsDone] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [verification, setVerification] = useState<ExportVerificationMeta | null>(null);
  const [isExportingDocx, setIsExportingDocx] = useState(false);
  const isGeneratingRef = useRef(false);
  const blobUrlRef = useRef<string | null>(null);
  const openedInNewTabRef = useRef(false);
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  const cleanFileName =
    (resumeName || 'Resume').trim().replace(/[/\\?%*:|"<>]/g, '-') + '.pdf';

  const triggerDownload = useCallback(
    (blobUrl: string) => {
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
    },
    [cleanFileName],
  );

  const runExport = useCallback(async () => {
    try {
      setErrorMessage(null);
      setVerification(null);
      setProgress(25);
      setStatusLabel('Serializing template styles & layout...');

      await new Promise((r) => setTimeout(r, 120));

      const payload = buildVectorPdfPayload(
        targetContainerId,
        cleanFileName,
        pageSize,
      );

      setProgress(55);
      setStatusLabel('Rendering true vector ATS PDF...');

      const result = await apiClient.exportResumePdf(resumeId, payload);

      setProgress(90);
      setStatusLabel('Verifying ATS text layer...');

      const blobUrl = URL.createObjectURL(result.blob);
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
      }
      blobUrlRef.current = blobUrl;
      setPdfBlobUrl(blobUrl);

      setVerification({
        atsVerified: result.atsVerified,
        extractableChars: result.extractableChars,
        extractableWords: result.extractableWords,
        pageCount: result.pageCount,
        sizeBytes: result.sizeBytes,
      });

      setProgress(100);
      setStatusLabel('100% Complete!');
      setIsDone(true);

      analytics.track('export_completed', {
        fileFormat: 'pdf',
        source: 'vector_pdf_modal',
      });

      triggerDownload(blobUrl);
    } catch (err: unknown) {
      console.error('Vector PDF Export Error:', err);
      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'Failed to generate vector PDF. You can use browser Print to PDF as fallback.',
      );
      setProgress(100);
      setStatusLabel('Export failed');
      setIsDone(true);
    } finally {
      isGeneratingRef.current = false;
    }
  }, [cleanFileName, pageSize, resumeId, targetContainerId, triggerDownload]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) {
      dialog.showModal();
    }
    return () => {
      if (dialog?.open) {
        dialog.close();
      }
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isGeneratingRef.current) return;
      isGeneratingRef.current = true;
      void runExport();
    }, 0);

    return () => {
      clearTimeout(timer);
      if (blobUrlRef.current && !openedInNewTabRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };
  }, [runExport]);

  const formattedSize = verification
    ? verification.sizeBytes < 1024 * 1024
      ? `${(verification.sizeBytes / 1024).toFixed(1)} KB`
      : `${(verification.sizeBytes / (1024 * 1024)).toFixed(2)} MB`
    : null;

  return (
    <dialog
      ref={dialogRef}
      id="export-pdf-modal"
      aria-labelledby="export-pdf-modal-title"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === dialogRef.current) {
          onClose();
        }
      }}
      className="fixed inset-0 m-auto p-0 w-[calc(100vw-24px)] max-w-[480px] max-h-[92vh] bg-transparent overflow-visible backdrop:bg-black/50 backdrop:backdrop-blur-sm print:hidden"
    >
      <div
        className="relative w-full max-w-[480px] max-h-[92vh] flex flex-col overflow-y-auto bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 p-5 sm:p-6 space-y-4 sm:space-y-5 animate-in zoom-in-95 duration-200 text-zinc-900 dark:text-zinc-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 p-2 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          title="Close dialog"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="text-center space-y-1">
          <h2 id="export-pdf-modal-title" className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 font-rubik">
            {errorMessage ? 'PDF Export Issue' : isDone ? 'Vector ATS PDF Ready' : 'Preparing the file'}
          </h2>
          <p className={`text-xs font-semibold ${errorMessage ? 'text-rose-700 dark:text-rose-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
            {isDone && !errorMessage ? '100% Complete!' : `${progress}% · ${statusLabel}`}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-2.5 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ease-out ${errorMessage ? 'bg-rose-500' : 'bg-[#00c599]'
              }`}
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Verification & File Summary Card */}
        {!errorMessage ? (
          <div className="p-3.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-950/60 space-y-2.5">
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-0.5 min-w-0">
                <p className="text-[11.5px] text-zinc-700 dark:text-zinc-300 truncate">
                  <strong className="font-semibold text-zinc-900 dark:text-zinc-100">{cleanFileName}</strong>
                </p>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  True selectable vector text with clickable links for ATS parsers.
                </p>
              </div>
              <div className="shrink-0 text-right">
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Vector {pageSize}</span>
                </span>
              </div>
            </div>

            {verification && (
              <div className="pt-2 border-t border-zinc-200/70 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-2 text-[10.5px]">
                <span
                  className={`inline-flex items-center gap-1 font-semibold ${verification.atsVerified ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'
                    }`}
                >
                  {verification.atsVerified ? (
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  )}
                  <span>
                    {verification.atsVerified
                      ? `ATS Text Verified · ${verification.extractableWords} selectable words`
                      : 'Low text content detected'}
                  </span>
                </span>
                <span className="text-zinc-500 dark:text-zinc-400 font-mono">
                  {verification.pageCount} {verification.pageCount === 1 ? 'Page' : 'Pages'} · {formattedSize}
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 space-y-2.5">
            <p className="text-[11.5px] text-rose-700 dark:text-rose-300 font-medium">{errorMessage}</p>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsDone(false);
                  setProgress(15);
                  isGeneratingRef.current = true;
                  void runExport();
                }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Retry PDF Export</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  setTimeout(() => window.print(), 150);
                }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-rose-200 dark:border-rose-700 text-rose-700 dark:text-rose-300 hover:bg-rose-100/50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Use Browser Print to PDF Fallback</span>
              </button>
            </div>
          </div>
        )}

        {/* Primary Download / Preview Actions */}
        {pdfBlobUrl && !errorMessage && (
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-2.5">
              <button
                type="button"
                onClick={() => triggerDownload(pdfBlobUrl)}
                className="w-full sm:flex-1 inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 text-xs font-semibold transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF</span>
              </button>
              <a
                href={pdfBlobUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  openedInNewTabRef.current = true;
                }}
                className="w-full sm:flex-1 inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-semibold transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
                <span>Preview in Tab</span>
              </a>
            </div>
            <button
              type="button"
              data-testid="modal-export-docx-btn"
              disabled={isExportingDocx}
              onClick={async () => {
                setIsExportingDocx(true);
                try {
                  const res = await apiClient.exportResumeDocx(resumeId, {
                    pageSize,
                    fileName: resumeName,
                  });
                  downloadExportBlob(res.blob, res.fileName, '.docx');
                } finally {
                  setIsExportingDocx(false);
                }
              }}
              className="w-full inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50/60 dark:bg-blue-950/40 hover:bg-blue-100/70 dark:hover:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-semibold transition-colors disabled:opacity-60 cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>
                {isExportingDocx
                  ? 'Building Editable Word (.docx)...'
                  : 'Download Editable Word (.docx)'}
              </span>
            </button>
          </div>
        )}

        {/* What To Do Next Section */}
        <div className="space-y-2.5 pt-1">
          <h3 className="text-[11px] font-bold tracking-wider uppercase text-zinc-500 dark:text-zinc-400 text-center font-rubik">
            What to do next
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <Link
              href={`/app/match?resumeId=${resumeId}`}
              className="p-3.5 rounded-xl border border-emerald-100 dark:border-emerald-900/60 bg-[#f0fdf9] dark:bg-emerald-950/30 hover:bg-[#e6faf4] dark:hover:bg-emerald-950/50 transition-all group flex flex-col justify-between space-y-2 text-left relative"
            >
              <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-900 dark:text-zinc-100">
                  <FileText className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Match to a Job</span>
                </div>
                <p className="text-[10px] text-zinc-600 dark:text-zinc-400 leading-snug">
                  Audit this resume against a real job description for keyword gaps.
                </p>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 group-hover:underline pt-1">
                RUN JOB MATCH &gt;
              </span>
            </Link>

            <Link
              href="/app/interview"
              className="p-3.5 rounded-xl border border-purple-100 dark:border-purple-900/60 bg-[#faf5ff] dark:bg-purple-950/30 hover:bg-[#f3e8ff] dark:hover:bg-purple-950/50 transition-all group flex flex-col justify-between space-y-2 text-left relative"
            >
              <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full bg-purple-500" />
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-900 dark:text-zinc-100">
                  <Briefcase className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                  <span>AI Mock Interview</span>
                </div>
                <p className="text-[10px] text-zinc-600 dark:text-zinc-400 leading-snug">
                  Practice answering STAR questions grounded in this exact resume.
                </p>
              </div>
              <span className="text-[10px] font-bold text-purple-700 dark:text-purple-400 group-hover:underline pt-1">
                START INTERVIEW &gt;
              </span>
            </Link>
          </div>
        </div>
      </div>
    </dialog>
  );
}
