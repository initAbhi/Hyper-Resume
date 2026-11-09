'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, FileText, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function FaqAndFinalCta() {
  const faqs = [
    {
      question: 'How does HypeResume ensure standard parser compatibility?',
      answer:
        'We design templates around verified Applicant Tracking System (ATS) parsing conventions: strict single-column document flow, recognized section landmarks (Experience, Education, Skills, Projects), clean UTF-8 text encoding, and standard date formatting. We avoid multi-column floating boxes, graphics, and tables that frequently scramble text extraction in enterprise HR systems.',
    },
    {
      question: 'Does the AI invent or exaggerate achievements?',
      answer:
        'Never. HypeResume operates under a strict evidence-grounding principle. The engine assists you in structuring and clarifying the real facts, metrics, and responsibilities you provide (using STAR/XYZ formulas). It never fabricates employers, degrees, unearned skills, or false metrics.',
    },
    {
      question: 'Can I manage multiple resumes for different target roles?',
      answer:
        'Yes. You can branch your single master profile into targeted versions tailored for specific job descriptions. Each version maintains its own version history, job match analysis, and PDF export settings.',
    },
    {
      question: 'How does requirement matching differ from a simple keyword counter?',
      answer:
        'Traditional keyword counters merely tally exact word occurrences, which encourages unhelpful keyword stuffing that recruiters easily spot. HypeResume maps what the job posting actually requires against the documented evidence demonstrated in your work history.',
    },
    {
      question: 'Can I export my resume as a clean PDF for free?',
      answer:
        'Yes. All resumes export as crisp, vector-standard A4 PDF documents with selectable text that recruiters and automated parsers can accurately process. Standard unwatermarked PDF export is completely free.',
    },
    {
      question: 'Is my resume data kept private?',
      answer:
        'Yes. Your resume documents and personal career history are stored in private encrypted storage. We do not sell your personal information or use your uploaded documents to train public foundational AI models.',
    },
  ];

  return (
    <>
      {/* =====================================================
          FAQS SECTION
      ===================================================== */}
      <section className="w-full py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-b border-[#E6E8ED] dark:border-[#252A33] bg-[#F7F8FA] dark:bg-[#101216]">
        <div className="max-w-4xl mx-auto space-y-10">
          <div className="space-y-3 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white dark:bg-[#1A1D23] border border-[#E6E8ED] dark:border-[#252A33] text-[#626B7A] dark:text-[#9EA7B4] text-xs font-semibold tracking-wider uppercase font-mono">
              <span>Frequently Asked Questions</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#171923] dark:text-[#F0F2F5] tracking-tight">
              Clear answers regarding ATS parsing and fact grounding.
            </h2>
          </div>

          <div className="divide-y divide-[#E6E8ED] dark:divide-[#252A33] bg-white dark:bg-[#14171C] rounded-2xl border border-[#E6E8ED] dark:border-[#252A33] px-6 sm:px-8 shadow-xs">
            {faqs.map((faq, i) => (
              <div key={i} className="py-6 space-y-2">
                <h3 className="text-sm sm:text-base font-bold text-[#171923] dark:text-[#F0F2F5]">
                  {faq.question}
                </h3>
                <p className="text-xs sm:text-sm text-[#626B7A] dark:text-[#9EA7B4] leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          FINAL EDITORIAL CALL TO ACTION
      ===================================================== */}
      <section className="w-full py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-white dark:bg-[#0C0D13] text-center relative overflow-hidden">
        <div className="max-w-3xl mx-auto space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#F7F8FA] dark:bg-[#1A1D23] border border-[#E6E8ED] dark:border-[#252A33] text-[#626B7A] dark:text-[#9EA7B4] text-xs font-semibold tracking-wider uppercase font-mono">
            <span>Get Started</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#171923] dark:text-[#F0F2F5] tracking-tight leading-tight">
            Make your next application count.
          </h2>

          <p className="text-sm sm:text-base text-[#626B7A] dark:text-[#9EA7B4] max-w-xl mx-auto leading-relaxed">
            Build a clearer, more targeted resume with HypeResume. Start with your authentic experience and match it to the job that matters.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto">
            <Link href="/login" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto rounded-md bg-[#3730F5] hover:bg-[#2820D4] text-white font-semibold text-sm h-11 px-7 shadow-xs gap-2">
                <span>Build My Resume — Free</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/examples" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-md text-sm font-semibold h-11 px-6 hover:border-[#3730F5]">
                <span>Explore Resume Examples</span>
              </Button>
            </Link>
          </div>

          <div className="pt-4 flex items-center justify-center gap-6 text-xs text-[#848D9A] font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Standard unwatermarked PDF export</span>
            </span>
            <span className="hidden sm:inline">•</span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>No credit card required</span>
            </span>
          </div>
        </div>
      </section>
    </>
  );
}

