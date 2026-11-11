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
}

export function constructMetadata({
  title,
  description = DEFAULT_DESCRIPTION,
  path = '',
  image = '/og-image.png',
  noIndex = false,
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
      type: 'website',
      locale: 'en_US',
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
