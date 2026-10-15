import React from 'react';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'info' | 'success' | 'warning' | 'destructive';
  title?: string;
}

export function Alert({
  className = '',
  variant = 'info',
  title,
  children,
  ...props
}: AlertProps) {
  const variants = {
    info: 'bg-blue-50 text-blue-900 border-blue-200 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-900',
    success:
      'bg-emerald-50 text-emerald-900 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-900',
    warning:
      'bg-amber-50 text-amber-900 border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-900',
    destructive:
      'bg-rose-50 text-rose-900 border-rose-200 dark:bg-rose-950/30 dark:text-rose-300 dark:border-rose-900',
  };

  return (
    <div
      role="alert"
      className={`rounded-lg border p-4 text-sm flex flex-col gap-1 ${variants[variant]} ${className}`}
      {...props}
    >
      {title && <h5 className="font-medium leading-none tracking-tight">{title}</h5>}
      <div className="text-sm opacity-90">{children}</div>
    </div>
  );
}
