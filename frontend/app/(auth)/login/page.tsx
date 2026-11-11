'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Alert } from '@/components/ui/alert';
import { Logo } from '@/components/ui/Logo';
import { useAuth } from '@/lib/auth-context';
import { analytics } from '@/lib/analytics';

function buildPostLoginTarget(searchParams: ReturnType<typeof useSearchParams>): string {
  const redirect = searchParams?.get('redirect');
  const plan = searchParams?.get('plan');
  const currency = searchParams?.get('currency');
  const template = searchParams?.get('template');

  if (redirect && redirect.startsWith('/') && !redirect.startsWith('//')) {
    const params = new URLSearchParams();
    if (plan) params.set('plan', plan);
    if (currency) params.set('currency', currency);
    if (template) params.set('template', template);
    const qs = params.toString();
    if (!qs) return redirect;
    return redirect.includes('?') ? `${redirect}&${qs}` : `${redirect}?${qs}`;
  }

  if (template) {
    return `/app/resumes?create=1&template=${encodeURIComponent(template)}`;
  }

  return '/app';
}

function LoginFormContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isGoogleReady, setIsGoogleReady] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';
  const { login, googleLogin } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const postLoginTarget = buildPostLoginTarget(searchParams);
  const querySuffix = searchParams?.toString() ? `?${searchParams.toString()}` : '';

  // Load Google Identity Services script if client ID is configured
  useEffect(() => {
    if (!googleClientId) return;

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: async (response: { credential: string }) => {
            if (response.credential) {
              setIsGoogleLoading(true);
              try {
                const res = await googleLogin({ credential: response.credential });
                if (res?.isNewUser) {
                  analytics.track('signup_completed', { source: 'google_oauth' });
                }
                router.push(buildPostLoginTarget(searchParams));
              } catch (err: unknown) {
                setErrorMessage(err instanceof Error ? err.message : 'Google sign in failed');
              } finally {
                setIsGoogleLoading(false);
              }
            }
          },
        });

        const btnContainer = document.getElementById('google-btn-rendered');
        if (btnContainer) {
          window.google.accounts.id.renderButton(btnContainer, {
            theme: 'outline',
            size: 'large',
            type: 'standard',
            text: 'continue_with',
            shape: 'rectangular',
            logo_alignment: 'left',
            width: 384,
          });
          setIsGoogleReady(true);
        }
      }
    };
    script.onerror = () => {
      setIsGoogleReady(true);
    };
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [googleClientId, googleLogin, router, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      if (!email.trim() || !password) {
        throw new Error('Please enter both email and password.');
      }
      await login({ email: email.trim(), password });
      router.push(postLoginTarget);
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'Unable to sign in. Please verify your email and password.',
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
      <Card className="w-full max-w-md shadow-lg border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-2xl">
        <CardHeader className="text-center pb-4 pt-6">
          <CardTitle className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Sign in to continue optimizing your ATS-ready resumes
          </CardDescription>
        </CardHeader>
        <div className="px-6 pb-2">
          {errorMessage && (
            <Alert variant="destructive" className="text-xs mb-4">
              {errorMessage}
            </Alert>
          )}

          {isGoogleLoading && (
            <div className="w-full py-2.5 px-4 mb-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-[#285FEA] text-xs flex items-center justify-center gap-2 font-medium">
              <span className="w-4 h-4 border-2 border-[#285FEA] border-t-transparent rounded-full animate-spin" />
              Signing you in with Google...
            </div>
          )}

          {/* Official Google Button Container */}
          {googleClientId ? (
            <>
              <div id="google-btn-rendered" className="w-full flex justify-center min-h-[44px]" />
              {!isGoogleReady && (
                <div className="w-full h-11 rounded-xl bg-slate-100 dark:bg-zinc-800 animate-pulse flex items-center justify-center text-xs text-slate-400">
                  Loading Google Sign-In...
                </div>
              )}

              {/* Divider */}
              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200 dark:border-zinc-800" />
                </div>
                <div className="relative flex justify-center text-[11px] uppercase">
                  <span className="bg-white dark:bg-zinc-900 px-3 text-slate-400 font-semibold tracking-wider">
                    Or sign in with email
                  </span>
                </div>
              </div>
            </>
          ) : null}
        </div>

        <form onSubmit={handleSubmit} autoComplete="off">
          <CardContent className="space-y-4 pt-0">
            <Input
              id="login-email"
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="off"
              className="text-xs"
            />
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="login-password"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-[#285FEA] hover:underline font-medium transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="login-password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                className="text-xs"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 pt-2 pb-6">
            <Button
              id="login-submit-button"
              type="submit"
              variant="primary"
              className="w-full h-10 rounded-xl bg-[#285FEA] hover:bg-[#1E4BC8] text-white font-medium text-xs shadow-xs"
              isLoading={isLoading}
            >
              Sign In to Workspace
            </Button>
            <p className="text-xs text-center text-slate-500">
              Don&apos;t have an account?{' '}
              <Link href={`/register${querySuffix}`} className="text-[#285FEA] hover:underline font-semibold">
                Create account
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-xs text-slate-500">Loading sign in...</div>}>
      <LoginFormContent />
    </Suspense>
  );
}

// Global declaration for Google GIS client window object
declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: {
          initialize: (config: {
            client_id: string;
            callback: (res: { credential: string }) => void;
          }) => void;
          prompt: (listener?: (notification: unknown) => void) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              theme?: 'outline' | 'filled_blue' | 'filled_black';
              size?: 'large' | 'medium' | 'small';
              text?: 'signin_with' | 'signup_with' | 'continue_with';
              shape?: 'rectangular' | 'pill' | 'circle' | 'square';
              logo_alignment?: 'left' | 'center';
              width?: number | string;
              type?: 'standard' | 'icon';
            },
          ) => void;
        };
      };
    };
  }
}
