'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
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
      <section className="w-full py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-b border-white/[0.08] bg-[#090A10] text-white relative overflow-hidden">
        
        {/* Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-[#5525F5]/10 blur-3xl pointer-events-none rounded-full" />

        <div className="max-w-4xl mx-auto space-y-10 relative z-10">
          <div className="space-y-3 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white/[0.04] border border-white/[0.08] text-zinc-300 text-xs font-semibold tracking-wider uppercase font-mono shadow-inner">
              <span className="w-1.5 h-1.5 rounded-full bg-[#5525F5] animate-pulse" />
              <span>Frequently Asked Questions</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Clear answers regarding ATS parsing and fact grounding.
            </h2>
          </div>

          <div className="divide-y divide-white/[0.08] bg-[#121422]/65 backdrop-blur-xl rounded-2xl border border-white/[0.08] px-6 sm:px-8 shadow-2xl">
            {faqs.map((faq, i) => (
              <div key={i} className="py-6 space-y-2">
                <h3 className="text-sm sm:text-base font-bold text-white">
                  {faq.question}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
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
      <section className="w-full py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-[#090A10] text-center relative overflow-hidden text-white border-b border-white/[0.08]">
        
        {/* Soft Radial Backlight Spotlight */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[450px] bg-gradient-to-b from-[#5525F5]/25 via-[#4263FF]/15 to-transparent blur-3xl pointer-events-none rounded-full" />

        <div className="max-w-3xl mx-auto space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white/[0.04] border border-white/[0.08] text-zinc-300 text-xs font-semibold tracking-wider uppercase font-mono shadow-inner">
            <span className="w-1.5 h-1.5 rounded-full bg-[#5525F5] animate-pulse" />
            <span>Get Started</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight">
            Make your next application count.
          </h2>

          <p className="text-sm sm:text-base text-zinc-400 max-w-xl mx-auto leading-relaxed">
            Build a clearer, more targeted resume with HypeResume. Start with your authentic experience and match it to the job that matters.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto">
            <Link href="/login" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto rounded-lg bg-[#5525F5] hover:bg-[#4318D8] text-white font-semibold text-sm h-11 px-7 shadow-lg shadow-violet-500/25 gap-2 border border-violet-400/30">
                <span>Build My Resume — Free</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/examples" className="w-full sm:w-auto">
              <button 
                type="button"
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-lg text-sm font-semibold h-11 px-6 border border-white/15 bg-white/[0.06] hover:bg-white/[0.12] text-white hover:border-violet-400/60 transition-all shadow-sm backdrop-blur-md cursor-pointer"
              >
                <span>Explore Resume Examples</span>
              </button>
            </Link>
          </div>

          <div className="pt-4 flex items-center justify-center gap-6 text-xs text-zinc-400 font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Standard unwatermarked PDF export</span>
            </span>
            <span className="hidden sm:inline text-zinc-600">•</span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>No credit card required</span>
            </span>
          </div>
        </div>
      </section>
    </>
  );
}
