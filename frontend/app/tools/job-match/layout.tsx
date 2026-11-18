import type { Metadata } from 'next';
import { constructMetadata } from '@/lib/seo';

export const metadata: Metadata = constructMetadata({
  title: 'Free Resume-to-Job Description Match Analyzer — HypeResume',
  description:
    'Compare your resume against any job posting to uncover missing ATS keywords, evidence gaps, and recruiter fit scores without fabricating skills.',
  path: '/tools/job-match',
});

export default function JobMatchToolLayout({ children }: { children: React.ReactNode }) {
  return children;
}

