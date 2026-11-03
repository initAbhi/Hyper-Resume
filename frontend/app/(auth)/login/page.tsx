'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Alert } from '@/components/ui/alert';
import { Logo } from '@/components/ui/Logo';
import { useAuth } from '@/lib/auth-context';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { login, googleLogin } = useAuth();
  const router = useRouter();

  // Load Google Identity Services script if client ID is configured
  useEffect(() => {
    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
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
                await googleLogin({ credential: response.credential });
                router.push('/app');
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
        }
      }
    };
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [googleLogin, router]);

  const handleGoogleClick = () => {
    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (googleClientId && window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
    } else {
      // If Google Client ID is pending configuration, inform the user clearly
      setErrorMessage(
        'Google Sign-In is being connected with your domain credentials. Please sign in with your email & password below in the meantime.',
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      if (!email.trim() || !password) {
        throw new Error('Please enter both email and password.');
      }
      await login({ email: email.trim(), password });
      router.push('/app');
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

          {/* Official Google GIS Button Container */}
          <div id="google-btn-rendered" className="w-full flex justify-center empty:hidden mb-3" />

          {/* Sign in with Google Button (Fallback & Interactive Trigger) */}
          <button
            type="button"
            onClick={handleGoogleClick}
            disabled={isLoading || isGoogleLoading}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-zinc-750 transition-all font-medium text-xs shadow-2xs hover:shadow-xs active:scale-[0.99] disabled:opacity-50"
          >
            {isGoogleLoading ? (
              <span className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            )}
            <span>Continue with Google</span>
          </button>

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
        </div>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 pt-0">
            <Input
              id="login-email"
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
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
              <Link href="/register" className="text-[#285FEA] hover:underline font-semibold">
                Create account
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
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
