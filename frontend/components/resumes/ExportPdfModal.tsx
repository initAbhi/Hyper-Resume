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
    const timer = setTimeout(() => {
      if (isGeneratingRef.current) return;
      isGeneratingRef.current = true;
      void runExport();
    }, 0);

    return () => {
      clearTimeout(timer);
      if (blobUrlRef.current) {
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
    <div
      id="export-pdf-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm print:hidden animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[480px] bg-white rounded-2xl shadow-xl border border-zinc-200 p-6 space-y-5 animate-in zoom-in-95 duration-200 text-zinc-900"
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

        {/* Header */}
        <div className="text-center space-y-1">
          <h2 className="text-xl font-bold tracking-tight text-zinc-900 font-rubik">
            {errorMessage ? 'PDF Export Issue' : isDone ? 'Vector ATS PDF Ready' : 'Preparing the file'}
          </h2>
          <p className={`text-xs font-semibold ${errorMessage ? 'text-rose-600' : 'text-[#00c599]'}`}>
            {isDone && !errorMessage ? '100% Complete!' : `${progress}% · ${statusLabel}`}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-zinc-100 rounded-full h-2.5 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ease-out ${
              errorMessage ? 'bg-rose-500' : 'bg-[#00c599]'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Verification & File Summary Card */}
        {!errorMessage ? (
          <div className="p-3.5 rounded-xl border border-zinc-200/80 bg-zinc-50/80 space-y-2.5">
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-0.5 min-w-0">
                <p className="text-[11.5px] text-zinc-700 truncate">
                  <strong className="font-semibold text-zinc-900">{cleanFileName}</strong>
                </p>
                <p className="text-[11px] text-zinc-500">
                  True selectable vector text with clickable links for ATS parsers.
                </p>
              </div>
              <div className="shrink-0 text-right">
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                  <span>Vector {pageSize}</span>
                </span>
              </div>
            </div>

            {verification && (
              <div className="pt-2 border-t border-zinc-200/70 flex flex-wrap items-center justify-between gap-2 text-[10.5px]">
                <span
                  className={`inline-flex items-center gap-1 font-semibold ${
                    verification.atsVerified ? 'text-emerald-700' : 'text-amber-700'
                  }`}
                >
                  {verification.atsVerified ? (
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  )}
                  <span>
                    {verification.atsVerified
                      ? `ATS Text Verified · ${verification.extractableWords} selectable words`
                      : 'Low text content detected'}
                  </span>
                </span>
                <span className="text-zinc-500 font-mono">
                  {verification.pageCount} {verification.pageCount === 1 ? 'Page' : 'Pages'} · {formattedSize}
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 space-y-2.5">
            <p className="text-[11.5px] text-rose-700 font-medium">{errorMessage}</p>
            <button
              type="button"
              onClick={() => {
                onClose();
                setTimeout(() => window.print(), 150);
              }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-white border border-rose-200 text-rose-700 hover:bg-rose-100/50 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Use Browser Print to PDF Fallback</span>
            </button>
          </div>
        )}

        {/* Primary Download / Preview Actions */}
        {pdfBlobUrl && !errorMessage && (
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => triggerDownload(pdfBlobUrl)}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF</span>
              </button>
              <a
                href={pdfBlobUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl border border-zinc-200 hover:bg-zinc-50 text-zinc-800 text-xs font-semibold transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5 text-zinc-500" />
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
              className="w-full inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl border border-blue-200 bg-blue-50/60 hover:bg-blue-100/70 text-blue-700 text-xs font-semibold transition-colors disabled:opacity-60 cursor-pointer"
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
          <h3 className="text-[11px] font-bold tracking-wider uppercase text-zinc-400 text-center font-rubik">
            What to do next
          </h3>

          <div className="grid grid-cols-2 gap-2.5">
            <Link
              href={`/app/match?resumeId=${resumeId}`}
              className="p-3.5 rounded-xl border border-emerald-100 bg-[#f0fdf9] hover:bg-[#e6faf4] transition-all group flex flex-col justify-between space-y-2 text-left relative"
            >
              <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-900">
                  <FileText className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Match to a Job</span>
                </div>
                <p className="text-[10px] text-zinc-500 leading-snug">
                  Audit this resume against a real job description for keyword gaps.
                </p>
              </div>
              <span className="text-[10px] font-bold text-emerald-600 group-hover:underline pt-1">
                RUN JOB MATCH &gt;
              </span>
            </Link>

            <Link
              href="/app/interview"
              className="p-3.5 rounded-xl border border-purple-100 bg-[#faf5ff] hover:bg-[#f3e8ff] transition-all group flex flex-col justify-between space-y-2 text-left relative"
            >
              <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full bg-purple-500" />
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-900">
                  <Briefcase className="w-3.5 h-3.5 text-purple-600" />
                  <span>AI Mock Interview</span>
                </div>
                <p className="text-[10px] text-zinc-500 leading-snug">
                  Practice answering STAR questions grounded in this exact resume.
                </p>
              </div>
              <span className="text-[10px] font-bold text-purple-600 group-hover:underline pt-1">
                START INTERVIEW &gt;
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
