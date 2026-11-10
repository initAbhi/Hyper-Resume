'use client';

import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  Check,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  apiClient,
  type ResumeContent,
  type SummaryGenerateResponse,
  type SummaryTone,
} from '@/lib/api-client';

interface SummaryHeadlinePanelProps {
  content: ResumeContent;
  onUpdateHeadline: (headline: string) => void;
  onUpdateSummary: (summary: string) => void;
}

const TONE_FILTERS: Array<'All' | SummaryTone> = [
  'All',
  'Executive',
  'Impact & Metrics',
  'Technical & Concise',
];

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export default function SummaryHeadlinePanel({
  content,
  onUpdateHeadline,
  onUpdateSummary,
}: SummaryHeadlinePanelProps) {
  const [targetRole, setTargetRole] = useState<string>(() => {
    const fromHeadline = content.headline?.split('|')[0]?.trim();
    return fromHeadline || content.experience?.[0]?.title?.trim() || '';
  });
  const [selectedToneFilter, setSelectedToneFilter] = useState<
    'All' | SummaryTone
  >('All');
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [generated, setGenerated] = useState<SummaryGenerateResponse | null>(
    null,
  );

  const summaryWordCount = useMemo(
    () => countWords(content.summary || ''),
    [content.summary],
  );

  const hasCurrentDraft = (content.summary || '').trim().length >= 20;

  const visibleSummaryOptions = useMemo(() => {
    if (!generated?.summaryOptions) return [];
    if (selectedToneFilter === 'All') return generated.summaryOptions;
    const filtered = generated.summaryOptions.filter(
      (opt) => opt.tone === selectedToneFilter,
    );
    return filtered.length > 0 ? filtered : generated.summaryOptions;
  }, [generated, selectedToneFilter]);

  const handleGenerate = async () => {
    const hasProfileSignal =
      Boolean(targetRole.trim()) ||
      Boolean(content.headline?.trim()) ||
      Boolean(content.summary?.trim()) ||
      content.skills.length > 0 ||
      content.experience.length > 0;

    if (!hasProfileSignal) {
      setErrorMessage(
        'Enter a target role or add skills/experience first so AI can tailor verified headlines and summaries.',
      );
      return;
    }

    setErrorMessage(null);
    setIsGenerating(true);

    try {
      const result = await apiClient.generateSummaryAndHeadlines({
        currentHeadline: content.headline?.trim() || undefined,
        currentSummary: content.summary?.trim() || undefined,
        targetRole: targetRole.trim() || undefined,
        skills: content.skills.map((s) => s.name).filter(Boolean),
        experience: content.experience.map((exp) => ({
          title: exp.title || '',
          company: exp.company || '',
          bullets: (exp.bullets || []).filter(Boolean),
        })),
        projects: (content.projects || [])
          .map((proj) => ({
            name: proj.name || '',
            description: proj.description || '',
          }))
          .filter((proj) => proj.name || proj.description),
      });
      setGenerated(result);
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Unable to generate summary options right now.';
      setErrorMessage(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
          Professional Headline &amp; Summary
        </h3>
        <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 px-2 py-0.5 text-[10px] font-semibold text-indigo-700 dark:text-indigo-300">
          <Sparkles className="w-3 h-3" />
          AI Studio
        </span>
      </div>

      <Input
        id="summary-headline"
        label="Professional Headline"
        placeholder="e.g. Senior Backend Engineer | Distributed Systems & Redis"
        value={content.headline}
        onChange={(e) => onUpdateHeadline(e.target.value)}
        required
      />

      <div>
        <div className="flex items-center justify-between mb-1">
          <label
            htmlFor="summary-textarea"
            className="block text-xs font-medium text-zinc-700 dark:text-zinc-300"
          >
            Professional Summary
          </label>
          {hasCurrentDraft && (
            <button
              type="button"
              id="polish-summary-btn"
              onClick={handleGenerate}
              disabled={isGenerating}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 disabled:opacity-50"
            >
              <RefreshCw
                className={`w-3 h-3 ${isGenerating ? 'animate-spin' : ''}`}
              />
              Polish Current Draft
            </button>
          )}
        </div>
        <textarea
          id="summary-textarea"
          rows={5}
          value={content.summary}
          onChange={(e) => onUpdateSummary(e.target.value)}
          className="w-full text-xs p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-600 leading-relaxed"
        />
        <div className="flex justify-between items-center text-[11px] text-zinc-500 mt-1">
          <span>Target: 2-4 sentences highlighting career impact</span>
          <span>{summaryWordCount} words</span>
        </div>
      </div>

      {/* AI Headline & Summary Generator Card */}
      <div className="rounded-xl border border-indigo-200/80 dark:border-indigo-800/70 bg-gradient-to-b from-indigo-50/60 to-white dark:from-indigo-950/30 dark:to-zinc-900 p-3.5 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              AI Headline &amp; Summary Generator
            </p>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
              Generates 3 ATS headlines &amp; 3 tone-distinct summaries from your verified resume history.
            </p>
          </div>
          {generated?.provider && (
            <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800">
              {generated.provider === 'gemini' ? 'Gemini AI' : 'Smart Draft'}
            </span>
          )}
        </div>

        <Input
          id="summary-target-role"
          label="Target Role / Career Focus (Optional)"
          placeholder="e.g. Staff Backend Engineer, FinTech Infrastructure"
          value={targetRole}
          onChange={(e) => setTargetRole(e.target.value)}
        />

        <div>
          <span className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
            Tone View
          </span>
          <div className="flex flex-wrap gap-1.5">
            {TONE_FILTERS.map((tone) => {
              const active = selectedToneFilter === tone;
              return (
                <button
                  key={tone}
                  type="button"
                  onClick={() => setSelectedToneFilter(tone)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors ${
                    active
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:border-indigo-300'
                  }`}
                >
                  {tone === 'All' ? 'All Tones (3)' : tone}
                </button>
              );
            })}
          </div>
        </div>

        <button
          id="generate-summary-headlines-btn"
          type="button"
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3.5 py-2.5 shadow-sm transition-colors disabled:opacity-60 cursor-pointer"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Synthesizing Grounded Headlines &amp; Summaries...
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              {generated
                ? 'Regenerate Headlines & Summaries'
                : 'Generate Headlines & Summaries'}
            </>
          )}
        </button>

        {errorMessage && (
          <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/40 dark:border-red-900 p-2.5 text-[11px] text-red-700 dark:text-red-300">
            <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {generated && (
          <div className="space-y-3 pt-1">
            {/* Headline Options */}
            <div className="space-y-1.5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                Headline Options (1-Click Apply)
              </p>
              <div className="space-y-1.5">
                {generated.headlineSuggestions.map((opt, idx) => {
                  const isApplied =
                    content.headline.trim() === opt.headline.trim();
                  return (
                    <div
                      key={`${opt.style}-${idx}`}
                      className={`rounded-lg border p-2.5 transition-colors ${
                        isApplied
                          ? 'border-emerald-300 bg-emerald-50/70 dark:border-emerald-800 dark:bg-emerald-950/30'
                          : 'border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800/80'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-[10px] font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
                          {opt.style}
                        </span>
                        <button
                          type="button"
                          data-testid={`apply-headline-${idx}`}
                          onClick={() => onUpdateHeadline(opt.headline)}
                          className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-semibold transition-colors cursor-pointer ${
                            isApplied
                              ? 'bg-emerald-600 text-white'
                              : 'bg-zinc-100 hover:bg-indigo-600 text-zinc-700 hover:text-white dark:bg-zinc-700 dark:text-zinc-200'
                          }`}
                        >
                          {isApplied ? (
                            <>
                              <Check className="w-3 h-3" />
                              Applied
                            </>
                          ) : (
                            'Apply'
                          )}
                        </button>
                      </div>
                      <p className="text-xs font-medium text-zinc-900 dark:text-zinc-100 leading-snug">
                        {opt.headline}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Summary Draft Cards */}
            <div className="space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                Summary Drafts by Tone
              </p>
              {visibleSummaryOptions.map((opt, idx) => {
                const isApplied =
                  content.summary.trim() === opt.summary.trim();
                const words = countWords(opt.summary);
                return (
                  <div
                    key={`${opt.tone}-${idx}`}
                    className={`rounded-lg border p-3 space-y-2 transition-colors ${
                      isApplied
                        ? 'border-emerald-300 bg-emerald-50/70 dark:border-emerald-800 dark:bg-emerald-950/30'
                        : 'border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800/80'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="inline-flex items-center rounded-md bg-indigo-100 dark:bg-indigo-900/60 px-2 py-0.5 text-[10px] font-bold text-indigo-800 dark:text-indigo-200">
                          {opt.tone}
                        </span>
                        <span className="text-[10px] text-zinc-500">
                          {words} words
                        </span>
                      </div>
                      <button
                        type="button"
                        data-testid={`apply-summary-${idx}`}
                        onClick={() => onUpdateSummary(opt.summary)}
                        className={`inline-flex items-center gap-1 rounded px-2.5 py-1 text-[11px] font-semibold transition-colors cursor-pointer ${
                          isApplied
                            ? 'bg-emerald-600 text-white'
                            : 'bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white dark:bg-indigo-950 dark:text-indigo-300'
                        }`}
                      >
                        {isApplied ? (
                          <>
                            <Check className="w-3 h-3" />
                            Active Summary
                          </>
                        ) : (
                          'Use This Summary'
                        )}
                      </button>
                    </div>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 italic">
                      Focus: {opt.focus}
                    </p>
                    <p className="text-xs text-zinc-800 dark:text-zinc-200 leading-relaxed">
                      {opt.summary}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Factual Guard Note */}
            <div className="flex items-start gap-2 rounded-lg border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/60 dark:bg-emerald-950/25 p-2.5 text-[11px] text-emerald-800 dark:text-emerald-300">
              <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
              <div>
                <span className="font-semibold">Factual Guard: </span>
                {generated.factualVerificationNotes}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

