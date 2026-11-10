'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert } from '@/components/ui/alert';
import {
  Sparkles,
  Copy,
  Check,
  ArrowRight,
  ShieldCheck,
  Wand2,
  Briefcase,
  Target,
} from 'lucide-react';
import Link from 'next/link';
import { apiClient, type BulletVariantOption } from '@/lib/api-client';

type ToolMode = 'improve' | 'generate';

const EXAMPLES = [
  {
    label: 'Backend Engineer',
    role: 'Backend Software Engineer',
    bullet: 'Responsible for developing backend APIs and fixing bugs in production.',
    metric: '',
  },
  {
    label: 'Retail / Operations',
    role: 'Retail Store Manager',
    bullet: 'Managed retail store inventory, trained 6 cashiers, and organized weekly vendor shipments.',
    metric: '',
  },
  {
    label: 'Product Manager',
    role: 'Product Manager',
    bullet: 'Worked with engineering and design to launch the new user onboarding flow.',
    metric: '18% activation lift',
  },
];

export default function BulletImproverPage() {
  const [mode, setMode] = useState<ToolMode>('improve');
  const [bullet, setBullet] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [metricHint, setMetricHint] = useState('');
  const [roleTitle, setRoleTitle] = useState('');
  const [focusArea, setFocusArea] = useState('');

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [variants, setVariants] = useState<BulletVariantOption[]>([]);
  const [verificationNotes, setVerificationNotes] = useState<string>('');
  const [providerUsed, setProviderUsed] = useState<string>('');

  const handleImprove = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!bullet.trim()) return;

    setIsProcessing(true);
    setErrorMessage(null);
    try {
      const res = await apiClient.improveBullet({
        bulletText: bullet.trim(),
        targetRole: targetRole.trim() || undefined,
        metricHint: metricHint.trim() || undefined,
      });

      setVariants(
        res.variants && res.variants.length > 0
          ? res.variants
          : [
              {
                style: 'Impact (XYZ)',
                bullet: res.improvedBullet,
                actionVerbUsed: res.actionVerbUsed,
                framework: res.framework,
                rationale: res.explanation,
              },
            ],
      );
      setVerificationNotes(res.factualVerificationNotes);
      setProviderUsed(res.provider || 'gemini');
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Unable to optimize bullet right now. Please try again.',
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGenerate = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!roleTitle.trim()) return;

    setIsProcessing(true);
    setErrorMessage(null);
    try {
      const res = await apiClient.generateBullets({
        roleTitle: roleTitle.trim(),
        focusArea: focusArea.trim() || undefined,
      });

      setVariants(res.bullets || []);
      setVerificationNotes(res.factualVerificationNotes);
      setProviderUsed(res.provider || 'gemini');
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Unable to generate bullets right now. Please try again.',
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const applyExample = (ex: (typeof EXAMPLES)[number]) => {
    setMode('improve');
    setBullet(ex.bullet);
    setTargetRole(ex.role);
    setMetricHint(ex.metric);
    setErrorMessage(null);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center max-w-2xl mx-auto mb-8">
        <Badge variant="info" className="mb-3">Live Gemini AI Tool</Badge>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
          AI Resume Bullet Improver &amp; Generator
        </h1>
        <p className="mt-3 text-base text-zinc-600 dark:text-zinc-400">
          Transform passive duty statements into domain-authentic STAR &amp; XYZ achievements without inventing fake numbers.
        </p>
      </div>

      {/* Mode Switcher */}
      <div className="flex justify-center mb-6">
        <div className="inline-flex p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700">
          <button
            type="button"
            onClick={() => {
              setMode('improve');
              setErrorMessage(null);
            }}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              mode === 'improve'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Improve Existing Bullet</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('generate');
              setErrorMessage(null);
            }}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              mode === 'generate'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <Wand2 className="w-3.5 h-3.5 text-indigo-600" />
            <span>Generate Bullets for Role</span>
          </button>
        </div>
      </div>

      {errorMessage && (
        <Alert variant="destructive" className="mb-6 text-xs">
          {errorMessage}
        </Alert>
      )}

      {mode === 'improve' ? (
        <Card className="mb-8 shadow-sm">
          <CardHeader className="pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base">Enter Your Existing Bullet Point</CardTitle>
              <CardDescription>
                Paste a responsibility statement from any industry — AI preserves your domain and facts.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {EXAMPLES.map((ex) => (
                <Button
                  key={ex.label}
                  variant="outline"
                  size="sm"
                  onClick={() => applyExample(ex)}
                  className="text-[11px] h-7 px-2.5"
                >
                  {ex.label}
                </Button>
              ))}
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleImprove} className="space-y-4">
              <textarea
                id="bullet-improver-input"
                rows={3}
                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-3 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-600 resize-y"
                placeholder="e.g. Managed retail store inventory, trained 6 cashiers, and organized weekly vendor shipments..."
                value={bullet}
                onChange={(e) => setBullet(e.target.value)}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Target Role (Optional)</span>
                  </label>
                  <input
                    id="bullet-target-role"
                    type="text"
                    placeholder="e.g. Retail Store Manager, Backend Engineer"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Verified Metric / Outcome (Optional)</span>
                  </label>
                  <input
                    id="bullet-metric-hint"
                    type="text"
                    placeholder="e.g. cut checkout wait time by 22%"
                    value={metricHint}
                    onChange={(e) => setMetricHint(e.target.value)}
                    className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                <span className="text-[11px] text-zinc-500 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  Zero-fabrication guard: unconfirmed numbers are never invented.
                </span>
                <Button
                  id="rewrite-star-submit"
                  type="submit"
                  variant="primary"
                  isLoading={isProcessing}
                  disabled={!bullet.trim() || isProcessing}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  {isProcessing ? 'Optimizing with AI...' : 'Rewrite with STAR Method'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Card className="mb-8 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Generate Role-Tailored Resume Bullets</CardTitle>
            <CardDescription>
              Describe your role and core focus areas to generate structured STAR &amp; XYZ starter drafts.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleGenerate} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Role Title <span className="text-rose-500">*</span>
                </label>
                <input
                  id="generate-role-title"
                  type="text"
                  placeholder="e.g. Senior Frontend Engineer, Operations Analyst"
                  value={roleTitle}
                  onChange={(e) => setRoleTitle(e.target.value)}
                  required
                  className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Focus Area, Tools, or Key Accomplishments (Optional)
                </label>
                <textarea
                  id="generate-focus-area"
                  rows={3}
                  placeholder="e.g. Built React design system, migrated legacy checkout flows, mentored 3 junior engineers..."
                  value={focusArea}
                  onChange={(e) => setFocusArea(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-3 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-600 resize-y"
                />
              </div>

              <div className="flex justify-end">
                <Button
                  id="generate-bullets-submit"
                  type="submit"
                  variant="primary"
                  isLoading={isProcessing}
                  disabled={!roleTitle.trim() || isProcessing}
                >
                  <Wand2 className="w-4 h-4 mr-2" />
                  {isProcessing ? 'Generating with AI...' : 'Generate 3 AI Bullets'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {variants.length > 0 && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500">
              AI-Generated STAR / XYZ Alternatives
            </h3>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              <Sparkles className="w-3 h-3" />
              Powered by {providerUsed === 'mock' ? 'Deterministic Engine' : 'Gemini AI'}
            </span>
          </div>

          {verificationNotes && (
            <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/25 border border-emerald-200/80 dark:border-emerald-900 text-xs text-emerald-800 dark:text-emerald-200 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Factual Verification: </span>
                {verificationNotes}
              </div>
            </div>
          )}

          {variants.map((variant, idx) => (
            <Card
              key={`${variant.style}-${idx}`}
              className="border-blue-100 dark:border-blue-900/50 hover:border-blue-300 transition-colors"
            >
              <CardContent className="p-4 space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge variant="info" className="text-[10.5px]">
                      {variant.style}
                    </Badge>
                    <Badge variant="neutral" className="text-[10.5px] font-mono">
                      {variant.framework}
                    </Badge>
                    {variant.actionVerbUsed && (
                      <span className="text-[10.5px] text-zinc-500 font-medium">
                        Verb: <strong className="text-zinc-700 dark:text-zinc-300">{variant.actionVerbUsed}</strong>
                      </span>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(variant.bullet, idx)}
                    className="shrink-0 gap-1.5 text-xs h-7"
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
                </div>

                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 leading-relaxed">
                  {variant.bullet}
                </p>

                {variant.rationale && (
                  <p className="text-[11.5px] text-zinc-500 dark:text-zinc-400">
                    <strong className="text-zinc-700 dark:text-zinc-300">Why it works:</strong> {variant.rationale}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}

          <div className="mt-8 p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-blue-900 dark:text-blue-200">
                Ready to tailor your entire resume inside the live editor?
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-400">
                Build ATS-compliant PDFs, match against job descriptions, and practice AI mock interviews.
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
