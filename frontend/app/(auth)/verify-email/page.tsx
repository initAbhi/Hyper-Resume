'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Logo } from '@/components/ui/Logo';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const { isAuthenticated, refreshUser } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    token ? 'loading' : 'error',
  );
  const [message, setMessage] = useState<string>(
    token ? 'Verifying your email address...' : 'Missing email verification token.',
  );

  useEffect(() => {
    if (!token) return;
    let isMounted = true;
    apiClient
      .verifyEmail(token)
      .then(async (res) => {
        if (!isMounted) return;
        setStatus('success');
        setMessage(
          res.verified
            ? 'Your email address has been verified.'
            : 'Email verification completed.',
        );
        if (isAuthenticated) {
          await refreshUser().catch(() => {});
        }
      })
      .catch((err: unknown) => {
        if (!isMounted) return;
        setStatus('error');
        setMessage(
          err instanceof Error
            ? err.message
            : 'This verification link is invalid or has expired.',
        );
      });
    return () => {
      isMounted = false;
    };
  }, [token, isAuthenticated, refreshUser]);

  return (
    <CardContent className="space-y-5 text-center py-6 px-6">
      {status === 'loading' ? (
        <div className="flex flex-col items-center gap-3 py-4">
          <Loader2 className="w-8 h-8 animate-spin text-[#285FEA]" />
          <p className="text-xs text-slate-600 dark:text-slate-300">{message}</p>
        </div>
      ) : status === 'success' ? (
        <>
          <div className="w-14 h-14 mx-auto rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center border border-emerald-100 dark:border-emerald-900/60">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {message}
          </p>
          <Link
            href={isAuthenticated ? '/app' : '/login'}
            className="w-full h-10 rounded-xl bg-[#285FEA] hover:bg-[#1E4BC8] text-white font-medium text-xs shadow-xs inline-flex items-center justify-center transition-colors"
          >
            {isAuthenticated ? 'Continue to Workspace' : 'Sign In to Workspace'}
          </Link>
        </>
      ) : (
        <>
          <div className="w-14 h-14 mx-auto rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-600 flex items-center justify-center border border-rose-100 dark:border-rose-900/60">
            <AlertCircle className="w-7 h-7" />
          </div>
          <p className="text-xs text-rose-700 dark:text-rose-300 leading-relaxed">
            {message}
          </p>
          <Link
            href={isAuthenticated ? '/app/settings' : '/login'}
            className="w-full h-10 rounded-xl border border-slate-200 dark:border-zinc-700 text-slate-800 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800 font-medium text-xs inline-flex items-center justify-center transition-colors"
          >
            {isAuthenticated ? 'Request New Link in Settings' : 'Back to Sign In'}
          </Link>
        </>
      )}
    </CardContent>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center py-16 px-4 bg-slate-50/70 dark:bg-[#050505] min-h-[calc(100vh-80px)]">
      <Link
        href="/"
        className="mb-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#285FEA] rounded-lg"
        aria-label="HypeResume Home"
      >
        <Logo variant="full" size="lg" priority />
      </Link>
      <Card className="w-full max-w-md shadow-lg border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden">
        <CardHeader className="text-center pb-2 pt-6">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Email Verification
          </h1>
          <CardDescription className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Confirming your account email ownership
          </CardDescription>
        </CardHeader>
        <Suspense
          fallback={
            <div className="p-8 text-center text-xs text-slate-500">
              Checking verification token...
            </div>
          }
        >
          <VerifyEmailContent />
        </Suspense>
      </Card>
    </div>
  );
}
