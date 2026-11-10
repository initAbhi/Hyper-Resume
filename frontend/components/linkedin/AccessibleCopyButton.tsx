'use client';

import React, { useEffect, useRef, useState } from 'react';
import { AlertCircle, Check, Copy } from 'lucide-react';
import { copyToClipboardSafely } from '@/lib/linkedin-utils';

let lastGlobalCopyAnnouncement = '';

interface AccessibleCopyButtonProps {
  text: string;
  label?: string;
  ariaLabel?: string;
  className?: string;
}

export function AccessibleCopyButton({
  text,
  label = 'Copy',
  ariaLabel,
  className = '',
}: AccessibleCopyButtonProps) {
  const [statusState, setStatusState] = useState<'idle' | 'copied' | 'failed'>('idle');
  const [liveMessage, setLiveMessage] = useState('');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleCopy = async () => {
    if (!text) return;
    if (timerRef.current) clearTimeout(timerRef.current);

    const ok = await copyToClipboardSafely(text);
    const baseMsg = ok ? 'Copied' : 'Copy failed';
    let announced = baseMsg;
    if (announced === lastGlobalCopyAnnouncement) {
      announced = `${announced}\u00A0`;
    }
    lastGlobalCopyAnnouncement = announced;

    setStatusState(ok ? 'copied' : 'failed');
    setLiveMessage('');
    requestAnimationFrame(() => {
      setLiveMessage(announced);
    });

    timerRef.current = setTimeout(() => {
      setStatusState('idle');
      setLiveMessage('');
    }, 2200);
  };

  return (
    <span className="inline-flex items-center gap-1.5 relative">
      <button
        type="button"
        onClick={handleCopy}
        aria-label={ariaLabel || (label ? undefined : 'Copy content')}
        data-copied={statusState === 'copied' ? '' : undefined}
        data-failed={statusState === 'failed' ? '' : undefined}
        className={`inline-flex items-center justify-center gap-1.5 min-w-6 min-h-6 px-2.5 py-1.5 rounded-md text-xs font-medium border transition-colors cursor-pointer ${
          statusState === 'copied'
            ? 'border-[#059669] bg-[#ECFDF5] text-[#065F46] dark:border-[#047857] dark:bg-[#064E3B]/40 dark:text-[#6EE7B7]'
            : statusState === 'failed'
              ? 'border-[#DC2626] bg-[#FEF2F2] text-[#991B1B] dark:border-[#991B1B] dark:bg-[#7F1D1D]/30 dark:text-[#FCA5A5]'
              : 'border-[#E2E5E9] dark:border-[#252A33] bg-white dark:bg-[#1D2128] text-[#1A1D23] dark:text-[#F0F2F5] hover:border-[#285FEA] hover:text-[#285FEA]'
        } ${className}`}
      >
        {statusState === 'copied' ? (
          <Check className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        ) : statusState === 'failed' ? (
          <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        ) : (
          <Copy className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        )}
        {label && <span>{label}</span>}
      </button>

      {/* Confirmation live region kept strictly outside the button per accessibility best practices */}
      <span
        role="status"
        aria-live="polite"
        className={`text-[11px] font-medium px-1.5 py-0.5 rounded transition-opacity duration-150 pointer-events-none ${
          liveMessage
            ? statusState === 'failed'
              ? 'opacity-100 text-[#DC2626] dark:text-[#FCA5A5]'
              : 'opacity-100 text-[#059669] dark:text-[#6EE7B7]'
            : 'opacity-0'
        }`}
      >
        {liveMessage}
      </span>
    </span>
  );
}

