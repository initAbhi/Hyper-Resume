import type { Metadata } from 'next';
import { constructMetadata } from '@/lib/seo';

export const metadata: Metadata = constructMetadata({
  title: 'Free ATS Resume Checker & PDF Parser Audit — HypeResume',
  description:
    'Test your PDF or DOCX resume against real ATS parsing rules. Get an instant 5-dimension ATS compatibility score, keyword audit, and impact feedback.',
  path: '/tools/resume-checker',
});

export default function ResumeCheckerLayout({ children }: { children: React.ReactNode }) {
  return children;
}

