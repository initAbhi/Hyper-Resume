import type { Metadata } from 'next';
import { constructMetadata } from '@/lib/seo';

export const metadata: Metadata = constructMetadata({
  title: 'Free AI Resume Bullet Point Improver & STAR/XYZ Generator — HypeResume',
  description:
    'Rewrite passive resume bullets into metric-driven STAR and XYZ achievement statements powered by AI with zero hallucinated metrics.',
  path: '/tools/bullet-improver',
});

export default function BulletImproverLayout({ children }: { children: React.ReactNode }) {
  return children;
}

