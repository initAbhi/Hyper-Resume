import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SystemStatusBadge } from '@/components/home/SystemStatusBadge';
import { ProductWorkflowPreview } from '@/components/home/ProductWorkflowPreview';
import {
  constructMetadata,
  getSoftwareApplicationJsonLd,
  getFaqJsonLd,
} from '@/lib/seo';
import {
  ShieldCheck,
  Sparkles,
  ArrowRight,
  FileText,
  Briefcase,
  CheckCircle2,
  Lock,
  Layers,
  FileCheck,
  Eye,
  Sliders,
  Code2,
  Server,
  Layout,
  Terminal,
  HelpCircle,
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
        {/* =========================================================================
            1. HERO SECTION
        ========================================================================= */}
        <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 sm:pt-24 sm:pb-20 text-center flex flex-col items-center">
          <div className="mb-6 flex items-center justify-center gap-3 flex-wrap">
            <SystemStatusBadge />
            <Badge variant="neutral" className="gap-1 text-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              Evidence-Backed Matching
            </Badge>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-zinc-950 dark:text-zinc-50 max-w-4xl leading-[1.15]">
            Build a stronger resume for the{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600">
              job you want.
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed">
            Match your experience to a job description, find what needs improvement, and create a polished application without inventing experience.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
            <Link href="/tools/resume-checker" className="w-full sm:w-auto">
              <Button size="lg" variant="primary" className="w-full sm:w-auto shadow-md group">
                <span>Check My Resume</span>
                <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/login" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Build a Resume
              </Button>
            </Link>
          </div>

          <p className="mt-4 text-xs text-zinc-500 font-medium">
            Free master profile • Instant ATS audit • No credit card required
          </p>

          {/* Deliberate Product Workflow Preview Composition */}
          <div className="mt-14 w-full">
            <ProductWorkflowPreview />
          </div>
        </section>

        {/* =========================================================================
            2. TRUST AND PRIVACY PRINCIPLES
        ========================================================================= */}
        <section className="w-full border-y border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <Badge variant="info" className="mb-2">Our Commitments</Badge>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">
                Truthful Application Principles
              </h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2">
                We believe job applications must be grounded in your authentic achievements.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex flex-col gap-2">
                <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 w-fit">
                  <Lock className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                  Your Experience Remains Yours
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  We never train AI models on your resumes. Candidate data is strictly private and isolated.
                </p>
              </div>

              <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex flex-col gap-2">
                <div className="p-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 w-fit">
                  <Eye className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                  Suggestions Require Your Review
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  We never silently modify your resume. Every rewritten bullet must be confirmed or edited by you.
                </p>
              </div>

              <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex flex-col gap-2">
                <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 w-fit">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                  Zero Hallucinated Skills
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Keywords from the job description are never fabricated into your background without evidence.
                </p>
              </div>

              <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex flex-col gap-2">
                <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 w-fit">
                  <Sliders className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                  Full User Control
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Export your documents or purge all account data permanently whenever you choose.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            3. HOW IT WORKS (3 CLEAR STEPS)
        ========================================================================= */}
        <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge variant="info" className="mb-2">Simple Workflow</Badge>
            <h2 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">
              How HyperResume Works
            </h2>
            <p className="text-base text-zinc-600 dark:text-zinc-400 mt-2">
              Three transparent steps to turn your real background into an interview-ready application.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-zinc-200 dark:border-zinc-800 relative">
              <CardHeader>
                <div className="h-10 w-10 rounded-xl bg-blue-600 text-white font-bold text-lg flex items-center justify-center mb-3 shadow-sm">
                  1
                </div>
                <CardTitle className="text-lg">Upload or Create Your Resume</CardTitle>
                <CardDescription className="text-xs mt-1">
                  Import your existing PDF/DOCX or build a structured profile in our editor.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                We extract your verified roles, projects, and tech stacks into structured data, checking standard ATS header compliance.
              </CardContent>
            </Card>

            <Card className="border-zinc-200 dark:border-zinc-800 relative">
              <CardHeader>
                <div className="h-10 w-10 rounded-xl bg-indigo-600 text-white font-bold text-lg flex items-center justify-center mb-3 shadow-sm">
                  2
                </div>
                <CardTitle className="text-lg">Paste Target Job Description</CardTitle>
                <CardDescription className="text-xs mt-1">
                  Extract required competencies vs. preferred qualifications.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                HyperResume correlates the job requirements against your profile evidence, tagging them as Supported, Unverified, or Missing.
              </CardContent>
            </Card>

            <Card className="border-zinc-200 dark:border-zinc-800 relative">
              <CardHeader>
                <div className="h-10 w-10 rounded-xl bg-emerald-600 text-white font-bold text-lg flex items-center justify-center mb-3 shadow-sm">
                  3
                </div>
                <CardTitle className="text-lg">Review Changes & Export</CardTitle>
                <CardDescription className="text-xs mt-1">
                  Accept evidence-backed suggestions and export a clean PDF.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Strengthen weak bullets with quantifiable STAR achievements. Download high-resolution, parseable PDFs ready for application portals.
              </CardContent>
            </Card>
          </div>
        </section>

        {/* =========================================================================
            4. FREE TOOLS SECTION
        ========================================================================= */}
        <section className="w-full border-y border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/30 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <Badge variant="info" className="mb-2">No Sign-up Required</Badge>
              <h2 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">
                Explore Our Free Career Tools
              </h2>
              <p className="text-base text-zinc-600 dark:text-zinc-400 mt-2">
                Use our diagnostic tools directly in your browser. Real utility, zero paywalls.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <Link href="/tools/resume-checker" className="group">
                <Card className="h-full hover:border-blue-500/50 hover:shadow-md transition-all">
                  <CardHeader>
                    <div className="p-2.5 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 w-fit mb-2">
                      <FileCheck className="w-5 h-5" />
                    </div>
                    <CardTitle className="text-base group-hover:text-blue-600 transition-colors">
                      Resume Checker
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Analyze structure, metrics, active verbs, and section balance.
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>

              <Link href="/tools/job-match" className="group">
                <Card className="h-full hover:border-blue-500/50 hover:shadow-md transition-all">
                  <CardHeader>
                    <div className="p-2.5 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 w-fit mb-2">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <CardTitle className="text-base group-hover:text-blue-600 transition-colors">
                      Job Matcher
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Compare your resume against any job description with evidence tags.
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>

              <Link href="/tools/bullet-improver" className="group">
                <Card className="h-full hover:border-blue-500/50 hover:shadow-md transition-all">
                  <CardHeader>
                    <div className="p-2.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 w-fit mb-2">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <CardTitle className="text-base group-hover:text-blue-600 transition-colors">
                      Bullet Improver
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Rewrite weak responsibility sentences using the STAR method.
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>

              <Link href="/tools/resume-score" className="group">
                <Card className="h-full hover:border-blue-500/50 hover:shadow-md transition-all">
                  <CardHeader>
                    <div className="p-2.5 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-600 w-fit mb-2">
                      <Sliders className="w-5 h-5" />
                    </div>
                    <CardTitle className="text-base group-hover:text-blue-600 transition-colors">
                      Resume Scorecard
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Understand how hiring systems calculate document compatibility.
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            </div>
          </div>
        </section>

        {/* =========================================================================
            5. FEATURE EXPLANATION (REAL BENEFITS)
        ========================================================================= */}
        <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge variant="info" className="mb-2">Platform Capabilities</Badge>
            <h2 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">
              Engineered for Serious Job Seekers
            </h2>
            <p className="text-base text-zinc-600 dark:text-zinc-400 mt-2">
              Features that improve your real application quality, not gimmick AI text generators.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col gap-3">
              <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 w-fit">
                <Briefcase className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                Job-Specific Resume Tailoring
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Branch tailored versions from your master profile for specific roles without overwriting your master career history.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col gap-3">
              <div className="p-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 w-fit">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                Explainable Skill Matching
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                See exactly why each skill matches or fails to match your profile evidence. No opaque scores.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col gap-3">
              <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 w-fit">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                Quantifiable STAR Bullets
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Convert generic duties into active achievements with measurable impact (latency, revenue, team scale).
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col gap-3">
              <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 w-fit">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                Clean ATS Formatting
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Templates strictly adhere to standard typography, margin, and section hierarchy standards recognized by major ATS tools.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col gap-3">
              <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 w-fit">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                Multiple Application Versions
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Maintain organized versions for Frontend, Backend, or Full Stack applications without losing track of your edits.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col gap-3">
              <div className="p-2.5 rounded-lg bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 w-fit">
                <FileCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                Deterministic PDF Export
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Export pixel-perfect, selectable-text PDFs rendered by headless server engines without cut-off margins or weird line breaks.
              </p>
            </div>
          </div>
        </section>

        {/* =========================================================================
            6. ROLE-SPECIFIC EXAMPLES
        ========================================================================= */}
        <section className="w-full border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
              <div>
                <Badge variant="info" className="mb-2">Curated Templates</Badge>
                <h2 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">
                  Role-Specific Resume Guides
                </h2>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2">
                  Real examples and STAR bullet transformations crafted for engineering roles.
                </p>
              </div>
              <Link href="/examples">
                <Button variant="outline" size="sm" className="gap-1.5">
                  View All Examples
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { title: 'Software Engineer', href: '/examples/software-engineer', icon: Code2, desc: 'Generalist engineering resumes focusing on scale, clean architecture, and product delivery.' },
                { title: 'Backend Developer', href: '/examples/backend-developer', icon: Server, desc: 'High-throughput database tuning, REST/gRPC APIs, and concurrency patterns.' },
                { title: 'Frontend Developer', href: '/examples/frontend-developer', icon: Layout, desc: 'Design systems, accessibility, Next.js architecture, and Core Web Vitals.' },
                { title: 'Full Stack Developer', href: '/examples/full-stack-developer', icon: Layers, desc: 'End-to-end ownership spanning client UIs, database schemas, and CI/CD pipelines.' },
                { title: 'DevOps / SRE', href: '/examples/devops-engineer', icon: Terminal, desc: 'Kubernetes orchestration, Terraform automation, observability, and cloud cost reduction.' },
                { title: 'Tech Fresher', href: '/examples/fresher', icon: FileText, desc: 'Entry-level developer resumes highlighting DSA problem-solving and validated capstone projects.' },
              ].map((role) => {
                const IconComponent = role.icon;
                return (
                  <Link key={role.title} href={role.href} className="group">
                    <Card className="h-full hover:border-blue-500/50 hover:shadow-sm transition-all p-5">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 group-hover:text-blue-600 transition-colors">
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 transition-colors">
                          {role.title}
                        </h4>
                      </div>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                        {role.desc}
                      </p>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* =========================================================================
            7. PRICING PREVIEW
        ========================================================================= */}
        <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <Badge variant="info" className="mb-2">Fair Pricing</Badge>
            <h2 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">
              Clear, Predictable Pricing
            </h2>
            <p className="text-base text-zinc-600 dark:text-zinc-400 mt-2">
              Start with a free master profile. Upgrade to credit packs or pro only when applying actively.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="border-zinc-200 dark:border-zinc-800 flex flex-col justify-between">
              <CardHeader>
                <CardTitle className="text-lg">Free Starter</CardTitle>
                <div className="text-3xl font-extrabold mt-2">₹0</div>
                <CardDescription className="text-xs mt-1">Free forever for master resumes.</CardDescription>
              </CardHeader>
              <CardContent className="text-xs space-y-2 text-zinc-600 dark:text-zinc-400">
                <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-blue-600" /> 1 Master career profile</div>
                <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-blue-600" /> Standard ATS formatting checks</div>
                <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-blue-600" /> 1 Full Job Match analysis</div>
                <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-blue-600" /> Standard PDF export</div>
              </CardContent>
              <div className="p-6 pt-0">
                <Link href="/register">
                  <Button variant="outline" size="sm" className="w-full">Start Free</Button>
                </Link>
              </div>
            </Card>

            <Card className="border-2 border-blue-600 shadow-xl relative bg-white dark:bg-zinc-900 flex flex-col justify-between">
              <CardHeader>
                <Badge variant="info" className="w-fit mb-1 text-[11px]">Most Popular for Applicants</Badge>
                <CardTitle className="text-lg">Job Hunt Pack</CardTitle>
                <div className="text-3xl font-extrabold mt-2">₹299 <span className="text-xs font-normal text-zinc-500">one-time</span></div>
                <CardDescription className="text-xs mt-1">Pay once, optimize 10 applications.</CardDescription>
              </CardHeader>
              <CardContent className="text-xs space-y-2 text-zinc-600 dark:text-zinc-400">
                <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-blue-600" /> 10 Job-specific tailored versions</div>
                <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-blue-600" /> STAR bullet rewriting assistant</div>
                <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-blue-600" /> Deep evidence analysis report</div>
                <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-blue-600" /> No recurring subscription</div>
              </CardContent>
              <div className="p-6 pt-0">
                <Link href="/register?plan=pack">
                  <Button variant="primary" size="sm" className="w-full">Get Job Hunt Pack</Button>
                </Link>
              </div>
            </Card>

            <Card className="border-zinc-200 dark:border-zinc-800 flex flex-col justify-between">
              <CardHeader>
                <CardTitle className="text-lg">Job Hunt Pro</CardTitle>
                <div className="text-3xl font-extrabold mt-2">₹699 <span className="text-xs font-normal text-zinc-500">/month</span></div>
                <CardDescription className="text-xs mt-1">For ongoing, active career transitions.</CardDescription>
              </CardHeader>
              <CardContent className="text-xs space-y-2 text-zinc-600 dark:text-zinc-400">
                <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-blue-600" /> Unlimited job tailoring</div>
                <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-blue-600" /> Full application tracker pipeline</div>
                <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-blue-600" /> Version history & diff comparison</div>
                <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-blue-600" /> Cancel anytime with 1 click</div>
              </CardContent>
              <div className="p-6 pt-0">
                <Link href="/register?plan=pro">
                  <Button variant="outline" size="sm" className="w-full">Subscribe Monthly</Button>
                </Link>
              </div>
            </Card>
          </div>
        </section>

        {/* =========================================================================
            8. REAL CONCERN FAQ ACCORDION
        ========================================================================= */}
        <section className="w-full border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <Badge variant="info" className="mb-2">Common Questions</Badge>
              <h2 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">
                Frequently Asked Questions
              </h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2">
                Honest answers about ATS compatibility, pricing, and our strict privacy safeguards.
              </p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <Card key={idx} className="border-zinc-200 dark:border-zinc-800">
                  <CardHeader className="py-4">
                    <CardTitle className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2.5">
                      <HelpCircle className="w-4 h-4 text-blue-600 shrink-0" />
                      {faq.question}
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-2 leading-relaxed">
                      {faq.answer}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* =========================================================================
            9. FINAL CONVERSION BANNER
        ========================================================================= */}
        <section className="w-full py-20 bg-gradient-to-b from-transparent to-blue-50/50 dark:to-blue-950/20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
              Ready to create a stronger, truthful application?
            </h2>
            <p className="mt-4 text-base text-zinc-600 dark:text-zinc-400 max-w-xl">
              Start with your master profile or run a free ATS scan on your existing resume in seconds.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
              <Link href="/tools/resume-checker">
                <Button size="lg" variant="primary" className="shadow-lg group">
                  <span>Check My Resume for Free</span>
                  <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline">
                  Sign In to Workspace
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
