'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  FileText, 
  Target, 
  Briefcase, 
  Layers, 
  Download, 
  Shield, 
  Eye, 
  Zap, 
  ChevronDown,
  BarChart3,
  Check,
  Star,
  CheckCheck
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
      question: 'How does HyperResume guarantee ATS compatibility?',
      answer:
        'We strictly implement Applicant Tracking System (ATS) parsing specifications: standard single-column document hierarchies, clean UTF-8 text formatting, and recognized semantic section headers (Experience, Education, Skills). We deliberately avoid multi-column frames, unparseable images, or complex graphics that cause Workday, Greenhouse, and Lever to scramble your text.',
    },
    {
      question: 'Does the AI invent or exaggerate my achievements?',
      answer:
        'Never. HyperResume is built on a strict factual-scaffolding model. Our engine analyzes the facts, metrics, and actions you supply and helps articulate them with greater clarity, stronger action verbs, and quantifiable structure (STAR/XYZ formulas). It never synthesizes false employers, unearned degrees, or fictitious metrics.',
    },
    {
      question: 'Can I manage multiple resumes for different career paths?',
      answer:
        'Yes. You can duplicate your master profile into bespoke versions tailored for specific verticals (e.g., Enterprise B2B SaaS vs. Consumer FinTech). Each version retains its own version history, job match score, and dedicated export settings.',
    },
    {
      question: 'How does job matching differ from a simple keyword counter?',
      answer:
        'Simple keyword counters only check for exact substring matches, often encouraging unreadable keyword stuffing. HyperResume uses semantic requirement analysis: it understands that "A/B Testing" and "Experimentation Frameworks" address the same competency and checks whether your experience demonstrates active execution rather than empty repetition.',
    },
    {
      question: 'Can I export my resume as a PDF for free?',
      answer:
        'Yes! All resumes are rendered using deterministic server-side and vector print engines with crisp, selectable text layers that pass recruiter and automated parser audits with 100% fidelity. Standard unwatermarked PDF export is completely free.',
    },
    {
      question: 'Which ATS engines have you tested HyperResume on?',
      answer:
        'We run automated regression tests against every major parsing engine including Workday, Greenhouse, Ashby, Lever, BambooHR, Taleo, and iCIMS to ensure 100% parse accuracy.',
    },
  ];

  return (
    <div className="flex flex-col items-center overflow-hidden bg-white dark:bg-[#0a0a0a] text-zinc-900 dark:text-zinc-100">
      
      {/* =====================================================
          1. HERO SECTION (Clean, Editorial, High-Converting)
      ===================================================== */}
      <section className="relative w-full pt-10 pb-16 sm:pt-16 sm:pb-24 px-4 sm:px-6 lg:px-8 border-b border-zinc-100 dark:border-zinc-800">
        <div className="relative max-w-5xl mx-auto flex flex-col items-center text-center">
          
          {/* Top Pill Tag (Rezi style: soft blue, rounded full, bold) */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-200/60 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-semibold mb-6">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span>AI Resume Builder & ATS Suite</span>
          </div>

          {/* Main Headline (Editorial two-tone contrast - No cheap rainbow gradients!) */}
          <h1 className="text-[32px] sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-zinc-950 dark:text-white max-w-4xl leading-[1.12]">
            Build an ATS-proof resume.<br />
            <span className="text-zinc-400 dark:text-zinc-500 font-extrabold">
              Not another resume black hole.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-5 text-base sm:text-lg lg:text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed">
            Create recruiter-approved resumes tailored to the exact jobs you want. Engineered to beat Workday, Greenhouse, and Ashby ATS filters with zero hallucinations.
          </p>

          {/* Action CTAs (Clean, solid blue, pill-rounded) */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto">
            <Link href="/login" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm h-12 px-8 shadow-sm hover:shadow transition-all gap-2">
                <span>Build My Resume — Free</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/tools/resume-checker" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-full text-sm font-semibold h-12 px-6">
                Try Free ATS Checker
              </Button>
            </Link>
          </div>

          {/* Star Rating Social Proof (Rezi style: green star + review stats) */}
          <div className="mt-5 flex items-center justify-center gap-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 font-medium">
            <span className="text-emerald-500 font-bold text-base">★</span>
            <span className="font-bold text-zinc-900 dark:text-zinc-100">4.8 / 5.0</span>
            <span>out of 250,000+ resumes built</span>
            <span className="text-zinc-300 dark:text-zinc-700 hidden sm:inline">•</span>
            <span className="hidden sm:inline text-zinc-500">No credit card required</span>
          </div>

          {/* Interactive Hero Studio Display (Clean macOS Window) */}
          <div className="mt-10 sm:mt-14 w-full">
            <InteractiveHeroStudio />
          </div>
        </div>
      </section>

      {/* =====================================================
          2. ATS COMPATIBILITY CLOUD (Rezi Screenshot 3 Style)
      ===================================================== */}
      <section className="w-full border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40">
        <AtsCompatibilityCloud />
      </section>

      {/* =====================================================
          3. COMPANY LOGO CLOUD (Top Hiring Companies)
      ===================================================== */}
      <section className="w-full border-b border-zinc-100 dark:border-zinc-800 bg-white dark:bg-[#0a0a0a]">
        <CompanyLogoCloud />
      </section>

      {/* =====================================================
          4. EDITORIAL VALUE SECTION (Rezi Screenshot 2 & 3 Style)
      ===================================================== */}
      <section className="w-full py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/40 dark:bg-zinc-950/30">
        <div className="max-w-5xl mx-auto space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 text-xs font-semibold">
              Higher Success Rate
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-zinc-950 dark:text-white tracking-tight leading-[1.15]">
              Targeted resumes equal way more interviews.<br />
              <span className="text-zinc-400 dark:text-zinc-500">
                Tailoring a resume is a tested, successful strategy.
              </span>
            </h2>
            <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-2xl mx-auto">
              That feeling of sending a job application and never hearing back? Gone. HyperResume gets your application right in front of the hiring team with verified keyword alignment and STAR metric optimization.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs flex flex-col gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center font-bold">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">100% Single-Column ATS</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Zero multi-column glitches, tables, or unreadable graphics. Every line is parsed in exact chronological order by Workday, Greenhouse, and Ashby.
              </p>
            </div>

            <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs flex flex-col gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center font-bold">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Zero AI Hallucinations</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                We never invent false employers or bogus metrics. Our assistant helps you quantify genuine achievements using proven STAR and XYZ formulas.
              </p>
            </div>

            <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs flex flex-col gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 flex items-center justify-center font-bold">
                <Briefcase className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Live ATS Score Meter</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Instant real-time feedback on action verb density, measurable results, and missing job keywords as you write each bullet.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          5. ATS RESUME TEMPLATES THAT LAND JOBS (Rezi-Style)
      ===================================================== */}
      <section className="w-full py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-b border-zinc-100 dark:border-zinc-800 bg-white dark:bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto">
          <InteractiveTemplateShowcase />
        </div>
      </section>

      {/* =====================================================
          6. REZI-STYLE LIVE SCORE & DIAGNOSTIC SECTION
      ===================================================== */}
      <section className="w-full py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50">
        <div className="max-w-6xl mx-auto">
          <ReziStyleScoreFeatureSection />
        </div>
      </section>

      {/* =====================================================
          7. APPLICATION PIPELINE & TRACKING
      ===================================================== */}
      <section className="w-full py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-b border-zinc-100 dark:border-zinc-800 bg-white dark:bg-[#0a0a0a]">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-5 space-y-5">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600 block">
              Application Pipeline
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight leading-tight">
              Your entire job search, organized in one place.
            </h2>
            <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Consolidate resume preparation, job description matching, and application status tracking into a single cohesive system. Know exactly which tailored version was sent to each company.
            </p>
            <div className="pt-2 flex flex-col gap-2.5 text-xs text-zinc-700 dark:text-zinc-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Track applications: Interested → Applied → Interviewing → Offer</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>One-click resume version association for interview prep</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Interview dates, notes, and salary compensation logs</span>
              </div>
            </div>
            <div className="pt-2">
              <Link href="/login">
                <Button className="rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-6 h-10 gap-2">
                  <span>Explore Application Pipeline</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Visual Mini-Kanban Board */}
          <div className="lg:col-span-7 p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-md">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800 mb-4 text-xs font-bold">
              <span className="text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-blue-600" />
                Active Applications Board
              </span>
              <span className="text-zinc-500 font-normal">Updated 5m ago</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-1.5">
                <div className="flex items-center justify-between font-bold text-zinc-900 dark:text-zinc-100">
                  <span>Google</span>
                  <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 text-[10px] font-semibold">Applied</span>
                </div>
                <p className="text-[11px] text-zinc-500">Staff Backend Architect</p>
                <div className="text-[10px] text-zinc-400 pt-1">CV: Classic ATS v2</div>
              </div>

              <div className="p-3.5 rounded-xl bg-white dark:bg-zinc-950 border border-blue-500/40 space-y-1.5 ring-1 ring-blue-500/20">
                <div className="flex items-center justify-between font-bold text-zinc-900 dark:text-zinc-100">
                  <span>Stripe</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 text-[10px] font-semibold">Interview</span>
                </div>
                <p className="text-[11px] text-zinc-500">Product Analytics Lead</p>
                <div className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold pt-1">Round 2 Tomorrow</div>
              </div>

              <div className="p-3.5 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-1.5">
                <div className="flex items-center justify-between font-bold text-zinc-900 dark:text-zinc-100">
                  <span>Linear</span>
                  <span className="px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 text-[10px] font-semibold">Preparing</span>
                </div>
                <p className="text-[11px] text-zinc-500">Full Stack Generalist</p>
                <div className="text-[10px] text-zinc-400 pt-1">CV: Modern Minimal v1</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          8. TRANSPARENT PRICING
      ===================================================== */}
      <section className="w-full py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600 block mb-2">
              Transparent Pricing
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-950 dark:text-white tracking-tight">
              Invest in your career with total clarity
            </h2>
            <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
              Start free. Pay only when you need deep automated AI rewrites for multiple roles.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Free */}
            <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Free Starter</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-black text-zinc-950 dark:text-white">₹0</span>
                  <span className="text-xs text-zinc-500">/ forever</span>
                </div>
                <p className="mt-2 text-xs text-zinc-500">Ideal for initial resume audit & single-job prep.</p>
                <ul className="mt-6 space-y-3 text-xs text-zinc-600 dark:text-zinc-400">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    <span>Master resume profile editor</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    <span>Instant ATS structure audit</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    <span>Standard unwatermarked PDF export</span>
                  </li>
                </ul>
              </div>
              <Link href="/login" className="mt-8">
                <Button variant="outline" size="md" className="w-full text-xs font-bold rounded-xl">
                  Get Started Free
                </Button>
              </Link>
            </div>

            {/* Job Hunt Pack */}
            <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-zinc-900 border-2 border-blue-600 shadow-xl relative flex flex-col justify-between">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[11px] font-bold px-3 py-0.5 rounded-full shadow-sm">
                Most Popular
              </div>
              <div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Job Hunt Pack</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-black text-zinc-950 dark:text-white">₹299</span>
                  <span className="text-xs text-zinc-500">one-time</span>
                </div>
                <p className="mt-2 text-xs text-zinc-500">Everything needed to optimize 10 distinct applications.</p>
                <ul className="mt-6 space-y-3 text-xs text-zinc-600 dark:text-zinc-400">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    <span>10 tailored resume versions</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    <span>Full AI bullet STAR rewrites</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    <span>Job match gap inspector</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    <span>No recurring subscriptions</span>
                  </li>
                </ul>
              </div>
              <Link href="/register?plan=pack" className="mt-8">
                <Button size="md" className="w-full text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md">
                  Get Job Hunt Pack
                </Button>
              </Link>
            </div>

            {/* Pro Monthly */}
            <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Pro Monthly</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-black text-zinc-950 dark:text-white">₹699</span>
                  <span className="text-xs text-zinc-500">/ month</span>
                </div>
                <p className="mt-2 text-xs text-zinc-500">For active daily job seekers and career transitions.</p>
                <ul className="mt-6 space-y-3 text-xs text-zinc-600 dark:text-zinc-400">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    <span>Unlimited tailored resume versions</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    <span>Full application board pipeline</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    <span>Version history diff & restore</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    <span>Cancel anytime with 1 click</span>
                  </li>
                </ul>
              </div>
              <Link href="/register?plan=pro" className="mt-8">
                <Button variant="outline" size="md" className="w-full text-xs font-bold rounded-xl">
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
      <section className="w-full py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-b border-zinc-100 dark:border-zinc-800 bg-white dark:bg-[#0a0a0a]">
        <div className="max-w-4xl mx-auto space-y-10">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600 block mb-2">
              Clarity & Transparency
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-950 dark:text-white tracking-tight">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <details
                key={idx}
                className="group rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 overflow-hidden"
              >
                <summary className="flex items-center justify-between cursor-pointer px-6 py-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors list-none">
                  {faq.question}
                  <ChevronDown className="w-4 h-4 text-zinc-400 transition-transform group-open:rotate-180 shrink-0 ml-4" />
                </summary>
                <div className="px-6 pb-4 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed border-t border-zinc-100 dark:border-zinc-800 pt-3">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          10. FINAL CALL TO ACTION (Rezi Style Clean Card)
      ===================================================== */}
      <section className="w-full py-20 px-4 sm:px-6 lg:px-8 bg-zinc-50 dark:bg-zinc-950">
        <div className="max-w-4xl mx-auto rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 sm:p-14 text-center shadow-xl space-y-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            Ready to land your dream role?
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-950 dark:text-white tracking-tight">
            Put your next application together with intention.
          </h2>
          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto leading-relaxed">
            Join thousands of candidates landing more interviews with clean, recruiter-certified resumes.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/login" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-8 h-12 shadow-md">
                Build My Resume — Free
              </Button>
            </Link>
            <Link href="/tools/resume-checker" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-full text-sm font-semibold h-12 px-6">
                Free ATS Audit
              </Button>
            </Link>
          </div>
          <p className="text-[11px] text-zinc-400">
            No credit card required · Instant unwatermarked PDF export
          </p>
        </div>
      </section>

    </div>
  );
}
