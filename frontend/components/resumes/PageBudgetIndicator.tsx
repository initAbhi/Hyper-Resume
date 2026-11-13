'use client';

import React from 'react';
import { FileText, AlertTriangle, CheckCircle2 } from 'lucide-react';
import type { ResumeContent } from '@/lib/api-client';

export interface PageBudgetEstimate {
  estimatedLines: number;
  maxSinglePageLines: number;
  pageCount: number;
  percentageFirstPage: number;
  spillsToSecondPage: boolean;
  statusLabel: string;
}

/**
 * Computes an estimated line count and page budget for a standard US Letter ATS resume.
 * Standard 10pt-11pt single-column resume accommodates approximately 40-44 content lines.
 */
export function calculatePageBudget(content: ResumeContent | null | undefined): PageBudgetEstimate {
  if (!content) {
    return {
      estimatedLines: 0,
      maxSinglePageLines: 42,
      pageCount: 1,
      percentageFirstPage: 0,
      spillsToSecondPage: false,
      statusLabel: 'Empty Draft',
    };
  }

  let lines = 0;

  // Header: Name + Contact lines + Headline
  lines += 2;
  if (content.headline?.trim()) lines += 1;
  if (content.summary?.trim()) {
    // Section header + wrapped summary text (~80 chars per line)
    lines += 1 + Math.max(1, Math.ceil(content.summary.trim().length / 85));
  }

  // Work Experience
  if (Array.isArray(content.experience) && content.experience.length > 0) {
    lines += 1; // Section title
    for (const exp of content.experience) {
      lines += 1; // Role, Company, Dates
      const bullets = Array.isArray(exp.bullets) ? exp.bullets : [];
      for (const bullet of bullets) {
        if (!bullet?.trim()) continue;
        // Average ATS bullet wraps every 80-90 characters
        lines += Math.max(1, Math.ceil(bullet.trim().length / 85));
      }
      lines += 0.5; // Margin between positions
    }
  }

  // Skills
  if (Array.isArray(content.skills) && content.skills.length > 0) {
    lines += 1; // Section title
    const totalSkillsLen = content.skills.map((s) => s.name).join(', ').length;
    lines += Math.max(1, Math.ceil(totalSkillsLen / 85));
  }

  // Education
  if (Array.isArray(content.education) && content.education.length > 0) {
    lines += 1; // Section title
    lines += content.education.length * 1.5;
  }

  // Projects
  if (Array.isArray(content.projects) && content.projects.length > 0) {
    lines += 1; // Section title
    for (const proj of content.projects) {
      lines += 1;
      const highlights = Array.isArray(proj.highlights) ? proj.highlights : [];
      for (const hl of highlights) {
        if (!hl?.trim()) continue;
        lines += Math.max(1, Math.ceil(hl.trim().length / 85));
      }
    }
  }

  const maxSinglePageLines = 42;
  const totalLines = Math.ceil(lines);
  const percentageFirstPage = Math.min(100, Math.round((totalLines / maxSinglePageLines) * 100));
  const spillsToSecondPage = totalLines > maxSinglePageLines;
  const pageCount = spillsToSecondPage ? Math.ceil(totalLines / maxSinglePageLines) : 1;

  let statusLabel = `1 Page (${percentageFirstPage}% full)`;
  if (spillsToSecondPage) {
    statusLabel = `Spills to Page 2 (${totalLines} lines)`;
  }

  return {
    estimatedLines: totalLines,
    maxSinglePageLines,
    pageCount,
    percentageFirstPage,
    spillsToSecondPage,
    statusLabel,
  };
}

interface PageBudgetIndicatorProps {
  content: ResumeContent | null | undefined;
  className?: string;
}

export function PageBudgetIndicator({ content, className = '' }: PageBudgetIndicatorProps) {
  const budget = calculatePageBudget(content);

  return (
    <div
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs transition-colors ${
        budget.spillsToSecondPage
          ? 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400'
          : 'bg-muted/50 border-border text-muted-foreground'
      } ${className}`}
      title={
        budget.spillsToSecondPage
          ? `Estimated ${budget.estimatedLines} lines exceeds 1 page budget (${budget.maxSinglePageLines} lines). Consider tightening bullets for single-page ATS precision.`
          : `Estimated ${budget.estimatedLines} of ~${budget.maxSinglePageLines} lines for a crisp 1-page document.`
      }
    >
      {budget.spillsToSecondPage ? (
        <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
      ) : (
        <FileText className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
      )}

      <div className="flex items-center gap-2">
        <span className="font-medium text-foreground">{budget.statusLabel}</span>

        <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              budget.spillsToSecondPage
                ? 'bg-amber-500'
                : budget.percentageFirstPage > 85
                ? 'bg-emerald-500'
                : 'bg-blue-500'
            }`}
            style={{ width: `${budget.percentageFirstPage}%` }}
          />
        </div>
      </div>
    </div>
  );
}

