import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Code, Server, Layout, Layers, Terminal, GraduationCap } from 'lucide-react';
import { constructMetadata } from '@/lib/seo';

export const metadata = constructMetadata({
  title: 'Engineering Resume Examples & STAR Guides',
  description: 'Hand-crafted, ATS-friendly resume examples for software engineers, backend developers, frontend developers, DevOps engineers, and tech freshers.',
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center max-w-3xl mx-auto mb-14">
        <Badge variant="info" className="mb-3">ATS-Approved Examples</Badge>
        <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
          Software Developer Resume Examples
        </h1>
        <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
          Real, evidence-backed resumes designed for engineering hiring panels. No fluff or generic bullet points.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ROLE_EXAMPLES.map((role) => {
          const IconComponent = role.icon;
          return (
            <Link key={role.slug} href={`/examples/${role.slug}`} className="group block">
              <Card className="h-full hover:border-blue-500/50 hover:shadow-md transition-all flex flex-col justify-between">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600">
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <Badge variant="neutral" className="text-xs">
                      {role.experienceLevel}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                    {role.title}
                  </CardTitle>
                  <CardDescription className="text-xs line-clamp-2 mt-1">
                    {role.description}
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {role.skills.map((s) => (
                      <span
                        key={s}
                        className="px-2 py-0.5 rounded text-[11px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center text-xs font-semibold text-blue-600 group-hover:translate-x-1 transition-transform">
                    <span>View Role Guide & Example</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
