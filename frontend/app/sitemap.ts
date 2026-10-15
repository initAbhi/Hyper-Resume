import { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  const currentDate = new Date().toISOString();

  const routes = [
    { url: '', priority: 1.0, changeFrequency: 'weekly' as const },
    { url: '/tools/resume-checker', priority: 0.9, changeFrequency: 'weekly' as const },
    { url: '/tools/resume-score', priority: 0.8, changeFrequency: 'weekly' as const },
    { url: '/tools/job-match', priority: 0.9, changeFrequency: 'weekly' as const },
    { url: '/tools/bullet-improver', priority: 0.8, changeFrequency: 'weekly' as const },
    { url: '/examples', priority: 0.8, changeFrequency: 'weekly' as const },
    { url: '/examples/software-engineer', priority: 0.8, changeFrequency: 'monthly' as const },
    { url: '/examples/backend-developer', priority: 0.8, changeFrequency: 'monthly' as const },
    { url: '/examples/frontend-developer', priority: 0.8, changeFrequency: 'monthly' as const },
    { url: '/examples/full-stack-developer', priority: 0.8, changeFrequency: 'monthly' as const },
    { url: '/examples/devops-engineer', priority: 0.8, changeFrequency: 'monthly' as const },
    { url: '/examples/fresher', priority: 0.8, changeFrequency: 'monthly' as const },
    { url: '/pricing', priority: 0.8, changeFrequency: 'weekly' as const },
    { url: '/privacy', priority: 0.3, changeFrequency: 'monthly' as const },
    { url: '/terms', priority: 0.3, changeFrequency: 'monthly' as const },
    { url: '/security', priority: 0.4, changeFrequency: 'monthly' as const },
  ];

  return routes.map((route) => ({
    url: `${SITE_URL}${route.url}`,
    lastModified: currentDate,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
