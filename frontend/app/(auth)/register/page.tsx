'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, Target, Briefcase, CheckCircle2, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Alert } from '@/components/ui/alert';
import { Logo } from '@/components/ui/Logo';
import { useAuth } from '@/lib/auth-context';
import { apiClient } from '@/lib/api-client';
import { analytics } from '@/lib/analytics';

const POPULAR_ROLES = [
  'Software Engineer',
  'Product Manager',
  'Data Analyst',
  'Marketing Specialist',
  'Financial Analyst',
  'Project Manager',
];

const TARGET_GOALS = [
  { id: 'interviews', label: 'Land interviews at top companies' },
  { id: 'ats', label: 'Pass ATS filters with 90%+ score' },
  { id: 'transition', label: 'Transition into a new career path' },
  { id: 'compensation', label: 'Level up to Senior / Lead salary' },
];

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [targetGoal, setTargetGoal] = useState('ats');
  const [showPersonalization, setShowPersonalization] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isGoogleReady, setIsGoogleReady] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { signup, googleLogin } = useAuth();
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
                await googleLogin({
                  credential: response.credential,
                  targetRole: targetRole.trim() || undefined,
                  targetGoal,
                });
                analytics.track('signup_completed', { source: 'google_oauth' });
                router.push('/app');
              } catch (err: unknown) {
                setErrorMessage(err instanceof Error ? err.message : 'Google sign in failed');
              } finally {
                setIsGoogleLoading(false);
              }
            }
          },
        });

        const btnContainer = document.getElementById('google-btn-rendered-register');
        if (btnContainer) {
          window.google.accounts.id.renderButton(btnContainer, {
            theme: 'outline',
            size: 'large',
            type: 'standard',
            text: 'signup_with',
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
  }, [googleLogin, router, targetRole, targetGoal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      if (!fullName.trim() || !email.trim() || !password) {
        throw new Error('All required fields must be completed.');
      }
      if (password.length < 8) {
        throw new Error('Password must be at least 8 characters long.');
      }

      await signup({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
      });

      // Update candidate profile with chosen target role & goal
      if (targetRole.trim() || targetGoal) {
        try {
          const selectedGoalObj = TARGET_GOALS.find((g) => g.id === targetGoal);
          await apiClient.updateMyProfile({
            headline: targetRole.trim(),
            summary: selectedGoalObj ? `Primary Goal: ${selectedGoalObj.label}` : '',
          });
        } catch {
          // Non-blocking profile enrichment
        }
      }

      analytics.track('signup_completed', {
        source: 'register_form',
        targetRole: targetRole.trim(),
      });

      router.push('/app');
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'Registration failed. Please check your information and try again.',
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
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#285FEA] text-[11px] font-semibold mx-auto mb-2 border border-blue-100 dark:border-blue-900/60">
            <Sparkles className="w-3 h-3" />
            <span>Includes 5 Free AI Audit Credits</span>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Create Your Account
          </CardTitle>
          <CardDescription className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Build ATS-compliant, recruiter-grade resumes tailored to your target job
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
              Creating your workspace with Google...
            </div>
          )}

          {/* Official Google Button Container */}
          <div id="google-btn-rendered-register" className="w-full flex justify-center min-h-[44px]" />
          {!isGoogleReady && (
            <div className="w-full h-11 rounded-xl bg-slate-100 dark:bg-zinc-800 animate-pulse flex items-center justify-center text-xs text-slate-400">
              Loading Google Sign-Up...
            </div>
          )}

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-zinc-800" />
            </div>
            <div className="relative flex justify-center text-[11px] uppercase">
              <span className="bg-white dark:bg-zinc-900 px-3 text-slate-400 font-semibold tracking-wider">
                Or register with email
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} autoComplete="off">
          <CardContent className="space-y-3.5 px-6 pt-0">
            <Input
              id="register-fullname"
              label="Full Name"
              type="text"
              placeholder="e.g. Alex Morgan"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              autoComplete="name"
              className="text-xs"
            />
            <Input
              id="register-email"
              label="Email Address"
              type="email"
              placeholder="alex@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="off"
              className="text-xs"
            />
            <Input
              id="register-password"
              label="Password"
              type="password"
              placeholder="At least 8 characters"
              helperText="Must contain at least 8 characters."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              className="text-xs"
            />

            {/* Professional Personalization Toggle / Section */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowPersonalization(!showPersonalization)}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-zinc-850 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200/80 dark:border-zinc-750 text-left transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-[#285FEA]" />
                  <div>
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                      Personalize My Career Target
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      {targetRole ? `Target: ${targetRole}` : 'Optional: Set target role & goals'}
                    </span>
                  </div>
                </div>
                <ChevronRight
                  className={`w-4 h-4 text-slate-400 transition-transform ${
                    showPersonalization ? 'rotate-90' : ''
                  }`}
                />
              </button>

              {showPersonalization && (
                <div className="mt-3 p-3.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 space-y-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      What role are you targeting?
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Senior Software Engineer"
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-[#285FEA]"
                    />
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {POPULAR_ROLES.map((role) => (
                        <button
                          key={role}
                          type="button"
                          onClick={() => setTargetRole(role)}
                          className={`text-[10px] px-2 py-0.5 rounded-md border transition-colors ${
                            targetRole === role
                              ? 'bg-[#285FEA] text-white border-[#285FEA]'
                              : 'bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                          }`}
                        >
                          {role}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Primary Career Goal
                    </label>
                    <div className="grid grid-cols-1 gap-1.5">
                      {TARGET_GOALS.map((goal) => (
                        <label
                          key={goal.id}
                          className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors text-[11px] ${
                            targetGoal === goal.id
                              ? 'bg-white dark:bg-zinc-800 border-[#285FEA] text-[#285FEA] font-semibold'
                              : 'bg-white/60 dark:bg-zinc-900/60 border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          <input
                            type="radio"
                            name="targetGoal"
                            value={goal.id}
                            checked={targetGoal === goal.id}
                            onChange={() => setTargetGoal(goal.id)}
                            className="text-[#285FEA]"
                          />
                          <span>{goal.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4 px-6 pt-2 pb-6">
            <Button
              id="register-submit-button"
              type="submit"
              variant="primary"
              className="w-full h-10 rounded-xl bg-[#285FEA] hover:bg-[#1E4BC8] text-white font-medium text-xs shadow-xs"
              isLoading={isLoading}
            >
              Get Started with 5 Free Credits
            </Button>
            <p className="text-xs text-center text-slate-500">
              Already have an account?{' '}
              <Link href="/login" className="text-[#285FEA] hover:underline font-semibold">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
