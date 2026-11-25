import type { Metadata } from 'next';

export const SITE_NAME = 'HypeResume';
export const SITE_URL =
  process.env.NEXT_PUBLIC_APP_URL || 'https://hype-resume.com';
export const DEFAULT_DESCRIPTION =
  'Turn your real experience into a stronger, truthful, job-specific application. Evidence-backed resume builder, truthful ATS checks, and explainable job matching.';

export interface MetadataOptions {
  title: string;
  description?: string;
  path?: string;
  image?: string;
  noIndex?: boolean;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
}

export function constructMetadata({
  title,
  description = DEFAULT_DESCRIPTION,
  path = '',
  image = '/og-image.png',
  noIndex = false,
  type = 'website',
  publishedTime,
  modifiedTime,
  authors,
}: MetadataOptions): Metadata {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const canonicalUrl = `${SITE_URL}${cleanPath}`;
  const fullTitle = `${title} | ${SITE_NAME}`;

  return {
    title: fullTitle,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: fullTitle,
      description,
      url: canonicalUrl,
      siteName: SITE_NAME,
      images: [
        {
          url: `${SITE_URL}${image}`,
          width: 1200,
          height: 630,
          alt: `${title} preview`,
        },
      ],
      type,
      locale: 'en_US',
      ...(type === 'article' && {
        publishedTime,
        modifiedTime,
        authors,
      }),
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [`${SITE_URL}${image}`],
      creator: '@HypeResumeAI',
    },
    robots: {
      index: !noIndex,
      follow: !noIndex,
      googleBot: {
        index: !noIndex,
        follow: !noIndex,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

/**
 * Valid JSON-LD Structured Data for HypeResume SoftwareApplication
 */
export function getSoftwareApplicationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'HypeResume',
    operatingSystem: 'All (Web-based)',
    applicationCategory: 'BusinessApplication',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'INR',
    },
    description: DEFAULT_DESCRIPTION,
    url: SITE_URL,
  };
}

/**
 * Valid JSON-LD Structured Data for FAQ items
 */
export function getFaqJsonLd(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/**
 * Valid JSON-LD Structured Data for BlogPosting
 */
export function getBlogPostingJsonLd({
  title,
  description,
  path,
  publishedAt,
  updatedAt,
  authorName,
  authorRole,
  image = '/og-image.png',
}: {
  title: string;
  description: string;
  path: string;
  publishedAt: string;
  updatedAt: string;
  authorName: string;
  authorRole?: string;
  image?: string;
}) {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description,
    image: [`${SITE_URL}${image}`],
    datePublished: publishedAt,
    dateModified: updatedAt,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}${cleanPath}`,
    },
    author: {
      '@type': 'Person',
      name: authorName,
      ...(authorRole ? { jobTitle: authorRole } : {}),
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/icon.png`,
      },
    },
  };
}

/**
 * Valid JSON-LD Structured Data for BreadcrumbList
 */
export function getBreadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.name,
      item: `${SITE_URL}${item.path.startsWith('/') ? item.path : `/${item.path}`}`,
    })),
  };
}
