'use client';

import React from 'react';
import { Bot, Sparkles } from 'lucide-react';
import { useGlobalAgent } from '@/lib/global-agent-context';

export function GlobalAgentButton() {
  const { isOpen, toggleDrawer, activeTask, activeProposal, pageContext } = useGlobalAgent();
  const pathname = pageContext.route || '';

  const isResumeEditorRoute = Boolean(
    pathname && pathname.startsWith('/app/resumes/') && pathname !== '/app/resumes',
  );

  // Resume Editor already integrates a dedicated AI Agent button and panel; hide duplicate floating FAB
  if (isResumeEditorRoute) {
    return null;
  }

  const isTaskRunning =
    activeTask?.status === 'PENDING' ||
    activeTask?.status === 'PLANNING' ||
    activeTask?.status === 'RUNNING';
  const hasPendingApproval = Boolean(activeProposal || activeTask?.status === 'AWAITING_APPROVAL');

  return (
    <button
      type="button"
      id="global-agent-floating-btn"
      data-testid="global-agent-button"
      aria-expanded={isOpen}
      aria-controls="global-agent-drawer"
      aria-label={isOpen ? 'Close AI Career Agent' : 'AI Career Agent — Open Assistant'}
      onClick={toggleDrawer}
      className={`print:hidden fixed right-5 z-30 inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-semibold shadow-lg border transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
        isResumeEditorRoute ? 'bottom-20' : 'bottom-5'
      } ${
        isOpen
          ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-zinc-800 dark:border-zinc-200'
          : 'bg-[#285FEA] hover:bg-[#1E4BC8] text-white border-[#1E4BC8]'
      }`}
    >
      <span className="relative flex items-center justify-center">
        {isOpen ? (
          <Bot className="w-4 h-4" aria-hidden="true" />
        ) : (
          <Sparkles className="w-4 h-4" aria-hidden="true" />
        )}
        {isTaskRunning && (
          <span
            className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping motion-reduce:animate-none"
            aria-hidden="true"
          />
        )}
      </span>
      <span className="hidden sm:inline">AI Career Agent</span>
      <span className="sm:hidden">Agent</span>
      {hasPendingApproval && (
        <span className="inline-flex items-center rounded-full bg-amber-400 px-1.5 py-0.5 text-[10px] font-bold text-zinc-950">
          Review
        </span>
      )}
    </button>
  );
}
