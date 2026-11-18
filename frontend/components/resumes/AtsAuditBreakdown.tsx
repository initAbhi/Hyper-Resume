'use client';

import React, { useState, useId } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Briefcase,
  GraduationCap,
  Sparkles,
  Search,
  Code2,
  FileText,
  Building2,
  Flame,
  Layers,
  ArrowRight,
  Info,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { ResumeAuditFindings } from '@/lib/api-client';

interface AtsAuditBreakdownProps {
  score?: number;
  atsScore?: number;
  matchScore?: number;
  compositeScore?: number;
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
  atsScore,
  matchScore,
  compositeScore,
  findings,
  recommendations,
  compact = false,
  showScoreRing = false,
  onOpenFixMistakes,
}: AtsAuditBreakdownProps) {
  const uid = useId();
  const [activeTab, setActiveTab] = useState<'overview' | 'job_match' | 'bullets' | 'skills' | 'parsed_preview'>(
    'overview',
  );
  const [bulletFilter, setBulletFilter] = useState<'all' | 'needs_work' | 'xyz_met'>('all');

  const dimensions = findings.dimensions || [];
  const parserRisks = findings.parserRisks || [];
  const bullets = findings.bulletQuality || [];
  const stackAlignment = findings.stackAlignment;
  const alertRisks = parserRisks.filter((r) => r.severity !== 'pass');
  const jdMatch = findings.jobDescriptionMatch;
  const atsSim = findings.atsSystemSimulations;
  const parsedPreview = findings.parsedPreview;
  const verbAnalysis = findings.actionVerbAnalysis;

  const effectiveAtsScore =
    typeof atsScore === 'number'
      ? atsScore
      : typeof findings.atsScore === 'number'
        ? findings.atsScore
        : score;

  const effectiveMatchScore =
    typeof matchScore === 'number'
      ? matchScore
      : typeof findings.matchScore === 'number'
        ? findings.matchScore
        : jdMatch?.matchRate;

  const effectiveCompositeScore =
    typeof compositeScore === 'number'
      ? compositeScore
      : typeof findings.compositeScore === 'number'
        ? findings.compositeScore
        : typeof effectiveMatchScore === 'number' && typeof effectiveAtsScore === 'number'
          ? Math.round(effectiveAtsScore * 0.4 + effectiveMatchScore * 0.6)
          : effectiveAtsScore;

  const filteredBullets = bullets.filter((b) => {
    if (bulletFilter === 'needs_work') return !b.hasActionVerb || !b.hasMetric || b.lengthStatus !== 'ideal';
    if (bulletFilter === 'xyz_met') return b.xyzFormulaMet;
    return true;
  });

  return (
    <div className="space-y-4" data-testid="ats-audit-breakdown">
      {/* Optional Progress Ring Summary */}
      {showScoreRing && typeof effectiveAtsScore === 'number' && (
        <div className="space-y-2">
          {effectiveMatchScore !== undefined ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-zinc-50/90 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/70 shadow-sm">
              {/* ATS Resume Quality Card */}
              <div className="flex items-center gap-3 p-2.5 rounded-lg bg-white dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800">
                <div className="hr-progress-ring-wrapper shrink-0">
                  <progress
                    value={effectiveAtsScore}
                    max={100}
                    aria-label="ATS Resume Quality Score"
                    className="hr-progress-ring"
                    style={{
                      '--value': effectiveAtsScore,
                      '--size': '64px',
                      '--thickness': '6px',
                      '--fill-color': getScoreStrokeColor(effectiveAtsScore),
                    } as React.CSSProperties}
                  />
                  <div className="hr-progress-ring-content" aria-hidden="true">
                    <span className="text-base font-black text-zinc-900 dark:text-zinc-50 leading-none">
                      {effectiveAtsScore}
                    </span>
                  </div>
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                    ATS Resume Score
                  </div>
                  <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                    {effectiveAtsScore >= 80 ? 'Strong ATS Quality' : effectiveAtsScore >= 55 ? 'Moderate Quality' : 'Needs Optimization'}
                  </div>
                  <div className="text-[10px] text-zinc-500">
                    Structure &bull; Formatting &bull; Metrics
                  </div>
                </div>
              </div>

              {/* Target Job Match Card */}
              <div className="flex items-center gap-3 p-2.5 rounded-lg bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/60">
                <div className="hr-progress-ring-wrapper shrink-0">
                  <progress
                    value={effectiveMatchScore}
                    max={100}
                    aria-label="Job Description Match Score"
                    className="hr-progress-ring"
                    style={{
                      '--value': effectiveMatchScore,
                      '--size': '64px',
                      '--thickness': '6px',
                      '--fill-color': '#2563eb',
                    } as React.CSSProperties}
                  />
                  <div className="hr-progress-ring-content" aria-hidden="true">
                    <span className="text-base font-black text-blue-600 dark:text-blue-400 leading-none">
                      {effectiveMatchScore}%
                    </span>
                  </div>
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                    Target Job Match
                  </div>
                  <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                    {effectiveMatchScore >= 80 ? 'High Job Alignment' : effectiveMatchScore >= 60 ? 'Moderate Match' : 'Missing Target Skills'}
                  </div>
                  <div className="text-[10px] text-zinc-500 dark:text-zinc-400">
                    Keywords &bull; Skills &bull; Recruiter Boolean
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4 p-3.5 rounded-xl bg-zinc-50/80 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/70 shadow-sm">
              <div className="hr-progress-ring-wrapper shrink-0">
                <progress
                  value={effectiveAtsScore}
                  max={100}
                  aria-label="Overall ATS Compatibility Score"
                  aria-valuetext={`${effectiveAtsScore} out of 100`}
                  className="hr-progress-ring"
                  style={
                    {
                      '--value': effectiveAtsScore,
                      '--size': '84px',
                      '--thickness': '8px',
                      '--fill-color': getScoreStrokeColor(effectiveAtsScore),
                    } as React.CSSProperties
                  }
                />
                <div className="hr-progress-ring-content" aria-hidden="true">
                  <span className="text-xl font-black text-zinc-900 dark:text-zinc-50 leading-none">
                    {effectiveAtsScore}
                  </span>
                  <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mt-0.5">
                    / 100
                  </span>
                </div>
              </div>

              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    {effectiveAtsScore >= 80
                      ? 'Strong ATS Readiness'
                      : effectiveAtsScore >= 55
                        ? 'Moderate ATS Readiness'
                        : 'Needs Structural Tuning'}
                  </span>
                  <Badge
                    variant={
                      effectiveAtsScore >= 80 ? 'success' : effectiveAtsScore >= 55 ? 'warning' : 'destructive'
                    }
                  >
                    5-Dimension Audit
                  </Badge>
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Tested against Workday, Taleo &amp; Greenhouse parsing algorithms and recruiter search heuristics.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-800/60 rounded-lg overflow-x-auto text-xs font-medium text-zinc-600 dark:text-zinc-300">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
            activeTab === 'overview'
              ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm font-semibold'
              : 'hover:text-zinc-900 dark:hover:text-zinc-100'
          }`}
        >
          Overview &amp; Scorecard
        </button>

        {jdMatch && (
          <button
            type="button"
            onClick={() => setActiveTab('job_match')}
            className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'job_match'
                ? 'bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-sm font-semibold'
                : 'hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Job Match ({jdMatch.matchRate}%)</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => setActiveTab('bullets')}
          className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'bullets'
              ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm font-semibold'
              : 'hover:text-zinc-900 dark:hover:text-zinc-100'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Bullets ({bullets.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('skills')}
          className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'skills'
              ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm font-semibold'
              : 'hover:text-zinc-900 dark:hover:text-zinc-100'
          }`}
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>Skills &amp; Evidence</span>
        </button>

        {parsedPreview && (
          <button
            type="button"
            onClick={() => setActiveTab('parsed_preview')}
            className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'parsed_preview'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm font-semibold'
                : 'hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>ATS Parsed View</span>
          </button>
        )}
      </div>

      {/* Tab 1: Overview & Scorecard */}
      {activeTab === 'overview' && (
        <div className="space-y-3">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
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
            <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60">
              <div className="text-base sm:text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">
                {findings.xyzFormulaBulletsCount ?? 0}
              </div>
              <div className="text-[10px] text-zinc-500 font-medium">Google XYZ Bullets</div>
            </div>
            <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60">
              <div className="text-base sm:text-lg font-bold font-mono text-zinc-900 dark:text-zinc-100">
                {findings.wordCount ?? '—'}
              </div>
              <div className="text-[10px] text-zinc-500 font-medium">Word Count</div>
            </div>
          </div>

          {/* ATS Enterprise Platform Simulations (Workday, Taleo, Greenhouse) */}
          {atsSim && (
            <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/70 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>Enterprise ATS Platform Simulation</span>
                </span>
                <span className="text-[10px] font-mono text-zinc-400">Workday · Taleo · Greenhouse</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">Workday</span>
                    <Badge variant={atsSim.workdayReadiness.status === 'pass' ? 'success' : atsSim.workdayReadiness.status === 'warning' ? 'warning' : 'destructive'} className="text-[10px]">
                      {atsSim.workdayReadiness.score}/100
                    </Badge>
                  </div>
                  <p className="text-[10.5px] text-zinc-500 dark:text-zinc-400 leading-snug">
                    {atsSim.workdayReadiness.notes[0]}
                  </p>
                </div>

                <div className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">Oracle Taleo</span>
                    <Badge variant={atsSim.taleoReadiness.status === 'pass' ? 'success' : atsSim.taleoReadiness.status === 'warning' ? 'warning' : 'destructive'} className="text-[10px]">
                      {atsSim.taleoReadiness.score}/100
                    </Badge>
                  </div>
                  <p className="text-[10.5px] text-zinc-500 dark:text-zinc-400 leading-snug">
                    {atsSim.taleoReadiness.notes[0]}
                  </p>
                </div>

                <div className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">Greenhouse / Lever</span>
                    <Badge variant={atsSim.greenhouseReadiness.status === 'pass' ? 'success' : atsSim.greenhouseReadiness.status === 'warning' ? 'warning' : 'destructive'} className="text-[10px]">
                      {atsSim.greenhouseReadiness.score}/100
                    </Badge>
                  </div>
                  <p className="text-[10.5px] text-zinc-500 dark:text-zinc-400 leading-snug">
                    {atsSim.greenhouseReadiness.notes[0]}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Writing & Grammar Row */}
          {findings.writingQuality && (
            <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 flex items-center justify-between text-xs">
              <span className="text-zinc-600 dark:text-zinc-300 font-medium">
                Writing, Grammar &amp; Pronoun Health
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
                  5-Dimension ATS Breakdown
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

          {/* Parser Risks */}
          {parserRisks.length > 0 && (
            <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/70 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                  Parser Risks &amp; Formatting Alerts
                </span>
                <Badge
                  variant={
                    parserRisks.some((r) => r.severity === 'critical')
                      ? 'destructive'
                      : alertRisks.length > 0
                        ? 'warning'
                        : 'success'
                  }
                  className="text-[10px]"
                >
                  {alertRisks.length > 0 ? `${alertRisks.length} alert(s)` : 'All Clear'}
                </Badge>
              </div>
              <div className="space-y-1.5">
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
            </div>
          )}

          {/* Actionable Recommendations */}
          {recommendations.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                Targeted ATS Improvements
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
      )}

      {/* Tab 2: Job Match (Jobscan Simulation) */}
      {activeTab === 'job_match' && jdMatch && (
        <div className="space-y-3" data-testid="job-match-tab">
          <div className="p-3.5 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/40 dark:bg-blue-950/20 flex items-center justify-between">
            <div>
              <div className="text-xs uppercase font-semibold text-blue-600 dark:text-blue-400">
                Jobscan Match Rate
              </div>
              <div className="text-2xl font-black text-zinc-900 dark:text-zinc-50">
                {jdMatch.matchRate}%
              </div>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-xs text-right">
              {jdMatch.recruiterSearchSimulation.readinessSummary}
            </p>
          </div>

          {/* Hard vs Soft Skills Breakdown */}
          {(jdMatch.hardSkillsMatch || jdMatch.softSkillsMatch) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {jdMatch.hardSkillsMatch && (
                <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/70 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                      Hard Technical Skills
                    </span>
                    <Badge
                      variant={
                        jdMatch.hardSkillsMatch.percentage >= 75 ? 'success' : 'warning'
                      }
                      className="text-[10px] font-mono"
                    >
                      {jdMatch.hardSkillsMatch.matched}/{jdMatch.hardSkillsMatch.total} (
                      {jdMatch.hardSkillsMatch.percentage}%)
                    </Badge>
                  </div>
                  <progress
                    value={jdMatch.hardSkillsMatch.percentage}
                    max={100}
                    className="hr-score-progress"
                    style={
                      {
                        '--progress-bar-fill': getScoreStrokeColor(
                          jdMatch.hardSkillsMatch.percentage,
                        ),
                      } as React.CSSProperties
                    }
                  />
                </div>
              )}
              {jdMatch.softSkillsMatch && (
                <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/70 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                      Soft &amp; Leadership Skills
                    </span>
                    <Badge
                      variant={
                        jdMatch.softSkillsMatch.percentage >= 70 ? 'success' : 'warning'
                      }
                      className="text-[10px] font-mono"
                    >
                      {jdMatch.softSkillsMatch.matched}/{jdMatch.softSkillsMatch.total} (
                      {jdMatch.softSkillsMatch.percentage}%)
                    </Badge>
                  </div>
                  <progress
                    value={jdMatch.softSkillsMatch.percentage}
                    max={100}
                    className="hr-score-progress"
                    style={
                      {
                        '--progress-bar-fill': getScoreStrokeColor(
                          jdMatch.softSkillsMatch.percentage,
                        ),
                      } as React.CSSProperties
                    }
                  />
                </div>
              )}
            </div>
          )}

          {/* Role Title Alignment */}
          {jdMatch.titleAlignment && (
            <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/70 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                  Target Role Title Alignment
                </span>
                <Badge
                  variant={
                    jdMatch.titleAlignment.status === 'strong'
                      ? 'success'
                      : jdMatch.titleAlignment.status === 'moderate'
                        ? 'warning'
                        : 'destructive'
                  }
                  className="text-[10px]"
                >
                  {jdMatch.titleAlignment.score}% Alignment
                </Badge>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                Target:{' '}
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {jdMatch.titleAlignment.targetTitle || 'Not specified'}
                </span>{' '}
                · Detected Resume Title:{' '}
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {jdMatch.titleAlignment.detectedTitle || 'No headline detected'}
                </span>
              </p>
            </div>
          )}

          {/* Recruiter Boolean Search Simulation */}
          <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/70 space-y-2">
            <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
              Recruiter Boolean Search Test
            </span>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              When recruiters type targeted keyword queries in Workday/Taleo, does your resume surface?
            </p>
            <div className="space-y-1.5 text-xs font-mono">
              {jdMatch.recruiterSearchSimulation.passedQueries.map((q, idx) => (
                <div key={idx} className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Matches: {q}</span>
                </div>
              ))}
              {jdMatch.recruiterSearchSimulation.failedQueries.map((q, idx) => (
                <div key={idx} className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 flex items-center gap-2">
                  <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  <span>Missing from: {q}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Missing Keywords (Critical Fixes) */}
          {jdMatch.missingKeywords.length > 0 && (
            <div className="p-3 rounded-xl border border-amber-200 dark:border-amber-900 bg-amber-50/40 dark:bg-amber-950/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-amber-800 dark:text-amber-300 uppercase tracking-wider">
                  Missing Keywords from Job Description ({jdMatch.missingKeywords.length})
                </span>
              </div>
              <div className="space-y-1.5">
                {jdMatch.missingKeywords.map((k) => (
                  <div key={k.keyword} className="p-2 rounded-lg bg-white dark:bg-zinc-900 border border-amber-200 dark:border-amber-900/60 text-xs flex items-start justify-between gap-2">
                    <div>
                      <div className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                        <span>{k.keyword}</span>
                        <Badge variant={k.jdImportance === 'critical' ? 'destructive' : 'warning'} className="text-[9px]">
                          {k.jdImportance}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-0.5">{k.recommendation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Matched Keywords */}
          {jdMatch.matchedKeywords.length > 0 && (
            <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/70 space-y-2">
              <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                Matched Keywords ({jdMatch.matchedKeywords.length})
              </span>
              <div className="flex flex-wrap gap-1.5">
                {jdMatch.matchedKeywords.map((k) => (
                  <Badge key={k.keyword} variant="success" className="text-xs py-1 px-2">
                    {k.keyword} ({k.resumeCount}x)
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Keyword Stuffing Warnings */}
          {jdMatch.keywordStuffingAlerts.length > 0 && (
            <div className="p-3 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/40 dark:bg-rose-950/20 space-y-1 text-xs">
              <span className="text-[11px] font-semibold text-rose-800 dark:text-rose-300 uppercase tracking-wider">
                Keyword Stuffing Warning
              </span>
              {jdMatch.keywordStuffingAlerts.map((alert) => (
                <p key={alert.keyword} className="text-rose-900 dark:text-rose-200 text-[11px]">
                  {alert.warning}
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Bullet-by-Bullet Impact (Google XYZ Formula) */}
      {activeTab === 'bullets' && (
        <div className="space-y-3" data-testid="bullets-tab">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-1 text-xs">
              <button
                type="button"
                onClick={() => setBulletFilter('all')}
                className={`px-2.5 py-1 rounded-md text-xs font-medium ${
                  bulletFilter === 'all'
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                }`}
              >
                All ({bullets.length})
              </button>
              <button
                type="button"
                onClick={() => setBulletFilter('needs_work')}
                className={`px-2.5 py-1 rounded-md text-xs font-medium ${
                  bulletFilter === 'needs_work'
                    ? 'bg-amber-600 text-white'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                }`}
              >
                Needs Work ({bullets.filter((b) => !b.hasActionVerb || !b.hasMetric || b.lengthStatus !== 'ideal').length})
              </button>
              <button
                type="button"
                onClick={() => setBulletFilter('xyz_met')}
                className={`px-2.5 py-1 rounded-md text-xs font-medium ${
                  bulletFilter === 'xyz_met'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                }`}
              >
                Google XYZ Met ({findings.xyzFormulaBulletsCount ?? 0})
              </button>
            </div>

            {verbAnalysis && verbAnalysis.repeatedVerbs.length > 0 && (
              <Badge variant="warning" className="text-[10px]">
                {verbAnalysis.repeatedVerbs.length} repeated verb(s)
              </Badge>
            )}
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {filteredBullets.map((b, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/70 text-xs space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-zinc-900 dark:text-zinc-100 font-medium leading-relaxed">
                    • {b.bullet}
                  </p>
                  {b.contextLabel && (
                    <span className="text-[10px] text-zinc-400 uppercase font-mono shrink-0">
                      {b.contextLabel}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-zinc-100 dark:border-zinc-800/80">
                  <Badge variant={b.hasActionVerb ? 'success' : 'destructive'} className="text-[10px]">
                    {b.hasActionVerb ? `Action Verb (${b.actionVerbCategory || 'Active'})` : 'Weak Verb'}
                  </Badge>
                  <Badge variant={b.hasMetric ? 'success' : 'warning'} className="text-[10px]">
                    {b.hasMetric ? 'Metric Quantified ✓' : 'No Numbers / %'}
                  </Badge>
                  <Badge variant={b.xyzFormulaMet ? 'success' : 'neutral'} className="text-[10px]">
                    {b.xyzFormulaMet ? 'Google XYZ Met' : 'XYZ Incomplete'}
                  </Badge>
                  {typeof b.wordCount === 'number' && (
                    <Badge variant={b.lengthStatus === 'ideal' ? 'info' : 'warning'} className="text-[10px] font-mono">
                      {b.wordCount} words
                    </Badge>
                  )}
                </div>

                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  {b.feedback}
                </p>

                {b.suggestedRewrite && (
                  <div className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 text-[11px]">
                    <span className="text-blue-600 dark:text-blue-400 font-semibold block mb-0.5">
                      Suggested XYZ Formula Rewrite:
                    </span>
                    <span className="text-zinc-800 dark:text-zinc-200 font-mono text-[10.5px]">
                      {b.suggestedRewrite}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Skills & Evidence Proof */}
      {activeTab === 'skills' && stackAlignment && (
        <div className="space-y-3" data-testid="skills-tab">
          <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/70 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                Skills Substantiation (Proof Score)
              </span>
              <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {stackAlignment.corroboratedSkills.length}/{stackAlignment.totalSkills} Evidenced
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Modern ATS parsers discount skills listed solely in a keyword block if they never appear inside experience bullets.
            </p>
          </div>

          {/* Evidenced Skills */}
          {stackAlignment.corroboratedSkills.length > 0 && (
            <div className="p-3 rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/40 dark:bg-emerald-950/20 space-y-2">
              <span className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                Proved in Experience Bullets ({stackAlignment.corroboratedSkills.length})
              </span>
              <div className="flex flex-wrap gap-1.5">
                {stackAlignment.corroboratedSkills.map((s) => (
                  <Badge key={s} variant="success" className="text-xs py-1 px-2">
                    {s} ✓
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Orphan Skills */}
          {stackAlignment.unreferencedSkills.length > 0 && (
            <div className="p-3 rounded-xl border border-amber-200 dark:border-amber-900 bg-amber-50/40 dark:bg-amber-950/20 space-y-2">
              <div className="space-y-0.5">
                <span className="text-[11px] font-semibold text-amber-800 dark:text-amber-300 uppercase tracking-wider">
                  Listed Without Bullet Proof ({stackAlignment.unreferencedSkills.length})
                </span>
                <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
                  These skills are in your core list, but never referenced in an achievement bullet.
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {stackAlignment.unreferencedSkills.map((s) => (
                  <Badge key={s} variant="warning" className="text-xs py-1 px-2">
                    {s}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Unlisted Skills Discovered in Text */}
          {stackAlignment.unlistedSkills && stackAlignment.unlistedSkills.length > 0 && (
            <div className="p-3 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/40 dark:bg-blue-950/20 space-y-2">
              <div className="space-y-0.5">
                <span className="text-[11px] font-semibold text-blue-800 dark:text-blue-300 uppercase tracking-wider">
                  Quick Win: Unlisted Skills Evidenced in Text ({stackAlignment.unlistedSkills.length})
                </span>
                <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
                  You wrote about these skills in your experience bullets, but forgot to list them under Core Skills!
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {stackAlignment.unlistedSkills.map((s) => (
                  <Badge key={s} variant="info" className="text-xs py-1 px-2">
                    + Add {s}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 5: ATS Parsed View ("How ATS Sees Your Resume") */}
      {activeTab === 'parsed_preview' && parsedPreview && (
        <div className="space-y-3" data-testid="parsed-preview-tab">
          <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/70 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>Extracted Recruiter Database Record</span>
              </span>
              <Badge variant="neutral" className="text-[10px]">Taleo/Workday OCR View</Badge>
            </div>

            {/* Candidate Header */}
            <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/60 text-xs space-y-1">
              <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                {parsedPreview.contact.fullName || 'Candidate Name Not Found'}
              </div>
              <div className="text-zinc-600 dark:text-zinc-300">
                {parsedPreview.headline || 'No Headline'}
              </div>
              <div className="text-zinc-500 font-mono text-[11px] flex flex-wrap gap-x-3 gap-y-1 pt-1">
                {parsedPreview.contact.email && <span>📧 {parsedPreview.contact.email}</span>}
                {parsedPreview.contact.phone && <span>📞 {parsedPreview.contact.phone}</span>}
                {parsedPreview.contact.location && <span>📍 {parsedPreview.contact.location}</span>}
                {parsedPreview.contact.linkedinUrl && <span>🔗 LinkedIn</span>}
                {parsedPreview.contact.githubUrl && <span>💻 GitHub</span>}
              </div>
            </div>

            {/* Work History Timeline */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5" />
                <span>Parsed Work History ({parsedPreview.experience.length})</span>
              </span>
              <div className="space-y-1.5">
                {parsedPreview.experience.map((exp, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900 text-xs flex items-start justify-between gap-2">
                    <div>
                      <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                        {exp.title} · {exp.company}
                      </div>
                      <div className="text-zinc-500 text-[11px]">
                        {exp.durationText || exp.startDate || 'Date not detected'}
                      </div>
                    </div>
                    <Badge variant="neutral" className="text-[10px] shrink-0">
                      {exp.bulletCount} bullet(s)
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Education */}
            {parsedPreview.education.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Parsed Education ({parsedPreview.education.length})</span>
                </span>
                <div className="space-y-1.5">
                  {parsedPreview.education.map((edu, idx) => (
                    <div key={idx} className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900 text-xs">
                      <div className="font-semibold text-zinc-900 dark:text-zinc-100">{edu.school}</div>
                      <div className="text-zinc-500 text-[11px]">
                        {edu.degree} {edu.graduationDate ? `(${edu.graduationDate})` : ''}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
