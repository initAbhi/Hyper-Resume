'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Alert } from '@/components/ui/alert';
import { Logo } from '@/components/ui/Logo';
import { apiClient } from '@/lib/api-client';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      if (!email.trim()) {
        throw new Error('Please enter your email address.');
      }
      await apiClient.requestPasswordReset(email.trim());
      setIsSubmitted(true);
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'Unable to process your request. Please check your email and try again.',
      );
    } finally {
      setIsLoading(false);
    }
  };

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
            {isSubmitted ? 'Check Your Inbox' : 'Reset Password'}
          </CardTitle>
          <CardDescription className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
            {isSubmitted
              ? `We have dispatched a password reset link to ${email}.`
              : 'Enter the email address tied to your account to receive a secure reset link.'}
          </CardDescription>
        </CardHeader>

        {isSubmitted ? (
          <CardContent className="space-y-5 text-center py-6 px-6">
            <div className="w-14 h-14 mx-auto rounded-full bg-blue-50 dark:bg-blue-950/50 text-[#285FEA] flex items-center justify-center border border-blue-100 dark:border-blue-900/60 shadow-xs">
              <Mail className="w-7 h-7" />
            </div>
            <div className="space-y-2">
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                If an account exists for <strong className="text-slate-900 dark:text-white">{email}</strong>, you will receive an email with a secure link to create a new password.
              </p>
              <p className="text-[11px] text-slate-400">
                The link will expire in 60 minutes for security reasons. Remember to check your spam folder if you do not see it within a couple of minutes.
              </p>
            </div>
            <div className="pt-2 flex flex-col gap-2">
              <Button
                variant="outline"
                className="w-full h-10 rounded-xl text-xs font-medium"
                onClick={() => {
                  setIsSubmitted(false);
                  setEmail('');
                }}
              >
                Send to a different email
              </Button>
              <Link href="/login">
                <Button
                  variant="primary"
                  className="w-full h-10 rounded-xl bg-[#285FEA] hover:bg-[#1E4BC8] text-white font-medium text-xs shadow-xs"
                >
                  Return to Sign In
                </Button>
              </Link>
            </div>
          </CardContent>
        ) : (
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4 px-6 pt-0">
              {errorMessage && (
                <Alert variant="destructive" className="text-xs">
                  {errorMessage}
                </Alert>
              )}
              <Input
                id="reset-email"
                label="Registered Email Address"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="text-xs"
                helperText="We'll send a 1-hour secure password reset link to this address."
              />
            </CardContent>
            <CardFooter className="flex flex-col gap-4 px-6 pt-2 pb-6">
              <Button
                id="forgot-password-submit"
                type="submit"
                variant="primary"
                className="w-full h-10 rounded-xl bg-[#285FEA] hover:bg-[#1E4BC8] text-white font-medium text-xs shadow-xs"
                isLoading={isLoading}
              >
                Send Password Reset Link
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
        )}
      </Card>
    </div>
  );
}

