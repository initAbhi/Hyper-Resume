'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Logo } from '@/components/ui/Logo';
import { useAuth } from '@/lib/auth-context';
import { analytics } from '@/lib/analytics';
import { cn } from '@/lib/utils';

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

function LabelInputContainer({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn('flex w-full flex-col space-y-2', className)}>{children}</div>;
}

function BottomGradient() {
  return (
    <>
      <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-violet-500 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
      <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-indigo-400 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
    </>
  );
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
            theme: 'filled_black',
            size: 'large',
            type: 'standard',
            text: 'continue_with',
            shape: 'pill',
            logo_alignment: 'left',
            width: 360,
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

  const inputClass =
    'flex h-11 w-full rounded-lg border border-white/10 bg-zinc-950 px-3 text-sm text-white shadow-[0px_0px_1px_1px_rgba(255,255,255,0.06)] transition placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60';

  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] flex-1 flex-col items-center justify-center overflow-hidden bg-[#050505] px-4 py-16">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 70% 50% at 50% -10%, rgba(85,37,245,0.28), transparent 55%)',
        }}
        aria-hidden
      />

      <div className="relative z-10 w-full max-w-md">
        <Link
          href="/"
          className="mb-8 flex justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 rounded-lg"
          aria-label="HypeResume Home"
        >
          <Logo variant="full" size="lg" theme="dark" priority />
        </Link>

        <div className="rounded-2xl border border-white/10 bg-[#0c0c0e]/90 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_24px_80px_rgba(0,0,0,0.55)] backdrop-blur-xl sm:p-8">
          <div className="text-center">
            <h1 className="font-rubik text-2xl font-semibold tracking-tight text-white">
              Welcome back
            </h1>
            <p className="mt-1.5 text-sm text-zinc-400">
              Sign in to continue building evidence-backed applications
            </p>
          </div>

          {errorMessage ? (
            <div className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-xs text-red-200">
              {errorMessage}
            </div>
          ) : null}

          {isGoogleLoading ? (
            <div className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-violet-400/30 bg-violet-500/10 px-4 py-2.5 text-xs font-medium text-violet-200">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-violet-300 border-t-transparent" />
              Signing you in with Google...
            </div>
          ) : null}

          {googleClientId ? (
            <>
              <div className="mt-6 flex w-full justify-center">
                <div id="google-btn-rendered" className="min-h-[44px] w-full max-w-[360px]" />
              </div>
              {!isGoogleReady ? (
                <div className="mt-2 flex h-11 w-full animate-pulse items-center justify-center rounded-xl bg-white/[0.06] text-xs text-zinc-500">
                  Loading Google Sign-In...
                </div>
              ) : null}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-[11px] uppercase">
                  <span className="bg-[#0c0c0e] px-3 font-semibold tracking-wider text-zinc-500">
                    Or continue with email
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="mt-6" />
          )}

          <form onSubmit={handleSubmit} autoComplete="off" className="space-y-4">
            <LabelInputContainer>
              <label htmlFor="login-email" className="text-xs font-medium text-zinc-300">
                Email Address
              </label>
              <input
                id="login-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="off"
                className={inputClass}
              />
            </LabelInputContainer>

            <LabelInputContainer>
              <div className="flex items-center justify-between">
                <label htmlFor="login-password" className="text-xs font-medium text-zinc-300">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-medium text-violet-300 transition hover:text-violet-200"
                >
                  Forgot password?
                </Link>
              </div>
              <input
                id="login-password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                className={inputClass}
              />
            </LabelInputContainer>

            <button
              id="login-submit-button"
              type="submit"
              disabled={isLoading}
              className="group/btn relative mt-2 flex h-11 w-full items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-[#5525F5] text-sm font-semibold text-white shadow-[0px_1px_0px_0px_rgba(255,255,255,0.2)_inset] transition disabled:opacity-60"
            >
              {isLoading ? 'Signing in…' : 'Sign in to workspace'}
              <BottomGradient />
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-zinc-500">
            Don&apos;t have an account?{' '}
            <Link
              href={`/register${querySuffix}`}
              className="font-semibold text-violet-300 transition hover:text-violet-200"
            >
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#050505] text-xs text-zinc-500">
          Loading sign in...
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}

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
