'use client';

import React from 'react';
import type { CoverLetter } from '@/lib/api-client';
import { formatCoverLetterDate } from '@/lib/cover-letter-utils';

interface CoverLetterDocumentPreviewProps {
  letter: CoverLetter;
}

export default function CoverLetterDocumentPreview({
  letter,
}: CoverLetterDocumentPreviewProps) {
  const accent = letter.accentColor || '#285FEA';
  const contactItems = [
    letter.senderEmail,
    letter.senderPhone,
    letter.senderLocation,
  ].filter(Boolean) as string[];
  const dateLabel = formatCoverLetterDate(letter.updatedAt || letter.createdAt);

  if (letter.templateKey === 'classic') {
    return (
      <div
        id="cover-letter-document-print"
        className="w-full max-w-[794px] mx-auto bg-white text-zinc-900 shadow-xl border border-zinc-200 rounded-sm px-12 py-12 min-h-[1040px] flex flex-col justify-between"
        style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
      >
        <div className="space-y-6">
          {/* Classic Centered Formal Header */}
          <header className="text-center pb-5 border-b border-zinc-300 space-y-1.5">
            <h1 className="text-2xl font-bold tracking-wide text-zinc-900 uppercase">
              {letter.senderName}
            </h1>
            {contactItems.length > 0 && (
              <p className="text-xs text-zinc-600">
                {contactItems.join('  •  ')}
              </p>
            )}
          </header>

          {/* Date & Recipient */}
          <div className="space-y-4 text-[13px] leading-relaxed text-zinc-800">
            <p className="text-zinc-600">{dateLabel}</p>
            {letter.recipientLine && (
              <div className="font-medium text-zinc-900">
                <p>{letter.recipientLine}</p>
                <p className="text-xs text-zinc-600 font-normal">
                  Re: Application for {letter.targetRole}
                </p>
              </div>
            )}
          </div>

          {/* Letter Body */}
          <div className="space-y-4 text-[13.5px] leading-[1.75] text-zinc-800">
            <p className="font-semibold text-zinc-900">{letter.salutation}</p>
            <p>{letter.openingParagraph}</p>
            {(letter.bodyParagraphs || []).map((paragraph, idx) => (
              <p key={idx}>{paragraph}</p>
            ))}
            <p>{letter.closingParagraph}</p>
          </div>

          {/* Signature */}
          <div className="pt-4 space-y-4 text-[13.5px] text-zinc-900">
            <p>{letter.signOff}</p>
            <p className="font-bold text-base tracking-wide">
              {letter.senderName}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (letter.templateKey === 'modern') {
    return (
      <div
        id="cover-letter-document-print"
        className="w-full max-w-[794px] mx-auto bg-white text-zinc-900 shadow-xl border border-zinc-200 rounded-sm overflow-hidden min-h-[1040px] flex"
        style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
      >
        <div className="w-2.5 shrink-0" style={{ backgroundColor: accent }} />
        <div className="flex-1 px-11 py-11 flex flex-col justify-between space-y-6">
          <div className="space-y-7">
            {/* Modern Header */}
            <header className="space-y-2 pb-5 border-b border-zinc-200">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h1 className="text-[26px] font-extrabold tracking-tight text-zinc-900">
                  {letter.senderName}
                </h1>
                <span
                  className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full"
                  style={{
                    backgroundColor: `${accent}18`,
                    color: accent,
                  }}
                >
                  {letter.targetRole}
                </span>
              </div>
              {contactItems.length > 0 && (
                <p className="text-xs text-zinc-500 font-medium">
                  {contactItems.join('  |  ')}
                </p>
              )}
            </header>

            {/* Recipient & Date Row */}
            <div className="flex items-start justify-between gap-4 text-xs text-zinc-600">
              <div>
                <p className="font-semibold text-zinc-900 text-[13px]">
                  {letter.recipientLine || `${letter.companyName} Hiring Team`}
                </p>
                <p className="text-zinc-500 mt-0.5">{letter.companyName}</p>
              </div>
              <p className="font-medium text-zinc-500 shrink-0">{dateLabel}</p>
            </div>

            {/* Body */}
            <div className="space-y-4 text-[13.5px] leading-[1.7] text-zinc-800">
              <p className="font-semibold text-zinc-900">{letter.salutation}</p>
              <p>{letter.openingParagraph}</p>
              {(letter.bodyParagraphs || []).map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
              <p>{letter.closingParagraph}</p>
            </div>

            {/* Sign-off */}
            <div className="pt-3 space-y-3 text-[13.5px]">
              <p className="text-zinc-700">{letter.signOff}</p>
              <p className="font-bold text-[15px]" style={{ color: accent }}>
                {letter.senderName}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default: Executive Split Header
  return (
    <div
      id="cover-letter-document-print"
      className="w-full max-w-[794px] mx-auto bg-white text-zinc-900 shadow-xl border border-zinc-200 rounded-sm px-12 py-12 min-h-[1040px] flex flex-col justify-between"
      style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
    >
      <div className="space-y-7">
        {/* Executive Split Header */}
        <header
          className="pb-5 border-b-2 flex flex-wrap items-end justify-between gap-4"
          style={{ borderColor: accent }}
        >
          <div className="space-y-1">
            <h1 className="text-[26px] font-bold tracking-tight text-zinc-900">
              {letter.senderName}
            </h1>
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: accent }}>
              Candidate — {letter.targetRole}
            </p>
          </div>
          {contactItems.length > 0 && (
            <div className="text-right text-[11.5px] text-zinc-600 space-y-0.5">
              {contactItems.map((item, idx) => (
                <p key={idx}>{item}</p>
              ))}
            </div>
          )}
        </header>

        {/* Date & Addressee */}
        <div className="space-y-2 text-[13px] text-zinc-700">
          <p className="text-xs text-zinc-500">{dateLabel}</p>
          <p className="font-semibold text-zinc-900">
            {letter.recipientLine || `${letter.companyName} Hiring Team`}
          </p>
        </div>

        {/* Letter Content */}
        <div className="space-y-4 text-[13.5px] leading-[1.7] text-zinc-800">
          <p className="font-semibold text-zinc-900">{letter.salutation}</p>
          <p>{letter.openingParagraph}</p>
          {(letter.bodyParagraphs || []).map((paragraph, idx) => (
            <p key={idx}>{paragraph}</p>
          ))}
          <p>{letter.closingParagraph}</p>
        </div>

        {/* Sign-off */}
        <div className="pt-4 space-y-3 text-[13.5px] text-zinc-900">
          <p>{letter.signOff}</p>
          <p className="font-bold text-[15px]">{letter.senderName}</p>
        </div>
      </div>
    </div>
  );
}

