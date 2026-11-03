'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, CheckCircle2, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Alert } from '@/components/ui/alert';
import { Logo } from '@/components/ui/Logo';
import { apiClient } from '@/lib/api-client';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const router = useRouter();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      if (!token) {
        throw new Error('Missing password reset token. Please request a new reset link.');
      }
      if (password.length < 8) {
        throw new Error('Password must be at least 8 characters long.');
      }
      if (password !== confirmPassword) {
        throw new Error('Passwords do not match. Please re-enter.');
      }

      await apiClient.resetPassword(token, password);
      setIsSuccess(true);
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'Unable to reset password. The link may have expired.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <CardContent className="space-y-4 px-6 text-center py-6">
        <Alert variant="destructive" className="text-xs">
          Missing or invalid password reset token. Please verify the URL or request a new password reset link.
        </Alert>
        <Link href="/forgot-password">
          <Button variant="primary" className="w-full h-10 rounded-xl bg-[#285FEA] text-white text-xs">
            Request New Reset Link
          </Button>
        </Link>
      </CardContent>
    );
  }

  if (isSuccess) {
    return (
      <CardContent className="space-y-5 text-center py-6 px-6">
        <div className="w-14 h-14 mx-auto rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center border border-emerald-100 dark:border-emerald-900/60 shadow-xs">
          <CheckCircle2 className="w-7 h-7" />
        </div>
        <div className="space-y-2">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Password Updated!</h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Your password has been securely reset. You can now sign in with your new credentials.
          </p>
        </div>
        <div className="pt-2">
          <Link href="/login">
            <Button
              variant="primary"
              className="w-full h-10 rounded-xl bg-[#285FEA] hover:bg-[#1E4BC8] text-white font-medium text-xs shadow-xs"
            >
              Sign In Now
            </Button>
          </Link>
        </div>
      </CardContent>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <CardContent className="space-y-4 px-6 pt-0">
        {errorMessage && (
          <Alert variant="destructive" className="text-xs">
            {errorMessage}
          </Alert>
        )}
        <Input
          id="new-password"
          label="New Password"
          type="password"
          placeholder="At least 8 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          helperText="Must be at least 8 characters."
          className="text-xs"
        />
        <Input
          id="confirm-password"
          label="Confirm New Password"
          type="password"
          placeholder="Re-enter password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          className="text-xs"
        />
      </CardContent>
      <CardFooter className="flex flex-col gap-4 px-6 pt-2 pb-6">
        <Button
          id="reset-password-submit"
          type="submit"
          variant="primary"
          className="w-full h-10 rounded-xl bg-[#285FEA] hover:bg-[#1E4BC8] text-white font-medium text-xs shadow-xs"
          isLoading={isLoading}
        >
          Update Password
        </Button>
        <Link
          href="/login"
          className="inline-flex items-center justify-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-slate-300 font-medium transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Sign In</span>
        </Link>
      </CardFooter>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center py-16 px-4 bg-slate-50/50 dark:bg-transparent min-h-[calc(100vh-80px)]">
      <Link
        href="/"
        className="mb-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-lg transition-transform hover:scale-[1.02]"
        aria-label="HypeResume Home"
      >
        <Logo variant="full" size="lg" priority />
      </Link>
      <Card className="w-full max-w-md shadow-lg border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden">
        <CardHeader className="text-center pb-4 pt-6">
          <CardTitle className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Set New Password
          </CardTitle>
          <CardDescription className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Create a strong, new password for your account
          </CardDescription>
        </CardHeader>
        <Suspense
          fallback={
            <div className="p-8 text-center text-xs text-slate-400">Loading reset parameters...</div>
          }
        >
          <ResetPasswordForm />
        </Suspense>
      </Card>
    </div>
  );
}

