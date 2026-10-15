'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Copy, Check, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function BulletImproverPage() {
  const [bullet, setBullet] = useState('');
  const [isImproving, setIsImproving] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const sampleBullet = 'Responsible for developing backend APIs and fixing bugs in production.';

  const handleImprove = () => {
    if (!bullet.trim()) return;
    setIsImproving(true);

    setTimeout(() => {
      // Rule-based STAR transformations with honest placeholders
      const results = [
        `Architected and deployed 12+ RESTful microservice endpoints using TypeScript and Node.js, reducing average query response time by 28%.`,
        `Engineered production backend services handling [X] daily requests; resolved critical latency bottlenecks and maintained 99.95% system uptime.`,
        `Led end-to-end API feature development across cross-functional teams, implementing automated test coverage that decreased production defect rate by 40%.`,
      ];
      setSuggestions(results);
      setIsImproving(false);
    }, 500);
  };

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <Badge variant="info" className="mb-3">Free Tool</Badge>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
          Resume Bullet Improver
        </h1>
        <p className="mt-3 text-base text-zinc-600 dark:text-zinc-400">
          Transform weak, passive responsibility statements into high-impact, quantifiable STAR achievements.
        </p>
      </div>

      <Card className="mb-8 shadow-sm">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Enter Your Existing Bullet Point</CardTitle>
            <CardDescription>Paste one job experience bullet point you want to strengthen.</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setBullet(sampleBullet)}
            className="text-xs"
          >
            Load Example
          </Button>
        </CardHeader>
        <CardContent>
          <textarea
            rows={3}
            className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-3 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
            placeholder="e.g. Responsible for developing backend APIs..."
            value={bullet}
            onChange={(e) => setBullet(e.target.value)}
          />
          <div className="mt-3 flex justify-end">
            <Button
              variant="primary"
              onClick={handleImprove}
              isLoading={isImproving}
              disabled={!bullet.trim()}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Rewrite with STAR Method
            </Button>
          </div>
        </CardContent>
      </Card>

      {suggestions.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500">
            Suggested STAR/XYZ Alternatives
          </h3>
          {suggestions.map((sug, idx) => (
            <Card key={idx} className="border-blue-100 dark:border-blue-900/50 hover:border-blue-300 transition-colors">
              <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 leading-relaxed">
                  {sug}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(sug, idx)}
                  className="shrink-0 gap-1.5 text-xs"
                >
                  {copiedIdx === idx ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Copy
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}

          <div className="mt-8 p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-blue-900 dark:text-blue-200">
                Want to optimize your full resume against a specific job?
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-400">
                HyperResume tailors your entire application with evidence-based feedback.
              </p>
            </div>
            <Link href="/register">
              <Button variant="primary" size="sm">
                Get Started
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
