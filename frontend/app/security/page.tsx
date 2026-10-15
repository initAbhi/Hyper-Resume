import React from 'react';
import { constructMetadata } from '@/lib/seo';
import { ShieldCheck, Lock, EyeOff, KeyRound } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata = constructMetadata({
  title: 'Platform Security & Trust Architecture',
  description: 'Security architecture at HyperResume: Multi-tenant data isolation, encryption in transit and rest, and strict prompt sanitization.',
  path: '/security',
});

export default function SecurityPage() {
  const securityPillars = [
    {
      icon: Lock,
      title: 'End-to-End Encryption',
      desc: 'All network communications are enforced over TLS 1.3. Databases and object storage employ AES-256 encryption at rest.',
    },
    {
      icon: EyeOff,
      title: 'Multi-Tenant Data Isolation',
      desc: 'Every database query enforces strict tenant scoping. A valid UUID alone never confers resource access without matched ownership credentials.',
    },
    {
      icon: ShieldCheck,
      title: 'Untrusted Input Sanitization',
      desc: 'Uploaded resumes and job descriptions are strictly isolated and treated as untrusted data. Prompt-injection attempts cannot alter model instructions.',
    },
    {
      icon: KeyRound,
      title: 'Zero Credential Exposure',
      desc: 'API keys, hashed passwords, and payment secrets are strictly redacted in application logs and isolated from client-side bundles.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-zinc-800 dark:text-zinc-200">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 mb-3">
          Security & Trust Principles
        </h1>
        <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
          How HyperResume safeguards candidate career records, privacy, and system integrity.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {securityPillars.map((pillar, idx) => {
          const IconComp = pillar.icon;
          return (
            <Card key={idx} className="bg-zinc-50/50 dark:bg-zinc-900/50">
              <CardHeader className="pb-2">
                <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 w-fit mb-2">
                  <IconComp className="w-5 h-5" />
                </div>
                <CardTitle className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  {pillar.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {pillar.desc}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
