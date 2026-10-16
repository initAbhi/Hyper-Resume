import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ProductWorkflowPreview } from '@/components/home/ProductWorkflowPreview';
import {
  constructMetadata,
  getSoftwareApplicationJsonLd,
  getFaqJsonLd,
} from '@/lib/seo';
import {
  ArrowRight,
  FileText,
  Briefcase,
  CheckCircle2,
  Sparkles,
  FileCheck,
  Layers,
  Code2,
  Server,
  Layout,
  Terminal,
  Target,
  BarChart3,
  Download,
  Zap,
  Shield,
  Eye,
  ChevronDown,
} from 'lucide-react';

export const metadata = constructMetadata({
  title: 'HyperResume — Build a Stronger Resume for the Job You Want',
  description:
    'Match your experience to a job description, find what needs improvement, and create a polished application without inventing experience.',
  path: '/',
});

export default function HomePage() {
  const faqs = [
    {
      question: 'What is ATS compatibility?',
      answer:
        'ATS (Applicant Tracking System) software parses resumes into plain text fields (contact, education, work experience, skills). HyperResume formats your document using standard single-column hierarchies and readable fonts so parsers read every word correctly without dropped text.',
    },
    {
      question: 'Can I use HyperResume for free?',
      answer:
        'Yes. You can build and maintain your master resume profile, run free structural ATS checks, test job description matches, and export standard unwatermarked PDFs without paying anything.',
    },
    {
      question: 'Does HyperResume invent skills or fake experience?',
      answer:
        'Never. Our core principle is strict truthfulness. HyperResume classifies requirements into Supported, Needs Confirmation, and Not Evidenced. We will never silently inject unverified technologies or invent metrics you did not achieve.',
    },
    {
      question: 'Can I export my resume as a PDF?',
      answer:
        'Yes. All resumes are rendered using deterministic server-side PDF engines with crisp, selectable text layers that pass recruiter and automated parser audits.',
    },
    {
      question: 'What happens to my uploaded resume?',
      answer:
        'Your resume data remains strictly yours. We do not sell your personal data, and we do not use candidate resumes to train underlying machine-learning models. You can permanently delete your data at any time.',
    },
    {
      question: 'How does job matching work?',
      answer:
        'Paste any job description, and HyperResume extracts required qualifications versus preferred skills. It maps each requirement to evidence found in your real work history and gives you an explainable compatibility breakdown.',
    },
  ];

  const stats = [
    { value: '50K+', label: 'Resumes Created' },
    { value: '78%', label: 'Avg. Match Score' },
    { value: '4.8', label: 'User Rating' },
    { value: '12K+', label: 'Active Users' },
  ];

  return (
    <>
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(getSoftwareApplicationJsonLd()),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(getFaqJsonLd(faqs)),
        }}
      />

      <div className="flex flex-col items-center overflow-hidden">
        {/* =====================================================
            HERO SECTION
        ===================================================== */}
        <section className="relative w-full bg-gradient-hero">
          {/* Subtle grid pattern */}
          <div className="absolute inset-0 bg-grid-pattern pointer-events-none" />
          
          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 sm:pt-28 sm:pb-24 text-center flex flex-col items-center">
            {/* Social Proof Chip */}
            <div className="mb-8 inline-flex items-center gap-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full px-4 py-1.5 shadow-sm animate-fade-in-up">
              <span className="flex -space-x-1.5">
                {[0,1,2,3].map((i) => (
                  <span key={i} className="h-5 w-5 rounded-full border-2 border-white dark:border-zinc-900 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-[8px] text-white font-bold">
                    {['A','J','S','M'][i]}
                  </span>
                ))}
              </span>
              <span className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">
                Trusted by <strong className="text-zinc-900 dark:text-white">12,000+</strong> job seekers
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold tracking-tight text-zinc-900 dark:text-white max-w-3xl leading-[1.1] animate-fade-in-up delay-100" style={{ animationFillMode: 'backwards' }}>
              Build resumes that{' '}
              <span className="text-gradient">
                land interviews
              </span>
            </h1>

            {/* Subheadline */}
            <p className="mt-6 text-lg sm:text-xl text-zinc-500 dark:text-zinc-400 max-w-xl leading-relaxed font-normal animate-fade-in-up delay-200" style={{ animationFillMode: 'backwards' }}>
              Match your resume to any job description, optimize for ATS, and export clean PDFs — all backed by your real experience.
            </p>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto animate-fade-in-up delay-300" style={{ animationFillMode: 'backwards' }}>
              <Link href="/tools/resume-checker" className="w-full sm:w-auto">
                <Button size="lg" variant="primary" className="w-full sm:w-auto shadow-lg hover:shadow-xl transition-shadow group px-8">
                  Try for free
                  <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/login" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Upload your resume
                </Button>
              </Link>
            </div>

            <p className="mt-4 text-xs text-zinc-400 dark:text-zinc-500">
              No credit card required · Free forever plan available
            </p>

            {/* Product Preview */}
            <div className="mt-16 w-full animate-fade-in-up delay-400" style={{ animationFillMode: 'backwards' }}>
              <ProductWorkflowPreview />
            </div>
          </div>
        </section>

        {/* =====================================================
            SOCIAL PROOF STATS BAR
        ===================================================== */}
        <section className="w-full border-y border-zinc-100 dark:border-zinc-800/50 bg-white dark:bg-zinc-950/50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
                    {stat.value}
                  </div>
                  <div className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =====================================================
            HOW IT WORKS — 3 STEPS
        ===================================================== */}
        <section className="w-full py-20 sm:py-28">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-3">
                How it works
              </p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
                Three steps to a stronger resume
              </h2>
              <p className="mt-4 text-base text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Go from a generic resume to a targeted, ATS-optimized application in minutes.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  step: '01',
                  icon: FileText,
                  title: 'Upload your resume',
                  desc: 'Import your existing PDF or DOCX, or build a structured profile from scratch in our editor.',
                  color: 'blue',
                },
                {
                  step: '02',
                  icon: Target,
                  title: 'Paste the job description',
                  desc: 'We extract required qualifications and map each one against evidence found in your real experience.',
                  color: 'violet',
                },
                {
                  step: '03',
                  icon: Download,
                  title: 'Review & export',
                  desc: 'Accept AI-suggested improvements, then export a clean, ATS-compatible PDF ready to submit.',
                  color: 'emerald',
                },
              ].map((item) => (
                <div key={item.step} className="relative group">
                  <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-lg transition-all h-full">
                    <span className="text-xs font-bold text-zinc-300 dark:text-zinc-600 uppercase tracking-widest">
                      Step {item.step}
                    </span>
                    <div className={`mt-4 h-10 w-10 rounded-xl flex items-center justify-center ${
                      item.color === 'blue' ? 'bg-blue-100 dark:bg-blue-950/40 text-blue-600' :
                      item.color === 'violet' ? 'bg-violet-100 dark:bg-violet-950/40 text-violet-600' :
                      'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600'
                    }`}>
                      <item.icon className="w-5 h-5" />
                    </div>
                    <h3 className="mt-4 text-lg font-bold text-zinc-900 dark:text-white">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =====================================================
            FEATURES GRID
        ===================================================== */}
        <section className="w-full py-20 sm:py-28 bg-zinc-50 dark:bg-zinc-950/50 border-y border-zinc-100 dark:border-zinc-800/50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-3">
                Features
              </p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
                Everything you need to land the job
              </h2>
              <p className="mt-4 text-base text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Professional tools that improve your real application quality.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: Target,
                  title: 'Job-Specific Tailoring',
                  desc: 'Create targeted resume versions for each role without overwriting your master profile.',
                  color: 'bg-blue-100 dark:bg-blue-950/40 text-blue-600',
                },
                {
                  icon: BarChart3,
                  title: 'ATS Score Analysis',
                  desc: 'See how your resume scores against real ATS parsing criteria with actionable feedback.',
                  color: 'bg-violet-100 dark:bg-violet-950/40 text-violet-600',
                },
                {
                  icon: Sparkles,
                  title: 'STAR Bullet Rewriting',
                  desc: 'Convert vague responsibilities into quantified achievements that recruiters notice.',
                  color: 'bg-amber-100 dark:bg-amber-950/40 text-amber-600',
                },
                {
                  icon: Shield,
                  title: 'Evidence-Based Only',
                  desc: 'Skills are never fabricated. Every suggestion is grounded in your verified experience.',
                  color: 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600',
                },
                {
                  icon: Layers,
                  title: 'Multiple Versions',
                  desc: 'Maintain organized versions for Frontend, Backend, or Full Stack applications.',
                  color: 'bg-rose-100 dark:bg-rose-950/40 text-rose-600',
                },
                {
                  icon: FileCheck,
                  title: 'Clean PDF Export',
                  desc: 'Pixel-perfect, selectable-text PDFs that pass automated parsers and human review.',
                  color: 'bg-cyan-100 dark:bg-cyan-950/40 text-cyan-600',
                },
              ].map((feature) => (
                <div
                  key={feature.title}
                  className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-md transition-all group"
                >
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${feature.color}`}>
                    <feature.icon className="w-5 h-5" />
                  </div>
                  <h3 className="mt-4 text-base font-bold text-zinc-900 dark:text-white">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =====================================================
            FREE TOOLS
        ===================================================== */}
        <section className="w-full py-20 sm:py-28">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-3">
                Free tools
              </p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
                Try before you sign up
              </h2>
              <p className="mt-4 text-base text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Use these tools directly in your browser — no account required.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                { icon: FileCheck, title: 'Resume Checker', desc: 'Analyze structure, metrics, and active verbs.', href: '/tools/resume-checker', color: 'group-hover:text-blue-600' },
                { icon: Briefcase, title: 'Job Matcher', desc: 'Compare resume against any job description.', href: '/tools/job-match', color: 'group-hover:text-violet-600' },
                { icon: Sparkles, title: 'Bullet Improver', desc: 'Rewrite weak sentences using STAR method.', href: '/tools/bullet-improver', color: 'group-hover:text-amber-600' },
                { icon: Zap, title: 'Resume Score', desc: 'Understand your ATS compatibility score.', href: '/tools/resume-score', color: 'group-hover:text-emerald-600' },
              ].map((tool) => (
                <Link key={tool.title} href={tool.href} className="group">
                  <div className="h-full p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-md transition-all">
                    <tool.icon className={`w-5 h-5 text-zinc-400 transition-colors ${tool.color}`} />
                    <h3 className="mt-3 text-sm font-bold text-zinc-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {tool.title}
                    </h3>
                    <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                      {tool.desc}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* =====================================================
            TRUST SECTION
        ===================================================== */}
        <section className="w-full py-20 sm:py-28 bg-zinc-50 dark:bg-zinc-950/50 border-y border-zinc-100 dark:border-zinc-800/50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-3">
                  Our promise
                </p>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
                  Your career history,<br />never fabricated
                </h2>
                <p className="mt-4 text-base text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-lg">
                  We believe resumes must be grounded in reality. HyperResume will never invent skills, fabricate metrics, or add technologies you haven&apos;t used.
                </p>
              </div>

              <div className="space-y-4">
                {[
                  { icon: Shield, title: 'Evidence-backed only', desc: 'Every suggestion is traceable to your real work history.' },
                  { icon: Eye, title: 'You review everything', desc: 'No silent modifications. Every change requires your explicit approval.' },
                  { icon: FileText, title: 'Your data stays yours', desc: 'We never train AI on your resumes. Delete your data anytime.' },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-4 p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                    <div className="h-10 w-10 shrink-0 rounded-xl bg-blue-100 dark:bg-blue-950/40 flex items-center justify-center text-blue-600">
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-zinc-900 dark:text-white">{item.title}</h3>
                      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            ROLE-SPECIFIC TEMPLATES
        ===================================================== */}
        <section className="w-full py-20 sm:py-28">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
              <div>
                <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-3">
                  Templates
                </p>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
                  ATS-friendly templates by role
                </h2>
                <p className="mt-3 text-base text-zinc-500 dark:text-zinc-400">
                  Proven formats optimized for specific engineering disciplines.
                </p>
              </div>
              <Link href="/examples">
                <Button variant="outline" size="sm" className="gap-1.5 shrink-0">
                  View all templates
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                { title: 'Software Engineer', href: '/examples/software-engineer', icon: Code2, desc: 'Generalist resumes focusing on scale, architecture, and delivery.' },
                { title: 'Backend Developer', href: '/examples/backend-developer', icon: Server, desc: 'Database tuning, REST/gRPC APIs, and concurrency patterns.' },
                { title: 'Frontend Developer', href: '/examples/frontend-developer', icon: Layout, desc: 'Design systems, accessibility, and Core Web Vitals.' },
                { title: 'Full Stack Developer', href: '/examples/full-stack-developer', icon: Layers, desc: 'End-to-end ownership from UI to database to CI/CD.' },
                { title: 'DevOps / SRE', href: '/examples/devops-engineer', icon: Terminal, desc: 'Kubernetes, Terraform, observability, and cost reduction.' },
                { title: 'Tech Fresher', href: '/examples/fresher', icon: FileText, desc: 'Entry-level resumes highlighting projects and problem-solving.' },
              ].map((role) => (
                <Link key={role.title} href={role.href} className="group">
                  <div className="h-full p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-md transition-all">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-9 w-9 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 dark:text-zinc-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        <role.icon className="w-4 h-4" />
                      </div>
                      <h3 className="text-sm font-bold text-zinc-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {role.title}
                      </h3>
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                      {role.desc}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* =====================================================
            PRICING
        ===================================================== */}
        <section className="w-full py-20 sm:py-28 bg-zinc-50 dark:bg-zinc-950/50 border-y border-zinc-100 dark:border-zinc-800/50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-3">
                Pricing
              </p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
                Simple, transparent pricing
              </h2>
              <p className="mt-4 text-base text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Start free. Pay only when you&apos;re actively job hunting.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Free */}
              <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Free</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-zinc-900 dark:text-white">₹0</span>
                  <span className="text-sm text-zinc-500">/forever</span>
                </div>
                <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">Perfect for getting started.</p>
                <ul className="mt-6 space-y-3 flex-1">
                  {['1 master resume profile', 'ATS structure checks', '1 job match analysis', 'Standard PDF export'].map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-zinc-600 dark:text-zinc-400">
                      <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/register" className="mt-8">
                  <Button variant="outline" size="md" className="w-full">Get started</Button>
                </Link>
              </div>

              {/* Pro — Popular */}
              <div className="p-6 rounded-2xl border-2 border-blue-600 bg-white dark:bg-zinc-900 shadow-xl relative flex flex-col">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Job Hunt Pack</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-zinc-900 dark:text-white">₹299</span>
                  <span className="text-sm text-zinc-500">one-time</span>
                </div>
                <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">Optimize 10 applications.</p>
                <ul className="mt-6 space-y-3 flex-1">
                  {['10 tailored resume versions', 'AI bullet rewriting', 'Deep evidence analysis', 'No recurring fees'].map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-zinc-600 dark:text-zinc-400">
                      <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/register?plan=pack" className="mt-8">
                  <Button variant="primary" size="md" className="w-full shadow-md">Get Job Hunt Pack</Button>
                </Link>
              </div>

              {/* Pro Monthly */}
              <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Pro</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-zinc-900 dark:text-white">₹699</span>
                  <span className="text-sm text-zinc-500">/month</span>
                </div>
                <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">For active career transitions.</p>
                <ul className="mt-6 space-y-3 flex-1">
                  {['Unlimited tailoring', 'Application tracker', 'Version history & diff', 'Cancel anytime'].map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-zinc-600 dark:text-zinc-400">
                      <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/register?plan=pro" className="mt-8">
                  <Button variant="outline" size="md" className="w-full">Subscribe monthly</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            FAQ
        ===================================================== */}
        <section className="w-full py-20 sm:py-28">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-3">
                FAQ
              </p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
                Frequently asked questions
              </h2>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <details key={idx} className="group rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 overflow-hidden">
                  <summary className="flex items-center justify-between cursor-pointer px-6 py-4 text-sm font-semibold text-zinc-900 dark:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors list-none">
                    {faq.question}
                    <ChevronDown className="w-4 h-4 text-zinc-400 transition-transform group-open:rotate-180 shrink-0 ml-4" />
                  </summary>
                  <div className="px-6 pb-4 text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    {faq.answer}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* =====================================================
            FINAL CTA
        ===================================================== */}
        <section className="w-full py-20 sm:py-28 border-t border-zinc-100 dark:border-zinc-800/50">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
              Ready to build a stronger resume?
            </h2>
            <p className="mt-4 text-base text-zinc-500 dark:text-zinc-400 max-w-lg mx-auto">
              Join thousands of job seekers who are landing more interviews with HyperResume.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/tools/resume-checker">
                <Button size="lg" variant="primary" className="shadow-lg group px-8">
                  Try for free
                  <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline">
                  Log in
                </Button>
              </Link>
            </div>
            <p className="mt-4 text-xs text-zinc-400 dark:text-zinc-500">
              No credit card required
            </p>
          </div>
        </section>
      </div>
    </>
  );
}
