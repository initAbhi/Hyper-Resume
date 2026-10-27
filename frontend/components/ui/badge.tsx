import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'neutral' | 'success' | 'warning' | 'destructive' | 'info';
}

export function Badge({
  className = '',
  variant = 'neutral',
  children,
  ...props
}: BadgeProps) {
  const variants = {
    neutral:
      'bg-[#F1F3F5] text-[#5A6270] dark:bg-[#1D2128] dark:text-[#9EA7B4] border border-[#E2E5E9] dark:border-[#252A33]',
    success:
      'bg-[#ECFDF5] text-[#065F46] dark:bg-[#064E3B]/40 dark:text-[#A7F3D0] border border-[#A7F3D0]/60 dark:border-[#047857]/50',
    warning:
      'bg-[#FFFBEB] text-[#92400E] dark:bg-[#78350F]/40 dark:text-[#FDE68A] border border-[#FDE68A]/60 dark:border-[#B45309]/50',
    destructive:
      'bg-[#FEF2F2] text-[#991B1B] dark:bg-[#7F1D1D]/40 dark:text-[#FECACA] border border-[#FECACA]/60 dark:border-[#B91C1C]/50',
    info:
      'bg-[#EDF3FD] text-[#1E4BC8] dark:bg-[#13203D] dark:text-[#93C5FD] border border-[#C7DBF9]/60 dark:border-[#1E3A78]/50',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium transition-colors ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
