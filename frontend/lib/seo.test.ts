import { describe, expect, it } from 'bun:test';
import { constructMetadata, getSoftwareApplicationJsonLd, getFaqJsonLd, SITE_NAME, SITE_URL } from './seo';

describe('SEO Utilities', () => {
  it('should construct metadata with canonical URL and openGraph properties', () => {
    const meta = constructMetadata({
      title: 'Free Resume Checker',
      description: 'Check your resume for ATS compatibility.',
      path: '/tools/resume-checker',
    });

    expect(meta.title).toBe(`Free Resume Checker | ${SITE_NAME}`);
    expect(meta.description).toBe('Check your resume for ATS compatibility.');
    expect(meta.alternates?.canonical).toBe(`${SITE_URL}/tools/resume-checker`);
    expect(meta.openGraph?.title).toBe(`Free Resume Checker | ${SITE_NAME}`);
    expect(meta.openGraph?.url).toBe(`${SITE_URL}/tools/resume-checker`);
    const robots = meta.robots as { index?: boolean; follow?: boolean } | undefined;
    expect(robots?.index).toBe(true);
    expect(robots?.follow).toBe(true);
  });

  it('should handle noIndex paths properly', () => {
    const meta = constructMetadata({
      title: 'Private Workspace',
      path: '/app/resumes',
      noIndex: true,
    });

    const robots = meta.robots as { index?: boolean; follow?: boolean } | undefined;
    expect(robots?.index).toBe(false);
    expect(robots?.follow).toBe(false);
  });

  it('should generate valid SoftwareApplication JSON-LD', () => {
    const jsonLd = getSoftwareApplicationJsonLd();

    expect(jsonLd['@context']).toBe('https://schema.org');
    expect(jsonLd['@type']).toBe('SoftwareApplication');
    expect(jsonLd.name).toBe('HyperResume');
    expect(jsonLd.offers.priceCurrency).toBe('INR');
  });

  it('should generate valid FAQPage JSON-LD schema', () => {
    const faqs = [
      {
        question: 'Does HyperResume fabricate work history?',
        answer: 'No. HyperResume never invents metrics, skills, or job experience.',
      },
      {
        question: 'Is my data used for model training?',
        answer: 'Never. We enforce zero data retention policies with our API providers.',
      },
    ];

    const jsonLd = getFaqJsonLd(faqs);

    expect(jsonLd['@context']).toBe('https://schema.org');
    expect(jsonLd['@type']).toBe('FAQPage');
    expect(jsonLd.mainEntity).toHaveLength(2);
    expect(jsonLd.mainEntity[0].name).toBe('Does HyperResume fabricate work history?');
    expect(jsonLd.mainEntity[0].acceptedAnswer.text).toBe(
      'No. HyperResume never invents metrics, skills, or job experience.'
    );
  });
});
