import React from 'react';
import { AlertTriangle, Info, Lightbulb } from 'lucide-react';

interface CalloutProps {
  type?: 'info' | 'tip' | 'warning';
  title?: string;
  children: React.ReactNode;
}

const CALLOUT_STYLES = {
  info: {
    container:
      'border-[#285FEA]/25 bg-[#285FEA]/[0.05] dark:border-[#3B82F6]/30 dark:bg-[#3B82F6]/10',
    iconClass: 'text-[#285FEA] dark:text-[#60A5FA]',
    Icon: Info,
    defaultTitle: 'Engineering Note',
  },
  tip: {
    container:
      'border-[#10B981]/30 bg-emerald-50/60 dark:border-[#10B981]/30 dark:bg-emerald-950/20',
    iconClass: 'text-[#10B981]',
    Icon: Lightbulb,
    defaultTitle: 'Pro Tip',
  },
  warning: {
    container:
      'border-[#F59E0B]/35 bg-amber-50/60 dark:border-[#F59E0B]/30 dark:bg-amber-950/20',
    iconClass: 'text-[#F59E0B]',
    Icon: AlertTriangle,
    defaultTitle: 'Watch Out',
  },
};

export function Callout({ type = 'info', title, children }: CalloutProps) {
  const style = CALLOUT_STYLES[type] ?? CALLOUT_STYLES.info;
  const Icon = style.Icon;

  return (
    <div className={`not-prose my-6 rounded-xl border p-4 sm:p-5 ${style.container}`}>
      <div className="flex items-start gap-3">
        <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${style.iconClass}`} />
        <div className="min-w-0 space-y-1 text-sm leading-relaxed text-[#1A1D23] dark:text-[#F0F2F5]">
          <p className="font-semibold">{title ?? style.defaultTitle}</p>
          <div className="text-[#525866] dark:text-[#9CA3AF] [&>p]:m-0">{children}</div>
        </div>
      </div>
    </div>
  );
}
