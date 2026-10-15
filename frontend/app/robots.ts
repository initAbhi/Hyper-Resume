import { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/tools/',
          '/tools/*',
          '/examples/',
          '/examples/*',
          '/pricing',
          '/privacy',
          '/terms',
          '/security',
        ],
        disallow: [
          '/app/',
          '/app/*',
          '/api/',
          '/api/*',
          '/login',
          '/register',
          '/*?*preview=*',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
