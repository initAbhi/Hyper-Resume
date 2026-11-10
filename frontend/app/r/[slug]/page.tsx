'use client';

import React, { use, useEffect, useLayoutEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  Download,
  ExternalLink,
  FileText,
  Printer,
  ShieldCheck,
} from 'lucide-react';
import {
  apiClient,
  ApiError,
  downloadExportBlob,
  type PublicSharedResumePayload,
} from '@/lib/api-client';
import { buildVectorPdfPayload } from '@/lib/pdf-html-serializer';
import { applyResumeLayoutToDom } from '@/lib/resume-layout';
import { ResumeTemplateRenderer } from '@/components/resumes/templates';
import { Button } from '@/components/ui/button';

interface RecruiterViewPageProps {
  params: Promise<{ slug: string }>;
}

export default function RecruiterPublicViewPage({
  params,
}: RecruiterViewPageProps) {
  const resolved = use(params);
  const slug = decodeURIComponent(resolved.slug || '');

  const [payload, setPayload] = useState<PublicSharedResumePayload | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [errorState, setErrorState] = useState<{
    code: number;
    message: string;
  } | null>(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isExportingDocx, setIsExportingDocx] = useState(false);

  const canvasContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let mounted = true;
    async function loadPublicResume() {
      setIsLoading(true);
      setErrorState(null);
      try {
        const res = await apiClient.getPublicResumeBySlug(slug, true);
        if (!mounted) return;
        setPayload(res);
      } catch (err: unknown) {
        if (!mounted) return;
        const statusCode =
          err instanceof ApiError ? err.statusCode : 404;
        setErrorState({
          code: statusCode,
          message:
            err instanceof Error
              ? err.message
              : 'This shared resume link is unavailable or has expired.',
        });
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    if (slug) {
      void loadPublicResume();
    }
    return () => {
      mounted = false;
    };
  }, [slug]);

  useLayoutEffect(() => {
    if (!canvasContainerRef.current || !payload) return;
    applyResumeLayoutToDom(canvasContainerRef.current, payload.content.layout);
  }, [payload]);

  const handleDownloadPdf = async () => {
    if (!payload || !payload.allowPdfDownload || isExportingPdf) return;
    setIsExportingPdf(true);
    try {
      const pdfPayload = buildVectorPdfPayload(
        'recruiter-resume-print',
        `${payload.content.contact?.fullName || payload.resumeTitle}.pdf`,
        'A4',
      );
      const res = await apiClient.exportPublicResumePdf(slug, pdfPayload);
      downloadExportBlob(res.blob, res.fileName, '.pdf');
    } catch (err) {
      console.error('Public PDF export failed:', err);
      window.print();
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleDownloadDocx = async () => {
    if (!payload || !payload.allowDocxDownload || isExportingDocx) return;
    setIsExportingDocx(true);
    try {
      const res = await apiClient.exportPublicResumeDocx(slug, 'A4');
      downloadExportBlob(res.blob, res.fileName, '.docx');
    } catch (err) {
      console.error('Public DOCX export failed:', err);
    } finally {
      setIsExportingDocx(false);
    }
  };

  const handlePrint = () => {
    if (!payload) return;
    void apiClient.recordPublicShareEvent(slug, 'print').catch(() => undefined);
    window.print();
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-3">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
            Loading verified ATS resume...
          </p>
        </div>
      </main>
    );
  }

  if (errorState || !payload) {
    return (
      <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center p-6">
        <div className="max-w-md w-full p-6 sm:p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="space-y-1.5">
            <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              {errorState?.code === 410
                ? 'Resume Link Expired'
                : 'Shared Resume Unavailable'}
            </h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              {errorState?.message ||
                'This link may have been paused, rotated, or revoked by the candidate.'}
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            <span>Built with HypeResume</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </main>
    );
  }

  const accentColor = payload.content.layout?.accentColor || '#2563eb';
  const fontFamily = payload.content.layout?.fontFamily || 'sans';
  const candidateName =
    payload.content.contact?.fullName?.trim() || payload.resumeTitle;

  return (
    <div className="min-h-screen bg-[#F3F4F6] dark:bg-zinc-950 print:bg-white">
      {/* Top Distraction-Free Recruiter Header Bar */}
      <header className="print:hidden sticky top-0 z-30 border-b border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100 truncate">
                {candidateName}
              </h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <ShieldCheck className="w-3 h-3" />
                Verified Recruiter View
              </span>
            </div>
            {payload.content.headline && (
              <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                {payload.content.headline}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {payload.allowPdfDownload && (
              <Button
                id="recruiter-download-pdf-btn"
                type="button"
                variant="primary"
                size="sm"
                isLoading={isExportingPdf}
                onClick={() => void handleDownloadPdf()}
                className="gap-1.5 text-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF</span>
              </Button>
            )}

            {payload.allowDocxDownload && (
              <Button
                id="recruiter-download-docx-btn"
                type="button"
                variant="outline"
                size="sm"
                isLoading={isExportingDocx}
                onClick={() => void handleDownloadDocx()}
                className="gap-1.5 text-xs"
              >
                <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Export DOCX</span>
              </Button>
            )}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="gap-1.5 text-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Document Presentation Area */}
      <main className="max-w-4xl mx-auto px-3 sm:px-6 py-6 sm:py-8 space-y-4 print:p-0 print:max-w-none">
        {payload.recruiterNote && (
          <aside className="print:hidden p-3.5 rounded-xl border border-blue-200 dark:border-blue-900/70 bg-blue-50/70 dark:bg-blue-950/30 text-xs text-blue-900 dark:text-blue-200 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Candidate Note: </span>
              <span>{payload.recruiterNote}</span>
            </div>
          </aside>
        )}

        <div className="overflow-x-auto pb-4 print:overflow-visible print:pb-0">
          <div
            ref={canvasContainerRef}
            id="recruiter-resume-print"
            className="mx-auto max-w-[820px] shadow-xl rounded-lg overflow-hidden print:shadow-none print:rounded-none"
          >
            <ResumeTemplateRenderer
              templateKey={payload.templateKey}
              content={payload.content}
              accentColor={accentColor}
              fontFamily={fontFamily}
              showPhoto={Boolean(payload.content.contact?.photoUrl)}
              photoUrl={payload.content.contact?.photoUrl}
              showHighlights={false}
            />
          </div>
        </div>

        <footer className="print:hidden text-center text-[11px] text-zinc-500 pt-1 pb-4">
          Hosted on{' '}
          <Link
            href="/"
            className="font-semibold text-zinc-700 dark:text-zinc-300 hover:underline"
          >
            HypeResume
          </Link>{' '}
          · Clean ATS Vector Format
        </footer>
      </main>
    </div>
  );
}
