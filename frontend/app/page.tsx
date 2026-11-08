'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  FileText, 
  Briefcase, 
  Shield, 
  Check, 
  Clock,
  Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { InteractiveHeroStudio } from '@/components/home/InteractiveHeroStudio';
import { InteractiveTemplateShowcase } from '@/components/home/InteractiveTemplateShowcase';
import { CompanyLogoCloud } from '@/components/home/CompanyLogoCloud';
import { AtsCompatibilityCloud } from '@/components/home/AtsCompatibilityCloud';
import { ReziStyleScoreFeatureSection } from '@/components/home/ReziStyleScoreFeatureSection';

export default function HomePage() {
  const faqs = [
    {
      question: 'How does HypeResume ensure parser compatibility?',
      answer:
        'We design templates around standard Applicant Tracking System (ATS) parsing conventions: strict single-column document flow, clean UTF-8 character encoding, and recognized section headers (Experience, Education, Skills, Projects). We avoid multi-column floating boxes, graphics, and tables that frequently cause parsing errors in systems like Workday, Greenhouse, and Lever.',
    },
    {
      question: 'Does the AI invent or exaggerate achievements?',
      answer:
        'Never. HypeResume operates on a strict evidence-grounding principle. The engine assists you in structuring and clarifying the real facts, metrics, and responsibilities you provide (using STAR/XYZ formulas). It never fabricates employers, degrees, unearned skills, or false metrics.',
    },
    {
      question: 'Can I manage multiple resumes for different target roles?',
      answer:
        'Yes. You can duplicate your master profile into tailored versions targeted for specific job descriptions. Each version maintains its own version history, job match analysis, and export settings.',
    },
    {
      question: 'How does job matching differ from a simple keyword counter?',
      answer:
        'Traditional keyword counters merely count exact word occurrences, which encourages unhelpful keyword stuffing. HypeResume analyzes requirement competencies—mapping what the job description requires to the actual evidence demonstrated in your work experience.',
    },
    {
      question: 'Can I export my resume as a PDF for free?',
      answer:
        'Yes. All resumes render crisp, vector-standard PDF documents with selectable text that recruiters and automated parsers can accurately process. Standard unwatermarked PDF export is completely free.',
    },
    {
      question: 'Is my resume data kept private?',
      answer:
        'Yes. Your resume documents and personal career history are stored in private storage. We do not sell your personal information or use your uploaded documents to train public foundation models.',
    },
  ];

  return (
    <div className="flex flex-col items-center overflow-hidden bg-white dark:bg-[#0D0F12] text-[#1A1D23] dark:text-[#F0F2F5]">
      
      {/* =====================================================
          1. HERO SECTION (Editorial, Credible, High-Clarity)
      ===================================================== */}
      <section className="relative w-full pt-12 pb-16 sm:pt-20 sm:pb-24 px-4 sm:px-6 lg:px-8 border-b border-[#E2E5E9] dark:border-[#252A33] overflow-hidden">
        {/* Subtle Ambient Glowing Orbs */}
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-blue-500/10 dark:bg-blue-600/15 rounded-full blur-3xl pointer-events-none animate-float-slow" />
        <div className="absolute top-1/3 -right-20 w-96 h-96 bg-emerald-500/10 dark:bg-emerald-600/15 rounded-full blur-3xl pointer-events-none animate-float-slow [animation-delay:2.5s]" />

        <div className="relative max-w-5xl mx-auto flex flex-col items-center text-center">
          
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F1F3F5] dark:bg-[#1D2128] border border-[#E2E5E9] dark:border-[#252A33] text-[#5A6270] dark:text-[#9EA7B4] text-xs font-semibold mb-6 shadow-xs hover:border-blue-400/40 transition-colors">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse" />
            <span>Career Productivity Platform</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#1A1D23] dark:text-[#F0F2F5] max-w-4xl leading-[1.12]">
            A better resume for the specific job you want.
          </h1>

          {/* Subtitle */}
          <p className="mt-4 text-sm sm:text-base lg:text-lg text-[#5A6270] dark:text-[#9EA7B4] max-w-2xl leading-relaxed">
            Turn your verified experience into tailored, ATS-compliant applications with evidence-backed suggestions and transparent requirement matching.
          </p>

          {/* Action CTAs */}
          <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto">
            <Link href="/login" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto rounded-md bg-[#285FEA] hover:bg-[#1E4BC8] text-white font-medium text-sm h-11 px-7 shadow-sm hover:shadow-blue-500/25 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] transition-all gap-2 cursor-pointer">
                <span>Build My Resume — Free</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/tools/resume-checker" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-md text-sm font-medium h-11 px-6 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer">
                Try Free ATS Checker
              </Button>
            </Link>
          </div>

          {/* Credibility statement */}
          <div className="mt-5 flex items-center justify-center gap-2 text-xs text-[#848D9A] font-medium">
            <span>Standard single-column formats</span>
            <span>•</span>
            <span>Evidence-based optimization</span>
            <span>•</span>
            <span>Free unwatermarked PDF export</span>
          </div>

          {/* Interactive Hero Studio Display (Clean Window Frame) */}
          <div className="mt-10 sm:mt-14 w-full">
            <InteractiveHeroStudio />
          </div>
        </div>
      </section>

      {/* =====================================================
          2. ATS COMPATIBILITY CLOUD
      ===================================================== */}
      <section className="w-full border-b border-[#E2E5E9] dark:border-[#252A33] bg-[#F7F8FA] dark:bg-[#14171C]/50">
        <AtsCompatibilityCloud />
      </section>

      {/* =====================================================
          3. COMPANY LOGO CLOUD
      ===================================================== */}
      <section className="w-full border-b border-[#E2E5E9] dark:border-[#252A33] bg-white dark:bg-[#0D0F12]">
        <CompanyLogoCloud />
      </section>

      {/* =====================================================
          4. EDITORIAL VALUE PILLARS
      ===================================================== */}
      <section className="w-full py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-b border-[#E2E5E9] dark:border-[#252A33] bg-[#F7F8FA]/60 dark:bg-[#14171C]/30">
        <div className="max-w-5xl mx-auto space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold bg-[#F1F3F5] dark:bg-[#1D2128] text-[#5A6270] dark:text-[#9EA7B4] border border-[#E2E5E9] dark:border-[#252A33]">
              Purposeful Optimization
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1A1D23] dark:text-[#F0F2F5] tracking-tight leading-tight">
              Tailored resumes yield clearer, more relevant applications.
            </h2>
            <p className="text-xs sm:text-sm text-[#5A6270] dark:text-[#9EA7B4] leading-relaxed max-w-2xl mx-auto">
              Generic resumes sent to dozens of jobs get overlooked. HypeResume helps you align your accomplishments directly to what hiring teams are looking for.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl bg-white dark:bg-[#14171C] border border-[#E2E5E9] dark:border-[#252A33] shadow-xs hover:shadow-lg hover:border-blue-400/30 dark:hover:border-blue-500/30 hover:-translate-y-1 transition-all duration-300 flex flex-col gap-3 group">
              <div className="w-9 h-9 rounded-md bg-[#F1F3F5] dark:bg-[#1D2128] text-[#285FEA] group-hover:bg-blue-50 dark:group-hover:bg-blue-950/40 group-hover:scale-105 transition-all flex items-center justify-center font-bold">
                <FileText className="w-4 h-4" />
              </div>
              <h3 className="text-base font-semibold text-[#1A1D23] dark:text-[#F0F2F5]">Standard Single-Column ATS</h3>
              <p className="text-xs text-[#5A6270] dark:text-[#9EA7B4] leading-relaxed">
                Deterministic layout order with standard section hierarchy. Prevents scrambled text extraction across Workday, Greenhouse, and Ashby.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-white dark:bg-[#14171C] border border-[#E2E5E9] dark:border-[#252A33] shadow-xs hover:shadow-lg hover:border-emerald-400/30 dark:hover:border-emerald-500/30 hover:-translate-y-1 transition-all duration-300 flex flex-col gap-3 group">
              <div className="w-9 h-9 rounded-md bg-[#F1F3F5] dark:bg-[#1D2128] text-[#059669] group-hover:bg-emerald-50 dark:group-hover:bg-emerald-950/40 group-hover:scale-105 transition-all flex items-center justify-center font-bold">
                <Shield className="w-4 h-4" />
              </div>
              <h3 className="text-base font-semibold text-[#1A1D23] dark:text-[#F0F2F5]">Truthful Grounding</h3>
              <p className="text-xs text-[#5A6270] dark:text-[#9EA7B4] leading-relaxed">
                We never fabricate employers, dates, or false skills. Every suggestion articulates your authentic work with STAR formulas and measurable impact.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-white dark:bg-[#14171C] border border-[#E2E5E9] dark:border-[#252A33] shadow-xs hover:shadow-lg hover:border-blue-400/30 dark:hover:border-blue-500/30 hover:-translate-y-1 transition-all duration-300 flex flex-col gap-3 group">
              <div className="w-9 h-9 rounded-md bg-[#F1F3F5] dark:bg-[#1D2128] text-[#285FEA] group-hover:bg-blue-50 dark:group-hover:bg-blue-950/40 group-hover:scale-105 transition-all flex items-center justify-center font-bold">
                <Briefcase className="w-4 h-4" />
              </div>
              <h3 className="text-base font-semibold text-[#1A1D23] dark:text-[#F0F2F5]">Transparent Requirement Analysis</h3>
              <p className="text-xs text-[#5A6270] dark:text-[#9EA7B4] leading-relaxed">
                Understand which required skills are supported in your profile, which need additional detail, and where genuine gaps exist before you apply.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          5. ATS RESUME TEMPLATES THAT LAND JOBS (Rezi-Style Carousel)
      ===================================================== */}
      <section className="w-full py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-b border-[#E2E5E9] dark:border-[#252A33] bg-white dark:bg-[#0D0F12]">
        <div className="max-w-7xl mx-auto">
          <InteractiveTemplateShowcase />
        </div>
      </section>

      {/* =====================================================
          6. DIAGNOSTIC ARCHITECTURE & SCORE METER
      ===================================================== */}
      <section className="w-full py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-b border-[#E2E5E9] dark:border-[#252A33] bg-[#F7F8FA] dark:bg-[#14171C]/50">
        <div className="max-w-6xl mx-auto">
          <ReziStyleScoreFeatureSection />
        </div>
      </section>

      {/* =====================================================
          7. APPLICATION PIPELINE & TRACKING
      ===================================================== */}
      <section className="w-full py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-b border-[#E2E5E9] dark:border-[#252A33] bg-white dark:bg-[#0D0F12]">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-5 space-y-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#285FEA] block">
              Application Workspace
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1A1D23] dark:text-[#F0F2F5] tracking-tight leading-tight">
              Organize your job search and tailored versions.
            </h2>
            <p className="text-xs sm:text-sm text-[#5A6270] dark:text-[#9EA7B4] leading-relaxed">
              Consolidate resume preparation, job description matching, and application status tracking into a single system. Always know which resume version was submitted to each company.
            </p>
            <div className="pt-2 flex flex-col gap-2 text-xs text-[#5A6270] dark:text-[#9EA7B4]">
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[#059669]" />
                <span>Track stages: Bookmarked → Applied → Interviewing → Offer</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[#059669]" />
                <span>Associate the exact tailored resume version for interview prep</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[#059669]" />
                <span>Log interview dates, contacts, and follow-up notes</span>
              </div>
            </div>
            <div className="pt-2">
              <Link href="/login">
                <Button className="rounded-md bg-[#285FEA] hover:bg-[#1E4BC8] text-white font-medium text-xs px-5 h-9 gap-2">
                  <span>Explore Application Pipeline</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Visual Mini-Pipeline Board */}
          <div className="lg:col-span-7 p-5 rounded-xl bg-[#F7F8FA] dark:bg-[#14171C] border border-[#E2E5E9] dark:border-[#252A33] shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E5E9] dark:border-[#252A33] mb-3 text-xs font-semibold">
              <span className="text-[#1A1D23] dark:text-[#F0F2F5] flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-[#285FEA]" />
                Application Pipeline
              </span>
              <span className="text-[#848D9A] font-normal text-[11px]">3 Active</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-white dark:bg-[#1D2128] border border-[#E2E5E9] dark:border-[#252A33] hover:border-blue-400/50 hover:shadow-sm hover:-translate-y-0.5 transition-all space-y-1">
                <div className="flex items-center justify-between font-semibold text-[#1A1D23] dark:text-[#F0F2F5]">
                  <span>Google</span>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#EDF3FD] dark:bg-[#13203D] text-[#1E4BC8] text-[10px] font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    <span>Applied</span>
                  </span>
                </div>
                <p className="text-[11px] text-[#5A6270] dark:text-[#9EA7B4]">Backend Engineer</p>
                <div className="text-[10px] text-[#848D9A] pt-1">Resume: Modern v2</div>
              </div>

              <div className="p-3 rounded-lg bg-white dark:bg-[#1D2128] border border-[#285FEA]/40 hover:border-[#285FEA] hover:shadow-md hover:-translate-y-0.5 transition-all space-y-1">
                <div className="flex items-center justify-between font-semibold text-[#1A1D23] dark:text-[#F0F2F5]">
                  <span>Stripe</span>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#ECFDF5] dark:bg-[#064E3B]/40 text-[#065F46] dark:text-[#A7F3D0] text-[10px] font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Interviewing</span>
                  </span>
                </div>
                <p className="text-[11px] text-[#5A6270] dark:text-[#9EA7B4]">Product Analyst</p>
                <div className="text-[10px] text-[#285FEA] font-medium pt-1">Technical Round</div>
              </div>

              <div className="p-3 rounded-lg bg-white dark:bg-[#1D2128] border border-[#E2E5E9] dark:border-[#252A33] hover:border-zinc-400/50 hover:shadow-sm hover:-translate-y-0.5 transition-all space-y-1">
                <div className="flex items-center justify-between font-semibold text-[#1A1D23] dark:text-[#F0F2F5]">
                  <span>Linear</span>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#F1F3F5] dark:bg-[#1D2128] text-[#5A6270] text-[10px] font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                    <span>Bookmarked</span>
                  </span>
                </div>
                <p className="text-[11px] text-[#5A6270] dark:text-[#9EA7B4]">Full Stack Engineer</p>
                <div className="text-[10px] text-[#848D9A] pt-1">Resume: Simple ATS</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          8. TRANSPARENT PRICING
      ===================================================== */}
      <section className="w-full py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-b border-[#E2E5E9] dark:border-[#252A33] bg-[#F7F8FA] dark:bg-[#14171C]/40">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#285FEA] block">
              Transparent Pricing
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1A1D23] dark:text-[#F0F2F5] tracking-tight">
              Honest pricing with no deceptive paywalls.
            </h2>
            <p className="text-xs sm:text-sm text-[#5A6270] dark:text-[#9EA7B4]">
              Start free. Upgrade only when you want automated AI bullet rewrites and unlimited tailored job versions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Free */}
            <div className="p-6 rounded-xl bg-white dark:bg-[#14171C] border border-[#E2E5E9] dark:border-[#252A33] flex flex-col justify-between shadow-xs">
              <div>
                <h3 className="text-base font-bold text-[#1A1D23] dark:text-[#F0F2F5]">Free Starter</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-[#1A1D23] dark:text-[#F0F2F5]">₹0</span>
                  <span className="text-xs text-[#848D9A]">/ forever</span>
                </div>
                <p className="mt-1 text-xs text-[#5A6270]">Ideal for initial resume creation and standard PDF export.</p>
                <ul className="mt-5 space-y-2.5 text-xs text-[#5A6270] dark:text-[#9EA7B4]">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#285FEA]" />
                    <span>Master resume editor</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#285FEA]" />
                    <span>Live ATS structure audit</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#285FEA]" />
                    <span>Standard unwatermarked PDF export</span>
                  </li>
                </ul>
              </div>
              <Link href="/login" className="mt-6">
                <Button variant="outline" size="md" className="w-full text-xs font-medium rounded-md">
                  Get Started Free
                </Button>
              </Link>
            </div>

            {/* Job Hunt Pack */}
            <div className="p-6 rounded-xl bg-white dark:bg-[#14171C] border-2 border-[#285FEA] shadow-sm relative flex flex-col justify-between">
              <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-[#285FEA] text-white text-[10px] font-semibold px-2.5 py-0.5 rounded-full">
                Most Popular
              </div>
              <div>
                <h3 className="text-base font-bold text-[#1A1D23] dark:text-[#F0F2F5]">Job Hunt Pack</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-[#1A1D23] dark:text-[#F0F2F5]">₹299</span>
                  <span className="text-xs text-[#848D9A]">one-time</span>
                </div>
                <p className="mt-1 text-xs text-[#5A6270]">Pay once for your active job hunt cycle. No recurring trap.</p>
                <ul className="mt-5 space-y-2.5 text-xs text-[#5A6270] dark:text-[#9EA7B4]">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#285FEA]" />
                    <span>50 AI optimization credits</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#285FEA]" />
                    <span>Evidence-grounded bullet rewrites</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#285FEA]" />
                    <span>Unlimited tailored resume drafts</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#285FEA]" />
                    <span>Application tracker sync</span>
                  </li>
                </ul>
              </div>
              <Link href="/login" className="mt-6">
                <Button size="md" className="w-full text-xs font-medium rounded-md bg-[#285FEA] hover:bg-[#1E4BC8] text-white">
                  Get Job Hunt Pack
                </Button>
              </Link>
            </div>

            {/* Pro Subscription */}
            <div className="p-6 rounded-xl bg-white dark:bg-[#14171C] border border-[#E2E5E9] dark:border-[#252A33] flex flex-col justify-between shadow-xs">
              <div>
                <h3 className="text-base font-bold text-[#1A1D23] dark:text-[#F0F2F5]">Pro Monthly</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-[#1A1D23] dark:text-[#F0F2F5]">₹699</span>
                  <span className="text-xs text-[#848D9A]">/ month</span>
                </div>
                <p className="mt-1 text-xs text-[#5A6270]">For ongoing applications and career transitions.</p>
                <ul className="mt-5 space-y-2.5 text-xs text-[#5A6270] dark:text-[#9EA7B4]">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#285FEA]" />
                    <span>150 credits refreshed monthly</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#285FEA]" />
                    <span>Priority AI model processing</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#285FEA]" />
                    <span>Advanced interview & keyword metrics</span>
                  </li>
                </ul>
              </div>
              <Link href="/login" className="mt-6">
                <Button variant="outline" size="md" className="w-full text-xs font-medium rounded-md">
                  Subscribe Monthly
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          9. FREQUENTLY ASKED QUESTIONS
      ===================================================== */}
      <section className="w-full py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-b border-[#E2E5E9] dark:border-[#252A33] bg-white dark:bg-[#0D0F12]">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1A1D23] dark:text-[#F0F2F5] tracking-tight">
              Frequently asked questions
            </h2>
            <p className="text-xs sm:text-sm text-[#5A6270] dark:text-[#9EA7B4]">
              Clear answers regarding ATS parsing, privacy, and our fact-grounded engine.
            </p>
          </div>

          <div className="divide-y divide-[#E2E5E9] dark:divide-[#252A33]">
            {faqs.map((faq, i) => (
              <div key={i} className="py-5 space-y-2">
                <h3 className="text-sm font-semibold text-[#1A1D23] dark:text-[#F0F2F5]">
                  {faq.question}
                </h3>
                <p className="text-xs sm:text-sm text-[#5A6270] dark:text-[#9EA7B4] leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          10. FINAL BOTTOM CTA
      ===================================================== */}
      <section className="w-full py-16 px-4 sm:px-6 lg:px-8 text-center bg-[#F7F8FA] dark:bg-[#14171C]">
        <div className="max-w-2xl mx-auto space-y-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1A1D23] dark:text-[#F0F2F5] tracking-tight">
            Ready to optimize your next job application?
          </h2>
          <p className="text-xs sm:text-sm text-[#5A6270] dark:text-[#9EA7B4]">
            Create your master profile and compare it with any job description in seconds.
          </p>
          <div className="pt-2">
            <Link href="/login">
              <Button size="lg" className="rounded-md bg-[#285FEA] hover:bg-[#1E4BC8] text-white font-medium text-sm h-11 px-8 shadow-xs">
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
