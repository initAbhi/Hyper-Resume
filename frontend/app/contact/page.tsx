import React from 'react';
import { constructMetadata } from '@/lib/seo';
import { ContactSupportClient } from '@/components/contact/ContactSupportClient';

export const metadata = constructMetadata({
  title: 'Contact & Support',
  description:
    'Get help from HypeResume Support — 24×7 email monitoring at support@hype-resume.com. Billing, technical, and account questions answered by a real team.',
  path: '/contact',
});

export default function ContactPage() {
  return <ContactSupportClient />;
}
