import React, { forwardRef } from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = '',
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none select-none cursor-pointer';

    const variants = {
      primary:
        'bg-[#285FEA] hover:bg-[#1E4BC8] active:bg-[#173DA3] text-white shadow-xs focus-visible:ring-[#285FEA]',
      secondary:
        'bg-[#F1F3F5] hover:bg-[#EAECEF] active:bg-[#E2E5E9] dark:bg-[#1D2128] dark:hover:bg-[#252A33] text-[#1A1D23] dark:text-[#F0F2F5] focus-visible:ring-zinc-400',
      outline:
        'border border-[#E2E5E9] dark:border-[#252A33] bg-white dark:bg-[#14171C] text-[#1A1D23] dark:text-[#F0F2F5] hover:bg-[#F7F8FA] dark:hover:bg-[#1D2128] focus-visible:ring-zinc-400',
      ghost:
        'bg-transparent text-[#5A6270] dark:text-[#9EA7B4] hover:bg-[#F1F3F5] dark:hover:bg-[#1D2128] hover:text-[#1A1D23] dark:hover:text-[#F0F2F5] focus-visible:ring-zinc-400',
      destructive:
        'bg-[#DC2626] hover:bg-[#B91C1C] text-white shadow-xs focus-visible:ring-[#DC2626]',
    };

    const sizes = {
      sm: 'h-8 px-2.5 text-xs gap-1.5 rounded-md',
      md: 'h-9 px-3.5 text-sm gap-2 rounded-lg',
      lg: 'h-11 px-5 text-sm font-semibold gap-2.5 rounded-lg',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-0.5 mr-2 h-3.5 w-3.5 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';
