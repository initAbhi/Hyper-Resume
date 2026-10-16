import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { constructMetadata } from '@/lib/seo';
import { ArrowLeft, ArrowRight, AlertTriangle, Sparkles } from 'lucide-react';

interface RoleData {
  title: string;
  summary: string;
  skills: { category: string; list: string[] }[];
  starBullets: { before: string; after: string; context: string }[];
  mistakesToAvoid: string[];
}

const ROLES: Record<string, RoleData> = {
  'software-engineer': {
    title: 'Software Engineer',
    summary: 'Results-driven Software Engineer with proven experience designing modular, scalable distributed systems and shipping high-performance production code.',
    skills: [
      { category: 'Languages', list: ['TypeScript', 'Python', 'Go', 'Java'] },
      { category: 'Architecture', list: ['Microservices', 'REST APIs', 'Event-Driven Architecture', 'System Design'] },
      { category: 'Data & Cloud', list: ['PostgreSQL', 'Redis', 'Docker', 'AWS', 'GitHub Actions'] },
    ],
    starBullets: [
      {
        before: 'Responsible for writing APIs and managing database tables.',
        after: 'Architected 8+ mission-critical REST microservices in TypeScript, reducing checkout p95 latency by 32% across 800K daily active users.',
        context: 'Replaces passive responsibility statement with specific architecture role and quantifiable business latency impact.',
      },
      {
        before: 'Worked on automated tests and improved pipeline speed.',
        after: 'Parallelized CI/CD workflow in GitHub Actions with Docker layer caching, cutting build deployment time from 16 to 4 minutes.',
        context: 'Demonstrates tangible engineering efficiency gains with concrete time metrics.',
      },
    ],
    mistakesToAvoid: [
      'Listing 25+ programming languages without deep project evidence.',
      'Omitting quantifiable throughput, latency, or user scale metrics.',
      'Using vague phrases like "worked on" or "assisted with" instead of active engineering verbs.',
    ],
  },
  'backend-developer': {
    title: 'Backend Developer',
    summary: 'Backend Engineer specializing in resilient database design, concurrent API systems, and performance tuning for high-throughput enterprise platforms.',
    skills: [
      { category: 'Core Stack', list: ['Node.js', 'Go', 'Python', 'Java Spring Boot'] },
      { category: 'Databases & Storage', list: ['PostgreSQL', 'MySQL', 'Redis', 'Kafka', 'Elasticsearch'] },
      { category: 'Infrastructure', list: ['Docker', 'Kubernetes', 'Linux', 'gRPC', 'RabbitMQ'] },
    ],
    starBullets: [
      {
        before: 'Managed database queries and optimized slow endpoints.',
        after: 'Refactored unindexed PostgreSQL queries and introduced Redis caching layers, reducing peak database CPU usage by 45% during flash sales.',
        context: 'Shows deep database diagnostic ability and measured resource utilization savings.',
      },
      {
        before: 'Integrated third-party payment gateways.',
        after: 'Engineered idempotent webhook processing pipeline with Redis distributed locks, eliminating duplicate transaction anomalies across ₹12M monthly volume.',
        context: 'Highlights critical backend reliability invariants: idempotency, distributed locking, and financial volume.',
      },
    ],
    mistakesToAvoid: [
      'Failing to mention database indexing, transaction isolation, or locking strategies.',
      'Ignoring error-handling, rate-limiting, and resilience patterns in bullet points.',
      'Treating database CRUD operations as high-impact accomplishments without metrics.',
    ],
  },
  'frontend-developer': {
    title: 'Frontend Developer',
    summary: 'Frontend Engineer passionate about design systems, accessible semantic markup, Core Web Vitals, and smooth, responsive client-side architectures.',
    skills: [
      { category: 'Client Technologies', list: ['React', 'Next.js', 'TypeScript', 'TailwindCSS', 'HTML5/CSS3'] },
      { category: 'State & Testing', list: ['Zustand', 'TanStack Query', 'Jest', 'Playwright', 'Storybook'] },
      { category: 'Performance', list: ['Core Web Vitals (LCP/CLS)', 'Bundle Optimization', 'Code-Splitting'] },
    ],
    starBullets: [
      {
        before: 'Built the company web pages and improved responsiveness.',
        after: 'Engineered responsive design system in React with accessible WCAG AAA compliant tokens, cutting design-to-production handoff cycle time by 50%.',
        context: 'Positions developer as an architectural contributor improving team velocity.',
      },
      {
        before: 'Fixed slow page loads on mobile browsers.',
        after: 'Optimized Next.js bundle sizes and font loading strategy, improving mobile Largest Contentful Paint (LCP) from 3.8s to 1.4s and boosting conversion by 12%.',
        context: 'Connects technical Web Vitals optimization directly to commercial product conversion.',
      },
    ],
    mistakesToAvoid: [
      'Focusing solely on styling without mentioning client-side performance, accessibility, or test coverage.',
      'Listing outdated libraries (e.g. jQuery) alongside modern frameworks without context.',
      'Ignoring responsive mobile layout optimization.',
    ],
  },
  'full-stack-developer': {
    title: 'Full Stack Developer',
    summary: 'Versatile Full Stack Engineer bridging performant React/Next.js client interfaces with resilient Node.js microservices and relational databases.',
    skills: [
      { category: 'Frontend', list: ['TypeScript', 'React', 'Next.js', 'TailwindCSS'] },
      { category: 'Backend', list: ['Node.js', 'Express/NestJS', 'PostgreSQL', 'Prisma/TypeORM'] },
      { category: 'DevOps & Tooling', list: ['Docker', 'AWS (S3/EC2)', 'Git', 'Vercel', 'Vitest'] },
    ],
    starBullets: [
      {
        before: 'Built full stack features from user interface to database.',
        after: 'Delivered end-to-end multi-tenant organization management feature across Next.js and NestJS, adopted by 400+ enterprise accounts in Q2.',
        context: 'Proves ownership across all tiers of the application stack.',
      },
      {
        before: 'Created authentication system for the app.',
        after: 'Implemented secure OAuth2 and session token refresh protocol with HTTP-only cookies, eliminating session timeout drop-offs by 60%.',
        context: 'Shows security awareness and positive user retention impact.',
      },
    ],
    mistakesToAvoid: [
      'Listing 50 different disconnected tools without demonstrating deep mastery in any stack.',
      'Neglecting backend database design and indexing.',
      'Claiming full-stack capability without mentioning deployment or testing.',
    ],
  },
  'devops-engineer': {
    title: 'DevOps / SRE Engineer',
    summary: 'DevOps & Site Reliability Engineer focused on infrastructure-as-code, automated zero-downtime CI/CD, Kubernetes clusters, and cloud cost governance.',
    skills: [
      { category: 'Containers & Orchestration', list: ['Kubernetes (k8s)', 'Docker', 'Helm', 'ArgoCD'] },
      { category: 'IaC & Cloud', list: ['Terraform', 'AWS', 'Google Cloud', 'Ansible'] },
      { category: 'Monitoring & CI/CD', list: ['Prometheus', 'Grafana', 'GitHub Actions', 'Datadog'] },
    ],
    starBullets: [
      {
        before: 'Maintained servers and helped developers deploy code.',
        after: 'Architected automated GitOps deployment pipeline using ArgoCD on EKS, reducing release rollback frequency from 12% to under 0.5%.',
        context: 'Demonstrates modern declarative infrastructure standards and concrete error reduction.',
      },
      {
        before: 'Managed cloud costs on AWS.',
        after: 'Audited cloud resource overprovisioning and migrated batch workloads to AWS Graviton spot instances, trimming monthly AWS spend by ₹4.2L (24%).',
        context: 'Quantifiable commercial cost-saving impact that executives love.',
      },
    ],
    mistakesToAvoid: [
      'Listing tools without explaining what automation or reliability outcomes they produced.',
      'Omitting security, IAM policies, and secret management practices.',
      'Treating manual server management as modern DevOps engineering.',
    ],
  },
  'fresher': {
    title: 'Computer Science Fresher / Graduate',
    summary: 'Enthusiastic Computer Science graduate with strong foundational knowledge in data structures, algorithms, relational databases, and full-stack web projects.',
    skills: [
      { category: 'Languages', list: ['Java', 'C++', 'JavaScript', 'TypeScript', 'SQL'] },
      { category: 'Web Development', list: ['React', 'Node.js', 'Express', 'HTML5/CSS3'] },
      { category: 'Fundamentals', list: ['Data Structures & Algorithms', 'DBMS', 'Operating Systems', 'Git'] },
    ],
    starBullets: [
      {
        before: 'Made a college project for student attendance.',
        after: 'Developed full-stack Student Attendance Tracker in React and Node.js with QR code authentication, piloted across 3 departments with 450+ daily scans.',
        context: 'Turns an academic project into an active, validated product with real user adoption.',
      },
      {
        before: 'Solved problems on LeetCode.',
        after: 'Solved 350+ data structure and algorithm problems across LeetCode and CodeChef, achieving top 15% ranking in global algorithmic contests.',
        context: 'Demonstrates disciplined problem-solving and competitive validation.',
      },
    ],
    mistakesToAvoid: [
      'Cluttering the resume with high school details or non-technical hobbies.',
      'Listing generic tutorial clones (e.g. basic to-do list) without customization or real deployment.',
      'Omitting live demo URLs and GitHub repository links for listed projects.',
    ],
  },
};

export async function generateStaticParams() {
  return Object.keys(ROLES).map((role) => ({ role }));
}

export async function generateMetadata({ params }: { params: Promise<{ role: string }> }) {
  const { role } = await params;
  const data = ROLES[role];
  if (!data) return {};

  return constructMetadata({
    title: `${data.title} Resume Guide & Examples`,
    description: `Complete ATS-friendly guide for ${data.title}s. Real STAR bullet points, required technical skills, and common resume mistakes to avoid.`,
    path: `/examples/${role}`,
  });
}

export default async function RoleExamplePage({
  params,
}: {
  params: Promise<{ role: string }>;
}) {
  const { role } = await params;
  const data = ROLES[role];

  if (!data) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <Link
        href="/examples"
        className="inline-flex items-center text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1.5" />
        Back to All Examples
      </Link>

      <div className="border-b border-zinc-200 dark:border-zinc-800 pb-8 mb-10">
        <Badge variant="info" className="mb-3">Role Deep-Dive</Badge>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
          {data.title} Resume Guide & STAR Examples
        </h1>
        <p className="mt-4 text-base sm:text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
          {data.summary}
        </p>
      </div>

      {/* Recommended Skills Matrix */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
          Recommended Technical Stack Breakdown
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data.skills.map((cat, idx) => (
            <Card key={idx} className="bg-zinc-50/50 dark:bg-zinc-900/50">
              <CardHeader className="py-3">
                <CardTitle className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                  {cat.category}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-wrap gap-1.5">
                  {cat.list.map((s) => (
                    <Badge key={s} variant="neutral" className="text-xs">
                      {s}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* STAR Bullet Point Transformations */}
      <section className="mb-12">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            Before vs. After STAR Bullet Transformations
          </h2>
        </div>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
          Compare weak responsibilities with evidence-backed STAR achievements hiring panels respect:
        </p>

        <div className="space-y-6">
          {data.starBullets.map((bullet, idx) => (
            <Card key={idx} className="border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
              <div className="p-4 bg-rose-50/40 dark:bg-rose-950/20 border-b border-zinc-200 dark:border-zinc-800">
                <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400 block mb-1">
                  ❌ Weak / Generic (Rejected by Panels)
                </span>
                <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 font-mono italic">
                  &quot;{bullet.before}&quot;
                </p>
              </div>

              <div className="p-4 bg-emerald-50/40 dark:bg-emerald-950/20">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block mb-1">
                  ✅ Strong STAR Transformation (Evidence-Backed)
                </span>
                <p className="text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 font-medium leading-relaxed">
                  &quot;{bullet.after}&quot;
                </p>
                <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                  💡 <strong>Why this works:</strong> {bullet.context}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Common Mistakes to Avoid */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
          Common Mistakes for {data.title} Resumes
        </h2>
        <div className="space-y-3">
          {data.mistakesToAvoid.map((mistake, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-lg border border-amber-200 dark:border-amber-900/60 bg-amber-50/30 dark:bg-amber-950/20 flex items-start gap-3 text-xs sm:text-sm text-amber-900 dark:text-amber-300"
            >
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>{mistake}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Action CTA */}
      <div className="p-8 rounded-2xl bg-zinc-900 text-white dark:bg-zinc-800 text-center flex flex-col items-center gap-4">
        <h3 className="text-xl font-bold">
          Tailor Your {data.title} Resume Now
        </h3>
        <p className="text-sm text-zinc-300 max-w-md mx-auto">
          Audit your existing resume against target job descriptions with 100% verified evidence.
        </p>
        <Link href="/tools/resume-checker">
          <Button variant="primary" size="md" className="shadow-lg">
            Check My Resume for Free
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
