import React from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Code, Server, Layout, Layers, Terminal, GraduationCap } from 'lucide-react';
import { constructMetadata } from '@/lib/seo';
import { SampleLibraryView } from '@/components/samples/SampleLibraryView';

export const metadata = constructMetadata({
  title: 'Top Company ATS Resume Library & Examples',
  description: 'Verified ATS-friendly resumes for top companies including Google, Meta, Apple, Amazon, Microsoft, Netflix, Tesla, NVIDIA, and Stripe.',
  path: '/examples',
});

const ROLE_EXAMPLES = [
  {
    slug: 'software-engineer',
    title: 'Software Engineer',
    icon: Code,
    experienceLevel: '2-5 Years',
    skills: ['TypeScript', 'System Design', 'Algorithms', 'CI/CD'],
    description: 'Generalist software engineering resume highlighting end-to-end product delivery, architecture decisions, and code quality.',
  },
  {
    slug: 'backend-developer',
    title: 'Backend Developer',
    icon: Server,
    experienceLevel: '3-6 Years',
    skills: ['Node.js', 'PostgreSQL', 'Microservices', 'Distributed Systems'],
    description: 'Performance-focused backend resume emphasizing database tuning, API resilience, concurrency, and high throughput.',
  },
  {
    slug: 'frontend-developer',
    title: 'Frontend Developer',
    icon: Layout,
    experienceLevel: '2-5 Years',
    skills: ['React', 'Next.js', 'Web Vitals', 'Design Systems', 'TypeScript'],
    description: 'Modern client-side resume featuring accessible UI architectures, Core Web Vitals optimization, and state management.',
  },
  {
    slug: 'full-stack-developer',
    title: 'Full Stack Developer',
    icon: Layers,
    experienceLevel: '3-7 Years',
    skills: ['React', 'Node.js', 'PostgreSQL', 'Docker', 'REST/GraphQL'],
    description: 'Balanced resume covering frontend user interfaces, backend APIs, schema migrations, and cloud deployment pipelines.',
  },
  {
    slug: 'devops-engineer',
    title: 'DevOps / SRE Engineer',
    icon: Terminal,
    experienceLevel: '3-6 Years',
    skills: ['Kubernetes', 'Docker', 'Terraform', 'AWS', 'Prometheus'],
    description: 'Infrastructure and reliability resume highlighting automated zero-downtime deployments, cost reduction, and observability.',
  },
  {
    slug: 'fresher',
    title: 'Computer Science Fresher / Graduate',
    icon: GraduationCap,
    experienceLevel: '0-1 Years',
    skills: ['Data Structures', 'Java/C++', 'Web Projects', 'Git', 'CS Fundamentals'],
    description: 'Entry-level developer resume structured around capstone projects, coding competitions, open-source contributions, and internships.',
  },
];

export default function ExamplesIndexPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto">
        <Badge variant="info" className="mb-3">
          Top Company Benchmarks
        </Badge>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
          ATS Resume Sample Library
        </h1>
        <p className="mt-4 text-base sm:text-lg text-zinc-600 dark:text-zinc-400">
          Explore benchmark resumes engineered for 100% ATS pass rates at top tech, finance, and engineering organizations.
        </p>
      </div>

      {/* Interactive 4-Column Sample Library */}
      <SampleLibraryView isPublic={true} />

      {/* Role-Specific Deep Dive Guides */}
      <div className="pt-12 border-t border-zinc-200 dark:border-zinc-800">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Role-Specific Career Guides
          </h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Deep-dive breakdowns with proven bullet formulas, metrics frameworks, and skill taxonomy.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ROLE_EXAMPLES.map((role) => {
            const IconComponent = role.icon;
            return (
              <Link key={role.slug} href={`/examples/${role.slug}`} className="group block">
                <div className="h-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#141824] p-5 hover:border-blue-500/50 hover:shadow-lg transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600">
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <Badge variant="neutral" className="text-xs">
                        {role.experienceLevel}
                      </Badge>
                    </div>
                    <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 transition-colors">
                      {role.title}
                    </h3>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 line-clamp-2">
                      {role.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {role.skills.slice(0, 3).map((s) => (
                        <span
                          key={s}
                          className="px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                    <ArrowRight className="w-4 h-4 text-blue-600 group-hover:translate-x-1 transition-transform shrink-0" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
