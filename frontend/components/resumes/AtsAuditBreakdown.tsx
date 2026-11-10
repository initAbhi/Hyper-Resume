'use client';

import React, { useId } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { ResumeAuditFindings } from '@/lib/api-client';

interface AtsAuditBreakdownProps {
  score?: number;
  findings: ResumeAuditFindings;
  recommendations: string[];
  compact?: boolean;
  showScoreRing?: boolean;
  onOpenFixMistakes?: () => void;
}

function getScoreStrokeColor(score: number): string {
  if (score >= 80) return '#059669';
  if (score >= 55) return '#d97706';
  return '#dc2626';
}

function getStatusBadgeVariant(
  status: 'strong' | 'moderate' | 'needs_work',
): 'success' | 'warning' | 'destructive' {
  if (status === 'strong') return 'success';
  if (status === 'moderate') return 'warning';
  return 'destructive';
}

export function AtsAuditBreakdown({
  score,
  findings,
  recommendations,
  compact = false,
  showScoreRing = false,
  onOpenFixMistakes,
}: AtsAuditBreakdownProps) {
  const uid = useId();
  const dimensions = findings.dimensions || [];
  const parserRisks = findings.parserRisks || [];
  const bullets = findings.bulletQuality || [];
  const stackAlignment = findings.stackAlignment;
  const alertRisks = parserRisks.filter((r) => r.severity !== 'pass');

  return (
    <div className="space-y-3" data-testid="ats-audit-breakdown">
      {/* Optional Progress Ring Summary */}
      {showScoreRing && typeof score === 'number' && (
        <div className="flex items-center gap-4 p-3 rounded-xl bg-zinc-50/80 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/70">
          <div className="hr-progress-ring-wrapper shrink-0">
            <progress
              value={score}
              max={100}
              aria-label="Overall ATS Compatibility Score"
              aria-valuetext={`${score} out of 100`}
              className="hr-progress-ring"
              style={
                {
                  '--value': score,
                  '--size': '84px',
                  '--thickness': '8px',
                  '--fill-color': getScoreStrokeColor(score),
                } as React.CSSProperties
              }
            />
            <div className="hr-progress-ring-content" aria-hidden="true">
              <span className="text-xl font-black text-zinc-900 dark:text-zinc-50 leading-none">
                {score}
              </span>
              <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mt-0.5">
                / 100
              </span>
            </div>
          </div>

          <div className="min-w-0 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                {score >= 80
                  ? 'Strong ATS Readiness'
                  : score >= 55
                    ? 'Moderate ATS Readiness'
                    : 'Needs Structural Tuning'}
              </span>
              <Badge
                variant={
                  score >= 80 ? 'success' : score >= 55 ? 'warning' : 'destructive'
                }
              >
                5-Dimension Audit
              </Badge>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Weighted across formatting, quantified metrics, action verbs, stack proof, and brevity.
            </p>
          </div>
        </div>
      )}

      {/* Quick Counters */}
      <div className={`grid ${compact ? 'grid-cols-2' : 'grid-cols-3'} gap-2 text-center text-xs`}>
        <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60">
          <div className="text-base sm:text-lg font-bold font-mono text-zinc-900 dark:text-zinc-100">
            {findings.metricsCount}
          </div>
          <div className="text-[10px] text-zinc-500 font-medium">Quantified Metrics</div>
        </div>
        <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60">
          <div className="text-base sm:text-lg font-bold font-mono text-zinc-900 dark:text-zinc-100">
            {findings.actionVerbsCount}
          </div>
          <div className="text-[10px] text-zinc-500 font-medium">Action Verbs</div>
        </div>
        {!compact && (
          <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60">
            <div className="text-base sm:text-lg font-bold font-mono text-zinc-900 dark:text-zinc-100">
              {findings.wordCount ?? '—'}
            </div>
            <div className="text-[10px] text-zinc-500 font-medium">Word Count</div>
          </div>
        )}
      </div>

      {/* Writing & Grammar Row */}
      {findings.writingQuality && (
        <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 flex items-center justify-between text-xs">
          <span className="text-zinc-600 dark:text-zinc-300 font-medium">
            Writing &amp; Grammar Health
          </span>
          {onOpenFixMistakes ? (
            <button
              type="button"
              onClick={onOpenFixMistakes}
              className="font-mono font-bold text-blue-600 dark:text-blue-400 hover:underline"
            >
              {findings.writingQuality.score}/100 ({findings.writingQuality.issueCount} flags)
            </button>
          ) : (
            <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
              {findings.writingQuality.score}/100 ({findings.writingQuality.issueCount} flags)
            </span>
          )}
        </div>
      )}

      {/* 5-Dimension Weighted ATS Scorecard */}
      {dimensions.length > 0 && (
        <div
          className="space-y-2.5 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/70"
          data-testid="ats-five-dimension-scorecard"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
              5-Dimension Breakdown
            </span>
            <span className="text-[10px] font-mono text-zinc-400">100% Weighted</span>
          </div>

          <div className="space-y-2.5">
            {dimensions.map((dim) => {
              const progressId = `${uid}-dim-${dim.key}`;
              const fillColor = getScoreStrokeColor(dim.score);
              return (
                <div key={dim.key} className="space-y-1">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <label
                      htmlFor={progressId}
                      className="font-medium text-zinc-800 dark:text-zinc-200 truncate"
                    >
                      {dim.label}{' '}
                      <span className="text-[10px] text-zinc-400 font-normal">
                        ({dim.weight}%)
                      </span>
                    </label>
                    <Badge
                      variant={getStatusBadgeVariant(dim.status)}
                      className="text-[10px] font-mono shrink-0"
                    >
                      {dim.score}/100
                    </Badge>
                  </div>
                  <progress
                    id={progressId}
                    value={dim.score}
                    max={100}
                    className="hr-score-progress"
                    style={{ '--progress-bar-fill': fillColor } as React.CSSProperties}
                  />
                  <p className="text-[10.5px] text-zinc-500 dark:text-zinc-400 leading-snug">
                    {dim.summary}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Expandable Parser Risks, Bullet Audit & Stack Proof Accordions */}
      {(parserRisks.length > 0 || bullets.length > 0 || (stackAlignment && stackAlignment.totalSkills > 0)) && (
        <section
          className="hr-accordion space-y-2"
          aria-label="Detailed ATS Diagnostics"
          data-testid="ats-diagnostics-accordion"
        >
          {parserRisks.length > 0 && (
            <details
              open={alertRisks.length > 0 || !compact}
              className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/70 px-3 py-2"
              data-testid="ats-parser-risks-details"
            >
              <summary className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 py-1 select-none justify-between">
                <span>Parser Risks &amp; Extractability</span>
                <Badge
                  variant={
                    parserRisks.some((r) => r.severity === 'critical')
                      ? 'destructive'
                      : alertRisks.length > 0
                        ? 'warning'
                        : 'success'
                  }
                  className="ml-auto text-[10px]"
                >
                  {alertRisks.length > 0 ? `${alertRisks.length} alert(s)` : 'All Clear'}
                </Badge>
              </summary>
              <div className="pt-2 space-y-1.5">
                {parserRisks.map((risk) => (
                  <div
                    key={risk.id}
                    className={`p-2 rounded-lg text-[11px] flex items-start gap-2 border ${
                      risk.severity === 'pass'
                        ? 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/60 text-emerald-900 dark:text-emerald-200'
                        : risk.severity === 'warning'
                          ? 'bg-amber-50/70 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200'
                          : 'bg-rose-50/70 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60 text-rose-900 dark:text-rose-200'
                    }`}
                  >
                    {risk.severity === 'pass' && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    )}
                    {risk.severity === 'warning' && (
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    )}
                    {risk.severity === 'critical' && (
                      <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                    )}
                    <div className="space-y-0.5">
                      <p className="leading-snug">{risk.message}</p>
                      {risk.fixHint && (
                        <p className="text-[10px] opacity-85">{risk.fixHint}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </details>
          )}

          {bullets.length > 0 && (
            <details
              className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/70 px-3 py-2"
              data-testid="ats-bullet-drilldown-details"
            >
              <summary className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 py-1 select-none justify-between">
                <span>Per-Bullet Quality Audit ({bullets.length})</span>
                <Badge variant="neutral" className="ml-auto text-[10px]">
                  {findings.idealBulletCount ?? bullets.length} balanced
                </Badge>
              </summary>
              <div className="pt-2 space-y-2 max-h-64 overflow-y-auto pr-1">
                {bullets.map((b, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900 text-[11px] space-y-1.5"
                  >
                    <p className="text-zinc-800 dark:text-zinc-200 leading-snug line-clamp-2">
                      {b.bullet}
                    </p>
                    <div className="flex flex-wrap items-center gap-1">
                      <Badge variant={b.hasActionVerb ? 'success' : 'warning'} className="text-[9.5px]">
                        {b.hasActionVerb ? 'Verb ✓' : 'Weak Verb'}
                      </Badge>
                      <Badge variant={b.hasMetric ? 'success' : 'warning'} className="text-[9.5px]">
                        {b.hasMetric ? 'Metric ✓' : 'No Metric'}
                      </Badge>
                      {typeof b.wordCount === 'number' && (
                        <Badge
                          variant={b.lengthStatus === 'ideal' ? 'info' : 'warning'}
                          className="text-[9.5px] font-mono"
                        >
                          {b.wordCount}w
                        </Badge>
                      )}
                    </div>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400">{b.feedback}</p>
                  </div>
                ))}
              </div>
            </details>
          )}

          {stackAlignment && stackAlignment.totalSkills > 0 && (
            <details
              className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/70 px-3 py-2"
              data-testid="ats-stack-alignment-details"
            >
              <summary className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 py-1 select-none justify-between">
                <span>Stack &amp; Evidence Proof</span>
                <Badge
                  variant={
                    stackAlignment.unreferencedSkills.length === 0 ? 'success' : 'warning'
                  }
                  className="ml-auto text-[10px] font-mono"
                >
                  {stackAlignment.corroboratedSkills.length}/{stackAlignment.totalSkills} proved
                </Badge>
              </summary>
              <div className="pt-2 space-y-2 text-[11px]">
                {stackAlignment.corroboratedSkills.length > 0 && (
                  <div>
                    <div className="text-[10px] uppercase font-semibold text-emerald-700 dark:text-emerald-300 mb-1">
                      Evidenced in Bullets ({stackAlignment.corroboratedSkills.length})
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {stackAlignment.corroboratedSkills.map((skill) => (
                        <Badge key={skill} variant="success" className="text-[10px]">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {stackAlignment.unreferencedSkills.length > 0 && (
                  <div>
                    <div className="text-[10px] uppercase font-semibold text-amber-700 dark:text-amber-300 mb-1">
                      Listed Without Bullet Evidence ({stackAlignment.unreferencedSkills.length})
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {stackAlignment.unreferencedSkills.map((skill) => (
                        <Badge key={skill} variant="warning" className="text-[10px]">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </details>
          )}
        </section>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="space-y-1.5">
          <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
            Targeted Improvements
          </span>
          <ul className="space-y-1.5 text-xs">
            {recommendations.map((rec, rIdx) => (
              <li
                key={rIdx}
                className="p-2.5 rounded-lg bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 text-amber-900 dark:text-amber-200 text-[11px] leading-relaxed"
              >
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

